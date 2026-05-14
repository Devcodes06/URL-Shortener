# AI-Powered URL Shortener

A professional, feature-rich URL shortening application built with Node.js, Express, and MongoDB, featuring AI-generated summaries for every link.

## 🚀 Features

- **AI-Powered Insights**: Automatically generates a catchy **Title** and a **1-sentence Summary** for every shortened URL using the **Gemini 1.5 Flash** model.
- **Automated Metadata Extraction**: Crawls target websites using `axios` to provide context for AI analysis.
- **Robust Authentication**: Secure User Signup and Login system using **JWT (JSON Web Tokens)** and **HttpOnly cookies**.
- **Password Security**: Industry-standard password hashing using `bcryptjs` with Mongoose pre-save hooks.
- **Comprehensive Analytics**: Track total clicks and detailed visit history for every shortened link.
- **Clean Architecture**: Modular codebase following the Controller-Service-Repository pattern for scalability and maintainability.
- **Modern UI**: Responsive EJS templates with real-time feedback and secure data handling.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v4.x)
- **Database**: MongoDB with Mongoose ODM
- **AI Engine**: Google Gemini API
- **Authentication**: JWT & `cookie-parser`
- **Security**: `bcryptjs`
- **ID Generation**: `nanoid`
- **View Engine**: EJS

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Devcodes06/URL-Shortener.git
   cd URL-Shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=8001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Get your Gemini API Key at [Google AI Studio](https://aistudio.google.com/)*

4. **Start the application**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The server will be running at `http://localhost:8001`

## 📂 Project Structure

```
├── config/           # Database and application configurations
├── controllers/      # Request handlers and routing logic
├── middlewares/      # Express middlewares (Auth, Error handling)
├── models/           # Mongoose schemas and models
├── routes/           # API and View route definitions
├── services/         # Business logic (AI Analysis, Auth services)
├── views/            # EJS templates for the frontend
├── index.js          # Application entry point
└── .env.example      # Environment variable template
```

## 🔐 API Reference

### Authentication
- `POST /user/signup`: Create a new user account
- `POST /user/login`: Authenticate user and start session
- `POST /user/logout`: Clear session cookies

### URL Management (Requires Auth)
- `POST /url`: Generate a short URL with AI analysis
- `GET /url/analytics/:shortId`: Fetch click data and history
- `DELETE /url/:shortId`: Delete a shortened URL

## 📝 License
This project is licensed under the MIT License.

## 👤 Author
**Devcodes06**
- GitHub: [@Devcodes06](https://github.com/Devcodes06)
