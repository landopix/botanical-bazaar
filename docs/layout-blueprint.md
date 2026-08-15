# Structural Layout Blueprint & Design System Constraints

## Overview
This architectural blueprint governs layout structures, component boundaries, strict aspect ratios, floating element stacks, and design token constraints across The Botanical Bazaar storefront. The goal is to ensure visual consistency and prevent layout drift or distortion.

---

## 1. Product Card Layout Blueprint

All product cards in shop grids, featured homepage sections, tag collection pages, and wishlist displays MUST adhere to strict structural constraints:

### Visual Structure & Aspect Ratio
- **Card Background & Border**:
  - Background: Light Cream (`#F5E7C4`)
  - Border: 1px solid Warm Gold (`#D4B06A`)
  - Border Radius: 8px (0.5rem)
  - Box Shadow: Smooth subtle elevation (`0 4px 12px rgba(0, 0, 0, 0.15)`)
- **Image Container Bounding Box**:
  - Aspect Ratio: **Strict 4:3 aspect ratio** (`aspect-ratio: 4 / 3`)
  - Overflow: `hidden`
  - Position: `relative`
  - Child Image: Enforce `object-fit: cover !important`, `width: 100% !important`, `height: 100% !important` to eliminate layout bleeding and image stretching.
- **Card Layout & Heights**:
  - Layout: Flexbox Column (`display: flex; flex-direction: column; justify-content: space-between;`)
  - Card Height: Cards within a grid row MUST stretch to uniform height (`height: 100%`).
  - Content Wrapper: `display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between; padding: 1.25rem;`
  - Primary Action Button: Anchored firmly at the horizontal bottom of each card container.

---

## 2. Floating Quick Actions & Controls Stack

The floating action UI consists of circular quick action buttons and the Back-to-Top scroll trigger:

### Quick Actions Stack (`.quick-actions`)
- **Positioning**: Fixed bottom-right corner (`position: fixed; bottom: 20px; right: 20px; z-index: 999;`)
- **Button Styling & Icon Centering**:
  - Circular dimensions: `48px x 48px`
  - Background: Solid Deep Forest Green (`#00301E`)
  - Border: No border/outline (`border: none; outline: none;`)
  - Flexbox Centering: Enforce `display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; margin: 0 !important;` across all circular quick action buttons (`.quick-actions button`, `.quick-actions a`).
  - SVGs: Dimensioned at `24px x 24px` with `viewBox="0 0 24 24"`, enforcing `display: block !important; margin: auto !important; flex-shrink: 0 !important;` to ensure perfect off-center-proof icon alignment across desktop and mobile views.
- **Notification Badges**:
  - Badges render with absolute positioning on the top-right of the circular button.
  - Container MUST enforce `overflow: visible !important` on parent buttons so count badges are never visually clipped.

### Back-to-Top Button (`#back-to-top`)
- **Positioning**: Fixed bottom-left corner (`position: fixed; bottom: 20px; left: 20px; right: auto; z-index: 998;`)
- **Collision Protection**: Kept strictly separated from `.quick-actions` on the bottom-right to prevent UI overlap on mobile and desktop.

---

## 3. Design Token Specifications & Constraints

### Typography Rules
- **Serf / Body Font**: `Crimson Text`, serif
- **Display / Heading Font**: `Cinzel`, serif
- **Strict Prohibition**: No system fallbacks or Georgia permitted in production typography rules.
- **Header Navigation**: `Cinzel` serif, font-weight 400 (normal/regular), no text underlines, centered layout spacing.
- **Hero / Main Section Headings**: Uppercase with elevated letter-spacing (`letter-spacing: 0.15em`).

### Color Palette Tokens
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Obsidian / Deep Forest Green** | `#00301E` | Core layout background, primary text on light containers |
| **Brunswick Green** | `#1C3D2E` | Secondary containers, sidebar background, collapsible specs (`#123826`) |
| **Warm Gold** | `#D4B06A` | Primary CTA buttons, accent borders, summary headers, scrollbar thumbs |
| **Pastel Apricot / Light Cream** | `#F5E7C4` | Product card background, body description text on dark green |
| **Pastel Tan** | `#E9DCBE` | High-contrast summary boxes (Cart/Checkout), fallback text |

---

## 4. Responsive Mobile Boundaries & Navigation Standards (< 900px)

- **Mobile Header Navigation**:
  - Threshold: Screens with viewport width `<= 900px`.
  - Behavior: Desktop inline header text navigation (`header nav`) is hidden (`display: none !important`) to eliminate horizontal overflow and link clipping.
  - Controls & Event Bindings: A dedicated mobile hamburger menu toggle button (`.header-mobile-toggle`) renders in the header bar adjacent to the lantern logo across React components and static HTML templates (`content/pages/*.html`). Clicking `.header-mobile-toggle` MUST trigger interactive state handlers that toggle the `.open` class on `#site-sidebar` and `.sidebar-open` class on `document.body` without touch event blocking (`z-index: 1001; touch-action: manipulation`).

- **Mobile Footer Alignment**:
  - Threshold: Screens with viewport width `<= 900px`.
  - Alignment: All footer columns (`.footer-column`), section titles (`.footer-column h3`), body copy (`.footer-column p`), navigation links (`.footer-column a`), climate zone selector (`.footer-zone-selector`), and copyright text (`.footer-bottom`) MUST be centered (`text-align: center !important; align-items: center !important; width: 100%`).

- **Grid Systems**:
  - Desktop: Multi-column grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`)
  - Mobile (< 900px): Single column fluid grid or centered flexbox column.
- **Safe Area Insets**: Floating stacks must respect `env(safe-area-inset-bottom)` on iOS devices (`bottom: calc(20px + env(safe-area-inset-bottom))`).

---

## 5. Button & Pill Color Tokens & Component States

To prevent color regressions, button styles across the application are locked to standard design system tokens:

### Primary Call-to-Action Buttons (e.g., "Add to Cart", "Proceed to Checkout", "View Plant")
- **Background**: Solid Deep Forest Green (`#00301E`) or Solid Warm Gold (`#D4B06A`) depending on variant.
- **Text Color**:
  - Dark Green background: Warm Gold (`#D4B06A`) text.
  - Warm Gold background: Obsidian / Deep Forest Green (`#00301E`) text.
- **Border**: 1px solid Warm Gold (`#D4B06A`).

### Category Cards & Browse Pills (`.category-card`, `.tag-pill`)
- **Default State**:
  - **Background**: Solid Warm Gold (`#D4B06A`)
  - **Text Color**: Obsidian / Deep Forest Green (`#00301E`)
  - **Border**: 1px solid Warm Gold (`#D4B06A`)
  - **Font Weight**: Bold (`font-weight: 700`)
- **Hover / Focus-Visible State**:
  - **Background**: Pastel Tan (`#E9DCBE`)
  - **Text Color**: Obsidian / Deep Forest Green (`#00301E`)
  - **Border**: 1px solid Deep Forest Green (`#00301E`)
  - **Transform**: Elevation scaling (`transform: translateY(-3px) scale(1.02)`)
- **Prohibition**: Off-white, pale light green, or plain system gray backgrounds are strictly prohibited on interactive category buttons.
