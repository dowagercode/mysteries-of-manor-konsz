// ch4-castle.js: Chapter 4: the wizard's castle (cloud-pattern rocks, the gigantic door) and the truck entrance behind it.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- the wizard's castle ----------
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
  return [() => { newRockPattern(); L.player.pos.set(0, 3); L.player.target = null; S.flags.slipped = true; save(); },
    ["", "The rock wobbles! May slips and slides back down to the start. Look... the clouds are changing their pattern!"]];
}
function doorAct() {
  const f = S.flags;
  if (f.castleEnd) return castleEnding();
  if (!has("robes")) return [["", "The gigantic front door is shut tight. Nobody would let a bunch of kids in... maybe a disguise would help?"]];
  return [() => remove("robes"), ["", "The kids put on the priest robes from the witch's ministry. Nobody will know it's them!"],
    ["", "BOOM. BOOM. BOOM. They knock on the gigantic door..."], ["", "The gigantic door creaks open... and the wizard peeks out!"], flag("wizardOut"),
    ["", "The kids pretend to be priests from the witch's ministry, and try to convince the wizard to join them."], flag("castleEnd"), ...castleEnding()];
}
function castleEnding() {
  return [["", "(What the wizard says, and what's inside the castle: the kids are still writing it!)"],
    ["", "To be continued... Thanks for playing Mysteries of Manor Konsz!"]];
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
    const cone = put(L, new THREE.ConeGeometry(0.9, 2.4, 7), mat({ color: 0x3a3048 }), x - tw * h * 0.2, h + 1, 0.5, 0, null, cas);
  });
  put(L, planeG(1.4, 0.8), mat({ color: 0x8a3ac8, side: THREE.DoubleSide }), 0.7, 14.5, 0.5, 0, null, cas);
  put(L, new THREE.RingGeometry(0.7, 0.9, 12), mat({ color: 0x2a2030 }), 0, 4.5, 2.05, 0, null, cas);
  put(L, new THREE.CircleGeometry(0.7, 12), mat({ color: 0xffe08a, em: 1 }), 0, 4.5, 2.04, 0, null, cas);
  const moon = put(L, new THREE.RingGeometry(1.4, 2.2, 16, 1, 0.6, 3.6), mat({ color: 0xfff4c8, em: 1, fog: 0 }), 14, 22, -40, 0);
  // the gigantic front door
  const door = group(L, 0, 0, -21.8, 0, { name: "Gigantic front door", stand: [0, -17.4], show: () => !!S.flags.rocksDone, say: () => doorAct(), use: { robes: doorAct } });
  put(L, planeG(3.2, 5.2), mat({ map: T.bigDoor }), 0, 0, 0, 0, null, door);
  const wiz = addChar(L, "wizard", 0.9, -20.6, 1.9, { name: "Wizard", stand: [0, -17.4], say: () => castleEnding() });
  wiz.show = wiz.body.userData.hot.show = () => !!S.flags.wizardOut;
  // the dangerous rocks: copy the pattern in the clouds
  const COLS = [-2.4, 0, 2.4], ROWS = [-1.6, -6.6, -11.6];
  ROWS.forEach((rz, r) => COLS.forEach((cx, c) => {
    const g = group(L, cx, 0, rz, 0, { name: "Rock", stand: [cx, rz + 0.3], show: () => !S.flags.rocksDone && (S.rockStep || 0) === r, say: () => rockAct(r, c) });
    const m = put(L, new THREE.DodecahedronGeometry(0.8, 0), mat({ color: 0x7a7080 }), 0, 0.25, 0, 0, null, g); m.rotation.set(r + c, c, 0);
  }));
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
  signpost(L, -6.4, 3.4, "< AROUND BACK", { name: "Path around behind the castle", exit: true, stand: [-5.8, 3.2],
    run: () => S.flags.statueTold ? goLevel("castleBack", "castle") : say([["", "Just rocks and more rocks back there."]]) });
  crew(L, 0, 3.2);
  L.walk = [-5, 5, 2.4, 5.5]; L.start = [0, 3.2];
  L.entries = { roadmap: [4.6, 3.4], castleBack: [-5.2, 3.2] };
  L.onEnter = () => S.flags.rocksDone ? [] : [["", "A vast, barren landscape up in the mountain. The wizard's castle is very far away..."],
    ["", "The gigantic front door is closed, and very dangerous rocks are in the way. Up in the sky, the clouds are drifting in a strange pattern..."]];
  L.light = { amb: 0x707080, dir: [0.4, -1, -0.5], dirCol: 0x606070, pts: [[[0, 5, -22], 0xffe08a, 8], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x8a8a98, 18, 70]; L.bg = 0x8a8a98;
  cam(L, [0, 5.5, 11], [0, 2.5, -8], 56, (p) => p.y > -14, 200);
  cam(L, [3.5, 3.0, -11], [0, 2.4, -21], 56, null, 200);
  L.update = (t) => {
    if (S.flags.rocksDone) { L.walk = [-3, 3, -18, -15.5]; } else { L.walk = [-5, 5, 2.4, 5.5]; if (!S.rockPat) newRockPattern(); }
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
  const garage = group(L, 0.5, 0, -5.95, 0, { name: "Truck entrance", stand: [0.5, -3.4], say: [["", "The secret truck entrance, just like the statue said!"], ["", "(What's inside, and how this fits with the front door: the kids are still writing it!)"]] });
  put(L, planeG(4, 3.2), mat({ map: T.garage }), 0, 0, 0, 0, null, garage);
  const truck = group(L, -4.2, 0, -3.6, 0.3, { name: "Old truck", say: [["", "An old delivery truck. What does the wizard get delivered?"]] });
  put(L, boxG(2.6, 1.8, 1.5), mat({ color: 0x8a8a90 }), 0.4, 0.4, 0, 0, null, truck);
  put(L, boxG(1.1, 1.2, 1.4), mat({ color: 0x5a6a8a }), -1.5, 0.4, 0, 0, null, truck);
  [[-1.4, 0.75], [1.0, 0.75], [-1.4, -0.75], [1.0, -0.75]].forEach(([a, b]) => { const w = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10); w.rotateX(Math.PI / 2); put(L, w, mat({ color: 0x1a1a1e }), a, 0.4, b, 0, null, truck); });
  crew(L, 2, 2.4);
  L.walk = [-6, 6, -3.6, 4]; L.start = [2, 2.4];
  L.entries = { castle: [5.4, 2.6] };
  signpost(L, 6.4, 3.0, "FRONT >", { name: "Path back to the front", exit: true, go: "castle", stand: [5.8, 2.8] });
  L.onEnter = [["", "Around behind the castle... there's a truck entrance! The statue was right."]];
  L.light = { amb: 0x707080, dir: [0.4, -1, -0.5], dirCol: 0x606070, pts: [[[0.5, 3, -4], 0xffe08a, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x8a8a98, 14, 50]; L.bg = 0x8a8a98;
  cam(L, [1, 4.4, 10], [0, 1.4, -3], 54, null, 200);
  return L;
};
