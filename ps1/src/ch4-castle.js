// ch4-castle.js: Chapter 4: the wizard's castle. Outside (cloud-pattern rocks, the gigantic door, the truck entrance),
// then inside (tea with the wizard, the wheel-of-the-year hall, the sphinx, the hall of mirrors, the atrium and the dogs of darkness).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- castle textures (made the first time a castle room is built) ----------
let CTX = null;
function stoneTex(base, line, n = 60) {
  return C(32, 32, (x) => {
    x.fillStyle = base; x.fillRect(0, 0, 32, 32);
    noise(x, 32, 32, [line, "#00000022"], n);
    x.fillStyle = line;
    for (let r = 0; r < 4; r++) { x.fillRect(0, r * 8, 32, 1); for (let c = 0; c < 2; c++) x.fillRect(((c * 16) + (r % 2) * 8) % 32, r * 8, 1, 8); }
  });
}
function CT() {
  if (CTX) return CTX;
  CTX = {
    wall: stoneTex("#6a6070", "#4a4252"), floor: stoneTex("#4e4858", "#3a3444", 40), kitchen: stoneTex("#7a6a58", "#5a4a3a"),
    tiles: C(16, 16, (x) => { x.fillStyle = "#2a2440"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#4a3a6a"; x.fillRect(0, 0, 8, 8); x.fillRect(8, 8, 8, 8); }),
    chart: C(128, 128, (x) => {
      x.fillStyle = "#f2e6c8"; x.fillRect(0, 0, 128, 128);
      const cols = ["#5a3a6a", "#3a6a8a", "#c8d8e8", "#9ad08a", "#f29bb0", "#f2c830", "#d8a040", "#b8603a"];
      for (let i = 0; i < 8; i++) {
        x.fillStyle = cols[i]; x.beginPath(); x.moveTo(64, 64);
        x.arc(64, 64, 54, -Math.PI / 2 + (i - 0.5) * Math.PI / 4, -Math.PI / 2 + (i + 0.5) * Math.PI / 4); x.fill();
      }
      x.fillStyle = "#f2e6c8"; x.beginPath(); x.arc(64, 64, 14, 0, 7); x.fill();
      x.fillStyle = "#2a1f3d"; x.font = '5px "Press Start 2P", monospace'; x.textAlign = "center"; x.textBaseline = "middle";
      WHEEL.forEach((n, i) => {
        const a = -Math.PI / 2 + i * Math.PI / 4;
        x.fillText((i + 1) + "", 64 + Math.cos(a) * 22, 64 + Math.sin(a) * 22);
        x.fillText(n.length > 7 ? n.slice(0, 6) + "." : n, 64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40);
      });
      x.fillText("START", 64, 64);
    }, false, 4),
  };
  return CTX;
}
const doorC = (fill) => doorTex("#3a3048", fill);

// ---------- outside: the dangerous rocks ----------
function newRockPattern() { S.rockPat = [0, 1, 2].map(() => Math.floor(rnd() * 3)); S.rockStep = 0; }
function rockAct(row, col) {
  if (S.flags.rocksDone) return [];
  if (!S.rockPat) newRockPattern();
  if (row !== S.rockStep) return [];
  if (S.rockPat[row] === col) {
    S.rockStep++;
    if (S.rockStep >= 3) return [() => { S.flags.rocksDone = true; save(); L.player.pos.set(0, -16.5); L.player.target = null; }, ["", "May hops from rock to rock, just like the pattern in the clouds... and makes it to the gigantic front door!"]];
    return [];
  }
  return [() => { if (L && L.wobbleRock) L.wobbleRock(row, col); newRockPattern(); L.player.pos.set(0, 3); L.player.target = null; S.flags.slipped = true; save(); },
    ["", "The rock wobbles! May slips and slides back down to the start. Look... the clouds are changing their pattern!"]];
}

// ---------- the gigantic door: the disguise, and the wizard's invitation ----------
function wizardInvite() {
  return [["May", "Hello! We're priests from The Witch's Ministry LLC. Would you like to join the witch's ministry?"],
    ["Wizard", "The witch sent you? Finally, she noticed me!"],
    ["", "(The wizard has a secret crush on the witch. He wants her to be his girlfriend!)"],
    ["Wizard", "Come in, come in! Have some lemonade and muffins!"], flag("inCastle"), () => goLevel("reception", "castle")];
}
function doorAct() {
  const f = S.flags;
  if (f.inCastle) return [() => goLevel("reception", "castle")];
  if (f.wizardOut) return wizardInvite();
  if (!has("robes")) return [["", "The gigantic front door is shut tight. Nobody would let a bunch of kids in... maybe a disguise would help?"]];
  return [() => remove("robes"), ["", "The kids put on the priest robes from the witch's ministry. Nobody will know it's them!"],
    ["", "BOOM. BOOM. BOOM. They knock on the gigantic door..."], ["", "The gigantic door creaks open... and the wizard peeks out!"], flag("wizardOut"),
    ...wizardInvite()];
}
LV.castle = () => {
  const L = newLevel("castle", "The Wizard's Castle");
  outdoor(L, T.greySky, T.rock, [14, 18], [40, 50]);
  // the castle, far away up the mountain
  const cas = new THREE.Group(); cas.position.set(0, 0, -24); L.scene.add(cas);
  const cm = mat({ color: 0x6a6070 });
  put(L, boxG(10, 6, 4), cm, 0, 0, 0, 0, null, cas);
  [[-5, 11, 0.3], [5, 9, -0.3], [-2.5, 8, 0.2], [2.8, 10, -0.2], [0, 13, 0]].forEach(([x, h, tw]) => {
    const tower = put(L, new THREE.CylinderGeometry(0.7, 1.0, h, 7), cm, x, h / 2, 0.5, 0, null, cas); tower.rotation.z = tw * 0.4;
    put(L, new THREE.ConeGeometry(0.9, 2.4, 7), mat({ color: 0x3a3048 }), x - tw * h * 0.2, h + 1, 0.5, 0, null, cas);
  });
  put(L, planeG(1.4, 0.8), mat({ color: 0x8a3ac8, side: THREE.DoubleSide }), 0.7, 14.5, 0.5, 0, null, cas);
  put(L, new THREE.RingGeometry(0.7, 0.9, 12), mat({ color: 0x2a2030 }), 0, 4.5, 2.05, 0, null, cas);
  put(L, new THREE.CircleGeometry(0.7, 12), mat({ color: 0xffe08a, em: 1 }), 0, 4.5, 2.04, 0, null, cas);
  put(L, new THREE.RingGeometry(1.4, 2.2, 16, 1, 0.6, 3.6), mat({ color: 0xfff4c8, em: 1, fog: 0 }), 14, 22, -40, 0);
  // the gigantic front door
  const door = group(L, 0, 0, -21.8, 0, { name: "Gigantic front door", exit: true, stand: [0, -17.4], show: () => !!S.flags.rocksDone, run: () => say(doorAct()), use: { robes: doorAct } });
  put(L, planeG(3.2, 5.2), mat({ color: 0x120c18 }), 0, 0, -0.04, 0, null, door);
  const doorHinge = new THREE.Group(); doorHinge.position.set(-1.6, 0, 0); door.add(doorHinge);
  put(L, planeG(3.2, 5.2), mat({ map: T.bigDoor, side: THREE.DoubleSide }), 1.6, 0, 0, 0, null, doorHinge);
  const wiz = addChar(L, "wizard", 0.9, -20.6, 1.9, { name: "Wizard", stand: [0, -17.4], say: () => doorAct() });
  wiz.show = wiz.body.userData.hot.show = () => !!S.flags.wizardOut && !S.flags.inCastle;
  // the dangerous rocks: copy the pattern in the clouds
  const COLS = [-2.4, 0, 2.4], ROWS = [-1.6, -6.6, -11.6], rockMeshes = {};
  ROWS.forEach((rz, r) => COLS.forEach((cx, c) => {
    const g = group(L, cx, 0, rz, 0, { name: "Rock", stand: [cx, rz + 0.3], show: () => !S.flags.rocksDone && (S.rockStep || 0) === r, say: () => rockAct(r, c) });
    const m = put(L, new THREE.DodecahedronGeometry(0.8, 0), mat({ color: 0x7a7080 }), 0, 0.25, 0, 0, null, g); m.rotation.set(r + c, c, 0);
    rockMeshes[r + "_" + c] = g;
  }));
  let wobKey = "", wobT = -1;
  L.wobbleRock = (r, c) => { wobKey = r + "_" + c; wobT = 0; };
  [[-6, -9, 2.4], [6.5, -12, 2.8], [-7, -16, 3], [7, -4, 2], [-5.5, -2, 1.6]].forEach(([x, z, s]) => {
    const m = put(L, new THREE.DodecahedronGeometry(s, 0), mat({ color: 0x5a5262 }), x, s * 0.5, z); m.rotation.set(x, z, 0);
  });
  const clouds = [-6, 0, 6].map((x) => {
    const g = new THREE.Group(); g.position.set(x, 11, -16); L.scene.add(g);
    const cmat = mat({ color: 0xd8d8e0, em: 0.4, fog: 0 });
    [[0, 0, 1.4], [1.3, -0.2, 1.0], [-1.3, -0.2, 1.1], [0.5, 0.6, 0.9]].forEach(([a, b, s]) => put(L, new THREE.SphereGeometry(s, 7, 5), cmat, a, b, 0, 0, null, g));
    g.userData.mat = cmat;
    return g;
  });
  const jeep = group(L, 6.5, 0, 4.4, -0.5, toJeep([5.2, 3.6])); miniJeep(L, jeep);
  signpost(L, -6.4, 3.4, "< AROUND BACK", { name: "Path around behind the castle", exit: true, go: "castleBack", stand: [-5.8, 3.2] });
  crew(L, 0, 3.2);
  L.walk = [-5, 5, 2.4, 5.5]; L.start = [0, 3.2];
  L.entries = { roadmap: [4.6, 3.4], castleBack: [-5.2, 3.2], reception: [0, -17], atrium: [0, -16.4] };
  L.onEnter = () => S.flags.rocksDone ? [] : [["", "A vast, barren landscape up in the mountain. The wizard's castle is very far away..."],
    ["", "The gigantic front door is closed, and very dangerous rocks are in the way. Up in the sky, the clouds are drifting in a strange pattern..."]];
  L.light = { amb: 0x707080, dir: [0.4, -1, -0.5], dirCol: 0x606070, pts: [[[0, 5, -22], 0xffe08a, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x8a8a98, 18, 70]; L.bg = 0x8a8a98;
  cam(L, [0, 5.5, 11], [0, 2.5, -8], 56, (p) => p.y > -14, 200);
  cam(L, [3.5, 3.0, -11], [0, 2.4, -21], 56, null, 200);
  L.update = (t, dt) => {
    if (S.flags.rocksDone) { L.walk = [-5, 5, -18, 5.5]; } else { L.walk = [-5, 5, 2.4, 5.5]; if (!S.rockPat) newRockPattern(); }
    doorHinge.rotation.y += (((S.flags.wizardOut || S.flags.inCastle) ? -0.75 : 0) - doorHinge.rotation.y) * Math.min(1, (dt || 0.016) * 5);
    if (wobT >= 0) {
      wobT += dt || 0.016;
      const rg = rockMeshes[wobKey];
      if (rg) rg.rotation.z = wobT < 0.7 ? Math.sin(wobT * 28) * 0.35 * (1 - wobT / 0.7) : 0;
      if (wobT >= 0.7) wobT = -1;
    }
    // the clouds puff in the order of the safe rocks, then pause, over and over
    const seq = S.rockPat || [0, 1, 2], cyc = t % 4.2, idx = Math.floor(cyc / 0.9);
    clouds.forEach((g, c) => {
      const lit = !S.flags.rocksDone && idx < 3 && seq[idx] === c;
      g.userData.mat.uniforms.uEm.value = lit ? 1 : 0.35;
      g.scale.setScalar(lit ? 1.25 : 1);
      g.position.y = 11 + Math.sin(t * 0.5 + c) * 0.3;
    });
  };
  return L;
};
LV.castleBack = () => {
  const L = newLevel("castleBack", "Behind the Castle");
  outdoor(L, T.greySky, T.rock, [14, 10]);
  const wall = new THREE.Group(); wall.position.set(0, 0, -7); L.scene.add(wall);
  put(L, boxG(16, 7, 2), mat({ color: 0x6a6070 }), 0, 0, 0, 0, null, wall);
  const garage = group(L, 0.5, 0, -5.95, 0, { name: "Truck entrance", exit: true, stand: [0.5, -3.4], go: "castleKitchen" });
  put(L, planeG(4, 3.2), mat({ map: T.garage }), 0, 0, 0, 0, null, garage);
  const truck = group(L, -4.2, 0, -3.6, 0.3, { name: "Old truck", say: [["", "An old delivery truck. What does the wizard get delivered?"]] });
  put(L, boxG(2.6, 1.8, 1.5), mat({ color: 0x8a8a90 }), 0.4, 0.4, 0, 0, null, truck);
  put(L, boxG(1.1, 1.2, 1.4), mat({ color: 0x5a6a8a }), -1.5, 0.4, 0, 0, null, truck);
  [[-1.4, 0.75], [1.0, 0.75], [-1.4, -0.75], [1.0, -0.75]].forEach(([a, b]) => { const w = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10); w.rotateX(Math.PI / 2); put(L, w, mat({ color: 0x1a1a1e }), a, 0.4, b, 0, null, truck); });
  crew(L, 2, 2.4);
  L.walk = [-6, 6, -3.6, 4]; L.start = [2, 2.4];
  L.entries = { castle: [5.4, 2.6], castleKitchen: [0.5, -3.2] };
  signpost(L, 6.4, 3.0, "FRONT >", { name: "Path back to the front", exit: true, go: "castle", stand: [5.8, 2.8] });
  L.onEnter = [["", "Around behind the castle... there's a truck entrance!"]];
  L.light = { amb: 0x707080, dir: [0.4, -1, -0.5], dirCol: 0x606070, pts: [[[0.5, 3, -4], 0xffe08a, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x8a8a98, 14, 50]; L.bg = 0x8a8a98;
  cam(L, [1, 4.4, 10], [0, 1.4, -3], 54, null, 200);
  return L;
};

// ---------- inside: the castle kitchen (from the truck entrance) ----------
function muffins(L, parent, x, y, z, n = 4) {
  for (let i = 0; i < n; i++) {
    put(L, new THREE.CylinderGeometry(0.11, 0.08, 0.14, 8), mat({ color: 0xc8843a }), x + (i % 2) * 0.26 - 0.13, y, z + Math.floor(i / 2) * 0.26 - 0.13, 0, null, parent);
    put(L, new THREE.SphereGeometry(0.12, 8, 5), mat({ color: 0x8a5a2a }), x + (i % 2) * 0.26 - 0.13, y + 0.15, z + Math.floor(i / 2) * 0.26 - 0.13, 0, null, parent);
  }
}
function lemonade(L, parent, x, y, z) {
  put(L, new THREE.CylinderGeometry(0.18, 0.2, 0.5, 10), mat({ color: 0xf6e470, em: 0.3 }), x, y, z, 0, null, parent);
  put(L, new THREE.CylinderGeometry(0.19, 0.19, 0.04, 10), mat({ color: 0xffffff }), x, y + 0.5, z, 0, null, parent);
}
LV.castleKitchen = () => {
  const L = newLevel("castleKitchen", "Castle Kitchen");
  const RW = 10, RD = 6.5, R = [RW, RD], tx = CT();
  room(L, { w: RW, d: RD, wall: tx.kitchen, floor: tx.floor, ceil: 0x3a3040, trim: 0x3a3048 });
  onWall(L, "right", R, doorC("#8a6a4a"), 1.4, 2.4, 1.2, 0, { name: "Truck entrance", go: "castleBack", stand: [4.3, 1.2] });
  onWall(L, "left", R, doorC("#6a4a8a"), 1.2, 2.2, -0.8, 0, { name: "Door to the reception hall", exit: true, stand: [-4.3, -0.8],
    run: () => S.flags.inCastle ? goLevel("reception", "castleKitchen")
      : say([["", "Through the door, somebody is humming... it's the wizard!"], ["", "Sneaking in won't work. Maybe knock at the gigantic front door, in a disguise?"]]) });
  const stove = group(L, -2.4, 0, -2.7, 0, { name: "Big old stove", say: [["", "A big old stove. It smells like muffins in here!"]] });
  put(L, boxG(1.8, 1.0, 0.9), mat({ color: 0x2a2a2e }), 0, 0, 0, 0, null, stove);
  put(L, boxG(0.5, 1.4, 0.5), mat({ color: 0x3a3a3e }), 0.6, 1.0, -0.1, 0, null, stove);
  const counter = group(L, 1.6, 0, -2.75, 0, { name: "Counter", say: [["", "Fresh muffins and a pitcher of lemonade. Somebody is having a snack party..."]] });
  put(L, boxG(3.0, 0.95, 0.8), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, counter);
  muffins(L, counter, -0.6, 1.02, 0); lemonade(L, counter, 0.7, 0.95, 0);
  [[3.6, -2.6], [4.1, -2.0]].forEach(([sx, sz]) => put(L, boxG(0.6, 0.8, 0.5), mat({ color: 0xd8c8a0 }), sx, 0, sz, 0.3));
  crew(L, 2.5, 1.6);
  L.walk = [-4.3, 4.3, -1.9, 2.6]; L.start = [2.5, 1.6];
  L.entries = { castleBack: [3.6, 1.2], reception: [-3.6, -0.6] };
  L.onEnter = [["", "The truck entrance leads into the castle kitchen. It smells like muffins!"]];
  L.light = { amb: 0x6a6070, dir: [0.2, -1, -0.5], dirCol: 0x504858, pts: [[[-2.4, 1.6, -2.2], 0xff9a50, 4], [[0, 3, 1], 0xd8c8a0, 8], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 10, 24]; L.bg = 0x14101a;
  cam(L, [0.4, 3.2, 6.8], [0, 1.1, -1.4], 54);
  return L;
};

// ---------- inside: the reception hall (tea with the wizard) ----------
function addPoof(L, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.visible = false; L.scene.add(g);
  const puffs = [0, 1, 2, 3, 4, 5].map((i) => put(L, new THREE.SphereGeometry(0.32, 7, 5), mat({ color: i % 2 ? 0xb06aff : 0xe0b0ff, em: 0.9 }), 0, 0.9, 0, 0, null, g));
  let poofT = -1;
  L.poof = () => { poofT = 0; };
  return (t, dt) => {
    if (poofT < 0) { g.visible = false; return; }
    poofT += dt || 0.016;
    g.visible = poofT < 1.2;
    puffs.forEach((p, i) => {
      const a = i / 6 * Math.PI * 2 + poofT * 3, r = poofT * 1.1;
      p.position.set(Math.cos(a) * r, 0.7 + poofT * 1.4 + (i % 2) * 0.25, Math.sin(a) * r);
      p.scale.setScalar(Math.max(0.01, (1 - poofT / 1.2) * 1.5));
    });
    if (poofT >= 1.2) poofT = -1;
  };
}
function teaLines() {
  const gone = [["Wizard", "Hmm... HMMMM."], ["Wizard", "Everybody in her ministry knows she only drinks TEA!"],
    () => { if (L && L.poof) L.poof(); S.flags.wizardGone = true; save(); },
    ["", "POOF! The wizard disappears in a puff of purple smoke!"],
    ["", "Where he was sitting, a spiral staircase winds up into the castle..."]];
  return [["", "The wizard pours lemonade and passes around muffins. Everyone is very polite."],
    ["Wizard", "So! How is the witch? Does she ever talk about me?"], ["May", "Um... yes! All the time!"],
    ["Jasin", "Mr. Wizard, may we ask you something? My soccer ball started glowing."], ["Olivia", "And my tutu! Do you know why?"],
    ["Wizard", "Ahh, the glowing! Well, you see, things glow when..."],
    ["Wizard", "Wait. First, a little question. You work for her, so you'll know this one."],
    ["Wizard", "What is her favorite way to drink coffee?"],
    { choices: [["With milk and sugar", () => gone], ["Black, no sugar", () => gone], ["Iced, with whipped cream", () => gone], ["Um... we're not sure", () => gone]] }];
}
function spiralStairs(L, x, z, h, hot) {
  const g = group(L, x, 0, z, 0, hot), sm = mat({ color: 0x8a7a98 });
  put(L, new THREE.CylinderGeometry(0.12, 0.12, h, 6), mat({ color: 0x4a4252 }), 0, h / 2, 0, 0, null, g);
  const n = Math.round(h / 0.3);
  for (let i = 0; i < n; i++) { const s = put(L, boxG(1.0, 0.1, 0.4), sm, 0, i * 0.3, 0, 0, null, g); s.geometry = s.geometry.clone().translate(0.5, 0, 0); s.rotation.y = i * 0.5; }
  return g;
}
LV.reception = () => {
  const L = newLevel("reception", "Reception Hall");
  const RW = 12, RD = 7, R = [RW, RD], tx = CT();
  room(L, { w: RW, d: RD, h: 4, wall: tx.wall, floor: tx.tiles, floorRep: 1.2, ceil: 0x2a2434, trim: 0x8a3ac8 });
  onWall(L, "right", R, T.bigDoor, 1.8, 3.2, 1.2, 0, { name: "Gigantic front door", go: "castle", stand: [5.2, 1.2] });
  onWall(L, "left", R, doorC("#6a4a8a"), 1.2, 2.2, 1.2, 0, { name: "Door to the kitchen", go: "castleKitchen", stand: [-5.2, 1.2] });
  onWall(L, "back", R, C(8, 8, (x) => { x.fillStyle = "#1a1a3a"; x.fillRect(0, 0, 8, 8); x.fillStyle = "#fff4c8"; x.fillRect(5, 1, 2, 2); }), 1.4, 1.4, -2.6, 1.8, null, 0x3a3048);
  const table = group(L, 0, 0, -1.4, 0, { name: "Snack table", stand: [0, -0.2], say: () => S.flags.wizardGone ? [["", "Half-eaten muffins and lemonade. The wizard's chair is empty."]] : teaLines() });
  put(L, boxG(4.2, 0.85, 1.4), mat({ color: 0x5a3a2a }), 0, 0, 0, 0, null, table);
  put(L, boxG(4.3, 0.04, 1.5), mat({ color: 0xe8e0f0 }), 0, 0.85, 0, 0, null, table);
  muffins(L, table, -0.8, 0.95, 0); lemonade(L, table, 0.7, 0.9, -0.1);
  [-1.6, 1.6].forEach((cx) => put(L, new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), mat({ color: 0xf6e470, em: 0.3 }), cx, 0.9, 0.3, 0, null, table));
  const chair = put(L, boxG(0.9, 1.8, 0.4), mat({ color: 0x8a3ac8 }), 0, 0, -2.9);
  const wiz = addChar(L, "wizard", 0, -2.4, 1.9, { name: "Wizard", stand: [0, -0.2], say: () => teaLines() });
  wiz.show = wiz.body.userData.hot.show = () => !S.flags.wizardGone;
  const stepPoof = addPoof(L, 0, -2.4);
  spiralStairs(L, 4.4, -2.4, 3.6, { name: "Spiral staircase up", exit: true, go: "wheelHall", stand: [3.6, -1.4], show: () => !!S.flags.wizardGone });
  crew(L, 3.8, 1.4);
  L.walk = [-5.3, 5.3, -0.3, 2.9]; L.start = [3.8, 1.4];
  L.entries = { castle: [4.6, 1.3], castleKitchen: [-4.6, 1.2], wheelHall: [3.4, -1.0] };
  L.onEnter = () => S.flags.wizardGone ? [] : teaLines();
  L.light = { amb: 0x6a6078, dir: [0.2, -1, -0.5], dirCol: 0x504858, pts: [[[0, 2.4, -1.4], 0xffd890, 6], [[4.4, 3, -2.4], 0xb08aff, 5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 12, 28]; L.bg = 0x14101a;
  cam(L, [0, 3.8, 8.2], [0, 1.2, -1.4], 56);
  L.update = (t, dt) => stepPoof(t, dt);
  return L;
};

// ---------- the wheel-of-the-year hall: 8 rooms, entered in the order of the wheel ----------
const WHEEL = ["Samhain", "Yule", "Imbolc", "Ostara", "Beltane", "Litha", "Lughnasadh", "Mabon"];
const WHEEL_DOORS = ["Litha", "Samhain", "Mabon", "Imbolc", "Yule", "Lughnasadh", "Ostara", "Beltane"];   // where each door is (not in order)
const LETTERS = { Yule: "S", Ostara: "E", Litha: "E", Mabon: "D" };   // the sphinx's answer, one letter in each room
const lettersShown = () => ["Yule", "Ostara", "Litha", "Mabon"].map((n) => (S.flags["letter_" + n] ? LETTERS[n] : "_")).join(" ");
function wheelVisit(n) {
  const f = S.flags;
  if (f.stairsUp) return;
  const i = WHEEL.indexOf(n), step = f.wheelStep || 0;
  f.wheelStep = i === step ? step + 1 : i === 0 ? 1 : 0;   // the wrong order: nothing happens (and you start over)
  if (f.wheelStep >= 8) f.stairsUp = true;
  save();
}
function leaveFestival(id) {
  goLevel("wheelHall", id);
  if (S.flags.stairsUp && !S.flags.stairsSeen) setTimeout(() => say([["", "RUMBLE... RUMBLE..."], ["", "In the center room, a staircase rises up out of the floor!"], flag("stairsSeen")]), 500);
}
LV.wheelHall = () => {
  const L = newLevel("wheelHall", "Wheel of the Year Hall");
  const RW = 16, RD = 10, R = [RW, RD], tx = CT();
  room(L, { w: RW, d: RD, h: 4, wall: tx.wall, floor: tx.floor, ceil: 0x2a2434, trim: 0x3a3048 });
  const ring = new THREE.RingGeometry(1.2, 2.2, 16); ring.rotateX(-Math.PI / 2);
  put(L, ring, mat({ color: 0x8a6ad0 }), 0, 0.02, 0);
  const spots = [["back", -5.4], ["back", -1.8], ["back", 1.8], ["back", 5.4], ["left", -2.4], ["left", 1.6], ["right", -2.4], ["right", 1.6]];
  const stand = (side, a) => side === "back" ? [a, -3.9] : side === "left" ? [-6.9, a] : [6.9, a];
  const cols = { Samhain: "#e87a20", Yule: "#3aa84a", Imbolc: "#e8e8f8", Ostara: "#f29bb0", Beltane: "#ff5a8a", Litha: "#f2c830", Lughnasadh: "#d8a040", Mabon: "#c8603a" };
  WHEEL_DOORS.forEach((n, k) => {
    const [side, a] = spots[k];
    onWall(L, side, R, doorC(cols[n]), 1.15, 2.1, a, 0, { name: `Door to the ${n} room`, exit: true, stand: stand(side, a),
      run: () => { wheelVisit(n); goLevel("wh_" + n, "wheelHall"); } });
    onWall(L, side, R, signTex(n.toUpperCase(), cols[n]), Math.max(1.0, n.length * 0.16), 0.32, a, 2.4, null);
  });
  spiralStairs(L, -6.4, 3.4, 1.2, { name: "Spiral stairs down to the reception hall", exit: true, go: "reception", stand: [-5.8, 3.0] });
  const up = spiralStairs(L, 0, 0, 4.0, { name: "Staircase up", exit: true, go: "castleUp", stand: [0.9, 1.4], show: () => !!S.flags.stairsUp });
  crew(L, -5.2, 3.0);
  L.walk = [-7.2, 7.2, -4.0, 4.4]; L.start = [-5.2, 3.0];
  L.entries = { reception: [-5.2, 3.0], castleUp: [0.9, 1.6] };
  WHEEL_DOORS.forEach((n, k) => (L.entries["wh_" + n] = stand(...spots[k])));
  L.onEnter = [["", "Up the spiral staircase: a hall with 8 doors. Each one has a strange name on it."],
    ["Jon", "Remember what the statue said? \"Follow the wheel of the year.\""]];
  L.light = { amb: 0x686078, dir: [0.2, -1, -0.4], dirCol: 0x504858, pts: [[[0, 3.6, 0], 0xb08aff, 9], [[-6, 2.4, 3], 0xffd890, 5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 14, 30]; L.bg = 0x14101a;
  cam(L, [0, 7.2, 11.5], [0, 1, -1], 58);
  let rise = S.flags.stairsUp ? 1 : 0;
  L.update = (t, dt) => { if (S.flags.stairsUp && rise < 1) rise = Math.min(1, rise + (dt || 0.016) * 0.5); up.position.y = (rise - 1) * 4; };
  return L;
};
const FESTIVAL = {
  Samhain: ["#3a2440", "#24182c", "Pumpkins and falling leaves."], Yule: ["#24402c", "#18281c", "A little evergreen tree and red candles."],
  Imbolc: ["#5a5a70", "#3a3a4a", "White candles and tiny white flowers."], Ostara: ["#4a5a3a", "#323e28", "Painted eggs in a nest."],
  Beltane: ["#5a3a4a", "#3e2832", "A maypole with long ribbons."], Litha: ["#6a5a2a", "#4a3e1c", "A big golden sun."],
  Lughnasadh: ["#5a4a2a", "#3e321c", "Bundles of wheat and a loaf of bread."], Mabon: ["#5a3424", "#3e2418", "A basket of apples and red leaves."],
};
function festivalDecor(L, n) {
  const g = group(L, 1.6, 0, -1.8, 0, { name: "Decorations", say: [["", FESTIVAL[n][2]]] });
  const m = (c, e) => mat({ color: c, em: e || 0 });
  if (n === "Samhain") [[-0.5, 0, 0.36], [0.2, 0.3, 0.28], [0.7, -0.2, 0.22]].forEach(([x, z, r]) => { const s = new THREE.SphereGeometry(r, 8, 6); s.scale(1, 0.8, 1); put(L, s, m(0xe87a20), x, r * 0.8, z, 0, null, g); });
  if (n === "Yule") { tree(L, 1.6, -2.0, 0.6, 0x2a6a3a); [-0.6, -0.3].forEach((x) => put(L, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), m(0xc82020), x, 0, 0.3, 0, null, g)); }
  if (n === "Imbolc") [-0.4, -0.1, 0.2, 0.5].forEach((x, i) => put(L, new THREE.CylinderGeometry(0.06, 0.06, 0.4 + i * 0.1, 6), m(0xf8f8ff, 0.4), x, 0, 0, 0, null, g));
  if (n === "Ostara") [[0, 0, 0xf29bb0], [0.3, 0.1, 0x8ad0f0], [-0.3, 0.1, 0xf2e470], [0.1, -0.25, 0x9ad08a]].forEach(([x, z, c]) => { const e = new THREE.SphereGeometry(0.15, 8, 6); e.scale(1, 1.3, 1); put(L, e, m(c), x, 0.2, z, 0, null, g); });
  if (n === "Beltane") { put(L, new THREE.CylinderGeometry(0.07, 0.07, 3, 6), m(0xd8c8a0), 0, 1.5, 0, 0, null, g); [0xff5a8a, 0x5ad8ff, 0xf2e470].forEach((c, i) => line(L, lineG([new THREE.Vector3(0, 3, 0), new THREE.Vector3(Math.cos(i * 2.1) * 1.2, 0.2, Math.sin(i * 2.1) * 1.2)]), c, g)); }
  if (n === "Litha") put(L, new THREE.CircleGeometry(0.9, 12), m(0xf2c830, 1), 0, 2.0, -0.6, 0, null, g);
  if (n === "Lughnasadh") { [-0.4, 0, 0.4].forEach((x) => put(L, new THREE.ConeGeometry(0.15, 1.0, 6), m(0xd8b040), x, 0.5, 0, 0, null, g)); const b = new THREE.SphereGeometry(0.3, 8, 5); b.scale(1.4, 0.6, 1); put(L, b, m(0xb87a3a), 0.2, 0.15, 0.5, 0, null, g); }
  if (n === "Mabon") { put(L, new THREE.CylinderGeometry(0.4, 0.3, 0.35, 10), m(0x8a6a3a), 0, 0, 0, 0, null, g); [[-0.15, 0], [0.15, 0.05], [0, -0.15]].forEach(([x, z]) => put(L, new THREE.SphereGeometry(0.12, 7, 5), m(0xc82828), x, 0.4, z, 0, null, g)); }
}
function closetAct() {
  if (S.flags.got_chart) return [() => showPeek(CT().chart.userData.canvas.toDataURL(), "The wheel of the year chart: start at Samhain and go around in order.")];
  return [["", "May opens the closet. There's something under a cloth..."], ["", "She pulls the cloth away. It's a chart: the wheel of the year!"],
    () => { add("chart", "got_chart"); showPeek(CT().chart.userData.canvas.toDataURL(), "The wheel of the year chart: start at Samhain and go around in order."); }];
}
function festivalRoom(n) {
  const id = "wh_" + n, L = newLevel(id, n + " Room");
  const RW = 8, RD = 6, R = [RW, RD], [wc, lc] = FESTIVAL[n];
  room(L, { w: RW, d: RD, wall: stoneTex(wc, lc), floor: CT().floor, ceil: 0x2a2434, trim: 0x3a3048 });
  onWall(L, "left", R, doorC("#8a7a98"), 1.15, 2.1, 1.2, 0, { name: "Door back to the hall", exit: true, stand: [-3.4, 1.2], run: () => leaveFestival(id) });
  onWall(L, "back", R, signTex(n.toUpperCase(), "#ffd23f"), Math.max(1.2, n.length * 0.2), 0.4, -1.4, 2.4, { name: "Sign: " + n, say: [["", `"${n}"`]] });
  festivalDecor(L, n);
  if (LETTERS[n]) {
    const lt = label([LETTERS[n]], 16, 16, "#2a1a40", "#ffe85a", "#8a6ad0");
    const g = onWall(L, "back", R, lt, 0.5, 0.5, -1.4, 1.3, { name: "Glowing letter", say: () => [flag("letter_" + n), ["", `A glowing letter "${LETTERS[n]}" is carved into the wall!`]] });
    g.children[0].material.uniforms.uEm.value = 1;
  }
  if (n === "Samhain") {
    const cl = group(L, 3.1, 0, -1.4, -Math.PI / 2, { name: "Closet", stand: [2.4, -1.0], say: () => closetAct() });
    put(L, boxG(1.6, 2.4, 0.6), mat({ color: 0x4a3222 }), 0, 0, 0, 0, null, cl);
    put(L, planeG(0.9, 0.9), mat({ map: CT().chart, em: 0.4 }), 0, 0.8, 0.31, 0, null, cl);
    const clL = new THREE.Group(); clL.position.set(-0.73, 0.15, 0.32); cl.add(clL);
    put(L, planeG(0.7, 2.0), mat({ color: 0x6b4f35, side: THREE.DoubleSide }), 0.35, 0, 0, 0, null, clL);
    const clR = new THREE.Group(); clR.position.set(0.73, 0.15, 0.32); cl.add(clR);
    put(L, planeG(0.7, 2.0), mat({ color: 0x6b4f35, side: THREE.DoubleSide }), -0.35, 0, 0, 0, null, clR);
    L.update = (t, dt) => {
      const open = S.flags.got_chart ? 1.15 : 0;
      clL.rotation.y += (-open - clL.rotation.y) * Math.min(1, (dt || 0.016) * 6);
      clR.rotation.y += (open - clR.rotation.y) * Math.min(1, (dt || 0.016) * 6);
    };
  }
  crew(L, -2.6, 1.4);
  L.walk = [-3.4, 3.4, -1.3, 2.4]; L.start = [-2.6, 1.4];
  L.entries = { wheelHall: [-2.8, 1.2] };
  L.onEnter = [["", `The ${n} room.`]];
  L.light = { amb: 0x787088, dir: [0.2, -1, -0.5], dirCol: 0x585060, pts: [[[0, 2.6, 0], 0xffe0b0, 7], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 10, 24]; L.bg = 0x14101a;
  cam(L, [0.2, 3.0, 6.2], [0.2, 1.1, -1.2], 54);
  return L;
}
WHEEL.forEach((n) => (LV["wh_" + n] = () => festivalRoom(n)));

// ---------- upstairs: the sphinx ----------
function sphinxAct() {
  if (S.flags.sphinxPassed) return [["Sphinx", "You may pass."]];
  const wrong = () => [["Sphinx", "No."], ["", "Hmm... maybe the answer is hidden in the rooms downstairs."]];
  return [["Sphinx", "To pass, you must answer my riddle."],
    ["Sphinx", "I'm buried in the ground, but I'm not treasure. Give me water and sun, and I'll grow. What am I?"],
    { choices: [["A seed!", () => [["Sphinx", "S... E... E... D. Correct!"], flag("sphinxPassed"), ["", "The sphinx steps aside. Behind it, a door opens into a hall of mirrors!"]]],
      ["Treasure", wrong], ["A worm", wrong], ["A rock", wrong], ["We don't know yet", wrong]] }];
}
LV.castleUp = () => {
  const L = newLevel("castleUp", "The Sphinx");
  const RW = 10, RD = 7, R = [RW, RD], tx = CT();
  room(L, { w: RW, d: RD, h: 4, wall: tx.wall, floor: tx.tiles, floorRep: 1.2, ceil: 0x2a2434, trim: 0xd8b070 });
  onWall(L, "back", R, doorC("#d8b070"), 1.3, 2.4, 0, 0, { name: "Door to the hall of mirrors", exit: true, stand: [0, -2.0], show: () => !!S.flags.sphinxPassed,
    run: () => goLevel(S.flags.shattered ? "atrium" : "mirrors", "castleUp") });
  spiralStairs(L, -4.2, 2.6, 1.2, { name: "Stairs down to the wheel hall", exit: true, go: "wheelHall", stand: [-3.6, 2.2] });
  // the sphinx: a lion's body with a person's head (a stand-in: the kids haven't drawn it yet)
  const sx = group(L, S.flags.sphinxPassed ? 2.4 : 0, 0, -2.2, 0, { name: "Sphinx", stand: [0, -0.6], say: () => sphinxAct() });
  const tan = mat({ color: 0xd8b070 });
  put(L, boxG(1.4, 1.0, 2.2), tan, 0, 0, -0.2, 0, null, sx);
  [-0.45, 0.45].forEach((px) => put(L, boxG(0.35, 0.3, 0.9), tan, px, 0, 1.2, 0, null, sx));
  put(L, boxG(0.8, 0.9, 0.7), tan, 0, 1.0, 0.6, 0, null, sx);
  const hd = mat({ color: 0x3a6ab8 });
  put(L, boxG(1.1, 0.9, 0.5), hd, 0, 0.9, 0.35, 0, null, sx);
  put(L, boxG(0.9, 0.12, 0.1), mat({ color: 0xf2c830 }), 0, 1.75, 0.96, 0, null, sx);
  [-0.18, 0.18].forEach((ex) => put(L, boxG(0.1, 0.08, 0.04), mat({ color: 0x2a1f3d }), ex, 1.45, 0.96, 0, null, sx));
  crew(L, -3.2, 2.0);
  L.walk = [-4.3, 4.3, -1.9, 2.8]; L.start = [-3.2, 2.0];
  L.entries = { wheelHall: [-3.2, 2.0], mirrors: [0, -1.4], atrium: [0, -1.4] };
  L.onEnter = [["", "At the top of the stairs, a sphinx blocks the way! (The kids haven't drawn the sphinx yet, so this one is a stand-in.)"]];
  L.light = { amb: 0x787088, dir: [0.2, -1, -0.5], dirCol: 0x585060, pts: [[[0, 3, -1], 0xffe0b0, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 12, 26]; L.bg = 0x14101a;
  cam(L, [0, 3.6, 7.4], [0, 1.2, -1.4], 56);
  L.update = (t, dt) => { if (S.flags.sphinxPassed && sx.position.x < 2.4) sx.position.x += (dt || 0.016) * 1.5; };
  return L;
};

// ---------- the hall of mirrors: past, present and future, and the crystal trumpet ----------
const TRUMPET = ["mouthpiece", "middle", "bell"];
function gotPiece(id, line1) {
  const others = TRUMPET.filter((p) => p !== id);
  const whole = others.every(has);
  return [() => add(id, "got_" + id), ["", line1 + " It goes in your item drawer."],
    ...(whole ? [() => { TRUMPET.forEach(remove); add("trumpet", "got_trumpet"); }, ["", "The three crystal pieces click together... it's a whole crystal trumpet!"]] : [])];
}
function blowTrumpet() {
  if (!has("trumpet")) return [["", "A giant mirror. Hundreds of kids look back at you!"]];
  return [["", "May lifts the crystal trumpet and blows as hard as she can..."], ["", "TOOOOOOOOT!"], () => shake(),
    ["", "CRASH! Every mirror in the hall shatters into sparkles!"], () => { remove("trumpet"); S.flags.shattered = true; save(); goLevel("atrium", "mirrors"); }];
}
LV.mirrors = () => {
  const L = newLevel("mirrors", "Hall of Mirrors");
  const tx = CT();
  put(L, floorG(30, 14), mat({ map: tx.tiles, rep: [24, 11] }), 0, 0, 0);
  put(L, planeG(30, 4), mat({ color: 0x1a1626 }), 0, 0, -5.5);
  const big = group(L, 0, 0, -5.4, 0, { name: "Giant mirror", stand: [0, -3.8], say: () => blowTrumpet(), use: { trumpet: blowTrumpet } });
  put(L, boxG(3.4, 3.4, 0.1), mat({ color: 0xc8a040 }), 0, 0, 0, 0, null, big);
  put(L, planeG(3.0, 3.0), mat({ map: T.mirror, em: 0.3 }), 0, 0.2, 0.06, 0, null, big);
  onWall(L, "back", [30, 11], doorC("#d8b070"), 1.1, 2.1, -4.0, 0, { name: "Door back to the sphinx", go: "castleUp", stand: [-3.2, -3.9] });
  // side walls are see-through mirrors, with the kids' reflections behind them
  [-4, 4].forEach((wx) => {
    put(L, planeG(11, 3.4), mat({ color: 0xb8d8f0, alpha: 0.22, side: THREE.DoubleSide }), wx, 0, 0, Math.PI / 2);
    for (let z = -5; z <= 5; z += 2) put(L, boxG(0.12, 3.4, 0.12), mat({ color: 0xc8a040 }), wx, 0, z);
    put(L, boxG(0.12, 0.12, 11), mat({ color: 0xc8a040 }), wx, 3.4, 0);
  });
  const SPECIAL = [["PAST", -4, -2, "pastRoom"], ["PRESENT", 4, -2, "presentRoom"], ["FUTURE", -4, 2, "futureRoom"]];
  SPECIAL.forEach(([word, wx, wz, lv]) => {
    const g = group(L, wx * 0.985, 0, wz, wx < 0 ? Math.PI / 2 : -Math.PI / 2, { name: `Mirror marked ${word}`, exit: true, stand: [wx * 0.8, wz], go: lv });
    const sh = put(L, planeG(1.4, 2.6), mat({ color: 0xd8c8ff, em: 0.6, alpha: 0.5 }), 0, 0.2, 0, 0, null, g);
    put(L, planeG(1.3, 0.3), mat({ map: signTex(word, "#ffd23f") }), 0, 2.85, 0.02, 0, null, g);
    g.userData.shimmer = sh;
  });
  const kids = crew(L, 0, 3.4);
  const refl = [];
  [-4, 4].forEach((wx) => Object.values(kids).forEach((c) => {
    const r = addChar(L, c.key, 2 * wx - c.pos.x, c.pos.y, 1.3);
    r.body.material.uniforms.uColor.value.set(0x9ab8e0); r.src = c; r.wx = wx; refl.push(r);
  }));
  L.walk = [-3.3, 3.3, -3.9, 4.4]; L.start = [0, 3.4];
  L.entries = { castleUp: [-3.2, -3.4], pastRoom: [-3.0, -2], presentRoom: [3.0, -2], futureRoom: [-3.0, 2] };
  L.onEnter = [["", "A hall of mirrors! Reflections of the kids, everywhere they look."], ["Olivia", "Look! Some of the mirrors have words on them."]];
  L.light = { amb: 0x8080a0, dir: [0.2, -1, -0.5], dirCol: 0x606078, pts: [[[0, 3, 0], 0xd8c8ff, 9], [[0, 2, -5], 0xffe0b0, 5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 12, 30]; L.bg = 0x14101a;
  cam(L, [0, 4.2, 9.6], [0, 1.2, -2.4], 56);
  L.update = (t) => {
    refl.forEach((r) => { r.pos.set(2 * r.wx - r.src.pos.x, r.src.pos.y); r.face = -r.src.face; r.walkT = r.src.walkT; });
    L.hots.forEach((o, i) => { if (o.userData.shimmer) o.userData.shimmer.material.uniforms.uAlpha.value = 0.4 + Math.sin(t * 2 + i) * 0.15; });
  };
  return L;
};
const backToMirrors = { name: "Mirror back to the hall", go: "mirrors" };

// the past room: toddlers, giant furniture, and a cookie on a high table
function chairAct() {
  const f = S.flags;
  if (f.got_mouthpiece || f.got_trumpet) return [["", "The giant chair, pushed up against the table."]];
  if (!f.chairMoved) return [["", "May pushes and pushes the giant chair... SCRAPE! It scoots right up next to the table!"], flag("chairMoved")];
  if (!has("book")) return [["", "The chair seat is too high for toddler May to climb. Something to stand on would help..."]];
  return [() => remove("book"), ["", "May puts the big book down by the chair. She climbs onto the book... onto the chair... and up onto the table!"],
    ["May", "The cookie!"], ["", "May shares the cookie with everyone. CRUNCH, CRUNCH!"],
    ...gotPiece("mouthpiece", "Inside the cookie, there's a piece of crystal! It's the mouthpiece of a crystal trumpet!")];
}
LV.pastRoom = () => {
  const L = newLevel("pastRoom", "The Past Room");
  const RW = 12, RD = 8, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 6, wall: T.mayWall, floor: T.rug, ceil: 0xd8c8b0, trim: 0xc8a878 });
  onWall(L, "left", R, T.mirror, 1.4, 2.4, 2.4, 0, { ...backToMirrors, stand: [-5.2, 2.4] }, 0xc8a040);
  const done = () => !!(S.flags.got_mouthpiece || S.flags.got_trumpet);
  const table = group(L, 1.6, 0, -2.2, 0, { name: "Giant table", stand: [0.2, -1.2], say: () => done() ? [["", "The cookie is gone. Yum!"]] : [["", "There's a cookie on top of the giant table... but it's WAY too high for toddlers!"]] });
  const wood = mat({ color: 0x8a5a3a });
  [[-1.6, -0.9], [1.6, -0.9], [-1.6, 0.9], [1.6, 0.9]].forEach(([lx, lz]) => put(L, boxG(0.3, 3.0, 0.3), wood, lx, 0, lz, 0, null, table));
  put(L, boxG(3.8, 0.25, 2.2), wood, 0, 3.0, 0, 0, null, table);
  const cookie = put(L, new THREE.CylinderGeometry(0.35, 0.35, 0.1, 12), mat({ color: 0xc8904a }), 0, 3.3, 0.3, 0, null, table);
  const chair = group(L, -2.8, 0, 0.4, 0.4, { name: "Giant chair", stand: [-1.6, 0.9], say: () => chairAct(), use: { book: chairAct } });
  put(L, boxG(1.6, 1.8, 1.6), mat({ color: 0x5a8ac8 }), 0, 0, 0, 0, null, chair);
  put(L, boxG(1.6, 2.2, 0.2), mat({ color: 0x4a7ab8 }), 0, 1.8, -0.7, 0, null, chair);
  const book = group(L, 4.2, 0, 1.6, 0.3, { name: "Giant picture book", show: () => !S.flags.got_book, say: () => [() => add("book", "got_book"), ["", "A big, heavy picture book. Toddler May can just barely carry it. It goes in your item drawer."]] });
  put(L, boxG(1.1, 0.3, 0.8), mat({ color: 0xc82828 }), 0, 0, 0, 0, null, book);
  put(L, boxG(1.0, 0.26, 0.74), mat({ color: 0xf4f0e4 }), 0.03, 0.02, 0, 0, null, book);
  const placedBook = new THREE.Group(); placedBook.position.set(-0.4, 0, -0.05); L.scene.add(placedBook);
  put(L, boxG(1.1, 0.3, 0.8), mat({ color: 0xc82828 }), 0, 0, 0, 0, null, placedBook);
  put(L, boxG(1.0, 0.26, 0.74), mat({ color: 0xf4f0e4 }), 0.03, 0.02, 0, 0, null, placedBook);
  const toy = (name, x, z, line1, build) => { const g = group(L, x, 0, z, 0, { name, say: [["", line1]] }); build(g); };
  toy("Giant teddy bear", -4.4, -2.6, "A teddy bear as big as a house! It's soft... but it won't help reach the cookie.", (g) => {
    put(L, new THREE.SphereGeometry(1.0, 8, 6), mat({ color: 0xb8864a }), 0, 1.0, 0, 0, null, g);
    put(L, new THREE.SphereGeometry(0.7, 8, 6), mat({ color: 0xb8864a }), 0, 2.4, 0, 0, null, g);
    [-0.5, 0.5].forEach((ex) => put(L, new THREE.SphereGeometry(0.25, 6, 4), mat({ color: 0x8a5a2a }), ex, 3.0, 0, 0, null, g));
  });
  toy("Giant bouncy ball", 4.0, -2.4, "BOING! A giant bouncy ball. Fun, but not helpful.", (g) => put(L, new THREE.SphereGeometry(0.8, 10, 6), mat({ color: 0xff5a8a }), 0, 0.8, 0, 0, null, g));
  toy("Giant blocks", 1.2, 2.4, "Giant blocks with letters on them. Too wobbly to stand on!", (g) => {
    [[0, 0, 0xf2c830], [0.9, 0, 0x5ad8ff], [0.45, 0.8, 0x9ad08a]].forEach(([bx, by, c]) => put(L, boxG(0.8, 0.8, 0.8), mat({ color: c }), bx, by, 0, 0, null, g));
  });
  const kids = crew(L, -3.6, 2.6);
  Object.values(kids).forEach((c) => (c.scaleMul = 0.6));
  L.walk = [-5.2, 5.2, -0.9, 3.2]; L.start = [-3.6, 2.6];
  L.entries = { mirrors: [-4.6, 2.4] };
  L.onEnter = [["", "The kids step through the mirror marked PAST... and they turn into TODDLERS!"], ["Jon", "Everything is GIANT!"],
    ["Olivia", "Look! A cookie, way up on that table!"]];
  L.light = { amb: 0x8a8090, dir: [0.2, -1, -0.5], dirCol: 0x686070, pts: [[[0, 5, 0], 0xffe8c8, 12], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x201a24, 14, 30]; L.bg = 0x201a24;
  cam(L, [0, 4.0, 9.0], [0.4, 2.0, -1.5], 58);
  L.update = (t, dt) => {
    const f = S.flags, s = Math.min(1, (dt || 0.016) * 4);
    if (f.chairMoved) {
      chair.position.x += (-0.4 - chair.position.x) * s;
      chair.position.z += (-1.1 - chair.position.z) * s;
      chair.rotation.y += (0 - chair.rotation.y) * s;
    }
    placedBook.visible = done();
    cookie.visible = !done();
  };
  return L;
};

// the present room: fog, a giant tree, and an owl with a riddle
function fogAct() {
  if (S.flags.fogClear) return [];
  if (!has("flashlight")) return [() => { S.flags.needLight = true; save(); }, ["", "The fog is too thick to walk through. A flashlight could cut through it..."],
    ["Jasin", "There's a flashlight in the ship's armory!"]];
  return [["", "May switches on the flashlight. The beam cuts right through the fog!"], flag("fogClear"), ["", "There's a giant tree... and an owl, up in the branches."]];
}
function owlAct() {
  if (S.flags.got_middle || S.flags.got_trumpet) return [["Owl", "Hoo! Good luck, kids."]];
  const wrong = () => [["Owl", "Hoo-hoo! No, that's not it. Think about it..."]];
  return [["Owl", "Hoo! Answer my riddle, and I'll give you something special."], ["Owl", "The more you take, the more you leave behind. What am I?"],
    { choices: [["Footsteps!", () => [["Owl", "Hoo! Footsteps! That's right!"], () => { if (L && L.dropMiddle) L.dropMiddle(); }, ...gotPiece("middle", "The owl drops a piece of crystal: the middle section of the trumpet!")]],
      ["Cookies", wrong], ["Naps", wrong], ["Socks", wrong]] }];
}
LV.presentRoom = () => {
  const L = newLevel("presentRoom", "The Present Room");
  outdoor(L, T.foggySky, T.forestFloor, [12, 10]);
  const exit = group(L, -5.4, 0, 3.4, 0.6, { ...backToMirrors, stand: [-4.8, 3.0] });
  put(L, boxG(1.6, 2.6, 0.12), mat({ color: 0xc8a040 }), 0, 0, 0, 0, null, exit);
  put(L, planeG(1.4, 2.4), mat({ map: T.mirror, em: 0.3 }), 0, 0.1, 0.07, 0, null, exit);
  const trunk = group(L, 0.6, 0, -6, 0, { name: "Giant tree", stand: [0.6, -3.6], show: () => !!S.flags.fogClear, say: [["", "A giant old tree."]] });
  put(L, new THREE.CylinderGeometry(0.9, 1.3, 6, 8), mat({ color: 0x4a3222 }), 0, 3, 0, 0, null, trunk);
  [[0, 6.4, 0, 3.0], [-1.8, 5.2, 0.4, 2.0], [1.9, 5.4, -0.2, 2.2]].forEach(([x, y, z, r]) => put(L, new THREE.SphereGeometry(r, 8, 6), mat({ color: 0x2a4a2a }), x, y, z, 0, null, trunk));
  put(L, boxG(2.0, 0.2, 0.3), mat({ color: 0x4a3222 }), 1.2, 3.2, 0.6, 0, null, trunk);
  const owl = addChar(L, "owl", 1.5, -5.3, 0.8, { name: "Owl", stand: [1.0, -3.6], say: () => owlAct() });
  owl.yOff = 3.4; owl.show = owl.body.userData.hot.show = () => !!S.flags.fogClear;
  const midDrop = put(L, new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), mat({ color: 0xb8f0ff, em: 1 }), 1.4, -5, -4.5);
  let dropT = -1;
  L.dropMiddle = () => { dropT = 0; };
  const fog = group(L, 0, 0, 0.4, 0, { name: "Thick fog", stand: [0, 1.4], show: () => !S.flags.fogClear, say: () => fogAct(), use: { flashlight: fogAct } });
  [-4, -1.4, 1.4, 4].forEach((x, i) => { const s = new THREE.SphereGeometry(2.0, 8, 5); s.scale(1.2, 0.9, 0.7); put(L, s, mat({ color: 0xe0e4e8, em: 0.6, alpha: 0.85 }), x, 1.2 + (i % 2) * 0.3, 0, 0, null, fog); });
  crew(L, -3.8, 3.0);
  L.walk = [-5.5, 5.5, 1.2, 4.6]; L.start = [-3.8, 3.0];
  L.entries = { mirrors: [-4.2, 3.0] };
  L.onEnter = () => [["", "Through the mirror marked PRESENT... the kids are their normal size, but everything is foggy."], ...(S.flags.fogClear ? [] : fogAct())];
  L.light = { amb: 0x8a9098, dir: [-0.3, -1, -0.4], dirCol: 0x606870, pts: [[[0, 4, -4], 0xfff0c0, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xc8d0d8, 3, 12]; L.bg = 0xc8d0d8;
  cam(L, [0, 3.6, 10], [0, 2.4, -3], 56, null, 200);
  L.update = (t, dt) => {
    const clear = !!S.flags.fogClear;
    L.walk[2] = clear ? -4.2 : 1.2;
    L.fog[1] = clear ? 10 : 3; L.fog[2] = clear ? 34 : 12; G.uFog.value.set(L.fog[1], L.fog[2]);
    if (dropT >= 0) {
      dropT += (dt || 0.016) * 1.3;
      midDrop.position.y = 3.4 - Math.min(1, dropT) * 2.4;
      midDrop.rotation.z = dropT * 5;
      if (dropT > 1.2) { dropT = -1; midDrop.position.y = -5; }
    }
  };
  return L;
};

// the future room: dark, statues of the kids as grown-ups, and their stone things
const STATUES = [["may", "stoneBow", "Tall statue with buns in her hair", "hair bow"], ["jon", "stoneDisk", "Tall statue with spiky hair", "portal disk"],
  ["jasin", "stoneBall", "Tall statue with messy hair", "soccer ball"], ["olivia", "stoneTutu", "Tall statue with long hair", "tutu"]];
const placedAll = () => STATUES.every(([k]) => S.flags["placed_" + k]);
function placeStone(who, item) {
  const f = S.flags, st = STATUES.find(([k]) => k === who);
  if (f["placed_" + who]) return [["", "This statue already has its stone " + st[3] + "."]];
  if (!item) return [["", "A grown-up statue made of stone. It looks like it's missing something... (Pick a stone thing in your item drawer, then click the statue.)"]];
  if (st[1] !== item) return [["", "Hmm... that doesn't seem to belong to this statue."]];
  const last = STATUES.filter(([k]) => k !== who).every(([k]) => f["placed_" + k]);
  return [() => remove(item), ["", `May puts the stone ${st[3]} on the statue. It fits! The statue glows.`], flag("placed_" + who),
    ...(last ? [() => { if (L && L.dropBell) L.dropBell(); }, ["", "All four statues glow at once... and a crystal bell floats down from the ceiling!"], ...gotPiece("bell", "It's the bell of the crystal trumpet!")] : [])];
}
LV.futureRoom = () => {
  const L = newLevel("futureRoom", "The Future Room");
  const RW = 12, RD = 8, R = [RW, RD], tx = CT();
  room(L, { w: RW, d: RD, h: 4.5, wall: tx.wall, floor: tx.floor, ceil: 0x101018 });
  onWall(L, "left", R, T.mirror, 1.4, 2.4, 2.4, 0, { ...backToMirrors, stand: [-5.2, 2.4] }, 0xc8a040);
  const lit = () => has("flashlight");
  STATUES.forEach(([k, item, name], i) => {
    const x = -3.6 + i * 2.4;
    put(L, boxG(1.0, 0.4, 1.0), mat({ color: 0x5a5a62 }), x, 0, -2.8);
    const c = addChar(L, k, x, -2.8, 2.3, { name, stand: [x, -1.4], say: () => placeStone(k), use: Object.fromEntries(STATUES.map(([, it]) => [it, () => placeStone(k, it)])) });
    c.yOff = 0.4; c.body.material.uniforms.uColor.value.set(0xa8a8b0); c.body.material.uniforms.uEm.value = 0.1;
    c.show = c.body.userData.hot.show = lit;
    const glow = put(L, new THREE.SphereGeometry(0.18, 8, 6), mat({ color: 0xfff27a, em: 1 }), x, 0.6, -2.2);
    glow.userData.who = k; c.glow = glow;
  });
  const STONES_AT = [["stoneBow", "Stone hair bow", 4.6, 1.8], ["stoneDisk", "Stone portal disk", -4.4, -1.0], ["stoneBall", "Stone soccer ball", 2.2, 2.8], ["stoneTutu", "Stone tutu", -1.4, 3.0]];
  STONES_AT.forEach(([id, name, x, z]) => {
    const g = group(L, x, 0, z, 0, { name, show: () => lit() && !S.flags["got_" + id], say: () => [() => add(id, "got_" + id), ["", `A ${name.toLowerCase()}! It goes in your item drawer.`]] });
    const sm = mat({ color: 0x9a9aa2 });
    if (id === "stoneBow") { put(L, new THREE.ConeGeometry(0.18, 0.3, 4).rotateZ(Math.PI / 2), sm, -0.15, 0.15, 0, 0, null, g); put(L, new THREE.ConeGeometry(0.18, 0.3, 4).rotateZ(-Math.PI / 2), sm, 0.15, 0.15, 0, 0, null, g); }
    if (id === "stoneDisk") put(L, new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12), sm, 0, 0.04, 0, 0, null, g);
    if (id === "stoneBall") put(L, new THREE.SphereGeometry(0.22, 8, 6), sm, 0, 0.22, 0, 0, null, g);
    if (id === "stoneTutu") put(L, new THREE.CylinderGeometry(0.12, 0.38, 0.2, 10), sm, 0, 0.1, 0, 0, null, g);
  });
  const bellDrop = put(L, new THREE.ConeGeometry(0.28, 0.45, 10), mat({ color: 0xb8f0ff, em: 1 }), 0, -5, -1.2);
  let bellT = -1;
  L.dropBell = () => { bellT = 0; };
  crew(L, -3.8, 2.6);
  L.walk = [-5.2, 5.2, -1.6, 3.4]; L.start = [-3.8, 2.6];
  L.entries = { mirrors: [-4.6, 2.4] };
  L.onEnter = () => lit()
    ? [["", "Through the mirror marked FUTURE... it's pitch dark! May switches on the flashlight."], ["", "Statues of the kids, all grown up! Some stone things are lying around in the dark."]]
    : [() => { S.flags.needLight = true; save(); }, ["", "Through the mirror marked FUTURE... it's pitch dark! The kids can't see a thing."], ["Jasin", "We need a flashlight. There's one in the ship's armory!"]];
  L.light = { amb: 0x101018, dir: [0, -1, 0], dirCol: 0x000000, pts: [[[0, 2, 0], 0xfff0c0, 7], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x000000, 6, 16]; L.bg = 0x000000;
  cam(L, [0, 3.8, 8.8], [0, 1.6, -1.6], 58);
  L.update = (t, dt) => {
    const p = L.player.pos;
    G.uPt.value[0].set(p.x, 2.2, p.y - 1.2); G.uPtCol.value[0].set(lit() ? 0xfff0c0 : 0x000000); G.uPtR.value[0] = 9;
    G.uAmb.value.set(lit() ? 0x30303c : 0x08080c);
    L.chars.forEach((c) => { if (c.glow) c.glow.visible = !!S.flags["placed_" + c.key]; });
    if (bellT >= 0) {
      bellT += (dt || 0.016) * 0.9;
      bellDrop.position.y = 4.2 - Math.min(1, bellT) * 2.8;
      bellDrop.rotation.y = bellT * 4;
      if (bellT > 1.4) { bellT = -1; bellDrop.position.y = -5; }
    }
  };
  return L;
};

// ---------- the atrium: the wizard, and the dogs of darkness ----------
let CUT = null;
function atriumLines() {
  const fight = [["Wizard", "You little twerps, you think you can fight us? Try to defeat these dogs of darkness!"],
    () => { if (L && L.poof) L.poof(); S.flags.dogsOut = true; save(); },
    ["", "POOF! The wizard vanishes!"], () => swampCutscene()];
  return [["", "The mirrors are gone. The kids are standing in a huge atrium... and the wizard is laughing at them!"], ["Wizard", "HA HA HA HA HA!"],
    ["Jasin", "Mr. Wizard! Why are our things glowing? My ball, and Olivia's tutu?"],
    ["Wizard", "They're glowing because you're supposed to give them to ME!"],
    { choices: [["No way!", () => [["Jasin", "No way! This is MY ball!"], ["Olivia", "And my tutu stays with me!"], ...fight]],
      ["Hmm... let us think about it", () => [["Jon", "Wait... we don't even know why they glow. NO!"], ["Olivia", "We're keeping them!"], ...fight]]] }];
}
function swampCutscene() {
  CUT = "swamp"; S.flags.wizSwamp = true; save();
  getLevel("swamp").entered = true;
  goLevel("swamp", "cut");
  setTimeout(() => say([["", "Meanwhile, at the swamp..."], ["Wizard", "My dear witch! Don't worry, I'll get you out!"],
    flag("witchFree"), ["", "The wizard unlocks the cage and lets the witch out."], ["Witch", "Hmph. It took you long enough."],
    ["Wizard", "Those pesky kids are in my castle. Let's go!"], flag("houseGone"),
    ["", "The two of them hop into her house... and the house stands up on its big bird legs and walks away!"],
    ["", "Back at the castle..."], () => { CUT = null; save(); goLevel("atrium", "cut"); setTimeout(() => say(dogLines()), 450); }]), 450);
}
LV.atrium = () => {
  const L = newLevel("atrium", "The Atrium");
  const tx = CT();
  put(L, new THREE.CircleGeometry(9, 20).rotateX(-Math.PI / 2), mat({ map: tx.tiles, rep: [14, 14] }), 0, 0, 0);
  put(L, new THREE.CylinderGeometry(9, 9, 9, 20, 3, true), mat({ map: tx.wall, rep: [20, 6], side: THREE.BackSide }), 0, 4.5, 0);
  put(L, new THREE.CircleGeometry(3, 16).rotateX(Math.PI / 2), mat({ color: 0xd8d8f0, em: 1 }), 0, 8.9, 0);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; if (Math.sin(a) > 0.5) continue;   // no pillars between the camera and the action
    put(L, new THREE.CylinderGeometry(0.35, 0.4, 8, 8), mat({ color: 0x8a7a98 }), Math.cos(a) * 7, 4, Math.sin(a) * 7); }
  // sparkly bits of broken mirror on the floor
  for (let i = 0; i < 24; i++) put(L, new THREE.CircleGeometry(0.08, 4).rotateX(-Math.PI / 2), mat({ color: 0xd8e8ff, em: 1 }), (rnd() - 0.5) * 10, 0.03, (rnd() - 0.5) * 8);
  const wiz = addChar(L, "wizard", 0, -3.6, 2.0, { name: "Wizard", stand: [0, -1.4], say: () => S.flags.dogsOut ? [] : atriumLines() });
  wiz.show = wiz.body.userData.hot.show = () => !S.flags.dogsOut;
  const stepPoof = addPoof(L, 0, -3.6);
  const dogHomes = [[-2.2, -2.4], [0, -3.4], [2.2, -2.4]];
  const dogs = dogHomes.map(([x, z]) => {
    const d = addChar(L, "dog", x, z, 1.1, { name: "Dog of darkness", stand: [0, -0.6], say: () => dogLines() });
    d.body.material.uniforms.uColor.value.set(0x4a3a48); d.body.material.uniforms.uEm.value = 0.25;
    d.show = d.body.userData.hot.show = () => !!S.flags.dogsOut && CUT !== "swamp";
    return d;
  });
  const dogZzz = dogHomes.map(([x, z]) => put(L, planeG(0.6, 0.26), mat({ map: label(["Zzz"], 32, 14, "#14101a", "#ffffff", "#14101a"), em: 1 }), x + 0.3, 0.8, z, 0));
  const emptyCan = new THREE.Group(); emptyCan.position.set(0, 0.14, -2.2); emptyCan.rotation.z = Math.PI / 2; L.scene.add(emptyCan);
  put(L, new THREE.CylinderGeometry(0.14, 0.14, 0.28, 10), mat({ color: 0xc83a3a }), 0, 0, 0, 0, null, emptyCan);
  const chaseBall = put(L, new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0xfff27a, em: 1 }), -4.2, 0.22, -3.2);
  const back = group(L, 0, 0, 5.6, Math.PI, { name: "Door back to the sphinx", go: "castleUp", stand: [0, 4.4] });
  put(L, planeG(1.3, 2.4), mat({ map: doorC("#d8b070") }), 0, 0, 0, 0, null, back);
  addSlide(L);
  crew(L, 0.8, 2.4);
  L.walk = [-5, 5, -1.6, 4.6]; L.start = [0.8, 2.4];
  L.entries = { mirrors: [0.8, 2.4], castleUp: [0, 4.0] };
  L.onEnter = () => S.flags.dogsOut ? [] : atriumLines();
  L.light = { amb: 0x7a7090, dir: [0, -1, 0.1], dirCol: 0x8888a0, pts: [[[0, 7, 0], 0xd8d8ff, 14], [[0, 1.5, -3], 0xb08aff, 5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14101a, 14, 30]; L.bg = 0x14101a;
  cam(L, [0, 4.4, 7.6], [0, 1.3, -2.2], 62);
  L.update = (t, dt) => {
    stepPoof(t, dt);
    const fed = !!S.flags.dogsFed, ball = !!S.flags.ballThrown;
    emptyCan.visible = fed;
    chaseBall.visible = ball;
    if (ball) chaseBall.position.set(-3.8 + Math.cos(t * 2.5) * 1.1, 0.22 + Math.abs(Math.sin(t * 6)) * 0.18, -3.2 + Math.sin(t * 2.5) * 0.9);
    dogs.forEach((d, i) => {
      dogZzz[i].visible = fed;
      dogZzz[i].position.y = 0.75 + Math.sin(t * 2 + i) * 0.08;
      if (fed) {
        d.pos.set(dogHomes[i][0], dogHomes[i][1]);
        d.body.rotation.z = Math.PI / 2 * 0.85;
        d.yOff = 0.15;
      } else if (ball) {
        const a = t * 2.5 - 0.5 - i * 0.55;
        d.pos.set(-3.8 + Math.cos(a) * 1.1, -3.2 + Math.sin(a) * 0.9);
        d.body.rotation.z = 0;
        d.yOff = Math.abs(Math.sin(t * 8 + i)) * 0.16;
      } else {
        d.pos.set(dogHomes[i][0], dogHomes[i][1]);
        d.body.rotation.z = 0;
        d.yOff = Math.abs(Math.sin(t * 6 + i)) * 0.08;
      }
    });
  };
  return L;
};

// ---------- goals for the castle ----------
function castleGoal(here) {
  const f = S.flags;
  if (f.dogsBeaten) return chaseGoal(here);
  if (f.dogsOut) return "The dogs of darkness are in the way! What could keep them busy? (Click a dog.)";
  if (f.shattered) return "The wizard is in the atrium! Talk to him.";
  if (has("trumpet")) return "Blow the crystal trumpet at the giant mirror in the hall of mirrors!";
  if (f.sphinxPassed) {
    const n = TRUMPET.filter((p) => f["got_" + p]).length;
    const light = !has("flashlight") && f.needLight ? " The present and future rooms need a flashlight (in the ship's armory)." : "";
    if (here === "pastRoom" && !f.got_mouthpiece) return f.chairMoved ? (has("book") ? "Climb up! Click the giant chair." : "The chair is too high to climb. Find something to stand on.") : "The cookie is too high! Could the kids move something to climb on?";
    if (here === "presentRoom" && !f.got_middle) return f.fogClear ? "Answer the owl's riddle." : has("flashlight") ? "Use the flashlight on the fog." : "Too foggy! Get the flashlight from the ship's armory.";
    if (here === "futureRoom" && !f.got_bell) return has("flashlight") ? "Put each stone thing on the grown-up statue it belongs to." : "Too dark! Get the flashlight from the ship's armory.";
    return `Find the 3 pieces of the crystal trumpet behind the mirrors marked PAST, PRESENT, and FUTURE (${n} of 3).` + light;
  }
  if (f.stairsUp) return here === "castleUp" ? `Answer the sphinx's riddle. Letters found downstairs: ${lettersShown()}` : f.stairsSeen ? "A staircase rose in the center room. Climb it!" : "Go back to the center room.";
  if (f.wizardGone) {
    if (!f.got_chart) return "Follow the wheel of the year! The 8 rooms have festival names. Is there a hint in one of them?";
    return "Follow the wheel of the year: go into the rooms in this order: Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lughnasadh, Mabon.";
  }
  if (f.inCastle) return here === "reception" ? "Have lemonade and muffins with the wizard. (Click the snack table.)" : "Go to the reception hall for the snack.";
  if (here !== "castle" && here !== "castleBack" && here !== "castleKitchen") return "The witch is locked up! Drive to the wizard's castle.";
  if (!f.rocksDone) return f.slipped ? "Watch the clouds closely. Hop on the rocks in the same order the clouds puff up." : "Get across the dangerous rocks to the gigantic front door. (The clouds seem to be moving in a pattern...)";
  return has("robes") ? "Knock on the gigantic front door, wearing your disguise." : "The door is shut tight. A disguise might help... maybe something from around the witch's house?";
}
