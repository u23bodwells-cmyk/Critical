const C='critical-swr',F=['./','./index.html','./critical.html','./shift-ready.html','./aptitude.html','./control-room.html','./career.html','./practicals.html','./screens.html','./split.html','./gate.js','./arena.js','./plant.js','./vendor/three.min.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
/* Serve the saved copy straight away and refresh it in the background, so a dropped connection can never leave a half-downloaded (blank) page.
   A file is only saved once it has downloaded completely. */
async function grab(req){const r=await fetch(req,{cache:'no-store'});if(!r.ok)throw 0;const b=await r.clone().arrayBuffer();const n=+r.headers.get('content-length');if(n&&!r.headers.get('content-encoding')&&b.byteLength<n)throw 0;await (await caches.open(C)).put(req,new Response(b,{status:r.status,headers:r.headers}));return r}
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(C);for(const k of await caches.keys()){if(k===C)continue;const o=await caches.open(k);for(const q of await o.keys()){if(!(await c.match(q))){const r=await o.match(q);if(r)await c.put(q,r)}}}
  await Promise.allSettled(F.map(u=>grab(new Request(u))))})());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith((async()=>{const c=await caches.open(C);const hit=await c.match(e.request)||await c.match(e.request,{ignoreSearch:true});const net=grab(e.request);
   if(hit){e.waitUntil(net.catch(()=>{}));return hit}try{return await net}catch(_){return (await c.match('./index.html'))||Response.error()}})())});
