const config = require('../config');

const NARRATOR_TIMEOUT_MS = 60000;

function buildNarratorPrompt(a) {
  const alerts = a.alerts?.map(al => al.message).join('; ') || 'None';
  const topRecs = a.topRecommendations?.slice(0, 3).map(r => r.title).join('; ') ||
    a.recommendationsDetailed?.slice(0, 3).map(r => r.text || r.title).join('; ') || 'None';

  const context = [
    `Provider: ${a.providerName || 'Unknown'}`,
    `Units Consumed: ${a.unitsConsumed || 'N/A'} kWh`,
    `Total Bill Amount: ₹${a.totalAmount || 'N/A'}`,
    `Effective Rate: ₹${a.effectiveRate || 'N/A'}/unit`,
    `Regional Average Rate: ₹${a.effectiveRateAnalysis?.regionAvgRate || 'N/A'}/unit`,
    `Efficiency Score: ${a.efficiencyScore || 'N/A'}/100`,
    `Monthly Savings Potential: ₹${a.monthlySavingsEstimate || 0}`,
    `Tariff Model: ${a.tariffModel || 'tiered'}`,
    `Current Slab: ${a.tariffIntelligence?.currentSlab || 'N/A'}`,
    `Slab Boundary Risk: ${a.tariffIntelligence?.slabBoundaryRisk || 0}%`,
    `Daily Average: ${a.dailyUnits || a.usagePatterns?.dailyAvg || 'N/A'} units/day`,
    `Usage Trend: ${a.usagePatterns?.monthlyTrend || 'stable'}`,
    `Top Appliance: ${a.applianceBreakdown?.topConsumer || 'N/A'}`,
    `Next Month Estimate: ₹${a.predictions?.nextMonthEstimate?.bill || 'N/A'}`,
    `Bill Health Score: ${a.billAccuracy?.billHealthScore || 'N/A'}/100`,
    `Alerts: ${alerts}`,
    `Top Actions: ${topRecs}`,
  ].join('\n');

  return `You are VoltSave AI, a friendly electricity bill expert. Write a concise 3-paragraph plain-English summary for a customer about their electricity bill analysis.

BILL ANALYSIS DATA:
${context}

PARAGRAPH GUIDE:
1. Overview: Summarize the bill (provider, units, amount, how their rate compares to the regional average, efficiency score). 1-2 sentences.
2. Key Finding: The single most important thing the customer must know — slab boundary risk, anomaly, high phantom load, or biggest savings opportunity. Be specific with numbers. 2-3 sentences.
3. Next Steps: 2-3 concrete actionable things they can do this week. Start with the easiest/cheapest. End on an encouraging note.

Rules: Under 180 words total. Plain text only — no markdown, no bullet points, no headings. Be warm and specific.`;
}

async function generateNarrative(analysisResult) {
  if (!analysisResult.unitsConsumed && !analysisResult.effectiveRate) {
    console.log('[NARRATOR] Skipping — insufficient data for narrative');
    return null;
  }

  console.log('[NARRATOR] Generating AI narrative with Ollama...');
  const ollamaUrl = `${config.ollamaBaseUrl}/api/generate`;
  const model = process.env.OLLAMA_NARRATOR_MODEL || process.env.OLLAMA_MODEL || 'llama3.1:8b';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NARRATOR_TIMEOUT_MS);

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildNarratorPrompt(analysisResult),
        stream: false,
        options: { temperature: 0.65, num_predict: 512 }
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Ollama narrator HTTP ${response.status}`);
    }

    const data = await response.json();
    const narrative = typeof data.response === 'string' ? data.response.trim() : null;

    if (!narrative) throw new Error('Empty narrative response');

    console.log('[NARRATOR] Narrative generated successfully');
    return narrative;

  } catch (err) {
    clearTimeout(timer);
    console.warn('[NARRATOR] Failed (non-blocking):', err.message);
    return null;
  }
}

module.exports = { generateNarrative };
