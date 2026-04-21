const config = require('../config');

async function rewriteInsights(analysisData) {
  console.log(`[OLLAMA] Rewriting insights...`);
  
  const prompt = `Rewrite these electricity bill insights in a friendly, clear, actionable way for a regular household customer. Keep it under 3 sentences per insight.
Input: ${JSON.stringify({ 
    topIssues: analysisData.topIssues, 
    recommendations: analysisData.recommendations 
  })}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt: prompt,
        stream: false,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Ollama response not OK');
    
    const data = await response.json();
    return data.response;

  } catch (error) {
    console.warn(`[OLLAMA] Service unavailable or timeout, falling back to raw insights: ${error.message}`);
    // Graceful fallback
    let fallbackText = "### Top Issues\n";
    analysisData.topIssues.forEach(issue => {
      fallbackText += `- **${issue.title}**: ${issue.description}\n`;
    });
    fallbackText += "\n### Recommendations\n";
    analysisData.recommendations.forEach(rec => {
      fallbackText += `- ${rec}\n`;
    });
    return fallbackText;
  }
}

module.exports = { rewriteInsights };
