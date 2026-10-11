#!/usr/bin/env python3
"""Copy real source files into the Kotlin Academy pages.

Any block of the form
    <script type="text/plain" data-code="kotlin" data-file="…" data-src="final-project/…/File.kt"></script>
gets its content replaced by the file at `data-src` (relative to the repository root),
so the final-project walkthrough always shows exactly the code that CI builds.

Usage:
    python3 tools/embed_sources.py          # rewrite pages in place
    python3 tools/embed_sources.py --check  # exit 1 if any page is out of date (for CI)
"""
import glob
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BLOCK = re.compile(r'(<script type="text/plain"[^>]*\sdata-src="([^"]+)"[^>]*>)(.*?)(</script>)', re.S)
INDENT = " " * 14


def render(match):
    open_tag, src, _, close_tag = match.groups()
    with open(os.path.join(ROOT, src), encoding="utf-8") as f:
        code = f.read().rstrip("\n")
    if "</script" in code:
        raise SystemExit(f"{src} contains '</script' and cannot be embedded")
    body = "\n".join(INDENT + line if line.strip() else "" for line in code.split("\n"))
    return f"{open_tag}\n{body}\n{INDENT[:-2]}{close_tag}"


def main():
    check = "--check" in sys.argv
    stale = []
    for page in sorted(glob.glob(os.path.join(ROOT, "kotlin-academy", "*.html"))):
        with open(page, encoding="utf-8") as f:
            html = f.read()
        updated = BLOCK.sub(render, html)
        if updated != html:
            stale.append(os.path.basename(page))
            if not check:
                with open(page, "w", encoding="utf-8") as f:
                    f.write(updated)
    if check and stale:
        print("Out of date (run tools/embed_sources.py):", ", ".join(stale))
        return 1
    print(("Up to date" if check else "Updated: " + (", ".join(stale) or "nothing")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
