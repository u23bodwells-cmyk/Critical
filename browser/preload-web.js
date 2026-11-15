'use strict';
// Runs in every page inside Critical Browser, but only gives powers to two kinds of page:
//  - Critical itself, which reports today's plan (so the browser knows when to unblock things)
//  - the browser's own pages (new tab, blocked), which show that status
const { contextBridge, ipcRenderer } = require('electron');
let here = null; try { here = new URL(location.href); } catch (e) {}
if (here && here.origin === 'https://u23bodwells-cmyk.github.io' && here.pathname.startsWith('/Critical/')) {
  contextBridge.exposeInMainWorld('criticalBrowser', {
    status: (s) => { try { ipcRenderer.send('critical-status', JSON.parse(JSON.stringify(s || {}))); } catch (e) {} },
    // the browser asks Critical to re-check synced progress (e.g. you finished in Chrome, then switched back here)
    onRefresh: (f) => { ipcRenderer.on('critical-refresh', () => { try { f(); } catch (e) {} }); },
    browser: true
  });
}
if (here && here.protocol === 'critical:') {
  contextBridge.exposeInMainWorld('cb', {
    state: () => ipcRenderer.invoke('cb-state'),
    go: (what) => ipcRenderer.sendToHost('cb-go', String(what || '')),
    refresh: () => ipcRenderer.invoke('cb-refresh'),
    onState: (f) => ipcRenderer.on('state', (_e, s) => { try { f(s); } catch (e) {} })
  });
}
