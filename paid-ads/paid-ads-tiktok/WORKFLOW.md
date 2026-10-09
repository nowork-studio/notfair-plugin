---
name: paid-ads-tiktok
description: Audit, diagnose, and safely operate connected TikTok Ads accounts through the NotFair MCP. Use for TikTok advertising, Spark Ads, short-form video ads, campaign or ad-group analysis, spend, conversions, targeting, creative, budgets, bids, creator briefs, campaign setup, or approved TikTok Ads changes.
argument-hint: "<account, campaign, date range, or TikTok Ads goal>"
---

# TikTok Ads

Read `../shared/operating-contract.md` and `../shared/measurement-framework.md` before acting. Use the live account data from the connected platform as the source of truth.

## Establish the live scope

1. Follow [`../../docs/mcp-connection.md`](../../docs/mcp-connection.md). Resolve `~~tiktok-ads` to the live connection. Use its current instructions and capability descriptions to choose tools, and verify the requested platform and account from live data. Do not infer access from another connected platform.
2. Confirm the selected advertiser with a harmless account/setup read. If the connector is missing or unauthorized, direct the user to connect or re-authorize TikTok Ads and stop before claiming live access.
3. Record the advertiser currency, timezone, objective, conversion definition, attribution basis, and requested date window. Treat tracking gaps as limitations, not zero performance.

This is the TikTok Ads Marketing API v1.3 surface, distinct from creator and Shop APIs. Business membership, billing, payments, creator data, and TikTok Shop are not exposed by this Ads integration. Discover exact tool schemas before calling tools; `advertiser_id` is always the selected authorized account, and long IDs must be preserved as strings. The connector also exposes code-mode for batched account-scoped reads. Older clients may still reach a dedicated `/api/mcp/tiktok_ads` route; do not add that as a second plugin MCP server.

## Diagnose with one broad read

Pull the delivery entities and performance relevant to the question. Choose available read capabilities and batch related data when useful.

Interpret the platform correctly:

- Budget and bid values are advertiser currency units, not micros or Meta cents.
- API `code` must be zero even when HTTP is 200. Preserve request IDs for support.
- Honor rate limits; Basic quotas vary by endpoint. Reconnect on expired or revoked access.
- Reports depend on advertiser timezone and may lag. Compare complete equivalent periods and name spend, impressions, CTR, conversions, CPA, or ROAS only when the returned fields support them.

Lead with the business decision: strongest contributor, largest material risk, likely cause supported by data, and the smallest useful next action. Separate measured facts from inference.

When the request is a creative or launch brief rather than an account mutation, keep the first seconds testable: a distinct hook, product demonstration or proof, native-format direction, CTA, and placement-safe crop. Verify creator rights, music licensing, testimonials, and price/result claims; label unknown proof `needs_substantiation`. Do not treat views or CTR as a conversion win without the named downstream measure.

## Execute approved changes safely

Use a supported write capability and respect its current contract. Show the exact advertiser, entity, current value, proposed value, spend exposure, risk, and rollback before acting. Preview, obtain approval, apply once, then read back.

- Previews are local validation only, not provider validation.
- Never retry ambiguous writes automatically.
- Prefer pause/enable over deletion.
- Create delivery entities DISABLE unless activation is explicitly requested.
- After an approved mutation, use the returned evidence or a fresh read to confirm the resulting state. Report partial failures plainly.

Finish with the confirmed action, observation window, success metric, and rollback trigger. A proposal remains `ready_for_review`; call it `published` only after the live connector confirms it.
