const config = require('../config');

const OLLAMA_TIMEOUT_MS = 90000;

function buildFallbackText(analysisData) {
  const recs = analysisData.recommendationsData?.recommendations ||
    analysisData.recommendationsDetailed ||
    analysisData.recommendations || [];
  const alerts = analysisData.alerts || [];
  const savings = analysisData.monthlySavingsEstimate || 0;

  let text = `Your electricity bill analysis is ready. `;
  if (analysisData.efficiencyScore) text += `Efficiency score: ${analysisData.efficiencyScore}/100. `;
  if (savings > 0) text += `You can save approximately ₹${savings}/month by following our recommendations. `;

  if (alerts.length > 0) {
    text += `\n\nKey alert: ${alerts[0].message}. `;
  }

  if (recs.length > 0) {
    text += `\n\nTop actions: `;
    text += recs.slice(0, 3).map(r => r.title || r.text || r).join('. ') + '.';
  }

  return text;
}

async function rewriteInsights(analysisData) {
  console.log(`[OLLAMA] Rewriting insights for report...`);

  const recs = analysisData.recommendationsData?.recommendations ||
    analysisData.recommendationsDetailed ||
    analysisData.recommendations || [];

  const alerts = analysisData.alerts || [];
  const topRecs = recs.slice(0, 5).map(r => `- ${r.title || r.text || r} (${r.category || 'general'}, saves ₹${r.estimatedSaving || r.savingsPerMonth || 0}/month)`).join('\n');
  const alertText = alerts.length > 0 ? alerts.map(a => `- [${a.severity}] ${a.message}`).join('\n') : 'None';

  const systemPrompt = `You are VoltSave AI, a professional electricity bill advisor. Write a clear, friendly, actionable 2-3 paragraph analysis summary for a PDF report. Use plain English — no markdown, no bullet points in output. Be warm, specific, and encouraging. Under 150 words.`;

  const userPrompt = `Bill data:
Provider: ${analysisData.providerName || 'Unknown'}
Units: ${analysisData.unitsConsumed || 'N/A'} kWh | Amount: ₹${analysisData.totalAmount || 'N/A'}
Efficiency Score: ${analysisData.efficiencyScore || 'N/A'}/100
Monthly savings potential: ₹${analysisData.monthlySavingsEstimate || 0}
Alerts: ${alertText}
Top recommendations:
${topRecs || 'Keep up the good work!'}

Write the summary now:`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    const model = process.env.OLLAMA_NARRATOR_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:7b';

    const response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: { temperature: 0.65, num_predict: 400, num_ctx: 4096 }
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

    const data = await response.json();
    const text = data.message?.content || data.response || '';
    if (!text.trim()) throw new Error('Empty response from Ollama');

    console.log('[OLLAMA] Insights rewritten successfully');
    return text.trim();

  } catch (error) {
    console.warn(`[OLLAMA] rewriteInsights failed (using fallback): ${error.message}`);
    return buildFallbackText(analysisData);
  }
}

module.exports = { rewriteInsights };
