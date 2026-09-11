# Campaign Structure Guide

Structure exists to express different business goals, settings, and intent—not to hit a universal campaign, ad-group, or keyword count.

## Campaign boundary

Use a separate campaign when a meaningful campaign-level control must differ, such as:

- objective or conversion goal;
- budget ownership or business priority;
- geography, language, network, schedule, or policy constraint;
- bidding strategy or profit/CPA target;
- product line or service with materially different economics.

Do not split solely for cleaner labels when the same settings and outcome apply. Before consolidating or rebuilding, identify what history, eligibility, experiments, reporting, and rollback path would be affected.

## Ad-group boundary

Group keywords and ads around a narrow intent that can be answered by the same offer and landing page. Split when:

- searchers need a meaningfully different answer or proof;
- ad language or landing destination must differ;
- query routing is producing material mismatch;
- policy or operational ownership requires separation.

Google currently suggests tightly themed lists and provides 20–30 terms as a structuring tip, but this is not a performance threshold. Intent coherence and message match decide the boundary.

## Restructure diagnosis

Before changing structure, record:

1. The observed problem and affected business metric.
2. Evidence that structure—not measurement, query mix, rank, budget, creative, or landing-page friction—is the cause.
3. Current campaign/ad-group settings and dependencies.
4. The proposed mapping from every affected entity to its destination.
5. One primary metric, a guardrail, maturity window, and keep/hold/rollback rule.

Prefer a controlled experiment where supported. Otherwise stage the smallest reversible slice; do not combine restructure, bidding, budget, goal, and creative changes if attribution matters.

## Naming

Names should expose durable operating dimensions, not implementation trivia. A useful pattern is:

`<objective> | <market> | <product-or-intent> | <optional distinction>`

Keep names readable and stable. Put test dates, hypotheses, and owners in labels or intervention records rather than continually renaming entities.

## Current Google anchors

Checked 2026-09-09:

- [Organize your account with ad groups](https://support.google.com/google-ads/answer/6372655)
- [About your account organization](https://support.google.com/google-ads/answer/13738436)
- [Manage ad groups for existing campaigns](https://support.google.com/google-ads/answer/2375452)

Re-verify current UI and capability details before a write.
