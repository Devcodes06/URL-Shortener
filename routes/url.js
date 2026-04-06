const express = require ("express")
const router = express.Router()
const URL = require("../models/url")    
const { handleGenerateShortURL, handleGetAnalytics } = require("../controllers/url")

router.post("/url",handleGenerateShortURL)

router.get("/analytics/:shortId", handleGetAnalytics)

module.exports = router