module.exports = [
  // ============ INDIA - State Electricity Boards ============
  // Kerala
  {
    id: "kseb",
    name: "Kerala State Electricity Board",
    aliases: ["KSEB", "KSEBL", "Kerala Electricity", "KSE Board"],
    countryCode: "IN",
    stateCode: "KL",
    stateName: "Kerala",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.15, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 3.70, label: "51-100 units" },
      { minUnits: 101, maxUnits: 150, rate: 4.80, label: "101-150 units" },
      { minUnits: 151, maxUnits: 200, rate: 6.40, label: "151-200 units" },
      { minUnits: 201, maxUnits: 250, rate: 7.60, label: "201-250 units" },
      { minUnits: 251, maxUnits: 300, rate: 7.90, label: "251-300 units" },
      { minUnits: 301, maxUnits: 350, rate: 8.00, label: "301-350 units" },
      { minUnits: 351, maxUnits: 400, rate: 8.40, label: "351-400 units" },
      { minUnits: 401, maxUnits: 500, rate: 9.50, label: "401-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 10.50, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 35 },
      { minUnits: 51, maxUnits: 100, charge: 55 },
      { minUnits: 101, maxUnits: 150, charge: 75 },
      { minUnits: 151, maxUnits: 200, charge: 100 },
      { minUnits: 201, maxUnits: 250, charge: 125 },
      { minUnits: 251, maxUnits: 300, charge: 140 },
      { minUnits: 301, maxUnits: 350, charge: 160 },
      { minUnits: 351, maxUnits: 400, charge: 180 },
      { minUnits: 401, maxUnits: 500, charge: 200 },
      { minUnits: 501, maxUnits: Infinity, charge: 225 }
    ],
    fuelSurchargePerUnit: 0.10,
    electricityDutyPct: 10,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "BPL households get subsidized rates. Solar rooftop net metering available.",
    websiteUrl: "https://wss.kseb.in/",
    tips: [
      "Keep consumption below 200 units to stay in lower slabs",
      "KSEB offers net metering for solar - excess power credited at ₹3.22/unit",
      "Apply for agricultural tariff if you have a farm pump",
      "Fixed charges increase with consumption - efficiency saves twice"
    ]
  },
  // Maharashtra
  {
    id: "msedcl",
    name: "Maharashtra State Electricity Distribution Co. Ltd",
    aliases: ["MSEDCL", "Mahavitaran", "MSEB", "Maharashtra Electricity"],
    countryCode: "IN",
    stateCode: "MH",
    stateName: "Maharashtra",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 4.71, label: "0-100 units" },
      { minUnits: 101, maxUnits: 300, rate: 10.29, label: "101-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 12.58, label: "301-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 14.41, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 110 },
      { minUnits: 101, maxUnits: 300, charge: 145 },
      { minUnits: 301, maxUnits: 500, charge: 180 },
      { minUnits: 501, maxUnits: Infinity, charge: 210 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 16,
    avgMonthlyUnitsHome: 220,
    peakHours: { start: "18:00", end: "22:00", surcharge: 1.20 },
    subsidyInfo: "Subsidy for consumption below 100 units. ToD metering available.",
    websiteUrl: "https://www.mahadiscom.in/",
    tips: [
      "Stay below 100 units for heavily subsidized rates",
      "ToD meters can save 20% if you shift AC/geyser usage to off-peak",
      "Solar rooftop with net metering is highly beneficial in MH",
      "Check for agricultural pump subsidy if applicable"
    ]
  },
  // Karnataka
  {
    id: "bescom",
    name: "Bangalore Electricity Supply Company",
    aliases: ["BESCOM", "Bangalore Electricity", "KPTCL Bangalore"],
    countryCode: "IN",
    stateCode: "KA",
    stateName: "Karnataka",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 30, rate: 4.10, label: "0-30 units" },
      { minUnits: 31, maxUnits: 100, rate: 5.55, label: "31-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 7.10, label: "101-200 units" },
      { minUnits: 201, maxUnits: Infinity, rate: 8.15, label: "Above 200 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 30, charge: 45 },
      { minUnits: 31, maxUnits: 100, charge: 60 },
      { minUnits: 101, maxUnits: 200, charge: 75 },
      { minUnits: 201, maxUnits: Infinity, charge: 90 }
    ],
    fuelSurchargePerUnit: 0.30,
    electricityDutyPct: 9,
    avgMonthlyUnitsHome: 200,
    peakHours: null,
    subsidyInfo: "Bhagya Jyothi scheme for BPL families.",
    websiteUrl: "https://bescom.karnataka.gov.in/",
    tips: [
      "First 30 units are at lowest rate - use LED lighting",
      "BESCOM has high fuel surcharge - solar reduces this",
      "Check Surya Raitha scheme for agricultural solar pumps",
      "Smart meters being rolled out - monitor usage patterns"
    ]
  },
  // Tamil Nadu
  {
    id: "tangedco",
    name: "Tamil Nadu Generation and Distribution Corporation",
    aliases: ["TANGEDCO", "TNEB", "Tamil Nadu Electricity Board", "TN Electricity"],
    countryCode: "IN",
    stateCode: "TN",
    stateName: "Tamil Nadu",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 0, label: "0-100 units (Free)" },
      { minUnits: 101, maxUnits: 200, rate: 2.50, label: "101-200 units" },
      { minUnits: 201, maxUnits: 500, rate: 4.60, label: "201-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 6.60, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 0 },
      { minUnits: 101, maxUnits: 200, charge: 50 },
      { minUnits: 201, maxUnits: 500, charge: 80 },
      { minUnits: 501, maxUnits: Infinity, charge: 100 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "First 100 units FREE for domestic consumers. Highly subsidized state.",
    websiteUrl: "https://www.tangedco.gov.in/",
    tips: [
      "Keep consumption below 100 units for FREE electricity",
      "TN has one of the cheapest electricity in India",
      "Even above 100 units, rates are very competitive",
      "Solar rooftop net metering available with good buyback rates"
    ]
  },
  // Delhi
  {
    id: "bses_rajdhani",
    name: "BSES Rajdhani Power Limited",
    aliases: ["BSES", "BRPL", "BSES Rajdhani", "Reliance Energy Delhi"],
    countryCode: "IN",
    stateCode: "DL",
    stateName: "Delhi",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 200, rate: 3.00, label: "0-200 units" },
      { minUnits: 201, maxUnits: 400, rate: 4.50, label: "201-400 units" },
      { minUnits: 401, maxUnits: 800, rate: 6.50, label: "401-800 units" },
      { minUnits: 801, maxUnits: 1200, rate: 7.00, label: "801-1200 units" },
      { minUnits: 1201, maxUnits: Infinity, rate: 8.00, label: "Above 1200 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 200, charge: 125 },
      { minUnits: 201, maxUnits: 400, charge: 175 },
      { minUnits: 401, maxUnits: 800, charge: 225 },
      { minUnits: 801, maxUnits: 1200, charge: 250 },
      { minUnits: 1201, maxUnits: Infinity, charge: 275 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 8,
    avgMonthlyUnitsHome: 280,
    peakHours: { start: "14:00", end: "17:00", surcharge: 1.15 },
    subsidyInfo: "Delhi govt provides subsidy up to 200 units. Zero bill if under 200 units.",
    websiteUrl: "https://www.bsesdelhi.com/",
    tips: [
      "Stay under 200 units for ZERO electricity bill (govt subsidy)",
      "Delhi has excellent solar rooftop incentives",
      "ToD metering available - shift AC usage to night",
      "Check for EV charging tariff if you have an electric vehicle"
    ]
  },
  {
    id: "tata_power_delhi",
    name: "Tata Power Delhi Distribution Limited",
    aliases: ["TPDDL", "Tata Power Delhi", "NDPL", "North Delhi Power"],
    countryCode: "IN",
    stateCode: "DL",
    stateName: "Delhi",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 200, rate: 3.00, label: "0-200 units" },
      { minUnits: 201, maxUnits: 400, rate: 4.50, label: "201-400 units" },
      { minUnits: 401, maxUnits: 800, rate: 6.50, label: "401-800 units" },
      { minUnits: 801, maxUnits: 1200, rate: 7.00, label: "801-1200 units" },
      { minUnits: 1201, maxUnits: Infinity, rate: 8.00, label: "Above 1200 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 200, charge: 125 },
      { minUnits: 201, maxUnits: 400, charge: 175 },
      { minUnits: 401, maxUnits: 800, charge: 225 },
      { minUnits: 801, maxUnits: 1200, charge: 250 },
      { minUnits: 1201, maxUnits: Infinity, charge: 275 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 8,
    avgMonthlyUnitsHome: 280,
    peakHours: { start: "14:00", end: "17:00", surcharge: 1.15 },
    subsidyInfo: "Delhi govt provides subsidy up to 200 units.",
    websiteUrl: "https://www.tatapower-ddl.com/",
    tips: [
      "Stay under 200 units for ZERO electricity bill (govt subsidy)",
      "Tata Power offers green energy options",
      "Smart meter data available via app - track daily usage",
      "Solar rooftop with net metering highly recommended"
    ]
  },
  // Gujarat
  {
    id: "dgvcl",
    name: "Dakshin Gujarat Vij Company Limited",
    aliases: ["DGVCL", "South Gujarat Electricity", "Torrent Power Surat"],
    countryCode: "IN",
    stateCode: "GJ",
    stateName: "Gujarat",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.20, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 3.70, label: "51-100 units" },
      { minUnits: 101, maxUnits: 250, rate: 4.90, label: "101-250 units" },
      { minUnits: 251, maxUnits: 500, rate: 5.60, label: "251-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 6.10, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 25 },
      { minUnits: 51, maxUnits: 100, charge: 35 },
      { minUnits: 101, maxUnits: 250, charge: 55 },
      { minUnits: 251, maxUnits: 500, charge: 75 },
      { minUnits: 501, maxUnits: Infinity, charge: 100 }
    ],
    fuelSurchargePerUnit: 0.15,
    electricityDutyPct: 15,
    avgMonthlyUnitsHome: 200,
    peakHours: null,
    subsidyInfo: "Surya Gujarat scheme for rooftop solar.",
    websiteUrl: "https://www.dgvcl.com/",
    tips: [
      "Gujarat has competitive rates - good for industries",
      "Surya Gujarat scheme offers excellent solar incentives",
      "Agricultural connections have separate subsidized tariff",
      "Check for ToD tariff option for commercial connections"
    ]
  },
  // Andhra Pradesh
  {
    id: "apspdcl",
    name: "AP Southern Power Distribution Company",
    aliases: ["APSPDCL", "AP Electricity", "Andhra Pradesh Electricity"],
    countryCode: "IN",
    stateCode: "AP",
    stateName: "Andhra Pradesh",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 1.90, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 3.05, label: "51-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 4.50, label: "101-200 units" },
      { minUnits: 201, maxUnits: 300, rate: 6.00, label: "201-300 units" },
      { minUnits: 301, maxUnits: 400, rate: 8.75, label: "301-400 units" },
      { minUnits: 401, maxUnits: 500, rate: 9.75, label: "401-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 10.25, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 30 },
      { minUnits: 51, maxUnits: 100, charge: 50 },
      { minUnits: 101, maxUnits: 200, charge: 70 },
      { minUnits: 201, maxUnits: 300, charge: 90 },
      { minUnits: 301, maxUnits: 400, charge: 110 },
      { minUnits: 401, maxUnits: 500, charge: 130 },
      { minUnits: 501, maxUnits: Infinity, charge: 150 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 170,
    peakHours: null,
    subsidyInfo: "Free electricity up to 200 units for eligible households.",
    websiteUrl: "https://www.apspdcl.in/",
    tips: [
      "AP has very low rates for first 50 units",
      "Check eligibility for free 200 units scheme",
      "Solar rooftop net metering available",
      "Agricultural pumps have free electricity in AP"
    ]
  },
  // Telangana
  {
    id: "tsspdcl",
    name: "Telangana State Southern Power Distribution Company",
    aliases: ["TSSPDCL", "Telangana Electricity", "TS Electricity", "TSPDCL"],
    countryCode: "IN",
    stateCode: "TS",
    stateName: "Telangana",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 1.95, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 3.20, label: "51-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 5.00, label: "101-200 units" },
      { minUnits: 201, maxUnits: 300, rate: 7.50, label: "201-300 units" },
      { minUnits: 301, maxUnits: 400, rate: 8.50, label: "301-400 units" },
      { minUnits: 401, maxUnits: 500, rate: 9.50, label: "401-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 10.50, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 30 },
      { minUnits: 51, maxUnits: 100, charge: 50 },
      { minUnits: 101, maxUnits: 200, charge: 75 },
      { minUnits: 201, maxUnits: 300, charge: 100 },
      { minUnits: 301, maxUnits: 400, charge: 125 },
      { minUnits: 401, maxUnits: 500, charge: 150 },
      { minUnits: 501, maxUnits: Infinity, charge: 175 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "Free electricity up to 200 units for eligible households.",
    websiteUrl: "https://www.tssouthernpower.com/",
    tips: [
      "Telangana offers free electricity up to 200 units for eligible families",
      "Agricultural connections get 24/7 free power",
      "Solar rooftop highly incentivized",
      "Check for industrial ToD tariff options"
    ]
  },
  // West Bengal
  {
    id: "wbsedcl",
    name: "West Bengal State Electricity Distribution Company",
    aliases: ["WBSEDCL", "West Bengal Electricity", "WBSEB", "Calcutta Electricity"],
    countryCode: "IN",
    stateCode: "WB",
    stateName: "West Bengal",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 25, rate: 4.11, label: "0-25 units" },
      { minUnits: 26, maxUnits: 60, rate: 5.18, label: "26-60 units" },
      { minUnits: 61, maxUnits: 100, rate: 5.93, label: "61-100 units" },
      { minUnits: 101, maxUnits: 150, rate: 6.94, label: "101-150 units" },
      { minUnits: 151, maxUnits: 300, rate: 8.05, label: "151-300 units" },
      { minUnits: 301, maxUnits: Infinity, rate: 9.73, label: "Above 300 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 25, charge: 25 },
      { minUnits: 26, maxUnits: 60, charge: 40 },
      { minUnits: 61, maxUnits: 100, charge: 55 },
      { minUnits: 101, maxUnits: 150, charge: 70 },
      { minUnits: 151, maxUnits: 300, charge: 90 },
      { minUnits: 301, maxUnits: Infinity, charge: 120 }
    ],
    fuelSurchargePerUnit: 0.20,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 150,
    peakHours: null,
    subsidyInfo: "Subsidized rates for BPL families.",
    websiteUrl: "https://www.wbsedcl.in/",
    tips: [
      "WB has narrow slabs - small savings add up",
      "Keep consumption under 100 units for best rates",
      "Solar rooftop net metering available",
      "Check for Duare Bidyut scheme benefits"
    ]
  },
  // Rajasthan
  {
    id: "jvvnl",
    name: "Jaipur Vidyut Vitran Nigam Limited",
    aliases: ["JVVNL", "Rajasthan Electricity", "RVUNL", "Jaipur Electricity"],
    countryCode: "IN",
    stateCode: "RJ",
    stateName: "Rajasthan",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.75, label: "0-50 units" },
      { minUnits: 51, maxUnits: 150, rate: 6.50, label: "51-150 units" },
      { minUnits: 151, maxUnits: 300, rate: 7.25, label: "151-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 7.75, label: "301-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 8.25, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 100 },
      { minUnits: 51, maxUnits: 150, charge: 160 },
      { minUnits: 151, maxUnits: 300, charge: 200 },
      { minUnits: 301, maxUnits: 500, charge: 250 },
      { minUnits: 501, maxUnits: Infinity, charge: 300 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 10,
    avgMonthlyUnitsHome: 200,
    peakHours: null,
    subsidyInfo: "Subsidy for agricultural and BPL consumers.",
    websiteUrl: "https://energy.rajasthan.gov.in/",
    tips: [
      "Rajasthan has high solar potential - rooftop solar recommended",
      "Fixed charges are relatively high - efficiency matters",
      "Agricultural pumps have subsidized rates",
      "Check for PM-KUSUM solar pump scheme"
    ]
  },
  // Uttar Pradesh
  {
    id: "uppcl",
    name: "Uttar Pradesh Power Corporation Limited",
    aliases: ["UPPCL", "UP Electricity", "DVVNL", "PVVNL", "MVVNL", "KESCO"],
    countryCode: "IN",
    stateCode: "UP",
    stateName: "Uttar Pradesh",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 3.50, label: "0-100 units" },
      { minUnits: 101, maxUnits: 150, rate: 4.00, label: "101-150 units" },
      { minUnits: 151, maxUnits: 300, rate: 5.00, label: "151-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 5.50, label: "301-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 6.00, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 70 },
      { minUnits: 101, maxUnits: 150, charge: 100 },
      { minUnits: 151, maxUnits: 300, charge: 130 },
      { minUnits: 301, maxUnits: 500, charge: 160 },
      { minUnits: 501, maxUnits: Infinity, charge: 200 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "Subsidized rates for rural and BPL consumers.",
    websiteUrl: "https://www.uppcl.org/",
    tips: [
      "UP has relatively low rates compared to other states",
      "Solar rooftop net metering available",
      "Check for Kisan Uday scheme for agricultural pumps",
      "Smart prepaid meters being rolled out - helps track usage"
    ]
  },
  // Punjab
  {
    id: "pspcl",
    name: "Punjab State Power Corporation Limited",
    aliases: ["PSPCL", "Punjab Electricity", "PSEB", "Punjab State Electricity Board"],
    countryCode: "IN",
    stateCode: "PB",
    stateName: "Punjab",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 4.19, label: "0-100 units" },
      { minUnits: 101, maxUnits: 300, rate: 5.61, label: "101-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 6.78, label: "301-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 7.50, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 30 },
      { minUnits: 101, maxUnits: 300, charge: 50 },
      { minUnits: 301, maxUnits: 500, charge: 80 },
      { minUnits: 501, maxUnits: Infinity, charge: 100 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 220,
    peakHours: null,
    subsidyInfo: "Free electricity for agricultural pumps. Subsidy for domestic consumers.",
    websiteUrl: "https://www.pspcl.in/",
    tips: [
      "Punjab offers free electricity for agricultural pumps",
      "Domestic consumers get subsidized rates",
      "Solar rooftop highly recommended due to good sunlight",
      "Check for EV charging tariff options"
    ]
  },
  // Haryana
  {
    id: "uhbvn",
    name: "Uttar Haryana Bijli Vitran Nigam",
    aliases: ["UHBVN", "DHBVN", "Haryana Electricity", "Haryana Bijli"],
    countryCode: "IN",
    stateCode: "HR",
    stateName: "Haryana",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 2.00, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 4.20, label: "51-100 units" },
      { minUnits: 101, maxUnits: 300, rate: 5.05, label: "101-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 6.30, label: "301-500 units" },
      { minUnits: 501, maxUnits: 800, rate: 7.10, label: "501-800 units" },
      { minUnits: 801, maxUnits: Infinity, rate: 7.60, label: "Above 800 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 35 },
      { minUnits: 51, maxUnits: 100, charge: 60 },
      { minUnits: 101, maxUnits: 300, charge: 115 },
      { minUnits: 301, maxUnits: 500, charge: 175 },
      { minUnits: 501, maxUnits: 800, charge: 250 },
      { minUnits: 801, maxUnits: Infinity, charge: 310 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 200,
    peakHours: null,
    subsidyInfo: "Subsidized rates for BPL and small consumers.",
    websiteUrl: "https://www.uhbvn.org.in/",
    tips: [
      "First 50 units at very low rate - maximize efficiency",
      "Haryana has good solar potential",
      "Check for Mhara Gaon Jagmag Gaon scheme",
      "Agricultural connections have separate tariff"
    ]
  },
  // Madhya Pradesh
  {
    id: "mpeb",
    name: "Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company",
    aliases: ["MPEB", "MPPKVVCL", "MP Electricity", "Madhya Pradesh Electricity"],
    countryCode: "IN",
    stateCode: "MP",
    stateName: "Madhya Pradesh",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.70, label: "0-50 units" },
      { minUnits: 51, maxUnits: 150, rate: 5.35, label: "51-150 units" },
      { minUnits: 151, maxUnits: 300, rate: 6.20, label: "151-300 units" },
      { minUnits: 301, maxUnits: 500, rate: 6.85, label: "301-500 units" },
      { minUnits: 501, maxUnits: Infinity, rate: 7.50, label: "Above 500 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 80 },
      { minUnits: 51, maxUnits: 150, charge: 120 },
      { minUnits: 151, maxUnits: 300, charge: 160 },
      { minUnits: 301, maxUnits: 500, charge: 200 },
      { minUnits: 501, maxUnits: Infinity, charge: 250 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 9,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "Subsidized rates for rural and BPL consumers.",
    websiteUrl: "https://www.mpez.co.in/",
    tips: [
      "MP has moderate rates - efficiency still important",
      "Solar rooftop with net metering available",
      "Check for Mukhyamantri Kisan Vidyut Yojana",
      "Agricultural pumps have subsidized tariff"
    ]
  },
  // Bihar
  {
    id: "sbpdcl",
    name: "South Bihar Power Distribution Company",
    aliases: ["SBPDCL", "NBPDCL", "Bihar Electricity", "Bihar Bijli"],
    countryCode: "IN",
    stateCode: "BR",
    stateName: "Bihar",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.10, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 5.20, label: "51-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 6.15, label: "101-200 units" },
      { minUnits: 201, maxUnits: 300, rate: 6.75, label: "201-300 units" },
      { minUnits: 301, maxUnits: Infinity, rate: 7.50, label: "Above 300 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 50 },
      { minUnits: 51, maxUnits: 100, charge: 75 },
      { minUnits: 101, maxUnits: 200, charge: 100 },
      { minUnits: 201, maxUnits: 300, charge: 125 },
      { minUnits: 301, maxUnits: Infinity, charge: 150 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 120,
    peakHours: null,
    subsidyInfo: "Subsidized rates for BPL and rural consumers.",
    websiteUrl: "https://www.bsphcl.co.in/",
    tips: [
      "Bihar has relatively low average consumption",
      "Solar rooftop can significantly reduce bills",
      "Check for Har Ghar Bijli scheme benefits",
      "Prepaid meters being introduced - helps budget"
    ]
  },
  // Odisha
  {
    id: "tpcodl",
    name: "Tata Power Central Odisha Distribution Limited",
    aliases: ["TPCODL", "CESU", "Odisha Electricity", "Tata Power Odisha"],
    countryCode: "IN",
    stateCode: "OD",
    stateName: "Odisha",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 3.50, label: "0-50 units" },
      { minUnits: 51, maxUnits: 200, rate: 5.80, label: "51-200 units" },
      { minUnits: 201, maxUnits: 400, rate: 6.20, label: "201-400 units" },
      { minUnits: 401, maxUnits: Infinity, rate: 6.50, label: "Above 400 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 30 },
      { minUnits: 51, maxUnits: 200, charge: 60 },
      { minUnits: 201, maxUnits: 400, charge: 90 },
      { minUnits: 401, maxUnits: Infinity, charge: 120 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 140,
    peakHours: null,
    subsidyInfo: "Subsidized rates for BPL consumers.",
    websiteUrl: "https://www.tpcentralodisha.com/",
    tips: [
      "Odisha has competitive rates",
      "Tata Power offers good customer service",
      "Solar rooftop net metering available",
      "Check for agricultural pump subsidies"
    ]
  },
  // Chhattisgarh
  {
    id: "cspdcl",
    name: "Chhattisgarh State Power Distribution Company",
    aliases: ["CSPDCL", "Chhattisgarh Electricity", "CG Electricity"],
    countryCode: "IN",
    stateCode: "CG",
    stateName: "Chhattisgarh",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 2.50, label: "0-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 4.00, label: "101-200 units" },
      { minUnits: 201, maxUnits: 400, rate: 5.50, label: "201-400 units" },
      { minUnits: 401, maxUnits: Infinity, rate: 6.50, label: "Above 400 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 40 },
      { minUnits: 101, maxUnits: 200, charge: 70 },
      { minUnits: 201, maxUnits: 400, charge: 100 },
      { minUnits: 401, maxUnits: Infinity, charge: 130 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 150,
    peakHours: null,
    subsidyInfo: "Low rates due to abundant power generation in state.",
    websiteUrl: "https://www.cspdcl.co.in/",
    tips: [
      "Chhattisgarh has some of the lowest rates in India",
      "State is power surplus - reliable supply",
      "Solar rooftop still beneficial for long-term savings",
      "Check for industrial ToD tariff options"
    ]
  },
  // Jharkhand
  {
    id: "jbvnl",
    name: "Jharkhand Bijli Vitran Nigam Limited",
    aliases: ["JBVNL", "Jharkhand Electricity", "Jharkhand Bijli"],
    countryCode: "IN",
    stateCode: "JH",
    stateName: "Jharkhand",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 3.60, label: "0-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 5.10, label: "101-200 units" },
      { minUnits: 201, maxUnits: 300, rate: 5.85, label: "201-300 units" },
      { minUnits: 301, maxUnits: Infinity, rate: 6.40, label: "Above 300 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 60 },
      { minUnits: 101, maxUnits: 200, charge: 90 },
      { minUnits: 201, maxUnits: 300, charge: 120 },
      { minUnits: 301, maxUnits: Infinity, charge: 150 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 130,
    peakHours: null,
    subsidyInfo: "Subsidized rates for BPL and rural consumers.",
    websiteUrl: "https://www.jbvnl.co.in/",
    tips: [
      "Jharkhand has moderate rates",
      "Solar rooftop recommended for reliable power",
      "Check for rural electrification scheme benefits",
      "Prepaid meters help track consumption"
    ]
  },
  // Assam
  {
    id: "apdcl",
    name: "Assam Power Distribution Company Limited",
    aliases: ["APDCL", "Assam Electricity", "ASEB", "Assam State Electricity Board"],
    countryCode: "IN",
    stateCode: "AS",
    stateName: "Assam",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 50, rate: 4.65, label: "0-50 units" },
      { minUnits: 51, maxUnits: 100, rate: 5.40, label: "51-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 6.15, label: "101-200 units" },
      { minUnits: 201, maxUnits: 300, rate: 7.10, label: "201-300 units" },
      { minUnits: 301, maxUnits: Infinity, rate: 8.00, label: "Above 300 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 50, charge: 40 },
      { minUnits: 51, maxUnits: 100, charge: 60 },
      { minUnits: 101, maxUnits: 200, charge: 80 },
      { minUnits: 201, maxUnits: 300, charge: 100 },
      { minUnits: 301, maxUnits: Infinity, charge: 130 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 6,
    avgMonthlyUnitsHome: 120,
    peakHours: null,
    subsidyInfo: "Subsidized rates for tea gardens and BPL consumers.",
    websiteUrl: "https://www.apdcl.org/",
    tips: [
      "Assam has moderate rates",
      "Solar rooftop can help with power reliability",
      "Check for tea garden special tariff if applicable",
      "LED lighting highly recommended"
    ]
  },
  // Goa
  {
    id: "goa_electricity",
    name: "Goa Electricity Department",
    aliases: ["Goa Electricity", "GED", "Goa Power"],
    countryCode: "IN",
    stateCode: "GA",
    stateName: "Goa",
    currency: "INR",
    tariffType: "tiered",
    slabs: [
      { minUnits: 0, maxUnits: 100, rate: 1.70, label: "0-100 units" },
      { minUnits: 101, maxUnits: 200, rate: 2.50, label: "101-200 units" },
      { minUnits: 201, maxUnits: 400, rate: 3.50, label: "201-400 units" },
      { minUnits: 401, maxUnits: Infinity, rate: 4.50, label: "Above 400 units" }
    ],
    fixedCharges: [
      { minUnits: 0, maxUnits: 100, charge: 50 },
      { minUnits: 101, maxUnits: 200, charge: 80 },
      { minUnits: 201, maxUnits: 400, charge: 120 },
      { minUnits: 401, maxUnits: Infinity, charge: 160 }
    ],
    fuelSurchargePerUnit: 0.0,
    electricityDutyPct: 5,
    avgMonthlyUnitsHome: 180,
    peakHours: null,
    subsidyInfo: "Goa has some of the lowest electricity rates in India.",
    websiteUrl: "https://www.goaelectricity.gov.in/",
    tips: [
      "Goa has very low electricity rates",
      "Still beneficial to use solar for environmental reasons",
      "Tourism establishments have separate commercial tariff",
      "Check for green energy options"
    ]
  }
];
