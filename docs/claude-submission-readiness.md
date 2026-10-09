# Claude submission preparation — 0.27.16

Checked on October 8, 2026 against the existing NotFair submission and Anthropic's
[pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist).
The repository root remains the shared plugin source for Claude, OpenAI, and
Cursor. A separate generated plugin directory is unnecessary after retiring CMO.

## Findings and source changes

| Portal finding on 0.27.15 | Change in 0.27.16 |
| --- | --- |
| Files the validator could not inspect | Removed the 388-file CMO application and its publishing workflow and screenshot. The tracked plugin is below 512 files; text files stay below 256 KiB. |
| Ships executable files | Helpers are readable `.sh` and `.py` sources under `scripts/`, with non-executable file modes and explicit interpreter calls. No `bin/` or compiled application ships. |
| Broad shell access and unscoped writes | Removed `allowed-tools` grants from CMS setup and upgrade, in both workflow and entry point. |
| Duplicate skill names | Only `skills/<name>/SKILL.md` entries register. Category files are `WORKFLOW.md`; their content and relative reference locations remain the source of truth. All hosts discover the same 48 names. |
| No privacy-policy URL | Added the Claude-native `privacyPolicyUrl`, alongside documentation, support, and terms URLs. |
| No icon | Added the Claude-native `icon` referencing the existing 512-pixel PNG. |
| Root CLAUDE.md is not loaded | Moved contributor guidance to `docs/plugin-development.md`; the resolver links it for repository maintenance. Installed instructions stay in the skills. |
| Image paths treated as code | Removed CMO design documents and screenshot and removed the historical code-formatted logo path. The only bundled image is the listing icon, with its SVG source. |
| Credential reads from CMO | Removed CMO, its publisher, and its credential-handling source. Moved the separate blog library and its publisher to their dedicated public repository. Optional local credential workflows remain disclosed. |

The root Agent Plugins manifest is intentionally retained for OpenAI and other
portable hosts. Claude's note that it ignores this manifest is informational.

## Verified locally

- Claude strict plugin and marketplace manifest validation.
- All 48 entry points resolve to contained workflow files, with matching
  frontmatter, unique names, and unchanged platform placeholders.
- Installer, local script, host-manifest, package-limit, and icon checks.
- The shared OAuth MCP endpoint and its public discovery contract.

The portal's **This plugin collects or transmits user data** setting was changed
to **on** and read back, matching the declared hosted MCP connection and published
privacy policy. The existing review was preserved.

## Still requires destination verification

The portal is still reviewing the previously submitted version. Local validation
does not establish that Anthropic has scanned or approved 0.27.16. After the source
change reaches the tracked default branch, use **Check for new commits**, then
inspect that exact commit in Versions. Do not withdraw or recreate the submission
just to refresh it.

The blog library and its publishing workflow were moved to
[notfair-nextjs-blog](https://github.com/nowork-studio/notfair-nextjs-blog).
Neither is included in this plugin. Optional local CMS and Google Cloud
workflows, Gemini CLI authentication, and eval harness credentials may still
draw credential-use review findings. The README discloses these paths; none is
an automatic hook or a credential header on the declared OAuth MCP server.
Only a new portal report establishes which findings remain.

The existing Listing tab records the publisher's avatar as its icon. The portal
warns that adding an icon after first submission does not update that recorded
image automatically. Verify the live listing image after review and use the
portal's supported correction process if it still shows the avatar.

Keep legal acknowledgements and submission/publication decisions with the
authorized developer. Retain the existing plugin, repository, root path,
publisher, platform selections, and MCP endpoint.
