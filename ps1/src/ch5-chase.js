// ch5-chase.js: Chapter 5: beating the dogs of darkness, the apprentice joins, chasing the witch's walking house around the road map,
// the secret mansion's outside and its music maze ("Twinkle Twinkle Little Star"), the wedding, and going home.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- the dogs of darkness ----------
function dogFight() {
  const out = (how) => [flag("dogsBeaten"), ...how, ["", "There's the emergency exit: a slide that goes down and out of the castle!"]];
  const choices = [];
  if (has("dogFood")) choices.push(["Throw the can of dog food", () => out([() => remove("dogFood"),
    ["", "May throws the can of dog food from the mansion kitchen. The dogs of darkness gobble it all up..."],
    ["", "...then they curl up, happy and full, and fall asleep!"], flag("dogsFed")])]);
  choices.push(["Throw Jasin's glowing ball", () => out([["Jasin", "Go get it!"],
    ["", "Jasin throws his glowing ball as far as he can. The dogs of darkness chase after it!"], flag("ballThrown"),
    ["", "(Does Jasin get his ball back? The kids are still deciding!)"]])]);
  choices.push(["Run!", () => [["Dogs of darkness", "GRRRRR!"], ["", "The dogs block the way! Maybe something could keep them busy..."]]]);
  return [{ choices }];
}
function dogLines() {
  if (S.flags.dogsBeaten) return S.flags.dogsFed ? [["", "The dogs of darkness are snoring. Shh!"]] : [["", "The dogs are busy chasing the ball."]];
  return [["Dogs of darkness", "GRRRRRR..."], ["", "Three vicious hounds, the dogs of darkness, surround the kids!"], ...dogFight()];
}
function addSlide(L) {
  const g = group(L, 5.2, 0, -2.6, -0.8, { name: "Emergency exit slide", exit: true, stand: [4.4, -1.4], show: () => !!S.flags.dogsBeaten,
    run: () => say([["Everyone", "WHEEEEE!"], ["", "The kids slide down, down, down... and right out of the castle!"], () => goLevel("castle", "atrium")]) });
  put(L, boxG(1.6, 2.4, 0.2), mat({ color: 0x2a2030 }), 0, 0, 0, 0, null, g);
  const s = put(L, boxG(1.0, 0.1, 2.6), mat({ color: 0xf2c830 }), 0, 0.9, 1.0, 0, null, g); s.rotation.x = 0.45;
  put(L, planeG(1.4, 0.3), mat({ map: signTex("EXIT", "#5ad85a") }), 0, 2.5, 0.12, 0, null, g);
}

// ---------- the apprentice joins the kids ----------
function apprenticeAct() {
  if (S.flags.apprJoined) return [["Apprentice", "Chicken feathers show where the house WAS. Wind blowing on the road map shows where it's going NEXT!"]];
  const meh = (line) => () => [["Apprentice", line], ["", "Hmm. That didn't seem to be the right thing to say."]];
  return [["Apprentice", "Oh... it's you kids. The witch and the wizard ran off in her house. They left me here all alone."],
    { choices: [["You're a really good rower!", meh("Um... thanks, I guess.")],
      ["You'd make a better wizard than the wizard.", meh("Shh! Don't let him hear you say that!")],
      ["You're too nice to be on the bad guy team.", () => [["Apprentice", "...Really? You think so?"], ["Apprentice", "You know what? I'm joining YOUR team!"], flag("apprJoined"),
        ["Apprentice", "I'll help you find her house. Look for chicken feathers: that's where it WAS."],
        ["Apprentice", "And look for wind blowing on the road map: that's where it's going NEXT!"]]],
      ["Your pointy hat is super cool.", meh("Thanks. It's a little itchy, actually.")]] }];
}

// ---------- the chase: catch the walking house 3 times ----------
const CHASE = ["forest", "gas", "mansion"];   // where the house runs to (the third time, it stops at the secret mansion)
const chaseOn = () => !!S.flags.apprJoined && (S.flags.chaseStep || 0) < 3;
const chaseLast = () => { const s = S.flags.chaseStep || 0; return s === 0 ? "swamp" : CHASE[s - 1]; };
function chaseMap(L) {
  // wind swirls where the house is going, feathers where it was
  const wind = group(L, 0, 0.4, 0, 0, { name: "Swirling wind", exit: true, stand: [0, 7], show: () => chaseOn(),
    run: () => mapGo(CHASE[S.flags.chaseStep || 0]) });
  put(L, new THREE.CylinderGeometry(1.1, 1.1, 1.2, 10), mat({ color: 0xffffff, alpha: 0.01 }), 0, 0.6, 0, 0, null, wind);
  [0.5, 0.8, 1.1].forEach((r, i) => {
    const pts = []; for (let k = 0; k <= 20; k++) { const a = k / 20 * Math.PI * 1.6; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.4 + i * 0.35, Math.sin(a) * r)); }
    line(L, lineG(pts), 0xffffff, wind);
  });
  const showFeath = () => chaseOn() || (!!S.flags.houseGone && !S.flags.apprJoined);
  const feathers = group(L, 0, 0, 0, 0, { name: "Chicken feathers", stand: [0, 7], show: showFeath,
    say: () => S.flags.apprJoined
      ? [["", "Chicken feathers! That's where the witch's walking house WAS."], ["Apprentice", "Look for the wind blowing on the road map: that's where it's going NEXT!"]]
      : [["", "The witch's house is gone from the swamp! Only chicken feathers are left behind."], ["", "Maybe the apprentice at the swamp knows where the house went!"]] });
  put(L, boxG(1.3, 0.3, 1.3), mat({ color: 0xffffff, alpha: 0.01 }), 0, 0.1, 0, 0, null, feathers);
  [[-0.5, 0.3, 0.4], [0.4, 0.5, -0.6], [0.1, -0.4, 1.2], [-0.2, -0.6, 2.0]].forEach(([x, z, r]) => {
    const f = put(L, planeG(0.16, 0.42), mat({ color: 0xfff8f0, em: 0.5, side: THREE.DoubleSide }), x, 0.05, z, r, null, feathers); f.rotation.x = -1.3;
  });
  return (t) => {
    const on = chaseOn(), sf = showFeath();
    wind.visible = on;
    feathers.visible = sf;
    if (sf) {
      const was = MAP_NODES[chaseLast()].pos;
      feathers.position.set(was[0] + 0.9, 0, was[1] + 0.5);
    }
    if (!on) return;
    const at = MAP_NODES[CHASE[S.flags.chaseStep || 0]].pos;
    wind.position.set(at[0], 0.4, at[1]); wind.rotation.y = t * 3;
  };
}
function chaseCatchLines(id) {
  const f = S.flags, step = f.chaseStep || 0;
  if (id === CHASE[step] && step < 2) return [
    ["", "There it is! The witch's house, on its big chicken legs!"], ["Witch's house", "BAWK! BAWK!"],
    () => { if (L && L.chaseRun) L.chaseRun(); f.chaseStep = step + 1; save(); },
    ["", "The house jumps up and runs away, leaving chicken feathers everywhere!"],
    ["Apprentice", "Quick! Go back to the road map and look for the wind. That's where it's going next!"]];
  if (id === CHASE[step]) return [
    ["", "The witch's house! It's resting in front of the secret mansion. It's all tired out from running!"],
    ["", "The kids climb inside the house..."],
    () => { if (L && L.escapeRun) L.escapeRun(); f.chaseStep = 3; f.chaseDone = true; save(); },
    ["", "...but the wizard and the witch run out the back door, into the secret mansion!"],
    ["Apprentice", "After them!"]];
  if (id === chaseLast()) return [["", "Chicken feathers! The witch's house was here... but it's gone now."]];
  return null;
}
function chaseArrive(id) {
  if (!chaseOn()) return;
  const lines = chaseCatchLines(id);
  if (lines) setTimeout(() => say(lines), 450);
}

// ---------- the secret mansion: outside, and the giant xylophone ----------
function chickenHouse(L, parent) {
  const legM = mat({ color: 0xd8a040 });
  const legs = [-0.6, 0.6].map((lx) => {
    const lg = new THREE.Group(); lg.position.set(lx, 2.0, 0); parent.add(lg);
    put(L, boxG(0.16, 2.0, 0.16), legM, 0, -2.0, 0, 0, null, lg);
    put(L, boxG(0.6, 0.08, 0.15), legM, 0, -2.0, 0.2, 0, null, lg);
    return lg;
  });
  parent.userData.legs = legs;
  put(L, boxG(2.6, 1.8, 2.0), mat({ color: 0x6a5a40 }), 0, 2.0, 0, 0, null, parent);
  put(L, new THREE.ConeGeometry(1.9, 1.4, 4).rotateY(Math.PI / 4), mat({ color: 0x4a3a2a }), 0, 4.5, 0, 0, null, parent);
  put(L, planeG(0.6, 0.9), mat({ color: 0x2a1a10 }), 0, 2.2, 1.01, 0, null, parent);
}
function addChaseSpot(L, id, x, z, ry, stand) {
  let runT = -1;
  const isHere = () => chaseOn() && CHASE[S.flags.chaseStep || 0] === id;
  const wasHere = () => chaseOn() && chaseLast() === id && runT < 0;
  const ch = group(L, x, 0, z, ry, { name: "The witch's house", stand,
    show: () => isHere() || runT >= 0,
    say: () => chaseCatchLines(id) || [["", "The witch's house on its big chicken legs!"]] });
  chickenHouse(L, ch);
  const feath = group(L, x, 0, z, 0, { name: "Chicken feathers", stand,
    show: wasHere,
    say: () => [["", "Chicken feathers! The witch's house was here... but it jumped up and ran away!"],
      ["Apprentice", "Check the road map and look for the wind: that's where it's going next!"]] });
  [[-0.5, 0.2, 0.3], [0.4, -0.2, -0.6], [0.1, 0.4, 1.1], [-0.3, -0.4, 1.8], [0.55, 0.15, -1.2]].forEach(([fx, fz, r]) => {
    const f = put(L, planeG(0.2, 0.46), mat({ color: 0xfff8f0, em: 0.5, side: THREE.DoubleSide }), fx, 0.05, fz, r, null, feath); f.rotation.x = -1.3;
  });
  L.chaseRun = () => { runT = 0; };
  L.chaseUpd = (t, dt) => {
    const vis = isHere() || runT >= 0;
    ch.visible = vis;
    feath.visible = wasHere();
    const legs = ch.userData.legs || [];
    if (runT >= 0) {
      runT += dt || 0.016;
      ch.position.set(x + runT * 6.5, Math.abs(Math.sin(runT * 14)) * 0.45, z - runT * 2.5);
      ch.rotation.y = ry + 0.6;
      legs.forEach((lg, i) => (lg.rotation.x = Math.sin(runT * 24 + i * Math.PI) * 0.7));
      if (runT > 1.8) { runT = -1; ch.position.set(x, 0, z); ch.rotation.y = ry; }
    } else if (vis) {
      ch.position.set(x, Math.abs(Math.sin(t * 3.5)) * 0.08, z);
      ch.rotation.y = ry + Math.sin(t * 2) * 0.06;
      legs.forEach((lg, i) => (lg.rotation.x = Math.sin(t * 3.5 + i * Math.PI) * 0.12));
    }
  };
}
LV.mansionOut = () => {
  const L = newLevel("mansionOut", "Outside the Secret Mansion");
  outdoor(L, T.nightSky, T.grass, [14, 10]);
  const m = new THREE.Group(); m.position.set(0, 0, -9); L.scene.add(m);
  const wm = mat({ color: 0x3a2a3a }), rm = mat({ color: 0x2a1a2a });
  put(L, boxG(14, 6, 3), wm, 0, 0, 0, 0, null, m);
  [-5.5, 5.5].forEach((x) => { put(L, boxG(3, 9, 3), wm, x, 0, 0.2, 0, null, m); put(L, new THREE.ConeGeometry(2.4, 3, 4).rotateY(Math.PI / 4), rm, x, 10.5, 0.2, 0, null, m); });
  put(L, new THREE.ConeGeometry(7.8, 3, 4).rotateY(Math.PI / 4), rm, 0, 7.5, 0, 0, null, m);
  for (let r = 0; r < 2; r++) for (let c = -2; c <= 2; c++) if (c) put(L, planeG(0.7, 1.0), mat({ color: r ? 0xffd070 : 0x1a1418, em: r ? 1 : 0 }), c * 1.6, 1.4 + r * 2.4, 1.52, 0, null, m);
  const door = group(L, 0, 0, -7.45, 0, { name: "Front door of the mansion", go: "mansion", stand: [0, -5.6] });
  put(L, planeG(1.6, 2.6), mat({ map: doorTex("#3a2a20", "#6a5040") }), 0, 0, 0, 0, null, door);
  const showHouse = () => !!S.flags.chaseDone || (chaseOn() && CHASE[S.flags.chaseStep || 0] === "mansion");
  const ch = group(L, 5.2, 0, -4.4, -0.5, { name: "The witch's house", stand: [3.8, -2.4], show: showHouse,
    say: () => S.flags.chaseDone
      ? [["", "The witch's house, resting on its chicken legs. It's empty now."]]
      : chaseCatchLines("mansion") });
  chickenHouse(L, ch);
  let escT = -1;
  L.escapeRun = () => { escT = 0; };
  const escWiz = addChar(L, "wizard", 4.4, -4.4, 1.9);
  const escWit = addChar(L, "witch", 4.9, -4.2, 1.8);
  escWiz.show = escWit.show = () => escT >= 0;
  [[-7, -3], [-8, 1], [7.5, 1.5], [-6, 3.5]].forEach(([x, z]) => tree(L, x, z, 1.4, 0x1e2a1e));
  const jeep = group(L, -4.6, 0, 3.4, 0.5, toJeep([-3.4, 2.8])); miniJeep(L, jeep);
  crew(L, -2.6, 2.6);
  L.walk = [-6, 6, -5.8, 4.4]; L.start = [-2.6, 2.6];
  L.entries = { roadmap: [-3.0, 2.8], mansion: [0, -5.2] };
  L.onEnter = [["", "The secret mansion is HUGE from the outside. Very, very creepy..."]];
  L.light = { amb: 0x50506a, dir: [0.3, -1, -0.5], dirCol: 0x404060, pts: [[[0, 3, -6], 0xffb070, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x101020, 14, 50]; L.bg = 0x101020;
  cam(L, [0, 4.4, 10.5], [0, 2.2, -4], 56, null, 200);
  L.update = (t, dt) => {
    ch.visible = showHouse();
    if (ch.visible && !S.flags.chaseDone) ch.position.y = Math.abs(Math.sin(t * 2.5)) * 0.06;
    else ch.position.y = 0;
    if (escT >= 0) {
      escT += dt || 0.016;
      const k = Math.min(1, escT / 1.5);
      escWiz.pos.set(4.4 * (1 - k), -4.4 + (-7.2 + 4.4) * k);
      escWit.pos.set(4.9 * (1 - k), -4.2 + (-7.2 + 4.2) * k);
      escWiz.yOff = Math.abs(Math.sin(escT * 14)) * 0.2;
      escWit.yOff = Math.abs(Math.sin(escT * 14 + 1)) * 0.2;
      if (escT > 1.5) escT = -1;
    }
  };
  return L;
};
const NOTES = { Do: 261.63, Re: 293.66, Mi: 329.63, Fa: 349.23, So: 392.0, La: 440.0, Ti: 493.88 };
const XYL_NOTES = ["Do", "Re", "Mi", "Fa", "So", "La", "Ti"];
const SONG = ["Do", "Do", "So", "So", "La", "La", "So", "Fa", "Fa", "Mi", "Mi", "Re", "Re", "Do"];   // Twinkle Twinkle Little Star
let AUDIO = null;
function tone(freq, dur = 0.6) {
  try {
    AUDIO = AUDIO || new (window.AudioContext || window.webkitAudioContext)();
    const o = AUDIO.createOscillator(), g = AUDIO.createGain(), t0 = AUDIO.currentTime;
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.3, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(AUDIO.destination); o.start(t0); o.stop(t0 + dur);
  } catch {}
}
function flashNote(n) {
  const el = $("hover"); el.textContent = "♪ " + n.toUpperCase() + " ♪";
  clearTimeout(flashNote.t); flashNote.t = setTimeout(() => { if (el.textContent.startsWith("♪")) el.textContent = ""; }, 1100);
}
function noteVisit(n) {
  tone(NOTES[n]); flashNote(n);
  if (L && L.hitBar) L.hitBar(n);
  const f = S.flags;
  if (f.songDone) return;
  const step = f.songStep || 0;
  f.songStep = SONG[step] === n ? step + 1 : SONG[0] === n ? 1 : 0;   // a wrong note starts the song over
  if (f.songStep >= SONG.length) {
    f.songDone = true; save();
    setTimeout(() => { SONG.forEach((s, i) => setTimeout(() => { tone(NOTES[s], 0.4); if (L && L.hitBar) L.hitBar(s); }, i * 260)); }, 500);
    say([["", "Twinkle, twinkle, little star... The whole song plays on the giant xylophone!"], ["", "RUMBLE... A staircase comes down from the ceiling!"]]);
    return;
  }
  save();
}
LV.mansionMusic = () => {
  const L = newLevel("mansionMusic", "Mansion Music Hall");
  const RW = 15, RD = 9, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 4, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x2a1a20 });
  onWall(L, "left", R, doorTex("#3a2a20", "#6a5040"), 1.2, 2.2, 2.4, 0, { name: "Door back to the front hall", go: "mansion", stand: [-6.4, 2.4] });
  // the note-sheet hint pinned to the back wall
  const sheet = C(128, 96, (x) => {
    x.fillStyle = "#f2e6c8"; x.fillRect(0, 0, 128, 96);
    x.fillStyle = "#2a1f3d"; x.font = '6px "Press Start 2P", monospace'; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("TWINKLE TWINKLE", 64, 10); x.fillText("LITTLE STAR", 64, 20);
    x.fillText("DO DO SO SO", 64, 42); x.fillText("LA LA SO", 64, 54); x.fillText("FA FA MI MI", 64, 70); x.fillText("RE RE DO", 64, 82);
    x.fillStyle = "#f2c830"; [[12, 30], [116, 30], [20, 88], [108, 88]].forEach(([a, b]) => x.fillRect(a - 2, b - 2, 4, 4));
  }, false, 4);
  onWall(L, "back", R, sheet, 1.8, 1.35, -4.4, 1.2, { name: "Map of notes", stand: [-4.4, -3.2], say: () => [flag("got_songMap"),
    () => showPeek(sheet.userData.canvas.toDataURL(), "A map of notes: the song \"Twinkle Twinkle Little Star\".")] }, 0x6a3a8a);
  // the giant xylophone in the middle of the music hall
  const frame = new THREE.Group(); frame.position.set(0, 0, -1.2); L.scene.add(frame);
  const woodM = mat({ color: 0x5a3a22 }), goldM = mat({ color: 0xf2c830, em: 0.3 });
  [[-3.2, -0.75], [3.2, -0.75], [-3.2, 0.75], [3.2, 0.75]].forEach(([lx, lz]) => put(L, boxG(0.18, 0.72, 0.18), woodM, lx, 0, lz, 0, null, frame));
  put(L, boxG(6.8, 0.12, 0.16), woodM, 0, 0.64, -0.7, 0, null, frame);
  put(L, boxG(6.8, 0.12, 0.16), woodM, 0, 0.64, 0.7, 0, null, frame);
  const cols = { Do: "#e04e39", Re: "#f2913a", Mi: "#f2d23a", Fa: "#5ac85a", So: "#5ab8e8", La: "#6a6ae8", Ti: "#b86ae8" };
  const colsHex = { Do: 0xe04e39, Re: 0xf2913a, Mi: 0xf2d23a, Fa: 0x5ac85a, So: 0x5ab8e8, La: 0x6a6ae8, Ti: 0xb86ae8 };
  const bars = {}, barHits = {};
  XYL_NOTES.forEach((n, i) => {
    const bx = -2.7 + i * 0.9, bz = -1.2, len = 2.0 - i * 0.12;
    const g = group(L, bx, 0.76, bz, 0, { name: `${n} bar`, stand: [bx, 0.3], run: () => noteVisit(n) });
    const bm = mat({ color: colsHex[n], em: 0.25 });
    put(L, boxG(0.72, 0.14, len), bm, 0, 0, 0, 0, null, g);
    [-len * 0.34, len * 0.34].forEach((rz) => put(L, new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), goldM, 0, 0, rz, 0, null, g));
    const lbl = put(L, planeG(0.58, 0.34), mat({ map: label([n.toUpperCase()], 32, 16, cols[n], "#ffffff", "#2a1f3d"), em: 0.5 }), 0, 0.16, len * 0.22, 0, null, g);
    lbl.rotation.x = -0.9;
    put(L, planeG(0.66, 0.32), mat({ map: signTex(n.toUpperCase(), cols[n]), em: 0.4 }), 0, 0.55, -len * 0.5 - 0.05, 0, null, g);
    g.userData.bm = bm;
    bars[n] = g; barHits[n] = 0;
  });
  L.hitBar = (n) => { if (barHits[n] !== undefined) barHits[n] = 0.35; };
  const st = spiralStairs(L, 4.6, -1.8, 4.0, { name: "Staircase up", exit: true, go: "mansionTop", stand: [3.8, -0.8], show: () => !!S.flags.songDone });
  crew(L, -5.4, 2.6);
  L.walk = [-6.7, 6.7, -3.5, 3.9]; L.start = [-5.4, 2.6];
  L.entries = { mansion: [-5.8, 2.4], mansionTop: [3.8, -0.6] };
  L.onEnter = [["", "The wizard and the witch ran in here... a music hall with a giant xylophone!"],
    ["Apprentice", "They must be hiding somewhere up above. Look, each bar on the xylophone has a note on it!"]];
  L.light = { amb: 0x4a4050, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[0, 3, 0], 0xffb070, 9], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 12, 28]; L.bg = 0x0a080a;
  cam(L, [0, 6.6, 10.5], [0, 1, -1], 58);
  let down = S.flags.songDone ? 1 : 0;
  L.update = (t, dt) => {
    if (S.flags.songDone && down < 1) down = Math.min(1, down + (dt || 0.016) * 0.5);
    st.position.y = (1 - down) * 4;
    XYL_NOTES.forEach((n) => {
      const h = barHits[n] || 0, g = bars[n];
      if (h > 0) {
        barHits[n] = Math.max(0, h - (dt || 0.016));
        const k = h / 0.35;
        g.position.y = 0.76 - Math.sin(k * Math.PI) * 0.1;
        g.userData.bm.uniforms.uEm.value = 0.25 + k * 0.75;
      } else {
        g.position.y = 0.76;
        g.userData.bm.uniforms.uEm.value = 0.25;
      }
    });
  };
  return L;
};

// ---------- the top of the mansion: the wedding ----------
function weddingLines() {
  return [["May", "We're priests from The Witch's Ministry LLC... and we can marry people. Would you like us to marry you?"],
    ["Wizard", "Really?! Oh, YES!"], ["Witch", "...Well. I suppose he IS kind of sweet."],
    ["", "The kids marry the wizard and the witch! Everyone cheers."], flag("married"),
    ["", "The wizard and the witch are so happy, they stop fighting the kids."],
    ["Jasin", "So... why DO our things glow?"],
    ["Wizard", "Because you are very special kids. You were chosen by the great earth spirit to bring joy and kindness to the world."],
    ["Witch", "We were just grumpy because we were lonely. But now we're happy!"],
    ["", "And the world is going to be a more pleasant place."], () => finale()];
}
function topAct() {
  if (S.flags.married) return [["Wizard", "Thank you, kids!"]];
  return [{ choices: [["Offer to marry them", () => weddingLines()],
    ["Ask why they're so grumpy", () => [["Witch", "Hmph! None of your business."], ["Apprentice", "(Psst... remember the robes. Offer to marry them!)"]]]] }];
}
LV.mansionTop = () => {
  const L = newLevel("mansionTop", "Top of the Mansion");
  const RW = 10, RD = 6.5, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 3.6, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x8a3ac8 });
  onWall(L, "back", R, C(8, 8, (x) => { x.fillStyle = "#101030"; x.fillRect(0, 0, 8, 8); x.fillStyle = "#fff4c8"; x.fillRect(5, 1, 2, 2); }), 1.6, 1.2, 0, 1.6, null, 0x3a3048);
  spiralStairs(L, -4.2, 2.2, 1.2, { name: "Stairs down to the music hall", exit: true, go: "mansionMusic", stand: [-3.6, 1.8] });
  const wiz = addChar(L, "wizard", -0.9, -2.0, 1.9, { name: "Wizard", stand: [-0.4, -0.6], say: () => topAct() });
  const wit = addChar(L, "witch", 0.9, -2.0, 1.8, { name: "Witch", stand: [0.4, -0.6], say: () => topAct() });
  const ap = addChar(L, "apprentice", 3.4, -0.6, 1.5, { name: "Apprentice", say: [["Apprentice", "They're just lonely. Offer to marry them!"]] });
  const hearts = [0, 1, 2, 3].map((i) => {
    const hg = new THREE.Group(); hg.visible = false; L.scene.add(hg);
    const hm = mat({ color: i % 2 ? 0xff5a8a : 0xff9ab8, em: 0.9 });
    put(L, boxG(0.16, 0.16, 0.06), hm, 0, 0, 0, Math.PI / 4, null, hg);
    return hg;
  });
  crew(L, -2.8, 1.6);
  L.walk = [-4.3, 4.3, -1.0, 2.6]; L.start = [-2.8, 1.6];
  L.entries = { mansionMusic: [-3.2, 1.6] };
  L.onEnter = () => S.flags.married ? [] : [["", "At the top of the stairs: the wizard and the witch!"], ["Witch", "YOU pesky kids again?!"],
    ["Apprentice", "Psst... they're not really mean. They're just lonely."],
    ["Apprentice", "You're still wearing the witch's ministry robes... and a ministry can marry people!"], ...topAct()];
  L.light = { amb: 0x5a5068, dir: [0.3, -1, -0.5], dirCol: 0x403848, pts: [[[0, 3, -1], 0xffd8a0, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 10, 24]; L.bg = 0x0a080a;
  cam(L, [0, 3.4, 7.4], [0, 1.2, -1.2], 56);
  L.update = (t) => {
    const m = !!S.flags.married;
    if (m) {
      wiz.yOff = wit.yOff = Math.abs(Math.sin(t * 4)) * 0.15;
      ap.yOff = Math.abs(Math.sin(t * 4 + 1)) * 0.15;
    }
    hearts.forEach((h, i) => {
      h.visible = m;
      if (m) {
        const k = (t * 0.6 + i * 0.25) % 1;
        h.position.set((i - 1.5) * 0.55 + Math.sin(t * 3 + i) * 0.15, 1.8 + k * 1.4, -1.9);
        h.scale.setScalar(0.6 + Math.sin(k * Math.PI) * 0.6);
      }
    });
  };
  return L;
};

// ---------- going home ----------
function finale() {
  S.flags.finale = true; save();
  getLevel("beach").entered = true;
  goLevel("beach", "cut");
  setTimeout(() => say([["", "Back at the beach, the wizard, the witch, and the apprentice help fix the kids' spaceship."],
    ["Jon", "The engine is working again!"], flag("shipUp"),
    ["", "The smiling spaceship rises up out of the water!"], ["Everyone", "Bye! Thank you!"],
    ["", "And the kids fly on to Woolley Mountain, where they were going all along!"], flag("theEnd"),
    ["", "THE END. Thanks for playing Mysteries of Manor Konsz!"]]), 450);
}

// ---------- goals for chapter 5 ----------
function chaseGoal(here) {
  const f = S.flags;
  if (f.theEnd) return "THE END! The kids fly on to Woolley Mountain.";
  if (f.married) return "The wizard, the witch, and the apprentice are helping fix the ship!";
  if (f.songDone) return here === "mansionTop" ? "Talk to the wizard and the witch." : "A staircase came down from the ceiling in the music hall. Climb up!";
  if (f.chaseDone) {
    if (here === "mansionMusic") return f.got_songMap ? "Play \"Twinkle Twinkle Little Star\" on the giant xylophone!" : "A giant xylophone! Check the map of notes on the wall to see which song to play.";
    return here === "mansionOut" || here === "mansion" ? "The wizard and the witch ran into the mansion! Look for them inside." : "Drive to the secret mansion. The wizard and the witch are hiding inside!";
  }
  if (f.apprJoined) return `Catch the witch's walking house! On the road map, look for the wind: that's where it's going next. (Caught ${f.chaseStep || 0} of 3)`;
  if (here === "atrium") return "Slide down the emergency exit!";
  return "Where did the witch's house go? Maybe someone at the swamp knows something...";
}
