const { Worker } = require('bullmq');
const Redis = require('ioredis');
const prisma = require('../db');
const config = require('../config');
const { ocrPipeline } = require('../services/ocr');
const { billParser } = require('../services/billParser');
const { regionEngine } = require('../services/regionEngine');
const { runFullAnalysis } = require('../services/analysisOrchestrator');
const { generateReport } = require('../services/reportGenerator');
const { extractWithOllamaVision, isVisionUseful } = require('../services/ollamaVision');
const { generateNarrative } = require('../services/billNarrator');

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

    // 3. Vision-first extraction for image files
    let extractedFields = null;
    const isImage = bill.fileType === 'image' || /\.(jpe?g|png|webp)$/i.test(bill.filePath);

    if (isImage) {
      console.log(`[WORKER] Image detected — trying Ollama vision extraction first...`);
      try {
        const visionResult = await extractWithOllamaVision(bill.filePath);
        if (isVisionUseful(visionResult)) {
          console.log(`[WORKER] Vision extraction succeeded — skipping OCR text pipeline`);
          extractedFields = visionResult;
          extractedFields.extractionMethod = 'ollama-vision';
          await prisma.bill.update({
            where: { id: billId },
            data: { rawText: '[extracted via vision model]', progress: 60 }
          });
        } else {
          console.log(`[WORKER] Vision result insufficient — falling back to OCR pipeline`);
        }
      } catch (vErr) {
        console.warn(`[WORKER] Vision extraction failed: ${vErr.message} — falling back to OCR`);
      }
    }

    // 4. OCR + billParser fallback (always used for PDFs, fallback for images)
    if (!extractedFields) {
      console.log(`[WORKER] Running OCR pipeline...`);
      const ocrResult = await ocrPipeline(bill.filePath, bill.fileType);
      await prisma.bill.update({
        where: { id: billId },
        data: { rawText: ocrResult.text, progress: 35 }
      });

      console.log(`[WORKER] Parsing bill fields from OCR text...`);
      extractedFields = await billParser(ocrResult.text);
    }
    
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

    // 6. Run Full Analysis (10-engine orchestrator)
    console.log(`[WORKER] Running full analysis orchestrator...`);
    await prisma.bill.update({ where: { id: billId }, data: { progress: 75 } });
    const analysisResult = await runFullAnalysis({
      extractedFields,
      tariffModel: regionResult.tariffModel,
      effectiveRate: regionResult.effectiveRate,
      regionDefaults: regionResult.regionDefaults,
      profileType: bill.profileType,
      provider: regionResult.provider,
      calculatedBill: regionResult.calculatedBill,
      slabOptimization: regionResult.slabOptimization,
      userId: bill.userId
    });

    // 7. Generate AI narrative (non-blocking — failure doesn't fail the job)
    console.log(`[WORKER] Generating AI narrative...`);
    await prisma.bill.update({ where: { id: billId }, data: { progress: 92 } });
    const aiNarrative = await generateNarrative(analysisResult);
    if (aiNarrative) analysisResult.aiNarrative = aiNarrative;

    // 8. Update DB completed
    console.log(`[WORKER] Saving results to database...`);
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'completed',
        progress: 100,
        analysisResult,
        confidenceLevel: analysisResult.confidenceLevel || null,
      }
    });

    // 9. Trigger report generation if paid
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
