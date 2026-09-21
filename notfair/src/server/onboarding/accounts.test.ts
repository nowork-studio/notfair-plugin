import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getMcpConfig: vi.fn(),
  mcpRpcAutoRefresh: vi.fn(),
  getProject: vi.fn(),
  setGoogle: vi.fn(),
  setMeta: vi.fn(),
  setGsc: vi.fn(),
  getMcpCatalog: vi.fn(),
  getMcpStatus: vi.fn(),
  accountPickerFor: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/server/mcp/rpc", () => ({
  getMcpConfig: mocks.getMcpConfig,
  mcpRpcAutoRefresh: mocks.mcpRpcAutoRefresh,
}));
vi.mock("@/server/db/projects", () => ({
  getProject: mocks.getProject,
  setProjectGoogleAdsAccount: mocks.setGoogle,
  setProjectMetaAdsAccount: mocks.setMeta,
  setProjectGscProperty: mocks.setGsc,
}));
vi.mock("@/server/mcp-catalog", () => ({
  getMcpCatalog: mocks.getMcpCatalog,
}));
vi.mock("@/server/mcp/state", () => ({ getMcpStatus: mocks.getMcpStatus }));
vi.mock("@/lib/mcp-account-pickers", () => ({
  accountPickerFor: mocks.accountPickerFor,
}));

import {
  getOnboardingConnectCardsAction,
  listGoogleAdsAccounts,
  listGscProperties,
  listMetaAdsAccounts,
  setOnboardingAccountAction,
  setOnboardingGscPropertyAction,
  setOnboardingMetaAdsAccountAction,
} from "./accounts";

const project = {
  slug: "acme",
  google_ads_account_id: "g-selected",
  meta_ads_account_id: "m-selected",
  gsc_property_url: "https://selected.example/",
};

function toolResult(body: unknown) {
  return {
    ok: true,
    result: { content: [{ type: "text", text: JSON.stringify(body) }] },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getMcpConfig.mockReturnValue({ url: "https://mcp.example" });
  mocks.getProject.mockReturnValue(project);
  mocks.setGoogle.mockReturnValue(project);
  mocks.setMeta.mockReturnValue(project);
  mocks.setGsc.mockReturnValue(project);
});

describe("listGoogleAdsAccounts", () => {
  it("reports a missing MCP configuration without making an RPC", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(listGoogleAdsAccounts("acme")).resolves.toMatchObject({
      ok: false,
      kind: "mcp_not_configured",
    });
    expect(mocks.mcpRpcAutoRefresh).not.toHaveBeenCalled();
  });

  it("normalizes accounts, names, and ids", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue(
      toolResult({
        accounts: [
          { id: 123, name: " Main " },
          { id: "fallback", name: "" },
          { id: "", name: "ignored" },
          null,
        ],
        defaultAccountId: 123,
      }),
    );
    await expect(listGoogleAdsAccounts("acme")).resolves.toEqual({
      ok: true,
      accounts: [
        { id: "123", name: "Main" },
        { id: "fallback", name: "fallback" },
      ],
    });
    expect(mocks.mcpRpcAutoRefresh).toHaveBeenCalledWith(
      "acme",
      "notfair-googleads",
      "tools/call",
      { name: "executeRead", arguments: { capabilityId: "google_ads_listConnectedAccounts", arguments: {} } },
      { timeoutMs: 8_000 },
    );
  });

  it.each([
    [{ kind: "http_error", status: 503 }, "HTTP 503"],
    [{ kind: "rpc_error", code: -1, message: "bad" }, "RPC -1: bad"],
    [{ kind: "timeout" }, "MCP call timed out"],
    [{ kind: "aborted" }, "MCP call aborted"],
    [{ kind: "malformed_response", message: "junk" }, "junk"],
    [{ kind: "network_error", message: "offline" }, "offline"],
  ])("formats RPC failure %o", async (failure, message) => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, ...failure });
    await expect(listGoogleAdsAccounts("acme")).resolves.toEqual({
      ok: false,
      kind: "rpc",
      error: message,
    });
  });

  it.each([
    null,
    { isError: true, content: [{ text: "{}" }] },
    { content: [] },
    { content: [{ text: "not json" }] },
    { content: [{ text: "{}" }] },
  ])("rejects malformed tool result %#", async (result) => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: true, result });
    await expect(listGoogleAdsAccounts("acme")).resolves.toMatchObject({
      ok: false,
      kind: "shape",
    });
  });
});

describe("setOnboardingAccountAction", () => {
  it("validates required input and project existence", async () => {
    await expect(setOnboardingAccountAction(" ", "id")).resolves.toMatchObject({ ok: false });
    await expect(setOnboardingAccountAction("acme", " ")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(null);
    await expect(setOnboardingAccountAction("acme", "id")).resolves.toEqual({
      ok: false,
      error: "Project not found.",
    });
  });

  it("rejects failed verification and unreachable account ids", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(setOnboardingAccountAction("acme", "id")).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("Couldn't verify account"),
    });

    mocks.getMcpConfig.mockReturnValue({});
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ accounts: [{ id: "other" }] }));
    await expect(setOnboardingAccountAction("acme", "id")).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("isn't in"),
    });
  });

  it("persists a verified account and revalidates the layout", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ accounts: [{ id: "id", name: "A" }] }));
    await expect(setOnboardingAccountAction("acme", "id")).resolves.toEqual({
      ok: true,
      project,
    });
    expect(mocks.setGoogle).toHaveBeenCalledWith("acme", "id");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("handles a project disappearing during the write", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ accounts: [{ id: "id" }] }));
    mocks.setGoogle.mockReturnValue(null);
    await expect(setOnboardingAccountAction("acme", "id")).resolves.toEqual({
      ok: false,
      error: "Project not found.",
    });
  });
});

describe("Meta Ads account onboarding", () => {
  it("supports Graph data and fallback accounts shapes", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue(
      toolResult({ data: [{ id: "act_1", name: " Primary " }, { id: "act_2" }, null] }),
    );
    await expect(listMetaAdsAccounts("acme")).resolves.toMatchObject({
      ok: true,
      accounts: [
        { id: "act_1", name: "Primary" },
        { id: "act_2", name: "act_2" },
      ],
    });
    mocks.mcpRpcAutoRefresh.mockResolvedValue(
      toolResult({ accounts: [{ id: "act_3", name: "Third" }], defaultAccountId: "act_3" }),
    );
    await expect(listMetaAdsAccounts("acme")).resolves.toMatchObject({
      ok: true,
      accounts: [{ id: "act_3", name: "Third" }],
    });
    expect(await listMetaAdsAccounts("acme")).not.toHaveProperty("default_account_id");
    expect(mocks.mcpRpcAutoRefresh).toHaveBeenCalledWith(
      "acme",
      "notfair-metaads",
      "tools/call",
      {
        name: "executeRead",
        arguments: { capabilityId: "meta_ads_listAdAccounts", arguments: {} },
      },
      { timeoutMs: 8_000 },
    );
  });

  it("handles missing config, RPC failure, and malformed payloads", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(listMetaAdsAccounts("acme")).resolves.toMatchObject({ kind: "mcp_not_configured" });
    mocks.getMcpConfig.mockReturnValue({});
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "timeout" });
    await expect(listMetaAdsAccounts("acme")).resolves.toMatchObject({ kind: "rpc" });
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ nope: [] }));
    await expect(listMetaAdsAccounts("acme")).resolves.toMatchObject({ kind: "shape" });
  });

  it("validates and persists the selected Meta account", async () => {
    await expect(setOnboardingMetaAdsAccountAction("", "act_1")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(null);
    await expect(setOnboardingMetaAdsAccountAction("acme", "act_1")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(project);
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ data: [{ id: "act_1" }] }));
    await expect(setOnboardingMetaAdsAccountAction("acme", "missing")).resolves.toMatchObject({ ok: false });
    await expect(setOnboardingMetaAdsAccountAction("acme", "act_1")).resolves.toEqual({ ok: true, project });
    expect(mocks.setMeta).toHaveBeenCalledWith("acme", "act_1");
  });

  it("surfaces verification and disappearing-project failures", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(setOnboardingMetaAdsAccountAction("acme", "act_1")).resolves.toMatchObject({
      error: expect.stringContaining("Meta Ads MCP"),
    });
    mocks.getMcpConfig.mockReturnValue({});
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ data: [{ id: "act_1" }] }));
    mocks.setMeta.mockReturnValue(null);
    await expect(setOnboardingMetaAdsAccountAction("acme", "act_1")).resolves.toEqual({
      ok: false,
      error: "Project not found.",
    });
  });
});

describe("Search Console property onboarding", () => {
  it("normalizes bare, siteEntry, and sites payloads with readable labels", async () => {
    mocks.mcpRpcAutoRefresh.mockResolvedValue(
      toolResult([
        { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
        { siteUrl: "https://example.com/blog/" },
        { id: "not a url", name: " Custom " },
        { siteUrl: "" },
        null,
      ]),
    );
    await expect(listGscProperties("acme")).resolves.toMatchObject({
      ok: true,
      properties: [
        { id: "sc-domain:example.com", name: "example.com", permission: "siteOwner" },
        { id: "https://example.com/blog/", name: "example.com/blog/" },
        { id: "not a url", name: "Custom" },
      ],
    });
    expect(mocks.mcpRpcAutoRefresh).toHaveBeenCalledWith(
      "acme",
      "notfair-googlesearchconsole",
      "tools/call",
      {
        name: "executeRead",
        arguments: {
          capabilityId: "search_console_listProperties",
          arguments: {},
        },
      },
      { timeoutMs: 8_000 },
    );
    mocks.mcpRpcAutoRefresh.mockResolvedValue(
      toolResult({ siteEntry: [{ siteUrl: "https://one.example/" }], defaultPropertyId: "one" }),
    );
    await expect(listGscProperties("acme")).resolves.toMatchObject({
      ok: true,
      properties: [{ id: "https://one.example/", name: "one.example" }],
    });
    expect(await listGscProperties("acme")).not.toHaveProperty("default_property_id");
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ sites: [] }));
    await expect(listGscProperties("acme")).resolves.toMatchObject({ ok: true, properties: [] });
  });

  it("handles missing config, RPC errors, and malformed object payloads", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(listGscProperties("acme")).resolves.toMatchObject({ kind: "mcp_not_configured" });
    mocks.getMcpConfig.mockReturnValue({});
    mocks.mcpRpcAutoRefresh.mockResolvedValue({ ok: false, kind: "aborted" });
    await expect(listGscProperties("acme")).resolves.toMatchObject({ kind: "rpc", error: "MCP call aborted" });
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult({ unknown: [] }));
    await expect(listGscProperties("acme")).resolves.toMatchObject({ kind: "shape" });
  });

  it("validates and persists a selected property", async () => {
    await expect(setOnboardingGscPropertyAction("acme", " ")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(null);
    await expect(setOnboardingGscPropertyAction("acme", "x")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(project);
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult([{ siteUrl: "https://example.com/" }]));
    await expect(setOnboardingGscPropertyAction("acme", "missing")).resolves.toMatchObject({ ok: false });
    await expect(setOnboardingGscPropertyAction("acme", "https://example.com/")).resolves.toEqual({ ok: true, project });
    expect(mocks.setGsc).toHaveBeenCalledWith("acme", "https://example.com/");
  });

  it("surfaces verification and disappearing-project failures", async () => {
    mocks.getMcpConfig.mockReturnValue(null);
    await expect(setOnboardingGscPropertyAction("acme", "x")).resolves.toMatchObject({
      error: expect.stringContaining("GSC MCP"),
    });
    mocks.getMcpConfig.mockReturnValue({});
    mocks.mcpRpcAutoRefresh.mockResolvedValue(toolResult([{ siteUrl: "x" }]));
    mocks.setGsc.mockReturnValue(null);
    await expect(setOnboardingGscPropertyAction("acme", "x")).resolves.toEqual({
      ok: false,
      error: "Project not found.",
    });
  });
});

describe("getOnboardingConnectCardsAction", () => {
  it("validates the project", async () => {
    await expect(getOnboardingConnectCardsAction(" ")).resolves.toMatchObject({ ok: false });
    mocks.getProject.mockReturnValue(null);
    await expect(getOnboardingConnectCardsAction("acme")).resolves.toEqual({
      ok: false,
      error: "Project not found.",
    });
  });

  it("keeps recommended cards plus connected extras and derives selections", async () => {
    const catalog = [
      { key: "notfair-googleads" },
      { key: "custom-connected" },
      { key: "custom-idle" },
    ];
    mocks.getMcpCatalog.mockReturnValue(catalog);
    mocks.getMcpStatus
      .mockResolvedValueOnce({ state: "not_configured" })
      .mockResolvedValueOnce({ state: "connected" })
      .mockResolvedValueOnce({ state: "unreachable" });
    mocks.accountPickerFor.mockImplementation((key: string) =>
      key === "notfair-googleads"
        ? { selectedId: (p: typeof project) => p.google_ads_account_id }
        : null,
    );
    const result = await getOnboardingConnectCardsAction("acme");
    expect(result).toMatchObject({ ok: true, any_connected: true });
    if (!result.ok) throw new Error("expected cards");
    expect(result.cards.map((card) => card.spec.key)).toEqual([
      "notfair-googleads",
      "custom-connected",
    ]);
    expect(result.cards[0]!.selected_id).toBe("g-selected");
    expect(result.cards[1]!.selected_id).toBeNull();
  });
});
