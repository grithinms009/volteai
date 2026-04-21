const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const config = require('./config');

const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

const billAnalysisQueue = new Queue('bill-analysis', {
  connection: redisConnection,
});

module.exports = {
  billAnalysisQueue,
  redisConnection,
};
