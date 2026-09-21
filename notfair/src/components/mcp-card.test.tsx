// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { McpCard } from "@/components/mcp-card";
import type { McpSpec } from "@/server/mcp-catalog";
import type { McpRuntimeStatus } from "@/server/mcp/state";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/server/actions/mcp", () => ({
  startMcpConnect: vi.fn(),
  disconnectMcpAction: vi.fn(),
  listMcpToolsAction: vi.fn(),
  removeUserMcpServerAction: vi.fn(),
}));
vi.mock("@/server/onboarding/accounts", () => ({
  listGoogleAdsAccounts: vi.fn(),
  setOnboardingAccountAction: vi.fn(),
  listMetaAdsAccounts: vi.fn(),
  setOnboardingMetaAdsAccountAction: vi.fn(),
  listGscProperties: vi.fn(),
  setOnboardingGscPropertyAction: vi.fn(),
}));

const gscSpec: McpSpec = {
  key: "notfair-googlesearchconsole",
  display_name: "NotFair Google Search Console",
  description: "Organic search performance.",
  resource_url: "https://notfair.co/api/mcp/notfair",
  discovery_url:
    "https://notfair.co/.well-known/oauth-protected-resource/api/mcp/notfair",
  source: "preset",
};

const xadsSpec: McpSpec = {
  ...gscSpec,
  key: "notfair-xads",
  display_name: "NotFair X Ads",
  resource_url: "https://notfair.co/api/mcp/notfair",
};

const connected: McpRuntimeStatus = { state: "connected" } as McpRuntimeStatus;
const notConfigured: McpRuntimeStatus = {
  state: "not_configured",
} as McpRuntimeStatus;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("McpCard primary action per setup state", () => {
  it("offers Connect when there is no token", () => {
    render(
      <McpCard spec={gscSpec} status={notConfigured} projectSlug="proj" />,
    );
    expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument();
    expect(screen.queryByText(/Choose property/)).not.toBeInTheDocument();
  });

  it("offers Choose property when connected with nothing selected", () => {
    render(
      <McpCard
        spec={gscSpec}
        status={connected}
        projectSlug="proj"
        selectedAccountId={null}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Choose property" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Connect" }),
    ).not.toBeInTheDocument();
    // Disconnect lives in the ⋯ menu now, never on the card face.
    expect(
      screen.queryByRole("button", { name: "Disconnect" }),
    ).not.toBeInTheDocument();
  });

  it("offers a quiet Switch property once configured, and shows the selection", () => {
    render(
      <McpCard
        spec={gscSpec}
        status={connected}
        projectSlug="proj"
        selectedAccountId="sc-domain:notfair.co"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Switch property" }),
    ).toBeInTheDocument();
    expect(screen.getByText("sc-domain:notfair.co")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Choose property" }),
    ).not.toBeInTheDocument();
  });

  it("shows no account action for MCPs without a picker", () => {
    render(<McpCard spec={xadsSpec} status={connected} projectSlug="proj" />);
    expect(screen.queryByText(/Choose|Switch/)).not.toBeInTheDocument();
    // The ⋯ menu is still there for Disconnect / Remove.
    expect(
      screen.getByRole("button", { name: /More options/ }),
    ).toBeInTheDocument();
  });
});