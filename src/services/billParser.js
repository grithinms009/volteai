const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const providers = require('../data/providers');

const OLLAMA_TIMEOUT_MS = 45000;
const CLAUDE_TIMEOUT_MS = 60000;

const PLACEHOLDER_KEYS = ['your_anthropic_key_here', 'sk-placeholder', 'your-key-here', ''];
const isRealKey = (k) => k && k.startsWith('sk-') && !PLACEHOLDER_KEYS.includes(k);

let _anthropic = null;
function getAnthropicClient() {
  if (!_anthropic && isRealKey(config.anthropicApiKey)) {
    _anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return _anthropic;
}

const DEFAULTS = {
  providerName: null,
  providerId: null,
  country: null,
  countryCode: null,
  state: null,
  stateCode: null,
  city: null,
  currency: 'INR',
  totalAmount: null,
  unitsConsumed: null,
  billingPeriodStart: null,
  billingPeriodEnd: null,
  billingDays: null,
  fixedCharge: null,
  energyCharge: null,
  fuelSurcharge: null,
  electricityDuty: null,
  taxAmount: null,
  subsidyAmount: null,
  previousReading: null,
  currentReading: null,
  meterNumber: null,
  consumerNumber: null,
  sanctionedLoad: null,
  connectionType: null,
  hasPeakHours: false,
  hasSlabRating: false,
  hasDemandCharge: false,
  hasArrears: false,
  arrearsAmount: null,
  dueDate: null,
  rawSlabLines: null,
  extractionConfidence: 'low',
};

const PROVIDER_HINTS = providers.map(p => `${p.name} (${p.aliases.join(', ')})`).join('\n');

function buildExtractionPrompt(rawText) {
  return `You are an expert electricity bill analyzer specializing in Indian and international electricity bills. Your task is to extract ALL relevant information from this bill with high accuracy.

## KNOWN ELECTRICITY PROVIDERS (for reference):
${PROVIDER_HINTS}

## EXTRACTION RULES:
1. **Provider Detection**: Look for logos, headers, watermarks mentioning electricity board names like KSEB, MSEDCL, BESCOM, TANGEDCO, BSES, Tata Power, Torrent Power, etc.
2. **Location Detection**: 
   - Look for addresses, circle names, division names, sub-division codes
   - Indian states: Kerala (KL), Maharashtra (MH), Karnataka (KA), Tamil Nadu (TN), Delhi (DL), Gujarat (GJ), etc.
   - Look for pin codes (6 digits) to identify location
3. **Consumption Data — CRITICAL**:
   - Units consumed = Current Reading - Previous Reading. ALWAYS compute this if both readings are present.
   - KSEB / Kerala bills: look for a reading table with columns "Initial Reading(IR)" (= previousReading), "Final Reading(FR)" (= currentReading), and "Units*" (= unitsConsumed). The "Units*" column value IS the units consumed.
   - Also look for labels: "kWh", "Units", "Consumption", "Net Units", "Energy Consumed"
   - Bi-Monthly bills: billing period is ~60 days; units figure may be for 2 months
4. **Total Amount — CRITICAL**:
   - The final payable amount may be labeled: "Total Amt.", "Net Payable", "Amount Payable", "Total Amount Due", "Grand Total"
   - KSEB format: "Total Amt.(Bill#XXXXXXXX)(a+b+c+e)  1759.00" — the number at the end is totalAmount; ignore the formula in parentheses
   - The total BEFORE surcharge/arrears adjustments is the base bill; use the final payable amount (after "Less paid/adj.", surcharge etc.) as totalAmount
   - Do NOT confuse "Last Paid Amount" with totalAmount
5. **Charges Breakdown**:
   - Fixed Charge / Fixed Charge[FC] / Service Charge / Meter Rent / Demand Charge
   - Energy Charge / Energy Charge[EC] (variable, based on units)
   - Fuel Surcharge / FAC / FPPCA / Auto Recovery FS[FSM]
   - Electricity Duty / Electricity Duty[ED] (usually % of energy charge)
   - Taxes (GST, cess, surcharges)
   - Meter Rent[MR] — add to fixedCharge if no separate field
   - Subsidies (government subsidies shown as negative)
6. **Tariff Detection**:
   - Slab rates: Look for "0-50 units @ ₹X", "51-100 units @ ₹Y" patterns
   - ToD/Peak hours: Look for "Peak", "Off-Peak", "Normal" time mentions
   - Demand charges: Look for "kVA", "Demand", "Contract Demand"
7. **Dates**: 
   - Billing period: use "Prev. Rdg. Date" or "Last Billed Rdg. Date" as billingPeriodStart; "Prst. Rdg. Date" or current reading date as billingPeriodEnd
   - Also look for explicit "Billing Period", "From Date – To Date" labels
   - Due Date / Last Date for Payment / DC Date
   - billingDays = difference in days between billingPeriodStart and billingPeriodEnd

## OUTPUT FORMAT:
Return ONLY a valid JSON object. Use null for fields you cannot find. Be precise with numbers.

{
  "providerName": "Full name of electricity provider",
  "providerId": "Short code like kseb, msedcl, bescom (lowercase)",
  "country": "Country name",
  "countryCode": "2-letter ISO code (IN, US, GB)",
  "state": "State/Province name",
  "stateCode": "State code (KL, MH, KA, TN, DL)",
  "city": "City or town name",
  "currency": "INR, USD, GBP, etc",
  "totalAmount": 1234.56,
  "unitsConsumed": 245,
  "billingPeriodStart": "2024-01-01",
  "billingPeriodEnd": "2024-01-31",
  "billingDays": 31,
  "fixedCharge": 100.00,
  "energyCharge": 800.00,
  "fuelSurcharge": 24.50,
  "electricityDuty": 80.00,
  "taxAmount": 50.00,
  "subsidyAmount": 0,
  "previousReading": 12345,
  "currentReading": 12590,
  "meterNumber": "ABC123456",
  "consumerNumber": "1234567890",
  "sanctionedLoad": "3 kW",
  "connectionType": "Domestic/Residential/Commercial/Industrial",
  "hasPeakHours": false,
  "hasSlabRating": true,
  "hasDemandCharge": false,
  "hasArrears": false,
  "arrearsAmount": null,
  "dueDate": "2024-02-15",
  "rawSlabLines": "0-50: ₹3.15, 51-100: ₹3.70, 101-150: ₹4.80",
  "extractionConfidence": "high"
}

## CONFIDENCE LEVELS:
- "high": Found provider, units, total amount, and location
- "medium": Found at least units and total amount
- "low": Missing critical fields

## BILL TEXT TO ANALYZE:
${rawText.substring(0, 6000)}

Return ONLY the JSON object, no explanations.`;
}

async function extractWithClaude(rawText) {
  console.log(`[PARSER] Extracting with Claude API...`);
  
  const anthropic = getAnthropicClient();
  if (!anthropic) throw new Error('Anthropic client not configured');
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildExtractionPrompt(rawText)
      }
    ],
  });

  const responseText = response.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function extractWithOllama(rawText) {
  console.log(`[PARSER] Extracting with Ollama...`);
  
  const ollamaUrl = `${config.ollamaBaseUrl}/api/generate`;
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildExtractionPrompt(rawText),
        format: 'json',
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2048,
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Ollama response');
    }

    return JSON.parse(jsonMatch[0]);
  } finally {
    clearTimeout(timer);
  }
}

function matchProvider(extracted) {
  if (extracted.providerId) {
    const byId = providers.find(p => p.id === extracted.providerId.toLowerCase());
    if (byId) return byId;
  }

  if (extracted.providerName) {
    const name = extracted.providerName.toLowerCase();
    const byName = providers.find(p => 
      p.name.toLowerCase().includes(name) ||
      name.includes(p.name.toLowerCase()) ||
      p.aliases.some(a => name.includes(a.toLowerCase()) || a.toLowerCase().includes(name))
    );
    if (byName) return byName;
  }

  if (extracted.stateCode || extracted.state) {
    const stateCode = extracted.stateCode || '';
    const stateName = (extracted.state || '').toLowerCase();
    const byState = providers.find(p => 
      p.stateCode === stateCode.toUpperCase() ||
      p.stateName.toLowerCase() === stateName
    );
    if (byState) return byState;
  }

  return null;
}

function validateAndEnrich(extracted) {
  const result = { ...DEFAULTS, ...extracted };

  const matchedProvider = matchProvider(extracted);
  if (matchedProvider) {
    result.providerId = matchedProvider.id;
    result.providerName = result.providerName || matchedProvider.name;
    result.countryCode = matchedProvider.countryCode;
    result.country = result.country || (matchedProvider.countryCode === 'IN' ? 'India' : null);
    result.stateCode = matchedProvider.stateCode;
    result.state = result.state || matchedProvider.stateName;
    result.currency = matchedProvider.currency;
    
    if (matchedProvider.tariffType === 'tiered') {
      result.hasSlabRating = true;
    }
    if (matchedProvider.peakHours) {
      result.hasPeakHours = true;
    }
  }

  if (result.previousReading && result.currentReading && !result.unitsConsumed) {
    result.unitsConsumed = result.currentReading - result.previousReading;
  }

  if (result.billingPeriodStart && result.billingPeriodEnd && !result.billingDays) {
    const start = new Date(result.billingPeriodStart);
    const end = new Date(result.billingPeriodEnd);
    result.billingDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  let confidence = 'low';
  const hasProvider = result.providerId || result.providerName;
  const hasUnits = result.unitsConsumed && result.unitsConsumed > 0;
  const hasAmount = result.totalAmount && result.totalAmount > 0;
  const hasLocation = result.stateCode || result.state;

  if (hasProvider && hasUnits && hasAmount && hasLocation) {
    confidence = 'high';
  } else if (hasUnits && hasAmount) {
    confidence = 'medium';
  }
  result.extractionConfidence = confidence;

  return result;
}

async function billParser(rawText) {
  console.log(`[PARSER] Starting bill extraction...`);
  console.log(`[PARSER] Raw text length: ${rawText.length} characters`);

  let extracted = null;
  let method = 'none';

  if (isRealKey(config.anthropicApiKey)) {
    try {
      extracted = await extractWithClaude(rawText);
      method = 'claude';
      console.log(`[PARSER] Claude extraction successful`);
    } catch (err) {
      console.warn(`[PARSER] Claude failed: ${err.message}, trying Ollama...`);
    }
  }

  if (!extracted) {
    try {
      extracted = await extractWithOllama(rawText);
      method = 'ollama';
      console.log(`[PARSER] Ollama extraction successful`);
    } catch (err) {
      console.error(`[PARSER] Ollama failed: ${err.message}`);
    }
  }

  if (!extracted) {
    console.error(`[PARSER] All extraction methods failed, using defaults`);
    return { ...DEFAULTS, extractionMethod: 'failed' };
  }

  const result = validateAndEnrich(extracted);
  result.extractionMethod = method;

  const filledFields = Object.entries(result)
    .filter(([k, v]) => v !== null && v !== undefined && v !== false && v !== '')
    .length;
  
  console.log(`[PARSER] Extracted ${filledFields} fields with ${result.extractionConfidence} confidence`);
  console.log(`[PARSER] Provider: ${result.providerName || 'Unknown'}, Units: ${result.unitsConsumed || 'N/A'}, Amount: ${result.totalAmount || 'N/A'}`);

  return result;
}

module.exports = { billParser };
