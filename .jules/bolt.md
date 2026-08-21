## 2026-08-16 - Homepage Product Image Optimization via Next.js Image Component

**Learning:** Catalog product cards on `pages/index.js` were using standard HTML `<img>` tags while `pages/shop.js` used Next.js `<Image>` with `fill` and `sizes`. Converting raw `<img>` tags to Next.js `<Image>` on homepage featured products enforces consistent responsive image delivery, automatic WebP/AVIF formatting for CDN assets, and proper aspect-ratio container scaling without visual distortion or layout shifts.

**Action:** Whenever product cards or catalog item lists are rendered in Next.js pages, ensure `<Image fill sizes="..." className="product-image" unoptimized={!image.includes('cdn.sanity.io')} />` is consistently applied rather than standard `<img>` tags.

## 2026-08-21 - Catalog Filtering & Product Grid Memoization Optimization

**Learning:** On product catalog pages with real-time text search and filter controls (`pages/shop.js`), recalculating derived datasets (`sortedZones`, `sortedSizes`, and category in-stock counts) on every render causes unnecessary array traversals across all catalog items for every keystroke. Additionally, un-memoized `ProductCard` components in the grid re-render even when their individual product props remain unchanged. Wrapping derived filter options in `React.useMemo` and `ProductCard` in `React.memo` eliminates redundant $O(N)$ calculations and prevents unnecessary DOM updates during typing and filtering.

**Action:** On catalog and collection pages with interactive search inputs or filter toggles, always memoize derived filter option sets using `useMemo` (keyed on the underlying product inventory) and wrap grid card items in `React.memo` to preserve sub-millisecond typing responsiveness.
