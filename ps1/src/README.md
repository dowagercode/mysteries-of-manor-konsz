# Game code

`ps1/build.py` joins these files, in this order, into the one-page game (`ps1/manor-konsz-ps1.html` and `index.html`). They share one scope, so a function in any file can use anything from another.

| File | What's in it |
|---|---|
| `engine.js` | Renderer, the PS1 look, drawing and geometry helpers, room-building helpers |
| `textures.js` | Generated textures, the kids' scans as textures, sprites |
| `story.js` | Save data, items, the item drawer, goal lines |
| `ch1-ship.js` | Chapter 1: the spaceship rooms and puzzles |
| `ch2-crash.js` | Chapter 2: crash site, ping-pong fight, gas station |
| `ch3-road.js` | Chapter 3: road map, supermarket, forest, field, swamp, secret mansion |
| `ch4-castle.js` | Chapter 4: the wizard's castle, inside and out (up to the dogs of darkness) |
| `ch5-chase.js` | Chapter 5: the dogs, the apprentice, chasing the walking house, the mansion music maze, the wedding, going home |
| `powers.js` | Playable kids, the "Play as" bar, power button, telekinesis/ball/tutu/portal animations, and Jon's portable portal |
| `debug.js` | The debug panel (Shift+D or `#debug`) |
| `flat-rooms.js` | Per-room flat 2D skin data (`FLAT.<id>`: drawing image key, walkable `floor` band, and clickable `spots`) |
| `flat.js` | The flat 2D view renderer (`renderFlat`), coordinate mapping, spot picking, flat door tags, and the `Look: 3D` / `Look: Flat` toggle |
| `runtime.js` | Room switching, dialogue and voices, input, door tags, frame loop, buttons, start-up |

A new file must be added to `SRC_ORDER` in `build.py`.

## Adding a room to the flat skin (`flat-rooms.js` + `flat.js`)

- Add an entry `FLAT.<levelId> = { img: "<tex-stem>", floor: [x0, x1, yBack, yFront], spots: { "<Hot name>": [x, y, w, h], ... } }` in `ps1/src/flat-rooms.js` (all coordinates are `0..1` fractions of the drawing; if a room has multiple hots with the same name like `"Box"`, give an array of `[x, y, w, h]` rects in the same order as `L.hots`).
- `flat.js` automatically activates the 2D canvas (`#flatC`) whenever `flatMode` is on and `FLAT[L.id]` exists, skips the 3D WebGL render, places the single `.tag` over each exit spot, maps `c.pos` inside `L.walk` onto `floor` with bouncy-slide walk and directional flip, and routes spot clicks to `useHot(o)`. Rooms without `FLAT[L.id]` automatically fall back to 3D with the `#flatNote` badge.
