# Claude submission preparation — 0.27.22

The full 0.27.18 plugin was refused by Directory policy because the community
organization was not permitted to ship local programs or unsupported skill
frontmatter (`LOCAL_CODE_FILE_TYPE` and `LOCAL_CODE_FRONTMATTER_KEY`). The security
scan itself passed. Version 0.27.21 removes those programs from the shared `main`
release and narrows frontmatter to `name` and `description`.

The plugin retains 45 advertising, analytics, SEO, content, WordPress, and CRM
skills and one remote OAuth MCP connection. SEO and planning workflows use
available connectors, public page inspection, and supplied reports. They do not
install removed helpers or claim whole-site coverage from sampled inspection.

There is one shared source release; the temporary generated Directory branch is
retired. See [the release checklist](claude-directory-release.md) for the package
contract and portal procedure, and [connection guidance](mcp-connection.md) for
OAuth setup and platform access.

Local checks and portal validation do not establish security-scan acceptance or
publication. Verify the exact `main` commit in the existing submission and report
its actual state after resubmission. The portal's data-transmission declaration
must reflect the remote MCP connection and published privacy policy.

Version 0.27.22 also removes obsolete publisher credential-variable setup from
the historical changelog after the portal flagged that text for manual review.
There is no corresponding publisher or credential reader in the shared release.
