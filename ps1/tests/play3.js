(async () => { try {
  const M = window.__mk, w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  M.setVoices(false);
  const drain = async (pick) => {
    for (let i = 0; i < 90 && M.talking(); i++) {
      const ch = [...document.querySelectorAll('.choice')];
      if (ch.length) { const b = ch.find((c) => c.textContent.includes(pick)) || ch[ch.length - 1]; b.click(); }
      else M.advance();
      await w(60);
    }
  };
  const settle = async () => { for (let i = 0; i < 40 && (M.busy || M.talking()); i++) { await drain(); await w(150); } await w(400); };
  const go = async (id) => { M.goLevel(id); await w(700); await drain(); };
  const hot = (name) => M.L.hots.find((o) => o.userData.hot.name === name && (!o.userData.hot.show || o.userData.hot.show()))?.userData.hot;
  const use = async (name, item, pick) => {
    const h = hot(name); if (!h) { log.push('MISSING ' + name + ' in ' + M.L.id); return; }
    if (item) M.say(h.use[item]()); else M.act(h);
    await w(80); await drain(pick); await settle(); await drain(pick);
  };
  const step = (n) => log.push(n + ' [' + M.L.id + '] => ' + M.goal() + (M.sideGoal() ? ' | ' + M.sideGoal() : '') + ' [' + M.S.items.join(',') + ']');
  Object.assign(M.S, { items: ['marketKey'], flags: { started: true, crashed: true, fixed: true, ppKO: true, metPP: true, metOwner: true, gotJeep: true, drove: true, got_marketKey: true } });
  await go('roadmap'); step('road map');
  await use('Secret mansion'); await use('Front door of the mansion'); step('mansion');
  await use('Left'); await use('Mean dog'); step('dog -> ran to');
  await go('roadmap'); await use('Scary forest'); step('forest locked?');
  await use('Closed supermarket'); step('market');
  await use('Supermarket door'); step('inside');
  await use('Pile of ramen'); step('ramen before box');
  await use('Mac and cheese box', null, 'Move'); step('moved box');
  await use('Pile of ramen', null, 'telekinesis'); await w(3000); step('lifted');
  await use('Straw hat'); await use('Shopkeeper lady'); step('lady');
  await go('roadmap'); await use('Scary forest'); step('forest');
  const eyes = M.L.hots.filter((o) => o.userData.hot.name === 'Eyes in the dark');
  for (const e of eyes.slice(0, 2)) { M.act(e.userData.hot); await drain(); }
  await w(300); await use('Woody'); step('woody');
  await use('Old shirt'); await use('Bundle of twigs'); await use('Big tree with a hole', null, 'telekinesis'); step('forest items');
  await use('Footpath to the swamp'); step('field');
  await use('Straw'); await use('Headless statue', 'head'); step('statue');
  await use('Into the swamp'); step('swamp on foot');
  await use('Apprentice'); await use('Old post in the fog', null, 'Build'); step('scarecrow');
  await use("The apprentice's boat"); step('rowed to');
  await use('Space flower', null, 'Take'); step('flower');
  await use('Boat: leave the ship'); await use('Back to the field'); await use('Footpath back to the forest'); step('back in');
  await use('Woody', 'flower'); await w(2800); step('trees');
  await use('Back to the jeep'); await use('Swamp'); step('swamp by jeep');
  await use('Clothesline'); await use("Witch's house"); step('witch up');
  await use('Back to the jeep'); step('try to leave');
  await use("Witch's house", null, 'Jasin'); step('witch caged');
  await use('Back to the jeep'); await use("Wizard's castle"); step('castle');
  const rocks = () => M.L.hots.filter((o) => o.userData.hot.name === 'Rock' && o.userData.hot.show()).sort((a, b) => a.position.x - b.position.x);
  const wrong = (M.S.rockPat[0] + 1) % 3;
  M.act(rocks()[wrong].userData.hot); await drain(); step('wrong rock');
  for (let r = 0; r < 3; r++) { const col = M.S.rockPat[r]; M.act(rocks()[col].userData.hot); await drain(); await w(100); }
  step('rocks done');
  await use('Gigantic front door', 'robes'); step('door');
  await go('castle'); await use('Path around behind the castle'); await use('Truck entrance'); step('truck entrance');
  return log.join('\n');
} catch (e) { return 'ERROR ' + e.message + ' | ' + e.stack.split('\n').slice(1,3).join(' ') + '\nSO FAR:\n' + (typeof log !== 'undefined' ? '' : ''); } })()
