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
  const { billId, providerId: hintProviderId, countryCode: hintCountryCode } = job.data;
  console.log(`[WORKER] Processing bill: ${billId} (provider hint: ${hintProviderId || 'none'})`);

  try {
    // 1. Fetch bill
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new Error('Bill not found');

    // 2. Update status = processing, progress = 10
    await prisma.bill.update({
      where: { id: billId },
      data: { status: 'processing', progress: 10 }
    });

    // 3. Run OCR
    console.log(`[WORKER] Running OCR...`);
    const ocrResult = await ocrPipeline(bill.filePath, bill.fileType);
    await prisma.bill.update({
      where: { id: billId },
      data: { rawText: ocrResult.text, progress: 35 }
    });

    // 4. Run Bill Parser
    console.log(`[WORKER] Parsing bill fields...`);
    const extractedFields = await billParser(ocrResult.text);
    
    // Apply hints from frontend if AI didn't detect
    if (hintProviderId && !extractedFields.providerId) {
      extractedFields.providerId = hintProviderId;
    }
    if (hintCountryCode && !extractedFields.countryCode) {
      extractedFields.countryCode = hintCountryCode;
    }
    
    await prisma.bill.update({
      where: { id: billId },
      data: { extractedFields, progress: 60 }
    });

    // 5. Run Region Engine
    console.log(`[WORKER] Matching region and tariff model...`);
    const regionResult = await regionEngine(extractedFields);
    await prisma.bill.update({ where: { id: billId }, data: { progress: 75 } });

    // 6. Run Analysis Engine
    console.log(`[WORKER] Running analysis engine...`);
    const analysisResult = await analysisEngine({
      extractedFields,
      tariffModel: regionResult.tariffModel,
      effectiveRate: regionResult.effectiveRate,
      regionDefaults: regionResult.regionDefaults,
      profileType: bill.profileType,
      provider: regionResult.provider,
      calculatedBill: regionResult.calculatedBill,
      slabOptimization: regionResult.slabOptimization
    });

    // 7. Update DB completed
    console.log(`[WORKER] Saving results to database...`);
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'completed',
        progress: 100,
        analysisResult,
        confidenceLevel: analysisResult.confidenceLevel || ocrResult.confidence,
      }
    });

    // 8. Trigger report generation if paid
    if (bill.paid) {
      await generateReport(bill, analysisResult);
    }

    console.log(`[WORKER] ✓ Bill ${billId} analysis completed successfully`);

  } catch (error) {
    console.error(`[WORKER] ✗ Bill ${billId} failed:`, error.message);
    try {
      await prisma.bill.update({
        where: { id: billId },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      });
    } catch (dbErr) {
      console.error(`[WORKER] Failed to update bill status in DB:`, dbErr.message);
    }
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

process.on('SIGTERM', async () => {
  console.log('[WORKER] Shutting down gracefully...');
  await worker.close();
  await redisConnection.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await worker.close();
  await redisConnection.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});
