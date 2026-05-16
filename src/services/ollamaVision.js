const fs = require('fs');
const config = require('../config');

const VISION_TIMEOUT_MS = 120000;

function buildVisionPrompt() {
  return `You are an expert electricity bill analyzer. Look at this electricity bill image carefully and extract ALL data with high accuracy.

CRITICAL EXTRACTION RULES:
1. UNITS CONSUMED: Look for a reading table. Columns labeled "Initial Reading(IR)" or "Prev. Reading" = previousReading. "Final Reading(FR)" or "Prst. Reading" = currentReading. The "Units*" or "Net Units" column = unitsConsumed. ALWAYS compute: currentReading - previousReading if both are visible.
2. TOTAL AMOUNT: Look for "Total Amt.", "Net Payable", "Amount Payable", "Grand Total". KSEB format: "Total Amt.(Bill#XXXX)(a+b+c+e)  1759.00" — the LAST NUMBER is totalAmount. Do NOT use "Last Paid Amount".
3. CHARGES: Extract Fixed Charge[FC], Energy Charge[EC], Auto Recovery FS[FSM] as fuelSurcharge, Electricity Duty[ED] as electricityDuty, Meter Rent[MR].
4. BILLING PERIOD: Use "Last Billed Rdg. Date" or "Prev. Rdg. Date" as billingPeriodStart. "Prst. Rdg. Date" as billingPeriodEnd. Compute billingDays from the difference.
5. CONFIDENCE: Set "high" if you found provider + units + total amount + location. "medium" if units + total. "low" if missing critical fields.

Return ONLY a valid JSON object, no explanation:

{
  "providerName": "Full provider name e.g. Kerala State Electricity Board Limited",
  "providerId": "short code e.g. kseb, msedcl, bescom (lowercase, no spaces)",
  "country": "Country name",
  "countryCode": "IN",
  "state": "State name",
  "stateCode": "KL",
  "city": "City name or null",
  "currency": "INR",
  "totalAmount": 1759.00,
  "unitsConsumed": 305,
  "billingPeriodStart": "2026-03-04",
  "billingPeriodEnd": "2026-05-04",
  "billingDays": 61,
  "fixedCharge": 280.00,
  "energyCharge": 1334.05,
  "fuelSurcharge": 3.05,
  "electricityDuty": 133.10,
  "taxAmount": 0,
  "subsidyAmount": 0,
  "previousReading": 18137,
  "currentReading": 18442,
  "meterNumber": "meter number or null",
  "consumerNumber": "consumer number or null",
  "sanctionedLoad": "1060 Watts or null",
  "connectionType": "Domestic",
  "hasPeakHours": false,
  "hasSlabRating": true,
  "hasDemandCharge": false,
  "hasArrears": false,
  "arrearsAmount": null,
  "dueDate": "2026-05-14",
  "rawSlabLines": "slab info if visible or null",
  "extractionConfidence": "high"
}`;
}

function detectMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  return map[ext] || 'image/jpeg';
}

async function extractWithOllamaVision(filePath) {
  console.log('[VISION] Starting Ollama vision extraction...');

  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');

  const ollamaUrl = `${config.ollamaBaseUrl}/api/generate`;
  const model = process.env.OLLAMA_VISION_MODEL || 'llava:7b';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildVisionPrompt(),
        images: [base64Image],
        format: 'json',
        stream: false,
        options: {
          temperature: 0.05,
          num_predict: 2048,
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Ollama vision HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Ollama vision response');

    const extracted = JSON.parse(jsonMatch[0]);
    console.log(`[VISION] OK — units=${extracted.unitsConsumed}, amount=${extracted.totalAmount}, confidence=${extracted.extractionConfidence}`);
    return extracted;

  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Ollama vision timed out after 120s');
    throw err;
  }
}

function isVisionUseful(extracted) {
  return extracted &&
    (extracted.unitsConsumed > 0 || (extracted.previousReading && extracted.currentReading)) &&
    extracted.totalAmount > 0;
}

module.exports = { extractWithOllamaVision, isVisionUseful };
