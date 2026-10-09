---
name: paid-ads-reddit
description: Audit, diagnose, and safely operate connected Reddit Ads accounts through the NotFair MCP. Use for Reddit advertising, Reddit Ads performance, campaign or ad-group analysis, spend, conversions, targeting, audiences, pixels, budgets, bids, creative, campaign setup, or approved Reddit Ads changes.
argument-hint: "<account, campaign, date range, or Reddit Ads goal>"
---

# Reddit Ads

Read `../shared/operating-contract.md` and `../shared/measurement-framework.md` before acting. Use the live account data from the connected platform as the source of truth.

## Establish the live scope

1. Follow [`../../docs/mcp-connection.md`](../../docs/mcp-connection.md). Resolve `~~reddit-ads` to the live connection. Use its current instructions and capability descriptions to choose tools, and verify the requested platform and account from live data. Do not infer access from another connected platform.
2. Confirm the selected account with a harmless account/setup read. If the connector is missing or unauthorized, direct the user to connect or re-authorize Reddit Ads and stop before claiming live access. Select only connected accounts.
3. Record the account currency, timezone, objective, conversion definition, attribution basis, and requested date window. Treat tracking gaps as limitations, not zero performance.

The connector exposes campaign, ad-group, and ad CRUD, reporting, audiences, funding instruments, pixels, profiles, and a read-only code-mode surface for batched account-scoped reads. Discover the exact schemas before calling tools; do not treat any skill-level list as the only allowed surface. Older clients may still reach a dedicated `/api/mcp/reddit_ads` route; do not add that as a second plugin MCP server.

## Diagnose with one broad read

Pull the campaigns, ad groups, ads, funding instruments, and performance relevant to the question. Choose available read capabilities and batch related data when useful.

Interpret the platform correctly:

- Hierarchy is ad account → funding instruments / campaigns → ad groups → ads. Pixels, profiles, and saved/custom audiences sit on the account.
- Money fields such as `goal_value`, `bid_value`, and `spend_cap` are integer microcurrency (1 USD = 1,000,000). Reporting conversion *total value* fields use hundredths instead. Do not apply one universal money conversion.
- Read `configured_status` and `effective_status` separately.
- Account-scoped tools enforce selected-account ownership for entity IDs. Shared audience, profile, or catalog references require discovery in that selected account.
- Reporting may lag about 6 hours, and historical conversion totals can change. Compare complete equivalent periods and name spend, impressions, CTR, conversions, CPA, or ROAS only when the returned fields support them.

Lead with the business decision: strongest contributor, largest material risk, likely cause supported by data, and the smallest useful next action. Separate measured facts from inference.

## Execute approved changes safely

Use a supported write capability and respect its current contract. Show the exact account, entity, current value, proposed value, spend exposure, risk, and rollback before acting. Preview changes with dry-run when available, obtain approval, apply once, then read back.

- Dry-run is local schema and ownership validation, not provider validation.
- Writes are not automatically retried. HTTP 401 means reconnect; 403 means permissions or scopes; 429 means wait.
- Prefer pause/enable over deletion.
- Create campaigns, ad groups, and ads with `configured_status=PAUSED` unless activation is explicitly requested.
- After an approved mutation, use the returned evidence or a fresh read to confirm the resulting state. Report partial failures plainly.

Finish with the confirmed action, observation window, success metric, and rollback trigger. A proposal remains `ready_for_review`; call it `published` only after the live connector confirms it.
