# Google Search Console Indexing Errors: Investigation & Resolutions

**Date:** September 2026
**Storefront Target:** https://thebotanicalbazaar.com
**Report Source:** Search Console Coverage Report (`thebotanicalbazaar.com-Coverage-2026-09-08.xlsx`)

---

## Executive Summary

This report outlines the structural fixes implemented in the Next.js codebase and the prioritized Cloudflare/Netlify configuration directives required to eliminate indexing errors flagged in Google Search Console.

---

## 1. Category-by-Category Resolution Summary

### A. Soft 404 (10 pages) & Crawled - Not Indexed (4 pages)
**Root Cause:** Legacy `product.html?item=<slug>` parameter URLs were performing 301 redirects to `/product/<slug>`, which then returned an HTTP 404 if the plant was permanently removed from Shopify. Google Search Console flags redirect chains ending in a 404 as **Soft 404** errors.

**Code Fix Applied:**
- Modified `pages/product.html.js` to query Shopify Storefront API directly during `getServerSideProps`:
  - If the specimen exists in Shopify, return a `301 Permanent Redirect` to `/product/${slug}`.
  - If the specimen was permanently removed, return `{ notFound: true }` directly from `product.html?item=...`, issuing an immediate, strict HTTP 404 status code without redirect chains.
- Confirmed Strategy Option A for Sold-Out Products: Temporarily sold-out products maintain an HTTP 200 status code with `https://schema.org/OutOfStock` structured data and a customer waitlist form (`pages/product/[slug].js`).

### B. Empty Collections & Discovered - Not Indexed (53 pages)
**Root Cause:** Category collections with 0 available products (e.g., `/collections/agaves`, `/collections/caudiciform`, `/collections/bulbs`) rendered empty state placeholder boxes without signaling search engines, leading to thin-content flags and index stalling.

**Code Fix Applied:**
- Updated `pages/collections/[slug].js` to check `collectionProducts.length === 0` and pass `noindex={true}` to `<SEO />`. Empty collection pages now render with `<meta name="robots" content="noindex, nofollow" />`.
- Updated `pages/sitemap.xml.js` to dynamically filter collection handles, publishing ONLY collections that contain at least 1 active product in the catalog.

### C. Sitemap Clean-Up (`pages/sitemap.xml.js`)
**Code Fix Applied:**
- Replaced redirecting route `/orchids-gallery` with clean canonical route `/gallery`.
- Excluded empty collection handles and non-canonical paths from the XML sitemap.
- Enforced strict XML formatting with correct namespace attributes.

### D. Alternate Page with Proper Canonical Tag (1 page)
**Root Cause:** `/contact` was flagged due to legacy links or parameters pointing to `/contact.html` or `/contact?source=...`.

**Code Fix Applied:**
- Updated `components/SEO.js` path normalization logic to strip `.html` extensions, query strings, hashes, and trailing slashes. All canonical tags now output clean absolute URLs (e.g. `https://thebotanicalbazaar.com/contact`).

---

## 2. Cloudflare Configuration & Page Rules Checklist

To resolve the **Page with redirect (3 pages)** issues (`http://`, `http://www.`, `https://www.`) and clean alias domain traffic:

### Action 1: Enforce HTTPS & Non-WWW Single Page Rule
In **Cloudflare Dashboard > Rules > Page Rules** (or Bulk Redirects):

1. **HTTP to HTTPS Normalization Rule**
   - **URL Pattern:** `http://thebotanicalbazaar.com/*`
   - **Setting:** `Forwarding URL` -> `301 - Permanent Redirect`
   - **Destination:** `https://thebotanicalbazaar.com/$1`

2. **WWW Subdomain Normalization Rule**
   - **URL Pattern:** `https://www.thebotanicalbazaar.com/*`
   - **Setting:** `Forwarding URL` -> `301 - Permanent Redirect`
   - **Destination:** `https://thebotanicalbazaar.com/$1`

3. **HTTP WWW Normalization Rule**
   - **URL Pattern:** `http://www.thebotanicalbazaar.com/*`
   - **Setting:** `Forwarding URL` -> `301 - Permanent Redirect`
   - **Destination:** `https://thebotanicalbazaar.com/$1`

4. **Alias Domain Redirects (.net / .org)**
   - **URL Pattern:** `http://*thebotanicalbazaar.net/*` & `http://*thebotanicalbazaar.org/*`
   - **Setting:** `Forwarding URL` -> `301 - Permanent Redirect`
   - **Destination:** `https://thebotanicalbazaar.com/$1`

---

## 3. Netlify Environment & Function Directives

### Action 1: Verify Skew Protection & Timeouts
In `netlify.toml`:
```toml
[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
  NETLIFY_NEXT_SKEW_PROTECTION = "true"
```
Ensure Netlify functions have a minimum 26-second timeout limit to prevent crawl budget timeouts on dynamic Storefront GraphQL queries.

### Action 2: Cache Control Headers
Verify `next.config.js` and `sitemap.xml.js` set appropriate cache headers:
- `sitemap.xml.js`: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=59`
- Global assets: Security headers enabled with CSP and `X-Content-Type-Options: nosniff`.

---

## 4. Google Search Console Re-Indexing Submission Steps

1. **Deploy Repository Changes**: Deploy the updated codebase to production on Netlify.
2. **Test Live URLs**:
   - Test legacy URL: `curl -I "https://thebotanicalbazaar.com/product.html?item=unknown-needs-id-tropical-vine"` -> Must return `HTTP/1.1 404 Not Found`.
   - Test sitemap: Inspect `https://thebotanicalbazaar.com/sitemap.xml` in browser -> Confirm only 200 OK canonical routes are listed.
3. **Submit Updated Sitemap in GSC**:
   - Go to **Google Search Console > Sitemaps**.
   - Resubmit `https://thebotanicalbazaar.com/sitemap.xml`.
4. **Initiate Validation**:
   - In GSC, click **Validate Fix** under **Soft 404** and **Crawled - currently not indexed**.
