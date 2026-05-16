function comparisonsEngine({ extractedFields, regionDefaults, profileType, provider }) {
  console.log('[ENGINE-8] Building peer comparisons...');

  const units = extractedFields.unitsConsumed || 0;
  const bill = extractedFields.totalAmount || 0;
  const profile = (profileType || 'home').toLowerCase().replace('-', '_');

  const profileMultipliers = { home: 1.0, home_office: 1.3, small_shop: 2.0, office: 3.0 };
  const baseAvg = regionDefaults?.avgMonthlyUnitsHome || 200;
  const peerAvgUnits = Math.round(baseAvg * (profileMultipliers[profile] || 1.0));

  const vsPercent = peerAvgUnits > 0 ? Math.round(((units - peerAvgUnits) / peerAvgUnits) * 100) : 0;

  let ranking = 'average';
  if (vsPercent > 25) ranking = 'high_consumer';
  else if (vsPercent > 10) ranking = 'slightly_high';
  else if (vsPercent < -20) ranking = 'efficient';

  const rankingLabels = {
    high_consumer: 'High Consumer',
    slightly_high: 'Slightly Above Average',
    average: 'Average',
    efficient: 'Energy Efficient'
  };

  // National benchmark (India)
  const nationalAvgUnits = 200;
  const vsNational = Math.round(((units - nationalAvgUnits) / nationalAvgUnits) * 100);

  // Per capita
  const avgHouseholdSize = 4;
  const perCapita = Math.round(units / avgHouseholdSize);
  const globalMiddleIncomePerCapita = 150;
  const vsGlobal = Math.round(((perCapita - globalMiddleIncomePerCapita) / globalMiddleIncomePerCapita) * 100);

  // Cost comparison
  const effectiveRate = units > 0 ? bill / units : 0;
  const peerAvgBill = Math.round(peerAvgUnits * (regionDefaults?.residentialRate || 5.5));

  return {
    peerComparison: {
      peerAvgUnits,
      yourUnits: units,
      vsPercent,
      ranking,
      rankingLabel: rankingLabels[ranking] || 'Average',
      percentile: Math.min(95, Math.max(5, Math.round(50 + vsPercent / 2))),
      peerAvgBill,
      yourBill: bill,
      message: vsPercent > 0
        ? `You use ${vsPercent}% more than similar ${profile.replace('_', ' ')}s in your region`
        : vsPercent < 0
          ? `You use ${Math.abs(vsPercent)}% less than similar ${profile.replace('_', ' ')}s — great job!`
          : 'Your consumption matches the regional average'
    },
    regionalBenchmark: {
      state: provider?.state || extractedFields.state || 'Your region',
      stateAvgUnits: peerAvgUnits,
      yourUnits: units,
      diffPct: vsPercent
    },
    nationalBenchmark: {
      country: 'India',
      nationalAvgUnits,
      yourUnits: units,
      diffPct: vsNational,
      interpretation: vsNational > 20
        ? 'Well above national average — significant savings potential'
        : vsNational < -20
          ? 'Well below national average — excellent efficiency'
          : 'Near national average'
    },
    globalBenchmark: {
      perCapitaUsage: perCapita,
      globalMiddleIncomeAvg: globalMiddleIncomePerCapita,
      diffPct: vsGlobal,
      context: vsGlobal > 20
        ? 'Above global middle-income average. Solar or efficiency upgrades would have high impact.'
        : 'Within or below global middle-income average. Continue efficiency practices.'
    }
  };
}

module.exports = { comparisonsEngine };
