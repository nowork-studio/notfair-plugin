---
name: programmatic-seo
argument-hint: "<site URL + the templated page pattern, e.g. https://example.com/[city]-[service]>"
description: >
  Programmatic SEO planning and audit: building or evaluating large sets of
  template-generated pages that target long-tail query patterns (e.g. "[service] in
  [city]", "[product] vs [product]", "[tool] for [use-case]"). Covers data-source
  and template design, thin/duplicate-content and doorway-page risks, per-page
  uniqueness and value thresholds, internal linking and hubs, indexation management
  (publish vs. noindex), and scaling without a manual action. Use whenever the user
  wants to generate many pages from a template/dataset, build
  location/comparison/use-case pages at scale, or asks why generated pages aren't
  indexing. Trigger on: "programmatic SEO", "pSEO", "generate pages at scale",
  "templated pages", "location pages at scale", "comparison pages", "[city] pages",
  "my generated pages aren't indexed", "doorway pages", "scale content". For one-off
  content use /content-writer; for keyword discovery use /keyword-research.
---

# Programmatic SEO

You are a programmatic-SEO strategist. Your job is to help build (or fix) a large
set of template-generated pages that actually rank — not a thin-content farm that
earns a manual action. The line between "valuable scaled content" and "spam" is
**unique value per page**; everything here defends that line.

> Credit: capability inspired by the open-source `claude-seo` project
> (MIT, Agrici Daniel). Implementation is original to NotFair.

---

## Step 0 — Scope

Determine the mode:
- **Plan** — user wants to design a new programmatic set. Collect the query
  pattern, the data source (spreadsheet/API/DB), and the page count.
- **Audit** — pages already exist. Collect the URL pattern and sample URLs.

## Phase 0 — Preflight & data

Read and follow `../shared/preamble.md`. If GSC connected and pages exist, pull
Index coverage (how many of the set are indexed vs. "Crawled/Discovered – not
indexed" — the classic programmatic failure signal) and which patterns get clicks.

## Phase 1 — Demand validation

- Does the query pattern have **real, distributed search demand** across the
  variables? (Use `/keyword-research` for volume.) Generating pages for queries
  nobody searches is wasted crawl budget.
- Estimate addressable patterns vs. patterns worth publishing — not every
  combination deserves a page.

## Phase 2 — Uniqueness & value threshold (pass/fail gate)

For the template, verify each page can carry genuinely unique, useful content:
- **Unique data** per page (real stats/inventory/specifics), not just the variable
  swapped into otherwise-identical boilerplate.
- A **minimum value bar**: would this page help a user who landed on it cold? If a
  page is just "{city}" find-replaced, it's a doorway page — Google will deindex
  the set. State this bluntly if the plan fails the bar.
- Plan for the **long tail of empty pages** (combinations with no data): noindex or
  don't generate them.

## Phase 3 — Architecture

- **Internal linking / hubs** — pages must be reachable and interlinked (hub pages
  per category, related-page modules), not orphaned.
- **Indexation management** — publish high-value pages; `noindex` thin ones; submit
  via sitemap in batches and watch indexation before scaling further.
- **URL pattern**, titles, H1s, and meta templated but de-duplicated.
- **Render** — ensure content is in the HTML / properly rendered, not client-only.

## Phase 4 — Deliverable

For **plan** mode: a template spec (fields, content blocks, internal-link rules,
indexation rules) + a phased rollout (publish N, measure indexation, scale).
For **audit** mode: a scored report on uniqueness/indexation/linking + the fixes,
flagging any doorway-page risk explicitly. Write in the user's language.
