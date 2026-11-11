// Players: each one has their own save. Player 1 keeps the old save key, so saves from before there were players carry over.
// Two steps (split at the STEP 2 line): step 1 ends by pressing "Start over" twice as the second player, which reloads the
// page; step 2 checks that only that player's game was cleared.
//   python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=olivias" ps1/tests/out/players-$RANDOM \
//     "$(sed '/^\/\/\/\/ STEP 2/,$d' ps1/tests/players.js)" "$(sed '1,/^\/\/\/\/ STEP 2/d' ps1/tests/players.js)"
(async () => { try {
  for (let i = 0; i < 300 && !(window.__game && window.__game.L); i++) await new Promise((r) => setTimeout(r, 100));
  const M = window.__game, P = M.PLAYERS, log = [], ok = (what, cond) => log.push((cond ? "ok   " : "FAIL ") + what);
  const stored = (id) => JSON.parse(localStorage.getItem(M.playerKey(id)) || "null");
  M.setVoices(false);
  localStorage.clear();
  // a save from before there were players, under the plain key
  localStorage.setItem("manorkonsz-ps1-save", JSON.stringify({ items: ["flour"], flags: { started: true, old: true }, room: "olivias" }));
  M.pickPlayer(1);
  ok("an old save is player 1's", M.S.flags.old === true && M.S.items.includes("flour") && M.S.room === "olivias");
  ok("player 1's key is the old key", M.playerKey(1) === "manorkonsz-ps1-save");
  ok("starts with one player", P.list.length === 1 && P.cur === 1);
  M.S.flags.mark1 = true; M.add("oil");
  ok("player 1 saves under the old key", stored(1).flags.mark1 === true && stored(1).items.includes("oil"));
  const ann = M.addPlayer("  Ann  ");
  ok("new player is picked, name trimmed", P.cur === ann && P.list[1].name === "Ann");
  ok("new player starts empty", !M.S.flags.mark1 && !M.S.items.length && !M.playerStarted(ann));
  M.S.flags.started = true; M.S.flags.markAnn = true; M.save();
  M.pickPlayer(1);
  ok("back to player 1: their flags and items", M.S.flags.mark1 && !M.S.flags.markAnn && M.S.items.includes("oil"));
  M.pickPlayer(ann);
  ok("back to Ann: her flags, no items", M.S.flags.markAnn && !M.S.flags.mark1 && !M.S.items.length);
  ok("list is stored", JSON.parse(localStorage.getItem(M.playerKey(1) + "-players")).list.length === 2);
  const blank = M.addPlayer("");
  ok("blank name gets a default", P.list[2].name === "Player 3");
  M.removePlayer(blank);
  M.removePlayer(ann);
  ok("removing wipes the save and falls back to player 1", !stored(ann) && P.cur === 1 && P.list.length === 1 && M.S.flags.mark1);
  M.removePlayer(1);
  ok("removing the last player leaves a fresh one", P.list.length === 1 && P.cur !== 1 && !stored(1) && !M.S.flags.mark1);
  // The title screen's list (the title is hidden by #shot; show it for the check).
  const $ = (id) => document.getElementById(id);
  $("title").hidden = false;
  $("whoBtn").click();
  const box = $("players");
  ok("the list opens", !box.hidden && document.querySelectorAll("#playerList .who").length === 1);
  $("playerName").value = "Bo"; $("playerAdd").click();
  ok("adding from the list picks them and closes it", box.hidden && P.list.length === 2 && $("whoBtn").textContent === "Player: Bo");
  ok("Play, not Continue, for a new player", $("playBtn").textContent === "Play");
  // Make a second player with a game, then press Start over (twice) as them.
  M.S.flags.started = true; M.S.flags.markBo = true; M.save();
  M.addPlayer("Cy"); M.S.flags.started = true; M.S.flags.markCy = true; M.save();
  M.pickPlayer(P.list[0].id); localStorage.setItem("test-bo-id", String(P.list[1].id)); localStorage.setItem("test-cy-id", String(P.list[2].id));
  M.pickPlayer(P.list[2].id);
  $("title").hidden = true;
  ok("current player is Cy before Start over", P.list.find((p) => p.id === P.cur).name === "Cy");
  $("restartBtn").click(); $("restartBtn").click();
  return log.join("\n") + "\n(reloading)";
} catch (e) { return "ERROR " + e.stack; } })()
//// STEP 2
(async () => { try {
  const log = [], ok = (what, cond) => log.push((cond ? "ok   " : "FAIL ") + what);
  const boId = Number(localStorage.getItem("test-bo-id")), cyId = Number(localStorage.getItem("test-cy-id"));
  const key = (id) => "manorkonsz-ps1-save" + (id === 1 ? "" : "-p" + id);
  const players = JSON.parse(localStorage.getItem("manorkonsz-ps1-save-players"));
  const cy = JSON.parse(localStorage.getItem(key(cyId)) || "null");   // (the page saves a fresh, empty game when it starts a room)
  ok("after Start over: Cy's game is cleared", !cy || (!cy.flags.markCy && !cy.flags.started));
  const bo = JSON.parse(localStorage.getItem(key(boId)) || "null");
  ok("after Start over: Bo's save is still there", bo && bo.flags.markBo === true);
  ok("after Start over: the player list is still there (" + players.list.map((p) => p.name).join(", ") + ")", players.list.length === 3 && players.cur === cyId);
  for (let i = 0; i < 150 && document.getElementById("whoBtn").textContent !== "Player: Cy"; i++) await new Promise((r) => setTimeout(r, 100));
  ok("page reloaded as Cy", document.getElementById("whoBtn").textContent === "Player: Cy");
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
