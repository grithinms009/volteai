const prisma = require('../db');

async function providerRoutes(fastify) {
  // IMPORTANT: Static routes MUST come before parameterized routes
  
  // GET /api/providers/states - Get list of states with providers
  fastify.get('/states', async (request, reply) => {
    const { country = 'IN' } = request.query;
    
    const countryRecord = await prisma.country.findUnique({
      where: { code: country.toUpperCase() },
      include: {
        states: {
          where: { isActive: true, providers: { some: {} } },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!countryRecord) {
      return { country, states: [] };
    }

    return {
      country,
      states: countryRecord.states.map(s => ({
        code: s.code,
        name: s.name,
        avgMonthlyUnits: s.avgMonthlyUnits
      }))
    };
  });

  // GET /api/providers/countries - Get list of supported countries
  fastify.get('/countries', async (request, reply) => {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return {
      countries: countries.map(c => ({
        code: c.code,
        name: c.name,
        currency: c.currency,
        currencySymbol: c.currencySymbol
      }))
    };
  });

  // GET /api/providers - List all providers (optionally filter by country/state)
  fastify.get('/', async (request, reply) => {
    const { country = 'IN', state } = request.query;
    
    const where = {
      isActive: true,
      country: { code: country.toUpperCase() }
    };

    if (state) {
      where.state = { code: state.toUpperCase() };
    }

    const providers = await prisma.provider.findMany({
      where,
      include: {
        state: true,
        slabs: { orderBy: { sortOrder: 'asc' } }
      },
      orderBy: [{ state: { name: 'asc' } }, { name: 'asc' }]
    });

    return {
      country,
      state: state || null,
      count: providers.length,
      providers: providers.map(p => ({
        id: p.code,
        name: p.name,
        shortName: p.shortName || p.aliases[0] || p.code.toUpperCase(),
        state: p.state.name,
        stateCode: p.state.code,
        tariffType: p.tariffType,
        avgMonthlyUnits: p.avgMonthlyUnits,
        hasPeakHours: !!(p.peakHoursStart && p.peakHoursEnd),
        slabCount: p.slabs.length,
        lowestRate: p.slabs[0]?.rate || null,
        highestRate: p.slabs[p.slabs.length - 1]?.rate || null,
      }))
    };
  });

  // GET /api/providers/:id - Get detailed provider info with tariff structure
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    
    const provider = await prisma.provider.findUnique({
      where: { code: id },
      include: {
        country: true,
        state: true,
        slabs: { orderBy: { sortOrder: 'asc' } },
        fixedCharges: { orderBy: { sortOrder: 'asc' } },
        tips: { orderBy: { sortOrder: 'asc' } }
      }
    });

    if (!provider) {
      return reply.code(404).send({ error: 'Provider not found' });
    }

    const currencySymbol = provider.country.currencySymbol || '₹';

    return {
      id: provider.code,
      name: provider.name,
      aliases: provider.aliases,
      state: provider.state.name,
      stateCode: provider.state.code,
      country: provider.country.name,
      countryCode: provider.country.code,
      currency: provider.currency,
      currencySymbol,
      tariffType: provider.tariffType,
      slabs: provider.slabs.map(s => ({
        range: s.label,
        minUnits: s.minUnits,
        maxUnits: s.maxUnits,
        rate: s.rate,
        rateFormatted: `${currencySymbol}${s.rate}/unit`
      })),
      fixedCharges: provider.fixedCharges.map(f => ({
        range: `${f.minUnits}-${f.maxUnits ? f.maxUnits : '∞'} units`,
        charge: f.charge,
        chargeFormatted: `${currencySymbol}${f.charge}/month`
      })),
      fuelSurchargePerUnit: provider.fuelSurchargePerUnit,
      electricityDutyPct: provider.electricityDutyPct,
      avgMonthlyUnits: provider.avgMonthlyUnits,
      peakHours: provider.peakHoursStart ? {
        start: provider.peakHoursStart,
        end: provider.peakHoursEnd,
        multiplier: provider.peakMultiplier
      } : null,
      subsidyInfo: provider.subsidyInfo,
      tips: provider.tips.map(t => t.tip),
      websiteUrl: provider.websiteUrl,
      logoUrl: provider.logoUrl,
      // Educational content
      education: {
        howSlabsWork: `${provider.name} uses a tiered (slab) pricing system. The more you consume, the higher the rate per unit. Your bill is calculated by applying each slab rate to the units falling in that range.`,
        fixedVsVariable: `Your bill has two parts: Fixed Charges (${currencySymbol}${provider.fixedCharges[0]?.charge || 'varies'}-${currencySymbol}${provider.fixedCharges[provider.fixedCharges.length - 1]?.charge || 'varies'}/month based on consumption) + Energy Charges (variable, based on units consumed).`,
        savingStrategy: provider.tips[0]?.tip || 'Reduce consumption to stay in lower slabs for maximum savings.',
        peakHourTip: provider.peakHoursStart 
          ? `Peak hours are ${provider.peakHoursStart}-${provider.peakHoursEnd}. Running heavy appliances outside these hours can save up to 15%.`
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

    const provider = await prisma.provider.findUnique({
      where: { code: id },
      include: {
        country: true,
        slabs: { orderBy: { sortOrder: 'asc' } },
        fixedCharges: { orderBy: { sortOrder: 'asc' } }
      }
    });

    if (!provider) {
      return reply.code(404).send({ error: 'Provider not found' });
    }

    const unitsNum = parseInt(units, 10);
    const currencySymbol = provider.country.currencySymbol || '₹';
    
    // Calculate energy charge by slab
    let energyCharge = 0;
    const slabBreakdown = [];
    let remainingUnits = unitsNum;

    for (const slab of provider.slabs) {
      if (remainingUnits <= 0) break;

      const slabMax = slab.maxUnits || Infinity;
      const slabSize = slab.minUnits === 0 ? slabMax : slabMax - slab.minUnits;
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
    const fixedSlab = provider.fixedCharges.find(f => 
      unitsNum >= f.minUnits && (f.maxUnits === null || unitsNum <= f.maxUnits)
    );
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
    const currentSlab = provider.slabs.find(s => 
      unitsNum >= s.minUnits && (s.maxUnits === null || unitsNum <= s.maxUnits)
    );

    // Optimization suggestion
    let optimization = null;
    const lowerSlabs = provider.slabs.filter(s => s.maxUnits && s.maxUnits < unitsNum);
    
    if (lowerSlabs.length > 0) {
      const targetSlab = lowerSlabs[lowerSlabs.length - 1];
      const unitsToReduce = unitsNum - targetSlab.maxUnits;
      
      if (unitsToReduce <= 50 && unitsToReduce > 0) {
        // Recalculate for target units
        let targetEnergy = 0;
        let targetRemaining = targetSlab.maxUnits;
        
        for (const slab of provider.slabs) {
          if (targetRemaining <= 0) break;
          const slabMax = slab.maxUnits || Infinity;
          const slabSize = slab.minUnits === 0 ? slabMax : slabMax - slab.minUnits;
          const unitsInSlab = Math.min(targetRemaining, slabSize);
          
          if (targetSlab.maxUnits > slab.minUnits || slab.minUnits === 0) {
            targetEnergy += unitsInSlab * slab.rate;
            targetRemaining -= unitsInSlab;
          }
        }
        
        const targetFixed = provider.fixedCharges.find(f => 
          targetSlab.maxUnits >= f.minUnits && (f.maxUnits === null || targetSlab.maxUnits <= f.maxUnits)
        )?.charge || 0;
        
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
          tip: `Reduce just ${unitsToReduce} units to drop to ${targetSlab.label} and save ${currencySymbol}${Math.round(total - targetTotal)}/month!`
        };
      }
    }

    return {
      provider: provider.name,
      units: unitsNum,
      currency: provider.currency,
      currencySymbol,
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
        slabExplanation: `With ${unitsNum} units, you're in the "${currentSlab?.label || 'highest'}" slab paying ${currencySymbol}${currentSlab?.rate || provider.slabs[provider.slabs.length - 1]?.rate}/unit for units in this range.`,
        costBreakdown: `Energy: ${currencySymbol}${Math.round(energyCharge)} (${Math.round(energyCharge/total*100)}%) | Fixed: ${currencySymbol}${fixedCharge} (${Math.round(fixedCharge/total*100)}%) | Taxes: ${currencySymbol}${Math.round(electricityDuty + fuelSurcharge)} (${Math.round((electricityDuty + fuelSurcharge)/total*100)}%)`,
        effectiveRateNote: `Your effective rate is ${currencySymbol}${(Math.round(effectiveRate * 100) / 100).toFixed(2)}/unit. This is higher than the base rate because of fixed charges and taxes.`
      }
    };
  });
}

module.exports = providerRoutes;
