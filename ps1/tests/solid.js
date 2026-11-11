// Solid objects (an engine capability; no story room uses them yet, so this test adds some at run time to Olivia's room):
// the player must walk round a solid box (click-walking, key walking), a follower must go round it too, a target inside it
// goes to the nearest free point, a character that starts inside walks out, and an object's footprint can be solid.
// Run: python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=olivias" ps1/tests/out/solid-$RANDOM "$(cat ps1/tests/solid.js)"
(async () => { try {
  const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  for (let i = 0; i < 300 && !(window.__game && window.__game.L && !window.__game.busy); i++) await w(100);
  const M = window.__game;
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  M.setVoices(false);
  for (let i = 0; i < 60 && (M.busy || M.talking()); i++) { if (M.talking()) M.advance(); await w(100); }
  const L = M.L, P = () => L.player.pos;
  const key = (type, k) => window.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }));
  // Room walk: x -3.8..3.8, z -1.35..2.5. A solid box x -0.5..0.5, z -1.35..1.2 leaves a gap only at the front (z > 1.2).
  ok(Array.isArray(L.solids) && L.solids.length === 0, "a room starts with no solids");
  const raw = { x0: -0.5, x1: 0.5, z0: -1.35, z1: 1.2 };
  L.solids.push({ ...raw });
  const inBox = (p) => p.x > raw.x0 && p.x < raw.x1 && p.y > raw.z0 && p.y < raw.z1;
  let bad = 0, samples = 0;
  const watch = setInterval(() => { samples++; if (inBox(P())) bad++; }, 16);
  const settleWalk = async (ms) => { for (let i = 0; i < ms / 100 && L.player.target; i++) await w(100); await w(100); };
  const walk = async (from, to, ms) => { P().set(...from); L.player.target = P().clone().set(...to); await settleWalk(ms); };
  // 1. click-walk straight through the box
  await walk([-2, 0], [2, 0], 20000);
  ok(Math.hypot(P().x - 2, P().y) < 0.1, "click through the box: end " + P().x.toFixed(2) + "," + P().y.toFixed(2));
  // 2. click inside the box: goes to the nearest free point
  await walk([-2, 0], [0, 0], 20000);
  ok(!inBox(P()), "click inside the box: end " + P().x.toFixed(2) + "," + P().y.toFixed(2) + " (not inside)");
  // 3. keys: hold right into the box side, then up+right slides
  P().set(-2, 0); L.player.target = null; await w(100);
  key("keydown", "ArrowRight"); await w(3000); key("keyup", "ArrowRight"); await w(200);
  ok(P().x < raw.x0 + 0.05, "keys right into the box stop at its side: " + P().x.toFixed(2) + "," + P().y.toFixed(2));
  key("keydown", "ArrowDown"); key("keydown", "ArrowRight"); await w(4500); key("keyup", "ArrowDown"); key("keyup", "ArrowRight"); await w(200);
  ok(P().x > raw.x0 + 0.1 || P().y > raw.z1, "keys down+right slide along the box: " + P().x.toFixed(2) + "," + P().y.toFixed(2));
  clearInterval(watch);
  ok(bad === 0, "box violations: " + bad + " of " + samples + " samples");
  // 4. start inside a solid: walks out
  P().set(0, 0); L.player.target = P().clone().set(2, 1.5); await settleWalk(15000);
  ok(Math.hypot(P().x - 2, P().y - 1.5) < 0.1, "start inside, walk out: " + P().x.toFixed(2) + "," + P().y.toFixed(2));
  // 5. a follower (c.follow) goes round the box (Olivia follows the player)
  const liv = L.chars.find((c) => c.key === "olivia"); let fbad = 0;
  P().set(-2.5, 0); L.player.target = null; liv.pos.set(-3.3, 0); liv.target = null; liv.follow = L.player;
  const fwatch = setInterval(() => { if (inBox(liv.pos)) fbad++; }, 16);
  L.player.target = P().clone().set(2.5, 0); await settleWalk(20000); await w(2500);
  clearInterval(fwatch); liv.follow = null; liv.target = null;
  ok(fbad === 0 && Math.hypot(liv.pos.x - P().x, liv.pos.y - P().y) < 1.6, "follower: player " + P().x.toFixed(2) + "," + P().y.toFixed(2) + ", follower " + liv.pos.x.toFixed(2) + "," + liv.pos.y.toFixed(2) + ", violations " + fbad);
  // 6. an object's footprint: the bed group, measured the first time someone walks
  L.solids.length = 0;
  const bed = L.hots.find((o) => o.userData.hot.name === "Olivia's bed");
  L.solids.push({ obj: bed, pad: 0 });
  const act = M.activeSolids(L);
  ok(act.length === 1 && act[0].x0 > 1.0 && act[0].x1 < 4.2 && act[0].z1 < -1.4, "solidOf: the bed's footprint " + JSON.stringify(act[0] && { x0: +act[0].x0.toFixed(2), x1: +act[0].x1.toFixed(2), z0: +act[0].z0.toFixed(2), z1: +act[0].z1.toFixed(2) }));
  bed.visible = false; ok(M.activeSolids(L).length === 0, "a hidden object is not solid"); bed.visible = true;
  // 7. `show` switches a solid off; a round one blocks too
  let on = true; L.solids.length = 0; L.solids.push({ cx: 0, cz: 0.5, r: 0.8, show: () => on });
  ok(M.navCheck(0, 0.5).inside === true, "inside a round solid"); on = false; ok(M.navCheck(0, 0.5).inside === false, "show() false: not solid");
  on = true; ok(M.navCheck(2, 0.5).ok === true, "a free point beside it is reachable");
  L.solids.length = 0;
  // 8. every visible hot object's stand point in the story rooms is reachable (none have solids, so this is a regression check)
  let fails = 0, checked = 0;
  for (const id of ["olivias", "mays", "hub", "hall", "storage"]) {
    M.goLevel(id);
    for (let i = 0; i < 300 && (M.L.id !== id || M.busy); i++) await w(100);
    for (let i = 0; i < 30 && M.talking(); i++) { M.advance(); await w(100); }
    for (const o of M.L.hots) {
      const h = o.userData.hot; if (!h.stand || (h.show && !h.show())) continue;
      checked++; if (!M.navCheck(h.stand[0], h.stand[1]).ok) { fails++; log.push("FAIL " + id + ": '" + h.name + "' stand unreachable"); }
    }
  }
  ok(fails === 0, "stand points checked: " + checked + ", failures: " + fails);
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
