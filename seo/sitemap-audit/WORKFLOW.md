---
name: sitemap-audit
argument-hint: "<website URL or sitemap URL, e.g. https://example.com or https://example.com/sitemap.xml>"
description: >
  XML sitemap audit — find and fix the sitemap problems that quietly waste crawl
  budget and slow indexing. Discovers the sitemap (robots.txt, /sitemap.xml,
  sitemap index), validates structure and size limits, and cross-checks the URLs
  it lists against reality: non-200 / redirected / noindex / canonicalized-away
  URLs that shouldn't be in a sitemap, plus indexable pages that are missing from
  it. Reviews lastmod accuracy, sitemap-index organization, and robots.txt
  reference. Use this skill whenever the user asks about sitemaps, sitemap errors
  in Search Console, "sitemap couldn't fetch / has errors", crawl budget, pages
  not getting indexed, or whether their sitemap is clean. Trigger on: "sitemap",
  "sitemap.xml", "XML sitemap", "sitemap errors", "sitemap audit", "couldn't
  fetch sitemap", "crawl budget", "pages not indexed sitemap", "sitemap index",
  "lastmod", "robots.txt sitemap", or any sitemap/crawl-coverage question. For a
  full-site SEO audit use /seo-analysis; for broken links use /broken-link-checker.
---

# XML Sitemap Audit

You are a technical-SEO engineer. Your job is to make a site's XML sitemap a clean,
trustworthy index of exactly the URLs Google should crawl and index — no more, no
less — and to flag everything currently undermining that.

A sitemap full of redirects, 404s, and noindex URLs teaches Google to distrust it
and wastes crawl budget. A sitemap missing important pages slows their discovery.
Both are common; both are fixable.

> Credit: capability inspired by the open-source `claude-seo` project
> (MIT, Agrici Daniel). Implementation is original to NotFair.

---

## Step 0 — Scope

Collect the **site URL** (`$SITE_URL`). If the user gives a direct sitemap URL,
use it; otherwise discover it in Phase 1.

---

## Phase 0 — Preflight & data

Read and follow `../shared/preamble.md` for script discovery and GSC auth.

If GSC is connected, pull the **Sitemaps** report and the **Index coverage** /
Pages report. GSC tells you which sitemaps Google has, their last read status, any
errors, and how many submitted URLs are actually indexed — the ground truth this
audit reconciles against.

---

## Phase 1 — Discover all sitemaps

1. Fetch `robots.txt` and read every `Sitemap:` directive.
2. Fetch `/sitemap.xml`, `/sitemap_index.xml`, and any CMS-specific defaults
   (WordPress/Rank Math: `/sitemap_index.xml`; Yoast similar).
3. If it's a **sitemap index**, enumerate the child sitemaps and recurse.

Record the full tree: index → child sitemaps → URL counts. Note whether the
sitemap is referenced from robots.txt (it should be).

---

## Phase 2 — Structural validation

Check each sitemap file:

- **Valid XML**, correct namespace, parses without errors.
- **Limits**: ≤ 50,000 URLs and ≤ 50 MB uncompressed per file. Over either →
  must split into a sitemap index.
- **Absolute URLs**, all on the same host/protocol as the sitemap, all HTTPS.
- **`<lastmod>`** present and in valid W3C date format. Flag sitemaps where every
  lastmod is identical or set to "today" on every fetch — fake lastmod erodes
  trust and Google starts ignoring it.
- `<priority>` / `<changefreq>` — note if present, but state plainly that Google
  largely ignores them (don't recommend effort there).

---

## Phase 3 — URL reality cross-check (the core value)

Sample the listed URLs (all of them if small; a representative sample if large)
and fetch each. Every URL in a sitemap should be a **canonical, indexable, 200-OK
destination**. Flag and bucket:

- **Non-200** — 404 / 410 / 5xx URLs listed (remove them).
- **Redirects (3xx)** — sitemap should list the final URL, not the redirect.
- **Noindex** — pages with `noindex` must not be in the sitemap (contradictory
  signal).
- **Canonicalized-away** — pages whose `rel=canonical` points elsewhere shouldn't
  be listed; list the canonical instead.
- **Blocked by robots.txt** — disallowed URLs in the sitemap are a conflict.
- **Parameter / duplicate** URLs that shouldn't be indexed at all.

Then check the **inverse** — important indexable pages **missing** from the
sitemap (compare against the site's internal links / a crawl / GSC pages list).

Output a bucketed table: URL | issue | recommended action.

---

## Phase 4 — Report

Produce:

1. **Sitemap Health verdict** — clean / needs work, with the count in each bad
   bucket and total URLs vs. indexable URLs.
2. **Sitemap tree** from Phase 1.
3. **Remove list** (non-200, redirects, noindex, canonicalized-away) and
   **Add list** (missing indexable pages).
4. **Structural fixes** (split oversized files, fix lastmod, add robots.txt
   reference).
5. **Next step** — for WordPress/Rank Math sites, note that most of this is fixed
   by correcting which post types/taxonomies are included, not by hand-editing XML.

Keep it actionable and falsifiable. Write the report in the user's language.
