import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

// Real better-sqlite3 against a tmpdir DB, per repo test conventions.
// MUST be hoisted: static imports evaluate before module-level statements,
// and db.ts captures NOTFAIR_DATA_DIR at import time — a plain assignment
// here would silently point the suite at the developer's live ~/.notfair.
vi.hoisted(() => {
  const { mkdtempSync } = require("node:fs") as typeof import("node:fs");
  const { tmpdir } = require("node:os") as typeof import("node:os");
  const { join } = require("node:path") as typeof import("node:path");
  process.env.NOTFAIR_DATA_DIR = mkdtempSync(join(tmpdir(), "notfair-actions-mcp-"));
});

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getActiveProject: vi.fn(),
  setPending: vi.fn(),
  disconnectMcp: vi.fn(async () => {}),
  getMcpConfig: vi.fn(),
  mcpRpcAutoRefresh: vi.fn(),
  listProjectAgents: vi.fn(async () => [] as Array<{ agent_id: string }>),
  unregisterMcp: vi.fn(async () => {}),
  headerMap: new Map<string, string>(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => mocks.headerMap.get(name.toLowerCase()) ?? null,
  }),
}));
vi.mock("@/server/active-project", () => ({
  getActiveProject: mocks.getActiveProject,
}));
vi.mock("@/server/mcp-pending", () => ({ setPending: mocks.setPending }));
vi.mock("@/server/mcp/state", () => ({ disconnectMcp: mocks.disconnectMcp }));
vi.mock("@/server/mcp/rpc", () => ({
  getMcpConfig: mocks.getMcpConfig,
  mcpRpcAutoRefresh: mocks.mcpRpcAutoRefresh,
}));
vi.mock("@/server/agent-meta", () => ({
  listProjectAgents: mocks.listProjectAgents,
}));
vi.mock("@/server/adapters/registry", () => ({
  requireAdapter: () => ({ unregisterMcp: mocks.unregisterMcp }),
}));

import { getDb } from "@/server/db/db";
import { getProject } from "@/server/db/projects";
import {
  addHiddenMcpPresetKey,
  getHiddenMcpPresetKeys,
} from "@/server/db/projects";
import {
  findUserMcpServer,
  insertUserMcpServer,
} from "@/server/db/user-mcp-servers";
import {
  addUserMcpServerAction,
  disconnectMcpAction,
  listMcpToolsAction,
  probeMcpDiscovery,
  removeUserMcpServerAction,
  startMcpConnect,
} from "./mcp";

const SLUG = "proj";

// ── fetch fixture: a routable fake OAuth ecosystem ───────────────────
const RESOURCE_URL = "https://mcp.acme.dev/sse";
const DISCOVERY_URL =
  "https://mcp.acme.dev/.well-known/oauth-protected-resource/sse";
const ISSUER = "https://auth.acme.dev";
const AS_METADATA_URL = `${ISSUER}/.well-known/oauth-authorization-server`;
const REGISTRATION_URL = `${ISSUER}/register`;

type Route = (init?: RequestInit) => Response | Promise<Response>;
let routes: Map<string, Route>;
const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function installDefaultRoutes(opts: { authMethods?: string[] } = {}) {
  routes = new Map<string, Route>([
    [DISCOVERY_URL, () => json({ authorization_servers: [`${ISSUER}/`] })],
    [
      AS_METADATA_URL,
      () =>
        json({
          issuer: ISSUER,
          authorization_endpoint: `${ISSUER}/authorize`,
          token_endpoint: `${ISSUER}/token`,
          registration_endpoint: REGISTRATION_URL,
          token_endpoint_auth_methods_supported: opts.authMethods ?? ["none"],
        }),
    ],
    [REGISTRATION_URL, () => json({ client_id: "cid-1", client_secret: "sec-1" })],
  ]);
}

beforeAll(() => {
  getDb()
    .prepare(
      "INSERT INTO projects (id, slug, display_name, created_at, harness_adapter) VALUES ('p1', ?, 'Proj', ?, 'claude-code-local')",
    )
    .run(SLUG, new Date().toISOString());
  insertUserMcpServer({
    project_slug: SLUG,
    key: "acme",
    display_name: "Acme MCP",
    resource_url: RESOURCE_URL,
    discovery_url: DISCOVERY_URL,
  });
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    fetchCalls.push({ url, init });
    const route = routes.get(url);
    if (!route) return new Response("not found", { status: 404 });
    return route(init);
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  fetchCalls.length = 0;
  installDefaultRoutes();
  mocks.getActiveProject.mockResolvedValue(getProject(SLUG));
  mocks.headerMap.clear();
  mocks.headerMap.set("host", "localhost:3326");
});

// ── startMcpConnect ──────────────────────────────────────────────────

describe("startMcpConnect", () => {
  it("fails without an active project", async () => {
    mocks.getActiveProject.mockResolvedValue(null);
    const r = await startMcpConnect({ mcp_key: "acme" });
    expect(r).toMatchObject({ ok: false });
    if (r.ok) return;
    expect(r.error).toContain("No active project");
  });

  it("fails on an unknown catalog key", async () => {
    const r = await startMcpConnect({ mcp_key: "does-not-exist" });
    expect(r).toMatchObject({ ok: false, error: "Unknown MCP key: does-not-exist" });
  });

  it("surfaces discovery failures", async () => {
    routes.delete(DISCOVERY_URL); // 404s now
    const r = await startMcpConnect({ mcp_key: "acme" });
    expect(r).toMatchObject({ ok: false });
    if (r.ok) return;
    expect(r.error).toMatch(/^Discovery failed: /);
  });

  it("surfaces DCR failures", async () => {
    routes.set(REGISTRATION_URL, () => new Response("denied", { status: 400 }));
    const r = await startMcpConnect({ mcp_key: "acme" });
    expect(r).toMatchObject({ ok: false });
    if (r.ok) return;
    expect(r.error).toContain("Registration failed: DCR 400");
  });

  it("builds the authorize URL and stashes the pending flow", async () => {
    const r = await startMcpConnect({ mcp_key: "acme", return_to: "/goals/1" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const u = new URL(r.authorize_url);
    expect(u.origin + u.pathname).toBe(`${ISSUER}/authorize`);
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("client_id")).toBe("cid-1");
    // localhost normalized to the RFC 8252 loopback IP.
    expect(u.searchParams.get("redirect_uri")).toBe(
      "http://127.0.0.1:3326/api/mcp-oauth/callback",
    );
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(u.searchParams.get("resource")).toBe(RESOURCE_URL);

    expect(mocks.setPending).toHaveBeenCalledTimes(1);
    const [state, flow] = mocks.setPending.mock.calls[0]! as [
      string,
      Record<string, unknown>,
    ];
    expect(state).toBe(u.searchParams.get("state"));
    expect(flow).toMatchObject({
      catalog_key: "acme",
      display_name: "Acme MCP",
      resource_url: RESOURCE_URL,
      issuer: ISSUER, // trailing slash stripped
      token_endpoint: `${ISSUER}/token`,
      client_id: "cid-1",
      client_secret: "sec-1",
      redirect_uri: "http://127.0.0.1:3326/api/mcp-oauth/callback",
      project_slug: SLUG,
      return_to: "/goals/1",
    });
    // The challenge in the URL is the S256 hash of the stashed verifier.
    const expected = createHash("sha256")
      .update(String(flow.code_verifier))
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(u.searchParams.get("code_challenge")).toBe(expected);

    // DCR registered a public client (AS advertised `none`).
    const dcr = fetchCalls.find((c) => c.url === REGISTRATION_URL)!;
    const body = JSON.parse(String(dcr.init?.body));
    expect(body.token_endpoint_auth_method).toBe("none");
    expect(body.grant_types).toEqual(["authorization_code", "refresh_token"]);
  });

  it("drops off-site and protocol-relative return_to values", async () => {
    for (const bad of ["https://evil.example", "//evil.example/x"]) {
      await startMcpConnect({ mcp_key: "acme", return_to: bad });
      const flow = mocks.setPending.mock.calls.at(-1)![1] as Record<string, unknown>;
      expect(flow.return_to).toBeUndefined();
    }
  });

  it("falls back to client_secret_post when the AS doesn't allow public clients", async () => {
    installDefaultRoutes({ authMethods: ["client_secret_post", "client_secret_basic"] });
    const r = await startMcpConnect({ mcp_key: "acme" });
    expect(r.ok).toBe(true);
    const dcr = fetchCalls.find((c) => c.url === REGISTRATION_URL)!;
    expect(JSON.parse(String(dcr.init?.body)).token_endpoint_auth_method).toBe(
      "client_secret_post",
    );
  });

  it("respects forwarded proto/host headers", async () => {
    mocks.headerMap.set("x-forwarded-proto", "https");
    mocks.headerMap.set("x-forwarded-host", "notfair.example");
    const r = await startMcpConnect({ mcp_key: "acme" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(new URL(r.authorize_url).searchParams.get("redirect_uri")).toBe(
      "https://notfair.example/api/mcp-oauth/callback",
    );
  });
});

// ── probeMcpDiscovery ────────────────────────────────────────────────

describe("probeMcpDiscovery", () => {
  it("rejects non-URL and non-http(s) resource URLs", async () => {
    for (const bad of ["not a url", "ftp://mcp.acme.dev"]) {
      const r = await probeMcpDiscovery({ resource_url: bad });
      expect(r).toMatchObject({ ok: false, kind: "bad_url" });
    }
  });

  it("classifies a missing discovery doc", async () => {
    routes.delete(DISCOVERY_URL);
    const r = await probeMcpDiscovery({ resource_url: RESOURCE_URL });
    expect(r).toMatchObject({ ok: false, kind: "no_discovery_doc" });
  });

  it("classifies a doc without authorization_servers", async () => {
    routes.set(DISCOVERY_URL, () => json({ resource: RESOURCE_URL }));
    const r = await probeMcpDiscovery({ resource_url: RESOURCE_URL });
    expect(r).toMatchObject({ ok: false, kind: "no_authorization_servers" });
    routes.set(DISCOVERY_URL, () => json({ authorization_servers: [] }));
    expect(await probeMcpDiscovery({ resource_url: RESOURCE_URL })).toMatchObject({
      ok: false,
      kind: "no_authorization_servers",
    });
  });

  it("classifies unreachable AS metadata, listing every attempted URL", async () => {
    routes.delete(AS_METADATA_URL);
    const r = await probeMcpDiscovery({ resource_url: RESOURCE_URL });
    expect(r).toMatchObject({ ok: false, kind: "as_metadata_missing_endpoints" });
    if (r.ok) return;
    expect(r.error).toContain("Couldn't fetch AS metadata");
    expect(r.error).toContain(AS_METADATA_URL);
    expect(r.error).toContain(`${ISSUER}/.well-known/openid-configuration`);
  });

  it("classifies metadata missing endpoints and missing DCR", async () => {
    routes.set(AS_METADATA_URL, () => json({ issuer: ISSUER }));
    expect(await probeMcpDiscovery({ resource_url: RESOURCE_URL })).toMatchObject({
      ok: false,
      kind: "as_metadata_missing_endpoints",
    });
    routes.set(AS_METADATA_URL, () =>
      json({
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
      }),
    );
    expect(await probeMcpDiscovery({ resource_url: RESOURCE_URL })).toMatchObject({
      ok: false,
      kind: "dcr_unsupported",
    });
  });

  it("resolves happy-path metadata", async () => {
    const r = await probeMcpDiscovery({ resource_url: RESOURCE_URL });
    expect(r).toEqual({
      ok: true,
      discovery_url: DISCOVERY_URL,
      issuer: ISSUER,
      registration_endpoint: REGISTRATION_URL,
    });
  });

  it("falls back to appended-form metadata URLs for path-bearing issuers", async () => {
    const pathIssuer = `${ISSUER}/tenant`;
    routes.set(DISCOVERY_URL, () => json({ authorization_servers: [pathIssuer] }));
    // Inserted forms 404; only the appended form resolves.
    routes.set(`${pathIssuer}/.well-known/oauth-authorization-server`, () =>
      json({
        authorization_endpoint: `${pathIssuer}/authorize`,
        token_endpoint: `${pathIssuer}/token`,
        registration_endpoint: `${pathIssuer}/register`,
      }),
    );
    const r = await probeMcpDiscovery({ resource_url: RESOURCE_URL });
    expect(r).toMatchObject({ ok: true, issuer: pathIssuer });
    const attempted = fetchCalls.map((c) => c.url);
    // Spec-correct inserted forms were tried first.
    expect(attempted).toContain(
      `${ISSUER}/.well-known/oauth-authorization-server/tenant`,
    );
    expect(attempted).toContain(`${ISSUER}/.well-known/openid-configuration/tenant`);
  });
});

// ── disconnectMcpAction ──────────────────────────────────────────────

describe("disconnectMcpAction", () => {
  it("fails without an active project", async () => {
    mocks.getActiveProject.mockResolvedValue(null);
    const r = await disconnectMcpAction({ mcp_key: "acme" });
    expect(r).toMatchObject({ ok: false });
  });

  it("surfaces disconnect errors (including non-Error throws)", async () => {
    mocks.disconnectMcp.mockRejectedValueOnce(new Error("token vault sealed"));
    expect(await disconnectMcpAction({ mcp_key: "acme" })).toEqual({
      ok: false,
      error: "token vault sealed",
    });
    mocks.disconnectMcp.mockRejectedValueOnce("plain string");
    expect(await disconnectMcpAction({ mcp_key: "acme" })).toEqual({
      ok: false,
      error: "plain string",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("disconnects and revalidates", async () => {
    const r = await disconnectMcpAction({ mcp_key: "acme" });
    expect(r).toEqual({ ok: true });
    expect(mocks.disconnectMcp).toHaveBeenCalledWith(SLUG, "acme");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

// ── listMcpToolsAction ───────────────────────────────────────────────

describe("listMcpToolsAction", () => {
  it("fails without an active project or config", async () => {
    mocks.getActiveProject.mockResolvedValueOnce(null);
    expect(await listMcpToolsAction({ mcp_key: "acme" })).toMatchObject({ ok: false });

    mocks.getMcpConfig.mockReturnValueOnce(null);
    expect(await listMcpToolsAction({ mcp_key: "acme" })).toEqual({
      ok: false,
      error: "MCP is not configured for this project.",
    });
  });

  it.each([
    [{ ok: false, kind: "http_error", status: 503 }, "HTTP 503"],
    [{ ok: false, kind: "rpc_error", code: -32000, message: "nope" }, "RPC -32000: nope"],
    [{ ok: false, kind: "timeout" }, "MCP call timed out"],
    [{ ok: false, kind: "aborted" }, "MCP call aborted"],
    [{ ok: false, kind: "malformed_response", message: "not json" }, "not json"],
    [{ ok: false, kind: "network_error", message: "ECONNREFUSED" }, "ECONNREFUSED"],
  ])("maps rpc failure %o to a human message", async (rpcResult, expected) => {
    mocks.getMcpConfig.mockReturnValue({ bearer: "b" });
    mocks.mcpRpcAutoRefresh.mockResolvedValueOnce(rpcResult);
    expect(await listMcpToolsAction({ mcp_key: "acme" })).toEqual({
      ok: false,
      error: expected,
    });
  });

  it("normalizes the tools list into ToolSummary shape", async () => {
    mocks.getMcpConfig.mockReturnValue({ bearer: "b" });
    mocks.mcpRpcAutoRefresh.mockResolvedValueOnce({
      ok: true,
      result: {
        tools: [
          {
            name: "search",
            description: "Search things",
            inputSchema: {
              type: "object",
              properties: { q: { type: "string", description: "query" } },
              required: ["q"],
            },
          },
          { name: "bare" }, // no description, no schema
          { name: 42 }, // dropped: non-string name
        ],
      },
    });
    const r = await listMcpToolsAction({ mcp_key: "acme" });
    expect(r).toEqual({
      ok: true,
      tools: [
        {
          name: "search",
          description: "Search things",
          args: [{ name: "q", type: "string", description: "query", required: true }],
        },
        { name: "bare", description: "", args: [] },
      ],
    });
  });

  it("returns an empty list when the server sends no tools array", async () => {
    mocks.getMcpConfig.mockReturnValue({ bearer: "b" });
    mocks.mcpRpcAutoRefresh.mockResolvedValueOnce({ ok: true, result: {} });
    expect(await listMcpToolsAction({ mcp_key: "acme" })).toEqual({
      ok: true,
      tools: [],
    });
  });
});

// ── addUserMcpServerAction ───────────────────────────────────────────

describe("addUserMcpServerAction", () => {
  it("fails without an active project", async () => {
    mocks.getActiveProject.mockResolvedValue(null);
    const r = await addUserMcpServerAction({
      display_name: "X",
      resource_url: RESOURCE_URL,
    });
    expect(r).toMatchObject({ ok: false, kind: "no_project" });
  });

  it("rejects a name that can't slugify", async () => {
    const r = await addUserMcpServerAction({
      display_name: "###",
      resource_url: RESOURCE_URL,
    });
    expect(r).toMatchObject({ ok: false, kind: "name_unusable" });
  });

  it("un-hides a preset key instead of writing a row", async () => {
    addHiddenMcpPresetKey(SLUG, "notfair-googleads");
    const r = await addUserMcpServerAction({
      display_name: "NotFair Google Ads",
        resource_url: "https://notfair.co/api/mcp/notfair",
      key: "notfair-googleads",
    });
    expect(r).toEqual({ ok: true, key: "notfair-googleads" });
    expect(getHiddenMcpPresetKeys(SLUG)).toEqual([]);
    expect(findUserMcpServer(SLUG, "notfair-googleads")).toBeNull();
    expect(fetchCalls).toEqual([]); // no discovery probe
  });

  it("is a no-op success when the key already exists", async () => {
    const r = await addUserMcpServerAction({
      display_name: "Acme MCP",
      resource_url: RESOURCE_URL,
      key: "acme",
    });
    expect(r).toEqual({ ok: true, key: "acme" });
    expect(fetchCalls).toEqual([]);
  });

  it("re-uses the stored key when the same URL exists under another key", async () => {
    const r = await addUserMcpServerAction({
      display_name: "Acme Renamed",
      resource_url: "https://mcp.acme.dev/sse/", // trailing slash: normalized match
    });
    expect(r).toEqual({ ok: true, key: "acme" });
    expect(fetchCalls).toEqual([]);
  });

  it("propagates probe failures", async () => {
    routes.delete(DISCOVERY_URL);
    const r = await addUserMcpServerAction({
      display_name: "Broken",
      resource_url: RESOURCE_URL.replace("/sse", "/other"),
    });
    expect(r).toMatchObject({ ok: false, kind: "no_discovery_doc" });
    expect(findUserMcpServer(SLUG, "broken")).toBeNull();
  });

  it("probes discovery and inserts a trimmed row (ignoring an invalid key override)", async () => {
    const resource = "https://mcp.acme.dev/v2";
    const discovery =
      "https://mcp.acme.dev/.well-known/oauth-protected-resource/v2";
    routes.set(discovery, () => json({ authorization_servers: [ISSUER] }));
    const r = await addUserMcpServerAction({
      display_name: "  Acme V2  ",
      description: "  second gen  ",
      resource_url: resource,
      key: "Not_A_Valid_Key",
    });
    expect(r).toEqual({ ok: true, key: "acme-v2" });
    expect(findUserMcpServer(SLUG, "acme-v2")).toMatchObject({
      display_name: "Acme V2",
      description: "second gen",
      resource_url: resource,
      discovery_url: discovery,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

// ── removeUserMcpServerAction ────────────────────────────────────────

describe("removeUserMcpServerAction", () => {
  it("fails without an active project or on an unknown user key", async () => {
    mocks.getActiveProject.mockResolvedValueOnce(null);
    expect(await removeUserMcpServerAction({ mcp_key: "acme" })).toMatchObject({
      ok: false,
    });
    expect(await removeUserMcpServerAction({ mcp_key: "ghost" })).toEqual({
      ok: false,
      error: "Unknown MCP key: ghost.",
    });
  });

  it("surfaces disconnect failures", async () => {
    mocks.disconnectMcp.mockRejectedValueOnce(new Error("db locked"));
    expect(await removeUserMcpServerAction({ mcp_key: "acme" })).toEqual({
      ok: false,
      error: "db locked",
    });
    expect(findUserMcpServer(SLUG, "acme")).not.toBeNull();
  });

  it("hides a preset and unregisters it from every agent (best-effort)", async () => {
    mocks.listProjectAgents.mockResolvedValueOnce([
      { agent_id: "proj-goal-1" },
      { agent_id: "proj-goal-2" },
    ]);
    mocks.unregisterMcp.mockRejectedValueOnce(new Error("harness config missing"));
    const r = await removeUserMcpServerAction({ mcp_key: "notfair-metaads" });
    expect(r).toEqual({ ok: true });
    expect(getHiddenMcpPresetKeys(SLUG)).toContain("notfair-metaads");
    expect(mocks.disconnectMcp).toHaveBeenCalledWith(SLUG, "notfair-metaads");
    expect(
      mocks.unregisterMcp.mock.calls.map(
        (c) => ((c as unknown[])[0] as { agentId: string }).agentId,
      ),
    ).toEqual([
      "proj-goal-1",
      "proj-goal-2",
    ]);
  });

  it("deletes a user row", async () => {
    const r = await removeUserMcpServerAction({ mcp_key: "acme" });
    expect(r).toEqual({ ok: true });
    expect(findUserMcpServer(SLUG, "acme")).toBeNull();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
