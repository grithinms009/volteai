function effectiveRateEngine({ extractedFields, regionDefaults, calculatedBill }) {
  console.log('[ENGINE-2] Computing effective rate...');

  const { unitsConsumed, totalAmount, currency } = extractedFields;
  const billAmount = totalAmount || calculatedBill?.total || 0;
  const units = unitsConsumed || 0;

  const effectiveRate = units > 0 ? billAmount / units : 0;
  const regionAvg = regionDefaults?.residentialRate || 5.5;
  const nationalAvg = 6.0;
  const metroAvg = 7.2;

  const rateDiffVsRegion = regionAvg > 0 ? ((effectiveRate - regionAvg) / regionAvg) * 100 : 0;
  const rateDiffVsNational = nationalAvg > 0 ? ((effectiveRate - nationalAvg) / nationalAvg) * 100 : 0;
  const rateDiffVsMetro = metroAvg > 0 ? ((effectiveRate - metroAvg) / metroAvg) * 100 : 0;

  let rateStatus = 'average';
  if (rateDiffVsRegion > 15) rateStatus = 'above_average';
  else if (rateDiffVsRegion < -15) rateStatus = 'below_average';

  const percentile = Math.min(95, Math.max(5, Math.round(50 + rateDiffVsRegion)));

  return {
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    effectiveRateCurrency: currency || 'INR',
    regionAvgRate: Math.round(regionAvg * 100) / 100,
    nationalAvgRate: nationalAvg,
    ratePercentile: percentile,
    rateStatus,
    rateStatusLabel: {
      above_average: 'Above Average',
      average: 'Average',
      below_average: 'Below Average'
    }[rateStatus] || 'Average',
    rateComparison: {
      vs_region: `${rateDiffVsRegion > 0 ? '+' : ''}${rateDiffVsRegion.toFixed(1)}%`,
      vs_national: `${rateDiffVsNational > 0 ? '+' : ''}${rateDiffVsNational.toFixed(1)}%`,
      vs_metro: `${rateDiffVsMetro > 0 ? '+' : ''}${rateDiffVsMetro.toFixed(1)}%`
    },
    rateInsights: [
      `Your effective rate: ₹${effectiveRate.toFixed(2)}/unit`,
      `Regional average: ₹${regionAvg.toFixed(2)}/unit`,
      rateStatus === 'above_average'
        ? `You pay ${Math.abs(rateDiffVsRegion).toFixed(0)}% more than your region's average`
        : rateStatus === 'below_average'
          ? `You pay ${Math.abs(rateDiffVsRegion).toFixed(0)}% less than your region's average`
          : 'Your rate is in line with the regional average'
    ]
  };
}

module.exports = { effectiveRateEngine };
