# The Botanical Bazaar — SEO Backlog

**Site:** https://thebotanicalbazaar.com
**Stack (verified):** Next.js 16 (pages router) on Netlify · Headless Shopify (`shop.thebotanicalbazaar.com`) · Sanity CMS · Cloudflare in front · `next/image` with Shopify CDN · Legacy GrapesJS static layer in `content/pages/`
**Primary tools:** Screaming Frog SEO Spider (free tier, 500 URLs) · Ahrefs (Site Audit + Site Explorer) · Google Search Console · GA4
**Key URL patterns:** `/product/[slug]` · `/collections/[slug]` · `/shop` · `/zones` · `/almanac/[slug]` · `/gallery`
**Repo reference:** Production deploys from this repo's `main`. Session work branch: `arena/01a090c9-botanical-bazaar` (synced to `main` @ `b283ae3`).

Priority levels: **P0** critical (indexing/site-level failures) · **P1** high impact (revenue pages, rankings at risk) · **P2** growth opportunity · **P3** cleanup.
Scoring: Impact (1–5) × Confidence (1–5) ÷ Effort (1–5).
Statuses: Identified · Needs Investigation · Ready · In Progress · Implemented · Verification Needed · Verified · Deferred · Rejected.

---

## Baseline Reference (captured 2026-09-11)

- **Live sitemap inventory:** 52 URLs — 19 static · 20 collections · 12 products · 1 Almanac article.
- **Collections live in sitemap:** orchids, tropical-houseplants, fruit-trees, exotics-rare, stickers-art, succulents-cacti, agaves, outdoor-plants, full-sun, low-maintenance, caudiciform, botanical-specimen, rare-plants, tropicals, indoor-plants, flowering-plants, woody-shrub, bulbs, aroid, epiphytes.
- **Collections live but NOT in sitemap (currently 0 active products):** herbs-medicinal, seeds, tinctures-apothecary, terrarium-vivarium (verified rendering empty state live).
- **Catalog size:** ~12 products is correct per owner (seasonal). Historical product references in old docs are retired inventory.
- **Deploy timeline note:** gallery consolidation (`/orchids-gallery` → `/gallery`) merged and deployed 2026-09-11 14:02–14:14 UTC during Session 1.
- **Repo hygiene note:** remote branch `fix/sitemap-collection-check` is already integrated into main via cherry-pick (content present, commits differ) — do not re-merge.

## Verified Healthy (Session 1 — do not re-audit)

| Area | Evidence |
|------|----------|
| Core content SSR | Raw HTML of homepage, /gallery, /zone9b, /collections/herbs-medicinal all contain full content. No client-side rendering dependency for core SEO elements. |
| Canonical normalization | `components/SEO.js` strips query strings, hashes, `.html` suffixes, trailing slashes; absolute self-referencing canonicals. |
| Product schema | `pages/product/[slug].js`: server-rendered JSON-LD — Product + Offer (price, USD, NewCondition, InStock/OutOfStock, seller, hasMerchantReturnPolicy) + Brand + BreadcrumbList. |
| Sold-out product policy | 200 status + `schema.org/OutOfStock` + waitlist form (documented in `docs/GSC_INDEXING_RESOLUTIONS.md`). Correct evergreen-URL strategy. |
| Empty-collection policy | Empty collections render "next batch" state, excluded from sitemap (verified live), noindex claimed (T-008 verifies meta). |
| Soft-404 prevention | `pages/[...page].js` returns true 404 for unknown paths. Legacy `product.html?item=` 301s only when target product exists, else direct 404. Verified live: `/gros-michel-banana` → 404. |
| robots.txt | Transactional routes disallowed; sitemap referenced; AI crawlers allowed deliberately. |
| Legacy URL migration | Comprehensive 301 map: `.html` → clean URLs, `/blog*` → `/almanac`, `shop.thebotanicalbazaar.com` → root domain. `/orchids-gallery.html` and `/orchids-gallery` now single-hop to `/gallery` (fixed in `984a55d`, verified in current main). |
| Gallery consolidation | `/orchids-gallery` → 301 → `/gallery` live; homepage category card links directly to `/gallery` (verified live post-deploy 14:19 UTC); sitemap lists `/gallery`. |

## 0. Baseline Data Collection

| ID | Task | Source | Priority | Status |
|----|------|--------|----------|--------|
| B-001 | Full-site SF crawl #1 (HTML-only) + `Internal → All` and `Response Codes → All` exports | Screaming Frog | P1 | In Progress — awaiting files |
| B-002 | Ahrefs: Site Audit settings + Issues export; Site Explorer organic keywords (US), top pages, referring domains | Ahrefs | P1 | In Progress — awaiting files |
| B-003 | GSC: Indexing → Pages export; Performance (16 months) Queries + Pages exports | GSC | P1 | In Progress — awaiting files |
| B-004 | GA4: Organic landing pages export (16 months) | GA4 | P2 | In Progress — awaiting files |

## 1. Open Items

| ID | Issue | URL / Pattern | Source | Pri | Imp | Conf | Eff | Recommended Action | Status | Verification |
|----|-------|---------------|--------|-----|-----|------|-----|--------------------|--------|--------------|
| T-002 | `robots.txt` `Disallow: /shop?` blocks ALL parameterized shop URLs, but `/zone9b` actively links to `/shop?zone=9` and `/zones` is the zone-shopping hub. Blocked URLs can't be crawled, so their canonical (→ `/shop`) is invisible to Google → risk of "Indexed, though blocked" entries and no signal consolidation. With ~52 URLs site-wide, crawl budget is not a concern. | `/robots.txt`, `/shop?zone=9` | Live + code review | P2 | 2 | 3 | 2 | After crawl confirms `/shop?zone=9` serves 200 + canonical `/shop`: remove the `Disallow: /shop?` line, rely on self-canonicalization. Parameter space is bounded (zone 1–13, 4 sort orders). | Needs Investigation | SF crawl of `/shop?zone=9`: status 200, canonical `/shop`; after change: GSC URL Inspection + robots report |
| T-009 | `/zone9b` is a live transitional page ("shopping has moved") with real keyword potential ("zone 9b plants", Florida gardening). Not in sitemap; links users into a robots-blocked filtered view (T-002). Decide: optimize as zone-9b landing page vs consolidate to `/zones`. | `/zone9b` | Live check | P2 | 3 | 3 | 2 | Pull Ahrefs keyword data for zone-9b / zone-9 plant terms (US), then decide landing-page vs consolidation. | Needs Investigation | Ahrefs Keywords Explorer (US) + current rankings |
| T-008 | Verify empty collections (`herbs-medicinal`, `seeds`, `tinctures-apothecary`, `terrarium-vivarium`) serve `noindex` meta — claimed in GSC fix doc, not yet verified. | `/collections/herbs-medicinal` et al. | GSC fix doc | P2 | 2 | 4 | 1 | Check Meta Robots column in SF export. Review whether `nofollow` (current implementation) should be `follow` to preserve crawling of links out of empty collections. | Needs Investigation | SF Internal export: meta robots per collection |
| T-012 | **Zombie template URLs.** Four legacy GrapesJS files are routable via `[...page].js` with no page/redirect shadowing: `/index` (200 duplicate homepage, different title, stale links incl. redirecting + noindexed targets), `/product` (200 empty shell, indexable), `/tag` (200 "Tag Not Specified" stub; `?tag=` variants set canonical only via JS), `/global-head-template` (HTTP 500). | `/index`, `/product`, `/tag`, `/global-head-template` | Live checks + code review, 2026-09-11 | P2 | 3 | 5 | 1 | **IMPLEMENTED:** four 301 redirects added to `next.config.js` (`/index`→`/`, `/product`→`/shop`, `/tag`→`/shop`, `/global-head-template`→`/`). PR from session branch. | Implemented — Verification Needed | Post-deploy: curl each → single 301; SF Response Codes shows no 200/500 at these paths; GSC URL Inspection; Ahrefs check for referring domains to `/tag?…` URLs that may warrant tag→collection mapping refinements |
| T-001 | Sitemap collection coverage: mechanism verified working (handles derived from product data + empty-filtering live). Remaining: compare Shopify admin collection list vs sitemap to catch any collection with active products that's missing. | `/sitemap.xml` | Live + code | P3 | 2 | 3 | 2 | Owner: Shopify admin → Collections → export list; diff against sitemap. | Needs Investigation | Diff Shopify export vs sitemap collections |
| T-011 | Verify host/protocol redirects work as documented (http, www, .net, .org → https root) — Cloudflare rules were a checklist item, not confirmed implemented. | http/www variants | GSC fix doc | P3 | 2 | 3 | 1 | Spot-check headers; confirm single-hop 301s. | Needs Investigation | SF: enter `http://thebotanicalbazaar.com` in second crawl pass; Response Codes → redirects report |
| T-013 | **Legacy GrapesJS layer cleanup.** `content/pages/` holds 26 static files; 22 are shadowed by redirects or real page files (dead weight, confusion risk — e.g., stale `/orchids-gallery` links inside `content/pages/index.html`). After T-012 redirects are verified, consider removing or archiving the whole layer so template files can never become routable again. | `content/pages/*` | Code review | P3 | 2 | 4 | 2 | After T-012 verification: remove shadowed files or gate the catch-all to an allowlist. | Deferred | SF crawl: no URLs resolve from content/pages other than intended `/zone9b` |
| T-007 | `CollectionSeoBoilerplate.js` generates near-identical "About Our X Collection" copy across all 20 collections. Thin/duplicate-content pattern as catalog grows. | `/collections/*` | Live check | P3 | 2 | 3 | 3 | After baseline: rewrite to pull collection-specific value (botanical families, care notes, local relevance). Not urgent at current catalog size. | Deferred | SF near-duplicate content report; Ahrefs rankings per collection |
| T-010 | Almanac (blog) contains 1 article. Content engine nascent — top-of-funnel gap for topical authority (care guides, acclimation, Florida gardening). | `/almanac/*` | Sitemap | P2 | 4 | 4 | 4 | Post-baseline: build content strategy from keyword gap analysis (workstreams G/H). | Deferred | Ahrefs Content Gap vs organic competitors |

## 2. Verified / Closed

| ID | Issue | Resolution | Date Closed |
|----|-------|------------|-------------|
| T-003 | Review GSC indexing history before drawing conclusions from new crawls | Reviewed `docs/GSC_INDEXING_RESOLUTIONS.md` (Sep 2026). Prior fixes: soft-404 elimination on legacy `product.html?item=` URLs, empty-collection noindex + sitemap filtering, canonical normalization, `/gallery` canonical route adoption. Baseline crawl must **verify these are deployed**, not rediscover them. | 2026-09-11 |
| T-005 | Suspected production code drift (live sitemap `/gallery` vs repo `/orchids-gallery`) | Not drift — two overlapping causes: (1) session sandbox clone was shallow and 5 commits behind main; (2) the gallery-consolidation PRs (#252, #254) merged 14:02–14:14 UTC **during** Session 1, with the sitemap fix deploying before the internal-link refactor. Post-deploy verification (14:19 UTC): homepage links `/gallery`, sitemap lists `/gallery`. Main branch = production, as owner stated. | 2026-09-11 |
| T-004 | Homepage/nav internal links pointing to redirecting `/orchids-gallery` | Resolved by PR #254 deploy (verified live 14:19 UTC). Residual stale links remain only inside unreachable legacy files (`content/pages/*.html`) — tracked as T-013. | 2026-09-11 |
| T-006 | Redirect chain `/orchids-gallery.html` → `/orchids-gallery` → `/gallery` | Fixed in `984a55d`: both legacy sources now redirect single-hop to `/gallery` (verified in current main `next.config.js`). | 2026-09-11 |

---

## Workstreams

A. Technical SEO · B. Indexation & Crawlability · C. Site Architecture · D. Internal Linking · E. Product SEO · F. Collection SEO · G. Content & Topical Authority · H. Keyword Growth · I. Local SEO (Tampa Bay) · J. Backlinks & Authority · K. Structured Data · L. Performance & CWV · M. SEO Monitoring · N. Competitive Intelligence

## Change Log

- 2026-09-11 (Session 1): Backlog created. Full baseline recon: stack verified, live checks (/, /sitemap.xml, /orchids-gallery, /gallery, /zone9b, /collections/herbs-medicinal, /index, /tag, /product, /global-head-template, /gros-michel-banana), code review (SEO.js, sitemap generator, product schema, redirects, catch-all routing), git history investigation of gallery consolidation. GSC history reviewed (T-003). Deploy-timing mystery resolved (T-005). Zombie template URLs discovered and fixed (T-012, PR pending merge). Baseline data package issued to owner (B-001…B-004).
