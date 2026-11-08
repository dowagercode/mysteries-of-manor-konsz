// textures.js: Generated textures (makeTextures, makeTextures2), the kids' scans as textures (drawingTex), and sprites made from the sketchbook (svgSprite, pixelSprite).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- textures ----------
const T = {};
function makeTextures() {
  T.shipWall = C(32, 32, (x) => {
    x.fillStyle = "#9aa0c8"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#a7adcf", "#8f95bd"], 90);
    x.fillStyle = "#6c7299"; x.fillRect(0, 0, 32, 1); x.fillRect(0, 0, 1, 32); x.fillRect(0, 20, 32, 1);
    x.fillStyle = "#c4c8e4"; [[3, 3], [28, 3], [3, 24], [28, 24]].forEach(([a, b]) => x.fillRect(a, b, 1, 1));
  });
  T.shipFloor = C(32, 32, (x) => {
    x.fillStyle = "#4a4f6e"; x.fillRect(0, 0, 32, 32);
    x.fillStyle = "#3b3f5a"; for (let i = 0; i < 32; i += 4) x.fillRect(0, i, 32, 1);
    x.fillStyle = "#2c2f45"; x.fillRect(0, 0, 32, 1); x.fillRect(0, 0, 1, 32); noise(x, 32, 32, ["#5a6083"], 30);
  });
  T.tile = C(16, 16, (x) => {
    x.fillStyle = "#ece4cf"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#c9584f"; x.fillRect(0, 0, 8, 8); x.fillRect(8, 8, 8, 8);
    noise(x, 16, 16, ["#d8cfb8", "#b24c44"], 18);
  });
  T.rug = C(32, 32, (x) => {
    x.fillStyle = "#6b3f8f"; x.fillRect(0, 0, 32, 32); x.fillStyle = "#8b5cb5";
    for (let i = 0; i < 32; i += 8) { x.fillRect(i, 0, 2, 32); x.fillRect(0, i, 32, 2); }
    noise(x, 32, 32, ["#5a3478", "#9a6ac4"], 60);
  });
  T.mayWall = C(32, 32, (x) => {
    x.fillStyle = "#f9dbe7"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#f4cfdd"], 50);
    bits(x, HEART, 4, 5, { "#": "#f29bb0" }); bits(x, HEART, 20, 21, { "#": "#e98ab6" });
  });
  T.mayCarpet = C(16, 16, (x) => { x.fillStyle = "#c9a6e8"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#b993dc", "#d6b8f0"], 70); });
  T.jasWall = C(32, 32, (x) => {
    x.fillStyle = "#f0f4e8"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#e4ead9"], 60);
    x.fillStyle = "#e3ecd3"; x.fillRect(0, 0, 4, 32); x.fillRect(16, 0, 4, 32);
  });
  T.pitch = C(32, 32, (x) => {
    x.fillStyle = "#3fae6a"; x.fillRect(0, 0, 32, 32); x.fillStyle = "#36985c"; x.fillRect(0, 0, 16, 32);
    noise(x, 32, 32, ["#4dbe78", "#2f8a52"], 90);
  });
  T.jonWall = C(32, 32, (x) => {
    x.fillStyle = "#7d8fb3"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#8999bc", "#71829f"], 80);
    x.fillStyle = "#5c6b8c"; x.fillRect(0, 0, 32, 1); x.fillRect(15, 0, 1, 32);
  });
  T.stars = C(32, 32, (x) => {
    x.fillStyle = "#070616"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#ffffff", "#ffd23f", "#9ab8ff", "#5c5a8a"], 26);
  });
  T.sand = C(32, 32, (x) => { x.fillStyle = "#e3c98e"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#d4b878", "#f0dba8", "#c9a96a"], 160); });
  T.water = C(32, 32, (x) => {
    x.fillStyle = "#2b6aa3"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#3a7db8", "#24598c"], 120);
    x.fillStyle = "#7fb6e0"; [[2, 5], [18, 12], [8, 22], [24, 27]].forEach(([a, b]) => x.fillRect(a, b, 5, 1));
  });
  T.sky = C(4, 64, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "#1e2563"); g.addColorStop(0.45, "#6a5fb8"); g.addColorStop(0.5, "#e7a9c0"); g.addColorStop(1, "#e7a9c0");
    x.fillStyle = g; x.fillRect(0, 0, 4, 64);
  }, false);
  T.drawers = C(32, 16, (x) => {
    x.fillStyle = "#d9c7a6"; x.fillRect(0, 0, 32, 16); x.fillStyle = "#a8916b";
    x.fillRect(0, 0, 32, 1); x.fillRect(0, 7, 32, 1); x.fillRect(0, 15, 32, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    x.fillStyle = "#6b5a40"; x.fillRect(6, 3, 4, 1); x.fillRect(21, 3, 4, 1); x.fillRect(6, 11, 4, 1); x.fillRect(21, 11, 4, 1);
  }, false);
  T.fridge = C(16, 32, (x) => {
    x.fillStyle = "#eef0f4"; x.fillRect(0, 0, 16, 32); noise(x, 16, 32, ["#dfe2ea"], 30);
    x.fillStyle = "#a9adbb"; x.fillRect(0, 11, 16, 1); x.fillRect(13, 4, 1, 5); x.fillRect(13, 14, 1, 9);
  }, false);
  T.stove = C(16, 16, (x) => {
    x.fillStyle = "#3a3a44"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#1c1c22";
    [[2, 2], [9, 2], [2, 9], [9, 9]].forEach(([a, b]) => x.fillRect(a, b, 5, 5));
    x.fillStyle = "#e04e39"; x.fillRect(11, 4, 1, 1);
  }, false);
  T.couch = C(16, 16, (x) => { x.fillStyle = "#4a6fb0"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#5a80c0", "#3d5e98"], 60); });
  T.shadow = C(16, 16, (x) => {
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const dx = (i - 7.5) / 8, dy = (j - 7.5) / 8;
      if (dx * dx + dy * dy < 1) { x.fillStyle = "#000"; x.fillRect(i, j, 1, 1); }
    }
  }, false);
  T.portal = C(32, 32, (x) => {
    x.fillStyle = "#3d1a6e"; x.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 260; i++) { const a = i * 0.37, r = (i % 40) * 0.42; x.fillStyle = i % 3 ? "#8b4fd1" : "#d7b4ff";
      x.fillRect(16 + Math.cos(a) * r | 0, 16 + Math.sin(a) * r | 0, 1, 1); }
  });
  T.shipDoor = C(32, 48, (x) => {
    x.fillStyle = "#5c6288"; x.fillRect(0, 0, 32, 48); x.fillStyle = "#b8bddc"; x.fillRect(2, 2, 28, 46);
    x.fillStyle = "#8d93b5"; x.fillRect(15, 2, 2, 46); noise(x, 32, 48, ["#a9aed0"], 40);
    x.fillStyle = "#3fd07a"; x.fillRect(26, 22, 2, 2);
  }, false);
  T.mayDoor = C(32, 56, (x, w, h) => {
    arch(x, w, h, "#ead8fb", "#b77cf0");
    bits(x, BIGHEART, 9, 20, { "#": "#a24fd6" });
    x.fillStyle = "#a24fd6"; x.fillRect(5, 38, 2, 3);
  }, false);
  T.jasDoor = C(32, 56, (x, w, h) => {
    arch(x, w, h, "#f6f8f0", "#3fae6a");
    x.fillStyle = "#3fae6a"; x.beginPath(); x.arc(17, 22, 8, 0, 7); x.fill();
    x.fillStyle = "#fff"; x.beginPath(); x.arc(17, 22, 7, 0, 7); x.fill();
    x.fillStyle = "#111"; [[14, 18], [19, 17], [12, 23], [20, 24], [16, 27], [17, 21]].forEach(([a, b]) => x.fillRect(a, b, 2, 2));
    bits(x, HEART, 2, 40, { "#": "#3fae6a" });
    const d = x.getImageData(0, 0, w, h); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 100 ? 255 : 0; x.putImageData(d, 0, 0);
  }, false);
  T.dreamFront = C(32, 24, (x) => {
    x.fillStyle = "#f07ab0"; x.fillRect(0, 0, 32, 24); x.fillStyle = "#ffd0e4"; x.fillRect(13, 10, 6, 14);
    x.fillStyle = "#ffffff"; x.fillRect(4, 10, 6, 6); x.fillRect(22, 10, 6, 6);
    x.fillStyle = "#c2307a"; x.fillRect(6, 12, 2, 3); x.fillRect(24, 12, 2, 3); x.fillRect(17, 16, 1, 1);
  }, false);
  T.dreamSign = label(["BARBIE", "DREAM", "HOUSE"], 64, 40, "#ffffff", "#e0337f", "#f07ab0");
  T.maySign = label(["MAY'S", "ROOM"], 64, 32, "#fff6fa", "#d8234d", "#c41e47", (x) => bits(x, HEART, 50, 19, { "#": "#d8234d" }));
  T.iLove = label(["I LOVE"], 64, 48, "#ffffff", "#e0337f", "#f29bb0", (x) => {
    bits(x, HEART, 25, 26, { "#": "#e0337f" }, 2);
    x.fillStyle = "#e0337f"; [[2, 2], [58, 2], [2, 42], [58, 42]].forEach(([a, b]) => x.fillRect(a, b, 4, 4));
  });
  T.blanket = C(32, 16, (x) => {
    x.fillStyle = "#e0336a"; x.fillRect(0, 0, 32, 16); noise(x, 32, 16, ["#c42a5c", "#ef5585"], 50);
    x.fillStyle = "#a24fd6"; [[14, 6], [18, 6], [16, 4], [16, 8], [15, 5], [17, 7], [15, 7], [17, 5]].forEach(([a, b]) => x.fillRect(a, b, 2, 2));
    x.fillStyle = "#e85fae"; x.fillRect(16, 6, 2, 2);
  });
  T.jasSign = label(["JASIN'S", "ROOM"], 72, 36, "#f6fff2", "#2f9a57", "#3fae6a", (x) => {
    x.fillStyle = "#2f9a57"; [[0, 0], [66, 0], [0, 30], [66, 30]].forEach(([a, b]) => x.fillRect(a, b, 6, 6));
  });
  T.soccerPic = C(32, 32, (x) => {
    x.fillStyle = "#c9b8a6"; x.fillRect(0, 0, 32, 32); x.fillStyle = "#f4ede4"; x.fillRect(2, 2, 28, 28);
    bits(x, BALL, 8, 8, { "#": "#3b3030", ".": "#ffffff" }, 2);
  }, false);
  T.jasBed = C(32, 8, (x) => {
    x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, 32, 8); x.fillStyle = "#111"; for (let i = 0; i < 32; i += 6) x.fillRect(i, 0, 3, 8);
  });
  T.ipad = C(16, 12, (x) => {
    x.fillStyle = "#1a1a24"; x.fillRect(0, 0, 16, 12); x.fillStyle = "#3a8ee8"; x.fillRect(2, 2, 12, 8);
    x.fillStyle = "#e04e39"; x.fillRect(3, 3, 6, 2); x.fillStyle = "#ffffff"; x.fillRect(3, 6, 9, 1); x.fillRect(3, 8, 7, 1);
  }, false);
  T.gasSign = label(["GAS", "STATION >"], 80, 32, "#d9c39a", "#3b2a20", "#6b4f35");
  T.foreSign = label(["FORE >"], 56, 16, "#2a2f48", "#ffd23f", "#141726");
  T.shipBody = C(64, 32, (x) => {
    x.fillStyle = "#f4e9ff"; x.fillRect(0, 0, 64, 32); noise(x, 64, 32, ["#e6d8f6"], 80);
    x.fillStyle = "#a24fd6"; x.fillRect(28, 0, 2, 32); x.fillRect(34, 0, 2, 32);
    x.fillStyle = "#2a1f3d"; x.fillRect(8, 3, 1, 26);
    x.fillStyle = "#2a1f3d"; x.fillRect(21, 7, 6, 6); x.fillStyle = "#5a2a8a"; x.fillRect(22, 8, 4, 4); x.fillStyle = "#fff"; x.fillRect(22, 8, 1, 1);
    x.fillStyle = "#2a1f3d";
    [[11, 14], [12, 15], [13, 16], [14, 16], [15, 17], [16, 17], [17, 17], [18, 17], [19, 16], [20, 16], [21, 15], [22, 14]].forEach(([a, b]) => x.fillRect(a, b, 1, 2));
  }, false);
  T.holeWall = C(32, 64, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, "#e3c6ff"); g.addColorStop(1, "#6d3cb0");
    x.fillStyle = g; x.fillRect(0, 0, 32, 64); noise(x, 32, 40, ["#ffffff", "#fff6d8"], 10);
  });
  T.holeFloor = C(16, 16, (x) => { x.fillStyle = "#5a2a8a"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#6a389c", "#4c2276"], 60); });
  T.tallBox = C(16, 32, (x) => {
    x.fillStyle = "#f3e3c3"; x.fillRect(0, 0, 16, 32); x.fillStyle = "#2a1f3d"; x.fillRect(0, 8, 16, 1); x.fillRect(13, 4, 2, 2);
    x.fillStyle = "#e8669a"; [[7, 14], [9, 16], [8, 19], [5, 19], [4, 16]].forEach(([a, b]) => x.fillRect(a - 1, b - 1, 3, 3));
    x.fillStyle = "#ffd23f"; x.fillRect(6, 16, 2, 2);
  }, false);
  T.egg = C(32, 16, (x) => {
    x.fillStyle = "#fff6e6"; x.fillRect(0, 0, 32, 16); noise(x, 32, 16, ["#f0e6d0"], 20);
    bits(x, ["####", "#..#", "...#", "..#.", ".#..", "....", ".#.."], 14, 4, { "#": "#a24fd6" });
  }, false);
  T.livWall = C(32, 32, (x) => {
    x.fillStyle = "#f0e4fb"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#e8d8f6", "#f8f0ff"], 60);
    x.fillStyle = "#e6d4f6"; x.fillRect(0, 0, 2, 32); x.fillRect(16, 0, 2, 32);
  });
  T.wood = C(32, 32, (x) => {
    x.fillStyle = "#d9b48a"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#cfa77a", "#e2c098"], 120);
    x.fillStyle = "#b8916a"; for (let i = 0; i < 32; i += 8) x.fillRect(0, i, 32, 1); x.fillRect(12, 0, 1, 8); x.fillRect(26, 8, 1, 8); x.fillRect(6, 16, 1, 8); x.fillRect(20, 24, 1, 8);
  });
  T.pillow = (pal) => C(16, 8, (x) => { x.fillStyle = "#ffffff"; x.fillRect(0, 0, 16, 8); bits(x, pal.rows, pal.x, 1, pal.c); }, false);
}

// The kids' scans, crunched down to PS1-sized pictures.
async function drawingTex(src, w = 220, keyWhite = false) {
  const img = new Image(); img.src = src; await img.decode();
  const h = Math.round(w * img.height / img.width);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
  if (keyWhite) {
    const d = x.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) if (d.data[i] > 200 && d.data[i + 1] > 200 && d.data[i + 2] > 200) d.data[i + 3] = 0;
    x.putImageData(d, 0, 0);
  }
  const t = texOf(c, false); t.minFilter = t.magFilter = THREE.LinearFilter;
  return t;
}

// ---------- sprites: sketchbook drawings shrunk to pixel art ----------
const SPR = {};
const vbOf = (id) => DEFS.match(new RegExp(`<symbol id="${id}" viewBox="([^"]+)"`))[1];
async function svgSprite(name, ids, vbId, scale = 0.17) {
  const vb = vbOf(vbId), [, , vw, vh] = vb.split(/\s+/).map(Number);
  const pw = Math.round(vw * scale), ph = Math.round(vh * scale);
  const uses = ids.map((id) => `<use href="#${id}" xlink:href="#${id}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}" width="${pw}" height="${ph}">${DEFS}${uses}</svg>`;
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await img.decode();
  const c = document.createElement("canvas"); c.width = pw + 2; c.height = ph + 2;
  const x = c.getContext("2d"); x.drawImage(img, 1, 1, pw, ph);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data, cw = c.width, n = cw * c.height;
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (a[o + 3] > 110) {
      solid[i] = 1; a[o + 3] = 255;
      for (let k = 0; k < 3; k++) a[o + k] = Math.round(a[o + k] / 255 * 31) / 31 * 255; // 15-bit color
    } else a[o + 3] = 0;
  }
  for (let i = 0; i < n; i++) {
    if (solid[i]) continue;
    const px = i % cw;
    if ((px > 0 && solid[i - 1]) || (px < cw - 1 && solid[i + 1]) || solid[i - cw] || solid[i + cw]) {
      const o = i * 4; a[o] = 0x2a; a[o + 1] = 0x1f; a[o + 2] = 0x3d; a[o + 3] = 255;
    }
  }
  x.putImageData(d, 0, 0);
  SPR[name] = { tex: texOf(c, false), w: c.width, h: c.height, canvas: c };
}
function pixelSprite(name, rows, pal) {
  const w = Math.max(...rows.map((r) => r.length));
  const t = C(w, rows.length, (x) => bits(x, rows.map((r) => r.padEnd(w, ".")), 0, 0, pal), false);
  SPR[name] = { tex: t, w, h: rows.length, canvas: t.userData.canvas };
}

function makeTextures2() {
  T.hallFloor = C(32, 32, (x) => { x.fillStyle = "#9a9aa4"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#8a8a94", "#aaaab4", "#7a7a84"], 160); });
  T.engineDoor = C(32, 48, (x) => {
    x.fillStyle = "#5c4a3a"; x.fillRect(0, 0, 32, 48); x.fillStyle = "#8a7a60"; x.fillRect(2, 2, 28, 46);
    x.fillStyle = "#e0b030"; for (let i = 0; i < 32; i += 8) x.fillRect(i, 40, 4, 6);
    x.fillStyle = "#2a2a30"; for (let i = 4; i < 32; i += 8) x.fillRect(i, 40, 4, 6);
    x.fillStyle = "#5c4a3a"; x.fillRect(15, 2, 2, 38);
  }, false);
  T.greenChecker = C(16, 16, (x) => {
    x.fillStyle = "#e8e8e0"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#3a9a4a"; x.fillRect(0, 0, 8, 8);
    x.fillStyle = "#2a2a2e"; x.fillRect(8, 8, 8, 8); noise(x, 16, 16, ["#2f8a3f", "#d0d0c8"], 20);
  });
  T.blueCarpet = C(16, 16, (x) => { x.fillStyle = "#8ab8e8"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#7aa8d8", "#9ac8f4"], 70); });
  T.greenFridge = C(16, 32, (x) => {
    x.fillStyle = "#3fae4a"; x.fillRect(0, 0, 16, 32); noise(x, 16, 32, ["#36984a", "#4cbe58"], 60);
    x.fillStyle = "#2a1f3d"; x.fillRect(12, 6, 2, 3); x.fillRect(12, 15, 2, 3); x.fillStyle = "#2a7a34"; x.fillRect(0, 11, 16, 1);
  }, false);
  T.oven = C(24, 20, (x) => {
    x.fillStyle = "#f07ab0"; x.fillRect(0, 0, 24, 20); x.fillStyle = "#c2307a"; x.fillRect(3, 6, 18, 12);
    x.fillStyle = "#ffd0e4"; x.fillRect(5, 8, 14, 8); x.fillStyle = "#c2307a"; x.fillRect(9, 11, 6, 2);
    x.fillStyle = "#ffffff"; [4, 9, 14, 19].forEach((a) => x.fillRect(a, 2, 2, 2));
  }, false);
  T.blueFabric = C(16, 16, (x) => { x.fillStyle = "#4a8ad8"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#3a7ac8", "#6aa0e8"], 70); });
  T.faceBox = C(32, 16, (x) => {
    x.fillStyle = "#eaf2ff"; x.fillRect(0, 0, 32, 16); x.fillStyle = "#3a86c8";
    [[8, 4], [22, 4]].forEach(([a, b]) => { x.fillRect(a, b, 4, 6); x.fillStyle = "#ffffff"; x.fillRect(a + 1, b + 1, 1, 1); x.fillRect(a + 2, b + 1, 1, 1); x.fillStyle = "#3a86c8"; });
  }, false);
  T.jonWall2 = C(32, 32, (x) => { x.fillStyle = "#dceaf8"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#cfe0f2", "#e8f2fc"], 60); x.fillStyle = "#cddcee"; x.fillRect(0, 0, 32, 1); });
  T.jonFloor = C(16, 16, (x) => { x.fillStyle = "#7a9ac0"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#6a8ab0", "#8aaad0"], 60); });
  T.robotFace = C(16, 16, (x) => {
    x.fillStyle = "#6aa8e8"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#1c2a44"; x.fillRect(3, 4, 4, 4); x.fillRect(9, 4, 4, 4);
    x.fillStyle = "#ffffff"; x.fillRect(4, 5, 1, 1); x.fillRect(10, 5, 1, 1); x.fillStyle = "#1c2a44"; x.fillRect(4, 11, 8, 1);
  }, false);
  T.playWall = C(32, 32, (x) => { x.fillStyle = "#fbf8ec"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#f2eedc"], 60); });
  T.playCarpet = C(32, 32, (x) => {
    x.fillStyle = "#a8d8f4"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#8ac8ee", "#c4e6fa", "#6ab8e8"], 220);
  });
  T.space = C(96, 40, (x, w, h) => {
    x.fillStyle = "#8a8e9a"; x.beginPath(); x.roundRect(0, 0, w, h, 14); x.fill();
    x.fillStyle = "#06061a"; x.beginPath(); x.roundRect(2, 2, w - 4, h - 4, 12); x.fill();
    noise(x, w, h, ["#ffffff", "#9ab8ff", "#ffd23f"], 60);
    x.fillStyle = "#f0952a"; x.beginPath(); x.arc(20, 13, 6, 0, 7); x.fill();
    x.fillStyle = "#f6c040"; for (let i = 0; i < 10; i++) { const a = i * 0.63; x.fillRect(20 + Math.cos(a) * 9 | 0, 13 + Math.sin(a) * 9 | 0, 1, 1); }
    x.fillStyle = "#8a4a22"; x.beginPath(); x.arc(70, 17, 10, 0, 7); x.fill();
    x.fillStyle = "#f2c890"; [12, 16, 21].forEach((yy) => x.fillRect(60, yy, 20, 2));
    x.fillStyle = "#2a2a30"; x.fillRect(36, 26, 8, 5); x.fillStyle = "#c8a888"; x.fillRect(44, 24, 3, 9); x.fillStyle = "#3a6ad8"; x.fillRect(48, 27, 2, 2);
    const d = x.getImageData(0, 0, w, h); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 100 ? 255 : 0; x.putImageData(d, 0, 0);
  }, false);
  T.buttons = C(64, 12, (x) => {
    x.fillStyle = "#1a1a20"; x.fillRect(0, 0, 64, 12); x.fillStyle = "#3a3a44"; x.fillRect(8, 1, 40, 3);
    const cols = ["#e04e39", "#3fae6a", "#f0952a", "#3a86c8", "#e8559a", "#ffd23f"];
    for (let i = 0; i < 15; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect(3 + i * 4, 6 + (i % 2), 3, 3); }
  }, false);
  T.greyPanel = C(16, 16, (x) => { x.fillStyle = "#b8bcc8"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#2a2a30"; x.fillRect(9, 7, 3, 3); });
  T.armoryDoor = label(["ARMORY", "", "DO NOT", "ENTER", "UNLESS", "YOU", "HAVE", "KEYCARD"], 56, 96, "#f4f4f6", "#8a5a3a", "#7a7e8a");
  T.cardReader = C(8, 12, (x) => { x.fillStyle = "#c82020"; x.fillRect(0, 0, 8, 12); x.fillStyle = "#1a1a20"; x.fillRect(2, 2, 4, 1); x.fillStyle = "#3fd07a"; x.fillRect(3, 8, 2, 2); }, false);
  T.crate = C(16, 16, (x) => {
    x.fillStyle = "#b08850"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#8a6838"; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    for (let i = 1; i < 15; i++) { x.fillRect(i, i, 1, 1); x.fillRect(15 - i, i, 1, 1); }
  }, false);
  T.bathTile = C(16, 16, (x) => { x.fillStyle = "#e4f0f6"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#b8d0dc"; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(8, 0, 1, 16); x.fillRect(0, 8, 16, 1); });
  T.rock = C(32, 32, (x) => { x.fillStyle = "#5a4e44"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#6a5e52", "#4a4038", "#7a6e60"], 220); });
  T.stoneFloor = C(32, 32, (x) => { x.fillStyle = "#4a443e"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#5a524a", "#3a3430"], 200); x.fillStyle = "#2e2a26"; x.fillRect(0, 15, 32, 1); x.fillRect(15, 0, 1, 15); x.fillRect(7, 16, 1, 16); });
  T.ppTable = C(32, 16, (x) => { x.fillStyle = "#2f7a4a"; x.fillRect(0, 0, 32, 16); x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, 32, 1); x.fillRect(0, 15, 32, 1); x.fillRect(0, 0, 1, 16); x.fillRect(31, 0, 1, 16); x.fillRect(0, 7, 32, 1); }, false);
  T.nightSky = C(4, 64, (x) => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, "#0a0820"); g.addColorStop(0.48, "#3a2a5a"); g.addColorStop(0.5, "#5a3a5a"); g.addColorStop(1, "#5a3a5a"); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, false);
  T.asphalt = C(32, 32, (x) => { x.fillStyle = "#3a3a40"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#4a4a50", "#2e2e34", "#55555a"], 260); });
  T.spokes = C(16, 16, (x) => { x.fillStyle = "#1a1a1e"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#b8b8b0"; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; for (let r = 1; r < 7; r++) x.fillRect(8 + Math.cos(a) * r | 0, 8 + Math.sin(a) * r | 0, 1, 1); } }, false);
  T.oldWall = C(32, 32, (x) => { x.fillStyle = "#c8bc98"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#b8ac88", "#d4c8a4", "#a89c78"], 140); });
  T.oldTile = C(16, 16, (x) => { x.fillStyle = "#d8d0b8"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#a8a088"; x.fillRect(0, 0, 8, 8); x.fillRect(8, 8, 8, 8); noise(x, 16, 16, ["#8a8270", "#e8e0c8"], 30); });
  T.oldSnacks = C(16, 24, (x) => { x.fillStyle = "#6a5a40"; x.fillRect(0, 0, 16, 24); const c = ["#a85a3a", "#c8a040", "#6a8a5a", "#8a6a9a"]; for (let r = 0; r < 4; r++) { x.fillStyle = "#4a3a28"; x.fillRect(0, r * 6 + 5, 16, 1); for (let i = 0; i < 4; i++) { x.fillStyle = c[(r + i) % 4]; x.fillRect(1 + i * 4, r * 6 + 1, 3, 4); } } }, false);
  T.magRack = C(16, 24, (x) => { x.fillStyle = "#5a4a3a"; x.fillRect(0, 0, 16, 24); const c = ["#e04e39", "#3a86c8", "#ffd23f", "#3fae6a", "#e8559a", "#a8a8a8"]; for (let i = 0; i < 6; i++) { x.fillStyle = c[i]; x.fillRect(1 + (i % 2) * 7, 1 + (i >> 1) * 8, 6, 7); } }, false);
  T.worldMap = C(128, 88, (x, w, h) => {
    x.fillStyle = "#5aa84a"; x.fillRect(0, 0, w, h); noise(x, w, h, ["#4a9a3a", "#6ab85a"], 500);
    x.fillStyle = "#3a7ac8"; x.beginPath(); x.ellipse(0, 70, 30, 30, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(118, 80, 22, 18, 0, 0, 7); x.fill();
    x.fillStyle = "#8a7a6a"; [[110, 14], [100, 22], [120, 26]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a - 9, b + 8); x.lineTo(a, b - 8); x.lineTo(a + 9, b + 8); x.fill(); });
    x.fillStyle = "#e8d8a8";
    const P = (vx, vz) => [(vx + 13) / 26 * w, (vz + 9) / 18 * h];
    const path = [[-8, 3.5], [-3, 2.5], [1, -0.5], [5, 2], [8.5, -3.5]], br = [[-8, 3.5], [-6.5, -2.5]];
    [path, br].forEach((pts) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = P(...pts[i]), [c, d] = P(...pts[i + 1]); for (let k = 0; k <= 1; k += 0.08) x.fillRect(a + (c - a) * k - 1, b + (d - b) * k - 1, 3, 3); } });
  });
  T.ramen = C(16, 8, (x) => { x.fillStyle = "#e04e39"; x.fillRect(0, 0, 16, 8); x.fillStyle = "#ffd23f"; x.fillRect(2, 2, 12, 4); x.fillStyle = "#e04e39"; x.fillRect(5, 3, 6, 2); }, false);
  T.forestFloor = C(32, 32, (x) => { x.fillStyle = "#2a3a22"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#3a4a2a", "#22301c", "#4a3a22"], 240); });
  T.eyes = C(16, 4, (x) => { x.fillStyle = "#ffe14a"; x.fillRect(1, 0, 4, 4); x.fillRect(11, 0, 4, 4); x.fillStyle = "#2a1f3d"; x.fillRect(3, 1, 1, 2); x.fillRect(13, 1, 1, 2); }, false);
  T.woodyFace = C(24, 20, (x) => { x.fillStyle = "#5a3a22"; x.fillRect(0, 0, 24, 20); x.fillStyle = "#ffe14a"; x.fillRect(4, 4, 5, 5); x.fillRect(15, 4, 5, 5); x.fillStyle = "#1a1008"; x.fillRect(6, 6, 2, 2); x.fillRect(17, 6, 2, 2); x.fillRect(6, 13, 12, 2); x.fillRect(5, 12, 2, 2); x.fillRect(17, 12, 2, 2); }, false);
  T.oldShirt = C(16, 16, (x) => { x.fillStyle = "#8a7a9a"; x.fillRect(0, 0, 16, 16); noise(x, 16, 16, ["#7a6a8a", "#a898b8"], 40); x.fillStyle = "#5a4a6a"; x.fillRect(7, 0, 2, 16); });
  T.foggySky = C(4, 64, (x) => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, "#6a7a78"); g.addColorStop(0.5, "#a8b4a8"); g.addColorStop(1, "#a8b4a8"); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, false);
  T.greySky = C(4, 64, (x) => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, "#3a3a4a"); g.addColorStop(0.5, "#8a8a98"); g.addColorStop(1, "#8a8a98"); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, false);
  T.grass = C(32, 32, (x) => { x.fillStyle = "#5a8a3a"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#6a9a4a", "#4a7a2a", "#e8c870"], 240); });
  T.mud = C(32, 32, (x) => { x.fillStyle = "#4a4a32"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#5a5a3a", "#3a3a28", "#4a6a3a"], 240); });
  T.swampWater = C(32, 32, (x) => { x.fillStyle = "#3a5a4a"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#4a6a5a", "#2a4a3a", "#6a8a5a"], 160); });
  T.bigDoor = C(32, 52, (x, w, h) => { arch(x, w, h, "#5a3a22", "#2a1a10"); x.fillStyle = "#3a2414"; for (let i = 6; i < 32; i += 6) x.fillRect(i, 12, 1, 40); x.fillStyle = "#c8a040"; x.fillRect(14, 30, 4, 4); }, false);
  T.garage = C(32, 26, (x) => { x.fillStyle = "#7a7a80"; x.fillRect(0, 0, 32, 26); x.fillStyle = "#5a5a60"; for (let i = 2; i < 26; i += 3) x.fillRect(0, i, 32, 1); x.fillStyle = "#c8a040"; x.fillRect(0, 0, 32, 2); }, false);
  T.creepyWall = C(32, 32, (x) => { x.fillStyle = "#4a3040"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#5a3a4a", "#3a2030", "#2a1a20"], 160); x.fillStyle = "#3a2030"; x.fillRect(0, 0, 2, 32); x.fillRect(16, 0, 2, 32); });
  T.tvStatic = C(16, 16, (x) => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const v = rnd() * 255 | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, j, 1, 1); } });
  T.coils = C(32, 24, (x) => {
    x.fillStyle = "#f08a3a"; x.fillRect(0, 0, 32, 24); x.fillStyle = "#c8501a";
    for (let r = 0; r < 4; r++) for (let i = 0; i < 32; i++) x.fillRect(i, 4 + r * 5 + Math.round(Math.sin(i * 0.8 + r) * 1.2), 1, 1);
  }, false);
  T.bubbleTank = C(32, 32, (x) => { x.fillStyle = "#cfeaf8"; x.fillRect(0, 0, 32, 32); noise(x, 32, 32, ["#3a8ad8", "#6ab4f4"], 90); });
  T.roundMirror = C(32, 36, (x) => {
    x.fillStyle = "#e8559a"; x.beginPath(); x.ellipse(16, 18, 15, 17, 0, 0, 7); x.fill();
    x.fillStyle = "#d8ecf8"; x.beginPath(); x.ellipse(16, 18, 12, 14, 0, 0, 7); x.fill();
    x.fillStyle = "#ffffff"; x.fillRect(10, 9, 2, 8); x.fillRect(13, 9, 1, 4);
    const d = x.getImageData(0, 0, 32, 36); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 100 ? 255 : 0; x.putImageData(d, 0, 0);
  }, false);
  T.mirror = C(16, 16, (x) => { x.fillStyle = "#c8e0f0"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#ffffff"; x.fillRect(3, 3, 2, 6); x.fillRect(6, 3, 1, 3); });
}
