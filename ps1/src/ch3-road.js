// ch3-road.js: Chapter 3: the road map, closed supermarket, scary forest, field, swamp and witch, the optional secret mansion, and the road-trip goal lines (roadGoal).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ===================== Chapters 3 & 4: the road trip and the wizard's castle (doc/zones 05–09) =====================
const sayL = (lines) => () => lines;
function outdoor(L, skyTex, groundTex, rep = [14, 10], size = [40, 30]) {
  put(L, new THREE.SphereGeometry(90, 12, 8), mat({ map: skyTex, em: 1, fog: 0, side: THREE.BackSide }));
  return put(L, floorG(size[0], size[1], 20, 15), mat({ map: groundTex, rep }), 0, 0, 0);
}
function signpost(L, x, z, text, hot) {
  const g = group(L, x, 0, z, 0, hot);
  put(L, boxG(0.14, 1.7, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, g);
  put(L, planeG(1.4, 0.42), mat({ map: label([text], text.length * 8 + 12, 14, "#d9c39a", "#3b2a20", "#6b4f35") }), 0, 1.2, 0.08, 0, null, g);
  return g;
}
function tree(L, x, z, s = 1, col = 0x2a4a2a) {
  put(L, new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 1.6 * s, 6), mat({ color: 0x4a3222 }), x, 0.8 * s, z);
  put(L, new THREE.ConeGeometry(0.9 * s, 2.4 * s, 7), mat({ color: col }), x, 2.6 * s, z);
}
const toJeep = (stand) => ({ name: "Back to the jeep", exit: true, go: "roadmap", stand });

// ---------- the road map ----------
const MAP_NODES = {
  gas: { pos: [-8, 3.5], name: "Gas station", level: "gas" },
  mansion: { pos: [-4.2, -4.6], name: "Secret mansion", level: "mansionOut" },   // its road branches off at the supermarket
  market: { pos: [-3, 2.5], name: "Closed supermarket", level: "market" },
  forest: { pos: [1, -0.5], name: "Scary forest", level: "forest" },
  swamp: { pos: [5, 2], name: "Swamp", level: "swamp" },
  castle: { pos: [8.5, -3.5], name: "Wizard's castle", level: "castle" },
};
function nodeLocked(id) {
  const f = S.flags;
  if (id === "forest" && !f.ladyFree) return "May isn't sure which way to go yet. Maybe someone at the closed supermarket knows the way.";
  if (id === "swamp" && !f.treesAwake) return "Sleeping trees block the road in the scary forest. The jeep can't get through.";
  if (id === "castle" && !f.witchCaged) return "The wizard's castle is past the swamp... and the witch lives there.";
  return "";
}
let mapDrive = null;
function mapGo(id) {
  const lock = nodeLocked(id);
  if (lock) return say([["", lock]]);
  const n = MAP_NODES[id], from = MAP_NODES[S.flags.mapAt || "gas"];
  const intro = id === "mansion" && !S.flags.choseJeep ? [
    ["Olivia", "Jeep, bike, train... which one?"], ["May", "The bike!"], ["Jon", "The bike!"], ["Jasin", "The train!"],
    ["Olivia", "The jeep! We're already taking the jeep to the castle."], ["", "Everyone agrees with Olivia. Using two kinds would probably take longer!"], flag("choseJeep")] : [];
  say([...intro, () => {
    busy = true;
    // the mansion is on a side road from the supermarket, so drives to or from it go through the supermarket
    const at = S.flags.mapAt || "gas", via = (id === "mansion") !== (at === "mansion") && id !== "market" && at !== "market";
    const pts = [from.pos, ...(via ? [MAP_NODES.market.pos] : []), n.pos].map((p) => new THREE.Vector2(...p));
    mapDrive = { pts, from: pts[0], to: pts[1], t: 0, done: () => {
      busy = false; S.flags.mapAt = id; S.flags["visited_" + id] = true; save(); goLevel(n.level, "roadmap"); chaseArrive(id);
    } };
  }]);
}
LV.roadmap = () => {
  const L = newLevel("roadmap", "Road Map");
  put(L, new THREE.SphereGeometry(90, 12, 8), mat({ map: T.sky, em: 1, fog: 0, side: THREE.BackSide }));
  put(L, floorG(26, 18, 13, 9), mat({ map: T.worldMap }), 0, 0, 0);
  let swampHouse = null;
  const lm = {
    gas: (g) => { put(L, boxG(0.8, 0.5, 0.6), mat({ color: 0xc82020 }), 0, 0, 0, 0, null, g); put(L, boxG(1.0, 0.08, 0.8), mat({ color: 0xf0e8d0 }), 0, 0.7, 0, 0, null, g); },
    mansion: (g) => { put(L, boxG(1.0, 0.8, 0.7), mat({ color: 0x3a2a3a }), 0, 0, 0, 0, null, g); put(L, new THREE.ConeGeometry(0.75, 0.6, 4), mat({ color: 0x2a1a2a }), 0, 1.1, 0, 0, null, g); },
    market: (g) => { put(L, boxG(1.1, 0.6, 0.7), mat({ color: 0xd8c8a0 }), 0, 0, 0, 0, null, g); put(L, boxG(1.1, 0.2, 0.05), mat({ color: 0xe04e39 }), 0, 0.55, 0.36, 0, null, g); },
    forest: (g) => { [[-0.4, 0], [0.3, -0.3], [0.1, 0.4], [-0.1, -0.5]].forEach(([a, b]) => { put(L, new THREE.ConeGeometry(0.35, 1.1, 6), mat({ color: 0x1e3a1e }), a, 0.55, b, 0, null, g); }); },
    swamp: (g) => { const d = new THREE.CircleGeometry(0.8, 10); d.rotateX(-Math.PI / 2); put(L, d, mat({ color: 0x3a6a5a }), 0, 0.02, 0, 0, null, g); swampHouse = put(L, boxG(0.5, 0.4, 0.4), mat({ color: 0x5a4a3a }), 0, 0.4, 0, 0, null, g); },
    castle: (g) => { [[-0.35, 1.3], [0.35, 1.0], [0, 1.6]].forEach(([a, h]) => { put(L, new THREE.CylinderGeometry(0.15, 0.2, h, 6), mat({ color: 0x6a6070 }), a, h / 2, 0, 0, null, g); put(L, new THREE.ConeGeometry(0.2, 0.5, 6), mat({ color: 0x8a3ac8 }), a, h + 0.25, 0, 0, null, g); }); },
  };
  Object.entries(MAP_NODES).forEach(([id, n]) => {
    const g = group(L, n.pos[0], 0, n.pos[1], 0, { name: n.name, exit: true, run: () => mapGo(id), stand: [0, 7] });
    lm[id](g);
  });
  const jeep = new THREE.Group(); L.scene.add(jeep);
  put(L, boxG(0.5, 0.25, 0.35), mat({ color: 0x5a6a4a }), -0.15, 0.1, 0, 0, null, jeep);
  put(L, boxG(0.4, 0.4, 0.36), mat({ color: 0x5a6a4a }), 0.25, 0.1, 0, 0, null, jeep);
  [[-0.3, 0.2], [0.3, 0.2], [-0.3, -0.2], [0.3, -0.2]].forEach(([a, b]) => { const w = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8); w.rotateX(Math.PI / 2); put(L, w, mat({ color: 0x1a1a1e }), a, 0.12, b, 0, null, jeep); });
  L.player = addChar(L, "may", 0, 7, 1.3); L.player.show = () => false;
  L.walk = [0, 0, 7, 7]; L.start = [0, 7];
  const chaseUpd = chaseMap(L);
  L.onEnter = [["", "The road map! The little jeep shows where the crew has been. Click a stop to drive there."]];
  L.light = { amb: 0xa0a0a8, dir: [0.3, -1, -0.4], dirCol: 0x707070, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x9ab8e8, 30, 90]; L.bg = 0x9ab8e8;
  cam(L, [0, 15, 11], [0, 0, -0.5], 50, null, 200);
  L.update = (t, dt) => {
    const at = MAP_NODES[S.flags.mapAt || "gas"].pos;
    if (mapDrive) {
      mapDrive.t = Math.min(1, mapDrive.t + dt / 1.4);
      if (mapDrive.t >= 1 && mapDrive.pts.length > 2) { mapDrive.pts.shift(); mapDrive.from = mapDrive.pts[0]; mapDrive.to = mapDrive.pts[1]; mapDrive.t = 0; }
      const p = mapDrive.from.clone().lerp(mapDrive.to, mapDrive.t);
      jeep.position.set(p.x, Math.abs(Math.sin(mapDrive.t * 30)) * 0.05, p.y + 0.9);
      jeep.rotation.y = -Math.atan2(mapDrive.to.y - mapDrive.from.y, mapDrive.to.x - mapDrive.from.x);
      if (mapDrive.t >= 1) { const d = mapDrive.done; mapDrive = null; d(); }
    } else jeep.position.set(at[0], 0, at[1] + 0.9);
    if (swampHouse) swampHouse.visible = !S.flags.houseGone;
    chaseUpd(t);
  };
  return L;
};

// ---------- the closed supermarket ----------
LV.market = () => {
  const L = newLevel("market", "Closed Supermarket");
  outdoor(L, T.sky, T.asphalt);
  const shop = group(L, 0, 0, -6, 0);
  put(L, boxG(9, 3.4, 4), mat({ color: 0xd8c8a0 }), 0, 0, -2, 0, null, shop);
  put(L, planeG(4, 0.7), mat({ map: label(["SUPERMARKET"], 100, 14, "#e04e39", "#fff4d0", "#a02020"), em: 0.4 }), 0, 2.55, 0.02, 0, null, shop);
  put(L, planeG(1.6, 0.4), mat({ map: label(["CLOSED"], 56, 14, "#ffffff", "#c82020", "#c82020") }), 2.4, 1.3, 0.03, 0, null, shop);
  put(L, planeG(3, 1.6), mat({ color: 0x3a4a5a, em: 0.2 }), 2.4, 0.4, 0.02, 0, null, shop);
  const door = onWall(L, "back", [40, 12.04], doorTex("#8a8f9a", "#c8d0d8"), 1.4, 2.2, -1.6, 0, { name: "Supermarket door", stand: [-1.6, -4.6], exit: true,
    run: () => S.flags.marketOpen ? goLevel("marketIn", "market") : has("marketKey")
      ? say([["", "It's locked... but May has the supermarket key from the gas station!"], () => { remove("marketKey"); S.flags.marketOpen = true; save(); goLevel("marketIn", "market"); }])
      : say([["", "The closed supermarket is locked."]]) });
  const jeep = group(L, 6, 0, 2, -0.3, toJeep([4.6, 2.4])); miniJeep(L, jeep);
  crew(L, 0, 2);
  L.walk = [-9, 9, -3.8, 6]; L.start = [0, 2];
  L.entries = { roadmap: [4.2, 3], marketIn: [-1.6, -3.4] };
  L.light = { amb: 0x8a8aa0, dir: [-0.3, -1, -0.5], dirCol: 0x808080, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xc0d0e8, 16, 60]; L.bg = 0xc0d0e8;
  cam(L, [1, 4.6, 11], [0, 0.8, -2], 52, null, 200);
  return L;
};
function miniJeep(L, g) {
  const jm = mat({ color: 0x5a6a4a });
  put(L, boxG(1.4, 0.7, 1.4), jm, -1.0, 0.45, 0, 0, null, g);
  put(L, boxG(1.8, 1.6, 1.5), jm, 0.6, 0.45, 0, 0, null, g);
  put(L, planeG(0.9, 0.55), mat({ color: 0x9ab8c8, em: 0.2 }), 0.6, 1.35, 0.76, 0, null, g);
  [[-1.2, 0.75], [1.0, 0.75], [-1.2, -0.75], [1.0, -0.75]].forEach(([a, b]) => {
    const w = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 10); w.rotateX(Math.PI / 2);
    put(L, w, mat({ map: T.spokes }), a, 0.45, b, 0, null, g);
  });
}
function ladyAct() {
  if (!S.flags.ladyFree) return [["", "Someone is stuck under all that ramen!"]];
  S.flags.metLady = true; save();
  return [["Shopkeeper lady", "Thank you, kids! I've been stuck under that ramen since the earthquake."],
    ["Shopkeeper lady", "It was one of the wizard's experiments. It shook the whole store!"],
    ["Shopkeeper lady", "Want to get to the swamp? Drive through the scary forest."],
    ["Shopkeeper lady", "And whatever you do... stay away from the witch!"]];
}
LV.marketIn = () => {
  const L = newLevel("marketIn", "Inside the Supermarket");
  const RW = 11, RD = 7, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.oldWall, floor: T.oldTile, wallRep: 1.5, floorRep: 0.8, ceil: 0xd8d0b8, trim: 0x8a6a4a });
  onWall(L, "left", R, doorTex("#8a8f9a", "#c8d0d8"), 1.3, 2.2, 1.8, 0, { name: "Door outside", go: "market", stand: [-4.8, 1.8] });
  [[-3.5, -3.1], [3.6, -3.1]].forEach(([sx, sz]) => put(L, boxG(2.2, 2.0, 0.6), mat({ map: T.oldSnacks, rep: [2, 1] }), sx, 0, sz));
  // piles and piles of ramen
  const ramen = group(L, 0.2, 0, -2.2, 0, { name: "Pile of ramen", say: () => ramenAct() });
  const pieces = [];
  for (let i = 0; i < 60; i++) {
    const m = put(L, boxG(0.42, 0.14, 0.32), mat({ map: T.ramen }), (rnd() - 0.5) * 2.6, 0, (rnd() - 0.5) * 1.4, rnd() * 3, null, ramen);
    const r = Math.sqrt((m.position.x / 1.4) ** 2 + (m.position.z / 0.8) ** 2);
    m.position.y = Math.max(0, (1 - r) * 1.3) + rnd() * 0.12;
    m.userData.home = m.position.clone(); m.userData.spin = rnd() * 4 - 2;
    pieces.push(m);
  }
  const mac = group(L, 1.4, 0, -1.5, 0.3, { name: "Mac and cheese box", show: () => !S.flags.macMoved,
    say: () => [["", "Just one box of mac and cheese, sitting on the pile."], { choices: [["Move the box", () => [flag("macMoved"), ["", "May moves the mac and cheese box... there's someone under the ramen! It's the shopkeeper lady!"], ["Shopkeeper lady", "Help! Get me out of here!"]]], ["Leave it", () => []]] }] });
  const macBox = put(L, boxG(0.5, 0.36, 0.14), mat({ map: label(["MAC", "CHEESE"], 32, 24, "#f2b830", "#2a6ad8", "#f2b830") }), 0, 0.5, 0, 0, null, mac);
  const macMovedBox = put(L, boxG(0.5, 0.36, 0.14), mat({ map: label(["MAC", "CHEESE"], 32, 24, "#f2b830", "#2a6ad8", "#f2b830") }), 2.3, 0, -1.2, 0.8);
  const lady = addChar(L, "lady", 0.6, -1.9, 1.45, { name: "Shopkeeper lady", stand: [0.6, -0.7], say: () => ladyAct() });
  lady.show = () => !!S.flags.macMoved;
  lady.body.userData.hot.show = lady.show;
  const hat = group(L, -0.6, 0, -2.0, 0, { name: "Straw hat", show: () => S.flags.ladyFree && !S.flags.got_hat,
    say: () => [() => add("hat", "got_hat"), ["", "Under the rubble: a straw hat! It goes in your item drawer."]] });
  put(L, new THREE.CylinderGeometry(0.35, 0.35, 0.04, 10), mat({ color: 0xe8c870 }), 0, 0.03, 0, 0, null, hat);
  put(L, new THREE.CylinderGeometry(0.17, 0.2, 0.2, 10), mat({ color: 0xe8c870 }), 0, 0.14, 0, 0, null, hat);
  crew(L, -3, 1.6);
  L.walk = [-4.8, 4.8, -1.0, 2.8]; L.start = [-3, 1.6];
  L.entries = { market: [-4.2, 1.8] };
  L.onEnter = [["", "Inside the closed supermarket: piles and piles of ramen... and just one box of mac and cheese."]];
  L.light = { amb: 0x8a8a7a, dir: [0.3, -1, -0.5], dirCol: 0x706858, pts: [[[0, 3, 0], 0xfff4d8, 9], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x1a1810, 11, 26]; L.bg = 0x1a1810;
  cam(L, [0.4, 3.4, 7.4], [0.2, 0.9, -1.4], 52);
  let lift = -1;
  PP.lift = () => { lift = 0; };
  L.update = (t, dt) => {
    macMovedBox.visible = !!S.flags.macMoved;
    lady.yOff = S.flags.ladyFree ? Math.abs(Math.sin(t * 2.5)) * 0.05 : -0.95;
    if (lift >= 0) lift += dt;
    pieces.forEach((m, i) => {
      if (S.flags.ladyFree && lift < 0) { m.visible = false; return; }
      if (lift >= 0) {
        const k = Math.min(1, lift / 2.2);
        m.position.set(m.userData.home.x * (1 + k * 1.6), m.userData.home.y + k * 2.6 + Math.sin(t * 3 + i) * 0.1 * k, m.userData.home.z - k * 1.2);
        m.rotation.y += dt * m.userData.spin;
        if (lift > 2.6) m.visible = false;
      }
    });
    if (lift > 2.6) lift = -1;
  };
  return L;
};
function ramenAct() {
  if (S.flags.ladyFree) return [["", "The ramen is all stacked out of the way now."]];
  if (!S.flags.macMoved) return [["", "Piles and piles of ramen!"]];
  return [["", "The shopkeeper lady is buried under all that ramen!"], { choices: [
    ["Dig with your hands", () => [["", "May digs and digs... but there's way too much ramen!"]]],
    ["Lift the ramen with telekinesis", () => [["May", "I can lift that with my mind!"], () => PP.lift(), ["", "May lifts all the ramen into the air with her mind..."], () => { S.flags.ladyFree = true; save(); }, ["Shopkeeper lady", "Oh! I'm free!"]]],
    ["Never mind", () => []]] }];
}

// ---------- the scary forest ----------
const CRITTERS = [["raccoon", "It's a raccoon!"], ["possum", "It's a possum!"], ["owl", "It's an owl! Hoo!"], ["raccoon", "Another raccoon!"]];
function woodyAct() {
  const f = S.flags;
  if (f.treesAwake) return [["Woody", "Thanks again for the space flower!"]];
  if (has("flower")) return [["Woody", "Is that... a space flower?!"], () => remove("flower"), ["", "May gives Woody the space flower."],
    ["Woody", "Thank you! Wake up, trees! Let these kids through!"], () => { f.treesAwake = true; save(); },
    ["", "The trees blocking the road were just sleeping! They stand up and walk away. The road is clear!"]];
  f.woodyMet = true; save();
  return [["", "It's a giant tree monster! His name is Woody."], ["Woody", "I wish I had a space flower..."],
    ["", "May asks Woody to help move the trees off the road."], ["Woody", "I wish I had a space flower..."],
    ...(has("flower") ? [] : [["Jasin", "Hey! I remember a space flower... on the windowsill in the ship's kitchen!"],
      ["", "But the ship is out in the water. To get there, they'll need a boat... and the witch's apprentice has one at the swamp."]])];
}
LV.forest = () => {
  const L = newLevel("forest", "Scary Forest"); L.userData = {};
  outdoor(L, T.nightSky, T.forestFloor, [12, 9]);
  put(L, floorG(4, 30, 2, 10), mat({ map: T.asphalt, rep: [2, 14] }), 2.5, 0.02, -2);
  for (let i = 0; i < 34; i++) { const a = rnd() * Math.PI * 2, r = 7 + rnd() * 9; const x = Math.cos(a) * r, z = Math.sin(a) * r - 3; if (Math.abs(x - 2.5) > 2.6) tree(L, x, z, 1 + rnd() * 0.8, rnd() > 0.5 ? 0x1e3a1e : 0x2a4a2a); }
  [[-4, -4], [-6, 1], [7, -3], [6.5, 2.5]].forEach(([x, z]) => tree(L, x, z, 1.4));
  // sleeping trees across the road
  const sleepers = [[1.6, -6.2], [3.2, -7.0], [2.4, -8.0]].map(([x, z], i) => {
    const g = group(L, x, 0, z, 0, { name: "Sleeping tree", say: () => S.flags.treesAwake ? [] : [["", "A tree lying across the road... it's snoring! Zzz..."]] });
    const trunk = new THREE.CylinderGeometry(0.25, 0.32, 3, 6); trunk.rotateZ(Math.PI / 2);
    put(L, trunk, mat({ color: 0x5a3a22 }), 0, 0.3, 0, 0, null, g);
    put(L, new THREE.ConeGeometry(0.8, 1.6, 6).rotateZ(-Math.PI / 2), mat({ color: 0x2a4a2a }), 2.0, 0.6, 0, 0, null, g);
    put(L, planeG(0.6, 0.26), mat({ map: label(["Zzz"], 32, 14, "#14201a", "#ffffff", "#14201a"), em: 1 }), 0, 0.75, 0.35, 0, null, g);
    g.rotation.y = i * 0.4 - 0.4; g.userData.home = g.position.clone(); g.userData.ry = g.rotation.y;
    return g;
  });
  // pairs of eyes in the dark
  const critters = CRITTERS.map(([kind, line], i) => {
    const pos = [[-3.2, 0.6, -3.4], [6.0, 0.5, -1.6], [-5.2, 2.4, -0.4], [5.6, 0.6, 1.8]][i];
    const g = group(L, pos[0], pos[1], pos[2], 0, { name: "Eyes in the dark", say: () => { if (!g.userData.seen) { g.userData.seen = true; L.userData.seen = (L.userData.seen || 0) + 1; } return [["", line]]; } });
    const eyes = put(L, planeG(0.4, 0.12), mat({ map: T.eyes, em: 1 }), 0, 0.25, 0.05, 0, null, g);
    const sg = new THREE.PlaneGeometry(0.7, 0.5); sg.translate(0, 0.25, 0);
    const cr = put(L, sg, mat({ map: SPR[kind].tex, em: 0.5, side: THREE.DoubleSide }), 0, 0, 0.06, 0, null, g);
    g.userData.eyes = eyes; g.userData.cr = cr;
    return g;
  });
  // Woody: a giant tree monster who shows up after a while
  const woody = group(L, -2.4, 0, -6.5, 0.2, { name: "Woody", stand: [-1.6, -3.4], show: () => S.flags.woodyMet || L.userData.woodyReady,
    say: () => woodyAct(), use: { flower: woodyAct } });
  put(L, new THREE.CylinderGeometry(0.7, 1.0, 5, 8), mat({ color: 0x5a3a22 }), 0, 2.5, 0, 0, null, woody);
  put(L, new THREE.ConeGeometry(2.6, 4.5, 8), mat({ color: 0x2a5a2a }), 0, 6.2, 0, 0, null, woody);
  const face = put(L, planeG(1.2, 1.0), mat({ map: T.woodyFace, em: 0.6 }), 0, 2.7, 0.78, 0, null, woody);
  const armL = put(L, boxG(0.25, 2.2, 0.25), mat({ color: 0x5a3a22 }), -0.9, 2.6, 0, 0, null, woody); armL.rotation.z = 0.9;
  const armR = put(L, boxG(0.25, 2.2, 0.25), mat({ color: 0x5a3a22 }), 0.9, 2.6, 0, 0, null, woody); armR.rotation.z = -0.9;
  const woodyFlower = put(L, new THREE.SphereGeometry(0.22, 8, 6), mat({ color: 0xff7ae0, em: 0.9 }), 1.45, 3.3, 0.2, 0, null, woody);
  const woodyEyes = put(L, planeG(0.8, 0.22), mat({ map: T.eyes, em: 1 }), -2.4, 3.0, -5.7, 0.2);
  // things to find for the scarecrow, and the statue's head
  const shirt = group(L, -4.6, 1.5, -2.8, 0.4, { name: "Old shirt", show: () => !S.flags.got_shirt, say: () => [() => add("shirt", "got_shirt"), ["", "An old shirt hanging on a branch. It goes in your item drawer."]] });
  put(L, planeG(0.7, 0.7), mat({ map: T.oldShirt, side: THREE.DoubleSide }), 0, 0, 0, 0, null, shirt);
  const twigs = group(L, 5.2, 0, -0.4, 0, { name: "Bundle of twigs", show: () => !S.flags.got_twigs, say: () => [() => add("twigs", "got_twigs"), ["", "A bundle of twigs next to a tree. It goes in your item drawer."]] });
  for (let i = 0; i < 6; i++) { const b = put(L, boxG(0.05, 0.05, 0.9), mat({ color: 0x7a5a3a }), (i - 2.5) * 0.06, 0.05 + (i % 2) * 0.05, 0, 0.1 * i, null, twigs); }
  const bigTree = group(L, 7.4, 0, -4.2, -0.6, { name: "Big tree with a hole", say: () => headAct() });
  put(L, new THREE.CylinderGeometry(0.9, 1.2, 4, 8), mat({ color: 0x4a3222 }), 0, 2, 0, 0, null, bigTree);
  put(L, new THREE.CircleGeometry(0.35, 8), mat({ color: 0x0a0806, em: 1 }), 0, 1.4, 0.92, 0, null, bigTree);
  const head = put(L, new THREE.SphereGeometry(0.22, 7, 5), mat({ color: 0x9a9a90 }), 0, 1.4, 0.95, 0, null, bigTree);
  addChaseSpot(L, "forest", 2.4, -3.5, 0.25, [1.8, -1.6]);
  crew(L, 0.5, 4);
  L.walk = [-6, 7, -4, 6]; L.start = [0.5, 4];
  L.entries = { roadmap: [2.5, 5], swampField: [-5.4, 4.6] };
  group(L, 3.6, 0, 6.8, 0, toJeep([3.0, 5.6]));
  miniJeep(L, L.hots[L.hots.length - 1]);
  signpost(L, -6.6, 5.2, "< FOOTPATH", { name: "Footpath to the swamp", exit: true, go: "swampField", stand: [-5.8, 4.8] });
  L.onEnter = [["", "The scary forest. It's dark... and there are eyes everywhere."], ["", "Up ahead, trees are lying across the road. The jeep can't get through!"]];
  L.light = { amb: 0x404858, dir: [0.2, -1, -0.3], dirCol: 0x384050, pts: [[[1, 3, 2], 0x90a0ff, 9], [[-2.4, 3, -5], 0x80ff90, 5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a0e14, 8, 30]; L.bg = 0x0a0e14;
  cam(L, [1, 4.6, 11.5], [0.5, 1.0, -2.5], 54, null, 200);
  let woodyT = 0, wakeT = -1, headPopT = -1;
  L.popHead = () => { headPopT = 0; };
  L.update = (t, dt) => {
    const f = S.flags;
    woodyT += dt;
    if (!L.userData.woodyReady && (woodyT > 20 || (L.userData.seen || 0) >= 2)) L.userData.woodyReady = true;
    woodyEyes.visible = !!L.userData.woodyReady && !f.woodyMet;
    face.material.uniforms.uEm.value = 0.5 + 0.2 * Math.sin(t * 2);
    woodyFlower.visible = !!f.treesAwake;
    if (f.treesAwake) {
      armL.rotation.z = 0.9 + Math.sin(t * 3) * 0.25;
      armR.rotation.z = -0.9 - Math.sin(t * 3) * 0.25;
    }
    critters.forEach((g) => { g.userData.eyes.visible = !g.userData.seen; g.userData.cr.visible = !!g.userData.seen; g.userData.eyes.scale.y = Math.sin(t * 1.3 + g.position.x) > 0.95 ? 0.1 : 1; });
    if (headPopT >= 0) {
      headPopT += dt * 1.8;
      head.visible = headPopT < 1;
      head.position.set(0, 1.4 + Math.sin(Math.min(1, headPopT) * Math.PI) * 0.6, 0.95 + headPopT * 1.4);
      if (headPopT >= 1) headPopT = -1;
    } else head.visible = !f.got_head;
    if (f.treesAwake && wakeT < 0 && sleepers[0].visible) wakeT = 0;
    if (wakeT >= 0) {
      wakeT += dt;
      sleepers.forEach((g, i) => { const k = Math.min(1, wakeT / 2.5); g.rotation.z = k * Math.PI / 2; g.position.x = g.userData.home.x + (i % 2 ? 1 : -1) * k * 6; g.position.y = k * 1.5; if (k >= 1) g.visible = false; });
    } else if (f.treesAwake) sleepers.forEach((g) => (g.visible = false));
    if (L.chaseUpd) L.chaseUpd(t, dt);
  };
  return L;
};
function headAct() {
  if (S.flags.got_head) return [["", "A big tree with an empty hole in it."]];
  return [["", "Something round is stuck in a hole in this big tree. It's a stone head!"], { choices: [
    ["Pull it out", () => [["", "May pulls and pulls... it's stuck tight!"]]],
    ["Lift it out with telekinesis", () => [["May", "Nnnngh... this one is HEAVY!"], () => { if (L && L.popHead) L.popHead(); add("head", "got_head"); }, ["", "Pop! The stone head comes free. It goes in your item drawer. Whose head could it be?"]]],
    ["Never mind", () => []]] }];
}

// ---------- the field on the edge of the swamp ----------
function statueAct() {
  if (S.flags.statueTold) return [["Statue", "Remember my riddle: \"Follow the wheel of the year.\""]];
  if (has("head")) return [() => remove("head"), ["", "May puts the stone head back on the statue..."], ["", "The statue turns its head... and looks right at the kids!"],
    ["Statue", "Thank you for finding my head. Here is a riddle to help you inside the wizard's castle..."], ["Statue", "\"Follow the wheel of the year.\""], flag("statueTold")];
  return [["", "A stone statue of a guy on a horse. The horse has its front legs in the air... but the guy's head is gone!"]];
}
LV.swampField = () => {
  const L = newLevel("swampField", "Field by the Swamp");
  outdoor(L, T.foggySky, T.grass, [16, 12]);
  for (let i = 0; i < 40; i++) { const g = put(L, new THREE.ConeGeometry(0.06, 0.4 + rnd() * 0.3, 3), mat({ color: rnd() > 0.5 ? 0x5a8a3a : 0x6a9a4a }), (rnd() - 0.5) * 18, 0.2, (rnd() - 0.5) * 10 - 1); }
  const straw = group(L, 4.2, 0, -1.6, 0, { name: "Straw", say: () => S.flags.got_straw ? [["", "A pile of straw."]] : [() => add("straw", "got_straw"), ["", "Some straw, good for stuffing things. It goes in your item drawer."]] });
  const sp = new THREE.SphereGeometry(0.8, 8, 5); sp.scale(1.2, 0.45, 1);
  put(L, sp, mat({ color: 0xe8c870 }), 0, 0.2, 0, 0, null, straw);
  const frogs = [[-2.6, 1.2], [1.4, 2.4], [-4.2, -0.6]].map(([x, z]) => {
    const g = group(L, x, 0, z, 0, { name: "Little frog", say: [["", "Ribbit! A little frog."]] });
    const fg = new THREE.PlaneGeometry(0.35, 0.25); fg.translate(0, 0.12, 0);
    put(L, fg, mat({ map: SPR.frog.tex, em: 0.5, side: THREE.DoubleSide }), 0, 0, 0, 0, null, g);
    return g;
  });
  const statue = group(L, -1.2, 0, -3.4, 0.3, { name: "Headless statue", say: () => statueAct(), use: { head: statueAct } });
  const st = mat({ color: 0x9a9a90 });
  put(L, boxG(2.4, 0.6, 1.2), st, 0, 0, 0, 0, null, statue);
  const horse = new THREE.Group(); horse.position.set(0, 0.6, 0); horse.rotation.z = 0.45; statue.add(horse);
  put(L, boxG(1.6, 0.6, 0.5), st, 0, 0.9, 0, 0, null, horse);
  put(L, boxG(0.12, 0.9, 0.12), st, -0.6, 0, -0.15, 0, null, horse); put(L, boxG(0.12, 0.9, 0.12), st, -0.6, 0, 0.15, 0, null, horse);
  put(L, boxG(0.5, 0.4, 0.35), st, 0.95, 1.4, 0, 0, null, horse);
  put(L, boxG(0.12, 0.6, 0.12), st, 0.6, 0.6, 0.15, 0, null, horse);
  const rider = new THREE.Group(); rider.position.set(-0.1, 2.1, 0); rider.rotation.z = -0.45; horse.add(rider);
  put(L, boxG(0.4, 0.8, 0.3), st, 0, 0, 0, 0, null, rider);
  const sHead = put(L, new THREE.SphereGeometry(0.22, 7, 5), st, 0, 1.0, 0, 0, null, rider);
  crew(L, 0, 3);
  L.walk = [-8, 8, -2.2, 5]; L.start = [0, 3];
  L.entries = { forest: [-6.4, 3.6], swamp: [6.6, 2.2] };
  signpost(L, -7.6, 4.2, "< FOREST", { name: "Footpath back to the forest", exit: true, go: "forest", stand: [-6.9, 3.8] });
  signpost(L, 7.6, 2.4, "SWAMP >", { name: "Into the swamp", exit: true, go: "swamp", stand: [7.0, 2.2] });
  L.onEnter = [["", "A grassy field on the edge of the swamp. There's straw, little frogs... and a stone statue of a guy on a horse. His head is missing!"]];
  L.light = { amb: 0x7a8078, dir: [-0.3, -1, -0.4], dirCol: 0x707868, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xa8b4a8, 10, 40]; L.bg = 0xa8b4a8;
  cam(L, [0.5, 4.4, 11], [0, 0.9, -1.8], 52, null, 200);
  L.update = (t, dt) => {
    sHead.visible = !!S.flags.statueTold;
    rider.rotation.y += ((S.flags.statueTold ? 0.7 : 0) - rider.rotation.y) * Math.min(1, (dt || 0.016) * 3.5);
    frogs.forEach((g, i) => { g.position.y = Math.max(0, Math.sin(t * 2 + i * 2)) * 0.25; });
  };
  return L;
};

// ---------- the swamp and the witch ----------
const SCARE = ["twigs", "shirt", "hat", "straw"];
const SCARE_WHERE = { twigs: "a bundle of twigs (scary forest)", shirt: "an old shirt (scary forest)", hat: "a straw hat (closed supermarket)", straw: "straw (the field by the swamp)" };
const scareParts = () => (has("scarecrowKit") ? 4 : SCARE.filter((x) => has(x)).length);
const scareMissing = () => (has("scarecrowKit") ? [] : SCARE.filter((x) => !has(x)).map((x) => SCARE_WHERE[x]));
const SCARE_BUILT = [() => { SCARE.forEach(remove); remove("scarecrowKit"); S.flags.scarecrow = true; if (L && L.scareAppr) L.scareAppr(); save(); },
  ["", "The kids stand the giant scarecrow up on the old post in the fog. Spooky!"],
  ["", "They hide and watch... The apprentice sees the scarecrow looming in the fog!"], ["Apprentice", "AAAH! A monster!"],
  ["", "The apprentice runs away and leaves his boat behind!"]];
function scarecrowAct() {
  const f = S.flags;
  if (f.scarecrow) return [["", "The giant scarecrow looms in the fog. Spooky!"]];
  if (scareParts() < 4) {
    const miss = scareMissing();
    return [["", "An old wooden post sticking out of the fog, right where the apprentice can see it. A perfect spot for something spooky..."],
      ["", `To make a giant scarecrow, May still needs: ${miss.join(", ")}.`]];
  }
  return [["", "An old wooden post sticking out of the fog, right where the apprentice can see it."], { choices: [
    ["Build the giant scarecrow here", () => [...(has("scarecrowKit") ? [] : [["", "The kids tie the twigs together, put on the old shirt and the straw hat, and stuff it all with straw."]]), ...SCARE_BUILT]],
    ["Not yet", () => []]] }];
}
// Putting scarecrow parts together in the item drawer
function scarecrowCombine() {
  if (scareParts() < 4) return say([["", `That's the start of a scarecrow! Still needed: ${scareMissing().join(", ")}.`]]);
  if (L && L.id === "swamp") return say([["", "The kids put the scarecrow together right by the water..."], ...SCARE_BUILT]);
  SCARE.forEach(remove); add("scarecrowKit");
  say([["", "The kids tie the twigs together, put on the old shirt and the straw hat, and stuff it all with straw. A giant scarecrow! Now take it to the swamp, where the apprentice can see it."]]);
}
function witchAct() {
  const f = S.flags;
  if (f.witchCaged) return [["Witch", "Let me OUT of this cage!"]];
  if (!f.treesAwake) return [["", "The witch's house, standing on big bird legs. The shopkeeper said to stay away from the witch..."]];
  if (f.witchUp) return [{ choices: [
    ["Jon: hide everyone in the portal", () => [["", "Too late! The spell is already flying!"]]],
    ["Olivia: spin", () => [["", "Olivia spins... but the witch's spell is pulling everyone toward the swamp!"]]],
    ["May: telekinesis", () => [["", "May reaches out with her mind... but the witch's magic is too slippery!"]]],
    ["Jasin: kick the soccer ball", () => [() => { if (L && L.kickWitch) L.kickWitch(); }, ["", "Jasin hears the witch and kicks his soccer ball right into the witch's guts!"], ["Witch", "Oof... my guts..."], ["", "Jasin kicked so hard, the witch fell down!"],
      ["", "The kids take her into her house and lock her in a cage."], ["Witch", "Let me OUT!"], () => { f.witchCaged = true; f.witchUp = false; save(); }]],
  ] }];
  return [["", "The kids look around the witch's house on its big bird legs... nobody seems to be home."], ["", "As the kids start to walk away, the witch sneaks out and secretly waves her wand!"],
    ["Witch", "You'll be stuck in my swamp forever!"], () => { f.witchUp = true; save(); }, ["", "Quick! Who can stop her? (Click the witch's house again to choose.)"]];
}
LV.swamp = () => {
  const L = newLevel("swamp", "The Swamp");
  outdoor(L, T.foggySky, T.mud, [12, 9]);
  put(L, floorG(60, 30, 30, 15), mat({ map: T.swampWater, rep: [20, 10], wave: 0.4, scroll: [0.01, 0.005] }), 0, -0.15, -18);
  [[-7, -2], [8, -1], [-9, 3], [9, 4]].forEach(([x, z]) => tree(L, x, z, 1.3, 0x3a4a2a));
  // the witch's house on big bird legs
  const house = group(L, 2.2, 0, -10, -0.3, { name: "Witch's house", stand: [1.6, -3.2], say: () => witchAct(), show: () => !S.flags.houseGone || CUT === "swamp" });
  const legM = mat({ color: 0xd8a040 });
  [[-0.6], [0.6]].forEach(([lx]) => {
    put(L, boxG(0.16, 2.0, 0.16), legM, lx, 0, 0, 0, null, house);
    const shin = put(L, boxG(0.14, 1.6, 0.14), legM, lx, 1.8, 0.2, 0, null, house); shin.rotation.x = -0.5;
    put(L, boxG(0.6, 0.08, 0.15), legM, lx, 0, 0.2, 0, null, house);
  });
  put(L, boxG(2.6, 1.8, 2.0), mat({ color: 0x6a5a40 }), 0, 3.0, 0, 0, null, house);
  put(L, new THREE.ConeGeometry(1.9, 1.4, 4).rotateY(Math.PI / 4), mat({ color: 0x4a3a2a }), 0, 5.5, 0, 0, null, house);
  put(L, new THREE.CylinderGeometry(0.45, 0.45, 2.2, 8), mat({ color: 0x5a4a38 }), 1.2, 4.2, 0.4, 0, null, house);
  put(L, new THREE.ConeGeometry(0.6, 1.0, 8), mat({ color: 0x8a3ac8 }), 1.2, 5.8, 0.4, 0, null, house);
  put(L, boxG(0.4, 1.2, 0.4), mat({ color: 0x3a3028 }), -0.8, 4.8, -0.3, 0, null, house);
  put(L, planeG(0.6, 0.9), mat({ color: 0x2a1a10 }), 0, 2.4, 1.01, 0, null, house);
  const smoke = [0, 1, 2, 3, 4].map((i) => put(L, new THREE.SphereGeometry(0.35, 6, 4), mat({ color: 0xc8c8c8, em: 0.3 }), -0.8, 6.2, -0.3, 0, null, house));
  // empty spot where the house used to stand (after S.flags.houseGone)
  const emptySpot = group(L, 1.8, 0, -4.0, 0, { name: "Where the witch's house stood", stand: [1.6, -2.8],
    show: () => !!S.flags.houseGone && CUT !== "swamp",
    say: () => [["", "The witch's house is gone! Only giant bird footprints and chicken feathers are left in the mud."],
      ...(S.flags.apprJoined ? [["Apprentice", "Check the road map for chicken feathers and swirling wind!"]]
        : [["", "The apprentice is sitting in his boat over there. Maybe ask him where the house went!"]])] });
  [[-0.55, -0.2, 0.2], [0.55, 0.1, -0.15]].forEach(([fx, fz, ry]) => {
    const tr = new THREE.Group(); tr.position.set(fx, 0.02, fz); tr.rotation.y = ry; emptySpot.add(tr);
    [-0.35, 0, 0.35].forEach((a) => { const toe = put(L, boxG(0.08, 0.02, 0.45), mat({ color: 0x241c14 }), Math.sin(a) * 0.14, 0, Math.cos(a) * 0.14, a, null, tr); });
  });
  [[-0.3, 0.2, 0.4], [0.35, -0.1, -0.7], [0.05, 0.35, 1.1], [-0.45, -0.25, 1.9]].forEach(([fx, fz, r]) => {
    const f = put(L, planeG(0.18, 0.42), mat({ color: 0xfff8f0, em: 0.5, side: THREE.DoubleSide }), fx, 0.05, fz, r, null, emptySpot); f.rotation.x = -1.3;
  });
  const cage = group(L, 0.6, 0, -3.6, 0, { name: "Cage", show: () => !!S.flags.witchCaged && !S.flags.witchFree, say: () => [["Witch", "Let me OUT of this cage!"]] });
  put(L, boxG(1.0, 0.1, 1.0), mat({ color: 0x3a3028 }), 0, 0, 0, 0, null, cage);
  for (let i = 0; i < 6; i++) put(L, boxG(0.05, 1.8, 0.05), mat({ color: 0x9a9a90 }), -0.45 + i * 0.18, 0, 0.5, 0, null, cage);
  const witch = addChar(L, "witch", 0.6, -3.6, 1.7, { name: "Witch", stand: [1.6, -2.4], say: () => witchAct() });
  witch.show = witch.body.userData.hot.show = () => !!(S.flags.witchUp || S.flags.witchCaged) && !S.flags.houseGone;
  const spellG = new THREE.Group(); L.scene.add(spellG);
  const spellOrbs = [0, 1, 2, 3, 4].map((i) => put(L, new THREE.SphereGeometry(0.12, 6, 4), mat({ color: i % 2 ? 0x7aff7a : 0xc86aff, em: 1 }), 0, 1, 0, 0, null, spellG));
  const witchBall = put(L, new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0xfff27a, em: 1 }), 0, -5, 0);
  const wizard = addChar(L, "wizard", 1.9, -2.9, 1.9);
  wizard.show = () => CUT === "swamp" && !S.flags.houseGone;
  // the priest robes, on a clothesline behind the house
  const line1 = group(L, -4.2, 0, -4.2, 0.3, { name: "Clothesline", say: () => S.flags.got_robes ? [["", "An empty clothesline."]] : [() => add("robes", "got_robes"), ["", "Robes on a clothesline: priest robes from the witch's ministry! Good for a disguise. They go in your item drawer."]] });
  put(L, boxG(0.08, 1.8, 0.08), mat({ color: 0x5a4a38 }), -1, 0, 0, 0, null, line1); put(L, boxG(0.08, 1.8, 0.08), mat({ color: 0x5a4a38 }), 1, 0, 0, 0, null, line1);
  line(L, lineG([new THREE.Vector3(-1, 1.75, 0), new THREE.Vector3(1, 1.75, 0)]), 0x2a2a2a, line1);
  const robes = [-0.5, 0.1, 0.6].map((x) => put(L, planeG(0.45, 0.8), mat({ color: 0x2a2440, side: THREE.DoubleSide }), x, 0.95, 0, 0, null, line1));
  // the apprentice in his boat, and the scarecrow spot
  let apprRunT = -1, witchBallT = -1;
  L.scareAppr = () => { apprRunT = 0; };
  L.kickWitch = () => { witchBallT = 0; };
  const appr = addChar(L, "apprentice", -1.8, -6.0, 1.6, { name: "Apprentice", stand: [-1.8, -3.0], say: () => S.flags.dogsBeaten ? apprenticeAct() : S.flags.scarecrow ? [] : [["Apprentice", "Um... hi. I'm supposed to be a bad guy..."], ["", "He's sitting in his boat and won't leave it. Maybe something spooky would scare him off..."]],
    use: Object.fromEntries([...SCARE, "scarecrowKit"].map((x) => [x, () => [["", "He'd only be scared if something spooky popped up in the fog. Try the old post by the water."]]])) });
  appr.show = () => !S.flags.scarecrow || apprRunT >= 0 || (!!S.flags.dogsBeaten && !S.flags.apprJoined && CUT !== "swamp");
  appr.body.userData.hot.show = () => !S.flags.scarecrow || (!!S.flags.dogsBeaten && !S.flags.apprJoined && CUT !== "swamp");
  const boat = group(L, -1.8, -0.1, -6.0, 0.4, { name: "The apprentice's boat", stand: [-1.8, -3.0], show: () => !!S.flags.scarecrow, exit: true,
    run: () => { if (!S.flags.boatTaken) { S.flags.boatTaken = true; save(); } say([["", "The kids hop in the apprentice's boat and row out to the spaceship in the water."], () => goLevel("hub", "swamp")]); } });
  const hull = new THREE.CylinderGeometry(0.5, 0.35, 2.2, 8, 1, false, 0, Math.PI); hull.rotateZ(Math.PI / 2); hull.rotateX(Math.PI);
  put(L, hull, mat({ color: 0x6a4a2a, side: THREE.DoubleSide }), 0, 0.35, 0, 0, null, boat);
  const scareUse = Object.fromEntries([...SCARE, "scarecrowKit"].map((x) => [x, scarecrowAct]));
  const spot = group(L, 4.6, 0, -3.2, 0, { name: "Old post in the fog", stand: [4.0, -2.4], say: () => scarecrowAct(), use: scareUse, show: () => !S.flags.scarecrow });
  const fogBlob = new THREE.SphereGeometry(0.6, 6, 4); fogBlob.scale(1.8, 0.45, 1.2);
  put(L, fogBlob, mat({ color: 0xc8d0c8, em: 0.5 }), 0, 0.15, 0, 0, null, spot);
  put(L, boxG(0.16, 2.0, 0.16), mat({ color: 0x6a4a2a }), 0, 0, 0, 0, null, spot);
  put(L, boxG(1.0, 0.12, 0.12), mat({ color: 0x6a4a2a }), 0, 1.6, 0, 0, null, spot);
  const scare = new THREE.Group(); scare.position.set(4.6, 0, -3.4); L.scene.add(scare);
  put(L, boxG(0.12, 3.2, 0.12), mat({ color: 0x7a5a3a }), 0, 0, 0, 0, null, scare);
  put(L, boxG(2.2, 0.12, 0.12), mat({ color: 0x7a5a3a }), 0, 2.3, 0, 0, null, scare);
  put(L, boxG(1.0, 1.1, 0.4), mat({ map: T.oldShirt }), 0, 1.6, 0, 0, null, scare);
  put(L, new THREE.SphereGeometry(0.35, 7, 5), mat({ color: 0xe8c870 }), 0, 3.0, 0, 0, null, scare);
  put(L, new THREE.CylinderGeometry(0.55, 0.55, 0.05, 10), mat({ color: 0xe8c870 }), 0, 3.3, 0, 0, null, scare);
  put(L, new THREE.CylinderGeometry(0.25, 0.3, 0.3, 10), mat({ color: 0xe8c870 }), 0, 3.45, 0, 0, null, scare);
  Object.values(crew(L, -3, 2.4)).forEach((c) => (c.show = () => CUT !== "swamp"));
  L.walk = [-8, 8, -3.0, 4.5]; L.start = [-3, 2.4];
  L.entries = { swampField: [-7, 3.2], roadmap: [6.4, 3.8], hub: [-1.8, -2.6] };
  signpost(L, -8.4, 3.6, "< FIELD", { name: "Back to the field", exit: true, go: "swampField", stand: [-7.6, 3.4] });
  const jeep = group(L, 7.6, 0, 4.4, -0.4, { name: "Back to the jeep", exit: true, stand: [6.2, 3.6], show: () => !!S.flags.treesAwake,
    run: () => S.flags.witchUp && !S.flags.witchCaged ? say([["Witch", "You'll be stuck in my swamp forever!"], ["", "The witch's spell is pulling the kids back! Who can stop her?"]]) : goLevel("roadmap", "swamp") });
  miniJeep(L, jeep);
  const houseGoneLines = () => {
    S.flags.sawHouseGone = true; save();
    return [["", "The witch's house is gone! Only giant bird footprints and chicken feathers are left in the mud."],
      ...(S.flags.apprJoined ? [] : [["", "The apprentice is sitting in his boat, all alone. Maybe ask him where the house went!"]])];
  };
  L.onEnter = () => S.flags.houseGone && CUT !== "swamp"
    ? houseGoneLines()
    : S.flags.treesAwake
    ? [["", "The jeep rolls up to the swamp. There's the witch's house, standing on big bird legs!"]]
    : [["", "The kids walk to the swamp on foot. It's foggy... There's the witch's house on big bird legs, and her apprentice, sitting in a boat."]];
  L.light = { amb: 0x6a7068, dir: [-0.3, -1, -0.4], dirCol: 0x606858, pts: [[[2.2, 3.5, -8], 0xff9a50, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x8a9888, 8, 32]; L.bg = 0x8a9888;
  cam(L, [0, 4.6, 11], [0.5, 1.4, -4], 54, null, 200);
  L.update = (t, dt) => {
    const f = S.flags;
    if (f.houseGone && !f.sawHouseGone && CUT !== "swamp" && !busy && !talking()) say(houseGoneLines());
    if (f.houseGone && CUT === "swamp") { house.position.x += (dt || 0.016) * 2.2; house.position.y = Math.abs(Math.sin(t * 6)) * 0.25; }
    smoke.forEach((m, i) => { const k = (t * 0.3 + i / 5) % 1; m.position.set(-0.8 + Math.sin(k * 6 + i) * 0.4, 6.2 + k * 3, -0.3); m.scale.setScalar(0.5 + k * 1.5); });
    scare.visible = !!f.scarecrow;
    robes.forEach((r) => (r.visible = !f.got_robes));
    witch.pos.set(f.witchFree ? 1.0 : f.witchCaged ? 0.6 : 1.6, f.witchFree ? -2.8 : f.witchCaged ? -3.6 : -4.6);
    spellG.visible = !!f.witchUp && !f.witchCaged;
    if (spellG.visible) {
      spellOrbs.forEach((o, i) => {
        const a = t * 4 + i * 1.25, r = 0.7 + Math.sin(t * 3 + i) * 0.2;
        o.position.set(witch.pos.x + Math.cos(a) * r, 0.9 + Math.sin(t * 5 + i) * 0.35, witch.pos.y + Math.sin(a) * r);
      });
    }
    if (witchBallT >= 0) {
      witchBallT += (dt || 0.016) * 2.2;
      const k = Math.min(1, witchBallT);
      witchBall.position.set(L.player.pos.x + (1.6 - L.player.pos.x) * k, 0.5 + Math.sin(k * Math.PI) * 0.9, L.player.pos.y + (-4.6 - L.player.pos.y) * k);
      if (witchBallT >= 1) { witchBallT = -1; witchBall.position.y = -5; }
    }
    if (apprRunT >= 0) {
      apprRunT += (dt || 0.016);
      appr.pos.set(-1.8 - apprRunT * 4.5, -6.0);
      appr.yOff = Math.abs(Math.sin(apprRunT * 14)) * 0.35;
      if (apprRunT > 1.8) { apprRunT = -1; appr.pos.set(-1.8, -6.0); }
    } else {
      appr.pos.set(-1.8, -6.0);
      appr.yOff = Math.sin(t * 1.5) * 0.06;
    }
  };
  return L;
};

// ---------- the secret mansion (optional stop; not placed in the story yet) ----------
LV.mansion = () => {
  const L = newLevel("mansion", "Secret Mansion");
  const RW = 10, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x2a1a20 });
  onWall(L, "back", R, doorTex("#3a2a20", "#6a5040"), 1.3, 2.3, -2.6, 0, { name: "Left", go: "mansionLiving", stand: [-2.6, -1.3] });
  onWall(L, "back", R, doorTex("#3a2a20", "#6a5040"), 1.3, 2.3, 2.6, 0, { name: "Right", go: "mansionKitchen", stand: [2.6, -1.3] });
  onWall(L, "back", R, label(["LEFT"], 40, 14, "#1a1010", "#e8d0a0", "#1a1010"), 1.0, 0.35, -2.6, 2.5, null);
  onWall(L, "back", R, label(["RIGHT"], 44, 14, "#1a1010", "#e8d0a0", "#1a1010"), 1.0, 0.35, 2.6, 2.5, null);
  onWall(L, "left", R, doorTex("#3a2a20", "#6a5040"), 1.2, 2.2, 1.6, 0, { name: "Front door", go: "mansionOut", stand: [-4.3, 1.6] });
  onWall(L, "right", R, doorTex("#3a2a20", "#b86ae8"), 1.2, 2.2, 1.6, 0, { name: "Door to the music hall", go: "mansionMusic", stand: [4.3, 1.6], show: () => !!S.flags.chaseDone });
  crew(L, -1.5, 1.4);
  L.walk = [-4.3, 4.3, -1.35, 2.5]; L.start = [-1.5, 1.4];
  L.entries = { mansionOut: [-3.8, 1.6], mansionLiving: [-2.6, -0.9], mansionKitchen: [2.6, -0.9], mansionMusic: [3.8, 1.6] };
  L.onEnter = [["", "The secret mansion. Very creepy..."], ["", "Two doors: left or right?"]];
  L.light = { amb: 0x4a4048, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[0, 3, 0], 0xffb070, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 9, 22]; L.bg = 0x0a080a;
  cam(L, [0.3, 3.1, 6.6], [0, 1.2, -1.4], 52);
  return L;
};
LV.mansionLiving = () => {
  const L = newLevel("mansionLiving", "Mansion Living Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x2a1a20 });
  onWall(L, "back", R, doorTex("#3a2a20", "#6a5040"), 1.2, 2.2, -3.4, 0, { name: "Back to the hall", go: "mansion", stand: [-3.3, -1.3] });
  const couch = group(L, 1.4, 0, -2.5, 0, { name: "Ripped couch", say: [["", "The couch is ripped... and there are spiders in it! It doesn't look comfortable at all."]] });
  const cm = mat({ color: 0x5a3a4a });
  put(L, boxG(2.6, 0.5, 0.9), cm, 0, 0, 0, 0, null, couch); put(L, boxG(2.6, 0.7, 0.25), cm, 0, 0.5, -0.33, 0, null, couch);
  [[-0.6, 0.55], [0.5, 0.6], [0.9, 0.95]].forEach(([a, y]) => { const sg = new THREE.PlaneGeometry(0.35, 0.3); put(L, sg, mat({ map: SPR.spider.tex, em: 0.4, side: THREE.DoubleSide }), a, y, 0.3, 0, null, couch); });
  const tv = group(L, -1.2, 0, -2.6, 0, { name: "TV", say: [["", "May turns on the TV... it's really hard to put anything on. Just fuzz!"]] });
  put(L, boxG(1.0, 0.8, 0.6), mat({ color: 0x3a3030 }), 0, 0.4, 0, 0, null, tv);
  put(L, planeG(0.8, 0.55), mat({ map: T.tvStatic, em: 0.8, scroll: [0.7, 1.3] }), 0, 0.53, 0.31, 0, null, tv);
  const dog = addChar(L, "dog", 3.2, -1.2, 0.8, { name: "Mean dog", stand: [2.0, -0.6],
    say: () => [["", "A pet dog... but it's really mean! It jumps up at the kids, trying to bite them!"], ["Everyone", "AHHHHH!"],
      ["", "All the kids run to the kitchen, away from the spiders and all the creepy stuff!"], () => goLevel("mansionKitchen", "mansionLiving")] });
  crew(L, -1.6, 1.4);
  L.walk = [-3.8, 3.8, -1.35, 2.5]; L.start = [-1.6, 1.4];
  L.entries = { mansion: [-3.2, -1.0] };
  L.onEnter = [["", "The living room. A ripped couch, a TV... and a dog."]];
  L.light = { amb: 0x4a4048, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[-1.2, 1, -2], 0xa0c0ff, 4], [[0, 3, 0], 0xffb070, 6], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 9, 22]; L.bg = 0x0a080a;
  cam(L, [0.3, 3.1, 6.4], [0, 1.1, -1.4], 52);
  L.update = (t) => { dog.yOff = Math.abs(Math.sin(t * 5)) * 0.15; };
  return L;
};
LV.mansionKitchen = () => {
  const L = newLevel("mansionKitchen", "Mansion Kitchen");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.creepyWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x1a1418, trim: 0x2a1a20 });
  onWall(L, "back", R, doorTex("#3a2a20", "#6a5040"), 1.2, 2.2, -3.4, 0, { name: "Back to the hall", go: "mansion", stand: [-3.3, -1.3] });
  const table = group(L, 1.0, 0, -2.2, 0, { name: "Table full of food", say: [["", "There's lots of food in here! So much food."], ["", "(What the mansion's mystery is: the kids are still deciding!)"]] });
  put(L, boxG(3.4, 0.08, 1.2), mat({ color: 0x5a3a28 }), 0, 0.8, 0, 0, null, table);
  [[-1.5, -0.5], [1.5, -0.5], [-1.5, 0.5], [1.5, 0.5]].forEach(([a, b]) => put(L, boxG(0.08, 0.8, 0.08), mat({ color: 0x3a2a1a }), a, 0, b, 0, null, table));
  const foods = [0xe04e39, 0xf2b830, 0x3fae4a, 0xe8559a, 0xd8a060, 0xa86a3a, 0xf0e8d0];
  const can = group(L, 3.4, 0, -2.4, 0, { name: "Can of dog food", show: () => !S.flags.got_dogFood, say: () => take("dogFood") });
  put(L, new THREE.CylinderGeometry(0.16, 0.16, 0.3, 10), mat({ color: 0xc83a3a }), 0, 0, 0, 0, null, can);
  put(L, new THREE.CylinderGeometry(0.165, 0.165, 0.12, 10), mat({ color: 0xf0e8d0 }), 0, 0.1, 0, 0, null, can);
  for (let i = 0; i < 14; i++) put(L, i % 2 ? new THREE.SphereGeometry(0.14, 6, 4) : boxG(0.24, 0.18, 0.2), mat({ color: foods[i % foods.length] }), -1.4 + (i % 7) * 0.45, 0.95, -0.3 + Math.floor(i / 7) * 0.5, 0, null, table);
  crew(L, -1.6, 1.4);
  L.walk = [-3.8, 3.8, -1.35, 2.5]; L.start = [-1.6, 1.4];
  L.entries = { mansion: [-3.2, -1.0], mansionLiving: [-2.6, 0.6] };
  L.onEnter = [["", "The kitchen. There's lots of food!"]];
  L.light = { amb: 0x5a5048, dir: [0.3, -1, -0.5], dirCol: 0x403840, pts: [[[1, 3, -1], 0xffd090, 7], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0a080a, 9, 22]; L.bg = 0x0a080a;
  cam(L, [0.3, 3.1, 6.4], [0, 1.1, -1.4], 52);
  return L;
};

function roadGoal() {
  const f = S.flags, here = L ? L.id : "";
  if (f.witchCaged) return castleGoal(here);
  if (f.treesAwake) {
    if (f.witchUp) return "The witch is casting a spell! Who can stop her? Click the witch's house.";
    return here === "swamp" ? "Look around the witch's house... carefully." : "The road is clear! Drive to the swamp and find the witch.";
  }
  if (f.woodyMet) {
    if (has("flower")) return "Bring Woody the space flower in the scary forest.";
    if (f.boatTaken) return "Row to the ship and find the space flower on the kitchen windowsill. Then bring it to Woody.";
    if (f.scarecrow) return "The apprentice ran away! Take his boat out to the ship.";
    const n = SCARE.filter((x) => has(x)).length;
    if (has("scarecrowKit")) return "Take the giant scarecrow to the old post in the fog at the swamp.";
    if (f.sawSwamp) {
      const miss = scareMissing();
      return miss.length ? `Scare the apprentice off his boat with a giant scarecrow! Still needed: ${miss.join(", ")}.`
        : "May has all 4 scarecrow parts! Build it at the old post in the fog by the water (or put the parts together in the item drawer).";
    }
    return "Woody wants a space flower. It's on the ship, out in the water. Take the footpath to the swamp to find a boat.";
  }
  if (f.ladyFree) return here === "forest" ? "Click the eyes in the dark... and wait. Something big might show up." : here === "marketIn" && !f.metLady ? "Talk to the shopkeeper lady." : "Drive to the scary forest.";
  if (f.macMoved) return "The shopkeeper lady is buried under the ramen! How could May lift all of it?";
  if (here === "marketIn") return "Look around the supermarket. What's on top of that pile?";
  if (here === "market") return "The supermarket is closed. Maybe May has a key?";
  return "Click the closed supermarket on the road map.";
}
