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
  buildSpaceship(L, ship, -0.28);
  // rocks
  [[-7, -1.8, 0.7], [-5.6, -2.6, 0.4], [9, 0.5, 0.9], [-9.5, 4, 0.6], [7.5, 5, 0.5]].forEach(([rx, rz, r]) => {
    const m = put(L, new THREE.DodecahedronGeometry(r, 0), mat({ color: 0x8a8090 }), rx, gy(rx, rz) + r * 0.4, rz);
    m.rotation.set(rnd() * 3, rnd() * 3, 0);
  });
  // signpost inland, plus the jeep once the crew has it
  const sign = group(L, -8.6, gy(-8.6, 4.5), 4.5, 0.5, { name: "Path to the mountain", exit: true, go: "mountainUp", stand: [-8.2, 4.2] });
  put(L, boxG(0.14, 1.9, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, sign);
  put(L, planeG(1.3, 0.52), mat({ map: label(["MOUNTAIN >"], 80, 14, "#d9c39a", "#3b2a20", "#6b4f35") }), 0, 1.3, 0.08, 0, null, sign);
  const jeep = group(L, -4.8, gy(-4.8, 3.4), 3.4, 0.35, { ...toJeep([-3.2, 3.0]), show: () => !!S.flags.drove });
  miniJeep(L, jeep);
  const mtn = new THREE.ConeGeometry(9, 9, 7); 
  put(L, mtn, mat({ color: 0x6a6070 }), -22, 0, 18);
  // the crew: May leads, the others follow
  const { may, jon, jasin, olivia } = crew(L, 0, 2);
  // the finale: the wizard, the witch, and the apprentice help fix the ship
  [["wizard", 2.4, 0.4, 1.9, "Wizard", "Have a wonderful trip, kids!"], ["witch", 3.4, 0.9, 1.8, "Witch", "Come back and visit. We'll have TEA."], ["apprentice", 1.4, -0.2, 1.5, "Apprentice", "Bye, friends!"]].forEach(([k, x, z, h, n, line1]) => {
    const c = addChar(L, k, x, z, h, { name: n, say: [[n, line1]] }); c.show = c.body.userData.hot.show = () => !!S.flags.finale;
  });
  let rise = 0;
  L.walk = [-9, 9, -2.4, 6.5];
  L.start = [0, 2];
  L.entries = { pingpong: [-7.6, 4.2], mountainUp: [-7.6, 4.2], roadmap: [-1.4, 2.6] };
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
  const glowM = mat({ color: 0x3ff0ff, em: 1, alpha: 0.5 });   // cyan glow on the ball and tutu
  const ballGlow = put(L, new THREE.SphereGeometry(0.28, 8, 6), glowM, 0, -9, 0);
  const tutuGlow = put(L, new THREE.TorusGeometry(0.34, 0.1, 5, 12).rotateX(Math.PI / 2), glowM, 0, -9, 0);
  let cut = false, jumpT = -9;
  L.onEnter = () => S.flags.ppKO || S.flags.drove
    ? [["", "Back at the crash site. The ship is still sitting in the water."]]
    : [["Everyone", "AHHHHH!"], ["", "The ship falls all the way from space... SPLASH! Right into the water."], ["Everyone", "Shucks!"],
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
// The whole crew walks together: the chosen kid leads (S.flags.lead, see powers.js), the others follow.
function crew(L, x, z) {
  const may = addChar(L, "may", x, z, 1.3, { name: "May", say: () => kidAct("may") });
  const jon = addChar(L, "jonOval", x - 0.7, z + 0.5, 1.3, { name: "Jon", say: () => kidAct("jon") });
  const jasin = addChar(L, "jasin", x - 1.4, z + 0.9, 1.3, { name: "Jasin", say: () => kidAct("jasin") });
  const olivia = addChar(L, "olivia", x - 2.1, z + 1.3, 1.3, { name: "Olivia", say: () => kidAct("olivia") });
  L.crew = { may, jon, jasin, olivia };
  applyLead(L);
  return L.crew;
}
const KID_TALK = { may: ["May", "I can move things with my mind!"], jon: ["Jon", "No ma'am!"], jasin: ["Jasin", "I've got my soccer ball, just in case."], olivia: ["Olivia", "Watch this!"] };
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
  if (k === "olivia") return [["Ping-pong bad guy", "Hey! Come back down here!"], ["", "He attacks again! Olivia spins, her tutu glows really strong, and Jon, Jasin, and Olivia float up out of reach!"], ["", "May stays on the ground and gets ready to use her mind."], () => FX.float(true), ["Olivia", "I'll keep spinning! Get him!"], () => { f.ppPhase = 3; save(); }];
  return [["May", "I can lift that with my mind!"], ["", "May grabs the ping-pong stick with her mind..."], () => FX.bonk(), ["", "BONK! The ping-pong bad guy is knocked out!"], () => { FX.float(false); f.ppKO = true; save(); }, ["", "Now the crew can get away. Down the mountain, the road leads to a gas station."]];
}
const PP = { fx: {} };

const PONG_NAMES = ["", "Easy", "Medium", "Hard"];
function showDiploma(lvl = Math.min(3, S.flags.pongBeaten || 1)) {
  const c = document.createElement("canvas"); c.width = 320; c.height = 220;
  const x = c.getContext("2d");
  x.fillStyle = "#fbf3dc"; x.fillRect(0, 0, 320, 220);
  x.strokeStyle = "#8a5a28"; x.lineWidth = 6; x.strokeRect(8, 8, 304, 204);
  x.strokeStyle = "#d4a024"; x.lineWidth = 2; x.strokeRect(14, 14, 292, 192);
  x.fillStyle = "#2a1f3d"; x.textAlign = "center";
  x.font = "bold 15px Georgia, serif"; x.fillText("MOUNTAIN PING-PONG STATION", 160, 40);
  x.font = "bold 19px Georgia, serif"; x.fillStyle = "#8a2820"; x.fillText("DIPLOMA OF EXCELLENT", 160, 68);
  x.fillText("PING-PONG", 160, 92);
  x.font = "13px Georgia, serif"; x.fillStyle = "#2a1f3d";
  x.fillText("Awarded to May, Jon, Jasin & Olivia", 160, 120);
  x.font = "bold 14px Georgia, serif"; x.fillStyle = "#2f7a4a";
  x.fillText(`Official Pong Champion · Level ${lvl} / 3 (${PONG_NAMES[lvl]})`, 160, 146);
  // Gold seal + miniature paddle
  x.fillStyle = "#ffd23f"; x.beginPath(); x.arc(255, 168, 20, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#b87a10"; x.lineWidth = 2; x.stroke();
  x.fillStyle = "#8a2820"; x.font = "bold 10px sans-serif"; x.fillText("★ #1 ★", 255, 172);
  x.fillStyle = "#5a4a3a"; x.font = "italic 12px Georgia, serif"; x.textAlign = "left";
  x.fillText("Signed: The Ping-Pong Guy", 30, 180);
  showPeek(c.toDataURL(), `Diploma of Excellent Ping-Pong (Level ${lvl} of 3 — ${PONG_NAMES[lvl]}). Click anywhere to close.`);
}
function pongChoices() {
  return [{ choices: [
    ...[1, 2, 3].map((l) => [`Play Level ${l}: ${PONG_NAMES[l]}${S.flags["pongWon_" + l] ? " ★" : ""}`, () => { startPong(l); return []; }]),
    ...(has("diploma") ? [["Look at Diploma of Excellent Ping-Pong", () => { showDiploma(); return []; }]] : []),
    ["Maybe later", () => [["Ping-pong bad guy", "Anytime! My table is always ready for a game."]]],
  ] }];
}
function pongInvite() {
  S.flags.ppFriendly = true; save();
  const best = Math.min(3, S.flags.pongBeaten || 0);
  return [
    ["Ping-pong bad guy", best
      ? `Hey, ping-pong champ! You've beaten me on Level ${best} of 3! Ready for another match?`
      : "Hey, you're back! Sorry about earlier — I was just grumpy because nobody ever plays ping-pong with me!"],
    ["Ping-pong bad guy", has("diploma")
      ? "Want to play a friendly game of Pong? Pick any of the 3 difficulty levels!"
      : "Want to play a friendly game of Pong? I have 3 levels of difficulty — beat me and I'll award you my Diploma of Excellent Ping-Pong!"],
    ...pongChoices(),
  ];
}
function finishPong(lvl, won) {
  lvl = Math.max(1, Math.min(3, lvl));
  S.flags.ppFriendly = true;
  if (!won) {
    save();
    say([["Ping-pong bad guy", "Good game! That was close! Want to try again?"], ...pongChoices()]);
    return;
  }
  S.flags["pongWon_" + lvl] = true;
  S.flags.pongBeaten = Math.min(3, Math.max(S.flags.pongBeaten || 0, lvl));
  const firstDiploma = !has("diploma") && !S.flags.got_diploma;
  if (firstDiploma) add("diploma", "got_diploma");
  else save();
  say([
    ["Ping-pong bad guy", `WOW! What a shot! You beat me on Level ${lvl} (${PONG_NAMES[lvl]})!`],
    ...(firstDiploma
      ? [["Ping-pong bad guy", "You've earned my special reward: the official Diploma of Excellent Ping-Pong!"],
         ["", "Diploma of Excellent Ping-Pong! It goes in your item drawer."],
         () => showDiploma(S.flags.pongBeaten)]
      : [["Ping-pong bad guy", `I've updated your Diploma of Excellent Ping-Pong with your Level ${S.flags.pongBeaten} seal!`]]),
    ...pongChoices(),
  ]);
}
function startPong(initialLvl = 1) {
  const cv = $("astro"), x = cv.getContext("2d");
  cv.hidden = false; busy = true; stopSpeaking();
  let lvl = Math.max(1, Math.min(3, initialLvl || 1));
  let pScore = 0, cScore = 0, py = 130, cy = 130, prevPy = 130, pVel = 0;
  let ball = { x: 160, y: 130, vx: 0, vy: 0 }, serveT = 0.55, rally = 0, banner = "", endT = -1, over = false;
  let keys = { up: false, down: false }, sparks = [];
  const resetBall = (dir = 1) => {
    ball.x = 160; ball.y = 130; ball.vx = 0; ball.vy = 0; serveT = 0.55; rally = 0;
    ball.dir = dir;
  };
  const setLevel = (newLvl) => {
    lvl = Math.max(1, Math.min(3, newLvl));
    pScore = 0; cScore = 0; py = 130; cy = 130; banner = ""; endT = -1;
    resetBall(1);
  };
  setLevel(lvl);
  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 320, y: (e.clientY - r.top) / r.height * 240 }; };
  const move = (e) => {
    const p = pt(e);
    if (endT < 0) py = Math.max(54, Math.min(206, p.y));
  };
  const down = (e) => {
    e.preventDefault();
    const p = pt(e);
    // Top bar: Exit button [x: 272..316, y: 2..16]
    if (p.x >= 272 && p.y <= 17) { cleanup(); return; }
    // Level buttons 1..3 [y: 16..30, x: 12 + i*92, width: 84]
    if (p.y >= 15 && p.y <= 31) {
      for (let i = 0; i < 3; i++) {
        const bx = 12 + i * 92;
        if (p.x >= bx && p.x <= bx + 84) { setLevel(i + 1); tone(440 + i * 80, 0.06, "triangle", 0.08); return; }
      }
    }
    if (endT < 0) py = Math.max(54, Math.min(206, p.y));
  };
  const key = (e) => {
    const on = e.type === "keydown";
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { e.preventDefault(); keys.up = on; }
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { e.preventDefault(); keys.down = on; }
    if (on && e.key === "Escape") { e.preventDefault(); cleanup(); }
    if (on && /^[1-3]$/.test(e.key)) { setLevel(Number(e.key)); }
  };
  cv.addEventListener("pointermove", move); cv.addEventListener("pointerdown", down);
  window.addEventListener("keydown", key); window.addEventListener("keyup", key);
  function cleanup(cb) {
    if (over) return;
    over = true;
    cv.removeEventListener("pointermove", move); cv.removeEventListener("pointerdown", down);
    window.removeEventListener("keydown", key); window.removeEventListener("keyup", key);
    cv.hidden = true; busy = false;
    if (cb) cb();
  }
  let last = performance.now(), t0 = last;
  function tick(now) {
    if (over) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const el = (now - t0) / 1000;
    const ph = 54 - (lvl - 1) * 4, ch = 26 + (lvl - 1) * 3;
    if (endT >= 0) {
      endT -= dt;
      if (endT <= 0) { const won = pScore >= 3; cleanup(() => finishPong(lvl, won)); return; }
    } else {
      if (keys.up) py = Math.max(36 + ph / 2, py - 200 * dt);
      if (keys.down) py = Math.min(224 - ph / 2, py + 200 * dt);
      pVel = (py - prevPy) / Math.max(0.008, dt); prevPy = py;
      if (serveT > 0) {
        serveT -= dt;
        if (serveT <= 0) {
          const spd = 96 + lvl * 12, ang = (rnd() - 0.5) * 0.55;
          ball.vx = (ball.dir || 1) * Math.cos(ang) * spd;
          ball.vy = Math.sin(ang) * spd;
        }
      } else {
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.y < 40) { ball.y = 40; ball.vy = Math.abs(ball.vy); tone(300, 0.04, "sine", 0.05); }
        if (ball.y > 220) { ball.y = 220; ball.vy = -Math.abs(ball.vy); tone(300, 0.04, "sine", 0.05); }
        // Player paddle at x = 24 (generous hit window)
        if (ball.vx < 0 && ball.x <= 30 && ball.x >= 16 && Math.abs(ball.y - py) <= ph / 2 + 7) {
          ball.x = 30; rally++;
          const spd = Math.min(205, Math.hypot(ball.vx, ball.vy) * 1.04);
          const hit = Math.max(-1, Math.min(1, (ball.y - py) / (ph / 2)));
          const ang = hit * 0.78;
          ball.vx = Math.cos(ang) * spd;
          ball.vy = Math.sin(ang) * spd + Math.max(-45, Math.min(45, pVel * 0.16));
          tone(460 + rally * 18, 0.06, "square", 0.08);
          for (let i = 0; i < 6; i++) sparks.push({ x: 28, y: ball.y, vx: 20 + rnd() * 50, vy: (rnd() - 0.5) * 70, life: 0.25, col: "#ffd23f" });
        }
        // CPU paddle at x = 296
        if (ball.vx > 0 && ball.x >= 291 && ball.x <= 302 && Math.abs(ball.y - cy) <= ch / 2 + 4) {
          ball.x = 291; rally++;
          const spd = Math.min(205, Math.hypot(ball.vx, ball.vy) * 1.03);
          const hit = Math.max(-1, Math.min(1, (ball.y - cy) / (ch / 2)));
          const ang = hit * 0.7;
          ball.vx = -Math.cos(ang) * spd;
          ball.vy = Math.sin(ang) * spd;
          tone(380 + rally * 18, 0.06, "square", 0.08);
          for (let i = 0; i < 6; i++) sparks.push({ x: 292, y: ball.y, vx: -20 - rnd() * 50, vy: (rnd() - 0.5) * 70, life: 0.25, col: "#ff7a4a" });
        }
        // Scoring
        if (ball.x < 8) {
          cScore++; tone(190, 0.16, "sawtooth", 0.09);
          if (cScore >= 3) { banner = "PING-PONG GUY WINS!"; endT = 1.1; } else resetBall(1);
        } else if (ball.x > 312) {
          pScore++; tone(660, 0.14, "triangle", 0.11);
          for (let i = 0; i < 16; i++) sparks.push({ x: 300, y: ball.y, vx: -30 - rnd() * 80, vy: (rnd() - 0.5) * 110, life: 0.45, col: "#5aff9a" });
          if (pScore >= 3) { banner = `YOU BEAT LEVEL ${lvl}!`; endT = 1.1; } else resetBall(-1);
        }
      }
      // Kid-friendly CPU AI across Levels 1..3 (slow reaction & wander so it's fun to beat)
      const aiSpd = 46 + lvl * 18;
      const err = Math.sin(el * 2.3) * (4 - lvl) * 10;
      const reactX = 110 + (3 - lvl) * 20;
      const targetY = ball.vx > 0 && ball.x > reactX ? ball.y + err : 130 + Math.sin(el * 1.4) * 16;
      const dy = targetY - cy;
      cy += Math.sign(dy) * Math.min(Math.abs(dy), aiSpd * dt);
      cy = Math.max(36 + ch / 2, Math.min(224 - ch / 2, cy));
    }
    sparks.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
    sparks = sparks.filter((s) => s.life > 0);
    // Draw HUD & Table
    x.fillStyle = "#120e1c"; x.fillRect(0, 0, 320, 240);
    x.font = FONT; x.textBaseline = "top";
    x.fillStyle = "#ffd23f"; x.textAlign = "left"; x.fillText(`YOU ${pScore} - ${cScore} CPU  (FIRST TO 3)`, 12, 4);
    // Exit button
    x.fillStyle = "#5a2a48"; x.fillRect(274, 2, 38, 12);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.fillText("EXIT", 293, 4);
    // Level 1..3 buttons
    for (let i = 0; i < 3; i++) {
      const l = i + 1, bx = 12 + i * 92;
      x.fillStyle = l === lvl ? "#ffd23f" : S.flags["pongWon_" + l] ? "#2f7a4a" : "#2e2444";
      x.fillRect(bx, 16, 84, 13);
      x.fillStyle = l === lvl ? "#1a1228" : "#ffffff";
      x.fillText(`L${l} ${PONG_NAMES[l].toUpperCase()}`, bx + 42, 19);
    }
    // Ping-pong table
    x.fillStyle = "#1f6a3c"; x.fillRect(12, 34, 296, 192);
    x.strokeStyle = "#f4f4f4"; x.lineWidth = 2; x.strokeRect(13, 35, 294, 190);
    x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(14, 129, 292, 2);
    for (let y = 37; y < 224; y += 8) { x.fillStyle = "#f4f4f4"; x.fillRect(159, y, 2, 5); }
    // Paddles
    x.fillStyle = "#e8669a"; x.fillRect(21, Math.round(py - ph / 2), 6, ph);
    x.fillStyle = "#ffd23f"; x.fillRect(23, Math.round(py - ph / 2 + 2), 2, ph - 4);
    x.fillStyle = "#e8542c"; x.fillRect(293, Math.round(cy - ch / 2), 6, ch);
    x.fillStyle = "#fff4d0"; x.fillRect(295, Math.round(cy - ch / 2 + 2), 2, ch - 4);
    // Ball & sparks
    sparks.forEach((s) => { x.fillStyle = s.col; x.fillRect(s.x | 0, s.y | 0, 2, 2); });
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(ball.x, ball.y, 4.5, 0, Math.PI * 2); x.fill();
    if (serveT > 0 && endT < 0) {
      x.fillStyle = "#ffd23f"; x.textAlign = "center"; x.fillText(`LEVEL ${lvl}: ${PONG_NAMES[lvl].toUpperCase()} — READY!`, 160, 96);
    }
    if (banner) {
      x.fillStyle = "rgba(12,8,24,0.82)"; x.fillRect(44, 104, 232, 36);
      x.strokeStyle = "#ffd23f"; x.strokeRect(44, 104, 232, 36);
      x.fillStyle = "#ffd23f"; x.textAlign = "center"; x.fillText(banner, 160, 118);
    }
    x.fillStyle = "#b8b0d0"; x.textAlign = "center"; x.fillText("MOUSE / ARROWS TO MOVE · CLICK L1–L3", 160, 230);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

LV.pingpong = () => {
  const L = newLevel("pingpong", "Ping-pong Station");
  const RW = 12, RD = 8, R = [RW, RD];
  room(L, { w: RW, d: RD, h: 4.2, wall: T.rock, floor: T.stoneFloor, wallRep: 2, floorRep: 1.5, ceil: 0x2a2420, trim: 0x3a3028 });
  // the creepy ping-pong table
  const table = group(L, 0.8, 0, -1.9, 0, { name: "Ping-pong table",
    say: () => S.flags.ppKO ? pongInvite() : [["", "A creepy old ping-pong table, right in the middle of the mountain."]] });
  put(L, boxG(2.8, 0.08, 1.5), mat({ map: T.ppTable }), 0, 0.76, 0, 0, null, table);
  [[-1.3, -0.65], [1.3, -0.65], [-1.3, 0.65], [1.3, 0.65]].forEach(([a, b]) => put(L, boxG(0.08, 0.76, 0.08), mat({ color: 0x2a2a2e }), a, 0, b, 0, null, table));
  put(L, boxG(0.03, 0.18, 1.6), mat({ color: 0xf4f4f4 }), 0, 0.84, 0, 0, null, table);
  // rocks around the cave
  [[-5, -3, 0.9], [5.2, -2.8, 1.1], [-5.3, 2.5, 0.7], [5.4, 2.2, 0.8], [-3.5, -3.3, 0.6]].forEach(([rx, rz, r]) => {
    const m = put(L, new THREE.DodecahedronGeometry(r, 0), mat({ color: 0x6a5e52 }), rx, r * 0.4, rz); m.rotation.set(rnd() * 3, rnd() * 3, 0);
  });
  // the ping-pong bad guy
  const bad = addChar(L, "pingpong", 2.9, -2.4, 1.75, { name: "Ping-pong bad guy", stand: [1.0, -0.6],
    say: () => S.flags.ppKO ? (S.flags.ppFriendly ? pongInvite() : [["", "The ping-pong bad guy is knocked out. Zzz..."]]) : [["Ping-pong bad guy", "Nobody gets past MY ping-pong station!"], ["", "Click a kid to use their special move."]] });
  const zzz = put(L, planeG(0.7, 0.3), mat({ map: label(["Zzz"], 32, 14, "#2a2420", "#ffffff", "#2a2420"), em: 1 }), 3.3, 0.9, -2.2, -0.3);
  // 3D ping-pong paddle (held by bad guy, knocked away by fireball, lifted by May to bonk him)
  const paddle = new THREE.Group(); L.scene.add(paddle);
  const padHead = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10); padHead.rotateX(Math.PI / 2);
  put(L, padHead, mat({ color: 0xe04e39 }), 0, 0.22, 0, 0, null, paddle);
  put(L, boxG(0.06, 0.22, 0.04), mat({ color: 0xd8b078 }), 0, 0, 0, 0, null, paddle);
  const padGlow = put(L, new THREE.RingGeometry(0.24, 0.32, 10), mat({ color: 0xd88aff, em: 1, side: THREE.DoubleSide }), 0, 0.22, 0.03, 0, null, paddle);
  // effects
  const portalG = new THREE.CircleGeometry(1, 16); portalG.scale(0.6, 1.1, 1); portalG.translate(0, 1.2, 0);
  const portal = put(L, portalG, mat({ map: T.portal, em: 1, rep: [1.5, 1.5], scroll: [0.05, 0.08], side: THREE.DoubleSide }), -2.2, 0, 0.6, 0.3);
  const ball = put(L, new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0x3ff0ff, em: 1 }), 0, -5, 0);
  const team = crew(L, -2.6, 1.0);
  const kids = [team.may, team.jon, team.jasin, team.olivia];
  let fireT = -1, bonkT = -1, flyT = -1;
  PP.fx = {
    portal: (on) => { S.flags.ppHidden = on; },
    fireball: () => { fireT = 0; flyT = 0; },
    float: (on) => { S.flags.ppFloat = on; },
    bonk: () => { bonkT = 0; },
  };
  ["jon", "jasin", "olivia"].forEach((k) => {});
  team.may.body.userData.hot = { name: "May", say: () => S.flags.ppKO ? [["May", "We did it!"]] : fightMenu("may") };
  if (!L.hots.includes(team.may.body)) L.hots.push(team.may.body);
  L.walk = [-5, 5, -0.8, 3.2];
  L.start = [-2.6, 1.0];
  L.entries = { beach: [-4.2, 2.4], gas: [4.2, 2.4], roadmap: [-0.8, 2.2], mountainUp: [-4.2, 2.4], mountainDown: [4.2, 2.4] };
  const back = group(L, -5.6, 0, 2.6, 0, { name: "Path back down the mountain", exit: true, go: "mountainUp", stand: [-4.8, 2.6] });
  put(L, boxG(0.6, 2.4, 1.6), mat({ color: 0x1a1612 }), 0, 0, 0, 0, null, back);
  const fwd = group(L, 5.6, 0, 2.6, 0, { name: "Path down to the gas station", exit: true, stand: [4.8, 2.6],
    run: () => S.flags.ppKO ? goLevel("mountainDown", "pingpong") : say([["", "The ping-pong bad guy blocks the way!"]]) });
  put(L, boxG(0.6, 2.4, 1.6), mat({ color: 0x1a1612 }), 0, 0, 0, 0, null, fwd);
  group(L, 0, 0, 3.8, 0, { ...toJeep([0, 2.8]), show: () => !!S.flags.drove });
  L.onEnter = () => S.flags.ppKO ? pongInvite() : [["", "The crew runs to the mountain... and right into a creepy ping-pong station!"], ["Ping-pong bad guy", "Nobody gets past MY ping-pong station!"], ["", "He keeps trying to hit them with his ping-pong stick! Click a kid to use their special move."]];
  L.light = { amb: 0x5a5048, dir: [0.3, -1, -0.4], dirCol: 0x585048, pts: [[[1, 3.2, -1.5], 0x9aff9a, 7], [[-3, 2, 2], 0xffb070, 6], [[0, 0, 0], 0, 1]] };
  L.fog = [0x0e0c0a, 9, 24]; L.bg = 0x0e0c0a;
  cam(L, [-0.8, 3.6, 7.6], [0.4, 0.9, -1.0], 54);
  L.update = (t, dt) => {
    const f = S.flags;
    kids.forEach((c, i) => {
      c.root.visible = !f.ppHidden;
      c.yOff = f.ppFloat && c !== team.may ? 0.9 + Math.sin(t * 2 + i) * 0.12 : 0;   // May stays on the ground for her telekinesis
    });
    portal.visible = !!f.ppHidden;
    if (fireT >= 0) {
      fireT += dt * 1.6;
      const k = Math.min(1, fireT);
      ball.position.set(-1.6 + 4.4 * k, 0.6 + Math.sin(k * Math.PI) * 1.2, 0.8 - 3.0 * k);
      if (k >= 1) { fireT = -1; ball.position.y = -5; }
    }
    if (flyT >= 0) { flyT += dt * 1.4; if (flyT > 1) flyT = -1; }
    padGlow.visible = bonkT >= 0;
    const down = f.ppKO && !f.ppFriendly;
    if (bonkT >= 0) {
      bonkT += dt;
      const k = Math.min(1, bonkT / 0.6);
      paddle.position.set(1.2 + (2.9 - 1.2) * k, 0.2 + Math.sin(k * Math.PI) * 1.8, -0.6 + (-2.3 + 0.6) * k);
      paddle.rotation.set(-0.4, 0, -k * Math.PI * 1.5);
      if (bonkT > 0.6) bonkT = -1;
    } else if (flyT >= 0) {
      paddle.position.set(2.4 - 1.2 * flyT, 1.0 * (1 - flyT) + Math.sin(flyT * Math.PI) * 1.1 + 0.06, -2.2 + 1.6 * flyT);
      paddle.rotation.set(flyT * 4, flyT * 3, flyT * 6);
    } else if ((f.ppPhase || 0) >= 2 && !f.ppFriendly) {
      paddle.position.set(1.2, 0.06, -0.6);
      paddle.rotation.set(Math.PI / 2, 0.4, 0);
    } else {
      paddle.position.set(2.35, 0.95 + Math.sin(t * 5) * 0.08, -2.2);
      paddle.rotation.set(0, 0, Math.sin(t * 6) * 0.5 + 0.3);
    }
    bad.body.rotation.z = down ? Math.PI / 2 * 0.9 : 0;
    bad.yOff = down ? 0.3 : f.ppFriendly ? Math.abs(Math.sin(t * 3.5)) * 0.06 : 0;
    zzz.visible = !!down;
    zzz.position.y = 0.9 + Math.sin(t * 2) * 0.08;
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
  put(L, new THREE.CylinderGeometry(0.3, 0.26, 0.7, 8), mat({ color: 0x3a8ad8, em: 0.15, alpha: 0.75 }), 0, 0.35, 0, 0, null, washer);
  const washerStone = put(L, new THREE.DodecahedronGeometry(0.11, 0), mat({ color: 0xd8d0b8, em: 0.4 }), 0, 0.12, 0, 0, null, washer);
  addChaseSpot(L, "gas", 4.5, 4.2, -0.4, [3.2, 4.2]);
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
  L.entries = { pingpong: [-9, 6.5], mountainDown: [-9, 6.5], gasShop: [-3.7, -3.6] };
  const back = group(L, -11.5, 0, 6.5, 0, { name: "Road back to the mountain", exit: true, go: "mountainDown", stand: [-10.6, 6.5] });
  put(L, boxG(0.14, 1.6, 0.14), mat({ color: 0x6b4f35 }), 0, 0, 0, 0, null, back);
  put(L, planeG(1.2, 0.4), mat({ map: label(["< MOUNTAIN"], 80, 14, "#d9c39a", "#3b2a20", "#6b4f35") }), 0, 1.3, 0.08, 0, null, back);
  L.onEnter = [["", "Down the mountain road, there's a gas station. A very strange, empty place..."], ["", "Three old cars are parked here. One of them is a creepy jeep!"]];
  L.light = { amb: 0x5a5878, dir: [-0.3, -1, -0.4], dirCol: 0x484868, pts: [[[2, 3.2, -0.5], 0xfff0c0, 9], [[-1.5, 1.5, -4], 0xffe0a0, 6], [[8.5, 2, 1.5], 0x90ffb0, 5]] };
  L.fog = [0x1a1430, 12, 45]; L.bg = 0x1a1430;
  cam(L, [-2, 5, 12], [0.5, 0.5, -1.5], 52, (p) => p.x < 4.5, 200);
  cam(L, [11, 3.2, 8], [5, 0.6, -1], 54, null, 200);
  L.update = (t, dt) => {
    washerStone.visible = !S.flags.got_momStone;
    if (L.chaseUpd) L.chaseUpd(t, dt);
  };
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
  // three stone-shaped spots on the counter, and the three stones when placed
  const counterStones = [-0.45, 0, 0.45].map((sx) => {
    put(L, new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), mat({ color: 0x6a5a40 }), sx, 1.06, 0.1, 0, null, counter);
    return put(L, new THREE.DodecahedronGeometry(0.11, 0), mat({ color: 0xd8d0b8, em: 0.3 }), sx, 1.14, 0.1, 0, null, counter);
  });
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
  L.update = (t) => {
    counterStones.forEach((s) => (s.visible = !!S.flags.gotJeep));
    if (S.flags.gotJeep) owner.yOff = Math.abs(Math.sin(t * 3)) * 0.08;
  };
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
  const cupDoor = new THREE.Group(); cupDoor.position.set(-0.4, 0.08, 0.26); sink.add(cupDoor);
  put(L, boxG(0.8, 0.64, 0.04), mat({ color: 0x6b5a40 }), 0.4, 0, 0, 0, null, cupDoor);
  onWall(L, "back", R, T.mirror, 0.7, 0.8, -0.9, 1.3, { name: "Mirror", say: [["", "A dusty mirror."]] }, 0x8a8a90);
  L.player = addChar(L, "may", 0, 1.0, 1.3);
  L.walk = [-2.4, 2.4, -1.0, 1.8];
  L.start = [0, 1.0]; L.entries = { gasShop: [-1.8, 0.6] };
  L.update = (t, dt) => {
    tag.visible = !S.flags.got_marketKey;
    cupDoor.rotation.y += ((S.flags.got_wifeStone ? -1.2 : 0) - cupDoor.rotation.y) * Math.min(1, (dt || 0.016) * 8);
  };
  L.light = { amb: 0x6a7078, dir: [0.3, -1, -0.5], dirCol: 0x606870, pts: [[[0, 2.9, 0], 0xe8f0ff, 6], [[0, 0, 0], 0, 1], [[0, 0, 0], 0, 1]] };
  L.fog = [0x101418, 9, 22]; L.bg = 0x101418;
  cam(L, [0.6, 2.9, 5.2], [0, 1.0, -1.2], 54);
  return L;
};
