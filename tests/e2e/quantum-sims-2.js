const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/qm_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
const open=async(w,match)=>p.evaluate(([w,match])=>{const T=__T();const ok=c=>c.t==='W'&&c.w===w&&(match==null?!!(c.par.goal):JSON.stringify(c.par.goal||null).indexOf(match)>=0);for(let ui=0;ui<T.UNITS.length;ui++){if(T.trk(ui)!=='qm')continue;const u=T.UNITS[ui];for(let li=0;li<u.lessons.length;li++){const l=u.lessons[li];if(l.cards.some(ok)){T.startLesson(ui,li);const P=T.P();T.show(P.cards.findIndex(ok));document.querySelectorAll('.plban').forEach(x=>x.remove());return l.title}}}return 'NOT FOUND'},[w,match]);
const setR=async(i,v)=>p.evaluate(([i,v])=>{const r=document.querySelectorAll('#pBody input[type=range]')[i];r.value=v;r.dispatchEvent(new Event('input'))},[i,v]);
const clickB=async t=>p.evaluate(t=>{const b=[...document.querySelectorAll('#pBody button')].find(x=>x.textContent.trim().startsWith(t));b&&b.click();return !!b},t);
const check=async()=>{await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(150);return p.evaluate(()=>document.getElementById('pFb').innerText.replace(/\n+/g,' ').slice(0,170))};
const shot=async nm=>{await p.evaluate(()=>{document.querySelectorAll('.plban').forEach(x=>x.remove());const w=document.querySelector('#pBody .w');w&&w.scrollIntoView({block:'start'})});await p.waitForTimeout(250);await p.screenshot({path:SP+'/'+nm+'.png'})};
const T=[
 ['qFinite','3',async()=>{await setR(0,4)}],
 ['qStep','0.1',async()=>{await setR(0,1.37)}],
 ['qFourier',null,async()=>{await setR(0,40);await setR(1,1.2)}],
 ['qBorn',null,async()=>{await setR(0,0.3);await setR(1,3)}],
 ['qPath',null,async()=>{await setR(0,-2.2)}],
 ['qCHSH',null,async()=>{await setR(0,0);await setR(1,90);await setR(2,45);await setR(3,135)}]];
for(const [w,m,fn] of T){const t=await open(w,m);await fn();await p.waitForTimeout(200);await shot('q6_'+w);console.log((w+' '+(m||'')).padEnd(18),'('+t+'):',await check())}
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
