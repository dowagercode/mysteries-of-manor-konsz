// Chapter 5: dogs (with dog food), the apprentice, the chase, the music maze, the wedding, going home.
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
  const settle = async (pick) => { for (let i = 0; i < 40 && (M.busy || M.talking()); i++) { await drain(pick); await w(150); } await w(400); };
  const go = async (id, pick) => { M.goLevel(id); await w(700); await settle(pick); };
  const hot = (name) => M.L.hots.find((o) => o.userData.hot.name === name && (!o.userData.hot.show || o.userData.hot.show()))?.userData.hot;
  const use = async (name, item, pick) => {
    const h = hot(name); if (!h) { log.push('MISSING ' + name + ' in ' + M.L.id); return; }
    if (item) { if (!h.use || !h.use[item]) { log.push('NO USE ' + item + ' on ' + name); return; } M.say(h.use[item]()); } else M.act(h);
    await w(80); await drain(pick); await settle(pick); await drain(pick);
  };
  const map = async (node) => { await use(node); await w(2200); await settle(); };
  const step = (n) => log.push(n + ' [' + M.L.id + '] => ' + M.goal() + (M.sideGoal() ? ' | ' + M.sideGoal() : '') + ' [' + M.S.items.join(',') + ']');
  Object.assign(M.S, { items: [], flags: { started: true, crashed: true, fixed: true, gotJeep: true, drove: true, ladyFree: true, metLady: true, woodyMet: true, treesAwake: true, witchCaged: true, statueTold: true, rocksDone: true,
    scarecrow: true, boatTaken: true, mapAt: 'castle', wizardOut: true, inCastle: true, wizardGone: true, stairsUp: true, sphinxPassed: true, shattered: true, got_robes: true, choseJeep: true } });
  // get the dog food from the mansion kitchen first
  await go('roadmap'); await map('Secret mansion'); step('mansion outside');
  await use('Front door of the mansion'); await use('Right'); await use('Can of dog food'); step('dog food');
  await use('Back to the hall'); await use('Front door'); await use('Back to the jeep'); await map("Wizard's castle");
  await go('atrium', 'No way'); for (let i = 0; i < 6; i++) { await w(600); await settle('No way'); }
  step('dogs');
  await use('Dog of darkness', null, 'dog food'); step('dogs fed');
  await use('Emergency exit slide'); step('slid out');
  await use('Back to the jeep'); await map('Swamp'); step('swamp: house gone=' + !hot("Witch's house") + ' spot=' + !!hot("Where the witch's house stood"));
  await use("Where the witch's house stood");
  await use('Apprentice', null, 'rower'); step('wrong compliment');
  await use('Apprentice', null, 'too nice'); step('apprentice joined');
  await use('Back to the jeep'); await map('Gas station'); step('wrong place');
  await use('The creepy jeep'); await map('Scary forest'); step('catch 1');
  await use('Back to the jeep'); await map('Gas station'); step('catch 2');
  await use('The creepy jeep'); await map('Secret mansion'); step('catch 3');
  await use('Front door of the mansion'); await use('Door to the music hall'); step('music hall');
  await use('Map of notes'); document.getElementById('peek').hidden = true; step('song map');
  await use('Do bar'); await use('La bar'); step('wrong note: step=' + M.S.flags.songStep);
  for (const n of ['Do', 'Do', 'So', 'So', 'La', 'La', 'So', 'Fa', 'Fa', 'Mi', 'Mi', 'Re', 'Re', 'Do']) await use(`${n} bar`);
  step('song: done=' + M.S.flags.songDone);
  await use('Staircase up'); step('top');
  await use('Wizard', null, 'marry'); await settle('marry'); for (let i = 0; i < 6; i++) { await w(600); await settle('marry'); }
  step('end room=' + M.L.id + ' married=' + M.S.flags.married + ' theEnd=' + M.S.flags.theEnd);
  return log.join('\n');
} catch (e) { return 'ERROR ' + e.message + ' | ' + e.stack.split('\n').slice(1, 3).join(' '); } })()
