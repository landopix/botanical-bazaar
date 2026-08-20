# 🛍️ Shopify Storefront API & Catalog Audit Summary Report

## Overview
This audit evaluates The Botanical Bazaar Next.js Storefront API integration (`lib/shopify.js`), category filtering architecture (`pages/shop.js`), and product catalog mapping against master design system specifications and architectural layout laws.

---

## 1. Master "Laws" Document Alignment & UI Token Verification

### Category Pills & Filter Controls
- **Token Compliance**: Category pills in `pages/shop.js` were audited and updated to strictly adhere to design system specifications (`docs/layout-blueprint.md`):
  - **Default State**: Solid Warm Gold (`#D4B06A`) background with Deep Forest Green (`#00301E`) bold text.
  - **Hover / Focus State**: Transforms smoothly to Pastel Tan (`#E9DCBE`) with Dark Forest Green border (`#00301E`) and subtle elevation (`translateY(-2px) scale(1.02)`).
  - **Active Selected State**: High-contrast Deep Forest Green (`#00301E`) background with Warm Gold (`#D4B06A`) text, 2px solid gold border, and gold drop-shadow glow (`0 0 10px rgba(212, 176, 106, 0.35)`).
- **Product Card Standards**: Product grid cards maintain uniform row heights, light cream backgrounds (`#F5E7C4`), 1px solid Warm Gold borders (`#D4B06A`), and strict 4:3 image bounding boxes with `object-fit: cover !important` to eliminate layout distortion.

---

## 2. Storefront API GraphQL Query Mapping (`lib/shopify.js`)

### Query & Fragment Audit
- **GraphQL Queries**: `getAllProducts`, `getProductByHandle`, and `getTestMonsteraProduct` fetch full product graphs including variants, images, price ranges, inventory, tags, collection handles, and metafields.
- **Metafield Fragment (`PRODUCT_METAFIELDS_FRAGMENT`)**:
  - `custom.pot_size` & `custom.hardiness_zone`
  - `botanical.min_temp_ground` & `botanical.min_temp_pot`
  - `botanical.light_levels` & `botanical.watering_specs`
  - `botanical.pet_safe`
- **Data Transformation Enhancements (`formatShopifyProduct`)**:
  - **Cold Hardiness & Thermal Threshold**: Added `temp_threshold` extraction alongside `minTempInGround` and `minTempInPot` so product card hardiness badges display accurate cold hardiness guidance across PDPs and shop grids.
  - **Pet Safety Tag Parsing**: Enhanced `petSafe` property resolution to incorporate `pet-safe`, `petsafe`, and `pet safe` tags alongside Shopify `botanical.pet_safe` boolean metafields.

---

## 3. Collection and Tag Consistency

### Master Collection Handle Mapping
- **Collection Keys**: Confirmed master collection handles in `pages/shop.js` match Shopify collection slugs and tag conventions:
  - `houseplants`
  - `orchids-tropicals`
  - `fruit-trees`
  - `herbs-medicinal`
  - `exotics-rare`
  - `seeds`
  - `stickers-art`
  - `tinctures-apothecary`
  - `terrarium-vivarium`
- **Dynamic Category Pill Suppression**: `getActiveInStockCountForCategory` dynamically calculates live in-stock inventory per collection. Pills for out-of-stock categories are automatically hidden in catalog navigation while direct collection URL access gracefully displays an inline "Upcoming Batch" fallback card with a CTA to `/sourcing`.

---

## 4. URL State Synchronization & Client-Side Faceting

### Two-Way Parameter Sync
- **Parameters**: `category`, `size`, `zone`, `sort`, `view_sold_out`, `search`, `tag`, `light`, `bloom` synchronize bidirectionally between Next.js React state and URL query parameters via shallow router updates (`router.replace(..., { shallow: true })`).
- **Persistence**: User selections persist seamlessly across page reloads, browser history navigation, and direct link shares.
- **Availability Rule**: Sold-out specimens (`quantity < 3` or `availableForSale === false`) are hidden by default and strictly sorted to the bottom of the grid when "View Sold Out Plants" (`view_sold_out=true`) is toggled on.

---

## 5. Build & Verification Status

- **Static Generation & ISR**: Verified via `npm run build`. Next.js SSG with ISR (`revalidate: 60`) compiled successfully across all 27 static and dynamic page routes.
