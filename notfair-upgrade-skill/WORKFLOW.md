---
name: upgrade
argument-hint: "<or just run '/notfair:upgrade'>"
description: >
  Upgrade the NotFair plugin to the latest version. Updates the marketplace repo,
  installs the new version to the plugin cache, and updates installed_plugins.json.
  Use when asked to "upgrade notfair", "update notfair", or "get latest version".
  Also handles inline upgrade prompts when a skill detects UPGRADE_AVAILABLE at startup.
---

# /notfair:upgrade

Update NotFair through the current host's plugin manager, then show what changed.
Retain the installed plugin identity, scope, OAuth connection, and user settings.
Follow the host's permission prompts; this skill does not pre-approve shell access.

## Detect the installation

Identify the host and the actual installed NotFair entry before running an update.
Read its version and installation source if the host exposes them. A workspace
checkout or development symlink is source-controlled: do not replace it with a
marketplace copy, reset its branch, or delete local changes.

## Update with the host

- **Claude Code marketplace install (`notfair@nowork-studio`)**: run
  `claude plugin update notfair@nowork-studio`. If the host requires a marketplace
  refresh, follow its returned instructions and retry the update.
- **Claude directory install (`notfair@synced`, Claude web, desktop, or Cowork)**:
  use the installed plugin's update controls. Directory versions are reviewed and
  can lag the source repository; don't overwrite them with unreviewed files.
- **Codex**: use the documented native update flow:
  `codex plugin marketplace upgrade nowork-studio --json`, then
  `codex plugin add notfair@nowork-studio --json`.
- **Cursor, Gemini CLI, or another host**: use that host's current native update
  instructions. Inspect its help or official documentation if the command is
  unknown; do not guess cache paths or edit host registry files.
- **Workspace checkout**: inspect Git status and the configured remote first.
  Fetch the remote and report any pending update. Preserve local work; if the
  checkout is clean and a fast-forward is available, use `git pull --ff-only`.
  If it diverges, explain the conflict and ask for the desired resolution.

If the update fails, report the host's error and keep the working installation.
Do not edit `installed_plugins.json`, reset a marketplace checkout, or delete old
cache versions manually. The host owns installation and cache management.

## Verify and report

Read the installed version again through the host. An update command succeeding
is insufficient if the installed version cannot be confirmed. If the host says
no newer version is available, state that without claiming it matches the latest
GitHub commit. A development checkout is not proof of a published release.

Read the installed `CHANGELOG.md` and summarize the user-facing changes since the
old version. Start a fresh host session or reload plugins as the host directs.
Retain one NotFair MCP connection and reauthorize only if the host requests it;
follow `../docs/mcp-connection.md`. Continue the user's original workflow after
the updated installation is confirmed.
