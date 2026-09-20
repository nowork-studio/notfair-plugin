import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  resolvePostConnectSelection,
  prefetchAccountChoice,
} from "@/server/mcp/account-selection";
import {
  getProject,
  setProjectGscProperty,
  setProjectGoogleAdsAccount,
} from "@/server/db/projects";
import { listGscProperties } from "@/server/onboarding/accounts";
import type { Project } from "@/types";

// Mock at the platform-action + db layer so the real registry
// (mcp-account-pickers) is exercised as part of the resolution.
vi.mock("@/server/onboarding/accounts", () => ({
  listGoogleAdsAccounts: vi.fn(),
  setOnboardingAccountAction: vi.fn(),
  listMetaAdsAccounts: vi.fn(),
  setOnboardingMetaAdsAccountAction: vi.fn(),
  listGscProperties: vi.fn(),
  setOnboardingGscPropertyAction: vi.fn(),
}));
vi.mock("@/server/db/projects", () => ({
  getProject: vi.fn(),
  setProjectGoogleAdsAccount: vi.fn(),
  setProjectMetaAdsAccount: vi.fn(),
  setProjectGscProperty: vi.fn(),
}));

const GSC = "notfair-googlesearchconsole";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    google_ads_account_id: null,
    meta_ads_account_id: null,
    gsc_property_id: null,
    ...overrides,
  } as Project;
}

function gscList(ids: string[]) {
  vi.mocked(listGscProperties).mockResolvedValue({
    ok: true,
    properties: ids.map((id) => ({ id, name: id })),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolvePostConnectSelection", () => {
  it("is not_pickable for MCPs without a picker (never lists)", async () => {
    const r = await resolvePostConnectSelection("proj", "notfair-xads");
    expect(r).toEqual({ kind: "not_pickable" });
    expect(listGscProperties).not.toHaveBeenCalled();
  });

  it("is not_pickable when the project row is gone", async () => {
    vi.mocked(getProject).mockReturnValue(null);
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({ kind: "not_pickable" });
  });

  it("keeps an existing selection the new bearer can still reach", async () => {
    vi.mocked(getProject).mockReturnValue(
      makeProject({ gsc_property_id: "sc-domain:a.com" }),
    );
    gscList(["sc-domain:a.com", "sc-domain:b.com"]);
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({ kind: "kept_existing" });
    expect(setProjectGscProperty).not.toHaveBeenCalled();
  });

  it("auto-persists the only reachable account", async () => {
    vi.mocked(getProject).mockReturnValue(makeProject());
    gscList(["sc-domain:only.com"]);
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({
      kind: "auto_selected",
      id: "sc-domain:only.com",
      name: "sc-domain:only.com",
    });
    expect(setProjectGscProperty).toHaveBeenCalledWith(
      "proj",
      "sc-domain:only.com",
    );
  });

  it("requires a choice when the bearer reaches several accounts", async () => {
    vi.mocked(getProject).mockReturnValue(makeProject());
    gscList(["sc-domain:a.com", "sc-domain:b.com"]);
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({ kind: "choice_required" });
    expect(setProjectGscProperty).not.toHaveBeenCalled();
  });

  it("requires a choice when the old selection is no longer reachable", async () => {
    vi.mocked(getProject).mockReturnValue(
      makeProject({ gsc_property_id: "sc-domain:gone.com" }),
    );
    gscList(["sc-domain:a.com", "sc-domain:b.com"]);
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({ kind: "choice_required" });
  });

  it("requires a choice (to surface the problem) when the list call fails", async () => {
    vi.mocked(getProject).mockReturnValue(makeProject());
    vi.mocked(listGscProperties).mockResolvedValue({
      ok: false,
      kind: "rpc",
      error: "timeout",
    });
    const r = await resolvePostConnectSelection("proj", GSC);
    expect(r).toEqual({ kind: "choice_required" });
  });

  it("routes each platform to its own project column", async () => {
    const { listGoogleAdsAccounts } = await import(
      "@/server/onboarding/accounts"
    );
    vi.mocked(getProject).mockReturnValue(makeProject());
    vi.mocked(listGoogleAdsAccounts).mockResolvedValue({
      ok: true,
      accounts: [{ id: "123", name: "Only" }],
    });
    await resolvePostConnectSelection("proj", "notfair-googleads");
    expect(setProjectGoogleAdsAccount).toHaveBeenCalledWith("proj", "123");
    expect(setProjectGscProperty).not.toHaveBeenCalled();
  });
});

describe("prefetchAccountChoice", () => {
  it("returns null for non-pickable MCPs", async () => {
    const r = await prefetchAccountChoice(makeProject(), "stripe");
    expect(r).toBeNull();
  });

  it("returns null when the persisted selection is still reachable", async () => {
    gscList(["sc-domain:a.com"]);
    const r = await prefetchAccountChoice(
      makeProject({ gsc_property_id: "sc-domain:a.com" }),
      GSC,
    );
    expect(r).toBeNull();
  });

  it("hands the list + current selection to the dialog when a choice is due", async () => {
    gscList(["sc-domain:a.com", "sc-domain:b.com"]);
    const r = await prefetchAccountChoice(
      makeProject({ gsc_property_id: "sc-domain:gone.com" }),
      GSC,
    );
    expect(r).toEqual({
      prefetch: {
        ok: true,
        items: [
          { id: "sc-domain:a.com", name: "sc-domain:a.com" },
          { id: "sc-domain:b.com", name: "sc-domain:b.com" },
        ],
      },
      selected_id: "sc-domain:gone.com",
    });
  });

  it("passes a list failure through so the dialog can show it", async () => {
    vi.mocked(listGscProperties).mockResolvedValue({
      ok: false,
      kind: "rpc",
      error: "HTTP 502",
    });
    const r = await prefetchAccountChoice(makeProject(), GSC);
    expect(r).toEqual({
      prefetch: { ok: false, error: "HTTP 502" },
      selected_id: null,
    });
  });

  it("never writes — auto-selection is the OAuth callback's job", async () => {
    gscList(["sc-domain:only.com"]);
    await prefetchAccountChoice(makeProject(), GSC);
    expect(setProjectGscProperty).not.toHaveBeenCalled();
  });
});
