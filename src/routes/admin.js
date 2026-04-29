const prisma = require('../db');
const { billAnalysisQueue } = require('../queue');

async function adminRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', fastify.requireAdmin);

  // GET /api/admin/stats
  fastify.get('/stats', async () => {
    const [totalUsers, totalReports, paidReports] = await Promise.all([
      prisma.user.count(),
      prisma.bill.count(),
      prisma.bill.count({ where: { paid: true } }),
    ]);
    // ₹199 per unlock; this is a coarse revenue estimate until payments table exists
    const revenue = paidReports * 199;
    return { totalUsers, totalReports, paidReports, revenue };
  });

  // GET /api/admin/recent-uploads
  fastify.get('/recent-uploads', async () => {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    return {
      uploads: bills.map((b) => ({
        id: b.id,
        userId: b.userId,
        createdAt: b.createdAt.toISOString(),
        providerName: b.analysisResult?.providerName ?? null,
        status: b.status,
        confidenceLevel: b.confidenceLevel ?? b.analysisResult?.confidenceLevel ?? null,
      })),
    };
  });

  // GET /api/admin/failed-jobs
  fastify.get('/failed-jobs', async () => {
    const failed = await prisma.bill.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      failedJobs: failed.map((b) => ({
        billId: b.id,
        error: b.errorMessage || 'Unknown error',
        createdAt: b.createdAt.toISOString(),
      })),
    };
  });

  // POST /api/admin/jobs/:billId/retry
  fastify.post('/jobs/:billId/retry', async (request, reply) => {
    const { billId } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }
    await prisma.bill.update({
      where: { id: billId },
      data: { status: 'processing', progress: 0, errorMessage: null },
    });
    await billAnalysisQueue.add('analyze-bill', { billId });
    return { success: true };
  });
}

module.exports = adminRoutes;
