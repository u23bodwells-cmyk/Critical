const {chromium}=require('playwright');const path=require('path'),fs=require('fs');const ROOT=require('path').resolve(__dirname,'..','..'),SP=process.argv[2]||require('path').join(ROOT,'tests','.out');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
await ctx.route('http://critical.test/**',r=>{const u=new URL(r.request().url());let f=path.join(ROOT,decodeURIComponent(u.pathname));if(!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.fulfill({status:404,body:''});const ext=path.extname(f),ct={'.html':'text/html','.js':'application/javascript','.txt':'text/plain','.json':'application/json'}[ext]||'application/octet-stream';r.fulfill({status:200,contentType:ct,body:fs.readFileSync(f)})});
await ctx.route(/^https?:\/\/(?!critical\.test)/,r=>r.abort());
let p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const W=ms=>p.waitForTimeout(ms);
const unlock=async()=>{await p.evaluate(()=>{document.documentElement.classList.remove('cglock');document.querySelectorAll('#modal.open').forEach(m=>{const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()})})};
const idb=async(key)=>p.evaluate(k=>new Promise(res=>{const r=indexedDB.open('critical_backup',1);r.onupgradeneeded=()=>r.result.createObjectStore('snap');r.onsuccess=()=>{const q=r.result.transaction('snap').objectStore('snap').get(k);q.onsuccess=()=>res(q.result?{at:q.result.at,xp:q.result.xp,done:q.result.done,keys:Object.keys(q.result.data).length}:null);q.onerror=()=>res('err')};r.onerror=()=>res('openerr')}),key);
await p.goto('http://critical.test/critical.html');await W(3500);await unlock();
const full=await p.evaluate(()=>localStorage.getItem('critical_state'));
await ctx.addInitScript(full=>{try{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');const s=JSON.parse(full);s.xp=4321;s.done=Object.assign({},s.done,{tb1:1,tb2:1});localStorage.setItem('critical_state',JSON.stringify(s))}if(localStorage.getItem('test_wipe')){localStorage.removeItem('test_wipe');localStorage.removeItem('critical_state')}}catch(e){}},full);
await p.close();const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push(e.message));p=p2;
await p.goto('http://critical.test/critical.html');await W(6500);await unlock();
console.log('dbg:',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('critical_state')||'null');return 'xp='+(s&&s.xp)+' done='+(s&&s.done?Object.keys(s.done).length:'-')}));
console.log('1. backup latest:',JSON.stringify(await idb('latest')),'| today:',JSON.stringify(await idb('d-'+new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())));
console.log('   persist asked:',await p.evaluate(()=>navigator.storage&&navigator.storage.persisted?navigator.storage.persisted():'n/a'));
// 2. lose progress
await p.evaluate(()=>{localStorage.setItem('test_wipe','1')});await p.reload();await W(6500);await unlock();
console.log('2. dialog:',await p.evaluate(()=>{const o=document.querySelector('.tlov');return o?o.innerText.replace(/\n+/g,' / ').slice(0,260):'none'}));
await p.screenshot({path:SP+'/bk_dialog.png'});
await p.evaluate(()=>{const b=document.querySelector('.tlov [data-b=r]');b&&b.click()});await W(6000);await unlock();
console.log('   after restore xp:',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('critical_state')||'{}');return s.xp+' done '+Object.keys(s.done||{}).length}));
// 3. review card + panel
await p.evaluate(()=>{document.querySelector('.tab[data-p=review]').click()});await W(600);console.log('3. card:',await p.evaluate(()=>(document.querySelector('#bkRev')||{}).innerText));
await p.evaluate(()=>document.querySelector('#bkRev button').click());await W(800);console.log('   panel:',await p.evaluate(()=>document.querySelector('.tlov').innerText.replace(/\n+/g,' / ').slice(0,400)));await p.screenshot({path:SP+'/bk_panel.png'});
// 4. save failure
await p.evaluate(()=>{document.querySelector('.tlov .tlx').click();const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='critical_state'){const e=new Error('QuotaExceededError');e.name='QuotaExceededError';throw e}return o.call(this,k,v)};document.querySelector('.tab[data-p=learn]').click()});
await p.evaluate(()=>{const t=[...document.querySelectorAll('.tab')].find(x=>x.dataset.p==='go');t.click();const b=document.querySelector('.goopt');b&&b.click()});await W(1500);
console.log('4. toast:',await p.evaluate(()=>[...document.querySelectorAll('.toast,.tst,[class*=toast]')].map(x=>x.innerText).join(' | ').slice(0,200)),'| emergency:',JSON.stringify(await idb('emergency')));
console.log('errs',errs.slice(0,5));await b.close()})();
