# Analysis Heuristics

This file is calibration data and guardrails. It is **not** a step-by-step checklist — your judgment decides how to apply what's here. Whatever you recommend has to be backed by data from this account (per `../../shared/analysis-principles.md`).

## Framing — margin-aware vs. account-average

Before reasoning about "good" or "bad" performance, check `{data_dir}/business-context.json.unit_economics`:

- **If verified contribution economics exist** — frame performance against the business's target or break-even CPA/ROAS. Read `../../shared/ppc-math.md` for the formulas. Treat impression share as diagnostic context, not proof that more budget will be profitable. If economics are inferred from a template, label them as estimates and do not authorize a write from them.
- **Otherwise** — fall back to account-average comparisons. Pick one framing and stay consistent within a report.

Industry calibration lives in `../../shared/industry-templates.json` (read once per audit, cache in memory). Use `business-context.json.industry_template_key` to select the template; otherwise use the account-average fallback.

## Guardrail: keyword tier classification (do not skip)

Before evaluating any keyword's performance, classify it. This prevents pausing core business keywords during a short run of poor metrics — the most common AI-agent failure mode.

| Tier | Definition | Implication |
|------|-----------|-------------|
| **Tier 1 (Core)** | Keyword directly describes what the business sells | **Never pause on short-window data.** Diagnose root cause and optimize. |
| **Tier 2 (Adjacent)** | Related to the business but not a primary service | Evaluate after the evidence-sufficiency check below. |
| **Tier 3 (Irrelevant)** | Wrong intent, wrong service, unrelated | Aggressive negativization is appropriate. |

Classification signals (without business context): campaign name, ad group name, ad headlines, landing page URL. Matches 2+ signals = Tier 1. Matches 1 = Tier 2. Matches none = Tier 3. With business context, services and high-intent terms in `business-context.json` are the authoritative signal.

When a Tier 1 keyword underperforms, the diagnosis sequence is roughly: measurement and maturity → business value → sibling and search-term comparison → match-type / query hygiene → ad and landing-page match → Quality Score component and impression-share context. Do not remove it solely from a short-window zero, but do not protect a mature, demonstrably uneconomic keyword forever.

## Guardrail: evidence sufficiency

Before a conversion-based decision (pause, bid down, "non-converter" label), check:

1. Is the named conversion action trustworthy and appropriate to the business outcome?
2. Are the date window and comparison complete after conversion lag?
3. Is the baseline comparable by intent, geography, device, network, and campaign role?
4. How large is the spend exposure relative to the target CPA or other business guardrail?
5. Would a plausible late conversion or ordinary variance reverse the decision?

If the answer is unresolved, label the result **insufficient or immature evidence** and set a review condition. `clicks × baseline CVR` can describe expected conversions, but no fixed expected-conversion count is a universal significance test.

## Domain facts worth remembering

These are non-obvious enough that the agent benefits from having them surfaced — they are evidence the AI uses, not rules to apply blindly:

- **Quality Score is diagnostic, not the objective.** Prioritize high-spend or high-value entities, then use expected CTR, ad relevance, and landing-page experience to locate a likely mismatch. Do not optimize toward the 1–10 score itself.
- **Brand routing can change blended economics.** If brand delivery changes, inspect search terms and campaign routing before attributing a non-brand CPA movement to competition or bidding. Do not assume a universal brand "premium."
- **Wasted spend requires a named counterfactual.** Clearly irrelevant queries can be waste without conversion evidence. Relevant zero-conversion traffic becomes a waste finding only after measurement, maturity, and an economic threshold support that conclusion.
- **Segment network performance.** If a Search campaign also serves on Search Partners or other eligible inventory, compare the segments and conversion quality before recommending exclusion. Mixed inventory is not automatically broken.
- **Non-serving keywords are hygiene, not an ML emergency.** Zero-impression keywords may be paused or removed to reduce operational clutter, but do not claim they confuse bidding without account-specific evidence.
- **Counting type matters.** Lead-gen should use `ONE` per click; e-commerce should use `EVERY`. Wrong setting silently inflates or deflates conversions.
- **STOP condition.** If conversion tracking is broken, stop conversion-led optimization and repair measurement first. Use a protective spend action only when exposure cannot otherwise be bounded.

## Impression share — interpret the cause, then test the opportunity

- Lost IS (budget) estimates missed eligible impressions attributed to budget; it does not prove the marginal traffic will meet the target CPA/ROAS.
- Lost IS (rank) estimates missed eligible impressions attributed to Ad Rank. Diagnose bid competitiveness, ad/landing-page relevance, and auction context; do not equate it mechanically with Quality Score.
- Low loss on both dimensions can indicate limited eligible demand, but verify targeting, approvals, schedule, and measurement before concluding that the market is exhausted.
- If budget and rank are both constraints, use the business objective and marginal economics to choose the first intervention. Avoid simultaneous changes when an experiment or staged change can identify the driver.
