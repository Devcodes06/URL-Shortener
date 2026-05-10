const express = require("express");
const shortid = require("shortid");
const URL = require("../models/url");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handleGenerateShortURL(req, res) {
  const body = req.body;
  if (!body.url) return res.redirect("/login");

  const shortID = shortid();
  let title = "Unknown Title";
  let summary = "No summary available.";

  try {
    // 1. Fetch website content with User-Agent to avoid being blocked
    const response = await axios.get(body.url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = response.data;
    
    // Fallback: Simple HTML Title Extraction
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // 2. AI Analysis
    const htmlSnippet = html.substring(0, 10000); // Increased snippet size slightly
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
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
      console.error("AI JSON Parse Error:", parseError.message, "Response:", aiResponse);
      // If JSON parse fails, check for fallback title already extracted
    }

  } catch (error) {
    console.error("URL Analysis Error:", error.message);
    // Continue with default/fallback values
  }

  await URL.create({
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
    createdBy: req.user._id,
    title: title,
    summary: summary,
  });

  return res.redirect("/?id=" + shortID);
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  
  if (!result) {
    return res.status(404).json({ error: "URL not found" });
  }

  if (result.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

async function handleDeleteURL(req, res) {
  const shortId = req.params.shortId;
  try {
    const result = await URL.findOne({ shortId });
    if (!result) return res.status(404).json({ error: "URL not found" });

    if (result.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await URL.deleteOne({ shortId });
    return res.json({ message: "URL deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete URL" });
  }
}

module.exports = { handleGenerateShortURL, handleGetAnalytics, handleDeleteURL };