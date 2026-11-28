const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/mq_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
console.log(await p.evaluate(()=>{const T=__T();const us=T.UNITS.filter(u=>u.track==='calc'&&u.level>=15);let bad=[],n=0;
 // run every generator 40 times and check it returns sensible questions
 Object.keys(T.CGEN).filter(k=>k.startsWith('m_')).forEach(k=>{for(let i=0;i<40;i++){n++;try{const q=T.CGEN[k]();if(!q||!q.p)throw new Error('no prompt');if(q.b){q.b.forEach(x=>{if(!isFinite(x.a))throw new Error('answer '+x.a)})}else if(!q.o||q.o.length<2)throw new Error('no options')}catch(e){if(bad.length<6)bad.push(k+': '+e.message);break}}});
 return 'new calculus units: '+us.length+' | lessons: '+us.reduce((a,u)=>a+u.lessons.length,0)+' | unit tests: '+us.filter(u=>T.TESTS[u.id]).length+' | lessons with drills: '+us.reduce((a,u)=>a+u.lessons.filter(l=>l.cards.some(c=>c.t==='W'&&c.w==='calcDrill')).length,0)+'\ngenerators: '+Object.keys(T.CGEN).filter(k=>k.startsWith('m_')).length+', runs: '+n+', problems: '+(bad.length?bad.join('; '):'none')}));
const res=await p.evaluate(async()=>{const T=__T(),out=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 for(let ui=0;ui<T.UNITS.length;ui++){const u=T.UNITS[ui];if(u.track!=='calc'||u.level<15)continue;for(let li=0;li<u.lessons.length;li++){T.startLesson(ui,li);await sleep(25);const P=T.P();
  for(let i=0;i<P.cards.length;i++){try{T.show(i);await sleep(12);const err=document.querySelector('#pBody .w .small');if(err&&/couldn't load/.test(err.textContent))out.push(u.lessons[li].id+' card '+i+': '+err.textContent)}catch(e){out.push(u.lessons[li].id+' card '+i+': '+e.message)}}try{closePlayer()}catch(e){}}}return out});
console.log('card problems:',res.length?res.join('\n'):'none');
await p.evaluate(()=>{const T=__T();T.S.mode='calc';T.S.lvl=T.S.lvl||{};T.S.lvl.calc=15;T.S.lvlOpen=T.S.lvlOpen||{};for(let i=15;i<=21;i++)T.S.lvlOpen['calc'+i]=1;T.save();showPage('learn');T.renderLearn()});await p.waitForTimeout(400);
console.log('levels:',await p.evaluate(()=>[...document.querySelectorAll('.lvb')].slice(14).map(x=>x.querySelector('span').textContent).join(' | ')));
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
