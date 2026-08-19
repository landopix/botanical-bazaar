## 2025-05-18 - Unauthenticated Email Relay & Error Information Disclosure

**Vulnerability:** Unauthenticated access to `/api/almanac/send.js` permitted arbitrary email dispatch (open relay risk). In addition, catch blocks in `/api/almanac/send.js` and `/api/checkout.js` leaked raw exception error messages (`err.message`) in HTTP 500 responses.

**Learning:** Public Next.js API routes without secret token verification can be abused as open email proxies if exposed. Returning raw exception messages to clients exposes internal system details and stack traces.

**Prevention:** Enforce header-based API key/token authentication (`x-api-key` or `Authorization: Bearer <token>`) for sensitive administrative API endpoints. Log detailed errors server-side while returning clean, generic error messages (`An internal server error occurred.`) to callers.

## 2026-08-19 - Path Traversal & Format String Sanitization in Sandbox API Routes

**Vulnerability:** Visual sandbox API handlers (`/api/save.js` and `/api/load.js`) constructed file system path expressions using unvalidated user input (`req.body.page` and `req.query.page`), introducing potential path traversal risks (`Uncontrolled data used in path expression`). Additionally, raw user input was concatenated into `console.error` and response messages (`Use of externally-controlled format string`).

**Learning:** Combining raw request parameters into `path.join()` without strict regex validation or directory boundary checks allows malicious relative path inputs (e.g., `../`). Constructing format strings with user input can lead to log injection or format string specifier vulnerabilities.

**Prevention:** Enforce strict alphanumeric format validation (e.g. `/^[a-zA-Z0-9_-]+$/`) and `path.basename` on user-supplied file identifiers. Verify that `path.resolve(targetPath)` strictly starts with `allowedDirectory + path.sep`. Avoid user input concatenation in console format strings by passing variables as separate arguments.
