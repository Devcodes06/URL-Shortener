require('dotenv').config();
const express = require('express');
const path = require("path")
const cookieParser = require("cookie-parser")
const {restrictToLoggedinUserOnly,checkAuth} = require("./middlewares/auth")

//Model Connection
const { connectTOMongoDB } = require("./connect");

//Models
const URL = require("./models/url")

//Routes
const urlRoutes = require("./routes/url");
const staticRouter = require("./routes/staticRouter")
const userRoute = require("./routes/user")

const app = express();
const port = process.env.PORT || 8001;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(checkAuth)

//Routing
app.use("/url",restrictToLoggedinUserOnly, urlRoutes)
app.use("/user", userRoute)
app.use("/", staticRouter)

//EJS setup
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))


// app.get("/test", async (req,res) => {
// const allUrls = await URL.find({})
//     return res.render("home", {
//         urls : allUrls
//     })
// })

//MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/short-url";
connectTOMongoDB(mongoURI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log("Error connecting to MongoDB", err);
});



app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { shortId },
        {
            $push: {
                visitHistory: { timestamp: Date.now() },
            },
        }
    );

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectUrl);
});
  

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});