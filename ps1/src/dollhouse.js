// May's Barbie Dream House as a toy (Addie's idea). Her drawing is the house; the dolls and
// animals are cut out of it and can be dragged anywhere. She drew them in hot pink and the
// furniture in light purple, so the pink ink is lifted out and the furniture stays behind.
// Piece boxes are in a 1000x726 copy of art/15-barbie-dream-house.png.
const DH_PIECES = [
  ["Barbie", [356, 122, 422, 328], "pink"],
  ["Pink dog", [190, 100, 290, 168], "pink"],
  ["Little purple friend", [684, 268, 754, 352], "ink"],   // drawn in light purple, so take all its ink
  ["Doll at the table", [232, 426, 288, 614], "pink"],   // stops short of the table
  ["Tall pink doll", [364, 456, 416, 618], "pink"],
  ["Pink horse", [428, 530, 530, 616], "pink"],
];
let dhOpen = false, dhParts = null;
// Addie's dolls are hot pink (hue about 320-340); the furniture is light purple (hue about 285-300).
function dhPinkish(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx - mn < 12) return false;
  let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
  h *= 60; if (h < 0) h += 360;
  return h >= 310 || h <= 25;
}

async function buildDollhouse() {
  const im = new Image(); im.src = IMAGES["dream-house-play"]; await im.decode();
  const W = im.naturalWidth, H = im.naturalHeight;
  const bg = document.createElement("canvas"); bg.width = W; bg.height = H;
  const bx = bg.getContext("2d", { willReadFrequently: true }); bx.drawImage(im, 0, 0);
  const pieces = DH_PIECES.map(([name, b, mode], n) => {
    const x0 = Math.round(b[0] / 1000 * W), y0 = Math.round(b[1] / 726 * H);
    const w = Math.round((b[2] - b[0]) / 1000 * W), h = Math.round((b[3] - b[1]) / 726 * H);
    const src = bx.getImageData(x0, y0, w, h), out = new ImageData(w, h), d = src.data, o = out.data, N = w * h;
    // 1. which pixels are this piece's ink: dark enough, and pink (not the purple furniture)
    const ink = new Float32Array(N), cand = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], bl = d[i * 4 + 2];
      ink[i] = 255 - Math.min(r, g, bl);
      cand[i] = ink[i] > 18 && (mode === "ink" || dhPinkish(r, g, bl)) ? 1 : 0;
    }
    // 2. keep whole strokes: drop tiny specks; a light-purple piece also drops lines that run off its box (the shelf)
    const keep = new Uint8Array(N), seen = new Uint8Array(N), stack = [];
    for (let s0 = 0; s0 < N; s0++) {
      if (!cand[s0] || seen[s0]) continue;
      const comp = []; let edge = false, strong = 0; stack.push(s0); seen[s0] = 1;
      while (stack.length) {
        const i = stack.pop(), x = i % w, y = (i / w) | 0; comp.push(i);
        if (ink[i] > 70 && dhPinkish(d[i * 4], d[i * 4 + 1], d[i * 4 + 2])) strong++;
        if (x === 0 || x === w - 1) edge = true;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy, j = ny * w + nx;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && cand[j] && !seen[j]) { seen[j] = 1; stack.push(j); }
        }
      }
      // pink pieces: the stroke must be clearly pink (a purple wall line touching a doll isn't)
      const ok = mode === "ink" ? !edge : strong >= comp.length * 0.35;
      if (comp.length >= 15 && ok) comp.forEach((i) => (keep[i] = 1));
    }
    // 3. the cut-out: full-strength marker color with soft edges, so it looks clean on top of anything
    for (let i = 0; i < N; i++) {
      if (!keep[i]) continue;
      const a = Math.min(1, (ink[i] - 18) / 70), k = Math.max(a, 0.3);
      for (let c = 0; c < 3; c++) o[i * 4 + c] = Math.max(0, 255 - (255 - d[i * 4 + c]) / k);
      o[i * 4 + 3] = Math.round(a * 255);
    }
    // 4. erase it from the house, plus a 2-pixel border so no faint outline is left (purple furniture lines stay)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; let near = keep[i];
      for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) {
        const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && keep[ny * w + nx]) near = 1;
      }
      if (!near) continue;
      const r = d[i * 4], g = d[i * 4 + 1], bl = d[i * 4 + 2];
      if (keep[i] || mode === "ink" || dhPinkish(r, g, bl) || ink[i] < 35) d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255;
    }
    bx.putImageData(src, x0, y0);
    const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").putImageData(out, 0, 0);
    const el = document.createElement("div"); el.className = "dhPiece"; el.title = name; el.appendChild(c);
    return { key: "p" + n, name, el, home: [x0 / W, y0 / H], size: [w / W, h / H] };
  });
  return { W, H, url: bg.toDataURL("image/jpeg", 0.9), pieces };
}

function dhStyle() {
  const st = document.createElement("style");
  st.textContent = `
  #dh { position: fixed; inset: 0; z-index: 50; background: rgba(8, 6, 20, .96); display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px; padding: 10px; touch-action: none; user-select: none; -webkit-user-select: none; }
  #dh .board { position: relative; background: #fff; border-radius: 8px; overflow: hidden; flex: none; }
  #dh .board > img { width: 100%; height: 100%; display: block; pointer-events: none; }
  .dhPiece { position: absolute; cursor: grab; touch-action: none; }
  .dhPiece canvas { width: 100%; height: 100%; display: block; transform: scaleX(var(--flip, 1)); transition: transform .15s; }
  .dhPiece.held { cursor: grabbing; filter: drop-shadow(0 8px 5px rgba(0, 0, 0, .3)); }
  .dhPiece.held canvas { transform: scaleX(var(--flip, 1)) scale(1.1) rotate(-5deg); }
  .dhPiece.hop { animation: dhHop .55s ease-out; }
  @keyframes dhHop { 0%, 100% { transform: translateY(0); } 35% { transform: translateY(-22%) rotate(7deg); } 70% { transform: translateY(0) rotate(-5deg); } }
  #dh .bar { display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; color: #fff;
    font-size: 15px; line-height: 1.5; text-align: center; }
  #dh .bar button { font: 12px "Press Start 2P", monospace; padding: 10px 14px; background: #e0337f; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
  #dh .bar button.done { background: #5a2a8a; }`;
  document.head.appendChild(st);
}

async function openDollhouse() {
  if (dhOpen) return;
  dhOpen = true;
  if (!dhParts) {
    dhStyle();
    const p = await buildDollhouse();
    const root = document.createElement("div"); root.id = "dh"; root.hidden = true;
    const board = document.createElement("div"); board.className = "board";
    const img = document.createElement("img"); img.src = p.url; img.alt = "Inside May's Barbie Dream House (Addie's drawing)";
    board.appendChild(img);
    const bar = document.createElement("div"); bar.className = "bar";
    bar.innerHTML = `<span>Drag the dolls anywhere! Tap one to make it hop.</span><button class="reset">Put them back</button><button class="done">Done playing</button>`;
    root.append(board, bar);
    $("fade").before(root);
    root.addEventListener("click", (e) => e.stopPropagation());   // keep clicks away from the game
    bar.querySelector(".done").onclick = closeDollhouse;
    bar.querySelector(".reset").onclick = () => { S.flags.dh = {}; save(); p.pieces.forEach((q) => { q.pos = q.home.slice(); dhPlace(q); dhHop(q.el); }); };
    let z = 1, drag = null;
    p.pieces.forEach((q) => {
      q.pos = (S.flags.dh && S.flags.dh[q.key]) || q.home.slice();
      board.appendChild(q.el); dhPlace(q);
      const el = q.el;
      el.onpointerdown = (e) => {
        e.preventDefault(); e.stopPropagation();
        try { el.setPointerCapture(e.pointerId); } catch {}
        drag = { q, sx: e.clientX, sy: e.clientY, ox: q.pos[0], oy: q.pos[1], r: board.getBoundingClientRect(), moved: false, lastX: e.clientX };
        el.style.zIndex = ++z; el.classList.add("held");
      };
      el.onpointermove = (e) => {
        if (!drag || drag.q !== q) return;
        const dx = (e.clientX - drag.sx) / drag.r.width, dy = (e.clientY - drag.sy) / drag.r.height;
        if (Math.abs(dx) + Math.abs(dy) > 0.012) drag.moved = true;
        const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        q.pos = [cl(drag.ox + dx, -q.size[0] * 0.3, 1 - q.size[0] * 0.7), cl(drag.oy + dy, -q.size[1] * 0.3, 1 - q.size[1] * 0.7)];
        dhPlace(q);
        const mx = e.clientX - drag.lastX;
        if (Math.abs(mx) > 3) { el.style.setProperty("--flip", mx < 0 ? -1 : 1); drag.lastX = e.clientX; }   // face the way it's going
      };
      el.onpointerup = el.onpointercancel = () => {
        if (!drag || drag.q !== q) return;
        el.classList.remove("held");
        if (drag.moved) { S.flags.dh = { ...(S.flags.dh || {}), [q.key]: q.pos }; save(); }
        else dhHop(el);
        drag = null;
      };
    });
    dhParts = { ...p, root, board, bar };
    window.addEventListener("resize", dhFit);
    window.addEventListener("keydown", (e) => { if (dhOpen && e.key === "Escape") closeDollhouse(); });
  }
  dhParts.root.hidden = false;
  dhFit();
}
function dhPlace(q) {
  Object.assign(q.el.style, { left: q.pos[0] * 100 + "%", top: q.pos[1] * 100 + "%", width: q.size[0] * 100 + "%", height: q.size[1] * 100 + "%" });
}
function dhHop(el) { el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop"); }
function dhFit() {
  if (!dhParts || dhParts.root.hidden) return;
  const { root, board, bar, W, H } = dhParts;
  const aw = root.clientWidth - 20, ah = root.clientHeight - 28 - bar.offsetHeight;
  const k = Math.max(0.05, Math.min(aw / W, ah / H));
  board.style.width = W * k + "px"; board.style.height = H * k + "px";
}
function closeDollhouse() { dhOpen = false; if (dhParts) dhParts.root.hidden = true; }
