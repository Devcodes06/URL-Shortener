const express = require("express");
const router = express.Router();
const {
  handleGenerateShortURL,
  handleGetAnalytics,
  handleDeleteURL,
} = require("../controllers/url");
const { restrictToLoggedinUserOnly } = require("../middlewares/auth");

router.post("/", restrictToLoggedinUserOnly, handleGenerateShortURL);

router.get("/analytics/:shortId", restrictToLoggedinUserOnly, handleGetAnalytics);

router.delete("/:shortId", restrictToLoggedinUserOnly, handleDeleteURL);

module.exports = router;