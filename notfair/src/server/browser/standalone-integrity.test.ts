import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { findPlaywrightDirsMissingBrowsersJson } from "../../../scripts/lib/standalone-integrity.mjs";

function pkg(root: string, rel: string, withBrowsersJson: boolean) {
  const dir = join(root, rel);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), "{}");
  if (withBrowsersJson) writeFileSync(join(dir, "browsers.json"), "{}");
  return dir;
}

describe("standalone package integrity", () => {
  let root: string;
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("flags playwright-core copies without browsers.json, including hashed Turbopack aliases", () => {
    root = mkdtempSync(join(tmpdir(), "notfair-standalone-"));
    pkg(root, "node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core", true);
    const alias = pkg(root, ".next/node_modules/playwright-core-b643089f39648130", false);

    expect(findPlaywrightDirsMissingBrowsersJson(root)).toEqual([alias]);
  });

  it("passes a tree where every playwright-core copy ships browsers.json", () => {
    root = mkdtempSync(join(tmpdir(), "notfair-standalone-"));
    pkg(root, "node_modules/playwright-core", true);
    pkg(root, ".next/node_modules/playwright-core-b643089f39648130", true);

    expect(findPlaywrightDirsMissingBrowsersJson(root)).toEqual([]);
  });
});
