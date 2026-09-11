# Daily Ads Operator

Use this loop when the user asks for a recent-day check, morning brief, "today's keywords", or ongoing account management. The goal is a concise operator note with an approval queue, not a dashboard dump.

## Contract

Every daily operator pass must:

- Identify the account, campaign scope, timezone, and reporting window.
- Compare the most recent complete day against a 7-day baseline; include today partial only when the user asks for same-day cleanup.
- Pull enough data to explain spend: campaign, ad group, keyword, search term, conversion action, impression-share, network, and recent change context when available.
- Classify the next step as **no action**, **watch**, **recommend**, or **needs approval**.
- Surface budget pacing/anomaly risk before recommending budget changes.
- Check pending interventions from prior changes and call out reviews due now.

## Data to pull

Choose the smallest useful set of available reads:

- Account setup / conversion actions via `summarizeAccountSetup` or GAQL.
- Campaign metrics for yesterday, last 7 days, and last 30 days when volume is low.
- Keyword and search-term metrics for the active scope.
- Impression-share fields for Search campaigns: budget lost vs rank lost.
- Network/device/date segmentation when CPA/CVR shifted.
- Recent account change history when explaining a regression.
- Active experiments/interventions when available.

## Output shape

```text
Scope: <account/campaign> / <window> / <timezone>
Top finding: <one sentence>

Snapshot:
- Spend:
- Clicks:
- Conversions / leads:
- Avg CPC / CPA:
- Pacing:

Read:
- <why the metrics moved, with denominator>

Watch:
- <entity> — trigger: <threshold/date>

Recommended actions:
1. <exact action>
   Evidence:
   Risk:
   Approval:

Pending reviews:
- <prior change> — due/too early/verdict
```

## Decision rules

- Thin data is a result. If the account has only 1–3 clicks, prefer watch conditions over hard mutations unless intent is clearly bad.
- Do not recommend a budget increase when spend is below budget and lost impression share to budget is low; diagnose rank, relevance, tracking, or demand instead.
- For Maximize Clicks accounts, treat cheap traffic as discovery, not success. Look for activation/lead quality before scaling.
- For local-service accounts, expensive `near me` clicks can be plausible exploration. Require intent mismatch or a spend threshold before pausing.
- For SaaS/product-led accounts, generic curiosity terms are usually lower quality than named-tool / problem-aware intent.
- Any proposed write must be handed to the safe executor pattern; do not execute from the daily brief without explicit approval.

## Budget pacing guard

Calculate:

- Month-to-date spend.
- Projected month-end spend at current run rate.
- Daily budget vs actual spend yesterday and 7-day average.
- Spike detection: compare yesterday with the account's recent complete-day distribution, expected pacing, and stored spend guardrail. If no guardrail exists, use a large deviation as a review trigger and show the values rather than declaring a universal threshold.
- Under-delivery: compare actual spend with budget and expected demand, then use lost impression share due to budget versus rank to distinguish budget constraint from eligibility, demand, or relevance. Do not infer a problem from one fixed utilization percentage.

Interpretation:

- Overspend spike + no conversion signal: recommend tightening search terms / bids / schedule before increasing budget.
- Under-delivery + high lost IS rank: relevance/rank problem, not a budget problem.
- Under-delivery + low impressions: demand, geo, eligibility, or tracking issue.
- Healthy CPA + high lost IS budget: budget increase can be proposed, still approval-gated.

## Anti-patterns

- Raw GAQL row dumps.
- Recommending budget increases before checking conversion tracking and impression-share split.
- Pausing strategic broad keywords before checking exact/phrase safety nets.
- Treating CTR or CPC as success without conversion or business-quality context.
