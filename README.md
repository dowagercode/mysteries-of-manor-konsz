# Mysteries of Manor Konsz

A point-and-click story game designed by Dandy, Addie, and team, with story and art by the kids.

## What's in here

- `art/` — the kids' scanned drawings (`00-cover.png`, `01-four-kids.png`, ...)
- `doc/README.md` — the story and design notes (one file per topic, and one per place in `doc/zones/`)
- `sample-art/` — the sketchbook page with sample art of the characters and scenes
- `ps1/` — the main game: low-poly 3D rooms built from the kids' drawings, with pixel-sprite characters
  - `template.html` — the game's code
  - `build.py` — builds `manor-konsz-ps1.html` from the template, the sketchbook art, and `tex/`
  - `tex/` — small copies and crops of the kids' drawings used as textures
- `game/` — the first, flat 2D version of the game
  - `voice-lines.md` — every line the characters say

## Building the game

```
python3 ps1/build.py
```

Then open `ps1/manor-konsz-ps1.html` in a browser. Press Shift+D (or add `#debug` to the address) to open the debug panel for jumping to any point in the story.

The 2D version still builds with `python3 game/build.py`.
