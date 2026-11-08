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
| `ch4-castle.js` | Chapter 4: the wizard's castle |
| `debug.js` | The debug panel (Shift+D or `#debug`) |
| `runtime.js` | Room switching, dialogue and voices, input, door tags, frame loop, buttons, start-up |

A new file must be added to `SRC_ORDER` in `build.py`.
