#!/usr/bin/env python3
"""
Assembles the page from its components into ONE index.html.

    python3 build.py

What it does:
  1. Reads each component's .html file (in the order listed in PAGE below)
  2. Writes <link> tags for each component's .css and <script> tags for each .js
  3. Saves everything as index.html next to this file

To add/remove/reorder a section, edit PAGE (and STYLES / SCRIPTS if it has css/js).
"""
from pathlib import Path

ROOT = Path(__file__).parent

# Order of the page, top to bottom. The tuple is the first-screen <div class="page"> wrapper.
# lang-switch + dock are fixed overlays, so they sit OUTSIDE it to stay on top of every section.
PAGE = [
    "background",
    "header",
    ("page", ["hero", "promo-card", "tagline-bar", "intro-peek"]),
    "lang-switch",   # outside .page on purpose: .page is a stacking context, later sections would paint over these
    "dock",
    "showreel",
    "expertise",
    "offers",
    "approach",
    "work",
    "awards",
    "trust",
    "inside",
    "footer",
]

# CSS load order matters (later files win when specificity is equal)
STYLES = ["css/base.css"] + [f"components/{c}/{c}.css" for c in [
    "background", "header", "hero", "hero-variants", "promo-card", "lang-switch", "dock", "tagline-bar",
    "showreel", "expertise", "offers", "approach", "work", "awards", "trust", "inside", "footer", "intro-peek", "falling-shields",
]]

# runs in <head>, before the first paint (picks the random hero look)
HEAD_SCRIPTS = ["components/hero-variants/hero-variants.js"]

# js/main.js first (scroll engine), then per-component scripts
SCRIPTS = ["js/main.js", "components/background/background.js", "components/hero/hero.js", "components/falling-shields/falling-shields.js", "components/approach/approach.js",
           "components/awards/awards.js", "components/inside/inside.js"]


def component(name):
    return (ROOT / "components" / name / f"{name}.html").read_text(encoding="utf8").rstrip() + "\n"


def body():
    out = []
    for item in PAGE:
        if isinstance(item, tuple):
            out.append('<div class="page">\n')
            out += [component(n) for n in item[1]]
            out.append("</div>\n")
        else:
            out.append(component(item))
    return "\n".join(out)


head_scripts = "\n".join(f'<script src="{s}"></script>' for s in HEAD_SCRIPTS)
links = "\n".join(f'<link rel="stylesheet" href="{s}">' for s in STYLES)
scripts = "\n".join(f'<script src="{s}"></script>' for s in SCRIPTS)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Hello, again.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
{head_scripts}
{links}
</head>
<body>
{body()}
{scripts}
</body>
</html>
"""
(ROOT / "index.html").write_text(html, encoding="utf8")
print("index.html built from", len(PAGE), "blocks")
