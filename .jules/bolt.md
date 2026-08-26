## 2026-08-16 - Homepage Product Image Optimization via Next.js Image Component

**Learning:** Catalog product cards on `pages/index.js` were using standard HTML `<img>` tags while `pages/shop.js` used Next.js `<Image>` with `fill` and `sizes`. Converting raw `<img>` tags to Next.js `<Image>` on homepage featured products enforces consistent responsive image delivery, automatic WebP/AVIF formatting for CDN assets, and proper aspect-ratio container scaling without visual distortion or layout shifts.

**Action:** Whenever product cards or catalog item lists are rendered in Next.js pages, ensure `<Image fill sizes="..." className="product-image" unoptimized={!image.includes('cdn.sanity.io')} />` is consistently applied rather than standard `<img>` tags.

## 2026-08-24 - Shop Catalog Re-render & In-Stock Category Calculation Optimization

**Learning:** When catalog pages (`pages/shop.js`, `pages/index.js`, `pages/sales.js`) render grids of products, parent state changes (such as search text keypresses or filter toggle state) trigger re-renders across all child product card components unless memoized with `React.memo`. Additionally, calculating in-stock item counts per category in `pages/shop.js` via an unmemoized function caused redundant array filtering across the entire catalog on every render.

**Action:** Wrap catalog card components like `ProductCard` with `React.memo(ProductCard)` and pre-compute category counts using `useMemo` (`categoryInStockCounts`) so array calculations run strictly when `products` inventory changes.

## 2026-08-26 - Homepage Category In-Stock Count Memoization in pages/index.js

**Learning:** On `pages/index.js`, `getActiveCount(catId)` performed unmemoized array filtering across the full product catalog for each category card rendered on every component re-render (e.g., every keystroke in the newsletter signup input). Pre-computing `categoryInStockCounts` via `useMemo` reduces render-time catalog filtering from $O(N \times C)$ on every state update to an $O(1)$ dictionary lookup.

**Action:** Always pre-compute category/collection in-stock counts with `useMemo` on index/landing pages to ensure UI state changes (like form input keystrokes) do not cause main-thread blocking full-catalog array iterations.
