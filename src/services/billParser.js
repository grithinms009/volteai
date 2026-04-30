const config = require('../config');

const OLLAMA_TIMEOUT_MS = 30000;

const DEFAULTS = {
  providerName: null,
  country: null,
  state: null,
  city: null,
  currency: 'INR',
  totalAmount: null,
  unitsConsumed: null,
  billingPeriodStart: null,
  billingPeriodEnd: null,
  fixedCharge: null,
  energyCharge: null,
  taxAmount: null,
  hasPeakHours: false,
  hasSlabRating: false,
  hasDemandCharge: false,
  rawSlabLines: null,
};

function buildPrompt(rawText) {
  return `You are an electricity bill data extractor. Extract information from the bill text and return ONLY a valid JSON object with these exact keys. Use null for any fields you cannot find:

{
  "providerName": string or null,
  "country": string or null (2-letter ISO code like "IN", "US", "GB"),
  "state": string or null (state or region name),
  "city": string or null,
  "currency": string or null ("INR", "USD", "GBP", etc),
  "totalAmount": number or null (total bill amount),
  "unitsConsumed": number or null (kWh consumed),
  "billingPeriodStart": string or null (YYYY-MM-DD format),
  "billingPeriodEnd": string or null (YYYY-MM-DD format),
  "fixedCharge": number or null (fixed component),
  "energyCharge": number or null (variable component),
  "taxAmount": number or null (taxes and surcharges),
  "hasPeakHours": boolean (does bill mention peak/off-peak?),
  "hasSlabRating": boolean (does bill have tiered rates?),
  "hasDemandCharge": boolean (does bill have demand charges?),
  "rawSlabLines": string or null (any slab/tiered rate lines found)
}

Bill text to extract from:
${rawText.substring(0, 2000)}`;
}

async function billParser(rawText) {
  console.log(`[PARSER] Starting extraction with Ollama...`);

  try {
    const ollamaUrl = `${config.ollamaBaseUrl}/api/generate`;
    const model = process.env.OLLAMA_MODEL || 'phi3:mini';

    const fetchWithTimeout = () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
      return fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: buildPrompt(rawText),
          format: 'json',
          stream: false,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
    };

    console.log(`[PARSER] Sending to Ollama (${ollamaUrl}, model=${model})...`);
    const response = await fetchWithTimeout();

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
    console.log(`[PARSER] Ollama response received`);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[PARSER] No JSON found in Ollama response, using defaults`);
      return { ...DEFAULTS };
    }

    const extracted = JSON.parse(jsonMatch[0]);
    const filledFields = Object.values(extracted).filter(v => v !== null && v !== undefined).length;
    console.log(`[PARSER] Ollama extracted ${filledFields} fields successfully`);

    return { ...DEFAULTS, ...extracted };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[PARSER] Ollama timed out after ${OLLAMA_TIMEOUT_MS / 1000}s, using defaults`);
    } else {
      console.error(`[PARSER] Ollama error: ${err.message}, using defaults`);
    }
    return { ...DEFAULTS };
  }
}

module.exports = { billParser };
