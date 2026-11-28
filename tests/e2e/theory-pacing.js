const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/pace_copy.html');await p.waitForTimeout(2500);for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click();else m.classList.remove('open')}});await p.waitForTimeout(300)}console.log('modal open:',await p.evaluate(()=>!!document.querySelector('#modal.open')));
const info=await p.evaluate(()=>{const T=__T(),G=T.glossBuild();const ks=Object.keys(G);const ui=T.UNITS.findIndex(u=>u.title==='Controlling the reactor');const u=T.UNITS[ui];
 // mark everything up to this lesson done
 T.UNITS.forEach((x,i)=>{if(i<ui)x.lessons.forEach(l=>T.S.done[l.id]=1)});T.S.done[u.lessons[0].id]=1;T.save();
 T.startLesson(ui,1);return 'glossary terms: '+ks.length+' | sample: '+ks.slice(0,6).map(k=>G[k].t+' = '+G[k].d.slice(0,70)).join(' || ')});
console.log(info);await p.waitForTimeout(500);
const step=async(nm)=>{const s=await p.evaluate(()=>({btn:document.getElementById('pBtn').textContent,skip:getComputedStyle(document.getElementById('pSkip')).display!=='none'?document.getElementById('pSkip').textContent:'',body:document.getElementById('pBody').innerText.replace(/\n+/g,' / ').slice(0,260),terms:[...document.querySelectorAll('#pBody .pcterm')].map(x=>x.textContent).join(',')}));console.log(nm,JSON.stringify(s));};
const shot=async nm=>p.screenshot({path:SP+'/'+nm+'.png'});
await step('S');await p.evaluate(()=>document.getElementById('pSkip').click());await p.waitForTimeout(300);
for(let g=0;g<12;g++){const ty=await p.evaluate(()=>__T().P().cards[__T().P().i].t);if(ty==='T')break;await step('card '+ty);const i0=await p.evaluate(()=>__T().P().i);
 for(let h=0;h<4;h++){await p.evaluate(()=>{if(document.querySelector('#pBody .opt.sel,#pBody .opt.right'))return;const c=__T().P().cards[__T().P().i],bs=[...document.querySelectorAll('#pBody .opt')];let o=c.o?bs.find(x=>x.innerHTML===c.o[c.a]):null;if(!o)o=bs.find(x=>!x.classList.contains('wrong'));o&&o.click()});await p.waitForTimeout(150);await p.evaluate(()=>{const b=document.getElementById('pBtn');if(!b.disabled)b.click()});await p.waitForTimeout(250);if(await p.evaluate(i0=>__T().P().i!==i0,i0))break}}
await step('T1 start');await shot('pc_t1a');
await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(400);await step('T1 bit2');
await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(400);await step('T1 bit3');await shot('pc_t1b');
await p.evaluate(()=>{const t=document.querySelector('#pBody .pcterm');t&&t.click()});await p.waitForTimeout(300);
await p.evaluate(()=>document.getElementById('pSkip').click());await p.waitForTimeout(500);await step('notsure');
await p.evaluate(()=>{document.querySelector('.pchelp').scrollIntoView()});await shot('pc_help');
console.log('cards now:',await p.evaluate(()=>__T().P().cards.map(c=>c.t+(c._again?'(again)':'')+(c._auto?'*':'')).join(' ')));
await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(400);await step('next');
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
