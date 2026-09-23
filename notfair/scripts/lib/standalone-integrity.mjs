// Runtime files that Next.js output file tracing cannot see (they are read via
// require()/fs at runtime, not imported), but that the standalone tarball
// needs. Checked after scripts/copy-standalone-assets.mjs builds the tree so a
// broken package fails the build instead of failing on a user's machine.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Return every playwright-core package directory under `standaloneRoot`
 * (including pnpm store copies and Turbopack's hashed `.next/node_modules`
 * aliases) that is missing `browsers.json`.
 */
export function findPlaywrightDirsMissingBrowsersJson(standaloneRoot) {
  const missing = [];
  const walk = (dir, depth) => {
    if (depth > 8 || !existsSync(dir)) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      if (entry.name === "playwright-core" || entry.name.startsWith("playwright-core-")) {
        if (existsSync(join(full, "package.json")) && !existsSync(join(full, "browsers.json"))) {
          missing.push(full);
        }
        continue;
      }
      walk(full, depth + 1);
    }
  };
  walk(standaloneRoot, 0);
  return missing;
}
