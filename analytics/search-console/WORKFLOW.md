---
name: search-console
description: Query and operate connected Google Search Console properties through NotFair MCP. Use for live GSC query or page performance, clicks, impressions, CTR, position, traffic changes, indexing status, URL inspection, sitemap reads or approved sitemap submission/removal, and Search Console MCP setup. Route full-site SEO audits to seo-analysis.
argument-hint: "<property, URL, query, date range, or sitemap>"
---

# Google Search Console

Read `../shared/operating-contract.md`. Use the live connector's instructions and schemas to choose tools for the task. For a full-site SEO audit that also needs crawling and on-page analysis, hand off to `/notfair:seo-analysis` after confirming access.

## Select the exact property

1. Resolve `~~search-console` to the actual Search Console connector and inspect its current tools. Use live property information to identify the intended site.
2. Use the exact verified property form returned by the connector: `sc-domain:example.com` and `https://example.com/` are different properties.
3. Define the search type, complete date window, comparison window, dimensions, and business question. If the platform is missing or unauthorized, direct the user to reconnect the universal NotFair plugin and stop before claiming live data.

## Analyze organic performance

Correlate totals, queries, pages, countries, and devices as needed for the question. Choose available reporting capabilities; batch related reads when supported and useful, and use a narrow read for a single property, URL, or sitemap.

- Query totals without the `query` dimension when reconciling property-level clicks and impressions. Anonymized low-volume queries make query rows incomplete by design.
- Finalized data normally lags recent dates; label fresh `all` data as provisional.
- Show clicks, impressions, CTR, and average position with their exact dimensions and period. Do not average already-aggregated CTR or position rows naively.
- Respect row and historical coverage limits reported by the connector. State when the result is top rows rather than a complete export.
- Use URL inspection selectively because its quota is tighter than Search Analytics. Inspection reports index state; it does not request indexing.
- Treat ranking movement as evidence, not proof of a specific algorithmic cause.

Lead with the largest material gain or loss, affected queries/pages, evidence-backed hypothesis, confidence, and the next SEO action. Route content rewrites, technical remediation, or full audits to the corresponding SEO skill.

## Manage sitemaps safely

Submit or remove a sitemap through a supported capability only after showing the exact verified property and sitemap URL and obtaining approval. Confirm the sitemap belongs to the selected property and is fetchable before submission when possible.

Submission and deletion are reversible counterparts, but deleting a submitted sitemap does not remove its URLs from Google's index. Never describe sitemap submission as an indexing guarantee. Confirm the resulting sitemap state from returned before/after evidence or a fresh list.
