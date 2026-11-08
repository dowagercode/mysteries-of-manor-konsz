(async () => {
  const M = window.__mk, w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  M.setVoices(false);
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
    const h = hot(name); if (!h) { log.push('MISSING ' + name + ' in ' + M.L.id); return; }
    if (item) M.say(h.use[item]()); else M.act(h);
    await w(80); await drain(pick); await w(700); await drain(pick);
  };
  const step = (n) => log.push(n + ' => ' + M.goal() + (M.sideGoal() ? ' | ' + M.sideGoal() : '') + ' [' + M.S.items.join(',') + ']');
  Object.assign(M.S, { items: [], flags: { started: true, crashed: true, fixed: true } });
  await go('beach'); step('beach');
  await use('Path to the mountain'); await w(700); await drain(); step('mountain: ' + M.L.id);
  await use('Jasin', null, 'Kick'); step('wrong move (jasin first)');
  await use('Jon', null, 'Hide'); step('jon portal');
  await use('Jasin', null, 'Kick'); step('jasin fireball');
  await use('Olivia', null, 'Spin'); step('olivia float');
  await use('May', null, 'Grab'); step('may bonk');
  await use('Path down to the gas station'); await w(700); await drain(); step('gas: ' + M.L.id);
  await use('Squeegee'); await use('Windshield washer container', 'squeegee'); step('mom stone');
  await use('Door into the gas station'); await w(700); await drain();
  await use('Skeleton owner'); step('met owner in ' + M.L.id);
  await use('Magazine rack', null, 'Local Rocks'); step('dad stone');
  await use('Door to the restroom'); await w(700); await drain();
  await use('Sink cupboard'); await use('Toilet'); step('wife stone + key in ' + M.L.id);
  await use('Door back to the shop'); await w(700); await drain();
  await use('Skeleton owner'); step('traded');
  await use('Door outside'); await w(700); await drain();
  await use('The creepy jeep'); step('drove');
  return log.join('\n');
})()
