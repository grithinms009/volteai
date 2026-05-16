function billAccuracyEngine({ extractedFields, calculatedBill, provider, regionDefaults }) {
  console.log('[ENGINE-1] Running bill accuracy check...');

  const { unitsConsumed, totalAmount } = extractedFields;
  const result = {
    meterReadingValid: true,
    tariffCalculationCorrect: null,
    overchargeAmount: 0,
    fraudScore: 0,
    billHealthScore: 100,
    checks: []
  };

  // Check 1: Meter reading vs regional average
  if (unitsConsumed > 0) {
    const regionAvg = regionDefaults?.avgMonthlyUnitsHome || 250;
    const variance = Math.abs((unitsConsumed - regionAvg) / regionAvg) * 100;
    const pass = variance <= 60;
    if (!pass) {
      result.meterReadingValid = false;
      result.fraudScore += 20;
    }
    result.checks.push({
      name: 'Meter Reading Validity',
      pass,
      reason: pass
        ? `Consumption within expected range (${variance.toFixed(0)}% from regional avg of ${Math.round(regionAvg)} units)`
        : `Consumption is ${variance.toFixed(0)}% from regional avg — verify meter`,
      suggestion: pass ? null : 'Request meter re-verification from your provider'
    });
  }

  // Check 2: Tariff calculation accuracy
  if (calculatedBill && totalAmount > 0) {
    const diff = Math.abs(totalAmount - calculatedBill.total);
    const pctVariance = calculatedBill.total > 0 ? (diff / calculatedBill.total) * 100 : 0;
    const pass = pctVariance <= 10;
    result.tariffCalculationCorrect = pass;
    if (!pass) {
      result.overchargeAmount = Math.max(0, Math.round(totalAmount - calculatedBill.total));
      result.fraudScore += 15;
    }
    result.checks.push({
      name: 'Tariff Calculation',
      pass,
      reason: pass
        ? `Bill matches expected tariff (within 10%)`
        : `Bill differs by ₹${diff.toFixed(2)} (${pctVariance.toFixed(1)}%) from expected`,
      overcharge: result.overchargeAmount > 0 ? result.overchargeAmount : null,
      suggestion: pass ? null : 'File a billing dispute with your provider'
    });
  } else {
    result.checks.push({
      name: 'Tariff Calculation',
      pass: null,
      reason: 'Insufficient data to verify tariff — provider tariff unavailable'
    });
  }

  // Check 3: Fixed charge validity
  if (provider?.fixedCharges && extractedFields.fixedCharge && unitsConsumed > 0) {
    const expectedFixed = provider.fixedCharges.find(
      f => unitsConsumed >= f.minUnits && (f.maxUnits === null || unitsConsumed <= f.maxUnits)
    )?.charge;
    if (expectedFixed !== undefined) {
      const pass = Math.abs(extractedFields.fixedCharge - expectedFixed) < 20;
      if (!pass) result.fraudScore += 10;
      result.checks.push({
        name: 'Fixed Charge Validity',
        pass,
        reason: pass
          ? `Fixed charge ₹${extractedFields.fixedCharge} matches expected ₹${expectedFixed}`
          : `Fixed charge ₹${extractedFields.fixedCharge} differs from expected ₹${expectedFixed}`
      });
    }
  }

  // Check 4: Arrears
  const arrearsAmount = extractedFields.arrearsAmount || 0;
  result.checks.push({
    name: 'Outstanding Arrears',
    pass: !extractedFields.hasArrears || arrearsAmount === 0,
    reason: extractedFields.hasArrears && arrearsAmount > 0
      ? `Outstanding arrears of ₹${arrearsAmount}`
      : 'No outstanding arrears',
    suggestion: extractedFields.hasArrears ? 'Clear dues to avoid disconnection and late fees' : null
  });
  if (extractedFields.hasArrears && arrearsAmount > 0) result.fraudScore += 5;

  // Check 5: Subsidy/negative charges sanity
  if (extractedFields.subsidyAmount && extractedFields.subsidyAmount > totalAmount * 0.5) {
    result.checks.push({
      name: 'Subsidy Sanity',
      pass: false,
      reason: `Subsidy amount ₹${extractedFields.subsidyAmount} is unusually high (>50% of bill)`,
      suggestion: 'Verify subsidy entitlement with provider'
    });
    result.fraudScore += 10;
  }

  result.fraudScore = Math.min(100, result.fraudScore);
  result.billHealthScore = Math.max(0, 100 - result.fraudScore);
  result.overallStatus = result.billHealthScore >= 80 ? 'healthy' : result.billHealthScore >= 50 ? 'review_needed' : 'dispute_recommended';

  return result;
}

module.exports = { billAccuracyEngine };
