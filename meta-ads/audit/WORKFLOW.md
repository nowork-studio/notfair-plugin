---
name: meta-ads-audit
description: Meta Ads (Facebook + Instagram) account audit and business context setup. Use for account-health audits and business-context setup. Trigger on "audit my Meta ads", "audit my Facebook ads", "Meta ads audit", "set up my Meta ads", "onboard Meta", "Meta account overview", "how's my Meta account", "Meta health check", "what should I fix in my Facebook ads", or when the user is new to NotFair Meta and hasn't run an audit before.
argument-hint: "<account name or 'audit my Meta ads'>"
---

# Meta Ads Audit

Diagnose Meta (Facebook + Instagram) account health and persist business context for downstream skills (`/meta-ads`). **Read-only** — never mutates the account. The user runs `/meta-ads` to execute fixes you recommend.

## Setup

Follow `../shared/preamble.md` — MCP detection, OAuth, ad account selection.

## Filesystem contract (MUST persist)

| Artifact | Path | When |
|---|---|---|
| Business context | `{data_dir}/meta/business-context.json` | First full audit, or refresh when `audit_date` is >90 days old. Skip on scoped audits if file is fresh. |
| Personas | `{data_dir}/meta/personas/{accountId}.json` | Every full audit. |

These are the handoff to `/meta-ads` — write them even if the report itself is short. Otherwise downstream skills operate without business context and produce generic output.

If a `{data_dir}/business-context.json` exists from `/google-ads-audit` (no `meta/` subdir), read it as a starting point — most fields (services, brand voice, differentiators, locations, seasonality) are platform-agnostic. Then write the Meta-specific version to `{data_dir}/meta/business-context.json` with any Meta-specific overrides (different creative angles, different audiences, different funnel events).

**business-context.json schema (shared with Google Ads where fields apply):**
`business_name, industry, website, services[], locations[], target_audience, brand_voice{tone, words_to_use[], words_to_avoid[]}, differentiators[], competitors[], seasonality{peak_months[], slow_months[], seasonal_hooks[]}, social_proof[], offers_or_promotions[], landing_pages{}, unit_economics{aov_usd, profit_margin, ltv_usd, source}, notes, audit_date, account_id`.

**Meta-specific extensions:**
`meta_funnel_events{top_of_funnel, mid_of_funnel, conversion}, creative_inventory{concepts[], formats[], aspect_ratios[]}, custom_audiences{purchasers, abandoners, engagers, list_uploads[]}, pixel_health{pixel_id, capi_enabled, emq_score, last_event_at}`.

**personas JSON schema:** `{account_id, saved_at, personas: [{name, demographics, primary_goal, pain_points[], decision_trigger, value, meta_creative_angles[], visual_cues[]}]}`. The Meta version adds `meta_creative_angles` (e.g. "before/after demonstration", "founder-led explainer", "UGC review") and `visual_cues` (objects, settings, emotions that resonate with this persona). See `references/persona-discovery.md`.

## Policy freshness check (run first)

Read `../shared/policy-registry.json`. For each entry where `last_verified + stale_after_days < today`:
- **High-volatility** → WebSearch the `area` for recent Meta Ads changes; compare to `assumption`. If drift, banner the report and suggest registry update.
- **Moderate-volatility** → one-line "may warrant a check" note.
- **Stable** → skip silently.

The Meta platform changes faster than Google Ads (Advantage+, attribution, learning behaviors) — check high-volatility entries every audit.

## Phase 1 — Pull the audit dataset

Choose available read capabilities for the requested audit scope. Batch related reads where useful and supported; the rubric below describes evidence to consider, not a fixed call sequence.

A complete audit needs at minimum:

- **Ad account info** (`/{accountId}`) — currency, timezone, business id, spend cap, account status, balance.
- **Pixel health** (`/{accountId}/customconversions` + `/{accountId}/adspixels`) — pixel id, last activity, CAPI status, Event Match Quality (EMQ) score.
- **Campaigns** (`/{accountId}/campaigns`) — id, name, objective, status, daily/lifetime budget, special_ad_categories, buying_type, bid_strategy, created_time. Last 90 days.
- **Ad sets** (`/{accountId}/adsets`) — id, name, status, campaign_id, optimization_goal, billing_event, bid_strategy, daily_budget, lifetime_budget, attribution_spec, targeting (summary), promoted_object, learning_stage_info.
- **Ads** (`/{accountId}/ads`) — id, name, status, ad set, creative summary (image/video, primary text, headline, description, CTA), effective_status.
- **Insights at campaign level** — spend, impressions, reach, frequency, cpm, link CTR, link clicks, purchases (or other primary action), purchase value, ROAS, CPA.
- **Insights at ad set level** — same fields, last 30 days.
- **Insights at ad level** — top 50 ads by spend; same fields plus video metrics (3-sec views, ThruPlays) for video creatives.
- **Insights with breakdowns** — placement (`publisher_platform,platform_position`), age/gender, device. Use these to spot placement losers and audience composition.
- **Recent edit activity** — when available via `/{adsetId}` last_modified or `/{adsetId}` change history.

Compute aggregates **in the script**, return summarized JSON. Don't return all rows — rank, slice, summarize. The agent narrates the result; the script does the math.

Use available platform recommendations as an optional cross-check when they would help the analysis.

If a read fails, follow actionable recovery guidance. Clearly report missing evidence; continue independent findings only when the available data supports them.

**Skip scoring entirely if** `totalSpend == 0` or `activeCampaigns == 0`. Go straight to business context.

## Phase 2 — Scope handling

If the user narrows the audit ("focus on one campaign", "campaign X", "just check creative fatigue"):

- Match campaign names by case-insensitive substring. If no match, list available campaigns and ask.
- Filter the in-memory dataset before scoring — no extra API calls.
- Account-level dimensions (Pixel health, attribution defaults) stay account-wide. Note "Scoped to: X" in the report.
- Skip Phase 4 (business context refresh) on scoped audits if `business-context.json` is fresh.

## Phase 3 — Score

Score each of the 7 dimensions 0–5 using `references/account-health-scoring.md`. Overall = `round(sum × 100 / 35)`.

| Score | Label | Meaning |
|---|---|---|
| 0 | Critical | Broken or missing — actively losing money |
| 1 | Poor | Major waste or missed opportunity |
| 2 | Needs Work | Several clear issues |
| 3 | Acceptable | Functional, room to improve |
| 4 | Good | Well-managed, minor opportunities |
| 5 | Excellent | Best-practice |

Scope-aware: campaign-level dimensions reflect in-scope data; account-level dimensions (Pixel + CAPI, attribution setup) score account-wide with a note on scope impact.

### Encoded heuristics — apply these, they aren't obvious

- **Pixel + CAPI is upstream of everything.** EMQ < 7.0 means Meta can't match events well — Smart Bidding starves regardless of how good the creative is. STOP-condition input.
- **Reported ROAS systematically overstates true ROAS.** Cross-check Meta-reported numbers against Shopify / GA4 / MMM where possible. The gap is the modeled-conversion premium and is typically 20–40% in ecom.
- **Frequency × CPM trend = creative diagnosis.** Frequency > 3.0 with CPM rising ≥ 30% w/w is fatigue — recommend creative refresh, not budget cuts.
- **One ad set carrying > 70% of a campaign is fragility, not concentration.** When it fatigues, the campaign collapses.
- **Audience overlap > 50% between sibling ad sets fragments signal.** Consolidate; don't try to "fix" with bid caps.
- **Special Ad Category misclassification is a takedown risk, not just a policy nit.** Surface as Critical regardless of current performance.
- **Manual placements without evidence is a sign of inherited-from-2018 thinking.** Default should be Advantage+ Placements; deviations need data.

### Pixel + Tracking Diagnosis Matrix

| | EMQ < 5 | EMQ 5–6.9 | EMQ 7.0+ |
|---|---|---|---|
| **CAPI off** | Critical — flying blind | Critical — most events lost | High — leaving 15–25% of events on the table |
| **CAPI on, dedup off** | Critical — duplicated and weak signal | High — duplicate counting risk | Medium — match quality improves with dedup |
| **CAPI on, dedup on** | High — match quality is the bottleneck | Medium — improve event_id coverage | Healthy |

## Phase 4 — Business context

Derive what you can from the data already pulled:

| Field | Source |
|---|---|
| `business_name` | Ad account name (`/{accountId}` `name` field) |
| `services` | Top campaigns by spend, ad set names, top-converting ad creatives |
| `locations` | Targeting geo summary (countries / regions in active ad sets) |
| `brand_voice` | Top-performing ad copy (primary text + headline) |
| `creative_inventory.formats` | Mix of image / video / carousel observed in active ads |
| `creative_inventory.aspect_ratios` | Aspect ratios across active ads (1:1, 4:5, 9:16) |
| `meta_funnel_events.conversion` | Most common optimization event on top-spending ad sets |
| `custom_audiences` | Custom audiences referenced in active ad set targeting |
| `pixel_health` | From the Pixel detail call |
| `website` | Apex domain from active ad final URLs |

Then crawl the website (homepage + about + 1–2 top landing pages, parallel `WebFetch`) and merge into the schema. See `references/business-context.md` for the full crawl procedure.

Always ask the user: differentiators, competitors, seasonality, **AOV + profit margin** (essential for ROAS-aware scoring). Ask for everything else only if data + crawl can't answer it.

## Phase 5 — Personas

Discover 2–3 personas from creative performance (which angles convert), top-spending audiences, and landing-page content — all from the dataset already in memory. Persist to `{data_dir}/meta/personas/{accountId}.json`. Each persona must be grounded in **observable evidence** (a converting ad set, a converting creative angle, a landing-page section) — no inventing. See `references/persona-discovery.md`.

## Phase 6 — Report

Lead with the verdict, then the top 3 actions (with dollar impact when possible), then the scorecard, then evidence for dimensions scoring 0–2 only. Cite specific campaigns, ad sets, ads, and dollar amounts. Cap at ~80 lines.

State where any audit artifacts were actually saved. Do not claim hosted audit history unless a live result confirms it.

## Guardrails

1. **Read-only skill.** Diagnose; don't mutate. Every fix routes through `/meta-ads`. End the report with one handoff tied to the #1 action.
2. **STOP condition** — if Pixel health scores 0–1 (EMQ < 5 or CAPI off in an ecom account), recommend pausing scaling decisions until tracking is fixed before recommending anything else. Everything downstream is unreliable.
3. **Always persist** `meta/business-context.json` and `meta/personas/{accountId}.json` even if the report itself is short — downstream skills depend on them.
4. **Name names.** Every finding cites specific campaigns, ad sets, ad creatives, and dollar amounts. "Some ad sets are underperforming" is not a finding.
5. **Never report Meta-reported ROAS without footnoting the modeled-conversion premium.** "ROAS 3.2× (Meta-reported, 7DC1DV — typically overstates Shopify-attributed ROAS by 20–40%)" is honest. "ROAS 3.2×" is misleading.
