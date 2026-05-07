const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const prisma = require('../db');
const { billAnalysisQueue } = require('../queue');
const config = require('../config');

const ALLOWED_PROFILES = ['home', 'home-office', 'small-shop', 'office'];

function shapeAnalysisResult(bill) {
  if (!bill.analysisResult) return null;
  // The worker is expected to populate analysisResult with the full schema.
  // We just attach the `paid` flag (which lives on the Bill row) so the
  // frontend can render the locked / unlocked state.
  return {
    ...bill.analysisResult,
    paid: bill.paid,
    confidenceLevel: bill.analysisResult.confidenceLevel || bill.confidenceLevel || 'medium',
  };
}

async function billRoutes(fastify) {
  // POST /api/bills/upload
  fastify.post('/upload', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(data.filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return reply.code(400).send({ error: 'Invalid file type. Only PDF and images allowed.' });
    }

    let profileType = data.fields.profileType?.value || 'home';
    if (!ALLOWED_PROFILES.includes(profileType)) {
      return reply.code(400).send({ error: `profileType must be one of ${ALLOWED_PROFILES.join(', ')}` });
    }

    // Provider selection (optional - AI will detect if not provided)
    const providerId = data.fields.providerId?.value || null;
    const countryCode = data.fields.countryCode?.value || 'IN';

    // userId always comes from the JWT (authoritative)
    const userId = request.user.userId;

    const billId = uuidv4();
    const fileName = `${billId}${ext}`;
    const filePath = path.join(config.uploadDir, fileName);

    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      data.file.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      data.file.on('error', reject);
    });

    const fileType = ext === '.pdf' ? 'pdf' : 'image';

    const bill = await prisma.bill.create({
      data: {
        id: billId,
        userId,
        filePath,
        fileType,
        profileType,
        status: 'processing',
        progress: 0,
      },
    });

    await billAnalysisQueue.add('analyze-bill', { 
      billId: bill.id,
      providerId,
      countryCode
    });

    return reply.code(202).send({ billId: bill.id, status: 'processing' });
  });

  // GET /api/bills/:id/status
  fastify.get('/:id/status', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id } });

    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }
    if (bill.userId !== request.user.userId && !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    if (bill.status === 'failed') {
      return {
        billId: bill.id,
        status: 'failed',
        error: bill.errorMessage || 'Analysis failed',
      };
    }

    if (bill.status === 'processing' || bill.status === 'pending') {
      return {
        billId: bill.id,
        status: 'processing',
        progress: bill.progress ?? 0,
      };
    }

    // completed
    return {
      billId: bill.id,
      status: 'completed',
      analysisResult: shapeAnalysisResult(bill),
    };
  });

  // GET /api/bills/user/:userId
  fastify.get('/user/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.params;
    if (userId !== request.user.userId && !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      bills: bills.map((b) => {
        const a = b.analysisResult || {};
        return {
          id: b.id,
          createdAt: b.createdAt.toISOString(),
          status: b.status,
          paid: b.paid,
          providerName: a.providerName ?? null,
          unitsConsumed: a.unitsConsumed ?? null,
          monthlySavingsEstimate:
            b.status === 'completed' ? a.monthlySavingsEstimate ?? null : null,
        };
      }),
    };
  });

  // GET /api/bills/:id
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }
    if (bill.userId !== request.user.userId && !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    if (bill.status !== 'completed') {
      return reply.code(409).send({ error: `Bill is ${bill.status}` });
    }
    return shapeAnalysisResult(bill);
  });

  // POST /api/bills/:id/bypass-payment (DEV ONLY)
  // Sets paid=true without actual payment - for testing purposes
  fastify.post('/:id/bypass-payment', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    if (config.nodeEnv !== 'development') {
      return reply.code(403).send({ error: 'Payment bypass only available in development mode' });
    }

    const { id } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id } });

    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }
    if (bill.userId !== request.user.userId && !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const updated = await prisma.bill.update({
      where: { id },
      data: { paid: true },
    });

    return { success: true, billId: id, paid: updated.paid };
  });
}

module.exports = billRoutes;
