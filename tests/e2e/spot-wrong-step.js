const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
// all SPOT lessons exist and card gets inserted
console.log(await p.evaluate(()=>{const t=__T();let ok=0,bad=[];t.UNITS.forEach((u,ui)=>u.lessons.forEach((l,li)=>{if(!/^(mq|qm)/.test(l.id))return;}));return 1}));
const r=await p.evaluate(()=>{const t=__T();const ids=['qm2-2-1','mq19-2-1','qm6-4-1','mq16-2-3'];return ids.map(id=>{let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));if(ui==null)return id+' MISSING';t.startLesson(ui,li);const P=t.P();const k=P.cards.findIndex(c=>c.w==='spotStep');const res=id+' at '+k+'/'+P.cards.length+' next='+(P.cards[k+1]||{}).w+'/'+(P.cards[k+1]||{}).t;closePlayer();return res})});
console.log(r.join('\n'));
const r2=await p.evaluate(async()=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id==='qm2-2-1'){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(c=>c.w==='spotStep');t.showCard();await new Promise(r=>setTimeout(r,300));
 const st=document.querySelectorAll('.spst');st[0].click();document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,300));const m1=document.querySelector('#pBody').innerText.slice(-200);
 return st.length+' steps; after wrong: '+m1.replace(/\n/g,' ')});
console.log(r2);await p.screenshot({path:SP+'/sp1.png'});
const r3=await p.evaluate(async()=>{const st=document.querySelectorAll('.spst');st[2].click();document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,400));return document.querySelector('#pBody').innerText.slice(-250).replace(/\n/g,' ')+' | btn='+document.getElementById('pBtn').textContent});
console.log(r3);await p.screenshot({path:SP+'/sp2.png'});
console.log('errs',errs);await b.close()})();
