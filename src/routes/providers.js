const providers = require('../data/providers');

async function providerRoutes(fastify) {
  // IMPORTANT: Static routes MUST come before parameterized routes
  
  // GET /api/providers/states - Get list of states with providers
  fastify.get('/states', async (request, reply) => {
    const { country = 'IN' } = request.query;
    
    const states = [...new Set(
      providers
        .filter(p => p.countryCode === country.toUpperCase())
        .map(p => JSON.stringify({ code: p.stateCode, name: p.stateName }))
    )].map(s => JSON.parse(s)).sort((a, b) => a.name.localeCompare(b.name));

    return { country, states };
  });

  // GET /api/providers - List all providers (optionally filter by country)
  fastify.get('/', async (request, reply) => {
    const { country = 'IN' } = request.query;
    
    const filtered = providers
      .filter(p => p.countryCode === country.toUpperCase())
      .map(p => ({
        id: p.id,
        name: p.name,
        shortName: p.aliases[0] || p.id.toUpperCase(),
        state: p.stateName,
        stateCode: p.stateCode,
        tariffType: p.tariffType,
        avgMonthlyUnits: p.avgMonthlyUnitsHome,
        hasPeakHours: !!p.peakHours,
        slabCount: p.slabs?.length || 0,
        lowestRate: p.slabs?.[0]?.rate || null,
        highestRate: p.slabs?.[p.slabs.length - 1]?.rate || null,
      }))
      .sort((a, b) => a.state.localeCompare(b.state));

    return {
      country,
      count: filtered.length,
      providers: filtered
    };
  });

  // GET /api/providers/:id - Get detailed provider info with tariff structure
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const provider = providers.find(p => p.id === id);

    if (!provider) {
      return reply.code(404).send({ error: 'Provider not found' });
    }

    return {
      id: provider.id,
      name: provider.name,
      aliases: provider.aliases,
      state: provider.stateName,
      stateCode: provider.stateCode,
      country: provider.countryCode === 'IN' ? 'India' : provider.countryCode,
      countryCode: provider.countryCode,
      currency: provider.currency,
      tariffType: provider.tariffType,
      slabs: provider.slabs?.map(s => ({
        range: s.label,
        minUnits: s.minUnits,
        maxUnits: s.maxUnits === Infinity ? null : s.maxUnits,
        rate: s.rate,
        rateFormatted: `₹${s.rate}/unit`
      })),
      fixedCharges: provider.fixedCharges?.map(f => ({
        range: `${f.minUnits}-${f.maxUnits === Infinity ? '∞' : f.maxUnits} units`,
        charge: f.charge,
        chargeFormatted: `₹${f.charge}/month`
      })),
      fuelSurchargePerUnit: provider.fuelSurchargePerUnit,
      electricityDutyPct: provider.electricityDutyPct,
      avgMonthlyUnitsHome: provider.avgMonthlyUnitsHome,
      peakHours: provider.peakHours,
      subsidyInfo: provider.subsidyInfo,
      tips: provider.tips,
      websiteUrl: provider.websiteUrl,
      // Educational content
      education: {
        howSlabsWork: `${provider.name} uses a tiered (slab) pricing system. The more you consume, the higher the rate per unit. Your bill is calculated by applying each slab rate to the units falling in that range.`,
        fixedVsVariable: `Your bill has two parts: Fixed Charges (₹${provider.fixedCharges?.[0]?.charge || 'varies'}-₹${provider.fixedCharges?.[provider.fixedCharges?.length - 1]?.charge || 'varies'}/month based on consumption) + Energy Charges (variable, based on units consumed).`,
        savingStrategy: provider.tips?.[0] || 'Reduce consumption to stay in lower slabs for maximum savings.',
        peakHourTip: provider.peakHours 
          ? `Peak hours are ${provider.peakHours.start}-${provider.peakHours.end}. Running heavy appliances outside these hours can save up to 15%.`
          : 'Your provider does not have Time-of-Day pricing. Focus on overall consumption reduction.',
      }
    };
  });

  // GET /api/providers/:id/calculate - Calculate bill for given units
  fastify.get('/:id/calculate', async (request, reply) => {
    const { id } = request.params;
    const { units } = request.query;

    if (!units || isNaN(units) || units < 0) {
      return reply.code(400).send({ error: 'Valid units parameter required' });
    }

    const provider = providers.find(p => p.id === id);
    if (!provider) {
      return reply.code(404).send({ error: 'Provider not found' });
    }

    const unitsNum = parseInt(units, 10);
    
    // Calculate energy charge by slab
    let energyCharge = 0;
    const slabBreakdown = [];
    let remainingUnits = unitsNum;

    for (const slab of provider.slabs || []) {
      if (remainingUnits <= 0) break;

      const slabSize = slab.maxUnits === Infinity 
        ? remainingUnits 
        : (slab.minUnits === 0 ? slab.maxUnits : slab.maxUnits - slab.minUnits);
      
      const unitsInSlab = Math.min(remainingUnits, slabSize);
      const slabCost = unitsInSlab * slab.rate;
      
      if (unitsNum > slab.minUnits || slab.minUnits === 0) {
        slabBreakdown.push({
          slab: slab.label,
          units: unitsInSlab,
          rate: slab.rate,
          cost: Math.round(slabCost * 100) / 100
        });
        energyCharge += slabCost;
        remainingUnits -= unitsInSlab;
      }
    }

    // Fixed charge
    const fixedSlab = provider.fixedCharges?.find(f => unitsNum >= f.minUnits && unitsNum <= f.maxUnits);
    const fixedCharge = fixedSlab?.charge || 0;

    // Fuel surcharge
    const fuelSurcharge = (provider.fuelSurchargePerUnit || 0) * unitsNum;

    // Subtotal
    const subtotal = energyCharge + fixedCharge + fuelSurcharge;

    // Electricity duty
    const electricityDuty = subtotal * ((provider.electricityDutyPct || 0) / 100);

    // Total
    const total = subtotal + electricityDuty;
    const effectiveRate = unitsNum > 0 ? total / unitsNum : 0;

    // Find current slab
    const currentSlab = provider.slabs?.find(s => unitsNum >= s.minUnits && unitsNum <= s.maxUnits);

    // Optimization suggestion
    let optimization = null;
    const lowerSlabs = provider.slabs?.filter(s => s.maxUnits < unitsNum && s.maxUnits !== Infinity) || [];
    if (lowerSlabs.length > 0) {
      const targetSlab = lowerSlabs[lowerSlabs.length - 1];
      const unitsToReduce = unitsNum - targetSlab.maxUnits;
      if (unitsToReduce <= 50) {
        // Recalculate for target
        let targetEnergy = 0;
        let targetRemaining = targetSlab.maxUnits;
        for (const slab of provider.slabs || []) {
          if (targetRemaining <= 0) break;
          const slabSize = slab.maxUnits === Infinity ? targetRemaining : (slab.minUnits === 0 ? slab.maxUnits : slab.maxUnits - slab.minUnits);
          const unitsInSlab = Math.min(targetRemaining, slabSize);
          if (targetSlab.maxUnits > slab.minUnits || slab.minUnits === 0) {
            targetEnergy += unitsInSlab * slab.rate;
            targetRemaining -= unitsInSlab;
          }
        }
        const targetFixed = provider.fixedCharges?.find(f => targetSlab.maxUnits >= f.minUnits && targetSlab.maxUnits <= f.maxUnits)?.charge || 0;
        const targetFuel = (provider.fuelSurchargePerUnit || 0) * targetSlab.maxUnits;
        const targetSubtotal = targetEnergy + targetFixed + targetFuel;
        const targetDuty = targetSubtotal * ((provider.electricityDutyPct || 0) / 100);
        const targetTotal = targetSubtotal + targetDuty;

        optimization = {
          currentSlab: currentSlab?.label,
          targetSlab: targetSlab.label,
          targetUnits: targetSlab.maxUnits,
          unitsToReduce,
          currentBill: Math.round(total),
          targetBill: Math.round(targetTotal),
          savings: Math.round(total - targetTotal),
          tip: `Reduce just ${unitsToReduce} units to drop to ${targetSlab.label} and save ₹${Math.round(total - targetTotal)}/month!`
        };
      }
    }

    return {
      provider: provider.name,
      units: unitsNum,
      breakdown: {
        slabs: slabBreakdown,
        energyCharge: Math.round(energyCharge * 100) / 100,
        fixedCharge,
        fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
        electricityDuty: Math.round(electricityDuty * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      currentSlab: currentSlab?.label || 'Unknown',
      optimization,
      education: {
        slabExplanation: `With ${unitsNum} units, you're in the "${currentSlab?.label || 'highest'}" slab paying ₹${currentSlab?.rate || provider.slabs?.[provider.slabs.length - 1]?.rate}/unit for units in this range.`,
        costBreakdown: `Energy: ₹${Math.round(energyCharge)} (${Math.round(energyCharge/total*100)}%) | Fixed: ₹${fixedCharge} (${Math.round(fixedCharge/total*100)}%) | Taxes: ₹${Math.round(electricityDuty + fuelSurcharge)} (${Math.round((electricityDuty + fuelSurcharge)/total*100)}%)`,
        effectiveRateNote: `Your effective rate is ₹${Math.round(effectiveRate * 100) / 100}/unit. This is higher than the base rate because of fixed charges and taxes.`
      }
    };
  });

}

module.exports = providerRoutes;
