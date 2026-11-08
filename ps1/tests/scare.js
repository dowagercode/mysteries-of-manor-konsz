(async () => { try {
  const M = window.__mk, w = (ms) => new Promise((r) => setTimeout(r, ms)), log = [];
  M.setVoices(false);
  const texts = [];
  const drain = async (pick) => { for (let i = 0; i < 60 && M.talking(); i++) { const t = document.getElementById('boxText').textContent; if (t && texts[texts.length - 1] !== t) texts.push(t); const ch = [...document.querySelectorAll('.choice')]; if (ch.length) { (ch.find((c) => c.textContent.includes(pick)) || ch[0]).click(); } else M.advance(); await w(60); } };
  const clickItems = async (a, b) => { const btn = (n) => [...document.querySelectorAll('#drawer .item')].find((x) => x.lastChild.textContent === n); btn(a).click(); await w(50); btn(b).click(); await w(100); await drain(); };
  const base = { started: true, crashed: true, fixed: true, ppKO: true, gotJeep: true, drove: true, ladyFree: true, woodyMet: true, sawSwamp: true };
  // A: three parts, combine in the drawer away from the swamp
  Object.assign(M.S, { items: ['hat', 'shirt', 'twigs'], flags: { ...base } }); M.goLevel('forest'); await w(800); await drain();
  await clickItems('Old shirt', 'Bundle of twigs'); log.push('A missing-part hint: ' + texts.pop());
  log.push('A goal: ' + M.goal());
  // B: all four in the forest -> ready-made scarecrow, carried to the swamp and used on the post
  M.S.items.push('straw'); { const f = document.querySelector('#drawer .item'); f.click(); await w(30); document.querySelector('#drawer .item').click(); await w(30); } await clickItems('Straw hat', 'Straw'); log.push('B drawer: [' + M.S.items.join(',') + '] goal: ' + M.goal());
  M.goLevel('swamp'); await w(800); await drain();
  const post = M.L.hots.find((o) => o.userData.hot.name === 'Old post in the fog').userData.hot;
  M.say(post.use.scarecrowKit()); await w(60); await drain('Build'); log.push('B built: scarecrow=' + !!M.S.flags.scarecrow + ' drawer=[' + M.S.items.join(',') + '] goal: ' + M.goal());
  // C: all four parts, just click the post at the swamp
  Object.assign(M.S, { items: ['hat', 'shirt', 'twigs', 'straw'], flags: { ...base } }); M.goLevel('roadmap'); await w(800); await drain(); M.goLevel('swamp'); await w(800); await drain();
  log.push('C goal before: ' + M.goal());
  M.act(M.L.hots.find((o) => o.userData.hot.name === 'Old post in the fog').userData.hot); await w(60); await drain('Build'); log.push('C built: ' + !!M.S.flags.scarecrow);
  // D: combine parts while standing at the swamp
  Object.assign(M.S, { items: ['hat', 'shirt', 'twigs', 'straw'], flags: { ...base } }); M.goLevel('swamp'); await w(800); await drain();
  await clickItems('Old shirt', 'Straw'); log.push('D built in swamp via drawer: ' + !!M.S.flags.scarecrow);
  return log.join('\n');
} catch (e) { return 'ERROR ' + e.message + ' ' + e.stack.split('\n')[1]; } })()
