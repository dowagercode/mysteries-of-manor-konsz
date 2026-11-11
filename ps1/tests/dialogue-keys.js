// Dialogue controls in Jon's portal room: Next button, choice highlight keys, Enter/Space to pick. Ends with a choice open for the screenshot.
// Run: python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=hideout" ps1/tests/out/dk-$RANDOM "$(cat ps1/tests/dialogue-keys.js)"
(async () => { try {
  const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  for (let i = 0; i < 300 && !(window.__game && window.__game.L && !window.__game.busy); i++) await w(100);
  const M = window.__game;
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  M.setVoices(false);
  const key = (k, extra) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));
  const up = (k) => window.dispatchEvent(new KeyboardEvent("keyup", { key: k, bubbles: true }));
  const sel = () => [...document.querySelectorAll(".choice")].findIndex((b) => b.classList.contains("sel"));
  const aria = () => [...document.querySelectorAll(".choice")].map((b) => b.getAttribute("aria-selected")).join(",");
  const text = () => document.getElementById("boxText").textContent;
  const hot = (name) => M.L.hots.find((o) => o.userData.hot.name === name)?.userData.hot;
  const toChoices = async () => {
    M.act(hot("A mystery egg with a ?")); await w(100);
    for (let i = 0; i < 20 && !document.querySelector(".choice"); i++) { M.advance(); await w(60); }
  };
  for (let i = 0; i < 30 && M.talking(); i++) { M.advance(); await w(100); }
  await w(300);
  const p0 = M.L.player.pos.clone();
  // Next button (the pile of papers has two lines)
  M.act(hot("Pile of papers")); await w(100);
  const more = document.getElementById("boxMore");
  ok(more.tagName === "BUTTON", "next control is a button");
  M.advance();   // finish typing
  ok(!more.hidden, "next button visible once the line is complete");
  const l1 = text(); more.click(); await w(50);
  ok(text() !== l1, "clicking Next moved on from the first line");
  ok(M.L.player.pos.distanceTo(p0) < 1e-6, "Next click did not walk");
  // keys while plain text is showing must not walk
  key("ArrowUp"); key("k"); await w(300); up("ArrowUp"); up("k");
  ok(M.L.player.pos.distanceTo(p0) < 1e-6 && !M.L.player.target, "arrows during talk do not walk the player");
  for (let i = 0; i < 20 && M.talking(); i++) { M.advance(); await w(60); }
  // choices
  await toChoices();
  ok(document.querySelectorAll(".choice").length === 2, "two choices shown");
  ok(!/^▸/.test(document.querySelector(".choice").textContent), "the arrow is drawn by CSS, not in the text");
  ok(sel() === 0 && aria() === "true,false", "first choice highlighted at start (" + aria() + ")");
  for (const [k, want] of [["ArrowDown", 1], ["j", 0], ["k", 1], ["ArrowUp", 0], ["ArrowRight", 1], ["l", 0], ["ArrowLeft", 1], ["h", 0], ["k", 1]])
    { key(k); ok(sel() === want, k + " -> highlight " + want + " (got " + sel() + ")"); }
  await w(300);
  ok(M.L.player.pos.distanceTo(p0) < 1e-6 && !M.L.player.target, "choice keys did not walk the player");
  key("Enter"); await w(900);
  ok(!document.querySelector(".choice") && /lift that with my mind/i.test(text()), "Enter picked the second choice: " + text());
  for (let i = 0; i < 20 && M.talking(); i++) { M.advance(); await w(60); }
  // Space picks too, first choice
  await toChoices();
  key(" "); await w(900);
  ok(/mystery egg with a \?/i.test(text()), "Space picked the first choice: " + text());
  for (let i = 0; i < 20 && M.talking(); i++) { M.advance(); await w(60); }
  // mouse hover moves the highlight
  await toChoices();
  const bs = [...document.querySelectorAll(".choice")];
  bs[1].dispatchEvent(new MouseEvent("mouseenter")); ok(sel() === 1, "hover moves highlight");
  // leave the choices open, second highlighted, for the screenshot
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
