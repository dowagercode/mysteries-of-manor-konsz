# Playthrough tests

Each `play*.js` drives part of the game in headless Brave (or Chrome) and prints the goal line after every step.

    python3 ps1/build.py
    CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=mays" ps1/tests/out/run-$RANDOM "$(cat ps1/tests/play5.js)"

Always give each run its own random `CDP_PORT`, as above: another session may be testing at the same time, and on the shared default port (9333) two runs drive the same browser. `cdp.py` gives every run its own throwaway browser profile, so the port is the only thing to vary. `CDP_SIZE=390,800` (width,height) makes the window phone-sized for a screenshot. If a run fails at the very first step (`Cannot read properties of undefined`, `KeyError: 'result'`), the computer was too busy to load the page in time: run it again, one at a time.

- `play.js`: chapter 1 (the ship) up to the crash
- `play2.js`: chapter 2 (crash site, ping-pong fight, gas station)
- `play3.js`: chapter 3 (road map to the castle door)
- `scare.js`: putting the scarecrow together
- `play4.js`: chapter 4 (inside the castle, up to the dogs of darkness)
- `play5.js`: chapter 5 (the dogs, the chase, the music maze, the wedding, going home)
- `flat.js`: chapter 1 again, in the Flat look, and flipping the look mid-room

Engine features (each prints `ok` / `FAIL` lines; start with `#shot=<room>` as written in the file's first lines):

- `players.js`: players with their own saves, the old save as player 1, the list, "Start over" clears only the current player (two steps, see the file)
- `keys.js`: arrow / h j k l walking in 3D and in the Flat look (and the Flat hallway), not during talk or typing, `L.walkSide`
- `action-key.js`: the action key and its button, in 3D and Flat (two steps, see the file; the first ends with the button showing)
- `dialogue-keys.js`: the Next button, choice highlight keys, Enter/Space to pick; ends with a choice open
- `dialogue-close.js`: Space/Enter/e/Next on a dialogue's last line closes it and it stays closed; clicking while speaking moves on
- `solid.js`: solid objects added at run time (the story rooms have none yet): walking round them, followers, nearest free point, footprints

`cdp.py` saves a screenshot after each step in `out/` (ignored by git).
