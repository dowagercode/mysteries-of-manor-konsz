"""Builds the PS1-style test from ps1/template.html.

Pulls the character drawings out of the sketchbook page (they become pixel
sprites in the browser) and tucks small copies of the kids' scans into the page,
then writes ps1/manor-konsz-ps1.html.
"""
import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
art = (ROOT / "sample-art" / "manor-konsz-sketchbook.html").read_text()
template = (ROOT / "ps1" / "template.html").read_text()

defs = re.search(r"<defs>.*?</defs>", re.search(r'<svg width="0" height="0".*?</svg>', art, re.S).group(0), re.S).group(0)

# The spider is drawn inside one of the sketchbook scenes; bring it along with the shared drawings.
if '<symbol id="spider"' not in defs:
    spider = re.search(r'<symbol id="spider".*?</symbol>', art, re.S).group(0)
    defs = defs.replace("</defs>", spider + "</defs>")

images = {}
for f in sorted((ROOT / "ps1" / "tex").glob("*.jpg")):
    images[f.stem] = "data:image/jpeg;base64," + base64.b64encode(f.read_bytes()).decode()

out = template.replace("__DEFS__", json.dumps(defs)).replace("__IMAGES__", json.dumps(images))

# Bake the 3D engine (three.js) and the pixel font into the page, so the one file
# runs anywhere with no internet and no build step (for example, on an iPad).
three = (ROOT / "ps1" / "vendor" / "three.module.js").read_text()
exp = re.search(r"export\s*\{([^}]*)\};?\s*$", three)
names = []
for part in exp.group(1).split(","):
    part = part.strip()
    if not part:
        continue
    if " as " in part:
        local, public = [x.strip() for x in part.split(" as ")]
        names.append(f"{public}: {local}")
    else:
        names.append(part)
three_inline = "const THREE = (() => {\n" + three[: exp.start()] + "\nreturn { " + ", ".join(names) + " };\n})();"
import_line = 'import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";'
assert import_line in out, "three.js import line not found in the template"
out = out.replace(import_line, three_inline)

font = base64.b64encode((ROOT / "ps1" / "vendor" / "press-start-2p-latin.woff2").read_bytes()).decode()
font_css = ('<style>@font-face { font-family: "Press Start 2P"; font-style: normal; font-weight: 400; '
            f'src: url(data:font/woff2;base64,{font}) format("woff2"); }}</style>')
out = re.sub(r'<link rel="preconnect"[^>]*>\s*<link href="https://fonts.googleapis.com[^>]*>', lambda m: font_css, out)
assert "fonts.googleapis.com" not in out and "cdn.jsdelivr.net" not in out, "something still loads from the internet"

(ROOT / "ps1" / "manor-konsz-ps1.html").write_text(out)
(ROOT / "index.html").write_text(out)  # the same game at the top of the repo, ready to open
print("wrote ps1/manor-konsz-ps1.html and index.html,", len(out) // 1024, "KB")
