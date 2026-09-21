import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Real better-sqlite3 against a tmpdir DB, per repo test conventions.
// MUST be hoisted: static imports evaluate before module-level statements,
// and db.ts captures NOTFAIR_DATA_DIR at import time — a plain assignment
// here would silently point the suite at the developer's live ~/.notfair.
vi.hoisted(() => {
  const { mkdtempSync } = require("node:fs") as typeof import("node:fs");
  const { tmpdir } = require("node:os") as typeof import("node:os");
  const { join } = require("node:path") as typeof import("node:path");
  process.env.NOTFAIR_DATA_DIR = mkdtempSync(join(tmpdir(), "notfair-rpc-"));
});

const refreshMocks = vi.hoisted(() => ({
  refreshMcpToken: vi.fn(),
  isExpiringSoon: vi.fn(),
}));

vi.mock("./refresh", () => refreshMocks);

import {
  bearerFromHeaders,
  getMcpConfig,
  mcpRpc,
  mcpRpcAutoRefresh,
  readMcpConfigRow,
} from "./rpc";
import { upsertMcpToken, type McpToken } from "./tokens";
import { getDb } from "@/server/db/db";

const ADS = "notfair-googleads";
const ADS_URL = "https://notfair.co/api/mcp/notfair";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  refreshMocks.refreshMcpToken.mockReset();
  refreshMocks.isExpiringSoon.mockReset().mockReturnValue(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

let projCounter = 0;
function freshProject(): string {
  const slug = `proj-${++projCounter}`;
  // mcp_tokens.project_slug FKs to projects(slug).
  getDb()
    .prepare(
      "INSERT OR IGNORE INTO projects (id, slug, display_name, created_at, harness_adapter) VALUES (?, ?, ?, ?, 'claude-code-local')",
    )
    .run(slug, slug, slug, new Date().toISOString());
  return slug;
}

function storeToken(project_slug: string, access_token = "tok"): McpToken {
  return upsertMcpToken({ project_slug, server_name: ADS, access_token });
}

/** Age the row's updated_at past the 5s "just refreshed" reactive-skip window. */
function ageToken(token: McpToken): McpToken {
  const old = new Date(Date.now() - 60_000).toISOString();
  getDb().prepare("UPDATE mcp_tokens SET updated_at = ? WHERE id = ?").run(old, token.id);
  return { ...token, updated_at: old };
}

function rpcSuccess(result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("readMcpConfigRow / getMcpConfig", () => {
  it("returns null for an unknown catalog key", () => {
    expect(readMcpConfigRow(freshProject(), "no-such-server")).toBeNull();
    expect(getMcpConfig(freshProject(), "no-such-server")).toBeNull();
  });

  it("returns url-only when no token is stored", () => {
    const slug = freshProject();
    expect(readMcpConfigRow(slug, ADS)).toEqual({ url: ADS_URL });
    // No bearer → no usable config.
    expect(getMcpConfig(slug, ADS)).toBeNull();
  });

  it("returns url + bearer header when a token exists", () => {
    const slug = freshProject();
    storeToken(slug, "secret-bearer");
    expect(readMcpConfigRow(slug, ADS)).toEqual({
      url: ADS_URL,
      headers: { Authorization: "Bearer secret-bearer" },
    });
    expect(getMcpConfig(slug, ADS)).toEqual({ url: ADS_URL, token: "secret-bearer" });
  });

  it("reuses a token stored under another catalog key that shares the resource URL", () => {
    const slug = freshProject();
    upsertMcpToken({
      project_slug: slug,
      server_name: "notfair-metaads",
      access_token: "shared-bearer",
    });
    expect(getMcpConfig(slug, ADS)).toEqual({
      url: ADS_URL,
      token: "shared-bearer",
    });
  });
});

describe("bearerFromHeaders", () => {
  it("returns null for missing headers or missing Authorization", () => {
    expect(bearerFromHeaders(undefined)).toBeNull();
    expect(bearerFromHeaders({})).toBeNull();
  });

  it("extracts the bearer, case-insensitively", () => {
    expect(bearerFromHeaders({ Authorization: "Bearer abc" })).toBe("abc");
    expect(bearerFromHeaders({ authorization: "bearer xyz " })).toBe("xyz");
  });

  it("rejects non-bearer schemes", () => {
    expect(bearerFromHeaders({ Authorization: "Basic dXNlcg==" })).toBeNull();
  });
});

describe("mcpRpc", () => {
  it("POSTs a JSON-RPC envelope with auth + protocol headers and parses the result", async () => {
    fetchMock.mockResolvedValueOnce(rpcSuccess({ tools: [] }));
    const r = await mcpRpc("https://mcp.example.com/x", "tok-1", "tools/list", { a: 1 });
    expect(r).toEqual({ ok: true, result: { tools: [] } });

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("https://mcp.example.com/x");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-1");
    expect(headers["MCP-Protocol-Version"]).toBe("2025-06-18");
    expect(headers.Accept).toBe("application/json, text/event-stream");
    expect(JSON.parse(init.body as string)).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: { a: 1 },
    });
  });

  it("parses an SSE body, taking the last data frame", async () => {
    const sse =
      'event: message\ndata: {"jsonrpc":"2.0","id":1,"result":"first"}\n\n' +
      'event: message\ndata: {"jsonrpc":"2.0",\ndata: "id":1,"result":"last"}\n\n';
    fetchMock.mockResolvedValueOnce(new Response(sse, { status: 200 }));
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: true, result: "last" });
  });

  it("SSE body with no data lines is malformed", async () => {
    fetchMock.mockResolvedValueOnce(new Response("event: ping\n\n", { status: 200 }));
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toMatchObject({ ok: false, kind: "malformed_response", message: "empty body" });
  });

  it("surfaces HTTP errors with the (truncated) body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("must initialize first", { status: 400 }),
    );
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({
      ok: false,
      kind: "http_error",
      status: 400,
      body: "must initialize first",
    });
  });

  it("HTTP error with a blank body reports body: undefined", async () => {
    fetchMock.mockResolvedValueOnce(new Response("   ", { status: 503 }));
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: false, kind: "http_error", status: 503, body: undefined });
  });

  it("HTTP error where the body read throws still reports the status", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: () => Promise.reject(new Error("read failed")),
    });
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: false, kind: "http_error", status: 502, body: undefined });
  });

  it("maps a JSON-RPC error envelope to rpc_error", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32601, message: "no such method" } }),
        { status: 200 },
      ),
    );
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: false, kind: "rpc_error", code: -32601, message: "no such method" });
  });

  it("flags malformed bodies: empty, unparseable, and result-less envelopes", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));
    expect(await mcpRpc("https://x", "t", "m")).toMatchObject({
      ok: false,
      kind: "malformed_response",
      message: "empty body",
    });

    fetchMock.mockResolvedValueOnce(new Response("{nope", { status: 200 }));
    expect(await mcpRpc("https://x", "t", "m")).toMatchObject({
      ok: false,
      kind: "malformed_response",
    });

    fetchMock.mockResolvedValueOnce(new Response('{"jsonrpc":"2.0","id":1}', { status: 200 }));
    expect(await mcpRpc("https://x", "t", "m")).toMatchObject({
      ok: false,
      kind: "malformed_response",
      message: "envelope has neither result nor error",
    });
  });

  it("maps fetch rejection to network_error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: false, kind: "network_error", message: "ECONNREFUSED" });
  });

  it("maps a body read failure on a 200 to network_error", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.reject(new Error("stream reset")),
    });
    const r = await mcpRpc("https://x", "t", "m");
    expect(r).toEqual({ ok: false, kind: "network_error", message: "stream reset" });
  });

  it("returns timeout when the deadline fires before the response", async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => {
          (init.signal as AbortSignal).addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );
    const r = await mcpRpc("https://x", "t", "m", {}, { timeoutMs: 10 });
    expect(r).toEqual({ ok: false, kind: "timeout" });
  });

  it("returns aborted when the caller's signal fires", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => {
          (init.signal as AbortSignal).addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );
    const pending = mcpRpc("https://x", "t", "m", {}, { signal: controller.signal });
    controller.abort();
    expect(await pending).toEqual({ ok: false, kind: "aborted" });
  });

  it("returns aborted when the caller's signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      const signal = init.signal as AbortSignal;
      return signal.aborted
        ? Promise.reject(new DOMException("The operation was aborted.", "AbortError"))
        : Promise.resolve(rpcSuccess("nope"));
    });
    const r = await mcpRpc("https://x", "t", "m", {}, { signal: controller.signal });
    expect(r).toEqual({ ok: false, kind: "aborted" });
  });
});

describe("mcpRpcAutoRefresh", () => {
  it("404s on an unknown catalog key", async () => {
    const r = await mcpRpcAutoRefresh(freshProject(), "no-such-server", "tools/list");
    expect(r).toEqual({
      ok: false,
      kind: "http_error",
      status: 404,
      body: "unknown mcp catalog key",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("401s when no token is stored", async () => {
    const r = await mcpRpcAutoRefresh(freshProject(), ADS, "tools/list");
    expect(r).toEqual({ ok: false, kind: "http_error", status: 401, body: "no token stored" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the stored token when it is not expiring", async () => {
    const slug = freshProject();
    storeToken(slug, "stored-tok");
    fetchMock.mockResolvedValueOnce(rpcSuccess("fine"));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toEqual({ ok: true, result: "fine" });
    expect(refreshMocks.refreshMcpToken).not.toHaveBeenCalled();
    const headers = fetchMock.mock.calls[0]![1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer stored-tok");
    expect(fetchMock.mock.calls[0]![0]).toBe(ADS_URL);
  });

  it("proactively refreshes an expiring token before the call", async () => {
    const slug = freshProject();
    const token = storeToken(slug, "stale-tok");
    refreshMocks.isExpiringSoon.mockReturnValue(true);
    refreshMocks.refreshMcpToken.mockResolvedValueOnce({
      ...token,
      access_token_enc: "fresh-tok",
    });
    fetchMock.mockResolvedValueOnce(rpcSuccess("ok"));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toEqual({ ok: true, result: "ok" });
    expect(refreshMocks.refreshMcpToken).toHaveBeenCalledTimes(1);
    const headers = fetchMock.mock.calls[0]![1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer fresh-tok");
  });

  it("falls back to the stored token when the proactive refresh fails", async () => {
    const slug = freshProject();
    ageToken(storeToken(slug, "stale-tok"));
    refreshMocks.isExpiringSoon.mockReturnValue(true);
    refreshMocks.refreshMcpToken.mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce(rpcSuccess("still ok"));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toEqual({ ok: true, result: "still ok" });
    const headers = fetchMock.mock.calls[0]![1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer stale-tok");
  });

  it("on 401, refreshes once and retries with the new token", async () => {
    const slug = freshProject();
    const token = ageToken(storeToken(slug, "revoked-tok"));
    refreshMocks.refreshMcpToken.mockResolvedValueOnce({
      ...token,
      access_token_enc: "rotated-tok",
    });
    fetchMock
      .mockResolvedValueOnce(new Response("unauthorized", { status: 401 }))
      .mockResolvedValueOnce(rpcSuccess("recovered"));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toEqual({ ok: true, result: "recovered" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = fetchMock.mock.calls[1]![1].headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe("Bearer rotated-tok");
  });

  it("returns the original 401 when the reactive refresh fails", async () => {
    const slug = freshProject();
    ageToken(storeToken(slug));
    refreshMocks.refreshMcpToken.mockResolvedValueOnce(null);
    fetchMock.mockResolvedValueOnce(new Response("unauthorized", { status: 401 }));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toMatchObject({ ok: false, kind: "http_error", status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips the reactive refresh when the token was refreshed within this call", async () => {
    const slug = freshProject();
    // Freshly upserted row → updated_at is now, inside the 5s skip window.
    storeToken(slug);
    fetchMock.mockResolvedValueOnce(new Response("unauthorized", { status: 401 }));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toMatchObject({ ok: false, kind: "http_error", status: 401 });
    expect(refreshMocks.refreshMcpToken).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("passes through non-401 failures without refreshing", async () => {
    const slug = freshProject();
    ageToken(storeToken(slug));
    fetchMock.mockRejectedValueOnce(new Error("down"));

    const r = await mcpRpcAutoRefresh(slug, ADS, "tools/list");
    expect(r).toEqual({ ok: false, kind: "network_error", message: "down" });
    expect(refreshMocks.refreshMcpToken).not.toHaveBeenCalled();
  });
});
