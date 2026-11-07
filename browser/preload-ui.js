'use strict';
// Bridge for the browser's own window (tabs, toolbar, panels).
const { contextBridge, ipcRenderer } = require('electron');
const CH = ['state', 'open-tab', 'lock-prompt', 'toast', 'plan-time', 'shortcut', 'ask-claude'];
contextBridge.exposeInMainWorld('cbHost', {
  init: () => ipcRenderer.invoke('cb-init'),
  state: () => ipcRenderer.invoke('cb-state'),
  settings: (p) => ipcRenderer.invoke('cb-settings', p),
  displays: () => ipcRenderer.invoke('cb-displays'),
  testDisplay: (i) => ipcRenderer.invoke('cb-test-display', i),
  skipBegin: () => ipcRenderer.invoke('cb-skip-begin'),
  skipToday: () => ipcRenderer.invoke('cb-skip-today'),
  quit: () => ipcRenderer.invoke('cb-quit'),
  checkUpdates: () => ipcRenderer.invoke('cb-check-updates'),
  installUpdate: () => ipcRenderer.invoke('cb-install-update'),
  openExternal: (u) => ipcRenderer.invoke('cb-open-external', u),
  showFile: (p) => ipcRenderer.invoke('cb-show-file', p),
  theme: (dark) => ipcRenderer.send('cb-theme', !!dark),
  fullscreen: () => ipcRenderer.send('cb-fullscreen'),
  on: (ch, f) => { if (CH.includes(ch)) ipcRenderer.on(ch, (_e, ...a) => f(...a)); }
});
