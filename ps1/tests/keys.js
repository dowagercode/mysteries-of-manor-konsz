// Keyboard walking in Olivia's room (3D look, then the Flat look, then the Flat hallway): arrows and h/j/k/l move the
// player, not during talk, not while typing; the walkable area holds.
// Run: python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=olivias" ps1/tests/out/keys-$RANDOM "$(cat ps1/tests/keys.js)"
(async () => { try {
  const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  for (let i = 0; i < 300 && !(window.__game && window.__game.L && !window.__game.busy); i++) await w(100);
  const M = window.__game;
  M.setVoices(false);
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  const settle = async () => { for (let i = 0; i < 60 && (M.busy || M.talking()); i++) { if (M.talking()) M.advance(); await w(100); } await w(200); };
  await settle();
  const P = () => M.L.player.pos, at = () => P().x.toFixed(2) + "," + P().y.toFixed(2);
  const key = (type, k, extra) => window.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true, ...extra }));
  const hold = async (keys, ms) => { keys.forEach((k) => key("keydown", k)); await w(ms); keys.forEach((k) => key("keyup", k)); await w(150); };
  const moved = async (keys, from) => { P().set(...from); M.L.player.target = null; await w(200); const a = P().clone(); await hold(keys, 600); return { dx: P().x - a.x, dz: P().y - a.y }; };
  M.L.player.pos.set(0.8, 0.5); M.L.player.target = null; await w(200);
  log.push("start " + at());
  // 3D: the camera looks toward -z, so right is +x and up (away) is -z
  for (const [ks, dxs, dzs] of [[["ArrowRight"], 1, 0], [["l"], 1, 0], [["ArrowLeft"], -1, 0], [["h"], -1, 0], [["ArrowUp"], 0, -1], [["k"], 0, -1], [["ArrowDown"], 0, 1], [["j"], 0, 1], [["ArrowUp", "ArrowRight"], 1, -1]]) {
    const r = await moved(ks, [0.2, 0.6]);
    const good = (dxs ? Math.sign(r.dx) === dxs : Math.abs(r.dx) < 0.2) && (dzs ? Math.sign(r.dz) === dzs : Math.abs(r.dz) < 0.2);
    ok(good, "3D " + ks.join("+") + ": dx " + r.dx.toFixed(2) + " dz " + r.dz.toFixed(2) + " target=" + M.L.player.target);
  }
  // scroll check
  const ev = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }); window.dispatchEvent(ev); key("keyup", "ArrowDown");
  ok(ev.defaultPrevented, "ArrowDown defaultPrevented (the page does not scroll)");
  // hold far right: must stay inside L.walk
  P().set(0, 0.5); await hold(["l"], 4500); ok(P().x <= M.L.walk[1] + 1e-6 && P().x > M.L.walk[1] - 0.5, "after a long l: " + at() + " walk=" + JSON.stringify(M.L.walk));
  // during dialogue
  M.L.player.pos.set(0, 0.5); M.say([["", "Test line one."], ["", "Test line two."]]); await w(100);
  let a = at(); await hold(["h"], 600); ok(a === at() && M.talking(), "during talk h does not walk: " + a + " -> " + at());
  while (M.talking()) { M.advance(); await w(50); }
  // input focus
  const inp = document.createElement("input"); document.body.appendChild(inp); inp.focus();
  a = at(); const e2 = new KeyboardEvent("keydown", { key: "h", bubbles: true, cancelable: true }); inp.dispatchEvent(e2); await w(400);
  inp.dispatchEvent(new KeyboardEvent("keyup", { key: "h", bubbles: true })); ok(a === at() && !e2.defaultPrevented, "typing in an input h does not walk: " + a + " -> " + at());
  inp.remove();
  // shift+H not walking
  a = at(); key("keydown", "H", { shiftKey: true }); await w(300); key("keyup", "H", { shiftKey: true }); ok(a === at(), "shift+H does not walk");
  // the title screen leaves the keys alone
  document.getElementById("title").hidden = false; a = at(); const e3 = new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }); window.dispatchEvent(e3); await w(300); key("keyup", "ArrowUp");
  ok(a === at() && !e3.defaultPrevented, "keys on the title screen do nothing"); document.getElementById("title").hidden = true;
  // L.walkSide(z): a room can narrow the floor toward the camera. Here: no further than 1.0 from the middle once z > 1.
  M.L.walkSide = (z) => (z > 1 ? 1.0 : Infinity); P().set(0.5, 1.5); M.L.player.target = null; await w(200);
  await hold(["ArrowDown"], 1500); await hold(["l"], 3000);
  ok(!(P().y > 1 && P().x > 1.01), "walkSide: z=" + P().y.toFixed(2) + " x=" + P().x.toFixed(2));
  M.L.walkSide = null;
  // ---- the Flat look: across the picture is x, up the picture is -z ----
  M.setFlatMode(true); await w(300);
  ok(M.flatActive(), "Flat look is on in Olivia's room");
  for (const [ks, dxs, dzs] of [[["ArrowRight"], 1, 0], [["h"], -1, 0], [["ArrowUp"], 0, -1], [["j"], 0, 1]]) {
    const r = await moved(ks, [0.2, 0.6]);
    const good = (dxs ? Math.sign(r.dx) === dxs : Math.abs(r.dx) < 0.2) && (dzs ? Math.sign(r.dz) === dzs : Math.abs(r.dz) < 0.2);
    ok(good, "Flat " + ks.join("+") + ": dx " + r.dx.toFixed(2) + " dz " + r.dz.toFixed(2));
  }
  // the Flat hallway is a strip: across the picture is -z, up the picture is -x
  M.goLevel("hall"); await w(900); await settle();
  ok(M.L.id === "hall" && M.flatActive(), "Flat hallway");
  for (const [ks, dxs, dzs] of [[["ArrowRight"], 0, -1], [["ArrowLeft"], 0, 1], [["ArrowUp"], -1, 0], [["ArrowDown"], 1, 0]]) {
    const r = await moved(ks, [0, 4]);
    const good = (dxs ? Math.sign(r.dx) === dxs : Math.abs(r.dx) < 0.2) && (dzs ? Math.sign(r.dz) === dzs : Math.abs(r.dz) < 0.2);
    ok(good, "Flat hall " + ks.join("+") + ": dx " + r.dx.toFixed(2) + " dz " + r.dz.toFixed(2));
  }
  M.setFlatMode(false);
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
