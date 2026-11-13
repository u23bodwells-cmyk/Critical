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
var FULL = 3411, TOP = 228, T0 = 291.7, PSP = 0 /* set below from the steam tables */, UA = 150, CRCS = 1800;
var BANKS = ['SA', 'SB', 'SC', 'SD', 'CA', 'CB', 'CC', 'CD'], SDB = ['SA', 'SB', 'SC', 'SD'], CTB = ['CA', 'CB', 'CC', 'CD'];
var WORTH = { SA: 1150, SB: 1050, SC: 850, SD: 850, CA: 650, CB: 900, CC: 1150, CD: 1250 };
var NROD = { SA: 8, SB: 8, SC: 4, SD: 4, CA: 8, CB: 8, CC: 8, CD: 5 };
var BW = 9.5, AD = -2.3, AM = -25, BORON0 = 1200, ECP_D = 120, OVL = 128, PCMAX = 3 * OVL + TOP;
function bankF(z) { var x = clamp(z / TOP, 0, 1); return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI); }
var RHO0 = WORTH.CD * (1 - bankF(ECP_D)) + BORON0 * BW; /* so the reactor goes critical with bank D at about 120 steps */
/* IAPWS-IF97 region 4: the real saturation line of water. Pressures in the control room are gauge (bar g), so add 1.013 for absolute. */
var IF4 = [0, 0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.12020824702470e5, -0.32325550322333e7, 0.14915108613530e2, -0.48232657361591e4, 0.40511340542057e6, -0.23855557567849, 0.65017534844798e3];
function if97Ts(pMPa) { var n = IF4, b = Math.pow(pMPa, 0.25), E = b * b + n[3] * b + n[6], F = n[1] * b * b + n[4] * b + n[7], G = n[2] * b * b + n[5] * b + n[8], D = 2 * G / (-F - Math.sqrt(F * F - 4 * E * G)), a = n[10] + D; return (a - Math.sqrt(a * a - 4 * (n[9] + n[10] * D))) / 2; }
function if97Ps(TK) { var n = IF4, th = TK + n[9] / (TK - n[10]), A = th * th + n[1] * th + n[2], B = n[3] * th * th + n[4] * th + n[5], C = n[6] * th * th + n[7] * th + n[8]; return Math.pow(2 * C / (-B + Math.sqrt(B * B - 4 * A * C)), 4); }
function tsat(P) { return if97Ts(clamp(P + 1.013, 0.05, 220) / 10) - 273.15; }
function psat(T) { return if97Ps(clamp(T, 1, 373) + 273.15) * 10 - 1.013; }
PSP = Math.round(psat(T0 - 0.4) * 10) / 10; /* no-load steam pressure: saturation just under no-load Tavg */
function setOverlap(p) { p.rods.CA = clamp(p.pc, 0, TOP); p.rods.CB = clamp(p.pc - OVL, 0, TOP); p.rods.CC = clamp(p.pc - 2 * OVL, 0, TOP); p.rods.CD = clamp(p.pc - 3 * OVL, 0, TOP); }
/* moderator temperature coefficient: boron makes it less negative (water expands, boron leaves the core), about -12 pcm/°C at 1200 ppm, -38 with no boron */
function mtc(p) { return -38 + 0.022 * p.boron; }
var DHF = [0.03, 0.02, 0.015], DHT = [10, 150, 3000];
function rhoParts(p) { var rods = 0; BANKS.forEach(function (b) { rods -= WORTH[b] * (1 - bankF(p.rods[b])); }); return { base: RHO0, rods: rods, boron: -p.boron * BW, dop: AD * (p.Tf - T0), mod: mtc(p) * (p.Tavg - T0), xe: xeRho(p), burn: -((p.x && p.x.bu) || 0) * 0.42, drop: p.x && p.x.f && p.x.f.drop ? -260 : 0 }; }
function rhoPcm(p) { var r = rhoParts(p); return r.base + r.rods + r.boron + r.dop + r.mod + r.xe + r.burn + r.drop; }
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
  if (dir > 0 && p.rodStop && CTB.concat(['MAN']).indexOf(sel) >= 0) { p.rodStopHit = p.t; return false; } /* C-3 / C-4: OTΔT or OPΔT rod withdrawal stop */
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
  /* the axial core, thermal margins, loop temperatures and the calorimetric live in the realism layer */
  coreStep(p, dt, Q);
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
function prPct(p, i) { return 100 * p.n * prResp(p, i); }
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
  for (var j = 0; j < 4; j++) NI.pr[j] = Math.max(0, prPct(p, j) + gauss() * 0.04); var nf = p.x && p.x.inF; if (nf && nf.id === 'pr') NI.pr[1] = 120; if (nf && nf.id === 'prl') NI.pr[2] = 0;
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
  p.tripped = true; p.tripT = p.t; p.rtb = [false, false]; p.lever = 0; p.firstOut = cause; p.trips++; if (p.x && p.x.tb.latched && cause !== 'TT') turbTrip(p, 'reactor trip'); if (out) { p.dropping = true; p.dropped = true; p.dropT = 0; p.drop0 = {}; BANKS.forEach(function (b) { p.drop0[b] = p.rods[b]; }); }
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
  var ts = tsat(p.Ps), wet = x.sg.filter(function (s) { return s.Lm > 3; }).length / 4, ua = UA * (0.35 + 0.65 * Math.sqrt(W)) * wet, qsg = sgHeat(p, x, W, dt);
  p.Tf += ((p.Tavg + 460 * Math.min(p.n, 1.3) / Math.sqrt(Math.max(W, 0.2))) - p.Tf) * (1 - Math.exp(-dt / 5));
  var dT0 = p.Tavg; p.Tavg += (Q + rcpQ - qsg - 1.5 - rhrQ(p) + - (x.si.flow + (x.core && x.core.brk > 50 ? x.core.brk * 0.5 : 0)) * Math.max(0, p.Tavg - 25) * 0.00117) / CRCS * dt; var dTdt = (p.Tavg - dT0) / dt;
  /* ---- turbine and generator ---- */
  var anyMsiv = x.sg.some(function (s) { return s.msiv; }), vacOK = x.vac < 0.2;
  if (tb.latched) { tb.tg = false;
    if (!tb.gen) { var tgt = tb.set; tb.rpm += clamp(tgt - tb.rpm, -tb.rate / 60 * dt * 2, tb.rate / 60 * dt); tb.steam = (anyMsiv ? 1 : 0) * 0.02 * FULL * Math.pow(tb.rpm / 3000, 2); if (!anyMsiv || p.Ps < 20) { tb.rpm = Math.max(0, tb.rpm - 20 * dt); } }
    else { tb.rpm = GRIDF * 60; if (p.runback) { tb.load = Math.max(200, tb.load - 17 * dt); tb.mw = Math.max(tb.load, tb.mw - 17 * dt); } var lim = p.Ps > 55 && anyMsiv ? 1 : clamp((p.Ps - 35) / 20, 0, 1); var tl = Math.min(tb.load, 1250 * lim); tb.mw += clamp(tl - tb.mw, -tb.lrate / 60 * dt * 3, tb.lrate / 60 * dt); tb.steam = (tb.mw / 0.335) + 0.02 * FULL; }
    if (tb.rpm > 3300) turbTrip(p, 'overspeed'); if (!vacOK) turbTrip(p, 'low condenser vacuum'); }
  else { tb.steam = 0; tb.mw += (0 - tb.mw) * (1 - Math.exp(-dt / 0.5)); if (!tb.gen) tb.rpm = Math.max(tb.tg ? 31 : 0, tb.rpm - (tb.rpm > 400 ? 6 : 2) * dt); if (tb.gen) tb.rpm = GRIDF * 60; }
  tb.gv = tb.latched ? clamp(tb.steam / (FULL * 0.34), 0, 1) : 0; tb.sv = tb.latched ? 1 : 0;
  if (tb.gen && !tb.latched) { tb.motT = (tb.motT || 0) + dt; if (tb.motT > 2) { tb.gen = false; x.el.unitTx = false; tb.motT = 0; bopLog(p, 'Generator breaker opened by reverse power protection (turbine tripped)'); } } else tb.motT = 0;
  tb.exc += ((tb.field ? (tb.excSet == null ? 1 : tb.excSet) : 0) - tb.exc) * (1 - Math.exp(-dt / 2.5)); tb.kv = 22 * tb.exc * Math.min(1, tb.rpm / 3000);
  if (!tb.gen) tb.phase = ((tb.phase + 360 * (tb.rpm / 60 - GRIDF) * dt) % 360 + 540) % 360 - 180; else tb.phase = 0;
  tb.mvar += ((tb.gen ? tb.mvarSet : 0) - tb.mvar) * (1 - Math.exp(-dt / 3));
  /* ---- steam dumps: STEAM PRESSURE mode holds 74.8 bar; TAVG mode opens on a hot-leg excess over Tref; blocked by P-12 (Tavg < 286 °C) and without condenser vacuum (C-9) ---- */
  var c9 = vacOK && x.cw.filter(function (c, k) { return c && pwr(x, 'cw', k); }).length >= 1, p12 = p.Tavg < 286 && !x.p12b, dem = 0, err = p.Ps - (x.dumpSet || PSP);
  if (x.dumpMode === 'PRESS') { p.dI = clamp(p.dI + err * dt * 0.015, 0, 1); dem = x.dumpCtl === 'AUTO' ? clamp(0.35 * err + p.dI, 0, 1) : x.dumpDem; }
  else if (x.dumpMode === 'TAVG') { p.dI = clamp(p.dI - dt * 0.02, 0, 1); dem = clamp((p.Tavg - trefC(x) - 1.7) / 8, 0, 1); }
  if (!c9 || p12 || !anyMsiv || x.aux.airP < 4) dem = 0;
  p.dump += (dem - p.dump) * (1 - Math.exp(-dt / 1.2));
  var porvQ = 0; x.sg.forEach(function (s) { s.porv = s.porvMode === 'OPEN' || (s.porvMode === 'AUTO' && p.Ps > x.sgPorvSet + (s.porv ? -1 : 0)); if (s.porv) porvQ += 0.025 * FULL * clamp((p.Ps - 10) / 70, 0, 1.2); });
  var relief = p.Ps > 84 ? (p.Ps - 84) * 600 : 0, steamOut = p.dump * 0.4 * FULL + tb.steam + porvQ + relief + (x.tdafw ? 6 : 0) + 4 + x.sg.reduce(function (a, s) { return a + (s.msiv ? s.brk || 0 : 0); }, 0);
  p.Ps += (qsg - steamOut) / 400 * dt; if (p.Ps < 1) p.Ps = 1;
  /* ---- steam generator levels: feed in, steam out, with swell (level jumps up briefly when steam flow increases) ---- */
  var stmPct = steamOut / FULL * 100, msivN = x.sg.filter(function (s) { return s.msiv; }).length || 1, airOK = x.aux.airP > 4;
  var mfpN = x.mfp.filter(function (m, k) { return m && pwr(x, 'mfp', k) && x.cond.some(function (c, j) { return c && pwr(x, 'cond', j); }); }).length;
  if (mfpN === 0) x.mfp.forEach(function (m, k) { if (m && !x.cond.some(function (c, j) { return c && pwr(x, 'cond', j); })) { x.mfp[k] = false; bopLog(p, 'Main feed pump ' + 'AB'[k] + ' tripped: no condensate pumps'); } });
  x.sg.forEach(function (s, k) {
    s.steam = s.msiv ? (stmPct - (s.porv ? 0 : 0)) / msivN * (msivN / 4) * 4 / 4 : (s.porv ? 2.5 : 0); if (!s.msiv && s.porv) s.steam = porvQ / FULL * 100 / 4;
    if (s.msiv) s.steam = (p.dump * 0.4 * FULL + tb.steam + relief) / FULL * 100 / msivN + (s.porv ? 0.025 * 100 : 0) * clamp((p.Ps - 10) / 70, 0, 1.2) + 4 / FULL * 100 / 4;
    s.steam += (s.brk || 0) / FULL * 100;
    s.sfS += (s.steam - s.sfS) * (1 - Math.exp(-dt / 25));
    /* main feed through the feed regulating valve (3-element control: feed matches steam, trimmed by level) */
    if (s.frvMode === 'AUTO') { var lc = s.L + (k === 2 && infOn(x, 'sgl') ? 25 : 0); s.fI = clamp(s.fI + (50 - lc) * 0.0015 * dt, -0.3, 0.3); s.frvDem = clamp(s.steam / 28 + 0.04 * (50 - lc) + s.fI, 0, 1); }
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
  var e = pz.P + (infOn(x, 'pzp') ? 12 : 0) - (x.pzSet || 155);
  if (pz.master === 'AUTO') { pz.pI = clamp(pz.pI - e * dt * 0.004, -0.5, 0.5); pz.prop = clamp(0.45 - e / 1.5 + pz.pI, 0, 1); if (pz.bkup === 'AUTO') pz.backup = e < -1.7 ? true : e > -0.7 ? false : pz.backup; if (pz.sprayMan === 'AUTO') pz.spray = clamp((e - 1.7) / 4, 0, 1); }
  else { pz.prop = pz.manDem; if (pz.sprayMan === 'AUTO') pz.spray = clamp((e - 1.7) / 4, 0, 1); }
  if (pz.sprayMan === 'MAN') pz.spray = pz.sprayDem;
  if (pz.bkup === 'ON') pz.backup = true; if (pz.bkup === 'OFF') pz.backup = false;
  var htrOK = pz.L > 17 && busOn(x, 'EA'), heatMW = htrOK && pz.heaters ? 1.8 * pz.prop + (pz.backup ? 1.6 : 0) : 0, sprayEff = pz.spray * Math.max(x.rcp[0], x.rcp[1]) * (airOK ? 1 : 0);
  for (i = 0; i < 2; i++) { var o = pz.porvMode[i] === 'OPEN' || (pz.porvMode[i] === 'AUTO' && pz.P > (pz.porv[i] ? 160.5 : 162.3)); pz.porv[i] = o && airOK; } if (f.porv) pz.porv[0] = true;
  var porvN = (pz.porv[0] && pz.blk[0] ? 1 : 0) + (pz.porv[1] && pz.blk[1] ? 1 : 0); pz.safety = pz.P > 172;
  /* level: thermal expansion of the coolant plus charging minus letdown */
  var sealIn = cv.ccp.some(Boolean) || cv.pd ? 2.0 : -1.2, siIn = x.si.flow + accFlow(x, pz, dt);
  var cr = x.core || (x.core = core0());
  /* small-break LOCA: a 3 cm hole in a cold leg. Subcooled critical flow goes as the square root of pressure; once the coolant is two-phase much less mass gets out */
  var brk = f.loca ? 7.2 * Math.sqrt(Math.max(0, pz.P - x.ct.P)) * (1 - 0.58 * clamp(cr.vv / 5, 0, 1)) : 0; if (f.lb) brk += lbBreak(x, cr, pz); cr.brk = brk;
  var sgtl = f.sgtl ? 6 * clamp((pz.P - p.Ps) / 80, 0, 1) : 0; if (sgtl) x.sg[0].Lm = Math.min(100, x.sg[0].Lm + sgtl * 0.0004 * dt);
  var dLdt = 2.35 * dTdt + (cv.chg + sealIn + siIn - cv.ltd - porvN * 4 - (pz.safety ? 40 : 0) - sgtl - brk) / 3600 / 0.51;
  /* RCS inventory: when the pressuriser is empty, any further loss leaves steam voids in the loops and the reactor vessel (0.51 m³ per % of pressuriser level) */
  var Ln = pz.L + dLdt * dt; if (Ln < 0) { cr.vv += -Ln * 0.51; Ln = 0; } else if (cr.vv > 0 && Ln > 0) { var tk = Math.min(cr.vv, Ln * 0.51); cr.vv -= tk; Ln -= tk / 0.51; } var drain = pz.L <= 0.01 && dLdt < 0; if (cr.vv > 0) dLdt = Math.min(dLdt, 0);
  pz.L = clamp(Ln, 0, 100);
  pz.P += (0.0062 * (heatMW - 0.6 - sprayEff * 15) + (dLdt < 0 ? 0.9 : 0.55) * dLdt - porvN * 0.45 * Math.sqrt(pz.P / 155) - (pz.safety ? 3 : 0)) * dt;
  /* below saturation the hottest coolant flashes to steam, which holds pressure up (and swells the pressuriser level, as at Three Mile Island) */
  var pf = psat(cr.Th + (cr.vv > 0 ? 1.5 : 0)); if (drain && pz.P > pf) pz.P += (pf - pz.P) * (1 - Math.exp(-dt / 10)); /* pressuriser empty and water still leaving: pressure collapses to saturation */ if (pz.P < pf) { pz.P += (pf - pz.P) * (1 - Math.exp(-dt / 6)); pz.L = clamp(pz.L + (pf - pz.P) * 0.05 * dt, 0, 100); } pz.P = clamp(pz.P, 1, 185);
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
    cv.done += rate / 3.6 * dt; if (cv.mode === 'DIL' || cv.mode === 'ALTDIL') cv.dilTot = (cv.dilTot || 0) + rate / 3.6 * dt; if (cv.mode === 'BOR') cv.borTot = (cv.borTot || 0) + rate / 3.6 * dt; cv.mkup = rate; if (cin > 0) cv.bat = Math.max(0, cv.bat - (cv.mode === 'BOR' ? rate : cv.baF) * dt / 3600 * 2);
    if (cv.done >= cv.batch) { cv.run = false; bopLog(p, 'Make-up batch complete: ' + Math.round(cv.done) + ' litres'); } }
  if (cv.mode === 'AUTO' && cv.vct < 20) cv.autoMk = true; if (cv.vct > 40) cv.autoMk = false; if (cv.autoMk) { cv.mkup = 18; }
  var chgEff = rate * (cv.mode === 'ALTDIL' ? 1.4 : 1); if (chgEff > 0 && chgPumps) p.boron += (cin - p.boron) * chgEff / VRCS / 3600 * dt; /* make-up blends in the VCT and reaches the core through the charging pumps */
  if (siIn > 0) p.boron += (2400 - p.boron) * siIn / VRCS / 3600 * dt;
  p.boron = clamp(p.boron, 0, 4000); if (cv.pb == null) cv.pb = p.boron; cv.bTr = (cv.bTr || 0) + ((p.boron - cv.pb) / dt * 60 - (cv.bTr || 0)) * (1 - Math.exp(-dt / 8)); cv.pb = p.boron;
  cv.divert = cv.vct > 87; cv.vct = clamp(cv.vct + (cv.ltd + (sealIn < 0 ? 0 : 1.2) - cv.chg - (sealIn > 0 ? 3.1 : 0) + cv.mkup - (cv.divert ? 15 : 0)) / 0.1 / 3600 * 0.1 * dt * 10, 0, 100);
  /* ---- safety injection: pressuriser pressure < 127 bar or steam pressure < 41 bar (unless blocked below P-11), or containment pressure high ---- */
  var p11 = pz.P < 136; if (!p11) { x.si.blkP = false; x.si.blkS = false; }
  if (!x.si.on && ((pz.P < 127 && !x.si.blkP) || (minPs(x, p) < 41 && !x.si.blkS) || x.ct.P > 0.3)) siActuate(p, pz.P < 127 ? 'pressuriser pressure low' : minPs(x, p) < 41 ? 'steam line pressure low' : 'containment pressure high');
  /* main steam line isolation: low steam line pressure shuts every MSIV (unless blocked below P-11) */
  if (minPs(x, p) < 41 && !x.si.blkS && x.sg.some(function (s) { return s.msiv; })) { x.sg.forEach(function (s) { s.msiv = false; }); bopLog(p, 'Main steam line isolation: all MSIVs shut (steam line pressure low)'); }
  var siHead = 0; if (x.si.on || x.si.pumps.some(Boolean)) { x.si.pumps.forEach(function (on2, k) { if (on2 && pwr(x, 'sip', k)) siHead += clamp((115 - pz.P) / 30, 0, 1) * 60; }); }
  cv.ccp.forEach(function (on2, k) { if (on2 && pwr(x, 'ccp', k) && x.si.on) siHead += clamp((175 - pz.P) / 60, 0, 1) * 25; });
  x.si.rhr.forEach(function (on2, k) { if (on2 && pwr(x, 'rhr', k)) siHead += clamp((14 - pz.P) / 10, 0, 1) * 300; });
  x.si.flow = (x.si.on || siHead > 0) && x.si.rwst > 0 ? siHead : 0; x.si.rwst = Math.max(0, x.si.rwst - x.si.flow / 3600 / 18 * dt);
  /* ---- containment ---- */
  var leakT = (pz.safety || porvN) && pz.prtP > 6 ? 1 : 0, leak = Math.max(leakT, clamp(brk / 50, 0, 1.6)), fans = x.aux.fan.filter(function (f, k) { return f && pwr(x, 'fan', k); }).length, sprays = x.si.cs.filter(function (c, k) { return c && pwr(x, 'cs', k); }).length;
  x.ct.T += ((32 + leakT * 60 + brk / 90 * 13) - x.ct.T - fans * 0.5 * (x.ct.T > 33 ? 1 : 0)) * (1 - Math.exp(-dt / 600)) - sprays * 0.01 * dt; x.ct.P = clamp(x.ct.P + ((leak * 0.01) * (brk > 0 ? 0.025 : 1) - sprays * 0.003 - fans * 0.0003 * (brk > 0 ? 0.3 : 1)) * dt, -0.02, 4); x.ct.P = clamp(x.ct.P + (brk * 2e-6 + x.sg.reduce(function (a, s) { return a + (s.brk || 0); }, 0) * 1.5e-5) * dt * (x.ct.P > 3 ? 0.1 : 1), -0.02, 4.5); x.ct.sump = clamp(x.ct.sump + brk / 3600 * dt * 0.05 + (x.si.cs.some(Boolean) ? 0.002 * dt : 0), 0, 100); x.ct.hum = clamp(x.ct.hum + (brk > 0 ? 0.02 : (40 - x.ct.hum) * 0.001) * dt, 0, 100); if (x.ct.P < 0) x.ct.P += 0.0005 * dt;
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
  /* xenon-135 is tracked node by node in the axial core model (coreStep) */
  /* ---- automatic rod control: rods follow Tavg to Tref once the turbine is above 15% load (C-5) ---- */
  if (p.sel === 'AUTO' && p.rtb[0] && p.rtb[1] && tb.mw > 170) { var te = p.Tavg + (infOn(x, 'tav') ? 6 : 0) - trefC(x), spm = Math.abs(te) < 0.8 ? 0 : clamp(8 + (Math.abs(te) - 0.8) * 24, 8, 72); x.rodAuto += spm / 60 * dt;
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
  else c = rpsCore(p); /* overtemperature and overpower ΔT, from the realism layer */
  if (c) doTrip(p, c); if (x.sg.some(function (s) { return s.L > 85; }) && !x.p14) { x.p14 = true; x.mfp = [false, false]; x.fwIso = true; turbTrip(p, 'steam generator level high-high (P-14)'); } if (x.sg.every(function (s) { return s.L < 75; })) x.p14 = false;
  return c;
}
Object.assign(TRIPS, { PZRPL: 'Pressuriser pressure low (134 bar)', PZRPH: 'Pressuriser pressure high (166 bar)', PZRL: 'Pressuriser level high (92%)', LOFLOW: 'Reactor coolant flow low', SGLL: 'Steam generator level low-low (17%)', OTDT: 'Overtemperature ΔT', OPDT: 'Overpower ΔT', TT: 'Turbine trip above P-9 (50% power)', SI: 'Safety injection' });

/* ================================================================ realism layer ================================================================
   A 12-node axial core: one-group diffusion solved quasi-statically every step (shifted inverse iteration), with local moderator
   temperature, Doppler, control rod tips and xenon/iodine in every node. That gives the axial power shape, axial flux difference
   and real xenon oscillations. On top: loop hot/cold leg temperatures from the core energy balance, hot-channel DNBR from the
   W-3 correlation, peak linear heat rate and fuel centreline temperature, overtemperature and overpower ΔT with their f(ΔI)
   penalties and C-3/C-4 rod stops and runbacks, RCS voiding and core uncovery for small-break LOCAs, core exit thermocouples,
   subcooling margin, RVLIS, and the secondary calorimetric heat balance that the power range detectors are calibrated against. */
var AXB = 700, NZ = 12, M2Z = 0.062 /* migration area / node height², sets how loosely coupled top and bottom are */, WCORE = 18600 /* kg/s with 4 pumps */, CPW = 5.6;
var QAVG = 0.596 /* average heat flux at 100%, MW/m² */, LHGR0 = 17.9 /* average linear heat rate at 100%, kW/m */, DTN = 3411e3 / (18600 * 5.6) /* loop ΔT at 100% (ΔT0) */, TAVF = T0 + 15.3;
var SATP = [[1, 417.4, 2675.0], [5, 640.1, 2748.1], [10, 762.7, 2777.1], [20, 908.5, 2798.4], [30, 1008.3, 2803.2], [40, 1087.4, 2800.8], [50, 1154.5, 2794.2], [60, 1213.7, 2784.6], [70, 1267.4, 2772.6], [80, 1317.1, 2758.7], [90, 1363.7, 2742.9], [100, 1408.1, 2725.5], [120, 1491.5, 2685.4], [140, 1571.0, 2637.9], [160, 1650.5, 2580.8], [180, 1734.0, 2509.5], [200, 1826.6, 2411.4], [220.6, 2087.5, 2087.5]];
/* saturated liquid and steam enthalpy (kJ/kg) at a gauge pressure in bar */
function satH(Pg) { var P = Pg + 1.013, T = SATP; if (P <= T[0][0]) return [T[0][1], T[0][2]]; for (var i = 1; i < T.length; i++) if (P <= T[i][0]) { var a = T[i - 1], b = T[i], f = (P - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; } return [T[T.length - 1][1], T[T.length - 1][2]]; }
var HLT = [[0, 0], [20, 83.9], [40, 167.5], [60, 251.1], [100, 419.1], [150, 632.2], [180, 763.1], [200, 852.3], [220, 943.6], [240, 1037.6], [260, 1134.8], [280, 1236.8], [290, 1290.0], [300, 1338.0], [310, 1393.0], [320, 1451.0], [330, 1513.0], [340, 1581.0], [350, 1656.0]];
/* enthalpy of compressed water at temperature T (°C), at RCS-like pressure */
function hLiq(T) { var t = HLT; if (T <= 0) return 0; for (var i = 1; i < t.length; i++) if (T <= t[i][0]) { var a = t[i - 1], b = t[i]; return a[1] + (b[1] - a[1]) * (T - a[0]) / (b[0] - a[0]); } return t[t.length - 1][1] + (T - t[t.length - 1][0]) * 8; }
/* the W-3 critical heat flux correlation (Tong), in its original British units; returns MW/m² */
function w3(psia, xq, Gl, hfB, hinB) { var xx = clamp(xq, -0.3, 0.3), a = (2.022 - 0.0004302 * psia) + (0.1722 - 0.0000984 * psia) * Math.exp((18.177 - 0.004129 * psia) * xx), b = (0.1484 - 1.596 * xx + 0.1729 * xx * Math.abs(xx)) * Gl / 1e6 + 1.037, c = 1.157 - 0.869 * xx, d = 0.2664 + 0.8357 * Math.exp(-3.151 * 0.465), e = 0.8258 + 0.000794 * Math.max(0, hfB - hinB);
  var q = a * Math.max(0.1, b) * c * d * e * 1e6; if (xq > 0.3) q *= Math.max(0.03, 1 - (xq - 0.3) * 2.5); return q * 3.1546e-6; }
/* UO2 thermal conductivity (W/m·K, T in K), the usual lattice + electronic form */
function kUO2(TK) { return 1 / (0.0375 + 2.165e-4 * TK) + 4.715e9 / (TK * TK) * Math.exp(-16361 / TK); }
function fuelCL(tps, qkw) { var need = qkw * 1000 / (4 * Math.PI), T = tps + 273.15, acc = 0, st = 8; while (acc < need && T < 3500) { var kk = kUO2(T + st / 2); if (acc + kk * st > need) { T += (need - acc) / kk; break; } acc += kk * st; T += st; } return T - 273.15; }
function core0() { var s = [], z = []; for (var i = 0; i < NZ; i++) { s.push(Math.sin(Math.PI * (i + 0.5) / NZ) * Math.PI / 2); z.push(0); }
  return { s: s, I: z.slice(), X: z.slice(), dr: z.slice(), tm: z.slice(), k: 1, dT: 0, Th: T0, Tc: T0, afd: 0, ao: 0, afdI: 0, fz: 1.5, fxy: 1.35, fdh: 1.45, fq: 2.0, dnbr: 9, dnbZ: 6, lhgr: 0, tcl: T0, tclad: T0, cet: T0, sub: 50, vv: 0, rvl: 100, unc: 0, dmg: false, dnbT: 0,
    otsp: 1.17, opsp: 1.09, ratio: 0, c3: false, c4: false, brk: 0, Tfw: 40, mfw: [0, 0, 0, 0], qcal: 0, best: 0, avg8: [], a8T: 0, mT: 0, lastP: 0 }; }
function cal0() { return { fv: 1.0, d: [0, 0, 0, 0], g: PRG.slice(), eT: gauss() * 0.25, eP: gauss() * 0.08, dao: [0.01, -0.015, 0.02, -0.01], last: null, lastT: -1e12, log: [] }; }
/* what each power range channel reads per unit of true power: its gain pot, slow detector drift, downcomer water temperature and the axial shape it sees */
function prResp(p, i) { var x = p.x; if (!x) return PRG[i]; var c = x.cal || (x.cal = cal0()), cr = x.core; var tc = cr ? cr.Tc : T0, ao = cr ? cr.ao : 0;
  return c.g[i] * (1 + c.d[i]) * (1 + 0.004 * (tc - (TAVF - DTN / 2))) * (1 + 0.1 * ao) * (cr && cr.qt ? cr.qt[i] : 1); }
/* rod insertion limit: the control banks must stay above this line (Tech Spec 3.1.6), in overlap steps, against power */
function rilPc(pw) { return 300 + 1.7 * clamp(pw, 0, 100); }
function coreShape(p) {
  var x = p.x, cr = x.core, s = cr.s, i, mt = mtc(p), dTf = p.Tf - p.Tavg, cum = 0, mean = 0, wsum = 0;
  for (i = 0; i < NZ; i++) { var zt = (i + 1) / NZ, zb = i / NZ, rod = 0;
    for (var bi = 0; bi < BANKS.length; bi++) { var b = BANKS[bi], hb = p.rods[b] / TOP; if (hb < zt) rod += WORTH[b] * clamp((zt - Math.max(zb, hb)) * NZ, 0, 1); }
    var tm = cr.Tc + cr.dT * (cum + s[i] / 2) / NZ; cum += s[i]; cr.tm[i] = tm;
    cr.dr[i] = -rod + mt * (tm - p.Tavg) + AD * dTf * (s[i] - 1) - cr.X[i] + (i === 0 || i === NZ - 1 ? -250 : 0) /* low-enrichment end blankets */ + AXB * ((i + 0.5) / NZ - 0.5) * 2 /* last cycle burnt the bottom harder */;
    mean += cr.dr[i] * s[i] * s[i]; wsum += s[i] * s[i]; }
  mean /= wsum;
  var kf = cr.kf || (cr.kf = []), c = M2Z, y = [], cp = [], dp = [];
  for (i = 0; i < NZ; i++) kf[i] = 1 + (cr.dr[i] - mean) * 1e-5;
  for (var it = 0; it < 2; it++) {
    var sig = 1 / (cr.k + 0.012);
    for (i = 0; i < NZ; i++) { var bb = 1 + 2 * c - sig * kf[i], rhs = kf[i] * s[i]; if (i === 0) { cp[i] = -c / bb; dp[i] = rhs / bb; } else { var m = bb + c * cp[i - 1]; cp[i] = -c / m; dp[i] = (rhs + c * dp[i - 1]) / m; } }
    y[NZ - 1] = dp[NZ - 1]; for (i = NZ - 2; i >= 0; i--) y[i] = dp[i] - cp[i] * y[i + 1];
    var ok = true, sm = 0; for (i = 0; i < NZ; i++) { if (!(y[i] > 0)) ok = false; sm += y[i]; }
    if (!ok) { cr.k = 0.97; continue; }
    for (i = 0; i < NZ; i++) s[i] = y[i] * NZ / sm;
    var num = 0, den = 0; for (i = 0; i < NZ; i++) { var As = (1 + 2 * c) * s[i] - c * ((i ? s[i - 1] : 0) + (i < NZ - 1 ? s[i + 1] : 0)); num += s[i] * kf[i] * s[i]; den += s[i] * As; } cr.k = num / den;
  }
}
/* set xenon and iodine to equilibrium for the present power and shape (for a plant that has been at power for days) */
function coreEq(p) { var x = p.x, cr = x.core || (x.core = core0()), i; cr.dT = DTN * p.n; cr.Th = p.Tavg + cr.dT / 2; cr.Tc = p.Tavg - cr.dT / 2;
  for (var r = 0; r < 14; r++) { for (i = 0; i < NZ; i++) { var ph = p.n * cr.s[i]; cr.I[i] = 0.2418 * ph / 2.87e-5; cr.X[i] = (0.0127 * ph + 2.87e-5 * cr.I[i]) / (2.09e-5 + 7e-5 * ph); } for (var k = 0; k < 25; k++) coreShape(p); }
  xeSum(p); }
function xeSum(p) { var cr = p.x.core, xw = 0, sw = 0, is = 0; for (var i = 0; i < NZ; i++) { var w = cr.s[i] * cr.s[i]; xw += w * cr.X[i]; sw += w; is += cr.I[i]; } p.x.xe.X = xw / sw; p.x.xe.I = is / NZ; }
function coreStep(p, dt, Q) {
  var x = p.x, cr = x.core || (x.core = core0()), c = x.cal || (x.cal = cal0()), s = cr.s, i, n = Math.max(p.n, 0);
  /* ---- loop temperatures: the core heats the coolant by Q / (flow × cp) ---- */
  var W = Math.max(0.035, (x.rcp[0] + x.rcp[1] + x.rcp[2] + x.rcp[3]) / 4); if (cr.vv > 30 && W < 0.1) W *= clamp(1 - (cr.vv - 30) / 60, 0.25, 1); /* steam in the SG tubes blocks natural circulation */
  var Qc = Q == null ? FULL * n : Q, dTt = Math.min(80, Qc * 1000 / (WCORE * W * CPW)); cr.dT += (dTt - cr.dT) * (1 - Math.exp(-dt / 4)); cr.W = W;
  cr.Th = p.Tavg + cr.dT / 2; cr.Tc = p.Tavg - cr.dT / 2; var Ts = tsat(x.pz.P); if (cr.Th > Ts + 0.5) cr.Th = Ts + 0.5;
  /* ---- axial power shape, loops and quadrants ---- */
  coreShape(p); loopStep(p, dt); chemStep(p, dt);
  /* ---- xenon and iodine, node by node ---- */
  for (i = 0; i < NZ; i++) { var ph = n * s[i]; cr.I[i] += (0.2418 * ph - 2.87e-5 * cr.I[i]) * dt; cr.X[i] += (0.0127 * ph + 2.87e-5 * cr.I[i] - 2.09e-5 * cr.X[i] - 7e-5 * ph * cr.X[i]) * dt; if (cr.X[i] < 0) cr.X[i] = 0; }
  xeSum(p);
  /* ---- axial flux difference: ΔI = (top half − bottom half) power, in % of rated ---- */
  var top = 0, bot = 0; for (i = 0; i < NZ; i++) { if (i >= NZ / 2) top += s[i]; else bot += s[i]; } cr.ao = (top - bot) / (top + bot); cr.afd = cr.ao * n * 100;
  var ai = 0; for (i = 0; i < 4; i++) ai += cr.ao * (1 + c.dao[i]) * prPct(p, i); cr.afdI = ai / 4;
  /* ---- feedwater temperature (extraction steam heats it as the turbine loads up) ---- */
  var mfp = x.mfp.some(Boolean), tfw = mfp ? (x.tb.gen ? 40 + 187 * Math.pow(clamp(x.tb.mw / 1150, 0, 1), 0.55) : 105) : 25; cr.Tfw += (tfw - cr.Tfw) * (1 - Math.exp(-dt / 240));
  /* ---- secondary calorimetric, run continuously by the plant computer: core power = Σ feed flow × (steam enthalpy − feed enthalpy) − pump heat + losses ---- */
  var sh = satH(p.Ps), hs = sh[0] + 0.9975 * (sh[1] - sh[0]), hfw = hLiq(cr.Tfw), dh = Math.max(200, hs - hfw), qs = 0;
  for (i = 0; i < 4; i++) { cr.mfw[i] = x.sg[i].feed / 100 * FULL * 1000 / dh; }
  var shm = satH(p.Ps + c.eP), hsm = shm[0] + 0.9975 * (shm[1] - shm[0]), hfm = hLiq(cr.Tfw + c.eT), rcpN = x.rcpOn.filter(Boolean).length;
  for (i = 0; i < 4; i++) qs += cr.mfw[i] * c.fv * (c.corr || 1) * (hsm - hfm) / 1000; cr.qcal = qs - 5 * rcpN + 1.5; cr.hs = hsm; cr.hfw = hfm;
  cr.best += (cr.qcal - cr.best) * (1 - Math.exp(-dt / 20)); cr.a8T += dt; if (cr.a8T >= 60) { cr.a8T = 0; cr.avg8.push(Math.round(cr.best)); if (cr.avg8.length > 480) cr.avg8.shift(); }
  /* slow instrument drift: feedwater venturi fouling, ion chamber sensitivity */
  c.fv += dt * 1.2e-8; for (i = 0; i < 4; i++) c.d[i] = clamp(c.d[i] + gauss() * Math.sqrt(dt) * 1.1e-5, -0.04, 0.04);
  /* ---- overtemperature and overpower ΔT (protect against DNB and fuel melting); C-3 / C-4 stop rod withdrawal and run the turbine back 3% before the trip ---- */
  var dI = cr.afdI, f1 = dI < -24 ? 0.024 * (-24 - dI) : dI > 10 ? 0.024 * (dI - 10) : 0, f2 = dI < -30 ? 0.02 * (-30 - dI) : dI > 20 ? 0.02 * (dI - 20) : 0;
  cr.otsp = 1.17 - 0.0245 * (p.Tavg - TAVF) + 0.00973 * (x.pz.P - 155) - f1; cr.opsp = 1.09 - 0.0023 * Math.max(0, p.Tavg - TAVF) - f2; cr.ratio = W > 0.5 ? cr.dT / DTN : 0;
  cr.c3 = cr.ratio > cr.otsp - 0.03; cr.c4 = cr.ratio > cr.opsp - 0.03; p.rodStop = !p.tripped && (cr.c3 || cr.c4); p.runback = p.rodStop && x.tb.gen && !p._q;
  /* ---- thermal margins (every quarter of a second is plenty) ---- */
  cr.mT += dt; if (cr.mT >= 0.25 || Q == null) { cr.mT = 0; margins(p, Qc, W); }
  /* ---- RCS inventory: RVLIS, core uncovery, clad heat-up ---- */
  cr.rvl = clamp(100 - Math.max(0, cr.vv - 4) * 0.8, 0, 100); var rcpOn = x.rcp.some(function (r) { return r > 0.5; });
  cr.unc = rcpOn && cr.vv < 70 ? 0 : clamp((62 - cr.rvl) / 38, 0, 1);
  var qf = Qc / FULL, tsurf = cr.tm[cr.dnbZ] + 15 * qf;
  if (cr.unc > 0) cr.tclad += (140 * qf * cr.unc - 0.004 * (cr.tclad - Ts) * (1 - cr.unc)) * dt; else cr.tclad += (tsurf + 12 * qf - cr.tclad) * (1 - Math.exp(-dt / 8));
  if (cr.tclad > 1204 && !cr.dmg) { cr.dmg = true; cr.dmgWhy = 'clad temperature passed 1204 °C with the core uncovered'; bopLog(p, 'CORE DAMAGE: ' + cr.dmgWhy); if (typeof S !== 'undefined' && S && S.toast) S.toast('☢ Core damage: the fuel cladding passed 1204 °C', 'bad'); }
  /* ---- core exit thermocouples and subcooling margin ---- */
  var cet = Math.min(cr.Tc + 1.12 * cr.dT, Ts + 0.3); if (cr.unc > 0.05) cet = Math.max(cet, Ts + (cr.tclad - Ts) * 0.55); cr.cet += (cet - cr.cet) * (1 - Math.exp(-dt / 3)); cr.sub = Ts - cr.cet;
  if (!rcpOn && cr.vv > 60) { /* pumps would cavitate */ }
  if (rcpOn && cr.vv > 45) { x.rcp.forEach(function (r, k) { if (x.rcpOn[k] && Math.random() < dt / 90) { x.rcpOn[k] = false; bopLog(p, 'RCP ' + (k + 1) + ' tripped on high vibration (pumping a steam-water mixture)'); } }); }
}
function margins(p, Qc, W) {
  var x = p.x, cr = x.core, s = cr.s, i, qf = Qc / FULL;
  var dIn = 1 - p.rods.CD / TOP, cIn = 1 - p.rods.CC / TOP, j = 0; for (i = 1; i < NZ; i++) if (s[i] > s[j]) j = i;
  cr.fz = s[j] * 1.04; cr.fdh = 1.43 + 0.09 * dIn + 0.04 * cIn; var rodHere = (j + 1) / NZ > p.rods.CD / TOP ? 0.1 : 0; cr.fxy = 1.34 + 0.08 * dIn + rodHere;
  cr.fq = cr.fz * cr.fxy * 1.03 * 1.05 * (cr.qptr || 1); cr.fdh *= (cr.qptr || 1); cr.lhgr = LHGR0 * qf * 0.974 * cr.fq;
  /* hottest fuel pellet: coolant + film + clad + gap, then integrate the pellet's conductivity to the centre */
  var q1 = cr.lhgr, tps = cr.tm[j] + q1 * (0.9 + 1.4 + 6.5); cr.tcl = q1 > 0.2 ? fuelCL(tps, q1) : cr.tm[j]; cr.tclZ = j;
  /* hot channel DNBR, node by node */
  var Pa = Math.max(5, x.pz.P + 1.013), psia = Pa * 14.5038, sh = satH(x.pz.P), hf = sh[0], hfg = Math.max(50, sh[1] - sh[0]), hin = hLiq(cr.Tc), G = 3700 * W, Gl = G * 737.34;
  var dhc = Qc * 0.974 * 1.08 * 1000 / (WCORE * 0.955 * W) /* × engineering enthalpy-rise factor */, qav = QAVG * qf, cum = 0, md = 99, mz = cr.dnbZ;
  for (i = 0; i < NZ; i++) { var cm = (cum + s[i] / 2) / NZ; cum += s[i]; var h = hin + cr.fdh * dhc * cm, xq = (h - hf) / hfg, q = qav * cr.fdh * s[i] * 1.03 * 1.18 /* × W-3 non-uniform flux factor */; if (q < 0.01) continue;
    var r = w3(psia, xq, Gl, hf * 0.429923, hin * 0.429923) / q; if (r < md) { md = r; mz = i; } }
  cr.dnbr = md; cr.dnbZ = mz;
  if (md < 1.0 && qf > 0.05) { cr.dnbT += 0.25; if (cr.dnbT > 2 && !cr.dmg) { cr.dmg = true; cr.dmgWhy = 'departure from nucleate boiling (DNBR below 1.0)'; bopLog(p, 'FUEL DAMAGE: ' + cr.dmgWhy); if (typeof S !== 'undefined' && S && S.toast) S.toast('☢ Fuel damage: the hottest rods went into film boiling (DNBR < 1)', 'bad'); } } else cr.dnbT = 0;
  if (cr.tcl > 2800 && !cr.dmg) { cr.dmg = true; cr.dmgWhy = 'fuel centreline melting'; bopLog(p, 'FUEL DAMAGE: ' + cr.dmgWhy); }
}
/* overtemperature / overpower ΔT trips (2 of 4 loops; the loops read alike here) */
function rpsCore(p) { var cr = p.x && p.x.core; if (!cr || cr.ratio <= 0) return null; if (cr.ratio > cr.otsp) return 'OTDT'; if (cr.ratio > cr.opsp) return 'OPDT'; return null; }

/* ================================================================ four separate loops, core quadrants, fuel burnup ================================================================
   Each steam generator has its own pressure and heat transfer; an SG with its MSIV shut (or a steam line break upstream of it)
   follows its own pressure. Each loop's cold leg is set by what its own SG takes out, and feeds its own core quadrant, so a
   cold loop makes a hot quadrant (quadrant power tilt). A dropped rod pushes power out of its quadrant. Burnup lowers the
   excess reactivity through the 18-month cycle. */
var BRK_SG = 1;
function sgHeat(p, x, W, dt) { var q = 0, uaS = UA * (0.35 + 0.65 * Math.sqrt(W)) / 4, f = x.f || {};
  x.sg.forEach(function (s, k) { if (s.P == null) s.P = p.Ps; var lw = Math.max(0.035, x.rcp[k]); s.q = s.Lm > 3 ? uaS * Math.sqrt(lw / Math.max(W, 0.035)) * Math.max(0, p.Tavg - tsat(s.P)) : 0; q += s.q;
    s.brk = f.msb && k === BRK_SG ? 0.32 * FULL * Math.sqrt(Math.max(0, s.P) / 70) : 0;
    if (s.msiv) s.P = p.Ps; else { var po = s.porv ? 0.025 * FULL * clamp((s.P - 10) / 70, 0, 1.2) : 0; s.P = Math.max(0, s.P + (s.q - po - s.brk - 1) / 100 * dt); } });
  return q; }
function minPs(x, p) { var m = p.Ps; x.sg.forEach(function (s) { if (s.P != null && s.P < m) m = s.P; }); return m; }
function loopStep(p, dt) { var x = p.x, cr = x.core, mt = mtc(p), tcs = [], m = 0, i;
  for (i = 0; i < 4; i++) { var s = x.sg[i], lw = Math.max(0.035, x.rcp[i]) * (cr.vv > 30 ? 0.5 : 1); var tc = cr.Th - (s.q || 0) * 1000 / (WCORE / 4 * lw * CPW); tc = clamp(tc, Math.min(cr.Th, tsat(s.P == null ? p.Ps : s.P)), cr.Th); tcs.push(tc); m += tc / 4; }
  cr.lp = tcs; var d = [], dm = 0, dropK = (x.f && x.f.drop) ? 1 : -1;
  for (i = 0; i < 4; i++) { d[i] = mt * (tcs[i] - m) * (x.rcp.some(function (r) { return r > 0.5; }) ? 0.55 : 1) + (i === dropK ? -420 : 0); dm += d[i] / 4; }
  var qt = [], sm = 0; for (i = 0; i < 4; i++) { qt[i] = Math.exp(0.00035 * (d[i] - dm)); sm += qt[i]; } cr.qt = qt.map(function (v) { return v * 4 / sm; }); cr.qptr = Math.max.apply(null, cr.qt);
  x.bu = (x.bu || 0) + Math.max(0, p.n) * 38 / 86400 * dt; }
/* the large-break LOCA (double-ended cold leg break) and the accumulators */
function lbBreak(x, cr, pz) { var vf = clamp(cr.vv / 160, 0, 1); var dp = Math.max(0, pz.P - x.ct.P); return 3600 * Math.sqrt(dp) * Math.pow(Math.min(1, dp / 40), 1.5) * (1 - 0.88 * vf); }
function accFlow(x, pz, dt) { var s = x.si, f = 0; if (s.accV == null) s.accV = [30, 30, 30, 30]; s.acc.forEach(function (o, k) { if (o && pz.P < 44 && s.accV[k] > 0) { var q = 900 * Math.sqrt((44 - pz.P) / 44 + 0.05); s.accV[k] = Math.max(0, s.accV[k] - q / 3600 * dt); f += q; } }); return f; }
function setBurnup(p, bu) { var r0 = rhoPcm(p); p.x.bu = bu; p.boron = clamp(p.boron + (rhoPcm(p) - r0) / BW, 0, 2500); }

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
var TEXS = 1; /* texture scale: 0.5 in Lite graphics */
var SEC = {}, HITS = [], CTRL = [], LAMPS = [], MAT = {}, SCR = [];
/* things the other boards show that the Section 1 model doesn't calculate yet: they drift realistically around their hot standby values */
var D = { grid: 50.0, gridV: 401, sgL: [50, 50, 50, 50], vct: 46, chg: 17.8, ltd: 17.2, tgSpd: 31, bat: 82, rwst: 96, dT: 0, thot: T0, tcold: T0, sub: 53, stmF: 0, feedF: 0, keff: 0.95, mode: 3, rho: 0, clock: 0 };
function derive(dt) {
  var p = S.p, q = Math.min(p.n, 1.2), wn = function (a) { return gauss() * a * Math.sqrt(Math.max(dt, 1e-3)); };
  var cr = p.x && p.x.core; if (cr) { D.dT = cr.dT; D.thot = cr.Th; D.tcold = cr.Tc; D.sub = cr.sub; } else { D.dT += (37 * q - D.dT) * (1 - Math.exp(-dt / 6)); D.thot = p.Tavg + D.dT / 2; D.tcold = p.Tavg - D.dT / 2; D.sub = tsat(p.rcs) - D.thot; }
  D.grid = clamp(D.grid + (50 - D.grid) * dt * 0.08 + wn(0.006), 49.85, 50.15); D.gridV = clamp(D.gridV + (401 - D.gridV) * dt * 0.1 + wn(0.15), 396, 406);
  for (var i = 0; i < 4; i++) D.sgL[i] = clamp(D.sgL[i] + (50 - D.sgL[i]) * dt * 0.08 + wn(0.12), 40, 60);
  D.vct = clamp(D.vct + (46 - D.vct) * dt * 0.02 + wn(0.05), 40, 52); D.chg = clamp(D.chg + (17.8 - D.chg) * dt * 0.2 + wn(0.08), 15, 21); D.ltd = clamp(D.ltd + (17.2 - D.ltd) * dt * 0.2 + wn(0.05), 15, 20);
  D.tgSpd = clamp(D.tgSpd + (31 - D.tgSpd) * dt * 0.3 + wn(0.2), 28, 34);
  D.stmF += (p.dump * 40 - D.stmF) * (1 - Math.exp(-dt / 3)); D.feedF += (D.stmF - D.feedF) * (1 - Math.exp(-dt / 12));
  D.rho = rhoPcm(p); D.keff = 1 / (1 - D.rho * 1e-5); var pr = (NI.pr[0] + NI.pr[1] + NI.pr[2] + NI.pr[3]) / 4; D.pr = pr;
  D.mode = D.keff < 0.99 ? (p.Tavg >= 177 ? 3 : p.Tavg > 93 ? 4 : 5) : pr <= 5 ? 2 : 1;
  D.clock = (S.clock0 || 0) + p.t * 2; /* the station day runs twice real speed: 24 h passes in 12 h */
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
function cyl(rt, rb, h, mat, seg, open) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20, 1, !!open), mat); }
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
  wall(2 * RX, 0, ZB, 0); wall(2 * RX, 0, ZF, Math.PI); wall(RDP / 2 - 0.65, -RX, RZC - (RDP / 4 + 0.325), Math.PI / 2); wall(RDP / 2 - 0.65, -RX, RZC + (RDP / 4 + 0.325), Math.PI / 2); (function () { var wm = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.85 }), W0 = -9.4, W1 = 8.75, Y0 = 0.35, Y1 = CH - 0.02;
    /* one big modern window: wall below, above, and either side, then a single frameless pane with a slim dark reveal */
    box(0.12, Y0, RDP, wm, RX, Y0 / 2, RZC, scene); box(0.12, CH - Y1, RDP, wm, RX, (CH + Y1) / 2, RZC, scene);
    box(0.12, Y1 - Y0, W0 - ZB, wm, RX, (Y0 + Y1) / 2, (ZB + W0) / 2, scene); box(0.12, Y1 - Y0, ZF - W1, wm, RX, (Y0 + Y1) / 2, (W1 + ZF) / 2, scene);
    var gl = new THREE.Mesh(new THREE.PlaneGeometry(W1 - W0, Y1 - Y0), new THREE.MeshPhysicalMaterial({ color: 0xcfe0ee, transparent: true, opacity: 0.06, roughness: 0.02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, side: THREE.DoubleSide, depthWrite: false })); gl.renderOrder = 5; gl.position.set(RX, (Y0 + Y1) / 2, (W0 + W1) / 2); gl.rotation.y = -Math.PI / 2; scene.add(gl);
    var rv = new THREE.MeshStandardMaterial({ color: 0x1c2026, roughness: 0.4, metalness: 0.6 }); box(0.14, 0.03, W1 - W0, rv, RX, Y0, (W0 + W1) / 2, scene); box(0.14, 0.03, W1 - W0, rv, RX, Y1, (W0 + W1) / 2, scene); box(0.14, Y1 - Y0, 0.03, rv, RX, (Y0 + Y1) / 2, W0, scene); box(0.14, Y1 - Y0, 0.03, rv, RX, (Y0 + Y1) / 2, W1, scene);
    box(0.3, 0.03, W1 - W0, new THREE.MeshStandardMaterial({ color: 0xe8eaec, roughness: 0.5 }), RX - 0.15, Y0 - 0.01, (W0 + W1) / 2, scene); })(); addOutside(scene); addWindows(scene); addHall(scene);
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
  var c = CV(Math.round(PCW * TEXS), Math.round(PCH * TEXS)), g = c.getContext('2d'); g.scale(TEXS, TEXS); var gr = g.createLinearGradient(0, 0, 0, PCH); gr.addColorStop(0, '#c8cbc7'); gr.addColorStop(1, '#b7bab6'); g.fillStyle = gr; g.fillRect(0, 0, PCW, PCH); speck(g, PCW, PCH, 9000, 0.03);
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
  var c = CV(Math.round(DCW * TEXS), Math.round(DCH * TEXS)), g = c.getContext('2d'); g.scale(TEXS, TEXS); g.fillStyle = '#c3c6c2'; g.fillRect(0, 0, DCW, DCH); speck(g, DCW, DCH, 7000, 0.03);
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
    ['MODE 2\nSTARTUP', 'status', function () { return D.mode === 2; }], ['MODE 1\nPOWER\nOPERATION', 'status', function () { return D.mode === 1; }], ['AFD OUTSIDE\nTARGET\nBAND', 'alarm', function () { var P = rtp(); return P > 50 && Math.abs(crx().afdI - afdTarget(P)) > 5; }], ['PR CHANNEL\nDEVIATION', 'alarm', function () { return D.pr > 50 && prDev() > 2; }], ['OT\u0394T ROD\nSTOP / C-3\nRUNBACK', 'alarm', function () { return !p().tripped && crx().c3; }], ['OP\u0394T ROD\nSTOP / C-4\nRUNBACK', 'alarm', function () { return !p().tripped && crx().c4; }],
    ['NIS DETECTOR\nHV FAILURE'], ['NIS RACK\nPOWER LOSS'], ['ROD POSITION\nDEVIATION'], ['ROD INSERTION\nLIMIT LO', 'alarm', function () { return D.mode <= 2 && D.keff >= 1 && p().pc < rilPc(rtp()) + 10; }], ['ROD INSERTION\nLIMIT LO-LO', 'alarm', function () { return D.mode <= 2 && D.keff >= 1 && p().pc < rilPc(rtp()); }], ['DRPI\nNON-URGENT\nFAILURE'], ['PLANT\nCOMPUTER\nALARM', 'alarm', function () { return D.mode === 1 && (crx().best > FULL * 1.005 || (rtp() > 15 && p().t > calDue(p()))); }], ['OT\u0394T\nTRIP', 'trip', function () { return p().tripped && p().firstOut === 'OTDT'; }], ['OP\u0394T\nTRIP', 'trip', function () { return p().tripped && p().firstOut === 'OPDT'; }], [''], [''], [''], [''], ['']]));
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
  /* core monitoring wall screen, between the mimic and the alarm summary */
  box(2.72, 1.58, 0.1, MAT.monitor, 0.53, 2.0, ZF - 0.06, scene).rotation.y = Math.PI;
  var cms = screenMesh(scene, 2.6, 1.46, 1280, 720, drawCoreScr, 1, 0.53, 2.0, ZF - 0.12, Math.PI, function () { return 'Core monitoring screen: axial power shape, AFD, thermal margins and Tech Specs. Click to open the core monitor and heat balance.'; }, 'core'); cms.m.userData.hit.act = function () { coreMenu('core'); };
  /* alarm summary + clock on the east wall */
  box(2.9, 1.7, 0.1, MAT.monitor, 3.4, 1.95, ZF - 0.06, scene).rotation.y = Math.PI;
  screenMesh(scene, 2.76, 1.55, 1280, 720, drawAlarmWall, 0.3, 3.4, 1.95, ZF - 0.12, Math.PI, function () { return 'Alarm summary screen. Click for the alarm response procedures.'; }, 'alarms'); SCR[SCR.length - 1].m.userData.hit.act = function () { arpMenu(); };
  var ck = digital({ lbl: 'STATION TIME (UTC)', txt: function () { return clockStr(D.clock); }, w: 1.0, h: 0.4, col: '#ff3b2f' }); ck.m.position.set(3.4, 3.15, ZF - 0.1); ck.m.rotation.y = Math.PI; scene.add(ck.m); hit(ck.m, { tip: function () { return 'Station clock: ' + clockStr(D.clock); } });
  var dw = widget({ cw: 512, ch: 300, w: 1.1, h: 0.64, glow: true, key: function () { return Math.floor(S.daysSince()) + ':' + S.p.trips; }, draw: function (g) { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, 512, 300); g.fillStyle = '#1f3b57'; g.fillRect(0, 0, 512, 64); ctext(g, 'DAYS WITHOUT A REACTOR TRIP', 256, 33, 30, '#fff', 'center', 490); g.fillStyle = '#111'; g.fillRect(146, 84, 220, 130); ctext(g, String(Math.floor(S.daysSince())), 256, 152, 104, '#ff3b2f', 'center', 210); ctext(g, 'SAFETY FIRST · QUESTIONING ATTITUDE', 256, 254, 22, '#1f3b57', 'center', 490); } });
  dw.m.position.set(6.4, 1.9, ZF - 0.05); dw.m.rotation.y = Math.PI; scene.add(dw.m); hit(dw.m, { tip: function () { return 'Days without a reactor trip: ' + Math.floor(S.daysSince()) + '. Trip the reactor and it goes back to 0.'; } });
  /* shift turnover whiteboard on the back wall */
  var wb = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), new THREE.MeshStandardMaterial({ roughness: 0.3, map: signTex(1200, 650, function (g) { g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, 1200, 650); g.strokeStyle = '#9aa0a6'; g.lineWidth = 16; g.strokeRect(0, 0, 1200, 650);
    g.font = 'bold 44px "Comic Sans MS","Segoe Print","Bradley Hand",cursive'; g.fillStyle = '#1f4fa8'; g.fillText('SHIFT TURNOVER – UNIT 1', 40, 72); g.font = '31px "Comic Sans MS","Segoe Print","Bradley Hand",cursive';
    ['• Hot standby (Mode 3). Tavg 291.7 °C, RCS 155 bar', '• All rods in. Boron 1200 ppm (sampled 06:00)', '• ECP: control bank D at 120 steps', '• SR N31 about 90 cps, N32 about 85 cps', '• Steam dumps: STEAM PRESS mode, 74.8 bar', '• Plan: reactor startup to POAH (GOP-301)'].forEach(function (t, i) { g.fillStyle = '#222'; g.fillText(t, 40, 140 + i * 56); });
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
  var dh = invis(2, 2.3, 0.3); dh.position.set(RX - 0.1, 1.15, 9.9); scene.add(dh); hit(dh, { tip: 'Door to the outside: click to open, then walk out into the snow', act: function () { DOORS.toggle(dr); } }); DOORS.reg(dr, 'east');
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
  /* the acoustic panels show the mountain view: a painted landscape on the face that looks into the room */
  var panelC = CV(1024, 640); drawLandscape(panelC.getContext('2d')); var landT = texOf(panelC); var landM = new THREE.MeshStandardMaterial({ map: landT, roughness: 0.9 }); AURORA_IMG.addEventListener('load', function () { drawLandscape(panelC.getContext('2d')); landT.needsUpdate = true; });
  /* side-wall windows: a white frame with mullions and a sill, glass showing a different part of the photo in each one */
  var frM = new THREE.MeshStandardMaterial({ color: 0xe9ecef, roughness: 0.45 }), wi = 0;
  for (var z = -7; z <= 6; z += 2.7, wi++) box(0.05, 1.5, 2.4, acM, -RX + 0.03, 3.0, z, scene);
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
    POST.comp = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, b: { value: null }, ex: { value: 0.82 }, bs: { value: 0.22 }, time: { value: 0 }, res: { value: new THREE.Vector2(1, 1) }, mb: { value: new THREE.Vector2() } }, vertexShader: vs,
      fragmentShader: 'uniform sampler2D t; uniform sampler2D b; uniform vec2 mb; uniform float ex; uniform float bs; uniform float time; uniform vec2 res; varying vec2 vUv;' +
        'vec3 aces(vec3 x){ x *= ex; const mat3 m1 = mat3(0.59719,0.07600,0.02840, 0.35458,0.90834,0.13383, 0.04823,0.01566,0.83777); const mat3 m2 = mat3(1.60475,-0.10208,-0.00327, -0.53108,1.10813,-0.07276, -0.07367,-0.00605,1.07602); vec3 v = m1 * x; vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 d = v * (0.983729 * v + 0.4329510) + 0.238081; return clamp(m2 * (a / d), 0.0, 1.0); }' +
        'vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }' +
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }' +
        'void main(){ vec2 d = (vUv - 0.5); vec3 c = vec3(0.0); if (dot(mb, mb) > 1e-7) { for (int i = 0; i < 10; i++) { vec2 q = vUv + mb * (float(i) / 9.0 - 0.5); c += texture2D(t, q).rgb + texture2D(b, q).rgb * bs; } c /= 10.0; } else { c = texture2D(t, vUv).rgb + texture2D(b, vUv).rgb * bs; } vec3 o = srgb(aces(c));' +
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
    POST.comp.uniforms.t.value = POST.main.texture; POST.comp.uniforms.b.value = POST.lv[0].texture; POST.comp.uniforms.time.value = (performance.now() % 10000) / 1000; POST.comp.uniforms.mb.value.copy(POST.mbv || new THREE.Vector2()); POST.pass(POST.comp, null);
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
function pHit(s, x, y, w, h, o) { o.sec = s; o.px = x; o.py = y; var m = invis(w, h, 0.02); m.position.set(x, y, PZ + 0.012); s.g.add(m); hit(m, o); return m; }
function dHit(s, u, d, w, dd, hgt, o) { o.sec = s; o.du = u; o.dd = d; var m = invis(w, hgt, dd); m.position.set(u, hgt / 2, -d * SL); s.desk.add(m); hit(m, o); return m; }
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
  dHit(s, u, d + 0.02, 0.11, 0.13, 0.06, { knob: { r: r, s: s, k: 'turn', y: 0.012, sw: 1 }, tip: function () { return o.t.replace(/\n/g, ' ') + ': ' + (o.on() ? (o.onTxt || 'ON') + ' (red)' : (o.offTxt || 'OFF') + ' (green)') + (o.why ? '. ' + o.why() : ''); }, info: o.info,
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
  var hb = dHit(s, u, d, 0.16, 0.16, 0.04, { knob: { r: r, s: s, k: 'cur', y: 0.008 }, tip: function () { return o.t.replace(/\n/g, ' ') + ': ' + o.pos[o.get()] + (o.tip ? '. ' + o.tip : ''); }, info: o.info,
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
  if (b.swg) { ch = false; b.sw.forEach(function (r, i) { var tgt = r.spring * 0.78; if (r.lock) { if (r.lockLast === r.turn && !force) return; r.lockLast = r.turn; E.set(0, -r.turn, 0); Q.setFromEuler(E); V.set(r.u, 0.012, -r.d * SL); M4.compose(V, Q, SC); b.swg.setMatrixAt(i, M4); ch = true; return; } if (Math.abs(r.turn - tgt) < 0.002 && !force) { if (r.spring && Math.abs(r.turn - tgt) < 0.05) r.spring = 0; return; } r.turn += (tgt - r.turn) * (1 - Math.exp(-dt * 16)); if (r.spring && Math.abs(r.turn - tgt) < 0.05) r.spring = 0; E.set(0, -r.turn, 0); Q.setFromEuler(E); V.set(r.u, 0.012, -r.d * SL); M4.compose(V, Q, SC); b.swg.setMatrixAt(i, M4); ch = true; }); if (ch) b.swg.instanceMatrix.needsUpdate = true; }
  if (b.pbc) { ch = false; b.pb.forEach(function (r, i) { var lit = r.o.lit ? (lt || !!r.o.lit()) : true, k = (r.push > 0 ? 1 : 0) + (lit ? 2 : 0); if (r.push > 0) r.push -= dt; if (k === r.st && !force) return; r.st = k; V.set(r.u, r.push > 0 ? 0.017 : 0.022, -r.d * SL); M4.compose(V, Q.identity(), SC); b.pbc.setMatrixAt(i, M4); b.pbc.setColorAt(i, lit || !r.o.lit ? r.c : r.c.clone().multiplyScalar(0.35)); ch = true; }); if (ch) { b.pbc.instanceMatrix.needsUpdate = true; b.pbc.instanceColor.needsUpdate = true; } }
  if (b.rk) { ch = false; b.rot.forEach(function (r, i) { var t = r.ang(r.o.get()); if (r.lock) { if (r.lockLast === r.cur && !force) return; r.lockLast = r.cur; } else { if (Math.abs(r.cur - t) < 0.002 && !force) return; r.cur += (t - r.cur) * (1 - Math.exp(-dt * 18)); } E.set(0, -r.cur, 0); Q.setFromEuler(E); V.set(r.u, 0.008, -r.d * SL); M4.compose(V, Q, SC); b.rk.setMatrixAt(i, M4); ch = true; }); if (ch) b.rk.instanceMatrix.needsUpdate = true; }
  b.at += dt; if (b.at > 0.35 || force) { b.at = 0; beAtlas(b, force); }
}
var BEI = 0, BEN = 3; function beFrame(dt) { if (!BE.length) return; for (var k = 0; k < BEN; k++) { BEI = (BEI + 1) % BE.length; beTick(BE[BEI], dt * BE.length / BEN); } BE.forEach(function (b) { if (b.ramp && b.ramp.o.raise) b.ramp.o.raise(b.ramp.dir, dt); }); }
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
  dgRow(s, 0.98, 2.24, [['CTMT AREA mSv/h', function () { return (0.012 + Math.random() * 0.001 + (crx().brk > 0.2 ? 0.8 : 0) + (crx().dmg ? 45 : 0)).toFixed(3); }, 'Containment area radiation'], ['N-16 MAIN STEAM', function () { return (S.p.n * 12 + 0.01 + (X().f && X().f.sgtl ? 180 * S.p.n + 40 : 0)).toFixed(2); }, 'Main steam N-16 monitor (detects steam generator tube leaks)', '#59e07a']], 0.2);
  dgRow(s, 0.98, 2.11, [['AIR EJECTOR cpm', function () { return String(Math.round(40 + Math.random() * 6 + (X().f && X().f.sgtl ? 2400 : 0))); }, 'Condenser air ejector radiation'], ['STACK kBq/m³', function () { return (0.31 + Math.random() * 0.02).toFixed(2); }, 'Stack discharge monitor', '#59e07a']], 0.2);
  dgRow(s, 0.98, 1.98, [['CONTROL ROOM µSv/h', function () { return ((X().crRad || 0.08) * (1 + Math.random() * 0.1)).toFixed(2); }, 'Control room area monitor', '#59e07a'], ['FUEL POOL mSv/h', function () { return (0.004 + Math.random() * 0.001).toFixed(3); }, 'Spent fuel pool area monitor']], 0.2);
  dgRow(s, 0.98, 1.85, [['SG BLOWDOWN cpm', function () { return String(Math.round(22 + Math.random() * 4)); }, 'Steam generator blowdown monitor'], ['RCS LETDOWN cpm', function () { return String(Math.round((1800 + Math.random() * 60) * (crx().dmg ? 40 : 1))); }, 'Letdown line gross activity']], 0.2);
  lampRow(s, -1.62, 1.5, [['SI\nACTUATED', function () { return x().si.on; }, 0xff3324], ['SI BLOCK\nPZR PRESS', function () { return x().si.blkP; }, 0xffc94a], ['SI BLOCK\nSTM PRESS', function () { return x().si.blkS; }, 0xffc94a], ['P-11\n< 136 BAR', function () { return x().pz.P < 136; }, 0xf5f2e6], ['CTMT ISOL\nPHASE A', function () { return x().si.phaseA; }, 0xff3324],
    ['FEEDWATER\nISOLATION', function () { return !!x().fwIso; }, 0xff3324], ['SI RESET\nPERMITTED', function () { return x().si.on && S.p.t - x().si.at > 60; }, 0xf5f2e6], ['CS\nACTUATED', function () { return x().si.cs.some(Boolean); }, 0xff3324], ['ACCUMS\nINJECTING', function () { return x().pz.P < 45 && x().si.acc.some(Boolean); }, 0xffc94a], ['RWST\nLO LEVEL', function () { return x().si.rwst < 30; }, 0xffc94a],
    ['EDG A\nRUNNING', function () { return x().el.edg[0].run; }, 0xff3324], ['EDG B\nRUNNING', function () { return x().el.edg[1].run; }, 0xff3324], ['RHR A\nRUNNING', function () { return x().si.rhr[0]; }, 0xff3324], ['RHR B\nRUNNING', function () { return x().si.rhr[1]; }, 0xff3324], ['SIP A\nRUNNING', function () { return x().si.pumps[0]; }, 0xff3324], ['SIP B\nRUNNING', function () { return x().si.pumps[1]; }, 0xff3324],
    ['CCP A\nRUNNING', function () { return x().cv.ccp[0]; }, 0xff3324], ['CCP B\nRUNNING', function () { return x().cv.ccp[1]; }, 0xff3324], ['AFW\nACTUATED', function () { return x().tdafw; }, 0xff3324], ['TURBINE\nTRIPPED', function () { return !x().tb.latched; }, 0xffc94a], ['REACTOR\nTRIPPED', function () { return S.p.tripped; }, 0xffc94a]], 0.163);
  addAnn(s, annTiles([['SAFETY\nINJECTION', 'trip', function () { return x().si.on; }], ['CTMT PRESS\nHIGH', 'alarm', function () { return x().ct.P > 0.15; }], ['CTMT ISOL\nPHASE A', 'alarm', function () { return x().si.phaseA; }], ['CONTAINMENT\nSPRAY', 'alarm', function () { return x().si.cs.some(Boolean); }], ['RWST LEVEL\nLOW', 'alarm', function () { return x().si.rwst < 30; }], ['ACCUMULATOR\nPRESS LOW', 'alarm', function () { return x().pz.P < 45; }], ['SI PUMP\nRUNNING', 'alarm', function () { return x().si.pumps.some(Boolean); }],
    ['RHR PUMP\nRUNNING', 'alarm', function () { return x().si.rhr.some(Boolean); }], ['N-16 HIGH\nSG TUBE LEAK', 'alarm', function () { return !!(X().f && X().f.sgtl); }], ['CTMT AREA\nRAD HIGH', 'alarm', function () { return crx().brk > 0.2 || crx().dmg; }], ['AIR EJECTOR\nRAD HIGH', 'alarm', function () { return !!(X().f && X().f.sgtl); }], ['CONTROL RM\nRAD HIGH', 'alarm', function () { return (X().crRad || 0) > 1; }], ['SUMP LEVEL\nHIGH', 'alarm', function () { return x().ct.sump > 20; }], ['H₂\nHIGH'],
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
  var th = function (i) { return function () { return D.thot + (i - 1.5) * 0.08; }; }, tc = function (i) { return function () { var l = crx().lp; return l ? l[i] : D.tcold; }; };
  meterRow(s, -1.68, 2.0, [].concat.apply([], L4(function (i) { return [['TH ' + (i + 1), '°C', 260, 340, th(i), 'Loop ' + (i + 1) + ' hot leg temperature', null, { major: 4, minor: 4 }], ['TC ' + (i + 1), '°C', 260, 340, tc(i), 'Loop ' + (i + 1) + ' cold leg temperature', null, { major: 4, minor: 4 }]]; })), 0.098);
  dgRow(s, -1.6, 1.79, L4(function (i) { return ['LOOP ' + (i + 1) + ' TAVG', function () { return ((th(i)() + tc(i)()) / 2).toFixed(1); }]; }), 0.2);
  meterRow(s, 0.1, 2.0, L4(function (i) { return ['AMPS ' + (i + 1), 'A', 0, 1000, function () { return x().rcp[i] * (612 + i * 4) + (x().rcp[i] > 0.05 && x().rcp[i] < 0.95 && x().rcpOn[i] ? 2500 * (1 - x().rcp[i]) : 0); }, 'RCP ' + (i + 1) + ' motor current']; }).concat(
    L4(function (i) { return ['SEAL ' + (i + 1), 'l/min', 0, 30, function () { return x().rcpOn[i] ? 11.5 + i * 0.3 : 0.5; }, 'RCP ' + (i + 1) + ' seal leakoff', [/x/, 'RCP seal leakoff', 'Each pump shaft has a stack of seals; a little water deliberately leaks through them. Too much or too little leakoff means a seal is failing.']]; })), 0.098, { info: [/x/, 'Reactor coolant pumps', 'Four 6 MW pumps, one per loop, each moving about 5 tonnes of water a second. Starting one takes a huge current for about 30 seconds while it gets up to speed.', 'Before starting a pump, operators check oil lift pumps, seal injection and cooling water.'] });
  meterRow(s, -1.68, 1.42, [].concat.apply([], L4(function (i) { return [['FLOW ' + (i + 1), '% FLOW', 0, 120, function () { return x().rcp[i] * 100 + (x().rcp[i] < 0.05 ? 3 : 0); }, 'Loop ' + (i + 1) + ' RCS flow', null, { h: 0.18, major: 6, minor: 2, bands: [[0, 0.75, RD]] }]]; })), 0.098);
  meterRow(s, -1.25 + 0.07, 1.42, [['ΔT', '°C', 0, 50, function () { return D.dT; }, 'Core temperature rise (hot leg minus cold leg)', null, { h: 0.18 }], ['WR P', 'BAR', 0, 200, function () { return x().pz.P + 2; }, 'Wide-range RCS pressure', null, { h: 0.18 }]], 0.098);
  DG(s, -0.75, 1.52, 'CORE EXIT TC MAX °C', function () { return crx().cet.toFixed(1); }, { w: 0.22, name: 'Hottest core exit thermocouple' }); DG(s, -0.75, 1.4, 'SUBCOOLING °C', function () { return D.sub.toFixed(1); }, { w: 0.22, col: '#59e07a' });
  DG(s, -0.75, 1.28, 'RVLIS % (VESSEL LEVEL)', function () { return String(Math.round(crx().rvl)); }, { w: 0.22, name: 'Reactor vessel level' });
  lampRow(s, -0.45, 1.5, L4(function (i) { return ['RCP ' + (i + 1) + '\nOIL LIFT', function () { return !!(x().oil && x().oil[i]); }, 0xff3324]; }).concat(L4(function (i) { return ['RCP ' + (i + 1) + '\nRUNNING', function () { return x().rcpOn[i]; }, 0xff3324]; })).concat([['NAT CIRC\nONLY', function () { return x().rcp.every(function (r) { return r < 0.1; }); }, 0xffc94a], ['LOW FLOW\nTRIP ARMED', function () { return S.p.n > 0.1; }, 0xf5f2e6]]), 0.106);
  addAnn(s, annTiles([['RCS FLOW\nLOW TRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'LOFLOW'; }], ['OT ΔT\nTRIP', 'trip', function () { return S.p.tripped && S.p.firstOut === 'OTDT'; }], ['RCP 1\nTRIPPED', 'alarm', function () { return !x().rcpOn[0]; }], ['RCP 2\nTRIPPED', 'alarm', function () { return !x().rcpOn[1]; }], ['RCP 3\nTRIPPED', 'alarm', function () { return !x().rcpOn[2]; }], ['RCP 4\nTRIPPED', 'alarm', function () { return !x().rcpOn[3]; }], ['RCS FLOW\nLOW', 'alarm', function () { return x().rcp.some(function (r) { return r < 0.9; }); }],
    ['SUBCOOLING\nLOW', 'alarm', function () { return D.sub < 15; }], ['TAVG HIGH\n> 310', 'alarm', function () { return S.p.Tavg > 310; }], ['TAVG/TREF\nDEVIATION', 'alarm', function () { return Math.abs(S.p.Tavg - trefC(x())) > 3 && x().tb.mw > 50; }], ['RCP SEAL\nLEAKOFF HI'], ['RCP\nVIBRATION', 'alarm', function () { return crx().vv > 35 && x().rcpOn.some(Boolean); }], ['RCP BEARING\nTEMP HIGH', 'alarm', function () { return x().brgT.some(function (t) { return t > 80; }); }], ['RVLIS\nLEVEL LOW', 'alarm', function () { return crx().rvl < 95; }],
    ['RCPs ALL\nRUNNING', 'status', function () { return x().rcpOn.every(Boolean); }], ['NATURAL\nCIRCULATION', 'status', function () { return x().rcp.every(function (r) { return r < 0.1; }); }]]));
  dgrp(s, -1.74, 1.74, 0.18, 0.96, 'REACTOR COOLANT PUMPS  ·  OIL LIFT PUMPS');
  swRow(s, -1.55, 0.66, L4(function (i) { return pumpSW('RCP ' + (i + 1), function () { return X().rcpOn; }, i, 'rcp', { can: function () { var x2 = X(); if (!(x2.oil && x2.oil[i])) return 'start its oil lift pump first (the bearings need oil before the shaft turns).'; if (!(x2.cv.ccp.some(Boolean) || x2.cv.pd)) return 'no seal injection: start a charging pump first.'; return null; }, after: function (v) { if (v) S.toast('RCP ' + (i + 1) + ' starting: watch the motor current surge then settle.'); } }); }), 0.38);
  swRow(s, -1.55, 0.28, L4(function (i) { return valveSW('RCP ' + (i + 1) + '\nOIL LIFT', function () { return !!(X().oil && X().oil[i]); }, function (v) { var x2 = X(); if (!x2.oil) x2.oil = [false, false, false, false]; x2.oil[i] = v; }, { l: 'OFF', r: 'ON', onTxt: 'RUNNING', offTxt: 'OFF' }); }), 0.38);
};
/* --------------------------------------------------------------- 6. STEAM GENERATORS & FEEDWATER --------------------------------------------------------------- */
CONTENT.sg = function (s) { be(s); var x = X, sgi = function (i) { return x().sg[i]; };
  grp(s, -1.74, 1.74, 1.66, 2.33, 'STEAM GENERATORS 1–4: LEVEL  ·  STEAM FLOW  ·  FEED FLOW'); grp(s, -1.74, 1.74, 1.18, 1.62, 'FEED REGULATING VALVES  ·  AUX FEED VALVES  ·  FEED PUMPS');
  L4(function (i) { var x0 = -1.68 + i * 0.88; meterRow(s, x0, 2.0, [['NR ' + (i + 1), '% LEVEL', 0, 100, function () { return sgi(i).L; }, 'Steam generator ' + (i + 1) + ' narrow range level', null, { bands: [[0, 0.17, RD], [0.85, 1, RD]] }], ['WR ' + (i + 1), '% LEVEL', 0, 100, function () { return 35 + sgi(i).Lm * 0.45; }, 'Steam generator ' + (i + 1) + ' wide range level'],
    ['STM ' + (i + 1), '% FLOW', 0, 30, function () { return sgi(i).steam; }, 'SG ' + (i + 1) + ' steam flow', null, { major: 3, minor: 5 }], ['FEED ' + (i + 1), '% FLOW', 0, 30, function () { return sgi(i).feed; }, 'SG ' + (i + 1) + ' feed flow', null, { major: 3, minor: 5 }], ['P ' + (i + 1), 'BAR', 0, 100, function () { var s = S.p.x.sg[i]; return s.P == null ? S.p.Ps : s.P; }, 'Steam generator ' + (i + 1) + ' pressure']], 0.098, { info: [/x/, 'Steam generator', 'A tall heat exchanger with about 5,000 U-shaped tubes. Reactor coolant flows inside the tubes and boils the feedwater outside them. Level must stay between 17% (trip: the tubes could uncover) and 85% (trip: water would reach the turbine).', 'Level shrinks and swells: open the steam valves and level jumps up for a moment as the bubbles grow, even though water is leaving.'] }); });
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
    ['1ST STG', 'BAR', 0, 70, function () { return x().tb.steam / FULL * 62; }, 'Turbine first stage pressure (measures turbine load)'], ['TREF', '°C', 285, 315, function () { return trefC(x()); }, 'Reference temperature (from turbine load)', null, { major: 3, minor: 5 }]], 0.098, { info: [/x/, 'Steam dumps', 'Twelve valves that send steam straight to the condenser, skipping the turbine. In STEAM PRESSURE mode they hold the header at 74.8 bar (hot standby). In TAVG mode they open on a big load drop, dumping up to 40% of full steam flow so the reactor doesn’t have to trip.', 'They need condenser vacuum (C-9) and are blocked when Tavg is below 286 °C (P-12), to stop them cooling the reactor down too far.'] });
  for (var k = 0; k < 12; k++) (function (k) { LP(s, -0.24 + (k % 6) * 0.2, k < 6 ? 2.2 : 1.95, 'DUMP\nPCV-' + (500 + k), function () { return S.p.dump > (k + 0.5) / 12; }, 0xff3324); })(k);
  meterRow(s, 1.1, 2.0, [['VAC', 'BAR a', 0, 1, function () { return x().vac; }, 'Condenser back pressure (vacuum)', [/x/, 'Condenser vacuum', 'Steam from the turbine condenses on tubes cooled by sea water, leaving a near vacuum (about 0.06 bar). That vacuum is what lets the turbine extract so much energy. Lose it and the turbine trips.'], { bands: [[0.2, 1, RD]] }], ['HOTWELL', '% LEVEL', 0, 100, function () { return x().hotwell; }, 'Condenser hotwell level'], ['CW IN', '°C', 0, 30, function () { return x().aux.swT; }, 'Circulating water inlet temperature'], ['CW OUT', '°C', 0, 40, function () { return x().aux.swT + 1 + 10 * S.p.dump + x().tb.mw / 120; }, 'Circulating water outlet temperature']], 0.098);
  MA(s, -1.6, 1.4, { t: 'STEAM DUMP\nPRESS CTRL', mode: function () { return x().dumpCtl; }, setMode: function (m) { x().dumpCtl = m; x().dumpDem = S.p.dump; S.addLog('Steam dump pressure controller to ' + m); }, out: function () { return S.p.dump; }, pv: function () { return S.p.Ps.toFixed(1) + ' bar'; }, sp: function () { return PSP.toFixed(1); }, raise: function (d, dt) { if (x().dumpCtl === 'MAN') x().dumpDem = clamp(x().dumpDem + d * dt * 0.05, 0, 1); },
    info: [/x/, 'Steam dump pressure controller', 'In AUTO it opens the dumps to hold steam pressure at 74.8 bar, which holds Tavg at 291.7 °C. In MANUAL you set the dump demand yourself: more steam out means the coolant cools down.'] });
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
/* ---------------------------------------------------------------- mimic lines ----------------------------------------------------------------
   Real boards have the system drawn on them as coloured pipes, with the controls sitting on the pipe they work. Colours follow
   the usual convention: red hot coolant, blue cold water/feed, purple steam, orange borated water, green cooling water, yellow electrical. */
var MIMC = { hot: '#c0392b', cold: '#2e6fb5', stm: '#8e44ad', bor: '#d9822b', cw: '#2f9e5b', el: '#c9a227' };
var MIMIC = {
  esf: [['bor', [[-1.72, 1.6], [-0.3, 1.6], [-0.3, 1.25], [1.72, 1.25]], 'RWST → SI PUMPS → COLD LEGS']],
  aux: [['cw', [[-1.72, 1.6], [1.72, 1.6]], 'SEA WATER → CCW HEAT EXCHANGERS'], ['cw', [[-1.0, 1.6], [-1.0, 1.25], [1.0, 1.25], [1.0, 1.6]], '']],
  cvcs: [['bor', [[-1.72, 1.62], [1.72, 1.62]], 'VCT → CHARGING PUMPS → RCS'], ['cold', [[1.72, 1.24], [-1.72, 1.24]], 'RCS → LETDOWN → VCT']],
  pzr: [['hot', [[-1.7, 1.24], [0, 1.24], [0, 1.62]], 'SURGE LINE FROM HOT LEG 4'], ['cold', [[1.7, 1.62], [0.4, 1.62]], 'SPRAY FROM COLD LEGS'], ['stm', [[0, 1.62], [0, 1.64], [-1.2, 1.64]], 'TO PORVs / PRT']],
  rcs: [['hot', [[-1.72, 1.97], [1.72, 1.97]], 'HOT LEGS: CORE → SGs'], ['cold', [[1.72, 1.24], [-1.72, 1.24]], 'COLD LEGS: SGs → RCPs → CORE'], ['cold', [[-1.3, 1.24], [-1.3, 1.6]], ''], ['cold', [[-0.45, 1.24], [-0.45, 1.6]], ''], ['cold', [[0.45, 1.24], [0.45, 1.6]], ''], ['cold', [[1.3, 1.24], [1.3, 1.6]], '']],
  sg: [['stm', [[-1.72, 2.3], [1.72, 2.3]], 'STEAM TO MAIN STEAM HEADER'], ['cold', [[1.72, 1.24], [-1.72, 1.24]], 'FEED FROM FEED PUMPS'], ['cold', [[-1.3, 1.24], [-1.3, 2.3]], ''], ['cold', [[-0.45, 1.24], [-0.45, 2.3]], ''], ['cold', [[0.45, 1.24], [0.45, 2.3]], ''], ['cold', [[1.3, 1.24], [1.3, 2.3]], '']],
  ms: [['stm', [[-1.72, 2.3], [1.72, 2.3]], 'MAIN STEAM HEADER → TURBINE'], ['stm', [[-0.9, 2.3], [-0.9, 1.25], [1.72, 1.25]], 'STEAM DUMPS → CONDENSER'], ['cw', [[-1.72, 1.6], [-1.2, 1.6]], 'CW']],
  tb: [['stm', [[-1.72, 2.3], [0.6, 2.3], [0.6, 1.6]], 'STEAM IN → HP / LP TURBINE'], ['cold', [[0.6, 1.25], [-1.72, 1.25]], 'CONDENSATE → FEED HEATERS']],
  gen: [['el', [[-1.72, 1.97], [0.4, 1.97]], 'GENERATOR 22 kV'], ['el', [[0.6, 1.97], [1.72, 1.97]], 'GEN TRANSFORMER → 400 kV GRID']],
  elec: [['el', [[-1.72, 2.3], [1.72, 2.3]], '400 kV / STATION TRANSFORMER'], ['el', [[-1.2, 2.3], [-1.2, 1.25], [1.2, 1.25], [1.2, 2.3]], '11 kV UNIT BUSES → 6.6 kV SAFETY BUSES'], ['el', [[0, 1.25], [0, 1.05]], 'EDG A / B']]
};
Object.keys(MIMIC).forEach(function (id) { var f = CONTENT[id]; if (!f) return; CONTENT[id] = function (s) { MIMIC[id].forEach(function (m) { s.mimic.push({ col: MIMC[m[0]], w: 18, pts: m[1] }); }); var r = f.apply(this, arguments); s.artP = s.artP || [];
  MIMIC[id].forEach(function (m) { if (!m[2]) return; var p0 = m[1][0], dx = m[1][1][0] - p0[0]; s.artP.push(function (g) { var X = px(p0[0] + (dx >= 0 ? 0.04 : -0.04)), Y = py(p0[1] + 0.028); g.font = 'bold 26px ' + FONT; g.textAlign = dx >= 0 ? 'left' : 'right'; g.textBaseline = 'middle'; g.lineWidth = 7; g.strokeStyle = 'rgba(236,237,233,.95)'; g.strokeText((dx >= 0 ? '▶ ' : '◀ ') + m[2], X, Y); g.fillStyle = MIMC[m[0]]; g.fillText((dx >= 0 ? '▶ ' : '◀ ') + m[2], X, Y); }); }); return r; }; });

/* ================================================================ career: XP, levels, ranks, achievements, daily challenges ================================================================
   Everything you do in the control room earns XP: checklist steps, whole procedures, every megawatt-hour you send to the grid,
   steady operation, and how well you handle faults. Levels climb through real job titles from trainee to station manager. */
var RANKS = [[1, 'Trainee'], [3, 'Auxiliary Operator'], [6, 'Plant Operator'], [10, 'Trainee Reactor Operator'], [15, 'Reactor Operator'], [20, 'Licensed Reactor Operator'], [26, 'Senior Reactor Operator'], [32, 'Shift Supervisor'], [40, 'Shift Manager'], [48, 'Station Manager'], [56, 'Chief Nuclear Officer']];
function lvlXp(L) { return 100 * (L - 1) + 35 * (L - 1) * L / 2 - 35 * 0; } /* total XP needed to reach level L */
function lvlOf(xp) { var L = 1; while (lvlXp(L + 1) <= xp) L++; return L; }
function rankOf(L) { var r = RANKS[0][1]; RANKS.forEach(function (q) { if (L >= q[0]) r = q[1]; }); return r; }
function nextRank(L) { for (var i = 0; i < RANKS.length; i++) if (RANKS[i][0] > L) return RANKS[i]; return null; }
var ACH = [
  ['crit', '☢️', 'First criticality', 'Take the reactor critical.', 50],
  ['star3', '⭐', 'Textbook startup', 'Get three stars on a reactor startup.', 100],
  ['shut', '⏬', 'Safe shutdown', 'Complete the shutdown checklist.', 50],
  ['hall', '🚶', 'Plant walkdown', 'Walk through to the reactor hall and look into the cavity.', 40],
  ['sync', '⚡', 'On the grid', 'Synchronise the generator to the 400 kV grid.', 75],
  ['asc', '📈', 'Power ascension', 'Complete the GOP-302 checklist to 50% power.', 100],
  ['full', '🔥', 'Full power', 'Send 1,100 MW or more to the grid.', 150],
  ['gwh1', '💡', '1 GWh', 'Generate 1,000 MWh in total.', 50],
  ['gwh10', '🏘️', '10 GWh', 'Generate 10,000 MWh: a year of electricity for 3,000 homes.', 150],
  ['gwh100', '🏙️', '100 GWh', 'Generate 100,000 MWh.', 400],
  ['online8', '🕒', 'Full shift on line', '8 hours of plant time on the grid without a trip.', 150],
  ['xenon', '🧪', 'Xenon watcher', 'Run long enough for xenon to reach 2,500 pcm.', 75],
  ['dilute', '💧', 'Boron chemist', 'Dilute 200 ppm of boron in total.', 75],
  ['fault1', '🛠️', 'Fault finder', 'Handle your first fault safely.', 75],
  ['online', '🧱', 'Kept it on line', 'Handle a fault without the reactor tripping.', 120],
  ['tmi', '🛡️', 'Not like Three Mile Island', 'Isolate a stuck-open PORV before safety injection.', 150],
  ['loop', '🔌', 'Blackout survivor', 'Handle a loss of offsite power safely.', 120],
  ['secret', '🎲', 'Expect the unexpected', 'Handle a secret fault safely.', 120],
  ['allf', '🏆', 'Seen it all', 'Handle all seven fault types safely.', 300],
  ['hour1', '☕', 'First hour', 'Spend an hour in the control room.', 50],
  ['hour5', '🌙', 'Night shift', 'Spend 5 hours in the control room.', 150],
  ['hour20', '🏅', 'Veteran', 'Spend 20 hours in the control room.', 400],
  ['lv10', '🎓', 'Reactor operator trainee', 'Reach level 10.', 100],
  ['lv20', '📜', 'Licensed', 'Reach level 20.', 200],
  ['daily', '📅', 'Daily grind', 'Finish all three daily challenges in one day.', 75]
];
var DAILY = [
  ['gen', 'Generate 2,000 MWh', 2000, function (d) { return d.gen || 0; }],
  ['start', 'Complete a reactor startup', 1, function (d) { return d.start || 0; }],
  ['asc', 'Complete a power ascension', 1, function (d) { return d.asc || 0; }],
  ['shut', 'Complete a shutdown', 1, function (d) { return d.shut || 0; }],
  ['fault', 'Handle a fault safely', 1, function (d) { return d.fault || 0; }],
  ['secret', 'Handle a secret fault safely', 1, function (d) { return d.secret || 0; }],
  ['online', '2 hours of plant time on line without a trip', 7200, function (d) { return d.online || 0; }],
  ['full', 'Reach 1,100 MW', 1, function (d) { return d.full || 0; }],
  ['dil', 'Dilute 50 ppm of boron', 50, function (d) { return d.dil || 0; }],
  ['steady', 'Hold Tavg on Tref at power for 30 plant minutes', 1800, function (d) { return d.steady || 0; }]
];
var CAR = {
  p: null, dirty: false, saveT: 0, pend: 0, pendWhy: '', pendT: 0, genAcc: 0, stT: 0, wasGen: false, lastB: null,
  fresh: function () { return { xp: 0, ach: {}, st: { mwh: 0, onl: 0, play: 0, starts: 0, ascs: 0, shuts: 0, faults: 0, trips: 0, dil: 0, best: 0, curOn: 0 }, fseen: {}, day: null }; },
  load: function () { var sv = rd(); CAR.p = Object.assign(CAR.fresh(), sv.prog || {}); CAR.p.st = Object.assign(CAR.fresh().st, CAR.p.st || {}); CAR.dayCheck(); },
  save: function () { if (!CAR.p) return; var sv = rd(); sv.prog = CAR.p; wr(sv); CAR.dirty = false; },
  lvl: function () { return lvlOf(CAR.p.xp); },
  today: function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  dayCheck: function () { var t = CAR.today(), p = CAR.p; if (p.day && p.day.date === t) return; var seed = 0; for (var i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) % 100003;
    var pool = DAILY.map(function (q, k) { return k; }), pick = []; while (pick.length < 3) { seed = (seed * 9301 + 49297) % 233280; var k = pool.splice(Math.floor(seed / 233280 * pool.length), 1)[0]; pick.push(DAILY[k][0]); }
    p.day = { date: t, ids: pick, c: {}, done: {}, all: false }; CAR.dirty = true; },
  dayAdd: function (k, n) { var p = CAR.p; CAR.dayCheck(); var d = p.day; if (d.ids.indexOf(k) < 0) return; d.c[k] = (d.c[k] || 0) + n;
    var q = DAILY.filter(function (z) { return z[0] === k; })[0]; if (!d.done[k] && q[3](d.c) >= q[2]) { d.done[k] = true; CAR.add(60, 'Daily challenge: ' + q[1], true); AUD.sfx('ok');
      if (!d.all && d.ids.every(function (z) { return d.done[z]; })) { d.all = true; CAR.add(120, 'All three daily challenges done!', true); CAR.unlock('daily'); } } CAR.dirty = true; },
  /* award XP; small amounts are bundled into one popup */
  add: function (n, why, big) { if (!CAR.p || !(n > 0)) return; var L0 = CAR.lvl(); CAR.p.xp += Math.round(n); CAR.dirty = true;
    if (big) CAR.pop('+' + Math.round(n) + ' XP', why, true); else { CAR.pend += n; CAR.pendWhy = why; }
    var L1 = CAR.lvl(); if (L1 > L0) CAR.levelUp(L0, L1); HUD.dirty = true; },
  levelUp: function (L0, L1) { var r0 = rankOf(L0), r1 = rankOf(L1); AUD.sfx('done'); CAR.pop('LEVEL ' + L1, r1 !== r0 ? 'Promoted: ' + r1 + '!' : rankOf(L1), true, true);
    speak(r1 !== r0 ? 'Promotion. You are now a ' + r1 + '.' : 'Level ' + L1 + '.'); S.addLog('Reached level ' + L1 + ' (' + r1 + ')');
    try { API.xp(10 + 3 * L1, 'Critical Point: reached level ' + L1); } catch (e) {} if (L1 >= 10) CAR.unlock('lv10'); if (L1 >= 20) CAR.unlock('lv20'); CAR.save(); },
  unlock: function (id) { var p = CAR.p; if (!p || p.ach[id]) return; var a = ACH.filter(function (q) { return q[0] === id; })[0]; if (!a) return; p.ach[id] = Date.now(); CAR.dirty = true; S.addLog('Achievement: ' + a[2]);
    CAR.pop(a[1] + ' ' + a[2], 'Achievement unlocked · +' + a[4] + ' XP', true, false, true); CAR.add(a[4], a[2]); CAR.save(); },
  pop: function (big, small, keep, lvl, ach) { var E = HUD.el.xpf; if (!E) return; var d = h('div', 'cpnxpp' + (lvl ? ' lvl' : '') + (ach ? ' ach' : ''), '<b>' + esc(big) + '</b>' + (small ? '<span>' + esc(small) + '</span>' : ''), E);
    while (E.children.length > 4) E.removeChild(E.firstChild); setTimeout(function () { d.style.opacity = '0'; d.style.transform = 'translateY(-8px)'; setTimeout(function () { d.remove(); }, 500); }, lvl || ach ? 5200 : 2600); },
  event: function (k, a) { var st = CAR.p && CAR.p.st; if (!st) return;
    if (k === 'pre') CAR.add(3, 'Pre-startup check');
    if (k === 'step') CAR.add(a === 'asc' ? 20 : a === 'shut' ? 10 : 15, a === 'asc' ? 'Power ascension step' : a === 'shut' ? 'Shutdown step' : 'Startup step', true);
    if (k === 'start') { st.starts++; CAR.add(120 + a, 'Reactor startup (score ' + a + ')', true); CAR.unlock('crit'); if (a >= 85) CAR.unlock('star3'); CAR.dayAdd('start', 1); }
    if (k === 'shut') { st.shuts++; CAR.add(70, 'Reactor shutdown', true); CAR.unlock('shut'); CAR.dayAdd('shut', 1); }
    if (k === 'asc') { st.ascs++; CAR.add(180, 'Power ascension to 50%', true); CAR.unlock('asc'); CAR.dayAdd('asc', 1); }
    if (k === 'trip') { st.trips++; st.curOn = 0; }
    if (k === 'crit') CAR.unlock('crit');
    CAR.dirty = true; },
  /* rate how a fault was handled, 15 plant-minutes after it went in (or when cleared after 5) */
  rateFault: function (id, info) { var p = S.p, x = p.x, safe = x.pz.P > 90 && x.sg.every(function (s) { return s.L > 5; }) && D.sub > 3 && p.Tavg < 315, kept = !p.tripped && !info.trip0, xp, verdict;
    if (kept) { xp = 140; verdict = 'Kept the unit on line'; } else if (safe) { xp = 70; verdict = 'Safe shutdown'; } else { xp = 15; verdict = 'Plant not in a safe state'; }
    if (id === 'porv' && x.si.on) { if (xp > 70) xp = 70; }
    if (info.quiet) xp = Math.round(xp * 1.5); CAR.add(xp, 'Fault handled: ' + verdict, true);
    var q = FAULT.list.filter(function (z) { return z.id === id; })[0]; toast('🛠 ' + (q ? q.t : 'Fault') + ': ' + verdict + ' (+' + xp + ' XP)', kept || safe ? 'ok' : 'warn');
    if (kept || safe) { CAR.p.st.faults++; CAR.p.fseen[id] = 1; CAR.unlock('fault1'); if (kept) CAR.unlock('online'); if (id === 'porv' && !x.si.on && kept) CAR.unlock('tmi'); if (id === 'grid') CAR.unlock('loop'); if (info.quiet) { CAR.unlock('secret'); CAR.dayAdd('secret', 1); } CAR.dayAdd('fault', 1);
      if (FAULT.list.every(function (z) { return CAR.p.fseen[z.id]; })) CAR.unlock('allf'); } CAR.save(); },
  tick: function (sim, real) { var p = S.p, x = p.x, st, tb; if (!CAR.p || !x) return; st = CAR.p.st; tb = x.tb; CAR.dayCheck();
    st.play += real; if (st.play >= 3600) CAR.unlock('hour1'); if (st.play >= 18000) CAR.unlock('hour5'); if (st.play >= 72000) CAR.unlock('hour20');
    /* generation: 1 XP per 8 MWh */
    if (tb.gen && tb.mw > 0) { var mwh = tb.mw * sim / 3600; st.mwh += mwh; CAR.genAcc += mwh; CAR.dayAdd('gen', mwh); if (CAR.genAcc >= 8) { var n = Math.floor(CAR.genAcc / 8); CAR.genAcc -= n * 8; CAR.add(n, 'Electricity to the grid'); }
      if (st.mwh >= 1000) CAR.unlock('gwh1'); if (st.mwh >= 10000) CAR.unlock('gwh10'); if (st.mwh >= 100000) CAR.unlock('gwh100'); if (tb.mw >= 1100) { CAR.unlock('full'); CAR.dayAdd('full', 1); } }
    if (tb.gen && !CAR.wasGen) CAR.unlock('sync'); CAR.wasGen = tb.gen;
    /* time on line without a trip, and steady operation bonus */
    if (tb.gen && !p.tripped) { st.onl += sim; st.curOn += sim; st.best = Math.max(st.best, st.curOn); CAR.dayAdd('online', sim); if (st.curOn >= 28800) CAR.unlock('online8'); }
    var steady = tb.gen && !p.tripped && tb.mw > 170 && Math.abs(p.Tavg - trefC(x)) < 1.5 && Math.abs(x.pz.P - 155) < 3 && x.sg.every(function (s) { return Math.abs(s.L - 50) < 8; });
    if (steady) { CAR.stT += sim; CAR.dayAdd('steady', sim); if (CAR.stT >= 600) { CAR.stT -= 600; CAR.add(25, 'Ten minutes of steady operation', true); } } else CAR.stT = Math.max(0, CAR.stT - sim * 2);
    if (x.xe.X >= 2500) CAR.unlock('xenon');
    if (CAR.lastB != null && x.cv.run && (x.cv.mode === 'DIL' || x.cv.mode === 'ALTDIL') && p.boron < CAR.lastB) { var db = CAR.lastB - p.boron; st.dil += db; CAR.dayAdd('dil', db); if (st.dil >= 200) CAR.unlock('dilute'); } CAR.lastB = p.boron;
    /* faults */
    var fT = x.fT || {}; Object.keys(fT).forEach(function (id) { var info = fT[id]; if (info.done) return; if (p.t - info.t >= 900 || p.t < info.t) { info.done = true; CAR.rateFault(id, info); } });
    /* bundled popups and saving */
    CAR.pendT += real; if (CAR.pend >= 1 && CAR.pendT > 2.5) { CAR.pop('+' + Math.floor(CAR.pend) + ' XP', CAR.pendWhy); CAR.pend -= Math.floor(CAR.pend); CAR.pendT = 0; }
    CAR.saveT += real; if (CAR.dirty && CAR.saveT > 8) { CAR.saveT = 0; CAR.save(); } }
};
function careerMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); CAR.dayCheck(); var p = CAR.p, L = CAR.lvl(), a = lvlXp(L), b = lvlXp(L + 1), nr = nextRank(L), st = p.st, d = p.day, nAch = ACH.filter(function (q) { return p.ach[q[0]]; }).length;
  var fmtH = function (s) { return s >= 3600 ? (s / 3600).toFixed(1) + ' h' : Math.round(s / 60) + ' min'; };
  menu('<h1>🏅 Career</h1><div class="cpncar"><div class="lv"><b>' + L + '</b><span>LEVEL</span></div><div class="rk"><h2 style="margin:0">' + esc(rankOf(L)) + '</h2><div class="xpbar"><i style="width:' + Math.round((p.xp - a) / (b - a) * 100) + '%"></i></div><small>' + (p.xp - a).toLocaleString('en-GB') + ' / ' + (b - a).toLocaleString('en-GB') + ' XP to level ' + (L + 1) + ' · ' + p.xp.toLocaleString('en-GB') + ' XP in total' + (nr ? ' · <b>' + esc(nr[1]) + '</b> at level ' + nr[0] : '') + '</small></div></div>' +
    '<h2>Today’s challenges</h2><div class="cpndaily">' + d.ids.map(function (k) { var q = DAILY.filter(function (z) { return z[0] === k; })[0], v = Math.min(q[2], q[3](d.c)); return '<div class="' + (d.done[k] ? 'ok' : '') + '"><b>' + (d.done[k] ? '✔ ' : '') + esc(q[1]) + '</b><div class="xpbar"><i style="width:' + Math.round(v / q[2] * 100) + '%"></i></div><small>' + (q[2] > 1 ? (q[0] === 'online' || q[0] === 'steady' ? fmtH(v) + ' / ' + fmtH(q[2]) : Math.floor(v).toLocaleString('en-GB') + ' / ' + q[2].toLocaleString('en-GB')) : d.done[k] ? 'done' : 'not yet') + ' · +60 XP</small></div>'; }).join('') + '</div><p style="font-size:12px;color:#8ea6bc">All three: +120 XP bonus. New challenges every day.</p>' +
    '<h2>Stats</h2><div class="cpnstat">' + [['⚡', Math.round(st.mwh).toLocaleString('en-GB') + ' MWh', 'generated'], ['🕒', fmtH(st.onl), 'on the grid'], ['🏁', fmtH(st.best), 'longest run without a trip'], ['⏱', fmtH(st.play), 'in the control room'], ['☢️', st.starts, 'startups'], ['📈', st.ascs, 'power ascensions'], ['⏬', st.shuts, 'shutdowns'], ['🛠', st.faults, 'faults handled'], ['⚠', st.trips, 'reactor trips'], ['💧', Math.round(st.dil) + ' ppm', 'boron diluted']].map(function (q) { return '<div><span>' + q[0] + '</span><b>' + q[1] + '</b><small>' + q[2] + '</small></div>'; }).join('') + '</div>' +
    '<h2>Achievements · ' + nAch + ' / ' + ACH.length + '</h2><div class="cpnach">' + ACH.map(function (q) { var got = !!p.ach[q[0]]; return '<div class="' + (got ? 'ok' : '') + '"><span>' + (got ? q[1] : '🔒') + '</span><b>' + esc(q[2]) + '</b><small>' + esc(q[3]) + ' · +' + q[4] + ' XP</small></div>'; }).join('') + '</div>' +
    '<h2>How to earn XP</h2><p style="font-size:13px;color:#c9d6e2">Checklist steps (3–20 XP each) · whole procedures (70–220) · every 8 MWh sent to the grid (1 XP, so a full-power hour of plant time is about 140) · every 10 plant-minutes of steady operation (25) · faults: kept on line 140, safe shutdown 70, and ×1.5 for a secret fault · achievements and daily challenges. Use ×5 and ×20 time to play through long shifts.</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button></div>', function (a2) { if (a2 === 'x') closeMenu(); });
}

/* ================================================================ operations: Tech Specs, the crew, core monitoring ================================================================
   Technical Specifications (the plant's licence rules): every LCO is checked live. When one isn't met you enter its Condition and
   a Completion Time starts counting down in plant time. Miss it and the next Required Action starts; miss the last and it's a
   Tech Spec violation. The Control Room Supervisor gives orders that you repeat back (three-way communication), then report
   when done. The core monitoring computer shows the axial power shape, AFD, thermal margins and the calorimetric heat balance. */
function pad2(v) { return String(v).padStart(2, '0'); }
function hms(sec) { sec = Math.max(0, Math.round(sec)); var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60; return h ? h + ':' + pad2(m) + ':' + pad2(s) : m + ':' + pad2(s); }
function crx() { return S.p.x.core || (S.p.x.core = core0()); }
function calx() { return S.p.x.cal || (S.p.x.cal = cal0()); }
/* thermal power from the plant computer's continuous calorimetric, % of rated (3411 MWt) */
function rtp() { var cr = S.p.x.core; return cr ? Math.max(0, cr.best / FULL * 100) : D.pr; }
function afdTarget(P) { return -6 * clamp(P, 0, 100) / 100; }
function afdEnv(P) { return [-12 - 0.3 * (100 - P), 8 + 0.26 * (100 - P)]; }
function fqLim(P) { return P > 50 ? 2.5 / (P / 100) : 5.0; }
function sdmPcm(p) { var r = rhoParts(p), allIn = 0; BANKS.forEach(function (b) { allIn -= WORTH[b]; }); return -(r.base + allIn + r.boron + r.dop + r.mod + r.xe) - 1000; }
function prDev() { var a = NI.pr.slice(); return Math.max.apply(null, a) - Math.min.apply(null, a); }
function calDue(p) { var c = calx(), cr = crx(); if (c.lastT > -1e11) return c.lastT + 86400; return cr.p15T != null ? cr.p15T + 43200 : Infinity; }
var MODEN = ['', 'Power operation', 'Startup', 'Hot standby', 'Hot shutdown', 'Cold shutdown'];
var H = 3600;
var TS = {
  L: [
    { id: '3.1.1', t: 'Shutdown margin', lim: 'At least 1300 pcm in MODE 3, assuming the most reactive rod sticks out', ap: 'MODE 3', cond: function (p) { return D.mode === 3 && sdmPcm(p) < 1300; }, val: function (p) { return Math.round(sdmPcm(p)) + ' pcm'; },
      act: [{ t: 'Start boration to restore shutdown margin', ct: 15 * 60, ok: function (p) { return p.x.cv.run && p.x.cv.mode === 'BOR'; } }] },
    { id: '3.1.3', t: 'Moderator temperature coefficient', lim: 'MTC no more positive than 0 pcm/°C', ap: 'MODES 1 and 2', cond: function (p) { return D.mode <= 2 && mtc(p) > 0; }, val: function (p) { return mtc(p).toFixed(1) + ' pcm/°C'; },
      act: [{ t: 'Set control rod withdrawal limits so the MTC stays negative', ct: 24 * H }, { t: 'Be in MODE 2 with keff below 1.0', ct: 6 * H, ok: function () { return D.keff < 1; } }] },
    { id: '3.1.5', t: 'Shutdown bank insertion limits', lim: 'Every shutdown bank fully withdrawn', ap: 'MODE 1, and MODE 2 with keff ≥ 1', cond: function (p) { return (D.mode === 1 || (D.mode === 2 && D.keff >= 1)) && SDB.some(function (b) { return p.rods[b] < TOP - 3; }); }, val: function (p) { return SDB.map(function (b) { return Math.round(p.rods[b]); }).join(' / ') + ' steps'; },
      act: [{ t: 'Withdraw the shutdown banks fully', ct: 2 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.1.6', t: 'Control bank insertion limits', lim: 'Control banks above the rod insertion limit line for this power', ap: 'MODE 1, and MODE 2 with keff ≥ 1', cond: function (p) { return (D.mode === 1 || (D.mode === 2 && D.keff >= 1)) && p.pc < rilPc(rtp()) - 0.5; }, val: function (p) { return pcName(p.pc).replace('bank ', '') + ' · limit ' + pcName(rilPc(rtp())).replace('bank ', ''); },
      act: [{ t: 'Borate to bring the control banks back above the insertion limit', ct: 2 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.2.1', t: 'Heat flux hot channel factor FQ(Z)', lim: 'FQ ≤ 2.50 ÷ fraction of power (above 50%)', ap: 'MODE 1', cond: function (p) { return D.mode === 1 && rtp() > 5 && crx().fq > fqLim(rtp()); }, val: function () { return crx().fq.toFixed(2) + ' (limit ' + fqLim(rtp()).toFixed(2) + ')'; },
      act: [{ t: 'Reduce power at least 1% for every 1% FQ is over the limit', ct: 15 * 60 }, { t: 'Be in MODE 2', ct: 6 * H, ok: function () { return D.mode >= 2; } }] },
    { id: '3.2.2', t: 'Nuclear enthalpy rise hot channel factor FΔH', lim: 'FΔH ≤ 1.65 × [1 + 0.3 (1 − fraction of power)]', ap: 'MODE 1', cond: function () { var P = rtp() / 100; return D.mode === 1 && crx().fdh > 1.65 * (1 + 0.3 * (1 - P)); }, val: function () { return crx().fdh.toFixed(3); },
      act: [{ t: 'Reduce power below 50%', ct: 4 * H, ok: function () { return rtp() < 50; } }, { t: 'Be in MODE 2', ct: 6 * H, ok: function () { return D.mode >= 2; } }] },
    { id: '3.2.4', t: 'Quadrant power tilt ratio (QPTR)', lim: 'QPTR ≤ 1.02', ap: 'MODE 1 above 50% power', cond: function () { return D.mode === 1 && rtp() > 50 && crx().qptr > 1.02; }, val: function () { return (crx().qptr || 1).toFixed(3) + ' · quadrants ' + (crx().qt || []).map(function (v) { return v.toFixed(3); }).join(' / '); },
      act: [{ t: 'Reduce power 3% for every 1% QPTR is above 1.00', ct: 2 * H }, { t: 'Reduce power below 50%', ct: 6 * H, ok: function () { return rtp() < 50; } }] },
    { id: '3.1.4', t: 'Rod group alignment', lim: 'Every rod within 12 steps of its group (no dropped or misaligned rods)', ap: 'MODES 1 and 2', cond: function (p) { return D.mode <= 2 && !!(p.x.f && p.x.f.drop); }, val: function (p) { return p.x.f && p.x.f.drop ? 'rod H-08 (bank D) on the bottom' : 'aligned'; },
      act: [{ t: 'Recover the rod, or reduce power below 75%', ct: 60 * 60, ok: function () { return rtp() < 75; } }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.2.3', t: 'Axial flux difference (AFD)', lim: 'AFD inside the acceptable operation envelope (the "tent" on the core monitor)', ap: 'MODE 1 above 50% power', cond: function () { var P = rtp(), e = afdEnv(P), a = crx().afdI; return D.mode === 1 && P > 50 && (a < e[0] || a > e[1]); }, val: function () { var e = afdEnv(rtp()); return crx().afdI.toFixed(1) + ' % (envelope ' + e[0].toFixed(0) + ' to +' + e[1].toFixed(0) + ')'; },
      act: [{ t: 'Reduce power below 50%', ct: 30 * 60, ok: function () { return rtp() < 50; } }] },
    { id: '3.3.1', t: 'Power range calibration (SR 3.3.1.2)', lim: 'Every power range channel within 2% of the calorimetric heat balance', ap: 'MODE 1 above 15% power', cond: function () { var c = rtp(); return D.mode === 1 && c > 15 && NI.pr.some(function (v) { return v < c - 2; }); }, val: function () { var c = rtp(); return NI.pr.map(function (v) { return (v - c >= 0 ? '+' : '') + (v - c).toFixed(1); }).join(' / ') + ' %'; },
      act: [{ t: 'Adjust the power range gains to agree with the calorimetric', ct: 12 * H }, { t: 'Reduce power below 75%', ct: 6 * H, ok: function () { return rtp() < 75; } }] },
    { id: 'SR 3.3.1.2', t: 'Daily calorimetric (surveillance)', lim: 'Calorimetric heat balance every 24 hours above 15% power (first one within 12 hours of passing 15%)', ap: 'MODE 1 above 15% power', cond: function (p) { return D.mode === 1 && rtp() > 15 && p.t > calDue(p); }, val: function (p) { var c = calx(); return c.lastT > -1e11 ? 'last done ' + hms(p.t - c.lastT) + ' ago' : 'not done yet'; },
      act: [{ t: 'Perform the calorimetric (SR 3.0.3 allows 24 hours before the LCO is missed)', ct: 24 * H }] },
    { id: '3.3.1 B', t: 'Instrument channel inoperable', lim: 'Every protection and control channel working', ap: 'MODES 1 to 3', cond: function (p) { return D.mode <= 3 && !!p.x.inF && !p.x.inF.sel; }, val: function () { return 'a channel disagrees with the others'; },
      act: [{ t: 'Bypass or deselect the failed channel (📘 → Bypass failed channel)', ct: 6 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.7.10', t: 'Control room emergency ventilation (CREVS)', lim: 'CREVS running after SI or high control room radiation', ap: 'MODES 1 to 4', cond: function (p) { var x = p.x; return D.mode <= 4 && (x.si.on || (x.crRad || 0) > 1) && !x.crev; }, val: function (p) { return (p.x.crev ? 'running' : 'stopped') + ' · ' + (p.x.crRad || 0.08).toFixed(2) + ' µSv/h · crew dose ' + ((p.x.crDose || 0)).toFixed(3) + ' mSv'; },
      act: [{ t: 'Start CREVS', ct: 60 * 60 }] },
    { id: '3.4.1', t: 'RCS DNB parameters', lim: 'Pressuriser pressure ≥ 152 bar, Tavg ≤ Tref + 2 °C, RCS flow ≥ 97%', ap: 'MODE 1', cond: function (p) { var x = p.x; return D.mode === 1 && (x.pz.P < 152 || p.Tavg > trefC(x) + 2 || crx().W < 0.97); }, val: function (p) { return p.x.pz.P.toFixed(1) + ' bar · Tavg ' + p.Tavg.toFixed(1) + ' (Tref ' + trefC(p.x).toFixed(1) + ') · flow ' + Math.round(crx().W * 100) + '%'; },
      act: [{ t: 'Restore the DNB parameters to within limits', ct: 2 * H }, { t: 'Be in MODE 2', ct: 6 * H, ok: function () { return D.mode >= 2; } }] },
    { id: '3.4.2', t: 'RCS minimum temperature for criticality', lim: 'Every loop Tavg ≥ 286 °C while critical', ap: 'MODES 1 and 2 with keff ≥ 1', cond: function (p) { return D.mode <= 2 && D.keff >= 1 && p.Tavg < 286; }, val: function (p) { return p.Tavg.toFixed(1) + ' °C'; },
      act: [{ t: 'Be in MODE 2 with keff below 1.0 (insert rods)', ct: 30 * 60, ok: function () { return D.keff < 1; } }] },
    { id: '3.4.3', t: 'RCS pressure/temperature limits', lim: 'Cooldown no faster than 55 °C per hour', ap: 'MODES 1 to 5', cond: function (p) { return cdRate(p) > 55; }, val: function (p) { return cdRate(p).toFixed(0) + ' °C/h'; }, act: [{ t: 'Slow the cooldown to within limits', ct: 30 * 60 }] },
    { id: '3.4.4', t: 'RCS loops in MODES 1 and 2', lim: 'All four loops with their reactor coolant pump running', ap: 'MODES 1 and 2', cond: function (p) { return D.mode <= 2 && p.x.rcpOn.filter(Boolean).length < 4; }, val: function (p) { return p.x.rcpOn.filter(Boolean).length + ' of 4 RCPs'; },
      act: [{ t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.4.9', t: 'Pressuriser level', lim: 'Pressuriser level ≤ 92%', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && p.x.pz.L > 92; }, val: function (p) { return p.x.pz.L.toFixed(1) + ' %'; },
      act: [{ t: 'Be in MODE 3 with the reactor trip breakers open', ct: 6 * H, ok: function (p) { return D.mode === 3 && !p.rtb[0] && !p.rtb[1]; } }] },
    { id: '3.4.9 B', t: 'Pressuriser heaters', lim: 'Two groups of heaters (≥ 150 kW each) with power', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && !busOn(p.x, 'EA'); }, val: function (p) { return busOn(p.x, 'EA') ? 'available' : 'no power on safety bus A'; },
      act: [{ t: 'Restore the heater group', ct: 72 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.4.11', t: 'Pressuriser PORVs', lim: 'Each PORV shut (or its block valve shut)', ap: 'MODES 1, 2 and 3', cond: function (p) { var z = p.x.pz; return D.mode <= 3 && [0, 1].some(function (i) { return z.porv[i] && z.blk[i] && z.porvMode[i] !== 'OPEN' && z.P < 160; }); }, val: function (p) { var z = p.x.pz; return [0, 1].map(function (i) { return 'PORV ' + (i ? 'B' : 'A') + ' ' + (z.porv[i] ? 'OPEN' : 'shut') + ', block ' + (z.blk[i] ? 'open' : 'SHUT'); }).join(' · '); },
      act: [{ t: 'Close the PORV block valve', ct: 60 * 60 }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.4.13', t: 'RCS operational leakage', lim: 'No pressure boundary leakage; primary-to-secondary leakage ≤ 150 litres a day per SG', ap: 'MODES 1 to 4', cond: function (p) { var f = p.x.f || {}; return D.mode <= 4 && (crx().brk > 0.2 || !!f.sgtl); }, val: function (p) { var f = p.x.f || {}; return crx().brk > 0.2 ? 'break ' + crx().brk.toFixed(0) + ' m³/h' : f.sgtl ? 'SG 1 tube leak' : 'none'; },
      act: [{ t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }, { t: 'Be in MODE 5 (cold shutdown, GOP-305)', ct: 36 * H, ok: function () { return D.mode === 5; } }] },
    { id: '3.4.16', t: 'RCS specific activity', lim: 'Dose equivalent iodine-131 within limits (no failed fuel)', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && chem(p).i131 > 1; }, val: function (p) { return 'DE I-131 ' + chem(p).i131.toFixed(3) + ' µCi/g (limit 1.0)'; },
      act: [{ t: 'Be in MODE 3 with Tavg below 260 °C', ct: 6 * H }] },
    { id: '3.5.1', t: 'Accumulators', lim: 'Four accumulators with their isolation valves open (RCS above 69 bar)', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && p.x.pz.P > 69 && p.x.si.acc.some(function (a) { return !a; }); }, val: function (p) { return p.x.si.acc.filter(Boolean).length + ' of 4 valves open'; },
      act: [{ t: 'Open the isolation valve', ct: 60 * 60 }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.5.2', t: 'ECCS, MODES 1 to 3', lim: 'Two trains of emergency core cooling (charging, SI and RHR pumps) with power', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && (!busOn(p.x, 'EA') || !busOn(p.x, 'EB')); }, val: function (p) { return (busOn(p.x, 'EA') ? 'A ok' : 'A dead') + ' · ' + (busOn(p.x, 'EB') ? 'B ok' : 'B dead'); },
      act: [{ t: 'Restore the train', ct: 72 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.7.5', t: 'Auxiliary feedwater', lim: 'Three AFW pumps able to run (two motor-driven, one turbine-driven)', ap: 'MODES 1, 2 and 3', cond: function (p) { return D.mode <= 3 && (!busOn(p.x, 'EA') || !busOn(p.x, 'EB') || p.Ps < 8); }, val: function (p) { return [busOn(p.x, 'EA'), busOn(p.x, 'EB'), p.Ps >= 8].filter(Boolean).length + ' of 3'; },
      act: [{ t: 'Restore the AFW train', ct: 72 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.8.1', t: 'AC power sources', lim: 'Two offsite circuits and two diesel generators in AUTO', ap: 'MODES 1 to 4', cond: function (p) { var e = p.x.el; return D.mode <= 4 && (!e.grid || !e.stn || e.edg.some(function (g) { return g.mode !== 'AUTO'; })); }, val: function (p) { var e = p.x.el; return (e.grid && e.stn ? 'offsite ok' : 'offsite LOST') + ' · DG ' + e.edg.map(function (g) { return g.mode; }).join('/'); },
      act: [{ t: 'Restore offsite power / put the diesels back in AUTO', ct: 24 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.6.4', t: 'Containment pressure', lim: 'Containment pressure ≤ 0.10 bar g', ap: 'MODES 1 to 4', cond: function (p) { return D.mode <= 4 && p.x.ct.P > 0.1; }, val: function (p) { return p.x.ct.P.toFixed(3) + ' bar g'; },
      act: [{ t: 'Restore containment pressure', ct: 60 * 60 }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: '3.6.5', t: 'Containment air temperature', lim: 'Average containment air temperature ≤ 49 °C', ap: 'MODES 1 to 4', cond: function (p) { return D.mode <= 4 && p.x.ct.T > 49; }, val: function (p) { return p.x.ct.T.toFixed(1) + ' °C'; },
      act: [{ t: 'Restore containment air temperature', ct: 8 * H }, { t: 'Be in MODE 3', ct: 6 * H, ok: function () { return D.mode >= 3; } }] },
    { id: 'Licence 2.C(1)', t: 'Maximum power level', lim: 'Core thermal power ≤ 3411 MWt (100%) averaged over 8 hours, and never above 102%', ap: 'MODE 1', cond: function () { var cr = crx(), a = cr.avg8, m = 0; for (var i = 0; i < a.length; i++) m += a[i]; m = a.length ? m / a.length : 0; return D.mode === 1 && ((a.length >= 10 && m > FULL + 0.5) || cr.best > FULL * 1.02); }, val: function () { var cr = crx(), a = cr.avg8, m = 0; for (var i = 0; i < a.length; i++) m += a[i]; m = a.length ? m / a.length : cr.best; return Math.round(cr.best) + ' MWt now · ' + Math.round(m) + ' MWt 8-h average'; },
      act: [{ t: 'Reduce power to 100% or less', ct: 15 * 60, ok: function () { return crx().best <= FULL; } }] }
  ],
  st: function () { var x = S.p.x; return x.ts || (x.ts = { on: {}, viol: 0, ok: 0, log: [] }); },
  T: 0,
  tick: function (sim) { if (!S || !S.p || !S.p.x) return; TS.T += sim; if (TS.T < 1) return; TS.T = 0; var p = S.p, st = TS.st();
    var cr = crx(); if (cr.p15T == null && rtp() > 15) cr.p15T = p.t;
    TS.L.forEach(function (l) { var c = false; try { c = !!l.cond(p); } catch (e) {} var a = st.on[l.id];
      if (c && !a) { a = st.on[l.id] = { t0: p.t, k: 0, due: p.t + l.act[0].ct }; TS.event('enter', l, a); }
      else if (!c && a) { delete st.on[l.id]; TS.event('exit', l, a); }
      else if (a) { var A = l.act[a.k]; a.okNow = !!(A.ok && A.ok(p)); if (a.okNow) a.met = true;
        if (!a.okNow && p.t > a.due) { if (a.k < l.act.length - 1 && !a.met) { a.k++; a.due = p.t + l.act[a.k].ct; TS.event('next', l, a); } else if (a.met && a.k < l.act.length - 1) { a.k++; a.met = false; a.due = p.t + l.act[a.k].ct; } else if (!a.viol) { a.viol = true; st.viol++; TS.event('viol', l, a); } } } });
  },
  event: function (k, l, a) { var st = TS.st(), msg;
    if (k === 'enter') { msg = 'Entered Tech Spec ' + l.id + ' (' + l.t + '): ' + l.act[0].t + ' within ' + hms(l.act[0].ct); S.addLog(msg); S.sfx('deny'); toast('📕 LCO ' + l.id + ' not met: ' + l.t, 'warn'); CREW.say('I’m entering Tech Spec ' + l.id + ', ' + l.t + '. Required action: ' + l.act[0].t.toLowerCase() + ', within ' + hmsWords(l.act[0].ct) + '.', 'lco'); }
    if (k === 'exit') { var mins = (S.p.t - a.t0) / 60; msg = 'Exited Tech Spec ' + l.id + ' (' + l.t + ') after ' + hms(S.p.t - a.t0); S.addLog(msg); if (!a.viol && mins > 0.3 && S.p.t - (st.lastOkT || -1e9) > 120) { st.ok++; st.lastOkT = S.p.t; CAR.add(25, 'Tech Spec ' + l.id + ' restored in time'); } if (!a.viol) CREW.say('Exiting Tech Spec ' + l.id + '. Good.', 'lco'); }
    if (k === 'next') { msg = 'Tech Spec ' + l.id + ': completion time missed. Next required action: ' + l.act[a.k].t + ' within ' + hms(l.act[a.k].ct); S.addLog(msg); toast('📕 ' + msg, 'bad'); CREW.say('We’ve missed the completion time on ' + l.id + '. Now we must ' + l.act[a.k].t.toLowerCase() + ' within ' + hmsWords(l.act[a.k].ct) + '.', 'lco'); }
    if (k === 'viol') { msg = 'TECH SPEC VIOLATION: ' + l.id + ' (' + l.t + '). This would be reported to the Office for Nuclear Regulation.'; S.addLog(msg); toast('⛔ ' + msg, 'bad'); AUD.sfx('deny'); CREW.say('That’s a Tech Spec violation on ' + l.id + '. I’ll have to report it to the ONR.', 'lco'); }
    HUD.dirty = true; },
  active: function () { var st = TS.st(), out = []; TS.L.forEach(function (l) { var a = st.on[l.id]; if (a) out.push({ l: l, a: a }); }); return out; }
};
function hmsWords(sec) { if (sec >= 3600) { var h = sec / 3600; return h === 1 ? 'one hour' : (h % 1 ? h.toFixed(1) : h) + ' hours'; } return Math.round(sec / 60) + ' minutes'; }
function tsMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var p = S.p, st = TS.st();
  var rows = TS.L.map(function (l) { var a = st.on[l.id], c = false; try { c = !!l.cond(p); } catch (e) {} var v = ''; try { v = l.val(p); } catch (e) {}
    var stat = a ? (a.viol ? '<i class="tsv">VIOLATED</i>' : a.okNow ? '<i class="tsk">ACTION MET</i>' : '<i class="tsn">NOT MET · ' + hms(a.due - p.t) + '</i>') : '<i class="tsm">MET</i>';
    return '<details class="tsrow' + (a ? ' on' : '') + '"' + (a ? ' open' : '') + '><summary><b>' + esc(l.id) + '</b><span>' + esc(l.t) + '</span>' + stat + '</summary><p><b>LCO:</b> ' + esc(l.lim) + '. <b>Applies:</b> ' + esc(l.ap) + '.</p><p><b>Now:</b> ' + esc(v) + '</p><ol>' + l.act.map(function (q, k) { return '<li' + (a && a.k === k ? ' class="cur"' : '') + '>' + esc(q.t) + ' <em>within ' + hms(q.ct) + '</em></li>'; }).join('') + '</ol></details>'; }).join('');
  menu('<h1>📕 Technical Specifications</h1><p class="cpnsub">MODE ' + D.mode + ' · ' + MODEN[D.mode] + ' · thermal power ' + rtp().toFixed(1) + '% (' + Math.round(crx().best) + ' MWt) · ' + TS.active().length + ' LCO' + (TS.active().length === 1 ? '' : 's') + ' entered · ' + st.viol + ' violation' + (st.viol === 1 ? '' : 's') + '</p>' +
    '<p>These are the rules in the station’s licence. Each <b>LCO</b> (Limiting Condition for Operation) must be met in the MODEs it applies to. If one isn’t, you’re “in the LCO”: the Required Action has to be done within its <b>Completion Time</b>, counted in plant time. Restore it in time and you exit with no harm done; miss the last time and it’s a violation the regulator hears about.</p>' +
    '<div class="tslist">' + rows + '</div><div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button><button class="cpnb2" data-a="core">📈 Core monitor</button></div>', function (a) { if (a === 'x') closeMenu(); if (a === 'core') coreMenu('core'); });
}

/* ---------------------------------------------------------------- the crew ---------------------------------------------------------------- */
var CRSN = 'Sarah Hughes';
var CREW = { q: null, next: 150, msg: null, msgT: 0, queue: [], e0: false,
  say: function (t, kind) { if (!S.cfg.crew) return; CREW.msg = { t: t, k: kind || 'info' }; CREW.msgT = 12; speak(t); HUD.dirty = true; CREW.draw(); },
  orders: function () { var p = S.p, x = p.x, tb = x.tb, out = [], P = rtp(), cr = crx(), c = calx();
    if (tb.gen && tb.mw > 300) { var cur = Math.round(tb.load / 50) * 50, dir = Math.random() < 0.5 ? -1 : 1, tgt = clamp(cur + dir * (50 + 50 * Math.floor(Math.random() * 3)), 400, 1150); if (tgt === cur) tgt = cur - 100; var rate = [10, 30][Math.floor(Math.random() * 2)], up = tgt > tb.mw, ver = up ? 'Raise' : 'Reduce', rv = +String(tgt).split('').reverse().join(''), wrongT = rv >= 300 && rv !== tgt && rv <= 1250 ? rv : tgt + (tgt > 1000 ? -100 : 100);
      out.push({ w: 3, say: ver + ' generator load to ' + tgt + ' megawatts at ' + rate + ' megawatts per minute. National Grid has asked for it.', rb: [ver + ' generator load to ' + tgt + ' MW at ' + rate + ' MW per minute.', ver + ' generator load to ' + (wrongT === tgt ? tgt + 50 : wrongT) + ' MW at ' + rate + ' MW per minute.', (up ? 'Reduce' : 'Raise') + ' generator load to ' + tgt + ' MW at ' + rate + ' MW per minute.'],
        task: 'Turbine board (9): LOAD RATE ' + rate + ', LOAD SET to ' + tgt + ' MW. Keep Tavg on Tref.', chk: function () { return Math.abs(tb.load - tgt) <= 5 && Math.abs(tb.mw - tgt) <= 8 && tb.lrate === rate; }, now: function () { return 'Load ' + Math.round(tb.mw) + ' MW, set ' + Math.round(tb.load) + ', rate ' + tb.lrate; }, rep: 'Generator load is steady at ' + tgt + ' megawatts.', mins: Math.abs(tgt - tb.mw) / rate + 20, xp: 40 }); }
    if (P > 15 && (c.lastT < -1e11 || p.t - c.lastT > 6 * H)) out.push({ w: 4, say: 'Perform a secondary calorimetric, then adjust any power range channel that’s more than 2 percent out.', rb: ['Perform a secondary calorimetric and adjust any power range channel more than 2% out.', 'Perform a secondary calorimetric and adjust any power range channel more than 20% out.', 'Perform a primary calorimetric and adjust the source range channels.'],
      task: 'Open 📈 Core monitor → Heat balance. Check the plant is steady, record the calorimetric, and match any channel more than 2% off.', t0: p.t, chk: function () { var o = this; return c.lastT >= o.t0 && NI.pr.every(function (v) { return Math.abs(v - rtp()) <= 2; }); }, now: function () { return 'Channels ' + NI.pr.map(function (v) { return v.toFixed(1); }).join(' / ') + ' · calorimetric ' + rtp().toFixed(1) + '%'; }, rep: 'Calorimetric complete. All four power range channels are within 2 percent.', mins: 60, xp: 60 });
    if (P > 50 && Math.abs(cr.afdI - afdTarget(P)) > 3.5) { var tg = afdTarget(P); out.push({ w: 5, say: 'AFD is drifting. Bring it back to the target band: minus ' + Math.abs(tg).toFixed(0) + ' percent, plus or minus 5.', rb: ['Bring AFD back to the target band, minus ' + Math.abs(tg).toFixed(0) + '% plus or minus 5%.', 'Bring AFD back to the target band, plus ' + Math.abs(tg).toFixed(0) + '% plus or minus 5%.', 'Bring Tavg back to the target band, minus ' + Math.abs(tg).toFixed(0) + ' degrees plus or minus 5.'],
      task: 'Move control bank D a few steps (rods in pushes AFD negative) and compensate Tavg with boron. Watch AFD on the core monitor.', chk: function () { return Math.abs(cr.afdI - afdTarget(rtp())) <= 3; }, now: function () { return 'AFD ' + cr.afdI.toFixed(1) + '% · target ' + afdTarget(rtp()).toFixed(1) + '%'; }, rep: 'AFD is back inside the target band.', mins: 60, xp: 50 }); }
    var ccpA = x.cv.ccp[0]; out.push({ w: 1, say: 'Swap the charging pumps for the monthly run: start charging pump ' + (ccpA ? 'B' : 'A') + ', then stop charging pump ' + (ccpA ? 'A' : 'B') + '.', rb: ['Start charging pump ' + (ccpA ? 'B' : 'A') + ', then stop charging pump ' + (ccpA ? 'A' : 'B') + '.', 'Stop charging pump ' + (ccpA ? 'A' : 'B') + ', then start charging pump ' + (ccpA ? 'B' : 'A') + '.', 'Start charging pump ' + (ccpA ? 'A' : 'B') + ', then stop charging pump ' + (ccpA ? 'B' : 'A') + '.'],
      task: 'CVCS board (3): start the standby charging pump FIRST, check flow, then stop the running one. Never stop first: that would lose seal injection.', chk: function () { return ccpA ? (!x.cv.ccp[0] && x.cv.ccp[1]) : (x.cv.ccp[0] && !x.cv.ccp[1]); }, now: function () { return 'CCP A ' + (x.cv.ccp[0] ? 'running' : 'stopped') + ' · CCP B ' + (x.cv.ccp[1] ? 'running' : 'stopped'); }, rep: 'Charging pumps swapped. Charging pump ' + (ccpA ? 'B' : 'A') + ' running, ' + (ccpA ? 'A' : 'B') + ' in standby.', mins: 15, xp: 30, order: true });
    if (tb.gen) { var mv = [50, 100, 150][Math.floor(Math.random() * 3)] * (Math.random() < 0.7 ? 1 : -1); out.push({ w: 1, say: 'National Grid wants ' + (mv > 0 ? 'plus ' : 'minus ') + Math.abs(mv) + ' megavars. Set reactive power to ' + (mv > 0 ? 'plus ' : 'minus ') + Math.abs(mv) + '.', rb: ['Set reactive power to ' + (mv > 0 ? '+' : '−') + Math.abs(mv) + ' MVAr.', 'Set reactive power to ' + (mv > 0 ? '−' : '+') + Math.abs(mv) + ' MVAr.', 'Set generator load to ' + Math.abs(mv) + ' MW.'],
      task: 'Generator board (10): use the AVR / MVAR setpoint to reach ' + mv + ' MVAr.', chk: function () { return Math.abs(tb.mvar - mv) <= 10; }, now: function () { return Math.round(tb.mvar) + ' MVAr'; }, rep: 'Reactive power is ' + (mv > 0 ? 'plus ' : 'minus ') + Math.abs(mv) + ' megavars.', mins: 10, xp: 25 }); }
    return out; },
  e0List: function () { var p = S.p, x = p.x; return [
    { say: 'Reactor trip. Going to E-0. Reactor operator: verify reactor trip.', rb: ['Verify reactor trip.', 'Verify turbine trip.', 'Reset the reactor trip.'], task: 'Check rod bottom lights and the trip breakers open, and power range falling.', chk: function () { return p.tripped && p.n < 0.05; }, now: function () { return 'Breakers ' + (p.rtb[0] || p.rtb[1] ? 'CLOSED' : 'open') + ' · power ' + (p.n * 100).toFixed(1) + '%'; }, rep: 'Reactor tripped. All rods on the bottom, neutron flux falling.', mins: 3, xp: 20 },
    { say: 'Verify turbine trip.', rb: ['Verify turbine trip.', 'Verify turbine latched.', 'Verify generator synchronised.'], task: 'Turbine board: stop valves shut, turbine tripped.', chk: function () { return !x.tb.latched; }, now: function () { return x.tb.latched ? 'turbine LATCHED' : 'turbine tripped'; }, rep: 'Turbine tripped. All stop valves shut.', mins: 3, xp: 20 },
    { say: 'Verify power to the safety buses.', rb: ['Verify power to the safety buses.', 'Verify power to the unit boards only.', 'Start the diesel generators manually.'], task: 'Electrical board (11): both safety buses alive, from offsite or the diesels.', chk: function () { return busOn(x, 'EA') && busOn(x, 'EB'); }, now: function () { return 'Bus A ' + (busOn(x, 'EA') ? 'live' : 'DEAD') + ' · Bus B ' + (busOn(x, 'EB') ? 'live' : 'DEAD'); }, rep: 'Both safety buses are energised.', mins: 5, xp: 20 },
    { say: 'Check if safety injection is actuated or required.', rb: ['Check if safety injection is actuated or required.', 'Block safety injection.', 'Reset safety injection.'], task: 'Safety injection board (1): SI lamps. Pressuriser pressure above 127 bar and containment pressure normal means it isn’t needed.', chk: function () { return true; }, now: function () { return x.si.on ? 'SI ACTUATED' : 'pressure ' + x.pz.P.toFixed(0) + ' bar, containment ' + x.ct.P.toFixed(2) + ' bar g'; }, rep: x.si.on ? 'Safety injection is actuated.' : 'Safety injection is not actuated and not required.', mins: 5, xp: 20 } ]; },
  issue: function (o) { var p = S.p; CREW.q = Object.assign({ ph: 'rb', t: p.t, tr: 0 }, o); var order = o.rb.map(function (r, k) { return { r: r, k: k }; }); for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; } CREW.q.opts = order; CREW.msg = null; speak(o.say); AUD.sfx('btn'); HUD.dirty = true; CREW.draw(); if (S.ts > 5) setTS(5); },
  tick: function (dtR, sim) { if (!S.cfg.crew || !S.p) { if (CREW.el && !CREW.el.hidden) CREW.el.hidden = true; return; } var p = S.p, x = p.x;
    if (CREW.msgT > 0) { CREW.msgT -= dtR; if (CREW.msgT <= 0) { CREW.msg = null; CREW.draw(); } }
    if (p.tripped && !CREW.e0 && (x.tb.gen || (p.x.core && p.x.core.best > FULL * 0.1) || D.pr > 5) && MS.phase() === 'free') { CREW.e0 = true; PROC.start('E-0'); CREW.say('Reactor trip. Going to E-0: follow the procedure panel.', 'lco'); }
    if (!p.tripped) CREW.e0 = false;
    if (!CREW.q && CREW.queue.length) { CREW.issue(CREW.queue.shift()); return; }
    if (!CREW.q && MS.phase() === 'free' && !p.tripped && x.tb.gen) { CREW.next -= dtR * Math.min(4, Math.max(1, S.ts / 5)); if (CREW.next <= 0) { var os = CREW.orders(), tot = 0; os.forEach(function (o) { tot += o.w; }); var r = Math.random() * tot; for (var i = 0; i < os.length; i++) { r -= os[i].w; if (r <= 0) { CREW.issue(os[i]); break; } } CREW.next = 180 + Math.random() * 180; } }
    var q = CREW.q; if (q && q.ph === 'do') { if (!q.nag && (p.t - q.t2) / 60 > q.mins) { q.nag = true; CREW.say('How are you getting on with that? ' + q.say.split('.')[0] + '.', 'nag'); } }
    if (q && (CREW.drawT = (CREW.drawT || 0) + dtR) > 0.5) { CREW.drawT = 0; CREW.draw(); } },
  click: function (b) { var q = CREW.q, p = S.p; if (!q) return; AUD.init();
    if (b.dataset.rb != null) { var k = +b.dataset.rb; if (k === 0) { q.ph = 'do'; q.t2 = p.t; CREW.say('That’s correct.', 'ok'); CAR.add(q.tr ? 4 : 10, 'Three-way communication'); var st = CREW.stats(); st.rb++; if (!q.tr) st.first++; } else { q.tr++; CREW.say('No. I say again: ' + q.say, 'bad'); S.sfx('deny'); CREW.stats().wrong++; } }
    if (b.dataset.c === 'rep') { var ok = false; try { ok = q.chk(); } catch (e) {} if (ok) { var rep = typeof q.rep === 'function' ? q.rep() : q.rep; CREW.q = null; S.addLog('RO to CRS: ' + rep); CAR.add(q.xp || 20, 'Order completed'); CREW.stats().done++; S.sfx('ok'); CREW.say(rep.replace(/\.$/, '') + '? Understood. Thanks.', 'ok'); } else { S.sfx('deny'); CREW.say('Check your indications. ' + (q.now ? q.now() + '.' : '') + ' That isn’t done yet.', 'bad'); } }
    if (b.dataset.c === 'cant') { CREW.q = null; CREW.say('Understood, I’ll note it in the log.', 'info'); S.addLog('RO unable to complete: ' + q.say); }
    CREW.draw(); },
  stats: function () { var c = CAR.p; if (!c) return { rb: 0, first: 0, wrong: 0, done: 0 }; return c.crew || (c.crew = { rb: 0, first: 0, wrong: 0, done: 0 }); },
  draw: function () { var E = CREW.el; if (!E) return; var q = CREW.q, m = CREW.msg; E.hidden = !S.cfg.crew || (!q && !m) || !!S.menu; root.classList.toggle('crewon', !E.hidden); root.classList.toggle('qcon', !!S.cfg.quick); if (E.hidden) return; var h2 = CREW.html();
    if (E._h !== h2) { E._h = h2; E.innerHTML = h2; } var nw = E.querySelector('[data-now]'); if (nw && q && q.now) { try { nw.textContent = q.now(); } catch (e) {} } },
  html: function () { var q = CREW.q, m = CREW.msg; if (!q && !m) return ''; var h2 = '<div class="crh">👩‍✈️ <b>CRS · ' + CRSN + '</b>' + (q ? '<span>' + (q.ph === 'rb' ? 'repeat it back' : 'in progress') + '</span>' : '') + '</div>';
    if (m && (!q || q.ph !== 'rb' || m.k === 'bad')) h2 += '<div class="crm ' + m.k + '">“' + esc(m.t) + '”</div>';
    if (q && q.ph === 'rb') h2 += (m && m.k === 'bad' ? '' : '<div class="crm">“' + esc(q.say) + '”</div>') + '<div class="crb">' + q.opts.map(function (o) { return '<button data-rb="' + o.k + '">🗣 ' + esc(o.r) + '</button>'; }).join('') + '</div>';
    if (q && q.ph === 'do') h2 += '<div class="crt"><b>Task:</b> ' + esc(q.task) + (q.now ? '<em data-now></em>' : '') + '</div><div class="crb row"><button data-c="rep" class="go">📣 Report complete</button><button data-c="cant">Can’t do it</button></div>';
    return h2; }
};
function crewBuild() { var E = CREW.el = h('div', 'cpncrew', null, root); E.hidden = true; E.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) CREW.click(b); }); E.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  var L = HUD.el.lco = h('button', 'cpnlco', null, root); L.hidden = true; L.addEventListener('click', function (e) { e.stopPropagation(); AUD.init(); tsMenu(); }); }
function lcoChip() { var L = HUD.el.lco; if (!L) return; var act = TS.active(); L.hidden = !act.length || !!S.menu; if (!act.length) return; var p = S.p; act.sort(function (a, b) { return (a.a.okNow ? 1e12 : a.a.due) - (b.a.okNow ? 1e12 : b.a.due); });
  L.innerHTML = '📕 ' + act.slice(0, 2).map(function (o) { return '<b>' + esc(o.l.id) + '</b> ' + esc(o.l.act[o.a.k].t) + ' <i>' + (o.a.viol ? 'VIOLATED' : o.a.okNow ? 'action met' : hms(o.a.due - p.t)) + '</i>'; }).join('<br>📕 ') + (act.length > 2 ? '<br>+' + (act.length - 2) + ' more' : ''); }

/* ---------------------------------------------------------------- core monitor and heat balance ---------------------------------------------------------------- */
function steadyState() { var hs = S.p.hist.slice(-300); if (hs.length < 240) return { ok: false, why: 'need 5 minutes of plant data' }; var nmin = 9, nmax = 0, tmin = 999, tmax = 0; hs.forEach(function (h) { nmin = Math.min(nmin, h[1]); nmax = Math.max(nmax, h[1]); tmin = Math.min(tmin, h[2]); tmax = Math.max(tmax, h[2]); });
  var dn = (nmax - nmin) * 100, dt = tmax - tmin; return { ok: dn < 0.6 && dt < 0.4, why: 'power changed ' + dn.toFixed(2) + '% and Tavg ' + dt.toFixed(2) + ' °C in the last 5 minutes (limits 0.6% and 0.4 °C)' }; }
function axialSVG(cr, w, hh) { var s = cr.s, mx = 2.2, bw = hh / NZ, out = '<svg viewBox="0 0 ' + w + ' ' + hh + '" width="100%" style="max-width:' + w + 'px" role="img" aria-label="Axial power shape">';
  for (var i = 0; i < NZ; i++) { var y = hh - (i + 1) * bw, l = s[i] / mx * (w - 70); out += '<rect x="44" y="' + (y + 1) + '" width="' + l.toFixed(1) + '" height="' + (bw - 2) + '" rx="2" fill="' + (i >= NZ / 2 ? 'var(--ax1)' : 'var(--ax2)') + '"/><text x="' + (48 + l) + '" y="' + (y + bw * 0.68) + '" font-size="10" fill="currentColor">' + s[i].toFixed(2) + '</text>'; }
  var S2 = S.p; BANKS.slice(4).forEach(function (b, k) { var tip = hh * (1 - S2.rods[b] / TOP); if (S2.rods[b] < TOP) out += '<line x1="' + (6 + k * 8) + '" y1="0" x2="' + (6 + k * 8) + '" y2="' + tip.toFixed(1) + '" stroke="#c9ced6" stroke-width="5"/><text x="' + (3 + k * 8) + '" y="' + Math.min(hh - 2, tip + 11) + '" font-size="8" fill="currentColor">' + b[1] + '</text>'; });
  out += '<line x1="44" y1="' + hh / 2 + '" x2="' + w + '" y2="' + hh / 2 + '" stroke="currentColor" stroke-dasharray="3 4" opacity=".4"/><text x="' + (w - 4) + '" y="12" text-anchor="end" font-size="10" fill="currentColor" opacity=".7">TOP</text><text x="' + (w - 4) + '" y="' + (hh - 4) + '" text-anchor="end" font-size="10" fill="currentColor" opacity=".7">BOTTOM</text></svg>'; return out; }
function tentSVG(cr, w, hh) { var X = function (a) { return w / 2 + a / 40 * (w / 2 - 10); }, Y = function (P) { return hh - 18 - (P - 40) / 70 * (hh - 30); }, P = rtp();
  var env = [[-27, 50], [-12, 100], [8, 100], [21, 50]], pts = env.map(function (q) { return X(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1); }).join(' '), out = '<svg viewBox="0 0 ' + w + ' ' + hh + '" width="100%" style="max-width:' + w + 'px" role="img" aria-label="AFD envelope">';
  out += '<polygon points="' + pts + '" fill="rgba(89,224,122,.12)" stroke="#59e07a" stroke-width="2"/>';
  var tg = function (Pp) { return afdTarget(Pp); }; out += '<polygon points="' + [[tg(50) - 5, 50], [tg(100) - 5, 100], [tg(100) + 5, 100], [tg(50) + 5, 50]].map(function (q) { return X(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1); }).join(' ') + '" fill="rgba(127,209,255,.18)" stroke="#7fd1ff" stroke-dasharray="4 3"/>';
  [-30, -20, -10, 0, 10, 20, 30].forEach(function (a) { out += '<text x="' + X(a) + '" y="' + (hh - 4) + '" text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">' + a + '</text>'; }); [50, 75, 100].forEach(function (q) { out += '<text x="2" y="' + (Y(q) + 3) + '" font-size="10" fill="currentColor" opacity=".7">' + q + '%</text><line x1="26" x2="' + w + '" y1="' + Y(q) + '" y2="' + Y(q) + '" stroke="currentColor" opacity=".12"/>'; });
  var e = afdEnv(P), inside = P <= 50 || (cr.afdI >= e[0] && cr.afdI <= e[1]); out += '<circle cx="' + X(clamp(cr.afdI, -38, 38)) + '" cy="' + Y(clamp(P, 40, 110)) + '" r="6" fill="' + (inside ? '#ffd34a' : '#ff5a48') + '" stroke="#000"/></svg>'; return out; }
function coreMenu(tab) { if (!S.menu) S.wasPaused = S.paused; setPause(true); tab = tab || 'core'; var p = S.p, x = p.x, cr = crx(), c = calx(), P = rtp(), tb = function (k, l) { return '<button class="cpnb2" data-a="tab" data-t="' + k + '" aria-pressed="' + (tab === k) + '">' + l + '</button>'; };
  var head = '<h1>📈 Core monitoring</h1><p class="cpnsub">Plant computer · ' + clockStr(D.clock) + ' · MODE ' + D.mode + ' · ' + Math.round(cr.best) + ' MWt (' + P.toFixed(1) + '% RTP)</p><div class="cpnseg">' + tb('core', 'Core') + tb('cal', 'Heat balance') + tb('ts', '📕 Tech Specs') + '</div>', body = '';
  var row = function (k, v, lim, bad) { return '<div class="cmr' + (bad ? ' bad' : '') + '"><span>' + k + '</span><b>' + v + '</b><em>' + (lim || '') + '</em></div>'; };
  if (tab === 'core') { var e = afdEnv(P), tg = afdTarget(P), ril = rilPc(P);
    body = '<div class="cmgrid"><div><h2>Axial power shape</h2>' + axialSVG(cr, 300, 240) + '<p class="cmnote">12 axial levels, bottom to top, relative to the core average. Rods (A–D) hang from the top: pushing bank D in pushes power down.</p></div><div><h2>Axial flux difference</h2>' + tentSVG(cr, 300, 240) + '<p class="cmnote">Green tent: Tech Spec 3.2.3 envelope. Blue dashed: the ±5% target band around the target AFD from the last flux map. Yellow dot: you.</p></div></div>' +
      '<h2>Margins</h2><div class="cmtab">' + row('AFD (ΔI, indicated)', cr.afdI.toFixed(1) + ' %', 'target ' + tg.toFixed(1) + ' ±5 · envelope ' + e[0].toFixed(0) + '/+' + e[1].toFixed(0), P > 50 && (cr.afdI < e[0] || cr.afdI > e[1])) + row('Axial offset', (cr.ao * 100).toFixed(1) + ' %', '(top − bottom) ÷ total') +
      row('FQ, heat flux hot channel factor', cr.fq.toFixed(3), 'limit ' + fqLim(P).toFixed(2), cr.fq > fqLim(P) && P > 5) + row('FΔH, enthalpy rise factor', cr.fdh.toFixed(3), 'limit ' + (1.65 * (1 + 0.3 * (1 - P / 100))).toFixed(3)) +
      row('Minimum DNBR (W-3)', cr.dnbr > 50 ? '> 50' : cr.dnbr.toFixed(2), 'limit 1.30 · at level ' + (cr.dnbZ + 1), cr.dnbr < 1.3 && P > 5) + row('Peak linear heat rate', cr.lhgr.toFixed(1) + ' kW/m', 'limit 44.7 kW/m', cr.lhgr > 44.7) + row('Hottest fuel centreline', Math.round(cr.tcl) + ' °C', 'UO₂ melts at 2800 °C', cr.tcl > 2500) +
      row('Hot / cold leg', cr.Th.toFixed(1) + ' / ' + cr.Tc.toFixed(1) + ' °C', 'ΔT ' + cr.dT.toFixed(1) + ' °C') + row('OTΔT margin', ((cr.otsp - cr.ratio) * 100).toFixed(1) + ' % of ΔT₀', 'rod stop and runback at 3%', cr.ratio > 0 && cr.otsp - cr.ratio < 0.05) + row('OPΔT margin', ((cr.opsp - cr.ratio) * 100).toFixed(1) + ' % of ΔT₀', 'rod stop and runback at 3%', cr.ratio > 0 && cr.opsp - cr.ratio < 0.05) +
      row('Core exit temperature (max)', cr.cet.toFixed(1) + ' °C', '') + row('Subcooling margin', cr.sub.toFixed(1) + ' °C', 'trip the RCPs below 15 °C in a LOCA', cr.sub < 15) + row('Reactor vessel level (RVLIS)', Math.round(cr.rvl) + ' %', 'top of core at 62%', cr.rvl < 90) +
      row('Control banks', pcName(p.pc).replace('bank ', ''), 'insertion limit ' + pcName(ril).replace('bank ', ''), p.pc < ril && D.mode <= 2 && D.keff >= 1) + row('Shutdown margin (if tripped now)', Math.round(sdmPcm(p)) + ' pcm', 'limit 1300 pcm') + row('Xenon worth', Math.round(x.xe.X) + ' pcm', 'iodine ' + (x.xe.I / 8400 * 100).toFixed(0) + '% of full-power level') + row('MTC', mtc(p).toFixed(1) + ' pcm/°C', 'must be ≤ 0') + row('QPTR (quadrant tilt)', (cr.qptr || 1).toFixed(3), 'limit 1.02 · ' + (cr.qt || []).map(function (v) { return v.toFixed(2); }).join('/'), cr.qptr > 1.02 && P > 50) + row('Loop cold legs', (cr.lp || []).map(function (v) { return v.toFixed(1); }).join(' / ') + ' °C', 'SG pressures ' + x.sg.map(function (s) { return (s.P == null ? p.Ps : s.P).toFixed(0); }).join('/') + ' bar') + row('Core burnup', Math.round(x.bu || 0).toLocaleString('en-GB') + ' MWd/tU', 'cycle ends about 18,000 (' + Math.round((x.bu || 0) / 18000 * 100) + '%)') + '</div>' +
      '<p class="cmnote">Xenon oscillations: if AFD swings away and back over about a day, that’s xenon sloshing between the top and bottom of the core. Damp it by moving bank D against the swing, early.</p>'; }
  if (tab === 'cal') { var ss = steadyState(), corr = c.corr || 1, sh = satH(p.Ps + c.eP), hs = sh[0] + 0.9975 * (sh[1] - sh[0]), hf = hLiq(cr.Tfw + c.eT), rcpN = x.rcpOn.filter(Boolean).length, tot = 0;
    var lines = [0, 1, 2, 3].map(function (i) { var m = cr.mfw[i] * c.fv * corr, q = m * (hs - hf) / 1000; tot += q; return '<tr><td>SG ' + (i + 1) + '</td><td>' + m.toFixed(1) + '</td><td>' + (cr.Tfw + c.eT).toFixed(1) + '</td><td>' + (p.Ps + c.eP).toFixed(2) + '</td><td>' + hs.toFixed(1) + '</td><td>' + hf.toFixed(1) + '</td><td><b>' + q.toFixed(1) + '</b></td></tr>'; }).join('');
    var core = tot - 5 * rcpN + 1.5, pct = core / FULL * 100; c.view = { q: core, pct: pct };
    body = '<h2>Secondary calorimetric (heat balance)</h2><p>The reactor’s real thermal power can’t be measured directly. It’s worked out from the steam side: <b>feedwater mass flow × (steam enthalpy − feedwater enthalpy)</b> for each steam generator, minus the heat the coolant pumps add (5 MW each), plus heat lost from the pipework (1.5 MW). The power range detectors only measure neutrons leaking out of the core, so once a day they’re adjusted to agree with this.</p>' +
      '<p class="' + (ss.ok ? 'cmok' : 'cmbad') + '">' + (ss.ok ? '✔ Plant steady: ' : '✖ Not steady enough: ') + esc(ss.why) + '</p>' +
      '<div class="cmscroll"><table class="cmt"><tr><th></th><th>Feed flow kg/s</th><th>Feed temp °C</th><th>Steam bar g</th><th>h steam kJ/kg</th><th>h feed kJ/kg</th><th>MWt</th></tr>' + lines + '<tr><td colspan="6">Steam generators total</td><td><b>' + tot.toFixed(1) + '</b></td></tr><tr><td colspan="6">− reactor coolant pump heat (' + rcpN + ' × 5 MW)</td><td>−' + (5 * rcpN).toFixed(1) + '</td></tr><tr><td colspan="6">+ pipework and other losses</td><td>+1.5</td></tr><tr class="tot"><td colspan="6">Core thermal power</td><td><b>' + core.toFixed(0) + ' MWt · ' + pct.toFixed(2) + '%</b></td></tr></table></div>' +
      '<p class="cmnote">Steam quality assumed 99.75%. Feed flow from the venturi flow nozzles' + (corr !== 1 ? ', corrected by ' + ((corr - 1) * 100).toFixed(2) + '% from the ultrasonic flowmeter' : '') + '. Last calorimetric: ' + (c.last ? hms(p.t - c.lastT) + ' ago (' + c.last.pct.toFixed(2) + '%)' : c.lastT > -1e11 ? hms(p.t - c.lastT) + ' ago, on the last shift' : 'none yet') + '.</p>' +
      '<div class="cpnbtns"><button class="cpnb" data-a="calrec"' + (ss.ok && pct > 15 ? '' : ' disabled') + '>📝 Record calorimetric</button><button class="cpnb2" data-a="lefm">🔊 Check against the ultrasonic flowmeter</button></div>' +
      '<h2>Power range channels (NIS)</h2><div class="cmscroll"><table class="cmt"><tr><th>Channel</th><th>Indicated %</th><th>Calorimetric − NIS</th><th>Gain</th><th>Adjust</th></tr>' + [0, 1, 2, 3].map(function (i) { var v = prPct(p, i), d = (c.last && p.t - c.lastT < 3600 ? c.last.pct : pct) - v; return '<tr' + (d > 2 ? ' class="bad"' : '') + '><td>N4' + (i + 1) + '</td><td>' + v.toFixed(2) + '</td><td>' + (d >= 0 ? '+' : '') + d.toFixed(2) + '</td><td>' + c.g[i].toFixed(4) + '</td><td><button class="mini" data-a="g" data-i="' + i + '" data-d="-1">−0.1%</button><button class="mini" data-a="g" data-i="' + i + '" data-d="1">+0.1%</button><button class="mini" data-a="gm" data-i="' + i + '">Match</button></td></tr>'; }).join('') + '</table></div>' +
      '<p class="cmnote">Tech Spec SR 3.3.1.2: if the calorimetric is more than 2% above any channel, adjust that channel up (otherwise it would trip late). Channels reading high are conservative but are usually adjusted too. “Match” only works within an hour of recording a calorimetric.</p>'; }
  if (tab === 'ts') { closeMenu(true); tsMenu(); return; }
  menu(head + body + '<div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button></div>', function (a, b) { if (a === 'x') closeMenu(); if (a === 'tab') coreMenu(b.dataset.t);
    if (a === 'calrec') { var v = c.view; c.last = { t: p.t, q: v.q, pct: v.pct, pr: NI.pr.slice() }; c.lastT = p.t; c.log.push([D.clock, Math.round(v.q)]); S.addLog('Calorimetric recorded: ' + Math.round(v.q) + ' MWt (' + v.pct.toFixed(2) + '%). NIS ' + NI.pr.map(function (q) { return q.toFixed(1); }).join(' / ')); CAR.add(15, 'Calorimetric heat balance'); toast('📝 Calorimetric recorded: ' + v.pct.toFixed(2) + '% RTP', 'ok'); coreMenu('cal'); }
    if (a === 'g') { var i = +b.dataset.i; c.g[i] *= 1 + 0.001 * +b.dataset.d; NI.pr[i] = prPct(p, i); S.addLog('N4' + (i + 1) + ' gain adjusted to ' + c.g[i].toFixed(4)); coreMenu('cal'); }
    if (a === 'gm') { var j = +b.dataset.i; if (!c.last || p.t - c.lastT > 3600) { toast('Record a calorimetric first (it has to be less than an hour old).', 'warn'); return; } var cur = prPct(p, j); c.g[j] *= c.last.pct / Math.max(1, cur); NI.pr[j] = prPct(p, j); S.addLog('N4' + (j + 1) + ' gain matched to the calorimetric: ' + c.g[j].toFixed(4)); S.sfx('ok'); coreMenu('cal'); }
    if (a === 'lefm') { var err = (c.fv * (c.corr || 1) - 1) * 100; if (Math.abs(err) < 0.15) toast('Ultrasonic flowmeter agrees with the venturis to ' + Math.abs(err).toFixed(2) + '%. No correction needed.', 'ok'); else { c.corr = 1 / c.fv; S.addLog('Feedwater flow correction from the ultrasonic flowmeter: venturis reading ' + err.toFixed(2) + '% high (fouling). Correction applied.'); toast('The venturis are reading ' + err.toFixed(2) + '% high (fouled). Correction applied: record a new calorimetric.', 'warn'); } coreMenu('cal'); } });
}
/* the plant computer's calorimetric best estimate uses the ultrasonic correction once it's been applied */
function calCorr() { var c = S.p.x.cal; return c && c.corr ? c.corr : 1; }
/* wall screen: core monitoring */
function drawCoreScr(g) { var p = S.p, cr = crx(), W = 1280, P = rtp(); scrHead(g, W, 'CORE MONITORING · AXIAL SHAPE · AFD · MARGINS', MODEN[D.mode].toUpperCase());
  var x0 = 40, y0 = 90, hh = 520, bw = hh / NZ; ctext(g, 'AXIAL POWER', x0, y0 - 18, 20, '#9fc9ea', 'left', 300, '600');
  for (var i = 0; i < NZ; i++) { var y = y0 + hh - (i + 1) * bw, l = cr.s[i] / 2.2 * 300; g.fillStyle = i >= NZ / 2 ? '#ff9f43' : '#58d6ff'; g.fillRect(x0 + 30, y + 2, l, bw - 4); ctext(g, cr.s[i].toFixed(2), x0 + 36 + l, y + bw / 2, 16, '#e8f1f8', 'left', 80, '600'); }
  CTB.forEach(function (b, k) { var tip = y0 + hh * (1 - p.rods[b] / TOP); if (p.rods[b] < TOP) { g.fillStyle = '#c9ced6'; g.fillRect(x0 + k * 7, y0, 5, tip - y0); } });
  var tx = 470, ty = 90, tw = 420, th = 300, X = function (a) { return tx + tw / 2 + a / 40 * (tw / 2); }, Y = function (q) { return ty + th - (q - 40) / 70 * th; }; ctext(g, 'AFD vs POWER', tx, ty - 18, 20, '#9fc9ea', 'left', 300, '600');
  g.fillStyle = '#0c1824'; g.fillRect(tx, ty, tw, th); g.strokeStyle = '#59e07a'; g.lineWidth = 3; g.beginPath(); [[-27, 50], [-12, 100], [8, 100], [21, 50]].forEach(function (q, k) { if (k) g.lineTo(X(q[0]), Y(q[1])); else g.moveTo(X(q[0]), Y(q[1])); }); g.closePath(); g.stroke();
  g.strokeStyle = '#7fd1ff'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(afdTarget(50) - 5), Y(50)); g.lineTo(X(afdTarget(100) - 5), Y(100)); g.moveTo(X(afdTarget(50) + 5), Y(50)); g.lineTo(X(afdTarget(100) + 5), Y(100)); g.stroke(); g.setLineDash([]);
  var e = afdEnv(P), ins = P <= 50 || (cr.afdI >= e[0] && cr.afdI <= e[1]); g.fillStyle = ins ? '#ffd34a' : '#ff5a48'; g.beginPath(); g.arc(X(clamp(cr.afdI, -38, 38)), Y(clamp(P, 40, 110)), 10, 0, 6.3); g.fill();
  var rows = [['AFD', cr.afdI.toFixed(1) + ' %  (target ' + afdTarget(P).toFixed(1) + ')'], ['FQ', cr.fq.toFixed(2) + '  (limit ' + fqLim(P).toFixed(2) + ')'], ['FΔH', cr.fdh.toFixed(3)], ['MIN DNBR', cr.dnbr > 50 ? '> 50' : cr.dnbr.toFixed(2) + '  (limit 1.30)'], ['PEAK kW/m', cr.lhgr.toFixed(1)], ['FUEL CL MAX', Math.round(cr.tcl) + ' °C'], ['CORE EXIT', cr.cet.toFixed(1) + ' °C'], ['SUBCOOLING', cr.sub.toFixed(1) + ' °C'], ['RVLIS', Math.round(cr.rvl) + ' %'], ['THERMAL', Math.round(cr.best) + ' MWt  ' + P.toFixed(1) + '%']];
  rows.forEach(function (r, k) { var yy = 430 + k * 26, bad = (r[0] === 'MIN DNBR' && cr.dnbr < 1.5 && P > 5) || (r[0] === 'SUBCOOLING' && cr.sub < 15) || (r[0] === 'AFD' && !ins); ctext(g, r[0], tx, yy, 18, '#7fa6c6', 'left', 160, '600'); ctext(g, r[1], tx + 170, yy, 20, bad ? '#ff6b5b' : '#e8f1f8', 'left', 300, '600'); });
  var lx = 930; ctext(g, 'TECH SPECS', lx, 72, 20, '#9fc9ea', 'left', 300, '600'); var act = TS.active(); if (!act.length) ctext(g, 'ALL LCOs MET', lx, 110, 24, '#59e07a', 'left', 330, '700');
  act.slice(0, 7).forEach(function (o, k) { var yy = 110 + k * 72; g.fillStyle = o.a.viol ? 'rgba(255,90,72,.25)' : 'rgba(255,201,74,.14)'; g.fillRect(lx - 8, yy - 26, 340, 64); ctext(g, 'LCO ' + o.l.id, lx, yy - 8, 20, o.a.viol ? '#ff6b5b' : '#ffd34a', 'left', 200, '700'); ctext(g, o.a.viol ? 'VIOLATED' : o.a.okNow ? 'ACTION MET' : hms(o.a.due - p.t), lx + 325, yy - 8, 20, '#fff', 'right', 130, '700'); ctext(g, o.l.t, lx, yy + 18, 16, '#e8f1f8', 'left', 325, '600'); }); }
var OPS_CSS = '.cpncrew{position:absolute;left:50%;transform:translateX(-50%);bottom:max(60px,calc(env(safe-area-inset-bottom) + 52px));width:min(560px,calc(100% - 16px));background:rgba(10,16,24,.94);border:1px solid rgba(127,209,255,.45);border-radius:14px;padding:10px 12px;z-index:6;box-shadow:0 10px 30px rgba(0,0,0,.45)}' +
  '.cpncrew .crh{display:flex;gap:8px;align-items:center;font-size:13px;color:#9fc9ea}.cpncrew .crh span{margin-left:auto;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#ffd34a}.cpncrew .crm{margin:6px 0;font-size:15px;line-height:1.35}.cpncrew .crm.bad{color:#ff9f8f}.cpncrew .crm.ok{color:#8fe8a8}.cpncrew .crm.lco{color:#ffd34a}' +
  '.cpncrew .crb{display:flex;flex-direction:column;gap:6px;margin-top:6px}.cpncrew .crb.row{flex-direction:row;flex-wrap:wrap}.cpncrew button{background:rgba(127,209,255,.1);border:1px solid rgba(127,209,255,.35);color:#e8f1f8;border-radius:10px;padding:8px 10px;text-align:left;font:inherit;cursor:pointer;min-height:36px}.cpncrew button:hover{background:rgba(127,209,255,.2)}.cpncrew button.go{background:#ffd34a;color:#1a1300;font-weight:800;border-color:#ffd34a}' +
  '.cpncrew .crt{font-size:13.5px;margin-top:6px}.cpncrew .crt em{display:block;font-style:normal;color:#7fd1ff;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;margin-top:4px}' +
  '.cpnlco{position:absolute;left:50%;transform:translateX(-50%);top:calc(max(8px,env(safe-area-inset-top)) + 108px);max-width:min(380px,calc(100% - 16px));background:rgba(40,28,4,.92);border:1px solid rgba(255,201,74,.6);color:#ffe6a3;border-radius:12px;padding:7px 11px;font:600 12.5px/1.45 system-ui,sans-serif;text-align:left;cursor:pointer;z-index:5}.cpnlco i{font-style:normal;font-family:ui-monospace,Menlo,Consolas,monospace;color:#fff}' +
  '.tslist{display:flex;flex-direction:column;gap:6px;margin-top:10px}.tsrow{background:rgba(255,255,255,.03);border:1px solid rgba(140,180,220,.18);border-radius:10px;padding:8px 10px}.tsrow.on{border-color:rgba(255,201,74,.55);background:rgba(255,201,74,.06)}.tsrow summary{display:flex;gap:10px;align-items:center;cursor:pointer;flex-wrap:wrap}.tsrow summary span{flex:1;min-width:160px}.tsrow i{font-style:normal;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px}' +
  '.tsm{background:rgba(89,224,122,.15);color:#8fe8a8}.tsn{background:rgba(255,201,74,.2);color:#ffd34a}.tsk{background:rgba(127,209,255,.18);color:#9fdcff}.tsv{background:rgba(255,90,72,.25);color:#ff9f8f}.tsrow ol{margin:6px 0 0 18px;padding:0}.tsrow li.cur{color:#ffd34a;font-weight:700}.tsrow li em{opacity:.7}' +
  '.cmgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;--ax1:#ff9f43;--ax2:#58d6ff}.cmnote{font-size:12.5px;opacity:.75}.cmtab{display:grid;grid-template-columns:1fr;gap:3px}.cmr{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.4fr);gap:10px;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,.03);font-size:13px}.cmr b{font-family:ui-monospace,Menlo,Consolas,monospace}.cmr em{font-style:normal;opacity:.65;font-size:12px}.cmr.bad{background:rgba(255,90,72,.16)}.cmr.bad b{color:#ff9f8f}' +
  '.cmscroll{overflow-x:auto}.cmt{border-collapse:collapse;width:100%;font-size:12.5px;min-width:520px}.cmt th,.cmt td{padding:5px 7px;border-bottom:1px solid rgba(140,180,220,.15);text-align:right}.cmt th:first-child,.cmt td:first-child{text-align:left}.cmt tr.tot td{border-top:2px solid rgba(255,211,74,.5);color:#ffd34a}.cmt tr.bad td{color:#ff9f8f}.cmt button.mini{background:rgba(127,209,255,.12);border:1px solid rgba(127,209,255,.35);color:#e8f1f8;border-radius:7px;padding:3px 7px;margin-left:3px;font:inherit;font-size:11.5px;cursor:pointer}' +
  '@media (min-width:900px){.cpncrew{left:auto;right:max(8px,env(safe-area-inset-right));transform:none;bottom:max(8px,env(safe-area-inset-bottom));width:440px}.cpn.qcon .cpncrew{right:calc(max(8px,env(safe-area-inset-right)) + 352px)}}@media (max-width:899px){.cpn.crewon .cpntoasts{bottom:auto;top:calc(max(8px,env(safe-area-inset-top)) + 196px)}.cpnlco{top:calc(max(8px,env(safe-area-inset-top)) + 100px);width:calc(100% - 16px)}}' +
  '.mvsl{display:grid;grid-template-columns:minmax(0,1fr) minmax(120px,220px) 52px;gap:10px;align-items:center;margin:8px 0;font-size:13.5px}.mvsl b{font-family:ui-monospace,Menlo,Consolas,monospace;text-align:right}' +
  '.cpnproc{left:max(8px,env(safe-area-inset-left));right:auto;transform:none;bottom:auto;top:calc(max(8px,env(safe-area-inset-top)) + 170px);width:min(380px,calc(100% - 16px))}' +
  '.cpnteach{left:50%;right:auto;transform:translateX(-50%);bottom:auto;top:calc(max(8px,env(safe-area-inset-top)) + 64px);width:min(600px,calc(100% - 16px));max-height:calc(100% - 140px);overflow:auto;border-color:#59e07a;z-index:7}' +
  '.cpn[data-ui=xs]>:not(canvas):not(.cpnvig){zoom:.62}.cpn[data-ui=s]>:not(canvas):not(.cpnvig){zoom:.8}.cpn[data-ui=l]>:not(canvas):not(.cpnvig){zoom:1.18}' +
  '.cpnphone{left:auto;right:max(8px,env(safe-area-inset-right));transform:none;bottom:auto;top:calc(max(8px,env(safe-area-inset-top)) + 150px);width:min(420px,calc(100% - 16px));border-color:#ffd34a;z-index:7}.cpnfo{position:absolute;left:50%;transform:translateX(-50%);top:calc(max(8px,env(safe-area-inset-top)) + 164px);background:#3a0b08;border:2px solid #ff5a48;color:#ffd9d4;border-radius:10px;padding:6px 14px;font:700 14px system-ui,sans-serif;z-index:5}.cpnfo b{color:#ff5a48;margin-right:10px;letter-spacing:.08em}' +
  '.cmok{color:#8fe8a8;font-weight:700}.cmbad{color:#ffb4a8;font-weight:700}.cpncard button[disabled]{opacity:.45;cursor:not-allowed}';

/* ================================================================ multi-monitor ================================================================
   Two ways to use more than one screen:
   1. Triple view (surround): the 3D control room is drawn by three cameras side by side, each turned by exactly one screen's
      field of view, so a browser window stretched across three monitors shows the room in true perspective (no fish-eye).
   2. Screen windows: pop-out windows you drag (or the browser places) onto your other monitors. Each is a grid of tiles and
      every tile can show any plant computer screen (core monitor, trends, alarms, the whole-plant mimic...) or a live panel
      (checklist, reactor instruments, Tech Specs, the supervisor). They're same-origin windows driven from here, so buttons
      in them (Show me, Check it, repeat-backs) work the plant directly. */
var TRI = { cams: null, q: null, up: null, ang: 0,
  on: function () { return !!(S && S.cfg && S.cfg.tri) && !!R3; },
  setup: function () { if (TRI.cams) return; TRI.cams = [0, 1, 2].map(function () { return new THREE.PerspectiveCamera(60, 1, 0.03, 60); }); TRI.q = new THREE.Quaternion(); TRI.up = new THREE.Vector3(0, 1, 0); },
  sync: function () { TRI.setup(); var W = root.clientWidth, H = Math.max(1, root.clientHeight), w3 = W / 3, asp = w3 / H, vf = CAM.fov * (S.cfg.triFov || 1), half = Math.atan(Math.tan(vf * Math.PI / 360) * asp), bz = (S.cfg.triBezel || 0) * Math.PI / 180;
    TRI.ang = 2 * half + bz; var c0 = R3.cam;
    TRI.cams.forEach(function (c, i) { var k = i - 1; c.fov = vf; c.aspect = asp; c.clearViewOffset(); c.updateProjectionMatrix(); c.position.copy(c0.position); c.rotation.order = 'YXZ'; c.rotation.set(CAM.pitch, CAM.yaw - k * TRI.ang, 0); c.updateMatrixWorld(); /* world yaw then pitch: all three screens tilt up and down together and the horizon stays level */ }); },
  render: function () { var ren = R3.ren, W = root.clientWidth, H = Math.max(1, root.clientHeight), w3 = W / 3, sm = ren.shadowMap.autoUpdate; TRI.sync(); ren.setScissorTest(true);
    for (var i = 0; i < 3; i++) { ren.setViewport(i * w3, 0, w3, H); ren.setScissor(i * w3, 0, w3, H); if (i === 1) ren.shadowMap.autoUpdate = false; ren.render(R3.scene, TRI.cams[i]); }
    ren.shadowMap.autoUpdate = sm; ren.setScissorTest(false); ren.setViewport(0, 0, W, H); },
  /* which camera and which local point a click at (cx, cy) falls in */
  pickCam: function (cx, cy, r) { TRI.sync(); var w3 = r.width / 3, k = clamp(Math.floor((cx - r.left) / w3), 0, 2); return { cam: TRI.cams[k], v: new THREE.Vector2(((cx - r.left) - k * w3) / w3 * 2 - 1, -(cy - r.top) / r.height * 2 + 1) }; }
};

var MV = {
  canv: [['core', 'Core monitor', function (g) { drawCoreScr(g); }, 1280, 720], ['trends', 'Nuclear trends', function (g) { drawTrends(g); }, 1024, 640], ['mimic', 'Whole-plant mimic', function (g) { drawMimic(g); }, 1600, 800], ['alarms', 'Alarm summary', function (g) { drawAlarmWall(g); }, 1280, 720],
    ['onem', '1/M startup plot', function (g) { drawOneM(g); }, 1024, 640], ['proc', 'Procedure + alarm list', function (g) { drawProc(g); }, 1024, 640], ['status', 'Plant status', function (g) { drawStatus(g); }, 1024, 640], ['log', 'Shift log', function (g) { drawLog(g); }, 1024, 640]],
  html: [['check', 'Checklist (live)'], ['nis', 'Reactor instruments'], ['ts', 'Tech Specs'], ['crew', 'Supervisor (crew orders)'], ['plant', 'Plant numbers'], ['eop', 'Procedure (EOP / cooldown)']],
  label: function (id) { var a = MV.canv.concat(MV.html); for (var i = 0; i < a.length; i++) if (a[i][0] === id) return a[i][1]; return id; },
  presets: { a: { n: 4, t: ['check', 'core', 'nis', 'ts'] }, b: { n: 4, t: ['alarms', 'trends', 'mimic', 'crew'] }, c: { n: 6, t: ['check', 'core', 'alarms', 'nis', 'trends', 'crew'] }, d: { n: 1, t: ['mimic'] }, e: { n: 2, t: ['check', 'core'] } }
};
var MULTI = { wins: [], T: 0,
  cfg: function (k) { var c = S.cfg.mw || (S.cfg.mw = [JSON.parse(JSON.stringify(MV.presets.a)), JSON.parse(JSON.stringify(MV.presets.b))]); while (c.length <= k) c.push(JSON.parse(JSON.stringify(MV.presets.e))); return c[k]; },
  count: function () { MULTI.wins = MULTI.wins.filter(function (o) { return o.w && !o.w.closed; }); return MULTI.wins.length; },
  open: function (k, rect) { var feat = 'popup=yes,width=' + (rect ? rect.w : 1200) + ',height=' + (rect ? rect.h : 760) + (rect ? ',left=' + rect.x + ',top=' + rect.y : ''); var w = null;
    try { w = window.open('', 'critical_screen_' + k, feat); } catch (e) {}
    if (!w) { toast('Your browser blocked the window. Allow pop-ups for this site, then try again.', 'warn'); return false; }
    var old = MULTI.wins.filter(function (o) { return o.k === k; })[0]; if (old) MULTI.wins.splice(MULTI.wins.indexOf(old), 1);
    var o = { k: k, w: w, tiles: [] }; MULTI.wins.push(o); MULTI.build(o); try { if (rect) { w.moveTo(rect.x, rect.y); w.resizeTo(rect.w, rect.h); } } catch (e) {} try { w.focus(); } catch (e) {} return true; },
  build: function (o) { var w = o.w, d = w.document, c = MULTI.cfg(o.k);
    d.open(); d.write('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Critical Point · screen ' + (o.k + 2) + '</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + MV_CSS + '</style></head><body><header><b>☢ Critical Point · screen ' + (o.k + 2) + '</b><span class="lay">Layout ' + [1, 2, 4, 6].map(function (n) { return '<button data-lay="' + n + '" aria-pressed="' + (c.n === n) + '">' + n + '</button>'; }).join('') + '</span><span class="pre">Preset <button data-pre="a">Checklist + core</button><button data-pre="b">Alarms + trends</button><button data-pre="c">Everything</button><button data-pre="d">Mimic</button></span><button data-fs="1">⛶ Full screen</button></header><main></main></body></html>'); d.close();
    d.body.addEventListener('click', function (e) { MULTI.click(o, e); }); d.body.addEventListener('change', function (e) { var s = e.target.closest('select'); if (s) { c.t[+s.dataset.i] = s.value; saveCfg(); MULTI.layout(o); } });
    w.addEventListener('keydown', function (e) { if (e.key === 'F11' || (e.key === 'f' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'SELECT')) { e.preventDefault(); MULTI.fs(o); } });
    MULTI.layout(o); },
  layout: function (o) { var d = o.w.document, c = MULTI.cfg(o.k), m = d.querySelector('main'); m.className = 'g' + c.n; m.innerHTML = ''; o.tiles = [];
    [].forEach.call(d.querySelectorAll('[data-lay]'), function (b) { b.setAttribute('aria-pressed', String(+b.dataset.lay === c.n)); });
    for (var i = 0; i < c.n; i++) { var id = c.t[i] || ['core', 'trends', 'alarms', 'nis', 'mimic', 'ts'][i]; c.t[i] = id; var t = d.createElement('section'); t.className = 'tile';
      t.innerHTML = '<div class="th"><select data-i="' + i + '" aria-label="What this tile shows"><optgroup label="Plant computer screens">' + MV.canv.map(function (q) { return '<option value="' + q[0] + '"' + (q[0] === id ? ' selected' : '') + '>' + q[1] + '</option>'; }).join('') + '</optgroup><optgroup label="Live panels">' + MV.html.map(function (q) { return '<option value="' + q[0] + '"' + (q[0] === id ? ' selected' : '') + '>' + q[1] + '</option>'; }).join('') + '</optgroup></select></div>';
      var cv = MV.canv.filter(function (q) { return q[0] === id; })[0], body;
      if (cv) { body = d.createElement('canvas'); body.width = cv[3]; body.height = cv[4]; body.className = 'cv'; } else { body = d.createElement('div'); body.className = 'hp ' + id; }
      t.appendChild(body); m.appendChild(t); o.tiles.push({ id: id, el: body, cv: cv, g: cv ? body.getContext('2d') : null, h: '' }); }
    MULTI.draw(o, true); },
  click: function (o, e) { var b = e.target.closest('button'); if (!b) return; AUD.init(); var c = MULTI.cfg(o.k);
    if (b.dataset.lay) { c.n = +b.dataset.lay; saveCfg(); MULTI.layout(o); return; }
    if (b.dataset.pre) { var pr = MV.presets[b.dataset.pre]; c.n = pr.n; c.t = pr.t.slice(); saveCfg(); MULTI.layout(o); return; }
    if (b.dataset.fs) { MULTI.fs(o); return; }
    if (b.dataset.rb != null || b.dataset.c) { CREW.click(b); MULTI.draw(o, true); return; }
    if (b.dataset.show) { showMe(b.dataset.show); toast('👁 Showing you where that is on the main screen.'); try { window.focus(); } catch (x) {} return; }
    if (b.dataset.ver != null) { verifyPre(+b.dataset.ver); MULTI.draw(o, true); return; }
    if (b.dataset.pm) { procMenu(); try { window.focus(); } catch (x) {} return; } if (b.dataset.pq) { PROC.id = null; return; }
    if (b.dataset.go === 'core') { coreMenu(b.dataset.t || 'core'); try { window.focus(); } catch (x) {} } },
  fs: function (o) { var d = o.w.document; try { if (d.fullscreenElement) d.exitFullscreen(); else d.documentElement.requestFullscreen(); } catch (e) {} },
  tick: function (dt) { if (!MULTI.wins.length) return; MULTI.T += dt; if (MULTI.T < 0.25) return; MULTI.T = 0; if (!MULTI.count()) return; MULTI.wins.forEach(function (o) { try { MULTI.draw(o); } catch (e) {} }); },
  draw: function (o, force) { (o.tiles || []).forEach(function (t) { if (t.cv) { if (t.id === 'mimic' && !force && (t.n = (t.n || 0) + 1) % 2) return; t.cv[2](t.g); return; }
      var html = MVH[t.id] ? MVH[t.id]() : ''; if (force || html !== t.h) { t.h = html; t.el.innerHTML = html; } var nw = t.el.querySelector('[data-now]'); if (nw && CREW.q && CREW.q.now) { try { nw.textContent = CREW.q.now(); } catch (x) {} } }); },
  closeAll: function () { MULTI.wins.forEach(function (o) { try { o.w.close(); } catch (e) {} }); MULTI.wins = []; },
  /* put the windows on the other monitors: uses the Window Management API (Chrome and Edge) when allowed */
  auto: function (n) { var go = function (rects) { var ok = 0; for (var k = 0; k < n; k++) if (MULTI.open(k, rects ? rects[k] : null)) ok++; if (rects && ok < n) toast('Only ' + ok + ' window' + (ok === 1 ? '' : 's') + ' opened: press the next “Open screen” button for the rest.', 'warn'); if (S.menu) multiMenu(); };
    if (!('getScreenDetails' in window)) { go(null); toast('Drag each new window onto another monitor, then press ⛶ Full screen in it.'); return; }
    window.getScreenDetails().then(function (sd) { var cur = sd.currentScreen, oth = sd.screens.filter(function (s) { return s !== cur; }).sort(function (a, b) { return a.left - b.left; });
      MULTI.rects = oth.map(function (s) { return { x: s.availLeft, y: s.availTop, w: s.availWidth, h: s.availHeight }; }); MULTI.nScr = sd.screens.length;
      if (!oth.length) { toast('Only one screen found. Connect your other monitors (and set Windows to “Extend these displays”), or drag the windows yourself.', 'warn'); go(null); return; }
      go(MULTI.rects); }).catch(function () { toast('No permission to place windows: they’ll open here. Drag each onto another monitor.', 'warn'); go(null); }); }
};
/* the live HTML panels */
var MVH = { eop: function () { var h2 = PROC.html(); return h2 ? '<div class="crewx">' + h2 + '</div>' : '<h2>📘 Procedures</h2><p class="dim">No procedure running. E-0 starts by itself after a trip; start others from 📘 on the main screen.</p>'; },
  check: function () { var ph = MS.phase(), p = S.p; if (ph === 'free') { var a = TS.active(); return '<h2>Free play</h2><p class="big">' + esc(p.tripped ? 'Reactor shut down' : MODEN[D.mode]) + '</p><p>' + esc(pcName(p.pc)) + ' · ' + (p.x.tb.gen ? Math.round(p.x.tb.mw) + ' MW' : 'generator off line') + '</p>' + (a.length ? '<h3>📕 LCOs entered</h3>' + a.map(function (o) { return '<p class="lco"><b>' + esc(o.l.id) + '</b> ' + esc(o.l.act[o.a.k].t) + ' · <i>' + (o.a.viol ? 'VIOLATED' : o.a.okNow ? 'action met' : hms(o.a.due - p.t)) + '</i></p>'; }).join('') : '<p class="ok">All Tech Specs met</p>') + '<p class="dim">No procedure is running. Start the shutdown or the power ascension from the checklist card on the main screen.</p>'; }
    var P = phaseDef(ph), fl = MS[P.fl], cur = firstOpen(P.list, fl), s = P.list[cur], nw = s && s.now ? s.now(p) : null, n = countDone(fl, P.list.length);
    return '<h2>' + esc(P.t) + ' <small>' + esc(P.code) + '</small></h2><div class="bar"><i style="width:' + Math.round(n / P.list.length * 100) + '%"></i></div>' +
      (s ? '<div class="cur"><b>Step ' + (cur + 1) + ': ' + esc(s.t) + '</b>' + (nw ? '<div class="now"><span>NOW</span>' + nw.a + (nw.pct != null ? '<div class="bar sm"><i style="width:' + Math.round(nw.pct * 100) + '%"></i></div>' : '') + '</div>' : '') + '<p class="st">' + esc(s.st ? s.st(p) : '') + '</p><details><summary>Why?</summary><p>' + s.h + '</p></details><div class="row">' + (ph === 'pre' ? '<button data-ver="' + cur + '" class="go">✔ Check it</button>' : '') + '<button data-show="' + esc(s.show) + '">👁 Show me on the main screen</button></div></div>' : '') +
      '<ol class="cl">' + P.list.map(function (it, i) { var d = !!fl[i]; return '<li class="' + (d ? 'd' : i === cur ? 'c' : '') + '"><span>' + (d ? '✔' : i === cur ? '▶' : '○') + '</span>' + esc(it.t) + '</li>'; }).join('') + '</ol>'; },
  nis: function () { var p = S.p, x = p.x, cr = crx(), f = function (k, v, u, cls) { return '<div class="rd' + (cls ? ' ' + cls : '') + '"><span>' + k + '</span><b>' + v + '</b><em>' + (u || '') + '</em></div>'; };
    return '<h2>Reactor instruments</h2><div class="rds">' + f('SR N31', p.srBlk[0] ? 'OFF' : Math.round(NI.sr[0]).toLocaleString('en-GB'), 'cps') + f('SR N32', p.srBlk[1] ? 'OFF' : Math.round(NI.sr[1]).toLocaleString('en-GB'), 'cps') + f('IR N35', fmtSci(NI.ir[0], 2), 'A') + f('IR N36', fmtSci(NI.ir[1], 2), 'A') +
      NI.pr.map(function (v, i) { return f('PR N4' + (i + 1), v.toFixed(2), '%'); }).join('') + f('Startup rate', p.sur.toFixed(2), 'DPM', p.sur > 1 ? 'bad' : '') + f('k-eff', D.keff.toFixed(5), '') + f('Reactivity', Math.round(D.rho), 'pcm') +
      f('Control banks', esc(pcName(p.pc).replace('bank ', '')), '') + f('Shutdown banks', SDB.map(function (b) { return Math.round(p.rods[b]); }).join('/'), 'steps') + f('Trip breakers', (p.rtb[0] ? 'A ▣' : 'A □') + ' ' + (p.rtb[1] ? 'B ▣' : 'B □'), p.tripped ? 'TRIPPED' : 'closed', p.tripped ? 'bad' : '') + f('Rod control', esc(p.sel), p.rodStop ? 'C-3/C-4 STOP' : '', p.rodStop ? 'bad' : '') +
      f('AFD', cr.afdI.toFixed(1), '% (target ' + afdTarget(rtp()).toFixed(1) + ')') + f('Min DNBR', cr.dnbr > 50 ? '> 50' : cr.dnbr.toFixed(2), 'limit 1.30', cr.dnbr < 1.5 && D.pr > 5 ? 'bad' : '') + f('OTΔT margin', ((cr.otsp - cr.ratio) * 100).toFixed(1), '%') + f('Boron', Math.round(p.boron), 'ppm') + '</div>' + (p.tripped ? '<p class="bad">First out: ' + esc(TRIPS[p.firstOut] || p.firstOut || '') + '</p>' : ''); },
  plant: function () { var p = S.p, x = p.x, cr = crx(), f = function (k, v, u, cls) { return '<div class="rd' + (cls ? ' ' + cls : '') + '"><span>' + k + '</span><b>' + v + '</b><em>' + (u || '') + '</em></div>'; };
    return '<h2>Plant numbers</h2><div class="rds">' + f('Tavg / Tref', p.Tavg.toFixed(1) + ' / ' + trefC(x).toFixed(1), '°C') + f('Hot / cold leg', cr.Th.toFixed(1) + ' / ' + cr.Tc.toFixed(1), '°C') + f('PZR pressure', x.pz.P.toFixed(1), 'bar', x.pz.P < 140 ? 'bad' : '') + f('PZR level', x.pz.L.toFixed(1), '% (prog ' + LPRG(p.Tavg).toFixed(0) + ')') +
      f('Subcooling', cr.sub.toFixed(1), '°C', cr.sub < 15 ? 'bad' : '') + f('Steam pressure', p.Ps.toFixed(1), 'bar') + x.sg.map(function (s, i) { return f('SG ' + (i + 1) + ' level', s.L.toFixed(0), '% NR', s.L < 25 ? 'bad' : ''); }).join('') + f('Feed / steam', x.sg.reduce(function (a, s) { return a + s.feed; }, 0).toFixed(0) + ' / ' + x.sg.reduce(function (a, s) { return a + s.steam; }, 0).toFixed(0), '% flow') +
      f('Generator', Math.round(x.tb.mw), 'MW · set ' + Math.round(x.tb.load)) + f('Turbine', Math.round(x.tb.rpm), 'rpm') + f('Thermal power', Math.round(cr.best), 'MWt (' + rtp().toFixed(1) + '%)') + f('Charging / letdown', x.cv.chg.toFixed(1) + ' / ' + x.cv.ltd.toFixed(1), 'm³/h') + f('Xenon', Math.round(x.xe.X), 'pcm') + f('Containment', x.ct.P.toFixed(2), 'bar g', x.ct.P > 0.1 ? 'bad' : '') + f('RVLIS', Math.round(cr.rvl), '%', cr.rvl < 95 ? 'bad' : '') + f('Grid', D.grid.toFixed(3), 'Hz') + f('Weather', WXN[LIFE.wx], LIFE.night ? 'night shift' : 'day shift') + '</div>'; },
  ts: function () { var p = S.p, st = TS.st(), a = TS.active(); return '<h2>📕 Tech Specs <small>MODE ' + D.mode + ' · ' + esc(MODEN[D.mode]) + '</small></h2>' + (a.length ? a.map(function (o) { return '<div class="lcoc' + (o.a.viol ? ' v' : '') + '"><div><b>LCO ' + esc(o.l.id) + '</b> ' + esc(o.l.t) + '</div><div class="big">' + (o.a.viol ? 'VIOLATED' : o.a.okNow ? 'Required action met' : hms(o.a.due - p.t)) + '</div><div>' + esc(o.l.act[o.a.k].t) + '</div><div class="dim">' + esc((function () { try { return o.l.val(p); } catch (e) { return ''; } })()) + '</div></div>'; }).join('') : '<p class="ok big">All LCOs met</p>') + '<p class="dim">' + st.viol + ' violation' + (st.viol === 1 ? '' : 's') + ' this session · <button data-go="core" data-t="ts">Open the full list</button></p>'; },
  crew: function () { if (!S.cfg.crew) return '<h2>Supervisor</h2><p class="dim">Crew orders are switched off in the settings.</p>'; var h2 = CREW.html(); return h2 ? '<div class="crewx">' + h2 + '</div>' : '<h2>👩‍✈️ CRS · ' + CRSN + '</h2><p class="dim">' + (MS.phase() === 'free' && S.p.x.tb.gen ? 'No orders at the moment. The next one will come along soon.' : 'The supervisor gives orders in free play with the generator on line.') + '</p>'; }
};
var MV_CSS = 'html,body{margin:0;height:100%;background:#071019;color:#e8eef4;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}body{display:flex;flex-direction:column}header{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 10px;background:#0d1a27;border-bottom:1px solid #22384d;font-size:13px}header b{margin-right:auto}header span{display:flex;gap:4px;align-items:center;opacity:.9}' +
  'button,select{background:rgba(127,209,255,.1);border:1px solid rgba(127,209,255,.35);color:#e8eef4;border-radius:8px;padding:5px 9px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#ffd34a;color:#1a1300;border-color:#ffd34a;font-weight:800}select{background:#0d1a27;max-width:100%}' +
  'main{flex:1;display:grid;gap:6px;padding:6px;min-height:0}main.g1{grid-template:1fr/1fr}main.g2{grid-template:1fr/1fr 1fr}main.g4{grid-template:1fr 1fr/1fr 1fr}main.g6{grid-template:1fr 1fr/1fr 1fr 1fr}' +
  '.tile{background:#0a1520;border:1px solid #22384d;border-radius:10px;display:flex;flex-direction:column;min-height:0;min-width:0;overflow:hidden}.th{padding:4px;border-bottom:1px solid #1a2c3d}.cv{flex:1;width:100%;height:100%;min-height:0;object-fit:contain;display:block}.hp{flex:1;overflow:auto;padding:10px 14px}' +
  'h2{margin:.1em 0 .4em;font-size:1.25em}h2 small{font-size:.65em;opacity:.7;font-weight:600}h3{margin:.6em 0 .3em;font-size:1em;color:#9fc9ea}.big{font-size:1.5em;font-weight:800}.dim{opacity:.7;font-size:.9em}.ok{color:#8fe8a8;font-weight:700}.bad{color:#ff9f8f;font-weight:700}' +
  '.bar{height:8px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin:4px 0 8px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#59e0ff,#ffd34a)}.bar.sm{height:5px;margin:6px 0 0}' +
  '.cur{background:rgba(255,211,74,.06);border:1px solid rgba(255,211,74,.35);border-radius:10px;padding:10px;margin-bottom:8px}.now{margin:8px 0;padding:8px 10px;border-radius:9px;background:rgba(89,224,255,.1);border:1px solid rgba(89,224,255,.45)}.now span{display:inline-block;font-size:11px;font-weight:900;background:#59e0ff;color:#001;border-radius:5px;padding:1px 6px;margin-right:6px}.st{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.88em;color:#7fd1ff}.row{display:flex;gap:6px;flex-wrap:wrap}button.go{background:#ffd34a;color:#1a1300;font-weight:800;border-color:#ffd34a}' +
  '.cl{padding-left:0;list-style:none;margin:0}.cl li{display:flex;gap:8px;padding:4px 2px;border-bottom:1px solid rgba(255,255,255,.05);font-size:.95em}.cl li.d{opacity:.55}.cl li.c{color:#ffd34a;font-weight:700}' +
  '.rds{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.rd{background:rgba(255,255,255,.04);border-radius:9px;padding:6px 9px;display:flex;flex-direction:column}.rd span{font-size:.78em;color:#7fa6c6;text-transform:uppercase;letter-spacing:.04em}.rd b{font:800 1.35em ui-monospace,Menlo,Consolas,monospace}.rd em{font-style:normal;font-size:.78em;opacity:.7}.rd.bad{background:rgba(255,90,72,.18)}.rd.bad b{color:#ff9f8f}' +
  '.lco i,.lcoc .big{font-style:normal;font-family:ui-monospace,Menlo,Consolas,monospace}.lcoc{background:rgba(255,201,74,.08);border:1px solid rgba(255,201,74,.45);border-radius:10px;padding:9px 11px;margin-bottom:7px}.lcoc.v{background:rgba(255,90,72,.15);border-color:#ff5a48}' +
  '.crewx .crh{display:flex;gap:8px;color:#9fc9ea}.crewx .crh span{margin-left:auto;font-size:11px;color:#ffd34a;text-transform:uppercase}.crewx .crm{font-size:1.1em;margin:8px 0}.crewx .crm.bad{color:#ff9f8f}.crewx .crm.ok{color:#8fe8a8}.crewx .crm.lco{color:#ffd34a}.crewx .crb{display:flex;flex-direction:column;gap:6px}.crewx .crb.row{flex-direction:row}.crewx button{text-align:left;padding:9px 11px}.crewx .go{background:#ffd34a;color:#1a1300;font-weight:800}.crewx .crt em{display:block;font-style:normal;color:#7fd1ff;font-family:ui-monospace,Menlo,Consolas,monospace;margin-top:4px}';
function multiMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var c = S.cfg, n = MULTI.count(), api = 'getScreenDetails' in window;
  var sl = function (k, lbl, min, max, st, val, unit) { return '<label class="mvsl"><span>' + lbl + '</span><input type="range" data-sl="' + k + '" min="' + min + '" max="' + max + '" step="' + st + '" value="' + val + '"><b data-v="' + k + '">' + val + unit + '</b></label>'; };
  menu('<h1>🖥 Multiple monitors</h1><p class="cpnsub">' + (n ? n + ' screen window' + (n === 1 ? '' : 's') + ' open' : 'Use your other screens') + '</p>' +
    '<h2>1 · Screen windows (recommended)</h2><p>Opens extra windows for your other monitors. Each one is a grid of tiles, and each tile can show any plant computer screen (core monitor, trends, alarms, the whole-plant mimic, 1/M) or a live panel: the <b>checklist</b> with its NOW box, the <b>reactor instruments</b>, <b>Tech Specs</b> timers, or the <b>supervisor</b>, whose repeat-backs you can answer right there. Buttons such as “Show me” and “Check it” work the main screen.</p>' +
    (api ? '<p class="cmnote">Your browser can put the windows on the other monitors for you. The first time, it asks permission to “manage windows on all your displays”.</p>' : '<p class="cmnote">Your browser can’t place windows itself: drag each new window onto another monitor, then press ⛶ Full screen in it. (Chrome and Edge can place them automatically.)</p>') +
    '<div class="cpnbtns"><button class="cpnb" data-a="auto2">🖥🖥 Open 2 screen windows' + (api ? ' on my other monitors' : '') + '</button><button class="cpnb2" data-a="o0">Open screen 2</button><button class="cpnb2" data-a="o1">Open screen 3</button>' + (n ? '<button class="cpnb2" data-a="closeall">Close screen windows</button>' : '') + '</div>' +
    '<h2>2 · Triple view across all three screens</h2><p>Draws the control room with three cameras side by side, each turned by one screen’s width, so the side monitors show what’s really to your left and right instead of a stretched picture. Make this window span all three monitors first: drag its edges across them, or set up NVIDIA Surround / AMD Eyefinity so Windows sees one wide screen, then press F11.</p>' +
    '<div class="cpnseg"><button data-a="tri" data-v="0" aria-pressed="' + !c.tri + '">Single screen</button><button data-a="tri" data-v="1" aria-pressed="' + !!c.tri + '">Triple view</button></div>' +
    sl('triBezel', 'Bezel gap (angle hidden behind the monitor frames)', 0, 8, 0.5, c.triBezel || 0, '°') + sl('triFov', 'Field of view on each screen', 0.7, 1.3, 0.05, c.triFov || 1, '×') +
    '<p class="cmnote">Window size now: ' + root.clientWidth + ' × ' + root.clientHeight + ' (' + (root.clientWidth / Math.max(1, root.clientHeight)).toFixed(2) + ':1). Three 16:9 monitors side by side are about 5.3:1. Triple view draws the room three times, so it needs a decent graphics card: use Low graphics if it stutters.</p>' +
    '<h2>Or both</h2><p>Triple view on a window across two monitors is a bit cramped. A nice set-up: the 3D room on your middle monitor and a screen window on each side.</p><div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button></div>', function (a, b) {
    if (a === 'x') closeMenu(); if (a === 'auto2') MULTI.auto(2); if (a === 'o0' || a === 'o1') { var k = +a[1]; MULTI.open(k, MULTI.rects && MULTI.rects[k] ? MULTI.rects[k] : null); multiMenu(); } if (a === 'closeall') { MULTI.closeAll(); multiMenu(); }
    if (a === 'tri') { c.tri = b.dataset.v === '1'; saveCfg(); OFS.w = -1; if (POST.on) POST.size(root.clientWidth, root.clientHeight); multiMenu(); toast(c.tri ? 'Triple view on. Stretch this window across all three monitors.' : 'Back to a single view.'); } });
  [].forEach.call(S.menu.querySelectorAll('[data-sl]'), function (r) { r.addEventListener('input', function () { var k = r.dataset.sl; c[k] = +r.value; S.menu.querySelector('[data-v=' + k + ']').textContent = r.value + (k === 'triBezel' ? '°' : '×'); saveCfg(); }); });
}
window.addEventListener('beforeunload', function () { try { MULTI.closeAll(); } catch (e) {} });

/* ================================================================ procedures: EOPs and the cooldown ================================================================
   Westinghouse-style emergency operating procedures (E-0, ES-0.1, E-1, E-3, ES-1.1) and GOP-305 (hot standby to cold shutdown).
   Steps tick themselves when the plant gets there; branch steps pick the next procedure the way the real diagnostic steps do. */
function rhrQ(p) { var x = p.x; if (!x.sdc || x.pz.P > 30) return 0; var n = (busOn(x, 'EA') ? 1 : 0) + (busOn(x, 'EB') ? 1 : 0); return n * 0.12 * Math.max(0, p.Tavg - 35); }
function cdRate(p) { var h = p.hist; if (h.length < 300) return 0; var a = h[Math.max(0, h.length - 600)], b = h[h.length - 1]; return (a[2] - b[2]) / Math.max(60, b[0] - a[0]) * 3600; }
function sdmCold(p) { return sdmPcm(p) - mtc(p) * (60 - p.Tavg); }
var X0 = function () { return S.p.x; };
var PROCS = {
  'E-0': { t: 'E-0 · Reactor trip or safety injection', s: [
    ['Verify reactor trip', 'Rod bottom lights on, trip breakers open, power falling.', function (p) { return p.tripped && p.n < 0.05; }],
    ['Verify turbine trip', 'All turbine stop valves shut (turbine board).', function (p) { return !p.x.tb.latched; }],
    ['Verify power to the safety buses', 'Both safety buses live, from offsite or the diesels (board 11).', function (p) { return busOn(p.x, 'EA') && busOn(p.x, 'EB'); }],
    ['Check if SI is actuated or required', 'SI lamps on board 1. Required if pressuriser pressure is below 127 bar or containment above 0.3 bar.', function () { return true; }, function (p) { var x = p.x; return !x.si.on && x.pz.P > 127 && x.ct.P < 0.3 ? 'ES-0.1' : null; }],
    ['Verify SI and charging pumps running', 'Both SI pumps and both charging pumps (boards 1 and 3).', function (p) { var x = p.x; return x.si.pumps.every(Boolean) && x.cv.ccp.every(Boolean); }],
    ['Verify feedwater isolation and AFW flow', 'Main feed isolated, auxiliary feed pumps running (board 7).', function (p) { var x = p.x; return !!x.fwIso && (x.mdafw.some(Boolean) || x.tdafw); }],
    ['Verify containment isolation phase A', 'Phase A lamp on board 1.', function (p) { return p.x.si.phaseA; }],
    ['Check RCS temperature controlled', 'Tavg held near 292 °C by the steam dumps or SG PORVs. Stop any uncontrolled cooldown (close MSIVs).', function (p) { return p.Tavg > 280 && p.Tavg < 298; }],
    ['Check RCP trip criteria', 'If SI is injecting and subcooling is below 15 °C, stop all four RCPs (board 5).', function (p) { return !(crx().sub < 15 && p.x.si.flow > 5 && p.x.rcpOn.some(Boolean)); }],
    ['Diagnose: faulted or ruptured SG, or LOCA?', 'Radiation on the steam side → E-3. Containment pressure, sump or radiation up → E-1. Neither → SI termination (ES-1.1).', function () { return true; }, function (p) { var f = p.x.f || {}; return f.msb ? 'E-2' : f.sgtl ? 'E-3' : (crx().brk > 0.2 || p.x.ct.P > 0.1) ? 'E-1' : 'ES-1.1'; }]] },
  'ES-0.1': { t: 'ES-0.1 · Reactor trip response', s: [
    ['Check RCS temperature stabilising', 'Tavg within 3 °C of 291.7 on the steam dumps (STEAM PRESS mode).', function (p) { return Math.abs(p.Tavg - 291.7) < 3; }],
    ['Check SG levels with feed', 'All four SG levels 25–65% with AFW or a main feed pump.', function (p) { return p.x.sg.every(function (s) { return s.L > 25 && s.L < 65; }); }],
    ['Check pressuriser pressure and level', 'Pressure 150–160 bar, level above 17% with charging and letdown in service.', function (p) { var z = p.x.pz; return z.P > 150 && z.P < 160 && z.L > 17; }],
    ['Check all rods fully inserted', 'Every rod on the bottom (DRPI).', function (p) { return BANKS.every(function (b) { return p.rods[b] <= 0; }); }],
    ['Check shutdown margin', 'At least 1300 pcm. Borate if not.', function (p) { return sdmPcm(p) >= 1300; }],
    ['Stabilise at hot standby', 'Plant steady in MODE 3. For a cooldown start GOP-305.', function () { return D.mode === 3; }]] },
  'E-1': { t: 'E-1 · Loss of reactor or secondary coolant', s: [
    ['Check RCP trip criteria', 'Subcooling below 15 °C with SI running: all RCPs stopped.', function (p) { return !(crx().sub < 15 && p.x.rcpOn.some(Boolean)); }],
    ['Check SG levels', 'AFW feeding; narrow-range levels above 10%.', function (p) { return p.x.sg.every(function (s) { return s.L > 10; }); }],
    ['Check PORVs and block valves', 'Both PORVs shut (or their block valves shut).', function (p) { var z = p.x.pz; return ![0, 1].some(function (i) { return z.porv[i] && z.blk[i]; }); }],
    ['Cool down and depressurise the RCS', 'Lower the steam dump setpoint to cool at up to 55 °C/h: lower RCS pressure lets more SI water in. Target Tavg below 260 °C.', function (p) { return p.Tavg < 260; }],
    ['Check core cooling', 'RVLIS above 62% (core covered) and core exit temperature below saturation.', function () { return crx().rvl > 62 && crx().sub > 0; }],
    ['Check RWST level', 'Above 30%. Below that, switch to sump recirculation (ES-1.3).', function (p) { return p.x.si.rwst > 30; }],
    ['Go to cold shutdown', 'When pressure is below 28 bar, place RHR in shutdown cooling (GOP-305).', function (p) { return p.x.pz.P < 28; }, function () { return 'GOP-305'; }]] },
  'E-3': { t: 'E-3 · Steam generator tube rupture', s: [
    ['Identify the ruptured SG', 'N-16 and air ejector radiation, SG 1 level rising with no feed: SG 1.', function () { return true; }],
    ['Isolate the ruptured SG', 'Close MSIV 1 (board 8) and stop feeding SG 1.', function (p) { return !p.x.sg[0].msiv; }],
    ['Cool down on the intact SGs', 'Dump steam from SGs 2–4 until Tavg is below 265 °C, so the RCS will be subcooled at the ruptured SG’s pressure.', function (p) { return p.Tavg < 265; }],
    ['Depressurise the RCS to the ruptured SG pressure', 'Pressuriser spray or a PORV: RCS pressure within 10 bar of steam pressure stops the leak.', function (p) { return p.x.pz.P < p.Ps + 10; }],
    ['Terminate SI', 'Subcooling above 15 °C and pressuriser level above 10%: reset SI and stop the SI pumps.', function (p) { return !p.x.si.pumps.some(Boolean); }],
    ['Go to cold shutdown', 'Continue with GOP-305.', function () { return true; }, function () { return 'GOP-305'; }]] },
  'ES-1.1': { t: 'ES-1.1 · SI termination', s: [
    ['Check SI termination criteria', 'Subcooling above 15 °C, pressuriser level above 10%, pressure stable.', function (p) { return crx().sub > 15 && p.x.pz.L > 10; }],
    ['Reset SI', 'SI RESET (board 1, or the procedure panel).', function (p) { return !p.x.si.on; }],
    ['Stop the SI pumps', 'Leave the charging pumps running.', function (p) { return !p.x.si.pumps.some(Boolean); }],
    ['Restore charging and letdown', 'Pressuriser level back on programme with letdown in service.', function (p) { return !p.x.cv.ltdIso; }],
    ['Go to the trip response', '', function () { return true; }, function () { return 'ES-0.1'; }]] },
  'E-2': { t: 'E-2 · Faulted steam generator isolation', s: [
    ['Identify the faulted SG', 'Pressure falling fast and out of step with the others: SG 2.', function () { return true; }],
    ['Isolate the faulted SG', 'Close MSIV 2 (board 8) and stop all feed to SG 2: feed regulating valve and AFW valve to MAN, closed.', function (p) { var s = p.x.sg[BRK_SG]; return !s.msiv && s.feed < 0.5; }],
    ['Check the RCS cooldown has stopped', 'Once SG 2 boils dry, Tavg stops falling.', function (p) { return cdRate(p) < 15 && crx().lp && Math.abs(crx().lp[BRK_SG] - crx().lp[0]) < 25; }],
    ['Go to SI termination', '', function () { return true; }, function () { return 'ES-1.1'; }]] },
  'AOP-DR': { t: 'AOP · Dropped rod', s: [
    ['Put rod control in MANUAL', 'Stops AUTO from pulling the other rods out to make up for it.', function (p) { return p.sel === 'MAN'; }],
    ['Reduce power below 75%', 'Tech Spec 3.1.4 and the tilt: turbine load down, Tavg on Tref.', function () { return rtp() < 75; }],
    ['Recover the dropped rod', 'Procedure panel: Recover dropped rod (withdraws it to its group position).', function (p) { return !(p.x.f && p.x.f.drop); }],
    ['Check QPTR below 1.02', 'Tilt gone once the rod is back.', function () { return (crx().qptr || 1) < 1.02; }]] },
  'GOP-305': { t: 'GOP-305 · Hot standby to cold shutdown', s: [
    ['Borate to the cold shutdown boron', 'Shutdown margin must stay above 1300 pcm at 60 °C. Cooling adds reactivity (the moderator coefficient), so borate first.', function (p) { return sdmCold(p) >= 1300; }],
    ['Lower pressuriser pressure below P-11 and block SI', 'Pressuriser pressure setpoint down; below 136 bar block low-pressure and steam-line SI.', function (p) { var s = p.x.si; return p.x.pz.P < 136 && s.blkP && s.blkS; }],
    ['Bypass P-12 on the steam dumps', 'Otherwise the dumps lock out below 286 °C.', function (p) { return !!p.x.p12b; }],
    ['Cool down to MODE 4 (below 177 °C)', 'Lower the steam dump pressure setpoint. Tech Spec 3.4.3: no faster than 55 °C/h.', function (p) { return p.Tavg < 177; }],
    ['Isolate the accumulators below 69 bar', 'Otherwise they dump into the RCS as pressure falls.', function (p) { return p.x.pz.P < 69 && p.x.si.acc.every(function (a) { return !a; }); }],
    ['Reduce RCS pressure below 28 bar', 'RHR suction valves are interlocked shut above it.', function (p) { return p.x.pz.P < 28; }],
    ['Place RHR in shutdown cooling', 'Start both trains (procedure panel).', function (p) { return !!p.x.sdc; }],
    ['Stop all but one RCP', 'Keep one running for mixing and pressuriser spray.', function (p) { return p.x.rcpOn.filter(Boolean).length <= 1; }],
    ['Cool to MODE 5 (below 93 °C)', 'RHR takes it the rest of the way.', function () { return D.mode === 5; }]] }
};
var PROC = { id: null, i: 0, done: 0,
  start: function (id) { PROC.id = id; PROC.i = 0; S.addLog('Procedure entered: ' + PROCS[id].t); toast('📘 ' + PROCS[id].t, 'warn'); PROC.draw(true); },
  tick: function () { if (!PROC.id || !S.p) return; var P = PROCS[PROC.id], s = P.s[PROC.i], p = S.p, ok = false; if (!s) return; try { ok = s[2](p); } catch (e) {}
    if (ok) { var nx = s[3] ? s[3](p) : null; S.addLog(PROC.id + ' step ' + (PROC.i + 1) + ' done: ' + s[0]); CAR.add(8, PROC.id + ' step'); if (nx) { PROC.start(nx); return; } PROC.i++; if (PROC.i >= P.s.length) { S.addLog(P.t + ' complete'); toast('✔ ' + P.t + ' complete', 'ok'); CAR.add(80, P.t); PROC.done++; PROC.id = null; } PROC.draw(true); } else PROC.draw(); },
  html: function () { if (!PROC.id) return ''; var P = PROCS[PROC.id], s = P.s[PROC.i]; if (!s) return ''; var p = S.p, x = p.x;
    return '<div class="crh">📘 <b>' + esc(P.t) + '</b><span>step ' + (PROC.i + 1) + '/' + P.s.length + '</span></div><div class="crm">' + esc(s[0]) + '</div><div class="crt">' + esc(s[1]) + '<em>Tavg ' + p.Tavg.toFixed(1) + ' °C · RCS ' + x.pz.P.toFixed(0) + ' bar · subcool ' + crx().sub.toFixed(0) + ' °C · cooldown ' + cdRate(p).toFixed(0) + ' °C/h · MODE ' + D.mode + '</em></div><div class="crb row"><button data-pm="1">🎛 Controls</button><button data-pq="1">✖ Exit procedure</button></div>'; },
  draw: function (f) { var E = PROC.el; if (!E) return; E.hidden = !PROC.id || !!S.menu; if (E.hidden) return; PROC.T = (PROC.T || 0) + 1; if (!f && PROC.T % 5) return; var h2 = PROC.html(); if (E._h !== h2) { E._h = h2; E.innerHTML = h2; } }
};
function procBuild() { var E = PROC.el = h('div', 'cpncrew cpnproc', null, root); E.hidden = true; E.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); E.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init(); if (b.dataset.pm) procMenu(); if (b.dataset.pq) { PROC.id = null; PROC.draw(true); } }); }
function procMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var p = S.p, x = p.x, z = x.pz, sl = function (k, l, mn, mx, v, u) { return '<label class="mvsl"><span>' + l + '</span><input type="range" data-ps="' + k + '" min="' + mn + '" max="' + mx + '" step="1" value="' + Math.round(v) + '"><b data-pv="' + k + '">' + Math.round(v) + u + '</b></label>'; }, bt = function (a, l, on) { return '<button class="cpnb2" data-a="' + a + '"' + (on != null ? ' aria-pressed="' + !!on + '"' : '') + '>' + l + '</button>'; };
  menu('<h1>📘 Procedures</h1><p class="cpnsub">MODE ' + D.mode + ' · ' + MODEN[D.mode] + ' · Tavg ' + p.Tavg.toFixed(1) + ' °C · RCS ' + z.P.toFixed(1) + ' bar · cooldown rate ' + cdRate(p).toFixed(0) + ' °C/h · cold SDM ' + Math.round(sdmCold(p)) + ' pcm</p>' +
    '<p>E-0 starts by itself after a trip in free play and branches like the real one. Start any procedure here. Steps tick themselves when the plant gets there.</p><div class="cpnbtns">' + Object.keys(PROCS).map(function (k) { return bt('pr" data-p="' + k, (PROC.id === k ? '▶ ' : '') + esc(PROCS[k].t)); }).join('') + '</div>' +
    '<h2>Cooldown controls</h2>' + sl('dump', 'Steam dump pressure setpoint', 1, 80, x.dumpSet || PSP, ' bar') + sl('pz', 'Pressuriser pressure setpoint', 15, 155, x.pzSet || 155, ' bar') +
    '<div class="cpnbtns">' + bt('p12', 'P-12 bypass', x.p12b) + bt('blk', 'Block SI (P-11)', x.si.blkP && x.si.blkS) + bt('acc', 'Isolate accumulators', x.si.acc.every(function (a) { return !a; })) + bt('sdc', 'RHR shutdown cooling', x.sdc) + bt('smp', '🧪 Request a boron sample') + bt('crev', 'CR emergency ventilation', x.crev) + bt('byp', 'Bypass failed channel') + bt('exam', '🎓 Start simulator exam') + bt('rec', 'Recover dropped rod') + bt('bu0', 'Fuel: start of cycle', (x.bu || 0) < 3000) + bt('bu1', 'Middle of cycle', (x.bu || 0) >= 3000 && x.bu < 14000) + bt('bu2', 'End of cycle', (x.bu || 0) >= 14000) + bt('sir', 'Reset SI') + bt('sip', 'Stop SI pumps') + '</div>' +
    '<h2>Chemistry and habitability</h2><p>' + (function () { var c = chem(p); return 'Last lab result: ' + (c.last ? 'boron ' + c.last.B + ' ppm, DE I-131 ' + c.last.I + ' µCi/g, H₂ ' + c.last.H + ' cc/kg, O₂ ' + c.last.O + ' ppm (' + Math.round((p.t - c.last.at) / 60) + ' min old)' : 'none yet') + (c.req.length ? ' · ' + c.req.length + ' sample(s) at the lab' : '') + '. Control room ' + (x.crRad || 0.08).toFixed(2) + ' µSv/h, crew dose ' + (x.crDose || 0).toFixed(3) + ' mSv (emergency limit 50 mSv).'; })() + '</p>' + '<p class="cmnote">Real interlocks: SI blocks only below 136 bar (P-11); RHR suction only below 30 bar. Tech Spec 3.4.3 limits the cooldown to 55 °C/h. Below about 120 °C the steam generators stop working well and RHR has to take over.</p><div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button></div>', function (a, b) {
    if (a === 'x') closeMenu(); if (a === 'pr') { PROC.start(b.dataset.p); closeMenu(); return; }
    if (a === 'rec') { if (!(x.f && x.f.drop)) toast('No dropped rod.', 'warn'); else if (rtp() > 75 || p.sel !== 'MAN') toast('Rods in MAN and power below 75% first.', 'warn'); else { x.f.drop = false; S.addLog('Dropped rod H-08 recovered'); } }
    if (a === 'bu0' || a === 'bu1' || a === 'bu2') { setBurnup(p, [150, 9000, 17000][+a[2]]); S.addLog('Fuel cycle set to ' + Math.round(x.bu) + ' MWd/tU, boron adjusted to ' + Math.round(p.boron) + ' ppm'); }
    if (a === 'smp') { var ch = chem(p); ch.req.push({ t: p.t, due: p.t + 1200, B: p.boron, I: ch.i131, H: ch.h2, O: ch.o2 }); toast('🧪 Sample sent to the lab: results in about 20 minutes of plant time.', 'ok'); }
    if (a === 'crev') { x.crev = !x.crev; x.crevOff = !x.crev; S.addLog('CREVS ' + (x.crev ? 'started' : 'stopped')); }
    if (a === 'byp') { if (!x.inF || x.inF.sel) toast('No failed channel found.', 'warn'); else { x.inF.sel = true; S.addLog('Failed instrument channel bypassed / deselected'); toast('Channel bypassed. Write it in the log and raise a work order.', 'ok'); } }
    if (a === 'exam') { EXAM.start(); return; }
    if (a === 'p12') x.p12b = !x.p12b; if (a === 'blk') { if (z.P < 136) { x.si.blkP = x.si.blkS = true; } else toast('Can’t block SI above P-11 (136 bar).', 'warn'); }
    if (a === 'acc') { if (z.P < 69 || !x.si.acc.every(function (q) { return !q; })) x.si.acc = x.si.acc.map(function () { return z.P >= 69; }); if (z.P >= 69) toast('Accumulators stay open above 69 bar (Tech Spec 3.5.1).', 'warn'); }
    if (a === 'sdc') { if (!x.sdc && z.P > 30) toast('RHR suction valves are interlocked shut above 30 bar.', 'warn'); else { x.sdc = !x.sdc; x.si.rhr = [false, false]; S.addLog('RHR shutdown cooling ' + (x.sdc ? 'started' : 'stopped')); } }
    if (a === 'sir') { if (x.si.on && p.t - x.si.at < 60) toast('SI reset is allowed 60 s after actuation.', 'warn'); else { x.si.on = false; S.addLog('SI reset'); } } if (a === 'sip') { if (x.si.on) toast('Reset SI first.', 'warn'); else { x.si.pumps = [false, false]; S.addLog('SI pumps stopped'); } }
    if (a !== 'x') procMenu(); });
  [].forEach.call(S.menu.querySelectorAll('[data-ps]'), function (r) { r.addEventListener('input', function () { var v = +r.value; if (r.dataset.ps === 'dump') x.dumpSet = v; else x.pzSet = v; S.menu.querySelector('[data-pv=' + r.dataset.ps + ']').textContent = v + ' bar'; }); });
}
/* ================================================================ instrument failures and simulator exam ================================================================ */
var INF = [
  { id: 'pr', t: 'Power range channel N42 fails high', d: 'N42 reads 120%.', a: 'Trip its bistables (bypass the channel). The other three still protect the core.' },
  { id: 'prl', t: 'Power range channel N43 fails low', d: 'N43 reads 0%.', a: 'Bypass the channel; check the others agree with the calorimetric.' },
  { id: 'pzp', t: 'Controlling pressuriser pressure channel fails high', d: 'The controller sees +12 bar: sprays open, heaters off, real pressure falls.', a: 'Select the other channel (or spray and heaters to MANUAL) before the low-pressure trip at 134 bar.' },
  { id: 'sgl', t: 'SG 3 controlling level channel fails high', d: 'The feed controller sees +25%: it shuts the feed valve and the real level falls.', a: 'Feed valve 3 to MANUAL (or select the other channel) before the low-low trip at 17%.' },
  { id: 'tav', t: 'Tavg channel fails high', d: 'Rod control sees Tavg 6 °C high and drives rods in.', a: 'Rod control to MANUAL, restore Tavg to Tref.' }];
function infOn(x, id) { var f = x.inF; return !!(f && f.id === id && !f.sel); }
function infDetail() { var x = S.p.x; return x.inF ? INF.filter(function (q) { return q.id === x.inF.id; })[0] : null; }
function infInsert(id) { var x = S.p.x; x.inF = { id: id, t: S.p.t, sel: false }; S.addLog('INSTRUCTOR: instrument failure inserted'); }
/* random events: equipment faults and instrument failures that just happen in free play, if the setting allows */
var RNDE = { T: 0, tick: function (sim) { if (CRISIS.on || WATCH.on || !S.cfg.randEv || EXAM.on || !S.p || S.p.tripped || MS.phase() !== 'free') return; var x = S.p.x; if (FAULT.active().length || (x.inF && !x.inF.sel)) return;
  RNDE.T += sim; if (RNDE.T < 600) return; RNDE.T = 0; if (Math.random() > 0.12) return; /* about one event every 1.5 hours of plant time */
  var c = FAULT.list.filter(function (q) { return ['grid', 'lb'].indexOf(q.id) < 0 && !(x.f && x.f[q.id]); }); FAULT.insert(c[Math.floor(Math.random() * c.length)].id, true); } };
var EXAM = { on: false,
  start: function () { atPowerStart(); var x = S.p.x, inf = INF[Math.floor(Math.random() * INF.length)], fl = FAULT.list.filter(function (q) { return ['porv', 'mfpA', 'sgtl', 'drop', 'ccw', 'air', 'loca'].indexOf(q.id) >= 0; }), ft = fl[Math.floor(Math.random() * fl.length)];
    EXAM.on = true; EXAM.t0 = S.p.t; EXAM.inf = inf.id; EXAM.f = ft.id; EXAM.ev = []; EXAM.trips0 = S.st.trips; EXAM.viol0 = TS.st().viol; EXAM.rb0 = CREW.stats().wrong; EXAM.done = false;
    S.addLog('SIMULATOR EXAM started'); closeMenu(); CREW.say('Exam scenario. You have the shift at about 50% power. Operate the plant safely, follow procedures and Tech Specs. I will ask for a diagnosis at the end.', 'lco'); },
  tick: function () { if (!EXAM.on || !S.p) return; var p = S.p, x = p.x, el = p.t - EXAM.t0;
    if (el > 90 && !x.inF && !EXAM.e1) { EXAM.e1 = true; infInsert(EXAM.inf); }
    if (el > 480 && !EXAM.e2) { EXAM.e2 = true; FAULT.insert(EXAM.f, true); }
    if (x.inF && x.inF.sel && !EXAM.byp) EXAM.byp = p.t - x.inF.t;
    if (crx().dmg) EXAM.dmg = true;
    if (el > 1500 && !EXAM.done) EXAM.finish(); },
  finish: function () { EXAM.done = true; if (!S.menu) S.wasPaused = S.paused; setPause(true); var opts = function (list, ans, k) { var o = list.slice().sort(function () { return Math.random() - 0.5; }); return o.map(function (q) { return '<label class="exq"><input type="radio" name="' + k + '" value="' + q.id + '"> ' + esc(q.t) + '</label>'; }).join(''); };
    menu('<h1>🎓 Exam: diagnosis</h1><p>Before your score: what went wrong?</p><h2>1. Which instrument failed?</h2>' + opts(INF, EXAM.inf, 'qi') + '<h2>2. What was the plant fault?</h2>' + opts(FAULT.list.filter(function (q) { return ['porv', 'mfpA', 'sgtl', 'drop', 'ccw', 'air', 'loca'].indexOf(q.id) >= 0; }), EXAM.f, 'qf') + '<div class="cpnbtns"><button class="cpnb" data-a="sub">Submit</button></div>', function (a) { if (a !== 'sub') return; var g = function (n) { var r = S.menu.querySelector('input[name=' + n + ']:checked'); return r ? r.value : ''; }; EXAM.report(g('qi') === EXAM.inf, g('qf') === EXAM.f); }); },
  report: function (qi, qf) { var p = S.p, st = TS.st(), trips = S.st.trips - EXAM.trips0, viol = st.viol - EXAM.viol0, wr = CREW.stats().wrong - EXAM.rb0, big = ['loca', 'sgtl', 'ccw', 'air'].indexOf(EXAM.f) >= 0, L = [], sc = 100;
    var add = function (ok, txt, pen) { L.push([ok, txt]); if (!ok) sc -= pen; };
    add(!EXAM.dmg, 'No fuel or core damage', 100);
    add(EXAM.byp != null && EXAM.byp < 600, EXAM.byp != null ? 'Failed instrument dealt with in ' + hms(EXAM.byp) : 'Failed instrument never bypassed or deselected', 20);
    add(big ? true : trips === 0, big ? 'Major fault: tripping was acceptable' : (trips ? 'Avoidable reactor trip' : 'Kept the unit on line'), 20);
    add(viol === 0, viol ? viol + ' Tech Spec violation(s)' : 'No Tech Spec violations', 15 * Math.max(1, viol));
    add(wr === 0, wr ? wr + ' wrong repeat-back(s)' : 'Three-way communication all correct', 5 * Math.max(1, wr));
    add(qi, 'Diagnosed the instrument failure' + (qi ? '' : ' (it was: ' + infDetail().t + ')'), 10);
    add(qf, 'Diagnosed the plant fault' + (qf ? '' : ' (it was: ' + FAULT.list.filter(function (q) { return q.id === EXAM.f; })[0].t + ')'), 10);
    sc = Math.max(0, sc); var pass = sc >= 80 && !EXAM.dmg; EXAM.on = false; CAR.add(pass ? 300 : 60, 'Simulator exam ' + (pass ? 'passed' : 'attempted')); S.addLog('SIMULATOR EXAM: ' + sc + '% ' + (pass ? 'PASS' : 'FAIL'));
    menu('<h1>' + (pass ? '✅ Exam passed' : '❌ Exam not passed') + '</h1><p class="cpnsub">Score ' + sc + '% · pass mark 80%</p><div class="cpnscore">' + L.map(function (r) { return '<span>' + (r[0] ? '✔ ' : '✖ ') + esc(r[1]) + '</span><span></span>'; }).join('') + '</div><p>Instrument failure: ' + esc(infDetail().t) + '. ' + esc(infDetail().a) + '</p><div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button><button class="cpnb2" data-a="again">Another exam</button></div>', function (a) { if (a === 'x') closeMenu(); if (a === 'again') EXAM.start(); }); }
};
/* ================================================================ alarm response procedures, chemistry, control room habitability ================================================================ */
var ARP = [
  [/TRIP/, 'Reactor or turbine trip', 'A protection signal reached its setpoint.', 'Automatic: rods drop / turbine stop valves shut.', 'Go to E-0. Note the first-out alarm for the post-trip review.'],
  [/SAFETY\s*INJECTION|SI PUMP|RHR PUMP/, 'Safety injection', 'Low pressuriser pressure, low steam line pressure or high containment pressure.', 'Automatic: SI and charging pumps start, phase A isolation, feed isolation, AFW and diesels start.', 'E-0. Verify all automatic actions. Do not stop SI until the termination criteria are met (ES-1.1).'],
  [/CTMT|CONTAINMENT|SUMP/, 'Containment pressure, sump or radiation', 'Steam or coolant leaking inside containment: LOCA or steam line break.', 'At 0.3 bar SI; at 1 bar containment spray.', 'Check RCS and SG pressures to find which. Check fan coolers running. Tech Specs 3.6.4 / 3.4.13.'],
  [/N-16|AIR EJECTOR|TUBE LEAK/, 'Primary-to-secondary leak', 'A steam generator tube is leaking.', 'None.', 'Estimate the leak from charging vs letdown. Reduce power; above Tech Spec limits shut down (3.4.13). If large, trip and go to E-3.'],
  [/PZR|PRESSURISER|PORV|SAFETY\s*VALVE|PRT/, 'Pressuriser pressure or level', 'Heater or spray fault, PORV open, controlling channel failed, or a leak.', 'PORVs open at 162 bar; safeties at 172 bar.', 'Compare all pressure and level channels. Controller to MANUAL if one channel has failed. Close the PORV block valve if a PORV sticks open.'],
  [/SG .*LEVEL|STM GEN|FEED|FW/, 'Steam generator level or feed', 'Feed pump trip, feed valve fault, or level channel failure.', 'Low-low level (17%) trips the reactor and starts AFW; high-high (85%) trips the turbine and isolates feed.', 'Compare feed and steam flow. Feed valve to MANUAL if the controller is misbehaving. Reduce load if feed is short.'],
  [/RCP|RCS FLOW|BEARING|VIBRATION|SEAL/, 'Reactor coolant pump', 'Pump trip, cooling water loss, seal or bearing problem.', 'Low flow trips the reactor above P-7.', 'Check CCW to the pumps. Stop a pump with bearing temperature over 95 °C or high vibration (after tripping the reactor if at power).'],
  [/ROD|DRPI|INSERTION/, 'Rods', 'Dropped or misaligned rod, or rods below the insertion limit.', 'None (rod stops on C-1 / C-3 / C-4).', 'Rods to MANUAL. Insertion limit: borate (3.1.6). Dropped rod: AOP dropped rod, Tech Spec 3.1.4.'],
  [/AFD|PR CHANNEL|QPTR|FLUX|NIS/, 'Nuclear instruments and core distribution', 'Axial or radial power shape change, or a failed channel.', 'None.', 'Check the core monitor. AFD: move bank D and borate/dilute. One channel off on its own: bypass it (3.3.1).'],
  [/OTΔT|OPΔT|C-3|C-4|TAVG/, 'Temperature / ΔT', 'Tavg off programme or ΔT close to its trip.', 'C-3/C-4 stop rods and run the turbine back.', 'Bring Tavg to Tref, reduce power. Check pressuriser pressure (OTΔT falls with pressure).'],
  [/DIESEL|EDG|BUS|GRID|TRANSFORMER|DC/, 'Electrical supplies', 'Loss of a bus, the grid or a diesel.', 'Diesels start on undervoltage and close onto dead safety buses.', 'Check both safety buses are powered. Tech Spec 3.8.1.'],
  [/AIR|CCW|SERVICE WATER|COOLING/, 'Cooling water or instrument air', 'Pump trip or compressor failure.', 'Standby pumps may start.', 'Start the standby pump. Loss of air: valves fail safe, prepare to trip. Loss of CCW: RCP bearings heat up.'],
  [/RAD|CONTROL RM/, 'Radiation', 'Radioactivity outside its normal place.', 'High control room radiation starts emergency ventilation.', 'Check the monitors on board 1. Control room: confirm emergency ventilation (CREVS) is running.'],
  [/./, 'General alarm', 'Check the parameter on the boards.', '—', 'Acknowledge, find the cause, restore normal conditions, and log it.']];
function arpFor(l) { var t = l.replace(/\n/g, ' '); for (var i = 0; i < ARP.length; i++) if (ARP[i][0].test(t)) return ARP[i]; }
function arpMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var act = ANN.filter(function (t) { return t.lbl && t.k !== 'status' && t.st !== 'off'; });
  menu('<h1>📟 Alarm response</h1><p class="cpnsub">' + act.length + ' alarm' + (act.length === 1 ? '' : 's') + ' active</p><p>Each annunciator has an alarm response procedure: likely causes, automatic actions, what the operator does. In a big fault dozens come in at once: deal with the trip and safety ones first.</p>' + (act.length ? act.sort(function (a, b) { return (a.k === 'trip' ? 0 : 1) - (b.k === 'trip' ? 0 : 1); }).map(function (t) { var r = arpFor(t.lbl); return '<details class="tsrow on"><summary><b>' + esc(t.lbl.replace(/\n/g, ' ')) + '</b><span>' + esc(r[1]) + '</span><i class="' + (t.k === 'trip' ? 'tsv' : 'tsn') + '">' + (t.k === 'trip' ? 'TRIP' : t.st === 'alert' ? 'NEW' : 'ACK') + '</i></summary><p><b>Likely causes:</b> ' + esc(r[2]) + '</p><p><b>Automatic actions:</b> ' + esc(r[3]) + '</p><p><b>Operator actions:</b> ' + esc(r[4]) + '</p></details>'; }).join('') : '<p class="cmok">No alarms.</p>') + '<div class="cpnbtns"><button class="cpnb" data-a="ack">ACK all</button><button class="cpnb2" data-a="x">Back to the plant</button></div>', function (a) { if (a === 'ack') { ANNC.ack(); arpMenu(); } if (a === 'x') closeMenu(); }); }
/* chemistry: lab boron samples take 20 minutes; iodine activity, hydrogen and oxygen */
function chem(p) { var x = p.x, c = x.chem || (x.chem = { req: [], last: null, i131: 0.02, h2: 32, o2: 0.005 }); return c; }
function chemStep(p, dt) { var x = p.x, c = chem(p), cr = x.core; c.i131 += ((cr && cr.dmg ? 85 : (x.f && x.f.sgtl ? 0.03 : 0.02)) - c.i131) * (1 - Math.exp(-dt / (cr && cr.dmg ? 1800 : 3600)));
  c.o2 += ((p.Tavg < 120 ? 0.5 : 0.005) - c.o2) * (1 - Math.exp(-dt / 3600)); c.h2 += ((p.Tavg < 120 ? 5 : 32) - c.h2) * (1 - Math.exp(-dt / 7200));
  c.req = c.req.filter(function (r) { if (p.t < r.due) return true; c.last = { t: p.t, at: r.t, B: Math.round(r.B + gauss() * 3), I: +(r.I * (1 + gauss() * 0.05)).toFixed(3), H: Math.round(r.H), O: +r.O.toFixed(3) }; bopLog(p, 'Chemistry: boron ' + c.last.B + ' ppm, DE I-131 ' + c.last.I + ' µCi/g (sampled ' + Math.round((p.t - r.t) / 60) + ' min ago)'); if (typeof S !== 'undefined' && S && S.toast) S.toast('🧪 Lab result: boron ' + c.last.B + ' ppm, iodine ' + c.last.I + ' µCi/g', 'ok'); return false; });
  /* control room habitability: radiation reaches the control room after fuel damage with a containment leak path; emergency ventilation (CREVS) filters it */
  var src = (cr && cr.dmg ? 40 : 0) * (cr && cr.brk > 0.2 || x.ct.P > 0.3 ? 1 : 0.1) + 0.08; if ((x.si.on || src > 1) && !x.crev && !x.crevOff) { x.crev = true; bopLog(p, 'Control room emergency ventilation started (' + (x.si.on ? 'safety injection' : 'high radiation') + ')'); }
  x.crRad = 0.08 + (src - 0.08) * (x.crev ? 0.04 : 1); x.crDose = (x.crDose || 0) + x.crRad / 3600 * dt / 1000; }
/* ================================================================ teach mode ================================================================
   When an alarm comes in, a tutor card pauses the plant and explains what it means, why it came in (with the live numbers), and
   exactly what to do, with a button that flies you to the right board. Plus a guided tour of the room and an alarm drill. */
var BOARDN = { esf: '1 · Safety injection & containment', aux: '2 · Cooling water & air', cvcs: '3 · Chemical & volume control', pzr: '4 · Pressuriser', rcs: '5 · Reactor coolant pumps', rx: '6 · REACTOR', sg: '7 · Steam generators & feed', ms: '8 · Main steam & condenser', tb: '9 · Turbine', gen: '10 · Generator & grid', elec: '11 · Electrical & diesels' };
var TOUR = [['start', 'Welcome to the control room', 'You sit at the console in the middle. In front of you is a horseshoe of 11 boards: the primary side (reactor and its cooling) on the left, the reactor in the centre, the secondary side (steam, turbine, electricity) on the right. Each board has meters and lamps at the top, annunciator (alarm) windows above them, and switches on the desk.'],
  ['esf', 'Board 1 · Safety systems', 'Emergency core cooling and containment. Normally you leave it alone: it starts by itself if coolant is lost. Red lamps here mean something serious has happened.'],
  ['aux', 'Board 2 · Support systems', 'Cooling water and instrument air. Boring until they fail: lose cooling water and the coolant pumps overheat; lose air and valves move to their safe positions.'],
  ['cvcs', 'Board 3 · Chemical & volume control', 'Charging and letdown keep the right amount of water in the reactor coolant. The make-up controls add boron (slows the reactor) or dilute it (speeds it up).'],
  ['pzr', 'Board 4 · Pressuriser', 'Keeps the coolant at 155 bar so it can’t boil. Heaters raise pressure, sprays lower it, relief valves (PORVs) open if it gets too high.'],
  ['rcs', 'Board 5 · Reactor coolant', 'Four huge pumps push water through the core. Here you see each loop’s hot and cold leg temperatures and the flow.'],
  ['rx', 'Board 6 · THE REACTOR', 'The most important board: rod controls, the nuclear instruments (how much power), the trip breakers and the big red REACTOR TRIP buttons. This is where you start up and shut down.'],
  ['sg', 'Board 7 · Steam generators & feed', 'Heat from the core boils water in four steam generators. Keep their levels around 50%: too low trips the reactor, too high trips the turbine.'],
  ['ms', 'Board 8 · Main steam', 'Steam pipes, the valves that isolate them (MSIVs), and the steam dumps that dump extra steam to the condenser.'],
  ['tb', 'Board 9 · Turbine', 'Steam spins the turbine at 3000 rpm. Latch it, roll it up to speed, then load it.'],
  ['gen', 'Board 10 · Generator & grid', 'The generator makes the electricity. Synchronise it with the grid, then close the breaker to send power out.'],
  ['elec', 'Board 11 · Electrical', 'Buses and the emergency diesel generators that power the safety systems if the grid is lost.'],
  ['core', 'The core monitor', 'The wall screen shows the power shape, margins and Tech Specs. Click it any time. Tip: turn on 💡 Explain mode and rest the pointer on anything for 3 seconds to learn what it does.']];
var TEACH = { q: [], seen: {}, cur: null, tour: -1,
  live: function (l) { var p = S.p, x = p.x, t = l.replace(/\n/g, ' ');
    if (/PZR|PRESSURISER|PORV/i.test(t)) return 'Pressuriser pressure is ' + x.pz.P.toFixed(1) + ' bar (normal 155), level ' + x.pz.L.toFixed(0) + '%.';
    if (/SG|FEED|STM GEN/i.test(t)) return 'Steam generator levels: ' + x.sg.map(function (s) { return Math.round(s.L) + '%'; }).join(', ') + ' (normal 50%, trip at 17%).';
    if (/RCP|FLOW|BEARING|CCW/i.test(t)) return 'RCPs running: ' + x.rcpOn.filter(Boolean).length + ' of 4. Hottest bearing ' + Math.round(Math.max.apply(null, x.brgT)) + ' °C (trips at 95).';
    if (/AIR/i.test(t)) return 'Instrument air is ' + x.aux.airP.toFixed(1) + ' bar (valves start failing below 4).';
    if (/SAFETY INJ|SI /i.test(t)) return 'SI ' + (x.si.on ? 'IS running' : 'not running') + '. Pressuriser ' + x.pz.P.toFixed(0) + ' bar, containment ' + x.ct.P.toFixed(2) + ' bar g.';
    if (/TRIP/i.test(t)) return p.tripped ? 'The reactor tripped. First out: ' + (TRIPS[p.firstOut] || p.firstOut) + '.' : '';
    if (/ROD|AFD|FLUX|PR /i.test(t)) return 'Power ' + D.pr.toFixed(1) + '%, AFD ' + crx().afdI.toFixed(1) + '%, tilt ' + (crx().qptr || 1).toFixed(3) + '.';
    return ''; },
  tick: function () { if (!S.cfg.teach || !S.p) return; var act = ANN.filter(function (t) { return t.lbl && t.k !== 'status' && t.st !== 'off'; }), fresh = [];
    if (!TEACH.init) { TEACH.init = 1; act.forEach(function (t) { TEACH.seen[t.sec + '|' + t.lbl] = 1; }); return; }
    act.forEach(function (t) { var k = t.sec + '|' + t.lbl; if (!TEACH.seen[k]) { TEACH.seen[k] = 1; fresh.push(t); } });
    Object.keys(TEACH.seen).forEach(function (k) { if (!act.some(function (t) { return t.sec + '|' + t.lbl === k; })) delete TEACH.seen[k]; });
    if (!fresh.length) return; fresh.sort(function (a, b) { return (a.k === 'trip' ? 0 : 1) - (b.k === 'trip' ? 0 : 1); });
    if (fresh.length > 3) TEACH.q.push({ flood: fresh.length, main: fresh[0] }); else fresh.forEach(function (t) { TEACH.q.push({ t: t }); });
    if (!TEACH.cur) TEACH.next(); },
  next: function () { TEACH.cur = TEACH.q.shift() || null; if (TEACH.cur && !S.menu) { S.teachPause = !S.paused; setPause(true); AUD.sfx('btn'); } TEACH.draw(); if (!TEACH.cur && S.teachPause) { S.teachPause = false; setPause(false); } },
  draw: function () { var E = TEACH.el; if (!E) return; var c = TEACH.cur; if (TEACH.tour >= 0) { var T = TOUR[TEACH.tour]; E.hidden = false; E.innerHTML = '<div class="crh">🧑‍🏫 <b>Tour · ' + (TEACH.tour + 1) + ' of ' + TOUR.length + '</b></div><div class="crm">' + esc(T[1]) + '</div><div class="crt">' + esc(T[2]) + '</div><div class="crb row">' + (TEACH.tour ? '<button data-tt="-1">← Back</button>' : '') + '<button data-tt="1" class="go">' + (TEACH.tour < TOUR.length - 1 ? 'Next →' : 'Finish') + '</button><button data-tt="x">Exit tour</button></div>'; return; }
    E.hidden = !c; if (!c) return; var t = c.t || c.main, r = arpFor(t.lbl), L = t.lbl.replace(/\n/g, ' '), lv = TEACH.live(t.lbl), steps = r[4].split(/\.\s+/).filter(Boolean);
    E.innerHTML = '<div class="crh">🧑‍🏫 <b>Teach mode · ' + (c.flood ? c.flood + ' alarms at once' : 'new alarm') + '</b><span>plant paused</span></div>' +
      (c.flood ? '<div class="crt">Lots of alarms came in together. Don’t panic: most are <b>consequences</b> of one event. Deal with the most important first:</div>' : '') +
      '<div class="crm">' + (t.k === 'trip' ? '🔴 ' : '🟡 ') + esc(L) + ' <small>(board ' + esc(BOARDN[t.sec] || t.sec) + ')</small></div>' +
      '<div class="crt"><b>What it means:</b> ' + esc(r[1]) + '. ' + esc(r[2]) + (lv ? '<em>' + esc(lv) + '</em>' : '') + '</div><div class="crt"><b>What happens by itself:</b> ' + esc(r[3]) + '</div>' +
      '<div class="crt"><b>What you do:</b><ol style="margin:4px 0 0 18px;padding:0">' + steps.map(function (x) { return '<li>' + esc(x.replace(/\.$/, '')) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="crb row"><button data-tv="' + esc(t.sec) + '">👁 Show me the board</button><button data-ta="1">📟 All alarm cards</button><button data-tn="1" class="go">' + (TEACH.q.length ? 'Next alarm (' + TEACH.q.length + ') →' : 'Got it, carry on ▶') + '</button></div>'; },
  click: function (b) { AUD.init(); if (b.dataset.tv) goView(b.dataset.tv); if (b.dataset.ta) arpMenu(); if (b.dataset.tn) TEACH.next();
    if (b.dataset.tt) { if (b.dataset.tt === 'x') TEACH.tour = -1; else { TEACH.tour += +b.dataset.tt; if (TEACH.tour >= TOUR.length) TEACH.tour = -1; } if (TEACH.tour >= 0) goView(TOUR[TEACH.tour][0]); else toast('Tour finished. Turn on 💡 Explain mode to learn any control.', 'ok'); TEACH.draw(); } }
};
function teachBuild() { var E = TEACH.el = h('div', 'cpncrew cpnteach', null, root); E.hidden = true; E.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); E.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) TEACH.click(b); }); }
function teachMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true);
  menu('<h1>🧑‍🏫 Teach mode</h1><p>Feeling lost? Teach mode explains the plant as you go.</p><div class="cpnseg"><button data-a="tm" data-v="1" aria-pressed="' + !!S.cfg.teach + '">Teach mode ON</button><button data-a="tm" data-v="0" aria-pressed="' + !S.cfg.teach + '">Off</button></div><p class="cmnote">With it on, every new alarm pauses the plant and a card tells you what the alarm means, the live numbers behind it, what happens automatically and exactly what to do, with a button that flies you to the right board.</p>' +
    '<h2>Lessons</h2><div class="cpnbtns"><button class="cpnb" data-a="tour">🗺 Tour of the control room (2 min)</button><button class="cpnb2" data-a="drill">🚨 Alarm drill: a fault at 50% power, coached</button><button class="cpnb2" data-a="explain">💡 Turn on Explain mode</button></div>' +
    '<p class="cmnote">Also: 📟 shows a response card for every alarm that’s on, 📘 has the procedures, and the checklist card at the top left always says the next thing to do.</p><div class="cpnbtns"><button class="cpnb2" data-a="x">Back to the plant</button></div>', function (a, b) {
    if (a === 'tm') { S.cfg.teach = b.dataset.v === '1'; saveCfg(); TEACH.seen = {}; ANN.forEach(function (t) { if (t.lbl && t.st !== 'off') TEACH.seen[t.sec + '|' + t.lbl] = 1; }); teachMenu(); }
    if (a === 'tour') { closeMenu(); TEACH.tour = 0; goView(TOUR[0][0]); TEACH.draw(); }
    if (a === 'drill') { S.cfg.teach = true; saveCfg(); atPowerStart(); begin(); TEACH.seen = {}; setTimeout(function () { ANN.forEach(function (t) { if (t.lbl && t.st !== 'off') TEACH.seen[t.sec + '|' + t.lbl] = 1; }); var c = ['mfpA', 'porv', 'air', 'drop', 'sgtl']; FAULT.insert(c[Math.floor(Math.random() * c.length)], true); toast('🚨 Drill: a fault is coming. Teach mode will coach you.', 'warn'); }, 4000); }
    if (a === 'explain') { S.cfg.explain = true; saveCfg(); closeMenu(); toast('💡 Rest the pointer on anything for 3 seconds.'); }
    if (a === 'x') closeMenu(); });
}
/* ---------------------------------------------------------------- save slots ---------------------------------------------------------------- */
var SLK = 'critical_plant_slots';
function slots() { try { return JSON.parse(localStorage.getItem(SLK) || '[]') || []; } catch (e) { return []; } }
function slotsW(a) { try { localStorage.setItem(SLK, JSON.stringify(a)); return true; } catch (e) { toast('Couldn’t save: the browser’s storage is full.', 'bad'); return false; } }
function slotDesc(sv) { var p = sv.p || {}, x = p.x || {}, tb = x.tb || {}; return (p.tripped ? 'Shut down' : tb.gen ? Math.round(tb.mw) + ' MW' : 'critical') + ' · plant time ' + fmtT(p.t || 0) + ' · ' + new Date(sv.at || Date.now()).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function saveMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var a = slots(), auto = rd();
  menu('<h1>💾 Save and load</h1><p>Critical also saves automatically every 20 seconds and when you close it: <b>▶ Resume shift</b> on the main menu carries on from there. Use the slots below to keep a save you can come back to, like before trying a fault.</p>' +
    '<div class="tslist">' + [0, 1, 2].map(function (i) { var s = a[i]; return '<div class="tsrow"><b>Slot ' + (i + 1) + '</b> ' + (s ? esc(s.name) + '<br><span class="cmnote">' + esc(slotDesc(s.d)) + '</span>' : '<span class="cmnote">empty</span>') + '<div class="cpnbtns"><button class="cpnb2" data-a="sv" data-i="' + i + '">💾 Save here</button>' + (s ? '<button class="cpnb2" data-a="ld" data-i="' + i + '">📂 Load</button><button class="cpnb2" data-a="del" data-i="' + i + '">🗑 Delete</button>' : '') + '</div></div>'; }).join('') + '</div>' +
    (auto.p ? '<p class="cmnote">Autosave: ' + esc(slotDesc(auto)) + '</p>' : '') + '<div class="cpnbtns"><button class="cpnb" data-a="x">Back to the plant</button></div>', function (k, b) { var i = +b.dataset.i;
    if (k === 'sv') { save(); var sv = rd(), nm = (MS.phase() === 'free' ? 'Free play' : phaseDef(MS.phase()).t) + (FAULT.active().length ? ' · fault: ' + FAULT.active()[0].t : ''); a[i] = { name: nm, d: sv }; if (slotsW(a)) toast('💾 Saved to slot ' + (i + 1) + '.', 'ok'); saveMenu(); }
    if (k === 'ld') { var s = a[i]; if (!s) return; var cfg = S.cfg; loadState(s.d); S.cfg = cfg; save(); closeMenu(); begin(); toast('📂 Loaded slot ' + (i + 1) + '.', 'ok'); }
    if (k === 'del') { a[i] = null; slotsW(a); saveMenu(); }
    if (k === 'x') closeMenu(); });
}
addEventListener('pagehide', function () { try { if (S && S.p) save(); } catch (e) {} });
document.addEventListener('visibilitychange', function () { try { if (document.hidden && S && S.p) save(); } catch (e) {} });

/* ================================================================ look and feel ================================================================
   Soundscape (turbine hall rumble with load, radio chatter, keyboards), heavier switch sounds, lamp flicker, blackout and
   emergency lighting, labels/wear/mug, smooth camera momentum, a hand that reaches for controls, and two crew members. */
var FEEL = { t: 0, chatT: 20, keyT: 5, flT: 8, lights: null, people: null, hand: null, hT: 0,
  audio: function () { var c = AUD.ctx; if (!c || FEEL.rum) return; var s = c.createBufferSource(); s.buffer = AUD.nbuf; s.loop = true; var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 90; FEEL.rum = c.createGain(); FEEL.rum.gain.value = 0; s.connect(lp); lp.connect(FEEL.rum); FEEL.rum.connect(AUD.master); s.start();
    var o = c.createOscillator(); o.frequency.value = 50; FEEL.tg = c.createGain(); FEEL.tg.gain.value = 0; o.connect(FEEL.tg); FEEL.tg.connect(AUD.master); o.start(); },
  chatter: function () { var c = AUD.ctx; if (!c) return; var t = c.currentTime + 0.02; AUD.noise(t, 0.08, 1400, 1, 0.12); AUD.tone(t, 1750, 0.06, 'sine', 0.04); var n = 3 + Math.floor(Math.random() * 5);
    for (var i = 0; i < n; i++) { var st = t + 0.12 + i * 0.22 + Math.random() * 0.08; AUD.noise(st, 0.12 + Math.random() * 0.1, 700 + Math.random() * 900, 4, 0.06); AUD.tone(st, 140 + Math.random() * 80, 0.14, 'sawtooth', 0.012); } AUD.noise(t + 0.2 + n * 0.22, 0.1, 1600, 1, 0.1); },
  keys: function () { var c = AUD.ctx; if (!c) return; var t = c.currentTime, n = 4 + Math.floor(Math.random() * 10); for (var i = 0; i < n; i++) AUD.noise(t + i * (0.07 + Math.random() * 0.09), 0.012, 3000 + Math.random() * 1500, 2, 0.05); },
  build: function () { if (FEEL.lights || !R3) return; var sc = R3.scene; FEEL.lights = []; sc.traverse(function (o) { if (o.isLight) FEEL.lights.push([o, o.intensity]); }); FEEL.exp0 = R3.ren.toneMappingExposure;
    var mk = function (g, col, x, y, z, ry) { var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 })); m.position.set(x, y, z); m.rotation.y = ry || 0; sc.add(m); return m; };
    var tex = function (w, h, draw) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')); var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
    var plane = function (w, h, t, x, y, z, ry, rz) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry || 0; m.rotation.z = rz || 0; sc.add(m); return m; };
    /* coffee mug and papers on the console */
    var mug = mk(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 18), 0xe8e4dc, 0.62, 0.83, CZ + 0.12); mk(new THREE.TorusGeometry(0.026, 0.008, 8, 14), 0xe8e4dc, 0.665, 0.83, CZ + 0.12, Math.PI / 2);
    mk(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16), 0x3b2412, 0.62, 0.877, CZ + 0.12);
    var paper = tex(256, 340, function (g) { g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, 256, 340); g.fillStyle = '#223'; g.font = 'bold 18px sans-serif'; g.fillText('SHIFT LOG', 16, 30); g.font = '14px sans-serif'; ['07:00 took over from B shift', 'Unit 1 hot standby, 1200 ppm', 'CCP B in standby', 'EDG B monthly run due', 'SG 3 level ch. noisy - WO raised'].forEach(function (l, i) { g.fillText(l, 16, 64 + i * 28); }); g.strokeStyle = '#8aa'; for (var i = 0; i < 9; i++) { g.beginPath(); g.moveTo(10, 70 + i * 28); g.lineTo(246, 70 + i * 28); g.stroke(); } });
    plane(0.2, 0.27, paper, -0.55, 0.785, CZ + 0.2, 0, 0.12).rotation.x = -Math.PI / 2;
    /* sticky notes, caution signs and a handwritten tag */
    var note = function (txt, col) { return tex(200, 200, function (g) { g.fillStyle = col; g.fillRect(0, 0, 200, 200); g.fillStyle = '#222'; g.font = '26px "Comic Sans MS", cursive'; txt.split('\n').forEach(function (l, i) { g.fillText(l, 14, 50 + i * 36); }); }); };
    plane(0.09, 0.09, note('ECP\nD @ 120\nsteps', '#ffe970'), -0.62, 1.32, CZ - 0.2, 0.32, 0.05);
    plane(0.09, 0.09, note('Calorimetric\ndue 13:00', '#9ff0a0'), 1.05, 1.3, CZ - 0.14, -0.32, -0.06);
    var caut = tex(512, 256, function (g) { g.fillStyle = '#ffcc00'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#111'; g.fillRect(0, 0, 512, 70); g.fillStyle = '#ffcc00'; g.font = 'bold 50px sans-serif'; g.fillText('⚠ CAUTION', 120, 52); g.fillStyle = '#111'; g.font = 'bold 34px sans-serif'; g.fillText('THREE-WAY COMMUNICATION', 28, 130); g.fillText('FOR ALL PLANT ORDERS', 70, 180); });
    plane(1.0, 0.5, caut, -RX + 0.03, 2.2, 4.5, Math.PI / 2);
    var tag = tex(160, 320, function (g) { g.fillStyle = '#ff5a3c'; g.fillRect(0, 0, 160, 320); g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.fillText('DANGER', 18, 50); g.font = 'bold 20px sans-serif'; ['DO NOT', 'OPERATE', '', 'WO 41187', 'J. Patel'].forEach(function (l, i) { g.fillText(l, 22, 110 + i * 34); }); });
    plane(0.08, 0.16, tag, 6.2, 1.25, ZB + 3.1, -0.9, 0.08);
    /* people: the supervisor at her desk and an operator doing rounds */
    var person = function (shirt, seated) { var g = new THREE.Group(), skin = 0xd9a77f, pm = function (geo, col, x, y, z) { var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 })); m.position.set(x, y, z); g.add(m); return m; };
      var hy = seated ? 0.45 : 0.9; pm(new THREE.CapsuleGeometry(0.17, 0.45, 4, 10), shirt, 0, hy + 0.36, 0); pm(new THREE.SphereGeometry(0.12, 16, 12), skin, 0, hy + 0.82, 0); pm(new THREE.SphereGeometry(0.125, 16, 12, 0, Math.PI * 2, 0, 1.3), 0x2b1d14, 0, hy + 0.85, 0.01);
      var legs = [-0.08, 0.08].map(function (x) { var l = new THREE.Group(); l.position.set(x, hy, 0); var m = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, seated ? 0.32 : 0.62, 4, 8), new THREE.MeshStandardMaterial({ color: 0x252a36, roughness: 0.9 })); m.position.y = seated ? -0.05 : -0.42; if (seated) { m.rotation.x = Math.PI / 2; m.position.z = -0.2; } l.add(m); g.add(l); return l; });
      var arms = [-0.22, 0.22].map(function (x) { var a = new THREE.Group(); a.position.set(x, hy + 0.6, 0); var m = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.42, 4, 8), new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 })); m.position.y = -0.25; a.add(m); g.add(a); return a; });
      g.userData = { legs: legs, arms: arms }; sc.add(g); return g; };
    var sup = person(0xf2f2f2, true); sup.position.set(0, 0, SZ + 0.45); sup.rotation.y = Math.PI;
    var walker = person(0x2f5d9e, false); FEEL.people = { sup: sup, walk: walker, a: 0.2, dir: 1, pause: 0 };
    FEEL.hand = buildHand(); sc.add(FEEL.hand); },
  reach: function (h) { handReach(h); },
  tick: function (dt) { if (!R3 || !S || !S.p) return; FEEL.build(); FEEL.t += dt; var p = S.p, x = p.x;
    /* sound */ if (AUD.ctx && S.cfg.snd) { FEEL.audio(); var ld = x.tb.latched ? clamp(x.tb.rpm / 3000, 0, 1) * (0.4 + 0.6 * clamp(x.tb.mw / 1150, 0, 1)) : 0, now = AUD.ctx.currentTime; FEEL.rum.gain.setTargetAtTime(0.05 + ld * 0.35, now, 0.6); FEEL.tg.gain.setTargetAtTime(x.tb.gen ? 0.006 + 0.01 * ld : 0, now, 0.6);
      if (!S.paused && !S.menu) { if ((FEEL.chatT -= dt) < 0) { FEEL.chatT = 35 + Math.random() * 60; FEEL.chatter(); } if ((FEEL.keyT -= dt) < 0) { FEEL.keyT = 6 + Math.random() * 14; FEEL.keys(); } } }
    /* lighting: blackout when the unit boards lose power; emergency lights on the safety buses; the odd flicker */
    var unit = busOn(x, 'A') || busOn(x, 'B'), saf = busOn(x, 'EA') || busOn(x, 'EB'), lvl = (unit ? 1 : saf ? 0.28 : 0.06) * (typeof LIFE !== 'undefined' && LIFE.night ? 0.8 : 1), fl = 1;
    if ((FEEL.flT -= dt) < 0) { FEEL.flT = 25 + Math.random() * 50; FEEL.flk = 0.25; } if (FEEL.flk > 0) { FEEL.flk -= dt; fl = Math.random() < 0.5 ? 0.82 : 1; }
    FEEL.lv = (FEEL.lv == null ? 1 : FEEL.lv) + (lvl - (FEEL.lv == null ? 1 : FEEL.lv)) * (1 - Math.exp(-dt * (lvl < FEEL.lv ? 12 : 1.5))); var k = FEEL.lv * fl;
    if (FEEL.lights && Math.abs(k - (FEEL.lk || 0)) > 0.002) { FEEL.lk = k; FEEL.lights.forEach(function (q) { q[0].intensity = q[1] * k; }); R3.ren.toneMappingExposure = FEEL.exp0 * (0.55 + 0.45 * k); if (!unit && !FEEL.bo) { FEEL.bo = true; S.addLog('Control room lighting lost: emergency lighting on'); } if (unit) FEEL.bo = false; }
    /* people */ var P = FEEL.people; if (P) { var w = P.walk; if (P.pause > 0) P.pause -= dt; else { P.a += P.dir * dt * 0.12; if (P.a > 0.9 || P.a < -0.9) { P.dir *= -1; P.pause = 4 + Math.random() * 6; } }
      var r = 6.2, ax = Math.sin(P.a) * r, az = BCZ - Math.cos(P.a) * r; w.position.set(ax, 0, az); w.rotation.y = P.pause > 0 ? Math.atan2(Math.sin(P.a), -Math.cos(P.a)) : Math.atan2(Math.cos(P.a) * P.dir, Math.sin(P.a) * P.dir);
      var sw = P.pause > 0 ? 0 : Math.sin(FEEL.t * 7) * 0.45; w.userData.legs[0].rotation.x = sw; w.userData.legs[1].rotation.x = -sw; w.userData.arms[0].rotation.x = -sw * 0.7; w.userData.arms[1].rotation.x = sw * 0.7;
      P.sup.userData.arms[1].rotation.x = -1.1 + Math.sin(FEEL.t * 9) * 0.05 * (Math.sin(FEEL.t * 0.7) > 0 ? 1 : 0); P.sup.userData.arms[0].rotation.x = -1.1; P.sup.children[1].rotation.y = Math.sin(FEEL.t * 0.3) * 0.4; }
    /* hand */ handTick(dt); }
};

/* ---------------------------------------------------------------- a realistic first-person hand ----------------------------------------------------------------
   Built from rounded segments with real proportions: palm, four fingers with three jointed bones each, a thumb, wrist and a shirt
   cuff. It comes in from the lower right in an arc, slows as it arrives, the index finger presses a button (or the fingers close on
   a switch or knob and turn it), holds for a moment, then eases back. Skin uses a physical material with sheen for a soft look. */
var HAND = { t: 1, mode: 'press', bones: null };
function buildHand() { HAND.from = new THREE.Vector3(); HAND.to = new THREE.Vector3(); HAND.q0 = new THREE.Quaternion(); HAND.q1 = new THREE.Quaternion(); var root = new THREE.Group(), wrist = new THREE.Group(); root.add(wrist); root.visible = false;
  /* procedural skin: mottled colour with redder patches, fine pores and wrinkle creases as a bump map, slightly translucent sheen */
  var cv = function (w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  var col = cv(512, 512, function (g, w, h) { g.fillStyle = '#d9a389'; g.fillRect(0, 0, w, h); for (var i = 0; i < 2600; i++) { var r = 4 + Math.random() * 28; g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '200,110,95' : '238,190,165') + ',' + (0.025 + Math.random() * 0.05) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, 6.3); g.fill(); }
    for (i = 0; i < 9000; i++) { g.fillStyle = 'rgba(120,70,55,' + (Math.random() * 0.12) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1, 1); } g.strokeStyle = 'rgba(110,120,170,.10)'; g.lineWidth = 3; for (i = 0; i < 6; i++) { g.beginPath(); var x = Math.random() * w; g.moveTo(x, 0); for (var y = 0; y <= h; y += 32) g.lineTo(x += (Math.random() - 0.5) * 30, y); g.stroke(); } });
  col.colorSpace = THREE.SRGBColorSpace;
  var bump = cv(512, 512, function (g, w, h) { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (var i = 0; i < 26000; i++) { var v = Math.random() < 0.5 ? 70 : 170; g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',.35)'; g.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4); }
    g.strokeStyle = 'rgba(40,40,40,.55)'; g.lineWidth = 1.6; for (var k = 0; k < 3; k++) { var y0 = h * (0.06 + k * 0.012); g.beginPath(); g.moveTo(0, y0); for (var x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.05 + k) * 3); g.stroke(); y0 = h * (0.94 - k * 0.012); g.beginPath(); g.moveTo(0, y0); for (x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.04 + k) * 3); g.stroke(); } });
  var skin = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: col, bumpMap: bump, bumpScale: 0.6, roughness: 0.58, sheen: 0.7, sheenColor: new THREE.Color(0xffb59a), sheenRoughness: 0.45, clearcoat: 0.12, clearcoatRoughness: 0.55, specularIntensity: 0.4 }),
      tipSkin = (function (t) { t.color = new THREE.Color(0xffe0d8); return t; })(skin.clone()), nail = new THREE.MeshPhysicalMaterial({ color: 0xf0cdbf, roughness: 0.25, clearcoat: 0.6 }), shirt = new THREE.MeshStandardMaterial({ color: 0xe9edf2, roughness: 0.92 }), watch = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.4, metalness: 0.6 });
  var cap = function (r, l, m) { var g = new THREE.CapsuleGeometry(r, l, 6, 14); g.rotateX(Math.PI / 2); g.translate(0, 0, -l / 2 - r * 0.2); return new THREE.Mesh(g, m); };
  /* palm: a flattened rounded block, slightly wider at the knuckles */
  var pg = new THREE.CapsuleGeometry(0.034, 0.05, 8, 18); pg.rotateX(Math.PI / 2); pg.scale(1.18, 0.45, 1); var palm = new THREE.Mesh(pg, skin); palm.position.z = -0.045; wrist.add(palm);
  var knuck = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.06, 6, 12), skin); knuck.rotation.z = Math.PI / 2; knuck.position.set(0, 0.004, -0.083); knuck.scale.set(1, 1, 0.8); wrist.add(knuck);
  /* forearm, cuff and a watch */
  var fa = cap(0.03, 0.2, skin); fa.rotation.y = Math.PI; fa.position.z = 0.004; fa.scale.set(1.15, 0.85, 1); wrist.add(fa); fa.visible = false;
  var cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.05, 0.25, 22, 1, true), shirt); cuff.rotation.x = Math.PI / 2; cuff.position.z = 0.19; cuff.material.side = THREE.DoubleSide; cuff.visible = false; wrist.add(cuff);
  var wb = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 8, 24), watch); wb.position.z = 0.045; wb.scale.set(1.1, 0.85, 1); wb.userData.keep = 1; wrist.add(wb); var face = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.005, 20), watch); face.position.set(0, 0.03, 0.045); face.userData.keep = 1; wrist.add(face);
  /* fingers: [x at knuckle, segment lengths, radius] index, middle, ring, little */
  var F = [[-0.026, [0.042, 0.026, 0.02], 0.0092], [-0.0085, [0.046, 0.029, 0.021], 0.0095], [0.0095, [0.043, 0.027, 0.02], 0.009], [0.026, [0.034, 0.021, 0.017], 0.0078]], bones = [];
  F.forEach(function (d, fi) { var parent = wrist, z = -0.085, chain = []; d[1].forEach(function (L, k) { var j = new THREE.Group(); j.position.set(k ? 0 : d[0], k ? 0 : 0.002, k ? -d[1][k - 1] - d[2] * 0.15 : z - fi % 3 * 0.003 + (fi === 3 ? 0.008 : 0)); parent.add(j); var m = cap(d[2] * (1 - k * 0.1), L - d[2], k === 2 ? tipSkin : skin); j.add(m); var kn = new THREE.Mesh(new THREE.SphereGeometry(d[2] * (1.04 - k * 0.1), 14, 10), skin); j.add(kn); /* rounded joint so segments blend */
      if (k === 2) { var n = new THREE.Mesh(new THREE.SphereGeometry(d[2] * 0.75, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), nail); n.scale.set(1, 0.35, 1.25); n.position.set(0, d[2] * 0.62, -L + d[2] * 0.9); j.add(n); }
      chain.push(j); parent = j; }); if (fi === 3) chain[0].rotation.y = -0.12; if (fi === 0) chain[0].rotation.y = 0.05; bones.push(chain); });
  /* thumb: comes off the side of the palm, angled in */
  var t0 = new THREE.Group(); t0.position.set(-0.036, -0.006, -0.025); t0.rotation.set(0.25, 0.85, 0.35); wrist.add(t0); var tc = [t0]; t0.add(cap(0.012, 0.03, skin));
  var t1 = new THREE.Group(); t1.position.z = -0.038; t0.add(t1); t1.add(cap(0.0105, 0.022, skin)); var t2 = new THREE.Group(); t2.position.z = -0.03; t1.add(t2); t2.add(cap(0.0098, 0.016, skin)); var tn = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), nail); tn.scale.set(1, 0.35, 1.25); tn.position.set(0, 0.006, -0.022); t2.add(tn); tc.push(t1, t2); bones.push(tc);
  /* the arm: upper arm and forearm in shirt sleeves, placed every frame by two-bone IK from your shoulder to the wrist */
  var seg = function (r0, r1, m) { var g = new THREE.CylinderGeometry(r1, r0, 1, 18, 1, true); g.translate(0, 0.5, 0); var me = new THREE.Mesh(g, m); me.material.side = THREE.DoubleSide; me.frustumCulled = false; return me; };
  /* a real arm, not two tubes: lathed profiles with the muscle shapes (deltoid and biceps under the shirt sleeve, the brachioradialis bulge below the elbow,
     the forearm flattening and narrowing to the wrist with the ulna knob), a rolled shirt cuff at the elbow, forearm hair and veins in the skin map, and a watch */
  var lathe = function (prof, m, flat) { var pts = prof.map(function (q) { return new THREE.Vector2(q[1], q[0]); }); var g = new THREE.LatheGeometry(pts, 28); if (flat) g.scale(1, 1, flat); g.computeVertexNormals(); var me = new THREE.Mesh(g, m); me.material.side = THREE.DoubleSide; me.frustumCulled = false; return me; };
  var weave = cv(256, 256, function (g, w, h) { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (var i = 0; i < w; i += 3) { g.fillStyle = i % 6 ? 'rgba(60,60,60,.5)' : 'rgba(160,160,160,.5)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); } });
  weave.repeat.set(10, 10); var cloth = new THREE.MeshStandardMaterial({ color: 0xe9edf2, roughness: 0.95, bumpMap: weave, bumpScale: 0.25 });
  var fcol = cv(512, 512, function (g, w, h) { g.fillStyle = '#d6a088'; g.fillRect(0, 0, w, h); for (var i = 0; i < 2000; i++) { var r = 6 + Math.random() * 30; g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '196,108,92' : '236,186,160') + ',' + (0.03 + Math.random() * 0.05) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, 6.3); g.fill(); }
    g.strokeStyle = 'rgba(90,110,170,.13)'; g.lineWidth = 4; for (i = 0; i < 5; i++) { g.beginPath(); var x = w * (0.3 + Math.random() * 0.4); g.moveTo(x, h * 0.3); for (var y = h * 0.3; y <= h; y += 40) g.lineTo(x += (Math.random() - 0.5) * 36, y); g.stroke(); }
    for (i = 0; i < 1400; i++) { var hx = Math.random() * w, hy = Math.random() * h * 0.75; g.strokeStyle = 'rgba(70,45,30,' + (0.25 + Math.random() * 0.35) + ')'; g.lineWidth = 1 + Math.random(); g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(hx + 3, hy + 5, hx + (Math.random() - 0.3) * 6, hy + 9 + Math.random() * 6); g.stroke(); } });
  fcol.colorSpace = THREE.SRGBColorSpace;
  var fbump = cv(512, 512, function (g, w, h) { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (var i = 0; i < 20000; i++) { var v = Math.random() < 0.5 ? 80 : 160; g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',.3)'; g.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4); }
    /* two tendons at the wrist and the ulna knob */ g.fillStyle = 'rgba(200,200,200,.6)'; g.fillRect(w * 0.44, h * 0.8, 8, h * 0.2); g.fillRect(w * 0.5, h * 0.82, 6, h * 0.18); var gr = g.createRadialGradient(w * 0.8, h * 0.93, 0, w * 0.8, h * 0.93, 26); gr.addColorStop(0, 'rgba(230,230,230,.9)'); gr.addColorStop(1, 'rgba(128,128,128,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var fskin = skin.clone(); fskin.map = fcol; fskin.bumpMap = fbump; fskin.bumpScale = 0.9;
  HAND.up = lathe([[0, 0.062], [0.12, 0.064], [0.3, 0.06], [0.45, 0.058], [0.62, 0.056], [0.8, 0.05], [0.9, 0.047], [1.0, 0.043]], cloth, 0.92);
  HAND.cuff = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.013, 10, 28), cloth); HAND.cuff.geometry.rotateX(Math.PI / 2); HAND.cuff.geometry.scale(1, 1, 0.92); HAND.cuff.frustumCulled = false;
  HAND.lo = lathe([[0, 0.041], [0.08, 0.046], [0.2, 0.049], [0.35, 0.047], [0.5, 0.042], [0.65, 0.037], [0.8, 0.032], [0.92, 0.029], [1.0, 0.028]], fskin, 0.82);
  HAND.watch = new THREE.Group(); var strap = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.005, 8, 28), watch); strap.geometry.rotateX(Math.PI / 2); strap.geometry.scale(1, 1, 0.82); strap.frustumCulled = false; HAND.watch.add(strap);
  var face = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.007, 24), new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.25, metalness: 0.9 })); face.geometry.rotateX(Math.PI / 2); face.position.set(0, 0, -0.027); face.frustumCulled = false; HAND.watch.add(face);
  var glass = new THREE.Mesh(new THREE.CircleGeometry(0.013, 24), new THREE.MeshPhysicalMaterial({ color: 0x0b0f16, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 })); glass.position.set(0, 0, -0.0315); glass.rotation.y = Math.PI; glass.frustumCulled = false; HAND.watch.add(glass);
  HAND.fskin = fskin; HAND.coat = new THREE.MeshStandardMaterial({ color: 0xf5f8fc, roughness: 0.85, bumpMap: weave, bumpScale: 0.2 }); HAND.el = new THREE.Mesh(new THREE.SphereGeometry(0.046, 20, 14), fskin); HAND.el.scale.set(1, 1.15, 0.9); HAND.fore = seg(0.036, 0.03, skin); [HAND.up, HAND.lo, HAND.el, HAND.cuff, HAND.watch].forEach(function (m) { m.visible = false; R3.scene.add(m); });
  root.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.renderOrder = 2; } }); HAND.bones = bones; loadRealHand(root, skin); loadRigArm(); return root; }
/* the real hand: a properly modelled, skinned human hand (the WebXR generic hand, W3C licence), posed through its 25 bones */
function loadRealHand(root, skin) { var go = function () { try { new THREE.GLTFLoader().load('models/hand-right.glb', function (g) { var sc = g.scene, bones = {}; sc.traverse(function (o) { if (/finger|thumb|wrist/.test(o.name)) bones[o.name] = o; if (o.isMesh) { o.material = (skin && o.geometry.attributes.uv) ? skin : new THREE.MeshPhysicalMaterial({ color: 0xdba68c, roughness: 0.6, sheen: 0.8, sheenColor: new THREE.Color(0xffb59a), sheenRoughness: 0.45, clearcoat: 0.1, clearcoatRoughness: 0.5, specularIntensity: 0.35 }); o.castShadow = false; o.frustumCulled = false; o.renderOrder = 2; } });
  HAND.real = bones; HAND.rest = {}; Object.keys(bones).forEach(function (k) { HAND.rest[k] = bones[k].quaternion.clone(); }); var w = root.children[0]; w.children.forEach(function (c) { if (!c.userData.keep) c.visible = false; }); sc.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0))); sc.position.set(-0.009, -0.03, 0.0); w.add(sc); }, undefined, function () {}); } catch (e) {} };
  if (THREE.GLTFLoader) go(); else { var s = document.createElement('script'); s.src = 'vendor/GLTFLoader.js'; s.onload = go; document.head.appendChild(s); } }
/* ================================================================ the rigged arm: a skinned right arm (CC0, OpenGameArt "FPS arms rigged") ================================================================
   Loaded from models/arm-right.glb. Every frame the shoulder, elbow and wrist from the IK are written straight into the bones, the hand
   bone takes the hand's orientation, and the fingers are posed by rotating their bones from the rest pose. When it has loaded, the
   procedural arm and the old hand mesh are hidden. */
var RIG = { on: false, b: null, rest: null, mesh: null, qMap: null, tmpM: new THREE.Matrix4(), tmpI: new THREE.Matrix4(), v: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() };
function loadRigArm() { var go = function () { try { new THREE.GLTFLoader().load('models/arm-right.glb?v=' + encodeURIComponent(String(window.CRIT_PLANT_V || Date.now())), function (g) { var sc = g.scene, b = {}; sc.traverse(function (o) { if (o.isBone) b[o.name] = o; if (o.isSkinnedMesh) { RIG.mesh = o; o.frustumCulled = false; o.renderOrder = 2; var mp = o.material.map; o.material = new THREE.MeshPhysicalMaterial({ map: mp, color: 0xfff2ea, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color(0xffb59a), sheenRoughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.6, specularIntensity: 0.35 }); if (mp) { mp.colorSpace = THREE.SRGBColorSpace; mp.anisotropy = 4; } } });
  if (!b.upper_armR || !b.forearmR || !b.handR) return; RIG.b = b; RIG.rest = {}; Object.keys(b).forEach(function (k) { RIG.rest[k] = b[k].quaternion.clone(); });
  /* bone axes: +y along the finger, +x towards the thumb, +z out of the palm. The hand group has fingers along -z, palm down (-y), thumb -x. */
  RIG.qMap = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0)));
  sc.visible = false; R3.scene.add(sc); RIG.root = sc; RIG.on = true; }, undefined, function () {}); } catch (e) {} };
  if (THREE.GLTFLoader) go(); else { var s = document.createElement('script'); s.src = 'vendor/GLTFLoader.js'; s.onload = go; document.head.appendChild(s); } }
/* set a bone's world transform (position + quaternion) regardless of its parent */
function setBoneWorld(bone, pos, quat) { var p = bone.parent; if (p) { p.updateWorldMatrix(true, false); RIG.tmpI.copy(p.matrixWorld).invert(); } else RIG.tmpI.identity(); RIG.tmpM.compose(pos, quat, RIG.s.set(1, 1, 1)); RIG.tmpM.premultiply(RIG.tmpI); RIG.tmpM.decompose(bone.position, bone.quaternion, RIG.s); bone.updateMatrixWorld(true); }
function basisQuat(y, z) { var yy = y.clone().normalize(), xx = yy.clone().cross(z).normalize(), zz = xx.clone().cross(yy).normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx, yy, zz)); }
function rigArm(Sh, E, W, hq, on) { if (!RIG.on) return; RIG.root.visible = on; if (!on) return; var b = RIG.b;
  var d1 = E.clone().sub(Sh).normalize(), d2 = W.clone().sub(E).normalize(), hqw = hq.clone().multiply(RIG.qMap);
  var palm = new THREE.Vector3(0, 0, 1).applyQuaternion(hqw), pole = d1.clone().cross(d2).normalize(); if (pole.lengthSq() < 0.01) pole.copy(palm);
  var qUp = basisQuat(d1, pole.clone().negate()), qLo = basisQuat(d2, palm);
  setBoneWorld(b.clavicleR, Sh.clone().addScaledVector(d1, -0.17), qUp); setBoneWorld(b.deltoidR, Sh.clone().addScaledVector(d1, -0.06), qUp); setBoneWorld(b.upper_armR, Sh, qUp); setBoneWorld(b.forearmR, E, qLo);
  if (b.handRcontrol) setBoneWorld(b.handRcontrol, W, hqw); setBoneWorld(b.handR, W, hqw); }
function rigPose(k) { var b = RIG.b, rest = RIG.rest, press = HAND.mode === 'press'; if (!b) return;
  var curl = function (name, a) { var bn = b[name]; if (!bn) return; bn.quaternion.copy(rest[name]).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a)); };
  var fs = ['index', 'middle', 'ring', 'pinky']; fs.forEach(function (f, i) { var relax = [0.25, 0.3, 0.35, 0.4][i], act = press ? (f === 'index' ? -0.05 : 1.25 + i * 0.08) : 0.85 + i * 0.07; var a = relax + (act - relax) * k; curl('f_' + f + '01R', a * 0.9); curl('f_' + f + '02R', a); curl('f_' + f + '03R', a * 0.7); });
  curl('thumb01R', 0.1 + (press ? 0.35 : 0.3) * k); curl('thumb02R', 0.15 + 0.35 * k); curl('thumb03R', 0.1 + 0.3 * k); }
function placeSeg(m, a, b) { var v = b.clone().sub(a), L = v.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); m.scale.set(1, L, 1); }
function armIK() { var hd = FEEL.hand, cam = R3.cam, on = hd && hd.visible; [HAND.up, HAND.lo, HAND.el, HAND.cuff, HAND.watch].forEach(function (m) { if (m) m.visible = on; }); if (RIG.on && HAND.cuff) { HAND.cuff.scale.set(1, 1, 1); } if (HAND.el) HAND.el.visible = on && !RIG.on; if (HAND.lo) HAND.lo.material = RIG.on ? HAND.coat : HAND.fskin; if (RIG.on && hd) { var wg = hd.children[0]; if (wg && !RIG.hid) { RIG.hid = true; wg.children.forEach(function (c) { c.visible = false; }); } } if (!on) { rigArm(null, null, null, null, false); return; }
  var q = cam.quaternion, R = new THREE.Vector3(1, 0, 0).applyQuaternion(q), U = new THREE.Vector3(0, 1, 0).applyQuaternion(q), Fw = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  var Sh = cam.position.clone().addScaledVector(R, 0.19).addScaledVector(U, -0.24).addScaledVector(Fw, -0.04), W = new THREE.Vector3(0, 0, 0.06).applyQuaternion(hd.quaternion).add(hd.position);
  var d = W.distanceTo(Sh), tot = RIG.on ? 0.53 : 0.60, L1 = RIG.on ? 0.26 : 0.31, L2 = RIG.on ? 0.27 : 0.29, dir = W.clone().sub(Sh).normalize(); if (d > tot - 0.01) { /* a real arm doesn't stretch: the hand stops where the arm runs out */ var pull = dir.clone().multiplyScalar((tot - 0.01) - d); hd.position.add(pull); W.add(pull); d = tot - 0.01; }
  var a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a)), pole = U.clone().multiplyScalar(-1).addScaledVector(R, 0.8).normalize(), perp = pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  var E = Sh.clone().addScaledVector(dir, a).addScaledVector(perp, hh); placeSeg(HAND.up, Sh, E); placeSeg(HAND.lo, E, W); HAND.el.position.copy(E); HAND.el.quaternion.copy(HAND.lo.quaternion); var d2 = W.clone().sub(E).normalize(), d1 = E.clone().sub(Sh).normalize(); HAND.cuff.position.copy(Sh).addScaledVector(d1, L1 * 0.9); HAND.cuff.quaternion.copy(HAND.up.quaternion); HAND.watch.position.copy(E).addScaledVector(d2, L2 * 0.88); HAND.watch.quaternion.copy(HAND.lo.quaternion); if (RIG.on) { HAND.cuff.visible = false; HAND.watch.visible = false; /* the sleeve tubes were built slightly oval; undo that so they stay round as they roll with the forearm */ HAND.up.scale.x = 1.35; HAND.up.scale.z = 1.35 / 0.92; HAND.lo.scale.x = 1.35; HAND.lo.scale.z = 1.35 / 0.82; HAND.cuff.position.copy(W).addScaledVector(d2, -0.012); HAND.cuff.quaternion.copy(HAND.lo.quaternion); } rigArm(Sh, E, W, hd.quaternion, true); }
/* finger curl for a pose blend: 0 = relaxed, 1 = the action pose */
function handPose(k) { if (RIG.on) return rigPose(k); if (HAND.real) return realPose(k); var B = HAND.bones; if (!B) return; var relax = [[0.35, 0.45, 0.3], [0.45, 0.55, 0.35], [0.55, 0.6, 0.4], [0.65, 0.7, 0.45]];
  var act = HAND.mode === 'press' ? [[-0.05, 0.08, 0.05], [1.35, 1.5, 0.9], [1.45, 1.55, 0.95], [1.5, 1.55, 1.0]] : [[0.9, 0.85, 0.55], [1.0, 0.9, 0.55], [1.15, 1.1, 0.7], [1.25, 1.2, 0.75]];
  for (var f = 0; f < 4; f++) for (var j = 0; j < 3; j++) B[f][j].rotation.x = -(relax[f][j] + (act[f][j] - relax[f][j]) * k);
  var th = B[4]; th[1].rotation.x = -(0.25 + (HAND.mode === 'press' ? 0.7 : 0.45) * k); th[2].rotation.x = -(0.2 + 0.5 * k); }
function handReach(h) { var hd = FEEL.hand; if (!hd || !h || !h.point) return; var cam = R3.cam, hi = h.object.userData.hit || {}, tip = String(typeof hi.tip === 'function' ? hi.tip() : hi.tip || '');
  HAND.mode = /button|push|ACK|RESET|TRIP|BLOCK|LATCH|press/i.test(tip) ? 'press' : 'grip';
  if (HAND.knob) { HAND.knob.r.lock = false; HAND.knob = null; }
  var tgt = h.point.clone(), kb = hi.knob;
  if (kb && HAND.mode === 'grip') { var dk = kb.s.desk; dk.updateMatrixWorld(); var kc = dk.localToWorld(new THREE.Vector3(kb.r.u, kb.y + 0.012, -kb.r.d * SL)), ax = new THREE.Vector3(0, 1, 0).transformDirection(dk.matrixWorld).normalize();
    HAND.knob = { r: kb.r, key: kb.k, sw: kb.sw, a0: kb.r[kb.k], c: kc, ax: ax, tgt: null }; kb.r.lock = true; tgt = kc.clone(); }
  var toCam = cam.position.clone().sub(tgt).normalize();
  /* start low and to the right of the view, just out of shot */
  var right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion), fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  HAND.from.copy(cam.position).addScaledVector(right, 0.28).addScaledVector(up, -0.32).addScaledVector(fwd, 0.25);
  /* aim the fingertips at the control: the hand's -z points from the hand to the target */
  var m = new THREE.Matrix4(), dir = tgt.clone().sub(HAND.from).normalize(), roll = HAND.mode === 'press' ? 0.15 : -0.35; m.lookAt(new THREE.Vector3(0, 0, 0), dir.clone(), up); HAND.q1.setFromRotationMatrix(m); HAND.q1.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, 0, roll)));
  HAND.q0.copy(HAND.q1).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.6, 0.3, 0.4)));
  /* stop so the fingertip (about 14 cm from the wrist) lands on the control, a few mm in front of it */
  HAND.to.copy(tgt).addScaledVector(toCam, 0.008).addScaledVector(dir, -(HAND.mode === 'press' ? 0.165 : 0.13)); HAND.press = dir.clone();
  var pp = S.p; HAND.rush = !!(ANNC.horn || (pp && pp.tripped && pp.t - (pp.tripT || -1e9) < 120) || /TRIP/i.test(tip) || (crx && crx().sub < 15)); HAND.leanDir = tgt.clone().sub(cam.position); HAND.reachX = clamp(HAND.leanDir.length() - 0.42, 0.08, 1.05); HAND.leanDir.normalize(); HAND.leanDir.y = Math.max(-0.5, Math.min(0.2, HAND.leanDir.y)); HAND.crouch = clamp((1.15 - tgt.y) / 0.8, 0, 1); /* low control: bend the knees and look down */
  hd.visible = true; HAND.t = 0; hd.position.copy(HAND.from); hd.quaternion.copy(HAND.q0); handPose(0); }
function handTick(dt) { var hd = FEEL.hand; if (!hd || !hd.visible) { HAND.lean = 0; return; } HAND.t += dt / ((HAND.knob ? (HAND.rush ? 0.65 : 1.3) : (HAND.rush ? 0.45 : 0.95)) * (1 + 0.7 * (HAND.crouch || 0))); var t = HAND.t;
  var ease = function (x) { return x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3); }, inO = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); };
  var a = t < 0.42 ? ease(t / 0.42) : t < 0.62 ? 1 : 1 - inO((t - 0.62) / 0.38), pose = t < 0.3 ? inO(t / 0.3) : t < 0.7 ? 1 : 1 - inO((t - 0.7) / 0.3);
  /* arc: rise a little on the way in */
  hd.position.lerpVectors(HAND.from, HAND.to, a); hd.position.y += Math.sin(a * Math.PI) * 0.035;
  /* the press itself: a small push forward and back while holding */
  var KN = HAND.knob;
  if (t > 0.42 && t < 0.62) { var pk = Math.sin((t - 0.42) / 0.2 * Math.PI); hd.position.addScaledVector(HAND.press, (HAND.mode === 'press' ? 0.012 : 0.005) * pk); if (HAND.mode === 'grip' && !KN) hd.quaternion.copy(HAND.q1).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.35 * pk))); else hd.quaternion.copy(HAND.q1); }
  else hd.quaternion.copy(HAND.q0).slerp(HAND.q1, a);
  /* a real turn: fingers close on the knob, then the knob and the whole hand rotate together about the knob's own axis */
  if (KN) { var r = KN.r; if (KN.tgt == null && t >= 0.42) KN.tgt = KN.sw ? r.spring * 0.78 : r.ang(r.o.get());
    var kk = 0; if (KN.tgt != null) { if (KN.sw) kk = t < 0.53 ? inO((t - 0.43) / 0.1) : 1 - inO((t - 0.6) / 0.12); else kk = inO((t - 0.43) / 0.16); }
    var ang = KN.a0 + ((KN.tgt == null ? KN.a0 : KN.tgt) - KN.a0) * kk; r[KN.key] = ang;
    var Rq = new THREE.Quaternion().setFromAxisAngle(KN.ax, -(ang - KN.a0)); hd.position.sub(KN.c).applyQuaternion(Rq).add(KN.c); hd.quaternion.premultiply(Rq);
    if (t >= 1) { r.lock = false; HAND.knob = null; } }
  handPose(pose); HAND.lean = a; armIK(); if (t >= 1) { hd.visible = false; HAND.lean = 0; armIK(); } }

var QX, AX;
function realPose(k) { if (!QX) { QX = new THREE.Quaternion(); AX = new THREE.Vector3(1, 0, 0); } var R = HAND.real, rest = HAND.rest, press = HAND.mode === 'press';
  var curl = { index: press ? [0, 0.05, 0.05] : [0.85, 0.8, 0.5], middle: press ? [1.3, 1.45, 0.9] : [0.95, 0.9, 0.55], ring: press ? [1.4, 1.5, 0.95] : [1.05, 1.0, 0.6], pinky: press ? [1.45, 1.5, 1.0] : [1.15, 1.1, 0.7] }, relax = { index: [0.25, 0.3, 0.2], middle: [0.3, 0.35, 0.22], ring: [0.38, 0.4, 0.25], pinky: [0.45, 0.45, 0.3] }, seg = ['phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal'];
  Object.keys(curl).forEach(function (f) { seg.forEach(function (sg, j) { var n = f + '-finger-' + sg, b = R[n]; if (!b) return; var a = relax[f][j] + (curl[f][j] - relax[f][j]) * k; b.quaternion.copy(rest[n]).multiply(QX.setFromAxisAngle(AX, a * HAND.sign)); }); });
  [['thumb-phalanx-proximal', 0.2, press ? 0.6 : 0.4], ['thumb-phalanx-distal', 0.15, press ? 0.5 : 0.35]].forEach(function (t) { var b = R[t[0]]; if (b) b.quaternion.copy(rest[t[0]]).multiply(QX.setFromAxisAngle(AX, (t[1] + (t[2] - t[1]) * k) * HAND.sign)); }); }
HAND.sign = -1;

/* ================================================================ station life ================================================================
   Phone calls, field operators who take real time, day and night shifts with handovers, weather and the grid, PA announcements,
   a first-out trip panel, and the paper procedure binder. */
var WXN = { calm: '☀ Calm', wind: '💨 Windy', storm: '⛈ Storm' };
var LIFE = { callT: 1800, paT: 900, wxT: 1800, wx: 'calm', call: null, jobs: [], shiftH: null,
  ring: function () { var c = AUD.ctx; if (!c || !S.cfg.snd) return; var t = c.currentTime; for (var i = 0; i < 2; i++) { AUD.tone(t + i * 0.45, 440, 0.35, 'sine', 0.07); AUD.tone(t + i * 0.45, 480, 0.35, 'sine', 0.07); } },
  /* grid demand over the (12-hour real) day, as a share of the 1,250 MW turbine: lowest around 04:00, a morning rise as people wake,
     a midday plateau, the teatime peak when everyone cooks (17:00-19:00), then falling through the evening. Storms and wind add a little. */
  demandF: function () { var hr = ((D.clock % 86400) + 86400) % 86400 / 3600, K = [[0, 0.78], [2, 0.73], [4, 0.70], [6, 0.76], [8, 0.88], [10, 0.90], [12, 0.91], [14, 0.89], [16, 0.93], [17.5, 1.0], [19, 0.99], [21, 0.92], [23, 0.83], [24, 0.78]];
    for (var i = 1; i < K.length; i++) if (hr <= K[i][0]) { var a = K[i - 1], b = K[i], k = (hr - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k); var f = a[1] + (b[1] - a[1]) * k; break; }
    return Math.min(1, f + (LIFE.wx === 'storm' ? 0.02 : LIFE.wx === 'wind' ? 0.01 : 0)); },
  demandMW: function () { return LIFE.demandF() * 1250; },
  demandWhy: function () { var hr = ((D.clock % 86400) + 86400) % 86400 / 3600;
    return hr >= 16 && hr < 19.5 ? 'Teatime peak coming: everyone is home cooking.' : hr >= 6 && hr < 9 ? 'Morning pick-up: the country is waking up.' : hr >= 9 && hr < 16 ? 'Daytime demand from offices and industry.' : hr >= 19.5 && hr < 23 ? 'Evening demand is dropping off.' : 'Overnight minimum: demand is low.'; },
  /* big red station clock on the back wall above the boards, with grid demand underneath */
  wallClock: function () { if (!R3 || !R3.scene) return; var W = LIFE.wc; if (!W) { var cv = document.createElement('canvas'); cv.width = 512; cv.height = 192; var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.71), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); m.position.set(0, 3.95, ZB + 0.06); m.userData.noColl = true; R3.scene.add(m);
      var fr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.06), new THREE.MeshStandardMaterial({ color: 0x1a1d21, roughness: 0.5 })); fr.position.set(0, 3.95, ZB + 0.02); fr.userData.noColl = true; R3.scene.add(fr);
      W = LIFE.wc = { cv: cv, tx: tx, k: '' }; }
    var key = clockStr(D.clock).slice(0, 5) + Math.round(LIFE.demandF() * 100); if (key === W.k) return; W.k = key; var g = W.cv.getContext('2d');
    g.fillStyle = '#060708'; g.fillRect(0, 0, 512, 192); g.textAlign = 'center'; g.fillStyle = '#ff3b2f'; g.shadowColor = '#ff3b2f'; g.shadowBlur = 14; g.font = 'bold 118px ui-monospace,Consolas,monospace'; g.fillText(clockStr(D.clock).slice(0, 5), 256, 118);
    g.shadowBlur = 0; g.fillStyle = '#ffb347'; g.font = 'bold 30px ui-monospace,Consolas,monospace'; g.fillText('GRID DEMAND ' + Math.round(LIFE.demandMW()) + ' MW  ' + Math.round(LIFE.demandF() * 100) + '%', 256, 170); W.tx.needsUpdate = true; },
  calls: function () { var p = S.p, x = p.x, out = [];
    out.push({ who: '🧪 Chemistry lab', msg: 'Lab here. RCS boron came back at ' + Math.round(p.boron + gauss() * 3) + ' ppm, dose equivalent iodine ' + chem(p).i131.toFixed(3) + '. Everything in spec.', opts: [['Thanks, boron ' + Math.round(p.boron) + ' ppm, iodine in spec. Logging it.', 1], ['OK.', 0]], why: 'Repeat the key numbers back so both of you know they were heard right.' });
    if (x.tb.gen) { var dm = LIFE.demandMW(), dl = dm - x.tb.load; if (Math.abs(dl) >= 30) { var up = dl > 0, amt = Math.round(Math.abs(dl) / 10) * 10, tgtMW = Math.round(dm / 10) * 10, why = LIFE.demandWhy();
      out.push({ grid: 1, who: '⚡ National Grid control', msg: why + ' Can Unit 1 ' + (up ? 'raise' : 'reduce') + ' to ' + tgtMW + ' megawatts?', opts: [[(up ? 'Raise' : 'Reduce') + ' Unit 1 to ' + tgtMW + ' megawatts. I’ll confirm with my supervisor and call back.', 1], ['Yes, doing it now.', 0], ['We can’t change load right now.', 0]], why: 'Load changes go through the supervisor: repeat the request back, then get it authorised.',
        then: function () { var wrong = up ? tgtMW - 2 * amt : tgtMW + 2 * amt; CREW.issue({ say: 'National Grid wants Unit 1 at ' + tgtMW + ' megawatts. ' + (up ? 'Raise' : 'Reduce') + ' load to ' + tgtMW + ' megawatts at 10 megawatts per minute.', rb: [(up ? 'Raise' : 'Reduce') + ' load to ' + tgtMW + ' MW at 10 MW per minute.', (up ? 'Raise' : 'Reduce') + ' load to ' + wrong + ' MW at 10 MW per minute.', (up ? 'Reduce' : 'Raise') + ' load to ' + tgtMW + ' MW at 10 MW per minute.'], task: 'Turbine board: LOAD RATE 10, LOAD SET to ' + tgtMW + ' MW.', chk: function () { return Math.abs(x.tb.load - tgtMW) <= 15 && x.tb.lrate === 10; }, now: function () { return 'Load set ' + Math.round(x.tb.load) + ' MW'; }, rep: 'Unit 1 load set to ' + tgtMW + ' megawatts for National Grid.', mins: 30, xp: 1500 }); } }); } }
    out.push({ who: '🔧 Turbine hall operator', msg: 'Rounds report: small oil weep on main feed pump A bearing, about a drop a minute. Want me to keep an eye on it?', opts: [['Monitor it every hour and raise a work order. Call me if it gets worse.', 1], ['Ignore it.', 0]], why: 'Small defects get a work order and a watch, so they don’t grow into trips.', bad: function () { if (Math.random() < 0.5) { FAULT.insert('mfpA', true); } } });
    out.push({ who: '🚒 Site security', msg: 'Fire alarm on the turbine hall roof detector, zone 14. Patrol is on the way. Probably a false alarm from the weather.', opts: [['Zone 14 turbine hall roof, patrol attending. Report back when you have checked it.', 1], ['Probably nothing, carry on.', 0]], why: 'Every fire alarm is treated as real until it’s checked.' });
    out.push({ who: '🧑‍🔧 Maintenance', msg: 'We’d like to work on charging pump B today. Can you take it out of service and give us a permit?', opts: [['I’ll check the Tech Specs first: if both charging pumps aren’t needed, I’ll isolate pump B and issue the permit.', 1], ['Yes, go ahead now.', 0]], why: 'Before taking equipment out of service, check what the Tech Specs need running.' });
    return out; },
  ui: function () { var E = LIFE.el; if (!E) return; var c = LIFE.call; E.hidden = !c || !!S.menu; if (!c) return; if (E._c === c && E._st === c.st) return; E._c = c; E._st = c.st;
    E.innerHTML = '<div class="crh">☎ <b>' + esc(c.who) + '</b><span>' + (c.st ? 'call ended' : 'on the line') + '</span></div><div class="crm">“' + esc(c.msg) + '”</div>' + (c.st ? '<div class="crt">' + esc(c.st) + '</div><div class="crb row"><button data-pc="x">Hang up</button></div>' : '<div class="crb">' + c.opts.map(function (o, i) { return '<button data-po="' + i + '">🗣 ' + esc(o[0]) + '</button>'; }).join('') + '</div>'); },
  answer: function (i) { var c = LIFE.call, o = c.opts[i]; S.addLog('Phone, ' + c.who.replace(/^\S+\s/, '') + ': ' + o[0]); if (o[1]) { CAR.add(10, 'Good phone call'); c.st = '✔ Good answer. ' + c.why; if (c.then) c.then(); } else { c.st = '✘ ' + c.why; if (c.bad) c.bad(); } LIFE.ui(); },
  /* field operators: local jobs take minutes of plant time, with radio updates */
  JOBS: [['look', 'Investigate the alarms locally', 'I’ll go and have a look.'], ['edg', 'Start diesel generator A for its monthly test run', 'Heading to the diesel building.'], ['mfp', 'Reset main feed pump A trip locally', 'On my way to the feed pumps.'], ['seal', 'Check RCP seal leak-off locally', 'Going into the auxiliary building.']],
  job: function (k) { var p = S.p, J = LIFE.JOBS.filter(function (q) { return q[0] === k; })[0]; LIFE.jobs.push({ k: k, t: J[1], due: p.t + 120 + Math.random() * 180, mid: false }); LIFE.radio('Field operator: “' + J[2] + ' Over.”'); },
  radio: function (t) { S.addLog(t); toast('📻 ' + t); var c = AUD.ctx; if (c && S.cfg.snd) { AUD.noise(c.currentTime, 0.15, 1500, 1, 0.12); } },
  jobDone: function (j) { var x = S.p.x, f = x.f || {}, msg;
    if (j.k === 'look') { var a = FAULT.active()[0]; msg = a ? 'At the scene. ' + ({ porv: 'PRT is hot and the PORV tailpipe is roaring: a PORV is passing.', mfpA: 'Main feed pump A is stopped with its trip flag dropped. Bearing smells hot.', air: 'Both air compressors tripped. Receiver pressure falling.', ccw: 'Component cooling pumps are off, the motor breakers tripped.', sgtl: 'Air ejector radiation monitor is alarming locally, SG 1 blowdown reads high.', cw: 'The sea-water pumps have stopped: screens look blocked with seaweed.', drop: 'Rod drive cabinet shows an urgent failure on rod H-08.', msb: 'Loud steam noise in the containment annulus near loop 2.', loca: 'Containment sump pumps running, humidity high.', lb: 'Can’t get near containment: huge steam release.', grid: 'Switchyard breakers are open.', inst: 'Found a failed transmitter card in the instrument rack.' }[a.id] || 'Something’s not right here.') : (x.inF && !x.inF.sel ? 'Found a failed transmitter in the rack. Recommend you bypass that channel.' : 'Walked down the plant: nothing abnormal found.'); }
    else if (j.k === 'edg') { var g = x.el.edg[0]; g.run = true; msg = 'Diesel A started locally and running at 50 hertz. Ready for you to load it.'; }
    else if (j.k === 'mfp') { msg = f.mfpA ? 'Can’t reset it: the thrust bearing is damaged. Pump A needs maintenance.' : 'Feed pump A trip reset locally. You can start it from the control room.'; }
    else msg = 'Seal leak-off on all four RCPs is normal, about 11 litres a minute each.';
    LIFE.radio('Field operator: “' + msg + ' Over.”'); CAR.add(8, 'Field operator job'); },
  tick: function (dt, sim) { var p = S.p; if (!p) return; LIFE.wallClock(); var x = p.x, h = Math.floor(((D.clock % 86400) + 86400) % 86400 / 3600);
    /* jobs */ LIFE.jobs = LIFE.jobs.filter(function (j) { if (!j.mid && p.t > j.due - 60) { j.mid = true; LIFE.radio('Field operator: “At the location now, checking. Over.”'); } if (p.t >= j.due) { LIFE.jobDone(j); return false; } return true; });
    /* shift handover at 07:00 and 19:00 */ var sh = h >= 7 && h < 19 ? 'day' : 'night'; if (LIFE.shiftH && LIFE.shiftH !== sh) { CREW.say('Shift handover: ' + (sh === 'day' ? 'day' : 'night') + ' shift taking over. Plant ' + MODEN[D.mode] + (TS.active().length ? ', ' + TS.active().length + ' LCO(s) open' : ', no LCOs') + '. Read the log before you carry on.', 'lco'); S.addLog('SHIFT HANDOVER to ' + sh + ' shift');
      /* a full 12-hour shift with no reactor trip earns 10,000 XP */ if ((LIFE.shOn || 0) >= 11 * 3600 && S.st.trips === LIFE.shTrips && !S.p.tripped) { CAR.add(10000, 'Full shift completed with no trip', true); toast('🏆 Full shift completed safely: +10,000 XP', 'ok'); }
      else if ((LIFE.shOn || 0) >= 11 * 3600) toast('Shift ended, but there was a reactor trip on your watch: no full-shift bonus', 'warn');
      LIFE.shOn = 0; LIFE.shTrips = S.st.trips; }
    if (LIFE.shTrips == null) LIFE.shTrips = S.st.trips; LIFE.shOn = (LIFE.shOn || 0) + sim * 2; LIFE.shiftH = sh; LIFE.night = sh === 'night';
    if (FEEL.people) FEEL.people.walk.visible = !LIFE.night || (h % 2 === 0);
    /* weather and the grid */ LIFE.wxT -= sim; if (LIFE.wxT < 0) { LIFE.wxT = 3600 * (2 + Math.random() * 4); var nw = ['calm', 'calm', 'wind', 'storm'][Math.floor(Math.random() * 4)]; if (nw !== LIFE.wx) { LIFE.wx = nw; S.addLog('Weather: ' + WXN[nw]); if (nw === 'storm') toast('⛈ Storm warning: expect grid frequency swings and possible loss of offsite power.', 'warn'); } }
    var gn = LIFE.wx === 'storm' ? 0.03 : LIFE.wx === 'wind' ? 0.012 : 0; if (gn) D.grid = clamp(D.grid + gauss() * gn * Math.sqrt(Math.max(sim, 1e-3)), 49.6, 50.4);
    if (LIFE.wx === 'storm' && S.cfg.randEv && MS.phase() === 'free' && !(x.f && x.f.grid) && Math.random() < sim / 14400) FEAT_grid();
    /* phone calls and PA (free play, not during menus) */ if (MS.phase() === 'free' && !S.menu && !S.paused) { LIFE.callT -= Math.min(dt, 0.25); /* real time: the sim speed-up doesn't change how often the phone rings */ if (LIFE.callT < 0 && !LIFE.call && !CREW.q) { LIFE.callT = 1500 + Math.random() * 600; var cs = LIFE.calls(), gc = cs.filter(function (c) { return c.grid; }); LIFE.call = gc.length && Math.random() < 0.7 ? gc[0] : cs[Math.floor(Math.random() * cs.length)]; LIFE.ring(); }
      LIFE.paT -= dt; if (LIFE.paT < 0) { LIFE.paT = 400 + Math.random() * 600; var pa = ['Attention all personnel. This is a test of the site alarm system. No action is required.', 'Would the shift chemist please contact the control room.', 'Attention. Maintenance work is starting in the turbine hall. Hearing protection is required.', 'Attention all personnel. The weather forecast is for high winds this evening. Secure loose items on site.']; var t = pa[Math.floor(Math.random() * pa.length)]; if (S.cfg.snd && AUD.ctx) AUD.tone(AUD.ctx.currentTime, 700, 0.5, 'sine', 0.06); setTimeout(function () { speak(t); }, 600); toast('📢 ' + t); } }
    LIFE.ui(); LIFE.fo(); RADIO.tick(); },
  /* the first-out panel: which trip came first, until the trip is reset */
  fo: function () { var E = LIFE.foEl, p = S.p; if (!E) return; var on = p.tripped && p.firstOut && !S.menu; E.hidden = !on; if (on && E._f !== p.firstOut) { E._f = p.firstOut; E.innerHTML = '<b>FIRST OUT</b>' + esc(TRIPS[p.firstOut] || p.firstOut); } }
};
function FEAT_grid() { FAULT.insert('grid', true); S.addLog('Storm: lightning strike on the 400 kV line'); }
function lifeBuild() { var E = LIFE.el = h('div', 'cpncrew cpnphone', null, root); E.hidden = true; E.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); E.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init(); if (b.dataset.po != null) LIFE.answer(+b.dataset.po); if (b.dataset.pc) { LIFE.call = null; LIFE.ui(); } });
  LIFE.foEl = h('div', 'cpnfo', null, root); LIFE.foEl.hidden = true;
  /* the paper procedure binder on the console */
  var bd = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.32), new THREE.MeshStandardMaterial({ color: 0x1f4e9e, roughness: 0.7 })); bd.position.set(-0.95, 0.81, CZ + 0.18); bd.rotation.y = 0.25; R3.scene.add(bd); hit(bd, { tip: 'Procedure binder: the paper copies of the procedures. Click to open.', act: function () { binderMenu(); } });
  var rg = new THREE.Group(), rb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a1f1f, roughness: 0.5 })); rg.add(rb); var gr = new THREE.Mesh(new THREE.CircleGeometry(0.035, 20), new THREE.MeshStandardMaterial({ color: 0x222222 })); gr.position.set(-0.06, 0, 0.041); rg.add(gr); var dl = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshBasicMaterial({ color: 0xffb648 })); dl.position.set(0.05, 0.02, 0.041); rg.add(dl); var an = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.25), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 })); an.position.set(0.09, 0.17, 0); an.rotation.z = -0.3; rg.add(an);
  rg.position.set(1.0, 0.85, CZ + 0.05); rg.rotation.y = -0.35; R3.scene.add(rg); hit(rb, { tip: 'Desk radio: click to listen to music', act: function () { radioMenu(); } }); }
function binderMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); var id = PROC.id, P = id ? PROCS[id] : null, mk = S.p.x.bmk || (S.p.x.bmk = {});
  menu('<h1>📒 Procedure binder</h1>' + (P ? '<p class="cpnsub">' + esc(P.t) + '</p><p>Real operators place-keep: tick each step as it’s done and initial it, so anyone can see exactly where the procedure is.</p><ol class="cl" style="list-style:none;padding:0">' + P.s.map(function (s, i) { var k = id + i, d = i < PROC.i, m = mk[k]; return '<li style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08)"><button class="cpnb2" data-a="pk" data-k="' + k + '" style="min-width:64px">' + (m ? '✔ RO' : d ? '☐ initial' : '☐') + '</button><div><b>' + (i + 1) + '. ' + esc(s[0]) + '</b>' + (i === PROC.i ? ' <i style="color:#ffd34a">◀ you are here</i>' : '') + '<br><span class="cmnote">' + esc(s[1]) + '</span></div></li>'; }).join('') + '</ol>' : '<p>No procedure is open. E-0 opens itself after a trip; others start from 📘.</p>') + '<div class="cpnbtns"><button class="cpnb2" data-a="pm">📘 All procedures</button><button class="cpnb" data-a="x">Close the binder</button></div>', function (a, b) { if (a === 'pk') { mk[b.dataset.k] = !mk[b.dataset.k]; S.sfx('click'); binderMenu(); } if (a === 'pm') procMenu(); if (a === 'x') closeMenu(); }); }
function fieldMenu() { if (!S.menu) S.wasPaused = S.paused; setPause(true); menu('<h1>📻 Field operator</h1><p>Some jobs can only be done out in the plant. Your field operator walks there (it takes a few minutes of plant time) and radios back.</p>' + (LIFE.jobs.length ? '<p class="cpnsub">In progress: ' + LIFE.jobs.map(function (j) { return esc(j.t); }).join(', ') + '</p>' : '') + '<div class="cpnbtns" style="flex-direction:column;align-items:stretch">' + LIFE.JOBS.map(function (q) { return '<button class="cpnb2" data-a="job" data-k="' + q[0] + '">' + esc(q[1]) + '</button>'; }).join('') + '</div><p class="cmnote">Weather: ' + WXN[LIFE.wx] + ' · ' + (LIFE.night ? '🌙 Night shift' : '☀ Day shift') + ' · grid ' + D.grid.toFixed(3) + ' Hz</p><div class="cpnbtns"><button class="cpnb" data-a="x">Back</button></div>', function (a, b) { if (a === 'job') { LIFE.job(b.dataset.k); closeMenu(); } if (a === 'x') closeMenu(); }); }
/* ---------------------------------------------------------------- the radio ---------------------------------------------------------------- */
var RADIO = { st: [['Groove Salad (chill)', 'https://ice1.somafm.com/groovesalad-128-mp3'], ['Indie Pop Rocks', 'https://ice1.somafm.com/indiepop-128-mp3'], ['Lush (vocals)', 'https://ice1.somafm.com/lush-128-mp3'], ['DEF CON (electronic)', 'https://ice1.somafm.com/defcon-128-mp3'], ['Secret Agent (lounge)', 'https://ice1.somafm.com/secretagent-128-mp3'], ['Radio Paradise (rock mix)', 'https://stream.radioparadise.com/mp3-128']], a: null, cur: -1, vol: 0.5,
  play: function (i) { if (!RADIO.a) { RADIO.a = new Audio(); RADIO.a.preload = 'none'; RADIO.a.onerror = function () { toast('📻 That station isn’t reachable right now. Try another.', 'warn'); }; } RADIO.cur = i; RADIO.a.src = RADIO.st[i][1]; RADIO.a.volume = RADIO.vol; var pr = RADIO.a.play(); if (pr && pr.catch) pr.catch(function () { toast('📻 Couldn’t start the radio. Click play again.', 'warn'); }); },
  stop: function () { if (RADIO.a) { RADIO.a.pause(); RADIO.a.removeAttribute('src'); RADIO.a.load(); } RADIO.cur = -1; },
  tick: function () { if (!RADIO.a || RADIO.cur < 0) return; var duck = ANNC.horn || (S.p && S.p.tripped && S.p.t - (S.p.tripT || 0) < 30), v = duck ? RADIO.vol * 0.15 : RADIO.vol; v = !S.cfg.snd ? 0 : v; if (Math.abs(RADIO.a.volume - v) > 0.01) RADIO.a.volume += (v - RADIO.a.volume) * 0.2; } };
function radioMenu() { if (!S.menu) S.wasPaused = S.paused; menu('<h1>📻 Desk radio</h1><p>Music while you watch the plant. It turns itself down when an alarm sounds. (Real control rooms usually ban radios, so enjoy it here.)</p><div class="cpnbtns" style="flex-direction:column;align-items:stretch">' + RADIO.st.map(function (q, i) { return '<button class="cpnb2" data-a="st" data-i="' + i + '" aria-pressed="' + (RADIO.cur === i) + '">' + (RADIO.cur === i ? '▶ ' : '') + esc(q[0]) + '</button>'; }).join('') + '</div><label class="mvsl"><span>Volume</span><input type="range" id="rvol" min="0" max="1" step="0.05" value="' + RADIO.vol + '"><b></b></label><p class="cmnote">Stations: SomaFM and Radio Paradise, free listener-supported internet radio.</p><div class="cpnbtns">' + (RADIO.cur >= 0 ? '<button class="cpnb2" data-a="off">⏹ Turn off</button>' : '') + '<button class="cpnb" data-a="x">Back</button></div>', function (a, b) { if (a === 'st') { RADIO.play(+b.dataset.i); radioMenu(); } if (a === 'off') { RADIO.stop(); radioMenu(); } if (a === 'x') closeMenu(); });
  var r = document.getElementById('rvol'); if (r) r.addEventListener('input', function () { RADIO.vol = +r.value; if (RADIO.a) RADIO.a.volume = RADIO.vol; }); }

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
  { t: 'Steam dumps in STEAM PRESSURE mode, holding 74.8 bar', show: 'ms', h: 'On the main steam board, check the <b>DUMP MODE</b> selector is on STM PRESS, the controller is in AUTO, and steam pressure is 74.8 bar.', st: function (p) { return 'Dump mode ' + p.x.dumpMode + ' / ' + p.x.dumpCtl + ', steam pressure ' + p.Ps.toFixed(1) + ' bar'; }, ok: function (p) { return p.x.dumpMode === 'PRESS' && Math.abs(p.Ps - PSP) < 1.5; } },
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
/* ---------- 'do this now': the next concrete action for each step, with a progress bar and a ring on the control ---------- */
function nk(k) { return root && root.classList.contains('touch') ? '' : ' <kbd>' + k + '</kbd>'; }
STEPS[0].now = function (p) { var n = (p.rtb[0] ? 1 : 0) + (p.rtb[1] ? 1 : 0); if (!p.rtb[0]) return { a: 'Turn the <b>RTB A</b> handle to the right (CLOSE).', pct: n / 2, ring: 'rtbA' }; return { a: 'Now turn the <b>RTB B</b> handle to the right (CLOSE).', pct: n / 2, ring: 'rtbB' }; };
STEPS[1].now = function (p) { var tot = 0; SDB.forEach(function (b) { tot += Math.min(TOP, p.rods[b]); }); var b = SDB.filter(function (q) { return p.rods[q] < TOP; })[0], pct = tot / (TOP * 4); if (!b) return { a: 'All four shutdown banks are out.', pct: 1 };
  if (p.sel !== b) return { a: 'Turn the <b>BANK SELECTOR</b> to <b>' + b + '</b>.' + nk(String(SDB.indexOf(b) + 1)), pct: pct, ring: 'sel' };
  return { a: 'Hold the <b>rod lever</b> at <b>OUT</b>' + (nk('O') ? ' (or hold' + nk('O') + ')' : '') + ' until ' + b + ' reads 228. Now: <b>' + Math.round(p.rods[b]) + '</b>.', pct: pct, ring: 'lever' }; };
STEPS[2].now = function (p) { var o = p.oneM || [], last = o.length ? o[o.length - 1][1] : 1, pct = clamp(1 - last, 0, 1), pr = ecpFromOneM(p), near = pr != null && pr - p.pc < 45;
  if (p.sel !== 'MAN') return { a: 'Turn the <b>BANK SELECTOR</b> to <b>MAN</b> (the control banks).' + nk('5'), pct: pct, ring: 'sel' };
  if (p.c0 == null) return { a: 'Leave the rods alone while the reference count is taken: <b>' + Math.min(20, Math.floor(p.stillT || 0)) + ' / 20 s</b>.', pct: pct };
  if (p.lever > 0) { var d = p.pc - (p.lastPc || 0); return { a: 'Keep holding OUT… <b>' + d + '</b> steps pulled since the last point. Let go at about <b>' + (near ? 8 : 30) + '</b>.', pct: pct, ring: 'lever' }; }
  if (p.lastPc != null && p.pc - p.lastPc >= 20 && (p.stillT || 0) < 25) return { a: 'Let go and wait while the counts settle: <b>' + Math.floor(p.stillT || 0) + ' / 25 s</b>. A 1/M point is plotted after that.', pct: pct };
  return { a: near ? 'Nearly critical (prediction: ' + pcName(Math.min(pr, PCMAX)).replace('bank ', '') + '). Pull just <b>5–10 steps</b>, then let go and watch the counts.' : 'Hold the lever at <b>OUT</b> for about <b>30 steps</b>' + (nk('O') ? ' (' + nk('O') + ')' : '') + ', then let go.', pct: pct, ring: 'lever' }; };
STEPS[3].now = function (p) { var pct = clamp(MS.surT / 20, 0, 1); if (p.sur < 0.3) return { a: 'Startup rate is <b>' + p.sur.toFixed(2) + ' DPM</b>: pull <b>2–3 steps</b> OUT to raise it to 0.3–1.0.', pct: pct, ring: 'lever' }; if (p.sur > 1) return { a: 'Startup rate is <b>' + p.sur.toFixed(2) + ' DPM</b>, too fast: push <b>2–3 steps</b> IN.', pct: pct, ring: 'lever' }; return { a: 'Good: <b>' + p.sur.toFixed(2) + ' DPM</b>. Leave the rods alone: <b>' + Math.floor(MS.surT) + ' / 20 s</b>.', pct: pct }; };
STEPS[4].now = function (p) { var n = (p.srBlk[0] ? 1 : 0) + (p.srBlk[1] ? 1 : 0); if (!p6(p)) return { a: 'Wait for power to rise. The white <b>P-6</b> lamp lights at 1E-10 A (now ' + fmtSci(NI.ir[0], 1) + ' A).', pct: clamp((Math.log10(NI.ir[0]) + 12) / 2, 0, 0.95) * 0.5 };
  if (!p.srBlk[0]) return { a: '<b>P-6 is lit!</b> Press <b>SR TRIP BLOCK train A</b> now.', pct: 0.5 + n / 4, ring: 'srA' }; return { a: 'Now press <b>SR TRIP BLOCK train B</b>.', pct: 0.5 + n / 4, ring: 'srB' }; };
STEPS[5].now = function (p) { var pct = clamp(MS.poT / 30, 0, 1); if (D.pr < 0.5) return { a: 'Let power keep rising to 0.5–5%: now <b>' + (D.pr < 0.01 ? fmtSci(D.pr, 1) : D.pr.toFixed(2)) + '%</b>. If SUR drops below 0.2, pull 2 steps.', pct: pct, ring: p.sur < 0.2 ? 'lever' : null };
  if (Math.abs(p.sur) >= 0.1 || D.pr > 5) return { a: (p.sur > 0 ? 'Power ' + D.pr.toFixed(2) + '%, still rising: push <b>2–3 steps IN</b> to bring SUR to zero.' : 'SUR ' + p.sur.toFixed(2) + ', falling: pull <b>1–2 steps OUT</b>.'), pct: pct, ring: 'lever' }; return { a: 'Level at <b>' + D.pr.toFixed(2) + '%</b>. Hold it: <b>' + Math.floor(MS.poT) + ' / 30 s</b>.', pct: pct }; };
SHUT[0].now = function (p) { if (p.sel !== 'MAN') return { a: 'Turn the <b>BANK SELECTOR</b> to <b>MAN</b>.' + nk('5'), ring: 'sel' }; return { a: 'Hold the lever at <b>IN</b>' + (nk('I') ? ' (' + nk('I') + ')' : '') + ' until the white <b>P-6</b> lamp goes out.', ring: 'lever' }; };
SHUT[2].now = function (p) { if (p.sel !== 'MAN') return { a: 'Turn the <b>BANK SELECTOR</b> to <b>MAN</b>.' + nk('5'), ring: 'sel' }; return { a: 'Hold <b>IN</b> until every control bank reads 0 (' + pcName(p.pc) + ').', pct: 1 - p.pc / PCMAX, ring: 'lever' }; };
SHUT[3].now = function (p) { var b = ['SD', 'SC', 'SB', 'SA'].filter(function (q) { return p.rods[q] > 0; })[0]; if (!b) return { a: 'All rods in.', pct: 1 }; var tot = 0; SDB.forEach(function (q) { tot += p.rods[q]; }); if (p.sel !== b) return { a: 'Turn the <b>BANK SELECTOR</b> to <b>' + b + '</b>.' + nk(String(SDB.indexOf(b) + 1)), pct: 1 - tot / (4 * TOP), ring: 'sel' }; return { a: 'Hold <b>IN</b> until ' + b + ' reads 0. Now: <b>' + Math.round(p.rods[b]) + '</b>.', pct: 1 - tot / (4 * TOP), ring: 'lever' }; };
SHUT[4].now = function (p) { if (p.rtb[0]) return { a: 'Turn the <b>RTB A</b> handle to the left (TRIP).', ring: 'rtbA' }; return { a: 'Turn the <b>RTB B</b> handle to the left (TRIP).', ring: 'rtbB' }; };
var GUIDE = { m: null, key: '', at: { rtbA: [0.63, 0.52], rtbB: [0.93, 0.52], sel: [-0.16, 0.6], lever: [0.19, 0.58], srA: [-0.9, 0.6], srB: [-0.74, 0.6] } };
function guideTick(dt) { if (!SEC.rx) return; if (!GUIDE.m) { GUIDE.m = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.1, 40), new THREE.MeshBasicMaterial({ color: 0x59e0ff, transparent: true, depthTest: false, toneMapped: false })); GUIDE.m.rotation.x = -Math.PI / 2; GUIDE.m.renderOrder = 11; SEC.rx.desk.add(GUIDE.m); GUIDE.t = 0; }
  var ph = MS.phase(), P = ph === 'start' || ph === 'shut' ? phaseDef(ph) : null, s = P && P.list[firstOpen(P.list, MS[P.fl])], n = s && s.now && S.cfg.guide !== false ? s.now(S.p) : null, a = n && n.ring && GUIDE.at[n.ring];
  GUIDE.m.visible = !!a; if (!a) return; GUIDE.t += dt; GUIDE.m.position.set(a[0], 0.05, -a[1] * SL); var k = 1 + 0.18 * Math.sin(GUIDE.t * 5); GUIDE.m.scale.set(k, k, k); GUIDE.m.material.opacity = 0.55 + 0.4 * Math.sin(GUIDE.t * 5); }
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
function stepDone(list, i) { S.sfx('ok'); CAR.event('step', list === ASC ? 'asc' : list === SHUT ? 'shut' : 'start'); S.toast('✔ ' + list[i].t, 'ok'); S.addLog((list === SHUT ? 'Shutdown' : list === ASC ? 'Power ascension' : 'Startup') + ' step ' + (i + 1) + ' done: ' + list[i].t); clearHL(); HUD.dirty = true;
  if (list === STEPS) { if (i === 0) speak('Both reactor trip breakers closed.'); if (i === 1) speak('Shutdown banks fully withdrawn.'); if (i === 3) speak('Startup rate is steady.'); if (i === 4) speak('Source range trips blocked.'); }
  else if (list === ASC) { if (i === 2) speak('Generator synchronised.'); if (i === 4) speak('P 10 trips blocked.'); }
  else { if (i === 0) speak('Below P 6.'); if (i === 3) speak('All rods in.'); } }
function verifyPre(i) {
  var it = PRE[i], p = S.p; if (MS.pre[i]) return;
  if (it.ok(p)) { MS.pre[i] = true; S.sfx('ok'); CAR.event('pre'); toast('✔ Checked: ' + it.t, 'ok'); S.addLog('Pre-startup check: ' + it.t);
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
    { id: 'loca', t: 'Small-break LOCA', d: 'A 3 cm crack opens in a reactor coolant cold leg inside containment.', see: 'Charging can’t keep up: pressuriser level and pressure fall, containment pressure, humidity, sump level and area radiation rise. At 127 bar safety injection starts. Pressure then hangs at saturation while steam forms in the loops: watch subcooling, RVLIS and core exit temperatures on the core monitor (board 5 too).', resp: 'E-0: trip the reactor (or check it tripped), check SI. When SI is running and subcooling is lost, trip all four RCPs so the water isn’t pumped out of the break. Keep feeding the steam generators and cool down on the steam dumps or SG PORVs to bring RCS pressure down so more SI water gets in. Watch RVLIS: the core must stay covered.' },
    { id: 'msb', t: 'Steam line break (SG 2)', d: 'Main steam line 2 breaks inside containment, upstream of its MSIV.', see: 'Steam flow jumps, SG 2 pressure collapses, the RCS cools fast (and the cold water can push power up), containment pressure rises, SI on low steam pressure.', resp: 'E-0, then E-2: close all MSIVs if needed, isolate SG 2 (MSIV 2 shut, feed and AFW to it off) and let it boil dry. Watch for the RCS cooling too fast.' },
    { id: 'drop', t: 'Dropped rod', d: 'Rod H-08 of control bank D drops to the bottom.', see: 'Power and Tavg dip, the power range channels disagree (one reads low), QPTR rises, rod position deviation. In AUTO the other rods pull out.', resp: 'AOP dropped rod (📘): rods to MANUAL, power below 75%, recover the rod. Tech Specs 3.1.4 and 3.2.4.' },
    { id: 'lb', t: 'Large-break LOCA', d: 'A double-ended guillotine break of a cold leg: the design basis accident.', see: 'The RCS blows down in seconds, voids shut the reactor down, accumulators dump at 44 bar, containment goes to 2–3 bar, sprays start. RVLIS falls and the core uncovers until RHR and SI refill it.', resp: 'E-0 then E-1: check all ECCS pumps run and both containment sprays; trip the RCPs; watch core exit temperature and RVLIS as the core refloods.' },
    { id: 'inst', t: 'Instrument failure (random)', d: 'One channel fails: a power range detector, the controlling pressuriser pressure or SG level channel, or Tavg.', see: 'One reading disagrees with its partners, or a controller does something odd (sprays opening, a feed valve shutting, rods driving in).', resp: 'Compare channels, take the affected controller to MANUAL, then 📘 → Bypass failed channel (Tech Spec 3.3.1).' },
    { id: 'cw', t: 'Circulating water pumps trip', d: 'All the sea-water pumps for the condenser trip.', see: 'Condenser vacuum is lost in a minute or two. The turbine trips on low vacuum and the steam dumps are blocked (C-9).', resp: 'Expect the turbine trip and reactor trip. With no condenser, steam pressure is controlled by the SG PORVs. Feed with auxiliary feed. Restart a CW pump when the fault clears.' }
  ],
  active: function () { var f = S && S.p && S.p.x && S.p.x.f; if (!f) return []; return FAULT.list.filter(function (q) { return f[q.id]; }); },
  insert: function (id, quiet) { if (id === 'inst') { infInsert(INF[Math.floor(Math.random() * INF.length)].id); toast(quiet ? '⚠ The instructor has put a fault into the plant.' : '⚠ An instrument channel has failed. Find it.', 'bad'); return; } var x = S.p.x, q = FAULT.list.filter(function (k) { return k.id === id; })[0]; x.f = x.f || {}; x.f[id] = true; x.fT = x.fT || {}; x.fT[id] = { t: S.p.t, quiet: !!quiet, trip0: S.p.tripped }; S.addLog('INSTRUCTOR: fault inserted' + (quiet ? '' : ': ' + q.t)); AUD.sfx('deny');
    if (id === 'porv') S.p.x.pz.prtP = Math.max(S.p.x.pz.prtP, 0.3); toast(quiet ? '⚠ The instructor has put a fault into the plant. Watch the alarms.' : '⚠ Fault: ' + q.t, 'bad'); HUD.dirty = true; HUD.el.ms.dataset.cur = ''; },
  clear: function () { var x = S.p.x; Object.keys(x.fT || {}).forEach(function (id) { var inf = x.fT[id]; if (!inf.done && S.p.t - inf.t >= 300) { inf.done = true; CAR.rateFault(id, inf); } }); x.fT = {}; if (x.f && x.f.grid) x.el.grid = true; x.f = {}; x.inF = null; S.addLog('INSTRUCTOR: all faults cleared'); toast('All faults cleared. Systems can be restored.', 'ok'); HUD.dirty = true; HUD.el.ms.dataset.cur = ''; }
};
/* ================================================================ Crisis Shift: the arcade mode ================================================================
   Ten minutes at 50% power. A fresh fault lands every minute or so, faster as the waves climb; from wave 4 some arrive unannounced.
   Points for every megawatt you keep on the grid and a big bonus for each fault you ride out. Three reactor trips and the shift is over. */
var CRISIS = { on: false, t: 0, dur: 600, wave: 0, next: 0, score: 0, lives: 3, trips0: 0, hud: null, acc: 0,
  pool: ['grid', 'porv', 'mfpA', 'air', 'ccw', 'sgtl', 'loca', 'msb', 'drop', 'cw'],
  best: function () { var c = rd(); return c.crisisBest || 0; },
  start: function () { atPowerStart(); CRISIS.on = true; CRISIS.t = 0; CRISIS.wave = 0; CRISIS.next = 20; CRISIS.score = 0; CRISIS.lives = 3; CRISIS.trips0 = S.st.trips; CRISIS.acc = 0; setTS(1);
    if (!CRISIS.hud) { CRISIS.hud = h('div', 'cpncrisis', null, root); } CRISIS.hud.hidden = false; CRISIS.draw();
    S.addLog('CRISIS SHIFT started: keep Unit 1 on line through whatever comes'); toast('⚡ Crisis shift: first fault in 20 seconds. Keep the unit on line.', 'warn'); speak('Crisis shift. Stand by.'); },
  reset: function () { S.p = atPowerPlant(575); S.p.x.f = {}; S.p.x.fT = {}; for (var i = 0; i < 8; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.addLog('Unit reset to 50% power by the instructor'); },
  tick: function (sim) { if (!CRISIS.on) return; var p = S.p, x = p.x; CRISIS.t += sim; CRISIS.acc += sim;
    if (x.tb.gen && x.tb.mw > 0) CRISIS.score += x.tb.mw / 1150 * 10 * sim;
    if (S.st.trips > CRISIS.trips0) { CRISIS.trips0 = S.st.trips; CRISIS.lives--; AUD.sfx('deny'); if (CRISIS.lives <= 0) { CRISIS.end('Three reactor trips'); return; } toast('💥 Reactor trip! ' + CRISIS.lives + (CRISIS.lives === 1 ? ' life' : ' lives') + ' left. Resetting to 50% power…', 'bad'); speak('Reactor trip. ' + CRISIS.lives + ' left.'); CRISIS.reset(); CRISIS.next = Math.max(CRISIS.next, 25); return; }
    var fT = x.fT || {}; Object.keys(fT).forEach(function (id) { var inf = fT[id]; if (inf.done || p.t - inf.t < 150) return; inf.done = true;
      var safe = x.pz.P > 90 && x.sg.every(function (s) { return s.L > 5; }) && D.sub > 3 && p.Tavg < 315, kept = !p.tripped && x.tb.gen, pts = kept ? 400 + 100 * CRISIS.wave : safe ? 120 : 20; if (inf.quiet) pts = Math.round(pts * 1.5);
      CRISIS.score += pts; var q = FAULT.list.filter(function (z) { return z.id === id; })[0]; toast('🛠 ' + (q ? q.t : 'Fault') + ' survived: +' + pts, kept ? 'ok' : 'warn'); AUD.sfx('step');
      x.f[id] = false; delete fT[id]; if (id === 'grid') x.el.grid = true; });
    if (CRISIS.t >= CRISIS.dur) { CRISIS.end('Shift complete'); return; }
    CRISIS.next -= sim; if (CRISIS.next <= 0 && !p.tripped) { CRISIS.wave++; var live = x.f || {}, c = CRISIS.pool.filter(function (id) { return !live[id]; }); if (c.length) { var id = c[Math.floor(Math.random() * c.length)]; FAULT.insert(id, CRISIS.wave >= 4 && Math.random() < 0.5); speak('Wave ' + CRISIS.wave + '.'); } CRISIS.next = Math.max(35, 105 - CRISIS.wave * 10); }
    if (CRISIS.acc >= 0.5) { CRISIS.acc = 0; CRISIS.draw(); } },
  draw: function () { if (!CRISIS.hud) return; var left = Math.max(0, CRISIS.dur - CRISIS.t), hearts = '❤️'.repeat(CRISIS.lives) + '🖤'.repeat(3 - CRISIS.lives), nxt = Math.max(0, Math.ceil(CRISIS.next));
    CRISIS.hud.innerHTML = '<b>' + Math.round(CRISIS.score).toLocaleString() + '</b><span>SCORE</span><em>' + fmtT(left) + '</em><span>LEFT</span><em>W' + CRISIS.wave + '</em><span>' + (nxt <= 10 ? 'FAULT IN ' + nxt + 's' : 'NEXT ' + nxt + 's') + '</span><i>' + hearts + '</i>'; CRISIS.hud.classList.toggle('hot', nxt <= 10 && !S.p.tripped); },
  end: function (why) { CRISIS.on = false; if (CRISIS.hud) CRISIS.hud.hidden = true; var sc = Math.round(CRISIS.score), c = rd(), best = c.crisisBest || 0, nb = sc > best; if (nb) { c.crisisBest = sc; wr(c); }
    var xp = Math.round(sc / 10); CAR.add(xp, 'Crisis shift: ' + sc + ' points', true); FAULT.clear(); setPause(true); S.wasPaused = true;
    menu('<h1>⚡ ' + esc(why) + '</h1><p style="font-size:34px;margin:6px 0"><b>' + sc.toLocaleString() + '</b> points' + (nb ? ' · <span style="color:#ffd34a">NEW BEST</span>' : ' · best ' + best.toLocaleString()) + '</p>' +
      '<p>' + CRISIS.wave + ' waves · ' + (3 - CRISIS.lives) + ' reactor trip' + (3 - CRISIS.lives === 1 ? '' : 's') + ' · ' + fmtT(Math.min(CRISIS.t, CRISIS.dur)) + ' survived · +' + xp + ' XP</p>' +
      '<div class="cpnbtns"><button class="cpnb" data-a="again">⚡ Go again</button><button class="cpnb2" data-a="menu">Main menu</button></div>',
      function (a) { if (a === 'again') { CRISIS.start(); begin(); } if (a === 'menu') startMenu(); }); }
};
/* ================================================================ Full shift: 12 real hours ================================================================
   A whole operating shift in real time: pre-startup checks, take it critical, run the plant, then shut it down and hand over,
   all inside 12 hours of your real life. One hour of overrun is allowed; after that the oncoming crew takes the keys. */
var FULL_SHIFT = { on: false, starts0: 0, shuts0: 0, warned: {}, at: 0,
  start: function () { freshState(false); FULL_SHIFT.on = true; FULL_SHIFT.starts0 = CAR.p.st.starts; FULL_SHIFT.shuts0 = CAR.p.st.shuts; FULL_SHIFT.warned = {}; FULL_SHIFT.at = Date.now(); S.cfg.shift = 720; S.shiftUsed = 0; S.shiftWarn = false; S.shiftOver = false; saveCfg(); save();
    S.addLog('FULL SHIFT: 12 real hours. Objective: start Unit 1 up, run it, and shut it down before handover (1 h overrun allowed)'); toast('🕛 Full shift started: 12 real hours. Start it up, run it, shut it down.', 'ok'); },
  started: function () { return CAR.p.st.starts > FULL_SHIFT.starts0; }, shut: function () { return CAR.p.st.shuts > FULL_SHIFT.shuts0; },
  tick: function () { if (!FULL_SHIFT.on || !S.p) return; var used = S.shiftUsed, left = 720 * 60 - used, W = FULL_SHIFT.warned;
    [[6 * 3600, 'six'], [3 * 3600, 'three'], [3600, 'one']].forEach(function (m) { if (left <= m[0] && !W[m[1]]) { W[m[1]] = 1; var hrs = Math.round(m[0] / 3600); toast('🕛 ' + hrs + ' hour' + (hrs > 1 ? 's' : '') + ' of shift left' + (FULL_SHIFT.shut() ? '.' : FULL_SHIFT.started() ? ': plan the shutdown.' : ': the reactor still needs starting up.'), 'warn'); speak(hrs + (hrs > 1 ? ' hours' : ' hour') + ' left on shift.'); } });
    if (FULL_SHIFT.shut() && FULL_SHIFT.started() && !W.done) { W.done = 1; var ot = used > 720 * 60; CAR.add(ot ? 1500 : 3000, 'Full 12-hour shift: started up and shut down' + (ot ? ' (in overrun)' : ''), true); S.addLog('FULL SHIFT OBJECTIVE COMPLETE' + (ot ? ' (within the 1 h overrun)' : '')); toast('🏆 Objective complete: Unit 1 started up and shut down. +' + (ot ? 1500 : 3000) + ' XP', 'ok'); speak('Shift objective complete. Well done.'); }
    if (used >= 13 * 3600 && !W.fail) { W.fail = 1; FULL_SHIFT.on = false; if (!W.done) { S.addLog('FULL SHIFT: overrun exceeded, oncoming crew has taken over'); setPause(true); S.wasPaused = true; menu('<h1>🕐 Overrun exceeded</h1><p>13 hours in and the oncoming crew has taken the keys. ' + (FULL_SHIFT.started() ? 'The reactor was started but not shut down' : 'The reactor was never started') + ' in time.</p><div class="cpnbtns"><button class="cpnb" data-a="again">🕛 New full shift</button><button class="cpnb2" data-a="menu">Main menu</button></div>', function (a) { if (a === 'again') { FULL_SHIFT.start(); begin(); } if (a === 'menu') startMenu(); }); } } }
};
/* ================================================================ fun facts and station life ================================================================ */
var FACTS = [
  'One uranium fuel pellet the size of a fingertip holds as much energy as a tonne of coal.',
  'Delayed neutrons are only 0.65% of all neutrons, but without them a reactor would be impossible to control by hand.',
  'The water in the primary circuit is at 155 bar so it stays liquid at over 300 °C: that is 150 times atmospheric pressure.',
  'Each reactor coolant pump moves about 5 tonnes of water every second and draws 6 MW: as much as a small town.',
  'The containment building walls are over a metre of steel-reinforced concrete, lined with 6 mm of steel plate.',
  'Xenon-135 is the strongest neutron absorber known. After a trip it peaks about 9 hours later and can keep a reactor shut down for a day.',
  'Operators plot 1/M during a startup because the straight line through the points predicts exactly where the reactor goes critical.',
  'A reactor trip drops every rod into the core by gravity in under 2 seconds.',
  'Decay heat is 6–7% of full power the instant after shutdown: still over 200 MW of heat with no fission at all.',
  'The Doppler effect in hot fuel makes a PWR self-limiting: hotter fuel absorbs more neutrons, so power pushes back on itself.',
  'Boron in the coolant soaks up neutrons: operators dilute it a few litres at a time to make up for fuel burning away over the cycle.',
  'A control room annunciator uses a "first-out" window so the crew can tell which alarm started a trip sequence.',
  'UK control room operators train for about three years and re-qualify in the simulator every year, with surprise faults.',
  'Three Mile Island in 1979 began with a pressuriser relief valve that stuck open and an indicator that said it was shut.',
  'The turbine spins at 3000 rpm, exactly the grid frequency of 50 Hz, and its blades tips move faster than the speed of sound.',
  'Source range detectors count single neutrons: a few hundred a second at shutdown, from a start-up source in the core.',
  'Hinkley Point C’s two reactors will make about 3.2 GW of electricity, roughly 7% of the whole UK’s demand.',
  'Steam generators have thousands of U-shaped tubes: in a four-loop plant there is over 300 km of tubing.',
  'The point of adding heat is where fission heat first beats the heat the coolant pumps add: the reactor starts warming itself.',
  'Subcooling margin is how far the hottest coolant is below boiling. Operators guard it closely: if it hits zero the core can uncover.',
  'A full-power day burns about 3 kg of uranium-235. The same electricity from coal would take 10,000 tonnes.',
  'Reactor operators talk in three-way communication: order, repeat back, confirm. It stops mishearing in a noisy control room.',
  'Shift crews on a nuclear site work 12-hour shifts, usually days then nights, with a full handover briefing in between.',
  'The pressuriser is the only place in the primary circuit with a steam bubble: heaters and sprays use it to set the pressure.'
];
var LIFE2 = { fT: 0, aT: 0, fi: 0, el: null,
  lines: ['Field operator: “Turbine hall rounds complete, nothing abnormal. Over.”', 'Field operator: “Diesel A oil level checked and topped up. Over.”', 'Radio: “Security, east gate: contractor vehicle entering site.”', 'Tannoy: “Attention all personnel. This is a routine test of the site alarm system.”', 'Field operator: “Condensate pump B bearing sounds fine, temperature normal. Over.”', 'Radio: “Chemistry here: primary boron sample on its way to the control room.”', 'Field operator: “Switchyard walkdown done, all breakers as indicated. Over.”', 'Tannoy: “The canteen is now open for the night meal.”', 'Radio: “Maintenance: work order on MFP A oil cooler cleared, equipment back to operations.”', 'Field operator: “Containment hatch verified closed and latched. Over.”'],
  tick: function (dt) { if (S.menu || S.paused) return; LIFE2.fT += dt; LIFE2.aT += dt;
    if (LIFE2.fT >= 240) { LIFE2.fT = 0; var f = FACTS[(LIFE2.fi++ + Math.floor(Math.random() * 3)) % FACTS.length]; LIFE2.show('💡 ' + f); }
    if (LIFE2.aT >= 330 + Math.random() * 120) { LIFE2.aT = 0; var l = LIFE2.lines[Math.floor(Math.random() * LIFE2.lines.length)]; S.addLog(l); toast('📻 ' + l); if (AUD.ctx && S.cfg.snd) AUD.noise(AUD.ctx.currentTime, 0.15, 1500, 1, 0.1); } },
  show: function (t) { if (!LIFE2.el) LIFE2.el = h('div', 'cpnfact', null, root); var e = LIFE2.el; e.textContent = t; e.classList.add('show'); clearTimeout(LIFE2.to); LIFE2.to = setTimeout(function () { e.classList.remove('show'); }, 14000); }
};
/* ================================================================ windows: the reactor hall and the view outside ================================================================ */
function drawReactorWin(g) { var W = 1024, H = 640, p = S.p, pw = clamp(D.pr / 100, 0, 1), crit = p && p.everCrit;
  var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0d141c'); sky.addColorStop(1, '#1b232c'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  /* reactor hall: the vessel head in its cavity, refuelling crane, steel liner, blue glow proportional to power */
  g.fillStyle = '#3a4047'; g.fillRect(0, 470, W, 170); g.fillStyle = '#2a2f35'; g.fillRect(260, 440, 504, 40);
  var glow = g.createRadialGradient(512, 450, 10, 512, 450, 340); glow.addColorStop(0, 'rgba(90,170,255,' + (0.08 + pw * 0.6) + ')'); glow.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  var pool = g.createLinearGradient(0, 440, 0, 480); pool.addColorStop(0, 'rgba(70,160,255,' + (0.35 + pw * 0.55) + ')'); pool.addColorStop(1, 'rgba(20,60,140,0.9)'); g.fillStyle = pool; g.fillRect(290, 445, 444, 35);
  g.fillStyle = '#8a8f96'; g.beginPath(); g.ellipse(512, 445, 190, 48, 0, Math.PI, 0); g.fill(); g.fillStyle = '#6f757c'; g.beginPath(); g.ellipse(512, 445, 190, 48, 0, 0, Math.PI); g.fill();
  for (var i = 0; i < 9; i++) { g.fillStyle = '#b9bec4'; g.fillRect(380 + i * 32, 330, 14, 115); g.fillStyle = '#5b6168'; g.fillRect(376 + i * 32, 322, 22, 10); }
  g.fillStyle = '#4a5058'; g.fillRect(60, 80, W - 120, 22); g.fillRect(150, 102, 16, 240); g.fillStyle = '#d8a526'; g.fillRect(120, 60, 80, 20); g.fillRect(140, 102, 36, 200);
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,245,210,.9)'; g.fillRect(140 + i * 150, 30, 60, 8); var lg = g.createRadialGradient(170 + i * 150, 34, 0, 170 + i * 150, 34, 120); lg.addColorStop(0, 'rgba(255,240,200,.35)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = lg; g.fillRect(50 + i * 150, 30, 240, 240); }
  g.fillStyle = '#c9cdd2'; g.font = 'bold 26px ' + FONT; g.textAlign = 'left'; g.fillText('REACTOR HALL · UNIT 1', 30, 600); g.textAlign = 'right'; g.fillStyle = crit ? '#7fd1ff' : '#9fa8b2'; g.fillText(crit ? 'CRITICAL · ' + D.pr.toFixed(D.pr < 10 ? 2 : 0) + ' %' : 'SHUTDOWN', W - 30, 600);
  g.strokeStyle = '#1a1d21'; g.lineWidth = 22; g.strokeRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); }
var AURORA_IMG = new Image(); AURORA_IMG.src = 'models/aurora.jpg';
function drawLandscape(g) { if (AURORA_IMG.complete && AURORA_IMG.naturalWidth) { g.drawImage(AURORA_IMG, 0, 0, 1024, 640); return; } var W = 1024, H = 640, t = performance.now() / 1000, hr = ((D.clock || 0) / 3600) % 24, night = clamp(1 - Math.abs(hr - 13) / 7, 0, 1); night = 1 - night; /* 0 at 13:00, 1 at night */
  var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, night > 0.6 ? '#04071a' : night > 0.3 ? '#2a3360' : '#6fb0ff'); sky.addColorStop(0.7, night > 0.6 ? '#0b1a33' : night > 0.3 ? '#d97a4a' : '#bcdcff'); sky.addColorStop(1, night > 0.6 ? '#101c2e' : '#e9f2ff'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if (night > 0.4) { g.fillStyle = 'rgba(255,255,255,' + (night - 0.4) + ')'; for (var i = 0; i < 90; i++) { var sx = (i * 137.5) % W, sy = (i * 71.3) % 330; g.fillRect(sx, sy, i % 3 ? 1.5 : 2.5, i % 3 ? 1.5 : 2.5); }
    g.globalCompositeOperation = 'lighter'; for (var b = 0; b < 4; b++) { g.beginPath(); for (var x = 0; x <= W; x += 16) { var y = 120 + b * 45 + Math.sin(x * 0.006 + t * 0.35 + b) * 55 + Math.sin(x * 0.021 - t * 0.5 + b * 2) * 22; if (!x) g.moveTo(x, y); else g.lineTo(x, y); }
      g.strokeStyle = ['rgba(60,255,160,', 'rgba(80,220,255,', 'rgba(190,90,255,', 'rgba(70,255,120,'][b] + (0.12 + 0.1 * Math.sin(t * 0.7 + b) + 0.14) * (night - 0.4) * 1.6 + ')'; g.lineWidth = 60 + 30 * Math.sin(t * 0.3 + b); g.lineCap = 'round'; g.stroke(); }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(255,250,230,' + (0.9 * (night - 0.4)) + ')'; g.beginPath(); g.arc(850, 110, 26, 0, 6.3); g.fill(); }
  var mts = [['#1a2a44', 300, 0.9], ['#15223a', 360, 0.7], ['#0e1829', 420, 0.5]]; mts.forEach(function (m, k) { g.fillStyle = night > 0.6 ? m[0] : ['#5b6f8a', '#4a5d78', '#36485f'][k]; g.beginPath(); g.moveTo(0, H); for (var x = 0; x <= W; x += 8) { var y = m[1] - Math.abs(Math.sin(x * 0.004 * (k + 1) + k)) * 170 * m[2] - Math.sin(x * 0.03 + k) * 10; g.lineTo(x, y); } g.lineTo(W, H); g.closePath(); g.fill();
    if (!k) { g.fillStyle = 'rgba(240,246,255,' + (night > 0.6 ? 0.55 : 0.9) + ')'; for (var x2 = 0; x2 <= W; x2 += 8) { var yy = m[1] - Math.abs(Math.sin(x2 * 0.004 + 0)) * 170 * m[2]; if (yy < 215) g.fillRect(x2, yy, 8, (215 - yy) * 0.45); } } });
  g.fillStyle = night > 0.6 ? '#0a1322' : '#2f4a3a'; g.fillRect(0, 470, W, H - 470); g.fillStyle = night > 0.6 ? '#0e1a2c' : '#3b5f8a'; g.beginPath(); g.ellipse(560, 560, 420, 60, 0, 0, 6.3); g.fill();
  if (night > 0.6) { g.globalAlpha = 0.25 * (night - 0.6) * 2.5; g.globalCompositeOperation = 'lighter'; g.fillStyle = '#4fe0a0'; g.beginPath(); g.ellipse(560, 560, 380, 40, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  /* the two cooling towers and the turbine hall roof, with the station lights on at night */
  g.fillStyle = night > 0.6 ? '#1b2430' : '#9aa4ad'; g.fillRect(40, 400, 90, 80); g.beginPath(); g.moveTo(140, 480); g.lineTo(155, 360); g.lineTo(205, 360); g.lineTo(220, 480); g.closePath(); g.fill(); g.fillStyle = night > 0.6 ? 'rgba(255,220,150,.9)' : 'rgba(255,255,255,.5)'; for (i = 0; i < 6; i++) g.fillRect(50 + i * 13, 440, 4, 4); g.fillRect(170, 356, 10, 6);
  g.strokeStyle = '#1a1d21'; g.lineWidth = 22; g.strokeRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.moveTo(60, 30); g.lineTo(300, 30); g.lineTo(90, 300); g.lineTo(40, 300); g.closePath(); g.fill(); }
function addWindows(scene) { var frame = function (x, z, ry) { var m = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.45, 0.08), new THREE.MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.6, metalness: 0.3 })); m.position.set(x, 2.45, z); m.rotation.y = ry; scene.add(m); };
  frame(-RX + 0.05, RZC - 2.6, Math.PI / 2); screenMesh(scene, 2.1, 1.3, 1024, 640, drawReactorWin, 0.5, -RX + 0.1, 2.45, RZC - 2.6, Math.PI / 2, function () { return 'Window into the reactor hall: the vessel head in its cavity. The blue glow is Cherenkov light, brighter with power.'; }, 'winr');
  frame(-RX + 0.05, RZC + 2.6, Math.PI / 2); screenMesh(scene, 2.1, 1.3, 1024, 640, drawLandscape, 0.12, -RX + 0.1, 2.45, RZC + 2.6, Math.PI / 2, function () { return 'The view outside: mountains, the cooling towers, and on a clear night the aurora. The scene follows the station clock.'; }, 'winl'); }
/* ================================================================ the corridor and the reactor hall ================================================================
   A door in the west wall, between the two windows, leads down a short corridor into the reactor hall: the vessel head in its
   cavity, the refuelling pool, the polar crane overhead. Walk in with the reactor at power and the area monitors show it. */
var HALL = { door: 1.3, cx: -RX - 8, cz: RZC, cw: 2.6, hx: -RX - 8, hw: 18, hd: 18, vx: -RX - 17, in: false, near: null, glow: null, mon: null };
function inHallArea(x, z) { var m = 0.35; if (x >= RX - 0.6 && x <= RX + 0.8 && z > 9.05 && z < 10.75) return true; if (x > RX + 0.3 && x < RX + 70 && z > -60 && z < 70) return true; if (x > -RX + m && x < RX - m && z > ZB + m && z < ZF - m) return true; /* control room */
  if (x <= -RX + m && x >= HALL.hx + 0.2 && Math.abs(z - HALL.cz) < HALL.cw / 2 - m) return true; /* corridor */
  if (x <= HALL.hx + 0.3 && x >= HALL.hx - HALL.hw + m && Math.abs(z - HALL.cz) < HALL.hd / 2 - m) { if (Math.hypot(x - HALL.vx, z - HALL.cz) < 4.6) return false; return true; } /* hall, minus the cavity railing */
  return false; }
function addHall(scene) { var cz = HALL.cz, cw = HALL.cw, hx = HALL.hx, hw = HALL.hw, hd = HALL.hd, vx = HALL.vx, HH = 14;
  /* ---- materials: painted concrete with panel joints, epoxy floor with a grid, galvanised steel, safety yellow ---- */
  var mkTex = function (w, h, draw, rep) { var c = CV(w, h); draw(c.getContext('2d'), w, h); var t = texOf(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; };
  var concT = mkTex(1024, 1024, function (g, w, h) { g.fillStyle = '#8f928d'; g.fillRect(0, 0, w, h);
    for (var j = 0; j < 40; j++) { var sx = Math.random() * w, sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, 'rgba(60,58,52,.3)'); sg.addColorStop(1, 'rgba(60,58,52,0)'); g.fillStyle = sg; g.fillRect(sx, 0, 3 + Math.random() * 14, h * (0.3 + Math.random() * 0.7)); }
    for (j = 0; j < 160; j++) { var bx = Math.random() * w, by = Math.random() * h, br = 15 + Math.random() * 90, bg = g.createRadialGradient(bx, by, 0, bx, by, br); bg.addColorStop(0, Math.random() < 0.5 ? 'rgba(70,72,70,.22)' : 'rgba(180,182,176,.22)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(bx - br, by - br, 2 * br, 2 * br); }
    for (var i = 0; i < 60000; i++) { var v = 100 + Math.random() * 80; g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 6) + ',.4)'; g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6); }
    for (i = 0; i < 900; i++) { g.fillStyle = 'rgba(40,40,38,.5)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 0, 6.3); g.fill(); }
    g.strokeStyle = 'rgba(50,52,50,.7)'; g.lineWidth = 5; g.strokeRect(2, 2, w / 2 - 4, h / 2 - 4); g.strokeRect(w / 2 + 2, 2, w / 2 - 4, h / 2 - 4); g.strokeRect(2, h / 2 + 2, w / 2 - 4, h / 2 - 4); g.strokeRect(w / 2 + 2, h / 2 + 2, w / 2 - 4, h / 2 - 4); g.strokeStyle = 'rgba(200,202,196,.35)'; g.lineWidth = 2; g.strokeRect(8, 8, w / 2 - 16, h / 2 - 16); g.strokeRect(w / 2 + 8, 8, w / 2 - 16, h / 2 - 16); g.strokeRect(8, h / 2 + 8, w / 2 - 16, h / 2 - 16); g.strokeRect(w / 2 + 8, h / 2 + 8, w / 2 - 16, h / 2 - 16);
    g.fillStyle = 'rgba(40,42,40,.8)'; [0.1, 0.4, 0.6, 0.9].forEach(function (px) { [0.1, 0.4, 0.6, 0.9].forEach(function (py) { g.beginPath(); g.arc(px * w, py * h, 7, 0, 6.3); g.fill(); g.fillStyle = 'rgba(120,122,118,.5)'; g.beginPath(); g.arc(px * w - 2, py * h - 2, 4, 0, 6.3); g.fill(); g.fillStyle = 'rgba(40,42,40,.8)'; }); });
    var dg = g.createLinearGradient(0, h * 0.86, 0, h); dg.addColorStop(0, 'rgba(50,48,44,0)'); dg.addColorStop(1, 'rgba(50,48,44,.35)'); g.fillStyle = dg; g.fillRect(0, 0, w, h); }, [1, 1]);
  var conc = new THREE.MeshStandardMaterial({ map: concT, bumpMap: concT, bumpScale: 0.8, roughness: 0.92 }), concW = function (w, h) { var m = conc.clone(); m.map = concT.clone(); m.map.needsUpdate = true; m.map.repeat.set(w / 6, h / 6); m.bumpMap = m.map; return m; };
  var floorT = mkTex(1024, 1024, function (g, w, h) { g.fillStyle = '#616b6e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) { var r = 20 + Math.random() * 120, x = Math.random() * w, y = Math.random() * h, gr = g.createRadialGradient(x, y, 0, x, y, r), v = Math.random() < 0.5 ? '70,78,80' : '120,128,130'; gr.addColorStop(0, 'rgba(' + v + ',.12)'); gr.addColorStop(1, 'rgba(' + v + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (i = 0; i < 22000; i++) { var c = 80 + Math.random() * 60; g.fillStyle = 'rgba(' + c + ',' + (c + 6) + ',' + (c + 8) + ',.35)'; g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6); }
    g.strokeStyle = 'rgba(30,30,28,.18)'; g.lineWidth = 2; for (i = 0; i < 40; i++) { var sx = Math.random() * w, sy = Math.random() * h, sr = 30 + Math.random() * 90, sa = Math.random() * 6.3; g.beginPath(); g.arc(sx, sy, sr, sa, sa + 0.4 + Math.random() * 0.8); g.stroke(); }
    g.strokeStyle = 'rgba(40,40,38,.45)'; g.lineWidth = 1; for (i = 0; i < 4; i++) { var cx = Math.random() * w, cy = Math.random() * h; g.beginPath(); g.moveTo(cx, cy); for (var k = 0; k < 8; k++) g.lineTo(cx += (Math.random() - 0.5) * 60, cy += (Math.random() - 0.5) * 60); g.stroke(); }
    g.fillStyle = 'rgba(20,22,24,.75)'; g.fillRect(0, 0, w, 4); g.fillRect(0, 0, 4, h); g.fillStyle = 'rgba(150,158,160,.35)'; g.fillRect(0, 5, w, 2); g.fillRect(5, 0, 2, h); }, [1, 1]);
  var fl = new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.32, metalness: 0.08 }), flr = function (w, d) { var m = fl.clone(); m.map = floorT.clone(); m.map.needsUpdate = true; m.map.repeat.set(w / 4, d / 4); return m; };
  var stl = new THREE.MeshStandardMaterial({ color: 0x8d9399, roughness: 0.35, metalness: 0.75 }), galv = new THREE.MeshStandardMaterial({ color: 0xa5adb3, roughness: 0.5, metalness: 0.6 }), yel = new THREE.MeshStandardMaterial({ color: 0xe0b322, roughness: 0.5 }), liner = (function () { var t = mkTex(512, 512, function (g, w, h) { g.fillStyle = '#b4b9be'; g.fillRect(0, 0, w, h); for (var i = 0; i < 20000; i++) { var v = 150 + Math.random() * 60; g.fillStyle = 'rgba(' + v + ',' + (v + 3) + ',' + (v + 6) + ',.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(70,74,78,.8)'; g.lineWidth = 4; g.strokeRect(2, 2, w / 2 - 4, h - 4); g.strokeRect(w / 2 + 2, 2, w / 2 - 4, h - 4); g.strokeStyle = 'rgba(220,224,228,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(80,84,88,.5)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 14); } }, [24, 4]); return new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.3, roughness: 0.3, metalness: 0.7, side: THREE.BackSide }); })(), dark = new THREE.MeshStandardMaterial({ color: 0x23272b, roughness: 0.8 });
  var pl = function (w, h, mat, x, y, z, rx, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); m.userData.noColl = true; scene.add(m); return m; };
  var lamp = function (x, y, z, w, d, pow) { box(w, 0.08, d, new THREE.MeshBasicMaterial({ color: 0xfff6e4 }), x, y, z, scene); var l = new THREE.PointLight(0xfff1dc, pow, 0, 1.5); l.position.set(x, y - 0.3, z); scene.add(l); };
  /* ---- door in the control-room wall, with frame, lintel and sign ---- */
  box(HALL.door + 0.3, 0.1, 0.25, stl, -RX, 2.35, cz, scene); [-1, 1].forEach(function (k) { box(0.1, 2.4, 0.25, stl, -RX, 1.2, cz + k * (HALL.door / 2 + 0.05), scene); });
  pl(HALL.door + 0.4, CH - 2.3, concW(2, 2), -RX + 0.01, (CH + 2.3) / 2, cz, 0, Math.PI / 2);
  pl(1.1, 0.26, new THREE.MeshBasicMaterial({ map: signTex(512, 120, function (g) { g.fillStyle = '#1d3f7a'; g.fillRect(0, 0, 512, 120); ctext(g, '→ REACTOR BUILDING', 256, 60, 54, '#fff', 'center', 490); }) }), -RX + 0.03, 2.75, cz, 0, Math.PI / 2);
  /* ---- corridor: textured, skirting, kick rails, pipe runs along the ceiling, lamps, signage ---- */
  var cl = -(RX + hx), cmx = (-RX + hx) / 2; pl(cl, cw, flr(cl, cw), cmx, 0.001, cz, -Math.PI / 2); pl(cl, cw, concW(cl, cw), cmx, 3.0, cz, Math.PI / 2);
  pl(cl, 3.0, concW(cl, 3), cmx, 1.5, cz - cw / 2, 0, 0); pl(cl, 3.0, concW(cl, 3), cmx, 1.5, cz + cw / 2, 0, Math.PI);
  box(cl, 0.12, 0.03, dark, cmx, 0.06, cz - cw / 2 + 0.015, scene); box(cl, 0.12, 0.03, dark, cmx, 0.06, cz + cw / 2 - 0.015, scene);
  box(cl, 0.1, 0.12, yel, cmx, 1.0, cz - cw / 2 + 0.06, scene); box(cl, 0.1, 0.12, yel, cmx, 1.0, cz + cw / 2 - 0.06, scene);
  [[0.08, -0.5, 0x8a8f94], [0.06, -0.3, 0xc63b2a], [0.05, 0.4, 0x2b5fb3], [0.04, 0.55, 0x8a8f94]].forEach(function (p) { var pp = cyl(p[0], p[0], cl, new THREE.MeshStandardMaterial({ color: p[2], roughness: 0.45, metalness: 0.5 }), 12); pp.rotation.z = Math.PI / 2; pp.position.set(cmx, 2.78, cz + p[1]); pp.userData.noColl = true; scene.add(pp); for (var k = 0; k < 5; k++) box(0.03, 0.22, 0.04, galv, -RX + (hx + RX) * (k + 0.5) / 5, 2.89, cz + p[1], scene); });
  var i; (function () { var dg = new THREE.Group(); dg.position.set(-RX - 0.4, 0, cz); dg.rotation.y = Math.PI / 2; scene.add(dg); box(cw, 0.12, 0.12, stl, 0, 2.3, 0, dg); [-1, 1].forEach(function (k) { box(0.1, 2.3, 0.14, stl, k * (cw / 2 - 0.05), 1.15, 0, dg); }); var lf = new THREE.MeshStandardMaterial({ color: 0x5b6670, roughness: 0.5, metalness: 0.3 }); dg.userData.leaves = []; [-1, 1].forEach(function (k) { var piv = new THREE.Group(); piv.position.set(k * (cw / 2 - 0.1), 0, 0); dg.add(piv); box(cw / 2 - 0.1, 2.2, 0.05, lf, -k * (cw / 4 - 0.05), 1.1, 0, piv); box(0.3, 0.6, 0.01, MAT.glass, -k * (cw / 4 - 0.05), 1.55, 0.03, piv); piv.userData.k = k; dg.userData.leaves.push(piv); }); var hb = invis(cw, 2.3, 0.3); hb.position.set(-RX - 0.4, 1.15, cz); hb.rotation.y = Math.PI / 2; scene.add(hb); hit(hb, { tip: 'Corridor door: click to open or close', act: function () { DOORS.toggle(dg); } }); DOORS.reg(dg, 'corr'); })();

  /* ---- the hall: tall concrete box, panel-jointed, with a service gallery round it at 6 m ---- */
  var hmx = hx - hw / 2; (function () { /* hall floor with a round hole for the cavity */ var sh = new THREE.Shape(); sh.moveTo(-hw / 2, -hd / 2); sh.lineTo(hw / 2, -hd / 2); sh.lineTo(hw / 2, hd / 2); sh.lineTo(-hw / 2, hd / 2); sh.closePath(); var hole = new THREE.Path(); hole.absarc(vx - hmx, 0, 4.0, 0, Math.PI * 2, true); sh.holes.push(hole); var fg = new THREE.ShapeGeometry(sh, 64); var uv = fg.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + hw / 2) / 4, (uv.getY(i) + hd / 2) / 4); var fm = new THREE.Mesh(fg, flr(4, 4)); fm.rotation.x = -Math.PI / 2; fm.position.set(hmx, 0.001, cz); fm.userData.noColl = true; scene.add(fm); })(); pl(hw, hd, concW(hw, hd), hmx, HH, cz, Math.PI / 2);
  pl(hw, HH, concW(hw, HH), hmx, HH / 2, cz - hd / 2, 0, 0); pl(hw, HH, concW(hw, HH), hmx, HH / 2, cz + hd / 2, 0, Math.PI); pl(hd, HH, concW(hd, HH), hx - hw, HH / 2, cz, 0, Math.PI / 2);
  pl(hd / 2 - cw / 2, HH, concW(hd / 2, HH), hx, HH / 2, cz - (hd / 4 + cw / 4), 0, -Math.PI / 2); pl(hd / 2 - cw / 2, HH, concW(hd / 2, HH), hx, HH / 2, cz + (hd / 4 + cw / 4), 0, -Math.PI / 2); pl(cw, HH - 3, concW(cw, HH), hx, (HH + 3) / 2, cz, 0, -Math.PI / 2);
  var GY = 6.0; [[-hd / 2 + 0.6, hw - 1.2, 0.06], [hd / 2 - 0.6, hw - 1.2, 0.06]].forEach(function (q) { box(hw - 1.2, 0.12, 1.2, galv, hmx, GY, cz + q[0], scene); for (var k = 0; k < 10; k++) { var px = hx - 0.6 - k * (hw - 1.2) / 9; box(0.04, 1.1, 0.04, yel, px, GY + 0.6, cz + q[0] + (q[0] < 0 ? 0.6 : -0.6), scene); } box(hw - 1.2, 0.04, 0.04, yel, hmx, GY + 1.1, cz + q[0] + (q[0] < 0 ? 0.6 : -0.6), scene); box(hw - 1.2, 0.04, 0.04, yel, hmx, GY + 0.6, cz + q[0] + (q[0] < 0 ? 0.6 : -0.6), scene); });
  box(1.2, 0.12, hd - 2.4, galv, hx - hw + 0.6, GY, cz, scene); for (var k = 0; k < 14; k++) box(0.04, 1.1, 0.04, yel, hx - hw + 1.2, GY + 0.6, cz - hd / 2 + 1.2 + k * (hd - 2.4) / 13, scene); box(0.04, 0.04, hd - 2.4, yel, hx - hw + 1.2, GY + 1.1, cz, scene);
  /* stair up to the gallery */ for (k = 0; k < 20; k++) box(0.9, 0.05, 0.3, galv, hx - 1.3, 0.3 * (k + 1), cz + hd / 2 - 1.2 - k * 0.3, scene); box(0.04, GY, 0.04, yel, hx - 0.85, GY / 2, cz + hd / 2 - 1.2, scene); box(0.04, GY, 0.04, yel, hx - 0.85, GY / 2, cz + hd / 2 - 1.2 - 5.7, scene);
  /* ---- the cavity: steel liner, railing, water with the vessel head visible below ---- */
  var ring = new THREE.Mesh(new THREE.RingGeometry(4.0, 5.2, 64), new THREE.MeshStandardMaterial({ color: 0xd6d8d2, roughness: 0.8 })); ring.rotation.x = -Math.PI / 2; ring.position.set(vx, 0.012, cz); ring.userData.noColl = true; scene.add(ring);
  var edge = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.05, 8, 72), stl); edge.rotation.x = Math.PI / 2; edge.position.set(vx, 0.03, cz); edge.userData.noColl = true; scene.add(edge);
  for (i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2, px2 = vx + Math.cos(a) * 4.45, pz = cz + Math.sin(a) * 4.45; var post = cyl(0.025, 0.025, 1.1, yel, 8); post.position.set(px2, 0.55, pz); post.userData.noColl = true; scene.add(post); }
  [1.1, 0.75, 0.4].forEach(function (y) { var r = new THREE.Mesh(new THREE.TorusGeometry(4.45, 0.022, 8, 96), yel); r.rotation.x = Math.PI / 2; r.position.set(vx, y, cz); r.userData.noColl = true; scene.add(r); });
  var pool = cyl(4.0, 4.0, 9, liner, 64, true); pool.position.set(vx, -4.5, cz); pool.userData.noColl = true; scene.add(pool);
  var pb = new THREE.Mesh(new THREE.CircleGeometry(4.0, 64), new THREE.MeshStandardMaterial({ color: 0x6d7378, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide })); pb.rotation.x = -Math.PI / 2; pb.position.set(vx, -9.0, cz); pb.userData.noColl = true; scene.add(pb);
  for (i = 0; i < 3; i++) { var lr = new THREE.Mesh(new THREE.TorusGeometry(3.98, 0.03, 6, 64), stl); lr.rotation.x = Math.PI / 2; lr.position.set(vx, -1.5 - i * 2.6, cz); lr.userData.noColl = true; scene.add(lr); }
  var vmat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.3, metalness: 0.85 });
  var vessel = cyl(2.3, 2.3, 4.5, vmat, 48); vessel.position.set(vx, -7.0, cz); vessel.userData.noColl = true; scene.add(vessel);
  var flange = cyl(2.55, 2.55, 0.5, vmat, 48); flange.position.set(vx, -4.5, cz); flange.userData.noColl = true; scene.add(flange);
  for (i = 0; i < 54; i++) { var sa = i / 54 * Math.PI * 2; var stud = cyl(0.07, 0.07, 0.35, stl, 8); stud.position.set(vx + Math.cos(sa) * 2.42, -4.1, cz + Math.sin(sa) * 2.42); stud.userData.noColl = true; scene.add(stud); }
  var head = new THREE.Mesh(new THREE.SphereGeometry(2.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), vmat); head.position.set(vx, -4.25, cz); head.userData.noColl = true; scene.add(head);
  /* control rod drive mechanisms: identical housings on a square grid, tops level, coil stacks partway up, a support plate across the top, inside a cooling shroud */
  (function () { var pts = [], P = 0.3, R = 1.6, top = -0.75; for (var gx = -6; gx <= 6; gx++) for (var gz = -6; gz <= 6; gz++) { var x = gx * P, z = gz * P; if (Math.hypot(x, z) <= R) pts.push([x, z]); }
    var hous = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.065, 0.065, 1, 12), new THREE.MeshStandardMaterial({ color: 0xb8bec4, roughness: 0.28, metalness: 0.85 }), pts.length);
    var coil = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0x3a4148, roughness: 0.6, metalness: 0.4 }), pts.length);
    var cap = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0xd0d5da, roughness: 0.3, metalness: 0.8 }), pts.length);
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3();
    pts.forEach(function (p, i) { var r = Math.hypot(p[0], p[1]), base = -4.25 + Math.sqrt(Math.max(0, 2.3 * 2.3 - r * r)), L = top - base; M.compose(V.set(vx + p[0], base + L / 2, cz + p[1]), Q, S.set(1, L, 1)); hous.setMatrixAt(i, M); M.compose(V.set(vx + p[0], base + L * 0.42, cz + p[1]), Q, S.set(1, 1, 1)); coil.setMatrixAt(i, M); M.compose(V.set(vx + p[0], top + 0.03, cz + p[1]), Q, S.set(1, 1, 1)); cap.setMatrixAt(i, M); });
    [hous, coil, cap].forEach(function (m) { m.userData.noColl = true; m.frustumCulled = false; scene.add(m); });
    var plate = new THREE.Mesh(new THREE.RingGeometry(R + 0.12, R + 0.32, 48), galv); plate.rotation.x = -Math.PI / 2; plate.position.set(vx, top - 0.12, cz); plate.userData.noColl = true; scene.add(plate);
    for (var k = -5; k <= 5; k++) { var bx = box(0.04, 0.06, 2 * Math.sqrt(Math.max(0, (R + 0.2) * (R + 0.2) - (k * P) * (k * P))), galv, vx + k * P + P / 2, top - 0.12, cz, scene); bx.userData.noColl = true; }
    var shroud = cyl(1.95, 1.95, 1.4, galv, 40, true); shroud.material = galv.clone(); shroud.material.side = THREE.DoubleSide; shroud.position.set(vx, -2.25, cz); shroud.userData.noColl = true; scene.add(shroud);
    for (k = 0; k < 3; k++) { var duct = cyl(0.28, 0.28, 0.6, dark, 16); duct.position.set(vx + Math.cos(k * 2.1) * 1.95, -1.3, cz + Math.sin(k * 2.1) * 1.95); duct.userData.noColl = true; scene.add(duct); } })();
  for (i = 0; i < 4; i++) { var na = i * Math.PI / 2 + Math.PI / 4; var noz = cyl(0.5, 0.5, 2.2, vmat, 20); noz.rotation.z = Math.PI / 2; noz.rotation.y = -na; noz.position.set(vx + Math.cos(na) * 3.1, -6.1, cz + Math.sin(na) * 3.1); noz.userData.noColl = true; scene.add(noz); }
  var water = new THREE.Mesh(new THREE.CircleGeometry(3.99, 64), new THREE.MeshStandardMaterial({ color: 0x3a8ae0, emissive: 0x1e5fcf, emissiveIntensity: 0.25, transparent: true, opacity: 0.5, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false })); water.rotation.x = -Math.PI / 2; water.position.set(vx, -0.4, cz); water.renderOrder = 6; water.userData.noColl = true; scene.add(water); HALL.glow = water;
  var cg = new THREE.PointLight(0x4fa8ff, 0, 0, 1.6); cg.position.set(vx, -1.0, cz); scene.add(cg); HALL.light = cg; var ul = new THREE.PointLight(0xa8d4ff, 60, 0, 1.6); ul.position.set(vx, -4.5, cz); scene.add(ul);
  /* ---- polar crane on its rail, trolley and hook, hall lights ---- */
  var railR = hd / 2 - 0.9; var crail = new THREE.Mesh(new THREE.TorusGeometry(railR, 0.12, 8, 96), galv); crail.rotation.x = Math.PI / 2; crail.position.set(hmx, HH - 2.2, cz); crail.userData.noColl = true; scene.add(crail);
  box(railR * 2 - 0.4, 0.8, 0.5, yel, hmx, HH - 2.0, cz - 1.0, scene); box(railR * 2 - 0.4, 0.8, 0.5, yel, hmx, HH - 2.0, cz + 1.0, scene); for (k = 0; k < 7; k++) box(0.08, 0.6, 2.4, yel, hmx - railR + 0.5 + k * (railR * 2 - 1) / 6, HH - 2.0, cz, scene);
  box(1.6, 1.2, 2.8, galv, vx + 1.5, HH - 2.9, cz, scene); var cable = cyl(0.03, 0.03, 4.5, dark, 6); cable.position.set(vx + 1.5, HH - 5.7, cz); scene.add(cable); box(0.5, 0.7, 0.3, yel, vx + 1.5, HH - 8.2, cz, scene);
  [[-4, -5.5], [-4, 5.5], [-14, -5.5], [-14, 5.5], [-9, 0], [-9, -7], [-9, 7]].forEach(function (q) { lamp(hx + q[0], HH - 0.1, cz + q[1], 1.6, 1.6, 95); });
  /* ---- wall furniture: area monitor, warning sign, cable trays, a cabinet, a hoist control, hall number ---- */
  HALL.mon = screenMesh(scene, 1.3, 0.8, 640, 400, drawAreaMon, 0.5, hx - 0.05, 1.9, cz - 4.5, -Math.PI / 2, function () { return 'Area radiation monitor: dose rate at the cavity edge, mostly N-16 from the coolant when the reactor is at power.'; }, 'arm');
  pl(1.6, 1.0, new THREE.MeshBasicMaterial({ map: signTex(512, 320, function (g) { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#111'; g.font = 'bold 150px ' + FONT; g.textAlign = 'center'; g.fillText('☢', 256, 160); ctext(g, 'RADIATION CONTROLLED AREA', 256, 230, 34, '#111', 'center', 490); ctext(g, 'DOSIMETER REQUIRED · NO LONE WORKING', 256, 280, 26, '#111', 'center', 490); }) }), hx - 0.05, 1.9, cz + 4.5, 0, -Math.PI / 2);
  pl(3.0, 1.6, new THREE.MeshBasicMaterial({ map: signTex(600, 320, function (g) { g.fillStyle = '#1d3f7a'; g.fillRect(0, 0, 600, 320); ctext(g, 'UNIT 1', 300, 120, 150, '#fff', 'center', 580); ctext(g, 'REACTOR HALL', 300, 250, 70, '#fff', 'center', 580); }) }), hx - hw + 0.05, HH - 4, cz, 0, Math.PI / 2);
  box(1.2, 2.2, 0.5, new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.5, metalness: 0.3 }), hx - hw + 0.3, 1.1, cz - 5, scene); box(1.0, 1.8, 0.02, dark, hx - hw + 0.56, 1.2, cz - 5, scene);
  [0.7, -0.7].forEach(function (dz) { box(hw - 2, 0.05, 0.4, galv, hmx, 4.5, cz + (hd / 2 - 0.25) * Math.sign(dz), scene); box(0.4, 0.05, hd - 2, galv, hx - hw + 0.25, 4.5, cz, scene); });
  for (k = 0; k < 6; k++) { var cab2 = cyl(0.025, 0.025, hw - 2, new THREE.MeshStandardMaterial({ color: [0x2b2b2b, 0x8a1c1c, 0x1c3f8a, 0x2b2b2b, 0xb38f00, 0x2b2b2b][k], roughness: 0.6 }), 6); cab2.rotation.z = Math.PI / 2; cab2.position.set(hmx, 4.54, cz - hd / 2 + 0.1 + k * 0.05); cab2.userData.noColl = true; scene.add(cab2); }
  box(0.3, 0.5, 0.15, yel, hx - 3, 1.2, cz - hd / 2 + 0.1, scene); var dr = cyl(0.04, 0.04, 1.6, stl, 8); dr.position.set(hx - 1.5, 0.8, cz - 3.0); dr.userData.noColl = true; scene.add(dr);
  /* floor markings: yellow hatch round the cavity, a walkway line to the door */
  var hatch = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.6, 64), new THREE.MeshBasicMaterial({ color: 0xe0b322, transparent: true, opacity: 0.85 })); hatch.rotation.x = -Math.PI / 2; hatch.position.set(vx, 0.006, cz); hatch.userData.noColl = true; scene.add(hatch);
  pl(hx - vx - 5.6, 0.12, new THREE.MeshBasicMaterial({ color: 0xe0b322 }), (hx + vx + 5.6) / 2, 0.005, cz - 1.0, -Math.PI / 2); pl(hx - vx - 5.6, 0.12, new THREE.MeshBasicMaterial({ color: 0xe0b322 }), (hx + vx + 5.6) / 2, 0.005, cz + 1.0, -Math.PI / 2); addSurrounds(scene); addHallFX(scene); }
/* ================================================================ reactor hall: the look ================================================================
   Everything here is drawn in rather than computed by the renderer, so it looks the same on Lite graphics: soft corner shadows
   (baked ambient occlusion) where walls meet floors and ceilings, light shafts and warm pools under the lamps, drifting dust, a living
   water surface with ripples and caustics, depth haze in the pool, Cherenkov blue that grows with power, and a few small lights. */
/* ================================================================ the surroundings: corridor fit-out and hall equipment ================================================================ */
function addSurrounds(scene) { var cz = HALL.cz, cw = HALL.cw, hx = HALL.hx, hw = HALL.hw, hd = HALL.hd, vx = HALL.vx, HH = 14, cx0 = -RX, cx1 = hx, CL = cx0 - cx1, cmx = (cx0 + cx1) / 2, zL = cz - cw / 2, zR = cz + cw / 2;
  var S = function (m) { m.userData.noColl = true; scene.add(m); return m; };
  var mat = function (c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.6 : r, metalness: m || 0 }); };
  var B = function (w, h, d, mt, x, y, z) { return S(box(w, h, d, mt, x, y, z)); };
  var C = function (r, h, mt, x, y, z, rx, rz, seg) { var m = cyl(r, r, h, mt, seg || 16); m.position.set(x, y, z); m.rotation.set(rx || 0, 0, rz || 0); return S(m); };
  var sign = function (w, h, draw, x, y, z, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(Math.round(w * 400), Math.round(h * 400), draw) })); m.position.set(x, y, z); m.rotation.y = ry; return S(m); };
  var glow = function (w, h, col, x, y, z, ry, k) { var c = CV(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: col, transparent: true, opacity: k || 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.set(x, y, z); m.rotation.y = ry; return S(m); };
  var steel = mat(0x9aa2a8, 0.4, 0.7), galv = mat(0xa9b0b5, 0.5, 0.55), dark = mat(0x2a2e33, 0.7), clad = mat(0xc9ced3, 0.35, 0.8), red = mat(0xb8261e, 0.45), green = mat(0x2f7d46, 0.5), blue = mat(0x2b5fb3, 0.5), yel = mat(0xe0b322, 0.5), white = mat(0xe6e8ea, 0.5);
  var LED = new THREE.MeshBasicMaterial({ color: 0xf4f8ff });
  /* --- corridor walls: painted dado below 1.1 m with a stripe, so it is not one flat grey --- */
  [[zL + 0.006, 0], [zR - 0.006, Math.PI]].forEach(function (q) { var d = new THREE.Mesh(new THREE.PlaneGeometry(CL, 1.1), mat(0x4f6273, 0.75)); d.position.set(cmx, 0.55, q[0]); d.rotation.y = q[1]; S(d); var st = new THREE.Mesh(new THREE.PlaneGeometry(CL, 0.05), mat(0xe0b322, 0.5)); st.position.set(cmx, 1.12, q[0] + (q[1] ? -0.001 : 0.001)); st.rotation.y = q[1]; S(st); });
  /* --- corridor lighting: recessed LED panels down the middle, continuous cove strips at both edges, wall washes, emergency lights --- */
  for (var i = 0; i < 6; i++) { var lx = cx0 - CL * (i + 0.5) / 6; B(0.9, 0.03, 0.5, LED, lx, 2.985, cz); B(0.96, 0.02, 0.56, dark, lx, 2.995, cz); var pl = new THREE.PointLight(0xf2f6ff, 6, 0, 1.6); pl.position.set(lx, 2.6, cz); scene.add(pl); }
  [zL + 0.12, zR - 0.12].forEach(function (z) { B(CL, 0.02, 0.04, LED, cmx, 2.975, z); for (var k = 0; k < 6; k++) glow(1.6, 1.4, 0xdfe8ff, cx0 - CL * (k + 0.5) / 6, 2.35, z < cz ? zL + 0.008 : zR - 0.008, z < cz ? 0 : Math.PI, 0.18); });
  [[cx0 - 1.2, zL + 0.02, 0], [cx1 + 1.2, zR - 0.02, Math.PI]].forEach(function (q) { B(0.32, 0.12, 0.06, white, q[0], 2.55, q[1] + (q[2] ? -0.03 : 0.03)); sign(0.3, 0.1, function (g, w, h) { g.fillStyle = '#0b9a44'; g.fillRect(0, 0, w, h); ctext(g, '🏃 →', w / 2, h / 2 + 2, h * 0.7, '#fff', 'center', w); }, q[0], 2.55, q[1] + (q[2] ? -0.062 : 0.062), q[2]); glow(0.8, 0.5, 0x30ff80, q[0], 2.55, q[1] + (q[2] ? -0.07 : 0.07), q[2], 0.3); });
  /* --- corridor pipework: insulated main on stand-offs low on the left wall, painted pipes with colour bands and flow arrows on the right, valves --- */
  var pz = zL + 0.32; C(0.17, CL, clad, cmx, 0.42, pz, 0, Math.PI / 2, 20); for (i = 0; i <= 8; i++) { var bxp = cx0 - CL * i / 8; C(0.175, 0.03, steel, bxp, 0.42, pz, 0, Math.PI / 2, 20); if (i % 2 === 0) { B(0.08, 0.26, 0.22, galv, bxp, 0.13, pz); B(0.08, 0.06, 0.34, galv, bxp, 0.42, zL + 0.17); } }
  sign(0.5, 0.12, function (g, w, h) { g.fillStyle = '#2f7d46'; g.fillRect(0, 0, w, h); ctext(g, 'CCW SUPPLY →', w / 2, h / 2 + 2, h * 0.55, '#fff', 'center', w); }, cmx + 1.5, 0.42, pz + 0.18, 0);
  [[0.06, 1.85, 0x2f7d46, 'SERVICE WATER'], [0.05, 2.2, 0xb8261e, 'FIRE MAIN'], [0.035, 2.45, 0x8a8f94, 'INST AIR']].forEach(function (p) { var pzz = zR - 0.16; C(p[0], CL, mat(p[2], 0.45, 0.3), cmx, p[1], pzz, 0, Math.PI / 2, 14); for (var k = 0; k < 5; k++) B(0.04, 0.05, 0.2, galv, cx0 - CL * (k + 0.5) / 5, p[1], zR - 0.08); sign(0.42, 0.09, function (g, w, h) { g.fillStyle = '#' + p[2].toString(16).padStart(6, '0'); g.fillRect(0, 0, w, h); ctext(g, p[3] + ' →', w / 2, h / 2 + 2, h * 0.6, '#fff', 'center', w); }, cmx - 1.2, p[1], pzz - p[0] - 0.005, Math.PI); });
  var hw1 = C(0.012, 0.3, red, cmx - 2.6, 2.2, zR - 0.32, Math.PI / 2, 0, 8); var wheel = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 20), red); wheel.position.set(cmx - 2.6, 2.2, zR - 0.46); S(wheel); B(0.12, 0.14, 0.12, red, cmx - 2.6, 2.2, zR - 0.16);
  /* cable tray with cables, and a CCTV camera */ B(CL, 0.04, 0.32, galv, cmx, 2.62, zL + 0.3); for (i = 0; i < 5; i++) C(0.02, CL, mat([0x222222, 0x8a1c1c, 0x1c3f8a, 0x222222, 0xb38f00][i], 0.6), cmx, 2.66, zL + 0.18 + i * 0.05, 0, Math.PI / 2, 6);
  B(0.12, 0.1, 0.22, white, cx1 + 0.4, 2.75, zL + 0.2); C(0.035, 0.04, dark, cx1 + 0.4, 2.75, zL + 0.33, Math.PI / 2, 0, 10);
  /* side doors, fire point, noticeboard, emergency phone */
  [[cx0 - 3.2, zR, 'HVAC PLANT ROOM'], [cx0 - 5.8, zL, 'ELECTRICAL SWITCHROOM 1A']].forEach(function (q) { var ry = q[1] > cz ? Math.PI : 0, off = q[1] > cz ? -1 : 1; B(1.05, 2.15, 0.05, mat(0x5b6670, 0.5, 0.3), q[0], 1.075, q[1] + off * 0.03); B(1.15, 0.06, 0.07, steel, q[0], 2.18, q[1] + off * 0.03); B(0.03, 0.14, 0.05, steel, q[0] + 0.4, 1.05, q[1] + off * 0.07); sign(0.7, 0.16, function (g, w, h) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); ctext(g, q[2], w / 2, h / 2 + 2, h * 0.42, '#1d3f7a', 'center', w - 10); }, q[0], 1.7, q[1] + off * 0.058, ry); });
  B(0.25, 0.5, 0.18, red, cx0 - 4.6, 0.55, zR - 0.1); C(0.08, 0.5, red, cx0 - 4.25, 0.35, zR - 0.12); sign(0.32, 0.32, function (g, w, h) { g.fillStyle = '#c8302a'; g.fillRect(0, 0, w, h); ctext(g, '🔥', w / 2, h * 0.45, h * 0.5, '#fff', 'center', w); ctext(g, 'FIRE POINT', w / 2, h * 0.85, h * 0.16, '#fff', 'center', w); }, cx0 - 4.45, 1.3, zR - 0.006, Math.PI);
  B(1.2, 0.8, 0.03, mat(0x7a5a3a, 0.9), cx0 - 1.9, 1.55, zR - 0.02); sign(1.1, 0.7, function (g, w, h) { g.fillStyle = '#d9cbb0'; g.fillRect(0, 0, w, h); ctext(g, 'SHIFT NOTICES', w / 2, 30, 26, '#333', 'center', w); [['#fff', 30, 60], ['#ffe08a', 170, 70], ['#bfe3ff', 300, 55], ['#fff', 60, 170], ['#ffd1d1', 230, 180]].forEach(function (n) { g.fillStyle = n[0]; g.fillRect(n[1], n[2], 110, 90); g.fillStyle = '#c33'; g.beginPath(); g.arc(n[1] + 55, n[2] + 6, 5, 0, 6.3); g.fill(); for (var r = 0; r < 5; r++) { g.fillStyle = '#888'; g.fillRect(n[1] + 10, n[2] + 22 + r * 13, 90 - (r % 2) * 25, 3); } }); }, cx0 - 1.9, 1.55, zR - 0.037, Math.PI);
  B(0.22, 0.3, 0.1, yel, cx1 + 1.0, 1.35, zL + 0.05); B(0.06, 0.18, 0.05, dark, cx1 + 0.95, 1.38, zL + 0.12);
  /* radiation boundary at the hall end: magenta and yellow step-off line, contamination monitor, shoe-cover bin */
  var stripe = CV(256, 32), sg = stripe.getContext('2d'); for (i = 0; i < 16; i++) { sg.fillStyle = i % 2 ? '#c2188a' : '#ffd400'; sg.fillRect(i * 16, 0, 16, 32); } var st2 = new THREE.Mesh(new THREE.PlaneGeometry(cw - 0.1, 0.18), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(stripe) })); st2.rotation.set(-Math.PI / 2, 0, Math.PI / 2); st2.position.set(cx1 + 0.6, 0.007, cz); S(st2);
  B(0.7, 1.9, 0.5, mat(0xd7dbdf, 0.45, 0.3), cx1 + 1.9, 0.95, zR - 0.28); B(0.5, 0.32, 0.02, mat(0x0a1a12, 0.3), cx1 + 1.9, 1.5, zR - 0.535); sign(0.46, 0.28, function (g, w, h) { g.fillStyle = '#062014'; g.fillRect(0, 0, w, h); ctext(g, 'HAND & FOOT', w / 2, 28, 20, '#7bffa0', 'center', w); ctext(g, 'CLEAN ✓', w / 2, 75, 36, '#7bffa0', 'center', w); }, cx1 + 1.9, 1.5, zR - 0.547, Math.PI); [-0.15, 0.15].forEach(function (d) { B(0.16, 0.05, 0.22, dark, cx1 + 1.9 + d, 1.05, zR - 0.6); B(0.16, 0.04, 0.3, dark, cx1 + 1.9 + d, 0.06, zR - 0.62); });
  C(0.18, 0.5, mat(0x1c5fa8, 0.5), cx1 + 2.8, 0.25, zL + 0.25, 0, 0, 16);
  /* ---------------- the hall ---------------- */
  /* HVAC duct along both long walls high up, with diffusers */ [cz - hd / 2 + 0.55, cz + hd / 2 - 0.55].forEach(function (z) { B(hw - 2, 0.7, 0.9, galv, hx - hw / 2, HH - 2.6, z); for (var k = 0; k < 6; k++) B(0.6, 0.03, 0.6, dark, hx - 2 - k * (hw - 4) / 5, HH - 2.96, z); });
  /* insulated pipe runs on the back wall */ [[2.2, 0.22, clad], [2.9, 0.14, mat(0x2f7d46, 0.5, 0.3)], [3.4, 0.1, red]].forEach(function (p) { C(p[1], hd - 1, p[2], hx - hw + 0.4, p[0], cz, Math.PI / 2, 0, 18); for (var k = 0; k < 7; k++) B(0.3, 0.05, 0.05, galv, hx - hw + 0.2, p[0], cz - hd / 2 + 1 + k * (hd - 2) / 6); });
  /* waste drums on a bunded pallet, tool cabinet, ladder, extinguishers, first aid */
  var dpx = hx - hw + 2.2, dpz = cz + hd / 2 - 2.3; B(2.2, 0.15, 1.6, mat(0x8a6a3a, 0.9), dpx, 0.075, dpz); B(2.3, 0.25, 0.04, yel, dpx, 0.12, dpz - 0.82); B(2.3, 0.25, 0.04, yel, dpx, 0.12, dpz + 0.82);
  for (i = 0; i < 6; i++) { var drx = dpx - 0.75 + (i % 3) * 0.75, drz = dpz - 0.37 + Math.floor(i / 3) * 0.74; C(0.3, 0.88, mat(0xe8c21a, 0.55), drx, 0.59, drz, 0, 0, 20); C(0.31, 0.03, dark, drx, 0.4, drz, 0, 0, 20); C(0.31, 0.03, dark, drx, 0.8, drz, 0, 0, 20); var tr = new THREE.Mesh(new THREE.CircleGeometry(0.16, 3), new THREE.MeshBasicMaterial({ color: 0x111111 })); tr.position.set(drx, 0.65, drz + 0.302); S(tr); }
  B(1.6, 2.0, 0.55, mat(0x3c6ea8, 0.5, 0.3), hx - hw + 0.3 + 0.275, 1.0, cz - hd / 2 + 2.8); B(0.02, 1.8, 0.5, dark, hx - hw + 0.86, 1.0, cz - hd / 2 + 2.8);
  for (i = 0; i < 10; i++) B(0.5, 0.03, 0.04, steel, hx - 0.15, 0.3 + i * 0.3, cz - hd / 2 + 3); [-0.25, 0.25].forEach(function (d) { B(0.04, 3.1, 0.04, steel, hx - 0.15 + d, 1.55, cz - hd / 2 + 3); });
  [[hx - 0.12, cz - 2.2, -Math.PI / 2], [hx - hw + 0.12, cz + 2.5, Math.PI / 2], [hx - 6, cz - hd / 2 + 0.12, 0]].forEach(function (q) { C(0.08, 0.5, red, q[0], 0.55, q[1], 0, 0, 12); C(0.03, 0.08, dark, q[0], 0.84, q[1], 0, 0, 8); sign(0.22, 0.22, function (g, w, h) { g.fillStyle = '#c8302a'; g.fillRect(0, 0, w, h); ctext(g, '🧯', w / 2, h / 2 + 4, h * 0.7, '#fff', 'center', w); }, q[0] + Math.sin(q[2]) * 0.0, 1.15, q[1] + (q[2] === 0 ? -0.1 : 0), q[2]); });
  B(0.36, 0.3, 0.12, mat(0x2f8f4a, 0.5), hx - 6.8, 1.5, cz + hd / 2 - 0.08); sign(0.2, 0.2, function (g, w, h) { g.fillStyle = '#2f8f4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * 0.4, h * 0.15, w * 0.2, h * 0.7); g.fillRect(w * 0.15, h * 0.4, w * 0.7, h * 0.2); }, hx - 6.8, 1.5, cz + hd / 2 - 0.145, Math.PI);
  /* rope barrier posts round the hatching, and floor plates/drains */
  for (i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2, rx = vx + Math.cos(a) * 6.1, rz = cz + Math.sin(a) * 6.1; C(0.03, 0.95, steel, rx, 0.48, rz, 0, 0, 8); C(0.16, 0.04, dark, rx, 0.02, rz, 0, 0, 16); }
  var chain = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.012, 4, 96), mat(0xe0b322, 0.5)); chain.rotation.x = Math.PI / 2; chain.position.set(vx, 0.88, cz); S(chain);
  var plateC = CV(128, 128), pg = plateC.getContext('2d'); pg.fillStyle = '#8b9196'; pg.fillRect(0, 0, 128, 128); for (var yy = 0; yy < 128; yy += 10) for (var xx = (yy / 10) % 2 * 5; xx < 128; xx += 10) { pg.fillStyle = '#b4babe'; pg.fillRect(xx, yy, 6, 2); } var plateM = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(plateC), roughness: 0.4, metalness: 0.6 });
  [[hx - 2.5, cz + 6.5], [hx - 15.5, cz - 6.5], [hx - 15.5, cz + 6.5]].forEach(function (q) { var pm = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), plateM); pm.rotation.x = -Math.PI / 2; pm.position.set(q[0], 0.009, q[1]); S(pm); });
  [[hx - 2.5, cz - 6.5], [hx - 9, cz + 7.5]].forEach(function (q) { var dr = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), mat(0x3a3f44, 0.5, 0.5)); dr.rotation.x = -Math.PI / 2; dr.position.set(q[0], 0.009, q[1]); S(dr); });
}
function addHallFX(scene) { var cz = HALL.cz, cw = HALL.cw, hx = HALL.hx, hw = HALL.hw, hd = HALL.hd, vx = HALL.vx, HH = 14, FX = HALL.fx = { mats: [] };
  var tex = function (w, h, draw) { var c = CV(w, h); draw(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); return t; };
  var add = function (m) { m.userData.noColl = true; m.frustumCulled = false; scene.add(m); return m; };
  /* baked corner shadows */
  var aoT = tex(16, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.35, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var aoM = function (k) { return new THREE.MeshBasicMaterial({ map: aoT, transparent: true, opacity: k, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); };
  var aoLine = function (x0, z0, x1, z1, nx, nz, yFloor, yCeil, k) { var L = Math.hypot(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = Math.atan2(nx, nz);
    var w1 = add(new THREE.Mesh(new THREE.PlaneGeometry(L, 0.9), aoM(0.7 * k))); w1.position.set(mx + nx * 0.004, yFloor + 0.45, mz + nz * 0.004); w1.rotation.set(0, ry, Math.PI); w1.renderOrder = 3;
    var f1 = add(new THREE.Mesh(new THREE.PlaneGeometry(L, 0.9), aoM(0.6 * k))); f1.position.set(mx + nx * 0.45, yFloor + 0.004, mz + nz * 0.45); f1.rotation.set(-Math.PI / 2, 0, -ry + Math.PI); f1.renderOrder = 3;
    if (yCeil) { var c1 = add(new THREE.Mesh(new THREE.PlaneGeometry(L, 1.4), aoM(0.35 * k))); c1.position.set(mx + nx * 0.004, yCeil - 0.7, mz + nz * 0.004); c1.rotation.set(0, ry, 0); c1.renderOrder = 3; } };
  aoLine(hx - hw, cz - hd / 2, hx, cz - hd / 2, 0, 1, 0, HH, 1); aoLine(hx - hw, cz + hd / 2, hx, cz + hd / 2, 0, -1, 0, HH, 1); aoLine(hx - hw, cz - hd / 2, hx - hw, cz + hd / 2, 1, 0, 0, HH, 1);
  aoLine(hx, cz - hd / 2, hx, cz - cw / 2, -1, 0, 0, HH, 1); aoLine(hx, cz + cw / 2, hx, cz + hd / 2, -1, 0, 0, HH, 1);
  aoLine(-RX, cz - cw / 2, hx, cz - cw / 2, 0, 1, 0, 3.0, 1.2); aoLine(-RX, cz + cw / 2, hx, cz + cw / 2, 0, -1, 0, 3.0, 1.2);
  /* shadow under the gallery walkways */ [[cz - hd / 2 + 0.6, 1], [cz + hd / 2 - 0.6, -1]].forEach(function (q) { var s = add(new THREE.Mesh(new THREE.PlaneGeometry(hw - 1.2, 2.4), aoM(0.22))); s.position.set(hx - hw / 2, 0.006, q[0] + q[1] * 0.6); s.rotation.x = -Math.PI / 2; s.renderOrder = 3; });
  /* light shafts and warm floor pools */
  var shaftM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { k: { value: 1 } },
    vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vn = normalize(normalMatrix * normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float k; varying float vy; varying vec3 vn; varying vec3 vv; void main(){ float edge = pow(abs(dot(vn, vv)), 1.6); float a = vy * vy * edge * 0.32 * k; gl_FragColor = vec4(vec3(1.0,0.95,0.84) * a, a); }' });
  var poolT = tex(128, 128, function (g, w, h) { var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,215,.55)'); gr.addColorStop(0.5, 'rgba(255,235,205,.18)'); gr.addColorStop(1, 'rgba(255,235,205,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var poolM = new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 });
  [[-4, -5.5], [-4, 5.5], [-14, -5.5], [-14, 5.5], [-9, 0], [-9, -7], [-9, 7]].forEach(function (q) { var x = hx + q[0], z = cz + q[1], over = Math.hypot(x - vx, z - cz) < 4.6;
    var sh = add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, over ? 3.4 : 3.0, over ? HH + 4 : HH - 0.2, 32, 1, true), shaftM)); sh.position.set(x, over ? (HH - 4) / 2 - 0.1 : HH / 2, z); sh.renderOrder = 7;
    if (!over) { var p = add(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), poolM)); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.008, z); p.renderOrder = 4; } });
  for (var i = 0; i < 6; i++) { var lx = -RX + (hx + RX) * (i + 0.5) / 6, p2 = add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), poolM)); p2.rotation.x = -Math.PI / 2; p2.position.set(lx, 0.008, cz); p2.renderOrder = 4; }
  /* dust in the air, catching the light */
  var DN = 900, dp = new Float32Array(DN * 3); for (i = 0; i < DN; i++) { var inC = i >= 700; dp[i * 3] = inC ? -RX + (hx + RX) * Math.random() : hx - Math.random() * hw; dp[i * 3 + 1] = inC ? 0.3 + Math.random() * 2.5 : 0.5 + Math.random() * (HH - 1); dp[i * 3 + 2] = cz + (Math.random() - 0.5) * (inC ? cw - 0.3 : hd); }
  var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); FX.dust = add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xfff2dc, size: 0.016, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending })));
  /* water surface: ripples, fresnel sheen, caustic glints, Cherenkov blue with power */
  FX.water = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { t: { value: 0 }, pw: { value: 0 } },
    vertexShader: 'varying vec2 vp; varying vec3 vv; void main(){ vp = position.xy; vec4 mv = modelViewMatrix * vec4(position,1.0); vv = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float t, pw; varying vec2 vp; varying vec3 vv; float w(vec2 p){ return sin(p.x*2.1+t*0.9)*0.5 + sin(p.y*2.7-t*1.1)*0.5 + sin((p.x+p.y)*4.3+t*1.7)*0.25 + sin(length(p)*6.0-t*2.2)*0.2; }' +
      'void main(){ vec2 e = vec2(0.03,0.0); vec3 n = normalize(vec3(w(vp+e.xy)-w(vp-e.xy), w(vp+e.yx)-w(vp-e.yx), 0.35)); float fr = pow(1.0 - abs(dot(vec3(0.0,0.0,1.0), normalize(vv))), 3.0); float r = length(vp)/4.0;' +
      'float c = pow(max(0.0, sin(vp.x*7.0+n.x*6.0+t*0.7)*sin(vp.y*7.0+n.y*6.0-t*0.6)), 6.0); vec3 deep = vec3(0.02,0.16,0.38), shal = vec3(0.10,0.42,0.70); vec3 col = mix(shal, deep, smoothstep(0.0,1.0,r*0.6)); col += vec3(0.6,0.85,1.0)*c*0.35; col += vec3(0.75,0.85,0.95)*fr*0.35 + vec3(0.9,0.95,1.0)*pow(max(0.0,n.x*0.7+n.y*0.5),12.0)*0.6;' +
      'col += vec3(0.25,0.55,1.0)*pw*(1.2 - r)*1.4; gl_FragColor = vec4(col, 0.5 + fr*0.3 + pw*0.15); }' });
  if (HALL.glow) { HALL.glow.material = FX.water; HALL.glow.renderOrder = 8; }
  /* depth haze: stacked tint layers, so the vessel fades into blue with depth */
  [-2.2, -4.2, -6.2, -8.2].forEach(function (y, k) { var d = add(new THREE.Mesh(new THREE.CircleGeometry(3.98, 64), new THREE.MeshBasicMaterial({ color: 0x0a3a78, transparent: true, opacity: 0.16 + k * 0.03, depthWrite: false, side: THREE.DoubleSide }))); d.rotation.x = -Math.PI / 2; d.position.set(vx, y, cz); d.renderOrder = 5; });
  /* caustics dancing on the pool liner */
  FX.caus = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, uniforms: { t: { value: 0 }, pw: { value: 0 } },
    vertexShader: 'varying vec2 vu; void main(){ vu = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float t, pw; varying vec2 vu; void main(){ vec2 p = vec2(vu.x*60.0, vu.y*14.0); float c = 0.0; for (int i = 0; i < 3; i++){ float fi = float(i); c += pow(max(0.0, sin(p.x*(0.7+fi*0.3)+sin(p.y*1.3+t*(0.6+fi*0.2))*2.0+t*0.4)*sin(p.y*(0.9+fi*0.2)+sin(p.x*0.8-t*0.5)*2.0)), 5.0); } float fade = smoothstep(0.0, 0.9, vu.y); vec3 col = mix(vec3(0.35,0.7,1.0), vec3(0.4,0.75,1.0), pw) * c * fade * (0.22 + pw*0.5); gl_FragColor = vec4(col, 1.0); }' });
  var cs = add(new THREE.Mesh(new THREE.CylinderGeometry(3.96, 3.96, 8.4, 64, 1, true), FX.caus)); cs.position.set(vx, -4.7, cz); cs.renderOrder = 6;
  /* Cherenkov column inside the pool: faint at shutdown, vivid blue at power */
  FX.cher = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { pw: { value: 0 }, t: { value: 0 } },
    vertexShader: 'varying vec2 vu; varying vec3 vn; varying vec3 vv; void main(){ vu = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vn = normalize(normalMatrix * normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float pw, t; varying vec2 vu; varying vec3 vn; varying vec3 vv; void main(){ float edge = pow(abs(dot(vn, vv)), 2.0); float a = (1.0 - vu.y) * edge * (0.04 + pw * 0.55) * (0.9 + 0.1*sin(t*3.0+vu.x*40.0)); gl_FragColor = vec4(vec3(0.3,0.6,1.0) * a, a); }' });
  var ch = add(new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.2, 7, 48, 1, true), FX.cher)); ch.position.set(vx, -5.0, cz); ch.renderOrder = 6;
  /* small lights: crane beacon, exit sign over the corridor, pool-edge lamps */
  FX.beacon = add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff3020 }))); FX.beacon.position.set(vx + 1.5, HH - 2.2, cz + 1.5);
  var ex = add(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), new THREE.MeshBasicMaterial({ map: signTex(300, 100, function (g) { g.fillStyle = '#0b9a44'; g.fillRect(0, 0, 300, 100); ctext(g, '🏃 EXIT → CONTROL ROOM', 150, 52, 30, '#fff', 'center', 290); }) }))); ex.position.set(hx - 0.06, 3.35, cz); ex.rotation.y = -Math.PI / 2;
  var exg = add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: poolT, color: 0x30ff80, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }))); exg.position.set(hx - 0.07, 3.35, cz); exg.rotation.y = -Math.PI / 2;
  for (i = 0; i < 8; i++) { var a2 = i / 8 * Math.PI * 2 + 0.2, ll = add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), new THREE.MeshBasicMaterial({ color: 0xbfe2ff }))); ll.position.set(vx + Math.cos(a2) * 3.9, -0.9, cz + Math.sin(a2) * 3.9); var lg = add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: poolT, color: 0x9fd0ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }))); lg.position.copy(ll.position); lg.lookAt(vx, -0.9, cz); }
  /* ---- roof trusses, purlins and lamp glare ---- */
  (function () { var trussM = new THREE.MeshStandardMaterial({ color: 0x55606a, roughness: 0.6, metalness: 0.5 }); for (var k = 0; k <= 6; k++) { var x = hx - 1.5 - k * (hw - 3) / 6; add(box(0.3, 0.5, hd - 0.4, trussM, x, HH - 0.55, cz)); add(box(0.3, 0.5, hd - 0.4, trussM, x, HH - 1.9, cz)); for (var j = 0; j < 12; j++) { var z0 = cz - hd / 2 + 0.5 + j * (hd - 1) / 12, d = box(0.12, 1.45, 0.12, trussM, x, HH - 1.22, z0 + (hd - 1) / 24); d.rotation.x = (j % 2 ? 1 : -1) * Math.atan((hd - 1) / 12 / 1.4); add(d); } }
    for (var p = 0; p < 7; p++) add(box(hw - 2, 0.12, 0.25, trussM, hx - hw / 2, HH - 0.3, cz - hd / 2 + 0.8 + p * (hd - 1.6) / 6));
    var glareT = (function () { var c = CV(128, 128), g2 = c.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,245,225,.55)'); gr.addColorStop(1, 'rgba(255,240,210,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    var glare = function (x, y, z, s) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glareT, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); add(sp); };
    [[-4, -5.5], [-4, 5.5], [-14, -5.5], [-14, 5.5], [-9, 0], [-9, -7], [-9, 7]].forEach(function (q) { glare(hx + q[0], HH - 0.25, cz + q[1], 4.5); }); for (var i = 0; i < 6; i++) glare(-RX + (hx + RX) * (i + 0.5) / 6, 2.9, cz, 1.6);
    /* mist hanging over the warm pool */ var mistM = new THREE.MeshBasicMaterial({ map: glareT, color: 0x9fc4ff, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }); FX.mist = []; for (i = 0; i < 5; i++) { var mm = add(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), mistM)); mm.rotation.x = -Math.PI / 2; mm.position.set(vx + (Math.random() - 0.5) * 3, 0.3 + i * 0.25, cz + (Math.random() - 0.5) * 3); mm.userData.ph = Math.random() * 6; FX.mist.push(mm); } })();
  FX.t = 0; }
HALL.fxTick = function (dt) { var F = HALL.fx; if (!F) return; F.t += dt; var pw = clamp(D.pr / 100, 0, 1), near = Math.abs(CAM.x - HALL.vx) < 30;
  if (F.water) { F.water.uniforms.t.value = F.t; F.water.uniforms.pw.value = pw; } if (F.caus) { F.caus.uniforms.t.value = F.t; F.caus.uniforms.pw.value = pw; } if (F.cher) { F.cher.uniforms.pw.value = pw; F.cher.uniforms.t.value = F.t; }
  if (F.beacon) F.beacon.visible = Math.sin(F.t * 4) > 0.2; if (F.mist) F.mist.forEach(function (m, i) { m.position.x += Math.sin(F.t * 0.15 + m.userData.ph) * 0.004; m.rotation.z = F.t * 0.02 * (i % 2 ? 1 : -1); m.material.opacity = 0.06 + 0.03 * Math.sin(F.t * 0.4 + m.userData.ph); });
  if (F.dust && near) { var a = F.dust.geometry.attributes.position.array; for (var i = 0; i < a.length; i += 3) { a[i] += Math.sin(F.t * 0.3 + i) * 0.02 * dt; a[i + 1] += (Math.sin(F.t * 0.21 + i * 0.7) * 0.03 - 0.008) * dt; a[i + 2] += Math.cos(F.t * 0.27 + i * 1.3) * 0.02 * dt; if (a[i + 1] < 0.3) a[i + 1] = i >= 2100 ? 2.8 : 13; } F.dust.geometry.attributes.position.needsUpdate = true; } };
var DOORS = { list: [], reg: function (g) { g.userData.open = 0; g.userData.tgt = 0; this.list.push(g); if (!g.userData.leaves) g.userData.leaves = g.children.slice(1); },
  toggle: function (g) { g.userData.tgt = g.userData.tgt ? 0 : 1; AUD.sfx('step'); },
  tick: function (dt) { this.list.forEach(function (g) { var u = g.userData; if (u.open === u.tgt) return; u.open += Math.sign(u.tgt - u.open) * Math.min(Math.abs(u.tgt - u.open), dt * 2); u.leaves.forEach(function (l) { if (l.userData.k != null) l.rotation.y = l.userData.k * u.open * 1.5; else l.visible = u.open < 0.5; }); }); } };
function goHall() { CAM.tw = null; CAM.view = null; CAM.x = HALL.hx - 3.2; CAM.z = HALL.cz; CAM.y = 1.65; CAM.yaw = Math.PI / 2; CAM.pitch = -0.32; }
function hallDose() { var p = S.p; if (!p) return 0.2; var pw = clamp(D.pr / 100, 0, 1); return 0.2 + pw * 180 + (p.x && p.x.f && (p.x.f.loca || p.x.f.lb) ? 5000 : 0); }
function drawAreaMon(g) { var W = 640, H = 400, d = hallDose(), hi = d > 100; g.fillStyle = hi ? '#3a0d0b' : '#0c1a10'; g.fillRect(0, 0, W, H); ctext(g, 'AREA MONITOR RM-12', 320, 40, 28, '#dfe6ea'); ctext(g, 'REACTOR CAVITY', 320, 72, 22, '#9fb3c8');
  ctext(g, (d >= 1000 ? (d / 1000).toFixed(2) + ' mSv/h' : d.toFixed(d < 10 ? 2 : 0) + ' µSv/h'), 320, 190, 86, hi ? '#ff6b57' : '#7bffa0'); ctext(g, hi ? 'HIGH RADIATION · LIMIT STAY' : d > 5 ? 'ELEVATED · N-16' : 'NORMAL', 320, 290, 30, hi ? '#ffb3a8' : '#9fb3c8');
  if (HALL.in && HALL.dose != null) ctext(g, 'YOUR DOSE THIS VISIT: ' + (HALL.dose < 1000 ? HALL.dose.toFixed(1) + ' µSv' : (HALL.dose / 1000).toFixed(2) + ' mSv'), 320, 350, 24, '#ffd34a'); }
HALL.tick = function (dt) { var inside = CAM.x < HALL.hx + 0.3; if (inside && !HALL.in) { HALL.in = true; HALL.dose = 0; HALL.t0 = Date.now(); var d = hallDose(); S.addLog('Entered the reactor hall (' + (d < 1000 ? d.toFixed(1) + ' µSv/h' : (d / 1000).toFixed(1) + ' mSv/h') + ')'); toast(d > 100 ? '☢ Reactor hall: ' + Math.round(d) + ' µSv/h. The reactor is at power: keep the visit short.' : d > 5 ? '☢ Reactor hall: ' + d.toFixed(1) + ' µSv/h. Dosimeter on.' : '☢ Reactor hall: background only. Have a look round.', d > 100 ? 'warn' : 'ok'); CAR.unlock && CAR.unlock('hall'); AUD.sfx('chime'); }
  if (!inside && HALL.in) { HALL.in = false; S.addLog('Left the reactor hall: dose ' + HALL.dose.toFixed(1) + ' µSv'); }
  if (HALL.in) HALL.dose += hallDose() * dt / 3600;
  if (HALL.light) HALL.light.intensity = clamp(D.pr / 100, 0, 1) * 90; HALL.fxTick(dt); };
/* ================================================================ crew watch: hand the board to the supervisor ================================================================
   Once the unit is synchronised and above 25% power with nothing abnormal, you can hand the control room to the shift supervisor for up to
   an hour of real time, to walk the plant or take a break. After that the crew needs two hours before they will cover again. */
var WATCH = { on: false, left: 0, cd: 0, el: null, MAX: 3600, CD: 7200,
  can: function () { var p = S.p, x = p && p.x; if (!x) return 'no plant'; if (WATCH.on) return null; if (WATCH.cd > 0) return 'the crew need ' + fmtT(WATCH.cd) + ' more before they cover again'; if (CRISIS.on) return 'not during a crisis shift'; if (p.tripped) return 'the reactor is tripped'; if (!x.tb.gen) return 'the generator must be synchronised first'; if (x.tb.mw < 300) return 'power must be above 25% (300 MW)'; if (FAULT.active().length || x.si.on) return 'there is a fault in the plant'; return null; },
  start: function () { var why = WATCH.can(); if (why) { toast('👤 Supervisor: “Not yet: ' + why + '.”', 'warn'); AUD.sfx('deny'); return; } WATCH.on = true; WATCH.left = WATCH.MAX; S.addLog('Handed the board to the shift supervisor for up to 1 hour'); toast('👤 Supervisor has the board for 1 hour. Go and look at the plant; you will be called back if anything happens.', 'ok'); speak('I have the board. Back in an hour.'); WATCH.draw(); },
  stop: function (why) { if (!WATCH.on) return; WATCH.on = false; WATCH.cd = WATCH.CD; S.addLog('Took the board back' + (why ? ' (' + why + ')' : '')); toast('👤 ' + (why ? 'Supervisor: “' + why + ' You have the board.”' : 'You have the board again.') + ' Crew can cover again in 2 h.', why ? 'warn' : 'ok'); if (why) speak(why + ' You have the board.'); WATCH.draw(); },
  tick: function (dt) { if (WATCH.cd > 0 && !WATCH.on) { WATCH.cd = Math.max(0, WATCH.cd - dt); if (WATCH.cd === 0) toast('👤 The crew can cover the board again.', 'ok'); }
    if (!WATCH.on) { if (WATCH.el && WATCH.el.classList.contains('show') && WATCH.cd <= 0) WATCH.el.classList.remove('show'); return; } WATCH.left -= dt; var p = S.p, x = p.x;
    if (p.tripped) WATCH.stop('Reactor trip.'); else if (x.si.on) WATCH.stop('Safety injection.'); else if (FAULT.active().length) WATCH.stop('We have a fault.'); else if (!x.tb.gen) WATCH.stop('Generator is off the grid.'); else if (WATCH.left <= 0) WATCH.stop('That is your hour.');
    if (WATCH.on && Math.floor(WATCH.left) % 2 === 0) WATCH.draw(); },
  draw: function () { if (!WATCH.el) WATCH.el = h('div', 'cpnfact watch', null, root); var e = WATCH.el; if (WATCH.on) { e.textContent = '👤 Supervisor has the board · ' + fmtT(WATCH.left) + ' left · press H to take it back'; e.classList.add('show'); } else if (WATCH.cd > 0) { e.textContent = '👤 Crew cover available again in ' + fmtT(WATCH.cd); e.classList.add('show'); setTimeout(function () { if (!WATCH.on) e.classList.remove('show'); }, 6000); } else e.classList.remove('show'); }
};
/* ================================================================ outside: a real landscape beyond the east windows ================================================================
   Not a picture: a terrain mesh of snowy mountains, a frozen valley floor, a sky dome with stars and a moon, and two aurora curtains
   driven by a shader, all out past x = RX where the east wall now has five real window openings. Parallax works because it is geometry. */
var EXT = { t: 0, aur: [], on: false };
function addOutside(scene) { var g = new THREE.Group(); g.position.set(RX, 0, RZC); scene.add(g); EXT.g = g;
  /* terrain: flat snow near the building, mountains rising with distance; vertex colours darken the rock faces */
  var N = 320, SZE = 900, geo = new THREE.PlaneGeometry(SZE, SZE, N, N); geo.rotateX(-Math.PI / 2); geo.translate(SZE / 2 - 20, 0, 0);
  /* ridged noise: sharp crests and summits like real alpine peaks, layered over a broad massif that rises away from the station */
  var hsh = function (x, z) { var n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return n - Math.floor(n); };
  var vn = function (x, z) { var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz; fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz); var a = hsh(ix, iz), b = hsh(ix + 1, iz), c = hsh(ix, iz + 1), d = hsh(ix + 1, iz + 1); return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz; };
  var ridge0 = function (x, z) { var sum = 0, amp = 1, f = 0.012, w = 1; for (var o = 0; o < 7; o++) { var r = 1 - Math.abs(vn(x * f, z * f) * 2 - 1); r = r * r * w; sum += r * amp; w = Math.min(1, r * 1.8); amp *= 0.5; f *= 2.05; } return sum; };
  /* domain warping bends the ridges into curved spurs and cirques instead of straight noise lines */
  var ridge = function (x, z) { var wx = (vn(x * 0.004 + 3.1, z * 0.004) - 0.5) * 120, wz = (vn(x * 0.004, z * 0.004 + 7.7) - 0.5) * 120; return ridge0(x + wx, z + wz); };
  var P = geo.attributes.position;
  for (var i = 0; i < P.count; i++) { var x = P.getX(i), z = P.getZ(i), d = Math.hypot(x, z), rise = clamp((d - 140) / 260, 0, 1), m = rise * rise * (3 - 2 * rise);
    var h = -0.4 + m * (ridge(x + 500, z + 300) * 62 + 12) + (d > 400 ? (d - 400) * 0.12 : 0) + (d < 70 ? 0.25 * Math.sin(x * 0.3) * Math.cos(z * 0.27) : 0); var ld = Math.hypot((x - 75) / 38, (z - 0) / 24); if (ld < 1.35) h = Math.min(h, -0.4 - 0.6 * clamp(1.15 - ld, 0, 1)) * (ld < 1 ? 1 : 1) ; P.setY(i, Math.max(-1.0, h)); }
  geo.computeVertexNormals(); var Nn = geo.attributes.normal, col = new Float32Array(P.count * 3), W1 = N + 1, aoV = new Float32Array(P.count);
  for (i = 0; i < P.count; i++) { var ix = i % W1, iz = (i / W1) | 0, hc = P.getY(i), acc = 0, cnt = 0; for (var dz = -4; dz <= 4; dz += 2) for (var dx = -4; dx <= 4; dx += 2) { var jx = ix + dx, jz = iz + dz; if (jx < 0 || jz < 0 || jx >= W1 || jz >= W1) continue; acc += P.getY(jz * W1 + jx); cnt++; } aoV[i] = clamp(1 - (acc / cnt - hc) * 0.03, 0.6, 1.1); }
  var snowC = new THREE.Color(0xeef3f8), rockC = new THREE.Color(0x2c3036), rock2 = new THREE.Color(0x5d5a56), c = new THREE.Color();
  for (i = 0; i < P.count; i++) { var hh = P.getY(i), up = Nn.getY(i), px = P.getX(i), pz = P.getZ(i), steep = clamp((0.84 - up) / 0.26, 0, 1), alt = clamp((hh - 6) / 30, 0, 1), crag = clamp(vn(px * 0.05 + 7, pz * 0.05) * 1.6 - 0.75, 0, 1), strata = 0.5 + 0.5 * Math.sin(hh * 0.35 + vn(px * 0.03, pz * 0.03) * 4);
    var rockiness = clamp(steep * (0.35 + 0.5 * alt) + crag * alt * 0.5, 0, 1) * 0.85;
    /* patchy snow on the valley floor and lower slopes: irregular bare patches of frozen earth and scrub, with ragged soft edges, thinning out with height */
    var low = 1 - clamp((hh + 0.4) / 26, 0, 1), pn = vn(px * 0.035 + 11, pz * 0.035 + 5) * 0.6 + vn(px * 0.11 + 3, pz * 0.11) * 0.3 + vn(px * 0.4, pz * 0.4 + 9) * 0.1, bare = clamp((pn - 0.52) * 7, 0, 1) * low * (Math.hypot(px, pz) > 45 ? 1 : 0.25), earth = new THREE.Color(0x4a4036).lerp(new THREE.Color(0x6b6a52), vn(px * 0.2, pz * 0.2));
    c.copy(rockC).lerp(rock2, strata); c.lerp(snowC, 1 - rockiness); c.lerp(earth, bare); c.multiplyScalar(aoV[i]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var snowT = (function () { var c = CV(1024, 1024), g2 = c.getContext('2d'); g2.fillStyle = '#f2f5f8'; g2.fillRect(0, 0, 1024, 1024);
    for (var i = 0; i < 400; i++) { var x = Math.random() * 1024, y = Math.random() * 1024, r = 30 + Math.random() * 160, gr = g2.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, Math.random() < 0.5 ? 'rgba(205,215,228,.35)' : 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g2.fillStyle = gr; g2.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g2.strokeStyle = 'rgba(190,202,218,.28)'; for (i = 0; i < 160; i++) { g2.lineWidth = 2 + Math.random() * 5; var sx = Math.random() * 1024, sy = Math.random() * 1024; g2.beginPath(); g2.moveTo(sx, sy); for (var k = 1; k < 8; k++) g2.lineTo(sx + k * 28 + Math.sin(k + i) * 6, sy + Math.sin(k * 0.9 + i) * 9); g2.stroke(); }
    for (i = 0; i < 26000; i++) { var v = Math.random() < 0.08 ? 255 : 220 + Math.random() * 30, a = Math.random() < 0.08 ? 0.9 : 0.25; g2.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')'; g2.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5); }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(90, 90); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
  var rockT = (function () { var c = CV(1024, 1024), g2 = c.getContext('2d'); g2.fillStyle = '#6a6762'; g2.fillRect(0, 0, 1024, 1024);
    for (var i = 0; i < 90; i++) { g2.fillStyle = 'rgba(' + (30 + Math.random() * 40) + ',' + (32 + Math.random() * 36) + ',' + (36 + Math.random() * 34) + ',' + (0.35 + Math.random() * 0.4) + ')'; var y = Math.random() * 1024; g2.beginPath(); g2.moveTo(0, y); for (var x = 0; x <= 1024; x += 32) g2.lineTo(x, y + Math.sin(x * 0.02 + i) * 14 + Math.sin(x * 0.11 + i * 3) * 4); g2.lineTo(1024, y + 6 + Math.random() * 22); g2.lineTo(0, y + 6 + Math.random() * 22); g2.closePath(); g2.fill(); }
    for (i = 0; i < 50000; i++) { var v = 60 + Math.random() * 90; g2.fillStyle = 'rgba(' + v + ',' + (v - 3) + ',' + (v - 8) + ',.35)'; g2.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2); }
    g2.strokeStyle = 'rgba(20,22,26,.6)'; for (i = 0; i < 120; i++) { g2.lineWidth = 1 + Math.random() * 2; var cx = Math.random() * 1024, cy = Math.random() * 1024; g2.beginPath(); g2.moveTo(cx, cy); for (var k = 0; k < 6; k++) g2.lineTo(cx += (Math.random() - 0.5) * 50, cy += Math.random() * 60); g2.stroke(); }
    for (i = 0; i < 60; i++) { var sx = Math.random() * 1024, sy = Math.random() * 1024, sr = 10 + Math.random() * 40, sg = g2.createRadialGradient(sx, sy, 0, sx, sy, sr); sg.addColorStop(0, 'rgba(235,240,245,.7)'); sg.addColorStop(1, 'rgba(235,240,245,0)'); g2.fillStyle = sg; g2.fillRect(sx - sr, sy - sr, 2 * sr, 2 * sr); }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(28, 28); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
  var terM = new THREE.MeshStandardMaterial({ vertexColors: true, map: snowT, bumpMap: rockT, bumpScale: 1.4, color: 0x6a7894, roughness: 0.9 });
  terM.onBeforeCompile = function (sh) { sh.uniforms.rockMap = { value: rockT }; sh.fragmentShader = 'uniform sampler2D rockMap;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', 'vec4 snowS = texture2D(map, vMapUv); vec4 rockS = texture2D(rockMap, vMapUv * 0.31); float snowy = smoothstep(0.3, 0.62, vColor.g); float earthy = clamp((vColor.r - vColor.b) * 6.0, 0.0, 1.0); snowy *= 1.0 - earthy; diffuseColor *= mix(rockS * vec4(vColor.rgb * 2.2, 1.0), snowS * vec4(vColor.rgb, 1.0), snowy);')
      .replace('#include <color_fragment>', ''); };
  var ter = new THREE.Mesh(geo, terM); ter.frustumCulled = false; g.add(ter);
  (function () { var NA = 160, NR = 28, R0 = 440, R1 = 1800, pos = [], colr = [], idx = [], cc = new THREE.Color(); for (var r = 0; r <= NR; r++) for (var a = 0; a <= NA; a++) { var t = r / NR, rad = R0 + (R1 - R0) * t * t, ang = a / NA * Math.PI * 2, x = Math.cos(ang) * rad + SZE / 2 - 20, z = Math.sin(ang) * rad, h = -0.4 + ridge(x * 0.7 + 900, z * 0.7 + 400) * (120 + 160 * t) + 30 + (rad - R0) * 0.06; if (r === 0) h = Math.max(h, 40); pos.push(x, h, z);
      var k = clamp((h - 40) / 150, 0, 1), rk = clamp(1 - Math.abs(Math.sin(ang * 13 + rad * 0.01)) * 0.4 - 0.3 + k * 0.3, 0, 1); cc.setRGB(0.22, 0.25, 0.3).lerp(new THREE.Color(0.93, 0.96, 1.0), 0.5 + 0.5 * k); colr.push(cc.r, cc.g, cc.b); }
    for (r = 0; r < NR; r++) for (a = 0; a < NA; a++) { var i0 = r * (NA + 1) + a, i1 = i0 + 1, i2 = i0 + NA + 1, i3 = i2 + 1; idx.push(i0, i2, i1, i1, i2, i3); }
    var fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); fg.setIndex(idx); fg.computeVertexNormals();
    var far = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ vertexColors: true, color: 0x8ea0bd, roughness: 1 })); far.frustumCulled = false; g.add(far); EXT.far = far; })();
  /* a line of birches and a fence along the valley floor */
  var twig = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 1 });
  /* snow-laden pines: three tiers of dark needles, each with a snow cap, instanced so hundreds cost almost nothing */
  var terrainH = function (x, z) { var d = Math.hypot(x, z), rise = clamp((d - 140) / 260, 0, 1), m = rise * rise * (3 - 2 * rise); return -0.4 + m * (ridge(x + 500, z + 300) * 62 + 12) + (d > 400 ? (d - 400) * 0.12 : 0); };
  (function () { var N = 420, tiers = [[2.1, 1.7, 1.5], [1.75, 1.6, 2.4], [1.4, 1.5, 3.25], [1.0, 1.4, 4.05], [0.6, 1.3, 4.8]],
    /* a branch whorl: a cone whose rim is cut into 16 jagged tips that droop below the base, with a sagging underside */
    whorl = function (r, h, snow) { var g = new THREE.ConeGeometry(r, h, 32, 3, true), p = g.attributes.position, v = new THREE.Vector3(); for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var rr = Math.hypot(v.x, v.z); if (rr < 1e-4) continue; var a = Math.atan2(v.z, v.x), tip = 0.5 + 0.5 * Math.cos(a * 16), k = (h / 2 - v.y) / h, jag = 1 + (tip - 0.5) * 0.42 * k + (Math.sin(a * 5.3) * 0.06) * k; v.x *= jag; v.z *= jag; v.y -= tip * 0.22 * h * k * k + (snow ? 0 : 0.05 * h * k); if (snow) { v.y += Math.sin(a * 7.1) * 0.04 * h; } p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }, needle = new THREE.MeshStandardMaterial({ color: 0x1b3829, roughness: 0.95, flatShading: true, side: THREE.DoubleSide }), snowM = new THREE.MeshStandardMaterial({ color: 0xe8f0f8, roughness: 0.9, flatShading: true, side: THREE.DoubleSide }), barkM = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 });
    EXT.wind = { value: 0 }; [needle, snowM].forEach(function (mt) { mt.onBeforeCompile = function (sh) { sh.uniforms.wt = EXT.wind; sh.vertexShader = 'uniform float wt;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]); float ph = ip.x * 0.21 + ip.z * 0.17; float gust = 0.6 + 0.4 * sin(wt * 0.23 + ip.x * 0.02); float hgt = clamp(ip.y / 4.5, 0.15, 1.2) * (position.y + 1.2); transformed.x += (sin(wt * 1.4 + ph) * 0.07 + sin(wt * 3.7 + ph * 2.0) * 0.02) * gust * hgt; transformed.z += cos(wt * 1.1 + ph) * 0.04 * gust * hgt;'); }; });
    var trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.2, 5.2, 7), barkM, N), parts = tiers.map(function (t) { return [new THREE.InstancedMesh(whorl(t[0], t[1], false), needle, N), new THREE.InstancedMesh(whorl(t[0] * 0.8, t[1] * 0.5, true), snowM, N)]; });
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sv = new THREE.Vector3(), V = new THREE.Vector3(), E = new THREE.Euler();
    for (var n = 0; n < N; n++) { var tx, tz; var ty; do { tx = 14 + Math.random() * 300; tz = -260 + Math.random() * 520; ty = terrainH(tx, tz); } while ((tx < 30 && Math.abs(tz - 9.9) < 8) || Math.hypot((tx - 75) / 41, tz / 27) < 1 || ty > 24 || (ty > 2 && Math.random() < 0.6)); var sc = 0.6 + Math.random() * 1.1, ry = Math.random() * 6.3; Q.setFromEuler(E.set((Math.random() - 0.5) * 0.06, ry, (Math.random() - 0.5) * 0.06)); Sv.set(sc * (0.9 + Math.random() * 0.2), sc, sc * (0.9 + Math.random() * 0.2));
      M.compose(V.set(tx, ty + 2.6 * sc, tz), Q, Sv); trunk.setMatrixAt(n, M);
      tiers.forEach(function (t, k) { M.compose(V.set(tx, ty + t[2] * sc, tz), Q, Sv); parts[k][0].setMatrixAt(n, M); M.compose(V.set(tx, ty + (t[2] + t[1] * 0.26) * sc, tz), Q, Sv); parts[k][1].setMatrixAt(n, M); }); }
    [trunk].concat([].concat.apply([], parts)).forEach(function (m) { m.frustumCulled = false; g.add(m); }); })();
  for (i = 0; i < 40; i++) { var fp = cyl(0.03, 0.03, 1.1, twig, 4); fp.position.set(8, 0.15, -60 + i * 3); g.add(fp); } var rail = box(0.02, 0.02, 120, twig, 8, 0.6, 0, g);
  /* sky dome, stars, moon */
  var sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { day: { value: 0 }, dusk: { value: 0 }, sd: { value: new THREE.Vector3(0, 1, 0) } }, vertexShader: 'varying vec3 vp; void main(){ vp = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'uniform float day, dusk; uniform vec3 sd; varying vec3 vp; void main(){ vec3 n = normalize(vp); float h = n.y; vec3 topN = vec3(0.02,0.04,0.11), horN = vec3(0.12,0.26,0.30), topD = vec3(0.22,0.45,0.85), horD = vec3(0.70,0.82,0.95), horK = vec3(1.0,0.55,0.30); vec3 top = mix(topN, topD, day), hor = mix(mix(horN, horD, day), horK, dusk * (1.0 - clamp(h*3.0,0.0,1.0))); vec3 c = mix(hor, top, clamp(h*2.2,0.0,1.0)); float sg = max(0.0, dot(n, normalize(sd))); c += vec3(1.0,0.85,0.6) * (pow(sg, 400.0) * 3.0 + pow(sg, 8.0) * 0.25 * (day + dusk)); gl_FragColor = vec4(c, 1.0); }' })); sky.frustumCulled = false; g.add(sky); EXT.sky = sky;
  var sp = new Float32Array(1400 * 3); for (i = 0; i < 1400; i++) { var th2 = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 0.95 + 0.05); sp[i * 3] = Math.sin(ph) * Math.cos(th2) * 2300; sp[i * 3 + 1] = Math.cos(ph) * 2300; sp[i * 3 + 2] = Math.sin(ph) * Math.sin(th2) * 2300; }
  var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); var stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.9 })); stars.frustumCulled = false; g.add(stars);
  var moon = new THREE.Mesh(new THREE.SphereGeometry(34, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff4d6 })); moon.position.set(1520, 920, -1040); g.add(moon); EXT.moon = moon;
  /* aurora: two tall curtains with a scrolling band shader, additive */
  var aurSh = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { t: { value: 0 }, c1: { value: new THREE.Color(0x27ff8a) }, c2: { value: new THREE.Color(0x7a3cff) } },
    vertexShader: 'varying vec2 vu; void main(){ vu = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float t; uniform vec3 c1, c2; varying vec2 vu; void main(){ float x = vu.x*6.0; float w = sin(x*1.7 + t*0.35) * 0.5 + sin(x*4.1 - t*0.5)*0.25 + sin(x*9.3 + t*0.8)*0.12; float band = smoothstep(0.0, 0.25, vu.y) * (1.0 - smoothstep(0.35 + 0.25*w, 0.95, vu.y)); float ray = 0.55 + 0.45*sin(x*23.0 + t*1.3 + w*4.0); float a = band * ray * (0.35 + 0.3*w); vec3 col = mix(c1, c2, clamp(vu.y*1.4 - 0.2 + 0.3*w, 0.0, 1.0)); gl_FragColor = vec4(col * a, a); }' };
  [[0, 180, 0, -0.35], [1, 150, 120, 0.4]].forEach(function (q) { var m = new THREE.Mesh(new THREE.PlaneGeometry(2000, 600, 64, 1), new THREE.ShaderMaterial(aurSh)); m.material.uniforms = THREE.UniformsUtils.clone(aurSh.uniforms); m.material.uniforms.t.value = q[0] * 9; m.position.set(900 + q[2] * 1.2, q[1] * 3.6, q[2] * 4); m.rotation.y = -Math.PI / 2 + q[3]; m.frustumCulled = false; g.add(m); EXT.aur.push(m); });
  /* moonlight on the landscape */
  EXT.puffT = (function () { var c = CV(64, 64), g2 = c.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  var ml = new THREE.DirectionalLight(0x9fb4e0, 1.1); ml.position.set(380, 230, -260); ml.target = ter; g.add(ml); EXT.sun = ml; EXT.hemi = new THREE.HemisphereLight(0x2a4470, 0x10161f, 0.55); g.add(EXT.hemi); EXT.ter = ter;
  /* frozen lake: clear dark ice with frost, cracks and snow drifted at the edges */
  var iceC = CV(1024, 1024), ig = iceC.getContext('2d'); ig.fillStyle = '#6f8fa8'; ig.fillRect(0, 0, 1024, 1024); for (var q = 0; q < 300; q++) { var qx = Math.random() * 1024, qy = Math.random() * 1024, qr = 20 + Math.random() * 120, qg = ig.createRadialGradient(qx, qy, 0, qx, qy, qr); qg.addColorStop(0, Math.random() < 0.5 ? 'rgba(220,235,245,.22)' : 'rgba(40,70,100,.2)'); qg.addColorStop(1, 'rgba(0,0,0,0)'); ig.fillStyle = qg; ig.fillRect(qx - qr, qy - qr, 2 * qr, 2 * qr); }
  ig.strokeStyle = 'rgba(235,245,255,.55)'; for (q = 0; q < 45; q++) { ig.lineWidth = 0.6 + Math.random() * 1.6; var cx = Math.random() * 1024, cy = Math.random() * 1024; ig.beginPath(); ig.moveTo(cx, cy); for (var k = 0; k < 9; k++) { cx += (Math.random() - 0.5) * 110; cy += (Math.random() - 0.5) * 110; ig.lineTo(cx, cy); } ig.stroke(); }
  var eg = ig.createRadialGradient(512, 512, 330, 512, 512, 512); eg.addColorStop(0, 'rgba(240,246,252,0)'); eg.addColorStop(1, 'rgba(240,246,252,.95)'); ig.fillStyle = eg; ig.fillRect(0, 0, 1024, 1024);
  var iceT = new THREE.CanvasTexture(iceC); iceT.colorSpace = THREE.SRGBColorSpace; var ice = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.MeshStandardMaterial({ map: iceT, roughness: 0.12, metalness: 0.15, envMapIntensity: 1.5 })); ice.scale.set(40, 26, 1); ice.rotation.x = -Math.PI / 2; ice.position.set(75, -0.39, 0); g.add(ice); EXT.ice = ice;
  /* falling snow: 2600 flakes in a 120 m box outside the windows, recycled as they fall; a little wind wobble */
  var SN = 2600, spos = new Float32Array(SN * 3), sv = new Float32Array(SN); for (i = 0; i < SN; i++) { spos[i * 3] = Math.random() * 120; spos[i * 3 + 1] = Math.random() * 40; spos[i * 3 + 2] = (Math.random() - 0.5) * 120; sv[i] = 0.8 + Math.random() * 1.4; }
  var sng = new THREE.BufferGeometry(); sng.setAttribute('position', new THREE.BufferAttribute(spos, 3)); var snow = new THREE.Points(sng, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false })); snow.frustumCulled = false; g.add(snow); EXT.snow = snow; EXT.sv = sv;
  /* thin high cloud drifting across the sky */
  var cl = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { t: { value: 0 } }, vertexShader: 'varying vec2 vu; void main(){ vu = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'uniform float t; varying vec2 vu; float n(vec2 p){ return sin(p.x*3.1+t*0.02)*sin(p.y*2.7-t*0.013)*0.5+sin(p.x*7.3-p.y*5.1+t*0.03)*0.25+sin(p.x*13.0+p.y*11.0)*0.12; } void main(){ float v = n(vu+vec2(t*0.004,0.0)); float a = smoothstep(0.25,0.75,v)*0.22; float edge = smoothstep(0.0,0.2,vu.x)*smoothstep(1.0,0.8,vu.x)*smoothstep(0.0,0.2,vu.y)*smoothstep(1.0,0.8,vu.y); gl_FragColor = vec4(vec3(0.55,0.62,0.75)*a, a*edge); }' })); cl.rotation.x = -Math.PI / 2; cl.position.set(300, 700, 0); cl.scale.set(3.5, 3.5, 1); cl.frustumCulled = false; g.add(cl); EXT.cloud = cl;
  EXT.stars = stars; EXT.trees = []; g.children.forEach(function (o) { if (o.geometry && o.geometry.type === 'CylinderGeometry' && o.position.y > 1.5 && o.scale.x === 1) EXT.trees.push(o); });
  /* the building seen from outside: ribbed cladding on the other three faces and the roof (the east face is the window wall itself) */
  var rib = CV(512, 512), rg = rib.getContext('2d'); rg.fillStyle = '#9aa4ad'; rg.fillRect(0, 0, 512, 512); for (var r = 0; r < 512; r += 16) { rg.fillStyle = '#7f8992'; rg.fillRect(r, 0, 4, 512); rg.fillStyle = '#b3bcc4'; rg.fillRect(r + 5, 0, 2, 512); }
  rg.fillStyle = 'rgba(40,46,52,.55)'; rg.fillRect(0, 254, 512, 4); rg.fillRect(254, 0, 4, 512); for (r = 0; r < 512; r += 64) { rg.fillStyle = 'rgba(60,66,72,.6)'; rg.fillRect(r + 8, 250, 3, 3); rg.fillRect(r + 8, 506, 3, 3); }
  for (r = 0; r < 14; r++) { var rx = Math.random() * 512, rg2 = rg.createLinearGradient(0, 258, 0, 258 + 60 + Math.random() * 200); rg2.addColorStop(0, 'rgba(120,70,30,.35)'); rg2.addColorStop(1, 'rgba(120,70,30,0)'); rg.fillStyle = rg2; rg.fillRect(rx, 258, 3 + Math.random() * 6, 260); }
  for (r = 0; r < 9000; r++) { var gv = 120 + Math.random() * 60; rg.fillStyle = 'rgba(' + gv + ',' + gv + ',' + (gv + 5) + ',.18)'; rg.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
  var ribT = new THREE.CanvasTexture(rib); ribT.wrapS = ribT.wrapT = THREE.RepeatWrapping; var BH = 14.4, W0 = -RX - 26.2 - RX, L = RX - W0;
  var face = function (w, hgt, x, y, z, ry) { var t = ribT.clone(); t.needsUpdate = true; t.repeat.set(w / 4, hgt / 4); var m = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.3 })); m.position.set(x - RX, y, z - RZC); m.rotation.y = ry; g.add(m); };
  face(L, BH, (W0 + RX) / 2, BH / 2, ZB - 0.2, Math.PI); face(L, BH, (W0 + RX) / 2, BH / 2, ZF + 0.2, 0); face(RDP + 0.4, BH, W0 - 0.2, BH / 2, RZC, -Math.PI / 2);
  var roof = new THREE.Mesh(new THREE.PlaneGeometry(L, RDP + 0.4), new THREE.MeshStandardMaterial({ color: 0x5a636b, roughness: 0.8 })); roof.rotation.x = -Math.PI / 2; roof.position.set((W0 + RX) / 2 - RX, BH, 0); g.add(roof);
  face(RDP + 0.4, BH - CH, RX + 0.07, (BH + CH) / 2, RZC, Math.PI / 2);
  /* ================================================================ the site: what a reactor building looks like from outside ================================================================ */
  (function () { var G = g, mat = function (c, r, m) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.7 : r, metalness: m || 0 }); };
    var concC = CV(512, 512), cg = concC.getContext('2d'); cg.fillStyle = '#b9bcb8'; cg.fillRect(0, 0, 512, 512); for (var q = 0; q < 12000; q++) { var cv2 = 150 + Math.random() * 60; cg.fillStyle = 'rgba(' + cv2 + ',' + cv2 + ',' + (cv2 - 4) + ',.3)'; cg.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
    cg.strokeStyle = 'rgba(70,72,70,.5)'; cg.lineWidth = 3; cg.strokeRect(1, 1, 254, 254); cg.strokeRect(257, 1, 254, 254); cg.strokeRect(1, 257, 254, 254); cg.strokeRect(257, 257, 254, 254); cg.fillStyle = 'rgba(60,62,60,.55)'; [40, 216, 296, 472].forEach(function (x) { [40, 216, 296, 472].forEach(function (y) { cg.beginPath(); cg.arc(x, y, 5, 0, 6.3); cg.fill(); }); });
    for (q = 0; q < 28; q++) { var wx = Math.random() * 512, wg = cg.createLinearGradient(0, 0, 0, 120 + Math.random() * 300); wg.addColorStop(0, 'rgba(60,64,70,.28)'); wg.addColorStop(1, 'rgba(60,64,70,0)'); cg.fillStyle = wg; cg.fillRect(wx, 0, 4 + Math.random() * 10, 512); }
    var concT = new THREE.CanvasTexture(concC); concT.wrapS = concT.wrapT = THREE.RepeatWrapping; concT.repeat.set(16, 6); concT.colorSpace = THREE.SRGBColorSpace;
    var conc = new THREE.MeshStandardMaterial({ map: concT, bumpMap: concT, bumpScale: 0.6, roughness: 0.9 }), concD = mat(0x8f9492, 0.9), galv = mat(0xa9b0b5, 0.5, 0.55), dark = mat(0x23272b, 0.8), red = mat(0xc0392b, 0.6), white = mat(0xe6e8ea, 0.6), snowM = mat(0xe8eef5, 0.95);
    var asphC = CV(512, 512), ag = asphC.getContext('2d'); ag.fillStyle = '#34383d'; ag.fillRect(0, 0, 512, 512); for (var q = 0; q < 30000; q++) { var av = 30 + Math.random() * 60; ag.fillStyle = 'rgba(' + av + ',' + (av + 3) + ',' + (av + 8) + ',.5)'; ag.fillRect(Math.random() * 512, Math.random() * 512, 1.6, 1.6); }
    for (q = 0; q < 70; q++) { var px = Math.random() * 512, py = Math.random() * 512, pr = 12 + Math.random() * 70, pg = ag.createRadialGradient(px, py, 0, px, py, pr); pg.addColorStop(0, 'rgba(225,232,240,' + (0.35 + Math.random() * 0.5) + ')'); pg.addColorStop(0.7, 'rgba(225,232,240,.15)'); pg.addColorStop(1, 'rgba(225,232,240,0)'); ag.fillStyle = pg; ag.fillRect(px - pr, py - pr, 2 * pr, 2 * pr); }
    ag.strokeStyle = 'rgba(15,17,20,.5)'; ag.lineWidth = 2; for (q = 0; q < 6; q++) { var kx = Math.random() * 512, ky = Math.random() * 512; ag.beginPath(); ag.moveTo(kx, ky); for (var k2 = 0; k2 < 7; k2++) ag.lineTo(kx += (Math.random() - 0.5) * 70, ky += (Math.random() - 0.5) * 70); ag.stroke(); }
    var asphT = new THREE.CanvasTexture(asphC); asphT.wrapS = asphT.wrapT = THREE.RepeatWrapping; asphT.repeat.set(6, 12); asphT.colorSpace = THREE.SRGBColorSpace; var asph = new THREE.MeshStandardMaterial({ map: asphT, bumpMap: asphT, bumpScale: 0.25, roughness: 0.95 });
    var P = function (geo, m, x, y, z) { var o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.frustumCulled = false; G.add(o); return o; };
    /* containment: a 30 m concrete drum with a hemispherical dome over the reactor hall, ring beams, a dark plinth, a red beacon on top */
    var CX = -2 * RX - 17, CR = 14.5, CHt = 30; P(new THREE.CylinderGeometry(CR, CR, CHt, 64, 1, true), conc, CX, CHt / 2, 0); P(new THREE.SphereGeometry(CR, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), conc, CX, CHt, 0);
    P(new THREE.CylinderGeometry(CR + 0.6, CR + 0.6, 2.2, 64), concD, CX, 1.1, 0); [10, 20, 29.4].forEach(function (y) { P(new THREE.TorusGeometry(CR + 0.15, 0.35, 8, 72), concD, CX, y, 0).rotation.x = Math.PI / 2; });
    for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; P(new THREE.BoxGeometry(1.2, CHt, 1.2), concD, CX + Math.cos(a) * (CR + 0.3), CHt / 2, Math.sin(a) * (CR + 0.3)).rotation.y = -a; }
    EXT.beacon = P(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff2a1a }), CX, CHt + CR + 0.6, 0); P(new THREE.CylinderGeometry(0.15, 0.15, 1.4, 8), galv, CX, CHt + CR + 0.1, 0);
    /* equipment hatch and a personnel airlock on the drum, a stair tower against it */
    P(new THREE.CylinderGeometry(3.2, 3.2, 1.2, 32), galv, CX + CR - 0.2, 9, 6).rotation.z = Math.PI / 2; P(new THREE.BoxGeometry(3, 5, 4), concD, CX + CR + 1.0, 2.5, -6); P(new THREE.BoxGeometry(4, CHt + 2, 4), concD, CX - 4, (CHt + 2) / 2, CR + 1.5);
    /* vent stack: 90 m, red and white bands, beacon */
    var SX = -2 * RX - 48, SZ = -34; for (k = 0; k < 9; k++) P(new THREE.CylinderGeometry(1.6 - k * 0.05, 1.65 - k * 0.05, 10, 24), k % 2 ? white : red, SX, 5 + k * 10, SZ); P(new THREE.CylinderGeometry(2.6, 2.6, 4, 24), concD, SX, 2, SZ); EXT.beacon2 = P(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2a1a }), SX, 91, SZ);
    /* turbine hall: a long clad shed beyond the control room, with roof vents and a transformer yard */
    var ribT2 = ribT.clone(); ribT2.needsUpdate = true; ribT2.repeat.set(18, 5.5); var th = P(new THREE.BoxGeometry(70, 22, 36), new THREE.MeshStandardMaterial({ map: ribT2, roughness: 0.6, metalness: 0.3 }), -2 * RX + 2, 11, ZF - RZC + 20 + 18); P(new THREE.BoxGeometry(70.4, 1.2, 36.4), dark, -2 * RX + 2, 22.4, ZF - RZC + 38); for (k = 0; k < 6; k++) P(new THREE.BoxGeometry(3, 1.5, 3), galv, -2 * RX - 28 + k * 12, 23.6, ZF - RZC + 38);
    for (k = 0; k < 3; k++) { P(new THREE.BoxGeometry(6, 5, 4), mat(0x6d7a86, 0.5, 0.5), 12 + k * 10, 2.5, ZF - RZC + 44); P(new THREE.BoxGeometry(5, 1.2, 3.5), galv, 12 + k * 10, 5.6, ZF - RZC + 44); for (var j = 0; j < 3; j++) P(new THREE.CylinderGeometry(0.25, 0.25, 2.5, 8), white, 10 + k * 10 + j * 2, 7.2, ZF - RZC + 44); }
    /* cooling towers: two hyperboloids to the north with vapour plumes */
    var prof = []; for (k = 0; k <= 16; k++) { var t = k / 16, y = t * 80, r = 30 - 34 * t + 26 * t * t; prof.push(new THREE.Vector2(r, y)); } var twrG = new THREE.LatheGeometry(prof, 48); twrG.computeVertexNormals(); var twrM = new THREE.MeshStandardMaterial({ color: 0xb9bcb8, roughness: 0.9, side: THREE.DoubleSide });
    EXT.plumes = []; [[-150, -170], [-150, -240]].forEach(function (q) { P(twrG, twrM, q[0], 0, q[1]); for (var i = 0; i < 24; i++) { var a2 = i / 24 * Math.PI * 2; P(new THREE.BoxGeometry(1.2, 10, 1.2), concD, q[0] + Math.cos(a2) * 30, 5, q[1] + Math.sin(a2) * 30); }
      var PN = 500, pp = new Float32Array(PN * 3), pl = new Float32Array(PN); for (i = 0; i < PN; i++) { pl[i] = Math.random(); var rr = Math.random() * 18, aa = Math.random() * 6.3; pp[i * 3] = q[0] + Math.cos(aa) * rr + pl[i] * 40; pp[i * 3 + 1] = 80 + pl[i] * 70; pp[i * 3 + 2] = q[1] + Math.sin(aa) * rr; }
      var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); var pm = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xdfe6ee, size: 14, transparent: true, opacity: 0.16, depthWrite: false, map: EXT.puffT })); pm.frustumCulled = false; G.add(pm); EXT.plumes.push({ m: pm, l: pl, x: q[0], z: q[1] }); });
    /* yard: tarmac apron and road, snow banks, floodlight masts, perimeter fence and gate, window light spill */
    P(new THREE.PlaneGeometry(26, 60), asph, 13, -0.37, 9).rotation.x = -Math.PI / 2; P(new THREE.PlaneGeometry(9, 160), asph, 26 + 60, -0.37, 9).rotation.x = -Math.PI / 2; P(new THREE.PlaneGeometry(9, 160), asph, 26, -0.37, 9).rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    for (k = 0; k < 24; k++) { P(new THREE.PlaneGeometry(2.4, 0.18), white, 26, -0.36, 9 - 78 + k * 7).rotation.set(-Math.PI / 2, 0, Math.PI / 2); }
    var bank = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), snowM, 90), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sv = new THREE.Vector3(), V = new THREE.Vector3(); for (k = 0; k < 90; k++) { var along = k < 45 ? [1.2 + Math.random() * 1.2, -2 + (k / 45) * 90 - 32] : [26 + (k - 45) / 45 * 60, 9 + (Math.random() < 0.5 ? -5.2 : 5.2)]; var sx = 1.2 + Math.random() * 1.6; M.compose(V.set(along[0], -0.5, along[1]), Q, Sv.set(sx, 0.45 + Math.random() * 0.4, sx * (0.8 + Math.random() * 0.5))); bank.setMatrixAt(k, M); } bank.frustumCulled = false; G.add(bank);
    EXT.flood = []; [[8, -24], [8, 42], [34, -10], [34, 28], [52, 9], [-20, 22]].forEach(function (q, i) { P(new THREE.CylinderGeometry(0.14, 0.22, 16, 8), galv, q[0], 7.6, q[1]); P(new THREE.BoxGeometry(1.6, 0.3, 0.3), galv, q[0], 15.8, q[1]); [-0.5, 0.5].forEach(function (d) { P(new THREE.BoxGeometry(0.5, 0.35, 0.5), dark, q[0] + d, 15.5, q[1]); });
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: EXT.puffT, color: 0xffb860, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(7, 7, 1); sp.position.set(q[0], 15.3, q[1]); G.add(sp); var pool = P(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: EXT.puffT, color: 0xffb060, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }), q[0], -0.35, q[1]); pool.rotation.x = -Math.PI / 2; var L = i < 4 ? new THREE.PointLight(0xffb060, 40, 60, 1.4) : null; if (L) { L.position.set(q[0], 14, q[1]); G.add(L); } EXT.flood.push({ sp: sp, pool: pool, L: L }); });
    var fenceC = CV(64, 64), fg = fenceC.getContext('2d'); fg.strokeStyle = 'rgba(200,205,210,.9)'; fg.lineWidth = 1.5; for (k = -64; k < 128; k += 8) { fg.beginPath(); fg.moveTo(k, 0); fg.lineTo(k + 64, 64); fg.stroke(); fg.beginPath(); fg.moveTo(k + 64, 0); fg.lineTo(k, 64); fg.stroke(); } var fenceT = new THREE.CanvasTexture(fenceC); fenceT.wrapS = fenceT.wrapT = THREE.RepeatWrapping; var fenceM = new THREE.MeshStandardMaterial({ map: fenceT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.6 });
    var fence = function (x0, z0, x1, z1) { var L = Math.hypot(x1 - x0, z1 - z0), t = fenceT.clone(); t.needsUpdate = true; t.repeat.set(L / 0.6, 4); var m = P(new THREE.PlaneGeometry(L, 2.4), fenceM.clone(), (x0 + x1) / 2, 0.8, (z0 + z1) / 2); m.material.map = t; m.rotation.y = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; for (var i = 0; i <= L / 3; i++) P(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), galv, x0 + (x1 - x0) * i / (L / 3), 0.9, z0 + (z1 - z0) * i / (L / 3)); P(new THREE.BoxGeometry(L, 0.03, 0.03), galv, (x0 + x1) / 2, 2.0, (z0 + z1) / 2).rotation.y = m.rotation.y - Math.PI / 2; };
    fence(60, -40, 60, 3); fence(60, 15, 60, 60); fence(-70, -40, 60, -40); fence(-70, 60, 60, 60); P(new THREE.BoxGeometry(0.3, 2.4, 12), galv, 60, 0.8, 9).material = fenceM; P(new THREE.BoxGeometry(2.2, 2.6, 2.2), mat(0x5d6670, 0.6), 57, 0.9, 16);
    var DN = 1800, dpos = new Float32Array(DN * 3); for (q = 0; q < DN; q++) { dpos[q * 3] = Math.random() * 110 - 10; dpos[q * 3 + 1] = Math.random() * 1.6 - 0.3; dpos[q * 3 + 2] = (Math.random() - 0.5) * 140; }
    var dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3)); EXT.drift = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false })); EXT.drift.frustumCulled = false; G.add(EXT.drift);
    var spill = P(new THREE.PlaneGeometry(RDP - 2, 9), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }), 4.6, -0.36, 0); spill.rotation.x = -Math.PI / 2; EXT.spill = spill;
    /* snow on the roof and dome, drifted snow against the building */
    P(new THREE.PlaneGeometry(L, RDP + 0.4), snowM, (W0 + RX) / 2 - RX, BH + 0.05, 0).rotation.x = -Math.PI / 2; P(new THREE.SphereGeometry(CR + 0.1, 48, 16, 0, Math.PI * 2, 0, 0.9), snowM, CX, CHt, 0);
  })();
  EXT.on = true; }
EXT.tick = function (dt) { if (!EXT.on) return; EXT.t += dt; if (EXT.wind) EXT.wind.value = EXT.t;
  /* day and night from the station clock: sun arc east to west, light colour, sky, stars, moon, aurora */
  var hr = ((D.clock || 0) / 3600) % 24, ang = (hr - 6) / 12 * Math.PI, el = Math.sin(ang), day = clamp(el * 3 + 0.15, 0, 1), dusk = clamp(1 - Math.abs(el) * 5, 0, 1) * (el > -0.25 ? 1 : 0);
  var sd = new THREE.Vector3(Math.cos(ang) * 0.9, Math.max(el, -0.3), -0.35).normalize();
  if (EXT.sky) { var U = EXT.sky.material.uniforms; U.day.value = day; U.dusk.value = dusk; U.sd.value.copy(sd); }
  if (EXT.sun) { if (el > -0.08) { EXT.sun.position.copy(sd).multiplyScalar(400); EXT.sun.color.setRGB(1, 0.8 + 0.2 * day, 0.6 + 0.35 * day); EXT.sun.intensity = 0.4 + 2.4 * day; } else { EXT.sun.position.set(380, 230, -260); EXT.sun.color.setHex(0x9fb4e0); EXT.sun.intensity = 1.1; } }
  if (EXT.hemi) { EXT.hemi.intensity = 0.55 + 1.0 * day; EXT.hemi.color.setRGB(0.16 + 0.5 * day, 0.27 + 0.5 * day, 0.44 + 0.5 * day); }
  if (EXT.ter) EXT.ter.material.color.setRGB(0.42 + 0.33 * day, 0.47 + 0.31 * day, 0.58 + 0.24 * day); if (EXT.far) EXT.far.material.color.setRGB(0.3 + 0.35 * day, 0.36 + 0.36 * day, 0.5 + 0.35 * day);
  if (EXT.stars) EXT.stars.visible = day < 0.6; if (EXT.moon) EXT.moon.visible = day < 0.5; EXT.aur.forEach(function (m) { m.visible = day < 0.35; });
  if (EXT.snow) EXT.snow.material.color.setRGB(1, 1, 1);
  var night = 1 - day; if (EXT.beacon) EXT.beacon.visible = Math.sin(EXT.t * 2.5) > 0; if (EXT.beacon2) EXT.beacon2.visible = Math.sin(EXT.t * 2.5 + 1.5) > 0;
  if (EXT.flood) EXT.flood.forEach(function (f) { f.sp.material.opacity = 0.9 * night; f.pool.material.opacity = 0.35 * night; if (f.L) f.L.intensity = 40 * night; }); if (EXT.spill) EXT.spill.material.opacity = 0.22 * night;
  if (EXT.drift && CAM.x > RX - 2) { var ga = EXT.drift.geometry.attributes.position.array, gust = (0.6 + 0.4 * Math.sin(EXT.t * 0.23)) * (3 + 2 * Math.sin(EXT.t * 0.4)); for (var di = 0; di < ga.length; di += 3) { ga[di] += gust * dt * (0.7 + 0.6 * Math.sin(di)); ga[di + 1] += Math.sin(EXT.t * 3 + di) * 0.4 * dt; ga[di + 2] += Math.cos(EXT.t * 0.7 + di * 0.3) * 0.8 * dt; if (ga[di] > 100) ga[di] -= 110; if (ga[di + 1] < -0.4) ga[di + 1] = 1.2; if (ga[di + 1] > 1.6) ga[di + 1] = -0.3; } EXT.drift.geometry.attributes.position.needsUpdate = true; EXT.drift.material.opacity = 0.25 + 0.3 * Math.max(0, Math.sin(EXT.t * 0.23)); }
  if (EXT.plumes) EXT.plumes.forEach(function (p) { var a = p.m.geometry.attributes.position.array; for (var i = 0; i < p.l.length; i++) { p.l[i] += dt * 0.012; if (p.l[i] > 1) p.l[i] -= 1; var l = p.l[i], j = i * 3; a[j + 1] = 80 + l * 70; a[j] = p.x + Math.cos(i) * (6 + l * 14) + l * 45 + Math.sin(EXT.t * 0.2 + i) * 2; a[j + 2] = p.z + Math.sin(i * 1.7) * (6 + l * 14); } p.m.geometry.attributes.position.needsUpdate = true; p.m.material.opacity = 0.16 * (0.6 + 0.4 * day); });
  /* fog by zone: outside takes the sky's horizon colour, the hall a cool haze, the control room almost none */
  if (R3 && R3.scene.fog) { var fg = R3.scene.fog, outside = CAM.x > RX, inHall = CAM.x < -RX; if (outside) { fg.color.setRGB(0.12 + 0.58 * day, 0.26 + 0.56 * day, 0.30 + 0.65 * day).lerp(new THREE.Color(1.0, 0.55, 0.3), dusk * 0.5); fg.density += (0.0011 - fg.density) * Math.min(1, dt * 2); } else if (inHall) { fg.color.setHex(0x121a22); fg.density += (0.012 - fg.density) * Math.min(1, dt * 2); } else { fg.color.setHex(0x1d2126); fg.density += (0.0004 - fg.density) * Math.min(1, dt * 2); } } EXT.aur.forEach(function (m) { m.material.uniforms.t.value += dt; }); if (EXT.cloud) EXT.cloud.material.uniforms.t.value += dt;
  if (EXT.snow) { var P = EXT.snow.geometry.attributes.position, a = P.array, w = (0.6 + 0.4 * Math.sin(EXT.t * 0.23)) * 1.2 + Math.sin(EXT.t * 0.4) * 0.4; for (var i = 0; i < EXT.sv.length; i++) { var j = i * 3; a[j + 1] -= EXT.sv[i] * dt; a[j] += (w + Math.sin(EXT.t * 1.7 + i) * 0.3) * dt; a[j + 2] += Math.cos(EXT.t * 1.3 + i * 0.7) * 0.25 * dt; if (a[j + 1] < -0.4) { a[j + 1] = 40; a[j] = Math.random() * 120; a[j + 2] = (Math.random() - 0.5) * 120; } if (a[j] > 120) a[j] -= 120; if (a[j] < 0) a[j] += 120; } P.needsUpdate = true; }
  if (EXT.stars) EXT.stars.material.opacity = 0.75 + 0.2 * Math.sin(EXT.t * 2.3) * Math.sin(EXT.t * 0.7);
  if (EXT.trees) for (var k = 0; k < EXT.trees.length; k++) { var tr = EXT.trees[k]; tr.rotation.z = 0.03 * Math.sin(EXT.t * 0.9 + k) + 0.02 * Math.sin(EXT.t * 2.3 + k * 1.3); } };
/* ================================================================ what the letters mean, and where things are ================================================================ */
var ABBR = { RTB: 'reactor trip breaker', SA: 'source-range channel A', SB: 'source-range channel B', SR: 'source range (start-up neutron counts)', IR: 'intermediate range', PR: 'power range', BLK: 'block (bypass a trip or alarm)', N31: 'source-range channel N31', SUR: 'start-up rate, decades per minute', RCP: 'reactor coolant pump', RCS: 'reactor coolant system', PZR: 'pressuriser', PORV: 'power-operated relief valve', SG: 'steam generator', MSIV: 'main steam isolation valve', MFP: 'main feed pump', AFW: 'auxiliary feedwater', CVCS: 'chemical & volume control system', VCT: 'volume control tank', RHR: 'residual heat removal', SI: 'safety injection', ECCS: 'emergency core cooling', CCW: 'component cooling water', SW: 'service water', CW: 'circulating water', HVAC: 'heating, ventilation & air conditioning', EDG: 'emergency diesel generator', EHC: 'electro-hydraulic turbine control', MW: 'megawatts (electrical)', MWt: 'megawatts thermal', Tavg: 'average coolant temperature', Tref: 'reference temperature from turbine load', dT: 'temperature rise across the core', DNB: 'departure from nucleate boiling', GOP: 'general operating procedure', EOP: 'emergency operating procedure', AOP: 'abnormal operating procedure', LOCA: 'loss-of-coolant accident', SGTR: 'steam generator tube rupture', ATWS: 'anticipated transient without scram', H2: 'hydrogen (generator cooling)', CRD: 'control rod drive', ARO: 'all rods out', POAH: 'point of adding heat', LETDOWN: 'water drawn off the RCS for cleaning', DILUTE: 'add water to lower boron', BORATE: 'add boric acid to raise boron' };
function abbrTags(text) { var seen = {}, out = []; String(text).replace(/\b([A-Z][A-Za-z0-9]{1,6})\b/g, function (m, w) { var k = w in ABBR ? w : (w.toUpperCase() in ABBR ? w.toUpperCase() : null); if (k && !seen[k]) { seen[k] = 1; out.push(k + ' = ' + ABBR[k]); } return m; }); return out; }
function whereIs(hi) { var s = hi.sec; if (!s) return ''; var where = s.def.short || s.def.name, g = null, x = hi.px, y = hi.py, u = hi.du, d = hi.dd;
  if (x != null) s.grp.forEach(function (q) { if (x >= q[0] && x <= q[1] && y >= q[2] && y <= q[3]) g = q[4]; }); if (u != null) s.dgrp.forEach(function (q) { if (u >= q[0] && u <= q[1] && d >= q[2] && d <= q[3]) g = q[4]; });
  return where + (hi.du != null ? ' desk' : ' panel') + (g ? ' · ' + g.replace(/\s+/g, ' ') : ''); }
function tagTip(t, hi) { if (!S.cfg || S.cfg.tags === false) return t; var tags = abbrTags(t), w = hi ? whereIs(hi) : ''; var br = (w ? ['at: ' + w] : []).concat(tags); return br.length ? t + '  [' + br.join(' · ') + ']' : t; }
function glossaryMenu() { var keys = Object.keys(ABBR).sort(); menu('<h1>📖 What the letters mean</h1><p class="cmnote">Hover any control and the tooltip ends with [at: where it is · what its letters mean]. Full list:</p><div style="columns:2;font-size:13px;max-height:52vh;overflow:auto;text-align:left">' + keys.map(function (k) { return '<div><b>' + k + '</b> ' + esc(ABBR[k]) + '</div>'; }).join('') + '</div><div class="cpnbtns"><button class="cpnb" data-a="back">Back</button></div>', function (a) { if (a === 'back') pauseMenu(); }); }
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
  var crit = function () { p.boron = clamp(p.boron + (rhoPcm(p) - 0) / BW, 0, 2500); };
  p.pc = 3 * OVL + 190; setOverlap(p); coreEq(p); crit(); x.sg.forEach(function (s) { s.L = s.Lm = 50; s.frvDem = s.frv = s.steam / 28 || 0.6; });
  for (var k = 0; k < 2400; k++) { plantStep(p, 0.25, true); if (k % 8 === 0 && k < 2000) { var r = rhoPcm(p); if (Math.abs(r) > 2) p.boron = clamp(p.boron + r / BW * 0.3, 0, 2500); } }
  var cl = x.cal || (x.cal = cal0()); cl.fv = 1.003 + Math.random() * 0.006; cl.d = [0, 1, 2, 3].map(function () { return gauss() * 0.009; }); cl.lastT = -20 * 3600; x.core.p15T = -40 * 3600; x.core.best = x.core.qcal; x.core.avg8 = [];
  p.tripped = false; p.rtb = [true, true]; p.t = 0; p.hist = []; p.sur = 0; p.lnPrev = Math.log(p.n); p.oneM = []; p.everCrit = true; return p;
}
function atPowerStart() { freshState(true); S.p = atPowerPlant(575); MS.free = true; MS.complete = true; MS.ascDone = true; MS.asc = ASC.map(function () { return true; }); MS.pre = PRE.map(function () { return true; }); MS.done = STEPS.map(function () { return true; });
  for (var i = 0; i < 8; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.log = []; S.addLog('Shift start: Unit 1 at 50% power, ' + Math.round(S.p.x.tb.mw) + ' MW, rods in AUTO'); goView('start', true); save(); }
function startAsc() { if (S.p.tripped || D.pr < 0.3) { warnOnce('asc0', 'Power ascension starts from the point of adding heat: take the reactor critical first.'); return; } MS.ascOn = true; MS.ascDone = false; MS.asc = []; MS.ascT = 0; MS.view = 'step'; MS.free = true; S.addLog('Power ascension started (GOP-302)'); speak('Begin the power ascension.'); toast('Power ascension checklist (GOP-302) started.', 'ok'); HUD.el.ms.dataset.cur = ''; HUD.dirty = true; }
function finishAsc() {
  if (MS.ascDone) return; MS.ascDone = true; var p = S.p, x = p.x, sv = rd(), first = !sv.doneAsc, xp = first ? 80 : 15; try { API.xp(xp, 'Critical Point: power ascension'); } catch (e) {} CAR.event('asc'); sv = rd(); sv.doneAsc = (sv.doneAsc || 0) + 1; wr(sv);
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
  try { API.xp(xp, 'Critical Point: reactor shutdown'); } catch (e) {} CAR.event('shut'); sv = rd(); sv.doneShut = (sv.doneShut || 0) + 1; wr(sv);
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
  [/steam header pressure|Steam generator \d pressure|STEAM PRESS/i, 'Steam pressure', 'Pressure in the steam lines from the steam generators. Water boils at a temperature set by its pressure, so holding 74.8 bar holds the steam generators at about 291 °C.'],
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
    h1.connect(hm); h2.connect(hm); hm.connect(hf); hf.connect(AUD.hornG); AUD.hornG.connect(AUD.master); h1.start(); h2.start(); AUD.h1 = h1; AUD.h2 = h2;
    var nl = Math.floor(c.sampleRate * 0.25); AUD.nbuf = c.createBuffer(1, nl, c.sampleRate); var nd = AUD.nbuf.getChannelData(0); for (i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
  },
  vol: function () { if (AUD.master) AUD.master.gain.setTargetAtTime(S.cfg.snd ? 0.8 : 0, AUD.ctx.currentTime, 0.05); },
  noise: function (t, dur, f, q, vol, type) { var c = AUD.ctx; if (!c) return; var s = c.createBufferSource(); s.buffer = AUD.nbuf; var bp = c.createBiquadFilter(); bp.type = type || 'bandpass'; bp.frequency.value = f; bp.Q.value = q || 1; var g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); s.connect(bp); bp.connect(g); g.connect(AUD.master); s.start(t); s.stop(t + dur + 0.02); },
  tone: function (t, f, dur, type, vol, f2) { var c = AUD.ctx; if (!c) return; var o = c.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); var g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + dur + 0.02); },
  sfx: function (k) {
    var c = AUD.ctx; if (!c || !S.cfg.snd) return; var t = c.currentTime + 0.005;
    if (k === 'btn') { AUD.noise(t, 0.025, 3200, 2, 0.25); AUD.tone(t, 1900, 0.03, 'square', 0.03); AUD.tone(t, 160, 0.05, 'sine', 0.08, 90); }
    else if (k === 'switch') { AUD.noise(t, 0.04, 1800, 1.5, 0.45); AUD.noise(t + 0.03, 0.03, 2600, 2, 0.25); AUD.tone(t + 0.01, 110, 0.07, 'sine', 0.12, 60); AUD.noise(t + 0.01, 0.06, 300, 1, 0.25, 'lowpass'); }
    else if (k === 'detent') { AUD.noise(t, 0.03, 2200, 3, 0.35); AUD.tone(t, 220, 0.04, 'sine', 0.06, 150); }
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
    var on = ANNC.horn && !S.paused, trp = ANN.some(function (q) { return q.k === 'trip' && q.st === 'alert'; }), ph = Math.floor(now * (trp ? 5 : 2.6)) % 2; if (AUD.h1) { AUD.h1.frequency.setTargetAtTime(trp ? 620 : 415, now, 0.02); AUD.h2.frequency.setTargetAtTime(trp ? 780 : 523, now, 0.02); } AUD.hornG.gain.setTargetAtTime(on ? (ph ? 0.13 : 0.03) : 0, now, 0.02);
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
  hall: [null, [-RX - 9, 1.65, RZC], [-RX - 17, 0.8, RZC], 62, 'Reactor hall'],
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
  board: [null, [-RX + 2.4, 1.65, 9.9], [-RX, 1.65, 9.9], 50, 'Shift turnover whiteboard'],
  core: [null, [0.53, 1.95, ZF - 3.2], [0.53, 2.0, ZF], 50, 'Core monitoring wall']
};
SECDEF.forEach(function (d) { if (d.id !== 'rx') { VIEWDEF[d.id] = [d.id, [0, 1.75, 2.45], [0, 1.55, -0.75], 54, d.short + ' board']; VIEWDEF[d.id + 'D'] = [d.id, [0, 1.9, 1.25], [0, 0.95, -0.3], 58, d.short + ' desk controls']; } });
var VIEWGROUPS = [['Reactor hall', ['hall']], ['Reactor', ['rx', 'nis', 'rods', 'params', 'rodctl', 'ann', 'rtb', 'p10']], ['Primary side boards', ['esf', 'aux', 'cvcs', 'pzr', 'rcs']], ['Secondary side boards', ['sg', 'ms', 'tb', 'gen', 'elec']], ['Desk close-ups', ['esfD', 'auxD', 'cvcsD', 'pzrD', 'rcsD', 'sgD', 'msD', 'tbD', 'genD', 'elecD']], ['Screens', ['console', 'onem', 'trends', 'proc', 'core', 'mimic', 'alarms', 'status', 'log', 'board']], ['Room', ['start', 'room']]];
function viewTarget(id) {
  var v = VIEWDEF[id]; if (!v) return null; var P = new THREE.Vector3(v[1][0], v[1][1], v[1][2]), L = new THREE.Vector3(v[2][0], v[2][1], v[2][2]);
  if (v[0]) { var g = SEC[v[0]].g; g.updateMatrixWorld(); P = g.localToWorld(P); L = g.localToWorld(L); }
  var d = L.clone().sub(P); return { x: P.x, y: P.y, z: P.z, yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)), fov: v[3] };
}
function goView(id, instant) { var t = viewTarget(id); if (!t) return; CAM.view = id; if (instant) { Object.assign(CAM, t); CAM.tw = null; HEADM.y = null; return; }
  var dy = t.yaw - CAM.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; t.yaw = CAM.yaw + dy;
  CAM.tw = { a: { x: CAM.x, y: CAM.y, z: CAM.z, yaw: CAM.yaw, pitch: CAM.pitch, fov: CAM.fov }, b: t, t: 0, dur: 0.85 }; HUD.dirty = true; }
/* collision comes from the furniture you can actually see: each solid mesh between knee and chest height blocks a footprint
   around its own (rotated) box, so there are no invisible walls and nothing you can walk through */
var COLL = null, CLV = null;
function buildColl() { COLL = []; CLV = new THREE.Vector3(); var sc = R3.scene; sc.updateMatrixWorld(true);
  var skip = function (o) { for (var q = o; q; q = q.parent) { if (q.visible === false || q.userData.noColl || q === (HAND && HAND.root) || (FEEL.people && (q === FEEL.people.sup || q === FEEL.people.walk))) return true; } return false; };
  sc.traverse(function (o) { if (!o.isMesh || !o.geometry || skip(o)) return; var m = o.material; if (!m || m.visible === false || (m.transparent && m.opacity < 0.3)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var gb = o.geometry.boundingBox, wb = new THREE.Box3().copy(gb).applyMatrix4(o.matrixWorld);
    var sx = wb.max.x - wb.min.x, sz = wb.max.z - wb.min.z; if (wb.min.y > 1.1 || wb.max.y < 0.3 || sx * sz < 0.04 || sx > 12 || sz > 12) return;
    COLL.push({ inv: new THREE.Matrix4().copy(o.matrixWorld).invert(), b: gb, wb: wb }); }); }
function blocked(x, z) {
  if (!inHallArea(x, z)) return true; if (!R3 || !R3.scene) return false; var nc = R3.scene.children.length; if (!COLL || COLL.n !== nc) { buildColl(); COLL.n = nc; }
  var r = 0.28; for (var i = 0; i < COLL.length; i++) { var c = COLL[i], w = c.wb; if (x < w.min.x - r || x > w.max.x + r || z < w.min.z - r || z > w.max.z + r) continue;
    for (var h = 0.35; h <= 1.1; h += 0.25) { CLV.set(x, h, z).applyMatrix4(c.inv); var b = c.b; if (CLV.y < b.min.y || CLV.y > b.max.y) continue;
      if (CLV.x > b.min.x - r && CLV.x < b.max.x + r && CLV.z > b.min.z - r && CLV.z < b.max.z + r) return true; } }
  return false;
}
var KEYS = {};
function handBusy() { return !!(S.cfg && S.cfg.lockReach && FEEL.hand && FEEL.hand.visible); }
function moveCam(dt) { if (handBusy()) { CAM.vx = CAM.vz = 0; return; }
  var f = 0, s = 0; if (KEYS.w || KEYS.arrowup) f += 1; if (KEYS.s || KEYS.arrowdown) f -= 1; if (KEYS.a || KEYS.arrowleft) s -= 1; if (KEYS.d || KEYS.arrowright) s += 1;
  if (JOY.on) { f += -JOY.y; s += JOY.x; }
  if (CAM.tw) { var tw = CAM.tw; tw.t += dt / tw.dur; var k = tw.t >= 1 ? 1 : tw.t * tw.t * (3 - 2 * tw.t); ['x', 'y', 'z', 'yaw', 'pitch', 'fov'].forEach(function (q) { CAM[q] = lerp(tw.a[q], tw.b[q], k); }); if (tw.t >= 1) CAM.tw = null; if (!(f || s)) return; CAM.tw = null; }
  var m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; } var vmax = KEYS.shift ? 4.4 : 2.5, tx = (-Math.sin(CAM.yaw) * f + Math.cos(CAM.yaw) * s) * vmax, tz = (-Math.cos(CAM.yaw) * f - Math.sin(CAM.yaw) * s) * vmax, ea = 1 - Math.exp(-dt * (m ? 10 : 12));
  CAM.vx = (CAM.vx || 0) + (tx - (CAM.vx || 0)) * ea; CAM.vz = (CAM.vz || 0) + (tz - (CAM.vz || 0)) * ea; if (!m && Math.hypot(CAM.vx, CAM.vz) < 0.02) { CAM.vx = CAM.vz = 0; return; }
  var sp = Math.hypot(CAM.vx, CAM.vz) * dt, nx = CAM.x + CAM.vx * dt, nz = CAM.z + CAM.vz * dt, was = blocked(CAM.x, CAM.z);
  if (!blocked(nx, nz) || was) { CAM.x = nx; CAM.z = nz; } else if (!blocked(nx, CAM.z)) CAM.x = nx; else if (!blocked(CAM.x, nz)) CAM.z = nz;
  CAM.bobT = (CAM.bobT || 0) + sp * 4.4; CAM.y += (1.65 + Math.sin(CAM.bobT) * 0.022 - CAM.y) * (1 - Math.exp(-dt * 9)); CAM.fov += (60 - CAM.fov) * (1 - Math.exp(-dt * 3)); if (CAM.view !== 'walk') { CAM.view = 'walk'; HUD.dirty = true; }
}
/* when the mission card covers the left of a wide screen, shift the picture right so what you're looking at sits in the clear part */
var OFS = { cur: 0, w: 0, h: 0 };
var HEADM = { y: null, p: 0, vy: 0, vp: 0, roll: 0, t: 0 };
function applyCam(dt) { var c = R3.cam; if (c.position.x !== CAM.x || c.position.z !== CAM.z || c.rotation.y !== CAM.yaw || c.rotation.x !== CAM.pitch || OFS.f !== CAM.fov) { PTR.hoverDirty = true; OFS.f = CAM.fov; } /* a human head, not a tripod: the view follows the mouse through a quick spring (a touch of weight, slight overshoot), the eyes sit
     ahead of and above the neck so turning and looking down swing the viewpoint, the head rolls into fast turns, and it breathes */
  var hd = HEADM, ddt = Math.min(0.05, dt || 0.016); if (hd.y == null || CAM.tw) { hd.y = CAM.yaw; hd.p = CAM.pitch; hd.vy = hd.vp = 0; }
  var dyw = CAM.yaw - hd.y; while (dyw > Math.PI) { dyw -= 2 * Math.PI; hd.y += 2 * Math.PI; } while (dyw < -Math.PI) { dyw += 2 * Math.PI; hd.y -= 2 * Math.PI; }
  var K = 260, Dm = 27; hd.vy += (dyw * K - hd.vy * Dm) * ddt; hd.vp += ((CAM.pitch - hd.p) * K - hd.vp * Dm) * ddt; hd.y += hd.vy * ddt; hd.p += hd.vp * ddt;
  hd.roll += (clamp(-hd.vy * 0.018, -0.05, 0.05) - hd.roll) * (1 - Math.exp(-ddt * 8)); hd.t += ddt;
  var walkV = Math.hypot(CAM.vx || 0, CAM.vz || 0), br = CAM.view === 'walk' || CAM.view === 'room' ? 1 : 0.35;
  var yy = hd.y + Math.sin(hd.t * 0.37) * 0.0025 * br, pp = hd.p + Math.sin(hd.t * 1.6) * 0.0018 * br + Math.sin((CAM.bobT || 0) * 2) * 0.004 * Math.min(1, walkV);
  /* neck pivot: eyes 9 cm forward and 11 cm above it */
  var cp = Math.cos(pp), nx = -Math.sin(yy) * cp * 0.09, nz = -Math.cos(yy) * cp * 0.09, ny = Math.sin(pp) * 0.09 + (Math.cos(pp) - 1) * 0.11;
  c.position.set(CAM.x + nx + Math.sin(yy) * 0.09, CAM.y + ny, CAM.z + nz + Math.cos(yy) * 0.09); c.rotation.order = 'YXZ'; c.rotation.y = yy; c.rotation.x = pp;
  var rz = hd.roll + Math.sin((CAM.bobT || 0)) * 0.006 * Math.min(1, walkV);
  if (HAND.lean > 0 && HAND.leanDir && !S.cfg.lockReach) { var ln = HAND.lean * (HAND.rush ? 1.25 : 1); c.position.addScaledVector(HAND.leanDir, (HAND.reachX || 0.13) * ln); c.position.y -= 0.05 * ln; c.rotation.x -= 0.07 * ln; rz += (HAND.rush ? 0.02 : 0.01) * Math.sin(HAND.t * 9) * ln; var cr = (HAND.crouch || 0) * ln; if (cr > 0) { var kb = cr * cr * (3 - 2 * cr); c.position.y -= 0.46 * kb; c.position.addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(c.quaternion).setY(0).normalize(), 0.06 * kb); c.rotation.x -= 0.42 * kb; rz += 0.03 * Math.sin(HAND.t * 5.5) * kb + 0.02 * kb; c.position.y += 0.012 * Math.sin(HAND.t * 11) * kb; } }
  c.rotation.z = rz; if (Math.abs(hd.vy) + Math.abs(hd.vp) > 0.002) PTR.hoverDirty = true;
  var W = root.clientWidth, H = Math.max(1, root.clientHeight), ms = HUD.el.ms, want = 0; if (W > 900 && ms && !ms.hidden && !ms.classList.contains('min') && CAM.view !== 'walk' && CAM.view !== 'start' && CAM.view !== 'room' && !locked()) want = Math.round((ms.offsetWidth + 16) / 2);
  OFS.want = want; OFS.cur += (want - OFS.cur) * (1 - Math.exp(-(dt || 0.016) * 6)); if (Math.abs(OFS.cur - want) < 0.5) OFS.cur = want; var d = Math.round(OFS.cur);
  var asp = W / H, fe = asp < 1 ? Math.min(88, 2 * Math.atan(Math.tan(CAM.fov * 0.92 * Math.PI / 360) / asp) * 180 / Math.PI) : CAM.fov; if (CAM.kick) { CAM.kick = Math.max(0, CAM.kick - (dt || 0.016) * 7); fe -= CAM.kick * 1.4; }
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
  if (TRI.on()) { var tp = TRI.pickCam(cx, cy, r); v = tp.v; RC.setFromCamera(v, tp.cam); } else RC.setFromCamera(v, R3.cam); RC.far = 14; var hs = RC.intersectObjects(HITS, false); return hs.length ? hs[0] : null;
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
  if (handBusy()) return; if (locked()) { var k0 = 0.0021 * CAM.fov / 60; CAM.yaw -= (e.movementX || 0) * k0; CAM.pitch = clamp(CAM.pitch - (e.movementY || 0) * k0, -1.35, 1.35); CAM.tw = null; return; }
  if (PTR.pinch) { var ids = Object.keys(PTR.pts); if (ids.length === 2) { var a = PTR.pts[ids[0]], b = PTR.pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y); CAM.fov = clamp(PTR.pinch.fov * PTR.pinch.d / Math.max(20, d), 16, 75); CAM.tw = null; } return; }
  var D0 = PTR.down;
  if (D0 && D0.id === e.pointerId) { var dx = e.clientX - D0.lx, dy = e.clientY - D0.ly; if (Math.hypot(e.clientX - D0.x, e.clientY - D0.y) > 6) D0.moved = true;
    if (D0.moved && D0.lp) { clearTimeout(D0.lp); D0.lp = 0; }
    if (D0.moved && !D0.hold && !handBusy()) { var k = 0.0042 * CAM.fov / 60; var sg = e.pointerType === 'mouse' ? -1 : 1; CAM.yaw += (e.pointerType === 'mouse' ? sg : -sg) * dx * k; /* touch: left/right inverted */ CAM.pitch = clamp(CAM.pitch + sg * dy * k, -1.35, 1.35); CAM.tw = null; }
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
  if (hi.act) { if (S.cfg.handAnim !== false) { try { FEEL.reach(h); } catch (e) { console.warn("hand", e); } } hi.act(h); CAM.kick = 1; try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} HUD.dirty = true; return; }
  if (hi.view) { goView(hi.view); return; }
  if (hi.tip) { showTip(tagTip(typeof hi.tip === 'function' ? hi.tip() : hi.tip, hi), touch ? null : PTR.hx, touch ? null : PTR.hy, true); }
}
function onWheel(e) { e.preventDefault(); CAM.fov = clamp(CAM.fov * (1 + e.deltaY * 0.0012), 16, 75); CAM.tw = null; }
function hover() {
  if (PERF.lite) { var tn = performance.now(); if (tn - (PERF.hv || 0) < 120) return; PERF.hv = tn; }
  if (S.menu) { hideTip(); return; }
  if (locked()) { var lr = R3.ren.domElement.getBoundingClientRect(); PTR.hx = lr.left + lr.width / 2; PTR.hy = lr.top + lr.height / 2; }
  if (!PTR.hoverDirty || PTR.down) return; PTR.hoverDirty = false; var h = pick(PTR.hx, PTR.hy), hi = hitInfo(h); PTR.hover = hi || null; PTR.hoverObj = hi ? h.object : null; if (EXP.shown && EXP.obj === PTR.hoverObj) return;
  R3.ren.domElement.style.cursor = hi && (hi.act || hi.hold || hi.view) ? 'pointer' : PTR.down ? 'grabbing' : 'grab';
  if (hi && hi.tip) showTip(tagTip(typeof hi.tip === 'function' ? hi.tip() : hi.tip, hi) + (hi.hold ? '  ·  hold' : hi.act ? '  ·  click' : hi.view ? '  ·  click to zoom in' : ''), PTR.hx, PTR.hy); else hideTip();
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
  else if (k === 'h') { if (WATCH.on) WATCH.stop(); else WATCH.start(); } else if (k === 't') setTS(S.ts === 1 ? 5 : S.ts === 5 ? 20 : 1); else if (k === 'p' || k === ' ') { e.preventDefault(); setPause(!S.paused); }
  else if (k === 'e') { var r = R3.ren.domElement.getBoundingClientRect(); activate(pick(r.left + r.width / 2, r.top + r.height / 2)); }
  else if (k === 'x') { S.cfg.explain = !S.cfg.explain; saveCfg(); toast(S.cfg.explain ? '💡 Explain mode on.' : 'Explain mode off.'); if (!S.cfg.explain) hideExplain(); }
  else if (k === 'h') helpMenu(); else if (k === 'v') viewsMenu(); else if (k === 'g') { S.cfg.assist = !S.cfg.assist; HUD.dirty = true; saveCfg(); } else if (k === 'c') { S.cfg.quick = !S.cfg.quick; HUD.dirty = true; saveCfg(); }
}
var kd = function (e) { onKey(e, true); }, ku = function (e) { onKey(e, false); };

/* ================================================================ the session ================================================================ */
function newPlant() { var p = freshPlant(); p.audio = true; return p; }
function autoGfx() { var n = navigator, coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches), small = Math.min(screen.width, screen.height) < 820, cores = n.hardwareConcurrency || 4, mem = n.deviceMemory || 4;
  if ((coarse && small) || cores <= 2 || mem <= 2) return 'lite'; if (coarse || cores <= 4 || mem <= 4) return 'low'; return 'high'; }
/* Lite graphics: for low-end laptops and phones. Half-size board textures, no shadows, reflections or bloom, simple (Lambert) lighting,
   one light plus sky, 30 fps cap, slower widget refresh, and the resolution drops by itself if frames get slow. */
var PERF = { lite: false, cap: 0, pr: 1, prMax: 1, acc: 0, n: 0, t: 0, fps: 0, lastR: 0 };
function liteScene(scene) { var map = new Map();
  scene.traverse(function (o) { if (o.isLight && (o.isPointLight || o.isSpotLight)) o.visible = false; if (o.isHemisphereLight) o.intensity = 1.25; if (o.isDirectionalLight) o.intensity = 1.0;
    if (!o.isMesh || !o.material || !o.material.isMeshStandardMaterial || o.material.onBeforeCompile && o.material.onBeforeCompile.toString().length > 30) return; var m = o.material, n = map.get(m);
    if (!n) { n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity, side: m.side, depthWrite: m.depthWrite }); map.set(m, n); } o.material = n; });
  LAMPS.forEach(function (L) { var n = map.get(L.m); if (n) L.m = n; }); Object.keys(MAT).forEach(function (k) { var n = map.get(MAT[k]); if (n) MAT[k] = n; }); }
function perfTick(dt) { PERF.acc += dt; PERF.n++; PERF.t += dt; if (PERF.t < 1.5) return; var avg = PERF.acc / PERF.n; PERF.fps = Math.round(PERF.n / PERF.t); PERF.acc = 0; PERF.n = 0; PERF.t = 0;
  if (S.cfg.gfx !== 'high') { var np = PERF.pr; if (avg > 0.045 && np > 0.5) np = Math.max(0.5, np * 0.85); else if (avg < 0.024 && np < PERF.prMax) np = Math.min(PERF.prMax, np * 1.1); if (Math.abs(np - PERF.pr) > 0.01) { PERF.pr = np; R3.ren.setPixelRatio(np); sizeK = ''; } }
  if (HUD.el.fps) { HUD.el.fps.hidden = !S.cfg.fps; HUD.el.fps.textContent = PERF.fps + ' fps · ' + (S.cfg.gfx === 'lite' ? 'Lite' : S.cfg.gfx === 'low' ? 'Low' : 'High') + ' · ' + Math.round(PERF.pr * 100) + '% res'; } }
function makeSession(sv) {
  var cfg = Object.assign({ gfx: autoGfx(), fps: false, snd: true, voice: true, assist: true, explain: true, guide: true, lockReach: true, handAnim: true, tags: true, crew: true, mblur: true, shift: 30, quick: !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) }, sv.cfg || {});
  S = { p: null, cfg: cfg, ts: 1, paused: true, log: [], lampTest: false, clock0: 7 * 3600 + 12 * 60, leverDir: 0, audDiv: 1, menu: null, shiftUsed: 0, shiftWarn: false, shiftOver: false, st: { trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }, lastTrip: sv.lastTrip || (Date.now() - 37 * 86400000) };
  S.toast = toast; S.sfx = function (k) { AUD.sfx(k); }; CAR.load();
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
  if (MS.phase() === 'shut') MS.shutTrips++; if (p.dropping || p.x && p.x.tb.gen || D.pr > 0.3) CAR.event('trip');
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
  '.cpnfps{font:700 11px ui-monospace,monospace;color:#7dffa0;padding:0 6px;align-self:center;white-space:nowrap}.cpn.lite .cpnms,.cpn.lite .cpnas,.cpn.lite .cpnqc,.cpn.lite .cpng,.cpn.lite .cpnxpp{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' +
  '.cpnxpc{align-items:center;gap:8px!important;padding:4px 10px 4px 4px!important;cursor:pointer;color:inherit;font:inherit}.cpnxpc>b{display:grid;place-items:center;min-width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#ffd34a,#ff9f43);color:#1b1200;font-weight:900;font-size:14px}.cpnxpc span{display:flex;flex-direction:column;gap:4px;text-align:left}.cpnxpc i{font-style:normal;font-size:11.5px;font-weight:700;white-space:nowrap;color:#e8f1f8}.cpnxpc em{display:block;width:120px;height:5px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}.cpnxpc u{display:block;height:100%;background:linear-gradient(90deg,#ffd34a,#59e07a)}' +
  '.cpnxpf{position:absolute;top:calc(max(8px,env(safe-area-inset-top)) + 52px);right:max(8px,env(safe-area-inset-right));display:flex;flex-direction:column;align-items:flex-end;gap:5px;pointer-events:none;z-index:6}.cpnxpp{background:rgba(10,16,24,.9);border:1px solid rgba(255,211,74,.5);border-radius:10px;padding:5px 11px;text-align:right;transition:opacity .45s,transform .45s;animation:cpnin .25s ease}.cpnxpp b{display:block;color:#ffd34a;font-size:14px}.cpnxpp span{display:block;font-size:11.5px;color:#c9d6e2}.cpnxpp.lvl{border-color:#59e07a;padding:9px 16px}.cpnxpp.lvl b{font-size:20px;color:#59e07a}.cpnxpp.ach{border-color:#b98cff}.cpnxpp.ach b{color:#e3d1ff}' +
  '.cpncar{display:flex;gap:14px;align-items:center;background:rgba(255,211,74,.08);border:1px solid rgba(255,211,74,.3);border-radius:14px;padding:12px 14px}.cpncar .lv{display:grid;place-items:center;min-width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#ffd34a,#ff9f43);color:#1b1200}.cpncar .lv b{font-size:28px;line-height:1}.cpncar .lv span{font-size:9px;font-weight:800;letter-spacing:.12em}.cpncar .rk{flex:1;min-width:0}.cpncar small{color:#9fb3c6}.xpbar{height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0}.xpbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd34a,#59e07a)}' +
  '.cpndaily,.cpnach,.cpnstat{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.cpndaily>div,.cpnach>div,.cpnstat>div{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:9px 11px;font-size:13px}.cpndaily>div.ok{border-color:rgba(89,224,122,.5)}.cpndaily small,.cpnach small,.cpnstat small{display:block;color:#8ea6bc;font-size:11.5px}.cpnach>div{opacity:.55}.cpnach>div.ok{opacity:1;border-color:rgba(185,140,255,.5)}.cpnach span{font-size:20px;margin-right:6px}.cpnstat>div span{font-size:18px}.cpnstat>div b{display:block;font-size:16px}' +
  '.cpnms .now{display:flex;gap:8px;align-items:flex-start;background:rgba(89,224,255,.1);border:1px solid rgba(89,224,255,.45);border-radius:10px;padding:8px 10px;margin:4px 0 6px;font-size:14px;line-height:1.35}.cpnms .now>span{flex:none;font:800 10.5px/1.9 system-ui,sans-serif;letter-spacing:.1em;background:#59e0ff;color:#04202a;border-radius:6px;padding:0 6px}.cpnms .now kbd{font:700 11px ui-monospace,monospace;background:rgba(255,255,255,.14);border-radius:4px;padding:1px 5px;margin-left:2px}.cpnms .pb{height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin:0 0 6px}.cpnms .pb i{display:block;height:100%;width:0;background:linear-gradient(90deg,#59e0ff,#59e07a);transition:width .4s}.cpnms details.why summary{cursor:pointer;color:#8ea6bc;font-size:12px;margin:2px 0}.cpnms details.why .h{margin-top:4px}' +
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
  '.cpnfact{position:absolute;left:50%;top:50px;transform:translate(-50%,-20px);max-width:min(720px,92vw);padding:8px 16px;border-radius:10px;background:rgba(10,20,34,.9);border:1px solid rgba(127,209,255,.4);color:#dbe9f7;font:14px/1.4 system-ui,sans-serif;opacity:0;transition:all .5s;z-index:29;pointer-events:none}.cpnfact.show{opacity:1;transform:translate(-50%,0)}.cpnfact.watch{top:84px;border-color:rgba(255,211,74,.5)}' +
  '.cpncrisis{position:absolute;left:50%;top:8px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:6px 14px;border-radius:12px;background:rgba(5,9,14,.82);border:1px solid rgba(255,90,60,.5);color:#fff;font-family:system-ui,sans-serif;z-index:30;pointer-events:none}.cpncrisis b{font-size:22px;color:#ffd34a}.cpncrisis em{font-style:normal;font-size:18px;font-weight:700}.cpncrisis span{font-size:10px;letter-spacing:1px;color:#9fb3c8;margin-right:6px}.cpncrisis i{font-style:normal;font-size:16px}.cpncrisis.hot{border-color:#ff5a3c;animation:cpnpulse .5s infinite alternate}@keyframes cpnpulse{from{box-shadow:0 0 0 0 rgba(255,90,60,0)}to{box-shadow:0 0 18px 4px rgba(255,90,60,.6)}}' +
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
  E.time = h('div', 'cpng', '<span class="cpnshift" data-k="shift" title="Time left on your shift"></span><span class="cpnclk" data-k="clk" title="Station time"></span><span class="cpnfps" data-k="fps" hidden></span><button data-ts="0" aria-label="Pause">❚❚</button><button data-ts="1">×1</button><button data-ts="5">×5</button><button data-ts="20">×20</button><button data-ts="60">×60</button>', E.bar);
  E.xpc = h('button', 'cpng cpnxpc', '<b data-k="lv"></b><span><i data-k="rk"></i><em><u data-k="xb"></u></em></span>', E.bar); E.xpc.title = 'Career: level, rank, achievements and daily challenges'; E.xpc.addEventListener('click', function (e) { e.stopPropagation(); AUD.init(); careerMenu(); });
  E.xpf = h('div', 'cpnxpf', null, root); E.fps = E.time.querySelector('[data-k=fps]');
  E.tools = h('div', 'cpng', '<button data-b="views" title="Views (V)">🎥 Views</button><button data-b="explain" title="Explain mode: rest the pointer on anything for 3 seconds (X)">💡</button><button data-b="quick" title="Quick controls (C)">🎛</button><button data-b="assist" title="Instructor assist (G)">🎓</button><button data-b="snd" title="Sound">🔊</button><button data-b="field" title="Field operator and weather">🧑‍🔧</button><button data-b="radio" title="Desk radio">📻</button><button data-b="teach" title="Teach mode and lessons">🧑‍🏫</button><button data-b="arp" title="Alarm response procedures">📟</button><button data-b="proc" title="Procedures and cooldown">📘</button><button data-b="multi" title="Multiple monitors">🖥</button><button data-b="core" title="Core monitor and heat balance">📈</button><button data-b="ts" title="Tech Specs">📕</button><button data-b="help" title="Help (H)">?</button><button data-b="menu" title="Menu (Esc)">☰</button><button data-b="exit" title="Exit">✕</button>', E.bar);
  E.ms = h('div', 'cpnms', null, root); E.urg = h('div', 'cpnurg', null, root); E.urg.hidden = true;
  E.as = h('div', 'cpnas', null, root); E.qc = h('div', 'cpnqc', null, root); buildQC();
  E.tip = h('div', 'cpntip', null, root); E.tip.hidden = true; E.exp = h('div', 'cpnexp', null, root); E.exp.hidden = true;
  E.ring = h('div', 'cpnring', '<svg viewBox="0 0 20 20" width="22" height="22"><circle cx="10" cy="10" r="8" fill="rgba(5,9,14,.6)" stroke="rgba(255,255,255,.18)" stroke-width="2.5"/><circle cx="10" cy="10" r="8" fill="none" stroke="#ffd34a" stroke-width="2.5" stroke-dasharray="50.3" stroke-dashoffset="50.3" transform="rotate(-90 10 10)"/></svg>', root); E.ring.hidden = true; E.toasts = h('div', 'cpntoasts', null, root);
  E.hint = h('div', 'cpnhint', 'Drag to look · WASD to walk · Click a control · Scroll to zoom · L locks the mouse · Rest on anything for 3 s to learn what it does', root);
  E.joy = h('div', 'cpnjoy', '<i></i>', root); E.cross = h('div', 'cpnx', null, root); E.cross.hidden = true; var vg = el('div', 'cpnvig'); root.insertBefore(vg, R3.ren.domElement.nextSibling);
  E.bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; AUD.init();
    if (b.dataset.ts != null) { var v = +b.dataset.ts; if (v === 0) setPause(!S.paused); else { setTS(v); setPause(false); } }
    var k = b.dataset.b; if (k === 'explain') { S.cfg.explain = !S.cfg.explain; saveCfg(); toast(S.cfg.explain ? '💡 Explain mode on: rest the pointer on any control for 3 seconds' + (root.classList.contains('touch') ? ' (or press and hold it)' : '') + '.' : 'Explain mode off.'); if (!S.cfg.explain) hideExplain(); } if (k === 'field') fieldMenu(); if (k === 'radio') radioMenu(); if (k === 'teach') teachMenu(); if (k === 'arp') arpMenu(); if (k === 'proc') procMenu(); if (k === 'multi') multiMenu(); if (k === 'core') coreMenu('core'); if (k === 'ts') tsMenu(); if (k === 'views') viewsMenu(); else if (k === 'quick') { S.cfg.quick = !S.cfg.quick; saveCfg(); } else if (k === 'assist') { S.cfg.assist = !S.cfg.assist; saveCfg(); } else if (k === 'snd') { S.cfg.snd = !S.cfg.snd; AUD.vol(); saveCfg(); } else if (k === 'help') helpMenu(); else if (k === 'menu') pauseMenu(); else if (k === 'exit') close();
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
  crewBuild(); procBuild(); teachBuild(); lifeBuild();
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
    E.ms.innerHTML = '<h3>' + esc(P.t) + ' · ' + esc(P.code) + ' · ' + (ph === 'pre' ? countDone(fl, P.list.length) + ' of ' + P.list.length + ' checked' : 'step ' + (cur + 1) + ' of ' + P.list.length) + '</h3><div class="t"></div>' + (s.now ? '<div class="now"><span>NOW</span><div data-k="now"></div></div><div class="pb"><i data-k="pb"></i></div><details class="why"><summary>Why? (more detail)</summary><div class="h"></div></details>' : '<div class="h"></div>') + '<div class="st"></div><div class="row"><div class="dots">' + P.list.map(function () { return '<i></i>'; }).join('') + '</div>' +
      (ph === 'pre' ? '<button class="cpnb" data-m="verify">✔ Check it</button><button class="cpnb2" data-m="show" aria-label="Show me">👁</button>' : '<button class="cpnb" data-m="show">👁 Show me</button>') + '<button class="cpnb2" data-m="list" title="All the checklists" aria-label="All the checklists">📋</button>' + minB + '</div>';
    E.ms.querySelector('.t').textContent = s.t; E.ms.querySelector('.h').innerHTML = s.h; }
  E.ms.querySelector('.st').textContent = s.st(p); if (s.now) { var nw = s.now(p), ne = E.ms.querySelector('[data-k=now]'); if (ne.dataset.v !== nw.a) { ne.dataset.v = nw.a; ne.innerHTML = nw.a; } E.ms.querySelector('[data-k=pb]').style.width = Math.round(clamp(nw.pct == null ? 0 : nw.pct, 0, 1) * 100) + '%'; }
  [].forEach.call(E.ms.querySelectorAll('.dots i'), function (d, i) { d.className = fl[i] ? 'd' : i === cur ? 'c' : ''; });
}
function hudTick(dt) {
  HUD.t += dt; if (!HUD.dirty && HUD.t < 0.2) return; HUD.t = 0; HUD.dirty = false; var E = HUD.el, p = S.p;
  E.time.querySelector('[data-k=clk]').textContent = '🕒 ' + clockStr(D.clock).slice(0, 5) + '  ·  Grid demand ' + Math.round(LIFE.demandMW()) + ' MW (' + Math.round(LIFE.demandF() * 100) + '%)';
  [].forEach.call(E.time.querySelectorAll('[data-ts]'), function (b) { var v = +b.dataset.ts; b.setAttribute('aria-pressed', String(v === 0 ? S.paused : !S.paused && S.ts === v)); });
  E.tools.querySelector('[data-b=snd]').textContent = S.cfg.snd ? '🔊' : '🔇'; E.tools.querySelector('[data-b=quick]').setAttribute('aria-pressed', String(!!S.cfg.quick)); E.tools.querySelector('[data-b=assist]').setAttribute('aria-pressed', String(!!S.cfg.assist));
  /* shift chip and explain button */
  var sc = E.time.querySelector('[data-k=shift]'), left = shiftLeft(); sc.hidden = !S.cfg.shift; if (S.cfg.shift) { sc.textContent = left > 0 ? '⏱ ' + fmtMS(left) : 'OVERTIME +' + fmtMS(-left); sc.className = 'cpnshift' + (left <= 0 ? ' ot' : left <= 300 ? ' low' : ''); }
  E.tools.querySelector('[data-b=explain]').setAttribute('aria-pressed', String(!!S.cfg.explain));
  if (root.dataset.ui !== (S.cfg.ui || 'm')) root.dataset.ui = S.cfg.ui || 'm';
  msCard(p); lcoChip(); PROC.tick(); EXAM.tick(); TEACH.tick(); if (TEACH.el && S.menu && !TEACH.el.hidden) TEACH.el.hidden = true; else if (TEACH.el && !S.menu && TEACH.el.hidden && (TEACH.cur || TEACH.tour >= 0)) TEACH.draw(); if (CREW.el) { var chid = !S.cfg.crew || (!CREW.q && !CREW.msg) || !!S.menu; if (chid !== CREW.el.hidden) CREW.draw(); }
  if (E.xpc && CAR.p) { var Lv = CAR.lvl(), x0 = lvlXp(Lv), x1 = lvlXp(Lv + 1); E.xpc.querySelector('[data-k=lv]').textContent = Lv; E.xpc.querySelector('[data-k=rk]').textContent = rankOf(Lv) + ' · ' + CAR.p.xp.toLocaleString('en-GB') + ' XP'; E.xpc.querySelector('[data-k=xb]').style.width = Math.round((CAR.p.xp - x0) / (x1 - x0) * 100) + '%'; }
  /* urgent banner */
  var u = '';
  if (!p.tripped && p6(p) && (!p.srBlk[0] || !p.srBlk[1]) && (NI.sr[0] > 2e4 || NI.sr[1] > 2e4)) u = 'P-6 IS LIT: BLOCK BOTH SOURCE RANGE TRIPS NOW (' + Math.round(Math.max(p.srBlk[0] ? 0 : NI.sr[0], p.srBlk[1] ? 0 : NI.sr[1])).toLocaleString('en-GB') + ' cps, trip at 100,000)';
  else if (!p.tripped && D.pr > 12 && !blkd(p, 'prBlk') && !p.x.tb.gen) u = 'POWER ' + D.pr.toFixed(1) + '%: INSERT RODS NOW (power range trip at 25%)';
  else if (!p.tripped && p10(p) && (!blkd(p, 'prBlk') || !blkd(p, 'irBlk')) && D.pr > 14) u = 'P-10 IS LIT: BLOCK THE IR AND POWER RANGE LOW TRIPS NOW (' + D.pr.toFixed(1) + '%, trip at 25%)';
  else if (!p.tripped && p.x.sg.some(function (q) { return q.L < 25; })) u = 'STEAM GENERATOR LEVEL ' + Math.round(Math.min.apply(null, p.x.sg.map(function (q) { return q.L; }))) + '%: RESTORE FEED (trip at 17%)';
  else if (!p.tripped && p.x.pz.P < 140) u = 'PRESSURISER PRESSURE ' + p.x.pz.P.toFixed(0) + ' BAR AND FALLING (trip at 134)';
  else if (crx().sub < 10 && (crx().brk > 0 || crx().vv > 0)) u = 'SUBCOOLING ' + crx().sub.toFixed(0) + ' °C: STEAM IN THE REACTOR COOLANT SYSTEM. TRIP THE RCPs IF SI IS RUNNING (E-0 / E-1)';
  else if (!p.tripped && crx().dnbr < 1.5 && D.pr > 5) u = 'DNB RATIO ' + crx().dnbr.toFixed(2) + ': THE HOTTEST FUEL IS NEAR FILM BOILING. REDUCE POWER (OT\u0394T TRIP IS CLOSE)';
  else if (!p.tripped && p.runback) u = 'C-3/C-4: RODS BLOCKED AND THE TURBINE RUNNING BACK. \u0394T IS WITHIN 3% OF THE OT\u0394T/OP\u0394T TRIP';
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
      (FAULT.active().length ? '<div class="r" style="color:#ff9f43"><span>⚠ Fault</span><span>' + FAULT.active().map(function (q) { return esc(q.t); }).join(', ') + '</span></div>' : '') + (p.x.tb.gen ? '<div class="r"><span>Generator</span><span>' + Math.round(p.x.tb.mw) + ' MW</span></div><div class="r"><span>Tavg / Tref</span><span>' + p.Tavg.toFixed(1) + ' / ' + trefC(p.x).toFixed(1) + '</span></div>' : '') + (D.pr > 5 ? '<div class="r"><span>AFD (target)</span><span>' + crx().afdI.toFixed(1) + ' % (' + afdTarget(rtp()).toFixed(1) + ')</span></div><div class="r"><span>Min DNBR · FQ</span><span>' + crx().dnbr.toFixed(2) + ' · ' + crx().fq.toFixed(2) + '</span></div><div class="r"><span>Thermal (calorimetric)</span><span>' + Math.round(crx().best) + ' MWt</span></div>' : '') + (TS.active().length ? '<div class="r" style="color:#ffd34a"><span>📕 LCOs entered</span><span>' + TS.active().map(function (o) { return o.l.id; }).join(', ') + '</span></div>' : '') + '<div class="r"><span>1/M prediction</span><span>' + (pr != null ? (pr > PCMAX ? 'beyond all out' : pcName(pr).replace('bank ', '')) : '—') + '</span></div><div class="r"><span>SR audio</span><span>' + (!p.audio ? 'off' : p.srBlk[0] && p.srBlk[1] ? 'silent (SR blocked)' : '1 click per ' + S.audDiv + ' counts') + '</span></div>'; }
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
  return '<div class="cpnset">' + ck('snd', 'Sound') + ck('voice', 'Voice announcements') + ck('assist', 'Instructor assist panel') + ck('quick', 'Quick controls panel') + ck('explain', 'Explain mode (rest on a control for 3 s)') + ck('guide', 'Guide ring on the next control') + ck('tags', 'Tooltips end with [where it is · what the letters mean]') + ck('handAnim', 'Hand reaches for controls (animation)') + ck('lockReach', 'Keep my view still while my hand reaches for a control (on by default)') + ck('crew', 'Crew orders and three-way communication (free play)') + ck('teach', 'Teach mode: explain every new alarm') + ck('randEv', 'Random faults and instrument failures (free play)') + ck('mblur', 'Motion blur when you turn (High graphics)') + ck('fps', 'Show frame rate') + '</div><div class="cpnseg"><span>Graphics</span>' + [['lite', '\ud83e\udd54 Lite (phones, old laptops)'], ['low', 'Low'], ['high', 'High (shadows, reflections)']].map(function (q) { return '<button data-a="gfx" data-v="' + q[0] + '" aria-pressed="' + (c.gfx === q[0]) + '">' + q[1] + '</button>'; }).join('') + '</div><div class="cpnseg"><span>UI size</span>' + [['xs', 'Tiny'], ['s', 'Small'], ['m', 'Normal'], ['l', 'Large']].map(function (q) { return '<button data-a="uisz" data-v="' + q[0] + '" aria-pressed="' + ((c.ui || 'm') === q[0]) + '">' + q[1] + '</button>'; }).join('') + '</div><div class="cpnseg"><span>Shift length</span>' + [15, 30, 45, 60, 0].map(function (m) { return '<button data-a="shift" data-v="' + m + '" aria-pressed="' + (c.shift === m) + '">' + (m ? m + ' min' : 'No limit') + '</button>'; }).join('') + '</div>'; }
function shiftClick(b) { S.cfg.shift = +b.dataset.v; S.shiftWarn = false; S.shiftOver = false; saveCfg(); [].forEach.call(b.parentNode.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
function shiftLeft() { return S.cfg.shift ? S.cfg.shift * 60 - S.shiftUsed : Infinity; }
function fmtMS(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
function shiftTick(dt) { S.shiftUsed += dt; if (!S.cfg.shift) return; var l = shiftLeft();
  if (l <= 300 && l > 0 && !S.shiftWarn) { S.shiftWarn = true; toast('⏱ 5 minutes left on your shift. Get the plant somewhere steady to hand over.', 'warn'); speak('Five minutes left on shift.'); }
  if (l <= 0 && !S.shiftOver) { S.shiftOver = true; if (FULL_SHIFT.on) { toast('⏱ 12 hours up. You have 1 hour of overrun to finish the shutdown.', 'warn'); speak('Twelve hours. One hour overrun.'); } else shiftOverMenu(); } }
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
function gfxClick(b) { S.cfg.gfx = b.dataset.v; saveCfg(); [].forEach.call(b.parentNode.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); toast('Graphics set to ' + b.textContent + '. It applies next time you open the simulator (close it with \u2715 and open it again).', 'ok'); }
function uiClick(b) { S.cfg.ui = b.dataset.v; saveCfg(); root.dataset.ui = S.cfg.ui; [].forEach.call(b.parentNode.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
function cfgClick(b) { var k = b.dataset.c; if (k === 'gfxlo') { S.cfg.gfx = b.checked ? 'low' : 'high'; toast('Graphics change applies next time you open the simulator.'); } else S.cfg[k] = b.checked; if (k === 'snd') AUD.vol(); saveCfg(); HUD.dirty = true; }
function startMenu() {
  var sv = rd(), canResume = !!(sv.p && sv.v === 1);
  S.wasPaused = true; setPause(true);
  menu('<h1>☢ Critical Point Nuclear Power Station</h1><p class="cpnsub">Unit 1 main control room · 11 boards, every control working</p>' + '<div class="cpncar" style="margin:8px 0 12px"><div class="lv"><b>' + CAR.lvl() + '</b><span>LEVEL</span></div><div class="rk"><b>' + esc(rankOf(CAR.lvl())) + '</b><div class="xpbar"><i style="width:' + Math.round((CAR.p.xp - lvlXp(CAR.lvl())) / (lvlXp(CAR.lvl() + 1) - lvlXp(CAR.lvl())) * 100) + '%"></i></div><small>' + CAR.p.xp.toLocaleString('en-GB') + ' XP · ' + ACH.filter(function (q) { return CAR.p.ach[q[0]]; }).length + '/' + ACH.length + ' achievements</small></div><button class="cpnb2" data-a="career">🏅 Career</button><button class="cpnb2" data-a="saves">💾 Save / load</button><button class="cpnb2" data-a="exam">🎓 Simulator exam</button><button class="cpnb2" data-a="multi">🖥 Monitors</button></div>' +
    '<p>You are the reactor operator on shift. Unit 1 is a four-loop pressurised water reactor (3411 MW of heat, about 1200 MW of electricity), sitting at <b>hot standby</b>: 291.7 °C, 155 bar, every control rod in. Your job is to work through the <b>pre-startup checklist</b>, take it <b>critical</b> with the real startup procedure, level off at the point of adding heat, then <b>shut it down</b> again. Rest the pointer on any control for 3 seconds to find out what it does.</p>' +
    '<div class="cpnbtns">' + (canResume ? '<button class="cpnb" data-a="resume">▶ Resume shift</button><button class="cpnb2" data-a="new">↻ New startup</button>' : '<button class="cpnb" data-a="new">▶ Start the reactor startup</button>') + '<button class="cpnb" data-a="crisis" style="background:#ff5a3c;color:#fff">⚡ Crisis shift (10 min)' + (CRISIS.best() ? ' · best ' + CRISIS.best().toLocaleString() : '') + '</button><button class="cpnb2" data-a="full">🕛 Full shift (12 real hours)</button><button class="cpnb2" data-a="saves">💾 Load a save</button><button class="cpnb2" data-a="shutp">⏬ Shutdown practice</button><button class="cpnb2" data-a="ascp">⏫ Power ascension practice</button><button class="cpnb2" data-a="free">Free play (hot standby)</button><button class="cpnb2" data-a="atp">⚡ Free play at 50% power</button><button class="cpnb2" data-a="learn">📘 How a PWR works</button><button class="cpnb2" data-a="exit">Exit</button></div>' +
    '<h2>Settings</h2>' + setHTML() + '<h2>What you can do</h2>' + roadHTML() +
    '<p style="font-size:12px;color:#7f93a6;margin-top:14px">Inspired by Roblox’s Oakridge Nuclear Power Station. Physics: point kinetics with six delayed-neutron groups, rod worth curves, boron, Doppler, moderator and xenon feedback, plus a whole-plant model: pressuriser, coolant pumps, steam generators, feed, turbine, generator, grid and electrics. Real plants differ in detail.</p>',
    function (a, b) { if (a === 'cfg') return cfgClick(b); if (a === 'shift') return shiftClick(b); if (a === 'gfx') return gfxClick(b); if (a === 'uisz') return uiClick(b);
      if (a === 'resume') { loadState(sv); begin(); } else if (a === 'crisis') { CRISIS.start(); begin(); } else if (a === 'full') { FULL_SHIFT.start(); begin(); } else if (a === 'new') { freshState(false); begin(); } else if (a === 'free') { freshState(true); begin(); } else if (a === 'shutp') { shutPractice(); begin(); } else if (a === 'ascp') { shutPractice(); MS.shutOn = false; MS.practice = false; startAsc(); begin(); } else if (a === 'atp') { atPowerStart(); begin(); } else if (a === 'saves') saveMenu(); else if (a === 'learn') learnMenu(); else if (a === 'career') careerMenu(); if (a === 'saves') saveMenu(); if (a === 'exam') EXAM.start(); else if (a === 'exit') close(); });
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
    '<h2>XP and your career</h2><p>The gold chip at the top shows your level and rank. You earn XP for checklist steps and procedures, every 8 MWh you send to the grid, steady operation, handling faults, achievements and three new daily challenges every day. Climb from Trainee to Station Manager. Click the chip to see everything.</p><p><b>Following a checklist:</b> the blue <b>NOW</b> box always says the very next thing to do, the bar shows how far through the step you are, and a pulsing blue ring sits on the control to use. Tap <b>Why?</b> for the reasoning.</p><p><b>Slow device?</b> Choose <b>\ud83e\udd54 Lite</b> graphics in the menu settings: it\u2019s many times faster, and lowers the resolution by itself if frames get slow. Tick <b>Show frame rate</b> to see the difference.</p>' + '<h2>The boards, left to right</h2><div class="cpnkeys"><kbd>1</kbd><span>Safety injection, containment, radiation</span><kbd>2</kbd><span>Cooling water, instrument air, ventilation, fire</span><kbd>3</kbd><span>Chemical &amp; volume control: charging, letdown, boron</span><kbd>4</kbd><span>Pressuriser: heaters, spray, PORVs</span><kbd>5</kbd><span>Reactor coolant pumps and loop temperatures</span><kbd>6</kbd><span>REACTOR: rods, nuclear instruments, trip breakers</span><kbd>7</kbd><span>Steam generators and feedwater</span><kbd>8</kbd><span>Main steam, steam dumps, condenser</span><kbd>9</kbd><span>Turbine</span><kbd>10</kbd><span>Generator, synchronising, 400 kV grid</span><kbd>11</kbd><span>Electrical buses and diesel generators</span></div>' +
    '<h2>How realistic the physics is</h2><p>The core is modelled in <b>12 axial slices</b>: each has its own coolant temperature, fuel temperature, rod tips and xenon. That gives a real <b>axial power shape</b> and <b>axial flux difference (AFD)</b>, and xenon can slosh between the top and bottom of the core over about 30 hours (a <b>xenon oscillation</b>). Water and steam use the real IAPWS-IF97 saturation line. The hot channel\u2019s <b>DNB ratio</b> comes from the W-3 correlation and the fuel centreline temperature from the pellet\u2019s real conductivity. <b>OT\u0394T and OP\u0394T</b> trips use the real setpoint equations, with C-3/C-4 rod stops and turbine runbacks. A <b>small-break LOCA</b> drains the pressuriser, voids the loops and can uncover the core.</p>' +
    '<h2>Core monitor and heat balance (\ud83d\udcc8)</h2><p>The wall screen between the mimic and the alarms (or \ud83d\udcc8 at the top) shows the axial shape, AFD against its Tech Spec envelope, FQ, F\u0394H, DNBR, fuel temperature, subcooling and RVLIS. The <b>Heat balance</b> tab is the daily <b>secondary calorimetric</b>: feed flow \u00d7 (steam enthalpy \u2212 feed enthalpy) for each SG, minus pump heat. Record it when the plant is steady and match the four power range channels to it. The venturis slowly foul and the detectors drift, just like a real plant.</p>' +
    '<h2>Tech Specs (\ud83d\udcd5)</h2><p>The licence rules are checked all the time. Break one and a yellow chip appears top right with the <b>Required Action</b> and its <b>Completion Time</b> counting down in plant time. Fix it in time and you exit the LCO (+XP). Miss it and the next action starts; miss the last and it\u2019s a violation.</p>' +
    '<h2>Multiple monitors (\ud83d\udda5)</h2><p><b>Screen windows</b> open on your other monitors: each is a grid of tiles showing any plant computer screen or a live panel (checklist, reactor instruments, Tech Specs, supervisor). <b>Triple view</b> draws the room across three monitors in true perspective when this window spans all three. Press \ud83d\udda5 at the top.</p>' +
    '<h2>Procedures (\ud83d\udcd8)</h2><p>After a trip in free play <b>E-0</b> starts by itself and branches to ES-0.1, E-1 (LOCA), E-3 (tube rupture) or ES-1.1 like the real one. <b>GOP-305</b> takes the plant to cold shutdown: borate, block SI at P-11, bypass P-12, cool down at under 55 \u00b0C/h, isolate the accumulators, then RHR shutdown cooling down to MODE 5. The cooldown controls are in \ud83d\udcd8.</p>' + 
    '<h2>Loops, quadrants and fuel</h2><p>Each steam generator has its own pressure and heat transfer, so a steam line break or an isolated SG affects its own loop, and each loop\u2019s cold leg feeds its own core quadrant. A dropped rod or a cold loop tilts power between quadrants (QPTR, Tech Spec 3.2.4); the power range channels disagree. Fuel burns up through the 18-month cycle: pick start, middle or end of cycle in \ud83d\udcd8 and the boron, MTC and xenon behaviour change with it.</p>' + 
    '<h2>The crew (free play)</h2><p>Your Control Room Supervisor gives orders: load changes for National Grid, calorimetrics, AFD control, pump swaps. Pick the correct <b>repeat-back</b> (three-way communication, exactly as real operators do it), do the job, then press <b>Report complete</b>. After a trip she takes you through the first steps of <b>E-0</b>. Turn it off in the menu settings.</p>' +
    '<h2>Going to power (free play)</h2><p>From the point of adding heat: start a <b>main feed pump</b> (board 7). On the turbine board <b>LATCH</b>, set the speed target to 3000 and wait. On the generator board close the <b>field breaker</b>, turn the <b>sync selector</b> to MAN, use <b>speed raise</b> to make the synchroscope creep clockwise and close the <b>generator breaker</b> as it passes 12 o\u2019clock. Then put the dumps in <b>TAVG</b>, the rods in <b>AUTO</b>, block the IR and PR-low trips at <b>P-10</b>, and raise the load setpoint. Rods soon run out: dilute boron on board 3 to keep going. Use \u00d720 or \u00d760 time: it takes hours, just like a real plant. Or press <b>\u23eb Go to power</b> on the checklist card for the guided GOP-302 checklist.</p><p><b>\u26a0 Faults:</b> from the pause menu or the \u26a0 button on the checklist card. Start from <b>Free play at 50% power</b> for the most interesting ones.</p>' +
    '<h2>Colours</h2><p>Lamps use the Westinghouse convention: <b style="color:#ff6b5b">red = closed / running / open valve</b>, <b style="color:#59e07a">green = open breaker / stopped / shut valve</b>. Annunciators: fast flash = new alarm (press ACK), steady = acknowledged, slow flash = cleared (press RESET).</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="x">Got it</button></div>', function (a) { if (a === 'x') closeMenu(); });
}
function pauseMenu() { S.wasPaused = S.paused; setPause(true); var ph = MS.phase(), P = phaseDef(ph);
  menu('<h1>Paused</h1><p class="cpnsub">' + (ph === 'free' ? 'Free play' : esc(P.t) + ' · ' + countDone(MS[P.fl], P.list.length) + ' of ' + P.list.length + ' done') + ' · ' + esc(pcName(S.p.pc)) + (S.cfg.shift ? ' · shift ' + (shiftLeft() > 0 ? fmtMS(shiftLeft()) + ' left' : 'in overtime') : '') + '</p>' +
    '<div class="cpnbtns"><button class="cpnb" data-a="go">▶ Resume</button><button class="cpnb2" data-a="gloss">📖 What the letters mean</button><button class="cpnb2" data-a="handanim">' + (S.cfg.handAnim !== false ? '🖐 Hand animation: ON' : '🖐 Hand animation: OFF') + '</button><button class="cpnb2" data-a="watch">' + (WATCH.on ? '👤 Take the board back' : '👤 Hand the board to the supervisor (1 h)') + '</button><button class="cpnb2" data-a="views">🎥 Views</button><button class="cpnb2" data-a="faults">⚠ Faults</button><button class="cpnb2" data-a="career">🏅 Career</button><button class="cpnb2" data-a="saves">💾 Save / load</button><button class="cpnb2" data-a="restart">↻ Restart from hot standby</button><button class="cpnb2" data-a="main">Main menu</button><button class="cpnb2" data-a="exit">Exit</button></div><h2>Settings</h2>' + setHTML() + '<h2>The 10 sections</h2>' + roadHTML(),
    function (a, b) { if (a === 'cfg') return cfgClick(b); if (a === 'shift') return shiftClick(b); if (a === 'gfx') return gfxClick(b); if (a === 'uisz') return uiClick(b); if (a === 'go') closeMenu(); if (a === 'gloss') { glossaryMenu(); return; } if (a === 'handanim') { S.cfg.handAnim = S.cfg.handAnim === false; saveCfg(); pauseMenu(); return; } if (a === 'watch') { closeMenu(); if (WATCH.on) WATCH.stop(); else WATCH.start(); } if (a === 'views') viewsMenu(); if (a === 'faults') faultsMenu(); if (a === 'career') careerMenu(); if (a === 'saves') saveMenu(); if (a === 'multi') multiMenu(); if (a === 'restart') { freshState(MS.free); begin(); } if (a === 'main') { save(); startMenu(); } if (a === 'exit') close(); });
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
  OTDT: 'Overtemperature \u0394T: the hot-to-cold leg temperature difference (a measure of power) went above a setpoint that falls as Tavg rises, as pressure falls and as the axial flux difference gets extreme. It protects the hottest fuel rod from DNB (film boiling). Keep Tavg on Tref, pressure at 155 bar and AFD in its band.',
  OPDT: 'Overpower \u0394T: the loop \u0394T went above about 109% of its full-power value. It protects the fuel pellets from melting at the centre. Power rose too far: too much rod withdrawal or dilution, or too much steam taken.',
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
  try { API.xp(xp, 'Critical Point: reactor startup'); } catch (e) {} CAR.event('start', score);
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
function snap(p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = p[k]; }); o.hist = p.hist.slice(-300); o.c = p.c.slice(); o.rods = Object.assign({}, p.rods); o.lever = 0; o.dropping = false; return o; }
function save() { if (!S || !S.p) return; CAR.save(); var sv = rd(); sv.v = 1; sv.p = snap(S.p); sv.pAt = Date.now(); sv.ms = { pre: MS.pre, done: MS.done, shut: MS.shut, surT: MS.surT, poT: MS.poT, complete: MS.complete, free: MS.free, shutOn: MS.shutOn, shutDone: MS.shutDone, preSkipped: MS.preSkipped, practice: MS.practice, orderBad: MS.orderBad, shutTrips: MS.shutTrips, asc: MS.asc, ascOn: MS.ascOn, ascDone: MS.ascDone }; sv.shiftUsed = S.shiftUsed; sv.watch = { on: WATCH.on, left: WATCH.left, cd: WATCH.cd, at: Date.now() }; sv.full = FULL_SHIFT.on ? { s: FULL_SHIFT.starts0, h: FULL_SHIFT.shuts0, w: FULL_SHIFT.warned, at: FULL_SHIFT.at } : null; sv.st = S.st; sv.log = S.log.slice(-80); sv.cfg = S.cfg; sv.clock0 = S.clock0; sv.lastTrip = S.lastTrip; sv.cam = { x: CAM.x, y: CAM.y, z: CAM.z, yaw: CAM.yaw, pitch: CAM.pitch, fov: CAM.fov }; wr(sv); }
function saveCfg() { var sv = rd(); sv.cfg = S.cfg; wr(sv); HUD.dirty = true; }
function loadState(sv) { var p = Object.assign(freshPlant(), sv.p); p.lever = 0; S.p = p; var m = sv.ms || {}; MS.reset(); MS.pre = m.pre || []; MS.done = m.done || []; MS.shut = m.shut || []; MS.surT = m.surT || 0; MS.poT = m.poT || 0; ['complete', 'free', 'shutOn', 'shutDone', 'preSkipped', 'practice', 'orderBad'].forEach(function (k) { MS[k] = !!m[k]; }); MS.shutTrips = m.shutTrips || 0; MS.asc = m.asc || []; MS.ascOn = !!m.ascOn; MS.ascDone = !!m.ascDone; MS.cur = firstOpen(STEPS, MS.done); MS.scur = firstOpen(SHUT, MS.shut);
  S.shiftUsed = sv.shiftUsed || 0; if (sv.watch) { var away = (Date.now() - (sv.watch.at || Date.now())) / 1000; WATCH.on = false; WATCH.cd = Math.max(0, (sv.watch.on ? WATCH.CD : sv.watch.cd || 0) - away); } if (sv.full) { FULL_SHIFT.on = true; FULL_SHIFT.starts0 = sv.full.s; FULL_SHIFT.shuts0 = sv.full.h; FULL_SHIFT.warned = sv.full.w || {}; FULL_SHIFT.at = sv.full.at; } else FULL_SHIFT.on = false; S.shiftWarn = shiftLeft() <= 300; S.shiftOver = shiftLeft() <= 0;
  S.st = Object.assign({ trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }, sv.st || {}); S.log = sv.log || []; S.clock0 = sv.clock0 || S.clock0; if (sv.cam) Object.assign(CAM, sv.cam, { tw: null, view: 'walk' });
  for (var i = 0; i < 6; i++) niTick(p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; HUD.el.ms.dataset.cur = ''; }
function shutPractice() { freshState(false); S.p = poahPlant(); MS.complete = true; MS.practice = true; MS.pre = PRE.map(function () { return true; }); MS.done = STEPS.map(function () { return true; }); S.st.critPc = S.p.pc;
  for (var i = 0; i < 8; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.log = []; S.addLog('Shift start: Unit 1 at the point of adding heat (' + pcName(S.p.pc) + ', ' + (S.p.n * 100).toFixed(1) + '% power)'); startShutdown(); goView('start', true); save(); }
function freshState(free, keepCam) { FULL_SHIFT.on = false; S.p = newPlant(); MS.reset(); MS.complete = false; MS.free = !!free; S.shiftUsed = 0; S.shiftWarn = false; S.shiftOver = false; S.st = { trips: 0, maxSur: 0, pts: 0, critPc: null, predPc: null }; S.log = []; S.clock0 = 7 * 3600 + 12 * 60 + Math.floor(Math.random() * 600);
  for (var i = 0; i < 6; i++) niTick(S.p, 0.2); derive(0.05); ANNC.init(); ANNC.list = []; S.addLog('Shift start: Unit 1 at hot standby (Mode 3), all rods in, boron ' + BORON0 + ' ppm'); if (!keepCam) goView('start', true); HUD.el.ms.dataset.cur = ''; clearHL(); save(); }

/* ================================================================ the loop ================================================================ */
var RAF = 0, last = 0, rr0 = 0, saveT = 0, lastSteps = 0, wasP6 = false, wasCrit = false, lastPts = 0, sizeK = '';
function frame(now) {
  RAF = requestAnimationFrame(frame); if (PERF.cap && last && (now - last) / 1000 < PERF.cap - 0.004) return; var dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000)); last = now; var p = S.p; perfTick(dt);
  var k = root.clientWidth + 'x' + root.clientHeight; if (k !== sizeK) { sizeK = k; R3.ren.setSize(root.clientWidth, root.clientHeight, false); POST.size(root.clientWidth, root.clientHeight); OFS.w = -1; }
  if (!S.paused && !S.menu) {
    var sim = dt * S.ts, n = Math.max(1, Math.ceil(sim / 0.05)), hh = sim / n;
    for (var i = 0; i < n; i++) { plantStep(p, hh); niTick(p, hh); rps(p); permissives(p); oneMTick(p, hh); }
    derive(sim); MS.tick(sim); ANNC.tick(); CAR.tick(sim, dt); TS.tick(sim); CREW.tick(dt, sim); RNDE.tick(sim); CRISIS.tick(sim); FULL_SHIFT.tick(); LIFE2.tick(dt); HALL.tick(dt); WATCH.tick(dt); EXT.tick(dt); DOORS.tick(dt);
    if (p.sur > S.st.maxSur && !p.tripped) S.st.maxSur = p.sur;
    if (p.steps !== lastSteps) { var ds = p.steps - lastSteps; lastSteps = p.steps; if (ds > 0 && ds < 50) AUD.sfx('step'); }
    var np = p6(p); if (np && !wasP6 && !p.tripped) { S.addLog('P-6 permissive: intermediate range above 1E-10 A'); speak('P 6. Block the source range.'); if (S.ts > 1) setTS(1); } wasP6 = np;
    if (p.everCrit && !wasCrit) { S.st.critPc = p.pc; S.st.predPc = ecpFromOneM(p); S.st.pts = Math.max(0, p.oneM.length - 1); S.addLog('Reactor critical at ' + pcName(p.pc)); speak('The reactor is critical.'); toast('☢ The reactor is critical at ' + pcName(p.pc) + '.', 'ok'); if (S.ts > 1) setTS(1); }
    wasCrit = p.everCrit;
    if (p.oneM.length !== lastPts) { lastPts = p.oneM.length; HUD.dirty = true; }
    saveT += dt; if (saveT > 20) { saveT = 0; save(); }
    if (!document.hidden) shiftTick(dt);
  }
  var py0 = CAM.yaw, pp0 = CAM.pitch; moveCam(dt); applyCam(dt); hover();
  if (POST.on) { var mv = POST.mbv || (POST.mbv = new THREE.Vector2()), st = S.cfg.mblur === false ? 0 : 0.55, fvr = Math.tan(R3.cam.fov * Math.PI / 360), dy = CAM.yaw - py0, dp = CAM.pitch - pp0; mv.set(-dy / (2 * fvr * R3.cam.aspect) * st, dp / (2 * fvr) * st); if (mv.length() < 0.0008) mv.set(0, 0); if (mv.length() > 0.06) mv.setLength(0.06); }
  pressed = pressed.filter(function (q) { q.t -= dt; if (q.t <= 0) { q.m.position.y = q.y0; return false; } return true; });
  CTRL.forEach(function (f) { f(dt); });
  var lt = S.lampTest; LAMPS.forEach(function (L) { var on = lt || !!L.on(); if (on !== L.st) { L.st = on; L.m.emissiveIntensity = on ? (POST.on ? 4 : 1.6) : (L.lo || 0); L.m.color.copy(on ? L.c : L.off); } });
  HL.forEach(function (q) { q.t += dt; var s = 1 + 0.15 * Math.sin(q.t * 6); q.m.scale.set(s, s, s); q.m.material.opacity = 0.55 + 0.45 * Math.sin(q.t * 6); }); if (HL.length && HL[0].t > 12) clearHL();
  /* widgets: annunciators every frame, the rest a slice at a time */
  ANNW.forEach(function (w) { redraw(w); });
  beFrame(dt); guideTick(dt); try { FEEL.tick(dt); LIFE.tick(dt, (!S.paused && !S.menu) ? dt * S.ts : 0); } catch (e) { if (!window._lifeErr) { window._lifeErr = 1; console.error(e); } }
  var per = PERF.lite ? Math.max(3, Math.ceil(WG.length / 16)) : Math.max(10, Math.ceil(WG.length / 6)); for (var j = 0; j < per; j++) { rr0 = (rr0 + 1) % WG.length; var w = WG[rr0]; if (!w.isAnn) redraw(w); }
  AUD.tick(dt); hudTick(dt); explainTick(now);
  MULTI.tick(dt);
  if (TRI.on()) TRI.render(); else if (POST.on) POST.render(); else R3.ren.render(R3.scene, R3.cam);
}
var ANNW = [];

/* ================================================================ open and close ================================================================ */
function open() {
  if (root && !root.hidden) return;
  if (root) { root.hidden = false; document.addEventListener('keydown', kd); document.addEventListener('keyup', ku); last = 0; RAF = requestAnimationFrame(frame); startMenu(); return; }
  if (!document.getElementById('cpnCss')) { var st = document.createElement('style'); st.id = 'cpnCss'; st.textContent = CSS + OPS_CSS; document.head.appendChild(st); }
  root = el('div', 'cpn'); root.setAttribute('role', 'application'); root.setAttribute('aria-label', 'Critical Point nuclear power station simulator'); document.body.appendChild(root);
  var ld = h('div', 'cpnload', '<i></i><span>Powering up the control room…</span>', root);
  loadThree(function (ok) {
    if (!ok) { ld.innerHTML = '<span>Couldn’t load the 3D engine. Check your connection and try again.</span><button class="cpnb" style="margin-top:10px">Close</button>'; ld.querySelector('button').onclick = close; return; }
    setTimeout(function () { try { init(); ld.remove(); } catch (e) { ld.innerHTML = '<span>Something went wrong starting the simulator: ' + esc(e && e.message) + '</span><button class="cpnb" style="margin-top:10px">Close</button>'; ld.querySelector('button').onclick = close; try { console.error(e); } catch (x) {} } }, 30);
  });
}
function loadThree(cb) { if (window.THREE && THREE.WebGLRenderer) { cb(true); return; } var s = document.createElement('script'); s.src = 'vendor/three.min.js?v=160'; s.onload = function () { cb(!!(window.THREE && THREE.WebGLRenderer)); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
function init() {
  var sv = rd(); makeSession(sv); var hi = S.cfg.gfx === 'high', lite = S.cfg.gfx === 'lite'; root.classList.toggle('lite', lite); PERF.lite = lite; PERF.cap = lite ? 1 / 31 : 0; if (lite) { TEXS = 0.5; BEN = 1; }
  var ren = new THREE.WebGLRenderer({ antialias: hi, powerPreference: lite ? 'default' : 'high-performance', stencil: false }); PERF.prMax = Math.min(window.devicePixelRatio || 1, hi ? 2 : lite ? 0.85 : 1); PERF.pr = PERF.prMax; ren.setPixelRatio(PERF.pr); ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 0.92;
  ren.domElement.className = 'cpn3d'; ren.domElement.tabIndex = 0; root.insertBefore(ren.domElement, root.firstChild);
  ANISO = Math.min(hi ? 8 : 2, ren.capabilities.getMaxAnisotropy ? ren.capabilities.getMaxAnisotropy() : 4);
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0x1d2126); var cam = new THREE.PerspectiveCamera(60, 1, 0.03, 5000); scene.fog = new THREE.FogExp2(0x1d2126, 0.0004); R3 = { ren: ren, scene: scene, cam: cam }; RC = new THREE.Raycaster();
  S.p = newPlant(); derive(0.05);
  mats(); buildRoom(scene); SECDEF.forEach(buildSection); joints(); furniture(scene);
  if (hi) { try { var pm = new THREE.PMREMGenerator(ren), es = new THREE.Scene(), bx = new THREE.Mesh(new THREE.BoxGeometry(2 * RX, CH, RDP), new THREE.MeshBasicMaterial({ color: 0x5d6268, side: THREE.BackSide })); bx.position.set(0, CH / 2, RZC); es.add(bx);
    var lm = new THREE.MeshBasicMaterial({ color: 0xffffff }); lm.color.setScalar(5); for (var x = -10.5; x <= 10.5; x += 3) for (var z = ZB + 1.5; z <= ZF - 1; z += 3) { var l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), lm); l.rotation.x = Math.PI / 2; l.position.set(x, CH - 0.05, z); es.add(l); }
    scene.environment = pm.fromScene(es, 0.04).texture; scene.environmentIntensity = 0.55; pm.dispose(); } catch (e) {} }
  if (hi) { try { realism(scene); } catch (e) { try { console.error(e); } catch (x) {} } }
  if (lite) { ren.toneMapping = THREE.NoToneMapping; try { liteScene(scene); } catch (e) { try { console.error(e); } catch (x) {} } }
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
function close() { if (CRISIS.on) { CRISIS.on = false; if (CRISIS.hud) CRISIS.hud.hidden = true; }
  if (!root) return; try { save(); } catch (e) {} try { RADIO.stop(); } catch (e) {} try { MULTI.closeAll(); } catch (e) {} cancelAnimationFrame(RAF); RAF = 0; root.hidden = true; document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); KEYS = {};
  try { if (AUD.ctx) AUD.ctx.suspend(); } catch (e) {} try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} try { API.close(); } catch (e) {}
}
window.CRIT_PLANT = { open: open, close: close, _dbg: { CAM: CAM, goHall: function () { goHall(); }, S: function () { return S; }, HAND: HAND, handReach: function (h) { handReach(h); }, LIFE: LIFE, FEEL: FEEL, TEACH: TEACH, EXAM: EXAM, PROC: PROC, procMenu: function () { procMenu(); }, MULTI: MULTI, TRI: TRI, multiMenu: function () { multiMenu(); }, MVH: MVH, FAULT: FAULT, TS: TS, CREW: CREW, coreMenu: function (t) { coreMenu(t); }, tsMenu: function () { tsMenu(); }, crx: function () { return crx(); }, rtp: function () { return rtp(); }, CAR: CAR, careerMenu: function () { careerMenu(); }, startAsc: function () { startAsc(); }, ctl: function (re, arg) { var r = new RegExp(re), m = HITS.filter(function (h) { var o = h.userData.hit, t = typeof o.tip === 'function' ? o.tip() : o.tip; return t && r.test(t) && (o.act || o.hold); }); if (m.length !== 1) return 'match ' + m.length + ': ' + m.slice(0, 4).map(function (h) { var o = h.userData.hit; return typeof o.tip === 'function' ? o.tip() : o.tip; }).join(' | '); var o = m[0].userData.hit; if (o.act) o.act(arg); else { o.hold(true); o.hold(false); } return 'ok'; }, tips: function (re) { var r = new RegExp(re); return HITS.map(function (h) { var o = h.userData.hit; return typeof o.tip === 'function' ? o.tip() : o.tip; }).filter(function (t) { return t && r.test(t); }); }, MS: MS, ACT: ACT, ANNC: ANNC, NI: NI, D: D, CAM: CAM, goView: goView, showMe: showMe, setTS: setTS, step: function (sec, h) { h = h || 0.05; var p = S.p; for (var t = 0; t < sec; t += h) { plantStep(p, h); niTick(p, h); rps(p); permissives(p); oneMTick(p, h); derive(h); MS.tick(h); ANNC.tick(); CAR.tick(h, 0); TS.tick(h); if (p.sur > S.st.maxSur && !p.tripped) S.st.maxSur = p.sur; if (p.everCrit && S.st.critPc == null) { S.st.critPc = p.pc; S.st.predPc = ecpFromOneM(p); S.st.pts = Math.max(0, p.oneM.length - 1); } } },
  blocked: function (x, z) { return blocked(x, z); }, dbgColl: function () { var n = 0, f = [0,0,0,0]; R3.scene.traverse(function (o) { if (!o.isMesh) return; n++; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var wb = new THREE.Box3().copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); if (wb.min.y > 1.1) f[0]++; else if (wb.max.y < 0.3) f[1]++; else f[2]++; }); return [n, f, R3.scene.children.length]; }, COLLn: function () { return COLL && COLL.length; }, pick: function (x, y) { var hh = pick(x, y); return hh ? { tip: hh.object.userData.hit && (typeof hh.object.userData.hit.tip === 'function' ? hh.object.userData.hit.tip() : hh.object.userData.hit.tip), act: !!(hh.object.userData.hit && hh.object.userData.hit.act), hold: !!(hh.object.userData.hit && hh.object.userData.hit.hold) } : null; },
  click: function (x, y) { activate(pick(x, y)); }, verifyPre: verifyPre, startShutdown: startShutdown, PRE: PRE, SHUT: SHUT, EXP: EXP, shiftLeft: function () { return shiftLeft(); }, ofs: function () { return OFS; }, settled: function () { return !CAM.tw && Math.abs(OFS.cur - (OFS.want || 0)) < 0.5; }, R3: function () { return R3; }, desk: function (id, u, d, lift) { var v = SEC[id].desk.localToWorld(new THREE.Vector3(u, lift == null ? 0.0015 : lift, -d * SL)); v.project(R3.cam); var r = R3.ren.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, WG: WG, HITS: HITS, SEC: SEC, rho: function () { return rhoParts(S.p); }, ecp: function () { return ecpFromOneM(S.p); } } };
})();
