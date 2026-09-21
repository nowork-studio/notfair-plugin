import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMcpCatalog: vi.fn(),
  mcpSpecByKey: vi.fn(),
  findMcpToken: vi.fn(),
}));

vi.mock("@/server/mcp-catalog", () => ({
  getMcpCatalog: mocks.getMcpCatalog,
  mcpSpecByKey: mocks.mcpSpecByKey,
}));
vi.mock("@/server/mcp/tokens", () => ({
  findMcpToken: mocks.findMcpToken,
}));

import {
  catalogKeysSharingResource,
  findCatalogMcpToken,
} from "./catalog-token";

const CANONICAL = "https://notfair.co/api/mcp/notfair";
const STRIPE = "https://mcp.stripe.com/mcp";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getMcpCatalog.mockReturnValue([
    { key: "notfair-googleads", resource_url: CANONICAL },
    { key: "notfair-metaads", resource_url: CANONICAL },
    { key: "stripe", resource_url: STRIPE },
  ]);
  mocks.mcpSpecByKey.mockImplementation((_slug: string, key: string) =>
    mocks.getMcpCatalog().find((entry: { key: string }) => entry.key === key),
  );
  mocks.findMcpToken.mockReturnValue(null);
});

describe("findCatalogMcpToken", () => {
  it("returns the direct token when present", () => {
    mocks.findMcpToken.mockImplementation((_slug: string, key: string) =>
      key === "notfair-metaads" ? { id: "tok-m" } : null,
    );
    expect(findCatalogMcpToken("proj", "notfair-metaads")).toEqual({ id: "tok-m" });
  });

  it("falls back to a sibling catalog key with the same resource URL", () => {
    mocks.findMcpToken.mockImplementation((_slug: string, key: string) =>
      key === "notfair-googleads" ? { id: "tok-g" } : null,
    );
    expect(findCatalogMcpToken("proj", "notfair-metaads")).toEqual({ id: "tok-g" });
  });

  it("does not reuse a token from a different resource URL", () => {
    mocks.findMcpToken.mockImplementation((_slug: string, key: string) =>
      key === "stripe" ? { id: "tok-s" } : null,
    );
    expect(findCatalogMcpToken("proj", "notfair-googleads")).toBeNull();
  });
});

describe("catalogKeysSharingResource", () => {
  it("returns every catalog key on the same resource, including itself", () => {
    expect(catalogKeysSharingResource("proj", "notfair-googleads")).toEqual([
      "notfair-googleads",
      "notfair-metaads",
    ]);
  });

  it("returns the requested key when the spec is unknown", () => {
    mocks.mcpSpecByKey.mockReturnValue(undefined);
    expect(catalogKeysSharingResource("proj", "missing")).toEqual(["missing"]);
  });
});
