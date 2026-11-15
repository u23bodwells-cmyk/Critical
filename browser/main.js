'use strict';
// Critical Browser: a study browser built around Critical.
//  - TikTok, YouTube Shorts and social sites are blocked until today's Critical plan is done.
//  - At plan time it opens itself on your study screen with Critical and Claude side by side,
//    and (on Firm or Harsh) it won't close or stay minimised until the plan is done.
//  - Claude lives in a side panel; "Ask Claude" sends whatever you've selected straight to it.
const { app, BrowserWindow, session, ipcMain, protocol, Tray, Menu, screen, nativeImage, nativeTheme, Notification, webContents, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const CRIT = 'https://u23bodwells-cmyk.github.io/Critical/critical.html';
const CRIT_ORIGIN = 'https://u23bodwells-cmyk.github.io';
const CRIT_PATH = '/Critical/';
const NEWTAB = 'critical://app/newtab.html';
const PART = 'persist:critical';
const SELFTEST = process.argv.includes('--self-test');
const HIDDEN = process.argv.includes('--hidden');
// Two builds come from this code: the main app, and a Backup copy that installs alongside it with its own data,
// no auto-updates and no start-with-Windows, so if the main one ever breaks there's still a working browser.
let PKG = {}; try { PKG = require('./package.json'); } catch (e) {}
const BACKUP = (process.env.CB_VARIANT || PKG.variant) === 'backup';
const APP_NAME = BACKUP ? 'Critical Browser Backup' : 'Critical Browser';
const APP_ID = BACKUP ? 'io.github.u23bodwellscmyk.criticalbrowser.backup' : 'io.github.u23bodwellscmyk.criticalbrowser';
const ICON = path.join(__dirname, 'build', BACKUP ? 'icon-backup.png' : 'icon.png');
const TRAY = path.join(__dirname, 'build', BACKUP ? 'tray-backup.png' : 'tray.png');

// Everything that's blocked until the plan is done. Subdomains count too (m.facebook.com, vm.tiktok.com...).
const CORE = ['tiktok.com', 'tiktokv.com', 'tiktokcdn.com', 'tiktokcdn-us.com', 'instagram.com', 'cdninstagram.com', 'facebook.com', 'fb.com', 'fb.watch', 'messenger.com',
  'snapchat.com', 'x.com', 'twitter.com', 'reddit.com', 'redd.it', 'threads.net', 'threads.com', 'pinterest.com', 'pinterest.co.uk', 'tumblr.com', 'discord.com', 'discord.gg',
  'discordapp.com', 'twitch.tv', 'kick.com', 'bsky.app', 'bereal.com', '9gag.com', 'triller.co', 'likee.video', 'lemon8-app.com'];
const NAMES = { tiktok: 'TikTok', tiktokv: 'TikTok', tiktokcdn: 'TikTok', 'tiktokcdn-us': 'TikTok', instagram: 'Instagram', cdninstagram: 'Instagram', facebook: 'Facebook', fb: 'Facebook', messenger: 'Messenger',
  snapchat: 'Snapchat', x: 'X', twitter: 'X', reddit: 'Reddit', redd: 'Reddit', threads: 'Threads', pinterest: 'Pinterest', tumblr: 'Tumblr', discord: 'Discord', discordapp: 'Discord', twitch: 'Twitch',
  kick: 'Kick', bsky: 'Bluesky', bereal: 'BeReal', '9gag': '9GAG', triller: 'Triller', likee: 'Likee', 'lemon8-app': 'Lemon8' };
const SHORTS_CSS = 'ytd-reel-shelf-renderer,ytd-rich-shelf-renderer[is-shorts],ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),ytd-guide-entry-renderer:has(a[title="Shorts"]),ytd-mini-guide-entry-renderer[aria-label="Shorts"],yt-tab-shape[tab-title="Shorts"],ytd-video-renderer:has(a[href^="/shorts/"]),ytd-grid-video-renderer:has(a[href^="/shorts/"]),ytd-rich-item-renderer:has(a[href^="/shorts/"]),ytm-shorts-lockup-view-model,ytm-shorts-lockup-view-model-v2,grid-shelf-view-model:has(ytm-shorts-lockup-view-model),ytm-reel-shelf-renderer,ytm-pivot-bar-item-renderer:has(.pivot-shorts){display:none!important}';

let win = null, tray = null, quitting = false, hiddenSince = 0, skipStart = 0, updateReady = null, lastRefresh = 0;
const DEF_SETTINGS = { strict: 'firm', screen: null, autostart: !BACKUP, extra: [], claudeAtPlan: true };
let state = { status: null, skip: null, lastShow: null, blocks: null, trayHinted: false, settings: Object.assign({}, DEF_SETTINGS) };

/* ---------- saved state ---------- */
function stateFile() { return path.join(app.getPath('userData'), 'state.json'); }
function load() {
  try { Object.assign(state, JSON.parse(fs.readFileSync(stateFile(), 'utf8'))); } catch (e) {}
  state.settings = Object.assign({}, DEF_SETTINGS, state.settings || {});
  if (!['gentle', 'firm', 'harsh'].includes(state.settings.strict)) state.settings.strict = 'firm';
  if (!Array.isArray(state.settings.extra)) state.settings.extra = [];
}
function persist() { try { fs.writeFileSync(stateFile(), JSON.stringify(state)); } catch (e) {} }
function ymd(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function at(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); }

/* ---------- today's plan, as Critical reports it ---------- */
function todayStatus() { return state.status && state.status.d === ymd() ? state.status : null; }
function isDone() { const s = todayStatus(); return !!(s && (s.done || s.early)); }
function windowInfo() {
  const s = todayStatus(), wd = new Date().getDay(), school = wd >= 1 && wd <= 5;
  const due = s ? (s.due || null) : (school ? at(17, 30) : null);
  const end = s && s.end ? s.end : at(21, 30);
  const skipped = state.skip === ymd(), now = Date.now(), done = isDone();
  return { due, end, done, skipped, known: !!s, left: s ? s.left : null, mins: s ? s.mins : null, lessons: s ? s.lessons || 0 : 0, critSync: s ? s.sync : null, critLocked: s ? !!s.locked : false, checkedAt: s ? s.at : null,
    inWindow: !!due && !done && !skipped && now >= due && now < end };
}
function blocksToday() { return state.blocks && state.blocks.d === ymd() ? state.blocks.n : 0; }
function publicState() {
  const w = windowInfo();
  return Object.assign(w, { social: w.done ? 'open' : 'blocked', strict: state.settings.strict, extra: state.settings.extra, core: CORE, blocksToday: blocksToday(),
    backup: BACKUP, autostart: state.settings.autostart, claudeAtPlan: state.settings.claudeAtPlan, screen: state.settings.screen, version: app.getVersion(), updateReady: updateReady,
    canQuit: !(w.inWindow && state.settings.strict !== 'gentle') });
}
function setStatus(s) {
  if (!s || typeof s !== 'object') return;
  const n = (v) => (typeof v === 'number' && isFinite(v) ? v : null);
  const was = isDone();
  state.status = { d: ymd(), at: Date.now(), due: n(s.due), end: n(s.end), done: !!s.done, early: !!s.early, lessons: n(s.lessons) || 0, left: n(s.left), mins: n(s.mins), hw: !!s.hw, sync: typeof s.sync === 'boolean' ? s.sync : null, locked: !!s.locked };
  persist();
  if (!was && isDone()) {
    notify('Plan done ✓', 'TikTok, Shorts and social are unlocked for today. Nice work.');
    send('toast', '✓ Plan done: social sites are unlocked for today');
    if (win && win.isFullScreen() && state.settings.strict === 'harsh') win.setFullScreen(false);
  }
  broadcast();
}

/* ---------- blocking ---------- */
function hostOf(u) { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { return ''; } }
function matchList(host, list) { return list.find(d => host === d || host.endsWith('.' + d)); }
function blockedReason(url) {
  if (isDone()) return null;
  let u; try { u = new URL(url); } catch (e) { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();
  const d = matchList(host, CORE.concat(state.settings.extra));
  if (d) return NAMES[d.split('.')[0]] || d;
  if ((host === 'youtube.com' || host.endsWith('.youtube.com')) && /\/shorts(\/|$)/i.test(u.pathname)) return 'YouTube Shorts';
  return null;
}
function blockedURL(url, why) { return 'critical://app/blocked.html?u=' + encodeURIComponent(url) + '&s=' + encodeURIComponent(why || blockedReason(url) || 'This site'); }
function countBlock() { const d = ymd(); state.blocks = { d, n: blocksToday() + 1 }; persist(); refreshCritical(false); }
// Ask Critical (in the first tab) to pull synced progress again, e.g. after you finished the plan in Chrome.
function refreshCritical(manual) {
  if (isDone()) return false;
  if (!manual && Date.now() - lastRefresh < 20000) return false;
  lastRefresh = Date.now(); let sent = false;
  for (const wc of webContents.getAllWebContents()) {
    try { const u = new URL(wc.getURL()); if (u.origin === CRIT_ORIGIN && u.pathname.startsWith(CRIT_PATH)) { wc.send('critical-refresh'); sent = true; } } catch (e) {}
  }
  return sent;
}
function cleanExtra(list) {
  return (Array.isArray(list) ? list : String(list || '').split(/[\s,]+/)).map(x => String(x).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''))
    .filter(x => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(x)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 60);
}

/* ---------- talking to the window and pages ---------- */
function send(ch, ...a) { try { if (win && !win.isDestroyed()) win.webContents.send(ch, ...a); } catch (e) {} }
function broadcast() {
  const s = publicState(); send('state', s);
  for (const wc of webContents.getAllWebContents()) { try { if (wc.getURL().startsWith('critical://')) wc.send('state', s); } catch (e) {} }
  updateTray();
}
function notify(title, body) { try { if (Notification.isSupported()) new Notification({ title, body, icon: ICON }).show(); } catch (e) {} }

/* ---------- screens ---------- */
function displays() {
  const p = screen.getPrimaryDisplay().id;
  return screen.getAllDisplays().slice().sort((a, b) => a.bounds.x - b.bounds.x || a.bounds.y - b.bounds.y)
    .map((d, i) => ({ i, id: d.id, primary: d.id === p, w: d.size.width, h: d.size.height, label: 'Screen ' + (i + 1) + (d.id === p ? ' (main)' : ''), work: d.workArea }));
}
function targetDisplay() { const L = displays(), i = state.settings.screen; return (typeof i === 'number' && L[i]) || L.find(d => d.primary) || L[0]; }
function moveTo(d) {
  if (!win || !d) return; const b = win.getBounds(), wa = d.work;
  const inside = b.x >= wa.x - 10 && b.x < wa.x + wa.width && b.y >= wa.y - 10 && b.y < wa.y + wa.height;
  if (!inside) { if (win.isMaximized()) win.unmaximize(); if (win.isFullScreen()) win.setFullScreen(false);
    win.setBounds({ x: wa.x + 40, y: wa.y + 40, width: Math.min(1400, wa.width - 80), height: Math.min(900, wa.height - 80) }); }
}

/* ---------- the window ---------- */
function themeColours() { const dark = nativeTheme.shouldUseDarkColors; return { bg: dark ? '#0b1120' : '#e4e9f3', fg: dark ? '#e6e9f5' : '#1b2133' }; }
function createWindow(show) {
  const d = targetDisplay(), wa = d ? d.work : { x: 60, y: 60, width: 1400, height: 900 }, c = themeColours();
  win = new BrowserWindow({
    x: wa.x + 40, y: wa.y + 40, width: Math.min(1400, wa.width - 80), height: Math.min(900, wa.height - 80), minWidth: 760, minHeight: 500,
    show: false, title: APP_NAME, backgroundColor: c.bg, icon: ICON, autoHideMenuBar: true,
    titleBarStyle: 'hidden', titleBarOverlay: { color: c.bg, symbolColor: c.fg, height: 42 },
    webPreferences: { preload: path.join(__dirname, 'preload-ui.js'), webviewTag: true, contextIsolation: true, nodeIntegration: false, spellcheck: true }
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  win.webContents.on('will-attach-webview', (e, wp, params) => {
    delete wp.preloadURL; wp.preload = path.join(__dirname, 'preload-web.js');
    wp.nodeIntegration = false; wp.contextIsolation = true; wp.sandbox = true; wp.spellcheck = true;
    params.partition = PART;
    if (!/^(https?|critical):/i.test(params.src || '')) e.preventDefault();
  });
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.once('ready-to-show', () => { if (show) { win.show(); win.maximize(); } });
  win.on('close', e => {
    if (quitting) return;
    e.preventDefault();
    const w = windowInfo();
    if (w.inWindow && state.settings.strict !== 'gentle') { if (win.isMinimized()) win.restore(); win.show(); win.focus(); send('lock-prompt', publicState()); return; }
    win.hide();
    if (!state.trayHinted) { state.trayHinted = true; persist(); notify(APP_NAME + ' is still running', 'It opens itself at plan time. To quit, right-click its icon by the clock.'); }
  });
  win.on('focus', () => refreshCritical(false));   // coming back from Chrome? check whether the plan got finished there
  win.on('minimize', () => { hiddenSince = Date.now(); });
  win.on('restore', () => { hiddenSince = 0; });
  win.on('show', () => { hiddenSince = 0; });
  win.on('hide', () => { hiddenSince = Date.now(); });
  win.webContents.on('before-input-event', (e, input) => onKey(e, input));
  return win;
}
function showWindow() { if (!win || win.isDestroyed()) createWindow(false); if (win.isMinimized()) win.restore(); win.show(); win.focus(); }
function showForPlan(first) {
  if (!win || win.isDestroyed()) createWindow(false);
  moveTo(targetDisplay());
  if (win.isMinimized()) win.restore();
  win.show();
  if (state.settings.strict === 'harsh') win.setFullScreen(true); else if (!win.isFullScreen()) win.maximize();
  win.focus(); win.moveTop();
  send('plan-time', Object.assign(publicState(), { first: !!first }));
  if (first) notify('Plan time', APP_NAME + ' is open. TikTok, Shorts and social stay blocked until today\'s plan is done.');
}

/* ---------- keyboard shortcuts (they work even when a page has focus) ---------- */
function onKey(e, input) {
  if (input.type !== 'keyDown') return;
  const k = (input.key || '').toLowerCase(), c = input.control || input.meta, s = input.shift, a = input.alt;
  let cmd = null;
  if (c && !s && k === 't') cmd = 'new-tab';
  else if (c && !s && k === 'w') cmd = 'close-tab';
  else if ((c && !s && k === 'l') || (a && k === 'd') || k === 'f6') cmd = 'focus-address';
  else if (c && k === 'tab') cmd = s ? 'prev-tab' : 'next-tab';
  else if ((c && !s && k === 'r') || k === 'f5') cmd = 'reload';
  else if (a && k === 'arrowleft') cmd = 'back';
  else if (a && k === 'arrowright') cmd = 'forward';
  else if (c && !s && k === 'f') cmd = 'find';
  else if (c && s && k === 'c') cmd = 'claude';
  else if (c && s && k === 'a') cmd = 'ask';
  else if (c && (k === '=' || k === '+')) cmd = 'zoom-in';
  else if (c && k === '-') cmd = 'zoom-out';
  else if (c && k === '0') cmd = 'zoom-reset';
  else if (k === 'f11') cmd = 'fullscreen';
  else if (c && !s && /^[1-9]$/.test(k)) cmd = 'tab-' + k;
  else if (a && k === 'home') cmd = 'home';
  if (cmd) { e.preventDefault(); if (cmd === 'fullscreen') toggleFullscreen(); else send('shortcut', cmd); }
}
function toggleFullscreen() { if (!win) return; if (win.isFullScreen() && windowInfo().inWindow && state.settings.strict === 'harsh') return; win.setFullScreen(!win.isFullScreen()); }

/* ---------- every page inside the browser ---------- */
function setupSession() {
  const ses = session.fromPartition(PART);
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + process.versions.chrome.split('.')[0] + '.0.0.0 Safari/537.36';
  ses.setUserAgent(UA); app.userAgentFallback = UA;
  ses.protocol.handle('critical', req => {
    const u = new URL(req.url), base = path.join(__dirname, 'pages');
    const file = path.normalize(path.join(base, decodeURIComponent(u.pathname)));
    if (!file.startsWith(base) || !fs.existsSync(file)) return new Response('Not found', { status: 404 });
    const ext = path.extname(file).toLowerCase(), type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' }[ext] || 'application/octet-stream';
    return new Response(fs.readFileSync(file), { headers: { 'content-type': type + (type.startsWith('text') ? '; charset=utf-8' : '') } });
  });
  ses.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (d, cb) => {
    if (d.resourceType !== 'mainFrame' && d.resourceType !== 'subFrame') return cb({});
    const why = blockedReason(d.url);
    if (!why) return cb({});
    cb({ cancel: true });
    if (d.resourceType === 'mainFrame') {
      countBlock();
      const wc = d.webContents;
      if (wc && !wc.isDestroyed()) setTimeout(() => { try { wc.loadURL(blockedURL(d.url, why)); } catch (e) {} }, 0);
    }
  });
  ses.setPermissionRequestHandler((wc, perm, cb, details) => {
    const h = hostOf(details.requestingUrl || (wc && wc.getURL()) || '');
    const trusted = h === 'claude.ai' || h.endsWith('.claude.ai') || h === 'u23bodwells-cmyk.github.io' || h.endsWith('google.com');
    if (perm === 'fullscreen' || perm === 'clipboard-sanitized-write' || perm === 'pointerLock') return cb(true);
    if ((perm === 'media' || perm === 'clipboard-read' || perm === 'notifications') && trusted) return cb(true);
    cb(false);
  });
  ses.on('will-download', (e, item) => {
    const dir = app.getPath('downloads'), name = item.getFilename(), ext = path.extname(name), stem = path.basename(name, ext);
    let p = path.join(dir, name), i = 1; while (fs.existsSync(p)) p = path.join(dir, stem + ' (' + (i++) + ')' + ext);
    item.setSavePath(p); send('toast', '⬇️ Downloading ' + name);
    item.once('done', (ev, st) => send('toast', st === 'completed' ? '✓ Saved ' + path.basename(p) + ' to Downloads' : 'Download ' + st + ': ' + name, st === 'completed' ? p : null));
  });
}
app.on('web-contents-created', (e, wc) => {
  if (wc.getType() !== 'webview') return;
  wc.on('did-navigate-in-page', (ev, url, isMain) => {
    if (!isMain) return;
    const why = blockedReason(url);
    if (why) { countBlock(); wc.loadURL(blockedURL(url, why)); return; }
    shortsCSS(wc);
  });
  wc.on('dom-ready', () => shortsCSS(wc));
  wc.on('before-input-event', (ev, input) => onKey(ev, input));
  wc.setWindowOpenHandler(({ url, features, disposition }) => {
    const h = hostOf(url), opener = hostOf(wc.getURL());
    const signIn = /(^|\.)accounts\.google\.com$|(^|\.)appleid\.apple\.com$|(^|\.)login\.microsoftonline\.com$/.test(h) || ((opener === 'claude.ai' || opener.endsWith('.claude.ai')) && disposition === 'new-window' && /width|height/.test(features || ''));
    if (signIn) return { action: 'allow', overrideBrowserWindowOptions: { width: 520, height: 720, autoHideMenuBar: true, webPreferences: { partition: PART, sandbox: true, contextIsolation: true } } };
    if (/^https?:/i.test(url)) send('open-tab', url, disposition === 'background-tab');
    return { action: 'deny' };
  });
  wc.on('context-menu', (ev, p) => {
    const T = [];
    if (p.linkURL && /^https?:/i.test(p.linkURL)) T.push({ label: 'Open link in new tab', click: () => send('open-tab', p.linkURL, true) }, { label: 'Copy link', click: () => clipboard.writeText(p.linkURL) }, { type: 'separator' });
    if (p.selectionText && p.selectionText.trim()) T.push({ label: 'Ask Claude about this', click: () => send('ask-claude', p.selectionText.slice(0, 6000)) }, { label: 'Search Google for "' + p.selectionText.trim().slice(0, 30) + (p.selectionText.trim().length > 30 ? '…' : '') + '"', click: () => send('open-tab', 'https://www.google.com/search?q=' + encodeURIComponent(p.selectionText.trim())) }, { role: 'copy' }, { type: 'separator' });
    if (p.isEditable) T.push({ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }, { type: 'separator' });
    if (p.mediaType === 'image' && p.srcURL) T.push({ label: 'Copy image', click: () => wc.copyImageAt(p.x, p.y) }, { label: 'Save image', click: () => wc.downloadURL(p.srcURL) }, { type: 'separator' });
    T.push({ label: 'Back', enabled: wc.navigationHistory ? wc.navigationHistory.canGoBack() : wc.canGoBack(), click: () => send('shortcut', 'back') }, { label: 'Reload', click: () => wc.reload() });
    Menu.buildFromTemplate(T).popup();
  });
});
function shortsCSS(wc) { try { const h = hostOf(wc.getURL()); if ((h === 'youtube.com' || h.endsWith('.youtube.com')) && !isDone()) wc.insertCSS(SHORTS_CSS); } catch (e) {} }

/* ---------- tray icon ---------- */
function updateTray() {
  if (!tray) return; const w = windowInfo(), canQuit = !(w.inWindow && state.settings.strict !== 'gentle');
  const line = w.done ? '✓ Plan done: social unlocked' : w.inWindow ? '📘 Plan time: ' + (w.left != null ? w.left + ' part' + (w.left === 1 ? '' : 's') + ' left' : 'in progress') : '🔒 Social blocked until the plan is done';
  tray.setToolTip(APP_NAME + '\n' + line);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open ' + APP_NAME, click: showWindow }, { label: line, enabled: false }, { type: 'separator' },
    { label: 'Start with Windows', type: 'checkbox', checked: !!state.settings.autostart, click: (m) => { state.settings.autostart = m.checked; persist(); applyAutostart(); broadcast(); } },
    { label: canQuit ? 'Quit' : 'Quit (after today\'s plan)', enabled: canQuit, click: () => { quitting = true; app.quit(); } }
  ]));
}
function applyAutostart() { if (!app.isPackaged) return; try { app.setLoginItemSettings({ openAtLogin: !!state.settings.autostart, path: process.execPath, args: ['--hidden'] }); } catch (e) {} }

/* ---------- the clock: opens at plan time and keeps it open ---------- */
function tick() {
  const w = windowInfo(), strict = state.settings.strict;
  if (!w.done && Date.now() - lastRefresh > 180000) refreshCritical(false);
  if (w.inWindow) {
    const key = ymd() + ':' + w.due;
    if (state.lastShow !== key) { state.lastShow = key; persist(); showForPlan(true); }
    else if (strict !== 'gentle' && win && !win.isDestroyed()) {
      const away = !win.isVisible() || win.isMinimized();
      if (away) { if (!hiddenSince) hiddenSince = Date.now(); if (Date.now() - hiddenSince >= (strict === 'harsh' ? 15000 : 120000)) { hiddenSince = 0; showForPlan(false); send('toast', 'Back to it: the plan isn\'t done yet'); } }
      else hiddenSince = 0;
    }
  }
  broadcast();
}

/* ---------- updates ---------- */
let updater = null;
function setupUpdates() {
  if (!app.isPackaged || SELFTEST || BACKUP) return;   // the Backup copy never updates itself
  try {
    updater = require('electron-updater').autoUpdater;
    updater.autoDownload = true; updater.autoInstallOnAppQuit = true;
    updater.on('update-downloaded', i => { updateReady = i.version; broadcast(); send('toast', 'Update ' + i.version + ' is ready. It installs next time Critical Browser restarts.'); });
    updater.on('error', () => {});
    updater.checkForUpdates().catch(() => {});
    setInterval(() => updater.checkForUpdates().catch(() => {}), 4 * 3600 * 1000);
  } catch (e) { updater = null; }
}

/* ---------- messages from the window and pages ---------- */
function fromUI(e) { return win && !win.isDestroyed() && e.sender === win.webContents; }
function fromPage(e) { try { return (e.senderFrame && e.senderFrame.url || '').startsWith('critical://'); } catch (_) { return false; } }
ipcMain.handle('cb-init', e => fromUI(e) ? { crit: CRIT, newtab: NEWTAB, version: app.getVersion(), state: publicState(), selftest: SELFTEST, backup: BACKUP, name: APP_NAME } : null);
ipcMain.handle('cb-state', e => (fromUI(e) || fromPage(e)) ? publicState() : null);
ipcMain.handle('cb-displays', e => fromUI(e) ? displays() : null);
ipcMain.handle('cb-test-display', (e, i) => { if (!fromUI(e)) return; const d = displays()[i]; if (d) { moveTo(d); win.show(); win.maximize(); } });
ipcMain.handle('cb-settings', (e, p) => {
  if (!fromUI(e) || !p || typeof p !== 'object') return publicState();
  const S = state.settings, w = windowInfo(), locked = w.inWindow && S.strict !== 'gentle';
  if (['gentle', 'firm', 'harsh'].includes(p.strict) && !(locked && p.strict === 'gentle')) S.strict = p.strict;
  if (p.screen === null || (typeof p.screen === 'number' && p.screen >= 0 && p.screen < 12)) S.screen = p.screen;
  if (typeof p.autostart === 'boolean') { S.autostart = p.autostart; applyAutostart(); }
  if (typeof p.claudeAtPlan === 'boolean') S.claudeAtPlan = p.claudeAtPlan;
  // extra sites can be added any time, but only removed once the plan's done (so they can't be unblocked mid-plan)
  if (p.extra !== undefined) { const next = cleanExtra(p.extra); S.extra = isDone() ? next : Array.from(new Set(S.extra.concat(next))); }
  persist(); broadcast(); return publicState();
});
ipcMain.handle('cb-refresh', e => { if (!(fromUI(e) || fromPage(e))) return false; return refreshCritical(true); });
ipcMain.handle('cb-skip-begin', e => { if (fromUI(e)) skipStart = Date.now(); return true; });
ipcMain.handle('cb-skip-today', e => {
  if (!fromUI(e) || !skipStart || Date.now() - skipStart < 55000) return false;
  state.skip = ymd(); skipStart = 0; persist();
  if (win && win.isFullScreen()) win.setFullScreen(false);
  broadcast(); return true;
});
ipcMain.handle('cb-quit', e => { if (!fromUI(e)) return false; const w = windowInfo(); if (w.inWindow && state.settings.strict !== 'gentle') return false; quitting = true; app.quit(); return true; });
ipcMain.handle('cb-check-updates', async e => { if (!fromUI(e)) return null; if (BACKUP) return { ok: false, why: 'The Backup copy doesn\'t update itself, so a bad update can never break both browsers. Download a newer Backup from the releases page if you ever need one.' }; if (!updater) return { ok: false, why: app.isPackaged ? 'Updates aren\'t available right now.' : 'Updates only work in the installed app.' }; try { const r = await updater.checkForUpdates(); return { ok: true, latest: r && r.updateInfo ? r.updateInfo.version : app.getVersion() }; } catch (err) { return { ok: false, why: 'Couldn\'t reach GitHub.' }; } });
ipcMain.handle('cb-install-update', e => { if (fromUI(e) && updater && updateReady) { quitting = true; updater.quitAndInstall(true, true); } });
ipcMain.handle('cb-open-external', (e, url) => { if (fromUI(e) && /^https:\/\//.test(url)) shell.openExternal(url); });
ipcMain.handle('cb-show-file', (e, p) => { if (fromUI(e) && typeof p === 'string' && p.startsWith(app.getPath('downloads'))) shell.showItemInFolder(p); });
ipcMain.on('cb-theme', (e, dark) => { if (!fromUI(e) || !win) return; const bg = dark ? '#0b1120' : '#e4e9f3', fg = dark ? '#e6e9f5' : '#1b2133'; try { win.setTitleBarOverlay({ color: bg, symbolColor: fg, height: 42 }); win.setBackgroundColor(bg); } catch (_) {} });
ipcMain.on('cb-fullscreen', e => { if (fromUI(e)) toggleFullscreen(); });
// Critical tells us how today's plan is going (same message the Critical Focus extension gets)
ipcMain.on('critical-status', (e, s) => {
  let u = ''; try { u = e.senderFrame ? e.senderFrame.url : ''; } catch (_) {}
  let ok = false; try { const x = new URL(u); ok = x.origin === CRIT_ORIGIN && x.pathname.startsWith(CRIT_PATH); } catch (_) {}
  if (ok) setStatus(s);
});

/* ---------- start up ---------- */
protocol.registerSchemesAsPrivileged([{ scheme: 'critical', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
if (!SELFTEST && !app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on('second-instance', (e, argv) => { showWindow(); const url = argv.find(a => /^https?:\/\//i.test(a)); if (url) send('open-tab', url); });
  app.whenReady().then(() => {
    app.setAppUserModelId(APP_ID);
    if (SELFTEST) app.setPath('userData', path.join(app.getPath('temp'), 'critical-browser-selftest-' + (BACKUP ? 'backup-' : '') + Date.now()));
    else if (BACKUP && !app.isPackaged) app.setPath('userData', path.join(app.getPath('appData'), APP_NAME));
    load(); setupSession();
    createWindow(!HIDDEN || SELFTEST);
    try { const img = nativeImage.createFromPath(TRAY); tray = new Tray(img.isEmpty() ? nativeImage.createFromPath(ICON).resize({ width: 16 }) : img); tray.on('click', showWindow); tray.on('double-click', showWindow); } catch (e) {}
    applyAutostart(); updateTray(); setupUpdates();
    screen.on('display-added', broadcast); screen.on('display-removed', broadcast);
    nativeTheme.on('updated', broadcast);
    setTimeout(tick, 4000); setInterval(tick, 15000);
    if (SELFTEST) require('./selftest')({ win, setStatus, blockedReason, publicState, windowInfo, send, backup: BACKUP }).then(ok => { quitting = true; app.exit(ok ? 0 : 1); }, err => { console.log('::error title=selftest::crashed ' + (err && err.stack || err)); quitting = true; app.exit(1); });
  });
  app.on('before-quit', () => { quitting = true; });
  app.on('window-all-closed', () => { /* stay in the tray */ });
}
