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
const CLAUDE_APP = 'claude://claude.ai/new';
const SOUNDCLOUD = 'https://soundcloud.com/';

function ymd(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function at(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); }
const DEFAULT_DAYS = [false, true, true, true, true, true, false];   // Sun..Sat: Monday to Friday only
function isOnDay(days, d = new Date()) { return !!(days || DEFAULT_DAYS)[d.getDay()]; }

async function load() {
  const s = await chrome.storage.local.get(['status', 'lock', 'winId', 'critTab', 'screen', 'music', 'strict', 'skip', 'layout', 'claude', 'days', 'level', 'lastForce', 'focusShown']);
  return {
    status: s.status && s.status.d === ymd() ? s.status : null,
    locked: !!(s.lock && s.lock.d === ymd()),
    winId: s.winId || null,
    critTab: s.critTab || null,
    screen: typeof s.screen === 'number' ? s.screen : 2,
    music: typeof s.music === 'number' ? s.music : 0,
    claude: s.claude === 'web' ? 'web' : 'app',
    days: Array.isArray(s.days) && s.days.length === 7 ? s.days : DEFAULT_DAYS,
    layout: s.layout && s.layout.d === ymd() ? s.layout : null,
    strict: !!s.strict,
    level: ['gentle', 'firm', 'harsh'].includes(s.level) ? s.level : 'firm',
    lastForce: s.lastForce || 0,
    focusShown: s.focusShown === ymd(),
    skipped: !!(s.skip && s.skip.d === ymd())
  };
}

// Is now inside today's "do your plan" window?
function windowInfo(st) {
  const due = st.status && st.status.due ? st.status.due : at(17, 30);
  const end = st.status && st.status.end ? st.status.end : at(21, 30);
  const done = !!(st.status && st.status.done);
  const now = Date.now();
  const hw = !!(st.status && st.status.hw && st.status.at && now - st.status.at < 3 * 3600000);
  return { due, end, done, hw, inWindow: isOnDay(st.days) && !st.skipped && !done && now >= due && now < end };
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
  const bad = tabs.concat(blocked);
  if (!bad.length) return 0;
  // Never close the last tab in Chrome (that would quit Chrome): turn it into Critical instead
  const all = await chrome.tabs.query({});
  let ids = bad.map(t => t.id);
  if (all.length <= ids.length) { const keep = bad[0]; ids = ids.filter(id => id !== keep.id); try { await chrome.tabs.update(keep.id, { url: CRIT }); } catch (e) {} }
  if (ids.length) { try { await chrome.tabs.remove(ids); } catch (e) {} }
  return bad.length;
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
  if (!u || u.startsWith('claude://')) return;          // still loading (or the Claude app link): leave it alone
  const blank = u.startsWith('chrome://newtab') || u === 'about:blank' || u.startsWith('chrome://new-tab-page');
  try {
    if (!blank && !/tiktok\.com/.test(u)) await chrome.windows.create({ tabId: t.id, focused: true });
    else await chrome.tabs.remove(t.id);
  } catch (e) {}
}

const FIRM_GAP = 5 * 60000;
function mayForce(st) { return st.level === 'harsh' || Date.now() - st.lastForce >= FIRM_GAP; }
function critUrl(st) { return st.focusShown ? CRIT : CRIT + '#focus'; }

let busy = false;
async function ensureCritical(st) {
  if (busy) return; busy = true;
  try {
    let w = null;
    if (st.winId) { try { w = await chrome.windows.get(st.winId, { populate: true }); } catch (e) { w = null; } }
    if (!w) {
      if (!mayForce(st)) return;           // Firm: closed it? It comes back in a few minutes, not straight away
      const recent = (await chrome.storage.local.get(['opens'])).opens || [], nowT = Date.now(), r2 = recent.filter(x => nowT - x < 120000);
      if (r2.length >= 3) return;          // safety net: never more than 3 opens in 2 minutes
      await chrome.storage.local.set({ opens: r2.concat(nowT) });
      const disp = await pickDisplay(st.screen), b = st.layout ? st.layout.crit : disp.workArea;
      w = await chrome.windows.create({ url: critUrl(st), left: b.left, top: b.top, width: b.width, height: b.height, focused: true, type: 'normal' });
      await chrome.storage.local.set({ winId: w.id, critTab: w.tabs && w.tabs[0] ? w.tabs[0].id : null, lastForce: Date.now(), focusShown: ymd() });
      if (!st.layout) { try { await chrome.windows.update(w.id, { state: 'fullscreen' }); } catch (e) {} }
      return;
    }
    // keep only Critical in that window
    const tabs = w.tabs || [];
    let crit = tabs.find(t => t.id === st.critTab) || tabs.find(t => (t.url || t.pendingUrl || '').startsWith(CRIT_ORIGIN));
    if (crit && crit.id !== st.critTab) await chrome.storage.local.set({ critTab: crit.id });
    for (const t of tabs) if (!crit || t.id !== crit.id) await moveOrClose(t);
    if (!crit) { const nt = await chrome.tabs.create({ windowId: w.id, url: critUrl(st), active: true }); await chrome.storage.local.set({ critTab: nt.id, focusShown: ymd() }); }
    const needs = st.layout ? w.state === 'minimized' : w.state !== 'fullscreen';
    if (needs && !mayForce(st)) return;     // Firm: minimised it? It comes back in a few minutes
    if (needs) await chrome.storage.local.set({ lastForce: Date.now() });
    if (st.layout) { if (w.state === 'minimized') { try { await chrome.windows.update(w.id, { state: 'normal' }); await chrome.windows.update(w.id, Object.assign({ focused: true }, st.layout.crit)); } catch (e) {} } }
    else if (w.state !== 'fullscreen') { try { await chrome.windows.update(w.id, { state: 'fullscreen', focused: true }); } catch (e) {} }
  } finally { busy = false; }
}

// While locked, look at the Critical window every second and a half (this also keeps the extension awake).
let guardTimer = null;
function startGuard() { if (!guardTimer) guardTimer = setInterval(() => guard().catch(() => {}), 1500); }
function stopGuard() { if (guardTimer) { clearInterval(guardTimer); guardTimer = null; } }

async function lockNow(reason) {
  const st = await load(), wi0 = windowInfo(st);
  if (!wi0.inWindow) return false;
  if (wi0.hw || st.level === 'gentle') {
    await setBlock(true); await closeTikTok(); if (st.locked) await releaseWindow();
    if (st.level === 'gentle' && !wi0.hw) chrome.notifications.create('gentle', { type: 'basic', iconUrl: 'icon128.png', title: 'Not now: Critical first', message: 'TikTok is blocked until today\'s plan is done.', priority: 1 });
    return true;
  }
  const was = st.locked;
  await chrome.storage.local.set({ lock: { d: ymd(), why: reason } });
  st.locked = true;
  await setBlock(true);
  await ensureCritical(st);
  await closeTikTok();
  startGuard();
  if (!was) {
    chrome.notifications.create('lock', { type: 'basic', iconUrl: 'icon128.png', title: 'Critical first', message: 'TikTok is closed until today\'s plan is done. Critical is on your screen.', priority: 2 });
  }
  return true;
}

// Homework first: let go of the Critical window but keep TikTok blocked
async function releaseWindow() {
  stopGuard();
  const st = await load();
  await chrome.storage.local.remove(['lock']);
  if (st.winId) { try { await chrome.windows.update(st.winId, { state: 'maximized' }); } catch (e) {} await chrome.storage.local.remove(['winId']); }
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
  // Claude: the desktop app (opened through its claude:// link) or the website on the right of the study screen
  if (st.claude === 'app') {
    try {
      const lt = await chrome.tabs.create({ windowId: winId, url: CLAUDE_APP, active: true });
      // With the PC helper installed, move the Claude app onto the right of the study screen (tries a few times while it opens)
      const place = (tries) => chrome.runtime.sendNativeMessage('com.critical.focus', { cmd: 'place', screen: st.screen, side: 'right', frac: 0.38 }, r => {
        const err = chrome.runtime.lastError; chrome.storage.local.set({ helper: err ? { ok: false, error: err.message } : (r || { ok: false }) });
        if (!err && r && !r.ok && tries > 0) setTimeout(() => place(tries - 1), 2000);
      });
      setTimeout(() => place(2), 2500);
      // Chrome asks "Open Claude?" the first time (tick "Always allow"). Tidy the leftover blank tab afterwards.
      setTimeout(async () => { try { const t = await chrome.tabs.get(lt.id); if (!(t.url || '').startsWith(CRIT_ORIGIN)) await chrome.tabs.remove(lt.id); } catch (e) {} }, 10000);
    } catch (e) { console.warn(e); }
  } else {
    const cl = (await chrome.tabs.query({ url: 'https://claude.ai/*' }))[0];
    try { if (cl) await moveTab(cl.id, clB, false); else await chrome.windows.create(Object.assign({ url: CLAUDE, focused: false }, clB)); } catch (e) { console.warn(e); }
  }
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
  if (wi.hw || st.level === 'gentle') { if (tt.length) await closeTikTok(); if (st.locked) await releaseWindow(); return; }
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
  if (st.locked && st.winId && tab.windowId === st.winId && url && /^https?:/.test(url) && !url.startsWith(CRIT_ORIGIN)) {
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
  if (windowInfo(st).hw || st.level === 'gentle') { await releaseWindow(); return; }
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
    if (msg.type === 'helper') { chrome.runtime.sendNativeMessage('com.critical.focus', { cmd: 'ping' }, r => { const err = chrome.runtime.lastError; reply(err ? { ok: false, error: err.message } : (r || { ok: false })); }); return; }
    if (msg.type === 'info') { const st = await load(); const ds = await chrome.system.display.getInfo(); ds.sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top);
      reply({ st, wi: windowInfo(st), displays: ds.map(d => ({ name: d.name, w: d.bounds.width, h: d.bounds.height, primary: d.isPrimary })) }); return; }
    if (msg.type === 'screen') { await chrome.storage.local.set({ screen: msg.screen }); reply({ ok: true }); return; }
    if (msg.type === 'music') { await chrome.storage.local.set({ music: msg.screen }); reply({ ok: true }); return; }
    if (msg.type === 'claude') { await chrome.storage.local.set({ claude: msg.mode === 'web' ? 'web' : 'app' }); reply({ ok: true }); return; }
    if (msg.type === 'setup') { await setup(null); reply({ ok: true }); return; }
    if (msg.type === 'days') {
      const st = await load(), g = new Date().getDay();
      // No switching today off in the middle of plan time: that's what the slow "let me off today" exit is for
      if (st.days[g] && !msg.days[g] && windowInfo(st).inWindow) { reply({ ok: false, error: 'You can\'t switch today off during plan time. Do your plan, press Homework first, or use Let me off today.' }); return; }
      await chrome.storage.local.set({ days: msg.days }); await check(); reply({ ok: true }); return;
    }
    if (msg.type === 'level') { await chrome.storage.local.set({ level: msg.level }); await check(); reply({ ok: true }); return; }
    if (msg.type === 'strict') { await chrome.storage.local.set({ strict: !!msg.on }); check(); reply({ ok: true }); return; }
    if (msg.type === 'test') { const disp = await pickDisplay(msg.screen), b = disp.workArea; const w = await chrome.windows.create({ url: CRIT, left: b.left, top: b.top, width: b.width, height: b.height, focused: true });
      setTimeout(() => chrome.windows.remove(w.id).catch(() => {}), 4000); reply({ ok: true }); return; }
    if (msg.type === 'tonight') {
      // After 8pm you can switch it off for the rest of the evening with one click
      if (new Date().getHours() < 20) { reply({ ok: false, error: 'Turn off for tonight works from 8pm.' }); return; }
      await chrome.storage.local.set({ skip: { d: ymd(), why: 'tonight' } }); await release('skip'); reply({ ok: true }); return;
    }
    if (msg.type === 'skip') { await chrome.storage.local.set({ skip: { d: ymd() } }); await release('skip'); reply({ ok: true }); return; }
    reply({ ok: false });
  })();
  return true;
});
