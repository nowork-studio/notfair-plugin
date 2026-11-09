# Claude Directory community release

Anthropic's portal rejected the full 0.27.18 bundle with
`LOCAL_CODE_FILE_TYPE` and `LOCAL_CODE_FRONTMATTER_KEY`: local programs and
frontmatter outside its community allowlist are accepted only from organizations
Anthropic has marked Verified. The full multi-host plugin intentionally includes
local tools, so it cannot be the community Directory artifact.

## Build

Run from a clean, reviewed source commit:

```text
python3 scripts/build-claude-directory.py /absolute/empty/output
claude plugin validate /absolute/empty/output/.claude-plugin/plugin.json
```

The builder uses an explicit file allowlist and reviewed templates in
`distribution/claude/`. It emits 45 skill entry points, their canonical Markdown
workflows and reference data, one PNG icon, and the OAuth MCP declaration. It
removes unsupported frontmatter instead of granting tools. It does not rename
programs to allowed extensions or tell Claude to download omitted programs.
Build guards reject unresolved links and leftover local-helper instructions.

The four workflows that depended on local programs have Directory variants:
site audit, page audit, broken-link checking, and content planning. They use
available public browser/fetch tools, connected capabilities, or supplied reports,
and state the actual coverage. Local CMS setup, Gemini CLI review, and the shell
updater are omitted. The full plugin on `main` keeps those capabilities.

## Release and submission

The existing repository-root submission must track `codex/claude-directory`,
whose tree is the generated output, rather than `main`. Keep source maintenance
and generated releases separate: merge the builder/templates to `main`, build
from that exact commit, validate, then commit the generated tree to the release
branch without forcing over another publisher's changes. Do not upload the full
source checkout as the Directory bundle.

The portal locks the tracked branch while a submission is under review. To change
it, reopen the existing repository-root submission through the portal's supported
withdraw/reopen flow, preserving repository, path, organization, contact, and
listing identity. Inspect the current form and legal acknowledgements before
submitting; have the authorized developer accept any required legal agreement.
Set the data-transmission disclosure to yes for the remote MCP connection.

Validate the exact generated commit in the portal. Local validation, a requested
scan, submission for review, and publication are different outcomes. Verify the
actual saved commit and scan/review state before reporting completion.
