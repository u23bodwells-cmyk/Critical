/* Critical Clash 3D: a blocky arena shooter for Critical.
   Gun game: every kill asks a question (30 s). Answer right to move up the weapon ladder; first kill with the golden control rod wins.
   Deathmatch: bring a gun you bought with coins. Every kill is still a question.
   Uses three.js (MIT licence, vendor/three.min.js). Game code: Copyright (c) u23bodwells-cmyk. All rights reserved. */
(function () {
'use strict';
if (window.CRIT_ARENA) return;
var API = window.CRIT_ARENA_API || { tracks: function () { return []; }, questions: function () { return []; }, result: function () {}, xp: function () {}, crate: function () {}, sfx: function () {}, close: function () {} };
var SKEY = 'critical_arena';
function rd() { try { return JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; } catch (e) { return {}; } }
function wr(o) { try { o.rev = (o.rev || 0) + 1; o.at = Date.now(); localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }

/* ============================================================ data ============================================================ */
var CELL = 3, EYE = 1.62, PR = 0.36, GRAV = 26, JUMPV = 8.6, SPEED = 7.4;
/* every gun: damage, seconds between shots, magazine, reload seconds, spread (radians), range, aim zoom, move speed, price, Clash level to unlock */
var G = {
  pistol: { n: 'Geiger pistol', kind: 'pistol', dmg: 26, rate: 0.24, mag: 12, rel: 1.2, spr: 0.012, rng: 70, ads: 0.82, move: 1.06, head: 1.6, price: 0, lvl: 1, col: '#9aa4b2', d: 'Reliable sidearm. Quick to reload.' },
  smg: { n: 'Neutron SMG', kind: 'smg', dmg: 15, rate: 0.075, mag: 32, rel: 1.6, spr: 0.04, rng: 45, ads: 0.82, move: 1.08, head: 1.5, auto: 1, price: 600, lvl: 1, col: '#5eead4', d: 'Sprays fast up close. Light, so you move quickly.' },
  shotgun: { n: 'Boron shotgun', kind: 'shotgun', dmg: 12, pel: 8, rate: 0.8, mag: 6, rel: 2.4, spr: 0.1, rng: 24, ads: 0.85, move: 1.0, head: 1.3, price: 900, lvl: 2, col: '#f97316', d: 'Eight pellets. Brutal at close range, useless far away.' },
  rifle: { n: 'Isotope rifle', kind: 'rifle', dmg: 24, rate: 0.11, mag: 30, rel: 2.0, spr: 0.02, rng: 90, ads: 0.72, move: 0.98, head: 1.6, auto: 1, price: 1500, lvl: 3, col: '#60a5fa', d: 'The all-rounder. Accurate, automatic, decent damage.' },
  burst: { n: 'Burst carbine', kind: 'burst', dmg: 26, burst: 3, rate: 0.42, mag: 24, rel: 1.9, spr: 0.013, rng: 85, ads: 0.72, move: 1.0, head: 1.7, price: 1800, lvl: 4, col: '#a78bfa', d: 'Three-round bursts. Land them all for a quick kill.' },
  revolver: { n: 'Turbine revolver', kind: 'revolver', dmg: 55, rate: 0.5, mag: 6, rel: 2.2, spr: 0.008, rng: 80, ads: 0.75, move: 1.04, head: 2.0, price: 2200, lvl: 5, col: '#eab308', d: 'Huge hits, six shots. Two to the body finishes most players.' },
  lmg: { n: 'Coolant LMG', kind: 'lmg', dmg: 20, rate: 0.085, mag: 75, rel: 3.6, spr: 0.034, rng: 80, ads: 0.75, move: 0.88, head: 1.5, auto: 1, price: 3200, lvl: 7, col: '#38bdf8', d: 'Big magazine, long reload. Slows you down.' },
  sniper: { n: 'Gamma sniper', kind: 'sniper', dmg: 95, rate: 1.1, mag: 5, rel: 2.6, spr: 0.065, aspr: 0, rng: 170, ads: 0.33, scope: 1, move: 0.94, head: 2.2, price: 4000, lvl: 9, col: '#22c55e', d: 'One shot to the head. Aim (right-click) or it sprays wide.' },
  mini: { n: 'Plasma minigun', kind: 'mini', dmg: 10, rate: 0.045, mag: 150, rel: 4.2, spr: 0.06, rng: 50, ads: 0.85, move: 0.8, head: 1.4, auto: 1, spin: 0.45, price: 5500, lvl: 11, col: '#f472b6', d: 'Spins up, then shreds. Very heavy.' },
  rocket: { n: 'Fission launcher', kind: 'rocket', dmg: 100, proj: 30, splash: 4.6, rate: 1.0, mag: 2, rel: 2.8, spr: 0, rng: 120, ads: 0.8, move: 0.92, head: 1, price: 7000, lvl: 14, col: '#ef4444', d: 'Rockets with splash damage. Shoot the floor near them. Rocket-jump!' },
  rail: { n: 'Fusion railgun', kind: 'rail', dmg: 120, pierce: 1, rate: 1.35, mag: 4, rel: 2.5, spr: 0.004, rng: 220, ads: 0.5, scope: 1, move: 0.95, head: 1.5, price: 9000, lvl: 17, col: '#22d3ee', d: 'Goes straight through everyone in a line. One hit kills.' },
  laser: { n: 'Tokamak beam', kind: 'laser', dmg: 8, rate: 0.05, mag: 120, rel: 3.0, spr: 0, rng: 55, ads: 0.8, move: 1.0, head: 1.3, auto: 1, beam: 1, price: 12000, lvl: 21, col: '#e879f9', d: 'A continuous plasma beam. Never misses where you point it.' },
  rod: { n: 'Golden control rod', kind: 'rod', dmg: 200, rate: 0.45, mag: 0, rel: 0, melee: 2.7, move: 1.12, head: 1, price: -1, lvl: 99, col: '#f5c542', d: 'The gun-game finale. One hit wins.' }
};
var SHOP = ['pistol', 'smg', 'shotgun', 'rifle', 'burst', 'revolver', 'lmg', 'sniper', 'mini', 'rocket', 'rail', 'laser'];
var LADDERS = { full: ['pistol', 'smg', 'shotgun', 'rifle', 'burst', 'sniper', 'mini', 'revolver', 'rocket', 'rod'], quick: ['pistol', 'shotgun', 'sniper', 'rocket', 'rod'], mega: ['pistol', 'smg', 'shotgun', 'rifle', 'burst', 'revolver', 'lmg', 'sniper', 'mini', 'rail', 'laser', 'rocket', 'rod'] };
var DIFF = {
  easy: { n: 'Easy', acc: 0.16, react: 0.95, spd: 1.5, ans: 0.4, fire: 1.6, vis: 12, turn: 3.2, col: '#22c55e' },
  normal: { n: 'Normal', acc: 0.29, react: 0.6, spd: 1.9, ans: 0.6, fire: 1.25, vis: 15, turn: 4.5, col: '#3b82f6' },
  hard: { n: 'Hard', acc: 0.44, react: 0.38, spd: 2.25, ans: 0.75, fire: 1.0, vis: 18, turn: 6, col: '#f97316' },
  insane: { n: 'Insane', acc: 0.6, react: 0.22, spd: 2.6, ans: 0.9, fire: 0.9, vis: 22, turn: 8, col: '#ef4444' }
};
function diffFor(k, skill) {
  if (k !== 'auto') return DIFF[k] || DIFF.normal;
  var a = DIFF.easy, b = DIFF.insane, t = clamp(skill, 0, 1), o = { n: 'Match me', col: '#22d3ee', auto: 1 };
  ['acc', 'react', 'spd', 'ans', 'fire', 'vis', 'turn'].forEach(function (key) { o[key] = lerp(a[key], b[key], t); }); return o;
}
var BOTNAMES = ['Curie', 'Fermi', 'Meitner', 'Bohr', 'Rutherford', 'Chadwick', 'Szilard', 'Noether', 'Becquerel', 'Franklin', 'Hahn', 'Oppie'];
var BOTCOL = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];
var SKINS = ['#f5cd30', '#f1c7a3', '#d29a6e', '#a8704a', '#6e4a32', '#f5cd30'], PANTS = ['#1f2937', '#334155', '#14532d', '#1e3a8a', '#3f3f46', '#7c2d12'], HATS = ['hard', 'cap', 'none', 'helmet', 'phones', 'hard', 'beanie'];
function lvlInfo(xp) { var lv = 1, need = 200, left = xp || 0; while (left >= need && lv < 50) { left -= need; lv++; need = 200 + 60 * (lv - 1); } return { lv: lv, into: left, need: need }; }
var MAPS = {
  turbine: { n: 'Turbine hall', d: 'Big indoor hall with turbines and crates. Good all-rounder.', inner: 5, outer: 9, roof: 9.4, floor: 'concrete', sky: null, bg: '#26313f', fog: ['#26313f', 45, 160], hemi: ['#dfe8ff', '#4a3f30', 1.0], sun: ['#fff1dd', 2.6, [0.45, 1, 0.3]], env: 0.7, grid: [
    '########################',
    '#......#.......#.......#',
    '#.TT...#...P...#...TT..#',
    '#.TT.......P.......TT..#',
    '#......#..c....#.......#',
    '###.####..HHH..####.####',
    '#..c........c..........#',
    '#..PP.......c......PP..#',
    '#.......c..........c...#',
    '#......#.......#.......#',
    '####..##...R...##..#####',
    '#.........RRR..........#',
    '#..c..#....R....#...c..#',
    '#.....#.........#......#',
    '####..###..c..###..#####',
    '#..........c...........#',
    '#..TT....#####....TT...#',
    '#..TT....#...#....TT...#',
    '#..c.....#.......#..c..#',
    '#.....P..........P.....#',
    '#..H.......c...........#',
    '#..H....##.....##...H..#',
    '#.......#...c...#...H..#',
    '########################'] },
  core: { n: 'Reactor core', d: 'Dark corridors round a glowing reactor. Close-range chaos.', inner: 4.4, outer: 6.2, roof: 6.4, floor: 'grate', sky: null, bg: '#06141f', fog: ['#06141f', 16, 75], hemi: ['#9be3ff', '#10181e', 0.75], sun: ['#a7ecff', 1.0, [0.3, 1, 0.4]], env: 0.45, grid: [
    '######################',
    '#....#..........#....#',
    '#.c..#..PP..PP..#..c.#',
    '#....H..........H....#',
    '##.###...####...###.##',
    '#........#RR#........#',
    '#..#..c..#RR#..c..#..#',
    '#..#..............#..#',
    '#..####.##..##.####..#',
    '#.........RR.........#',
    '#.........RR.........#',
    '#..####.##..##.####..#',
    '#..#..............#..#',
    '#..#..c..#RR#..c..#..#',
    '#........#RR#........#',
    '##.###...####...###.##',
    '#....H..........H....#',
    '#.c..#..PP..PP..#..c.#',
    '#....#..........#....#',
    '######################'] },
  towers: { n: 'Cooling towers', d: 'Outdoors between giant cooling towers. Long sightlines.', inner: 4, outer: 2.4, roof: 0, floor: 'grass', sky: ['#3f86d6', '#dcebf7'], bg: '#d3e3f0', fog: ['#d3e3f0', 80, 300], hemi: ['#e8f3ff', '#55663f', 1.0], sun: ['#fff4e0', 3.2, [0.5, 0.9, 0.2]], env: 0.6, grid: [
    '##########################',
    '#........................#',
    '#..BBB.........BBB.......#',
    '#..B.B....H....B.B...H...#',
    '#..BBB....H....BBB...H...#',
    '#.........c..............#',
    '#....P...........P....c..#',
    '#....P...TTT.....P...BBB.#',
    '#..c.....T.T.........B.B.#',
    '#........TTT.........BBB.#',
    '#.....H.......c..........#',
    '#.BBB.H......BBB....P....#',
    '#.B.B........B.B....P....#',
    '#.BBB........BBB.........#',
    '#..........H.......c.....#',
    '#....P..c..H.....TTT.....#',
    '#....P...........T.T.....#',
    '#................TTT.....#',
    '#........................#',
    '##########################'] }
};
var CODE = { '#': 1, 'H': 2, 'P': 3, 'R': 4, 'T': 5, 'B': 6, 'c': 7 }, TALL = { 1: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, LOWH = { 2: 1.15, 7: 1.25 };

/* ============================================================ sound ============================================================ */
var AC = null, MASTER = null, NB = null;
function audio() { if (AC) return AC; try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = 0.4; var comp = AC.createDynamicsCompressor(); MASTER.connect(comp); comp.connect(AC.destination); var b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; NB = b; } catch (e) { AC = null; } return AC; }
function nz(t, dur, f, type, vol, q, f2) { var a = AC, s = a.createBufferSource(); s.buffer = NB; var fl = a.createBiquadFilter(), g = a.createGain(); fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); if (q) fl.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); s.connect(fl); fl.connect(g); g.connect(MASTER); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02); }
function tone(t, dur, f1, f2, type, vol) { var a = AC, o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + dur + 0.02); }
function snd(k, vol) {
  var a = audio(); if (!a || !MASTER) return; var t = a.currentTime, v = vol == null ? 1 : vol; if (v < 0.02) return;
  switch (k) {
    case 'pistol': nz(t, 0.14, 2200, 'lowpass', 0.9 * v, 0, 600); tone(t, 0.08, 220, 70, 'square', 0.25 * v); break;
    case 'smg': nz(t, 0.07, 2800, 'lowpass', 0.7 * v, 0, 900); tone(t, 0.05, 180, 80, 'square', 0.15 * v); break;
    case 'shotgun': nz(t, 0.35, 1100, 'lowpass', 1.2 * v, 0, 200); tone(t, 0.25, 110, 40, 'sine', 0.8 * v); break;
    case 'rifle': case 'burst': nz(t, 0.11, 1900, 'lowpass', 0.85 * v, 0, 500); tone(t, 0.07, 160, 60, 'square', 0.2 * v); break;
    case 'revolver': nz(t, 0.3, 1300, 'lowpass', 1.1 * v, 0, 250); tone(t, 0.25, 140, 40, 'sine', 0.7 * v); break;
    case 'lmg': nz(t, 0.1, 1600, 'lowpass', 0.85 * v, 0, 400); tone(t, 0.08, 130, 50, 'square', 0.22 * v); break;
    case 'sniper': nz(t, 0.5, 900, 'lowpass', 1.3 * v, 0, 150); tone(t, 0.4, 120, 30, 'sine', 0.9 * v); break;
    case 'mini': nz(t, 0.05, 3200, 'lowpass', 0.6 * v, 0, 1200); break;
    case 'rocket': nz(t, 0.6, 600, 'bandpass', 0.8 * v, 1.2, 2400); tone(t, 0.3, 90, 50, 'sawtooth', 0.2 * v); break;
    case 'rail': tone(t, 0.35, 1800, 120, 'sawtooth', 0.35 * v); nz(t, 0.4, 5000, 'highpass', 0.4 * v); tone(t, 0.3, 90, 40, 'sine', 0.8 * v); break;
    case 'laser': tone(t, 0.06, 900 + Math.random() * 80, 700, 'sawtooth', 0.08 * v); break;
    case 'rod': nz(t, 0.22, 500, 'bandpass', 0.6 * v, 2, 2500); break;
    case 'boom': nz(t, 1.1, 900, 'lowpass', 1.5 * v, 0, 60); tone(t, 0.8, 80, 25, 'sine', 1.2 * v); break;
    case 'hit': tone(t, 0.05, 1800, 1500, 'square', 0.12 * v); break;
    case 'head': tone(t, 0.08, 2400, 2200, 'triangle', 0.25 * v); tone(t + 0.05, 0.1, 3200, 3000, 'triangle', 0.2 * v); break;
    case 'kill': tone(t, 0.1, 880, 880, 'triangle', 0.3 * v); tone(t + 0.09, 0.16, 1320, 1320, 'triangle', 0.3 * v); break;
    case 'death': tone(t, 0.28, 420, 160, 'triangle', 0.5 * v); nz(t, 0.18, 800, 'bandpass', 0.4 * v, 3); break;
    case 'step': nz(t, 0.06, 420, 'lowpass', 0.22 * v); break;
    case 'jump': nz(t, 0.1, 900, 'bandpass', 0.18 * v, 2); break;
    case 'land': nz(t, 0.12, 300, 'lowpass', 0.4 * v); break;
    case 'empty': tone(t, 0.03, 2000, 1800, 'square', 0.12 * v); break;
    case 'reload': nz(t, 0.05, 2500, 'bandpass', 0.35 * v, 4); nz(t + 0.25, 0.06, 1800, 'bandpass', 0.35 * v, 4); break;
    case 'reloaded': nz(t, 0.06, 3000, 'bandpass', 0.4 * v, 5); tone(t, 0.04, 900, 900, 'square', 0.08 * v); break;
    case 'swap': nz(t, 0.08, 2000, 'bandpass', 0.3 * v, 3); break;
    case 'spin': tone(t, 0.45, 80, 420, 'sawtooth', 0.08 * v); break;
    case 'up': tone(t, 0.12, 523, 523, 'triangle', 0.3 * v); tone(t + 0.1, 0.12, 659, 659, 'triangle', 0.3 * v); tone(t + 0.2, 0.2, 988, 988, 'triangle', 0.3 * v); break;
    case 'tick': tone(t, 0.04, 1000, 1000, 'sine', 0.15 * v); break;
    case 'coin': tone(t, 0.06, 1568, 1568, 'square', 0.1 * v); tone(t + 0.06, 0.12, 2093, 2093, 'square', 0.1 * v); break;
    case 'win': [523, 659, 784, 1047].forEach(function (f, i) { tone(t + i * 0.12, 0.3, f, f, 'triangle', 0.3 * v); }); break;
    case 'lose': [392, 330, 262].forEach(function (f, i) { tone(t + i * 0.16, 0.3, f, f * 0.98, 'triangle', 0.3 * v); }); break;
  }
}

/* ============================================================ styles + shell ============================================================ */
var root = null, st = null, R3 = null; /* R3 = the game renderer */
var CSS = '.arn{position:fixed;inset:0;z-index:2147482000;background:#05080d;color:#e8edf7;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none}' +
  '.arn *{box-sizing:border-box}.arn button{font:inherit;color:inherit;cursor:pointer}.arn canvas.arv,.arn canvas.arh{position:absolute;inset:0;width:100%;height:100%;display:block}.arn canvas.arv{cursor:crosshair}.arn canvas.arh{pointer-events:none}' +
  '.arsetup{position:absolute;inset:0;overflow:auto;padding:max(18px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 28px max(16px,env(safe-area-inset-left));background:radial-gradient(1200px 600px at 20% -10%,rgba(59,130,246,.25),transparent),radial-gradient(900px 500px at 110% 10%,rgba(239,68,68,.18),transparent),#05080d}' +
  '.arwrap{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:14px}.arhd{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.arhd h1{margin:0;font-size:clamp(26px,5vw,40px);letter-spacing:-.02em;line-height:1;background:linear-gradient(90deg,#fde047,#fb923c,#ef4444);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:900}' +
  '.arhd p{margin:4px 0 0;color:#9aa6bb;max-width:62ch;line-height:1.45}.arx{margin-left:auto;border:1.5px solid #2a3446;background:#0d1320;border-radius:12px;padding:9px 14px;font-weight:800}' +
  '.arwallet{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}.arwallet>div{background:#0d1422;border:1px solid #1f2a3d;border-radius:14px;padding:8px 12px;display:flex;flex-direction:column;min-width:120px}.arwallet b{font:900 18px ui-monospace,monospace}.arwallet span{font-size:11.5px;color:#93a3bd;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.arwallet i{display:block;height:5px;border-radius:3px;background:#1a2333;margin-top:5px;overflow:hidden}.arwallet i em{display:block;height:100%;background:linear-gradient(90deg,#22d3ee,#a78bfa)}' +
  '.artabs{display:flex;gap:6px}.artab{border:1.5px solid #253045;background:#0d1422;border-radius:12px;padding:9px 16px;font-weight:900}.artab[aria-selected=true]{background:linear-gradient(90deg,#f59e0b,#ef4444);border-color:transparent;color:#fff}' +
  '.arcard{background:linear-gradient(180deg,#0f1625,#0b111d);border:1px solid #1f2a3d;border-radius:18px;padding:14px 16px;min-width:0}.arcard h2{margin:0 0 10px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#93a3bd;font-weight:800}' +
  '.argrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px}@media(max-width:820px){.argrid{grid-template-columns:1fr}}' +
  '.archips{display:flex;flex-wrap:wrap;gap:8px}.archip{border:1.5px solid #253045;background:#0d1422;border-radius:12px;padding:8px 12px;font-weight:800;display:flex;gap:6px;align-items:center}.archip[aria-pressed=true]{border-color:#fb923c;background:rgba(251,146,60,.14);box-shadow:0 0 0 3px rgba(251,146,60,.15)}.archip:disabled{opacity:.4;cursor:not-allowed}.archip small{font-weight:600;color:#93a3bd;font-size:12px}' +
  '.arlv{flex-direction:column;align-items:flex-start;gap:2px;min-width:104px}.armaps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:560px){.armaps{grid-template-columns:1fr}}.armap{border:1.5px solid #253045;background:#0d1422;border-radius:14px;padding:8px;text-align:left;display:flex;flex-direction:column;gap:6px}.armap[aria-pressed=true]{border-color:#fb923c;box-shadow:0 0 0 3px rgba(251,146,60,.15)}.armap canvas{width:100%;height:auto;border-radius:8px;background:#000;image-rendering:pixelated}.armap b{font-size:14px}.armap span{font-size:12px;color:#93a3bd;line-height:1.35}' +
  '.arbots{display:flex;flex-direction:column;gap:6px}.arbot{display:flex;align-items:center;gap:8px;border:1px solid #1f2a3d;background:#0b1220;border-radius:12px;padding:6px 8px}.arbot i{width:14px;height:14px;border-radius:4px;flex:none}.arbot b{flex:1;min-width:0}.arn select{font:inherit;font-weight:700;background:#111a2b;color:#e8edf7;border:1.5px solid #2a3446;border-radius:9px;padding:5px 8px;max-width:100%}.arbot button{border:0;background:none;color:#93a3bd;font-size:18px;width:30px;height:30px;border-radius:8px}.arbot button:hover{background:#1a2333}' +
  '.arrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.arbtn{border-radius:14px;padding:12px 18px;font-weight:900;background:#1a2436;border:1.5px solid #2a3446}.arbtn.go{background:linear-gradient(90deg,#f59e0b,#ef4444);border:0;color:#fff;font-size:18px;padding:14px 26px;box-shadow:0 10px 30px -10px #ef4444}.arbtn.go:disabled{opacity:.5;cursor:not-allowed}.arsmall{font-size:12.5px;color:#93a3bd;line-height:1.45}' +
  '.arsl{display:flex;align-items:center;gap:10px;margin-top:10px}.arsl input{flex:1;min-width:0;accent-color:#fb923c}.arsl span{min-width:100px}.arkeys{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:13px;color:#b8c3d6}.arkeys kbd{font:800 11px ui-monospace,monospace;background:#1a2333;border:1px solid #2a3446;border-bottom-width:2px;border-radius:6px;padding:2px 6px;color:#e8edf7;white-space:nowrap}' +
  '.arshop{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:14px}@media(max-width:820px){.arshop{grid-template-columns:1fr}}.arprev{position:relative;border-radius:18px;overflow:hidden;background:radial-gradient(500px 300px at 50% 30%,#1b2a44,#070b12);border:1px solid #1f2a3d;min-width:0}.arprev canvas{width:100%;height:250px;display:block}.arprev .arpi{padding:4px 16px 16px}.arprev h3{margin:0;font-size:24px;font-weight:900}.arprev p{margin:4px 0 0;color:#9aa6bb;font-size:14px}' +
  '.arstat{display:grid;grid-template-columns:86px 1fr 64px;gap:6px 10px;align-items:center;font-size:12.5px;margin-top:10px}.arstat span{color:#93a3bd;font-weight:700}.arstat i{height:8px;border-radius:5px;background:#1a2333;overflow:hidden}.arstat i em{display:block;height:100%;border-radius:5px}.arstat b{font:800 12px ui-monospace,monospace;text-align:right}' +
  '.argunlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.argun{border:1.5px solid #253045;background:#0d1422;border-radius:14px;padding:10px;text-align:left;display:flex;flex-direction:column;gap:4px;position:relative;overflow:hidden}.argun::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:var(--gc)}.argun[aria-pressed=true]{border-color:#fb923c;box-shadow:0 0 0 3px rgba(251,146,60,.15)}.argun b{font-size:14px;padding-right:44px}.argun small{font-size:12px;color:#93a3bd;font-weight:700}.argun .own{color:#4ade80}.argun .lock{color:#f87171}.argun .eq{position:absolute;right:8px;top:9px;font:800 10px ui-monospace,monospace;background:#22c55e;color:#04140a;border-radius:6px;padding:2px 6px}' +
  '.arq{position:absolute;inset:0;display:grid;place-items:center;background:rgba(3,6,12,.72);backdrop-filter:blur(3px);padding:16px}.arqbox{width:min(720px,100%);max-height:92vh;overflow:auto;background:linear-gradient(180deg,#111a2c,#0b1220);border:2px solid #2a3a58;border-radius:20px;padding:18px;box-shadow:0 30px 80px -20px #000;display:flex;flex-direction:column;gap:12px}' +
  '.arqtop{display:flex;align-items:center;gap:10px;font:800 12px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#fb923c}.arqtop span:last-child{margin-left:auto;color:#e8edf7;font-size:16px}.artime{height:8px;border-radius:5px;background:#1a2333;overflow:hidden}.artime i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#eab308,#ef4444);transform-origin:left}' +
  '.arqp{font-size:clamp(17px,2.6vw,21px);font-weight:700;line-height:1.4}.arqs{font-size:12px;color:#93a3bd}.aropts{display:grid;gap:8px}.aropt{display:flex;gap:10px;align-items:center;text-align:left;border:2px solid #263249;background:#0d1524;border-radius:14px;padding:12px 14px;font-size:16px;font-weight:600}.aropt:hover{border-color:#fb923c}.aropt kbd{font:800 12px ui-monospace,monospace;background:#1a2333;border-radius:7px;padding:3px 8px;flex:none}.aropt.ok{border-color:#22c55e;background:rgba(34,197,94,.15)}.aropt.no{border-color:#ef4444;background:rgba(239,68,68,.13)}.aropt:disabled{cursor:default}' +
  '.arnum{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.arnum input{flex:1 1 200px;min-width:0;font:700 20px ui-monospace,monospace;color:#e8edf7;background:#0d1524;border:2px solid #263249;border-radius:12px;padding:12px 14px}.arnum input:focus{outline:none;border-color:#fb923c}.arnum span{font-weight:700;color:#93a3bd}' +
  '.arfb{border-radius:14px;padding:12px 14px;font-weight:600;line-height:1.45}.arfb.ok{background:rgba(34,197,94,.14);border:1.5px solid #22c55e}.arfb.no{background:rgba(239,68,68,.12);border:1.5px solid #ef4444}.arfb b{display:block;font-size:17px;margin-bottom:2px}' +
  '.armenu{position:absolute;inset:0;display:grid;place-items:center;background:rgba(3,6,12,.78);padding:16px}.armenu .arqbox{max-width:520px;text-align:center;align-items:center}.armenu h2{margin:0;font-size:28px}' +
  '.arres{position:absolute;inset:0;overflow:auto;background:rgba(3,6,12,.9);padding:20px 16px}.arres .arwrap{max-width:820px}.arbig{font-size:clamp(34px,7vw,64px);font-weight:900;letter-spacing:-.03em;margin:0;line-height:1}.arbig.win{background:linear-gradient(90deg,#fde047,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent}.arstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}.arstats div{background:#0d1524;border:1px solid #1f2a3d;border-radius:14px;padding:10px 12px}.arstats b{display:block;font:900 24px ui-monospace,monospace}.arstats span{font-size:12px;color:#93a3bd;font-weight:700}' +
  '.artable{width:100%;border-collapse:collapse;font-size:14px}.artable td,.artable th{padding:7px 8px;border-bottom:1px solid #1f2a3d;text-align:left}.artable th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#93a3bd}.artable tr.me td{color:#fde047;font-weight:800}.artw{overflow-x:auto}' +
  '.armiss{display:flex;flex-direction:column;gap:8px}.armiss div{background:#0d1524;border:1px solid #1f2a3d;border-left:4px solid #ef4444;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.4}.armiss em{display:block;font-style:normal;color:#86efac;font-weight:700;margin-top:4px}' +
  '.artouch{position:absolute;inset:0;pointer-events:none}.artouch .stick{position:absolute;left:24px;bottom:24px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.18);pointer-events:auto}.artouch .stick i{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.3)}.artouch .tb{position:absolute;border-radius:50%;border:3px solid rgba(255,255,255,.35);pointer-events:auto;font-weight:900;color:#fff}.artouch .fire{right:28px;bottom:40px;width:96px;height:96px;background:rgba(239,68,68,.35)}.artouch .jump{right:140px;bottom:30px;width:66px;height:66px;background:rgba(59,130,246,.3)}.artouch .rel{right:40px;bottom:150px;width:60px;height:60px;background:rgba(255,255,255,.12)}.artouch .aim{right:120px;bottom:120px;width:60px;height:60px;background:rgba(34,211,238,.25)}.artouch .look{position:absolute;right:0;top:0;width:55%;height:100%;pointer-events:auto}' +
  '.arload{position:absolute;inset:0;display:grid;place-items:center;font-weight:800;color:#93a3bd}';

function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function loadThree(cb) {
  if (window.THREE && THREE.WebGLRenderer) { cb(true); return; }
  var s = document.createElement('script'); s.src = 'vendor/three.min.js?v=160'; s.onload = function () { cb(!!(window.THREE && THREE.WebGLRenderer)); }; s.onerror = function () { cb(false); }; document.head.appendChild(s);
}
function open() {
  if (root) return;
  if (!document.getElementById('arnCss')) { var s = el('style'); s.id = 'arnCss'; s.textContent = CSS; document.head.appendChild(s); }
  root = el('div', 'arn'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Critical Clash'); document.body.appendChild(root); document.body.classList.add('noscroll');
  root.innerHTML = '<div class="arload">Loading Critical Clash 3D…</div>';
  var warn = console.warn; console.warn = function (m) { if (typeof m === 'string' && /three\.min\.js/.test(m)) return; return warn.apply(console, arguments); };
  loadThree(function (ok) { setTimeout(function () { console.warn = warn; }, 500); if (!root) return; if (!ok) { fail('Couldn\'t load the 3D engine. Check your internet and try again.'); return; } setup(); });
}
function fail(msg) { if (!root) return; root.innerHTML = '<div class="arload" style="text-align:center;padding:20px;line-height:1.5">' + msg + '<br><br><button type="button" class="arbtn" data-a="x">Close</button></div>'; root.querySelector('[data-a=x]').onclick = close; }
var pendingXP = 0;
function close() {
  stopGame(); stopPreview(); killR3();
  if (root) root.remove(); root = null;
  if (!document.querySelector('.xov')) document.body.classList.remove('noscroll');
  try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  var gained = pendingXP; pendingXP = 0; if (gained > 0) API.xp(gained);
  API.close();
}
function killR3() { if (R3) { try { R3.dispose(); R3.forceContextLoss(); } catch (e) {} R3 = null; } }
function store() {
  var c = rd(), tr = API.tracks();
  if (!c.track || !tr.some(function (t) { return t.id === c.track; })) { var best = tr.slice().sort(function (a, b) { return sum(b) - sum(a); })[0]; c.track = best ? best.id : 'theory'; }
  if (!c.lv) c.lv = 1; if (!MAPS[c.map]) c.map = 'turbine';
  if (!c.bots || !c.bots.length) c.bots = ['auto', 'auto', 'auto', 'auto'];
  if (!c.v3d) { c.v3d = 1; c.bots = c.bots.map(function () { return 'auto'; }); } /* first run of the 3D version: bots match your skill */
  if (!LADDERS[c.ladder] && c.ladder !== 'mine') c.ladder = 'full'; if (!c.sens) c.sens = 5; if (c.onlyDone == null) c.onlyDone = true;
  if (!c.mode) c.mode = 'gun'; if (!c.dmKills) c.dmKills = 15; if (!c.gfx) c.gfx = 'medium'; if (!c.fov) c.fov = 80;
  if (c.coins == null) c.coins = 0; if (c.cxp == null) c.cxp = 0; if (!c.owned) c.owned = ['pistol']; if (c.owned.indexOf('pistol') < 0) c.owned.unshift('pistol');
  c.owned = SHOP.filter(function (k) { return c.owned.indexOf(k) >= 0; });
  if (!c.primary || c.owned.indexOf(c.primary) < 0) c.primary = c.owned[c.owned.length - 1]; if (c.skill == null) c.skill = 0.35; if (!c.rec) c.rec = {};
  return c;
  function sum(t) { return t.levels.reduce(function (a, l) { return a + l.done; }, 0); }
}
function poolDoneLen(c) { return API.questions(c.track, c.lv).filter(function (x) { return x.done; }).length; }
function qpool(c) { var all = API.questions(c.track, c.lv); if (c.onlyDone) { var d = all.filter(function (x) { return x.done; }); if (d.length >= 6) return d; } return all; }
function mapPreview(id, cvs) {
  var m = MAPS[id].grid, h = m.length, w = m[0].length, s = 4; cvs.width = w * s; cvs.height = h * s; var g = cvs.getContext('2d');
  g.fillStyle = id === 'towers' ? '#3f5a34' : id === 'core' ? '#0b1a22' : '#2a2f36'; g.fillRect(0, 0, w * s, h * s);
  var C = { 1: '#6b7684', 2: '#f5c518', 3: '#aeb6c1', 4: '#38d9f5', 5: '#5f8a76', 6: '#c9c1b4', 7: '#a16207' };
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var t = CODE[m[y][x]]; if (t) { g.fillStyle = C[t]; g.fillRect(x * s, y * s, s, s); } }
}
function statRows(w) {
  var dps = w.melee ? 0 : (w.dmg * (w.pel || 1) * (w.burst || 1)) / w.rate, rpm = w.melee ? 60 / w.rate : (w.burst ? 60 / w.rate * w.burst : 60 / w.rate);
  var rows = [['Damage', w.dmg * (w.pel || 1), 200, (w.pel ? w.pel + '×' + w.dmg : w.dmg), '#ef4444'], ['Fire rate', rpm, 1300, Math.round(rpm) + ' rpm', '#f59e0b'], ['Magazine', w.mag || 150, 150, w.mag ? w.mag : '∞', '#22c55e'], ['Reload', w.rel ? 5 - w.rel : 5, 5, w.rel ? w.rel.toFixed(1) + ' s' : '—', '#38bdf8'], ['Range', w.melee ? 3 : w.rng, 220, w.melee ? 'melee' : w.rng + ' m', '#a78bfa'], ['Accuracy', w.melee ? 1 : 1 - clamp(w.spr / 0.12, 0, 1), 1, w.melee ? '—' : Math.round((1 - clamp(w.spr / 0.12, 0, 1)) * 100) + '%', '#e879f9'], ['Mobility', w.move, 1.12, Math.round(w.move * 100) + '%', '#94a3b8']];
  return '<div class="arstat">' + rows.map(function (r) { return '<span>' + r[0] + '</span><i><em style="width:' + Math.round(clamp(r[1] / r[2], 0.03, 1) * 100) + '%;background:' + r[4] + '"></em></i><b>' + r[3] + '</b>'; }).join('') + '</div>' + (w.melee ? '' : '<p class="arsmall" style="margin:8px 0 0">About ' + Math.round(dps) + ' damage per second if every shot lands' + (w.head > 1 ? ', ×' + w.head + ' for headshots' : '') + '.</p>');
}

/* ---------- setup screen: Play and Shop tabs ---------- */
var setupTab = 'play', shopSel = null;
function setup() {
  stopGame(); stopPreview(); var c = store(), tracks = API.tracks();
  root.innerHTML = ''; var S = el('div', 'arsetup'); root.appendChild(S); var W = el('div', 'arwrap'); S.appendChild(W);
  var L = lvlInfo(c.cxp);
  W.appendChild(el('div', 'arhd', '<div><h1>CRITICAL CLASH 3D</h1><p>Blocky arena shooter against AI bots. Every kill asks a question with a 30-second timer. Answer right to level up your weapon, earn coins and unlock better guns.</p></div><button type="button" class="arx" data-a="x">✕ Exit</button>'));
  W.appendChild(el('div', 'arwallet', '<div><span>Coins</span><b>🪙 ' + fmt(c.coins) + '</b></div><div><span>Clash level</span><b>' + L.lv + '</b><i><em style="width:' + Math.round(L.into / L.need * 100) + '%"></em></i></div><div><span>Guns owned</span><b>' + c.owned.length + ' / ' + SHOP.length + '</b></div><div><span>Match me skill</span><b>' + Math.round(c.skill * 100) + '%</b></div><div><span>Wins</span><b>' + (c.rec.wins || 0) + '</b></div>'));
  var tabs = el('div', 'artabs', '<button type="button" class="artab" data-tab="play" aria-selected="' + (setupTab === 'play') + '">▶ Play</button><button type="button" class="artab" data-tab="shop" aria-selected="' + (setupTab === 'shop') + '">🛒 Gun shop</button>'); W.appendChild(tabs);
  var body = el('div'); W.appendChild(body);
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; setupTab = b.dataset.tab; setup(); });
  S.querySelector('[data-a=x]').onclick = close;
  if (setupTab === 'shop') { shopUI(body, c); return; }
  var G2 = el('div', 'argrid'); body.appendChild(G2);
  var Lf = el('div'), Rt = el('div'); Lf.style.cssText = Rt.style.cssText = 'display:flex;flex-direction:column;gap:14px;min-width:0'; G2.appendChild(Lf); G2.appendChild(Rt);
  var md = el('section', 'arcard'); md.innerHTML = '<h2>Mode</h2><div class="archips" data-k="mode"><button type="button" class="archip" data-md="gun">🔫 Gun game <small>answer to upgrade</small></button><button type="button" class="archip" data-md="dm">💥 Deathmatch <small>your guns</small></button></div><div data-k="modeopt" style="margin-top:10px"></div>'; Lf.appendChild(md);
  var cs = el('section', 'arcard'); cs.innerHTML = '<h2>Questions from</h2><div class="archips" data-k="track"></div><div style="height:10px"></div><div class="archips" data-k="lv"></div><p class="arsmall" data-k="qinfo" style="margin:10px 0 0"></p><label class="arsmall" style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" data-k="only"> Only lessons I\'ve done</label>'; Lf.appendChild(cs);
  var ms = el('section', 'arcard'); ms.innerHTML = '<h2>Map</h2><div class="armaps"></div>'; Lf.appendChild(ms);
  var bs = el('section', 'arcard'); bs.innerHTML = '<h2>Bots</h2><div class="arbots"></div><div class="arrow" style="margin-top:8px"><button type="button" class="arbtn" data-a="add">+ Add bot</button><span class="arsmall">Set all:</span><button type="button" class="archip" data-all="auto" style="padding:6px 10px;font-size:13px;border-color:#22d3ee55">Match me</button>' + Object.keys(DIFF).map(function (k) { return '<button type="button" class="archip" data-all="' + k + '" style="padding:6px 10px;font-size:13px;border-color:' + DIFF[k].col + '55">' + DIFF[k].n + '</button>'; }).join('') + '</div><p class="arsmall" style="margin:8px 0 0"><b style="color:#22d3ee">Match me</b> bots get better as you get kills and easier when they keep beating you. They remember your level between matches.</p>'; Rt.appendChild(bs);
  var gs = el('section', 'arcard'); gs.innerHTML = '<h2>Settings</h2><div class="archips" data-k="gfx"><button type="button" class="archip" data-gfx="high">High graphics</button><button type="button" class="archip" data-gfx="medium">Medium</button><button type="button" class="archip" data-gfx="low">Low (faster)</button></div><div class="arsl"><span class="arsmall">Mouse speed</span><input type="range" min="1" max="10" step="1" data-k="sens" aria-label="Mouse speed"><b data-k="sensv"></b></div><div class="arsl"><span class="arsmall">Field of view</span><input type="range" min="65" max="100" step="1" data-k="fov" aria-label="Field of view"><b data-k="fovv"></b></div><div class="arkeys" style="margin-top:12px"><kbd>WASD</kbd><span>Move</span><kbd>Space</kbd><span>Jump (you can jump onto crates and barriers)</span><kbd>Mouse</kbd><span>Look. Left-click shoots, right-click aims</span><kbd>R</kbd><span>Reload</span><kbd>Q / scroll</kbd><span>Swap gun (deathmatch)</span><kbd>1–4</kbd><span>Answer questions</span><kbd>Tab</kbd><span>Scoreboard</span><kbd>Esc</kbd><span>Pause</span></div>'; Rt.appendChild(gs);
  var go = el('div', 'arrow'); go.innerHTML = '<button type="button" class="arbtn go" data-a="go">▶ Start match</button><span class="arsmall" data-k="tip"></span>'; body.appendChild(go);
  function q(s) { return S.querySelector(s); }
  function paint() {
    [].forEach.call(q('[data-k=mode]').querySelectorAll('[data-md]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.md === c.mode)); });
    if (c.mode === 'gun') q('[data-k=modeopt]').innerHTML = '<div class="archips" data-k="ladder"><button type="button" class="archip" data-ld="full">Full ladder <small>10 weapons</small></button><button type="button" class="archip" data-ld="quick">Quick <small>5</small></button><button type="button" class="archip" data-ld="mega">Mega <small>13, every gun</small></button><button type="button" class="archip" data-ld="mine"' + (c.owned.length < 3 ? ' disabled title="Buy at least 3 guns first"' : '') + '>My guns <small>' + (c.owned.length < 3 ? 'buy 3 to unlock' : (c.owned.length + 1) + ' weapons') + '</small></button></div><p class="arsmall" style="margin:8px 0 0">Kill, answer right, get the next gun. First kill with the golden control rod wins.</p>';
    else q('[data-k=modeopt]').innerHTML = '<div class="arrow"><span class="arsmall">Your gun</span><select data-k="primary" aria-label="Your gun">' + c.owned.slice().reverse().map(function (k) { return '<option value="' + k + '"' + (k === c.primary ? ' selected' : '') + '>' + G[k].n + '</option>'; }).join('') + '</select>' + (c.primary !== 'pistol' ? '<span class="arsmall">+ Geiger pistol</span>' : '') + '</div><div class="archips" style="margin-top:8px" data-k="dmk">' + [10, 15, 25].map(function (n) { return '<button type="button" class="archip" data-dmk="' + n + '" aria-pressed="' + (n === c.dmKills) + '">First to ' + n + '</button>'; }).join('') + '</div><p class="arsmall" style="margin:8px 0 0">Answer right after a kill for bonus coins, full health and ammo. Buy better guns in the shop.</p>';
    var ld = q('[data-k=ladder]'); if (ld) [].forEach.call(ld.querySelectorAll('[data-ld]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.ld === c.ladder)); });
    var tr = tracks.filter(function (t) { return t.id === c.track; })[0] || tracks[0];
    q('[data-k=track]').innerHTML = tracks.map(function (t) { return '<button type="button" class="archip" data-tr="' + t.id + '" aria-pressed="' + (t.id === c.track) + '">' + t.ic + ' ' + esc(t.name) + '</button>'; }).join('');
    if (tr) {
      var lv = tr.levels.filter(function (l) { return l.lv === c.lv; })[0]; if (!lv || !lv.q) { var f = tr.levels.filter(function (l) { return l.q; })[0]; c.lv = f ? f.lv : 1; }
      q('[data-k=lv]').innerHTML = tr.levels.map(function (l) { return '<button type="button" class="archip arlv" data-lv="' + l.lv + '" aria-pressed="' + (l.lv === c.lv) + '"' + (l.q ? '' : ' disabled') + '>Level ' + l.lv + '<small>' + l.done + '/' + l.tot + ' lessons done</small></button>'; }).join('');
      var qs = qpool(c), all = API.questions(c.track, c.lv).length;
      q('[data-k=qinfo]').textContent = qs.length + ' question' + (qs.length === 1 ? '' : 's') + ' in the mix' + (c.onlyDone && qs.length < all ? ' (from the lessons you\'ve done)' : '') + (c.onlyDone && poolDoneLen(c) < 6 && all ? '. You haven\'t done enough lessons here yet, so it uses the whole level.' : '.');
    }
    q('[data-k=only]').checked = !!c.onlyDone;
    q('.armaps').innerHTML = Object.keys(MAPS).map(function (k) { return '<button type="button" class="armap" data-map="' + k + '" aria-pressed="' + (k === c.map) + '"><canvas></canvas><b>' + MAPS[k].n + '</b><span>' + MAPS[k].d + '</span></button>'; }).join('');
    [].forEach.call(q('.armaps').querySelectorAll('.armap'), function (b) { mapPreview(b.getAttribute('data-map'), b.querySelector('canvas')); });
    q('.arbots').innerHTML = c.bots.map(function (d, i) { return '<div class="arbot"><i style="background:' + BOTCOL[i % BOTCOL.length] + '"></i><b>' + BOTNAMES[i] + '</b><select data-bot="' + i + '" aria-label="' + BOTNAMES[i] + ' difficulty"><option value="auto"' + (d === 'auto' ? ' selected' : '') + '>Match me</option>' + Object.keys(DIFF).map(function (k) { return '<option value="' + k + '"' + (k === d ? ' selected' : '') + '>' + DIFF[k].n + '</option>'; }).join('') + '</select><button type="button" data-rm="' + i + '" aria-label="Remove ' + BOTNAMES[i] + '"' + (c.bots.length <= 1 ? ' disabled' : '') + '>✕</button></div>'; }).join('');
    q('[data-a=add]').disabled = c.bots.length >= 7;
    [].forEach.call(q('[data-k=gfx]').querySelectorAll('[data-gfx]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.gfx === c.gfx)); });
    q('[data-k=sens]').value = c.sens; q('[data-k=sensv]').textContent = c.sens; q('[data-k=fov]').value = c.fov; q('[data-k=fovv]').textContent = c.fov + '°';
    var cheap = SHOP.filter(function (k) { return c.owned.indexOf(k) < 0 && G[k].price <= c.coins && G[k].lvl <= L.lv; });
    q('[data-k=tip]').textContent = cheap.length ? 'You can afford the ' + G[cheap[cheap.length - 1]].n + '! Have a look in the gun shop.' : 'Coins: 10 a kill, 15 a right answer, 100 for a win.';
    q('[data-a=go]').disabled = !qpool(c).length; wr(c);
  }
  S.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.tab || b.dataset.a === 'x') return;
    if (b.dataset.a === 'go') { start(c); return; }
    if (b.dataset.a === 'add') { if (c.bots.length < 7) c.bots.push(c.bots[c.bots.length - 1] || 'auto'); }
    if (b.dataset.md) c.mode = b.dataset.md; if (b.dataset.tr) c.track = b.dataset.tr; if (b.dataset.lv) c.lv = +b.dataset.lv; if (b.dataset.map) c.map = b.dataset.map;
    if (b.dataset.rm != null && c.bots.length > 1) c.bots.splice(+b.dataset.rm, 1); if (b.dataset.all) c.bots = c.bots.map(function () { return b.dataset.all; });
    if (b.dataset.ld) c.ladder = b.dataset.ld; if (b.dataset.gfx) c.gfx = b.dataset.gfx; if (b.dataset.dmk) c.dmKills = +b.dataset.dmk;
    paint();
  });
  S.addEventListener('change', function (e) { var t = e.target; if (t.dataset.bot != null) { c.bots[+t.dataset.bot] = t.value; paint(); } if (t.dataset.k === 'only') { c.onlyDone = t.checked; paint(); } if (t.dataset.k === 'primary') { c.primary = t.value; paint(); } });
  S.addEventListener('input', function (e) { var k = e.target.dataset.k; if (k === 'sens') { c.sens = +e.target.value; q('[data-k=sensv]').textContent = c.sens; wr(c); } if (k === 'fov') { c.fov = +e.target.value; q('[data-k=fovv]').textContent = c.fov + '°'; wr(c); } });
  paint(); try { q('[data-a=go]').focus({ preventScroll: true }); } catch (e) {}
}
/* ---------- the shop, with a spinning 3D preview ---------- */
var PV = null;
function stopPreview() { if (PV) { cancelAnimationFrame(PV.raf); try { disposeTree(PV.scene); if (PV.env) PV.env.dispose(); PV.r.dispose(); PV.r.forceContextLoss(); } catch (e) {} PV = null; } }
function shopUI(body, c) {
  if (!shopSel || !G[shopSel]) shopSel = c.primary || 'pistol';
  var L = lvlInfo(c.cxp), box = el('div', 'arshop'); body.appendChild(box);
  var left = el('div', 'arprev', '<canvas aria-label="3D preview of the gun"></canvas><div class="arpi"></div>'), right = el('div', 'arcard'); box.appendChild(left); box.appendChild(right);
  right.innerHTML = '<h2>Guns</h2><div class="argunlist"></div><p class="arsmall" style="margin:10px 0 0">Better guns unlock as your Clash level goes up (you\'re level ' + L.lv + '). Earn Clash XP and coins in every match: kills, right answers and wins. Your gun is used in deathmatch and in the "My guns" gun-game ladder.</p>';
  previewInit(left.querySelector('canvas'));
  function paint() {
    var w = G[shopSel], own = c.owned.indexOf(shopSel) >= 0, locked = L.lv < w.lvl, afford = c.coins >= w.price;
    left.querySelector('.arpi').innerHTML = '<h3 style="color:' + w.col + '">' + w.n + '</h3><p>' + w.d + '</p>' + statRows(w) + '<div class="arrow" style="margin-top:12px">' + (own ? (c.primary === shopSel ? '<span class="archip" style="border-color:#22c55e">✓ Your deathmatch gun</span>' : '<button type="button" class="arbtn go" data-buy="eq">Use this gun</button>') : locked ? '<span class="archip" style="border-color:#ef4444">🔒 Unlocks at Clash level ' + w.lvl + '</span>' + (afford ? '' : '<span class="arsmall">and costs 🪙 ' + fmt(w.price) + '</span>') : '<button type="button" class="arbtn go" data-buy="buy"' + (afford ? '' : ' disabled') + '>Buy for 🪙 ' + fmt(w.price) + '</button>' + (afford ? '' : '<span class="arsmall">You need ' + fmt(w.price - c.coins) + ' more coins.</span>')) + '</div>';
    right.querySelector('.argunlist').innerHTML = SHOP.map(function (k) { var g = G[k], o = c.owned.indexOf(k) >= 0, lk = L.lv < g.lvl; return '<button type="button" class="argun" data-g="' + k + '" aria-pressed="' + (k === shopSel) + '" style="--gc:' + g.col + '">' + (c.primary === k ? '<span class="eq">IN USE</span>' : '') + '<b>' + g.n + '</b><small class="' + (o ? 'own' : lk ? 'lock' : '') + '">' + (o ? '✓ Owned' : lk ? '🔒 Level ' + g.lvl + ' · 🪙 ' + fmt(g.price) : '🪙 ' + fmt(g.price)) + '</small><small>' + (g.pel ? g.pel + '×' + g.dmg : g.dmg) + ' dmg · ' + g.mag + ' mag · ' + g.rel.toFixed(1) + ' s reload</small></button>'; }).join('');
    previewGun(shopSel);
  }
  box.addEventListener('click', function (e) {
    var g = e.target.closest('[data-g]'); if (g) { shopSel = g.dataset.g; paint(); return; }
    var b = e.target.closest('[data-buy]'); if (!b) return; var w = G[shopSel];
    if (b.dataset.buy === 'buy' && c.coins >= w.price && L.lv >= w.lvl && c.owned.indexOf(shopSel) < 0) { audio(); c.coins -= w.price; c.owned.push(shopSel); c.owned = SHOP.filter(function (k) { return c.owned.indexOf(k) >= 0; }); c.primary = shopSel; wr(c); snd('coin'); setup(); return; }
    if (b.dataset.buy === 'eq') { c.primary = shopSel; wr(c); paint(); }
  });
  paint();
}
function makeEnv(r) {
  var s = new THREE.Scene(), pm = new THREE.PMREMGenerator(r);
  function lm(c, k, side) { return new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: side || THREE.FrontSide }); }
  s.add(new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), lm('#2c3442', 1, THREE.BackSide)));
  var a = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.5), lm('#ffffff', 6)); a.position.set(0, 3.9, 0); a.rotation.x = Math.PI / 2; s.add(a);
  var b = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), lm('#9ec5ff', 3)); b.position.set(-5.9, 1, -1); b.rotation.y = Math.PI / 2; s.add(b);
  var c = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), lm('#ffd9a8', 3)); c.position.set(5.9, 1, 2); c.rotation.y = -Math.PI / 2; s.add(c);
  var f = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lm('#5a4c3c', 1.2)); f.rotation.x = -Math.PI / 2; f.position.y = -3.9; s.add(f);
  var t = pm.fromScene(s, 0.04).texture; pm.dispose(); disposeTree(s); return t;
}
function previewInit(cv) {
  stopPreview(); if (!window.THREE) return; var r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  var sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.05, 50); cam.position.set(0, 0.32, 2.5); cam.lookAt(0, -0.06, 0);
  var env = makeEnv(r); sc.environment = env;
  sc.add(new THREE.HemisphereLight('#dfe8ff', '#202838', 0.8)); var dl = new THREE.DirectionalLight('#ffffff', 2); dl.position.set(2, 3, 2); sc.add(dl); var dl2 = new THREE.DirectionalLight('#7aa7ff', 1.4); dl2.position.set(-2, 1, -2); sc.add(dl2);
  var disc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.64, 0.05, 48), std({ color: '#141c2b', roughness: 0.4, metalness: 0.6 })); disc.position.y = -0.5; sc.add(disc);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.006, 6, 72), new THREE.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: 0.55 })); ring.rotation.x = Math.PI / 2; ring.position.y = -0.47; sc.add(ring);
  PV = { r: r, scene: sc, cam: cam, env: env, raf: 0, holder: null, ring: ring };
  function fr(t) { if (!PV || PV.r !== r) return; var w = cv.clientWidth, h = cv.clientHeight, pr = r.getPixelRatio(); if (w && (cv.width !== Math.round(w * pr) || cv.height !== Math.round(h * pr))) { r.setSize(w, h, false); cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix(); } if (PV.holder) { PV.holder.rotation.y = -Math.PI / 2 + Math.sin(t * 0.0006) * 0.75; PV.holder.rotation.x = Math.sin(t * 0.0004) * 0.06; PV.holder.position.y = Math.sin(t * 0.0015) * 0.03; } r.render(sc, cam); PV.raf = requestAnimationFrame(fr); }
  PV.raf = requestAnimationFrame(fr);
}
function previewGun(key) {
  if (!PV) return; if (PV.holder) { PV.scene.remove(PV.holder); disposeTree(PV.holder); }
  var gun = buildGun(key), bb = new THREE.Box3().setFromObject(gun.g), ctr = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), holder = new THREE.Group();
  gun.g.position.sub(ctr); holder.add(gun.g); holder.scale.setScalar(1.55 / Math.max(sz.x, sz.y, sz.z)); PV.scene.add(holder); PV.holder = holder; PV.ring.material.color.set(G[key].col);
}

/* ============================================================ 3D helpers ============================================================ */
var TXC = null, ANISO = 4;
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function speck(g, w, h, n, a) { for (var i = 0; i < n; i++) { g.fillStyle = (Math.random() < 0.5 ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + (Math.random() * a).toFixed(3) + ')'; var s = 1 + Math.random() * 2.5; g.fillRect(Math.random() * w, Math.random() * h, s, s); } }
function canvases() {
  if (TXC) return TXC; TXC = {}; var c, g, i, gr, rg;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#9aa1aa'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, 5000, 0.07); gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.07)'); gr.addColorStop(1, 'rgba(0,0,0,.16)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(30,34,40,.5)'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke(); g.fillStyle = 'rgba(25,28,34,.55)'; [[16, 16], [240, 16], [16, 112], [240, 112], [16, 144], [240, 144], [16, 240], [240, 240]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 4, 0, 6.3); g.fill(); }); TXC.concrete = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#1d2026'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#f5c518'; for (i = -256; i < 512; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 32, 0); g.lineTo(i + 32 - 256, 256); g.lineTo(i - 256, 256); g.fill(); } speck(g, 256, 256, 3000, 0.12); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, 256, 14); g.fillRect(0, 242, 256, 14); TXC.hazard = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#66707d'; g.fillRect(0, 0, 256, 256); for (i = 0; i < 256; i += 2) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')'; g.fillRect(0, i, 256, 1); } g.strokeStyle = 'rgba(20,24,30,.6)'; g.lineWidth = 3; g.strokeRect(6, 6, 244, 244); g.strokeRect(6, 6, 244, 120); g.fillStyle = '#c0392b'; g.fillRect(180, 150, 50, 22); g.fillStyle = '#fff'; g.font = 'bold 14px sans-serif'; g.fillText('HOT', 189, 166); TXC.metal = c;
  c = cv(128, 128); g = c.getContext('2d'); g.fillStyle = '#2a333c'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#0b0f13'; for (var y = 4; y < 128; y += 16) for (var x = 4; x < 128; x += 16) g.fillRect(x, y, 10, 10); g.strokeStyle = 'rgba(120,140,160,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126); speck(g, 128, 128, 800, 0.1); TXC.grate = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#868b90'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, 7000, 0.06); g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); TXC.floorc = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#5a8a3a'; g.fillRect(0, 0, 256, 256); for (i = 0; i < 9000; i++) { g.fillStyle = 'hsla(' + (85 + Math.random() * 30) + ',' + (35 + Math.random() * 25) + '%,' + (26 + Math.random() * 22) + '%,.8)'; g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 3 + Math.random() * 3); } TXC.grass = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#a8763f'; g.fillRect(0, 0, 256, 256); for (i = 0; i < 256; i += 32) { g.fillStyle = i % 64 ? '#956434' : '#b07f45'; g.fillRect(0, i, 256, 30); for (var k = 0; k < 40; k++) { g.fillStyle = 'rgba(60,35,15,.25)'; g.fillRect(Math.random() * 256, i + Math.random() * 30, 30 + Math.random() * 60, 1); } } g.strokeStyle = '#5c3b1c'; g.lineWidth = 16; g.strokeRect(8, 8, 240, 240); g.beginPath(); g.moveTo(16, 16); g.lineTo(240, 240); g.stroke(); TXC.crate = c;
  c = cv(256, 128); g = c.getContext('2d'); g.fillStyle = '#e8b81c'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#c49612'; g.fillRect(0, 18, 256, 6); g.fillRect(0, 104, 256, 6); speck(g, 256, 128, 1500, 0.1); [64, 192].forEach(function (cx) { g.fillStyle = '#111'; g.beginPath(); g.arc(cx, 64, 7, 0, 6.3); g.fill(); for (var a = 0; a < 3; a++) { g.beginPath(); g.moveTo(cx, 64); g.arc(cx, 64, 30, a * 2.094 - 0.52 - 1.57, a * 2.094 + 0.52 - 1.57); g.fill(); } g.fillStyle = '#e8b81c'; g.beginPath(); g.arc(cx, 64, 11, 0, 6.3); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(cx, 64, 6, 0, 6.3); g.fill(); }); TXC.drum = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#a69c8e'; g.fillRect(0, 0, 256, 256); for (var yy = 0; yy < 256; yy += 32) { var off = (yy / 32) % 2 ? 32 : 0; for (var xx = -64; xx < 256; xx += 64) { g.fillStyle = 'hsl(30,' + (10 + Math.random() * 10) + '%,' + (52 + Math.random() * 12) + '%)'; g.fillRect(xx + off + 2, yy + 2, 60, 28); } } speck(g, 256, 256, 3000, 0.08); TXC.brick = c;
  c = cv(256, 256); g = c.getContext('2d'); g.fillStyle = '#3f6b57'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#355b4a'; for (i = 20; i < 256; i += 40) g.fillRect(0, i, 256, 18); g.fillStyle = '#1b2a24'; for (i = 0; i < 6; i++) g.fillRect(150, 30 + i * 12, 80, 5); g.fillStyle = '#f5c518'; g.fillRect(0, 236, 256, 20); g.fillStyle = '#111'; for (i = 0; i < 256; i += 24) g.fillRect(i, 236, 12, 20); speck(g, 256, 256, 2500, 0.08); TXC.machine = c;
  c = cv(128, 256); g = c.getContext('2d'); gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#b9f6ff'); gr.addColorStop(0.5, '#2fd2f2'); gr.addColorStop(1, '#0a5873'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256); g.strokeStyle = 'rgba(4,30,44,.85)'; g.lineWidth = 6; for (i = 0; i < 128; i += 32) g.strokeRect(i + 3, 3, 26, 250); TXC.glow = c;
  c = cv(256, 512); g = c.getContext('2d'); g.fillStyle = '#d2cfc8'; g.fillRect(0, 0, 256, 512); for (i = 0; i < 400; i++) { g.fillStyle = 'rgba(80,75,70,' + (Math.random() * 0.12) + ')'; g.fillRect(Math.random() * 256, Math.random() * 512, 2, 20 + Math.random() * 120); } for (i = 0; i < 512; i += 64) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, i, 256, 2); } g.fillStyle = 'rgba(190,40,40,.85)'; g.fillRect(0, 470, 256, 10); g.fillRect(0, 488, 256, 10); TXC.tower = c;
  c = cv(64, 64); g = c.getContext('2d'); rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(10,10,10,.95)'); rg.addColorStop(0.45, 'rgba(20,20,20,.8)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64); TXC.hole = c;
  c = cv(128, 128); g = c.getContext('2d'); rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.25, 'rgba(255,230,160,.9)'); rg.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,240,200,.9)'; g.lineWidth = 6; for (i = 0; i < 6; i++) { var an = i / 6 * Math.PI * 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(an) * 62, 64 + Math.sin(an) * 62); g.stroke(); } TXC.flash = c;
  c = cv(128, 128); g = c.getContext('2d'); rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.4, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); TXC.glowdot = c;
  c = cv(128, 128); g = c.getContext('2d'); for (i = 0; i < 18; i++) { rg = g.createRadialGradient(30 + Math.random() * 68, 30 + Math.random() * 68, 0, 64, 64, 30 + Math.random() * 30); rg.addColorStop(0, 'rgba(235,235,235,.22)'); rg.addColorStop(1, 'rgba(235,235,235,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); } TXC.smoke = c;
  TXC.faces = [];
  for (var f = 0; f < 6; f++) {
    c = cv(128, 128); g = c.getContext('2d'); g.fillStyle = '#111'; g.strokeStyle = '#111'; g.lineCap = 'round';
    if (f === 3) { g.fillStyle = '#0b0b0b'; g.fillRect(24, 40, 80, 22); g.fillStyle = '#4b5563'; g.fillRect(28, 44, 30, 12); g.fillRect(70, 44, 30, 12); } else { var ey = f === 4 ? 46 : 48; g.beginPath(); g.ellipse(44, ey, 7, f === 2 ? 4 : 11, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(84, ey, 7, f === 2 ? 4 : 11, 0, 0, 6.3); g.fill(); if (f === 4) { g.lineWidth = 5; g.beginPath(); g.moveTo(34, 30); g.lineTo(52, 36); g.moveTo(94, 30); g.lineTo(76, 36); g.stroke(); } }
    g.lineWidth = 6; g.beginPath(); if (f === 1) { g.moveTo(46, 84); g.quadraticCurveTo(70, 92, 88, 76); } else if (f === 4) { g.moveTo(48, 88); g.lineTo(82, 86); } else if (f === 5) { g.arc(64, 82, 10, 0, 6.3); } else { g.arc(64, 70, 24, 0.35, Math.PI - 0.35); } g.stroke();
    TXC.faces.push(c);
  }
  return TXC;
}
var TEXCACHE = {};
function T(name, rx, ry) { var k = name + ':' + (rx || 1) + ':' + (ry || 1); if (TEXCACHE[k]) return TEXCACHE[k]; var t = new THREE.CanvasTexture(canvases()[name]); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.anisotropy = ANISO; TEXCACHE[k] = t; return t; }
function TF(i) { var k = 'face' + i; if (TEXCACHE[k]) return TEXCACHE[k]; var t = new THREE.CanvasTexture(canvases().faces[i]); t.colorSpace = THREE.SRGBColorSpace; TEXCACHE[k] = t; return t; }
function std(o) { return new THREE.MeshStandardMaterial(o); }
var MC = {};
function mat(o) { var k = Object.keys(o).sort().map(function (key) { var v = o[key]; return key + '=' + (v && v.isTexture ? v.uuid : v && v.isColor ? v.getHexString() : String(v)); }).join('|'); return MC[k] || (MC[k] = std(o)); }
function mergeGeos(list) {
  var np = 0, ni = 0; list.forEach(function (g) { np += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
  var hasC = list.every(function (g) { return g.attributes.color; }), col = hasC ? new Float32Array(np * 3) : null;
  var pos = new Float32Array(np * 3), nor = new Float32Array(np * 3), uv = new Float32Array(np * 2), idx = np > 65535 ? new Uint32Array(ni) : new Uint16Array(ni), po = 0, io = 0;
  list.forEach(function (g) { var c = g.attributes.position.count, i; pos.set(g.attributes.position.array, po * 3); if (g.attributes.normal) nor.set(g.attributes.normal.array, po * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, po * 2); if (hasC) col.set(g.attributes.color.array, po * 3); if (g.index) { var a = g.index.array; for (i = 0; i < a.length; i++) idx[io++] = a[i] + po; } else for (i = 0; i < c; i++) idx[io++] = po + i; po += c; });
  var m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); if (hasC) m.setAttribute('color', new THREE.BufferAttribute(col, 3)); m.setIndex(new THREE.BufferAttribute(idx, 1)); m.computeBoundingSphere(); return m;
}
function colGeo(geo, c) { c = c && c.isColor ? c : new THREE.Color(c); var n = geo.attributes.position.count, a = new Float32Array(n * 3); for (var i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; }
function canMerge(n) { return n.isMesh && !n.isInstancedMesh && !Array.isArray(n.material) && !n.material.transparent && !n.material.isShaderMaterial && n.material.visible !== false && !n.userData.keep; }
/* fewer draw calls: meshes inside a group that share a material become one mesh */
function mergeGroup(g) {
  var by = {};
  g.children.slice().forEach(function (n) { if (!canMerge(n)) return; n.updateMatrix(); var k = n.material.uuid + (n.castShadow ? 's' : ''); (by[k] = by[k] || { m: n.material, cs: n.castShadow, list: [] }).list.push(n); });
  Object.keys(by).forEach(function (k) { var gp = by[k]; if (gp.list.length < 2) return; var geos = gp.list.map(function (n) { var c = n.geometry.clone(); c.applyMatrix4(n.matrix); n.geometry.dispose(); g.remove(n); return c; }); var mm = new THREE.Mesh(mergeGeos(geos), gp.m); mm.castShadow = gp.cs; geos.forEach(function (c) { c.dispose(); }); g.add(mm); });
  return g;
}
/* the whole static world: merge every mesh by material. Originals are kept (detached) so bullets can still hit them precisely. */
function mergeStatic(sc) {
  sc.updateMatrixWorld(true); var by = {};
  sc.traverse(function (n) { if (!canMerge(n)) return; var k = n.material.uuid + (n.castShadow ? 's' : '') + (n.receiveShadow ? 'r' : ''); (by[k] = by[k] || { m: n.material, cs: n.castShadow, rs: n.receiveShadow, list: [] }).list.push(n); });
  st.detached = [];
  Object.keys(by).forEach(function (k) { var gp = by[k]; if (gp.list.length < 2) return; var geos = gp.list.map(function (n) { var c = n.geometry.clone(); c.applyMatrix4(n.matrixWorld); n.parent.remove(n); st.detached.push(n); return c; }); var mm = new THREE.Mesh(mergeGeos(geos), gp.m); mm.castShadow = gp.cs; mm.receiveShadow = gp.rs; geos.forEach(function (c) { c.dispose(); }); sc.add(mm); });
}
function disposeTree(o) { if (!o) return; o.traverse(function (n) { if (n.geometry) n.geometry.dispose(); if (n.material) { (Array.isArray(n.material) ? n.material : [n.material]).forEach(function (m) { m.dispose(); }); } }); }
function clearTexCache() { Object.keys(TEXCACHE).forEach(function (k) { try { TEXCACHE[k].dispose(); } catch (e) {} }); TEXCACHE = {}; }
function box(w, h, d, mat, x, y, z, parent, rx, ry, rz) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); if (parent) parent.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, parent, rx, ry, rz, seg) { var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), mat); m.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); if (parent) parent.add(m); return m; }

/* ---------- gun models (forward is -Z, origin on the barrel line) ---------- */
function buildGun(key) {
  var w = G[key], g = new THREE.Group(), accent = new THREE.Color(w.col);
  var dark = std({ color: '#2a2f38', roughness: 0.38, metalness: 0.75 }), mid = std({ color: '#454e5e', roughness: 0.45, metalness: 0.55 }), grip = std({ color: '#1b1e24', roughness: 0.85 }), wood = std({ color: '#8a5528', roughness: 0.6 }), acc = std({ color: accent, roughness: 0.32, metalness: 0.35, emissive: accent, emissiveIntensity: 0.22 }), gold = std({ color: '#f5c542', roughness: 0.22, metalness: 1, emissive: '#b8860b', emissiveIntensity: 0.5 });
  var tip = new THREE.Object3D(), spin = null, sight = 0.1, fg = -0.3, P = Math.PI / 2;
  switch (w.kind) {
    case 'pistol': box(0.07, 0.07, 0.27, dark, 0, 0.06, -0.07, g); box(0.064, 0.05, 0.22, mid, 0, 0.015, -0.05, g); box(0.058, 0.16, 0.08, grip, 0, -0.07, 0.04, g, 0.25); box(0.073, 0.012, 0.2, acc, 0, 0.098, -0.07, g); cyl(0.012, 0.012, 0.04, dark, 0, 0.06, -0.22, g, P); box(0.012, 0.02, 0.012, dark, 0, 0.105, -0.19, g); tip.position.set(0, 0.06, -0.25); sight = 0.1; fg = 0; break;
    case 'smg': box(0.08, 0.1, 0.36, mid, 0, 0.04, -0.12, g); box(0.05, 0.022, 0.3, dark, 0, 0.1, -0.12, g); box(0.05, 0.17, 0.06, dark, 0, -0.08, -0.13, g, -0.15); box(0.058, 0.14, 0.07, grip, 0, -0.05, 0.05, g, 0.3); cyl(0.02, 0.02, 0.16, dark, 0, 0.04, -0.38, g, P); box(0.082, 0.014, 0.28, acc, 0, 0.062, -0.13, g); box(0.05, 0.06, 0.18, dark, 0, 0.03, 0.14, g); tip.position.set(0, 0.04, -0.47); sight = 0.115; fg = -0.24; break;
    case 'shotgun': cyl(0.023, 0.023, 0.82, dark, 0, 0.065, -0.4, g, P); cyl(0.02, 0.02, 0.6, dark, 0, 0.02, -0.33, g, P); box(0.075, 0.075, 0.22, wood, 0, 0.025, -0.42, g); box(0.08, 0.1, 0.22, mid, 0, 0.055, 0, g); box(0.06, 0.11, 0.32, wood, 0, 0.0, 0.25, g, 0.1); box(0.055, 0.13, 0.06, grip, 0, -0.04, 0.08, g, 0.3); box(0.082, 0.014, 0.2, acc, 0, 0.11, 0, g); tip.position.set(0, 0.065, -0.82); sight = 0.1; fg = -0.42; break;
    case 'rifle': case 'burst': box(0.08, 0.12, 0.42, mid, 0, 0.05, -0.08, g); box(0.075, 0.09, 0.3, w.kind === 'burst' ? acc : dark, 0, 0.05, -0.43, g); cyl(0.014, 0.014, 0.2, dark, 0, 0.05, -0.68, g, P); box(0.055, 0.19, 0.08, dark, 0, -0.08, -0.08, g, 0.28); box(0.06, 0.11, 0.26, dark, 0, 0.03, 0.22, g); box(0.055, 0.13, 0.065, grip, 0, -0.045, 0.06, g, 0.3); box(0.035, 0.05, 0.09, dark, 0, 0.135, -0.05, g); box(0.04, 0.03, 0.03, acc, 0, 0.15, -0.1, g); box(0.082, 0.014, 0.36, acc, 0, 0.095, -0.12, g); if (w.kind === 'burst') box(0.03, 0.06, 0.24, mid, 0, 0.16, -0.14, g); tip.position.set(0, 0.05, -0.79); sight = w.kind === 'burst' ? 0.19 : 0.155; fg = -0.42; break;
    case 'revolver': box(0.06, 0.085, 0.18, mid, 0, 0.05, -0.04, g); cyl(0.048, 0.048, 0.085, dark, 0, 0.05, -0.04, g, P, 0, 0, 10); box(0.036, 0.042, 0.28, mid, 0, 0.074, -0.24, g); box(0.055, 0.15, 0.07, wood, 0, -0.05, 0.07, g, 0.35); box(0.038, 0.012, 0.26, gold, 0, 0.1, -0.24, g); tip.position.set(0, 0.074, -0.39); sight = 0.11; fg = 0; break;
    case 'lmg': box(0.11, 0.13, 0.5, mid, 0, 0.05, -0.08, g); box(0.09, 0.1, 0.34, dark, 0, 0.05, -0.48, g); cyl(0.02, 0.02, 0.3, dark, 0, 0.05, -0.78, g, P); box(0.14, 0.13, 0.14, acc, 0.06, -0.06, -0.05, g); box(0.06, 0.12, 0.3, dark, 0, 0.02, 0.28, g); box(0.055, 0.13, 0.065, grip, 0, -0.05, 0.1, g, 0.3); box(0.06, 0.03, 0.2, dark, 0, 0.13, -0.1, g); cyl(0.01, 0.01, 0.18, dark, 0.04, -0.06, -0.58, g, 0.4); cyl(0.01, 0.01, 0.18, dark, -0.04, -0.06, -0.58, g, 0.4); tip.position.set(0, 0.05, -0.94); sight = 0.15; fg = -0.45; break;
    case 'sniper': box(0.07, 0.1, 0.42, mid, 0, 0.05, -0.05, g); cyl(0.016, 0.021, 0.78, dark, 0, 0.06, -0.62, g, P); cyl(0.028, 0.028, 0.07, dark, 0, 0.06, -1.03, g, P); cyl(0.036, 0.036, 0.34, dark, 0, 0.155, -0.08, g, P); cyl(0.03, 0.03, 0.01, std({ color: '#38bdf8', emissive: '#0ea5e9', emissiveIntensity: 1, roughness: 0.1 }), 0, 0.155, -0.255, g, P); box(0.065, 0.13, 0.36, acc, 0, 0.02, 0.27, g); box(0.055, 0.12, 0.06, grip, 0, -0.05, 0.08, g, 0.3); tip.position.set(0, 0.06, -1.07); sight = 0.155; fg = -0.4; break;
    case 'mini': box(0.15, 0.17, 0.34, mid, 0, 0.02, 0.02, g); spin = new THREE.Group(); spin.position.set(0, 0.02, -0.42); for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; cyl(0.016, 0.016, 0.62, dark, Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0, spin, P); } cyl(0.075, 0.075, 0.04, mid, 0, 0, -0.2, spin, P); cyl(0.075, 0.075, 0.04, mid, 0, 0, 0.12, spin, P); g.add(spin); box(0.12, 0.14, 0.16, acc, 0.12, -0.03, 0.04, g); box(0.04, 0.04, 0.2, dark, 0, 0.13, 0.0, g); tip.position.set(0, 0.02, -0.75); sight = 0.17; fg = -0.25; break;
    case 'rocket': var olive = std({ color: '#5d6b3d', roughness: 0.65, metalness: 0.2 }); cyl(0.1, 0.1, 1.0, olive, 0, 0.08, -0.15, g, P, 0, 0, 20); cyl(0.13, 0.1, 0.12, dark, 0, 0.08, 0.4, g, P, 0, 0, 20); cyl(0.11, 0.11, 0.05, acc, 0, 0.08, -0.62, g, P, 0, 0, 20); box(0.04, 0.08, 0.12, dark, 0.11, 0.18, -0.08, g); box(0.05, 0.14, 0.07, grip, 0, -0.07, 0.08, g, 0.2); box(0.05, 0.12, 0.07, grip, 0, -0.06, -0.3, g, 0.1); cyl(0.0, 0.07, 0.16, std({ color: '#b91c1c', roughness: 0.5 }), 0, 0.08, -0.72, g, -P, 0, 0, 16); tip.position.set(0, 0.08, -0.7); sight = 0.21; fg = -0.3; break;
    case 'rail': box(0.09, 0.12, 0.5, mid, 0, 0.05, -0.08, g); box(0.025, 0.08, 0.7, dark, 0.035, 0.06, -0.6, g); box(0.025, 0.08, 0.7, dark, -0.035, 0.06, -0.6, g); box(0.02, 0.03, 0.66, std({ color: '#a5f3fc', emissive: '#22d3ee', emissiveIntensity: 2.2, roughness: 0.2 }), 0, 0.06, -0.6, g); for (var r2 = 0; r2 < 4; r2++) cyl(0.07, 0.07, 0.03, acc, 0, 0.06, -0.35 - r2 * 0.14, g, P); box(0.06, 0.12, 0.3, dark, 0, 0.03, 0.27, g); box(0.055, 0.12, 0.06, grip, 0, -0.05, 0.08, g, 0.3); cyl(0.034, 0.034, 0.26, dark, 0, 0.17, -0.06, g, P); tip.position.set(0, 0.06, -0.96); sight = 0.17; fg = -0.4; break;
    case 'laser': box(0.1, 0.12, 0.4, mid, 0, 0.05, -0.05, g); cyl(0.05, 0.05, 0.22, std({ color: '#c026d3', transparent: true, opacity: 0.55, emissive: '#a21caf', emissiveIntensity: 1 }), 0, 0.06, -0.3, g, P); cyl(0.025, 0.025, 0.22, std({ color: '#f5d0fe', emissive: '#e879f9', emissiveIntensity: 2.4, roughness: 0.2 }), 0, 0.06, -0.3, g, P); cyl(0.035, 0.05, 0.22, dark, 0, 0.06, -0.52, g, P); cyl(0.06, 0.06, 0.02, acc, 0, 0.06, -0.63, g, P); box(0.06, 0.12, 0.26, dark, 0, 0.03, 0.24, g); box(0.055, 0.12, 0.06, grip, 0, -0.05, 0.08, g, 0.3); box(0.08, 0.014, 0.3, acc, 0, 0.115, -0.05, g); tip.position.set(0, 0.06, -0.66); sight = 0.14; fg = -0.32; break;
    case 'rod': cyl(0.045, 0.045, 1.15, gold, 0, 0.46, 0, g, 0, 0, 0, 20); cyl(0.06, 0.06, 0.26, grip, 0, -0.18, 0, g); for (var b2 = 0; b2 < 4; b2++) cyl(0.052, 0.052, 0.02, dark, 0, 0.1 + b2 * 0.25, 0, g); cyl(0.07, 0.045, 0.08, gold, 0, 1.06, 0, g); tip.position.set(0, 1.05, 0); sight = 0.2; fg = 0; break;
  }
  if (spin) mergeGroup(spin); mergeGroup(g); g.add(tip);
  return { g: g, tip: tip, spin: spin, sight: sight, fg: fg, key: key };
}

/* ---------- blocky characters: one vertex-coloured material each, merged per moving part (few draw calls) ---------- */
function makeChar(o) {
  var cm = std({ vertexColors: true, roughness: 0.7, metalness: 0.05 }), rootG = new THREE.Group(), body = new THREE.Group(); rootG.add(body);
  function M(geo, col, x, y, z, parent, rx, ry, rz) { var m = new THREE.Mesh(colGeo(geo, col), cm); m.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; parent.add(m); return m; }
  function B(w, h, d, col, x, y, z, parent, rx, ry, rz) { return M(new THREE.BoxGeometry(w, h, d), col, x, y, z, parent, rx, ry, rz); }
  function C(rt, rb, h, col, x, y, z, parent, rx, ry, rz, seg) { return M(new THREE.CylinderGeometry(rt, rb, h, seg || 16), col, x, y, z, parent, rx, ry, rz); }
  function limb(px, py, w, h, col, hand) { var p = new THREE.Group(); p.position.set(px, py, 0); B(w, h, w, col, 0, -h / 2 + 0.02, 0, p); if (hand) B(0.36, 0.2, 0.36, o.skin, 0, -0.74, 0, p); body.add(p); return p; }
  var legL = limb(-0.2, 0.84, 0.38, 0.84, o.pants), legR = limb(0.2, 0.84, 0.38, 0.84, o.pants);
  B(0.4, 0.06, 0.42, '#111827', -0.2, 0.06, -0.02, legL); B(0.4, 0.06, 0.42, '#111827', 0.2, 0.06, -0.02, legR);
  var trunk = new THREE.Group(); body.add(trunk);
  B(0.8, 0.84, 0.42, o.shirt, 0, 1.26, 0, trunk); B(0.82, 0.08, 0.44, '#111827', 0, 0.88, 0, trunk); B(0.16, 0.16, 0.02, '#facc15', -0.2, 1.42, -0.22, trunk); B(0.3, 0.05, 0.02, '#e5e7eb', 0.18, 1.5, -0.22, trunk);
  var armL = limb(-0.6, 1.64, 0.38, 0.82, o.shirt, 1), armR = limb(0.6, 1.64, 0.38, 0.82, o.shirt, 1); armL.rotation.order = 'YXZ'; armR.rotation.order = 'YXZ';
  var head = new THREE.Group(); head.position.set(0, 1.93, 0); body.add(head);
  C(0.27, 0.27, 0.46, o.skin, 0, 0, 0, head, 0, 0, 0, 20);
  var face = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: TF(o.face), transparent: true, depthWrite: false })); face.position.set(0, 0, -0.272); face.rotation.y = Math.PI; face.userData.keep = 1; head.add(face);
  var dome = function (r, y, tl, col, sy) { var m = M(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, tl || Math.PI / 2), col, 0, y, 0, head); if (sy) m.scale.y = sy; return m; };
  if (o.hat === 'hard') { dome(0.31, 0.2, 0, '#facc15'); C(0.38, 0.38, 0.03, '#eab308', 0, 0.2, 0, head); B(0.06, 0.06, 0.5, '#eab308', 0, 0.48, 0, head); }
  else if (o.hat === 'cap') { dome(0.29, 0.2, 0, o.shirt); B(0.34, 0.03, 0.24, o.shirt, 0, 0.21, -0.3, head); }
  else if (o.hat === 'helmet') { dome(0.33, 0.12, Math.PI / 1.8, '#4b5563'); B(0.42, 0.12, 0.04, '#7dd3fc', 0, 0.1, -0.31, head); }
  else if (o.hat === 'phones') { M(new THREE.TorusGeometry(0.3, 0.03, 8, 20, Math.PI), '#111827', 0, 0.08, 0, head); C(0.11, 0.11, 0.08, '#111827', -0.3, 0.02, 0, head, 0, 0, Math.PI / 2); C(0.11, 0.11, 0.08, '#ef4444', 0.3, 0.02, 0, head, 0, 0, Math.PI / 2); }
  else if (o.hat === 'beanie') { var bc = pick(['#dc2626', '#0ea5e9', '#16a34a', '#f97316']); dome(0.3, 0.16, 0, bc, 1.15); C(0.3, 0.3, 0.08, bc, 0, 0.17, 0, head); }
  [legL, legR, trunk, armL, armR, head].forEach(mergeGroup);
  var hitM = new THREE.MeshBasicMaterial({ visible: false });
  var hb = box(0.95, 1.72, 0.65, hitM, 0, 0.86, 0, rootG), hh2 = box(0.62, 0.56, 0.62, hitM, 0, 1.97, 0, rootG);
  hb.userData.part = 'body'; hh2.userData.part = 'head';
  var shield = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 14), new THREE.MeshBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); shield.position.y = 1.1; rootG.add(shield);
  var gunHolder = new THREE.Group(); gunHolder.position.set(0, -0.72, -0.12); gunHolder.rotation.x = -Math.PI / 2; armR.add(gunHolder);
  return { root: rootG, body: body, legs: [legL, legR], arms: [armL, armR], head: head, hit: [hb, hh2], mats: [cm], cm: cm, shield: shield, gunHolder: gunHolder, gunKey: null, aim: 0, parts: [legL, legR, trunk, armL, armR, head] };
}
/* a bot's gun: same look, but flattened to the bot's one material */
function flatGun(gm, cm) {
  var olds = [];
  gm.g.traverse(function (n) { if (!n.isMesh) return; var m = n.material, c = m.color.clone(); if (m.emissive && m.emissiveIntensity) c.add(m.emissive.clone().multiplyScalar(m.emissiveIntensity * 0.4)); colGeo(n.geometry, c); olds.push(m); n.material = cm; n.castShadow = true; });
  olds.forEach(function (m) { m.dispose(); });
  if (gm.spin) mergeGroup(gm.spin); mergeGroup(gm.g);
}
function setCharGun(e) {
  var key = wkey(e); if (e.char.gunKey === key) return; e.char.gunKey = key;
  while (e.char.gunHolder.children.length) { var c = e.char.gunHolder.children[0]; e.char.gunHolder.remove(c); c.traverse(function (n) { if (n.geometry) n.geometry.dispose(); }); }
  var gm = buildGun(key); flatGun(gm, e.char.cm); gm.g.scale.setScalar(key === 'rod' ? 1 : 1.25);
  if (key === 'rod') { gm.g.rotation.x = -Math.PI / 2; gm.g.position.set(0, 0, 0.12); } else gm.g.position.set(0, -0.02, -0.1);
  e.char.gunHolder.add(gm.g); e.char.tipObj = gm.tip; e.char.spin = gm.spin;
}

/* ============================================================ the game ============================================================ */
var keys = {}, mouseDown = false, rmb = false;
function stopGame() {
  if (st) { st.over = true; cancelAnimationFrame(st.raf); try { disposeTree(st.scene); disposeTree(st.vm.scene); if (st.env) st.env.dispose(); (st.detached || []).forEach(function (n) { n.geometry.dispose(); }); } catch (e) {} MC = {}; clearTexCache(); }
  st = null;
  document.removeEventListener('keydown', onKey, true); document.removeEventListener('keyup', onKeyUp, true); document.removeEventListener('mousemove', onMouse); document.removeEventListener('pointerlockchange', onLock); document.removeEventListener('mouseup', onUp); window.removeEventListener('resize', resize); window.removeEventListener('wheel', onWheel); window.removeEventListener('blur', onBlur);
  keys = {}; mouseDown = false; rmb = false;
}
function gfxPR(c) { var d = window.devicePixelRatio || 1; return c.gfx === 'high' ? Math.min(d, 2) : c.gfx === 'low' ? Math.min(d, 1) * 0.75 : Math.min(d, 1.25); }
function start(c) {
  stopGame(); stopPreview(); audio(); if (AC && AC.state === 'suspended') AC.resume();
  root.innerHTML = '';
  var canvas = el('canvas', 'arv'), hud = el('canvas', 'arh'); root.appendChild(canvas); root.appendChild(hud);
  killR3();
  try { R3 = new THREE.WebGLRenderer({ canvas: canvas, antialias: c.gfx !== 'low', powerPreference: 'high-performance' }); } catch (e) { fail('Your browser couldn\'t start 3D graphics (WebGL). Try another browser, or turn on hardware acceleration.'); return; }
  R3.outputColorSpace = THREE.SRGBColorSpace; R3.toneMapping = THREE.ACESFilmicToneMapping; R3.toneMappingExposure = 1.05; R3.autoClear = false;
  R3.shadowMap.enabled = c.gfx !== 'low'; R3.shadowMap.type = THREE.PCFSoftShadowMap; R3.setPixelRatio(gfxPR(c));
  ANISO = Math.min(c.gfx === 'high' ? 8 : 4, R3.capabilities.getMaxAnisotropy());
  var M = MAPS[c.map], grid = M.grid.map(function (r) { return r.split('').map(function (ch) { return CODE[ch] || 0; }); });
  var lad = c.ladder === 'mine' && c.owned.length >= 3 ? c.owned.concat(['rod']) : (LADDERS[c.ladder] || LADDERS.full);
  st = { c: c, mode: c.mode, M: M, grid: grid, gw: grid[0].length, gh: grid.length, lad: lad, ents: [], proj: [], feed: [], t: 0, paused: false, q: null, over: false, result: false,
    qs: shuffle(qpool(c)), qi: 0, asked: 0, right: 0, missed: [], xp: 0, coins: 0, cxp: 0, shots: 0, hits: 0, kills: 0, deaths: 0, heads: 0, skill: c.skill, slow: 0, shake: 0,
    burstLeft: 0, burstT: 0, bob: 0, recoil: 0, adsT: 0, swapT: 0, spin: 0, stepT: 0, swing: 0, popups: [], dnums: [], hitT: 0, headT: 0, dmgT: 0, dmgFrom: 0, banner: null, startT: performance.now(), canvas: canvas, hud: hud, hg: hud.getContext('2d'), solids: [], fps: [], dmEnd: c.mode === 'dm' ? 360 : 0, lastSwap: 0 };
  st.scene = new THREE.Scene(); st.camera = new THREE.PerspectiveCamera(c.fov, 1, 0.05, 700); st.camera.rotation.order = 'YXZ';
  MC = {}; st.env = makeEnv(R3);
  buildWorld(); buildFX(); buildVM();
  var me = mkEnt('You', '#fde047', null); me.me = true; st.me = me; st.ents.push(me);
  if (c.mode === 'dm') { me.slots = c.primary && c.primary !== 'pistol' && c.owned.indexOf(c.primary) >= 0 ? [c.primary, 'pistol'] : ['pistol']; me.slot = 0; }
  c.bots.forEach(function (d, i) { var b = mkEnt(BOTNAMES[i], BOTCOL[i % BOTCOL.length], d); if (c.mode === 'dm') b.slots = [botGun(b)]; st.ents.push(b); });
  st.ents.forEach(function (e) { if (!e.me) { e.char = makeChar({ shirt: e.col, pants: pick(PANTS), skin: pick(SKINS), face: Math.floor(Math.random() * 6), hat: pick(HATS) }); st.scene.add(e.char.root); setCharGun(e); } spawn(e); });
  setVMGun(true);
  resize(); window.addEventListener('resize', resize);
  document.addEventListener('keydown', onKey, true); document.addEventListener('keyup', onKeyUp, true); document.addEventListener('mousemove', onMouse); document.addEventListener('pointerlockchange', onLock); document.addEventListener('mouseup', onUp); window.addEventListener('wheel', onWheel, { passive: true }); window.addEventListener('blur', onBlur);
  canvas.addEventListener('mousedown', function (e) { if (!st || st.paused || st.q || st.result) return; if (document.pointerLockElement !== canvas && !st.touch) { lock(); return; } if (e.button === 0) { mouseDown = true; tryFire(); } if (e.button === 2) rmb = true; });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0) touchUI();
  lock(); feed(c.mode === 'dm' ? 'Deathmatch: first to ' + c.dmKills + ' kills!' : 'Gun game: first kill with the golden control rod wins!', '#fde047');
  var last = performance.now();
  function loop(now) {
    if (!st || st.over) return; var rdt = clamp((now - last) / 1000, 0, 0.05); last = now; adapt(rdt);
    var dt = rdt * (st.slow > 0 ? 0.28 : 1);
    if (st.slow > 0) { st.slow -= rdt; if (st.slow <= 0 && st.pendingFinish) { var w = st.pendingFinish; st.pendingFinish = null; results(w, false); } }
    if (!st || st.over) return;
    if (st.manual) { st.raf = requestAnimationFrame(loop); return; }
    if (!st.paused && !st.q && !st.result) update(dt, rdt); else updateFX(rdt);
    render(rdt); st.raf = requestAnimationFrame(loop);
  }
  st.raf = requestAnimationFrame(loop);
}
function adapt(dt) { st.fps.push(dt); if (st.fps.length < 120) return; var a = st.fps.reduce(function (x, y) { return x + y; }, 0) / st.fps.length; st.fps = []; var pr = R3.getPixelRatio(); if (a > 0.036 && pr > 0.6) { R3.setPixelRatio(Math.max(0.6, pr - 0.15)); resize(); } }
function mkEnt(name, col, diff) { return { name: name, col: col, diffKey: diff, D: diff ? diffFor(diff, st.skill) : null, x: 0, z: 0, y: 0, vy: 0, a: 0, pitch: 0, hp: 100, tier: 0, kills: 0, deaths: 0, alive: true, spawned: false, respawn: 0, cd: 0, lastHurt: -9, inv: 0, path: [], tgt: null, seenT: 0, strafe: 1, strafeT: 0, stuckT: 0, moving: false, ph: 0, shootAnim: 0, hurtAnim: 0, burstLeft: 0, burstT: 0, lastAtk: null, ammo: {}, reloadT: 0, autoRel: 0, slots: null, slot: 0, onGround: true }; }
function botGun(b) { var t = b.D.auto ? st.skill : clamp((b.D.acc - 0.16) / 0.44, 0, 1), pool = SHOP.slice(1, 2 + Math.round(t * 9)); return pick(pool); }
function wkey(e) { if (st.mode === 'dm') return e.slots[e.slot] || 'pistol'; return st.lad[Math.min(e.tier, st.lad.length - 1)]; }
function W_(e) { return G[wkey(e)]; }
function isFinal(e) { return st.mode === 'gun' && e.tier === st.lad.length - 1; }
function fillAmmo(e) { if (st.mode === 'dm') e.slots.forEach(function (k) { e.ammo[k] = G[k].mag; }); else e.ammo[wkey(e)] = W_(e).mag; e.reloadT = 0; }
function ammo(e) { var k = wkey(e); if (e.ammo[k] == null) e.ammo[k] = G[k].mag; return e.ammo[k]; }
function lock() { try { if (st && !st.touch && st.canvas.requestPointerLock) { var p = st.canvas.requestPointerLock(); if (p && p.catch) p.catch(function () {}); } } catch (e) {} }
function onLock() { if (!st || st.over) return; if (document.pointerLockElement !== st.canvas && !st.q && !st.paused && !st.result && !st.touch && st.slow <= 0) pauseMenu(); }
function onBlur() { keys = {}; mouseDown = false; rmb = false; }
function resize() { if (!st || !root) return; var w = root.clientWidth, h = root.clientHeight; R3.setSize(w, h, false); st.camera.aspect = w / Math.max(1, h); st.camera.updateProjectionMatrix(); st.vm.cam.aspect = st.camera.aspect; st.vm.cam.updateProjectionMatrix(); var d = Math.min(2, window.devicePixelRatio || 1); st.hud.width = Math.round(w * d); st.hud.height = Math.round(h * d); st.hdpr = d; }
function onMouse(e) { if (!st || st.q || st.paused || st.result || document.pointerLockElement !== st.canvas) return; if (Math.abs(e.movementX) > 250 || Math.abs(e.movementY) > 250) return; var z = st.camera.fov / st.c.fov, s = (0.0009 + st.c.sens * 0.00045) * z; st.me.a -= e.movementX * s; st.me.pitch = clamp(st.me.pitch - e.movementY * s, -1.45, 1.45); st.swayX = (st.swayX || 0) + e.movementX * 0.00025; st.swayY = (st.swayY || 0) + e.movementY * 0.00025; }
function onUp(e) { if (e.button === 0) mouseDown = false; if (e.button === 2) rmb = false; }
function onWheel() { if (st && st.mode === 'dm' && !st.q && !st.paused && st.t - st.lastSwap > 0.25) { st.lastSwap = st.t; swapGun(); } }
function onKey(e) {
  if (!st) return; var k = e.key; e.stopPropagation();
  if (st.q) { if (/^[1-4]$/.test(k) && st.q.q.t !== 'N') { e.preventDefault(); answer(+k - 1); } else if ((k === 'Enter' || k === ' ') && st.q.done) { e.preventDefault(); endQ(); } return; }
  if (st.result) return;
  if (k === 'Escape') { if (st.paused) resume(); else pauseMenu(); e.preventDefault(); return; }
  if (k === 'Tab') { e.preventDefault(); st.board = true; return; }
  if (st.paused) return;
  var kl = k.toLowerCase(); keys[kl] = true;
  if (k === ' ') { e.preventDefault(); jump(); }
  if (kl === 'r') startReload(st.me);
  if (kl === 'q' || ((k === '1' || k === '2') && st.mode === 'dm')) swapGun(k === '1' ? 0 : k === '2' ? 1 : null);
  if (/^Arrow/.test(k)) e.preventDefault();
}
function onKeyUp(e) { if (!st) return; keys[e.key.toLowerCase()] = false; if (e.key === 'Tab') st.board = false; }

/* ---------- grid ---------- */
function cellAt(x, z) { var ix = Math.floor(x / CELL), iz = Math.floor(z / CELL); if (ix < 0 || iz < 0 || ix >= st.gw || iz >= st.gh) return 1; return st.grid[iz][ix]; }
function cellH(x, z) { var ix = Math.floor(x / CELL), iz = Math.floor(z / CELL); if (ix < 0 || iz < 0 || ix >= st.gw || iz >= st.gh) return 99; return st.hgt[iz][ix]; }
function blockedFor(x, z, r, feet, bot) {
  var x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL);
  for (var iz = z0; iz <= z1; iz++) for (var ix = x0; ix <= x1; ix++) { var c = (ix < 0 || iz < 0 || ix >= st.gw || iz >= st.gh) ? 1 : st.grid[iz][ix]; if (!c) continue; if (TALL[c]) return true; if (bot || feet < LOWH[c] - 0.05) return true; }
  return false;
}
function groundAt(x, z, r) { var gnd = 0, x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL); for (var iz = z0; iz <= z1; iz++) for (var ix = x0; ix <= x1; ix++) { if (ix < 0 || iz < 0 || ix >= st.gw || iz >= st.gh) continue; var c = st.grid[iz][ix]; if (LOWH[c]) gnd = Math.max(gnd, LOWH[c]); } return gnd; }
function moveEnt(e, dx, dz, bot) { var r = bot ? 0.42 : PR; if (!blockedFor(e.x + dx, e.z, r, e.y, bot)) e.x += dx; if (!blockedFor(e.x, e.z + dz, r, e.y, bot)) e.z += dz; }
function los(ax, az, bx, bz) { var dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz), n = Math.ceil(d / CELL * 5); for (var i = 1; i < n; i++) { var c = cellAt(ax + dx * i / n, az + dz * i / n); if (TALL[c]) return false; } return true; }
function spawn(e) {
  var best = null, bd = -1;
  for (var t = 0; t < 50; t++) { var ix = Math.floor(rnd(1, st.gw - 1)), iz = Math.floor(rnd(1, st.gh - 1)); if (st.grid[iz][ix]) continue; var x = (ix + 0.5) * CELL, z = (iz + 0.5) * CELL, md = 999; st.ents.forEach(function (o) { if (o !== e && o.alive && o.spawned) md = Math.min(md, Math.hypot(o.x - x, o.z - z)); }); if (md > bd) { bd = md; best = [x, z]; } }
  if (!best) best = [CELL * 1.5, CELL * 1.5];
  e.x = best[0]; e.z = best[1]; e.y = 0; e.vy = 0; e.hp = 100; e.alive = true; e.spawned = true; e.inv = 1.6; e.path = []; e.tgt = null; e.pitch = 0; e.reloadT = 0; e.burstLeft = 0;
  var cx = st.gw * CELL / 2, cz = st.gh * CELL / 2; e.a = Math.atan2(-(cx - e.x), -(cz - e.z));
  if (e.char) { e.char.root.visible = true; e.char.root.position.set(e.x, 0, e.z); e.char.root.rotation.y = e.a; e.char.body.position.set(0, 0, 0); }
  fillAmmo(e);
}
function bfs(sx, sz, tx, tz) {
  var W = st.gw, H = st.gh, s = Math.floor(sz / CELL) * W + Math.floor(sx / CELL), goal = Math.floor(tz / CELL) * W + Math.floor(tx / CELL), prev = new Int32Array(W * H).fill(-2), q = [s], qi = 0; prev[s] = -1;
  while (qi < q.length) { var c = q[qi++]; if (c === goal) break; var cx = c % W, cy = (c / W) | 0; for (var d = 0; d < 4; d++) { var nx = cx + [1, -1, 0, 0][d], ny = cy + [0, 0, 1, -1][d]; if (nx < 0 || ny < 0 || nx >= W || ny >= H || st.grid[ny][nx]) continue; var n = ny * W + nx; if (prev[n] !== -2) continue; prev[n] = c; q.push(n); } }
  if (prev[goal] === -2) return []; var p = [], c2 = goal; while (c2 !== -1 && c2 !== s) { p.push([((c2 % W) + 0.5) * CELL, (((c2 / W) | 0) + 0.5) * CELL]); c2 = prev[c2]; } return p.reverse();
}
function randFloor() { for (var t = 0; t < 80; t++) { var x = Math.floor(rnd(1, st.gw - 1)), z = Math.floor(rnd(1, st.gh - 1)); if (!st.grid[z][x]) return [(x + 0.5) * CELL, (z + 0.5) * CELL]; } return [1.5 * CELL, 1.5 * CELL]; }

/* ============================================================ world ============================================================ */
function buildWorld() {
  var M = st.M, sc = st.scene, gw = st.gw, gh = st.gh, WW = gw * CELL, HH = gh * CELL, cx = WW / 2, cz = HH / 2, hi = st.c.gfx, G2 = st.grid;
  st.hgt = G2.map(function (row, z) { return row.map(function (c, x) { var edge = x === 0 || z === 0 || x === gw - 1 || z === gh - 1; return c === 1 ? (edge ? M.outer : M.inner) : c === 3 ? M.inner : c === 4 ? 3.45 : c === 5 ? 2.4 : c === 6 ? 13 : LOWH[c] || 0; }); });
  sc.background = new THREE.Color(M.bg); sc.fog = new THREE.Fog(M.fog[0], M.fog[1], M.fog[2]);
  if (M.sky) {
    var sky = new THREE.Mesh(new THREE.SphereGeometry(520, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { top: { value: new THREE.Color(M.sky[0]) }, bot: { value: new THREE.Color(M.sky[1]) } }, vertexShader: 'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform vec3 top;uniform vec3 bot;varying vec3 vp;void main(){float h=clamp(vp.y*1.4+0.05,0.0,1.0);gl_FragColor=vec4(mix(bot,top,pow(h,0.75)),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
    sky.position.set(cx, 0, cz); sky.renderOrder = -1; sc.add(sky);
    var sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('glowdot'), color: '#fff3c4', blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sun.scale.set(80, 80, 1); var sd = new THREE.Vector3().fromArray(M.sun[2]).normalize(); sun.position.set(cx + sd.x * 420, sd.y * 420, cz + sd.z * 420); sc.add(sun);
    cloudLayer();
  }
  sc.add(new THREE.HemisphereLight(M.hemi[0], M.hemi[1], M.hemi[2]));
  var dl = new THREE.DirectionalLight(M.sun[0], M.sun[1]), dv = new THREE.Vector3().fromArray(M.sun[2]).normalize(); dl.position.set(cx + dv.x * 80, dv.y * 80, cz + dv.z * 80); dl.target.position.set(cx, 0, cz); sc.add(dl); sc.add(dl.target);
  if (hi !== 'low') { dl.castShadow = true; var sh = dl.shadow; sh.mapSize.set(hi === 'high' ? 4096 : 2048, hi === 'high' ? 4096 : 2048); var ext = Math.max(WW, HH) * 0.62; sh.camera.left = -ext; sh.camera.right = ext; sh.camera.top = ext; sh.camera.bottom = -ext; sh.camera.near = 1; sh.camera.far = 240; sh.bias = -0.0004; sh.normalBias = 0.03; }
  /* floor */
  var floorMat = M.floor === 'grass' ? mat({ map: T('grass', gw * 1.5, gh * 1.5), roughness: 0.95 }) : M.floor === 'grate' ? mat({ map: T('grate', gw * 2, gh * 2), roughness: 0.55, metalness: 0.45 }) : mat({ map: T('floorc', gw, gh), roughness: 0.5, metalness: 0.05 });
  var fl = new THREE.Mesh(new THREE.PlaneGeometry(WW, HH), floorMat); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0, cz); fl.receiveShadow = true; sc.add(fl); st.solids.push(fl);
  if (M.floor === 'concrete') { var lineM = new THREE.MeshBasicMaterial({ color: '#d9b310' }); [[cx, 6 * CELL, WW - 2 * CELL, 0.14], [cx, 15 * CELL, WW - 2 * CELL, 0.14]].forEach(function (L) { var m = new THREE.Mesh(new THREE.PlaneGeometry(L[2], L[3]), lineM); m.rotation.x = -Math.PI / 2; m.position.set(L[0], 0.01, L[1]); sc.add(m); }); }
  if (M.floor === 'grass') { var out = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), mat({ map: T('grass', 130, 130), roughness: 1 })); out.rotation.x = -Math.PI / 2; out.position.set(cx, -0.02, cz); out.receiveShadow = true; sc.add(out);
    var road = new THREE.Mesh(new THREE.PlaneGeometry(WW - 2 * CELL, 4), mat({ color: '#6b6f74', roughness: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(cx, 0.012, 18.5 * CELL - 1.5); road.receiveShadow = true; sc.add(road); }
  /* special clusters */
  var used = {}, key = function (x, z) { return x + ',' + z; };
  function ring(x, z, code) { if (G2[z][x] === code) return false; for (var dz = -1; dz <= 1; dz++) for (var dx = -1; dx <= 1; dx++) { if (!dx && !dz) continue; var yy = z + dz, xx = x + dx; if (yy < 0 || xx < 0 || yy >= gh || xx >= gw || G2[yy][xx] !== code) return false; } return true; }
  var x, z, a, b;
  for (z = 1; z < gh - 1; z++) for (x = 1; x < gw - 1; x++) {
    if (ring(x, z, 6)) { for (a = -1; a <= 1; a++) for (b = -1; b <= 1; b++) { used[key(x + a, z + b)] = 1; st.hgt[z + b][x + a] = 13; } G2[z][x] = 6; tower((x + 0.5) * CELL, (z + 0.5) * CELL); }
    else if (ring(x, z, 5)) { for (a = -1; a <= 1; a++) for (b = -1; b <= 1; b++) { used[key(x + a, z + b)] = 1; st.hgt[z + b][x + a] = 4.6; } G2[z][x] = 5; transformer((x + 0.5) * CELL, (z + 0.5) * CELL); }
  }
  for (z = 1; z < gh - 2; z++) for (x = 1; x < gw - 2; x++) { if (G2[z][x] === 5 && G2[z][x + 1] === 5 && G2[z + 1][x] === 5 && G2[z + 1][x + 1] === 5 && !used[key(x, z)] && !used[key(x + 1, z)] && !used[key(x, z + 1)] && !used[key(x + 1, z + 1)]) { [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (o) { used[key(x + o[0], z + o[1])] = 1; st.hgt[z + o[1]][x + o[0]] = 5; }); turbine((x + 1) * CELL, (z + 1) * CELL); } }
  /* instanced boxes per type */
  var groups = {}, rCells = [];
  function addBox(type, h, x, z) { var k = type + ':' + h; (groups[k] = groups[k] || { type: type, h: h, list: [] }).list.push([x, z]); }
  for (z = 0; z < gh; z++) for (x = 0; x < gw; x++) {
    var c = G2[z][x]; if (!c || used[key(x, z)]) continue; var edge = x === 0 || z === 0 || x === gw - 1 || z === gh - 1;
    if (c === 1) addBox(edge ? 'outer' : 'wall', edge ? M.outer : M.inner, x, z);
    else if (c === 2) addBox('hazard', LOWH[2], x, z);
    else if (c === 3) { addBox('metal', M.inner, x, z); pipes(x, z); }
    else if (c === 4) rCells.push([x, z]);
    else if (c === 5) addBox('machine', 2.4, x, z);
    else if (c === 6) addBox('brick', M.inner, x, z);
    else if (c === 7) crate(x, z);
  }
  var MAT = { outer: M.floor === 'grass' ? mat({ map: T('concrete', 1, 0.8), roughness: 0.9 }) : mat({ map: T('concrete', 1, 3), roughness: 0.85 }), wall: mat({ map: T('concrete', 1, M.inner / CELL), roughness: 0.85 }), hazard: mat({ map: T('hazard', 1, 0.5), roughness: 0.6 }), metal: mat({ map: T('metal', 1, M.inner / CELL), roughness: 0.45, metalness: 0.4 }), machine: mat({ map: T('machine', 1, 1), roughness: 0.6, metalness: 0.3 }), brick: mat({ map: T('brick', 1, 1.4), roughness: 0.9 }) };
  var m4 = new THREE.Matrix4();
  Object.keys(groups).forEach(function (k) { var gp = groups[k], geo = new THREE.BoxGeometry(CELL, gp.h, CELL), im = new THREE.InstancedMesh(geo, MAT[gp.type], gp.list.length); gp.list.forEach(function (p, i) { m4.makeTranslation((p[0] + 0.5) * CELL, gp.h / 2, (p[1] + 0.5) * CELL); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; im.castShadow = true; im.receiveShadow = true; sc.add(im); st.solids.push(im); });
  /* wall caps and kick plates for a finished look */
  [['wall:' + M.inner, M.inner], ['outer:' + M.outer, M.outer]].forEach(function (pair) { var gp = groups[pair[0]]; if (!gp) return; var capM = mat({ color: M.floor === 'grass' ? '#8b929b' : '#59616c', roughness: 0.55, metalness: 0.35 }), cg = new THREE.BoxGeometry(CELL + 0.1, 0.18, CELL + 0.1), ci = new THREE.InstancedMesh(cg, capM, gp.list.length), kg = new THREE.BoxGeometry(CELL + 0.06, 0.32, CELL + 0.06), ki = new THREE.InstancedMesh(kg, mat({ color: M.floor === 'grate' ? '#0e7490' : '#3a4250', roughness: 0.6, metalness: 0.3 }), gp.list.length); gp.list.forEach(function (p, i) { m4.makeTranslation((p[0] + 0.5) * CELL, pair[1] + 0.09, (p[1] + 0.5) * CELL); ci.setMatrixAt(i, m4); m4.makeTranslation((p[0] + 0.5) * CELL, 0.16, (p[1] + 0.5) * CELL); ki.setMatrixAt(i, m4); }); ci.castShadow = true; ki.receiveShadow = true; sc.add(ci); sc.add(ki); });
  /* reactor: glowing glass columns, a light per cluster */
  if (rCells.length) {
    var gm = mat({ map: T('glow', 1, 1), emissive: '#ffffff', emissiveMap: T('glow', 1, 1), emissiveIntensity: 1.5, roughness: 0.15, metalness: 0.2 }), rg = new THREE.BoxGeometry(CELL * 0.9, 3.2, CELL * 0.9), ri = new THREE.InstancedMesh(rg, gm, rCells.length);
    rCells.forEach(function (p, i) { m4.makeTranslation((p[0] + 0.5) * CELL, 1.75, (p[1] + 0.5) * CELL); ri.setMatrixAt(i, m4); }); ri.instanceMatrix.needsUpdate = true; sc.add(ri); st.solids.push(ri);
    var frame = mat({ color: '#1f2933', roughness: 0.45, metalness: 0.7 }), fgm = new THREE.BoxGeometry(CELL, 0.32, CELL), fi = new THREE.InstancedMesh(fgm, frame, rCells.length * 2); rCells.forEach(function (p, i) { m4.makeTranslation((p[0] + 0.5) * CELL, 0.16, (p[1] + 0.5) * CELL); fi.setMatrixAt(i * 2, m4); m4.makeTranslation((p[0] + 0.5) * CELL, 3.42, (p[1] + 0.5) * CELL); fi.setMatrixAt(i * 2 + 1, m4); }); fi.castShadow = true; sc.add(fi); st.solids.push(fi);
    var seen = {}, clusters = []; rCells.forEach(function (p) { var k0 = key(p[0], p[1]); if (seen[k0]) return; var cl = [], stack = [p]; seen[k0] = 1; while (stack.length) { var q = stack.pop(); cl.push(q); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = q[0] + d[0], nz = q[1] + d[1], kk = key(nx, nz); if (!seen[kk] && G2[nz] && G2[nz][nx] === 4) { seen[kk] = 1; stack.push([nx, nz]); } }); } clusters.push(cl); });
    st.glows = [];
    clusters.slice(0, 4).forEach(function (cl) { var ax = 0, az = 0; cl.forEach(function (q) { ax += (q[0] + 0.5) * CELL; az += (q[1] + 0.5) * CELL; }); ax /= cl.length; az /= cl.length; var pl = new THREE.PointLight('#38e1ff', 80, 24, 2); pl.position.set(ax, 4.2, az); sc.add(pl); var gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('glowdot'), color: '#22d3ee', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.45 })); gs.scale.set(10, 7, 1); gs.position.set(ax, 2.2, az); sc.add(gs); st.glows.push({ s: gs, l: pl }); });
  }
  /* roof for indoor maps */
  if (M.roof) {
    var roof = new THREE.Mesh(new THREE.PlaneGeometry(WW, HH), mat({ map: T('metal', gw / 2, gh / 2), color: M.floor === 'grate' ? '#2a3b47' : '#7b8594', emissive: M.floor === 'grate' ? '#06121a' : '#1c222b', roughness: 0.85, metalness: 0.2, side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.position.set(cx, M.roof, cz); sc.add(roof);
    var beamM = mat({ color: M.floor === 'grate' ? '#1f2d36' : '#4a5260', roughness: 0.5, metalness: 0.5 }), lampM = new THREE.MeshBasicMaterial({ color: M.floor === 'grate' ? '#7ee7ff' : '#fff3d6' });
    for (var bx = CELL * 2; bx < WW; bx += CELL * 3) box(0.3, 0.6, HH, beamM, bx, M.roof - 0.32, cz, sc);
    for (var lx = CELL * 3.5; lx < WW; lx += CELL * 6) for (var lz = CELL * 3.5; lz < HH; lz += CELL * 6) { box(2.2, 0.1, 0.6, lampM, lx, M.roof - 0.66, lz, sc); var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('glowdot'), color: M.floor === 'grate' ? '#38bdf8' : '#ffe9b8', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 })); gl.scale.set(4.5, 2.2, 1); gl.position.set(lx, M.roof - 0.8, lz); sc.add(gl); }
    if (M.floor === 'concrete') { var crane = mat({ color: '#f59e0b', roughness: 0.45, metalness: 0.4 }); box(0.6, 0.8, HH - 2, crane, CELL * 1.2, M.roof - 1.2, cz, sc); box(0.6, 0.8, HH - 2, crane, WW - CELL * 1.2, M.roof - 1.2, cz, sc); var bridge = box(WW - CELL * 2.4, 0.9, 1.2, crane, cx, M.roof - 1.5, cz - 8, sc); bridge.castShadow = true; box(1.6, 1.2, 1.6, mat({ color: '#374151', roughness: 0.5, metalness: 0.5 }), cx + 6, M.roof - 2.4, cz - 8, sc); cyl(0.04, 0.04, 3.2, mat({ color: '#111827' }), cx + 6, M.roof - 4.4, cz - 8, sc); box(0.7, 0.35, 0.7, mat({ color: '#f5c518', roughness: 0.5 }), cx + 6, M.roof - 6.1, cz - 8, sc); }
  }
  /* scenery around the outdoor map */
  if (M.floor === 'grass') {
    var tmat = mat({ map: T('tower', 3, 1), roughness: 0.95, side: THREE.DoubleSide });
    [[-70, -40, 1.7], [WW + 80, 20, 2.1], [cx + 30, HH + 100, 1.9], [-55, HH + 35, 1.5], [WW + 60, HH + 70, 1.6]].forEach(function (p) { var t = lathe(p[2] * 5.5, tmat); t.position.set(p[0], 0, p[1]); sc.add(t); steam(p[0], p[2] * 5.5 * 4.2, p[1], p[2] * 2.2); });
    var hillM = mat({ color: '#5d7d43', roughness: 1, flatShading: true }); for (var hI = 0; hI < 16; hI++) { var ang = hI / 16 * Math.PI * 2, rr = 250 + Math.random() * 90, hl = new THREE.Mesh(new THREE.ConeGeometry(40 + Math.random() * 45, 22 + Math.random() * 32, 7), hillM); hl.position.set(cx + Math.cos(ang) * rr, 6, cz + Math.sin(ang) * rr); sc.add(hl); }
    var poleM = mat({ color: '#9ca3af', metalness: 0.6, roughness: 0.4 }); for (var pI = 0; pI < 5; pI++) { var py = new THREE.Group(); box(0.5, 26, 0.5, poleM, 0, 13, 0, py); box(10, 0.4, 0.4, poleM, 0, 22, 0, py); box(7, 0.4, 0.4, poleM, 0, 18, 0, py); box(0.3, 26, 0.3, poleM, -1.5, 13, 0, py, 0, 0, 0.06); box(0.3, 26, 0.3, poleM, 1.5, 13, 0, py, 0, 0, -0.06); py.position.set(WW + 40, 0, -40 + pI * 45); py.traverse(function (n) { if (n.isMesh) n.castShadow = true; }); sc.add(py); }
    var treeT = mat({ color: '#6b4423', roughness: 0.9 }), treeL = mat({ color: '#3f7d34', roughness: 0.9, flatShading: true }); for (var tI = 0; tI < 40; tI++) { var tx, tz, tr2 = 20 + Math.random() * 60, ta = Math.random() * Math.PI * 2; tx = cx + Math.cos(ta) * (Math.max(WW, HH) / 2 + tr2); tz = cz + Math.sin(ta) * (Math.max(WW, HH) / 2 + tr2); var tg = new THREE.Group(), s2 = 0.8 + Math.random() * 0.8; cyl(0.25, 0.35, 2.2, treeT, 0, 1.1, 0, tg); var leaf = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.2, 7), treeL); leaf.position.y = 4; tg.add(leaf); var leaf2 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3, 7), treeL); leaf2.position.y = 5.6; tg.add(leaf2); tg.scale.setScalar(s2); tg.position.set(tx, 0, tz); tg.traverse(function (n) { if (n.isMesh) n.castShadow = true; }); sc.add(tg); }
  }
  mergeStatic(sc);
  sc.environment = st.env; sc.traverse(function (n) { if (n.material && n.material.isMeshStandardMaterial) n.material.envMapIntensity = M.env; });
  function lathe(scale, mat) { var pts = []; for (var i = 0; i <= 14; i++) { var t = i / 14, r = 1 + 0.55 * Math.pow((t - 0.62) / 0.62, 2); pts.push(new THREE.Vector2(r * scale * 0.55, t * scale * 4.2)); } var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat); m.castShadow = true; m.receiveShadow = true; return m; }
  function tower(x, z) { var tmat = mat({ map: T('tower', 3, 1), roughness: 0.95, side: THREE.DoubleSide }), t = lathe(CELL * 1.4, tmat); t.scale.y = 0.75; t.position.set(x, 0, z); sc.add(t); st.solids.push(t); steam(x, CELL * 1.4 * 4.2 * 0.75, z, 1.6); var base = box(CELL * 3, 1.0, CELL * 3, mat({ color: '#7d7a73', roughness: 0.9 }), x, 0.5, z, sc); base.receiveShadow = true; base.castShadow = true; st.solids.push(base); }
  function transformer(x, z) { var gp = new THREE.Group(), mm = mat({ map: T('machine', 2, 1), roughness: 0.6, metalness: 0.3 }); var bb = box(CELL * 3 - 0.2, 3.4, CELL * 3 - 0.2, mm, 0, 1.7, 0, gp); st.solids.push(bb); var fins = mat({ color: '#2f4a3d', roughness: 0.6, metalness: 0.3 }); for (var i = -3; i <= 3; i++) { box(0.12, 2.6, 0.5, fins, i * 1.15, 1.6, CELL * 1.5 - 0.05, gp); box(0.12, 2.6, 0.5, fins, i * 1.15, 1.6, -CELL * 1.5 + 0.05, gp); } var ins = mat({ color: '#e5e7eb', roughness: 0.3 }); for (var j = -1; j <= 1; j++) { cyl(0.22, 0.32, 1.2, ins, j * 2.2, 4.0, 0, gp); for (var k = 0; k < 3; k++) cyl(0.38, 0.38, 0.08, ins, j * 2.2, 3.55 + k * 0.32, 0, gp); } var wire = mat({ color: '#1f2937', roughness: 0.6 }); box(5.2, 0.06, 0.06, wire, 0, 4.62, 0, gp); cyl(1.1, 1.1, 0.3, mat({ color: '#111827', roughness: 0.5 }), -CELL * 0.8, 3.55, CELL * 0.8, gp); var warn = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ map: T('hazard', 1, 1) })); warn.position.set(0, 2.2, CELL * 1.5 - 0.09 + 0.2); gp.add(warn); gp.position.set(x, 0, z); gp.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } }); sc.add(gp); }
  function turbine(x, z) { var gp = new THREE.Group(), paint = mat({ color: '#2f8a63', roughness: 0.4, metalness: 0.25 }), steel = mat({ color: '#b8c0cb', roughness: 0.3, metalness: 0.6 }), dark = mat({ color: '#26303a', roughness: 0.6, metalness: 0.4 }), red = mat({ color: '#c0392b', roughness: 0.5 });
    var base = box(CELL * 2 - 0.2, 1.0, CELL * 2 - 0.2, dark, 0, 0.5, 0, gp); st.solids.push(base);
    var casing = cyl(2.05, 2.05, CELL * 2 - 0.8, paint, 0, 2.7, 0, gp, 0, 0, Math.PI / 2, 32); st.solids.push(casing);
    cyl(2.2, 2.2, 0.26, steel, -CELL + 0.55, 2.7, 0, gp, 0, 0, Math.PI / 2, 32); cyl(2.2, 2.2, 0.26, steel, CELL - 0.55, 2.7, 0, gp, 0, 0, Math.PI / 2, 32); cyl(2.1, 2.1, 0.2, red, 0, 2.7, 0, gp, 0, 0, Math.PI / 2, 32);
    cyl(0.5, 0.5, 0.6, steel, CELL - 0.2, 2.7, 0, gp, 0, 0, Math.PI / 2, 20);
    cyl(0.32, 0.32, 2.1, steel, -1.5, 5.4, 0, gp); cyl(0.32, 0.32, 2.1, steel, 1.5, 5.4, 0, gp); cyl(0.32, 0.32, 3.3, steel, 0, 6.45, 0, gp, 0, 0, Math.PI / 2);
    for (var i = -2; i <= 2; i++) box(0.08, 0.5, 4.2, mat({ color: '#f5c518', roughness: 0.5 }), i * 1.1, 1.25, 0, gp);
    gp.position.set(x, 0, z); gp.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } }); sc.add(gp); }
  function pipes(px, pz) { var pm = mat({ color: '#9aa4b2', roughness: 0.3, metalness: 0.6 }), x0 = (px + 0.5) * CELL, z0 = (pz + 0.5) * CELL; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (o) { var p = cyl(0.12, 0.12, M.inner, pm, x0 + o[0] * (CELL / 2 + 0.08), M.inner / 2, z0 + o[1] * (CELL / 2 + 0.08), sc, 0, 0, 0, 10); p.castShadow = true; }); cyl(0.3, 0.3, 0.12, mat({ color: '#dc2626', roughness: 0.5 }), x0, 1.4, z0 - CELL / 2 - 0.08, sc, Math.PI / 2); }
  function crate(px, pz) { var x0 = (px + 0.5) * CELL, z0 = (pz + 0.5) * CELL; if ((px * 7 + pz * 13) % 3) { var cm = mat({ map: T('crate', 1, 1), roughness: 0.8 }), m = box(CELL * 0.86, LOWH[7], CELL * 0.86, cm, x0, LOWH[7] / 2, z0, sc, 0, (Math.random() - 0.5) * 0.25); m.castShadow = true; m.receiveShadow = true; st.solids.push(m); if (Math.random() < 0.45) { var m2 = box(CELL * 0.5, 0.75, CELL * 0.5, cm, x0 + rnd(-0.3, 0.3), LOWH[7] + 0.375, z0 + rnd(-0.3, 0.3), sc, 0, Math.random()); m2.castShadow = true; st.solids.push(m2); } } else { var dm = mat({ map: T('drum', 1, 1), roughness: 0.5, metalness: 0.3 }), top = mat({ color: '#c9a20f', roughness: 0.5, metalness: 0.3 }); [[-0.55, -0.4], [0.5, -0.45], [0, 0.55], [0.6, 0.5]].forEach(function (o, i) { if (i === 3 && Math.random() < 0.5) return; var d = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, LOWH[7], 18, 1, true), dm); d.position.set(x0 + o[0], LOWH[7] / 2, z0 + o[1]); d.castShadow = true; d.receiveShadow = true; sc.add(d); st.solids.push(d); var lid = cyl(0.56, 0.56, 0.04, top, x0 + o[0], LOWH[7] - 0.02, z0 + o[1], sc, 0, 0, 0, 18); lid.receiveShadow = true; st.solids.push(lid); }); } }
  function steam(x, y, z, s) { st.steam = st.steam || []; var sm = new THREE.SpriteMaterial({ map: T('smoke'), color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }); for (var i = 0; i < 10; i++) { var sp = new THREE.Sprite(sm.clone()); sp.userData = { x: x, y: y, z: z, s: s, t: Math.random() * 6 }; sc.add(sp); st.steam.push(sp); } }
  function cloudLayer() { var cm = new THREE.SpriteMaterial({ map: T('smoke'), color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false, fog: false }); for (var i = 0; i < 26; i++) { var a = Math.random() * Math.PI * 2, r = 160 + Math.random() * 260, s = new THREE.Sprite(cm); s.position.set(cx + Math.cos(a) * r, 70 + Math.random() * 70, cz + Math.sin(a) * r); var w = 90 + Math.random() * 120; s.scale.set(w, w * 0.35, 1); sc.add(s); } }
}

/* ============================================================ effects ============================================================ */
function buildFX() {
  var sc = st.scene, F = st.fx = { tracers: [], decals: [], di: 0, booms: [], smoke: [], debris: [], flashes: [], fi: 0, sparks: null };
  var trG = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true); trG.rotateX(Math.PI / 2);
  for (var i = 0; i < 24; i++) { var tm = new THREE.Mesh(trG, new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); tm.visible = false; tm.frustumCulled = false; sc.add(tm); F.tracers.push({ m: tm, t: 0, life: 0.06 }); }
  var dg = new THREE.PlaneGeometry(0.16, 0.16), dm = new THREE.MeshBasicMaterial({ map: T('hole'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  for (i = 0; i < (st.c.gfx === 'low' ? 0 : 60); i++) { var d = new THREE.Mesh(dg, dm); d.visible = false; sc.add(d); F.decals.push(d); }
  var bg = new THREE.SphereGeometry(1, 20, 14);
  for (i = 0; i < 4; i++) { var b = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); b.visible = false; sc.add(b); F.booms.push({ m: b, t: 9, r: 1 }); }
  for (i = 0; i < 44; i++) { var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('smoke'), color: '#9ca3af', transparent: true, opacity: 0, depthWrite: false })); s.visible = false; sc.add(s); F.smoke.push({ s: s, t: 9, life: 1, s0: 1, vy: 1 }); }
  for (i = 0; i < 8; i++) { var fs = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('flash'), color: '#ffe3a1', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); fs.visible = false; fs.scale.set(0.7, 0.7, 1); sc.add(fs); F.flashes.push({ s: fs, t: 0 }); }
  var N = 500, pg = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), col = new Float32Array(N * 3); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.12, map: T('glowdot'), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); pts.frustumCulled = false; sc.add(pts);
  F.sparks = { pts: pts, pos: pos, col: col, vel: new Float32Array(N * 3), life: new Float32Array(N), n: N, i: 0 };
  for (i = 0; i < N; i++) pos[i * 3 + 1] = -999;
  /* lights we switch on and off (never added mid-game, which would recompile every shader) */
  F.muzzleL = new THREE.PointLight('#ffcf6b', 0, 9, 2); sc.add(F.muzzleL);
  F.boomL = [new THREE.PointLight('#ff8a3d', 0, 22, 2), new THREE.PointLight('#ff8a3d', 0, 22, 2)]; F.boomL.forEach(function (l) { l.userData.t = 9; sc.add(l); }); F.bi = 0;
  F.beam = new THREE.Mesh(trG, new THREE.MeshBasicMaterial({ color: '#f0abfc', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); F.beam.visible = false; F.beam.frustumCulled = false; sc.add(F.beam);
}
function tracer(a, b, color, width, life) { var F = st.fx, t = F.tracers.shift(); F.tracers.push(t); var len = a.distanceTo(b); if (len < 0.05) return; t.m.position.copy(a).add(b).multiplyScalar(0.5); t.m.lookAt(b); t.m.scale.set(width || 0.012, width || 0.012, len); t.m.material.color.set(color || '#ffe08a'); t.m.material.opacity = 0.9; t.m.visible = true; t.t = 0; t.life = life || 0.06; }
function sparks(p, n, color, speed, up) { var S = st.fx.sparks, c = new THREE.Color(color || '#ffd27a'); for (var k = 0; k < n; k++) { var i = S.i; S.i = (S.i + 1) % S.n; S.pos[i * 3] = p.x; S.pos[i * 3 + 1] = p.y; S.pos[i * 3 + 2] = p.z; var sp = speed || 5; S.vel[i * 3] = rnd(-1, 1) * sp; S.vel[i * 3 + 1] = rnd(0, 1) * sp * (up || 1); S.vel[i * 3 + 2] = rnd(-1, 1) * sp; S.life[i] = rnd(0.25, 0.5); S.col[i * 3] = c.r; S.col[i * 3 + 1] = c.g; S.col[i * 3 + 2] = c.b; } }
function decal(p, n) { var F = st.fx; if (!F.decals.length) return; var d = F.decals[F.di]; F.di = (F.di + 1) % F.decals.length; d.position.copy(p).addScaledVector(n, 0.012); d.lookAt(p.clone().add(n)); d.visible = true; }
function smoke(p, s, life, col) { var F = st.fx, o = F.smoke.shift(); F.smoke.push(o); o.s.position.copy(p); o.s.material.color.set(col || '#9ca3af'); o.s.material.opacity = 0.6; o.s.visible = true; o.t = 0; o.life = life || 1.2; o.s0 = s || 1; o.s.scale.set(o.s0, o.s0, 1); o.vy = rnd(0.6, 1.4); }
function flashAt(p, s) { var F = st.fx, f = F.flashes[F.fi]; F.fi = (F.fi + 1) % F.flashes.length; f.s.position.copy(p); f.s.material.rotation = Math.random() * 6; f.s.scale.set(s || 0.7, s || 0.7, 1); f.s.visible = true; f.t = 0.05; }
function boom(p, r) { var F = st.fx, b = F.booms.shift(); F.booms.push(b); b.m.position.copy(p); b.m.visible = true; b.t = 0; b.r = r; var L = F.boomL[F.bi]; F.bi = (F.bi + 1) % 2; L.position.copy(p); L.position.y += 0.6; L.intensity = 400; L.userData.t = 0; sparks(p, 60, '#ffb347', 11, 1.4); for (var i = 0; i < 8; i++) smoke(new THREE.Vector3(p.x + rnd(-1, 1), p.y + rnd(0, 1.5), p.z + rnd(-1, 1)), rnd(2, 3.5), rnd(1.2, 2.2), '#6b7280'); var d = Math.hypot(p.x - st.me.x, p.z - st.me.z); st.shake = Math.max(st.shake, clamp(1.4 - d / 14, 0, 1)); }
function breakApart(e, from) {
  var ch = e.char, F = st.fx; if (!ch) return; ch.mats.forEach(function (m) { m.emissive.setRGB(0, 0, 0); }); ch.root.updateMatrixWorld(true);
  var dx = e.x - (from ? from.x : e.x + 1), dz = e.z - (from ? from.z : e.z), dl = Math.hypot(dx, dz) || 1;
  ch.parts.forEach(function (p) { var wp = new THREE.Vector3(), wq = new THREE.Quaternion(); p.getWorldPosition(wp); p.getWorldQuaternion(wq); var clone = p.clone(true); clone.position.copy(wp); clone.quaternion.copy(wq); clone.scale.setScalar(1); st.scene.add(clone); F.debris.push({ o: clone, v: new THREE.Vector3(dx / dl * rnd(2, 5) + rnd(-2, 2), rnd(3, 6), dz / dl * rnd(2, 5) + rnd(-2, 2)), w: new THREE.Vector3(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)), t: 0 }); });
  sparks(new THREE.Vector3(e.x, 1.2, e.z), 24, e.col, 5, 1.2);
  ch.root.visible = false;
}
function updateFX(dt) {
  var F = st.fx, i;
  F.tracers.forEach(function (t) { if (!t.m.visible) return; t.t += dt; t.m.material.opacity = Math.max(0, 0.9 * (1 - t.t / t.life)); if (t.t >= t.life) t.m.visible = false; });
  F.flashes.forEach(function (f) { if (!f.s.visible) return; f.t -= dt; if (f.t <= 0) f.s.visible = false; });
  F.booms.forEach(function (b) { if (!b.m.visible) return; b.t += dt; var k = b.t / 0.45; b.m.scale.setScalar(b.r * (0.25 + k * 0.9)); b.m.material.opacity = Math.max(0, 1 - k); b.m.material.color.setHSL(0.08 - k * 0.05, 1, 0.6 - k * 0.2); if (k >= 1) b.m.visible = false; });
  F.boomL.forEach(function (L) { if (L.intensity > 0) { L.userData.t += dt; L.intensity = Math.max(0, 400 * (1 - L.userData.t / 0.35)); } });
  F.muzzleL.intensity = Math.max(0, F.muzzleL.intensity - dt * 900);
  F.smoke.forEach(function (o) { if (!o.s.visible) return; o.t += dt; var k = o.t / o.life; o.s.position.y += o.vy * dt; var s = o.s0 * (1 + k * 1.6); o.s.scale.set(s, s, 1); o.s.material.opacity = 0.55 * (1 - k); if (k >= 1) o.s.visible = false; });
  var S = F.sparks; for (i = 0; i < S.n; i++) { if (S.life[i] <= 0) continue; S.life[i] -= dt; S.vel[i * 3 + 1] -= 18 * dt; S.pos[i * 3] += S.vel[i * 3] * dt; S.pos[i * 3 + 1] += S.vel[i * 3 + 1] * dt; S.pos[i * 3 + 2] += S.vel[i * 3 + 2] * dt; if (S.pos[i * 3 + 1] < 0.02) { S.pos[i * 3 + 1] = 0.02; S.vel[i * 3 + 1] *= -0.4; } if (S.life[i] <= 0) S.pos[i * 3 + 1] = -999; }
  S.pts.geometry.attributes.position.needsUpdate = true; S.pts.geometry.attributes.color.needsUpdate = true;
  for (i = F.debris.length - 1; i >= 0; i--) { var d = F.debris[i]; d.t += dt; d.v.y -= GRAV * 0.7 * dt; d.o.position.addScaledVector(d.v, dt); d.o.rotation.x += d.w.x * dt; d.o.rotation.y += d.w.y * dt; d.o.rotation.z += d.w.z * dt; if (d.o.position.y < 0.2) { d.o.position.y = 0.2; d.v.y *= -0.35; d.v.x *= 0.7; d.v.z *= 0.7; d.w.multiplyScalar(0.7); } if (d.t > 2.6) d.o.scale.setScalar(Math.max(0.001, 1 - (d.t - 2.6) / 0.6)); if (d.t > 3.2) { st.scene.remove(d.o); F.debris.splice(i, 1); } }
  if (st.steam) st.steam.forEach(function (sp) { var u = sp.userData; u.t += dt; var k = (u.t % 6) / 6; sp.position.set(u.x + Math.sin(u.t * 0.7) * u.s * k * 2, u.y + k * u.s * 14, u.z + Math.cos(u.t * 0.5) * u.s * k); var s = u.s * (3 + k * 9); sp.scale.set(s, s, 1); sp.material.opacity = 0.45 * Math.sin(k * Math.PI); });
  if (st.glows) st.glows.forEach(function (g, j) { var p = Math.sin(st.t * 2 + j * 1.7); g.s.material.opacity = 0.42 + p * 0.08; g.l.intensity = 80 + p * 12; });
}

/* ============================================================ first-person view model ============================================================ */
function buildVM() {
  var V = st.vm = { scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(58, 1, 0.01, 10), flashT: 0, S: 0.52 };
  V.scene.environment = st.env;
  V.scene.add(new THREE.HemisphereLight(st.M.hemi[0], st.M.hemi[1], 1.0)); var dl = new THREE.DirectionalLight('#ffffff', 1.8); dl.position.set(1, 2, 1.5); V.scene.add(dl); var rim = new THREE.DirectionalLight(st.M.floor === 'grate' ? '#38e1ff' : '#9fb7ff', 1.2); rim.position.set(-2, 1, -1); V.scene.add(rim);
  V.root = new THREE.Group(); V.scene.add(V.root); V.holder = new THREE.Group(); V.root.add(V.holder);
  var shirt = std({ color: '#1d4ed8', roughness: 0.85 }), skin = std({ color: '#f5cd30', roughness: 0.6 }), cuff = std({ color: '#1e3a8a', roughness: 0.8 });
  V.armR = new THREE.Group(); box(0.13, 0.13, 0.55, shirt, 0, -0.04, 0.33, V.armR, 0.12); box(0.14, 0.14, 0.05, cuff, 0, -0.01, 0.07, V.armR, 0.12); box(0.12, 0.12, 0.12, skin, 0, -0.02, 0.0, V.armR); V.armR.scale.setScalar(V.S); V.root.add(V.armR);
  V.armL = new THREE.Group(); box(0.11, 0.11, 0.6, shirt, -0.1, -0.06, 0.3, V.armL, 0.25, 0.55); box(0.12, 0.12, 0.05, cuff, -0.02, -0.01, 0.06, V.armL, 0.25, 0.55); box(0.11, 0.1, 0.12, skin, 0, 0, 0, V.armL); V.armL.scale.setScalar(V.S); V.root.add(V.armL);
  V.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('flash'), color: '#ffe3a1', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); V.flash.visible = false; V.flash.scale.set(0.3, 0.3, 1); V.scene.add(V.flash);
  V.scene.traverse(function (n) { if (n.material && n.material.isMeshStandardMaterial) n.material.envMapIntensity = 0.9; });
}
function setVMGun(instant) {
  var V = st.vm, key = wkey(st.me); if (V.key === key) return; V.key = key;
  if (V.gun) { V.holder.remove(V.gun.g); disposeTree(V.gun.g); }
  V.gun = buildGun(key); V.gun.g.scale.setScalar(V.S); V.holder.add(V.gun.g); st.swapT = instant ? 0 : 0.45; st.spin = 0;
  if (key === 'rod') { V.gun.g.rotation.set(-0.55, 0.15, -0.3); V.gun.g.position.set(0.02, -0.08, 0.03); } else { V.gun.g.rotation.set(0, 0, 0); V.gun.g.position.set(0, 0, 0); }
}
function updateVM(dt) {
  var V = st.vm, me = st.me, w = W_(me), gun = V.gun; if (!gun) return;
  var S = V.S, ads = st.adsT, pos = new THREE.Vector3(0.155, -0.15, -0.35).lerp(new THREE.Vector3(0, -gun.sight * S, -0.26), ads);
  if (w.melee) pos.set(0.2, -0.24, -0.34);
  var mv = me.moving && me.onGround ? 1 : 0, bobA = (1 - ads * 0.85);
  pos.x += Math.sin(st.bob) * 0.008 * mv * bobA; pos.y += Math.abs(Math.cos(st.bob)) * 0.009 * mv * bobA - (me.onGround ? 0 : 0.014);
  st.swayX = (st.swayX || 0) * Math.pow(0.0001, dt); st.swayY = (st.swayY || 0) * Math.pow(0.0001, dt); pos.x -= clamp(st.swayX, -0.035, 0.035) * (1 - ads * 0.8); pos.y += clamp(st.swayY, -0.035, 0.035) * (1 - ads * 0.8);
  pos.z += st.recoil * 0.045; var rx = st.recoil * 0.22 * (w.kind === 'sniper' || w.kind === 'rocket' || w.kind === 'rail' ? 1.6 : 1);
  if (me.reloadT > 0 && w.rel) { var dip = Math.sin(clamp(1 - me.reloadT / w.rel, 0, 1) * Math.PI); pos.y -= dip * 0.08; rx -= dip * 0.5; V.holder.rotation.z = dip * 0.6; } else V.holder.rotation.z = 0;
  if (st.swapT > 0) pos.y -= Math.sin(st.swapT / 0.45 * Math.PI / 2) * 0.24;
  if (w.melee && st.swing > 0) { var sk = Math.sin((1 - st.swing / 0.32) * Math.PI); rx -= sk * 1.3; pos.x -= sk * 0.16; pos.z -= sk * 0.1; }
  V.holder.position.copy(pos); V.holder.rotation.x = rx; V.holder.rotation.y = w.melee ? 0 : 0.06 * (1 - ads);
  if (gun.spin) gun.spin.rotation.z += st.spin * dt * 40;
  V.armR.position.set(pos.x + 0.012, pos.y - 0.05, pos.z + 0.07); V.armR.rotation.x = rx * 0.6;
  V.armL.visible = gun.fg < -0.05 && !w.melee; if (V.armL.visible) { V.armL.position.set(pos.x - 0.012, pos.y - 0.02, pos.z + gun.fg * S); V.armL.rotation.set(rx * 0.6, 0, V.holder.rotation.z); }
  V.root.visible = !(w.scope && ads > 0.85) && me.alive;
  if (V.flash.visible) { V.flashT -= dt; if (V.flashT <= 0) V.flash.visible = false; }
}
function muzzleWorld() { var V = st.vm, p = new THREE.Vector3(); if (!V.gun || !V.root.visible) { st.camera.getWorldPosition(p); var d = new THREE.Vector3(); st.camera.getWorldDirection(d); return p.addScaledVector(d, 0.5).add(new THREE.Vector3(0, -0.15, 0)); } V.gun.tip.getWorldPosition(p); var scale = Math.tan(st.camera.fov * Math.PI / 360) / Math.tan(V.cam.fov * Math.PI / 360); p.x *= scale; p.y *= scale; return st.camera.localToWorld(p); }
function flashVM() { var V = st.vm, p = new THREE.Vector3(); V.gun.tip.getWorldPosition(p); V.flash.position.copy(p); V.flash.material.rotation = Math.random() * 6; var k = W_(st.me).kind, s = (k === 'shotgun' || k === 'rocket' ? 0.34 : k === 'rail' ? 0.3 : k === 'pistol' || k === 'revolver' ? 0.17 : 0.22) * V.S; V.flash.scale.set(s, s, 1); V.flash.material.color.set(k === 'rail' ? '#a5f3fc' : '#ffe3a1'); V.flash.visible = true; V.flashT = 0.04; st.fx.muzzleL.position.copy(st.camera.position); st.fx.muzzleL.intensity = 30; }

/* ============================================================ update ============================================================ */
function update(dt, rdt) {
  st.t += dt; var me = st.me;
  if (st.dmEnd) { st.dmEnd -= dt; if (st.dmEnd <= 0) { var lead = st.ents.slice().sort(function (a, b) { return b.kills - a.kills; })[0]; finish(lead, true); return; } }
  st.ents.forEach(function (e) {
    if (e.inv > 0) e.inv -= dt; e.cd -= dt; e.shootAnim = Math.max(0, e.shootAnim - dt); e.hurtAnim = Math.max(0, e.hurtAnim - dt);
    if (e.alive && st.t - e.lastHurt > 4 && e.hp < 100) e.hp = Math.min(100, e.hp + 20 * dt);
    if (e.reloadT > 0) { e.reloadT -= dt; if (e.reloadT <= 0) { e.ammo[wkey(e)] = W_(e).mag; if (e.me) snd('reloaded', 0.7); } }
    if (!e.alive) { e.respawn -= dt; if (e.respawn <= 0) { spawn(e); if (e.me) { st.vm.key = null; setVMGun(true); } } }
  });
  st.dTick = (st.dTick || 0) - dt; if (st.dTick <= 0) { st.dTick = 0.5; st.ents.forEach(function (e) { if (e.D && e.D.auto) e.D = diffFor('auto', st.skill); }); }
  /* player */
  st.swapT = Math.max(0, st.swapT - dt); st.swing = Math.max(0, st.swing - dt);
  var w = W_(me), wantAds = (rmb || st.touchAim) && me.alive && !w.melee && me.reloadT <= 0; st.adsT = clamp(st.adsT + (wantAds ? 1 : -1) * dt * 7, 0, 1);
  if (me.alive) {
    var fw = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0), sw = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), turn = (keys.arrowright ? 1 : 0) - (keys.arrowleft ? 1 : 0);
    if (st.touchMove) { fw = -st.touchMove[1]; sw = st.touchMove[0]; }
    me.a -= turn * 2.4 * dt;
    var sp = SPEED * w.move * (1 - st.adsT * 0.35), sa = Math.sin(me.a), ca = Math.cos(me.a), l = Math.max(1, Math.hypot(fw, sw));
    var vx = (-sa * fw + ca * sw) / l * sp, vz = (-ca * fw - sa * sw) / l * sp;
    if (st.kb) { vx += st.kb.x; vz += st.kb.z; st.kb.x *= Math.pow(0.02, dt); st.kb.z *= Math.pow(0.02, dt); if (Math.abs(st.kb.x) + Math.abs(st.kb.z) < 0.1) st.kb = null; }
    me.moving = Math.abs(fw) + Math.abs(sw) > 0.05; if (me.moving || st.kb) moveEnt(me, vx * dt, vz * dt, false);
    var gnd = groundAt(me.x, me.z, PR);
    if (me.y > gnd + 0.001 || me.vy > 0) { me.vy -= GRAV * dt; me.y += me.vy * dt; if (me.y <= gnd) { if (me.vy < -6) snd('land', 0.7); me.y = gnd; me.vy = 0; me.onGround = true; } else me.onGround = false; } else { me.y = gnd; me.onGround = true; }
    if (me.moving && me.onGround) { st.bob += dt * 10 * w.move; st.stepT -= dt; if (st.stepT <= 0) { st.stepT = 0.36 / w.move; snd('step', 0.6); } }
    if (w.spin) { st.spin = clamp(st.spin + (mouseDown ? 1 : -1) * dt / w.spin, 0, 1); if (mouseDown && st.spin < 1 && !st.spinS) { st.spinS = 1; snd('spin', 0.7); } if (!mouseDown) st.spinS = 0; } else st.spin = 0;
    if (mouseDown && (w.auto || w.beam)) tryFire();
    if (st.burstLeft > 0) { st.burstT -= dt; if (st.burstT <= 0) { if (ammo(me) > 0) { st.burstLeft--; st.burstT = 0.065; me.ammo[wkey(me)]--; fireShot(me, w); } else st.burstLeft = 0; } }
    if (me.autoRel > 0) { me.autoRel -= dt; if (me.autoRel <= 0) startReload(me); }
  }
  st.recoil = Math.max(0, st.recoil - dt * 5); st.hitT = Math.max(0, st.hitT - dt); st.headT = Math.max(0, st.headT - dt); st.dmgT = Math.max(0, st.dmgT - dt); st.shake = Math.max(0, st.shake - dt * 2.2);
  st.ents.forEach(function (e) { if (!e.me && e.alive) bot(e, dt); });
  /* keep bodies apart so nobody stands inside anyone else */
  for (var ai = 0; ai < st.ents.length; ai++) for (var bi = ai + 1; bi < st.ents.length; bi++) { var A = st.ents[ai], Bq = st.ents[bi]; if (!A.alive || !Bq.alive || Math.abs(A.y - Bq.y) > 1.6) continue; var ox = A.x - Bq.x, oz = A.z - Bq.z, od = Math.hypot(ox, oz); if (od < 0.95) { if (od < 0.001) { ox = 1; oz = 0; od = 1; } var push = (0.95 - Math.max(od, 0.001)) * 0.5; moveEnt(A, ox / od * push, oz / od * push, !A.me); moveEnt(Bq, -ox / od * push, -oz / od * push, !Bq.me); } }
  st.ents.forEach(function (e) { if (!e.me) animChar(e, dt); });
  /* rockets */
  for (var i = st.proj.length - 1; i >= 0; i--) {
    var p = st.proj[i]; p.life -= dt; p.m.position.addScaledVector(p.v, dt); var P = p.m.position, hit = P.y < 0.05 || p.life <= 0 || (st.M.roof && P.y > st.M.roof - 0.2) || P.y > 40;
    if (!hit && P.y < cellH(P.x, P.z)) hit = true;
    if (!hit) st.ents.forEach(function (o) { if (o !== p.own && o.alive && Math.hypot(o.x - P.x, o.z - P.z) < 0.7 && P.y > o.y && P.y < o.y + 2.3) hit = true; });
    p.trailT -= dt; if (p.trailT <= 0) { p.trailT = 0.03; smoke(P.clone(), 0.6, 0.7, '#cbd5e1'); sparks(P, 2, '#ffb347', 1.5); }
    if (hit) { explode(p); st.scene.remove(p.m); disposeTree(p.m); st.proj.splice(i, 1); }
  }
  st.feed = st.feed.filter(function (f) { return st.t - f.t < 6; });
  st.popups = st.popups.filter(function (f) { return st.t - f.t < 1.6; }); st.dnums = st.dnums.filter(function (f) { return st.t - f.t < 0.9; });
  if (st.banner && st.t - st.banner.t > 3) st.banner = null;
  updateFX(rdt); updateVM(dt);
}
function jump() { var me = st.me; if (!me.alive || !me.onGround) return; me.vy = JUMPV; me.onGround = false; snd('jump', 0.6); }
function swapGun(to) { var me = st.me; if (st.mode !== 'dm' || me.slots.length < 2 || !me.alive) return; var n = to == null ? (me.slot + 1) % me.slots.length : to; if (n === me.slot || n >= me.slots.length) return; me.slot = n; me.reloadT = 0; st.burstLeft = 0; setVMGun(false); snd('swap', 0.7); }
function startReload(e) { var w = W_(e); if (!w.mag || e.reloadT > 0 || ammo(e) >= w.mag || !e.alive) return; e.reloadT = w.rel * (e.D ? e.D.fire : 1); e.autoRel = 0; if (e.me) { snd('reload', 0.7); st.burstLeft = 0; } }
function tryFire() {
  var me = st.me, w = W_(me); if (!me.alive || st.swapT > 0) return;
  if (w.melee) { if (me.cd > 0) return; me.cd = w.rate; st.swing = 0.32; st.shots++; snd('rod', 0.8); setTimeout(function () { if (st && st.me === me && me.alive && !st.q) melee(me, w); }, 110); return; }
  if (me.reloadT > 0 || me.cd > 0 || st.burstLeft > 0) return;
  if (w.spin && st.spin < 1) return;
  if (ammo(me) <= 0) { snd('empty', 0.8); me.cd = 0.25; startReload(me); return; }
  me.cd = w.rate; me.ammo[wkey(me)]--; if (w.burst) { st.burstLeft = w.burst - 1; st.burstT = 0.065; }
  fireShot(me, w);
  if (ammo(me) <= 0) me.autoRel = 0.3;
}
function fireShot(me, w) {
  st.shots++; st.recoil = Math.min(1.2, st.recoil + (w.kind === 'sniper' || w.kind === 'rail' || w.kind === 'rocket' ? 1 : w.kind === 'shotgun' || w.kind === 'revolver' ? 0.8 : w.beam ? 0.04 : 0.32));
  if (!w.beam) { flashVM(); snd(w.kind, 0.9); } else if (!st.laserS || st.t - st.laserS > 0.09) { st.laserS = st.t; snd('laser', 0.9); }
  me.pitch = clamp(me.pitch + (w.beam ? 0.0005 : w.kind === 'sniper' || w.kind === 'rail' ? 0.035 : w.kind === 'shotgun' || w.kind === 'revolver' || w.kind === 'rocket' ? 0.03 : 0.008) * (1 - st.adsT * 0.4), -1.45, 1.45);
  syncCam(false); var cam = st.camera, mz = muzzleWorld();
  if (w.proj) { var dir = new THREE.Vector3(); cam.getWorldDirection(dir); var rm = rocketMesh(); rm.position.copy(mz).addScaledVector(dir, 0.3); rm.lookAt(rm.position.clone().add(dir)); st.scene.add(rm); st.proj.push({ m: rm, v: dir.multiplyScalar(w.proj), own: me, life: 4, w: w, trailT: 0 }); return; }
  var pel = w.pel || 1, spr = (w.aspr != null ? lerp(w.spr, w.aspr, st.adsT) : w.spr * (1 - st.adsT * 0.55)) * (me.moving ? 1.35 : 1) * (me.onGround ? 1 : 1.6), hitAny = false, headAny = false;
  var tan = Math.tan(cam.fov * Math.PI / 360), rc = st.ray || (st.ray = new THREE.Raycaster());
  var targets = st.solids.slice(); st.ents.forEach(function (o) { if (!o.me && o.alive) { o.char.root.position.set(o.x, o.y, o.z); o.char.root.rotation.y = o.a; o.char.root.updateMatrixWorld(true); targets.push(o.char.hit[0], o.char.hit[1]); } });
  for (var i = 0; i < pel; i++) {
    var ang = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * Math.tan(spr), ndc = new THREE.Vector2(Math.cos(ang) * r / (tan * cam.aspect), Math.sin(ang) * r / tan);
    rc.setFromCamera(ndc, cam); rc.far = w.rng;
    var hits = rc.intersectObjects(targets, false), end = null, hitBots = {};
    for (var h = 0; h < hits.length; h++) {
      var H = hits[h], bot = null; st.ents.forEach(function (o) { if (o.char && (o.char.hit[0] === H.object || o.char.hit[1] === H.object)) bot = o; });
      if (bot) { if (hitBots[bot.name]) continue; hitBots[bot.name] = 1; var head = H.object.userData.part === 'head', fall = w.pel ? clamp(1.25 - H.distance / w.rng, 0.25, 1) : 1, dmg = w.dmg * fall * (head ? w.head : 1); hitAny = true; if (head) headAny = true; sparks(H.point, 6, head ? '#fde047' : '#fca5a5', 3); st.dnums.push({ p: H.point.clone(), v: Math.round(dmg), t: st.t, head: head }); damage(bot, dmg, me, head); end = H.point; if (!w.pierce) break; }
      else { end = H.point; if (H.face) { var n = H.face.normal.clone(); if (!H.object.isInstancedMesh) n.transformDirection(H.object.matrixWorld); decal(H.point, n); sparks(H.point.clone().addScaledVector(n, 0.05), 5, '#ffd27a', 3); } break; }
    }
    if (!end) end = rc.ray.origin.clone().addScaledVector(rc.ray.direction, w.rng);
    if (w.beam) { var F = st.fx; F.beam.position.copy(mz).add(end).multiplyScalar(0.5); F.beam.lookAt(end); F.beam.scale.set(0.035, 0.035, mz.distanceTo(end)); F.beam.material.opacity = 0.9; F.beam.visible = true; st.beamT = 0.08; sparks(end, 2, '#f0abfc', 2); }
    else if (w.kind === 'rail') { tracer(mz, end, '#67e8f9', 0.05, 0.35); for (var s = 0; s < 6; s++) sparks(mz.clone().lerp(end, s / 6), 3, '#a5f3fc', 1); }
    else if (i < 3 || Math.random() < 0.4) tracer(mz, end, '#ffe08a', 0.012, 0.06);
  }
  if (hitAny) { st.hits++; st.hitT = 0.16; if (headAny) { st.headT = 0.25; snd('head', 0.8); } else snd('hit', 0.6); }
}
function rocketMesh() { var rm = new THREE.Group(); cyl(0.07, 0.07, 0.5, std({ color: '#5d6b3d', roughness: 0.6 }), 0, 0, 0, rm, Math.PI / 2); cyl(0, 0.07, 0.18, std({ color: '#b91c1c', roughness: 0.5 }), 0, 0, 0.34, rm, Math.PI / 2); var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: T('glowdot'), color: '#ffb347', blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(0.9, 0.9, 1); gl.position.z = -0.32; rm.add(gl); return rm; }
function melee(me, w) { var best = null, bd = 99; st.ents.forEach(function (o) { if (o.me || !o.alive) return; var d = Math.hypot(o.x - me.x, o.z - me.z), ang = Math.abs(angDiff(me.a, Math.atan2(-(o.x - me.x), -(o.z - me.z)))); if (d < w.melee && ang < 0.7 && d < bd) { bd = d; best = o; } }); if (best) { st.hits++; st.hitT = 0.16; sparks(new THREE.Vector3(best.x, 1.3, best.z), 20, '#fde047', 5); damage(best, w.dmg, me, false); snd('head', 0.8); } }
function explode(p) {
  var P = p.m.position, w = p.w, vol = clamp(1.5 - Math.hypot(P.x - st.me.x, P.z - st.me.z) / 30, 0.1, 1); snd('boom', vol); boom(P.clone(), w.splash * 0.75);
  st.ents.forEach(function (o) { if (!o.alive) return; var d = Math.hypot(o.x - P.x, (o.y + 1) - P.y, o.z - P.z); if (d < w.splash && los(P.x, P.z, o.x, o.z)) { var dm = w.dmg * (1 - d / w.splash * 0.65) * (o === p.own ? 0.35 : 1); if (o.me) { var kx = (o.x - P.x) / (d || 1), kz = (o.z - P.z) / (d || 1), k = 1 - d / w.splash; o.vy = Math.max(o.vy, 10 * k + (o === p.own ? 3 : 0)); o.onGround = false; st.kb = { x: kx * 9 * k, z: kz * 9 * k }; } if (p.own.me && o !== p.own) { st.hitT = 0.16; st.dnums.push({ p: new THREE.Vector3(o.x, o.y + 2, o.z), v: Math.round(dm), t: st.t }); } damage(o, dm, p.own, false); } });
}
/* ---------- bots ---------- */
function bot(e, dt) {
  var D = e.D, w = W_(e), best = null, bd = 1e9;
  st.ents.forEach(function (o) { if (o === e || !o.alive) return; var d = Math.hypot(o.x - e.x, o.z - e.z); if (d > D.vis * CELL) return; var ang = Math.abs(angDiff(e.a, Math.atan2(-(o.x - e.x), -(o.z - e.z)))); var aware = ang < 1.15 || (e.lastAtk === o && st.t - e.lastHurt < 2.5) || d < 6; if (!aware || !los(e.x, e.z, o.x, o.z)) return; var sc = d - (o.me ? 3 : 0); if (sc < bd) { bd = sc; best = o; } });
  if (e.reloadT <= 0 && w.mag && ammo(e) <= 0) startReload(e);
  if (best) {
    if (e.tgt !== best) { e.tgt = best; e.seenT = st.t; }
    var ta = Math.atan2(-(best.x - e.x), -(best.z - e.z)), da = angDiff(e.a, ta); e.a += clamp(da, -D.turn * dt, D.turn * dt);
    var d = Math.hypot(best.x - e.x, best.z - e.z), want = (w.melee ? 0.3 : w.kind === 'shotgun' ? 3 : w.kind === 'sniper' || w.kind === 'rail' ? 10 : w.kind === 'rocket' ? 7 : 5.5) * CELL * 0.5;
    e.strafeT -= dt; if (e.strafeT <= 0) { e.strafe = Math.random() < 0.5 ? -1 : 1; e.strafeT = rnd(0.5, 1.4); }
    var fwd = d > want + 3 ? 1 : d < want - 4 ? -0.7 : 0, side = w.melee ? 0.25 * e.strafe : e.strafe, sa = Math.sin(e.a), ca = Math.cos(e.a), sp = D.spd * CELL * 0.92 * (w.melee ? 1.25 : 1) * w.move;
    var ox = e.x, oz = e.z; moveEnt(e, (-sa * fwd + ca * side) * sp * dt * 0.8, (-ca * fwd - sa * side) * sp * dt * 0.8, true); e.moving = Math.hypot(e.x - ox, e.z - oz) > 0.002; if (!e.moving) e.strafe = -e.strafe;
    if (st.t - e.seenT > D.react && Math.abs(da) < 0.3 && e.cd <= 0 && e.reloadT <= 0) botFire(e, best, d);
    if (e.burstLeft > 0) { e.burstT -= dt; if (e.burstT <= 0 && ammo(e) > 0) { e.burstLeft--; e.burstT = 0.08; e.ammo[wkey(e)]--; botShot(e, best, d); } }
    e.lastSeen = [best.x, best.z];
  } else {
    e.tgt = null;
    if (!e.path.length) { var t = e.lastSeen && Math.random() < 0.6 ? e.lastSeen : randFloor(); e.lastSeen = null; e.path = bfs(e.x, e.z, t[0], t[1]); if (!e.path.length) { var r2 = randFloor(); e.path = bfs(e.x, e.z, r2[0], r2[1]); } }
    var n = e.path[0]; if (n) { var ang2 = Math.atan2(-(n[0] - e.x), -(n[1] - e.z)); e.a += clamp(angDiff(e.a, ang2), -D.turn * dt, D.turn * dt); var ox2 = e.x, oz2 = e.z, sp2 = D.spd * CELL * 0.92 * w.move; moveEnt(e, -Math.sin(ang2) * sp2 * dt, -Math.cos(ang2) * sp2 * dt, true); e.moving = true; if (Math.hypot(n[0] - e.x, n[1] - e.z) < 0.6) e.path.shift(); if (Math.hypot(e.x - ox2, e.z - oz2) < 0.001) { e.stuckT += dt; if (e.stuckT > 0.6) { e.path = []; e.stuckT = 0; } } else e.stuckT = 0; }
    if (w.mag && ammo(e) < w.mag * 0.5 && e.reloadT <= 0) startReload(e);
  }
}
function botMuzzle(e) { var p = new THREE.Vector3(); if (e.char.tipObj) e.char.tipObj.getWorldPosition(p); else p.set(e.x, 1.4, e.z); return p; }
function botFire(e, t, d) {
  var w = W_(e); e.cd = w.rate * e.D.fire; e.shootAnim = 0.14;
  var vol = clamp(1.4 - Math.hypot(e.x - st.me.x, e.z - st.me.z) / 40, 0.05, 0.75);
  if (w.melee) { if (d <= w.melee) { snd('rod', vol); damage(t, w.dmg, e, false); } return; }
  if (ammo(e) <= 0) { startReload(e); return; } e.ammo[wkey(e)]--;
  snd(w.kind, vol);
  var mz = botMuzzle(e);
  if (!w.beam) flashAt(mz, w.kind === 'shotgun' || w.kind === 'rocket' ? 1 : 0.7);
  if (w.proj) { var tp = new THREE.Vector3(t.x + rnd(-1, 1) * (1 - e.D.acc) * 2, t.y + 0.3, t.z + rnd(-1, 1) * (1 - e.D.acc) * 2), dir = tp.sub(mz).normalize(), rm = rocketMesh(); rm.position.copy(mz); rm.lookAt(mz.clone().add(dir)); st.scene.add(rm); st.proj.push({ m: rm, v: dir.multiplyScalar(w.proj * 0.8), own: e, life: 4, w: w, trailT: 0 }); return; }
  if (w.burst) { e.burstLeft = w.burst - 1; e.burstT = 0.08; }
  botShot(e, t, d, mz);
}
function botShot(e, t, d, mz) {
  var w = W_(e); if (!t.alive) return; mz = mz || botMuzzle(e);
  var pel = w.pel || 1, mv = t.moving ? 0.82 : 1, dc = d / CELL, df = clamp(1.15 - d / w.rng, 0.12, 1), p = clamp(e.D.acc * (1 - w.spr * 2) * df * mv * (t.me ? 1 : 1.1) + (dc < 3 ? 0.12 : 0), 0.02, 0.92), dmg = 0, head = false;
  for (var i = 0; i < pel; i++) if (Math.random() < p) { var hd = Math.random() < 0.24 * e.D.acc; dmg += w.dmg * (hd ? w.head : 1); if (hd) head = true; }
  var tgt = new THREE.Vector3(t.x, t.y + (t.me ? EYE - 0.3 : 1.25), t.z); if (!dmg) { tgt.x += rnd(-1.2, 1.2); tgt.y += rnd(-0.6, 0.9); tgt.z += rnd(-1.2, 1.2); }
  if (w.beam) tracer(mz, tgt, '#f0abfc', 0.03, 0.06); else if (w.kind === 'rail') tracer(mz, tgt, '#67e8f9', 0.05, 0.35); else tracer(mz, tgt, '#ffe08a', 0.012, 0.06);
  if (dmg) damage(t, dmg, e, head);
}
function animChar(e, dt) {
  var ch = e.char; if (!ch || !e.alive) return; ch.root.position.set(e.x, e.y, e.z); ch.root.rotation.y = e.a;
  e.ph += dt * (e.moving ? 11 : 0); var sw = e.moving ? Math.sin(e.ph) * 0.75 : ch.legs[0].rotation.x * 0.8;
  ch.legs[0].rotation.x = sw; ch.legs[1].rotation.x = -sw;
  ch.aim = lerp(ch.aim, e.tgt ? 1 : 0, Math.min(1, dt * 8));
  var melee = W_(e).melee, A = ch.arms[1], B = ch.arms[0];
  A.rotation.x = lerp(0.75 + sw * 0.12, Math.PI / 2 - 0.06, ch.aim) + (e.shootAnim > 0 ? 0.15 : 0); A.rotation.y = 0.08 * ch.aim;
  if (melee) { A.rotation.x = e.shootAnim > 0 ? 2.6 - (0.14 - e.shootAnim) * 12 : lerp(0.5 + sw * 0.2, 1.2, ch.aim); B.rotation.x = -sw * 0.8; B.rotation.y = 0; }
  else { B.rotation.x = lerp(-sw * 0.8, Math.PI / 2 - 0.25, ch.aim); B.rotation.y = -0.5 * ch.aim; }
  ch.body.position.y = e.moving ? Math.abs(Math.sin(e.ph)) * 0.05 : 0;
  ch.shield.visible = e.inv > 0; if (ch.shield.visible) ch.shield.material.opacity = 0.12 + Math.sin(st.t * 12) * 0.06;
  var hurt = e.hurtAnim > 0 ? 0.9 : 0; ch.mats.forEach(function (m) { m.emissive.setRGB(hurt, 0, 0); });
  setCharGun(e);
}

/* ---------- damage, kills, skill ---------- */
function damage(v, amt, by, head) {
  if (!v.alive || v.inv > 0 || !st || st.result || st.slow > 0) return; v.hp -= amt; v.lastHurt = st.t; v.lastAtk = by; v.hurtAnim = 0.12;
  if (v.me) { st.dmgT = 0.45; st.dmgFrom = Math.atan2(-(by.x - v.x), -(by.z - v.z)); st.shake = Math.max(st.shake, 0.25); }
  if (v.hp <= 0) kill(v, by, head);
}
function kill(v, by, head) {
  v.alive = false; v.hp = 0; v.deaths++; v.respawn = 3; v.reloadT = 0; v.burstLeft = 0;
  if (v.me) { st.deaths++; st.killer = by; snd('death', 0.8); if (by && !by.me) st.skill = clamp(st.skill - 0.022, 0.03, 0.98); mouseDown = false; st.burstLeft = 0; }
  else { breakApart(v, by); snd('death', clamp(1.2 - Math.hypot(v.x - st.me.x, v.z - st.me.z) / 40, 0.1, 0.7)); }
  if (by === v) { feed(v.name + ' blew themselves up', '#9aa6bb'); return; }
  by.kills++; var w = W_(by), fin = isFinal(by);
  feed(by.name + '  [' + w.n + ']' + (head ? ' 🎯' : '') + '  ' + v.name, by.me ? '#fde047' : v.me ? '#f87171' : '#cbd5e1');
  if (by.me) { st.kills++; if (head) st.heads++; st.coins += 10 + (head ? 5 : 0); st.cxp += 20 + (head ? 5 : 0); st.skill = clamp(st.skill + 0.016 + (head ? 0.006 : 0), 0.03, 0.98); st.popups.push({ t: st.t, s: (head ? 'HEADSHOT · ' : 'ELIMINATED · ') + v.name, sub: '+' + (10 + (head ? 5 : 0)) + ' coins' }); snd('kill', 0.9); }
  if (fin) { finish(by); return; }
  if (st.mode === 'dm' && by.kills >= st.c.dmKills) { finish(by, true); return; }
  if (by.me) setTimeout(function () { if (st && !st.result && st.slow <= 0) askQ(); }, 420);
  else if (st.mode === 'gun') { if (Math.random() < by.D.ans) { by.tier++; feed(by.name + ' answered right: ' + W_(by).n, '#93a3bd'); if (isFinal(by)) st.banner = { t: st.t, s: '⚠ ' + by.name + ' has the golden control rod!', c: '#f5c542' }; } else feed(by.name + ' got their question wrong', '#64748b'); }
}
function feed(t, col) { st.feed.unshift({ t: st.t, s: t, c: col }); if (st.feed.length > 6) st.feed.length = 6; }

/* ============================================================ questions ============================================================ */
function nextQ() { if (!st.qs.length) return null; if (st.qi >= st.qs.length) { st.qs = shuffle(st.qs); st.qi = 0; } return st.qs[st.qi++]; }
function askQ() {
  if (st.q) { st.qQueue = (st.qQueue || 0) + 1; return; }
  var q = nextQ(); if (!q) { if (st.mode === 'gun') { st.me.tier = Math.min(st.lad.length - 1, st.me.tier + 1); setVMGun(false); } return; }
  mouseDown = false; rmb = false; keys = {}; st.burstLeft = 0; try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  var num = q.t === 'N', order = num ? [] : shuffle(q.o.map(function (_, i) { return i; }));
  st.q = { q: q, order: order, t0: performance.now(), done: false, lim: 30000 };
  var reward = st.mode === 'gun' ? (st.me.tier + 1 < st.lad.length ? 'Right answer = ' + G[st.lad[st.me.tier + 1]].n : '') : 'Right answer = +15 coins and full health';
  var box2 = el('div', 'arq'); box2.innerHTML = '<div class="arqbox" role="dialog" aria-label="Question"><div class="arqtop"><span>' + esc(reward) + '</span><span data-k="sec">30</span></div><div class="artime"><i data-k="bar"></i></div><div class="arqs">' + esc(q.src) + '</div><div class="arqp">' + q.p + '</div>' + (num ? '<form class="arnum" data-k="nf"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" placeholder="Type your answer">' + (q.u ? '<span>' + q.u + '</span>' : '') + '<button type="submit" class="arbtn" style="background:#fb923c;color:#111;border:0">Check</button></form>' : '<div class="aropts">' + order.map(function (oi, i) { return '<button type="button" class="aropt" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span>' + q.o[oi] + '</span></button>'; }).join('') + '</div>') + '<div data-k="fb"></div></div>';
  root.appendChild(box2); st.q.el = box2;
  if (num) { var nf = box2.querySelector('[data-k=nf]'), inp = nf.querySelector('input'); setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60); nf.addEventListener('submit', function (e) { e.preventDefault(); if (st && st.q && !st.q.done && inp.value.trim()) answer(inp.value); }); }
  box2.addEventListener('click', function (e) { var b = e.target.closest('.aropt'); if (b && st.q && !st.q.done) answer(+b.dataset.i); var c = e.target.closest('[data-a=cont]'); if (c) endQ(); });
  var Q = st.q, tick = function () { if (!st || st.q !== Q || Q.done) return; var left = Q.lim - (performance.now() - Q.t0); var s = box2.querySelector('[data-k=sec]'), b = box2.querySelector('[data-k=bar]'); if (s) s.textContent = Math.max(0, Math.ceil(left / 1000)); if (b) b.style.transform = 'scaleX(' + clamp(left / Q.lim, 0, 1) + ')'; if (left <= 0) { answer(-1); return; } if (left < 5000 && Math.ceil(left / 1000) !== Q.lastS) { Q.lastS = Math.ceil(left / 1000); snd('tick', 0.8); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function ansText(q) { return q.t === 'N' ? String(q.a) + (q.u ? ' ' + q.u : '') : q.o[q.a]; }
function parseNum(t) { t = String(t).trim().replace(/,/g, '').replace(/[−–]/g, '-').replace(/×\s*10\^?/g, 'e').replace(/\s+/g, ''); var m = /^(-?[\d.]+)\/(-?[\d.]+)$/.exec(t); if (m) return parseFloat(m[1]) / parseFloat(m[2]); var u = t.replace(/[^0-9eE.+\-]/g, ''); return u ? parseFloat(u) : NaN; }
function answer(i) {
  var Q = st.q; if (!Q || Q.done) return; Q.done = true; var q = Q.q, ok;
  if (q.t === 'N') { var v = typeof i === 'string' ? parseNum(i) : NaN, tol = q.tol == null ? 0.02 : q.tol; ok = isFinite(v) && (q.a === 0 ? Math.abs(v) <= (tol || 1e-9) : Math.abs(v - q.a) <= Math.abs(q.a) * tol + 1e-12); i = typeof i === 'string' ? 0 : -1; var ip = Q.el.querySelector('[data-k=nf] input'); if (ip) { ip.disabled = true; ip.style.borderColor = ok ? '#22c55e' : '#ef4444'; } }
  else { ok = i >= 0 && Q.order[i] === q.a; [].forEach.call(Q.el.querySelectorAll('.aropt'), function (b, j) { b.disabled = true; if (Q.order[j] === q.a) b.classList.add('ok'); else if (j === i) b.classList.add('no'); }); }
  st.asked++; API.result(q.k, ok);
  var fb = Q.el.querySelector('[data-k=fb]'), me = st.me;
  if (ok) {
    st.right++; st.xp += 4; st.coins += 15; st.cxp += 25; API.sfx('right'); snd('coin', 0.7);
    var msg;
    if (st.mode === 'gun') { me.tier = Math.min(st.lad.length - 1, me.tier + 1); me.ammo[wkey(me)] = W_(me).mag; me.reloadT = 0; setVMGun(false); snd('up', 0.8); msg = 'Now on the <b style="display:inline;color:' + W_(me).col + '">' + W_(me).n + '</b> (' + (me.tier + 1) + '/' + st.lad.length + ')' + (isFinal(me) ? '. One kill with it wins the match!' : '') + ' · +15 coins'; st.banner = { t: st.t, s: isFinal(me) ? '🏆 GOLDEN CONTROL ROD: one kill to win!' : 'NEW WEAPON: ' + W_(me).n, c: W_(me).col }; }
    else { me.hp = 100; fillAmmo(me); msg = '+15 coins, full health and fresh ammo.'; }
    fb.innerHTML = '<div class="arfb ok"><b>✓ Correct!</b>' + msg + '</div>';
    setTimeout(function () { if (st && st.q === Q) endQ(); }, 1100);
  } else {
    API.sfx('wrong'); st.missed.push(q);
    fb.innerHTML = '<div class="arfb no"><b>' + (i < 0 ? '⏱ Out of time' : '✗ Not quite') + '</b>The answer is: ' + ansText(q) + (q.e ? '<div style="margin-top:6px;font-weight:500;color:#cbd5e1">' + q.e + '</div>' : '') + '<div style="margin-top:6px;font-weight:700;color:#fca5a5">' + (st.mode === 'gun' ? 'You keep the ' + W_(me).n + '.' : 'No bonus this time.') + '</div></div><div class="arrow" style="justify-content:flex-end"><button type="button" class="arbtn" data-a="cont" style="background:#fb923c;color:#111;border:0">Back to the fight ▶</button></div>';
    try { Q.el.querySelector('[data-a=cont]').focus(); } catch (e) {}
  }
}
function endQ() { if (!st || !st.q) return; st.q.el.remove(); st.q = null; if (st.qQueue > 0) { st.qQueue--; setTimeout(function () { if (st && !st.result) askQ(); }, 250); return; } lock(); }

/* ============================================================ menus + results ============================================================ */
function pauseMenu() {
  if (!st || st.paused || st.result) return; st.paused = true; mouseDown = false; rmb = false; keys = {};
  var m = el('div', 'armenu'); m.innerHTML = '<div class="arqbox"><h2>Paused</h2><p class="arsmall">' + (st.mode === 'gun' ? 'You: ' + W_(st.me).n + ' (' + (st.me.tier + 1) + '/' + st.lad.length + ')' : 'Kills: ' + st.me.kills + ' / ' + st.c.dmKills) + ' · ' + st.right + '/' + st.asked + ' questions right · 🪙 ' + st.coins + ' this match</p><div class="arrow" style="justify-content:center"><button type="button" class="arbtn go" data-a="r">▶ Resume</button><button type="button" class="arbtn" data-a="s">Change setup</button><button type="button" class="arbtn" data-a="q">Quit</button></div><p class="arsmall">Quitting keeps the coins and XP you\'ve earned so far.</p></div>';
  root.appendChild(m); st.menu = m;
  m.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.a === 'r') resume(); else if (b.dataset.a === 's') { results(null, true); setup(); } else if (b.dataset.a === 'q') { results(null, true); close(); } });
  try { m.querySelector('[data-a=r]').focus(); } catch (e) {}
}
function resume() { if (!st || !st.paused) return; st.paused = false; if (st.menu) st.menu.remove(); st.menu = null; lock(); }
function finish(winner) {
  if (st.result || st.slow > 0) return; var me = st.me, won = winner === me;
  if (won) { st.xp += 30; st.coins += 100; st.cxp += 150; } else { var place = 1 + st.ents.filter(function (e) { return e !== me && (st.mode === 'dm' ? e.kills > me.kills : (e.tier > me.tier || (e.tier === me.tier && e.kills > me.kills))); }).length; if (place <= 3) { st.coins += 30; st.cxp += 50; } }
  st.coins += 20; st.cxp += 30;
  st.slow = 1.4; st.pendingFinish = winner; st.banner = { t: st.t, s: won ? 'VICTORY!' : winner.name + ' WINS', c: won ? '#fde047' : '#f87171' }; snd(won ? 'win' : 'lose', 0.9);
  try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
}
function results(winner, quiet) {
  if (!st || st.saved) return; var me = st.me, won = winner === me; st.result = true; st.saved = true; mouseDown = false;
  try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
  if (st.q) { st.q.el.remove(); st.q = null; }
  pendingXP += st.xp;
  var c = store(), before = lvlInfo(c.cxp); c.coins += st.coins; c.cxp += st.cxp; if (st.ents.some(function (e) { return e.diffKey === 'auto'; })) c.skill = Math.round(st.skill * 1000) / 1000;
  c.rec.played = (c.rec.played || 0) + (quiet ? 0 : 1); c.rec.kills = (c.rec.kills || 0) + st.kills; if (won) c.rec.wins = (c.rec.wins || 0) + 1; wr(c);
  var after = lvlInfo(c.cxp), unlocked = SHOP.filter(function (k) { return G[k].lvl > before.lv && G[k].lvl <= after.lv; });
  var crate = null; if (won && !quiet) { var hard = st.ents.filter(function (e) { return e.D && e.D.acc >= 0.44; }).length; crate = hard >= Math.max(3, st.ents.length - 1) ? 'E' : 'R'; try { API.crate(crate); } catch (e) {} }
  if (quiet) return;
  var order = st.ents.slice().sort(function (a, b) { return (b === winner) - (a === winner) || (st.mode === 'dm' ? b.kills - a.kills : b.tier - a.tier || b.kills - a.kills); });
  var r = el('div', 'arres'); r.innerHTML = '<div class="arwrap"><p class="arbig' + (won ? ' win' : '') + '">' + (won ? 'VICTORY!' : esc(winner.name) + ' wins') + '</p><p style="color:#9aa6bb;margin:0">' + (st.mode === 'dm' ? (won ? 'First to the kill target. Nice.' : 'You got ' + me.kills + ' kills.') : won ? 'You won with the golden control rod.' : 'You reached the ' + esc(W_(me).n) + '.') + '</p>' +
    '<div class="arstats"><div><b>🪙 +' + st.coins + '</b><span>coins (you have ' + fmt(c.coins) + ')</span></div><div><b>' + st.right + '/' + st.asked + '</b><span>questions right</span></div><div><b>' + st.kills + '</b><span>kills (' + st.heads + ' headshots)</span></div><div><b>' + st.deaths + '</b><span>deaths</span></div><div><b>' + (st.shots ? Math.round(st.hits / st.shots * 100) : 0) + '%</b><span>shots on target</span></div><div><b>+' + st.cxp + '</b><span>Clash XP (level ' + after.lv + ')</span></div><div><b>+' + st.xp + '</b><span>Critical XP (added when you leave)</span></div><div><b>' + Math.round(st.skill * 100) + '%</b><span>Match me skill next time</span></div></div>' +
    (after.lv > before.lv ? '<p style="margin:0;font-weight:800;color:#67e8f9">⬆ Clash level ' + after.lv + '!' + (unlocked.length ? ' Now in the gun shop: ' + unlocked.map(function (k) { return G[k].n; }).join(', ') + '.' : '') + '</p>' : '') +
    (crate ? '<p style="margin:0;font-weight:800;color:#fde047">🎁 You earned a ' + (crate === 'E' ? 'Epic' : 'Rare') + ' crate. Open it in Rewards.</p>' : '') +
    '<section class="arcard"><h2>Scoreboard</h2><div class="artw"><table class="artable"><thead><tr><th>#</th><th>Player</th><th>Weapon</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>' + order.map(function (e, i) { return '<tr class="' + (e.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + e.col + ';margin-right:6px"></span>' + esc(e.name) + (e.D ? ' <small style="color:' + e.D.col + '">' + e.D.n + (e.D.auto ? ' ' + Math.round(st.skill * 100) + '%' : '') + '</small>' : '') + '</td><td>' + esc(W_(e).n) + (st.mode === 'gun' ? ' (' + (e.tier + 1) + ')' : '') + '</td><td>' + e.kills + '</td><td>' + e.deaths + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
    (st.missed.length ? '<section class="arcard"><h2>Questions to look at again</h2><div class="armiss">' + st.missed.slice(0, 12).map(function (q) { return '<div>' + q.p + '<em>✓ ' + ansText(q) + '</em></div>'; }).join('') + '</div><p class="arsmall" style="margin:8px 0 0">These have gone into Fix my mistakes, and Memory refresh will bring them back.</p></section>' : '<section class="arcard"><h2>Questions</h2><p style="margin:0">' + (st.asked ? 'Every question right. Brilliant!' : 'No questions this time. Get some kills!') + '</p></section>') +
    '<div class="arrow"><button type="button" class="arbtn go" data-a="again">▶ Play again</button><button type="button" class="arbtn" data-a="shop">🛒 Gun shop</button><button type="button" class="arbtn" data-a="setup">Change setup</button><button type="button" class="arbtn" data-a="exit">Exit</button></div></div>';
  root.appendChild(r);
  r.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.a === 'again') start(store()); else if (b.dataset.a === 'shop') { setupTab = 'shop'; setup(); } else if (b.dataset.a === 'setup') { setupTab = 'play'; setup(); } else close(); });
  try { r.querySelector('[data-a=again]').focus(); } catch (e) {}
}

/* ============================================================ touch ============================================================ */
function touchUI() {
  st.touch = true; var t = el('div', 'artouch', '<div class="look"></div><div class="stick"><i></i></div><button type="button" class="tb fire">FIRE</button><button type="button" class="tb jump">JUMP</button><button type="button" class="tb rel">R</button><button type="button" class="tb aim">AIM</button>'); root.appendChild(t);
  var stick = t.querySelector('.stick'), knob = stick.querySelector('i'), sid = null, cx = 0, cy = 0;
  stick.addEventListener('touchstart', function (e) { var p = e.changedTouches[0]; sid = p.identifier; var r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.preventDefault(); }, { passive: false });
  stick.addEventListener('touchmove', function (e) { [].forEach.call(e.changedTouches, function (p) { if (p.identifier !== sid || !st) return; var dx = clamp((p.clientX - cx) / 50, -1, 1), dy = clamp((p.clientY - cy) / 50, -1, 1); st.touchMove = [dx, dy]; knob.style.transform = 'translate(' + dx * 40 + 'px,' + dy * 40 + 'px)'; }); e.preventDefault(); }, { passive: false });
  var endS = function () { sid = null; if (st) st.touchMove = null; knob.style.transform = ''; }; stick.addEventListener('touchend', endS); stick.addEventListener('touchcancel', endS);
  var look = t.querySelector('.look'), lid = null, lx = 0, ly = 0;
  look.addEventListener('touchstart', function (e) { var p = e.changedTouches[0]; lid = p.identifier; lx = p.clientX; ly = p.clientY; e.preventDefault(); }, { passive: false });
  look.addEventListener('touchmove', function (e) { [].forEach.call(e.changedTouches, function (p) { if (p.identifier !== lid || !st || st.q) return; var z = st.camera.fov / st.c.fov; st.me.a -= (p.clientX - lx) * 0.006 * z; st.me.pitch = clamp(st.me.pitch - (p.clientY - ly) * 0.005 * z, -1.45, 1.45); lx = p.clientX; ly = p.clientY; }); e.preventDefault(); }, { passive: false });
  var fire = t.querySelector('.fire'); fire.addEventListener('touchstart', function (e) { mouseDown = true; if (st && !st.q && !st.paused) tryFire(); e.preventDefault(); }, { passive: false }); fire.addEventListener('touchend', function () { mouseDown = false; });
  t.querySelector('.jump').addEventListener('touchstart', function (e) { if (st && !st.q) jump(); e.preventDefault(); }, { passive: false });
  t.querySelector('.rel').addEventListener('touchstart', function (e) { if (st) startReload(st.me); e.preventDefault(); }, { passive: false });
  t.querySelector('.aim').addEventListener('touchstart', function (e) { if (st) st.touchAim = !st.touchAim; e.preventDefault(); }, { passive: false });
}

/* ============================================================ render + HUD ============================================================ */
function syncCam(shake) {
  var me = st.me, cam = st.camera, w = W_(me), tf = st.c.fov * lerp(1, w.ads || 0.85, st.adsT); if (Math.abs(cam.fov - tf) > 0.01) { cam.fov = tf; cam.updateProjectionMatrix(); }
  var eye = me.alive ? me.y + EYE : 0.5, sh = shake ? st.shake * 0.12 : 0;
  cam.position.set(me.x + rnd(-sh, sh), eye + rnd(-sh, sh) + (shake && me.alive && me.moving && me.onGround ? Math.abs(Math.sin(st.bob)) * 0.05 * (1 - st.adsT) : 0), me.z + rnd(-sh, sh));
  cam.rotation.set(me.pitch + (shake ? st.recoil * 0.015 : 0), me.a, me.alive ? 0 : 0.5); cam.updateMatrixWorld();
}
function render(dt) {
  if (!st || !R3) return; var me = st.me, cam = st.camera;
  syncCam(true);
  if (st.beamT > 0) { st.beamT -= dt; if (st.beamT <= 0) st.fx.beam.visible = false; }
  R3.clear(); R3.render(st.scene, cam); R3.clearDepth(); if (me.alive) R3.render(st.vm.scene, st.vm.cam);
  hud();
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function project(v) { var p = v.clone().project(st.camera); if (p.z > 1) return null; return { x: (p.x + 1) / 2 * st.hud.width, y: (1 - p.y) / 2 * st.hud.height }; }
function hud() {
  var g = st.hg, CW = st.hud.width, CH = st.hud.height, d = st.hdpr || 1, me = st.me, w = W_(me), pad = 16 * d, cx = CW / 2, cy = CH / 2, i;
  g.clearRect(0, 0, CW, CH); g.save(); g.textBaseline = 'middle';
  var scoped = w.scope && st.adsT > 0.85 && me.alive;
  if (scoped) { var R = Math.min(CW, CH) * 0.42; g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, CW, CH); g.arc(cx, cy, R, 0, Math.PI * 2, true); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke(); g.strokeStyle = w.kind === 'rail' ? '#22d3ee' : '#ef4444'; g.lineWidth = 1.5 * d; g.beginPath(); g.arc(cx, cy, 3 * d, 0, 6.3); g.stroke(); var vg = g.createRadialGradient(cx, cy, R * 0.7, cx, cy, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.7)'); g.fillStyle = vg; g.beginPath(); g.arc(cx, cy, R, 0, 6.3); g.fill(); }
  /* name tags */
  st.ents.forEach(function (e) { if (e.me || !e.alive) return; var dd = Math.hypot(e.x - me.x, e.z - me.z); if (dd > 50 || !los(me.x, me.z, e.x, e.z)) return; var p = project(new THREE.Vector3(e.x, e.y + 2.7, e.z)); if (!p) return; var a = clamp(1.5 - dd / 40, 0.35, 1), ww = 80 * d; g.globalAlpha = a; g.font = '800 ' + (12 * d) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, p.x - ww / 2, p.y - 18 * d, ww, 24 * d, 6 * d); g.fill(); g.fillStyle = e.col; g.fillText(e.name + (st.mode === 'gun' ? ' · ' + (e.tier + 1) : ''), p.x, p.y - 10 * d); g.fillStyle = '#333'; g.fillRect(p.x - ww / 2 + 5 * d, p.y + 0.5 * d, ww - 10 * d, 3.5 * d); g.fillStyle = e.hp > 50 ? '#22c55e' : e.hp > 25 ? '#eab308' : '#ef4444'; g.fillRect(p.x - ww / 2 + 5 * d, p.y + 0.5 * d, (ww - 10 * d) * clamp(e.hp / 100, 0, 1), 3.5 * d); if (isFinal(e)) { g.fillStyle = '#f5c542'; g.font = '900 ' + (16 * d) + 'px system-ui,sans-serif'; g.fillText('★', p.x, p.y - 30 * d); } g.globalAlpha = 1; });
  /* damage numbers */
  st.dnums.forEach(function (n) { var p = project(n.p); if (!p) return; var k = (st.t - n.t) / 0.9; g.globalAlpha = 1 - k; g.font = '900 ' + ((n.head ? 22 : 17) * d) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.lineWidth = 4 * d; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(n.v, p.x, p.y - k * 40 * d); g.fillStyle = n.head ? '#fde047' : '#fff'; g.fillText(n.v, p.x, p.y - k * 40 * d); g.globalAlpha = 1; });
  /* crosshair */
  if (me.alive && !scoped && st.adsT < 0.6) { var sp = (w.melee ? 0 : (w.spr * 260 + 5) * (me.moving ? 1.35 : 1) * (me.onGround ? 1 : 1.5) + st.recoil * 12) * d, ln = 8 * d; g.strokeStyle = '#fff'; g.lineWidth = 2 * d; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 3; if (w.melee) { g.beginPath(); g.arc(cx, cy, 12 * d, 0, 6.3); g.stroke(); } else { g.beginPath(); g.moveTo(cx - sp - ln, cy); g.lineTo(cx - sp, cy); g.moveTo(cx + sp, cy); g.lineTo(cx + sp + ln, cy); g.moveTo(cx, cy - sp - ln); g.lineTo(cx, cy - sp); g.moveTo(cx, cy + sp); g.lineTo(cx, cy + sp + ln); g.stroke(); g.fillStyle = '#fff'; g.fillRect(cx - d, cy - d, 2 * d, 2 * d); } g.shadowBlur = 0; }
  else if (me.alive && st.adsT >= 0.6 && !w.scope) { g.fillStyle = '#ef4444'; g.beginPath(); g.arc(cx, cy, 2.5 * d, 0, 6.3); g.fill(); }
  if (st.hitT > 0) { g.strokeStyle = st.headT > 0 ? '#fde047' : '#fff'; g.lineWidth = 2.5 * d; var hh = 10 * d; g.beginPath(); g.moveTo(cx - hh, cy - hh); g.lineTo(cx - hh / 2, cy - hh / 2); g.moveTo(cx + hh, cy - hh); g.lineTo(cx + hh / 2, cy - hh / 2); g.moveTo(cx - hh, cy + hh); g.lineTo(cx - hh / 2, cy + hh / 2); g.moveTo(cx + hh, cy + hh); g.lineTo(cx + hh / 2, cy + hh / 2); g.stroke(); }
  /* damage direction + low health */
  if (st.dmgT > 0) { var an = -angDiff(me.a, st.dmgFrom) - Math.PI / 2; g.strokeStyle = 'rgba(239,68,68,' + clamp(st.dmgT * 2, 0, 0.9) + ')'; g.lineWidth = 7 * d; g.beginPath(); g.arc(cx, cy, 90 * d, an - 0.35, an + 0.35); g.stroke(); }
  if (st.dmgT > 0 || (me.alive && me.hp < 40)) { var a = Math.max(st.dmgT * 1.2, me.alive && me.hp < 40 ? (40 - me.hp) / 80 : 0), gr = g.createRadialGradient(cx, cy, CH * 0.3, cx, cy, CH * 0.85); gr.addColorStop(0, 'rgba(200,0,0,0)'); gr.addColorStop(1, 'rgba(200,0,0,' + clamp(a, 0, 0.55) + ')'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH); }
  /* health */
  g.fillStyle = 'rgba(5,8,13,.72)'; rr(g, pad, CH - pad - 62 * d, 240 * d, 62 * d, 14 * d); g.fill();
  g.font = '900 ' + (28 * d) + 'px ui-monospace,monospace'; g.textAlign = 'left'; g.fillStyle = me.hp > 50 ? '#e8edf7' : me.hp > 25 ? '#fde047' : '#f87171'; g.fillText('✚ ' + Math.max(0, Math.ceil(me.hp)), pad + 14 * d, CH - pad - 40 * d);
  if (me.inv > 0 && me.alive) { g.font = '800 ' + (11 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#7dd3fc'; g.fillText('SPAWN SHIELD', pad + 130 * d, CH - pad - 40 * d); }
  g.fillStyle = '#1f2937'; rr(g, pad + 14 * d, CH - pad - 19 * d, 212 * d, 8 * d, 4 * d); g.fill(); g.fillStyle = me.hp > 50 ? '#22c55e' : me.hp > 25 ? '#eab308' : '#ef4444'; rr(g, pad + 14 * d, CH - pad - 19 * d, Math.max(8 * d, 212 * d * clamp(me.hp / 100, 0, 1)), 8 * d, 4 * d); g.fill();
  /* ammo */
  g.fillStyle = 'rgba(5,8,13,.72)'; rr(g, CW - pad - 250 * d, CH - pad - 62 * d, 250 * d, 62 * d, 14 * d); g.fill(); g.textAlign = 'right';
  g.font = '800 ' + (13 * d) + 'px system-ui,sans-serif'; g.fillStyle = w.col; g.fillText(w.n + (st.mode === 'dm' && me.slots.length > 1 ? '  (Q to swap)' : ''), CW - pad - 14 * d, CH - pad - 46 * d);
  g.font = '900 ' + (26 * d) + 'px ui-monospace,monospace'; g.fillStyle = w.mag && ammo(me) <= Math.ceil(w.mag * 0.2) ? '#f87171' : '#e8edf7'; g.fillText(w.melee ? '∞' : me.reloadT > 0 ? 'RELOADING' : ammo(me) + ' / ' + w.mag, CW - pad - 14 * d, CH - pad - 20 * d);
  if (me.reloadT > 0 && w.rel) { g.fillStyle = '#1f2937'; g.fillRect(CW - pad - 236 * d, CH - pad - 8 * d, 222 * d, 4 * d); g.fillStyle = '#38bdf8'; g.fillRect(CW - pad - 236 * d, CH - pad - 8 * d, 222 * d * clamp(1 - me.reloadT / (w.rel * (me.D ? me.D.fire : 1)), 0, 1), 4 * d); g.textAlign = 'center'; g.font = '800 ' + (14 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#e8edf7'; g.fillText('Reloading…', cx, cy + 48 * d); }
  else if (w.mag && ammo(me) === 0 && me.alive) { g.textAlign = 'center'; g.font = '800 ' + (14 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#f87171'; g.fillText('Press R to reload', cx, cy + 48 * d); }
  if (w.spin && st.spin > 0 && st.spin < 1) { g.textAlign = 'center'; g.font = '800 ' + (12 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#f472b6'; g.fillText('Spinning up ' + Math.round(st.spin * 100) + '%', cx, cy + 66 * d); }
  /* top bar: weapon ladder or deathmatch score */
  var lw = Math.min(CW * 0.5, 460 * d), lx = cx - lw / 2, ly = 14 * d;
  g.fillStyle = 'rgba(5,8,13,.72)'; rr(g, lx - 10 * d, ly - 6 * d, lw + 20 * d, 52 * d, 14 * d); g.fill();
  if (st.mode === 'gun') { var n = st.lad.length, cw = lw / n; for (i = 0; i < n; i++) { var W2 = G[st.lad[i]]; g.fillStyle = i === me.tier ? W2.col : i < me.tier ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.12)'; rr(g, lx + i * cw + 2 * d, ly, cw - 4 * d, 9 * d, 3 * d); g.fill(); var k = 0; st.ents.forEach(function (e) { if (!e.me && e.tier === i) { g.fillStyle = e.col; g.beginPath(); g.arc(lx + i * cw + cw / 2 + (k - 1) * 6 * d, ly + 16 * d, 3 * d, 0, 6.3); g.fill(); k++; } }); } g.textAlign = 'center'; g.font = '800 ' + (13 * d) + 'px system-ui,sans-serif'; g.fillStyle = w.col; g.fillText(w.n + '   ' + (me.tier + 1) + '/' + n, cx, ly + 33 * d); }
  else { var lead = st.ents.slice().sort(function (a, b) { return b.kills - a.kills; })[0], mm = Math.max(0, Math.floor(st.dmEnd / 60)), ss = Math.max(0, Math.floor(st.dmEnd % 60)); g.textAlign = 'center'; g.font = '900 ' + (15 * d) + 'px ui-monospace,monospace'; g.fillStyle = '#e8edf7'; g.fillText('You ' + me.kills + '  ·  ' + (!lead.kills ? 'no kills yet' : lead === me ? 'you lead' : lead.name + ' ' + lead.kills) + '  ·  first to ' + st.c.dmKills, cx, ly + 10 * d); g.font = '800 ' + (13 * d) + 'px ui-monospace,monospace'; g.fillStyle = st.dmEnd < 30 ? '#f87171' : '#93a3bd'; g.fillText(mm + ':' + String(ss).padStart(2, '0'), cx, ly + 31 * d); }
  g.textAlign = 'right'; g.font = '800 ' + (13 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#fde047'; g.fillText('🪙 +' + st.coins + '   ·   ' + st.right + '/' + st.asked + ' right', CW - pad, CH - pad - 76 * d);
  /* kill feed */
  g.font = '700 ' + (13 * d) + 'px system-ui,sans-serif'; st.feed.forEach(function (f, i) { var age = st.t - f.t; g.globalAlpha = clamp(6 - age, 0, 1); var tw = g.measureText(f.s).width + 18 * d; g.fillStyle = 'rgba(5,8,13,.65)'; rr(g, CW - pad - tw, 74 * d + i * 27 * d, tw, 23 * d, 7 * d); g.fill(); g.fillStyle = f.c; g.textAlign = 'right'; g.fillText(f.s, CW - pad - 9 * d, 86 * d + i * 27 * d); }); g.globalAlpha = 1;
  /* kill popups */
  st.popups.slice(-2).forEach(function (p, i) { var k = (st.t - p.t) / 1.6, y = cy - 120 * d - i * 44 * d - k * 12 * d; g.globalAlpha = k < 0.8 ? 1 : (1 - k) / 0.2; g.textAlign = 'center'; g.font = '900 ' + (22 * d) + 'px system-ui,sans-serif'; g.lineWidth = 5 * d; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(p.s, cx, y); g.fillStyle = /HEADSHOT/.test(p.s) ? '#fde047' : '#fff'; g.fillText(p.s, cx, y); g.font = '800 ' + (13 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#fde047'; g.fillText(p.sub, cx, y + 20 * d); g.globalAlpha = 1; });
  /* banner */
  if (st.banner) { var bk = (st.t - st.banner.t) / 3; g.globalAlpha = bk < 0.85 ? 1 : (1 - bk) / 0.15; g.textAlign = 'center'; g.font = '900 ' + (st.slow > 0 ? 54 : 26) * d + 'px system-ui,sans-serif'; g.lineWidth = 6 * d; g.strokeStyle = 'rgba(0,0,0,.65)'; var by2 = st.slow > 0 ? cy - 20 * d : 96 * d; g.strokeText(st.banner.s, cx, by2); g.fillStyle = st.banner.c; g.fillText(st.banner.s, cx, by2); g.globalAlpha = 1; }
  /* minimap */
  var ms = Math.min(150 * d, CW * 0.17), cs2 = ms / Math.max(st.gw, st.gh), mx0 = pad, my0 = pad; g.fillStyle = 'rgba(5,8,13,.66)'; rr(g, mx0 - 5 * d, my0 - 5 * d, st.gw * cs2 + 10 * d, st.gh * cs2 + 10 * d, 8 * d); g.fill();
  for (var yy = 0; yy < st.gh; yy++) for (var xx = 0; xx < st.gw; xx++) { var c = st.grid[yy][xx]; if (c) { g.fillStyle = TALL[c] ? (c === 4 ? 'rgba(56,217,245,.8)' : 'rgba(160,175,195,.55)') : 'rgba(234,179,8,.45)'; g.fillRect(mx0 + xx * cs2, my0 + yy * cs2, cs2, cs2); } }
  st.ents.forEach(function (e) { if (!e.alive) return; if (!e.me && !(los(me.x, me.z, e.x, e.z) || e.shootAnim > 0)) return; g.fillStyle = e.me ? '#fde047' : e.col; g.beginPath(); g.arc(mx0 + e.x / CELL * cs2, my0 + e.z / CELL * cs2, (e.me ? 3.4 : 2.8) * d, 0, 6.3); g.fill(); });
  g.strokeStyle = '#fde047'; g.lineWidth = 1.6 * d; g.beginPath(); g.moveTo(mx0 + me.x / CELL * cs2, my0 + me.z / CELL * cs2); g.lineTo(mx0 + (me.x - Math.sin(me.a) * 5) / CELL * cs2, my0 + (me.z - Math.cos(me.a) * 5) / CELL * cs2); g.stroke();
  /* death */
  if (!me.alive && !st.result) { g.fillStyle = 'rgba(60,0,0,.4)'; g.fillRect(0, 0, CW, CH); g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '900 ' + (34 * d) + 'px system-ui,sans-serif'; g.fillText('Eliminated' + (st.killer && st.killer !== me ? ' by ' + st.killer.name : ''), cx, CH * 0.4); g.font = '700 ' + (16 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#e5e7eb'; g.fillText((st.killer && st.killer !== me ? 'with the ' + W_(st.killer).n + ' · ' : '') + 'back in ' + Math.max(0, me.respawn).toFixed(1) + ' s', cx, CH * 0.4 + 34 * d); }
  /* scoreboard */
  if (st.board) { var bw = Math.min(CW * 0.86, 620 * d), bh = (64 + st.ents.length * 32) * d, bx = cx - bw / 2, by = cy - bh / 2; g.fillStyle = 'rgba(5,8,13,.9)'; rr(g, bx, by, bw, bh, 16 * d); g.fill(); g.textAlign = 'left'; g.font = '800 ' + (13 * d) + 'px system-ui,sans-serif'; g.fillStyle = '#93a3bd'; g.fillText('PLAYER', bx + 22 * d, by + 30 * d); g.fillText('WEAPON', bx + bw * 0.44, by + 30 * d); g.fillText('K / D', bx + bw * 0.84, by + 30 * d);
    st.ents.slice().sort(function (a, b) { return st.mode === 'dm' ? b.kills - a.kills : b.tier - a.tier || b.kills - a.kills; }).forEach(function (e, i) { var Y = by + (64 + i * 32) * d; g.font = '800 ' + (14 * d) + 'px system-ui,sans-serif'; g.fillStyle = e.me ? '#fde047' : e.col; g.fillText(e.name + (e.D ? ' (' + e.D.n + ')' : ''), bx + 22 * d, Y); g.fillStyle = '#e8edf7'; g.fillText(W_(e).n + (st.mode === 'gun' ? ' ' + (e.tier + 1) : ''), bx + bw * 0.44, Y); g.fillText(e.kills + ' / ' + e.deaths, bx + bw * 0.84, Y); }); }
  if (document.pointerLockElement !== st.canvas && !st.touch && !st.q && !st.paused && !st.result && st.slow <= 0) { g.textAlign = 'center'; g.font = '800 ' + (15 * d) + 'px system-ui,sans-serif'; g.fillStyle = 'rgba(5,8,13,.75)'; rr(g, cx - 140 * d, CH * 0.64 - 19 * d, 280 * d, 38 * d, 10 * d); g.fill(); g.fillStyle = '#fff'; g.fillText('Click to aim with the mouse', cx, CH * 0.64); }
  g.restore();
}

window.CRIT_ARENA = { open: open, close: close, _st: function () { return st; }, _G: G, _store: store, _wr: wr, _start: function () { start(store()); }, _dbg: { r3: function () { return R3; }, manual: function (v) { st.manual = v; }, step: function (n, d) { for (var i = 0; i < n; i++) { if (!st.paused && !st.q && !st.result) update(d, d); else updateFX(d); if (st.slow > 0) { st.slow -= d; if (st.slow <= 0 && st.pendingFinish) { var w = st.pendingFinish; st.pendingFinish = null; results(w, false); return; } } } render(d); }, hud: function () { hud(); }, upd: function (d) { update(d, d); }, fire: function () { tryFire(); }, vm: function () { setVMGun(true); }, swap: swapGun, reload: function () { startReload(st.me); } } };
})();
