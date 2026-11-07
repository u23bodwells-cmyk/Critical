'use strict';
(async function () {
  const H = window.cbHost;
  const INIT = await H.init();
  let S = INIT.state;
  const PART = 'persist:critical', CLAUDE = 'https://claude.ai/new';
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = { get(k, d) { try { const v = localStorage.getItem('cb_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('cb_' + k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- icons ---------- */
  const P = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  const I = {
    back: P('<path d="M19 12H5M12 19l-7-7 7-7"/>'), fwd: P('<path d="M5 12h14M12 5l7 7-7 7"/>'), reload: P('<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/>'),
    stop: P('<path d="M18 6 6 18M6 6l12 12"/>'), plus: P('<path d="M12 5v14M5 12h14"/>'), x: P('<path d="M18 6 6 18M6 6l12 12"/>'),
    atom: P('<circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'),
    lock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'), unlock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>'),
    ban: P('<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>'), search: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'), warn: P('<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18v.01"/>'),
    spark: P('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>'),
    panel: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/>'), more: P('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    ask: P('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9.6 8.4a2.5 2.5 0 0 1 4.8 1c0 1.6-2.4 2-2.4 3.4M12 14.8v.01"/>'),
    split: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>'), chat: P('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 8v6M9 11h6"/>'),
    up: P('<path d="m18 15-6-6-6 6"/>'), down: P('<path d="m6 9 6 6 6-6"/>'), check: P('<path d="M20 6 9 17l-5-5"/>'), globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    find: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'), full: P('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'), power: P('<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>'),
    claude: P('<path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5M5.3 5.3l3.5 3.5M15.2 15.2l3.5 3.5M18.7 5.3l-3.5 3.5M8.8 15.2l-3.5 3.5" stroke-width="2.4"/>')
  };
  const fill = (id, ic) => { const e = $(id); if (e) e.innerHTML = ic; };
  fill('newTab', I.plus); fill('back', I.back); fill('fwd', I.fwd); fill('reload', I.reload); fill('home', I.atom); fill('menuBtn', I.more);
  fill('askIc', I.ask); fill('clIc', I.claude); fill('clIc2', I.claude); fill('clNew', I.chat); fill('clMode', I.split); fill('clClose', I.x);
  fill('findUp', I.up); fill('findDn', I.down); fill('findX', I.x);

  /* ---------- theme (title bar buttons follow it) ---------- */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const theme = () => H.theme(mq.matches); theme(); mq.addEventListener('change', theme);

  /* ---------- tabs ---------- */
  const tabs = []; let active = null, seq = 0;
  const isNew = (u) => !u || u.startsWith('critical://app/newtab');
  const isBlocked = (u) => (u || '').startsWith('critical://app/blocked');
  const isCrit = (u) => (u || '').startsWith('https://u23bodwells-cmyk.github.io/Critical/');
  function shown(u) { if (isNew(u)) return ''; if (isBlocked(u) || (u || '').startsWith('critical://app/error')) { try { return new URL(u).searchParams.get('u') || u; } catch (e) { return u; } } return u; }
  function toUrl(t) {
    t = (t || '').trim(); if (!t) return null;
    if (/^(https?|critical):\/\//i.test(t)) return t;
    if (/^localhost(:\d+)?(\/|$)/i.test(t)) return 'http://' + t;
    if (!/\s/.test(t) && /^[^\/\s]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(t)) return 'https://' + t;
    return 'https://www.google.com/search?q=' + encodeURIComponent(t);
  }
  function wvUrl(t) { try { return t.wv.getURL() || t.url; } catch (e) { return t.url; } }

  function newTab(url, o) {
    o = o || {};
    const t = { id: ++seq, url: url || INIT.newtab, title: o.pinned ? 'Critical' : 'New tab', fav: null, loading: true, pinned: !!o.pinned, zoom: 0, ready: false };
    const wv = document.createElement('webview'); t.wv = wv;
    wv.className = 'wv'; wv.setAttribute('partition', PART); wv.setAttribute('allowpopups', ''); wv.setAttribute('src', t.url);
    wv.addEventListener('page-title-updated', (e) => { t.title = e.title || t.title; paintTabs(); });
    wv.addEventListener('page-favicon-updated', (e) => { t.fav = (e.favicons && e.favicons[0]) || null; paintTabs(); });
    wv.addEventListener('did-start-loading', () => { t.loading = true; paintTabs(); if (t === active) paintBar(); });
    wv.addEventListener('did-stop-loading', () => { t.loading = false; paintTabs(); if (t === active) paintBar(); saveTabs(); });
    const nav = (e) => { if (e.isMainFrame === false) return; t.url = e.url || wvUrl(t); if (isNew(t.url)) { t.title = 'New tab'; t.fav = null; } if (isBlocked(t.url)) t.fav = null; if (t === active) paintBar(); paintTabs(); saveTabs(); };
    wv.addEventListener('did-navigate', nav); wv.addEventListener('did-navigate-in-page', nav);
    wv.addEventListener('dom-ready', () => { t.ready = true; if (t.zoom) try { wv.setZoomLevel(t.zoom); } catch (e) {} if (t === active) paintBar(); });
    wv.addEventListener('ipc-message', (e) => { if (e.channel === 'cb-go') go(e.args[0], t); });
    wv.addEventListener('found-in-page', (e) => { const r = e.result || {}; if (r.finalUpdate) $('findN').textContent = r.matches ? (r.activeMatchOrdinal + '/' + r.matches) : 'No matches'; });
    wv.addEventListener('enter-html-full-screen', () => document.body.classList.add('fs'));
    wv.addEventListener('leave-html-full-screen', () => document.body.classList.remove('fs'));
    wv.addEventListener('did-fail-load', (e) => {
      if (!e.isMainFrame || [-3, -20, -27].includes(e.errorCode)) return;
      const u = e.validatedURL || t.url; if (!/^https?:/i.test(u)) return;
      wv.loadURL('critical://app/error.html?u=' + encodeURIComponent(u) + '&c=' + encodeURIComponent(e.errorCode) + '&d=' + encodeURIComponent(e.errorDescription || ''));
    });
    $('views').appendChild(wv);
    const at = o.index != null ? o.index : (o.afterActive && active ? tabs.indexOf(active) + 1 : tabs.length);
    tabs.splice(at, 0, t);
    if (!o.background) activate(t); else paintTabs();
    saveTabs();
    return t;
  }
  function activate(t) {
    if (!t) return; active = t;
    tabs.forEach((x) => x.wv.classList.toggle('on', x === t));
    paintTabs(); paintBar(); closeFind();
    setTimeout(() => { if (isNew(t.url)) { $('addr').focus(); } else { try { t.wv.focus(); } catch (e) {} } }, 30);
  }
  function closeTab(t) {
    if (!t || t.pinned) return;
    const i = tabs.indexOf(t); if (i < 0) return;
    tabs.splice(i, 1); t.wv.remove();
    if (active === t) activate(tabs[Math.min(i, tabs.length - 1)] || tabs[0]); else paintTabs();
    saveTabs();
  }
  function critTab() { return tabs.find((t) => t.pinned); }
  function goHome() { const c = critTab(); if (!c) return; if (!isCrit(c.url)) c.wv.loadURL(INIT.crit); activate(c); }
  function saveTabs() { store.set('tabs', tabs.filter((t) => !t.pinned && /^https?:/.test(t.url)).map((t) => t.url).slice(0, 12)); }

  function paintTabs() {
    const box = $('tabs');
    box.innerHTML = tabs.map((t) => {
      const blk = isBlocked(t.url), ic = t.pinned ? I.atom : blk ? I.ban : null;
      const fav = t.loading && !t.pinned ? '<span class="spin"></span>' : ic ? ic : t.fav ? '<img src="' + esc(t.fav) + '" alt="">' : I.globe;
      const title = t.pinned ? 'Critical' : blk ? 'Blocked' : (t.title || shown(t.url) || 'New tab');
      return '<div class="tab' + (t === active ? ' on' : '') + (t.pinned ? ' pin' : '') + (blk ? ' blk' : '') + '" role="tab" tabindex="0" aria-selected="' + (t === active) + '" data-id="' + t.id + '" title="' + esc(title) + '"><span class="fav">' + fav + '</span><span class="tt">' + esc(title) + '</span>' + (t.pinned ? '' : '<button class="x" data-x="' + t.id + '" aria-label="Close tab" title="Close tab (Ctrl+W)">' + I.x + '</button>') + '</div>';
    }).join('');
    box.querySelectorAll('.tab').forEach((el) => {
      const t = tabs.find((x) => x.id === +el.dataset.id); if (!t) return;
      el.onmousedown = (e) => { if (e.button === 1) { e.preventDefault(); closeTab(t); } };
      el.onclick = (e) => { if (e.target.closest('.x')) { closeTab(t); return; } activate(t); };
      el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(t); } };
    });
    document.title = active ? (active.pinned ? 'Critical' : active.title || 'New tab') + ' · Critical Browser' : 'Critical Browser';
  }
  function paintBar() {
    const t = active; if (!t) return;
    const u = t.url, a = $('addr');
    if (document.activeElement !== a) a.value = shown(u);
    let back = false, fwd = false; try { if (t.ready) { back = t.wv.canGoBack(); fwd = t.wv.canGoForward(); } } catch (e) {}
    $('back').disabled = !back; $('fwd').disabled = !fwd;
    $('reload').innerHTML = t.loading ? I.stop : I.reload; $('reload').title = t.loading ? 'Stop' : 'Reload (Ctrl+R)';
    const sec = $('sec'); sec.className = '';
    if (isNew(u)) sec.innerHTML = I.search; else if (isBlocked(u)) { sec.innerHTML = I.ban; sec.className = 'blk'; } else if (/^https:/.test(u)) sec.innerHTML = I.lock; else if (/^http:/.test(u)) sec.innerHTML = I.warn; else sec.innerHTML = I.atom;
  }

  /* ---------- toolbar ---------- */
  $('newTab').onclick = () => newTab();
  $('back').onclick = () => { try { active.wv.goBack(); } catch (e) {} };
  $('fwd').onclick = () => { try { active.wv.goForward(); } catch (e) {} };
  $('reload').onclick = () => { try { if (active.loading) active.wv.stop(); else active.wv.reload(); } catch (e) {} };
  $('home').onclick = goHome;
  $('omni').onsubmit = (e) => { e.preventDefault(); const u = toUrl($('addr').value); if (!u || !active) return; if (active.pinned && !isCrit(u)) { newTab(u, { afterActive: true }); paintBar(); return; } active.wv.loadURL(u); active.url = u; active.wv.focus(); };
  $('addr').onfocus = () => setTimeout(() => $('addr').select(), 0);
  $('addr').onkeydown = (e) => { if (e.key === 'Escape') { $('addr').value = shown(active && active.url); $('addr').blur(); try { active.wv.focus(); } catch (_) {} } };

  /* ---------- status pill ---------- */
  function paintPill() {
    const p = $('pill'); let cls, ic, txt, tip;
    if (S.done) { cls = 'done'; ic = I.unlock; txt = 'Plan done'; tip = 'Today\'s plan is done: TikTok, Shorts and social are unlocked.'; }
    else if (S.inWindow) { cls = 'plan'; ic = I.atom; txt = 'Plan time' + (S.left != null ? ' · ' + S.left + ' left' : ''); tip = 'It\'s plan time. Social sites unlock when today\'s plan is done.'; }
    else if (!S.known) { cls = 'unknown'; ic = I.lock; txt = 'Social blocked'; tip = 'Open Critical so the browser can see today\'s plan.'; }
    else { cls = 'blocked'; ic = I.lock; txt = 'Social blocked'; tip = 'TikTok, Shorts and social unlock when today\'s plan is done.'; }
    p.className = 'pill ' + cls; p.innerHTML = ic + '<span class="pt">' + esc(txt) + '</span>'; p.title = tip; p.setAttribute('aria-label', txt + '. ' + tip);
  }
  function hm(m) { if (m == null) return ''; return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
  function tm(ms) { return ms ? new Date(ms).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }) : ''; }
  function openStatus() {
    const pop = $('statusPop'); if (!pop.hidden) { pop.hidden = true; return; } closePops();
    const lines = [];
    if (S.done) lines.push('<h3>✓ Today\'s plan is done</h3><p>TikTok, YouTube Shorts and social sites are unlocked until tomorrow.</p>');
    else {
      lines.push('<h3>' + (S.inWindow ? '📘 Plan time' : '🔒 Social sites are blocked') + '</h3>');
      if (!S.known) lines.push('<p>Open Critical (the first tab) so the browser can check today\'s plan.</p>');
      else lines.push('<p>' + (S.left != null ? '<b>' + S.left + '</b> part' + (S.left === 1 ? '' : 's') + ' of today\'s plan left' + (S.mins ? ' (about ' + hm(S.mins) + ')' : '') + '. ' : '') + (S.lessons ? S.lessons + ' lesson' + (S.lessons === 1 ? '' : 's') + ' done today. ' : '') + '</p>');
      if (S.due && !S.inWindow && Date.now() < S.due) lines.push('<p>Plan time starts at <b>' + tm(S.due) + '</b>. Critical Browser will open itself then.</p>');
      if (S.skipped) lines.push('<p>You took today off the plan-time lock. Social sites still unlock only when the plan\'s done.</p>');
      lines.push('<p>Blocked until then:</p><div class="chips">' + ['TikTok', 'YouTube Shorts', 'Instagram', 'Snapchat', 'X', 'Reddit', 'Facebook', 'Discord', 'Twitch', 'Pinterest', 'Threads', 'and more'].map((n) => '<span class="chip">' + n + '</span>').join('') + '</div>');
      if (S.blocksToday) lines.push('<p>You\'ve hit the block <b>' + S.blocksToday + '</b> time' + (S.blocksToday === 1 ? '' : 's') + ' today.</p>');
    }
    lines.push('<div class="row"><button class="btn pri" id="spCrit">Go to Critical</button><button class="btn" id="spClaude">Claude mode</button></div>');
    pop.innerHTML = lines.join(''); place(pop, $('pill')); pop.hidden = false;
    $('spCrit').onclick = () => { pop.hidden = true; goHome(); };
    $('spClaude').onclick = () => { pop.hidden = true; claudeMode(); };
  }
  $('pill').onclick = openStatus;
  function place(pop, anchor) { const r = anchor.getBoundingClientRect(); pop.style.top = (r.bottom + 6) + 'px'; pop.style.right = Math.max(8, innerWidth - r.right) + 'px'; pop.style.left = 'auto'; }
  function closePops() { $('menu').hidden = true; $('statusPop').hidden = true; }
  document.addEventListener('mousedown', (e) => { if (!e.target.closest('.pop') && !e.target.closest('#menuBtn') && !e.target.closest('#pill')) closePops(); });

  /* ---------- Claude ---------- */
  let claudeWv = null;
  const cw = store.get('cw', 0.33);
  document.documentElement.style.setProperty('--cw', Math.round(innerWidth * cw) + 'px');
  function claudeOpen(on) {
    const a = $('claude'), want = on == null ? a.hidden : !!on;
    a.hidden = !want; $('rz').hidden = !want; $('claudeBtn').setAttribute('aria-pressed', String(want));
    if (want && !claudeWv) {
      claudeWv = document.createElement('webview'); claudeWv.setAttribute('partition', PART); claudeWv.setAttribute('allowpopups', ''); claudeWv.setAttribute('src', CLAUDE);
      claudeWv.addEventListener('ipc-message', (e) => { if (e.channel === 'cb-go') go(e.args[0]); });
      $('claudeBody').appendChild(claudeWv);
    }
    if (want) setTimeout(() => { try { claudeWv.focus(); } catch (e) {} }, 50);
    store.set('claudeOpen', want);
  }
  function claudeMode() { goHome(); setCw(0.42); claudeOpen(true); }
  function setCw(f) { f = Math.max(0.22, Math.min(0.7, f)); document.documentElement.style.setProperty('--cw', Math.round(innerWidth * f) + 'px'); store.set('cw', f); }
  $('claudeBtn').onclick = () => claudeOpen();
  $('clClose').onclick = () => claudeOpen(false);
  $('clNew').onclick = () => { if (claudeWv) claudeWv.loadURL(CLAUDE); };
  $('clMode').onclick = claudeMode;
  addEventListener('resize', () => setCw(store.get('cw', 0.33)));
  $('rz').onpointerdown = (e) => {
    e.preventDefault(); $('rz').setPointerCapture(e.pointerId); document.body.classList.add('rzing');
    const mv = (ev) => setCw((innerWidth - ev.clientX) / innerWidth);
    const up = () => { $('rz').removeEventListener('pointermove', mv); $('rz').removeEventListener('pointerup', up); document.body.classList.remove('rzing'); };
    $('rz').addEventListener('pointermove', mv); $('rz').addEventListener('pointerup', up);
  };
  async function insertClaude(text) {
    for (let i = 0; i < 24; i++) {
      try {
        const ok = await claudeWv.executeJavaScript('(function(t){var el=document.querySelector(\'div.ProseMirror[contenteditable="true"]\')||document.querySelector(\'div[contenteditable="true"]\')||document.querySelector("textarea");if(!el)return false;el.focus();if(el.tagName==="TEXTAREA"){el.value=(el.value?el.value+"\\n":"")+t;el.dispatchEvent(new Event("input",{bubbles:true}));return true}var r=document.createRange();r.selectNodeContents(el);r.collapse(false);var s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand("insertText",false,t);return true})(' + JSON.stringify(text) + ')');
        if (ok) { claudeWv.focus(); return true; }
      } catch (e) {}
      await sleep(500);
    }
    return false;
  }
  async function ask(given) {
    const t = active; let sel = given;
    if (sel == null && t && !isNew(t.url)) { try { sel = await t.wv.executeJavaScript('String((window.getSelection&&getSelection())||"").slice(0,6000)'); } catch (e) { sel = ''; } }
    sel = (sel || '').trim();
    const url = t ? shown(t.url) : '', title = t ? (t.pinned ? 'Critical' : t.title) : '';
    let q;
    if (sel) q = isCrit(url) ? 'I\'m studying in my app Critical. Can you help me understand this?\n\n"' + sel + '"' : 'Can you help me understand this, from "' + title + '"?\n\n"' + sel + '"\n\n' + url;
    else if (url && !isBlocked(t.url)) q = isCrit(url) ? 'I\'m studying in my app Critical and I\'m stuck. Can you help?' : 'I\'m looking at "' + title + '" (' + url + '). Can you help me with it?';
    else q = '';
    claudeOpen(true);
    if (!q) return;
    const ok = await insertClaude(q);
    if (ok) toast('Your question is in Claude\'s message box. Check it, then press Enter.');
    else { try { await navigator.clipboard.writeText(q); } catch (e) {} toast('Copied your question. Sign in to Claude if you need to, then click its message box and press Ctrl+V.'); }
  }
  $('askBtn').onclick = () => ask();

  /* ---------- find in page ---------- */
  function openFind() { $('find').hidden = false; const i = $('findIn'); i.focus(); i.select(); if (i.value) doFind(true); }
  function doFind(fwd, next) { const q = $('findIn').value; if (!active) return; if (!q) { try { active.wv.stopFindInPage('clearSelection'); } catch (e) {} $('findN').textContent = ''; return; } try { active.wv.findInPage(q, { forward: fwd !== false, findNext: !!next }); } catch (e) {} }
  function closeFind() { if ($('find').hidden) return; $('find').hidden = true; try { active.wv.stopFindInPage('clearSelection'); } catch (e) {} }
  $('findIn').oninput = () => doFind(true, false);
  $('findIn').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); doFind(!e.shiftKey, true); } if (e.key === 'Escape') { closeFind(); try { active.wv.focus(); } catch (_) {} } };
  $('findUp').onclick = () => doFind(false, true); $('findDn').onclick = () => doFind(true, true); $('findX').onclick = closeFind;

  /* ---------- zoom ---------- */
  function zoom(d) { const t = active; if (!t) return; t.zoom = d === 0 ? 0 : Math.max(-3, Math.min(5, t.zoom + d)); try { t.wv.setZoomLevel(t.zoom); } catch (e) {} toast('Zoom ' + Math.round(Math.pow(1.2, t.zoom) * 100) + '%'); }

  /* ---------- menu ---------- */
  function openMenu() {
    const m = $('menu'); if (!m.hidden) { m.hidden = true; return; } closePops();
    const z = active ? Math.round(Math.pow(1.2, active.zoom) * 100) : 100;
    m.innerHTML = '<button data-a="new">' + I.plus + 'New tab<span class="k">Ctrl+T</span></button><button data-a="mode">' + I.split + 'Claude mode<span class="k">Critical + Claude</span></button><button data-a="find">' + I.find + 'Find in page<span class="k">Ctrl+F</span></button>' +
      '<div class="zoom"><span>Zoom</span><button data-a="zo" aria-label="Zoom out">−</button><b style="min-width:44px;text-align:center">' + z + '%</b><button data-a="zi" aria-label="Zoom in">+</button></div>' +
      '<button data-a="full">' + I.full + 'Full screen<span class="k">F11</span></button><hr><button data-a="set">' + I.gear + 'Settings</button>' +
      (S.updateReady ? '<button data-a="upd">' + I.reload + 'Restart to update to ' + esc(S.updateReady) + '</button>' : '') +
      '<button data-a="quit"' + (S.canQuit ? '' : ' disabled title="You can quit once today\'s plan is done"') + '>' + I.power + (S.canQuit ? 'Quit Critical Browser' : 'Quit (after today\'s plan)') + '</button>';
    const r = $('menuBtn').getBoundingClientRect(); m.style.top = (r.bottom + 6) + 'px'; m.style.right = Math.max(8, innerWidth - r.right) + 'px'; m.style.left = 'auto'; m.hidden = false;
    m.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => {
      const a = b.dataset.a; if (a !== 'zi' && a !== 'zo') m.hidden = true;
      if (a === 'new') newTab(); else if (a === 'mode') claudeMode(); else if (a === 'find') openFind(); else if (a === 'full') H.fullscreen(); else if (a === 'set') openSettings();
      else if (a === 'zi' || a === 'zo') { zoom(a === 'zi' ? 0.5 : -0.5); m.querySelector('.zoom b').textContent = Math.round(Math.pow(1.2, active.zoom) * 100) + '%'; }
      else if (a === 'upd') H.installUpdate(); else if (a === 'quit') H.quit();
    });
  }
  $('menuBtn').onclick = openMenu;

  /* ---------- settings ---------- */
  async function openSettings() {
    const sh = $('sheet'), d = await H.displays() || [], locked = S.inWindow && S.strict !== 'gentle';
    const lv = [['gentle', 'Gentle', 'Opens itself at plan time. You can close it whenever you like.'], ['firm', 'Firm', 'Opens at plan time and won\'t close until the plan is done. If you minimise it, it comes back after 2 minutes.'], ['harsh', 'Harsh', 'Like Firm, but full screen, and it comes back after 15 seconds.']];
    sh.innerHTML = '<div class="sh"><b>Settings</b><button class="ib" id="shX" aria-label="Close settings">' + I.x + '</button></div><div class="sb">' +
      '<h4>How strict at plan time</h4><div class="seg">' + lv.map((l) => '<label class="' + (locked && l[0] === 'gentle' ? 'dis' : '') + '"><input type="radio" name="lv" value="' + l[0] + '"' + (S.strict === l[0] ? ' checked' : '') + (locked && l[0] === 'gentle' ? ' disabled' : '') + '><span><b>' + l[1] + '</b><span>' + l[2] + '</span></span></label>').join('') + '</div>' + (locked ? '<p class="note">You can\'t switch to Gentle during plan time.</p>' : '') +
      '<h4>Study screen</h4><p class="note" style="margin-top:0">Where Critical Browser opens at plan time. Screens are listed left to right.</p><div class="scr" style="margin-top:8px">' + d.map((x) => '<button data-s="' + x.i + '" aria-pressed="' + (S.screen === x.i || (S.screen == null && x.primary)) + '">' + esc(x.label) + '<small>' + x.w + '×' + x.h + '</small></button>').join('') + '</div><div class="row"><button class="btn" id="shTest">Move here now</button></div>' +
      '<h4>At plan time</h4><label class="tog"><input type="checkbox" id="shCl"' + (S.claudeAtPlan ? ' checked' : '') + '> Open Claude next to Critical (Claude mode)</label><label class="tog"><input type="checkbox" id="shAuto"' + (S.autostart ? ' checked' : '') + '> Start Critical Browser with Windows (it waits by the clock until plan time)</label>' +
      '<h4>Blocked until today\'s plan is done</h4><div class="chips">' + S.core.filter((x, i, a) => a.indexOf(x) === i).map((x) => '<span class="chip">' + esc(x) + '</span>').join('') + '<span class="chip">youtube.com/shorts</span></div>' +
      '<h4>Also block</h4><textarea id="shExtra" placeholder="One website per line, like roblox.com" aria-label="Extra websites to block">' + esc((S.extra || []).join('\n')) + '</textarea><p class="note">' + (S.done ? 'You can add or remove sites.' : 'You can add sites now. Removing them only works once today\'s plan is done.') + '</p><div class="row"><button class="btn" id="shSave">Save list</button></div>' +
      '<h4>About</h4><p class="note" style="margin-top:0">Critical Browser ' + esc(S.version) + '. Updates download by themselves from GitHub.</p><div class="row"><button class="btn" id="shUpd">Check for updates</button>' + (S.updateReady ? '<button class="btn pri" id="shInst">Restart to update</button>' : '') + '</div><p class="note" id="shMsg"></p></div>';
    sh.hidden = false;
    $('shX').onclick = () => { sh.hidden = true; };
    sh.querySelectorAll('input[name=lv]').forEach((r) => r.onchange = async () => { S = await H.settings({ strict: r.value }); paintAll(); });
    sh.querySelectorAll('[data-s]').forEach((b) => b.onclick = async () => { S = await H.settings({ screen: +b.dataset.s }); sh.querySelectorAll('[data-s]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); });
    $('shTest').onclick = () => { const b = sh.querySelector('[data-s][aria-pressed=true]'); H.testDisplay(b ? +b.dataset.s : 0); };
    $('shCl').onchange = async (e) => { S = await H.settings({ claudeAtPlan: e.target.checked }); };
    $('shAuto').onchange = async (e) => { S = await H.settings({ autostart: e.target.checked }); };
    $('shSave').onclick = async () => { S = await H.settings({ extra: $('shExtra').value }); $('shExtra').value = (S.extra || []).join('\n'); $('shMsg').textContent = 'Saved. ' + (S.extra.length ? S.extra.length + ' extra site' + (S.extra.length === 1 ? '' : 's') + ' blocked.' : ''); };
    $('shUpd').onclick = async () => { $('shMsg').textContent = 'Checking…'; const r = await H.checkUpdates(); $('shMsg').textContent = !r ? '' : r.ok ? (r.latest && r.latest !== S.version ? 'Downloading version ' + r.latest + '…' : 'You\'re on the latest version.') : r.why; };
    const ins = $('shInst'); if (ins) ins.onclick = () => H.installUpdate();
  }

  /* ---------- plan-time lock ---------- */
  function showLock(s) {
    const L = $('lock'); s = s || S;
    L.innerHTML = '<div class="lk"><div class="big">📘</div><h2 id="lockH">Not yet: it\'s plan time</h2><p>' + (s.left != null ? 'You\'ve got <b>' + s.left + '</b> part' + (s.left === 1 ? '' : 's') + ' of today\'s plan left' + (s.mins ? ', about ' + hm(s.mins) : '') + '. ' : '') + 'Critical Browser stays open until it\'s done.</p><p>Stuck? Open Claude mode and ask.</p><div class="row"><button class="btn pri" id="lkGo">Back to Critical</button><button class="btn" id="lkCl">Claude mode</button><button class="btn" id="lkOff">Let me off today…</button></div></div>';
    L.hidden = false; $('lkGo').focus();
    $('lkGo').onclick = () => { L.hidden = true; goHome(); };
    $('lkCl').onclick = () => { L.hidden = true; claudeMode(); };
    $('lkOff').onclick = () => offToday();
  }
  async function offToday() {
    const L = $('lock'); await H.skipBegin(); let n = 60;
    L.innerHTML = '<div class="lk"><div class="big">⏳</div><h2 id="lockH">Take a minute</h2><p>If you still want to stop after this, you can. Think about whether 10 more minutes would get you there.</p><div class="count" id="lkN">60</div><div class="row"><button class="btn pri" id="lkBack">Never mind, back to it</button></div></div>';
    $('lkBack').onclick = () => { clearInterval(iv); L.hidden = true; goHome(); };
    const iv = setInterval(() => {
      n--; const e = $('lkN'); if (e) e.textContent = n; if (n > 0) return; clearInterval(iv);
      const phrase = 'I will catch up tomorrow';
      L.querySelector('.lk').innerHTML = '<div class="big">✍️</div><h2 id="lockH">Type this to stop for today</h2><p><b>' + phrase + '</b></p><input id="lkIn" autocomplete="off" spellcheck="false" aria-label="Type the sentence"><p class="note" style="font-size:12.5px">The plan-time lock switches off for today. TikTok, Shorts and social still stay blocked until the plan\'s done.</p><div class="row"><button class="btn pri" id="lkBack2">Back to it</button><button class="btn" id="lkStop" disabled>Stop for today</button></div>';
      const inp = $('lkIn'); inp.focus();
      inp.oninput = () => { $('lkStop').disabled = inp.value.trim().toLowerCase().replace(/[.!]$/, '') !== phrase.toLowerCase(); };
      $('lkBack2').onclick = () => { L.hidden = true; goHome(); };
      $('lkStop').onclick = async () => { const ok = await H.skipToday(); L.hidden = true; toast(ok ? 'OK. The plan-time lock is off for today. Social sites still unlock only when the plan\'s done.' : 'That didn\'t work. Try again.'); S = await H.state(); paintAll(); };
    }, 1000);
  }

  /* ---------- toasts ---------- */
  function toast(msg, action) {
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = '<span>' + esc(msg) + '</span>';
    if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = () => { action.fn(); t.remove(); }; t.appendChild(b); }
    $('toasts').appendChild(t); setTimeout(() => t.remove(), action ? 8000 : 4500);
    while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
  }

  /* ---------- actions from the browser's own pages ---------- */
  function go(what, from) {
    if (what === 'critical') goHome();
    else if (what === 'claude') claudeMode();
    else if (what === 'back' && from) { try { if (from.wv.canGoBack()) from.wv.goBack(); else closeTab(from); } catch (e) {} }
    else if (what === 'settings') openSettings();
    else if (/^https?:\/\//.test(what)) { if (from && !from.pinned) from.wv.loadURL(what); else newTab(what); }
  }

  /* ---------- messages from the main process ---------- */
  function paintAll() { paintPill(); paintBar(); }
  H.on('state', (s) => { const was = S.done; S = s; paintAll(); if (!was && s.done) $('banner').hidden = true; });
  H.on('open-tab', (url, bg) => newTab(url, { background: !!bg, afterActive: true }));
  H.on('lock-prompt', (s) => showLock(s));
  H.on('toast', (msg, file) => toast(msg, file ? { label: 'Show in folder', fn: () => H.showFile(file) } : null));
  H.on('ask-claude', (text) => ask(text));
  H.on('plan-time', (s) => {
    S = s; paintAll(); goHome(); if (s.claudeAtPlan) claudeMode();
    if (s.first) { const b = $('banner'); b.innerHTML = '<b>📘 Plan time.</b><span>Critical and Claude are ready. Social sites unlock when today\'s plan is done.</span><span class="grow"></span><button class="btn" id="bnX">OK</button>'; b.hidden = false; $('bnX').onclick = () => { b.hidden = true; }; }
  });
  H.on('shortcut', (k) => {
    const i = tabs.indexOf(active);
    if (k === 'new-tab') newTab(); else if (k === 'close-tab') closeTab(active); else if (k === 'focus-address') { $('addr').focus(); }
    else if (k === 'next-tab') activate(tabs[(i + 1) % tabs.length]); else if (k === 'prev-tab') activate(tabs[(i - 1 + tabs.length) % tabs.length]);
    else if (k === 'reload') { try { active.wv.reload(); } catch (e) {} } else if (k === 'back') { try { active.wv.goBack(); } catch (e) {} } else if (k === 'forward') { try { active.wv.goForward(); } catch (e) {} }
    else if (k === 'find') openFind(); else if (k === 'claude') claudeOpen(); else if (k === 'ask') ask();
    else if (k === 'zoom-in') zoom(0.5); else if (k === 'zoom-out') zoom(-0.5); else if (k === 'zoom-reset') zoom(0); else if (k === 'home') goHome();
    else if (/^tab-\d$/.test(k)) { const n = +k.slice(4); activate(n === 9 ? tabs[tabs.length - 1] : tabs[n - 1]); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePops(); if (!$('sheet').hidden) $('sheet').hidden = true; } });

  /* ---------- start ---------- */
  newTab(INIT.crit, { pinned: true });
  if (!INIT.selftest) store.get('tabs', []).forEach((u) => { if (/^https?:\/\//.test(u)) newTab(u, { background: true }); });
  activate(critTab());
  if (store.get('claudeOpen', false)) claudeOpen(true);
  paintAll();
  setInterval(paintBar, 1500);

  // hooks the automated self-test uses
  window.CB = { openTab: (u) => { newTab(u); return true; }, activeUrl: () => (active ? wvUrl(active) : ''), activeTitle: () => (active ? active.title : ''), tabUrl: (i) => (tabs[i] ? wvUrl(tabs[i]) : ''),
    toggleClaude: (on) => { claudeOpen(on); return true; }, claudeUrl: () => { try { return claudeWv ? claudeWv.getURL() : ''; } catch (e) { return ''; } }, count: () => tabs.length, state: () => S, lock: () => { showLock(S); return true; }, settings: () => { openSettings(); return true; } };
})();
