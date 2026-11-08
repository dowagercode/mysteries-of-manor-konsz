# Note for the game developer

From the Story Keeper session, 2026-11-07, at Dandy's request.

## 1. The design notes are now split up

`doc/manor-konsz-notes.md` is now just a pointer. The notes were moved word for word into smaller files. Nothing was reworded.

- [README.md](README.md) — the list of files, story order, and the big story
- [characters.md](characters.md), [bad-guys.md](bad-guys.md), [gameplay.md](gameplay.md), [pictures.md](pictures.md), [open-questions.md](open-questions.md)
- [zones/](zones/) — one file per place, in story order, each with that place's story, how it plays, and its items and puzzles:
  `01-spaceship`, `02-crash-site`, `03-ping-pong-mountain`, `04-gas-station`, `05-road-map`, `06-supermarket`, `07-scary-forest`, `08-swamp-and-witch`, `09-wizard-castle`, plus `secret-mansion` (not placed in the story yet)

To work on one place, read just `README.md`, `gameplay.md`, and that place's zone file. The repo's top-level `README.md` still points at `doc/manor-konsz-notes.md`; please change it to `doc/README.md` when you're next in there. (Story Keeper only writes in `doc/`.)

## 2. Dandy's idea: split the game code the same way

Dandy asked whether the game software could also be split into separate files by location, to save time. Right now `game/template.html` is one ~2,500-line file. It already has clear sections (the ship rooms, the scene 1 puzzle chain, the hallways, the crash site, the ping-pong fight, the rocks puzzle, rendering, saving, buttons). One way to do it, for you to decide:

- shared code (walking, speech bubbles, rendering, saving, buttons) in its own files
- one file per place, named to match `doc/zones/` (for example `game/zones/04-gas-station.js`)
- `build.py` stitches them together, so `manor-konsz-game.html` stays one file you can open

Then a change to one place only means reading and editing that place's file. Please talk it over with Dandy before you start; it's a big move.

## 3. New design since the last update (batch summary)

Details are in the zone files. In short:

- **Story order:** crash site → ping-pong mountain → gas station → road map → closed supermarket → scary forest → swamp → wizard's castle.
- **Gas station** ([zones/04-gas-station.md](zones/04-gas-station.md)): the silent skeleton owner trades the jeep for 3 family stones. Dad: in the "Local Rocks" magazine on the rack (with Fishing, Caves, Maps, Road Stops, Comics). Wife: in the cupboard under the bathroom sink. Mom: fished out of the windshield washer container with the squeegee (the kids haven't confirmed mom yet). The supermarket key is on top of the toilet in the gas station restroom.
- **Road map** ([zones/05-road-map.md](zones/05-road-map.md)): a miniature jeep on a map like Super Mario World's, showing places already visited.
- **Closed supermarket** ([zones/06-supermarket.md](zones/06-supermarket.md)): piles of ramen and one mac and cheese box. Move the box to find the shopkeeper lady buried under the ramen (it fell in an earthquake caused by one of the wizard's experiments). Free her by levitating the ramen with telekinesis. She tells them how to get to the swamp and to avoid the witch.
- **Scary forest** ([zones/07-scary-forest.md](zones/07-scary-forest.md)): click pairs of eyes to find raccoons, possums, and so on. Woody, a giant tree monster, can only be clicked after some time. Sleeping trees block the road; ask Woody, and the trees stand up and walk away. (What Woody needs first: still being decided.)
- **From Dandy** ([gameplay.md](gameplay.md)): leave subtle hints (for example, that the squeegee can fish out the stone); make backgrounds consistent so the kids' room drawings match the other scenes; the PS1-style art idea and test room are still not decided.
- **New drawings not described yet:** `art/14-olivias-room.png`, `art/15-barbie-dream-house.png`, `art/16-jons-room.png`.

## 4. Voice idea from Dandy (asked while you were busy)

Dandy wants the text-to-speech to have more personality and be easier to understand, but still a little retro. Story Keeper suggested this; it's for you and Dandy to decide:

- **Make the lines ahead of time** with a free, open voice tool, and put the files in `game/voices/` using the names in `game/voice-lines.md`. The game already plays a recording when there is one, and uses the computer voice when there isn't. One file per line should also help with the overlapping voices Dandy noticed.
  - **Kokoro** (Apache license): natural and expressive. Probably the best fit for the kids.
  - **Piper** (open source): clear, with lots of voices.
- **Add a light retro filter** to each file: a lower sample rate, a little 8-bit crunch, and a small pitch shift per character. That keeps the lines easy to understand but old-school.
- **Very robotic voices for the bad guys:** eSpeak NG (open source), or SAM (a copy of the 1982 Commodore 64 voice; its license is unclear, so only for fun, not for sharing).
- **Quick test on the Mac:** the built-in novelty voices (Fred, Ralph, Zarvox, Trinoids, Junior, Albert, Bad News, Whisper, Bubbles) can be tried with `say -v <name> "..."`. Dandy is trying these now, and the kids may pick voices for each character.
- **Another option:** the kids record their own characters' lines, and they get the same retro filter.
