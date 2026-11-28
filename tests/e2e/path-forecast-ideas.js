const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,400)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban').forEach(x=>x.remove()));
const card=async()=>p.evaluate(()=>{PLAN.open('plan');const c=document.querySelector('.plpath');return c?[...c.querySelectorAll('.plpf,.plpg,.plpw summary,.plpw p')].map(e=>e.textContent).join(' | '):'NO CARD'});
console.log('A fresh:',await card());
// do quantum lessons properly through finish() to test log + ideas
const T=()=>0;
await p.evaluate(()=>{const t=__T();let n=0;t.UNITS.forEach((u,ui)=>{if(t.trk(ui)==='qm'&&(u.level||1)===1)u.lessons.forEach(l=>{if(n<6){t.S.done[l.id]=1;t.plogAdd('qm');n++}})});t.save()});
await p.waitForTimeout(4200);console.log('B 6 lessons:',await card());
// set a goal
await p.evaluate(()=>{document.querySelector('.plpath [data-a=goal]').click()});
await p.evaluate(()=>{const F=document.querySelector('.plpgf');F.querySelector('[data-f=n]').value='qm4';F.querySelector('[data-f=d]').value='2027-01-10';F.querySelector('[data-f=s]').click()});
await p.waitForTimeout(300);console.log('C goal qm4 by Jan:',await card());
await p.evaluate(()=>{const c=document.querySelector('.plpath');c&&c.scrollIntoView()});await p.screenshot({path:SP+'/pt2a.png'});
// Real lesson finish via player
await p.evaluate(()=>{PLAN.close&&PLAN.close();document.querySelectorAll('#modal.open button').forEach(()=>{})});
const r=await p.evaluate(()=>{const t=__T();let ui=-1,li=-1;t.UNITS.forEach((u,i)=>{if(ui<0&&t.trk(i)==='qm'&&(u.level||1)===2){ui=i;li=0}});
 t.startLesson(ui,li);const P=t.P();P.i=P.cards.length;try{t.finish()}catch(e){return 'ERR '+e.message}const id=t.UNITS[ui].lessons[li].id;return {done:!!t.S.done[id],idea:!!t.ideaMem().ideas[id],log:JSON.stringify(t.S.pathLog)}});
console.log('D finish:',JSON.stringify(r));
// make ideas due and review
const r2=await p.evaluate(()=>{const t=__T();try{closePlayer()}catch(e){}const x=t.ideaMem();let k=0;t.UNITS.forEach((u,ui)=>{if(t.trk(ui)==='qm'&&(u.level||1)===1)u.lessons.forEach(l=>{if(k<6){x.ideas[l.id]={b:0,due:'2020-01-01',at:0};k++}})});t.lxSet(x);
 const due=t.ideasDue().length;t.ideaReview();const P=t.P();return {due,mode:P.mode,cards:P.cards.length,kinds:P.cards.map(c=>c.t).join('')}});
console.log('E review:',JSON.stringify(r2));
await p.waitForTimeout(300);await p.screenshot({path:SP+'/pt2b.png'});
const r3=await p.evaluate(()=>{const t=__T(),P=t.P();P._miss[P._lids[0]]=1;t.finish();const x=t.ideaMem();return P._lids.map(l=>x.ideas[l].b+'@'+x.ideas[l].due).join(' ')+' :: '+document.querySelector('#pBody').textContent.slice(0,120)});
console.log('F after review:',r3);
await p.evaluate(()=>{closePlayer();showPage('review')});await p.waitForTimeout(300);
console.log('G review page:',await p.evaluate(()=>{const c=document.querySelector('#ideaRev');return c?c.textContent:'none'}));
// plan for Others day + pathrev + ideas catchup
console.log('H plan path:',await p.evaluate(()=>{const x=__T().ideaMem();Object.keys(x.ideas).forEach(k=>x.ideas[k].due='2020-01-01');__T().lxSet(x);return 1}));
await p.waitForTimeout(4200);
console.log('H plan path block:',await p.evaluate(()=>{PLAN.open('plan');const c=document.querySelector('.plpath');return c?c.textContent.slice(0,200):'none'}));
console.log('errs',errs.slice(0,5));await b.close()})();
