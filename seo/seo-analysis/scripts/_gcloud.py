"""Helpers for invoking the gcloud CLI portably."""

import os
import shutil
import subprocess
import sys


def gcloud_command(args):
    """Return a subprocess argument list for a gcloud command.

    On Windows, the Google Cloud SDK installs gcloud as gcloud.cmd. Python's
    shell=False path resolution does not expand PATHEXT for CreateProcess, so
    invoke the resolved batch file through cmd.exe.
    """
    if not args or args[0] != "gcloud":
        raise ValueError("gcloud_command expects args starting with 'gcloud'")

    gcloud = shutil.which("gcloud")
    if sys.platform == "win32" and gcloud and gcloud.lower().endswith((".cmd", ".bat")):
        return ["cmd", "/c", gcloud, *args[1:]]

    return [gcloud or "gcloud", *args[1:]]


def gcloud_run(args, *run_args, **run_kwargs):
    """Run gcloud with subprocess.run using the portable command wrapper."""
    return subprocess.run(gcloud_command(args), *run_args, **run_kwargs)


def adc_config_dir():
    """Return the gcloud config directory that holds the ADC file.

    CLOUDSDK_CONFIG wins when set. Otherwise gcloud writes its config to
    %APPDATA%\\gcloud on Windows and ~/.config/gcloud everywhere else.
    """
    if os.environ.get("CLOUDSDK_CONFIG"):
        return os.environ["CLOUDSDK_CONFIG"]
    if sys.platform == "win32":
        appdata = os.environ.get("APPDATA")
        if appdata:
            return os.path.join(appdata, "gcloud")
    return os.path.join(os.path.expanduser("~"), ".config", "gcloud")
