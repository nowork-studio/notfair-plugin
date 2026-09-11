# Search-Term Analysis Guide

Use the search terms report to understand the queries that actually triggered ads. Search terms, positive keywords, and negative keywords behave differently; verify current match behavior and live account scope before mutating.

## Evidence frame

For the chosen complete window, retain:

- search term, campaign, ad group, and matched keyword where available;
- match type and network/campaign type;
- cost, clicks, impressions, primary conversions, qualified outcomes, and value;
- account currency, timezone, conversion definition, attribution basis, and maturity;
- existing positives, negatives, brand exclusions, and relevant recent changes.

Search-term reporting may not expose every query. State coverage limits instead of treating the table as the full universe.

## Aggregate before acting

Analyze both individual queries and repeated 1-, 2-, and 3-gram intent patterns. Aggregate cost and qualified outcomes, retain example queries, and identify the campaigns/ad groups where each pattern appears.

Classify into:

1. **Clear exclusion candidate:** the verified business does not serve the intent, geography, audience, or offer.
2. **Keyword/control candidate:** repeated valuable intent where a dedicated keyword could improve routing, ad/landing-page match, or reporting.
3. **Routing conflict:** the same intent lands in multiple ad groups or campaigns with meaningfully different outcomes.
4. **Ad/landing-page mismatch:** relevant query, but the promise or destination fails the intent.
5. **Watch:** evidence is relevant but immature, incomplete, or economically reversible.

## Negative-keyword safety

- Confirm the business truly does not want the intent. Words such as “free,” “course,” or “jobs” are not universally irrelevant.
- Choose account, list, campaign, or ad-group scope deliberately.
- Choose negative broad, phrase, or exact behavior deliberately; negative matching does not behave like positive close variants.
- Check conflicts against protected brand/core terms, converting queries, existing positives, and other campaigns before applying.
- Preview exact targets and counts, get approval, execute through the safe pattern, and read back live state.

Clearly irrelevant intent can justify an exclusion without waiting for conversions. A relevant zero-conversion query needs trustworthy measurement, mature data, and a business guardrail; no universal click count makes it waste.

## Match-type decisions

Exact, phrase, and broad describe progressively wider semantic reach. Their performance cannot be compared fairly without reconciling query mix, bidding, routing, goals, and maturity.

Google's current guidance says broad match should be used with Smart Bidding. Treat that as a testable platform recommendation, not proof of fit. Confirm primary conversion quality, sufficient downside budget, and search-term controls; use an experiment for a material migration.

Adding a search term as a keyword is useful only when it creates control or learning value. A fixed number of conversions is not a reason by itself, and an exact keyword does not guarantee exclusive routing.

## Output

Return:

- scope and coverage;
- top patterns by business exposure;
- proposed exclusions, keyword/routing candidates, and watches;
- conflicts or prerequisites;
- exact approved-action queue;
- primary qualified metric, denominator, guardrail, and maturity/review rule.

## Current Google anchors

Checked 2026-09-09:

- [Google Ads keyword matching](https://support.google.com/google-ads/answer/14996023)
- [Your guide to broad match](https://support.google.com/google-ads/answer/12159290)
- [Build effective keyword lists](https://support.google.com/google-ads/answer/10039665)
- [About negative keyword lists](https://support.google.com/google-ads/answer/2453983)

Re-verify current platform behavior when the decision depends on it.
