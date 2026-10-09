---
name: paid-ads
description: Coordinate safe, evidence-based paid-media work across Google Ads, Meta Ads, X Ads, LinkedIn Ads, Reddit Ads, TikTok Ads, Amazon, and ChatGPT Ads. Use for broad ads questions, multi-channel strategy, budgets, CPA or ROAS, campaign requests, spend, ad performance, or when routing to the right NotFair paid-ads skill.
argument-hint: "<goal, platform, or 'review my ads'>"
---

# Paid Ads

Read `../shared/operating-contract.md` and `../shared/measurement-framework.md` before acting.

Start with the business outcome, not a platform request. Establish the conversion, its value or break-even threshold, the target metric, daily and monthly budget, geography, landing destination, and whether tracking is verified. If an input is unavailable, label the resulting recommendation as a draft rather than filling the gap with a generic assumption.

## Route the work

| Request | Use |
|---|---|
| Connect accounts, discover access, or capture workspace context | `/notfair:paid-ads-setup` or `/notfair:paid-ads-integrations` |
| Audit Google or Meta before making changes | `/notfair:google-ads-audit` or `/notfair:meta-ads-audit` |
| Operate Google or Meta accounts | `/notfair:google-ads` or `/notfair:meta-ads` |
| Audit or operate X, LinkedIn, Reddit, or TikTok Ads | `/notfair:paid-ads-x`, `/notfair:paid-ads-linkedin`, `/notfair:paid-ads-reddit`, or `/notfair:paid-ads-tiktok` |
| Plan a new cross-channel campaign | `/notfair:paid-ads-launch` |
| Read a weekly/monthly scorecard | `/notfair:paid-ads-review` |
| Cut waste or reallocate an approved budget | `/notfair:paid-ads-optimize` |
| Write evidence-backed concepts, copy, or a refresh test | `/notfair:paid-ads-creative` |
| Plan Amazon or ChatGPT Ads | `/notfair:paid-ads-amazon` or `/notfair:paid-ads-chatgpt` |

For a single-platform request, route directly rather than duplicating a specialized workflow. Establish that the platform's own verified connector is available before promising an account read or write.

## Operating posture

Lead with the decision: what is working, what is not, and the one action with the most defensible impact. Keep recommendations measurable and reversible. A campaign plan, creative brief, or allocation table is `ready_for_review`; it becomes `published` only after the platform confirms the exact object and settings.
