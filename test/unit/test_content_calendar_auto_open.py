import unittest
import importlib.util
from importlib.machinery import SourceFileLoader
import sys
from pathlib import Path

# bin script has no .py extension, so give spec an explicit source loader.
script_path = Path(__file__).parent.parent.parent / 'scripts' / 'notfair-content-calendar.py'
loader = SourceFileLoader("notfair_content_calendar", str(script_path))
spec = importlib.util.spec_from_file_location("notfair_content_calendar", str(script_path), loader=loader)
mod = importlib.util.module_from_spec(spec)
sys.modules["notfair_content_calendar"] = mod
spec.loader.exec_module(mod)

should_auto_open = mod._should_auto_open


class TestShouldAutoOpen(unittest.TestCase):
    def test_no_open_suppresses_on_every_platform(self):
        # --no-open must win on macOS and Windows too, not just headless Linux.
        for platform in ("darwin", "win32", "linux"):
            self.assertFalse(
                should_auto_open(no_open=True, platform=platform, display=""),
                f"--no-open should suppress auto-open on {platform}",
            )
        self.assertFalse(should_auto_open(no_open=True, platform="linux", display=":0"))

    def test_default_opens_where_a_gui_exists(self):
        self.assertTrue(should_auto_open(False, "darwin", ""))
        self.assertTrue(should_auto_open(False, "win32", ""))
        self.assertTrue(should_auto_open(False, "linux", ":0"))

    def test_headless_linux_does_not_open(self):
        self.assertFalse(should_auto_open(False, "linux", ""))


if __name__ == "__main__":
    unittest.main()
