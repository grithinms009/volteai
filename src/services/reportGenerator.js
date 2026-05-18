const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const prisma = require('../db');
const { rewriteInsights } = require('./ollamaService');

async function generateReport(bill, analysisResult) {
  console.log(`[REPORT] Generating PDF for bill ${bill.id}...`);

  try {
    // 1. Get narrative — use cached aiNarrative if available, else generate fresh
    const narrative = analysisResult.aiNarrative || await rewriteInsights(analysisResult);

    // 2. Read template
    let html = fs.readFileSync(path.join(__dirname, '../templates/report.html'), 'utf8');

    // 3. Prepare color for score
    const score = analysisResult.efficiencyScore || 0;
    let scoreColor = '#ecfdf5'; // green
    if (score < 40) scoreColor = '#fee2e2'; // red
    else if (score < 70) scoreColor = '#fef3c7'; // yellow

    // 4. Normalise recommendations — support both old flat array and new engine shape
    const recsSource = analysisResult.recommendationsData?.recommendations ||
      analysisResult.recommendationsDetailed ||
      analysisResult.recommendations || [];
    const recsArray = recsSource.map(r => (typeof r === 'string' ? r : r.title || r.text || ''));

    // 5. Inject variables
    const replacements = {
      billId: bill.id,
      date: new Date().toLocaleDateString(),
      providerName: analysisResult.providerName || 'Unknown Provider',
      unitsConsumed: analysisResult.unitsConsumed || 'N/A',
      totalAmount: analysisResult.totalAmount || 'N/A',
      efficiencyScore: score,
      scoreColor,
      monthlySavings: analysisResult.monthlySavingsEstimate || 0,
      annualSavings: analysisResult.annualSavingsEstimate || 0,
      effectiveRate: analysisResult.effectiveRate || 'N/A',
      currency: analysisResult.effectiveRateCurrency || 'INR',
      usageIntensity: analysisResult.usageIntensity || 'medium',
      profileType: (bill.profileType || 'residential').replace('_', ' '),
      narrative: narrative.replace(/\n/g, '<br>')
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, replacements[key]);
    });

    // Handle recommendations list
    const recsHtml = recsArray.map(r => `<li class="recommendation-item">${r}</li>`).join('');
    html = html.replace('{{#recommendations}}<li class="recommendation-item">{{.}}</li>{{/recommendations}}', recsHtml);

    // 5. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const reportFileName = `Anigravity_Report_${bill.id}.pdf`;
    const reportPath = path.join(config.reportsDir, reportFileName);

    await page.pdf({
      path: reportPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    // 6. Update DB
    await prisma.bill.update({
      where: { id: bill.id },
      data: { reportPath: reportPath }
    });

    console.log(`[REPORT] PDF generated successfully at ${reportPath}`);
    return reportPath;

  } catch (error) {
    console.error(`[REPORT] Generation failed:`, error);
    throw error;
  }
}

module.exports = { generateReport };
