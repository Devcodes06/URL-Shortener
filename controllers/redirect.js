const URL = require('../models/url');

async function handleRedirect(req, res) {
  const { shortId } = req.params;
  
  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: { timestamp: Date.now() },
        },
      }
    );

    if (!entry) {
      return res.status(404).send('Short URL not found');
    }

    return res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error('Redirect Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}

module.exports = { handleRedirect };
