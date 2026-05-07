const countries = require('../data/countries');
const providers = require('../data/providers');

function calculateSlabBill(units, provider) {
  if (!provider.slabs || !Array.isArray(provider.slabs)) {
    return null;
  }

  let energyCharge = 0;
  let remainingUnits = units;

  for (const slab of provider.slabs) {
    if (remainingUnits <= 0) break;
    
    const slabUnits = Math.min(
      remainingUnits,
      (slab.maxUnits === Infinity ? remainingUnits : slab.maxUnits) - slab.minUnits + (slab.minUnits === 0 ? 1 : 0)
    );
    
    const unitsInSlab = slab.minUnits === 0 
      ? Math.min(remainingUnits, slab.maxUnits)
      : Math.min(remainingUnits, slab.maxUnits - slab.minUnits);
    
    if (units >= slab.minUnits) {
      const applicableUnits = Math.min(
        units - slab.minUnits + (slab.minUnits === 0 ? 0 : 1),
        (slab.maxUnits === Infinity ? Infinity : slab.maxUnits - slab.minUnits + (slab.minUnits === 0 ? 1 : 0))
      );
      energyCharge += Math.max(0, Math.min(applicableUnits, remainingUnits)) * slab.rate;
      remainingUnits -= applicableUnits;
    }
  }

  let fixedCharge = 0;
  if (provider.fixedCharges) {
    const fixedSlab = provider.fixedCharges.find(f => units >= f.minUnits && units <= f.maxUnits);
    if (fixedSlab) fixedCharge = fixedSlab.charge;
  }

  const fuelSurcharge = (provider.fuelSurchargePerUnit || 0) * units;
  const subtotal = energyCharge + fixedCharge + fuelSurcharge;
  const electricityDuty = subtotal * ((provider.electricityDutyPct || 0) / 100);
  const total = subtotal + electricityDuty;

  return {
    energyCharge: Math.round(energyCharge * 100) / 100,
    fixedCharge,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    electricityDuty: Math.round(electricityDuty * 100) / 100,
    total: Math.round(total * 100) / 100,
    effectiveRate: units > 0 ? Math.round((total / units) * 100) / 100 : 0
  };
}

function findOptimalSlab(units, provider) {
  if (!provider.slabs) return null;

  const currentSlab = provider.slabs.find(s => units >= s.minUnits && units <= s.maxUnits);
  const lowerSlabs = provider.slabs.filter(s => s.maxUnits < units && s.maxUnits !== Infinity);
  
  if (lowerSlabs.length === 0) return null;

  const nearestLowerSlab = lowerSlabs[lowerSlabs.length - 1];
  const unitsToReduce = units - nearestLowerSlab.maxUnits;
  
  if (unitsToReduce > 0 && unitsToReduce <= 50) {
    const currentBill = calculateSlabBill(units, provider);
    const optimizedBill = calculateSlabBill(nearestLowerSlab.maxUnits, provider);
    
    if (currentBill && optimizedBill) {
      return {
        currentSlab: currentSlab?.label || 'Unknown',
        targetSlab: nearestLowerSlab.label,
        unitsToReduce,
        currentBill: currentBill.total,
        optimizedBill: optimizedBill.total,
        savings: Math.round((currentBill.total - optimizedBill.total) * 100) / 100,
        savingsPct: Math.round(((currentBill.total - optimizedBill.total) / currentBill.total) * 100)
      };
    }
  }

  return null;
}

function getWeightedAverageRate(units, provider) {
  if (!provider.slabs) return provider.slabs?.[0]?.rate || 8;
  
  const bill = calculateSlabBill(units, provider);
  return bill ? bill.effectiveRate : 8;
}

async function regionEngine(extractedFields) {
  console.log(`[REGION] Detecting tariff and region defaults...`);
  
  const providerId = extractedFields.providerId;
  const stateCode = extractedFields.stateCode;
  const countryCode = extractedFields.countryCode || extractedFields.country;
  const units = extractedFields.unitsConsumed || 0;
  const billAmount = extractedFields.totalAmount || 0;

  let provider = null;
  if (providerId) {
    provider = providers.find(p => p.id === providerId);
  }
  if (!provider && stateCode) {
    provider = providers.find(p => p.stateCode === stateCode);
  }
  if (!provider && countryCode === 'IN') {
    provider = providers.find(p => p.id === 'kseb');
  }

  let tariffModel = 'flat';
  if (extractedFields.hasSlabRating || (provider && provider.tariffType === 'tiered')) {
    tariffModel = 'tiered';
  } else if (extractedFields.hasPeakHours || (provider && provider.peakHours)) {
    tariffModel = 'tod';
  } else if (extractedFields.hasDemandCharge) {
    tariffModel = 'demand';
  }

  let effectiveRate = 0;
  let dataSource = 'bill';
  let calculatedBill = null;
  let slabOptimization = null;

  if (billAmount > 0 && units > 0) {
    effectiveRate = billAmount / units;
    dataSource = 'bill';
  } else if (provider && units > 0) {
    calculatedBill = calculateSlabBill(units, provider);
    if (calculatedBill) {
      effectiveRate = calculatedBill.effectiveRate;
      dataSource = 'provider_tariff';
    }
  }

  if (provider && units > 0) {
    slabOptimization = findOptimalSlab(units, provider);
  }

  let regionDefaults = {
    residentialRate: 8,
    commercialRate: 12,
    avgMonthlyUnitsHome: 200,
    currency: 'INR'
  };

  if (provider) {
    const avgUnits = provider.avgMonthlyUnitsHome || 200;
    regionDefaults = {
      residentialRate: getWeightedAverageRate(avgUnits, provider),
      commercialRate: provider.slabs ? provider.slabs[provider.slabs.length - 1].rate * 1.3 : 12,
      avgMonthlyUnitsHome: avgUnits,
      currency: provider.currency || 'INR'
    };

    if (dataSource === 'region_default' || effectiveRate === 0) {
      effectiveRate = regionDefaults.residentialRate;
      dataSource = 'region_default';
    }
  } else {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      regionDefaults = {
        residentialRate: country.defaultResidentialRate,
        commercialRate: country.defaultCommercialRate,
        avgMonthlyUnitsHome: country.avgMonthlyUnitsHome,
        currency: country.currency
      };
      if (effectiveRate === 0) {
        effectiveRate = country.defaultResidentialRate;
        dataSource = 'country_default';
      }
    }
  }

  let confidence = 'low';
  if (provider && units > 0 && billAmount > 0) {
    confidence = 'high';
  } else if (provider || (units > 0 && billAmount > 0)) {
    confidence = 'medium';
  }

  console.log(`[REGION] Provider: ${provider?.name || 'Unknown'}, Tariff: ${tariffModel}, Rate: ₹${effectiveRate.toFixed(2)}/unit`);

  return {
    tariffModel,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    dataSource,
    regionDefaults,
    confidence,
    provider: provider ? {
      id: provider.id,
      name: provider.name,
      state: provider.stateName,
      slabs: provider.slabs,
      fixedCharges: provider.fixedCharges,
      fuelSurchargePerUnit: provider.fuelSurchargePerUnit,
      electricityDutyPct: provider.electricityDutyPct,
      peakHours: provider.peakHours,
      subsidyInfo: provider.subsidyInfo,
      tips: provider.tips,
      websiteUrl: provider.websiteUrl
    } : null,
    calculatedBill,
    slabOptimization
  };
}

module.exports = { regionEngine };
