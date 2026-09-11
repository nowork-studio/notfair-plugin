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

## Proactive reminders (SessionStart hook + calendar)

Users shouldn't have to remember to come back. Two complementary mechanisms:

1. **SessionStart hook** — `bin/notfair-change-watch` scans every account's `change-log.json` and prints any entry whose `reviewAfter` has passed and `reviewed == false`. Wire it in `~/.claude/settings.json`:
   ```json
   {
     "hooks": {
       "SessionStart": [
         { "hooks": [ { "type": "command", "command": "/home/user/notfair/bin/notfair-change-watch" } ] }
       ]
     }
   }
   ```
   When the user opens a new Claude session, any pending reviews appear as session context — the assistant can proactively offer to run a scoped `/google-ads-audit`.

2. **Calendar (.ics) reminder** — after logging a change, offer to generate a calendar invite the user can drop into any calendar app:
   ```
   notfair-change-watch ics <account_id> <change_id> > ~/review-<change_id>.ics
   ```
   The .ics file includes a 9-hour-before alarm so the user gets notified on review day. Cross-platform, no cloud dependency, works offline.
