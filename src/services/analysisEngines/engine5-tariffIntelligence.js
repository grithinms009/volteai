function tariffIntelligenceEngine({ extractedFields, provider, slabOptimization, tariffModel }) {
  console.log('[ENGINE-5] Analyzing tariff intelligence...');

  const units = extractedFields.unitsConsumed || 0;

  let currentSlab = null;
  let slabBoundaryRisk = 0;
  let slabBoundaryRiskAmount = 0;
  let slabAlert = null;
  let nextSlabInfo = null;

  if (provider?.slabs && units > 0) {
    currentSlab = provider.slabs.find(
      s => units >= s.minUnits && (s.maxUnits === null || units <= s.maxUnits)
    );

    if (currentSlab && currentSlab.maxUnits) {
      const distanceToNext = currentSlab.maxUnits - units;
      const slabSize = currentSlab.maxUnits - currentSlab.minUnits;
      slabBoundaryRisk = slabSize > 0
        ? Math.min(100, Math.round((1 - distanceToNext / slabSize) * 100))
        : 0;

      const nextSlab = provider.slabs.find(
        s => s.minUnits === currentSlab.maxUnits + 1 || s.minUnits === currentSlab.maxUnits
      );

      if (nextSlab && distanceToNext <= 30) {
        const rateDiff = nextSlab.rate - currentSlab.rate;
        slabBoundaryRiskAmount = Math.round(rateDiff * units);
        slabAlert = `Only ${distanceToNext} more units will push you to ${nextSlab.label} (₹${nextSlab.rate}/unit vs current ₹${currentSlab.rate}/unit)`;
        nextSlabInfo = {
          label: nextSlab.label,
          rate: nextSlab.rate,
          unitsAway: distanceToNext,
          additionalCost: slabBoundaryRiskAmount
        };
      }
    }
  }

  // ToD analysis
  const hasTod = !!(provider?.peakHours || extractedFields.hasPeakHours);
  let todAnalysis = null;
  if (hasTod && provider?.peakHours) {
    todAnalysis = {
      peakStart: provider.peakHours.start,
      peakEnd: provider.peakHours.end,
      peakMultiplier: provider.peakMultiplier || 1.5,
      recommendation: `Run heavy appliances before ${provider.peakHours.start} or after ${provider.peakHours.end} to save up to 15%`
    };
  }

  const tariffExplanations = {
    tiered: 'Slab/Tiered tariff: You pay progressively higher rates as consumption increases. Staying in lower slabs saves the most.',
    flat: 'Flat tariff: Fixed rate per unit regardless of consumption. Focus on overall reduction.',
    tod: 'Time-of-Day tariff: Rates vary by time. Shift usage to off-peak hours for maximum savings.',
    demand: 'Demand tariff: Charges based on peak demand (kVA). Spread loads to reduce peak demand charge.'
  };

  return {
    tariffModel: tariffModel || 'tiered',
    tariffExplanation: tariffExplanations[tariffModel] || tariffExplanations.tiered,
    currentSlab: currentSlab?.label || (units > 0 ? 'Flat rate' : 'No data'),
    currentSlabRate: currentSlab?.rate || null,
    slabBoundaryRisk,
    slabBoundaryRiskAmount,
    slabAlert,
    nextSlabInfo,
    hasTod,
    todAnalysis,
    slabOptimization,
    allSlabs: provider?.slabs?.map(s => ({
      label: s.label,
      rate: s.rate,
      isCurrent: currentSlab?.label === s.label
    })) || []
  };
}

module.exports = { tariffIntelligenceEngine };
