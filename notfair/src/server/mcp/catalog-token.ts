import { getMcpCatalog, mcpSpecByKey } from "@/server/mcp-catalog";
import { findMcpToken, type McpToken } from "@/server/mcp/tokens";
import { normalizeResourceUrl } from "@/server/mcp/discovery-url";

/**
 * Look up the stored token for a catalog key, then fall back to any other
 * catalog entry that advertises the same resource URL.
 *
 * NotFair presets all point at `/api/mcp/notfair`, so one OAuth grant is
 * enough for Google Ads, Meta Ads, Search Console, Analytics, and X Ads.
 */
export function findCatalogMcpToken(
  project_slug: string,
  catalog_key: string,
): McpToken | null {
  const direct = findMcpToken(project_slug, catalog_key);
  if (direct) return direct;

  const spec = mcpSpecByKey(project_slug, catalog_key);
  if (!spec) return null;
  const target = normalizeResourceUrl(spec.resource_url);
  for (const other of getMcpCatalog(project_slug)) {
    if (other.key === catalog_key) continue;
    if (normalizeResourceUrl(other.resource_url) !== target) continue;
    const token = findMcpToken(project_slug, other.key);
    if (token) return token;
  }
  return null;
}

/** Catalog keys that share this entry's resource URL, including itself. */
export function catalogKeysSharingResource(
  project_slug: string,
  catalog_key: string,
): string[] {
  const spec = mcpSpecByKey(project_slug, catalog_key);
  if (!spec) return [catalog_key];
  const target = normalizeResourceUrl(spec.resource_url);
  return getMcpCatalog(project_slug)
    .filter((entry) => normalizeResourceUrl(entry.resource_url) === target)
    .map((entry) => entry.key);
}
