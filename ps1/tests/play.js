(async () => {
  const M = window.__mk; M.setVoices(false); const w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  const drain = async (pick) => {
    for (let i = 0; i < 80 && M.talking(); i++) {
      const ch = [...document.querySelectorAll('.choice')];
      if (ch.length) { const b = ch.find((c) => c.textContent.includes(pick)) || ch[ch.length - 1]; b.click(); }
      else M.advance();
      await w(60);
    }
  };
  const go = async (id) => { M.goLevel(id); await w(700); await drain(); };
  const hot = (name) => M.L.hots.find((o) => o.userData.hot.name === name)?.userData.hot;
  const use = async (name, item, pick) => {
    const h = hot(name); if (!h) { log.push('MISSING ' + name); return; }
    if (item) M.say(h.use[item]()); else M.act(h);
    await w(80); await drain(pick); await w(800); await drain(pick);
  };
  const step = (n) => log.push(n + ' => ' + M.goal() + (M.sideGoal() ? ' | ' + M.sideGoal() : '') + ' [' + M.S.items.join(',') + ']');
  localStorage.clear();
  M.beginGame(true);
  await w(550);
  log.push('intro: room=' + M.L.id + ' spaceCut=' + M.spaceCut);
  await drain();
  log.push('waiting in space: spaceWait=' + M.spaceWait + ' spaceCut=' + M.spaceCut);
  M.enterShip(); await drain();
  step('start: room=' + M.L.id + ' spaceCut=' + M.spaceCut);
  await go('jons'); await use("Jon's portal (climb in)"); await w(800); await drain(); step('in oval');
  await use('Jon'); step('talked Jon');
  await use('Pile of papers'); step('papers');
  await go('olivias'); await use('Olivia'); step('asked Olivia');
  await go('hub'); await use('Fridge', null, 'Can of tuna'); await use('Fridge', null, 'Moldy cheese'); step('fridge');
  await use('Kitchen drawers', null, 'Can opener'); step('drawers');
  M.combine('opener', 'tuna'); await w(50); await drain(); step('opened tuna');
  await use('Kitchen mouse', 'cheese'); step('mouse');
  await go('hall'); await use('Door to the engine room'); await w(900); await drain(); step('engine room: ' + M.L.id);
  await use("Olivia's memory pills"); step('pills');
  await use('Locked box', 'boxKey'); step('locked box');
  await go('olivias'); await use('Olivia', 'pills'); step('gave pills');
  await use('Flour'); await go('mays'); await use('Sugar'); await go('jasins'); await use('Oil');
  await go('jons'); await use('Cacao'); await go('bath'); await use('Sink'); await go('storage'); await use('Yeast'); step('ingredients');
  await go('hub'); await use('Stove'); step('baked');
  await go('hideout'); await use('Jon', 'cake'); step('gave cake');
  await go('control'); await use('Armory door'); await w(900); await drain(); step('armory: ' + M.L.id);
  await use('Flashlight'); step('flashlight');
  await go('engine'); await use('Jon', 'map'); await w(1200); await drain();
  log.push('storm open: ' + !document.getElementById('astro').hidden);
  await w(2500); await drain(); await w(1500); await drain(); await w(1500); await drain(); step('fixed: ' + M.L.id + ' glowing=' + !!M.S.flags.glowing);
  return log.join('\n');
})()
