"""Skill descriptions stay within the documented 1024-character limit.

The description is the part of a skill that is always loaded into context, and
Anthropic's skill authoring guidance caps it at 1024 characters. Codex wrappers
under skills/ repeat the canonical frontmatter, so they must stay in sync.
"""

import re
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[2]
MAX_DESCRIPTION_CHARS = 1024
SKIP_DIRS = {".git", "node_modules"}


def _skill_files():
    return sorted(
        path
        for path in ROOT.rglob("SKILL.md")
        if not SKIP_DIRS.intersection(path.relative_to(ROOT).parts)
    )


def _description(path):
    text = path.read_text(encoding="utf-8")
    match = re.match(r"---\r?\n(.*?)\r?\n---", text, re.S)
    if not match:
        return None
    lines = match.group(1).splitlines()
    for index, line in enumerate(lines):
        if not line.startswith("description:"):
            continue
        value = line[len("description:"):].strip()
        if value not in (">", ">-", "|", "|-"):
            return value.strip("\"'")
        block = []
        for follow in lines[index + 1:]:
            if follow and not follow[0].isspace():
                break
            block.append(follow.strip())
        joiner = "\n" if value.startswith("|") else " "
        return joiner.join(part for part in block if part)
    return None


SKILLS = [path for path in _skill_files() if _description(path) is not None]


def test_skills_are_discovered():
    assert len(SKILLS) > 0


@pytest.mark.parametrize(
    "path", SKILLS, ids=lambda p: str(p.relative_to(ROOT))
)
def test_description_within_limit(path):
    length = len(_description(path))
    assert length <= MAX_DESCRIPTION_CHARS, (
        f"{path.relative_to(ROOT)} description is {length} characters; "
        f"the limit is {MAX_DESCRIPTION_CHARS}"
    )


WRAPPERS = []
for wrapper in sorted((ROOT / "skills").glob("*/SKILL.md")):
    target = re.search(r"\.\./\.\./(.+?)/SKILL\.md", wrapper.read_text(encoding="utf-8"))
    if target and (ROOT / target.group(1) / "SKILL.md").exists():
        WRAPPERS.append((wrapper, ROOT / target.group(1) / "SKILL.md"))


@pytest.mark.parametrize(
    "wrapper,canonical", WRAPPERS, ids=lambda p: str(p.relative_to(ROOT))
)
def test_codex_wrapper_description_matches_canonical(wrapper, canonical):
    assert _description(wrapper) == _description(canonical)
