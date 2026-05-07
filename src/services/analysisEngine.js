async function analysisEngine({ extractedFields, tariffModel, effectiveRate, regionDefaults, profileType, provider, calculatedBill, slabOptimization }) {
  console.log(`[ANALYSIS] Starting comprehensive analysis...`);

  const {
    totalAmount,
    unitsConsumed: rawUnits,
    fixedCharge: rawFixed,
    energyCharge: rawEnergy,
    fuelSurcharge: rawFuel,
    electricityDuty: rawDuty,
    taxAmount: rawTax,
    subsidyAmount: rawSubsidy,
    currency,
    providerName,
    billingDays,
    connectionType,
    hasArrears,
    arrearsAmount,
  } = extractedFields;

  const unitsConsumed = rawUnits || 0;
  const fixedCharge = rawFixed || calculatedBill?.fixedCharge || 0;
  const energyCharge = rawEnergy || calculatedBill?.energyCharge || 0;
  const fuelSurcharge = rawFuel || calculatedBill?.fuelSurcharge || 0;
  const electricityDuty = rawDuty || calculatedBill?.electricityDuty || 0;
  const taxAmount = rawTax || 0;
  const subsidyAmount = rawSubsidy || 0;
  const billAmount = totalAmount || calculatedBill?.total || 0;
  const resRate = regionDefaults.residentialRate || 8;
  const days = billingDays || 30;

  // 1. DAILY & PER-UNIT METRICS
  const dailyUnits = unitsConsumed > 0 ? unitsConsumed / days : 0;
  const dailyCost = billAmount > 0 ? billAmount / days : 0;
  const costPerUnit = unitsConsumed > 0 ? billAmount / unitsConsumed : effectiveRate;

  // 2. EFFECTIVE RATE COMPARISON
  const rateVsRegionAvg = resRate > 0 ? ((costPerUnit - resRate) / resRate) * 100 : 0;
  let rateStatus = 'average';
  if (rateVsRegionAvg > 15) rateStatus = 'above_average';
  else if (rateVsRegionAvg < -15) rateStatus = 'below_average';

  // 3. USAGE INTENSITY
  let profileMultiplier = 1.0;
  const normalizedProfile = (profileType || 'home').toLowerCase().replace('-', '_');
  if (normalizedProfile === 'home_office') profileMultiplier = 1.3;
  else if (normalizedProfile === 'small_shop') profileMultiplier = 2.0;
  else if (normalizedProfile === 'office') profileMultiplier = 3.0;

  const avgUnits = (regionDefaults.avgMonthlyUnitsHome || 200) * profileMultiplier;
  const usageRatio = avgUnits > 0 && unitsConsumed > 0 ? unitsConsumed / avgUnits : 1;
  let usageIntensity = 'medium';
  if (usageRatio < 0.7) usageIntensity = 'low';
  else if (usageRatio > 1.3) usageIntensity = 'high';

  // 4. BILL BREAKDOWN ANALYSIS
  const fixedChargePct = billAmount > 0 ? (fixedCharge / billAmount) * 100 : 0;
  const energyChargePct = billAmount > 0 ? (energyCharge / billAmount) * 100 : 0;
  const taxPct = billAmount > 0 ? ((taxAmount + electricityDuty + fuelSurcharge) / billAmount) * 100 : 0;
  const fixedChargeBurden = fixedChargePct > 25 ? 'high' : fixedChargePct > 15 ? 'moderate' : 'normal';

  // 5. EFFICIENCY SCORE (0-100)
  let score = 100;
  
  // Penalize high usage
  if (usageRatio > 1.5) score -= 25;
  else if (usageRatio > 1.3) score -= 15;
  else if (usageRatio > 1.1) score -= 5;
  
  // Reward low usage
  if (usageRatio < 0.7) score += 10;
  
  // Penalize high rates
  if (rateVsRegionAvg > 30) score -= 20;
  else if (rateVsRegionAvg > 15) score -= 10;
  
  // Penalize high fixed charges
  if (fixedChargePct > 35) score -= 15;
  else if (fixedChargePct > 25) score -= 10;
  
  // Penalize arrears
  if (hasArrears && arrearsAmount > 0) score -= 10;
  
  // Bonus for being in optimal slab
  if (slabOptimization === null && provider?.slabs) score += 5;
  
  const efficiencyScore = Math.max(0, Math.min(100, score));

  // 6. SAVINGS CALCULATIONS
  let potentialSavingsPct = 0;
  let savingsBreakdown = [];

  // Slab optimization savings
  if (slabOptimization) {
    potentialSavingsPct += slabOptimization.savingsPct;
    savingsBreakdown.push({
      category: 'Slab Optimization',
      savings: slabOptimization.savings,
      description: `Reduce ${slabOptimization.unitsToReduce} units to drop to ${slabOptimization.targetSlab}`
    });
  }

  // High usage savings
  if (usageIntensity === 'high') {
    const usageSavings = Math.round(billAmount * 0.15);
    potentialSavingsPct += 15;
    savingsBreakdown.push({
      category: 'Usage Reduction',
      savings: usageSavings,
      description: 'Reduce consumption by 15% through efficiency measures'
    });
  }

  // Peak hour savings (if applicable)
  if (provider?.peakHours || extractedFields.hasPeakHours) {
    const peakSavings = Math.round(billAmount * 0.10);
    potentialSavingsPct += 10;
    savingsBreakdown.push({
      category: 'Peak Hour Shifting',
      savings: peakSavings,
      description: 'Shift heavy loads to off-peak hours'
    });
  }

  // Solar potential (for high consumers)
  if (unitsConsumed > 300) {
    const solarSavings = Math.round(billAmount * 0.40);
    savingsBreakdown.push({
      category: 'Solar Rooftop',
      savings: solarSavings,
      description: 'Install rooftop solar to offset 40-60% of consumption'
    });
  }

  const monthlySavingsEstimate = Math.round(billAmount * (potentialSavingsPct / 100));
  const annualSavingsEstimate = monthlySavingsEstimate * 12;

  // 7. TOP ISSUES (prioritized)
  const topIssues = [];

  if (slabOptimization) {
    topIssues.push({
      title: `Near slab boundary - ${slabOptimization.unitsToReduce} units away`,
      description: `You're in the ${slabOptimization.currentSlab} slab. Reducing just ${slabOptimization.unitsToReduce} units would save ₹${slabOptimization.savings}/month by moving to ${slabOptimization.targetSlab}.`,
      severity: 'high',
      savingsAmount: slabOptimization.savings,
      actionable: true
    });
  }

  if (usageIntensity === 'high') {
    const excessUnits = Math.round(unitsConsumed - avgUnits);
    topIssues.push({
      title: 'Above average consumption',
      description: `Your usage of ${unitsConsumed} units is ${Math.round((usageRatio - 1) * 100)}% higher than similar ${normalizedProfile.replace('_', ' ')}s in ${provider?.state || 'your region'} (avg: ${Math.round(avgUnits)} units).`,
      severity: 'high',
      excessUnits,
      actionable: true
    });
  }

  if (rateStatus === 'above_average') {
    topIssues.push({
      title: 'High effective rate',
      description: `You're paying ₹${costPerUnit.toFixed(2)}/unit, which is ${Math.abs(rateVsRegionAvg).toFixed(0)}% ${rateVsRegionAvg > 0 ? 'higher' : 'lower'} than the regional average of ₹${resRate.toFixed(2)}/unit.`,
      severity: 'medium',
      actionable: false
    });
  }

  if (fixedChargeBurden === 'high') {
    topIssues.push({
      title: 'High fixed charges',
      description: `Fixed charges (₹${fixedCharge}) make up ${fixedChargePct.toFixed(0)}% of your bill. This portion doesn't reduce with energy savings.`,
      severity: 'medium',
      actionable: false
    });
  }

  if (provider?.peakHours) {
    topIssues.push({
      title: 'Time-of-Use tariff opportunity',
      description: `Your provider has peak hours (${provider.peakHours.start}-${provider.peakHours.end}). Shifting AC, washing machine, and geyser usage outside these hours can save up to 15%.`,
      severity: 'medium',
      actionable: true
    });
  }

  if (hasArrears && arrearsAmount > 0) {
    topIssues.push({
      title: 'Outstanding arrears',
      description: `You have ₹${arrearsAmount} in arrears. Clear these to avoid disconnection and late payment charges.`,
      severity: 'high',
      actionable: true
    });
  }

  if (dailyUnits > 15) {
    topIssues.push({
      title: 'High daily consumption',
      description: `You're using ${dailyUnits.toFixed(1)} units/day (₹${dailyCost.toFixed(0)}/day). Identify always-on appliances like old refrigerators or water heaters.`,
      severity: 'medium',
      actionable: true
    });
  }

  // 8. SMART RECOMMENDATIONS (provider-specific)
  const recommendations = [];

  // Provider-specific tips first
  if (provider?.tips) {
    provider.tips.slice(0, 2).forEach(tip => {
      recommendations.push({
        text: tip,
        category: 'provider_specific',
        priority: 'high'
      });
    });
  }

  // Slab-specific recommendation
  if (slabOptimization) {
    recommendations.push({
      text: `Target ${slabOptimization.targetSlab} by reducing ${slabOptimization.unitsToReduce} units. Quick wins: Switch off standby devices, use natural light, optimize AC temperature to 24°C.`,
      category: 'slab_optimization',
      priority: 'high',
      savings: slabOptimization.savings
    });
  }

  // Usage-based recommendations
  if (unitsConsumed > 200) {
    recommendations.push({
      text: 'Your AC likely consumes 40-50% of your bill. Set temperature to 24-25°C and clean filters monthly for 10-15% savings.',
      category: 'appliance',
      priority: 'high'
    });
  }

  if (unitsConsumed > 150) {
    recommendations.push({
      text: 'Replace old refrigerator with 5-star inverter model. A 10-year-old fridge uses 2-3x more power than modern ones.',
      category: 'appliance',
      priority: 'medium'
    });
  }

  // Solar recommendation for high consumers
  if (unitsConsumed > 250 && extractedFields.countryCode === 'IN') {
    const solarCapacity = Math.ceil(unitsConsumed / 120);
    recommendations.push({
      text: `Consider ${solarCapacity}kW rooftop solar. With net metering, you can offset 60-80% of your bill. ${provider?.subsidyInfo || 'Check state subsidies available.'}`,
      category: 'solar',
      priority: 'high'
    });
  }

  // General efficiency tips
  recommendations.push({
    text: 'Switch all lighting to LED bulbs. A 9W LED = 60W incandescent. Saves ₹500-1000/year for average home.',
    category: 'lighting',
    priority: 'medium'
  });

  recommendations.push({
    text: 'Unplug phone chargers, TV, and computer when not in use. Phantom loads can add 5-10% to your bill.',
    category: 'behavior',
    priority: 'low'
  });

  if (provider?.peakHours) {
    recommendations.push({
      text: `Run washing machine, dishwasher, and iron outside peak hours (${provider.peakHours.start}-${provider.peakHours.end}) to save on ToD tariff.`,
      category: 'peak_hours',
      priority: 'medium'
    });
  }

  // Water heater tip
  if (dailyUnits > 8) {
    recommendations.push({
      text: 'If using electric geyser, switch to solar water heater or heat pump. Geysers can consume 2-3 units per bath.',
      category: 'appliance',
      priority: 'medium'
    });
  }

  // 9. ESTIMATED DEVICE BREAKDOWN (based on typical Indian household)
  const deviceBreakdown = [];
  if (unitsConsumed > 0) {
    if (unitsConsumed > 150) {
      deviceBreakdown.push({ device: 'Air Conditioner', units: Math.round(unitsConsumed * 0.40), percentage: 40 });
    }
    deviceBreakdown.push({ device: 'Refrigerator', units: Math.round(unitsConsumed * 0.15), percentage: 15 });
    deviceBreakdown.push({ device: 'Lighting', units: Math.round(unitsConsumed * 0.12), percentage: 12 });
    deviceBreakdown.push({ device: 'TV & Entertainment', units: Math.round(unitsConsumed * 0.08), percentage: 8 });
    deviceBreakdown.push({ device: 'Washing Machine', units: Math.round(unitsConsumed * 0.05), percentage: 5 });
    if (dailyUnits > 6) {
      deviceBreakdown.push({ device: 'Water Heater', units: Math.round(unitsConsumed * 0.10), percentage: 10 });
    }
    deviceBreakdown.push({ device: 'Other Appliances', units: Math.round(unitsConsumed * 0.10), percentage: 10 });
  }

  // 10. MONTHLY TREND SIMULATION (for charts)
  const monthlyTrend = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalFactors = [0.7, 0.7, 0.85, 1.0, 1.2, 1.3, 1.3, 1.2, 1.1, 0.9, 0.8, 0.7]; // Summer peak
  
  months.forEach((month, i) => {
    const estimatedUnits = Math.round((unitsConsumed || avgUnits) * seasonalFactors[i]);
    monthlyTrend.push({
      month,
      units: estimatedUnits,
      estimated: true
    });
  });

  // 11. CONFIDENCE LEVEL
  let confidenceLevel = 'low';
  if (provider && unitsConsumed > 0 && billAmount > 0) {
    confidenceLevel = 'high';
  } else if (unitsConsumed > 0 && billAmount > 0) {
    confidenceLevel = 'medium';
  } else if (unitsConsumed > 0 || billAmount > 0) {
    confidenceLevel = 'low';
  }

  console.log(`[ANALYSIS] Completed: Score=${efficiencyScore}, Savings=₹${monthlySavingsEstimate}/mo, Issues=${topIssues.length}`);

  return {
    // Core metrics
    effectiveRate: Number(costPerUnit.toFixed(2)),
    effectiveRateCurrency: currency || 'INR',
    rateVsRegionAvg: Number(rateVsRegionAvg.toFixed(1)),
    rateStatus,
    
    // Usage analysis
    usageIntensity,
    usageRatio: Number(usageRatio.toFixed(2)),
    dailyUnits: Number(dailyUnits.toFixed(1)),
    dailyCost: Number(dailyCost.toFixed(0)),
    
    // Efficiency
    efficiencyScore,
    
    // Bill breakdown
    fixedChargePct: Number(fixedChargePct.toFixed(1)),
    energyChargePct: Number(energyChargePct.toFixed(1)),
    taxPct: Number(taxPct.toFixed(1)),
    fixedChargeBurden,
    
    // Savings
    monthlySavingsEstimate: Number(monthlySavingsEstimate),
    annualSavingsEstimate: Number(annualSavingsEstimate),
    potentialSavingsPct: Number(potentialSavingsPct),
    savingsBreakdown,
    
    // Issues & Recommendations
    topIssues,
    recommendations: recommendations.map(r => typeof r === 'string' ? r : r.text),
    recommendationsDetailed: recommendations,
    
    // Provider info
    tariffModel,
    providerName: providerName || provider?.name || null,
    providerId: provider?.id || null,
    providerState: provider?.state || null,
    providerWebsite: provider?.websiteUrl || null,
    slabOptimization,
    
    // Data for charts
    unitsConsumed: rawUnits || null,
    totalAmount: billAmount || null,
    deviceBreakdown,
    monthlyTrend,
    
    // Metadata
    dataSource: 'computed',
    confidenceLevel,
    analysisVersion: '2.0'
  };
}

module.exports = { analysisEngine };
