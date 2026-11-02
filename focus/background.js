// Critical Focus: strict mode for your Critical plan.
// From plan time on a school day until the plan is done:
//  - TikTok is blocked, and any TikTok tab gets closed.
//  - If you open TikTok (or have it open at plan time), Critical opens full screen on your chosen
//    screen and stays there: minimise it, leave full screen, close it or wander off to another site
//    and it comes straight back.
// It lets go when Critical says today's plan is done, at screens-off time, or if you use the
// "let me off today" exit (which is slow on purpose).

const CRIT = 'https://u23bodwells-cmyk.github.io/Critical/critical.html';
const CRIT_ORIGIN = 'https://u23bodwells-cmyk.github.io/Critical/';
const TT_MATCH = ['*://*.tiktok.com/*', '*://tiktok.com/*'];
const RULE_ID = 1;
const CLAUDE = 'https://claude.ai/new';
const SOUNDCLOUD = 'https://soundcloud.com/';

function ymd(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function at(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); }
function isSchoolDay(d = new Date()) { const g = d.getDay(); return g >= 1 && g <= 5; }

async function load() {
  const s = await chrome.storage.local.get(['status', 'lock', 'winId', 'screen', 'music', 'strict', 'skip', 'layout']);
  return {
    status: s.status && s.status.d === ymd() ? s.status : null,
    locked: !!(s.lock && s.lock.d === ymd()),
    winId: s.winId || null,
    screen: typeof s.screen === 'number' ? s.screen : 2,
    music: typeof s.music === 'number' ? s.music : 0,
    layout: s.layout && s.layout.d === ymd() ? s.layout : null,
    strict: !!s.strict,
    skipped: !!(s.skip && s.skip.d === ymd())
  };
}

// Is now inside today's "do your plan" window?
function windowInfo(st) {
  const due = st.status && st.status.due ? st.status.due : at(17, 30);
  const end = st.status && st.status.end ? st.status.end : at(21, 30);
  const done = !!(st.status && st.status.done);
  const now = Date.now();
  return { due, end, done, inWindow: isSchoolDay() && !st.skipped && !done && now >= due && now < end };
}

async function setBlock(on) {
  const add = on ? [{
    id: RULE_ID, priority: 1,
    action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { urlFilter: '||tiktok.com', resourceTypes: ['main_frame'] }
  }] : [];
  try { await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID], addRules: add }); } catch (e) { console.warn(e); }
}

async function closeTikTok() {
  const tabs = await chrome.tabs.query({ url: TT_MATCH });
  const blocked = await chrome.tabs.query({ url: chrome.runtime.getURL('blocked.html') + '*' });
  const ids = tabs.concat(blocked).map(t => t.id);
  if (ids.length) { try { await chrome.tabs.remove(ids); } catch (e) {} }
  return ids.length;
}

async function pickDisplay(screen) {
  const ds = await chrome.system.display.getInfo();
  ds.sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top);
  return ds[Math.max(0, Math.min(screen, ds.length - 1))];
}

// A tab in the locked window that isn't Critical: links (like Seneca, or homework links from another app)
// move to their own window so you can still use them; empty new tabs and TikTok just close.
async function moveOrClose(t) {
  const u = t.pendingUrl || t.url || '';
  const blank = !u || u.startsWith('chrome://newtab') || u === 'about:blank' || u.startsWith('chrome://new-tab-page');
  try {
    if (!blank && !/tiktok\.com/.test(u)) await chrome.windows.create({ tabId: t.id, focused: true });
    else await chrome.tabs.remove(t.id);
  } catch (e) {}
}

let busy = false;
async function ensureCritical(st) {
  if (busy) return; busy = true;
  try {
    let w = null;
    if (st.winId) { try { w = await chrome.windows.get(st.winId, { populate: true }); } catch (e) { w = null; } }
    if (!w) {
      const disp = await pickDisplay(st.screen), b = st.layout ? st.layout.crit : disp.workArea;
      w = await chrome.windows.create({ url: CRIT + '#focus', left: b.left, top: b.top, width: b.width, height: b.height, focused: true, type: 'normal' });
      await chrome.storage.local.set({ winId: w.id });
      if (!st.layout) { try { await chrome.windows.update(w.id, { state: 'fullscreen' }); } catch (e) {} }
      return;
    }
    // keep only Critical in that window
    const tabs = w.tabs || [];
    let crit = tabs.find(t => (t.url || t.pendingUrl || '').startsWith(CRIT_ORIGIN));
    for (const t of tabs) if (!crit || t.id !== crit.id) await moveOrClose(t);
    if (!crit) { await chrome.tabs.create({ windowId: w.id, url: CRIT + '#focus', active: true }); }
    if (st.layout) { if (w.state === 'minimized') { try { await chrome.windows.update(w.id, { state: 'normal' }); await chrome.windows.update(w.id, Object.assign({ focused: true }, st.layout.crit)); } catch (e) {} } }
    else if (w.state !== 'fullscreen') { try { await chrome.windows.update(w.id, { state: 'fullscreen', focused: true }); } catch (e) {} }
  } finally { busy = false; }
}

// While locked, look at the Critical window every second and a half (this also keeps the extension awake).
let guardTimer = null;
function startGuard() { if (!guardTimer) guardTimer = setInterval(() => guard().catch(() => {}), 1500); }
function stopGuard() { if (guardTimer) { clearInterval(guardTimer); guardTimer = null; } }

async function lockNow(reason) {
  const st = await load();
  if (!windowInfo(st).inWindow) return false;
  const was = st.locked;
  await chrome.storage.local.set({ lock: { d: ymd(), why: reason } });
  st.locked = true;
  await setBlock(true);
  await closeTikTok();
  await ensureCritical(st);
  startGuard();
  if (!was) {
    chrome.notifications.create('lock', { type: 'basic', iconUrl: 'icon128.png', title: 'Critical first', message: 'TikTok is closed until today\'s plan is done. Critical is on your screen.', priority: 2 });
  }
  return true;
}

async function release(why) {
  stopGuard();
  const st = await load();
  await setBlock(false);
  const wasLocked = st.locked;
  await chrome.storage.local.remove(['lock']);
  if (st.winId) {
    try { await chrome.windows.update(st.winId, { state: 'maximized' }); } catch (e) {}
    await chrome.storage.local.remove(['winId']);
  }
  if (wasLocked && why) chrome.notifications.create('free', { type: 'basic', iconUrl: 'icon128.png', title: why === 'done' ? 'Plan done. You\'re free!' : 'Critical Focus is off for today', message: why === 'done' ? 'TikTok is unblocked. Nice work.' : 'TikTok is unblocked.', priority: 1 });
}

// "Open Critical": close TikTok, put Critical (left) and Claude (right) on your study screen, SoundCloud on your music screen.
async function moveTab(tabId, b, focused) {
  const t = await chrome.tabs.get(tabId), w = await chrome.windows.get(t.windowId, { populate: true });
  if (w.tabs.length === 1) { await chrome.windows.update(w.id, { state: 'normal' }); await chrome.windows.update(w.id, Object.assign({ focused: !!focused }, b)); return w.id; }
  const nw = await chrome.windows.create(Object.assign({ tabId, focused: !!focused }, b)); return nw.id;
}
async function setup(senderTabId) {
  const st = await load();
  await closeTikTok();
  const ds = await chrome.system.display.getInfo(); ds.sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top);
  const study = ds[Math.max(0, Math.min(st.screen, ds.length - 1))].workArea, music = ds[Math.max(0, Math.min(st.music, ds.length - 1))].workArea;
  const cw = Math.round(study.width * 0.62);
  const critB = { left: study.left, top: study.top, width: cw, height: study.height };
  const clB = { left: study.left + cw, top: study.top, width: study.width - cw, height: study.height };
  const musB = { left: music.left, top: music.top, width: music.width, height: music.height };
  // Critical
  let winId = null;
  if (st.winId) { try { await chrome.windows.get(st.winId); winId = st.winId; await chrome.windows.update(winId, { state: 'normal' }); await chrome.windows.update(winId, Object.assign({ focused: true }, critB)); } catch (e) { winId = null; } }
  if (!winId) {
    let tab = null;
    if (senderTabId) { try { tab = await chrome.tabs.get(senderTabId); } catch (e) {} }
    if (!tab) tab = (await chrome.tabs.query({ url: CRIT_ORIGIN + '*' }))[0];
    if (tab) winId = await moveTab(tab.id, critB, true);
    else winId = (await chrome.windows.create(Object.assign({ url: CRIT, focused: true }, critB))).id;
  }
  await chrome.storage.local.set({ winId, layout: { d: ymd(), crit: critB } });
  // Claude
  const cl = (await chrome.tabs.query({ url: 'https://claude.ai/*' }))[0];
  try { if (cl) await moveTab(cl.id, clB, false); else await chrome.windows.create(Object.assign({ url: CLAUDE, focused: false }, clB)); } catch (e) { console.warn(e); }
  // SoundCloud (an open SoundCloud tab is moved, so your music keeps playing)
  const sc = (await chrome.tabs.query({ url: ['*://soundcloud.com/*', '*://*.soundcloud.com/*'] }))[0];
  try { const mid = sc ? await moveTab(sc.id, musB, false) : (await chrome.windows.create(Object.assign({ url: SOUNDCLOUD, focused: false }, musB))).id; await chrome.windows.update(mid, { state: 'maximized' }); } catch (e) { console.warn(e); }
  try { await chrome.windows.update(winId, { focused: true }); } catch (e) {}
  check();
  return true;
}
chrome.commands.onCommand.addListener(c => { if (c === 'open-critical') setup(null); });

// The regular check (every 30 seconds while Chrome is open)
async function check() {
  const st = await load(), wi = windowInfo(st);
  if (!wi.inWindow) {
    if (st.locked || (await chrome.declarativeNetRequest.getDynamicRules()).length) await release(wi.done ? 'done' : (st.skipped ? 'skip' : ''));
    return;
  }
  await setBlock(true);
  const tt = await chrome.tabs.query({ url: TT_MATCH });
  if (st.locked || tt.length || st.strict) { await lockNow(st.strict && !tt.length ? 'plan time' : 'tiktok'); return; }
}

chrome.runtime.onInstalled.addListener(() => { chrome.alarms.create('tick', { periodInMinutes: 0.5 }); check(); });
chrome.runtime.onStartup.addListener(() => { chrome.alarms.create('tick', { periodInMinutes: 0.5 }); check(); });
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'tick') check(); });

// Opening TikTok during plan time
chrome.tabs.onUpdated.addListener(async (id, info, tab) => {
  const url = info.url || '';
  const st = await load();
  if (/^https?:\/\/([^/]*\.)?tiktok\.com\//.test(url)) { if (windowInfo(st).inWindow) lockNow('tiktok'); return; }
  // Wandering off from Critical in the locked window
  if (st.locked && st.winId && tab.windowId === st.winId && url && !url.startsWith(CRIT_ORIGIN) && !url.startsWith(chrome.runtime.getURL(''))) {
    try { await chrome.tabs.update(id, { url: CRIT + '#focus' }); } catch (e) {}
  }
});
chrome.tabs.onCreated.addListener(async tab => {
  const st = await load();
  if (st.locked && st.winId && tab.windowId === st.winId) setTimeout(async () => { try { tab = await chrome.tabs.get(tab.id); } catch (e) { return; } if (tab.windowId === st.winId) { const w = await chrome.windows.get(st.winId, { populate: true }).catch(() => null); const crit = w && w.tabs.find(t => (t.url || t.pendingUrl || '').startsWith(CRIT_ORIGIN) && t.id !== tab.id); if (crit) await moveOrClose(tab); } ensureCritical(await load()); }, 400);
});
// Minimising, leaving full screen, or closing the Critical window
async function guard() {
  const st = await load();
  if (!st.locked) { stopGuard(); return; }
  if (!windowInfo(st).inWindow) { await release(windowInfo(st).done ? 'done' : ''); return; }
  await ensureCritical(st);
}
chrome.windows.onFocusChanged.addListener(() => setTimeout(guard, 250));
chrome.windows.onBoundsChanged.addListener(w => { setTimeout(guard, 250); });
chrome.windows.onRemoved.addListener(async id => {
  const st = await load();
  if (st.locked && id === st.winId) { await chrome.storage.local.remove(['winId']); setTimeout(guard, 400); }
});

// Messages from Critical (the app tells us your plan time and when today's plan is done)
chrome.runtime.onMessageExternal.addListener((msg, sender, reply) => {
  (async () => {
    if (!sender.url || !sender.url.startsWith(CRIT_ORIGIN) || !msg) { reply({ ok: false }); return; }
    if (msg.type === 'setup') { await setup(sender.tab && sender.tab.id); reply({ ok: true }); return; }
    if (msg.type !== 'status') { reply({ ok: false }); return; }
    const status = { d: ymd(), due: +msg.due || null, end: +msg.end || null, done: !!msg.done, hw: !!msg.hw, at: Date.now() };
    await chrome.storage.local.set({ status });
    const st = await load(), wi = windowInfo(st);
    if (status.done && st.locked) await release('done');
    else check();
    reply({ ok: true, locked: st.locked && !status.done, inWindow: wi.inWindow, strict: st.strict, version: chrome.runtime.getManifest().version });
  })();
  return true;
});

// Messages from our own pages (blocked page, settings)
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    if (msg.type === 'blocked') { const ok = await lockNow('tiktok'); if (!ok) { await setBlock(false); } reply({ ok }); return; }
    if (msg.type === 'info') { const st = await load(); const ds = await chrome.system.display.getInfo(); ds.sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top);
      reply({ st, wi: windowInfo(st), displays: ds.map(d => ({ name: d.name, w: d.bounds.width, h: d.bounds.height, primary: d.isPrimary })) }); return; }
    if (msg.type === 'screen') { await chrome.storage.local.set({ screen: msg.screen }); reply({ ok: true }); return; }
    if (msg.type === 'music') { await chrome.storage.local.set({ music: msg.screen }); reply({ ok: true }); return; }
    if (msg.type === 'setup') { await setup(null); reply({ ok: true }); return; }
    if (msg.type === 'strict') { await chrome.storage.local.set({ strict: !!msg.on }); check(); reply({ ok: true }); return; }
    if (msg.type === 'test') { const disp = await pickDisplay(msg.screen), b = disp.workArea; const w = await chrome.windows.create({ url: CRIT, left: b.left, top: b.top, width: b.width, height: b.height, focused: true });
      setTimeout(() => chrome.windows.remove(w.id).catch(() => {}), 4000); reply({ ok: true }); return; }
    if (msg.type === 'skip') { await chrome.storage.local.set({ skip: { d: ymd() } }); await release('skip'); reply({ ok: true }); return; }
    reply({ ok: false });
  })();
  return true;
});
