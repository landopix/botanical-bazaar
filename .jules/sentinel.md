## 2025-05-18 - Unauthenticated Email Relay & Error Information Disclosure

**Vulnerability:** Unauthenticated access to `/api/almanac/send.js` permitted arbitrary email dispatch (open relay risk). In addition, catch blocks in `/api/almanac/send.js` and `/api/checkout.js` leaked raw exception error messages (`err.message`) in HTTP 500 responses.

**Learning:** Public Next.js API routes without secret token verification can be abused as open email proxies if exposed. Returning raw exception messages to clients exposes internal system details and stack traces.

**Prevention:** Enforce header-based API key/token authentication (`x-api-key` or `Authorization: Bearer <token>`) for sensitive administrative API endpoints. Log detailed errors server-side while returning clean, generic error messages (`An internal server error occurred.`) to callers.

## Pre-Migration UI Fortification & Layout Safeguards (2026)
- **Rigid Aspect Ratio Boundaries:** Enforced `aspect-square` (1:1) on product images, `aspect-[4/3]` (4:3) on collector gallery items & care sheets, and `aspect-video` (16:9) on event banner images combined with `object-cover` to prevent card container distortion across dynamic Shopify/Sanity inputs.
- **Line Clamping Utilities:** Added `.line-clamp-1` through `.line-clamp-4` utility rules in `style.css` and added configurable props (`titleClamp`, `descClamp`) across card components to normalize multi-line descriptions and prevent grid height misalignment.
- **Uniform Card Flex Layouts:** Cards across Shop, Wishlist, Sales, Almanac, Events, and Gallery use `flex flex-col h-full` with `flex-grow` on content containers so call-to-action buttons anchor uniformly to the bottom of each grid cell.
- **Branded Skeleton Loaders:** Created standalone reusable skeleton loaders (`ProductCardSkeleton`, `CareSheetSkeleton`, `EventCardSkeleton`, `GalleryItemSkeleton`) styled with Tailwind `animate-pulse` using lighter forest green (`#123826` / `#1C3D2E`) backgrounds and low-opacity Warm Gold (`#D4B06A`) glowing borders.
- **Defensive Data Fallbacks:** Applied optional chaining (`?.`) and nullish coalescing (`??`) across all card props and catalog mapping logic to safely render default fallbacks when fields are null or missing.

## SEO & Sitemap Security & Discoverability
- Build-time sitemap generation script  cleanly queries live Shopify product handles and merges canonical static routes into .
- Exclude internal administrative routes (, , ) from  to prevent unnecessary search index exposure.
- Enforce absolute site origin () for all canonical tags, , and  metadata across server rendering and client hydration.

## SEO & Sitemap Discoverability & Account Unification
- Build-time sitemap generator (`bin/generate-sitemap.js`) cleanly queries live Shopify product handles and merges canonical static routes into `public/sitemap.xml`.
- Exclude internal administrative/utility routes (`/admin`, `/cancel`, `/success`) from `public/sitemap.xml` to prevent unnecessary search index exposure.
- Enforce absolute site origin (`https://thebotanicalbazaar.com`) for all canonical tags, `og:url`, and `og:image` metadata across server rendering and client hydration.
- Unify customer account links across header, footer, mobile sidebar, and redirects to target the configured Shopify customer portal login URL.

## 2026-08-23 - Hardcoded Secret Removal & HTTP Security Headers

**Vulnerability:** `pages/api/revalidate.js` contained a hardcoded fallback secret string ('botanical_bazaar_revalidate_secret') allowing unauthenticated catalog revalidation in production. Additionally, HTTP security headers were missing from global response configurations.

**Learning:** Hardcoded fallback tokens in authentication arrays bypass secret validation if exposed in source code. Standard HTTP response security headers are required to prevent clickjacking, MIME-type sniffing, and framing attacks.

**Prevention:** Rely strictly on process.env secrets (`REVALIDATE_SECRET`, `SHOPIFY_WEBHOOK_SECRET`, etc.) in production, allowing fallback only in non-production environments when no secrets exist. Enforce HTTP security headers (`Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) in `next.config.js`.

## 2026-08-24 - Tech Stack Fingerprint Prevention (`poweredByHeader: false`)

**Vulnerability:** Default Next.js header output includes `X-Powered-By: Next.js`, exposing backend framework identity to external security scanners and potential attackers.

**Learning:** Server banner and tech stack headers allow potential attackers to perform targeted vulnerability scans and exploit framework-specific edge cases.

**Prevention:** Explicitly configure `poweredByHeader: false` in `next.config.js` to strip `X-Powered-By` headers from HTTP responses across all Next.js routes.

## 2026-08-25 - OAuth CSRF Protection State Validation

**Vulnerability:** `pages/api/auth/shopify/callback.js` did not validate the OAuth `state` query parameter against the stored `shopify_oauth_state` session cookie during authorization code exchange.

**Learning:** OAuth 2.0 flows without strict state verification are vulnerable to Cross-Site Request Forgery (CSRF) attacks, where an attacker can trick a user or system into performing unauthorized authorization exchanges.

**Prevention:** Always verify incoming `req.query.state` against the stored HttpOnly cookie (`req.cookies.shopify_oauth_state`) before exchanging authorization codes for access tokens in OAuth callbacks.
