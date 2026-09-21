/**
 * Project-scoped catalog of MCP servers the NotFair UI knows about.
 *
 * Two sources merge into one list:
 *
 *  - Static **presets** (this file): curated entries we ship with —
 *    server URL + OAuth discovery doc are stable, so the connect flow
 *    can drive end-to-end with zero LLM in the loop.
 *  - **User-added** servers (`user_mcp_servers` SQLite table): anything
 *    the user registers from the Connections page. Same `McpSpec` shape;
 *    distinguished by `source: 'user'` so the UI can offer a "Remove"
 *    action.
 *
 * Everything downstream of the catalog (OAuth callback, token storage in
 * `mcp_tokens`, harness adapter `registerMcp`) is keyed off `spec.key`,
 * which doubles as `mcp_tokens.server_name`. So both kinds of entries
 * flow through the same code paths once registered.
 */

import { listUserMcpServers } from "@/server/db/user-mcp-servers";
import { getHiddenMcpPresetKeys } from "@/server/db/projects";
import {
  CANONICAL_MCP_DISCOVERY_URL,
  CANONICAL_MCP_RESOURCE_URL,
} from "@/lib/canonical-mcp";

export {
  CANONICAL_MCP_DISCOVERY_URL,
  CANONICAL_MCP_RESOURCE_URL,
} from "@/lib/canonical-mcp";

export type McpSpec = {
  /** Stable catalog identifier (used by the UI + mcp_tokens.server_name). */
  key: string;
  display_name: string;
  description: string;
  /** Resource URL the token authenticates against (RFC 8707 audience). */
  resource_url: string;
  /** RFC 9728 protected-resource discovery endpoint. */
  discovery_url: string;
  /** Where this entry came from — presets are immutable from the UI. */
  source: "preset" | "user";
};

export const MCP_CATALOG_PRESETS: McpSpec[] = [
  {
    key: "notfair-googleads",
    display_name: "NotFair Google Ads",
    description:
      "Live Google Ads operations: campaigns, bids, budgets, keywords, search terms, change history.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
    discovery_url: CANONICAL_MCP_DISCOVERY_URL,
    source: "preset",
  },
  {
    key: "notfair-metaads",
    display_name: "NotFair Meta Ads",
    description:
      "Live Meta Ads (Facebook + Instagram) operations: campaigns, ad sets, ads, creatives, insights.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
    discovery_url: CANONICAL_MCP_DISCOVERY_URL,
    source: "preset",
  },
  {
    key: "notfair-googlesearchconsole",
    display_name: "NotFair Google Search Console",
    description:
      "Organic search performance: queries, pages, impressions, clicks, indexing.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
    discovery_url: CANONICAL_MCP_DISCOVERY_URL,
    source: "preset",
  },
  {
    key: "notfair-googleanalytics",
    display_name: "NotFair Google Analytics",
    description:
      "GA4 traffic and conversion analytics: sessions, channels, pages, events, audiences.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
    discovery_url: CANONICAL_MCP_DISCOVERY_URL,
    source: "preset",
  },
  {
    key: "notfair-xads",
    display_name: "NotFair X Ads",
    description:
      "Live X (Twitter) Ads operations: campaigns, line items, promoted posts, analytics.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
    discovery_url: CANONICAL_MCP_DISCOVERY_URL,
    source: "preset",
  },
];

/** True if any preset reserves this key. Presets win over user rows. */
export function isPresetKey(key: string): boolean {
  return MCP_CATALOG_PRESETS.some((p) => p.key === key);
}

export function getMcpPresets(): McpSpec[] {
  return MCP_CATALOG_PRESETS;
}

/**
 * Return the merged catalog for a project: presets first, then user-added
 * rows. A preset key shadows any colliding user row (which the add-server
 * action prevents at insert time, but we double-check on read too).
 */
export function getMcpCatalog(project_slug: string): McpSpec[] {
  const hidden = new Set(getHiddenMcpPresetKeys(project_slug));
  const presets = MCP_CATALOG_PRESETS.filter((p) => !hidden.has(p.key));
  const presetKeys = new Set(presets.map((p) => p.key));
  const userRows = listUserMcpServers(project_slug)
    .filter((row) => !presetKeys.has(row.key))
    .map<McpSpec>((row) => ({
      key: row.key,
      display_name: row.display_name,
      description: row.description,
      resource_url: row.resource_url,
      discovery_url: row.discovery_url,
      source: "user",
    }));
  return [...presets, ...userRows];
}

export function mcpSpecByKey(
  project_slug: string,
  key: string,
): McpSpec | undefined {
  return getMcpCatalog(project_slug).find((m) => m.key === key);
}
