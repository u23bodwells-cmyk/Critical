'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const atom = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>';
  const lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const spark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5M5.3 5.3l3.5 3.5M15.2 15.2l3.5 3.5M18.7 5.3l-3.5 3.5M8.8 15.2l-3.5 3.5" stroke-width="2.4"/></svg>';
  const T = [
    ['critical', 'Critical', 'Your plan, lessons and tests', atom, '', true],
    ['claude', 'Claude mode', 'Critical and Claude side by side', spark, '#d97757'],
    ['https://classroom.google.com/', 'Google Classroom', 'Homework and class posts', 'C', '#1e8e3e'],
    ['https://drive.google.com/', 'Google Drive', 'Docs, Slides and files', 'D', '#1a73e8'],
    ['https://app.sparx-learning.com/', 'Sparx', 'Maths homework', 'S', '#0b6bcb'],
    ['https://app.senecalearning.com/', 'Seneca', 'Revision courses', 'Se', '#3b3bd8'],
    ['https://www.bbc.co.uk/bitesize', 'BBC Bitesize', 'GCSE revision', 'B', '#222222'],
    ['https://www.physicsandmathstutor.com/', 'Physics & Maths Tutor', 'Past papers', 'P', '#b3261e'],
    ['https://www.savemyexams.com/', 'Save My Exams', 'Notes and questions', 'SM', '#00796b'],
    ['https://www.youtube.com/', 'YouTube', 'Shorts stay blocked until the plan\'s done', 'Y', '#cc0000']
  ];
  $('tiles').innerHTML = T.map((t) => '<a class="tile' + (t[5] ? ' big' : '') + '" href="' + (t[0].startsWith('http') ? t[0] : '#') + '" data-go="' + t[0] + '"><span class="lg" style="' + (t[4] ? 'background:' + t[4] : '') + '">' + t[3] + '</span><span><b>' + t[1] + '</b><br><small>' + t[2] + '</small></span></a>').join('');
  document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { const g = a.dataset.go; if (!g.startsWith('http')) { e.preventDefault(); if (window.cb) cb.go(g); } }));

  function toUrl(t) {
    t = t.trim(); if (!t) return null;
    if (/^https?:\/\//i.test(t)) return t;
    if (!/\s/.test(t) && /^[^\/\s]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(t)) return 'https://' + t;
    return 'https://www.google.com/search?q=' + encodeURIComponent(t);
  }
  $('search').addEventListener('submit', (e) => { e.preventDefault(); const u = toUrl($('q').value); if (u) location.href = u; });

  function clock() {
    const d = new Date(), h = d.getHours();
    $('clock').textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    $('date').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    $('hello').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  clock(); setInterval(clock, 10000);

  function hm(m) { return m == null ? '' : m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
  function tm(ms) { return new Date(ms).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }); }
  function paint(s) {
    if (!s) return;
    const box = $('status'); box.className = 'card status';
    if (s.done) { box.classList.add('done'); $('sIc').innerHTML = tick; $('sH').textContent = 'Today\'s plan is done'; $('sP').textContent = 'TikTok, YouTube Shorts and social sites are unlocked until tomorrow.'; $('sBtn').textContent = 'Open Critical'; return; }
    if (s.inWindow) { box.classList.add('plan'); $('sIc').innerHTML = atom; $('sH').textContent = 'Plan time' + (s.left != null ? ': ' + s.left + ' part' + (s.left === 1 ? '' : 's') + ' left' : ''); $('sP').textContent = (s.mins ? 'About ' + hm(s.mins) + ' to go. ' : '') + 'Social sites unlock when you finish.'; $('sBtn').textContent = 'Back to Critical'; return; }
    $('sIc').innerHTML = lock;
    if (!s.known) { $('sH').textContent = 'Social sites are blocked'; $('sP').textContent = 'Open Critical so I can check today\'s plan. They unlock when it\'s done.'; }
    else { $('sH').textContent = 'Social sites unlock when today\'s plan is done'; $('sP').textContent = (s.due && Date.now() < s.due ? 'Plan time starts at ' + tm(s.due) + '. ' : '') + (s.left != null ? s.left + ' part' + (s.left === 1 ? '' : 's') + ' to do' + (s.mins ? ' (about ' + hm(s.mins) + ')' : '') + '.' : ''); }
    $('sBtn').textContent = 'Go to Critical';
  }
  $('sBtn').addEventListener('click', () => { if (window.cb) cb.go('critical'); });
  if (window.cb) { cb.state().then(paint); cb.onState(paint); }
  else paint({ known: false });
})();
