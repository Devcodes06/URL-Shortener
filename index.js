require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { connectToMongoDB } = require('./config/db');
const { restrictToLoggedinUserOnly, checkAuth } = require('./middlewares/auth');
const { handleRedirect } = require('./controllers/redirect');

// Routes
const urlRoutes = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/short-url';

// Database Connection
connectToMongoDB(MONGODB_URI);

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuth);

// Static Files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/url', restrictToLoggedinUserOnly, urlRoutes);
app.use('/user', userRoute);
app.use('/', staticRouter);

// Short ID Redirect Route
app.get('/:shortId', handleRedirect);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('home', { error: 'Page not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
