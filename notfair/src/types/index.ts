// Shared types. Imported by both server (Next.js API + MCP) and client (React).

export type Project = {
  id: string;
  slug: string;
  display_name: string;
  created_at: string;
  archived_at: string | null;
  /**
   * Selected Google Ads customer ID for this project. Bearers from
   * notfair.co/api/mcp/notfair can grant access to multiple customer
   * accounts; the onboarding flow asks the user to pick one and persists
   * it here so the audit + later automation target the right account.
   * Null until the user picks (or until /onboarding gets re-run).
   */
  google_ads_account_id: string | null;
  /**
   * Selected Meta Ads ad-account id (e.g. "act_123456"). Same pattern as
   * google_ads_account_id: the notfair-metaads bearer may grant access
   * to multiple ad accounts, and onboarding asks the user to pick the
   * one this project should target. Null until picked.
   */
  meta_ads_account_id: string | null;
  /**
   * Selected Google Search Console property id (e.g. "sc-domain:example.com"
   * or "https://example.com/"). Same idea as the ad-account fields: the
   * notfair-googlesearchconsole bearer may cover multiple verified
   * properties, and we persist the chosen one. Null until picked.
   */
  gsc_property_id: string | null;
  /**
   * Optional inputs the user provided at onboarding — starting points
   * for agents exploring what the project is. Both are free-text.
   */
  website_url: string | null;
  codebase_path: string | null;
  /**
   * Which harness adapter runs this project's agents. Picked at
   * onboarding. "codex-local" is the recommended default; "claude-code-local"
   * runs through Anthropic's Claude Code CLI instead.
   */
  harness_adapter: "claude-code-local" | "codex-local";
};

export type ToolErrorEnvelope = {
  ok: false;
  error_code: string;
  message: string;
  retryable: boolean;
  user_message: string;
};

export type ToolSuccessEnvelope<T> = {
  ok: true;
  data: T;
};

export type ToolResult<T> = ToolSuccessEnvelope<T> | ToolErrorEnvelope;
