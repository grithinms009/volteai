function savingsOpportunitiesEngine({ extractedFields, provider, usagePatterns, tariffIntelligence, billAmount }) {
  console.log('[ENGINE-6] Computing savings opportunities...');

  const units = extractedFields.unitsConsumed || 0;
  const bill = billAmount || extractedFields.totalAmount || 0;

  const conservative = [];
  const medium = [];
  const large = [];

  // ---- CONSERVATIVE (free / behavior-only) ----

  if (units > 150) {
    conservative.push({
      title: 'Set AC to 24-26°C',
      description: 'Every 1°C increase in set temperature saves 3-5% on cooling costs. Use fan mode when below 30°C.',
      savingsPerMonth: Math.round(bill * 0.08),
      investment: 0,
      paybackMonths: 0,
      effort: 'zero',
      category: 'behavior'
    });
  }

  conservative.push({
    title: 'Eliminate phantom / standby loads',
    description: 'Unplug chargers, TV, set-top box, router, and computers when idle. Standby waste = 6-10% of bill.',
    savingsPerMonth: Math.round(bill * 0.06),
    investment: 0,
    paybackMonths: 0,
    effort: 'low',
    category: 'behavior'
  });

  if (tariffIntelligence?.slabOptimization?.savings > 0) {
    conservative.push({
      title: `Reduce ${tariffIntelligence.slabOptimization.unitsToReduce} units to drop a slab`,
      description: `Move from ${tariffIntelligence.slabOptimization.currentSlab} to ${tariffIntelligence.slabOptimization.targetSlab} and save ₹${tariffIntelligence.slabOptimization.savings}/month`,
      savingsPerMonth: tariffIntelligence.slabOptimization.savings,
      investment: 0,
      paybackMonths: 0,
      effort: 'medium',
      category: 'slab_optimization'
    });
  }

  if (tariffIntelligence?.hasTod) {
    conservative.push({
      title: 'Shift heavy loads to off-peak hours',
      description: `Run washing machine, geyser, and dishwasher outside peak hours for ToD tariff savings`,
      savingsPerMonth: Math.round(bill * 0.10),
      investment: 0,
      paybackMonths: 0,
      effort: 'medium',
      category: 'peak_hours'
    });
  }

  conservative.push({
    title: 'Optimize washing machine usage',
    description: 'Always run full loads; use cold water cycles (80% of energy goes to heating water).',
    savingsPerMonth: Math.round(bill * 0.03),
    investment: 0,
    paybackMonths: 0,
    effort: 'zero',
    category: 'behavior'
  });

  // ---- MEDIUM (small investment, quick payback) ----

  medium.push({
    title: 'Switch all lights to LED',
    description: 'Replace incandescent and CFL bulbs with LED. 9W LED = 60W incandescent. Lasts 15x longer.',
    savingsPerMonth: Math.round(bill * 0.08),
    investment: 2000,
    paybackMonths: Math.round(2000 / Math.max(1, Math.round(bill * 0.08))),
    effort: 'low',
    category: 'appliance_upgrade'
  });

  medium.push({
    title: 'Install smart power strips',
    description: 'Auto-cut power to entertainment and office gear when not in use. No manual effort required.',
    savingsPerMonth: Math.round(bill * 0.05),
    investment: 1500,
    paybackMonths: Math.round(1500 / Math.max(1, Math.round(bill * 0.05))),
    effort: 'low',
    category: 'smart_tech'
  });

  if (units > 200) {
    medium.push({
      title: 'Install AC timer or smart thermostat',
      description: 'Auto-reduce AC during sleep and away hours. Saves 10-15% of cooling cost effortlessly.',
      savingsPerMonth: Math.round(bill * 0.12),
      investment: 3000,
      paybackMonths: Math.round(3000 / Math.max(1, Math.round(bill * 0.12))),
      effort: 'low',
      category: 'smart_tech'
    });
  }

  medium.push({
    title: 'Install geyser timer',
    description: 'Heat water only 30 min before use (morning/evening). Eliminates standby heat loss all day.',
    savingsPerMonth: Math.round(bill * 0.07),
    investment: 800,
    paybackMonths: Math.round(800 / Math.max(1, Math.round(bill * 0.07))),
    effort: 'low',
    category: 'appliance_upgrade'
  });

  // ---- LARGE (capital investment) ----

  if (units > 200) {
    const solarCapacity = Math.max(1, Math.ceil(units / 120));
    const solarCost = solarCapacity * 60000;
    const solarSavings = Math.round(bill * 0.55);
    large.push({
      title: `${solarCapacity}kW Rooftop Solar Installation`,
      description: `Offset 50-65% of consumption. Net metering credits excess power. ${provider?.subsidyInfo || 'Government subsidies up to 40% available.'}`,
      savingsPerMonth: solarSavings,
      investment: solarCost,
      paybackMonths: Math.round(solarCost / Math.max(1, solarSavings)),
      annualReturn: `${Math.round((solarSavings * 12 / solarCost) * 100)}%`,
      effort: 'high',
      category: 'renewable'
    });
  }

  if (units > 150) {
    large.push({
      title: 'Replace old refrigerator with 5-star inverter model',
      description: 'Modern 5-star fridges use 60-70% less power than 10-year-old models.',
      savingsPerMonth: Math.round(bill * 0.12),
      investment: 35000,
      paybackMonths: Math.round(35000 / Math.max(1, Math.round(bill * 0.12))),
      effort: 'medium',
      category: 'appliance_upgrade'
    });
  }

  if (units > 100) {
    large.push({
      title: 'Replace electric geyser with heat pump water heater',
      description: 'Heat pumps use 70% less energy than standard electric geysers. 5-year payback on average.',
      savingsPerMonth: Math.round(bill * 0.15),
      investment: 25000,
      paybackMonths: Math.round(25000 / Math.max(1, Math.round(bill * 0.15))),
      effort: 'medium',
      category: 'renewable'
    });
  }

  const conservativeTotal = conservative.reduce((s, o) => s + o.savingsPerMonth, 0);
  const mediumTotal = medium.reduce((s, o) => s + o.savingsPerMonth, 0);
  const largeTotal = large.reduce((s, o) => s + o.savingsPerMonth, 0);

  return {
    conservative: { total: conservativeTotal, opportunities: conservative },
    medium: { total: mediumTotal, opportunities: medium },
    large: { total: largeTotal, opportunities: large },
    totalSavingsPotential: Math.round((conservativeTotal + mediumTotal + largeTotal) * 12),
    monthlySavingsPotential: conservativeTotal + mediumTotal,
    quickWins: conservative.slice(0, 3)
  };
}

module.exports = { savingsOpportunitiesEngine };
