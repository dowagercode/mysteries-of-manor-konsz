"""Builds the playable mockup from the sketchbook art page.

Copies the shared character drawings and the scene pictures out of
sample-art/manor-konsz-sketchbook.html, labels the parts the game animates,
and writes game/manor-konsz-game.html.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
art = (ROOT / "sample-art" / "manor-konsz-sketchbook.html").read_text()
template = (ROOT / "game" / "template.html").read_text()

defs = re.search(r'<svg width="0" height="0".*?</svg>', art, re.S).group(0)
# A copy of the ping-pong bad guy without his paddle, for after Jasin's fireball knocks it away.
pp_sym = re.search(r'<symbol id="pingpong".*?</symbol>', defs, re.S).group(0)
pp_empty = (pp_sym.replace('<symbol id="pingpong"', '<symbol id="pingpong2"')
            .replace('<path d="M180 166 L172 176" fill="none" stroke-width="6"/>', "")
            .replace('<circle cx="192" cy="152" r="17" fill="#e8542c"/>', ""))
assert pp_empty != pp_sym.replace('<symbol id="pingpong"', '<symbol id="pingpong2"'), "couldn't find the paddle in the ping-pong symbol"
defs = defs.replace("</defs>", pp_empty + "</defs>")

# Find each scene by words in its description, not by its order on the page.
found = re.findall(r'<figure>\s*<svg viewBox="0 0 800 450"[^>]*aria-label="([^"]*)"[^>]*>(.*?)</svg>\s*<figcaption>', art, re.S)
KEYWORDS = {
    "manor": "creepy manor at night",
    "hideout": "Jon's purple oval",
    "spaceship": "smiling flying ship",
    "splash": "falls through space",
    "pingpong": "ping-pong bad guy waits",
    "whichone": "bike, a train, and a jeep",
    "living": "creepy living room",
    "jeep": "creepy jeep drives",
    "witchhouse": "standing on bird legs",
    "castle": "wizard's twisty castle",
}
scenes = {}
for name, words in KEYWORDS.items():
    matches = [body for label, body in found if words in label]
    assert len(matches) == 1, f"scene '{name}': expected 1 match for '{words}', found {len(matches)}"
    scenes[name] = matches[0]


def wrap(s, start, end, gid, cls="anim", frm=0, style=""):
    """Wrap the markup from `start` through `end` in a <g> the game can animate."""
    i = s.index(start, frm)
    j = s.index(end, i) + len(end)
    style_attr = f' style="{style}"' if style else ""
    return s[:i] + f'<g id="{gid}" class="{cls}"{style_attr}>' + s[i:j] + "</g>" + s[j:]


# Spaceship: the ship bobs and zooms. The kids' "git out" bubble belongs to the hideout, so hide it here.
s = scenes["spaceship"]
s = wrap(s, '<g transform="translate(110 110)">', "</text>\n          </g>", "shipGroup")
s = wrap(s, '<path d="M560 70 Q560 36 650 36', "GIT OUT!!</text>", "shipBubble", style="display:none")
scenes["spaceship"] = s

# Jon's hideout: May stomps, speech bubbles pop, Jon scoots out.
s = scenes["hideout"]
s = wrap(s, '<use href="#may" x="86" y="160"', "/>", "mayH")
s = wrap(s, '<path d="M120 54 Q120 22 190 22', "Git out!!</text>", "bubMay")
s = wrap(s, '<use href="#jon" x="540" y="140"', "/>", "jonH")
s = wrap(s, '<path d="M610 52 Q610 24 680 24', "No ma'am!</text>", "bubJon")
# Things May can lift with telekinesis.
s = wrap(s, '<g stroke="#2a1f3d" stroke-width="4" stroke-linejoin="round">\n              <rect x="462" y="190"',
         '<circle cx="498" cy="282" r="7" fill="#ffd23f" stroke="#2a1f3d" stroke-width="2.5"/>', "box")
s = wrap(s, '<path d="M732 292 C746 292', ">?</text>", "egg")
scenes["hideout"] = s

# Splashdown: asteroids fly in, the ship falls, splashes, and says "Shucks!"
s = scenes["splash"]
s = wrap(s, '<path d="M70 92 Q72 58 106 54', '<path d="M176 132 L190 136"/></g>', "asteroids")
s = wrap(s, '<g transform="rotate(22 180 290)">', '<path d="M20 250 L40 285"/></g>', "shipFall")
s = wrap(s, '<path d="M210 330 Q210 300 300 300', "AHHHHH!</text>", "bubAhh")
s = wrap(s, '<g transform="rotate(32 610 250)">', "</g>", "shipSplash")
s = wrap(s, '<g fill="#e6f4ff" stroke="#2a1f3d" stroke-width="3">', "</g>", "splashDrops")
s = wrap(s, '<path d="M560 70 Q560 36 660 36', "Shucks!</text>", "bubShucks")
scenes["splash"] = s

# Ping-pong station: kids run in standing, Olivia spins, friends float, the bad guy swings and falls.
s = scenes["pingpong"]
s = wrap(s, '<use href="#pingpong" x="470" y="250"', "/>", "badguy")
s = wrap(s, '<circle cx="70" cy="244"', 'M194 306 L194 318"/>\n          </g>', "floaters")
s = wrap(s, '<use href="#olivia" x="196" y="340"', '<path d="M276 390 Q282 370 268 360"/>\n          </g>', "oliviaSpin")
s = wrap(s, '<path d="M520 268 Q470 250 440 290"', "MISSED!</text>", "missed")
start = s.index("<!-- Olivia spins and her friends float out of reach -->")
end = s.index("MISSED!</text></g>") + len("MISSED!</text></g>")
standing = (
    '<g id="standing" class="anim">'
    '<use href="#may" x="40" y="340" width="60" height="90"/>'
    '<use href="#jon" x="88" y="340" width="66" height="90"/>'
    '<use href="#jasin" x="146" y="340" width="60" height="90"/>'
    '<use href="#olivia" x="196" y="340" width="60" height="90"/>'
    "</g>"
)
ko = (
    '<g id="ko" class="anim" style="display:none">'
    '<text x="560" y="262" font-family="Patrick Hand, Comic Sans MS, cursive" font-size="34" fill="#f6e7b8">Zzz</text>'
    "</g>"
)
scenes["pingpong"] = s[:start] + standing + '<g id="spinfx" style="display:none">' + s[start:end] + "</g>" + ko + s[end:]

# Witch's swamp: the apprentice bobs in his boat; the kids, the witch, swirling water, and the cage are added.
s = scenes["witchhouse"]
s = wrap(s, "<!-- the apprentice in a little boat on the swamp -->",
         '<path d="M140 276 L144 294" stroke="#f6e7b8" stroke-width="2.5" stroke-linecap="round"/>', "appr", cls="anim bob")
s += (
    '<g id="ripples" class="anim" style="display:none" fill="none" stroke="#9fc48a" stroke-width="4">'
    '<ellipse cx="560" cy="390" rx="80" ry="20"/><ellipse cx="560" cy="390" rx="140" ry="34"/><ellipse cx="560" cy="390" rx="200" ry="48"/>'
    "</g>"
    '<g id="swampKids" class="anim">'
    '<use href="#may" x="600" y="320" width="50" height="75"/>'
    '<use href="#jon" x="642" y="320" width="55" height="75"/>'
    '<use href="#jasin" x="688" y="320" width="50" height="75"/>'
    '<use href="#olivia" x="730" y="320" width="50" height="75"/>'
    "</g>"
    '<g id="witch" style="display:none"><g id="witchBody" class="anim"><use href="#witch" x="240" y="246" width="100" height="145"/></g></g>'
    '<g id="cage" class="anim" style="display:none" stroke="#2a1f3d" stroke-width="3">'
    '<rect x="366" y="268" width="48" height="70" fill="#5a3f2a"/>'
    '<use href="#witch" x="370" y="276" width="40" height="58"/>'
    '<path d="M370 270 V336 M380 270 V336 M390 270 V336 M400 270 V336 M410 270 V336" stroke="#c9c2b0" stroke-width="3"/>'
    "</g>"
)
scenes["witchhouse"] = s

# Creepy jeep: the whole jeep drives up the road.
s = scenes["jeep"]
s = wrap(s, '<g transform="translate(150 300)">',
         '<circle cx="24" cy="80" r="6" fill="#bbb"/><circle cx="158" cy="80" r="6" fill="#bbb"/>\n          </g>', "jeepG")
scenes["jeep"] = s

# Castle: by now the witch is locked in her cage, so take her out of the swamp here.
scenes["castle"] = scenes["castle"].replace('<use href="#witch" x="150" y="300" width="80" height="116"/>', "")

out = template.replace("__DEFS__", defs).replace("__SCENES__", json.dumps(scenes))
(ROOT / "game" / "manor-konsz-game.html").write_text(out)
print("wrote game/manor-konsz-game.html,", len(out) // 1024, "KB")
