function recommendationsEngine({ extractedFields, provider, tariffIntelligence, savingsOpportunities, usagePatterns, applianceBreakdown }) {
  console.log('[ENGINE-7] Building recommendations...');

  const units = extractedFields.unitsConsumed || 0;
  const bill = extractedFields.totalAmount || 0;
  const recommendations = [];
  let priority = 1;

  const add = (title, description, impact, category, effort = 'medium') => {
    recommendations.push({ priority: priority++, title, description, impact, category, effort });
  };

  // P1: Slab boundary — most urgent
  if (tariffIntelligence?.slabOptimization?.unitsToReduce <= 20 && tariffIntelligence.slabOptimization.savings > 0) {
    add(
      `🚨 Reduce ${tariffIntelligence.slabOptimization.unitsToReduce} units — save ₹${tariffIntelligence.slabOptimization.savings}/month`,
      tariffIntelligence.slabAlert || `You are very close to the next slab boundary. Reduce just ${tariffIntelligence.slabOptimization.unitsToReduce} units to avoid paying more per unit across your entire bill.`,
      `₹${tariffIntelligence.slabOptimization.savings}/month`,
      'slab_optimization', 'low'
    );
  }

  // P2: AC optimization
  if (units > 150) {
    add(
      'Optimize AC — your largest expense',
      'Set AC temperature to 24-26°C (not 18-20°C). Each degree higher saves 3-5%. Clean filters monthly and use ceiling fans alongside to feel cooler at higher set points. AC likely accounts for 35-40% of your bill.',
      `₹${Math.round(bill * 0.08)}/month`,
      'appliance', 'zero'
    );
  }

  // P3: Provider-specific tips
  if (provider?.tips?.length > 0) {
    provider.tips.slice(0, 2).forEach(tip => {
      const shortTitle = tip.length > 60 ? tip.substring(0, 57) + '...' : tip;
      add(`Provider tip: ${shortTitle}`, tip, 'Variable', 'provider_specific', 'low');
    });
  }

  // P4: Phantom loads
  add(
    'Cut phantom / standby power waste',
    `Devices consume power even when "off". Chargers, TVs, routers, and set-top boxes are major culprits. Estimated phantom load: ${applianceBreakdown?.phantomLoadKWh || 15} kWh/month (₹${applianceBreakdown?.phantomLoadCost || 100}). Use smart power strips.`,
    `₹${applianceBreakdown?.phantomLoadCost || 100}/month`,
    'behavior', 'zero'
  );

  // P5: LED lighting
  add(
    'Switch to LED lighting throughout',
    'Replace all incandescent and CFL bulbs with LED equivalents. A 9W LED provides the same light as a 60W incandescent at 85% less power. Payback in 3-6 months.',
    '₹200-500/month',
    'lighting', 'low'
  );

  // P6: Geyser / water heater
  if (units > 100) {
    add(
      'Install timer on electric water heater',
      'Schedule geyser to heat water only 30 minutes before morning and evening use. Eliminating round-the-clock standby heating saves 7-12% on bills. Timer cost: ₹500-1500.',
      '₹150-400/month',
      'appliance', 'low'
    );
  }

  // P7: Solar for high consumers
  if (units > 250) {
    const capacity = Math.ceil(units / 120);
    add(
      `Consider ${capacity}kW rooftop solar`,
      `At ${units} units/month, solar can offset 55-65% of your bill. Net metering credits excess power back to the grid. ${provider?.subsidyInfo || 'State subsidies up to 40% available.'}`,
      '₹2000-5000/month',
      'solar', 'high'
    );
  }

  // P8: Refrigerator
  if (units > 150) {
    add(
      'Audit refrigerator efficiency',
      'If your refrigerator is >10 years old, it uses 2-3x more power than modern 5-star inverter models. Check the BEE star label. Also clean condenser coils every 6 months for 10-15% better efficiency.',
      '₹300-800/month',
      'appliance', 'medium'
    );
  }

  // P9: Washing machine habits
  add(
    'Optimize washing machine usage',
    'Always run full loads (half-loads use 80% of a full-load\'s energy). Use cold water cycles — 80% of washing machine energy goes to heating water. Run at off-peak hours if on ToD tariff.',
    '₹100-200/month',
    'behavior', 'zero'
  );

  // P10: Peak hour shifting if ToD tariff
  if (tariffIntelligence?.hasTod && tariffIntelligence.todAnalysis) {
    add(
      'Shift loads outside peak hours',
      `Peak hours: ${tariffIntelligence.todAnalysis.peakStart}-${tariffIntelligence.todAnalysis.peakEnd} (${tariffIntelligence.todAnalysis.peakMultiplier}x rate). Schedule AC pre-cooling, washing machine, and geyser to run before ${tariffIntelligence.todAnalysis.peakStart}.`,
      '₹400-800/month',
      'peak_hours', 'low'
    );
  }

  // P11: Natural ventilation
  if (units > 200) {
    add(
      'Use natural ventilation during cooler hours',
      'Open windows for cross-ventilation in early mornings and late evenings. Reduces AC runtime by 1-2 hours/day in moderate weather.',
      '₹200-500/month',
      'behavior', 'zero'
    );
  }

  // P12: Rising trend warning
  if (usagePatterns?.monthlyTrend === 'increasing') {
    add(
      '⚠️ Rising consumption trend — investigate now',
      'Your usage has increased over the past months. Common causes: new appliances, refrigerator door seal failure, AC refrigerant leak, or billing error. Check each one.',
      'Prevent further increases',
      'monitoring', 'medium'
    );
  }

  // P13: Anomaly alert
  if (usagePatterns?.anomalies?.length > 0) {
    const anomaly = usagePatterns.anomalies[0];
    add(
      `⚠️ Usage anomaly: ${anomaly.message}`,
      `Possible reasons: ${anomaly.possibleReasons?.join(', ') || 'Unknown'}. Review your appliance usage for this billing period.`,
      'Avoid surprise bills',
      'monitoring', 'low'
    );
  }

  return {
    topRecommendations: recommendations.slice(0, 5),
    allRecommendations: recommendations,
    byCategory: recommendations.reduce((acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    }, {}),
    totalRecommendations: recommendations.length
  };
}

module.exports = { recommendationsEngine };
