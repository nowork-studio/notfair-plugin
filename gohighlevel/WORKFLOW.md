---
name: gohighlevel
description: Operate connected GoHighLevel CRM accounts through the NotFair MCP. Use for GoHighLevel, HighLevel, GHL contacts, conversations, opportunities, calendars, pipelines, tags, tasks, forms, invoices, products, or approved CRM changes.
argument-hint: "<location, contact, opportunity, or GHL question>"
---

# GoHighLevel

Follow [`../docs/mcp-connection.md`](../docs/mcp-connection.md). Resolve `~~gohighlevel` to the live connection. Use its current instructions and capability descriptions to choose tools, and verify the requested location from live data. Do not infer access from an ad platform or another connected CRM.

This skill is revenue-ops on the connected HighLevel account: contacts, conversations, opportunities, and calendar. Make writes only when the user explicitly requested them. Older clients may still reach a dedicated `/api/mcp/gohighlevel` route; do not add that as a second plugin MCP server. Authentication uses a NotFair PAT on the connect page; one PAT per HighLevel connection. If the connector is missing, unauthorized, or read-only for a requested write, direct the user to reconnect with the needed scopes and stop.

## Establish the live location

1. Confirm connected locations with a harmless read. Agency (Company) connections must pass an explicit `locationId` for per-location tools; Location connections may omit it.
2. Prefer specific typed tools over the generic request escape hatch. That request surface is read-only GET.
3. Record the account currency, location, pipeline or calendar context, and whether the session can mutate.

Core reads include contacts, conversations, opportunities, calendar events, and locations, plus metadata for users, pipelines, calendars, custom fields, tags, and tasks. Intake reads include forms, surveys, invoices, transactions, and products. Discover the exact schemas; do not treat any skill-level list as the only allowed surface.

## Read before changing

Resolve identifiers before creating records so duplicates are not introduced. List custom fields before interpreting custom-field ids. Money is in account currency; cent values are often integers. Pagination cursors vary (`startAfterId`, `startAfterDate`, `startAfter`). Use ISO 8601 datetimes.

Lead with the current contact, conversation, opportunity, or calendar state and the smallest user-requested change.

## Execute approved changes safely

Show the exact location, object, current value, proposed value, risk, and rollback before acting. Obtain approval, apply once, then read back.

Writes commonly include contact create/upsert/update, opportunity create/update, calendar appointment create/update/delete, tag create, and contact-task create. Choose from the live capability descriptions.

- Do not write unless the user explicitly asked for that mutation.
- Resolve existing ids first to avoid duplicate contacts, opportunities, or appointments.
- After an approved mutation, use returned evidence or a fresh read to confirm the resulting state. Report partial failures plainly.

A proposed CRM change remains `ready_for_review` until the live connector confirms it.
