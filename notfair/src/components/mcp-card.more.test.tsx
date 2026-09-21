// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { McpCard } from "@/components/mcp-card";
import type { McpSpec } from "@/server/mcp-catalog";
import type { McpRuntimeStatus } from "@/server/mcp/state";

// Mock at the server-action boundary, per repo test conventions.
const startConnect = vi.hoisted(() => vi.fn());
const disconnect = vi.hoisted(() => vi.fn());
const listTools = vi.hoisted(() => vi.fn());
const removeServer = vi.hoisted(() => vi.fn());
vi.mock("@/server/actions/mcp", () => ({
  startMcpConnect: startConnect,
  disconnectMcpAction: disconnect,
  listMcpToolsAction: listTools,
  removeUserMcpServerAction: removeServer,
}));
vi.mock("@/server/onboarding/accounts", () => ({
  listGoogleAdsAccounts: vi.fn(),
  setOnboardingAccountAction: vi.fn(),
  listMetaAdsAccounts: vi.fn(),
  setOnboardingMetaAdsAccountAction: vi.fn(),
  listGscProperties: vi.fn(),
  setOnboardingGscPropertyAction: vi.fn(),
}));

const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));

const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const xadsSpec: McpSpec = {
  key: "notfair-xads",
  display_name: "NotFair X Ads",
  description: "X Ads campaigns.",
  resource_url: "https://notfair.co/api/mcp/notfair",
  discovery_url:
    "https://notfair.co/.well-known/oauth-protected-resource/api/mcp/notfair",
  source: "preset",
};

beforeEach(() => {
  vi.clearAllMocks();
});

function openOverflowMenu() {
  fireEvent.keyDown(screen.getByRole("button", { name: /More options/ }), {
    key: "Enter",
  });
}

describe("McpCard status rendering", () => {
  it("labels an expired token and offers Reconnect", () => {
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "stale_token", http_status: 401 } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    expect(screen.getByText("token expired")).toBeInTheDocument();
    expect(screen.getByText(/token rejected \(HTTP 401\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reconnect" })).toBeInTheDocument();
  });

  it("labels an unreachable server with its error detail", () => {
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "unreachable", error: "ECONNREFUSED" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    expect(screen.getByText("unreachable")).toBeInTheDocument();
    expect(screen.getByText("ECONNREFUSED")).toBeInTheDocument();
  });

  it("labels a configured server that is awaiting its bearer", () => {
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "configured_no_token" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    expect(screen.getByText("no token")).toBeInTheDocument();
    expect(screen.getByText("config saved, awaiting bearer")).toBeInTheDocument();
  });

  it("shows just host + connected state once connected", () => {
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "connected" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("connected");
    expect(screen.getByText("notfair.co")).toBeInTheDocument();
    // No detail after the host for a healthy connection.
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it("falls back to the raw resource URL when it cannot be parsed", () => {
    render(
      <McpCard
        spec={{ ...xadsSpec, resource_url: "not a url" }}
        status={{ state: "not_configured" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    expect(screen.getByText("not a url")).toBeInTheDocument();
    expect(screen.getByText("not connected")).toBeInTheDocument();
  });
});

describe("McpCard actions", () => {
  it("surfaces a Connect failure as a toast and re-enables the button", async () => {
    startConnect.mockResolvedValue({ ok: false, error: "no discovery" });
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "not_configured" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    await waitFor(() => {
      expect(startConnect).toHaveBeenCalledWith({
        mcp_key: "notfair-xads",
        return_to: window.location.pathname + window.location.search,
      });
      expect(toastError).toHaveBeenCalledWith("no discovery");
    });
    expect(screen.getByRole("button", { name: "Connect" })).toBeEnabled();
  });

  it("disconnects from the overflow menu and notifies the host", async () => {
    disconnect.mockResolvedValue({ ok: true });
    const onMutated = vi.fn();
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "connected" } as McpRuntimeStatus}
        projectSlug="proj"
        onMutated={onMutated}
      />,
    );
    openOverflowMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /disconnect/i }));
    await waitFor(() => {
      expect(disconnect).toHaveBeenCalledWith({ mcp_key: "notfair-xads" });
      expect(toastSuccess).toHaveBeenCalledWith("NotFair X Ads disconnected");
      expect(refresh).toHaveBeenCalled();
      expect(onMutated).toHaveBeenCalled();
    });
  });

  it("keeps the row when disconnect fails, with an error toast", async () => {
    disconnect.mockResolvedValue({ ok: false, error: "still in use" });
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "connected" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    openOverflowMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /disconnect/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("still in use"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("removes the server from the overflow menu", async () => {
    removeServer.mockResolvedValue({ ok: true });
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "not_configured" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    openOverflowMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /remove server/i }));
    await waitFor(() => {
      expect(removeServer).toHaveBeenCalledWith({ mcp_key: "notfair-xads" });
      expect(toastSuccess).toHaveBeenCalledWith("NotFair X Ads removed");
    });
  });

  it("opens the tools dialog from View tools, fetching via the server action", async () => {
    listTools.mockResolvedValue({
      ok: true,
      tools: [{ name: "createAd", description: "Make an ad.", args: [] }],
    });
    render(
      <McpCard
        spec={xadsSpec}
        status={{ state: "connected" } as McpRuntimeStatus}
        projectSlug="proj"
      />,
    );
    openOverflowMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /view tools/i }));
    expect(await screen.findByText("createAd")).toBeInTheDocument();
    expect(listTools).toHaveBeenCalledWith({ mcp_key: "notfair-xads" });
  });
});
