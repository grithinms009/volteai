const prisma = require('../db');
const config = require('../config');

function buildChatSystemContext(a) {
  if (!a) return 'No bill analysis data available.';

  const lines = [
    `Provider: ${a.providerName || 'Unknown'}`,
    `Units Consumed: ${a.unitsConsumed || 'N/A'} kWh`,
    `Total Bill: ₹${a.totalAmount || 'N/A'}`,
    `Effective Rate: ₹${a.effectiveRate || 'N/A'}/unit (Region avg: ₹${a.effectiveRateAnalysis?.regionAvgRate || 'N/A'}/unit)`,
    `Efficiency Score: ${a.efficiencyScore || 'N/A'}/100`,
    `Daily Usage: ${a.dailyUnits || a.usagePatterns?.dailyAvg || 'N/A'} units/day`,
    `Daily Cost: ₹${a.dailyCost || a.usagePatterns?.dailyCost || 'N/A'}`,
    `Monthly Savings Potential: ₹${a.monthlySavingsEstimate || 0}`,
    `Annual Savings Potential: ₹${a.annualSavingsEstimate || 0}`,
    `Tariff Model: ${a.tariffModel || 'tiered'}`,
    `Current Slab: ${a.tariffIntelligence?.currentSlab || 'N/A'} @ ₹${a.tariffIntelligence?.currentSlabRate || 'N/A'}/unit`,
    `Slab Boundary Risk: ${a.tariffIntelligence?.slabBoundaryRisk || 0}% — ${a.tariffIntelligence?.slabAlert || 'No immediate risk'}`,
    `Usage Trend: ${a.usagePatterns?.monthlyTrend || 'stable'}`,
    `Top Consumer: ${a.applianceBreakdown?.topConsumer || 'N/A'}`,
    `Phantom Load: ${a.applianceBreakdown?.phantomLoadKWh || 0} kWh/month (₹${a.applianceBreakdown?.phantomLoadCost || 0})`,
    `Next Month Estimate: ${a.predictions?.nextMonthEstimate?.units || 'N/A'} units, ₹${a.predictions?.nextMonthEstimate?.bill || 'N/A'}`,
    `Annual Projection: ₹${a.predictions?.annualProjection?.bill || 'N/A'}`,
    `Bill Health Score: ${a.billAccuracy?.billHealthScore || 'N/A'}/100`,
    `Overcharge: ₹${a.billAccuracy?.overchargeAmount || 0}`,
    `Alerts: ${a.alerts?.map(al => al.message).join(' | ') || 'None'}`,
    `Top Recommendations: ${a.topRecommendations?.slice(0, 5).map(r => r.title).join(' | ') || 'N/A'}`,
  ];

  return `You are VoltSave AI, a friendly and expert electricity bill assistant. The user is asking about their own electricity bill.

BILL ANALYSIS:
${lines.join('\n')}

${a.aiNarrative ? `AI SUMMARY:\n${a.aiNarrative}` : ''}

INSTRUCTIONS:
- Answer ONLY about this user's bill and electricity usage
- Be concise, warm, and specific — always reference actual numbers from the bill data above
- If the user asks about something not in the data (e.g. their name, account details), politely say you only have analysis data
- Keep answers under 120 words unless the user asks for detail
- Never make up numbers not present in the data`;
}

async function chatRoutes(fastify) {
  // POST /api/bills/:id/chat  — SSE streaming Q&A
  fastify.post('/:id/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { question, history } = request.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      return reply.code(400).send({ error: 'question is required' });
    }

    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) return reply.code(404).send({ error: 'Bill not found' });
    if (bill.userId !== request.user.userId && !request.user.isAdmin) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    if (bill.status !== 'completed') {
      return reply.code(409).send({ error: 'Bill analysis not yet complete' });
    }

    const systemContext = buildChatSystemContext(bill.analysisResult);

    const model = process.env.OLLAMA_CHAT_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:7b';

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const sendEvent = (payload) => {
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      // Build messages array for /api/chat
      const messages = [
        { role: 'system', content: systemContext }
      ];

      // Inject prior conversation history
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(h => {
          if (h.role === 'user' || h.role === 'assistant') {
            messages.push({ role: h.role, content: h.content });
          }
        });
      }

      messages.push({ role: 'user', content: question.trim() });

      const ollamaRes = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: { temperature: 0.7, num_predict: 512, num_ctx: 4096 }
        })
      });

      if (!ollamaRes.ok) {
        sendEvent({ error: `AI service unavailable (HTTP ${ollamaRes.status})` });
        reply.raw.end();
        return reply;
      }

      let buffer = '';
      for await (const chunk of ollamaRes.body) {
        buffer += Buffer.from(chunk).toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const token = parsed.message?.content || parsed.response || '';
            if (token) sendEvent({ token });
            if (parsed.done) sendEvent({ done: true, model });
          } catch {}
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          const token = parsed.message?.content || parsed.response || '';
          if (token) sendEvent({ token });
          if (parsed.done) sendEvent({ done: true, model });
        } catch {}
      }

    } catch (err) {
      console.error('[CHAT] Ollama streaming error:', err.message);
      sendEvent({ error: 'Chat failed. Is Ollama running?' });
    }

    reply.raw.end();
    return reply;
  });

  // GET /api/bills/:id/chat/models  — list available Ollama models
  fastify.get('/models', async (request, reply) => {
    try {
      const res = await fetch(`${config.ollamaBaseUrl}/api/tags`);
      if (!res.ok) return reply.code(503).send({ error: 'Ollama not reachable' });
      const data = await res.json();
      return {
        models: (data.models || []).map(m => ({
          name: m.name,
          size: m.size,
          isVision: m.name.startsWith('llava') || m.name.startsWith('moondream'),
          isCurrent: m.name === (process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b')
        }))
      };
    } catch (err) {
      return reply.code(503).send({ error: 'Ollama not reachable', detail: err.message });
    }
  });
}

module.exports = chatRoutes;
