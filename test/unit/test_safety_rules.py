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
