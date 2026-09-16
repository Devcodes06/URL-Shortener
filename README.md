# AI-Powered URL Shortener

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MongoDB-green.svg)](https://www.mongodb.com/)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-blue.svg)](https://aistudio.google.com/)

A modern, production-grade URL shortening service built with **Node.js**, **Express.js**, and **MongoDB**. In addition to standard short link redirection and analytics, every link is automatically inspected via web scraping (`axios`) and summarized using **Google Gemini 1.5 Flash** to generate human-readable titles and one-sentence summaries.

> 📖 **Deep Technical Specification**: For an exhaustive, line-by-line backend architectural breakdown, schemas, and sequence diagrams, refer to [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md).

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Directory Layout](#-directory-layout)
- [Quick Start & Installation](#-quick-start--installation)
- [Environment Configuration](#-environment-configuration)
- [API & Route Reference](#-api--route-reference)
- [AI Summarization Pipeline](#-ai-summarization-pipeline)
- [Testing](#-testing)
- [AI Agent & Contributor Operational Guide](#-ai-agent--contributor-operational-guide)
- [License & Author](#-license--author)

---

## 🚀 Features

- **Automated AI Link Summarization**: Uses Google Gemini 1.5 Flash to automatically generate a catchy title (max 60 chars) and concise 1-sentence summary (max 150 chars) for every shortened URL.
- **Webpage Scraping**: Fast metadata crawler using `axios` with desktop browser user-agents and timeout guards.
- **Stateful Redirection & Click Analytics**: Captures millisecond-precision click history timestamps and counts upon each redirection.
- **Stateless JWT Authentication**: Secure user session tracking stored in HttpOnly cookies with 24-hour expiration.
- **Cryptographic Security**: Automatic salted password hashing via `bcryptjs` using Mongoose pre-save hooks.
- **Ownership Protection**: URL analytics and deletion are strictly authorized per-user.
- **Interactive UI**: Server-side rendered EJS templates with modal click analytics, live search filtering, and one-click copy.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Server runtime |
| **Framework** | Express.js 4.x | HTTP routing and middleware pipeline |
| **Database** | MongoDB & Mongoose 8.x | Document database and object modeling |
| **AI Model** | Google Gemini (`gemini-1.5-flash`) | Structured JSON title and summary generation |
| **Web Scraping** | Axios | HTML fetching with timeout and user-agent emulation |
| **Auth & Security** | JWT (`jsonwebtoken`) & `bcryptjs` | Stateless session tokens and password hashing |
| **ID Generator** | `nanoid` (v3) | Unique 8-character URL slugs |
| **View Engine** | EJS | Server-side rendered responsive user interface |
| **Testing** | Mocha, Chai, Supertest | Unit and integration testing |

---

## 🏛️ System Architecture

```text
               +-------------------------------------------------+
               |                   Browser Client                |
               +-------------------------------------------------+
                                      |
                           HTTP Requests / Cookies
                                      v
+---------------------------------------------------------------------------------+
| Express Application (index.js)                                                  |
|                                                                                 |
|   [Global Middlewares]                                                          |
|    - express.json() & express.urlencoded()                                      |
|    - cookieParser()                                                             |
|    - checkAuth (Populates req.user from JWT cookie)                             |
|                                                                                 |
|   [Routes & Middlewares]                                                        |
|    - /user  ──────────────> user.js (Signup / Login / Logout)                   |
|    - /url   ──[restrict]──> url.js (Create, Analytics, Delete)                  |
|    - /      ──────────────> staticRouter.js (Landing / Dashboard views)         |
|    - /:shortId ───────────> redirect.js (Atomic click track & 302 redirect)     |
+---------------------------------------------------------------------------------+
           |                                  |                        |
           v                                  v                        v
+-----------------------+          +--------------------+    +--------------------+
| MongoDB (Mongoose)    |          | Axios Web Scraper  |    | Google Gemini API  |
| - users collection    |          | (HTML Title Match) |    | (1.5 Flash Model)  |
| - urls collection     |          +--------------------+    +--------------------+
+-----------------------+
```

---

## 📂 Directory Layout

```text
.
├── config/
│   └── db.js                 # MongoDB connection handler (mongoose.connect)
├── controllers/
│   ├── redirect.js           # Handles /:shortId redirection & $push click history
│   ├── url.js                # Short URL creation (AI-backed), analytics, deletion
│   └── user.js               # User registration, login verification, logout
├── middlewares/
│   └── auth.js               # Auth guards (checkAuth, restrictToLoggedinUserOnly)
├── models/
│   ├── url.js                # URL Schema (shortId, redirectUrl, visitHistory, etc.)
│   └── user.js               # User Schema with bcrypt pre-save hashing
├── routes/
│   ├── staticRouter.js       # View rendering routes (GET /, GET /signup, GET /login)
│   ├── url.js                # Authenticated URL actions (/url)
│   └── user.js               # User auth endpoints (/user)
├── services/
│   ├── auth.js               # JWT signing (setUser) and token parsing (getUser)
│   └── urlAnalyzer.js        # Axios crawler + Gemini 1.5 Flash JSON analyzer
├── test/
│   └── user.test.js          # User API integration tests (Mocha/Chai/Supertest)
├── views/
│   ├── home.ejs              # Logged-in user dashboard and management UI
│   ├── landing.ejs           # Public showcase page for unauthenticated visitors
│   ├── login.ejs             # Login form
│   └── signup.ejs            # User registration form
├── .env.example              # Sample environment template
├── BACKEND_DOCUMENTATION.md  # Detailed technical specification
├── index.js                  # Main server entrypoint
├── package.json              # Project dependencies and npm scripts
└── README.md                 # Primary overview and guide
```

---

## 📦 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas connection string
- **Google Gemini API Key** (Free from [Google AI Studio](https://aistudio.google.com/))

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Devcodes06/URL-Shortener.git
   cd URL-Shortener
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (copy from `.env.example`):
   ```env
   PORT=8001
   MONGODB_URI=mongodb://localhost:27017/short-url
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Run the Application**
   ```bash
   # Development mode with Nodemon auto-reload:
   npm run dev

   # Production mode:
   npm start
   ```

5. **Access the Web Interface**
   Open your browser and navigate to: `http://localhost:8001`

---

## ⚙️ Environment Configuration

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `8001` | HTTP listening port for Express server |
| `MONGODB_URI` | Optional | `mongodb://localhost:27017/short-url` | MongoDB connection URI |
| `JWT_SECRET` | Optional | `your-very-secure-secret` | Cryptographic secret for signing JSON Web Tokens |
| `GEMINI_API_KEY` | Optional* | None | Gemini API Key for AI titles & summaries (*gracefully falls back if missing) |

---

## 🔐 API & Route Reference

### Authentication Endpoints (`/user`)

| Method | Endpoint | Auth | Request Body | Description & Response |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/user` | No | `{ name, email, password }` | Registers user, hashes password, sets `uid` cookie, redirects (302) to `/`. |
| `POST` | `/user/login` | No | `{ email, password }` | Validates credentials, sets `uid` cookie, redirects (302) to `/`. |
| `POST` | `/user/logout` | No | None | Clears `uid` cookie and redirects (302) to `/`. |

> ⚠️ **Note on Signup Route**: The registration endpoint is `POST /user`, **not** `/user/signup`.

### URL Management Endpoints (`/url`)
*All `/url` endpoints require an active authenticated user session (`uid` cookie).*

| Method | Endpoint | Auth | Parameters / Body | Description & Response |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/url` | **Yes** | Body: `{ url: "https://example.com" }` | Scrapes target, runs Gemini AI, creates short URL, redirects (302) to `/?id=<shortId>`. |
| `GET` | `/url/analytics/:shortId` | **Yes** | Param: `shortId` | Returns `{ totalClicks, analytics: [{ timestamp }] }` for user's own URL. Returns 403 if unauthorized. |
| `DELETE`| `/url/:shortId` | **Yes** | Param: `shortId` | Deletes the short URL document. Returns `{ message: "URL deleted successfully" }`. Returns 403 if unauthorized. |

### Redirection & Static Routes

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/:shortId` | No | Atomically pushes `{ timestamp: Date.now() }` to `visitHistory` and redirects (302) to original target URL. |
| `GET` | `/` | Optional | If logged in: renders `home.ejs` with user's links. If logged out: renders `landing.ejs`. |
| `GET` | `/signup` | No | Renders user signup form (`signup.ejs`). |
| `GET` | `/login` | No | Renders user login form (`login.ejs`). |

---

## 🧠 AI Summarization Pipeline

When a user submits a URL via `POST /url`:
1. `services/urlAnalyzer.js` issues an Axios GET request with a 5-second timeout and realistic desktop User-Agent.
2. It captures the `<title>` tag via regex and takes the first 10,000 characters of the HTML document.
3. It passes the snippet to **Google Gemini 1.5 Flash** with `responseMimeType: "application/json"`.
4. Gemini returns a structured JSON payload containing a human title (`max 60 chars`) and summary (`max 150 chars`).
5. **Fallback Guarantee**: If scraping or Gemini fails (network timeout, invalid key, rate limit), the service catches the error and assigns fallback values (`"Unknown Title"` and `"No summary available."`). The URL shortening process **never fails** due to AI downtime.

---

## 🧪 Testing

The repository includes an automated integration test suite written with **Mocha**, **Chai**, and **Supertest**:

```bash
# Run all tests
npm test
```

### What is Tested:
- User signup with successful creation, redirect, and cookie issuance.
- Form validation (returns 400 when name/email/password are missing).
- User login with credential validation and cookie setting.
- Bad credential rejection (returns 400 for wrong password).
- User logout and cookie clearance verification.

---

## 🤖 AI Agent & Contributor Operational Guide

If you are an automated AI agent or human contributor working on this repository, strictly observe these rules:

1. **Module System**: This project is **CommonJS** (`"type": "commonjs"`). Use `const x = require('x')` and `module.exports = ...`. Do not use ES6 `import`/`export`.
2. **Wildcard Route Ordering**: In `index.js`, `app.get('/:shortId', handleRedirect)` is a catch-all route for short links. **Any new static or API route must be declared above this line**, or it will be intercepted as a `shortId`.
3. **Password Updates**: The user password hashing hook in `models/user.js` triggers **only** on document `save()`. Updating passwords with `User.findOneAndUpdate` bypasses `bcrypt` and leaves passwords unhashed.
4. **Foreign Key Integrity**: In `models/url.js`, `createdBy` is configured with `ref: "users"`. If calling `.populate("createdBy")`, ensure the model name matches your schema.
5. **Form Action Paths**:
   - Signup form posts to `/user`.
   - Login form posts to `/user/login`.
   - Logout form posts to `/user/logout`.
   - URL creation form posts to `/url`.
6. **Graceful Failures**: Keep external AI/scraping service failures isolated within `try/catch` blocks so user actions (like shortening a URL) remain dependable.

---

## 📝 License

This project is licensed under the **MIT License**.

## 👤 Author

**Devcodes06**
- GitHub: [@Devcodes06](https://github.com/Devcodes06)
