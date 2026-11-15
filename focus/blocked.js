chrome.runtime.sendMessage({ type: 'blocked' }, r => {
  if (r && r.ok === false) {
    document.querySelector('h1').textContent = 'TikTok is unblocked';
    document.querySelector('p').textContent = 'It\'s not plan time any more. Reload the page to carry on.';
    document.querySelector('.muted').textContent = '';
  }
});
