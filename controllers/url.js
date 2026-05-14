const { nanoid } = require('nanoid');
const URL = require('../models/url');
const { analyzeUrl } = require('../services/urlAnalyzer');

async function handleGenerateShortURL(req, res) {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const shortID = nanoid(8);
    const { title, summary } = await analyzeUrl(url);

    await URL.create({
      shortId: shortID,
      redirectUrl: url,
      visitHistory: [],
      createdBy: req.user._id,
      title,
      summary,
    });

    return res.redirect(`/?id=${shortID}`);
  } catch (error) {
    console.error('Error generating short URL:', error);
    return res.status(500).render('home', {
      error: 'Failed to generate short URL. Please try again.',
    });
  }
}

async function handleGetAnalytics(req, res) {
  const { shortId } = req.params;
  
  try {
    const result = await URL.findOne({ shortId });

    if (!result) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (result.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

async function handleDeleteURL(req, res) {
  const { shortId } = req.params;
  
  try {
    const result = await URL.findOne({ shortId });
    if (!result) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (result.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await URL.deleteOne({ shortId });
    return res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete URL' });
  }
}

module.exports = {
  handleGenerateShortURL,
  handleGetAnalytics,
  handleDeleteURL,
};
