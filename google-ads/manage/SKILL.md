---
name: google-ads
description: Manage Google Ads — performance, keywords, bids, budgets, negatives, campaigns, ads, search terms, QS, location targeting, bulk operations, experiments, asset management, portfolio bidding, offline conversions. Use for any mention of Google Ads, CPA, ROAS, ad spend, or campaign settings.
argument-hint: "<campaign name, keyword, or 'show performance'>"
triggers:
  - google ads
  - campaigns
  - keywords
  - ad spend
  - CPA
  - ROAS
  - search terms
  - negative keywords
  - bid
  - budget
  - pause campaign
  - ads performance
  - location targeting
  - geo targeting
  - campaign settings
  - rename campaign
  - rename ad group
  - bulk keywords
  - check my changes
  - did my changes work
  - review my changes
  - how are my changes doing
  - change impact
  - experiment
  - bidding strategy
  - performance max
  - shopping campaign
  - sitelink
  - callout
  - structured snippet
---

# Google Ads — Operate, Diagnose, Optimize

You are an expert paid-search practitioner. The MCP server gives you primitives; this skill is the operating contract for using them well.

## Setup

Read and follow `../shared/preamble.md` — handles MCP detection, account selection, and config. Once cached, this is instant.

Then read `../shared/analysis-principles.md` — the universal evidence requirement and guardrails that govern every action below. Treat them as non-negotiable.

## How to work

You decide tool sequencing, GAQL shape, and analytical depth — your judgment is the right tool for that. The references in this directory are domain-knowledge calibration, not mandatory checklists. Pull them when an anchor would sharpen a recommendation; skip them when the data already tells the story.

What does have to be true on every turn:

- Read enough live evidence to support the recommendation; choose tools and query shape from the current connection.
- For any material recommendation, follow `references/decision-quality.md`: reconcile metric definitions and maturity, separate fact from inference, and give an explicit decision rule.
- When the evidence has multiple denominators, partial extracts, duplicate rows, unresolved outcomes, lagged cohorts, or a business target, read `references/decision-math.md` and compute the decision-changing values before choosing an action.
- For multi-table decisions, completeness of the compact evidence ledger takes priority over brevity. Remove repeated prose, not calculations, denominators, or numerical decision thresholds.
- Confirm the target and current state before a change, stay within the user's authorization, and verify the result.
- Consult the live schema when unfamiliar with a capability. Do not assume defaults, fixed limits, or rollback support.
- Record material changes and any operation identifiers actually returned. Use `references/change-tracking.md` when a change merits a later impact review.
- Show account currency, dates, and denominators alongside material numbers.

## Reference library

These live alongside this skill. Read on demand — not preemptively.

| Question on the table | Reference |
|---|---|
| Performance triage, waste detection, ranking | `references/analysis-heuristics.md` |
| Evidence reconciliation, decision rules, experiments, causal claims | `references/decision-quality.md` |
| Multi-source math, coverage, deduplication, bounds, maturity, target gaps | `references/decision-math.md` + `../shared/ppc-math.md` |
| Quality Score component diagnosis | `references/quality-score-framework.md` |
| Bid-strategy choice or migration | `references/bid-strategy-decision-tree.md` |
| Industry benchmarks / seasonality lens | `references/industry-benchmarks.md` |
| Daily operator briefs, pacing alerts, approval queues | `references/daily-ads-operator.md` |
| Search-term mining, negatives, n-gram analysis | `references/search-term-analysis-guide.md` + `references/search-term-triage.md` |
| Safe write execution and MCP mutation verification | `references/safe-executor.md` |
| Intervention memory and 3/7/14-day impact reviews | `references/intervention-memory.md` |
| Client-facing ads updates | `references/client-reporter.md` |
| Recurring optimization loops: daily checks, n-grams, budget/rank, broad match, tracking gates | `references/repeatable-optimization-loops.md` |
| Restructuring, ad-group bloat, naming | `references/campaign-structure-guide.md` |
| Reviewing prior changes for impact | `references/session-checks.md` + `references/change-tracking.md` |
| Local lead-gen accounts (service businesses) | `../shared/local-leadgen-playbook.md` |
| SaaS / B2B product-led acquisition | `../shared/saas-b2b-playbook.md` |

For business context (services, brand voice, personas, unit economics), read `{data_dir}/business-context.json` and `{data_dir}/personas/{accountId}.json`. If they're missing or older than 90 days, suggest `/google-ads-audit` before producing recommendations that lean on context.

## Account baseline

Maintain `{data_dir}/account-baseline.json` for cross-session anomaly detection. Update at the **end** of any session where you pulled rolling-window campaign metrics — the data is already in your context, no extra API call.

```json
{
  "accountId": "<from config>",
  "lastUpdated": "<ISO 8601>",
  "campaigns": {
    "<campaignId>": {
      "name": "<campaign name>",
      "rolling30d": { "avgDailySpend": 0, "totalConversions": 0, "avgCpa": 0, "avgCtr": 0, "avgConvRate": 0, "totalSpend": 0 },
      "recent7d": { "spend": 0, "conversions": 0, "cpa": 0, "ctr": 0, "clicks": 0, "impressions": 0 },
      "snapshotDate": "<ISO 8601>"
    }
  }
}
```

Update formula: `rolling30d = (0.7 × previous_rolling30d) + (0.3 × recent7d × (30/7))`. New campaigns: initialize `rolling30d` from `recent7d` directly. Cap at 50 campaigns (spend > $0 in last 30 days) so the file stays small.

When the baseline is older than 24h, see `references/session-checks.md` for the anomaly comparison.

## Conditional handoffs

After analysis, proactively offer the next skill when the data clearly points there:

- **CTR persistently below benchmark across 2+ ad groups** → `/google-ads-copy`
- **High CTR, low CVR across multiple ad groups** → `/google-ads-landing` (the page is the bottleneck, not the ad)
- **No business context, or context >90 days old** → `/google-ads-audit` first
- **Repeated, economically valuable search terms not yet keywords** → consider adding them through a currently supported capability after checking intent, coverage, and whether a dedicated keyword would improve control
- **Impression-share decline tied to new competitor pressure** → pull `auction_insight_*` resources via GAQL
- **Significant structural / bidding change considered** → consider a controlled experiment and verify what the live connection supports

## Recurring optimization posture

When the user asks for an ongoing/repeatable improvement pattern — "check today's keywords", "what should we do next", "keep improving this campaign", "clean up wasted spend", "should we scale?" — start with `references/daily-ads-operator.md`, then pull the narrowest supporting reference. The default posture is:

1. **Measure signal first** — conversion tracking, goal settings, recent changes, budget pacing, and pending intervention reviews.
2. **Classify the bottleneck** — query quality, rank, budget, demand, ad message, landing page, or tracking.
3. **Apply the right archetype** — local lead-gen accounts use `../shared/local-leadgen-playbook.md`; SaaS/B2B product-led accounts use `../shared/saas-b2b-playbook.md`.
4. **Triage search terms before scaling** — use `references/search-term-triage.md` to separate negatives, keyword candidates, routing issues, ad/LP mismatch, winners, and watch items.
5. **Propose the smallest reversible action** — usually a negative, exact keyword promotion, ad/LP message fix, or experiment; not a budget increase by reflex.
6. **Execute only through the safe executor pattern** — use `references/safe-executor.md`; approval and live read-back verification are mandatory.
7. **Record the intervention** — use `references/intervention-memory.md` so 3/7/14-day reviews can decide keep/revert/iterate.
8. **Report thin data honestly** — for small accounts, a watch note is often more correct than a mutation.
