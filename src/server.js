const fastify = require('fastify')({ logger: true });
const multipart = require('@fastify/multipart');
const cors = require('@fastify/cors');
const fastifyStatic = require('@fastify/static');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const authPlugin = require('./auth');
const authRoutes = require('./routes/auth');
const billRoutes = require('./routes/bills');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const providerRoutes = require('./routes/providers');
const chatRoutes = require('./routes/chat');

// Create required directories
[config.uploadDir, config.reportsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[SERVER] Created directory: ${dir}`);
  }
});

// Override built-in JSON parser to accept empty bodies (POST routes without a body
// e.g. /bypass-payment would otherwise get 400 FST_ERR_CTP_EMPTY_JSON_BODY)
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  if (!body || body.trim() === '') {
    done(null, {});
    return;
  }
  try {
    done(null, JSON.parse(body));
  } catch (err) {
    err.statusCode = 400;
    done(err);
  }
});

// Plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  maxAge: 86400,
});

fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

fastify.register(fastifyStatic, {
  root: config.reportsDir,
  prefix: '/reports/',
});

// Auth decorators (authenticate, requireAdmin)
fastify.register(authPlugin);

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(billRoutes, { prefix: '/api/bills' });
fastify.register(reportRoutes, { prefix: '/api/reports' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(paymentRoutes, { prefix: '/api/payments' });
fastify.register(providerRoutes, { prefix: '/api/providers' });
fastify.register(chatRoutes, { prefix: '/api/bills' });

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`[SERVER] Running at http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
