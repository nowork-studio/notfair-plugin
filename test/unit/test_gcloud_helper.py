"""Unit tests for the portable gcloud subprocess helper."""

import importlib.util
import os
import sys
import unittest
from unittest.mock import patch


_SCRIPTS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "seo", "seo-analysis", "scripts"
)
_SCRIPT_PATH = os.path.join(_SCRIPTS_DIR, "_gcloud.py")
spec = importlib.util.spec_from_file_location("_gcloud", _SCRIPT_PATH)
gcloud = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gcloud)


class TestGcloudCommand(unittest.TestCase):
    def test_non_windows_uses_resolved_binary_directly(self):
        with (
            patch.object(gcloud.sys, "platform", "darwin"),
            patch.object(gcloud.shutil, "which", return_value="/opt/bin/gcloud"),
        ):
            self.assertEqual(
                gcloud.gcloud_command(["gcloud", "config", "list"]),
                ["/opt/bin/gcloud", "config", "list"],
            )

    def test_windows_cmd_file_runs_through_cmd(self):
        path = r"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
        with (
            patch.object(gcloud.sys, "platform", "win32"),
            patch.object(gcloud.shutil, "which", return_value=path),
        ):
            self.assertEqual(
                gcloud.gcloud_command(["gcloud", "auth", "application-default", "print-access-token"]),
                ["cmd", "/c", path, "auth", "application-default", "print-access-token"],
            )

    def test_missing_gcloud_preserves_existing_error_behavior(self):
        with (
            patch.object(gcloud.sys, "platform", "linux"),
            patch.object(gcloud.shutil, "which", return_value=None),
        ):
            self.assertEqual(
                gcloud.gcloud_command(["gcloud", "version"]),
                ["gcloud", "version"],
            )

    def test_rejects_non_gcloud_commands(self):
        with self.assertRaises(ValueError):
            gcloud.gcloud_command(["python", "--version"])


if __name__ == "__main__":
    unittest.main()


class TestAdcConfigDir(unittest.TestCase):
    def test_cloudsdk_config_wins(self):
        with (
            patch.dict(os.environ, {"CLOUDSDK_CONFIG": "/custom/gcloud"}, clear=False),
            patch.object(gcloud.sys, "platform", "win32"),
        ):
            self.assertEqual(gcloud.adc_config_dir(), "/custom/gcloud")

    def test_windows_uses_appdata(self):
        env = {"APPDATA": r"C:\Users\ada\AppData\Roaming"}
        with (
            patch.dict(os.environ, env, clear=True),
            patch.object(gcloud.sys, "platform", "win32"),
        ):
            self.assertEqual(
                gcloud.adc_config_dir(),
                os.path.join(env["APPDATA"], "gcloud"),
            )

    def test_windows_without_appdata_falls_back_to_home(self):
        with (
            patch.dict(os.environ, {}, clear=True),
            patch.object(gcloud.sys, "platform", "win32"),
            patch.object(gcloud.os.path, "expanduser", return_value="/home/ada"),
        ):
            self.assertEqual(
                gcloud.adc_config_dir(),
                os.path.join("/home/ada", ".config", "gcloud"),
            )

    def test_posix_uses_home_config(self):
        with (
            patch.dict(os.environ, {}, clear=True),
            patch.object(gcloud.sys, "platform", "darwin"),
            patch.object(gcloud.os.path, "expanduser", return_value="/Users/ada"),
        ):
            self.assertEqual(
                gcloud.adc_config_dir(),
                os.path.join("/Users/ada", ".config", "gcloud"),
            )
