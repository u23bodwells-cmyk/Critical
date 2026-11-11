/* Critical Point: a 3D PWR control room simulator for Critical.
   Section 1 of 10: hot standby to critical. Walk the control room, close the trip breakers, pull the rods,
   watch the source range climb, plot 1/M, go critical, block the source range at P-6 and level off at the point of adding heat.
   three.js (MIT licence) from vendor/three.min.js. Game code: Copyright (c) u23bodwells-cmyk. All rights reserved. */
(function () {
'use strict';
if (window.CRIT_PLANT) return;
var API = window.CRIT_PLANT_API || { xp: function () {}, close: function () {} };
var SKEY = 'critical_plant';
function rd() { try { return JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; } catch (e) { return {}; } }
function wr(o) { try { o.at = Date.now(); localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function fmtSci(v, d) { if (!(v > 0)) return '0'; var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return m.toFixed(d == null ? 1 : d) + 'E' + (e < 0 ? '-' : '+') + Math.abs(e); }
function fmtT(s) { s = Math.max(0, Math.floor(s)); var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(x).padStart(2, '0'); }

/* ================================================================ the plant model ================================================================
   A 4-loop Westinghouse-style PWR, 3411 MW thermal (about 1200 MW electric), in UK units (bar, °C, 50 Hz).
   Neutronics: point kinetics with 6 delayed neutron groups and a neutron source, solved implicitly so it stays stable at any time step.
   Reactivity (pcm) = control rods + boron + Doppler (fuel temperature) + moderator temperature + (later sections: xenon, samarium, burnup). */
var BI = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000273], LI = [0.0124, 0.0305, 0.111, 0.301, 1.14, 3.01], BETA = 0.006502, GEN = 2.0e-5, SRC = 1.1e-6;
var FULL = 3411, TOP = 228, T0 = 291.7, PSP = 76.3, UA = 150, CRCS = 1800;
var BANKS = ['SA', 'SB', 'SC', 'SD', 'CA', 'CB', 'CC', 'CD'], SDB = ['SA', 'SB', 'SC', 'SD'], CTB = ['CA', 'CB', 'CC', 'CD'];
var WORTH = { SA: 1150, SB: 1050, SC: 850, SD: 850, CA: 650, CB: 900, CC: 1150, CD: 1250 };
var NROD = { SA: 8, SB: 8, SC: 4, SD: 4, CA: 8, CB: 8, CC: 8, CD: 5 };
var BW = 9.5, AD = -2.3, AM = -25, BORON0 = 1200, ECP_D = 120, OVL = 128, PCMAX = 3 * OVL + TOP;
function bankF(z) { var x = clamp(z / TOP, 0, 1); return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI); }
var RHO0 = WORTH.CD * (1 - bankF(ECP_D)) + BORON0 * BW; /* so the reactor goes critical with bank D at about 120 steps */
function tsat(P) { var T = [[40, 250.4], [50, 263.9], [55, 270.0], [60, 275.6], [65, 280.9], [70, 285.8], [75, 290.5], [80, 295.0], [85, 299.3], [90, 303.3], [100, 311.0], [120, 324.7], [140, 336.7], [155, 344.8], [160, 347.4], [175, 354.7]]; if (P <= T[0][0]) return T[0][1]; for (var i = 1; i < T.length; i++) if (P <= T[i][0]) { var a = T[i - 1], b = T[i]; return a[1] + (b[1] - a[1]) * (P - a[0]) / (b[0] - a[0]); } return T[T.length - 1][1]; }
function setOverlap(p) { p.rods.CA = clamp(p.pc, 0, TOP); p.rods.CB = clamp(p.pc - OVL, 0, TOP); p.rods.CC = clamp(p.pc - 2 * OVL, 0, TOP); p.rods.CD = clamp(p.pc - 3 * OVL, 0, TOP); }
/* moderator temperature coefficient: boron makes it less negative (water expands, boron leaves the core), about -12 pcm/°C at 1200 ppm, -38 with no boron */
function mtc(p) { return -38 + 0.022 * p.boron; }
var DHF = [0.03, 0.02, 0.015], DHT = [10, 150, 3000];
function rhoParts(p) { var rods = 0; BANKS.forEach(function (b) { rods -= WORTH[b] * (1 - bankF(p.rods[b])); }); return { base: RHO0, rods: rods, boron: -p.boron * BW, dop: AD * (p.Tf - T0), mod: mtc(p) * (p.Tavg - T0), xe: xeRho(p) }; }
function rhoPcm(p) { var r = rhoParts(p); return r.base + r.rods + r.boron + r.dop + r.mod + r.xe; }
function pcName(pc) { if (pc <= 0) return 'all control banks in'; if (pc >= PCMAX) return 'all control banks out'; var b = pc >= 3 * OVL ? 'D' : pc >= 2 * OVL ? 'C' : pc >= OVL ? 'B' : 'A', z = b === 'D' ? pc - 3 * OVL : b === 'C' ? pc - 2 * OVL : b === 'B' ? pc - OVL : pc; return 'bank ' + b + ' at ' + Math.round(z) + ' steps'; }

function freshPlant() {
  var p = { t: 0, n: 1e-10, c: [0, 0, 0, 0, 0, 0], rods: {}, pc: 0, rtb: [false, false], tripped: true, dropping: false, dropped: false, firstOut: '', boron: BORON0,
    Tavg: T0, Tf: T0, Ps: PSP, dI: 0.01, dump: 0, rcs: 155, pzr: 25, srBlk: [false, false], audio: true, sel: 'SA', lever: 0, stepAcc: 0, steps: 0,
    dh: [0, 0, 0], drop0: null, dropT: 0, sur: 0, lnPrev: null, srAvg: 0, oneM: [], c0: null, stillT: 0, lastPc: null, lastSdb: '', hist: [], histT: 0, everCrit: false, maxSur: 0, trips: 0 };
  BANKS.forEach(function (b) { p.rods[b] = 0; });
  var rho = rhoPcm(p) * 1e-5; p.n = SRC * GEN / -rho; for (var i = 0; i < 6; i++) p.c[i] = BI[i] * p.n / (GEN * LI[i]);
  p.x = bop0(); p._q = true; for (var k = 0; k < 6000; k++) plantStep(p, 0.05, true); /* let temperatures and the steam dumps settle */ p._q = false;
  p.t = 0; p.hist = []; p.srAvg = 3e11 * p.n; p.lnPrev = Math.log(p.n); p.sur = 0;
  return p;
}
/* one implicit (backward Euler) kinetics step: unconditionally stable, closed form, no matrix solve */
function kin(p, rho, dt) {
  var a = 1 - dt * (rho - BETA) / GEN, rhs = p.n + dt * SRC;
  for (var i = 0; i < 6; i++) { var d = 1 + dt * LI[i]; a -= dt * dt * LI[i] * BI[i] / (GEN * d); rhs += dt * LI[i] * p.c[i] / d; }
  var n1 = rhs / a; if (!(n1 > 0)) n1 = p.n * 2;
  for (i = 0; i < 6; i++) p.c[i] = (p.c[i] + dt * BI[i] / GEN * n1) / (1 + dt * LI[i]);
  p.n = Math.min(Math.max(n1, 1e-14), 50);
}
var SPM_S = 64, SPM_C = 48;
function moveRods(p, dt) {
  if (p.dropping) { /* free fall under gravity: distance goes as time squared, a full-height rod takes 1.7 s */ p.dropT = (p.dropT || 0) + dt; var any = false, fall = TOP * Math.pow(p.dropT / 1.7, 2); BANKS.forEach(function (b) { p.rods[b] = Math.max(0, (p.drop0 ? p.drop0[b] : p.rods[b]) - fall); if (p.rods[b] > 0) any = true; }); if (!any) { p.dropping = false; p.pc = 0; } return; }
  if (!p.lever || !(p.rtb[0] && p.rtb[1]) || p.sel === 'AUTO') { p.stepAcc = 0; return; }
  p.stepAcc += (SDB.indexOf(p.sel) >= 0 ? SPM_S : SPM_C) / 60 * dt;
  while (p.stepAcc >= 1) { p.stepAcc -= 1; if (!stepOnce(p, p.sel, p.lever)) { p.stepAcc = 0; p.blocked = p.lever; break; } }
}
function stepOnce(p, sel, dir) {
  if (sel === 'MAN') { var np = clamp(p.pc + dir, 0, PCMAX); if (np === p.pc) return false; p.pc = np; setOverlap(p); }
  else { var z = clamp(p.rods[sel] + dir, 0, TOP); if (z === p.rods[sel]) return false; p.rods[sel] = z; }
  p.steps++; p.moveT = p.t; return true;
}
function plantStep(p, dt, quiet) {
  moveRods(p, dt);
  var rho = rhoPcm(p) * 1e-5, h = rho > 0.7 * BETA ? 0.0005 : rho > 0.3 * BETA ? 0.004 : dt;
  for (var tt = 0; tt < dt - 1e-9; tt += h) kin(p, rho, Math.min(h, dt - tt));
  /* heat: core power, 4 reactor coolant pumps (20 MW), the steam generators pull heat out to the steam side, the steam dumps hold steam pressure */
  if (!p.dh) p.dh = [0, 0, 0]; var dhs = 0; for (var di = 0; di < 3; di++) { p.dh[di] += (DHF[di] * p.n - p.dh[di]) * (1 - Math.exp(-dt / DHT[di])); dhs += p.dh[di]; }
  /* 6.5% of the heat comes late, from fission products decaying: it carries on after a trip */
  var Q = FULL * (p.n * 0.935 + dhs);
  /* everything else (coolant pumps, steam generators, pressuriser, boron, feed, turbine, electrics...) lives in the balance-of-plant model */
  bopStep(p, dt, Q);
  /* startup rate from how fast the neutron population is changing: SUR (decades per minute) = 26.06 / period */
  var ln = Math.log(p.n); if (p.lnPrev == null) p.lnPrev = ln; var raw = 26.06 * (ln - p.lnPrev) / dt; p.lnPrev = ln;
  p.sur += (raw - p.sur) * (1 - Math.exp(-dt / 2.5));
  if (quiet) return;
  p.t += dt;
  if (rho >= 0 && p.sur > 0.05 && p.n > 1e-9) p.everCrit = true; if (p.sur > p.maxSur) p.maxSur = p.sur;
  p.histT += dt; if (p.histT >= 1) { p.histT = 0; p.hist.push([Math.round(p.t), +p.n.toExponential(4), +p.Tavg.toFixed(2), +p.sur.toFixed(3), +p.Ps.toFixed(2)]); if (p.hist.length > 3600) p.hist.shift(); }
}

/* ---------- nuclear instruments: what the meters actually read (with counting noise) ---------- */
var SRG = [1.0, 0.93], IRG = [1.0, 1.07], PRG = [1.0, 0.994, 1.008, 0.991];
function srTrue(p, i) { return 3e11 * p.n * SRG[i]; }
function irAmps(p, i) { return 1e-3 * p.n * IRG[i] + 4e-12; }
function prPct(p, i) { return 100 * p.n * PRG[i]; }
function p6(p) { return irAmps(p, 0) > 1e-10 || irAmps(p, 1) > 1e-10; }
function p10(p) { var n = 0; for (var i = 0; i < 4; i++) if (prPct(p, i) > 10) n++; return n >= 2; }
function blkd(p, k) { return !!(p[k] && p[k][0] && p[k][1]); }
var NI = { sr: [80, 75], surSr: [0, 0], pr: [0, 0, 0, 0], ir: [1e-11, 1e-11] };
function poisson(mu) { if (mu < 30) { var L = Math.exp(-mu), k = 0, q = 1; do { k++; q *= Math.random(); } while (q > L && k < 200); return k - 1; } return Math.max(0, Math.round(mu + Math.sqrt(mu) * gauss())); }
function niTick(p, dt) {
  for (var i = 0; i < 2; i++) {
    var hv = !p.srBlk[i], c = hv ? srTrue(p, i) : 0, s = hv ? poisson(c * dt) / dt : 0, a = 1 - Math.exp(-dt / 1.2);
    NI.sr[i] = hv ? Math.max(0.5, NI.sr[i] + (s - NI.sr[i]) * a) : NI.sr[i] * Math.exp(-dt * 3);
    NI.surSr[i] = hv ? p.sur + gauss() * Math.min(0.4, 2 / Math.sqrt(Math.max(1, c))) * 0.6 : 0;
    NI.ir[i] = irAmps(p, i) * (1 + gauss() * 0.01);
  }
  for (var j = 0; j < 4; j++) NI.pr[j] = Math.max(0, prPct(p, j) + gauss() * 0.04);
  p.srAvg += (srTrue(p, 0) - p.srAvg) * (1 - Math.exp(-dt / 8));
}

/* ---------- reactor protection (Section 1 set: source range, intermediate range and power range high flux, manual) ---------- */
var TRIPS = { SR: 'Source range high flux (100,000 cps)', IR: 'Intermediate range high flux (25%)', PRL: 'Power range high flux, low setpoint (25%)', PRH: 'Power range high flux, high setpoint (109%)', MAN: 'Manual reactor trip' };
function rps(p) {
  if (p.tripped) return null;
  var c = null, prs = [0, 1, 2, 3].map(function (i) { return prPct(p, i); }), over = function (v) { return prs.filter(function (x) { return x > v; }).length >= 2; };
  if ((srTrue(p, 0) > 1e5 && !p.srBlk[0]) || (srTrue(p, 1) > 1e5 && !p.srBlk[1])) c = 'SR';
  else if ((irAmps(p, 0) > 2.5e-4 && !(p.irBlk && p.irBlk[0])) || (irAmps(p, 1) > 2.5e-4 && !(p.irBlk && p.irBlk[1]))) c = 'IR';
  else if (over(109)) c = 'PRH';
  else if (over(25) && !blkd(p, 'prBlk')) c = 'PRL';
  if (c) doTrip(p, c); else c = rpsBop(p);
  return c;
}
function doTrip(p, cause) {
  if (p.tripped) return; var out = BANKS.some(function (b) { return p.rods[b] > 0; });
  p.tripped = true; p.rtb = [false, false]; p.lever = 0; p.firstOut = cause; p.trips++; if (p.x && p.x.tb.latched && cause !== 'TT') turbTrip(p, 'reactor trip'); if (out) { p.dropping = true; p.dropped = true; p.dropT = 0; p.drop0 = {}; BANKS.forEach(function (b) { p.drop0[b] = p.rods[b]; }); }
  if (S && S.onTrip) S.onTrip(cause);
}
/* P-6 gone (power back below 1E-10 A): the source range blocks reset by themselves and the detectors come back on */
function permissives(p) { if (!p6(p) && (p.srBlk[0] || p.srBlk[1])) { p.srBlk = [false, false]; if (S && S.toast) S.toast('Below P-6: the source range detectors have switched back on by themselves.'); }
  if (!p10(p) && ((p.irBlk && (p.irBlk[0] || p.irBlk[1])) || (p.prBlk && (p.prBlk[0] || p.prBlk[1])))) { p.irBlk = [false, false]; p.prBlk = [false, false]; if (S && S.toast) S.toast('Below P-10: the intermediate range and power range low trips have reset by themselves.'); } }

/* ---------- 1/M: inverse count rate ratio, plotted against control bank withdrawal to predict where the reactor will go critical ---------- */
function oneMTick(p, dt) {
  var moving = p.t - (p.moveT || -99) < 0.5; if (moving) { p.stillT = 0; return; } p.stillT += dt;
  if (p.srBlk[0] || srTrue(p, 0) > 9e5) return;
  var sdOut = SDB.every(function (b) { return p.rods[b] >= TOP; });
  if (!sdOut || p.tripped) return;
  if (p.c0 == null) { if (p.pc === 0 && p.stillT > 20) { p.c0 = p.srAvg; p.oneM = [[0, 1]]; p.lastPc = 0; if (S && S.toast) S.toast('1/M reference count rate recorded: ' + Math.round(p.c0) + ' cps. 1/M starts at 1.0.'); } return; }
  if (p.stillT > 25 && p.lastPc != null && Math.abs(p.pc - p.lastPc) >= 20 && p.pc > p.lastPc) { var m = clamp(p.c0 / Math.max(1, p.srAvg), 0, 1.2); p.oneM.push([p.pc, m]); p.lastPc = p.pc; if (S && S.toast) S.toast('1/M point plotted: ' + m.toFixed(2) + ' at ' + pcName(p.pc) + '.'); }
}
function ecpFromOneM(p) { var o = p.oneM; if (!o || o.length < 2) return null; var a = o[o.length - 2], b = o[o.length - 1]; if (!(a[1] > b[1])) return null; return b[0] + b[1] * (b[0] - a[0]) / (a[1] - b[1]); }

/* ================================================================ the rest of the plant ================================================================
   Everything outside the core: pressuriser, reactor coolant pumps, chemical & volume control (boron), steam generators,
   feedwater, main steam, turbine, generator and grid, electrical buses and diesels, cooling water, instrument air,
   safety injection, containment, xenon. Simple physics, but every switch on the boards changes something real here. */
var GRIDF = 50, VRCS = 270, LPRG = function (T) { return clamp(25 + (T - T0) * 2.35, 25, 61); };
function bop0() {
  return {
    rcp: [1, 1, 1, 1], rcpOn: [true, true, true, true], brgT: [55, 55, 55, 55],
    pz: { P: 155, L: 25, prop: 0.45, backup: false, spray: 0, porv: [false, false], porvMode: ['AUTO', 'AUTO'], blk: [true, true], master: 'AUTO', manDem: 0.45, lvl: 'AUTO', heaters: true, bkup: 'AUTO', sprayMan: 'AUTO', sprayDem: 0, prt: 70, prtP: 0.3, safety: false, pI: 0 },
    cv: { ccp: [true, false], pd: false, orif: [false, true, false], ltdIso: false, chg: 17.8, ltd: 17.0, chgMode: 'AUTO', chgDem: 17.8, lI: 0, vct: 46, mode: 'AUTO', run: false, dilF: 10, baF: 2, batch: 1000, done: 0, bat: 82, baPump: [true, false], seal: 3.1, mkup: 0, divert: false },
    sg: [0, 1, 2, 3].map(function () { return { L: 50, Lm: 50, msiv: true, frv: 0, frvMode: 'AUTO', frvDem: 0, fI: 0, afwV: 0.3, afwMode: 'AUTO', afwDem: 0.3, porv: false, porvMode: 'AUTO', feed: 0, steam: 0, sf: 0, sfS: 0 }; }),
    mfp: [false, false], mdafw: [true, true], tdafw: false, cond: [true, true], cw: [true, true, false, false], vac: 0.062, hotwell: 61,
    dumpMode: 'PRESS', dumpCtl: 'AUTO', dumpDem: 0, sgPorvSet: 79,
    tb: { latched: false, rpm: 31, set: 0, rate: 150, tg: true, sv: 0, gv: 0, steam: 0, mw: 0, load: 0, lrate: 30, gen: false, field: false, exc: 0, kv: 0, phase: 0, mvar: 0, mvarSet: 0, trip: true, tripWhy: '', syncSel: 'OFF' },
    el: { stn: true, unitTx: false, busA: true, busB: true, esbA: true, esbB: true, tieA: true, tieB: true, edg: [{ run: false, rpm: 0, bkr: false, mode: 'AUTO', kw: 0 }, { run: false, rpm: 0, bkr: false, mode: 'AUTO', kw: 0 }], dc: [130, 130], chg: [true, true], grid: true },
    aux: { ccw: [true, true, false], sw: [true, true, false, false], air: [true, false], airP: 7.0, fan: [true, true, true, false], ccwT: 31, swT: 12.4, hvac: true },
    si: { on: false, at: -1, blkP: false, blkS: false, pumps: [false, false], rhr: [false, false], acc: [true, true, true, true], cs: [false, false], phaseA: false, rwst: 96, flow: 0 },
    ct: { P: 0.0, T: 32, hum: 40, sump: 2 },
    xe: { I: 0, X: 0 },
    ar: 'MAN', rodAuto: 0, firstHeat: false, log: []
  };
}
function psat(T) { var lo = 1, hi = 185; for (var k = 0; k < 30; k++) { var m = (lo + hi) / 2; if (tsat(m) < T) lo = m; else hi = m; } return (lo + hi) / 2; }
function bop(p) { if (!p.x) p.x = bop0(); return p.x; }
function xeRho(p) { return -(p.x ? p.x.xe.X : 0); }
/* which buses have power: everything on the unit boards needs the station transformer (grid) or the unit transformer (generator) */
function busOn(x, b) { var e = x.el; if (b === 'A') return e.busA && (e.stn && e.grid || e.unitTx && x.tb.gen); if (b === 'B') return e.busB && (e.stn && e.grid || e.unitTx && x.tb.gen);
  if (b === 'EA') return (e.tieA && busOn(x, 'A')) || (e.edg[0].bkr && e.edg[0].rpm > 2900); if (b === 'EB') return (e.tieB && busOn(x, 'B')) || (e.edg[1].bkr && e.edg[1].rpm > 2900); return true; }
var PUMPBUS = { rcp: ['A', 'B', 'A', 'B'], ccp: ['EA', 'EB'], pd: 'A', mfp: ['A', 'B'], mdafw: ['EA', 'EB'], cond: ['A', 'B'], cw: ['A', 'B', 'A', 'B'], ccw: ['EA', 'EB', 'EA'], sw: ['EA', 'EB', 'EA', 'EB'], air: ['A', 'B'], sip: ['EA', 'EB'], rhr: ['EA', 'EB'], cs: ['EA', 'EB'], fan: ['EA', 'EB', 'EA', 'EB'], bap: ['EA', 'EB'] };
function pwr(x, kind, i) { var b = PUMPBUS[kind]; return busOn(x, typeof b === 'string' ? b : b[i]); }
function bopLog(p, t) { if (p._q) return; if (typeof S !== 'undefined' && S && S.addLog) S.addLog(t); }
function trefC(x) { return T0 + 15.3 * clamp(x.tb.mw / 1150, 0, 1); }
/* thermal-hydraulics + everything else, called from plantStep */
function bopStep(p, dt, Q) {
  var x = bop(p), pz = x.pz, cv = x.cv, tb = x.tb, i, f = x.f || (x.f = {});
  /* instructor faults */
  if (f.grid) { x.el.grid = false; if (tb.gen) { tb.gen = false; x.el.unitTx = false; bopLog(p, 'Generator breaker opened: grid lost'); turbTrip(p, 'loss of grid (load rejection)'); } } if (f.ccw) x.aux.ccw = [false, false, false]; if (f.mfpA) x.mfp[0] = false; if (f.cw) x.cw = [false, false, false, false];
  /* ---- reactor coolant pumps: coast down over ~40 s when stopped ---- */
  var ccwOK = x.aux.ccw.some(function (c, k) { return c && pwr(x, 'ccw', k); }) && x.aux.sw.some(function (c, k) { return c && pwr(x, 'sw', k); });
  for (i = 0; i < 4; i++) { var on = x.rcpOn[i] && pwr(x, 'rcp', i); if (x.rcpOn[i] && !pwr(x, 'rcp', i)) { x.rcpOn[i] = false; bopLog(p, 'RCP ' + (i + 1) + ' tripped: no power on its board'); }
    x.rcp[i] += ((on ? 1 : 0) - x.rcp[i]) * (1 - Math.exp(-dt / (on ? 6 : 14)));
    x.brgT[i] += ((on ? (ccwOK ? 55 : 120) : 40) - x.brgT[i]) * (1 - Math.exp(-dt / 180)); if (x.rcpOn[i] && x.brgT[i] > 95) { x.rcpOn[i] = false; bopLog(p, 'RCP ' + (i + 1) + ' tripped on high bearing temperature (no cooling water)'); } }
  var W = Math.max(0.035, (x.rcp[0] + x.rcp[1] + x.rcp[2] + x.rcp[3]) / 4), rcpQ = 5 * (x.rcp[0] + x.rcp[1] + x.rcp[2] + x.rcp[3]);
  /* ---- steam generators: heat goes into those with water, steam leaves through the MSIVs ---- */
  var ts = tsat(p.Ps), wet = x.sg.filter(function (s) { return s.Lm > 3; }).length / 4, ua = UA * (0.35 + 0.65 * Math.sqrt(W)) * wet, qsg = ua * (p.Tavg - ts);
  p.Tf += ((p.Tavg + 460 * Math.min(p.n, 1.3) / Math.sqrt(Math.max(W, 0.2))) - p.Tf) * (1 - Math.exp(-dt / 5));
  var dT0 = p.Tavg; p.Tavg += (Q + rcpQ - qsg - 1.5 + (x.si.flow > 0 ? -x.si.flow * 0.08 : 0)) / CRCS * dt; var dTdt = (p.Tavg - dT0) / dt;
  /* ---- turbine and generator ---- */
  var anyMsiv = x.sg.some(function (s) { return s.msiv; }), vacOK = x.vac < 0.2;
  if (tb.latched) { tb.tg = false;
    if (!tb.gen) { var tgt = tb.set; tb.rpm += clamp(tgt - tb.rpm, -tb.rate / 60 * dt * 2, tb.rate / 60 * dt); tb.steam = (anyMsiv ? 1 : 0) * 0.02 * FULL * Math.pow(tb.rpm / 3000, 2); if (!anyMsiv || p.Ps < 20) { tb.rpm = Math.max(0, tb.rpm - 20 * dt); } }
    else { tb.rpm = GRIDF * 60; var lim = p.Ps > 55 && anyMsiv ? 1 : clamp((p.Ps - 35) / 20, 0, 1); var tl = Math.min(tb.load, 1250 * lim); tb.mw += clamp(tl - tb.mw, -tb.lrate / 60 * dt * 3, tb.lrate / 60 * dt); tb.steam = (tb.mw / 0.335) + 0.02 * FULL; }
    if (tb.rpm > 3300) turbTrip(p, 'overspeed'); if (!vacOK) turbTrip(p, 'low condenser vacuum'); }
  else { tb.steam = 0; tb.mw += (0 - tb.mw) * (1 - Math.exp(-dt / 0.5)); if (!tb.gen) tb.rpm = Math.max(tb.tg ? 31 : 0, tb.rpm - (tb.rpm > 400 ? 6 : 2) * dt); if (tb.gen) tb.rpm = GRIDF * 60; }
  tb.gv = tb.latched ? clamp(tb.steam / (FULL * 0.34), 0, 1) : 0; tb.sv = tb.latched ? 1 : 0;
  if (tb.gen && !tb.latched) { tb.motT = (tb.motT || 0) + dt; if (tb.motT > 2) { tb.gen = false; x.el.unitTx = false; tb.motT = 0; bopLog(p, 'Generator breaker opened by reverse power protection (turbine tripped)'); } } else tb.motT = 0;
  tb.exc += ((tb.field ? (tb.excSet == null ? 1 : tb.excSet) : 0) - tb.exc) * (1 - Math.exp(-dt / 2.5)); tb.kv = 22 * tb.exc * Math.min(1, tb.rpm / 3000);
  if (!tb.gen) tb.phase = ((tb.phase + 360 * (tb.rpm / 60 - GRIDF) * dt) % 360 + 540) % 360 - 180; else tb.phase = 0;
  tb.mvar += ((tb.gen ? tb.mvarSet : 0) - tb.mvar) * (1 - Math.exp(-dt / 3));
  /* ---- steam dumps: STEAM PRESSURE mode holds 76.3 bar; TAVG mode opens on a hot-leg excess over Tref; blocked by P-12 (Tavg < 286 °C) and without condenser vacuum (C-9) ---- */
  var c9 = vacOK && x.cw.filter(function (c, k) { return c && pwr(x, 'cw', k); }).length >= 1, p12 = p.Tavg < 286, dem = 0, err = p.Ps - PSP;
  if (x.dumpMode === 'PRESS') { p.dI = clamp(p.dI + err * dt * 0.015, 0, 1); dem = x.dumpCtl === 'AUTO' ? clamp(0.35 * err + p.dI, 0, 1) : x.dumpDem; }
  else if (x.dumpMode === 'TAVG') { p.dI = clamp(p.dI - dt * 0.02, 0, 1); dem = clamp((p.Tavg - trefC(x) - 1.7) / 8, 0, 1); }
  if (!c9 || p12 || !anyMsiv || x.aux.airP < 4) dem = 0;
  p.dump += (dem - p.dump) * (1 - Math.exp(-dt / 1.2));
  var porvQ = 0; x.sg.forEach(function (s) { s.porv = s.porvMode === 'OPEN' || (s.porvMode === 'AUTO' && p.Ps > x.sgPorvSet + (s.porv ? -1 : 0)); if (s.porv) porvQ += 0.025 * FULL * clamp((p.Ps - 10) / 70, 0, 1.2); });
  var relief = p.Ps > 84 ? (p.Ps - 84) * 600 : 0, steamOut = p.dump * 0.4 * FULL + tb.steam + porvQ + relief + (x.tdafw ? 6 : 0) + 4;
  p.Ps += (qsg - steamOut) / 400 * dt; if (p.Ps < 1) p.Ps = 1;
  /* ---- steam generator levels: feed in, steam out, with swell (level jumps up briefly when steam flow increases) ---- */
  var stmPct = steamOut / FULL * 100, msivN = x.sg.filter(function (s) { return s.msiv; }).length || 1, airOK = x.aux.airP > 4;
  var mfpN = x.mfp.filter(function (m, k) { return m && pwr(x, 'mfp', k) && x.cond.some(function (c, j) { return c && pwr(x, 'cond', j); }); }).length;
  if (mfpN === 0) x.mfp.forEach(function (m, k) { if (m && !x.cond.some(function (c, j) { return c && pwr(x, 'cond', j); })) { x.mfp[k] = false; bopLog(p, 'Main feed pump ' + 'AB'[k] + ' tripped: no condensate pumps'); } });
  x.sg.forEach(function (s, k) {
    s.steam = s.msiv ? (stmPct - (s.porv ? 0 : 0)) / msivN * (msivN / 4) * 4 / 4 : (s.porv ? 2.5 : 0); if (!s.msiv && s.porv) s.steam = porvQ / FULL * 100 / 4;
    if (s.msiv) s.steam = (p.dump * 0.4 * FULL + tb.steam + relief) / FULL * 100 / msivN + (s.porv ? 0.025 * 100 : 0) * clamp((p.Ps - 10) / 70, 0, 1.2) + 4 / FULL * 100 / 4;
    s.sfS += (s.steam - s.sfS) * (1 - Math.exp(-dt / 25));
    /* main feed through the feed regulating valve (3-element control: feed matches steam, trimmed by level) */
    if (s.frvMode === 'AUTO') { s.fI = clamp(s.fI + (50 - s.L) * 0.0015 * dt, -0.3, 0.3); s.frvDem = clamp(s.steam / 28 + 0.04 * (50 - s.L) + s.fI, 0, 1); }
    s.frv += ((airOK && !x.fwIso ? s.frvDem : 0) - s.frv) * (1 - Math.exp(-dt / 3));
    var mf = mfpN ? s.frv * 14 * mfpN : 0;
    var afwSrc = (x.mdafw[k < 2 ? 0 : 1] && pwr(x, 'mdafw', k < 2 ? 0 : 1) ? 3 : 0) + (x.tdafw && p.Ps > 8 ? 2.5 : 0);
    if (s.afwMode === 'AUTO') s.afwDem = clamp(0.3 + (50 - s.L) * 0.05 + s.steam / 4, 0, 1);
    s.afwV += ((airOK ? s.afwDem : 1) - s.afwV) * (1 - Math.exp(-dt / 4)); var af = afwSrc * s.afwV;
    s.feed = mf + af; s.Lm = clamp(s.Lm + (s.feed - s.steam) * 0.02 * dt, 0, 100);
    s.L = clamp(s.Lm + 6 * (s.steam - s.sfS) / 25, 0, 100);
  });
  /* ---- condenser, circulating water ---- */
  var cwN = x.cw.filter(function (c, k) { return c && pwr(x, 'cw', k); }).length; x.vac += ((cwN >= 1 ? 0.062 + (steamOut / FULL) * 0.03 * (cwN >= 2 ? 1 : 2) : 1.0) - x.vac) * (1 - Math.exp(-dt / (cwN ? 30 : 60)));
  /* ---- pressuriser: heaters raise pressure, spray (needs loops 1-2 pumps) lowers it, PORVs at 162 bar, safeties at 172 bar ---- */
  var e = pz.P - 155;
  if (pz.master === 'AUTO') { pz.pI = clamp(pz.pI - e * dt * 0.004, -0.5, 0.5); pz.prop = clamp(0.45 - e / 1.5 + pz.pI, 0, 1); if (pz.bkup === 'AUTO') pz.backup = e < -1.7 ? true : e > -0.7 ? false : pz.backup; if (pz.sprayMan === 'AUTO') pz.spray = clamp((e - 1.7) / 4, 0, 1); }
  else { pz.prop = pz.manDem; if (pz.sprayMan === 'AUTO') pz.spray = clamp((e - 1.7) / 4, 0, 1); }
  if (pz.sprayMan === 'MAN') pz.spray = pz.sprayDem;
  if (pz.bkup === 'ON') pz.backup = true; if (pz.bkup === 'OFF') pz.backup = false;
  var htrOK = pz.L > 17 && busOn(x, 'EA'), heatMW = htrOK && pz.heaters ? 1.8 * pz.prop + (pz.backup ? 1.6 : 0) : 0, sprayEff = pz.spray * Math.max(x.rcp[0], x.rcp[1]) * (airOK ? 1 : 0);
  for (i = 0; i < 2; i++) { var o = pz.porvMode[i] === 'OPEN' || (pz.porvMode[i] === 'AUTO' && pz.P > (pz.porv[i] ? 160.5 : 162.3)); pz.porv[i] = o && airOK; } if (f.porv) pz.porv[0] = true;
  var porvN = (pz.porv[0] && pz.blk[0] ? 1 : 0) + (pz.porv[1] && pz.blk[1] ? 1 : 0); pz.safety = pz.P > 172;
  /* level: thermal expansion of the coolant plus charging minus letdown */
  var sealIn = cv.ccp.some(Boolean) || cv.pd ? 2.0 : -1.2, siIn = x.si.flow;
  var sgtl = f.sgtl ? 6 * clamp((pz.P - p.Ps) / 80, 0, 1) : 0; if (sgtl) x.sg[0].Lm = Math.min(100, x.sg[0].Lm + sgtl * 0.0004 * dt);
  var dLdt = 2.35 * dTdt + (cv.chg + sealIn + siIn - cv.ltd - porvN * 4 - (pz.safety ? 40 : 0) - sgtl) / 3600 / 0.51;
  pz.L = clamp(pz.L + dLdt * dt, 0, 100);
  pz.P += (0.0062 * (heatMW - 0.6 - sprayEff * 15) + 0.55 * dLdt - porvN * 0.45 * Math.sqrt(pz.P / 155) - (pz.safety ? 3 : 0)) * dt;
  /* below saturation the hottest coolant flashes to steam, which holds pressure up (and swells the pressuriser level, as at Three Mile Island) */
  var pf = psat(p.Tavg + 18.5 * Math.min(p.n, 1.2)); if (pz.P < pf) { pz.P += (pf - pz.P) * (1 - Math.exp(-dt / 6)); pz.L = clamp(pz.L + (pf - pz.P) * 0.05 * dt, 0, 100); } pz.P = clamp(pz.P, 1, 185);
  if (porvN || pz.safety) { pz.prt = Math.min(100, pz.prt + (porvN * 0.05 + (pz.safety ? 0.4 : 0)) * dt); pz.prtP = Math.min(7, pz.prtP + (porvN * 0.004 + (pz.safety ? 0.05 : 0)) * dt); }
  p.rcs = pz.P; p.pzr = pz.L;
  /* ---- chemical & volume control: charging holds pressuriser level on programme, letdown through the orifices ---- */
  var chgPumps = cv.ccp.filter(function (c, k) { return c && pwr(x, 'ccp', k); }).length + (cv.pd && pwr(x, 'pd') ? 1 : 0);
  if (cv.chgMode === 'AUTO') { var le = LPRG(p.Tavg) - pz.L; cv.lI = clamp(cv.lI + le * dt * 0.02, -15, 15); cv.chgDem = clamp(cv.ltd - 2 + le * 2.5 + cv.lI, 0, 30); }
  cv.chg += ((chgPumps && airOK ? cv.chgDem : 0) - cv.chg) * (1 - Math.exp(-dt / 3));
  if (!cv.ltdIso && (pz.L < 17 || !chgPumps || !airOK || x.si.phaseA)) { cv.ltdIso = true; bopLog(p, 'Letdown isolated' + (pz.L < 17 ? ' (pressuriser level low)' : !chgPumps ? ' (no charging flow)' : x.si.phaseA ? ' (containment isolation)' : ' (no instrument air)')); }
  var orifQ = (cv.orif[0] ? 10.2 : 0) + (cv.orif[1] ? 17.0 : 0) + (cv.orif[2] ? 17.0 : 0); cv.ltd += ((cv.ltdIso ? 0 : orifQ * Math.sqrt(pz.P / 155)) - cv.ltd) * (1 - Math.exp(-dt / 2));
  /* makeup: boration and dilution change the RCS boron concentration (mixing through 270 m³ of coolant) */
  cv.mkup = 0; var cin = p.boron, rate = 0;
  if (cv.run) { if (cv.mode === 'DIL' || cv.mode === 'ALTDIL') { rate = cv.dilF; cin = 0; } else if (cv.mode === 'BOR') { rate = cv.baF; cin = 7000; } else if (cv.mode === 'MAN') { rate = cv.dilF + cv.baF; cin = (cv.baF * 7000) / Math.max(0.1, rate); }
    var bapOK = cv.baPump.some(function (b, k) { return b && pwr(x, 'bap', k); }); if (cin > 0 && !bapOK) { rate = cv.mode === 'MAN' ? cv.dilF : 0; cin = 0; }
    cv.done += rate / 3.6 * dt; cv.mkup = rate; if (cin > 0) cv.bat = Math.max(0, cv.bat - (cv.mode === 'BOR' ? rate : cv.baF) * dt / 3600 * 2);
    if (cv.done >= cv.batch) { cv.run = false; bopLog(p, 'Make-up batch complete: ' + Math.round(cv.done) + ' litres'); } }
  if (cv.mode === 'AUTO' && cv.vct < 20) cv.autoMk = true; if (cv.vct > 40) cv.autoMk = false; if (cv.autoMk) { cv.mkup = 18; }
  var chgEff = rate * (cv.mode === 'ALTDIL' ? 1.4 : 1); if (chgEff > 0 && chgPumps) p.boron += (cin - p.boron) * chgEff / VRCS / 3600 * dt; /* make-up blends in the VCT and reaches the core through the charging pumps */
  if (siIn > 0) p.boron += (2400 - p.boron) * siIn / VRCS / 3600 * dt;
  p.boron = clamp(p.boron, 0, 4000); if (cv.pb == null) cv.pb = p.boron; cv.bTr = (cv.bTr || 0) + ((p.boron - cv.pb) / dt * 60 - (cv.bTr || 0)) * (1 - Math.exp(-dt / 8)); cv.pb = p.boron;
  cv.divert = cv.vct > 87; cv.vct = clamp(cv.vct + (cv.ltd + (sealIn < 0 ? 0 : 1.2) - cv.chg - (sealIn > 0 ? 3.1 : 0) + cv.mkup - (cv.divert ? 15 : 0)) / 0.1 / 3600 * 0.1 * dt * 10, 0, 100);
  /* ---- safety injection: pressuriser pressure < 127 bar or steam pressure < 41 bar (unless blocked below P-11), or containment pressure high ---- */
  var p11 = pz.P < 136; if (!p11) { x.si.blkP = false; x.si.blkS = false; }
  if (!x.si.on && ((pz.P < 127 && !x.si.blkP) || (p.Ps < 41 && !x.si.blkS) || x.ct.P > 0.3)) siActuate(p, pz.P < 127 ? 'pressuriser pressure low' : p.Ps < 41 ? 'steam line pressure low' : 'containment pressure high');
  var siHead = 0; if (x.si.on || x.si.pumps.some(Boolean)) { x.si.pumps.forEach(function (on2, k) { if (on2 && pwr(x, 'sip', k)) siHead += clamp((115 - pz.P) / 30, 0, 1) * 60; }); }
  cv.ccp.forEach(function (on2, k) { if (on2 && pwr(x, 'ccp', k) && x.si.on) siHead += clamp((175 - pz.P) / 60, 0, 1) * 25; });
  x.si.rhr.forEach(function (on2, k) { if (on2 && pwr(x, 'rhr', k)) siHead += clamp((14 - pz.P) / 10, 0, 1) * 300; });
  x.si.flow = (x.si.on || siHead > 0) && x.si.rwst > 0 ? siHead : 0; x.si.rwst = Math.max(0, x.si.rwst - x.si.flow / 3600 / 18 * dt);
  /* ---- containment ---- */
  var leak = (pz.safety || porvN) && pz.prtP > 6 ? 1 : 0, fans = x.aux.fan.filter(function (f, k) { return f && pwr(x, 'fan', k); }).length, sprays = x.si.cs.filter(function (c, k) { return c && pwr(x, 'cs', k); }).length;
  x.ct.T += ((32 + leak * 60) - x.ct.T - fans * 0.5 * (x.ct.T > 33 ? 1 : 0)) * (1 - Math.exp(-dt / 600)) - sprays * 0.01 * dt; x.ct.P = clamp(x.ct.P + (leak * 0.01 - sprays * 0.003 - fans * 0.0003) * dt, -0.02, 4); if (x.ct.P < 0) x.ct.P += 0.0005 * dt;
  if (x.ct.P > 1.0 && !x.si.cs.every(Boolean)) { x.si.cs = [true, true]; bopLog(p, 'Containment spray actuated (containment pressure high-3)'); }
  /* ---- electrical: diesels start on bus undervoltage or SI, come up to 3000 rpm (50 Hz) in about 10 s ---- */
  x.el.edg.forEach(function (g, k) { var bus = k ? 'EB' : 'EA', dead = !((k ? x.el.tieB : x.el.tieA) && busOn(x, k ? 'B' : 'A'));
    if (g.mode === 'AUTO' && !g.run && (dead || x.si.on)) { g.run = true; bopLog(p, 'Diesel generator ' + 'AB'[k] + ' auto-started (' + (dead ? 'bus undervoltage' : 'safety injection') + ')'); }
    g.rpm += ((g.run ? 3000 : 0) - g.rpm) * (1 - Math.exp(-dt / (g.run ? 3 : 8))); if (g.mode === 'AUTO' && g.run && g.rpm > 2900 && dead && !g.bkr) { g.bkr = true; if (k) x.el.tieB = false; else x.el.tieA = false; bopLog(p, 'Diesel generator ' + 'AB'[k] + ' breaker closed onto the dead safety bus'); }
    if (!g.run) g.bkr = false; g.kw = g.bkr ? 2100 + 300 * Math.sin(p.t / 7 + k) : g.run ? 80 : 0; });
  x.el.dc.forEach(function (v, k) { x.el.dc[k] += (((x.el.chg[k] && busOn(x, k ? 'EB' : 'EA')) ? 131 : 118) - v) * (1 - Math.exp(-dt / 600)); });
  /* ---- instrument air: compressors hold 7 bar; without them pressure bleeds away and air-operated valves fail safe ---- */
  var airN = f.air ? 0 : x.aux.air.filter(function (a, k) { return a && pwr(x, 'air', k); }).length; x.aux.airP = clamp(x.aux.airP + (airN ? (7.2 - x.aux.airP) * 0.05 : -0.004) * dt, 0, 7.5);
  x.aux.ccwT += ((ccwOK ? 31 + p.n * 8 : 50) - x.aux.ccwT) * (1 - Math.exp(-dt / 300));
  /* ---- xenon-135: builds up from iodine decay after power changes; worth about 2800 pcm at full power ---- */
  var ph = Math.max(0, p.n), gI = 0.2418, gX = 0.0127; x.xe.I += (gI * ph - 2.87e-5 * x.xe.I) * dt; x.xe.X += (gX * ph + 2.87e-5 * x.xe.I - 2.09e-5 * x.xe.X - 7e-5 * ph * x.xe.X) * dt;
  /* ---- automatic rod control: rods follow Tavg to Tref once the turbine is above 15% load (C-5) ---- */
  if (p.sel === 'AUTO' && p.rtb[0] && p.rtb[1] && tb.mw > 170) { var te = p.Tavg - trefC(x), spm = Math.abs(te) < 0.8 ? 0 : clamp(8 + (Math.abs(te) - 0.8) * 24, 8, 72); x.rodAuto += spm / 60 * dt;
    while (x.rodAuto >= 1) { x.rodAuto -= 1; stepOnce(p, 'MAN', te > 0 ? -1 : 1); } } else x.rodAuto = 0;
}
function turbTrip(p, why) { var x = bop(p), tb = x.tb; if (!tb.latched) return; tb.latched = false; tb.trip = true; tb.tripWhy = why; tb.set = 0; bopLog(p, 'TURBINE TRIP: ' + why);
  if (typeof S !== 'undefined' && S && S.toast) S.toast('⚠ Turbine trip: ' + why, 'bad'); if (p.n > 0.5 && !p.tripped) doTrip(p, 'TT'); if (x.dumpMode === 'PRESS' && p.n > 0.1) { /* the dumps take the steam */ } }
function siActuate(p, why) { var x = bop(p), si = x.si; if (si.on) return; si.on = true; si.at = p.t; si.pumps = [true, true]; si.rhr = [true, true]; x.cv.ccp = [true, true]; si.phaseA = true; x.mfp = [false, false]; x.fwIso = true; x.mdafw = [true, true]; x.tdafw = true;
  bopLog(p, 'SAFETY INJECTION: ' + why); if (typeof S !== 'undefined' && S && S.toast) S.toast('⚠ Safety injection: ' + why, 'bad'); if (!p.tripped) doTrip(p, 'SI'); turbTrip(p, 'safety injection'); }
/* extra reactor protection trips that need the rest of the plant */
function rpsBop(p) {
  if (p.tripped || !p.x) return null; var x = p.x, pr = p.n * 100, p7 = pr > 10 || x.tb.mw > 115, c = null, low = x.rcp.filter(function (r) { return r < 0.9; }).length;
  if (p7 && x.pz.P < 134) c = 'PZRPL'; else if (x.pz.P > 166) c = 'PZRPH'; else if (p7 && x.pz.L > 92) c = 'PZRL';
  else if ((pr > 30 && low >= 1) || (p7 && low >= 2)) c = 'LOFLOW'; else if (x.sg.some(function (s) { return s.L < 17; })) c = 'SGLL';
  else if (p.Tavg > 312 && pr > 10) c = 'OTDT';
  if (c) doTrip(p, c); if (x.sg.some(function (s) { return s.L > 85; }) && !x.p14) { x.p14 = true; x.mfp = [false, false]; x.fwIso = true; turbTrip(p, 'steam generator level high-high (P-14)'); } if (x.sg.every(function (s) { return s.L < 75; })) x.p14 = false;
  return c;
}
Object.assign(TRIPS, { PZRPL: 'Pressuriser pressure low (134 bar)', PZRPH: 'Pressuriser pressure high (166 bar)', PZRL: 'Pressuriser level high (92%)', LOFLOW: 'Reactor coolant flow low', SGLL: 'Steam generator level low-low (17%)', OTDT: 'Overtemperature ΔT', TT: 'Turbine trip above P-9 (50% power)', SI: 'Safety injection' });

/* ================================================================ drawing helpers ================================================================ */
var ANISO = 4, S = null, root = null, R3 = null;
function CV(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function texOf(c) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function speck(g, w, h, n, a) { for (var i = 0; i < n; i++) { g.fillStyle = (Math.random() < 0.5 ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + (Math.random() * a).toFixed(3) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
var FONT = 'Arial,"Helvetica Neue",Helvetica,sans-serif', MONO = '"Consolas","Menlo","Courier New",monospace';
/* condensed engraved text, like the labels on a real board */
function ctext(g, s, x, y, px, col, align, wmax, weight) { g.save(); g.font = (weight || 'bold') + ' ' + px + 'px ' + FONT; g.fillStyle = col || '#fff'; g.textAlign = align || 'center'; g.textBaseline = 'middle'; var w = g.measureText(s).width, k = wmax && w > wmax ? wmax / w : 1; g.translate(x, y); g.scale(Math.min(k, 0.86), 1); g.fillText(s, 0, 0); g.restore(); }
function tag(g, s, x, y, w, h, px, bg, fg) { g.fillStyle = bg || '#16191c'; rr(g, x - w / 2, y - h / 2, w, h, Math.min(6, h / 4)); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.stroke(); var lines = String(s).split('\n'); lines.forEach(function (ln, i) { ctext(g, ln, x, y + (i - (lines.length - 1) / 2) * px * 1.05, px, fg || '#f2f2ee', 'center', w - 6); }); }
function screw(g, x, y, r) { var gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, '#f4f4f0'); gr.addColorStop(1, '#7c807c'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = r * 0.35; g.beginPath(); g.moveTo(x - r * 0.6, y); g.lineTo(x + r * 0.6, y); g.stroke(); }
function superExp(g, base, ex, x, y, px, col, align) { g.save(); g.fillStyle = col; g.textBaseline = 'middle'; g.font = 'bold ' + px + 'px ' + FONT; var bw = g.measureText(base).width; g.font = 'bold ' + Math.round(px * 0.68) + 'px ' + FONT; var ew = g.measureText(ex).width, tw = bw + ew, sx = align === 'right' ? x - tw : align === 'left' ? x : x - tw / 2; g.font = 'bold ' + px + 'px ' + FONT; g.textAlign = 'left'; g.fillText(base, sx, y); g.font = 'bold ' + Math.round(px * 0.68) + 'px ' + FONT; g.fillText(ex, sx + bw, y - px * 0.36); g.restore(); }

/* ================================================================ widgets ================================================================
   Every instrument is its own small mesh with its own canvas, redrawn only when what it shows has changed. */
var WG = [];
function widget(opts) {
  var c = CV(opts.cw, opts.ch), t = texOf(c), mt = opts.glow ? new THREE.MeshBasicMaterial({ map: t, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: t, roughness: opts.rough == null ? 0.55 : opts.rough, metalness: 0.0 });
  var m = new THREE.Mesh(new THREE.PlaneGeometry(opts.w, opts.h), mt), w = { m: m, c: c, g: c.getContext('2d'), t: t, last: null, draw: opts.draw, key: opts.key, every: opts.every || 0, acc: 0, o: opts };
  m.userData.tip = opts.tip; m.userData.w = w; WG.push(w); return w;
}
function redraw(w, force) { var k = w.key ? w.key() : 1; if (!force && k === w.last) return false; w.last = k; w.g.save(); w.draw(w.g, w); w.g.restore(); w.t.needsUpdate = true; return true; }
/* edgewise vertical meter (the classic tall narrow control-board meter) */
function meterE(o) {
  o.cw = 104; o.ch = 300; o.w = o.w || 0.078; o.h = o.h || 0.225;
  var frac = function () { var v = o.v(); if (o.log) { var a = Math.log10(o.min), b = Math.log10(o.max); return clamp((Math.log10(Math.max(v, o.min * 0.5)) - a) / (b - a), -0.02, 1.02); } return clamp((v - o.min) / (o.max - o.min), -0.02, 1.02); };
  o.key = function () { return Math.round(frac() * 500) + (o.alarm && o.alarm() ? 'a' : ''); };
  o.draw = function (g) {
    var W = 104, H = 300, top = 40, bot = 262, f = frac();
    g.fillStyle = '#121416'; g.fillRect(0, 0, W, H); g.fillStyle = '#26292c'; g.fillRect(3, 3, W - 6, H - 6);
    g.fillStyle = '#f3f1e8'; g.fillRect(10, top - 10, W - 20, bot - top + 20);
    var gr = g.createLinearGradient(10, 0, W - 10, 0); gr.addColorStop(0, 'rgba(0,0,0,.10)'); gr.addColorStop(0.5, 'rgba(255,255,255,.0)'); gr.addColorStop(1, 'rgba(0,0,0,.14)'); g.fillStyle = gr; g.fillRect(10, top - 10, W - 20, bot - top + 20);
    ctext(g, o.lbl, W / 2, 16, 17, '#fff', 'center', W - 10);
    ctext(g, o.unit || '', W / 2, H - 22, 14, '#d7dbe0', 'center', W - 8, '600');
    if (o.bands) o.bands.forEach(function (b) { var y0 = bot - (bot - top) * b[0], y1 = bot - (bot - top) * b[1]; g.fillStyle = b[2]; g.fillRect(14, y1, 9, y0 - y1); });
    g.strokeStyle = '#111'; g.fillStyle = '#111'; g.lineWidth = 1.4;
    if (o.log) { var a = Math.log10(o.min), b = Math.log10(o.max), nd = b - a;
      for (var d = 0; d <= nd; d++) { var y = bot - (bot - top) * d / nd; g.lineWidth = 2; g.beginPath(); g.moveTo(14, y); g.lineTo(40, y); g.stroke(); superExp(g, '10', String(a + d), 44, y, 15, '#111', 'left');
        if (d < nd) for (var k = 2; k <= 9; k++) { var yy = y - (bot - top) / nd * Math.log10(k); g.lineWidth = 1; g.beginPath(); g.moveTo(14, yy); g.lineTo(k === 5 ? 32 : 26, yy); g.stroke(); } } }
    else { var mj = o.major || 5, mn = o.minor || 5;
      for (var i = 0; i <= mj * mn; i++) { var y2 = bot - (bot - top) * i / (mj * mn), M = i % mn === 0; g.lineWidth = M ? 2 : 1; g.beginPath(); g.moveTo(14, y2); g.lineTo(M ? 40 : 28, y2); g.stroke();
        if (M) { var val = o.min + (o.max - o.min) * i / (mj * mn); ctext(g, o.fmt ? o.fmt(val) : String(Math.round(val)), 66, y2, 16, '#111', 'center', 44); } } }
    var py = bot - (bot - top) * f, al = o.alarm && o.alarm();
    g.fillStyle = al ? '#ff3b1f' : '#d0201a'; g.beginPath(); g.moveTo(W - 12, py - 9); g.lineTo(W - 12, py + 9); g.lineTo(W - 34, py); g.closePath(); g.fill(); g.fillRect(16, py - 1.4, W - 30, 2.8);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(10, top - 10, (W - 20) * 0.45, bot - top + 20);
  };
  return widget(o);
}
/* round meter (startup rate, synchroscope style) */
function meterR(o) {
  o.cw = 220; o.ch = 200; o.w = o.w || 0.13; o.h = o.h || 0.118;
  var frac = function () { return clamp((o.v() - o.min) / (o.max - o.min), -0.03, 1.03); };
  o.key = function () { return Math.round(frac() * 400); };
  o.draw = function (g) {
    var W = 220, H = 200, cx = W / 2, cy = 128, R = 84, a0 = Math.PI * 0.82, a1 = Math.PI * 2.18;
    g.fillStyle = '#121416'; g.fillRect(0, 0, W, H); g.fillStyle = '#f3f1e8'; rr(g, 8, 8, W - 16, H - 16, 10); g.fill();
    ctext(g, o.lbl, cx, 26, 17, '#111', 'center', W - 20);
    if (o.bands) o.bands.forEach(function (b) { g.strokeStyle = b[2]; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, R - 4, a0 + (a1 - a0) * b[0], a0 + (a1 - a0) * b[1]); g.stroke(); });
    var mj = o.major || 6; g.strokeStyle = '#111'; g.lineWidth = 2;
    for (var i = 0; i <= mj * 2; i++) { var a = a0 + (a1 - a0) * i / (mj * 2), M = i % 2 === 0; g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * (R - (M ? 16 : 9)), cy + Math.sin(a) * (R - (M ? 16 : 9))); g.stroke();
      if (M) ctext(g, o.fmt ? o.fmt(o.min + (o.max - o.min) * i / (mj * 2)) : String(Math.round(o.min + (o.max - o.min) * i / (mj * 2))), cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30), 15, '#111'); }
    ctext(g, o.unit || '', cx, cy + 42, 13, '#333', 'center', 120, '600');
    var an = a0 + (a1 - a0) * frac(); g.strokeStyle = '#c01818'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(cx - Math.cos(an) * 14, cy - Math.sin(an) * 14); g.lineTo(cx + Math.cos(an) * (R - 6), cy + Math.sin(an) * (R - 6)); g.stroke();
    g.fillStyle = '#222'; g.beginPath(); g.arc(cx, cy, 7, 0, 6.3); g.fill();
  };
  return widget(o);
}
/* digital readout */
function digital(o) {
  o.cw = 260; o.ch = 104; o.w = o.w || 0.15; o.h = o.h || 0.06; o.glow = true;
  o.key = function () { return o.txt(); };
  o.draw = function (g) { var W = 260, H = 104; g.fillStyle = '#0d0f10'; g.fillRect(0, 0, W, H); g.fillStyle = '#26292c'; g.fillRect(0, 0, W, 26); ctext(g, o.lbl, W / 2, 13, 15, '#e8e8e2', 'center', W - 8);
    g.fillStyle = '#050505'; g.fillRect(8, 32, W - 16, H - 40); var s = o.txt(); g.save(); g.shadowColor = o.col || '#ff3b2f'; g.shadowBlur = 10; ctext(g, s, W - 18, 66, 50, o.col || '#ff4a3a', 'right', W - 30, 'bold'); g.restore(); };
  return widget(o);
}
/* annunciator window grid (the lit alarm tiles across the top of the board) */
var ANN = [];
function annunciator(o) {
  var cols = o.cols, rows = o.rows; o.cw = cols * 128; o.ch = rows * 64; o.glow = true;
  o.key = function () { var ph = Math.floor(performance.now() / 160) % 2, ph2 = Math.floor(performance.now() / 600) % 2, k = ''; o.tiles.forEach(function (t) { k += (t.st === 'alert' ? (ph ? 'A' : 'a') : t.st === 'ring' ? (ph2 ? 'R' : 'r') : t.st === 'ack' ? 'K' : t.st === 'on' ? 'O' : '.'); }); return k + (S && S.lampTest ? 'T' : ''); };
  o.draw = function (g) {
    var ph = Math.floor(performance.now() / 160) % 2, ph2 = Math.floor(performance.now() / 600) % 2;
    g.fillStyle = '#0b0c0d'; g.fillRect(0, 0, o.cw, o.ch);
    o.tiles.forEach(function (t, i) { var c = i % cols, r = Math.floor(i / cols), x = c * 128 + 3, y = r * 64 + 3, w = 122, h = 58,
      lit = (S && S.lampTest) || t.st === 'ack' || t.st === 'on' || (t.st === 'alert' && ph) || (t.st === 'ring' && ph2), col = t.k === 'trip' ? ['#ff5c4a', '#4a1410'] : t.k === 'status' ? ['#f5f5ef', '#2b2c2c'] : ['#ffd35a', '#3e3214'];
      if (!t.lbl) { g.fillStyle = '#1b1c1d'; g.fillRect(x, y, w, h); return; }
      var gr = g.createLinearGradient(x, y, x, y + h); if (lit) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, col[0]); gr.addColorStop(1, col[0]); } else { gr.addColorStop(0, '#3a3b3c'); gr.addColorStop(1, col[1]); }
      g.fillStyle = gr; g.fillRect(x, y, w, h); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(x, y, w, h);
      var lines = t.lbl.split('\n'), px = lines.length > 2 ? 13 : 14; lines.forEach(function (ln, j) { ctext(g, ln, x + w / 2, y + h / 2 + (j - (lines.length - 1) / 2) * (px + 2), px, lit ? '#140c00' : 'rgba(220,220,210,.32)', 'center', w - 8); });
    });
  };
  var w = widget(o); w.tiles = o.tiles; o.tiles.forEach(function (t) { t.st = t.st || 'off'; t.sec = o.sec; ANN.push(t); }); return w;
}
/* rod position indication: a column of LEDs per rod, every 6 steps, grouped by bank */
function drpi(o) {
  o.cw = 900; o.ch = 400; o.w = o.w || 0.92; o.h = o.h || 0.41; o.glow = true;
  o.key = function () { var p = S.p, k = ''; BANKS.forEach(function (b) { k += Math.floor(p.rods[b] / 6) + ','; }); return k + (p.tripped ? 't' : ''); };
  o.draw = function (g) {
    var p = S.p, W = 900, H = 400; g.fillStyle = '#0c0e0f'; g.fillRect(0, 0, W, H); g.fillStyle = '#1e2124'; g.fillRect(4, 4, W - 8, 30); ctext(g, 'DIGITAL ROD POSITION INDICATION', W / 2, 19, 18, '#eee', 'center', W - 20);
    var x = 14, segs = 38, top = 52, bot = 352, sh = (bot - top) / segs;
    BANKS.forEach(function (b) { var n = NROD[b], bw = n * 12 + 10, z = p.rods[b], lit = Math.floor(z / 6);
      g.fillStyle = '#16191b'; g.fillRect(x - 3, top - 6, bw, bot - top + 40);
      for (var r = 0; r < n; r++) { var cx = x + 4 + r * 12; for (var s2 = 0; s2 < segs; s2++) { var on = s2 < lit, y = bot - (s2 + 1) * sh; g.fillStyle = on ? '#3dff6a' : '#0d2a14'; g.fillRect(cx, y + 1, 8, sh - 2); }
        g.fillStyle = z <= 0 ? (p.tripped || p.dropped ? '#ff4a3a' : '#7a1c16') : '#2a0d0b'; g.fillRect(cx, bot + 4, 8, 8); }
      ctext(g, b, x - 3 + bw / 2, bot + 26, 15, '#cfd3d6'); x += bw + 10; });
    ctext(g, 'GREEN: ROD POSITION (6-STEP DOTS)   RED: ROD AT BOTTOM', W / 2, H - 12, 12, '#7f868c', 'center', W - 20, '600');
  };
  return widget(o);
}
/* bank demand step counters (mechanical) */
function counters(o) {
  o.cw = 760; o.ch = 120; o.w = o.w || 0.62; o.h = o.h || 0.098;
  o.key = function () { return BANKS.map(function (b) { return Math.round(S.p.rods[b]); }).join(','); };
  o.draw = function (g) { var W = 760; g.fillStyle = '#2a2d30'; g.fillRect(0, 0, W, 120); ctext(g, 'GROUP DEMAND POSITION (STEPS)', W / 2, 14, 14, '#e6e6e0', 'center', W);
    BANKS.forEach(function (b, i) { var x = 8 + i * 94; g.fillStyle = '#111'; g.fillRect(x, 28, 86, 58); var v = String(Math.round(S.p.rods[b])).padStart(3, '0');
      for (var d = 0; d < 3; d++) { var dx = x + 6 + d * 26; var gr = g.createLinearGradient(0, 32, 0, 82); gr.addColorStop(0, '#9a9a94'); gr.addColorStop(0.2, '#f6f5ee'); gr.addColorStop(0.8, '#f6f5ee'); gr.addColorStop(1, '#9a9a94'); g.fillStyle = gr; g.fillRect(dx, 32, 22, 50); ctext(g, v[d], dx + 11, 57, 34, '#111', 'center', 22, 'bold'); }
      ctext(g, b, x + 43, 102, 16, '#f2f2ee'); });
  };
  return widget(o);
}
/* strip chart recorder */
function chart(o) {
  o.cw = 340; o.ch = 300; o.w = o.w || 0.21; o.h = o.h || 0.185; o.every = 1;
  o.key = function () { return S.p.hist.length + ':' + Math.floor(S.p.t); };
  o.draw = function (g) {
    var W = 340, H = 300, p = S.p, x0 = 16, y0 = 44, cw = W - 32, ch = H - 70;
    g.fillStyle = '#16181a'; g.fillRect(0, 0, W, H); ctext(g, o.lbl, W / 2, 20, 16, '#f2f2ee', 'center', W - 16);
    g.fillStyle = '#eef3e4'; g.fillRect(x0, y0, cw, ch); g.strokeStyle = 'rgba(40,120,60,.35)'; g.lineWidth = 1;
    for (var i = 0; i <= 10; i++) { var x = x0 + cw * i / 10; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + ch); g.stroke(); }
    var off = (p.t / 6) % (ch / 12); for (var j = -1; j <= 12; j++) { var y = y0 + j * ch / 12 + off; if (y < y0 || y > y0 + ch) continue; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + cw, y); g.stroke(); }
    var hs = p.hist.slice(-o.span), N = o.span;
    o.pens.forEach(function (pen) { g.strokeStyle = pen.col; g.lineWidth = 2.2; g.beginPath(); var st = false;
      hs.forEach(function (h, k) { var f = clamp(pen.f(h), 0, 1), x = x0 + cw * f, y = y0 + ch * (1 - (k + (N - hs.length)) / N); if (!st) { g.moveTo(x, y); st = true; } else g.lineTo(x, y); }); g.stroke();
      if (hs.length) { var lf = clamp(pen.f(hs[hs.length - 1]), 0, 1); g.fillStyle = pen.col; g.beginPath(); g.moveTo(x0 + cw * lf, y0 + 2); g.lineTo(x0 + cw * lf - 6, y0 - 8); g.lineTo(x0 + cw * lf + 6, y0 - 8); g.fill(); } });
    o.scale(g, x0, y0 + ch + 6, cw);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x0, y0, cw, ch * 0.4);
  };
  return widget(o);
}
/* computer screen */
function screen(o) { o.cw = o.cw || 1024; o.ch = o.ch || 640; o.glow = true; o.every = o.every || 0.5; o.key = function () { return Math.floor(performance.now() / (o.every * 1000)); }; return widget(o); }

/* ================================================================ the control room ================================================================
   A horseshoe of eleven benchboards around the operator, laid out like a real Westinghouse-style PWR control room:
   primary side on the left, REACTOR in the centre, secondary side and electrics on the right.
   Each board: base cabinet, sloped desk with the controls, vertical panel with the instruments, annunciator windows on top. */
var BR = 9.2, BCZ = 2.0, BSTEP = 23, SW = 3.6, RX = 12, ZB = -9.6, ZF = 11.4, CH = 4.4, RZC = (ZB + ZF) / 2, RDP = ZF - ZB, CZ = -1.0, SZ = 2.75, DESK_H = 0.9, PY0 = 1.12, PY1 = 2.40, PZ = -0.75, ANN_T = 0.2;
var SL = Math.sqrt(PZ * PZ + (PY0 - DESK_H) * (PY0 - DESK_H)), SLOPE_A = Math.atan2(PY0 - DESK_H, -PZ);
var PCW = 2560, PCH = Math.round(PCW * (PY1 - PY0) / SW), DCW = 2560, DCH = Math.round(DCW * SL / SW);
var SECDEF = [
  { id: 'esf', name: 'SAFETY INJECTION  ·  CONTAINMENT  ·  RADIATION', short: 'Safety injection' },
  { id: 'aux', name: 'COOLING WATER  ·  INSTRUMENT AIR  ·  HVAC', short: 'Cooling water & air' },
  { id: 'cvcs', name: 'CHEMICAL & VOLUME CONTROL  ·  BORON', short: 'CVCS & boron' },
  { id: 'pzr', name: 'PRESSURISER PRESSURE & LEVEL', short: 'Pressuriser' },
  { id: 'rcs', name: 'REACTOR COOLANT SYSTEM', short: 'Reactor coolant' },
  { id: 'rx', name: 'REACTOR CONTROL  ·  NUCLEAR INSTRUMENTATION', short: 'Reactor' },
  { id: 'sg', name: 'STEAM GENERATORS & FEEDWATER', short: 'Steam & feed' },
  { id: 'ms', name: 'MAIN STEAM  ·  STEAM DUMPS  ·  CONDENSER', short: 'Main steam' },
  { id: 'tb', name: 'MAIN TURBINE', short: 'Turbine' },
  { id: 'gen', name: 'GENERATOR  ·  SYNCHRONISING  ·  400 kV GRID', short: 'Generator & grid' },
  { id: 'elec', name: 'ELECTRICAL DISTRIBUTION  ·  DIESEL GENERATORS', short: 'Electrical' }
];
SECDEF.forEach(function (d, i) { d.a = (i - 5) * BSTEP; });
var SEC = {}, HITS = [], CTRL = [], LAMPS = [], MAT = {}, SCR = [];
/* things the other boards show that the Section 1 model doesn't calculate yet: they drift realistically around their hot standby values */
var D = { grid: 50.0, gridV: 401, sgL: [50, 50, 50, 50], vct: 46, chg: 17.8, ltd: 17.2, tgSpd: 31, bat: 82, rwst: 96, dT: 0, thot: T0, tcold: T0, sub: 53, stmF: 0, feedF: 0, keff: 0.95, mode: 3, rho: 0, clock: 0 };
function derive(dt) {
  var p = S.p, q = Math.min(p.n, 1.2), wn = function (a) { return gauss() * a * Math.sqrt(Math.max(dt, 1e-3)); };
  D.dT += (37 * q - D.dT) * (1 - Math.exp(-dt / 6)); D.thot = p.Tavg + D.dT / 2; D.tcold = p.Tavg - D.dT / 2; D.sub = tsat(p.rcs) - D.thot;
  D.grid = clamp(D.grid + (50 - D.grid) * dt * 0.08 + wn(0.006), 49.85, 50.15); D.gridV = clamp(D.gridV + (401 - D.gridV) * dt * 0.1 + wn(0.15), 396, 406);
  for (var i = 0; i < 4; i++) D.sgL[i] = clamp(D.sgL[i] + (50 - D.sgL[i]) * dt * 0.08 + wn(0.12), 40, 60);
  D.vct = clamp(D.vct + (46 - D.vct) * dt * 0.02 + wn(0.05), 40, 52); D.chg = clamp(D.chg + (17.8 - D.chg) * dt * 0.2 + wn(0.08), 15, 21); D.ltd = clamp(D.ltd + (17.2 - D.ltd) * dt * 0.2 + wn(0.05), 15, 20);
  D.tgSpd = clamp(D.tgSpd + (31 - D.tgSpd) * dt * 0.3 + wn(0.2), 28, 34);
  D.stmF += (p.dump * 40 - D.stmF) * (1 - Math.exp(-dt / 3)); D.feedF += (D.stmF - D.feedF) * (1 - Math.exp(-dt / 12));
  D.rho = rhoPcm(p); D.keff = 1 / (1 - D.rho * 1e-5); var pr = (NI.pr[0] + NI.pr[1] + NI.pr[2] + NI.pr[3]) / 4; D.pr = pr;
  D.mode = D.keff < 0.99 ? 3 : pr <= 5 ? 2 : 1;
  D.clock = (S.clock0 || 0) + p.t;
}
function clockStr(t) { t = ((Math.floor(t) % 86400) + 86400) % 86400; return String(Math.floor(t / 3600)).padStart(2, '0') + ':' + String(Math.floor(t / 60) % 60).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }

/* ---------- shared materials ---------- */
function mats() {
  var std = function (c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.6 : r, metalness: m || 0 }); };
  MAT.cab = std(0x56677a, 0.55, 0.15); MAT.cab2 = std(0x3d4a58, 0.5, 0.15); MAT.trim = std(0x2b333c, 0.5, 0.2); MAT.kick = std(0x15181c, 0.8);
  MAT.dark = std(0x1a1d21, 0.6); MAT.black = std(0x0b0c0e, 0.35); MAT.rubber = std(0x16181a, 0.9); MAT.metal = std(0xc4c8cc, 0.3, 0.85);
  MAT.chrome = std(0xe8eaec, 0.15, 1.0); MAT.wall = std(0xd6d8d4, 0.85); MAT.wood = std(0x8a6a4a, 0.55); MAT.desk = std(0xc9c3b8, 0.45); MAT.fabric = std(0x27313d, 0.95);
  MAT.lightP = new THREE.MeshBasicMaterial({ color: 0xffffff }); MAT.lightP.color.setScalar(1.6);
  MAT.monitor = std(0x111214, 0.4, 0.2); MAT.glass = new THREE.MeshStandardMaterial({ color: 0x9fb4c8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25 });
}
function box(w, h, d, mat, x, y, z, parent) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(m); return m; }
function cyl(rt, rb, h, mat, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat); }
function hit(mesh, o) { mesh.userData.hit = o; HITS.push(mesh); return mesh; }
function invis(w, h, d) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); return m; }
function soon(n, what) { return function () { S.toast('🔒 ' + what + ' comes in Section ' + n + ' (' + ROAD[n - 1].t + ').', 'lock'); S.sfx('deny'); }; }
function signTex(w, h, fn) { var c = CV(w, h), g = c.getContext('2d'); fn(g, w, h); return texOf(c); }

/* ---------- the room ---------- */
function buildRoom(scene) {
  /* raised access floor: 600 mm tiles */
  var ft = signTex(256, 256, function (g) { g.fillStyle = '#9a9fa3'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, 2600, 0.06); g.strokeStyle = 'rgba(25,28,32,.6)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 253, 253); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1; g.strokeRect(4.5, 4.5, 247, 247); });
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(2 * RX / 0.6, RDP / 0.6);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * RX, RDP), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.2, metalness: 0.12 })); floor.rotation.x = -Math.PI / 2; floor.position.z = RZC; floor.userData.floor = true; scene.add(floor);
  /* the 'at the controls' line: only the licensed operator on shift goes inside it without asking */
  var arc = new THREE.Mesh(new THREE.RingGeometry(BR - 1.38, BR - 1.3, 128, 1, Math.PI * 0.5 - 2.2, 4.4), new THREE.MeshBasicMaterial({ color: 0xd6a51c })); arc.rotation.x = -Math.PI / 2; arc.rotation.z = 0; arc.position.set(0, 0.003, BCZ); scene.add(arc);
  var atc = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.28), new THREE.MeshBasicMaterial({ map: signTex(512, 64, function (g) { g.clearRect(0, 0, 512, 64); ctext(g, 'AT THE CONTROLS AREA', 256, 32, 40, '#d6a51c', 'center', 500); }), transparent: true })); atc.rotation.x = -Math.PI / 2; atc.position.set(0, 0.004, BCZ - (BR - 1.0)); scene.add(atc);
  /* walls: painted, with a darker dado */
  var wt = signTex(512, 512, function (g) { var gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#dcdedb'); gr.addColorStop(0.68, '#d3d6d2'); gr.addColorStop(0.69, '#56677a'); gr.addColorStop(0.7, '#3b4652'); gr.addColorStop(1, '#3b4652'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); speck(g, 512, 512, 3000, 0.03); });
  wt.wrapS = THREE.RepeatWrapping;
  var wall = function (w, x, z, ry) { var t = wt.clone(); t.needsUpdate = true; t.repeat.set(w / CH, 1); var m = new THREE.Mesh(new THREE.PlaneGeometry(w, CH), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 })); m.position.set(x, CH / 2, z); m.rotation.y = ry; scene.add(m); };
  wall(2 * RX, 0, ZB, 0); wall(2 * RX, 0, ZF, Math.PI); wall(RDP, -RX, RZC, Math.PI / 2); wall(RDP, RX, RZC, -Math.PI / 2);
  /* suspended ceiling with recessed light panels */
  var ct = signTex(256, 256, function (g) { g.fillStyle = '#c9cac6'; g.fillRect(0, 0, 256, 256); speck(g, 256, 256, 4000, 0.05); g.strokeStyle = '#b9bcb8'; g.lineWidth = 5; g.strokeRect(0, 0, 256, 256); });
  ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(2 * RX / 0.6, RDP / 0.6);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * RX, RDP), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CH, RZC); scene.add(ceil);
  var lg = new THREE.PlaneGeometry(1.2, 0.6);
  for (var x = -10.5; x <= 10.5; x += 3) for (var z = ZB + 1.3; z <= ZF - 1; z += 2.2) { var l = new THREE.Mesh(lg, MAT.lightP); l.rotation.x = Math.PI / 2; l.position.set(x, CH - 0.005, z); scene.add(l); }
  /* lights: soft sky from the ceiling, a few lamps over the boards, and a dim fill */
  scene.add(new THREE.HemisphereLight(0xf4f6ff, 0x4b4740, 0.72));
  var sun = new THREE.DirectionalLight(0xfff3e2, 1.25); sun.position.set(3, 14, 9); sun.target.position.set(0, 0, 0); scene.add(sun); scene.add(sun.target); R3.sun = sun;
  [[2 * RX + 0.1, 0.11, 0.03, 0, 0.055, ZB + 0.015], [2 * RX + 0.1, 0.11, 0.03, 0, 0.055, ZF - 0.015], [0.03, 0.11, RDP, -RX + 0.015, 0.055, RZC], [0.03, 0.11, RDP, RX - 0.015, 0.055, RZC]].forEach(function (q) { box(q[0], q[1], q[2], MAT.kick, q[3], q[4], q[5], scene); });
  [[-100, 7.2], [-55, 7.2], [-18, 7.2], [18, 7.2], [55, 7.2], [100, 7.2], [0, 0], [0, -9]].map(function (q) { var a = q[0] * Math.PI / 180; return [Math.sin(a) * q[1], CH - 0.4, BCZ - Math.cos(a) * q[1]]; }).forEach(function (q, i) { var pl = new THREE.PointLight(0xfff5ea, i < 6 ? 11 : 6, 0, 1.3); pl.position.set(q[0], q[1], q[2]); scene.add(pl); });
  /* back wall sign above the boards */
  var sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.5), new THREE.MeshStandardMaterial({ map: signTex(1536, 120, function (g) { g.fillStyle = '#1e2a36'; g.fillRect(0, 0, 1536, 120); ctext(g, '☢  CRITICAL POINT POWER STATION  ·  UNIT 1  ·  MAIN CONTROL ROOM', 768, 62, 58, '#f4f4ef', 'center', 1500); }), roughness: 0.5 })); sg.position.set(0, CH - 0.5, ZB + 0.02); scene.add(sg);
  /* contact shadows under furniture */
  var sh = signTex(128, 128, function (g) { var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  MAT.shadow = new THREE.MeshBasicMaterial({ map: sh, transparent: true, depthWrite: false });
}
function floorShadow(scene, x, z, w, d, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), MAT.shadow); m.rotation.x = -Math.PI / 2; m.rotation.z = ry || 0; m.position.set(x, 0.002, z); scene.add(m); }

/* ---------- one benchboard section ---------- */
function px(x) { return (x + SW / 2) / SW * PCW; } function py(y) { return (PY1 - y) / SW * PCW; }
function dx(u) { return (u + SW / 2) / SW * DCW; } function dy(d) { return (1 - d) * DCH; }
function buildSection(def) {
  var a = def.a * Math.PI / 180, g = new THREE.Group(), s = { def: def, g: g, a: a, grp: [], tag: [], dgrp: [], dtag: [], mimic: [] };
  g.position.set(Math.sin(a) * BR, 0, BCZ - Math.cos(a) * BR); g.rotation.y = -a; R3.scene.add(g); SEC[def.id] = s;
  box(SW, 0.86, 0.8, MAT.cab, 0, 0.43, -0.46, g); box(SW - 0.02, 0.1, 0.02, MAT.kick, 0, 0.05, -0.055, g);
  for (var k = -1; k <= 1; k += 2) box(0.006, 0.7, 0.004, MAT.trim, k * 0.9, 0.47, -0.059, g);
  s.desk = new THREE.Group(); s.desk.position.set(0, DESK_H, 0); s.desk.rotation.x = SLOPE_A; g.add(s.desk);
  box(SW, 0.035, SL, MAT.cab2, 0, -0.0175, -SL / 2, s.desk);
  var nose = cyl(0.022, 0.022, SW, MAT.rubber, 10); nose.rotation.z = Math.PI / 2; nose.position.set(0, -0.014, 0.004); s.desk.add(nose);
  box(SW, PY1 - DESK_H + 0.02, 0.36, MAT.cab, 0, (PY1 + DESK_H) / 2, PZ - 0.18, g);
  s.annF = new THREE.Group(); s.annF.position.set(0, PY1, PZ); s.annF.rotation.x = ANN_T; g.add(s.annF);
  box(SW, 0.46, 0.3, MAT.dark, 0, 0.23, -0.15, s.annF);
  var ty = PY1 + 0.46 * Math.cos(ANN_T), tz = PZ + 0.46 * Math.sin(ANN_T);
  box(SW, 0.2, 0.62, MAT.cab, 0, ty + 0.1, tz - 0.25, g);
  var np = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.06, 0.15), new THREE.MeshStandardMaterial({ map: signTex(1536, 64, function (g2) { g2.fillStyle = '#e9ebe7'; g2.fillRect(0, 0, 1536, 64); g2.fillStyle = def.id === 'rx' ? '#b3261e' : '#1f3b57'; g2.fillRect(0, 0, 18, 64); g2.fillRect(1518, 0, 18, 64); ctext(g2, def.name, 768, 34, 40, '#16212c', 'center', 1440); }), roughness: 0.5 }));
  np.position.set(0, ty + 0.1, tz + 0.061); g.add(np);
  var strip = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.12, 0.035), MAT.lightP); strip.rotation.x = Math.PI / 2; strip.position.set(0, ty - 0.001, tz + 0.02); g.add(strip);
  s.panel = new THREE.Mesh(new THREE.PlaneGeometry(SW, PY1 - PY0), new THREE.MeshStandardMaterial({ roughness: 0.62 })); s.panel.position.set(0, (PY0 + PY1) / 2, PZ + 0.001); g.add(s.panel);
  s.deskP = new THREE.Mesh(new THREE.PlaneGeometry(SW, SL), new THREE.MeshStandardMaterial({ roughness: 0.55 })); s.deskP.rotation.x = -Math.PI / 2; s.deskP.position.set(0, 0.0006, -SL / 2); s.desk.add(s.deskP);
  CONTENT[def.id](s);
  s.panel.material.map = texOf(panelBG(s)); s.panel.material.needsUpdate = true;
  s.deskP.material.map = texOf(deskBG(s)); s.deskP.material.needsUpdate = true;
  if (s.be) beFinish(s);
  floorShadow(R3.scene, g.position.x + 0.45 * Math.sin(a), g.position.z - 0.45 * Math.cos(a), 4.4, 2.1, -a);
  return s;
}
function joints() {
  var A0 = (SECDEF[0].a - BSTEP / 2), A1 = (SECDEF[SECDEF.length - 1].a + BSTEP / 2);
  for (var i = A0; i <= A1 + 0.01; i += BSTEP) { var m = i * Math.PI / 180, end = Math.abs(i - A0) < 0.01 || Math.abs(i - A1) < 0.01, r = BR + (end ? 0.5 : 0.48), g = new THREE.Group();
    g.position.set(Math.sin(m) * r, 0, BCZ - Math.cos(m) * r); g.rotation.y = -m; R3.scene.add(g);
    box(end ? 0.12 : 0.34, 2.98, 0.8, MAT.trim, 0, 1.49, -0.3, g); box(end ? 0.12 : 0.34, 0.05, 0.81, MAT.black, 0, 2.985, -0.3, g); }
}
function panelBG(s) {
  var c = CV(PCW, PCH), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, PCH); gr.addColorStop(0, '#c8cbc7'); gr.addColorStop(1, '#b7bab6'); g.fillStyle = gr; g.fillRect(0, 0, PCW, PCH); speck(g, PCW, PCH, 9000, 0.03);
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; for (var i = 1; i < 4; i++) { var x = PCW * i / 4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, PCH); g.stroke(); }
  for (i = 0; i <= 4; i++) { screw(g, Math.max(10, Math.min(PCW - 10, PCW * i / 4)), 10, 4); screw(g, Math.max(10, Math.min(PCW - 10, PCW * i / 4)), PCH - 10, 4); }
  s.mimic.forEach(function (m) { g.strokeStyle = m.col; g.lineWidth = m.w || 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); m.pts.forEach(function (p, j) { var X = px(p[0]), Y = py(p[1]); if (j) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); });
  s.grp.forEach(function (b) { var x0 = px(b[0]), x1 = px(b[1]), y0 = py(b[3]), y1 = py(b[2]); g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.strokeStyle = b[5] || '#26394d'; g.lineWidth = 4; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    var tw = Math.min(x1 - x0 - 20, Math.max(180, b[4].length * 15)); tag(g, b[4], (x0 + x1) / 2, y0, tw, 30, 20, b[5] || '#26394d', '#fff'); });
  (s.artP || []).forEach(function (f) { f(g); });
  s.tag.forEach(function (t) { tag(g, t[2], px(t[0]), py(t[1]), t[3] || 120, t[4] || 26, t[5] || 16, t[6], t[7]); });
  return c;
}
function deskBG(s) {
  var c = CV(DCW, DCH), g = c.getContext('2d'); g.fillStyle = '#c3c6c2'; g.fillRect(0, 0, DCW, DCH); speck(g, DCW, DCH, 7000, 0.03);
  var gr = g.createLinearGradient(0, 0, 0, DCH); gr.addColorStop(0, 'rgba(0,0,0,.06)'); gr.addColorStop(1, 'rgba(255,255,255,.08)'); g.fillStyle = gr; g.fillRect(0, 0, DCW, DCH);
  g.fillStyle = '#2a2f35'; g.fillRect(0, DCH - 26, DCW, 26);
  s.dgrp.forEach(function (b) { var x0 = dx(b[0]), x1 = dx(b[1]), y0 = dy(b[3]), y1 = dy(b[2]); g.strokeStyle = b[5] || '#26394d'; g.lineWidth = 4; g.strokeRect(x0, y0, x1 - x0, y1 - y0); tag(g, b[4], (x0 + x1) / 2, y0, Math.min(x1 - x0 - 16, Math.max(170, b[4].length * 15)), 28, 19, b[5] || '#26394d', '#fff'); });
  (s.artD || []).forEach(function (f) { f(g); });
  s.dtag.forEach(function (t) { tag(g, t[2], dx(t[0]), dy(t[1]), t[3] || 120, t[4] || 30, t[5] || 17, t[6], t[7]); });
  return c;
}
/* place a widget on a board */
function onPanel(s, w, x, y) { w.m.position.set(x, y, PZ + 0.004); s.g.add(w.m); w.s = s; if (w.o.tip) hit(w.m, { tip: w.o.tip, w: w }); return w; }
function onDeskFlat(s, w, u, d, lift) { w.m.rotation.x = -Math.PI / 2; w.m.position.set(u, lift || 0.0015, -d * SL); s.desk.add(w.m); w.s = s; if (w.o.tip) hit(w.m, { tip: w.o.tip, w: w }); return w; }
function onDesk(s, obj, u, d) { obj.position.set(u, 0, -d * SL); s.desk.add(obj); return obj; }

/* ---------- lamps and status lights ---------- */
function lampMat(col) { var m = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0, roughness: 0.25 }); return m; }
function lamp(parent, x, y, z, col, on, tip, r, onPanelFace) {
  var m = lampMat(col), mesh = cyl(r || 0.012, r || 0.012, 0.014, m, 16), bz = cyl((r || 0.012) * 1.45, (r || 0.012) * 1.45, 0.008, MAT.metal, 16);
  var g = new THREE.Group(); g.add(bz); g.add(mesh); mesh.position.y = 0.008; if (onPanelFace) g.rotation.x = Math.PI / 2; g.position.set(x, y, z); parent.add(g);
  var c = new THREE.Color(col), off = c.clone().multiplyScalar(0.18); LAMPS.push({ m: m, on: on, c: c, off: off, st: null });
  if (tip) hit(mesh, { tip: tip }); return g;
}
function lightBox(o) {
  var cols = o.cols, rows = Math.ceil(o.tiles.length / cols); o.cw = cols * 150; o.ch = rows * 70 + 34; o.glow = true;
  o.key = function () { return o.tiles.map(function (t) { return t.on() ? 1 : 0; }).join('') + (S && S.lampTest ? 'T' : ''); };
  o.draw = function (g) { g.fillStyle = '#111315'; g.fillRect(0, 0, o.cw, o.ch); ctext(g, o.lbl, o.cw / 2, 17, 17, '#e8e8e2', 'center', o.cw - 10);
    o.tiles.forEach(function (t, i) { var x = (i % cols) * 150 + 4, y = 34 + Math.floor(i / cols) * 70 + 3, on = (S && S.lampTest) || t.on(), col = t.col || '#f5f2e6';
      g.fillStyle = on ? col : '#2a2b2c'; g.fillRect(x, y, 142, 62); if (on) { g.save(); g.shadowColor = col; g.shadowBlur = 16; g.fillRect(x + 6, y + 6, 130, 50); g.restore(); }
      var ls = t.lbl.split('\n'); ls.forEach(function (ln, j) { ctext(g, ln, x + 71, y + 31 + (j - (ls.length - 1) / 2) * 17, 15, on ? '#1a1200' : 'rgba(220,220,210,.3)', 'center', 134); }); });
  };
  return widget(o);
}

/* ---------- desk controls ---------- */
var pressed = [];
function press(mesh, y0) { pressed.push({ m: mesh, y0: y0, t: 0.14 }); mesh.position.y = y0 - 0.005; }
function pushBtn(s, u, d, o) {
  var g = new THREE.Group(), r = o.r || 0.019, bz = cyl(r * 1.35, r * 1.45, 0.012, MAT.metal, 20); bz.position.y = 0.006; g.add(bz);
  var cm = new THREE.MeshStandardMaterial({ color: o.col, roughness: 0.3, emissive: o.col, emissiveIntensity: 0 }), cap = cyl(r, r, 0.02, cm, 20); cap.position.y = 0.02; g.add(cap);
  onDesk(s, g, u, d); if (o.label) s.dtag.push([u, d - 0.14, o.label, o.lw || 110, 26, 15]);
  hit(cap, { tip: o.tip, act: function () { press(cap, 0.02); S.sfx('btn'); o.act && o.act(); }, hold: o.hold });
  if (o.lit) { var c = new THREE.Color(o.col); LAMPS.push({ m: cm, on: o.lit, c: c, off: c.clone().multiplyScalar(0.55), st: null, lo: 0.0 }); }
  return g;
}
function litButton(s, u, d, o) {
  var g = new THREE.Group(); box(0.07, 0.014, 0.07, MAT.black, 0, 0.007, 0, g);
  var fw = widget({ cw: 128, ch: 128, w: 0.056, h: 0.056, glow: true, key: function () { return (o.lit() ? 1 : 0) + (S && S.lampTest ? 'T' : ''); },
    draw: function (gg) { var on = o.lit() || (S && S.lampTest); gg.fillStyle = on ? o.col : '#3a2f12'; gg.fillRect(0, 0, 128, 128); if (on) { var gr = gg.createRadialGradient(64, 64, 10, 64, 64, 90); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128); }
      gg.strokeStyle = '#000'; gg.lineWidth = 6; gg.strokeRect(0, 0, 128, 128); var ls = o.txt.split('\n'); ls.forEach(function (ln, j) { ctext(gg, ln, 64, 64 + (j - (ls.length - 1) / 2) * 24, 21, on ? '#1b1200' : 'rgba(230,220,190,.45)', 'center', 116); }); } });
  fw.m.rotation.x = -Math.PI / 2; fw.m.position.y = 0.0225; var face = box(0.058, 0.008, 0.058, MAT.dark, 0, 0.018, 0, g); g.add(fw.m);
  onDesk(s, g, u, d); if (o.label) s.dtag.push([u, d - 0.15, o.label, o.lw || 130, 26, 15]);
  var hb = invis(0.07, 0.04, 0.07); hb.position.y = 0.02; g.add(hb); hit(hb, { tip: o.tip, act: function () { press(fw.m, 0.0225); S.sfx('btn'); o.act(); } }); return g;
}
function rotary(s, u, d, o) {
  var n = o.pos.length, ang = function (i) { return (-o.span / 2 + o.span * i / (n - 1)) * Math.PI / 180; }, sz = o.size || 0.16;
  var plate = widget({ cw: 256, ch: 256, w: sz, h: sz, key: function () { return o.get(); }, draw: function (g) {
    g.fillStyle = '#16191c'; rr(g, 4, 4, 248, 248, 18); g.fill(); ctext(g, o.title, 128, 232, 19, '#f2f2ee', 'center', 230);
    for (var i = 0; i < n; i++) { var a = ang(i), sel = o.get() === i, x = 128 + Math.sin(a) * 92, y = 120 - Math.cos(a) * 92; g.strokeStyle = sel ? '#ffd35a' : '#aeb4ba'; g.lineWidth = 3; g.beginPath(); g.moveTo(128 + Math.sin(a) * 52, 120 - Math.cos(a) * 52); g.lineTo(128 + Math.sin(a) * 66, 120 - Math.cos(a) * 66); g.stroke();
      ctext(g, o.pos[i], x, y, o.pos[i].length > 4 ? 15 : 19, sel ? '#ffd35a' : (o.dis && o.dis[i] ? '#6b7178' : '#f2f2ee'), 'center', 70); } } });
  onDeskFlat(s, plate, u, d, 0.0012);
  var k = new THREE.Group(), base = cyl(0.03, 0.033, 0.016, MAT.black, 24); base.position.y = 0.008; k.add(base);
  var bar = box(0.022, 0.024, 0.085, MAT.black, 0, 0.026, 0, k); var ptr = box(0.004, 0.002, 0.04, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0.0385, -0.02, k);
  k.position.set(u, 0, -d * SL); s.desk.add(k);
  var pick = function (h) { if (!h.uv) return (o.get() + 1) % n; var X = h.uv.x * 256, Y = (1 - h.uv.y) * 256, a = Math.atan2(X - 128, 120 - Y), best = 0, bd = 9; for (var i = 0; i < n; i++) { var dd = Math.abs(a - ang(i)); if (dd < bd) { bd = dd; best = i; } } return best; };
  var act = function (h) { var i = h && h.object === plate.m ? pick(h) : (o.get() + 1) % n; if (i !== o.get()) { o.set(i); S.sfx('detent'); } };
  hit(plate.m, { tip: o.tip, act: act }); hit(bar, { tip: o.tip, act: act }); hit(base, { tip: o.tip, act: act });
  var cur = ang(o.get()); CTRL.push(function (dt) { var t = ang(o.get()); cur += (t - cur) * (1 - Math.exp(-dt * 18)); k.rotation.y = -cur; });
  return k;
}
function lever(s, u, d, o) {
  var plate = widget({ cw: 160, ch: 256, w: 0.1, h: 0.16, key: function () { return S.p.lever; }, draw: function (g) {
    g.fillStyle = '#16191c'; rr(g, 4, 4, 152, 248, 14); g.fill(); ctext(g, 'OUT', 80, 34, 30, S.p.lever > 0 ? '#ffd35a' : '#f2f2ee'); ctext(g, 'IN', 80, 222, 30, S.p.lever < 0 ? '#ffd35a' : '#f2f2ee');
    g.strokeStyle = '#7d848b'; g.lineWidth = 3; g.beginPath(); g.moveTo(80, 64); g.lineTo(80, 192); g.stroke(); ctext(g, 'HOLD', 118, 128, 14, '#9aa1a8'); } });
  onDeskFlat(s, plate, u, d, 0.0012);
  var piv = new THREE.Group(); piv.position.set(u, 0.01, -d * SL); s.desk.add(piv);
  var sh = cyl(0.006, 0.008, 0.075, MAT.chrome, 12); sh.position.y = 0.0375; piv.add(sh); var ball = new THREE.Mesh(new THREE.SphereGeometry(0.017, 20, 14), MAT.black); ball.position.y = 0.08; piv.add(ball);
  var boot = cyl(0.022, 0.026, 0.012, MAT.rubber, 16); boot.position.set(u, 0.006, -d * SL); s.desk.add(boot);
  /* one hit box over the whole lever; which way it goes depends on whether you press above or below the pivot (worked out on the desk plane, so the camera angle doesn't matter) */
  var hb = invis(0.11, 0.1, 0.17); hb.position.set(u, 0.045, -d * SL); s.desk.add(hb);
  var dirAt = function (ray) { var q = new THREE.Quaternion(), n = new THREE.Vector3(0, 1, 0).applyQuaternion(s.desk.getWorldQuaternion(q)), o0 = s.desk.getWorldPosition(new THREE.Vector3()), pl = new THREE.Plane().setFromNormalAndCoplanarPoint(n, o0), pt = ray && ray.intersectPlane(pl, new THREE.Vector3()); if (!pt) return 1; var lp = s.desk.worldToLocal(pt); return lp.z < -d * SL ? 1 : -1; };
  hit(hb, { tip: function () { return 'Rod motion lever: hold above the pivot for rods OUT, below for IN (bank selected: ' + S.p.sel + ')'; }, hold: function (on, h, ray) { o.hold(on ? dirAt(ray) : 0); } });
  var cur = 0; CTRL.push(function (dt) { cur += (-S.p.lever * 0.42 - cur) * (1 - Math.exp(-dt * 20)); piv.rotation.x = cur; });
}
function jhandle(s, u, d, o) {
  var plate = widget({ cw: 220, ch: 220, w: 0.12, h: 0.12, key: function () { return (o.closed() ? 1 : 0); }, draw: function (g) {
    g.fillStyle = '#16191c'; rr(g, 4, 4, 212, 212, 16); g.fill(); ctext(g, o.left || 'TRIP', 52, 40, 22, '#f2f2ee'); ctext(g, o.right || 'CLOSE', 168, 40, 22, '#f2f2ee'); ctext(g, o.title, 110, 196, 18, '#f2f2ee', 'center', 200);
    g.strokeStyle = '#7d848b'; g.lineWidth = 3; g.beginPath(); g.arc(110, 118, 64, -Math.PI * 0.82, -Math.PI * 0.18); g.stroke(); } });
  onDeskFlat(s, plate, u, d, 0.0012);
  var k = new THREE.Group(); k.position.set(u, 0, -d * SL); s.desk.add(k); var base = cyl(0.026, 0.03, 0.014, MAT.black, 20); base.position.y = 0.007; k.add(base);
  var grip = box(0.024, 0.026, 0.078, MAT.black, 0, 0.026, -0.012, k); var tip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 8), MAT.black); tip.position.set(0, 0.026, -0.05); k.add(tip);
  var gl = lamp(s.desk, u - 0.032, 0, -(d + 0.16) * SL, 0x2bd14a, function () { return !o.closed(); }, null, 0.01), rl = lamp(s.desk, u + 0.032, 0, -(d + 0.16) * SL, 0xff3324, o.closed, null, 0.01);
  var turn = 0, spring = 0;
  var act = function (h) { var right = true; if (h && h.uv && h.object === plate.m) right = h.uv.x > 0.5; else right = !o.closed(); spring = right ? 1 : -1; S.sfx('switch'); o.act(right); };
  hit(plate.m, { tip: o.tip, act: act }); hit(grip, { tip: o.tip, act: act }); hit(tip, { tip: o.tip, act: act });
  CTRL.push(function (dt) { var tgt = spring * 0.78; turn += (tgt - turn) * (1 - Math.exp(-dt * 16)); if (spring && Math.abs(turn - tgt) < 0.05) spring = 0; k.rotation.y = -turn; });
  if (o.label) s.dtag.push([u, d - 0.14, o.label, o.lw || 130, 26, 15]);
}
function mushroom(s, u, d, o) {
  var g = new THREE.Group(), st = signTex(256, 32, function (gg) { for (var i = 0; i < 16; i++) { gg.fillStyle = i % 2 ? '#111' : '#f2c21b'; gg.beginPath(); gg.moveTo(i * 16, 32); gg.lineTo(i * 16 + 16, 0); gg.lineTo(i * 16 + 32, 0); gg.lineTo(i * 16 + 16, 32); gg.fill(); } });
  st.wrapS = THREE.RepeatWrapping; st.repeat.set(3, 1);
  var collar = cyl(0.058, 0.062, 0.03, new THREE.MeshStandardMaterial({ map: st, roughness: 0.5 }), 32); collar.position.y = 0.015; g.add(collar);
  var top = cyl(0.058, 0.058, 0.002, new THREE.MeshStandardMaterial({ color: 0xf2c21b, roughness: 0.5 }), 32); top.position.y = 0.031; g.add(top);
  var stem = cyl(0.016, 0.016, 0.03, MAT.black, 12); stem.position.y = 0.04; g.add(stem);
  var dm = new THREE.MeshStandardMaterial({ color: 0xd8161a, roughness: 0.28, emissive: 0x500000, emissiveIntensity: 0.3 }), dome = new THREE.Mesh(new THREE.SphereGeometry(0.042, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), dm); dome.scale.y = 0.62; dome.position.y = 0.054; g.add(dome);
  onDesk(s, g, u, d); hit(dome, { tip: o.tip, act: function () { press(dome, 0.054); o.act(); } });
  if (o.label) s.dtag.push([u, d - 0.17, o.label, 150, 30, 17, '#8f1a14', '#fff']);
}
function toggle(s, u, d, o) {
  var g = new THREE.Group(); var pl = box(0.04, 0.006, 0.06, MAT.metal, 0, 0.003, 0, g); var piv = new THREE.Group(); piv.position.y = 0.006; g.add(piv);
  var bat = cyl(0.004, 0.006, 0.04, MAT.chrome, 10); bat.position.y = 0.02; piv.add(bat); onDesk(s, g, u, d);
  var hb = invis(0.05, 0.05, 0.07); hb.position.y = 0.025; g.add(hb); hit(hb, { tip: o.tip, act: function () { S.sfx('switch'); o.act(); } });
  var cur = 0; CTRL.push(function (dt) { var t = o.on() ? -0.45 : 0.45; cur += (t - cur) * (1 - Math.exp(-dt * 20)); piv.rotation.x = cur; });
  if (o.label) s.dtag.push([u, d - 0.12, o.label, o.lw || 120, 26, 15]);
  s.dtag.push([u, d + 0.1, 'ON', 44, 20, 13]); s.dtag.push([u, d - 0.06, 'OFF', 44, 20, 13]);
}

/* ================================================================ what is on each board ================================================================ */
function em(s, x, y, lbl, unit, min, max, v, o) {
  o = o || {}; o.lbl = lbl; o.unit = unit; o.min = min; o.max = max; o.v = v;
  var f = o.tipFmt || function (z) { return o.log ? fmtSci(z, 1) : (Math.abs(z) >= 100 ? Math.round(z) : z.toFixed(1)); };
  o.tip = o.tip || function () { return (o.name || lbl) + ': ' + f(v()) + ' ' + unit; };
  return onPanel(s, meterE(o), x, y);
}
function dg(s, x, y, lbl, txt, o) { o = o || {}; o.lbl = lbl; o.txt = txt; o.tip = o.tip || function () { return (o.name || lbl) + ': ' + txt(); }; if (o.big) { o.w = 0.3; o.h = 0.115; } else { o.w = o.w || 0.17; o.h = o.h || 0.068; } return onPanel(s, digital(o), x, y); }
function lb(s, x, y, w, h, lbl, cols, tiles, tip) { h = w * (Math.ceil(tiles.length / cols) * 70 + 34) / (cols * 150); return onPanel(s, lightBox({ lbl: lbl, cols: cols, tiles: tiles, w: w, h: h, tip: tip || function () { return lbl + ': ' + tiles.filter(function (t) { return t.on(); }).map(function (t) { return t.lbl.replace(/\n/g, ' '); }).join(', ') || lbl + ': nothing lit'; } }), x, y); }
function tl(lbl, on, col) { return { lbl: lbl, on: on, col: col }; }
var YES = function () { return true; }, NO = function () { return false; }, AMB = '#ffc94a', RED = '#ff5a48', GRN = '#59e07a', WHT = '#f5f2e6';
function f1(v) { return v.toFixed(1); } function f0(v) { return String(Math.round(v)); }
/* annunciator window lists: [label, kind, condition]. kind: trip (red), alarm (amber, horn), status (white, no horn), '' (spare window) */
function annTiles(list) { var t = list.map(function (a) { return { lbl: a[0], k: a[1] || 'alarm', c: a[2] || NO }; }); while (t.length < 42) t.push({ lbl: '', k: '', c: NO }); return t; }
function addAnn(s, tiles) { var w = annunciator({ cols: 14, rows: 3, w: SW - 0.08, h: 0.4, tiles: tiles, sec: s.def.id, tip: function () { var on = tiles.filter(function (t) { return t.lbl && t.st !== 'off'; }); return 'Annunciator windows' + (on.length ? ': ' + on.map(function (t) { return t.lbl.replace(/\n/g, ' '); }).join(' · ') : ': all clear'); } });
  w.m.position.set(0, 0.23, 0.002); s.annF.add(w.m); hit(w.m, { tip: w.o.tip, w: w }); s.ann = w; w.s = s; return w; }

var CONTENT = {};
/* ---------------------------------------------------------------- REACTOR (Section 1: everything here works) ---------------------------------------------------------------- */
CONTENT.rx = function (s) {
  var p = function () { return S.p; }, srv = function (i) { return function () { return NI.sr[i]; }; }, irv = function (i) { return function () { return NI.ir[i]; }; }, prv = function (i) { return function () { return NI.pr[i]; }; };
  s.grp.push([-1.76, -1.25, 1.94, 2.35, 'SOURCE RANGE'], [-1.21, -0.70, 1.94, 2.35, 'INTERMEDIATE RANGE'], [-1.76, -0.70, 1.42, 1.9, 'POWER RANGE'], [-0.5, 0.5, 1.76, 2.35, 'ROD POSITION'], [-0.4, 0.4, 1.44, 1.72, 'PERMISSIVES & BYPASSES'], [0.54, 1.76, 1.6, 2.35, 'REACTOR PARAMETERS']);
  em(s, -1.685, 2.115, 'N31', 'CPS', 1, 1e6, srv(0), { log: 1, name: 'N31 source range (train A)', w: 0.1, h: 0.29, alarm: function () { return !p().srBlk[0] && NI.sr[0] > 5e4; } });
  em(s, -1.57, 2.115, 'N32', 'CPS', 1, 1e6, srv(1), { log: 1, name: 'N32 source range (train B)', w: 0.1, h: 0.29, alarm: function () { return !p().srBlk[1] && NI.sr[1] > 5e4; } });
  var sur = function (lbl, name, v) { return { lbl: lbl, unit: 'DPM', min: -1, max: 5, v: v, major: 3, bands: [[0.33, 0.5, '#59b36b'], [0.5, 1, '#e0b43a']], tip: function () { return name + ': ' + v().toFixed(2) + ' decades per minute'; } }; };
  onPanel(s, meterR(sur('SR SUR N31', 'N31 startup rate', function () { return NI.surSr[0]; })), -1.375, 2.215); onPanel(s, meterR(sur('SR SUR N32', 'N32 startup rate', function () { return NI.surSr[1]; })), -1.375, 2.075);
  em(s, -1.135, 2.115, 'N35', 'AMPS', 1e-11, 1e-3, irv(0), { log: 1, name: 'N35 intermediate range', w: 0.1, h: 0.29 });
  em(s, -1.02, 2.115, 'N36', 'AMPS', 1e-11, 1e-3, irv(1), { log: 1, name: 'N36 intermediate range', w: 0.1, h: 0.29 });
  onPanel(s, meterR(sur('IR SUR N35', 'N35 startup rate', function () { return p().sur * IRG[0]; })), -0.825, 2.215); onPanel(s, meterR(sur('IR SUR N36', 'N36 startup rate', function () { return p().sur * IRG[1]; })), -0.825, 2.075);
  ['N41', 'N42', 'N43', 'N44'].forEach(function (n, i) { em(s, -1.685 + i * 0.115, 1.63, n, '% POWER', 0, 120, prv(i), { major: 6, minor: 4, name: n + ' power range', w: 0.1, h: 0.29, bands: [[25 / 120, 26 / 120, '#e0b43a'], [109 / 120, 1, '#d64535']] }); });
  dg(s, -0.9, 1.8, 'NIS POWER %', function () { return D.pr.toFixed(2); }, { name: 'Average power range', w: 0.27 });
  dg(s, -0.9, 1.7, 'STARTUP RATE DPM', function () { return (p().sur >= 0 ? '+' : '') + p().sur.toFixed(2); }, { name: 'Startup rate', w: 0.27, col: '#ffd34a' });
  dg(s, -0.9, 1.6, 'N35 IR AMPS', function () { return fmtSci(NI.ir[0], 2); }, { name: 'Intermediate range current', w: 0.27, col: '#58d6ff' });
  dg(s, -0.9, 1.5, 'N31 SR CPS', function () { return p().srBlk[0] ? 'OFF' : NI.sr[0] < 1e5 ? String(Math.round(NI.sr[0])) : fmtSci(NI.sr[0], 1); }, { name: 'Source range count rate', w: 0.27, col: '#59e07a' });
  onPanel(s, drpi({ w: 0.92, h: 0.41, tip: function () { return 'Rod positions: ' + BANKS.map(function (b) { return b + ' ' + Math.round(p().rods[b]); }).join(', ') + ' steps'; } }), 0, 2.11);
  onPanel(s, counters({ w: 0.62, h: 0.098, tip: function () { return 'Group demand counters. Control banks: ' + pcName(p().pc); } }), 0, 1.85);
  lb(s, 0, 1.575, 0.72, 0.21, 'PERMISSIVE / BYPASS STATUS', 4, [tl('P-6\nIR > 1E-10 A', function () { return p6(p()); }), tl('SR TRIP\nBLOCKED A', function () { return p().srBlk[0]; }, AMB), tl('SR TRIP\nBLOCKED B', function () { return p().srBlk[1]; }, AMB), tl('P-10\nPR > 10%', function () { return D.pr > 10; }),
    tl('RTB A\nCLOSED', function () { return p().rtb[0]; }, RED), tl('RTB B\nCLOSED', function () { return p().rtb[1]; }, RED), tl('ROD STOP\nC-1', function () { return NI.ir[0] > 2e-4 || NI.ir[1] > 2e-4; }, AMB), tl('SD BANKS\nOUT', function () { return SDB.every(function (b) { return p().rods[b] >= TOP; }); })]);
  var hpen = function (h) { return (Math.log10(Math.max(1e-11, 1e-3 * h[1] + 4e-12)) + 11) / 8; };
  onPanel(s, chart({ lbl: 'IR LOG POWER', w: 0.25, h: 0.22, span: 600, pens: [{ col: '#c0392b', f: hpen }], scale: function (g, x0, y, cw) { for (var i = 0; i <= 4; i++) superExp(g, '10', String(-11 + i * 2), x0 + cw * i / 4, y + 10, 13, '#ddd', 'center'); }, tip: function () { return 'Recorder: intermediate range log power, last 10 minutes (paper moves down)'; } }), 0.69, 2.13);
  onPanel(s, chart({ lbl: 'TAVG 285–300 °C', w: 0.25, h: 0.22, span: 600, pens: [{ col: '#1f5fa8', f: function (h) { return (h[2] - 285) / 15; } }], scale: function (g, x0, y, cw) { [285, 290, 295, 300].forEach(function (v, i) { ctext(g, String(v), x0 + cw * i / 3, y + 10, 13, '#ddd'); }); }, tip: function () { return 'Recorder: Tavg ' + p().Tavg.toFixed(2) + ' °C (no-load Tavg is 291.7 °C)'; } }), 0.96, 2.13);
  onPanel(s, chart({ lbl: 'STARTUP RATE DPM', w: 0.25, h: 0.22, span: 600, pens: [{ col: '#7d3c98', f: function (h) { return (h[3] + 1) / 6; } }], scale: function (g, x0, y, cw) { [-1, 0, 1, 2, 3, 4, 5].forEach(function (v, i) { ctext(g, String(v), x0 + cw * i / 6, y + 10, 13, '#ddd'); }); }, tip: function () { return 'Recorder: startup rate ' + p().sur.toFixed(2) + ' DPM'; } }), 1.23, 2.13);
  em(s, 1.445, 2.115, 'TAVG', '°C', 280, 300, function () { return p().Tavg; }, { major: 4, minor: 5, name: 'Average coolant temperature', w: 0.1, h: 0.29 });
  em(s, 1.56, 2.115, 'STM P', 'BAR', 60, 90, function () { return p().Ps; }, { major: 3, minor: 5, name: 'Steam header pressure', w: 0.1, h: 0.29, bands: [[24 / 30, 1, '#d64535']] });
  em(s, 1.675, 2.115, 'DUMPS', '% OPEN', 0, 100, function () { return p().dump * 100; }, { major: 5, minor: 2, name: 'Steam dump demand', w: 0.1, h: 0.29 });
  var row1 = [['TAVG °C', function () { return p().Tavg.toFixed(1); }], ['RCS PRESS BAR', function () { return p().rcs.toFixed(1); }], ['PZR LEVEL %', function () { return p().pzr.toFixed(1); }], ['BORON PPM', function () { return String(Math.round(p().boron)); }], ['DELTA T °C', function () { return D.dT.toFixed(1); }], ['STM DUMP %', function () { return (p().dump * 100).toFixed(1); }]];
  var row2 = [['CTRL BANK', function () { var pc = p().pc; if (pc <= 0) return 'ALL IN'; var b = pc >= 3 * OVL ? 'D' : pc >= 2 * OVL ? 'C' : pc >= OVL ? 'B' : 'A'; return b + ' ' + Math.round(b === 'D' ? pc - 3 * OVL : b === 'C' ? pc - 2 * OVL : b === 'B' ? pc - OVL : pc); }], ['BANK SELECT', function () { return p().sel; }], ['ROD SPEED SPM', function () { return p().lever ? String(SDB.indexOf(p().sel) >= 0 ? SPM_S : SPM_C) : '0'; }], ['PLANT MODE', function () { return 'MODE ' + D.mode; }], ['STATION TIME', function () { return clockStr(D.clock); }], ['TRIPS TODAY', function () { return String(p().trips); }]];
  row1.forEach(function (r, i) { dg(s, 0.645 + i * 0.205, 1.8, r[0], r[1], { w: 0.19, col: i === 0 ? '#ff4a3a' : '#ff6a4a' }); });
  row2.forEach(function (r, i) { dg(s, 0.645 + i * 0.205, 1.69, r[0], r[1], { w: 0.19, col: i === 4 ? '#59e07a' : '#ffb84a' }); });
  s.tag.push([1.15, 1.5, 'MODE 2 (STARTUP): keff ≥ 0.99 AND POWER ≤ 5%', 560, 30, 16, '#3a2a0a', '#ffd35a'], [1.15, 1.42, 'SOURCE RANGE TRIP: 1E5 CPS  ·  P-6: 1E-10 A', 560, 30, 16]);
  s.tag.push([-0.85, 1.3, 'NIS: N31/N32 BF3 PROPORTIONAL COUNTERS · N35/N36 COMPENSATED ION CHAMBERS · N41–N44 UNCOMPENSATED ION CHAMBERS', 900, 26, 14, '#2b3036', '#cdd3d8']);
  addAnn(s, annTiles([
    ['SR HI FLUX\nREACTOR TRIP', 'trip', function () { return p().tripped && p().firstOut === 'SR'; }], ['IR HI FLUX\nREACTOR TRIP', 'trip', function () { return p().tripped && p().firstOut === 'IR'; }], ['PR HI FLUX\nLO SETPT TRIP', 'trip', function () { return p().tripped && p().firstOut === 'PRL'; }], ['PR HI FLUX\nHI SETPT TRIP', 'trip', function () { return p().tripped && p().firstOut === 'PRH'; }],
    ['MANUAL\nREACTOR TRIP', 'trip', function () { return p().tripped && p().firstOut === 'MAN'; }], ['REACTOR TRIP\nBKR A OPEN', 'alarm', function () { return !p().rtb[0]; }], ['REACTOR TRIP\nBKR B OPEN', 'alarm', function () { return !p().rtb[1]; }], ['ROD BOTTOM\nROD DROP', 'alarm', function () { return p().dropping; }],
    ['SR HIGH\nFLUX LEVEL', 'alarm', function () { return (!p().srBlk[0] && NI.sr[0] > 5e4) || (!p().srBlk[1] && NI.sr[1] > 5e4); }], ['STARTUP RATE\nHIGH\n> 1 DPM', 'alarm', function () { return p().sur > 1; }], ['IR HI FLUX\nROD STOP', 'alarm', function () { return NI.ir[0] > 2e-4 || NI.ir[1] > 2e-4; }], ['ROD CONTROL\nURGENT\nFAILURE'], ['NIS PR\nCHANNEL\nDEVIATION'], ['SG SAFETY\nVALVE OPEN', 'alarm', function () { return p().Ps > 84; }],
    ['P-6\nIR ABOVE\n1E-10 A', 'status', function () { return p6(p()); }], ['SR TRIP\nBLOCKED\nTRAIN A', 'status', function () { return p().srBlk[0]; }], ['SR TRIP\nBLOCKED\nTRAIN B', 'status', function () { return p().srBlk[1]; }], ['P-10\nPR ABOVE\n10%', 'status', function () { return p10(p()); }],
    ['SHUTDOWN\nBANKS\nFULLY OUT', 'status', function () { return SDB.every(function (b) { return p().rods[b] >= TOP; }); }], ['ROD MOTION\nIN PROGRESS', 'status', function () { return p().t - (p().moveT || -9) < 1.6; }], ['STEAM DUMP\nVALVES OPEN', 'status', function () { return p().dump > 0.03; }], ['SR AUDIO\nMUTED', 'status', function () { return !p().audio; }],
    ['MODE 2\nSTARTUP', 'status', function () { return D.mode === 2; }], ['MODE 1\nPOWER\nOPERATION', 'status', function () { return D.mode === 1; }], [''], [''], [''], [''],
    ['NIS DETECTOR\nHV FAILURE'], ['NIS RACK\nPOWER LOSS'], ['ROD POSITION\nDEVIATION'], ['ROD INSERTION\nLIMIT LO'], ['ROD INSERTION\nLIMIT LO-LO'], ['DRPI\nNON-URGENT\nFAILURE'], ['PLANT\nCOMPUTER\nALARM'], [''], [''], [''], [''], [''], [''], ['']]));
  /* desk */
  s.dgrp.push([-1.74, -1.12, 0.32, 0.95, 'ANNUNCIATOR'], [-1.04, -0.42, 0.3, 0.95, 'SOURCE RANGE'], [-0.37, 0.43, 0.25, 0.95, 'ROD CONTROL'], [0.48, 1.08, 0.25, 0.95, 'REACTOR TRIP BREAKERS'], [1.15, 1.75, 0.2, 0.95, 'REACTOR TRIP', '#8f1a14']);
  pushBtn(s, -1.64, 0.62, { col: 0xeeeeee, label: 'ACK', lw: 70, tip: 'Annunciator ACKNOWLEDGE: stops the horn and makes flashing windows go steady', act: function () { ANNC.ack(); } });
  pushBtn(s, -1.5, 0.62, { col: 0xf2c21b, label: 'SILENCE', lw: 90, tip: 'SILENCE: stops the horn without acknowledging', act: function () { ANNC.silence(); } });
  pushBtn(s, -1.36, 0.62, { col: 0x2f6fd8, label: 'RESET', lw: 80, tip: 'RESET: clears windows whose alarm has gone away (slow flashing)', act: function () { ANNC.reset(); } });
  pushBtn(s, -1.22, 0.62, { col: 0xffffff, label: 'TEST', lw: 70, tip: 'LAMP TEST: hold to light every window and lamp', act: function () {}, hold: function (on) { S.lampTest = on; } });
  litButton(s, -0.9, 0.6, { col: '#ffc94a', txt: 'SR TRIP\nBLOCK\nTRAIN A', label: 'BLOCK / RESET', lit: function () { return S.p.srBlk[0]; }, tip: function () { return 'Source range trip BLOCK, train A (' + (S.p.srBlk[0] ? 'BLOCKED: press to reset' : p6(S.p) ? 'P-6 is lit: press to block' : 'needs P-6 first') + ')'; }, act: function () { ACT.srBlock(0); } });
  litButton(s, -0.74, 0.6, { col: '#ffc94a', txt: 'SR TRIP\nBLOCK\nTRAIN B', label: 'BLOCK / RESET', lit: function () { return S.p.srBlk[1]; }, tip: function () { return 'Source range trip BLOCK, train B (' + (S.p.srBlk[1] ? 'BLOCKED: press to reset' : p6(S.p) ? 'P-6 is lit: press to block' : 'needs P-6 first') + ')'; }, act: function () { ACT.srBlock(1); } });
  lamp(s.desk, -0.82, 0, -0.86 * SL, 0xf5f2e6, function () { return p6(S.p); }, 'P-6 permissive lamp: lit when intermediate range current is above 1E-10 A', 0.013); s.dtag.push([-0.82, 0.77, 'P-6', 60, 24, 14]);
  toggle(s, -0.53, 0.6, { label: 'SR AUDIO', on: function () { return S.p.audio; }, tip: function () { return 'Source range audio count rate speaker: ' + (S.p.audio ? 'ON' : 'OFF'); }, act: function () { S.p.audio = !S.p.audio; } });
  rotary(s, -0.16, 0.6, { title: 'BANK SELECTOR', pos: ['MAN', 'AUTO', 'SA', 'SB', 'SC', 'SD'], dis: [0, 1, 0, 0, 0, 0], span: 200, size: 0.17,
    get: function () { return ['MAN', 'AUTO', 'SA', 'SB', 'SC', 'SD'].indexOf(S.p.sel); }, set: function (i) { ACT.select(['MAN', 'AUTO', 'SA', 'SB', 'SC', 'SD'][i]); }, tip: function () { return 'Bank selector: ' + S.p.sel + '. SA–SD move one shutdown bank. MAN moves the control banks A→D in overlap. Click a position.'; } });
  lever(s, 0.19, 0.58, { hold: function (dir) { ACT.lever(dir); } });
  lamp(s.desk, 0.34, 0, -0.74 * SL, 0xff3324, function () { return S.p.lever > 0 && S.p.t - (S.p.moveT || -9) < 1.4; }, 'Rods moving OUT', 0.01); s.dtag.push([0.34, 0.66, 'OUT', 50, 20, 13]);
  lamp(s.desk, 0.34, 0, -0.46 * SL, 0x2bd14a, function () { return S.p.lever < 0 && S.p.t - (S.p.moveT || -9) < 1.4; }, 'Rods moving IN', 0.01); s.dtag.push([0.34, 0.38, 'IN', 50, 20, 13]);
  s.dtag.push([0.03, 0.31, 'ROD SPEED: SHUTDOWN 64 SPM · CONTROL 48 SPM', 440, 26, 14]);
  jhandle(s, 0.63, 0.52, { title: 'RTB A', closed: function () { return S.p.rtb[0]; }, tip: function () { return 'Reactor trip breaker A: ' + (S.p.rtb[0] ? 'CLOSED (red). Turn left to trip.' : 'OPEN (green). Turn right to close.'); }, act: function (right) { ACT.rtb(0, right); } });
  jhandle(s, 0.93, 0.52, { title: 'RTB B', closed: function () { return S.p.rtb[1]; }, tip: function () { return 'Reactor trip breaker B: ' + (S.p.rtb[1] ? 'CLOSED (red). Turn left to trip.' : 'OPEN (green). Turn right to close.'); }, act: function (right) { ACT.rtb(1, right); } });
  mushroom(s, 1.3, 0.56, { tip: 'MANUAL REACTOR TRIP (train A): opens both trip breakers and drops every rod', act: function () { ACT.trip(); } });
  mushroom(s, 1.6, 0.56, { tip: 'MANUAL REACTOR TRIP (train B): opens both trip breakers and drops every rod', act: function () { ACT.trip(); } });
  s.dtag.push([1.45, 0.36, 'REACTOR TRIP', 200, 32, 18, '#8f1a14', '#fff']);
  s.dtag.push([-0.82, 0.38, 'BLOCK ONLY WHEN P-6 IS LIT', 260, 24, 13, '#3a2a0a', '#ffd35a']);
  /* P-10 blocks for power ascension: above 10% power the intermediate range and power range low trips must be blocked, or they trip the reactor at about 25% */
  s.dgrp.push([-1.74, -0.42, 0.02, 0.25, 'P-10 BLOCKS  \u00b7  BLOCK ONLY ABOVE 10% POWER']);
  [['irBlk', 0, 'IR TRIP\nBLOCK\nTRAIN A'], ['irBlk', 1, 'IR TRIP\nBLOCK\nTRAIN B'], ['prBlk', 0, 'PR LOW SP\nBLOCK\nTRAIN A'], ['prBlk', 1, 'PR LOW SP\nBLOCK\nTRAIN B']].forEach(function (q, k) {
    litButton(s, -1.6 + k * 0.2 + (k > 1 ? 0.08 : 0), 0.12, { col: '#ffc94a', txt: q[2], lit: function () { return !!(S.p[q[0]] && S.p[q[0]][q[1]]); }, tip: function () { var on = !!(S.p[q[0]] && S.p[q[0]][q[1]]); return (q[0] === 'irBlk' ? 'Intermediate range' : 'Power range low setpoint') + ' trip BLOCK, train ' + 'AB'[q[1]] + ' (' + (on ? 'BLOCKED: press to reset' : p10(S.p) ? 'P-10 is lit: press to block' : 'needs P-10 first') + ')'; }, act: function () { ACT.blk10(q[0], q[1]); } }); });
  lamp(s.desk, -0.62, 0, -0.12 * SL, 0xf5f2e6, function () { return p10(S.p); }, 'P-10 permissive lamp: lit when two of four power range channels are above 10%', 0.013); s.dtag.push([-0.62, 0.05, 'P-10', 60, 22, 13]);
};

/* ================================================================ computer screens, the wall mimic and the rest of the room ================================================================ */
var SCRF = '600 22px ' + FONT;
function scrHead(g, W, title, sub) { g.fillStyle = '#071019'; g.fillRect(0, 0, W, 2000); var gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#12324f'); gr.addColorStop(1, '#0b1d2e'); g.fillStyle = gr; g.fillRect(0, 0, W, 48);
  ctext(g, title, 16, 25, 24, '#e8f1f8', 'left', W - 260); ctext(g, sub || clockStr(D.clock), W - 16, 25, 22, '#7fd1ff', 'right', 240, '600'); }
function plotBox(g, x, y, w, h, lbl) { g.fillStyle = '#0c1824'; g.fillRect(x, y, w, h); g.strokeStyle = '#24425e'; g.lineWidth = 1; for (var i = 1; i < 6; i++) { g.beginPath(); g.moveTo(x, y + h * i / 6); g.lineTo(x + w, y + h * i / 6); g.stroke(); g.beginPath(); g.moveTo(x + w * i / 6, y); g.lineTo(x + w * i / 6, y + h); g.stroke(); } g.strokeStyle = '#3b6a93'; g.strokeRect(x, y, w, h); ctext(g, lbl, x + 8, y + 16, 17, '#9fc9ea', 'left', w - 16, '600'); }
function trace(g, x, y, w, h, arr, f, col, n) { g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); var st = false; arr.forEach(function (v, i) { var X = x + w * (i + (n - arr.length)) / (n - 1), Y = y + h * (1 - clamp(f(v), 0, 1)); if (st) g.lineTo(X, Y); else { g.moveTo(X, Y); st = true; } }); g.stroke(); }
function drawTrends(g) {
  var W = 1024, p = S.p, hs = p.hist.slice(-600); scrHead(g, W, 'NUCLEAR TRENDS · LAST 10 MINUTES');
  plotBox(g, 20, 64, 984, 200, 'LOG POWER (IR AMPS)  ' + fmtSci(NI.ir[0], 2) + ' A'); trace(g, 20, 64, 984, 200, hs, function (h) { return (Math.log10(1e-3 * h[1] + 4e-12) + 11) / 8; }, '#ff6b5b', 600);
  for (var i = 0; i <= 4; i++) superExp(g, '10', String(-11 + i * 2), 1000, 64 + 200 - i * 50, 14, '#6f93b3', 'right');
  plotBox(g, 20, 280, 984, 160, 'STARTUP RATE  ' + p.sur.toFixed(2) + ' DPM'); var y0 = 280 + 160 * 5 / 6; g.strokeStyle = '#4c7da8'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(20, y0); g.lineTo(1004, y0); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(255,190,60,.12)'; g.fillRect(20, 280 + 160 * (1 - 2 / 6), 984, 160 * 0.7 / 6); trace(g, 20, 280, 984, 160, hs, function (h) { return (h[3] + 1) / 6; }, '#ffd34a', 600);
  plotBox(g, 20, 456, 984, 160, 'TAVG  ' + p.Tavg.toFixed(2) + ' °C   STEAM  ' + p.Ps.toFixed(1) + ' BAR'); trace(g, 20, 456, 984, 160, hs, function (h) { return (h[2] - 285) / 15; }, '#58d6ff', 600); trace(g, 20, 456, 984, 160, hs, function (h) { return (h[4] - 70) / 15; }, '#c39bff', 600);
}
function drawOneM(g) {
  var W = 1024, p = S.p; scrHead(g, W, 'REACTOR STARTUP · 1/M PLOT (GOP-301 ATT. 3)');
  var x0 = 70, y0 = 80, w = 640, h = 470, X = function (pc) { return x0 + w * pc / PCMAX; }, Y = function (m) { return y0 + h * (1 - m / 1.1); };
  g.fillStyle = '#0c1824'; g.fillRect(x0, y0, w, h);
  var band = S.ecpBand; if (band) { g.fillStyle = 'rgba(89,224,122,.12)'; g.fillRect(X(band[0]), y0, X(band[1]) - X(band[0]), h); }
  g.strokeStyle = '#24425e'; g.lineWidth = 1; for (var i = 0; i <= 11; i++) { g.beginPath(); g.moveTo(x0, Y(i / 10)); g.lineTo(x0 + w, Y(i / 10)); g.stroke(); if (i % 2 === 0) ctext(g, (i / 10).toFixed(1), x0 - 10, Y(i / 10), 15, '#9fc9ea', 'right', 50, '600'); }
  [['A', 0], ['B', OVL], ['C', 2 * OVL], ['D', 3 * OVL], ['D228', PCMAX]].forEach(function (b) { g.strokeStyle = '#3b6a93'; g.beginPath(); g.moveTo(X(b[1]), y0); g.lineTo(X(b[1]), y0 + h); g.stroke(); ctext(g, b[0] === 'D228' ? 'ALL OUT' : 'BANK ' + b[0], X(b[1]) + (b[0] === 'D228' ? -30 : 34), y0 + h + 18, 14, '#9fc9ea', 'center', 80, '600'); });
  var ecp = 3 * OVL + ECP_D; g.strokeStyle = '#59e07a'; g.lineWidth = 2; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(X(ecp), y0); g.lineTo(X(ecp), y0 + h); g.stroke(); g.setLineDash([]); ctext(g, 'ECP D120', X(ecp), y0 - 12, 15, '#59e07a', 'center', 120);
  g.strokeStyle = '#ffd34a'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(p.pc), y0); g.lineTo(X(p.pc), y0 + h); g.stroke();
  var o = p.oneM, pr = ecpFromOneM(p);
  if (pr != null && o.length >= 2) { var b = o[o.length - 1]; g.strokeStyle = '#ff9f43'; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(X(b[0]), Y(b[1])); g.lineTo(X(clamp(pr, 0, PCMAX * 1.2)), Y(0)); g.stroke(); g.setLineDash([]); g.fillStyle = '#ff9f43'; g.beginPath(); g.arc(X(Math.min(pr, PCMAX)), Y(0), 7, 0, 6.3); g.fill(); }
  g.strokeStyle = '#ff6b5b'; g.lineWidth = 2.5; g.beginPath(); o.forEach(function (q, k) { if (k) g.lineTo(X(q[0]), Y(q[1])); else g.moveTo(X(q[0]), Y(q[1])); }); g.stroke();
  o.forEach(function (q) { g.fillStyle = '#fff'; g.beginPath(); g.arc(X(q[0]), Y(q[1]), 6, 0, 6.3); g.fill(); g.fillStyle = '#ff6b5b'; g.beginPath(); g.arc(X(q[0]), Y(q[1]), 4, 0, 6.3); g.fill(); });
  ctext(g, '1/M', 26, y0 + h / 2, 20, '#e8f1f8'); ctext(g, 'CONTROL BANK WITHDRAWAL', x0 + w / 2, 612, 16, '#9fc9ea', 'center', 400, '600');
  var rx = 740, line = function (k, v, col, yy) { ctext(g, k, rx, yy, 16, '#7fa6c6', 'left', 270, '600'); ctext(g, v, rx, yy + 26, 24, col || '#e8f1f8', 'left', 270); };
  line('N31 / N32 (CPS)', p.srBlk[0] ? 'BLOCKED' : Math.round(NI.sr[0]) + ' / ' + Math.round(NI.sr[1]), '#59e07a', 86);
  line('REFERENCE C₀', p.c0 ? Math.round(p.c0) + ' cps' : 'not yet: needs SD banks out, rods still 20 s', null, 150);
  line('CURRENT 1/M', p.c0 ? (p.c0 / Math.max(1, p.srAvg)).toFixed(3) : '—', '#ff6b5b', 214);
  line('PREDICTED CRITICAL', pr != null ? (pr > PCMAX ? 'beyond all rods out!' : pcName(pr).replace('bank ', 'Bank ')) : 'needs 2 points', '#ff9f43', 278);
  line('ECP (FROM REACTOR ENGINEER)', 'Bank D at 120 steps', '#59e07a', 342);
  line('CONTROL BANKS NOW', pcName(p.pc).replace('bank ', 'Bank '), '#ffd34a', 406);
  var still = p.c0 == null ? '' : p.stillT >= 25 ? 'Counts settled: next point at +20 steps' : 'Settling: ' + Math.max(0, 25 - p.stillT).toFixed(0) + ' s';
  line('NEXT POINT', still || '—', null, 470);
  ctext(g, 'Plot a point every 20+ steps. Each time, stop and let the counts settle.', rx, 560, 15, '#7fa6c6', 'left', 270, '600');
  ctext(g, 'Where the line meets 0 is where you go critical.', rx, 584, 15, '#7fa6c6', 'left', 270, '600');
}
function drawProc(g) {
  var W = 1024, ms = MS.steps(), P = ms.P, n = ms.items.length, lh = Math.min(42, Math.floor(290 / n)), fs = lh >= 36 ? 21 : lh >= 28 ? 18 : 16; scrHead(g, W, P.code + ' · ' + P.t.toUpperCase());
  var y = 52 + lh / 2 + 6; ms.items.forEach(function (st, i) { var done = st.state === 'done', cur = st.state === 'cur'; g.fillStyle = cur ? 'rgba(255,211,74,.14)' : 'rgba(0,0,0,0)'; g.fillRect(12, y - lh / 2, W - 24, lh - 2);
    ctext(g, done ? '✔' : cur ? '▶' : '□', 36, y, fs + 2, done ? '#59e07a' : cur ? '#ffd34a' : '#58738c'); ctext(g, (i + 1) + '. ' + st.t, 64, y, fs, done ? '#7fb89a' : cur ? '#fff' : '#9fb3c6', 'left', W - 90, cur ? 'bold' : '600'); y += lh; });
  g.fillStyle = '#12324f'; g.fillRect(0, 352, W, 36); ctext(g, 'ALARM LIST (NEWEST FIRST)', 16, 370, 19, '#e8f1f8', 'left', 600); ctext(g, ANNC.list.length + ' entries', W - 16, 370, 16, '#7fd1ff', 'right', 200, '600');
  ANNC.list.slice(0, 10).forEach(function (a, i) { var yy = 404 + i * 23, col = a.k === 'trip' ? '#ff6b5b' : a.k === 'status' ? '#cfd8e0' : a.clear ? '#7f93a6' : '#ffd34a';
    ctext(g, clockStr(a.at), 16, yy, 17, '#7fa6c6', 'left', 110, '600'); ctext(g, a.lbl.replace(/\n/g, ' '), 130, yy, 17, col, 'left', 640, '600'); ctext(g, a.clear ? 'CLEAR' : a.k === 'status' ? 'ON' : 'ALARM', W - 16, yy, 16, col, 'right', 120, 'bold'); });
}
function drawStatus(g) {
  var W = 1024, p = S.p; scrHead(g, W, 'UNIT 1 PLANT STATUS');
  var rows = [['PLANT MODE', 'MODE ' + D.mode + (D.mode === 3 ? ' · HOT STANDBY' : D.mode === 2 ? ' · STARTUP' : ' · POWER OPERATION'), D.mode === 3 ? '#9fc9ea' : D.mode === 2 ? '#ffd34a' : '#ff9f43'], ['REACTOR POWER', D.pr < 0.1 ? fmtSci(NI.ir[0], 2) + ' A (IR)' : D.pr.toFixed(2) + ' %'], ['STARTUP RATE', p.sur.toFixed(2) + ' DPM'],
    ['TAVG / TREF (NO LOAD)', p.Tavg.toFixed(2) + ' / 291.70 °C'], ['RCS PRESSURE', p.rcs.toFixed(1) + ' bar'], ['PRESSURISER LEVEL', p.pzr.toFixed(1) + ' %'], ['SUBCOOLING MARGIN', D.sub.toFixed(1) + ' °C', '#59e07a'], ['STEAM PRESSURE', p.Ps.toFixed(1) + ' bar'], ['STEAM DUMPS', (p.dump * 100).toFixed(1) + ' % open'],
    ['RCS BORON', Math.round(p.boron) + ' ppm'], ['SHUTDOWN BANKS', SDB.map(function (b) { return Math.round(p.rods[b]); }).join(' / ') + ' steps'], ['CONTROL BANKS', pcName(p.pc)], ['TRIP BREAKERS', (p.rtb[0] ? 'A CLOSED' : 'A OPEN') + ' · ' + (p.rtb[1] ? 'B CLOSED' : 'B OPEN'), p.rtb[0] && p.rtb[1] ? '#ff6b5b' : '#59e07a'], ['GRID FREQUENCY', D.grid.toFixed(3) + ' Hz']];
  rows.forEach(function (r, i) { var y = 80 + i * 39; g.fillStyle = i % 2 ? '#0b1825' : '#0e1f30'; g.fillRect(16, y - 18, W - 32, 37); ctext(g, r[0], 30, y, 19, '#7fa6c6', 'left', 360, '600'); ctext(g, r[1], 400, y, 22, r[2] || '#e8f1f8', 'left', 600); });
}
function drawLog(g) { var W = 1024; scrHead(g, W, 'SHIFT LOG · UNIT 1 · CONTROL ROOM SUPERVISOR');
  var L = S.log.slice(-13); if (!L.length) ctext(g, 'Nothing logged yet this shift.', 30, 90, 20, '#7fa6c6', 'left', 900, '600');
  L.forEach(function (e, i) { var y = 84 + i * 42; ctext(g, clockStr(e[0]), 24, y, 19, '#7fd1ff', 'left', 120, '600'); ctext(g, e[1], 150, y, 20, '#e8f1f8', 'left', 850, '600'); }); }
function drawAlarmWall(g) { var W = 1280, H = 720; g.fillStyle = '#05090d'; g.fillRect(0, 0, W, H); g.fillStyle = '#3a0d0b'; g.fillRect(0, 0, W, 70); ctext(g, 'ACTIVE ALARMS', 24, 36, 38, '#ffd9d4', 'left', 600); ctext(g, clockStr(D.clock), W - 24, 36, 36, '#ffb3a8', 'right', 300);
  var act = ANN.filter(function (t) { return t.lbl && t.k !== 'status' && t.st !== 'off'; }); if (!act.length) { ctext(g, 'NO ACTIVE ALARMS', W / 2, H / 2, 54, '#59e07a'); return; }
  var ph = Math.floor(performance.now() / 300) % 2; act.slice(0, 11).forEach(function (t, i) { var y = 110 + i * 56, col = t.k === 'trip' ? '#ff5a48' : '#ffc94a', fl = t.st === 'alert' && ph; g.fillStyle = fl ? col : 'rgba(255,255,255,.04)'; g.fillRect(16, y - 24, W - 32, 50);
    ctext(g, t.lbl.replace(/\n/g, ' '), 34, y, 32, fl ? '#140c00' : col, 'left', 900); ctext(g, t.st === 'alert' ? 'UNACKNOWLEDGED' : t.st === 'ring' ? 'CLEARED: RESET' : 'ACKNOWLEDGED', W - 34, y, 22, fl ? '#140c00' : '#c9d2da', 'right', 300, 'bold'); }); }
/* the big plant overview on the west wall */
function drawMimic(g) {
  var W = 1600, H = 800, p = S.p; g.fillStyle = '#0a1118'; g.fillRect(0, 0, W, H); var gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#13314d'); gr.addColorStop(1, '#0b1d2e'); g.fillStyle = gr; g.fillRect(0, 0, W, 60);
  ctext(g, 'UNIT 1 · PLANT OVERVIEW', 24, 31, 34, '#e8f1f8', 'left', 700); ctext(g, 'MODE ' + D.mode + '   ' + clockStr(D.clock), W - 24, 31, 30, '#7fd1ff', 'right', 500);
  var hot = '#e74c3c', cold = '#3498db', stm = '#bb8fce', fw = '#5dade2', pipe = function (pts, col, wd) { g.strokeStyle = col; g.lineWidth = wd || 14; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); };
  var val = function (k, v, x, y, col) { g.fillStyle = 'rgba(0,0,0,.55)'; rr(g, x - 4, y - 22, 220, 50, 6); g.fill(); ctext(g, k, x + 4, y - 8, 15, '#8fb3d1', 'left', 210, '600'); ctext(g, v, x + 4, y + 14, 22, col || '#fff', 'left', 210); };
  /* containment */
  g.strokeStyle = '#4b5d6e'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 740); g.lineTo(80, 260); g.arc(390, 260, 310, Math.PI, 0); g.lineTo(700, 740); g.stroke(); ctext(g, 'REACTOR BUILDING (CONTAINMENT)', 390, 760, 18, '#6f8496');
  pipe([[300, 420], [500, 420], [500, 300], [560, 300]], hot); pipe([[560, 640], [500, 640], [430, 640], [430, 560], [300, 560]], cold);
  g.fillStyle = '#5d6d7e'; rr(g, 200, 330, 120, 340, 50); g.fill(); g.fillStyle = '#1b2631'; rr(g, 220, 420, 80, 200, 12); g.fill();
  var glow = clamp(Math.log10(Math.max(p.n, 1e-11)) + 11, 0, 11) / 11; g.fillStyle = 'rgba(80,170,255,' + (0.15 + glow * 0.75).toFixed(2) + ')'; rr(g, 225, 425, 70, 190, 10); g.fill();
  BANKS.forEach(function (b, i) { var z = p.rods[b] / TOP, x = 230 + i * 8.5; g.fillStyle = '#d5d8dc'; g.fillRect(x, 420 - z * 150, 5, 190); });
  ctext(g, 'REACTOR', 260, 690, 18, '#cfd8e0');
  g.fillStyle = '#7f8c8d'; rr(g, 560, 240, 110, 430, 50); g.fill(); ctext(g, 'SG ×4', 615, 690, 18, '#cfd8e0');
  g.fillStyle = '#7f8c8d'; rr(g, 380, 140, 70, 170, 30); g.fill(); g.fillStyle = '#5dade2'; g.fillRect(388, 300 - p.pzr * 1.5, 54, p.pzr * 1.5); ctext(g, 'PZR', 415, 128, 18, '#cfd8e0'); pipe([[415, 310], [415, 420]], hot, 8);
  g.fillStyle = '#566573'; g.beginPath(); g.arc(470, 640, 30, 0, 6.3); g.fill(); ctext(g, 'RCP ×4', 470, 595, 16, '#cfd8e0');
  pipe([[615, 240], [615, 170], [930, 170]], stm, 12); pipe([[1180, 400], [1180, 560]], stm, 10); pipe([[760, 170], [760, 470], [1050, 470]], stm, 8);
  ctext(g, 'STEAM DUMPS ' + (p.dump * 100).toFixed(0) + '%', 860, 500, 17, p.dump > 0.03 ? '#ffd34a' : '#8fb3d1');
  g.fillStyle = '#5d6d7e'; g.beginPath(); g.moveTo(930, 130); g.lineTo(1000, 110); g.lineTo(1000, 230); g.lineTo(930, 210); g.fill(); g.beginPath(); g.moveTo(1010, 110); g.lineTo(1180, 70); g.lineTo(1180, 270); g.lineTo(1010, 230); g.fill(); ctext(g, 'HP', 965, 250, 17, '#cfd8e0'); ctext(g, 'LP TURBINES', 1095, 290, 17, '#cfd8e0');
  g.fillStyle = '#7d6608'; rr(g, 1210, 110, 170, 120, 16); g.fill(); ctext(g, 'GENERATOR', 1295, 170, 19, '#fff');
  g.strokeStyle = '#59e07a'; g.lineWidth = 5; g.beginPath(); g.moveTo(1380, 170); g.lineTo(1450, 170); g.stroke(); g.strokeStyle = '#59e07a'; g.lineWidth = 4; g.strokeRect(1450, 150, 34, 40); ctext(g, 'GEN BKR OPEN', 1467, 215, 15, '#59e07a'); g.beginPath(); g.moveTo(1484, 170); g.lineTo(1560, 170); g.stroke(); ctext(g, '400 kV GRID', 1520, 140, 17, '#cfd8e0');
  g.fillStyle = '#34495e'; rr(g, 1050, 560, 260, 110, 14); g.fill(); ctext(g, 'CONDENSER', 1180, 615, 19, '#cfd8e0');
  pipe([[1050, 640], [900, 640], [900, 600], [670, 600]], fw, 10); g.fillStyle = '#566573'; g.beginPath(); g.arc(900, 640, 24, 0, 6.3); g.fill(); ctext(g, 'AUX FEED', 900, 690, 16, '#cfd8e0');
  g.strokeStyle = '#2e86c1'; g.lineWidth = 8; g.beginPath(); g.moveTo(1310, 600); g.lineTo(1420, 600); g.lineTo(1420, 680); g.lineTo(1310, 680); g.stroke(); ctext(g, 'SEA WATER', 1470, 640, 17, '#cfd8e0');
  val('REACTOR POWER', D.pr < 0.1 ? fmtSci(NI.ir[0], 2) + ' A' : D.pr.toFixed(2) + ' %', 90, 140, '#ff9f8f'); val('STARTUP RATE', p.sur.toFixed(2) + ' DPM', 90, 200, '#ffd34a');
  val('T HOT', D.thot.toFixed(1) + ' °C', 320, 395, '#ff9f8f'); val('T COLD', D.tcold.toFixed(1) + ' °C', 300, 590, '#9fd0ff');
  val('RCS PRESSURE', p.rcs.toFixed(1) + ' bar', 470, 92); val('STEAM PRESSURE', p.Ps.toFixed(1) + ' bar', 690, 140, '#d7bde2'); val('TURBINE', Math.round(p.x.tb.rpm) + ' rpm' + (p.x.tb.tg ? ' (turning gear)' : ''), 930, 330);
  val('GENERATOR', Math.round(p.x.tb.mw) + ' MW' + (p.x.tb.gen ? '' : ' (off line)'), 1210, 260); val('GRID', D.grid.toFixed(3) + ' Hz', 1370, 260, '#7dffa0'); val('BORON', Math.round(p.boron) + ' ppm', 90, 260);
  val('CONTROL RODS', pcName(p.pc), 1220, 380); val('SHUTDOWN RODS', SDB.every(function (b) { return p.rods[b] >= TOP; }) ? 'all out' : SDB.every(function (b) { return p.rods[b] <= 0; }) ? 'all in' : 'moving', 1220, 440);
  if (p.tripped) { g.fillStyle = 'rgba(200,30,20,.85)'; rr(g, 1050, 720, 520, 60, 10); g.fill(); ctext(g, p.trips ? 'REACTOR TRIPPED · ' + (TRIPS[p.firstOut] || 'RTBs open') : 'REACTOR SHUT DOWN · TRIP BREAKERS OPEN', 1310, 750, 22, '#fff', 'center', 500); }
  else if (D.keff >= 0.9995 && p.sur > -0.02) { g.fillStyle = 'rgba(30,140,70,.85)'; rr(g, 1050, 720, 520, 60, 10); g.fill(); ctext(g, 'REACTOR CRITICAL', 1310, 750, 26, '#fff'); }
}
function screenMesh(parent, w, h, cw, ch, draw, every, x, y, z, ry, tip, view) {
  var sw = screen({ cw: cw, ch: ch, w: w, h: h, draw: draw, every: every, tip: tip }); sw.m.position.set(x, y, z); sw.m.rotation.y = ry || 0; parent.add(sw.m); sw.o.fast = false;
  hit(sw.m, { tip: tip, w: sw, view: view }); SCR.push(sw); return sw;
}
function monitor(parent, x, z, ry, draw, tip, view, y) {
  var g = new THREE.Group(); g.position.set(x, y || 0.765, z); g.rotation.y = ry; parent.add(g);
  box(0.66, 0.42, 0.035, MAT.monitor, 0, 0.36, -0.02, g); box(0.06, 0.15, 0.04, MAT.monitor, 0, 0.08, -0.06, g); box(0.26, 0.012, 0.18, MAT.monitor, 0, 0.006, -0.06, g);
  return screenMesh(g, 0.62, 0.3875, 1024, 640, draw, 0.5, 0, 0.36, 0.0, 0, tip, view);
}
function chair(scene, x, z, ry) {
  var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
  for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2, leg = box(0.32, 0.03, 0.04, MAT.black, Math.cos(a) * 0.16, 0.06, Math.sin(a) * 0.16, g); leg.rotation.y = -a; var w = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), MAT.black); w.position.set(Math.cos(a) * 0.3, 0.026, Math.sin(a) * 0.3); g.add(w); }
  var col = cyl(0.025, 0.025, 0.36, MAT.chrome, 10); col.position.y = 0.26; g.add(col); box(0.5, 0.08, 0.48, MAT.fabric, 0, 0.47, 0, g); box(0.48, 0.6, 0.07, MAT.fabric, 0, 0.84, 0.25, g); box(0.05, 0.25, 0.04, MAT.black, 0, 0.55, 0.24, g);
  [-1, 1].forEach(function (k) { box(0.05, 0.03, 0.3, MAT.black, k * 0.27, 0.66, 0.0, g); box(0.03, 0.17, 0.03, MAT.black, k * 0.27, 0.57, 0.08, g); });
}
function furniture(scene) {
  /* operator console in the middle of the horseshoe */
  var con = new THREE.Group(); con.position.set(0, 0, CZ); scene.add(con);
  box(2.9, 0.05, 0.9, MAT.desk, 0, 0.74, 0, con); box(0.55, 0.715, 0.8, MAT.cab2, -1.1, 0.3575, -0.02, con); box(0.55, 0.715, 0.8, MAT.cab2, 1.1, 0.3575, -0.02, con); box(1.7, 0.5, 0.03, MAT.cab2, 0, 0.45, -0.4, con);
  floorShadow(scene, 0, CZ, 3.4, 1.4, 0);
  monitor(con, -0.82, -0.18, 0.32, drawTrends, function () { return 'Console screen: nuclear trends (log power, startup rate, Tavg)'; }, 'trends');
  monitor(con, 0, -0.25, 0, drawOneM, function () { return 'Console screen: 1/M plot. Predicts where the reactor will go critical.'; }, 'onem');
  monitor(con, 0.82, -0.18, -0.32, drawProc, function () { return 'Console screen: the procedure checklist you are on, and the alarm list'; }, 'proc');
  box(0.45, 0.02, 0.15, MAT.black, -0.1, 0.775, 0.18, con); box(0.07, 0.02, 0.1, MAT.black, 0.25, 0.775, 0.2, con);
  var ph = box(0.2, 0.07, 0.18, new THREE.MeshStandardMaterial({ color: 0xa61b1b, roughness: 0.4 }), -1.2, 0.8, 0.12, con); hit(ph, { tip: 'Red phone: the direct line to the National Grid control centre' });
  var bind = box(0.3, 0.05, 0.36, new THREE.MeshStandardMaterial({ color: 0xc4302b, roughness: 0.6 }), 1.15, 0.79, 0.1, con); hit(bind, { tip: 'GOP-301 Reactor Startup procedure binder. The same steps are on the right-hand console screen.' });
  chair(scene, -0.95, CZ + 0.87, Math.PI + 0.25); chair(scene, 1.0, CZ + 0.9, Math.PI - 0.3);
  /* supervisor's desk */
  var sup = new THREE.Group(); sup.position.set(0, 0, SZ); scene.add(sup);
  box(2.2, 0.05, 0.85, MAT.wood, 0, 0.74, 0, sup); box(0.5, 0.715, 0.75, MAT.cab2, -0.8, 0.3575, 0, sup); box(0.5, 0.715, 0.75, MAT.cab2, 0.8, 0.3575, 0, sup);
  floorShadow(scene, 0, SZ, 2.6, 1.3, 0);
  monitor(sup, -0.36, -0.2, 0.12, drawStatus, function () { return 'Supervisor screen: plant status'; }, 'status');
  monitor(sup, 0.36, -0.2, -0.12, drawLog, function () { return 'Supervisor screen: shift log'; }, 'log');
  chair(scene, 0, SZ + 0.75, Math.PI);
  /* wall mimic */
  box(5.5, 2.75, 0.12, MAT.monitor, -3.6, 2.1, ZF - 0.07, scene).rotation.y = Math.PI;
  screenMesh(scene, 5.3, 2.65, 1600, 800, drawMimic, 1, -3.6, 2.1, ZF - 0.14, Math.PI, function () { return 'Plant overview mimic: the whole station on one screen'; }, 'mimic');
  /* alarm summary + clock on the east wall */
  box(2.9, 1.7, 0.1, MAT.monitor, 3.4, 1.95, ZF - 0.06, scene).rotation.y = Math.PI;
  screenMesh(scene, 2.76, 1.55, 1280, 720, drawAlarmWall, 0.3, 3.4, 1.95, ZF - 0.12, Math.PI, function () { return 'Alarm summary screen'; }, 'alarms');
  var ck = digital({ lbl: 'STATION TIME (UTC)', txt: function () { return clockStr(D.clock); }, w: 1.0, h: 0.4, col: '#ff3b2f' }); ck.m.position.set(3.4, 3.15, ZF - 0.1); ck.m.rotation.y = Math.PI; scene.add(ck.m); hit(ck.m, { tip: function () { return 'Station clock: ' + clockStr(D.clock); } });
  var dw = widget({ cw: 512, ch: 300, w: 1.1, h: 0.64, glow: true, key: function () { return Math.floor(S.daysSince()) + ':' + S.p.trips; }, draw: function (g) { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, 512, 300); g.fillStyle = '#1f3b57'; g.fillRect(0, 0, 512, 64); ctext(g, 'DAYS WITHOUT A REACTOR TRIP', 256, 33, 30, '#fff', 'center', 490); g.fillStyle = '#111'; g.fillRect(146, 84, 220, 130); ctext(g, String(Math.floor(S.daysSince())), 256, 152, 104, '#ff3b2f', 'center', 210); ctext(g, 'SAFETY FIRST · QUESTIONING ATTITUDE', 256, 254, 22, '#1f3b57', 'center', 490); } });
  dw.m.position.set(6.4, 1.9, ZF - 0.05); dw.m.rotation.y = Math.PI; scene.add(dw.m); hit(dw.m, { tip: function () { return 'Days without a reactor trip: ' + Math.floor(S.daysSince()) + '. Trip the reactor and it goes back to 0.'; } });
  /* shift turnover whiteboard on the back wall */
  var wb = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), new THREE.MeshStandardMaterial({ roughness: 0.3, map: signTex(1200, 650, function (g) { g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, 1200, 650); g.strokeStyle = '#9aa0a6'; g.lineWidth = 16; g.strokeRect(0, 0, 1200, 650);
    g.font = 'bold 44px "Comic Sans MS","Segoe Print","Bradley Hand",cursive'; g.fillStyle = '#1f4fa8'; g.fillText('SHIFT TURNOVER – UNIT 1', 40, 72); g.font = '31px "Comic Sans MS","Segoe Print","Bradley Hand",cursive';
    ['• Hot standby (Mode 3). Tavg 291.7 °C, RCS 155 bar', '• All rods in. Boron 1200 ppm (sampled 06:00)', '• ECP: control bank D at 120 steps', '• SR N31 about 90 cps, N32 about 85 cps', '• Steam dumps: STEAM PRESS mode, 76.3 bar', '• Plan: reactor startup to POAH (GOP-301)'].forEach(function (t, i) { g.fillStyle = '#222'; g.fillText(t, 40, 140 + i * 56); });
    g.fillStyle = '#c0392b'; g.font = 'bold 34px "Comic Sans MS","Segoe Print","Bradley Hand",cursive'; g.fillText('→ KEEP SUR UNDER 1 DPM!   BLOCK SR AT P-6!', 40, 600); }) }));
  wb.position.set(-RX + 0.03, 1.65, 9.9); wb.rotation.y = Math.PI / 2; scene.add(wb); hit(wb, { tip: 'Shift turnover whiteboard: what the last shift handed over to you', view: 'board' });
  /* bookshelf of procedures */
  var sh = new THREE.Group(); sh.position.set(-8.2, 0, ZF - 0.25); sh.rotation.y = Math.PI; scene.add(sh); box(2.0, 2.0, 0.4, MAT.cab2, 0, 1.0, 0, sh);
  var cols = [0xc0392b, 0x2471a3, 0xd4ac0d, 0x1e8449, 0x7d3c98, 0xca6f1e, 0x566573];
  for (var r = 0; r < 4; r++) for (var i = 0; i < 18; i++) box(0.085, 0.36, 0.3, new THREE.MeshStandardMaterial({ color: cols[(r * 5 + i * 3) % cols.length], roughness: 0.7 }), -0.92 + i * 0.106, 0.3 + r * 0.46, 0.06, sh);
  var shh = invis(2, 2, 0.5); shh.position.y = 1; sh.add(shh); hit(shh, { tip: 'Procedures: general operating (GOP), alarm response (ARP), abnormal (AOP) and emergency (EOP) procedures' });
  /* double doors */
  var dr = new THREE.Group(); dr.position.set(RX - 0.04, 0, 9.9); dr.rotation.y = -Math.PI / 2; scene.add(dr); box(2.0, 2.3, 0.08, MAT.trim, 0, 1.15, 0, dr);
  [-0.49, 0.49].forEach(function (k) { box(0.94, 2.2, 0.05, MAT.cab, k, 1.1, 0.03, dr); box(0.3, 0.5, 0.01, MAT.glass, k, 1.55, 0.06, dr); box(0.03, 0.25, 0.04, MAT.chrome, k * 0.15, 1.05, 0.08, dr); });
  var ex = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), new THREE.MeshBasicMaterial({ map: signTex(256, 92, function (g) { g.fillStyle = '#0a8a3a'; g.fillRect(0, 0, 256, 92); ctext(g, '🏃 EXIT →', 128, 48, 46, '#fff', 'center', 240); }) })); ex.position.set(RX - 0.05, 2.5, 9.9); ex.rotation.y = -Math.PI / 2; scene.add(ex);
  var dh = invis(2, 2.3, 0.3); dh.position.set(RX - 0.1, 1.15, 9.9); scene.add(dh); hit(dh, { tip: 'Door to the rest of the station: walking the reactor building, turbine hall and switchyard comes later', act: function () { S.toast('🔒 Walking the rest of the station comes later.', 'lock'); S.sfx('deny'); } });
  /* printer, plant, cooler */
  box(0.6, 0.9, 0.5, MAT.wall, 9.0, 0.45, ZF - 0.4, scene); box(0.5, 0.25, 0.42, MAT.desk, 9.0, 1.02, ZF - 0.4, scene);
  var pot = cyl(0.2, 0.15, 0.4, MAT.dark, 16); pot.position.set(-RX + 0.6, 0.2, ZF - 0.6); scene.add(pot);
  for (var k2 = 0; k2 < 9; k2++) { var lf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 })); lf.position.set(-RX + 0.6 + Math.cos(k2) * 0.15, 0.6 + (k2 % 3) * 0.22, ZF - 0.6 + Math.sin(k2) * 0.15); lf.scale.set(1, 1.4, 1); scene.add(lf); }
  var cooler = cyl(0.14, 0.14, 0.4, MAT.glass, 16); cooler.position.set(10.2, 1.25, ZF - 0.45); scene.add(cooler); box(0.34, 1.05, 0.34, MAT.wall, 10.2, 0.525, ZF - 0.45, scene);
  /* cabinets behind the boards */
  for (var c2 = -9.6; c2 <= 9.6; c2 += 1.2) box(1.1, 2.1, 0.6, MAT.cab2, c2, 1.05, ZB + 0.35, scene);
  var fe = cyl(0.08, 0.08, 0.5, new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.3 }), 14); fe.position.set(RX - 0.25, 0.55, 8.2); scene.add(fe); hit(fe, { tip: 'Fire extinguisher (CO₂, safe on electrical equipment)' });
}

/* ================================================================ realism pass (high graphics) ================================================================
   Surface detail (normal and roughness maps made on the fly), real reflections of the room itself, glass over the meters,
   louvred light fittings, acoustic wall panels and cable trays, then a post-processing chain: HDR, bloom on everything
   that glows, filmic tone mapping, a little vignette and film grain. */
function heightTex(w, h, fn) { var c = CV(w, h), g = c.getContext('2d'); fn(g, w, h); return c; }
function normalFrom(src, strength) {
  var w = src.width, h = src.height, sd = src.getContext('2d').getImageData(0, 0, w, h).data, c = CV(w, h), g = c.getContext('2d'), out = g.createImageData(w, h), o = out.data;
  var H = function (x, y) { x = (x + w) % w; y = (y + h) % h; return sd[(y * w + x) * 4] / 255; };
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength, l = Math.sqrt(dx * dx + dy * dy + 1), i = (y * w + x) * 4;
    o[i] = (-dx / l * 0.5 + 0.5) * 255; o[i + 1] = (dy / l * 0.5 + 0.5) * 255; o[i + 2] = (1 / l * 0.5 + 0.5) * 255; o[i + 3] = 255; }
  g.putImageData(out, 0, 0); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
}
function dataTex(c, srgb) { var t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t; }
function blurNoise(g, w, h, n, r, a) { for (var i = 0; i < n; i++) { var x = Math.random() * w, y = Math.random() * h, rr = r * (0.4 + Math.random()), gr = g.createRadialGradient(x, y, 0, x, y, rr), v = Math.random() < 0.5 ? 0 : 255; gr.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
function realism(scene) {
  var ren = R3.ren;
  /* --- painted steel: fine orange-peel texture and the odd fingerprint --- */
  var peel = normalFrom(heightTex(256, 256, function (g, w, h) { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); blurNoise(g, w, h, 2600, 3, 0.18); }), 2.2);
  var smudge = dataTex(heightTex(512, 512, function (g, w, h) { g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h); blurNoise(g, w, h, 90, 40, 0.12); for (var i = 0; i < 40; i++) { g.strokeStyle = 'rgba(70,70,70,.08)'; g.lineWidth = 6 + Math.random() * 10; g.beginPath(); var x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 30, y + 10, x + 60 * Math.random(), y + 40); g.stroke(); } }));
  /* --- floor: bevelled tile edges, scuffs, a polished but used finish --- */
  var tileH = heightTex(256, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, 6); g.fillStyle = '#c0c0c0'; g.fillRect(0, 0, w, h); g.fillStyle = '#202020'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillStyle = '#707070'; g.fillRect(3, 3, w - 3, 3); g.fillRect(3, 3, 3, h - 3); blurNoise(g, w, h, 900, 4, 0.08); });
  var floorN = normalFrom(tileH, 3), floorR = dataTex(heightTex(512, 512, function (g, w, h) { g.fillStyle = '#4a4a4a'; g.fillRect(0, 0, w, h); blurNoise(g, w, h, 160, 60, 0.18); for (var i = 0; i < 70; i++) { g.strokeStyle = 'rgba(200,200,200,' + (0.05 + Math.random() * 0.1) + ')'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); var x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 20); g.stroke(); } }));
  floorN.repeat.set(2 * RX / 0.6, RDP / 0.6); floorR.repeat.set(2 * RX / 2.4, RDP / 2.4);
  scene.traverse(function (o) {
    if (!o.isMesh || !o.material || o.material.isMeshBasicMaterial || !o.material.isMeshStandardMaterial) return; var m = o.material;
    if (o.userData.floor) { m.normalMap = floorN; m.normalScale.set(0.6, 0.6); m.roughnessMap = floorR; m.roughness = 0.55; m.metalness = 0.05; m.envMapIntensity = 1.4; m.needsUpdate = true; return; }
    if (m.map && m.map.image && m.map.image.width >= 1500) { m.normalMap = peel; m.normalScale.set(0.12, 0.12); m.roughnessMap = smudge; m.roughness = 0.75; m.envMapIntensity = 0.6; m.needsUpdate = true; return; }
  });
  [MAT.cab, MAT.cab2, MAT.trim].forEach(function (m) { m.normalMap = peel; m.normalScale.set(0.25, 0.25); m.roughnessMap = smudge; m.roughness = 0.7; m.metalness = 0.25; m.envMapIntensity = 0.9; m.needsUpdate = true; });
  [MAT.metal, MAT.chrome].forEach(function (m) { m.envMapIntensity = 1.6; });
  MAT.desk.roughnessMap = smudge; MAT.desk.roughness = 0.6; MAT.desk.needsUpdate = true; MAT.wood.normalMap = peel; MAT.wood.normalScale.set(0.1, 0.1); MAT.wood.needsUpdate = true;
  MAT.fabric.normalMap = normalFrom(heightTex(128, 128, function (g, w, h) { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 2) { g.fillStyle = y % 4 ? '#909090' : '#707070'; g.fillRect(0, y, w, 1); } for (var x = 0; x < w; x += 2) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, 0, 1, h); } }), 1.5); MAT.fabric.normalMap.repeat.set(6, 6); MAT.fabric.needsUpdate = true;
  /* --- louvred light fittings instead of flat white rectangles --- */
  var louv = new THREE.MeshBasicMaterial({ map: dataTex(heightTex(256, 128, function (g, w, h) { g.fillStyle = '#c9c9c4'; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, 0, h); g.fillStyle = '#ffffff'; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = 'rgba(150,150,145,.9)'; g.lineWidth = 3; for (var x = 8; x < w - 8; x += 16) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, h - 8); g.stroke(); } for (var y = 8; y < h - 8; y += 30) { g.beginPath(); g.moveTo(8, y); g.lineTo(w - 8, y); g.stroke(); } }), true) });
  louv.color.setScalar(4.2); scene.traverse(function (o) { if (o.isMesh && o.material === MAT.lightP && o.position.y > CH - 0.2) o.material = louv; });
  /* --- acoustic fabric panels on the side walls, and cable trays along the back --- */
  var acM = new THREE.MeshStandardMaterial({ color: 0x46535f, roughness: 0.98, normalMap: MAT.fabric.normalMap });
  for (var z = -7; z <= 6; z += 2.7) { box(0.05, 1.5, 2.4, acM, -RX + 0.03, 3.0, z, scene); box(0.05, 1.5, 2.4, acM, RX - 0.03, 3.0, z, scene); }
  var tray = new THREE.Group(); scene.add(tray); tray.position.set(0, CH - 3.6 + 0.2, ZB + 0.6 + 7.6); for (var xx = -10; xx <= 10; xx += 2.5) box(2.5, 0.02, 0.4, MAT.metal, xx + 1.25, 3.3, -7.6, tray); box(20.5, 0.08, 0.02, MAT.metal, 0, 3.34, -7.4, tray); box(20.5, 0.08, 0.02, MAT.metal, 0, 3.34, -7.8, tray);
  for (var c = 0; c < 6; c++) { var cab = cyl(0.025, 0.025, 20.4, new THREE.MeshStandardMaterial({ color: [0x2b2b2b, 0x8a1c1c, 0x1c3f8a, 0x2b2b2b, 0xb38f00, 0x2b2b2b][c], roughness: 0.6 }), 8); cab.rotation.z = Math.PI / 2; cab.position.set(0, 3.335, -7.72 + c * 0.055); tray.add(cab); }
  /* --- ceiling vent grilles and sprinkler heads --- */
  var vent = new THREE.MeshStandardMaterial({ color: 0xdcdcd6, roughness: 0.5, metalness: 0.3, map: dataTex(heightTex(128, 128, function (g, w, h) { g.fillStyle = '#e6e6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3a38'; for (var i = 12; i < w - 12; i += 8) g.fillRect(12, i, w - 24, 4); }), true) });
  [[-4.5, -3.3], [4.5, -3.3], [-4.5, 3.3], [4.5, 3.3], [0, 6.2], [-7.5, 8.5], [7.5, 8.5], [0, -6.5]].forEach(function (q) { var v = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), vent); v.rotation.x = Math.PI / 2; v.position.set(q[0], CH - 0.008, q[1]); scene.add(v); });
  for (var sx = -9; sx <= 9; sx += 3) for (var sz = -7.5; sz <= 9.5; sz += 3.4) { var sp = cyl(0.012, 0.03, 0.04, MAT.chrome, 8); sp.position.set(sx, CH - 0.02, sz); scene.add(sp); }
  /* --- glass over every meter and digital display: catches the reflections of the room lights --- */
  var glass = new THREE.MeshStandardMaterial({ color: 0x0a0c0e, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 3, depthWrite: false });
  WG.forEach(function (w) { if (w.o.tiles || !w.o.lbl || !w.m.parent) return; var gm = new THREE.Mesh(w.m.geometry, glass); gm.position.z = 0.003; gm.raycast = function () {}; w.m.add(gm); });
  SCR.forEach(function (w) { var gm = new THREE.Mesh(w.m.geometry, glass); gm.position.z = 0.002; gm.raycast = function () {}; w.m.add(gm); });
  /* --- the room reflects itself: environment map rendered from the middle of the room --- */
  try { var pm = new THREE.PMREMGenerator(ren), keep = scene.background; scene.position.set(0, -1.6, -1); scene.updateMatrixWorld(true); var rt = pm.fromScene(scene, 0.035, 0.1, 40); scene.position.set(0, 0, 0); scene.updateMatrixWorld(true); scene.environment = rt.texture; scene.background = keep; pm.dispose(); } catch (e) { scene.position.set(0, 0, 0); }
  POST.init();
}

/* ---------------- post-processing: HDR → bloom → filmic tone map, vignette, grain ---------------- */
var POST = { on: false,
  init: function () {
    var ren = R3.ren, gl = ren.getContext(); if (!ren.capabilities.isWebGL2) return;
    var opt = { type: THREE.HalfFloatType, depthBuffer: true, samples: 4 }; POST.main = new THREE.WebGLRenderTarget(4, 4, opt);
    POST.lv = []; for (var i = 0; i < 5; i++) POST.lv.push(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false }));
    POST.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); POST.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); POST.sc = new THREE.Scene(); POST.sc.add(POST.quad);
    var vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    POST.bright = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, th: { value: 1.0 } }, vertexShader: vs, fragmentShader: 'uniform sampler2D t; uniform float th; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = clamp((l - th) / max(l, 1e-4), 0.0, 1.0); gl_FragColor = vec4(min(c * k, vec3(40.0)), 1.0); }', depthTest: false });
    POST.down = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, px: { value: new THREE.Vector2() } }, vertexShader: vs, fragmentShader: 'uniform sampler2D t; uniform vec2 px; varying vec2 vUv; void main(){ vec3 s = texture2D(t, vUv).rgb * 4.0; s += texture2D(t, vUv - px).rgb; s += texture2D(t, vUv + px).rgb; s += texture2D(t, vUv + vec2(px.x, -px.y)).rgb; s += texture2D(t, vUv - vec2(px.x, -px.y)).rgb; gl_FragColor = vec4(s / 8.0, 1.0); }', depthTest: false });
    POST.up = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, px: { value: new THREE.Vector2() } }, vertexShader: vs, fragmentShader: 'uniform sampler2D t; uniform vec2 px; varying vec2 vUv; void main(){ vec3 s = texture2D(t, vUv + vec2(-px.x * 2.0, 0.0)).rgb + texture2D(t, vUv + vec2(px.x * 2.0, 0.0)).rgb + texture2D(t, vUv + vec2(0.0, px.y * 2.0)).rgb + texture2D(t, vUv + vec2(0.0, -px.y * 2.0)).rgb; s += (texture2D(t, vUv + px).rgb + texture2D(t, vUv - px).rgb + texture2D(t, vUv + vec2(px.x, -px.y)).rgb + texture2D(t, vUv + vec2(-px.x, px.y)).rgb) * 2.0; gl_FragColor = vec4(s / 12.0, 1.0); }', depthTest: false, blending: THREE.AdditiveBlending, transparent: true });
    POST.comp = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, b: { value: null }, ex: { value: 0.82 }, bs: { value: 0.22 }, time: { value: 0 }, res: { value: new THREE.Vector2(1, 1) } }, vertexShader: vs,
      fragmentShader: 'uniform sampler2D t; uniform sampler2D b; uniform float ex; uniform float bs; uniform float time; uniform vec2 res; varying vec2 vUv;' +
        'vec3 aces(vec3 x){ x *= ex; const mat3 m1 = mat3(0.59719,0.07600,0.02840, 0.35458,0.90834,0.13383, 0.04823,0.01566,0.83777); const mat3 m2 = mat3(1.60475,-0.10208,-0.00327, -0.53108,1.10813,-0.07276, -0.07367,-0.00605,1.07602); vec3 v = m1 * x; vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 d = v * (0.983729 * v + 0.4329510) + 0.238081; return clamp(m2 * (a / d), 0.0, 1.0); }' +
        'vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }' +
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }' +
        'void main(){ vec2 d = (vUv - 0.5); vec3 c = texture2D(t, vUv).rgb; c += texture2D(b, vUv).rgb * bs; vec3 o = srgb(aces(c));' +
        ' float vig = smoothstep(0.95, 0.25, length(d * vec2(res.x / res.y, 1.0)) * 0.85); o *= mix(0.72, 1.0, vig); o += (hash(vUv * res) - 0.5) * 0.018; gl_FragColor = vec4(o, 1.0); }', depthTest: false });
    POST.on = true;
  },
  size: function (w, h) { if (!POST.on) return; var pr = R3.ren.getPixelRatio(), W = Math.max(4, Math.round(w * pr)), H = Math.max(4, Math.round(h * pr)); POST.main.setSize(W, H); var x = W >> 1, y = H >> 1; POST.lv.forEach(function (r) { r.setSize(Math.max(2, x), Math.max(2, y)); x >>= 1; y >>= 1; }); POST.comp.uniforms.res.value.set(W, H); },
  pass: function (mat, target) { POST.quad.material = mat; R3.ren.setRenderTarget(target); R3.ren.render(POST.sc, POST.cam); },
  render: function () {
    var ren = R3.ren, tm = ren.toneMapping; ren.toneMapping = THREE.NoToneMapping;
    ren.setRenderTarget(POST.main); ren.render(R3.scene, R3.cam);
    POST.bright.uniforms.t.value = POST.main.texture; POST.pass(POST.bright, POST.lv[0]);
    for (var i = 1; i < POST.lv.length; i++) { POST.down.uniforms.t.value = POST.lv[i - 1].texture; POST.down.uniforms.px.value.set(1 / POST.lv[i - 1].width, 1 / POST.lv[i - 1].height); POST.pass(POST.down, POST.lv[i]); }
    for (i = POST.lv.length - 1; i > 0; i--) { POST.up.uniforms.t.value = POST.lv[i].texture; POST.up.uniforms.px.value.set(1 / POST.lv[i].width, 1 / POST.lv[i].height); ren.autoClear = false; POST.pass(POST.up, POST.lv[i - 1]); ren.autoClear = true; }
    POST.comp.uniforms.t.value = POST.main.texture; POST.comp.uniforms.b.value = POST.lv[0].texture; POST.comp.uniforms.time.value = (performance.now() % 10000) / 1000; POST.pass(POST.comp, null);
    ren.toneMapping = tm;
  }
};

/* ================================================================ board engine ================================================================
   A real control room has well over a thousand controls, far too many to give each its own canvas and meshes.
   So on these boards the meter scales, labels and switch plates are painted into the board's own texture, and only the
   moving parts are 3D: one instanced mesh each for meter pointers, lamps, switch handles, buttons and knobs per board,
   plus one small texture atlas per board for the digital displays and M/A controller stations. */
var BE = [], BPCW = 2560;
var X = function () { return S.p.x; }, P = function () { return S.p; };
function be(s) { if (s.be) return s.be; var b = s.be = { s: s, met: [], plamp: [], dlamp: [], sw: [], pb: [], rot: [], cells: [], hitsP: [], shelfY: 0, shelfX: 0, shelfH: 0, t: 0, at: 0 }; s.pcw = BPCW; s.artP = []; s.artD = []; BE.push(b); return b; }
function grp(s, x0, x1, y0, y1, lbl, col) { s.grp.push([x0, x1, y0, y1, lbl, col]); }
function dgrp(s, u0, u1, d0, d1, lbl, col) { s.dgrp.push([u0, u1, d0, d1, lbl, col]); }
function pHit(s, x, y, w, h, o) { var m = invis(w, h, 0.02); m.position.set(x, y, PZ + 0.012); s.g.add(m); hit(m, o); return m; }
function dHit(s, u, d, w, dd, hgt, o) { var m = invis(w, hgt, dd); m.position.set(u, hgt / 2, -d * SL); s.desk.add(m); hit(m, o); return m; }
function fmtV(v) { return Math.abs(v) >= 100 ? String(Math.round(v)) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2); }
/* ---------- edgewise meter: face painted on the board, pointer is an instance ---------- */
function MT(s, x, y, lbl, unit, min, max, v, o) {
  o = o || {}; var b = be(s), w = o.w || 0.09, hgt = o.h || 0.32, m = { x: x, y: y, w: w, h: hgt, min: min, max: max, v: v, log: o.log, last: -1 };
  s.artP.push(function (g) { var X0 = px(x - w / 2), Y0 = py(y + hgt / 2), W = px(x + w / 2) - X0, H = py(y - hgt / 2) - Y0, top = Y0 + H * 0.15, bot = Y0 + H * 0.88;
    g.fillStyle = '#17191b'; g.fillRect(X0, Y0, W, H); g.fillStyle = '#f2f0e7'; g.fillRect(X0 + W * 0.1, top - H * 0.04, W * 0.8, bot - top + H * 0.08);
    ctext(g, lbl, X0 + W / 2, Y0 + H * 0.065, Math.round(W * 0.2), '#fff', 'center', W * 0.95); ctext(g, unit, X0 + W / 2, Y0 + H * 0.95, Math.round(W * 0.15), '#cfd3d6', 'center', W * 0.95, '600');
    if (o.bands) o.bands.forEach(function (bd) { var a = bot - (bot - top) * bd[0], c = bot - (bot - top) * bd[1]; g.fillStyle = bd[2]; g.fillRect(X0 + W * 0.13, c, W * 0.08, a - c); });
    g.strokeStyle = '#111'; g.fillStyle = '#111'; var mj = o.major || 5, mn = o.minor || 2;
    if (o.log) { var la = Math.log10(min), lb = Math.log10(max), nd = lb - la; for (var d = 0; d <= nd; d++) { var yy = bot - (bot - top) * d / nd; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X0 + W * 0.13, yy); g.lineTo(X0 + W * 0.36, yy); g.stroke(); superExp(g, '10', String(la + d), X0 + W * 0.4, yy, Math.round(W * 0.16), '#111', 'left'); } }
    else for (var i = 0; i <= mj * mn; i++) { var y2 = bot - (bot - top) * i / (mj * mn), M = i % mn === 0; g.lineWidth = M ? 1.6 : 1; g.beginPath(); g.moveTo(X0 + W * 0.13, y2); g.lineTo(X0 + W * (M ? 0.36 : 0.26), y2); g.stroke();
      if (M) ctext(g, o.fmt ? o.fmt(min + (max - min) * i / (mj * mn)) : fmtTick(min + (max - min) * i / (mj * mn)), X0 + W * 0.62, y2, Math.round(W * 0.17), '#111', 'center', W * 0.42); }
    m.top = top; m.bot = bot; });
  b.met.push(m); pHit(s, x, y, w, hgt, { tip: o.tip || function () { var z = v(); return (o.name || lbl) + ': ' + (o.log ? fmtSci(z, 1) : fmtV(z)) + ' ' + unit; }, info: o.info || [/x/, o.name || lbl, 'An edgewise meter: the red pointer moves up the scale. Coloured bands mark where an alarm or trip setpoint is. This one reads ' + unit + '.', 'Real boards still use rows of edgewise meters because an operator can spot one pointer out of line with its neighbours at a glance.'] });
  return m;
}
function fmtTick(v) { var a = Math.abs(v); return a >= 1000 ? (v / 1000) + 'k' : a >= 10 || v === 0 ? String(Math.round(v)) : v.toFixed(1); }
function meterRow(s, x0, y, list, dx, o) { list.forEach(function (it, i) { MT(s, x0 + i * (dx || 0.098), y, it[0], it[1], it[2], it[3], it[4], Object.assign({ name: it[5], info: it[6] }, o || {}, it[7] || {})); }); }
/* ---------- indicating lamps (panel or desk) with an engraved label ---------- */
function LP(s, x, y, lbl, on, col, tip) { var b = be(s); b.plamp.push({ x: x, y: y, on: on, c: new THREE.Color(col || 0xffffff), st: null });
  if (lbl) s.artP.push(function (g) { var ls = lbl.split('\n'); ls.forEach(function (ln, k) { ctext(g, ln, px(x), py(y - 0.032 - k * 0.017), 13, '#1a1f24', 'center', px(0.115) - px(0), '600'); }); g.fillStyle = '#9aa0a5'; g.beginPath(); g.arc(px(x), py(y), (px(0.023) - px(0)), 0, 6.3); g.fill(); g.fillStyle = '#26292c'; g.beginPath(); g.arc(px(x), py(y), (px(0.019) - px(0)), 0, 6.3); g.fill(); });
  pHit(s, x, y - 0.01, 0.07, 0.06, { tip: tip || function () { return (lbl || 'Lamp').replace(/\n/g, ' ') + ': ' + (on() ? 'LIT' : 'off'); }, info: [/x/, (lbl || 'Status lamp').replace(/\n/g, ' '), 'A status lamp: lit means the condition on its label is true right now. Red usually means running or open, green stopped or closed, amber a warning, white a permissive or status.'] }); }
function lampRow(s, x0, y, list, dx) { list.forEach(function (it, i) { LP(s, x0 + i * (dx || 0.085), y, it[0], it[1], it[2], it[3]); }); }
function DLP(s, u, d, on, col) { be(s).dlamp.push({ u: u, d: d, on: on, c: new THREE.Color(col), st: null }); }
/* ---------- digital readouts and M/A controller stations share one atlas per board ---------- */
function cell(s, w, h) { var b = be(s); if (b.shelfX + w > 1024) { b.shelfX = 0; b.shelfY += b.shelfH; b.shelfH = 0; } var c = { x: b.shelfX, y: b.shelfY, w: w, h: h }; b.shelfX += w; b.shelfH = Math.max(b.shelfH, h); return c; }
function DG(s, x, y, lbl, txt, o) { o = o || {}; var b = be(s), w = o.w || 0.16, hgt = w * 0.4, c = cell(s, 160, 64); c.kind = 'dg'; c.lbl = lbl; c.txt = txt; c.col = o.col || '#ff4a3a'; c.x3 = x; c.y3 = y; c.w3 = w; c.h3 = hgt; b.cells.push(c);
  pHit(s, x, y, w, hgt, { tip: o.tip || function () { return (o.name || lbl) + ': ' + txt(); }, info: o.info }); return c; }
function dgRow(s, x0, y, list, dx, o) { list.forEach(function (it, i) { DG(s, x0 + i * (dx || 0.175), y, it[0], it[1], Object.assign({ name: it[2], col: it[3], info: it[4] }, o || {})); }); }
/* strip-chart recorder: a pen trace of one or two values over the last ten minutes, sampled every 5 s of plant time */
function REC(s, x, y, lbl, pens, min, max, unit) { var b = be(s), w = 0.36, hgt = 0.2, c = cell(s, 256, 144); c.kind = 'rec'; c.lbl = lbl; c.pens = pens; c.min = min; c.max = max; c.unit = unit || ''; c.hist = pens.map(function () { return []; }); c.lt = -99; c.x3 = x; c.y3 = y; c.w3 = w; c.h3 = hgt; b.cells.push(c);
  box(w + 0.02, hgt + 0.02, 0.03, MAT.black, x, y, PZ - 0.013, s.g);
  pHit(s, x, y, w, hgt, { tip: function () { return lbl + ' recorder: ' + pens.map(function (q) { return q[0] + ' ' + fmtV(q[1]()) + ' ' + c.unit; }).join(', '); }, info: [/x/, 'Strip-chart recorder', 'A pen draws the value on a moving paper chart, so you can see the trend over the last few minutes, not just the number now. This one shows ' + lbl.toLowerCase() + '.', 'Plants kept paper recorders long after computers arrived: the trace is still there if the computer fails.'] }); return c; }
/* M/A station: output bar, process/setpoint digits, MAN and AUTO pushbuttons, lower/raise buttons. Hold raise/lower to ramp. */
function MA(s, x, y, o) {
  var b = be(s), w = 0.1, hgt = 0.2, c = cell(s, 128, 256); c.kind = 'ma'; c.o = o; c.x3 = x; c.y3 = y; c.w3 = w; c.h3 = hgt; b.cells.push(c);
  var hz = function (dx, dy, ww, hh, oo) { pHit(s, x + dx * w, y + dy * hgt, ww * w, hh * hgt, oo); };
  hz(-0.25, -0.27, 0.48, 0.14, { tip: function () { return o.t + ': MANUAL (you set the output with the arrows)'; }, act: function () { if (o.mode() !== 'MAN') { o.setMode('MAN'); S.sfx('btn'); } }, info: MAINFO });
  hz(0.25, -0.27, 0.48, 0.14, { tip: function () { return o.t + ': AUTOMATIC (the controller adjusts the output itself)'; }, act: function () { if (o.mode() !== 'AUTO') { o.setMode('AUTO'); S.sfx('btn'); } }, info: MAINFO });
  var ramp = function (dir) { return function (on) { b.ramp = on ? { o: o, dir: dir } : null; if (on) S.sfx('btn'); }; };
  hz(-0.25, -0.42, 0.48, 0.14, { tip: function () { return o.t + ': hold to LOWER ' + (o.mode() === 'AUTO' && o.sp ? 'the setpoint' : 'the output'); }, hold: ramp(-1), info: MAINFO });
  hz(0.25, -0.42, 0.48, 0.14, { tip: function () { return o.t + ': hold to RAISE ' + (o.mode() === 'AUTO' && o.sp ? 'the setpoint' : 'the output'); }, hold: ramp(1), info: MAINFO });
  hz(0, 0.18, 1, 0.6, { tip: function () { return o.t + ': ' + o.mode() + ', output ' + Math.round(o.out() * 100) + '%' + (o.pv ? ', ' + o.pv() : '') + (o.sp ? ', setpoint ' + o.sp() : ''); }, info: MAINFO });
  var bx = box(w + 0.012, hgt + 0.012, 0.03, MAT.black, x, y, PZ - 0.013, s.g); return c;
}
var MAINFO = [/x/, 'M/A controller station', 'Every automatic control loop has one. In AUTO the controller moves its valve or heater by itself to hold the setpoint; in MANUAL the operator drives the output directly with the raise and lower buttons. The bar shows the output (how open the valve is).', 'Operators take a controller to manual when it misbehaves, and back to auto once things are steady.'];
/* ---------- desk controls ---------- */
/* control switch (pistol grip): turn right = START / CLOSE / OPEN (red lamp), left = STOP / TRIP / CLOSE (green lamp) */
function SWC(s, u, d, o) {
  var b = be(s), r = { u: u, d: d, o: o, turn: 0, spring: 0 }; b.sw.push(r);
  s.artD.push(function (g) { var X0 = dx(u - 0.055), Y0 = dy(d + 0.06), W = dx(u + 0.055) - X0, H = dy(d - 0.065) - Y0; g.fillStyle = '#16191c'; rr(g, X0, Y0, W, H, 8); g.fill();
    ctext(g, o.l || 'STOP', X0 + W * 0.22, Y0 + H * 0.18, 13, '#e8e8e2', 'center', W * 0.42); ctext(g, o.r || 'START', X0 + W * 0.78, Y0 + H * 0.18, 13, '#e8e8e2', 'center', W * 0.42);
    var ls = o.t.split('\n'); ls.forEach(function (ln, k) { ctext(g, ln, X0 + W / 2, Y0 + H * (ls.length > 1 ? 0.8 : 0.88) + k * 14, 13, '#fff', 'center', W * 0.95); }); });
  DLP(s, u - 0.026, d + 0.115, function () { return !o.on(); }, 0x2bd14a); DLP(s, u + 0.026, d + 0.115, o.on, 0xff3324);
  dHit(s, u, d + 0.02, 0.11, 0.13, 0.06, { tip: function () { return o.t.replace(/\n/g, ' ') + ': ' + (o.on() ? (o.onTxt || 'ON') + ' (red)' : (o.offTxt || 'OFF') + ' (green)') + (o.why ? '. ' + o.why() : ''); }, info: o.info,
    act: function (h) { var right = !o.on(); if (h && h.uv && false) right = true; r.spring = right ? 1 : -1; S.sfx('switch'); o.act(right); HUD.dirty = true; } });
}
function swRow(s, u0, d, list, du) { list.forEach(function (o, i) { if (o) SWC(s, u0 + i * (du || 0.14), d, o); }); }
function PBN(s, u, d, o) { var b = be(s), r = { u: u, d: d, o: o, c: new THREE.Color(o.col || 0xdddddd), st: null, push: 0 }; b.pb.push(r);
  if (o.lbl) s.artD.push(function (g) { var ls = o.lbl.split('\n'); ls.forEach(function (ln, k) { tag(g, ln, dx(u), dy(d - 0.09 - k * 0.055), Math.max(70, ln.length * 11), 24, 12, o.tagBg, o.tagFg); }); });
  dHit(s, u, d, 0.06, 0.06, 0.05, { tip: o.tip || o.lbl.replace(/\n/g, ' '), info: o.info || [/x/, (o.lbl || 'Pushbutton').replace(/\n/g, ' '), o.tip || 'A pushbutton.'], act: function () { r.push = 0.15; S.sfx('btn'); o.act && o.act(); HUD.dirty = true; }, hold: o.hold }); }
/* rotary selector: click a position label (or the knob to step round) */
function ROT(s, u, d, o) { var b = be(s), n = o.pos.length, span = o.span || (n > 2 ? 200 : 90), ang = function (i) { return (-span / 2 + span * i / (n - 1)) * Math.PI / 180; }, r = { u: u, d: d, o: o, ang: ang, cur: ang(o.get()) }; b.rot.push(r);
  s.artD.push(function (g) { var cx = dx(u), cy = dy(d), R0 = dx(0.06) - dx(0); g.fillStyle = '#16191c'; g.beginPath(); g.arc(cx, cy, R0 * 1.25, 0, 6.3); g.fill(); ctext(g, o.t, cx, cy + R0 * 1.55, 13, '#1a1f24', 'center', R0 * 3.2);
    for (var i = 0; i < n; i++) { var a = ang(i); ctext(g, o.pos[i], cx + Math.sin(a) * R0 * 0.95, cy - Math.cos(a) * R0 * 0.95, 11, '#f2f2ee', 'center', R0 * 0.9); } });
  var hb = dHit(s, u, d, 0.16, 0.16, 0.04, { tip: function () { return o.t.replace(/\n/g, ' ') + ': ' + o.pos[o.get()] + (o.tip ? '. ' + o.tip : ''); }, info: o.info,
    act: function (h) { var i = (o.get() + 1) % n; if (h && h.point) { var lp = s.desk.worldToLocal(h.point.clone()), a = Math.atan2(lp.x - u, -(lp.z + d * SL)), best = -1, bd = 0.5; if (Math.hypot(lp.x - u, lp.z + d * SL) > 0.02) for (var k = 0; k < n; k++) { var dd = Math.abs(a - ang(k)); if (dd < bd) { bd = dd; best = k; } } if (best >= 0) i = best; }
      if (i !== o.get()) { o.set(i); S.sfx('detent'); HUD.dirty = true; } } }); }
/* ---------- build the instanced meshes once all items are declared ---------- */
var LENSG = null, BASEG = null, GRIPG = null, CAPG = null, KNOBG = null, PTRG = null;
function beFinish(s) {
  var b = s.be; if (!b) return; if (!LENSG) { LENSG = new THREE.CylinderGeometry(0.015, 0.015, 0.012, 16); BASEG = new THREE.CylinderGeometry(0.026, 0.03, 0.014, 18); GRIPG = new THREE.BoxGeometry(0.022, 0.024, 0.07); GRIPG.translate(0, 0.024, -0.01); CAPG = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 18); KNOBG = new THREE.BoxGeometry(0.02, 0.022, 0.075); KNOBG.translate(0, 0.018, 0); PTRG = new THREE.PlaneGeometry(1, 1); }
  var M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3(1, 1, 1), E = new THREE.Euler();
  var inst = function (geo, mat, n, parent) { var im = new THREE.InstancedMesh(geo, mat, Math.max(1, n)); im.count = n; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); parent.add(im); return im; };
  if (b.met.length) { b.ptr = inst(PTRG, new THREE.MeshBasicMaterial({ color: 0xd0201a }), b.met.length, s.g); b.ptr.position.z = PZ + 0.004; }
  var lensM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.25 });
  lensM.onBeforeCompile = function (sh) { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_INSTANCING_COLOR\n totalEmissiveRadiance = vColor * step(0.5, max(vColor.r, max(vColor.g, vColor.b))) * 2.2;\n#endif'); };
  if (b.plamp.length) { b.pl = inst(LENSG, lensM, b.plamp.length, s.g); b.plamp.forEach(function (l, i) { E.set(Math.PI / 2, 0, 0); Q.setFromEuler(E); V.set(l.x, l.y, PZ + 0.007); M4.compose(V, Q, SC); b.pl.setMatrixAt(i, M4); b.pl.setColorAt(i, l.c.clone().multiplyScalar(0.15)); }); }
  var dl = b.dlamp.length; if (dl) { b.dlm = inst(LENSG, lensM, dl, s.desk); b.dlamp.forEach(function (l, i) { V.set(l.u, 0.006, -l.d * SL); M4.compose(V, Q.identity(), SC); b.dlm.setMatrixAt(i, M4); b.dlm.setColorAt(i, l.c.clone().multiplyScalar(0.15)); }); }
  if (b.sw.length) { b.swb = inst(BASEG, MAT.black, b.sw.length, s.desk); b.swg = inst(GRIPG, MAT.black, b.sw.length, s.desk); b.sw.forEach(function (r, i) { V.set(r.u, 0.007, -r.d * SL); M4.compose(V, Q.identity(), SC); b.swb.setMatrixAt(i, M4); V.y = 0.012; b.swg.setMatrixAt(i, M4); }); }
  if (b.pb.length) { b.pbb = inst(BASEG, MAT.metal, b.pb.length, s.desk); b.pbc = inst(CAPG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }), b.pb.length, s.desk); b.pb.forEach(function (r, i) { V.set(r.u, 0.007, -r.d * SL); M4.compose(V, Q.identity(), SC); b.pbb.setMatrixAt(i, M4); V.y = 0.022; b.pbc.setMatrixAt(i, M4); b.pbc.setColorAt(i, r.c); }); }
  if (b.rot.length) { b.rk = inst(KNOBG, MAT.black, b.rot.length, s.desk); }
  b.M4 = M4; b.Q = Q; b.V = V; b.SC = SC; b.E = E;
  if (b.cells.length) { var cv = CV(1024, Math.max(64, b.shelfY + b.shelfH)), tx = texOf(cv); tx.generateMipmaps = false; tx.minFilter = THREE.LinearFilter; b.atlas = cv; b.atlasG = cv.getContext('2d'); b.atex = tx;
    var am = new THREE.MeshBasicMaterial({ map: tx, toneMapped: false });
    b.cells.forEach(function (c) { var geo = new THREE.PlaneGeometry(c.w3, c.h3), uv = geo.attributes.uv, u0 = c.x / 1024, u1 = (c.x + c.w) / 1024, v1 = 1 - c.y / cv.height, v0 = 1 - (c.y + c.h) / cv.height;
      for (var k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) ? u1 : u0, uv.getY(k) ? v1 : v0); var mm = new THREE.Mesh(geo, am); mm.position.set(c.x3, c.y3, PZ + 0.006); s.g.add(mm); }); beAtlas(b, true); }
  beTick(b, 0.016, true);
}
function drawCell(g, c) {
  var x = c.x, y = c.y, w = c.w, h = c.h;
  if (c.kind === 'rec') { g.fillStyle = '#2b2f33'; g.fillRect(x, y, w, h); g.fillStyle = '#f4f1e4'; g.fillRect(x + 4, y + 20, w - 8, h - 24); ctext(g, c.lbl, x + w / 2, y + 10, 12, '#e8e8e2', 'center', w - 8, 'bold');
    g.strokeStyle = 'rgba(60,120,90,.35)'; g.lineWidth = 1; for (var gx = 0; gx <= 10; gx++) { var X1 = x + 4 + (w - 8) * gx / 10; g.beginPath(); g.moveTo(X1, y + 20); g.lineTo(X1, y + h - 4); g.stroke(); } for (var gy = 0; gy <= 5; gy++) { var Y1 = y + 20 + (h - 24) * gy / 5; g.beginPath(); g.moveTo(x + 4, Y1); g.lineTo(x + w - 4, Y1); g.stroke(); }
    ctext(g, fmtTick(c.max), x + 8, y + 27, 10, '#555', 'left', 40); ctext(g, fmtTick(c.min), x + 8, y + h - 10, 10, '#555', 'left', 40);
    c.pens.forEach(function (q, k) { var hs = c.hist[k]; if (!hs.length) return; g.strokeStyle = q[2] || '#c0281e'; g.lineWidth = 2; g.beginPath(); hs.forEach(function (v, i) { var X2 = x + w - 4 - (hs.length - 1 - i) * (w - 8) / 119, Y2 = y + h - 4 - (h - 24) * clamp((v - c.min) / (c.max - c.min), 0, 1); if (i) g.lineTo(X2, Y2); else g.moveTo(X2, Y2); }); g.stroke(); ctext(g, q[0], x + w - 8, y + 30 + k * 12, 10, q[2] || '#c0281e', 'right', 120, 'bold'); });
    return; }
  if (c.kind === 'dg') { g.fillStyle = '#0d0f10'; g.fillRect(x, y, w, h); g.fillStyle = '#26292c'; g.fillRect(x, y, w, 18); ctext(g, c.lbl, x + w / 2, y + 9, 12, '#e8e8e2', 'center', w - 6); g.fillStyle = '#050505'; g.fillRect(x + 5, y + 21, w - 10, h - 25); ctext(g, String(c.txt()), x + w - 10, y + 42, 30, c.col, 'right', w - 16, 'bold'); return; }
  var o = c.o, out = clamp(o.out(), 0, 1), auto = o.mode() === 'AUTO';
  g.fillStyle = '#2b2f33'; g.fillRect(x, y, w, h); g.fillStyle = '#e9e7de'; g.fillRect(x + 4, y + 4, w - 8, 30); var ls = o.t.split('\n'); ls.forEach(function (ln, k) { ctext(g, ln, x + w / 2, y + 13 + k * 13 - (ls.length - 1) * 4, 11, '#111', 'center', w - 12); });
  g.fillStyle = '#050505'; g.fillRect(x + 8, y + 40, w - 16, 34); ctext(g, o.pv ? o.pv() : '', x + w - 14, y + 51, 15, '#59e07a', 'right', w - 24, 'bold'); ctext(g, o.sp ? 'SP ' + o.sp() : '', x + w - 14, y + 67, 12, '#ffd34a', 'right', w - 24, 'bold');
  g.fillStyle = '#111'; g.fillRect(x + 20, y + 80, w - 40, 80); g.fillStyle = '#ff8a2a'; g.fillRect(x + 22, y + 158 - 76 * out, w - 44, 76 * out); ctext(g, 'OUT ' + Math.round(out * 100) + '%', x + w / 2, y + 170, 12, '#e8e8e2', 'center', w - 10, 'bold');
  var btn = function (bx, by, t, lit, col) { g.fillStyle = lit ? col : '#3d4246'; g.fillRect(bx, by, 56, 32); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(bx, by, 56, 32); ctext(g, t, bx + 28, by + 16, 13, lit ? '#111' : '#d7dbe0', 'center', 52, 'bold'); };
  btn(x + 6, y + 182, 'MAN', !auto, '#ffd34a'); btn(x + 66, y + 182, 'AUTO', auto, '#7dffa0'); btn(x + 6, y + 218, '▼', false); btn(x + 66, y + 218, '▲', false);
}
function beAtlas(b, all) { if (!b.atlas) return; var g = b.atlasG; b.cells.forEach(function (c) { if (c.kind === 'rec') { var t = S.p.t; if (t < c.lt) { c.hist = c.pens.map(function () { return []; }); c.lt = -99; } if (t - c.lt >= 5 || c.lt < 0) { c.lt = t; c.pens.forEach(function (q, k) { c.hist[k].push(q[1]()); if (c.hist[k].length > 120) c.hist[k].shift(); }); } } var k = c.kind === 'rec' ? c.lt + '|' + c.hist[0].length : c.kind === 'dg' ? c.txt() : [c.o.mode(), Math.round(c.o.out() * 200), c.o.pv && c.o.pv(), c.o.sp && c.o.sp()].join('|'); if (!all && k === c.last) return; c.last = k; drawCell(g, c); b.dirty = true; }); if (b.dirty) { b.atex.needsUpdate = true; b.dirty = false; } }
function beTick(b, dt, force) {
  var s = b.s, M4 = b.M4, Q = b.Q, V = b.V, SC = b.SC, E = b.E, ch;
  if (b.ptr) { ch = false; b.met.forEach(function (m, i) { var v = m.v(), f = m.log ? (Math.log10(Math.max(v, m.min * 0.5)) - Math.log10(m.min)) / (Math.log10(m.max) - Math.log10(m.min)) : (v - m.min) / (m.max - m.min); f = clamp(f, -0.02, 1.02); var q = Math.round(f * 600); if (q === m.last && !force) return; m.last = q; ch = true;
    var yy = (m.y - m.h / 2) + m.h * (0.12 + 0.73 * f); V.set(m.x + m.w * 0.04, yy, 0); SC.set(m.w * 0.72, 0.0035, 1); M4.compose(V, Q.identity(), SC); b.ptr.setMatrixAt(i, M4); }); SC.set(1, 1, 1); if (ch) b.ptr.instanceMatrix.needsUpdate = true; }
  var lt = S.lampTest, lampUpd = function (arr, im) { if (!im) return; var c2 = false; arr.forEach(function (l, i) { var on = lt || !!l.on(); if (on === l.st && !force) return; l.st = on; im.setColorAt(i, on ? l.c : l.c.clone().multiplyScalar(0.15)); c2 = true; }); if (c2) im.instanceColor.needsUpdate = true; };
  lampUpd(b.plamp, b.pl); lampUpd(b.dlamp, b.dlm);
  if (b.swg) { ch = false; b.sw.forEach(function (r, i) { var tgt = r.spring * 0.78; if (Math.abs(r.turn - tgt) < 0.002 && !force) { if (r.spring && Math.abs(r.turn - tgt) < 0.05) r.spring = 0; return; } r.turn += (tgt - r.turn) * (1 - Math.exp(-dt * 16)); if (r.spring && Math.abs(r.turn - tgt) < 0.05) r.spring = 0; E.set(0, -r.turn, 0); Q.setFromEuler(E); V.set(r.u, 0.012, -r.d * SL); M4.compose(V, Q, SC); b.swg.setMatrixAt(i, M4); ch = true; }); if (ch) b.swg.instanceMatrix.needsUpdate = true; }
  if (b.pbc) { ch = false; b.pb.forEach(function (r, i) { var lit = r.o.lit ? (lt || !!r.o.lit()) : true, k = (r.push > 0 ? 1 : 0) + (lit ? 2 : 0); if (r.push > 0) r.push -= dt; if (k === r.st && !force) return; r.st = k; V.set(r.u, r.push > 0 ? 0.017 : 0.022, -r.d * SL); M4.compose(V, Q.identity(), SC); b.pbc.setMatrixAt(i, M4); b.pbc.setColorAt(i, lit || !r.o.lit ? r.c : r.c.clone().multiplyScalar(0.35)); ch = true; }); if (ch) { b.pbc.instanceMatrix.needsUpdate = true; b.pbc.instanceColor.needsUpdate = true; } }
  if (b.rk) { ch = false; b.rot.forEach(function (r, i) { var t = r.ang(r.o.get()); if (Math.abs(r.cur - t) < 0.002 && !force) return; r.cur += (t - r.cur) * (1 - Math.exp(-dt * 18)); E.set(0, -r.cur, 0); Q.setFromEuler(E); V.set(r.u, 0.008, -r.d * SL); M4.compose(V, Q, SC); b.rk.setMatrixAt(i, M4); ch = true; }); if (ch) b.rk.instanceMatrix.needsUpdate = true; }
  b.at += dt; if (b.at > 0.35 || force) { b.at = 0; beAtlas(b, force); }
}
var BEI = 0; function beFrame(dt) { if (!BE.length) return; for (var k = 0; k < 3; k++) { BEI = (BEI + 1) % BE.length; beTick(BE[BEI], dt * BE.length / 3); } BE.forEach(function (b) { if (b.ramp && b.ramp.o.raise) b.ramp.o.raise(b.ramp.dir, dt); }); }
/* helpers to make pumps, valves and breakers into switches quickly */
var SWINFO = [/x/, 'Control switch', 'A pistol-grip switch: turn it right to START (or OPEN / CLOSE a breaker), left to STOP. It springs back to the middle. The red lamp above it means running or open, green means stopped or closed.', 'Many have a \u201cpull to lock\u201d position so a pump can\u2019t auto-start during maintenance.'];
function pumpSW(t, arr, i, kind, extra) { extra = extra || {}; return Object.assign({ info: SWINFO, t: t, l: 'STOP', r: 'START', onTxt: 'RUNNING', offTxt: 'STOPPED', on: function () { var a = arr(); return !!a[i] && (!kind || pwr(X(), kind, i)); },
  act: function (right) { var a = arr(); if (right && kind && !pwr(X(), kind, i)) { warnOnce('nopwr' + t, t.replace(/\n/g, ' ') + ' won’t start: its electrical board has no power.'); return; } if (right && extra.can) { var why = extra.can(); if (why) { warnOnce('can' + t, t.replace(/\n/g, ' ') + ': ' + why); return; } } a[i] = right; S.addLog(t.replace(/\n/g, ' ') + (right ? ' started' : ' stopped')); if (extra.after) extra.after(right); } }, extra); }
function valveSW(t, get, set, extra) { return Object.assign({ info: SWINFO, t: t, l: 'CLOSE', r: 'OPEN', onTxt: 'OPEN', offTxt: 'CLOSED', on: get, act: function (right) { set(right); S.addLog(t.replace(/\n/g, ' ') + (right ? ' opened' : ' closed')); } }, extra || {}); }
function bkrSW(t, get, set, extra) { return Object.assign({ info: [/x/, 'Breaker control switch', 'Turn right to CLOSE the circuit breaker (connect power), left to TRIP it open. Red lamp: closed. Green lamp: open.'], t: t, l: 'TRIP', r: 'CLOSE', onTxt: 'CLOSED', offTxt: 'OPEN', on: get, act: function (right) { if (extra && extra.can && right) { var why = extra.can(); if (why) { warnOnce('bk' + t, t.replace(/\n/g, ' ') + ': ' + why); return; } } set(right); S.sfx('breaker'); S.addLog(t.replace(/\n/g, ' ') + (right ? ' closed' : ' opened')); } }, extra || {}); }
function maSimple(t, getMode, setMode, getOut, setOut, pv, sp, raiseSp) { return { t: t, mode: getMode, setMode: function (m) { setMode(m); S.addLog(t.replace(/\n/g, ' ') + ' to ' + (m === 'AUTO' ? 'AUTO' : 'MANUAL')); }, out: getOut, pv: pv, sp: sp,
  raise: function (dir, dt) { if (getMode() === 'AUTO') { if (raiseSp) raiseSp(dir, dt); } else setOut(clamp(getOut() + dir * dt * 0.08, 0, 1)); } }; }

/* ================================================================ the full board line-up ================================================================
   Left to right round the horseshoe: safety injection & containment, cooling water & air, chemical & volume control,
   pressuriser, reactor coolant, REACTOR (centre), steam generators & feed, main steam & condenser, turbine,
   generator & grid, electrical distribution & diesels. Every control here works. */
var RD = '#d64535', AM2 = '#e0b43a', GN = '#59b36b';
var LOOPS = [0, 1, 2, 3], L4 = function (f) { return LOOPS.map(f); };
var onoff = function (b) { return b ? 'ON' : 'OFF'; };
/* --------------------------------------------------------------- 1. SAFETY INJECTION & CONTAINMENT --------------------------------------------------------------- */
CONTENT.esf = function (s) { be(s); var x = X;
  grp(s, -1.74, -0.3, 1.66, 2.33, 'EMERGENCY CORE COOLING'); grp(s, -0.26, 0.82, 1.66, 2.33, 'CONTAINMENT'); grp(s, 0.86, 1.74, 1.66, 2.33, 'RADIATION MONITORING'); grp(s, -1.74, 1.74, 1.18, 1.62, 'ESF STATUS');
  meterRow(s, -1.68, 2.0, [['RWST', '% LEVEL', 0, 100, function () { return x().si.rwst; }, 'Refuelling water storage tank level'], ['SI FLOW', 'm³/h', 0, 400, function () { return x().si.flow; }, 'Total safety injection flow'],
    ['SIP A', 'BAR', 0, 160, function () { return x().si.pumps[0] && pwr(x(), 'sip', 0) ? 115 : 0; }, 'SI pump A discharge pressure'], ['SIP B', 'BAR', 0, 160, function () { return x().si.pumps[1] && pwr(x(), 'sip', 1) ? 115 : 0; }, 'SI pump B discharge pressure'],
    ['RHR A', 'm³/h', 0, 1000, function () { return x().si.rhr[0] && x().pz.P < 14 ? 800 : 0; }, 'RHR pump A flow'], ['RHR B', 'm³/h', 0, 1000, function () { return x().si.rhr[1] && x().pz.P < 14 ? 800 : 0; }, 'RHR pump B flow'],
    ['ACC 1', 'BAR', 0, 60, function () { return x().si.acc[0] ? Math.min(45, x().pz.P) : 45; }, 'Accumulator 1 pressure'], ['ACC 2', 'BAR', 0, 60, function () { return x().si.acc[1] ? Math.min(45, x().pz.P) : 45; }, 'Accumulator 2 pressure'],
    ['ACC 3', 'BAR', 0, 60, function () { return x().si.acc[2] ? Math.min(45, x().pz.P) : 45; }, 'Accumulator 3 pressure'], ['ACC 4', 'BAR', 0, 60, function () { return x().si.acc[3] ? Math.min(45, x().pz.P) : 45; }, 'Accumulator 4 pressure']], 0.098, { info: [/x/, 'Emergency core cooling', 'If the reactor coolant system loses water, safety injection pumps it back in from the refuelling water tank: high-head charging pumps first, then SI pumps as pressure falls, then the big RHR pumps. Accumulators are tanks of borated water held at 45 bar by nitrogen, which empty into the cold legs by themselves if pressure drops below that.', 'Safety injection water is heavily borated (2400 ppm), so it also shuts the reactor down.'] });
  meterRow(s, -0.2, 2.0, [['CTMT P', 'BAR g', -0.1, 4, function () { return x().ct.P; }, 'Containment pressure', null, { major: 4, minor: 5, bands: [[0.1, 1, RD]] }], ['CTMT T', '°C', 0, 150, function () { return x().ct.T; }, 'Containment temperature'],
    ['HUMID', '%', 0, 100, function () { return x().ct.hum; }, 'Containment humidity'], ['SUMP', '% LEVEL', 0, 100, function () { return x().ct.sump; }, 'Containment sump level'], ['CS A', 'm³/h', 0, 1500, function () { return x().si.cs[0] && pwr(x(), 'cs', 0) ? 1100 : 0; }, 'Containment spray A flow'], ['CS B', 'm³/h', 0, 1500, function () { return x().si.cs[1] && pwr(x(), 'cs', 1) ? 1100 : 0; }, 'Containment spray B flow'],
    ['H₂', '%', 0, 10, function () { return 0.02; }, 'Containment hydrogen concentration']], 0.098, { info: [/x/, 'Containment', 'The steel-lined concrete building around the reactor coolant system. If steam escapes inside it, pressure and temperature rise; fan coolers and sprays bring them back down. Isolation valves shut every pipe that goes through the wall.', 'At 0.3 bar it starts safety injection; at 1 bar the sprays come on.'] });
  dgRow(s, 0.98, 2.24, [['CTMT AREA mSv/h', function () { return (0.012 + Math.random() * 0.001).toFixed(3); }, 'Containment area radiation'], ['N-16 MAIN STEAM', function () { return (S.p.n * 12 + 0.01 + (X().f && X().f.sgtl ? 180 * S.p.n + 40 : 0)).toFixed(2); }, 'Main steam N-16 monitor (detects steam generator tube leaks)', '#59e07a']], 0.2);
  dgRow(s, 0.98, 2.11, [['AIR EJECTOR cpm', function () { return String(Math.round(40 + Math.random() * 6 + (X().f && X().f.sgtl ? 2400 : 0))); }, 'Condenser air ejector radiation'], ['STACK kBq/m³', function () { return (0.31 + Math.random() * 0.02).toFixed(2); }, 'Stack discharge monitor', '#59e07a']], 0.2);
  dgRow(s, 0.98, 1.98, [['CONTROL ROOM µSv/h', function () { return (0.08 + Math.random() * 0.01).toFixed(2); }, 'Control room area monitor', '#59e07a'], ['FUEL POOL mSv/h', function () { return (0.004 + Math.random() * 0.001).toFixed(3); }, 'Spent fuel pool area monitor']], 0.2);
  dgRow(s, 0.98, 1.85, [['SG BLOWDOWN cpm', function () { return String(Math.round(22 + Math.random() * 4)); }, 'Steam generator blowdown monitor'], ['RCS LETDOWN cpm', function () { return String(Math.round(1800 + Math.random() * 60)); }, 'Letdown line gross activity']], 0.2);
  lampRow(s, -1.62, 1.5, [['SI\nACTUATED', function () { return x().si.on; }, 0xff3324], ['SI BLOCK\nPZR PRESS', function () { return x().si.blkP; }, 0xffc94a], ['SI BLOCK\nSTM PRESS', function () { return x().si.blkS; }, 0xffc94a], ['P-11\n< 136 BAR', function () { return x().pz.P < 136; }, 0xf5f2e6], ['CTMT ISOL\nPHASE A', function () { return x().si.phaseA; }, 0xff3324],
    ['FEEDWATER\nISOLATION', function () { return !!x().fwIso; }, 0xff3324], ['SI RESET\nPERMITTED', function () { return x().si.on && S.p.t - x().si.at > 60; }, 0xf5f2e6], ['CS\nACTUATED', function () { return x().si.cs.some(Boolean); }, 0xff3324], ['ACCUMS\nINJECTING', function () { return x().pz.P < 45 && x().si.acc.some(Boolean); }, 0xffc94a], ['RWST\nLO LEVEL', function () { return x().si.rwst < 30; }, 0xffc94a],
    ['EDG A\nRUNNING', function () { return x().el.edg[0].run; }, 0xff3324], ['EDG B\nRUNNING', function () { return x().el.edg[1].run; }, 0xff3324], ['RHR A\nRUNNING', function () { return x().si.rhr[0]; }, 0xff3324], ['RHR B\nRUNNING', function () { return x().si.rhr[1]; }, 0xff3324], ['SIP A\nRUNNING', function () { return x().si.pumps[0]; }, 0xff3324], ['SIP B\nRUNNING', function () { return x().si.pumps[1]; }, 0xff3324],
    ['CCP A\nRUNNING', function () { return x().cv.ccp[0]; }, 0xff3324], ['CCP B\nRUNNING', function () { return x().cv.ccp[1]; }, 0xff3324], ['AFW\nACTUATED', function () { return x().tdafw; }, 0xff3324], ['TURBINE\nTRIPPED', function () { return !x().tb.latched; }, 0xffc94a], ['REACTOR\nTRIPPED', function () { return S.p.tripped; }, 0xffc94a]], 0.163);
  addAnn(s, annTiles([['SAFETY\nINJECTION', 'trip', function () { return x().si.on; }], ['CTMT PRESS\nHIGH', 'alarm', function () { return x().ct.P > 0.15; }], ['CTMT ISOL\nPHASE A', 'alarm', function () { return x().si.phaseA; }], ['CONTAINMENT\nSPRAY', 'alarm', function () { return x().si.cs.some(Boolean); }], ['RWST LEVEL\nLOW', 'alarm', function () { return x().si.rwst < 30; }], ['ACCUMULATOR\nPRESS LOW', 'alarm', function () { return x().pz.P < 45; }], ['SI PUMP\nRUNNING', 'alarm', function () { return x().si.pumps.some(Boolean); }],
    ['RHR PUMP\nRUNNING', 'alarm', function () { return x().si.rhr.some(Boolean); }], ['N-16 HIGH\nSG TUBE LEAK', 'alarm', function () { return !!(X().f && X().f.sgtl); }], ['CTMT AREA\nRAD HIGH'], ['AIR EJECTOR\nRAD HIGH', 'alarm', function () { return !!(X().f && X().f.sgtl); }], ['CONTROL RM\nRAD HIGH'], ['SUMP LEVEL\nHIGH', 'alarm', function () { return x().ct.sump > 20; }], ['H₂\nHIGH'],
    ['SI BLOCKED\nPZR PRESS', 'status', function () { return x().si.blkP; }], ['SI BLOCKED\nSTM PRESS', 'status', function () { return x().si.blkS; }], ['P-11\nPZR < 136', 'status', function () { return x().pz.P < 136; }], ['FEEDWATER\nISOLATED', 'status', function () { return !!x().fwIso; }], ['ACCUM ISOL\nVALVES OPEN', 'status', function () { return x().si.acc.every(Boolean); }]]));
  dgrp(s, -1.74, -0.06, 0.18, 0.96, 'SAFETY INJECTION', '#8f1a14'); dgrp(s, -0.02, 1.74, 0.18, 0.96, 'PUMPS & VALVES');
  PBN(s, -1.6, 0.66, { col: 0xd8161a, lbl: 'SI\nTRAIN A', tip: 'MANUAL SAFETY INJECTION, train A', act: function () { siActuate(S.p, 'manual actuation'); }, info: [/x/, 'Manual safety injection', 'Starts every emergency core cooling pump, isolates containment, trips the reactor and turbine and starts the diesels. Operators use it if a loss of coolant is happening and the automatic signal hasn’t come.', 'Once started it can only be reset after 60 seconds, and the pumps then have to be stopped one by one.'] });
  PBN(s, -1.44, 0.66, { col: 0xd8161a, lbl: 'SI\nTRAIN B', tip: 'MANUAL SAFETY INJECTION, train B', act: function () { siActuate(S.p, 'manual actuation'); } });
  PBN(s, -1.24, 0.66, { col: 0x2f6fd8, lbl: 'SI RESET', tip: 'Safety injection RESET (allowed 60 s after actuation)', act: function () { var si = x().si; if (!si.on) { S.toast('Safety injection isn’t actuated.'); return; } if (S.p.t - si.at < 60) { warnOnce('sir', 'SI can’t be reset until 60 seconds after it actuated.'); return; } si.on = false; S.addLog('Safety injection reset (pumps keep running until stopped)'); } });
  PBN(s, -1.06, 0.66, { col: 0x2f6fd8, lbl: 'PHASE A\nRESET', tip: 'Containment isolation phase A RESET', act: function () { if (x().si.on) { warnOnce('par', 'Reset safety injection first.'); return; } x().si.phaseA = false; S.addLog('Containment isolation phase A reset'); } });
  PBN(s, -0.86, 0.66, { col: 0xffc94a, lbl: 'BLOCK SI\nPZR PRESS', tip: 'Block the low pressuriser pressure SI signal (only allowed below P-11, 136 bar, for a cooldown)', lit: function () { return x().si.blkP; }, act: function () { if (x().pz.P >= 136) { warnOnce('blkp', 'Can’t block: pressuriser pressure is above P-11 (136 bar).'); return; } x().si.blkP = true; S.addLog('Low pressuriser pressure SI blocked'); } });
  PBN(s, -0.66, 0.66, { col: 0xffc94a, lbl: 'BLOCK SI\nSTM PRESS', tip: 'Block the low steam line pressure SI signal (only below P-11)', lit: function () { return x().si.blkS; }, act: function () { if (x().pz.P >= 136) { warnOnce('blks', 'Can’t block: pressuriser pressure is above P-11 (136 bar).'); return; } x().si.blkS = true; S.addLog('Low steam line pressure SI blocked'); } });
  PBN(s, -0.4, 0.66, { col: 0xd8161a, lbl: 'CTMT ISOL\nPHASE A', tip: 'Manual containment isolation phase A', act: function () { x().si.phaseA = true; S.addLog('Containment isolation phase A, manual'); } });
  PBN(s, -0.22, 0.66, { col: 0xd8161a, lbl: 'CTMT\nSPRAY', tip: 'Manual containment spray actuation', act: function () { x().si.cs = [true, true]; S.addLog('Containment spray actuated manually'); } });
  swRow(s, -1.6, 0.28, [pumpSW('SI PUMP A', function () { return x().si.pumps; }, 0, 'sip'), pumpSW('SI PUMP B', function () { return x().si.pumps; }, 1, 'sip'), pumpSW('RHR PUMP A', function () { return x().si.rhr; }, 0, 'rhr'), pumpSW('RHR PUMP B', function () { return x().si.rhr; }, 1, 'rhr'),
    pumpSW('CS PUMP A', function () { return x().si.cs; }, 0, 'cs'), pumpSW('CS PUMP B', function () { return x().si.cs; }, 1, 'cs'), pumpSW('CCP A', function () { return x().cv.ccp; }, 0, 'ccp'), pumpSW('CCP B', function () { return x().cv.ccp; }, 1, 'ccp'),
    valveSW('ACCUM 1\nISOL', function () { return x().si.acc[0]; }, function (v) { x().si.acc[0] = v; }), valveSW('ACCUM 2\nISOL', function () { return x().si.acc[1]; }, function (v) { x().si.acc[1] = v; }), valveSW('ACCUM 3\nISOL', function () { return x().si.acc[2]; }, function (v) { x().si.acc[2] = v; }), valveSW('ACCUM 4\nISOL', function () { return x().si.acc[3]; }, function (v) { x().si.acc[3] = v; })], 0.135);
  swRow(s, 0.12, 0.66, [pumpSW('CTMT FAN\nCOOLER 1', function () { return x().aux.fan; }, 0, 'fan'), pumpSW('CTMT FAN\nCOOLER 2', function () { return x().aux.fan; }, 1, 'fan'), pumpSW('CTMT FAN\nCOOLER 3', function () { return x().aux.fan; }, 2, 'fan'), pumpSW('CTMT FAN\nCOOLER 4', function () { return x().aux.fan; }, 3, 'fan'),
    valveSW('H₂\nRECOMBINER', function () { return !!x().h2r; }, function (v) { x().h2r = v; }, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' }), valveSW('PURGE\nISOL', function () { return !x().si.phaseA; }, function (v) { if (v && x().si.phaseA) { warnOnce('pur', 'Containment isolation is active: reset phase A first.'); return; } }), valveSW('SUMP\nRECIRC A', function () { return !!x().recA; }, function (v) { x().recA = v; }), valveSW('SUMP\nRECIRC B', function () { return !!x().recB; }, function (v) { x().recB = v; })], 0.135);
};
/* --------------------------------------------------------------- 2. COOLING WATER, AIR, HVAC, FIRE --------------------------------------------------------------- */
CONTENT.aux = function (s) { be(s); var x = X;
  REC(s, 1.3, 1.4, 'CCW & AIR', [['CCW \u00b0C', function () { return x().aux.ccwT; }], ['AIR bar\u00d75', function () { return x().aux.airP * 5; }, '#1f5fbf']], 0, 60);
  grp(s, -1.74, -0.52, 1.66, 2.33, 'COMPONENT COOLING WATER'); grp(s, -0.48, 0.5, 1.66, 2.33, 'SEA WATER'); grp(s, 0.54, 1.74, 1.66, 2.33, 'INSTRUMENT AIR & HVAC'); grp(s, -1.74, 1.74, 1.18, 1.62, 'RCP COOLING  ·  FIRE DETECTION');
  var ccwN = function () { return x().aux.ccw.filter(function (c, k) { return c && pwr(x(), 'ccw', k); }).length; }, swN = function () { return x().aux.sw.filter(function (c, k) { return c && pwr(x(), 'sw', k); }).length; };
  meterRow(s, -1.68, 2.0, [['CCW T', '°C', 10, 60, function () { return x().aux.ccwT; }, 'Component cooling water header temperature'], ['CCW F', 'm³/h', 0, 4000, function () { return ccwN() * 1200; }, 'Component cooling water flow'], ['CCW P', 'BAR', 0, 10, function () { return ccwN() ? 6.2 : 0.3; }, 'Component cooling water pressure'],
    ['SURGE', '% LEVEL', 0, 100, function () { return 58; }, 'CCW surge tank level'], ['CCW HX', '°C', 10, 60, function () { return x().aux.ccwT + 9; }, 'CCW heat exchanger inlet temperature'], ['THERM BAR', 'm³/h', 0, 100, function () { return ccwN() ? 48 : 0; }, 'RCP thermal barrier cooling flow']], 0.098,
    { info: [/x/, 'Component cooling water (CCW)', 'A closed loop of clean water that cools the pumps, coolers and heat exchangers around the plant, including the reactor coolant pump bearings and seals. CCW is itself cooled by sea water.', 'Lose CCW and the reactor coolant pumps overheat in a few minutes, so it is one of the systems operators watch closely.'] });
  meterRow(s, -0.42, 2.0, [['SW P', 'BAR', 0, 6, function () { return swN() ? 3.1 : 0.1; }, 'Sea water header pressure'], ['SW F', 'm³/h', 0, 8000, function () { return swN() * 2500; }, 'Sea water flow'], ['SW T', '°C', 0, 30, function () { return x().aux.swT; }, 'Sea water temperature'], ['SCREEN ΔP', 'mBAR', 0, 200, function () { return 34; }, 'Drum screen differential pressure'],
    ['BAY', 'm', -5, 5, function () { return 1.2 * Math.sin(S.p.t / 3000 + D.clock / 22000); }, 'Sea level in the intake bay (tide)']], 0.098, { info: [/x/, 'Sea water', 'Pumped in from the sea through screens, it cools the component cooling water and takes the plant’s waste heat away.', 'At coastal stations like Sizewell and Hinkley Point the tide changes the pump intake level all day.'] });
  meterRow(s, 0.6, 2.0, [['AIR P', 'BAR', 0, 10, function () { return x().aux.airP; }, 'Instrument air header pressure', null, { bands: [[0, 0.4, RD]] }], ['DEWPT', '°C', -60, 20, function () { return -40; }, 'Instrument air dew point'], ['CR T', '°C', 10, 35, function () { return 21.3; }, 'Control room temperature'], ['CR ΔP', 'Pa', -50, 150, function () { return x().aux.hvac === 'EMERG' ? 60 : 12; }, 'Control room pressure above outside']], 0.098,
    { info: [/x/, 'Instrument air', 'Compressors make dry air at 7 bar that drives hundreds of air-operated valves: feed regulating valves, letdown, sprays, steam dumps. Without air, those valves move to their fail-safe positions.', 'Loss of instrument air is a classic abnormal procedure: feed valves shut and steam generator levels start to fall.'] });
  MA(s, 1.55, 2.02, maSimple('CR HVAC\nTEMP', function () { return 'AUTO'; }, function () {}, function () { return 0.42; }, function () {}, function () { return '21.3 °C'; }, function () { return '21.0'; }));
  meterRow(s, -1.68, 1.42, L4(function (i) { return ['BRG ' + (i + 1), '°C', 20, 120, function () { return x().brgT[i]; }, 'RCP ' + (i + 1) + ' bearing temperature', [/x/, 'RCP bearing temperature', 'The reactor coolant pump motor bearings are cooled by component cooling water. If cooling is lost they heat up, and the pump trips at 95 °C.'], { h: 0.18, bands: [[0.79, 1, RD]] }]; }), 0.098);
  lampRow(s, -1.2, 1.5, [['FIRE\nTURB HALL', NO, 0xff3324], ['FIRE\nCABLE SPREAD', NO, 0xff3324], ['FIRE\nDIESEL A', NO, 0xff3324], ['FIRE\nDIESEL B', NO, 0xff3324], ['FIRE\nSWITCHGEAR', NO, 0xff3324], ['FIRE\nAUX BLDG', NO, 0xff3324], ['FIRE\nTRANSFORMER', NO, 0xff3324], ['FIRE\nCONTROL BLDG', NO, 0xff3324],
    ['FIRE SYSTEM\nHEALTHY', YES, 0x2bd14a], ['FIRE PUMP\nAVAILABLE', YES, 0x2bd14a], ['CCW\nLOW FLOW', function () { return ccwN() === 0; }, 0xffc94a], ['SW\nLOW PRESS', function () { return swN() === 0; }, 0xffc94a], ['AIR\nLOW PRESS', function () { return x().aux.airP < 5.5; }, 0xffc94a], ['HVAC\nEMERGENCY', function () { return x().aux.hvac === 'EMERG'; }, 0xffc94a]], 0.142);
  addAnn(s, annTiles([['CCW\nFLOW LOW', 'alarm', function () { return ccwN() === 0; }], ['CCW TEMP\nHIGH', 'alarm', function () { return x().aux.ccwT > 40; }], ['CCW SURGE\nTANK LOW'], ['SW HEADER\nPRESS LOW', 'alarm', function () { return swN() === 0; }], ['DRUM SCREEN\nΔP HIGH'], ['INST AIR\nPRESS LOW', 'alarm', function () { return x().aux.airP < 5.5; }], ['INST AIR\nPRESS LO-LO', 'alarm', function () { return x().aux.airP < 4; }],
    ['RCP BEARING\nTEMP HIGH', 'alarm', function () { return x().brgT.some(function (t) { return t > 80; }); }], ['FIRE\nALARM'], ['AIR COMPRESSOR\nTRIP', 'alarm', function () { return !!(X().f && X().f.air); }], ['CR HVAC\nFAULT'], ['CR\nTEMP HIGH'], ['AIR DRYER\nFAULT'], [''],
    ['CCW PUMPS\n2 RUNNING', 'status', function () { return ccwN() >= 2; }], ['SW PUMPS\n2 RUNNING', 'status', function () { return swN() >= 2; }], ['AIR COMP\nRUNNING', 'status', function () { return x().aux.air.some(Boolean); }], ['CR HVAC\nNORMAL', 'status', function () { return x().aux.hvac !== 'EMERG'; }]]));
  dgrp(s, -1.74, 0.36, 0.18, 0.96, 'COOLING WATER PUMPS'); dgrp(s, 0.4, 1.74, 0.18, 0.96, 'AIR & HVAC');
  swRow(s, -1.6, 0.66, [pumpSW('CCW PUMP A', function () { return x().aux.ccw; }, 0, 'ccw'), pumpSW('CCW PUMP B', function () { return x().aux.ccw; }, 1, 'ccw'), pumpSW('CCW PUMP C', function () { return x().aux.ccw; }, 2, 'ccw'), null, pumpSW('SW PUMP A', function () { return x().aux.sw; }, 0, 'sw'), pumpSW('SW PUMP B', function () { return x().aux.sw; }, 1, 'sw'), pumpSW('SW PUMP C', function () { return x().aux.sw; }, 2, 'sw'), pumpSW('SW PUMP D', function () { return x().aux.sw; }, 3, 'sw')], 0.135);
  swRow(s, -1.6, 0.28, [valveSW('CCW HX A\nOUTLET', YES, function () {}), valveSW('CCW HX B\nOUTLET', YES, function () {}), valveSW('CCW TO\nRCPs', function () { return x().ccwRcp !== false; }, function (v) { x().ccwRcp = v; if (!v) { x().aux.ccw = x().aux.ccw.map(function () { return false; }); } }), null, valveSW('DRUM\nSCREEN A', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('DRUM\nSCREEN B', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' })], 0.135);
  swRow(s, 0.55, 0.66, [pumpSW('AIR COMP\nA', function () { return x().aux.air; }, 0, 'air'), pumpSW('AIR COMP\nB', function () { return x().aux.air; }, 1, 'air'), valveSW('AIR DRYER', YES, function () {}, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' }), valveSW('SERVICE AIR\nISOL', YES, function () {})], 0.135);
  ROT(s, 1.3, 0.6, { t: 'CR HVAC MODE', pos: ['NORMAL', 'EMERG'], get: function () { return x().aux.hvac === 'EMERG' ? 1 : 0; }, set: function (i) { x().aux.hvac = i ? 'EMERG' : true; S.addLog('Control room ventilation to ' + (i ? 'EMERGENCY (filtered, pressurised)' : 'NORMAL')); }, info: [/x/, 'Control room ventilation', 'In emergency mode the control room air is recirculated through charcoal filters and kept at slightly higher pressure than outside, so no radioactive or toxic gas can leak in.'] });
  PBN(s, 1.58, 0.3, { col: 0xd8161a, lbl: 'FIRE\nALARM TEST', tip: 'Fire panel lamp test', act: function () {}, hold: function (on) { S.lampTest = on; } });
};
/* --------------------------------------------------------------- 3. CHEMICAL & VOLUME CONTROL --------------------------------------------------------------- */
CONTENT.cvcs = function (s) { be(s); var x = X, cv = function () { return x().cv; };
  REC(s, 0.62, 1.4, 'RCS BORON', [['BORON ppm', function () { return S.p.boron; }]], 0, 2000, 'ppm'); REC(s, 1.12, 1.4, 'CHARGING & LETDOWN', [['CHG', function () { return cv().chg; }], ['LTDN', function () { return cv().ltd; }, '#1f5fbf']], 0, 40, 'm\u00b3/h');
  grp(s, -1.74, -0.36, 1.66, 2.33, 'CHARGING & LETDOWN'); grp(s, -0.32, 1.74, 1.66, 2.33, 'BORON & REACTOR MAKE-UP'); grp(s, -1.74, 1.74, 1.18, 1.62, 'CONTROLLERS & STATUS');
  meterRow(s, -1.68, 2.0, [['CHG', 'm³/h', 0, 40, function () { return cv().chg; }, 'Charging flow'], ['LTDN', 'm³/h', 0, 50, function () { return cv().ltd; }, 'Letdown flow'], ['SEAL', 'm³/h', 0, 10, function () { return cv().ccp.some(Boolean) || cv().pd ? 3.1 : 0; }, 'Seal injection flow'],
    ['LTDN P', 'BAR', 0, 40, function () { return cv().ltdIso ? 2 : 24; }, 'Letdown pressure'], ['LTDN T', '°C', 0, 100, function () { return cv().ltdIso ? 30 : 46; }, 'Letdown heat exchanger outlet temperature'], ['VCT L', '% LEVEL', 0, 100, function () { return cv().vct; }, 'Volume control tank level'], ['VCT P', 'BAR', 0, 5, function () { return 1.8; }, 'Volume control tank pressure'],
    ['CHG P', 'BAR', 0, 200, function () { return cv().chg > 0.5 ? 172 : 0; }, 'Charging header pressure']], 0.098);
  meterRow(s, -0.26, 2.0, [['BAT', '% LEVEL', 0, 100, function () { return cv().bat; }, 'Boric acid tank level'], ['BA F', 'm³/h', 0, 10, function () { return cv().run && (cv().mode === 'BOR' || cv().mode === 'MAN') ? cv().baF : 0; }, 'Boric acid flow to the blender'],
    ['DIL F', 'm³/h', 0, 50, function () { return cv().run && cv().mode !== 'BOR' ? cv().dilF : cv().autoMk ? 18 : 0; }, 'Make-up (dilution) water flow'], ['RWST', '% LEVEL', 0, 100, function () { return x().si.rwst; }, 'Refuelling water storage tank level']], 0.098);
  DG(s, 0.32, 2.21, 'RCS BORON PPM', function () { return Math.round(S.p.boron); }, { w: 0.22, col: '#59e07a', name: 'RCS boron concentration' });
  DG(s, 0.32, 2.08, 'BATCH LITRES', function () { return Math.round(cv().done) + '/' + cv().batch; }, { w: 0.22, name: 'Make-up batch counter' });
  DG(s, 0.32, 1.95, 'MAKE-UP MODE', function () { return { DIL: 'DILUTE', ALTDIL: 'ALT DIL', AUTO: 'AUTO', BOR: 'BORATE', MAN: 'MANUAL' }[cv().mode]; }, { w: 0.22, col: '#ffd34a' });
  DG(s, 0.32, 1.82, 'BORON TREND PPM/MIN', function () { var d = cv().bTr || 0; return (d >= 0 ? '+' : '') + d.toFixed(2); }, { w: 0.22, name: 'Rate of boron change' });
  meterRow(s, 0.58, 2.0, [['XE', 'PCM', 0, 3500, function () { return x().xe.X; }, 'Xenon-135 reactivity worth (from the core monitoring computer)', [/x/, 'Xenon-135', 'A fission product that soaks up neutrons. It builds up over hours after a power increase and peaks about 10 hours after a trip, which can stop a restart. Operators dilute boron to compensate as it builds up.']],
    ['I-135', 'REL', 0, 10000, function () { return x().xe.I; }, 'Iodine-135 inventory (it decays into xenon)'], ['PRZ B', 'PPM', 0, 2500, function () { return S.p.boron + 4; }, 'Pressuriser boron (sampled)']], 0.098);
  lampRow(s, 0.9, 2.26, [['DILUTION\nIN PROGRESS', function () { return cv().run && (cv().mode === 'DIL' || cv().mode === 'ALTDIL'); }, 0xffc94a], ['BORATION\nIN PROGRESS', function () { return cv().run && cv().mode === 'BOR'; }, 0xffc94a]], 0.12);
  lampRow(s, 1.18, 2.06, [['AUTO\nMAKE-UP', function () { return !!cv().autoMk; }, 0xf5f2e6], ['VCT\nDIVERT', function () { return cv().divert; }, 0xffc94a], ['BATCH\nCOMPLETE', function () { return !cv().run && cv().done >= cv().batch; }, 0x2bd14a], ['LETDOWN\nISOLATED', function () { return cv().ltdIso; }, 0xffc94a]], 0.12);
  MA(s, -1.6, 1.4, { t: 'CHARGING\nFCV-121', mode: function () { return cv().chgMode; }, setMode: function (m) { cv().chgMode = m; S.addLog('Charging flow controller to ' + m); }, out: function () { return cv().chgDem / 30; }, pv: function () { return cv().chg.toFixed(1) + ' m³/h'; }, sp: function () { return 'PZR ' + LPRG(S.p.Tavg).toFixed(0) + '%'; }, raise: function (d, dt) { if (cv().chgMode === 'MAN') cv().chgDem = clamp(cv().chgDem + d * dt * 2, 0, 30); },
    info: [/x/, 'Charging flow controller', 'In AUTO it holds pressuriser level on programme (25% at no load, rising with Tavg) by changing charging flow. In MANUAL you set charging flow yourself.'] });
  MA(s, -1.46, 1.4, maSimple('LETDOWN\nPRESS PCV', function () { return 'AUTO'; }, function () {}, function () { return 0.48; }, function () {}, function () { return (cv().ltdIso ? 2 : 24) + ' bar'; }, function () { return '24'; }));
  lampRow(s, -1.25, 1.5, [['CCP A\nRUNNING', function () { return cv().ccp[0]; }, 0xff3324], ['CCP B\nRUNNING', function () { return cv().ccp[1]; }, 0xff3324], ['PD PUMP\nRUNNING', function () { return cv().pd; }, 0xff3324], ['ORIFICE A\nOPEN', function () { return cv().orif[0]; }, 0xff3324], ['ORIFICE B\nOPEN', function () { return cv().orif[1]; }, 0xff3324], ['ORIFICE C\nOPEN', function () { return cv().orif[2]; }, 0xff3324],
    ['BA PUMP A\nRUNNING', function () { return cv().baPump[0]; }, 0xff3324], ['BA PUMP B\nRUNNING', function () { return cv().baPump[1]; }, 0xff3324], ['SEAL INJ\nNORMAL', function () { return cv().ccp.some(Boolean) || cv().pd; }, 0x2bd14a], ['VCT LEVEL\nLOW', function () { return cv().vct < 20; }, 0xffc94a], ['VCT LEVEL\nHIGH', function () { return cv().vct > 80; }, 0xffc94a], ['BAT LEVEL\nLOW', function () { return cv().bat < 30; }, 0xffc94a]], 0.11);
  DG(s, 1.6, 1.42, 'LETDOWN m³/h', function () { return cv().ltd.toFixed(1); }, { w: 0.18 });
  addAnn(s, annTiles([['VCT LEVEL\nHIGH', 'alarm', function () { return cv().vct > 80; }], ['VCT LEVEL\nLOW', 'alarm', function () { return cv().vct < 20; }], ['CHARGING\nFLOW LOW', 'alarm', function () { return cv().chg < 3; }], ['LETDOWN\nISOLATED', 'alarm', function () { return cv().ltdIso; }], ['SEAL INJ\nFLOW LOW', 'alarm', function () { return !(cv().ccp.some(Boolean) || cv().pd); }], ['BA TANK\nLEVEL LOW', 'alarm', function () { return cv().bat < 30; }], ['RWST\nLEVEL LOW', 'alarm', function () { return x().si.rwst < 30; }],
    ['BORON\nDILUTION', 'alarm', function () { return cv().run && (cv().mode === 'DIL' || cv().mode === 'ALTDIL'); }], ['MAKE-UP\nDEVIATION'], ['LETDOWN\nTEMP HIGH'], ['CHG PUMP\nTRIP', 'alarm', function () { return X().cv.ccp.every(function (c) { return !c; }) && !X().cv.pd; }], ['VCT\nDIVERT', 'alarm', function () { return cv().divert; }], [''],
    ['AUTO\nMAKE-UP', 'status', function () { return !!cv().autoMk; }], ['LETDOWN IN\nSERVICE', 'status', function () { return !cv().ltdIso; }], ['BATCH\nRUNNING', 'status', function () { return cv().run; }]]));
  dgrp(s, -1.74, 0.0, 0.18, 0.96, 'CHARGING & LETDOWN'); dgrp(s, 0.04, 1.74, 0.18, 0.96, 'REACTOR MAKE-UP CONTROL');
  swRow(s, -1.6, 0.66, [pumpSW('CCP A', function () { return cv().ccp; }, 0, 'ccp', { info: [/x/, 'Centrifugal charging pumps', 'Push water back into the reactor coolant system at 155 bar, and supply seal water to the reactor coolant pumps. They double as the high-head safety injection pumps.'] }), pumpSW('CCP B', function () { return cv().ccp; }, 1, 'ccp'), pumpSW('PD PUMP', function () { return [cv().pd]; }, 0, null, { after: function (v) { cv().pd = v; } }),
    valveSW('LETDOWN\nLCV-459', function () { return !cv().ltdIso; }, function (v) { if (v) { if (x().pz.L < 17) { warnOnce('lt1', 'Letdown can’t open: pressuriser level is below 17%.'); return; } if (!(cv().ccp.some(Boolean) || cv().pd)) { warnOnce('lt2', 'Start a charging pump before opening letdown, or the letdown would flash to steam.'); return; } if (x().si.phaseA) { warnOnce('lt3', 'Containment isolation is active.'); return; } } cv().ltdIso = !v; }, { info: [/x/, 'Letdown isolation valve', 'Lets coolant out of the reactor coolant system to be cooled, cleaned and have its boron adjusted. It shuts automatically on low pressuriser level or if charging stops.'] }),
    valveSW('ORIFICE A\n45 gpm', function () { return cv().orif[0]; }, function (v) { cv().orif[0] = v; }), valveSW('ORIFICE B\n75 gpm', function () { return cv().orif[1]; }, function (v) { cv().orif[1] = v; }), valveSW('ORIFICE C\n75 gpm', function () { return cv().orif[2]; }, function (v) { cv().orif[2] = v; }),
    pumpSW('BA PUMP A', function () { return cv().baPump; }, 0, 'bap'), pumpSW('BA PUMP B', function () { return cv().baPump; }, 1, 'bap')], 0.135);
  swRow(s, -1.6, 0.28, [valveSW('VCT OUTLET\nLCV-112C', YES, function () {}), valveSW('RWST TO\nCHG LCV-112D', function () { return !!cv().rwstSuct; }, function (v) { cv().rwstSuct = v; }), valveSW('SEAL INJ\nISOL', YES, function () {}), valveSW('REGEN HX\nBYPASS', NO, function () {}), valveSW('EXCESS\nLETDOWN', NO, function () {}), valveSW('VCT\nDIVERT', function () { return cv().divert; }, function () {})], 0.135);
  ROT(s, 0.25, 0.62, { t: 'MAKE-UP MODE', pos: ['DIL', 'ALT DIL', 'AUTO', 'BORATE', 'MAN'], get: function () { return ['DIL', 'ALTDIL', 'AUTO', 'BOR', 'MAN'].indexOf(cv().mode); }, set: function (i) { cv().mode = ['DIL', 'ALTDIL', 'AUTO', 'BOR', 'MAN'][i]; cv().run = false; S.addLog('Make-up mode selector to ' + ['DILUTE', 'ALTERNATE DILUTE', 'AUTO', 'BORATE', 'MANUAL'][i]); },
    info: [/x/, 'Reactor make-up mode', 'DILUTE adds pure water, which lowers boron and adds reactivity. BORATE adds strong boric acid, which removes reactivity. AUTO just tops up the volume control tank at the same concentration. Set the flow and batch size, then press START.', 'Dilution at 10 m³/h changes boron by under 1 ppm a minute: about 7 pcm a minute here, much slower than rods.'] });
  ROT(s, 0.6, 0.62, { t: 'DIL FLOW m³/h', pos: ['5', '10', '20', '40'], get: function () { return [5, 10, 20, 40].indexOf(cv().dilF); }, set: function (i) { cv().dilF = [5, 10, 20, 40][i]; } });
  ROT(s, 0.95, 0.62, { t: 'BA FLOW m³/h', pos: ['1', '2', '4', '8'], get: function () { return [1, 2, 4, 8].indexOf(cv().baF); }, set: function (i) { cv().baF = [1, 2, 4, 8][i]; } });
  ROT(s, 1.3, 0.62, { t: 'BATCH LITRES', pos: ['250', '500', '1000', '2000', '5000'], get: function () { return [250, 500, 1000, 2000, 5000].indexOf(cv().batch); }, set: function (i) { cv().batch = [250, 500, 1000, 2000, 5000][i]; } });
  PBN(s, 0.5, 0.26, { col: 0x2bd14a, lbl: 'MAKE-UP\nSTART', lit: function () { return cv().run; }, tip: 'Start the make-up batch', act: function () { var c = cv(); if (c.mode === 'AUTO') { S.toast('AUTO make-up runs by itself when the VCT level is low. Choose DILUTE, BORATE or MANUAL for a batch.'); return; } if (!(c.ccp.some(Boolean) || c.pd)) { warnOnce('mk', 'No charging pump running: the make-up won’t reach the reactor.'); } c.done = 0; c.run = true; S.addLog('Make-up batch started: ' + c.mode + ', ' + c.batch + ' litres'); } });
  PBN(s, 0.72, 0.26, { col: 0xd8161a, lbl: 'MAKE-UP\nSTOP', tip: 'Stop the make-up batch', act: function () { cv().run = false; S.addLog('Make-up batch stopped at ' + Math.round(cv().done) + ' litres'); } });
  PBN(s, 1.0, 0.26, { col: 0xd8161a, lbl: 'EMERG\nBORATE', tip: 'Emergency boration: boric acid straight to the charging pumps', act: function () { var c = cv(); c.mode = 'BOR'; c.baF = 8; c.batch = 5000; c.done = 0; c.run = true; S.addLog('EMERGENCY BORATION started'); } });
};
/* --------------------------------------------------------------- 4. PRESSURISER --------------------------------------------------------------- */
CONTENT.pzr = function (s) { be(s); var x = X, pz = function () { return x().pz; };
  REC(s, 0.35, 1.4, 'PZR PRESSURE', [['P bar', function () { return pz().P; }]], 120, 180, 'bar'); REC(s, 0.95, 1.4, 'PZR LEVEL', [['LEVEL', function () { return pz().L; }], ['PROGRAMME', function () { return LPRG(S.p.Tavg); }, '#1f5fbf']], 0, 100, '%');
  grp(s, -1.74, -0.3, 1.66, 2.33, 'PRESSURISER PRESSURE & LEVEL'); grp(s, -0.26, 0.92, 1.66, 2.33, 'RELIEF & SPRAY'); grp(s, 0.96, 1.74, 1.66, 2.33, 'RELIEF TANK'); grp(s, -1.74, 1.74, 1.18, 1.62, 'CONTROLLERS');
  var chs = [0.0, -0.3, 0.25, -0.15];
  meterRow(s, -1.68, 2.0, chs.map(function (o, i) { return ['PT-45' + (5 + i), 'BAR', 100, 180, function () { return pz().P + o; }, 'Pressuriser pressure channel ' + (i + 1), null, { major: 4, minor: 4, bands: [[34 / 80, 35 / 80, AM2], [66 / 80, 1, RD]] }]; }).concat(
    [0, 1, 2].map(function (i) { return ['LT-46' + (i + 1), '% LEVEL', 0, 100, function () { return pz().L + [0, 0.4, -0.3][i]; }, 'Pressuriser level channel ' + (i + 1), null, { bands: [[0.92, 1, RD]] }]; }), [['PZR T', '°C', 300, 360, function () { return tsat(pz().P); }, 'Pressuriser temperature (saturation)'], ['SPRAY T', '°C', 250, 360, function () { return pz().spray > 0.02 ? 288 : 260; }, 'Spray line temperature']]), 0.098);
  meterRow(s, -0.2, 2.0, [['SPRAY', '% OPEN', 0, 100, function () { return pz().spray * 100; }, 'Spray valve position'], ['PROP H', '% POWER', 0, 100, function () { return pz().heaters ? pz().prop * 100 : 0; }, 'Proportional heater output'], ['HTR kW', 'kW', 0, 4000, function () { return (pz().heaters && pz().L > 17 ? 1800 * pz().prop + (pz().backup ? 1600 : 0) : 0); }, 'Total heater power'],
    ['PORV T', '°C', 0, 350, function () { return pz().porv[0] || pz().porv[1] ? 330 : 48; }, 'PORV discharge line temperature', [/x/, 'PORV discharge temperature', 'A hot discharge line means a relief valve is open or leaking: it’s how operators spot a stuck-open PORV even if the position lights are wrong.']], ['SAFETY T', '°C', 0, 350, function () { return pz().safety ? 330 : 45; }, 'Safety valve discharge temperature']], 0.098);
  lampRow(s, 0.42, 2.27, [['PORV 455A\nOPEN', function () { return pz().porv[0]; }, 0xff3324], ['PORV 456\nOPEN', function () { return pz().porv[1]; }, 0xff3324], ['SAFETY\nOPEN', function () { return pz().safety; }, 0xff3324]], 0.11);
  lampRow(s, 0.42, 2.1, [['BLOCK V 1\nOPEN', function () { return pz().blk[0]; }, 0xff3324], ['BLOCK V 2\nOPEN', function () { return pz().blk[1]; }, 0xff3324], ['BACKUP\nHEATERS', function () { return pz().backup; }, 0xff3324]], 0.11);
  lampRow(s, 0.42, 1.93, [['HEATERS\nTRIPPED LOW L', function () { return pz().L < 17; }, 0xffc94a], ['SPRAY\nAVAILABLE', function () { return Math.max(x().rcp[0], x().rcp[1]) > 0.5; }, 0x2bd14a], ['PZR LEVEL\nPROGRAMME', YES, 0xf5f2e6]], 0.11);
  meterRow(s, 1.04, 2.0, [['PRT L', '% LEVEL', 0, 100, function () { return pz().prt; }, 'Pressuriser relief tank level'], ['PRT P', 'BAR g', 0, 8, function () { return pz().prtP; }, 'Pressuriser relief tank pressure', null, { major: 4, minor: 4 }], ['PRT T', '°C', 0, 150, function () { return 30 + pz().prtP * 12; }, 'Pressuriser relief tank temperature']], 0.098, { info: [/x/, 'Pressuriser relief tank', 'Relief and safety valves discharge into this tank of cold water, which condenses the steam. If it overfills, its rupture disc bursts into containment.'] });
  DG(s, 1.4, 1.72, 'PZR L PROGRAMME %', function () { return LPRG(S.p.Tavg).toFixed(1); }, { w: 0.2, col: '#ffd34a' });
  MA(s, -1.6, 1.4, { t: 'PZR PRESS\nMASTER', mode: function () { return pz().master; }, setMode: function (m) { pz().master = m; if (m === 'MAN') pz().manDem = pz().prop; S.addLog('Pressuriser pressure master controller to ' + m); }, out: function () { return pz().prop; }, pv: function () { return pz().P.toFixed(1) + ' bar'; }, sp: function () { return '155.0'; }, raise: function (d, dt) { if (pz().master === 'MAN') pz().manDem = clamp(pz().manDem + d * dt * 0.1, 0, 1); },
    info: [/x/, 'Pressuriser pressure master controller', 'In AUTO it holds 155 bar: below the setpoint it turns heaters up (and backup heaters on at 153.3 bar), above it opens the spray valves (from 156.7 bar). In MANUAL you drive the proportional heaters yourself.'] });
  MA(s, -1.46, 1.4, { t: 'SPRAY\nVALVES', mode: function () { return pz().sprayMan === 'MAN' ? 'MAN' : 'AUTO'; }, setMode: function (m) { pz().sprayMan = m; pz().sprayDem = pz().spray; S.addLog('Pressuriser spray to ' + m); }, out: function () { return pz().spray; }, pv: function () { return Math.round(pz().spray * 100) + '%'; }, raise: function (d, dt) { if (pz().sprayMan === 'MAN') pz().sprayDem = clamp(pz().sprayDem + d * dt * 0.15, 0, 1); },
    info: [/x/, 'Pressuriser spray', 'Sprays cooler water from the cold legs into the steam bubble at the top of the pressuriser. Steam condenses and pressure falls. It needs reactor coolant pumps 1 or 2 running, because their pressure drives the spray.'] });
  MA(s, -1.32, 1.4, maSimple('PZR LEVEL\nMASTER', function () { return x().cv.chgMode; }, function (m) { x().cv.chgMode = m; }, function () { return x().cv.chgDem / 30; }, function (v) { x().cv.chgDem = v * 30; }, function () { return pz().L.toFixed(1) + '%'; }, function () { return LPRG(S.p.Tavg).toFixed(1); }));
  DG(s, -1.06, 1.52, 'PZR PRESS BAR', function () { return pz().P.toFixed(1); }, { w: 0.18 }); DG(s, -1.06, 1.4, 'PZR LEVEL %', function () { return pz().L.toFixed(1); }, { w: 0.18 }); DG(s, -1.06, 1.28, 'SUBCOOLING °C', function () { return D.sub.toFixed(1); }, { w: 0.18, col: '#59e07a' });
  lampRow(s, -0.7, 1.5, [['PZR PRESS\nLOW 134', function () { return pz().P < 134; }, 0xffc94a], ['PZR PRESS\nHIGH 162', function () { return pz().P > 162; }, 0xffc94a], ['PZR LEVEL\nLOW 17%', function () { return pz().L < 17; }, 0xffc94a], ['PZR LEVEL\nHIGH 70%', function () { return pz().L > 70; }, 0xffc94a], ['SI\nP < 127', function () { return pz().P < 127; }, 0xff3324], ['P-11\n< 136', function () { return pz().P < 136; }, 0xf5f2e6]], 0.12);
  addAnn(s, annTiles([['PZR PRESS\nLOW TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'PZRPL'; }], ['PZR PRESS\nHIGH TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'PZRPH'; }], ['PZR LEVEL\nHIGH TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'PZRL'; }], ['PZR PRESS\nHIGH', 'alarm', function () { return pz().P > 162; }], ['PZR PRESS\nLOW', 'alarm', function () { return pz().P < 148; }], ['PZR LEVEL\nHIGH', 'alarm', function () { return pz().L > 70; }], ['PZR LEVEL\nLOW', 'alarm', function () { return pz().L < 17; }],
    ['PORV\nOPEN', 'alarm', function () { return pz().porv.some(Boolean); }], ['SAFETY\nVALVE OPEN', 'alarm', function () { return pz().safety; }], ['PRT LEVEL\nHIGH', 'alarm', function () { return pz().prt > 85; }], ['PRT PRESS\nHIGH', 'alarm', function () { return pz().prtP > 4; }], ['HEATERS\nTRIPPED', 'alarm', function () { return pz().L < 17; }], ['LEVEL\nDEVIATION', 'alarm', function () { return Math.abs(pz().L - LPRG(S.p.Tavg)) > 5; }], ['PRESS\nDEVIATION', 'alarm', function () { return Math.abs(pz().P - 155) > 3; }],
    ['BACKUP\nHEATERS ON', 'status', function () { return pz().backup; }], ['SPRAY\nOPEN', 'status', function () { return pz().spray > 0.05; }], ['MASTER\nIN MANUAL', 'status', function () { return pz().master === 'MAN'; }]]));
  dgrp(s, -1.74, 0.06, 0.18, 0.96, 'HEATERS & PORVs'); dgrp(s, 0.1, 1.74, 0.18, 0.96, 'RELIEF ISOLATION');
  swRow(s, -1.6, 0.66, [valveSW('PROP\nHEATERS', function () { return pz().heaters; }, function (v) { pz().heaters = v; }, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF', info: [/x/, 'Pressuriser heaters', 'About 3.4 MW of electric heaters in the bottom of the pressuriser. Boiling more water raises the pressure. They trip off if level falls below 17%, so they can’t burn out uncovered.'] }), null,
    valveSW('PORV 455A\nBLOCK V', function () { return pz().blk[0]; }, function (v) { pz().blk[0] = v; }, { info: [/x/, 'PORV block valve', 'A motor-operated valve in series with each relief valve. If a PORV sticks open, shutting its block valve stops the leak: the lesson of Three Mile Island in 1979.'] }), valveSW('PORV 456\nBLOCK V', function () { return pz().blk[1]; }, function (v) { pz().blk[1] = v; })], 0.15);
  ROT(s, -1.15, 0.28, { t: 'BACKUP HTRS', pos: ['OFF', 'AUTO', 'ON'], get: function () { return ['OFF', 'AUTO', 'ON'].indexOf(pz().bkup); }, set: function (i) { pz().bkup = ['OFF', 'AUTO', 'ON'][i]; } });
  ROT(s, -0.7, 0.28, { t: 'PORV 455A', pos: ['CLOSE', 'AUTO', 'OPEN'], get: function () { return ['CLOSE', 'AUTO', 'OPEN'].indexOf(pz().porvMode[0]); }, set: function (i) { pz().porvMode[0] = ['CLOSE', 'AUTO', 'OPEN'][i]; S.addLog('PORV 455A to ' + pz().porvMode[0]); }, info: [/x/, 'Power-operated relief valve (PORV)', 'Opens automatically at 162.3 bar to stop pressure reaching the safety valves, and recloses at 160.5. Operators can open it by hand to cut pressure fast.', 'At Three Mile Island a PORV stuck open, the light said it was shut, and the reactor lost a third of its coolant.'] });
  ROT(s, -0.3, 0.28, { t: 'PORV 456', pos: ['CLOSE', 'AUTO', 'OPEN'], get: function () { return ['CLOSE', 'AUTO', 'OPEN'].indexOf(pz().porvMode[1]); }, set: function (i) { pz().porvMode[1] = ['CLOSE', 'AUTO', 'OPEN'][i]; S.addLog('PORV 456 to ' + pz().porvMode[1]); } });
  swRow(s, 0.25, 0.66, [valveSW('PRT\nSPRAY', NO, function () {}), valveSW('PRT\nDRAIN', NO, function () {}), valveSW('PRT N₂\nSUPPLY', YES, function () {}), valveSW('AUX SPRAY\nCV-8145', function () { return !!pz().aux; }, function (v) { pz().aux = v; })], 0.135);
  PBN(s, 0.4, 0.28, { col: 0x2f6fd8, lbl: 'PRT\nVENT', tip: 'Vent the pressuriser relief tank to the waste gas system', act: function () { pz().prtP = 0.3; } });
};
/* --------------------------------------------------------------- 5. REACTOR COOLANT --------------------------------------------------------------- */
CONTENT.rcs = function (s) { be(s); var x = X;
  REC(s, 1.2, 1.4, 'LOOP TEMPERATURES', [['THOT', function () { return D.thot; }], ['TCOLD', function () { return D.tcold; }, '#1f5fbf']], 260, 340, '\u00b0C');
  grp(s, -1.74, 0.0, 1.66, 2.33, 'LOOP TEMPERATURES'); grp(s, 0.04, 1.74, 1.66, 2.33, 'REACTOR COOLANT PUMPS'); grp(s, -1.74, 1.74, 1.18, 1.62, 'LOOP FLOW  ·  CORE');
  var th = function (i) { return function () { return D.thot + (i - 1.5) * 0.08; }; }, tc = function (i) { return function () { return D.tcold - (i - 1.5) * 0.06; }; };
  meterRow(s, -1.68, 2.0, [].concat.apply([], L4(function (i) { return [['TH ' + (i + 1), '°C', 260, 340, th(i), 'Loop ' + (i + 1) + ' hot leg temperature', null, { major: 4, minor: 4 }], ['TC ' + (i + 1), '°C', 260, 340, tc(i), 'Loop ' + (i + 1) + ' cold leg temperature', null, { major: 4, minor: 4 }]]; })), 0.098);
  dgRow(s, -1.6, 1.79, L4(function (i) { return ['LOOP ' + (i + 1) + ' TAVG', function () { return ((th(i)() + tc(i)()) / 2).toFixed(1); }]; }), 0.2);
  meterRow(s, 0.1, 2.0, L4(function (i) { return ['AMPS ' + (i + 1), 'A', 0, 1000, function () { return x().rcp[i] * (612 + i * 4) + (x().rcp[i] > 0.05 && x().rcp[i] < 0.95 && x().rcpOn[i] ? 2500 * (1 - x().rcp[i]) : 0); }, 'RCP ' + (i + 1) + ' motor current']; }).concat(
    L4(function (i) { return ['SEAL ' + (i + 1), 'l/min', 0, 30, function () { return x().rcpOn[i] ? 11.5 + i * 0.3 : 0.5; }, 'RCP ' + (i + 1) + ' seal leakoff', [/x/, 'RCP seal leakoff', 'Each pump shaft has a stack of seals; a little water deliberately leaks through them. Too much or too little leakoff means a seal is failing.']]; })), 0.098, { info: [/x/, 'Reactor coolant pumps', 'Four 6 MW pumps, one per loop, each moving about 5 tonnes of water a second. Starting one takes a huge current for about 30 seconds while it gets up to speed.', 'Before starting a pump, operators check oil lift pumps, seal injection and cooling water.'] });
  meterRow(s, -1.68, 1.42, [].concat.apply([], L4(function (i) { return [['FLOW ' + (i + 1), '% FLOW', 0, 120, function () { return x().rcp[i] * 100 + (x().rcp[i] < 0.05 ? 3 : 0); }, 'Loop ' + (i + 1) + ' RCS flow', null, { h: 0.18, major: 6, minor: 2, bands: [[0, 0.75, RD]] }]]; })), 0.098);
  meterRow(s, -1.25 + 0.07, 1.42, [['ΔT', '°C', 0, 50, function () { return D.dT; }, 'Core temperature rise (hot leg minus cold leg)', null, { h: 0.18 }], ['WR P', 'BAR', 0, 200, function () { return x().pz.P + 2; }, 'Wide-range RCS pressure', null, { h: 0.18 }]], 0.098);
  DG(s, -0.75, 1.52, 'CORE EXIT TC MAX °C', function () { return (D.thot + 1.2 * S.p.n * 10).toFixed(1); }, { w: 0.22, name: 'Hottest core exit thermocouple' }); DG(s, -0.75, 1.4, 'SUBCOOLING °C', function () { return D.sub.toFixed(1); }, { w: 0.22, col: '#59e07a' });
  DG(s, -0.75, 1.28, 'RVLIS % (VESSEL LEVEL)', function () { return x().pz.P > 30 ? '100' : '100'; }, { w: 0.22, name: 'Reactor vessel level' });
  lampRow(s, -0.45, 1.5, L4(function (i) { return ['RCP ' + (i + 1) + '\nOIL LIFT', function () { return !!(x().oil && x().oil[i]); }, 0xff3324]; }).concat(L4(function (i) { return ['RCP ' + (i + 1) + '\nRUNNING', function () { return x().rcpOn[i]; }, 0xff3324]; })).concat([['NAT CIRC\nONLY', function () { return x().rcp.every(function (r) { return r < 0.1; }); }, 0xffc94a], ['LOW FLOW\nTRIP ARMED', function () { return S.p.n > 0.1; }, 0xf5f2e6]]), 0.106);
  addAnn(s, annTiles([['RCS FLOW\nLOW TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'LOFLOW'; }], ['OT ΔT\nTRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'OTDT'; }], ['RCP 1\nTRIPPED', 'alarm', function () { return !x().rcpOn[0]; }], ['RCP 2\nTRIPPED', 'alarm', function () { return !x().rcpOn[1]; }], ['RCP 3\nTRIPPED', 'alarm', function () { return !x().rcpOn[2]; }], ['RCP 4\nTRIPPED', 'alarm', function () { return !x().rcpOn[3]; }], ['RCS FLOW\nLOW', 'alarm', function () { return x().rcp.some(function (r) { return r < 0.9; }); }],
    ['SUBCOOLING\nLOW', 'alarm', function () { return D.sub < 15; }], ['TAVG HIGH\n> 310', 'alarm', function () { return S.p.Tavg > 310; }], ['TAVG/TREF\nDEVIATION', 'alarm', function () { return Math.abs(S.p.Tavg - trefC(x())) > 3 && x().tb.mw > 50; }], ['RCP SEAL\nLEAKOFF HI'], ['RCP\nVIBRATION'], ['RCP BEARING\nTEMP HIGH', 'alarm', function () { return x().brgT.some(function (t) { return t > 80; }); }], [''],
    ['RCPs ALL\nRUNNING', 'status', function () { return x().rcpOn.every(Boolean); }], ['NATURAL\nCIRCULATION', 'status', function () { return x().rcp.every(function (r) { return r < 0.1; }); }]]));
  dgrp(s, -1.74, 1.74, 0.18, 0.96, 'REACTOR COOLANT PUMPS  ·  OIL LIFT PUMPS');
  swRow(s, -1.55, 0.66, L4(function (i) { return pumpSW('RCP ' + (i + 1), function () { return X().rcpOn; }, i, 'rcp', { can: function () { var x2 = X(); if (!(x2.oil && x2.oil[i])) return 'start its oil lift pump first (the bearings need oil before the shaft turns).'; if (!(x2.cv.ccp.some(Boolean) || x2.cv.pd)) return 'no seal injection: start a charging pump first.'; return null; }, after: function (v) { if (v) S.toast('RCP ' + (i + 1) + ' starting: watch the motor current surge then settle.'); } }); }), 0.38);
  swRow(s, -1.55, 0.28, L4(function (i) { return valveSW('RCP ' + (i + 1) + '\nOIL LIFT', function () { return !!(X().oil && X().oil[i]); }, function (v) { var x2 = X(); if (!x2.oil) x2.oil = [false, false, false, false]; x2.oil[i] = v; }, { l: 'OFF', r: 'ON', onTxt: 'RUNNING', offTxt: 'OFF' }); }), 0.38);
};
/* --------------------------------------------------------------- 6. STEAM GENERATORS & FEEDWATER --------------------------------------------------------------- */
CONTENT.sg = function (s) { be(s); var x = X, sgi = function (i) { return x().sg[i]; };
  grp(s, -1.74, 1.74, 1.66, 2.33, 'STEAM GENERATORS 1–4: LEVEL  ·  STEAM FLOW  ·  FEED FLOW'); grp(s, -1.74, 1.74, 1.18, 1.62, 'FEED REGULATING VALVES  ·  AUX FEED VALVES  ·  FEED PUMPS');
  L4(function (i) { var x0 = -1.68 + i * 0.88; meterRow(s, x0, 2.0, [['NR ' + (i + 1), '% LEVEL', 0, 100, function () { return sgi(i).L; }, 'Steam generator ' + (i + 1) + ' narrow range level', null, { bands: [[0, 0.17, RD], [0.85, 1, RD]] }], ['WR ' + (i + 1), '% LEVEL', 0, 100, function () { return 35 + sgi(i).Lm * 0.45; }, 'Steam generator ' + (i + 1) + ' wide range level'],
    ['STM ' + (i + 1), '% FLOW', 0, 30, function () { return sgi(i).steam; }, 'SG ' + (i + 1) + ' steam flow', null, { major: 3, minor: 5 }], ['FEED ' + (i + 1), '% FLOW', 0, 30, function () { return sgi(i).feed; }, 'SG ' + (i + 1) + ' feed flow', null, { major: 3, minor: 5 }], ['P ' + (i + 1), 'BAR', 0, 100, function () { return S.p.Ps - 0.1 * i; }, 'Steam generator ' + (i + 1) + ' pressure']], 0.098, { info: [/x/, 'Steam generator', 'A tall heat exchanger with about 5,000 U-shaped tubes. Reactor coolant flows inside the tubes and boils the feedwater outside them. Level must stay between 17% (trip: the tubes could uncover) and 85% (trip: water would reach the turbine).', 'Level shrinks and swells: open the steam valves and level jumps up for a moment as the bubbles grow, even though water is leaving.'] }); });
  L4(function (i) { var x0 = -1.62 + i * 0.88;
    MA(s, x0, 1.4, { t: 'FRV SG ' + (i + 1), mode: function () { return sgi(i).frvMode; }, setMode: function (m) { sgi(i).frvMode = m; sgi(i).frvDem = sgi(i).frv; }, out: function () { return sgi(i).frv; }, pv: function () { return sgi(i).L.toFixed(0) + '%'; }, sp: function () { return '50'; }, raise: function (d, dt) { if (sgi(i).frvMode === 'MAN') sgi(i).frvDem = clamp(sgi(i).frvDem + d * dt * 0.05, 0, 1); },
      info: [/x/, 'Feed regulating valve controller', 'Three-element control: in AUTO it matches feed flow to steam flow and trims it to hold level at 50%. Needs a main feed pump running.'] });
    MA(s, x0 + 0.11, 1.4, { t: 'AFW SG ' + (i + 1), mode: function () { return sgi(i).afwMode; }, setMode: function (m) { sgi(i).afwMode = m; sgi(i).afwDem = sgi(i).afwV; }, out: function () { return sgi(i).afwV; }, pv: function () { return sgi(i).feed.toFixed(1) + '%'; }, raise: function (d, dt) { if (sgi(i).afwMode === 'MAN') sgi(i).afwDem = clamp(sgi(i).afwDem + d * dt * 0.08, 0, 1); },
      info: [/x/, 'Auxiliary feed flow valve', 'Throttles auxiliary feedwater into the steam generator. At hot standby AFW is the only feed, and it keeps level at 50% in AUTO.'] });
    lampRow(s, x0 + 0.25, 1.5, [['LO-LO\n17%', function () { return sgi(i).L < 17; }, 0xff3324], ['HI-HI\n85%', function () { return sgi(i).L > 85; }, 0xff3324], ['FEED\nISOL', function () { return !!x().fwIso; }, 0xffc94a]], 0.09);
    LP(s, x0 + 0.25, 1.33, 'MSIV\nOPEN', function () { return sgi(i).msiv; }, 0xff3324); LP(s, x0 + 0.34, 1.33, 'PORV\nOPEN', function () { return sgi(i).porv; }, 0xff3324); LP(s, x0 + 0.43, 1.33, 'AFW\nFLOW', function () { return sgi(i).feed > 0.3 && !(x().mfp.some(Boolean)); }, 0xf5f2e6); });
  addAnn(s, annTiles([['SG LEVEL\nLO-LO TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'SGLL'; }], ['SG 1 LEVEL\nLOW', 'alarm', function () { return sgi(0).L < 30; }], ['SG 2 LEVEL\nLOW', 'alarm', function () { return sgi(1).L < 30; }], ['SG 3 LEVEL\nLOW', 'alarm', function () { return sgi(2).L < 30; }], ['SG 4 LEVEL\nLOW', 'alarm', function () { return sgi(3).L < 30; }], ['SG LEVEL\nHIGH', 'alarm', function () { return x().sg.some(function (q) { return q.L > 70; }); }], ['SG LEVEL\nHI-HI P-14', 'alarm', function () { return !!x().p14; }],
    ['STEAM/FEED\nMISMATCH', 'alarm', function () { return x().sg.some(function (q) { return Math.abs(q.steam - q.feed) > 4; }); }], ['MFP A\nTRIPPED', 'alarm', function () { return !x().mfp[0]; }], ['MFP B\nTRIPPED', 'alarm', function () { return !x().mfp[1]; }], ['FEEDWATER\nISOLATION', 'alarm', function () { return !!x().fwIso; }], ['AFW PUMP\nRUNNING', 'alarm', function () { return x().mdafw.some(Boolean) || x().tdafw; }], ['FRV IN\nMANUAL', 'alarm', function () { return x().sg.some(function (q) { return q.frvMode === 'MAN'; }); }], [''],
    ['MFP A\nRUNNING', 'status', function () { return x().mfp[0]; }], ['MFP B\nRUNNING', 'status', function () { return x().mfp[1]; }], ['MDAFW A\nRUNNING', 'status', function () { return x().mdafw[0]; }], ['MDAFW B\nRUNNING', 'status', function () { return x().mdafw[1]; }], ['TDAFW\nRUNNING', 'status', function () { return x().tdafw; }]]));
  dgrp(s, -1.74, 0.0, 0.18, 0.96, 'FEED PUMPS'); dgrp(s, 0.04, 1.74, 0.18, 0.96, 'AUXILIARY FEEDWATER & CONDENSATE');
  var mfpCan = function () { var x2 = X(); if (x2.fwIso) return 'feedwater isolation is active: reset it first.'; if (!x2.cond.some(Boolean)) return 'start a condensate pump first (it feeds the main feed pump suction).'; if (x2.p14) return 'SG level is high-high (P-14).'; return null; };
  swRow(s, -1.6, 0.66, [pumpSW('MAIN FEED\nPUMP A', function () { return X().mfp; }, 0, 'mfp', { can: mfpCan, info: [/x/, 'Main feed pumps', 'Big turbine- or motor-driven pumps that push about 1,900 kg of feedwater a second into the steam generators at full power. Above about 5% power, auxiliary feed can’t keep up, so you need one.'] }), pumpSW('MAIN FEED\nPUMP B', function () { return X().mfp; }, 1, 'mfp', { can: mfpCan }),
    pumpSW('COND\nPUMP A', function () { return X().cond; }, 0, 'cond'), pumpSW('COND\nPUMP B', function () { return X().cond; }, 1, 'cond'), valveSW('FEED\nHEATERS', YES, function () {}, { l: 'BYPASS', r: 'IN SERVICE', onTxt: 'IN SERVICE', offTxt: 'BYPASSED' })], 0.135);
  PBN(s, -1.3, 0.28, { col: 0x2f6fd8, lbl: 'FEED ISOL\nRESET', tip: 'Reset feedwater isolation', act: function () { var x2 = X(); if (x2.si.on) { warnOnce('fwr', 'Reset safety injection first.'); return; } if (x2.p14) { warnOnce('fwr2', 'A steam generator is still above 75%.'); return; } x2.fwIso = false; S.addLog('Feedwater isolation reset'); } });
  PBN(s, -1.05, 0.28, { col: 0xd8161a, lbl: 'FEED ISOL\nMANUAL', tip: 'Manual feedwater isolation', act: function () { X().fwIso = true; X().mfp = [false, false]; S.addLog('Feedwater isolated manually'); } });
  swRow(s, 0.18, 0.66, [pumpSW('MD AFW\nPUMP A', function () { return X().mdafw; }, 0, 'mdafw', { info: [/x/, 'Auxiliary feedwater', 'Smaller pumps that feed the steam generators at hot standby and in emergencies. Two are electric (one per safety train) and one is driven by a small steam turbine, so it works even if all electrical power is lost.'] }), pumpSW('MD AFW\nPUMP B', function () { return X().mdafw; }, 1, 'mdafw'),
    valveSW('TD AFW\nSTEAM ADM', function () { return X().tdafw; }, function (v) { X().tdafw = v; }, { l: 'STOP', r: 'START', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('CST TO\nAFW', YES, function () {}), valveSW('SG BLOW-\nDOWN', YES, function () {}), valveSW('BLOWDOWN\nSAMPLE', YES, function () {})], 0.135);
};
/* --------------------------------------------------------------- 7. MAIN STEAM, DUMPS, CONDENSER --------------------------------------------------------------- */
CONTENT.ms = function (s) { be(s); var x = X;
  REC(s, 0.5, 1.4, 'STEAM PRESSURE', [['HEADER', function () { return S.p.Ps; }]], 0, 100, 'bar');
  grp(s, -1.74, -0.36, 1.66, 2.33, 'MAIN STEAM'); grp(s, -0.32, 1.0, 1.66, 2.33, 'STEAM DUMP VALVES (12)'); grp(s, 1.04, 1.74, 1.66, 2.33, 'CONDENSER'); grp(s, -1.74, 1.74, 1.18, 1.62, 'CIRCULATING WATER  ·  INTERLOCKS');
  meterRow(s, -1.68, 2.0, [['HDR P1', 'BAR', 0, 100, function () { return S.p.Ps; }, 'Steam header pressure channel 1'], ['HDR P2', 'BAR', 0, 100, function () { return S.p.Ps + 0.2; }, 'Steam header pressure channel 2'], ['HDR P3', 'BAR', 0, 100, function () { return S.p.Ps - 0.15; }, 'Steam header pressure channel 3'],
    ['STEAM', '% FLOW', 0, 110, function () { return x().sg.reduce(function (a, q) { return a + q.steam; }, 0); }, 'Total steam flow'], ['DUMP D', '% DEMAND', 0, 100, function () { return x().dumpDem * 100; }, 'Steam dump manual demand'], ['DUMPS', '% OPEN', 0, 100, function () { return S.p.dump * 100; }, 'Steam dump valve position'],
    ['1ST STG', 'BAR', 0, 70, function () { return x().tb.steam / FULL * 62; }, 'Turbine first stage pressure (measures turbine load)'], ['TREF', '°C', 285, 315, function () { return trefC(x()); }, 'Reference temperature (from turbine load)', null, { major: 3, minor: 5 }]], 0.098, { info: [/x/, 'Steam dumps', 'Twelve valves that send steam straight to the condenser, skipping the turbine. In STEAM PRESSURE mode they hold the header at 76.3 bar (hot standby). In TAVG mode they open on a big load drop, dumping up to 40% of full steam flow so the reactor doesn’t have to trip.', 'They need condenser vacuum (C-9) and are blocked when Tavg is below 286 °C (P-12), to stop them cooling the reactor down too far.'] });
  for (var k = 0; k < 12; k++) (function (k) { LP(s, -0.24 + (k % 6) * 0.2, k < 6 ? 2.2 : 1.95, 'DUMP\nPCV-' + (500 + k), function () { return S.p.dump > (k + 0.5) / 12; }, 0xff3324); })(k);
  meterRow(s, 1.1, 2.0, [['VAC', 'BAR a', 0, 1, function () { return x().vac; }, 'Condenser back pressure (vacuum)', [/x/, 'Condenser vacuum', 'Steam from the turbine condenses on tubes cooled by sea water, leaving a near vacuum (about 0.06 bar). That vacuum is what lets the turbine extract so much energy. Lose it and the turbine trips.'], { bands: [[0.2, 1, RD]] }], ['HOTWELL', '% LEVEL', 0, 100, function () { return x().hotwell; }, 'Condenser hotwell level'], ['CW IN', '°C', 0, 30, function () { return x().aux.swT; }, 'Circulating water inlet temperature'], ['CW OUT', '°C', 0, 40, function () { return x().aux.swT + 1 + 10 * S.p.dump + x().tb.mw / 120; }, 'Circulating water outlet temperature']], 0.098);
  MA(s, -1.6, 1.4, { t: 'STEAM DUMP\nPRESS CTRL', mode: function () { return x().dumpCtl; }, setMode: function (m) { x().dumpCtl = m; x().dumpDem = S.p.dump; S.addLog('Steam dump pressure controller to ' + m); }, out: function () { return S.p.dump; }, pv: function () { return S.p.Ps.toFixed(1) + ' bar'; }, sp: function () { return PSP.toFixed(1); }, raise: function (d, dt) { if (x().dumpCtl === 'MAN') x().dumpDem = clamp(x().dumpDem + d * dt * 0.05, 0, 1); },
    info: [/x/, 'Steam dump pressure controller', 'In AUTO it opens the dumps to hold steam pressure at 76.3 bar, which holds Tavg at 291.7 °C. In MANUAL you set the dump demand yourself: more steam out means the coolant cools down.'] });
  L4(function (i) { LP(s, -1.38 + i * 0.1, 1.5, 'CW PUMP\n' + 'ABCD'[i], function () { return x().cw[i] && pwr(x(), 'cw', i); }, 0xff3324); });
  lampRow(s, -0.9, 1.5, [['C-9 COND\nAVAILABLE', function () { return x().vac < 0.2 && x().cw.some(Boolean); }, 0xf5f2e6], ['P-12 TAVG\n< 286', function () { return S.p.Tavg < 286; }, 0xffc94a], ['C-7 LOAD\nREJECTION', function () { return false; }, 0xffc94a], ['DUMPS\nARMED', function () { return x().dumpMode !== 'OFF'; }, 0xf5f2e6], ['MSIVs ALL\nOPEN', function () { return x().sg.every(function (q) { return q.msiv; }); }, 0xff3324], ['MSIVs ALL\nCLOSED', function () { return x().sg.every(function (q) { return !q.msiv; }); }, 0x2bd14a], ['SG SAFETY\nVALVE OPEN', function () { return S.p.Ps > 84; }, 0xff3324], ['STM LINE\nPRESS LOW', function () { return S.p.Ps < 41; }, 0xff3324]], 0.12);
  DG(s, 1.2, 1.52, 'STEAM PRESS BAR', function () { return S.p.Ps.toFixed(1); }, { w: 0.18 }); DG(s, 1.42, 1.52, 'VACUUM BAR a', function () { return x().vac.toFixed(3); }, { w: 0.18 }); DG(s, 1.2, 1.4, 'DUMP DEMAND %', function () { return (S.p.dump * 100).toFixed(1); }, { w: 0.18 }); DG(s, 1.42, 1.4, 'TREF °C', function () { return trefC(x()).toFixed(1); }, { w: 0.18, col: '#ffd34a' });
  addAnn(s, annTiles([['STEAM LINE\nPRESS LOW', 'alarm', function () { return S.p.Ps < 41; }], ['STEAM\nPRESS HIGH', 'alarm', function () { return S.p.Ps > 80; }], ['SG SAFETY\nVALVE OPEN', 'alarm', function () { return S.p.Ps > 84; }], ['SG PORV\nOPEN', 'alarm', function () { return x().sg.some(function (q) { return q.porv; }); }], ['MSIV\nCLOSED', 'alarm', function () { return x().sg.some(function (q) { return !q.msiv; }); }], ['COND\nVACUUM LOW', 'alarm', function () { return x().vac > 0.15; }], ['CW PUMP\nTRIP', 'alarm', function () { return x().cw.filter(Boolean).length < 2; }],
    ['STEAM DUMP\nBLOCKED', 'alarm', function () { return x().dumpMode !== 'OFF' && (x().vac > 0.2 || S.p.Tavg < 286); }], ['HOTWELL\nLEVEL LOW'], ['DUMP CTRL\nIN MANUAL', 'alarm', function () { return x().dumpCtl === 'MAN'; }], ['N-16\nHIGH', 'alarm', function () { return !!(X().f && X().f.sgtl); }], [''], [''], [''],
    ['STEAM DUMP\nARMED', 'status', function () { return x().dumpMode !== 'OFF'; }], ['STEAM\nPRESS MODE', 'status', function () { return x().dumpMode === 'PRESS'; }], ['TAVG\nMODE', 'status', function () { return x().dumpMode === 'TAVG'; }], ['DUMPS\nOPEN', 'status', function () { return S.p.dump > 0.03; }]]));
  dgrp(s, -1.74, -0.06, 0.18, 0.96, 'MAIN STEAM ISOLATION'); dgrp(s, -0.02, 1.74, 0.18, 0.96, 'STEAM DUMPS & CIRCULATING WATER');
  swRow(s, -1.6, 0.66, L4(function (i) { return valveSW('MSIV ' + (i + 1), function () { return X().sg[i].msiv; }, function (v) { if (v && Math.abs(S.p.Ps - 76) > 25) { warnOnce('msiv', 'Can’t open against a big pressure difference: warm the line through its bypass first.'); } X().sg[i].msiv = v; }, { info: [/x/, 'Main steam isolation valve', 'A huge fast-closing valve on each steam line, outside containment. It shuts in under 5 seconds to isolate a steam line break, so only one steam generator can blow down.'] }); }), 0.135);
  PBN(s, -1.55, 0.28, { col: 0xd8161a, lbl: 'MSIV\nCLOSE ALL', tip: 'Close all four main steam isolation valves', act: function () { X().sg.forEach(function (q) { q.msiv = false; }); S.addLog('All MSIVs closed'); } });
  L4(function (i) { ROT(s, -1.25 + i * 0.3, 0.28, { t: 'SG ' + (i + 1) + ' PORV', pos: ['CLOSE', 'AUTO', 'OPEN'], get: function () { return ['CLOSE', 'AUTO', 'OPEN'].indexOf(X().sg[i].porvMode); }, set: function (k) { X().sg[i].porvMode = ['CLOSE', 'AUTO', 'OPEN'][k]; S.addLog('SG ' + (i + 1) + ' PORV to ' + X().sg[i].porvMode); },
    info: [/x/, 'Steam generator PORV', 'An atmospheric relief valve on each steam line (the plume of steam you see from outside). In AUTO it opens at 79 bar. With no condenser, it is how operators cool the plant down.'] }); });
  ROT(s, 0.2, 0.62, { t: 'DUMP MODE', pos: ['OFF', 'STM PRESS', 'TAVG'], get: function () { return ['OFF', 'PRESS', 'TAVG'].indexOf(X().dumpMode); }, set: function (k) { X().dumpMode = ['OFF', 'PRESS', 'TAVG'][k]; S.addLog('Steam dump mode to ' + ['OFF', 'STEAM PRESSURE', 'TAVG'][k]); } });
  swRow(s, 0.55, 0.66, L4(function (i) { return pumpSW('CW PUMP\n' + 'ABCD'[i], function () { return X().cw; }, i, 'cw', { info: [/x/, 'Circulating water pumps', 'Pump sea water through the condenser at about 60 tonnes a second. Without at least one, condenser vacuum is lost within a minute or two.'] }); }).concat([valveSW('AIR\nEJECTORS', YES, function () {}, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' })]), 0.135);
  swRow(s, 0.55, 0.28, [valveSW('GLAND\nSTEAM', YES, function () {}), valveSW('VAC\nBREAKER', NO, function (v) { if (v) { X().vac = 1; X().cw = [false, false, false, false]; } }), valveSW('HOTWELL\nMAKE-UP', NO, function () {}), valveSW('DUMP\nISOL', function () { return X().dumpMode !== 'OFF'; }, function (v) { X().dumpMode = v ? 'PRESS' : 'OFF'; })], 0.135);
};
/* --------------------------------------------------------------- 8. TURBINE --------------------------------------------------------------- */
CONTENT.tb = function (s) { be(s); var x = X, tb = function () { return x().tb; };
  REC(s, 1.15, 1.4, 'SPEED & LOAD', [['RPM/36', function () { return x().tb.rpm / 36; }], ['MW/14', function () { return x().tb.mw / 14; }, '#1f5fbf']], 0, 100);
  grp(s, -1.74, -0.1, 1.66, 2.33, 'TURBINE SPEED & VALVES'); grp(s, -0.06, 1.74, 1.66, 2.33, 'TURBINE SUPERVISORY'); grp(s, -1.74, 1.74, 1.18, 1.62, 'LOAD CONTROL  ·  STATUS');
  meterRow(s, -1.68, 2.0, [['SPEED', 'RPM', 0, 3600, function () { return tb().rpm; }, 'Turbine speed', [/x/, 'Turbine speed', 'Roll the turbine up with the speed setpoint: it holds at each target. At 3000 rpm the two-pole generator makes 50 Hz, the frequency of the grid. Above 3300 rpm the overspeed trip fires.'], { major: 6, minor: 2, bands: [[2950 / 3600, 3050 / 3600, GN], [3300 / 3600, 1, RD]] }],
    ['STOP V', '% OPEN', 0, 100, function () { return tb().sv * 100; }, 'HP stop valves'], ['GV 1', '% OPEN', 0, 100, function () { return tb().gv * 100; }, 'Governor valve 1'], ['GV 2', '% OPEN', 0, 100, function () { return tb().gv * 98; }, 'Governor valve 2'], ['GV 3', '% OPEN', 0, 100, function () { return tb().gv * 95; }, 'Governor valve 3'], ['GV 4', '% OPEN', 0, 100, function () { return Math.max(0, tb().gv * 120 - 20); }, 'Governor valve 4'],
    ['1ST STG', 'BAR', 0, 70, function () { return tb().steam / FULL * 62; }, 'First stage pressure'], ['REHEAT', '°C', 0, 300, function () { return tb().latched ? 265 : 60; }, 'Reheat steam temperature']], 0.098);
  meterRow(s, 0.0, 2.0, [['VIB 1', 'µm', 0, 150, function () { return 10 + (tb().rpm > 1200 && tb().rpm < 1600 && !tb().gen ? 55 : 0) + tb().rpm / 300; }, 'Bearing 1 vibration (it rises passing through the critical speed around 1400 rpm)', [/x/, 'Turbine vibration', 'Each turbine rotor has critical speeds where it vibrates more. Operators roll through them quickly and never hold the speed there.']], ['VIB 2', 'µm', 0, 150, function () { return 12 + tb().rpm / 280; }, 'Bearing 2 vibration'], ['VIB 3', 'µm', 0, 150, function () { return 9 + tb().rpm / 320; }, 'Bearing 3 vibration'], ['ECCENT', 'µm', 0, 100, function () { return tb().rpm < 600 ? 25 - tb().rpm / 40 : 8; }, 'Rotor eccentricity'],
    ['LUBE P', 'BAR', 0, 5, function () { return 2.4; }, 'Lube oil pressure'], ['OIL T', '°C', 0, 80, function () { return 42; }, 'Lube oil temperature'], ['EXH T', '°C', 0, 100, function () { return 38 + (tb().latched && !tb().gen ? 20 : 0); }, 'Exhaust hood temperature'], ['EXPAN', 'mm', -5, 15, function () { return tb().latched ? 4 + tb().mw / 300 : 1; }, 'Differential expansion'],
    ['BRG T', '°C', 0, 120, function () { return 60 + tb().rpm / 200; }, 'Hottest bearing metal temperature'], ['HYD P', 'BAR', 0, 200, function () { return 140; }, 'Control oil (EHC) pressure']], 0.098);
  DG(s, -1.6, 1.52, 'SPEED RPM', function () { return String(Math.round(tb().rpm)); }, { w: 0.18 }); DG(s, -1.6, 1.4, 'TARGET RPM', function () { return String(tb().set); }, { w: 0.18, col: '#ffd34a' }); DG(s, -1.6, 1.28, 'RATE RPM/MIN', function () { return String(tb().rate); }, { w: 0.18, col: '#ffd34a' });
  MA(s, -1.32, 1.4, { t: 'LOAD SET\nMW', mode: function () { return 'AUTO'; }, setMode: function () {}, out: function () { return tb().load / 1250; }, pv: function () { return Math.round(tb().mw) + ' MW'; }, sp: function () { return String(Math.round(tb().load)); }, raise: function (d, dt) { tb().load = clamp(tb().load + d * dt * 25, 0, 1250); },
    info: [/x/, 'Load setpoint', 'Once synchronised, raise the load setpoint and the governor valves open to send more steam to the turbine; it ramps at the loading rate. More steam taken means Tavg falls, so rods (in AUTO) or boron have to add reactivity to follow.', 'Real plants load at a few percent a minute so the fuel isn’t stressed.'] });
  DG(s, -1.06, 1.52, 'GEN MW', function () { return String(Math.round(tb().mw)); }, { w: 0.18 }); DG(s, -1.06, 1.4, 'LOAD SET MW', function () { return String(Math.round(tb().load)); }, { w: 0.18, col: '#ffd34a' }); DG(s, -1.06, 1.28, 'LOAD RATE MW/MIN', function () { return String(tb().lrate); }, { w: 0.18, col: '#ffd34a' });
  lampRow(s, -0.7, 1.5, [['TURBINE\nLATCHED', function () { return tb().latched; }, 0xff3324], ['TURBINE\nTRIPPED', function () { return !tb().latched; }, 0x2bd14a], ['TURNING\nGEAR', function () { return tb().tg; }, 0xf5f2e6], ['AT SPEED\n3000', function () { return Math.abs(tb().rpm - 3000) < 15; }, 0xf5f2e6], ['CRITICAL\nSPEED', function () { return tb().rpm > 1200 && tb().rpm < 1600 && !tb().gen; }, 0xffc94a], ['OVERSPEED\nTRIP 3300', function () { return tb().rpm > 3300; }, 0xff3324],
    ['VACUUM\nLOW TRIP', function () { return x().vac > 0.2; }, 0xffc94a], ['P-9\n> 50% PWR', function () { return S.p.n > 0.5; }, 0xf5f2e6], ['C-5\n> 15% LOAD', function () { return tb().mw > 170; }, 0xf5f2e6], ['P-13\n> 10% LOAD', function () { return tb().mw > 115; }, 0xf5f2e6]], 0.12);
  addAnn(s, annTiles([['TURBINE\nTRIP', 'alarm', function () { return !tb().latched && tb().tripWhy !== ''; }], ['TURBINE TRIP\nRX TRIP P-9', 'trip', function () { return S.p.tripped && S.p.firstOut === 'TT'; }], ['OVERSPEED', 'alarm', function () { return tb().rpm > 3200; }], ['VIBRATION\nHIGH', 'alarm', function () { return tb().rpm > 1200 && tb().rpm < 1600 && !tb().gen && tb().latched; }], ['LUBE OIL\nPRESS LOW'], ['EHC OIL\nPRESS LOW'], ['VACUUM\nLOW', 'alarm', function () { return x().vac > 0.15; }],
    ['EXHAUST\nTEMP HIGH', 'alarm', function () { return tb().latched && !tb().gen && tb().rpm > 2500; }], ['ECCENTRICITY\nHIGH', 'alarm', function () { return tb().rpm > 100 && tb().rpm < 600; }], ['TURNING GEAR\nDISENGAGED', 'alarm', function () { return !tb().tg && !tb().latched && tb().rpm < 40; }], ['LOAD\nLIMITER'], [''], [''], [''],
    ['TURBINE\nLATCHED', 'status', function () { return tb().latched; }], ['TURNING\nGEAR ON', 'status', function () { return tb().tg; }], ['AT SPEED', 'status', function () { return Math.abs(tb().rpm - 3000) < 15; }]]));
  dgrp(s, -1.74, 0.0, 0.18, 0.96, 'TURBINE CONTROL'); dgrp(s, 0.04, 1.74, 0.18, 0.96, 'LOAD & AUXILIARIES');
  PBN(s, -1.6, 0.66, { col: 0x2bd14a, lbl: 'LATCH', lit: function () { return tb().latched; }, tip: 'Turbine LATCH (resets the trip and opens the stop valves)', act: function () { var t = tb(); if (t.latched) return; if (x().vac > 0.2) { warnOnce('lat', 'Can’t latch: no condenser vacuum.'); return; } if (!x().sg.some(function (q) { return q.msiv; })) { warnOnce('lat2', 'Can’t roll the turbine with all MSIVs shut.'); return; } t.latched = true; t.trip = false; t.tripWhy = ''; t.tg = false; S.addLog('Turbine latched'); },
    info: [/x/, 'Turbine latch', 'Resets the turbine trip mechanism and opens the stop valves. The turbine then rolls to whatever speed target you choose. The turning gear disengages automatically.'] });
  PBN(s, -1.4, 0.66, { col: 0xd8161a, lbl: 'TURBINE\nTRIP', tip: 'Manual turbine TRIP', act: function () { turbTrip(S.p, 'manual'); } });
  PBN(s, -1.2, 0.66, { col: 0xf5f2e6, lbl: 'TURNING\nGEAR', lit: function () { return tb().tg; }, tip: 'Engage the turning gear (only when the turbine is stopped)', act: function () { var t = tb(); if (t.latched || t.rpm > 50) { warnOnce('tg', 'The turning gear can only engage once the turbine has run down below 50 rpm.'); return; } t.tg = true; } });
  ROT(s, -0.85, 0.62, { t: 'SPEED TARGET', pos: ['0', '500', '1500', '3000'], get: function () { var v = tb().set; return v >= 2900 ? 3 : v >= 1000 ? 2 : v > 0 ? 1 : 0; }, set: function (k) { tb().set = [0, 500, 1500, 3000][k]; S.addLog('Turbine speed target ' + tb().set + ' rpm'); } });
  ROT(s, -0.45, 0.62, { t: 'ACCEL RPM/MIN', pos: ['100', '150', '300'], get: function () { return [100, 150, 300].indexOf(tb().rate); }, set: function (k) { tb().rate = [100, 150, 300][k]; } });
  ROT(s, 0.2, 0.62, { t: 'LOAD RATE MW/MIN', pos: ['10', '30', '60', '120'], get: function () { return [10, 30, 60, 120].indexOf(tb().lrate); }, set: function (k) { tb().lrate = [10, 30, 60, 120][k]; } });
  PBN(s, 0.55, 0.66, { col: 0x2f6fd8, lbl: 'LOAD\nHOLD', tip: 'Hold load where it is', act: function () { tb().load = Math.round(tb().mw); } });
  swRow(s, 0.8, 0.66, [valveSW('LUBE OIL\nPUMP', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('JACKING\nOIL', function () { return tb().rpm < 600; }, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('EHC\nPUMP', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('MSR\nSTEAM', function () { return tb().latched; }, function () {})], 0.135);
  swRow(s, -1.6, 0.28, [valveSW('HP\nDRAINS', function () { return tb().mw < 100; }, function () {}), valveSW('LP\nDRAINS', function () { return tb().mw < 100; }, function () {}), valveSW('EXHAUST\nSPRAY', function () { return tb().latched && !tb().gen; }, function () {}), valveSW('OVERSPEED\nTEST', NO, function () {}, { l: 'NORMAL', r: 'TEST', onTxt: 'TEST', offTxt: 'NORMAL' })], 0.135);
};
/* --------------------------------------------------------------- 9. GENERATOR & GRID --------------------------------------------------------------- */
CONTENT.gen = function (s) { be(s); var x = X, tb = function () { return x().tb; };
  REC(s, 0.85, 1.4, 'GENERATOR OUTPUT', [['MW', function () { return x().tb.mw; }], ['MVAR', function () { return x().tb.mvar; }, '#1f5fbf']], -200, 1400);
  grp(s, -1.74, -0.36, 1.66, 2.33, 'SYNCHRONISING'); grp(s, -0.32, 1.04, 1.66, 2.33, 'GENERATOR'); grp(s, 1.08, 1.74, 1.66, 2.33, '400 kV GRID'); grp(s, -1.74, 1.74, 1.18, 1.62, 'EXCITATION  ·  STATUS');
  onPanel(s, meterR({ lbl: 'SYNCHROSCOPE', unit: 'SLOW ←  → FAST', min: -180, max: 180, major: 2, w: 0.2, h: 0.18, v: function () { return tb().kv > 5 && x().tb.syncSel !== 'OFF' ? tb().phase : 0; }, fmt: function (v) { return v === 0 ? '12' : v > 0 ? '+' : '−'; }, tip: function () { var t = tb(); return 'Synchroscope: ' + (t.syncSel === 'OFF' ? 'off (turn the SYNC selector on)' : t.kv < 5 ? 'dead (generator not excited)' : 'phase ' + Math.round(t.phase) + '°, generator ' + (t.rpm / 60 > GRIDF ? 'fast' : 'slow') + ' by ' + Math.abs(t.rpm / 60 - GRIDF).toFixed(3) + ' Hz'); } }), -1.55, 2.1);
  meterRow(s, -1.3, 2.0, [['GEN Hz', 'Hz', 45, 55, function () { return tb().rpm / 60; }, 'Incoming (generator) frequency', null, { major: 5, minor: 2 }], ['GRID Hz', 'Hz', 45, 55, function () { return D.grid; }, 'Running (grid) frequency', null, { major: 5, minor: 2 }], ['GEN kV', 'kV', 0, 25, function () { return tb().kv; }, 'Incoming voltage'], ['BUS kV', 'kV', 0, 25, function () { return 22 * D.gridV / 400; }, 'Running voltage (grid, stepped down)']], 0.098, { info: [/x/, 'Synchronising', 'Before the generator breaker can close, the generator has to match the grid in voltage, frequency and phase. Run it a little fast, set the voltage to match, then close the breaker as the synchroscope creeps clockwise through 12 o’clock.', 'Close it out of phase and the grid wrenches the generator into step: in real life that can twist the shaft.'] });
  meterRow(s, -0.26, 2.0, [['MW', 'MW', 0, 1400, function () { return tb().mw; }, 'Generator output'], ['MVAR', 'MVAR', -400, 400, function () { return tb().mvar; }, 'Reactive power'], ['AMPS', 'kA', 0, 40, function () { return Math.hypot(tb().mw, tb().mvar) / (Math.sqrt(3) * 22) ; }, 'Stator current'], ['PF', 'COS φ', 0.5, 1, function () { var a = Math.hypot(tb().mw, tb().mvar); return a > 1 ? tb().mw / a : 1; }, 'Power factor', null, { fmt: function (v) { return v.toFixed(2); } }], ['FIELD', 'A', 0, 6000, function () { return tb().exc * 2400 + tb().mvar * 4; }, 'Field current'], ['H₂ P', 'BAR', 0, 6, function () { return 4.1; }, 'Generator hydrogen pressure'], ['STATOR T', '°C', 0, 120, function () { return 40 + tb().mw / 25; }, 'Stator winding temperature']], 0.098);
  meterRow(s, 1.14, 2.0, [['GRID Hz', 'Hz', 49, 51, function () { return D.grid; }, 'National Grid frequency', null, { major: 4, minor: 5, fmt: function (v) { return v.toFixed(1); }, bands: [[0, 0.1, RD], [0.9, 1, RD]] }], ['GRID kV', 'kV', 380, 420, function () { return D.gridV; }, '400 kV grid voltage'], ['EXPORT', 'MW', 0, 1400, function () { return Math.max(0, tb().mw - 60); }, 'Net export to the grid (generator minus the station’s own load)']], 0.098);
  DG(s, -1.6, 1.52, 'PHASE °', function () { return tb().gen ? 'LOCKED' : String(Math.round(tb().phase)); }, { w: 0.18 }); DG(s, -1.6, 1.4, 'SLIP Hz', function () { return (tb().rpm / 60 - GRIDF).toFixed(3); }, { w: 0.18, col: '#ffd34a' });
  MA(s, -1.32, 1.4, { t: 'AVR\nMVAR SET', mode: function () { return tb().field ? 'AUTO' : 'MAN'; }, setMode: function () {}, out: function () { return tb().exc; }, pv: function () { return Math.round(tb().mvar) + ' MVAr'; }, sp: function () { return String(Math.round(tb().mvarSet)); }, raise: function (d, dt) { tb().mvarSet = clamp(tb().mvarSet + d * dt * 15, -300, 400); },
    info: [/x/, 'Automatic voltage regulator', 'Controls the generator’s magnetic field. Before synchronising it sets the voltage; once connected, raising excitation pushes reactive power (MVAr) into the grid, which helps hold grid voltage up.'] });
  lampRow(s, -1.0, 1.5, [['SYNC CHECK\nOK', function () { var t = tb(); return !t.gen && t.syncSel !== 'OFF' && Math.abs(t.rpm / 60 - GRIDF) < 0.15 && Math.abs(t.phase) < 15 && Math.abs(t.kv - 22 * D.gridV / 400) < 1.2; }, 0x2bd14a], ['GEN BKR\nCLOSED', function () { return tb().gen; }, 0xff3324], ['GEN BKR\nOPEN', function () { return !tb().gen; }, 0x2bd14a], ['FIELD BKR\nCLOSED', function () { return tb().field; }, 0xff3324], ['UNIT TX\nSUPPLYING', function () { return x().el.unitTx && tb().gen; }, 0xff3324], ['REVERSE\nPOWER', function () { return tb().gen && !tb().latched; }, 0xffc94a],
    ['LOSS OF\nFIELD', function () { return tb().gen && !tb().field; }, 0xffc94a], ['GRID LINE 1\nIN SERVICE', YES, 0xff3324], ['GRID LINE 2\nIN SERVICE', YES, 0xff3324], ['GRID FREQ\nOUT OF RANGE', function () { return Math.abs(D.grid - 50) > 0.2; }, 0xffc94a]], 0.12);
  addAnn(s, annTiles([['GEN BKR\nOPEN', 'alarm', function () { return !tb().gen; }], ['GEN\nPROTECTION\nTRIP', 'alarm', function () { return !!tb().protTrip; }], ['REVERSE\nPOWER', 'alarm', function () { return tb().gen && !tb().latched; }], ['LOSS OF\nEXCITATION', 'alarm', function () { return tb().gen && !tb().field; }], ['GRID FREQ\nLOW', 'alarm', function () { return D.grid < 49.8; }], ['GRID FREQ\nHIGH', 'alarm', function () { return D.grid > 50.2; }], ['H₂ PRESS\nLOW'],
    ['STATOR\nCOOLING'], ['400 kV LINE\nTRIP'], ['OUT OF STEP'], ['AVR FAULT'], [''], [''], [''], ['GEN ON\nLINE', 'status', function () { return tb().gen; }], ['SYNC\nSELECTED', 'status', function () { return tb().syncSel !== 'OFF'; }], ['FIELD\nON', 'status', function () { return tb().field; }]]));
  dgrp(s, -1.74, 0.36, 0.18, 0.96, 'GENERATOR CIRCUIT BREAKER & FIELD', '#8f1a14'); dgrp(s, 0.4, 1.74, 0.18, 0.96, 'SWITCHYARD');
  ROT(s, -1.55, 0.62, { t: 'SYNC SELECTOR', pos: ['OFF', 'MAN'], get: function () { return tb().syncSel === 'OFF' ? 0 : 1; }, set: function (k) { tb().syncSel = k ? 'MAN' : 'OFF'; } });
  SWC(s, -1.15, 0.62, bkrSW('FIELD\nBREAKER', function () { return tb().field; }, function (v) { tb().field = v; }, { can: function () { return tb().rpm < 2800 ? 'bring the turbine to 3000 rpm before exciting the generator.' : null; } }));
  SWC(s, -0.85, 0.62, bkrSW('GENERATOR\nBREAKER', function () { return tb().gen; }, function (v) {
    var t = tb(), x2 = X(); if (!v) { t.gen = false; x2.el.unitTx = false; S.addLog('Generator breaker opened'); return; }
    var df = Math.abs(t.rpm / 60 - GRIDF), dv = Math.abs(t.kv - 22 * D.gridV / 400), ph = Math.abs(t.phase);
    if (df < 0.15 && ph < 15 && dv < 1.2) { t.gen = true; t.load = Math.max(t.load, 60); t.mw = 0; x2.el.unitTx = true; S.toast('⚡ Synchronised to the National Grid!', 'ok'); speak('Generator synchronised.'); S.addLog('GENERATOR SYNCHRONISED to the 400 kV grid'); }
    else { t.protTrip = true; AUD.sfx('trip'); S.toast('💥 Out-of-phase close! The grid yanked the generator into step and the protection tripped it (Δf ' + df.toFixed(2) + ' Hz, phase ' + Math.round(ph) + '°, ΔV ' + dv.toFixed(1) + ' kV).', 'bad'); S.addLog('Generator breaker closed out of phase: generator protection trip'); turbTrip(S.p, 'generator protection (out-of-phase close)'); t.field = false; setTimeout(function () { t.protTrip = false; }, 30000); }
  }, { can: function () { var t = tb(); if (t.syncSel === 'OFF') return 'turn the SYNC SELECTOR to MAN first.'; if (!t.field) return 'the generator has no field: close the field breaker.'; if (!t.latched) return 'the turbine is tripped.'; return null; },
    info: [/x/, 'Generator circuit breaker', 'Connects the 1,200 MW generator to the grid. Only close it when the sync check light is on: frequencies within 0.15 Hz, voltages matched and the synchroscope near 12 o’clock.'] }));
  PBN(s, -0.5, 0.62, { col: 0x2bd14a, lbl: 'SPEED\nRAISE', tip: 'Raise the turbine speed target by 1 rpm (fine adjustment for synchronising: about 0.017 Hz)', act: function () { var t = tb(); if (t.latched && !t.gen && t.set >= 2900) t.set = Math.min(3060, t.set + 1); else if (t.latched && !t.gen) S.toast('Fine speed adjustment works once the speed target is 3000 rpm.'); } });
  PBN(s, -0.3, 0.62, { col: 0xd8161a, lbl: 'SPEED\nLOWER', tip: 'Lower the turbine speed target by 1 rpm', act: function () { var t = tb(); if (t.latched && !t.gen && t.set >= 2900) t.set = Math.max(2940, t.set - 1); } });
  PBN(s, -0.5, 0.28, { col: 0x2bd14a, lbl: 'VOLTS\nRAISE', tip: 'Raise generator voltage', act: function () { var t = tb(); t.excSet = Math.min(1.1, (t.excSet == null ? 1 : t.excSet) + 0.01); } });
  PBN(s, -0.3, 0.28, { col: 0xd8161a, lbl: 'VOLTS\nLOWER', tip: 'Lower generator voltage', act: function () { var t = tb(); t.excSet = Math.max(0.85, (t.excSet == null ? 1 : t.excSet) - 0.01); } });
  swRow(s, 0.55, 0.66, [bkrSW('400 kV\nLINE 1', YES, function () {}), bkrSW('400 kV\nLINE 2', YES, function () {}), bkrSW('BUS\nSECTION', YES, function () {}), bkrSW('GEN TX\nHV BKR', YES, function () {})], 0.135);
  swRow(s, 0.55, 0.28, [valveSW('GEN H₂\nCOOLERS', YES, function () {}, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' }), valveSW('SEAL OIL\nPUMP', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' }), valveSW('STATOR\nWATER', YES, function () {}, { l: 'STOP', r: 'RUN', onTxt: 'RUNNING', offTxt: 'STOPPED' })], 0.135);
};
/* --------------------------------------------------------------- 10. ELECTRICAL DISTRIBUTION & DIESELS --------------------------------------------------------------- */
CONTENT.elec = function (s) { be(s); var x = X, el = function () { return x().el; };
  REC(s, 0.6, 1.4, 'DIESEL LOAD', [['EDG A kW', function () { return x().el.edg[0].kw; }], ['EDG B kW', function () { return x().el.edg[1].kw; }, '#1f5fbf']], 0, 8000, 'kW'); REC(s, 1.25, 1.4, 'DC BUSES', [['DC A', function () { return x().el.dc[0]; }], ['DC B', function () { return x().el.dc[1]; }, '#1f5fbf']], 100, 140, 'V');
  grp(s, -1.74, 0.2, 1.66, 2.33, 'STATION ELECTRICAL (ONE-LINE)'); grp(s, 0.24, 1.74, 1.66, 2.33, 'EMERGENCY DIESEL GENERATORS'); grp(s, -1.74, 1.74, 1.18, 1.62, 'DC SUPPLIES  ·  BUS STATUS');
  s.mimic.push({ col: '#1f3b57', w: 7, pts: [[-1.6, 2.26], [-0.2, 2.26]] }, { col: '#1f3b57', w: 7, pts: [[-1.3, 2.26], [-1.3, 1.78]] }, { col: '#1f3b57', w: 7, pts: [[-0.5, 2.26], [-0.5, 1.78]] }, { col: '#7d3c98', w: 7, pts: [[-1.55, 1.78], [-0.25, 1.78]] });
  lampRow(s, -1.5, 2.15, [['STATION TX\n(GRID)', function () { return el().stn && el().grid; }, 0xff3324], ['UNIT TX\n(GENERATOR)', function () { return el().unitTx && x().tb.gen; }, 0xff3324], ['11 kV\nBOARD A', function () { return busOn(x(), 'A'); }, 0xf5f2e6], ['11 kV\nBOARD B', function () { return busOn(x(), 'B'); }, 0xf5f2e6]], 0.3);
  lampRow(s, -1.5, 1.9, [['TIE A', function () { return el().tieA; }, 0xff3324], ['3.3 kV SAFETY\nBUS A', function () { return busOn(x(), 'EA'); }, 0xf5f2e6], ['3.3 kV SAFETY\nBUS B', function () { return busOn(x(), 'EB'); }, 0xf5f2e6], ['TIE B', function () { return el().tieB; }, 0xff3324]], 0.3);
  meterRow(s, 0.3, 2.0, [0, 1].map(function (k) { return [['EDG ' + 'AB'[k] + ' RPM', 'RPM', 0, 3600, function () { return el().edg[k].rpm; }, 'Diesel ' + 'AB'[k] + ' speed (a real diesel runs much slower and is geared, shown here as generator rpm)'], ['EDG ' + 'AB'[k] + ' kW', 'kW', 0, 8000, function () { return el().edg[k].kw; }, 'Diesel ' + 'AB'[k] + ' load'], ['EDG ' + 'AB'[k] + ' kV', 'kV', 0, 4, function () { return el().edg[k].rpm > 2800 ? 3.3 : el().edg[k].rpm / 900; }, 'Diesel ' + 'AB'[k] + ' voltage']]; }).reduce(function (a, b) { return a.concat(b); }, []), 0.098,
    { info: [/x/, 'Emergency diesel generators', 'Each safety train has its own diesel, big enough to run every safety pump on that train. They start on loss of power to the safety bus or on safety injection, reach speed in about 10 seconds and close onto the dead bus by themselves.', 'They are test-run every month: a station blackout (no grid and no diesels) is one of the most serious events there is.'] });
  meterRow(s, 0.9, 2.0, [['11kV A', 'kV', 0, 14, function () { return busOn(x(), 'A') ? 11.1 : 0; }, '11 kV unit board A voltage'], ['11kV B', 'kV', 0, 14, function () { return busOn(x(), 'B') ? 11.0 : 0; }, '11 kV unit board B voltage'], ['3.3 A', 'kV', 0, 4, function () { return busOn(x(), 'EA') ? 3.3 : 0; }, 'Safety bus A voltage'], ['3.3 B', 'kV', 0, 4, function () { return busOn(x(), 'EB') ? 3.3 : 0; }, 'Safety bus B voltage'], ['DC A', 'V', 100, 140, function () { return el().dc[0]; }, '125 V DC bus A'], ['DC B', 'V', 100, 140, function () { return el().dc[1]; }, '125 V DC bus B']], 0.085, { w: 0.078 });
  lampRow(s, -1.55, 1.5, [['EDG A\nRUNNING', function () { return el().edg[0].run; }, 0xff3324], ['EDG A\nAT SPEED', function () { return el().edg[0].rpm > 2900; }, 0xf5f2e6], ['EDG A BKR\nCLOSED', function () { return el().edg[0].bkr; }, 0xff3324], ['EDG B\nRUNNING', function () { return el().edg[1].run; }, 0xff3324], ['EDG B\nAT SPEED', function () { return el().edg[1].rpm > 2900; }, 0xf5f2e6], ['EDG B BKR\nCLOSED', function () { return el().edg[1].bkr; }, 0xff3324],
    ['OFFSITE\nPOWER', function () { return el().grid && el().stn; }, 0x2bd14a], ['BATT A\nCHARGING', function () { return el().chg[0]; }, 0xff3324], ['BATT B\nCHARGING', function () { return el().chg[1]; }, 0xff3324], ['UPS A\nNORMAL', YES, 0x2bd14a], ['UPS B\nNORMAL', YES, 0x2bd14a], ['STATION\nBLACKOUT', function () { return !busOn(x(), 'EA') && !busOn(x(), 'EB'); }, 0xff3324]], 0.13);
  addAnn(s, annTiles([['11 kV BD A\nUNDERVOLT', 'alarm', function () { return !busOn(x(), 'A'); }], ['11 kV BD B\nUNDERVOLT', 'alarm', function () { return !busOn(x(), 'B'); }], ['SAFETY BUS A\nUNDERVOLT', 'alarm', function () { return !busOn(x(), 'EA'); }], ['SAFETY BUS B\nUNDERVOLT', 'alarm', function () { return !busOn(x(), 'EB'); }], ['EDG A\nRUNNING', 'alarm', function () { return el().edg[0].run; }], ['EDG B\nRUNNING', 'alarm', function () { return el().edg[1].run; }], ['LOSS OF\nOFFSITE PWR', 'alarm', function () { return !(el().stn && el().grid); }],
    ['DC BUS A\nLOW VOLTS', 'alarm', function () { return el().dc[0] < 124; }], ['DC BUS B\nLOW VOLTS', 'alarm', function () { return el().dc[1] < 124; }], ['STATION\nBLACKOUT', 'alarm', function () { return !busOn(x(), 'EA') && !busOn(x(), 'EB'); }], ['EDG A\nFAIL TO START'], ['EDG B\nFAIL TO START'], ['TRANSFORMER\nFAULT'], [''],
    ['EDG A\nIN AUTO', 'status', function () { return el().edg[0].mode === 'AUTO'; }], ['EDG B\nIN AUTO', 'status', function () { return el().edg[1].mode === 'AUTO'; }], ['OFFSITE\nAVAILABLE', 'status', function () { return el().grid; }]]));
  dgrp(s, -1.74, 0.16, 0.18, 0.96, 'BREAKERS', '#8f1a14'); dgrp(s, 0.2, 1.74, 0.18, 0.96, 'DIESELS & BATTERIES');
  swRow(s, -1.6, 0.66, [bkrSW('STATION TX\nBREAKER', function () { return el().stn; }, function (v) { el().stn = v; }, { info: [/x/, 'Station transformer breaker', 'Feeds the station’s own pumps and fans from the grid when the generator isn’t running. Open it with the generator off and you cause a loss of offsite power: reactor coolant pumps, feed pumps and condenser pumps all stop, and the diesels start.'] }),
    bkrSW('UNIT TX\nBREAKER', function () { return el().unitTx; }, function (v) { el().unitTx = v; }, { can: function () { return !X().tb.gen ? 'the generator isn’t connected, so the unit transformer has nothing to supply.' : null; } }),
    bkrSW('11 kV BD A\nINCOMER', function () { return el().busA; }, function (v) { el().busA = v; }), bkrSW('11 kV BD B\nINCOMER', function () { return el().busB; }, function (v) { el().busB = v; }),
    bkrSW('SAFETY\nTIE A', function () { return el().tieA; }, function (v) { el().tieA = v; }, { can: function () { return el().edg[0].bkr ? 'diesel A is supplying the bus: open its breaker first (they aren’t synchronised).' : null; } }), bkrSW('SAFETY\nTIE B', function () { return el().tieB; }, function (v) { el().tieB = v; }, { can: function () { return el().edg[1].bkr ? 'diesel B is supplying the bus: open its breaker first.' : null; } })], 0.135);
  swRow(s, 0.35, 0.66, [0, 1].map(function (k) { return valveSW('EDG ' + 'AB'[k], function () { return el().edg[k].run; }, function (v) { el().edg[k].run = v; if (!v) el().edg[k].bkr = false; }, { l: 'STOP', r: 'START', onTxt: 'RUNNING', offTxt: 'STOPPED' }); }).concat([0, 1].map(function (k) { return bkrSW('EDG ' + 'AB'[k] + '\nBREAKER', function () { return el().edg[k].bkr; }, function (v) { el().edg[k].bkr = v; if (v) { if (k) el().tieB = false; else el().tieA = false; } }, { can: function () { var g = el().edg[k]; if (g.rpm < 2900) return 'the diesel isn’t up to speed.'; if ((k ? el().tieB : el().tieA) && busOn(X(), k ? 'B' : 'A')) return 'the bus is live from offsite power: this diesel can only close onto a dead bus.'; return null; } }); })), 0.135);
  [0, 1].forEach(function (k) { ROT(s, 0.45 + k * 0.32, 0.26, { t: 'EDG ' + 'AB'[k] + ' MODE', pos: ['MAN', 'AUTO'], get: function () { return el().edg[k].mode === 'AUTO' ? 1 : 0; }, set: function (i) { el().edg[k].mode = i ? 'AUTO' : 'MAN'; } }); });
  swRow(s, 1.2, 0.28, [valveSW('CHARGER\nA', function () { return el().chg[0]; }, function (v) { el().chg[0] = v; }, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' }), valveSW('CHARGER\nB', function () { return el().chg[1]; }, function (v) { el().chg[1] = v; }, { l: 'OFF', r: 'ON', onTxt: 'ON', offTxt: 'OFF' }), valveSW('UPS\nBYPASS', NO, function () {})], 0.135);
};

/* ================================================================ what's in the simulator ================================================================ */
var ROAD = [
  { t: 'Reactor startup', s: 'now', d: 'Pre-startup checks, trip breakers, rods, nuclear instruments, the 1/M plot, criticality, P-6 and the point of adding heat. Guided checklist.' },
  { t: 'Reactor shutdown', s: 'now', d: 'Rods in, source range back on, trip breakers open. Guided checklist.' },
  { t: 'The full control room', s: 'now', d: '11 boards, every control working: safety injection, cooling water, boron, pressuriser, coolant pumps, steam generators, steam dumps, turbine, generator & grid, electrics and diesels.' },
  { t: 'Power ascension', s: 'now', d: 'Main feed pumps, roll the turbine to 3000 rpm, synchronise to the 400 kV grid, P-10 blocks, rods in AUTO and boron dilution, up to 50% power. Guided checklist (GOP-302).' },
  { t: 'Faults & emergencies', s: 'now', d: 'Seven instructor faults with what you\u2019ll see and how to respond: loss of offsite power, stuck-open PORV, feed pump trip, loss of air, loss of cooling water, SG tube leak, condenser loss. Or a secret one.' },
  { t: 'Walk the station', s: 'soon', d: 'The reactor building, turbine hall, cooling water and the switchyard.' },
  { t: 'Shifts & scoring', s: 'soon', d: 'Full shifts from cold shutdown to full power, with scores and ranks.' }
];

/* ================================================================ the checklists ================================================================
   Three procedures, like the real binders: pre-startup checks (you look at the right instrument and tick each one),
   the reactor startup (GOP-301) and the reactor shutdown (GOP-303). Startup and shutdown steps tick themselves when the plant gets there. */
var MS = { pre: [], done: [], shut: [], cur: 0, scur: 0, surT: 0, poT: 0, complete: false, free: false, shutOn: false, shutDone: false, preSkipped: false, practice: false, orderBad: false, shutTrips: 0, view: 'step', tab: null };
var STEPS = [
  { t: 'Close reactor trip breakers A and B', show: 'rtb',
    h: 'On the REACTOR desk, turn the <b>RTB A</b> and <b>RTB B</b> handles to the right (CLOSE). The red lamp means closed. The breakers power the rod drive mechanisms: while they are open, every rod is held at the bottom by gravity.',
    st: function (p) { return 'RTB A ' + (p.rtb[0] ? 'CLOSED' : 'open') + ' · RTB B ' + (p.rtb[1] ? 'CLOSED' : 'open'); }, ok: function (p) { return p.rtb[0] && p.rtb[1]; } },
  { t: 'Withdraw shutdown banks SA, SB, SC and SD to 228 steps', show: 'rods',
    h: 'Turn the <b>BANK SELECTOR</b> to <b>SA</b> and hold the lever at <b>OUT</b> until SA shows 228 steps, then do SB, SC and SD. Shutdown banks are pulled right out first so they are ready to drop if anything goes wrong. Watch the source range counts creep up as each bank comes out. Tip: use ×5 or ×20 time.',
    st: function (p) { return SDB.map(function (b) { return b + ' ' + Math.round(p.rods[b]); }).join(' · ') + ' · N31 ' + Math.round(NI.sr[0]) + ' cps'; }, ok: function (p) { return SDB.every(function (b) { return p.rods[b] >= TOP; }); } },
  { t: 'In MAN, pull the control banks and plot 1/M until the reactor is critical', show: 'onem',
    h: 'Turn the selector to <b>MAN</b> and pull about 20–50 steps at a time. After each pull let go and wait about 25 seconds: the counts rise and settle, and a point is plotted on the <b>1/M screen</b> on the console. The line through the points shows where the reactor will go critical (the estimate is bank D at 120). Near criticality pull only a few steps at a time. You are critical when the counts keep rising with the rods still.',
    st: function (p) { var pr = ecpFromOneM(p); return pcName(p.pc) + ' · 1/M points ' + Math.max(0, p.oneM.length - 1) + (pr != null ? ' · predicted critical: ' + pcName(Math.min(pr, PCMAX)) : '') + ' · N31 ' + Math.round(NI.sr[0]) + ' cps'; }, ok: function (p) { return p.everCrit; } },
  { t: 'Hold a steady startup rate between 0.3 and 1.0 DPM for 20 seconds', show: 'nis',
    h: 'Startup rate (SUR) is how fast power is rising, in decades per minute: 1 DPM means ten times more power every minute. Pull a few steps to raise it, insert a few to lower it, then let go and watch the <b>SUR meters</b> on the NIS panel. Above 1 DPM sets off an alarm.',
    st: function (p) { return 'SUR ' + p.sur.toFixed(2) + ' DPM · steady ' + Math.floor(MS.surT) + ' / 20 s'; }, ok: function (p) { return MS.surT >= 20; } },
  { t: 'When P-6 lights, block both source range trips before 100,000 cps', show: 'srblk', early: true,
    h: 'As power rises, the intermediate range reaches 1E-10 A and the white <b>P-6</b> lamp lights (at about 30,000 cps). Press <b>SR TRIP BLOCK</b> train A and train B. This switches the source range detectors off so they don’t trip the reactor at 100,000 cps. Miss it and the reactor trips.',
    st: function (p) { return p6(p) ? 'P-6 LIT · N31 ' + Math.round(NI.sr[0]).toLocaleString('en-GB') + ' cps (trip at 100,000)' : 'P-6 not yet · IR ' + fmtSci(NI.ir[0], 2) + ' A (P-6 at 1.0E-10 A)'; }, ok: function (p) { return p.srBlk[0] && p.srBlk[1]; } },
  { t: 'Level off at the point of adding heat: 0.5–5% power, startup rate near zero for 30 s', show: 'params',
    h: 'At about 1% power the fuel and coolant start to heat up: <b>Tavg</b> rises above 291.7 °C and the negative temperature feedback slows the rise in power. Insert rods a few steps at a time to bring SUR to zero, and hold power between 0.5% and 5% (Mode 2) for 30 seconds.',
    st: function (p) { return 'Power ' + D.pr.toFixed(2) + '% · SUR ' + p.sur.toFixed(2) + ' · Tavg ' + p.Tavg.toFixed(1) + ' °C · steady ' + Math.floor(MS.poT) + ' / 30 s'; }, ok: function (p) { return MS.poT >= 30 && p.srBlk[0] && p.srBlk[1]; } }
];
var PRE = [
  { t: 'Plant is in Mode 3 (hot standby)', show: 'params', h: 'Find the <b>PLANT MODE</b> display on the reactor parameters panel.', st: function () { return 'PLANT MODE reads MODE ' + D.mode; }, ok: function () { return D.mode === 3; } },
  { t: 'Tavg is at no-load temperature, 291–293 °C', show: 'params', h: 'Read the <b>TAVG</b> meter and display on the reactor board.', st: function (p) { return 'Tavg ' + p.Tavg.toFixed(1) + ' °C'; }, ok: function (p) { return p.Tavg >= 291 && p.Tavg <= 293; } },
  { t: 'RCS pressure is normal, 153–157 bar', show: 'pzr', h: 'Read the four <b>PT-455…458</b> pressure meters on the pressuriser board (second board left of the reactor).', st: function (p) { return 'Pressuriser pressure ' + p.rcs.toFixed(1) + ' bar'; }, ok: function (p) { return p.rcs >= 153 && p.rcs <= 157; } },
  { t: 'Pressuriser level is on programme, 20–30%', show: 'pzr', h: 'Read the three <b>LT-461…463</b> level meters on the pressuriser board.', st: function (p) { return 'Pressuriser level ' + p.pzr.toFixed(1) + '%'; }, ok: function (p) { return p.pzr >= 20 && p.pzr <= 30; } },
  { t: 'All four reactor coolant pumps are running', show: 'rcs', h: 'Check the red <b>RCP RUNNING</b> lights and the four pump currents on the reactor coolant board, just left of the reactor board.', st: function (p) { return p.x.rcpOn.filter(Boolean).length + ' of 4 RCPs running'; }, ok: function (p) { return p.x.rcpOn.every(Boolean); } },
  { t: 'Steam dumps in STEAM PRESSURE mode, holding 76.3 bar', show: 'ms', h: 'On the main steam board, check the <b>DUMP MODE</b> selector is on STM PRESS, the controller is in AUTO, and steam pressure is 76.3 bar.', st: function (p) { return 'Dump mode ' + p.x.dumpMode + ' / ' + p.x.dumpCtl + ', steam pressure ' + p.Ps.toFixed(1) + ' bar'; }, ok: function (p) { return p.x.dumpMode === 'PRESS' && Math.abs(p.Ps - PSP) < 1.5; } },
  { t: 'RCS boron matches the ECP sheet: 1200 ppm', show: 'cvcs', h: 'Read <b>RCS BORON PPM</b> on the chemical &amp; volume control board (third from the left). The estimated critical position was worked out for 1200 ppm.', st: function (p) { return 'RCS boron ' + Math.round(p.boron) + ' ppm'; }, ok: function (p) { return Math.abs(p.boron - BORON0) < 10; } },
  { t: 'Both source range channels are counting', show: 'nis', h: '<b>N31</b> and <b>N32</b> should both read tens of counts per second. You must be able to see neutrons before you pull any rods.', st: function () { return 'N31 ' + Math.round(NI.sr[0]) + ' cps · N32 ' + Math.round(NI.sr[1]) + ' cps'; }, ok: function (p) { return !p.srBlk[0] && !p.srBlk[1] && NI.sr[0] > 2 && NI.sr[1] > 2; } },
  { t: 'Source range audio is on', show: 'audio', h: 'The <b>SR AUDIO</b> switch on the reactor desk should be ON, so you can hear the count rate rise.', st: function (p) { return 'SR audio ' + (p.audio ? 'ON' : 'OFF'); }, ok: function (p) { return p.audio; } },
  { t: 'All rods at the bottom, trip breakers open', show: 'rods', h: 'On the DRPI every rod should show its red bottom light, and <b>RTB A</b> and <b>RTB B</b> should be open (green lamps).', st: function (p) { return (BANKS.every(function (b) { return p.rods[b] <= 0; }) ? 'all rods in' : 'rods NOT all in') + ' · RTBs ' + (p.rtb[0] || p.rtb[1] ? 'not both open' : 'both open'); }, ok: function (p) { return BANKS.every(function (b) { return p.rods[b] <= 0; }) && !p.rtb[0] && !p.rtb[1]; } },
  { t: 'No unacknowledged alarms', show: 'ann', h: 'Nothing on the annunciator windows should be fast-flashing. If something is, press <b>ACK</b> and read it.', st: function () { var n = ANNC.count(); return n ? n + ' alarm' + (n > 1 ? 's' : '') + ' flashing' : 'all acknowledged'; }, ok: function () { return ANNC.count() === 0; } },
  { t: 'Estimated critical position read: bank D at 120 steps', show: 'onem', h: 'The middle console screen shows the <b>ECP</b> from the reactor engineer. The reactor should go critical within ±500 pcm of it.', st: function () { return 'ECP: control bank D at 120 steps'; }, ok: YES }
];
var SHUT = [
  { t: 'Insert the control banks until power is below P-6', show: 'rodctl', h: 'Select <b>MAN</b> and hold the lever at <b>IN</b>. Power falls as the rods go in. Keep going until the white <b>P-6</b> lamp goes out (intermediate range below 1E-10 A).', st: function (p) { return pcName(p.pc) + ' · IR ' + fmtSci(NI.ir[0], 2) + ' A · P-6 ' + (p6(p) ? 'LIT' : 'out'); }, ok: function (p) { return !p6(p); } },
  { t: 'Check the source range has switched back on', show: 'nis', h: 'Below P-6 the source range blocks reset by themselves and <b>N31/N32</b> come back on. Check both are counting and the SR TRIP BLOCKED lights are out.', st: function (p) { return 'N31 ' + (p.srBlk[0] ? 'blocked' : Math.round(NI.sr[0]).toLocaleString('en-GB') + ' cps') + ' · N32 ' + (p.srBlk[1] ? 'blocked' : Math.round(NI.sr[1]).toLocaleString('en-GB') + ' cps'); }, ok: function (p) { return !p.srBlk[0] && !p.srBlk[1] && NI.sr[0] < 1e5; } },
  { t: 'Insert all four control banks fully', show: 'rodctl', h: 'Keep the selector on <b>MAN</b> and hold <b>IN</b> until the counters show every control bank at 0 steps.', st: function (p) { return pcName(p.pc); }, ok: function (p) { return p.pc <= 0; } },
  { t: 'Insert shutdown banks SD, SC, SB and SA', show: 'rodctl', h: 'Turn the selector to <b>SD</b> and hold <b>IN</b> to 0 steps, then SC, SB and SA: the reverse of the order they came out.', st: function (p) { return SDB.map(function (b) { return b + ' ' + Math.round(p.rods[b]); }).join(' · '); }, ok: function (p) { return SDB.every(function (b) { return p.rods[b] <= 0; }); } },
  { t: 'Open reactor trip breakers A and B', show: 'rtb', h: 'Turn <b>RTB A</b> and <b>RTB B</b> to the left (TRIP). Every rod is already in, so nothing moves: this takes power off the rod drives so no rod can be pulled by mistake.', st: function (p) { return 'RTB A ' + (p.rtb[0] ? 'closed' : 'OPEN') + ' · RTB B ' + (p.rtb[1] ? 'closed' : 'OPEN'); }, ok: function (p) { return !p.rtb[0] && !p.rtb[1]; } },
  { t: 'Confirm the reactor is shut down: counts below 1,000 cps', show: 'nis', h: 'Watch <b>N31</b> fall back towards source level (about 90 cps) with the startup rate near −1/3 DPM. That’s the reactor safely shut down in Mode 3.', st: function (p) { return 'N31 ' + Math.round(NI.sr[0]).toLocaleString('en-GB') + ' cps · SUR ' + p.sur.toFixed(2) + ' · Mode ' + D.mode; }, ok: function (p) { return NI.sr[0] < 1000 && D.mode === 3 && !p.rtb[0] && !p.rtb[1]; } }
];
var ASC = [
  { t: 'Start a main feed pump', show: 'sgD', h: 'Above about 5% power the auxiliary feed pumps can’t keep up. On the <b>steam generators &amp; feedwater</b> board, check a condensate pump is running, then turn <b>MAIN FEED PUMP A</b> to START. The feed regulating valves in AUTO take over level control.', st: function (p) { var x = p.x; return 'Condensate ' + x.cond.filter(Boolean).length + '/2 · MFP A ' + (x.mfp[0] ? 'RUNNING' : 'stopped') + ' · MFP B ' + (x.mfp[1] ? 'RUNNING' : 'stopped'); }, ok: function (p) { return p.x.mfp.some(Boolean); } },
  { t: 'Latch the turbine and roll it to 3000 rpm', show: 'tbD', h: 'On the <b>turbine</b> board press <b>LATCH</b>, set <b>ACCEL</b> to 300 rpm/min and turn <b>SPEED TARGET</b> to 3000. Watch the vibration as it passes the critical speed around 1400 rpm. Keep Tavg up with the rods: the turbine now takes a little steam.', st: function (p) { var t = p.x.tb; return (t.latched ? 'LATCHED' : 'tripped') + ' · ' + Math.round(t.rpm) + ' rpm (target ' + t.set + ')'; }, ok: function (p) { var t = p.x.tb; return t.latched && Math.abs(t.rpm - 3000) < 15 || t.gen; } },
  { t: 'Excite the generator and synchronise to the grid', show: 'genD', h: 'On the <b>generator</b> board close the <b>FIELD BREAKER</b> (voltage builds to about 22 kV) and turn the <b>SYNC SELECTOR</b> to MAN. Press <b>SPEED RAISE</b> two or three times so the synchroscope turns slowly clockwise. When the <b>SYNC CHECK OK</b> lamp lights, near 12 o’clock, close the <b>GENERATOR BREAKER</b>.', st: function (p) { var t = p.x.tb; return 'Field ' + (t.field ? 'ON' : 'off') + ' · ' + t.kv.toFixed(1) + ' kV · sync ' + t.syncSel + ' · slip ' + (t.rpm / 60 - 50).toFixed(3) + ' Hz · phase ' + Math.round(t.phase) + '°'; }, ok: function (p) { return p.x.tb.gen; } },
  { t: 'Steam dumps to TAVG mode and rods to AUTO', show: 'msD', h: 'On the <b>main steam</b> board turn <b>DUMP MODE</b> to TAVG, so the dumps only open on a big load drop. Then on the reactor desk turn the <b>BANK SELECTOR</b> to AUTO: above 15% load (C-5) the rods follow Tavg to Tref by themselves.', st: function (p) { return 'Dump mode ' + p.x.dumpMode + ' · rod control ' + p.sel; }, ok: function (p) { return p.x.dumpMode === 'TAVG' && p.sel === 'AUTO'; } },
  { t: 'Raise load; at P-10 block the IR and power range low trips', show: 'p10', h: 'On the turbine board hold <b>LOAD SET ▲</b> to about 300 MW. As power passes 10% the white <b>P-10</b> lamp lights on the front of the reactor desk: press all four <b>P-10 BLOCK</b> buttons (IR train A and B, PR low train A and B) before power reaches 25%, or the reactor trips.', st: function (p) { return 'Power ' + D.pr.toFixed(1) + '% · P-10 ' + (p10(p) ? 'LIT' : 'out') + ' · IR blocks ' + (p.irBlk || []).filter(Boolean).length + '/2 · PR low blocks ' + (p.prBlk || []).filter(Boolean).length + '/2'; }, ok: function (p) { return blkd(p, 'irBlk') && blkd(p, 'prBlk'); } },
  { t: 'Start the second main feed pump and load to 30% (345 MW)', show: 'sgD', h: 'One feed pump can only carry about half power. Start <b>MAIN FEED PUMP B</b>, then keep raising the <b>LOAD SET</b>. Load at 30–60 MW a minute so the fuel isn’t stressed.', st: function (p) { var x = p.x; return 'MFPs ' + x.mfp.filter(Boolean).length + '/2 · ' + Math.round(x.tb.mw) + ' MW'; }, ok: function (p) { return p.x.mfp.every(Boolean) && p.x.tb.mw >= 345; } },
  { t: 'Load to 50% (575 MW) with Tavg on Tref for 60 s, diluting boron as needed', show: 'cvcsD', h: 'As power rises, hotter fuel and coolant take reactivity away, so the AUTO rods keep coming out. Before they reach the top, <b>dilute</b> on the chemical &amp; volume control board: MAKE-UP MODE to DIL, flow 20–40, a batch of 2000–5000 litres, START. Hold Tavg within 2 °C of Tref at 575 MW or more for a minute.', st: function (p) { var x = p.x, tr = trefC(x); return Math.round(x.tb.mw) + ' MW · Tavg ' + p.Tavg.toFixed(1) + ' / Tref ' + tr.toFixed(1) + ' °C · ' + pcName(p.pc) + ' · boron ' + Math.round(p.boron) + ' ppm · steady ' + Math.floor(MS.ascT) + '/60 s'; }, ok: function (p) { return MS.ascT >= 60; } }
];
var PHASES = [{ id: 'pre', t: 'Pre-startup checks', short: 'Pre-startup', code: 'GOP-301 §4', list: PRE, fl: 'pre' }, { id: 'start', t: 'Reactor startup', short: 'Startup', code: 'GOP-301', list: STEPS, fl: 'done' }, { id: 'asc', t: 'Power ascension', short: 'To power', code: 'GOP-302', list: ASC, fl: 'asc' }, { id: 'shut', t: 'Reactor shutdown', short: 'Shutdown', code: 'GOP-303', list: SHUT, fl: 'shut' }];
function phaseDef(id) { return PHASES.filter(function (x) { return x.id === id; })[0] || PHASES[1]; }
function firstOpen(list, fl) { var i = 0; while (i < list.length && fl[i]) i++; return i; }
function countDone(fl, n) { var c = 0; for (var i = 0; i < n; i++) if (fl[i]) c++; return c; }
MS.preAll = function () { return countDone(MS.pre, PRE.length) === PRE.length; };
MS.phase = function () { if (MS.shutOn && !MS.shutDone) return 'shut'; if (MS.ascOn && !MS.ascDone) return 'asc'; if (MS.free || MS.complete) return 'free'; return MS.preAll() || MS.preSkipped ? 'start' : 'pre'; };
MS.steps = function () { var ph = MS.phase(), P = phaseDef(ph === 'free' ? (MS.shutDone ? 'shut' : MS.ascDone ? 'asc' : 'start') : ph), fl = MS[P.fl], cur = firstOpen(P.list, fl);
  return { P: P, items: P.list.map(function (s, i) { return { t: s.t, state: fl[i] ? 'done' : i === cur && ph !== 'free' ? 'cur' : 'todo' }; }) }; };
MS.reset = function () { MS.pre = []; MS.done = []; MS.shut = []; MS.cur = 0; MS.scur = 0; MS.surT = 0; MS.poT = 0; MS.complete = false; MS.free = false; MS.shutOn = false; MS.shutDone = false; MS.preSkipped = false; MS.practice = false; MS.orderBad = false; MS.shutTrips = 0; MS.view = 'step'; MS.tab = null; MS.asc = []; MS.ascOn = false; MS.ascDone = false; MS.ascT = 0; MS.ascTrips = 0; };
MS.resetStart = function () { MS.done = []; MS.cur = 0; MS.surT = 0; MS.poT = 0; };
MS.tick = function (dt) {
  var p = S.p, ph = MS.phase(), i, j, prev;
  if (ph === 'pre' || ph === 'start') {
    if (MS.done[2]) { if (p.sur >= 0.3 && p.sur <= 1.0 && !p.tripped) MS.surT += dt; else MS.surT = 0; }
    if (D.pr >= 0.5 && D.pr <= 5 && Math.abs(p.sur) < 0.1 && !p.tripped) MS.poT += dt; else MS.poT = 0;
    for (i = 0; i < STEPS.length; i++) {
      if (MS.done[i]) continue; prev = true; for (j = 0; j < i; j++) if (!MS.done[j]) prev = false;
      if ((prev || (STEPS[i].early && MS.done[2])) && STEPS[i].ok(p)) { MS.done[i] = true; if (ph === 'pre' && !MS.preSkipped) { MS.preSkipped = true; warnOnce('preskip', 'Procedure: you started before finishing the pre-startup checklist. Real operators tick every check first.', 30); } stepDone(STEPS, i); }
    }
    MS.cur = firstOpen(STEPS, MS.done); if (MS.cur >= STEPS.length) finish();
  } else if (ph === 'asc') {
    var xx = p.x; if (xx.tb.mw >= 570 && Math.abs(p.Tavg - trefC(xx)) < 2 && !p.tripped) MS.ascT += dt; else MS.ascT = 0;
    if (p.tripped) { MS.ascOn = false; MS.ascTrips++; S.addLog('Power ascension abandoned: reactor trip'); HUD.dirty = true; HUD.el.ms.dataset.cur = ''; return; }
    for (i = 0; i < ASC.length; i++) { if (MS.asc[i]) continue; prev = true; for (j = 0; j < i; j++) if (!MS.asc[j]) prev = false; if (prev && ASC[i].ok(p)) { MS.asc[i] = true; stepDone(ASC, i); } }
    if (firstOpen(ASC, MS.asc) >= ASC.length) finishAsc();
  } else if (ph === 'shut') {
    if (p.pc > 0 && SDB.some(function (b) { return p.rods[b] < TOP; })) MS.orderBad = true;
    for (i = 0; i < SHUT.length; i++) { if (MS.shut[i]) continue; prev = true; for (j = 0; j < i; j++) if (!MS.shut[j]) prev = false; if (prev && SHUT[i].ok(p)) { MS.shut[i] = true; stepDone(SHUT, i); } }
    MS.scur = firstOpen(SHUT, MS.shut); if (MS.scur >= SHUT.length) finishShut();
  }
};
function stepDone(list, i) { S.sfx('ok'); S.toast('✔ ' + list[i].t, 'ok'); S.addLog((list === SHUT ? 'Shutdown' : list === ASC ? 'Power ascension' : 'Startup') + ' step ' + (i + 1) + ' done: ' + list[i].t); clearHL(); HUD.dirty = true;
  if (list === STEPS) { if (i === 0) speak('Both reactor trip breakers closed.'); if (i === 1) speak('Shutdown banks fully withdrawn.'); if (i === 3) speak('Startup rate is steady.'); if (i === 4) speak('Source range trips blocked.'); }
  else if (list === ASC) { if (i === 2) speak('Generator synchronised.'); if (i === 4) speak('P 10 trips blocked.'); }
  else { if (i === 0) speak('Below P 6.'); if (i === 3) speak('All rods in.'); } }
function verifyPre(i) {
  var it = PRE[i], p = S.p; if (MS.pre[i]) return;
  if (it.ok(p)) { MS.pre[i] = true; S.sfx('ok'); toast('✔ Checked: ' + it.t, 'ok'); S.addLog('Pre-startup check: ' + it.t);
    if (MS.preAll()) { speak('Pre-startup checks complete. Begin the reactor startup.'); toast('Pre-startup checks complete. Start the startup: close both reactor trip breakers.', 'ok'); S.addLog('Pre-startup checklist complete'); } }
  else { S.sfx('deny'); toast('✘ Not right: ' + it.st(p) + '. ' + it.h.replace(/<[^>]+>/g, ''), 'warn'); }
  HUD.dirty = true; HUD.el.ms.dataset.cur = '';
}
/* ================================================================ instructor faults ================================================================ */
var FAULT = {
  list: [
    { id: 'grid', t: 'Loss of offsite power', d: 'The 400 kV grid connection is lost.', see: 'Every unit board goes dead: coolant pumps, feed pumps, condensate and sea-water pumps stop. The diesels start and pick up the safety buses. If the generator was on line it loses its load and the turbine trips.', resp: 'Check the reactor and turbine tripped. Check both diesels running with their breakers closed (board 11). Feed the steam generators with auxiliary feed (board 7). With no condenser, cool down on the SG PORVs (board 8). Natural circulation keeps the core cool. Restore the grid when the instructor clears the fault.' },
    { id: 'porv', t: 'Pressuriser PORV stuck open', d: 'PORV 455A sticks open (Three Mile Island, 1979).', see: 'Pressuriser pressure falls, the PORV discharge temperature reads hot, the relief tank level and pressure rise. Left alone, pressure reaches the low-pressure trip and safety injection.', resp: 'On the pressuriser board (board 4), close the <b>PORV 455A BLOCK V</b> valve. Pressure recovers on the heaters.' },
    { id: 'mfpA', t: 'Main feed pump A trips', d: 'Main feed pump A trips and won’t restart.', see: 'Feed flow drops below steam flow and steam generator levels fall towards the 17% low-low trip.', resp: 'If only one feed pump was running, reduce turbine load fast (below about 50%) and start main feed pump B. Watch SG levels on board 7. If levels keep falling, trip the reactor before the automatic trip.' },
    { id: 'air', t: 'Loss of instrument air', d: 'Both air compressors fail.', see: 'Instrument air pressure falls slowly. Below 4 bar air-operated valves go to their safe positions: feed regulating valves shut, letdown isolates, sprays and steam dumps are lost, PORVs can’t open.', resp: 'Watch AIR P on board 2. Before the feed valves shut, trip the reactor and turbine and feed the steam generators with auxiliary feed, which fails open.' },
    { id: 'ccw', t: 'Loss of component cooling water', d: 'All component cooling water pumps trip.', see: 'RCP bearing temperatures climb (board 2 and 5). At 95 °C the pumps trip on their own.', resp: 'Try to restart a CCW pump (it won’t while the fault is in). Trip the reactor, then stop all four reactor coolant pumps before their bearings are damaged. Natural circulation will cool the core.' },
    { id: 'sgtl', t: 'Steam generator tube leak', d: 'A tube in steam generator 1 starts leaking reactor coolant into the steam side.', see: 'The N-16 main steam monitor and air ejector radiation go up (board 1). Pressuriser level falls slowly and charging rises to make up. SG 1 level creeps up.', resp: 'Raise charging to hold pressuriser level. Reduce power, trip the reactor, then isolate SG 1: close MSIV 1 (board 8) and stop feeding it. Cool down on the other three SGs.' },
    { id: 'cw', t: 'Circulating water pumps trip', d: 'All the sea-water pumps for the condenser trip.', see: 'Condenser vacuum is lost in a minute or two. The turbine trips on low vacuum and the steam dumps are blocked (C-9).', resp: 'Expect the turbine trip and reactor trip. With no condenser, steam pressure is controlled by the SG PORVs. Feed with auxiliary feed. Restart a CW pump when the fault clears.' }
  ],
  active: function () { var f = S && S.p && S.p.x && S.p.x.f; if (!f) return []; return FAULT.list.filter(function (q) { return f[q.id]; }); },
  insert: function (id, quiet) { var x = S.p.x, q = FAULT.list.filter(function (k) { return k.id === id; })[0]; x.f = x.f || {}; x.f[id] = true; S.addLog('INSTRUCTOR: fault inserted' + (quiet ? '' : ': ' + q.t)); AUD.sfx('deny');
    if (id === 'porv') S.p.x.pz.prtP = Math.max(S.p.x.pz.prtP, 0.3); toast(quiet ? '⚠ The instructor has put a fault into the plant. Watch the alarms.' : '⚠ Fault: ' + q.t, 'bad'); HUD.dirty = true; HUD.el.ms.dataset.cur = ''; },
  clear: function () { var x = S.p.x; if (x.f && x.f.grid) x.el.grid = true; x.f = {}; S.addLog('INSTRUCTOR: all faults cleared'); toast('All faults cleared. Systems can be restored.', 'ok'); HUD.dirty = true; HUD.el.ms.dataset.cur = ''; }
};
function faultsMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var act = FAULT.active();
  menu('<h1>⚠ Faults</h1><p>You’re the instructor now. Put a fault into the plant, then go back to the control room and deal with it the way an operator would: read the alarms, work out what failed, act. Faults are best from power, so choose <b>Free play at 50% power</b> on the main menu first.</p>' +
    (act.length ? '<h2>Active</h2><p>' + act.map(function (q) { return '<b>' + esc(q.t) + '</b>'; }).join(', ') + '</p>' : '') +
    '<div class="cpnbtns"><button class="cpnb" data-a="surprise">🎲 Surprise me (secret fault)</button>' + (act.length ? '<button class="cpnb2" data-a="clear">✔ Clear all faults</button>' : '') + '<button class="cpnb2" data-a="x">Back to the plant</button></div>' +
    '<h2>Choose a fault</h2><div class="cpnflist">' + FAULT.list.map(function (q) { return '<div><b>' + esc(q.t) + '</b><span>' + esc(q.d) + '</span><details><summary>What you’ll see and what to do</summary><p>' + esc(q.see) + '</p><p><b>Response:</b> ' + q.resp + '</p></details><button class="cpnb2" data-a="f" data-f="' + q.id + '"' + (S.p.x.f && S.p.x.f[q.id] ? ' disabled' : '') + '>Insert</button></div>'; }).join('') + '</div>',
    function (a, b) { if (a === 'f') { FAULT.insert(b.dataset.f); closeMenu(); } if (a === 'surprise') { var c = FAULT.list.filter(function (q) { return !(S.p.x.f && S.p.x.f[q.id]); }); if (c.length) FAULT.insert(c[Math.floor(Math.random() * c.length)].id, true); closeMenu(); } if (a === 'clear') { FAULT.clear(); closeMenu(); } if (a === 'x') closeMenu(); });
}
/* a plant already on line at a given load, for free play and faults */
function atPowerPlant(mw) {
  var p = poahPlant(), x = p.x, t = x.tb, fr = (mw / 0.335 + 0.02 * FULL) / FULL;
  x.mfp = [true, true]; x.mdafw = [false, false]; t.latched = true; t.trip = false; t.tg = false; t.rpm = 3000; t.set = 3000; t.field = true; t.exc = 1; t.kv = 22; t.syncSel = 'OFF'; t.gen = true; x.el.unitTx = true; t.load = mw; t.mw = mw;
  x.dumpMode = 'TAVG'; p.sel = 'AUTO'; p.irBlk = [true, true]; p.prBlk = [true, true]; x.cw = [true, true, true, false]; x.cv.ccp = [true, false];
  p.n = fr / 0.95; for (var i = 0; i < 6; i++) p.c[i] = BI[i] * p.n / (GEN * LI[i]); p.dh = [DHF[0] * p.n, DHF[1] * p.n, DHF[2] * p.n]; p.Tavg = trefC(x); x.pz.L = LPRG(p.Tavg); x.cv.vct = 46; p.Tf = p.Tavg + 460 * p.n; p.lnPrev = Math.log(p.n); p.Ps = 74 - 18 * fr; p.dI = 0;
  x.xe.I = 0.2418 * p.n / 2.87e-5; x.xe.X = (0.0127 * p.n + 2.87e-5 * x.xe.I) / (2.09e-5 + 7e-5 * p.n);
  var crit = function () { p.boron = clamp(p.boron + (rhoPcm(p) - 0) / BW, 0, 2500); };
  p.pc = 3 * OVL + 190; setOverlap(p); crit(); x.sg.forEach(function (s) { s.L = s.Lm = 50; s.frvDem = s.frv = s.steam / 28 || 0.6; });
  for (var k = 0; k < 2400; k++) { plantStep(p, 0.25, true); if (k % 8 === 0 && k < 2000) { var r = rhoPcm(p); if (Math.abs(r) > 2) p.boron = clamp(p.boron + r / BW * 0.3, 0, 2500); } }
  p.tripped = false; p.rtb = [true, true]; p.t = 0; p.hist = []; p.sur = 0; p.lnPrev = Math.log(p.n); p.oneM = []; p.everCrit = true; return p;
}
function atPowerStart() { freshState(true); S.p = atPowerPlant(575); MS.free = true; MS.complete = true; MS.ascDone = true; MS.asc = ASC.map(function () { return true; }); MS.pre = PRE.map(function () { return true; }); MS.done = STEPS.map(function () { return true; });
  for (var i = 0; i < 8; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.log = []; S.addLog('Shift start: Unit 1 at 50% power, ' + Math.round(S.p.x.tb.mw) + ' MW, rods in AUTO'); goView('start', true); save(); }
function startAsc() { if (S.p.tripped || D.pr < 0.3) { warnOnce('asc0', 'Power ascension starts from the point of adding heat: take the reactor critical first.'); return; } MS.ascOn = true; MS.ascDone = false; MS.asc = []; MS.ascT = 0; MS.view = 'step'; MS.free = true; S.addLog('Power ascension started (GOP-302)'); speak('Begin the power ascension.'); toast('Power ascension checklist (GOP-302) started.', 'ok'); HUD.el.ms.dataset.cur = ''; HUD.dirty = true; }
function finishAsc() {
  if (MS.ascDone) return; MS.ascDone = true; var p = S.p, x = p.x, sv = rd(), first = !sv.doneAsc, xp = first ? 80 : 15; try { API.xp(xp, 'Critical Point: power ascension'); } catch (e) {} sv = rd(); sv.doneAsc = (sv.doneAsc || 0) + 1; wr(sv);
  AUD.sfx('done'); speak('Unit 1 is at fifty percent power. Well done.'); S.addLog('Power ascension to 50% complete. GOP-302 complete.'); S.wasPaused = false; setPause(true);
  menu('<h1>⚡ Unit 1 at 50% power</h1><p class="cpnsub">GOP-302 complete · ' + Math.round(x.tb.mw) + ' MW to the grid · ' + D.pr.toFixed(0) + '% reactor power · boron ' + Math.round(p.boron) + ' ppm</p><div class="cpnscore"><span>Power ascension to 50% (GOP-302)</span><span>✔</span><span><b>XP earned</b></span><span>+' + xp + '</span></div>' +
    '<p>You started the feed pumps, rolled and synchronised the turbine-generator, switched the plant to automatic control, blocked the low-power trips at P-10 and diluted boron to keep the rods in range. That’s enough electricity for about a million homes.</p><p>From here: keep loading to 1150 MW, try a fault from the ⚠ Faults menu, or shut the plant down.</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="free">Keep running the plant</button><button class="cpnb2" data-a="faults">⚠ Try a fault</button><button class="cpnb2" data-a="exit">Exit</button></div>',
    function (a) { if (a === 'free') { closeMenu(); HUD.el.ms.dataset.cur = ''; } if (a === 'faults') faultsMenu(); if (a === 'exit') close(); });
  save();
}
function startShutdown() { MS.ascOn = false; MS.shutOn = true; MS.shutDone = false; MS.shut = []; MS.scur = 0; MS.orderBad = false; MS.shutTrips = 0; MS.view = 'step'; S.addLog('Shutdown started (GOP-303)'); speak('Begin the reactor shutdown.'); toast('Shutdown checklist (GOP-303) started.', 'ok'); HUD.el.ms.dataset.cur = ''; HUD.dirty = true; }
function finishShut() {
  if (MS.shutDone) return; MS.shutDone = true; var noTrip = MS.shutTrips === 0, order = !MS.orderBad, sv = rd(), first = !sv.doneShut, xp = (first ? 30 : 8) + (noTrip ? 10 : 0) + (order ? 10 : 0), rows = [];
  rows.push('<span>Reactor shut down to Mode 3 (GOP-303)</span><span>✔</span>', '<span>' + (noTrip ? '✔' : '✘') + ' Shut down with the rods, not a trip</span><span>' + (noTrip ? '+10' : '0') + '</span>', '<span>' + (order ? '✔' : '✘') + ' Control banks in before the shutdown banks</span><span>' + (order ? '+10' : '0') + '</span>');
  try { API.xp(xp, 'Critical Point: reactor shutdown'); } catch (e) {} sv = rd(); sv.doneShut = (sv.doneShut || 0) + 1; wr(sv);
  AUD.sfx('done'); speak('The reactor is shut down. Well done.'); S.addLog('Reactor shut down. GOP-303 complete.'); S.wasPaused = false; setPause(true);
  menu('<h1>✅ Reactor shut down</h1><p class="cpnsub">GOP-303 complete · Mode 3 · N31 ' + Math.round(NI.sr[0]) + ' cps</p><div class="cpnscore">' + rows.join('') + '<span><b>XP earned</b></span><span>+' + xp + '</span></div>' +
    '<p>You brought power down with the control banks, let the source range come back on below P-6, put every rod in (control banks first, then the shutdown banks) and opened the trip breakers. The reactor is back at hot standby, ready for the next startup.</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="again">▶ Start it up again from here</button><button class="cpnb2" data-a="free">Keep running the plant</button><button class="cpnb2" data-a="exit">Exit</button></div>',
    function (a) { if (a === 'again') { againFromHere(); } if (a === 'free') { MS.free = true; closeMenu(); HUD.el.ms.dataset.cur = ''; } if (a === 'exit') close(); });
  save();
}
function againFromHere() { var p = S.p; MS.reset(); p.everCrit = false; p.c0 = null; p.oneM = []; p.lastPc = null; S.st = { trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }; S.addLog('New startup from hot standby'); closeMenu(); HUD.el.ms.dataset.cur = ''; HUD.dirty = true; speak('Begin the pre-startup checks.'); }
/* a plant already sitting at the point of adding heat, for shutdown practice */
function poahPlant() {
  var p = freshPlant(); p.rtb = [true, true]; p.tripped = false; SDB.forEach(function (b) { p.rods[b] = TOP; }); p.pc = 3 * OVL + ECP_D; setOverlap(p); p.srBlk = [true, true]; p.sel = 'MAN';
  p.n = 0.012; for (var i = 0; i < 6; i++) p.c[i] = BI[i] * p.n / (GEN * LI[i]); p.lnPrev = Math.log(p.n); p.sur = 0;
  for (var k = 0; k < 2400; k++) { plantStep(p, 0.25, true); if (k % 2) continue; var want = p.n > 0.014 ? -1 : p.n < 0.01 ? 1 : 0, s = p.sur;
    if (s > 0.03 || (want < 0 && s > -0.03)) { p.pc = Math.max(0, p.pc - 1); setOverlap(p); } else if (s < -0.03 || (want > 0 && s < 0.03)) { p.pc = Math.min(PCMAX, p.pc + 1); setOverlap(p); } }
  p.t = 0; p.hist = []; p.everCrit = true; p.c0 = null; p.oneM = []; p.srAvg = 3e11 * p.n; p.steps = 0; p.lever = 0; p.audio = true; return p;
}

/* ================================================================ explain mode ================================================================
   Rest the pointer on any control or instrument for 3 seconds (or press and hold on a touch screen) and a card explains
   what it does and how it's used in a real plant. The card never takes clicks and sits to the side, away from what you're pointing at. */
var INFO = [
  [/(Intermediate range|Power range low setpoint) trip BLOCK/, 'P-10 trip blocks', 'During a startup the intermediate range trips at about 25% power and the power range low setpoint at 25%. Once P-10 lights (two power range channels above 10%) you block them on both trains so you can carry on raising power. The high setpoint (109%) stays armed.', 'Fall back below 10% and the blocks reset by themselves.'],
  [/P-6 permissive lamp/i, 'P-6 permissive', 'Lights when the intermediate range is above 1E-10 A. That proves power is high enough for the intermediate range to see it, so the source range can be blocked.'],
  [/PERMISSIVE \/ BYPASS/i, 'Permissive and bypass lights', 'Show which protection permissives are active (P-6, P-10) and which trips are blocked.', 'Permissives are interlocks: a trip can only be blocked once the plant has reached the point where that trip is no longer needed.'],
  [/Annunciator windows/i, 'Annunciator windows', 'Each window is one alarm. Fast flash: new, press ACK. Steady: acknowledged. Slow flash: cleared, press RESET. Amber is an alarm, red is the reactor trip that happened first, white is just status.'],
  [/^Recorder: intermediate|^Recorder: startup/i, 'Chart recorder', 'Draws a pen trace on moving paper (newest at the top here), so the trend over the last 10 minutes is obvious at a glance.'],
  [/MANUAL REACTOR TRIP/i, 'Manual reactor trip', 'Opens both trip breakers at once. Every rod drops in about 1.7 seconds and the reactor shuts down.', 'Operators are trained to trip the reactor whenever they are not sure it is safe. There are two buttons (trains A and B) so one failure can’t stop it working.'],
  [/source range \(train|^N31 source|^N32 source|^Source range count/i, 'Source range detectors (N31, N32)', 'Count single neutrons when the reactor is shut down or just starting up, from 1 to 1,000,000 counts per second on a log scale. Each count is a neutron hitting a gas-filled detector outside the reactor vessel.', 'They are so sensitive they would be damaged at power, so they trip the reactor at 100,000 cps unless you block them at P-6. Blocking also switches off their high voltage.'],
  [/startup rate/i, 'Startup rate (SUR)', 'How fast power is changing, in decades per minute. +1 DPM means power is ten times higher every minute, 0 means steady, negative means falling.', 'Operators keep it under 1 DPM during a startup. After a trip it settles at about −1/3 DPM, set by the slowest delayed neutrons (about 80 seconds).'],
  [/intermediate range/i, 'Intermediate range (N35, N36)', 'Ion chambers that measure neutron flux as a tiny electric current, from 1E-11 to 1E-3 amps. That is eight decades, overlapping the source range below and the power range above.', 'P-6 lights at 1E-10 A, which lets you block the source range. The intermediate range trip is set at the current that matches about 25% power.'],
  [/power range|NIS POWER/i, 'Power range (N41–N44)', 'Four ion chambers around the core that read reactor power directly, 0–120%.', 'They trip the reactor if 2 of the 4 read over 25% (the low setpoint used in startups) or 109%. Needing 2 out of 4 means one faulty channel can’t trip the reactor on its own, or stop a real trip.'],
  [/Rod positions/i, 'Digital rod position indication (DRPI)', 'Shows where each of the 53 control rods really is, measured by coils around its drive shaft, in 6-step dots. A red light at the bottom means that rod is fully in.', 'Operators compare DRPI with the demand counters. A rod that isn’t where it was told to go could be stuck or dropped.'],
  [/demand counters|CTRL BANK/i, 'Group demand counters', 'How many steps rod control has told each bank to move: 0 is fully in, 228 is fully out.', 'Each step is about 1.6 cm. Magnetic latches grip a grooved drive shaft and walk it up or down one step at a time.'],
  [/Bank select/i, 'Bank selector', 'Picks which rods the lever moves. SA–SD move one shutdown bank each. MAN moves the four control banks A→B→C→D together, in overlap. AUTO lets the plant move rods to match the turbine.', 'Shutdown banks are pulled out first and put in last, so they are always ready to drop. In overlap the next bank starts moving when the one before reaches 128 steps.'],
  [/Rod motion lever|ROD SPEED/i, 'Rod motion lever (IN · HOLD · OUT)', 'Springs back to HOLD when you let go. Hold it up for OUT, down for IN. Shutdown banks move at 64 steps a minute, control banks at 48.', 'Pulling rods adds reactivity, so it is done in small amounts with a pause after each pull to watch what the reactor does.'],
  [/Rods moving/i, 'Rod motion lamps', 'Light while rods are actually stepping out (red) or in (green), so you know the lever did something.'],
  [/trip breaker/i, 'Reactor trip breakers (RTB A and B)', 'Two big breakers in series feeding power to the rod drive mechanisms. Closed (red lamp) means the latches can hold the rods. Open (green) means they let go and every rod falls into the core in under 2 seconds.', 'Every reactor trip, automatic or manual, works by opening these. You close them at the start of a startup and open them at the end of a shutdown.'],
  [/ACKNOWLEDGE/i, 'Acknowledge (ACK)', 'Stops the horn and turns fast-flashing alarm windows steady.', 'Acknowledging means “I’ve seen it”, not “it’s fixed”. Each alarm has its own alarm response procedure saying what to check.'],
  [/^SILENCE/i, 'Silence', 'Stops the horn but leaves the windows flashing, so you can still see which alarms are new.'],
  [/^RESET:/i, 'Reset', 'Clears windows whose alarm has gone away. They flash slowly (with a chime) until you reset them.'],
  [/LAMP TEST/i, 'Lamp test', 'Hold it to light every window and lamp, so you can spot a dead bulb before it hides a real alarm.'],
  [/trip BLOCK/i, 'Source range trip block', 'Once P-6 is lit, this blocks the source range high-flux trip on one train and switches that detector off. Press it again to reset the block.', 'Below P-6 the blocks reset by themselves, so a shut-down reactor is always protected by the source range.'],
  [/audio count rate|SR AUDIO/i, 'Source range audio', 'Turns neutron counts into clicks on a speaker, so you can hear the count rate rising without looking. When the counts get fast, a scaler gives one click per 10, 100 or 1000 counts.'],
  [/Tavg|Average coolant temperature/i, 'Tavg (average coolant temperature)', 'The average of the hot leg and cold leg temperatures. At hot standby the steam dumps hold it at 291.7 °C.', 'At the point of adding heat (about 1% power) Tavg starts to rise. Hotter water slows fewer neutrons, which adds negative reactivity and slows the rise in power.'],
  [/Steam dump|STM DUMP|DUMP DEMAND/i, 'Steam dumps', 'Valves that send steam straight to the condenser, skipping the turbine. With no turbine running, they are how the reactor’s heat leaves the plant.', 'In steam pressure mode they open further if pressure rises. That is what holds Tavg steady at hot standby.'],
  [/steam header pressure|Steam generator \d pressure|STEAM PRESS/i, 'Steam pressure', 'Pressure in the steam lines from the steam generators. Water boils at a temperature set by its pressure, so holding 76.3 bar holds the steam generators at about 291 °C.'],
  [/PLANT MODE/i, 'Plant mode', 'The Technical Specifications split operation into modes. Mode 3, hot standby: shut down but hot. Mode 2, startup: keff at least 0.99 and power up to 5%. Mode 1: power operation above 5%.', 'Each mode has its own rules about which safety systems must be working.'],
  [/Pressuriser pressure|PZR PRESS|RCS PRESS/i, 'Pressuriser pressure', 'A tall vessel with a steam bubble at the top sets the pressure of the whole reactor coolant system: 155 bar. Heaters boil water to raise it, and sprays of cooler water condense steam to lower it.', 'At 155 bar water stays liquid above 340 °C, so the core is always covered by liquid water.'],
  [/Pressuriser level|PZR LEVEL/i, 'Pressuriser level', 'How full the pressuriser is. It rises when the coolant heats up and expands, so the programmed level goes up with Tavg.'],
  [/Subcooling/i, 'Subcooling margin', 'How many degrees the hottest coolant is below boiling at today’s pressure. A big margin means the core is safely covered by liquid water.', 'In an emergency this is one of the first numbers operators check.'],
  [/hot leg temperature/i, 'Hot leg temperature', 'Coolant leaving the reactor for a steam generator. At hot standby it equals the cold leg, because the reactor isn’t making heat yet.'],
  [/cold leg temperature/i, 'Cold leg temperature', 'Coolant coming back from a steam generator into the reactor.'],
  [/RCS flow/i, 'Reactor coolant flow', 'Flow in each loop as a percentage of normal: about 20 tonnes of water every second for the whole reactor.'],
  [/RCP|Reactor coolant pump/i, 'Reactor coolant pumps', 'Four huge pumps, about 6 MW each, push the coolant round the four loops. Even with the reactor shut down they put about 20 MW of heat into the water.', 'They run all the time at hot standby. You get control of them in Section 2.'],
  [/Charging|Letdown|charging pump/i, 'Charging and letdown (CVCS)', 'Letdown takes a little coolant out to be cleaned and have its chemistry adjusted. Charging pumps push it back in. This is also how boron is added (borating) or removed (diluting).'],
  [/boron|Boric acid/i, 'Boron', 'Boric acid dissolved in the coolant soaks up neutrons evenly all through the core. Here 1 ppm is worth about 9.5 pcm. Changing it is slow, so boron is used for big, slow changes and rods for quick ones.'],
  [/Volume control tank/i, 'Volume control tank', 'A buffer tank between letdown and the charging pumps.'],
  [/Refuelling water storage/i, 'Refuelling water storage tank (RWST)', 'A huge tank of borated water used for refuelling, and as the first water supply for emergency safety injection.'],
  [/RHR|residual heat/i, 'Residual heat removal (RHR)', 'Pumps and heat exchangers that cool the reactor once it is cold and depressurised. Isolated at hot standby; they matter after a shutdown and in emergencies.'],
  [/narrow range level/i, 'Steam generator level', 'Water level in each steam generator. Too low and it can’t cool the reactor; too high and water is carried into the steam lines. Both will trip the reactor in later sections.'],
  [/steam flow|feed flow/i, 'Steam flow and feed flow', 'Steam leaving and feedwater entering each steam generator. They should match, or the level drifts.'],
  [/Main steam isolation|MSIV/i, 'Main steam isolation valves', 'Big fast-closing valves on each steam line. They shut to isolate a steam leak.'],
  [/Auxiliary feedwater|AFW/i, 'Auxiliary feedwater', 'Smaller pumps that keep the steam generators topped up at hot standby, and in emergencies when the main feed pumps are off.'],
  [/Turbine speed/i, 'Turbine speed', 'On turning gear the turbine turns slowly (about 30 rpm) so its hot shaft doesn’t bend. Latch it on the turbine board and roll it up to 3000 rpm.', '3000 rpm with a two-pole generator makes exactly 50 Hz, the frequency of the GB grid.'],
  [/Synchroscope/i, 'Synchroscope', 'Shows whether the generator is turning slightly faster or slower than the grid. You close the generator breaker as the pointer creeps clockwise through 12 o’clock.'],
  [/grid frequency|National Grid|GRID Hz/i, 'Grid frequency', 'The whole GB grid runs at 50 Hz. If demand is bigger than supply every generator slows a little and the frequency falls, so this number shows the balance live.', 'National Grid keeps it between 49.8 and 50.2 Hz.'],
  [/diesel/i, 'Emergency diesel generators', 'Back-up generators that start in about 10 seconds if off-site power is lost, to run the safety pumps.'],
  [/Generator circuit breaker/i, 'Generator breaker', 'Connects the generator to the 400 kV grid. It is closed only after synchronising.'],
  [/1\/M plot/i, '1/M plot', 'The reference count rate divided by the count rate now. As the reactor gets closer to critical the counts shoot up and 1/M falls towards zero. Draw a line through the last two points to where it hits zero: that predicts the critical rod position.'],
  [/relief valve/i, 'Pressuriser relief valves (PORVs)', 'Open to stop pressure rising too far, sending steam to the pressuriser relief tank.'],
  [/heaters/i, 'Pressuriser heaters', 'Electric heaters in the bottom of the pressuriser. Boiling a little more water raises the pressure.'],
  [/Days without a reactor trip/i, 'Days without a reactor trip', 'Real stations track this with pride. Trip the reactor and it goes back to zero.']
];
var EXP = { obj: null, t0: 0, info: null, shown: false };
function infoFor(hi) { if (!hi) return null; if (hi.info) return hi.info; if (!hi.tip) return null; var t = typeof hi.tip === 'function' ? hi.tip() : hi.tip; for (var i = 0; i < INFO.length; i++) if (INFO[i][0].test(t)) return INFO[i]; return null; }
function showExplain(inf, x, y) {
  EXP.x = x; EXP.y = y; var E = HUD.el.exp; E.innerHTML = '<b>💡 ' + esc(inf[1]) + '</b><p>' + esc(inf[2]) + '</p>' + (inf[3] ? '<p class="r"><span>In a real plant:</span> ' + esc(inf[3]) + '</p>' : ''); E.hidden = false; EXP.shown = true; hideTip(); HUD.el.ring.hidden = true;
  var W = root.clientWidth, H = root.clientHeight, w = E.offsetWidth, hh = E.offsetHeight;
  if (x == null) { E.style.left = Math.round((W - w) / 2) + 'px'; E.style.top = Math.round(Math.max(70, H * 0.16)) + 'px'; return; }
  var left = x > W / 2 ? x - w - 34 : x + 34; E.style.left = clamp(left, 8, W - w - 8) + 'px'; E.style.top = clamp(y - hh / 2, 60, H - hh - 10) + 'px';
}
function hideExplain() { if (HUD.el.exp) HUD.el.exp.hidden = true; if (HUD.el.ring) HUD.el.ring.hidden = true; EXP.shown = false; }
function explainTick(now) {
  var R = HUD.el.ring; if (!R) return;
  if (!S.cfg.explain || S.menu || PTR.down || !PTR.hoverObj) { if (!EXP.touch) hideExplain(); EXP.obj = null; return; }
  if (EXP.obj !== PTR.hoverObj) { EXP.obj = PTR.hoverObj; EXP.t0 = now; EXP.info = infoFor(PTR.hover); hideExplain(); }
  if (!EXP.info) return; var el = now - EXP.t0;
  if (el < 3000) { if (el > 700) { R.hidden = false; R.style.left = (PTR.hx + 14) + 'px'; R.style.top = (PTR.hy - 30) + 'px'; R.firstChild.lastChild.style.strokeDashoffset = String(50.3 * (1 - (el - 700) / 2300)); } return; }
  if (!EXP.shown) showExplain(EXP.info, PTR.hx, PTR.hy);
}

/* ================================================================ controls: what each switch actually does ================================================================ */
function tripSignal(p) { var prs = [0, 1, 2, 3].map(function (i) { return prPct(p, i); }), over = function (v) { return prs.filter(function (x) { return x > v; }).length >= 2; };
  if ((srTrue(p, 0) > 1e5 && !p.srBlk[0]) || (srTrue(p, 1) > 1e5 && !p.srBlk[1])) return 'SR'; if ((irAmps(p, 0) > 2.5e-4 && !(p.irBlk && p.irBlk[0])) || (irAmps(p, 1) > 2.5e-4 && !(p.irBlk && p.irBlk[1]))) return 'IR'; if (over(25) && !blkd(p, 'prBlk')) return 'PRL'; if (p.x) { var x = p.x; if (x.si.on) return 'SI'; if (x.sg.some(function (s) { return s.L < 17; })) return 'SGLL'; if (x.pz.P > 166) return 'PZRPH'; } return null; }
var once = {};
function warnOnce(k, msg, secs) { var t = performance.now(); if (once[k] && t - once[k] < (secs || 6) * 1000) return; once[k] = t; S.toast(msg, 'warn'); S.sfx('deny'); }
var ACT = {
  rtb: function (i, close) {
    var p = S.p, n = 'AB'[i];
    if (close) {
      if (p.rtb[i]) { S.toast('RTB ' + n + ' is already closed.'); return; }
      if (p.dropping) { warnOnce('drop', 'Wait: the rods are still dropping.'); return; }
      var ts = tripSignal(p); if (ts) { warnOnce('ts', 'RTB ' + n + ' won’t close: a trip signal is still present (' + TRIPS[ts] + ').'); return; }
      p.rtb[i] = true; S.sfx('breaker'); S.addLog('Reactor trip breaker ' + n + ' closed');
      if (p.rtb[0] && p.rtb[1]) { p.tripped = false; p.firstOut = ''; p.dropped = false; S.addLog('Both trip breakers closed: rod drive mechanisms powered'); }
    } else {
      if (!p.rtb[i]) { S.toast('RTB ' + n + ' is already open.'); return; }
      S.sfx('breaker'); var allIn = BANKS.every(function (b) { return p.rods[b] <= 0; });
      if (!p.tripped && !allIn) doTrip(p, 'MAN'); else { p.rtb[i] = false; p.tripped = true; p.lever = 0; S.addLog('Reactor trip breaker ' + n + ' opened' + (allIn ? ' (all rods already in)' : '')); }
    }
    HUD.dirty = true;
  },
  select: function (b) { var p = S.p; if (b === 'AUTO') { p.sel = 'AUTO'; ACT.lever(0); S.sfx('detent'); if (!(p.x && p.x.tb.mw > 170)) warnOnce('auto', 'Rods in AUTO: they follow Tavg to Tref, but only once the turbine is above 15% load (C-5). Until then they won\u2019t move.'); HUD.dirty = true; return; }
    if (p.sel !== b) { p.sel = b; ACT.lever(0); S.sfx('detent'); } HUD.dirty = true; },
  lever: function (dir) {
    var p = S.p; S.leverDir = dir;
    if (!dir) { p.lever = 0; return; }
    if (!(p.rtb[0] && p.rtb[1])) { warnOnce('rtbo', 'The rods won’t move: the reactor trip breakers are open. Close RTB A and RTB B first.'); p.lever = 0; return; }
    if (p.sel === 'AUTO') { warnOnce('auto', 'The selector is on AUTO: the rod control system moves the control banks itself. Pick MAN to move them by hand.'); p.lever = 0; return; }
    if (dir > 0 && (NI.ir[0] > 2e-4 || NI.ir[1] > 2e-4) && !blkd(p, 'irBlk')) { warnOnce('c1', 'Rod withdrawal blocked: intermediate range rod stop (C-1). Power is far too high: insert rods.'); p.lever = 0; return; }
    if (dir > 0 && p.sel === 'MAN' && !SDB.every(function (b) { return p.rods[b] >= TOP; })) warnOnce('sdfirst', 'Procedure: withdraw all four shutdown banks before the control banks.', 20);
    p.lever = dir; p.blocked = 0;
  },
  srBlock: function (i) {
    var p = S.p, n = 'AB'[i], det = i ? 'N32' : 'N31';
    if (p.srBlk[i]) { p.srBlk[i] = false; S.addLog('Source range train ' + n + ' block reset: ' + det + ' back on'); S.toast('Source range train ' + n + ' trip block reset. ' + det + ' is back on' + (srTrue(p, i) > 1e5 ? ' and reads over 100,000 cps…' : '.')); HUD.dirty = true; return; }
    if (!p6(p)) { warnOnce('p6', 'Can’t block yet: P-6 isn’t lit. P-6 comes on when the intermediate range reaches 1E-10 A.'); return; }
    p.srBlk[i] = true; S.addLog('Source range train ' + n + ' trip blocked at P-6 (' + det + ' high voltage off)'); S.toast('Source range train ' + n + ' trip blocked. ' + det + ' is switched off.', 'ok'); HUD.dirty = true;
  },
  blk10: function (k, i) { var p = S.p, nm = k === 'irBlk' ? 'Intermediate range trip' : 'Power range low setpoint trip'; if (!p[k]) p[k] = [false, false];
    if (p[k][i]) { p[k][i] = false; S.addLog(nm + ' block reset, train ' + 'AB'[i]); HUD.dirty = true; return; }
    if (!p10(p)) { warnOnce('p10', 'Can\u2019t block yet: P-10 isn\u2019t lit. It lights when two of the four power range channels are above 10%.'); return; }
    p[k][i] = true; S.addLog(nm + ' blocked at P-10, train ' + 'AB'[i]); S.toast(nm + ' blocked, train ' + 'AB'[i] + '.', 'ok'); HUD.dirty = true; },
  trip: function () { var p = S.p; if (p.tripped && !BANKS.some(function (b) { return p.rods[b] > 0; })) { S.toast('The reactor is already shut down with every rod in.'); return; } S.sfx('breaker'); doTrip(p, 'MAN'); }
};

/* ================================================================ annunciators: alert → acknowledge → ringback → reset ================================================================ */
var ANNC = { list: [], horn: false, chime: 0,
  init: function () { ANN.forEach(function (t) { if (!t.lbl) { t.st = 'off'; return; } var on = !!t.c(); t.was = on; t.st = on ? (t.k === 'status' ? 'on' : 'ack') : 'off'; }); },
  tick: function () {
    var na = false;
    ANN.forEach(function (t) { if (!t.lbl) return; var on = !!t.c();
      if (t.k === 'status') { var st = on ? 'on' : 'off'; if (st !== t.st) { t.st = st; if (on) ANNC.add(t, false); } t.was = on; return; }
      if (on && !t.was) { t.st = 'alert'; na = true; ANNC.add(t, false); }
      else if (!on && t.was) { ANNC.add(t, true); if (t.st === 'ack') { t.st = 'ring'; ANNC.chime = 1; } }
      t.was = on; });
    if (na) { ANNC.horn = true; S.onAlarm(); }
    if (ANNC.horn && !ANN.some(function (t) { return t.st === 'alert'; })) ANNC.horn = false;
  },
  ack: function () { ANN.forEach(function (t) { if (t.st === 'alert') { t.st = t.was ? 'ack' : 'ring'; if (!t.was) ANNC.chime = 1; } }); ANNC.horn = false; },
  silence: function () { ANNC.horn = false; },
  reset: function () { ANN.forEach(function (t) { if (t.st === 'ring') t.st = 'off'; }); },
  add: function (t, clear) { ANNC.list.unshift({ at: D.clock, lbl: t.lbl, k: t.k, clear: clear }); if (ANNC.list.length > 80) ANNC.list.pop(); },
  count: function () { var a = 0; ANN.forEach(function (t) { if (t.st === 'alert') a++; }); return a; }
};

/* ================================================================ sound: all synthesised, nothing to download ================================================================ */
var AUD = { ctx: null,
  init: function () {
    if (AUD.ctx) { if (AUD.ctx.state === 'suspended') AUD.ctx.resume(); return; }
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return; var c; try { c = new C(); } catch (e) { return; } AUD.ctx = c;
    AUD.master = c.createGain(); AUD.master.gain.value = S.cfg.snd ? 0.8 : 0; var comp = c.createDynamicsCompressor(); AUD.master.connect(comp); comp.connect(c.destination);
    var len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0; for (var i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    var src = c.createBufferSource(); src.buffer = buf; src.loop = true; var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; var hg = c.createGain(); hg.gain.value = 0.16; src.connect(lp); lp.connect(hg); hg.connect(AUD.master); src.start();
    var hum = c.createOscillator(); hum.frequency.value = 100; var hu = c.createGain(); hu.gain.value = 0.01; hum.connect(hu); hu.connect(AUD.master); hum.start();
    AUD.hornG = c.createGain(); AUD.hornG.gain.value = 0; var h1 = c.createOscillator(), h2 = c.createOscillator(); h1.type = 'sawtooth'; h1.frequency.value = 415; h2.type = 'square'; h2.frequency.value = 523; var hf = c.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1600; var hm = c.createGain(); hm.gain.value = 0.35;
    h1.connect(hm); h2.connect(hm); hm.connect(hf); hf.connect(AUD.hornG); AUD.hornG.connect(AUD.master); h1.start(); h2.start();
    var nl = Math.floor(c.sampleRate * 0.25); AUD.nbuf = c.createBuffer(1, nl, c.sampleRate); var nd = AUD.nbuf.getChannelData(0); for (i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
  },
  vol: function () { if (AUD.master) AUD.master.gain.setTargetAtTime(S.cfg.snd ? 0.8 : 0, AUD.ctx.currentTime, 0.05); },
  noise: function (t, dur, f, q, vol, type) { var c = AUD.ctx; if (!c) return; var s = c.createBufferSource(); s.buffer = AUD.nbuf; var bp = c.createBiquadFilter(); bp.type = type || 'bandpass'; bp.frequency.value = f; bp.Q.value = q || 1; var g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); s.connect(bp); bp.connect(g); g.connect(AUD.master); s.start(t); s.stop(t + dur + 0.02); },
  tone: function (t, f, dur, type, vol, f2) { var c = AUD.ctx; if (!c) return; var o = c.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); var g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + dur + 0.02); },
  sfx: function (k) {
    var c = AUD.ctx; if (!c || !S.cfg.snd) return; var t = c.currentTime + 0.005;
    if (k === 'btn') { AUD.noise(t, 0.025, 3200, 2, 0.25); AUD.tone(t, 1900, 0.03, 'square', 0.03); }
    else if (k === 'switch') { AUD.noise(t, 0.04, 1800, 1.5, 0.45); AUD.noise(t + 0.03, 0.03, 2600, 2, 0.25); }
    else if (k === 'detent') { AUD.noise(t, 0.03, 2200, 3, 0.35); }
    else if (k === 'breaker') { AUD.tone(t, 70, 0.3, 'sine', 0.5, 40); AUD.noise(t, 0.12, 900, 0.8, 0.7, 'lowpass'); AUD.noise(t + 0.02, 0.08, 3000, 2, 0.3); }
    else if (k === 'deny') { AUD.tone(t, 240, 0.14, 'square', 0.05); AUD.tone(t + 0.15, 180, 0.18, 'square', 0.05); }
    else if (k === 'step') { AUD.noise(t, 0.035, 700, 2.5, 0.18); }
    else if (k === 'click') { AUD.noise(t, 0.012, 2500, 1.2, 0.35); }
    else if (k === 'chime') { AUD.tone(t, 880, 0.9, 'sine', 0.12); AUD.tone(t, 1320, 0.7, 'sine', 0.06); }
    else if (k === 'ok') { AUD.tone(t, 660, 0.14, 'triangle', 0.12); AUD.tone(t + 0.12, 990, 0.25, 'triangle', 0.12); }
    else if (k === 'done') { [523, 659, 784, 1047].forEach(function (f, i) { AUD.tone(t + i * 0.13, f, 0.5, 'triangle', 0.13); }); }
    else if (k === 'trip') { AUD.tone(t, 60, 0.4, 'sine', 0.6, 35); AUD.noise(t, 1.8, 1200, 0.6, 0.35); AUD.noise(t + 0.05, 1.6, 400, 0.8, 0.4, 'lowpass'); }
  },
  click: function (when) { var c = AUD.ctx; if (!c) return; AUD.noise(when, 0.012, 2600, 1.1, 0.4); },
  tick: function (dtReal) {
    var c = AUD.ctx; if (!c || !S.cfg.snd) return; var now = c.currentTime;
    var on = ANNC.horn && !S.paused, ph = Math.floor(now * 2.6) % 2; AUD.hornG.gain.setTargetAtTime(on ? (ph ? 0.13 : 0.03) : 0, now, 0.02);
    if (ANNC.chime) { ANNC.chime = 0; AUD.sfx('chime'); }
    var p = S.p; if (p.audio && !S.paused) { var rate = 0; if (!p.srBlk[0]) rate = NI.sr[0]; else if (!p.srBlk[1]) rate = NI.sr[1]; rate *= S.ts;
      var div = 1; while (rate / div > 45) div *= 10; S.audDiv = div; var n = poisson(rate / div * dtReal); for (var i = 0; i < Math.min(n, 40); i++) AUD.click(now + Math.random() * dtReal); }
  }
};
var VOICE = null;
function speak(txt) { try { if (!S.cfg.voice || !window.speechSynthesis) return; var u = new SpeechSynthesisUtterance(txt); if (!VOICE) { var vs = speechSynthesis.getVoices(); VOICE = vs.filter(function (v) { return /en-GB/i.test(v.lang); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null; } if (VOICE) u.voice = VOICE; u.lang = 'en-GB'; u.rate = 1.02; u.pitch = 0.95; u.volume = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }

/* ================================================================ camera, views and walking ================================================================ */
var CAM = { x: 0, y: 1.65, z: 2.7, yaw: 0, pitch: -0.04, fov: 60, tw: null, view: 'start' };
var VIEWDEF = {
  start: [null, [0, 1.65, CZ + 2.15], [0, 1.5, -6], 62, 'Operator position'],
  room: [null, [0, 3.1, ZF - 1.0], [0, 1.0, -4], 70, 'Whole control room'],
  rx: ['rx', [0, 1.75, 2.45], [0, 1.55, -0.75], 54, 'Reactor board'],
  nis: ['rx', [-1.2, 1.92, 0.7], [-1.2, 1.88, -0.75], 40, 'Nuclear instruments (NIS)'],
  rods: ['rx', [0.05, 1.95, 0.7], [0.05, 1.9, -0.75], 40, 'Rod position (DRPI)'],
  params: ['rx', [1.15, 1.92, 0.7], [1.15, 1.88, -0.75], 40, 'Reactor parameters & recorders'],
  ann: ['rx', [-1.0, 1.68, 0.72], [-1.0, 0.98, -0.42], 54, 'Annunciator & source range desk'],
  rodctl: ['rx', [0.0, 1.66, 0.7], [0.0, 0.98, -0.42], 52, 'Rod control desk'],
  rtb: ['rx', [1.2, 1.68, 0.72], [1.2, 0.98, -0.42], 54, 'Trip breakers & trip buttons'],
  p10: ['rx', [-1.1, 1.62, 0.8], [-1.1, 0.92, -0.2], 52, 'P-10 trip blocks'],
  console: [null, [0, 1.4, CZ + 1.25], [0, 1.08, CZ - 0.25], 50, 'Console screens'],
  onem: [null, [0, 1.15, CZ + 0.42], [0, 1.125, CZ - 0.25], 44, '1/M startup screen'], trends: [null, [-0.6, 1.15, CZ + 0.45], [-0.82, 1.125, CZ - 0.18], 44, 'Trends screen'], proc: [null, [0.6, 1.15, CZ + 0.45], [0.82, 1.125, CZ - 0.18], 44, 'Procedure & alarm list screen'],
  status: [null, [-0.27, 1.16, SZ + 0.48], [-0.36, 1.125, SZ - 0.2], 46, 'Supervisor: plant status'], log: [null, [0.27, 1.16, SZ + 0.48], [0.36, 1.125, SZ - 0.2], 46, 'Supervisor: shift log'],
  mimic: [null, [-3.6, 1.95, ZF - 5.2], [-3.6, 2.05, ZF], 50, 'Plant overview wall'], alarms: [null, [3.4, 1.9, ZF - 3.4], [3.4, 1.95, ZF], 50, 'Alarm summary wall'],
  board: [null, [-RX + 2.4, 1.65, 9.9], [-RX, 1.65, 9.9], 50, 'Shift turnover whiteboard']
};
SECDEF.forEach(function (d) { if (d.id !== 'rx') { VIEWDEF[d.id] = [d.id, [0, 1.75, 2.45], [0, 1.55, -0.75], 54, d.short + ' board']; VIEWDEF[d.id + 'D'] = [d.id, [0, 1.9, 1.25], [0, 0.95, -0.3], 58, d.short + ' desk controls']; } });
var VIEWGROUPS = [['Reactor', ['rx', 'nis', 'rods', 'params', 'rodctl', 'ann', 'rtb', 'p10']], ['Primary side boards', ['esf', 'aux', 'cvcs', 'pzr', 'rcs']], ['Secondary side boards', ['sg', 'ms', 'tb', 'gen', 'elec']], ['Desk close-ups', ['esfD', 'auxD', 'cvcsD', 'pzrD', 'rcsD', 'sgD', 'msD', 'tbD', 'genD', 'elecD']], ['Screens', ['console', 'onem', 'trends', 'proc', 'mimic', 'alarms', 'status', 'log', 'board']], ['Room', ['start', 'room']]];
function viewTarget(id) {
  var v = VIEWDEF[id]; if (!v) return null; var P = new THREE.Vector3(v[1][0], v[1][1], v[1][2]), L = new THREE.Vector3(v[2][0], v[2][1], v[2][2]);
  if (v[0]) { var g = SEC[v[0]].g; g.updateMatrixWorld(); P = g.localToWorld(P); L = g.localToWorld(L); }
  var d = L.clone().sub(P); return { x: P.x, y: P.y, z: P.z, yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), fov: v[3] };
}
function goView(id, instant) { var t = viewTarget(id); if (!t) return; CAM.view = id; if (instant) { Object.assign(CAM, t); CAM.tw = null; return; }
  var dy = t.yaw - CAM.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; t.yaw = CAM.yaw + dy;
  CAM.tw = { a: { x: CAM.x, y: CAM.y, z: CAM.z, yaw: CAM.yaw, pitch: CAM.pitch, fov: CAM.fov }, b: t, t: 0, dur: 0.85 }; HUD.dirty = true; }
function blocked(x, z) {
  if (x < -RX + 0.4 || x > RX - 0.4 || z < ZB + 0.75 || z > ZF - 0.45) return true;
  var r = Math.hypot(x, z - BCZ), th = Math.atan2(x, -(z - BCZ)) * 180 / Math.PI, A = Math.abs(SECDEF[0].a) + BSTEP / 2 + 2; if (Math.abs(th) <= A && r > BR - 0.5 && r < BR + 1.45) return true;
  if (Math.abs(x) < 1.75 && z > CZ - 0.65 && z < CZ + 0.65) return true; if (Math.abs(x) < 1.4 && z > SZ - 0.65 && z < SZ + 0.65) return true;
  if (x > -9.3 && x < -7.1 && z > ZF - 0.7) return true; return false;
}
var KEYS = {};
function moveCam(dt) {
  var f = 0, s = 0; if (KEYS.w || KEYS.arrowup) f += 1; if (KEYS.s || KEYS.arrowdown) f -= 1; if (KEYS.a || KEYS.arrowleft) s -= 1; if (KEYS.d || KEYS.arrowright) s += 1;
  if (JOY.on) { f += -JOY.y; s += JOY.x; }
  if (CAM.tw) { var tw = CAM.tw; tw.t += dt / tw.dur; var k = tw.t >= 1 ? 1 : tw.t * tw.t * (3 - 2 * tw.t); ['x', 'y', 'z', 'yaw', 'pitch', 'fov'].forEach(function (q) { CAM[q] = lerp(tw.a[q], tw.b[q], k); }); if (tw.t >= 1) CAM.tw = null; if (!(f || s)) return; CAM.tw = null; }
  if (!(f || s)) return; var m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; }
  var sp = (KEYS.shift ? 3.6 : 2.0) * dt, nx = CAM.x + (-Math.sin(CAM.yaw) * f + Math.cos(CAM.yaw) * s) * sp, nz = CAM.z + (-Math.cos(CAM.yaw) * f - Math.sin(CAM.yaw) * s) * sp, was = blocked(CAM.x, CAM.z);
  if (!blocked(nx, nz) || was) { CAM.x = nx; CAM.z = nz; } else if (!blocked(nx, CAM.z)) CAM.x = nx; else if (!blocked(CAM.x, nz)) CAM.z = nz;
  CAM.bobT = (CAM.bobT || 0) + sp * 4.4; CAM.y += (1.65 + Math.sin(CAM.bobT) * 0.022 - CAM.y) * (1 - Math.exp(-dt * 9)); CAM.fov += (60 - CAM.fov) * (1 - Math.exp(-dt * 3)); if (CAM.view !== 'walk') { CAM.view = 'walk'; HUD.dirty = true; }
}
/* when the mission card covers the left of a wide screen, shift the picture right so what you're looking at sits in the clear part */
var OFS = { cur: 0, w: 0, h: 0 };
function applyCam(dt) { var c = R3.cam; if (c.position.x !== CAM.x || c.position.z !== CAM.z || c.rotation.y !== CAM.yaw || c.rotation.x !== CAM.pitch || OFS.f !== CAM.fov) { PTR.hoverDirty = true; OFS.f = CAM.fov; } c.position.set(CAM.x, CAM.y, CAM.z); c.rotation.order = 'YXZ'; c.rotation.y = CAM.yaw; c.rotation.x = CAM.pitch;
  var W = root.clientWidth, H = Math.max(1, root.clientHeight), ms = HUD.el.ms, want = 0; if (W > 900 && ms && !ms.hidden && !ms.classList.contains('min') && CAM.view !== 'walk' && CAM.view !== 'start' && CAM.view !== 'room' && !locked()) want = Math.round((ms.offsetWidth + 16) / 2);
  OFS.want = want; OFS.cur += (want - OFS.cur) * (1 - Math.exp(-(dt || 0.016) * 6)); if (Math.abs(OFS.cur - want) < 0.5) OFS.cur = want; var d = Math.round(OFS.cur);
  var asp = W / H, fe = asp < 1 ? Math.min(88, 2 * Math.atan(Math.tan(CAM.fov * 0.92 * Math.PI / 360) / asp) * 180 / Math.PI) : CAM.fov;
  if (d !== OFS.d || W !== OFS.w || H !== OFS.h || Math.abs(c.fov - fe) > 0.01) { OFS.d = d; OFS.w = W; OFS.h = H; c.fov = fe; c.aspect = (W + 2 * d) / H; if (d) c.setViewOffset(W + 2 * d, H, 0, 0, W, H); else c.clearViewOffset(); c.updateProjectionMatrix(); } }

/* ---------- 'show me': fly to the right board and ring the controls ---------- */
var ANCH = { audio: [[-0.53, 0.6]], rtb: [[0.63, 0.52], [0.93, 0.52]], rods: [[-0.16, 0.6], [0.19, 0.58]], srblk: [[-0.9, 0.6], [-0.74, 0.6]], trip: [[1.3, 0.56], [1.6, 0.56]] };
var SHOW = { audio: ['ann', 'audio'], rodctl: ['rodctl', 'rods'], rtb: ['rtb', 'rtb'], rods: ['rods'], onem: ['onem'], nis: ['nis'], srblk: ['ann', 'srblk'], params: ['params'] };
var HL = [];
function clearHL() { HL.forEach(function (h) { h.m.parent && h.m.parent.remove(h.m); }); HL = []; }
function showMe(k) { var s = SHOW[k] || (VIEWDEF[k] ? [k] : null); if (!s) return; goView(s[0]); clearHL(); if (s[1]) ANCH[s[1]].forEach(function (a) { var m = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.095, 40), new THREE.MeshBasicMaterial({ color: 0xffd34a, transparent: true, depthTest: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(a[0], 0.045, -a[1] * SL); m.renderOrder = 10; SEC.rx.desk.add(m); HL.push({ m: m, t: 0 }); }); }

/* ================================================================ pointer: drag to look, click a control, hold the rod lever ================================================================ */
var RC = null, PTR = { down: null, hover: null, hx: 0, hy: 0, pts: {}, pinch: null }, JOY = { on: false, x: 0, y: 0, id: null };
function locked() { return !!R3 && document.pointerLockElement === R3.ren.domElement; }
function toggleLock() { if (locked()) { document.exitPointerLock(); return; } try { var pr = R3.ren.domElement.requestPointerLock(); if (pr && pr.catch) pr.catch(function () { toast('Click the 3D view once, then press L again.', 'warn'); }); } catch (e) {} }
function lockChange() { var on = locked(); if (HUD.el.cross) HUD.el.cross.hidden = !on; hideTip(); hideExplain(); PTR.hoverDirty = true; PTR.down = null; if (S && !S.menu) toast(on ? 'Mouse locked to the centre: move to look, click to use what the dot is on. Press L to unlock.' : 'Mouse unlocked.'); }
function pick(cx, cy) {
  var r = R3.ren.domElement.getBoundingClientRect(); if (locked()) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  var v = new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1);
  RC.setFromCamera(v, R3.cam); RC.far = 14; var hs = RC.intersectObjects(HITS, false); return hs.length ? hs[0] : null;
}
function hitInfo(h) { return h && h.object.userData.hit; }
function onDown(e) {
  if (e.button > 0 && e.pointerType === 'mouse') return; AUD.init(); var el = R3.ren.domElement; try { el.setPointerCapture(e.pointerId); } catch (x) {}
  PTR.pts[e.pointerId] = { x: e.clientX, y: e.clientY };
  var ids = Object.keys(PTR.pts); if (ids.length === 2) { var a = PTR.pts[ids[0]], b = PTR.pts[ids[1]]; PTR.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), fov: CAM.fov }; if (PTR.down && PTR.down.hold) PTR.down.hold(false); PTR.down = null; return; }
  var h = pick(e.clientX, e.clientY), hi = hitInfo(h);
  PTR.down = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, h: h, hold: null, t: performance.now() };
  if (hi && hi.hold) { PTR.down.hold = hi.hold; hi.hold(true, h, RC.ray.clone()); }
  else if (S.cfg.explain && e.pointerType !== 'mouse') { var inf = infoFor(hi), D1 = PTR.down; if (inf) D1.lp = setTimeout(function () { if (PTR.down === D1 && !D1.moved) { D1.explained = true; EXP.touch = true; showExplain(inf, null, null); clearTimeout(HUD.expT); HUD.expT = setTimeout(function () { EXP.touch = false; hideExplain(); }, 7000); } }, 650); }
  if (EXP.touch && !(PTR.down && PTR.down.lp)) { EXP.touch = false; hideExplain(); }
  e.preventDefault();
}
function onMove(e) {
  if (PTR.pts[e.pointerId]) PTR.pts[e.pointerId] = { x: e.clientX, y: e.clientY };
  if (locked()) { var k0 = 0.0021 * CAM.fov / 60; CAM.yaw -= (e.movementX || 0) * k0; CAM.pitch = clamp(CAM.pitch - (e.movementY || 0) * k0, -1.35, 1.35); CAM.tw = null; return; }
  if (PTR.pinch) { var ids = Object.keys(PTR.pts); if (ids.length === 2) { var a = PTR.pts[ids[0]], b = PTR.pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y); CAM.fov = clamp(PTR.pinch.fov * PTR.pinch.d / Math.max(20, d), 16, 75); CAM.tw = null; } return; }
  var D0 = PTR.down;
  if (D0 && D0.id === e.pointerId) { var dx = e.clientX - D0.lx, dy = e.clientY - D0.ly; if (Math.hypot(e.clientX - D0.x, e.clientY - D0.y) > 6) D0.moved = true;
    if (D0.moved && D0.lp) { clearTimeout(D0.lp); D0.lp = 0; }
    if (D0.moved && !D0.hold) { var k = 0.0042 * CAM.fov / 60; var sg = e.pointerType === 'mouse' ? -1 : 1; CAM.yaw += sg * dx * k; CAM.pitch = clamp(CAM.pitch + sg * dy * k, -1.35, 1.35); CAM.tw = null; }
    D0.lx = e.clientX; D0.ly = e.clientY; return; }
  if (e.pointerType === 'mouse') { PTR.hx = e.clientX; PTR.hy = e.clientY; PTR.hoverDirty = true; if (EXP.shown && !EXP.touch && Math.hypot(e.clientX - EXP.x, e.clientY - EXP.y) > 60) { hideExplain(); EXP.t0 = performance.now(); } }
}
function onUp(e) {
  delete PTR.pts[e.pointerId]; if (PTR.pinch) { if (Object.keys(PTR.pts).length < 2) PTR.pinch = null; return; }
  var D0 = PTR.down; if (!D0 || D0.id !== e.pointerId) return; PTR.down = null;
  if (D0.lp) clearTimeout(D0.lp);
  if (D0.hold) { D0.hold(false); return; }
  if (D0.moved || D0.explained) return;
  activate(D0.h, e.pointerType !== 'mouse');
}
function activate(h, touch) {
  var hi = hitInfo(h); if (!hi) return; hideExplain(); EXP.t0 = performance.now();
  if (hi.act) { hi.act(h); HUD.dirty = true; return; }
  if (hi.view) { goView(hi.view); return; }
  if (hi.tip) { showTip(typeof hi.tip === 'function' ? hi.tip() : hi.tip, touch ? null : PTR.hx, touch ? null : PTR.hy, true); }
}
function onWheel(e) { e.preventDefault(); CAM.fov = clamp(CAM.fov * (1 + e.deltaY * 0.0012), 16, 75); CAM.tw = null; }
function hover() {
  if (S.menu) { hideTip(); return; }
  if (locked()) { var lr = R3.ren.domElement.getBoundingClientRect(); PTR.hx = lr.left + lr.width / 2; PTR.hy = lr.top + lr.height / 2; }
  if (!PTR.hoverDirty || PTR.down) return; PTR.hoverDirty = false; var h = pick(PTR.hx, PTR.hy), hi = hitInfo(h); PTR.hover = hi || null; PTR.hoverObj = hi ? h.object : null; if (EXP.shown && EXP.obj === PTR.hoverObj) return;
  R3.ren.domElement.style.cursor = hi && (hi.act || hi.hold || hi.view) ? 'pointer' : PTR.down ? 'grabbing' : 'grab';
  if (hi && hi.tip) showTip((typeof hi.tip === 'function' ? hi.tip() : hi.tip) + (hi.hold ? '  ·  hold' : hi.act ? '  ·  click' : hi.view ? '  ·  click to zoom in' : ''), PTR.hx, PTR.hy); else hideTip();
}
function onKey(e, down) {
  var k = (e.key || '').toLowerCase(); if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
  if (!root || root.hidden) return; if (down) AUD.init();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].indexOf(k) >= 0) { KEYS[k] = down; if (k.indexOf('arrow') === 0) e.preventDefault(); return; }
  if (S.menu) { if (down && k === 'escape') { e.preventDefault(); closeMenu(); } return; }
  if (k === 'o' || k === 'i') { if (down && !e.repeat) ACT.lever(k === 'o' ? 1 : -1); else if (!down && S.leverDir === (k === 'o' ? 1 : -1)) ACT.lever(0); return; }
  if (!down || e.repeat) return;
  if (k === 'escape') { e.preventDefault(); if (CAM.view !== 'start' && CAM.view !== 'walk') goView('start'); else pauseMenu(); }
  else if (k >= '1' && k <= '5') ACT.select(['SA', 'SB', 'SC', 'SD', 'MAN'][+k - 1]);
  else if (k === 'k') ANNC.ack(); else if (k === 'r') ANNC.reset(); else if (k === 'l') toggleLock(); else if (k === 'j') ANNC.silence();
  else if (k === 't') setTS(S.ts === 1 ? 5 : S.ts === 5 ? 20 : 1); else if (k === 'p' || k === ' ') { e.preventDefault(); setPause(!S.paused); }
  else if (k === 'e') { var r = R3.ren.domElement.getBoundingClientRect(); activate(pick(r.left + r.width / 2, r.top + r.height / 2)); }
  else if (k === 'x') { S.cfg.explain = !S.cfg.explain; saveCfg(); toast(S.cfg.explain ? '💡 Explain mode on.' : 'Explain mode off.'); if (!S.cfg.explain) hideExplain(); }
  else if (k === 'h') helpMenu(); else if (k === 'v') viewsMenu(); else if (k === 'g') { S.cfg.assist = !S.cfg.assist; HUD.dirty = true; saveCfg(); } else if (k === 'c') { S.cfg.quick = !S.cfg.quick; HUD.dirty = true; saveCfg(); }
}
var kd = function (e) { onKey(e, true); }, ku = function (e) { onKey(e, false); };

/* ================================================================ the session ================================================================ */
function newPlant() { var p = freshPlant(); p.audio = true; return p; }
function makeSession(sv) {
  var cfg = Object.assign({ gfx: 'high', snd: true, voice: true, assist: true, explain: true, shift: 30, quick: !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) }, sv.cfg || {});
  S = { p: null, cfg: cfg, ts: 1, paused: true, log: [], lampTest: false, clock0: 7 * 3600 + 12 * 60, leverDir: 0, audDiv: 1, menu: null, shiftUsed: 0, shiftWarn: false, shiftOver: false, st: { trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }, lastTrip: sv.lastTrip || (Date.now() - 37 * 86400000) };
  S.toast = toast; S.sfx = function (k) { AUD.sfx(k); };
  S.addLog = function (t) { S.log.push([D.clock, t]); if (S.log.length > 200) S.log.shift(); };
  S.daysSince = function () { return Math.max(0, (Date.now() - S.lastTrip) / 86400000); };
  S.onTrip = onTrip; S.onAlarm = function () { if (S.ts > 1) { setTS(1); toast('Slowed to ×1: new alarm.', 'warn'); } };
  return S;
}
function ecpBand() { var rc = function (pc) { var q = { rods: {} }; BANKS.forEach(function (b) { q.rods[b] = SDB.indexOf(b) >= 0 ? TOP : 0; }); q.pc = pc; setOverlap(q); var r = 0; CTB.forEach(function (b) { r -= WORTH[b] * (1 - bankF(q.rods[b])); }); return r; };
  var r0 = rc(3 * OVL + ECP_D), lo = null, hi = null; for (var pc = 0; pc <= PCMAX; pc++) { if (Math.abs(rc(pc) - r0) <= 500) { if (lo == null) lo = pc; hi = pc; } } return [lo, hi]; }
function onTrip(cause) {
  var p = S.p;
  if (!p.dropping) { AUD.sfx('breaker'); S.addLog('Reactor trip breakers opened by ' + (cause === 'MAN' ? 'manual trip' : TRIPS[cause]) + ' (all rods were already in)'); toast('Trip breakers open. Every rod was already in, so nothing dropped.', 'ok'); HUD.dirty = true; save(); return; }
  if (MS.phase() === 'shut') MS.shutTrips++;
  S.st.trips++; S.lastTrip = Date.now(); p.everCrit = false; p.c0 = null; p.oneM = []; p.lastPc = null; S.st.pts = 0; S.st.critPc = null;
  AUD.sfx('trip'); setTS(1); speak('Reactor trip. Reactor trip.'); S.addLog('REACTOR TRIP: ' + TRIPS[cause]); HUD.dirty = true;
  var ph = MS.phase(); if (ph === 'pre' || ph === 'start') { var had = MS.done.slice(); MS.resetStart(); HUD.el.ms.dataset.cur = ''; if (cause !== 'MAN' || had.some(Boolean)) tripMenu(cause); }
  else toast('⚠ Reactor trip: ' + TRIPS[cause], 'bad');
  save();
}
function setTS(v) { S.ts = v; HUD.dirty = true; }
function setPause(v) { S.paused = v; HUD.dirty = true; }

/* ================================================================ HUD (HTML over the 3D view) ================================================================ */
var CSS = '.cpn{position:fixed;inset:0;z-index:2147480000;background:#0b0f14;color:#e8eef4;font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}' +
  '.cpn *{box-sizing:border-box}.cpn canvas.cpn3d{position:absolute;inset:0;width:100%!important;height:100%!important;display:block;cursor:grab;outline:none}' +
  '.cpn button{font:inherit;color:inherit;cursor:pointer;border:0;border-radius:10px}' +
  '.cpnbar{position:absolute;top:max(8px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right));display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 16px);pointer-events:none}' +
  '.cpnbar>*{pointer-events:auto}.cpng{display:flex;background:rgba(10,16,24,.82);border:1px solid rgba(140,180,220,.22);border-radius:12px;padding:3px;gap:2px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
  '.cpng button{background:transparent;padding:7px 10px;min-height:36px;font-weight:700;font-size:13px}.cpng button:hover{background:rgba(255,255,255,.08)}.cpng button[aria-pressed=true]{background:#ffd34a;color:#1a1300}' +
  '.cpnclk{font:700 13px ui-monospace,Menlo,Consolas,monospace;padding:9px 10px;color:#7fd1ff}' +
  '.cpnms{position:absolute;top:max(8px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));width:min(380px,calc(100% - 16px));background:rgba(10,16,24,.88);border:1px solid rgba(255,211,74,.35);border-radius:14px;padding:12px 14px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 10px 30px rgba(0,0,0,.35)}' +
  '.cpnms h3{margin:0 0 2px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ffd34a}.cpnms .t{font-weight:800;font-size:15.5px;line-height:1.3;margin:2px 0 6px}.cpnms .h{font-size:13px;color:#c5d2de;max-height:30vh;overflow:auto}.cpnms .h b{color:#fff}' +
  '.cpnms .st{margin-top:8px;font:600 12.5px ui-monospace,Menlo,Consolas,monospace;color:#7fd1ff;background:rgba(0,0,0,.3);border-radius:8px;padding:6px 8px}.cpnms .row{display:flex;gap:6px;margin-top:9px;align-items:center;flex-wrap:wrap}' +
  '.cpnms .dots{display:flex;gap:4px;flex:1}.cpnms .dots i{height:6px;flex:1;border-radius:4px;background:rgba(255,255,255,.14)}.cpnms .dots i.d{background:#59e07a}.cpnms .dots i.c{background:#ffd34a}' +
  '.cpnb{background:#ffd34a;color:#1a1300;font-weight:800;padding:8px 12px;min-height:36px}.cpnb2{background:rgba(255,255,255,.1);font-weight:700;padding:8px 12px;min-height:36px}.cpnms.min .h,.cpnms.min .st{display:none}' +
  '.cpnurg{position:absolute;left:50%;transform:translateX(-50%);top:max(64px,calc(env(safe-area-inset-top) + 56px));max-width:calc(100% - 24px);background:#b3261e;color:#fff;font-weight:800;padding:9px 14px;border-radius:12px;box-shadow:0 0 0 3px rgba(255,90,72,.4);animation:cpnfl 1s steps(2) infinite;text-align:center;pointer-events:none}@keyframes cpnfl{50%{background:#7a1510}}' +
  '.cpnas{position:absolute;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom));width:min(300px,calc(100% - 16px));background:rgba(10,16,24,.86);border:1px solid rgba(140,180,220,.22);border-radius:14px;padding:10px 12px;font:600 12.5px ui-monospace,Menlo,Consolas,monospace}' +
  '.cpnas h3{margin:0 0 6px;font:800 11px system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9fc9ea;display:flex;justify-content:space-between}.cpnas .r{display:flex;justify-content:space-between;gap:8px;padding:1px 0}.cpnas .r span:first-child{color:#8ea6bc}.cpnas .k{font-size:20px;font-weight:800}' +
  '.cpnqc{position:absolute;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));width:min(340px,calc(100% - 16px));background:rgba(10,16,24,.9);border:1px solid rgba(140,180,220,.22);border-radius:14px;padding:10px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
  '.cpnqc h3{margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9fc9ea}.cpnqc .g{display:grid;gap:6px;margin-bottom:6px}.cpnqc button{background:#1d2a38;padding:8px 4px;font-weight:800;font-size:12.5px;min-height:38px;border:1px solid rgba(255,255,255,.08)}' +
  '.cpnqc button[aria-pressed=true]{background:#ffd34a;color:#1a1300}.cpnqc .on{background:#7a1510!important;color:#fff}.cpnqc .off{background:#0f5132!important;color:#d9ffe6}.cpnqc .hold{min-height:50px;font-size:15px}.cpnqc .hold:active,.cpnqc .hold.dn{background:#ffd34a;color:#1a1300}' +
  '.cpnqc .trip{background:#b3261e!important;color:#fff}.cpnqc .rd{font:700 12px ui-monospace,Menlo,monospace;color:#7fd1ff;display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;margin:2px 2px 8px}' +
  '.cpntip{position:absolute;pointer-events:none;background:rgba(5,9,14,.94);border:1px solid rgba(127,209,255,.4);color:#e8f1f8;padding:7px 10px;border-radius:9px;font-size:13px;max-width:340px;z-index:5;box-shadow:0 6px 18px rgba(0,0,0,.4)}' +
  '.cpntoasts{position:absolute;left:50%;transform:translateX(-50%);bottom:max(14px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;width:min(560px,calc(100% - 24px));z-index:6}' +
  '.cpntoast{background:rgba(10,16,24,.94);border:1px solid rgba(140,180,220,.3);padding:9px 14px;border-radius:12px;font-weight:600;animation:cpnin .25s ease;box-shadow:0 8px 20px rgba(0,0,0,.4);text-align:center}.cpntoast.ok{border-color:#59e07a}.cpntoast.warn{border-color:#ffd34a}.cpntoast.bad{border-color:#ff5a48;background:rgba(80,10,8,.95)}@keyframes cpnin{from{opacity:0;transform:translateY(8px)}}' +
  '.cpnmenu{position:absolute;inset:0;background:radial-gradient(1200px 700px at 50% 30%,rgba(10,30,50,.75),rgba(3,6,10,.94));display:flex;align-items:center;justify-content:center;padding:16px;z-index:10;overflow:auto}' +
  '.cpncard{width:min(760px,100%);max-height:100%;overflow:auto;background:linear-gradient(180deg,#101b27,#0b131c);border:1px solid rgba(140,180,220,.25);border-radius:20px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
  '.cpncard h1{margin:0;font-size:clamp(22px,4vw,32px);line-height:1.15;letter-spacing:-.01em}.cpncard h2{margin:18px 0 8px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#9fc9ea}.cpncard p{color:#c5d2de;margin:8px 0}.cpnsub{color:#ffd34a!important;font-weight:800;margin-top:4px!important}' +
  '.cpnbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.cpnbtns .cpnb,.cpnbtns .cpnb2{padding:12px 18px;font-size:15px}' +
  '.cpnroad{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.cpnroad div{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:9px 11px;font-size:12.5px;color:#9fb3c6}.cpnroad div b{display:block;color:#e8eef4;font-size:13.5px;margin-bottom:2px}.cpnroad div.now{border-color:#ffd34a;background:rgba(255,211,74,.08)}.cpnroad div.now b{color:#ffd34a}' +
  '.cpnset{display:flex;gap:8px;flex-wrap:wrap}.cpnset label{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.05);padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:600}.cpnset input{width:18px;height:18px;accent-color:#ffd34a}' +
  '.cpnflist{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}.cpnflist>div{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;font-size:13px}.cpnflist span{color:#9fb3c6}.cpnflist summary{cursor:pointer;color:#ffd34a;font-weight:700}.cpnflist details p{margin:6px 0;color:#c9d6e2}.cpnflist button{align-self:flex-start}.cpnflist button[disabled]{opacity:.4}' +
  '.cpnviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}.cpnviews button{background:rgba(255,255,255,.06);padding:10px 12px;text-align:left;font-weight:700}.cpnviews button:hover{background:rgba(255,211,74,.18)}' +
  '.cpnkeys{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:13.5px}.cpnkeys kbd{font:700 12px ui-monospace,monospace;background:#1d2a38;border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:2px 7px;white-space:nowrap}' +
  '.cpnstars{font-size:40px;letter-spacing:6px}.cpnscore{display:grid;grid-template-columns:1fr auto;gap:4px 16px;font-size:14px;background:rgba(0,0,0,.25);border-radius:12px;padding:12px 14px}.cpnscore span:nth-child(even){font-weight:800;text-align:right}' +
  '.cpnjoy{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.18);touch-action:none;display:none}.cpnjoy i{position:absolute;left:35px;top:35px;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.3)}' +
  '.cpn.touch .cpnjoy{display:block}.cpn.touch .cpnas{bottom:150px}.cpnhint{position:absolute;left:50%;transform:translateX(-50%);bottom:max(14px,env(safe-area-inset-bottom));background:rgba(10,16,24,.8);padding:7px 14px;border-radius:999px;font-size:12.5px;color:#c5d2de;pointer-events:none;transition:opacity .6s;white-space:nowrap;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis}' +
  '.cpnload{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#0b0f14;z-index:20;font-weight:700;color:#9fc9ea}.cpnload i{width:46px;height:46px;border-radius:50%;border:4px solid rgba(255,211,74,.2);border-top-color:#ffd34a;animation:cpnsp 1s linear infinite}@keyframes cpnsp{to{transform:rotate(360deg)}}' +
  '.cpnx{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.55);pointer-events:none;z-index:4}.cpnvig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.38) 100%)}' +
  '.cpnshift{font:800 13px ui-monospace,Menlo,Consolas,monospace;padding:9px 6px 9px 10px;color:#c5f2d4}.cpnshift.low{color:#ffd34a}.cpnshift.ot{color:#ff9f43}' +
  '.cpnms .tabs{display:flex;gap:4px;margin:6px 0 4px}.cpnms .tabs button{flex:1;background:rgba(255,255,255,.07);padding:7px 4px;font-weight:800;font-size:12.5px;min-height:34px}.cpnms .tabs button small{opacity:.7;font-weight:700}.cpnms .tabs button[aria-pressed=true]{background:#ffd34a;color:#1a1300}' +
  '.cpnms .sub{font-size:11.5px;color:#8ea6bc;margin:4px 0 2px}.cpnms ol.cl{list-style:none;margin:4px 0 0;padding:0;max-height:max(150px,min(52vh,calc(100vh - 410px)));overflow:auto;display:flex;flex-direction:column;gap:3px}' +
  '.cpnms ol.cl li{display:flex;gap:8px;align-items:flex-start;padding:6px 6px;border-radius:9px;background:rgba(255,255,255,.03);font-size:13px;line-height:1.3}.cpnms ol.cl li.c{background:rgba(255,211,74,.12);outline:1px solid rgba(255,211,74,.4)}.cpnms ol.cl li.d .tx{color:#8fb59f}' +
  '.cpnms ol.cl .ic{width:16px;flex:none;font-weight:800;color:#58738c}.cpnms ol.cl li.d .ic{color:#59e07a}.cpnms ol.cl li.c .ic{color:#ffd34a}.cpnms ol.cl .tx{flex:1;min-width:0}.cpnms ol.cl .tx small{display:block;font:600 11.5px ui-monospace,Menlo,monospace;color:#7fd1ff;margin-top:2px}' +
  '.cpnms ol.cl .bt{display:flex;gap:3px;flex:none}.cpnms ol.cl .bt button{background:rgba(255,255,255,.08);width:30px;height:28px;padding:0;font-size:13px}.cpnms ol.cl .bt button:hover{background:rgba(255,211,74,.25)}' +
  '.cpnexp{position:absolute;z-index:7;pointer-events:none;width:min(340px,calc(100% - 16px));background:rgba(8,14,22,.95);border:1px solid rgba(255,211,74,.45);border-radius:14px;padding:11px 13px;box-shadow:0 12px 30px rgba(0,0,0,.5);animation:cpnin .2s ease}' +
  '.cpnexp b{display:block;color:#ffd34a;font-size:14.5px;margin-bottom:4px}.cpnexp p{margin:4px 0 0;font-size:13px;color:#d9e4ee;line-height:1.4}.cpnexp p.r{color:#a9bccd}.cpnexp p.r span{color:#7fd1ff;font-weight:700}' +
  '.cpnring{position:absolute;z-index:7;pointer-events:none;width:22px;height:22px}.cpnseg{display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-top:8px}.cpnseg span{font-weight:700;margin-right:6px;color:#c5d2de}.cpnseg button{background:rgba(255,255,255,.07);padding:8px 12px;font-weight:700}.cpnseg button[aria-pressed=true]{background:#ffd34a;color:#1a1300}' +
  '.cpnlog{background:rgba(0,0,0,.25);border-radius:12px;padding:10px 12px;font-size:13px;color:#c5d2de;display:flex;flex-direction:column;gap:4px;max-height:220px;overflow:auto}.cpnlog b{font-family:ui-monospace,Menlo,monospace;color:#7fd1ff;margin-right:6px}' +
  '@media (max-height:520px){.cpnms .h{display:none}.cpnms{padding:8px 10px}.cpnms ol.cl{max-height:48vh}.cpnas{display:none!important}.cpnqc{padding:6px}.cpnqc h3{display:none}.cpnqc button{min-height:30px;padding:5px 3px}.cpnqc .hold{min-height:38px}}' +
  '@media (max-width:700px){.cpnms{width:calc(100% - 16px);top:auto;bottom:max(8px,env(safe-area-inset-bottom));padding:10px 12px}.cpnms .h{max-height:22vh}.cpnas{display:none}.cpnqc{bottom:auto;top:max(56px,calc(env(safe-area-inset-top) + 50px));width:min(300px,calc(100% - 16px))}.cpn.touch .cpnjoy{bottom:auto;top:45%}.cpnhint{display:none}}' +
  '@media (prefers-reduced-motion:reduce){.cpnurg{animation:none}.cpntoast{animation:none}}';
var HUD = { dirty: true, el: {}, t: 0 };
function h(tag, cls, html, parent) { var e = el(tag, cls, html); if (parent) parent.appendChild(e); return e; }
function buildHUD() {
  var E = HUD.el;
  E.bar = h('div', 'cpnbar', null, root);
  E.time = h('div', 'cpng', '<span class="cpnshift" data-k="shift" title="Time left on your shift"></span><span class="cpnclk" data-k="clk" title="Station time"></span><button data-ts="0" aria-label="Pause">❚❚</button><button data-ts="1">×1</button><button data-ts="5">×5</button><button data-ts="20">×20</button>', E.bar);
  E.tools = h('div', 'cpng', '<button data-b="views" title="Views (V)">🎥 Views</button><button data-b="explain" title="Explain mode: rest the pointer on anything for 3 seconds (X)">💡</button><button data-b="quick" title="Quick controls (C)">🎛</button><button data-b="assist" title="Instructor assist (G)">🎓</button><button data-b="snd" title="Sound">🔊</button><button data-b="help" title="Help (H)">?</button><button data-b="menu" title="Menu (Esc)">☰</button><button data-b="exit" title="Exit">✕</button>', E.bar);
  E.ms = h('div', 'cpnms', null, root); E.urg = h('div', 'cpnurg', null, root); E.urg.hidden = true;
  E.as = h('div', 'cpnas', null, root); E.qc = h('div', 'cpnqc', null, root); buildQC();
  E.tip = h('div', 'cpntip', null, root); E.tip.hidden = true; E.exp = h('div', 'cpnexp', null, root); E.exp.hidden = true;
  E.ring = h('div', 'cpnring', '<svg viewBox="0 0 20 20" width="22" height="22"><circle cx="10" cy="10" r="8" fill="rgba(5,9,14,.6)" stroke="rgba(255,255,255,.18)" stroke-width="2.5"/><circle cx="10" cy="10" r="8" fill="none" stroke="#ffd34a" stroke-width="2.5" stroke-dasharray="50.3" stroke-dashoffset="50.3" transform="rotate(-90 10 10)"/></svg>', root); E.ring.hidden = true; E.toasts = h('div', 'cpntoasts', null, root);
  E.hint = h('div', 'cpnhint', 'Drag to look · WASD to walk · Click a control · Scroll to zoom · L locks the mouse · Rest on anything for 3 s to learn what it does', root);
  E.joy = h('div', 'cpnjoy', '<i></i>', root); E.cross = h('div', 'cpnx', null, root); E.cross.hidden = true; var vg = el('div', 'cpnvig'); root.insertBefore(vg, R3.ren.domElement.nextSibling);
  E.bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init();
    if (b.dataset.ts != null) { var v = +b.dataset.ts; if (v === 0) setPause(!S.paused); else { setTS(v); setPause(false); } }
    var k = b.dataset.b; if (k === 'explain') { S.cfg.explain = !S.cfg.explain; saveCfg(); toast(S.cfg.explain ? '💡 Explain mode on: rest the pointer on any control for 3 seconds' + (root.classList.contains('touch') ? ' (or press and hold it)' : '') + '.' : 'Explain mode off.'); if (!S.cfg.explain) hideExplain(); } if (k === 'views') viewsMenu(); else if (k === 'quick') { S.cfg.quick = !S.cfg.quick; saveCfg(); } else if (k === 'assist') { S.cfg.assist = !S.cfg.assist; saveCfg(); } else if (k === 'snd') { S.cfg.snd = !S.cfg.snd; AUD.vol(); saveCfg(); } else if (k === 'help') helpMenu(); else if (k === 'menu') pauseMenu(); else if (k === 'exit') close();
    HUD.dirty = true; });
  E.ms.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init(); var m = b.dataset.m, ph = MS.phase(), P, it;
    if (m === 'show' || m === 'verify') { P = phaseDef(ph); it = firstOpen(P.list, MS[P.fl]); if (m === 'show' && P.list[it]) showMe(P.list[it].show); if (m === 'verify') verifyPre(it); }
    if (m === 'ishow') { P = phaseDef(b.dataset.p); showMe(P.list[+b.dataset.i].show); }
    if (m === 'iver') verifyPre(+b.dataset.i);
    if (m === 'list') { MS.view = 'list'; MS.tab = ph === 'free' ? (MS.shutDone ? 'shut' : MS.ascDone ? 'asc' : 'start') : ph; } if (m === 'step') MS.view = 'step'; if (m === 'tab') MS.tab = b.dataset.t;
    if (m === 'shut') startShutdown(); if (m === 'asc') startAsc(); if (m === 'faults') faultsMenu();
    if (m === 'min') { E.ms.classList.toggle('min'); b.textContent = E.ms.classList.contains('min') ? '▾' : '▴'; return; }
    E.ms.dataset.cur = ''; HUD.dirty = true; });
  var jp = function (e) { var r = E.joy.getBoundingClientRect(), x = clamp((e.clientX - r.left - 60) / 45, -1, 1), y = clamp((e.clientY - r.top - 60) / 45, -1, 1); JOY.x = x; JOY.y = y; E.joy.firstChild.style.transform = 'translate(' + x * 35 + 'px,' + y * 35 + 'px)'; };
  E.joy.addEventListener('pointerdown', function (e) { JOY.on = true; JOY.id = e.pointerId; try { E.joy.setPointerCapture(e.pointerId); } catch (x) {} jp(e); e.stopPropagation(); });
  E.joy.addEventListener('pointermove', function (e) { if (JOY.on && e.pointerId === JOY.id) jp(e); });
  var je = function () { JOY.on = false; JOY.x = JOY.y = 0; E.joy.firstChild.style.transform = ''; }; E.joy.addEventListener('pointerup', je); E.joy.addEventListener('pointercancel', je);
  setTimeout(function () { if (E.hint) E.hint.style.opacity = '0'; }, 14000);
}
function buildQC() {
  var q = HUD.el.qc; q.innerHTML = '<h3>Quick controls · reactor desk</h3><div class="rd" data-k="rd"></div>' +
    '<div class="g" style="grid-template-columns:1fr 1fr"><button data-q="rtb0">RTB A</button><button data-q="rtb1">RTB B</button></div>' +
    '<div class="g" style="grid-template-columns:repeat(5,1fr)">' + ['MAN', 'SA', 'SB', 'SC', 'SD'].map(function (b) { return '<button data-sel="' + b + '">' + b + '</button>'; }).join('') + '</div>' +
    '<div class="g" style="grid-template-columns:1fr 1fr"><button class="hold" data-hold="1">▲ OUT (hold)</button><button class="hold" data-hold="-1">▼ IN (hold)</button></div>' +
    '<div class="g" style="grid-template-columns:1fr 1fr 1fr 1fr"><button data-q="blk0">SR BLK A</button><button data-q="blk1">SR BLK B</button><button data-q="ack">ACK</button><button data-q="reset">RESET</button></div>' +
    '<div class="g"><button class="trip" data-q="trip">⚠ REACTOR TRIP</button></div>';
  q.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init(); var k = b.dataset.q;
    if (b.dataset.sel) ACT.select(b.dataset.sel);
    if (k === 'rtb0' || k === 'rtb1') { var i = +k[3]; ACT.rtb(i, !S.p.rtb[i]); } if (k === 'blk0' || k === 'blk1') { S.sfx('btn'); ACT.srBlock(+k[3]); }
    if (k === 'ack') { S.sfx('btn'); ANNC.ack(); } if (k === 'reset') { S.sfx('btn'); ANNC.reset(); } if (k === 'trip') ACT.trip(); HUD.dirty = true; });
  [].forEach.call(q.querySelectorAll('[data-hold]'), function (b) { var d = +b.dataset.hold, up = function () { b.classList.remove('dn'); if (S.leverDir === d) ACT.lever(0); };
    b.addEventListener('pointerdown', function (e) { AUD.init(); b.classList.add('dn'); try { b.setPointerCapture(e.pointerId); } catch (x) {} ACT.lever(d); e.preventDefault(); });
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); b.addEventListener('contextmenu', function (e) { e.preventDefault(); }); });
}
function showTip(t, x, y, sticky) { var E = HUD.el.tip; E.textContent = t; E.hidden = false; var r = root.getBoundingClientRect();
  if (x == null) { E.style.left = '50%'; E.style.top = '45%'; E.style.transform = 'translate(-50%,-50%)'; } else { E.style.transform = ''; var w = E.offsetWidth, hh = E.offsetHeight; E.style.left = clamp(x + 16, 8, r.width - w - 8) + 'px'; E.style.top = clamp(y + 18, 8, r.height - hh - 8) + 'px'; }
  clearTimeout(HUD.tipT); if (sticky) HUD.tipT = setTimeout(hideTip, 3500); }
function hideTip() { if (HUD.el.tip) HUD.el.tip.hidden = true; }
function toast(msg, kind) { var E = HUD.el.toasts; if (!E) return; var t = h('div', 'cpntoast' + (kind ? ' ' + kind : ''), esc(msg), E); while (E.children.length > 3) E.removeChild(E.firstChild); setTimeout(function () { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 450); }, kind === 'bad' ? 6500 : 4200); }
function msCard(p) {
  var E = HUD.el, ph = MS.phase(), keep = E.ms.classList.contains('min'), minB = '<button class="cpnb2" data-m="min" aria-label="Collapse">' + (keep ? '▾' : '▴') + '</button>';
  var tab = MS.tab || (ph === 'free' ? 'start' : ph), P = phaseDef(ph === 'free' ? tab : ph), fl = MS[P.fl], cur = firstOpen(P.list, fl), key = ph + '|' + MS.view + '|' + tab + '|' + cur + '|' + MS.complete + MS.shutOn + MS.shutDone + MS.ascDone + (S.p.tripped ? 't' : '') + (S.p.x.tb.mw < 100 ? 'l' : '') + (ph === 'free' && BANKS.some(function (b) { return p.rods[b] > 0; }) ? 'o' : '');
  if (MS.view === 'list') {
    if (E.ms.dataset.cur !== key) { E.ms.dataset.cur = key; var T = phaseDef(tab), tfl = MS[T.fl], tcur = firstOpen(T.list, tfl), live = (tab === ph);
      E.ms.innerHTML = '<h3>📋 Checklists</h3><div class="tabs">' + PHASES.map(function (x) { return '<button data-m="tab" data-t="' + x.id + '" aria-pressed="' + (x.id === tab) + '">' + x.short + ' <small>' + countDone(MS[x.fl], x.list.length) + '/' + x.list.length + '</small></button>'; }).join('') + '</div>' +
        '<div class="sub">' + esc(T.code) + ' · ' + esc(T.t) + (tab === 'pre' ? ' · you tick these' : ' · these tick themselves') + '</div><ol class="cl">' + T.list.map(function (it, i) { var d = !!tfl[i], c = live && i === tcur && !d;
          return '<li class="' + (d ? 'd' : c ? 'c' : '') + '"><span class="ic">' + (d ? '✔' : c ? '▶' : '○') + '</span><span class="tx">' + esc(it.t) + (c ? '<small data-k="lst"></small>' : '') + '</span><span class="bt"><button data-m="ishow" data-p="' + T.id + '" data-i="' + i + '" title="Show me" aria-label="Show me">👁</button>' + (tab === 'pre' && !d ? '<button data-m="iver" data-i="' + i + '" title="Check it" aria-label="Check it">✔</button>' : '') + '</span></li>'; }).join('') + '</ol>' +
        '<div class="row"><button class="cpnb2" data-m="step">← Current step</button>' + (ph === 'free' && !MS.shutOn && BANKS.some(function (b) { return p.rods[b] > 0; }) ? '<button class="cpnb2" data-m="shut">⏬ Start the shutdown</button>' : '') + (ph === 'free' && !MS.ascDone && !p.tripped && BANKS.some(function (b) { return p.rods[b] > 0; }) ? '<button class="cpnb2" data-m="asc">⏫ Go to power</button>' : '') + minB + '</div>'; }
    var ls = E.ms.querySelector('[data-k=lst]'); if (ls) { var T2 = phaseDef(tab), c2 = firstOpen(T2.list, MS[T2.fl]); if (T2.list[c2]) ls.textContent = T2.list[c2].st(p); }
    return;
  }
  if (ph === 'free') {
    if (E.ms.dataset.cur !== key) { E.ms.dataset.cur = key; var rodsOut = BANKS.some(function (b) { return p.rods[b] > 0; });
      E.ms.innerHTML = '<h3>' + (MS.shutDone ? 'Shutdown complete · free play' : MS.complete ? 'Startup complete · free play' : 'Free play') + '</h3><div class="t" data-k="ft"></div><div class="st" data-k="fst"></div><div class="row"><button class="cpnb2" data-m="list">📋 Checklists</button>' + (rodsOut && !p.tripped && !MS.ascDone && (p.x.tb.mw < 100) ? '<button class="cpnb" data-m="asc">⏫ Go to power</button>' : '') + (rodsOut && !MS.shutOn ? '<button class="cpnb2" data-m="shut">⏬ Shut down</button>' : '') + '<button class="cpnb2" data-m="faults" title="Faults" aria-label="Faults">⚠</button>' + minB + '</div>'; }
    E.ms.querySelector('[data-k=ft]').textContent = p.tripped ? 'Reactor shut down' : D.mode === 3 ? 'Mode 3: hot standby' : D.mode === 2 ? 'Mode 2: startup' : 'Mode 1: power operation';
    E.ms.querySelector('[data-k=fst]').textContent = pcName(p.pc) + ' · power ' + (D.pr < 0.1 ? fmtSci(NI.ir[0], 1) + ' A' : D.pr.toFixed(D.pr < 10 ? 2 : 1) + '%') + (p.x.tb.gen ? ' · ' + Math.round(p.x.tb.mw) + ' MW' : ' · SUR ' + p.sur.toFixed(2)) + (FAULT.active().length ? ' · ⚠ ' + FAULT.active().length + ' fault' : '');
    return;
  }
  var s = P.list[cur]; if (!s) return;
  if (E.ms.dataset.cur !== key) { E.ms.dataset.cur = key;
    E.ms.innerHTML = '<h3>' + esc(P.t) + ' · ' + esc(P.code) + ' · ' + (ph === 'pre' ? countDone(fl, P.list.length) + ' of ' + P.list.length + ' checked' : 'step ' + (cur + 1) + ' of ' + P.list.length) + '</h3><div class="t"></div><div class="h"></div><div class="st"></div><div class="row"><div class="dots">' + P.list.map(function () { return '<i></i>'; }).join('') + '</div>' +
      (ph === 'pre' ? '<button class="cpnb" data-m="verify">✔ Check it</button><button class="cpnb2" data-m="show" aria-label="Show me">👁</button>' : '<button class="cpnb" data-m="show">👁 Show me</button>') + '<button class="cpnb2" data-m="list" title="All the checklists" aria-label="All the checklists">📋</button>' + minB + '</div>';
    E.ms.querySelector('.t').textContent = s.t; E.ms.querySelector('.h').innerHTML = s.h; }
  E.ms.querySelector('.st').textContent = s.st(p); [].forEach.call(E.ms.querySelectorAll('.dots i'), function (d, i) { d.className = fl[i] ? 'd' : i === cur ? 'c' : ''; });
}
function hudTick(dt) {
  HUD.t += dt; if (!HUD.dirty && HUD.t < 0.2) return; HUD.t = 0; HUD.dirty = false; var E = HUD.el, p = S.p;
  E.time.querySelector('[data-k=clk]').textContent = clockStr(D.clock);
  [].forEach.call(E.time.querySelectorAll('[data-ts]'), function (b) { var v = +b.dataset.ts; b.setAttribute('aria-pressed', String(v === 0 ? S.paused : !S.paused && S.ts === v)); });
  E.tools.querySelector('[data-b=snd]').textContent = S.cfg.snd ? '🔊' : '🔇'; E.tools.querySelector('[data-b=quick]').setAttribute('aria-pressed', String(!!S.cfg.quick)); E.tools.querySelector('[data-b=assist]').setAttribute('aria-pressed', String(!!S.cfg.assist));
  /* shift chip and explain button */
  var sc = E.time.querySelector('[data-k=shift]'), left = shiftLeft(); sc.hidden = !S.cfg.shift; if (S.cfg.shift) { sc.textContent = left > 0 ? '⏱ ' + fmtMS(left) : 'OVERTIME +' + fmtMS(-left); sc.className = 'cpnshift' + (left <= 0 ? ' ot' : left <= 300 ? ' low' : ''); }
  E.tools.querySelector('[data-b=explain]').setAttribute('aria-pressed', String(!!S.cfg.explain));
  msCard(p);
  /* urgent banner */
  var u = '';
  if (!p.tripped && p6(p) && (!p.srBlk[0] || !p.srBlk[1]) && (NI.sr[0] > 2e4 || NI.sr[1] > 2e4)) u = 'P-6 IS LIT: BLOCK BOTH SOURCE RANGE TRIPS NOW (' + Math.round(Math.max(p.srBlk[0] ? 0 : NI.sr[0], p.srBlk[1] ? 0 : NI.sr[1])).toLocaleString('en-GB') + ' cps, trip at 100,000)';
  else if (!p.tripped && D.pr > 12 && !blkd(p, 'prBlk') && !p.x.tb.gen) u = 'POWER ' + D.pr.toFixed(1) + '%: INSERT RODS NOW (power range trip at 25%)';
  else if (!p.tripped && p10(p) && (!blkd(p, 'prBlk') || !blkd(p, 'irBlk')) && D.pr > 14) u = 'P-10 IS LIT: BLOCK THE IR AND POWER RANGE LOW TRIPS NOW (' + D.pr.toFixed(1) + '%, trip at 25%)';
  else if (!p.tripped && p.x.sg.some(function (q) { return q.L < 25; })) u = 'STEAM GENERATOR LEVEL ' + Math.round(Math.min.apply(null, p.x.sg.map(function (q) { return q.L; }))) + '%: RESTORE FEED (trip at 17%)';
  else if (!p.tripped && p.x.pz.P < 140) u = 'PRESSURISER PRESSURE ' + p.x.pz.P.toFixed(0) + ' BAR AND FALLING (trip at 134)';
  else if (!p.tripped && p.sur > 1.5) u = 'STARTUP RATE ' + p.sur.toFixed(2) + ' DPM: TOO FAST. INSERT RODS.';
  E.urg.hidden = !u; if (u) E.urg.textContent = '⚠ ' + u;
  /* instructor assist */
  E.as.hidden = !S.cfg.assist;
  if (S.cfg.assist) { var rp = rhoParts(p), tot = rhoPcm(p), per = Math.abs(p.sur) > 0.005 ? 26.06 / p.sur : Infinity, pr = ecpFromOneM(p), f = function (v) { return (v >= 0 ? '+' : '') + Math.round(v); };
    E.as.innerHTML = '<h3><span>🎓 Instructor assist</span><span>' + (S.paused ? 'PAUSED' : '×' + S.ts) + '</span></h3>' +
      '<div class="r"><span>k<sub>eff</sub></span><span class="k" style="color:' + (D.keff >= 1 ? '#ff9f43' : '#7fd1ff') + '">' + D.keff.toFixed(5) + '</span></div>' +
      '<div class="r"><span>Reactivity</span><span>' + f(tot) + ' pcm</span></div><div class="r"><span> fresh fuel (excess)</span><span>' + f(rp.base) + '</span></div><div class="r"><span> control rods</span><span>' + f(rp.rods) + '</span></div><div class="r"><span> boron</span><span>' + f(rp.boron) + '</span></div>' +
      '<div class="r"><span> fuel temp (Doppler)</span><span>' + f(rp.dop) + '</span></div><div class="r"><span> coolant temp</span><span>' + f(rp.mod) + '</span></div>' + '<div class="r"><span> xenon</span><span>' + f(rp.xe) + '</span></div>' +
      '<div class="r"><span>Period</span><span>' + (isFinite(per) && Math.abs(per) < 9999 ? per.toFixed(0) + ' s' : '∞') + '</span></div><div class="r"><span>Power</span><span>' + (p.n * 100 < 0.01 ? fmtSci(p.n * 100, 2) : (p.n * 100).toFixed(3)) + ' %</span></div>' +
      (FAULT.active().length ? '<div class="r" style="color:#ff9f43"><span>⚠ Fault</span><span>' + FAULT.active().map(function (q) { return esc(q.t); }).join(', ') + '</span></div>' : '') + (p.x.tb.gen ? '<div class="r"><span>Generator</span><span>' + Math.round(p.x.tb.mw) + ' MW</span></div><div class="r"><span>Tavg / Tref</span><span>' + p.Tavg.toFixed(1) + ' / ' + trefC(p.x).toFixed(1) + '</span></div>' : '') + '<div class="r"><span>1/M prediction</span><span>' + (pr != null ? (pr > PCMAX ? 'beyond all out' : pcName(pr).replace('bank ', '')) : '—') + '</span></div><div class="r"><span>SR audio</span><span>' + (!p.audio ? 'off' : p.srBlk[0] && p.srBlk[1] ? 'silent (SR blocked)' : '1 click per ' + S.audDiv + ' counts') + '</span></div>'; }
  /* quick controls */
  E.qc.hidden = !S.cfg.quick;
  if (S.cfg.quick) { var q = E.qc; q.querySelector('[data-k=rd]').innerHTML = '<span>N31 ' + (p.srBlk[0] ? 'OFF' : Math.round(NI.sr[0]).toLocaleString('en-GB')) + '</span><span>SUR ' + p.sur.toFixed(2) + '</span><span>' + esc(p.sel === 'MAN' ? pcName(p.pc).replace('bank ', '') : p.sel + ' ' + Math.round(p.rods[p.sel] || 0)) + '</span>';
    [0, 1].forEach(function (i) { var b = q.querySelector('[data-q=rtb' + i + ']'); b.className = p.rtb[i] ? 'on' : 'off'; b.textContent = 'RTB ' + 'AB'[i] + (p.rtb[i] ? ': CLOSED' : ': OPEN'); var k = q.querySelector('[data-q=blk' + i + ']'); k.setAttribute('aria-pressed', String(p.srBlk[i])); k.style.opacity = p6(p) || p.srBlk[i] ? '1' : '.55'; });
    [].forEach.call(q.querySelectorAll('[data-sel]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.sel === p.sel)); }); }
  root.classList.toggle('touch', !!(window.matchMedia && matchMedia('(pointer: coarse)').matches));
}

/* ================================================================ menus ================================================================ */
function menu(html, onclick) { if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} } closeMenu(true); var m = h('div', 'cpnmenu', '<div class="cpncard">' + html + '</div>', root); S.menu = m; m.addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (b) { AUD.init(); onclick(b.dataset.a, b); } }); return m; }
function closeMenu(keepPause) { if (S.menu) { S.menu.remove(); S.menu = null; } if (!keepPause && S.wasPaused === false) setPause(false); }
function roadHTML() { return '<div class="cpnroad">' + ROAD.map(function (r, i) { return '<div class="' + (r.s === 'now' ? 'now' : '') + '"><b>' + esc(r.t) + (r.s === 'now' ? ' · PLAY NOW' : r.s === 'free' ? ' · FREE PLAY' : ' · coming soon') + '</b>' + esc(r.d) + '</div>'; }).join('') + '</div>'; }
function setHTML() { var c = S.cfg, ck = function (k, l) { return '<label><input type="checkbox" data-a="cfg" data-c="' + k + '"' + (c[k] ? ' checked' : '') + '>' + l + '</label>'; };
  return '<div class="cpnset">' + ck('snd', 'Sound') + ck('voice', 'Voice announcements') + ck('assist', 'Instructor assist panel') + ck('quick', 'Quick controls panel') + ck('explain', 'Explain mode (rest on a control for 3 s)') + '<label><input type="checkbox" data-a="cfg" data-c="gfxlo"' + (c.gfx === 'low' ? ' checked' : '') + '>Low graphics (faster)</label></div><div class="cpnseg"><span>Shift length</span>' + [15, 30, 45, 60, 0].map(function (m) { return '<button data-a="shift" data-v="' + m + '" aria-pressed="' + (c.shift === m) + '">' + (m ? m + ' min' : 'No limit') + '</button>'; }).join('') + '</div>'; }
function shiftClick(b) { S.cfg.shift = +b.dataset.v; S.shiftWarn = false; S.shiftOver = false; saveCfg(); [].forEach.call(b.parentNode.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
function shiftLeft() { return S.cfg.shift ? S.cfg.shift * 60 - S.shiftUsed : Infinity; }
function fmtMS(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
function shiftTick(dt) { S.shiftUsed += dt; if (!S.cfg.shift) return; var l = shiftLeft();
  if (l <= 300 && l > 0 && !S.shiftWarn) { S.shiftWarn = true; toast('⏱ 5 minutes left on your shift. Get the plant somewhere steady to hand over.', 'warn'); speak('Five minutes left on shift.'); }
  if (l <= 0 && !S.shiftOver) { S.shiftOver = true; shiftOverMenu(); } }
function shiftOverMenu() {
  var p = S.p, ph = MS.phase(), P = phaseDef(ph === 'free' ? 'start' : ph), done = countDone(MS[P.fl], P.list.length), sv = rd();
  var did = countDone(MS.pre, PRE.length) + countDone(MS.done, STEPS.length) + countDone(MS.shut, SHUT.length), xp = did ? 15 : 0;
  if (xp) { try { API.xp(xp, 'Critical Point: shift completed'); } catch (e) {} sv.shifts = (sv.shifts || 0) + 1; wr(sv); }
  S.addLog('End of shift (' + S.cfg.shift + ' min). Plant in Mode ' + D.mode + ', ' + pcName(p.pc)); AUD.sfx('chime'); speak('That is the end of your shift.');
  S.wasPaused = false; setPause(true);
  menu('<h1>⏱ End of shift</h1><p class="cpnsub">' + S.cfg.shift + '-minute shift done · time to hand over to the next crew</p>' +
    '<div class="cpnscore"><span>Plant</span><span>Mode ' + D.mode + (p.tripped ? ' · shut down' : ' · ' + (D.pr < 0.1 ? fmtSci(NI.ir[0], 1) + ' A' : D.pr.toFixed(2) + '% power')) + '</span><span>Procedure</span><span>' + esc(P.t) + ': ' + done + '/' + P.list.length + '</span><span>Checklist items done this shift</span><span>' + did + '</span><span>Reactor trips</span><span>' + S.st.trips + '</span>' + (xp ? '<span><b>Shift XP</b></span><span>+' + xp + '</span>' : '') + '</div>' +
    '<h2>Handover log</h2><div class="cpnlog">' + S.log.slice(-8).reverse().map(function (e) { return '<div><b>' + clockStr(e[0]).slice(0, 5) + '</b> ' + esc(e[1]) + '</div>'; }).join('') + '</div>' +
    '<p>Everything is saved, so the next shift (you, next time) carries on from exactly here.</p><div class="cpnbtns"><button class="cpnb" data-a="hand">📝 Hand over and finish</button><button class="cpnb2" data-a="ot">Keep going (overtime)</button></div>',
    function (a) { if (a === 'hand') { S.addLog('Shift handed over'); S.shiftUsed = 0; S.shiftWarn = false; S.shiftOver = false; save(); close(); } if (a === 'ot') closeMenu(); });
}
function cfgClick(b) { var k = b.dataset.c; if (k === 'gfxlo') { S.cfg.gfx = b.checked ? 'low' : 'high'; toast('Graphics change applies next time you open the simulator.'); } else S.cfg[k] = b.checked; if (k === 'snd') AUD.vol(); saveCfg(); HUD.dirty = true; }
function startMenu() {
  var sv = rd(), canResume = !!(sv.p && sv.v === 1);
  S.wasPaused = true; setPause(true);
  menu('<h1>☢ Critical Point Nuclear Power Station</h1><p class="cpnsub">Unit 1 main control room · 11 boards, every control working</p>' +
    '<p>You are the reactor operator on shift. Unit 1 is a four-loop pressurised water reactor (3411 MW of heat, about 1200 MW of electricity), sitting at <b>hot standby</b>: 291.7 °C, 155 bar, every control rod in. Your job is to work through the <b>pre-startup checklist</b>, take it <b>critical</b> with the real startup procedure, level off at the point of adding heat, then <b>shut it down</b> again. Rest the pointer on any control for 3 seconds to find out what it does.</p>' +
    '<div class="cpnbtns">' + (canResume ? '<button class="cpnb" data-a="resume">▶ Resume shift</button><button class="cpnb2" data-a="new">↻ New startup</button>' : '<button class="cpnb" data-a="new">▶ Start the reactor startup</button>') + '<button class="cpnb2" data-a="shutp">⏬ Shutdown practice</button><button class="cpnb2" data-a="ascp">⏫ Power ascension practice</button><button class="cpnb2" data-a="free">Free play (hot standby)</button><button class="cpnb2" data-a="atp">⚡ Free play at 50% power</button><button class="cpnb2" data-a="learn">📘 How a PWR works</button><button class="cpnb2" data-a="exit">Exit</button></div>' +
    '<h2>Settings</h2>' + setHTML() + '<h2>What you can do</h2>' + roadHTML() +
    '<p style="font-size:12px;color:#7f93a6;margin-top:14px">Inspired by Roblox’s Oakridge Nuclear Power Station. Physics: point kinetics with six delayed-neutron groups, rod worth curves, boron, Doppler, moderator and xenon feedback, plus a whole-plant model: pressuriser, coolant pumps, steam generators, feed, turbine, generator, grid and electrics. Real plants differ in detail.</p>',
    function (a, b) { if (a === 'cfg') return cfgClick(b); if (a === 'shift') return shiftClick(b);
      if (a === 'resume') { loadState(sv); begin(); } else if (a === 'new') { freshState(false); begin(); } else if (a === 'free') { freshState(true); begin(); } else if (a === 'shutp') { shutPractice(); begin(); } else if (a === 'ascp') { shutPractice(); MS.shutOn = false; MS.practice = false; startAsc(); begin(); } else if (a === 'atp') { atPowerStart(); begin(); } else if (a === 'learn') learnMenu(); else if (a === 'exit') close(); });
}
function begin() { closeMenu(true); S.wasPaused = false; setPause(false); AUD.init(); HUD.dirty = true; HUD.el.ms.dataset.cur = '';
  if (!S.welcomed) { S.welcomed = true; setTimeout(function () { speak(MS.practice ? 'Unit 1 is at the point of adding heat. Begin the reactor shutdown.' : MS.free ? 'Free play. Unit 1 is at hot standby.' : 'Good morning. Unit 1 is at hot standby. Begin the pre-startup checks.'); }, 600); } }
function learnMenu() {
  menu('<h1>📘 How a PWR works</h1>' +
    '<p><b>Fission and neutrons.</b> Uranium-235 splits when it absorbs a slow neutron, releasing heat and 2–3 new neutrons. If on average exactly one of those causes another fission, the chain reaction is steady: the reactor is <b>critical</b> (k<sub>eff</sub> = 1). Less than one: subcritical, power dies away. More than one: supercritical, power rises.</p>' +
    '<p><b>Delayed neutrons</b> (0.65% of them) appear seconds after fission. They make the reactor slow enough to control. That’s why startup rate is measured in <b>decades per minute</b>.</p>' +
    '<p><b>Control rods</b> soak up neutrons. Pulling them out adds reactivity. <b>Boron</b> dissolved in the coolant does the same job slowly and evenly. Hot fuel (Doppler) and hot coolant both remove reactivity, which makes the reactor stable.</p>' +
    '<p><b>Hot standby to critical.</b> The source range detectors count neutrons from a start-up source. As rods come out the counts rise, because each neutron is multiplied more: count rate = source ÷ (1 − k). Plot <b>1/M</b> (reference counts ÷ counts now): it falls towards zero as you approach critical, and the line through the points predicts where.</p>' +
    '<p><b>Heat to steam.</b> Water at 155 bar stays liquid at over 300 °C, carries heat to the steam generators, and boils the water in them to make steam for the turbine. At hot standby the steam dumps send that steam straight to the condenser; once the turbine is synchronised it drives the 1,200 MW generator instead.</p><p><b>Two loops, one plant.</b> The <b>primary</b> side (left-hand boards) is the radioactive water: reactor, pressuriser, coolant pumps, boron, safety injection. The <b>secondary</b> side (right-hand boards) is clean water and steam: steam generators, feed pumps, turbine, condenser, generator, grid.</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="back">← Back</button></div>', function (a) { if (a === 'back') startMenu(); });
}
function viewsMenu() { if (!S.menu) S.wasPaused = S.paused;
  menu('<h1>🎥 Views</h1><p>Jump to a board or screen. You can also walk anywhere (WASD or the joystick) and click any screen to zoom in.</p>' + VIEWGROUPS.map(function (g) { return '<h2>' + g[0] + '</h2><div class="cpnviews">' + g[1].map(function (id) { return '<button data-a="v" data-v="' + id + '">' + esc(VIEWDEF[id][4]) + '</button>'; }).join('') + '</div>'; }).join('') + '<div class="cpnbtns"><button class="cpnb2" data-a="x">Close</button></div>',
    function (a, b) { if (a === 'v') { closeMenu(); goView(b.dataset.v); } if (a === 'x') closeMenu(); });
}
function helpMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true);
  menu('<h1>Help</h1><h2>Moving around</h2><div class="cpnkeys"><kbd>Drag</kbd><span>Look around (mouse or finger)</span><kbd>L</kbd><span>Lock the mouse to the centre (move to look, click what the dot is on). L again unlocks</span><kbd>W A S D</kbd><span>Walk (Shift to hurry). On a phone: the joystick</span><kbd>Scroll / pinch</kbd><span>Zoom in to read meters</span><kbd>Click</kbd><span>Use a control, or zoom in to a screen</span><kbd>V</kbd><span>Views menu</span><kbd>Esc</kbd><span>Step back / menu</span></div>' +
    '<h2>Reactor shortcuts</h2><div class="cpnkeys"><kbd>O</kbd><span>Hold: rods OUT</span><kbd>I</kbd><span>Hold: rods IN</span><kbd>1 2 3 4</kbd><span>Select shutdown bank SA, SB, SC, SD</span><kbd>5</kbd><span>Select MAN (control banks)</span><kbd>K / J / R</kbd><span>Annunciator acknowledge / silence / reset</span><kbd>T</kbd><span>Time ×1 → ×5 → ×20</span><kbd>Space</kbd><span>Pause</span><kbd>C / G</kbd><span>Quick controls / instructor assist</span></div>' +
    '<h2>Checklists, shifts and explain mode</h2><p><b>📋 Checklists:</b> the card at the top left shows the step you\u2019re on. Press 📋 to see all three procedures: <b>pre-startup</b> (you look at the right instrument and press ✔ to tick each check), <b>startup</b> and <b>shutdown</b> (these tick themselves when the plant gets there). 👁 flies you to the right place.</p><p><b>⏱ Shift length:</b> set it in the menu. Five minutes before the end you get a warning; at the end you hand over with a summary of your shift. Pick \u201cNo limit\u201d for none.</p><p><b>💡 Explain mode:</b> rest the pointer on any control or instrument for 3 seconds (a small ring fills up), or press and hold it on a touch screen. A card explains what it does and how it\u2019s used in a real plant. It never blocks clicks. Press <kbd>X</kbd> or 💡 to turn it off.</p>' +
    '<h2>The boards, left to right</h2><div class="cpnkeys"><kbd>1</kbd><span>Safety injection, containment, radiation</span><kbd>2</kbd><span>Cooling water, instrument air, ventilation, fire</span><kbd>3</kbd><span>Chemical &amp; volume control: charging, letdown, boron</span><kbd>4</kbd><span>Pressuriser: heaters, spray, PORVs</span><kbd>5</kbd><span>Reactor coolant pumps and loop temperatures</span><kbd>6</kbd><span>REACTOR: rods, nuclear instruments, trip breakers</span><kbd>7</kbd><span>Steam generators and feedwater</span><kbd>8</kbd><span>Main steam, steam dumps, condenser</span><kbd>9</kbd><span>Turbine</span><kbd>10</kbd><span>Generator, synchronising, 400 kV grid</span><kbd>11</kbd><span>Electrical buses and diesel generators</span></div>' +
    '<h2>Going to power (free play)</h2><p>From the point of adding heat: start a <b>main feed pump</b> (board 7). On the turbine board <b>LATCH</b>, set the speed target to 3000 and wait. On the generator board close the <b>field breaker</b>, turn the <b>sync selector</b> to MAN, use <b>speed raise</b> to make the synchroscope creep clockwise and close the <b>generator breaker</b> as it passes 12 o\u2019clock. Then put the dumps in <b>TAVG</b>, the rods in <b>AUTO</b>, block the IR and PR-low trips at <b>P-10</b>, and raise the load setpoint. Rods soon run out: dilute boron on board 3 to keep going. Use \u00d720 time: it takes hours, just like a real plant. Or press <b>\u23eb Go to power</b> on the checklist card for the guided GOP-302 checklist.</p><p><b>\u26a0 Faults:</b> from the pause menu or the \u26a0 button on the checklist card. Start from <b>Free play at 50% power</b> for the most interesting ones.</p>' +
    '<h2>Colours</h2><p>Lamps use the Westinghouse convention: <b style="color:#ff6b5b">red = closed / running / open valve</b>, <b style="color:#59e07a">green = open breaker / stopped / shut valve</b>. Annunciators: fast flash = new alarm (press ACK), steady = acknowledged, slow flash = cleared (press RESET).</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="x">Got it</button></div>', function (a) { if (a === 'x') closeMenu(); });
}
function pauseMenu() { S.wasPaused = S.paused; setPause(true); var ph = MS.phase(), P = phaseDef(ph);
  menu('<h1>Paused</h1><p class="cpnsub">' + (ph === 'free' ? 'Free play' : esc(P.t) + ' · ' + countDone(MS[P.fl], P.list.length) + ' of ' + P.list.length + ' done') + ' · ' + esc(pcName(S.p.pc)) + (S.cfg.shift ? ' · shift ' + (shiftLeft() > 0 ? fmtMS(shiftLeft()) + ' left' : 'in overtime') : '') + '</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="go">▶ Resume</button><button class="cpnb2" data-a="views">🎥 Views</button><button class="cpnb2" data-a="faults">⚠ Faults</button><button class="cpnb2" data-a="restart">↻ Restart from hot standby</button><button class="cpnb2" data-a="main">Main menu</button><button class="cpnb2" data-a="exit">Exit</button></div><h2>Settings</h2>' + setHTML() + '<h2>The 10 sections</h2>' + roadHTML(),
    function (a, b) { if (a === 'cfg') return cfgClick(b); if (a === 'shift') return shiftClick(b); if (a === 'go') closeMenu(); if (a === 'views') viewsMenu(); if (a === 'faults') faultsMenu(); if (a === 'restart') { freshState(MS.free); begin(); } if (a === 'main') { save(); startMenu(); } if (a === 'exit') close(); });
}
var TRIPWHY = {
  SR: 'The source range detectors trip the reactor at 100,000 counts per second. Once P-6 lights (intermediate range above 1E-10 A, about 30,000 cps) you have to press <b>SR TRIP BLOCK</b> on both trains, which switches the source range off.',
  IR: 'The intermediate range trips the reactor at the current that matches about 25% power. Power rose far too high: level off at the point of adding heat by inserting rods.',
  PRL: 'The power range low setpoint trips the reactor at 25% power during startups. Level off at 0.5–5% by inserting rods as Tavg starts to rise.',
  PRH: 'The power range high setpoint trips at 109% power. That took a very large reactivity addition.',
  MAN: 'You tripped the reactor by hand: both trip breakers opened, the rod drive mechanisms lost power and every rod fell into the core in about 1.7 seconds.',
  PZRPL: 'Pressuriser pressure fell below 134 bar with the reactor above 10% power. Low pressure means less margin to boiling in the core. Check heaters, sprays and PORVs on the pressuriser board.',
  PZRPH: 'Pressuriser pressure rose above 166 bar. Heaters on too long, sprays not working, or the coolant heated up fast. The PORVs should have opened at 162 bar.',
  PZRL: 'Pressuriser level went above 92%: the steam bubble was nearly gone, and a solid pressuriser can\u2019t control pressure. Usually too much charging flow.',
  LOFLOW: 'Reactor coolant flow fell too low with the reactor at power (a coolant pump stopped). Without flow, the fuel can\u2019t get rid of its heat.',
  SGLL: 'A steam generator level fell below 17%. Its tubes could uncover and it would stop cooling the reactor. Watch feed flow against steam flow on the steam generator board.',
  OTDT: 'Overtemperature \u0394T: the coolant got too hot for the power level. Too little steam taken off, or the reactor ran away from the turbine.',
  TT: 'The turbine tripped with the reactor above 50% power (P-9), so the reactor was tripped too: the steam dumps alone can\u2019t take that much heat.',
  SI: 'Safety injection actuated (manually or on low pressure / high containment pressure). It always trips the reactor.' };
function tripMenu(cause) { S.wasPaused = false; setPause(true);
  menu('<h1 style="color:#ff6b5b">⚠ Reactor trip</h1><p class="cpnsub">First out: ' + esc(TRIPS[cause]) + '</p><p>' + TRIPWHY[cause] + '</p>' +
    '<p>The reactor is safely shut down: every rod is in, power is falling at about −1/3 decade per minute, and the steam dumps are removing the heat. This happens in real plants too: the operators find out why, then start up again.</p>' +
    '<p><b>To start again:</b> wait for power to fall back towards source level, close both trip breakers, withdraw the shutdown banks, then the control banks. The procedure goes back to step 1.</p><div class="cpnbtns"><button class="cpnb" data-a="x">OK</button><button class="cpnb2" data-a="rs">↻ Reset the plant to hot standby</button></div>',
    function (a) { if (a === 'x') closeMenu(); if (a === 'rs') { freshState(false, true); begin(); } });
}
function finish() {
  if (MS.complete) return; MS.complete = true; var st = S.st, p = S.p, score = 30, rows = [];
  var add = function (lbl, ok, pts) { rows.push('<span>' + (ok ? '✔ ' : '✘ ') + esc(lbl) + '</span><span>' + (ok ? '+' + pts : '0') + '</span>'); if (ok) score += pts; };
  rows.push('<span>Reactor taken critical and levelled off</span><span>+30</span>'); add('Pre-startup checklist finished before you started', MS.preAll() && !MS.preSkipped, 10);
  add('No reactor trips', st.trips === 0, 20); add('Startup rate never above 1 DPM (max ' + st.maxSur.toFixed(2) + ')', st.maxSur <= 1.0, 15); add('At least 3 points on the 1/M plot (' + st.pts + ')', st.pts >= 3, 10);
  var band = S.ecpBand, inBand = st.critPc != null && band && st.critPc >= band[0] && st.critPc <= band[1]; add('Critical within ±500 pcm of the ECP (' + (st.critPc != null ? pcName(st.critPc) : '?') + ')', inBand, 10);
  var predOk = st.predPc != null && st.critPc != null && Math.abs(st.predPc - st.critPc) <= 15; add('1/M prediction within 15 steps', predOk, 5);
  var stars = score >= 85 ? 3 : score >= 60 ? 2 : 1, sv = rd(), first = !sv.done1, xp = first ? 60 + Math.round(score * 0.4) : 10 + Math.round(score / 10);
  try { API.xp(xp, 'Critical Point: reactor startup'); } catch (e) {}
  sv = rd(); sv.done1 = (sv.done1 || 0) + 1; sv.best1 = Math.max(sv.best1 || 0, score); wr(sv);
  AUD.sfx('done'); speak('The reactor is at the point of adding heat. Well done.'); S.addLog('Reactor at the point of adding heat. GOP-301 complete. Score ' + score);
  S.wasPaused = false; setPause(true);
  menu('<h1>✅ Reactor at the point of adding heat</h1><p class="cpnsub">Startup complete · ' + Math.round(D.pr * 100) / 100 + '% power · Tavg ' + p.Tavg.toFixed(1) + ' °C · Mode ' + D.mode + '</p>' +
    '<div class="cpnstars" aria-label="' + stars + ' stars">' + '★★★'.slice(0, stars) + '<span style="opacity:.25">' + '★★★'.slice(stars) + '</span></div>' +
    '<div class="cpnscore">' + rows.join('') + '<span><b>Score</b></span><span>' + score + ' / 100</span><span><b>XP earned</b></span><span>+' + xp + '</span></div>' +
    '<p>You did what real operators do on every startup: closed the trip breakers, pulled the shutdown banks, approached criticality with a 1/M plot, controlled the startup rate, blocked the source range at P-6 and levelled off where the reactor starts making heat.</p>' +
    '<h2>What next?</h2><p><b>Power ascension (GOP-302)</b> takes the plant on to 50%: feed pumps, turbine, synchronising to the grid, P-10 blocks and boron dilution. Or the <b>shutdown checklist (GOP-303)</b> takes it back to hot standby.</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="asc">⏫ Take it to power (GOP-302)</button><button class="cpnb2" data-a="shut">⏬ Shut it down (GOP-303)</button><button class="cpnb2" data-a="free">Keep running the plant</button><button class="cpnb2" data-a="again">↻ Do the startup again</button><button class="cpnb2" data-a="exit">Exit</button></div>' +
    '<p style="font-size:12.5px;color:#9fb3c6">Want more? Choose <b>Keep running the plant</b>: start a main feed pump, roll the turbine, synchronise to the grid and load up. Every board works.</p>',
    function (a) { if (a === 'asc') { closeMenu(); startAsc(); } if (a === 'shut') { closeMenu(); startShutdown(); } if (a === 'free') { closeMenu(); HUD.el.ms.dataset.cur = ''; HUD.dirty = true; } if (a === 'again') { freshState(false, true); begin(); } if (a === 'exit') close(); });
  save();
}

/* ================================================================ save and load ================================================================ */
function snap(p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = p[k]; }); o.hist = p.hist.slice(-600); o.c = p.c.slice(); o.rods = Object.assign({}, p.rods); o.lever = 0; o.dropping = false; return o; }
function save() { if (!S || !S.p) return; var sv = rd(); sv.v = 1; sv.p = snap(S.p); sv.ms = { pre: MS.pre, done: MS.done, shut: MS.shut, surT: MS.surT, poT: MS.poT, complete: MS.complete, free: MS.free, shutOn: MS.shutOn, shutDone: MS.shutDone, preSkipped: MS.preSkipped, practice: MS.practice, orderBad: MS.orderBad, shutTrips: MS.shutTrips, asc: MS.asc, ascOn: MS.ascOn, ascDone: MS.ascDone }; sv.shiftUsed = S.shiftUsed; sv.st = S.st; sv.log = S.log.slice(-80); sv.cfg = S.cfg; sv.clock0 = S.clock0; sv.lastTrip = S.lastTrip; sv.cam = { x: CAM.x, y: CAM.y, z: CAM.z, yaw: CAM.yaw, pitch: CAM.pitch, fov: CAM.fov }; wr(sv); }
function saveCfg() { var sv = rd(); sv.cfg = S.cfg; wr(sv); HUD.dirty = true; }
function loadState(sv) { var p = Object.assign(freshPlant(), sv.p); p.lever = 0; S.p = p; var m = sv.ms || {}; MS.reset(); MS.pre = m.pre || []; MS.done = m.done || []; MS.shut = m.shut || []; MS.surT = m.surT || 0; MS.poT = m.poT || 0; ['complete', 'free', 'shutOn', 'shutDone', 'preSkipped', 'practice', 'orderBad'].forEach(function (k) { MS[k] = !!m[k]; }); MS.shutTrips = m.shutTrips || 0; MS.asc = m.asc || []; MS.ascOn = !!m.ascOn; MS.ascDone = !!m.ascDone; MS.cur = firstOpen(STEPS, MS.done); MS.scur = firstOpen(SHUT, MS.shut);
  S.shiftUsed = sv.shiftUsed || 0; S.shiftWarn = shiftLeft() <= 300; S.shiftOver = shiftLeft() <= 0;
  S.st = Object.assign({ trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }, sv.st || {}); S.log = sv.log || []; S.clock0 = sv.clock0 || S.clock0; if (sv.cam) Object.assign(CAM, sv.cam, { tw: null, view: 'walk' });
  for (var i = 0; i < 6; i++) niTick(p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; HUD.el.ms.dataset.cur = ''; }
function shutPractice() { freshState(false); S.p = poahPlant(); MS.complete = true; MS.practice = true; MS.pre = PRE.map(function () { return true; }); MS.done = STEPS.map(function () { return true; }); S.st.critPc = S.p.pc;
  for (var i = 0; i < 8; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.log = []; S.addLog('Shift start: Unit 1 at the point of adding heat (' + pcName(S.p.pc) + ', ' + (S.p.n * 100).toFixed(1) + '% power)'); startShutdown(); goView('start', true); save(); }
function freshState(free, keepCam) { S.p = newPlant(); MS.reset(); MS.complete = false; MS.free = !!free; S.shiftUsed = 0; S.shiftWarn = false; S.shiftOver = false; S.st = { trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }; S.log = []; S.clock0 = 7 * 3600 + 12 * 60 + Math.floor(Math.random() * 600);
  for (var i = 0; i < 6; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.addLog('Shift start: Unit 1 at hot standby (Mode 3), all rods in, boron ' + BORON0 + ' ppm'); if (!keepCam) goView('start', true); HUD.el.ms.dataset.cur = ''; clearHL(); save(); }

/* ================================================================ the loop ================================================================ */
var RAF = 0, last = 0, rr0 = 0, saveT = 0, lastSteps = 0, wasP6 = false, wasCrit = false, lastPts = 0, sizeK = '';
function frame(now) {
  RAF = requestAnimationFrame(frame); var dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000)); last = now; var p = S.p;
  var k = root.clientWidth + 'x' + root.clientHeight; if (k !== sizeK) { sizeK = k; R3.ren.setSize(root.clientWidth, root.clientHeight, false); POST.size(root.clientWidth, root.clientHeight); OFS.w = -1; }
  if (!S.paused && !S.menu) {
    var sim = dt * S.ts, n = Math.max(1, Math.ceil(sim / 0.05)), hh = sim / n;
    for (var i = 0; i < n; i++) { plantStep(p, hh); niTick(p, hh); rps(p); permissives(p); oneMTick(p, hh); }
    derive(sim); MS.tick(sim); ANNC.tick();
    if (p.sur > S.st.maxSur && !p.tripped) S.st.maxSur = p.sur;
    if (p.steps !== lastSteps) { var ds = p.steps - lastSteps; lastSteps = p.steps; if (ds > 0 && ds < 50) AUD.sfx('step'); }
    var np = p6(p); if (np && !wasP6 && !p.tripped) { S.addLog('P-6 permissive: intermediate range above 1E-10 A'); speak('P 6. Block the source range.'); if (S.ts > 1) setTS(1); } wasP6 = np;
    if (p.everCrit && !wasCrit) { S.st.critPc = p.pc; S.st.predPc = ecpFromOneM(p); S.st.pts = Math.max(0, p.oneM.length - 1); S.addLog('Reactor critical at ' + pcName(p.pc)); speak('The reactor is critical.'); toast('☢ The reactor is critical at ' + pcName(p.pc) + '.', 'ok'); if (S.ts > 1) setTS(1); }
    wasCrit = p.everCrit;
    if (p.oneM.length !== lastPts) { lastPts = p.oneM.length; HUD.dirty = true; }
    saveT += dt; if (saveT > 20) { saveT = 0; save(); }
    if (!document.hidden) shiftTick(dt);
  }
  moveCam(dt); applyCam(dt); hover();
  pressed = pressed.filter(function (q) { q.t -= dt; if (q.t <= 0) { q.m.position.y = q.y0; return false; } return true; });
  CTRL.forEach(function (f) { f(dt); });
  var lt = S.lampTest; LAMPS.forEach(function (L) { var on = lt || !!L.on(); if (on !== L.st) { L.st = on; L.m.emissiveIntensity = on ? (POST.on ? 4 : 1.6) : (L.lo || 0); L.m.color.copy(on ? L.c : L.off); } });
  HL.forEach(function (q) { q.t += dt; var s = 1 + 0.15 * Math.sin(q.t * 6); q.m.scale.set(s, s, s); q.m.material.opacity = 0.55 + 0.45 * Math.sin(q.t * 6); }); if (HL.length && HL[0].t > 12) clearHL();
  /* widgets: annunciators every frame, the rest a slice at a time */
  ANNW.forEach(function (w) { redraw(w); });
  beFrame(dt);
  var per = Math.max(10, Math.ceil(WG.length / 6)); for (var j = 0; j < per; j++) { rr0 = (rr0 + 1) % WG.length; var w = WG[rr0]; if (!w.isAnn) redraw(w); }
  AUD.tick(dt); hudTick(dt); explainTick(now);
  if (POST.on) POST.render(); else R3.ren.render(R3.scene, R3.cam);
}
var ANNW = [];

/* ================================================================ open and close ================================================================ */
function open() {
  if (root && !root.hidden) return;
  if (root) { root.hidden = false; document.addEventListener('keydown', kd); document.addEventListener('keyup', ku); last = 0; RAF = requestAnimationFrame(frame); startMenu(); return; }
  if (!document.getElementById('cpnCss')) { var st = document.createElement('style'); st.id = 'cpnCss'; st.textContent = CSS; document.head.appendChild(st); }
  root = el('div', 'cpn'); root.setAttribute('role', 'application'); root.setAttribute('aria-label', 'Critical Point nuclear power station simulator'); document.body.appendChild(root);
  var ld = h('div', 'cpnload', '<i></i><span>Powering up the control room…</span>', root);
  loadThree(function (ok) {
    if (!ok) { ld.innerHTML = '<span>Couldn’t load the 3D engine. Check your connection and try again.</span><button class="cpnb" style="margin-top:10px">Close</button>'; ld.querySelector('button').onclick = close; return; }
    setTimeout(function () { try { init(); ld.remove(); } catch (e) { ld.innerHTML = '<span>Something went wrong starting the simulator: ' + esc(e && e.message) + '</span><button class="cpnb" style="margin-top:10px">Close</button>'; ld.querySelector('button').onclick = close; try { console.error(e); } catch (x) {} } }, 30);
  });
}
function loadThree(cb) { if (window.THREE && THREE.WebGLRenderer) { cb(true); return; } var s = document.createElement('script'); s.src = 'vendor/three.min.js?v=160'; s.onload = function () { cb(!!(window.THREE && THREE.WebGLRenderer)); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
function init() {
  var sv = rd(); makeSession(sv); var hi = S.cfg.gfx !== 'low';
  var ren = new THREE.WebGLRenderer({ antialias: hi, powerPreference: 'high-performance' }); ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, hi ? 2 : 1)); ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 0.92;
  ren.domElement.className = 'cpn3d'; ren.domElement.tabIndex = 0; root.insertBefore(ren.domElement, root.firstChild);
  ANISO = Math.min(hi ? 8 : 2, ren.capabilities.getMaxAnisotropy ? ren.capabilities.getMaxAnisotropy() : 4);
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0x1d2126); var cam = new THREE.PerspectiveCamera(60, 1, 0.03, 60); R3 = { ren: ren, scene: scene, cam: cam }; RC = new THREE.Raycaster();
  S.p = newPlant(); derive(0.05);
  mats(); buildRoom(scene); SECDEF.forEach(buildSection); joints(); furniture(scene);
  if (hi) { try { var pm = new THREE.PMREMGenerator(ren), es = new THREE.Scene(), bx = new THREE.Mesh(new THREE.BoxGeometry(2 * RX, CH, RDP), new THREE.MeshBasicMaterial({ color: 0x5d6268, side: THREE.BackSide })); bx.position.set(0, CH / 2, RZC); es.add(bx);
    var lm = new THREE.MeshBasicMaterial({ color: 0xffffff }); lm.color.setScalar(5); for (var x = -10.5; x <= 10.5; x += 3) for (var z = ZB + 1.5; z <= ZF - 1; z += 3) { var l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), lm); l.rotation.x = Math.PI / 2; l.position.set(x, CH - 0.05, z); es.add(l); }
    scene.environment = pm.fromScene(es, 0.04).texture; scene.environmentIntensity = 0.55; pm.dispose(); } catch (e) {} }
  if (hi) { try { realism(scene); } catch (e) { try { console.error(e); } catch (x) {} } }
  if (hi) { ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap; var sn = R3.sun, sc = sn.shadow.camera; sn.castShadow = true; sn.shadow.mapSize.set(2048, 2048); sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 40; sc.updateProjectionMatrix(); sn.shadow.bias = -0.0004; sn.shadow.normalBias = 0.04; sn.shadow.radius = 5;
    scene.traverse(function (o) { if (!o.isMesh || !o.material || o.material.isMeshBasicMaterial) return; o.receiveShadow = true; var gt = o.geometry.type; if (gt !== 'PlaneGeometry' && gt !== 'RingGeometry' && !o.material.transparent) o.castShadow = true; }); }
  WG.forEach(function (w) { if (w.o.tiles) { w.isAnn = true; ANNW.push(w); } });
  S.ecpBand = ecpBand(); ANNC.init();
  buildHUD();
  var c = ren.domElement; c.addEventListener('pointerdown', onDown); c.addEventListener('pointermove', onMove); c.addEventListener('pointerup', onUp); c.addEventListener('pointercancel', onUp); c.addEventListener('wheel', onWheel, { passive: false }); c.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  c.addEventListener('pointerleave', function () { hideTip(); PTR.hover = null; PTR.hoverObj = null; });
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku); document.addEventListener('pointerlockchange', lockChange);
  window.addEventListener('blur', function () { KEYS = {}; if (S && S.leverDir) ACT.lever(0); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && S && root && !root.hidden) { save(); if (!S.menu) pauseMenu(); } });
  goView('start', true); WG.forEach(function (w) { redraw(w, true); });
  last = 0; RAF = requestAnimationFrame(frame); startMenu();
}
function close() {
  if (!root) return; try { save(); } catch (e) {} cancelAnimationFrame(RAF); RAF = 0; root.hidden = true; document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); KEYS = {};
  try { if (AUD.ctx) AUD.ctx.suspend(); } catch (e) {} try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} try { API.close(); } catch (e) {}
}
window.CRIT_PLANT = { open: open, close: close, _dbg: { S: function () { return S; }, FAULT: FAULT, startAsc: function () { startAsc(); }, ctl: function (re, arg) { var r = new RegExp(re), m = HITS.filter(function (h) { var o = h.userData.hit, t = typeof o.tip === 'function' ? o.tip() : o.tip; return t && r.test(t) && (o.act || o.hold); }); if (m.length !== 1) return 'match ' + m.length + ': ' + m.slice(0, 4).map(function (h) { var o = h.userData.hit; return typeof o.tip === 'function' ? o.tip() : o.tip; }).join(' | '); var o = m[0].userData.hit; if (o.act) o.act(arg); else { o.hold(true); o.hold(false); } return 'ok'; }, tips: function (re) { var r = new RegExp(re); return HITS.map(function (h) { var o = h.userData.hit; return typeof o.tip === 'function' ? o.tip() : o.tip; }).filter(function (t) { return t && r.test(t); }); }, MS: MS, ACT: ACT, ANNC: ANNC, NI: NI, D: D, CAM: CAM, goView: goView, showMe: showMe, setTS: setTS, step: function (sec, h) { h = h || 0.05; var p = S.p; for (var t = 0; t < sec; t += h) { plantStep(p, h); niTick(p, h); rps(p); permissives(p); oneMTick(p, h); derive(h); MS.tick(h); ANNC.tick(); if (p.sur > S.st.maxSur && !p.tripped) S.st.maxSur = p.sur; if (p.everCrit && S.st.critPc == null) { S.st.critPc = p.pc; S.st.predPc = ecpFromOneM(p); S.st.pts = Math.max(0, p.oneM.length - 1); } } },
  pick: function (x, y) { var hh = pick(x, y); return hh ? { tip: hh.object.userData.hit && (typeof hh.object.userData.hit.tip === 'function' ? hh.object.userData.hit.tip() : hh.object.userData.hit.tip), act: !!(hh.object.userData.hit && hh.object.userData.hit.act), hold: !!(hh.object.userData.hit && hh.object.userData.hit.hold) } : null; },
  click: function (x, y) { activate(pick(x, y)); }, verifyPre: verifyPre, startShutdown: startShutdown, PRE: PRE, SHUT: SHUT, EXP: EXP, shiftLeft: function () { return shiftLeft(); }, ofs: function () { return OFS; }, settled: function () { return !CAM.tw && Math.abs(OFS.cur - (OFS.want || 0)) < 0.5; }, R3: function () { return R3; }, desk: function (id, u, d, lift) { var v = SEC[id].desk.localToWorld(new THREE.Vector3(u, lift == null ? 0.0015 : lift, -d * SL)); v.project(R3.cam); var r = R3.ren.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, WG: WG, HITS: HITS, SEC: SEC, rho: function () { return rhoParts(S.p); }, ecp: function () { return ecpFromOneM(S.p); } } };
})();
