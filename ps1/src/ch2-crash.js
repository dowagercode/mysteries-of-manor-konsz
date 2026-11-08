// ch2-crash.js: Chapter 2: the crash site, the ping-pong fight, and the gas station. crew() makes the whole crew walk together.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

LV.beach = () => {
  const L = newLevel("beach", "Crash Site");
  const gy = (x, z) => 0.18 * Math.sin(x * 0.6) * Math.cos(z * 0.5) + 0.1 * Math.sin(x * 1.7 + z) + (z < -2.5 ? (z + 2.5) * 0.32 : 0) + (z > 4 ? (z - 4) * 0.15 : 0);
  L.groundY = gy;
  const sky = new THREE.SphereGeometry(90, 12, 8);
  put(L, sky, mat({ map: T.sky, em: 1, fog: 0, side: THREE.BackSide }));
  const sand = floorG(70, 44, 35, 22); const sp = sand.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setY(i, gy(sp.getX(i), sp.getZ(i) + 4));
  sand.computeVertexNormals();
  put(L, sand, mat({ map: T.sand, rep: [24, 16] }), 0, 0, 4);
  const sea = floorG(160, 100, 40, 26);
  put(L, sea, mat({ map: T.water, rep: [40, 26], wave: 1, scroll: [0.02, 0.01] }), 0, -0.5, -52, 0,
    { name: "The water", say: [["", "The water they fell into, all the way from space."]] });
  // the smiling spaceship, nose-first in the water
  const ship = group(L, 4.5, -0.7, -8.5, -0.35, { name: "The spaceship", stand: [3.2, -2.2],
    say: () => S.flags.crashed ? [["Everyone", "Shucks!"], ["", "The ship is stuck in the water now."]] : [["Everyone", "AHHHHH!"], ["Everyone", "Shucks!"]] });
  const body = new THREE.SphereGeometry(1, 14, 9); body.scale(3.4, 1.8, 2.0);
  const sb = put(L, body, mat({ map: T.shipBody }), 0, 1.0, 0, 0, null, ship); sb.rotation.z = -0.28;
  const finM = mat({ color: 0xa24fd6 });
  const fin1 = put(L, boxG(1.6, 0.12, 1.0), finM, -3.2, 2.4, 0, 0, null, ship); fin1.rotation.z = 0.3;
  const fin2 = put(L, boxG(1.6, 0.12, 1.0), finM, -3.4, 1.6, 0, 0, null, ship); fin2.rotation.z = -0.5;
  const lad = mat({ color: 0x2a1f3d });
  put(L, boxG(0.06, 1.6, 0.06), lad, -0.3, -0.9, 1.4, 0, null, ship); put(L, boxG(0.06, 1.6, 0.06), lad, 0.2, -0.9, 1.4, 0, null, ship);
  for (let i = 0; i < 4; i++) put(L, boxG(0.5, 0.05, 0.05), lad, -0.05, -0.8 + i * 0.38, 1.4, 0, null, ship);
  // rocks
  [[-7, -1.8, 0.7], [-5.6, -2.6, 0.4], [9, 0.5, 0.9], [-9.5, 4, 0.6], [7.5, 5, 0.5]].forEach(([rx, rz, r]) => {
    const m = put(L, new THREE.DodecahedronGeometry(r, 0), mat({ color: 0x8a8090 }), rx, gy(rx, rz) + r * 0.4, rz);
    m.rotation.set(rnd() * 3, rnd() * 3, 0);
  });
  // signpost inland
  const sign = group(L, -8.6, gy(-8.6, 4.5), 4.5, 0.5, { name: "Path to the mountain", exit: true, go: "pingpong", stand: [-8.2, 4.2] });
  put(L, boxG(0.14, 1.9, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, sign);
  put(L, planeG(1.3, 0.52), mat({ map: label(["MOUNTAIN >"], 80, 14, "#d9c39a", "#3b2a20", "#6b4f35") }), 0, 1.3, 0.08, 0, null, sign);
  const mtn = new THREE.ConeGeometry(9, 9, 7); 
  put(L, mtn, mat({ color: 0x6a6070 }), -22, 0, 18);
  // the crew: May leads, the others follow
  const may = addChar(L, "may", 0, 2, 1.3);
  const jon = addChar(L, "jonOval", -0.8, 2.6, 1.3, { name: "Jon", say: [["Jon", "No ma'am!"]] });
  const jasin = addChar(L, "jasin", -1.6, 3.0, 1.3, { name: "Jasin", say: [["Jasin", "I've got my soccer ball, just in case."]] });
  const olivia = addChar(L, "olivia", -2.4, 3.4, 1.3, { name: "Olivia", say: [["Olivia", "Watch this!"]] });
  jon.follow = may; jasin.follow = jon; olivia.follow = jasin;
  L.player = may;
  // the finale: the wizard, the witch, and the apprentice help fix the ship
  [["wizard", 2.4, 0.4, 1.9, "Wizard", "Have a wonderful trip, kids!"], ["witch", 3.4, 0.9, 1.8, "Witch", "Come back and visit. We'll have TEA."], ["apprentice", 1.4, -0.2, 1.5, "Apprentice", "Bye, friends!"]].forEach(([k, x, z, h, n, line1]) => {
    const c = addChar(L, k, x, z, h, { name: n, say: [[n, line1]] }); c.show = c.body.userData.hot.show = () => !!S.flags.finale;
  });
  let rise = 0;
  L.walk = [-9, 9, -2.4, 6.5];
  L.start = [0, 2];
  L.entries = { pingpong: [-7.6, 4.2] };
  // far away inland: the wizard's castle behind the hills and forests, with lightning all around it
  const far = new THREE.Group(); far.position.set(-6, 0, 62); far.rotation.y = Math.PI; L.scene.add(far);
  const fm = mat({ color: 0x3a3048, fog: 0.35 });
  put(L, boxG(8, 5, 3), fm, 0, 4, 0, 0, null, far);
  [[-4, 11, 0.3], [4, 9, -0.3], [-1.5, 8, 0.2], [2, 12, -0.2]].forEach(([tx, h, tw]) => {
    const tw1 = put(L, new THREE.CylinderGeometry(0.6, 0.9, h, 6), fm, tx, 4 + h / 2, 0, 0, null, far); tw1.rotation.z = tw * 0.4;
    put(L, new THREE.ConeGeometry(0.8, 2.2, 6), mat({ color: 0x241c30, fog: 0.35 }), tx - tw * h * 0.2, 4 + h + 1, 0, 0, null, far);
  });
  [[-14, 30, 9], [6, 34, 11], [-2, 40, 8], [16, 38, 10], [-22, 44, 12]].forEach(([hx, hz, r]) => {
    const hill = new THREE.SphereGeometry(r, 10, 6); hill.scale(1.6, 0.45, 1);
    put(L, hill, mat({ color: 0x3e5a3a, fog: 0.5 }), hx, -1, hz);
  });
  [[-9, 22], [-5, 24], [-1, 23], [3, 25], [7, 22], [11, 24], [-13, 25]].forEach(([tx, tz]) => tree(L, tx, tz, 1.8, 0x2a4a2a));
  const bolts = [[-5, 18, 2], [3, 20, -1], [7, 16, 1]].map(([bx, by, bz]) => {
    const pts = []; let px = bx, py = by;
    for (let i = 0; i < 7; i++) { pts.push(new THREE.Vector3(px, py, bz)); px += (rnd() - 0.5) * 2.2; py -= 2.2; }
    const l = line(L, lineG(pts), 0xfff6a0, far); l.visible = false; return l;
  });
  const glowM = mat({ color: 0xfff27a, em: 1, alpha: 0.5 });
  const ballGlow = put(L, new THREE.SphereGeometry(0.28, 8, 6), glowM, 0, -9, 0);
  const tutuGlow = put(L, new THREE.TorusGeometry(0.34, 0.1, 5, 12).rotateX(Math.PI / 2), glowM, 0, -9, 0);
  let cut = false, jumpT = -9;
  L.onEnter = [["Everyone", "AHHHHH!"], ["", "The ship falls all the way from space... SPLASH! Right into the water."], ["Everyone", "Shucks!"],
    ["", "The crew swims to the beach. Then... Jasin's soccer ball and Olivia's tutu start to GLOW!"], () => { S.flags.glowing = true; save(); jumpT = performance.now() / 1000; },
    ["Jasin", "Whoa! My ball!"], ["Olivia", "My tutu is glowing too! What could cause that?"],
    () => { cut = true; }, ["", "Far away, behind the hills and forests, there's a castle... with lightning crashing all around it!"],
    ["Jon", "I wonder if there's a wizard there who can tell us about this?"], () => { cut = false; },
    ["", "Chapter 2 begins! Now everyone walks together."]];
  L.light = { amb: 0x6a6088, dir: [-0.5, -0.7, -0.6], dirCol: 0xd8a8a0, pts: [[[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0xd6a2bd, 14, 60]; L.bg = 0xd6a2bd;
  cam(L, [0, 2.2, 3], [-5, 6, 60], 48, () => cut, 200);
  cam(L, [-1, 4.2, 12.5], [0.5, 0.4, -3], 50, (p) => p.x < 3, 200);
  cam(L, [8.5, 1.6, 4.5], [3.5, 1.0, -6], 56, null, 200);
  L.update = (t, dt) => {
    if (S.flags.shipUp && rise < 1) rise = Math.min(1, rise + (dt || 0.016) * 0.25);
    ship.position.y = -0.7 + Math.sin(t * 1.1) * 0.08 + rise * rise * 9; ship.rotation.z = Math.sin(t * 0.8) * 0.03 + rise * 0.3;
    const flash = Math.sin(t * 7.3) * Math.sin(t * 2.1) > 0.82;
    bolts.forEach((b, i) => (b.visible = flash && (Math.floor(t * 3) + i) % 2 === 0));
    const g = !!S.flags.glowing;
    ballGlow.visible = tutuGlow.visible = g;
    if (g) {
      ballGlow.position.set(jasin.pos.x + 0.25, 0.3 + jasin.body.position.y, jasin.pos.y + 0.05);
      tutuGlow.position.set(olivia.pos.x, 0.5 + olivia.body.position.y, olivia.pos.y);
      glowM.uniforms.uAlpha.value = 0.35 + Math.sin(t * 5) * 0.15;
    }
    const j = t - jumpT;   // everyone jumps, startled
    [jon, jasin, olivia, may].forEach((c, i) => (c.yOff = j > 0 && j < 0.7 ? Math.sin((j - i * 0.05) / 0.7 * Math.PI) * 0.45 : 0));
  };
  return L;
};

// ===================== Chapter 2: after the crash (from doc/zones 02–04) =====================
// The whole crew walks together: May leads, the others follow.
function crew(L, x, z) {
  const may = addChar(L, "may", x, z, 1.3);
  const jon = addChar(L, "jonOval", x - 0.7, z + 0.5, 1.3, { name: "Jon", say: () => kidAct("jon") });
  const jasin = addChar(L, "jasin", x - 1.4, z + 0.9, 1.3, { name: "Jasin", say: () => kidAct("jasin") });
  const olivia = addChar(L, "olivia", x - 2.1, z + 1.3, 1.3, { name: "Olivia", say: () => kidAct("olivia") });
  jon.follow = may; jasin.follow = jon; olivia.follow = jasin;
  L.player = may;
  return { may, jon, jasin, olivia };
}
const KID_TALK = { jon: ["Jon", "No ma'am!"], jasin: ["Jasin", "I've got my soccer ball, just in case."], olivia: ["Olivia", "Watch this!"] };
function kidAct(k) {
  if (L && L.id === "pingpong" && !S.flags.ppKO) return fightMenu(k);
  return [KID_TALK[k]];
}

// ---------- ping-pong fight: the kids' "Team Combo" ----------
const MOVES = {
  jon: "Hide everyone in the portal", jasin: "Kick the glowing soccer ball", olivia: "Spin and float everyone", may: "Grab something with telekinesis",
};
const FIGHT_ORDER = ["jon", "jasin", "olivia", "may"];
const NAMES = { jon: "Jon", jasin: "Jasin", olivia: "Olivia", may: "May" };
function fightMenu(k) {
  return [{ choices: [
    [MOVES[k], () => doMove(k)],
    ["Talk", () => k === "may" ? [["May", "We have to get past him!"]] : [KID_TALK[k]]],
    ["Never mind", () => []],
  ] }];
}
function doMove(k) {
  const f = S.flags, phase = f.ppPhase || 0, want = FIGHT_ORDER[phase];
  const FX = PP.fx;
  if (k !== want) {
    const miss = {
      jon: "Jon opens his portal... but nobody needs to hide right now.",
      jasin: "Jasin kicks his soccer ball. It glows! But the ping-pong bad guy just swats it back.",
      olivia: "Olivia spins and her tutu glows... but it's not the right moment yet.",
      may: phase === 3 ? "" : "May reaches out with her mind... but she can't get a grip on anything while he's swinging!",
    }[k];
    return [["", miss], ["Ping-pong bad guy", "Hold STILL! *huff* *puff*"]];
  }
  if (k === "jon") return [() => FX.portal(true), ["", "The ping-pong bad guy swings his paddle! Jon opens his portal and hides everyone inside."], ["", "WHIFF! The paddle swings right past!"], () => { f.ppPhase = 1; save(); }];
  if (k === "jasin") return [["", "Before Olivia comes out, Jasin kicks his soccer ball. It glows and flies like a fireball!"], () => FX.fireball(), ["", "WHAM! The paddle goes flying out of the ping-pong bad guy's hand!"], () => { FX.portal(false); f.ppPhase = 2; save(); }];
  if (k === "olivia") return [["Ping-pong bad guy", "Hey! Come back down here!"], ["", "He attacks again! Olivia spins, her tutu glows really strong, and everyone floats up out of reach!"], () => FX.float(true), ["Olivia", "I'll keep spinning! Get him!"], () => { f.ppPhase = 3; save(); }];
  return [["May", "I can lift that with my mind!"], ["", "May grabs the ping-pong stick with her mind..."], () => FX.bonk(), ["", "BONK! The ping-pong bad guy is knocked out!"], () => { FX.float(false); f.ppKO = true; save(); }, ["", "Now the crew can get away. Down the mountain, the road leads to a gas station."]];
}
const PP = { fx: {} };

LV.pingpong = () => {
  const L = newLevel("pingpong", "Ping-pong Station");
  const RW = 12, RD = 8, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 4.2, wall: T.rock, floor: T.stoneFloor, wallRep: 2, floorRep: 1.5, ceil: 0x2a2420, trim: 0x3a3028 });
  // the creepy ping-pong table
  const table = group(L, 0.8, 0, -1.9, 0, { name: "Ping-pong table", say: [["", "A creepy old ping-pong table, right in the middle of the mountain."]] });
  put(L, boxG(2.8, 0.08, 1.5), mat({ map: T.ppTable }), 0, 0.76, 0, 0, null, table);
  [[-1.3, -0.65], [1.3, -0.65], [-1.3, 0.65], [1.3, 0.65]].forEach(([a, b]) => put(L, boxG(0.08, 0.76, 0.08), mat({ color: 0x2a2a2e }), a, 0, b, 0, null, table));
  put(L, boxG(0.03, 0.18, 1.6), mat({ color: 0xf4f4f4 }), 0, 0.84, 0, 0, null, table);
  // rocks around the cave
  [[-5, -3, 0.9], [5.2, -2.8, 1.1], [-5.3, 2.5, 0.7], [5.4, 2.2, 0.8], [-3.5, -3.3, 0.6]].forEach(([rx, rz, r]) => {
    const m = put(L, new THREE.DodecahedronGeometry(r, 0), mat({ color: 0x6a5e52 }), rx, r * 0.4, rz); m.rotation.set(rnd() * 3, rnd() * 3, 0);
  });
  // the ping-pong bad guy
  const bad = addChar(L, "pingpong", 2.9, -2.4, 1.75, { name: "Ping-pong bad guy", stand: [1.0, -0.6],
    say: () => S.flags.ppKO ? [["", "The ping-pong bad guy is knocked out. Zzz..."]] : [["Ping-pong bad guy", "Nobody gets past MY ping-pong station!"], ["", "Click a kid to use their special move."]] });
  const zzz = put(L, planeG(0.7, 0.3), mat({ map: label(["Zzz"], 32, 14, "#2a2420", "#ffffff", "#2a2420"), em: 1 }), 3.3, 0.9, -2.2, -0.3);
  // effects
  const portalG = new THREE.CircleGeometry(1, 16); portalG.scale(0.6, 1.1, 1); portalG.translate(0, 1.2, 0);
  const portal = put(L, portalG, mat({ map: T.portal, em: 1, rep: [1.5, 1.5], scroll: [0.05, 0.08], side: THREE.DoubleSide }), -2.2, 0, 0.6, 0.3);
  const ball = put(L, new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0xff9a30, em: 1 }), 0, -5, 0);
  const team = crew(L, -2.6, 1.0);
  const kids = [team.may, team.jon, team.jasin, team.olivia];
  let fireT = -1, bonkT = -1;
  PP.fx = {
    portal: (on) => { S.flags.ppHidden = on; },
    fireball: () => { fireT = 0; },
    float: (on) => { S.flags.ppFloat = on; },
    bonk: () => { bonkT = 0; },
  };
  ["jon", "jasin", "olivia"].forEach((k) => {});
  team.may.body.userData.hot = { name: "May", say: () => S.flags.ppKO ? [["May", "We did it!"]] : fightMenu("may") };
  L.hots.push(team.may.body);
  L.walk = [-5, 5, -0.8, 3.2];
  L.start = [-2.6, 1.0];
  L.entries = { beach: [-4.2, 2.4], gas: [4.2, 2.4] };
  const back = group(L, -5.6, 0, 2.6, 0, { name: "Path back to the beach", exit: true, go: "beach", stand: [-4.8, 2.6] });
  put(L, boxG(0.6, 2.4, 1.6), mat({ color: 0x1a1612 }), 0, 0, 0, 0, null, back);
  const fwd = group(L, 5.6, 0, 2.6, 0, { name: "Path down to the gas station", exit: true, stand: [4.8, 2.6],
    run: () => S.flags.ppKO ? goLevel("gas", "pingpong") : say([["", "The ping-pong bad guy blocks the way!"]]) });
  put(L, boxG(0.6, 2.4, 1.6), mat({ color: 0x1a1612 }), 0, 0, 0, 0, null, fwd);
  L.onEnter = () => S.flags.ppKO ? [] : [["", "The crew runs to the mountain... and right into a creepy ping-pong station!"], ["Ping-pong bad guy", "Nobody gets past MY ping-pong station!"], ["", "He keeps trying to hit them with his ping-pong stick! Click a kid to use their special move."]];
  L.light = { amb: 0x5a5048, dir: [0.3, -1, -0.4], dirCol: 0x585048, pts: [[[1, 3.2, -1.5], 0x9aff9a, 7], [[-3, 2, 2], 0xffb070, 6], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0e0c0a, 9, 24]; L.bg = 0x0e0c0a;
  cam(L, [-0.8, 3.6, 7.6], [0.4, 0.9, -1.0], 54);
  L.update = (t, dt) => {
    const f = S.flags;
    kids.forEach((c, i) => {
      c.root.visible = !f.ppHidden;
      c.yOff = f.ppFloat ? 0.9 + Math.sin(t * 2 + i) * 0.12 : 0;
    });
    portal.visible = !!f.ppHidden;
    if (fireT >= 0) {
      fireT += dt * 1.6;
      const k = Math.min(1, fireT);
      ball.position.set(-1.6 + 4.4 * k, 0.6 + Math.sin(k * Math.PI) * 1.2, 0.8 - 3.0 * k);
      if (k >= 1) { fireT = -1; ball.position.y = -5; }
    }
    bad.body.rotation.z = f.ppKO ? Math.PI / 2 * 0.9 : 0;
    bad.yOff = f.ppKO ? 0.3 : 0;
    zzz.visible = !!f.ppKO;
    zzz.position.y = 0.9 + Math.sin(t * 2) * 0.08;
    if (bonkT >= 0) { bonkT += dt; if (bonkT > 0.6) bonkT = -1; }
  };
  return L;
};

// ---------- gas station ----------
const STONES = [["momStone", "mom"], ["dadStone", "dad"], ["wifeStone", "wife"]];
const stoneCount = () => STONES.filter(([id]) => S.flags["got_" + id]).length;
LV.gas = () => {
  const L = newLevel("gas", "Gas Station");
  const sky = new THREE.SphereGeometry(90, 12, 8);
  put(L, sky, mat({ map: T.nightSky, em: 1, fog: 0, side: THREE.BackSide }));
  put(L, floorG(40, 30, 20, 15), mat({ map: T.asphalt, rep: [14, 10] }), 0, 0, 0);
  // the gas station building
  const shop = group(L, -1.5, 0, -6, 0);
  put(L, boxG(7, 3.2, 3), mat({ color: 0xb8a888 }), 0, 0, -1.5, 0, null, shop);
  put(L, planeG(2.2, 0.6), mat({ map: label(["GAS"], 40, 14, "#c82020", "#fff4d0", "#801010"), em: 0.6 }), 0, 2.45, 0.02, 0, null, shop);
  put(L, planeG(2.0, 1.2), mat({ color: 0xffe8a0, em: 0.7 }), 1.8, 0.9, 0.01, 0, null, shop);
  onWall(L, "back", [40, 12.04], doorTex("#6b5a40", "#d8c8a0"), 1.1, 2.1, -2.2, 0, { name: "Door into the gas station", go: "gasShop", stand: [-3.7, -4.4] });
  // canopy and pumps
  const canopyM = mat({ color: 0xe8e0d0 });
  [[-0.5, -2.2], [4.5, -2.2], [-0.5, 1.2], [4.5, 1.2]].forEach(([px, pz]) => put(L, boxG(0.2, 3.4, 0.2), canopyM, px, 0, pz));
  put(L, boxG(5.6, 0.3, 4.2), mat({ color: 0xc82020 }), 2, 3.4, -0.5);
  put(L, boxG(5.2, 0.02, 3.8), mat({ color: 0xfff4d0, em: 1 }), 2, 3.39, -0.5);
  const pump = group(L, 2, 0, -0.5, 0, { name: "Gas pump", say: [["", "An old gas pump. The numbers stopped a long time ago."]] });
  put(L, boxG(0.7, 1.6, 0.5), mat({ color: 0xc82020 }), 0, 0, 0, 0, null, pump);
  put(L, planeG(0.5, 0.3), mat({ color: 0x1a1a20, em: 0.3 }), 0, 1.1, 0.26, 0, null, pump);
  const squeegee = group(L, 2.55, 0.9, -0.2, 0, { name: "Squeegee", show: () => !S.flags.got_squeegee,
    say: () => [() => add("squeegee", "got_squeegee"), ["", "A squeegee for cleaning windshields. It goes in your item drawer."]] });
  put(L, boxG(0.04, 0.7, 0.04), mat({ color: 0x3a3a40 }), 0, -0.3, 0, 0.3, null, squeegee);
  put(L, boxG(0.35, 0.08, 0.06), mat({ color: 0x2a6ad8 }), 0, 0.4, 0, 0.3, null, squeegee);
  const washer = group(L, 3.4, 0, -0.5, 0, { name: "Windshield washer container",
    say: () => S.flags.got_momStone ? [["", "Just blue windshield washer fluid."]] : [["", "A container of blue windshield washer fluid. Something is sitting at the bottom... too deep to reach with your hand."]],
    use: { squeegee: () => S.flags.got_momStone ? [["", "Nothing else in there."]] : [() => { remove("squeegee"); add("momStone", "got_momStone"); }, ["", "May fishes around with the squeegee... and pulls out a stone! It has a picture of a skeleton lady on it. His mom?"]] } });
  put(L, new THREE.CylinderGeometry(0.3, 0.26, 0.7, 8), mat({ color: 0x3a8ad8, em: 0.15 }), 0, 0.35, 0, 0, null, washer);
  // three old cars; one is the creepy jeep
  const car = (x, z, c, name, line) => {
    const g = group(L, x, 0, z, 0.2, { name, say: [["", line]] });
    put(L, boxG(2.4, 0.6, 1.2), mat({ color: c }), 0, 0.3, 0, 0, null, g);
    put(L, boxG(1.3, 0.5, 1.1), mat({ color: c }), -0.1, 0.9, 0, 0, null, g);
    [[-0.8, 0.62], [0.8, 0.62], [-0.8, -0.62], [0.8, -0.62]].forEach(([a, b]) => {
      const w = new THREE.CylinderGeometry(0.3, 0.3, 0.16, 8); w.rotateX(Math.PI / 2);
      put(L, w, mat({ color: 0x1a1a1e }), a, 0.3, b, 0, null, g);
    });
    return g;
  };
  car(-7, 2.5, 0x6a7a8a, "Old car", "An old car covered in dust.");
  car(-9.5, -1, 0x8a6a4a, "Old car", "Another dusty old car. Flat tires.");
  const jeep = group(L, 8.5, 0, 1.5, -0.4, { name: "The creepy jeep",
    say: () => S.flags.gotJeep ? driveAway() : [["", "The creepy jeep! But the skeleton owner has the keys."]], use: { jeepKeys: () => driveAway() } });
  const jm = mat({ color: 0x5a6a4a });
  put(L, boxG(1.4, 0.7, 1.4), jm, -1.0, 0.45, 0, 0, null, jeep);
  put(L, boxG(1.8, 1.6, 1.5), jm, 0.6, 0.45, 0, 0, null, jeep);
  put(L, planeG(0.9, 0.55), mat({ color: 0x9ab8c8, em: 0.2 }), 0.6, 1.35, 0.76, 0, null, jeep);
  put(L, planeG(0.4, 0.5), mat({ map: label(["S"], 12, 14, "#5a6a4a", "#e8e0c0", "#5a6a4a") }), -0.2, 0.7, 0.71, 0, null, jeep);
  [[-1.2, 0.75], [1.0, 0.75], [-1.2, -0.75], [1.0, -0.75]].forEach(([a, b]) => {
    const w = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 10); w.rotateX(Math.PI / 2);
    put(L, w, mat({ map: T.spokes }), a, 0.45, b, 0, null, jeep);
  });
  put(L, boxG(0.4, 0.5, 0.08), jm, 0.2, -0.05, 0.78, 0, null, jeep);
  const team = crew(L, -4, 4);
  L.walk = [-11, 11, -3.6, 8];
  L.start = [-4, 4];
  L.entries = { pingpong: [-9, 6.5], gasShop: [-3.7, -3.6] };
  const back = group(L, -11.5, 0, 6.5, 0, { name: "Road back to the mountain", exit: true, go: "pingpong", stand: [-10.6, 6.5] });
  put(L, boxG(0.14, 1.6, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, back);
  put(L, planeG(1.2, 0.4), mat({ map: label(["< MOUNTAIN"], 80, 14, "#d9c39a", "#3b2a20", "#6b4f35") }), 0, 1.3, 0.08, 0, null, back);
  L.onEnter = [["", "Down the mountain road, there's a gas station. A very strange, empty place..."], ["", "Three old cars are parked here. One of them is a creepy jeep!"]];
  L.light = { amb: 0x5a5878, dir: [-0.3, -1, -0.4], dirCol: 0x484868, pts: [[[2, 3.2, -0.5], 0xfff0c0, 9], [[-1.5, 1.5, -4], 0xffe0a0, 6], [[8.5, 2, 1.5], 0x90ffb0, 5]] };
  L.fog = [0x1a1430, 12, 45]; L.bg = 0x1a1430;
  cam(L, [-2, 5, 12], [0.5, 0.5, -1.5], 52, (p) => p.x < 4.5, 200);
  cam(L, [11, 3.2, 8], [5, 0.6, -1], 54, null, 200);
  return L;
};
function driveAway() {
  if (!S.flags.gotJeep) return [["", "The creepy jeep is locked."]];
  if (S.flags.drove) return [() => goLevel("roadmap", "gas")];
  return [["", "Everyone piles into the creepy jeep..."], ["Everyone", "Let's go!"], () => { remove("jeepKeys"); S.flags.drove = true; save(); }, ["", "VROOM! The creepy jeep rattles down the road."],
    ["", "Chapter 3: the road trip!"], () => goLevel("roadmap", "gas")];
}
function ownerAct() {
  const f = S.flags, n = STONES.filter(([id]) => has(id)).length;
  if (f.gotJeep) return [["", "The skeleton owner just smiles. He waves at the jeep."]];
  if (n === 3) return [() => { STONES.forEach(([id]) => remove(id)); add("jeepKeys", "gotJeep"); },
    ["", "May shows him the three stones: his mother, his father, and his wife."], ["", "The skeleton's smile gets even bigger. He hands over the keys to the creepy jeep!"]];
  f.metOwner = true; save();
  return [["", "The skeleton owner doesn't say a word. He just smiles..."], ["", "He taps three empty spots on his counter, each shaped like a stone. He wants something!"],
    ...(n ? [["", `May has ${n} of the 3 stones.`]] : [])];
}
LV.gasShop = () => {
  const L = newLevel("gasShop", "Gas Station Shop");
  const RW = 9, RD = 6, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.oldWall, floor: T.oldTile, wallRep: 1.4, floorRep: 0.8, ceil: 0x6a6450, trim: 0x5a4a30 });
  onWall(L, "back", R, doorTex("#6b5a40", "#d8c8a0"), 1.1, 2.1, -3.6, 0, { name: "Door outside", go: "gas", stand: [-3.5, -1.3] });
  onWall(L, "right", R, doorTex("#4a6a8a", "#c8d8e8"), 1.0, 2.0, -0.4, 0, { name: "Door to the restroom", go: "gasRest", stand: [3.9, -0.4] });
  const counter = group(L, 0.6, 0, -2.3, 0, { name: "Counter", say: () => ownerAct(), use: Object.fromEntries(STONES.map(([id]) => [id, ownerAct])) });
  put(L, boxG(2.6, 1.0, 0.8), mat({ color: 0x8a6a4a }), 0, 0, 0, 0, null, counter);
  put(L, boxG(2.7, 0.06, 0.86), mat({ color: 0xc8b890 }), 0, 1.0, 0, 0, null, counter);
  const owner = addChar(L, "skeleton", 0.6, -2.95, 1.55, { name: "Skeleton owner", stand: [0.6, -1.3], say: () => ownerAct(),
    use: Object.fromEntries(STONES.map(([id]) => [id, ownerAct])) });
  const shelf = group(L, -2.2, 0, -2.6, 0, { name: "Old snacks", say: [["", "Old snacks. Everything here is a little bit old. Nothing looks good to eat."]] });
  put(L, boxG(1.4, 1.8, 0.5), mat({ map: T.oldSnacks }), 0, 0, 0, 0, null, shelf);
  const rack = group(L, 2.9, 0, -2.5, -0.3, { name: "Magazine rack", say: () => S.flags.got_dadStone ? [["", "Old magazines and travel brochures."]] : [["", "A rack of old magazines and travel brochures. Which one should May look at?"], { choices: [
    ["Fishing", () => [["", "A fishing magazine. Just fish."]]], ["Caves", () => [["", "A magazine about caves."]]], ["Maps", () => [["", "A magazine full of maps."]]],
    ["Road Stops", () => [["", "A magazine about road stops. Hey, this gas station is in it!"]]], ["Comics", () => [["", "Old comics."]]],
    ["Local Rocks", () => [() => add("dadStone", "got_dadStone"), ["", "May pulls out the \"Local Rocks\" magazine... a stone is hidden behind it! It has a picture of a skeleton man on it. His dad?"]]],
    ["Never mind", () => []]] }] });
  put(L, boxG(0.9, 1.4, 0.35), mat({ map: T.magRack }), 0, 0, 0, 0, null, rack);
  const team = crew(L, -1.2, 1.2);
  L.walk = [-3.8, 3.8, -1.35, 2.5];
  L.start = [-1.2, 1.2]; L.entries = { gas: [-3.3, -0.9], gasRest: [3.4, -0.2] };
  L.light = { amb: 0x6a6a5a, dir: [0.3, -1, -0.5], dirCol: 0x605848, pts: [[[0, 2.9, 0], 0xfff0b0, 7], [[0.6, 1.6, -2.4], 0xb0ffb0, 2.5], [[0, 0, 0], 0, 1]] };
  L.fog = [0x14120c, 10, 24]; L.bg = 0x14120c;
  cam(L, [0.4, 3.1, 6.4], [0.2, 1.1, -1.4], 52);
  return L;
};
LV.gasRest = () => {
  const L = newLevel("gasRest", "Gas Station Restroom");
  const RW = 6, RD = 5, R = [RW, RD];
  room(L, { w: RW, d: RD, wall: T.bathTile, floor: T.oldTile, wallRep: 0.7, floorRep: 0.8, ceil: 0x8a9098, trim: 0x6a7480 });
  onWall(L, "left", R, doorTex("#4a6a8a", "#c8d8e8"), 1.0, 2.0, 0.6, 0, { name: "Door back to the shop", go: "gasShop", stand: [-2.4, 0.6] });
  const white = mat({ color: 0xe8e4d8 });
  const toilet = group(L, 1.2, 0, -2.0, 0, { name: "Toilet", say: () => S.flags.got_marketKey ? [["", "An old toilet."]] : [() => add("marketKey", "got_marketKey"), ["", "There's a key sitting on top of the toilet! A tag says \"Supermarket\". It goes in your item drawer."]] });
  put(L, new THREE.CylinderGeometry(0.26, 0.2, 0.42, 8), white, 0, 0.21, 0, 0, null, toilet);
  put(L, boxG(0.55, 0.7, 0.22), white, 0, 0.3, -0.27, 0, null, toilet);
  const tag = put(L, boxG(0.12, 0.03, 0.06), mat({ color: 0xffd23f }), 0, 1.02, -0.27, 0, null, toilet);
  const sink = group(L, -0.9, 0, -2.2, 0, { name: "Sink cupboard", say: () => S.flags.got_wifeStone ? [["", "The cupboard under the sink is empty now."]] : [["", "May opens the cupboard under the sink..."], () => add("wifeStone", "got_wifeStone"), ["", "A stone! It has a picture of a skeleton lady with a flower. His wife?"]] });
  put(L, boxG(0.9, 0.8, 0.5), mat({ color: 0x8a7a5a }), 0, 0, 0, 0, null, sink);
  put(L, boxG(0.9, 0.12, 0.5), white, 0, 0.8, 0, 0, null, sink);
  onWall(L, "back", R, T.mirror, 0.7, 0.8, -0.9, 1.3, { name: "Mirror", say: [["", "A dusty mirror."]] }, 0x8a8a90);
  L.player = addChar(L, "may", 0, 1.0, 1.3);
  L.walk = [-2.4, 2.4, -1.0, 1.8];
  L.start = [0, 1.0]; L.entries = { gasShop: [-1.8, 0.6] };
  L.update = () => { tag.visible = !S.flags.got_marketKey; };
  L.light = { amb: 0x6a7078, dir: [0.3, -1, -0.5], dirCol: 0x606870, pts: [[[0, 2.9, 0], 0xe8f0ff, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x101418, 9, 22]; L.bg = 0x101418;
  cam(L, [0.6, 2.9, 5.2], [0, 1.0, -1.2], 54);
  return L;
};
