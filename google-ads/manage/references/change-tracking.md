# Change Tracking

After every successful write operation, log the change to `{data_dir}/change-log.json`.

## Change log entry format

Append to the `changes` array:

```json
{
  "id": "chg_<unix_timestamp_ms>",
  "timestamp": "<ISO 8601>",
  "action": "<action_type>",
  "summary": "<specific one-liner, e.g. 'Paused 5 non-converting keywords in Example Service - Local saving ~$340/month'>",
  "details": {
    "campaignId": "<if applicable>",
    "campaignName": "<if applicable>",
    "affectedEntities": ["<IDs>"],
    "entityNames": ["<keyword text or campaign names>"]
  },
  "beforeSnapshot": {
    "metrics": { "spend30d": 0, "clicks30d": 0, "conversions30d": 0, "cpa30d": 0, "ctr30d": 0 },
    "note": "Metrics for affected entities at time of change"
  },
  "changeIds": ["<changeId(s) returned by write tool>"],
  "reviewAfter": "<ISO 8601 based on conversion maturity and the decision rule>",
  "reviewWindow": "<date range or conversion-cycle rule>",
  "reviewed": false,
  "reviewResult": null
}
```

## Rules

- **Capture before-metrics** from data already in context. If none available: `"beforeSnapshot": { "metrics": null, "note": "No pre-change metrics" }`.
- **Review windows:** Choose a window from the conversion cycle, reporting lag, expected effect, experiment design, and spend risk. Keep 3/7/14-day checks as operational monitoring when useful, but do not call a winner until the primary outcome is mature.
- **Tell the user:** "Change logged. I’ll review safety and delivery on [early date], then judge the primary outcome after [maturity rule/date]."
- **Max 200 entries** (remove oldest reviewed first).
- **Group related writes** in one session as a single entry.

## Follow-up

Include review dates and the maturity rule in the change summary. A written
follow-up date does not create a reminder. Use an available scheduling capability
only when the user requests a reminder, and verify its saved state. This release
adds no local hooks or calendar helper programs.
