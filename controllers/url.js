const express = require("express")
const shortid = require("shortid")
const URL = require("../models/url")



async function  handleGenerateShortURL(req,res){
const body = req.body
if(!body.url) return res.status(400).json({error: "URL is required"})

    const shortID = shortid()
    await URL.create({
        shortId: shortID,
        redirectUrl: body.url,
        visitHistory: []
    })
    return res.json({shortURL: `${req.headers.host}/${shortID}`})   

}


async function handleGetAnalytics(req,res){
    const shortId = req.params.shortId
    const result = await URL.findOne({shortId})
    return res.json({totalClicks: result.visitHistory.length, analytics: result.visitHistory})
}
module.exports = {handleGenerateShortURL, handleGetAnalytics}