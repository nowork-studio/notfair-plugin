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
