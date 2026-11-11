# Changelog

All notable changes to the NotFair plugin (formerly `toprank`) will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---


## [Unreleased]

## [0.27.25] — 2026-11-11

- Reuse public evidence across SEO and GEO checks; continue when Search Console
  access is unavailable without inventing traffic, indexing, or click forecasts.
- Distinguish URL overlap from harmful duplication, temporary redirects from
  canonical moves, and crawler eligibility from observed Google indexing.
- Prioritize verifiable product and setup facts over numeric evidence quotas on
  product pages.

## [0.27.24] — 2026-11-10

### Fixed

- Separate valid Schema.org markup from current Google rich result eligibility. Stop flagging missing FAQ, HowTo, and sitelinks search box markup as Google Search gaps.
- Check AI search crawler access on live URLs and distinguish search crawlers, training controls, and user-triggered fetches.

### Added

- Add repeatable GEO measurement for buyer questions, brand mentions, recommendations, citations, and fact checks, with support for supplied Bing AI Performance and Search Console Generative AI reports.

## [0.27.23] — 2026-11-09

### Fixed

- Keep recent release notes in the shared plugin and link older local-tool history to its existing Git revision, removing retired credential/setup command examples from the installed bundle.

## [0.27.22] — 2026-11-09

### Fixed

- Retire obsolete credential-variable setup text for the removed local publisher from the historical changelog. The shared plugin still ships no local programs or credential readers.

## [0.27.21] — 2026-11-09

### Changed

- Use one shared, declarative plugin from `main` for all hosts and the Claude Directory.
- Remove bundled Python/shell tools, their test runners and dependency files, and the separate Directory distribution builder.
- Keep 45 skills and the OAuth MCP connection. Adapt site/page SEO audits, broken-link checks, and content planning to connected capabilities, public pages, or supplied reports, with explicit coverage limits.
- Remove local CMS credential setup, Gemini CLI review, and the helper-based updater. Direct Strapi/Contentful/Ghost integrations, automated local crawling, the localhost calendar viewer, and shell reminders are no longer bundled; use native host plugin updates.
- Restrict workflow frontmatter to descriptive fields, remove unsupported source file types, and synchronize all host plugin versions.

## [0.27.20] — 2026-11-09

### Fixed

- Keep the extensionless source version marker out of the Claude Directory bundle; its version remains declared in the manifest.

## [0.27.19] — 2026-11-09

### Changed

- Add a separate declarative Claude Directory distribution for community plugin
  requirements. The full multi-host plugin retains its local tools; the Directory
  release uses connectors and supplied evidence.

## [0.27.18] — 2026-11-06

### Changed

- Document Grok Bot and Cursor marketplace setup, OAuth prerequisites, and read-only reviewer cases for the xAI submission. Distinguish a submitted listing from marketplace approval.
- Correct the Cursor manifest publisher capitalization to NotFair and keep all host and registry versions aligned.

## Earlier releases

Release notes through 0.27.17, including the former local-tool setup details, are
preserved in the [versioned historical changelog](https://github.com/nowork-studio/notfair-plugin/blob/f70e36082a50db00c18a7752ba97ffa1052d3472/CHANGELOG.md).
Those programs and their setup instructions are retired from the shared plugin.
The current package behavior and removed capabilities are documented in the
[README](README.md).
