# Quality Score Diagnostic

Quality Score is a keyword-level diagnostic, not a KPI, auction input to optimize directly, or reliable formula for predicting CPC savings. Use it to locate relevance problems after business performance and measurement are understood.

## What Google reports

Quality Score is shown on a 1–10 scale with three historical comparison components:

- expected click-through rate;
- ad relevance;
- landing-page experience.

Each component may be reported as below average, average, or above average relative to other advertisers whose ads showed for the same keyword. Google does not publish fixed component weights or a universal Quality Score-to-CPC multiplier. Do not invent either.

## Diagnostic sequence

1. Verify the exact keyword, match type, campaign/ad group, date scope, spend, and business outcome.
2. Pull all three Quality Score components; the headline score alone is insufficient.
3. Read the search terms that actually triggered the keyword. A poor query mix can look like an ad or landing-page problem.
4. Compare ad promise, search intent, and landing-page content. Identify the first broken link in that chain.
5. Check impression-share loss and auction context separately. Quality Score does not explain every rank or delivery change.
6. Recommend the smallest change that addresses the diagnosed component, with a business metric and review rule.

## Component interpretations

- **Expected CTR below average:** inspect actual search terms, message specificity, assets, and whether the ad group mixes distinct intents. Do not promise a CPC reduction from a score increase.
- **Ad relevance below average:** align the ad with the user's intent and offer, not merely the literal keyword. Split an ad group only when distinct intents need different ads or landing pages.
- **Landing-page experience below average:** verify message match, mobile usability, speed, navigation, trust, and conversion friction. Hand off to `/google-ads-landing` when page evidence is needed.

## Prioritization

Prioritize by business exposure: spend, qualified conversion value, target gap, and reachable volume. A low score on a non-serving keyword is usually housekeeping; a middling score on a high-value term may deserve investigation. Never rank work by keyword count alone.

## Current Google anchor

Checked 2026-09-09: [Using Quality Score to guide optimizations](https://support.google.com/google-ads/answer/6167123) explicitly describes Quality Score as a diagnostic tool, not a KPI. Re-verify before asserting current platform behavior.
