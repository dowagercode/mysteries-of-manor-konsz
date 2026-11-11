# Game code

`ps1/build.py` joins these files, in this order, into the one-page game (`ps1/manor-konsz-ps1.html` and `index.html`). They share one scope, so a function in any file can use anything from another.

| File | What's in it |
|---|---|
| `engine.js` | Renderer, the PS1 look, drawing and geometry helpers, room-building helpers (including `solid`, `solidCircle`, `solidOf`) |
| `textures.js` | Generated textures, the kids' scans as textures, sprites |
| `story.js` | Save data and players (each person sharing the device has their own save), items, the item drawer, goal lines |
| `ch1-ship.js` | Chapter 1: the spaceship rooms and puzzles |
| `ch2-crash.js` | Chapter 2: crash site, ping-pong fight, gas station |
| `ch3-road.js` | Chapter 3: road map, supermarket, forest, field, swamp, secret mansion |
| `ch4-castle.js` | Chapter 4: the wizard's castle, inside and out (up to the dogs of darkness) |
| `ch5-chase.js` | Chapter 5: the dogs, the apprentice, chasing the walking house, the mansion music maze, the wedding, going home |
| `powers.js` | Playable kids, the "Play as" bar, power button, telekinesis/ball/tutu/portal animations, and Jon's portable portal |
| `debug.js` | The debug panel (Shift+D or `#debug`) |
| `flat-rooms.js` | Per-room flat 2D skin data (`FLAT.<id>`: drawing image key, walkable `floor` band, and clickable `spots`) |
| `flat.js` | The flat 2D view renderer (`renderFlat`), coordinate mapping, spot picking, flat door tags, and the `Look: 3D` / `Look: Flat` toggle |
| `runtime.js` | Room switching, dialogue and voices, input (mouse, keyboard, action key), solid objects and route planning, door tags, frame loop, buttons, the title screen's player list, start-up |

A new file must be added to `SRC_ORDER` in `build.py`.

## Adding a room to the flat skin (`flat-rooms.js` + `flat.js`)

- Add an entry `FLAT.<levelId> = { img: "<tex-stem>", floor: [x0, x1, yBack, yFront], spots: { "<Hot name>": [x, y, w, h], ... } }` in `ps1/src/flat-rooms.js` (all coordinates are `0..1` fractions of the drawing; if a room has multiple hots with the same name like `"Box"`, give an array of `[x, y, w, h]` rects in the same order as `L.hots`).
- `flat.js` automatically activates the 2D canvas (`#flatC`) whenever `flatMode` is on and `FLAT[L.id]` exists, skips the 3D WebGL render, places the single `.tag` over each exit spot, maps `c.pos` inside `L.walk` onto `floor` with bouncy-slide walk and directional flip, and routes spot clicks to `useHot(o)`. Rooms without `FLAT[L.id]` automatically fall back to 3D with the `#flatNote` badge.

## Keyboard play, players and solid objects (engine features from the later games)

These came from the point-and-click kit (the engine this game started), which grew them in other games. They are in `runtime.js`, `story.js` and `engine.js`; the page markup they need (`#actBtn`, the `#boxMore` Next button, `#whoBtn` and `#players`) is in `template.html`.

**Keyboard.** Arrow keys or `h j k l` walk the player (hold to keep walking, two at once goes diagonally; up is away from the camera). Space, Enter or `e` uses the nearest thing the player stands by, like a click; the yellow button at the bottom of the picture says what it would do (`Space: Fridge`) and clicking it does the same on a touch screen. While someone is talking, Space/Enter go on (or pick the highlighted choice) and arrows / `h j k l` move the choice highlight. The keys are off on the title screen, in the intro in space, while the cast sheet, a picture or the Dream House is open, and while `busy` (so the Pong game and the asteroid storm keep their own keys). A room can take the action key for itself: set `L.ownsAction = () => true` while it needs it and `L.onAction = (e) => ...` (return true if it used the key).

**Flat look.** Keys walk there too. Across the picture is x and up the picture is -z (in the hallway strip, across is -z and up is -x): see `keyFloorDir()` in `runtime.js`, which has to agree with `worldToFlat()` in `flat.js`. The action button only offers things that have a spot in `FLAT` (so not the framed "The kids' drawing").

**Players.** `PLAYERS` (in `story.js`) lists the people sharing the device. Each has their own save; player 1 keeps the old key `manorkonsz-ps1-save`, so existing saves carry over, and the others use `manorkonsz-ps1-save-p<id>`. The list itself is under `manorkonsz-ps1-save-players`. The Look, Voices and the other toolbar switches belong to the device. "Start over" (and "New game") only clears the current player. The title screen has a `Player: name` button that opens the list (pick, add, remove).

**Solid objects.** Characters walk round floor areas listed in `L.solids` (floor x, z; click-walking and followers plan a route, keys slide along edges). Nothing in the story rooms uses this yet. Add one in a level with `solid(L, x, z, w, d)` (a box centred on x, z), `solidCircle(L, x, z, r)`, `solidOf(L, object, pad)` (the footprint of a group or mesh), or give a hot object `solid: true` (it stops being solid when its `show()` is false). Every solid also takes an optional last argument `show`. `L.walkSide = (z) => halfWidth` narrows the walkable floor at depth z (for a floor that narrows toward the camera). Keep every `stand` point and entry point outside the solids (`navCheck(x, z)` in the test hook tells you).

**Smaller things.** Clicking (or pressing Space) while someone is still talking cuts the voice and moves on. The highlighted choice is drawn with CSS (`.choice.sel`). `voiceLevel()` (if a game defines it) scales the voice volume. If `SPR` has `<key>_side`, `_back`, `_q` or `_qback` sprites, a character uses them while walking (nothing does yet). The test hooks are on `window.__game` (the same object as `window.__mk`) when the page is opened with `#shot=<room>`.
