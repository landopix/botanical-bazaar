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
