# Shared plugin release checklist

Every host and the Claude Directory use the repository root on `main`. There is
no generated distribution or separate release branch. Version 0.27.21 removes the
local programs that the Directory refused for a community organization, and uses
only descriptive skill frontmatter.

## Package review

- Confirm all host plugin manifests and marketplace versions match.
- Confirm exactly 45 registered skill entry points, unique names, matching
  workflow frontmatter, and contained relative references.
- Keep only Markdown, UTF-8 text, JSON, YAML, and permitted images. Do not include
  programs, shebang files, NUL bytes, package-manager configuration, links to files
  outside the plugin, symbolic links, submodules, OS metadata, or helper downloads.
- Keep files below 256 KiB, the icon below 2 MiB, and the package below 512 files.
- Validate `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` with
  `claude plugin validate`. Check the exact committed archive as well as the
  working tree. A README, license, `.gitignore`, and PNG icon are retained.
- Exercise relevant declarative eval cases in the intended host. Use only
  authorized test accounts for live reads or approved writes. Record unavailable
  access as a gap rather than a passed end-to-end check.

## Changed functionality

Connected ads, Search Console, GA4, WordPress, and GoHighLevel workflows remain.
Site/page audits, link reviews, and content planning use available connectors,
public browser/fetch capabilities, or supplied reports. State actual coverage.
Direct CMS credentials and Strapi/Contentful/Ghost local integrations, the Gemini
CLI review skill, scripted crawling, the local calendar viewer, and shell update
or reminder helpers are removed. Update through native host plugin controls.

## Directory submission

Preserve repository, repository-root path, organization, contact, and listing
identity. Track `main`. If the portal locks a previously selected branch during
review, use its supported withdraw/reopen flow for the existing submission.
Validate the exact new commit and complete the data-handling declarations. Obtain
explicit developer approval for binding legal acknowledgements before accepting
them. Submit for review, then verify the saved branch, commit, and actual scan or
review state. Submission, a passed scan, approval, and publication are separate.
