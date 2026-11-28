const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
console.log(await p.evaluate(()=>{const A=__T().symAll();const by={};A.forEach(r=>by[r.tr]=(by[r.tr]||0)+1);const lam=A.filter(r=>r.s==='λ').map(r=>r.tr+': '+r.ms);return 'all symbols: '+A.length+' '+JSON.stringify(by)+'\nλ meanings: '+[...new Set(lam)].join(' | ')+'\nwith numbers: '+A.filter(r=>r.v).slice(0,5).map(r=>r.s+'='+r.v.txt).join(', ')}));
const seq=async(id)=>p.evaluate((id)=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();const r=P.cards.map(c=>c.w==='symMeet'?'MEET('+c.par.r.s+')':c._symk?'Q':c.t).join(' ');const qs=P.cards.filter(c=>c._symk).map(c=>c.p.replace(/<[^>]+>/g,'')+' ['+c.o.map(x=>x.replace(/<[^>]+>/g,'')).join(' / ')+'] ans='+c.o[c.a].replace(/<[^>]+>/g,''));closePlayer();return r+'\n  '+qs.join('\n  ')},id);
console.log('qm1-1-1:',await seq('qm1-1-1'));console.log('qm1-1-3:',await seq('qm1-1-3'));
// meet screen
await p.evaluate(()=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id==='qm1-1-1'){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(c=>c.w==='symMeet'&&c.par.r.s==='λ');t.showCard()});await p.waitForTimeout(400);
const cv=await p.$('.symcv');if(cv){const bb=await cv.boundingBox();await p.mouse.move(bb.x+bb.width/2-30,bb.y+30);await p.mouse.down();for(let i=0;i<12;i++)await p.mouse.move(bb.x+bb.width/2-30+i*5,bb.y+30+i*10);await p.mouse.up()}
await p.screenshot({path:SP+'/sym_meet.png'});await p.evaluate(()=>closePlayer());
// finish a lesson -> deck; then a nuclear lesson with lambda = decay constant shows warning
console.log(await p.evaluate(()=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id==='qm1-1-1'){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.length;t.finish();closePlayer();const x=t.symMem();return 'deck after lesson: '+Object.keys(x.syms).map(k=>x.syms[k].s).join(',')}));
const lamLesson=await p.evaluate(()=>{const t=__T(),A=t.symAll().filter(r=>r.s==='λ'&&r.tr!=='qm');return A.length?A[0].lid:null});console.log('other λ lesson',lamLesson);
if(lamLesson){await p.evaluate((id)=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(c=>c.w==='symMeet'&&c.par.r.s==='λ');t.showCard()},lamLesson);await p.waitForTimeout(300);console.log('warn:',await p.evaluate(()=>(document.querySelector('.symwarn')||{}).textContent));await p.screenshot({path:SP+'/sym_warn.png'});await p.evaluate(()=>closePlayer())}
// review
console.log(await p.evaluate(()=>{const t=__T(),x=t.symMem();Object.keys(x.syms).forEach(k=>x.syms[k].due='2020-01-01');t.lxSet(x);t.symReview();const P=t.P();const n=P.cards.length;P._miss[P._keys[0]]=1;t.finish();const y=t.symMem();return 'review cards '+n+'; boxes '+P._keys.map(k=>y.syms[k].b).join(',')+' | '+document.querySelector('#pBody').innerText.replace(/\n+/g,' ')}));
await p.evaluate(()=>{closePlayer();showPage('review')});await p.waitForTimeout(300);console.log('review card:',await p.evaluate(()=>(document.querySelector('#symRev')||{}).textContent));
await p.evaluate(()=>{__T().S.mode='qm';showPage('learn');[...document.querySelectorAll('.tlbtn')].find(b=>/Symbols/.test(b.textContent)).click()});await p.waitForTimeout(300);await p.screenshot({path:SP+'/sym_list.png'});
console.log('errs',errs);await b.close()})();
