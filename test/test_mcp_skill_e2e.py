"""End-to-end contract tests for the live NotFair MCP-backed skills.

Local registration checks run in the normal suite. Set LIVE_MCP_E2E=1 to also
verify the production endpoint -> 401 challenge -> OAuth resource metadata
round trip without using or exposing an account credential.
"""

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import pytest


ROOT = Path(__file__).parent.parent

UNIVERSAL_SERVER = "NotFair"
UNIVERSAL_ENDPOINT = "https://notfair.co/api/mcp/notfair"

PLATFORM_SKILLS = {
    "paid-ads/paid-ads-x": "~~x-ads",
    "paid-ads/paid-ads-linkedin": "~~linkedin-ads",
    "paid-ads/paid-ads-reddit": "~~reddit-ads",
    "paid-ads/paid-ads-tiktok": "~~tiktok-ads",
    "analytics/search-console": "~~search-console",
    "analytics/google-analytics": "~~google-analytics",
    "wordpress": "~~wordpress",
    "gohighlevel": "~~gohighlevel",
}


def test_universal_mcp_is_the_only_registered_server_and_skills_are_portable():
    config = json.loads((ROOT / ".mcp.json").read_text())
    plugin = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
    codex_plugin = json.loads((ROOT / ".codex-plugin/plugin.json").read_text())
    servers = config["mcpServers"]

    assert servers == {
        UNIVERSAL_SERVER: {"type": "http", "url": UNIVERSAL_ENDPOINT}
    }
    assert codex_plugin["name"] == "notfair"
    assert codex_plugin["skills"] == "./skills/"
    assert codex_plugin["mcpServers"] == "./.mcp.json"
    assert codex_plugin["version"] == plugin["version"]

    entries = sorted((ROOT / "skills").glob("*/SKILL.md"))
    assert len(entries) == len(plugin["skills"]) == 48
    assert {"./" + p.parent.relative_to(ROOT).as_posix() for p in entries} == set(plugin["skills"])
    names = []
    for entry in entries:
        entry_text = entry.read_text()
        name = re.search(r"^name:\s*(.+)$", entry_text, re.MULTILINE).group(1).strip()
        names.append(name.casefold())
        target = re.search(r"\]\((\.\./\.\./[^)]+/WORKFLOW\.md)\)", entry_text)
        assert target, entry
        workflow = (entry.parent / target.group(1)).resolve()
        assert workflow.is_relative_to(ROOT) and workflow.is_file()
        assert entry_text.split("---\n", 2)[1] == workflow.read_text().split("---\n", 2)[1]
    assert len(names) == len(set(names))

    for skill, placeholder in PLATFORM_SKILLS.items():
        workflow = ROOT / skill / "WORKFLOW.md"
        assert placeholder in workflow.read_text()
        assert not (workflow.parent / "SKILL.md").exists()


def test_ads_wrappers_resolve_from_the_plugin_root_without_fallback():
    for entry in (ROOT / "skills").glob("*/SKILL.md"):
        text = entry.read_text()
        if not any("../../" + prefix in text for prefix in ("paid-ads/", "google-ads/", "meta-ads/")):
            continue
        target = re.search(r"\]\((\.\./\.\./[^)]+/WORKFLOW\.md)\)", text)
        assert target and (entry.parent / target.group(1)).resolve().is_file()
        assert "not `<plugin-root>/skills/" in text
        assert "never substitute a similarly named skill from another plugin" in text


def test_all_host_configs_and_registry_use_one_versioned_connection():
    expected = {UNIVERSAL_SERVER: {"type": "http", "url": UNIVERSAL_ENDPOINT}}
    version = (ROOT / "VERSION").read_text().strip()
    for config in (".mcp.json", "gemini-extension.json"):
        assert json.loads((ROOT / config).read_text())["mcpServers"] == expected
    assert json.loads((ROOT / "mcp.json").read_text())["mcpServers"] == {
        UNIVERSAL_SERVER: {"type": "streamable-http", "url": UNIVERSAL_ENDPOINT}
    }
    for manifest in (
        ".claude-plugin/plugin.json", ".codex-plugin/plugin.json",
        ".cursor-plugin/plugin.json", "plugin.json", "gemini-extension.json",
        "server.json",
    ):
        assert json.loads((ROOT / manifest).read_text())["version"] == version
    for manifest in (".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"):
        config_path = json.loads((ROOT / manifest).read_text())["mcpServers"]
        assert json.loads((ROOT / config_path).read_text())["mcpServers"] == expected
    marketplace = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text())
    assert marketplace["metadata"]["version"] == version
    assert marketplace["plugins"][0]["version"] == version
    cursor_plugin = json.loads((ROOT / ".cursor-plugin/plugin.json").read_text())
    logo = Path(cursor_plugin["logo"])
    assert logo.suffix == ".png", cursor_plugin["logo"]
    assert not logo.is_absolute() and ".." not in logo.parts
    assert (ROOT / logo).is_file()
    registry = json.loads((ROOT / "server.json").read_text())
    assert 1 <= len(registry["description"]) <= 100
    assert registry["remotes"] == [{"type": "streamable-http", "url": UNIVERSAL_ENDPOINT}]
    assert list(ROOT.glob("server*.json")) == [ROOT / "server.json"]
    workflow = (ROOT / ".github/workflows/mcp-registry-publish.yml").read_text()
    assert "validate server.json" in workflow
    assert "publish server.json" in workflow


def test_active_plugin_files_do_not_advertise_legacy_endpoints():
    # Historical release notes and the separately shipped local app are not
    # plugin installation configuration. Inspect every active plugin surface.
    roots = [ROOT / name for name in (
        "README.md", "AGENTS.md", "INSTALL_FOR_AGENTS.md",
        "docs", "install", "paid-ads", "google-ads", "meta-ads", "analytics", "seo",
        "wordpress", "gohighlevel",
        ".claude-plugin", ".codex-plugin", ".cursor-plugin", ".github",
        ".mcp.json", "mcp.json", "server.json", "gemini-extension.json",
    )]
    for root in roots:
        for path in (root.rglob("*") if root.is_dir() else [root]):
            if not path.is_file() or path.suffix not in {".md", ".json", ".yml", ".sh"}:
                continue
            text = path.read_text()
            for url in re.findall(r"https://(?:www\.)?notfair\.co/api/mcp[^\s\"`<>)]*", text):
                assert url == UNIVERSAL_ENDPOINT, (path, url)


@pytest.mark.skipif(
    os.environ.get("LIVE_MCP_E2E") != "1",
    reason="Set LIVE_MCP_E2E=1 to verify production OAuth discovery",
)
@pytest.mark.parametrize("origin", ["https://notfair.co", "https://www.notfair.co"])
def test_live_mcp_oauth_discovery_round_trip(origin):
    endpoint = f"{origin}/api/mcp/notfair"
    request = urllib.request.Request(
        endpoint,
        headers={"Accept": "application/json, text/event-stream"},
    )

    with pytest.raises(urllib.error.HTTPError) as exc_info:
        urllib.request.urlopen(request, timeout=20)

    response = exc_info.value
    assert response.code == 401
    challenge = response.headers["WWW-Authenticate"]
    match = re.search(r'resource_metadata="([^"]+)"', challenge or "")
    assert match, challenge

    body = json.loads(response.read())
    metadata_url = match.group(1)
    assert body["oauth"]["resource_metadata"] == metadata_url
    assert body["oauth"]["authorization_code_pkce"] is True

    with urllib.request.urlopen(metadata_url, timeout=20) as metadata_response:
        metadata = json.load(metadata_response)

    assert metadata["resource"] == endpoint
    assert metadata["authorization_servers"] == [origin]
    assert metadata["resource_name"] == "NotFair"

    authorization_server = metadata["authorization_servers"][0]
    authorization_metadata_url = (
        f"{authorization_server}/.well-known/oauth-authorization-server"
    )
    with urllib.request.urlopen(authorization_metadata_url, timeout=20) as response:
        authorization_metadata = json.load(response)

    assert authorization_metadata["issuer"] == authorization_server
    assert urllib.parse.urlparse(endpoint).netloc == urllib.parse.urlparse(
        authorization_metadata["issuer"]
    ).netloc
