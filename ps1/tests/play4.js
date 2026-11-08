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
  const go = async (id) => { M.goLevel(id); await w(700); await settle(); };
  const hot = (name) => M.L.hots.find((o) => o.userData.hot.name === name && (!o.userData.hot.show || o.userData.hot.show()))?.userData.hot;
  const use = async (name, item, pick) => {
    const h = hot(name); if (!h) { log.push('MISSING ' + name + ' in ' + M.L.id); return; }
    if (item) { if (!h.use || !h.use[item]) { log.push('NO USE ' + item + ' on ' + name); return; } M.say(h.use[item]()); } else M.act(h);
    await w(80); await drain(pick); await settle(pick); await drain(pick);
  };
  const step = (n) => log.push(n + ' [' + M.L.id + '] => ' + M.goal() + (M.sideGoal() ? ' | ' + M.sideGoal() : '') + ' [' + M.S.items.join(',') + ']');
  Object.assign(M.S, { items: ['robes'], flags: { started: true, crashed: true, fixed: true, drove: true, treesAwake: true, witchCaged: true, statueTold: true, rocksDone: true, scarecrow: true, boatTaken: true, mapAt: 'castle' } });
  await go('castle'); step('castle door');
  await use('Path around behind the castle'); await use('Truck entrance'); step('kitchen');
  await use('Door to the reception hall'); step('kitchen door before');
  await use('Truck entrance'); await use('Path back to the front'); step('front');
  await use('Gigantic front door', 'robes'); await settle(); step('after door');
  await settle(); step('tea done');
  await use('Spiral staircase up'); step('wheel hall');
  const room = async (n) => { await use(`Door to the ${n} room`); if (M.L.id !== 'wh_' + n) log.push('NOT IN ' + n); };
  const back = async () => { await use('Door back to the hall'); await w(700); await settle(); };
  await room('Yule'); await use('Glowing letter'); await back(); step('wrong order Yule step=' + M.S.flags.wheelStep);
  await room('Samhain'); await use('Closet'); log.push('peek=' + !document.getElementById('peek').hidden); document.getElementById('peek').hidden = true; await back(); step('chart');
  for (const n of ['Yule', 'Imbolc', 'Ostara', 'Beltane', 'Litha', 'Lughnasadh', 'Mabon']) { await room(n); if (hot('Glowing letter')) await use('Glowing letter'); await back(); }
  step('stairs=' + M.S.flags.stairsUp + ' seen=' + M.S.flags.stairsSeen);
  await use('Staircase up'); step('sphinx');
  await use('Sphinx', null, 'A rock'); step('wrong answer');
  await use('Sphinx', null, 'A seed'); step('passed');
  await use('Door to the hall of mirrors'); step('mirrors');
  await use('Mirror marked PRESENT'); step('present no light');
  await use('Mirror back to the hall'); await use('Mirror marked FUTURE'); step('future no light');
  M.S.items.push('flashlight'); M.S.flags.got_flashlight = true;
  await use('Mirror back to the hall'); await use('Mirror marked PAST'); step('past');
  await use('Giant table'); await use('Giant chair'); await use('Giant chair'); await use('Giant picture book'); await use('Giant chair'); step('cookie');
  await use('Mirror back to the hall'); await use('Mirror marked PRESENT');
  await use('Thick fog', 'flashlight'); await use('Owl', null, 'Socks'); await use('Owl', null, 'Footsteps'); step('owl');
  await use('Mirror back to the hall'); await use('Mirror marked FUTURE'); step('future');
  for (const s of ['Stone hair bow', 'Stone portal disk', 'Stone soccer ball', 'Stone tutu']) await use(s);
  await use('Tall statue with spiky hair', 'stoneBow'); step('wrong statue');
  await use('Tall statue with buns in her hair', 'stoneBow'); await use('Tall statue with spiky hair', 'stoneDisk');
  await use('Tall statue with messy hair', 'stoneBall'); await use('Tall statue with long hair', 'stoneTutu'); step('statues');
  await use('Mirror back to the hall'); await use('Giant mirror', 'trumpet'); await w(800); await settle('No way'); step('atrium');
  for (let i = 0; i < 6; i++) { await w(700); await settle(); }
  step('dogs room=' + M.L.id + ' houseGone=' + M.S.flags.houseGone + ' dogsBeaten=' + M.S.flags.dogsBeaten);
  return log.join('\n');
} catch (e) { return 'ERROR ' + e.message + ' | ' + e.stack.split('\n').slice(1, 3).join(' '); } })()
