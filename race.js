/* Critical Race: live multiplayer, joined with a short game code (like Quizlet Live).
   The host's device runs the game and sends everyone the questions; players connect peer-to-peer through the free
   PeerJS relay, so no server of our own is needed and guests never see the host's private data.
   Modes: Streak race (first to N right in a row: one wrong answer and your streak goes back to zero)
          Clash race (everyone plays Critical Clash; first to N right answers in a row in Clash wins). */
(function () {
'use strict';
if (window.CRACE) return;
var PEERJS = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js', PRE = 'critical-race-v1-', ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
var EMO = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐨', '🐧', '🦉', '🐲', '🚀', '⚛️', '🔥', '🐝', '🦖'];
var TARGETS = [5, 8, 10, 15];
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
/* questions arrive from another device: keep only harmless formatting */
var OK_TAGS = { B: 1, I: 1, EM: 1, STRONG: 1, SUP: 1, SUB: 1, BR: 1, SPAN: 1, U: 1, SMALL: 1 };
function clean(h) {
  var d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h).slice(0, 4000);
  (function walk(n) { [].slice.call(n.childNodes).forEach(function (c) {
    if (c.nodeType === 3) return;
    if (c.nodeType !== 1 || !OK_TAGS[c.tagName]) { if (c.nodeType === 1 && !/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|TEMPLATE)$/.test(c.tagName)) { walk(c); while (c.firstChild) n.insertBefore(c.firstChild, c); } n.removeChild(c); return; }
    [].slice.call(c.attributes).forEach(function (a) { c.removeAttribute(a.name); }); walk(c); }); })(d);
  return d.innerHTML;
}
function cleanPack(p) { return (Array.isArray(p) ? p : []).slice(0, 200).map(function (q) { var o = { k: String(q.k || ''), p: clean(q.p), e: clean(q.e || ''), done: true };
  if (q.t === 'N' && isFinite(+q.a)) { o.t = 'N'; o.a = +q.a; o.tol = isFinite(+q.tol) ? +q.tol : 0.02; o.u = clean(q.u || ''); } else if (Array.isArray(q.o) && q.o.length >= 2 && q.a >= 0 && q.a < q.o.length) { o.o = q.o.slice(0, 6).map(clean); o.a = +q.a; } else return null; return o; }).filter(Boolean); }
function parseNum(s) { s = String(s).trim().replace(/[−–]/g, '-').replace(/,/g, '').replace(/\s/g, '').replace(/%$/, ''); s = s.replace(/[x×*]10\^?/i, 'e').replace(/\^/, ''); if (s === '' || s === '-') return NaN; return Number(s); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function mkCode() { var s = ''; for (var i = 0; i < 5; i++) s += ALPH.charAt(Math.floor(Math.random() * ALPH.length)); return s; }
function normCode(t) { return String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('critical_race_' + k) || 'null'); localStorage.setItem('critical_race_' + k, JSON.stringify(v)); } catch (e) { return null; } }
function loadPeer(cb) { if (window.Peer) { cb(true); return; } var s = document.createElement('script'); s.src = PEERJS; s.onload = function () { cb(!!window.Peer); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
function sfx(k) { try { if (window.CRACE_SFX) window.CRACE_SFX(k); } catch (e) {} }

/* ---------- state ---------- */
var root = null, hud = null, peer = null, conns = {}, hostConn = null, opts = {}, isHost = false, myId = 'host', code = '', G = null, Q = null, boardT = 0, lock = 0;
function blank() { return { phase: 'lobby', mode: 'streak', target: 8, title: '', topic: '', pack: [], players: {}, winner: null }; }
function me() { return G && G.players[myId]; }

/* ---------- screen ---------- */
var CSS = '.crace{position:fixed;inset:0;z-index:2147483000;overflow:auto;background:radial-gradient(900px 500px at 50% -200px,rgba(83,74,183,.55),transparent 70%),#0b0f1a;color:#e8ecf6;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:max(16px,env(safe-area-inset-top)) 16px 40px}' +
 '.crace *{box-sizing:border-box}.crw{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:14px}.crtop{display:flex;align-items:center;gap:10px}.crtop h1{flex:1;margin:0;font-size:22px;letter-spacing:.02em}.crx{font:inherit;font-weight:700;background:rgba(255,255,255,.08);color:#e8ecf6;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 12px;cursor:pointer}' +
 '.crc{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:16px}.crc h2{margin:0 0 8px;font-size:18px}.crmuted{color:#9aa6c4;font-size:14px;margin:4px 0}' +
 '.crcode{font:900 54px/1 ui-monospace,Consolas,monospace;letter-spacing:.18em;text-align:center;padding:14px 0 6px;background:linear-gradient(90deg,#7c6cf0,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}' +
 '.crb{font:inherit;font-weight:800;border:0;border-radius:14px;padding:13px 20px;background:linear-gradient(90deg,#7c6cf0,#5b8cff);color:#fff;cursor:pointer;font-size:17px}.crb:disabled{opacity:.5;cursor:default}.crb.alt{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}.crb.big{width:100%;padding:16px;font-size:19px}' +
 '.crin{font:inherit;font-size:18px;padding:12px 14px;border-radius:12px;border:2px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff;width:100%}.crin:focus{outline:none;border-color:#7c6cf0}.crin.code{font:800 26px ui-monospace,Consolas,monospace;letter-spacing:.2em;text-transform:uppercase;text-align:center}' +
 '.crrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.crseg{display:flex;gap:6px;flex-wrap:wrap}.crseg button{font:inherit;font-weight:700;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:#e8ecf6;border-radius:12px;padding:9px 14px;cursor:pointer}.crseg button[aria-pressed=true]{border-color:#7c6cf0;background:rgba(124,108,240,.3)}' +
 '.cremo{display:flex;gap:6px;flex-wrap:wrap}.cremo button{font-size:24px;width:46px;height:46px;border-radius:12px;border:2px solid transparent;background:rgba(255,255,255,.06);cursor:pointer}.cremo button[aria-pressed=true]{border-color:#7c6cf0;background:rgba(124,108,240,.3)}' +
 '.crpl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.crp{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.07);font-weight:700;animation:crpop .35s}.crp span{font-size:24px}.crp em{font-style:normal;font-size:12px;color:#9aa6c4;margin-left:auto}@keyframes crpop{from{transform:scale(.7);opacity:0}}' +
 '.crlanes{display:flex;flex-direction:column;gap:8px}.crlane{position:relative;height:42px;border-radius:12px;background:rgba(255,255,255,.06);overflow:hidden}.crlane.me{box-shadow:0 0 0 2px #7c6cf0}.crlane i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(124,108,240,.45),rgba(34,211,238,.45));transition:width .4s cubic-bezier(.3,1.3,.5,1)}.crlane b{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:26px;transition:left .4s cubic-bezier(.3,1.3,.5,1)}.crln{font:700 13px system-ui,sans-serif;margin-right:8px;color:#c7cee3;max-width:120px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}.crlane em{position:absolute;right:12px;top:50%;transform:translateY(-50%);font:800 15px ui-monospace,monospace;font-style:normal}.crlane .crflag{position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:18px;opacity:.6}' +
 '.crq{font-size:20px;line-height:1.5;margin:4px 0 12px}.cropts{display:grid;gap:8px}.cropt{font:inherit;font-size:17px;text-align:left;padding:14px 16px;border-radius:14px;border:2px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#e8ecf6;cursor:pointer}.cropt:hover{border-color:#7c6cf0}.cropt.ok{border-color:#4ade80;background:rgba(74,222,128,.18)}.cropt.no{border-color:#f87171;background:rgba(248,113,113,.18)}.cropt:disabled{cursor:default}' +
 '.crstreak{display:flex;align-items:center;gap:12px}.crstreak b{font:900 44px/1 ui-monospace,monospace}.crstreak span{color:#9aa6c4;font-weight:700}.crstreak .crfire{font-size:34px}.crfb{min-height:1.5em;margin-top:10px;font-weight:700}.crfb.no{color:#fca5a5}.crfb.ok{color:#86efac}.crshake{animation:crsh .4s}@keyframes crsh{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(4px)}}' +
 '.crwin{text-align:center;padding:10px 0}.crwin .crbig{font-size:72px;line-height:1.1;animation:crpop .6s}.crwin h2{font-size:28px;margin:6px 0}.crpod{display:flex;flex-direction:column;gap:6px;margin-top:10px}.crpod div{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.07);font-weight:700}.crpod div:first-child{background:linear-gradient(90deg,rgba(245,197,66,.35),rgba(255,255,255,.07))}.crpod em{margin-left:auto;font-style:normal;font-family:ui-monospace,monospace}' +
 '.crhud{position:fixed;top:max(10px,env(safe-area-inset-top));right:10px;z-index:2147483100;background:rgba(11,15,26,.88);color:#e8ecf6;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:8px 10px;font:600 13px system-ui,sans-serif;min-width:170px;pointer-events:none;backdrop-filter:blur(6px)}.crhud b{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#a9a2ef;margin-bottom:4px}.crhud div{display:flex;gap:6px;align-items:center}.crhud em{margin-left:auto;font-style:normal;font-family:ui-monospace,monospace}' +
 '.crerr{color:#fca5a5;font-weight:700;min-height:1.4em}.crspin{width:28px;height:28px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#7c6cf0;animation:crsp .8s linear infinite;margin:10px auto}@keyframes crsp{to{transform:rotate(360deg)}}' +
 '@media (max-width:560px){.crcode{font-size:42px}.crq{font-size:18px}}@media (prefers-reduced-motion:reduce){.crace *{animation:none!important;transition:none!important}}';
function ensureCss() { if (document.getElementById('craceCss')) return; var s = document.createElement('style'); s.id = 'craceCss'; s.textContent = CSS; document.head.appendChild(s); }
function open() { ensureCss(); if (!root) { root = document.createElement('div'); root.className = 'crace'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Critical Race'); document.body.appendChild(root); document.body.classList.add('noscroll'); } return root; }
function view(html) { open(); root.hidden = false; root.innerHTML = '<div class="crw">' + html + '</div>'; var x = root.querySelector('[data-a=leave]'); if (x) x.onclick = leave; return root; }
function top(t) { return '<div class="crtop"><h1>🏁 ' + t + '</h1><button type="button" class="crx" data-a="leave">' + (opts.standalone ? 'Leave' : '✕ Close') + '</button></div>'; }
function leave() { try { Object.keys(conns).forEach(function (k) { conns[k].close(); }); } catch (e) {} try { if (hostConn) hostConn.close(); } catch (e) {} try { if (peer) peer.destroy(); } catch (e) {} peer = null; conns = {}; hostConn = null; G = null; Q = null; clearHud(); try { if (window.CRIT_ARENA_API) delete window.CRIT_ARENA_API.race; } catch (e) {}
  if (root) { root.remove(); root = null; } document.body.classList.remove('noscroll'); if (opts.onLeave) try { opts.onLeave(); } catch (e) {} }

/* ---------- connections ---------- */
function send(c, m) { try { if (c && c.open) c.send(m); } catch (e) {} }
function broadcast(m) { Object.keys(conns).forEach(function (k) { send(conns[k], m); }); }
function publicPlayers() { var o = {}; Object.keys(G.players).forEach(function (k) { var p = G.players[k]; o[k] = { name: p.name, emo: p.emo, streak: p.streak || 0, best: p.best || 0, right: p.right || 0, n: p.n || 0, host: !!p.host }; }); return o; }
function pushBoard(now) { if (!isHost) return; var t = Date.now(); if (!now && t - boardT < 250) { clearTimeout(pushBoard.t); pushBoard.t = setTimeout(function () { pushBoard(true); }, 260); return; } boardT = t; broadcast({ t: 'board', players: publicPlayers() }); }
function lobbyMsg() { return { t: 'lobby', mode: G.mode, target: G.target, topic: G.topic, players: publicPlayers() }; }

/* ---------- hosting ---------- */
function host(o) { opts = o || {}; isHost = true; myId = 'host'; G = blank(); var nm = store('name') || 'Host', em = store('emo') || EMO[0];
  G.players.host = { name: nm, emo: em, host: true, streak: 0, best: 0, right: 0, n: 0 }; G.topic = (opts.tracks && opts.tracks[0] && opts.tracks[0].id) || '';
  view(top('Race friends') + '<div class="crc" style="text-align:center"><div class="crspin"></div><p class="crmuted">Setting up a game code…</p></div>');
  loadPeer(function (ok) { if (!ok) { fatal('Couldn\'t load the race connection. Check your internet and try again.'); return; } tryCode(0); }); }
function tryCode(n) { code = mkCode(); try { peer = new window.Peer(PRE + code, { debug: 0 }); } catch (e) { fatal('Your browser can\'t make live connections (WebRTC).'); return; }
  peer.on('open', function () { lobby(); });
  peer.on('error', function (e) { if (e && e.type === 'unavailable-id' && n < 4) { try { peer.destroy(); } catch (_) {} tryCode(n + 1); return; } if (G && G.phase === 'lobby' && !Object.keys(conns).length) fatal('Couldn\'t reach the race service' + (e && e.type ? ' (' + e.type + ')' : '') + '. Some school Wi-Fi blocks live connections; try another network.'); });
  peer.on('connection', function (c) { c.on('data', function (m) { onHostData(c, m); }); c.on('close', function () { if (G && G.players[c.peer]) { delete G.players[c.peer]; delete conns[c.peer]; refresh(); pushBoard(true); broadcast(lobbyIfLobby()); } }); }); }
function lobbyIfLobby() { return G.phase === 'lobby' ? lobbyMsg() : { t: 'board', players: publicPlayers() }; }
function onHostData(c, m) { if (!m || typeof m !== 'object' || !G) return;
  if (m.t === 'hello') { if (Object.keys(G.players).length >= 30) { send(c, { t: 'full' }); return; } conns[c.peer] = c; G.players[c.peer] = { name: String(m.name || 'Player').replace(/[<>]/g, '').slice(0, 16) || 'Player', emo: EMO.indexOf(m.emo) >= 0 ? m.emo : '🙂', streak: 0, best: 0, right: 0, n: 0 }; sfx('quest');
    if (G.phase === 'lobby') broadcast(lobbyMsg()); else { send(c, startMsg()); pushBoard(true); } refresh(); return; }
  var p = G.players[c.peer]; if (!p) return;
  if (m.t === 'prog' && G.phase === 'play') { p.streak = Math.max(0, Math.min(999, m.streak | 0)); p.best = Math.max(p.best || 0, p.streak); p.right = m.right | 0; p.n = m.n | 0; checkWin(c.peer); pushBoard(); refresh(); } }
function startMsg() { return { t: 'start', mode: G.mode, target: G.target, title: G.title, pack: G.mode === 'streak' || G.mode === 'clash' ? G.pack : [] }; }
function lobby() { G.phase = 'lobby'; G.winner = null; Object.keys(G.players).forEach(function (k) { var p = G.players[k]; p.streak = p.best = p.right = p.n = 0; });
  var tr = opts.tracks || [], hp = G.players.host;
  view(top('Race friends') +
    '<div class="crc"><p class="crmuted" style="text-align:center;margin:0">Game code</p><div class="crcode" aria-live="polite">' + code + '</div><p class="crmuted" style="text-align:center">On another device, open Critical and choose <b>Join a race</b> (it\'s on the lock screen too), then type this code.</p></div>' +
    '<div class="crc"><h2>Race type</h2><div class="crseg" data-g="mode"><button type="button" data-v="streak" aria-pressed="' + (G.mode === 'streak') + '">🏃 Streak race</button><button type="button" data-v="clash" aria-pressed="' + (G.mode === 'clash') + '">🎮 Clash race</button></div><p class="crmuted">' + (G.mode === 'clash' ? 'Everyone plays Critical Clash. Every kill asks a question: first to ' + G.target + ' right answers in a row in Clash wins.' : 'Everyone answers the same questions. First to ' + G.target + ' right in a row wins. One wrong answer and your streak goes back to zero.') + '</p>' +
    '<h2 style="margin-top:12px">Right in a row to win</h2><div class="crseg" data-g="target">' + TARGETS.map(function (t) { return '<button type="button" data-v="' + t + '" aria-pressed="' + (G.target === t) + '">' + t + '</button>'; }).join('') + '</div>' +
    (tr.length ? '<h2 style="margin-top:12px">Questions from</h2><div class="crseg" data-g="topic">' + tr.map(function (t) { return '<button type="button" data-v="' + esc(t.id) + '" aria-pressed="' + (G.topic === t.id) + '">' + esc(t.ic || '') + ' ' + esc(t.name) + '</button>'; }).join('') + '</div>' : '') + '</div>' +
    '<div class="crc"><h2>You</h2>' + nameEmo(hp.name, hp.emo) + '</div>' +
    '<div class="crc"><h2>Players <span class="crmuted" id="crN"></span></h2><div class="crpl" id="crPl"></div></div>' +
    '<button type="button" class="crb big" id="crGo">Start the race</button><p class="crerr" id="crErr"></p>');
  [].forEach.call(root.querySelectorAll('.crseg[data-g]'), function (g) { g.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; var k = g.dataset.g, v = b.dataset.v; if (k === 'target') G.target = +v; else G[k] = v; lobby(); broadcast(lobbyMsg()); }; });
  wireNameEmo(function (n, e) { hp.name = n; hp.emo = e; refresh(); broadcast(lobbyMsg()); });
  root.querySelector('#crGo').onclick = startRace; refresh(); }
function nameEmo(n, e) { return '<input class="crin" id="crName" maxlength="16" placeholder="Your name" value="' + esc(n) + '"><div class="cremo" id="crEmo" style="margin-top:8px">' + EMO.map(function (x) { return '<button type="button" aria-pressed="' + (x === e) + '" aria-label="' + x + '">' + x + '</button>'; }).join('') + '</div>'; }
function wireNameEmo(cb) { var inp = root.querySelector('#crName'), eg = root.querySelector('#crEmo'), cur = function () { var b = eg.querySelector('[aria-pressed=true]'); return b ? b.textContent : EMO[0]; };
  inp.oninput = function () { store('name', inp.value.trim()); cb(inp.value.trim() || 'Player', cur()); };
  eg.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; [].forEach.call(eg.children, function (x) { x.setAttribute('aria-pressed', x === b); }); store('emo', b.textContent); cb(inp.value.trim() || 'Player', b.textContent); }; }
function playersHTML() { var ks = Object.keys(G.players); return ks.map(function (k) { var p = G.players[k]; return '<div class="crp"><span>' + esc(p.emo) + '</span>' + esc(p.name) + (p.host ? '<em>host</em>' : k === myId ? '<em>you</em>' : '') + '</div>'; }).join(''); }
function refresh() { if (!root || !G) return; var pl = root.querySelector('#crPl'); if (pl) pl.innerHTML = playersHTML(); var n = root.querySelector('#crN'); if (n) n.textContent = '(' + Object.keys(G.players).length + ')'; if (G.phase === 'play') drawLanes(); }
function startRace() { var err = root.querySelector('#crErr'), pack = [];
  try { pack = opts.pack ? opts.pack(G.topic) : []; } catch (e) { pack = []; }
  pack = cleanPack(shuffle(pack)).slice(0, 150);
  if (pack.length < 10) { err.textContent = 'Not enough questions in that topic yet. Pick another one.'; return; }
  G.pack = pack; G.title = ((opts.tracks || []).filter(function (t) { return t.id === G.topic; })[0] || {}).name || ''; G.phase = 'play'; G.winner = null;
  broadcast(startMsg()); play(); }
function checkWin(id) { var p = G.players[id]; if (!p || G.phase !== 'play' || G.winner) return; if ((p.streak || 0) >= G.target) { G.winner = id; G.phase = 'end'; var ms = { t: 'end', winner: id, players: publicPlayers() }; broadcast(ms); endScreen(id, publicPlayers()); } }

/* ---------- joining ---------- */
function join(o) { opts = o || {}; isHost = false; G = null; var nm = store('name') || '', em = store('emo') || EMO[Math.floor(Math.random() * EMO.length)], c0 = normCode(opts.code || '');
  view(top('Join a race') + '<div class="crc"><h2>Game code</h2><input class="crin code" id="crCode" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCDE" value="' + esc(c0) + '"></div>' +
    '<div class="crc"><h2>You</h2>' + nameEmo(nm, em) + '</div><button type="button" class="crb big" id="crJoin">Join</button><p class="crerr" id="crErr"></p>');
  var ci = root.querySelector('#crCode'), err = root.querySelector('#crErr'), name = nm, emo = em, go = root.querySelector('#crJoin');
  wireNameEmo(function (n, e) { name = n; emo = e; });
  ci.oninput = function () { ci.value = normCode(ci.value); err.textContent = ''; };
  function doJoin() { var cd = normCode(ci.value); if (cd.length !== 5) { err.textContent = 'Game codes have 5 letters and numbers.'; return; } if (!(root.querySelector('#crName').value.trim())) { err.textContent = 'Type your name first.'; return; }
    name = root.querySelector('#crName').value.trim(); go.disabled = true; go.textContent = 'Connecting…'; code = cd;
    loadPeer(function (ok) { if (!ok) { go.disabled = false; go.textContent = 'Join'; err.textContent = 'Couldn\'t load the race connection. Check your internet.'; return; }
      try { peer = new window.Peer({ debug: 0 }); } catch (e) { err.textContent = 'Your browser can\'t make live connections (WebRTC).'; return; }
      var timer = setTimeout(function () { if (!hostConn || !hostConn.open) { go.disabled = false; go.textContent = 'Join'; err.textContent = 'No answer from that game. Check the code, and that the host still has the race open.'; } }, 12000);
      peer.on('open', function (id) { myId = id; hostConn = peer.connect(PRE + cd, { reliable: true });
        hostConn.on('open', function () { clearTimeout(timer); send(hostConn, { t: 'hello', name: name, emo: emo }); waiting(); });
        hostConn.on('data', onGuestData); hostConn.on('close', function () { if (G && G.phase !== 'gone') { G.phase = 'gone'; fatal('The host left the race.'); } }); });
      peer.on('error', function (e) { if (e && e.type === 'peer-unavailable') { clearTimeout(timer); go.disabled = false; go.textContent = 'Join'; err.textContent = 'There\'s no race with that code. Check it with the host.'; return; } if (!hostConn || !hostConn.open) { clearTimeout(timer); go.disabled = false; go.textContent = 'Join'; err.textContent = 'Couldn\'t connect' + (e && e.type ? ' (' + e.type + ')' : '') + '. Some school Wi-Fi blocks live connections.'; } }); }); }
  go.onclick = doJoin; ci.onkeydown = function (e) { if (e.key === 'Enter') doJoin(); }; setTimeout(function () { try { (c0 ? root.querySelector('#crName') : ci).focus(); } catch (e) {} }, 60); }
function waiting() { G = G || blank(); view(top('Race ' + code) + '<div class="crc" style="text-align:center"><div class="crspin"></div><h2>You\'re in!</h2><p class="crmuted" id="crWait">Waiting for the host to start…</p></div><div class="crc"><h2>Players <span class="crmuted" id="crN"></span></h2><div class="crpl" id="crPl"></div></div>'); refresh(); }
function onGuestData(m) { if (!m || typeof m !== 'object') return;
  if (m.t === 'full') { fatal('That race is full.'); return; }
  if (m.t === 'lobby') { G = G || blank(); G.mode = m.mode === 'clash' ? 'clash' : 'streak'; G.target = TARGETS.indexOf(m.target) >= 0 ? m.target : 8; setPlayers(m.players); if (G.phase !== 'lobby') { G.phase = 'lobby'; waiting(); } refresh();
    var w = root && root.querySelector('#crWait'); if (w) w.innerHTML = 'Waiting for the host to start… <br><b>' + (G.mode === 'clash' ? '🎮 Clash race' : '🏃 Streak race') + '</b>: first to <b>' + G.target + '</b> right in a row.'; return; }
  if (m.t === 'start') { G = G || blank(); G.mode = m.mode === 'clash' ? 'clash' : 'streak'; G.target = TARGETS.indexOf(m.target) >= 0 ? m.target : 8; G.title = String(m.title || '').slice(0, 60); G.pack = cleanPack(m.pack); G.phase = 'play'; G.winner = null; if (G.players[myId]) { G.players[myId].streak = 0; } play(); return; }
  if (m.t === 'board') { setPlayers(m.players); refresh(); drawHud(); return; }
  if (m.t === 'end') { G.phase = 'end'; setPlayers(m.players); endScreen(m.winner, m.players); } }
function setPlayers(ps) { var o = {}; Object.keys(ps || {}).slice(0, 30).forEach(function (k) { var p = ps[k] || {}; o[k] = { name: String(p.name || 'Player').replace(/[<>]/g, '').slice(0, 16), emo: EMO.indexOf(p.emo) >= 0 ? p.emo : '🙂', streak: p.streak | 0, best: p.best | 0, right: p.right | 0, n: p.n | 0, host: !!p.host }; });
  var mine = G.players && G.players[myId]; G.players = o; if (mine && o[myId] && G.phase === 'play') { o[myId].streak = mine.streak; o[myId].right = mine.right; o[myId].n = mine.n; } }

/* ---------- playing ---------- */
function myProgress(streak, right, n) { var p = me(); if (!p) { G.players[myId] = p = { name: store('name') || 'You', emo: store('emo') || '🙂', streak: 0, best: 0, right: 0, n: 0 }; }
  p.streak = streak; p.best = Math.max(p.best || 0, streak); p.right = right; p.n = n;
  if (isHost) { checkWin(myId); pushBoard(); } else send(hostConn, { t: 'prog', streak: streak, right: right, n: n }); drawLanes(); drawHud(); }
function lanesHTML() { var ks = Object.keys(G.players).sort(function (a, b) { return (G.players[b].streak || 0) - (G.players[a].streak || 0); });
  return ks.map(function (k) { var p = G.players[k], f = Math.min(1, (p.streak || 0) / G.target); return '<div class="crlane' + (k === myId ? ' me' : '') + '"><i style="width:' + (f * 100).toFixed(1) + '%"></i><b style="left:' + (6 + f * 58).toFixed(1) + '%">' + esc(p.emo) + '</b><em><span class="crln">' + esc(p.name) + (k === myId ? ' (you)' : '') + '</span>' + (p.streak || 0) + '/' + G.target + '</em></div>'; }).join(''); }
function drawLanes() { var l = root && root.querySelector('#crLanes'); if (l) l.innerHTML = lanesHTML(); }
function play() { sfx('start'); if (G.mode === 'clash') return playClash(); Q = { order: shuffle(G.pack.map(function (_, i) { return i; })), i: 0, streak: 0, right: 0, n: 0 };
  view(top((G.title ? G.title + ' · ' : '') + 'first to ' + G.target + ' in a row') + '<div class="crc"><div class="crlanes" id="crLanes"></div></div><div class="crc" id="crCard"><div class="crstreak"><span class="crfire">🔥</span><b id="crSt">0</b><span>right in a row<br>' + G.target + ' to win</span></div><div class="crq" id="crQ"></div><div id="crA"></div><div class="crfb" id="crFb"></div></div>');
  drawLanes(); myProgress(0, 0, 0); nextQ(); }
function nextQ() { if (!G || G.phase !== 'play') return; if (Q.i >= Q.order.length) { Q.order = shuffle(Q.order); Q.i = 0; } var q = G.pack[Q.order[Q.i++]], A = root.querySelector('#crA'), fb = root.querySelector('#crFb'); Q.cur = q; fb.textContent = ''; fb.className = 'crfb';
  root.querySelector('#crQ').innerHTML = q.p; A.innerHTML = '';
  if (q.t === 'N') { A.innerHTML = '<div class="crrow"><input class="crin" id="crNum" inputmode="decimal" autocomplete="off" placeholder="Your answer" style="max-width:240px"><span>' + (q.u || '') + '</span><button type="button" class="crb" id="crSub">Go</button></div>'; var inp = A.querySelector('#crNum'), go = function () { var v = parseNum(inp.value); if (isNaN(v)) { fb.textContent = 'Type a number.'; return; } var tol = q.tol == null ? 0.02 : q.tol; answer(q.a === 0 ? Math.abs(v) <= (tol || 1e-9) : Math.abs(v - q.a) <= Math.abs(q.a) * tol + 1e-12, String(+q.a.toPrecision(6)) + (q.u ? ' ' + q.u : '')); };
    A.querySelector('#crSub').onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } }; setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30); }
  else { var box = document.createElement('div'); box.className = 'cropts'; A.appendChild(box); shuffle(q.o.map(function (_, i) { return i; })).forEach(function (k, j) { var b = document.createElement('button'); b.type = 'button'; b.className = 'cropt'; b.innerHTML = '<b style="opacity:.6;margin-right:8px">' + (j + 1) + '</b>' + q.o[k]; b.dataset.k = k; b.onclick = function () { if (b.disabled) return; [].forEach.call(box.children, function (x) { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('ok'); }); if (k !== q.a) b.classList.add('no'); answer(k === q.a, q.o[q.a].replace(/<[^>]+>/g, '')); }; box.appendChild(b); }); } }
function answer(ok, ans) { if (!G || G.phase !== 'play' || Date.now() < lock) return; var fb = root.querySelector('#crFb'), card = root.querySelector('#crCard'); Q.n++;
  if (ok) { Q.streak++; Q.right++; fb.className = 'crfb ok'; fb.textContent = Q.streak >= G.target ? 'That\'s ' + Q.streak + ' in a row!' : '✓ ' + Q.streak + ' in a row'; sfx(Q.streak >= 3 ? 'combo' : 'right'); }
  else { var lost = Q.streak; Q.streak = 0; fb.className = 'crfb no'; fb.innerHTML = '✗ The answer was <b>' + esc(ans) + '</b>.' + (lost ? ' Streak of ' + lost + ' lost!' : ''); sfx('wrong'); card.classList.remove('crshake'); void card.offsetWidth; card.classList.add('crshake'); lock = Date.now() + 1500; }
  root.querySelector('#crSt').textContent = Q.streak; myProgress(Q.streak, Q.right, Q.n);
  if (G && G.phase === 'play') setTimeout(nextQ, ok ? 550 : 1600); }
function playClash() { Q = { streak: 0, right: 0, n: 0 };
  view(top('Clash race · first to ' + G.target + ' in a row') + '<div class="crc"><div class="crlanes" id="crLanes"></div></div><div class="crc"><h2>🎮 Play Critical Clash</h2><p class="crmuted">Every kill asks a question. Get <b>' + G.target + ' right in a row</b> in Clash to win. Wrong answers reset your streak. The race board stays in the corner while you play.</p><button type="button" class="crb big" id="crClash">Open Critical Clash</button><p class="crerr" id="crErr"></p></div>');
  drawLanes(); myProgress(0, 0, 0); root.querySelector('#crClash').onclick = launchClash; }
function launchClash() { var err = root.querySelector('#crErr'); if (!window.CRIT_ARENA_API || opts.standalone) window.CRIT_ARENA_API = guestArenaApi();
  window.CRIT_ARENA_API.race = function (d) { if (!G || G.phase !== 'play' || !d) return; if (d.closed) { root.hidden = false; return; } var s = d.streak | 0, r = d.right | 0; if (s !== Q.streak || r !== Q.right) { Q.streak = s; Q.right = r; Q.n = d.asked | 0; myProgress(s, r, Q.n); } };
  function go() { root.hidden = true; drawHud(); try { window.CRIT_ARENA.open(); } catch (e) { root.hidden = false; err.textContent = 'Couldn\'t start Critical Clash.'; } }
  if (window.CRIT_ARENA) { go(); return; } if (opts.openClash) { root.hidden = true; drawHud(); opts.openClash(); return; }
  var s = document.createElement('script'); s.src = 'arena.js'; s.onload = go; s.onerror = function () { err.textContent = 'Couldn\'t load Critical Clash. Check your internet.'; }; document.head.appendChild(s); }
function guestArenaApi() { var pk = (G && G.pack) || []; return { tracks: function () { return [{ id: 'race', name: 'Race questions', ic: '🏁', levels: [{ lv: 1, q: pk.length, done: pk.length, tot: pk.length }] }]; }, questions: function () { return pk; }, result: function () {}, xp: function () {}, crate: function () { return null; }, sfx: function (k) { sfx(k); }, close: function () { if (root) root.hidden = false; } }; }
function drawHud() { if (!G || G.phase !== 'play' || G.mode !== 'clash' || !root || !root.hidden) { clearHud(); return; } if (!hud) { ensureCss(); hud = document.createElement('div'); hud.className = 'crhud'; document.body.appendChild(hud); }
  var ks = Object.keys(G.players).sort(function (a, b) { return (G.players[b].streak || 0) - (G.players[a].streak || 0); }).slice(0, 5);
  hud.innerHTML = '<b>🏁 First to ' + G.target + ' in a row</b>' + ks.map(function (k) { var p = G.players[k]; return '<div' + (k === myId ? ' style="color:#a9a2ef"' : '') + '><span>' + esc(p.emo) + '</span>' + esc(p.name) + '<em>' + (p.streak || 0) + '</em></div>'; }).join(''); }
function clearHud() { if (hud) { hud.remove(); hud = null; } }
function endScreen(winner, ps) { clearHud(); if (window.CRIT_ARENA && G && G.mode === 'clash') { try { window.CRIT_ARENA.close(); } catch (e) {} }
  var w = ps[winner] || { name: 'Someone', emo: '🏆' }, mine = winner === myId, ks = Object.keys(ps).sort(function (a, b) { return (k2(b) - k2(a)); function k2(k) { return (k === winner ? 1e6 : 0) + (ps[k].best || 0) * 1000 + (ps[k].right || 0); } });
  view(top('Race over') + '<div class="crc crwin"><div class="crbig">' + (mine ? '🏆' : esc(w.emo)) + '</div><h2>' + (mine ? 'You win!' : esc(w.name) + ' wins!') + '</h2><p class="crmuted">First to ' + G.target + ' right in a row.</p><div class="crpod">' + ks.map(function (k, i) { var p = ps[k]; return '<div><span>' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.') + '</span><span style="font-size:22px">' + esc(p.emo) + '</span>' + esc(p.name) + (k === myId ? ' (you)' : '') + '<em>best ' + (p.best || 0) + ' · ' + (p.right || 0) + ' right</em></div>'; }).join('') + '</div></div>' +
    (isHost ? '<button type="button" class="crb big" id="crAgain">New race with the same players</button>' : '<p class="crmuted" style="text-align:center">Waiting for the host to start another race…</p>'));
  sfx(mine ? 'level' : 'done'); var a = root.querySelector('#crAgain'); if (a) a.onclick = function () { lobby(); broadcast(lobbyMsg()); };
  if (mine && opts.onWin) try { opts.onWin(); } catch (e) {} }
function fatal(msg) { clearHud(); view(top('Critical Race') + '<div class="crc" style="text-align:center"><div style="font-size:44px">📡</div><p>' + esc(msg) + '</p><button type="button" class="crb" id="crBack">' + (opts.standalone ? 'Try again' : 'Close') + '</button></div>'); root.querySelector('#crBack').onclick = function () { if (opts.standalone) { var o = opts; leave(); join(o); } else leave(); }; }
/* number keys pick an answer, like the lessons */
document.addEventListener('keydown', function (e) { if (!root || root.hidden || !/^[1-9]$/.test(e.key)) return; var t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA') return; var os = root.querySelectorAll('.cropt:not(:disabled)'), o = os[+e.key - 1]; if (o) { e.preventDefault(); o.click(); } });
window.CRACE = { host: host, join: join, leave: leave, _G: function () { return G; } };
})();
