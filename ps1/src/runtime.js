// runtime.js: Game state and room switching, the dialogue box and voices, clicking and walking, door tags, the camera and frame loop, toolbar buttons, and start-up.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- game state ----------
const TEX = {}, RAW = {};
const built = {};
let L = null, curCam = null, ps1 = true, castOpen = false, busy = false, spaceCut = false, spaceWait = false;

// Star burst when May gets an item (no hint sparkles on items: kids explore to find them).
function addRoomSparkles(lv) {
  const burstG = new THREE.OctahedronGeometry(0.07, 0), burstM = mat({ color: 0xfff27a, em: 1 });
  const burst = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(burstG, burstM); m.visible = false; lv.scene.add(m); return m; });
  lv.sparkles = { burst, burstT: -1, burstPos: new THREE.Vector3() };
}
function itemCue() {
  if (!L || !L.player) return;
  L.player.hopT = 0.36;
  if (L.sparkles) {
    L.sparkles.burstT = 0;
    const p = L.player.root.position;
    L.sparkles.burstPos.set(p.x, p.y + 0.7, p.z);
  }
}
function updateSparkles(t, dt) {
  if (!L || !L.sparkles) return;
  const sp = L.sparkles;
  if (sp.burstT >= 0) {
    sp.burstT += dt * 1.8;
    const k = sp.burstT;
    sp.burst.forEach((m, i) => {
      if (k >= 1) { m.visible = false; return; }
      m.visible = true;
      const ang = (i / 6) * Math.PI * 2 + k * 2;
      m.position.set(sp.burstPos.x + Math.cos(ang) * k * 0.65, sp.burstPos.y + Math.sin(k * Math.PI) * 0.65 + k * 0.3, sp.burstPos.z + Math.sin(ang) * k * 0.65);
      m.scale.setScalar(1 - k * 0.7);
      m.rotation.y = k * 8;
    });
    if (k >= 1) sp.burstT = -1;
  }
}

function getLevel(id) {
  if (!built[id]) {
    const lv = LV[id]();
    if (!lv.player) lv.player = addChar(lv, "may", ...lv.start, 1.3);
    if (["hub", "mays", "jasins", "olivias", "jons", "hideout", "hall", "engine", "storage", "bath", "playroom", "control"].includes(id)) addClueTrail(lv);
    lv.hots.forEach((o) => { if (o.userData.hot.solid) solidOf(lv, o); });   // hot: { solid: true } = its footprint is solid
    addRoomSparkles(lv);
    built[id] = lv;
  }
  return built[id];
}
function applyLight(lv) {
  const l = lv.light;
  G.uAmb.value.set(l.amb); G.uDir.value.set(...l.dir).normalize(); G.uDirCol.value.set(l.dirCol);
  for (let i = 0; i < 3; i++) {
    const p = l.pts[i] || [[0, 0, 0], 0, 1];
    G.uPt.value[i].set(...p[0]); G.uPtCol.value[i].set(p[1]); G.uPtR.value[i] = p[2];
  }
  G.uFogCol.value.set(lv.fog[0]); G.uFog.value.set(lv.fog[1], lv.fog[2]);
  renderer.setClearColor(lv.bg);
}
const fade = $("fade");
function goLevel(id, from) {
  busy = true; fade.style.opacity = 1;
  setTimeout(() => {
    L = getLevel(id); applyLead(L); S.room = id; if (id === "pingpong") S.flags.metPP = true; if (id === "swamp") S.flags.sawSwamp = true; save(); renderExits();
    const e = (from && L.entries[from]) || (from === undefined ? L.start : null);
    if (e) {
      L.player.pos.set(...e); L.player.target = null;
      L.chars.forEach((c, i) => { if (c.follow) c.pos.set(e[0] - 0.8 * i, e[1] + 0.4 * i); });
    }
    applyLight(L);
    syncFlatUI();
    document.querySelectorAll("#levels button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === id));
    setTimeout(() => {
      fade.style.opacity = 0; busy = false;
      if (LV_SKIP_ENTER.has(id)) { LV_SKIP_ENTER.delete(id); L.entered = true; }
      arrive(L);
    }, 60);
  }, 260);
}
// First visit tells the place's story; coming back gets a short line (RETURNS in story.js).
// Visits are saved, so a reload doesn't replay stories. L.entered = true skips one arrival (a cutscene covered it).
function arrive(L) {
  if (!L.onEnter) return;
  const seen = S.flags.seen || (S.flags.seen = {}), was = seen[L.id];
  const lines = typeof L.onEnter === "function" ? L.onEnter() : L.onEnter;
  const key = lines.filter(Array.isArray).map((l) => l[1]).join("|");
  const skip = !!L.entered; L.entered = false;
  const n = was ? was.n + (skip ? 0 : 1) : 0;
  seen[L.id] = { k: key, n }; save();
  if (skip) return;
  if (!was) { say(lines); return; }
  let r = RETURNS[L.id];
  if (typeof r === "function") r = r(n);
  else if (lines.some((l) => l && l.choices) || key !== was.k) r = lines;   // a puzzle question, or something changed
  else if (n <= (r ? r.length : 1)) r = r ? r[n - 1] : [["", "Back in the " + L.name.replace(/^The /, "") + "."]];
  else r = [];
  if (r.length) say(r);
}

// ---------- dialogue box ----------
const box = $("box"), boxName = $("boxName"), boxText = $("boxText"), boxMore = $("boxMore");
let dq = [], typing = null, fullText = "";
function say(list) { dq = list.slice(); next(); }
let choosing = false, voicesOn = true, speaking = false, pendingNext = false, speakTimer = null, VOICES = [];
const loadVoices = () => { try { VOICES = speechSynthesis.getVoices(); } catch {} };
if (window.speechSynthesis) { loadVoices(); speechSynthesis.addEventListener?.("voiceschanged", loadVoices); }
// Each character's voice (from the Mac's built-in voices when they exist). Narration is read by May.
const CAST = {
  May: { names: ["Samantha", "Karen", "Moira", "Google US English"], pitch: 1.35, rate: 0.9 },
  Olivia: { names: ["Kathy", "Victoria", "Tessa", "Fiona"], pitch: 1.6, rate: 0.88 },
  Jon: { names: ["Junior", "Fred", "Daniel"], pitch: 1.15, rate: 0.92 },
  Jasin: { names: ["Ralph", "Aaron", "Alex", "Daniel"], pitch: 1.25, rate: 0.92 },
  Wizard: { names: ["Ralph", "Fred", "Daniel"], pitch: 0.75, rate: 0.86 },
  Witch: { names: ["Victoria", "Kathy", "Moira"], pitch: 0.9, rate: 0.9 },
  Sphinx: { names: ["Fred", "Daniel", "Alex"], pitch: 0.5, rate: 0.8 },
  Owl: { names: ["Kathy", "Samantha", "Karen"], pitch: 1.2, rate: 0.85 },
};
function castFor(name) {
  const key = Object.keys(CAST).find((k) => name.startsWith(k)) || "May";
  const c = CAST[key];
  return { ...c, voice: VOICES.find((v) => c.names.some((n) => v.name.startsWith(n))) || VOICES.find((v) => /^en/i.test(v.lang)) };
}
function stopSpeaking() { speaking = false; pendingNext = false; clearTimeout(speakTimer); try { speechSynthesis.cancel(); } catch {} }
function speak(name, text) {
  if (!voicesOn || !window.speechSynthesis) return;
  const words = text.replace(/\(.*?\)/g, "").replace(/[*]/g, "").trim();
  if (!words) return;
  const c = castFor(name), u = new SpeechSynthesisUtterance(words);
  if (c.voice) u.voice = c.voice;
  u.pitch = c.pitch; u.rate = c.rate; u.volume = (c.volume ?? 1) * (typeof voiceLevel === "function" ? voiceLevel() : 1);
  const done = () => {
    if (!speaking) return;
    speaking = false; clearTimeout(speakTimer);
    if (pendingNext) { pendingNext = false; next(); }
  };
  u.onend = u.onerror = done;
  speaking = true;
  clearTimeout(speakTimer); speakTimer = setTimeout(done, words.length * 110 + 2500); // in case the browser never says it finished
  speechSynthesis.speak(u);
}
function next() {
  while (dq.length && typeof dq[0] === "function") dq.shift()();
  if (!dq.length) { box.hidden = true; renderExits(); return; }
  if (dq[0].choices) {
    stopSpeaking();
    const { choices } = dq.shift();
    clearInterval(typing); typing = null; choosing = true;
    box.hidden = false; boxName.textContent = ""; boxMore.hidden = true; boxText.textContent = "";
    choices.forEach(([labelText, fn]) => {
      const b = document.createElement("button"); b.className = "choice px"; b.textContent = labelText;   // the ▸ is drawn by CSS (▶ on the highlighted one)
      b.setAttribute("role", "option");
      b.onclick = (e) => { e.stopPropagation(); choosing = false; say(fn() || []); };
      b.onmouseenter = () => { const j = choiceBtns().indexOf(b); if (j >= 0) hiChoice(j, false); };
      boxText.appendChild(b);
    });
    boxText.setAttribute("role", "listbox");
    hiChoice(0, false);
    return;
  }
  const [n, t] = dq.shift();
  box.hidden = false; boxName.textContent = n; fullText = t; boxText.textContent = ""; boxMore.hidden = true; boxText.removeAttribute("role");
  if (L && n) {
    const who = n.toLowerCase();
    L.chars.forEach((c) => {
      if (who === "everyone" || (who.startsWith("jon") && c.key.startsWith("jon")) || (who.startsWith("ping-pong") && c.key === "pingpong") || (who.startsWith("shopkeeper") && c.key === "lady") || c.key === who) c.hopT = 0.26;
    });
  }
  speak(n, t);
  let i = 0; clearInterval(typing);
  typing = setInterval(() => { i += 2; boxText.textContent = t.slice(0, i); if (i >= t.length) finishType(); }, 28);
}
function finishType() { clearInterval(typing); typing = null; boxText.textContent = fullText; boxMore.hidden = false; }
// Clicking while someone is still talking cuts their voice off and moves straight on.
function advance() { if (choosing) return; if (typing) finishType(); else { stopSpeaking(); next(); } }
const talking = () => !box.hidden;
// Choice highlight: one choice is selected (aria-selected + the .sel class); keys and the mouse move it.
const choiceBtns = () => [...boxText.querySelectorAll(".choice")];
function hiChoice(i, focus = true) {
  const bs = choiceBtns(); if (!bs.length) return;
  i = (i + bs.length) % bs.length;
  bs.forEach((b, j) => { b.classList.toggle("sel", j === i); b.setAttribute("aria-selected", j === i ? "true" : "false"); });
  if (focus) bs[i].focus({ preventScroll: true });
}
const hiIndex = () => Math.max(0, choiceBtns().findIndex((b) => b.classList.contains("sel")));
boxMore.onclick = (e) => { e.stopPropagation(); advance(); };   // the Next button (a real button, so touch and keyboard users can use it)
let peekOpen = false;
function showPeek(src, cap) { $("peekImg").src = src; $("peekCap").textContent = cap; $("peek").hidden = false; peekOpen = true; }

// ---------- input ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function setNdc(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
function pick() {
  ray.setFromCamera(ndc, curCam);
  const hits = ray.intersectObjects(L.hots, true);
  for (const h of hits) { let o = h.object; while (o && !o.userData.hot) o = o.parent; if (o && L.player && o === L.player.body) continue; if (o && (!o.userData.hot.show || o.userData.hot.show())) return o; }
  return null;
}
// The walkable area is the box L.walk. A room can also set L.walkSide(z): how far from the middle (x = 0) a
// character may stand at depth z, for a floor that narrows toward the camera (so nobody walks off the picture).
const walkSide = (z) => (L.walkSide ? L.walkSide(z) : Infinity);
const clampWalk = (x, z) => {
  const cz = Math.min(L.walk[3], Math.max(L.walk[2], z)), side = walkSide(cz);
  return new THREE.Vector2(Math.min(L.walk[1], side, Math.max(L.walk[0], -side, x)), cz);
};
function walkTo(v, then) { L.player.target = v; L.player.onArrive = then || null; }
function act(h) {
  if (h.run) h.run();
  else if (h.go) goLevel(h.go, L.id);
  else if (h.say) say(typeof h.say === "function" ? h.say() : h.say);
}
canvas.addEventListener("pointermove", (e) => {
  if (spaceWait && L && curCam && !talking()) { canvas.style.cursor = (flatActive() ? overShipFlat(e) : overShip(e)) ? "pointer" : "default"; return; }
  if (!L || !curCam || castOpen || talking() || !$("title").hidden) { $("hover").textContent = ""; return; }
  let o = null;
  if (flatActive()) o = pickFlat(e);
  else { setNdc(e); o = pick(); }
  $("hover").textContent = o ? (S.sel ? `Use ${ITEMS[S.sel][1]} on ${o.userData.hot.name}` : o.userData.hot.name) : "";
  canvas.style.cursor = o ? "pointer" : "default";
});
stage.addEventListener("click", (e) => {
  if (peekOpen) { peekOpen = false; $("peek").hidden = true; return; }
  if (!L || !curCam || castOpen || busy || !$("title").hidden) return;
  $("hover").textContent = "";
  if (talking()) { advance(); return; }
  if (spaceWait) { if (flatActive() ? overShipFlat(e) : overShip(e)) enterShip(); else $("hover").textContent = "Click the spaceship to go inside!"; return; }
  if (e.target !== canvas && e.target !== flatC) return;
  if (flatActive()) {
    const o = pickFlat(e);
    if (o) { useHot(o); return; }
    const uv = eventToFlatUV(e);
    walkTo(flatToWorld(L, uv.x, uv.y));
    return;
  }
  setNdc(e);
  const o = pick();
  if (o) { useHot(o); return; }
  ray.setFromCamera(ndc, curCam);
  const p = ray.ray.intersectPlane(ground, new THREE.Vector3());
  if (p) walkTo(clampWalk(p.x, p.z));
});
function useHot(o) {
  const h = o.userData.hot, wp = o.getWorldPosition(new THREE.Vector3());
  const dest = h.stand ? new THREE.Vector2(...h.stand) : clampWalk(wp.x, wp.z + 0.9);
  const sel = S.sel;
  if (sel) { S.sel = null; renderHud(); }
  walkTo(dest, () => {
    if (sel === "power") say(powerOn(h, o));
    else if (sel && h.use && h.use[sel]) say(h.use[sel]());
    else if (sel && !h.go && !h.run) say([["", `The ${ITEMS[sel][1].toLowerCase()} doesn't work there.`]]);
    else act(h);
  });
}
// Every way out of the current room, as buttons under the goal.
const isExit = (h) => h.exit || h.go || (h.run && /^(Door|Armory|Jon's portal)/.test(h.name));
function exitName(h) {
  return h.name.replace(/^Door to the /, "").replace(/^Door to /, "").replace(/^(Path|Road) (back )?(down )?to the /, "").replace(" (climb in)", "").replace(/^./, (c) => c.toUpperCase());
}
let TAGS = [];
function renderExits() {
  const row = $("exits"); row.textContent = "";
  $("tags").textContent = ""; TAGS = [];
  if (!L) return;
  L.hots.filter((o) => isExit(o.userData.hot)).forEach((o) => {
    const t = document.createElement("div"); t.className = "tag"; t.dataset.name = exitName(o.userData.hot);
    t.onclick = (e) => { e.stopPropagation(); if (!talking() && !busy && !spaceWait) useHot(o); };
    $("tags").appendChild(t); TAGS.push({ o, t, arrow: null });
  });
  L.hots.filter((o) => isExit(o.userData.hot) && (!o.userData.hot.show || o.userData.hot.show())).forEach((o) => {
    const h = o.userData.hot, b = document.createElement("button");
    b.textContent = exitName(h);
    b.onclick = () => { if (!talking() && !busy && !spaceWait && $("title").hidden) useHot(o); };
    row.appendChild(b);
  });
}
// While talking: Space/Enter advance (or pick the highlighted choice); arrows and h/j/k/l move the choice highlight.
const CHOICE_STEP = { arrowdown: 1, j: 1, arrowright: 1, l: 1, arrowup: -1, k: -1, arrowleft: -1, h: -1 };
window.addEventListener("keydown", (e) => {
  if (!talking() || e.ctrlKey || e.metaKey || e.altKey || typingIn(e.target) || !$("title").hidden) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (choosing) { const b = choiceBtns()[hiIndex()]; if (b) b.click(); } else advance();
    return;
  }
  const k = e.key.toLowerCase();
  if (CHOICE_STEP[k] && !e.shiftKey) { e.preventDefault(); if (choosing) hiChoice(hiIndex() + CHOICE_STEP[k]); }
});

// Arrow keys or h/j/k/l (vi keys) walk the player. Hold to keep walking; two at once walks diagonally.
// Up is away from the camera (in the Flat look: up the picture). Keys only steer the same walk target a click sets,
// so the walkable area, room scripts and the "busy" rules all work the same. Walking into a door doesn't go through it.
const KEY_DIRS = { arrowleft: [-1, 0], h: [-1, 0], arrowright: [1, 0], l: [1, 0], arrowup: [0, 1], k: [0, 1], arrowdown: [0, -1], j: [0, -1] };
const heldKeys = new Set();
let keyTarget = null;   // the last target the keys set (so we only stop walks the keys started)
const typingIn = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const canKeyWalk = () => L && L.player && curCam && !busy && !talking() && !peekOpen && $("title").hidden && !spaceCut && !spaceWait && !castOpen && !(typeof dhOpen !== "undefined" && dhOpen);
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (!KEY_DIRS[k] || talking() || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || typingIn(e.target)) return;
  if (!$("title").hidden) return;   // title screen: leave the keys to the page
  e.preventDefault();   // no page scrolling while playing
  heldKeys.add(k);
});
window.addEventListener("keyup", (e) => heldKeys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => heldKeys.clear());
// Action key: Space, Enter or e uses the nearest thing the player is standing by (a door wins a near tie), like a click.
// A small button near the bottom of the view says what it would do; clicking it does the same (for touch).
const ACT_RADIUS = 1.0;
const actBtn = $("actBtn");
function actReady() { return canKeyWalk() && L.player.root.visible; }
// A room can take the action key for itself while it needs it (e.g. jumping on a stair):
// while L.ownsAction() is true, Space/Enter/e call L.onAction() instead, and no prompt shows.
const roomOwnsAction = () => !!(L && L.ownsAction && L.ownsAction());
// Where the player stands to use a hot thing: the same spot useHot walks to.
function standOf(o) {
  const h = o.userData.hot;
  if (h.stand) return new THREE.Vector2(h.stand[0], h.stand[1]);
  const w = o.getWorldPosition(new THREE.Vector3());
  return clampWalk(w.x, w.z + 0.9);
}
function actTarget() {
  if (!actReady() || roomOwnsAction() || L.player.target || heldKeys.size) return null;
  const p = L.player.pos; let best = null, bs = Infinity;
  L.hots.forEach((o) => {
    const h = o.userData.hot;
    if (!h || o === L.player.body || !o.visible || (h.show && !h.show())) return;
    if (flatActive() && !rawSpotForHot(L, o)) return;   // in the Flat look, only things you can see and click
    const w = o.getWorldPosition(new THREE.Vector3()), s = standOf(o);
    const d = Math.min(Math.hypot(s.x - p.x, s.y - p.y), Math.hypot(w.x - p.x, w.z - p.y));
    if (d > ACT_RADIUS) return;
    const sc = d - (isExit(h) ? 0.3 : 0);
    if (sc < bs) { bs = sc; best = o; }
  });
  return best;
}
function doAction() { const o = actTarget(); if (o) { $("hover").textContent = ""; useHot(o); } return !!o; }
let actShown = "";
function updateActBtn() {
  const o = actTarget();
  const txt = o ? "Space: " + (S.sel ? `Use ${ITEMS[S.sel][1]} on ${o.userData.hot.name}` : o.userData.hot.name) : "";
  if (txt === actShown) return;
  actShown = txt; actBtn.hidden = !txt; actBtn.textContent = txt;
}
actBtn.addEventListener("click", (e) => { e.stopPropagation(); doAction(); });
window.addEventListener("keydown", (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || typingIn(e.target) || talking() || e.defaultPrevented) return;   // defaultPrevented: the dialogue listener above already used this key
  if (e.key !== " " && e.key !== "Enter" && e.key.toLowerCase() !== "e") return;
  if (e.target && e.target.tagName === "BUTTON" && e.key !== "e") return;   // let a focused button take Space/Enter itself
  if (!$("title").hidden || !L || !L.player) return;
  if (roomOwnsAction()) { if (L.onAction && L.onAction(e)) e.preventDefault(); return; }
  if (doAction()) e.preventDefault();
});
const kFwd = new THREE.Vector3(), kRight = new THREE.Vector3(), keyDir = new THREE.Vector2();
// Which way on the floor (x, z) a key's screen direction (dx right, dy up) goes. In 3D: by the camera. In the Flat
// look the picture decides: across the picture is x and up it is -z (in the hallway strip: across is -z, up it is -x).
function keyFloorDir(dx, dy) {
  if (flatActive()) return L.id === "hall" ? keyDir.set(-dy, -dx) : keyDir.set(dx, -dy);
  kRight.setFromMatrixColumn(curCam.matrixWorld, 0); kFwd.setFromMatrixColumn(curCam.matrixWorld, 2).negate();
  const r = new THREE.Vector2(kRight.x, kRight.z).normalize(), f = new THREE.Vector2(kFwd.x, kFwd.z).normalize();
  return keyDir.copy(r.multiplyScalar(dx).add(f.multiplyScalar(dy)));
}
function keyWalk() {
  let dx = 0, dy = 0;
  heldKeys.forEach((k) => { dx += KEY_DIRS[k][0]; dy += KEY_DIRS[k][1]; });
  const p = L && L.player;
  if ((!dx && !dy) || !canKeyWalk()) {
    if (p && keyTarget && p.target === keyTarget) p.target = null;   // let go: stop at once
    keyTarget = null; return;
  }
  const v = keyFloorDir(dx, dy).normalize().multiplyScalar(0.35);   // a short step ahead
  keyTarget = clampWalk(p.pos.x + v.x, p.pos.y + v.y);
  const act = L.solids && L.solids.length ? activeSolids(L) : null;
  if (act && act.length && !hitsSolid(act, p.pos.x, p.pos.y) && hitsSolid(act, keyTarget.x, keyTarget.y)) {
    // walking into something: slide along it, or stop
    const kx = clampWalk(p.pos.x + v.x, p.pos.y), kz = clampWalk(p.pos.x, p.pos.y + v.y);
    const okx = !hitsSolid(act, kx.x, kx.y), okz = !hitsSolid(act, kz.x, kz.y);
    keyTarget = okx && (!okz || Math.abs(v.x) >= Math.abs(v.y)) ? kx : okz ? kz : p.pos.clone();
  }
  walkTo(keyTarget);
}


// ---------- solid objects: keep characters out of L.solids ----------
// Click-walking and followers plan a route (small grid A*, then pulled straight); keys slide along edges.
// A target inside a solid becomes the nearest free point. A character that starts inside one just walks out.
// Rooms with no solids skip all of this.
const NAV_PAD = 0.16, NAV_CELL = 0.1;
const _bb = new THREE.Box3();
function activeSolids(lv) {
  const out = [];
  (lv.solids || []).forEach((s) => {
    if (s.show && !s.show()) return;
    if (s.obj) {
      if (!s.rc) {   // measure once, after the room is built
        s.obj.updateMatrixWorld(true); _bb.setFromObject(s.obj);
        if (_bb.isEmpty()) return;
        s.rc = { x0: _bb.min.x - s.pad, x1: _bb.max.x + s.pad, z0: _bb.min.z - s.pad, z1: _bb.max.z + s.pad };
      }
      if (!s.obj.visible) return;   // hidden things (a room stage, a hot's show) aren't solid
      const h = s.obj.userData && s.obj.userData.hot;
      if (h && h.show && !h.show()) return;
      out.push(s.rc);
    } else out.push(s);
  });
  return out;
}
function hitsSolid(act, x, z) {
  for (let i = 0; i < act.length; i++) {
    const s = act[i];
    if (s.r !== undefined) { const dx = x - s.cx, dz = z - s.cz, r = s.r + NAV_PAD; if (dx * dx + dz * dz < r * r) return true; }
    else if (x > s.x0 - NAV_PAD && x < s.x1 + NAV_PAD && z > s.z0 - NAV_PAD && z < s.z1 + NAV_PAD) return true;
  }
  return false;
}
function segHits(act, ax, az, bx, bz) {
  const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.05);
  for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; if (hitsSolid(act, ax + (bx - ax) * t, az + (bz - az) * t)) return true; }
  return false;
}
// Route from (sx,sz) to (gx,gz): { goal: [x,z], route: [[x,z],...] }.
function planRoute(act, sx, sz, gx, gz) {
  const W = L.walk, nx = Math.round((W[1] - W[0]) / NAV_CELL) + 1, nz = Math.round((W[3] - W[2]) / NAV_CELL) + 1;
  const cx = (i) => W[0] + i * NAV_CELL, cz = (j) => W[2] + j * NAV_CELL;
  const blocked = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) if (hitsSolid(act, cx(i), cz(j)) || Math.abs(cx(i)) > walkSide(cz(j)) + 0.01) blocked[j * nx + i] = 1;
  const nearest = (x, z) => {   // nearest free cell to a point
    let best = -1, bd = 1e9;
    for (let k = 0; k < blocked.length; k++) if (!blocked[k]) { const d = (cx(k % nx) - x) ** 2 + (cz((k / nx) | 0) - z) ** 2; if (d < bd) { bd = d; best = k; } }
    return best;
  };
  let goal = [gx, gz];
  if (hitsSolid(act, gx, gz)) { const k = nearest(gx, gz); if (k < 0) return { goal: [sx, sz], route: [] }; goal = [cx(k % nx), cz((k / nx) | 0)]; }
  if (!segHits(act, sx, sz, goal[0], goal[1])) return { goal, route: [] };
  const cell = (x, z) => Math.min(nz - 1, Math.max(0, Math.round((z - W[2]) / NAV_CELL))) * nx + Math.min(nx - 1, Math.max(0, Math.round((x - W[0]) / NAV_CELL)));
  let s0 = cell(sx, sz); const startFree = !blocked[s0] ? s0 : nearest(sx, sz), g0 = cell(goal[0], goal[1]);
  if (startFree < 0) return { goal, route: [] };
  s0 = startFree;
  const g = new Float32Array(nx * nz).fill(1e9), from = new Int32Array(nx * nz).fill(-1), done = new Uint8Array(nx * nz);
  const gxi = g0 % nx, gzi = (g0 / nx) | 0, h = (k) => Math.hypot((k % nx) - gxi, ((k / nx) | 0) - gzi);
  const heap = [[h(s0), s0]]; g[s0] = 0;
  const push = (it) => { heap.push(it); let i = heap.length - 1; while (i > 0) { const q = (i - 1) >> 1; if (heap[q][0] <= heap[i][0]) break; [heap[q], heap[i]] = [heap[i], heap[q]]; i = q; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  while (heap.length) {
    const k = pop()[1]; if (done[k]) continue; done[k] = 1;
    if (k === g0) break;
    const ki = k % nx, kj = (k / nx) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const i = ki + di, j = kj + dj; if (i < 0 || j < 0 || i >= nx || j >= nz) continue;
      const m = j * nx + i; if (blocked[m] || done[m]) continue;
      if (di && dj && (blocked[kj * nx + i] || blocked[j * nx + ki])) continue;   // no squeezing past a corner
      const ng = g[k] + (di && dj ? 1.414 : 1);
      if (ng < g[m]) { g[m] = ng; from[m] = k; push([ng + h(m), m]); }
    }
  }
  if (!done[g0]) return { goal: [sx, sz], route: [] };   // walled off: stay put
  const pts = [goal];
  for (let k = g0; k !== -1; k = from[k]) pts.push([cx(k % nx), cz((k / nx) | 0)]);
  pts.reverse();   // start cell ... goal
  pts.unshift([sx, sz]);
  // pull the path straight: from each point, jump to the farthest one it can see
  const route = []; let a = 0;
  while (a < pts.length - 1) {
    let b = pts.length - 1;
    while (b > a + 1 && segHits(act, pts[a][0], pts[a][1], pts[b][0], pts[b][1])) b--;
    route.push(pts[b]); a = b;
  }
  return { goal, route };
}
// For tests: can the player (from where it stands) reach (x,z)? Not inside a solid, and a route exists.
function navCheck(x, z) {
  const act = activeSolids(L), p = L.player.pos, c = clampWalk(x, z);
  const inside = hitsSolid(act, c.x, c.y), r = planRoute(act, p.x, p.y, c.x, c.y);
  return { inside, goal: r.goal, ok: !inside && Math.hypot(r.goal[0] - c.x, r.goal[1] - c.y) < 0.02 };
}
// Called each frame for a walking character: keeps c.goal (where it really ends up) and c.route (corners to pass) current.
function navUpdate(c) {
  if (!L.solids || !L.solids.length) { c.goal = c.target; c.route = null; return; }
  const tol = c.follow ? 0.3 : 0.001, jumped = c.navP && Math.hypot(c.pos.x - c.navP.x, c.pos.y - c.navP.y) > 0.6;
  if (!c.route || !c.navT || jumped || Math.hypot(c.target.x - c.navT.x, c.target.y - c.navT.y) > tol) {
    const r = planRoute(activeSolids(L), c.pos.x, c.pos.y, c.target.x, c.target.y);
    c.goal = new THREE.Vector2(...r.goal); c.route = r.route.map((q) => new THREE.Vector2(...q)); c.navT = c.target.clone();
  }
  if (c.navP) c.navP.copy(c.pos); else c.navP = c.pos.clone();
}

// ---------- per-frame ----------
const camRight = new THREE.Vector3(), camFwd = new THREE.Vector3();
function stepChar(c, dt, t) {
  if (c.follow) {
    const d = c.follow.pos.clone().sub(c.pos);
    if (d.length() > 0.85) c.target = c.follow.pos.clone().sub(d.normalize().multiplyScalar(0.8));
    c.speed = 2.6;
  }
  if (c.target) {
    navUpdate(c);   // with solids in the room: plans a route round them (c.goal = where it really ends up)
    const aim = c.route && c.route.length ? c.route[0] : c.goal;
    const d = aim.clone().sub(c.pos), dist = d.length();
    if (dist < 0.04 && aim !== c.goal) c.route.shift();
    else if (dist < 0.04) {
      c.pos.copy(c.goal); c.target = null; c.route = null; c.navT = null;
      if (c.onArrive) { const f = c.onArrive; c.onArrive = null; f(); }
    } else {
      c.pos.addScaledVector(d.normalize(), Math.min(dist, c.speed * dt));
      if (c.navP) c.navP.copy(c.pos);
      c.walkT += dt;
      camRight.setFromMatrixColumn(curCam.matrixWorld, 0);
      const sx = d.x * camRight.x + d.y * camRight.z;
      if (Math.abs(sx) > 0.2) c.face = sx > 0 ? 1 : -1;
      if (c.angles && !chars3d) {   // 8 directions on screen: away (back), toward (front), sides, and the diagonals between
        curCam.getWorldDirection(camFwd); camFwd.y = 0; camFwd.normalize();
        const fz = d.x * camFwd.x + d.y * camFwd.z, ax = Math.abs(sx), az = Math.abs(fz), T22 = 0.414;
        const v = az < T22 * ax ? "_side" : ax < T22 * az ? (fz > 0 ? "_back" : "") : (fz > 0 ? "_qback" : "_q");
        if (v !== c.view && (!v || SPR[c.key + v])) {
          c.view = v; c.tex2d = (SPR[c.key + v] || SPR[c.key]).tex; c.body.material.uniforms.map.value = c.tex2d;
        }
      }
    }
  }
  else c.route = null;
  const moving = !!c.target;
  const y = L.groundY ? L.groundY(c.pos.x, c.pos.y) : 0;
  c.root.position.set(c.pos.x, y, c.pos.y);
  const squash = moving ? 0.05 * Math.sin(c.walkT * 22) : 0.012 * Math.sin(t * 2.2 + c.phase);
  let hop = 0;
  if (c.hopT > 0) { c.hopT = Math.max(0, c.hopT - dt); hop = Math.sin(Math.min(1, c.hopT / 0.3) * Math.PI) * 0.22; }
  c.body.position.y = (moving ? Math.abs(Math.sin(c.walkT * 11)) * 0.1 : 0) + (c.yOff || 0) + hop;
  const sm = c.scaleMul ?? 1;
  c.body.scale.set(c.face * (1 + squash * 0.6) * sm, (1 - squash) * sm, sm);
  c.body.rotation.y = Math.atan2(curCam.position.x - c.pos.x, curCam.position.z - c.pos.y);
  if (c.mesh3d) {
    syncChar3D(c);
    c.mesh3d.scale.x = Math.abs(c.mesh3d.scale.x) * (c.face < 0 ? -1 : 1);
    c.mesh3d.rotation.y = moving ? 0.42 : 0.18;
    const sw = moving ? Math.sin(c.walkT * 11) * 0.55 : Math.sin(t * 2.2 + c.phase) * 0.05;
    const { legL, legR, armL, armR, extra } = c.limbs || {};
    if (legL) legL.rotation.x = sw;
    if (legR) legR.rotation.x = -sw;
    if (armL) armL.rotation.x = -sw * 0.85;
    if (armR) armR.rotation.x = sw * 0.85;
    if (extra) extra(t, c.walkT, moving);
  }
}
const tagV = new THREE.Vector3(), tagC = new THREE.Vector3();
function placeTags() {
  if (!L) return;
  if (flatActive()) { placeTagsFlat(); return; }
  if (!curCam) return;
  const hideAll = talking() || !$("title").hidden || spaceCut;
  const pp = L.player.pos;
  TAGS.forEach((g) => {
    const h = g.o.userData.hot;
    let show = !hideAll && (!h.show || !!h.show());
    g.o.localToWorld(tagV.set(0, 2.45, 0.1));
    if (show && L.id === "hall") {   // in the long hallway, only label nearby doors
      const d = Math.hypot(tagV.x - pp.x, tagV.z - pp.y);
      show = d < (Math.abs(tagV.z) > 15 ? 12 : 6.5);
    }
    g.t.hidden = !show;
    if (!show) return;
    tagC.copy(tagV).applyMatrix4(curCam.matrixWorldInverse);
    const behind = tagC.z > 0;
    tagV.project(curCam);
    let x = behind ? -tagV.x : tagV.x, y = behind ? -tagV.y : tagV.y;
    const ex = 0.86, ey = 0.84;
    let m = Math.max(Math.abs(x) / ex, Math.abs(y) / ey);
    if (behind && m < 1) m = Math.max(Math.abs(x) / ex, 1e-3);
    let arrow = "";
    if (m > 1) {
      x /= m; y /= m;
      arrow = Math.abs(x) / ex >= Math.abs(y) / ey - 1e-6 ? (x < 0 ? "left" : "right") : (y < 0 ? "down" : "up");
    }
    if (g.arrow !== arrow) {
      g.arrow = arrow;
      const n = g.t.dataset.name;
      g.t.textContent = arrow === "left" ? "◀ " + n : arrow === "right" ? n + " ▶" : arrow === "up" ? "▲ " + n : arrow === "down" ? "▼ " + n : n;
      g.t.classList.toggle("edge", !!arrow);
    }
    g.t.style.left = ((x + 1) / 2 * 100) + "%";
    g.t.style.top = ((1 - y) / 2 * 100) + "%";
    g.dist = tagC.length();
  });
  // nearer doors win; a tag that would overlap a nearer one stays hidden
  const kept = [];
  TAGS.filter((g) => !g.t.hidden).sort((a, b) => a.dist - b.dist).forEach((g) => {
    const r = g.t.getBoundingClientRect();
    if (kept.some((k) => r.left < k.right && r.right > k.left && r.top < k.bottom && r.bottom > k.top)) g.t.hidden = true;
    else kept.push(r);
  });
}
function resize() {
  const r = stage.getBoundingClientRect();
  stage.style.setProperty("--u", (r.width / 320) + "px");
  if (ps1) {
    // A hint of PS1: render at 1x (no retina sharpening) with a light vertex wobble.
    const w = Math.round(r.width), h = Math.round(r.height);
    renderer.setSize(w, h, false); rt.setSize(w, h); G.uRes.value.set(w / 2.5, h / 2.5);
  } else { const d = Math.min(2, window.devicePixelRatio || 1); renderer.setSize(Math.round(r.width * d), Math.round(r.height * d), false); }
}
window.addEventListener("resize", resize);

// Test switch: #shot=<level> draws a few frames and stops, so headless screenshots can finish.
const SHOT = (location.hash.match(/^#shot=(\w+)/) || [])[1];
let last = performance.now(), frames = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = now / 1000;
  G.uTime.value = t;
  if (!L) return;
  const p = L.player.pos;
  const cc = L.cams.find((c) => c.when(p)) || L.cams[L.cams.length - 1];
  if (cc.follow) { cc.follow(cc.c, p); cc.c.updateMatrixWorld(); }
  curCam = cc.c;
  keyWalk();
  L.update && L.update(t, dt);
  L.hots.forEach((o) => { const h = o.userData.hot; if (h.show) o.visible = !!h.show(); });
  L.chars.forEach((c) => { if (c.show) c.root.visible = !!c.show(); stepChar(c, dt, t); });
  updateClue(t);
  updateSparkles(t, dt);
  updatePowerFx(dt);
  placeTags(); updateActBtn();
  if (flatActive()) {
    renderFlat(t, dt);
    return;
  }
  if (L.preRender) L.preRender(dt);
  if (ps1) {
    renderer.setRenderTarget(rt); renderer.render(L.scene, curCam);
    renderer.setRenderTarget(null); renderer.render(post, postCam);
  } else {
    renderer.setRenderTarget(null); renderer.render(L.scene, curCam);
  }
}

// ---------- toolbar ----------
$("ps1Btn").onclick = (e) => {
  ps1 = !ps1; G.uSnap.value = ps1 ? 1 : 0;
  e.currentTarget.textContent = "PS1 hint: " + (ps1 ? "on" : "off"); e.currentTarget.setAttribute("aria-pressed", ps1);
  resize();
};
$("char3dBtn").onclick = (e) => {
  chars3d = !chars3d;
  e.currentTarget.textContent = "3D chars: " + (chars3d ? "on" : "off"); e.currentTarget.setAttribute("aria-pressed", chars3d);
  Object.values(built).forEach((lv) => (lv.allChars || lv.chars).forEach(syncChar3D));
};
$("readBtn").onclick = (e) => {
  voicesOn = !voicesOn; e.currentTarget.textContent = "Voices: " + (voicesOn ? "on" : "off"); e.currentTarget.setAttribute("aria-pressed", voicesOn);
  if (!voicesOn) stopSpeaking();
};
$("fullBtn").onclick = () => {
  const d = document, el = $("game");
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
};
let restartArmed = false;
$("restartBtn").onclick = (e) => {
  if (!restartArmed) { restartArmed = true; e.currentTarget.textContent = "Really start over?"; setTimeout(() => { restartArmed = false; $("restartBtn").textContent = "Start over"; }, 3000); return; }
  try { localStorage.removeItem(playerKey()); } catch {}   // only this player's game
  location.reload();
};
["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, () => setTimeout(resize, 50)));
const INTRO = [
  () => { spaceCut = true; },
  ["", "The kids are flying their giant spaceship to Woolley Mountain..."],
  ["", "...but the ship is stalled in space, and it can't move!"],
  ["", "Jon is the engineer, but he's hiding in his portal."],
  () => { spaceWait = true; $("hover").textContent = "Click the spaceship to go inside!"; },
];
// Intro ends in space; clicking the ship cuts to May in the hallway.
function enterShip() {
  spaceWait = false; spaceCut = false; $("hover").textContent = ""; canvas.style.cursor = "default";
  say([["", "May is in the hallway. Help May get Jon out so he can fix the ship."]]);
}
function overShip(e) {
  setNdc(e); ray.setFromCamera(ndc, curCam);
  return !!(L.spaceShip && ray.intersectObject(L.spaceShip, true).length);
}
function beginGame(fresh) {
  $("title").hidden = true;
  syncFlatUI();
  if (fresh) { S.items = []; S.flags = {}; S.room = "hall"; save(); }
  const isIntro = fresh || !S.flags.started;
  goLevel(S.room && LV[S.room] ? S.room : "hall");
  if (isIntro) {
    spaceCut = true;
    S.flags.started = true; save();
    setTimeout(() => { spaceCut = true; say(INTRO); }, 450);
  }
}

// ---------- title screen: who is playing ----------
// The Play button says Continue when the current player has a game going.
function refreshTitle() {
  const saved = !!S.flags.started;
  $("playBtn").textContent = saved ? "Continue" : "Play";
  $("newBtn").hidden = !saved;
  $("whoBtn").textContent = "Player: " + curPlayer().name;
}
// The player list: pick who is playing, add someone, or take someone off (two clicks, since it wipes their game).
function initPlayers() {
  const box = $("players"), list = $("playerList"), name = $("playerName");
  let armed = null;   // the player whose Remove button has been clicked once
  const close = () => { box.hidden = true; armed = null; refreshTitle(); $("whoBtn").focus({ preventScroll: true }); };
  const render = () => {
    list.textContent = "";
    PLAYERS.list.forEach((p) => {
      const row = document.createElement("div"); row.className = "who";
      const pick = document.createElement("button");
      pick.textContent = p.name + (playerStarted(p.id) ? "" : " (new)"); pick.setAttribute("aria-pressed", p.id === PLAYERS.cur);
      pick.onclick = () => { pickPlayer(p.id); close(); };
      const del = document.createElement("button");
      del.textContent = armed === p.id ? "Really?" : "Remove"; del.setAttribute("aria-label", "Remove " + p.name + " and their saved game");
      del.onclick = () => { if (armed !== p.id) { armed = p.id; render(); return; } armed = null; removePlayer(p.id); render(); refreshTitle(); };
      row.append(pick, del); list.appendChild(row);
    });
  };
  const addNew = () => { addPlayer(name.value); name.value = ""; close(); };
  $("whoBtn").onclick = (e) => { e.stopPropagation(); armed = null; render(); box.hidden = false; };
  $("playerAdd").onclick = addNew;
  $("playersClose").onclick = close;
  box.addEventListener("click", (e) => e.stopPropagation());
  box.addEventListener("keydown", (e) => {
    e.stopPropagation();   // typing a name is not playing
    if (e.key === "Escape") close();
    else if (e.key === "Enter" && e.target === name) { e.preventDefault(); addNew(); }
  });
}

// ---------- start ----------
async function start() {
  try { await Promise.race([document.fonts.load(FONT), new Promise((r) => setTimeout(r, 2500))]); } catch {}
  makeTextures();
  makeTextures2();
  TEX.mays = await drawingTex(IMAGES["mays-room"]);
  TEX.jasins = await drawingTex(IMAGES["jasins-room"]);
  TEX.kids = await drawingTex(IMAGES["four-kids"], 120);
  TEX.olivias = await drawingTex(IMAGES["olivias-room"]);
  TEX.livPoster = await drawingTex(IMAGES["olivia-poster"], 160);
  TEX.livPillow = await drawingTex(IMAGES["olivia-pillow"], 64);
  TEX.livingTv = await drawingTex(IMAGES["living-tv"], 200);
  TEX.oldTv = await drawingTex(IMAGES["kitchen-oldtv"], 64);
  TEX.jonPicture = await drawingTex(IMAGES["jon-picture"], 128);
  TEX.jonFigure = await drawingTex(IMAGES["jon-figure"], 96, true);
  TEX.jonsRoom = await drawingTex(IMAGES["jons-room"]);
  TEX.playTv = await drawingTex(IMAGES["play-tv"], 200);
  TEX.playToybox = await drawingTex(IMAGES["play-toybox"], 160);
  TEX.playroom = await drawingTex(IMAGES["playroom"]);
  TEX.control = await drawingTex(IMAGES["control-room"]);
  for (const k of ["arm1", "arm2", "arm3", "arm4"]) TEX[k] = await drawingTex(IMAGES[k], 200);
  TEX.armory = await drawingTex(IMAGES["armory"]);
  TEX.bathroom = await drawingTex(IMAGES["bathroom"]);
  TEX.storage = await drawingTex(IMAGES["storage-room"]);
  TEX.engine = await drawingTex(IMAGES["engine-room"]);
  RAW.dancer = new Image(); RAW.dancer.src = IMAGES["olivia-dancer"]; await RAW.dancer.decode();
  await svgSprite("may", ["may"], "may");
  await svgSprite("jon", ["jon"], "jon");
  await svgSprite("jonOval", ["jon-oval", "jon"], "jon");
  await svgSprite("jasin", ["jasin"], "jasin");
  await svgSprite("olivia", ["olivia"], "olivia");
  await svgSprite("wizard", ["wizard"], "wizard", 0.17);
  await svgSprite("witch", ["witch"], "witch", 0.17);
  await svgSprite("pingpong", ["pingpong"], "pingpong", 0.17);
  await svgSprite("apprentice", ["apprentice"], "apprentice", 0.17);
  pixelSprite("spider", [
    "......kk......",
    ".....kkkk.....",
    "..k.kkkkkk.k..",
    ".k.kkkkkkkk.k.",
    "k.k.kkkkkk.k.k",
    "k.k..kkkk..k.k",
    ".k.k.k..k.k.k.",
    ".k..k.kk.k..k.",
    "k..k..kk..k..k",
    "k..k.k..k.k..k",
    "...k.k..k.k...",
  ], { k: "#5a2a14" });
  pixelSprite("skeleton", [
    "....rrrrrr....",
    "...rrrrrrrr...",
    "..rrrrrrrrrr..",
    "...wwwwwwww...",
    "...wkkwwkkw...",
    "...wkkwwkkw...",
    "...wwwkkwww...",
    "...wkwkwkww...",
    "....wwwwww....",
    "......ww......",
    "..bbbbbbbbbb..",
    ".bbwbwbbwbwbb.",
    ".bbbwbbbbwbbb.",
    ".bbwbwbbwbwbb.",
    ".w.bbbbbbbb.w.",
    ".w..bbbbbb..w.",
    "w....wwww....w",
    ".....w..w.....",
    ".....w..w.....",
    ".....w..w.....",
    "....ww..ww....",
  ], { r: "#c82020", w: "#f0ece0", k: "#2a1f3d", b: "#3a5a8a" });
  pixelSprite("lady", [
    ".....hhhh.....",
    "....hhhhhh....",
    "...hhhhhhhh...",
    "...hssssssh...",
    "...skssssks...",
    "...ssssssss...",
    "....sskkss....",
    ".....ssss.....",
    "...dddddddd...",
    "..dddddddddd..",
    ".sddwwwwwwdds.",
    ".s.dwwwwwwd.s.",
    ".s.dwwwwwwd.s.",
    "...dwwwwwwd...",
    "...dddddddd...",
    "...dddddddd...",
    "....ss..ss....",
    "....ss..ss....",
    "...kkk..kkk...",
  ], { h: "#8a8a90", s: "#f3c9a5", k: "#2a1f3d", d: "#3a86c8", w: "#ffffff" });
  pixelSprite("raccoon", [
    "..kk......kk..",
    ".kgkk....kkgk.",
    ".kggggggggggk.",
    "kgwkkwggwkkwgk",
    "kgkwkkggkkwkgk",
    ".kggggkkggggk.",
    "..kgggggggggk..",
    ".kgggggggggggk",
    "kggggggggggggk",
    ".kgg.kgg.kggk.",
  ], { k: "#2a2a2e", g: "#8a8a90", w: "#ffffff" });
  pixelSprite("possum", [
    "..ww.....ww...",
    ".wppw...wppw..",
    ".wwwwwwwwwww..",
    "wwkwwwwwwkww..",
    ".wwwwppwwwww..",
    "..wggggggggw..",
    ".wggggggggggw.",
    "wggggggggggggp",
    ".gg..gg..gg..p",
  ], { w: "#e8e4dc", p: "#f29bb0", k: "#2a1f3d", g: "#9a9690" });
  pixelSprite("owl", [
    ".b........b.",
    ".bb......bb.",
    ".bbbbbbbbbb.",
    "bwwwbbbbwwwb",
    "bwkwbyybwkwb",
    "bwwwbyybwwwb",
    ".bbbbbbbbbb.",
    ".bllllllllb.",
    ".bllllllllb.",
    "..bbbbbbbb..",
    "...y....y...",
  ], { b: "#7a5a3a", w: "#ffffff", k: "#2a1f3d", y: "#f2b830", l: "#c8a878" });
  pixelSprite("frog", [
    ".gg....gg.",
    "gwkg..gwkg",
    "gggggggggg",
    "gkkkkkkkkg",
    "gggggggggg",
    "g.gg..gg.g",
  ], { g: "#4ab84a", w: "#ffffff", k: "#14401a" });
  pixelSprite("dog", [
    "kk..........",
    "kbk.........",
    "kbbbk.......",
    "bwbbbk......",
    "bbbbbbbbbbbk",
    "wkwwbbbbbbbk",
    ".bbbbbbbbbbk",
    ".b.b....b.b.",
    ".b.b....b.b.",
  ], { k: "#2a1a10", b: "#6a4a2a", w: "#ffffff" });
  pixelSprite("slime", [
    "...gggg...",
    "..gggggg..",
    ".gggggggg.",
    ".gkgggkgg.",
    ".gggggggg.",
    ".ggkkkkgg.",
    ".gggggggg.",
    "gggggggggg",
    "g.gg.gg.gg",
  ], { g: "#3fb84a", k: "#14401a" });
  pixelSprite("mouse", [
    "....kk..........",
    "...kppk..kk.....",
    "...kggkkkggk....",
    "..kgggggggggk...",
    ".kwkgggggggggk..",
    "kggggggggggggk.t",
    ".kkgggggggggk.t.",
    "...k.k...k.kttt.",
  ], { k: "#2a1f3d", g: "#9a92a8", p: "#f29bb0", w: "#ffffff", t: "#f29bb0" });
  const names = { may: "May", jonOval: "Jon", jasin: "Jasin", olivia: "Olivia", wizard: "Wizard", witch: "Witch", pingpong: "Ping-pong bad guy", apprentice: "Apprentice", mouse: "Kitchen mouse" };
  Object.entries(names).forEach(([k, n]) => {
    const f = document.createElement("figure"), img = document.createElement("img");
    img.src = SPR[k].canvas.toDataURL(); img.alt = n + " sprite";
    if (k === "mouse") img.style.width = "calc(var(--u) * 24)";
    const cap = document.createElement("figcaption"); cap.textContent = n;
    f.append(img, cap); $("castGrid").appendChild(f);
  });
  msg.hidden = true;
  resize();
  renderHud();
  $("coverImg").src = IMAGES.cover;
  refreshTitle();
  $("playBtn").onclick = (e) => { e.stopPropagation(); beginGame(!S.flags.started); };
  $("newBtn").onclick = (e) => { e.stopPropagation(); beginGame(true); };
  initPlayers();
  initDebug();
  initFlat();
  if (SHOT && LV[SHOT]) { $("title").hidden = true; goLevel(SHOT); }
  if (SHOT) window.__game = window.__mk = { add, navCheck, hitsSolid, activeSolids, SPR, PLAYERS, playerKey, pickPlayer, addPlayer, removePlayer, playerStarted, save, doMove, kidAct, ownerAct, startPong, finishPong, showDiploma, beginGame, get spaceCut() { return spaceCut; }, get spaceWait() { return spaceWait; }, enterShip, openDollhouse, closeDollhouse, get dhParts() { return dhParts; }, setLead, powerOn, usePowerBtn, FLAT, setFlatMode, flatActive, get flatMode() { return flatMode; }, rawSpotForHot, screenSpotForHot, getLevel, LV, useHot, setVoices: (v) => { voicesOn = v; if (!v) stopSpeaking(); }, S, goLevel, act, say, advance, combine, get L() { return L; }, get busy() { return busy; }, talking, goal, sideGoal };
  requestAnimationFrame(frame);
}
start().catch((e) => { msg.hidden = false; msg.textContent = "Something went wrong: " + e.message; console.error(e); });
