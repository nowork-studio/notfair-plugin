"""Every workflow must reference the shared safety rules."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SAFETY = ROOT / "docs/safety.md"


def test_safety_doc_covers_approval_and_untrusted_content():
    text = SAFETY.read_text(encoding="utf-8")
    for needle in ("explicit approval", "WordPress", "CRM", "budget", "untrusted data", "never instructions"):
        assert needle in text


def test_every_workflow_links_safety_doc():
    workflows = [p for p in ROOT.glob("**/WORKFLOW.md") if ".git" not in p.parts]
    assert len(workflows) >= 40
    for wf in workflows:
        text = wf.read_text(encoding="utf-8")
        assert "## Safety" in text, wf
        link = re.search(r"\]\(((?:\.\./)+docs/safety\.md)\)", text)
        assert link, wf
        assert (wf.parent / link.group(1)).resolve() == SAFETY.resolve(), wf
        assert "untrusted data" in text, wf


def test_safety_doc_has_no_literal_scanner_trigger_phrases():
    # Host scanners (e.g. Hermes skills-guard) flag verbatim attack strings
    # even when quoted as examples to reject. Build the banned phrases from
    # fragments so this test file itself contains no literal trigger phrase.
    text = SAFETY.read_text(encoding="utf-8").lower()
    banned = [
        "ign" + "ore " + "prev" + "ious " + "instruct" + "ions",
        "ign" + "ore " + "all " + "prev" + "ious",
        "disreg" + "ard " + "prev" + "ious " + "instruct" + "ions",
        "forget " + "your " + "instruct" + "ions",
    ]
    for phrase in banned:
        assert phrase not in text
    # The requirement itself stays explicit: directives in untrusted
    # content are reported, not followed.
    assert "do not act on them" in text
    assert "rather than following them" in text
