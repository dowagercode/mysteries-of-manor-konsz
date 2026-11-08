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
    L = getLevel(id); S.room = id; if (id === "pingpong") S.flags.metPP = true; if (id === "swamp") S.flags.sawSwamp = true; save(); renderExits();
    const e = (from && L.entries[from]) || (from === undefined ? L.start : null);
    if (e) {
      L.player.pos.set(...e); L.player.target = null;
      L.chars.forEach((c, i) => { if (c.follow) c.pos.set(e[0] - 0.8 * i, e[1] + 0.4 * i); });
    }
    applyLight(L);
    document.querySelectorAll("#levels button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === id));
    setTimeout(() => {
      fade.style.opacity = 0; busy = false;
      if (LV_SKIP_ENTER.has(id)) { LV_SKIP_ENTER.delete(id); L.entered = true; }
      if (L.onEnter && !L.entered) { L.entered = true; say(typeof L.onEnter === "function" ? L.onEnter() : L.onEnter); }
    }, 60);
  }, 260);
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
  u.pitch = c.pitch; u.rate = c.rate;
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
      const b = document.createElement("button"); b.className = "choice px"; b.textContent = "▸ " + labelText;
      b.onclick = (e) => { e.stopPropagation(); choosing = false; say(fn() || []); };
      boxText.appendChild(b);
    });
    return;
  }
  const [n, t] = dq.shift();
  box.hidden = false; boxName.textContent = n; fullText = t; boxText.textContent = ""; boxMore.hidden = true;
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
// Clicking while someone is still talking waits for them to finish, so voices never overlap or get cut off.
function advance() { if (choosing) return; if (typing) finishType(); else if (speaking) pendingNext = true; else next(); }
const talking = () => !box.hidden;
let peekOpen = false;
function showPeek(src, cap) { $("peekImg").src = src; $("peekCap").textContent = cap; $("peek").hidden = false; peekOpen = true; }

// ---------- input ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function setNdc(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
function pick() {
  ray.setFromCamera(ndc, curCam);
  const hits = ray.intersectObjects(L.hots, true);
  for (const h of hits) { let o = h.object; while (o && !o.userData.hot) o = o.parent; if (o && (!o.userData.hot.show || o.userData.hot.show())) return o; }
  return null;
}
const clampWalk = (x, z) => new THREE.Vector2(Math.min(L.walk[1], Math.max(L.walk[0], x)), Math.min(L.walk[3], Math.max(L.walk[2], z)));
function walkTo(v, then) { L.player.target = v; L.player.onArrive = then || null; }
function act(h) {
  if (h.run) h.run();
  else if (h.go) goLevel(h.go, L.id);
  else if (h.say) say(typeof h.say === "function" ? h.say() : h.say);
}
canvas.addEventListener("pointermove", (e) => {
  if (spaceWait && L && curCam && !talking()) { canvas.style.cursor = overShip(e) ? "pointer" : "default"; return; }
  if (!L || !curCam || castOpen || talking() || !$("title").hidden) { $("hover").textContent = ""; return; }
  setNdc(e); const o = pick();
  $("hover").textContent = o ? (S.sel ? `Use ${ITEMS[S.sel][1]} on ${o.userData.hot.name}` : o.userData.hot.name) : "";
  canvas.style.cursor = o ? "pointer" : "default";
});
stage.addEventListener("click", (e) => {
  if (peekOpen) { peekOpen = false; $("peek").hidden = true; return; }
  if (!L || !curCam || castOpen || busy || !$("title").hidden) return;
  $("hover").textContent = "";
  if (talking()) { advance(); return; }
  if (spaceWait) { if (overShip(e)) enterShip(); else $("hover").textContent = "Click the spaceship to go inside!"; return; }
  if (e.target !== canvas) return;
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
    if (sel && h.use && h.use[sel]) say(h.use[sel]());
    else if (sel && !h.go && !h.run) say([["", `The ${ITEMS[sel][1].toLowerCase()} doesn't work there.`]]);
    else act(h);
  });
}
// Every way out of the current room, as buttons under the goal.
const isExit = (h) => h.exit || h.go || (h.run && /^(Door|Armory|Jon's purple portal)/.test(h.name));
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
window.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && talking()) { e.preventDefault(); advance(); } });

// ---------- per-frame ----------
const camRight = new THREE.Vector3();
function stepChar(c, dt, t) {
  if (c.follow) {
    const d = c.follow.pos.clone().sub(c.pos);
    if (d.length() > 0.85) c.target = c.follow.pos.clone().sub(d.normalize().multiplyScalar(0.8));
    c.speed = 2.6;
  }
  if (c.target) {
    const d = c.target.clone().sub(c.pos), dist = d.length();
    if (dist < 0.04) {
      c.pos.copy(c.target); c.target = null;
      if (c.onArrive) { const f = c.onArrive; c.onArrive = null; f(); }
    } else {
      c.pos.addScaledVector(d.normalize(), Math.min(dist, c.speed * dt));
      c.walkT += dt;
      camRight.setFromMatrixColumn(curCam.matrixWorld, 0);
      const sx = d.x * camRight.x + d.y * camRight.z;
      if (Math.abs(sx) > 0.2) c.face = sx > 0 ? 1 : -1;
    }
  }
  const moving = !!c.target;
  const y = L.groundY ? L.groundY(c.pos.x, c.pos.y) : 0;
  c.root.position.set(c.pos.x, y, c.pos.y);
  const squash = moving ? 0.05 * Math.sin(c.walkT * 22) : 0.012 * Math.sin(t * 2.2 + c.phase);
  let hop = 0;
  if (c.hopT > 0) { c.hopT = Math.max(0, c.hopT - dt); hop = Math.sin(Math.min(1, c.hopT / 0.3) * Math.PI) * 0.22; }
  c.body.position.y = (moving ? Math.abs(Math.sin(c.walkT * 11)) * 0.1 : 0) + (c.yOff || 0) + hop;
  const sm = c.scaleMul ?? 1;
  c.body.scale.set(c.face * (1 + squash * 0.6) * sm, (1 - squash) * sm, 1);
  c.body.rotation.y = Math.atan2(curCam.position.x - c.pos.x, curCam.position.z - c.pos.y);
}
const tagV = new THREE.Vector3(), tagC = new THREE.Vector3();
function placeTags() {
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
  L.update && L.update(t, dt);
  L.hots.forEach((o) => { const h = o.userData.hot; if (h.show) o.visible = !!h.show(); });
  L.chars.forEach((c) => { if (c.show) c.root.visible = !!c.show(); stepChar(c, dt, t); });
  updateClue(t);
  updateSparkles(t, dt);
  placeTags();
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
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  location.reload();
};
["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, () => setTimeout(resize, 50)));
const INTRO = [
  () => { spaceCut = true; },
  ["", "The kids are flying their giant spaceship to Woolley Mountain..."],
  ["", "...but the ship is stalled in space, and it can't move!"],
  ["", "Jon is the engineer, but he's hiding in his portable hole."],
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
  if (fresh) { S.items = []; S.flags = {}; S.room = "hall"; save(); }
  const isIntro = fresh || !S.flags.started;
  goLevel(S.room && LV[S.room] ? S.room : "hall");
  if (isIntro) {
    spaceCut = true;
    S.flags.started = true; save();
    setTimeout(() => { spaceCut = true; say(INTRO); }, 450);
  }
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
  const saved = !!S.flags.started;
  $("playBtn").textContent = saved ? "Continue" : "Play";
  $("newBtn").hidden = !saved;
  $("playBtn").onclick = (e) => { e.stopPropagation(); beginGame(!saved); };
  $("newBtn").onclick = (e) => { e.stopPropagation(); beginGame(true); };
  initDebug();
  if (SHOT && LV[SHOT]) { $("title").hidden = true; goLevel(SHOT); }
  if (SHOT) window.__mk = { doMove, kidAct, ownerAct, beginGame, get spaceCut() { return spaceCut; }, get spaceWait() { return spaceWait; }, enterShip, setVoices: (v) => { voicesOn = v; if (!v) stopSpeaking(); }, S, goLevel, act, say, advance, combine, get L() { return L; }, get busy() { return busy; }, talking, goal, sideGoal };
  requestAnimationFrame(frame);
}
start().catch((e) => { msg.hidden = false; msg.textContent = "Something went wrong: " + e.message; console.error(e); });
