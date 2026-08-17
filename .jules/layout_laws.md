# Layout Laws & Global Styling Standards

## Core UI Principles
1. **Typography & Brand Identity:**
   - Display/Heading font: `Cinzel`, serif.
   - Body font: `Crimson Text`, serif.
   - Brand Palette:
     - Obsidian / Deep Forest Green: `#00301E`
     - Brunswick / Mid Green: `#1C3D2E`
     - Matte / Warm Gold: `#D4B06A`
     - Pastel Apricot / Cream: `#F5E7C4`
     - Pastel Tan / Secondary Light: `#E9DCBE`

2. **Global Custom Scrollbars:**
   - Default browser gray scrollbars MUST NEVER render in modals, dropdowns, sidebars, or page containers.
   - Webkit Scrollbar Track: `#00301E`
   - Webkit Scrollbar Thumb: `#D4B06A` (rounded border-radius)
   - Firefox / Standard Scrollbar: `scrollbar-color: #D4B06A #00301E; scrollbar-width: thin;`

3. **Dropdown Hover Bridges:**
   - All navigation dropdown triggers MUST feature an invisible `::after` pseudo-element bridge padding (or top-positioned invisible area) extending between trigger links and dropdown menus to prevent cursor drops/flicker over dead space.

4. **Product Card Layout:**
   - Product cards must use uniform flexbox column layout (`display: flex; flex-direction: column; justify-content: space-between;`) with `#F5E7C4` background and `#D4B06A` border. Primary CTA buttons must align at the horizontal bottom.

5. **Quick Actions & Floating Controls:**
   - `.quick-actions` floating stack sits in the bottom-right corner (`bottom: 20px; right: 20px; z-index: 1100`).
   - `#back-to-top` trigger floats in the bottom-left corner (`bottom: 20px; left: 20px; right: auto; z-index: 998`).

6. **Mobile Alignment:**
   - Breakpoint threshold: `max-width: 900px`. Desktop header navigation (`header nav`) hides in favor of `.header-mobile-toggle`, and footer text/columns center-align.

## Strict Architecture & Layout Laws

### 📜 LAW 1: Single Header/Footer & Universal Layout Ownership
- **Exclusive Layout Control:** All global navigation elements—including `<Header />`, `<Footer />`, `<MobileNav />`, and Floating Action Buttons (FABs)—are strictly owned and rendered by `components/Layout.js`.
- **Forbidden Page-Level Chrome:** Individual page files (`pages/*.js`) MUST NEVER import or render their own `<Header />` or `<Footer />` components.
- **Page Responsibility:** Every route component is responsible ONLY for rendering its specific main content body inside `<Layout>`.

### 📜 LAW 2: Route Hygiene & State Clean-up
- **Automatic Reset:** Every drawer, mega menu, search overlay, and modal MUST listen for `router.events.on('routeChangeComplete')` and automatically collapse (`false` / `""`) on route transition.
- **Backdrop & Outside Click:** All open panels must render a full-viewport overlay backdrop (`z-index: 999`) with an `onClick` close handler and `Escape` key listener.

### 📜 LAW 3: Z-Index & UI Hierarchy Stack
- **Z-Index 1100:** Floating Action Buttons (FABs) / Quick Actions
- **Z-Index 1000:** Slide-out Drawers & Modals
- **Z-Index 999:** Backdrop Blur Overlay
- **Z-Index 500:** Sticky Navigation Header
