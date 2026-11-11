# GEO Techniques — Generative Engine Optimization Playbook

Reference for `geo-optimizer`. Derived from:

- **Princeton/GA Tech GEO** (KDD 2024, arXiv:2311.09735) — the 9 methods,
  PAWC metric, GPT-3.5 / Perplexity validation
- **AutoGEO** (CMU, ICLR 2026) — automated rewriting, GRPO training,
  utility-preserving rewrite rules
- **C-SEO Bench** (NeurIPS 2025) — competitive baseline, what survives at scale
- **CORE-EEAT / CITE** (community frameworks) — operational checklists

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [The GEO Signal Stack](#the-geo-signal-stack)
3. [Audit Scoring](#audit-scoring)
4. [Rewrite Patterns](#rewrite-patterns)
5. [Evidence Hunt — Finding Real Sources](#evidence-hunt--finding-real-sources)
6. [Per-Engine Playbooks](#per-engine-playbooks)
7. [AI Crawlability](#ai-crawlability)
8. [Anti-Patterns](#anti-patterns)
9. [Measurement](#measurement)

---

## Core Principles

### 1. PAWC drives everything

Position-Adjusted Word Count is the metric the Princeton paper proved
correlates with AI citation:

```
Imp_pwc(c, r) = Σ |sentence| · e^(-pos/total)  /  total_words
```

The exponential decay is the key: **sentence #1 of the AI's answer is
worth ~5× sentence #20.** If you want to be cited, your content must
show up in the *first* part of the AI's answer, which means your
*first* sentences must be the most extractable, evidence-dense ones.

### 2. Evidence density > keyword density

Princeton's empirical ranking of techniques by visibility lift:

| Rank | Technique | PAWC lift |
|------|-----------|-----------|
| 1 | Quotation Addition | +41% |
| 2 | Statistics Addition | +30% |
| 3 | Cite Sources | +28% |
| 3 | Fluency Optimization | +28% |
| 5 | Technical Terms | +18% |
| 6 | Easy-to-Understand | +14% |
| 7 | Authoritative tone | +10% |
| 8 | Unique Words | +6% |
| 9 | **Keyword Stuffing** | **−8%** (hurts) |

Best combo: **Fluency + Statistics** (≥+35%, beats any single technique).

### 3. Generative engines don't use PageRank

This is the democratization finding from the Princeton GEO paper
(arXiv:2311.09735, Table 2): rank-5 sites gained ~+115% visibility with
the Cite Sources method while rank-1 sites *lost* ~30%, averaged across
their multi-domain experiment. Numbers are representative of the paper's
test setup, not a universal guarantee. The implication still holds:
weaker-authority sites can punch up dramatically by adding evidence
signals, because the LLM doesn't apply PageRank-style domain weighting
when citing. **It cares whether your sentence is the most quotable one.**

### 4. Engines diverge

Cross-engine citation overlap is 0.11–0.58 (Princeton + AutoGEO data).
Optimize per-engine:

- **ChatGPT** cites Wikipedia in ~48% of top citations
- **Perplexity** cites recent web sources, weights freshness
- **Gemini** leans Reddit/Quora for opinion queries
- **Claude** weights primary sources and academic citations
- **Google AI Overviews** mirrors organic top-10 + featured snippets

### 5. Real evidence wins long-term

Princeton showed fabricated quotes worked against GPT-3.5. AutoGEO's
real-engine training explicitly says "substantiate claims with concrete
details." Engines have moved on. Build with real sources only.

---

## The GEO Signal Stack

Four pillars, weighted as in the audit scoring:

### Pillar 1 — Evidence Density (35%)

| Signal | Target | Why |
|--------|--------|-----|
| Numbers with units | Include relevant figures with dates, units, and terms | Makes price, limits, and comparisons verifiable |
| Sources | Match each material claim to the most authoritative available source | Lets readers check the claim |
| Expert quotes | Include only when they clarify a claim | Helps readers judge the evidence |
| Named entities | Use the actual product, organization, or person where relevant | Avoids ambiguity |
| First-party facts or data | Use the current source of truth for product claims or original research | Establishes which source owns the fact |

### Pillar 2 — Structure & Position (25%)

| Signal | Target |
|--------|--------|
| Direct answer in first 150 words | Required (PAWC) |
| TL;DR or Key Takeaways near top | ≥1 box |
| Heading hierarchy (H1→H2→H3) | No level skipping, single H1 |
| Comparison/spec data in tables | Required if comparison content |
| Sequential steps in numbered lists | Required if procedural |
| FAQ section with question-format H2/H3 | Optional when it answers real follow-up questions |
| Average paragraph length | 2–4 sentences |
| JSON-LD schema | Where applicable, valid markup that matches the page |

### Pillar 3 — Authority Signals (25%)

| Signal | Target |
|--------|--------|
| Author or publisher identity | Named author where relevant; first-party publisher for product and support pages |
| `author.sameAs` JSON-LD | Wikipedia, LinkedIn, ORCID, Google Scholar |
| Freshness | Recheck volatile facts; update the date only after substantive changes |
| Methodology disclosed | Sample sizes, criteria, dates |
| Limitations acknowledged | Counter-LLM-hallucination signal |
| First-party experience markers | "We tested", "Our analysis of N…" — not vague "experts say" |
| External validators | Featured in / cited by named outlets |

### Pillar 4 — AI Crawlability (15%)

| Signal | Target |
|--------|--------|
| Search crawler policy | Live robots rules allow intended target crawlers on the audited URL |
| Page delivery | Final status, redirect destination, and any edge challenges are checked |
| Raw response | Main content is accessible in raw HTML where the target crawler needs it |
| Search eligibility | Canonical and applicable index or snippet controls match the intended public URL |

---

## Audit Scoring

For each item in the signal stack, score:

- **Pass (full points)** — meets target
- **Partial (50%)** — partial implementation
- **Fail (0)** — missing or wrong direction (e.g., keyword stuffing present)
- **Unverified** — no adequate evidence. Leave it out of scored coverage.
- **Not applicable** — the check does not apply to this page or target surface.

Show coverage with each pillar. Calculate a weighted editorial score only when
all required checks have evidence. Within a pillar, use the mean of applicable
pass/partial/fail scores, then apply the pillar weight. If an entire pillar is
not applicable, show the individual findings without an overall score. The
rubric describes readiness and has no calibrated link to citation probability.

### Veto items (auto-cap at 60)

These either kill citation or expose the user to liability:

1. **Self-contradictory data** — internal inconsistency on the page
2. **Title-content intent mismatch** — clickbait
3. **No identifiable author** — anonymous content rarely gets cited as primary source
4. **Unintended target search crawler block** confirmed in live robots rules or
   verified CDN/WAF events. Training opt-outs and intentional exclusions never
   trigger this veto.
5. **Fabricated citations or stats** detected — hard fail, not a cap
6. **YMYL content without disclaimers** — health/finance/legal without appropriate warnings

### GEO Score interpretation

- **80–100** — most applicable readiness checks pass
- **60–79** — solid foundation, missing 1–3 high-leverage signals
- **40–59** — structural fixes needed before per-engine work pays off
- **0–39** — many applicable readiness checks need work

---

## Rewrite Patterns

Apply in this priority order. Stop when the content is at quality bar; not
every page needs every pattern.

### Pattern 1 — Front-Load the Answer

**Before:**
> "In today's rapidly evolving digital landscape, businesses are constantly
> seeking ways to optimize their online presence. This article will explore
> the various strategies and considerations involved in [topic]."

**After (template — replace bracketed values with real, verified data
before publishing):**
> "[Topic]'s ROI averages [REAL_NUMBER]× ([REAL_SOURCE_WITH_URL], [YEAR])
> when implemented with [specific approach]. Three steps drive that lift:
> [step 1], [step 2], [step 3]. Below: how to implement each in 2 weeks."

The first sentence carries: a specific number, a unit, a real-source
citation, a year, and a concrete preview. PAWC will weigh this sentence
~5× any conclusion paragraph. **Do not ship the template values** — every
bracketed value must be replaced with a real, verifiable fact before this
content goes live. Run the Evidence Hunt section below to source them.

### Pattern 2 — Statistics Addition (real)

**Before:**
> "Many companies struggle with onboarding."

**After (template):**
> "[REAL_PERCENT]% of [defined population] report [specific finding]
> ([REAL_SOURCE_NAME_WITH_URL], [year], n=[real sample size])."

Rule: every claim that can be quantified, must be. Hunt for the real stat
before falling back to vague language. If the stat doesn't exist publicly,
follow the "What to do when the stat doesn't exist" section below — never
keep the claim as a vague unsourced statement.

### Pattern 3 — Quotation Addition (real)

**Before:**
> "Experts agree that retention is more cost-effective than acquisition."

**After (template):**
> "'[Verbatim quote from a real, named person],' [wrote/said]
> [Real Name] in *[Real Publication Title]* ([Publisher], [Year]),
> [one-line context establishing why this person is authoritative]."

A real working example for the retention claim above: Frederick Reichheld
& Earl Sasser's "Zero Defections: Quality Comes to Services" (Harvard
Business Review, Sep–Oct 1990) is the canonical retention-economics
citation. Verify the quote and URL before publishing.

Rule: cite a real person at a real org with a real publication. If you
can't find one for the claim, the claim probably isn't load-bearing.

### Pattern 4 — Citation Addition (real)

**Before:**
> "Search behavior has shifted toward AI assistants."

**After (template):**
> "[Specific stat]% of [defined activity] now [specific behavior]
> ([Real Research Firm], [Month Year], [URL]) versus [historical stat]
> in [comparison year], with [observed pattern]."

Rule: ≥1 citation per 500 words, ≥3 source types per article. Source types
include: peer-reviewed papers, government data, industry research firms,
named publications, primary first-party data. Every citation must include
a URL the reader can click — citations without verifiable URLs do not
count toward the density target and trigger the fabrication veto.

### Pattern 5 — Fluency Optimization

The +28% lift from this method requires no new facts. It's just rewriting
for flow. Apply it last, after you've added evidence.

Rules:
- One idea per paragraph
- Sentence variety: alternate short/medium/long
- Active voice by default
- Cut every word that doesn't earn its place
- Read aloud test — if you stumble, rewrite

### Pattern 6 — Schema Markup

Minimum for any article-style content:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[H1]",
  "author": {
    "@type": "Person",
    "name": "[Real name]",
    "url": "[Author page URL]",
    "sameAs": [
      "https://en.wikipedia.org/wiki/[Author]",
      "https://www.linkedin.com/in/[handle]",
      "https://orcid.org/[id]"
    ]
  },
  "datePublished": "[ISO date]",
  "dateModified": "[ISO date]",
  "publisher": {
    "@type": "Organization",
    "name": "[Org]",
    "logo": {"@type": "ImageObject", "url": "[Logo URL]"}
  },
  "mainEntityOfPage": "[Canonical URL]"
}
```

Follow the [schema decision tree](../../schema-markup-generator/references/schema-decision-tree.md)
for optional semantic markup, applicable Google features, and validation.

---

## Evidence Hunt — Finding Real Sources

Before any rewrite, build a source list. Tools in priority order:

1. **WebSearch** — for recent stats and named studies
2. **WebFetch on primary source pages** — verify the stat exists at the URL
3. **Google Scholar** (`scholar.google.com/scholar?q=...`) — academic
4. **Government data portals** — `data.gov`, `bls.gov`, `eurostat.ec.europa.eu`,
   `data.gov.uk`
5. **Named research firms** — Pew, Forrester, McKinsey, Gartner, Statista
   (cite the firm + publication date + report name)
6. **Primary publications** — NYT, FT, WSJ, The Economist, trade press
   relevant to the topic
7. **First-party data from the user** — ask: "Do you have any internal data
   that supports this claim?" Original first-party data is the strongest
   GEO signal.

### Verification rules

- **Every stat must trace to a URL you've actually fetched**
- **Every quote must come from a real publication you can cite by name**
- **Every named expert must be a real person at a real org**
- If you can't verify, reframe the claim or remove it

### What to do when the stat doesn't exist

If you genuinely can't find a real source for a claim, in order of preference:

1. **Anchor to a related, verifiable stat** — "the broader [parent category]
   grew 12% in 2024 (Source, URL)" with a real source for the parent number.
   This is acceptable because the citation is real and the relationship is
   stated honestly.
2. **Run an internal analysis** — if the user has data, use it. First-party
   data is the strongest GEO signal anyway.
3. **Drop the claim** — if it's not load-bearing, cut it.

**Do not** keep the claim as a vague directional statement ("growing
rapidly", "increasingly common", "many companies"). That violates the
vague-entity anti-pattern below — vague unsourced statements are still
fabrication-adjacent and dilute the page's evidence density.

Never invent. Not "according to a 2024 study", not "experts estimate", not
"surveys show". Real source with URL, or no claim.

---

## Per-Engine Playbooks

Cross-engine citation overlap is 0.11–0.58. Tailor the strategy.

### ChatGPT (OpenAI)

**Citation pattern:** Wikipedia ~48% of top citations; reputable publications;
moderate freshness preference.

**Optimization moves:**
- Build/maintain a Wikipedia presence for the entity (brand, person, product)
- Get listed in Wikidata with structured properties
- Earn coverage in citations Wikipedia accepts (NYT, FT, BBC, Reuters,
  industry trade press)
- Strong author-as-entity signaling (`sameAs` to Wikipedia)
- Comprehensive reference articles outrank thin "answer" pages

### Perplexity

**Citation pattern:** Heavy on recent web; cites primary sources directly;
fewer "synthesis" citations.

**Optimization moves:**
- Recency matters most — pages updated within 90 days outperform
- Original first-party data gets cited disproportionately
- Clear thesis sentences in the first paragraph
- Industry blog content with named author + date stamps
- Tracking: Perplexity Sonar API exposes which URLs were cited
  (gego repo automates this); use it to verify

### Gemini (Google)

**Citation pattern:** Reddit / Quora prominent for opinion / advice queries;
Google search index parity.

**Optimization moves:**
- Reddit presence: maintain authoritative subreddit comments under named
  account; AMA-style threads
- Quora answers from credentialed account
- Strong on-page Google SEO — Gemini citations correlate with organic
  top-10
- Google AI Overviews specifically: structured data + featured-snippet
  format wins

### Claude (Anthropic)

**Citation pattern:** Primary sources, academic citations, well-structured
explanatory content.

**Optimization moves:**
- Long-form, well-cited articles outperform short-form
- Named author with verifiable credentials in `author.sameAs`
- Citations to peer-reviewed sources where applicable
- Limitations and methodology disclosed (counter-hallucination signaling)
- Avoid marketing language — Claude weights informational tone heavily

### Google AI Overviews

**Optimization moves:**
- Provide a clear answer and original evidence where relevant.
- Check Googlebot access, indexing, snippet eligibility, and any applicable
  Search Console inclusion controls. Follow [Google's AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

### Cross-engine moves (do these first)

- Author entities with strong `sameAs` linkage
- Original data publications quarterly
- Wikipedia / Wikidata presence for the brand
- Reddit + Stack Overflow + relevant community presence

---

## AI Crawlability

### Crawler roles and site policy

| Target surface | Search crawler or control | Other roles to report separately |
|----------------|---------------------------|----------------------------------|
| ChatGPT Search | `OAI-SearchBot` | `GPTBot` is for model training. `ChatGPT-User` is a user-triggered fetcher. [OpenAI](https://developers.openai.com/api/docs/bots) |
| Claude search | `Claude-SearchBot` | `ClaudeBot` is for model training. `Claude-User` is a user-triggered fetcher. [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Perplexity search | `PerplexityBot` | `Perplexity-User` is a user-triggered fetcher. [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Bing and Copilot search visibility | `bingbot` and applicable Bing indexing and snippet controls | [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a) |
| Google AI features in Search | `Googlebot`, snippet eligibility, and applicable Search Console controls | `Google-Extended` manages both Gemini training and grounding in specified Gemini products. It does not govern inclusion in AI Overviews or AI Mode in Google Search. [Crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) · [Search generative AI controls](https://support.google.com/webmasters/answer/16908024) |

Confirm the intended surfaces and preserve training preferences. Flag verified
search crawler blocks only for pages meant to be accessible on that surface.
Explain Gemini grounding implications separately if `Google-Extended` is blocked.
User-triggered fetchers have provider-specific rules. Use the operator's current
documentation when checking them.

### Live evidence

1. Fetch the page and live `/robots.txt` for the relevant origin, including the
   final origin after redirects. Record time, response status, redirect chain,
   and the crawler group and rule applicable to the exact path. Evaluate
   specific and wildcard rules using the provider's documented behavior.
   Record unavailable or ambiguous evidence and distinguish it from a confirmed
   allow or block. Inspect any [CDN-managed robots rules](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).
2. Inspect the raw HTML for the main content and check canonical, meta robots,
   and `X-Robots-Tag` values where relevant. Record a status, redirect, challenge,
   or unexpected body separately from the robots policy. Treat a user-agent
   probe as diagnostic only, even if it returns HTTP 200 or 403.
3. If authorized logs or CDN/WAF events are available, verify actual requests
   using the provider's published verification method where available or the
   CDN's verified crawler identity. Record the URL, date, identity evidence,
   and response or action. Without that evidence, mark actual edge access as
   unverified. A successful crawl does not establish indexing or citation.

Report each URL and target surface with its robots policy, HTTP evidence,
verified edge outcome if available, and recommended action. Keep this check
read-only and follow the shared safety guidance for any proposed policy edits.

### Optional: llms.txt

Optional when an identified consumer uses it. Exclude it from GEO readiness
scoring. Google Search ignores it for visibility and ranking. A file can follow
this structure when relevant:

```
# Site Name

> One-paragraph description of the site, what it does, who it's for.

## Core content

- [Page Title](URL): One-line summary
- [Page Title](URL): One-line summary

## About

- [About](URL)
- [Contact](URL)

## Optional

- [Old content](URL): Archive
```

---

## Anti-Patterns

These either don't work or actively hurt:

### Hard fails (will cause penalties or removal)

- **Fabricated citations / quotes / stats** — see Step 5 of SKILL.md
- **Hidden text optimization** — old SEO trick; AI engines detect and demote
- **Doorway pages** — single-purpose pages targeting near-duplicate queries
- **AI-generated mass content with no human review** — both Google and
  AI engines now penalize
- **PBN backlink networks** — CITE framework veto item

### Soft fails (waste of effort)

- **Keyword stuffing** — Princeton: −8% PAWC. Stop.
- **Generic AI-language intros** — "In today's rapidly evolving landscape…"
  Cut.
- **Vague entities** — "a leading company", "experts say", "studies show".
  Specify or remove.
- **Unsupported superlatives** — "the best", "the most comprehensive".
  Either back with data or cut.
- **Filler paragraphs** — every paragraph must earn its place
- **Redundant H2s covering the same subtopic** — cannibalizes extraction

---

## Measurement

### Build and repeat a buyer-question baseline

1. **Choose the questions.** Start with a manageable set of recurring buyer
   questions from supplied sales, support, reviews, or search evidence. Cover
   discovery, comparisons, and purchase decisions. Give each question a stable
   ID and record its source and intent. Mark invented examples as proposed
   questions. Keep branded fact checks separate from unbranded discovery and
   comparison prompts so branded prompts do not inflate discovery rates.
2. **Capture independent answers.** Use the actual named search surfaces where
   available, such as ChatGPT Search, Claude with web search, Perplexity, or
   Gemini. Target at least two independent runs per question and surface for a
   repeatable baseline. Start a fresh session each time and use signed-out or
   non-personalized settings where supported. Keep the exact wording, market,
   locale, and surface or mode stable. Record date, settings and visible model
   version, including any sign-in or personalization you could not control.
   Use supplied answers or tracker exports with their recorded provenance.
   A generic web search or the agent's own answer is not evidence from another
   engine. Mark inaccessible surfaces and incomplete runs explicitly.
3. **Keep one record per attempt.** Capture the answer or evidence reference,
   and record each outcome independently. Use yes, no, or unknown for brand
   mention, recommendation, and first-party citation. A recommendation requires
   a suggestion that the buyer consider or choose the brand. A first-party
   citation requires a visible source URL on a verified brand domain. Preserve
   the exact cited URLs, including third-party sources where available.

4. **Compare like-for-like runs.** Report counts and evaluable denominators by
   surface and question group for mentions, recommendations, and first-party
   citations. Unknown and failed outcomes are excluded from the relevant
   denominator and shown as missing coverage. Report counts for small samples.
   Compare the same question IDs and conditions, and disclose any changes in
   coverage. Keep an unobserved outcome distinct from an observed zero. Record
   the sample dates and agree on a rerun interval appropriate to the use case.

| Question ID and exact text | Surface and mode | Run date and settings | Status and evidence | Brand mentioned | Brand recommended | First-party URL cited | All cited URLs | Fact discrepancy |
|----------------------------|------------------|-----------------------|---------------------|-----------------|-------------------|----------------------|----------------|------------------|
| [ID and prompt] | [surface] | [timestamp, locale, session and visible model] | [completed, failed, or unrun and evidence] | [yes/no/unknown] | [yes/no/unknown] | [yes/no/unknown] | [exact URLs or unknown] | [claim ID, none observed, or unknown] |

### Check brand facts

Build a dated list of facts from official pricing, plan, platform, and product
pages or verified user-supplied material. Record the expected value, applicable
market or plan, primary source, and date checked. For each discrepancy, quote
the relevant claim, identify the answer and any citation that actually supports
it, and label the origin unknown when the answer gives no traceable source.
Recommend a correction at the verified outdated source or a clearer first-party
reference. Rerun affected prompts in at least two comparable follow-up samples
before calling a correction durable. Report unresolved claims and coverage gaps.

### Read supplied provider reports

- [Bing Webmaster Tools AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
  reports citation counts, cited pages, and sampled grounding queries across
  supported Microsoft and partner surfaces. Preserve the supplied scope and date
  range. Its counts do not identify recommendations or measure all engines.
- [Search Console Generative AI performance (Search)](https://support.google.com/webmasters/answer/16984139)
  reports impressions from covered Google Search generative AI features.
  Preserve the property, report, date range, and dimensions. Keep Discover
  reports distinct. Standard web search impressions cannot substitute for the
  dedicated report. Do not infer click counts or brand recommendations from
  impression-only evidence.
- Accept supplied exports, screenshots, or tracker data and use a live
  capability only if its current description verifies access to that specific
  report. Keep provider figures, prompt samples, and any supplied referral or
  conversion data in their own units. Do not sum them into a visibility rate.

---

## Quick reference: Do / Don't

### Do
- Front-load the answer in first 150 words
- Add real stats with units, sources, dates
- Use quotes and citations when they clarify or substantiate a claim
- Recheck volatile facts when they can change; never change dates as a visibility tactic
- Verify intended search crawler access in live robots rules and at the edge
- Use markup that fits the content and the applicable feature
- Build Wikipedia / Wikidata / Reddit presence
- Compare citations and recommendations across the sampled surfaces
- Publish original first-party data quarterly

### Don't
- Fabricate stats, quotes, citations, or expert names
- Keyword-stuff
- Use vague entities ("experts say", "studies show")
- Treat intentional training opt-outs as search crawl failures
- Ship JS-only content without SSR/SSG
- Treat GEO as identical to SEO (different signals, different weights)
- Optimize for one engine and assume the others follow
- Invent an author, profile link, or verification date to satisfy the rubric
