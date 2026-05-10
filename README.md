# URL-Shortener

A simple URL shortening application built with Node.js, Express, MongoDB, and Mongoose, now powered by AI.

## Features

- **AI-Powered Insights**: Automatically generates a catchy **Title** and a **1-sentence Summary** for every shortened URL using the **Gemini AI API**.
- **Website Crawling**: Uses `axios` to fetch metadata from the target URL to provide context to the AI.
- **User Authentication**: Secure Signup and Login using JWT (JSON Web Tokens).
- **Seamless Flow**: Automatically logs users in immediately after a successful signup.
- **Global Auth Middleware**: Robust session management using a global `checkAuth` middleware.
- **Improved UI/UX**:
    - Real-time error feedback on Login and Signup pages.
    - Secure password masking (using `type="password"`).
    - Responsive EJS templates.
- **Password Security**: Passwords are hashed using `bcryptjs` before storage with modern Mongoose async hooks.
- **Protected Routes**: Short URL generation and analytics are restricted to logged-in users.
- **URL Shortening**: Create shortened URLs from long URLs.
- **Analytics**: Track click analytics and visit history.
- **Redirection**: Automatic redirect to original URL on access.

## Recent Improvements & Fixes

- **Mongoose Hook Fix**: Refactored the User model pre-save hook to use modern async/await patterns, resolving `next is not a function` errors.
- **Global Auth state**: Implemented `checkAuth` as a global middleware to ensure consistent user state across all public and private routes.
- **Error Handling**: Added server-side validation and error passing to EJS views to handle duplicate email registrations and invalid credentials gracefully.
- **Security**: Upgraded password input fields from plain text to masked fields and synchronized bcrypt salt rounds for consistent hashing.

## Tech Stack

- **AI Engine:** Google Gemini API (`@google/generative-ai`)
- **Runtime:** Node.js
- **Web Framework:** Express 5.x
- **Template Engine:** EJS
- **Database:** MongoDB with Mongoose ODM
- **Security:** `bcryptjs` for hashing, `jsonwebtoken` for auth.
- **Utilities:** `axios` for web fetching, `shortid` for ID generation, `dotenv` for environment management.

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY from https://aistudio.google.com/

# Start the development server
npm start
```

The server will run on `http://localhost:8001`

## API & Authentication

### Authentication Endpoints
- `POST /user/signup`: Create a new account.
- `POST /user/login`: Authenticate and receive a session cookie.

### URL Endpoints (Require Authentication)
- `POST /url`: Generate a shortened URL with AI-generated title and summary.
- `GET /url/analytics/:shortId`: View click history.

## Project Structure

```
.
├── index.js          # Main application entry point (loads dotenv)
├── connect.js        # MongoDB connection utility
├── controllers/
│   ├── url.js        # URL business logic + Gemini AI Integration
│   └── user.js       # Authentication logic (Signup/Login)
├── middlewares/
│   └── auth.js       # JWT & Route protection middleware
├── models/
│   ├── url.js        # URL Schema (includes title & summary)
│   └── user.js       # User Schema with Bcrypt pre-save hook
├── routes/
│   ├── url.js        # Protected URL routes
│   ├── user.js       # Auth routes
│   └── staticRouter.js # View routes (handles query params for UI)
├── service/
│   └── auth.js       # JWT Sign/Verify service
├── views/            # EJS templates with Title/Summary display
├── .env.example      # Environment variable template
├── package.json
└── README.md
```

## Author
Devcodes06
