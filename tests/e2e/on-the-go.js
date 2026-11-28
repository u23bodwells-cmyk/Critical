const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban,.toast').forEach(x=>x.remove()));const W=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>document.querySelector('.tab[data-p=go]').click());await W(400);await p.screenshot({path:SP+'/go1.png'});
console.log(await p.evaluate(()=>{const t=__T();return ['theory','qm','gp','gc','gcs','ap','ac'].map(tr=>{let tot=0;t.UNITS.forEach((u,ui)=>{if(t.trk(ui)===tr)tot+=u.lessons.length});const L=t.goList(tr);return tr+': '+L.length+'/'+tot+' lessons, avg '+(L.reduce((a,x)=>a+x.n,0)/Math.max(1,L.length)).toFixed(1)+' cards'}).join(' | ')}));
console.log('subjects:',await p.evaluate(()=>[...document.querySelectorAll('.gosub')].map(b=>b.textContent).join(' / ')));
// card types and maths leakage
console.log(await p.evaluate(()=>{const t=__T();let kinds={},leak=[];['theory','qm','gp','gc','ap','ac'].forEach(tr=>t.goList(tr).forEach(x=>{const cs=t.goCards(t.UNITS[x.ui].lessons[x.li],x.ui);cs.forEach(c=>{const k=c.t+(c.w?'.'+c.w:'');kinds[k]=(kinds[k]||0)+1;const txt=(c.h||c.p||'').replace(/<[^>]+>/g,'');if(/=/.test(txt)&&/\d/.test(txt.split('=').slice(1).join('').slice(0,12))&&leak.length<8)leak.push(x.id+': '+txt.slice(0,90))})}));return JSON.stringify(kinds)+'\nleaks: '+leak.join('\n  ')}));
// play a theory lesson
await p.evaluate(()=>{const b=[...document.querySelectorAll('.gol')][1];b.click()});await W(400);await p.screenshot({path:SP+'/go2.png'});
console.log('playing:',await p.evaluate(()=>{const P=__T().P();return P.mode+' '+P.title+' '+P.cards.map(c=>c.t+(c.w?'.'+c.w:'')).join(' ')}));
await p.evaluate(async()=>{const P=__T().P();P.i=P.cards.length;__T().finish()});await W(300);await p.screenshot({path:SP+'/go3.png'});
console.log('done screen:',await p.evaluate(()=>document.querySelector('#pBody').innerText.replace(/\n+/g,' / ')));
await p.evaluate(()=>document.querySelector('.gonext').click());await W(300);console.log('next started:',await p.evaluate(()=>__T().P().title));
await p.evaluate(()=>closePlayer());await W(300);console.log('carry on:',await p.evaluate(()=>(document.querySelector('.golast')||{}).innerText));
await p.evaluate(()=>{[...document.querySelectorAll('.gosub')].find(b=>/A-level Physics/.test(b.textContent)).click()});await W(200);
await p.evaluate(()=>{[...document.querySelectorAll('.gosub')].find(b=>/Quantum/.test(b.textContent)).click()});await W(300);await p.screenshot({path:SP+'/go4.png'});
console.log('errs',errs);await b.close()})();
