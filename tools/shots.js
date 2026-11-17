// Visual check: loads the Critical Point sim in headless Chromium at set times of day and weather and saves screenshots.
//
//   npm i playwright          (once; Chromium comes with it:  npx playwright install chromium)
//   node tools/shots.js                      # all scenarios into ./shots
//   node tools/shots.js --only night-gate    # one scenario
//   node tools/shots.js --out /tmp/pics --size 1280x720
//
// It serves this folder on a random local port, opens critical.html, starts the plant at power, then for each
// scenario sets the clock, the weather and a free camera (world coordinates; yard coordinates + [12, 0, 0.9]) and saves a PNG.
// Headless software rendering is slow (about 2 frames a second), so each scenario waits a few seconds.
// Exit code 1 if the page logged a JavaScript error. Tested with Playwright 1.x and Chromium using SwiftShader.
const fs = require('fs'), path = require('path'), http = require('http');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', path.join(process.cwd(), 'shots')), ONLY = arg('only', ''), [W, H] = arg('size', '1100x700').split('x').map(Number), ROOT = path.resolve(__dirname, '..');
// look: [fromX, fromY, fromZ, toX, toY, toZ] in world coordinates. wx: weather overrides (as the F9 panel uses).
const WX = { clear: { code: 0, cl: 0.05 }, rain: { code: 63, rain: 2.5, cl: 0.9, T: 9, w: 15, g: 22 }, snow: { code: 73, rain: 1.5, cl: 0.9, T: -2, w: 10, g: 14 }, storm: { code: 95, rain: 5, cl: 1, T: 8, w: 40, g: 60 }, fog: { code: 45, cl: 0.8, T: 3, w: 2, g: 4 } };
const SCENES = [
  { name: 'dawn-hall', hour: 7, wx: 'clear', look: [60, 40, 70, -40, 15, 0] },
  { name: 'noon-clear', hour: 12, wx: 'clear', look: [60, 40, 70, -40, 15, 0] },
  { name: 'dusk-snow', hour: 16.5, wx: 'snow', look: [60, 40, 70, -40, 15, 0] },
  { name: 'night-gate', hour: 23, wx: 'clear', look: [86, 7, 8, 71.5, 3.2, -0.6] },
  { name: 'night-storm', hour: 23, wx: 'storm', look: [60, 40, 70, -40, 15, 0] },
  { name: 'day-maintenance', hour: 10, wx: 'clear', look: [5, 4, -17, -2, 3, -25], js: 'D.MNT.w.on = true; D.MNT.w.t = 99;' },
  { name: 'night-valley', hour: 23, wx: 'clear', look: [10, 45, 75, 30, 10, 260], js: 'D.FXW.car0 = 0;' },
  { name: 'fog-towers', hour: 9, wx: 'fog', look: [60, 40, 70, -90, 30, -120] },
  { name: 'control-room', hour: 9, wx: 'clear', view: 'start' },
  { name: 'annunciators-trip', hour: 9, wx: 'clear', view: 'ann', js: "D.NEW.doTrip('MAN');" },
];
(async () => {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is not installed: run  npm i playwright && npx playwright install chromium'); process.exit(2); }
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/json' };
  const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); } if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port; fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H } }); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('http://127.0.0.1:' + port + '/critical.html', { waitUntil: 'load' }); await pg.waitForTimeout(5000);
  await pg.evaluate(() => new Promise(res => { const s = document.createElement('script'); s.src = 'plant.js?v=shots' + Date.now(); s.onload = () => { window.CRIT_PLANT.open(); res(); }; document.body.appendChild(s); }));
  await pg.waitForSelector('.cpnmenu', { timeout: 120000 }); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { const D = window.CRIT_PLANT._dbg; window.D = D; D.NEW.applyUnit('w4'); D.NEW.atPowerStart(); D.NEW.begin(); });
  await pg.waitForTimeout(2000);
  for (const sc of SCENES) {
    if (ONLY && sc.name !== ONLY) continue;
    await pg.evaluate(({ sc, wx }) => {
      D.ADM.time(sc.hour); const w = wx[sc.wx]; if (w) { D.WXL.d = Object.assign({ T: 8, w: 6, g: 9, rain: 0, cl: 0.2, code: 0 }, w); D.WXL.t = Date.now(); try { D.WXL.apply(true); } catch (e) {} }
      if (sc.view) { const C = D.CAM; C.free = false; D.goView(sc.view, true); } else { const [fx, fy, fz, tx, ty, tz] = sc.look, C = D.CAM; C.free = true; C.x = fx; C.y = fy; C.z = fz; C.yaw = Math.atan2(-(tx - fx), -(tz - fz)); C.pitch = Math.atan2(ty - fy, Math.hypot(tx - fx, tz - fz)); C.tw = null; C.fov = 65; }
      if (sc.js) (0, eval)(sc.js);
    }, { sc, wx: WX });
    await pg.waitForTimeout(6000); await pg.screenshot({ path: path.join(OUT, sc.name + '.png') }); console.log('saved', sc.name + '.png');
  }
  await b.close(); srv.close();
  if (errs.length) { console.error('Page errors:\n' + errs.slice(0, 10).join('\n')); process.exit(1); }
})();
