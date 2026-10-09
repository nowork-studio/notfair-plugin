## Preamble (run first)

```bash
_UPD_BIN=$(ls ~/.claude/plugins/cache/nowork-studio/notfair/*/scripts/notfair-update-check.sh 2>/dev/null | head -1)
[ -n "$_UPD_BIN" ] && _UPD=$(bash "$_UPD_BIN" 2>/dev/null || true) || _UPD=""
[ -n "$_UPD" ] && echo "$_UPD" || true
```

If the output contains `UPGRADE_AVAILABLE <old> <new>`: report the available source version. Follow `/notfair:upgrade` when the user requests an update; the host's plugin manager determines which published version is available.

If the output contains `JUST_UPGRADED <old> <new>`: mention "NotFair upgraded from v{old} to v{new}" briefly, then continue.

---
