# Host installation guidance

NotFair uses native host plugin controls rather than bundled installer programs.
All hosts load the same `skills/` entry points, category workflows, and OAuth MCP
connection. See [installation](../INSTALL_FOR_AGENTS.md) and
[connection guidance](../docs/mcp-connection.md).

Claude Code reads `.claude-plugin/plugin.json`; Codex reads
`.codex-plugin/plugin.json`; Cursor reads `.cursor-plugin/plugin.json`; portable
hosts use `plugin.json` and `mcp.json`; Gemini CLI reads `gemini-extension.json`;
and workspace-based agents start from `AGENTS.md`.

When documenting another host, reuse these sources and its native installation
flow. Do not add local install programs or duplicate skill sources. If a host
must write guidance to a user-edited file, preserve their edits with the managed
block fences documented in `AGENTS.md`.
