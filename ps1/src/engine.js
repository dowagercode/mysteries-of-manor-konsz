// engine.js: The 3D engine: renderer, the PS1 look (shader + dither), drawing helpers, geometry, and the room-building helpers (newLevel, put, room, onWall, addChar, cam). LV holds every level.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const DEFS = __DEFS__;
const IMAGES = __IMAGES__;
const W = 320, H = 240;
THREE.ColorManagement.enabled = false;

const $ = (id) => document.getElementById(id);
const stage = $("stage"), canvas = $("c"), msg = $("msg");

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
} catch (e) {
  msg.textContent = "This browser can't show 3D (WebGL is off).";
  throw e;
}
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// ---------- PS1 shader: wobbly snapped vertices, warped (affine) textures, per-vertex light, fog ----------
const G = {
  uRes: { value: new THREE.Vector2(W, H) }, uSnap: { value: 1 }, uAffine: { value: 0 }, uTime: { value: 0 },
  uAmb: { value: new THREE.Color() }, uDir: { value: new THREE.Vector3(0, -1, 0) }, uDirCol: { value: new THREE.Color() },
  uPt: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
  uPtCol: { value: [new THREE.Color(0), new THREE.Color(0), new THREE.Color(0)] },
  uPtR: { value: [1, 1, 1] },
  uFogCol: { value: new THREE.Color() }, uFog: { value: new THREE.Vector2(10, 30) },
};
const VS = `
uniform vec2 uRes; uniform float uSnap, uAffine, uEm, uWave, uTime, uFogAmt;
uniform vec3 uAmb, uDir, uDirCol; uniform vec3 uPt[3]; uniform vec3 uPtCol[3]; uniform float uPtR[3];
uniform vec2 uFog, uRep, uScroll;
varying vec3 vUvw; varying vec3 vLight; varying float vFog;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  if (uWave > 0.0) wp.y += (sin(wp.x * 1.3 + uTime * 1.6) * 0.12 + cos(wp.z * 1.7 + uTime * 1.2) * 0.1) * uWave;
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vec3 L = uAmb + uDirCol * max(dot(n, -uDir), 0.0);
  for (int i = 0; i < 3; i++) {
    vec3 d = uPt[i] - wp.xyz; float dist = length(d) + 1e-4;
    L += uPtCol[i] * max(dot(n, d / dist), 0.0) * clamp(1.0 - dist / uPtR[i], 0.0, 1.0);
  }
  #ifdef USE_COLOR
  L *= color;
  #endif
  // Glow (uEm) lifts toward full brightness: white for textured things, their own colour for
  // vertex-coloured models (so a glowing model keeps its colours instead of washing out).
  #ifdef USE_COLOR
  vLight = mix(L, color, uEm);
  #else
  vLight = mix(L, vec3(1.0), uEm);
  #endif
  vec4 vp = viewMatrix * wp;
  vec4 cp = projectionMatrix * vp;
  if (uSnap > 0.5) { vec2 g = uRes * 0.5; cp.xy = floor(cp.xy / cp.w * g + 0.5) / g * cp.w; }
  float w = uAffine > 0.5 ? cp.w : 1.0;
  vUvw = vec3((uv * uRep + uScroll * uTime) * w, w);
  vFog = clamp((-vp.z - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0) * uFogAmt;
  gl_Position = cp;
}`;
const FS = `
uniform sampler2D map; uniform vec3 uColor; uniform vec3 uFogCol; uniform float uAlpha;
varying vec3 vUvw; varying vec3 vLight; varying float vFog;
void main(){
  vec4 t = texture2D(map, vUvw.xy / vUvw.z);
  if (t.a < 0.5) discard;
  vec3 c = t.rgb * uColor * min(vLight, vec3(1.25));
  gl_FragColor = vec4(mix(c, uFogCol, vFog), uAlpha);
}`;

function C(w, h, draw, repeat = true, scale = 1) {
  const c = document.createElement("canvas");
  c.width = w * scale; c.height = h * scale;
  const x = c.getContext("2d");
  x.imageSmoothingEnabled = false;
  x.scale(scale, scale);
  draw(x, w, h);
  const t = texOf(c, repeat);
  if (scale > 1) { t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; }
  return t;
}
function texOf(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.userData.canvas = c;
  return t;
}
const WHITE = C(2, 2, (x) => { x.fillStyle = "#fff"; x.fillRect(0, 0, 2, 2); });

function mat(o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...G, map: { value: o.map || WHITE }, uColor: { value: new THREE.Color(o.color ?? 0xffffff) },
      uEm: { value: o.em || 0 }, uAlpha: { value: o.alpha ?? 1 }, uWave: { value: o.wave || 0 }, uFogAmt: { value: o.fog ?? 1 },
      uRep: { value: new THREE.Vector2(...(o.rep || [1, 1])) }, uScroll: { value: new THREE.Vector2(...(o.scroll || [0, 0])) },
    },
    vertexShader: VS, fragmentShader: FS, side: o.side ?? THREE.FrontSide, vertexColors: !!o.vc,
    transparent: o.alpha != null, depthWrite: o.alpha == null,
  });
}

// ---------- the 15-bit dither pass ----------
const rt = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const post = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
post.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: rt.texture } }, depthTest: false, depthWrite: false,
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    float b2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
    float b4(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float d = (b4(gl_FragCoord.xy) - 0.5) / 63.0;
      gl_FragColor = vec4(floor(clamp(c + d, 0.0, 1.0) * 63.0 + 0.5) / 63.0, 1.0); }`,
})));

// ---------- little drawing helpers ----------
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function noise(x, w, h, cols, n) { for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect(rnd() * w | 0, rnd() * h | 0, 1, 1); } }
function bits(x, rows, X, Y, pal, s = 1) {
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(X + i * s, Y + j * s, s, s); } }));
}
const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
const BIGHEART = ["..###...###..", ".#####.#####.", "#############", "#############", "#############", ".###########.",
  "..#########..", "...#######...", "....#####....", ".....###.....", "......#......"];
const BALL = ["..####..", ".#.##.#.", "#..##..#", "##....##", "##....##", "#..##..#", ".#.##.#.", "..####.."];
const FONT = '8px "Press Start 2P", monospace';
function label(lines, w, h, bg, fg, border, extra) {
  return C(w, h, (x) => {
    x.fillStyle = border; x.fillRect(0, 0, w, h);
    x.fillStyle = bg; x.fillRect(2, 2, w - 4, h - 4);
    x.fillStyle = fg; x.font = FONT; x.textBaseline = "top"; x.textAlign = "center";
    const top = (h - lines.length * 10) / 2 + 1;
    lines.forEach((l, i) => x.fillText(l, w / 2, top + i * 10));
    extra && extra(x, w, h);
  }, false, 4);
}
function arch(x, w, h, fill, edge) {
  x.fillStyle = edge;
  x.beginPath(); x.moveTo(0, h); x.lineTo(0, w / 2); x.arc(w / 2, w / 2, w / 2, Math.PI, 0); x.lineTo(w, h); x.fill();
  x.fillStyle = fill;
  x.beginPath(); x.moveTo(2, h); x.lineTo(2, w / 2); x.arc(w / 2, w / 2, w / 2 - 2, Math.PI, 0); x.lineTo(w - 2, h); x.fill();
  // sharpen the edge: no soft pixels
  const d = x.getImageData(0, 0, w, h);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 100 ? 255 : 0;
  x.putImageData(d, 0, 0);
}

// ---------- geometry helpers ----------
const seg = (v) => Math.max(1, Math.min(10, Math.round(v * 1.3)));
function boxG(w, h, d) { const g = new THREE.BoxGeometry(w, h, d, seg(w), seg(h), seg(d)); g.translate(0, h / 2, 0); return g; }
function planeG(w, h) { const g = new THREE.PlaneGeometry(w, h, seg(w), seg(h)); g.translate(0, h / 2, 0); return g; }
function floorG(w, d, sx, sz) { const g = new THREE.PlaneGeometry(w, d, sx || seg(w), sz || seg(d)); g.rotateX(-Math.PI / 2); return g; }
function heartG(s, depth = 0.12) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -s);
  sh.bezierCurveTo(-s * 0.2, -s * 0.6, -s, -s * 0.3, -s, s * 0.25);
  sh.bezierCurveTo(-s, s * 0.75, -s * 0.35, s * 0.9, 0, s * 0.45);
  sh.bezierCurveTo(s * 0.35, s * 0.9, s, s * 0.75, s, s * 0.25);
  sh.bezierCurveTo(s, -s * 0.3, s * 0.2, -s * 0.6, 0, -s);
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 3 });
  g.translate(0, 0, -depth / 2);
  return g;
}
function soccerG(r) {
  const g = new THREE.IcosahedronGeometry(r, 1), p = g.attributes.position, cols = [];
  const ico = new THREE.IcosahedronGeometry(1, 0).attributes.position, corners = [];
  for (let i = 0; i < ico.count; i++) corners.push(new THREE.Vector3().fromBufferAttribute(ico, i).normalize());
  const v = new THREE.Vector3();
  for (let f = 0; f < p.count; f += 3) {
    v.set(0, 0, 0);
    for (let k = 0; k < 3; k++) v.add(new THREE.Vector3().fromBufferAttribute(p, f + k));
    v.normalize();
    const black = corners.some((c) => c.dot(v) > 0.93);
    for (let k = 0; k < 3; k++) cols.push(...(black ? [0.12, 0.12, 0.14] : [1, 1, 1]));
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  return g;
}
function lineG(points) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  g.setAttribute("normal", new THREE.Float32BufferAttribute(new Array(points.length * 3).fill(0).map((_, i) => (i % 3 === 2 ? 1 : 0)), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(points.length * 2).fill(0.5), 2));
  return g;
}
function wavyString(x, y0, y1, z, wig = 0.12) {
  const pts = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector3(x + Math.sin(t * 9) * wig, y0 + (y1 - y0) * t, z)); }
  return lineG(pts);
}

// ---------- levels ----------
function newLevel(id, name) {
  return { id, name, scene: new THREE.Scene(), hots: [], solids: [], chars: [], allChars: [], cams: [], walk: [-3, 3, -1, 2], start: [0, 1], entries: {},
    light: { amb: 0x707080, dir: [0.3, -1, -0.5], dirCol: 0x606060, pts: [] }, fog: [0x000000, 12, 30], bg: 0x000000 };
}
function put(L, geo, m, x = 0, y = 0, z = 0, ry = 0, hot, parent) {
  const me = new THREE.Mesh(geo, m);
  me.position.set(x, y, z); me.rotation.y = ry;
  (parent || L.scene).add(me);
  if (hot) { me.userData.hot = hot; L.hots.push(me); }
  return me;
}
function line(L, geo, color, parent) { const l = new THREE.Line(geo, mat({ color, em: 1 })); (parent || L.scene).add(l); return l; }
function group(L, x, y, z, ry = 0, hot) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; L.scene.add(g);
  if (hot) { g.userData.hot = hot; L.hots.push(g); }
  return g;
}
function cam(L, pos, look, fov, when, far, follow) {
  const c = new THREE.PerspectiveCamera(fov || 50, 4 / 3, 0.5, far || 40);
  c.position.set(...pos); c.lookAt(...look); c.updateMatrixWorld();
  L.cams.push({ c, when: when || (() => true), follow });
}
function room(L, { w, d, h = 3.4, wall, floor, wallRep = 1.2, floorRep = 1, ceil = 0x50506a, trim }) {
  put(L, floorG(w, d), mat({ map: floor, rep: [w / floorRep, d / floorRep] }));
  put(L, planeG(w, h), mat({ map: wall, rep: [w / wallRep, h / wallRep] }), 0, 0, -d / 2);
  put(L, planeG(d, h), mat({ map: wall, rep: [d / wallRep, h / wallRep] }), -w / 2, 0, 0, Math.PI / 2);
  put(L, planeG(d, h), mat({ map: wall, rep: [d / wallRep, h / wallRep] }), w / 2, 0, 0, -Math.PI / 2);
  const cg = floorG(w, d); cg.rotateX(Math.PI);
  put(L, cg, mat({ color: ceil }), 0, h, 0);
  if (trim) {
    const m = mat({ color: trim });
    put(L, boxG(w, 0.18, 0.06), m, 0, 0, -d / 2 + 0.03);
    put(L, boxG(0.06, 0.18, d), m, -w / 2 + 0.03, 0, 0);
    put(L, boxG(0.06, 0.18, d), m, w / 2 - 0.03, 0, 0);
  }
}
// A flat picture on a wall. Side "back" | "left" | "right" picks which wall it faces out from.
function onWall(L, side, room, tex, w, h, a, y, hot, frameCol, depth = 0.02) {
  const [rw, rd] = room;
  let x, z, ry;
  if (side === "back") { x = a; z = -rd / 2 + depth; ry = 0; }
  else if (side === "left") { x = -rw / 2 + depth; z = a; ry = Math.PI / 2; }
  else if (side === "right") { x = rw / 2 - depth; z = a; ry = -Math.PI / 2; }
  else { x = a; z = rd / 2 - depth; ry = Math.PI; }
  const g = group(L, x, y, z, ry, hot);
  if (frameCol != null) put(L, boxG(w + 0.12, h + 0.12, 0.04), mat({ color: frameCol }), 0, -0.06, 0, 0, null, g);
  put(L, planeG(w, h), mat({ map: tex }), 0, 0, 0.06, 0, null, g);
  return g;
}

const CLEAR_TEX = C(2, 2, () => {});
let chars3d = false;
function buildChar3D(key, h) {
  const g = new THREE.Group();
  const parts = [];
  const P = (par, geo, col, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, em = 0.42) => {
    const me = new THREE.Mesh(geo, mat({ color: col, em, side: THREE.DoubleSide }));
    me.position.set(x, y, z); me.rotation.set(rx, ry, rz);
    me.userData.baseCol = new THREE.Color(col); me.userData.baseEm = em;
    par.add(me); parts.push(me);
    return me;
  };
  const piv = (par, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); par.add(p); return p; };
  const cyl = (rt, rb, len, seg = 6) => new THREE.CylinderGeometry(rt, rb, len, seg);
  const sph = (r, ws = 7, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
  const cone = (r, len, seg = 6) => new THREE.ConeGeometry(r, len, seg);
  const face = (y = 1.0, z = 0.165, sep = 0.065, eyeCol = 0x2a1f3d, sparkle = false, cheekCol = null, smileCol = 0x2a1f3d) => {
    [-1, 1].forEach((s) => {
      P(g, sph(0.024, 5, 4), eyeCol, s * sep, y + 0.015, z, 0, 0, 0, 0.6);
      if (sparkle) P(g, sph(0.011, 4, 4), 0xffffff, s * sep + 0.008, y + 0.022, z + 0.012, 0, 0, 0, 0.95);
      if (cheekCol) P(g, sph(0.025, 5, 4), cheekCol, s * (sep + 0.045), y - 0.025, z - 0.01, 0, 0, 0, 0.55);
    });
    if (smileCol != null) P(g, boxG(0.075, 0.018, 0.02), smileCol, 0, y - 0.06, z, 0, 0, 0, 0.5);
  };
  let legL = null, legR = null, armL = null, armR = null, extra = null;
  if (key === "may") {
    legL = piv(g, -0.08, 0.44, 0); legR = piv(g, 0.08, 0.44, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.038, 0.034, 0.36), 0xf3c9a5, 0, -0.18, 0);
      P(l, boxG(0.095, 0.065, 0.14), 0x8a2c55, 0, -0.44, 0.025);
    });
    P(g, cyl(0.095, 0.23, 0.46, 8), 0xe8669a, 0, 0.63, 0);
    P(g, boxG(0.075, 0.075, 0.02), 0xffffff, 0, 0.58, 0.165, 0, 0, 0, 0.85);
    P(g, boxG(0.075, 0.075, 0.02), 0xffffff, 0, 0.58, 0.168, 0, 0, Math.PI / 4, 0.85);
    armL = piv(g, -0.12, 0.81, 0); armR = piv(g, 0.12, 0.81, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, sph(0.052, 6, 5), 0xe8669a, s * 0.015, -0.02, 0);
      P(a, cyl(0.034, 0.03, 0.27), 0xf3c9a5, s * 0.055, -0.14, 0, 0, 0, -s * 0.26);
      P(a, sph(0.04, 6, 5), 0xf3c9a5, s * 0.09, -0.26, 0);
    });
    P(g, sph(0.18, 8, 7), 0xf3c9a5, 0, 1.01, 0);
    P(g, sph(0.188, 8, 7), 0x6b3f2a, 0, 1.03, -0.025);
    [-1, 1].forEach((s) => {
      P(g, boxG(0.13, 0.07, 0.09), 0x6b3f2a, s * 0.065, 1.11, 0.11, 0, 0, -s * 0.22);
      P(g, sph(0.095, 7, 6), 0x6b3f2a, s * 0.165, 1.19, -0.01);
      P(g, sph(0.038, 5, 4), 0xe8669a, s * 0.13, 1.13, 0.045);
    });
    face(1.01, 0.168, 0.065, 0x2a1f3d, true, 0xf29bb0);
  } else if (key === "jon" || key === "jonOval") {
    legL = piv(g, -0.085, 0.44, 0); legR = piv(g, 0.085, 0.44, 0);
    [legL, legR].forEach((l) => {
      P(l, boxG(0.095, 0.12, 0.11), 0x2f4a6e, 0, -0.10, 0);
      P(l, cyl(0.036, 0.033, 0.28), 0xe9b48a, 0, -0.22, 0);
      P(l, boxG(0.10, 0.07, 0.15), 0xe04e39, 0, -0.44, 0.025);
    });
    P(g, boxG(0.24, 0.12, 0.15), 0x2f4a6e, 0, 0.41, 0);
    P(g, cyl(0.12, 0.135, 0.35, 7), 0x3a86c8, 0, 0.68, 0);
    P(g, boxG(0.085, 0.085, 0.02), 0xffd23f, 0, 0.65, 0.13, 0, 0, 0, 0.75);
    P(g, boxG(0.085, 0.085, 0.02), 0xffd23f, 0, 0.65, 0.133, 0, 0, Math.PI / 4, 0.75);
    armL = piv(g, -0.135, 0.81, 0); armR = piv(g, 0.135, 0.81, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.045, 0.042, 0.10), 0x3a86c8, s * 0.02, -0.04, 0, 0, 0, -s * 0.2);
      P(a, cyl(0.034, 0.03, 0.24), 0xe9b48a, s * 0.06, -0.16, 0, 0, 0, -s * 0.25);
      P(a, sph(0.04, 6, 5), 0xe9b48a, s * 0.095, -0.27, 0);
    });
    P(g, sph(0.178, 8, 7), 0xe9b48a, 0, 1.00, 0);
    P(g, sph(0.182, 7, 6), 0xf0a830, 0, 1.03, -0.03);
    [[-0.14, 1.15, 0.02, 0.45], [-0.07, 1.22, 0.04, 0.2], [0, 1.24, 0.05, 0], [0.08, 1.22, 0.04, -0.22], [0.15, 1.15, 0.02, -0.48]].forEach(([x, y, z, rz]) => {
      P(g, cone(0.065, 0.19, 5), 0xf0a830, x, y, z, 0.1, 0, rz);
    });
    face(1.00, 0.165, 0.064, 0x2a1f3d, false, null);
    if (key === "jonOval") {
      const ov = piv(g, -0.32, 0.58, 0.04);
      const g1 = cyl(0.12, 0.12, 0.035, 10); g1.rotateX(Math.PI / 2); g1.scale(0.95, 2.8, 1);
      P(ov, g1, 0x6a2fb0, 0, 0, 0, 0, 0, 0, 0.65);
      const g2 = cyl(0.095, 0.095, 0.042, 10); g2.rotateX(Math.PI / 2); g2.scale(0.9, 2.6, 1);
      P(ov, g2, 0xa965e6, 0, 0, 0, 0, 0, 0, 0.85);
      const g3 = cyl(0.035, 0.035, 0.048, 8); g3.rotateX(Math.PI / 2); g3.scale(0.7, 2.2, 1);
      P(ov, g3, 0xf1d9ff, -0.025, 0.05, 0, 0, 0, 0, 0.95);
      extra = (t) => { ov.position.y = 0.58 + Math.sin(t * 3.2) * 0.035; };
    }
  } else if (key === "jasin") {
    legL = piv(g, -0.085, 0.44, 0); legR = piv(g, 0.085, 0.44, 0);
    [legL, legR].forEach((l) => {
      P(l, boxG(0.095, 0.12, 0.11), 0xf4f4f4, 0, -0.10, 0);
      P(l, cyl(0.036, 0.033, 0.28), 0xc68a5e, 0, -0.22, 0);
      P(l, boxG(0.10, 0.07, 0.15), 0x222222, 0, -0.44, 0.025);
    });
    P(g, boxG(0.24, 0.12, 0.15), 0xf4f4f4, 0, 0.41, 0);
    P(g, cyl(0.12, 0.135, 0.35, 7), 0x3fae6a, 0, 0.68, 0);
    P(g, boxG(0.022, 0.10, 0.02), 0xffffff, -0.038, 0.63, 0.132, 0, 0, 0, 0.8);
    P(g, boxG(0.062, 0.10, 0.02), 0xffffff, 0.028, 0.63, 0.132, 0, 0, 0, 0.8);
    P(g, boxG(0.024, 0.06, 0.022), 0x3fae6a, 0.028, 0.63, 0.135, 0, 0, 0, 0.5);
    armL = piv(g, -0.135, 0.81, 0); armR = piv(g, 0.135, 0.81, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.045, 0.042, 0.10), 0x3fae6a, s * 0.02, -0.04, 0, 0, 0, -s * 0.2);
      P(a, cyl(0.034, 0.03, 0.24), 0xc68a5e, s * 0.06, -0.16, 0, 0, 0, -s * 0.25);
      P(a, sph(0.04, 6, 5), 0xc68a5e, s * 0.095, -0.27, 0);
    });
    P(armL, sph(0.082, 7, 6), 0xffffff, -0.07, -0.19, 0.05, 0, 0, 0, 0.7);
    P(armL, sph(0.038, 5, 4), 0x2a1f3d, -0.07, -0.19, 0.115, 0, 0, 0, 0.5);
    P(g, sph(0.088, 7, 6), 0xffffff, 0.22, 0.09, 0.11, 0, 0, 0, 0.75);
    P(g, sph(0.04, 5, 4), 0x2a1f3d, 0.22, 0.11, 0.18, 0, 0, 0, 0.5);
    P(g, cyl(0.13, 0.13, 0.02, 8), 0xffe066, 0.22, 0.02, 0.11, 0, 0, 0, 0.9);
    P(g, sph(0.178, 8, 7), 0xc68a5e, 0, 1.00, 0);
    P(g, sph(0.186, 8, 7), 0x3b2a20, 0, 1.04, -0.025);
    [[-0.10, 1.16, 0.06], [0, 1.18, 0.08], [0.10, 1.16, 0.06], [-0.14, 1.09, 0.08], [0.14, 1.09, 0.08]].forEach(([x, y, z]) => {
      P(g, sph(0.068, 6, 5), 0x3b2a20, x, y, z);
    });
    face(1.00, 0.165, 0.064, 0x2a1f3d, false, null, null);
    P(g, boxG(0.105, 0.042, 0.025), 0xffffff, 0, 0.92, 0.16, 0, 0, 0, 0.85);
  } else if (key === "olivia") {
    legL = piv(g, -0.075, 0.44, 0); legR = piv(g, 0.075, 0.44, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.035, 0.032, 0.36), 0xf6d2b8, 0, -0.18, 0);
      P(l, boxG(0.09, 0.06, 0.14), 0x8b4fd1, 0, -0.44, 0.025);
    });
    P(g, cyl(0.105, 0.115, 0.40, 7), 0x38b2ac, 0, 0.64, 0);
    P(g, cyl(0.34, 0.38, 0.065, 12), 0x9b5de5, 0, 0.48, 0, 0, 0, 0, 0.55);
    P(g, cyl(0.24, 0.28, 0.075, 10), 0xecd9ff, 0, 0.485, 0, 0, 0, 0, 0.75);
    armL = piv(g, -0.12, 0.81, 0); armR = piv(g, 0.12, 0.81, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.032, 0.028, 0.27), 0xf6d2b8, s * 0.05, -0.14, 0, 0, 0, -s * 0.24);
      P(a, sph(0.038, 6, 5), 0xf6d2b8, s * 0.085, -0.26, 0);
    });
    P(g, sph(0.178, 8, 7), 0xf6d2b8, 0, 1.00, 0);
    P(g, sph(0.186, 8, 7), 0xa8452f, 0, 1.03, -0.025);
    [-1, 1].forEach((s) => {
      P(g, boxG(0.13, 0.065, 0.09), 0xa8452f, s * 0.065, 1.11, 0.105, 0, 0, -s * 0.2);
      P(g, sph(0.038, 5, 4), 0xe8669a, s * 0.18, 1.02, 0.01);
      P(g, cone(0.068, 0.26, 6), 0xa8452f, s * 0.24, 0.89, -0.01, 0, 0, s * 0.32);
    });
    face(1.00, 0.165, 0.064, 0x2a1f3d, true, 0xf29bb0);
  } else if (key === "wizard") {
    legL = piv(g, -0.08, 0.22, 0); legR = piv(g, 0.08, 0.22, 0);
    [legL, legR].forEach((l) => P(l, boxG(0.07, 0.05, 0.14), 0xa08b74, 0, -0.22, 0.03));
    P(g, cyl(0.10, 0.27, 0.78, 8), 0xb44fd6, 0, 0.47, 0);
    P(g, cyl(0.11, 0.22, 0.79, 6), 0x8a2fb0, 0, 0.47, -0.01);
    armL = piv(g, -0.14, 0.80, 0); armR = piv(g, 0.14, 0.80, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cone(0.095, 0.30, 6), 0xb44fd6, s * 0.08, -0.12, 0, 0, 0, s * 0.45);
      P(a, sph(0.038, 5, 4), 0xa08b74, s * 0.15, -0.25, 0.02);
    });
    P(g, sph(0.155, 8, 7), 0xf1dcc6, 0, 0.96, 0);
    [-1, 1].forEach((s) => {
      P(g, sph(0.065, 6, 5), 0xd8d0c4, s * 0.15, 0.99, -0.01);
      P(g, sph(0.055, 6, 5), 0xd8d0c4, s * 0.13, 0.90, 0.01);
    });
    const brd = cone(0.115, 0.32, 6); brd.rotateX(Math.PI);
    P(g, brd, 0xd8d0c4, 0, 0.77, 0.10);
    P(g, sph(0.035, 5, 4), 0xf1dcc6, 0, 0.95, 0.155);
    face(0.97, 0.145, 0.055, 0x2a1f3d, false, null, null);
    P(g, cyl(0.24, 0.26, 0.05, 8), 0xb44fd6, 0, 1.11, 0);
    P(g, cyl(0.14, 0.17, 0.08, 7), 0x8a2fb0, 0, 1.17, 0);
    P(g, cone(0.12, 0.16, 7), 0xb44fd6, 0, 1.27, 0);
  } else if (key === "witch") {
    legL = piv(g, -0.08, 0.32, 0); legR = piv(g, 0.08, 0.32, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.032, 0.028, 0.24), 0x3f9a47, 0, -0.14, 0);
      P(l, boxG(0.09, 0.055, 0.15), 0xb44fd6, 0, -0.32, 0.03);
    });
    P(g, cyl(0.10, 0.26, 0.64, 8), 0xb44fd6, 0, 0.54, 0);
    armL = piv(g, -0.13, 0.80, 0); armR = piv(g, 0.13, 0.80, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cone(0.075, 0.18, 6), 0xb44fd6, s * 0.05, -0.07, 0, 0, 0, s * 0.38);
      P(a, cyl(0.028, 0.024, 0.20), 0x3f9a47, s * 0.10, -0.18, 0, 0, 0, -s * 0.32);
      P(a, sph(0.036, 5, 4), 0x3f9a47, s * 0.14, -0.27, 0.02);
    });
    [-1, 1].forEach((s) => P(g, cone(0.065, 0.38, 5), 0xcfc6b8, s * 0.17, 0.84, -0.02, 0, 0, s * 0.2));
    P(g, sph(0.16, 8, 7), 0x6cc070, 0, 0.98, 0);
    const nose = cone(0.035, 0.14, 5); nose.rotateX(Math.PI / 2);
    P(g, nose, 0x6cc070, 0, 0.97, 0.20);
    P(g, boxG(0.09, 0.035, 0.025), 0xffffff, 0, 0.90, 0.15, 0, 0, 0, 0.8);
    face(0.99, 0.148, 0.055, 0x1d3b1f, false, null, null);
    P(g, cyl(0.23, 0.25, 0.04, 8), 0x8b2fb8, 0, 1.11, 0);
    P(g, cone(0.13, 0.24, 7), 0x8b2fb8, 0.02, 1.24, -0.01, -0.1, 0, -0.15);
  } else if (key === "pingpong") {
    legL = piv(g, -0.09, 0.38, 0); legR = piv(g, 0.09, 0.38, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.04, 0.036, 0.28), 0xf1d3b8, 0, -0.18, 0);
      P(l, boxG(0.105, 0.07, 0.15), 0x222222, 0, -0.38, 0.025);
    });
    P(g, boxG(0.28, 0.14, 0.20), 0xc0392b, 0, 0.34, 0);
    P(g, sph(0.205, 8, 7), 0xf1d3b8, 0, 0.58, 0.025);
    P(g, cyl(0.16, 0.195, 0.19, 8), 0xb89a7c, 0, 0.74, 0);
    armL = piv(g, -0.18, 0.78, 0); armR = piv(g, 0.18, 0.78, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.038, 0.034, 0.24), 0xf1d3b8, s * 0.06, -0.12, 0.03, -0.25, 0, -s * 0.3);
      P(a, sph(0.042, 6, 5), 0xf1d3b8, s * 0.10, -0.22, 0.06);
    });
    // Right hand: orange ping-pong paddle; Left hand: frothy root-beer mug
    const pad = cyl(0.085, 0.085, 0.022, 8); pad.rotateX(Math.PI / 2);
    P(armR, pad, 0xe8542c, 0.16, -0.14, 0.10);
    P(armR, boxG(0.025, 0.07, 0.025), 0x5a3a20, 0.12, -0.20, 0.08, 0, 0, -0.5);
    P(armL, cyl(0.055, 0.055, 0.12, 7), 0xf0a020, -0.13, -0.24, 0.09);
    P(armL, cyl(0.062, 0.062, 0.035, 7), 0xfffaf0, -0.13, -0.17, 0.09, 0, 0, 0, 0.8);
    P(g, sph(0.155, 8, 7), 0xf1d3b8, 0, 0.98, 0);
    [[-0.08, 1.14], [0, 1.16], [0.08, 1.14]].forEach(([x, y]) => P(g, cone(0.06, 0.14, 5), 0x222222, x, y, 0));
    [-1, 1].forEach((s) => P(g, boxG(0.065, 0.018, 0.02), 0x222222, s * 0.05, 1.03, 0.15, 0, 0, -s * 0.35));
    face(0.98, 0.148, 0.052, 0x2a1f3d, false, null, 0x2a1f3d);
  } else if (key === "apprentice") {
    // Standing in his little wooden rowboat with an oar
    P(g, boxG(0.68, 0.16, 0.32), 0x6b4a2f, 0, 0.0, 0);
    P(g, boxG(0.72, 0.04, 0.35), 0x4a321e, 0, 0.14, 0);
    legL = piv(g, -0.07, 0.36, 0); legR = piv(g, 0.07, 0.36, 0);
    P(g, cyl(0.10, 0.18, 0.56, 7), 0xb44fd6, 0, 0.44, 0);
    armL = piv(g, -0.12, 0.70, 0); armR = piv(g, 0.12, 0.70, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.032, 0.028, 0.22), 0xb44fd6, s * 0.05, -0.10, 0, 0, 0, -s * 0.28);
      P(a, sph(0.036, 5, 4), 0x9fd08a, s * 0.08, -0.20, 0.02);
    });
    P(armR, cyl(0.018, 0.018, 0.52, 5), 0x7a5230, 0.16, -0.24, 0.04, 0, 0, 0.55);
    P(armR, boxG(0.06, 0.14, 0.02), 0x7a5230, 0.28, -0.44, 0.04, 0, 0, 0.55);
    P(g, sph(0.145, 8, 7), 0x9fd08a, 0, 0.88, 0);
    face(0.88, 0.138, 0.05, 0x2a1f3d, false, null, 0x2a1f3d);
    P(g, cyl(0.21, 0.23, 0.035, 8), 0x3b2a5c, 0, 0.99, 0, 0, 0, -0.08);
    P(g, cone(0.12, 0.26, 7), 0x3b2a5c, -0.01, 1.13, 0, 0, 0, 0.08);
  } else if (key === "skeleton") {
    legL = piv(g, -0.075, 0.42, 0); legR = piv(g, 0.075, 0.42, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.024, 0.022, 0.34), 0xf0ece0, 0, -0.18, 0, 0, 0, 0, 0.65);
      P(l, boxG(0.085, 0.055, 0.14), 0xf0ece0, 0, -0.42, 0.025, 0, 0, 0, 0.65);
    });
    P(g, boxG(0.22, 0.26, 0.14), 0x3a5a8a, 0, 0.36, 0);
    P(g, cyl(0.105, 0.095, 0.26, 7), 0xf0ece0, 0, 0.72, 0, 0, 0, 0, 0.65);
    [0.66, 0.73, 0.80].forEach((y) => P(g, boxG(0.19, 0.022, 0.13), 0x2a1f3d, 0, y, 0.01));
    [-0.065, 0.065].forEach((x) => P(g, boxG(0.04, 0.24, 0.15), 0x3a5a8a, x, 0.62, 0));
    armL = piv(g, -0.13, 0.81, 0); armR = piv(g, 0.13, 0.81, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.022, 0.02, 0.28), 0xf0ece0, s * 0.05, -0.14, 0, 0, 0, -s * 0.22, 0.65);
      P(a, sph(0.035, 5, 4), 0xf0ece0, s * 0.08, -0.27, 0, 0, 0, 0, 0.65);
    });
    P(g, sph(0.16, 8, 7), 0xf0ece0, 0, 1.00, 0, 0, 0, 0, 0.7);
    P(g, boxG(0.13, 0.08, 0.12), 0xf0ece0, 0, 0.86, 0.03, 0, 0, 0, 0.7);
    [-1, 1].forEach((s) => P(g, sph(0.038, 6, 5), 0x2a1f3d, s * 0.058, 1.00, 0.14));
    P(g, boxG(0.10, 0.022, 0.02), 0x2a1f3d, 0, 0.90, 0.10);
    P(g, sph(0.168, 8, 6), 0xc82020, 0, 1.07, -0.01);
    P(g, boxG(0.22, 0.035, 0.16), 0xc82020, 0, 1.08, 0.10);
  } else if (key === "lady") {
    legL = piv(g, -0.075, 0.30, 0); legR = piv(g, 0.075, 0.30, 0);
    [legL, legR].forEach((l) => {
      P(l, cyl(0.032, 0.028, 0.22), 0xf3c9a5, 0, -0.12, 0);
      P(l, boxG(0.09, 0.06, 0.14), 0x2a1f3d, 0, -0.30, 0.025);
    });
    P(g, cyl(0.105, 0.22, 0.62, 8), 0x3a86c8, 0, 0.53, 0);
    P(g, boxG(0.18, 0.42, 0.04), 0xffffff, 0, 0.26, 0.14, 0, 0, 0, 0.7);
    armL = piv(g, -0.125, 0.80, 0); armR = piv(g, 0.125, 0.80, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => {
      P(a, cyl(0.04, 0.036, 0.12), 0x3a86c8, s * 0.02, -0.05, 0, 0, 0, -s * 0.2);
      P(a, cyl(0.03, 0.028, 0.20), 0xf3c9a5, s * 0.055, -0.16, 0, 0, 0, -s * 0.24);
      P(a, sph(0.036, 5, 4), 0xf3c9a5, s * 0.085, -0.26, 0);
    });
    P(g, sph(0.165, 8, 7), 0xf3c9a5, 0, 0.99, 0);
    P(g, sph(0.175, 8, 7), 0x8a8a90, 0, 1.02, -0.025);
    P(g, sph(0.085, 7, 6), 0x8a8a90, 0, 1.18, -0.04);
    face(0.99, 0.155, 0.058, 0x2a1f3d, false, 0xf29bb0);
  } else if (key === "dog") {
    legL = piv(g, -0.12, 0.42, -0.18); legR = piv(g, 0.12, 0.42, -0.18);
    armL = piv(g, -0.12, 0.42, 0.18); armR = piv(g, 0.12, 0.42, 0.18);
    [legL, legR, armL, armR].forEach((l) => {
      P(l, boxG(0.09, 0.38, 0.09), 0x6a4a2a, 0, -0.38, 0);
      P(l, boxG(0.10, 0.06, 0.12), 0x2a1a10, 0, -0.42, 0.02);
    });
    P(g, boxG(0.34, 0.30, 0.56), 0x6a4a2a, 0, 0.36, 0);
    P(g, boxG(0.28, 0.26, 0.26), 0x6a4a2a, 0, 0.62, 0.24);
    P(g, boxG(0.20, 0.14, 0.18), 0x6a4a2a, 0, 0.64, 0.42);
    P(g, boxG(0.18, 0.05, 0.14), 0xffffff, 0, 0.62, 0.43, 0, 0, 0, 0.8);
    P(g, boxG(0.07, 0.06, 0.06), 0x2a1a10, 0, 0.73, 0.49);
    [-1, 1].forEach((s) => {
      P(g, boxG(0.07, 0.18, 0.10), 0x2a1a10, s * 0.15, 0.72, 0.20, 0, 0, s * 0.25);
      P(g, sph(0.03, 5, 4), 0xffffff, s * 0.08, 0.80, 0.36, 0, 0, 0, 0.85);
      P(g, sph(0.018, 4, 4), 0x2a1a10, s * 0.08, 0.80, 0.38);
    });
    const tail = piv(g, 0, 0.62, -0.28);
    P(tail, cyl(0.028, 0.04, 0.24, 5), 0x2a1a10, 0, 0.10, -0.06, -0.5, 0, 0);
    extra = (t) => { tail.rotation.z = Math.sin(t * 7) * 0.35; };
  } else if (key === "owl") {
    [-0.09, 0.09].forEach((x) => P(g, boxG(0.09, 0.06, 0.14), 0xf2b830, x, 0.0, 0.03));
    P(g, sph(0.28, 8, 7), 0x7a5a3a, 0, 0.42, 0);
    P(g, sph(0.22, 7, 6), 0xc8a878, 0, 0.40, 0.11);
    armL = piv(g, -0.24, 0.55, 0); armR = piv(g, 0.24, 0.55, 0);
    [[-1, armL], [1, armR]].forEach(([s, a]) => P(a, boxG(0.08, 0.34, 0.22), 0x62462c, s * 0.03, -0.28, 0, 0, 0, -s * 0.15));
    P(g, sph(0.25, 8, 7), 0x7a5a3a, 0, 0.84, 0.02);
    [-1, 1].forEach((s) => {
      P(g, cone(0.065, 0.18, 5), 0x7a5a3a, s * 0.16, 1.08, 0.02, 0, 0, -s * 0.28);
      P(g, sph(0.078, 6, 5), 0xffffff, s * 0.095, 0.86, 0.21, 0, 0, 0, 0.85);
      P(g, sph(0.042, 5, 4), 0x2a1f3d, s * 0.095, 0.86, 0.265);
    });
    const bk = cone(0.045, 0.11, 4); bk.rotateX(Math.PI / 2);
    P(g, bk, 0xf2b830, 0, 0.80, 0.27);
  }
  g.scale.setScalar(h / 1.3);
  return { mesh3d: g, limbs: { legL, legR, armL, armR, extra }, parts };
}
function syncChar3D(c) {
  c.body.material.uniforms.map.value = chars3d ? CLEAR_TEX : c.tex2d;
  c.mesh3d.visible = chars3d;
  const col = c.body.material.uniforms.uColor.value, hex = col.getHex(), em = c.body.material.uniforms.uEm.value;
  if (c.lastTint !== hex || c.lastEm !== em) {
    c.lastTint = hex; c.lastEm = em;
    c.parts.forEach((p) => {
      if (hex === 0xffffff) {
        p.material.uniforms.uColor.value.copy(p.userData.baseCol);
        p.material.uniforms.uEm.value = p.userData.baseEm;
      } else if (em < 0.2) {
        p.material.uniforms.uColor.value.copy(p.userData.baseCol).lerp(col, 0.78);
        p.material.uniforms.uEm.value = 0.14;
      } else {
        p.material.uniforms.uColor.value.copy(p.userData.baseCol).multiply(col);
      }
    });
  }
}
function addChar(L, key, x, z, h = 1.3, hot) {
  const s = SPR[key], w = h * s.w / s.h;
  const root = new THREE.Group(); L.scene.add(root);
  const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
  const body = new THREE.Mesh(g, mat({ map: chars3d ? CLEAR_TEX : s.tex, em: 0.45, side: THREE.DoubleSide }));
  root.add(body);
  const { mesh3d, limbs, parts } = buildChar3D(key, h);
  mesh3d.visible = chars3d;
  body.add(mesh3d);
  const sh = new THREE.Mesh(floorG(w * 0.85, w * 0.42, 1, 1), mat({ map: T.shadow, color: 0x000000, em: 1, alpha: 0.4 }));
  sh.position.y = 0.025; root.add(sh);
  if (hot) { body.userData.hot = hot; L.hots.push(body); }
  const c = { key, root, body, mesh3d, limbs, parts, tex2d: s.tex, h, pos: new THREE.Vector2(x, z), target: null, face: 1, walkT: 0, speed: 2.4, phase: rnd() * 6 };
  // Angles: if SPR has key + "_side" / "_back" / "_q" (three-quarter front) / "_qback", walking picks among them.
  // (Inactive unless one of those sprites exists.)
  if (["_side", "_back", "_q", "_qback"].some((k) => SPR[key + k])) { c.angles = true; c.view = ""; }
  L.chars.push(c);
  if (L.allChars) L.allChars.push(c);
  return c;
}

// ---------- solid floor areas ----------
// Characters walk around these. All in floor x,z. `show` (optional) switches one off while it returns false.
//   solid(L, x, z, w, d)       a box centred on x,z, w wide (x) and d deep (z)
//   solidCircle(L, x, z, r)    a round footprint (barrel, pillar, round table)
//   solidOf(L, object, pad)    the footprint of a group or mesh (its bounding box on the floor), measured the first time someone walks
//   a hot object with `solid: true` does the same for itself (and goes away when its `show` is false)
// No story room uses these yet; they are an engine capability (see ps1/src/README.md).
function solid(L, x, z, w, d, show) { L.solids.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, show }); }
function solidCircle(L, x, z, r, show) { L.solids.push({ cx: x, cz: z, r, show }); }
function solidOf(L, obj, pad = 0, show) { L.solids.push({ obj, pad, show }); }

const LV = {};
