// debug.js: The debug panel (Shift+D or #debug): story checkpoints, go to any room, add any item.
// Part of the game; ps1/build.py joins every file in ps1/src/ (in the order listed there) into one page.

// ---------- debug: travel to points in the story (Shift+D, or #debug in the address) ----------
const CHECKPOINTS = (() => {
  const steps = [
    ["Ch1: start", "mays", {}, []],
    ["Ch1: Olivia wants her pills", "hub", { metJon: 1, askedOlivia: 1 }, []],
    ["Ch1: engine room, with the map", "engine", { got_tuna: 1, got_opener: 1, got_cheese: 1, engineOpen: 1, gotMap: 1 }, ["map"]],
    ["Ch1: bake the cake", "hub", { gotPills: 1, gavePills: 1, got_flour: 1, got_oil: 1, got_sugar: 1, got_water: 1, got_yeast: 1, got_cacao: 1 }, ["map", "flour", "oil", "sugar", "water", "yeast", "cacao"]],
    ["Ch1: give Jon the cake", "hideout", { gotCake: 1 }, ["map", "cake"]],
    ["Ch1: Jon fixes the engine", "engine", { gaveCake: 1 }, ["map"]],
    ["Ch1 side: armory keycard", "control", { gotBoxKey: 1, gotKeycard: 1 }, ["map", "keycard"]],
    ["Ch2: crash site", "beach", { fixed: 1, crashed: 1, entered_beach: 1 }, []],
    ["Ch2: ping-pong fight", "pingpong", { metPP: 1 }, []],
    ["Ch2: gas station", "gas", { ppKO: 1 }, []],
    ["Ch2: trade the stones", "gasShop", { metOwner: 1, got_squeegee: 1, got_momStone: 1, got_dadStone: 1, got_wifeStone: 1, got_marketKey: 1 }, ["momStone", "dadStone", "wifeStone", "marketKey"]],
    ["Ch3: road map", "roadmap", { gotJeep: 1, drove: 1, mapAt: "gas" }, ["marketKey"]],
    ["Ch3: secret mansion", "mansion", { choseJeep: 1, mapAt: "mansion" }, ["marketKey"]],
    ["Ch3: supermarket", "marketIn", { marketOpen: 1, mapAt: "market" }, []],
    ["Ch3: scary forest", "forest", { macMoved: 1, ladyFree: 1, metLady: 1, got_hat: 1, mapAt: "forest" }, ["hat"]],
    ["Ch3: swamp, build the scarecrow", "swamp", { woodyMet: 1, got_shirt: 1, got_twigs: 1, got_head: 1, got_straw: 1, statueTold: 1, sawSwamp: 1 }, ["hat", "shirt", "twigs", "straw"]],
    ["Ch3: bring Woody the flower", "forest", { scarecrow: 1, boatTaken: 1, got_flower: 1 }, ["flower"]],
    ["Ch3: the witch", "swamp", { treesAwake: 1, got_robes: 1, mapAt: "swamp" }, ["robes"]],
    ["Ch4: castle rocks", "castle", { witchCaged: 1, mapAt: "castle" }, ["robes"]],
    ["Ch4: gigantic door", "castle", { rocksDone: 1 }, ["robes"]],
    ["Ch4: tea with the wizard", "reception", { wizardOut: 1, inCastle: 1 }, []],
    ["Ch4: wheel of the year hall", "wheelHall", { wizardGone: 1 }, []],
    ["Ch4: the sphinx", "castleUp", { got_chart: 1, wheelStep: 8, stairsUp: 1, stairsSeen: 1, letter_Yule: 1, letter_Ostara: 1, letter_Litha: 1, letter_Mabon: 1 }, ["chart"]],
    ["Ch4: hall of mirrors (no flashlight)", "mirrors", { sphinxPassed: 1 }, ["chart"]],
    ["Ch4: hall of mirrors (with flashlight)", "mirrors", { got_flashlight: 1 }, ["chart", "flashlight"]],
    ["Ch4: blow the trumpet", "mirrors", { chairMoved: 1, got_book: 1, got_mouthpiece: 1, fogClear: 1, got_middle: 1, placed_may: 1, placed_jon: 1, placed_jasin: 1, placed_olivia: 1, got_bell: 1, got_trumpet: 1 }, ["chart", "flashlight", "trumpet"]],
    ["Ch4: the wizard in the atrium", "atrium", { shattered: 1 }, ["chart", "flashlight"]],
    ["Ch4: the end (dogs of darkness)", "atrium", { dogsOut: 1, wizSwamp: 1, witchFree: 1, houseGone: 1, dogsEnd: 1 }, ["chart", "flashlight"]],
  ];
  let flags = { started: 1 };
  return steps.map(([name, room, add, items]) => { flags = { ...flags, ...add }; return { name, room, flags: { ...flags }, items }; });
})();
function debugJump(room, flags, items) {
  stopSpeaking(); dq = []; box.hidden = true; choosing = false;
  if (flags) {
    S.flags = {}; Object.entries(flags).forEach(([k, v]) => (S.flags[k] = v === 1 ? true : v));
    S.items = items.slice(); S.sel = null; S.rockPat = null; S.rockStep = 0;
    Object.keys(built).forEach((k) => delete built[k]);   // rebuild rooms so they match the new story point
    LV_ENTERED.clear();
  }
  // don't replay arrival speeches when jumping
  if (built[room]) built[room].entered = true; else LV_SKIP_ENTER.add(room);
  $("title").hidden = true; save();
  goLevel(room);
}
const LV_ENTERED = new Set(), LV_SKIP_ENTER = new Set();
function initDebug() {
  const pts = $("dbgPoints");
  CHECKPOINTS.forEach((c) => {
    const b = document.createElement("button"); b.textContent = c.name;
    b.onclick = () => debugJump(c.room, c.flags, c.items);
    pts.appendChild(b);
  });
  Object.keys(LV).forEach((id) => { const o = document.createElement("option"); o.value = id; o.textContent = id; $("dbgRoom").appendChild(o); });
  Object.entries(ITEMS).forEach(([id, [ico, n]]) => { const o = document.createElement("option"); o.value = id; o.textContent = ico + " " + n; $("dbgItem").appendChild(o); });
  $("dbgGo").onclick = () => debugJump($("dbgRoom").value);
  $("dbgGive").onclick = () => add($("dbgItem").value, "got_" + $("dbgItem").value);
  $("dbgClose").onclick = () => ($("debug").hidden = true);
  const toggle = () => { $("debug").hidden = !$("debug").hidden; };
  window.addEventListener("keydown", (e) => { if (e.shiftKey && (e.key === "D" || e.key === "d")) { e.preventDefault(); toggle(); } });
  if (/debug/.test(location.hash + location.search)) $("debug").hidden = false;
}

const LEVEL_ORDER = [["hall", "Hallway"], ["hub", "Kitchen + Rec"], ["mays", "May's Room"], ["jons", "Jon's Room"], ["hideout", "Jon's Portal"],
  ["jasins", "Jasin's Room"], ["olivias", "Olivia's Room"], ["playroom", "Playroom"], ["control", "Control Room"], ["engine", "Engine Room"],
  ["storage", "Storage"], ["bath", "Bathroom"], ["beach", "Crash Site"]];
