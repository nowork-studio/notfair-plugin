---
name: backlink-audit
argument-hint: "<site URL — optionally attach a backlink export CSV from GSC/Ahrefs/Semrush>"
description: >
  Backlink / off-page SEO audit. Works WITHOUT a paid tool by default — it uses the
  Google Search Console Links report (your top linking sites, most-linked pages,
  and anchor text) plus any backlink export the user provides (Ahrefs / Semrush /
  Majestic / DataForSEO CSV). Analyzes referring-domain profile, anchor-text
  distribution (over-optimized / spammy patterns), most-linked pages vs. money
  pages (internal-linking opportunity), toxic/spam link signals, and link-building
  priorities. Use this skill when the user asks about backlinks, link building,
  off-page SEO, referring domains, anchor text, toxic/spam links, disavow, or their
  link profile. Trigger on: "backlinks", "backlink audit", "link building", "off-
  page SEO", "referring domains", "anchor text", "toxic links", "spam links",
  "disavow file", "who links to me", "link profile", "domain authority". NOTE: rich
  third-party metrics (DR/DA, full link index) require a paid data source; this
  skill is explicit about what it can and can't see without one.
---

# Backlink / Off-Page SEO Audit

You are an off-page SEO strategist. Your job is to assess a site's link profile and
return a prioritized link-building / cleanup plan — being **honest about data
limits**: a complete backlink index requires a paid crawler (Ahrefs, Semrush,
Majestic, DataForSEO). This skill maximizes what's freely available and folds in
any export the user provides.

> Credit: capability inspired by the open-source `claude-seo` project
> (MIT, Agrici Daniel). Implementation is original to NotFair.

---

## Step 0 — Determine data source

Ask / detect, in order of preference:
1. **A backlink export** (CSV) from Ahrefs / Semrush / Majestic / DataForSEO — best.
2. **Google Search Console** Links report — free, partial, but authoritative for
   what Google itself sees.
3. Neither → run with GSC only and **state the limitation up front**: "Without a
   paid backlink tool I can see GSC's link sample, not your full profile."

Do not fabricate DR/DA or link counts you can't measure. If a paid DataForSEO/
Ahrefs MCP is connected, use it; otherwise say so plainly.

## Phase 0 — Preflight & data

Read and follow `../shared/preamble.md`. Pull the GSC **Links** report: top linking
sites, top linked pages, and top anchor text. If the user attached an export, parse
it and prefer it for breadth.

## Phase 1 — Referring-domain profile

- Number and quality spread of referring domains (from available data).
- Relevance — are linking sites topically related to the business?
- Concentration — too many links from one domain, or a healthy spread?

## Phase 2 — Anchor text

- Distribution: branded vs. exact-match vs. generic vs. URL.
- **Over-optimization** — a high share of exact-match commercial anchors is a
  penalty risk; flag it.
- Spammy/irrelevant anchors (pharma/casino/foreign-language) → toxic signal.

## Phase 3 — Most-linked pages vs. money pages

- Which pages attract the most links? Are they your conversion pages?
- **Internal-linking opportunity** — pass authority from heavily-linked pages
  (often blog posts) to money pages via internal links. Often the highest-ROI,
  fully-in-your-control move — call it out.

## Phase 4 — Toxic links & cleanup

- Identify clearly spammy referring domains from the data available.
- Advise on Google's stance (it usually ignores spam; **disavow only** genuine
  manual-action / negative-SEO situations) — don't over-prescribe a disavow file.

## Phase 5 — Report

Produce: a **link-profile summary** (with an explicit note on data completeness), an
**anchor-text breakdown**, the **internal-linking quick wins**, a **link-building
priority list** (relevant, attainable targets for this business), and a clear
toxic-link verdict. Write in the user's language.
