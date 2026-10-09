---
name: wordpress
description: Operate connected WordPress sites through the NotFair MCP. Use for WordPress content, posts, pages, media, comments, terms, design, settings, plugins, themes, HTML files, or approved WordPress changes on a NotFair-connected site. Not the local Application-Password CMS setup used by SEO scripts.
argument-hint: "<site, content, plugin, or WordPress change>"
---

# WordPress

Follow [`../docs/mcp-connection.md`](../docs/mcp-connection.md). Resolve `~~wordpress` to the live connection. Use its current instructions and capability descriptions to choose tools, and verify the requested site from live data. Do not infer access from Search Console, a local `.env.local` CMS setup, or another connected platform.

This skill is the first-party NotFair WordPress MCP operator (`wordpress_` tools on the universal server). `/notfair:setup-cms` remains the local Application-Password / `.env.local` path for SEO scripts against WordPress, Strapi, Contentful, or Ghost. Do not mix those credentials with this connector.

## Establish the live site

1. Confirm connected sites with a harmless read. Select only a site the connector actually returned.
2. Inspect current capabilities before promising a write. If the connector is missing or unauthorized, direct the user to connect WordPress in the selected NotFair workspace (`/manage-ads-accounts/wordpress`) and stop before claiming live access.
3. Record the site URL, selected site id, current user/role, and whether the session can mutate content, design, settings, or admin surfaces.

Reads commonly include site listing, site details, capability discovery, query, and resource get. Prefer those live descriptions over any skill-level catalog. Prefer a direct update tool over a job for a single edit.

## Read before changing

Pull only the resources needed for the question. For content edits, read the current resource and capture `expectedVersion` from that read. For a new standalone HTML file, the expected-version sentinel is the literal string `absent`.

Lead with the current state, the requested change, and whether the session's role can perform it. Admin role is required for users, settings, design, plugins, themes, core, files, extensions, and jobs. Connector self-modification through plugin management is blocked.

## Execute approved changes safely

Show the exact site, resource, current value, proposed value, risk, and rollback before acting. Obtain approval, apply once, then read back.

The connector exposes content create/update/status/delete, media, terms, comments, design, settings, plugin/theme/core admin, standalone HTML publish/delete, jobs, and change restore. Discover the exact schemas; do not treat that family list as the only allowed surface.

- Create content as draft unless publish is explicitly requested.
- Use `expectedVersion` from a prior read. For new HTML files, use `absent`.
- `requestId` must be stable when retrying the same logical action and must never be reused with changed input.
- Scripts are rejected for standalone HTML publish. Publish HTML only at exact URLs, and only with admin access.
- Prefer get-change plus restore-change over blind retries when the outcome is unknown.
- Confirm success from returned evidence or a fresh read. Report partial failures plainly.

A draft, brief, or generated HTML file is `ready_for_review`. Call a change `published` only after the live connector confirms it.
