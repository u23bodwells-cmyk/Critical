// Settings shared by the background worker, the popup and the closed page.
// Modes: plan = from the start time until today's Critical plan is done (default), always, study = fixed hours, off.
const DEFAULTS = { mode: 'plan', start: '16:45', end: '21:30', days: [1, 2, 3, 4, 5], count: 0, countDay: '', pending: null, plan: null };
const CRITICAL_URL = 'https://u23bodwells-cmyk.github.io/Critical/critical.html';
function mins(t) { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); }
function today(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function planDone(s, now) { return !!(s.plan && s.plan.day === today(now) && s.plan.done); }
function isActive(s, now) {
  now = now || new Date();
  if (s.mode === 'always') return true;
  if (s.mode === 'off') return false;
  if (!s.days.includes(now.getDay())) return false;
  const n = now.getHours() * 60 + now.getMinutes(), a = mins(s.start), b = mins(s.end);
  if (s.mode === 'plan') return n >= a && !planDone(s, now);
  return a <= b ? n >= a && n < b : n >= a || n < b;
}
async function getS() { const r = await chrome.storage.local.get('s'); return Object.assign({}, DEFAULTS, r.s || {}); }
async function setS(s) { await chrome.storage.local.set({ s }); }
// How strict each mode is: loosening the rules makes you wait.
const STRICT = { always: 3, plan: 2, study: 1, off: 0 };
function why(s, now) {
  now = now || new Date();
  if (s.mode === 'always') return 'TikTok closes automatically, all the time.';
  if (s.mode === 'off') return 'Off: TikTok works normally.';
  if (s.mode === 'plan') {
    if (!s.days.includes(now.getDay())) return 'Not a guarded day. TikTok works today.';
    if (planDone(s, now)) return 'Today\'s plan is done: TikTok is unlocked until tomorrow.';
    const n = now.getHours() * 60 + now.getMinutes();
    if (n < mins(s.start)) return 'TikTok closes at ' + s.start + ' until today\'s plan is done.';
    return 'TikTok is closed until today\'s plan is done' + (s.plan && s.plan.day === today(now) && s.plan.left != null ? ' (' + s.plan.left + ' part' + (s.plan.left === 1 ? '' : 's') + ' left)' : '') + '.';
  }
  return isActive(s, now) ? 'Study hours: TikTok closes automatically until ' + s.end + '.' : 'Not active right now (starts at ' + s.start + ').';
}
