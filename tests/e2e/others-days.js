const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(200)}
const t=await p.evaluate(()=>(new Date().getDay()+6)%7),tom=(t+1)%7;
const blocks=()=>p.evaluate(()=>document.querySelector('[data-k=dn]').textContent+' ('+document.querySelector('[data-k=dt]').textContent+'): '+[...document.querySelectorAll('.plblks .plblk:not(.smnight) .plt')].map(x=>x.textContent).join(' | '));
await p.evaluate(()=>PLAN.open('plan'));await p.waitForTimeout(300);
// add an Others day for tomorrow
await p.evaluate(()=>document.querySelector('.plx2o [data-a=add]').click());
await p.evaluate(d=>{const F=document.querySelector('.plx2f');F.querySelector('[data-f=n]').value='Oxford research project';F.querySelector('[data-f=d]').value=String(d);F.querySelector('[data-f=m]').value='45';F.querySelector('[data-f=w]').value='Read two sources and write notes on each.';F.querySelector('[data-f=l]').value='example.org/oxford'},tom);
await p.evaluate(()=>{document.querySelector('.plx2f').scrollIntoView({block:'center'})});await p.screenshot({path:SP+'/oth_form.png'});
await p.evaluate(()=>document.querySelector('.plx2f [data-f=save]').click());await p.waitForTimeout(300);
console.log('others day ->',await blocks());
console.log('stored:',await p.evaluate(()=>JSON.stringify(__T().S.others)));
await p.evaluate(()=>{const e=document.querySelector('.plblks .plblk');e&&e.scrollIntoView({block:'start'})});await p.screenshot({path:SP+'/oth_day.png'});
// today: free choice
await p.evaluate(t=>document.querySelectorAll('.pldays button')[t].click(),t);await p.waitForTimeout(200);
console.log('today before ->',await blocks());
await p.evaluate(()=>{const b=document.querySelector('.plx2 [data-a=free]');b?b.click():console.log('no free button')});await p.waitForTimeout(300);
console.log('today free ->',await blocks());
await p.evaluate(()=>{const e=document.querySelector('.plx2');e&&e.scrollIntoView({block:'center'})});await p.screenshot({path:SP+'/oth_free.png'});
// the free button is gone on other days
await p.evaluate(d=>document.querySelectorAll('.pldays button')[d].click(),(t+2)%7);await p.waitForTimeout(200);
console.log('another day note:',await p.evaluate(()=>{const n=[...document.querySelectorAll('.plx2 .plnote')].map(x=>x.textContent);return n[0]}));
// focus status on an Others day: done (so the extension doesn't lock you in)
console.log('week total:',await p.evaluate(()=>document.querySelector('[data-k=wk]').textContent));
// start the free-choice plan for today
await p.evaluate(t=>document.querySelectorAll('.pldays button')[t].click(),t);await p.evaluate(()=>{const b=document.querySelector('.plbig');b&&b.click()});await p.waitForTimeout(600);
console.log('running:',await p.evaluate(()=>localStorage.getItem('critical_plan_run')));
// undo isn't offered once started... check
// nuclear maths: pacing
await p.evaluate(()=>{try{document.querySelector('.plx').click()}catch(e){}const T=__T();const ui=T.UNITS.findIndex((u,i)=>T.trk(i)==='maths');T.UNITS.forEach((u,i)=>{if(i<=ui)u.lessons.forEach(l=>T.S.done[l.id]=1)});T.startLesson(ui,1)});await p.waitForTimeout(500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(200)}
console.log('nuclear maths cards:',await p.evaluate(()=>__T().P().cards.slice(0,5).map(c=>c.t+(c.p&&/From last lesson/.test(c.p)?'(recall)':'')).join(' ')));
await p.evaluate(()=>{const P=__T().P();P.i=P.cards.findIndex(c=>c.t==='T');document.getElementById('pSkip').click()});
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
