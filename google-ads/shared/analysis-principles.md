# Analysis Principles

These principles apply to every Google Ads skill. The references in each skill provide domain knowledge to draw from — these principles govern how you reason and what crosses the bar to land in front of the user.

## Evidence is the bar

Every claim or recommendation must cite specific data **from this account**:

- Name the entity (campaign, ad group, keyword, search term, asset).
- Cite the dollar amount, the metric value, and the time window.
- If you don't have the data to support a claim, pull it before making the claim. "Industry typically shows X" is not evidence — find the matching number in this account or drop the claim.
- When recommending an action, separately show the data that *would falsify* the recommendation if it existed. ("This keyword has 0 conversions in 47 clicks over 30 days, against an account-average CVR of 4.2% — expected ~2 conversions, observed 0.")
- "Looks low" / "seems high" / "could be improved" without a number is a draft, not a finding. Pull the number or cut the bullet.

Before comparing numbers, reconcile what they mean. Keep the metric definition, conversion action or goal, source, denominator, attribution basis, account timezone, date window, and reporting maturity visible when any of them could change the conclusion. A Google Ads `Conversions` total, `All conversions`, a CRM-qualified lead count, and an analytics event count are not interchangeable.

Label the reasoning layer:

- **Observed:** directly supported by the returned data.
- **Inferred:** a plausible explanation with the evidence for and against it.
- **Causal:** supported by a controlled experiment or another credible identification strategy. A before/after movement alone is not causal proof.

When the data is too thin to support a recommendation, say so explicitly and propose what would need to be true for the recommendation to hold. Don't paper over uncertainty.

## High-level approach (you decide the specifics)

Choose tools, query shape, and analytical depth from the user's question and the live connection. References provide domain knowledge when useful; they do not prescribe a tool sequence.

What does need to be true on every analysis:

1. **Scope the evidence.** Read enough to answer the question. Batch related reads where supported and useful, then summarize the relevant results.
2. **Reconcile before comparing.** Check equivalent scope, definitions, denominators, date completeness, conversion lag, attribution, and duplicated or missing coverage.
3. **Correlate, don't isolate.** A keyword's CPA is not a finding by itself; tie it to search terms, business intent, conversion quality, ad/landing-page match, and delivery constraints before you call something a problem. Use Quality Score only as a diagnostic clue.
4. **Make the decision testable.** State the action now, what is deferred, the primary metric and denominator, observation window, maturity rule, and keep/hold/rollback condition.
5. **Verify before mutating.** Read the current value; show the proposed value; show the expected impact as a scenario rather than a promise. Get a yes, then write.

For a material recommendation, run a short consistency check before answering:

- all decision-changing supplied evidence was either used or explicitly ruled irrelevant;
- every distinct quantitative block has an applicable derived statistic or an explicit reason it cannot affect the decision;
- derived values show their inputs, denominators, and units;
- the advertiser's target or verified economic threshold appears in the decision rule;
- the recommended action can generate the evidence required for its own review;
- the recommendation and every keep/hold/rollback branch agree with the arithmetic.

## Guardrails (do not violate)

- **STOP conversion-led optimization if measurement is unreliable.** Surface the fault first and do not change bidding, budgets, or targeting based on untrusted CPA/ROAS. Recommend a protective pause or spend reduction only when exposure cannot be bounded by a trustworthy guardrail, and only within the user's authorization. Otherwise preserve known-safe delivery while measurement is repaired.
- **Do not pause a Tier 1 (core business) keyword solely from short-window performance.** Diagnose measurement, maturity, search-term intent, ad/landing-page match, delivery constraints, and business economics first. A protective reduction can still be justified by clearly irrelevant traffic or a breached, predeclared spend guardrail.
- **No magic sample threshold.** Evidence sufficiency depends on the decision risk, effect size, conversion cycle, attribution maturity, spend exposure, and baseline rate. Use expected conversions or uncertainty intervals as diagnostics when inputs support them, but never treat a fixed click or conversion count as universal proof. For Smart Bidding changes, normally wait until the relevant conversions have matured and assess over one to two conversion cycles unless a safety or spend guardrail requires earlier action.
- **One-variable causal tests.** For material uncertain changes, prefer an experiment with a written hypothesis, one primary business metric, a guardrail, and one changed variable. Do not call a winner while the platform reports the result as undecided or while material conversions remain immature.
- **Respect capability boundaries.** Use the live schema and server guidance for changes, argument defaults, and limits. Do not bypass a rejected operation by splitting it into smaller calls.
- **Verify rollback support.** Record operation identifiers and before/after state. Only promise reversal or an undo window when the current capability explicitly supports it.
- **Confirm the scope of bulk changes.** Make the targets, counts, and expected impact clear before executing within the user's authorization.

## When you're unsure

- Surface uncertainty in the report. Better to say "thin data" than to invent a verdict.
- Ask the user one targeted question if it would change the recommendation materially. Don't ask for context the data already gives you.
- If a recommendation depends on business context (margin, AOV, peak season, competitive set) and that context is missing or stale, name what's missing and offer `/google-ads-audit` to populate it.
