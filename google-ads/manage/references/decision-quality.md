# Decision Quality for Google Ads

Use this reference whenever an analysis could change spend, bidding, targeting, conversion goals, campaign structure, or a user's belief about causality. The goal is a decision another operator can audit—not a long report.

## 1. Reconcile the evidence

Before comparing values, write down the smallest sufficient evidence frame:

- account and currency;
- account timezone and complete date window;
- entity scope and network/campaign type;
- metric definition and denominator;
- conversion actions included, primary/secondary status, counting, value, and attribution basis;
- reporting source and conversion maturity;
- relevant recent changes and coverage gaps.

If two sources disagree, do not silently choose one. Name the difference (for example, Google Ads primary conversions versus CRM-qualified leads), quantify overlap or missing coverage if possible, and choose the source that matches the business decision. Keep the other as a diagnostic.

Smallest sufficient does not mean fewest calculations. Before recommending a material change, derive every value that could change the direction or scope of the decision. When the packet or live reads contain partial extracts, duplicate identifiers, unresolved outcomes, lagged cohorts, or a target, use `decision-math.md` and `../../shared/ppc-math.md`. At minimum, check whether the decision needs:

- raw and business-outcome CPA/ROAS on explicitly named denominators;
- extract or join coverage and duplicate rates;
- best/worst bounds for unresolved outcomes;
- conversion-maturity or weighted-cohort adjustment;
- current gap or headroom versus the advertiser's target;
- a cleaned counterfactual or rate-versus-cost decomposition.

Do not calculate everything available. Calculate everything that could reverse the recommendation, change the chosen entity, or alter the go/no-go threshold. Show the inputs and arithmetic compactly enough that another operator can reproduce it.

## 2. Separate the reasoning layers

Use these labels when ambiguity matters:

- **Observed:** the returned evidence directly shows it.
- **Inferred:** the explanation fits the evidence but has alternatives. State what would distinguish them.
- **Causal:** a controlled test or credible design identifies the effect. A before/after chart alone is not enough.

Recommendations and Google optimization scores are inputs, not instructions. Evaluate each against the advertiser's conversion goal, economics, query quality, and constraints before accepting or dismissing it.

## 3. Produce an auditable decision record

For each material recommendation, include:

1. **Decision now:** execute, test, hold, or decline.
2. **Evidence:** the few account-specific facts that drive it.
3. **Uncertainty:** missing, immature, or conflicting evidence.
4. **Exact scope:** entity IDs/names and the current/proposed setting or value.
5. **Evaluation rule:** one primary business metric with its denominator, one guardrail, comparison method, conversion-maturity rule, and a dated or cycle-based review point.
6. **Outcome states:** keep, hold/collect more data, or roll back—with thresholds defined before the change.

Do not invent a universal click, conversion, percentage-change, or duration threshold. Calibrate it to the target CPA/ROAS, baseline rate, plausible effect size, conversion cycle, experiment power, and downside risk.

The exact next step may be a scoped read, reconciliation, or experiment design. Do not force an account mutation when a fact that determines the direction is unresolved.

Check that the proposed evidence can actually be produced. “Wait for a comparison” is not a valid plan when the current configuration gives one side zero exposure or cannot create the needed denominator. In that situation, either name the exact read/configuration that resolves the gap or design the smallest reversible, one-variable test that creates the missing comparison. Keep the current control, define the exposure, and bound downside before launch.

Before sending the answer, recalculate the decisive values and verify that the recommendation, rejected alternatives, and keep/hold/rollback rules all point in the same direction. A numerically inverted rule or a claim that contradicts the stated CPA/ROAS is a failed decision record even if the action sounds cautious.

## 4. Choose observation, staged change, or experiment

- **Observe** when exposure is small, data is immature, or a later conversion could reverse the conclusion.
- **Stage a reversible change** when downside is bounded and operational urgency matters. Change one decision lever, record before/after state, and wait for the defined maturity window.
- **Run an experiment** when the change is material and causality matters. State a business-linked hypothesis, test one variable, preselect one or two success metrics, preserve the base campaign while the test is running, and use the platform result plus mature conversions before choosing a winner.
- **Act protectively** before full maturity only for policy, safety, broken measurement with uncontrolled exposure, obvious irrelevant intent, or a breached spend/business guardrail. Explain why the normal evidence bar is being overridden.

### Common ambiguity gates

- **Geography:** before switching presence settings or excluding an area, distinguish user-location reporting from location-of-interest reporting, confirm the current advanced location option, verify business serviceability, and compare mature qualified outcomes by the relevant location view. An “outside target” percentage alone does not identify waste.
- **Impression share:** a combined or unlabeled lost-impression-share value is not enough for a budget or quality action. Separate loss due to budget from loss due to rank and check eligibility/demand context.
- **Conversion totals:** reconcile `Conversions`, `All conversions`, analytics events, CRM stages, and imported outcomes before choosing the number that bidding or the business should optimize.

## Current first-party Google anchors

Checked 2026-09-09. Re-verify when advice is time-sensitive.

- [Changing conversion goals and actions used for Smart Bidding](https://support.google.com/google-ads/answer/14571185): goal changes can require one to two conversion cycles to learn; avoid judging on immature conversions.
- [About conversion lag reporting](https://support.google.com/google-ads/answer/9347141): recent CPA can look high and ROAS low while conversions are still arriving.
- [About conversion goals](https://support.google.com/google-ads/answer/10995103): primary actions can drive bidding; secondary actions are observation-only unless included through a custom goal.
- [Test with confidence with Experiments](https://support.google.com/google-ads/answer/7281575): set a clear hypothesis, test one variable, preselect success metrics, and avoid contaminating the base.
- [About custom experiments](https://support.google.com/google-ads/answer/10683687): split eligibility does not guarantee equal impressions or spend; allow the trial to stabilize and use the reported comparison.
- [Using Quality Score to guide optimizations](https://support.google.com/google-ads/answer/6167123): Quality Score is a diagnostic tool, not a KPI.
- [Your guide to broad match](https://support.google.com/google-ads/answer/12159290): Google describes Smart Bidding as critical when using broad match; inspect search terms and negatives rather than assuming reach is qualified.
- [About targeting geographic locations](https://support.google.com/google-ads/answer/2453995): the default can include physical presence and location interest; location signals are not perfectly accurate.
- [Enhanced Conversions best practices](https://support.google.com/google-ads/answer/14795081): durable first-party measurement and deeper business outcomes improve optimization inputs.
- [Google Ads bidding and budgeting updates](https://blog.google/products/ads-commerce/bidding-budgeting-google-marketing-live-2026/): Google's current direction uses more of the lead-to-sale journey; beta or announced behavior must still be verified in the live account before relying on it.
- [The Experiments Playbook](https://business.google.com/en-all/think/measurement/experiments-playbook/): link the question to predetermined actions and use power analysis or appropriate statistical support for consequential tests.

These sources describe platform behavior and Google's recommended use. They do not prove that a recommendation is profitable for a particular advertiser; account evidence and business economics still decide that.
