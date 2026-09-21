import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMcpToken: vi.fn(),
  upsertMcpToken: vi.fn(),
  deleteMcpToken: vi.fn(),
  mcpSpecByKey: vi.fn(),
  mcpRpcAutoRefresh: vi.fn(),
  getCachedProbe: vi.fn(),
  setCachedProbe: vi.fn(),
  invalidateProbe: vi.fn(),
  findCatalogMcpToken: vi.fn(),
  catalogKeysSharingResource: vi.fn(),
}));

vi.mock("./tokens", () => ({
  findMcpToken: mocks.findMcpToken,
  upsertMcpToken: mocks.upsertMcpToken,
  deleteMcpToken: mocks.deleteMcpToken,
}));
vi.mock("@/server/mcp-catalog", () => ({
  mcpSpecByKey: mocks.mcpSpecByKey,
}));
vi.mock("./catalog-token", () => ({
  findCatalogMcpToken: mocks.findCatalogMcpToken,
  catalogKeysSharingResource: mocks.catalogKeysSharingResource,
}));
vi.mock("./rpc", () => ({
  mcpRpcAutoRefresh: mocks.mcpRpcAutoRefresh,
}));
vi.mock("./probe-cache", () => ({
  getCachedProbe: mocks.getCachedProbe,
  setCachedProbe: mocks.setCachedProbe,
  invalidateProbe: mocks.invalidateProbe,
}));

import { disconnectMcp, getMcpStatus, setMcpBearer } from "./state";

const SPEC = { resource_url: "https://srv/mcp", key: "notfair-googleads" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mcpSpecByKey.mockReturnValue(SPEC);
  mocks.findMcpToken.mockReturnValue({ id: "tok-1" });
  mocks.findCatalogMcpToken.mockReturnValue({ id: "tok-1" });
  mocks.catalogKeysSharingResource.mockImplementation((_slug: string, key: string) => [key]);
  mocks.getCachedProbe.mockReturnValue(null);
});

describe("getMcpStatus short-circuits", () => {
  it("returns not_configured when no spec", async () => {
    mocks.mcpSpecByKey.mockReturnValue(undefined);
    expect(await getMcpStatus("p", "k")).toEqual({ state: "not_configured" });
  });

  it("returns not_configured when no token", async () => {
    mocks.findCatalogMcpToken.mockReturnValue(null);
    expect(await getMcpStatus("p", "k")).toEqual({ state: "not_configured" });
  });

  it("returns the cached probe without hitting rpc", async () => {
    const cached = { state: "connected" as const, url: "u", tools_count: null, last_checked_at: "t" };
    mocks.getCachedProbe.mockReturnValue(cached);
    expect(await getMcpStatus("p", "k")).toBe(cached);
    expect(mocks.mcpRpcAutoRefresh).not.toHaveBeenCalled();
  });
});

describe("getMcpStatus probe outcomes", () => {
  it("connected on rpc ok, and caches the result", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: true, result: {} });
    const r = await getMcpStatus("p", "k");
    expect(r).toMatchObject({ state: "connected", url: SPEC.resource_url, tools_count: null });
    expect(mocks.setCachedProbe).toHaveBeenCalledWith("p", "k", r);
  });

  it("stale_token on 401", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "http_error", status: 401 });
    expect(await getMcpStatus("p", "k")).toMatchObject({ state: "stale_token", http_status: 401 });
  });

  it("stale_token on 403", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "http_error", status: 403 });
    expect(await getMcpStatus("p", "k")).toMatchObject({ state: "stale_token", http_status: 403 });
  });

  it("unreachable on other http_error with body", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "http_error", status: 500, body: "oops" });
    expect(await getMcpStatus("p", "k")).toMatchObject({
      state: "unreachable",
      error: "HTTP 500: oops",
    });
  });

  it("unreachable on http_error without body", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "http_error", status: 502 });
    expect(await getMcpStatus("p", "k")).toMatchObject({ state: "unreachable", error: "HTTP 502" });
  });

  it("unreachable on timeout", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "timeout" });
    expect(await getMcpStatus("p", "k")).toMatchObject({ state: "unreachable", error: "timed out" });
  });

  it("unreachable on aborted", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "aborted" });
    expect(await getMcpStatus("p", "k")).toMatchObject({ state: "unreachable", error: "aborted" });
  });

  it("unreachable on rpc_error", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "rpc_error", code: -1, message: "bad" });
    expect(await getMcpStatus("p", "k")).toMatchObject({
      state: "unreachable",
      error: "rpc error -1: bad",
    });
  });

  it("unreachable on malformed_response", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "malformed_response", message: "junk" });
    expect(await getMcpStatus("p", "k")).toMatchObject({
      state: "unreachable",
      error: "malformed response: junk",
    });
  });

  it("unreachable fallthrough on network_error", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "network_error", message: "econnrefused" });
    expect(await getMcpStatus("p", "k")).toMatchObject({
      state: "unreachable",
      error: "econnrefused",
    });
  });
});

describe("disconnectMcp", () => {
  it("deletes the token and invalidates the probe when a token exists", async () => {
    mocks.findMcpToken.mockReturnValue({ id: "tok-9" });
    await disconnectMcp("p", "k");
    expect(mocks.deleteMcpToken).toHaveBeenCalledWith("tok-9");
    expect(mocks.invalidateProbe).toHaveBeenCalledWith("p", "k");
  });

  it("only invalidates when there is no token", async () => {
    mocks.findMcpToken.mockReturnValue(null);
    await disconnectMcp("p", "k");
    expect(mocks.deleteMcpToken).not.toHaveBeenCalled();
    expect(mocks.invalidateProbe).toHaveBeenCalledWith("p", "k");
  });

  it("disconnects every catalog key that shares the same resource URL", async () => {
    mocks.catalogKeysSharingResource.mockReturnValue(["notfair-googleads", "notfair-metaads"]);
    mocks.findMcpToken.mockImplementation((_slug: string, key: string) =>
      key === "notfair-googleads" ? { id: "tok-g" } : { id: "tok-m" },
    );
    await disconnectMcp("p", "notfair-googleads");
    expect(mocks.deleteMcpToken).toHaveBeenCalledWith("tok-g");
    expect(mocks.deleteMcpToken).toHaveBeenCalledWith("tok-m");
    expect(mocks.invalidateProbe).toHaveBeenCalledWith("p", "notfair-googleads");
    expect(mocks.invalidateProbe).toHaveBeenCalledWith("p", "notfair-metaads");
  });
});

describe("setMcpBearer", () => {
  it("upserts with all fields and invalidates the probe", async () => {
    await setMcpBearer("p", "k", "secret", {
      scope: "s",
      expires_at: "later",
      refresh_token: "r",
      token_endpoint: "te",
      client_id: "ci",
      client_secret: "cs",
    });
    expect(mocks.upsertMcpToken).toHaveBeenCalledWith({
      project_slug: "p",
      server_name: "k",
      access_token: "secret",
      scope: "s",
      expires_at: "later",
      refresh_token: "r",
      token_endpoint: "te",
      client_id: "ci",
      client_secret: "cs",
    });
    expect(mocks.invalidateProbe).toHaveBeenCalledWith("p", "k");
  });

  it("works with default (empty) options", async () => {
    await setMcpBearer("p", "k", "secret");
    expect(mocks.upsertMcpToken).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: "secret", scope: undefined }),
    );
  });
});
