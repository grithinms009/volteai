const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');
const config = require('../config');

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

const billSchema = z.object({
  providerName: z.string().nullable(),
  country: z.string().nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
  currency: z.string().nullable(),
  totalAmount: z.number().nullable(),
  unitsConsumed: z.number().nullable(),
  billingPeriodStart: z.string().nullable(),
  billingPeriodEnd: z.string().nullable(),
  fixedCharge: z.number().nullable(),
  energyCharge: z.number().nullable(),
  taxAmount: z.number().nullable(),
  hasPeakHours: z.boolean(),
  hasSlabRating: z.boolean(),
  hasDemandCharge: z.boolean(),
  rawSlabLines: z.string().nullable(),
});

async function callOllama(rawText) {
  try {
    const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt: getPrompt(rawText),
        format: 'json',
        stream: false,
      }),
    });
    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    console.error(`[PARSER] Ollama error:`, error.message);
    return null;
  }
}

async function callClaude(rawText) {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: getPrompt(rawText),
      },
    ],
  });
  
  // Extract JSON from response
  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

function getPrompt(rawText) {
  return `You are an electricity bill data extractor. Extract the following fields from the bill text below.
Return ONLY a valid JSON object with these exact keys. Use null for any field you cannot find.

Fields to extract:
{
  "providerName": string or null,
  "country": string or null (2-letter ISO code if possible),
  "state": string or null,
  "city": string or null,
  "currency": string or null (INR/USD/GBP etc),
  "totalAmount": number or null,
  "unitsConsumed": number or null,
  "billingPeriodStart": string or null (YYYY-MM-DD),
  "billingPeriodEnd": string or null (YYYY-MM-DD),
  "fixedCharge": number or null,
  "energyCharge": number or null,
  "taxAmount": number or null,
  "hasPeakHours": boolean,
  "hasSlabRating": boolean,
  "hasDemandCharge": boolean,
  "rawSlabLines": string or null (any slab/tiered rate lines found)
}

Bill text:
${rawText}`;
}

async function billParser(rawText) {
  console.log(`[PARSER] Starting extraction...`);
  
  // Try Ollama first
  let result = await callOllama(rawText);
  
  // Check if result is missing more than 3 key fields
  const checkFields = ['totalAmount', 'unitsConsumed', 'currency', 'providerName', 'country'];
  const missingCount = checkFields.filter(f => !result || result[f] === null).length;
  
  if (!result || missingCount > 2) {
    console.log(`[PARSER] Ollama result insufficient (missing ${missingCount} key fields), falling back to Claude`);
    result = await callClaude(rawText);
  } else {
    console.log(`[PARSER] Ollama extraction successful`);
  }

  // Validate with Zod
  try {
    const validated = billSchema.parse(result);
    return validated;
  } catch (error) {
    console.error(`[PARSER] Validation error:`, error);
    // Return result anyway but log the error
    return result;
  }
}

module.exports = { billParser };
