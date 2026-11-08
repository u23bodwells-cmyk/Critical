'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(location.search), url = q.get('u') || '', site = q.get('s') || 'This site';
  const FACTS = [
    'One uranium fuel pellet, about the size of a fingertip, holds roughly as much energy as a tonne of coal.',
    'Straight after a reactor shuts down, decay heat is still about 6–7% of full power. That\'s why cooling has to keep going.',
    'The blue glow in a reactor pool is Cherenkov radiation: particles moving faster than light travels in water.',
    'Only about 0.65% of the neutrons from uranium-235 fission are delayed, but those few are what make a reactor controllable.',
    'Calder Hall in Cumbria, opened in 1956, was the first nuclear power station to supply a national grid on a commercial scale.',
    'Control rods contain strong neutron absorbers like boron, hafnium or a silver-indium-cadmium alloy.',
    'A pressurised water reactor keeps its coolant at about 155 bar, so it stays liquid at over 300 °C.',
    'About 2 billion years ago, natural uranium deposits at Oklo in Gabon ran their own fission chain reactions.'
  ];
  $('fact').textContent = FACTS[Math.floor(Math.random() * FACTS.length)];
  document.title = site + ' is blocked';
  $('h').textContent = site + ' is blocked until today\'s plan is done';
  $('goCrit').onclick = () => { if (window.cb) cb.go('critical'); };
  $('check').onclick = () => {
    if (!window.cb) return; const b = $('check'); b.disabled = true; b.textContent = 'Checking…';
    cb.refresh().then((sent) => { if (!sent) { b.disabled = false; b.textContent = 'I\'ve finished: check again'; cb.go('critical'); return; }
      setTimeout(() => { if (unlocked) return; b.disabled = false; b.textContent = 'Check again'; cb.state().then((s) => { if (s && !s.done) { const w = $('warn'); w.hidden = false; w.textContent = s.critLocked ? 'Critical is locked in this browser, so it can\'t see what you did in Chrome. Go to Critical and paste your sync link.' : s.critSync === false ? 'Sync is off for Critical in this browser, so it can\'t see what you did in Chrome. Turn it on with the cloud button in Critical.' : 'Critical still shows ' + (s.left != null ? s.left + ' part' + (s.left === 1 ? '' : 's') : 'some of the plan') + ' left today.'; } }); }, 8000); });
  };
  $('goClaude').onclick = () => { if (window.cb) cb.go('claude'); };
  $('goBack').onclick = () => { if (window.cb) cb.go('back'); else history.back(); };
  function hm(m) { return m == null ? '' : m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
  let unlocked = false;
  function paint(s) {
    if (!s) return;
    if (s.done) {
      if (unlocked) return; unlocked = true;
      $('badge').classList.add('ok'); $('badge').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
      $('h').textContent = 'Plan done: ' + site + ' is unlocked';
      $('lead').textContent = 'Nice work. Everything\'s unlocked until tomorrow.';
      $('prog').hidden = true; $('check').hidden = true; $('warn').hidden = true;
      const b = $('goCrit'); b.textContent = 'Open ' + site; b.onclick = () => { if (/^https?:\/\//.test(url)) location.href = url; };
      return;
    }
    if (!s.known) $('lead').textContent = 'Open Critical so the browser can check today\'s plan. Once it\'s done, ' + site + ' unlocks.';
    else if (s.inWindow) $('lead').textContent = 'It\'s plan time. Finish today\'s plan and ' + site + ' unlocks by itself.';
    else $('lead').textContent = 'Finish today\'s plan in Critical and ' + site + ' unlocks by itself.';
    if (s.known && s.left != null) {
      $('prog').hidden = false;
      $('pT').textContent = s.left === 0 ? 'Almost there' : s.left + ' part' + (s.left === 1 ? '' : 's') + ' of today\'s plan left' + (s.mins ? ' · about ' + hm(s.mins) : '');
      const total = Math.max(s.left + (s.lessons || 0), s.left, 1);
      $('pBar').style.width = Math.round(100 * (1 - s.left / Math.max(total, 1))) + '%';
    }
    $('count').textContent = s.blocksToday > 1 ? 'You\'ve hit the block ' + s.blocksToday + ' times today.' : '';
  }
  if (window.cb) { cb.state().then(paint); cb.onState(paint); }
  else paint({ known: false });
})();
