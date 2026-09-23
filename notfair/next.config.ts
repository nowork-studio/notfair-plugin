import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "keytar"],
  // The CLI opens the portal on 127.0.0.1, but the Next dev server's origin is
  // localhost. Without this, dev resources are blocked cross-origin and the
  // client never hydrates (blank shell). Allow the loopback IP explicitly.
  allowedDevOrigins: ["127.0.0.1"],
  // pnpm + standalone output drops transitive deps that Next.js's own
  // compiled chunks require at runtime (e.g. @swc/helpers, @next/env).
  // Force-include them so the published tarball boots. (better-sqlite3's
  // native loader `bindings` is present but unresolvable in the standalone
  // tree; scripts/copy-standalone-assets.mjs hoists it to a resolvable path.)
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/@swc/helpers/**/*",
      "./node_modules/@next/env/**/*",
      // playwright-core reads browsers.json at runtime via require(); file
      // tracing only follows code, so the workspace browser fails to launch
      // from the published tarball without it.
      "./node_modules/playwright-core/browsers.json",
    ],
  },
  // typedRoutes intentionally disabled in V1 — our nav table builds Link hrefs
  // dynamically. Re-enable once the route map settles and Link wrappers can
  // be properly typed.
};

export default config;
