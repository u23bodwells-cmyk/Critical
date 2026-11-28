const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
console.log(await p.evaluate(()=>{const t=__T();t.S.mode='qm';t.UNITS.forEach((u,ui)=>{if(t.trk(ui)==='qm'&&(u.level||1)<=2)t.S.done[u.lessons[0].id]=1});t.save();showPage('learn');
 const bs=[...document.querySelectorAll('#page-learn .umix button[data-a=exam]')];return bs.length+' sheet buttons: '+bs.slice(0,2).map(x=>x.textContent+(x.disabled?'(off)':'')).join(', ')}));
await p.evaluate(()=>{const b=document.querySelector('#page-learn .umix button[data-a=exam]:not([disabled])');b.scrollIntoView();b.click()});await p.waitForTimeout(500);
console.log(await p.evaluate(()=>document.querySelector('#pBody').innerText.slice(0,400).replace(/\n+/g,' | ')));
await p.screenshot({path:SP+'/ex1.png'});console.log('errs',errs);await b.close()})();
