const countries = require('../data/countries');
const regions = require('../data/regions');

async function regionEngine(extractedFields) {
  console.log(`[REGION] Detecting tariff and region defaults...`);
  
  // Step 1 - Detect tariff model
  let tariffModel = 'flat';
  if (extractedFields.hasSlabRating) tariffModel = 'tiered';
  else if (extractedFields.hasPeakHours) tariffModel = 'tod';
  else if (extractedFields.hasDemandCharge) tariffModel = 'tiered';

  // Step 2 - Get effective rate
  let effectiveRate = 0;
  let dataSource = 'bill';

  if (extractedFields.totalAmount && extractedFields.unitsConsumed && extractedFields.unitsConsumed > 0) {
    effectiveRate = extractedFields.totalAmount / extractedFields.unitsConsumed;
  } else {
    dataSource = 'region_default';
  }

  // Step 3 - Get region defaults
  let regionDefaults = { residentialRate: 8, currency: 'INR', avgMonthlyUnitsHome: 250 };
  let confidence = 'low';

  const country = countries.find(c => c.code === extractedFields.country || c.name === extractedFields.country);
  const region = regions.find(r => 
    (r.countryCode === extractedFields.country && (r.regionCode === extractedFields.state || r.name === extractedFields.state))
  );

  if (region) {
    regionDefaults = {
      residentialRate: region.residentialRate,
      commercialRate: region.commercialRate,
      avgMonthlyUnitsHome: region.avgMonthlyUnits,
      currency: country ? country.currency : 'INR'
    };
    confidence = 'high';
    if (dataSource === 'region_default') effectiveRate = region.residentialRate;
  } else if (country) {
    regionDefaults = {
      residentialRate: country.defaultResidentialRate,
      commercialRate: country.defaultCommercialRate,
      avgMonthlyUnitsHome: country.avgMonthlyUnitsHome,
      currency: country.currency
    };
    confidence = 'medium';
    if (dataSource === 'region_default') effectiveRate = country.defaultResidentialRate;
  }

  return {
    tariffModel,
    effectiveRate,
    dataSource,
    regionDefaults,
    confidence
  };
}

module.exports = { regionEngine };
