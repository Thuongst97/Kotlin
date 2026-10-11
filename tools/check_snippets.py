#!/usr/bin/env python3
"""Compile and run every runnable Kotlin example in the Kotlin Academy site.

A code block is checked when it is marked runnable:
    <script type="text/plain" data-code="kotlin" data-run> ... </script>
If the next element is an expected-output block
    <script type="text/plain" data-output> ... </script>
the program's stdout must match it exactly (trailing whitespace ignored),
unless the output block carries `data-loose` (timing/random output).

All snippets are compiled in ONE compiler invocation (each gets its own
package), then each main() is executed with a timeout.

Usage:
    python3 tools/check_snippets.py --kotlin-lib DIR [PAGE.html ...]

DIR must contain kotlin-compiler-embeddable, kotlin-stdlib, kotlin-reflect,
kotlin-script-runtime, kotlin-daemon-embeddable, trove4j, annotations and
kotlinx-coroutines-core-jvm jars (see .github/workflows/check-snippets.yml).
"""
import argparse
import glob
import html.parser
import os
import re
import subprocess
import sys
import tempfile
import textwrap

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "kotlin-academy")


class Extractor(html.parser.HTMLParser):
    """Collects <script type=text/plain> blocks in document order."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.blocks = []
        self._cur = None

    def handle_starttag(self, tag, attrs):
        if tag != "script":
            return
        a = dict(attrs)
        if a.get("type") != "text/plain":
            return
        self._cur = {"attrs": a, "text": "", "line": self.getpos()[0]}

    def handle_data(self, data):
        if self._cur is not None:
            self._cur["text"] += data

    def handle_endtag(self, tag):
        if tag == "script" and self._cur is not None:
            self.blocks.append(self._cur)
            self._cur = None


MARK_RE = re.compile(r"\s*//[+\-!]\s*$")


def clean(src):
    src = textwrap.dedent(src.strip("\n")).rstrip()
    return "\n".join(MARK_RE.sub("", line) for line in src.split("\n"))


def collect(pages):
    snippets = []
    for page in pages:
        ex = Extractor()
        with open(page, encoding="utf-8") as f:
            ex.feed(f.read())
        blocks = ex.blocks
        for i, b in enumerate(blocks):
            a = b["attrs"]
            if a.get("data-code") != "kotlin" or "data-run" not in a:
                continue
            expected = None
            loose = False
            if i + 1 < len(blocks) and "data-output" in blocks[i + 1]["attrs"]:
                expected = textwrap.dedent(blocks[i + 1]["text"].strip("\n")).rstrip()
                loose = "data-loose" in blocks[i + 1]["attrs"]
            snippets.append({
                "page": os.path.basename(page), "line": b["line"],
                "code": clean(b["text"]), "expected": expected, "loose": loose,
            })
    return snippets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kotlin-lib", required=True)
    ap.add_argument("--timeout", type=int, default=20)
    ap.add_argument("pages", nargs="*")
    args = ap.parse_args()
    pages = args.pages or sorted(glob.glob(os.path.join(SITE, "*.html")))
    snippets = collect(pages)
    print(f"Found {len(snippets)} runnable snippets in {len(pages)} pages")
    if not snippets:
        return 0

    lib = args.kotlin_lib
    jars = sorted(glob.glob(os.path.join(lib, "*.jar")))
    stdlib = next(j for j in jars if re.search(r"kotlin-stdlib-[\d.]+\.jar$", j))
    runtime_cp = [stdlib] + [j for j in jars if "coroutines" in j or "kotlin-reflect" in j]

    work = tempfile.mkdtemp(prefix="ka-snippets-")
    src_dir, out_dir = os.path.join(work, "src"), os.path.join(work, "out")
    os.makedirs(src_dir)
    for n, s in enumerate(snippets):
        s["pkg"] = f"s{n}"
        s["file"] = os.path.join(src_dir, f"S{n}.kt")
        with open(s["file"], "w", encoding="utf-8") as f:
            f.write(f"@file:Suppress(\"UNUSED_VARIABLE\", \"UNUSED_PARAMETER\")\npackage {s['pkg']}\n\n{s['code']}\n")

    cmd = ["java", "-cp", os.pathsep.join(jars), "org.jetbrains.kotlin.cli.jvm.K2JVMCompiler",
           "-no-stdlib", "-no-reflect", "-nowarn", "-cp", os.pathsep.join(runtime_cp),
           "-d", out_dir] + [s["file"] for s in snippets]
    res = subprocess.run(cmd, capture_output=True, text=True)
    errors = [l for l in (res.stdout + res.stderr).splitlines() if "error:" in l]
    failed = 0
    if res.returncode != 0:
        by_file = {}
        for l in errors:
            m = re.search(r"S(\d+)\.kt:(\d+):\d+: error: (.*)", l)
            if m:
                by_file.setdefault(int(m.group(1)), []).append((int(m.group(2)) - 3, m.group(3)))
        for n, errs in sorted(by_file.items()):
            s = snippets[n]
            print(f"\n✗ COMPILE {s['page']}:{s['line']}")
            for ln, msg in errs[:5]:
                print(f"    snippet line {ln}: {msg}")
        if not by_file:
            print(res.stdout, res.stderr)
        return 1

    for s in snippets:
        main_class = f"{s['pkg']}.S{s['pkg'][1:]}Kt"
        try:
            r = subprocess.run(["java", "-cp", os.pathsep.join([out_dir] + runtime_cp), main_class],
                               capture_output=True, text=True, timeout=args.timeout)
            out = (r.stdout + (r.stderr if r.returncode else "")).rstrip()
            out = "\n".join(l for l in out.splitlines() if not l.startswith("Picked up JAVA_TOOL_OPTIONS"))
        except subprocess.TimeoutExpired:
            out, r = "<timeout>", None
        problem = None
        if r is None:
            problem = "timed out"
        elif r.returncode != 0:
            if s["expected"] is None or s["expected"].strip() not in out:
                problem = f"exit code {r.returncode}"
        if not problem and s["expected"] is not None and not s["loose"]:
            norm = lambda t: "\n".join(l.rstrip() for l in t.strip().splitlines())
            if norm(out) != norm(s["expected"]):
                problem = "output mismatch"
        if problem:
            failed += 1
            print(f"\n✗ {problem.upper()} {s['page']}:{s['line']}")
            print("  expected:\n" + textwrap.indent(s["expected"] or "<none>", "    | "))
            print("  actual:\n" + textwrap.indent(out or "<empty>", "    | "))
    print(f"\n{len(snippets) - failed}/{len(snippets)} snippets passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
