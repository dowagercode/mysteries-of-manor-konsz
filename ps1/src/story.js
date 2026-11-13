// story.js: Save data, the item list, the item drawer, goal lines (goal, sideGoal), and putting items together (combine).
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- the game: items, puzzles, goals (story from the kids' notes) ----------
const SAVE_KEY = "manorkonsz-ps1-save";
const S = { items: [], flags: {}, room: "hall", sel: null };
// Players: several people can share one device, each with their own saved game. The list is kept under
// SAVE_KEY + "-players". Player 1 keeps the plain SAVE_KEY, so a save from before there were players is theirs.
// (The Look, voices and the other switches are for the device, not the player.)
const PLAYERS = { list: [{ id: 1, name: "Player 1" }], cur: 1, next: 2 };
const playerKey = (id = PLAYERS.cur) => (id === 1 ? SAVE_KEY : SAVE_KEY + "-p" + id);
const curPlayer = () => PLAYERS.list.find((p) => p.id === PLAYERS.cur) || PLAYERS.list[0];
function loadPlayers() {
  try {
    const p = JSON.parse(localStorage.getItem(SAVE_KEY + "-players") || "null");
    if (p && Array.isArray(p.list) && p.list.length) Object.assign(PLAYERS, p);
  } catch {}
  PLAYERS.cur = curPlayer().id;
}
function savePlayers() { try { localStorage.setItem(SAVE_KEY + "-players", JSON.stringify(PLAYERS)); } catch {} }
// Has this player started a game? (Read straight from their save, without loading it.)
function playerStarted(id) {
  try { return !!(JSON.parse(localStorage.getItem(playerKey(id)) || "null") || {}).flags?.started; } catch { return false; }
}
function pickPlayer(id) {
  if (!PLAYERS.list.some((p) => p.id === id)) return;
  PLAYERS.cur = id; savePlayers(); loadSave(); renderHud();
}
function addPlayer(name) {
  const id = PLAYERS.next++;
  PLAYERS.list.push({ id, name: (name || "").trim().slice(0, 14) || "Player " + (PLAYERS.list.length + 1) });
  pickPlayer(id);
  return id;
}
// Takes a player off the list and wipes their save. There is always at least one player.
function removePlayer(id) {
  if (!PLAYERS.list.some((p) => p.id === id)) return;
  try { localStorage.removeItem(playerKey(id)); } catch {}
  PLAYERS.list = PLAYERS.list.filter((p) => p.id !== id);
  if (!PLAYERS.list.length) PLAYERS.list.push({ id: PLAYERS.next++, name: "Player 1" });
  pickPlayer(curPlayer().id);
}
function loadSave() {
  S.items = []; S.flags = {}; S.room = "hall"; S.sel = null;
  try { const d = JSON.parse(localStorage.getItem(playerKey()) || "null"); if (d) Object.assign(S, d, { sel: null }); } catch {}
}
loadPlayers(); loadSave();
const ITEMS = {
  tuna: ["🥫", "Can of tuna"], opener: ["🔧", "Can opener"], key: ["🗝️", "Engine room key"], cheese: ["🧀", "Moldy cheese"],
  map: ["🗺️", "Engine room map"], pills: ["💊", "Memory pills"], flour: ["🌾", "Flour"], oil: ["🫒", "Oil"], sugar: ["🍬", "Sugar"],
  cacao: ["🍫", "Cacao"], water: ["💧", "Water"], yeast: ["🍞", "Yeast"], cake: ["🎂", "Chocolate cake"],
  boxKey: ["🔑", "Little key"], keycard: ["💳", "Keycard"], flower: ["🌸", "Space flower"],
  squeegee: ["🧽", "Squeegee"], momStone: ["🪨", "Mom stone"], dadStone: ["🪨", "Dad stone"], wifeStone: ["🪨", "Wife stone"],
  jeepKeys: ["🚙", "Jeep keys"], marketKey: ["🗝️", "Supermarket key"],
  hat: ["👒", "Straw hat"], scarecrowKit: ["🧑‍🌾", "Giant scarecrow"], shirt: ["👕", "Old shirt"], twigs: ["🪵", "Bundle of twigs"], straw: ["🌾", "Straw"], head: ["🗿", "Stone head"], robes: ["🥋", "Priest robes"],
  flashlight: ["🔦", "Flashlight"], chart: ["📜", "Wheel of the year chart"], book: ["📕", "Giant picture book"],
  mouthpiece: ["🎺", "Trumpet mouthpiece"], middle: ["🎺", "Trumpet middle section"], bell: ["🎺", "Trumpet bell"], trumpet: ["🎺", "Crystal trumpet"],
  stoneBow: ["🎀", "Stone hair bow"], stoneDisk: ["⚫", "Stone portal disk"], stoneBall: ["⚽", "Stone soccer ball"], stoneTutu: ["🩰", "Stone tutu"], dogFood: ["🥫", "Can of dog food"],
  diploma: ["🏆", "Diploma of Excellent Ping-Pong"],
};
const CAKE = ["flour", "oil", "sugar", "water", "yeast", "cacao"];
const has = (id) => S.items.includes(id);
function save() {
  try { localStorage.setItem(playerKey(), JSON.stringify({ items: S.items, flags: S.flags, room: S.room })); } catch {}
  renderHud();
}
function add(id, flag) {
  if (!has(id)) { S.items.push(id); if (typeof itemCue === "function") itemCue(); }
  if (flag) S.flags[flag] = true;
  save();
}
function remove(id) { S.items = S.items.filter((i) => i !== id); if (S.sel === id) S.sel = null; save(); }
const flag = (f) => () => { S.flags[f] = true; save(); };
const take = (id) => [() => add(id, "got_" + id), ["", ITEMS[id][1] + "! It goes in your item drawer."]];

function goal() {
  const g = goalLine();
  // back on the ship after the crash: always say how to get off it
  if (S.flags.crashed && L && SHIP_ROOMS.includes(L.id) && L.id !== "hideout")
    return g + (L.id === "hub" ? " (To leave the ship: the boat door on the right.)" : " (To leave the ship: the boat is in the kitchen + rec room.)");
  return g;
}
function goalLine() {
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
  if (has("cake")) return "Bring the chocolate cake to Jon. He's inside his portal in his room.";
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
  if (!f.metJon) return "Jon is hiding in his portal. Go to Jon's room and climb inside to talk to him.";
  return "Ask the crew what's going on with Jon. (Try Olivia's room.)";
}
function sideGoal() {
  const f = S.flags;
  if (f.needLight && !has("flashlight")) {
    const ship = L && ["hall", "hub", "control", "armory", "engine", "hideout", "jons", "mays", "jasins", "olivias", "playroom", "storage", "bath"].includes(L.id);
    if (!ship) return "Flashlight: it's in the ship's armory. Drive to the swamp and row the apprentice's boat out to the ship.";
    if (f.armoryOpen) return "Flashlight: it's in the armory, through the door in the control room.";
    if (has("keycard")) return "Flashlight: open the armory in the control room with the keycard.";
    if (has("boxKey")) return "Flashlight: the armory needs a keycard. The little key opens a locked box in the engine room.";
    return "Flashlight: the armory needs a keycard. Is there anything under the papers in Jon's portal?";
  }
  if (f.drove) {
    if (has("head")) return "Side mystery: whose stone head is this? Maybe it belongs to a statue somewhere.";
    if (f.statueTold && !f.stairsUp) return "The statue's riddle: \"Follow the wheel of the year.\"";
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
      if (id === "diploma" && !S.sel && typeof showDiploma === "function") { showDiploma(); return; }
      if (S.sel && S.sel !== id && S.sel !== "power") { const a = S.sel; S.sel = null; if (!combine(a, id)) say([["", "Those don't go together."]]); renderHud(); return; }
      S.sel = S.sel === id ? null : id; renderHud();
    };
    d.appendChild(b);
  });
  renderCrewBar();
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

// Coming back to a place (doc/gameplay.md): the first visit tells the story; later visits get a
// short new line instead. Arrays hold a few lines to take turns; a function decides from the story state.
const RETURNS = {
  beach: [[["", "Back at the crash site. The ship is still sitting in the water."]], [["Jon", "Our poor ship..."]]],
  pingpong: () => S.flags.ppKO ? pongInvite()
    : [["Ping-pong bad guy", "Back for more? Nobody gets past MY ping-pong station!"]],
  gas: [[["", "Back at the gas station. Still strange and empty..."]], [["Olivia", "This place gives me the creeps."]]],
  roadmap: [[["", "Back on the road map. Where to next?"]]],
  mountainUp: [[["", "Back on the steep mountain path."]]],
  mountainDown: [[["", "Back on the path down the mountain."]]],
  marketIn: [[["May", "So much ramen!"]], [["", "Back inside the supermarket."]]],
  forest: [[["Jasin", "The scary forest again... I still see eyes!"]], [["", "Back in the dark forest."]]],
  swampField: [[["", "Back in the field. The little frogs are still hopping around."]]],
  swamp: [[["", "Back at the foggy swamp."]]],
  mansion: [[["Olivia", "The creepy mansion again. Left or right?"]]],
  mansionLiving: [[["", "Back in the living room with the ripped couch."]]],
  mansionKitchen: [[["Jasin", "The kitchen again. Still lots of food!"]]],
  mansionOut: [[["", "Back outside the huge, creepy mansion."]]],
  mansionMusic: [[["", "Back in the music hall with the giant xylophone."]]],
  castle: [[["", "Back out on the mountain by the wizard's castle."]]],
  castleBack: [[["", "Back behind the castle. The Jacuzzi is still bubbling."]]],
  castleKitchen: [[["May", "It still smells like muffins in here!"]]],
  reception: [[["", "Back in the reception hall."]]],
  wheelHall: [[["", "Back in the hall with 8 doors."]]],
  castleUp: [[["", "Back at the top of the stairs."]]],
  mirrors: [[["Jon", "So many of us!"]], [["", "Back in the hall of mirrors."]]],
  pastRoom: [[["", "Through the PAST mirror again... toddlers again!"]]],
  presentRoom: (n) => S.flags.fogClear ? (n <= 1 ? [["", "Back in the PRESENT room. The fog is gone now."]] : [])
    : [["", "Back in the foggy PRESENT room."], ...fogAct()],
  engine: () => S.flags.gotMap ? [] : [["", "Still a maze of pipes. May needs a map!"]],
  armory: [[["", "Back in the armory."]]],
  hideout: [[["", "Back inside Jon's portal."]]],
};
