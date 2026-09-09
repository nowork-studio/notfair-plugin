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
    "analytics/search-console": "~~search-console",
    "analytics/google-analytics": "~~google-analytics",
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

    codex_wrappers = {path.name: path for path in (ROOT / "skills").iterdir()}
    assert len(codex_wrappers) == len(plugin["skills"])
    for skill in plugin["skills"]:
        canonical = (ROOT / skill).resolve()
        canonical_text = (canonical / "SKILL.md").read_text()
        skill_name = re.search(r"^name:\s*(.+)$", canonical_text, re.MULTILINE)
        assert skill_name, skill
        wrapper = codex_wrappers[skill_name.group(1).strip()]
        assert wrapper.is_dir() and not wrapper.is_symlink()
        wrapper_text = (wrapper / "SKILL.md").read_text()
        assert wrapper_text.split("---\n", 2)[1] == canonical_text.split("---\n", 2)[1]
        canonical_rel = canonical.relative_to(ROOT).as_posix()
        assert f"../../{canonical_rel}/SKILL.md" in wrapper_text

    for skill, placeholder in PLATFORM_SKILLS.items():
        skill_path = ROOT / skill / "SKILL.md"
        assert skill_path.is_file()
        skill_text = skill_path.read_text()
        assert placeholder in skill_text
        assert f"./{skill}" in plugin["skills"]


def test_ads_wrappers_resolve_from_the_plugin_root_without_fallback():
    plugin = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
    ads_skill_roots = ("./paid-ads/", "./google-ads/", "./meta-ads/")
    canonical_paths = [
        ROOT / skill.removeprefix("./") / "SKILL.md"
        for skill in plugin["skills"]
        if skill.startswith(ads_skill_roots)
    ]

    for canonical in canonical_paths:
        canonical_text = canonical.read_text()
        skill_name = re.search(r"^name:\s*(.+)$", canonical_text, re.MULTILINE)
        assert skill_name, canonical
        wrapper = ROOT / "skills" / skill_name.group(1).strip() / "SKILL.md"
        wrapper_text = wrapper.read_text()
        relative_target = re.search(r"\]\((\.\./\.\./[^)]+/SKILL\.md)\)", wrapper_text)

        assert relative_target, skill_name
        assert (wrapper.parent / relative_target.group(1)).resolve() == canonical.resolve()
        assert "not `<plugin-root>/skills/" in wrapper_text
        assert "never substitute a similarly named skill from another plugin" in wrapper_text


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
        "README.md", "AGENTS.md", "CLAUDE.md", "INSTALL_FOR_AGENTS.md",
        "docs", "install", "paid-ads", "google-ads", "meta-ads", "analytics", "seo",
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
