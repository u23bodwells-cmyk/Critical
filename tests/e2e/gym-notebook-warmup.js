const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban').forEach(x=>x.remove()));
const W=ms=>p.waitForTimeout(ms);
// 1. gym: units session, answer first wrong then right
for(const sec of ['units','which','pow','rearr']){await p.evaluate(s=>__T().gymGo(s),sec);await W(300);
 const info=await p.evaluate(()=>{const P=__T().P();return P.mode+' '+P.cards.length+' '+P.cards.map(c=>c.t+(c.w?'.'+c.w:'')).join('')});console.log('gym',sec,info);
 await p.screenshot({path:SP+'/gym_'+sec+'.png'});
 // answer wrong on first card
 if(sec==='units'||sec==='which'){await p.evaluate(()=>{const P=__T().P(),c=P.cards[0];const bs=[...document.querySelectorAll('#pBody .opt')];const wrong=bs.find(b=>b.innerHTML!==c.o[c.a]);wrong.click();});await W(200);const ch=document=>0;await p.evaluate(()=>{const b=document.getElementById('pBtn');if(b&&/Check/.test(b.textContent))b.click()});await W(300)}
 if(sec==='pow'){await p.evaluate(()=>{const P=__T().P(),c=P.cards[0];const i=[...document.querySelectorAll('#pBody input')].find(x=>x.type!=='range');i.value=String(c.a*1000);i.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('pBtn').click()});await W(300)}
 if(sec==='rearr'){const r=await p.evaluate(async()=>{const P=__T().P(),c=P.cards[0],it=c.par;let log=[];const ops=()=>[...document.querySelectorAll('#pBody .rrop')];
   // click one wrong then the right ones
   let w=ops().find(b=>b.textContent!==it.s[0][0]);w.click();await new Promise(r=>setTimeout(r,50));log.push(document.querySelector('.rrfb').textContent.slice(0,40));
   for(const st of it.s){ops().find(b=>b.textContent===st[0]).click();await new Promise(r=>setTimeout(r,50))}log.push(document.querySelector('.rrlines').innerText.replace(/\n/g,' | '));document.getElementById('pBtn').click();return log.join(' // ')});console.log('rearr:',r);await p.screenshot({path:SP+'/gym_rearr_done.png'})}
 await p.evaluate(()=>closePlayer());}
console.log('notebook:',await p.evaluate(()=>__T().nbList().map(e=>e.ty+' | '+e.src+' | given='+e.given).join('\n  ')));
// 2. lesson N wrong -> notebook
await p.evaluate(()=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id==='qm1-1-1'){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(c=>c.t==='N');t.showCard();const c=P.cards[P.i];const i=[...document.querySelectorAll('#pBody input')].find(x=>x.type!=='range');i.value=String(c.a*c.a);i.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('pBtn').click()});await W(300);
console.log('after lesson N:',await p.evaluate(()=>{const L=__T().nbList();const e=L[L.length-1];return e.ty+' | '+e.src+' | '+e.p.replace(/<[^>]+>/g,'').slice(0,60)}));await p.evaluate(()=>closePlayer());
// 3. notebook overlay
await p.evaluate(()=>__T().nbOpen());await W(300);await p.screenshot({path:SP+'/nb.png'});console.log('nb top:',await p.evaluate(()=>(document.querySelector('.nbtop')||{}).innerText));
// retry
await p.evaluate(()=>document.querySelector('.nbgo').click());await W(300);console.log('retry session:',await p.evaluate(()=>{const P=__T().P();return P.mode+' '+P.cards.length+' '+P.cards.map(c=>c._nbid?'nb':'x').join(',')}));await p.evaluate(()=>closePlayer());
// 4. warm-up (make some symbols due)
console.log('warm:',await p.evaluate(()=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id==='qm1-1-3'){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.length;t.finish();closePlayer();const x=t.symMem();Object.keys(x.syms).forEach(k=>x.syms[k].due='2020-01-01');t.lxSet(x);const X=t.lxGet();(X.nb||[]).forEach(e=>e.at-=86400000);Object.keys(X.ideas||{}).forEach(k=>X.ideas[k].due='2020-01-01');Object.keys(X.syms||{}).forEach(k=>X.syms[k].due='2020-01-01');t.lxSet(X);
 const r=t.warmGo();const Q=t.P();return r+' '+Q.title+' '+Q.cards.map(c=>c._symk?'sym':c._nbid?'nb':c._unit?'unit':c._wf?'which':c.t).join(',')}));await W(300);await p.screenshot({path:SP+'/warm.png'});await p.evaluate(()=>closePlayer());

// 5. cheat sheet, research, month, projects, review cards
await p.evaluate(()=>{__T().S.mode='qm';showPage('learn')});await W(300);console.log('tools row:',await p.evaluate(()=>document.querySelector('.tlrow').innerText.replace(/\n/g,' ')));
await p.evaluate(()=>__T().cheatOpen('qm'));await W(300);console.log('cheat:',await p.evaluate(()=>document.querySelectorAll('.chr').length+' symbols, '+document.querySelectorAll('.chq').length+' formulas'));await p.screenshot({path:SP+'/cheat.png'});
await p.evaluate(()=>{__T().S.others=[{n:'Oxford research project',d:5,m:45,w:'',l:''}];__T().save();__T().resOpen('Oxford research project')});await W(300);
await p.evaluate(()=>{document.querySelector('.rsadd').click()});await W(200);await p.evaluate(()=>{const t=document.querySelector('[data-s=t]');t.value='IAEA reactor basics';t.dispatchEvent(new Event('input'));const s=document.querySelector('[data-s=sum]');s.value='Reactors split atoms. The heat boils water. Steam spins a turbine.';s.dispatchEvent(new Event('input'));const o=document.querySelector('[data-k=out]');o.value='My question is how fission makes power and why it matters for the future.';o.dispatchEvent(new Event('input'))});await W(600);
console.log('research:',await p.evaluate(()=>document.querySelector('.rsn').textContent+' | '+document.querySelector('.rsw').textContent+' | saved='+JSON.stringify(__T().S.research).slice(0,120)));await p.screenshot({path:SP+'/research.png'});
await p.evaluate(()=>__T().monOpen());await W(300);console.log('month:',await p.evaluate(()=>document.querySelector('.tlbody').innerText.replace(/\n+/g,' | ').slice(0,300)));await p.screenshot({path:SP+'/month.png'});
await p.evaluate(()=>{const t=__T();t.UNITS.forEach((u,ui)=>{if(t.trk(ui)==='qm'&&(u.level||1)===1)u.lessons.forEach(l=>t.S.done[l.id]=1)});t.save();t.projsOpen()});await W(300);console.log('projects:',await p.evaluate(()=>[...document.querySelectorAll('.pjb')].map(b=>b.querySelector('.pji').textContent+' '+b.querySelector('b').textContent).join(' / ')));
await p.evaluate(()=>[...document.querySelectorAll('.pjb')].find(b=>/quantum/i.test(b.textContent)).click());await W(300);await p.screenshot({path:SP+'/project.png'});
console.log('project detail:',await p.evaluate(()=>{document.querySelectorAll('[data-r]').forEach(c=>{c.checked=true;c.dispatchEvent(new Event('change'))});const ta=document.querySelector('.pjt');ta.value=('word ').repeat(160);ta.dispatchEvent(new Event('input'));document.querySelector('.pjdone').click();return document.querySelector('.pjdone').textContent}));
await p.evaluate(()=>{document.querySelector('.tlov .tlx').click();showPage('review')});await W(400);console.log('review cards:',await p.evaluate(()=>(document.querySelector('#moreRev')||{}).innerText.replace(/\n+/g,' | ')));await p.screenshot({path:SP+'/review.png',fullPage:false});
// plan others block
console.log('others block:',await p.evaluate(()=>{PLAN.open('plan');document.querySelectorAll('.pldays button')[5].click();const blk=[...document.querySelectorAll('.plblks .plblk')].find(e=>/Others/.test(e.textContent));return blk?blk.innerText.replace(/\n+/g,' | ').slice(0,200):'none'}));
console.log('errs',errs);await b.close()})();
