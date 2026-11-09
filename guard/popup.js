(async function () {
  const $ = (id) => document.getElementById(id), DN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ORDER = [1, 2, 3, 4, 5, 6, 0];
  let s = await getS(), days = s.days.slice();
  function paint() {
    const on = isActive(s);
    $('dot').classList.toggle('on', on);
    $('st').textContent = why(s);
    const pd = s.plan && s.plan.day === today() ? s.plan : null;
    $('plan').textContent = pd ? 'Critical says: today\'s plan is ' + (pd.done ? 'done ✓' : 'not done yet' + (pd.left != null ? ' (' + pd.left + ' left)' : '')) + ' · checked ' + new Date(pd.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Critical hasn\'t reported today\'s plan yet. Open Critical in Chrome.';
    const sel = (document.querySelector('input[name=mode]:checked') || {}).value || s.mode; $('end').style.display = $('toW').style.display = sel === 'plan' ? 'none' : '';
    $('n').textContent = s.countDay === today() ? s.count : 0;
    document.querySelectorAll('input[name=mode]').forEach((r) => { r.checked = r.value === s.mode; });
    $('start').value = s.start; $('end').value = s.end;
    $('days').innerHTML = ORDER.map((d) => '<button type="button" data-d="' + d + '" class="' + (days.includes(d) ? 'on' : '') + '" aria-pressed="' + days.includes(d) + '">' + DN[d] + '</button>').join('');
    if (s.pending) { const left = Math.max(0, Math.ceil((s.pending.at - Date.now()) / 1000)); $('note').innerHTML = '<span class="wait">Your change kicks in in ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + '.</span> Close this and get some work done.'; }
  }
  $('chk').onclick = () => { chrome.tabs.create({ url: CRITICAL_URL }); window.close(); };
  document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', () => { const sel = r.value; $('end').style.display = $('toW').style.display = sel === 'plan' ? 'none' : ''; }));
  $('days').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const d = +b.dataset.d; days = days.includes(d) ? days.filter((x) => x !== d) : days.concat(d); paint(); });
  $('save').onclick = async () => {
    const mode = (document.querySelector('input[name=mode]:checked') || {}).value || s.mode;
    const next = { mode, start: $('start').value || '16:45', end: $('end').value || '21:30', days: days.slice() };
    const looser = STRICT[mode] < STRICT[s.mode] || (mode === s.mode && mode !== 'always' && (mins(next.start) > mins(s.start) || next.days.length < s.days.length || (mode === 'study' && mins(next.end) < mins(s.end))));
    if (looser) { s.pending = { at: Date.now() + 120000, s: next }; await setS(s); }
    else { Object.assign(s, next); s.pending = null; await setS(s); }
    s = await getS(); paint(); $('save').textContent = looser ? 'Saved: waiting 2 minutes' : 'Saved';
    setTimeout(() => { $('save').textContent = 'Save'; }, 1800);
  };
  paint(); setInterval(async () => { s = await getS(); if (s.pending) paint(); }, 1000);
})();
