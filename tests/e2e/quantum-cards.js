const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE/.test(m.text()))errs.push('console: '+m.text())});
const closeModals=async()=>{for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}};
await p.goto('file://'+SP+'/qm_copy.html');await p.waitForTimeout(2500);await closeModals();
console.log(await p.evaluate(()=>{const T=__T();const qs=T.UNITS.map((u,i)=>[u,i]).filter(x=>T.trk(x[1])==='qm');return 'quantum units: '+qs.length+' | lessons: '+qs.reduce((a,x)=>a+x[0].lessons.length,0)+' | cards: '+qs.reduce((a,x)=>a+x[0].lessons.reduce((b,l)=>b+l.cards.length,0),0)+' | unit tests: '+qs.filter(x=>T.TESTS[x[0].id]).length+' | drills: '+qs.reduce((a,x)=>a+x[0].lessons.filter(l=>l.cards.some(c=>c.t==='W'&&c.w==='calcDrill')).length,0)}));
// learn page
await p.evaluate(()=>{const b=document.querySelector('.msb[data-m=qm]');b.click()});await p.waitForTimeout(400);await p.screenshot({path:SP+'/qm_learn.png'});
console.log('hero:',await p.evaluate(()=>document.querySelector('#page-learn .hero h1').textContent),'| level picker:',await p.evaluate(()=>[...document.querySelectorAll('.lvb')].map(x=>x.textContent).join(' / ')));
// step through every card of every quantum lesson
const res=await p.evaluate(async()=>{const T=__T(),out=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 for(let ui=0;ui<T.UNITS.length;ui++){if(T.trk(ui)!=='qm')continue;for(let li=0;li<T.UNITS[ui].lessons.length;li++){T.startLesson(ui,li);await sleep(30);const P=T.P();
  for(let i=0;i<P.cards.length;i++){try{T.show(i);await sleep(15);const err=document.querySelector('#pBody .w .small');if(err&&/couldn't load/.test(err.textContent))out.push(T.UNITS[ui].lessons[li].id+' card '+i+': '+err.textContent)}catch(e){out.push(T.UNITS[ui].lessons[li].id+' card '+i+': '+e.message)}}
  try{closePlayer()}catch(e){document.querySelector('#player .pclose,#pClose')&&0}}}return out});
console.log('card problems:',res.length?res.join('\n'):'none');
console.log('errors:',errs.length?[...new Set(errs)].slice(0,10).join('\n'):'none');await b.close()})();
