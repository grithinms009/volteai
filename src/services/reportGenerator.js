const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const prisma = require('../db');
const { rewriteInsights } = require('./ollamaService');

async function generateReport(bill, analysisResult) {
  console.log(`[REPORT] Generating PDF for bill ${bill.id}...`);

  try {
    // 1. Get narrative from Ollama
    const narrative = await rewriteInsights(analysisResult);

    // 2. Read template
    let html = fs.readFileSync(path.join(__dirname, '../templates/report.html'), 'utf8');

    // 3. Prepare color for score
    let scoreColor = '#ecfdf5'; // green
    if (analysisResult.efficiencyScore < 40) scoreColor = '#fee2e2'; // red
    else if (analysisResult.efficiencyScore < 70) scoreColor = '#fef3c7'; // yellow

    // 4. Inject variables
    const replacements = {
      billId: bill.id,
      date: new Date().toLocaleDateString(),
      efficiencyScore: analysisResult.efficiencyScore,
      scoreColor: scoreColor,
      monthlySavings: analysisResult.monthlySavingsEstimate,
      annualSavings: analysisResult.annualSavingsEstimate,
      effectiveRate: analysisResult.effectiveRate,
      currency: analysisResult.effectiveRateCurrency || 'INR',
      usageIntensity: analysisResult.usageIntensity,
      profileType: bill.profileType.replace('_', ' '),
      narrative: narrative.replace(/\n/g, '<br>')
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, replacements[key]);
    });

    // Handle recommendations list
    const recsHtml = analysisResult.recommendations.map(r => `<li class="recommendation-item">${r}</li>`).join('');
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
