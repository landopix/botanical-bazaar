## 2026-08-16 - Homepage Product Image Optimization via Next.js Image Component

**Learning:** Catalog product cards on `pages/index.js` were using standard HTML `<img>` tags while `pages/shop.js` used Next.js `<Image>` with `fill` and `sizes`. Converting raw `<img>` tags to Next.js `<Image>` on homepage featured products enforces consistent responsive image delivery, automatic WebP/AVIF formatting for CDN assets, and proper aspect-ratio container scaling without visual distortion or layout shifts.

**Action:** Whenever product cards or catalog item lists are rendered in Next.js pages, ensure `<Image fill sizes="..." className="product-image" unoptimized={!image.includes('cdn.sanity.io')} />` is consistently applied rather than standard `<img>` tags.
