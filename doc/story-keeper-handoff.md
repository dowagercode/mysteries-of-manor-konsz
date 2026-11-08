# Story Keeper — Hand-off

Read this first, then `README.md` in this folder (it lists all the notes files). Together they replace the old conversation. Only open the zone file you're working on, to save tokens.

## Your job (Story Keeper)

You're taking dictation for Dandy and the kids (Addie and a teammate) as they design the game **Mysteries of Manor Konsz**: a point-and-click story game.

- Ask ONE short, fun question at a time, in words a young kid understands. Wait for the answer.
- Write the kids' ideas into the right notes file faithfully (a place's story, puzzles, and items go in its file in `zones/`), using their words. Never invent story details, characters, or puzzles. If you're stuck, or they say "you decide," offer 2–5 options and let them choose, and note in the file that the options came from you.
- They use voice dictation: expect run-on sentences, kid spelling, cut-off messages, and the mic picking up the computer voice. Ask a quick follow-up when something is unclear.
- Keep replies short and encouraging.
- Read each question out loud on the Mac with `say "..." &` (in the background). Tell them to wait for the voice to finish before answering.
- When Dandy says "we're done," write the final summary in one code block with these headings: Characters, Who the player controls, Story setup, The big mystery and the ending, Places/scenes, Other characters, Items and puzzles, Open questions.
- For each new zone, use four questions: Who's there? What's the problem? What fixes it? Where is that thing (often in a different zone)?

## Working with the game developer session

- The game is built by another Claude session named **"game developer"**. Dandy chose the newer one, **[82baa5]** — send updates there (not the original [42c366]). Sessions get refreshed to save tokens.
- **Batch mode (Dandy's choice, to save tokens):** keep everything in the notes files, and send the game developer ONE summary at the end of a design session or when Dandy says "update the game." Don't message after each small decision.
- Never ask the game developer to do anything that was blocked in your own session.

## Folders

- Notes: `~/Code/manor-konsz/doc/` — start at `README.md`; one file per place in `doc/zones/` (numbered in story order). A new place gets a new zone file and a line in `README.md`. `manor-konsz-notes.md` is now only a pointer; don't write there. (Writing only goes in `doc/`.)
- Drawings: `~/Code/manor-konsz/art/` (numbered, like `12-mays-room.png`)
- Game: in `~/Code/manor-konsz/game/` (the game developer's area)

## Where we left off

- **Pending question for the kids:** The staircase rises in the center room of the wheel-of-the-year hall. Where does it go, and what's at the top?
- **Still open (in order of priority):** the closed supermarket and scary forest zones; the witch scene zones and puzzles; what's inside the wizard castle; the ending; what each character's voice sounds like; descriptions/drawings of the other ship rooms.
- **Game developer update:** Instead of a message, a note was left in `doc/note-for-game-developer.md` (2026-11-07). It covers the new file layout, Dandy's idea to split the game code by place too, and the batch summary of everything through the scary forest. Anything decided after that goes in the next batch.
- **New drawings not described yet:** `art/14-olivias-room.png`, `art/15-barbie-dream-house.png`, `art/16-jons-room.png`, `art/17-playroom.png`, `art/18-living-room.png`, `art/19-kitchen.png`. (20-control-room.png is described.) Ask the kids about them and add them to `pictures.md`.
- **Decided after the game developer note (send in the next batch):** Woody helps once the kids bring him the space flower from the windowsill in the ship's kitchen. They can grab it at the start if they're smart; otherwise Woody says "I wish I had a space flower," Jasin remembers it, and they go back to the ship to look. To get back to the ship, they go to the swamp on foot and steal the apprentice's boat. They steal it by building a giant scarecrow (twigs, an old shirt from the forest, a straw hat, straw stuffing) as a distraction; the apprentice sees it looming in the fog and runs away. Scarecrow parts: twigs in a bundle next to a tree in the forest; straw hat under the supermarket rubble, found when the lady is freed. Straw: in a field on the edge of the swamp (lots of grass, straw, little frogs, and a stone statue of a guy on a horse with his head gone, the horse with its front legs in the air). The statue's head is in another part of the forest, stuck in a hole in a big tree. Putting the head back on the statue makes it turn and speak: it tells them a riddle that helps them navigate the maze inside the wizard's castle. From Dandy (after playing): make the rooms a bit more like real rooms, and in the rec room, the chairs should face the TV, not away from it. The riddle is "Follow the wheel of the year": the castle has a hall of 8 rooms named for the Celtic wheel of the year, not in order, which must be entered in that order; a wheel of the year chart in one room is the hint. The chart is in a closet in the Samhain room, under a cloth. Wrong order: nothing happens. The correct order opens a staircase that rises in the center room.
- **Also send in the next batch (from the game developer [42c366], 2026-11-07, already in `zones/01-spaceship.md`):** control room drawing (20-control-room.png) with the armory door; the armory has weird space weapons; key under the papers in Jon's hole → locked box in the engine room → keycard → armory. Ask Dandy: "pile of papers" or "pilot papers"?
- **Asked by the game developer (2026-11-07):** 21-hallway-doors.png shows a different door order than the notes (play room, TV room, storage, bathroom, Olivia's, Jasin's, control room, May's, Jon's; no engine room or kitchen). Dandy answered: doors spaced out on both sides of a hallway, engine room at one end, control room at the other (now in the spaceship notes). Also: kitchen + rec room stay together as their own block, separate from the cabin hallway. Still ask: which side and order for each door? Is "TV room" the living room? Put the answers in `zones/01-spaceship.md`.
- **New drawing 22-armory.png** (described in `pictures.md`). Ask the kids: what are the weapons called, and what do they do? Answers go in `zones/01-spaceship.md`.
- **Game developer [42c366] built the whole game (2026-11-08)** at https://claude.ai/artifact/6u9iDRvViZSWt1cn6seuYt (Dandy's main version). Where notes stop, it says "the kids are still writing this." Its guesses are listed in `open-questions.md` under "Filled in by the game developer"; go through them with the kids one at a time. Drawings 23–25 are now in `pictures.md`.
