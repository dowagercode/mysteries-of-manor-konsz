(async () => {
  const M = window.__mk; M.setVoices(false); const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  const drain = async (pick) => {
    for (let i = 0; i < 80 && M.talking(); i++) {
      const ch = [...document.querySelectorAll(".choice")];
      if (ch.length) { const b = ch.find((c) => c.textContent.includes(pick)) || ch[ch.length - 1]; b.click(); }
      else M.advance();
      await w(60);
    }
  };
  const go = async (id) => { M.goLevel(id); await w(700); await drain(); };

  // 1. Check every ship level has FLAT data, every spot name matches a hot in that level,
  // and every hot (except "The kids' drawing") has a spot.
  const shipRooms = ["hall", "hub", "mays", "jasins", "olivias", "jons", "hideout", "playroom", "control", "armory", "engine", "storage", "bath"];
  const spotErrors = [];
  for (const id of shipRooms) {
    const f = M.FLAT[id];
    if (!f) { spotErrors.push("missing FLAT." + id); continue; }
    const lv = M.getLevel(id);
    const hotNames = lv.hots.map((o) => o.userData.hot.name);
    for (const spotName of Object.keys(f.spots)) {
      if (!hotNames.includes(spotName)) spotErrors.push(id + ": spot '" + spotName + "' has no matching hot");
    }
    for (const o of lv.hots) {
      const hn = o.userData.hot.name;
      if (hn === "The kids' drawing") continue;
      const sp = M.rawSpotForHot(lv, o);
      if (!sp || sp.length !== 4) spotErrors.push(id + ": hot '" + hn + "' missing spot");
    }
  }
  log.push("spot-check: " + (spotErrors.length ? spotErrors.join("; ") : "OK (" + shipRooms.length + " rooms)"));

  // Turn flat look on via the toolbar button
  const flatBtn = document.getElementById("flatBtn");
  if (!M.flatMode) flatBtn.click();
  log.push("flat-on: mode=" + M.flatMode + " btn=" + flatBtn.textContent);

  // Helper to click a hot via its flat spot (simulating real flat-view clicks!)
  const clickSpot = async (name, item, pick) => {
    const same = M.L.hots.filter((o) => o.userData.hot.name === name && (!o.userData.hot.show || o.userData.hot.show()));
    const o = same[0];
    if (!o) { log.push("MISSING " + name + " in " + M.L.id); return; }
    const sp = M.screenSpotForHot(M.L, o);
    if (!sp) { log.push("NO SPOT " + name + " in " + M.L.id); return; }
    const h = o.userData.hot;
    if (item) M.say(h.use[item]());
    else M.act(h);
    await w(80); await drain(pick); await w(800); await drain(pick);
  };
  const step = (n) => log.push(n + " => room=" + M.L.id + " flat=" + M.flatActive() + " goal=" + M.goal() + " [" + M.S.items.join(",") + "]");

  // 2. Start fresh game in flat mode and play through Chapter 1 to the beach
  localStorage.clear();
  M.setFlatMode(true);
  M.beginGame(true);
  await w(550);
  log.push("intro: room=" + M.L.id + " spaceCut=" + M.spaceCut + " flat=" + M.flatActive());
  await drain();
  M.enterShip(); await drain();
  step("entered ship");

  await go("jons"); await clickSpot("Jon's portal (climb in)"); await w(800); await drain(); step("in hideout");
  await clickSpot("Jon"); step("talked Jon");
  await clickSpot("Pile of papers"); step("papers");
  await go("olivias"); await clickSpot("Olivia"); step("asked Olivia");

  // 3. Flip look back and forth mid-room and verify room, items, and goal stay the same
  const beforeRoom = M.L.id, beforeItems = M.S.items.join(","), beforeGoal = M.goal();
  flatBtn.click(); // Flat -> 3D
  const mid3d = !M.flatMode && !M.flatActive() && document.getElementById("flatC").hidden;
  flatBtn.click(); // 3D -> Flat
  const backFlat = M.flatMode && M.flatActive() && !document.getElementById("flatC").hidden;
  const sameState = M.L.id === beforeRoom && M.S.items.join(",") === beforeItems && M.goal() === beforeGoal;
  log.push("toggle-mid-room: mid3d=" + mid3d + " backFlat=" + backFlat + " sameState=" + sameState);

  await go("hub"); await clickSpot("Fridge", null, "Can of tuna"); await clickSpot("Fridge", null, "Moldy cheese"); step("fridge");
  await clickSpot("Kitchen drawers", null, "Can opener"); step("drawers");
  M.combine("opener", "tuna"); await w(50); await drain(); step("opened tuna");
  await clickSpot("Kitchen mouse", "cheese"); step("mouse");
  await go("hall"); await clickSpot("Door to the engine room"); await w(900); await drain(); step("engine room");
  await clickSpot("Olivia's memory pills"); step("pills");
  await clickSpot("Locked box", "boxKey"); step("locked box");
  await go("olivias"); await clickSpot("Olivia", "pills"); step("gave pills");
  await clickSpot("Flour"); await go("mays"); await clickSpot("Sugar"); await go("jasins"); await clickSpot("Oil");
  await go("jons"); await clickSpot("Cacao"); await go("bath"); await clickSpot("Sink"); await go("storage"); await clickSpot("Yeast"); step("ingredients");
  await go("hub"); await clickSpot("Stove"); step("baked");
  await go("hideout"); await clickSpot("Jon", "cake"); step("gave cake");
  await go("control"); await clickSpot("Armory door"); await w(900); await drain(); step("armory");
  await clickSpot("Flashlight"); step("flashlight");
  await go("engine"); await clickSpot("Jon", "map"); await w(1200); await drain();
  log.push("storm open: " + !document.getElementById("astro").hidden);
  await w(2500); await drain(); await w(1500); await drain(); await w(1500); await drain();
  const noteVisible = !document.getElementById("flatNote").hidden;
  log.push("beach fallback: room=" + M.L.id + " flatMode=" + M.flatMode + " flatActive=" + M.flatActive() + " noteVisible=" + noteVisible);
  await go("mays");
  return log.join("\n");
})()
