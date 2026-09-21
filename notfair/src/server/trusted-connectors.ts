import { CANONICAL_MCP_RESOURCE_URL } from "@/lib/canonical-mcp";

/**
 * Browseable directory of trusted MCP servers shown in the "Browse
 * connectors" dialog. Distinct from `MCP_CATALOG_PRESETS` (which is
 * always-visible per project): these are opt-in. Picking one writes a
 * row to `user_mcp_servers` via `addUserMcpServerAction` and triggers
 * the usual OAuth probe before persisting.
 *
 * The `resource_url`s here are the ones the providers publish; if a
 * vendor moves their MCP, the probe will surface the error and the
 * user can paste the correct URL via "Add custom connector" until we
 * update this list.
 *
 * **Why Vercel isn't here:**
 *
 * Vercel's DCR endpoint silently returns a single fixed `client_id`
 * (`cl_WbdtcToDrMR4ZHvXLGAmbfoYCsQjMeS8`) regardless of the request body,
 * and that client's pre-approved redirect-URI allowlist excludes every
 * loopback URI — verified with multiple `redirect_uri` shapes. Vercel's
 * MCP is wired only for their first-party integrations (Claude Desktop,
 * Cursor, etc., each with hardcoded redirect URIs Vercel approved out
 * of band); arbitrary OAuth-2.1 + DCR clients can't complete the flow
 * until Vercel opens up DCR or adds an allowlist entry for us.
 *
 * Users can still try via "Add custom connector"; presenting Vercel in
 * the curated grid would just produce a guaranteed failure toast.
 */

export type TrustedConnector = {
  /** Used purely for React keys + stable slugs in tests. */
  id: string;
  display_name: string;
  description: string;
  /** HTTPS resource URL the OAuth flow targets. */
  resource_url: string;
};

export const TRUSTED_CONNECTORS: TrustedConnector[] = [
  {
    id: "notfair-googleads",
    display_name: "NotFair Google Ads",
    description: "Campaigns, bids, keywords, search terms.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
  },
  {
    id: "notfair-metaads",
    display_name: "NotFair Meta Ads",
    description: "Facebook + Instagram campaigns, ad sets, budgets.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
  },
  {
    id: "notfair-googlesearchconsole",
    display_name: "NotFair Google Search Console",
    description: "Organic search performance, queries, pages, indexing.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
  },
  {
    id: "notfair-googleanalytics",
    display_name: "NotFair Google Analytics",
    description: "GA4 traffic, channels, conversions, audiences.",
    resource_url: CANONICAL_MCP_RESOURCE_URL,
  },
  {
    id: "stripe",
    display_name: "Stripe",
    description: "Payments, customers, subscriptions, invoices.",
    resource_url: "https://mcp.stripe.com/",
  },
  {
    id: "supabase",
    display_name: "Supabase",
    description: "Postgres, auth, storage, edge functions.",
    resource_url: "https://mcp.supabase.com/mcp",
  },
  {
    id: "posthog",
    display_name: "PostHog",
    description: "Product analytics, funnels, feature flags.",
    resource_url: "https://mcp.posthog.com/mcp",
  },
  {
    id: "mixpanel",
    display_name: "Mixpanel",
    description: "Event analytics, cohorts, retention.",
    resource_url: "https://mcp.mixpanel.com/mcp",
  },
];
