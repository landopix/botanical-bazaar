# Layout Laws & UI Standards

1. **Single Header/Footer Ownership**: The Footer and Header must ONLY be defined and rendered by `components/Layout.js`. Individual page routes and `_app.js` must never render their own footer or header components to ensure 100% uniformity.
2. **Route Hygiene & Non-Duplication**: All page routes in `pages/` are automatically wrapped by `components/Layout.js` via `pages/_app.js`. Pages must not wrap themselves in `<Layout>` or duplicate header/footer structures.
3. **Strict Z-Index Stacking Order**: Header, sidebar drawers, modal overlays, and floating quick-action stacks must adhere strictly to established z-index hierarchy.
