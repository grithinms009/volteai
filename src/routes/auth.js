const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../db');
const { signToken } = require('../auth');

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function authRoutes(fastify) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(400).send({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = signToken(user);
    return reply.code(201).send({
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
    });
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Email and password required' });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    return {
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
    };
  });

  // GET /api/auth/me
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
    if (!user) {
      return reply.code(401).send({ error: 'User not found' });
    }
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscription: user.subscription,
    };
  });
}

module.exports = authRoutes;
