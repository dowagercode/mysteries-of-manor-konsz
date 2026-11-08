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
  vLight = mix(L, vec3(1.0), uEm);
  #ifdef USE_COLOR
  if (uEm > 0.0) vLight = mix(vLight, color, uEm);
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
  return { id, name, scene: new THREE.Scene(), hots: [], chars: [], cams: [], walk: [-3, 3, -1, 2], start: [0, 1], entries: {},
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
function addChar(L, key, x, z, h = 1.3, hot) {
  const s = SPR[key], w = h * s.w / s.h;
  const root = new THREE.Group(); L.scene.add(root);
  const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
  const body = new THREE.Mesh(g, mat({ map: s.tex, em: 0.45, side: THREE.DoubleSide }));
  root.add(body);
  const sh = new THREE.Mesh(floorG(w * 0.85, w * 0.42, 1, 1), mat({ map: T.shadow, color: 0x000000, em: 1, alpha: 0.4 }));
  sh.position.y = 0.025; root.add(sh);
  if (hot) { body.userData.hot = hot; L.hots.push(body); }
  const c = { key, root, body, pos: new THREE.Vector2(x, z), target: null, face: 1, walkT: 0, speed: 2.4, phase: rnd() * 6 };
  L.chars.push(c);
  return c;
}

const LV = {};
