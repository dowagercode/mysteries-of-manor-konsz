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
  const wind = new THREE.Group(); L.scene.add(wind);
  [0.5, 0.8, 1.1].forEach((r, i) => {
    const pts = []; for (let k = 0; k <= 20; k++) { const a = k / 20 * Math.PI * 1.6; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.4 + i * 0.35, Math.sin(a) * r)); }
    line(L, lineG(pts), 0xffffff, wind);
  });
  const feathers = new THREE.Group(); L.scene.add(feathers);
  [[-0.5, 0.3, 0.4], [0.4, 0.5, -0.6], [0.1, -0.4, 1.2], [-0.2, -0.6, 2.0]].forEach(([x, z, r]) => {
    const f = put(L, planeG(0.16, 0.42), mat({ color: 0xfff8f0, em: 0.5, side: THREE.DoubleSide }), x, 0.05, z, r, null, feathers); f.rotation.x = -1.3;
  });
  return (t) => {
    const on = chaseOn();
    wind.visible = feathers.visible = on;
    if (!on) return;
    const at = MAP_NODES[CHASE[S.flags.chaseStep || 0]].pos, was = MAP_NODES[chaseLast()].pos;
    wind.position.set(at[0], 0.4, at[1]); wind.rotation.y = t * 3;
    feathers.position.set(was[0] + 0.9, 0, was[1] + 0.5);
  };
}
function chaseArrive(id) {
  if (!chaseOn()) return;
  const f = S.flags, step = f.chaseStep || 0;
  let lines = null;
  if (id === CHASE[step] && step < 2) lines = [["", "There it is! The witch's house, on its big chicken legs!"], ["Witch's house", "BAWK! BAWK!"],
    ["", "The house jumps up and runs away, leaving chicken feathers everywhere!"], () => { f.chaseStep = step + 1; save(); },
    ["Apprentice", "Quick! Go back to the road map and look for the wind. That's where it's going next!"]];
  else if (id === CHASE[step]) lines = [["", "The witch's house! It's resting in front of the secret mansion. It's all tired out from running!"],
    ["", "The kids climb inside the house..."], ["", "...but the wizard and the witch run out the back door, into the secret mansion!"],
    () => { f.chaseStep = 3; f.chaseDone = true; save(); }, ["Apprentice", "After them!"]];
  else if (id === chaseLast()) lines = [["", "Chicken feathers! The witch's house was here... but it's gone now."]];
  if (lines) setTimeout(() => say(lines), 450);
}

// ---------- the secret mansion: outside, and the music maze ----------
function chickenHouse(L, parent) {
  const legM = mat({ color: 0xd8a040 });
  [-0.6, 0.6].forEach((lx) => {
    put(L, boxG(0.16, 2.0, 0.16), legM, lx, 0, 0, 0, null, parent);
    put(L, boxG(0.6, 0.08, 0.15), legM, lx, 0, 0.2, 0, null, parent);
  });
  put(L, boxG(2.6, 1.8, 2.0), mat({ color: 0x6a5a40 }), 0, 2.0, 0, 0, null, parent);
  put(L, new THREE.ConeGeometry(1.9, 1.4, 4).rotateY(Math.PI / 4), mat({ color: 0x4a3a2a }), 0, 4.5, 0, 0, null, parent);
  put(L, planeG(0.6, 0.9), mat({ color: 0x2a1a10 }), 0, 2.2, 1.01, 0, null, parent);
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
  const ch = group(L, 5.2, 0, -4.4, -0.5, { name: "The witch's house", stand: [3.8, -2.4], show: () => !!S.flags.chaseDone,
    say: [["", "The witch's house, resting on its chicken legs. It's empty now."]] });
  chickenHouse(L, ch);
  [[-7, -3], [-8, 1], [7.5, 1.5], [-6, 3.5]].forEach(([x, z]) => tree(L, x, z, 1.4, 0x1e2a1e));
  const jeep = group(L, -4.6, 0, 3.4, 0.5, toJeep([-3.4, 2.8])); miniJeep(L, jeep);
  crew(L, -2.6, 2.6);
  L.walk = [-6, 6, -5.8, 4.4]; L.start = [-2.6, 2.6];
  L.entries = { roadmap: [-3.0, 2.8], mansion: [0, -5.2] };
  L.onEnter = [["", "The secret mansion is HUGE from the outside. Very, very creepy..."]];
  L.light = { amb: 0x50506a, dir: [0.3, -1, -0.5], dirCol: 0x404060, pts: [[[0, 3, -6], 0xffb070, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x101020, 14, 50]; L.bg = 0x101020;
  cam(L, [0, 4.4, 10.5], [0, 2.2, -4], 56, null, 200);
  return L;
};
const NOTES = { Do: 261.63, Re: 293.66, Mi: 329.63, Fa: 349.23, So: 392.0, La: 440.0, Ti: 493.88 };
const SONG = ["Do", "Do", "So", "So", "La", "La", "So", "Fa", "Fa", "Mi", "Mi", "Re", "Re", "Do"];   // Twinkle Twinkle Little Star
const MUSIC_DOORS = ["Mi", "Ti", "Do", "La", "Re", "So", "Fa"];   // where each door is in the music hall (mixed up, like a maze)
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
  const f = S.flags;
  if (f.songDone) return;
  const step = f.songStep || 0;
  f.songStep = SONG[step] === n ? step + 1 : SONG[0] === n ? 1 : 0;   // a wrong note starts the song over
  if (f.songStep >= SONG.length) {
    f.songDone = true; save();
    setTimeout(() => { SONG.forEach((s, i) => setTimeout(() => tone(NOTES[s], 0.4), i * 260)); }, 500);
    say([["", "Twinkle, twinkle, little star... The whole song plays through the mansion!"], ["", "RUMBLE... A staircase comes down from the ceiling!"]]);
    return;
  }
  save();
}
LV.mansionMusic = () => {
  const L = newLevel("mansionMusic", "Mansion Music Hall");
  const RW = 15, RD = 9, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 4, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x2a1a20 });
  const spots = [["back", -5.4], ["back", -1.8], ["back", 1.8], ["back", 5.4], ["left", -1.6], ["right", -1.6], ["right", 1.8]];
  const stand = (side, a) => side === "back" ? [a, -3.4] : side === "left" ? [-6.4, a] : [6.4, a];
  const cols = { Do: "#e04e39", Re: "#f2913a", Mi: "#f2d23a", Fa: "#5ac85a", So: "#5ab8e8", La: "#6a6ae8", Ti: "#b86ae8" };
  MUSIC_DOORS.forEach((n, k) => {
    const [side, a] = spots[k];
    const g = onWall(L, side, R, doorTex("#3a2a20", cols[n]), 1.15, 2.1, a, 0, { name: `Door to the ${n} room`, exit: true, stand: stand(side, a),
      run: () => { noteVisit(n); if (n === "Ti") goLevel("mn_Ti", "mansionMusic"); } });
    onWall(L, side, R, signTex("♪ " + n.toUpperCase(), cols[n]), 0.9, 0.32, a, 2.4, null);
    g.userData.note = n;
  });
  onWall(L, "left", R, doorTex("#3a2a20", "#6a5040"), 1.2, 2.2, 2.4, 0, { name: "Door back to the front hall", go: "mansion", stand: [-6.4, 2.4] });
  const st = spiralStairs(L, 0, 0.2, 4.0, { name: "Staircase up", exit: true, go: "mansionTop", stand: [0.9, 1.4], show: () => !!S.flags.songDone });
  crew(L, -5.4, 2.6);
  L.walk = [-6.7, 6.7, -3.5, 3.9]; L.start = [-5.4, 2.6];
  L.entries = { mansion: [-5.8, 2.4], mn_Ti: stand(...spots[1]), mansionTop: [0.9, 1.6] };
  L.onEnter = [["", "The wizard and the witch ran in here... a hall full of doors. Each one has a music note on it!"], ["Apprentice", "They must be hiding somewhere up above. Listen... each room plays a note!"]];
  L.light = { amb: 0x4a4050, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[0, 3, 0], 0xffb070, 9], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 12, 28]; L.bg = 0x0a080a;
  cam(L, [0, 6.6, 10.5], [0, 1, -1], 58);
  let down = S.flags.songDone ? 1 : 0;
  L.update = (t, dt) => { if (S.flags.songDone && down < 1) down = Math.min(1, down + (dt || 0.016) * 0.5); st.position.y = (1 - down) * 4; };
  return L;
};
LV.mn_Ti = () => {
  const L = newLevel("mn_Ti", "Ti Room");
  const RW = 8, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x6a3a8a });
  onWall(L, "left", R, doorTex("#3a2a20", "#b86ae8"), 1.15, 2.1, 1.2, 0, { name: "Door back to the music hall", go: "mansionMusic", stand: [-3.4, 1.2] });
  const sheet = C(128, 96, (x) => {
    x.fillStyle = "#f2e6c8"; x.fillRect(0, 0, 128, 96);
    x.fillStyle = "#2a1f3d"; x.font = '6px "Press Start 2P", monospace'; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("TWINKLE TWINKLE", 64, 10); x.fillText("LITTLE STAR", 64, 20);
    x.fillText("DO DO SO SO", 64, 42); x.fillText("LA LA SO", 64, 54); x.fillText("FA FA MI MI", 64, 70); x.fillText("RE RE DO", 64, 82);
    x.fillStyle = "#f2c830"; [[12, 30], [116, 30], [20, 88], [108, 88]].forEach(([a, b]) => x.fillRect(a - 2, b - 2, 4, 4));
  }, false, 4);
  onWall(L, "back", R, sheet, 1.8, 1.35, 0.4, 1.0, { name: "Map of notes", say: () => [flag("got_songMap"),
    () => showPeek(sheet.userData.canvas.toDataURL(), "A map of notes: the song \"Twinkle Twinkle Little Star\".")] }, 0x6a3a8a);
  crew(L, -2.6, 1.4);
  L.walk = [-3.4, 3.4, -1.3, 2.4]; L.start = [-2.6, 1.4];
  L.entries = { mansionMusic: [-2.8, 1.2] };
  L.onEnter = [["", "The Ti room. There's something pinned to the wall..."]];
  L.light = { amb: 0x5a5060, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[0, 2.6, 0], 0xd8b0ff, 7], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 10, 24]; L.bg = 0x0a080a;
  cam(L, [0.2, 3.0, 6.2], [0.2, 1.1, -1.2], 54);
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
  crew(L, -2.8, 1.6);
  L.walk = [-4.3, 4.3, -1.0, 2.6]; L.start = [-2.8, 1.6];
  L.entries = { mansionMusic: [-3.2, 1.6] };
  L.onEnter = () => S.flags.married ? [] : [["", "At the top of the stairs: the wizard and the witch!"], ["Witch", "YOU pesky kids again?!"],
    ["Apprentice", "Psst... they're not really mean. They're just lonely."],
    ["Apprentice", "You're still wearing the witch's ministry robes... and a ministry can marry people!"], ...topAct()];
  L.light = { amb: 0x5a5068, dir: [0.3, -1, -0.5], dirCol: 0x403848, pts: [[[0, 3, -1], 0xffd8a0, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 10, 24]; L.bg = 0x0a080a;
  cam(L, [0, 3.4, 7.4], [0, 1.2, -1.2], 56);
  L.update = (t) => { if (S.flags.married) { wiz.yOff = wit.yOff = Math.abs(Math.sin(t * 4)) * 0.15; ap.yOff = Math.abs(Math.sin(t * 4 + 1)) * 0.15; } };
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
    if (here === "mansionMusic" || here === "mn_Ti") return f.got_songMap ? "Play \"Twinkle Twinkle Little Star\": go into the rooms in the order of the notes on the map." : "Each room plays a note. Is there a hint in one of the rooms?";
    return here === "mansionOut" || here === "mansion" ? "The wizard and the witch ran into the mansion! Look for them inside." : "Drive to the secret mansion. The wizard and the witch are hiding inside!";
  }
  if (f.apprJoined) return `Catch the witch's walking house! On the road map, look for the wind: that's where it's going next. (Caught ${f.chaseStep || 0} of 3)`;
  if (here === "atrium") return "Slide down the emergency exit!";
  return "Where did the witch's house go? Maybe someone at the swamp knows something...";
}
