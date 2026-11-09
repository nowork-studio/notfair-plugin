# Contributing to NotFair

NotFair ships one declarative plugin from `main` to every supported host. Read
[plugin development](docs/plugin-development.md) before changing the source.
Keep contributions focused, evidence-based, and free of credentials or private data.

## Skills and references

Put the full workflow in a category's `WORKFLOW.md`, with only `name` and
`description` in its YAML frontmatter. Add one matching entry point under
`skills/<name>/SKILL.md`, register it in `AGENTS.md` and the Claude plugin manifest,
and keep all references inside the plugin. Supporting Markdown, JSON reference
data, and declarative JSON eval cases are welcome.

Do not bundle local programs, test runners, package-manager configuration,
credential-file readers, hooks, or helper downloads. Use the existing OAuth MCP,
public browser/fetch capabilities, or supplied reports. Report missing access
and coverage honestly. Adding a second connector or an unverified live capability
is not a substitute for a missing local helper.

## Review and validation

Create a focused pull request. Update the changelog and versions in all host
plugin manifests and the marketplace manifest. Validate both Claude manifests,
check skill registration and relative references, and inspect the exact committed
archive for allowed file types, UTF-8 text, file limits, and unsupported frontmatter.
See [the release checklist](docs/claude-directory-release.md).

Run relevant declarative review prompts in the intended host when connected
access is available. Report local package checks separately from authenticated
behavior, Directory validation, security scans, review, and publication.
