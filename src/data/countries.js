module.exports = [
  {
    code: "IN",
    name: "India",
    currency: "INR",
    defaultResidentialRate: 8.5,
    defaultCommercialRate: 11.5,
    supportsPeakHours: false,
    billingFrequency: "monthly",
    avgMonthlyUnitsHome: 250
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    defaultResidentialRate: 0.16,
    defaultCommercialRate: 0.13,
    supportsPeakHours: true,
    billingFrequency: "monthly",
    avgMonthlyUnitsHome: 900
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    defaultResidentialRate: 0.28,
    defaultCommercialRate: 0.24,
    supportsPeakHours: true,
    billingFrequency: "monthly",
    avgMonthlyUnitsHome: 350
  },
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    defaultResidentialRate: 0.30,
    defaultCommercialRate: 0.25,
    supportsPeakHours: true,
    billingFrequency: "quarterly",
    avgMonthlyUnitsHome: 500
  }
];
