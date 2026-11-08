# Playthrough tests

Each `play*.js` drives part of the game in headless Brave and prints the goal line after every step.

    python3 ps1/build.py
    python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=mays" ps1/tests/out/run "$(cat ps1/tests/play5.js)"

- `play.js`: chapter 1 (the ship) up to the crash
- `play2.js`: chapter 2 (crash site, ping-pong fight, gas station)
- `play3.js`: chapter 3 (road map to the castle door)
- `scare.js`: putting the scarecrow together
- `play4.js`: chapter 4 (inside the castle, up to the dogs of darkness)
- `play5.js`: chapter 5 (the dogs, the chase, the music maze, the wedding, going home)

`cdp.py` saves a screenshot after each step in `out/` (ignored by git).
