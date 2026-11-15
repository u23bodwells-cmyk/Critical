(async function () {
  const $ = (id) => document.getElementById(id);
  let stay = false, s = await getS();
  function paint() {
    $('n').textContent = s.countDay === today() ? Math.max(1, s.count) : 1;
    $('left').textContent = s.plan && s.plan.day === today() && s.plan.left != null ? s.plan.left : '?';
    if (s.mode === 'plan' && planDone(s)) {
      document.body.classList.add('ok'); $('h').textContent = 'Plan done: TikTok is unlocked'; $('msg').textContent = 'Nice work. TikTok is open again until tomorrow at ' + s.start + '.';
      $('crit').textContent = 'Open TikTok'; $('crit').onclick = () => { location.href = 'https://www.tiktok.com/'; }; $('check').hidden = true; $('stay').hidden = true; stay = true; $('left').textContent = '0';
    } else {
      $('msg').textContent = s.mode === 'plan' ? 'It\'s after ' + s.start + ', so TikTok stays closed until today\'s plan in Critical is done. Then it opens back up by itself.' : why(s);
    }
  }
  paint();
  $('stay').onclick = () => { stay = true; $('stay').hidden = true; };
  $('crit').onclick = () => { stay = true; chrome.runtime.sendMessage('openCritical'); };
  // Critical has to be opened in Chrome once you've finished, so it can tell Critical Guard
  $('check').onclick = () => { stay = true; $('check').textContent = 'Checking in Critical…'; chrome.runtime.sendMessage('openCritical'); };
  chrome.storage.onChanged.addListener(async () => { s = await getS(); paint(); });
  chrome.runtime.onMessage.addListener((m) => { if (m === 'unlocked') getS().then((x) => { s = x; paint(); }); });
  if (document.referrer === '' && history.length <= 2) chrome.runtime.sendMessage('counted');
  setTimeout(() => { if (!stay) chrome.runtime.sendMessage('closeMe', (closed) => { if (!closed) stay = true; }); }, 4000);
})();
