/**
 * Registry of MCPs whose bearer can span multiple accounts/properties and
 * therefore need a per-project selection (persisted on the `projects` row —
 * goal agents read it from their identity's "Workspace facts").
 *
 * One entry per pickable catalog key, normalizing the per-platform list/set
 * server actions from `@/server/onboarding/accounts` into a single shape so
 * the Connections-page picker dialog can drive any of them. The onboarding
 * wizard keeps its own step-based UI over the same actions.
 *
 * This module carries no directive on purpose: the server-rendered
 * Connections page uses `selectedId` to read the persisted choice off the
 * project row, and the client dialog uses `list`/`set` (which resolve to
 * server-action stubs on the client).
 */

import {
  listGoogleAdsAccounts,
  setOnboardingAccountAction,
  listMetaAdsAccounts,
  setOnboardingMetaAdsAccountAction,
  listGscProperties,
  setOnboardingGscPropertyAction,
} from "@/server/onboarding/accounts";
import type { Project } from "@/types";

export type AccountPickerItem = {
  id: string;
  name: string;
};

export type AccountPickerListResult =
  | { ok: true; items: AccountPickerItem[] }
  | { ok: false; error: string };

export type AccountPickerSetResult =
  | { ok: true }
  | { ok: false; error: string };

export type AccountPickerSpec = {
  /** Human noun for the selectable unit, e.g. "Google Ads account". */
  noun: string;
  /** Bare unit for tight UI slots ("account" / "property") — the card's
   *  primary button says "Choose account", not the full noun. */
  short_noun: string;
  /** Label shown before the raw id under each row, e.g. "Customer ID". */
  id_label: string;
  list: (project_slug: string) => Promise<AccountPickerListResult>;
  set: (project_slug: string, id: string) => Promise<AccountPickerSetResult>;
  /** Read the persisted selection off the project row. */
  selectedId: (project: Project) => string | null;
};

const PICKERS: Record<string, AccountPickerSpec> = {
  "notfair-googleads": {
    noun: "Google Ads account",
    short_noun: "account",
    id_label: "Customer ID",
    list: async (slug) => {
      const r = await listGoogleAdsAccounts(slug);
      if (!r.ok) return { ok: false, error: r.error };
      return {
        ok: true,
        items: r.accounts.map((a) => ({
          id: a.id,
          name: a.name,
        })),
      };
    },
    set: async (slug, id) => {
      const r = await setOnboardingAccountAction(slug, id);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    },
    selectedId: (p) => p.google_ads_account_id,
  },
  "notfair-metaads": {
    noun: "Meta ad account",
    short_noun: "account",
    id_label: "Ad account ID",
    list: async (slug) => {
      const r = await listMetaAdsAccounts(slug);
      if (!r.ok) return { ok: false, error: r.error };
      return {
        ok: true,
        items: r.accounts.map((a) => ({
          id: a.id,
          name: a.name,
        })),
      };
    },
    set: async (slug, id) => {
      const r = await setOnboardingMetaAdsAccountAction(slug, id);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    },
    selectedId: (p) => p.meta_ads_account_id,
  },
  "notfair-googlesearchconsole": {
    noun: "Search Console property",
    short_noun: "property",
    id_label: "Property",
    list: async (slug) => {
      const r = await listGscProperties(slug);
      if (!r.ok) return { ok: false, error: r.error };
      return {
        ok: true,
        items: r.properties.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      };
    },
    set: async (slug, id) => {
      const r = await setOnboardingGscPropertyAction(slug, id);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    },
    selectedId: (p) => p.gsc_property_id,
  },
};

/** Picker spec for a catalog key, or null when the MCP has no account picker. */
export function accountPickerFor(mcp_key: string): AccountPickerSpec | null {
  return PICKERS[mcp_key] ?? null;
}
