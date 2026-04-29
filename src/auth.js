const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');
const config = require('./config');

async function authPlugin(fastify) {
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const header = request.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Missing or invalid Authorization header' });
      }
      const token = header.slice(7);
      const payload = jwt.verify(token, config.jwtSecret);
      request.user = payload; // { userId, email, isAdmin }
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });

  fastify.decorate('requireAdmin', async function (request, reply) {
    if (!request.user || !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Admin access required' });
    }
  });
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

module.exports = fp(authPlugin);
module.exports.signToken = signToken;
