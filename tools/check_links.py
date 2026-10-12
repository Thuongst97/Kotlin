#!/usr/bin/env python3
"""Check every external link in the Kotlin Academy pages and in refs.js.

Reports links that don't return HTTP 200 or that redirect to a different page.
Hosts that can't be reached at all (e.g. blocked by a proxy) are listed separately.

Usage: python3 tools/check_links.py
"""
import concurrent.futures as cf
import glob
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "kotlin-academy")


def collect():
    urls = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))) + [os.path.join(ROOT, "assets/js/refs.js")]:
        text = open(path, encoding="utf-8").read()
        # Skip embedded source code blocks: URLs there are code, not links.
        text = re.sub(r'<script type="text/plain".*?</script>', "", text, flags=re.S)
        if path.endswith(".js"):
            found = re.findall(r'(?:K|D) \+ "([^"]+)"|"(https?://[^"]+)"', text)
            for k, full in found:
                if full:
                    urls.setdefault(full, set()).add(os.path.basename(path))
            for k in re.findall(r'K \+ "([^"]+)"', text):
                urls.setdefault("https://kotlinlang.org/docs/" + k, set()).add("refs.js")
            for d in re.findall(r'D \+ "([^"]+)"', text):
                urls.setdefault("https://developer.android.com/" + d, set()).add("refs.js")
        else:
            for u in re.findall(r'<a\b[^>]*\bhref="(https?://[^"]+)"', text):
                urls.setdefault(u.replace("&amp;", "&"), set()).add(os.path.basename(path))
    return urls


def check(url):
    r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-L", "-m", "25", "-w", "%{http_code} %{url_effective}", url],
                       capture_output=True, text=True)
    code, _, effective = r.stdout.partition(" ")
    return url, code, effective


def main():
    urls = collect()
    broken, moved, unreachable = [], [], []
    with cf.ThreadPoolExecutor(8) as ex:
        for url, code, eff in ex.map(check, sorted(urls)):
            where = ", ".join(sorted(urls[url]))
            if code == "000" or (code == "403" and "github.com" in url):
                unreachable.append((url, where))
            elif code != "200":
                broken.append((url, code, where))
            elif eff.split("#")[0].rstrip("/") != url.split("#")[0].rstrip("/"):
                moved.append((url, eff, where))
    print(f"{len(urls)} unique external links")
    for u, c, w in broken:
        print(f"BROKEN {c} {u}  [{w}]")
    for u, e, w in moved:
        print(f"MOVED  {u} -> {e}  [{w}]")
    for u, w in unreachable:
        print(f"UNVERIFIED (host not reachable from this network) {u}  [{w}]")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
