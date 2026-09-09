---
name: meta-ads-audit
description: Meta Ads (Facebook + Instagram) account audit and business context setup. Use for account-health audits and business-context setup. Trigger on "audit my Meta ads", "audit my Facebook ads", "Meta ads audit", "set up my Meta ads", "onboard Meta", "Meta account overview", "how's my Meta account", "Meta health check", "what should I fix in my Facebook ads", or when the user is new to NotFair Meta and hasn't run an audit before.
argument-hint: "<account name or 'audit my Meta ads'>"
---

# Canonical NotFair workflow

Read [`../../meta-ads/audit/SKILL.md`](../../meta-ads/audit/SKILL.md) completely, then follow it as the active workflow. Normalize that path from the directory containing this wrapper: the canonical file is `<plugin-root>/meta-ads/audit/SKILL.md`, not `<plugin-root>/skills/meta-ads-audit/audit/SKILL.md`. Resolve every relative reference from the canonical file against `<plugin-root>/meta-ads/audit/`. If the canonical file cannot be read, stop and report the packaging error; never substitute a similarly named skill from another plugin.
