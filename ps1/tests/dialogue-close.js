// Regression: advancing past the LAST line of a dialogue closes the box and it stays closed
// (the same keypress must not reach the action-key listener and restart the talk). Also: a click while a line is
// still being spoken cuts the voice and moves on.
// Run: python3 ps1/build.py && CDP_PORT=$((9400 + RANDOM % 500)) python3 ps1/tests/cdp.py "file://$PWD/ps1/manor-konsz-ps1.html#shot=olivias" ps1/tests/out/dc-$RANDOM "$(cat ps1/tests/dialogue-close.js)"
(async () => { try {
  const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  for (let i = 0; i < 300 && !(window.__game && window.__game.L && !window.__game.busy); i++) await w(100);
  const M = window.__game;
  const ok = (c, m) => log.push((c ? "ok   " : "FAIL ") + m);
  M.setVoices(false);
  const $ = (id) => document.getElementById(id);
  const key = (k) => { const e = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }); window.dispatchEvent(e); return e; };
  const until = async (f, ms) => { for (let i = 0; i < ms / 100 && !f(); i++) await w(100); await w(100); };   // a busy computer runs the game in slow motion
  const settle = async () => { for (let i = 0; i < 60 && (M.busy || M.talking()); i++) { if (M.talking()) M.advance(); await w(100); } await w(300); };
  await settle();
  M.S.sel = null; M.S.flags.got_flour = true;   // the flour is gone, so the bed is the only thing close by
  // The bed has one line: its first line is also its last.
  const stand = async () => { M.L.player.pos.set(2.6, -0.9); M.L.player.target = null; await w(300); };
  for (const k of [" ", "Enter", "e"]) {
    await stand(); key(k); await until(() => M.talking(), 8000);
    ok(M.talking(), "[" + JSON.stringify(k) + "] starts the talk");
    M.advance();   // finish typing
    key(k === "e" ? " " : k); await w(300);
    ok(!M.talking(), "[" + JSON.stringify(k === "e" ? " " : k) + "] on the last line closes the box");
    await w(300); ok(!M.talking(), "box stays closed");
    await settle();
  }
  // Mouse: click the Next button on the last line.
  await stand(); key(" "); await until(() => M.talking(), 8000); M.advance();
  $("boxMore").click(); await w(300);
  ok(!M.talking(), "clicking Next on the last line closes the box");
  await w(400); ok(!M.talking(), "box stays closed after Next click");
  // Mouse then keyboard: focus may be left on Next; a following Space should not matter.
  await stand(); key(" "); await until(() => M.talking(), 8000); M.advance(); $("boxMore").focus(); $("boxMore").click(); await w(300);
  ok(!M.talking(), "closed after Next click with focus on Next");
  // A bubbling click on Next.
  await settle(); await stand(); key(" "); await until(() => M.talking(), 8000); M.advance();
  $("boxMore").dispatchEvent(new MouseEvent("click", { bubbles: true })); await w(400);
  ok(!M.talking(), "closed (bubbling click on Next)");
  // A click on the stage while a line is still being spoken moves straight on (two lines, voice on).
  await settle();
  M.setVoices(true);
  M.say([["May", "First line, which takes a while to say out loud."], ["May", "Second line."]]); await w(150);
  M.advance();   // finish typing; the voice (if this browser has one) is still going
  document.getElementById("stage").dispatchEvent(new MouseEvent("click", { bubbles: true })); await w(100);
  ok(M.talking() && $("boxText").textContent.startsWith("Second"), "a click while speaking moves on to the next line: " + $("boxText").textContent.slice(0, 20));
  // "Skip talk: off": the same click waits for the voice. (A stand-in voice that never says it has finished, so the
  // engine's own timer ends the line: about 3 seconds for a short one.)
  await settle();
  const realSpeak = speechSynthesis.speak;
  try { speechSynthesis.speak = () => {}; } catch {}
  ok($("skipBtn").textContent === "Skip talk: on" && M.skipTalk, "the Skip talk button starts on");
  $("skipBtn").click();
  ok($("skipBtn").textContent === "Skip talk: off" && !M.skipTalk && $("skipBtn").getAttribute("aria-pressed") === "false", "clicking it turns skipping off");
  M.say([["May", "Hi."], ["May", "Second line."]]); await w(150);
  M.advance();
  document.getElementById("stage").dispatchEvent(new MouseEvent("click", { bubbles: true })); await w(300);
  ok(M.talking() && $("boxText").textContent.startsWith("Hi"), "skip off: a click while speaking stays on the line: " + $("boxText").textContent.slice(0, 20));
  await until(() => $("boxText").textContent.startsWith("Second"), 8000);
  ok($("boxText").textContent.startsWith("Second"), "skip off: the next line comes when the voice is done");
  // Turning skipping back on lets a waiting click through at once.
  M.advance(); await w(100); M.advance(); await w(100);   // finish typing, then wait on the voice
  ok(M.talking(), "skip off: still waiting on the last line");
  $("skipBtn").click(); await w(200);
  ok(!M.talking() && M.skipTalk, "turning Skip talk back on lets the waiting click through");
  try { speechSynthesis.speak = realSpeak; } catch {}
  M.setVoices(false); await settle();
  return log.join("\n");
} catch (e) { return "ERROR " + e.stack; } })()
