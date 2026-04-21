const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function extractTextWithTesseract(filePath) {
  const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng');
  return { text, confidence };
}

async function extractTextWithClaudeVision(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');
  
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg", // Fallback for most images
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "Extract all text from this electricity bill image exactly as it appears. Return only the raw text, no formatting."
          }
        ],
      },
    ],
  });

  return response.content[0].text;
}

async function ocrPipeline(filePath, fileType) {
  console.log(`[OCR] Starting pipeline for ${filePath} (${fileType})`);
  
  try {
    // Stage 1: PDF Native Extraction
    if (fileType === 'pdf') {
      const text = await extractTextFromPDF(filePath);
      if (text && text.trim().length > 100) {
        console.log(`[OCR] Stage 1 (PDF Parse) successful`);
        return { text, method: 'pdf-parse', confidence: 'high' };
      }
      console.log(`[OCR] Stage 1 failed or text too short, falling back to Tesseract`);
    }

    // Stage 2: Tesseract OCR
    const { text: tesseractText, confidence } = await extractTextWithTesseract(filePath);
    if (confidence > 60) {
      console.log(`[OCR] Stage 2 (Tesseract) successful with confidence ${confidence}`);
      return { text: tesseractText, method: 'tesseract', confidence: 'medium' };
    }
    console.log(`[OCR] Stage 2 confidence too low (${confidence}), falling back to Claude Vision`);

    // Stage 3: Claude Vision
    const claudeText = await extractTextWithClaudeVision(filePath);
    console.log(`[OCR] Stage 3 (Claude Vision) successful`);
    return { text: claudeText, method: 'claude-vision', confidence: 'low' };

  } catch (error) {
    console.error(`[OCR] Pipeline error:`, error);
    throw error;
  }
}

module.exports = { ocrPipeline };
