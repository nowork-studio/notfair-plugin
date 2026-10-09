#!/usr/bin/env python3
"""notfair-content-calendar — local viewer for the NotFair content calendar.

Reads {data_dir}/content-calendar.json (produced by the /notfair:content-planner
skill) and serves a read-only HTML view on localhost. Stdlib only — no pip
install.

Usage:
  notfair-content-calendar                       # auto-resolve calendar, port 8323
  notfair-content-calendar --port 9000           # custom port
  notfair-content-calendar --calendar PATH       # explicit calendar JSON
  notfair-content-calendar --no-open             # don't auto-open the browser

Stop with Ctrl+C.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import html
import json
import os
import socket
import sys
import threading
import time
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DEFAULT_PORT = 8323


def resolve_calendar_path(explicit: str | None) -> Path:
    """Find the calendar JSON. Explicit path wins; else project-local then global."""
    if explicit:
        return Path(explicit).expanduser().resolve()

    project = Path.cwd() / ".notfair" / "content-calendar.json"
    if project.is_file():
        return project

    home = Path.home() / ".notfair" / "content-calendar.json"
    return home


def load_calendar(path: Path) -> dict:
    if not path.is_file():
        return {
            "_missing": True,
            "_path": str(path),
        }
    try:
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
    except json.JSONDecodeError as exc:
        return {"_error": f"Invalid JSON: {exc}", "_path": str(path)}
    data["_path"] = str(path)
    data["_loaded_at"] = _dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
    return data


def render_page(cal: dict) -> str:
    if cal.get("_missing"):
        return _page(
            "Calendar not found",
            f"""
            <div class="empty">
              <h1>No calendar yet</h1>
              <p>Looked for <code>{html.escape(cal['_path'])}</code> and didn't find it.</p>
              <p>Run the <code>/notfair:content-planner</code> skill in your
              agent to generate one, then reload this page.</p>
            </div>
            """,
        )
    if cal.get("_error"):
        return _page(
            "Calendar error",
            f"""
            <div class="empty">
              <h1>Couldn't read the calendar</h1>
              <p><strong>File:</strong> <code>{html.escape(cal['_path'])}</code></p>
              <p><strong>Error:</strong> {html.escape(cal['_error'])}</p>
            </div>
            """,
        )

    topics = cal.get("topics") or []
    warnings = cal.get("warnings") or []
    site = cal.get("site") or "(no site set)"
    generated = cal.get("generated") or cal.get("_loaded_at") or ""
    horizon = cal.get("horizonWeeks") or "?"
    lookback = cal.get("lookbackDays") or "?"

    topics_sorted = sorted(
        topics,
        key=lambda t: (
            _date_key(t.get("scheduledDate")),
            -_safe_num(t.get("gsc", {}).get("clickPotential", 0)),
        ),
    )

    warning_html = ""
    if warnings:
        items = "".join(
            f"<li>{html.escape(str(w))}</li>" for w in warnings
        )
        warning_html = f"""
            <section class="warnings">
              <h2>Warnings ({len(warnings)})</h2>
              <ul>{items}</ul>
            </section>
        """

    rows = "\n".join(_topic_row(t) for t in topics_sorted)
    if not rows:
        rows = '<tr><td colspan="7" class="empty-cell">No topics scheduled yet.</td></tr>'

    body = f"""
    <header>
      <div class="brand">NotFair · Content Calendar</div>
      <div class="meta">
        <span>Site: <strong>{html.escape(str(site))}</strong></span>
        <span>{lookback}d lookback · {horizon}w horizon</span>
        <span>Generated: {html.escape(str(generated))}</span>
      </div>
    </header>

    {warning_html}

    <main>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Primary keyword</th>
            <th>Opportunity</th>
            <th>Click potential</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </main>

    <footer>
      <code>{html.escape(cal['_path'])}</code>
      &nbsp;·&nbsp; Read-only viewer. Edit the JSON and reload to update.
    </footer>
    """
    return _page("NotFair Content Calendar", body)


def _topic_row(t: dict) -> str:
    gsc = t.get("gsc") or {}
    cp = _safe_num(gsc.get("clickPotential"))
    pri = (t.get("priority") or "").upper()
    status = t.get("status") or "planned"
    opp = t.get("opportunity") or "-"
    return f"""
    <tr class="row status-{html.escape(status)} priority-{html.escape(pri)}">
      <td>{html.escape(t.get("scheduledDate", "—"))}</td>
      <td>
        <div class="title">{html.escape(t.get("title", "(untitled)"))}</div>
        <div class="rationale">{html.escape(t.get("rationale", ""))}</div>
      </td>
      <td><code>{html.escape(t.get("primaryKeyword", ""))}</code></td>
      <td><span class="bucket bucket-{html.escape(opp)}">{html.escape(opp)}</span></td>
      <td class="num">{cp:,.0f}</td>
      <td><span class="pri pri-{html.escape(pri)}">{html.escape(pri)}</span></td>
      <td><span class="status status-{html.escape(status)}">{html.escape(status)}</span></td>
    </tr>
    """


def _safe_num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _date_key(d):
    if not d:
        return "9999-12-31"
    return str(d)


def _page(title: str, inner: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{html.escape(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root {{
    --bg: #fafaf7;
    --ink: #1a1a1a;
    --muted: #6b6b6b;
    --accent: #ff6b35;
    --line: #e5e3dd;
    --row-alt: #f4f3ee;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--ink);
    background: var(--bg);
  }}
  header {{
    padding: 20px 32px;
    border-bottom: 1px solid var(--line);
    background: white;
  }}
  .brand {{
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }}
  .brand::before {{
    content: "";
    display: inline-block;
    width: 10px; height: 10px;
    background: var(--accent);
    border-radius: 50%;
    margin-right: 8px;
    transform: translateY(-1px);
  }}
  .meta {{
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }}
  main {{ padding: 24px 32px; }}
  table {{
    width: 100%;
    border-collapse: collapse;
    background: white;
    border: 1px solid var(--line);
  }}
  th, td {{
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }}
  th {{
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    background: var(--row-alt);
  }}
  tbody tr:nth-child(even) {{ background: var(--row-alt); }}
  .title {{ font-weight: 500; }}
  .rationale {{ color: var(--muted); font-size: 12px; margin-top: 2px; }}
  code {{
    font: 12px/1 SFMono-Regular, Menlo, Consolas, monospace;
    background: var(--row-alt);
    padding: 2px 6px;
    border-radius: 4px;
  }}
  .num {{ text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }}
  .bucket, .pri, .status {{
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: #ececec;
    color: #444;
  }}
  .bucket-striking-distance {{ background: #fff1e6; color: #c4540a; }}
  .bucket-gap {{ background: #e8f1ff; color: #1a56b8; }}
  .bucket-ctr-underperformer {{ background: #fff8d6; color: #8a6d00; }}
  .bucket-refresh {{ background: #ebe5ff; color: #5a3eb5; }}
  .pri-P0 {{ background: #ffe0d6; color: #b8350f; }}
  .pri-P1 {{ background: #fff1d6; color: #8a4d00; }}
  .pri-P2 {{ background: #e8ece8; color: #4a4a4a; }}
  .status-published {{ background: #d8f1d8; color: #1f6b1f; }}
  .status-in-progress {{ background: #fff1d6; color: #8a4d00; }}
  .status-planned {{ background: #e8ece8; color: #4a4a4a; }}
  .warnings {{
    margin: 24px 32px 0;
    padding: 14px 18px;
    background: #fff5e6;
    border: 1px solid #f3d6a0;
    border-radius: 6px;
  }}
  .warnings h2 {{ margin: 0 0 6px; font-size: 13px; color: #8a4d00; text-transform: uppercase; letter-spacing: 0.05em; }}
  .warnings ul {{ margin: 0; padding-left: 20px; }}
  .empty {{ padding: 60px 32px; text-align: center; color: var(--muted); }}
  .empty h1 {{ font-size: 22px; color: var(--ink); }}
  .empty-cell {{ padding: 40px; text-align: center; color: var(--muted); }}
  footer {{
    padding: 16px 32px;
    color: var(--muted);
    font-size: 12px;
    border-top: 1px solid var(--line);
  }}
</style>
</head>
<body>
{inner}
</body>
</html>"""


def _build_handler(calendar_path: Path):
    """Closure over calendar_path so we re-read on every request."""

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            if self.path in ("/", "/index.html"):
                cal = load_calendar(calendar_path)
                body = render_page(cal).encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
                return
            if self.path == "/calendar.json":
                cal = load_calendar(calendar_path)
                body = json.dumps(cal, indent=2).encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
                return
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

        def log_message(self, fmt, *args):  # quieter than the default
            sys.stderr.write(
                "[%s] %s\n" % (self.log_date_time_string(), fmt % args)
            )

    return Handler


def _port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        try:
            s.connect((host, port))
            return True
        except OSError:
            return False


def _should_auto_open(no_open: bool, platform: str, display: str) -> bool:
    """Whether to auto-open the browser. Honors --no-open on every platform."""
    if no_open:
        return False
    return bool(display) or platform == "darwin" or platform == "win32"


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="notfair-content-calendar")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--calendar", default=None,
                        help="Path to content-calendar.json (default: ./.notfair/... → ~/.notfair/...)")
    parser.add_argument("--host", default="127.0.0.1",
                        help="Bind host (default 127.0.0.1; loopback only)")
    parser.add_argument("--no-open", action="store_true",
                        help="Don't auto-open the browser")
    args = parser.parse_args(argv)

    calendar_path = resolve_calendar_path(args.calendar)

    port = args.port
    if _port_in_use(port, args.host):
        # Try the next 9 ports rather than failing.
        for candidate in range(port + 1, port + 10):
            if not _port_in_use(candidate, args.host):
                print(f"port {port} is in use; using {candidate}", file=sys.stderr)
                port = candidate
                break
        else:
            print(f"all ports {args.port}..{args.port + 9} are in use; specify --port", file=sys.stderr)
            return 2

    handler = _build_handler(calendar_path)
    try:
        server = ThreadingHTTPServer((args.host, port), handler)
    except OSError as exc:
        print(f"could not bind {args.host}:{port}: {exc}", file=sys.stderr)
        return 2

    url = f"http://{args.host}:{port}/"
    print(f"NotFair content calendar — {url}")
    print(f"Reading: {calendar_path}")
    print("Ctrl+C to stop.")

    if _should_auto_open(args.no_open, sys.platform, os.environ.get("DISPLAY", "")):
        # Open in a thread so we don't block startup if the browser command stalls.
        threading.Thread(target=lambda: (time.sleep(0.2), webbrowser.open(url)), daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopping.", file=sys.stderr)
        server.shutdown()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
