import { beforeEach, describe, expect, it, vi } from "vitest";

import { accountPickerFor } from "@/lib/mcp-account-pickers";
import {
  listGoogleAdsAccounts,
  listMetaAdsAccounts,
  listGscProperties,
  setOnboardingAccountAction,
  setOnboardingGscPropertyAction,
} from "@/server/onboarding/accounts";
import type { Project } from "@/types";

vi.mock("@/server/onboarding/accounts", () => ({
  listGoogleAdsAccounts: vi.fn(),
  setOnboardingAccountAction: vi.fn(),
  listMetaAdsAccounts: vi.fn(),
  setOnboardingMetaAdsAccountAction: vi.fn(),
  listGscProperties: vi.fn(),
  setOnboardingGscPropertyAction: vi.fn(),
}));

const project = {
  google_ads_account_id: "111",
  meta_ads_account_id: "act_222",
  gsc_property_id: "sc-domain:example.com",
} as Project;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("accountPickerFor", () => {
  it("returns null for MCPs without an account picker", () => {
    expect(accountPickerFor("notfair-xads")).toBeNull();
    expect(accountPickerFor("stripe")).toBeNull();
    expect(accountPickerFor("")).toBeNull();
  });

  it("covers exactly the three multi-account MCPs", () => {
    for (const key of [
      "notfair-googleads",
      "notfair-metaads",
      "notfair-googlesearchconsole",
    ]) {
      expect(accountPickerFor(key), key).not.toBeNull();
    }
  });

  it("reads the persisted selection off the matching project column", () => {
    expect(accountPickerFor("notfair-googleads")!.selectedId(project)).toBe(
      "111",
    );
    expect(accountPickerFor("notfair-metaads")!.selectedId(project)).toBe(
      "act_222",
    );
    expect(
      accountPickerFor("notfair-googlesearchconsole")!.selectedId(project),
    ).toBe("sc-domain:example.com");
  });
});

describe("list normalization", () => {
  it("maps Google Ads accounts without a default flag", async () => {
    vi.mocked(listGoogleAdsAccounts).mockResolvedValue({
      ok: true,
      accounts: [
        { id: "111", name: "Acme" },
        { id: "222", name: "Beta" },
      ],
    });
    const r = await accountPickerFor("notfair-googleads")!.list("proj");
    expect(r).toEqual({
      ok: true,
      items: [
        { id: "111", name: "Acme" },
        { id: "222", name: "Beta" },
      ],
    });
    expect(listGoogleAdsAccounts).toHaveBeenCalledWith("proj");
  });

  it("maps GSC properties through the same shape", async () => {
    vi.mocked(listGscProperties).mockResolvedValue({
      ok: true,
      properties: [
        { id: "sc-domain:a.com", name: "a.com", permission: "siteOwner" },
      ],
    });
    const r = await accountPickerFor("notfair-googlesearchconsole")!.list("p");
    expect(r).toEqual({
      ok: true,
      items: [{ id: "sc-domain:a.com", name: "a.com" }],
    });
  });

  it("passes list failures through untouched", async () => {
    vi.mocked(listMetaAdsAccounts).mockResolvedValue({
      ok: false,
      kind: "rpc",
      error: "HTTP 500",
    });
    const r = await accountPickerFor("notfair-metaads")!.list("p");
    expect(r).toEqual({ ok: false, error: "HTTP 500" });
  });
});

describe("set normalization", () => {
  it("delegates to the platform set action and simplifies the result", async () => {
    vi.mocked(setOnboardingAccountAction).mockResolvedValue({
      ok: true,
      project,
    });
    const r = await accountPickerFor("notfair-googleads")!.set("proj", "111");
    expect(r).toEqual({ ok: true });
    expect(setOnboardingAccountAction).toHaveBeenCalledWith("proj", "111");
  });

  it("surfaces set failures as { ok: false, error }", async () => {
    vi.mocked(setOnboardingGscPropertyAction).mockResolvedValue({
      ok: false,
      error: "Property X isn't reachable.",
    });
    const r = await accountPickerFor("notfair-googlesearchconsole")!.set(
      "proj",
      "X",
    );
    expect(r).toEqual({ ok: false, error: "Property X isn't reachable." });
  });
});
