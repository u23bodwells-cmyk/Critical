const C='critical-net3',F=['./','./index.html','./critical.html','./shift-ready.html','./aptitude.html','./control-room.html','./career.html','./practicals.html','./homework.html','./screens.html','./split.html','./gate.js','./arena.js','./plant.js','./vendor/three.min.js','./vendor/GLTFLoader.js','./models/hand-right.glb','./models/arm-right.glb','./models/aurora.jpg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./app/part-0.txt','./app/part-1.txt','./app/part-2.txt','./app/part-3.txt','./app/part-4.txt','./app/part-5.txt','./app/part-6.txt','./app/part-7.txt','./app/part-8.txt','./app/part-9.txt','./app/part-10.txt','./app/part-11.txt','./app/part-12.txt','./app/part-13.txt','./app/part-14.txt'];
/* Network first: always try to get the newest file, so an update shows up on the very next load.
   The saved copy is only used when the network fails or is too slow (offline, school Wi-Fi dropping out),
   and a file is only saved once it has downloaded completely, so a dropped connection never leaves a half-downloaded (blank) page. */
const WAIT=5000;
async function grab(req){const r=await fetch(req,{cache:'no-store'});if(!r.ok){const er=new Error('http');er.r=r;throw er}const b=await r.clone().arrayBuffer();const n=+r.headers.get('content-length');if(n&&!r.headers.get('content-encoding')&&b.byteLength<n)throw 0;await (await caches.open(C)).put(req,new Response(b,{status:r.status,headers:r.headers}));/* a redirected response can't answer a page load (the browser shows ERR_FAILED), so hand back a clean copy */return r.redirected?new Response(b,{status:r.status,headers:r.headers}):r}
self.addEventListener('install',e=>{e.waitUntil((async()=>{await Promise.allSettled(F.map(u=>grab(new Request(u))))})());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith((async()=>{const c=await caches.open(C),net=grab(e.request);
   /* exact match only while online-ish; the version-blind match is a last resort when offline */
   const saved=()=>c.match(e.request).then(h=>h||(u.pathname.indexOf('/app/')<0?c.match(e.request,{ignoreSearch:true}):null));
   try{return await Promise.race([net,new Promise((_,no)=>setTimeout(()=>no(0),WAIT))])}
   catch(_){const h=await saved();if(h){e.waitUntil(net.catch(()=>{}));return h}
    /* nothing saved: never answer with a hard failure ("This site can't be reached"). Wait for the network, try once more plainly, and for a page load fall back to the saved front page or a small page that retries by itself */
    try{return await net}catch(x){
      for(let i=0;i<2;i++){try{const r=await fetch(e.request.url,{credentials:'same-origin'});if(r.ok||i)return r.redirected?new Response(await r.blob(),{status:r.status,headers:r.headers}):r}catch(__){}await new Promise(ok=>setTimeout(ok,900))}
      if(e.request.mode==='navigate'){const p=(await c.match(e.request,{ignoreSearch:true}))||(await c.match('./index.html'));if(p)return p;
        return new Response('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Critical</title><body style="font:16px system-ui;background:#0b0f14;color:#e8eef4;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><p>Can\u2019t reach Critical right now (the site may be updating).</p><p>Trying again in a few seconds\u2026</p></div><script>setTimeout(function(){location.reload()},4000)</script>',{status:503,headers:{'content-type':'text/html;charset=utf-8'}})}
      if(x&&x.r)return x.r;return Response.error()}}})())});
