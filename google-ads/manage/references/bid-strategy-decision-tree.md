# Bid-Strategy Decision Guide

Choose bidding from the advertiser's business goal and trustworthy measurement. Do not use a universal migration ladder, conversion minimum, learning duration, or target adjustment percentage.

## Decision inputs

Before recommending a strategy or target change, establish:

- campaign type and objective;
- primary conversion actions actually used for bidding;
- whether the goal is volume, conversion value/profit, clicks, or visibility;
- target CPA/ROAS or other business constraint and how it was derived;
- budget/capacity ceiling;
- conversion cycle, reporting lag, and recent goal/strategy changes;
- bid-strategy status and relevant simulator or forecast output;
- qualified outcome quality, not only platform conversion count.

If conversion tracking or values are unreliable, fix measurement before conversion-led bidding.

## Goal-to-strategy map

| Business goal | Candidate approach | Preconditions and cautions |
|---|---|---|
| Maximize qualified actions within a fixed budget | Maximize conversions | Primary conversions must represent the desired action; without a target, the strategy seeks volume within budget rather than a guaranteed CPA. |
| Seek qualified actions around a CPA constraint | Target CPA | The target must be economically justified and realistic for the campaign/account context. Evaluate after conversion maturity. |
| Maximize trustworthy conversion value within a fixed budget | Maximize conversion value | Values must be comparable and aligned to the business outcome; raw lead counts with arbitrary values are not sufficient. |
| Seek conversion value around a return constraint | Target ROAS | Requires reliable, differentiated values and a business-derived target. |
| Generate site traffic | CPC-focused bidding or Maximize clicks | Use only when clicks are genuinely the objective or conversion measurement is not the campaign's purpose; set exposure controls appropriate to the account. |
| Seek visibility | Impression-focused strategy such as Target impression share | Define where and why visibility matters, plus a cost ceiling. Do not assume a universal impression-share target, even for brand. |

These are candidates, not automatic answers. Availability and labels vary by campaign type and may change; inspect the live schema and account.

## Changes and learning

- Read the current goal, strategy, target, status, budget, and recent change history before proposing a change.
- Do not change the conversion goal, bid strategy, target, budget, and creative together if you need to know what caused the result.
- For uncertainty, use **Save as experiment** or the supported experiment capability when available.
- After target or conversion-goal changes, assess mature results over the relevant conversion cycle. Google's current guidance says one to two conversion cycles are commonly needed; the account's displayed status and lag take precedence over a fixed number of days.
- Intervene earlier only when a policy, tracking, capacity, or spend guardrail is breached. State that override explicitly.

## Troubleshooting before changing targets

1. Reconcile conversion goals, primary/secondary actions, counting, values, and upload health.
2. Check conversion lag and compare complete equivalent cohorts.
3. Separate budget loss, rank loss, demand, eligibility/policy, query quality, and landing-page constraints.
4. Check recent internal changes and external auction/seasonality evidence.
5. Determine whether the target is constraining delivery or merely correlated with it.
6. Choose one reversible intervention and predeclare the success metric, guardrail, and keep/hold/rollback rule.

## Current Google anchors

Checked 2026-09-09:

- [Align your bid strategy with your campaign goal](https://support.google.com/google-ads/answer/12929373)
- [Your guide to Smart Bidding](https://support.google.com/google-ads/answer/11095984)
- [Changing conversion goals and actions used for Smart Bidding](https://support.google.com/google-ads/answer/14571185)
- [Change how you bid](https://support.google.com/google-ads/answer/6324950)

Google documents product behavior and recommended use; the advertiser's economics and account evidence decide whether a change is good.
