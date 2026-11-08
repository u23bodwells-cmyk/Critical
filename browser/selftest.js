'use strict';
// Run with:  electron . --self-test
// Opens the real browser window and checks the important things work, then exits (0 = all passed).
// Results go to selftest.log as GitHub annotations so the build page shows them.
const { webContents } = require('electron');
const fs = require('fs');
const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async function run(ctx) {
  const { win, setStatus, blockedReason, publicState } = ctx;
  const V = ctx.backup ? 'Backup ' : '', SUF = ctx.backup ? '-backup' : '';
  const res = [], log = [];
  const ok = (name, cond, info) => { res.push({ name, ok: !!cond, info: info == null ? '' : String(info).slice(0, 160) }); };
  const ui = (js) => win.webContents.executeJavaScript(js);
  async function until(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(400); } try { return await fn(); } catch (e) { return null; } }
  function guest(prefix) { return webContents.getAllWebContents().find((w) => { try { return w.getType() === 'webview' && w.getURL().startsWith(prefix); } catch (e) { return false; } }); }
  async function guestEval(prefix, js, ms) { return until(async () => { const w = guest(prefix); return w ? w.executeJavaScript(js) : null; }, ms || 8000); }

  // 1. the block list (plan not done yet)
  ok('blocks tiktok.com', blockedReason('https://www.tiktok.com/@someone') === 'TikTok');
  ok('blocks vm.tiktok.com', !!blockedReason('https://vm.tiktok.com/ZM123/'));
  ok('blocks m.facebook.com', !!blockedReason('https://m.facebook.com/'));
  ok('blocks instagram', !!blockedReason('https://www.instagram.com/reels/'));
  ok('blocks YouTube Shorts', blockedReason('https://www.youtube.com/shorts/aqz-KE-bpKQ') === 'YouTube Shorts');
  ok('allows normal YouTube', !blockedReason('https://www.youtube.com/watch?v=aqz-KE-bpKQ'));
  ok('allows wikipedia', !blockedReason('https://en.wikipedia.org/wiki/Nuclear_reactor'));
  ok('no false match (notfacebook.com)', !blockedReason('https://notfacebook.com/'));

  // 2. the window
  win.show();
  const ready = await until(() => ui('!!window.CB'), 20000); ok('browser window ready', ready);
  const crit = await until(async () => { const u = await ui('CB.tabUrl(0)'); return /u23bodwells-cmyk\.github\.io\/Critical\//.test(u) ? u : null; }, 25000);
  ok('Critical opens in the first tab', crit, crit || await ui('CB.tabUrl(0)'));

  // 3. blocked sites show the blocked page
  await ui('CB.openTab("https://www.tiktok.com/")');
  const b1 = await until(async () => { const u = await ui('CB.activeUrl()'); return u.startsWith('critical://app/blocked') ? u : null; }, 12000);
  ok('TikTok tab shows the blocked page', b1, b1 || await ui('CB.activeUrl()'));
  const bt = await guestEval('critical://app/blocked', 'document.getElementById("h").textContent', 8000);
  ok('blocked page names the site', /TikTok/.test(bt || ''), bt);
  await ui('CB.openTab("https://www.youtube.com/shorts/aqz-KE-bpKQ")');
  const b2 = await until(async () => { const u = await ui('CB.activeUrl()'); return u.startsWith('critical://app/blocked') ? u : null; }, 12000);
  ok('YouTube Shorts tab shows the blocked page', b2, b2 || await ui('CB.activeUrl()'));

  // 4. normal sites load
  await ui('CB.openTab("https://en.wikipedia.org/wiki/Nuclear_reactor")');
  const wt = await until(async () => { const t = await ui('CB.activeTitle()'); return /reactor/i.test(t) ? t : null; }, 20000);
  ok('Wikipedia loads normally', wt, wt || await ui('CB.activeUrl()'));

  // 5. new tab page talks to the browser
  await ui('CB.openTab()');
  const nt = await guestEval('critical://app/newtab', 'document.getElementById("sH").textContent', 10000);
  ok('new tab page shows plan status', nt && !/Checking/.test(nt), nt);

  // 6. Claude panel
  await ui('CB.toggleClaude(true)');
  const cu = await until(async () => { const u = await ui('CB.claudeUrl()'); return /claude\.ai/.test(u) ? u : null; }, 20000);
  ok('Claude panel opens claude.ai', cu, cu || await ui('CB.claudeUrl()'));

  // 7. does Critical report today's plan? (needs the latest Critical on GitHub Pages)
  const known = await until(() => publicState().known, 15000);
  { const ps = publicState(); log.push('::notice title=' + V + 'Critical sync flags::locked=' + ps.critLocked + ' sync=' + ps.critSync); }
  log.push('::notice title=' + V + 'Critical status::' + (known ? 'Critical reported today\'s plan to the browser' : 'Critical has not reported a plan status yet (GitHub Pages may still be deploying)'));

  // 8. lock screen renders
  await ui('CB.lock()');
  const lk = await until(() => ui('(function(){var l=document.getElementById("lock");return l&&!l.hidden?l.innerText:""})()'), 4000);
  ok('plan-time lock screen shows', /plan time/i.test(lk || ''), (lk || '').split('\n')[0]);
  await ui('document.getElementById("lock").hidden=true');

  // backup copy: shows it's the backup, starts without Windows, never updates
  if (ctx.backup) {
    ok('backup badge shows', await ui('CB.badge()'));
    ok('backup does not start with Windows', publicState().autostart === false);
    const upd = await ui('cbHost.checkUpdates()');
    ok('backup never updates itself', upd && upd.ok === false && /Backup/.test(upd.why || ''), upd && upd.why);
  }

  // 9. screenshot of the window
  try { await ui('CB.openTab()'); await sleep(1500); const img = await win.capturePage(); fs.writeFileSync(path.join(process.cwd(), 'selftest' + SUF + '.png'), img.toPNG()); ok('screenshot captured', !img.isEmpty(), img.getSize().width + 'x' + img.getSize().height); } catch (e) { ok('screenshot captured', false, e.message); }

  // 10. finishing the plan unlocks everything (and the open blocked page notices)
  setStatus({ type: 'status', done: true, due: null, end: null, lessons: 3, left: 0, mins: 0 });
  await sleep(800);
  ok('plan done unlocks TikTok', !blockedReason('https://www.tiktok.com/'));
  ok('plan done unlocks Shorts', !blockedReason('https://www.youtube.com/shorts/x'));
  const un = await guestEval('critical://app/blocked', 'document.getElementById("h").textContent', 5000);
  ok('blocked page updates to unlocked', /unlocked/i.test(un || ''), un);
  try { const img = await win.capturePage(); fs.writeFileSync(path.join(process.cwd(), 'selftest' + SUF + '-done.png'), img.toPNG()); } catch (e) {}

  const pass = res.filter((r) => r.ok).length, fail = res.filter((r) => !r.ok);
  log.unshift('::notice title=' + V + 'Self-test::' + pass + '/' + res.length + ' checks passed');
  log.push('::notice title=' + V + 'Passed::' + res.filter((r) => r.ok).map((r) => r.name).join(' | ').slice(0, 900));
  fail.slice(0, 9).forEach((r) => log.push('::error title=' + V + 'Self-test failed::' + r.name + (r.info ? ' → ' + r.info.replace(/[\r\n]+/g, ' ') : '')));
  const out = log.join('\n') + '\n' + res.map((r) => (r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.info ? '  [' + r.info + ']' : '')).join('\n') + '\n';
  try { fs.writeFileSync(path.join(process.cwd(), 'selftest.log'), out); } catch (e) {}
  console.log(out);
  return fail.length === 0;
};
