// story.js: Save data, the item list, the item drawer, goal lines (goal, sideGoal), and putting items together (combine).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- the game: items, puzzles, goals (story from the kids' notes) ----------
const SAVE_KEY = "manorkonsz-ps1-save";
const S = { items: [], flags: {}, room: "hall", sel: null };
try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); if (d) Object.assign(S, d, { sel: null }); } catch {}
const ITEMS = {
  tuna: ["🥫", "Can of tuna"], opener: ["🔧", "Can opener"], key: ["🗝️", "Engine room key"], cheese: ["🧀", "Moldy cheese"],
  map: ["🗺️", "Engine room map"], pills: ["💊", "Memory pills"], flour: ["🌾", "Flour"], oil: ["🫒", "Oil"], sugar: ["🍬", "Sugar"],
  cacao: ["🍫", "Cacao"], water: ["💧", "Water"], yeast: ["🍞", "Yeast"], cake: ["🎂", "Chocolate cake"],
  boxKey: ["🔑", "Little key"], keycard: ["💳", "Keycard"], flower: ["🌸", "Space flower"],
  squeegee: ["🧽", "Squeegee"], momStone: ["🪨", "Mom stone"], dadStone: ["🪨", "Dad stone"], wifeStone: ["🪨", "Wife stone"],
  jeepKeys: ["🚙", "Jeep keys"], marketKey: ["🗝️", "Supermarket key"],
  hat: ["👒", "Straw hat"], scarecrowKit: ["🧑‍🌾", "Giant scarecrow"], shirt: ["👕", "Old shirt"], twigs: ["🪵", "Bundle of twigs"], straw: ["🌾", "Straw"], head: ["🗿", "Stone head"], robes: ["🥋", "Priest robes"],
};
const CAKE = ["flour", "oil", "sugar", "water", "yeast", "cacao"];
const has = (id) => S.items.includes(id);
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ items: S.items, flags: S.flags, room: S.room })); } catch {}
  renderHud();
}
function add(id, flag) { if (!has(id)) S.items.push(id); if (flag) S.flags[flag] = true; save(); }
function remove(id) { S.items = S.items.filter((i) => i !== id); if (S.sel === id) S.sel = null; save(); }
const flag = (f) => () => { S.flags[f] = true; save(); };
const take = (id) => [() => add(id, "got_" + id), ["", ITEMS[id][1] + "! It goes in your item drawer."]];

function goal() {
  const f = S.flags;
  if (f.crashed) {
    if (f.drove) return roadGoal();
    if (f.gotJeep) return "May has the jeep keys! Get in the creepy jeep.";
    if (f.ppKO) {
      const n = STONES.filter(([id]) => has(id)).length;
      if (!f.metOwner) return L && L.id.startsWith("gas") ? "Somebody works at this gas station. Go inside and say hi." : "Go down the road to the gas station.";
      if (n === 3) return "Bring the 3 stones to the skeleton owner at the counter.";
      if (has("squeegee") && !f.got_momStone) return `Find the 3 stones (${n} of 3). That squeegee might fish something out of somewhere...`;
      return `The skeleton owner wants 3 special stones. Search around the gas station (${n} of 3).`;
    }
    const ph = f.ppPhase || 0;
    if (L && L.id === "pingpong" || f.metPP) {
      return ["The ping-pong bad guy is about to swing! Who could protect everyone? (Click a kid.)",
        "Everyone is safe inside Jon's portal. Who could strike before they come out?",
        "He's attacking again! Who could make everyone float out of reach?",
        "Everyone is floating! Who could grab that ping-pong stick?"][ph];
    }
    return "Everyone made it to the beach! Run to the mountain.";
  }
  if (f.gaveCake && !f.fixed) return has("map") ? "Jon is in the engine room. Give him the engine room map so he can fix the engine!" : "Jon needs the engine room schematics. Get the map from the mouse in the kitchen!";
  if (has("cake")) return "Bring the chocolate cake to Jon. He's inside his purple portal in his room.";
  if (f.gavePills) {
    const n = CAKE.filter((c) => f["got_" + c]).length;
    if (n === 6) return "May has all 6 ingredients! Bake the cake at the pink stove in the kitchen.";
    return `Make a chocolate cake for Jon! Find flour, oil, sugar, water, yeast, and cacao around the ship (${n} of 6). Try everyone's rooms.`;
  }
  if (has("pills")) return "Bring the memory pills to Olivia.";
  if (f.engineOpen && !f.gotMap) return "The engine room is a maze. May needs a map. (Is there a mouse around?)";
  if (f.engineOpen) return "Find Olivia's memory pills in the engine room.";
  if (has("key")) return "May has the key! Go to the engine room at the end of the hallway.";
  if (has("tuna") && has("opener")) return "Click the can opener in your item drawer, then click the can of tuna.";
  if (has("tuna")) return "Something rattles in the can of tuna! Look for a way to open it. (Try the kitchen drawers.)";
  if (f.askedOlivia) return "Olivia needs her memory pills. They're in the locked engine room. Maybe check the fridge?";
  if (!f.metJon) return "Jon is hiding in his purple portal. Go to Jon's room and climb inside to talk to him.";
  return "Ask the crew what's going on with Jon. (Try Olivia's room.)";
}
function sideGoal() {
  const f = S.flags;
  if (f.drove) {
    if (has("head")) return "Side mystery: whose stone head is this? Maybe it belongs to a statue somewhere.";
    if (f.statueTold && !f.castleEnd) return "Secret: there's a truck entrance around behind the wizard's castle.";
    return "";
  }
  if (f.crashed && f.ppKO && !f.got_marketKey) return f.metOwner ? "Side mystery: is there anything else hidden around the gas station?" : "";
  if (f.armoryOpen || f.crashed) return "";
  if (has("keycard")) return "Side mystery: May has the keycard! Open the armory in the control room.";
  if (has("boxKey")) return "Side mystery: the little key opens a locked box somewhere on the ship.";
  if (f.sawArmory) return "Side mystery: the armory needs a keycard. Where could it be?";
  return "";
}
function renderHud() {
  $("goal").textContent = goal();
  const sg = sideGoal(); $("side").textContent = sg; $("side").hidden = !sg;
  const d = $("drawer"); d.textContent = "";
  if (!S.items.length) { const e = document.createElement("span"); e.className = "empty"; e.textContent = "Empty. Things May finds go here."; d.appendChild(e); }
  S.items.forEach((id) => {
    const b = document.createElement("button"); b.className = "item"; b.setAttribute("aria-pressed", S.sel === id);
    b.innerHTML = `<span class="ico">${ITEMS[id][0]}</span><span>${ITEMS[id][1]}</span>`;
    b.onclick = () => {
      if (talking() || busy) return;
      if (S.sel && S.sel !== id) { const a = S.sel; S.sel = null; if (!combine(a, id)) say([["", "Those don't go together."]]); renderHud(); return; }
      S.sel = S.sel === id ? null : id; renderHud();
    };
    d.appendChild(b);
  });
  $("selHint").textContent = S.sel ? `Using: ${ITEMS[S.sel][1]}. Click something to use it on, or click it again to put it back.` : "";
}
function combine(a, b) {
  if ((SCARE.includes(a) || a === "scarecrowKit") && (SCARE.includes(b) || b === "scarecrowKit")) { scarecrowCombine(); return true; }
  if ([a, b].sort().join("+") === "opener+tuna") {
    remove("tuna"); remove("opener"); add("key");
    say([["", "May opens the can of tuna... there's a key inside! It's the engine room key!"]]);
    return true;
  }
  return false;
}
