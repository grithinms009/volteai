const prisma = require('../db');
const { billAccuracyEngine }       = require('./analysisEngines/engine1-billAccuracy');
const { effectiveRateEngine }      = require('./analysisEngines/engine2-effectiveRate');
const { applianceBreakdownEngine } = require('./analysisEngines/engine3-applianceBreakdown');
const { usagePatternsEngine }      = require('./analysisEngines/engine4-usagePatterns');
const { tariffIntelligenceEngine } = require('./analysisEngines/engine5-tariffIntelligence');
const { savingsOpportunitiesEngine } = require('./analysisEngines/engine6-savingsOpportunities');
const { recommendationsEngine }    = require('./analysisEngines/engine7-recommendations');
const { comparisonsEngine }        = require('./analysisEngines/engine8-comparisons');
const { predictionsEngine }        = require('./analysisEngines/engine9-predictions');
const { applianceHealthEngine }    = require('./analysisEngines/engine10-applianceHealth');

async function runFullAnalysis({
  extractedFields,
  tariffModel,
  effectiveRate,
  regionDefaults,
  profileType,
  provider,
  calculatedBill,
  slabOptimization,
  userId
}) {
  console.log('[ORCHESTRATOR] Starting full 10-engine analysis...');

  const units = extractedFields.unitsConsumed || 0;
  const billAmount = extractedFields.totalAmount || calculatedBill?.total || 0;
  const days = extractedFields.billingDays || 30;
  const dailyUnits = units > 0 ? units / days : 0;

  // Fetch historical bills for trend/anomaly engines
  let historicalBills = [];
  if (userId) {
    try {
      historicalBills = await prisma.bill.findMany({
        where: { userId, status: 'completed' },
        orderBy: { createdAt: 'asc' },
        take: 12,
        select: { analysisResult: true, createdAt: true }
      });
    } catch (err) {
      console.warn('[ORCHESTRATOR] Could not load historical bills:', err.message);
    }
  }

  // === WAVE 1: Independent engines (run in parallel) ===
  const [e1, e2, e3, e4] = await Promise.all([
    Promise.resolve(billAccuracyEngine({ extractedFields, calculatedBill, provider, regionDefaults })),
    Promise.resolve(effectiveRateEngine({ extractedFields, regionDefaults, calculatedBill })),
    Promise.resolve(applianceBreakdownEngine({ unitsConsumed: units, profileType, dailyUnits })),
    Promise.resolve(usagePatternsEngine({ extractedFields, historicalBills, billAmount, days }))
  ]);

  // === ENGINE 5: Depends on slabOptimization from regionEngine ===
  const e5 = tariffIntelligenceEngine({ extractedFields, provider, slabOptimization, tariffModel });

  // === WAVE 2: Depend on e4 and e5 (run in parallel) ===
  const [e6, e8, e9, e10] = await Promise.all([
    Promise.resolve(savingsOpportunitiesEngine({ extractedFields, provider, usagePatterns: e4, tariffIntelligence: e5, billAmount })),
    Promise.resolve(comparisonsEngine({ extractedFields, regionDefaults, profileType, provider })),
    Promise.resolve(predictionsEngine({ extractedFields, historicalBills, regionDefaults })),
    Promise.resolve(applianceHealthEngine({ unitsConsumed: units, dailyUnits, profileType }))
  ]);

  // === ENGINE 7: Depends on e3, e4, e5, e6 ===
  const e7 = recommendationsEngine({
    extractedFields,
    provider,
    tariffIntelligence: e5,
    savingsOpportunities: e6,
    usagePatterns: e4,
    applianceBreakdown: e3
  });

  // === BACKWARD-COMPATIBLE LEGACY FIELDS ===
  const costPerUnit = units > 0 ? billAmount / units : effectiveRate;
  const resRate = regionDefaults?.residentialRate || 8;
  const rateVsRegionAvg = resRate > 0 ? ((costPerUnit - resRate) / resRate) * 100 : 0;
  let rateStatus = 'average';
  if (rateVsRegionAvg > 15) rateStatus = 'above_average';
  else if (rateVsRegionAvg < -15) rateStatus = 'below_average';

  const profileMultipliers = { 'home': 1.0, 'home-office': 1.3, 'small-shop': 2.0, 'office': 3.0 };
  const mult = profileMultipliers[profileType] || 1.0;
  const avgUnits = (regionDefaults?.avgMonthlyUnitsHome || 200) * mult;
  const usageRatio = avgUnits > 0 && units > 0 ? units / avgUnits : 1;

  let effScore = 100;
  if (usageRatio > 1.5) effScore -= 25;
  else if (usageRatio > 1.3) effScore -= 15;
  else if (usageRatio > 1.1) effScore -= 5;
  if (usageRatio < 0.7) effScore += 10;
  if (rateVsRegionAvg > 30) effScore -= 20;
  else if (rateVsRegionAvg > 15) effScore -= 10;
  if (e1.fraudScore > 20) effScore -= 5;
  const efficiencyScore = Math.max(0, Math.min(100, effScore));

  const confidenceLevel = provider && units > 0 && billAmount > 0 ? 'high'
    : units > 0 && billAmount > 0 ? 'medium'
    : 'low';

  // === ALERTS ===
  const alerts = [];
  if (e1.fraudScore > 40) {
    alerts.push({ severity: 'high', type: 'fraud', message: 'Possible billing discrepancy — review your bill carefully.' });
  }
  if (e4.anomalies?.length > 0) {
    alerts.push({ severity: 'medium', type: 'anomaly', message: e4.anomalies[0].message });
  }
  if (e5.slabBoundaryRisk > 80 && e5.nextSlabInfo) {
    alerts.push({ severity: 'high', type: 'slab', message: e5.slabAlert });
  }
  if (e10.urgentItems?.length > 0) {
    alerts.push({ severity: 'medium', type: 'maintenance', message: `${e10.urgentItems.length} appliance(s) need attention — ${e10.urgentItems.map(i => i.appliance).join(', ')}` });
  }

  // === COMPOSE FINAL RESULT ===
  return {
    // ---- Legacy fields (keep for backward compatibility with existing frontend) ----
    effectiveRate: e2.effectiveRate,
    effectiveRateCurrency: e2.effectiveRateCurrency,
    rateVsRegionAvg: Number(rateVsRegionAvg.toFixed(1)),
    rateStatus,
    usageIntensity: usageRatio > 1.3 ? 'high' : usageRatio < 0.7 ? 'low' : 'medium',
    usageRatio: Number(usageRatio.toFixed(2)),
    dailyUnits: e4.dailyAvg,
    dailyCost: e4.dailyCost,
    efficiencyScore,
    fixedChargePct: billAmount > 0 ? Math.round(((extractedFields.fixedCharge || 0) / billAmount) * 1000) / 10 : 0,
    energyChargePct: billAmount > 0 ? Math.round(((extractedFields.energyCharge || 0) / billAmount) * 1000) / 10 : 0,
    taxPct: billAmount > 0 ? Math.round((((extractedFields.taxAmount || 0) + (extractedFields.electricityDuty || 0)) / billAmount) * 1000) / 10 : 0,
    monthlySavingsEstimate: e6.monthlySavingsPotential,
    annualSavingsEstimate: e6.totalSavingsPotential,
    potentialSavingsPct: billAmount > 0 ? Math.round((e6.monthlySavingsPotential / billAmount) * 100) : 0,
    savingsBreakdown: e6.conservative.opportunities.map(o => ({ category: o.title, savings: o.savingsPerMonth, description: o.description })),
    topIssues: e7.allRecommendations.slice(0, 5).map(r => ({ title: r.title, description: r.description, severity: r.priority <= 2 ? 'high' : 'medium', actionable: true })),
    recommendations: e7.allRecommendations.map(r => r.description),
    recommendationsDetailed: e7.allRecommendations,
    tariffModel,
    providerName: extractedFields.providerName || provider?.name || null,
    providerId: provider?.id || null,
    providerState: provider?.state || null,
    providerWebsite: provider?.websiteUrl || null,
    slabOptimization,
    unitsConsumed: units || null,
    totalAmount: billAmount || null,
    deviceBreakdown: e3.appliances.map(a => ({ device: a.name, units: a.kWh, percentage: a.pct })),
    monthlyTrend: e4.monthlyTrendChart,
    confidenceLevel,
    analysisVersion: '3.0',

    // ---- New engine outputs ----
    billAccuracy: e1,
    effectiveRateAnalysis: e2,
    applianceBreakdown: e3,
    usagePatterns: e4,
    tariffIntelligence: e5,
    savingsOpportunities: e6,
    recommendationsData: e7,
    comparisons: e8,
    predictions: e9,
    applianceHealth: e10,

    // ---- Summary fields ----
    alerts,
    totalSavingsPotential: e6.totalSavingsPotential,
    topRecommendations: e7.topRecommendations,
    analysisDate: new Date().toISOString()
  };
}

module.exports = { runFullAnalysis };
