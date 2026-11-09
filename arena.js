/* Critical Clash: a gun-game shooter for Critical. Every kill asks you a question (30 seconds).
   Answer right to move up the weapon ladder; the first kill with the golden control rod wins.
   Copyright (c) u23bodwells-cmyk. All rights reserved. */
(function () {
'use strict';
if (window.CRIT_ARENA) return;
var API = window.CRIT_ARENA_API || { tracks: function () { return []; }, questions: function () { return []; }, result: function () {}, xp: function () {}, crate: function () {}, sfx: function () {}, close: function () {} };
var SKEY = 'critical_arena';
function rd() { try { return JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; } catch (e) { return {}; } }
function wr(o) { try { localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

/* ---------------- data ---------------- */
var WEAPONS = [
  { n: 'Geiger pistol', dmg: 30, rate: 0.30, spr: 0.012, rng: 20, kind: 'pistol', bacc: 1.0, col: '#9aa4b2' },
  { n: 'Neutron SMG', dmg: 15, rate: 0.085, spr: 0.045, rng: 16, kind: 'smg', bacc: 0.8, auto: 1, col: '#5eead4' },
  { n: 'Boron shotgun', dmg: 13, rate: 0.75, spr: 0.11, pel: 8, rng: 9, kind: 'shotgun', bacc: 1.15, col: '#f97316' },
  { n: 'Isotope rifle', dmg: 26, rate: 0.13, spr: 0.02, rng: 24, kind: 'rifle', bacc: 0.9, auto: 1, col: '#60a5fa' },
  { n: 'Burst carbine', dmg: 24, rate: 0.45, spr: 0.015, burst: 3, rng: 22, kind: 'burst', bacc: 0.95, col: '#a78bfa' },
  { n: 'Gamma sniper', dmg: 110, rate: 1.2, spr: 0, rng: 40, kind: 'sniper', bacc: 1.1, col: '#22c55e' },
  { n: 'Plasma minigun', dmg: 11, rate: 0.05, spr: 0.06, rng: 16, kind: 'mini', bacc: 0.7, auto: 1, col: '#f472b6' },
  { n: 'Turbine revolver', dmg: 60, rate: 0.55, spr: 0.008, rng: 26, kind: 'revolver', bacc: 1.0, col: '#eab308' },
  { n: 'Fission launcher', dmg: 100, rate: 1.0, proj: 1, splash: 2.2, rng: 30, kind: 'rocket', bacc: 0.8, col: '#ef4444' },
  { n: 'Golden control rod', dmg: 200, rate: 0.45, melee: 1.55, kind: 'rod', bacc: 1.3, col: '#f5c542' }
];
var LADDERS = { full: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], quick: [0, 2, 5, 8, 9] };
var DIFF = {
  easy: { n: 'Easy', acc: 0.17, react: 0.95, spd: 1.55, ans: 0.4, fire: 1.6, vis: 12, turn: 3.2, col: '#22c55e' },
  normal: { n: 'Normal', acc: 0.30, react: 0.6, spd: 1.95, ans: 0.6, fire: 1.25, vis: 15, turn: 4.5, col: '#3b82f6' },
  hard: { n: 'Hard', acc: 0.46, react: 0.38, spd: 2.35, ans: 0.75, fire: 1.0, vis: 18, turn: 6, col: '#f97316' },
  insane: { n: 'Insane', acc: 0.62, react: 0.22, spd: 2.75, ans: 0.9, fire: 0.9, vis: 22, turn: 8, col: '#ef4444' }
};
var BOTNAMES = ['Curie', 'Fermi', 'Meitner', 'Bohr', 'Rutherford', 'Chadwick', 'Szilard', 'Noether', 'Becquerel', 'Franklin', 'Hahn', 'Oppie'];
var BOTCOL = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];
var MAPS = {
  turbine: { n: 'Turbine hall', d: 'Big open hall with turbines to hide behind. Good all-rounder.', sky: ['#1b2430', '#323c4a'], floor: ['#2a2f36', '#15181c'], fog: [20, 24, 30], grid: [
    '########################',
    '#......#.......#.......#',
    '#.TT...#...P...#...TT..#',
    '#.TT.......P.......TT..#',
    '#......#.......#.......#',
    '###.####..HHH..####.####',
    '#..........H...........#',
    '#..PP......H.......PP..#',
    '#..........H...........#',
    '#......#.......#.......#',
    '####..##...R...##..#####',
    '#.........RRR..........#',
    '#.....#....R....#......#',
    '#.....#.........#......#',
    '####..###.....###..#####',
    '#......................#',
    '#..TT....#####....TT...#',
    '#..TT....#...#....TT...#',
    '#........#.......#.....#',
    '#.....P..........P.....#',
    '#..H...................#',
    '#..H....##.....##...H..#',
    '#.......#.......#...H..#',
    '########################'] },
  core: { n: 'Reactor core', d: 'Tight corridors round a glowing core. Close-range chaos.', sky: ['#06141c', '#0b2a36'], floor: ['#0d1c24', '#060c10'], fog: [4, 18, 26], grid: [
    '######################',
    '#....#..........#....#',
    '#....#..PP..PP..#....#',
    '#....H..........H....#',
    '##.###...####...###.##',
    '#........#RR#........#',
    '#..#.....#RR#.....#..#',
    '#..#..............#..#',
    '#..####.##..##.####..#',
    '#.........RR.........#',
    '#.........RR.........#',
    '#..####.##..##.####..#',
    '#..#..............#..#',
    '#..#.....#RR#.....#..#',
    '#........#RR#........#',
    '##.###...####...###.##',
    '#....H..........H....#',
    '#....#..PP..PP..#....#',
    '#....#..........#....#',
    '######################'] },
  towers: { n: 'Cooling towers', d: 'Long sightlines between the towers. Snipers love it.', sky: ['#7aa7c7', '#d8e6f0'], floor: ['#4b5a3c', '#2c3524'], fog: [150, 175, 195], grid: [
    '##########################',
    '#........................#',
    '#..BBB.........BBB.......#',
    '#..B.B....H....B.B...H...#',
    '#..BBB....H....BBB...H...#',
    '#........................#',
    '#....P...........P.......#',
    '#....P...TTT.....P...BBB.#',
    '#........T.T.........B.B.#',
    '#........TTT.........BBB.#',
    '#.....H..................#',
    '#.BBB.H......BBB....P....#',
    '#.B.B........B.B....P....#',
    '#.BBB........BBB.........#',
    '#..........H.............#',
    '#....P.....H.....TTT.....#',
    '#....P...........T.T.....#',
    '#................TTT.....#',
    '#........................#',
    '##########################'] }
};
var WALLCH = { '#': 1, 'H': 2, 'P': 3, 'R': 4, 'T': 5, 'B': 6 };

/* ---------------- textures ---------------- */
var TEX = {}, TS = 64;
function mkTex(id, draw) { var c = document.createElement('canvas'); c.width = c.height = TS; var g = c.getContext('2d'); draw(g); TEX[id] = g.getImageData(0, 0, TS, TS).data; }
function noise(g, a) { var d = g.getImageData(0, 0, TS, TS); for (var i = 0; i < d.data.length; i += 4) { var n = (Math.random() - 0.5) * a; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0); }
function buildTex() {
  if (TEX[1]) return;
  mkTex(1, function (g) { g.fillStyle = '#5b6573'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4a535f'; for (var y = 0; y < 64; y += 32) for (var x = 0; x < 64; x += 32) { g.fillRect(x + 1, y + 1, 30, 30); } g.fillStyle = '#6d7886'; g.fillRect(0, 31, 64, 2); g.fillRect(31, 0, 2, 64); g.fillStyle = '#39414b'; [[6, 6], [56, 6], [6, 56], [56, 56], [38, 38], [24, 24]].forEach(function (p) { g.fillRect(p[0], p[1], 3, 3); }); noise(g, 18); });
  mkTex(2, function (g) { g.fillStyle = '#20232a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#f5c518'; for (var i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 8 - 64, 64); g.lineTo(i - 64, 64); g.fill(); } g.fillStyle = '#3a3f48'; g.fillRect(0, 0, 64, 6); g.fillRect(0, 58, 64, 6); noise(g, 22); });
  mkTex(3, function (g) { g.fillStyle = '#3f4650'; g.fillRect(0, 0, 64, 64); for (var x = 4; x < 64; x += 20) { var gr = g.createLinearGradient(x, 0, x + 14, 0); gr.addColorStop(0, '#59616c'); gr.addColorStop(0.5, '#c7ced8'); gr.addColorStop(1, '#4b525c'); g.fillStyle = gr; g.fillRect(x, 0, 14, 64); g.fillStyle = '#2b3037'; g.fillRect(x - 1, 14, 16, 4); g.fillRect(x - 1, 46, 16, 4); } g.fillStyle = '#d33'; g.fillRect(44, 26, 10, 10); noise(g, 14); });
  mkTex(4, function (g) { var gr = g.createRadialGradient(32, 32, 4, 32, 32, 44); gr.addColorStop(0, '#d8fbff'); gr.addColorStop(0.35, '#38d9f5'); gr.addColorStop(1, '#0b4a63'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(10,40,60,.8)'; g.lineWidth = 2; for (var i = 0; i < 64; i += 16) { g.strokeRect(i + 1, 1, 14, 62); } g.fillStyle = '#062433'; g.fillRect(0, 0, 64, 4); g.fillRect(0, 60, 64, 4); });
  mkTex(5, function (g) { g.fillStyle = '#4c6a5c'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3b5549'; for (var y = 4; y < 64; y += 12) g.fillRect(0, y, 64, 5); g.fillStyle = '#9fb7ab'; g.fillRect(0, 0, 64, 2); g.fillStyle = '#ffd34d'; g.fillRect(8, 26, 12, 12); g.fillStyle = '#222'; g.font = 'bold 10px sans-serif'; g.fillText('⚡', 9, 36); noise(g, 16); });
  mkTex(6, function (g) { g.fillStyle = '#b9b2a6'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#9e978b'; for (var y = 0; y < 64; y += 8) { var off = (y / 8) % 2 ? 8 : 0; for (var x = -8; x < 64; x += 16) g.fillRect(x + off + 1, y + 1, 14, 6); } g.fillStyle = 'rgba(80,70,60,.25)'; g.fillRect(0, 40, 64, 24); noise(g, 20); });
}
/* bot sprites: 32 x 48 hazmat suits, 4 frames (walk a, walk b, shoot, hurt) */
function botFrames(col) {
  var fr = [];
  for (var f = 0; f < 4; f++) {
    var c = document.createElement('canvas'); c.width = 32; c.height = 48; var g = c.getContext('2d');
    var body = f === 3 ? '#ffffff' : col;
    g.fillStyle = '#1f2937'; var lo = f === 0 ? -2 : f === 1 ? 2 : 0;
    g.fillRect(9 + lo, 34, 6, 13); g.fillRect(17 - lo, 34, 6, 13);
    g.fillStyle = body; g.fillRect(7, 16, 18, 20); g.fillRect(9 + lo, 33, 6, 6); g.fillRect(17 - lo, 33, 6, 6);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(7, 30, 18, 4);
    g.fillStyle = body; g.beginPath(); g.arc(16, 11, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0f172a'; g.fillRect(10, 7, 12, 7); g.fillStyle = '#7dd3fc'; g.fillRect(11, 8, 10, 3);
    g.fillStyle = '#facc15'; g.beginPath(); g.arc(16, 24, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#111'; g.fillRect(15, 23, 2, 2);
    g.fillStyle = body; g.fillRect(3, 18, 5, 11); g.fillRect(24, 18, 5, 11);
    g.fillStyle = '#111827'; if (f === 2) { g.fillRect(20, 20, 12, 4); g.fillStyle = '#fde047'; g.fillRect(29, 18, 3, 8); } else g.fillRect(22, 24, 9, 4);
    fr.push({ d: g.getImageData(0, 0, 32, 48).data, w: 32, h: 48 });
  }
  return fr;
}

/* ---------------- sound ---------------- */
var AC = null, MASTER = null;
function audio() { if (AC) return AC; try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = 0.35; MASTER.connect(AC.destination); } catch (e) { AC = null; } return AC; }
function noiseBuf() { if (noiseBuf.b) return noiseBuf.b; var a = audio(); if (!a) return null; var b = a.createBuffer(1, a.sampleRate * 0.6, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noiseBuf.b = b; return b; }
function shot(kind, vol) {
  var a = audio(); if (!a || !MASTER) return; var t = a.currentTime, src = a.createBufferSource(); src.buffer = noiseBuf(); var f = a.createBiquadFilter(), g = a.createGain();
  var P = { pistol: [1800, 0.12], smg: [2600, 0.07], shotgun: [700, 0.28], rifle: [1500, 0.1], burst: [1700, 0.09], sniper: [500, 0.4], mini: [3200, 0.05], revolver: [900, 0.22], rocket: [300, 0.5], rod: [300, 0.12], boom: [160, 0.7], hit: [4000, 0.04] }[kind] || [1500, 0.1];
  f.type = kind === 'rod' ? 'bandpass' : 'lowpass'; f.frequency.value = P[0]; g.gain.setValueAtTime((vol == null ? 1 : vol) * (kind === 'boom' ? 1.2 : 0.9), t); g.gain.exponentialRampToValueAtTime(0.001, t + P[1]);
  src.connect(f); f.connect(g); g.connect(MASTER); src.start(t); src.stop(t + P[1] + 0.02);
  if (kind === 'sniper' || kind === 'revolver' || kind === 'boom' || kind === 'shotgun') { var o = a.createOscillator(), og = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(kind === 'boom' ? 90 : 140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25); og.gain.setValueAtTime(0.5 * (vol == null ? 1 : vol), t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(og); og.connect(MASTER); o.start(t); o.stop(t + 0.32); }
}
function beep(f1, f2, dur, type) { var a = audio(); if (!a || !MASTER) return; var t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f1, t); o.frequency.linearRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + dur + 0.02); }

/* ---------------- the overlay + setup ---------------- */
var root = null, st = null;
var CSS = '.arn{position:fixed;inset:0;z-index:2147482000;background:#05080d;color:#e8edf7;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none}' +
  '.arn *{box-sizing:border-box}.arn button{font:inherit;color:inherit;cursor:pointer}.arn canvas.arv{position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated;cursor:crosshair}' +
  '.arsetup{position:absolute;inset:0;overflow:auto;padding:max(18px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 28px max(16px,env(safe-area-inset-left));background:radial-gradient(1200px 600px at 20% -10%,rgba(59,130,246,.25),transparent),radial-gradient(900px 500px at 110% 10%,rgba(239,68,68,.18),transparent),#05080d}' +
  '.arwrap{max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:14px}.arhd{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.arhd h1{margin:0;font-size:clamp(26px,5vw,40px);letter-spacing:-.02em;line-height:1;background:linear-gradient(90deg,#fde047,#fb923c,#ef4444);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:900}' +
  '.arhd p{margin:4px 0 0;color:#9aa6bb;max-width:62ch;line-height:1.45}.arx{margin-left:auto;border:1.5px solid #2a3446;background:#0d1320;border-radius:12px;padding:9px 14px;font-weight:800}' +
  '.arcard{background:linear-gradient(180deg,#0f1625,#0b111d);border:1px solid #1f2a3d;border-radius:18px;padding:14px 16px}.arcard h2{margin:0 0 10px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#93a3bd;font-weight:800}' +
  '.argrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px}@media(max-width:820px){.argrid{grid-template-columns:1fr}}' +
  '.archips{display:flex;flex-wrap:wrap;gap:8px}.archip{border:1.5px solid #253045;background:#0d1422;border-radius:12px;padding:8px 12px;font-weight:800;display:flex;gap:6px;align-items:center}.archip[aria-pressed=true]{border-color:#fb923c;background:rgba(251,146,60,.14);box-shadow:0 0 0 3px rgba(251,146,60,.15)}.archip:disabled{opacity:.4;cursor:not-allowed}.archip small{font-weight:600;color:#93a3bd;font-size:12px}' +
  '.arlv{flex-direction:column;align-items:flex-start;gap:2px;min-width:104px}.armaps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:560px){.armaps{grid-template-columns:1fr}}.armap{border:1.5px solid #253045;background:#0d1422;border-radius:14px;padding:8px;text-align:left;display:flex;flex-direction:column;gap:6px}.armap[aria-pressed=true]{border-color:#fb923c;box-shadow:0 0 0 3px rgba(251,146,60,.15)}.armap canvas{width:100%;height:auto;border-radius:8px;background:#000;image-rendering:pixelated}.armap b{font-size:14px}.armap span{font-size:12px;color:#93a3bd;line-height:1.35}' +
  '.arbots{display:flex;flex-direction:column;gap:6px}.arbot{display:flex;align-items:center;gap:8px;border:1px solid #1f2a3d;background:#0b1220;border-radius:12px;padding:6px 8px}.arbot i{width:14px;height:14px;border-radius:4px;flex:none}.arbot b{flex:1;min-width:0}.arbot select{font:inherit;font-weight:700;background:#111a2b;color:#e8edf7;border:1.5px solid #2a3446;border-radius:9px;padding:5px 8px}.arbot button{border:0;background:none;color:#93a3bd;font-size:18px;width:30px;height:30px;border-radius:8px}.arbot button:hover{background:#1a2333}' +
  '.arrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.arbtn{border:0;border-radius:14px;padding:12px 18px;font-weight:900;background:#1a2436;border:1.5px solid #2a3446}.arbtn.go{background:linear-gradient(90deg,#f59e0b,#ef4444);border:0;color:#fff;font-size:18px;padding:14px 26px;box-shadow:0 10px 30px -10px #ef4444}.arbtn.go:disabled{opacity:.5}.arsmall{font-size:12.5px;color:#93a3bd;line-height:1.45}' +
  '.arsl{display:flex;align-items:center;gap:10px}.arsl input{flex:1;accent-color:#fb923c}.arkeys{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:13px;color:#b8c3d6}.arkeys kbd{font:800 11px ui-monospace,monospace;background:#1a2333;border:1px solid #2a3446;border-bottom-width:2px;border-radius:6px;padding:2px 6px;color:#e8edf7;white-space:nowrap}' +
  '.arq{position:absolute;inset:0;display:grid;place-items:center;background:rgba(3,6,12,.72);backdrop-filter:blur(3px);padding:16px}.arqbox{width:min(720px,100%);max-height:92vh;overflow:auto;background:linear-gradient(180deg,#111a2c,#0b1220);border:2px solid #2a3a58;border-radius:20px;padding:18px;box-shadow:0 30px 80px -20px #000;display:flex;flex-direction:column;gap:12px}' +
  '.arqtop{display:flex;align-items:center;gap:10px;font:800 12px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#fb923c}.arqtop span:last-child{margin-left:auto;color:#e8edf7;font-size:16px}.artime{height:8px;border-radius:5px;background:#1a2333;overflow:hidden}.artime i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#eab308,#ef4444);transform-origin:left}' +
  '.arqp{font-size:clamp(17px,2.6vw,21px);font-weight:700;line-height:1.4}.arqs{font-size:12px;color:#93a3bd}.aropts{display:grid;gap:8px}.aropt{display:flex;gap:10px;align-items:center;text-align:left;border:2px solid #263249;background:#0d1524;border-radius:14px;padding:12px 14px;font-size:16px;font-weight:600}.aropt:hover{border-color:#fb923c}.aropt kbd{font:800 12px ui-monospace,monospace;background:#1a2333;border-radius:7px;padding:3px 8px;flex:none}.aropt.ok{border-color:#22c55e;background:rgba(34,197,94,.15)}.aropt.no{border-color:#ef4444;background:rgba(239,68,68,.13)}.aropt:disabled{cursor:default}' +
  '.arnum{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.arnum input{flex:1 1 200px;min-width:0;font:700 20px ui-monospace,monospace;color:#e8edf7;background:#0d1524;border:2px solid #263249;border-radius:12px;padding:12px 14px}.arnum input:focus{outline:none;border-color:#fb923c}.arnum span{font-weight:700;color:#93a3bd}.arfb{border-radius:14px;padding:12px 14px;font-weight:600;line-height:1.45}.arfb.ok{background:rgba(34,197,94,.14);border:1.5px solid #22c55e}.arfb.no{background:rgba(239,68,68,.12);border:1.5px solid #ef4444}.arfb b{display:block;font-size:17px;margin-bottom:2px}' +
  '.armenu{position:absolute;inset:0;display:grid;place-items:center;background:rgba(3,6,12,.78);padding:16px}.armenu .arqbox{max-width:520px;text-align:center;align-items:center}.armenu h2{margin:0;font-size:28px}' +
  '.arres{position:absolute;inset:0;overflow:auto;background:rgba(3,6,12,.92);padding:20px 16px}.arres .arwrap{max-width:820px}.arbig{font-size:clamp(34px,7vw,64px);font-weight:900;letter-spacing:-.03em;margin:0;line-height:1}.arbig.win{background:linear-gradient(90deg,#fde047,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent}.arstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}.arstats div{background:#0d1524;border:1px solid #1f2a3d;border-radius:14px;padding:10px 12px}.arstats b{display:block;font:900 24px ui-monospace,monospace}.arstats span{font-size:12px;color:#93a3bd;font-weight:700}' +
  '.artable{width:100%;border-collapse:collapse;font-size:14px}.artable td,.artable th{padding:7px 8px;border-bottom:1px solid #1f2a3d;text-align:left}.artable th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#93a3bd}.artable tr.me td{color:#fde047;font-weight:800}' +
  '.armiss{display:flex;flex-direction:column;gap:8px}.armiss div{background:#0d1524;border:1px solid #1f2a3d;border-left:4px solid #ef4444;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.4}.armiss em{display:block;font-style:normal;color:#86efac;font-weight:700;margin-top:4px}' +
  '.artouch{position:absolute;inset:0;pointer-events:none}.artouch .stick{position:absolute;left:24px;bottom:24px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.18);pointer-events:auto}.artouch .stick i{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.3)}.artouch .fire{position:absolute;right:28px;bottom:40px;width:96px;height:96px;border-radius:50%;background:rgba(239,68,68,.35);border:3px solid rgba(255,255,255,.35);pointer-events:auto;font-weight:900;color:#fff}.artouch .look{position:absolute;right:0;top:0;width:55%;height:100%;pointer-events:auto}' +
  '.arclick{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);background:rgba(3,6,12,.75);border:1.5px solid #2a3446;border-radius:14px;padding:10px 16px;font-weight:800;pointer-events:none}';

function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function open() {
  if (root) return;
  if (!document.getElementById('arnCss')) { var s = el('style'); s.id = 'arnCss'; s.textContent = CSS; document.head.appendChild(s); }
  root = el('div', 'arn'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Critical Clash'); document.body.appendChild(root); document.body.classList.add('noscroll');
  buildTex(); setup();
}
function close() {
  stopGame(); if (root) root.remove(); root = null;
  if (!document.querySelector('.xov')) document.body.classList.remove('noscroll');
  try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  var gained = pendingXP; pendingXP = 0; if (gained > 0) API.xp(gained);
  API.close();
}
var pendingXP = 0;

function cfg() {
  var c = rd(); var tr = API.tracks();
  if (!c.track || !tr.some(function (t) { return t.id === c.track; })) { var best = tr.slice().sort(function (a, b) { return sum(b) - sum(a); })[0]; c.track = best ? best.id : 'theory'; }
  if (!c.lv) c.lv = 1; if (!MAPS[c.map]) c.map = 'turbine'; if (!c.bots || !c.bots.length) c.bots = ['normal', 'normal', 'easy', 'hard'];
  if (!LADDERS[c.ladder]) c.ladder = 'full'; if (!c.sens) c.sens = 5; if (c.onlyDone == null) c.onlyDone = true; return c;
  function sum(t) { return t.levels.reduce(function (a, l) { return a + l.done; }, 0); }
}
function mapPreview(id, cvs) {
  var m = MAPS[id].grid, h = m.length, w = m[0].length, s = 4; cvs.width = w * s; cvs.height = h * s; var g = cvs.getContext('2d');
  g.fillStyle = MAPS[id].floor[0]; g.fillRect(0, 0, w * s, h * s);
  var C = { 1: '#6b7684', 2: '#f5c518', 3: '#aeb6c1', 4: '#38d9f5', 5: '#5f8a76', 6: '#c9c1b4' };
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var t = WALLCH[m[y][x]]; if (t) { g.fillStyle = C[t]; g.fillRect(x * s, y * s, s, s); } }
}
function setup() {
  stopGame(); var c = cfg(), tracks = API.tracks();
  root.innerHTML = ''; var S = el('div', 'arsetup'); root.appendChild(S);
  var W = el('div', 'arwrap'); S.appendChild(W);
  W.appendChild(el('div', 'arhd', '<div><h1>CRITICAL CLASH</h1><p>Gun game against AI bots. Every kill asks you a question with a 30-second timer. Answer it right and your weapon upgrades. The first kill with the <b style="color:#f5c542">golden control rod</b> wins.</p></div><button type="button" class="arx" data-a="x">✕ Exit</button>'));
  var G = el('div', 'argrid'); W.appendChild(G);
  var L = el('div'), R = el('div'); L.style.cssText = R.style.cssText = 'display:flex;flex-direction:column;gap:14px;min-width:0'; G.appendChild(L); G.appendChild(R);
  var cs = el('section', 'arcard'); cs.innerHTML = '<h2>Questions from</h2><div class="archips" data-k="track"></div><div style="height:10px"></div><div class="archips" data-k="lv"></div><p class="arsmall" data-k="qinfo" style="margin:10px 0 0"></p><label class="arsmall" style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" data-k="only"> Only lessons I\'ve done</label>'; L.appendChild(cs);
  var ms = el('section', 'arcard'); ms.innerHTML = '<h2>Map</h2><div class="armaps"></div>'; L.appendChild(ms);
  var bs = el('section', 'arcard'); bs.innerHTML = '<h2>Bots</h2><div class="arbots"></div><div class="arrow" style="margin-top:8px"><button type="button" class="arbtn" data-a="add">+ Add bot</button><span class="arsmall">Set all:</span>' + Object.keys(DIFF).map(function (k) { return '<button type="button" class="archip" data-all="' + k + '" style="padding:6px 10px;font-size:13px;border-color:' + DIFF[k].col + '55">' + DIFF[k].n + '</button>'; }).join('') + '</div><p class="arsmall" style="margin:8px 0 0">Harder bots aim better, react faster, move quicker and are more likely to "answer right" and upgrade after a kill.</p>'; R.appendChild(bs);
  var os = el('section', 'arcard'); os.innerHTML = '<h2>Match</h2><div class="archips" data-k="ladder"><button type="button" class="archip" data-ld="full">Full ladder <small>10 weapons</small></button><button type="button" class="archip" data-ld="quick">Quick <small>5 weapons</small></button></div><div class="arsl" style="margin-top:12px"><span class="arsmall" style="min-width:110px">Mouse speed</span><input type="range" min="1" max="10" step="1" data-k="sens" aria-label="Mouse speed"><b data-k="sensv"></b></div><div class="arkeys" style="margin-top:12px"><kbd>WASD</kbd><span>Move (arrow keys turn)</span><kbd>Mouse</kbd><span>Look, click to shoot (hold for automatic weapons)</span><kbd>1–4</kbd><span>Answer questions</span><kbd>Tab</kbd><span>Scoreboard</span><kbd>Esc</kbd><span>Pause</span></div>'; R.appendChild(os);
  var go = el('div', 'arrow'); go.innerHTML = '<button type="button" class="arbtn go" data-a="go">▶ Start match</button><span class="arsmall" data-k="best"></span>'; W.appendChild(go);
  function q(s) { return S.querySelector(s); }
  function paint() {
    var tr = tracks.filter(function (t) { return t.id === c.track; })[0] || tracks[0];
    q('[data-k=track]').innerHTML = tracks.map(function (t) { return '<button type="button" class="archip" data-tr="' + t.id + '" aria-pressed="' + (t.id === c.track) + '">' + t.ic + ' ' + esc(t.name) + '</button>'; }).join('');
    if (tr) {
      var lv = tr.levels.filter(function (l) { return l.lv === c.lv; })[0]; if (!lv || !lv.q) { var f = tr.levels.filter(function (l) { return l.q; })[0]; c.lv = f ? f.lv : 1; lv = f; }
      q('[data-k=lv]').innerHTML = tr.levels.map(function (l) { return '<button type="button" class="archip arlv" data-lv="' + l.lv + '" aria-pressed="' + (l.lv === c.lv) + '"' + (l.q ? '' : ' disabled') + '>Level ' + l.lv + '<small>' + l.done + '/' + l.tot + ' lessons done</small></button>'; }).join('');
      var qs = pool(c), all = API.questions(c.track, c.lv).length;
      q('[data-k=qinfo]').textContent = qs.length + ' question' + (qs.length === 1 ? '' : 's') + ' in the mix' + (c.onlyDone && qs.length < all ? ' (from the lessons you\'ve done)' : '') + (c.onlyDone && poolDoneLen(c) < 6 && all ? '. You haven\'t done enough lessons here yet, so it uses the whole level.' : '.');
    }
    q('[data-k=only]').checked = !!c.onlyDone;
    q('.armaps').innerHTML = Object.keys(MAPS).map(function (k) { return '<button type="button" class="armap" data-map="' + k + '" aria-pressed="' + (k === c.map) + '"><canvas></canvas><b>' + MAPS[k].n + '</b><span>' + MAPS[k].d + '</span></button>'; }).join('');
    [].forEach.call(q('.armaps').querySelectorAll('.armap'), function (b) { mapPreview(b.getAttribute('data-map'), b.querySelector('canvas')); });
    q('.arbots').innerHTML = c.bots.map(function (d, i) { return '<div class="arbot"><i style="background:' + BOTCOL[i % BOTCOL.length] + '"></i><b>' + BOTNAMES[i] + '</b><select data-bot="' + i + '" aria-label="' + BOTNAMES[i] + ' difficulty">' + Object.keys(DIFF).map(function (k) { return '<option value="' + k + '"' + (k === d ? ' selected' : '') + '>' + DIFF[k].n + '</option>'; }).join('') + '</select><button type="button" data-rm="' + i + '" aria-label="Remove ' + BOTNAMES[i] + '"' + (c.bots.length <= 1 ? ' disabled' : '') + '>✕</button></div>'; }).join('');
    q('[data-a=add]').disabled = c.bots.length >= 7;
    [].forEach.call(q('[data-k=ladder]').querySelectorAll('[data-ld]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ld') === c.ladder)); });
    q('[data-k=sens]').value = c.sens; q('[data-k=sensv]').textContent = c.sens;
    var rec = rd().rec || {}; q('[data-k=best]').textContent = rec.wins ? 'Wins so far: ' + rec.wins + (rec.best ? ' · best on Insane: ' + rec.best : '') : 'Tip: start on Easy or Normal bots.';
    q('[data-a=go]').disabled = !pool(c).length; wr(c);
  }
  S.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'x') { close(); return; }
    if (b.dataset.a === 'go') { start(c); return; }
    if (b.dataset.a === 'add') { if (c.bots.length < 7) c.bots.push(c.bots[c.bots.length - 1] || 'normal'); }
    if (b.dataset.tr) { c.track = b.dataset.tr; }
    if (b.dataset.lv) { c.lv = +b.dataset.lv; }
    if (b.dataset.map) { c.map = b.dataset.map; }
    if (b.dataset.rm != null && c.bots.length > 1) { c.bots.splice(+b.dataset.rm, 1); }
    if (b.dataset.all) { c.bots = c.bots.map(function () { return b.dataset.all; }); }
    if (b.dataset.ld) { c.ladder = b.dataset.ld; }
    paint();
  });
  S.addEventListener('change', function (e) { var t = e.target; if (t.dataset.bot != null) { c.bots[+t.dataset.bot] = t.value; paint(); } if (t.dataset.k === 'only') { c.onlyDone = t.checked; paint(); } });
  S.addEventListener('input', function (e) { if (e.target.dataset.k === 'sens') { c.sens = +e.target.value; q('[data-k=sensv]').textContent = c.sens; wr(c); } });
  paint();
  try { q('[data-a=go]').focus(); } catch (e) {}
}
function poolDoneLen(c) { return API.questions(c.track, c.lv).filter(function (x) { return x.done; }).length; }
function pool(c) { var all = API.questions(c.track, c.lv); if (c.onlyDone) { var d = all.filter(function (x) { return x.done; }); if (d.length >= 6) return d; } return all; }

/* ---------------- the game ---------------- */
var cv = null, g2 = null, low = null, lg = null, img = null, buf = null, zbuf = null, RW = 400, RH = 225, raf = 0, keys = {}, mouseDown = false;
function stopGame() { if (raf) cancelAnimationFrame(raf); raf = 0; if (st) { st.over = true; st = null; } document.removeEventListener('keydown', onKey, true); document.removeEventListener('keyup', onKeyUp, true); document.removeEventListener('mousemove', onMouse); document.removeEventListener('pointerlockchange', onLock); window.removeEventListener('resize', resize); keys = {}; mouseDown = false; }
function start(c) {
  stopGame(); audio(); if (AC && AC.state === 'suspended') AC.resume();
  var M = MAPS[c.map], grid = M.grid.map(function (r) { return r.split('').map(function (ch) { return WALLCH[ch] || 0; }); });
  var lad = LADDERS[c.ladder];
  st = { c: c, M: M, grid: grid, gw: grid[0].length, gh: grid.length, lad: lad, ents: [], proj: [], feed: [], t: 0, paused: false, q: null, over: false, qs: shuffle(pool(c)), qi: 0, asked: 0, right: 0, missed: [], xp: 0, shots: 0, hits: 0, kills: 0, deaths: 0, hitT: 0, dmgT: 0, flash: 0, recoil: 0, bob: 0, burstLeft: 0, burstT: 0, startT: performance.now() };
  var me = mkEnt('You', '#fde047', null); me.me = true; st.me = me; st.ents.push(me);
  c.bots.forEach(function (d, i) { var b = mkEnt(BOTNAMES[i], BOTCOL[i % BOTCOL.length], d); b.fr = botFrames(b.col); st.ents.push(b); });
  st.ents.forEach(function (e) { spawn(e); e.inv = 0; });
  root.innerHTML = ''; cv = el('canvas', 'arv'); root.appendChild(cv); g2 = cv.getContext('2d');
  low = document.createElement('canvas'); lg = low.getContext('2d');
  st.ui = el('div'); st.ui.style.cssText = 'position:absolute;inset:0;pointer-events:none'; root.appendChild(st.ui);
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0) touchUI();
  resize(); window.addEventListener('resize', resize);
  document.addEventListener('keydown', onKey, true); document.addEventListener('keyup', onKeyUp, true); document.addEventListener('mousemove', onMouse); document.addEventListener('pointerlockchange', onLock);
  cv.addEventListener('mousedown', function (e) { if (st && !st.paused && !st.q) { if (document.pointerLockElement !== cv) { lock(); return; } mouseDown = true; tryFire(); } });
  document.addEventListener('mouseup', function () { mouseDown = false; });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  lock(); feed('Match started: ' + st.ents.length + ' players. First to win with the golden control rod!', '#fde047');
  var last = performance.now();
  function loop(now) { if (!st || st.over) return; var dt = Math.min(0.05, (now - last) / 1000); last = now; if (!st.paused && !st.q) update(dt); render(); raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);
}
function mkEnt(name, col, diff) { return { name: name, col: col, diff: diff, D: diff ? DIFF[diff] : null, x: 2, y: 2, a: 0, pitch: 0, hp: 100, tier: 0, kills: 0, deaths: 0, alive: true, respawn: 0, cd: 0, lastHurt: -9, inv: 0, path: [], tgt: null, seenT: 0, strafe: 1, strafeT: 0, stuckT: 0, lx: 0, ly: 0, moving: false, shootAnim: 0, hurtAnim: 0, burstLeft: 0, burstT: 0, lastAtk: null }; }
function W_(e) { return WEAPONS[st.lad[e.tier]]; }
function isFinal(e) { return e.tier === st.lad.length - 1; }
function lock() { try { if (cv && cv.requestPointerLock) { var p = cv.requestPointerLock(); if (p && p.catch) p.catch(function () {}); } } catch (e) {} }
function onLock() { if (!st || st.over) return; if (document.pointerLockElement !== cv && !st.q && !st.paused && !st.result && !st.touch) pauseMenu(); }
function resize() {
  if (!cv) return; var w = root.clientWidth, h = root.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  RH = h > 700 ? 300 : 240; RW = Math.round(RH * w / Math.max(1, h)); RW = clamp(RW, 200, 640);
  low.width = RW; low.height = RH; img = lg.createImageData(RW, RH); buf = new Uint32Array(img.data.buffer); zbuf = new Float32Array(RW);
}
function onMouse(e) { if (!st || st.q || st.paused || document.pointerLockElement !== cv) return; if (Math.abs(e.movementX) > 250 || Math.abs(e.movementY) > 250) return; var s = 0.0009 + st.c.sens * 0.00045; st.me.a += e.movementX * s; st.me.pitch = clamp(st.me.pitch - e.movementY * s * 140, -RH * 0.35, RH * 0.35); }
function onKey(e) {
  if (!st) return; var k = e.key; e.stopPropagation();
  if (st.q) { if (/^[1-4]$/.test(k) && st.q.q.t !== 'N') { e.preventDefault(); answer(+k - 1); } else if ((k === 'Enter' || k === ' ') && st.q.done) { e.preventDefault(); endQ(); } return; }
  if (st.result) return;
  if (k === 'Escape') { if (st.paused) resume(); else pauseMenu(); e.preventDefault(); return; }
  if (k === 'Tab') { e.preventDefault(); st.board = true; return; }
  if (st.paused) return;
  keys[k.toLowerCase()] = true; if (k === ' ') { mouseDown = true; tryFire(); e.preventDefault(); }
  if (/^Arrow/.test(k)) e.preventDefault();
}
function onKeyUp(e) { if (!st) return; keys[e.key.toLowerCase()] = false; if (e.key === 'Tab') st.board = false; if (e.key === ' ') mouseDown = false; }

/* grid helpers */
function wall(x, y) { var ix = Math.floor(x), iy = Math.floor(y); if (ix < 0 || iy < 0 || ix >= st.gw || iy >= st.gh) return 1; return st.grid[iy][ix]; }
function free(x, y, r) { return !wall(x - r, y - r) && !wall(x + r, y - r) && !wall(x - r, y + r) && !wall(x + r, y + r); }
function move(e, dx, dy) { var r = 0.24; if (free(e.x + dx, e.y, r)) e.x += dx; if (free(e.x, e.y + dy, r)) e.y += dy; }
function los(ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy), n = Math.ceil(d * 6); for (var i = 1; i < n; i++) { if (wall(ax + dx * i / n, ay + dy * i / n)) return false; } return true; }
function rayWall(x, y, a, maxd) { var dx = Math.cos(a), dy = Math.sin(a), mx = Math.floor(x), my = Math.floor(y), ddx = Math.abs(1 / (dx || 1e-9)), ddy = Math.abs(1 / (dy || 1e-9)), sx, sy, sdx, sdy, d = 0;
  if (dx < 0) { sx = -1; sdx = (x - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - x) * ddx; } if (dy < 0) { sy = -1; sdy = (y - my) * ddy; } else { sy = 1; sdy = (my + 1 - y) * ddy; }
  for (var i = 0; i < 200; i++) { if (sdx < sdy) { d = sdx; sdx += ddx; mx += sx; } else { d = sdy; sdy += ddy; my += sy; } if (d > maxd) return maxd; if (mx < 0 || my < 0 || mx >= st.gw || my >= st.gh || st.grid[my][mx]) return d; } return maxd; }
function spawn(e) {
  var best = null, bd = -1;
  for (var t = 0; t < 40; t++) { var x = Math.floor(rnd(1, st.gw - 1)) + 0.5, y = Math.floor(rnd(1, st.gh - 1)) + 0.5; if (wall(x, y)) continue; var md = 99; st.ents.forEach(function (o) { if (o !== e && o.alive) md = Math.min(md, Math.hypot(o.x - x, o.y - y)); }); if (md > bd) { bd = md; best = [x, y]; } }
  if (!best) best = [1.5, 1.5]; e.x = best[0]; e.y = best[1]; e.a = rnd(0, Math.PI * 2); e.hp = 100; e.alive = true; e.inv = 1.6; e.path = []; e.tgt = null; e.pitch = 0;
}
function bfs(sx, sy, tx, ty) {
  var W = st.gw, H = st.gh, start = Math.floor(sy) * W + Math.floor(sx), goal = Math.floor(ty) * W + Math.floor(tx), prev = new Int32Array(W * H).fill(-2), q = [start]; prev[start] = -1;
  while (q.length) { var c = q.shift(); if (c === goal) break; var cx = c % W, cy = (c / W) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = cx + d[0], ny = cy + d[1]; if (nx < 0 || ny < 0 || nx >= W || ny >= H || st.grid[ny][nx]) return; var n = ny * W + nx; if (prev[n] !== -2) return; prev[n] = c; q.push(n); }); }
  if (prev[goal] === -2) return []; var p = [], c2 = goal; while (c2 !== -1 && c2 !== start) { p.push([(c2 % W) + 0.5, ((c2 / W) | 0) + 0.5]); c2 = prev[c2]; } return p.reverse();
}
function randFloor() { for (var t = 0; t < 60; t++) { var x = Math.floor(rnd(1, st.gw - 1)), y = Math.floor(rnd(1, st.gh - 1)); if (!st.grid[y][x]) return [x + 0.5, y + 0.5]; } return [1.5, 1.5]; }

/* ---------------- update ---------------- */
function update(dt) {
  st.t += dt; var me = st.me;
  st.ents.forEach(function (e) { if (e.inv > 0) e.inv -= dt; e.cd -= dt; e.shootAnim = Math.max(0, e.shootAnim - dt); e.hurtAnim = Math.max(0, e.hurtAnim - dt); if (e.alive && st.t - e.lastHurt > 4 && e.hp < 100) e.hp = Math.min(100, e.hp + 18 * dt); if (!e.alive) { e.respawn -= dt; if (e.respawn <= 0) spawn(e); } });
  if (me.alive) {
    var fw = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0), sw = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), turn = (keys.arrowright ? 1 : 0) - (keys.arrowleft ? 1 : 0);
    if (st.touchMove) { fw = -st.touchMove[1]; sw = st.touchMove[0]; }
    me.a += turn * 2.6 * dt; var sp = 3.1, ca = Math.cos(me.a), sa = Math.sin(me.a), l = Math.hypot(fw, sw) || 1; if (Math.abs(fw) + Math.abs(sw) > 0.05) { move(me, (ca * fw - sa * sw) / Math.max(1, l) * sp * dt, (sa * fw + ca * sw) / Math.max(1, l) * sp * dt); st.bob += dt * 9; me.moving = true; } else me.moving = false;
    if (mouseDown && W_(me).auto) tryFire();
    if (st.burstLeft > 0) { st.burstT -= dt; if (st.burstT <= 0) { st.burstLeft--; st.burstT = 0.07; fireOnce(me, true); } }
  }
  st.recoil = Math.max(0, st.recoil - dt * 6); st.flash = Math.max(0, st.flash - dt); st.hitT = Math.max(0, st.hitT - dt); st.dmgT = Math.max(0, st.dmgT - dt);
  st.ents.forEach(function (e) { if (!e.me && e.alive) bot(e, dt); });
  for (var i = st.proj.length - 1; i >= 0; i--) { var p = st.proj[i]; p.x += Math.cos(p.a) * 9 * dt; p.y += Math.sin(p.a) * 9 * dt; p.life -= dt; var hit = wall(p.x, p.y) || p.life <= 0; if (!hit) st.ents.forEach(function (o) { if (o !== p.own && o.alive && Math.hypot(o.x - p.x, o.y - p.y) < 0.42) hit = true; }); if (hit) { explode(p); st.proj.splice(i, 1); } }
  st.feed = st.feed.filter(function (f) { return st.t - f.t < 6; });
}
function bot(e, dt) {
  var D = e.D, w = W_(e), best = null, bd = 1e9;
  st.ents.forEach(function (o) { if (o === e || !o.alive) return; var d = Math.hypot(o.x - e.x, o.y - e.y); if (d > D.vis) return; var ang = Math.abs(angDiff(e.a, Math.atan2(o.y - e.y, o.x - e.x))); var aware = ang < 1.1 || (e.lastAtk === o && st.t - e.lastHurt < 2.5) || d < 2.2; if (!aware || !los(e.x, e.y, o.x, o.y)) return; var sc = d - (o.me ? 0.5 : 0); if (sc < bd) { bd = sc; best = o; } });
  if (best) {
    if (e.tgt !== best) { e.tgt = best; e.seenT = st.t; }
    var ta = Math.atan2(best.y - e.y, best.x - e.x), da = angDiff(e.a, ta); e.a += clamp(da, -D.turn * dt, D.turn * dt);
    var d = Math.hypot(best.x - e.x, best.y - e.y), want = w.melee ? 0.9 : w.kind === 'shotgun' ? 3 : w.kind === 'sniper' ? 10 : w.kind === 'rocket' ? 7 : 5.5;
    e.strafeT -= dt; if (e.strafeT <= 0) { e.strafe = Math.random() < 0.5 ? -1 : 1; e.strafeT = rnd(0.5, 1.4); }
    var fwd = d > want + 1 ? 1 : d < want - 1.5 ? -0.7 : 0, side = w.melee ? 0.25 * e.strafe : e.strafe, ca = Math.cos(e.a), sa = Math.sin(e.a), sp = D.spd * (w.melee ? 1.25 : 1);
    var ox = e.x, oy = e.y; move(e, (ca * fwd - sa * side) * sp * dt * 0.8, (sa * fwd + ca * side) * sp * dt * 0.8); e.moving = Math.hypot(e.x - ox, e.y - oy) > 0.001; if (!e.moving) e.strafe = -e.strafe;
    if (st.t - e.seenT > D.react && Math.abs(da) < 0.3 && e.cd <= 0) botFire(e, best, d);
    if (e.burstLeft > 0) { e.burstT -= dt; if (e.burstT <= 0) { e.burstLeft--; e.burstT = 0.08; botShot(e, best, d); } }
    e.lastSeen = [best.x, best.y];
  } else {
    e.tgt = null;
    if (!e.path.length) { var t = e.lastSeen && Math.random() < 0.6 ? e.lastSeen : randFloor(); e.lastSeen = null; e.path = bfs(e.x, e.y, t[0], t[1]); if (!e.path.length) e.path = bfs(e.x, e.y, randFloor()[0], randFloor()[1]); }
    var n = e.path[0]; if (n) { var ang = Math.atan2(n[1] - e.y, n[0] - e.x); e.a += clamp(angDiff(e.a, ang), -D.turn * dt, D.turn * dt); var ox2 = e.x, oy2 = e.y; move(e, Math.cos(ang) * D.spd * dt, Math.sin(ang) * D.spd * dt); e.moving = true; if (Math.hypot(n[0] - e.x, n[1] - e.y) < 0.25) e.path.shift(); if (Math.hypot(e.x - ox2, e.y - oy2) < 0.0005) { e.stuckT += dt; if (e.stuckT > 0.6) { e.path = []; e.stuckT = 0; } } else e.stuckT = 0; }
  }
}
function botFire(e, t, d) {
  var w = W_(e); e.cd = w.rate * e.D.fire; e.shootAnim = 0.12;
  var vol = clamp(1.4 - Math.hypot(e.x - st.me.x, e.y - st.me.y) / 12, 0.08, 0.8);
  if (w.melee) { if (d <= w.melee) { shot('rod', vol); damage(t, w.dmg, e); } return; }
  shot(w.kind, vol);
  if (w.proj) { st.proj.push({ x: e.x + Math.cos(e.a) * 0.4, y: e.y + Math.sin(e.a) * 0.4, a: e.a + rnd(-0.12, 0.12) * (1 - e.D.acc), own: e, life: 4, w: w }); return; }
  if (w.burst) { e.burstLeft = w.burst - 1; e.burstT = 0.08; }
  botShot(e, t, d);
}
function botShot(e, t, d) {
  var w = W_(e); if (!t.alive) return; var pel = w.pel || 1, mv = t.moving ? 0.82 : 1, df = clamp(1.15 - d / w.rng, 0.12, 1), p = clamp(e.D.acc * w.bacc * df * mv * (t.me ? 1 : 1.1) + (d < 3 ? 0.12 : 0), 0.02, 0.92), dmg = 0;
  for (var i = 0; i < pel; i++) if (Math.random() < p) dmg += w.dmg;
  if (dmg) damage(t, dmg, e);
}
function tryFire() { var me = st.me; if (!me.alive || me.cd > 0 || st.burstLeft > 0) return; var w = W_(me); me.cd = w.rate; if (w.burst) { st.burstLeft = w.burst - 1; st.burstT = 0.07; } fireOnce(me, false); }
function fireOnce(me, inBurst) {
  var w = W_(me); st.recoil = Math.min(1, st.recoil + (w.kind === 'sniper' || w.kind === 'rocket' ? 1 : w.kind === 'shotgun' || w.kind === 'revolver' ? 0.8 : 0.35)); st.flash = 0.06; shot(w.kind, 0.9); st.shots++;
  if (w.melee) { var hitAny = false; st.ents.forEach(function (o) { if (o.me || !o.alive) return; var d = Math.hypot(o.x - me.x, o.y - me.y), ang = Math.abs(angDiff(me.a, Math.atan2(o.y - me.y, o.x - me.x))); if (d < w.melee && ang < 0.55 && !hitAny) { hitAny = true; st.hits++; st.hitT = 0.15; damage(o, w.dmg, me); } }); return; }
  if (w.proj) { st.proj.push({ x: me.x + Math.cos(me.a) * 0.4, y: me.y + Math.sin(me.a) * 0.4, a: me.a, own: me, life: 4, w: w }); return; }
  var pel = w.pel || 1, hitOnce = false;
  for (var i = 0; i < pel; i++) {
    var a = me.a + rnd(-w.spr, w.spr) * (me.moving ? 1.4 : 1), wd = rayWall(me.x, me.y, a, w.rng), ca = Math.cos(a), sa = Math.sin(a), best = null, bt = wd;
    st.ents.forEach(function (o) { if (o.me || !o.alive) return; var rx = o.x - me.x, ry = o.y - me.y, t = rx * ca + ry * sa; if (t <= 0 || t > bt) return; var px = rx - ca * t, py = ry - sa * t; if (px * px + py * py < 0.33 * 0.33) { bt = t; best = o; } });
    if (best) { var fall = w.kind === 'shotgun' ? clamp(1.3 - bt / 7, 0.3, 1) : 1; damage(best, w.dmg * fall, me); hitOnce = true; }
  }
  if (hitOnce) { st.hits++; st.hitT = 0.15; shot('hit', 0.5); }
}
function explode(p) {
  var vol = clamp(1.4 - Math.hypot(p.x - st.me.x, p.y - st.me.y) / 12, 0.1, 1); shot('boom', vol); st.booms = st.booms || []; st.booms.push({ x: p.x, y: p.y, t: st.t });
  st.ents.forEach(function (o) { if (!o.alive) return; var d = Math.hypot(o.x - p.x, o.y - p.y); if (d < p.w.splash && los(p.x - Math.cos(p.a) * 0.1, p.y - Math.sin(p.a) * 0.1, o.x, o.y)) { var dm = p.w.dmg * (1 - d / p.w.splash * 0.6) * (o === p.own ? 0.4 : 1); damage(o, dm, p.own); if (p.own.me && o !== p.own) { st.hitT = 0.15; } } });
}
function damage(v, amt, by) {
  if (!v.alive || v.inv > 0 || !st || st.result) return; v.hp -= amt; v.lastHurt = st.t; v.lastAtk = by; v.hurtAnim = 0.12;
  if (v.me) { st.dmgT = 0.35; st.dmgFrom = Math.atan2(by.y - v.y, by.x - v.x); }
  if (v.hp <= 0) kill(v, by);
}
function kill(v, by) {
  v.alive = false; v.hp = 0; v.deaths++; v.respawn = 3; if (v.me) { st.deaths++; st.killer = by; } if (by === v) { feed(v.name + ' blew themselves up', '#9aa6bb'); return; }
  by.kills++; if (by.me) st.kills++; var w = W_(by), fin = isFinal(by);
  feed(by.name + ' [' + w.n + '] ' + v.name, by.me ? '#fde047' : v.me ? '#f87171' : '#cbd5e1');
  if (fin) { finish(by); return; }
  if (by.me) { beep(660, 990, 0.12, 'triangle'); setTimeout(function () { if (st && !st.result) askQ(); }, 350); }
  else { if (Math.random() < by.D.ans) { by.tier++; feed(by.name + ' answered right: now on ' + W_(by).n, '#93a3bd'); } else feed(by.name + ' got their question wrong', '#64748b'); }
}
function feed(t, col) { st.feed.unshift({ t: st.t, s: t, c: col }); if (st.feed.length > 6) st.feed.length = 6; }

/* ---------------- questions ---------------- */
function nextQ() {
  if (!st.qs.length) return null; if (st.qi >= st.qs.length) { st.qs = shuffle(st.qs); st.qi = 0; }
  var q = st.qs[st.qi++]; return q;
}
function askQ() {
  if (st.q) { st.qQueue = (st.qQueue || 0) + 1; return; }
  var q = nextQ(); if (!q) { st.me.tier = Math.min(st.lad.length - 1, st.me.tier + 1); return; }
  mouseDown = false; keys = {}; try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  var num = q.t === 'N', order = num ? [] : shuffle(q.o.map(function (_, i) { return i; }));
  st.q = { q: q, order: order, t0: performance.now(), done: false, lim: 30000 };
  var box = el('div', 'arq'); box.innerHTML = '<div class="arqbox" role="dialog" aria-label="Question"><div class="arqtop"><span>Kill! Answer to upgrade</span><span data-k="sec">30</span></div><div class="artime"><i data-k="bar"></i></div><div class="arqs">' + esc(q.src) + '</div><div class="arqp">' + q.p + '</div>' + (num ? '<form class="arnum" data-k="nf"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" placeholder="Type your answer">' + (q.u ? '<span>' + q.u + '</span>' : '') + '<button type="submit" class="arbtn" style="background:#fb923c;color:#111;border:0">Check</button></form>' : '<div class="aropts">' + order.map(function (oi, i) { return '<button type="button" class="aropt" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span>' + q.o[oi] + '</span></button>'; }).join('') + '</div>') + '<div data-k="fb"></div></div>';
  root.appendChild(box); st.q.el = box; st.ask = st.asked;
  if (num) { var nf = box.querySelector('[data-k=nf]'), inp = nf.querySelector('input'); setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60); nf.addEventListener('submit', function (e) { e.preventDefault(); if (!st.q.done && inp.value.trim()) answer(inp.value); }); inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); if (st.q.done) endQ(); else if (inp.value.trim()) answer(inp.value); } }); }
  box.addEventListener('click', function (e) { var b = e.target.closest('.aropt'); if (b && !st.q.done) answer(+b.dataset.i); var c = e.target.closest('[data-a=cont]'); if (c) endQ(); });
  var tick = function () { if (!st || !st.q || st.q.done) return; var left = st.q.lim - (performance.now() - st.q.t0); var s = box.querySelector('[data-k=sec]'), b = box.querySelector('[data-k=bar]'); if (s) s.textContent = Math.max(0, Math.ceil(left / 1000)); if (b) b.style.transform = 'scaleX(' + clamp(left / st.q.lim, 0, 1) + ')'; if (left <= 0) { answer(-1); return; } if (left < 5000 && Math.ceil(left / 1000) !== st.q.lastS) { st.q.lastS = Math.ceil(left / 1000); beep(880, 880, 0.05, 'sine'); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function answer(i) {
  var Q = st.q; if (!Q || Q.done) return; Q.done = true; var q = Q.q, ok; if (q.t === 'N') { var v = typeof i === 'string' ? parseNum(i) : NaN, tol = q.tol == null ? 0.02 : q.tol; ok = isFinite(v) && (q.a === 0 ? Math.abs(v) <= (tol || 1e-9) : Math.abs(v - q.a) <= Math.abs(q.a) * tol + 1e-12); i = typeof i === 'string' ? 0 : -1; var ip = Q.el.querySelector('[data-k=nf] input'); if (ip) { ip.disabled = true; ip.style.borderColor = ok ? '#22c55e' : '#ef4444'; } } else ok = i >= 0 && Q.order[i] === q.a; st.asked++;
  var bs = Q.el.querySelectorAll('.aropt'); [].forEach.call(bs, function (b, j) { b.disabled = true; if (Q.order[j] === q.a) b.classList.add('ok'); else if (j === i) b.classList.add('no'); });
  API.result(q.k, ok);
  var fb = Q.el.querySelector('[data-k=fb]'), me = st.me;
  if (ok) {
    st.right++; st.xp += 4; me.tier = Math.min(st.lad.length - 1, me.tier + 1); API.sfx('right');
    fb.innerHTML = '<div class="arfb ok"><b>✓ Correct! Weapon upgraded</b>Now on the <b style="display:inline;color:' + W_(me).col + '">' + W_(me).n + '</b> (' + (me.tier + 1) + '/' + st.lad.length + ')' + (isFinal(me) ? '. One kill with it wins the match!' : '') + '</div>';
    setTimeout(function () { if (st && st.q === Q) endQ(); }, 1100);
  } else {
    API.sfx('wrong'); st.missed.push(q);
    fb.innerHTML = '<div class="arfb no"><b>' + (i < 0 ? '⏱ Out of time' : '✗ Not quite') + '</b>The answer is: ' + ansText(q) + (q.e ? '<div style="margin-top:6px;font-weight:500;color:#cbd5e1">' + q.e + '</div>' : '') + '<div style="margin-top:6px;font-weight:700;color:#fca5a5">You keep the ' + W_(me).n + '.</div></div><div class="arrow" style="justify-content:flex-end"><button type="button" class="arbtn" data-a="cont" style="background:#fb923c;color:#111;border:0">Back to the fight ▶</button></div>';
    try { Q.el.querySelector('[data-a=cont]').focus(); } catch (e) {}
  }
}
function ansText(q) { return q.t === 'N' ? String(q.a) + (q.u ? ' ' + q.u : '') : q.o[q.a]; }
function parseNum(t) { t = String(t).trim().replace(/,/g, '').replace(/[−–]/g, '-').replace(/×\s*10\^?/g, 'e').replace(/\s+/g, ''); var m = /^(-?[\d.]+)\/(-?[\d.]+)$/.exec(t); if (m) return parseFloat(m[1]) / parseFloat(m[2]); var u = t.replace(/[^0-9eE.+\-]/g, ''); return u ? parseFloat(u) : NaN; }
function endQ() { if (!st || !st.q) return; st.q.el.remove(); st.q = null; if (st.qQueue > 0) { st.qQueue--; setTimeout(function () { if (st && !st.result) askQ(); }, 250); return; } lock(); }

/* ---------------- menus ---------------- */
function pauseMenu() {
  if (!st || st.paused || st.result) return; st.paused = true; mouseDown = false; keys = {};
  var m = el('div', 'armenu'); m.innerHTML = '<div class="arqbox"><h2>Paused</h2><p class="arsmall">You: ' + W_(st.me).n + ' (' + (st.me.tier + 1) + '/' + st.lad.length + ') · ' + st.right + '/' + st.asked + ' questions right</p><div class="arrow" style="justify-content:center"><button type="button" class="arbtn go" data-a="r">▶ Resume</button><button type="button" class="arbtn" data-a="s">Change setup</button><button type="button" class="arbtn" data-a="q">Quit</button></div><p class="arsmall">Click Resume to lock the mouse again.</p></div>';
  root.appendChild(m); st.menu = m;
  m.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.a === 'r') resume(); else if (b.dataset.a === 's') { results(null, true); setup(); } else if (b.dataset.a === 'q') { results(null, true); close(); } });
}
function resume() { if (!st || !st.paused) return; st.paused = false; if (st.menu) st.menu.remove(); st.menu = null; lock(); }
function finish(winner) {
  var me = st.me, won = winner === me;
  if (won) { st.xp += 30; } else { var place = 1 + st.ents.filter(function (e) { return e !== me && (e.tier > me.tier || (e.tier === me.tier && e.kills > me.kills)); }).length; if (place <= 3) st.xp += 10; }
  results(winner, false);
}
function results(winner, quiet) {
  if (!st) return; var me = st.me, won = winner === me; st.result = true; mouseDown = false; try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  pendingXP += st.xp;
  var rec = rd(); rec.rec = rec.rec || {}; rec.rec.played = (rec.rec.played || 0) + (quiet ? 0 : 1);
  if (won) { rec.rec.wins = (rec.rec.wins || 0) + 1; if (st.c.bots.every(function (b) { return b === 'insane'; })) rec.rec.best = (rec.rec.best || 0) + 1; }
  wr(Object.assign(rd(), { rec: rec.rec }));
  var crate = null; if (won && !quiet) { var ins = st.c.bots.filter(function (b) { return b === 'insane' || b === 'hard'; }).length; crate = API.crate(ins >= st.c.bots.length && st.c.bots.length >= 3 ? 'E' : 'R'); }
  if (quiet) return;
  var order = st.ents.slice().sort(function (a, b) { return (b === winner) - (a === winner) || b.tier - a.tier || b.kills - a.kills; });
  var mins = Math.max(1, Math.round((performance.now() - st.startT) / 60000));
  var r = el('div', 'arres'); r.innerHTML = '<div class="arwrap"><p class="arbig' + (won ? ' win' : '') + '">' + (won ? 'VICTORY!' : esc(winner.name) + ' wins') + '</p><p style="color:#9aa6bb;margin:0">' + (won ? 'You won with the golden control rod.' : 'They got the last kill with the golden control rod. You reached the ' + esc(W_(me).n) + '.') + '</p>' +
    '<div class="arstats"><div><b>' + st.right + '/' + st.asked + '</b><span>questions right</span></div><div><b>' + st.kills + '</b><span>kills</span></div><div><b>' + st.deaths + '</b><span>deaths</span></div><div><b>' + (st.shots ? Math.round(st.hits / st.shots * 100) : 0) + '%</b><span>shots on target</span></div><div><b>+' + st.xp + '</b><span>XP (added when you leave)</span></div><div><b>' + mins + ' min</b><span>match length</span></div></div>' +
    (crate ? '<p style="margin:0;font-weight:800;color:#fde047">🎁 You earned a ' + (crate === 'E' ? 'Epic' : 'Rare') + ' crate. Open it in Rewards.</p>' : '') +
    '<section class="arcard"><h2>Scoreboard</h2><table class="artable"><thead><tr><th>#</th><th>Player</th><th>Weapon</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>' + order.map(function (e, i) { return '<tr class="' + (e.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + e.col + ';margin-right:6px"></span>' + esc(e.name) + (e.D ? ' <small style="color:' + e.D.col + '">' + e.D.n + '</small>' : '') + '</td><td>' + esc(W_(e).n) + ' (' + (e.tier + 1) + ')</td><td>' + e.kills + '</td><td>' + e.deaths + '</td></tr>'; }).join('') + '</tbody></table></section>' +
    (st.missed.length ? '<section class="arcard"><h2>Questions to look at again</h2><div class="armiss">' + st.missed.slice(0, 12).map(function (q) { return '<div>' + q.p + '<em>✓ ' + ansText(q) + '</em></div>'; }).join('') + '</div><p class="arsmall" style="margin:8px 0 0">These have gone into Fix my mistakes, and Memory refresh will bring them back.</p></section>' : '<section class="arcard"><h2>Questions</h2><p style="margin:0">' + (st.asked ? 'Every question right. Brilliant!' : 'No questions this time. Get some kills!') + '</p></section>') +
    '<div class="arrow"><button type="button" class="arbtn go" data-a="again">▶ Play again</button><button type="button" class="arbtn" data-a="setup">Change setup</button><button type="button" class="arbtn" data-a="exit">Exit</button></div></div>';
  root.appendChild(r);
  r.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var c = st.c; if (b.dataset.a === 'again') start(c); else if (b.dataset.a === 'setup') setup(); else close(); });
  try { r.querySelector('[data-a=again]').focus(); } catch (e) {}
  beep(won ? 523 : 330, won ? 1046 : 220, 0.5, 'triangle');
}

/* ---------------- touch ---------------- */
function touchUI() {
  st.touch = true; var t = el('div', 'artouch', '<div class="look"></div><div class="stick"><i></i></div><button type="button" class="fire">FIRE</button>'); st.ui.appendChild(t);
  var stick = t.querySelector('.stick'), knob = stick.querySelector('i'), sid = null, cx = 0, cy = 0;
  stick.addEventListener('touchstart', function (e) { var p = e.changedTouches[0]; sid = p.identifier; var r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.preventDefault(); }, { passive: false });
  stick.addEventListener('touchmove', function (e) { [].forEach.call(e.changedTouches, function (p) { if (p.identifier !== sid) return; var dx = clamp((p.clientX - cx) / 50, -1, 1), dy = clamp((p.clientY - cy) / 50, -1, 1); st.touchMove = [dx, dy]; knob.style.transform = 'translate(' + dx * 40 + 'px,' + dy * 40 + 'px)'; }); e.preventDefault(); }, { passive: false });
  var endS = function () { sid = null; st && (st.touchMove = null); knob.style.transform = ''; }; stick.addEventListener('touchend', endS); stick.addEventListener('touchcancel', endS);
  var look = t.querySelector('.look'), lid = null, lx = 0, ly = 0;
  look.addEventListener('touchstart', function (e) { var p = e.changedTouches[0]; lid = p.identifier; lx = p.clientX; ly = p.clientY; e.preventDefault(); }, { passive: false });
  look.addEventListener('touchmove', function (e) { [].forEach.call(e.changedTouches, function (p) { if (p.identifier !== lid || !st || st.q) return; st.me.a += (p.clientX - lx) * 0.006; st.me.pitch = clamp(st.me.pitch - (p.clientY - ly) * 0.6, -RH * 0.35, RH * 0.35); lx = p.clientX; ly = p.clientY; }); e.preventDefault(); }, { passive: false });
  var fire = t.querySelector('.fire'); fire.addEventListener('touchstart', function (e) { mouseDown = true; tryFire(); e.preventDefault(); }, { passive: false }); fire.addEventListener('touchend', function () { mouseDown = false; });
}

/* ---------------- render ---------------- */
function rgb(r, g, b) { return (255 << 24) | (b << 16) | (g << 8) | r; }
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function render() {
  if (!st || !img) return; var me = st.me, M = st.M, horizon = (RH >> 1) + Math.round(me.pitch) + Math.round(Math.sin(st.bob) * (me.moving ? 2 : 0)), fog = M.fog;
  var s0 = hex(M.sky[0]), s1 = hex(M.sky[1]), f0 = hex(M.floor[0]), f1 = hex(M.floor[1]);
  for (var y = 0; y < RH; y++) { var c; if (y < horizon) { var t = clamp(y / Math.max(1, horizon), 0, 1); c = rgb(s0[0] + (s1[0] - s0[0]) * t | 0, s0[1] + (s1[1] - s0[1]) * t | 0, s0[2] + (s1[2] - s0[2]) * t | 0); } else { var u = clamp((y - horizon) / Math.max(1, RH - horizon), 0, 1); c = rgb(f1[0] + (f0[0] - f1[0]) * u | 0, f1[1] + (f0[1] - f1[1]) * u | 0, f1[2] + (f0[2] - f1[2]) * u | 0); } buf.fill(c, y * RW, y * RW + RW); }
  var dx = Math.cos(me.a), dy = Math.sin(me.a), px = -dy * 0.7, py = dx * 0.7;
  for (var x = 0; x < RW; x++) {
    var cam = 2 * x / RW - 1, rx = dx + px * cam, ry = dy + py * cam, mx = Math.floor(me.x), my = Math.floor(me.y), ddx = Math.abs(1 / (rx || 1e-9)), ddy = Math.abs(1 / (ry || 1e-9)), sx, sy, sdx, sdy, side = 0, hitT = 0;
    if (rx < 0) { sx = -1; sdx = (me.x - mx) * ddx; } else { sx = 1; sdx = (mx + 1 - me.x) * ddx; } if (ry < 0) { sy = -1; sdy = (me.y - my) * ddy; } else { sy = 1; sdy = (my + 1 - me.y) * ddy; }
    for (var i = 0; i < 128; i++) { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; } if (mx < 0 || my < 0 || mx >= st.gw || my >= st.gh) { hitT = 1; break; } if (st.grid[my][mx]) { hitT = st.grid[my][mx]; break; } }
    var pd = side === 0 ? sdx - ddx : sdy - ddy; if (pd < 0.05) pd = 0.05; zbuf[x] = pd;
    var lh = (RH / pd) | 0, ds = horizon - (lh >> 1), de = horizon + (lh >> 1), wx = side === 0 ? me.y + pd * ry : me.x + pd * rx; wx -= Math.floor(wx);
    var tx = (wx * TS) | 0; if ((side === 0 && rx > 0) || (side === 1 && ry < 0)) tx = TS - tx - 1;
    var T = TEX[hitT] || TEX[1], shade = side ? 0.72 : 1, fg = clamp(pd / 16, 0, 0.85), glow = hitT === 4;
    var y0 = Math.max(0, ds), y1 = Math.min(RH - 1, de), step = TS / Math.max(1, lh), tpos = (y0 - ds) * step;
    for (var yy = y0; yy <= y1; yy++) { var ty = (tpos | 0) & (TS - 1); tpos += step; var ti = (ty * TS + tx) * 4, k = glow ? 1 : shade * (1 - fg), kf = glow ? 0 : fg;
      buf[yy * RW + x] = rgb(T[ti] * k + fog[0] * kf | 0, T[ti + 1] * k + fog[1] * kf | 0, T[ti + 2] * k + fog[2] * kf | 0); }
  }
  /* sprites: bots, rockets, explosions */
  var spr = [], inv = 1 / (px * dy - dx * py);
  st.ents.forEach(function (e) { if (e.me || !e.alive) return; spr.push({ x: e.x, y: e.y, e: e }); });
  st.proj.forEach(function (p) { spr.push({ x: p.x, y: p.y, p: p }); });
  (st.booms || []).forEach(function (b) { if (st.t - b.t < 0.4) spr.push({ x: b.x, y: b.y, b: b }); }); if (st.booms) st.booms = st.booms.filter(function (b) { return st.t - b.t < 0.4; });
  spr.forEach(function (s) { s.d = (s.x - me.x) * (s.x - me.x) + (s.y - me.y) * (s.y - me.y); }); spr.sort(function (a, b) { return b.d - a.d; });
  st.tags = [];
  spr.forEach(function (s) {
    var sx0 = s.x - me.x, sy0 = s.y - me.y, tX = inv * (dy * sx0 - dx * sy0), tY = inv * (-py * sx0 + px * sy0); if (tY <= 0.1) return;
    var scx = ((RW / 2) * (1 + tX / tY)) | 0;
    if (s.e) {
      var e = s.e, fr = e.fr[e.hurtAnim > 0 ? 3 : e.shootAnim > 0 ? 2 : e.moving ? ((st.t * 6) | 0) % 2 : 0], h = (RH / tY * 0.95) | 0, w = (h * fr.w / fr.h) | 0, top = horizon + ((RH / tY) * 0.5 | 0) - h, left = scx - (w >> 1);
      var fogk = clamp(tY / 16, 0, 0.85);
      for (var stx = Math.max(0, left); stx < Math.min(RW, left + w); stx++) { if (tY >= zbuf[stx]) continue; var tx2 = ((stx - left) * fr.w / w) | 0;
        for (var sty = Math.max(0, top); sty < Math.min(RH, top + h); sty++) { var ty2 = ((sty - top) * fr.h / h) | 0, ii = (ty2 * fr.w + tx2) * 4; if (fr.d[ii + 3] < 128) continue; buf[sty * RW + stx] = rgb(fr.d[ii] * (1 - fogk) + st.M.fog[0] * fogk | 0, fr.d[ii + 1] * (1 - fogk) + st.M.fog[1] * fogk | 0, fr.d[ii + 2] * (1 - fogk) + st.M.fog[2] * fogk | 0); } }
      if (scx > 0 && scx < RW && tY < zbuf[clamp(scx, 0, RW - 1)] && tY < 14) st.tags.push({ x: scx, y: top, e: e, d: tY });
    } else {
      var sz = s.b ? ((RH / tY) * (0.6 + (st.t - s.b.t) * 2.2)) | 0 : ((RH / tY) * 0.18) | 0, cy = horizon + ((RH / tY) * 0.1 | 0), col = s.b ? [255, 170 - ((st.t - s.b.t) * 300 | 0), 40] : [255, 120, 60];
      for (var bx = Math.max(0, scx - sz); bx < Math.min(RW, scx + sz); bx++) { if (tY >= zbuf[bx]) continue; for (var by = Math.max(0, cy - sz); by < Math.min(RH, cy + sz); by++) { var rr = ((bx - scx) * (bx - scx) + (by - cy) * (by - cy)) / (sz * sz); if (rr > 1) continue; buf[by * RW + bx] = rgb(col[0], clamp(col[1] + (1 - rr) * 80, 0, 255) | 0, clamp(col[2] + (1 - rr) * 120, 0, 255) | 0); } }
    }
  });
  lg.putImageData(img, 0, 0);
  var CW = cv.width, CH = cv.height, sc = CW / RW; g2.imageSmoothingEnabled = false; g2.drawImage(low, 0, 0, CW, CH);
  hud(CW, CH, sc, horizon);
}
function hud(CW, CH, sc, horizon) {
  var g = g2, me = st.me, w = W_(me), u = CH / 100, dpr = cv.width / Math.max(1, root.clientWidth);
  g.save(); g.textBaseline = 'middle';
  /* name tags over bots */
  st.tags.forEach(function (t) { var X = t.x * sc, Y = t.y * sc - 14 * dpr, e = t.e, wd = 60 * dpr; g.globalAlpha = clamp(1.4 - t.d / 12, 0.35, 1); g.font = '700 ' + (11 * dpr) + 'px system-ui'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(X - wd / 2, Y - 16 * dpr, wd, 22 * dpr); g.fillStyle = e.col; g.fillText(e.name + ' · ' + (e.tier + 1), X, Y - 9 * dpr); g.fillStyle = '#333'; g.fillRect(X - wd / 2 + 4 * dpr, Y + 1 * dpr, wd - 8 * dpr, 3 * dpr); g.fillStyle = e.hp > 50 ? '#22c55e' : e.hp > 25 ? '#eab308' : '#ef4444'; g.fillRect(X - wd / 2 + 4 * dpr, Y + 1 * dpr, (wd - 8 * dpr) * clamp(e.hp / 100, 0, 1), 3 * dpr); g.globalAlpha = 1; });
  /* weapon view model */
  if (me.alive) drawGun(g, CW, CH, w, dpr);
  /* crosshair */
  var cx = CW / 2, cy = horizon * sc, gap = (6 + st.recoil * 10 + (me.moving ? 4 : 0)) * dpr, ln = 8 * dpr; g.strokeStyle = '#fff'; g.lineWidth = 2 * dpr; g.globalAlpha = 0.9;
  if (w.melee) { g.beginPath(); g.arc(cx, cy, 10 * dpr, 0, 6.283); g.stroke(); } else { g.beginPath(); g.moveTo(cx - gap - ln, cy); g.lineTo(cx - gap, cy); g.moveTo(cx + gap, cy); g.lineTo(cx + gap + ln, cy); g.moveTo(cx, cy - gap - ln); g.lineTo(cx, cy - gap); g.moveTo(cx, cy + gap); g.lineTo(cx, cy + gap + ln); g.stroke(); }
  if (st.hitT > 0) { g.strokeStyle = '#ff4d4d'; g.beginPath(); var h = 9 * dpr; g.moveTo(cx - h, cy - h); g.lineTo(cx - h / 2, cy - h / 2); g.moveTo(cx + h, cy - h); g.lineTo(cx + h / 2, cy - h / 2); g.moveTo(cx - h, cy + h); g.lineTo(cx - h / 2, cy + h / 2); g.moveTo(cx + h, cy + h); g.lineTo(cx + h / 2, cy + h / 2); g.stroke(); }
  g.globalAlpha = 1;
  /* damage vignette */
  if (st.dmgT > 0 || me.hp < 35) { var a = Math.max(st.dmgT * 1.4, me.alive && me.hp < 35 ? (35 - me.hp) / 70 : 0); var gr = g.createRadialGradient(cx, CH / 2, CH * 0.25, cx, CH / 2, CH * 0.8); gr.addColorStop(0, 'rgba(200,0,0,0)'); gr.addColorStop(1, 'rgba(200,0,0,' + clamp(a, 0, 0.6) + ')'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH); }
  /* health + weapon */
  var pad = 16 * dpr; g.fillStyle = 'rgba(5,8,13,.7)'; rr(g, pad, CH - pad - 58 * dpr, 230 * dpr, 58 * dpr, 12 * dpr); g.fill();
  g.font = '900 ' + (26 * dpr) + 'px ui-monospace,monospace'; g.textAlign = 'left'; g.fillStyle = me.hp > 50 ? '#e8edf7' : me.hp > 25 ? '#fde047' : '#f87171'; g.fillText('✚ ' + Math.max(0, Math.ceil(me.hp)), pad + 12 * dpr, CH - pad - 38 * dpr);
  g.fillStyle = '#1f2937'; g.fillRect(pad + 12 * dpr, CH - pad - 18 * dpr, 206 * dpr, 7 * dpr); g.fillStyle = me.hp > 50 ? '#22c55e' : me.hp > 25 ? '#eab308' : '#ef4444'; g.fillRect(pad + 12 * dpr, CH - pad - 18 * dpr, 206 * dpr * clamp(me.hp / 100, 0, 1), 7 * dpr);
  /* ladder */
  var n = st.lad.length, lw = Math.min(CW * 0.5, 420 * dpr), lx = CW / 2 - lw / 2, ly = 14 * dpr, cw = lw / n;
  g.fillStyle = 'rgba(5,8,13,.7)'; rr(g, lx - 8 * dpr, ly - 6 * dpr, lw + 16 * dpr, 50 * dpr, 12 * dpr); g.fill();
  for (var i = 0; i < n; i++) { var W2 = WEAPONS[st.lad[i]], on = i <= me.tier; g.fillStyle = i === me.tier ? W2.col : on ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.12)'; rr(g, lx + i * cw + 2 * dpr, ly, cw - 4 * dpr, 8 * dpr, 3 * dpr); g.fill(); st.ents.forEach(function (e) { if (!e.me && e.tier === i) { g.fillStyle = e.col; g.beginPath(); g.arc(lx + i * cw + cw / 2 + (st.ents.indexOf(e) % 3 - 1) * 5 * dpr, ly + 15 * dpr, 2.8 * dpr, 0, 6.283); g.fill(); } }); }
  g.textAlign = 'center'; g.font = '800 ' + (13 * dpr) + 'px system-ui'; g.fillStyle = w.col; g.fillText(w.n + '  ' + (me.tier + 1) + '/' + n, CW / 2, ly + 32 * dpr);
  /* leader */
  var lead = st.ents.slice().sort(function (a, b) { return b.tier - a.tier || b.kills - a.kills; })[0]; g.textAlign = 'right'; g.font = '700 ' + (12 * dpr) + 'px system-ui'; g.fillStyle = '#93a3bd';
  g.fillText(lead === me ? 'You are in the lead' : 'Leader: ' + lead.name + ' (' + (lead.tier + 1) + '/' + n + ')', CW - pad, CH - pad - 12 * dpr);
  g.fillText(st.right + '/' + st.asked + ' answers right', CW - pad, CH - pad - 30 * dpr);
  /* kill feed */
  g.textAlign = 'right'; g.font = '700 ' + (13 * dpr) + 'px system-ui'; st.feed.forEach(function (f, i) { var age = st.t - f.t; g.globalAlpha = clamp(6 - age, 0, 1); var tw = g.measureText(f.s).width + 16 * dpr; g.fillStyle = 'rgba(5,8,13,.65)'; rr(g, CW - pad - tw, 70 * dpr + i * 26 * dpr, tw, 22 * dpr, 6 * dpr); g.fill(); g.fillStyle = f.c; g.fillText(f.s, CW - pad - 8 * dpr, 81 * dpr + i * 26 * dpr); }); g.globalAlpha = 1;
  /* minimap */
  var ms = Math.min(150 * dpr, CW * 0.18), cs2 = ms / Math.max(st.gw, st.gh), mx0 = pad, my0 = pad; g.fillStyle = 'rgba(5,8,13,.65)'; g.fillRect(mx0 - 4 * dpr, my0 - 4 * dpr, st.gw * cs2 + 8 * dpr, st.gh * cs2 + 8 * dpr);
  g.fillStyle = 'rgba(160,175,195,.55)'; for (var yy = 0; yy < st.gh; yy++) for (var xx = 0; xx < st.gw; xx++) if (st.grid[yy][xx]) g.fillRect(mx0 + xx * cs2, my0 + yy * cs2, cs2, cs2);
  st.ents.forEach(function (e) { if (!e.alive) return; if (!e.me && !(los(me.x, me.y, e.x, e.y) || e.shootAnim > 0)) return; g.fillStyle = e.me ? '#fde047' : e.col; g.beginPath(); g.arc(mx0 + e.x * cs2, my0 + e.y * cs2, (e.me ? 3.2 : 2.6) * dpr, 0, 6.283); g.fill(); });
  g.strokeStyle = '#fde047'; g.lineWidth = 1.5 * dpr; g.beginPath(); g.moveTo(mx0 + me.x * cs2, my0 + me.y * cs2); g.lineTo(mx0 + (me.x + Math.cos(me.a) * 1.8) * cs2, my0 + (me.y + Math.sin(me.a) * 1.8) * cs2); g.stroke();
  /* death screen */
  if (!me.alive) { g.fillStyle = 'rgba(80,0,0,.45)'; g.fillRect(0, 0, CW, CH); g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '900 ' + (34 * dpr) + 'px system-ui'; g.fillText('Eliminated' + (st.killer ? ' by ' + st.killer.name : ''), CW / 2, CH * 0.42); g.font = '700 ' + (16 * dpr) + 'px system-ui'; g.fillText('Back in ' + Math.max(0, me.respawn).toFixed(1) + ' s', CW / 2, CH * 0.42 + 36 * dpr); }
  /* scoreboard */
  if (st.board) { var bw = Math.min(CW * 0.8, 560 * dpr), bh = (60 + st.ents.length * 30) * dpr, bx = CW / 2 - bw / 2, by = CH / 2 - bh / 2; g.fillStyle = 'rgba(5,8,13,.88)'; rr(g, bx, by, bw, bh, 14 * dpr); g.fill(); g.textAlign = 'left'; g.font = '800 ' + (14 * dpr) + 'px system-ui'; g.fillStyle = '#93a3bd'; g.fillText('PLAYER', bx + 20 * dpr, by + 28 * dpr); g.fillText('WEAPON', bx + bw * 0.42, by + 28 * dpr); g.fillText('K / D', bx + bw * 0.82, by + 28 * dpr);
    st.ents.slice().sort(function (a, b) { return b.tier - a.tier || b.kills - a.kills; }).forEach(function (e, i) { var Y = by + (60 + i * 30) * dpr; g.fillStyle = e.me ? '#fde047' : e.col; g.fillText(e.name + (e.D ? ' (' + e.D.n + ')' : ''), bx + 20 * dpr, Y); g.fillStyle = '#e8edf7'; g.fillText(W_(e).n + ' ' + (e.tier + 1), bx + bw * 0.42, Y); g.fillText(e.kills + ' / ' + e.deaths, bx + bw * 0.82, Y); }); }
  if (document.pointerLockElement !== cv && !st.touch && !st.q && !st.paused && !st.result) { g.textAlign = 'center'; g.font = '800 ' + (15 * dpr) + 'px system-ui'; g.fillStyle = 'rgba(5,8,13,.75)'; rr(g, CW / 2 - 130 * dpr, CH * 0.62 - 18 * dpr, 260 * dpr, 36 * dpr, 10 * dpr); g.fill(); g.fillStyle = '#fff'; g.fillText('Click to aim with the mouse', CW / 2, CH * 0.62); }
  g.restore();
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function drawGun(g, CW, CH, w, dpr) {
  var s = Math.min(CW, CH * 1.6) / 900, bob = Math.sin(st.bob) * (st.me.moving ? 8 : 2) * s, rec = st.recoil * 26 * s, X = CW * 0.62 + bob, Y = CH - 10 * s + Math.abs(Math.cos(st.bob)) * (st.me.moving ? 6 : 0) * s + rec;
  g.save(); g.translate(X, Y); g.scale(s, s); g.rotate(-0.08 - st.recoil * 0.12);
  var col = w.col, dark = '#1b2230', mid = '#2f3a4d';
  function box(x, y, ww, hh, c, r) { g.fillStyle = c; rr(g, x, y, ww, hh, r || 6); g.fill(); }
  if (w.kind === 'rod') {
    var gr = g.createLinearGradient(-30, -360, 30, -360); gr.addColorStop(0, '#a16207'); gr.addColorStop(0.5, '#fde68a'); gr.addColorStop(1, '#a16207'); g.shadowColor = '#fbbf24'; g.shadowBlur = 30; box(-26, -380, 52, 380, gr, 16); g.shadowBlur = 0; box(-40, -60, 80, 60, dark, 12); g.fillStyle = '#fff8'; for (var i = 0; i < 6; i++) g.fillRect(-18, -360 + i * 50, 8, 26);
  } else if (w.kind === 'rocket') {
    box(-70, -250, 140, 120, mid, 20); box(-55, -330, 110, 110, dark, 50); g.fillStyle = col; g.beginPath(); g.arc(0, -300, 34, 0, 6.283); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(0, -300, 22, 0, 6.283); g.fill(); box(-30, -140, 60, 140, dark, 10); box(-90, -210, 30, 70, col, 8);
  } else {
    var len = { pistol: 150, smg: 230, shotgun: 300, rifle: 320, burst: 290, sniper: 380, mini: 260, revolver: 190 }[w.kind] || 220, wid = { pistol: 60, smg: 74, shotgun: 86, rifle: 72, burst: 76, sniper: 66, mini: 120, revolver: 70 }[w.kind] || 70;
    box(-wid / 2, -len - 40, wid, len, mid, 14); box(-wid / 2 + 8, -len - 40, wid - 16, 20, col, 6); box(-wid / 2 - 6, -110, wid + 12, 50, dark, 10); box(-24, -70, 48, 90, dark, 10);
    if (w.kind === 'mini') { for (var b = -1; b <= 1; b++) box(b * 30 - 10, -len - 120, 20, 100, '#555f70', 8); } else box(-12, -len - 90, 24, 60, '#4a5568', 6);
    if (w.kind === 'sniper') { box(-22, -len + 30, 44, 110, '#0f172a', 18); g.fillStyle = '#38bdf8'; g.beginPath(); g.arc(0, -len + 40, 14, 0, 6.283); g.fill(); }
    if (w.kind === 'shotgun') box(-wid / 2 - 10, -len + 60, wid + 20, 40, '#7c4a1e', 10);
    if (w.kind === 'revolver') { g.fillStyle = '#6b7280'; g.beginPath(); g.arc(0, -150, 46, 0, 6.283); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(0, -150, 18, 0, 6.283); g.fill(); }
    g.fillStyle = col; g.globalAlpha = 0.85; g.fillRect(-wid / 2 + 4, -len + 20, 6, len - 80); g.globalAlpha = 1;
    if (st.flash > 0) { g.fillStyle = '#fde68a'; g.shadowColor = '#fbbf24'; g.shadowBlur = 40; g.beginPath(); var fy = w.kind === 'mini' ? -len - 130 : -len - 100; for (var k = 0; k < 10; k++) { var ang = k / 10 * 6.283, rd2 = k % 2 ? 22 : 54; g.lineTo(Math.cos(ang) * rd2, fy + Math.sin(ang) * rd2); } g.fill(); g.shadowBlur = 0; }
  }
  g.restore();
}

window.CRIT_ARENA = { open: open, close: close, _st: function () { return st; }, _w: WEAPONS };
})();
