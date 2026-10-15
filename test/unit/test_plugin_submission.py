"""Guard the Claude directory failures against the files actually shipped."""

import json
import re
import struct
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def test_one_registered_entry_per_skill_across_hosts():
    files = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True).splitlines()
    skills = [ROOT / name for name in files if name.endswith("/SKILL.md")]
    names = [re.search(r"^name:\s*(.+)$", p.read_text(), re.M).group(1).strip().casefold() for p in skills]
    assert len(names) == len(set(names)) == 48
    assert all(p.parent.parent == ROOT / "skills" for p in skills)
    assert not (ROOT / "CLAUDE.md").exists()


def test_package_stays_within_directory_inspection_limits():
    files = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True).splitlines()
    assert len(files) <= 512
    for name in files:
        path = ROOT / name
        assert not path.is_symlink()
        assert not name.startswith(("notfair/", "notfair-nextjs-blog/", "bin/"))
        if path.suffix not in {".png", ".svg"}:
            assert path.stat().st_size < 256 * 1024, name
            assert b"\x00" not in path.read_bytes(), name


def test_committed_archive_has_only_portable_regular_files():
    entries = subprocess.check_output(
        ["git", "ls-tree", "-rz", "HEAD"], cwd=ROOT
    ).split(b"\x00")
    seen = set()
    total_size = 0
    for entry in filter(None, entries):
        metadata, encoded_name = entry.split(b"\t", 1)
        mode, kind, object_id = metadata.decode().split()
        name = encoded_name.decode()
        assert kind == "blob" and mode in {"100644", "100755"}, name
        assert name.casefold() not in seen, name
        seen.add(name.casefold())
        for part in name.split("/"):
            assert part.casefold() not in {
                ".ds_store", "thumbs.db", "desktop.ini", "__macosx"
            }, name
            assert not re.search(r'[<>:"\\|?*\x00-\x1f]|[. ]$', part), name
            assert not re.fullmatch(
                r"(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?", part, re.I
            ), name
        size = int(subprocess.check_output(
            ["git", "cat-file", "-s", object_id], cwd=ROOT
        ))
        assert size < 5 * 1024 * 1024, name
        total_size += size
    assert total_size < 256 * 1024 * 1024


def test_claude_listing_metadata_and_icon():
    manifest = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
    for key in ("documentationUrl", "supportUrl", "privacyPolicyUrl", "termsOfServiceUrl"):
        assert manifest[key].startswith("https://")
    icon = ROOT / manifest["icon"]
    data = icon.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    width, height = struct.unpack(">II", data[16:24])
    assert width == height and 512 <= width <= 2048
    assert len(data) < 2 * 1024 * 1024


def test_skills_do_not_preapprove_shell_or_file_writes():
    for path in (ROOT / "skills").glob("*/SKILL.md"):
        frontmatter = path.read_text().split("---", 2)[1]
        assert "allowed-tools:" not in frontmatter, path
