#!/usr/bin/env bash
# notfair-config — read/write ~/.toprank/config.yaml
#
# Usage:
#   notfair-config get <key>          — read a config value
#   notfair-config set <key> <value>  — write a config value
#   notfair-config list               — show all config
#
# Env overrides (for testing; name retained from the toprank → notfair rename):
#   TOPRANK_STATE_DIR  — override ~/.toprank state directory
set -euo pipefail

STATE_DIR="${TOPRANK_STATE_DIR:-$HOME/.toprank}"
CONFIG_FILE="$STATE_DIR/config.yaml"

case "${1:-}" in
  get)
    KEY="${2:?Usage: notfair-config get <key>}"
    grep -E "^${KEY}:" "$CONFIG_FILE" 2>/dev/null | tail -1 | awk '{print $2}' | tr -d '[:space:]' || true
    ;;
  set)
    KEY="${2:?Usage: notfair-config set <key> <value>}"
    VALUE="${3:?Usage: notfair-config set <key> <value>}"
    mkdir -p "$STATE_DIR"
    if grep -qE "^${KEY}:" "$CONFIG_FILE" 2>/dev/null; then
      _tmpfile="$(mktemp "${CONFIG_FILE}.XXXXXX")"
      sed "s/^${KEY}:.*/${KEY}: ${VALUE}/" "$CONFIG_FILE" > "$_tmpfile" && mv "$_tmpfile" "$CONFIG_FILE"
    else
      echo "${KEY}: ${VALUE}" >> "$CONFIG_FILE"
    fi
    ;;
  list)
    cat "$CONFIG_FILE" 2>/dev/null || true
    ;;
  *)
    echo "Usage: notfair-config {get|set|list} [key] [value]"
    exit 1
    ;;
esac
