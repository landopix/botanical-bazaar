## 2025-05-18 - Unauthenticated Email Relay & Error Information Disclosure

**Vulnerability:** Unauthenticated access to `/api/almanac/send.js` permitted arbitrary email dispatch (open relay risk). In addition, catch blocks in `/api/almanac/send.js` and `/api/checkout.js` leaked raw exception error messages (`err.message`) in HTTP 500 responses.

**Learning:** Public Next.js API routes without secret token verification can be abused as open email proxies if exposed. Returning raw exception messages to clients exposes internal system details and stack traces.

**Prevention:** Enforce header-based API key/token authentication (`x-api-key` or `Authorization: Bearer <token>`) for sensitive administrative API endpoints. Log detailed errors server-side while returning clean, generic error messages (`An internal server error occurred.`) to callers.
