'use strict';
(function () {
  const q = new URLSearchParams(location.search), u = q.get('u') || '', c = +(q.get('c') || 0), d = q.get('d') || '';
  let host = ''; try { host = new URL(u).hostname; } catch (e) {}
  const offline = [-106, -21, -130, -109].includes(c), notFound = [-105, -137].includes(c), slow = [-7, -118].includes(c);
  document.getElementById('h').textContent = offline ? 'You\'re offline' : notFound ? 'Couldn\'t find ' + (host || 'that site') : slow ? (host || 'The site') + ' took too long' : 'Can\'t open ' + (host || 'this page');
  document.getElementById('lead').textContent = offline ? 'Check the Wi-Fi, then try again.' : notFound ? 'Check the address for typos.' : 'The site might be down, or something blocked it.';
  document.getElementById('code').textContent = d ? d + ' (' + c + ')' : '';
  document.getElementById('retry').onclick = () => { if (/^https?:\/\//.test(u)) location.href = u; };
  document.getElementById('crit').onclick = () => { if (window.cb) cb.go('critical'); };
})();
