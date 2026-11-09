"""Build the declarative Claude Directory release; never modify the full plugin.

The directory's community policy accepts skills and remote MCP connections, but
not the full distribution's local programs. Keep this an explicit allowlist,
with reviewed workflow replacements, rather than hiding or renaming programs.
"""

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OVERLAYS = ROOT / "distribution/claude"
EXCLUDED_SKILLS = {"setup-cms", "gemini", "upgrade"}
CATEGORIES = ("paid-ads", "google-ads", "meta-ads", "analytics", "wordpress", "gohighlevel", "seo")


def frontmatter(text):
    """Keep only descriptive keys accepted for community skills."""
    if not text.startswith("---\n"):
        return text
    _, header, body = text.split("---", 2)
    fields = re.findall(r"^([\w-]+):[^\n]*(?:\n[ \t]+[^\n]*)*", header, re.M)
    kept = []
    for field in fields:
        if field in {"name", "description"}:
            match = re.search(r"^" + field + r":[^\n]*(?:\n[ \t]+[^\n]*)*", header, re.M)
            kept.append(match.group())
    if len(kept) != 2:
        raise ValueError("Skill must have name and description")
    return "---\n" + "\n".join(kept) + "\n---" + body


def build(destination):
    destination = Path(destination).resolve()
    if destination == ROOT or ROOT in destination.parents:
        raise ValueError("Output must be outside the source checkout")
    if destination.exists() and any(destination.iterdir()):
        raise ValueError("Output directory must be empty")
    files = {}
    manifest = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
    entries = [p for p in manifest["skills"] if Path(p).name not in EXCLUDED_SKILLS]
    manifest["skills"] = entries
    manifest["description"] = (
        "NotFair ads, analytics, SEO, and GEO skills. Connect Google, Meta, X, "
        "LinkedIn, Reddit, and TikTok Ads, WordPress, GoHighLevel, Search Console, "
        "and GA4 through OAuth, or review public pages and supplied exports."
    )

    def add(path):
        relative = path.relative_to(ROOT).as_posix()
        override = OVERLAYS / (relative + ".in")
        source = override if override.is_file() else path
        data = source.read_bytes()
        if path.suffix == ".md":
            data = frontmatter(data.decode("utf-8")).encode("utf-8")
        files[relative] = data

    for category in CATEGORIES:
        for path in sorted((ROOT / category).rglob("*")):
            if not path.is_file() or path.suffix not in {".md", ".json"}:
                continue
            if set(path.relative_to(ROOT).parts) & {"scripts", "evals", "agents", "setup-cms"}:
                continue
            if path.name == "gsc_setup.md":
                continue
            add(path)
    for entry in entries:
        add(ROOT / entry / "SKILL.md")
    for relative in ("docs/safety.md", "docs/mcp-connection.md", "LICENSE", "assets/notfair-icon.png"):
        add(ROOT / relative)
    for relative in ("README.md", "AGENTS.md", "CHANGELOG.md"):
        files[relative] = (OVERLAYS / (relative + ".in")).read_bytes()
    files[".claude-plugin/plugin.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    files[".mcp.json"] = (ROOT / ".mcp.json").read_bytes()

    # Fail rather than ship a dangling local helper or a broken reference.
    for relative, data in files.items():
        if relative.endswith(".png"):
            continue
        text = data.decode("utf-8")
        if text.startswith("#!") or "\x00" in text:
            raise ValueError(f"Non-declarative file: {relative}")
        if relative.endswith(".md"):
            if re.search(r"\b[\w/-]+\.(?:py|sh)\b|\$SKILL_SCRIPTS", text):
                raise ValueError(f"Unported helper reference: {relative}")
            for target in re.findall(r"\]\(([^)\s]+)\)", text):
                target = target.split("#", 1)[0]
                if not target or target == "URL" or ":" in target or target.startswith(("/", "<")):
                    continue
                resolved = (destination / relative).parent.joinpath(target).resolve()
                try:
                    local = resolved.relative_to(destination).as_posix()
                except ValueError as exc:
                    raise ValueError(f"Reference leaves plugin: {relative}: {target}") from exc
                if local not in files and not any(p.startswith(local.rstrip("/") + "/") for p in files):
                    raise ValueError(f"Missing reference: {relative}: {target}")
    destination.mkdir(parents=True, exist_ok=True)
    for relative, data in files.items():
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        target.chmod(0o644)
    return {"version": manifest["version"], "skills": len(entries), "files": len(files)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    print(json.dumps(build(args.output)))
