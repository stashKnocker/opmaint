# Opmaint SEO Audit — Astro Fixes (Merged to `main`)

**Repo:** stashKnocker/opmaint  
**Commit:** `e7b8aee`  
**Scope:** Astro-served pages only (`/procedure`, `/checklist/*`, `/tools/*`, `/blog` listing). Webflow marketing pages and `/blogs/*` posts are **not** included.

---

## What we fixed

### 1. Broken links

- Replaced broken `https://app.opmaint.com/login-route` with `https://app.opmaint.com/login` in:
  - Mobile navbar
  - Checklist sidebar CTA (“Start Free Trial”)
- This fixes 404s on **218+ pages** (all checklist, procedure, and tools pages that use the global Astro template).
- Footer **ROI Calculator** link updated: `/calculator` → `/tools/roi-calculator`.

### 2. Canonical tags

- Checklist pages now use SEO sheet `canonical` overrides in the HTML canonical tag and JSON-LD (they were defined but not applied before).
- `http://` canonical URLs are normalized to `https://` in the layout.
- Fixed 2 `http://` canonical values in `checklist-seo-overrides.json`.
- Added explicit canonical tags on `/procedure` and all `/tools/*` pages.

### 3. Title & meta description length

- Added shared SEO helpers to cap:
  - **Titles:** 60 characters
  - **Meta descriptions:** 158 characters
- Applied to all checklist pages, including SEO sheet overrides.
- `/tools/roi-calculator`: expanded title and description.
- `/tools/unit-converter`: shortened title (was over 60 chars).

### 4. Structured data (JSON-LD)

- `/procedure` and `/blog`: `WebPage` + `BreadcrumbList`
- All `/tools/*` calculators: `WebApplication` + `BreadcrumbList`
- Checklists already had `ItemList` JSON-LD; canonical wiring was improved.

### 5. Open Graph (Astro pages)

- Astro layout already outputs OG + Twitter tags on all Astro pages.
- `/blog` listing now uses the **featured post image** as `og:image` when available.

### 6. Thin content

Added on-page SEO content blocks to address thin pages:

| Area | Before | After (approx.) |
|------|--------|-------------------|
| `/tools/*` calculators | 66–124 words | 440–470 words each |
| `/tools` index | ~230 words | 550+ words |
| `/checklist/*` | 142–299 words | 400–570+ words |
| `/procedure` | Already high (lists all checklists) | Added hub intro copy |

Content includes: how to use, why it matters, industry tips (by category), Opmaint CTA, and tool-specific FAQs.

### 7. Visible breadcrumbs

Added HTML breadcrumbs (not just JSON-LD) on:

- All checklist pages: **Home → Procedure Hub → Checklist**
- All tool pages: **Home → Tools → Calculator**
- `/tools` and `/procedure` hub pages

---

## New files added

- `src/lib/seo.ts` — title/description caps, JSON-LD helpers
- `src/lib/checklist-content.ts` — checklist + procedure hub enrichment copy
- `src/lib/tool-content.ts` — calculator enrichment + FAQs
- `src/components/Breadcrumbs.astro` — visible breadcrumb navigation
- `src/components/SeoContentSection.astro` — renders enrichment sections

## Key files modified

- `src/components/Navbar.astro`
- `src/components/CtaSidebar.astro`
- `src/components/Footer.astro`
- `src/layouts/Layout.astro`
- `src/pages/checklist/[slug].astro`
- `src/pages/procedure/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/tools/*.astro` (all 11 calculators + index)
- `src/styles/pages.css`
- `src/data/checklist-seo-overrides.json`

---

## Still needs Webflow / app team (not done in this release)

| Issue | Where to fix |
|-------|----------------|
| `signup-route` 404 on `/pricing` | Webflow + `app.opmaint.com` (only `/login` works today) |
| Broken HACCP / blog internal links | Webflow CMS blog content |
| `/checklist-and-inventory` 404 | Webflow |
| `example.com/demo` placeholder | Webflow blog |
| Compare pages wrong canonicals (pointing to Limble) | Webflow compare templates |
| 80 missing blog canonicals | Webflow `/blogs/*` template |
| 803 missing alt texts | Webflow marketing pages |
| Missing OG tags on `/blogs/*` posts | Webflow |
| Missing `og:image` on homepage, pricing, industries, compare | Webflow page settings |
| Duplicate compare meta descriptions | Webflow |
| Missing meta on `/industry/agriculture`, `/industry/property` | Webflow |
| H1 issues (missing/multiple) on blogs & compare | Webflow CMS |
| No JSON-LD on `/cmms-software`, `/compare/*`, `/calculator` | Webflow |
| Slow page response times | Infra / Webflow / caching |
| `robots.txt` / sitemap hygiene (duplicate lines, missing `lastmod`, `/procedure/` trailing slash) | Webflow + Cloudflare worker |
| Mixed `http://` links on OSHA blogs | Webflow blog content |
| Hreflang | N/A — English-only site, safe to ignore |

---

## Deployment note

Changes are **merged and pushed to `main`**. After Netlify deploys, verify on live:

- Any checklist page: breadcrumbs, canonical, enriched content below checklist
- Any tools page: breadcrumbs, calculator + FAQ content
- Mobile nav “Log in” goes to `app.opmaint.com/login` (not `login-route`)
- Footer ROI link goes to `/tools/roi-calculator`

---

## Quick ownership split

| Owner | Responsibility |
|-------|----------------|
| **Engineering (done)** | Astro: procedure hub, checklists, tools, blog listing |
| **Webflow team** | Homepage, pricing, industries, compare pages, individual blog posts |
| **App team** | Working signup URL on `app.opmaint.com` (if “Start Free Trial” should not go to login) |
| **DevOps** | Cloudflare worker trailing-slash behavior, sitemap/robots on Webflow origin |
