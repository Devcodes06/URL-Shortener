# Debug Notes: URL Shortener Auth & Database Connection Diagnosis

## Task 1: Reproduction & Capture of Original Error

### 1. Local Reproduction with Bad DB URI
- **Command**: `MONGODB_URI="mongodb://127.0.0.1:59999/short-url" npm start`
- **Result**: Express server starts listening on `http://localhost:8001` immediately because `connectToMongoDB` was called as an unawaited fire-and-forget promise in `index.js`.

### 2. POST /user/login Reproduction
- **Request**: `curl -i -X POST http://localhost:8001/user/login -d "email=a@b.com&password=x"`
- **Response**:
  ```text
  curl: (56) Recv failure: Connection was reset
  ```
- **Stderr Stack (verbatim)**:
  ```text
  C:\Coding\URL_Shortner\node_modules\mongoose\lib\drivers\node-mongodb-native\collection.js:187
            const err = new MongooseError(message);
                        ^

  MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
      at Timeout.<anonymous> (C:\Coding\URL_Shortner\node_modules\mongoose\lib\drivers\node-mongodb-native\collection.js:187:23)
      at listOnTimeout (node:internal/timers:605:17)
      at process.processTimers (node:internal/timers:541:7)

  Node.js v24.13.1
  ```

### 3. POST /user (Signup) Reproduction
- **Request**: `curl -i -X POST http://localhost:8001/user -d "name=a&email=a@b.com&password=x"`
- **Response**: After 10,000ms buffer hang, returned HTTP 200 rendering `signup.ejs` with:
  ```html
  <div class="error-alert">
    <i class="bi bi-exclamation-circle-fill"></i>
    Something went wrong
  </div>
  ```
- **Server Stderr (verbatim)**:
  ```text
  Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:59999
  ```
  Immediately followed by process termination via `process.exit(1)` in `config/db.js`.

### 4. Production Invocation Error (Vercel)
- **Production URL**: `https://url-shortener-gray-two.vercel.app`
- **Request**: `curl.exe -i -X POST https://url-shortener-gray-two.vercel.app/user/login -d "email=a@b.com&password=x"`
- **Observed Response**: Hangs for ~23 seconds and fails with:
  ```http
  HTTP/1.1 500 Internal Server Error
  Cache-Control: public, max-age=0, must-revalidate
  Content-Length: 96
  Content-Type: text/plain; charset=utf-8
  Date: Tue, 15 Sep 2026 07:38:53 GMT
  Server: Vercel
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Vercel-Cache: MISS
  X-Vercel-Error: FUNCTION_INVOCATION_FAILED
  X-Vercel-Id: bom1::nwnmh-1789457910310-f29bd71e6857

  A server error has occurred

  FUNCTION_INVOCATION_FAILED

  bom1::nwnmh-1789457910310-f29bd71e6857
  ```
- **Vercel CLI Status**: `npx vercel logs` prompted for interactive authentication (`No existing credentials found. Starting login flow...`) so raw function logs could not be streamed via CLI directly. However, the production response `X-Vercel-Error: FUNCTION_INVOCATION_FAILED` after a ~23-second timeout directly confirms the lambda crashed/timed out due to the unhandled connection hang and `process.exit(1)` behavior.

---

## Root Cause Analysis
1. `index.js` defaulted `MONGODB_URI` to `mongodb://localhost:27017/short-url`. On Vercel serverless functions, no local MongoDB instance exists.
2. In production, if `MONGODB_URI` is missing or unable to reach Atlas, Mongoose defaults to buffering queries for 10 seconds (`bufferCommands: true`).
3. `handleUserLogin` in `controllers/user.js` had zero `try/catch` wrapping `User.findOne({ email })`. When buffering timed out at 10s, an unhandled rejection occurred.
4. `config/db.js` invoked `process.exit(1)` on connection failure, abruptly killing the serverless Node.js lambda environment and producing `FUNCTION_INVOCATION_FAILED`.
5. In addition, Mongoose connections were not cached across serverless invocations (`globalThis`), creating multiple connection attempts across warm/cold lambdas.
