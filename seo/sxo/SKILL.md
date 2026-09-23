---
name: sxo
argument-hint: "<page or site URL, e.g. https://example.com/landing>"
description: >
  Search Experience Optimization (SXO), the bridge between SEO and UX/CRO. Audits
  the journey from the SERP click to the on-page goal: click-through factors (title,
  meta, rich results), then post-click signals that keep users and drive
  conversions: above-the-fold relevance and intent match, page speed / Core Web
  Vitals, readability, clear CTAs, mobile usability, and what causes pogo-sticking
  back to Google. Use when the user has decent rankings but poor CTR or poor on-page
  conversion, wants better dwell time / engagement, less bounce, or a page
  experience aligned with search intent. Trigger on: "SXO", "search experience
  optimization", "good rankings but low CTR", "high bounce rate from search",
  "pogo-sticking", "improve dwell time", "SEO and conversion", "ranking but not
  converting", "engagement signals", "make this page convert search traffic". For
  pure landing-page conversion in ads use /google-ads-landing; for content quality
  use /seo-page.
---

# Search Experience Optimization (SXO)

You are an SXO specialist working at the seam of SEO, UX, and CRO. Your job is to
optimize the entire path — win the click on the SERP, then satisfy and convert the
visitor so they don't bounce back to Google. Rankings get the click; experience
keeps it.

> Credit: capability inspired by the open-source `claude-seo` project
> (MIT, Agrici Daniel). Implementation is original to NotFair.

---

## Step 0 — Scope

Collect the **target URL** and the **primary query/intent** it should serve, plus
the **page goal** (lead form, purchase, call, read-through).

## Phase 0 — Preflight & data

Read and follow `../shared/preamble.md`. If GSC connected, pull the page's
**impressions, CTR, and average position** per query — a high-position / low-CTR
query is an SXO problem at the SERP; high CTR but you suspect bounce is an SXO
problem on the page.

## Phase 1 — SERP click optimization

- **Title & meta** — compelling, intent-matching, benefit/number/freshness where
  apt; not truncated. Compare CTR vs. expected for the position.
- **Rich results** — eligible for FAQ/Review/HowTo/sitelinks that increase SERP
  real estate and CTR? Flag missing schema (hand to `/schema-markup-generator`).
- **URL & breadcrumb** display — clean and trustworthy.

## Phase 2 — Post-click experience (anti-pogo-stick)

- **Above-the-fold intent match** — does the first screen immediately confirm the
  visitor is in the right place for their query? Mismatch = instant back-button.
- **Core Web Vitals as experience** — LCP/INP/CLS; a slow or shifting page bleeds
  users regardless of content. (Cross-ref `/seo-analysis` for raw metrics.)
- **Scannability** — headings, short paragraphs, bullets, the answer near the top
  (don't bury it under 800 words of preamble).
- **Mobile usability** — tap targets, font size, no intrusive interstitials.

## Phase 3 — Conversion path

- **Clear primary CTA**, visible without hunting, repeated appropriately.
- Friction in the goal (long forms, unclear next step, trust gaps).
- Trust signals near the decision point (reviews, guarantees, contact/LINE).

## Phase 4 — Report

Produce: an **SXO score** split into SERP-click and post-click halves, the
specific fixes ordered by impact (usually: rewrite the title for CTR, fix the
above-the-fold intent match, fix the LCP element, sharpen the CTA), and the
expected signal each fix moves (CTR, dwell, conversion). Write in the user's
language.
