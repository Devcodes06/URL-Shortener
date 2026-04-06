const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema({

shortId: {
    type: String,
    unique: true
},
redirectUrl: {
    type: String,
    required: true , 
},
totalCLicks: {
    type: Number,
    default: 0
},
visitHistory: [{timestamp: {type: Number}}],

},

{timestamps: true   }
)

const URL = mongoose.model("url",urlSchema)

module.exports = URL