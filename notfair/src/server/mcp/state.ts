import { findMcpToken, upsertMcpToken, deleteMcpToken } from "./tokens";
import { mcpSpecByKey } from "@/server/mcp-catalog";
import {
  catalogKeysSharingResource,
  findCatalogMcpToken,
} from "./catalog-token";
import { mcpRpcAutoRefresh } from "./rpc";
import {
  getCachedProbe,
  invalidateProbe,
  setCachedProbe,
} from "./probe-cache";

/**
 * Status surface for the Connections page + dashboard banners.
 *
 *  - "not_configured": no row in mcp_tokens
 *  - "configured_no_token": (legacy compat — pre-OAuth half-config rows)
 *  - "connected": token present and probe succeeded
 *  - "stale_token": probe came back 401/403
 *  - "unreachable": probe failed (network/timeout/5xx)
 */
export type McpRuntimeStatus =
  | { state: "not_configured" }
  | { state: "configured_no_token"; url: string }
  | {
      state: "connected";
      url: string;
      tools_count: number | null;
      last_checked_at: string;
    }
  | {
      state: "stale_token";
      url: string;
      http_status: number;
      last_checked_at: string;
    }
  | {
      state: "unreachable";
      url: string;
      error: string;
      last_checked_at: string;
    };

export async function getMcpStatus(
  project_slug: string,
  catalog_key: string,
): Promise<McpRuntimeStatus> {
  const spec = mcpSpecByKey(project_slug, catalog_key);
  if (!spec) return { state: "not_configured" };
  const token = findCatalogMcpToken(project_slug, catalog_key);
  if (!token) return { state: "not_configured" };

  // Cache short-circuit: only `connected` (60s) and `unreachable` (10s)
  // results live in the cache. `stale_token` is deliberately uncached so
  // a reconnect surfaces fresh state on the very next render. See
  // probe-cache.ts for the rationale.
  const cached = getCachedProbe(project_slug, catalog_key);
  if (cached) return cached;

  const fresh = await probe(project_slug, catalog_key, spec.resource_url);
  setCachedProbe(project_slug, catalog_key, fresh);
  return fresh;
}

async function probe(
  project_slug: string,
  catalog_key: string,
  url: string,
): Promise<McpRuntimeStatus> {
  const last_checked_at = new Date().toISOString();
  // Use `initialize` — the spec-mandated first call — as the liveness
  // probe. Some MCP servers (Supabase) reject `tools/list` with HTTP 400
  // when no prior initialize has happened; `initialize` is universally
  // accepted as the opening message. We don't track the session ID since
  // we're not following up with another call in the probe; tool count
  // gets surfaced on demand via the View tools dialog (its own RPC).
  //
  // Goes through `mcpRpcAutoRefresh` so an expired access token gets
  // silently swapped for a fresh one instead of flapping the status to
  // "stale_token" on every page load.
  //
  // 6s budget: an OAuth-validated `initialize` across the public internet
  // typically lands in 0.3–1.5s, but cold serverless starts, SSE buffering
  // (the parser drains the full body before extracting the JSON-RPC frame),
  // and an upstream introspection RTT can stack. 2s was too tight and made
  // healthy connectors flap to "unreachable: timed out". 6s still bounds
  // page render at ~6s worst-case via Promise.all in the page component.
  const r = await mcpRpcAutoRefresh<unknown>(
    project_slug,
    catalog_key,
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "NotFair", version: "0.3.1" },
    },
    { timeoutMs: 6000 },
  );
  if (r.ok) {
    return {
      state: "connected",
      url,
      tools_count: null,
      last_checked_at,
    };
  }
  if (r.kind === "http_error" && (r.status === 401 || r.status === 403)) {
    return { state: "stale_token", url, http_status: r.status, last_checked_at };
  }
  if (r.kind === "http_error") {
    return {
      state: "unreachable",
      url,
      error: r.body ? `HTTP ${r.status}: ${r.body}` : `HTTP ${r.status}`,
      last_checked_at,
    };
  }
  if (r.kind === "timeout") {
    return { state: "unreachable", url, error: "timed out", last_checked_at };
  }
  if (r.kind === "aborted") {
    return { state: "unreachable", url, error: "aborted", last_checked_at };
  }
  if (r.kind === "rpc_error") {
    return {
      state: "unreachable",
      url,
      error: `rpc error ${r.code}: ${r.message}`,
      last_checked_at,
    };
  }
  if (r.kind === "malformed_response") {
    return {
      state: "unreachable",
      url,
      error: `malformed response: ${r.message}`,
      last_checked_at,
    };
  }
  return { state: "unreachable", url, error: r.message, last_checked_at };
}

export async function disconnectMcp(project_slug: string, catalog_key: string): Promise<void> {
  const keys = catalogKeysSharingResource(project_slug, catalog_key);
  const tokenIds = new Set<string>();
  for (const key of keys) {
    const token = findMcpToken(project_slug, key);
    if (token) tokenIds.add(token.id);
    invalidateProbe(project_slug, key);
  }
  for (const id of tokenIds) deleteMcpToken(id);
}

export async function setMcpBearer(
  project_slug: string,
  catalog_key: string,
  token: string,
  options: {
    scope?: string;
    expires_at?: string;
    refresh_token?: string;
    token_endpoint?: string;
    client_id?: string;
    client_secret?: string;
  } = {},
): Promise<void> {
  upsertMcpToken({
    project_slug,
    server_name: catalog_key,
    access_token: token,
    scope: options.scope,
    expires_at: options.expires_at,
    refresh_token: options.refresh_token,
    token_endpoint: options.token_endpoint,
    client_id: options.client_id,
    client_secret: options.client_secret,
  });
  // Drop any cached probe result so the badge reflects the new credentials
  // on the very next render instead of waiting out the TTL.
  invalidateProbe(project_slug, catalog_key);
}
