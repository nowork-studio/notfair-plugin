# Decision Math for Google Ads

Load this reference when a material recommendation depends on multiple reporting sources, partial extracts, duplicate identifiers, unresolved outcomes, conversion lag, a target CPA/ROAS, or an experiment. Use `../../shared/ppc-math.md` for formulas.

The goal is not a spreadsheet dump. It is a compact derivation ledger containing every value that could change the decision.

## Build the derivation ledger

1. **Name each denominator.** Separate platform conversion events, unique leads, qualified leads, customers, revenue, and retained value. Never compare them as if they were interchangeable.
2. **Reconcile scope.** Show the account/entity, date window, timezone, network, conversion action, source, attribution basis, and maturity status that make each value eligible.
3. **Measure evidence integrity.** When row-level or joined data is supplied, compute extract coverage, join coverage, duplicate rate, deduplicated coverage, timestamp-valid rate, and unresolved rate when each can affect the conclusion. Define duplicate rows as rows beyond the first eligible row per decision identifier unless the source specifies another rule.
4. **Calculate the decision economics.** Compute the relevant raw and cleaned CPA/ROAS, target gap or headroom, spend above target, and any qualified-outcome or contribution-based metric needed for the decision.
5. **Bound uncertainty.** Use best/worst plausible outcomes when unresolved records could cross the target. Use mature cohorts or an explicit completion fraction when recent conversions are incomplete.
6. **Test the counterfactual.** For a performance change, calculate the smallest useful decomposition or control comparison. Do not turn a decomposition into a causal claim.

Do not omit a decisive calculation merely because the directional recommendation already seems obvious. Conversely, omit calculations that cannot change the action, scope, or evaluation rule.

## Minimum coverage by evidence block

Before compressing the analysis, inventory every distinct quantitative block supplied by the user or returned by a relevant read. For each block, either calculate the applicable items below or state briefly why that block cannot affect the decision.

- **Performance rows:** compute the primary outcome rate and CPA/ROAS for every row being compared, plus the total and gap versus target when the rows can be combined.
- **Partial extracts:** compute displayed row count, displayed spend/outcomes, coverage against the full total, and any ineligible or affected share using both the extract and full-total denominators when available.
- **Join or audit ledgers:** compute raw rows, duplicates, unique rows, duplicate rate, eligible join/identifier coverage, and timestamp-valid coverage when supplied. Do not cite an audit table without using its integrity evidence.
- **Grouped themes or segments:** reconcile child sums to the parent total. Name gaps, remainders, or non-additive/overlapping groups instead of silently summing them.
- **Time or maturity cohorts:** compute each comparable cohort's efficiency, the mature weighted baseline, immature projections only when a completion fraction is supplied, and the share of evidence that is mature.
- **Unresolved outcomes:** calculate best/worst plausible bounds and show whether either crosses the target.
- **Experiments or allocation choices:** show attributed performance for context, then separately derive the incremental or break-even threshold that would authorize the decision.

This is a coverage pass, not a requirement to publish a long table. Several calculations may fit on one compact line. What matters is that no quantitative block capable of changing the decision disappears from the record.

When the user asks for a concise answer, compress repeated explanation and packet restatement first. Do not compress away a denominator, reconciliation, bound, target comparison, or calculation required to audit the decision.

## Compact evidence-ledger format

Use a compact structure like this when several sources must be reconciled:

```text
Performance: entity A $spend / outcomes = CPA; entity B ...; target gap ...
Coverage: extract/eligible = rate; ineligible/extract and ineligible/total = rates
Integrity: raw - duplicates = unique; unique/eligible = coverage; valid-time/eligible = rate
Bounds or maturity: confirmed-to-best outcomes => CPA range; mature weighted baseline ...
Decision threshold: keep/test/stop when named metric on named denominator is <= or >= target
```

Use only the lines supported by the evidence. Preserve currency, units, dates, and denominator labels.

## Turn the math into a decision

A complete decision rule states:

- **Act now:** execute, test, hold, or decline, with exact entity and setting scope.
- **Why:** the two or three derived values that actually choose the action.
- **Preconditions:** measurement, maturity, capability, approval, and any evidence-integrity gate.
- **Test design:** one changed lever, named control/comparison, exposure allocation, and downside bound.
- **Primary rule:** metric, denominator, target threshold, and mature evaluation window.
- **Guardrail:** a second metric with a numerical stop threshold when the evidence supports one.
- **Outcomes:** numerical keep, hold/collect-more-data, and rollback branches.

Tie thresholds to the advertiser's stated target, verified contribution economics, or a predeclared baseline. Do not invent universal percentages or sample sizes.

## Evidence must be obtainable

Confirm that the recommended next step can produce the evidence required by the decision rule.

- If an existing report or narrower read resolves the gap, name that exact scope.
- If one side has zero exposure, waiting will not create a comparison. Propose a small reversible exposure-building test with a stable control.
- If the conversion cycle is incomplete, name the maturity date or completion gate rather than saying “wait longer.”
- If measurement is unreliable, repair or bound measurement before conversion-led optimization.
- If a denominator is zero, report the rate as undefined or the cost-per-outcome bound as unbounded; never divide by zero or silently substitute zero.

## Consistency check

Before answering:

1. Recalculate every value that determines the recommendation.
2. Confirm the preferred and rejected options agree with those values.
3. Confirm every percentage names its numerator and denominator.
4. Confirm the target appears in the go/no-go rule.
5. Confirm the test changes one lever and preserves a usable comparison.
6. Confirm the keep/hold/rollback branches are not logically inverted.

If any check fails, correct the decision record before presenting it.
