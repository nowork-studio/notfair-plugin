import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MCP_CATALOG_PRESETS,
  getMcpCatalog,
  getMcpPresets,
  isPresetKey,
  mcpSpecByKey,
} from "./mcp-catalog";
import { listUserMcpServers } from "@/server/db/user-mcp-servers";
import { getHiddenMcpPresetKeys } from "@/server/db/projects";
import type { UserMcpServer } from "@/server/db/user-mcp-servers";

vi.mock("@/server/db/user-mcp-servers", () => ({
  listUserMcpServers: vi.fn(),
}));
vi.mock("@/server/db/projects", () => ({
  getHiddenMcpPresetKeys: vi.fn(),
}));

const listUserMcpServersMock = vi.mocked(listUserMcpServers);
const getHiddenMcpPresetKeysMock = vi.mocked(getHiddenMcpPresetKeys);

function userRow(overrides: Partial<UserMcpServer> = {}): UserMcpServer {
  return {
    project_slug: "proj",
    key: "custom-server",
    display_name: "Custom",
    description: "A user-added server",
    resource_url: "https://mcp.custom.dev/v1",
    discovery_url: "https://mcp.custom.dev/.well-known/oauth-protected-resource/v1",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as UserMcpServer;
}

beforeEach(() => {
  listUserMcpServersMock.mockReset().mockReturnValue([]);
  getHiddenMcpPresetKeysMock.mockReset().mockReturnValue([]);
});

describe("isPresetKey / getMcpPresets", () => {
  it("recognizes every shipped preset key", () => {
    for (const preset of MCP_CATALOG_PRESETS) {
      expect(isPresetKey(preset.key)).toBe(true);
    }
    expect(isPresetKey("custom-server")).toBe(false);
  });

  it("getMcpPresets returns the static preset list", () => {
    expect(getMcpPresets()).toBe(MCP_CATALOG_PRESETS);
    expect(getMcpPresets().every((p) => p.source === "preset")).toBe(true);
  });

  it("points every NotFair preset at the canonical MCP resource", () => {
    expect(new Set(MCP_CATALOG_PRESETS.map((p) => p.resource_url))).toEqual(
      new Set(["https://notfair.co/api/mcp/notfair"]),
    );
    expect(new Set(MCP_CATALOG_PRESETS.map((p) => p.discovery_url))).toEqual(
      new Set([
        "https://notfair.co/.well-known/oauth-protected-resource/api/mcp/notfair",
      ]),
    );
  });
});

describe("getMcpCatalog", () => {
  it("returns presets first, then user rows tagged source:'user'", () => {
    listUserMcpServersMock.mockReturnValue([userRow()]);
    const catalog = getMcpCatalog("proj");
    expect(catalog.slice(0, MCP_CATALOG_PRESETS.length)).toEqual(MCP_CATALOG_PRESETS);
    expect(catalog.at(-1)).toEqual({
      key: "custom-server",
      display_name: "Custom",
      description: "A user-added server",
      resource_url: "https://mcp.custom.dev/v1",
      discovery_url: "https://mcp.custom.dev/.well-known/oauth-protected-resource/v1",
      source: "user",
    });
    expect(listUserMcpServersMock).toHaveBeenCalledWith("proj");
    expect(getHiddenMcpPresetKeysMock).toHaveBeenCalledWith("proj");
  });

  it("a preset key shadows a colliding user row", () => {
    listUserMcpServersMock.mockReturnValue([
      userRow({ key: "notfair-googleads", display_name: "Impostor" }),
    ]);
    const catalog = getMcpCatalog("proj");
    const ads = catalog.filter((m) => m.key === "notfair-googleads");
    expect(ads).toHaveLength(1);
    expect(ads[0]!.source).toBe("preset");
    expect(ads[0]!.display_name).toBe("NotFair Google Ads");
  });

  it("hidden presets are removed — and no longer shadow user rows", () => {
    getHiddenMcpPresetKeysMock.mockReturnValue(["notfair-xads"]);
    listUserMcpServersMock.mockReturnValue([
      userRow({ key: "notfair-xads", display_name: "My own X server" }),
    ]);
    const catalog = getMcpCatalog("proj");
    const xads = catalog.filter((m) => m.key === "notfair-xads");
    expect(xads).toHaveLength(1);
    expect(xads[0]!.source).toBe("user");
    expect(xads[0]!.display_name).toBe("My own X server");
  });
});

describe("mcpSpecByKey", () => {
  it("finds presets and user rows", () => {
    listUserMcpServersMock.mockReturnValue([userRow()]);
    expect(mcpSpecByKey("proj", "notfair-metaads")?.display_name).toBe("NotFair Meta Ads");
    expect(mcpSpecByKey("proj", "custom-server")?.source).toBe("user");
  });

  it("returns undefined for unknown keys", () => {
    expect(mcpSpecByKey("proj", "nope")).toBeUndefined();
  });
});
