# Shared declarative release verification — 0.27.21

## Scope

Remove the 53 tracked Python/shell program files, local dependency/test files,
retired helper-dependent skills, unsupported icon source and source version marker,
and the separate Directory distribution builder. Promote reviewed workflow
variants into the shared source on `main`; preserve all supported host manifests
and one NotFair OAuth MCP connection.

## Package checks

- 45 registered entry points have unique names, matching canonical workflow
  frontmatter, and entries in the resolver and README.
- All host plugin manifests and marketplace versions are 0.27.21. The remote
  MCP registry metadata is independently versioned.
- The package has 222 regular files and no Python/shell files, executable modes,
  shebangs, NUL bytes, symbolic links, submodules, or unsupported file extensions.
- JSON and YAML parse. Skill/workflow frontmatter uses only text `name` and
  `description` fields. Active relative Markdown links remain inside the package
  and resolve; two historical CMO links in the changelog predate this change and
  are not part of an active workflow.
- Claude plugin and marketplace manifest validation pass. `git diff --check`
  passes. The unchanged PNG icon is 512 by 512 pixels.

Checks run with an external local package validator so the validator itself is
not shipped inside the plugin. The removed script unit suite no longer applies
to runtime code in this release. Declarative eval cases remain beside workflows;
this report does not claim new authenticated account-operation tests.

## Destination checks

Validate the exact merged `main` commit in the existing Claude submission, then
record the actual scan/review state. A local package check or portal validation
is not proof of completed review or publication.
