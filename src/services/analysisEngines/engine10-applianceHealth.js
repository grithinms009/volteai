function applianceHealthEngine({ unitsConsumed, dailyUnits, profileType }) {
  console.log('[ENGINE-10] Running appliance health assessment...');

  const units = unitsConsumed || 0;
  const daily = dailyUnits || units / 30;
  const profile = (profileType || 'home').toLowerCase().replace('-', '_');

  const checks = [
    {
      name: 'Air Conditioner',
      relevant: units > 150,
      assess: () => {
        const status = daily > 12 ? 'heavy_use' : 'normal';
        return {
          status,
          icon: status === 'heavy_use' ? '⚠️' : '✅',
          healthLabel: status === 'heavy_use' ? 'Heavy Usage — Service Needed' : 'Normal',
          recommendation: status === 'heavy_use'
            ? 'AC is running intensively. Service filters every 3 months. Check refrigerant levels annually. Consider upgrading to inverter type.'
            : 'AC usage looks normal. Schedule annual servicing before summer.',
          maintenanceTip: 'Clean or replace filters every 1-3 months. Dirty filters reduce efficiency by 5-15%.',
          efficiencyDrop: status === 'heavy_use' ? '15-25% if not serviced' : null,
          urgency: status === 'heavy_use' ? 'soon' : 'routine'
        };
      }
    },
    {
      name: 'Refrigerator',
      relevant: true,
      assess: () => ({
        status: 'check_recommended',
        icon: '🔍',
        healthLabel: 'Periodic Check Recommended',
        recommendation: 'Check door seals (paper test: place paper in door, close it — if it slides out easily, seal is worn). A worn seal wastes 25% energy.',
        maintenanceTip: 'Clean condenser coils every 6 months for 10-15% better efficiency. Keep coils dust-free.',
        efficiencyDrop: 'Worn seal: +25% energy. Dirty coils: +10-15% energy.',
        urgency: 'routine'
      })
    },
    {
      name: 'Water Heater (Geyser)',
      relevant: daily > 5,
      assess: () => {
        const status = daily > 10 ? 'high_usage' : 'normal';
        return {
          status,
          icon: status === 'high_usage' ? '⚠️' : '✅',
          healthLabel: status === 'high_usage' ? 'High Usage Detected' : 'Normal',
          recommendation: status === 'high_usage'
            ? 'Geyser appears to run frequently. Set thermostat to 50-55°C, insulate the tank, install a timer to run only when needed.'
            : 'Descale geyser every 2 years in hard water areas to maintain efficiency.',
          maintenanceTip: 'Annual descaling prevents 20-30% efficiency loss from limescale buildup.',
          efficiencyDrop: status === 'high_usage' ? '20-30% if not descaled' : null,
          urgency: status === 'high_usage' ? 'soon' : 'routine'
        };
      }
    },
    {
      name: 'Washing Machine',
      relevant: true,
      assess: () => ({
        status: 'normal',
        icon: '✅',
        healthLabel: 'Normal',
        recommendation: 'Clean the drum monthly with a hot water cycle. Check filters every 3 months for lint/debris buildup.',
        maintenanceTip: 'Use exact recommended detergent quantities — excess causes scale buildup and reduces motor efficiency.',
        efficiencyDrop: null,
        urgency: 'routine'
      })
    },
    {
      name: 'Lighting',
      relevant: true,
      assess: () => {
        const lightingLoad = units * 0.10;
        const status = lightingLoad > 25 ? 'upgrade_needed' : 'good';
        return {
          status,
          icon: status === 'upgrade_needed' ? '💡' : '✅',
          healthLabel: status === 'upgrade_needed' ? 'LED Upgrade Recommended' : 'Good',
          recommendation: status === 'upgrade_needed'
            ? 'Significant lighting load detected. Replace any remaining incandescent or CFL bulbs with LED immediately.'
            : 'Good. LED lighting is in use. No action needed.',
          maintenanceTip: 'LED bulbs last 15,000-25,000 hours and need no maintenance.',
          efficiencyDrop: status === 'upgrade_needed' ? 'Incandescent uses 6x more power than LED' : null,
          urgency: status === 'upgrade_needed' ? 'now' : 'none'
        };
      }
    },
    {
      name: 'Fans & Motors',
      relevant: profile === 'home' || profile === 'home_office',
      assess: () => ({
        status: 'normal',
        icon: '✅',
        healthLabel: 'Normal',
        recommendation: 'Oil ceiling fan bearings annually for quiet, efficient operation. BLDC fans use 65% less power than standard fans.',
        maintenanceTip: 'Dust fan blades regularly — dusty blades reduce airflow by up to 20%.',
        efficiencyDrop: null,
        urgency: 'routine'
      })
    }
  ];

  const results = checks
    .filter(c => c.relevant)
    .map(c => ({ appliance: c.name, ...c.assess() }));

  const urgentItems = results.filter(r => r.urgency === 'now' || r.urgency === 'soon');

  const maintenanceCalendar = [
    { task: 'Clean AC filters', frequency: 'Monthly', nextDue: '1 month', appliance: 'Air Conditioner' },
    { task: 'Clean washing machine drum', frequency: 'Monthly', nextDue: '1 month', appliance: 'Washing Machine' },
    { task: 'Check refrigerator door seal', frequency: 'Quarterly', nextDue: '3 months', appliance: 'Refrigerator' },
    { task: 'Clean washing machine filter', frequency: 'Quarterly', nextDue: '3 months', appliance: 'Washing Machine' },
    { task: 'Clean refrigerator condenser coils', frequency: 'Every 6 months', nextDue: '6 months', appliance: 'Refrigerator' },
    { task: 'Service AC — refrigerant & coil check', frequency: 'Annually', nextDue: '12 months', appliance: 'Air Conditioner' },
    { task: 'Descale water heater', frequency: 'Annually', nextDue: '12 months', appliance: 'Water Heater' },
    { task: 'Oil ceiling fan bearings', frequency: 'Annually', nextDue: '12 months', appliance: 'Fans & Motors' }
  ];

  return {
    applianceHealth: results,
    urgentItems,
    maintenanceCalendar,
    totalUrgentCount: urgentItems.length,
    overallHealthScore: Math.max(0, Math.round(100 - urgentItems.length * 15))
  };
}

module.exports = { applianceHealthEngine };
