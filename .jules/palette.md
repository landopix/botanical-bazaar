# Palette's Journal - The Botanical Bazaar

## 2025-02-17 - Accessible Search Polish & Live Announcements

**Learning:** For a stateful, rich-filtering catalog search, screen readers do not automatically perceive updates to the matching product count when users type or select filter options. Providing an active `aria-live="polite"` element with `role="status"` ensures that screen reader users receive immediate, clear feedback about how many products match their current criteria without interrupting their typing flow.
**Action:** Add `role="status"` and `aria-live="polite"` to the results count element. Additionally, design a highly keyboard-accessible clear button (✕) embedded within the search container, featuring explicit `aria-label`, visible focus outline conforming to brand palettes, and an `Escape` key shortcut on the input for a seamless clearing experience.
