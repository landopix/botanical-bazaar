# Gap Analysis Report: The Customer Wishlist Flow

**Role:** Lead Quality Assurance Engineer & UX Architect
**Date:** March 2025
**Target Feature:** The Customer Wishlist Flow
**Target Repository:** The Botanical Bazaar (Next.js Pages Router E-Commerce Application)

---

## 1. Feature Objective
Provide plant collectors and nursery customers (across mobile and desktop viewports, unauthenticated guest sessions, and authenticated customer accounts) with an intuitive, persistent, and reliable sanctuary flow to discover, save, manage, and transition rare botanical specimens into active purchase decisions.

---

## 2. Ideal User Journey Map

1. **Discovery & Indication**:
   - Customer browses the nursery catalog (`/shop`), category collections, homepage, or product detail pages (`/product/[slug]`).
   - Every product card features a distinct, accessible heart icon button (top corner overlay) displaying active (filled warm gold `#D4B06A`) or inactive (outlined gold) states.
   - The global floating quick-action stack (FAB bar) displays a real-time count badge on the Wishlist icon.

2. **Active Interaction & Feedback**:
   - Tapping/clicking the heart button instantly toggles the item's saved status in `localStorage` (`botanical_wishlist`) without page reload.
   - A subtle toast alert or visual state transition confirms item addition/removal.
   - On the Product Detail Page (PDP), an interactive Wishlist CTA reflects active status ("In Wishlist Sanctuary" with filled heart icon).

3. **Sanctuary Review & Management**:
   - Customer accesses `/wishlist` or the "Saved Botanical Goods" section in `/account`.
   - **Populated State**: Displays saved specimens in a responsive grid, showcasing high-resolution plant imagery, common & scientific names, current price, pot size, in-stock status, direct "Add to Cart" CTA, and inline remove trigger ("✕").
   - **Bulk Management**: "Clear All Wishlist Items" action allows complete resetting of saved items with safety confirmation.
   - **Empty State**: Displays an inviting branded sanctuary card guiding the customer back to the Nursery Catalog (`/shop`).

4. **Account & Cross-Session Synchronization**:
   - Unauthenticated guest session items persist in browser `localStorage`.
   - When a customer logs in or signs in via passwordless email authentication (`/account`), local wishlist items seamlessly merge with the user's account session.

---

## 3. Current Architecture Audit

| File / Component | Role in Wishlist Flow | Current State / Logic |
| :--- | :--- | :--- |
| `context/WishlistContext.js` | React Context Provider for global state & local storage | Manages `wishlist` state array initialized from `localStorage.getItem('botanical_wishlist')`. Provides `addToWishlist`, `removeFromWishlist`, `toggleWishlist`. **Missing `clearWishlist` method!** |
| `components/ProductCard.js` | Shared product card for `/shop`, index, `/sales` | Renders image, name, pot size, type, price, and "View Plant" CTA. **Completely lacks any Wishlist toggle heart button.** |
| `pages/wishlist.js` | Standalone Wishlist Sanctuary page | Renders wishlist grid using `ProductCard`. Invokes `clearWishlist` on bulk clear button. **Crashes upon clicking "Clear All" due to missing context method.** Lacks inline direct "Add to Cart" CTA. |
| `pages/product/[slug].js` | Product Detail Page (PDP) | Renders secondary outline button: `{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}`. Functional but lacks heart icon visual indicator and active color state. |
| `pages/account.js` | Customer Dashboard | Renders "Saved Botanical Goods (X)" section with inline thumbnails and remove "✕" button. |
| `components/Layout.js` | Global Shell & Floating Action Stack | Renders floating FAB Wishlist icon button with red badge count (`wishlist.length`). Works as intended. |

---

## 4. Identified Structural Gaps & QA Findings

### A. Critical Bugs & Functional Logic Gaps
1. **Uncaught TypeError on Bulk Clear Action (CRITICAL)**:
   - **Location**: `pages/wishlist.js` line 9 & line 32.
   - **Issue**: `pages/wishlist.js` attempts to destructure `clearWishlist` from `useWishlist()` (`const { wishlist, clearWishlist } = useWishlist()`). However, `WishlistContext.js` does NOT export or define `clearWishlist`.
   - **Impact**: Clicking "Clear All Wishlist Items" on the `/wishlist` page causes a runtime crash (`TypeError: clearWishlist is not a function`).

2. **Absence of Wishlist Trigger on Product Grid Cards (UX Gap)**:
   - **Location**: `components/ProductCard.js`.
   - **Issue**: Customers browsing the shop catalog (`/shop`), sales page (`/sales`), or homepage cannot save plants directly from the product grid. They are forced to click through to each individual PDP to save an item.
   - **Impact**: Multi-step friction for catalog browsing, particularly on mobile viewports (< 900px).

3. **Data Schema Normalization Mismatch**:
   - **Location**: `context/WishlistContext.js`, `components/ProductCard.js`, `pages/account.js`.
   - **Issue**: Products saved from PDP carry Shopify Storefront API GraphQL structures (`product.slug`, `product.name`, `product.price`, `product.images`), whereas objects in `ProductCard` expect normalized properties (`product.slug.current` vs `product.slug`, `product.imageUrl` vs `product.image`).
   - **Impact**: Potentially broken image thumbnails or fallback image rendering when viewing saved items on `/wishlist` or `/account`.

4. **Missing Guest-to-Customer Account Sync**:
   - **Location**: `pages/account.js` & `context/WishlistContext.js`.
   - **Issue**: Wishlist state is strictly isolated to the browser's `localStorage`. Authenticated users signing in via passwordless magic link (`pages/account.js`) do not have their saved wishlist linked to their profile or cloud session.

5. **Lacking Direct "Add to Cart" Action from Wishlist Sanctuary**:
   - **Location**: `pages/wishlist.js`.
   - **Issue**: Saved items in `/wishlist` display a "View Plant" link via `ProductCard`, but offer no direct "Add to Cart" button to convert saved items into checkout purchases immediately.

---

### B. Missing Visual Indicators & UX Refinement Gaps
1. **No Heart Icon Overlay on Product Cards**:
   - Missing top-right floating heart icon button on `ProductCard.js` with active warm gold (#D4B06A) state.

2. **Generic Wishlist Button Styling on PDP**:
   - `pages/product/[slug].js` uses a plain generic outline button with plain text ("Add to Wishlist" / "In Wishlist") without a heart SVG icon or gold fill active state indicator.

3. **Lack of Instant Feedback Toast / Notification**:
   - Toggling wishlist status provides badge count update in the floating quick-actions bar, but lacks a localized visual toast confirmation (e.g. "Specimen saved to your Sanctuary").

4. **Empty State Alignment & Visual Polish**:
   - The empty wishlist state on `/wishlist.js` is clean but lacks a supporting visual SVG accent or quick links to top plant categories.

---

## 5. Remediation Plan (Actionable Implementation Directives)

### Step 1: Fix Context Provider Logic (`context/WishlistContext.js`)
- Implement `clearWishlist` function:
  ```javascript
  const clearWishlist = () => {
    saveWishlist([]);
  };
  ```
- Add `clearWishlist` to the `WishlistContext.Provider` value export object:
  ```javascript
  value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist }}
  ```

### Step 2: Add Wishlist Heart Trigger to `components/ProductCard.js`
- Integrate `useWishlist()` hook into `components/ProductCard.js`.
- Add an accessible floating heart icon button in the top-right corner of the product image container:
  - Absolute positioning (`top: 10px, right: 10px, zIndex: 12`).
  - Circular background (`rgba(0, 48, 30, 0.75)` with backdrop blur).
  - SVG heart icon with `fill={isWishlisted ? "#D4B06A" : "none"}` and `stroke="#D4B06A"`.
  - Accessible `aria-label` ("Save [Plant Name] to wishlist").

### Step 3: Enhance Wishlist Page (`pages/wishlist.js`)
- Ensure `clearWishlist` is correctly invoked without runtime error.
- Normalize product data passed to `ProductCard` or render custom Sanctuary specimen cards featuring:
  - Plant Image thumbnail.
  - Common & Scientific Title.
  - Container size & Availability tag ("In Stock" vs "Sold Out").
  - Direct "Add to Cart" CTA button.
  - Inline "Remove Specimen" trigger ("✕").

### Step 4: Refine PDP Wishlist Trigger (`pages/product/[slug].js`)
- Update the Wishlist button in `pages/product/[slug].js`:
  - Include inline SVG Heart icon.
  - When `isWishlisted` is true, style with filled Warm Gold background (`#D4B06A`) and dark green text (`#00301E`).

### Step 5: QA Verification & Cross-Browser Test
- Test empty and populated wishlist states on Desktop (1280px) and Mobile (375px/768px).
- Verify local storage persistence across browser reloads.
- Verify zero console errors or hydration mismatches.

---

*Report generated and saved to `docs/qa-audits/wishlist-gap-analysis.md`.*
