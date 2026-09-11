# PPC Math — Margin-Aware Profitability Calculators

Formulas and interpretation rules used throughout the Google Ads skills. Load this when a finding needs dollar-denominated impact, profitability framing, or a forecast.

**Priority rule:** Use a business target or break-even threshold only when the underlying contribution economics are verified for the same outcome and payback window. Otherwise use mature account history as directional context, not as proof of profitability. Keep the chosen denominator and economic basis consistent within a finding.

---

## Core Formulas

```
CPA            = Spend / Conversions
ROAS           = Revenue / Spend              (ratio, e.g. 3.5x)
ROAS%          = Revenue / Spend × 100
Marketing ROI% = (Contribution Profit - Ad Spend) / Ad Spend × 100
CPC            = Spend / Clicks
CPM            = (Spend / Impressions) × 1000
CTR            = Clicks / Impressions × 100
CVR            = Conversions / Clicks × 100
CPL            = Spend / Leads
```

## Evidence integrity and coverage

Use these when platform rows, CRM outcomes, imports, or a displayed extract may be incomplete or duplicated. Keep each denominator named; do not call two rates comparable merely because both are percentages.

```
Extract Coverage       = Extract Rows / Eligible Source Rows
Join Coverage          = Matched Unique IDs / Eligible Unique Source IDs
Duplicate Rate         = Duplicate Rows / Observed Rows
Deduplicated Coverage  = Unique Matched IDs / Eligible Unique Source IDs
Timestamp-valid Rate   = Rows Inside Valid Window / Eligible Rows
Unresolved Rate        = Unresolved Eligible IDs / Eligible Unique Source IDs
```

State what makes a row eligible and whether the numerator is raw rows, unique identifiers, conversions, leads, or customers. A high raw join rate can coexist with weak unique-ID coverage when duplicates are present.

## Incomplete outcomes and bounds

When unresolved records could change the decision, show bounds rather than silently dropping them:

```
Worst-case Outcomes = Confirmed Outcomes
Best-case Outcomes  = Confirmed Outcomes + Eligible Unresolved Outcomes
Worst-case CPA      = Spend / Worst-case Outcomes
Best-case CPA       = Spend / Best-case Outcomes
```

Reverse the labels when the outcome is undesirable, such as refunds or invalid leads. Use only plausible eligible unresolved rows; do not count records known to be duplicates, outside the window, or outside the decision scope.

## Conversion maturity and cohort weighting

Do not blend immature and mature cohorts as if they had equal observation time.

```
Projected Mature Outcomes for Cohort = Observed Outcomes / Completion Fraction
Projected Mature CPA                 = Cohort Spend / Projected Mature Outcomes
Weighted Mature Rate                 = Sum(Mature Outcomes) / Sum(Eligible Inputs)
Weighted Mature CPA                  = Sum(Spend) / Sum(Mature Outcomes)
```

Require `0 < Completion Fraction <= 1`; otherwise do not project. Treat completion-fraction projections as maturity adjustments, not causal forecasts. Prefer actual mature cohorts when available, and state the conversion-cycle date or completion gate for the final decision.

## Target gaps and cleaned counterfactuals

```
Spend at Target CPA       = Outcomes × Target CPA
Spend Above Target        = max(0, Spend - Spend at Target CPA)
CPA Headroom per Outcome  = Target CPA - Current CPA
Cleaned Spend             = Total Spend - Identified Out-of-scope Spend
Cleaned Outcomes          = Total Outcomes - Identified Out-of-scope Outcomes
Cleaned CPA               = Cleaned Spend / Cleaned Outcomes
```

For a rate-versus-cost decomposition, hold one factor at its prior value at a time:

```
CPA at Current CPC and Prior CVR = Current CPC / Prior CVR
CPA at Prior CPC and Current CVR = Prior CPC / Current CVR
```

These are counterfactual decompositions, not proof that one factor caused the change. Label any remainder and name other plausible explanations.

## Incrementality and break-even

```
Incremental CPA              = Incremental Spend / Incremental Outcomes
Break-even Incremental Count = Incremental Spend / Contribution per Outcome
Incremental Contribution     = (Incremental Outcomes × Contribution per Outcome) - Incremental Spend
```

Use treatment-minus-control outcomes or another credible incremental estimate. Attributed outcomes are not automatically incremental. If no control or credible counterfactual exists, propose a bounded experiment instead of presenting attributed CPA as incrementality.

## Profitability Formulas (require verified contribution economics)

```
Contribution / Order = Net Revenue - variable fulfillment, returns, fees, and service costs
Break-Even CPA       = Contribution per acquired customer over the chosen payback window
Max Profitable CPA   = Break-Even CPA minus the business's required profit or risk buffer
Break-Even ROAS      = 1 / Contribution Margin          (only when value is comparable revenue)
Unit Contribution   = Contribution per acquired customer - CPA
Headroom $          = (Break-Even CPA - Current CPA) × Monthly Conversions
```

Headroom is a scenario at the observed volume, not proof of incremental profit. Returns, lead quality, close rate, repeat purchases, capacity, taxes, and marginal media efficiency can change it. Use the advertiser's target and payback constraint rather than universal dollar bands.

---

## LTV:CAC (require LTV data)

```
CAC       = Total Marketing Spend / New Customers Acquired
LTV       = ARPU × Avg Customer Lifespan   (or use business-context.json.ltv if set)
LTV:CAC   = LTV / CAC
Payback   = CAC / (ARPU × Gross Margin)    (months to recover CAC)
```

Interpret LTV:CAC only against the business's gross margin, cash constraints, retention maturity, and payback target. A high ratio can reflect understated CAC or immature growth rather than under-investment; a low ratio does not by itself identify which campaign to change.

---

## Impression Share Opportunity

```
Eligible Revenue Upper Bound = Current Revenue × (1 / Current IS - 1)
Linear Spend Upper Bound     = Current Spend × (1 / Current IS)
```

**Example:** Campaign at 60% IS, spending $3,000/mo, generating $12,000 revenue.
- Linear eligible-revenue upper bound: $12,000 × (1/0.6 - 1) = **$8,000/mo additional**
- Linear spend upper bound: $3,000 × (1/0.6) = **$5,000/mo**

These calculations assume the missed auctions behave like the observed auctions, which is rarely guaranteed. Label them as bounds, never forecasts. Only use them when budget loss is material and rank, demand, query quality, capacity, and mature economics have been checked. Prefer Google's simulator or a staged test for a decision.

---

## Budget Forecasting

```
Projected Spend       = Daily Budget × Days in Period
Projected Conversions = Projected Spend / Historical CPA
Projected Revenue     = Projected Conversions × AOV
```

Treat these as sensitivity scenarios, not forecasts. Choose candidate budgets from the account's actual constraint, simulator output where available, cash/capacity ceiling, and acceptable downside. There is no universal safe percentage that guarantees learning will not change.

For a Smart Bidding target or conversion-goal change, isolate the change when practical and define the evaluation window in conversion cycles. Google's current guidance says performance commonly takes one to two conversion cycles to reflect a target or goal change; avoid repeated target changes inside one cycle unless a business guardrail requires intervention.

---

## MER (Marketing Efficiency Ratio)

```
MER = Total Business Revenue / Total Marketing Spend
```

Use MER when the user has multi-channel spend and wants blended efficiency. Compare it with the business's own contribution, payback target, and mature like-for-like history. External industry ranges are directional context only and do not establish a healthy account-level target.

MER captures organic, brand, and retention — so it's higher than paid ROAS and should never be compared directly to ROAS.

---

## Usage in Findings

**Before (account-average framing):**
> "Keyword 'emergency plumber example-city' has CPA of $72, which is 150% of account average."

**After (contribution-aware framing, requires a verified $72 contribution per acquired customer over the chosen payback window):**
> "Keyword 'emergency plumber example-city' has CPA of $72 against a verified $72 break-even CPA. It has no contribution headroom at the observed volume. Hold scaling; diagnose query and conversion quality, then test the smallest plausible improvement or reduce exposure if the business guardrail is breached."

**Headroom example:**
> "Example City Search has $54 of CPA headroom against a verified $72 break-even CPA. At the observed 50 monthly conversions, that is a **$2,700 contribution-headroom scenario**. With 35% lost impression share to budget, a linear calculation gives an eligible-revenue upper bound, not expected incremental revenue; use a simulator or staged budget test to estimate the marginal return."

The second framing is auditable when the contribution inputs and outcome denominator are verified. If they are not, label it as a sensitivity scenario rather than an action threshold.

---

## Gates

1. **Never compute break-even from gross margin alone when material variable costs, lead-to-sale rate, repeat value, refunds, or capacity are missing.** If inputs are inferred, label the output as a scenario and do not use it to authorize a write.
2. **Do not present linear conversion projections as expected outcomes.** Bound the scenario to observed support, show the assumption, and use a simulator, experiment, or staged change for material scaling.
3. **Never use MER in place of ROAS for individual-campaign decisions.** MER is a blended portfolio metric; individual campaigns must clear ROAS/CPA targets.
4. **LTV must match the cohort and maturity needed for the decision.** If retention is immature, show a shorter verified contribution/payback window rather than extrapolating a lifetime value.
