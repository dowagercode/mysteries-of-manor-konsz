# Mysteries of Manor Konsz

A point-and-click story game designed by Dandy, Addie, and team, with story and art by the kids.

## What's in here

- `art/` — the kids' scanned drawings (`00-cover.png`, `01-four-kids.png`, ...)
- `doc/manor-konsz-notes.md` — the story and design notes
- `sample-art/` — the sketchbook page with sample art of the characters and scenes
- `game/` — the playable game
  - `template.html` — the game's code
  - `build.py` — builds `manor-konsz-game.html` from the template and the sketchbook art
  - `voice-lines.md` — every line the characters say

## Building the game

```
python3 game/build.py
```

Then open `game/manor-konsz-game.html` in a browser.
