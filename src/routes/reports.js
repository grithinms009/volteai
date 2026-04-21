const fs = require('fs');
const path = require('path');
const prisma = require('../db');

async function reportRoutes(fastify) {
  // GET /api/reports/:billId/download
  fastify.get('/:billId/download', async (request, reply) => {
    const { billId } = request.params;
    const bill = await prisma.bill.findUnique({ where: { id: billId } });

    if (!bill) {
      return reply.code(404).send({ error: 'Bill not found' });
    }

    if (!bill.paid) {
      return reply.code(403).send({ error: 'Payment required to download report' });
    }

    if (!bill.reportPath || !fs.existsSync(bill.reportPath)) {
      return reply.code(404).send({ error: 'Report file not generated yet' });
    }

    const stream = fs.createReadStream(bill.reportPath);
    return reply
      .type('application/pdf')
      .header('Content-Disposition', `attachment; filename="Anigravity_Report_${billId}.pdf"`)
      .send(stream);
  });
}

module.exports = reportRoutes;
