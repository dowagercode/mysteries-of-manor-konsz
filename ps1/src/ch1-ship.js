// ch1-ship.js: Chapter 1: every room on the spaceship, the Follow the Mouse crumbs, and the Chapter 1 puzzles (fridge, drawers, cake, Jon, engine, armory).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

LV.mays = () => {
  const L = newLevel("mays", "May's Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.mayWall, floor: T.mayCarpet, wallRep: 1.1, ceil: 0xd9b8d0, trim: 0xe85f9a });
  onWall(L, "back", R, T.mayDoor, 1.15, 2.1, -3.5, 0, { name: "Door to the hallway", go: "hall", stand: [-3.4, -1.3] });
  onWall(L, "back", R, T.maySign, 1.6, 0.8, 3.2, 2.35, { name: "Sign: May's room", say: [["", "\"May's room\", with a heart."]] }, 0xc41e47);
  onWall(L, "back", R, T.iLove, 0.95, 0.7, 1.7, 1.95, { name: "I love ♥ picture", say: [["", "A picture that says \"I love\", with a heart."]] }, 0xf29bb0);
  // heart shelf with treasures
  const shelf = group(L, 1.8, 0.75, -2.9, 0, { name: "Heart shelf", say: [["", "A heart-shaped shelf with May's treasures on it."]] });
  put(L, heartG(0.45, 0.16), mat({ color: 0xffffff }), 0, 0.45, 0, 0, null, shelf);
  put(L, boxG(0.6, 0.04, 0.2), mat({ color: 0xe0337f }), 0, 0.42, 0.06, 0, null, shelf);
  put(L, boxG(0.1, 0.14, 0.08), mat({ color: 0xe0337f }), -0.18, 0.46, 0.1, 0, null, shelf);
  put(L, new THREE.IcosahedronGeometry(0.06, 0), mat({ color: 0xa24fd6 }), 0.16, 0.52, 0.1, 0, null, shelf);
  // sugar for the cake
  const sugar = group(L, -1.9, 0, -2.6, 0.3, { name: "Sugar", show: () => !S.flags.got_sugar, say: () => take("sugar") });
  put(L, boxG(0.32, 0.42, 0.22), mat({ map: label(["SUGAR"], 48, 16, "#ffffff", "#5a6aa8", "#cfd6f0") }), 0, 0, 0, 0, null, sugar);
  // Barbie Dream House
  const dh = group(L, -0.5, 0, -2.45, 0, { name: "Barbie Dream House", say: [{ choices: [
    ["Look at it", () => [["", "May's Barbie Dream House."]]],
    ["Play with it", () => { openDollhouse(); return []; }],
  ] }] });
  put(L, boxG(1.6, 1.0, 0.9), mat({ color: 0xf07ab0 }), 0, 0, 0, 0, null, dh);
  put(L, planeG(1.6, 1.0), mat({ map: T.dreamFront }), 0, 0, 0.46, 0, null, dh);
  const roof = new THREE.CylinderGeometry(0.62, 0.62, 1.0, 3, 1); roof.rotateZ(-Math.PI / 2); roof.rotateX(-Math.PI / 2);
  const rf = put(L, roof, mat({ color: 0xff9cc8 }), 0, 1.31, 0, 0, null, dh); rf.scale.set(1.65, 1, 0.9);
  put(L, planeG(0.9, 0.56), mat({ map: T.dreamSign }), 0, 1.42, 0.5, 0, null, dh);
  // bed: red-pink frame, flower blanket, heart pillow
  const bed = group(L, 2.7, 0, -2.25, 0, { name: "May's bed", say: [["", "May's bed, with a heart pillow and a flower blanket."]] });
  put(L, boxG(2.6, 0.45, 1.3), mat({ color: 0xe0336a }), 0, 0, 0, 0, null, bed);
  put(L, boxG(2.62, 0.08, 1.32), mat({ map: T.blanket, rep: [2, 1] }), 0, 0.45, 0, 0, null, bed);
  put(L, boxG(0.12, 1.1, 1.3), mat({ color: 0xc41e47 }), 1.3, 0, 0, 0, null, bed);
  put(L, boxG(0.5, 0.3, 0.9), mat({ map: T.pillow({ rows: HEART, x: 5, c: { "#": "#d8234d" } }) }), 0.95, 0.53, 0, 0, null, bed);
  // heart balloons on wavy strings: purple, purple, red, red, pink, pink
  const cols = [0xb77cf0, 0xa868e0, 0xc8102e, 0xd01a3c, 0xe8559a, 0xf06aa8];
  const balloons = cols.map((c, i) => {
    const bx = -3.0 + i * 0.85, by = 1.75 + (i % 2) * 0.25;
    const g = group(L, bx, by, -2.6, 0, { name: "Heart balloons", say: [["", "Heart balloons: purple, red, and pink."]] });
    put(L, heartG(0.26, 0.14), mat({ color: c }), 0, 0, 0, 0, null, g);
    line(L, wavyString(0, 0.25, 3.4 - by, 0, 0.1), c, g);
    return g;
  });
  onWall(L, "left", R, TEX.mays, 1.3, 0.9, -1.9, 1.3, { name: "Addie's drawing", say: [["", "Addie's drawing of May's room. This 3D room is built from it."]] }, 0x8a6a4a);
  const may = addChar(L, "may", 0, 1, 1.3);
  L.player = may;
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [0, 1]; L.entries = { hall: [-3.3, -1.0] };
  L.light = { amb: 0x8a7a88, dir: [0.4, -1, -0.7], dirCol: 0x706068, pts: [[[0, 2.9, 0.5], 0xffd0e0, 7], [[-3, 1.5, -2], 0xc090ff, 4], [[0, 0, 0], 0, 1]] };
  L.fog = [0x2a1a2a, 10, 24]; L.bg = 0x2a1a2a;
  cam(L, [0.4, 3.1, 6.4], [0, 1.1, -1.4], 52);
  L.update = (t) => balloons.forEach((b, i) => { b.position.y = 1.75 + (i % 2) * 0.25 + Math.sin(t * 1.3 + i) * 0.06; b.rotation.y = Math.sin(t * 0.8 + i) * 0.3; });
  return L;
};

LV.jasins = () => {
  const L = newLevel("jasins", "Jasin's Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.jasWall, floor: T.pitch, wallRep: 1.3, floorRep: 1.2, ceil: 0xc8d0b8, trim: 0x3fae6a });
  onWall(L, "back", R, T.jasDoor, 1.15, 2.1, -3.4, 0, { name: "Door to the hallway", go: "hall", stand: [-3.3, -1.3] });
  onWall(L, "back", R, T.jasSign, 1.5, 0.75, -2.7, 2.5, { name: "Sign: Jasin's room", say: [["", "\"Jasin's room\", in green."]] }, null);
  onWall(L, "back", R, T.soccerPic, 0.8, 0.8, 0.9, 2.15, { name: "Soccer ball picture", say: [["", "A picture of a soccer ball."]] }, 0xb8a894);
  // medals from his soccer games: orange with green ribbons
  const medals = group(L, 2.9, 1.5, -2.97, 0, { name: "Jasin's medals", say: [["", "Medals from Jasin's soccer games. Lots of them."]] });
  [[-0.9, 1.0], [0, 1.15], [0.9, 1.0], [-0.4, 0.45], [0.55, 0.5], [-0.9, -0.1], [0.4, -0.05]].forEach(([mx, my]) => {
    const d = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 8); d.rotateX(Math.PI / 2);
    put(L, d, mat({ color: 0xf0973a }), mx, my, 0.03, 0, null, medals);
    line(L, lineG([new THREE.Vector3(mx - 0.22, my + 0.5, 0.02), new THREE.Vector3(mx, my + 0.08, 0.02), new THREE.Vector3(mx + 0.25, my + 0.55, 0.02)]), 0x2f9a57, medals);
  });
  // soccer-ball balloons on grey strings
  const balls = [-1.4, -0.1, 1.5].map((bx, i) => {
    const g = group(L, bx, 1.7 - (i % 2) * 0.2, -2.4, 0, { name: "Soccer-ball balloons", say: [["", "Soccer-ball balloons!"]] });
    put(L, soccerG(0.32), mat({ vc: true }), 0, 0, 0, 0, null, g);
    line(L, wavyString(0, 0.3, 1.8, 0, 0.14), 0x8a8a90, g);
    return g;
  });
  // black striped bed with a soccer ball pillow
  const bed = group(L, 2.8, 0, -2.25, 0, { name: "Jasin's bed", say: [["", "Jasin's bed, with a soccer ball pillow."]] });
  const bm = mat({ color: 0x1a1a1e });
  [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]].forEach(([a, b]) => put(L, boxG(0.08, 0.7, 0.08), bm, a, 0, b, 0, null, bed));
  put(L, boxG(2.5, 0.12, 1.2), mat({ map: T.jasBed, rep: [3, 1] }), 0, 0.55, 0, 0, null, bed);
  put(L, boxG(0.1, 1.2, 1.2), bm, 1.25, 0, 0, 0, null, bed);
  put(L, boxG(0.45, 0.3, 0.8), mat({ map: T.pillow({ rows: BALL, x: 4, c: { "#": "#1a1a1e" } }) }), 0.9, 0.66, 0, 0, null, bed);
  // oil for the cake
  const oil = group(L, -1.8, 0, -2.65, 0, { name: "Oil", show: () => !S.flags.got_oil, say: () => take("oil") });
  put(L, new THREE.CylinderGeometry(0.11, 0.13, 0.5, 6), mat({ color: 0xe8c040 }), 0, 0.25, 0, 0, null, oil);
  put(L, new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), mat({ color: 0x2f9a57 }), 0, 0.56, 0, 0, null, oil);
  onWall(L, "left", R, TEX.jasins, 1.3, 0.9, -1.9, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of Jasin's room. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", 0, 1, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [0, 1]; L.entries = { hall: [-3.2, -1.0] };
  L.light = { amb: 0x7a8478, dir: [-0.3, -1, -0.6], dirCol: 0x707a68, pts: [[[0, 2.9, 0.5], 0xfff0c8, 7], [[3, 2, -2], 0xffa850, 3.5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x18241a, 10, 24]; L.bg = 0x18241a;
  cam(L, [-0.6, 3.1, 6.4], [0.2, 1.1, -1.4], 52);
  L.update = (t) => balls.forEach((b, i) => { b.position.y = 1.7 - (i % 2) * 0.2 + Math.sin(t * 1.2 + i * 2) * 0.06; b.rotation.y = t * 0.4 + i; });
  return L;
};

LV.olivias = () => {
  const L = newLevel("olivias", "Olivia's Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.livWall, floor: T.wood, wallRep: 1.2, floorRep: 1.4, ceil: 0xd8c8e8, trim: 0xb77cf0 });
  // red arched door with the kids' ballerina on it
  const door = C(48, 84, (x, w, h) => {
    arch(x, w, h, "#fff3f6", "#d8234d");
    x.imageSmoothingEnabled = true; x.drawImage(RAW.dancer, 9, 22, 30, 42);
    x.fillStyle = "#d8234d"; x.fillRect(6, 52, 3, 5);
    const d = x.getImageData(0, 0, w, h);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 100 ? 255 : 0;
    x.putImageData(d, 0, 0);
  }, false);
  onWall(L, "back", R, door, 1.2, 2.1, -3.4, 0, { name: "Door to the hallway", go: "hall", stand: [-3.3, -1.3] });
  onWall(L, "back", R, label(["OLIVIA'S", "ROOM"], 72, 36, "#fbf6ff", "#9b4fd1", "#b77cf0", (x) => {
    x.fillStyle = "#9b4fd1"; [[0, 0], [66, 0], [0, 30], [66, 30]].forEach(([a, b]) => x.fillRect(a, b, 6, 6));
  }), 1.6, 0.8, 3.0, 2.35, { name: "Sign: Olivia's room", say: [["", "\"Olivia's room\", in purple."]] });
  onWall(L, "back", R, TEX.livPoster, 1.7, 1.05, -0.4, 1.55, { name: "Dance poster",
    say: [["", "A poster of dancers that says \"Dans\" (dance). There's a word at the bottom too. (Ask the kids what it says!)"]] });
  // purple bed with the dancer pillow
  const bed = group(L, 2.7, 0, -2.25, 0, { name: "Olivia's bed", say: [["", "Olivia's bed, with a dancer on the pillow."]] });
  put(L, boxG(2.6, 0.45, 1.3), mat({ color: 0xb77cf0 }), 0, 0, 0, 0, null, bed);
  put(L, boxG(2.62, 0.08, 1.32), mat({ color: 0xd8b8f8 }), 0, 0.45, 0, 0, null, bed);
  put(L, boxG(0.12, 1.1, 1.3), mat({ color: 0x9b4fd1 }), 1.3, 0, 0, 0, null, bed);
  const pil = group(L, 0.95, 0.53, 0, 0, null); bed.add(pil);
  put(L, boxG(0.5, 0.36, 0.9), mat({ color: 0xffffff }), 0, 0, 0, 0, null, pil);
  put(L, planeG(0.42, 0.32), mat({ map: TEX.livPillow }), 0, 0.02, 0.451, 0, null, pil);
  // flour for the cake
  const flour = group(L, 1.0, 0, -2.6, -0.2, { name: "Flour", show: () => !S.flags.got_flour, say: () => take("flour") });
  put(L, boxG(0.36, 0.48, 0.24), mat({ map: label(["FLOUR"], 48, 16, "#ffffff", "#8a6a4a", "#e8dcc8") }), 0, 0, 0, 0, null, flour);
  onWall(L, "left", R, TEX.olivias, 1.3, 0.94, -1.9, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of Olivia's room. This 3D room is built from it."]] }, 0x8a6a4a);
  addChar(L, "olivia", -1.6, -1.1, 1.3, { name: "Olivia", stand: [-0.6, -0.6], say: () => oliviaAct(), use: { pills: oliviaAct } });
  L.player = addChar(L, "may", 0.4, 1, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [0.4, 1]; L.entries = { hall: [-3.2, -1.0] };
  L.light = { amb: 0x8a7a92, dir: [0.3, -1, -0.6], dirCol: 0x706874, pts: [[[0, 2.9, 0.5], 0xffe0f0, 7], [[-3, 1.6, -2], 0xff9cb8, 3.5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x241a2e, 10, 24]; L.bg = 0x241a2e;
  cam(L, [0.2, 3.1, 6.4], [0, 1.1, -1.4], 52);
  return L;
};

LV.hideout = () => {
  const L = newLevel("hideout", "Inside Jon's Portal");
  const R = 4;
  const wall = new THREE.CylinderGeometry(R, R, 4.2, 16, 4, true); wall.translate(0, 2.1, 0);
  put(L, wall, mat({ map: T.holeWall, em: 0.55, side: THREE.BackSide, rep: [4, 1] }));
  const fl = new THREE.CircleGeometry(R, 16); fl.rotateX(-Math.PI / 2);
  put(L, fl, mat({ map: T.holeFloor, rep: [3, 3] }));
  const rim = new THREE.RingGeometry(R - 0.05, R + 0.3, 16); rim.rotateX(-Math.PI / 2);
  put(L, rim, mat({ color: 0x2a1f3d }), 0, 0.01, 0);
  // the way out: an oval doorway in the wall that shows Jon's room on the other side (live view)
  const out = group(L, -2.55, 0, -2.85, 0.73, { name: "Climb out to Jon's room", stand: [-2.2, -1.5], go: "jons" });
  const viewRT = new THREE.WebGLRenderTarget(96, 192, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const viewCam = new THREE.PerspectiveCamera(78, 0.5, 0.1, 60);
  viewCam.position.set(3.25, 1.25, -0.55); viewCam.lookAt(-0.2, 0.95, -2.9);
  const view = new THREE.CircleGeometry(1, 16); view.scale(0.55, 1.12, 1); view.translate(0, 1.2, 0);
  put(L, view, mat({ map: viewRT.texture, em: 1, fog: 0 }), 0, 0, 0, 0, null, out);
  const doorRim = new THREE.RingGeometry(0.97, 1.12, 16); doorRim.scale(0.55, 1.12, 1); doorRim.translate(0, 1.2, 0);
  put(L, doorRim, mat({ color: 0xb77cf0, em: 0.7 }), 0, 0, 0.01, 0, null, out);
  let viewT = 1; L.viewCam = viewCam;
  L.preRender = (dt) => {   // redraw the view of Jon's room a few times a second
    viewT += dt; if (viewT < 0.2) return; viewT = 0;
    const jl = getLevel("jons"), me = jl.player.root, was = me.visible;
    me.visible = false;   // May is in here, not out there
    applyLight(jl); renderer.setRenderTarget(viewRT); renderer.render(jl.scene, viewCam);
    me.visible = was; applyLight(L);
  };
  // tall box with a pink flower
  const box = group(L, -0.4, 0, -3.0, 0.15, { name: "Tall box", say: [["", "A tall box with a pink flower on it."]] });
  put(L, boxG(0.9, 1.8, 0.7), mat({ map: T.tallBox }), 0, 0, 0, 0, null, box);
  // the mystery egg
  const egg = group(L, 0.9, 0, -1.9, 0, { name: "A mystery egg with a ?", stand: [-0.1, -1.3] });
  const eg = new THREE.SphereGeometry(0.28, 8, 6); eg.scale(1, 1.3, 1); eg.translate(0, 0.36, 0);
  const eggMesh = put(L, eg, mat({ map: T.egg }), 0, 0, 0, -Math.PI / 2, null, egg);
  egg.userData.hot.say = () => [{ choices: [
    ["Look at it", () => [["", "A mystery egg with a ? on it. What could be inside?"]]],
    ["Lift it with my mind", () => [["May", "I can lift that with my mind!"], () => (egg.floatT = 0),
      ["", "Telekinesis! May floats the mystery egg up... and sets it back down."]]],
  ] }];
  const papers = group(L, -1.7, 0, -2.3, 0.4, { name: "Pile of papers",
    say: () => S.flags.gotBoxKey ? [["", "Just a messy pile of papers."]] : [["", "A messy pile of papers..."], () => add("boxKey", "gotBoxKey"), ["", "Underneath: a little key! It goes in your item drawer."]] });
  const keyUnder = put(L, boxG(0.18, 0.04, 0.08), mat({ color: 0xffd23f, em: 0.7 }), 0.05, 0.01, 0.05, 0.4, null, papers);
  const sheets = [0, 0.06, 0.12, 0.18, 0.24].map((py, i) => { const sh = put(L, boxG(0.6, 0.05, 0.45), mat({ color: i % 2 ? 0xf4f0e4 : 0xffffff }), 0, py, 0, 0, null, papers); sh.rotation.y = i * 0.35; return sh; });
  // Jon, hiding
  const jon = addChar(L, "jon", 2.3, -1.5, 1.3, { name: "Jon", stand: [1.2, -0.7] });
  jon.show = () => !S.flags.gaveCake;
  Object.assign(jon.body.userData.hot, { show: jon.show, say: () => jonHoleAct(), use: { cake: giveCake } });
  L.player = addChar(L, "may", -1.6, 1.4, 1.3);
  L.walk = [-3, 3, -2.2, 2.4];
  L.start = [-1.6, 1.4]; L.entries = { jons: [-1.6, 1.4] };
  L.onEnter = [["", "May climbs inside Jon's portal. It's a cozy round room!"]];
  L.light = { amb: 0x8a70b0, dir: [0.2, -1, -0.4], dirCol: 0x806898, pts: [[[-2.1, 1.5, -2.2], 0xd8b8ff, 4.5], [[1, 2.5, 0], 0xd0a0ff, 6], [[0, 0, 0], 0, 1]] };
  L.fog = [0x2a1450, 9, 22]; L.bg = 0x2a1450;
  cam(L, [0.8, 2.7, 4.6], [0, 0.9, -1.2], 58);
  L.update = (t, dt) => {
    keyUnder.visible = !S.flags.gotBoxKey;
    sheets.forEach((sh, i) => {
      if (S.flags.gotBoxKey && i >= 2) { sh.position.x = (i - 1) * 0.18; sh.position.z = (i % 2 ? 1 : -1) * 0.14; }
    });
    if (egg.floatT != null) {
      egg.floatT += dt / 1.6;
      const k = Math.min(1, egg.floatT);
      egg.position.y = Math.sin(k * Math.PI) * 0.9;
      eggMesh.rotation.z = Math.sin(k * Math.PI * 4) * 0.25 * Math.sin(k * Math.PI);
      if (k >= 1) egg.floatT = null;
    }
  };
  return L;
};

// The ship's hallway: cabins spaced out on both sides, engine room aft, control room fore.
// Door order is a placeholder until the kids choose.
const HALL_DOORS = [
  ["storage", "STORAGE", "left", 12, "#7a4a2a", "#e2cdb0"],
  ["bath", "BATHROOM", "left", 6.5, "#7a4a2a", "#e2cdb0"],
  ["mays", "MAY'S ROOM", "left", 1, "#e8559a", "#ffe0ee"],
  ["jons", "JON'S ROOM", "left", -4.5, "#3a86c8", "#e0f0ff"],
  ["hub", "KITCHEN + REC", "right", 11, "#7a4a2a", "#e2cdb0"],
  ["jasins", "JASIN'S ROOM", "right", 4, "#2f9a57", "#e8f8ec"],
  ["olivias", "OLIVIA'S ROOM", "right", -1.5, "#b77cf0", "#f4eaff"],
  ["playroom", "PLAYROOM", "right", -7, "#7a4a2a", "#e2cdb0"],
];
const ROOM_NAMES = { roadmap: "road map", gasShop: "shop", gasRest: "restroom", gas: "gas station", hall: "hallway", storage: "storage", bath: "bathroom", mays: "May's room", jons: "Jon's room", hub: "kitchen + rec room",
  jasins: "Jasin's room", olivias: "Olivia's room", playroom: "playroom", engine: "engine room", control: "control room" };
function doorTex(edge, fill, extra) {
  return C(32, 56, (x, w, h) => {
    arch(x, w, h, fill, edge);
    x.fillStyle = edge; x.fillRect(24, 30, 3, 5);
    extra && extra(x, w, h);
  }, false);
}
const signTex = (text, color) => label([text], Math.max(56, text.length * 8 + 12), 14, "#20243c", color, "#0e1020");
const toHall = (name) => ({ name: name || "Door to the hallway", go: "hall", stand: [-3.3, -1.3] });
const standIn = (what) => [["", `The kids haven't drawn the ${what} yet, so this one is a stand-in.`]];

function buildSpaceship(L, ship, tilt = -0.28, fog = 1, em = 0) {
  const body = new THREE.SphereGeometry(1, 14, 9); body.scale(3.4, 1.8, 2.0);
  const sb = put(L, body, mat({ map: T.shipBody, fog, em }), 0, 1.0, 0, 0, null, ship); sb.rotation.z = tilt;
  const finM = mat({ color: 0xa24fd6, fog, em });
  const fin1 = put(L, boxG(1.6, 0.12, 1.0), finM, -3.2, 2.4, 0, 0, null, ship); fin1.rotation.z = 0.3;
  const fin2 = put(L, boxG(1.6, 0.12, 1.0), finM, -3.4, 1.6, 0, 0, null, ship); fin2.rotation.z = -0.5;
  const lad = mat({ color: 0x2a1f3d, fog, em });
  put(L, boxG(0.06, 1.6, 0.06), lad, -0.3, -0.9, 1.4, 0, null, ship); put(L, boxG(0.06, 1.6, 0.06), lad, 0.2, -0.9, 1.4, 0, null, ship);
  for (let i = 0; i < 4; i++) put(L, boxG(0.5, 0.05, 0.05), lad, -0.05, -0.8 + i * 0.38, 1.4, 0, null, ship);
}

LV.hall = () => {
  const L = newLevel("hall", "Hallway");
  const RW = 4, RD = 32, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 3.2, wall: T.shipWall, floor: T.hallFloor, floorRep: 1.2, ceil: 0x5a5e80, trim: 0x4a4f6e });
  put(L, planeG(RW, 3.2), mat({ map: T.shipWall, rep: [RW / 1.2, 3.2 / 1.2] }), 0, 0, RD / 2, Math.PI);
  HALL_DOORS.forEach(([id, text, side, z, edge, fill]) => {
    const inward = side === "left" ? -1.05 : 1.05;
    const g = onWall(L, side, R, doorTex(edge, fill), 1.15, 2.1, z, 0,
      { name: "Door to the " + ROOM_NAMES[id], go: id, stand: [inward, z] });
    L.entries[id] = [inward * 0.55, z];
  });
  onWall(L, "front", R, T.engineDoor, 1.6, 2.4, 0, 0, { name: "Door to the engine room", run: engineDoor, stand: [0, 15.2] }, 0x3a3f5a);
  onWall(L, "back", R, doorTex("#8a8f9a", "#f6f6f8"), 1.4, 2.4, 0, 0, { name: "Door to the control room", go: "control", stand: [0, -15.2] });
  // Opening cutscene: the smiling spaceship stalled in space (rendered when spaceCut is true)
  const spGroup = new THREE.Group(); spGroup.position.set(0, 28, 0); L.scene.add(spGroup);
  put(L, planeG(42, 28), mat({ map: T.stars, em: 1, fog: 0, rep: [6, 4], scroll: [0.008, 0] }), 0, -12, -10, 0, null, spGroup);
  put(L, planeG(22, 9.2), mat({ map: T.space, em: 1, fog: 0 }), 0, -3.8, -8.5, 0, null, spGroup);
  const spShip = new THREE.Group(); spShip.position.set(0.4, -0.4, -1.2); spGroup.add(spShip);
  buildSpaceship(L, spShip, 0.05, 0, 0.75); L.spaceShip = spShip;
  const puffs = [0, 1, 2, 3].map((i) => put(L, new THREE.SphereGeometry(0.28, 6, 4), mat({ color: i % 2 ? 0xd8b0ff : 0xb0b4c8, em: 0.9, fog: 0 }), -3.8, 1.4, 0, 0, null, spShip));
  L.entries.engine = [0, 14.6]; L.entries.control = [0, -14.6];
  L.walk = [-1.1, 1.1, -15.3, 15.3];
  L.start = [0, 9];
  L.light = { amb: 0x7a7c98, dir: [0.2, -1, -0.2], dirCol: 0x606070, pts: [[[0, 2.9, 10], 0xfff0d0, 9], [[0, 2.9, 0], 0xe0e0ff, 9], [[0, 2.9, -10], 0xfff0d0, 9]] };
  L.fog = [0x14162a, 8, 26]; L.bg = 0x14162a;
  cam(L, [0, 28.6, 6.8], [0, 28.2, -2], 50, () => spaceCut, 100);
  cam(L, [-1.3, 2.8, 4.5], [0.4, 0.9, 15], 62, (p) => p.y >= 9.5);
  cam(L, [0, 9, 0], [0, 0, 0], 50, (p) => p.y >= -9.5, 60, (c, p) => { c.position.set(0.5, 7.2, p.y + 3.0); c.lookAt(0, 0.4, p.y - 0.6); });
  cam(L, [1.2, 2.85, -3.5], [-0.3, 0.9, -15.5], 62);
  L.update = (t) => {
    spGroup.visible = spaceCut;
    if (spaceCut) {
      spShip.position.y = -0.4 + Math.sin(t * 1.5) * 0.22;
      spShip.rotation.z = Math.sin(t * 1.1) * 0.06;
      spShip.rotation.y = Math.PI + 0.25 + Math.sin(t * 0.7) * 0.08;
      puffs.forEach((m, i) => {
        const k = (t * 0.9 + i / 4) % 1;
        m.position.set(-3.8 - k * 2.2, 1.5 + Math.sin(k * 6 + i) * 0.25, (i - 1.5) * 0.15);
        m.scale.setScalar(0.5 + (1 - k) * 0.9);
      });
    }
  };
  return L;
};

// Kitchen + rec room: their own block, built from the kids' kitchen and living room drawings.
LV.hub = () => {
  const L = newLevel("hub", "Kitchen + Rec Room");
  const RW = 16, RD = 7, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.shipWall, floor: T.shipFloor, ceil: 0x6a6e94, trim: 0x4a4f6e });
  put(L, planeG(8, 3.4), mat({ color: 0x9cc4f0 }), 4, 0, -3.48);
  put(L, planeG(7, 3.4), mat({ color: 0x9cc4f0 }), 7.98, 0, 0, -Math.PI / 2);
  put(L, floorG(7.8, 6.8), mat({ map: T.greenChecker, rep: [7.8, 6.8] }), -4, 0.03, 0);
  put(L, floorG(7.8, 6.8), mat({ map: T.blueCarpet, rep: [4, 3.5] }), 4, 0.03, 0);
  const archM = mat({ color: 0x6c7299 });
  put(L, boxG(0.5, 3.4, 0.5), archM, 0, 0, -3.25);
  put(L, boxG(0.5, 0.5, 4.6), archM, 0, 2.9, -1.2);

  // KITCHEN
  const fridge = group(L, -7.1, 0, -2.85, 0, { name: "Fridge", say: () => fridgeMenu() });
  put(L, boxG(1.1, 2.3, 0.9), mat({ map: T.greenFridge }), 0, 0, 0, 0, null, fridge);
  put(L, planeG(0.6, 0.83), mat({ map: TEX.kids }), -0.1, 0.5, 0.46, 0, null, fridge);
  const fridgeDoor = new THREE.Group(); fridgeDoor.position.set(-0.55, 0, 0.45); fridge.add(fridgeDoor);
  put(L, boxG(1.08, 1.35, 0.05), mat({ color: 0x3fae4a }), 0.54, 0.05, 0, 0, null, fridgeDoor);
  const tv = group(L, -7.1, 2.3, -2.85, 0, { name: "Old TV", say: [["", "An old TV on top of the fridge."]] });
  put(L, boxG(0.8, 0.55, 0.55), mat({ color: 0x3fae6a }), 0, 0, 0, 0, null, tv);
  put(L, planeG(0.6, 0.4), mat({ map: TEX.oldTv, em: 0.7 }), 0, 0.08, 0.28, 0, null, tv);
  line(L, lineG([new THREE.Vector3(0.2, 0.55, 0), new THREE.Vector3(0.45, 0.95, 0)]), 0x2a1f3d, tv);
  const stove = group(L, -5.6, 0, -3.0, 0, { name: "Stove", say: () => stoveAct(), use: Object.fromEntries(CAKE.map((c) => [c, stoveAct])) });
  put(L, boxG(1.2, 1.0, 0.8), mat({ color: 0xe8559a }), 0, 0, 0, 0, null, stove);
  const ovenFront = put(L, planeG(1.2, 1.0), mat({ map: T.oven }), 0, 0, 0.41, 0, null, stove);
  put(L, boxG(1.1, 0.02, 0.7), mat({ map: T.stove }), 0, 1.0, 0, 0, null, stove);
  const stoveCake = new THREE.Group(); stoveCake.position.set(0, 1.02, 0); stoveCake.visible = false; stove.add(stoveCake);
  put(L, new THREE.CylinderGeometry(0.24, 0.24, 0.18, 10), mat({ color: 0x5a3218 }), 0, 0.09, 0, 0, null, stoveCake);
  put(L, new THREE.CylinderGeometry(0.25, 0.25, 0.05, 10), mat({ color: 0xf06aa8 }), 0, 0.19, 0, 0, null, stoveCake);
  const drawers = group(L, -4.2, 0, -3.0, 0, { name: "Kitchen drawers", say: () => drawerMenu() });
  put(L, boxG(1.4, 0.95, 0.8), mat({ map: T.drawers }), 0, 0, 0, 0, null, drawers);
  put(L, boxG(1.5, 0.06, 0.86), mat({ color: 0xf6e8f0 }), 0, 0.95, 0, 0, null, drawers);
  const openDrw = put(L, boxG(0.62, 0.22, 0.45), mat({ color: 0xd9c7a6 }), -0.34, 0.56, 0.2, 0, null, drawers);
  const win = group(L, -5.6, 1.5, -3.47, 0, { name: "Window", say: [["", "A window with pink curtains. Outside: stars. The ship is stalled in space."]] });
  put(L, planeG(1.3, 1.1), mat({ map: T.stars, em: 1, rep: [1.5, 1.2], scroll: [0.01, 0] }), 0, 0, 0.02, 0, null, win);
  const curtain = mat({ color: 0xf06aa8 });
  put(L, boxG(0.3, 1.3, 0.06), curtain, -0.75, -0.1, 0.06, 0, null, win); put(L, boxG(0.3, 1.3, 0.06), curtain, 0.75, -0.1, 0.06, 0, null, win);
  put(L, boxG(1.9, 0.12, 0.1), curtain, 0, 1.12, 0.06, 0, null, win);
  const flower = group(L, -5.25, 1.55, -3.35, 0, { name: "Space flower", show: () => !S.flags.got_flower,
    say: () => [["", "A space flower on the windowsill. It sparkles a little."], { choices: [
      ["Take it", () => [() => add("flower", "got_flower"), ["", "May takes the space flower. It goes in your item drawer. Maybe someone will want it someday..."]]],
      ["Leave it", () => []]] }] });
  put(L, new THREE.CylinderGeometry(0.08, 0.1, 0.2, 6), mat({ color: 0xc87a4a }), 0, 0, 0, 0, null, flower);
  put(L, new THREE.CylinderGeometry(0.015, 0.015, 0.22, 4), mat({ color: 0x3fae4a }), 0, 0.2, 0, 0, null, flower);
  put(L, new THREE.IcosahedronGeometry(0.09, 0), mat({ color: 0xf06aa8, em: 0.5 }), 0, 0.34, 0, 0, null, flower);
  const table = group(L, -2.6, 0, -2.55, 0, { name: "Kitchen table", say: [["", "The pink kitchen table. Something yellow is on it. (Cheese? Cake? Ask the kids!)"]] });
  const pink = mat({ color: 0xe0337f });
  put(L, boxG(1.6, 0.08, 0.9), pink, 0, 0.78, 0, 0, null, table);
  [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(([a, b]) => put(L, boxG(0.07, 0.78, 0.07), pink, a, 0, b, 0, null, table));
  const wedge = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 6, 1, false, 0, 1.1);
  put(L, wedge, mat({ color: 0xffd23f }), -0.2, 0.93, 0, 0, null, table);
  put(L, boxG(0.5, 0.06, 0.5), pink, 1.2, 0.48, 0, 0, null, table);
  put(L, boxG(0.08, 1.3, 0.5), pink, 1.42, 0, 0, 0, null, table);
  [[1.0, -0.2], [1.0, 0.2]].forEach(([a, b]) => put(L, boxG(0.06, 0.48, 0.06), pink, a, 0, b, 0, null, table));
  const hole = group(L, -1.0, 0, -3.47, 0, { name: "Kitchen mouse", say: () => mouseAct(), use: { cheese: mouseAct } });
  put(L, new THREE.CircleGeometry(0.22, 8, 0, Math.PI), mat({ color: 0x050308, em: 1 }), 0, 0.01, 0.01, 0, null, hole);
  const mg = new THREE.PlaneGeometry(0.4, 0.24); mg.translate(0, 0.12, 0);
  const mouse = put(L, mg, mat({ map: SPR.mouse.tex, em: 0.4, side: THREE.DoubleSide }), -1.0, 0.01, -3.35);
  const mouseCheese = put(L, new THREE.ConeGeometry(0.09, 0.12, 4), mat({ color: 0x9ad85a, em: 0.3 }), -0.58, 0.06, -3.28);

  // REC ROOM
  const bigTv = group(L, 4.2, 1.15, -3.45, 0, { name: "TV", say: [["", "A soccer game is on the TV. \"Les go!\" ... \"Skor!!!!\""]] });
  put(L, boxG(2.9, 1.55, 0.08), mat({ color: 0x1c2a44 }), 0, -0.08, 0, 0, null, bigTv);
  put(L, planeG(2.7, 1.35), mat({ map: TEX.livingTv, em: 0.75 }), 0, 0, 0.05, 0, null, bigTv);
  const chair = (cx, ry) => {
    const g = group(L, cx, 0, -1.95, Math.PI + ry, { name: "Chair", say: [["", "A big blue chair, facing the TV."]] });
    const m = mat({ map: T.blueFabric, rep: [1, 1] });
    put(L, boxG(1.1, 0.5, 0.9), m, 0, 0, 0, 0, null, g);
    put(L, boxG(1.1, 1.3, 0.28), m, 0, 0, -0.32, 0, null, g);
    put(L, boxG(0.22, 0.75, 0.9), m, -0.5, 0, 0, 0, null, g); put(L, boxG(0.22, 0.75, 0.9), m, 0.5, 0, 0, 0, null, g);
  };
  chair(2.5, -0.45); chair(6.0, 0.45);
  const faces = group(L, 4.25, 0, -2.0, 0, { name: "Box with faces", say: [["", "A box with two little faces on it. (Is it a couch? A table? Ask the kids!)"]] });
  put(L, boxG(1.6, 0.75, 0.8), mat({ color: 0xeaf2ff }), 0, 0, 0, 0, null, faces);
  put(L, planeG(1.6, 0.75), mat({ map: T.faceBox }), 0, 0, 0.41, 0, null, faces);

  onWall(L, "left", R, doorTex("#7a4a2a", "#e2cdb0"), 1.15, 2.1, 1.2, 0, { name: "Door to the hallway", go: "hall", stand: [-7.1, 1.2] });
  onWall(L, "right", R, T.engineDoor, 1.1, 1.9, 1.6, 0, { name: "Climb down to the boat", exit: true, go: "swamp", stand: [7.3, 1.6], show: () => !!S.flags.boatTaken });

  addChar(L, "jasin", 1.3, -0.9, 1.3, { name: "Jasin", stand: [0.6, -0.3],
    say: [["Jasin", "Hi May!"], ["Jasin", "I've got my soccer ball, just in case."]] });
  L.walk = [-7.2, 7.4, -1.25, 2.7];
  L.start = [-3, 0.8];
  L.entries = { hall: [-6.6, 1.2], swamp: [6.8, 1.6] };
  L.light = { amb: 0x8a8aa4, dir: [0.2, -1, -0.6], dirCol: 0x707080,
    pts: [[[-4, 2.8, 0.5], 0xffd9a0, 8], [[4.5, 2.6, 0], 0xc8d8ff, 8], [[0, 1.8, 3], 0x606080, 7]] };
  L.fog = [0x0d0e1c, 9, 26]; L.bg = 0x0d0e1c;
  cam(L, [-2.6, 3.3, 6.4], [-4.6, 0.9, -1.4], 52, (p) => p.x < 0);
  cam(L, [2.4, 3.1, 6.6], [4.4, 0.9, -1.2], 52);
  L.update = (t) => {
    const fed = !!S.flags.gotMap;
    const peek = fed ? 1 : Math.max(0, Math.sin(t * 0.7)) ** 3;
    mouse.position.x = -1.0 + peek * 0.35;
    mouse.position.y = fed ? 0.01 + Math.abs(Math.sin(t * 9)) * 0.03 : 0.01;
    mouse.visible = peek > 0.02;
    mouseCheese.visible = fed;
    flower.rotation.z = Math.sin(t * 2.2) * 0.08;
    fridgeDoor.rotation.y = L.fridgeOpen ? -1.1 : 0;
    openDrw.position.z = L.drawerOpen ? 0.46 : 0.2;
    ovenFront.material.uniforms.uEm.value = L.bakeT > 0 ? 0.6 + 0.3 * Math.sin(t * 10) : 0;
    stoveCake.visible = !!(L.bakeT > 0);
    if (L.bakeT > 0) L.bakeT = Math.max(0, L.bakeT - 0.02);
  };
  return L;
};

// Jon's room, from the kids' drawing: all blue, "Me" on everything, the portal standing up.
LV.jons = () => {
  const L = newLevel("jons", "Jon's Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.jonWall2, floor: T.jonFloor, ceil: 0xb8d0ea, trim: 0x3a86c8 });
  const meDoor = doorTex("#3a86c8", "#eef6ff", (x) => { x.fillStyle = "#3a86c8"; x.font = FONT; x.textBaseline = "top"; x.fillText("Me", 8, 22); });
  onWall(L, "back", R, meDoor, 1.15, 2.1, -3.4, 0, toHall());
  onWall(L, "back", R, TEX.jonPicture, 1.2, 1.12, -0.9, 1.65, { name: "Picture", say: [["", "A picture of Jon next to his portal. He's saying \"Me\"."]] }, 0xd8a0f0);
  onWall(L, "back", R, label(["JON'S", "ROOM"], 72, 36, "#f0f8ff", "#3a86c8", "#3a86c8", (x) => {
    x.fillStyle = "#3a86c8"; [[0, 0], [66, 0], [0, 30], [66, 30]].forEach(([a, b]) => x.fillRect(a, b, 6, 6));
  }), 1.5, 0.75, 1.3, 2.4, { name: "Sign: Jon's room", say: [["", "\"Jon's room\", in blue."]] });
  // blocky robot
  const robot = group(L, -1.7, 0, -2.4, 0.2, { name: "Robot", say: [["", "A blocky robot."]] });
  const rm = mat({ color: 0x6aa8e8 });
  put(L, boxG(0.14, 0.45, 0.14), rm, -0.14, 0, 0, 0, null, robot); put(L, boxG(0.14, 0.45, 0.14), rm, 0.14, 0, 0, 0, null, robot);
  put(L, boxG(0.6, 0.5, 0.35), rm, 0, 0.45, 0, 0, null, robot);
  put(L, boxG(0.4, 0.36, 0.34), mat({ map: T.robotFace }), 0, 0.95, 0, 0, null, robot);
  const arm = put(L, boxG(0.5, 0.12, 0.12), rm, 0.5, 0.75, 0, 0, null, robot); arm.rotation.z = 0.3;
  // little figure holding a "Me" sign (cut out from the drawing)
  const fig = group(L, -0.2, 0, -2.6, 0, { name: "Little figure", say: [["", "A little figure holding up a \"Me\" sign."]] });
  put(L, planeG(0.75, 1.0), mat({ map: TEX.jonFigure, side: THREE.DoubleSide }), 0, 0, 0, 0, null, fig);
  // bed labeled "Me"
  const bed = group(L, 2.0, 0, -2.25, 0, { name: "Jon's bed", say: [["", "Jon's bed. It says \"Me\" on it."]] });
  put(L, boxG(2.4, 0.5, 1.3), mat({ color: 0x3a86c8 }), 0, 0, 0, 0, null, bed);
  put(L, planeG(2.4, 0.5), mat({ map: label(["Me"], 48, 12, "#3a86c8", "#ffffff", "#3a86c8") }), 0, 0, 0.66, 0, null, bed);
  put(L, boxG(2.42, 0.08, 1.32), mat({ color: 0x9cc8f0 }), 0, 0.5, 0, 0, null, bed);
  put(L, boxG(0.45, 0.28, 0.85), mat({ color: 0xffffff }), 0.85, 0.58, 0, 0, null, bed);
  put(L, boxG(0.44, 0.03, 0.32), mat({ map: T.ipad, em: 0.6 }), -0.3, 0.58, 0.1, 0.2,
    { name: "iPad", say: [["", "The iPad. This is where Jon heard there are bad guys: a ping-pong bad guy, and a witch."]] }, bed);
  const cacao = group(L, 0.5, 0, -2.6, 0, { name: "Cacao", show: () => !S.flags.got_cacao, say: () => take("cacao") });
  put(L, new THREE.CylinderGeometry(0.15, 0.15, 0.36, 7), mat({ color: 0x6b3a20 }), 0, 0.18, 0, 0, null, cacao);
  put(L, new THREE.CylinderGeometry(0.16, 0.16, 0.06, 7), mat({ color: 0xffd23f }), 0, 0.38, 0, 0, null, cacao);
  // the portal, standing up
  const oval = group(L, 3.75, 0, -0.9, -0.7, { name: "Jon's portal (climb in)", stand: [3.0, -0.4] });
  const disc = new THREE.CircleGeometry(1, 16); disc.scale(0.55, 1.12, 1); disc.translate(0, 1.2, 0);
  put(L, disc, mat({ map: T.portal, em: 1, rep: [1.5, 1.5], scroll: [0.05, 0.08], side: THREE.DoubleSide }), 0, 0, 0, 0, null, oval);
  const rim = new THREE.RingGeometry(0.97, 1.1, 16); rim.scale(0.55, 1.12, 1); rim.translate(0, 1.2, 0);
  put(L, rim, mat({ color: 0xb77cf0, em: 0.6, side: THREE.DoubleSide }), 0, 0, 0.01, 0, null, oval);
  oval.userData.hot.run = () => {
    busy = true; L.player.entering = true; L.player.target = new THREE.Vector2(3.45, -0.75);
    setTimeout(() => { busy = false; goLevel("hideout", "jons"); }, 700);
    setTimeout(() => { const me = built.jons.player; me.entering = false; me.scaleMul = 1; }, 1100);
  };
  onWall(L, "left", R, TEX.jonsRoom, 1.3, 0.94, -1.9, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of Jon's room. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -1.0, 1.0, 1.3);
  L.walk = [-3.8, 3.4, -1.35, 2.5];
  L.start = [-1.0, 1.0]; L.entries = { hall: [-3.2, -1.0], hideout: [2.7, -0.2] };
  L.light = { amb: 0x7a8aa4, dir: [0.3, -1, -0.6], dirCol: 0x607088, pts: [[[3.6, 1.3, -0.6], 0xb06cff, 4.5], [[0, 2.9, 0.5], 0xe8f4ff, 7], [[0, 0, 0], 0, 1]] };
  L.fog = [0x101828, 10, 24]; L.bg = 0x101828;
  cam(L, [0.2, 3.1, 6.4], [0.2, 1.1, -1.4], 52);
  L.update = (t, dt) => {
    const me = L.player;
    if (me.entering) me.scaleMul = Math.max(0, (me.scaleMul ?? 1) - dt * 2);
  };
  return L;
};

// Playroom, from the kids' drawing.
LV.playroom = () => {
  const L = newLevel("playroom", "Playroom");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.playWall, floor: T.playCarpet, wallRep: 1.3, floorRep: 1.2, ceil: 0xe8e4d0, trim: 0x6ab8e8 });
  onWall(L, "back", R, doorTex("#7a4a2a", "#e2cdb0"), 1.15, 2.1, -3.4, 0, toHall());
  const tv = onWall(L, "back", R, TEX.playTv, 2.2, 1.55, 0.2, 1.25, { name: "TV",
    say: [["", "The TV shows two little figures with circles all around them. (Juggling? Dancing? Ask the kids!)"]] }, 0x1c2a44);
  tv.children[1].material.uniforms.uEm.value = 0.6;
  const bag = group(L, -2.3, 0, -2.0, 0, { name: "Beanbag", say: [["", "A big yellow beanbag."]] });
  const bg = new THREE.SphereGeometry(0.75, 10, 6); bg.scale(1, 0.62, 1); bg.translate(0, 0.42, 0);
  put(L, bg, mat({ color: 0xf2cf7a }), 0, 0, 0, 0, null, bag);
  const box = group(L, 0.6, 0, -2.6, 0, { name: "Toy box", say: [["", "A yellow toy box with smiley faces and a die on it."]] });
  put(L, boxG(2.2, 0.8, 0.7), mat({ color: 0xfff09a }), 0, 0, 0, 0, null, box);
  put(L, planeG(2.2, 0.8), mat({ map: TEX.playToybox, color: 0xfff6b0 }), 0, 0, 0.36, 0, null, box);
  const blocks = group(L, 2.8, 0, -2.5, 0.2, { name: "Blocks", say: [["", "A stack of colorful blocks."]] });
  [[0xe8559a, -0.22, 0], [0x3a6ac8, 0.22, 0], [0xb06cd8, -0.22, 0.44], [0xc8e83a, 0.22, 0.44], [0x9a5ad0, -0.22, 0.88], [0x3a6ac8, 0.22, 0.88], [0xe8c890, 0, 1.32]]
    .forEach(([c, bx, by]) => put(L, boxG(0.42, 0.42, 0.42), mat({ color: c }), bx, by, 0, 0, null, blocks));
  put(L, floorG(2.4, 0.6, 2, 1), mat({ map: label(["PLAY ROOM"], 80, 16, "#9cd0f0", "#e0337f", "#9cd0f0") }), 0.5, 0.04, 2.0);
  onWall(L, "left", R, TEX.playroom, 1.3, 0.94, -1.9, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of the playroom. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -0.5, 1.0, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-0.5, 1.0]; L.entries = { hall: [-3.2, -1.0] };
  L.light = { amb: 0x8a8a90, dir: [0.3, -1, -0.6], dirCol: 0x707068, pts: [[[0, 2.9, 0.5], 0xfff4e0, 7], [[0.2, 1.3, -2.4], 0x9ab8ff, 3], [[0, 0, 0], 0, 1]] };
  L.fog = [0x1c2430, 10, 24]; L.bg = 0x1c2430;
  cam(L, [0.2, 3.1, 6.4], [0, 1.1, -1.4], 52);
  return L;
};

// Control room, from the kids' drawing: big window, button panel, and the armory door.
LV.control = () => {
  const L = newLevel("control", "Control Room");
  const RW = 10, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.shipWall, floor: T.shipFloor, ceil: 0x5a5e80, trim: 0x4a4f6e });
  const win = onWall(L, "back", R, T.space, 5.2, 2.2, 0, 1.0, { name: "Big window",
    say: [["", "Space! The sun, a big striped planet, and a satellite."]] });
  win.children[0].material.uniforms.uEm.value = 1;
  const panel = group(L, 0, 0, -2.25, 0, { name: "Control panel",
    say: [["", "Lots of colorful buttons. The ship can't go anywhere until Jon fixes the engine."]] });
  put(L, boxG(5.2, 0.85, 0.9), mat({ color: 0x2a2a32 }), 0, 0, 0, 0, null, panel);
  const top = put(L, planeG(5.2, 0.7), mat({ map: T.buttons, em: 0.5 }), 0, 0.85, 0.45, 0, null, panel); top.rotation.x = -1.1;
  onWall(L, "left", R, T.greyPanel, 0.6, 0.6, -1.4, 1.0, { name: "Small grey panel",
    say: [["", "A small grey panel with a knob. (What's inside? Ask the kids!)"]] }, 0x6a6e80);
  const armDoorG = onWall(L, "right", R, T.armoryDoor, 1.2, 2.3, -0.6, 0, { name: "Armory door", stand: [4.2, -0.6], run: armoryDoor }, 0x6a6e80);
  const readerG = onWall(L, "right", R, T.cardReader, 0.22, 0.34, 0.25, 1.0, { name: "Keycard reader", stand: [4.2, 0.2],
    say: () => S.flags.armoryOpen ? [["", "The keycard reader is blinking green. The armory is unlocked!"]] : [["", "A keycard reader. It needs the keycard."]],
    use: { keycard: () => { armoryDoor(); return []; } } }, 0x2a2a32);
  onWall(L, "back", R, doorTex("#8a8f9a", "#f6f6f8"), 1.15, 2.1, -4.1, 0, { name: "Door to the hallway", go: "hall", stand: [-4.0, -1.2] });
  onWall(L, "back", R, TEX.control, 0.9, 1.24, 4.0, 1.4, { name: "The kids' drawing", say: [["", "The kids' drawing of the control room. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -1.5, 1.2, 1.3);
  L.walk = [-4.3, 4.3, -1.3, 2.5];
  L.start = [-1.5, 1.2]; L.entries = { hall: [-3.9, -0.8], armory: [3.7, -0.6] };
  L.light = { amb: 0x707490, dir: [0.2, -1, -0.5], dirCol: 0x606070, pts: [[[0, 1.6, -2.4], 0x9ab8ff, 5], [[0, 2.9, 1], 0xe0e0f0, 8], [[4, 1.2, -0.6], 0xff6050, 2]] };
  L.fog = [0x0c0d1a, 10, 24]; L.bg = 0x0c0d1a;
  cam(L, [-0.8, 3.0, 6.4], [0.4, 1.1, -1.4], 54);
  L.update = (t) => {
    top.material.uniforms.uEm.value = 0.45 + 0.25 * Math.sin(t * 3);
    armDoorG.position.z = S.flags.armoryOpen ? -1.1 : -0.6;
    readerG.children[1].material.uniforms.uEm.value = S.flags.armoryOpen ? 0.9 : 0.2;
  };
  return L;
};

// Stand-in rooms (no drawings yet). Contents come from the notes.
LV.armory = () => {
  const L = newLevel("armory", "Armory");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.jonWall, floor: T.shipFloor, ceil: 0x30344a, trim: 0x2a2f48 });
  const door = onWall(L, "left", R, doorTex("#8a8f9a", "#f6f6f8"), 1.15, 2.1, 1.4, 0, { name: "Door to the control room", go: "control", stand: [-3.8, 1.4] });
  const weapon = (name) => ({ name, say: [["", "A weird space weapon! (What does it do? The kids are still deciding.)"]] });
  const glass = 0xe4ecf8;
  onWall(L, "back", R, TEX.arm1, 1.7, 0.84, 0.3, 2.35, weapon("Small brown blaster"), 0x8a8f9a);
  onWall(L, "back", R, TEX.arm2, 2.3, 1.25, 0.3, 0.95, weapon("Big orange blaster"), 0x8a8f9a);
  onWall(L, "right", R, TEX.arm3, 1.9, 0.86, -0.6, 1.2, weapon("Long black blaster"), 0x8a8f9a);
  onWall(L, "back", R, TEX.arm4, 2.4, 0.6, -2.9, 0.6, weapon("Small weapons"), 0x8a8f9a);
  L.hots.forEach((g) => g.children.forEach((m) => { if (m.material.uniforms.map.value !== WHITE) m.material.uniforms.uColor.value.set(glass); }));
  onWall(L, "left", R, TEX.armory, 0.9, 1.24, -1.4, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of the armory. This 3D room is built from it."]] }, 0x8a6a4a);
  // the flashlight (needed later, in the wizard's hall of mirrors)
  const fl = group(L, 2.6, 0, -1.6, 0, { name: "Flashlight", stand: [2.4, -0.9], show: () => !S.flags.got_flashlight,
    say: () => [() => add("flashlight", "got_flashlight"), ["", "A big space flashlight! May takes it. It goes in your item drawer."]] });
  put(L, boxG(0.7, 0.8, 0.5), mat({ color: 0x4a4f6e }), 0, 0, 0, 0, null, fl);
  const tube = new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8); tube.rotateZ(Math.PI / 2);
  put(L, tube, mat({ color: 0xd8b030 }), 0, 0.9, 0, 0, null, fl);
  put(L, new THREE.CircleGeometry(0.1, 8).rotateY(Math.PI / 2), mat({ color: 0xfff6c0, em: 1 }), 0.26, 0.9, 0, 0, null, fl);
  L.player = addChar(L, "may", -2.4, 1.2, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-2.4, 1.2]; L.entries = { control: [-3.3, 1.4] };
  L.onEnter = [["", "The armory! All kinds of weird space weapons."]];
  L.light = { amb: 0x707488, dir: [0.2, -1, -0.5], dirCol: 0x606070, pts: [[[0, 2.9, 0.5], 0xe8f0ff, 8], [[0, 1.4, -2.6], 0x9ab8ff, 4], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0c0d1a, 10, 24]; L.bg = 0x0c0d1a;
  cam(L, [0.4, 3.0, 6.4], [0.2, 1.2, -1.4], 52);
  return L;
};

LV.engine = () => {
  // From the kids' newer drawing (26-engine-room-new.png): three bays split by brown walls.
  // Left: purple pipes, a gold cone, and an orange box on green pipes. Middle: a red box with green ends above a shelf. Right: blue pipes into a big bubbly blue tank.
  const L = newLevel("engine", "Engine Room");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.jonWall, floor: T.shipFloor, ceil: 0x30344a, trim: 0x6b3a22 });
  onWall(L, "back", R, T.engineDoor, 1.1, 2.1, -3.8, 0, toHall(), 0x2a2f48);
  const brown = mat({ color: 0x7a4a2a }), purple = mat({ color: 0xc070e0 }), green = mat({ color: 0x2f9a3a }), blue = mat({ color: 0x6ab4f4 });
  // brown walls between the bays
  [-1.5, 1.5].forEach((x) => put(L, boxG(0.22, 3.4, 1.5), brown, x, 0, -2.25));
  // LEFT BAY: purple pipes down from the ceiling, a gold cone, the orange box on green pipes
  put(L, boxG(0.16, 1.4, 0.16), purple, -2.0, 2.0, -2.6); put(L, boxG(0.9, 0.16, 0.16), purple, -2.4, 2.0, -2.6);
  put(L, boxG(0.16, 0.7, 0.16), purple, -2.85, 1.3, -2.6);
  const cone = new THREE.ConeGeometry(0.45, 1.0, 8); cone.rotateZ(Math.PI * 0.8);
  put(L, cone, mat({ color: 0xc8962a }), -3.4, 2.7, -2.5, 0);
  const eng = group(L, -2.6, 0, -2.4, 0, { name: "The engine", say: () => S.flags.fixed ? [["", "The engine is fixed! It's humming, and no more leaks."]] : [["", "The engine: an orange box full of wavy coils. It's offline and the pipes are leaking, so the ship can't move. Jon is the engineer."]] });
  const engM = mat({ map: T.coils });
  put(L, boxG(0.9, 0.8, 0.6), engM, 0, 0.75, 0, 0, null, eng);
  put(L, boxG(0.18, 0.75, 0.18), green, -0.25, 0, 0, 0, null, eng); put(L, boxG(0.18, 0.75, 0.18), green, 0.25, 0, 0, 0, null, eng);
  put(L, boxG(1.3, 0.18, 0.18), green, 0.85, 0.05, 0, 0, null, eng); put(L, boxG(0.18, 0.9, 0.18), green, 1.0, 0.05, 0, 0, null, eng);
  // MIDDLE BAY: the red box with green ends, and the brown shelf (where the memory pills are)
  const red = group(L, 0, 2.05, -2.9, 0, { name: "Red box", say: [["", "A red box with green ends, up on the wall. A giant battery? (Ask the kids what it is!)"]] });
  const rb = new THREE.CylinderGeometry(0.26, 0.26, 1.0, 10); rb.rotateZ(Math.PI / 2);
  put(L, rb, mat({ color: 0xd02a4a }), 0, 0, 0, 0, null, red);
  [-0.55, 0.55].forEach((x) => { const cap = new THREE.CylinderGeometry(0.27, 0.27, 0.12, 10); cap.rotateZ(Math.PI / 2); put(L, cap, green, x, 0, 0, 0, null, red); });
  put(L, boxG(2.6, 0.12, 0.6), brown, 0, 1.0, -2.7);
  const pills = group(L, 0.5, 1.12, -2.65, 0, { name: "Olivia's memory pills", stand: [0.5, -1.3], show: () => S.flags.gotMap && !S.flags.gotPills,
    say: () => [() => add("pills", "gotPills"), ["", "With the map, May finds her way through the pipes... Olivia's memory pills! They go in your item drawer."]] });
  put(L, new THREE.CylinderGeometry(0.11, 0.11, 0.28, 7), mat({ color: 0x3a6ad8 }), 0, 0.14, 0, 0, null, pills);
  put(L, new THREE.CylinderGeometry(0.12, 0.12, 0.08, 7), mat({ color: 0xb0b0b8 }), 0, 0.32, 0, 0, null, pills);
  const lock = group(L, -0.6, 0, -2.5, 0.15, { name: "Locked box", say: () => lockAct(), use: { boxKey: lockAct } });
  put(L, boxG(0.7, 0.42, 0.5), mat({ color: 0x6a5a3a }), 0, 0, 0, 0, null, lock);
  const lockLid = put(L, boxG(0.72, 0.1, 0.52), mat({ color: 0x7a6844 }), 0, 0.42, -0.25, 0, null, lock);
  put(L, boxG(0.16, 0.18, 0.04), mat({ color: 0xffd23f }), 0, 0.18, 0.26, 0, null, lock);
  // RIGHT BAY: blue pipes into the big bubbly blue tank (it leaks until the engine is fixed)
  put(L, boxG(0.16, 1.2, 0.16), blue, 2.2, 2.2, -2.6); put(L, boxG(1.2, 0.16, 0.16), blue, 2.8, 2.2, -2.6);
  put(L, boxG(0.16, 0.6, 0.16), blue, 3.4, 1.65, -2.6);
  const tank = group(L, 3.2, 0, -2.3, 0, { name: "Blue water tank", say: () => S.flags.fixed ? [["", "The big blue tank. It stopped leaking!"]] : [["", "A big blue tank full of bubbles. It's leaking all over the floor!"]] });
  const tg = new THREE.SphereGeometry(0.75, 12, 8); tg.scale(1, 1.15, 0.9); tg.translate(0, 0.86, 0);
  put(L, tg, mat({ map: T.bubbleTank, em: 0.15 }), 0, 0, 0, 0, null, tank);
  // puddles and drips (they stop once Jon fixes the engine)
  const puddleM = mat({ color: 0x4a9ae8, em: 0.3 });
  [[3.0, -1.5, 1.2], [-2.0, -1.7, 0.6]].forEach(([px, pz, pw]) => {
    const pg = new THREE.CircleGeometry(0.5, 10); pg.rotateX(-Math.PI / 2); pg.scale(pw, 1, 0.4);
    put(L, pg, puddleM, px, 0.035, pz);
  });
  const dripM = mat({ color: 0x6ab4f4, em: 0.5 }), dripG = new THREE.BoxGeometry(0.05, 0.08, 0.05);
  const drips = [];
  for (let k = 0; k < 30; k++) {
    const src = [[3.2, 1.4, -1.7], [3.2, 1.4, -1.7], [-2.6, 1.2, -2.0]][k % 3];
    const m = put(L, dripG, dripM, src[0] + (rnd() - 0.5) * 1.1, src[1], src[2] + rnd() * 0.4);
    m.userData.top = src[1]; m.userData.speed = 1 + rnd(); m.position.y = rnd() * src[1];
    drips.push(m);
  }
  const jonE = addChar(L, "jon", -1.0, -1.1, 1.3, { name: "Jon", stand: [-0.2, -0.6], say: () => jonEngineAct(), use: { map: jonEngineAct } });
  jonE.show = jonE.body.userData.hot.show = () => !!S.flags.gaveCake;
  onWall(L, "left", R, TEX.engine, 1.3, 0.94, -0.4, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of the engine room. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -1.2, 1.0, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-1.2, 1.0]; L.entries = { hall: [-3.6, -1.0] };
  L.onEnter = () => S.flags.gotMap ? [] : [["", "It's a maze of pipes and machines! Without a map, May can't find anything in here."]];
  L.light = { amb: 0x5a5060, dir: [0.3, -1, -0.5], dirCol: 0x504850, pts: [[[-2.6, 1.6, -1.4], 0xff9050, 4.5], [[0, 2.9, 1], 0x8088a0, 7], [[3.2, 1.2, -1.4], 0x60b0ff, 3.5]] };
  L.fog = [0x100a10, 9, 22]; L.bg = 0x100a10;
  cam(L, [0.2, 3.1, 6.4], [0, 1.2, -1.4], 52);
  L.update = (t, dt) => {
    const fixed = !!S.flags.fixed;
    drips.forEach((m) => {
      m.visible = !fixed;
      if (fixed) return;
      m.position.y -= dt * m.userData.speed * 1.4;
      if (m.position.y < 0.05) m.position.y = m.userData.top;
    });
    eng.position.y = fixed ? Math.sin(t * 8) * 0.015 : 0;
    engM.uniforms.uEm.value = fixed ? 0.5 + 0.3 * Math.sin(t * 6) : 0;
    lockLid.rotation.x = S.flags.gotKeycard ? -0.9 : 0;
  };
  return L;
};

LV.storage = () => {
  const L = newLevel("storage", "Storage");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.shipWall, floor: T.shipFloor, ceil: 0x3a3440, trim: 0x5a3a22 });
  onWall(L, "back", R, doorTex("#6b3a22", "#f4ece4"), 1.15, 2.1, -1.2, 0, { name: "Door to the hallway", go: "hall", stand: [-1.2, -1.3] });
  const brown = mat({ map: T.crate, color: 0xb07850 });
  const boxes = (x, z, w, h, d, name) => {
    const g = group(L, x, 0, z, 0, { name: name || "Box", say: [["", "A big brown box."]] });
    put(L, boxG(w, h, d), brown, 0, 0, 0, 0, null, g);
    return g;
  };
  boxes(-3.1, -2.3, 1.5, 1.0, 1.0);
  boxes(1.0, -2.4, 1.5, 0.85, 1.0);
  boxes(2.55, -2.5, 0.4, 0.75, 0.5);
  boxes(3.5, -2.3, 1.0, 0.95, 1.0);
  const mystery = group(L, -3.3, 1.0, -2.3, 0.2, { name: "Box ?", say: [["", "A little box with something green inside. (What is it? Ask the kids!)"]] });
  put(L, boxG(0.42, 0.36, 0.36), mat({ color: 0x8a5a3a }), 0, 0, 0, 0, null, mystery);
  put(L, new THREE.SphereGeometry(0.15, 7, 5), mat({ color: 0x3fb84a }), 0, 0.34, 0, 0, null, mystery);
  put(L, new THREE.SphereGeometry(0.2, 7, 5), mat({ color: 0x2f9a3a }), -0.45, 0.18, 0.05, 0, null, mystery);
  const yeast = group(L, -2.6, 1.0, -2.2, 0, { name: "Yeast", show: () => !S.flags.got_yeast, say: () => take("yeast") });
  put(L, boxG(0.34, 0.24, 0.24), mat({ map: label(["YEAST"], 48, 16, "#fff8e0", "#8a6a4a", "#d8c8a0") }), 0, 0, 0, 0, null, yeast);
  // slime puddles with little green faces going "eww"
  [[-0.9, -1.75, 1.0], [2.6, -1.85, 1.3]].forEach(([sx, sz, sw]) => {
    const g = group(L, sx, 0.035, sz, 0, { name: "Green slime", say: [["", "Green slime. Eww!"]] });
    const pg = new THREE.CircleGeometry(0.5, 10); pg.rotateX(-Math.PI / 2); pg.scale(sw, 1, 0.45);
    put(L, pg, mat({ color: 0x4ac84a, em: 0.25 }), 0, 0, 0, 0, null, g);
    const fg = new THREE.PlaneGeometry(0.3, 0.36); fg.translate(0, 0.18, 0);
    put(L, fg, mat({ map: SPR.slime.tex, em: 0.4, side: THREE.DoubleSide }), sw * 0.45, 0, 0.1, 0, null, g);
  });
  // cobwebs and two hanging spiders
  const web = [[-1, 3.39, -2.9], [3.8, 3.39, -2.9], [1.0, 2.8, -2.9], [-0.5, 3.0, -2.9], [3.0, 2.7, -2.9], [0.4, 3.39, -2.9]];
  for (let a = 0; a < web.length; a++) for (let b = a + 1; b < web.length; b += 2)
    line(L, lineG([new THREE.Vector3(...web[a]), new THREE.Vector3(...web[b])]), 0x8a5a3a);
  const spiders = [[0.8, 2.25], [3.0, 2.05]].map(([sx, sy], k) => {
    const g = group(L, sx, sy, -2.6, 0, { name: "Spider", say: [["", "A spider hanging from its web!"]] });
    line(L, lineG([new THREE.Vector3(0, 0.4, 0), new THREE.Vector3(0, 3.4 - sy, 0)]), 0x6b3a22, g);
    const sg = new THREE.PlaneGeometry(0.7, 0.55); sg.translate(0, -0.15, 0);
    put(L, sg, mat({ map: SPR.spider.tex, em: 0.4, side: THREE.DoubleSide }), 0, 0, 0.02, 0, null, g);
    return g;
  });
  onWall(L, "left", R, TEX.storage, 1.3, 0.94, -1.0, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of the storage room. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -0.6, 1.0, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-0.6, 1.0]; L.entries = { hall: [-1.2, -0.9] };
  L.light = { amb: 0x6a6070, dir: [0.3, -1, -0.5], dirCol: 0x605458, pts: [[[0, 2.9, 0.5], 0xffd8a8, 7], [[0, 0.3, -1.8], 0x60ff60, 2.5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x140e12, 10, 24]; L.bg = 0x140e12;
  cam(L, [0.2, 3.1, 6.4], [0, 1.1, -1.4], 52);
  L.update = (t) => spiders.forEach((g, k) => { g.position.y = [2.25, 2.05][k] + Math.sin(t * 1.4 + k * 2) * 0.12; });
  return L;
};

LV.bath = () => {
  const L = newLevel("bath", "Bathroom");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.bathTile, floor: T.playCarpet, wallRep: 0.8, floorRep: 1.2, ceil: 0xd8e8f0, trim: 0xe8559a });
  onWall(L, "back", R, doorTex("#7a4a2a", "#e2cdb0"), 1.15, 2.1, -3.4, 0, toHall());
  const pink = mat({ color: 0xf6c8e0 }), pinkDark = mat({ color: 0xe8559a });
  const toilet = group(L, -1.6, 0, -2.5, 0, { name: "Toilet", say: [["", "The toilet."]] });
  put(L, new THREE.CylinderGeometry(0.26, 0.2, 0.42, 8), pink, 0, 0.21, 0, 0, null, toilet);
  put(L, new THREE.CylinderGeometry(0.27, 0.27, 0.05, 8), pinkDark, 0, 0.44, 0, 0, null, toilet);
  put(L, boxG(0.5, 0.75, 0.2), pink, 0, 0.3, -0.27, 0, null, toilet);
  const sink = group(L, 0.4, 0, -2.75, 0, { name: "Sink", say: () => S.flags.got_water ? [["", "The sink."]] : [["", "May fills a cup at the sink."], ...take("water")] });
  put(L, new THREE.CylinderGeometry(0.1, 0.12, 0.8, 6), pink, 0, 0.4, 0, 0, null, sink);
  put(L, boxG(0.8, 0.16, 0.5), pink, 0, 0.8, 0, 0, null, sink);
  put(L, boxG(0.08, 0.22, 0.08), mat({ color: 0x3a5ad8 }), 0, 0.96, -0.18, 0, null, sink);
  onWall(L, "back", R, T.roundMirror, 0.7, 0.8, 0.4, 1.45, { name: "Mirror", say: [["", "A round mirror."]] });
  const tub = group(L, 2.6, 0, -2.3, 0, { name: "Bathtub", say: [["", "The bathtub, with a rubber duck floating in it."]] });
  put(L, boxG(2.4, 0.7, 1.15), pink, 0, 0.18, 0, 0, null, tub);
  [[-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45]].forEach(([a, b]) => put(L, boxG(0.12, 0.2, 0.12), pinkDark, a, 0, b, 0, null, tub));
  put(L, boxG(2.2, 0.03, 0.95), mat({ color: 0x3a6ad8, em: 0.2 }), 0, 0.86, 0, 0, null, tub);
  put(L, boxG(0.08, 1.4, 0.08), pinkDark, 1.15, 0.85, -0.5, 0, null, tub);
  put(L, new THREE.CylinderGeometry(0.16, 0.1, 0.12, 8), pinkDark, 1.0, 2.2, -0.5, 0, null, tub);
  put(L, new THREE.IcosahedronGeometry(0.17, 0), mat({ color: 0x2a4ad0 }), 0.8, 1.0, -0.2, 0, null, tub);
  const duck = group(L, 2.1, 0.9, -2.1, 0.4, { name: "Rubber duck", say: [["", "A rubber duck! Squeak!"]] });
  put(L, new THREE.SphereGeometry(0.14, 8, 6), mat({ color: 0xffe14a }), 0, 0.1, 0, 0, null, duck);
  put(L, new THREE.SphereGeometry(0.09, 8, 6), mat({ color: 0xffe14a }), 0.1, 0.24, 0, 0, null, duck);
  put(L, boxG(0.08, 0.03, 0.06), mat({ color: 0xf0952a }), 0.2, 0.23, 0, 0, null, duck);
  onWall(L, "left", R, TEX.bathroom, 1.3, 0.94, -1.9, 1.3, { name: "The kids' drawing", say: [["", "The kids' drawing of the bathroom. This 3D room is built from it."]] }, 0x8a6a4a);
  L.player = addChar(L, "may", -1.0, 1.0, 1.3);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-1.0, 1.0]; L.entries = { hall: [-3.2, -1.0] };
  L.light = { amb: 0x8a9098, dir: [0.3, -1, -0.5], dirCol: 0x707880, pts: [[[0, 2.9, 0.5], 0xf0f8ff, 7], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x18202a, 10, 24]; L.bg = 0x18202a;
  cam(L, [0.2, 3.1, 6.4], [0, 1.1, -1.4], 52);
  L.update = (t) => { duck.position.y = 0.9 + Math.sin(t * 2) * 0.02; duck.rotation.y = 0.4 + Math.sin(t * 0.7) * 0.3; };
  return L;
};

// ---------- "Follow the Mouse": crumbs lead toward the next clue on the ship ----------
function clueTarget() {
  const f = S.flags;
  if (f.crashed) return null;
  if (f.gaveCake) return has("map") ? ["engine", "Jon"] : ["hub", "Kitchen mouse"];
  if (has("cake")) return ["jons", "Jon's portal (climb in)"];
  if (f.gavePills) {
    const order = [["sugar", "mays", "Sugar"], ["oil", "jasins", "Oil"], ["flour", "olivias", "Flour"], ["cacao", "jons", "Cacao"], ["water", "bath", "Sink"], ["yeast", "storage", "Yeast"]];
    const m = order.find((o) => !f["got_" + o[0]]);
    return m ? [m[1], m[2]] : ["hub", "Stove"];
  }
  if (has("pills")) return ["olivias", "Olivia"];
  if (f.engineOpen) return f.gotMap ? ["engine", "Olivia's memory pills"] : ["hub", "Kitchen mouse"];
  if (has("key")) return ["hall", "Door to the engine room"];
  if (has("tuna")) return ["hub", "Kitchen drawers"];
  if (f.askedOlivia) return ["hub", "Fridge"];
  if (!f.metJon) return ["jons", "Jon's portal (climb in)"];
  return ["olivias", "Olivia"];
}
function addClueTrail(lv) {
  const crumbM = mat({ color: 0xd8b878, em: 0.3 }), cg = new THREE.BoxGeometry(0.07, 0.03, 0.07);
  const crumbs = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(cg, crumbM); m.visible = false; lv.scene.add(m); return m; });
  const mg = new THREE.PlaneGeometry(0.4, 0.24); mg.translate(0, 0.12, 0);
  const mouse = new THREE.Mesh(mg, mat({ map: SPR.mouse.tex, em: 0.4, side: THREE.DoubleSide })); mouse.visible = false; lv.scene.add(mouse);
  lv.clue = { crumbs, mouse, key: "" };
}
function updateClue(t) {
  if (!L.clue) return;
  const tg = clueTarget(), c = L.clue;
  const on = tg && tg[0] === L.id;
  const o = on ? L.hots.find((h) => h.userData.hot.name === tg[1]) : null;
  const key = o ? tg.join("|") + (o.userData.hot.show ? +!!o.userData.hot.show() : "") : "";
  if (key !== c.key) {
    c.key = key;
    c.crumbs.forEach((m) => (m.visible = false)); c.mouse.visible = false;
    if (o && (!o.userData.hot.show || o.userData.hot.show())) {
      const h = o.userData.hot, wp = o.getWorldPosition(new THREE.Vector3());
      const end = h.stand ? new THREE.Vector2(...h.stand) : clampWalk(wp.x, wp.z + 0.9);
      const st = new THREE.Vector2(...(L.entries.hall || L.start));
      c.crumbs.forEach((m, i) => {
        const k = (i + 1) / (c.crumbs.length + 1);
        m.position.set(st.x + (end.x - st.x) * k + Math.sin(i * 2.3) * 0.12, 0.05, st.y + (end.y - st.y) * k + Math.cos(i * 1.7) * 0.12);
        m.rotation.y = i; m.visible = true;
      });
      if (L.id !== "hub") { c.mouse.position.set(end.x + 0.45, 0.02, end.y + 0.2); c.mouse.visible = true; }
    }
  }
  if (c.mouse.visible) { c.mouse.rotation.y = Math.atan2(curCam.position.x - c.mouse.position.x, curCam.position.z - c.mouse.position.z); c.mouse.position.y = Math.abs(Math.sin(t * 6)) * 0.03; }
}

const FRIDGE = [["Mango", "Just a mango."], ["Apple", "Just an apple."], ["Moldy cheese", null, "cheese"], ["Garlic", "Garlic. Stinky!"],
  ["Pickled herring", "Pickled herring."], ["Kimchi", "Kimchi."], ["Milk (expired)", "This milk is expired. Yuck!"], ["Milk", "This milk is still good."], ["Can of tuna", null, "tuna"]];
function fridgeMenu() {
  if (L) L.fridgeOpen = true;
  return [["", "May opens the fridge. What should she check?"], { choices: FRIDGE.map(([n, line, item]) => [n, () => {
    if (L) L.fridgeOpen = false;
    if (!item) return [["", line]];
    if (S.flags["got_" + item]) return [["", "May already took that."]];
    return [() => add(item, "got_" + item), ["", item === "tuna" ? "A can of tuna. Something rattles inside it! It goes in your item drawer." : "Moldy cheese! It goes in your item drawer."]];
  }]).concat([["Close the fridge", () => { if (L) L.fridgeOpen = false; return []; }]]) }];
}
const DRAWER = [["Can opener", null], ["Knife", "A knife. Careful!"], ["Soup scoop", "A soup scoop."], ["Corkscrew", "A corkscrew."],
  ["Bottle opener", "A bottle opener."], ["Aluminum foil", "Some aluminum foil."], ["Whisk", "A whisk."]];
function drawerMenu() {
  if (L) L.drawerOpen = true;
  return [["", "May opens the kitchen drawers."], { choices: DRAWER.map(([n, line]) => [n, () => {
    if (L) L.drawerOpen = false;
    if (line) return [["", line]];
    if (S.flags.got_opener) return [["", "May already took the can opener."]];
    return [() => add("opener", "got_opener"), ["", "A can opener! It goes in your item drawer."]];
  }]).concat([["Close the drawers", () => { if (L) L.drawerOpen = false; return []; }]]) }];
}
function stoveAct() {
  if (S.flags.gotCake) return [["", "The pink stove."]];
  const n = CAKE.filter(has).length;
  if (n === 6) return [() => { if (L) L.bakeT = 1.6; }, ["", "May mixes flour, oil, sugar, a little water, some yeast, and a LOT of cacao..."],
    () => { CAKE.forEach(remove); add("cake", "gotCake"); }, ["", "A chocolate cake! It goes in your item drawer."]];
  return [["", n ? `The pink stove. May has ${n} of the 6 cake ingredients.` : "The pink stove."]];
}
function mouseAct() {
  if (S.flags.gotMap) return [["", "The mouse is happily nibbling the moldy cheese."]];
  if (has("cheese")) return [() => { remove("cheese"); add("map", "gotMap"); },
    ["", "The mouse loves the moldy cheese! It trades May a map of the engine room schematics."]];
  return [["", "The kitchen mouse is holding a rolled-up paper. It sniffs the air hungrily."]];
}
function oliviaAct() {
  const f = S.flags;
  if (has("pills")) return [() => { remove("pills"); f.gavePills = true; save(); }, ["Olivia", "My memory pills!"],
    ["Olivia", "Now I remember! Jon likes chocolate cake a LOT!"], ["", "To get Jon out of his portal, May needs to make him a chocolate cake!"]];
  if (f.gavePills) return [["Olivia", "Jon likes chocolate cake a LOT!"]];
  return [["May", "What's going on with Jon?"], flag("askedOlivia"), ["Olivia", "I don't know. I can't tell you unless you bring me my memory pills."]];
}
function giveCake() {
  return [() => remove("cake"), ["May", "Jon! I made you a chocolate cake!"], ["Jon", "Chocolate cake?!"],
    ["May", "You can have it if you come out and fix the ship!"],
    () => { const j = L && L.chars.find((c) => c.key === "jon"); if (j) { j.hopT = 0.45; j.target = new THREE.Vector2(-2.2, -1.5); } },
    ["Jon", "Okay! I'll come out and fix the ship!"],
    flag("gaveCake"), ["", "Jon climbs out of his portal and heads to the engine room!"]];
}
function jonHoleAct() {
  if (has("cake")) return giveCake();
  return [["May", S.flags.metJon ? "Come ON, Jon. Git out!" : "Jon! Git out of there!!"], flag("metJon"), ["Jon", "No ma'am!"],
    ["Jon", "I know who I'm hiding from... but I'm NOT telling!"], ["Jon (thinking)", "It's the bad guys..."],
    ["", "Jon won't budge. Maybe the crew knows what's going on..."]];
}
function jonEngineAct() {
  const f = S.flags;
  if (f.fixed) return [["Jon", "The engine is fixed!"]];
  if (!has("map")) return [["Jon", "I need the engine room schematics to fix this!"]];
  return [() => remove("map"), ["May", "Here, Jon! The mouse's map of the engine room!"],
    () => { const j = L && L.chars.find((c) => c.key === "jon"); if (j) { j.hopT = 0.4; j.target = new THREE.Vector2(-2.1, -1.5); } },
    ["Jon", "The schematics! Now I can fix it!"],
    ["", "CLANK! BONK! WHIRR!"], flag("fixed"), ["", "The engine is back online! The ship starts moving again... on to Woolley Mountain!"],
    () => shake(), ["", "BOOM! Something smashes into the ship!"], ["Jon", "Asteroids!!"],
    ["May", "Quick! Everybody to the ship's blasters! Shoot them!"],
    () => asteroidStorm((hits) => say([
      ["", `The kids blast ${hits} asteroid${hits === 1 ? "" : "s"}... but there are just too many!`], () => shake(),
      ["Everyone", "AHHHHH!"], ["", "KA-BOOM! The ship spins out of space and falls toward a planet below..."],
      () => { S.flags.crashed = true; save(); goLevel("beach"); }]))];
}
function lockAct() {
  if (S.flags.gotKeycard) return [["", "The box is empty now."]];
  if (has("boxKey")) return [() => { remove("boxKey"); add("keycard", "gotKeycard"); }, ["", "The little key fits! Inside the locked box: a keycard! It goes in your item drawer."]];
  return [["", "A locked box. It needs a key."]];
}
function engineDoor() {
  if (S.flags.engineOpen) return goLevel("engine", "hall");
  if (has("key")) return say([["", "May unlocks the engine room with the key!"], () => { remove("key"); S.flags.engineOpen = true; save(); goLevel("engine", "hall"); }]);
  say([["", "The engine room is locked."]]);
}
function armoryDoor() {
  if (S.flags.armoryOpen) return goLevel("armory", "control");
  if (has("keycard")) return say([["", "May swipes the keycard. BEEP! The armory door slides open."], () => { remove("keycard"); S.flags.armoryOpen = true; save(); goLevel("armory", "control"); }]);
  S.flags.sawArmory = true; save();
  say([["", "\"Armory: do not enter unless you have keycard.\""], ["", "The door won't open without a keycard."]]);
}
function shake() {
  stage.animate([{ transform: "translate(0,0)" }, { transform: "translate(-8px,4px)" }, { transform: "translate(7px,-5px)" }, { transform: "translate(-5px,3px)" }, { transform: "translate(0,0)" }], { duration: 500, iterations: 2 });
}

// ---------- the asteroid storm: the kids shoot asteroids from the ship (like Asteroids), but it's too much ----------
function asteroidStorm(done) {
  const cv = $("astro"), x = cv.getContext("2d"), DUR = SHOT ? 1.5 : 42;
  cv.hidden = false; busy = true; stopSpeaking();
  const ship = { x: 160, y: 140, a: -Math.PI / 2 }, aim = { x: 160, y: 40 };
  const stars = Array.from({ length: 70 }, () => [rnd() * 320, rnd() * 240, 0.3 + rnd() * 1.6]);
  let rocks = [], shots = [], booms = [], spawn = 0.4, hits = 0, cool = 0, firing = false, hurt = 0, over = false;
  const t0 = performance.now(); let last = t0;
  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 320, y: (e.clientY - r.top) / r.height * 240 }; };
  const down = (e) => { e.preventDefault(); Object.assign(aim, pt(e)); firing = true; };
  const move = (e) => Object.assign(aim, pt(e));
  const up = () => (firing = false);
  const key = (e) => { if (e.key === " ") { e.preventDefault(); firing = e.type === "keydown"; } };
  cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up); window.addEventListener("keydown", key); window.addEventListener("keyup", key);
  function newRock(k, r, px, py) {
    if (px == null) {
      const side = Math.floor(rnd() * 4);
      px = side === 0 ? -20 : side === 1 ? 340 : rnd() * 320; py = side === 2 ? -20 : side === 3 ? 260 : rnd() * 240;
    }
    r = r || 9 + rnd() * 10 + k * 6;
    const toShip = Math.atan2(ship.y - py, ship.x - px) + (rnd() - 0.5) * 0.9, sp = 22 + k * 45 + rnd() * 20;
    const pts = Array.from({ length: 9 }, (_, i) => [i / 9 * Math.PI * 2, 0.7 + rnd() * 0.35]);
    return { x: px, y: py, r, vx: Math.cos(toShip) * sp, vy: Math.sin(toShip) * sp, rot: rnd() * 6, spin: (rnd() - 0.5) * 2, pts };
  }
  function boom(px, py, n, col) { for (let i = 0; i < n; i++) { const a = rnd() * 6.3, s = 20 + rnd() * 70; booms.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + rnd() * 0.4, col }); } }
  function tick(now) {
    if (over) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const el = (now - t0) / 1000, k = Math.min(1, el / DUR);
    spawn -= dt;
    if (spawn <= 0) { rocks.push(newRock(k)); if (k > 0.6) rocks.push(newRock(k)); spawn = Math.max(0.18, 1.2 - k * 1.1); }
    ship.a = Math.atan2(aim.y - ship.y, aim.x - ship.x);
    cool -= dt;
    if (firing && cool <= 0) { shots.push({ x: ship.x + Math.cos(ship.a) * 14, y: ship.y + Math.sin(ship.a) * 14, vx: Math.cos(ship.a) * 260, vy: Math.sin(ship.a) * 260, life: 1.2 }); cool = 0.15; }
    shots.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
    rocks.forEach((r) => { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.spin * dt; });
    booms.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; });
    for (const s of shots) for (const r of rocks) {
      if (s.life > 0 && !r.dead && Math.hypot(s.x - r.x, s.y - r.y) < r.r) {
        s.life = 0; r.dead = true; hits++; boom(r.x, r.y, 10, "#ffb84a");
        if (r.r > 14) for (let i = 0; i < 2; i++) rocks.push(newRock(k, r.r * 0.55, r.x, r.y));
      }
    }
    for (const r of rocks) if (!r.dead && Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + 9) { r.dead = true; hurt = 0.3; boom(r.x, r.y, 14, "#ff5a5a"); shake(); }
    rocks = rocks.filter((r) => !r.dead && r.x > -60 && r.x < 380 && r.y > -60 && r.y < 300);
    shots = shots.filter((s) => s.life > 0); booms = booms.filter((b) => b.life > 0); hurt = Math.max(0, hurt - dt);
    // draw
    x.fillStyle = hurt > 0 ? "#3a0c18" : "#05060f"; x.fillRect(0, 0, 320, 240);
    stars.forEach((s) => { s[1] = (s[1] + s[2] * 18 * dt) % 240; x.fillStyle = s[2] > 1.4 ? "#ffffff" : "#8890b8"; x.fillRect(s[0] | 0, s[1] | 0, 1, 1); });
    rocks.forEach((r) => {
      x.save(); x.translate(r.x, r.y); x.rotate(r.rot); x.beginPath();
      r.pts.forEach(([a, m], i) => x[i ? "lineTo" : "moveTo"](Math.cos(a) * r.r * m, Math.sin(a) * r.r * m));
      x.closePath(); x.fillStyle = "#6a5a50"; x.fill(); x.strokeStyle = "#c8b8a8"; x.lineWidth = 1; x.stroke();
      x.fillStyle = "#4a3e38"; x.fillRect(-r.r * 0.3, -r.r * 0.2, r.r * 0.25, r.r * 0.25); x.restore();
    });
    x.fillStyle = "#ffe85a"; shots.forEach((s) => x.fillRect(s.x - 1, s.y - 1, 3, 3));
    booms.forEach((b) => { x.fillStyle = b.col; x.globalAlpha = Math.min(1, b.life * 2); x.fillRect(b.x | 0, b.y | 0, 2, 2); });
    x.globalAlpha = 1;
    // the smiling spaceship (purple fins, round body), turning to aim
    x.save(); x.translate(ship.x, ship.y); x.rotate(ship.a);
    x.fillStyle = "#a24fd6"; x.fillRect(-12, -9, 6, 4); x.fillRect(-12, 5, 6, 4);
    x.fillStyle = "#e8e4f4"; x.beginPath(); x.ellipse(0, 0, 13, 8, 0, 0, 6.3); x.fill();
    x.fillStyle = "#2a1f3d"; x.fillRect(3, -3, 2, 2); x.fillRect(3, 2, 2, 2); x.fillRect(7, -2, 2, 4);
    x.restore();
    // words on top
    x.font = FONT; x.textAlign = "center"; x.textBaseline = "top";
    const msgTop = k < 0.45 ? "ASTEROIDS! CLICK TO SHOOT" : k < 0.8 ? "THERE ARE SO MANY!" : "TOO MANY!! HANG ON!";
    x.fillStyle = "#000"; x.fillText(msgTop, 161, 9); x.fillStyle = k < 0.8 ? "#ffd23f" : "#ff6a6a"; x.fillText(msgTop, 160, 8);
    x.textAlign = "left"; x.fillStyle = "#fff"; x.fillText("HITS " + hits, 8, 224);
    x.fillStyle = "#3a3f60"; x.fillRect(200, 225, 110, 7);
    const shield = Math.max(0, 1 - k);
    x.fillStyle = shield > 0.3 ? "#5ad8ff" : "#ff5a5a"; x.fillRect(200, 225, 110 * shield, 7);
    x.textAlign = "right"; x.fillStyle = "#fff"; x.fillText("SHIELDS", 196, 224);
    if (el >= DUR) {
      over = true;
      cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up); window.removeEventListener("keydown", key); window.removeEventListener("keyup", key);
      shake(); cv.hidden = true; busy = false; done(hits);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
