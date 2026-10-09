---
name: google-analytics
description: Analyze connected Google Analytics 4 traffic, acquisition, engagement, landing pages, ecommerce, events, and conversions, and safely manage supported GA4 key events or custom dimensions through NotFair MCP. Use for GA4, Google Analytics, traffic or conversion drops, channel attribution, realtime activity, report requests, measurement configuration, or Analytics MCP setup.
argument-hint: "<property, date range, metric, or GA4 question>"
---

# Google Analytics

Read `../shared/operating-contract.md`. Use the live connector's instructions and schemas to choose tools for the task.

## Select the property and question

1. Resolve `~~google-analytics` to the actual GA4 connector and inspect its current tools. Confirm access and the available properties from live data.
2. Select the exact `properties/123456789` resource returned by the connector. Never substitute a `G-` measurement ID or Google account ID.
3. Define the business question, primary metric, conversion or key-event definition, property timezone, date range, and comparison window. If the platform is missing or unauthorized, direct the user to reconnect the universal NotFair plugin and stop before claiming live data.

## Pull decision-grade evidence

Pull the smallest useful set of reports across channel, source/medium, campaign, landing page, device, geography, or event. Choose available reporting capabilities and batch related reads when supported and useful.

- Compare complete equivalent periods and show absolute values plus deltas.
- Use metadata before guessing an unfamiliar dimension/metric pair. Respect the current API's dimension, metric, fan-out, and quota limits exposed by the tool.
- Check response metadata for sampling, thresholding, or quota warnings. A collapsed `(other)` row means detailed rows may not sum to the total.
- Treat recent/intraday data as provisional and state the property's timezone.
- Keep GA4 attribution separate from ad-platform attribution. Explain discrepancies instead of blending incompatible numbers.
- Do not claim causality from a correlated channel or page change without supporting evidence.

Lead with what changed, where it changed, the evidence-backed likely driver, confidence, and the next measurement or business action. Include the report definition so another operator can reproduce it.

## Change measurement configuration

Use currently available capabilities for supported key-event and custom-dimension changes. Show the exact property, current state, proposed state, downstream reporting impact, and rollback before asking for approval.

- Creating and deleting a key event are reversible counterparts when the same event definition is available.
- Archiving a custom dimension is irreversible in GA4 and its parameter name cannot be reused. Require explicit approval that names the property and dimension before archiving.
- Respect the read/write boundary described by the live capability.
- Confirm success from returned before/after evidence or a fresh configuration read; report partial failures without retrying blindly.

Do not describe a report as saved or a dashboard as published unless the connected tool explicitly supports that operation and confirms it.
