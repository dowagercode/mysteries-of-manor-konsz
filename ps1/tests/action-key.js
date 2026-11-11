// Action key: walk up to a thing with the keys, press Space/Enter/e (or click the prompt button) to use it.
// In Olivia's room (3D look, then the Flat look). Two steps (the first ends with the prompt showing, for the screenshot);
// split at the STEP 2 line:
//   python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=olivias" ps1/tests/out/ak-$RANDOM \
//     "$(sed '/^\/\/\/\/ STEP 2/,$d' ps1/tests/action-key.js)" "$(sed '1,/^\/\/\/\/ STEP 2/d' ps1/tests/action-key.js)"
(async () => { try {
  const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  for (let i = 0; i < 300 && !(window.__game && window.__game.L && !window.__game.busy); i++) await w(100);
  const M = window.__game;
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  M.setVoices(false);
  const $ = (id) => document.getElementById(id);
  const key = (k) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  const up = (k) => window.dispatchEvent(new KeyboardEvent("keyup", { key: k, bubbles: true }));
  const hold = async (k, ms) => { key(k); await w(ms); up(k); await w(250); };
  const prompt = () => ($("actBtn").hidden ? "" : $("actBtn").textContent);
  const settle = async () => { for (let i = 0; i < 60 && (M.busy || M.talking()); i++) { if (M.talking()) M.advance(); await w(100); } await w(300); };
  await settle();
  M.S.sel = null; M.S.flags.got_flour = true;
  const P = () => M.L.player.pos;
  // Far from everything: nothing happens.
  P().set(0.8, 1.8); M.L.player.target = null; await w(300);
  ok(prompt() === "", "no prompt away from things (" + prompt() + ")");
  key(" "); key("Enter"); key("e"); await w(500);
  ok(!M.talking() && !M.busy && M.L.id === "olivias", "action key far from everything does nothing");
  // Walk to the hallway door with the keys.
  const door = M.L.hots.find((o) => o.userData.hot.go === "hall").userData.hot;
  P().set(door.stand[0] + 1.6, door.stand[1]); M.L.player.target = null;
  for (let i = 0; i < 40 && Math.hypot(P().x - door.stand[0], P().y - door.stand[1]) > 0.5; i++) await hold("ArrowLeft", 250);
  await w(300);
  ok(prompt() === "Space: " + door.name, "prompt shows the door: " + JSON.stringify(prompt()) + " at " + P().x.toFixed(2) + "," + P().y.toFixed(2));
  key("ArrowRight"); await w(150); ok(prompt() === "", "prompt hidden while walking"); up("ArrowRight"); await w(300);
  P().set(...door.stand); M.L.player.target = null; await w(300);
  ok(prompt() !== "", "prompt back when idle at the door");
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
//// STEP 2
(async () => { try {
  const M = window.__game, w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  const $ = (id) => document.getElementById(id);
  const key = (k) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  const prompt = () => ($("actBtn").hidden ? "" : $("actBtn").textContent);
  const settle = async () => {
    for (let i = 0; i < 60 && (M.busy || M.talking()); i++) {
      const ch = document.querySelector(".choice"); if (ch) ch.click(); else if (M.talking()) M.advance();
      await w(100);
    }
    await w(300);
  };
  const P = () => M.L.player.pos;
  // Space at the door goes through it.
  key(" "); await w(300);
  for (let i = 0; i < 40 && M.L.id === "olivias"; i++) await w(150);
  await settle();
  ok(M.L.id === "hall", "Space at the hallway door goes to the hallway (now " + M.L.id + ")");
  M.goLevel("olivias", "hall"); for (let i = 0; i < 40 && (M.L.id !== "olivias" || M.busy); i++) await w(150);
  await settle();
  // Olivia: Enter, then Space advances the dialogue.
  P().set(-0.9, -0.3); M.L.player.target = null; await w(300);
  ok(prompt() === "Space: Olivia", "prompt for Olivia: " + JSON.stringify(prompt()));
  key("Enter"); await w(600);
  ok(M.talking(), "Enter at Olivia starts the talk");
  const t1 = $("boxText").textContent, nm = $("boxName").textContent;
  ok(nm === "May" && prompt() === "", "prompt hidden while talking (" + nm + ")");
  M.advance(); // finish typing
  key(" "); await w(300);
  ok(!M.talking() || $("boxText").textContent !== t1, "Space still advances dialogue");
  await settle();
  // Prompt click works (and 'e' too).
  ok(prompt() === "Space: Olivia", "prompt returns after talking");
  $("actBtn").click(); await w(600);
  ok(M.talking(), "clicking the prompt talks to Olivia");
  await settle();
  key("e"); await w(600);
  ok(M.talking(), "e works too"); await settle();
  // An item selected: prompt says Use ...
  M.add("pills"); M.S.sel = "pills"; await w(300);
  ok(/^Space: Use .+ on Olivia$/.test(prompt()), "prompt with item selected: " + JSON.stringify(prompt()));
  key(" "); await w(600); await settle();
  ok(M.S.sel === null && M.S.flags.gavePills === true, "action key used the selected item like a click");
  // Hidden player (a cutscene): no prompt, no action.
  M.L.player.root.visible = false; await w(1000);
  ok(prompt() === "", "no prompt while the player is hidden");
  M.L.player.root.visible = true;
  await w(300); ok(prompt() !== "", "prompt back once the player is visible");
  // ---- the Flat look ----
  M.setFlatMode(true); await w(400);
  ok(M.flatActive(), "Flat look is on");
  ok(prompt() === "Space: Olivia", "Flat look: prompt for Olivia " + JSON.stringify(prompt()));
  // the framed copy of the kids' drawing has no clickable spot in Flat: never offered there
  const drawing = M.L.hots.find((o) => o.userData.hot.name === "The kids' drawing");
  const w3 = drawing.getWorldPosition(new drawing.position.constructor());
  P().set(w3.x + 0.3, w3.z + 0.9); M.L.player.target = null; await w(400);
  ok(prompt() !== "Space: The kids' drawing", "Flat look: the unclickable drawing is not offered (" + JSON.stringify(prompt()) + ")");
  M.setFlatMode(false); await w(400);
  ok(prompt() === "Space: The kids' drawing" || prompt() !== "", "3D look: prompt back (" + JSON.stringify(prompt()) + ")");
  // back to the front of the room, Flat look, for the screenshot with the prompt showing
  P().set(-0.9, -0.3); M.L.player.target = null; M.setFlatMode(true); await w(500);
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
