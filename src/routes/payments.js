const { z } = require('zod');
const prisma = require('../db');

// NOTE: These are stubs. Wire Razorpay/Stripe SDK + signature verification
// here when keys are provisioned. For now we accept the request and mark
// the bill as paid on /verify so the frontend full-report flow works in dev.

const createOrderSchema = z.object({
  billId: z.string().min(1),
  plan: z.enum(['full_report', 'pro_monthly']).default('full_report'),
});

const verifySchema = z.object({
  billId: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const subscribeSchema = z.object({
  plan: z.literal('pro_monthly'),
});

async function paymentRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);

  // POST /api/payments/create-order
  fastify.post('/create-order', async (request, reply) => {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid order request' });
    }
    const { billId, plan } = parsed.data;

    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) return reply.code(404).send({ error: 'Bill not found' });
    if (bill.userId !== request.user.userId) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const amount = plan === 'pro_monthly' ? 49900 : 19900; // paise
    return {
      orderId: `order_stub_${Date.now()}`,
      amount,
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_stub',
    };
  });

  // POST /api/payments/verify
  fastify.post('/verify', async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid verification payload' });
    }
    const { billId } = parsed.data;

    // TODO: validate signature with RAZORPAY_KEY_SECRET
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) return reply.code(404).send({ error: 'Bill not found' });
    if (bill.userId !== request.user.userId) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    await prisma.bill.update({ where: { id: billId }, data: { paid: true } });
    return { success: true, paid: true };
  });

  // POST /api/payments/subscribe
  fastify.post('/subscribe', async (request, reply) => {
    const parsed = subscribeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid subscription request' });
    }
    return {
      orderId: `sub_stub_${Date.now()}`,
      amount: 49900,
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_stub',
    };
  });
}

module.exports = paymentRoutes;
