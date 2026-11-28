const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban').forEach(x=>x.remove()));
for(const m of ['qm','calc','theory','maths']){
 const r=await p.evaluate((m)=>{const t=__T();t.S.mode=m;t.UNITS.forEach((u,ui)=>{if(t.trk(ui)===m&&(u.level||1)<=3)u.lessons.forEach(l=>t.S.done[l.id]=1)});t.save();showPage('learn');const row=document.querySelector('.tlrow');if(!row)return 'NO ROW';
  row.children[0].click();const g=document.querySelector('.tlov');const gl=g.querySelectorAll('.tlitem').length;const note=g.querySelector('.tlnote').textContent;g.querySelector('.tlx').click();
  row.children[1].click();const f=document.querySelector('.tlov');const fl=f.querySelectorAll('.tlf').length,keys=f.querySelectorAll('.tlkr').length,n2=f.querySelector('.tlnote').textContent;return [row.textContent,gl,note,fl,keys,n2].join(' || ')},m);
 console.log(m,':',r);await p.screenshot({path:SP+'/tl_'+m+'.png'});await p.evaluate(()=>{const x=document.querySelector('.tlov .tlx');x&&x.click()});}
await p.evaluate(()=>{__T().S.mode='qm';showPage('learn');document.querySelector('.tlrow').children[0].click()});await p.waitForTimeout(200);await p.screenshot({path:SP+'/tl_gloss.png'});
console.log('errs',errs);await b.close()})();
