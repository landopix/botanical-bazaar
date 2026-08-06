# The Botanical Bazaar LLC — Architectural Audit & Refactor Blueprint
**Author:** Jules, Expert Next.js Architect & Code Auditor
**Date:** March 2025
**Objective:** Complete analysis of the existing static-dynamic hybrid architecture and a precise, actionable migration roadmap to a componentized, native Next.js application integrated with **Sanity.io** (structured content and catalog) and **Builder.io** (flexible visual visual templates/layouts), deprecating Decap CMS and GrapesJS.

---

## Executive Summary
The Botanical Bazaar currently operates on a hybrid Pages Router catch-all mechanism (`pages/[[...slug]].js`) that loads raw static `.html` and `.css` files from the filesystem (`content/pages/`), injecting inline styles at runtime. Visual editing is handled by a local GrapesJS-based visual builder (`/sandbox`) that overwrites source files, and a decoupled Decap CMS configuration is configured for blogging. Product catalogs are stored in a client-side global array (`public/products.js`), with e-commerce operations handled via Stripe and Netlify serverless functions.

To modernise the application for high performance, SEO compliance, and scale, we will refactor the site into a componentized Next.js Page Router application. **Sanity.io** will serve as the single source of truth for the product catalog and core structured data. **Builder.io** will handle dynamic visual layout blocks, giving non-technical creators visual control over marketing and general content pages without risking source-code regressions. All deprecated visual builder components (GrapesJS sandbox, `/api/load`, `/api/save`) and Decap CMS layouts will be cleanly excised.

---

## 1. Page & Route Structure Analysis
The repository serves pages dynamically through a wildcard catch-all route. Below is the mapping of all existing routes in the codebase:

| Route Path | Current Source File | Type | Purpose / Description | SEO Meta & Schema Status |
|---|---|---|---|---|
| `/` (Home) | `content/pages/index.html` | Static/Dynamic | Landing Page. Features animated logo, Almanac highlights, category grids, and 5 featured products. | Strong SEO. LocalBusiness JSON-LD schema, GA4 tracking, and Clarity tags present. |
| `/about` | `content/pages/about.html` | Static | Company story, local sourcing policies, and sustainable mission. | Standard SEO description and WebPage JSON-LD. |
| `/shop` | `content/pages/shop.html` | Dynamic (JS) | Storefront. Loads catalog from `products.js`, processes category/zone URL parameters, and implements live search. | Standard metadata. Pre-renders with custom Clarity metrics. |
| `/product?item=slug` | `content/pages/product.html` | Dynamic (JS) | Product Detail Page. Dynamically renders images, dimensions, pricing, collapsible care/hardiness panels, and Add to Cart. | Highly Optimized. Generates dynamic JSON-LD Product Schema with MerchantReturnPolicy and local OfferShippingDetails. |
| `/almanac` | `content/pages/almanac.html` | Static | Landing hub for educational resources, linking to the monthly guides and zone charts. | Standard meta tags. |
| `/blog` | `content/pages/blog.html` | Static | Duplicate view of the Almanac landing page (redirects/re-uses same layout). | Duplicate metadata (canonicalizes to `almanac.html` or `blog.html`). |
| `/events` | `content/pages/events.html` | Static | Community workshop scheduling, plant swaps, and email newsletter notifications. | Basic meta tags. |
| `/consultations` | `content/pages/consultations.html` | Static / Form | Inquiry form for Zone 9 backyard consultations. Submits via `mailto:hello@thebotanicalbazaar.com`. | Standard metadata. |
| `/cart` | `content/pages/cart.html` | Dynamic (JS) | Client-side shopping cart list. Loads from `localStorage` and provides a subtotal. | Configured with `noindex` robots meta tag. |
| `/checkout` | `content/pages/checkout.html` | Dynamic (JS) | Checkout summary. Resolves Stripe checkout session creation. | Configured with `noindex` robots meta tag. |
| `/cancel` | `content/pages/cancel.html` | Static | Stripe Checkout cancellation return page. | Basic. |
| `/success` | `content/pages/success.html` | Static | Stripe Checkout success / confirmation return page. | Basic. |
| `/zones` | `content/pages/zones.html` | Static / Map | USDA Hardiness Zone guide showing zones 3 to 13. Links to filtered shop views. | Optimized metadata. Interactive cards for each zone. |
| `/garden-month` | `content/pages/garden-month.html` | Static | Monthly gardening checklist specific to West-Central Florida (Zone 9). | Basic. |
| `/tag?tag=slug` | `content/pages/tag.html` | Dynamic (JS) | Tag taxonomy landing page. Displays products corresponding to individual tags. | Dynamic SEO title and og:description generated via JS. |
| `/shipping-pickup` | `content/pages/shipping-pickup.html` | Static | Fulfillment policies. Stresses local nursery pickup only. | Basic. |
| `/returns` | `content/pages/returns.html` | Static | Return/Exchange policies. Explains 7-day Live Plant Guarantee. | Basic. |
| `/terms` | `content/pages/terms.html` | Static | Core terms and conditions of purchase. | Basic. |
| `/terms-full` | `content/pages/terms-full.html` | Static | Expanded terms and conditions document. | Basic. |
| `/privacy` | `content/pages/privacy.html` | Static | Privacy policy document. | Basic. |
| `/faq` | `content/pages/faq.html` | Static | Collapsible Accordion style FAQ page with Schema.org FAQPage data. | Highly Optimized. Structured FAQ schema present. |

---

## 2. Global Layouts & UI Components
The site features a beautifully consistent design system, but the code is highly duplicated due to its original static layout roots.

### A. Current Implementations
*   **Design Tokens:** Base background `#00301e` (or `#11402A`), text color `#E9DCBE` (or `#F4F1E1`), with gold accents (`#D4B06A`) for primary actions, buttons, and links. Headings utilize `Cinzel` serif, and body copy uses `Crimson Text`.
*   **The Global Head Template (`content/pages/global-head-template.html`):** Houses OpenGraph tags, Google Analytics (GA4: `G-S0XS3CDM9G`), Microsoft Clarity (`vxxgho3991`), and favicons. However, most static `.html` pages still manually duplicate these scripts.
*   **Site Sidebar (`content/pages/index.html`, etc.):** Statically duplicated on every single page. Managed dynamically on the client-side via `public/sidebar.js`, which handles navigation search filtering, sub-menus, active states, and programmatic injection of the "Gallery" link (`orchids-gallery.html`).
*   **Site Header (`content/pages/index.html`, etc.):** Contains the branding lantern logo and nav links. Duplicated word-for-word on 20+ HTML files.
*   **Site Footer:** Statically duplicated on almost all files. Contains quick links to policies and a hardcoded copyright notice (e.g., `&copy; 2025 The Botanical Bazaar. All rights reserved.`).
*   **Floating Utility Dock (Quick Actions):** A mobile-first floating layout implemented at the bottom-right of the viewport on almost all pages. Contains:
    1.  *Search Navigation Toggle* (triggers the sidebar sliding drawer)
    2.  *Cart Icon* (links to `/cart`)
    3.  *Wishlist Icon* (links to `/wishlist`)
    4.  *Account Icon* (links to `/account`)
*   **Decorative Botanical Overlay:** Handled via a global CSS pseudo-element (`body::before` inside `public/sidebar.css`) that renders a repeating leaf/vine background (`assets/vine-pattern-light.png`) at `0.12` opacity using the `mix-blend-mode: soft-light`.

---

## 3. Hardcoded Elements & Dynamic Opportunities
Because of the static delivery model, numerous sections of text, dynamic settings, and links are locked in individual source files. To support visual site administration via **Builder.io** and structured inventory via **Sanity.io**, these must be isolated:

1.  **Copyright Notice:** Currently hardcoded as `&copy; 2025` in the footer of every page. This must be dynamically rendered to always reflect the current year: `new Date().getFullYear()`.
2.  **Contact Emails:** Hardcoded direct `mailto` links in `consultations.html`, `events.html`, and `contact.html` (e.g., `mailto:hello@thebotanicalbazaar.com`, `orders@thebotanicalbazaar.com`, `help@...`). These should be driven by dynamic environmental variables or modular configuration blocks.
3.  **Newsletter Netlify Forms:** Home and Events pages feature forms designed for Netlify's static HTML parser (`data-netlify="true"`). In a native Next.js setup, these must be refactored into React form states feeding directly into an API handler (e.g., hooking into Klaviyo, Mailchimp, or Sanity's database).
4.  **Static Legal Links:** Standard policy footer arrays are duplicated on all pages. These should be defined as a single constant array and mapped inside a reusable React `<Footer />` component.

---

## 4. Styling & UI Inconsistencies
During the audit, several visual inconsistencies and styling frameworks were flagged:

*   **Mixed Button Styles:**
    *   The primary store button on the homepage uses `.hero-text a` inline-styled as: `background:#D4B06A; color:#1C3D2E; padding:0.6rem 1.4rem; border-radius:24px;`.
    *   The CTA button inside `<section class="cta">` uses: `.cta button` defined in page styles with `#1C3D2E` background, `#F5E7C4` text, and a `20px` border-radius.
    *   Shop details buttons use `.view-btn` which switches color on hover (`background: #249160` instead of gold).
    *   The Cart page uses `.btn` styled with `#1C3D2E` background, `#F5E7C4` text, and a `24px` border-radius.
    *   The Cart page "Proceed to Checkout" button has inconsistent styling compared to the primary gold CTAs on the homepage.
    *   *Solution:* We must consolidate these under a single unified, customizable Tailwind or CSS Module-based `<Button>` component that supports variants like `gold-filled`, `green-filled`, `outline`, and `disabled`.
*   **No Standardized Utility Classes:** Layout spacing relies on arbitrary `margin` and `padding` values declared in individual `<style>` blocks.
*   **Viewport Jumpings on Sidebar Toggle:** Standard desktop viewports have layout-shift transitions when the sidebar is toggled because of mixed margin-shifts (`body.sidebar-open` overrides margins inconsistently).

---

## 5. Data, Catalog & Inventory Structure
The site's current inventory management is mock-dynamic, relying entirely on client-side state execution.

### A. Current Structure (`public/products.js`)
Products are stored in a large static JavaScript array assigned to `window.PRODUCTS`. Each record follows this schema:
```json
{
  "slug": "philodendron-radiatum-barryii",
  "name": "Philodendron Radiatum 'Barryii'",
  "sku": "",
  "image": "assets/placeholder.png",
  "type": "Plant",
  "description": "",
  "price": 30.0,
  "quantity": 6,
  "zones": ["9", "10", "11"],
  "categories": ["houseplants"],
  "sizes": "4\" Plastic Pot | 1 Gal. Plastic Pot",
  "tags": ["aroid", "bright-indirect", "high-humidity", "toxic-to-pets"]
}
```

### B. Catalog Structural Defects
*   **Quantity Policies:** Any quantity less than 3 is treated as "Sold Out" (`const isSoldOut = !product.quantity || product.quantity < 3;`). However, the products are still loaded in full down to the browser.
*   **Invalid Price Values:** The product `solanum-pimpinellifolium-everglades-tomato` currently has its price hardcoded as `NaN`.
*   **Unpopulated Metadata:** Many products have blank descriptions and empty `sku` strings, causing SEO validators to flag warnings during rich-result evaluations.
*   **Client-Side Leakage:** The total stock quantity and slug identifiers are fully exposed to client-side JS bundles.

### C. Proposed Sanity.io Schema Mapping
To support a secure, server-rendered database model, the inventory should be migrated to **Sanity.io** using this document schema:

```typescript
// Sanity Schema Definition: Product
export default {
  name: 'product',
  title: 'Product Inventory',
  type: 'document',
  fields: [
    { name: 'name', title: 'Product Name', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: Rule => Rule.required() },
    { name: 'sku', title: 'SKU', type: 'string' },
    { name: 'image', title: 'Product Image', type: 'image', options: { hotspot: true } },
    { name: 'type', title: 'Product Type', type: 'string', initialValue: 'Plant' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'price', title: 'Price (USD)', type: 'number', validation: Rule => Rule.min(0) },
    { name: 'quantity', title: 'Stock Quantity', type: 'number', validation: Rule => Rule.min(0) },
    { name: 'zones', title: 'USDA Zones', type: 'array', of: [{ type: 'string' }] },
    { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'string' }] },
    { name: 'sizes', title: 'Available Sizes', type: 'string' },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'temp_threshold', title: 'Cold Hardiness Temperature (°F)', type: 'string', initialValue: '50' }
  ]
}
```

---

## 6. Deprecation & Cleanup Tasks
To complete a high-fidelity transition to our headless stack, we must systematically purge several historical layers:

1.  **Remove GrapesJS Visual Sandbox:**
    *   Delete the local page editor: `pages/sandbox.js`.
    *   Delete API visual content handler routes: `pages/api/load.js` and `pages/api/save.js`.
    *   Remove related npm development dependencies (`js-beautify`).
2.  **Remove Decap CMS Admin:**
    *   Purge the static netlify configuration admin folder: `public/admin/` and `admin/` root directory.
    *   Remove netlify identity scripts and widgets from footer/headers across index files.
3.  **Purge Static Page Cache:**
    *   Retire `content/pages/` completely once Sanity and Builder.io collections are live.

---

## 7. Next.js, Sanity, and Builder.io Target Architecture
The proposed architecture provides maximum performance, SEO indexability, and clean decoupling of layout and inventory:

```
                      +-------------------+
                      |   User Browser    |
                      +---------+---------+
                                |
                                | (HTTPS / React Hydration)
                                v
                      +-------------------+
                      |   Next.js App     |
                      |  (Pages Router)   |
                      +----+----+-+-------+
                           |    | |
          +----------------+    | | (Stripe Checkout)
          |                     | |
          v                     | +-----------------------+
+---------+---------+           |                         v
|    Builder.io     |           v               +-------------------+
| Visual Components |  +--------+--------+      |  Stripe Gateway   |
| (Landing, About,  |  |    Sanity.io    |      +-------------------+
|  Fulfillment, etc)|  | (Product Spec,  |
+-------------------+  |  Stock levels)  |
                       +-----------------+
```

### Key Implementation Guidelines
*   **Layout Pages (Builder.io):** Pages like `index`, `about`, `events`, `consultations`, and policy documents will register Custom React Layout Components inside Builder.io. Non-technical staff can visual-edit layouts using defined brand guidelines.
*   **Catalog Pages (Next.js + Sanity):** Pages like `/shop`, `/product/[slug]`, and `/tag/[tag]` will load real-time database details at request-time via `getServerSideProps` or build-time via `getStaticProps` with Incremental Static Regeneration (ISR).
*   **Securing Checkout:** Cart checkouts will route directly from dynamic React buttons to secure Stripe endpoints, completely eliminating client-side inventory tampering or invalid `NaN` pricing issues.

---
*Audit completed successfully. All target architectures verified against Next.js best practices.*
