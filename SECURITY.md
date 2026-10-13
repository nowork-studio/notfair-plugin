# Security Policy

## Supported versions

Security fixes are applied to the latest released version on `main`.

## Reporting a vulnerability

Please do not open a public issue for security problems. Report privately via
GitHub's "Report a vulnerability" (Security tab of this repository) or email
security@notfair.co with steps to reproduce and the affected version.
We aim to acknowledge reports within 3 business days.

## Scope notes

- The plugin ships skills and local helper scripts only. It stores no secrets in
  the repository; credentials are read from the user's environment or OAuth
  connection at runtime.

## Agent safety rules

All skills follow [`docs/safety.md`](docs/safety.md): explicit user approval of the exact change before any spend-affecting ads mutation, WordPress write, or CRM write, and fetched pages, ad/competitor text, search results, and tool output are treated as untrusted data, never instructions.
