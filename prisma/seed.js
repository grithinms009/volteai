const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// PROVIDER DATA (all countries)
// ============================================================
const PROVIDER_DATA = [
  // ============ INDIA ============
  {
    code: 'kseb', name: 'Kerala State Electricity Board', shortName: 'KSEB',
    aliases: ['KSEB', 'KSEBL', 'Kerala Electricity', 'KSE Board'],
    stateCode: 'KL', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.10, electricityDutyPct: 10, avgMonthlyUnits: 180,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'BPL households get subsidized rates. Solar rooftop net metering available at ₹3.22/unit buyback.',
    websiteUrl: 'https://wss.kseb.in/',
    slabs: [
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
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 35, label: '0-50 units' },
      { minUnits: 51, maxUnits: 100, charge: 55, label: '51-100 units' },
      { minUnits: 101, maxUnits: 150, charge: 75, label: '101-150 units' },
      { minUnits: 151, maxUnits: 200, charge: 100, label: '151-200 units' },
      { minUnits: 201, maxUnits: 250, charge: 125, label: '201-250 units' },
      { minUnits: 251, maxUnits: 300, charge: 135, label: '251-300 units' },
      { minUnits: 301, maxUnits: 400, charge: 150, label: '301-400 units' },
      { minUnits: 401, maxUnits: null, charge: 175, label: '400+ units' },
    ],
    tips: [
      { tip: 'Keep consumption below 200 units to stay in lower slabs and avoid the steep 201-250 slab rate.', category: 'savings' },
      { tip: 'KSEB offers net metering for solar - excess power credited at ₹3.22/unit.', category: 'solar' },
      { tip: 'Use 5-star rated appliances to reduce consumption by 20-30%.', category: 'appliance' },
      { tip: 'Consider solar water heater - saves 2-3 units daily.', category: 'solar' },
    ],
  },
  {
    code: 'msedcl', name: 'Maharashtra State Electricity Distribution Co. Ltd', shortName: 'MSEDCL',
    aliases: ['MSEDCL', 'Mahavitaran', 'MSEB', 'Maharashtra Electricity'],
    stateCode: 'MH', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.08, electricityDutyPct: 16, avgMonthlyUnits: 220,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Farmers get free electricity for irrigation pumps. BPL subsidy available.',
    websiteUrl: 'https://www.mahadiscom.in/',
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 4.71, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, rate: 10.29, label: '101-300 units' },
      { minUnits: 301, maxUnits: 500, rate: 12.58, label: '301-500 units' },
      { minUnits: 501, maxUnits: null, rate: 13.54, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 110, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, charge: 150, label: '101-300 units' },
      { minUnits: 301, maxUnits: null, charge: 175, label: '300+ units' },
    ],
    tips: [
      { tip: 'Stay below 100 units to get the lowest slab rate of ₹4.71/unit.', category: 'savings' },
      { tip: 'Maharashtra has high electricity duty (16%) - solar can help offset this.', category: 'solar' },
      { tip: 'Use ToD meters if available - off-peak rates are 20% lower.', category: 'peak_hours' },
    ],
  },
  {
    code: 'bescom', name: 'Bangalore Electricity Supply Company', shortName: 'BESCOM',
    aliases: ['BESCOM', 'Bangalore Electricity', 'Karnataka Electricity'],
    stateCode: 'KA', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.15, electricityDutyPct: 9, avgMonthlyUnits: 200,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Bhagya Jyothi scheme provides free electricity up to 40 units for BPL families.',
    websiteUrl: 'https://bescom.karnataka.gov.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.10, label: '0-50 units' },
      { minUnits: 51, maxUnits: 100, rate: 5.55, label: '51-100 units' },
      { minUnits: 101, maxUnits: 200, rate: 7.10, label: '101-200 units' },
      { minUnits: 201, maxUnits: 500, rate: 8.15, label: '201-500 units' },
      { minUnits: 501, maxUnits: null, rate: 9.00, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 45, label: '0-50 units' },
      { minUnits: 51, maxUnits: 100, charge: 65, label: '51-100 units' },
      { minUnits: 101, maxUnits: 200, charge: 85, label: '101-200 units' },
      { minUnits: 201, maxUnits: null, charge: 100, label: '200+ units' },
    ],
    tips: [
      { tip: 'BESCOM has relatively lower rates - focus on staying under 200 units.', category: 'savings' },
      { tip: 'Karnataka offers 30% subsidy on rooftop solar installations.', category: 'solar' },
      { tip: 'Use BESCOM Mithra app to track daily consumption.', category: 'general' },
    ],
  },
  {
    code: 'tangedco', name: 'Tamil Nadu Generation and Distribution Corporation', shortName: 'TANGEDCO',
    aliases: ['TANGEDCO', 'TNEB', 'Tamil Nadu Electricity', 'TN Electricity Board'],
    stateCode: 'TN', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.05, electricityDutyPct: 5, avgMonthlyUnits: 210,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Free electricity up to 100 units for domestic consumers. Farmers get free power.',
    websiteUrl: 'https://www.tangedco.gov.in/',
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 0, label: '0-100 units (Free)' },
      { minUnits: 101, maxUnits: 200, rate: 2.50, label: '101-200 units' },
      { minUnits: 201, maxUnits: 500, rate: 4.60, label: '201-500 units' },
      { minUnits: 501, maxUnits: null, rate: 6.60, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 0, label: '0-100 units' },
      { minUnits: 101, maxUnits: 200, charge: 30, label: '101-200 units' },
      { minUnits: 201, maxUnits: null, charge: 50, label: '200+ units' },
    ],
    tips: [
      { tip: 'Tamil Nadu offers FREE electricity up to 100 units - stay under this for zero bill!', category: 'savings' },
      { tip: 'Even at 200 units, you only pay for 100 units at ₹2.50 each.', category: 'savings' },
      { tip: 'TN has one of the lowest electricity rates in India.', category: 'general' },
    ],
  },
  {
    code: 'bses_delhi', name: 'BSES Rajdhani/Yamuna Power Limited', shortName: 'BSES',
    aliases: ['BSES', 'BSES Rajdhani', 'BSES Yamuna', 'Delhi Electricity'],
    stateCode: 'DL', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.20, electricityDutyPct: 8, avgMonthlyUnits: 250,
    peakHoursStart: '14:00', peakHoursEnd: '17:00', peakMultiplier: 1.2,
    subsidyInfo: 'Delhi govt provides subsidy up to 200 units. Free electricity up to 200 units for eligible consumers.',
    websiteUrl: 'https://www.bsesdelhi.com/',
    slabs: [
      { minUnits: 0, maxUnits: 200, rate: 3.00, label: '0-200 units' },
      { minUnits: 201, maxUnits: 400, rate: 4.50, label: '201-400 units' },
      { minUnits: 401, maxUnits: 800, rate: 6.50, label: '401-800 units' },
      { minUnits: 801, maxUnits: 1200, rate: 7.00, label: '801-1200 units' },
      { minUnits: 1201, maxUnits: null, rate: 8.00, label: '1200+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 200, charge: 25, label: '0-200 units' },
      { minUnits: 201, maxUnits: 400, charge: 50, label: '201-400 units' },
      { minUnits: 401, maxUnits: null, charge: 100, label: '400+ units' },
    ],
    tips: [
      { tip: 'Delhi provides FREE electricity up to 200 units with govt subsidy.', category: 'savings' },
      { tip: 'Peak hours are 2PM-5PM in summer - avoid AC during this time.', category: 'peak_hours' },
      { tip: 'Apply for rooftop solar - Delhi offers additional incentives.', category: 'solar' },
    ],
  },
  {
    code: 'tata_power_mumbai', name: 'Tata Power Mumbai', shortName: 'Tata Power',
    aliases: ['Tata Power', 'Tata Electricity', 'TPC Mumbai'],
    stateCode: 'MH', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.12, electricityDutyPct: 16, avgMonthlyUnits: 250,
    peakHoursStart: '18:00', peakHoursEnd: '22:00', peakMultiplier: 1.5,
    subsidyInfo: 'ToD metering available with 20% discount during off-peak hours.',
    websiteUrl: 'https://www.tatapower.com/',
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 3.79, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, rate: 6.52, label: '101-300 units' },
      { minUnits: 301, maxUnits: 500, rate: 9.64, label: '301-500 units' },
      { minUnits: 501, maxUnits: null, rate: 11.51, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 85, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, charge: 150, label: '101-300 units' },
      { minUnits: 301, maxUnits: null, charge: 200, label: '300+ units' },
    ],
    tips: [
      { tip: 'Opt for ToD meter - get 20% off during 10PM-6AM.', category: 'peak_hours' },
      { tip: 'Tata Power offers green energy options at premium rates.', category: 'solar' },
      { tip: 'Use Tata Power app for real-time consumption tracking.', category: 'general' },
    ],
  },
  {
    code: 'ugvcl', name: 'Uttar Gujarat Vij Company Limited', shortName: 'UGVCL',
    aliases: ['UGVCL', 'Gujarat Electricity', 'GUVNL'],
    stateCode: 'GJ', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.10, electricityDutyPct: 15, avgMonthlyUnits: 230,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Gujarat offers Surya Gujarat scheme for rooftop solar with attractive subsidies.',
    websiteUrl: 'https://www.ugvcl.com/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.20, label: '0-50 units' },
      { minUnits: 51, maxUnits: 100, rate: 3.70, label: '51-100 units' },
      { minUnits: 101, maxUnits: 250, rate: 4.60, label: '101-250 units' },
      { minUnits: 251, maxUnits: 500, rate: 5.20, label: '251-500 units' },
      { minUnits: 501, maxUnits: null, rate: 5.50, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 30, label: '0-100 units' },
      { minUnits: 101, maxUnits: 250, charge: 50, label: '101-250 units' },
      { minUnits: 251, maxUnits: null, charge: 80, label: '250+ units' },
    ],
    tips: [
      { tip: 'Gujarat has competitive rates - focus on solar for maximum savings.', category: 'solar' },
      { tip: 'Surya Gujarat scheme offers up to ₹20,000 subsidy for rooftop solar.', category: 'solar' },
      { tip: 'Industrial consumers can opt for open access for cheaper power.', category: 'general' },
    ],
  },
  {
    code: 'uppcl', name: 'Uttar Pradesh Power Corporation Limited', shortName: 'UPPCL',
    aliases: ['UPPCL', 'UP Electricity', 'UP Power'],
    stateCode: 'UP', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.08, electricityDutyPct: 5, avgMonthlyUnits: 180,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Free electricity for farmers. BPL families get subsidized rates.',
    websiteUrl: 'https://www.uppclonline.com/',
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 3.50, label: '0-100 units' },
      { minUnits: 101, maxUnits: 150, rate: 4.00, label: '101-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 5.00, label: '151-300 units' },
      { minUnits: 301, maxUnits: 500, rate: 5.50, label: '301-500 units' },
      { minUnits: 501, maxUnits: null, rate: 6.00, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 50, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, charge: 90, label: '101-300 units' },
      { minUnits: 301, maxUnits: null, charge: 130, label: '300+ units' },
    ],
    tips: [
      { tip: 'UP has relatively low rates - stay under 150 units for best value.', category: 'savings' },
      { tip: 'PM Surya Ghar scheme offers ₹30,000 subsidy for 2kW solar.', category: 'solar' },
      { tip: 'Use prepaid meters to track consumption in real-time.', category: 'general' },
    ],
  },
  {
    code: 'pspcl', name: 'Punjab State Power Corporation Limited', shortName: 'PSPCL',
    aliases: ['PSPCL', 'Punjab Electricity', 'Punjab Power'],
    stateCode: 'PB', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.12, electricityDutyPct: 5, avgMonthlyUnits: 220,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Free electricity for farmers. 200 units free for SC/BC families.',
    websiteUrl: 'https://www.pspcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 4.19, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, rate: 5.59, label: '101-300 units' },
      { minUnits: 301, maxUnits: 500, rate: 6.89, label: '301-500 units' },
      { minUnits: 501, maxUnits: null, rate: 7.39, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 35, label: '0-100 units' },
      { minUnits: 101, maxUnits: 300, charge: 70, label: '101-300 units' },
      { minUnits: 301, maxUnits: null, charge: 100, label: '300+ units' },
    ],
    tips: [
      { tip: 'Punjab offers generous subsidies - check eligibility for free units.', category: 'savings' },
      { tip: 'Solar is highly recommended given Punjab\'s sunny climate.', category: 'solar' },
      { tip: 'Use PSPCL app for bill payment and consumption tracking.', category: 'general' },
    ],
  },
  {
    code: 'tsspdcl', name: 'Telangana State Southern Power Distribution Company', shortName: 'TSSPDCL',
    aliases: ['TSSPDCL', 'Telangana Electricity', 'TS Power'],
    stateCode: 'TS', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 0.10, electricityDutyPct: 6, avgMonthlyUnits: 210,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Free electricity for farmers. BPL families get 100 units free.',
    websiteUrl: 'https://www.tssouthernpower.com/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 1.95, label: '0-50 units' },
      { minUnits: 51, maxUnits: 100, rate: 3.20, label: '51-100 units' },
      { minUnits: 101, maxUnits: 200, rate: 5.30, label: '101-200 units' },
      { minUnits: 201, maxUnits: 300, rate: 7.50, label: '201-300 units' },
      { minUnits: 301, maxUnits: 500, rate: 8.75, label: '301-500 units' },
      { minUnits: 501, maxUnits: null, rate: 9.50, label: '500+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 30, label: '0-100 units' },
      { minUnits: 101, maxUnits: 200, charge: 50, label: '101-200 units' },
      { minUnits: 201, maxUnits: null, charge: 75, label: '200+ units' },
    ],
    tips: [
      { tip: 'Telangana has very low rates for first 50 units (₹1.95) - optimize usage.', category: 'savings' },
      { tip: 'Stay under 100 units for the best effective rate.', category: 'savings' },
      { tip: 'Hyderabad has excellent solar potential - consider rooftop installation.', category: 'solar' },
    ],
  },
  // New Indian providers from Claude/Gemini
  {
    code: 'jvvnl', name: 'Jaipur Vidyut Vitran Nigam Limited', shortName: 'JVVNL',
    aliases: ['JVVNL', 'Jaipur Electricity', 'Rajasthan Electricity', 'Jaipur Vidyut'],
    stateCode: 'RJ', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.20, electricityDutyPct: 8, avgMonthlyUnits: 200,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Free electricity for BPL families up to 50 units/month. Rajasthan Grih Jyoti Yojana: free 100 units for households with <₹1L annual income.',
    websiteUrl: 'https://www.jvvnl.com/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.85, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.30, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.95, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.50, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 40, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 70, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 100, label: '150+ units' },
    ],
    tips: [
      { tip: 'Keep consumption below 50 units for lowest slab rate of ₹3.85/unit.', category: 'savings' },
      { tip: 'Rajasthan has excellent solar potential - rooftop solar ROI under 4 years.', category: 'solar' },
      { tip: 'Apply for PM Surya Ghar scheme to get ₹30,000 subsidy for 2kW solar system.', category: 'solar' },
    ],
  },
  {
    code: 'wbsedcl', name: 'West Bengal State Electricity Distribution Company Limited', shortName: 'WBSEDCL',
    aliases: ['WBSEDCL', 'West Bengal Electricity', 'WBSEDC'],
    stateCode: 'WB', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.35, electricityDutyPct: 10, avgMonthlyUnits: 220,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Lifeline tariff: free 10 units/month for BPL families. Kanyashree Prakalpa: additional discount for girl child households.',
    websiteUrl: 'https://www.wbsedcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.50, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 6.20, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 7.85, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 8.50, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 50, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 80, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 120, label: '150+ units' },
    ],
    tips: [
      { tip: 'West Bengal offers highest BPL subsidies in India - check eligibility.', category: 'savings' },
      { tip: 'Use fans and coolers instead of AC during monsoon (June-Sept) to save ₹300-500/month.', category: 'savings' },
      { tip: 'Run water heater 5-7 AM when consumption is lowest - saves 20% on heater costs.', category: 'savings' },
    ],
  },
  {
    code: 'apepdcl', name: 'Andhra Pradesh Eastern Power Distribution Company Limited', shortName: 'APEPDCL',
    aliases: ['APEPDCL', 'AP Eastern Electricity', 'Eastern Power Distribution'],
    stateCode: 'AP', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.15, electricityDutyPct: 6, avgMonthlyUnits: 250,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Subsidised rates for farmers (agriculture pump sets). Zero electricity for BPL cardholders up to 50 units.',
    websiteUrl: 'https://apepdcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.25, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 4.75, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.50, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.75, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 35, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 65, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 95, label: '150+ units' },
    ],
    tips: [
      { tip: 'Andhra Pradesh has one of the lowest tariff rates in India.', category: 'savings' },
      { tip: 'Solar power popular here - 350+ sunny days/year. Check NTPC solar schemes.', category: 'solar' },
      { tip: 'Use ceiling fans (30W) instead of AC (1500W) - saves ₹1200-1500/month during summer.', category: 'appliance' },
    ],
  },
  {
    code: 'dhbvn', name: 'Dakshin Haryana Bijli Vitran Nigam Limited', shortName: 'DHBVN',
    aliases: ['DHBVN', 'South Haryana Electricity', 'Haryana Southern Electricity'],
    stateCode: 'HR', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.40, electricityDutyPct: 9, avgMonthlyUnits: 240,
    peakHoursStart: '17:00', peakHoursEnd: '22:00', peakMultiplier: 1.20,
    subsidyInfo: 'Haryana Parivar Anudan Scheme: ₹2000/month subsidy for households with <₹1.8L annual income.',
    websiteUrl: 'https://www.dhbvn.org.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.20, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.75, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 7.25, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 8.00, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 45, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 75, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 110, label: '150+ units' },
    ],
    tips: [
      { tip: 'ToD tariff with 20% peak surcharge 5-10 PM - shift AC use to 10 PM-5 AM.', category: 'peak_hours' },
      { tip: 'Old refrigerators (>8 years) use 2x more electricity - replacement pays back in 3 years.', category: 'appliance' },
      { tip: 'Install smart meter to monitor real-time consumption and identify peak hour wastage.', category: 'general' },
    ],
  },
  {
    code: 'mppkvvcl', name: 'Madhya Pradesh Poorv Kshetra Vidyut Vitran Company Limited', shortName: 'MPPKVVCL',
    aliases: ['MPPKVVCL', 'Madhya Pradesh Eastern Electricity', 'MP Electricity'],
    stateCode: 'MP', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.10, electricityDutyPct: 7, avgMonthlyUnits: 210,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'BPL families get 50 units free/month.',
    websiteUrl: 'https://www.mppkvvcl.com/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.95, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.50, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 7.10, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.70, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 42, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 72, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 105, label: '150+ units' },
    ],
    tips: [
      { tip: 'MP has good renewable energy infrastructure - solar capacity among top in India.', category: 'solar' },
      { tip: 'Keep AC temperature at 26°C instead of 22°C - saves 20% on cooling bills.', category: 'appliance' },
      { tip: 'Shift heavy appliance use to early morning hours for load balancing benefit.', category: 'savings' },
    ],
  },
  {
    code: 'nbpdcl', name: 'North Bihar Power Distribution Company Limited', shortName: 'NBPDCL',
    aliases: ['NBPDCL', 'North Bihar Electricity', 'Bihar Northern Electricity'],
    stateCode: 'BR', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.50, electricityDutyPct: 11, avgMonthlyUnits: 190,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Mukhyamantri Bijli Har Ghar Yojana: free electricity to BPL households up to 100 units/month.',
    websiteUrl: 'https://nbpdcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.50, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 4.95, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.75, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.40, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 38, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 68, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 100, label: '150+ units' },
    ],
    tips: [
      { tip: 'Bihar offers generous subsidies for BPL families - up to 100 free units/month.', category: 'savings' },
      { tip: 'Monsoon months (June-Sept) use naturally cooled homes - turn off AC, open windows.', category: 'savings' },
      { tip: 'Check if eligible for govt subsidy - BPL families can get nearly free electricity.', category: 'savings' },
    ],
  },
  {
    code: 'tpcodl', name: 'Tata Power Company Limited - Odisha Distribution', shortName: 'TPCODL',
    aliases: ['TPCODL', 'Tata Power Odisha', 'Odisha Electricity', 'Odisha Power'],
    stateCode: 'OR', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.25, electricityDutyPct: 8, avgMonthlyUnits: 230,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Odisha Kusum Yojana: solar subsidy for farmers and rural consumers. Free 100 units for BPL families.',
    websiteUrl: 'https://www.tatapowerodisha.com/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.80, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.20, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.85, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.50, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 40, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 70, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 105, label: '150+ units' },
    ],
    tips: [
      { tip: 'Odisha Kusum Yojana offers up to 80% subsidy on solar installations.', category: 'solar' },
      { tip: 'June-Sept monsoon brings natural cooling - reduce AC usage, save ₹400-600/month.', category: 'savings' },
      { tip: 'Agricultural consumers eligible for subsidized new equipment.', category: 'general' },
    ],
  },
  {
    code: 'jbvnl', name: 'Jharkhand Bijli Vitran Nigam Limited', shortName: 'JBVNL',
    aliases: ['JBVNL', 'Jharkhand Electricity', 'Jharkhand Power'],
    stateCode: 'JH', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.30, electricityDutyPct: 9, avgMonthlyUnits: 220,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Rajiv Gandhi Grameen Vidyutikaran Yojana: subsidized tariff for rural areas. BPL support up to 75 units free.',
    websiteUrl: 'https://jbvnl.co.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.60, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.10, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.80, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.45, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 38, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 68, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 102, label: '150+ units' },
    ],
    tips: [
      { tip: 'Rural areas in Jharkhand get additional 15-20% subsidy - verify residency eligibility.', category: 'savings' },
      { tip: 'Water heater: limit usage to 30 mins/day early morning - saves ₹200-300/month.', category: 'appliance' },
      { tip: 'Check eligibility for BPL category - up to 75 free units/month available.', category: 'savings' },
    ],
  },
  {
    code: 'cspdcl', name: 'Chhattisgarh State Power Distribution Company Limited', shortName: 'CSPDCL',
    aliases: ['CSPDCL', 'Chhattisgarh Electricity', 'Chhattisgarh Power'],
    stateCode: 'CG', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.05, electricityDutyPct: 6, avgMonthlyUnits: 200,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Chhattisgarh has lowest electricity tariff in India. BPL households: free 50 units/month.',
    websiteUrl: 'https://www.cspdcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 2.95, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 4.50, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 6.10, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 7.00, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 35, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 60, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 90, label: '150+ units' },
    ],
    tips: [
      { tip: 'Chhattisgarh has LOWEST tariffs in all of India - your rates are already excellent.', category: 'savings' },
      { tip: 'Even 10% reduction saves ₹200-300/month.', category: 'savings' },
      { tip: 'Grid is stable 24/7 unlike some states with load-shedding.', category: 'general' },
    ],
  },
  {
    code: 'apdcl', name: 'Assam Power Distribution Company Limited', shortName: 'APDCL',
    aliases: ['APDCL', 'Assam Electricity', 'Assam Power'],
    stateCode: 'AS', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.40, electricityDutyPct: 10, avgMonthlyUnits: 210,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Assam Power Sector Reforms: subsidized rates for BPL. Free 50 units/month for families <₹10k/month income.',
    websiteUrl: 'https://www.apdcl.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.10, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 5.65, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 7.30, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 8.00, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 42, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 72, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 108, label: '150+ units' },
    ],
    tips: [
      { tip: 'Assam has high rainfall 8 months/year - leverage natural cooling, minimal AC usage.', category: 'savings' },
      { tip: 'Tea gardens in region get special industrial rates - check if your area qualifies.', category: 'general' },
      { tip: 'Assam targets 20% renewable energy by 2030 - solar rooftop schemes becoming popular.', category: 'solar' },
    ],
  },
  {
    code: 'goa_electricity', name: 'Goa Electricity Department', shortName: 'GoED',
    aliases: ['Goa Electricity', 'Goa Power', 'GoED'],
    stateCode: 'GA', countryCode: 'IN', tariffType: 'tiered', currency: 'INR',
    fuelSurchargePerUnit: 1.50, electricityDutyPct: 12, avgMonthlyUnits: 240,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Goa offers lowest tariffs for senior citizens (60+ years). Special rates for below poverty line families.',
    websiteUrl: 'https://www.goa.gov.in/',
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.35, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, rate: 6.00, label: '51-150 units' },
      { minUnits: 151, maxUnits: 300, rate: 7.75, label: '151-300 units' },
      { minUnits: 301, maxUnits: null, rate: 8.50, label: '300+ units' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 48, label: '0-50 units' },
      { minUnits: 51, maxUnits: 150, charge: 80, label: '51-150 units' },
      { minUnits: 151, maxUnits: null, charge: 120, label: '150+ units' },
    ],
    tips: [
      { tip: 'Goa coastal climate: use ceiling fans and open windows for natural ventilation 8 months/year.', category: 'savings' },
      { tip: 'Senior citizens (60+) get discounted tariff rates - apply at local DISCOM office.', category: 'savings' },
      { tip: 'High humidity in monsoon - ensure AC coils cleaned monthly to maintain efficiency.', category: 'appliance' },
    ],
  },

  // ============ USA ============
  {
    code: 'pge', name: 'Pacific Gas and Electric Company', shortName: 'PG&E',
    aliases: ['PG&E', 'Pacific Gas', 'PGE California'],
    stateCode: 'CA', countryCode: 'US', tariffType: 'tiered', currency: 'USD',
    fuelSurchargePerUnit: 0, electricityDutyPct: 0, avgMonthlyUnits: 550,
    peakHoursStart: '16:00', peakHoursEnd: '21:00', peakMultiplier: 1.5,
    subsidyInfo: 'CARE program offers 20% discount for low-income households. FERA offers 18% discount.',
    websiteUrl: 'https://www.pge.com/',
    slabs: [
      { minUnits: 0, maxUnits: 400, rate: 0.25, label: 'Baseline (0-400 kWh)' },
      { minUnits: 401, maxUnits: null, rate: 0.35, label: 'Over Baseline (400+ kWh)' },
    ],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 10, label: 'Monthly service fee' }],
    tips: [
      { tip: 'Stay within baseline allocation (400 kWh) to avoid higher tier rates.', category: 'savings' },
      { tip: 'Peak hours are 4PM-9PM - shift heavy usage to off-peak for ToU plans.', category: 'peak_hours' },
      { tip: 'California offers generous solar incentives - NEM 3.0 available.', category: 'solar' },
    ],
  },
  {
    code: 'coned', name: 'Consolidated Edison', shortName: 'Con Edison',
    aliases: ['ConEd', 'Con Edison', 'Consolidated Edison'],
    stateCode: 'NY', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.02, electricityDutyPct: 2.5, avgMonthlyUnits: 600,
    peakHoursStart: '14:00', peakHoursEnd: '18:00', peakMultiplier: 1.3,
    subsidyInfo: 'Low Income Program offers bill credits. Energy Affordability Program available.',
    websiteUrl: 'https://www.coned.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.22, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 16, label: 'Basic service charge' }],
    tips: [
      { tip: 'NYC has high electricity rates - focus on efficiency upgrades.', category: 'savings' },
      { tip: 'ConEd offers rebates for smart thermostats and efficient appliances.', category: 'appliance' },
      { tip: 'Consider community solar if rooftop installation is not possible.', category: 'solar' },
    ],
  },
  {
    code: 'txu', name: 'TXU Energy', shortName: 'TXU',
    aliases: ['TXU', 'TXU Energy', 'Texas Utilities'],
    stateCode: 'TX', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0, electricityDutyPct: 0, avgMonthlyUnits: 1200,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Texas has deregulated market - shop for best rates. LITE-UP Texas for low-income.',
    websiteUrl: 'https://www.txu.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.11, label: 'Fixed Rate Plan' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 9.95, label: 'Base charge' }],
    tips: [
      { tip: 'Texas is deregulated - compare rates at PowerToChoose.org.', category: 'savings' },
      { tip: 'Lock in fixed rates before summer when prices spike.', category: 'savings' },
      { tip: 'Texas has excellent solar potential - no state income tax on solar savings.', category: 'solar' },
    ],
  },
  {
    code: 'fpl', name: 'Florida Power & Light Company', shortName: 'FPL',
    aliases: ['FPL', 'Florida Power & Light', 'NextEra Energy'],
    stateCode: 'FL', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.045, electricityDutyPct: 0, avgMonthlyUnits: 1100,
    peakHoursStart: '14:00', peakHoursEnd: '19:00', peakMultiplier: 1.15,
    subsidyInfo: 'Energy Efficiency Program offers rebates on HVAC upgrades (up to $250). Solar rebates available.',
    websiteUrl: 'https://www.fpl.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.12, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 13.20, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Set AC thermostat to 78°F in summer - each degree lower increases cooling cost by 8-10%.', category: 'appliance' },
      { tip: 'Peak hours 2-7 PM: run dishwasher, laundry at night (10 PM-6 AM) to avoid peak surcharge.', category: 'peak_hours' },
      { tip: 'FPL offers $250+ rebates for LED lighting upgrades - apply via their website.', category: 'savings' },
    ],
  },
  {
    code: 'peco', name: 'PECO Energy Company', shortName: 'PECO',
    aliases: ['PECO', 'Philadelphia Electric Company', 'Exelon'],
    stateCode: 'PA', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.052, electricityDutyPct: 0, avgMonthlyUnits: 850,
    peakHoursStart: '14:00', peakHoursEnd: '18:00', peakMultiplier: 1.25,
    subsidyInfo: 'Pennsylvania Energy Development Authority: rebates for energy-efficient appliances and weatherization.',
    websiteUrl: 'https://www.peco.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.14, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 14.50, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Pennsylvania winters are cold: programmable thermostat reduces heating cost by 10-15%.', category: 'appliance' },
      { tip: 'PECO Time-of-Use: 2-6 PM peak hours are 25% higher - shift laundry/cooking to evenings.', category: 'peak_hours' },
      { tip: 'Check PA state rebates for heat pump upgrades - can save $3000-5000.', category: 'savings' },
    ],
  },
  {
    code: 'comed', name: 'Commonwealth Edison Company', shortName: 'ComEd',
    aliases: ['ComEd', 'Commonwealth Edison', 'Exelon'],
    stateCode: 'IL', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.048, electricityDutyPct: 0, avgMonthlyUnits: 900,
    peakHoursStart: '14:00', peakHoursEnd: '20:00', peakMultiplier: 1.20,
    subsidyInfo: 'ComEd offers Retail Choice - select from alternative suppliers. Energy efficiency audit free on request.',
    websiteUrl: 'https://www.comed.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.13, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 12.80, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Illinois: severe winters mean heating is major cost - insulation upgrades pay back in 3-4 years.', category: 'savings' },
      { tip: 'ComEd Time-of-Use: 2-8 PM peak rates 20% higher - run dishwasher/laundry after 8 PM.', category: 'peak_hours' },
      { tip: 'Illinois rebates for energy star appliances and smart thermostats up to $150 per item.', category: 'appliance' },
    ],
  },
  {
    code: 'aep_ohio', name: 'American Electric Power - Ohio', shortName: 'AEP Ohio',
    aliases: ['AEP Ohio', 'American Electric Power', 'AEP'],
    stateCode: 'OH', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.035, electricityDutyPct: 0, avgMonthlyUnits: 800,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Ohio Home Weatherization Program: free weatherization for eligible low-income families.',
    websiteUrl: 'https://www.aepohio.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.11, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 11.50, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Ohio winters are cold - water heater insulation wrap saves $100-200/year.', category: 'appliance' },
      { tip: 'AEP Ohio has low rates compared to national average.', category: 'savings' },
      { tip: 'Furnace maintenance (clean filters monthly) can reduce heating cost by 5-15%.', category: 'appliance' },
    ],
  },
  {
    code: 'georgia_power', name: 'Georgia Power Company', shortName: 'Georgia Power',
    aliases: ['Georgia Power', 'Southern Company'],
    stateCode: 'GA', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.038, electricityDutyPct: 0, avgMonthlyUnits: 1200,
    peakHoursStart: '13:00', peakHoursEnd: '19:00', peakMultiplier: 1.18,
    subsidyInfo: 'Peach State Solar Rebate: 30% federal tax credit for residential solar installations. Georgia Power offers $200 rebates.',
    websiteUrl: 'https://www.georgiapower.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.12, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 12.00, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Georgia: hot humid summers (32°C+) - window films reduce AC cost by 15-20%.', category: 'appliance' },
      { tip: 'Peak 1-7 PM: shift pool pump to run 7-11 AM (off-peak) to save 18-22%.', category: 'peak_hours' },
      { tip: 'Solar excellent in Georgia (300+ sunny days) - payback under 6 years.', category: 'solar' },
    ],
  },
  {
    code: 'duke_nc', name: 'Duke Energy Carolinas', shortName: 'Duke Energy NC',
    aliases: ['Duke Energy', 'Duke Energy Carolinas', 'Duke'],
    stateCode: 'NC', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.042, electricityDutyPct: 0, avgMonthlyUnits: 950,
    peakHoursStart: '14:00', peakHoursEnd: '19:00', peakMultiplier: 1.12,
    subsidyInfo: 'Duke Energy Smart $ense: appliance rebates up to $1000. Home energy audits at 50% discount.',
    websiteUrl: 'https://www.duke-energy.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.115, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 13.75, label: 'Monthly service charge' }],
    tips: [
      { tip: 'North Carolina: mild climate - use natural ventilation 8+ months/year instead of AC.', category: 'savings' },
      { tip: 'Duke Energy peak 2-7 PM: water heater and EV charging best at 11 PM-6 AM.', category: 'peak_hours' },
      { tip: 'Energy audit through Duke: identify $500-1000 annual savings opportunities.', category: 'savings' },
    ],
  },
  {
    code: 'dte_energy', name: 'DTE Energy Company', shortName: 'DTE Energy',
    aliases: ['DTE Energy', 'Detroit Edison', 'DTE'],
    stateCode: 'MI', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.055, electricityDutyPct: 0, avgMonthlyUnits: 750,
    peakHoursStart: '14:00', peakHoursEnd: '19:00', peakMultiplier: 1.22,
    subsidyInfo: 'DTE Residential Care Program: income-qualified assistance. Energy audit rebates $150-300.',
    websiteUrl: 'https://www.dteenergy.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.165, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 15.20, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Michigan: harsh 6-month winters - attic insulation (R-30 minimum) reduces heating by 20-25%.', category: 'savings' },
      { tip: 'DTE peak 2-7 PM: shift EV charging to 9 PM-midnight for 22% lower rate.', category: 'peak_hours' },
      { tip: 'Heat pump technology excellent for Michigan - can reduce heating cost by 30-40%.', category: 'appliance' },
    ],
  },
  {
    code: 'pseg', name: 'Public Service Enterprise Group', shortName: 'PSE&G',
    aliases: ['PSE&G', 'Public Service Enterprise Group', 'PSEG'],
    stateCode: 'NJ', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.065, electricityDutyPct: 0, avgMonthlyUnits: 820,
    peakHoursStart: '13:00', peakHoursEnd: '21:00', peakMultiplier: 1.28,
    subsidyInfo: 'New Jersey Board of Public Utilities: 50% rebates on LED, heat pump, and solar installations.',
    websiteUrl: 'https://www.pseg.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.175, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 16.50, label: 'Monthly service charge' }],
    tips: [
      { tip: 'New Jersey has highest electricity rates in USA - aggressive efficiency is critical.', category: 'savings' },
      { tip: 'PSE&G peak is 1-9 PM (longest peak window) - shift laundry/dishwasher to 9 PM onwards.', category: 'peak_hours' },
      { tip: 'NJ solar rebates highest in USA: 50% of installation cost refunded - ROI under 5 years.', category: 'solar' },
    ],
  },
  {
    code: 'dominion_va', name: 'Dominion Energy Virginia', shortName: 'Dominion VA',
    aliases: ['Dominion Energy', 'Dominion', 'Dominion Virginia'],
    stateCode: 'VA', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.041, electricityDutyPct: 0, avgMonthlyUnits: 1050,
    peakHoursStart: '14:00', peakHoursEnd: '20:00', peakMultiplier: 1.15,
    subsidyInfo: 'Virginia Energy Efficient Mortgage: favorable loan terms for energy-efficient home upgrades.',
    websiteUrl: 'https://www.dominionenergy.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.115, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 13.00, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Virginia: humid summers and cold winters - dual-zone HVAC control saves 15-20%.', category: 'appliance' },
      { tip: 'Dominion peak 2-8 PM: EV owners should avoid charging during this window.', category: 'peak_hours' },
      { tip: 'Free energy audits available - identify specific home inefficiencies.', category: 'savings' },
    ],
  },
  {
    code: 'pse', name: 'Puget Sound Energy', shortName: 'PSE',
    aliases: ['Puget Sound Energy', 'PSE', 'Puget'],
    stateCode: 'WA', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.038, electricityDutyPct: 0, avgMonthlyUnits: 950,
    peakHoursStart: '14:00', peakHoursEnd: '18:00', peakMultiplier: 1.10,
    subsidyInfo: 'Washington Climate Commitment Act: clean energy incentives. Heat pump rebates up to $2000.',
    websiteUrl: 'https://www.pse.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.10, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 12.50, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Washington: mild climate year-round - minimal heating/cooling - lowest bills in USA.', category: 'savings' },
      { tip: 'PSE peak only 2-6 PM (shortest window) - easy to avoid high rates.', category: 'peak_hours' },
      { tip: 'Washington\'s hydropower makes grid carbon-neutral.', category: 'general' },
    ],
  },
  {
    code: 'aps', name: 'Arizona Public Service Company', shortName: 'APS',
    aliases: ['APS', 'Arizona Public Service', 'Arizona Power'],
    stateCode: 'AZ', countryCode: 'US', tariffType: 'tiered', currency: 'USD',
    fuelSurchargePerUnit: 0.035, electricityDutyPct: 0, avgMonthlyUnits: 1350,
    peakHoursStart: '14:00', peakHoursEnd: '21:00', peakMultiplier: 1.35,
    subsidyInfo: 'Arizona solar rebates: 30% federal tax credit + $1000 APS rebate. Solar pool heating rebates available.',
    websiteUrl: 'https://www.aps.com/',
    slabs: [
      { minUnits: 0, maxUnits: 700, rate: 0.121, label: '0-700 kWh' },
      { minUnits: 701, maxUnits: null, rate: 0.156, label: '700+ kWh' },
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 700, charge: 19.50, label: '0-700 kWh' },
      { minUnits: 701, maxUnits: null, charge: 26.00, label: '700+ kWh' },
    ],
    tips: [
      { tip: 'Arizona: 350+ sunny days/year - solar ROI fastest in USA (4-5 years).', category: 'solar' },
      { tip: 'Summer peak 2-9 PM: 35% rate increase - shift all AC/laundry to 5-9 AM.', category: 'peak_hours' },
      { tip: 'Cool roof coating reduces summer AC cost by 20-30%.', category: 'appliance' },
    ],
  },
  {
    code: 'eversource_ma', name: 'Eversource Energy - Massachusetts', shortName: 'Eversource MA',
    aliases: ['Eversource', 'Northeast Utilities', 'Eversource Massachusetts'],
    stateCode: 'MA', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.062, electricityDutyPct: 0, avgMonthlyUnits: 700,
    peakHoursStart: '13:00', peakHoursEnd: '21:00', peakMultiplier: 1.32,
    subsidyInfo: 'Massachusetts Clean Energy Program: 50% rebates on solar, heat pumps, weatherization. Free energy audits.',
    websiteUrl: 'https://www.eversource.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.22, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 17.00, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Massachusetts: harsh winters (-5°C to 5°C Nov-Mar) - proper insulation is critical.', category: 'savings' },
      { tip: 'Eversource peak 1-9 PM: nearly 9 hours - use dishwasher/laundry after 9 PM only.', category: 'peak_hours' },
      { tip: 'MA incentives best in USA: 50% rebates on upgrades = ROI under 4 years.', category: 'solar' },
    ],
  },
  {
    code: 'tva', name: 'Tennessee Valley Authority', shortName: 'TVA',
    aliases: ['TVA', 'Tennessee Valley Authority', 'TVA Power'],
    stateCode: 'TN', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.032, electricityDutyPct: 0, avgMonthlyUnits: 1100,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'TVA Power Right Program: low-income assistance. Home weatherization audit free.',
    websiteUrl: 'https://www.tva.gov/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.095, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 10.75, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Tennessee: lowest electricity rates in Southeast due to TVA hydropower.', category: 'savings' },
      { tip: 'TVA no peak hours: shift appliances based on personal schedule.', category: 'general' },
      { tip: 'Hot humid summers (35°C+) - shading west-facing windows reduces AC cost 15-18%.', category: 'appliance' },
    ],
  },
  {
    code: 'duke_indiana', name: 'Duke Energy Indiana', shortName: 'Duke Energy IN',
    aliases: ['Duke Energy Indiana', 'Duke Energy', 'Duke'],
    stateCode: 'IN', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.039, electricityDutyPct: 0, avgMonthlyUnits: 850,
    peakHoursStart: '14:00', peakHoursEnd: '19:00', peakMultiplier: 1.18,
    subsidyInfo: 'Duke Energy Indiana: Smart $ense rebates up to $600. Community solar available.',
    websiteUrl: 'https://www.duke-energy.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.115, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 12.60, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Indiana: cold winters (-8°C to 0°C Dec-Feb) - weatherization provides 15-20% heating savings.', category: 'savings' },
      { tip: 'Duke Indiana peak 2-7 PM: use pool heater/hot water tank off-peak.', category: 'peak_hours' },
      { tip: 'Community solar option available - no rooftop needed.', category: 'solar' },
    ],
  },
  {
    code: 'ameren_missouri', name: 'Ameren Missouri', shortName: 'Ameren',
    aliases: ['Ameren', 'Ameren Missouri', 'Union Electric'],
    stateCode: 'MO', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.044, electricityDutyPct: 0, avgMonthlyUnits: 950,
    peakHoursStart: '14:00', peakHoursEnd: '19:00', peakMultiplier: 1.15,
    subsidyInfo: 'Ameren: smart thermostat rebate $150. Heat pump rebates up to $1200 for income-qualified.',
    websiteUrl: 'https://www.ameren.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.12, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 13.50, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Missouri: extreme seasons (-10°C winter, 38°C summer) - zone heating/cooling saves 20-25%.', category: 'savings' },
      { tip: 'Ameren peak 2-7 PM: EV charging best at 9 PM-6 AM for 15% savings.', category: 'peak_hours' },
      { tip: 'Heat pump replacement of HVAC provides 25-30% heating cost reduction.', category: 'appliance' },
    ],
  },
  {
    code: 'bge', name: 'Baltimore Gas and Electric Company', shortName: 'BGE',
    aliases: ['BGE', 'Baltimore Gas & Electric', 'BGE Maryland'],
    stateCode: 'MD', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.058, electricityDutyPct: 0, avgMonthlyUnits: 900,
    peakHoursStart: '13:00', peakHoursEnd: '21:00', peakMultiplier: 1.25,
    subsidyInfo: 'Maryland Clean Energy Incentive: 50% rebates on solar and battery storage. Heat pump rebates $1500-2000.',
    websiteUrl: 'https://www.bge.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.155, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 16.20, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Maryland: focus on peak hour avoidance 1-9 PM (biggest cost driver).', category: 'peak_hours' },
      { tip: 'BGE offers 50% solar rebates + 30% federal credit = under 50% upfront cost for solar.', category: 'solar' },
      { tip: 'Smart meter available free - use real-time data to shift usage away from peak hours.', category: 'general' },
    ],
  },
  {
    code: 'xcel_colorado', name: 'Xcel Energy - Colorado', shortName: 'Xcel CO',
    aliases: ['Xcel Energy', 'Xcel', 'Public Service Company of Colorado'],
    stateCode: 'CO', countryCode: 'US', tariffType: 'flat', currency: 'USD',
    fuelSurchargePerUnit: 0.046, electricityDutyPct: 0, avgMonthlyUnits: 700,
    peakHoursStart: '14:00', peakHoursEnd: '21:00', peakMultiplier: 1.20,
    subsidyInfo: 'Colorado solar rebates: 10% of cost up to $2400. EV charging rebate $500-1000.',
    websiteUrl: 'https://www.xcelenergy.com/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.125, label: 'Standard Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 14.80, label: 'Monthly service charge' }],
    tips: [
      { tip: 'Colorado: 300+ sunny days/year at high altitude - solar output 15-20% better than sea level.', category: 'solar' },
      { tip: 'Xcel peak 2-9 PM: shift laundry/dishwasher to morning (9 AM-2 PM) for 20% savings.', category: 'peak_hours' },
      { tip: 'Denver elevation means intense sun - window films reduce AC 15-18%.', category: 'appliance' },
    ],
  },

  // ============ UK ============
  {
    code: 'british_gas', name: 'British Gas', shortName: 'British Gas',
    aliases: ['British Gas', 'Centrica', 'BG'],
    stateCode: 'ENG', countryCode: 'GB', tariffType: 'flat', currency: 'GBP',
    fuelSurchargePerUnit: 0, electricityDutyPct: 5, avgMonthlyUnits: 280,
    peakHoursStart: null, peakHoursEnd: null, peakMultiplier: null,
    subsidyInfo: 'Warm Home Discount provides £150 rebate. Priority Services Register available.',
    websiteUrl: 'https://www.britishgas.co.uk/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.28, label: 'Standard Variable Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 0.50, label: 'Daily standing charge' }],
    tips: [
      { tip: 'UK energy prices are capped - check Ofgem price cap rates.', category: 'savings' },
      { tip: 'Switch to a fixed tariff to protect against price increases.', category: 'savings' },
      { tip: 'Smart Export Guarantee (SEG) pays for solar exports.', category: 'solar' },
    ],
  },
  {
    code: 'octopus', name: 'Octopus Energy', shortName: 'Octopus',
    aliases: ['Octopus', 'Octopus Energy'],
    stateCode: 'ENG', countryCode: 'GB', tariffType: 'flat', currency: 'GBP',
    fuelSurchargePerUnit: 0, electricityDutyPct: 5, avgMonthlyUnits: 280,
    peakHoursStart: '16:00', peakHoursEnd: '19:00', peakMultiplier: 1.4,
    subsidyInfo: 'Agile tariff offers variable rates. Go tariff for EV owners.',
    websiteUrl: 'https://octopus.energy/',
    slabs: [{ minUnits: 0, maxUnits: null, rate: 0.24, label: 'Flexible Octopus Rate' }],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 0.47, label: 'Daily standing charge' }],
    tips: [
      { tip: 'Octopus Agile tariff can save money if you shift usage to off-peak.', category: 'peak_hours' },
      { tip: 'Octopus Go is excellent for EV owners - cheap overnight charging.', category: 'savings' },
      { tip: 'Refer friends to earn £50 credit each.', category: 'general' },
    ],
  },
  {
    code: 'scottish_power', name: 'Scottish Power', shortName: 'SP',
    aliases: ['Scottish Power', 'SP', 'Iberdrola'],
    stateCode: 'SCT', countryCode: 'GB', tariffType: 'tiered', currency: 'GBP',
    fuelSurchargePerUnit: 0.065, electricityDutyPct: 5, avgMonthlyUnits: 310,
    peakHoursStart: '16:00', peakHoursEnd: '20:00', peakMultiplier: 1.25,
    subsidyInfo: 'Winter Fuel Payment eligible households get £100-200 support. Warm Homes Discount available.',
    websiteUrl: 'https://www.scottishpower.com/',
    slabs: [
      { minUnits: 0, maxUnits: 145, rate: 0.2285, label: '0-145 kWh (standard)' },
      { minUnits: 146, maxUnits: null, rate: 0.2650, label: '145+ kWh (high use)' },
    ],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 0.60, label: 'Daily standing charge' }],
    tips: [
      { tip: 'Scotland: cold wet climate - heating is 60% of bill. Loft insulation essential.', category: 'savings' },
      { tip: 'Economy 7 tariff (night rate 50% cheaper 12 AM-7 AM) - run washing machine at night.', category: 'peak_hours' },
      { tip: 'Scotland offers £5000+ grants for heat pump installation.', category: 'appliance' },
    ],
  },
  {
    code: 'wpd_wales', name: 'Western Power Distribution - Wales', shortName: 'WPD Wales',
    aliases: ['Western Power Distribution', 'WPD', 'WPD Wales'],
    stateCode: 'WLS', countryCode: 'GB', tariffType: 'tiered', currency: 'GBP',
    fuelSurchargePerUnit: 0.061, electricityDutyPct: 5, avgMonthlyUnits: 300,
    peakHoursStart: '16:00', peakHoursEnd: '19:00', peakMultiplier: 1.20,
    subsidyInfo: 'Welsh Government: Arbed Scheme grants up to £5000 for home energy improvements. Warm Homes Fund available.',
    websiteUrl: 'https://www.wpduk.com/',
    slabs: [
      { minUnits: 0, maxUnits: 150, rate: 0.2150, label: '0-150 kWh' },
      { minUnits: 151, maxUnits: null, rate: 0.2480, label: '150+ kWh' },
    ],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 0.56, label: 'Daily standing charge' }],
    tips: [
      { tip: 'Wales: very rainy - air-drying laundry preferred over electric dryer (saves £40-50/month).', category: 'savings' },
      { tip: 'Welsh Government offers £5000 grants for heat pumps.', category: 'appliance' },
      { tip: 'Economy 7 night tariff 50% cheaper 12 AM-7 AM - perfect for storage heaters.', category: 'peak_hours' },
    ],
  },
  {
    code: 'nie_networks', name: 'NIE Networks / Power NI', shortName: 'NIE/Power NI',
    aliases: ['NIE Networks', 'Power NI', 'Northern Ireland Electricity'],
    stateCode: 'NIR', countryCode: 'GB', tariffType: 'tiered', currency: 'GBP',
    fuelSurchargePerUnit: 0.068, electricityDutyPct: 5, avgMonthlyUnits: 320,
    peakHoursStart: '16:00', peakHoursEnd: '21:00', peakMultiplier: 1.30,
    subsidyInfo: 'Northern Ireland Warm Homes Scheme: free insulation and heating upgrades for eligible households (highest support in UK).',
    websiteUrl: 'https://www.powerni.co.uk/',
    slabs: [
      { minUnits: 0, maxUnits: 150, rate: 0.2320, label: '0-150 kWh' },
      { minUnits: 151, maxUnits: null, rate: 0.2710, label: '150+ kWh' },
    ],
    fixedCharges: [{ minUnits: 0, maxUnits: null, charge: 0.62, label: 'Daily standing charge' }],
    tips: [
      { tip: 'Northern Ireland: coldest climate in UK - Warm Homes scheme most generous in UK.', category: 'savings' },
      { tip: 'Warm Homes Scheme: FREE insulation + heating upgrades for eligible households.', category: 'savings' },
      { tip: 'Power NI Economy 7: night rate 50% less - run dishwasher/laundry 12 AM-7 AM.', category: 'peak_hours' },
    ],
  },
];

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
  const COUNTRIES = [
    { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', defaultRate: 6.5, avgMonthlyUnits: 200 },
    { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', defaultRate: 0.12, avgMonthlyUnits: 900 },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', defaultRate: 0.28, avgMonthlyUnits: 300 },
  ];

  const countryMap = {};
  for (const c of COUNTRIES) {
    const created = await prisma.country.create({ data: c });
    countryMap[c.code] = created;
  }
  console.log('✅ Countries created');

  // ============ STATES ============
  const ALL_STATES = [
    // India
    { code: 'KL', name: 'Kerala', countryCode: 'IN', avgMonthlyUnits: 180 },
    { code: 'MH', name: 'Maharashtra', countryCode: 'IN', avgMonthlyUnits: 220 },
    { code: 'KA', name: 'Karnataka', countryCode: 'IN', avgMonthlyUnits: 200 },
    { code: 'TN', name: 'Tamil Nadu', countryCode: 'IN', avgMonthlyUnits: 210 },
    { code: 'DL', name: 'Delhi', countryCode: 'IN', avgMonthlyUnits: 250 },
    { code: 'GJ', name: 'Gujarat', countryCode: 'IN', avgMonthlyUnits: 230 },
    { code: 'RJ', name: 'Rajasthan', countryCode: 'IN', avgMonthlyUnits: 200 },
    { code: 'UP', name: 'Uttar Pradesh', countryCode: 'IN', avgMonthlyUnits: 180 },
    { code: 'WB', name: 'West Bengal', countryCode: 'IN', avgMonthlyUnits: 170 },
    { code: 'AP', name: 'Andhra Pradesh', countryCode: 'IN', avgMonthlyUnits: 200 },
    { code: 'TS', name: 'Telangana', countryCode: 'IN', avgMonthlyUnits: 210 },
    { code: 'PB', name: 'Punjab', countryCode: 'IN', avgMonthlyUnits: 220 },
    { code: 'HR', name: 'Haryana', countryCode: 'IN', avgMonthlyUnits: 230 },
    { code: 'MP', name: 'Madhya Pradesh', countryCode: 'IN', avgMonthlyUnits: 190 },
    { code: 'BR', name: 'Bihar', countryCode: 'IN', avgMonthlyUnits: 150 },
    { code: 'OR', name: 'Odisha', countryCode: 'IN', avgMonthlyUnits: 160 },
    { code: 'JH', name: 'Jharkhand', countryCode: 'IN', avgMonthlyUnits: 160 },
    { code: 'CG', name: 'Chhattisgarh', countryCode: 'IN', avgMonthlyUnits: 170 },
    { code: 'AS', name: 'Assam', countryCode: 'IN', avgMonthlyUnits: 140 },
    { code: 'GA', name: 'Goa', countryCode: 'IN', avgMonthlyUnits: 200 },
    // USA
    { code: 'CA', name: 'California', countryCode: 'US', avgMonthlyUnits: 550 },
    { code: 'TX', name: 'Texas', countryCode: 'US', avgMonthlyUnits: 1200 },
    { code: 'FL', name: 'Florida', countryCode: 'US', avgMonthlyUnits: 1100 },
    { code: 'NY', name: 'New York', countryCode: 'US', avgMonthlyUnits: 600 },
    { code: 'PA', name: 'Pennsylvania', countryCode: 'US', avgMonthlyUnits: 850 },
    { code: 'IL', name: 'Illinois', countryCode: 'US', avgMonthlyUnits: 750 },
    { code: 'OH', name: 'Ohio', countryCode: 'US', avgMonthlyUnits: 900 },
    { code: 'GA', name: 'Georgia', countryCode: 'US', avgMonthlyUnits: 1100 },
    { code: 'NC', name: 'North Carolina', countryCode: 'US', avgMonthlyUnits: 1050 },
    { code: 'MI', name: 'Michigan', countryCode: 'US', avgMonthlyUnits: 650 },
    { code: 'NJ', name: 'New Jersey', countryCode: 'US', avgMonthlyUnits: 680 },
    { code: 'VA', name: 'Virginia', countryCode: 'US', avgMonthlyUnits: 1100 },
    { code: 'WA', name: 'Washington', countryCode: 'US', avgMonthlyUnits: 950 },
    { code: 'AZ', name: 'Arizona', countryCode: 'US', avgMonthlyUnits: 1050 },
    { code: 'MA', name: 'Massachusetts', countryCode: 'US', avgMonthlyUnits: 600 },
    { code: 'TN', name: 'Tennessee', countryCode: 'US', avgMonthlyUnits: 1200 },
    { code: 'IN', name: 'Indiana', countryCode: 'US', avgMonthlyUnits: 950 },
    { code: 'MO', name: 'Missouri', countryCode: 'US', avgMonthlyUnits: 1050 },
    { code: 'MD', name: 'Maryland', countryCode: 'US', avgMonthlyUnits: 1000 },
    { code: 'CO', name: 'Colorado', countryCode: 'US', avgMonthlyUnits: 700 },
    // UK
    { code: 'ENG', name: 'England', countryCode: 'GB', avgMonthlyUnits: 280 },
    { code: 'SCT', name: 'Scotland', countryCode: 'GB', avgMonthlyUnits: 320 },
    { code: 'WLS', name: 'Wales', countryCode: 'GB', avgMonthlyUnits: 300 },
    { code: 'NIR', name: 'Northern Ireland', countryCode: 'GB', avgMonthlyUnits: 310 },
    { code: 'LON', name: 'London', countryCode: 'GB', avgMonthlyUnits: 250 },
    { code: 'MAN', name: 'Manchester', countryCode: 'GB', avgMonthlyUnits: 290 },
    { code: 'BIR', name: 'Birmingham', countryCode: 'GB', avgMonthlyUnits: 285 },
    { code: 'LIV', name: 'Liverpool', countryCode: 'GB', avgMonthlyUnits: 295 },
    { code: 'LEE', name: 'Leeds', countryCode: 'GB', avgMonthlyUnits: 280 },
    { code: 'GLA', name: 'Glasgow', countryCode: 'GB', avgMonthlyUnits: 330 },
  ];

  // Build stateMap keyed by "countryCode:stateCode" to handle duplicate state codes across countries
  const stateMap = {};
  for (const s of ALL_STATES) {
    const created = await prisma.state.create({
      data: { code: s.code, name: s.name, countryId: countryMap[s.countryCode].id, avgMonthlyUnits: s.avgMonthlyUnits }
    });
    stateMap[`${s.countryCode}:${s.code}`] = created;
  }
  console.log(`✅ ${ALL_STATES.length} States/Regions created`);

  // ============ PROVIDERS (loop over PROVIDER_DATA) ============
  for (const p of PROVIDER_DATA) {
    const stateKey = `${p.countryCode}:${p.stateCode}`;
    const stateRecord = stateMap[stateKey];
    if (!stateRecord) {
      console.warn(`⚠️  State not found for ${p.code}: ${stateKey} - skipping`);
      continue;
    }

    const provider = await prisma.provider.create({
      data: {
        code: p.code,
        name: p.name,
        shortName: p.shortName,
        aliases: p.aliases,
        countryId: countryMap[p.countryCode].id,
        stateId: stateRecord.id,
        tariffType: p.tariffType,
        currency: p.currency,
        fuelSurchargePerUnit: p.fuelSurchargePerUnit,
        electricityDutyPct: p.electricityDutyPct,
        avgMonthlyUnits: p.avgMonthlyUnits,
        peakHoursStart: p.peakHoursStart,
        peakHoursEnd: p.peakHoursEnd,
        peakMultiplier: p.peakMultiplier,
        subsidyInfo: p.subsidyInfo,
        websiteUrl: p.websiteUrl,
      }
    });

    for (let i = 0; i < p.slabs.length; i++) {
      await prisma.tariffSlab.create({ data: { ...p.slabs[i], providerId: provider.id, sortOrder: i } });
    }
    for (let i = 0; i < p.fixedCharges.length; i++) {
      await prisma.fixedCharge.create({ data: { ...p.fixedCharges[i], providerId: provider.id, sortOrder: i } });
    }
    for (let i = 0; i < p.tips.length; i++) {
      await prisma.providerTip.create({ data: { ...p.tips[i], providerId: provider.id, sortOrder: i } });
    }

    console.log(`✅ ${p.shortName} (${p.stateCode}) created`);
  }

  console.log('\n🎉 Database seeding completed!');
  console.log(`   - ${COUNTRIES.length} Countries`);
  console.log(`   - ${ALL_STATES.length} States/Regions`);
  console.log(`   - ${PROVIDER_DATA.length} Providers`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
