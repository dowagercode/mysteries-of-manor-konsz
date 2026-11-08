# Task for Gemini: the "flat skin" (Mysteries of Manor Konsz)

Written by Claude for Gemini (Antigravity), 2026-11-08. Dandy asked for this; the decisions are also in `doc/gameplay.md` ("Flat skin").

## What to build

A second look for the whole game, in the style of the first, flat version (`game/manor-konsz-game.html`, the 2D point-and-click: flat scenes, kids as flat cutouts walking across with a bouncy slide). The game can then be played in either look:

- **Flat 2D scenes.** Each place is a flat picture made from the kids' own drawing of that place. The kids walk across it as flat cutouts. Things in the drawing are clickable.
- **Same game underneath.** Same story, puzzles, items, powers, goal line, dialogue, voices and saved game. The flat skin is only a different *view*. Do not copy or rewrite story logic.
- **A button switches looks at any moment:** "Look: 3D" / "Look: Flat", next to the existing `PS1 hint` and `3D chars` buttons (`ps1/template.html` around line 112). Pressing it mid-game redraws the current room in the other look; May stays where she is with the same items and progress.
- **Scope now: the ship (chapter 1) only.** Every ship room has a kids' drawing. Other chapters come later, one at a time. Places without flat art must keep working by falling back to the 3D view automatically (with a small note like "Flat look coming soon for this place"), so the button is always safe to press.

## How the game is built (read first)

- Code: `ps1/src/*.js`, joined in the order in `SRC_ORDER` in `ps1/build.py` into one offline page. `ps1/src/README.md` explains each file. Build: `python3 ps1/build.py` (writes `ps1/manor-konsz-ps1.html` and repo-root `index.html`; GitHub Pages serves `index.html`).
- Each place is a level: `LV.<id> = () => { const L = newLevel(id, name); ... return L; }`. Ship levels are in `ps1/src/ch1-ship.js`.
- **Clickable things are "hots":** objects in `L.hots`, each with `o.userData.hot = { name, say, use, go, run, show, stand, exit }`. Clicking calls `useHot(o)` in `ps1/src/runtime.js`, which walks the player to `stand` and then runs `act(h)` (or an item/power use). **The flat view must call the same `useHot(o)` for the same hot objects.** That way every puzzle, item, power (`ps1/src/powers.js`), return-visit line and goal update keeps working with no changes.
- Characters: `addChar()` in `ps1/src/engine.js`; positions are `c.pos` (x, z) inside `L.walk = [xMin, xMax, zMin, zMax]`. Sprites come from `SPR[key]` (the kids' sketchbook drawings), so the flat cutouts can reuse the same images. `L.player` is the kid you control; after the crash `L.crew` holds all four.
- Images: every `ps1/tex/*.jpg` is embedded automatically as `IMAGES["<file name without .jpg>"]`. Original scans are in `art/` (add crops you need to `ps1/tex/`).
- The HUD (goal line, "Doors here" buttons, item drawer, power button, dialogue box, Dream House toy) is plain HTML and should work unchanged in both looks.

## Suggested design

1. **New files** `ps1/src/flat.js` (the flat view) and `ps1/src/flat-rooms.js` (per-room data). Add both to `SRC_ORDER`. Keep changes to existing files to small hooks (toggle button, skipping the 3D render while flat, the click hook).
2. **Per-room data:**
   ```js
   FLAT.mays = {
     img: "mays-room",                    // IMAGES key
     spots: { "Barbie Dream House": [x, y, w, h], ... },   // fractions (0-1) of the drawing
     floor: [x0, x1, yBack, yFront],      // where the kids can walk on the drawing
   };
   ```
   Map `c.pos` (inside `L.walk`) to the drawing linearly: x to x, z to the floor band (with a little scaling so kids further back look smaller).
3. **Matching spots to hots by name.** Some names repeat (`Box` x4 in storage, `Heart balloons` x6, `Chair` x2): match them by name plus order (the nth hot with that name). Respect `h.show()`: hide a spot when its hot is hidden (for example `Sugar` disappears once taken).
4. **Clicks:** a click on a spot calls `useHot(thatHotObject)`; a click on the floor walks there (same as the 3D `walkTo`). Hover text and the selected-item hint should read the same as in 3D.
5. **Door name tags:** in 3D each exit gets one small semi-transparent name tag. In flat, place that same single tag over the door's spot (Dandy's rule: one label per door, no extra painted labels).
6. **Rendering:** while flat, don't render the 3D scene at all (the iPad is slow). Draw the room image plus the character cutouts (DOM or a 2D canvas over `#stage`). Use the bouncy-slide walk of the first version, and flip a cutout to face the way it walks.
7. **Remember the look** per device in its own `localStorage` key (wrap in try/catch). It is not part of the saved game.

## The ship rooms, their drawings, and their clickable things

| Level id | Place | Drawing to use |
|---|---|---|
| `mays` | May's Room | `ps1/tex/mays-room.jpg` (art/12) |
| `jasins` | Jasin's Room | `ps1/tex/jasins-room.jpg` (art/13) |
| `olivias` | Olivia's Room | `ps1/tex/olivias-room.jpg` (art/14) |
| `jons` | Jon's Room | `ps1/tex/jons-room.jpg` (art/16) |
| `playroom` | Playroom | `ps1/tex/playroom.jpg` (art/17) |
| `hub` | Kitchen + Rec Room | `ps1/tex/kitchen.jpg` (art/19) on the left + `ps1/tex/living-room.jpg` (art/18) on the right, side by side |
| `control` | Control Room | `ps1/tex/control-room.jpg` (art/20) |
| `armory` | Armory | `ps1/tex/armory.jpg` (art/22) |
| `bath` | Bathroom | `ps1/tex/bathroom.jpg` (art/23) |
| `storage` | Storage | `ps1/tex/storage-room.jpg` (art/24) |
| `engine` | Engine Room | `ps1/tex/engine-room.jpg` (art/26, the NEW engine room) |
| `hall` | Hallway | art/21-hallway-doors.png (crop it into `ps1/tex/`). The drawing's door order differs from the game's, so **use the game's order** (`HALL_DOORS` in ch1-ship.js; engine room at one end, control room at the other) and place cut-out doors from the drawing along a wide strip that scrolls with May. |
| `hideout` | Inside Jon's Portal | the round room from art/02-spaceship-and-hideout.png (the "IN" half). Its oval doorway shows the place the portal was opened from; in flat, showing that place's drawing inside the oval is enough. |
| intro | the ship in space (click it to go in) | the flying ship from art/02 (the "OUT" half), or art/05. See `spaceCut` / `spaceWait` / `enterShip()` in runtime.js. |

Clickable things per room (from the running game; "(sometimes)" = has a `show()` condition):

- **hall**: Door to the storage, bathroom, May's room, Jon's room, kitchen + rec room, Jasin's room, Olivia's room, playroom, engine room, control room
- **hub**: Fridge, Old TV, Stove, Kitchen drawers, Window, Space flower (sometimes), Kitchen table, Kitchen mouse, TV, Chair, Chair, Box with faces, Door to the hallway, Climb down to the boat (sometimes, later chapters), Jasin
- **mays**: Door to the hallway, Sign: May's room, I love ♥ picture, Heart shelf, Sugar (sometimes), Barbie Dream House, May's bed, Heart balloons x6, Addie's drawing
- **jasins**: Door to the hallway, Sign: Jasin's room, Soccer ball picture, Jasin's medals, Soccer-ball balloons x3, Jasin's bed, Oil (sometimes), The kids' drawing
- **olivias**: Door to the hallway, Sign: Olivia's room, Dance poster, Olivia's bed, Flour (sometimes), The kids' drawing, Olivia
- **jons**: Door to the hallway, Picture, Sign: Jon's room, Robot, Little figure, Jon's bed, iPad, Cacao (sometimes), Jon's portal (climb in), The kids' drawing
- **hideout**: Climb out of the portal, Tall box, A mystery egg with a ?, Pile of papers, Jon (sometimes)
- **playroom**: Door to the hallway, TV, Beanbag, Toy box, Blocks, The kids' drawing
- **control**: Big window, Control panel, Small grey panel, Armory door, Keycard reader, Door to the hallway, The kids' drawing
- **armory**: Door to the control room, Small brown blaster, Big orange blaster, Long black blaster, Small weapons, Flashlight (sometimes), The kids' drawing
- **engine**: Door to the hallway, The engine, Red box, Olivia's memory pills (sometimes), Locked box, Blue water tank, Jon (sometimes), The kids' drawing
- **storage**: Door to the hallway, Box x4, Box ?, Yeast (sometimes), Green slime x2, Spider x2, The kids' drawing
- **bath**: Door to the hallway, Toilet, Sink, Mirror, Bathtub, Rubber duck, The kids' drawing

("The kids' drawing" is a framed copy of the scan hanging in the 3D room. In flat the whole room *is* the drawing, so that spot can be left out.)

Things that change during the story and should show in flat too, where simple: items disappear when taken (handled by `show()`), Jon leaves his portal room and appears in the engine room, the engine room stops leaking once fixed, the kitchen mouse peeks out. A small cutout or overlay is enough.

## House rules (from Dandy, do not break)

- **Don't invent story or puzzles.** Use only what's in `doc/` (`doc/README.md` first). If something is missing, mark it "the kids are still writing this".
- The kids' drawings are the art. Don't redraw over them. Crop, cut out and place.
- **One label per door:** a small, semi-transparent name tag only. No painted labels, hanging signs or EXIT signs. The kids' own drawn signs stay.
- **May never floats herself when she uses telekinesis.** Only the thing she moves floats.
- Jasin's ball and Olivia's tutu glow **cyan** (`0x3ff0ff`).
- Jon's purple oval is called his **"portal"** in all player-facing text (not "hole", not "portable hole").
- No hint sparkles around items. The kids should explore.
- Keep text readable on an iPad; the game must still work in full screen.

## Testing

- Syntax check (no node here): join the source files and run `deno lint --rules-include=no-undef` on them. Ignore browser globals like `document`.
- Playthroughs: `python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=mays" ps1/tests/out/run "$(cat ps1/tests/play.js)"` (and play2..play5, scare). All must still pass with the 3D look.
- **Add `ps1/tests/flat.js`** that turns the flat look on and then:
  - checks every ship level has `FLAT` data, every spot name matches a hot in that level, and every hot (except "The kids' drawing") has a spot;
  - clicks through chapter 1 in flat (like play.js does) to the beach;
  - flips the look back and forth mid-room and checks the room, items and goal stay the same.
- Watch for the test port: `cdp.py` uses port 9333. Claude runs its tests on port 9447, so you can both test at the same time. If a test crashes with "Connection reset", another test browser is probably on your port.
- Dandy prefers saving credits: use screenshots only to check the look of a finished room.

## Working alongside Claude

Claude also edits this repo. To avoid stepping on each other:

1. Before starting: `git status`, `git branch --show-current`, `git pull` on `main`.
2. Work on a branch, `agy/flat-skin`. Commit in small steps.
3. Put the work in the new files; keep edits to existing files (runtime.js, template.html, build.py) small and clearly marked.
4. When the ship works in flat and all tests pass, tell Dandy. Merge into `main` (`git pull` first; if `main` moved, merge it into your branch and re-run the tests), rebuild, then push `main` so GitHub Pages updates.
5. Write a short note for Claude in `ps1/src/README.md` (what `flat.js` does and how to add a room) so the next chapters can be added by either of you.

## Done when

- The "Look" button flips between 3D and Flat at any moment, on the computer and the iPad, in and out of full screen.
- Every ship room, the hallway, the inside of Jon's portal and the space intro work in flat: walking, clicking everything, doors, items, powers, dialogue, the Dream House toy, the asteroid storm, and the trip to the beach.
- Places after the crash fall back to 3D with the "coming soon" note, and the button never breaks the game.
- All playthroughs pass, plus the new `flat.js` test.
