"use server";

import { revalidatePath } from "next/cache";

import { getMcpConfig, mcpRpcAutoRefresh } from "@/server/mcp/rpc";
import {
  getProject,
  setProjectGoogleAdsAccount,
  setProjectMetaAdsAccount,
  setProjectGscProperty,
} from "@/server/db/projects";
import type { Project } from "@/types";

/**
 * Google Ads account picker for onboarding step=account.
 *
 * notfair.co's MCP bearer can grant access to multiple customer accounts
 * (Demo2 case: 5 accounts under one bearer). The onboarding flow asks the
 * user to pick one and we persist the choice on `projects.google_ads_account_id`
 * so the audit + later automation target the right account.
 *
 * Single source of truth for the account ID is the DB column. MCP listings
 * return accounts equally; we never treat one as the default.
 */

export type GoogleAdsAccount = { id: string; name: string };

export type ListAccountsResult =
  | { ok: true; accounts: GoogleAdsAccount[] }
  | { ok: false; error: string; kind: "mcp_not_configured" | "rpc" | "shape" };

type ListAccountsToolResult = {
  content?: Array<{ type?: string; text?: string }>;
  isError?: boolean;
};

type AccountsPayload = {
  accounts?: Array<{ id?: unknown; name?: unknown }>;
  totalAccounts?: unknown;
};

const MCP_CATALOG_KEY = "notfair-googleads";
const LIST_TIMEOUT_MS = 8_000;
const GOOGLE_ADS_LIST_CAPABILITY = "google_ads_listConnectedAccounts";

function compactExecuteRead(capabilityId: string) {
  return {
    name: "executeRead" as const,
    arguments: { capabilityId, arguments: {} },
  };
}

/**
 * Call compact `executeRead` for Google Ads accounts with the project's stored bearer.
 * Returns the account list (id + name).
 */
export async function listGoogleAdsAccounts(
  project_slug: string,
): Promise<ListAccountsResult> {
  const cfg = getMcpConfig(project_slug, MCP_CATALOG_KEY);
  if (!cfg) {
    return {
      ok: false,
      kind: "mcp_not_configured",
      error: "Google Ads MCP is not configured for this project.",
    };
  }

  const rpcResult = await mcpRpcAutoRefresh<ListAccountsToolResult>(
    project_slug,
    MCP_CATALOG_KEY,
    "tools/call",
    compactExecuteRead(GOOGLE_ADS_LIST_CAPABILITY),
    { timeoutMs: LIST_TIMEOUT_MS },
  );

  if (!rpcResult.ok) {
    const message =
      rpcResult.kind === "http_error"
        ? `HTTP ${rpcResult.status}`
        : rpcResult.kind === "rpc_error"
          ? `RPC ${rpcResult.code}: ${rpcResult.message}`
          : rpcResult.kind === "timeout"
            ? "MCP call timed out"
            : rpcResult.kind === "aborted"
              ? "MCP call aborted"
              : rpcResult.kind === "malformed_response"
                ? rpcResult.message
                : rpcResult.message;
    return { ok: false, kind: "rpc", error: message };
  }

  const parsed = parseAccountsPayload(rpcResult.result);
  if (!parsed) {
    return {
      ok: false,
      kind: "shape",
      error: "MCP listConnectedAccounts returned an unexpected shape.",
    };
  }
  return { ok: true, ...parsed };
}

function parseAccountsPayload(
  result: ListAccountsToolResult,
): { accounts: GoogleAdsAccount[] } | null {
  if (!result || typeof result !== "object") return null;
  if (result.isError) return null;
  const text = result.content?.[0]?.text;
  if (typeof text !== "string") return null;
  let body: AccountsPayload;
  try {
    body = JSON.parse(text) as AccountsPayload;
  } catch {
    return null;
  }
  if (!body || typeof body !== "object" || !Array.isArray(body.accounts)) {
    return null;
  }
  const accounts: GoogleAdsAccount[] = [];
  for (const a of body.accounts) {
    if (!a || typeof a !== "object") continue;
    const id = String(a.id ?? "").trim();
    const name = String(a.name ?? "").trim() || id;
    if (id) accounts.push({ id, name });
  }
  return { accounts };
}

export type SetAccountResult =
  | { ok: true; project: Project }
  | { ok: false; error: string };

/**
 * Persist the chosen Google Ads account on the project row. Validates the
 * account_id against the MCP's reachable list (anti-tamper for the form
 * submit). Goal agents pick this up via get_project / their identity.
 */
export async function setOnboardingAccountAction(
  project_slug: string,
  account_id: string,
): Promise<SetAccountResult> {
  if (!project_slug.trim() || !account_id.trim()) {
    return { ok: false, error: "Missing project slug or account id." };
  }
  const project = getProject(project_slug);
  if (!project) return { ok: false, error: "Project not found." };

  // Validate the account exists for this bearer. Defends against URL/form
  // tampering that would otherwise let a user persist any string here.
  const list = await listGoogleAdsAccounts(project_slug);
  if (!list.ok) {
    return {
      ok: false,
      error: `Couldn't verify account against MCP: ${list.error}`,
    };
  }
  const match = list.accounts.find((a) => a.id === account_id);
  if (!match) {
    return {
      ok: false,
      error: `Account ${account_id} isn't in this bearer's reachable accounts.`,
    };
  }

  const updated = setProjectGoogleAdsAccount(project_slug, match.id);
  if (!updated) return { ok: false, error: "Project not found." };

  revalidatePath("/", "layout");
  return { ok: true, project: updated };
}

const META_ADS_MCP_KEY = "notfair-metaads";
const META_ADS_LIST_CAPABILITY = "meta_ads_listAdAccounts";

export type MetaAdsAccount = {
  /** Numeric ad-account id with the `act_` prefix (e.g. `act_123456`). */
  id: string;
  /** Display name pulled from the Meta Graph payload. Falls back to id. */
  name: string;
};

export type ListMetaAdsAccountsResult =
  | { ok: true; accounts: MetaAdsAccount[] }
  | { ok: false; error: string; kind: "mcp_not_configured" | "rpc" | "shape" };

export async function listMetaAdsAccounts(
  project_slug: string,
): Promise<ListMetaAdsAccountsResult> {
  const cfg = getMcpConfig(project_slug, META_ADS_MCP_KEY);
  if (!cfg) {
    return {
      ok: false,
      kind: "mcp_not_configured",
      error: "Meta Ads MCP is not configured for this project.",
    };
  }

  const rpcResult = await mcpRpcAutoRefresh<ListAccountsToolResult>(
    project_slug,
    META_ADS_MCP_KEY,
    "tools/call",
    compactExecuteRead(META_ADS_LIST_CAPABILITY),
    { timeoutMs: LIST_TIMEOUT_MS },
  );
  if (!rpcResult.ok) {
    return { ok: false, kind: "rpc", error: rpcErrorMessage(rpcResult) };
  }

  const parsed = parseMetaAccountsPayload(rpcResult.result);
  if (!parsed) {
    return {
      ok: false,
      kind: "shape",
      error: `MCP ${META_ADS_LIST_CAPABILITY} returned an unexpected shape.`,
    };
  }
  return { ok: true, ...parsed };
}

type MetaAccountsPayload = {
  // The Meta MCP wraps Graph API responses, which use `data` for the
  // collection. We also accept the Google-Ads-style `accounts` key
  // defensively in case the MCP normalizes the shape upstream.
  data?: Array<{ id?: unknown; name?: unknown; account_id?: unknown }>;
  accounts?: Array<{ id?: unknown; name?: unknown }>;
};

function parseMetaAccountsPayload(
  result: ListAccountsToolResult,
): { accounts: MetaAdsAccount[] } | null {
  if (!result || typeof result !== "object") return null;
  if (result.isError) return null;
  const text = result.content?.[0]?.text;
  if (typeof text !== "string") return null;
  let body: MetaAccountsPayload;
  try {
    body = JSON.parse(text) as MetaAccountsPayload;
  } catch {
    return null;
  }
  const raw = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.accounts)
      ? body.accounts
      : null;
  if (!raw) return null;
  const accounts: MetaAdsAccount[] = [];
  for (const a of raw) {
    if (!a || typeof a !== "object") continue;
    const id = String(a.id ?? "").trim();
    const name = String(a.name ?? "").trim() || id;
    if (id) accounts.push({ id, name });
  }
  return { accounts };
}

export type SetMetaAdsAccountResult =
  | { ok: true; project: Project }
  | { ok: false; error: string };

export async function setOnboardingMetaAdsAccountAction(
  project_slug: string,
  account_id: string,
): Promise<SetMetaAdsAccountResult> {
  if (!project_slug.trim() || !account_id.trim()) {
    return { ok: false, error: "Missing project slug or account id." };
  }
  if (!getProject(project_slug)) return { ok: false, error: "Project not found." };

  const list = await listMetaAdsAccounts(project_slug);
  if (!list.ok) {
    return {
      ok: false,
      error: `Couldn't verify account against Meta Ads MCP: ${list.error}`,
    };
  }
  const match = list.accounts.find((a) => a.id === account_id);
  if (!match) {
    return {
      ok: false,
      error: `Account ${account_id} isn't in this bearer's reachable accounts.`,
    };
  }
  const updated = setProjectMetaAdsAccount(project_slug, match.id);
  if (!updated) return { ok: false, error: "Project not found." };
  revalidatePath("/", "layout");
  return { ok: true, project: updated };
}

// ── Google Search Console property picker ──────────────────────────
//
// Mirrors the Google Ads pattern. Per the GSC REST API the unit is a
// "site" (e.g. `https://example.com/` or `sc-domain:example.com`); we
// surface them as "properties" in the UI to match what users see in
// Search Console.
//
// The compact NotFair MCP exposes `search_console_listProperties` via
// executeRead (verified against the live server) which returns a bare JSON
// array of `{ siteUrl, permissionLevel }`. We also accept the spec-shaped
// `{ siteEntry: [...] }` wrap and a defensive `{ sites: [...] }` so a
// future server-side change doesn't break the picker.

const GSC_MCP_KEY = "notfair-googlesearchconsole";
const GSC_LIST_CAPABILITY = "search_console_listProperties";

export type GscProperty = {
  /** Site URL exactly as Search Console uses it. */
  id: string;
  /** Display label — typically equals id but trimmed of the scheme. */
  name: string;
  /** Permission level the bearer has on this property (owner / full / …). */
  permission?: string;
};

export type ListGscPropertiesResult =
  | { ok: true; properties: GscProperty[] }
  | { ok: false; error: string; kind: "mcp_not_configured" | "rpc" | "shape" };

export async function listGscProperties(
  project_slug: string,
): Promise<ListGscPropertiesResult> {
  const cfg = getMcpConfig(project_slug, GSC_MCP_KEY);
  if (!cfg) {
    return {
      ok: false,
      kind: "mcp_not_configured",
      error: "Google Search Console MCP is not configured for this project.",
    };
  }

  const rpcResult = await mcpRpcAutoRefresh<ListAccountsToolResult>(
    project_slug,
    GSC_MCP_KEY,
    "tools/call",
    compactExecuteRead(GSC_LIST_CAPABILITY),
    { timeoutMs: LIST_TIMEOUT_MS },
  );
  if (!rpcResult.ok) {
    return { ok: false, kind: "rpc", error: rpcErrorMessage(rpcResult) };
  }

  const parsed = parseGscPropertiesPayload(rpcResult.result);
  if (!parsed) {
    return {
      ok: false,
      kind: "shape",
      error: `MCP ${GSC_LIST_CAPABILITY} returned an unexpected shape.`,
    };
  }
  return { ok: true, ...parsed };
}

type GscSiteRow = {
  siteUrl?: unknown;
  permissionLevel?: unknown;
  id?: unknown;
  name?: unknown;
};

type GscPropertiesPayload =
  // The actual notfair-googlesearchconsole MCP returns a bare array.
  | GscSiteRow[]
  // Spec shape per the Search Console REST API.
  | { siteEntry?: GscSiteRow[]; sites?: GscSiteRow[] };

function parseGscPropertiesPayload(
  result: ListAccountsToolResult,
): { properties: GscProperty[] } | null {
  if (!result || typeof result !== "object") return null;
  if (result.isError) return null;
  const text = result.content?.[0]?.text;
  if (typeof text !== "string") return null;
  let body: GscPropertiesPayload;
  try {
    body = JSON.parse(text) as GscPropertiesPayload;
  } catch {
    return null;
  }

  // Normalize all three accepted shapes down to a single row list.
  const rows: GscSiteRow[] | null = Array.isArray(body)
    ? body
    : Array.isArray(body?.siteEntry)
      ? body.siteEntry
      : Array.isArray(body?.sites)
        ? body.sites
        : null;
  // Empty arrays are valid: a connected bearer can legitimately have no
  // reachable properties. Only reject objects with neither supported key.
  if (!rows) return null;

  const properties: GscProperty[] = [];
  for (const s of rows) {
    if (!s || typeof s !== "object") continue;
    const id = String(s.siteUrl ?? s.id ?? "").trim();
    if (!id) continue;
    const customName = typeof s.name === "string" ? s.name.trim() : "";
    properties.push({
      id,
      name: customName || prettyGscName(id),
      permission:
        typeof s.permissionLevel === "string" ? s.permissionLevel : undefined,
    });
  }
  return { properties };
}

function prettyGscName(siteUrl: string): string {
  // `sc-domain:example.com` → `example.com`
  // `https://example.com/` → `example.com`
  if (siteUrl.startsWith("sc-domain:")) return siteUrl.slice("sc-domain:".length);
  try {
    const u = new URL(siteUrl);
    return u.host + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return siteUrl;
  }
}

export type SetGscPropertyResult =
  | { ok: true; project: Project }
  | { ok: false; error: string };

export async function setOnboardingGscPropertyAction(
  project_slug: string,
  property_id: string,
): Promise<SetGscPropertyResult> {
  if (!project_slug.trim() || !property_id.trim()) {
    return { ok: false, error: "Missing project slug or property id." };
  }
  if (!getProject(project_slug)) return { ok: false, error: "Project not found." };

  const list = await listGscProperties(project_slug);
  if (!list.ok) {
    return {
      ok: false,
      error: `Couldn't verify property against GSC MCP: ${list.error}`,
    };
  }
  const match = list.properties.find((p) => p.id === property_id);
  if (!match) {
    return {
      ok: false,
      error: `Property ${property_id} isn't in this bearer's reachable properties.`,
    };
  }
  const updated = setProjectGscProperty(project_slug, match.id);
  if (!updated) return { ok: false, error: "Project not found." };
  revalidatePath("/", "layout");
  return { ok: true, project: updated };
}

// ── Onboarding connect-step cards ──────────────────────────────────
//
// The connect step renders the exact `McpCard` rows the Connections page
// uses — one shared component, one lifecycle (Connect → Choose → Switch),
// zero drift between the two surfaces. This action assembles the card
// inputs client-side onboarding can't compute itself: the catalog spec,
// the live runtime status, and the persisted account/property selection.
//
// The list is curated for the wizard: the recommended MCPs (the ones
// goal agents most commonly measure) always show; anything else from the
// catalog (Google Analytics, Stripe, user-pasted servers) appears only
// once connected — until then it lives in the "More tools" browse menu.

const RECOMMENDED_MCP_KEYS = new Set([
  "notfair-googleads",
  "notfair-metaads",
  "notfair-googlesearchconsole",
  "notfair-xads",
]);

export type ConnectCard = {
  spec: import("@/server/mcp-catalog").McpSpec;
  status: import("@/server/mcp/state").McpRuntimeStatus;
  /** Persisted account/property selection — null when unset/not pickable. */
  selected_id: string | null;
};

export type GetConnectCardsResult =
  | { ok: true; cards: ConnectCard[]; any_connected: boolean }
  | { ok: false; error: string };

export async function getOnboardingConnectCardsAction(
  project_slug: string,
): Promise<GetConnectCardsResult> {
  if (!project_slug.trim()) return { ok: false, error: "Missing project slug." };
  const project = getProject(project_slug);
  if (!project) return { ok: false, error: "Project not found." };

  const { getMcpCatalog } = await import("@/server/mcp-catalog");
  const { getMcpStatus } = await import("@/server/mcp/state");
  const { accountPickerFor } = await import("@/lib/mcp-account-pickers");

  const catalog = getMcpCatalog(project_slug);
  const statuses = await Promise.all(
    catalog.map((s) => getMcpStatus(project_slug, s.key)),
  );
  const all = catalog.map((spec, i) => ({
    spec,
    status: statuses[i]!,
    selected_id: accountPickerFor(spec.key)?.selectedId(project) ?? null,
  }));
  return {
    ok: true,
    cards: all.filter(
      (c) =>
        RECOMMENDED_MCP_KEYS.has(c.spec.key) || c.status.state === "connected",
    ),
    any_connected: all.some((c) => c.status.state === "connected"),
  };
}

// ── Shared RPC error formatter ─────────────────────────────────────

function rpcErrorMessage(
  rpcResult: Extract<
    Awaited<ReturnType<typeof mcpRpcAutoRefresh>>,
    { ok: false }
  >,
): string {
  if (rpcResult.kind === "http_error") return `HTTP ${rpcResult.status}`;
  if (rpcResult.kind === "rpc_error")
    return `RPC ${rpcResult.code}: ${rpcResult.message}`;
  if (rpcResult.kind === "timeout") return "MCP call timed out";
  if (rpcResult.kind === "aborted") return "MCP call aborted";
  if (rpcResult.kind === "malformed_response") return rpcResult.message;
  return rpcResult.message;
}
