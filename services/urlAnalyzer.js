const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeUrl(url) {
  let title = 'Unknown Title';
  let summary = 'No summary available.';

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    const htmlSnippet = html.substring(0, 10000);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Analyze the following HTML from a website and provide:
      1. A catchy, human-readable title for the page (max 60 chars).
      2. A concise 1-sentence summary of what the website is about (max 150 chars).
      
      Return ONLY a JSON object:
      {
        "title": "string",
        "summary": "string"
      }
      
      HTML:
      ${htmlSnippet}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    try {
      const data = JSON.parse(aiResponse);
      if (data.title) title = data.title;
      if (data.summary) summary = data.summary;
    } catch (parseError) {
      console.error('AI JSON Parse Error:', parseError.message);
    }
  } catch (error) {
    console.error('URL Analysis Error:', error.message);
  }

  return { title, summary };
}

module.exports = { analyzeUrl };
