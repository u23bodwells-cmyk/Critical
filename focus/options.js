const $ = id => document.getElementById(id);
function hm(ms) { const d = new Date(ms), h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h >= 12 ? 'pm' : 'am'); }
let screen = 2;
function paint() {
  chrome.runtime.sendMessage({ type: 'info' }, r => {
    if (!r) return;
    const { st, wi, displays } = r, school = [1, 2, 3, 4, 5].includes(new Date().getDay());
    screen = Math.min(st.screen, displays.length - 1);
    let h;
    if (!school) h = '<h2>It\'s the weekend</h2><p class="muted">Focus mode only runs on school days.</p>';
    else if (st.skipped) h = '<h2>Off for today</h2><p class="muted">You used the exit. It\'s back on tomorrow.</p>';
    else if (wi.done) h = '<h2>Today\'s plan is done ✓</h2><p class="muted">TikTok is unblocked. Nice work.</p>';
    else if (st.locked) h = '<h2>Locked: Critical first</h2><p>TikTok is blocked and Critical stays on screen until today\'s plan is done, or ' + hm(wi.end) + ' at the latest.</p>';
    else if (wi.inWindow) h = '<h2>Plan time</h2><p>TikTok is blocked until today\'s plan is done. Open it and Critical locks onto your screen.</p>';
    else h = '<h2>Waiting for plan time</h2><p>From <b>' + hm(wi.due) + '</b> until today\'s plan is done, TikTok gets closed and blocked.</p>';
    h += '<p class="muted" style="font-size:13px;margin:0">' + (st.status ? 'Critical last checked in at ' + hm(st.status.at) + '.' : 'Open Critical today so it can tell this when your plan time is. Until then it uses 5:30pm.') + '</p>';
    $('status').innerHTML = h;
    $('screens').innerHTML = displays.map((d, i) => '<label class="' + (i === screen ? 'on' : '') + '"><input type="radio" name="s" value="' + i + '"' + (i === screen ? ' checked' : '') + '>Screen ' + (i + 1) + '<br><span class="muted">' + d.w + '×' + d.h + (d.primary ? ', main' : '') + '</span></label>').join('');
    document.querySelectorAll('#screens input').forEach(inp => inp.onchange = () => { screen = +inp.value; chrome.runtime.sendMessage({ type: 'screen', screen }, paint); });
    const mu = Math.min(typeof st.music === 'number' ? st.music : 0, displays.length - 1);
    $('music').innerHTML = displays.map((d, i) => '<label class="' + (i === mu ? 'on' : '') + '"><input type="radio" name="m" value="' + i + '"' + (i === mu ? ' checked' : '') + '>Screen ' + (i + 1) + '</label>').join('');
    document.querySelectorAll('#music input').forEach(inp => inp.onchange = () => chrome.runtime.sendMessage({ type: 'music', screen: +inp.value }, paint));
    document.querySelectorAll('#claude label').forEach(l => { const on = l.dataset.v === st.claude; l.className = on ? 'on' : ''; l.querySelector('input').checked = on; l.onclick = () => chrome.runtime.sendMessage({ type: 'claude', mode: l.dataset.v }, paint); });
    $('cnote').textContent = st.claude === 'app' ? 'The first time, Chrome asks "Open Claude?". Tick "Always allow" and press Open. Drag the app to the right side of your study screen once and it reopens there.' : 'Opens claude.ai on the right side of your study screen.';
    $('strict').checked = !!st.strict;
    $('exit').hidden = !school || st.skipped || wi.done;
  });
}
$('strict').onchange = e => chrome.runtime.sendMessage({ type: 'strict', on: e.target.checked }, paint);
$('setup').onclick = () => chrome.runtime.sendMessage({ type: 'setup' }, () => window.close());
$('test').onclick = () => chrome.runtime.sendMessage({ type: 'test', screen });
const SENTENCE = 'I am choosing to skip my Critical plan today';
$('exitGo').onclick = () => {
  const box = $('exit');
  box.innerHTML = '<h2>Are you sure?</h2><p>Type this exactly:</p><p><b>' + SENTENCE + '</b></p><input type="text" id="sent" autocomplete="off" spellcheck="false"><p class="muted" id="cd" style="font-size:13px;margin-top:8px"></p><div class="row"><button id="off" disabled>Turn off for today</button><button class="alt" id="no">Never mind, I\'ll do it</button></div>';
  let left = 60, typed = false;
  const tick = setInterval(() => { left--; $('cd').textContent = left > 0 ? 'Wait ' + left + ' seconds. Is it really an emergency, or is it TikTok talking?' : 'You can turn it off now.'; upd(); if (left <= 0) clearInterval(tick); }, 1000);
  function upd() { $('off').disabled = !(typed && left <= 0); }
  $('sent').oninput = e => { typed = e.target.value.trim() === SENTENCE; upd(); };
  $('sent').onpaste = e => e.preventDefault();
  $('off').onclick = () => chrome.runtime.sendMessage({ type: 'skip' }, () => location.reload());
  $('no').onclick = () => { clearInterval(tick); location.reload(); };
};
paint();
chrome.runtime.sendMessage({ type: 'helper' }, r => { $('helper').innerHTML = r && r.ok ? '<b>PC helper installed ✓</b> The Claude app moves onto the right of your study screen.' : '<b>PC helper not installed.</b> To have the Claude app moved onto your study screen, run <b>install-helper.cmd</b> in the extension\'s helper folder, then restart Chrome.'; });
