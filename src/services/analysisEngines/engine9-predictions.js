function predictionsEngine({ extractedFields, historicalBills, regionDefaults }) {
  console.log('[ENGINE-9] Building predictions...');

  const units = extractedFields.unitsConsumed || 0;
  const bill = extractedFields.totalAmount || 0;
  const effectiveRate = units > 0 ? bill / units : (regionDefaults?.residentialRate || 6);

  const seasonalFactors = [0.72, 0.70, 0.85, 1.00, 1.20, 1.30, 1.25, 1.20, 1.10, 0.90, 0.80, 0.73];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const nextMonthIdx = (currentMonth + 1) % 12;

  const thisMonthFactor = seasonalFactors[currentMonth] || 1;
  const nextMonthFactor = seasonalFactors[nextMonthIdx];
  const nextMonthUnits = thisMonthFactor > 0
    ? Math.round(units * (nextMonthFactor / thisMonthFactor))
    : units;
  const nextMonthBill = Math.round(nextMonthUnits * effectiveRate);

  // Annual projection
  const annualScaleFactor = seasonalFactors.reduce((s, f) => s + f, 0) / (thisMonthFactor || 1);
  const annualUnits = Math.round(units * annualScaleFactor);
  const annualBill = Math.round(annualUnits * effectiveRate);

  // 4-year rate increase projection (typical India: 6-10% annual hike)
  const currentYear = new Date().getFullYear();
  const rateIncreaseProjection = [1.0, 1.08, 1.17, 1.27].map((mult, i) => ({
    year: currentYear + i,
    rate: Math.round(effectiveRate * mult * 100) / 100,
    annualBill: Math.round(annualBill * mult)
  }));

  // Solar break-even
  const solarCapacity = Math.max(1, Math.ceil(units / 120));
  const solarInstallCost = solarCapacity * 60000;
  const solarAnnualSavings = Math.round(annualBill * 0.55);
  const solarBreakevenYears = solarAnnualSavings > 0
    ? Math.round((solarInstallCost / solarAnnualSavings) * 10) / 10
    : null;

  // Trend from historical
  let consumptionTrend = 'stable';
  if (historicalBills && historicalBills.length >= 3) {
    const histUnits = historicalBills
      .filter(b => b.analysisResult?.unitsConsumed)
      .map(b => b.analysisResult.unitsConsumed);
    if (histUnits.length >= 3) {
      const half = Math.ceil(histUnits.length / 2);
      const firstAvg = histUnits.slice(0, half).reduce((s, u) => s + u, 0) / half;
      const lastAvg = histUnits.slice(-half).reduce((s, u) => s + u, 0) / half;
      const trendPct = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
      if (trendPct > 8) consumptionTrend = 'increasing';
      else if (trendPct < -8) consumptionTrend = 'decreasing';
    }
  }

  // Seasonal forecast (12-month chart)
  const seasonalForecast = months.map((month, i) => ({
    month,
    units: thisMonthFactor > 0 ? Math.round(units * (seasonalFactors[i] / thisMonthFactor)) : units,
    bill: thisMonthFactor > 0 ? Math.round(bill * (seasonalFactors[i] / thisMonthFactor)) : bill,
    isCurrentMonth: i === currentMonth
  }));

  return {
    nextMonthEstimate: {
      month: months[nextMonthIdx],
      units: nextMonthUnits,
      bill: nextMonthBill,
      confidence: 'medium',
      note: 'Based on seasonal patterns from current month'
    },
    annualProjection: {
      units: annualUnits,
      bill: annualBill,
      note: 'Full-year estimate using seasonal adjustment factors'
    },
    rateIncreaseProjection,
    consumptionTrend,
    trendNote: consumptionTrend === 'increasing'
      ? 'Take action now to prevent further bill increases'
      : consumptionTrend === 'decreasing'
        ? 'Great progress! Keep up the efficiency habits'
        : 'Your consumption is stable',
    solarBreakeven: solarBreakevenYears ? {
      years: solarBreakevenYears,
      capacity: `${solarCapacity}kW`,
      investmentRequired: solarInstallCost,
      annualSavings: solarAnnualSavings
    } : null,
    seasonalForecast,
    insights: [
      `Next month (${months[nextMonthIdx]}): ~${nextMonthUnits} units, ~₹${nextMonthBill}`,
      `Annual projection: ~₹${annualBill.toLocaleString('en-IN')}`,
      `By ${currentYear + 3}, expect ~₹${rateIncreaseProjection[3].annualBill.toLocaleString('en-IN')}/year if rates rise 8% annually`
    ]
  };
}

module.exports = { predictionsEngine };
