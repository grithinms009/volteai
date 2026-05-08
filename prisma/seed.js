const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.providerTip.deleteMany();
  await prisma.fixedCharge.deleteMany();
  await prisma.tariffSlab.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.state.deleteMany();
  await prisma.country.deleteMany();

  // ============ COUNTRIES ============
  const india = await prisma.country.create({
    data: {
      code: 'IN',
      name: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      defaultRate: 6.5,
      avgMonthlyUnits: 200,
    }
  });

  const usa = await prisma.country.create({
    data: {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      defaultRate: 0.12,
      avgMonthlyUnits: 900,
    }
  });

  const uk = await prisma.country.create({
    data: {
      code: 'GB',
      name: 'United Kingdom',
      currency: 'GBP',
      currencySymbol: '£',
      defaultRate: 0.28,
      avgMonthlyUnits: 300,
    }
  });

  console.log('✅ Countries created');

  // ============ INDIAN STATES ============
  const indianStates = [
    { code: 'KL', name: 'Kerala', avgMonthlyUnits: 180 },
    { code: 'MH', name: 'Maharashtra', avgMonthlyUnits: 220 },
    { code: 'KA', name: 'Karnataka', avgMonthlyUnits: 200 },
    { code: 'TN', name: 'Tamil Nadu', avgMonthlyUnits: 210 },
    { code: 'DL', name: 'Delhi', avgMonthlyUnits: 250 },
    { code: 'GJ', name: 'Gujarat', avgMonthlyUnits: 230 },
    { code: 'RJ', name: 'Rajasthan', avgMonthlyUnits: 200 },
    { code: 'UP', name: 'Uttar Pradesh', avgMonthlyUnits: 180 },
    { code: 'WB', name: 'West Bengal', avgMonthlyUnits: 170 },
    { code: 'AP', name: 'Andhra Pradesh', avgMonthlyUnits: 200 },
    { code: 'TS', name: 'Telangana', avgMonthlyUnits: 210 },
    { code: 'PB', name: 'Punjab', avgMonthlyUnits: 220 },
    { code: 'HR', name: 'Haryana', avgMonthlyUnits: 230 },
    { code: 'MP', name: 'Madhya Pradesh', avgMonthlyUnits: 190 },
    { code: 'BR', name: 'Bihar', avgMonthlyUnits: 150 },
    { code: 'OR', name: 'Odisha', avgMonthlyUnits: 160 },
    { code: 'JH', name: 'Jharkhand', avgMonthlyUnits: 160 },
    { code: 'CG', name: 'Chhattisgarh', avgMonthlyUnits: 170 },
    { code: 'AS', name: 'Assam', avgMonthlyUnits: 140 },
    { code: 'GA', name: 'Goa', avgMonthlyUnits: 200 },
  ];

  const stateMap = {};
  for (const state of indianStates) {
    const created = await prisma.state.create({
      data: {
        code: state.code,
        name: state.name,
        countryId: india.id,
        avgMonthlyUnits: state.avgMonthlyUnits,
      }
    });
    stateMap[state.code] = created;
  }

  console.log('✅ Indian states created');

  // ============ US STATES ============
  const usStates = [
    { code: 'CA', name: 'California', avgMonthlyUnits: 550 },
    { code: 'TX', name: 'Texas', avgMonthlyUnits: 1200 },
    { code: 'FL', name: 'Florida', avgMonthlyUnits: 1100 },
    { code: 'NY', name: 'New York', avgMonthlyUnits: 600 },
    { code: 'PA', name: 'Pennsylvania', avgMonthlyUnits: 850 },
    { code: 'IL', name: 'Illinois', avgMonthlyUnits: 750 },
    { code: 'OH', name: 'Ohio', avgMonthlyUnits: 900 },
    { code: 'GA', name: 'Georgia', avgMonthlyUnits: 1100 },
    { code: 'NC', name: 'North Carolina', avgMonthlyUnits: 1050 },
    { code: 'MI', name: 'Michigan', avgMonthlyUnits: 650 },
    { code: 'NJ', name: 'New Jersey', avgMonthlyUnits: 680 },
    { code: 'VA', name: 'Virginia', avgMonthlyUnits: 1100 },
    { code: 'WA', name: 'Washington', avgMonthlyUnits: 950 },
    { code: 'AZ', name: 'Arizona', avgMonthlyUnits: 1050 },
    { code: 'MA', name: 'Massachusetts', avgMonthlyUnits: 600 },
    { code: 'TN', name: 'Tennessee', avgMonthlyUnits: 1200 },
    { code: 'IN', name: 'Indiana', avgMonthlyUnits: 950 },
    { code: 'MO', name: 'Missouri', avgMonthlyUnits: 1050 },
    { code: 'MD', name: 'Maryland', avgMonthlyUnits: 1000 },
    { code: 'CO', name: 'Colorado', avgMonthlyUnits: 700 },
  ];

  const usStateMap = {};
  for (const state of usStates) {
    const created = await prisma.state.create({
      data: {
        code: state.code,
        name: state.name,
        countryId: usa.id,
        avgMonthlyUnits: state.avgMonthlyUnits,
      }
    });
    usStateMap[state.code] = created;
  }

  console.log('✅ US states created');

  // ============ UK REGIONS ============
  const ukRegions = [
    { code: 'ENG', name: 'England', avgMonthlyUnits: 280 },
    { code: 'SCT', name: 'Scotland', avgMonthlyUnits: 320 },
    { code: 'WLS', name: 'Wales', avgMonthlyUnits: 300 },
    { code: 'NIR', name: 'Northern Ireland', avgMonthlyUnits: 310 },
    { code: 'LON', name: 'London', avgMonthlyUnits: 250 },
    { code: 'MAN', name: 'Manchester', avgMonthlyUnits: 290 },
    { code: 'BIR', name: 'Birmingham', avgMonthlyUnits: 285 },
    { code: 'LIV', name: 'Liverpool', avgMonthlyUnits: 295 },
    { code: 'LEE', name: 'Leeds', avgMonthlyUnits: 280 },
    { code: 'GLA', name: 'Glasgow', avgMonthlyUnits: 330 },
  ];

  const ukRegionMap = {};
  for (const region of ukRegions) {
    const created = await prisma.state.create({
      data: {
        code: region.code,
        name: region.name,
        countryId: uk.id,
        avgMonthlyUnits: region.avgMonthlyUnits,
      }
    });
    ukRegionMap[region.code] = created;
  }

  console.log('✅ UK regions created');

  // ============ INDIAN PROVIDERS ============
  
  // KSEB - Kerala
  const kseb = await prisma.provider.create({
    data: {
      code: 'kseb',
      name: 'Kerala State Electricity Board',
      shortName: 'KSEB',
      aliases: ['KSEB', 'KSEBL', 'Kerala Electricity', 'KSE Board'],
      countryId: india.id,
      stateId: stateMap['KL'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.10,
      electricityDutyPct: 10,
      avgMonthlyUnits: 180,
      subsidyInfo: 'BPL households get subsidized rates. Solar rooftop net metering available at ₹3.22/unit buyback.',
      websiteUrl: 'https://wss.kseb.in/',
    }
  });

  // KSEB Slabs
  const ksebSlabs = [
    { minUnits: 0, maxUnits: 50, rate: 3.15, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, rate: 3.70, label: '51-100 units' },
    { minUnits: 101, maxUnits: 150, rate: 4.80, label: '101-150 units' },
    { minUnits: 151, maxUnits: 200, rate: 6.40, label: '151-200 units' },
    { minUnits: 201, maxUnits: 250, rate: 7.60, label: '201-250 units' },
    { minUnits: 251, maxUnits: 300, rate: 5.80, label: '251-300 units' },
    { minUnits: 301, maxUnits: 350, rate: 6.60, label: '301-350 units' },
    { minUnits: 351, maxUnits: 400, rate: 6.90, label: '351-400 units' },
    { minUnits: 401, maxUnits: 500, rate: 7.10, label: '401-500 units' },
    { minUnits: 501, maxUnits: null, rate: 7.90, label: '500+ units' },
  ];

  for (let i = 0; i < ksebSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...ksebSlabs[i], providerId: kseb.id, sortOrder: i }
    });
  }

  // KSEB Fixed Charges
  const ksebFixed = [
    { minUnits: 0, maxUnits: 50, charge: 35, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, charge: 55, label: '51-100 units' },
    { minUnits: 101, maxUnits: 150, charge: 75, label: '101-150 units' },
    { minUnits: 151, maxUnits: 200, charge: 100, label: '151-200 units' },
    { minUnits: 201, maxUnits: 250, charge: 125, label: '201-250 units' },
    { minUnits: 251, maxUnits: 300, charge: 135, label: '251-300 units' },
    { minUnits: 301, maxUnits: 400, charge: 150, label: '301-400 units' },
    { minUnits: 401, maxUnits: null, charge: 175, label: '400+ units' },
  ];

  for (let i = 0; i < ksebFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...ksebFixed[i], providerId: kseb.id, sortOrder: i }
    });
  }

  // KSEB Tips
  const ksebTips = [
    { tip: 'Keep consumption below 200 units to stay in lower slabs and avoid the steep 201-250 slab rate.', category: 'savings' },
    { tip: 'KSEB offers net metering for solar - excess power credited at ₹3.22/unit.', category: 'solar' },
    { tip: 'Use 5-star rated appliances to reduce consumption by 20-30%.', category: 'appliance' },
    { tip: 'Consider solar water heater - saves 2-3 units daily.', category: 'solar' },
  ];

  for (let i = 0; i < ksebTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...ksebTips[i], providerId: kseb.id, sortOrder: i }
    });
  }

  console.log('✅ KSEB (Kerala) created');

  // MSEDCL - Maharashtra
  const msedcl = await prisma.provider.create({
    data: {
      code: 'msedcl',
      name: 'Maharashtra State Electricity Distribution Co. Ltd',
      shortName: 'MSEDCL',
      aliases: ['MSEDCL', 'Mahavitaran', 'MSEB', 'Maharashtra Electricity'],
      countryId: india.id,
      stateId: stateMap['MH'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.08,
      electricityDutyPct: 16,
      avgMonthlyUnits: 220,
      subsidyInfo: 'Farmers get free electricity for irrigation pumps. BPL subsidy available.',
      websiteUrl: 'https://www.mahadiscom.in/',
    }
  });

  const msedclSlabs = [
    { minUnits: 0, maxUnits: 100, rate: 4.71, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, rate: 10.29, label: '101-300 units' },
    { minUnits: 301, maxUnits: 500, rate: 12.58, label: '301-500 units' },
    { minUnits: 501, maxUnits: null, rate: 13.54, label: '500+ units' },
  ];

  for (let i = 0; i < msedclSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...msedclSlabs[i], providerId: msedcl.id, sortOrder: i }
    });
  }

  const msedclFixed = [
    { minUnits: 0, maxUnits: 100, charge: 110, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, charge: 150, label: '101-300 units' },
    { minUnits: 301, maxUnits: null, charge: 175, label: '300+ units' },
  ];

  for (let i = 0; i < msedclFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...msedclFixed[i], providerId: msedcl.id, sortOrder: i }
    });
  }

  const msedclTips = [
    { tip: 'Stay below 100 units to get the lowest slab rate of ₹4.71/unit.', category: 'savings' },
    { tip: 'Maharashtra has high electricity duty (16%) - solar can help offset this.', category: 'solar' },
    { tip: 'Use ToD meters if available - off-peak rates are 20% lower.', category: 'peak_hours' },
  ];

  for (let i = 0; i < msedclTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...msedclTips[i], providerId: msedcl.id, sortOrder: i }
    });
  }

  console.log('✅ MSEDCL (Maharashtra) created');

  // BESCOM - Karnataka
  const bescom = await prisma.provider.create({
    data: {
      code: 'bescom',
      name: 'Bangalore Electricity Supply Company',
      shortName: 'BESCOM',
      aliases: ['BESCOM', 'Bangalore Electricity', 'Karnataka Electricity'],
      countryId: india.id,
      stateId: stateMap['KA'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.15,
      electricityDutyPct: 9,
      avgMonthlyUnits: 200,
      subsidyInfo: 'Bhagya Jyothi scheme provides free electricity up to 40 units for BPL families.',
      websiteUrl: 'https://bescom.karnataka.gov.in/',
    }
  });

  const bescomSlabs = [
    { minUnits: 0, maxUnits: 50, rate: 4.10, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, rate: 5.55, label: '51-100 units' },
    { minUnits: 101, maxUnits: 200, rate: 7.10, label: '101-200 units' },
    { minUnits: 201, maxUnits: 500, rate: 8.15, label: '201-500 units' },
    { minUnits: 501, maxUnits: null, rate: 9.00, label: '500+ units' },
  ];

  for (let i = 0; i < bescomSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...bescomSlabs[i], providerId: bescom.id, sortOrder: i }
    });
  }

  const bescomFixed = [
    { minUnits: 0, maxUnits: 50, charge: 45, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, charge: 65, label: '51-100 units' },
    { minUnits: 101, maxUnits: 200, charge: 85, label: '101-200 units' },
    { minUnits: 201, maxUnits: null, charge: 100, label: '200+ units' },
  ];

  for (let i = 0; i < bescomFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...bescomFixed[i], providerId: bescom.id, sortOrder: i }
    });
  }

  const bescomTips = [
    { tip: 'BESCOM has relatively lower rates - focus on staying under 200 units.', category: 'savings' },
    { tip: 'Karnataka offers 30% subsidy on rooftop solar installations.', category: 'solar' },
    { tip: 'Use BESCOM Mithra app to track daily consumption.', category: 'general' },
  ];

  for (let i = 0; i < bescomTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...bescomTips[i], providerId: bescom.id, sortOrder: i }
    });
  }

  console.log('✅ BESCOM (Karnataka) created');

  // TANGEDCO - Tamil Nadu
  const tangedco = await prisma.provider.create({
    data: {
      code: 'tangedco',
      name: 'Tamil Nadu Generation and Distribution Corporation',
      shortName: 'TANGEDCO',
      aliases: ['TANGEDCO', 'TNEB', 'Tamil Nadu Electricity', 'TN Electricity Board'],
      countryId: india.id,
      stateId: stateMap['TN'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.05,
      electricityDutyPct: 5,
      avgMonthlyUnits: 210,
      subsidyInfo: 'Free electricity up to 100 units for domestic consumers. Farmers get free power.',
      websiteUrl: 'https://www.tangedco.gov.in/',
    }
  });

  const tangedcoSlabs = [
    { minUnits: 0, maxUnits: 100, rate: 0, label: '0-100 units (Free)' },
    { minUnits: 101, maxUnits: 200, rate: 2.50, label: '101-200 units' },
    { minUnits: 201, maxUnits: 500, rate: 4.60, label: '201-500 units' },
    { minUnits: 501, maxUnits: null, rate: 6.60, label: '500+ units' },
  ];

  for (let i = 0; i < tangedcoSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...tangedcoSlabs[i], providerId: tangedco.id, sortOrder: i }
    });
  }

  const tangedcoFixed = [
    { minUnits: 0, maxUnits: 100, charge: 0, label: '0-100 units' },
    { minUnits: 101, maxUnits: 200, charge: 30, label: '101-200 units' },
    { minUnits: 201, maxUnits: null, charge: 50, label: '200+ units' },
  ];

  for (let i = 0; i < tangedcoFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...tangedcoFixed[i], providerId: tangedco.id, sortOrder: i }
    });
  }

  const tangedcoTips = [
    { tip: 'Tamil Nadu offers FREE electricity up to 100 units - stay under this for zero bill!', category: 'savings' },
    { tip: 'Even at 200 units, you only pay for 100 units at ₹2.50 each.', category: 'savings' },
    { tip: 'TN has one of the lowest electricity rates in India.', category: 'general' },
  ];

  for (let i = 0; i < tangedcoTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...tangedcoTips[i], providerId: tangedco.id, sortOrder: i }
    });
  }

  console.log('✅ TANGEDCO (Tamil Nadu) created');

  // BSES Delhi
  const bsesDelhi = await prisma.provider.create({
    data: {
      code: 'bses_delhi',
      name: 'BSES Rajdhani/Yamuna Power Limited',
      shortName: 'BSES',
      aliases: ['BSES', 'BSES Rajdhani', 'BSES Yamuna', 'Delhi Electricity'],
      countryId: india.id,
      stateId: stateMap['DL'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.20,
      electricityDutyPct: 8,
      avgMonthlyUnits: 250,
      peakHoursStart: '14:00',
      peakHoursEnd: '17:00',
      peakMultiplier: 1.2,
      subsidyInfo: 'Delhi govt provides subsidy up to 200 units. Free electricity up to 200 units for eligible consumers.',
      websiteUrl: 'https://www.bsesdelhi.com/',
    }
  });

  const bsesSlabs = [
    { minUnits: 0, maxUnits: 200, rate: 3.00, label: '0-200 units' },
    { minUnits: 201, maxUnits: 400, rate: 4.50, label: '201-400 units' },
    { minUnits: 401, maxUnits: 800, rate: 6.50, label: '401-800 units' },
    { minUnits: 801, maxUnits: 1200, rate: 7.00, label: '801-1200 units' },
    { minUnits: 1201, maxUnits: null, rate: 8.00, label: '1200+ units' },
  ];

  for (let i = 0; i < bsesSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...bsesSlabs[i], providerId: bsesDelhi.id, sortOrder: i }
    });
  }

  const bsesFixed = [
    { minUnits: 0, maxUnits: 200, charge: 25, label: '0-200 units' },
    { minUnits: 201, maxUnits: 400, charge: 50, label: '201-400 units' },
    { minUnits: 401, maxUnits: null, charge: 100, label: '400+ units' },
  ];

  for (let i = 0; i < bsesFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...bsesFixed[i], providerId: bsesDelhi.id, sortOrder: i }
    });
  }

  const bsesTips = [
    { tip: 'Delhi provides FREE electricity up to 200 units with govt subsidy.', category: 'savings' },
    { tip: 'Peak hours are 2PM-5PM in summer - avoid AC during this time.', category: 'peak_hours' },
    { tip: 'Apply for rooftop solar - Delhi offers additional incentives.', category: 'solar' },
  ];

  for (let i = 0; i < bsesTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...bsesTips[i], providerId: bsesDelhi.id, sortOrder: i }
    });
  }

  console.log('✅ BSES (Delhi) created');

  // Tata Power Mumbai
  const tataPower = await prisma.provider.create({
    data: {
      code: 'tata_power_mumbai',
      name: 'Tata Power Mumbai',
      shortName: 'Tata Power',
      aliases: ['Tata Power', 'Tata Electricity', 'TPC Mumbai'],
      countryId: india.id,
      stateId: stateMap['MH'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.12,
      electricityDutyPct: 16,
      avgMonthlyUnits: 250,
      peakHoursStart: '18:00',
      peakHoursEnd: '22:00',
      peakMultiplier: 1.5,
      subsidyInfo: 'ToD metering available with 20% discount during off-peak hours.',
      websiteUrl: 'https://www.tatapower.com/',
    }
  });

  const tataPowerSlabs = [
    { minUnits: 0, maxUnits: 100, rate: 3.79, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, rate: 6.52, label: '101-300 units' },
    { minUnits: 301, maxUnits: 500, rate: 9.64, label: '301-500 units' },
    { minUnits: 501, maxUnits: null, rate: 11.51, label: '500+ units' },
  ];

  for (let i = 0; i < tataPowerSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...tataPowerSlabs[i], providerId: tataPower.id, sortOrder: i }
    });
  }

  const tataPowerFixed = [
    { minUnits: 0, maxUnits: 100, charge: 85, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, charge: 150, label: '101-300 units' },
    { minUnits: 301, maxUnits: null, charge: 200, label: '300+ units' },
  ];

  for (let i = 0; i < tataPowerFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...tataPowerFixed[i], providerId: tataPower.id, sortOrder: i }
    });
  }

  const tataPowerTips = [
    { tip: 'Opt for ToD meter - get 20% off during 10PM-6AM.', category: 'peak_hours' },
    { tip: 'Tata Power offers green energy options at premium rates.', category: 'solar' },
    { tip: 'Use Tata Power app for real-time consumption tracking.', category: 'general' },
  ];

  for (let i = 0; i < tataPowerTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...tataPowerTips[i], providerId: tataPower.id, sortOrder: i }
    });
  }

  console.log('✅ Tata Power (Mumbai) created');

  // UGVCL - Gujarat
  const ugvcl = await prisma.provider.create({
    data: {
      code: 'ugvcl',
      name: 'Uttar Gujarat Vij Company Limited',
      shortName: 'UGVCL',
      aliases: ['UGVCL', 'Gujarat Electricity', 'GUVNL'],
      countryId: india.id,
      stateId: stateMap['GJ'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.10,
      electricityDutyPct: 15,
      avgMonthlyUnits: 230,
      subsidyInfo: 'Gujarat offers Surya Gujarat scheme for rooftop solar with attractive subsidies.',
      websiteUrl: 'https://www.ugvcl.com/',
    }
  });

  const ugvclSlabs = [
    { minUnits: 0, maxUnits: 50, rate: 3.20, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, rate: 3.70, label: '51-100 units' },
    { minUnits: 101, maxUnits: 250, rate: 4.60, label: '101-250 units' },
    { minUnits: 251, maxUnits: 500, rate: 5.20, label: '251-500 units' },
    { minUnits: 501, maxUnits: null, rate: 5.50, label: '500+ units' },
  ];

  for (let i = 0; i < ugvclSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...ugvclSlabs[i], providerId: ugvcl.id, sortOrder: i }
    });
  }

  const ugvclFixed = [
    { minUnits: 0, maxUnits: 100, charge: 30, label: '0-100 units' },
    { minUnits: 101, maxUnits: 250, charge: 50, label: '101-250 units' },
    { minUnits: 251, maxUnits: null, charge: 80, label: '250+ units' },
  ];

  for (let i = 0; i < ugvclFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...ugvclFixed[i], providerId: ugvcl.id, sortOrder: i }
    });
  }

  const ugvclTips = [
    { tip: 'Gujarat has competitive rates - focus on solar for maximum savings.', category: 'solar' },
    { tip: 'Surya Gujarat scheme offers up to ₹20,000 subsidy for rooftop solar.', category: 'solar' },
    { tip: 'Industrial consumers can opt for open access for cheaper power.', category: 'general' },
  ];

  for (let i = 0; i < ugvclTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...ugvclTips[i], providerId: ugvcl.id, sortOrder: i }
    });
  }

  console.log('✅ UGVCL (Gujarat) created');

  // UPPCL - Uttar Pradesh
  const uppcl = await prisma.provider.create({
    data: {
      code: 'uppcl',
      name: 'Uttar Pradesh Power Corporation Limited',
      shortName: 'UPPCL',
      aliases: ['UPPCL', 'UP Electricity', 'UP Power'],
      countryId: india.id,
      stateId: stateMap['UP'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.08,
      electricityDutyPct: 5,
      avgMonthlyUnits: 180,
      subsidyInfo: 'Free electricity for farmers. BPL families get subsidized rates.',
      websiteUrl: 'https://www.uppclonline.com/',
    }
  });

  const uppclSlabs = [
    { minUnits: 0, maxUnits: 100, rate: 3.50, label: '0-100 units' },
    { minUnits: 101, maxUnits: 150, rate: 4.00, label: '101-150 units' },
    { minUnits: 151, maxUnits: 300, rate: 5.00, label: '151-300 units' },
    { minUnits: 301, maxUnits: 500, rate: 5.50, label: '301-500 units' },
    { minUnits: 501, maxUnits: null, rate: 6.00, label: '500+ units' },
  ];

  for (let i = 0; i < uppclSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...uppclSlabs[i], providerId: uppcl.id, sortOrder: i }
    });
  }

  const uppclFixed = [
    { minUnits: 0, maxUnits: 100, charge: 50, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, charge: 90, label: '101-300 units' },
    { minUnits: 301, maxUnits: null, charge: 130, label: '300+ units' },
  ];

  for (let i = 0; i < uppclFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...uppclFixed[i], providerId: uppcl.id, sortOrder: i }
    });
  }

  const uppclTips = [
    { tip: 'UP has relatively low rates - stay under 150 units for best value.', category: 'savings' },
    { tip: 'PM Surya Ghar scheme offers ₹30,000 subsidy for 2kW solar.', category: 'solar' },
    { tip: 'Use prepaid meters to track consumption in real-time.', category: 'general' },
  ];

  for (let i = 0; i < uppclTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...uppclTips[i], providerId: uppcl.id, sortOrder: i }
    });
  }

  console.log('✅ UPPCL (Uttar Pradesh) created');

  // PSPCL - Punjab
  const pspcl = await prisma.provider.create({
    data: {
      code: 'pspcl',
      name: 'Punjab State Power Corporation Limited',
      shortName: 'PSPCL',
      aliases: ['PSPCL', 'Punjab Electricity', 'Punjab Power'],
      countryId: india.id,
      stateId: stateMap['PB'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.12,
      electricityDutyPct: 5,
      avgMonthlyUnits: 220,
      subsidyInfo: 'Free electricity for farmers. 200 units free for SC/BC families.',
      websiteUrl: 'https://www.pspcl.in/',
    }
  });

  const pspclSlabs = [
    { minUnits: 0, maxUnits: 100, rate: 4.19, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, rate: 5.59, label: '101-300 units' },
    { minUnits: 301, maxUnits: 500, rate: 6.89, label: '301-500 units' },
    { minUnits: 501, maxUnits: null, rate: 7.39, label: '500+ units' },
  ];

  for (let i = 0; i < pspclSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...pspclSlabs[i], providerId: pspcl.id, sortOrder: i }
    });
  }

  const pspclFixed = [
    { minUnits: 0, maxUnits: 100, charge: 35, label: '0-100 units' },
    { minUnits: 101, maxUnits: 300, charge: 70, label: '101-300 units' },
    { minUnits: 301, maxUnits: null, charge: 100, label: '300+ units' },
  ];

  for (let i = 0; i < pspclFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...pspclFixed[i], providerId: pspcl.id, sortOrder: i }
    });
  }

  const pspclTips = [
    { tip: 'Punjab offers generous subsidies - check eligibility for free units.', category: 'savings' },
    { tip: 'Solar is highly recommended given Punjab\'s sunny climate.', category: 'solar' },
    { tip: 'Use PSPCL app for bill payment and consumption tracking.', category: 'general' },
  ];

  for (let i = 0; i < pspclTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...pspclTips[i], providerId: pspcl.id, sortOrder: i }
    });
  }

  console.log('✅ PSPCL (Punjab) created');

  // TSSPDCL - Telangana
  const tsspdcl = await prisma.provider.create({
    data: {
      code: 'tsspdcl',
      name: 'Telangana State Southern Power Distribution Company',
      shortName: 'TSSPDCL',
      aliases: ['TSSPDCL', 'Telangana Electricity', 'TS Power'],
      countryId: india.id,
      stateId: stateMap['TS'].id,
      tariffType: 'tiered',
      currency: 'INR',
      fuelSurchargePerUnit: 0.10,
      electricityDutyPct: 6,
      avgMonthlyUnits: 210,
      subsidyInfo: 'Free electricity for farmers. BPL families get 100 units free.',
      websiteUrl: 'https://www.tssouthernpower.com/',
    }
  });

  const tsspdclSlabs = [
    { minUnits: 0, maxUnits: 50, rate: 1.95, label: '0-50 units' },
    { minUnits: 51, maxUnits: 100, rate: 3.20, label: '51-100 units' },
    { minUnits: 101, maxUnits: 200, rate: 5.30, label: '101-200 units' },
    { minUnits: 201, maxUnits: 300, rate: 7.50, label: '201-300 units' },
    { minUnits: 301, maxUnits: 500, rate: 8.75, label: '301-500 units' },
    { minUnits: 501, maxUnits: null, rate: 9.50, label: '500+ units' },
  ];

  for (let i = 0; i < tsspdclSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...tsspdclSlabs[i], providerId: tsspdcl.id, sortOrder: i }
    });
  }

  const tsspdclFixed = [
    { minUnits: 0, maxUnits: 100, charge: 30, label: '0-100 units' },
    { minUnits: 101, maxUnits: 200, charge: 50, label: '101-200 units' },
    { minUnits: 201, maxUnits: null, charge: 75, label: '200+ units' },
  ];

  for (let i = 0; i < tsspdclFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...tsspdclFixed[i], providerId: tsspdcl.id, sortOrder: i }
    });
  }

  const tsspdclTips = [
    { tip: 'Telangana has very low rates for first 50 units (₹1.95) - optimize usage.', category: 'savings' },
    { tip: 'Stay under 100 units for the best effective rate.', category: 'savings' },
    { tip: 'Hyderabad has excellent solar potential - consider rooftop installation.', category: 'solar' },
  ];

  for (let i = 0; i < tsspdclTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...tsspdclTips[i], providerId: tsspdcl.id, sortOrder: i }
    });
  }

  console.log('✅ TSSPDCL (Telangana) created');

  // ============ US PROVIDERS ============

  // PG&E - California
  const pge = await prisma.provider.create({
    data: {
      code: 'pge',
      name: 'Pacific Gas and Electric Company',
      shortName: 'PG&E',
      aliases: ['PG&E', 'Pacific Gas', 'PGE California'],
      countryId: usa.id,
      stateId: usStateMap['CA'].id,
      tariffType: 'tiered',
      currency: 'USD',
      fuelSurchargePerUnit: 0,
      electricityDutyPct: 0,
      avgMonthlyUnits: 550,
      peakHoursStart: '16:00',
      peakHoursEnd: '21:00',
      peakMultiplier: 1.5,
      subsidyInfo: 'CARE program offers 20% discount for low-income households. FERA offers 18% discount.',
      websiteUrl: 'https://www.pge.com/',
    }
  });

  const pgeSlabs = [
    { minUnits: 0, maxUnits: 400, rate: 0.25, label: 'Baseline (0-400 kWh)' },
    { minUnits: 401, maxUnits: null, rate: 0.35, label: 'Over Baseline (400+ kWh)' },
  ];

  for (let i = 0; i < pgeSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...pgeSlabs[i], providerId: pge.id, sortOrder: i }
    });
  }

  const pgeFixed = [
    { minUnits: 0, maxUnits: null, charge: 10, label: 'Monthly service fee' },
  ];

  for (let i = 0; i < pgeFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...pgeFixed[i], providerId: pge.id, sortOrder: i }
    });
  }

  const pgeTips = [
    { tip: 'Stay within baseline allocation (400 kWh) to avoid higher tier rates.', category: 'savings' },
    { tip: 'Peak hours are 4PM-9PM - shift heavy usage to off-peak for ToU plans.', category: 'peak_hours' },
    { tip: 'California offers generous solar incentives - NEM 3.0 available.', category: 'solar' },
  ];

  for (let i = 0; i < pgeTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...pgeTips[i], providerId: pge.id, sortOrder: i }
    });
  }

  console.log('✅ PG&E (California) created');

  // ConEd - New York
  const coned = await prisma.provider.create({
    data: {
      code: 'coned',
      name: 'Consolidated Edison',
      shortName: 'Con Edison',
      aliases: ['ConEd', 'Con Edison', 'Consolidated Edison'],
      countryId: usa.id,
      stateId: usStateMap['NY'].id,
      tariffType: 'flat',
      currency: 'USD',
      fuelSurchargePerUnit: 0.02,
      electricityDutyPct: 2.5,
      avgMonthlyUnits: 600,
      peakHoursStart: '14:00',
      peakHoursEnd: '18:00',
      peakMultiplier: 1.3,
      subsidyInfo: 'Low Income Program offers bill credits. Energy Affordability Program available.',
      websiteUrl: 'https://www.coned.com/',
    }
  });

  const conedSlabs = [
    { minUnits: 0, maxUnits: null, rate: 0.22, label: 'Standard Rate' },
  ];

  for (let i = 0; i < conedSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...conedSlabs[i], providerId: coned.id, sortOrder: i }
    });
  }

  const conedFixed = [
    { minUnits: 0, maxUnits: null, charge: 16, label: 'Basic service charge' },
  ];

  for (let i = 0; i < conedFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...conedFixed[i], providerId: coned.id, sortOrder: i }
    });
  }

  const conedTips = [
    { tip: 'NYC has high electricity rates - focus on efficiency upgrades.', category: 'savings' },
    { tip: 'ConEd offers rebates for smart thermostats and efficient appliances.', category: 'appliance' },
    { tip: 'Consider community solar if rooftop installation is not possible.', category: 'solar' },
  ];

  for (let i = 0; i < conedTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...conedTips[i], providerId: coned.id, sortOrder: i }
    });
  }

  console.log('✅ Con Edison (New York) created');

  // TXU Energy - Texas
  const txu = await prisma.provider.create({
    data: {
      code: 'txu',
      name: 'TXU Energy',
      shortName: 'TXU',
      aliases: ['TXU', 'TXU Energy', 'Texas Utilities'],
      countryId: usa.id,
      stateId: usStateMap['TX'].id,
      tariffType: 'flat',
      currency: 'USD',
      fuelSurchargePerUnit: 0,
      electricityDutyPct: 0,
      avgMonthlyUnits: 1200,
      subsidyInfo: 'Texas has deregulated market - shop for best rates. LITE-UP Texas for low-income.',
      websiteUrl: 'https://www.txu.com/',
    }
  });

  const txuSlabs = [
    { minUnits: 0, maxUnits: null, rate: 0.11, label: 'Fixed Rate Plan' },
  ];

  for (let i = 0; i < txuSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...txuSlabs[i], providerId: txu.id, sortOrder: i }
    });
  }

  const txuFixed = [
    { minUnits: 0, maxUnits: null, charge: 9.95, label: 'Base charge' },
  ];

  for (let i = 0; i < txuFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...txuFixed[i], providerId: txu.id, sortOrder: i }
    });
  }

  const txuTips = [
    { tip: 'Texas is deregulated - compare rates at PowerToChoose.org.', category: 'savings' },
    { tip: 'Lock in fixed rates before summer when prices spike.', category: 'savings' },
    { tip: 'Texas has excellent solar potential - no state income tax on solar savings.', category: 'solar' },
  ];

  for (let i = 0; i < txuTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...txuTips[i], providerId: txu.id, sortOrder: i }
    });
  }

  console.log('✅ TXU Energy (Texas) created');

  // ============ UK PROVIDERS ============

  // British Gas
  const britishGas = await prisma.provider.create({
    data: {
      code: 'british_gas',
      name: 'British Gas',
      shortName: 'British Gas',
      aliases: ['British Gas', 'Centrica', 'BG'],
      countryId: uk.id,
      stateId: ukRegionMap['ENG'].id,
      tariffType: 'flat',
      currency: 'GBP',
      fuelSurchargePerUnit: 0,
      electricityDutyPct: 5,
      avgMonthlyUnits: 280,
      subsidyInfo: 'Warm Home Discount provides £150 rebate. Priority Services Register available.',
      websiteUrl: 'https://www.britishgas.co.uk/',
    }
  });

  const bgSlabs = [
    { minUnits: 0, maxUnits: null, rate: 0.28, label: 'Standard Variable Rate' },
  ];

  for (let i = 0; i < bgSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...bgSlabs[i], providerId: britishGas.id, sortOrder: i }
    });
  }

  const bgFixed = [
    { minUnits: 0, maxUnits: null, charge: 0.50, label: 'Daily standing charge' },
  ];

  for (let i = 0; i < bgFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...bgFixed[i], providerId: britishGas.id, sortOrder: i }
    });
  }

  const bgTips = [
    { tip: 'UK energy prices are capped - check Ofgem price cap rates.', category: 'savings' },
    { tip: 'Switch to a fixed tariff to protect against price increases.', category: 'savings' },
    { tip: 'Smart Export Guarantee (SEG) pays for solar exports.', category: 'solar' },
  ];

  for (let i = 0; i < bgTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...bgTips[i], providerId: britishGas.id, sortOrder: i }
    });
  }

  console.log('✅ British Gas (UK) created');

  // Octopus Energy
  const octopus = await prisma.provider.create({
    data: {
      code: 'octopus',
      name: 'Octopus Energy',
      shortName: 'Octopus',
      aliases: ['Octopus', 'Octopus Energy'],
      countryId: uk.id,
      stateId: ukRegionMap['ENG'].id,
      tariffType: 'flat',
      currency: 'GBP',
      fuelSurchargePerUnit: 0,
      electricityDutyPct: 5,
      avgMonthlyUnits: 280,
      peakHoursStart: '16:00',
      peakHoursEnd: '19:00',
      peakMultiplier: 1.4,
      subsidyInfo: 'Agile tariff offers variable rates. Go tariff for EV owners.',
      websiteUrl: 'https://octopus.energy/',
    }
  });

  const octopusSlabs = [
    { minUnits: 0, maxUnits: null, rate: 0.24, label: 'Flexible Octopus Rate' },
  ];

  for (let i = 0; i < octopusSlabs.length; i++) {
    await prisma.tariffSlab.create({
      data: { ...octopusSlabs[i], providerId: octopus.id, sortOrder: i }
    });
  }

  const octopusFixed = [
    { minUnits: 0, maxUnits: null, charge: 0.47, label: 'Daily standing charge' },
  ];

  for (let i = 0; i < octopusFixed.length; i++) {
    await prisma.fixedCharge.create({
      data: { ...octopusFixed[i], providerId: octopus.id, sortOrder: i }
    });
  }

  const octopusTips = [
    { tip: 'Octopus Agile tariff can save money if you shift usage to off-peak.', category: 'peak_hours' },
    { tip: 'Octopus Go is excellent for EV owners - cheap overnight charging.', category: 'savings' },
    { tip: 'Refer friends to earn £50 credit each.', category: 'general' },
  ];

  for (let i = 0; i < octopusTips.length; i++) {
    await prisma.providerTip.create({
      data: { ...octopusTips[i], providerId: octopus.id, sortOrder: i }
    });
  }

  console.log('✅ Octopus Energy (UK) created');

  console.log('\n🎉 Database seeding completed!');
  console.log(`   - 3 Countries`);
  console.log(`   - ${indianStates.length} Indian States`);
  console.log(`   - ${usStates.length} US States`);
  console.log(`   - ${ukRegions.length} UK Regions`);
  console.log(`   - 15 Electricity Providers with tariffs, fixed charges, and tips`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
