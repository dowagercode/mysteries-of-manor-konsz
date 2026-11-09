// flat.js: The flat 2D skin (in the style of the original 2D point-and-click game).
// Uses the same levels, hots, items, powers, dialogue, and save data as the 3D view.

const LOOK_KEY = "manor_konsz_look";
let flatMode = false;
try { flatMode = localStorage.getItem(LOOK_KEY) === "flat"; } catch {}

const FLAT_IMGS = {};
function getFlatImg(key) {
  if (!key || !IMAGES[key]) return null;
  if (!FLAT_IMGS[key]) {
    const im = new Image();
    im.src = IMAGES[key];
    FLAT_IMGS[key] = im;
  }
  return FLAT_IMGS[key];
}

function flatActive() {
  return !!(flatMode && L && FLAT[L.id]);
}

let flatC = null, flatCtx = null, flatNote = null;
function initFlat() {
  if (flatC) return;
  flatC = document.createElement("canvas");
  flatC.id = "flatC";
  flatC.width = 640;
  flatC.height = 480;
  flatC.hidden = true;
  flatC.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
  canvas.after(flatC);
  flatCtx = flatC.getContext("2d");

  flatNote = document.createElement("div");
  flatNote.id = "flatNote";
  flatNote.hidden = true;
  flatNote.textContent = "Flat look coming soon for this place (showing 3D)";
  flatNote.style.cssText = "position:absolute;right:calc(var(--u)*5);top:calc(var(--u)*5);padding:calc(var(--u)*2) calc(var(--u)*3.5);background:rgba(18,14,28,.82);color:#ffd23f;border:1px solid #b77cf0;border-radius:calc(var(--u)*2);font-size:calc(var(--u)*4.2);pointer-events:none;z-index:4;";
  $("tags").after(flatNote);

  const btn = $("flatBtn");
  if (btn) {
    btn.onclick = () => {
      setFlatMode(!flatMode);
    };
  }
  // Preload flat room images
  ["mays-room", "jasins-room", "olivias-room", "jons-room", "playroom", "kitchen", "living-room",
   "control-room", "armory", "bathroom", "storage-room", "engine-room", "hallway-doors", "spaceship-hideout"].forEach(getFlatImg);
  syncFlatUI();
}

function setFlatMode(on) {
  flatMode = !!on;
  try { localStorage.setItem(LOOK_KEY, flatMode ? "flat" : "3d"); } catch {}
  syncFlatUI();
}

function syncFlatUI() {
  const btn = $("flatBtn");
  if (btn) {
    btn.textContent = "Look: " + (flatMode ? "Flat" : "3D");
    btn.setAttribute("aria-pressed", flatMode ? "true" : "false");
  }
  const active = flatActive();
  if (flatC) flatC.hidden = !active;
  if (flatNote) flatNote.hidden = !(flatMode && L && !FLAT[L.id] && $("title").hidden);
  if (L && curCam && typeof placeTags === "function") placeTags();
}

// Hallway z-to-stripX anchors so every door's 3D stand z lines up with its flat door spot center
const HALL_Z_MAP = [
  [15.2, 0.055],
  [12.0, 0.145],
  [11.0, 0.240],
  [6.5, 0.345],
  [4.0, 0.450],
  [1.0, 0.550],
  [-1.5, 0.650],
  [-4.5, 0.750],
  [-7.0, 0.845],
  [-15.2, 0.935],
];
function hallZToStripX(z) {
  if (z >= HALL_Z_MAP[0][0]) return HALL_Z_MAP[0][1];
  if (z <= HALL_Z_MAP[HALL_Z_MAP.length - 1][0]) return HALL_Z_MAP[HALL_Z_MAP.length - 1][1];
  for (let i = 0; i < HALL_Z_MAP.length - 1; i++) {
    const [z0, x0] = HALL_Z_MAP[i], [z1, x1] = HALL_Z_MAP[i + 1];
    if (z <= z0 && z >= z1) return x0 + ((z0 - z) / (z0 - z1)) * (x1 - x0);
  }
  return 0.5;
}
function hallStripXToZ(sx) {
  if (sx <= HALL_Z_MAP[0][1]) return HALL_Z_MAP[0][0];
  if (sx >= HALL_Z_MAP[HALL_Z_MAP.length - 1][1]) return HALL_Z_MAP[HALL_Z_MAP.length - 1][0];
  for (let i = 0; i < HALL_Z_MAP.length - 1; i++) {
    const [z0, x0] = HALL_Z_MAP[i], [z1, x1] = HALL_Z_MAP[i + 1];
    if (sx >= x0 && sx <= x1) return z0 - ((sx - x0) / (x1 - x0)) * (z0 - z1);
  }
  return 0;
}

function hallScroll(lv) {
  const F = FLAT.hall, ww = F.worldW || 2.8;
  const pz = lv && lv.player ? lv.player.pos.y : 9;
  const sx = hallZToStripX(pz) * ww;
  return Math.max(0, Math.min(ww - 1, sx - 0.5));
}

// Map 3D walk position (wx, wz) -> flat normalized screen coordinates { x, y, scale, stripX }
function worldToFlat(lv, wx, wz) {
  const F = FLAT[lv.id];
  if (!F) return { x: 0.5, y: 0.8, scale: 1, stripX: 0.5 };
  const [x0, x1, yBack, yFront] = F.floor, w = lv.walk;
  if (lv.id === "hall") {
    const ww = F.worldW || 2.8;
    const stripX = hallZToStripX(wz);
    const tz = Math.max(0, Math.min(1, (wx - w[0]) / Math.max(0.01, w[1] - w[0])));
    const y = yBack + tz * (yFront - yBack);
    const x = stripX * ww - hallScroll(lv);
    return { x, y, scale: 0.86 + tz * 0.18, stripX };
  }
  const tx = Math.max(0, Math.min(1, (wx - w[0]) / Math.max(0.01, w[1] - w[0])));
  const tz = Math.max(0, Math.min(1, (wz - w[2]) / Math.max(0.01, w[3] - w[2])));
  return {
    x: x0 + tx * (x1 - x0),
    y: yBack + tz * (yFront - yBack),
    scale: 0.84 + tz * 0.22,
    stripX: x0 + tx * (x1 - x0),
  };
}

// Map flat normalized screen click (ux, uy) -> 3D walk Vector2(wx, wz)
function flatToWorld(lv, ux, uy) {
  const F = FLAT[lv.id];
  const [x0, x1, yBack, yFront] = F.floor, w = lv.walk;
  const tz = Math.max(0, Math.min(1, (uy - yBack) / Math.max(0.01, yFront - yBack)));
  if (lv.id === "hall") {
    const ww = F.worldW || 2.8;
    const stripX = (ux + hallScroll(lv)) / ww;
    const wz = hallStripXToZ(stripX);
    const wx = w[0] + tz * (w[1] - w[0]);
    return clampWalk(wx, wz);
  }
  const tx = Math.max(0, Math.min(1, (ux - x0) / Math.max(0.01, x1 - x0)));
  const wx = w[0] + tx * (w[1] - w[0]);
  const wz = w[2] + tz * (w[3] - w[2]);
  return clampWalk(wx, wz);
}

// Return raw spot [x, y, w, h] in room coordinates for a hot object o in lv.hots
function rawSpotForHot(lv, o) {
  const F = FLAT[lv.id];
  if (!F || !o || !o.userData || !o.userData.hot) return null;
  const name = o.userData.hot.name;
  const entry = F.spots[name];
  if (entry) {
    if (Array.isArray(entry[0])) {
      const same = lv.hots.filter((h) => h.userData.hot.name === name);
      const idx = Math.max(0, same.indexOf(o));
      return entry[idx] || entry[0];
    }
    return entry;
  }
  if (name === "The kids' drawing") return null;
  // Dynamic hot (e.g. Jon's portal opened anywhere via powers.js)
  const wp = o.getWorldPosition(new THREE.Vector3());
  const p = worldToFlat(lv, wp.x, wp.z);
  return [p.stripX - 0.055, p.y - 0.28, 0.11, 0.30];
}

// Return screen-space spot [x, y, w, h] (0..1 of #stage) for hot o
function screenSpotForHot(lv, o) {
  const F = FLAT[lv.id];
  if (!F) return null;
  // If o is a character with a live cutout position, combine/track its current screen position
  const ch = lv.chars && lv.chars.find((c) => c.body === o);
  if (ch && ch.target) {
    const p = worldToFlat(lv, ch.pos.x, ch.pos.y);
    const cw = 0.10 * p.scale, chH = 0.26 * p.scale;
    return [p.x - cw / 2, p.y - chH, cw, chH];
  }
  const raw = rawSpotForHot(lv, o);
  if (!raw) return null;
  if (lv.id === "hall") {
    const ww = F.worldW || 2.8, sc = hallScroll(lv);
    return [raw[0] * ww - sc, raw[1], raw[2] * ww, raw[3]];
  }
  return raw;
}

function eventToFlatUV(e) {
  const r = stage.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
  };
}

function overShipFlat(e) {
  const { x, y } = eventToFlatUV(e);
  return x >= 0.03 && x <= 0.94 && y >= 0.24 && y <= 0.88;
}

function pickFlat(e) {
  if (!L || !FLAT[L.id]) return null;
  const { x, y } = eventToFlatUV(e);
  let best = null, bestArea = Infinity;
  for (const o of L.hots) {
    if (L.player && o === L.player.body) continue;
    const h = o.userData.hot;
    if (h.show && !h.show()) continue;
    const sp = screenSpotForHot(L, o);
    if (!sp) continue;
    const [sx, sy, sw, sh] = sp;
    if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
      const area = sw * sh;
      if (area < bestArea) {
        best = o;
        bestArea = area;
      }
    }
  }
  return best;
}

// Place door name tags in flat mode (one semi-transparent tag per door)
function placeTagsFlat() {
  const hideAll = talking() || !$("title").hidden || spaceCut;
  TAGS.forEach((g) => {
    const h = g.o.userData.hot;
    const sp = screenSpotForHot(L, g.o);
    let show = !hideAll && !!sp && (!h.show || !!h.show());
    if (!show) { g.t.hidden = true; return; }
    let cx = sp[0] + sp[2] / 2;
    let cy = Math.max(0.08, sp[1] + 0.02);
    let arrow = "";
    if (L.id === "hall") {
      if (cx < -0.35 || cx > 1.35) { g.t.hidden = true; return; }
      if (cx < 0.07) { cx = 0.07; cy = 0.5; arrow = "left"; }
      else if (cx > 0.93) { cx = 0.93; cy = 0.5; arrow = "right"; }
    }
    g.t.hidden = false;
    if (g.arrow !== arrow) {
      g.arrow = arrow;
      const n = g.t.dataset.name;
      g.t.textContent = arrow === "left" ? "◀ " + n : arrow === "right" ? n + " ▶" : n;
      g.t.classList.toggle("edge", !!arrow);
    }
    g.t.style.left = (cx * 100) + "%";
    g.t.style.top = (cy * 100) + "%";
    g.dist = Math.abs(cx - 0.5);
  });
  const kept = [];
  TAGS.filter((g) => !g.t.hidden).sort((a, b) => a.dist - b.dist).forEach((g) => {
    const r = g.t.getBoundingClientRect();
    if (kept.some((k) => r.left < k.right && r.right > k.left && r.top < k.bottom && r.bottom > k.top)) g.t.hidden = true;
    else kept.push(r);
  });
}

// Helper to draw a small door cutout from hallway-doors.jpg for rooms whose scan doesn't include the door on the edge
function drawDoorCutout(ctx, W, H, cropKey, dstRect) {
  const hallIm = getFlatImg("hallway-doors");
  const crop = FLAT.hall.doorCrops[cropKey];
  if (!hallIm || !hallIm.complete || !crop) return;
  const [sx, sy, sw, sh] = crop;
  const [dx, dy, dw, dh] = dstRect;
  ctx.drawImage(hallIm, sx * hallIm.naturalWidth, sy * hallIm.naturalHeight, sw * hallIm.naturalWidth, sh * hallIm.naturalHeight,
                dx * W, dy * H, dw * W, dh * H);
}

// Draw flat cartoon props for takeable items (sugar, oil, flour, cacao, yeast, pills, flashlight, etc.)
function drawFlatProp(ctx, W, H, kind, sp, t) {
  const [x, y, w, h] = [sp[0] * W, sp[1] * H, sp[2] * W, sp[3] * H];
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#2a1f3d";
  ctx.lineJoin = "round";
  if (kind === "Sugar" || kind === "Flour" || kind === "Yeast") {
    ctx.fillStyle = kind === "Sugar" ? "#ffffff" : kind === "Flour" ? "#f5ebd6" : "#ebd49e";
    ctx.fillRect(x + w * 0.1, y + h * 0.15, w * 0.8, h * 0.8);
    ctx.strokeRect(x + w * 0.1, y + h * 0.15, w * 0.8, h * 0.8);
    ctx.fillStyle = kind === "Sugar" ? "#e8559a" : "#8a5a3a";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(kind.toUpperCase(), x + w * 0.5, y + h * 0.62);
  } else if (kind === "Oil") {
    ctx.fillStyle = "#f2c94c";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.18, y + h * 0.25, w * 0.64, h * 0.7, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#2f9a57";
    ctx.fillRect(x + w * 0.35, y + h * 0.08, w * 0.3, h * 0.18);
    ctx.strokeRect(x + w * 0.35, y + h * 0.08, w * 0.3, h * 0.18);
  } else if (kind === "Cacao") {
    ctx.fillStyle = "#6b3a20";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.12, y + h * 0.2, w * 0.76, h * 0.75, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.12);
    ctx.strokeRect(x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.12);
  } else if (kind === "Olivia's memory pills") {
    ctx.fillStyle = "#3a6ad8";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.2, y + h * 0.22, w * 0.6, h * 0.72, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + w * 0.18, y + h * 0.08, w * 0.64, h * 0.16);
    ctx.strokeRect(x + w * 0.18, y + h * 0.08, w * 0.64, h * 0.16);
  } else if (kind === "Locked box") {
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(x + w * 0.08, y + h * 0.25, w * 0.84, h * 0.7);
    ctx.strokeRect(x + w * 0.08, y + h * 0.25, w * 0.84, h * 0.7);
    if (!S.flags.gotKeycard) {
      ctx.fillStyle = "#ffd23f";
      ctx.fillRect(x + w * 0.42, y + h * 0.48, w * 0.16, h * 0.22);
      ctx.strokeRect(x + w * 0.42, y + h * 0.48, w * 0.16, h * 0.22);
    }
  } else if (kind === "Flashlight") {
    ctx.fillStyle = "#d8b030";
    ctx.fillRect(x + w * 0.15, y + h * 0.35, w * 0.65, h * 0.3);
    ctx.strokeRect(x + w * 0.15, y + h * 0.35, w * 0.65, h * 0.3);
    ctx.fillStyle = "#fff6a0";
    ctx.beginPath();
    ctx.arc(x + w * 0.82, y + h * 0.5, h * 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  } else if (kind === "Pile of papers") {
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(x + w * 0.5, y + h * 0.55 - i * 3);
      ctx.rotate((i - 1) * 0.12);
      ctx.fillStyle = i % 2 ? "#f8f4e8" : "#ffffff";
      ctx.fillRect(-w * 0.38, -h * 0.28, w * 0.76, h * 0.52);
      ctx.strokeRect(-w * 0.38, -h * 0.28, w * 0.76, h * 0.52);
      ctx.restore();
    }
    if (!S.flags.gotBoxKey) {
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(x + w * 0.78, y + h * 0.75, 5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  } else if (kind === "Kitchen drawers") {
    ctx.fillStyle = "#f4dce8";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#e8559a";
    ctx.strokeRect(x, y, w, h);
    for (let r = 0; r < 2; r++) {
      ctx.strokeRect(x + 4, y + 4 + r * (h * 0.46), w - 8, h * 0.4);
      ctx.fillStyle = "#e8559a";
      ctx.fillRect(x + w * 0.4, y + 10 + r * (h * 0.46), w * 0.2, 3);
    }
  }
  ctx.restore();
}

function renderFlat(t, dt) {
  if (!flatC || !flatCtx || !L || !FLAT[L.id]) return;
  const W = flatC.width, H = flatC.height, ctx = flatCtx;
  const F = FLAT[L.id];

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // 1. Space intro cutscene ("OUT" half of art/02-spaceship-and-hideout.png)
  if (L.id === "hall" && spaceCut) {
    const im = getFlatImg("spaceship-hideout");
    if (im && im.complete && im.naturalWidth) {
      const bobY = Math.sin(t * 1.6) * 6;
      ctx.drawImage(im, 0, 0, im.naturalWidth * 0.435, im.naturalHeight, 0, bobY, W, H);
    }
    ctx.restore();
    return;
  }

  // 2. Room background drawing
  if (L.id === "hall") {
    const ww = F.worldW || 2.8, sc = hallScroll(L);
    // Paper floor line across the scrolling strip
    ctx.strokeStyle = "#b8b4c4";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.71);
    ctx.lineTo(W, H * 0.71);
    ctx.stroke();
    // Draw each door cutout in the game's hallway order
    Object.entries(F.spots).forEach(([doorName, raw]) => {
      const sx = raw[0] * ww - sc, sw = raw[2] * ww;
      if (sx + sw < -0.05 || sx > 1.05) return;
      drawDoorCutout(ctx, W, H, doorName, [sx, raw[1], sw, raw[3]]);
    });
  } else if (L.id === "hub") {
    const imL = getFlatImg(F.imgLeft), imR = getFlatImg(F.imgRight);
    if (imL && imL.complete && imL.naturalWidth) ctx.drawImage(imL, 0, 0, W * 0.5, H * 0.92);
    if (imR && imR.complete && imR.naturalWidth) ctx.drawImage(imR, W * 0.5, 0, W * 0.5, H * 0.92);
    // If space flower was taken, cover the drawn flower on the windowsill with white
    if (S.flags.got_flower) {
      const sf = F.spots["Space flower"];
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sf[0] * W, sf[1] * H, sf[2] * W, sf[3] * H);
    }
    // Hallway door on left, kitchen drawers next to stove, and boat exit if available
    drawDoorCutout(ctx, W, H, "Door to the kitchen + rec room", F.spots["Door to the hallway"]);
    drawFlatProp(ctx, W, H, "Kitchen drawers", F.spots["Kitchen drawers"], t);
    if (S.flags.boatTaken) drawDoorCutout(ctx, W, H, "Door to the engine room", F.spots["Climb down to the boat"]);
    // Kitchen mouse hole & peeking mouse
    const ms = F.spots["Kitchen mouse"];
    const mx = (ms[0] + ms[2] * 0.5) * W, my = (ms[1] + ms[3] * 0.8) * H;
    ctx.fillStyle = "#2a1f3d";
    ctx.beginPath();
    ctx.arc(mx, my, 12, Math.PI, 0);
    ctx.fill();
    if (SPR.mouse && SPR.mouse.canvas) {
      const fed = !!S.flags.gotMap;
      const peek = fed ? 1 : Math.max(0, Math.sin(t * 0.7)) ** 3;
      if (peek > 0.02) {
        ctx.drawImage(SPR.mouse.canvas, mx - 6 + peek * 14, my - 20, 28, 18);
      }
      if (fed) {
        ctx.fillStyle = "#9ad85a";
        ctx.fillRect(mx + 22, my - 10, 9, 8);
      }
    }
  } else if (L.id === "hideout") {
    const im = getFlatImg(F.img);
    if (im && im.complete && im.naturalWidth) {
      const [cx, cy, cw, ch] = F.crop;
      ctx.drawImage(im, cx * im.naturalWidth, cy * im.naturalHeight, cw * im.naturalWidth, ch * im.naturalHeight, 0, 0, W, H);
      // Cover the static drawn May above the circle and static drawn Jon inside the circle so live cutouts don't duplicate
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(W * 0.14, H * 0.03, W * 0.78, H * 0.25);
      ctx.fillRect(W * 0.39, H * 0.33, W * 0.44, H * 0.38);
    }
    // Oval doorway showing the room the portal was opened from
    const outSp = F.spots["Climb out of the portal"];
    const ox = (outSp[0] + outSp[2] / 2) * W, oy = (outSp[1] + outSp[3] / 2) * H;
    const rx = (outSp[2] / 2) * W, ry = (outSp[3] / 2) * H;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    const fromId = S.flags.portalFrom || "jons";
    const fromFlat = FLAT[fromId] || FLAT.jons;
    const fromIm = getFlatImg(fromFlat.img || fromFlat.imgLeft || "jons-room");
    if (fromIm && fromIm.complete && fromIm.naturalWidth) {
      ctx.drawImage(fromIm, ox - rx * 1.4, oy - ry, rx * 2.8, ry * 2);
    } else {
      ctx.fillStyle = "#dceeff";
      ctx.fillRect(ox - rx, oy - ry, rx * 2, ry * 2);
    }
    ctx.restore();
    ctx.strokeStyle = "#a24fd6";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(ox, oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    drawFlatProp(ctx, W, H, "Pile of papers", F.spots["Pile of papers"], t);
  } else {
    const im = getFlatImg(F.img);
    if (im && im.complete && im.naturalWidth) {
      ctx.drawImage(im, 0, 0, W, H);
    }
    // Add hallway door cutout for scans that don't include the door on the edge
    if (L.id === "playroom") drawDoorCutout(ctx, W, H, "Door to the playroom", F.spots["Door to the hallway"]);
    else if (L.id === "bath") drawDoorCutout(ctx, W, H, "Door to the bathroom", F.spots["Door to the hallway"]);
    else if (L.id === "engine") drawDoorCutout(ctx, W, H, "Door to the engine room", F.spots["Door to the hallway"]);
    else if (L.id === "control") drawDoorCutout(ctx, W, H, "Door to the control room", F.spots["Door to the hallway"]);
  }

  // 3. Conditional room items & story changes
  if (L.id === "mays" && !S.flags.got_sugar) drawFlatProp(ctx, W, H, "Sugar", F.spots["Sugar"], t);
  if (L.id === "jasins" && !S.flags.got_oil) drawFlatProp(ctx, W, H, "Oil", F.spots["Oil"], t);
  if (L.id === "olivias" && !S.flags.got_flour) drawFlatProp(ctx, W, H, "Flour", F.spots["Flour"], t);
  if (L.id === "jons" && !S.flags.got_cacao) drawFlatProp(ctx, W, H, "Cacao", F.spots["Cacao"], t);
  if (L.id === "storage" && !S.flags.got_yeast) drawFlatProp(ctx, W, H, "Yeast", F.spots["Yeast"], t);
  if (L.id === "armory" && !S.flags.got_flashlight) drawFlatProp(ctx, W, H, "Flashlight", F.spots["Flashlight"], t);
  if (L.id === "control" && S.flags.armoryOpen) {
    const kr = F.spots["Keycard reader"];
    ctx.fillStyle = "#3fb84a";
    ctx.fillRect(kr[0] * W, kr[1] * H, kr[2] * W, kr[3] * H);
  }
  if (L.id === "engine") {
    if (S.flags.gotMap && !S.flags.gotPills) drawFlatProp(ctx, W, H, "Olivia's memory pills", F.spots["Olivia's memory pills"], t);
    drawFlatProp(ctx, W, H, "Locked box", F.spots["Locked box"], t);
    if (!S.flags.fixed) {
      // Animated blue water drips from the tank and pipes
      ctx.fillStyle = "#4a9ae8";
      for (let i = 0; i < 8; i++) {
        const dy = ((t * 1.6 + i * 0.37) % 1) * H * 0.24;
        const dx = (i < 5 ? 0.78 + i * 0.035 : 0.14 + (i - 5) * 0.05) * W;
        ctx.fillRect(dx, H * 0.54 + dy, 4, 8);
      }
    } else {
      // Cover the blue puddle under the tank when fixed
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(W * 0.73, H * 0.73, W * 0.26, H * 0.05);
    }
  }

  // 4. Floating or bonked spots (when May uses telekinesis or Jasin kicks his ball)
  const roomIm = getFlatImg(F.img);
  L.hots.forEach((o) => {
    const ch = L.chars && L.chars.find((c) => c.body === o);
    if (ch) return;
    const liftY = (o.userData.baseY != null ? o.position.y - o.userData.baseY : 0) + (o.floatT != null ? Math.sin(Math.min(1, o.floatT) * Math.PI) * 0.9 : 0);
    const shiftX = o.userData.baseX != null ? o.position.x - o.userData.baseX : 0;
    if (liftY > 0.02 || Math.abs(shiftX) > 0.005) {
      const sp = screenSpotForHot(L, o);
      if (!sp || !roomIm || !roomIm.complete) return;
      const [sx, sy, sw, sh] = sp;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx * W, sy * H, sw * W, sh * H);
      ctx.save();
      ctx.translate((sx + sw / 2 + shiftX * 0.1) * W, (sy + sh / 2 - liftY * 0.14) * H);
      ctx.rotate(o.rotation.z || 0);
      const crop = F.crop || [0, 0, 1, 1];
      const ix = (crop[0] + sx * crop[2]) * roomIm.naturalWidth;
      const iy = (crop[1] + sy * crop[3]) * roomIm.naturalHeight;
      const iw = sw * crop[2] * roomIm.naturalWidth;
      const ih = sh * crop[3] * roomIm.naturalHeight;
      ctx.drawImage(roomIm, ix, iy, iw, ih, (-sw * W) / 2, (-sh * H) / 2, sw * W, sh * H);
      ctx.restore();
    }
  });

  // 5. Dynamic Jon's portal (if opened via powers.js in a flat room)
  const dynPortal = L.hots.find((o) => o.userData.hot.name === "Jon's portal (go inside)");
  if (dynPortal) {
    const sp = screenSpotForHot(L, dynPortal);
    if (sp) {
      const px = (sp[0] + sp[2] / 2) * W, py = (sp[1] + sp[3] / 2) * H;
      ctx.fillStyle = "#6b2fb8";
      ctx.strokeStyle = "#b77cf0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(px, py, (sp[2] / 2) * W, (sp[3] / 2) * H, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  }

  // 6. Follow the Mouse crumbs
  if (L.clue && L.clue.crumbs) {
    L.clue.crumbs.forEach((m) => {
      if (!m.visible) return;
      const p = worldToFlat(L, m.position.x, m.position.z);
      ctx.fillStyle = "#d89a3c";
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (L.clue.mouse && L.clue.mouse.visible && SPR.mouse && SPR.mouse.canvas) {
      const mp = worldToFlat(L, L.clue.mouse.position.x, L.clue.mouse.position.z);
      ctx.drawImage(SPR.mouse.canvas, mp.x * W - 12, mp.y * H - 18, 26, 17);
    }
  }

  // 7. Character cutouts (with bouncy-slide walk and directional flip)
  const chars = L.chars.filter((c) => !c.show || c.show()).map((c) => {
    const p = worldToFlat(L, c.pos.x, c.pos.y);
    if (c.prevFlatX != null && Math.abs(p.x - c.prevFlatX) > 0.001) {
      c.flatFace = p.x > c.prevFlatX ? 1 : -1;
    }
    c.prevFlatX = p.x;
    return { c, p };
  }).sort((a, b) => a.p.y - b.p.y);

  chars.forEach(({ c, p }) => {
    const spr = SPR[c.key];
    if (!spr || !spr.canvas) return;
    const moving = !!c.target;
    const bounce = moving ? Math.abs(Math.sin(c.walkT * 11)) * 11 : 0;
    const hop = c.hopT > 0 ? Math.sin(Math.min(1, c.hopT / 0.3) * Math.PI) * 18 : 0;
    const floatPx = (c.yOff || 0) * 65;
    const sm = (c.scaleMul ?? 1) * p.scale;
    const cw = 76 * sm, ch = 112 * sm;
    const cx = p.x * W, cy = p.y * H - bounce - hop - floatPx;
    const face = c.flatFace || c.face || 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(face, 1);
    if (S.flags.glowing && (c.key === "jasin" || c.key === "olivia")) {
      ctx.shadowColor = "#3ff0ff";
      ctx.shadowBlur = 14;
    }
    ctx.drawImage(spr.canvas, -cw / 2, -ch, cw, ch);
    ctx.restore();
  });

  // 8. Item pickup star burst
  if (L.sparkles && L.sparkles.burstT >= 0 && L.player) {
    const k = L.sparkles.burstT;
    const pp = worldToFlat(L, L.player.pos.x, L.player.pos.y);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + k * 2.5;
      const sx = pp.x * W + Math.cos(ang) * k * 48;
      const sy = (pp.y - 0.14) * H + Math.sin(ang) * k * 36 - k * 20;
      ctx.fillStyle = "#ffd23f";
      ctx.strokeStyle = "#2a1f3d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 5 * (1 - k * 0.6), 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  }

  ctx.restore();
}
