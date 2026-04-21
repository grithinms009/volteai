const { Worker } = require('bullmq');
const Redis = require('ioredis');
const prisma = require('../db');
const config = require('../config');
const { ocrPipeline } = require('../services/ocr');
const { billParser } = require('../services/billParser');
const { regionEngine } = require('../services/regionEngine');
const { analysisEngine } = require('../services/analysisEngine');
const { generateReport } = require('../services/reportGenerator');

const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

const worker = new Worker('bill-analysis', async (job) => {
  const { billId } = job.data;
  console.log(`[WORKER] Processing bill: ${billId}`);

  try {
    // 1. Fetch bill
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new Error('Bill not found');

    // 2. Update status = processing
    await prisma.bill.update({
      where: { id: billId },
      data: { status: 'processing' }
    });

    // 3. Run OCR
    const ocrResult = await ocrPipeline(bill.filePath, bill.fileType);
    await prisma.bill.update({
      where: { id: billId },
      data: { rawText: ocrResult.text }
    });

    // 4. Run Bill Parser
    const extractedFields = await billParser(ocrResult.text);
    await prisma.bill.update({
      where: { id: billId },
      data: { extractedFields }
    });

    // 5. Run Region Engine
    const regionResult = await regionEngine(extractedFields);

    // 6. Run Analysis Engine
    const analysisResult = await analysisEngine({
      extractedFields,
      tariffModel: regionResult.tariffModel,
      effectiveRate: regionResult.effectiveRate,
      regionDefaults: regionResult.regionDefaults,
      profileType: bill.profileType
    });

    // 7. Update DB completed
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'completed',
        analysisResult,
        confidenceLevel: analysisResult.confidenceLevel || ocrResult.confidence,
      }
    });

    // 8. Trigger report generation if paid
    if (bill.paid) {
      await generateReport(bill, analysisResult);
    }

    console.log(`[WORKER] Bill ${billId} completed successfully`);

  } catch (error) {
    console.error(`[WORKER] Bill ${billId} failed:`, error.message);
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'failed',
        errorMessage: error.message
      }
    });
    throw error; // Re-throw for BullMQ retries
  }
}, {
  connection: redisConnection,
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 1000
  }
});

worker.on('failed', (job, err) => {
  console.error(`[WORKER] Job ${job.id} failed with error: ${err.message}`);
});

worker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} completed`);
});

console.log('[WORKER] Analysis worker started and waiting for jobs...');
