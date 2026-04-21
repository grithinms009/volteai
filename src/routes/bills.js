const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const prisma = require('../db');
const { billAnalysisQueue } = require('../queue');
const config = require('../config');

const uploadSchema = z.object({
  profileType: z.enum(['home', 'home_office', 'small_shop', 'office']).default('home'),
  userId: z.string().uuid(),
});

async function billRoutes(fastify) {
  // POST /api/bills/upload
  fastify.post('/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(data.filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return reply.code(400).send({ error: 'Invalid file type. Only PDF and images allowed.' });
    }

    // Since fields might come after the file in multipart, we handle them carefully
    // In many clients they come before, but @fastify/multipart handles this via data.fields
    const profileType = data.fields.profileType?.value || 'home';
    const userId = data.fields.userId?.value;

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    const billId = uuidv4();
    const fileName = `${billId}${ext}`;
    const filePath = path.join(config.uploadDir, fileName);

    // Save file
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      data.file.pipe(writeStream);
      data.file.on('end', resolve);
      data.file.on('error', reject);
    });

    const fileType = ext === '.pdf' ? 'pdf' : 'image';

    // Create record
    const bill = await prisma.bill.create({
      data: {
        id: billId,
        userId,
        filePath,
        fileType,
        profileType,
        status: 'pending',
      },
    });

    // Add to queue
    await billAnalysisQueue.add('analyze-bill', { billId: bill.id });

    return { billId: bill.id, status: 'pending', message: 'Analysis started' };
  });

  // GET /api/bills/:id/status
  fastify.get('/:id/status', async (request, reply) => {
    const { id } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id } });

    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }

    let analysisResult = bill.analysisResult;
    if (!bill.paid && analysisResult) {
      // Partial return if not paid
      analysisResult = {
        savingsEstimate: analysisResult.monthlySavingsEstimate,
        annualSavingsEstimate: analysisResult.annualSavingsEstimate,
        efficiencyScore: analysisResult.efficiencyScore,
        topIssues: analysisResult.topIssues?.slice(0, 2),
        effectiveRate: analysisResult.effectiveRate,
        usageIntensity: analysisResult.usageIntensity,
      };
    }

    return {
      billId: bill.id,
      status: bill.status,
      confidenceLevel: bill.confidenceLevel,
      analysisResult,
      errorMessage: bill.errorMessage,
    };
  });

  // GET /api/bills/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const bill = await prisma.bill.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }

    return bill;
  });
}

module.exports = billRoutes;
