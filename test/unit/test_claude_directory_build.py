"""The community release must contain usable skills, never disguised helpers."""

import importlib.util
import json
import re
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("claude_directory_build", ROOT / "scripts/build-claude-directory.py")
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


def test_directory_release_is_declarative_and_preserves_full_source(tmp_path):
    source = (ROOT / ".claude-plugin/plugin.json").read_bytes()
    result = BUILDER.build(tmp_path / "release")
    release = tmp_path / "release"
    assert result["skills"] == 45
    assert not (release / "VERSION").exists()
    assert result["files"] <= 512
    manifest = json.loads((release / ".claude-plugin/plugin.json").read_text())
    names = {Path(p).name for p in manifest["skills"]}
    assert not names & BUILDER.EXCLUDED_SKILLS
    assert {p.parent.name for p in (release / "skills").glob("*/SKILL.md")} == names
    for path in release.rglob("*"):
        if not path.is_file():
            continue
        assert path.suffix in {".md", ".json", ".png"} or path.name in {"LICENSE"}
        assert not path.is_symlink()
        assert path.stat().st_size < 256 * 1024
        assert not path.stat().st_mode & 0o111
        data = path.read_bytes()
        if path.suffix == ".png":
            assert data.startswith(b"\x89PNG\r\n\x1a\n")
            continue
        text = data.decode("utf-8")
        assert not text.startswith("#!") and "\x00" not in text
        if path.suffix == ".json":
            json.loads(text)
        if text.startswith("---\n"):
            header = text.split("---", 2)[1]
            assert set(re.findall(r"^([\w-]+):", header, re.M)) == {"name", "description"}
        assert not re.search(r"\b[\w/-]+\.(?:py|sh)\b|\$SKILL_SCRIPTS", text)
    assert (ROOT / ".claude-plugin/plugin.json").read_bytes() == source
    assert (ROOT / "seo/seo-analysis/scripts/analyze_gsc.py").is_file()
    assert (release / ".mcp.json").read_bytes() == (ROOT / ".mcp.json").read_bytes()
    for entry in manifest["skills"]:
        wrapper = (release / entry / "SKILL.md").read_text()
        target = re.search(r"\]\(([^)]+WORKFLOW.md)\)", wrapper).group(1)
        assert (release / entry / target).resolve().is_file()


def test_builder_refuses_overwrite_and_source_output(tmp_path):
    with pytest.raises(ValueError, match="outside the source"):
        BUILDER.build(ROOT / "release")
    target = tmp_path / "release"
    target.mkdir()
    (target / "manual.txt").write_text("keep")
    with pytest.raises(ValueError, match="empty"):
        BUILDER.build(target)
    assert (target / "manual.txt").read_text() == "keep"


def test_builder_rejects_unported_helpers(tmp_path, monkeypatch):
    overlays = tmp_path / "overlays"
    path = overlays / "seo/shared/preamble.md.in"
    path.parent.mkdir(parents=True)
    path.write_text("Run python3 local-helper.py")
    # Use the real overlays, overriding just one entry, to exercise the release guard.
    original_read = Path.read_bytes

    def read_bytes(self):
        if self == BUILDER.OVERLAYS / "seo/shared/preamble.md.in":
            return path.read_text().encode()
        return original_read(self)

    monkeypatch.setattr(Path, "read_bytes", read_bytes)
    with pytest.raises(ValueError, match="Unported helper reference"):
        BUILDER.build(tmp_path / "release")
