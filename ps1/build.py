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
(ROOT / "ps1" / "manor-konsz-ps1.html").write_text(out)
print("wrote ps1/manor-konsz-ps1.html,", len(out) // 1024, "KB")
