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
  - `vendor/` — three.js and the Press Start 2P font, baked into the built game
- `game/` — the first, flat 2D version of the game
  - `voice-lines.md` — every line the characters say

## Playing the game (no building needed)

`index.html` at the top of the repo is the whole game in one file. It runs offline: the 3D engine, the pixel font, and the kids' drawings are all inside it.

- **On a computer:** download `index.html` and open it in a browser.
- **On an iPad:** the Files app can't run games from a file. Open the game from a web link instead: the claude.ai link, or GitHub Pages if it's turned on for this repo. To open the debug panel on an iPad, add `#debug` to the end of the link.

## Building the game

```
python3 ps1/build.py
```

This writes `ps1/manor-konsz-ps1.html` and the same file as `index.html`. Open either one in a browser. Press Shift+D (or add `#debug` to the address) to open the debug panel for jumping to any point in the story.

The 2D version still builds with `python3 game/build.py`.
