# NotFair Plugin

[![License: MIT](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?logo=discord&logoColor=white)](https://discord.gg/gVJCRczpps)

**Open-source SEO, GEO, and marketing skills for AI agents.**

The NotFair Plugin gives Claude Code, Codex, Hermes, and other compatible agents practical marketing workflows they can follow—not another generic prompt collection. Use it to audit a site, investigate a traffic drop, analyze GA4 and Search Console, find wasted ad spend across Google, Meta, X, LinkedIn, Reddit, and TikTok, operate connected WordPress and GoHighLevel accounts, build campaign plans, and make reviewable changes.

Each skill has one discoverable `skills/<name>/SKILL.md` entry point. It loads a readable `WORKFLOW.md` in the category folder, with supporting references, scripts, and evals where needed. Inspect it, adapt it, or contribute a better workflow.

## What your agent can do

| Area | Examples |
|---|---|
| **SEO** | Full-site and page audits, keyword research, content planning, technical SEO, schema, local SEO, international SEO, e-commerce SEO, and regression monitoring |
| **GEO / AEO** | Improve content for citation and visibility in ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews |
| **Paid media** | Plan, review, and optimize cross-channel campaigns with explicit budgets, measurement, and approval boundaries |
| **Google Ads** | Audit accounts, analyze search terms, manage keywords and budgets, write RSA copy, plan assets, and diagnose landing pages |
| **Meta Ads** | Review Facebook and Instagram performance, diagnose creative fatigue, assess audiences, and create evidence-based creative briefs |
| **X Ads** | Analyze campaigns and line items, review conversion performance, manage targeting and creative, and execute approved changes |
| **LinkedIn Ads** | Connect B2B media to lead quality, analyze campaign groups and campaigns, and manage targeting, creative, conversions, and leads |
| **Reddit Ads** | Analyze campaigns, ad groups, and ads, review conversions and audiences, and execute approved Reddit Ads changes |
| **TikTok Ads** | Analyze connected TikTok advertisers, review delivery and creative performance, and execute approved campaign changes |
| **WordPress** | Read and update connected WordPress content, media, comments, design, settings, plugins, and approved site changes |
| **GoHighLevel** | Read contacts, conversations, opportunities, and calendars, then make only explicitly requested CRM changes |
| **Analytics** | Query live GA4 and Search Console data, compare complete periods, inspect URLs, manage sitemaps, and update supported measurement configuration |
| **Content** | Turn search demand into editorial plans, briefs, articles, landing pages, metadata, and structured data |

The NotFair Plugin currently ships **48 skills** across SEO, GEO, paid media, advertising platforms, analytics, WordPress, CRM, and cross-model review.

## Quick start

### Claude Code

Install the NotFair plugin from its marketplace:

```text
/plugin marketplace add nowork-studio/notfair-plugin
/plugin install notfair@nowork-studio
```

Then ask for the workflow you need:

```text
/notfair:seo-analysis
/notfair:geo-optimizer
/notfair:google-ads-audit
/notfair:meta-ads-creative
/notfair:paid-ads-x
/notfair:google-analytics
/notfair:search-console
```

You can also use plain language:

> Audit my site and tell me why organic traffic fell.

> Find pages that could earn citations in AI answers.

> Review last month's ad spend and show me the safest opportunities to improve ROAS.

### Cursor

Install **NotFair** from Cursor's plugin marketplace. The plugin loads the
open-source marketing skills in this repository and registers one hosted
NotFair MCP connection. Complete the browser OAuth flow when Cursor prompts
you, then ask Cursor to audit an ad account, analyze GA4 or Search Console, or
run one of the SEO and GEO workflows listed below.

For local testing before the marketplace listing is available, clone this
repository into Cursor's local plugin directory:

```bash
git clone https://github.com/nowork-studio/notfair-plugin.git ~/.cursor/plugins/local/notfair
```

Restart Cursor after installing or updating the local plugin.

### Kiro Powers

Install the public repository as a custom power from Kiro's Powers panel, or
find **NotFair** in the Powers registry after its listing is approved. The root
[`plugin.json`](plugin.json) and [`mcp.json`](mcp.json) follow the Agent Plugins
1.0 specification.

### Gemini CLI

Install the extension directly from GitHub:

```bash
gemini extensions install https://github.com/nowork-studio/notfair-plugin
```

The extension loads the repository guidance and the universal NotFair MCP. Run
`/mcp auth NotFair` in Gemini CLI when authentication is requested.

### Codex, Hermes, and other agents

Install the universal NotFair plugin directly through Codex:

```bash
codex plugin marketplace add nowork-studio/notfair-plugin --json && codex plugin add notfair@nowork-studio --json && codex mcp login NotFair
```

Codex installs the skills, registers one NotFair MCP connection, and opens its OAuth flow. If you prefer a workspace-local checkout, clone the repository and open it as a workspace; [`AGENTS.md`](AGENTS.md) maps marketing requests to the right skill.

```bash
git clone https://github.com/nowork-studio/notfair-plugin.git
cd notfair-plugin
```

If the `nowork-studio` marketplace is already configured, refresh it instead:

```bash
codex plugin marketplace upgrade nowork-studio --json && codex plugin add notfair@nowork-studio --json && codex mcp login NotFair
```

For host-specific setup, give your agent [`INSTALL_FOR_AGENTS.md`](INSTALL_FOR_AGENTS.md), or paste:

```text
Retrieve and follow the instructions at:
https://raw.githubusercontent.com/nowork-studio/notfair-plugin/main/INSTALL_FOR_AGENTS.md
```

## Why skills instead of one giant marketing agent?

Marketing work gets unreliable when every request goes through the same vague prompt. The NotFair Plugin splits the work into focused, testable procedures.

- **Specialized:** each skill has a defined job, required inputs, decision rules, and output format.
- **Evidence-led:** live-data workflows use Search Console, Google Analytics, Google Ads, Meta Ads, X Ads, LinkedIn Ads, Reddit Ads, TikTok Ads, WordPress, or GoHighLevel instead of guessing from generic best practices.
- **Safe by design:** read-only review comes before mutation, paid-media changes stay explicit, and unsupported capabilities are never implied.
- **Host-agnostic:** the canonical skills are plain files, not logic trapped inside one agent runtime.
- **Forkable:** everything is MIT licensed, so teams can review and adapt the workflows to their own standards.

## Skill catalog

### SEO and GEO

| Skill | What it does |
|---|---|
| [`seo-analysis`](seo/seo-analysis/) | Audits a full site with Search Console and crawl data, then prioritizes the highest-impact fixes. |
| [`seo-page`](seo/seo-page/) | Performs a deep audit of one URL for intent, content, structure, and on-page SEO. |
| [`content-writer`](seo/content-writer/) | Writes or improves search-led articles, landing pages, and service pages. |
| [`content-planner`](seo/content-planner/) | Turns Search Console opportunities into a prioritized, dated editorial calendar. |
| [`keyword-research`](seo/keyword-research/) | Builds a keyword universe, classifies intent, and organizes topic clusters. |
| [`meta-tags-optimizer`](seo/meta-tags-optimizer/) | Improves titles, meta descriptions, Open Graph tags, and SERP click-through potential. |
| [`schema-markup-generator`](seo/schema-markup-generator/) | Creates and validates JSON-LD structured data. |
| [`broken-link-checker`](seo/broken-link-checker/) | Finds broken internal and external links and reports site-health issues. |
| [`geo-optimizer`](seo/geo-optimizer/) | Audits and rewrites content for citation in AI search and answer engines. |
| [`local-seo`](seo/local-seo/) | Reviews Google Business Profile, local pages, NAP consistency, reviews, and local schema. |
| [`hreflang-international`](seo/hreflang-international/) | Diagnoses hreflang, canonical, language, and regional targeting problems. |
| [`sitemap-audit`](seo/sitemap-audit/) | Checks XML sitemap structure, freshness, coverage, and URL validity. |
| [`image-seo`](seo/image-seo/) | Reviews alt text, formats, compression, responsive images, CLS, and image discovery. |
| [`ecommerce-seo`](seo/ecommerce-seo/) | Audits product pages, category pages, variants, faceted navigation, and product schema. |
| [`programmatic-seo`](seo/programmatic-seo/) | Plans useful templated pages at scale with demand, uniqueness, and indexation guardrails. |
| [`competitor-pages`](seo/competitor-pages/) | Compares ranking pages and produces a practical SERP brief. |
| [`sxo`](seo/sxo/) | Connects search visibility and SERP CTR to the post-click conversion experience. |
| [`seo-drift`](seo/seo-drift/) | Creates a baseline and detects ranking, metadata, canonical, and indexation regressions. |
| [`backlink-audit`](seo/backlink-audit/) | Reviews referring domains, anchor text, link risk, and internal-link opportunities. |
| [`setup-cms`](seo/setup-cms/) | Local Application-Password / `.env.local` setup for SEO scripts against WordPress, Strapi, Contentful, or Ghost. |

### Paid media

| Skill | What it does |
|---|---|
| [`paid-ads`](paid-ads/paid-ads/) | Routes broad paid-media questions to the right channel and workflow. |
| [`paid-ads-setup`](paid-ads/paid-ads-setup/) | Connects accounts and captures business, economics, tracking, and budget context. |
| [`paid-ads-launch`](paid-ads/paid-ads-launch/) | Produces a reviewable campaign or multi-channel experiment plan before spend begins. |
| [`paid-ads-review`](paid-ads/paid-ads-review/) | Creates comparable weekly or monthly scorecards and checks tracking health. |
| [`paid-ads-optimize`](paid-ads/paid-ads-optimize/) | Finds waste and pacing problems, then proposes narrow, reversible changes. |
| [`paid-ads-creative`](paid-ads/paid-ads-creative/) | Develops cross-channel concepts, claim ledgers, fatigue hypotheses, and test briefs. |
| [`paid-ads-x`](paid-ads/paid-ads-x/) | Audits and operates connected X Ads campaigns, line items, targeting, creative, audiences, and budgets. |
| [`paid-ads-linkedin`](paid-ads/paid-ads-linkedin/) | Audits and operates connected LinkedIn Ads around qualified pipeline outcomes. |
| [`paid-ads-reddit`](paid-ads/paid-ads-reddit/) | Audits and operates connected Reddit Ads campaigns, ad groups, ads, audiences, pixels, and budgets. |
| [`paid-ads-tiktok`](paid-ads/paid-ads-tiktok/) | Audits and operates connected TikTok Ads delivery, creative, targeting, and budgets. |
| [`paid-ads-amazon`](paid-ads/paid-ads-amazon/) | Plans and reviews Amazon Ads with margin-aware ACoS guardrails. |
| [`paid-ads-chatgpt`](paid-ads/paid-ads-chatgpt/) | Designs bounded ChatGPT Ads experiments or reviews verified exports. |
| [`paid-ads-integrations`](paid-ads/paid-ads-integrations/) | Verifies connector, account, and tool access before promising a capability. |
| [`paid-ads-guide`](paid-ads/paid-ads-guide/) | Explains installation, supported platforms, limits, and troubleshooting. |

### Google Ads

| Skill | What it does |
|---|---|
| [`google-ads-audit`](google-ads/audit/) | Scores account health, validates tracking, and finds wasted spend. |
| [`google-ads`](google-ads/manage/) | Reviews performance and manages supported keywords, bids, budgets, negatives, and campaigns. |
| [`google-ads-copy`](google-ads/copy/) | Writes compliant RSA headlines and descriptions with test variants. |
| [`google-ads-assets`](google-ads/assets/) | Plans sitelinks, callouts, snippets, image assets, and Performance Max briefs. |
| [`google-ads-landing`](google-ads/landing/) | Diagnoses keyword-to-ad-to-page relevance and landing-page quality. |

### Meta Ads

| Skill | What it does |
|---|---|
| [`meta-ads-audit`](meta-ads/audit/) | Audits tracking, structure, creative health, audiences, spend efficiency, and scaling readiness. |
| [`meta-ads`](meta-ads/manage/) | Reviews Facebook and Instagram performance and executes supported campaign operations. |
| [`meta-ads-creative`](meta-ads/creative/) | Produces evidence-based concepts, copy angles, UGC briefs, and refresh experiments. |

### Analytics

| Skill | What it does |
|---|---|
| [`google-analytics`](analytics/google-analytics/) | Analyzes live GA4 acquisition, engagement, pages, events, and conversions and safely manages supported measurement configuration. |
| [`search-console`](analytics/search-console/) | Analyzes live Search Console queries and pages, inspects URLs, and manages approved sitemap submissions. |

### WordPress

| Skill | What it does |
|---|---|
| [`wordpress`](wordpress/) | Operates connected WordPress sites: content, media, comments, design, settings, plugins, themes, and approved HTML or admin changes. |

### CRM

| Skill | What it does |
|---|---|
| [`gohighlevel`](gohighlevel/) | Operates connected GoHighLevel contacts, conversations, opportunities, calendars, and other approved CRM changes. |

### Cross-model review and maintenance

| Skill | What it does |
|---|---|
| [`gemini`](gemini/) | Uses Google Gemini for a second opinion, adversarial challenge, or open consultation. |
| [`upgrade`](notfair-upgrade-skill/) | Updates an installed NotFair plugin and summarizes what changed. |

## Live data and integrations

Some skills work entirely from a repository, URL, or supplied export. Live account analysis uses one OAuth-connected [universal NotFair MCP](https://notfair.co/api/mcp/notfair). The plugin registers exactly one server named **NotFair**, shared by every supported platform.

The agent chooses tools from the live server's instructions and capability descriptions. Skills supply marketing workflows and evidence standards without hardcoding MCP tool names or call sequences. See [the connection and upgrade guide](docs/mcp-connection.md) for manual configuration and migration from older per-platform connections. Each platform becomes available after it is connected in the NotFair workspace selected during OAuth. Follow any account setup guidance returned by the server.

| Data source | Used for | Connection |
|---|---|---|
| **Google Search Console** | Search performance, queries, pages, indexing, URL inspection, and sitemaps | One NotFair connection |
| **Google Analytics 4** | Acquisition, engagement, landing pages, events, conversions, realtime, and measurement configuration | One NotFair connection |
| **Google Ads** | Campaign performance, search terms, bids, budgets, keywords, and change history | One NotFair connection |
| **Meta Ads** | Facebook and Instagram campaigns, ad sets, creatives, and insights | One NotFair connection |
| **X Ads** | Campaigns, line items, performance, targeting, promoted posts, audiences, and approved mutations | One NotFair connection |
| **LinkedIn Ads** | Campaign groups, campaigns, creatives, analytics, targeting, conversions, and leads | One NotFair connection |
| **Reddit Ads** | Campaigns, ad groups, ads, reporting, audiences, pixels, funding instruments, and approved mutations | One NotFair connection |
| **TikTok Ads** | Advertiser delivery, reporting, creative, targeting, and approved mutations | One NotFair connection |
| **WordPress** | Connected site content, media, comments, design, settings, plugins, themes, and approved mutations | One NotFair connection |
| **GoHighLevel** | Contacts, conversations, opportunities, calendars, and approved CRM mutations | One NotFair connection |
| **Other CMS platforms** | Local SEO-script content review in Strapi, Contentful, or Ghost | `setup-cms` Application Password / API token, not NotFair MCP |
| **Google Gemini** | Cross-model review | Gemini API key |

Supported account operations come from the live connection. Changes must stay within the user's authorization and be verified against the resulting account state. Amazon and ChatGPT Ads remain planning or export-review workflows unless the current agent session exposes a verified connector. `setup-cms` is a local SEO-script credential wizard; live WordPress work uses `/notfair:wordpress`.

## Privacy and support

The plugin connects to the declared NotFair MCP endpoint through browser OAuth.
Requested tool arguments go to NotFair and results from connected providers return
to your authorized AI client. See the privacy policy for storage, retention, and
deletion details. Connect only the workspace and platform accounts you intend to use.

Optional local workflows run readable Python or shell scripts. Crawlers request
the URLs you supply; direct Search Console scripts use your explicitly authorized
Google Cloud login; CMS scripts use the site credentials you configure through
`setup-cms`. Gemini review sends the selected review context to Google's Gemini
CLI after its authentication setup. Choose these workflows explicitly, keep
credentials out of reports and commits, and use the OAuth MCP for live platform
work when it is available. There are no automatic plugin hooks or local MCP servers.
The calendar viewer serves local planning data on loopback, and the optional
update checker reads the public version file from GitHub.

The separate [NotFair Next.js blog library](https://github.com/nowork-studio/notfair-nextjs-blog)
now lives in its own public repository and is distributed through its GitHub
releases. Its source and publishing workflow are no longer bundled in this
AI-agent plugin. The retired NotFair CMO application is also no longer included.

- [Privacy Policy](https://notfair.co/privacy)
- [Terms of Service](https://notfair.co/terms)
- [Product and integration support](https://notfair.co/contact)
- [Support and community](https://discord.gg/gVJCRczpps)
- [Issue tracker](https://github.com/nowork-studio/notfair-plugin/issues)

Inside a skill, connectors use tool-agnostic placeholders such as `~~google-ads`, `~~meta-ads`, `~~x-ads`, `~~linkedin-ads`, `~~reddit-ads`, `~~tiktok-ads`, `~~search-console`, `~~google-analytics`, `~~wordpress`, and `~~gohighlevel`. The agent resolves each placeholder to a compatible tool available in the current session, so the workflow is not coupled to one MCP namespace.

## How the repository is organized

```text
notfair-plugin/
├── AGENTS.md                    # intent-to-skill resolver for AI agents
├── .claude-plugin/              # Claude Code plugin manifest
├── paid-ads/                    # cross-channel planning, review, optimization
├── google-ads/                  # audit, management, copy, assets, landing pages
├── meta-ads/                    # audit, management, creative
├── analytics/                   # Google Analytics and Search Console MCP workflows
├── wordpress/                   # live WordPress MCP operator
├── gohighlevel/                 # live GoHighLevel CRM MCP operator
├── seo/                         # SEO, GEO, content, and technical-search skills
├── gemini/                      # cross-model review
├── test/                        # unit and LLM-judge evals
└── skills/                      # shared entry points for every agent host
```

[`AGENTS.md`](AGENTS.md) is the universal entry point. It maps user intent to the canonical `SKILL.md` and documents the external dependency each workflow requires.

## Contributing

Each skill lives in its own category folder:

```text
seo/your-skill-name/
├── WORKFLOW.md       # full instructions and frontmatter
├── references/       # optional supporting knowledge
└── scripts/          # optional deterministic tooling
```

When adding or changing a skill:

1. Keep the workflow focused on one clear marketing job.
2. Use imperative, testable instructions in `WORKFLOW.md`, and keep the entry point under `skills/` in sync.
3. Add or update eval coverage.
4. Update [`AGENTS.md`](AGENTS.md), the plugin manifest, [`VERSION`](VERSION), and [`CHANGELOG.md`](CHANGELOG.md).

Open a pull request with one skill or one coherent improvement. See [plugin development](docs/plugin-development.md) for repository conventions.

## Community

- Join the [NotFair Discord](https://discord.gg/gVJCRczpps)
- [Open an issue](https://github.com/nowork-studio/notfair-plugin/issues)
- Star the repository if these workflows make your agent more useful

## License

[MIT](LICENSE)
