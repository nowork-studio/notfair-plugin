// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { McpAccountPickerDialog } from "@/components/mcp-account-picker-dialog";
import {
  listGscProperties,
  setOnboardingGscPropertyAction,
} from "@/server/onboarding/accounts";

vi.mock("@/server/onboarding/accounts", () => ({
  listGoogleAdsAccounts: vi.fn(),
  setOnboardingAccountAction: vi.fn(),
  listMetaAdsAccounts: vi.fn(),
  setOnboardingMetaAdsAccountAction: vi.fn(),
  listGscProperties: vi.fn(),
  setOnboardingGscPropertyAction: vi.fn(),
}));

const GSC = "notfair-googlesearchconsole";

function renderDialog(
  props: Partial<React.ComponentProps<typeof McpAccountPickerDialog>> = {},
) {
  const onOpenChange = vi.fn();
  const onPicked = vi.fn();
  const utils = render(
    <McpAccountPickerDialog
      projectSlug="proj"
      mcpKey={GSC}
      selectedId={null}
      open
      onOpenChange={onOpenChange}
      onPicked={onPicked}
      {...props}
    />,
  );
  return { ...utils, onOpenChange, onPicked };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("McpAccountPickerDialog", () => {
  it("renders prefetched items without calling the list action", async () => {
    renderDialog({
      prefetch: {
        ok: true,
        items: [
          { id: "sc-domain:a.com", name: "a.com" },
          { id: "sc-domain:b.com", name: "b.com" },
        ],
      },
    });
    expect(
      await screen.findByRole("button", { name: /Use a\.com/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("default")).not.toBeInTheDocument();
    expect(listGscProperties).not.toHaveBeenCalled();
  });

  it("marks the persisted selection as current", async () => {
    renderDialog({
      selectedId: "sc-domain:b.com",
      prefetch: {
        ok: true,
        items: [
          { id: "sc-domain:a.com", name: "a.com" },
          { id: "sc-domain:b.com", name: "b.com" },
        ],
      },
    });
    expect(await screen.findByText("current")).toBeInTheDocument();
  });

  it("shows a prefetched error with no retry fetch on mount", async () => {
    renderDialog({ prefetch: { ok: false, error: "HTTP 502" } });
    expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 502");
    expect(listGscProperties).not.toHaveBeenCalled();
  });

  it("fetches from the MCP when opened without a prefetch (manual open)", async () => {
    vi.mocked(listGscProperties).mockResolvedValue({
      ok: true,
      properties: [{ id: "sc-domain:a.com", name: "a.com" }],
    });
    renderDialog();
    expect(
      await screen.findByRole("button", { name: /Use a\.com/ }),
    ).toBeInTheDocument();
    expect(listGscProperties).toHaveBeenCalledWith("proj");
  });

  it("shows the empty state when the bearer reaches nothing", async () => {
    vi.mocked(listGscProperties).mockResolvedValue({
      ok: true,
      properties: [],
    });
    renderDialog();
    expect(
      await screen.findByText(/no Search Console property/i),
    ).toBeInTheDocument();
  });

  it("persists a pick, then notifies and closes", async () => {
    vi.mocked(setOnboardingGscPropertyAction).mockResolvedValue({
      ok: true,
      project: {} as never,
    });
    const { onOpenChange, onPicked } = renderDialog({
      prefetch: {
        ok: true,
        items: [{ id: "sc-domain:a.com", name: "a.com" }],
      },
    });
    fireEvent.click(await screen.findByRole("button", { name: /Use a\.com/ }));
    await waitFor(() => {
      expect(setOnboardingGscPropertyAction).toHaveBeenCalledWith(
        "proj",
        "sc-domain:a.com",
      );
      expect(onPicked).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("stays open and does not notify when persisting fails", async () => {
    vi.mocked(setOnboardingGscPropertyAction).mockResolvedValue({
      ok: false,
      error: "not reachable",
    });
    const { onOpenChange, onPicked } = renderDialog({
      prefetch: {
        ok: true,
        items: [{ id: "sc-domain:a.com", name: "a.com" }],
      },
    });
    fireEvent.click(await screen.findByRole("button", { name: /Use a\.com/ }));
    await waitFor(() =>
      expect(setOnboardingGscPropertyAction).toHaveBeenCalled(),
    );
    expect(onPicked).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("renders nothing for MCPs without a picker", () => {
    const { container } = renderDialog({ mcpKey: "notfair-xads" });
    expect(container).toBeEmptyDOMElement();
  });
});