// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowseConnectorsDialog } from "@/components/browse-connectors-dialog";
import { TRUSTED_CONNECTORS } from "@/server/trusted-connectors";

// Mock at the server-action boundary, per repo test conventions.
const addServer = vi.hoisted(() => vi.fn());
const startConnect = vi.hoisted(() => vi.fn());
vi.mock("@/server/actions/mcp", () => ({
  addUserMcpServerAction: addServer,
  startMcpConnect: startConnect,
}));

const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));

const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: toastError },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const ALL_IDS = TRUSTED_CONNECTORS.map((c) => c.id);

describe("BrowseConnectorsDialog", () => {
  it("lists every trusted connector that is not yet connected", () => {
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={vi.fn()}
      />,
    );
    expect(screen.getByText("NotFair Google Ads")).toBeInTheDocument();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
  });

  it("hides connected connectors by key and by normalized resource URL", () => {
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={vi.fn()}
        connectedKeys={["notfair-googleads"]}
        // Trailing slash + uppercase host still match after normalization.
        connectedResourceUrls={["https://mcp.stripe.com"]}
      />,
    );
    expect(screen.queryByText("NotFair Google Ads")).toBeNull();
    expect(screen.queryByText("Stripe")).toBeNull();
    expect(screen.getByText("NotFair Meta Ads")).toBeInTheDocument();
  });

  it("hides every NotFair tile once the canonical resource URL is connected", () => {
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={vi.fn()}
        connectedResourceUrls={["https://notfair.co/api/mcp/notfair"]}
      />,
    );
    expect(screen.queryByText("NotFair Google Ads")).toBeNull();
    expect(screen.queryByText("NotFair Meta Ads")).toBeNull();
    expect(screen.queryByText("NotFair Google Search Console")).toBeNull();
    expect(screen.queryByText("NotFair Google Analytics")).toBeNull();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
  });

  it("shows an empty state when everything is already connected", () => {
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={vi.fn()}
        hideKeys={ALL_IDS}
      />,
    );
    expect(
      screen.getByText("All available connectors are already connected."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add custom connector/i }),
    ).toBeInTheDocument();
  });

  it("renders the custom connector path after the trusted connectors", () => {
    const onAddCustom = vi.fn();
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={onAddCustom}
      />,
    );

    const stripe = screen.getByRole("button", { name: /Stripe/ });
    const custom = screen.getByRole("button", {
      name: /add custom connector/i,
    });
    expect(
      stripe.compareDocumentPosition(custom) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Paste an OAuth 2.0 MCP URL")).toBeInTheDocument();

    fireEvent.click(custom);
    expect(onAddCustom).toHaveBeenCalledOnce();
  });

  it("adds with the canonical key and passes return_to into OAuth", async () => {
    addServer.mockResolvedValue({ ok: true, key: "notfair-googleads" });
    // Fail the connect step so the test never assigns window.location.href.
    startConnect.mockResolvedValue({ ok: false, error: "issuer down" });
    const onOpenChange = vi.fn();
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={onOpenChange}
        onAddCustom={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /NotFair Google Ads/ }),
    );

    await waitFor(() => {
      expect(addServer).toHaveBeenCalledWith({
        display_name: "NotFair Google Ads",
        resource_url: "https://notfair.co/api/mcp/notfair",
        key: "notfair-googleads",
      });
      expect(startConnect).toHaveBeenCalledWith({
        mcp_key: "notfair-googleads",
        return_to: window.location.pathname + window.location.search,
      });
    });
  });

  it("closes and refreshes when add succeeds but OAuth cannot start", async () => {
    addServer.mockResolvedValue({ ok: true, key: "notfair-googleads" });
    startConnect.mockResolvedValue({ ok: false, error: "issuer down" });
    const onOpenChange = vi.fn();
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={onOpenChange}
        onAddCustom={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /NotFair Google Ads/ }),
    );

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "Added NotFair Google Ads, but couldn't start OAuth: issuer down",
      );
      expect(refresh).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("surfaces an add failure without starting OAuth", async () => {
    addServer.mockResolvedValue({ ok: false, error: "probe failed" });
    render(
      <BrowseConnectorsDialog
        open
        onOpenChange={vi.fn()}
        onAddCustom={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Stripe/ }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("probe failed");
    });
    expect(startConnect).not.toHaveBeenCalled();
  });
});
