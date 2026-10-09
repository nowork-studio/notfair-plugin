# NotFair — Skill Resolver for AI Agents

**This file is the universal entry point.** Any AI coding agent (Claude Code, Codex, Hermes, Cursor, etc.) reads this to know which NotFair skill to run for which user intent.

If you are an agent and a user mentions Google Ads, Meta Ads, SEO, GEO, or anything in the tables below, route to the named skill.

For repository maintenance, read [`docs/plugin-development.md`](docs/plugin-development.md). Installed workflow instructions live in the skills below.

---

## How to use this file

1. **Match the user's intent** against the rows below.
2. **Read the named skill's `SKILL.md`** from the path shown.
3. **Follow the procedure** in that SKILL.md exactly.

Skills under `skills/` are **host-agnostic**; each entry loads its full workflow from the corresponding category folder — they work the same on every supported agent host.

---

## SEO

| Intent | Skill | Path |
|---|---|---|
| Full-site SEO audit, traffic drop, GSC analysis, Core Web Vitals | `seo-analysis` | `skills/seo-analysis/SKILL.md` |
| Single-page deep audit (URL-specific) | `seo-page` | `skills/seo-page/SKILL.md` |
| Write or improve content (blog, landing, service page) | `content-writer` | `skills/content-writer/SKILL.md` |
| Plan content from GSC data, build a dated editorial calendar | `content-planner` | `skills/content-planner/SKILL.md` |
| Keyword discovery, topic clusters (seed → keyword universe) | `keyword-research` | `skills/keyword-research/SKILL.md` |
| Title tags, meta descriptions, Open Graph, CTR | `meta-tags-optimizer` | `skills/meta-tags-optimizer/SKILL.md` |
| JSON-LD / structured data (FAQ, Product, HowTo, etc.) | `schema-markup-generator` | `skills/schema-markup-generator/SKILL.md` |
| Broken-link / 404 / site-health crawl | `broken-link-checker` | `skills/broken-link-checker/SKILL.md` |
| Rank in ChatGPT / Perplexity / AI Overviews (GEO / AEO) | `geo-optimizer` | `skills/geo-optimizer/SKILL.md` |
| Local pack / Google Business Profile / Maps / NAP / "near me" | `local-seo` | `skills/local-seo/SKILL.md` |
| Hreflang, international / multilingual, multi-region targeting | `hreflang-international` | `skills/hreflang-international/SKILL.md` |
| XML sitemap audit, sitemap errors, crawl-coverage | `sitemap-audit` | `skills/sitemap-audit/SKILL.md` |
| Image SEO, alt text, Google Images, WebP, image schema | `image-seo` | `skills/image-seo/SKILL.md` |
| E-commerce SEO, product/category pages, faceted nav, product schema | `ecommerce-seo` | `skills/ecommerce-seo/SKILL.md` |
| Programmatic / templated pages at scale (pSEO) | `programmatic-seo` | `skills/programmatic-seo/SKILL.md` |
| Competitor page gap analysis, "why do they outrank me", SERP brief | `competitor-pages` | `skills/competitor-pages/SKILL.md` |
| Search Experience Optimization (SXO), CTR + on-page conversion | `sxo` | `skills/sxo/SKILL.md` |
| SEO drift / regression monitoring, baseline & compare over time | `seo-drift` | `skills/seo-drift/SKILL.md` |
| Backlink / off-page audit, anchor text, referring domains, disavow | `backlink-audit` | `skills/backlink-audit/SKILL.md` |
| Local Application-Password / `.env.local` CMS setup for SEO scripts (WordPress, Strapi, Contentful, or Ghost) | `setup-cms` | `skills/setup-cms/SKILL.md` |

## Paid Ads

| Intent | Skill | Path |
|---|---|---|
| Broad ads question, cross-channel strategy, budget, CPA/ROAS, or route to the right workflow | `paid-ads` | `skills/paid-ads/SKILL.md` |
| How NotFair paid ads works, install, plan/limit, supported platforms, or product troubleshooting | `paid-ads-guide` | `skills/paid-ads-guide/SKILL.md` |
| Connect an account, establish marketing context, or refresh a paid-media workspace | `paid-ads-setup` | `skills/paid-ads-setup/SKILL.md` |
| Check connector access, tools, or supported platform capabilities | `paid-ads-integrations` | `skills/paid-ads-integrations/SKILL.md` |
| Plan a new campaign or multi-channel experiment before it can spend | `paid-ads-launch` | `skills/paid-ads-launch/SKILL.md` |
| Weekly/monthly performance report, scorecard, pacing, or tracking health | `paid-ads-review` | `skills/paid-ads-review/SKILL.md` |
| Wasted spend, budget allocation, overspend, or safe optimization proposal | `paid-ads-optimize` | `skills/paid-ads-optimize/SKILL.md` |
| Cross-channel copy, creative concepts, fatigue diagnosis, or test briefs | `paid-ads-creative` | `skills/paid-ads-creative/SKILL.md` |
| X Ads performance, campaigns, line items, targeting, creative, or writes | `paid-ads-x` | `skills/paid-ads-x/SKILL.md` |
| LinkedIn Ads performance, campaigns, targeting, leads, creative, or writes | `paid-ads-linkedin` | `skills/paid-ads-linkedin/SKILL.md` |
| Reddit Ads performance, campaigns, ad groups, ads, targeting, audiences, or writes | `paid-ads-reddit` | `skills/paid-ads-reddit/SKILL.md` |
| TikTok Ads performance, campaigns, creative, targeting, or writes | `paid-ads-tiktok` | `skills/paid-ads-tiktok/SKILL.md` |
| Amazon Ads plan, ACoS review, ASIN targeting, or export-based review | `paid-ads-amazon` | `skills/paid-ads-amazon/SKILL.md` |
| ChatGPT Ads experiment plan or verified-export review | `paid-ads-chatgpt` | `skills/paid-ads-chatgpt/SKILL.md` |

## WordPress

| Intent | Skill | Path |
|---|---|---|
| Live WordPress content, media, comments, design, settings, plugins, themes, HTML files, or approved site changes through NotFair MCP | `wordpress` | `skills/wordpress/SKILL.md` |

## CRM

| Intent | Skill | Path |
|---|---|---|
| GoHighLevel / HighLevel contacts, conversations, opportunities, calendars, pipelines, or approved CRM writes | `gohighlevel` | `skills/gohighlevel/SKILL.md` |

## Analytics

| Intent | Skill | Path |
|---|---|---|
| GA4 traffic, acquisition, engagement, conversions, realtime, or measurement configuration | `google-analytics` | `skills/google-analytics/SKILL.md` |
| Live Search Console queries/pages, traffic changes, URL inspection, or sitemaps | `search-console` | `skills/search-console/SKILL.md` |

## Google Ads

| Intent | Skill | Path |
|---|---|---|
| First-time setup or account health check | `google-ads-audit` | `skills/google-ads-audit/SKILL.md` |
| Performance, keywords, bids, budgets, negatives, experiments, bulk ops | `google-ads` | `skills/google-ads/SKILL.md` |
| Write ad copy, RSA headlines/descriptions, A/B variants | `google-ads-copy` | `skills/google-ads-copy/SKILL.md` |
| Google Ads assets, extensions, sitelinks, callouts, image assets, PMax asset briefs | `google-ads-assets` | `skills/google-ads-assets/SKILL.md` |
| Landing-page quality, ad-to-page match, LPX diagnosis | `google-ads-landing` | `skills/google-ads-landing/SKILL.md` |

## Meta Ads

| Intent | Skill | Path |
|---|---|---|
| First-time Meta setup or account health check | `meta-ads-audit` | `skills/meta-ads-audit/SKILL.md` |
| Facebook/Instagram performance, ROAS, CPM, creative fatigue, audience overlap | `meta-ads` | `skills/meta-ads/SKILL.md` |
| Facebook/Instagram ad creative, copy angles, UGC concepts, asset briefs, creative refreshes | `meta-ads-creative` | `skills/meta-ads-creative/SKILL.md` |

## Cross-model review

| Intent | Skill | Path |
|---|---|---|
| Second opinion / review / challenge / consult via Google Gemini | `gemini` | `skills/gemini/SKILL.md` |

## Plugin maintenance

| Intent | Skill | Path |
|---|---|---|
| Upgrade NotFair to the latest version | `upgrade` | `skills/upgrade/SKILL.md` |

## External dependencies

- **Universal NotFair MCP** — `https://notfair.co/api/mcp/notfair`, OAuth. The plugin registers this single connection for Google Ads, Meta Ads, X Ads, LinkedIn Ads, Reddit Ads, TikTok Ads, Google Search Console, Google Analytics, WordPress, and GoHighLevel. Read [`docs/mcp-connection.md`](docs/mcp-connection.md) before live work. Use the connected server's current instructions and capability descriptions to select tools and verify workspace/platform access; do not prescribe tool names or call sequences in skills.
- **Platform connections** — each live skill still requires its corresponding account or property to be connected inside the selected NotFair workspace. A universal MCP session does not imply that every platform is connected.
- **Google Gemini API key** — required for `gemini`.

Amazon and ChatGPT Ads skills are planning/review workflows unless the current session exposes a verified connector. They do not imply account or mutation access. `setup-cms` is local Application-Password / `.env.local` setup for SEO scripts; it is not the NotFair WordPress MCP connector.

Skills check for missing credentials at startup and walk the user through setup. Do not invent credentials or skip skills silently — surface the gap.

---

## Conventions for installers (managed-block fences)

Any installer that writes into a file the user also edits (e.g., a user's workspace `AGENTS.md`, `CLAUDE.md`, or host config) MUST wrap its inserted content in a fence:

```
<!-- notfair:managed -->
... auto-generated rows ...
<!-- /notfair:managed -->
```

Re-running the installer rewrites only inside the fence. Anything outside is preserved.

---

## Bookkeeping

When a new skill is added or removed in this repo, update:

1. The relevant table above in this file.
2. `.claude-plugin/plugin.json` → `skills` array.
3. `VERSION`, `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json` (version bump).
4. `CHANGELOG.md` (user-facing note).

A skill that exists on disk but is missing from this file or `plugin.json` is invisible to agents.
