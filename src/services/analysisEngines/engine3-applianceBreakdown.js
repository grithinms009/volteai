function applianceBreakdownEngine({ unitsConsumed, profileType, dailyUnits }) {
  console.log('[ENGINE-3] Estimating appliance breakdown...');

  const total = unitsConsumed || 0;
  const daily = dailyUnits || total / 30;
  const profile = (profileType || 'home').toLowerCase().replace('-', '_');

  const profiles = {
    home: [
      { name: 'Air Conditioner',    pct: total > 150 ? 38 : 0,  wattage: 1500, recommendation: 'Set to 24-26°C, clean filters monthly, use inverter type' },
      { name: 'Water Heater',       pct: 18,  wattage: 2000, recommendation: 'Install timer — limit to 30 min/day; consider solar water heater' },
      { name: 'Refrigerator',       pct: 15,  wattage: 150,  recommendation: 'Keep at 3-5°C, defrost regularly, replace if >10 years old' },
      { name: 'Lighting',           pct: 12,  wattage: 100,  recommendation: 'Replace all bulbs with LED; use motion sensors in unused areas' },
      { name: 'Washing Machine',    pct: 7,   wattage: 500,  recommendation: 'Always run full loads, use cold water, schedule off-peak' },
      { name: 'TV & Entertainment', pct: 6,   wattage: 120,  recommendation: 'Enable power-saving mode, unplug when not in use' },
      { name: 'Fan & Cooling',      pct: 4,   wattage: 75,   recommendation: 'Use ceiling fans alongside AC to allow higher set temperature' },
      { name: 'Other / Standby',    pct: total > 150 ? 0 : 38, wattage: 50, recommendation: 'Unplug chargers and adapters when not actively charging' }
    ],
    home_office: [
      { name: 'Computers & Monitors', pct: 25, wattage: 300,  recommendation: 'Enable OS power-saving mode; turn off monitors when idle >5 min' },
      { name: 'Air Conditioner',       pct: 30, wattage: 1500, recommendation: 'Set to 24-26°C; ensure proper room insulation' },
      { name: 'Refrigerator',          pct: 12, wattage: 150,  recommendation: 'Keep well-stocked — full fridges are more efficient' },
      { name: 'Water Heater',          pct: 12, wattage: 2000, recommendation: 'Schedule to off-peak hours only' },
      { name: 'Lighting',              pct: 10, wattage: 100,  recommendation: 'Use task lighting instead of whole-room illumination' },
      { name: 'Other / Standby',       pct: 11, wattage: 80,   recommendation: 'Use smart plugs to auto-cut standby power overnight' }
    ],
    small_shop: [
      { name: 'Lighting (Commercial)', pct: 30, wattage: 200,  recommendation: 'Switch to LED panels; install daylight sensors' },
      { name: 'Air Conditioner',       pct: 28, wattage: 2000, recommendation: 'Zone cooling; use inverter AC' },
      { name: 'Refrigeration',         pct: 20, wattage: 500,  recommendation: 'Keep condenser coils clean; check door seals' },
      { name: 'Equipment / POS',       pct: 12, wattage: 200,  recommendation: 'Enable sleep mode on all equipment' },
      { name: 'Other / Standby',       pct: 10, wattage: 100,  recommendation: 'Install master cutoff switch for non-critical loads' }
    ],
    office: [
      { name: 'Computers & AV',   pct: 30, wattage: 400,  recommendation: 'Enforce auto-sleep policies via IT; use thin clients' },
      { name: 'HVAC',             pct: 35, wattage: 5000, recommendation: 'Zone control; BMS scheduling for unoccupied hours' },
      { name: 'Lighting',         pct: 20, wattage: 300,  recommendation: 'Motion-sensor LED panels; maximize daylight' },
      { name: 'Server / Network', pct: 10, wattage: 500,  recommendation: 'Virtualize servers; use energy-efficient network gear' },
      { name: 'Other / Standby',  pct: 5,  wattage: 100,  recommendation: 'Smart strips on workstations; overnight auto-shutdown' }
    ]
  };

  const template = profiles[profile] || profiles.home;

  // Normalize percentages
  const totalPct = template.reduce((s, a) => s + a.pct, 0);
  const normalized = template.map(a => ({ ...a, pct: totalPct > 0 ? Math.round((a.pct / totalPct) * 100) : a.pct }));

  const appliances = normalized
    .filter(a => a.pct > 0)
    .map(a => ({
      name: a.name,
      kWh: Math.round(total * (a.pct / 100)),
      pct: a.pct,
      wattage: a.wattage,
      recommendation: a.recommendation
    }))
    .filter(a => a.kWh > 0)
    .sort((a, b) => b.kWh - a.kWh);

  const phantomLoadPct = 8;
  const phantomLoadKWh = Math.round(total * (phantomLoadPct / 100));
  const phantomLoadCost = Math.round(phantomLoadKWh * 6.5);

  return {
    appliances,
    totalActual: total,
    phantomLoadKWh,
    phantomLoadPct,
    phantomLoadCost,
    isEstimated: true,
    reconciliationStatus: 'estimated',
    topConsumer: appliances[0]?.name || null,
    suggestion: 'Enter your actual appliance list for a precise breakdown'
  };
}

module.exports = { applianceBreakdownEngine };
