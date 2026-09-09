---
name: google-ads-landing
description: Score and diagnose Google Ads landing pages. Use when asked to audit a landing page, check landing page quality, diagnose high-CTR but low-conversion-rate ad groups, improve Quality Score's Landing Page Experience component, or compare an ad group's messaging against its landing page. Trigger on "landing page audit", "landing page score", "landing page quality", "why is my conversion rate low", "LPX", "landing page experience", "ad to page match", or when `/google-ads-audit` surfaces a high-CTR / low-CVR ad group.
argument-hint: "<landing page URL or ad group name>"
---

# Canonical NotFair workflow

Read [`../../google-ads/landing/SKILL.md`](../../google-ads/landing/SKILL.md) completely, then follow it as the active workflow. Normalize that path from the directory containing this wrapper: the canonical file is `<plugin-root>/google-ads/landing/SKILL.md`, not `<plugin-root>/skills/google-ads-landing/landing/SKILL.md`. Resolve every relative reference from the canonical file against `<plugin-root>/google-ads/landing/`. If the canonical file cannot be read, stop and report the packaging error; never substitute a similarly named skill from another plugin.
