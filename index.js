const express = require('express');
const path = require("path")
const { connectTOMongoDB } = require("./connect");
const urlRoutes = require("./routes/url");
const URL = require("./models/url")

const app = express();
const port = 8001;


// Middleware
app.use(express.json());
app.use("/", urlRoutes);

//EJS setup
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))


app.get("/test", async (req,res) => {
const allUrls = await URL.find({})
    return res.render("home", {
        urls : allUrls
    })
})

//MongoDB connection
connectTOMongoDB("mongodb://localhost:27017/short-url")
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log("Error connecting to MongoDB", err);
});

app.get("/:shortId", async (req, res) => {

    const shortId = req.params.shortId
    const entry=await URL.findOneAndUpdate({
        shortId
    }, {$push: {
        visitHistory: {timestamp: Date.now()}
    }})

res.redirect(entry.redirectUrl)
})
  

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});