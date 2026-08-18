# Palette's Journal - Critical Learnings

## 2025-05-18 - Dialog Accessibility and Keyboard Navigation Shortcuts
**Learning:** React modals (such as `.zone-modal-container`) require proper ARIA dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) and global keydown handlers (`Escape`) to guarantee screen readers correctly announce the dialog context and keyboard users can easily exit active overlays. Additionally, adding a hidden-until-focused 'Skip to main content' anchor link (`.skip-to-content`) provides immediate keyboard bypass around sticky navigation headers.
**Action:** When creating or auditing overlays/modals or primary site layouts, always ensure `Escape` key handlers, explicit dialog ARIA roles, and skip navigation links are present.
