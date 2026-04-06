const express = require("express")
const mongoose = require('mongoose')


async function connectTOMongoDB(url){

return mongoose.connect(url)

}

module.exports = {connectTOMongoDB}