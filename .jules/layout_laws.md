# 📜 Layout Laws & Responsive UI Architecture

### 📜 LAW 1: Mobile Navigation & Layout Standards (<= 900px)
- **Mobile Header & Footer Alignment**: On screens <= 900px, desktop inline header text navigation (`header nav`) is hidden in favor of the touch-friendly mobile/tablet hamburger toggle (`.header-mobile-toggle`), which triggers the slide-out sidebar drawer (`#site-sidebar`).
- **Mobile Footer Centering**: All footer columns, headings, links, widgets, and copyright copy must be strictly centered (`text-align: center`, `align-items: center`) on mobile displays.

---

### 📜 LAW 2: Product Card & Grid Specifications
- **Uniform Card Row Heights**: Cards in product grids must stretch to uniform height in each row (`display: flex; flex-direction: column; justify-content: space-between`).
- **Bottom CTA Alignment**: Primary action buttons ("View Plant" / "Add to Cart" / Sold Out status) must align uniformly at the horizontal bottom of each card container.
- **Card Background & Border**: Product card containers must use the light cream background (`#F5E7C4`) with a high-contrast Warm Gold border (`1px solid #D4B06A`) against dark layout backdrops.
- **Image Boundaries**: Product image wrappers must use relative positioning with `overflow: hidden`, and child images must enforce `object-fit: cover` to eliminate visual distortion or layout bleeding.

---

### 📜 LAW 3: Floating Quick Actions & Controls Stack
- **Floating Action Stack (`.quick-actions`)**: Positioned fixed in the bottom-right corner (`bottom: 20px; right: 20px; z-index: 1100`). Buttons are 48x48px solid forest green (`#00301E`) circles with no borders/outlines and 24x24px centered SVG icons.
- **Back-to-Top Button (`#back-to-top`)**: Positioned fixed in the bottom-left corner (`bottom: 20px; left: 20px; right: auto; z-index: 998`) to prevent collision or overlap with `.quick-actions`.
- **Badge Clipping Prevention**: Parent containers for notification badges must enforce `overflow: visible !important`.

---

### 📜 LAW 4: Tablet Viewport Standards (768px - 1024px)
- **Header Navigation**: Full horizontal nav links are restricted to desktop viewports (≥ 1024px). All viewports < 1024px MUST collapse into the touch-friendly mobile/tablet hamburger drawer navigation (`lg:hidden` / `@media (max-width: 1023px)`).
- **Layout & Typography**: Header link text must never stack vertically or clip outside viewport boundaries. All page routes must adapt grid columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3` / `@media`) and typography smoothly for tablet screens.
