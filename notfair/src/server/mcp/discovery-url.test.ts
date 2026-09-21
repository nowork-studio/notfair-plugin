import { describe, expect, it } from "vitest";

import { deriveDiscoveryUrl, normalizeResourceUrl } from "./discovery-url";

describe("normalizeResourceUrl", () => {
  it("lowercases scheme and host, preserves path case", () => {
    expect(normalizeResourceUrl("HTTPS://NotFair.CO/Api/Mcp")).toBe(
      "https://notfair.co/Api/Mcp",
    );
  });

  it("drops trailing slashes from the path", () => {
    expect(normalizeResourceUrl("https://notfair.co/api/mcp///")).toBe(
      "https://notfair.co/api/mcp",
    );
  });

  it("drops the default https port 443", () => {
    expect(normalizeResourceUrl("https://notfair.co:443/api")).toBe(
      "https://notfair.co/api",
    );
  });

  it("drops the default http port 80", () => {
    expect(normalizeResourceUrl("http://notfair.co:80/api")).toBe(
      "http://notfair.co/api",
    );
  });

  it("keeps a non-default port", () => {
    expect(normalizeResourceUrl("http://127.0.0.1:3326/api/mcp/goals")).toBe(
      "http://127.0.0.1:3326/api/mcp/goals",
    );
  });

  it("root-only URLs normalize to origin with no trailing slash", () => {
    expect(normalizeResourceUrl("https://notfair.co/")).toBe("https://notfair.co");
  });

  it("falls back to trim + lowercase + slash-strip for unparseable input", () => {
    expect(normalizeResourceUrl("  Not A URL// ")).toBe("not a url");
  });
});

describe("deriveDiscoveryUrl", () => {
  it("inserts the well-known suffix between origin and path", () => {
    expect(deriveDiscoveryUrl("https://notfair.co/api/mcp/notfair")).toBe(
      "https://notfair.co/.well-known/oauth-protected-resource/api/mcp/notfair",
    );
  });

  it("root resources get the suffix with no trailing path", () => {
    expect(deriveDiscoveryUrl("https://mcp.example.com/")).toBe(
      "https://mcp.example.com/.well-known/oauth-protected-resource",
    );
  });

  it("strips trailing slashes from a non-root path", () => {
    expect(deriveDiscoveryUrl("https://mcp.example.com/v1/")).toBe(
      "https://mcp.example.com/.well-known/oauth-protected-resource/v1",
    );
  });

  it("supports plain http", () => {
    expect(deriveDiscoveryUrl("http://127.0.0.1:9000/mcp")).toBe(
      "http://127.0.0.1:9000/.well-known/oauth-protected-resource/mcp",
    );
  });

  it("returns null for malformed input", () => {
    expect(deriveDiscoveryUrl("not a url")).toBeNull();
  });

  it("returns null for non-HTTP(S) schemes", () => {
    expect(deriveDiscoveryUrl("ftp://example.com/mcp")).toBeNull();
    expect(deriveDiscoveryUrl("file:///tmp/mcp")).toBeNull();
  });
});
