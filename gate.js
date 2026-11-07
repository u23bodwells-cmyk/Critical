/* Critical private lock.
   Critical is a personal app. A device only gets in if it holds the owner's sync link (critical-sync:…#key),
   which is checked against the owner's own Google Apps Script, or the owner's GitHub sync key.
   Devices that already sync are let straight in and checked quietly in the background.
   This keeps out people who just find the link. Real sign-in protection comes with private hosting later. */
(function () {
  var G = 'critical_gate', OWNER = 'u23bodwells-cmyk', DAY = 864e5;
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem('critical_gate_test') !== '1') return; } catch (e) {}   // local testing copies
  var top = true; try { top = window.top === window; } catch (e) { top = false; }
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function wr(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function sigOf(c) { if (!c) return ''; if (c.via === 'gs' && c.url && c.key) return 'gs:' + c.url + '#' + c.key; if (c.tok) return 'gh:' + (c.user || '') + ':' + String(c.tok).slice(-6); return ''; }
  function h(s) { var x = 5381; s = String(s); for (var i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return x.toString(36); }
  function parseLink(t) { var m = String(t || '').trim().match(/^critical-sync:(https:\/\/script\.google(?:usercontent)?\.com\/\S+?)#([a-z0-9]{8,})$/i); return m ? { url: m[1], key: m[2] } : null; }

  var cfg = rd('critical_sync'), g = rd(G), sig = sigOf(cfg), now = Date.now();
  var fresh = !!(g && g.ok && g.sig === h(sig) && sig && now - g.at < 7 * DAY);
  var recent = !!(g && g.ok && now - g.at < 30 * DAY);
  if (fresh) return;                                  // checked this week: carry on
  if (!sig && recent) return;                         // unlocked with a GitHub key (or sync was switched off): good for 30 days
  var provisional = recent && !!sig;                  // a syncing device we've let in before: show the app, check quietly
  var css = document.createElement('style');
  css.textContent = 'html.cglock body{visibility:hidden!important;overflow:hidden!important}html.cglock #cgate{visibility:visible!important}' +
    '#cgate{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px));overflow:auto;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    '--cg-bg:#edf1f8;--cg-panel:#fff;--cg-line:#d4dbea;--cg-text:#1b2133;--cg-muted:#4a5571;--cg-accent:#534AB7;--cg-on:#fff;--cg-bad:#b42318;--cg-glow:#0a9fd0;background:radial-gradient(900px 420px at 50% -160px,color-mix(in srgb,var(--cg-glow) 16%,transparent),transparent 70%),var(--cg-bg);color:var(--cg-text)}' +
    '@media (prefers-color-scheme:dark){html:not([data-theme=light]) #cgate{--cg-bg:#060a13;--cg-panel:#111a2c;--cg-line:#223050;--cg-text:#e6e9f5;--cg-muted:#9ca8c3;--cg-accent:#a9a2ef;--cg-on:#17142e;--cg-bad:#ff8a80;--cg-glow:#3ad4ff}}' +
    'html[data-theme=dark] #cgate{--cg-bg:#060a13;--cg-panel:#111a2c;--cg-line:#223050;--cg-text:#e6e9f5;--cg-muted:#9ca8c3;--cg-accent:#a9a2ef;--cg-on:#17142e;--cg-bad:#ff8a80;--cg-glow:#3ad4ff}' +
    '#cgate .cgc{width:min(460px,100%);background:var(--cg-panel);border:1px solid var(--cg-line);border-radius:22px;padding:26px 24px 20px;box-shadow:0 20px 60px -28px rgba(0,0,0,.45);text-align:center}' +
    '#cgate .cgi{width:64px;height:64px;margin:0 auto 10px;border-radius:20px;display:grid;place-items:center;background:var(--cg-accent);color:var(--cg-on)}#cgate svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}' +
    '#cgate h1{font-size:22px;margin:0 0 6px;text-wrap:balance}#cgate p{margin:6px 0;color:var(--cg-muted)}#cgate form{margin-top:14px;display:grid;gap:8px}' +
    '#cgate input{font:13.5px ui-monospace,Consolas,monospace;padding:11px 12px;border:2px solid var(--cg-line);border-radius:12px;background:var(--cg-bg);color:var(--cg-text);width:100%;box-sizing:border-box}#cgate input:focus{outline:none;border-color:var(--cg-accent)}' +
    '#cgate button{font:inherit;font-weight:700;border:0;border-radius:12px;padding:11px 16px;background:var(--cg-accent);color:var(--cg-on);cursor:pointer}#cgate button:disabled{opacity:.6;cursor:default}#cgate button:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px}' +
    '#cgate .cgerr{color:var(--cg-bad);font-size:13.5px;min-height:1.2em;margin:2px 0 0}#cgate details{margin-top:12px;text-align:left;font-size:13.5px;color:var(--cg-muted)}#cgate summary{cursor:pointer;color:var(--cg-text);font-weight:700}#cgate ol{margin:6px 0 0;padding-left:20px}#cgate li{margin:3px 0}' +
    '#cgate .cgspin{width:22px;height:22px;margin:10px auto 0;border-radius:50%;border:3px solid var(--cg-line);border-top-color:var(--cg-accent);animation:cgs .8s linear infinite}@keyframes cgs{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){#cgate .cgspin{animation:none}}';
  (document.head || document.documentElement).appendChild(css);
  var robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex, nofollow'; (document.head || document.documentElement).appendChild(robots);

  var box = null, locked = false;
  function lock(mode, msg) {
    locked = true; document.documentElement.classList.add('cglock');
    if (!top) return;                                 // pages inside a frame stay hidden; the main page shows the lock
    whenBody(function () {
      if (!box) { box = document.createElement('div'); box.id = 'cgate'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'cgH'); document.body.appendChild(box); }
      var icon = '<div class="cgi"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg></div>';
      if (mode === 'checking') { box.innerHTML = '<div class="cgc">' + icon + '<h1 id="cgH">Checking it\'s you…</h1><p>Critical is private. This device syncs, so it should only take a second.</p><div class="cgspin" aria-hidden="true"></div></div>'; return; }
      box.innerHTML = '<div class="cgc">' + icon + '<h1 id="cgH">Critical is private</h1><p>This is a personal study app. If it\'s yours, paste your sync link to unlock this device.</p>' +
        '<form id="cgF" autocomplete="off"><input id="cgIn" placeholder="critical-sync:https://script.google.com/…" aria-label="Your sync link" spellcheck="false" autocapitalize="off"><button type="submit" id="cgGo">Unlock</button><p class="cgerr" id="cgE" role="alert">' + (msg || '') + '</p></form>' +
        '<details><summary>Where\'s my sync link?</summary><ol><li>On a device where Critical already opens, go to <b>Progress → Settings</b>.</li><li>In the sync box, press <b>Link another device</b>.</li><li>Press <b>Copy the link</b>, send it to yourself privately, and paste it here.</li></ol><p style="margin-top:8px">Unlocking also turns on sync, so your progress comes across too.</p></details></div>';
      var f = document.getElementById('cgF'), inp = document.getElementById('cgIn'), err = document.getElementById('cgE'), go = document.getElementById('cgGo');
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
      inp.oninput = function () { err.textContent = ''; };
      f.onsubmit = function (e) {
        e.preventDefault(); var t = inp.value.trim().replace(/\s+/g, '');
        var link = parseLink(t), gh = /^(github_pat_|ghp_|gho_)[A-Za-z0-9_]{20,}$/.test(t);
        if (!link && !gh) { err.textContent = t ? 'That isn\'t a sync link. It starts with critical-sync:' : 'Paste your sync link first.'; return; }
        go.disabled = true; go.textContent = 'Checking…';
        var c = link ? { via: 'gs', url: link.url, key: link.key } : { tok: t };
        verify(c).then(function (r) {
          if (r.ok) {
            if (link) { wr('critical_sync', c); try { localStorage.setItem('critical_sync_gskey', link.key); } catch (e) {} }
            else c.user = r.user;
            wr(G, { ok: true, at: Date.now(), sig: h(link ? sigOf(c) : 'gh:' + r.user + ':' + t.slice(-6)) });
            go.textContent = 'Unlocked'; setTimeout(function () { location.reload(); }, 300);
          } else { go.disabled = false; go.textContent = 'Unlock'; err.textContent = r.why; }
        });
      };
    });
  }
  function unlock() { locked = false; document.documentElement.classList.remove('cglock'); if (box) { box.remove(); box = null; } }
  function whenBody(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn, { once: true }); }
  // ask the owner's own sync script (or GitHub) whether this key is right
  function verify(c) {
    var timeout = new Promise(function (res) { setTimeout(function () { res({ ok: false, net: true, why: 'Couldn\'t check. Make sure you\'re online and try again.' }); }, 15000); });
    var check;
    if (c.via === 'gs') check = fetch(c.url, { method: 'POST', cache: 'no-store', redirect: 'follow', body: JSON.stringify({ k: c.key }) })
      .then(function (r) { return r.text(); }).then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {}
        if (j && j.ok) return { ok: true };
        if (j && j.err === 'key') return { ok: false, bad: true, why: 'That key doesn\'t match your sync script. Copy the link again from a device where Critical opens.' };
        return { ok: false, bad: !j, why: 'That link didn\'t answer like a Critical sync script.' }; })
      .catch(function () { return { ok: false, net: true, why: 'Couldn\'t reach your sync script. Check the internet (some school Wi-Fi blocks Google scripts) and try again.' }; });
    else check = fetch('https://api.github.com/user', { cache: 'no-store', headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + c.tok } })
      .then(function (r) { if (r.status === 401 || r.status === 403) return { ok: false, bad: true, why: 'GitHub didn\'t accept that key.' }; return r.json().then(function (u) { return u && String(u.login).toLowerCase() === OWNER.toLowerCase() ? { ok: true, user: u.login } : { ok: false, bad: true, why: 'That GitHub key belongs to someone else.' }; }); })
      .catch(function () { return { ok: false, net: true, why: 'Couldn\'t reach GitHub. Check the internet and try again.' }; });
    return Promise.race([check, timeout]);
  }

  if (!provisional) lock(sig ? 'checking' : 'paste');
  if (sig) {
    verify(cfg).then(function (r) {
      if (r.ok) { wr(G, { ok: true, at: Date.now(), sig: h(sig) }); unlock(); }
      else if (r.bad) { wr(G, null); lock('paste', 'This device\'s sync key didn\'t match. Paste your sync link to unlock it again.'); }
      else if (r.net) unlock();                        // can't reach Google right now (e.g. school Wi-Fi): don't lock out a syncing device, check again next time
      else if (!provisional) lock('paste', r.why);
    });
  }
  // another tab unlocked this device
  addEventListener('storage', function (e) { if (e.key === G && locked) { var n = rd(G); if (n && n.ok) location.reload(); } });
})();
