const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>{const t=__T();t.S.mode='qm';t.save();showPage('learn');[...document.querySelectorAll('.tlbtn')].find(b=>/lab/.test(b.textContent)).click()});await p.waitForTimeout(400);
await p.screenshot({path:SP+'/ql_ho.png'});
await p.evaluate(()=>{[...document.querySelectorAll('.qlpre .wbtn')].find(b=>b.textContent==='Crystal').click()});await p.waitForTimeout(300);await p.screenshot({path:SP+'/ql_lat.png'});
// draw
await p.evaluate(()=>{[...document.querySelectorAll('.qlpre .wbtn')].find(b=>/Draw/.test(b.textContent)).click()});
const bb=await (await p.$('.qlcv')).boundingBox();await p.mouse.move(bb.x+20,bb.y+bb.height*0.3);await p.mouse.down();for(let i=0;i<=20;i++)await p.mouse.move(bb.x+20+i*(bb.width-40)/20,bb.y+bb.height*(0.3+0.6*Math.abs(Math.sin(i/3))));await p.mouse.up();await p.waitForTimeout(300);
console.log('after draw:',await p.evaluate(()=>document.querySelector('.qlinfo').textContent));
await p.evaluate(()=>{[...document.querySelectorAll('.qltabs .wbtn')][1].click();[...document.querySelectorAll('.qlpre .wbtn')].find(b=>b.textContent==='Barrier').click();[...document.querySelectorAll('.qlctl .wbtn')][0].click()});await p.waitForTimeout(2500);
await p.screenshot({path:SP+'/ql_wave.png'});console.log('wave:',await p.evaluate(()=>document.querySelector('.qlinfo').textContent));
console.log('errs',errs);await b.close()})();
