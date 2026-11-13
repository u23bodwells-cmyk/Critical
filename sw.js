const C='critical-net3',F=['./','./index.html','./critical.html','./shift-ready.html','./aptitude.html','./control-room.html','./career.html','./practicals.html','./screens.html','./split.html','./gate.js','./arena.js','./plant.js','./vendor/three.min.js','./vendor/GLTFLoader.js','./models/hand-right.glb','./models/arm-right.glb','./models/aurora.jpg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./app/part-0.txt','./app/part-1.txt','./app/part-2.txt','./app/part-3.txt','./app/part-4.txt','./app/part-5.txt','./app/part-6.txt','./app/part-7.txt','./app/part-8.txt','./app/part-9.txt','./app/part-10.txt','./app/part-11.txt','./app/part-12.txt','./app/part-13.txt','./app/part-14.txt'];
/* Network first: always try to get the newest file, so an update shows up on the very next load.
   The saved copy is only used when the network fails or is too slow (offline, school Wi-Fi dropping out),
   and a file is only saved once it has downloaded completely, so a dropped connection never leaves a half-downloaded (blank) page. */
const WAIT=5000;
async function grab(req){const r=await fetch(req,{cache:'no-store'});if(!r.ok)throw 0;const b=await r.clone().arrayBuffer();const n=+r.headers.get('content-length');if(n&&!r.headers.get('content-encoding')&&b.byteLength<n)throw 0;await (await caches.open(C)).put(req,new Response(b,{status:r.status,headers:r.headers}));return r}
self.addEventListener('install',e=>{e.waitUntil((async()=>{await Promise.allSettled(F.map(u=>grab(new Request(u))))})());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith((async()=>{const c=await caches.open(C),net=grab(e.request);
   /* exact match only while online-ish; the version-blind match is a last resort when offline */
   const saved=()=>c.match(e.request).then(h=>h||(u.pathname.indexOf('/app/')<0?c.match(e.request,{ignoreSearch:true}):null));
   try{return await Promise.race([net,new Promise((_,no)=>setTimeout(()=>no(0),WAIT))])}
   catch(_){const h=await saved();if(h){e.waitUntil(net.catch(()=>{}));return h}try{return await net}catch(__){return (await c.match('./index.html'))||Response.error()}}})())});
