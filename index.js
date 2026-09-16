require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { connectToMongoDB, getConnection } = require('./config/db');
const { restrictToLoggedinUserOnly, checkAuth } = require('./middlewares/auth');
const { handleRedirect } = require('./controllers/redirect');

// Routes
const urlRoutes = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 8001;
// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuth);

// Static Files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Middleware
app.use(async (req, res, next) => {
  if (req.path === '/healthz') return next();
  try {
    await connectToMongoDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/url', restrictToLoggedinUserOnly, urlRoutes);
app.use('/user', userRoute);
app.use('/', staticRouter);

// Health Check Endpoint
app.get('/healthz', (req, res) => {
  const readyState = getConnection().readyState;
  res.json({
    ok: readyState === 1,
    mongooseReadyState: readyState,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    node: process.version,
  });
});

// Short ID Redirect Route
app.get('/:shortId', handleRedirect);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`Unhandled Error [${err.name}]: ${err.message}`, err.stack);
  const responseMessage = process.env.NODE_ENV === 'production'
    ? 'Something went wrong!'
    : `Something went wrong: ${err.message}`;
  res.status(500).send(responseMessage);
});

// Server Start
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
}

module.exports = app;
