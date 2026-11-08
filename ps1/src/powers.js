// Playable kids + powers. After the crash any kid can lead (S.flags.lead); the others follow.
// Whoever leads always has their power: press the power button, then click something.
// A power runs the matching puzzle choice if the thing has one (e.g. "Lift ... with telekinesis");
// otherwise it does something fun. May's telekinesis can move almost anything.
const KIDS = ["may", "jon", "jasin", "olivia"];
const KID_NAME = { may: "May", jon: "Jon", jasin: "Jasin", olivia: "Olivia" };
const POWER = {
  may: { label: "May's telekinesis", icon: "🌀", match: [/telekinesis|with my mind|^May:/i, /^(move|lift|pull)/i] },
  jon: { label: "Jon's portal", icon: "🟣", match: [/portal|^Jon:/i] },
  jasin: { label: "Jasin's soccer ball kick", icon: "⚽", match: [/soccer|kick|^Jasin:/i] },
  olivia: { label: "Olivia's spin and float", icon: "🩰", match: [/spin|float|^Olivia:/i] },
};
ITEMS.power = ["✨", "power"];
function lead() { return (L && L.crew && S.flags.lead) || "may"; }

function applyLead(lv) {
  if (!lv.crew) return;
  const k = S.flags.lead || "may", order = [k, ...KIDS.filter((x) => x !== k)];
  const was = lv.player;
  order.forEach((id, i) => { const c = lv.crew[id]; c.follow = i ? lv.crew[order[i - 1]] : null; });
  lv.player = lv.crew[k];
  if (was && was !== lv.player) { was.target = null; was.onArrive = null; }
  lv.player.target = null;
}
function setLead(k) {
  if (talking() || busy || !L || !L.crew) return;
  S.flags.lead = k; save();
  if (S.sel === "power") S.sel = null;
  applyLead(L); renderHud();
  L.player.hopT = 0.36;
}

// ---------- the "Play as" row and the power button (built here so the page shell stays simple) ----------
function renderCrewBar() {
  let bar = $("crewBar");
  if (!bar) {
    bar = document.createElement("div"); bar.id = "crewBar";
    bar.innerHTML = `<span class="dlabel">Play as</span><div id="crewBtns"></div><button id="powerBtn" class="item"></button>`;
    $("exitWrap").before(bar);
    const st = document.createElement("style");
    st.textContent = `#crewBar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
      #crewBar .dlabel { margin: 0 4px 0 0; } #crewBtns { display: flex; gap: 6px; flex-wrap: wrap; }
      #crewBtns button[aria-pressed="true"] { outline: 3px solid #ffd23f; }
      #powerBtn { margin-left: auto; } #powerBtn[aria-pressed="true"] { outline: 3px solid #ffd23f; }`;
    document.head.appendChild(st);
    $("powerBtn").onclick = usePowerBtn;
  }
  const k = lead(), crewOn = !!(L && L.crew);
  bar.hidden = !L || !L.player || (L.player.show && !L.player.show());
  bar.querySelector(".dlabel").hidden = !crewOn;
  const btns = $("crewBtns"); btns.textContent = "";
  if (crewOn) KIDS.forEach((id) => {
    const b = document.createElement("button"); b.className = "item"; b.textContent = KID_NAME[id];
    b.setAttribute("aria-pressed", id === k); b.onclick = () => setLead(id); btns.appendChild(b);
  });
  ITEMS.power[1] = POWER[k].label;
  const pb = $("powerBtn");
  pb.innerHTML = `<span class="ico">${POWER[k].icon}</span><span>Use ${POWER[k].label}</span>`;
  pb.setAttribute("aria-pressed", S.sel === "power");
}
function usePowerBtn() {
  if (talking() || busy || !L) return;
  const k = lead();
  if (L.id === "pingpong" && !S.flags.ppKO) { say(doMove(k)); return; }   // the fight: the power goes right at him
  S.sel = S.sel === "power" ? null : "power"; renderHud();
}

// ---------- using a power on something ----------
const theName = (n) => /^[A-Z][a-z]+'s /.test(n) ? n : "the " + n.charAt(0).toLowerCase() + n.slice(1);
function powerOn(h, o) {
  const k = lead(), P = POWER[k];
  // 1. a puzzle choice made for this power
  const lines = h.say ? (typeof h.say === "function" ? h.say() : h.say) : [];
  const ch = lines.find((l) => l && l.choices);
  if (ch) for (const re of P.match) {
    const c = ch.choices.find(([label]) => re.test(label));
    if (c) return k === "may" ? [() => floatThing(o), ...c[1]()] : c[1]();
  }
  const name = theName(h.name), who = L.chars.find((c) => c.body === o);
  const exit = isExit(h);
  // 2. something fun
  if (k === "may") {
    if (exit) return [["May", "Hmm... that's way too big to lift, even with my mind!"]];
    if (who) return [() => floatThing(o), ["", `May floats ${h.name} up into the air with her mind!`], ...(KIDS.includes(who.key) || who.key === "jonOval" ? [[h.name, "Wheee! Put me down!"]] : [])];
    const rest = h.run ? [] : lines.filter((l) => !(l && l.choices));
    return [() => floatThing(o), ["", `May lifts ${name} with her mind!`], ...(rest.length ? rest : [["", "...and sets it gently back down."]])];
  }
  if (k === "jasin") return [() => bonkThing(o), ["", `Jasin kicks his glowing soccer ball at ${name}. BOING! It bounces right back to him.`]];
  if (k === "jon") return [() => portalPuff(o), ["", `Jon opens his portal next to ${name}... then closes it again.`], ["Jon", "Nobody needs to hide right now."]];
  return [() => floatCrew(), ["", "Olivia spins, her tutu glows, and everyone floats up for a moment!"], ["Olivia", "Wheee!"]];
}

// ---------- little animations ----------
const FX_ANIM = [];
function floatThing(o) {
  const who = L.chars.find((c) => c.body === o);
  FX_ANIM.push({ t: 0, dur: 1.8, f: (k) => {
    const y = Math.sin(k * Math.PI) * 0.9;
    if (who) who.yOff = y;
    else { o.userData.baseY ??= o.position.y; o.position.y = o.userData.baseY + y; o.rotation.z = Math.sin(k * Math.PI * 4) * 0.12 * Math.sin(k * Math.PI); }
  } });
}
function bonkThing(o) {
  const who = L.chars.find((c) => c.body === o);
  if (who) { who.hopT = 0.36; return; }
  o.userData.baseX ??= o.position.x;
  FX_ANIM.push({ t: 0, dur: 0.6, f: (k) => { o.position.x = o.userData.baseX + Math.sin(k * Math.PI * 6) * 0.06 * (1 - k); } });
}
function floatCrew() {
  const cs = L.crew ? Object.values(L.crew) : [L.player];
  FX_ANIM.push({ t: 0, dur: 2.2, f: (k) => cs.forEach((c, i) => (c.yOff = Math.max(0, Math.sin(Math.min(1, k * 1.1 - i * 0.03) * Math.PI)) * 0.7)) });
}
function portalPuff(o) {
  const wp = o.getWorldPosition(new THREE.Vector3());
  const ring = new THREE.RingGeometry(0.3, 0.42, 16); ring.scale(0.7, 1.2, 1);
  const m = new THREE.Mesh(ring, mat({ color: 0xb77cf0, em: 1, side: THREE.DoubleSide }));
  m.position.set(wp.x + 0.7, 0.9, wp.z + 0.3); L.scene.add(m);
  const lv = L;
  FX_ANIM.push({ t: 0, dur: 1.4, f: (k) => { m.scale.setScalar(Math.sin(k * Math.PI) + 0.01); m.rotation.y = k * 3; if (k >= 1) lv.scene.remove(m); } });
}
function updatePowerFx(dt) {
  for (let i = FX_ANIM.length - 1; i >= 0; i--) {
    const a = FX_ANIM[i]; a.t += dt / a.dur;
    a.f(Math.min(1, a.t));
    if (a.t >= 1) FX_ANIM.splice(i, 1);
  }
}
