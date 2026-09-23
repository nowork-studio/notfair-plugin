import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const { mkdtempSync } = require("node:fs") as typeof import("node:fs");
  const { tmpdir } = require("node:os") as typeof import("node:os");
  const { join } = require("node:path") as typeof import("node:path");
  process.env.NOTFAIR_DATA_DIR = mkdtempSync(join(tmpdir(), "notfair-session-"));
});

const mocks = vi.hoisted(() => ({
  findChromeExecutable: vi.fn(),
  launchChrome: vi.fn(),
  stopChrome: vi.fn(),
}));

vi.mock("./chrome", () => ({
  findChromeExecutable: mocks.findChromeExecutable,
  launchChrome: mocks.launchChrome,
  stopChrome: mocks.stopChrome,
}));

import {
  _sessionsByProject,
  _stopIdleChecker,
  checkIdleSessions,
  ensureIdleChecker,
  getOrLaunchBrowser,
  getSessionStatus,
  registerShutdownHooks,
  stopAllBrowsers,
  stopBrowser,
  type BrowserSession,
} from "./session";

function launched(over: Record<string, unknown> = {}) {
  const process = new EventEmitter() as EventEmitter & {
    exitCode: number | null;
    killed: boolean;
  };
  process.exitCode = null;
  process.killed = false;
  return {
    process,
    cdpPort: 19_223,
    cdpHttpUrl: "http://127.0.0.1:19223",
    userDataDir: "/tmp/profile",
    ...over,
  };
}

function browser(contexts: unknown[] = [{}]) {
  return {
    contexts: vi.fn(() => contexts),
    close: vi.fn(async () => {}),
  };
}

function cachedSession(slug: string, over: Partial<BrowserSession> = {}): BrowserSession {
  const launchedChrome = launched();
  return {
    projectSlug: slug,
    cdpPort: 19_223,
    cdpHttpUrl: launchedChrome.cdpHttpUrl,
    userDataDir: launchedChrome.userDataDir,
    launched: launchedChrome as never,
    browser: browser() as never,
    context: {} as never,
    launchedAt: 1_000,
    lastActivityAt: 2_000,
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  _sessionsByProject.clear();
  _stopIdleChecker();
  delete process.env.NOTFAIR_BROWSER_HEADLESS;
  delete process.env.NOTFAIR_BROWSER_IDLE_TIMEOUT_MS;
  mocks.findChromeExecutable.mockReturnValue("/Applications/Chrome");
  mocks.stopChrome.mockResolvedValue(undefined);
});

afterEach(async () => {
  vi.useRealTimers();
  await stopAllBrowsers();
  _sessionsByProject.clear();
  _stopIdleChecker();
});

describe("getOrLaunchBrowser", () => {
  it("launches, attaches to the default context, and caches the session", async () => {
    const chrome = launched();
    const attached = browser([{ name: "default" }]);
    const launch = vi.fn(async () => chrome as never);
    const connect = vi.fn(async () => attached as never);

    const first = await getOrLaunchBrowser("acme", {
      headless: true,
      executablePath: "/custom/chrome",
      extraArgs: ["--foo"],
      launch,
      connectOverCDP: connect,
    });
    expect(launch).toHaveBeenCalledWith(
      expect.objectContaining({
        executablePath: "/custom/chrome",
        headless: true,
        extraArgs: ["--foo"],
      }),
    );
    expect(connect).toHaveBeenCalledWith(chrome.cdpHttpUrl);
    expect(first.context).toEqual({ name: "default" });

    vi.setSystemTime(9_000);
    const second = await getOrLaunchBrowser("acme", { launch, connectOverCDP: connect });
    expect(second).toBe(first);
    expect(second.lastActivityAt).toBe(9_000);
    expect(launch).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent launches", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const chrome = launched();
    const launch = vi.fn(async () => {
      await gate;
      return chrome as never;
    });
    const connect = vi.fn(async () => browser() as never);
    const a = getOrLaunchBrowser("parallel", { launch, connectOverCDP: connect });
    const b = getOrLaunchBrowser("parallel", { launch, connectOverCDP: connect });
    expect(launch).toHaveBeenCalledTimes(1);
    release();
    const [one, two] = await Promise.all([a, b]);
    expect(one).toBe(two);
  });

  it("drops a dead cached session and relaunches", async () => {
    const dead = cachedSession("dead");
    Object.defineProperty(dead.launched.process, "exitCode", { value: 1 });
    _sessionsByProject.set("dead", dead);
    const fresh = launched();
    const result = await getOrLaunchBrowser("dead", {
      launch: vi.fn(async () => fresh as never),
      connectOverCDP: vi.fn(async () => browser() as never),
    });
    expect(result).not.toBe(dead);
  });

  it("fails clearly when Chrome cannot be found", async () => {
    mocks.findChromeExecutable.mockReturnValue(null);
    await expect(getOrLaunchBrowser("acme")).rejects.toThrow(/Could not find Chrome/);
  });

  it("stops Chrome if CDP attachment fails", async () => {
    const chrome = launched();
    await expect(
      getOrLaunchBrowser("acme", {
        launch: vi.fn(async () => chrome as never),
        connectOverCDP: vi.fn(async () => { throw new Error("refused"); }),
      }),
    ).rejects.toThrow(/Failed to attach.*refused/);
    expect(mocks.stopChrome).toHaveBeenCalledWith(chrome);
  });

  it("reports an incomplete package when playwright-core is missing browsers.json", async () => {
    const chrome = launched();
    await expect(
      getOrLaunchBrowser("acme", {
        launch: vi.fn(async () => chrome as never),
        connectOverCDP: vi.fn(async () => {
          throw new Error(
            "Cannot find module '/pkg/.next/node_modules/playwright-core-b643089f39648130/browsers.json'",
          );
        }),
      }),
    ).rejects.toThrow(/NotFair package is incomplete.*browsers\.json/);
    expect(mocks.stopChrome).toHaveBeenCalledWith(chrome);
    expect(_sessionsByProject.has("acme")).toBe(false);
  });

  it("closes both handles when CDP has no default context", async () => {
    const chrome = launched();
    const attached = browser([]);
    await expect(
      getOrLaunchBrowser("acme", {
        launch: vi.fn(async () => chrome as never),
        connectOverCDP: vi.fn(async () => attached as never),
      }),
    ).rejects.toThrow(/no default context/);
    expect(attached.close).toHaveBeenCalled();
    expect(mocks.stopChrome).toHaveBeenCalledWith(chrome);
  });

  it.each([
    ["1", true],
    ["TRUE", true],
    ["0", false],
    ["false", false],
  ])("honors NOTFAIR_BROWSER_HEADLESS=%s", async (value, expected) => {
    process.env.NOTFAIR_BROWSER_HEADLESS = value;
    const launch = vi.fn(async () => launched() as never);
    await getOrLaunchBrowser(`env-${value.toLowerCase()}`, {
      launch,
      connectOverCDP: vi.fn(async () => browser() as never),
    });
    expect(launch).toHaveBeenCalledWith(expect.objectContaining({ headless: expected }));
  });

  it("evicts a session when Chrome exits", async () => {
    const chrome = launched();
    await getOrLaunchBrowser("evict", {
      launch: vi.fn(async () => chrome as never),
      connectOverCDP: vi.fn(async () => browser() as never),
    });
    chrome.process.emit("exit", 1);
    expect(_sessionsByProject.has("evict")).toBe(false);
  });
});

describe("shutdown and status", () => {
  it("stopBrowser is a no-op for missing sessions and tolerates close failures", async () => {
    await expect(stopBrowser("missing")).resolves.toBeUndefined();
    const session = cachedSession("acme");
    vi.mocked(session.browser.close).mockRejectedValue(new Error("dead"));
    mocks.stopChrome.mockRejectedValueOnce(new Error("already stopped"));
    _sessionsByProject.set("acme", session);
    await expect(stopBrowser("acme")).resolves.toBeUndefined();
    expect(_sessionsByProject.has("acme")).toBe(false);
  });

  it("stops all registered projects", async () => {
    _sessionsByProject.set("one", cachedSession("one"));
    _sessionsByProject.set("two", cachedSession("two"));
    await stopAllBrowsers();
    expect(_sessionsByProject.size).toBe(0);
    expect(mocks.stopChrome).toHaveBeenCalledTimes(2);
  });

  it("reports stopped and running session details", () => {
    vi.useFakeTimers();
    vi.setSystemTime(5_000);
    process.env.NOTFAIR_BROWSER_IDLE_TIMEOUT_MS = "1234";
    expect(getSessionStatus("none")).toMatchObject({
      running: false,
      idleTimeoutMs: 1234,
    });
    _sessionsByProject.set("acme", cachedSession("acme"));
    expect(getSessionStatus("acme")).toMatchObject({
      running: true,
      launchedAt: 1_000,
      uptimeMs: 4_000,
      idleMs: 3_000,
      idleTimeoutMs: 1234,
    });
  });

  it("uses the default idle timeout for empty, invalid, and nonpositive values", () => {
    for (const value of [undefined, "nope", "0", "-4"]) {
      if (value === undefined) delete process.env.NOTFAIR_BROWSER_IDLE_TIMEOUT_MS;
      else process.env.NOTFAIR_BROWSER_IDLE_TIMEOUT_MS = value;
      expect(getSessionStatus("acme").idleTimeoutMs).toBe(300_000);
    }
  });

  it("stops only sessions at or beyond the idle threshold", async () => {
    process.env.NOTFAIR_BROWSER_IDLE_TIMEOUT_MS = "1000";
    _sessionsByProject.set("idle", cachedSession("idle", { lastActivityAt: 1_000 }));
    _sessionsByProject.set("active", cachedSession("active", { lastActivityAt: 1_001 }));
    await expect(checkIdleSessions(2_000)).resolves.toEqual(["idle"]);
    expect(_sessionsByProject.has("idle")).toBe(false);
    expect(_sessionsByProject.has("active")).toBe(true);
  });

  it("installs maintenance hooks and starts only one idle timer", () => {
    registerShutdownHooks();
    registerShutdownHooks();
    vi.useFakeTimers();
    ensureIdleChecker();
    ensureIdleChecker();
    expect(vi.getTimerCount()).toBe(1);
  });
});
