const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2000);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
const r=await p.evaluate(()=>{const W=__T().WIDGETS,out=[];function mk(){const d=document.createElement('div');d.style.cssText='width:360px;background:#fff';document.body.appendChild(d);return d}
 function set(box,i,v){const s=box.querySelectorAll('input[type=range]')[i];s.value=v;s.dispatchEvent(new Event('input',{bubbles:true}))}
 let box=mk(),w=W.mFDiff(box,{goal:true});out.push('FDiff h=0.1: '+w.check().msg.slice(0,60));set(box,0,-5);out.push('FDiff h=1e-5: '+w.check().ok);set(box,0,-13);out.push('FDiff 1e-13: '+w.check().msg.slice(0,70));box.remove();
 box=mk();w=W.mEuler(box,{goal:true});set(box,0,0.3);out.push('Euler h=.3: '+w.check().msg.slice(0,60));box.querySelectorAll('button')[2].click();out.push('RK4 h=.3: '+w.check().ok+' '+w.check().msg.slice(0,50));box.querySelectorAll('button')[1].click();out.push('Leap h=.3: '+w.check().msg.slice(0,50));box.remove();
 box=mk();w=W.mFDEig(box,{goal:true});out.push('FDEig N=6: '+w.check().msg);set(box,0,27);out.push('N=27 '+w.check().ok);set(box,0,28);out.push('N=28 '+w.check().ok);box.remove();
 box=mk();w=W.mMC(box,{goal:true});out.push('MC d=2: '+w.check().msg.slice(0,60)+' | '+box.querySelector('.wstats,.stats')?.textContent);set(box,0,6);out.push('MC d=6: '+w.check().ok+' '+w.check().msg.slice(0,140));box.remove();
 return out.join('\n')});console.log(r);
// screenshots of widgets in lesson context
for(const [id,w] of [['mq22-2-2','mEuler'],['mq23-2-3','mMC'],['mq22-1-1','mFDiff'],['mq22-1-3','mFDEig']]){await p.evaluate(([id,w])=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(c=>c.w===w);t.showCard()},[id,w]);await p.waitForTimeout(400);await p.screenshot({path:SP+'/w_'+w+'.png'});await p.evaluate(()=>closePlayer())}
console.log('errs',errs);await b.close()})();
