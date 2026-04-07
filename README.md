# URL-Shortener

A simple URL shortening application built with Node.js, Express, MongoDB, and Mongoose.

## Features

- Create shortened URLs from long URLs
- Track click analytics and visit history
- Automatic redirect to original URL on access

## Tech Stack

- **Runtime:** Node.js
- **Web Framework:** Express 5.x
- **Template Engine:** EJS
- **Database:** MongoDB with Mongoose ODM
- **Development:** nodemon for auto-restart

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The server will run on `http://localhost:8001`

## API Endpoints

### Create Short URL
```bash
POST /url
Content-Type: application/json

{
  "url": "https://example.com/very/long/path"
}
```

**Response:**
```json
{
  "shortURL": "http://localhost:8001/abc123"
}
```

### Get Analytics
```bash
GET /analytics/:shortId
```

**Response:**
```json
{
  "totalClicks": 5,
  "analytics": [
    {"timestamp": 1711697600000},
    {"timestamp": 1711697700000}
  ]
}
```

### Redirect (Automatic)
```bash
GET /:shortId
```
Redirects to the original URL and logs the visit.

## Database Schema

The `URL` model stores:
- `shortId`: Unique identifier for the shortened URL
- `redirectUrl`: The original long URL
- `totalClicks`: Total number of clicks (calculated from visit history)
- `visitHistory`: Array of visit timestamps

## Project Structure

```
.
├── index.js          # Main application file
├── connect.js        # MongoDB connection utility
├── controllers/
│   └── url.js        # Route controllers
├── models/
│   └── url.js        # MongoDB schema
├── routes/
│   ├── url.js        # URL API routes
│   └── staticRouter.js
├── views/
│   └── home.ejs      # EJS template
├── package.json
└── README.md
```

## Author
Devcodes06
