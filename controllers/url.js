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
    // Fetch website content (limit to first 5000 chars of HTML to avoid token limits)
    const response = await axios.get(body.url, { timeout: 5000 });
    const htmlSnippet = response.data.substring(0, 5000);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Analyze the following HTML snippet from a website and provide:
      1. A catchy title for the page.
      2. A concise 1-sentence summary of what the website is about.
      
      Return the result in JSON format like this:
      {
        "title": "Your Catchy Title",
        "summary": "Your 1-sentence summary"
      }
      
      HTML Snippet:
      ${htmlSnippet}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    // Clean JSON response (remove markdown if present)
    const jsonMatch = aiResponse.match(/\{.*\}/s);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      title = data.title || title;
      summary = data.summary || summary;
    }
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    // Continue with default values if AI fails
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
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = { handleGenerateShortURL, handleGetAnalytics };