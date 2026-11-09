importScripts('shared.js');
const TIKTOK = ['*://*.tiktok.com/*', '*://tiktok.com/*'];
const RULE = { id: 1, priority: 1, action: { type: 'redirect', redirect: { extensionPath: '/closed.html' } }, condition: { requestDomains: ['tiktok.com'], resourceTypes: ['main_frame', 'sub_frame'] } };

async function sync() {
  const s = await getS();
  if (s.pending && Date.now() >= s.pending.at) { Object.assign(s, s.pending.s); s.pending = null; await setS(s); }
  const on = isActive(s);
  const cur = await chrome.declarativeNetRequest.getDynamicRules();
  const has = cur.some((r) => r.id === 1);
  if (on && !has) await chrome.declarativeNetRequest.updateDynamicRules({ addRules: [RULE] });
  if (!on && has) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
  if (on) await sweep();
  chrome.action.setBadgeBackgroundColor({ color: on ? '#ef4444' : planDone(s) ? '#16a34a' : '#64748b' });
  chrome.action.setBadgeText({ text: on ? 'ON' : s.mode === 'plan' && planDone(s) && s.days.includes(new Date().getDay()) ? '✓' : '' });
  chrome.action.setTitle({ title: 'Critical Guard: ' + why(s) });
}
// close any TikTok tabs that are already open (for example at 4:45)
async function sweep() { const tabs = await chrome.tabs.query({ url: TIKTOK }); for (const t of tabs) await closeTab(t); }
async function bump() { const s = await getS(); if (s.countDay !== today()) { s.count = 0; s.countDay = today(); } s.count++; await setS(s); }
async function closeTab(t) {
  await bump();
  const others = await chrome.tabs.query({ windowId: t.windowId });
  if (others.length > 1) { try { await chrome.tabs.remove(t.id); } catch (e) {} }
  else { try { await chrome.tabs.update(t.id, { url: chrome.runtime.getURL('closed.html') }); } catch (e) {} }
}
chrome.tabs.onUpdated.addListener(async (id, info, tab) => {
  const u = info.url || '';
  if (!/^https?:\/\/([a-z0-9-]+\.)*tiktok\.com(\/|$)/i.test(u)) return;
  if (isActive(await getS())) closeTab(tab);
});
function boot() { chrome.alarms.create('tick', { periodInMinutes: 1 }); sync(); }
chrome.runtime.onInstalled.addListener(boot);
chrome.runtime.onStartup.addListener(boot);
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'tick') sync(); });
chrome.storage.onChanged.addListener(() => sync());
// Critical (the website) tells us whether today's plan is done
chrome.runtime.onMessageExternal.addListener((m, sender, reply) => {
  if (!m || m.type !== 'status') { reply({ ok: false }); return; }
  getS().then(async (s) => {
    const was = planDone(s);
    s.plan = { day: today(), done: !!m.done, left: typeof m.left === 'number' ? m.left : null, at: Date.now() };
    await setS(s);
    reply({ ok: true, guard: true, unlocked: planDone(s) });
    if (!was && planDone(s)) chrome.tabs.query({ url: chrome.runtime.getURL('closed.html') }).then((t) => t.forEach((x) => chrome.tabs.sendMessage(x.id, 'unlocked').catch(() => {})));
  });
  return true;
});
chrome.runtime.onMessage.addListener((m, sender, reply) => {
  if (m === 'closeMe' && sender.tab) { chrome.tabs.query({ windowId: sender.tab.windowId }).then((t) => { if (t.length > 1) chrome.tabs.remove(sender.tab.id); reply(t.length > 1); }); return true; }
  if (m === 'counted') bump();
  if (m === 'openCritical') chrome.tabs.create({ url: CRITICAL_URL });
});
