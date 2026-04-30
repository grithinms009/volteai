async function analysisEngine({ extractedFields, tariffModel, effectiveRate, regionDefaults, profileType }) {
  console.log(`[ANALYSIS] Starting math computations...`);

  const {
    totalAmount,
    unitsConsumed: rawUnits,
    fixedCharge: rawFixed,
    taxAmount: rawTax,
    currency,
    providerName,
  } = extractedFields;
  const unitsConsumed = rawUnits || 0;
  const fixedCharge = rawFixed || 0;
  const taxAmount = rawTax || 0;
  const resRate = regionDefaults.residentialRate;

  // 1. EFFECTIVE RATE COMPARISON
  const rateVsRegionAvg = ((effectiveRate - resRate) / resRate) * 100;
  let rateStatus = 'average';
  if (rateVsRegionAvg > 10) rateStatus = 'above_average';
  else if (rateVsRegionAvg < -10) rateStatus = 'below_average';

  // 2. USAGE INTENSITY
  let profileMultiplier = 1.0;
  if (profileType === 'home-office' || profileType === 'home_office') profileMultiplier = 1.3;
  else if (profileType === 'small-shop' || profileType === 'small_shop') profileMultiplier = 2.0;
  else if (profileType === 'office') profileMultiplier = 3.0;

  const avgUnits = regionDefaults.avgMonthlyUnitsHome * profileMultiplier;
  const usageRatio = avgUnits > 0 && unitsConsumed > 0 ? unitsConsumed / avgUnits : 1;
  let usageIntensity = 'medium';
  if (usageRatio < 0.8) usageIntensity = 'low';
  else if (usageRatio > 1.2) usageIntensity = 'high';

  // 3. EFFICIENCY SCORE (0-100)
  let score = 100;
  if (rateVsRegionAvg > 20) score -= 20;
  else if (rateVsRegionAvg > 10) score -= 10;
  
  if (usageIntensity === 'high') score -= 20;

  const fixedChargePct = totalAmount > 0 ? (fixedCharge / totalAmount) * 100 : 0;
  if (fixedChargePct > 30) score -= 10;

  const taxPct = totalAmount > 0 ? (taxAmount / totalAmount) * 100 : 0;
  if (taxPct > 20) score -= 5;
  
  const efficiencyScore = Math.max(0, score);

  // 4. FIXED CHARGE BURDEN
  const fixedChargeBurden = fixedChargePct > 30 ? 'high' : 'normal';

  // 5. SAVINGS ESTIMATE
  let potentialSavingsPct = 0;
  if (usageIntensity === 'high') potentialSavingsPct += 15;
  if (rateStatus === 'above_average') potentialSavingsPct += 10;
  if (fixedChargeBurden === 'high') potentialSavingsPct += 5;

  const monthlySavingsEstimate = totalAmount * (potentialSavingsPct / 100);
  const annualSavingsEstimate = monthlySavingsEstimate * 12;

  // 6. TOP ISSUES
  const topIssues = [];
  if (usageIntensity === 'high') {
    topIssues.push({
      title: "Above average consumption",
      description: `Your usage is ${(usageRatio * 100 - 100).toFixed(0)}% higher than similar ${profileType.replace('_', ' ')}s in your region.`,
      severity: "high"
    });
  }
  if (rateStatus === 'above_average') {
    topIssues.push({
      title: "High effective unit rate",
      description: `You are paying ${rateVsRegionAvg.toFixed(1)}% more per unit than the regional average.`,
      severity: "medium"
    });
  }
  if (fixedChargeBurden === 'high') {
    topIssues.push({
      title: "High fixed charges",
      description: "A large portion of your bill is fixed costs, which aren't affected by saving energy.",
      severity: "low"
    });
  }
  if (extractedFields.hasPeakHours) {
    topIssues.push({
      title: "Peak hour usage opportunity",
      description: "You are on a Time-of-Use plan. Shifting heavy appliance use to off-peak hours could save up to 15%.",
      severity: "medium"
    });
  }

  // 7. RECOMMENDATIONS
  const recommendations = [
    "Switch to LED lighting to reduce consumption by up to 15%.",
    "Install a smart meter to track real-time energy usage.",
    "Perform an energy audit to identify hidden phantom loads."
  ];

  if (extractedFields.country === 'IN') {
    recommendations.push("Consider 5-star rated Inverter ACs for cooling.");
    recommendations.push("Check if solar rooftop subsidies are available in your state.");
  } else if (extractedFields.country === 'GB' || extractedFields.country === 'US') {
    recommendations.push("Improve home insulation to reduce heating/cooling costs.");
    recommendations.push("Use smart thermostats like Nest or Ecobee.");
  }

  return {
    effectiveRate: Number(effectiveRate.toFixed(2)),
    effectiveRateCurrency: currency,
    rateVsRegionAvg: Number(rateVsRegionAvg.toFixed(1)),
    rateStatus,
    usageIntensity,
    usageRatio: Number(usageRatio.toFixed(2)),
    efficiencyScore,
    fixedChargePct: Number(fixedChargePct.toFixed(1)),
    fixedChargeBurden,
    monthlySavingsEstimate: Number(monthlySavingsEstimate.toFixed(2)),
    annualSavingsEstimate: Number(annualSavingsEstimate.toFixed(2)),
    potentialSavingsPct,
    topIssues,
    recommendations,
    tariffModel,
    providerName: providerName || null,
    unitsConsumed: rawUnits || null,
    dataSource: 'computed',
    confidenceLevel: score > 70 ? 'high' : score > 40 ? 'medium' : 'low'
  };
}

module.exports = { analysisEngine };
