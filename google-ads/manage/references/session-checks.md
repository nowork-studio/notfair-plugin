# Session Start Checks

Run these checks when the user's request is analysis-oriented (performance reviews, optimization, "how are my ads", "show me", audits) OR when the user explicitly asks to review their changes ("check my changes", "did my changes work"). Skip them for direct action commands like "pause keyword X", "rename campaign Y", "add negative keyword Z".

## Check for pending change reviews

Read `{data_dir}/change-log.json`. Find entries where `reviewed` is `false`.

**If unreviewed changes exist but `reviewAfter` has NOT passed yet:**

> **Changes still maturing:**
>
> _[Date]: [summary]_
> Google Ads needs time to accumulate enough data for a reliable before/after comparison. Ready for review on [reviewAfter date] ([reviewWindow] review window per `change-tracking.md`).

Do not declare the primary outcome early. You may still pull safety, spend, delivery, measurement, and policy signals needed to detect a breached guardrail; label the business-outcome verdict immature until the recorded maturity rule is satisfied.

**If unreviewed changes exist AND `reviewAfter` has passed:**

1. Pull current metrics for the affected entities over the recorded review window using an available reporting capability scoped to those IDs. Use the `beforeSnapshot` only when its definitions, denominator, scope, and maturity match; otherwise query a complete like-for-like pre-change period. Do this alongside the user's actual request, and reuse the resulting rows for the anomaly check below.

2. Compute the primary business metric and guardrail recorded for the intervention. Add spend, conversion, CPA, or CTR deltas only when their definitions and denominators are comparable.

3. Present briefly BEFORE the user's request:

> **Follow-up on recent changes:**
>
> _[Date]: [summary]_
> Result after [review window]: [primary metric] went from X to Y ([+/-Z%]) on [named denominator]. [Guardrail] changed from A to B. [One sentence assessment, including maturity or comparability limits.]

4. Mark as `reviewed: true` with `reviewResult`:
```json
{
  "reviewed": true,
  "reviewedAt": "<ISO 8601>",
  "reviewResult": {
    "afterSnapshot": { "spend7d": 0, "conversions7d": 0, "cpa7d": 0, "ctr7d": 0 },
    "assessment": "positive|negative|inconclusive",
    "note": "<one line summary>"
  }
}
```

5. If the predeclared rollback threshold is breached on mature, comparable evidence, recommend the recorded rollback. If no threshold was recorded, classify the result as observed/inconclusive and ask for the business guardrail rather than inventing one after seeing the outcome.

## Check for anomalies

In the same performance read you already make, compare each campaign's last 7 complete days with its prior 28 complete days (scaled to a 7-day rate):

1. Use complete days in the account's time zone. Mark campaigns whose budget, bidding or status changed inside either window, so a movement caused by that change is reported with it, not as an unexplained anomaly.
2. Flag movements that cross an account-specific anomaly band or business guardrail. If none exists, rank the largest movements for review and label them as triage signals, not failures.
3. Mention anomalies briefly if found.
