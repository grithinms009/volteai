function usagePatternsEngine({ extractedFields, historicalBills, billAmount, days }) {
  console.log('[ENGINE-4] Analyzing usage patterns...');

  const units = extractedFields.unitsConsumed || 0;
  const billingDays = days || extractedFields.billingDays || 30;
  const dailyAvg = units > 0 ? units / billingDays : 0;

  // Weekday/weekend split estimate
  const weekdayAvg = dailyAvg * 0.92;
  const weekendAvg = dailyAvg * 1.22;
  const weekendIncrease = weekdayAvg > 0
    ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100)
    : 0;

  let monthlyTrend = 'stable';
  let consistencyScore = 75;
  const anomalies = [];
  let historicalSummary = null;

  if (historicalBills && historicalBills.length >= 3) {
    const histUnits = historicalBills
      .filter(b => b.analysisResult?.unitsConsumed)
      .map(b => b.analysisResult.unitsConsumed);

    if (histUnits.length >= 3) {
      const avg = histUnits.reduce((s, u) => s + u, 0) / histUnits.length;
      const half = Math.ceil(histUnits.length / 2);
      const firstHalfAvg = histUnits.slice(0, half).reduce((s, u) => s + u, 0) / half;
      const lastHalfAvg = histUnits.slice(-half).reduce((s, u) => s + u, 0) / half;
      const trendPct = firstHalfAvg > 0 ? ((lastHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

      if (trendPct > 8) monthlyTrend = 'increasing';
      else if (trendPct < -8) monthlyTrend = 'decreasing';

      const variance = histUnits.reduce((s, u) => s + Math.pow(u - avg, 2), 0) / histUnits.length;
      const cv = avg > 0 ? (Math.sqrt(variance) / avg) * 100 : 50;
      consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv)));

      const currentVsHist = avg > 0 ? ((units - avg) / avg) * 100 : 0;
      if (Math.abs(currentVsHist) > 30) {
        anomalies.push({
          type: 'consumption_spike',
          severity: Math.abs(currentVsHist) > 50 ? 'high' : 'medium',
          message: `Consumption is ${Math.abs(currentVsHist).toFixed(0)}% ${currentVsHist > 0 ? 'higher' : 'lower'} than your ${histUnits.length}-month average`,
          possibleReasons: currentVsHist > 0
            ? ['Guest stay', 'Increased AC usage', 'New appliance added', 'Possible meter issue']
            : ['Vacation period', 'Reduced AC usage', 'Season change', 'Appliance removed']
        });
      }

      historicalSummary = {
        months: histUnits.length,
        avgUnits: Math.round(avg),
        minUnits: Math.min(...histUnits),
        maxUnits: Math.max(...histUnits),
        trendPct: trendPct.toFixed(1)
      };
    }
  }

  // Seasonal trend chart (estimated from current month's baseline)
  const seasonalFactors = [0.72, 0.70, 0.85, 1.00, 1.20, 1.30, 1.25, 1.20, 1.10, 0.90, 0.80, 0.73];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const baseFactor = seasonalFactors[currentMonth] || 1;

  const monthlyTrendChart = months.map((month, i) => ({
    month,
    units: baseFactor > 0 ? Math.round(units * (seasonalFactors[i] / baseFactor)) : units,
    estimated: true
  }));

  return {
    dailyAvg: Math.round(dailyAvg * 10) / 10,
    dailyCost: billingDays > 0 ? Math.round((billAmount || 0) / billingDays) : 0,
    weekdayAvg: Math.round(weekdayAvg * 10) / 10,
    weekendAvg: Math.round(weekendAvg * 10) / 10,
    weekendIncrease,
    peakHours: '14:00-21:00',
    offPeakHours: '22:00-07:00',
    monthlyTrend,
    trendIcon: monthlyTrend === 'increasing' ? '📈' : monthlyTrend === 'decreasing' ? '📉' : '➡️',
    consistencyScore,
    anomalies,
    historicalSummary,
    monthlyTrendChart,
    insights: buildInsights(dailyAvg, weekendIncrease, anomalies, monthlyTrend)
  };
}

function buildInsights(daily, weekendIncrease, anomalies, trend) {
  const insights = [];
  if (daily > 15) insights.push(`High daily usage of ${daily.toFixed(1)} units — check for always-on appliances`);
  if (weekendIncrease > 25) insights.push(`Weekend usage is ${weekendIncrease}% higher — likely increased home occupancy`);
  if (trend === 'increasing') insights.push('Consumption trend is rising over the past months — investigate cause');
  if (trend === 'decreasing') insights.push('Great progress — your consumption is trending downward');
  if (anomalies.length > 0) insights.push(`⚠️ ${anomalies[0].message}`);
  return insights;
}

module.exports = { usagePatternsEngine };
