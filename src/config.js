require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  uploadDir: path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  reportsDir: path.join(process.cwd(), process.env.REPORTS_DIR || 'reports'),
};
