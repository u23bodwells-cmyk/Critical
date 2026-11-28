const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
// mark some lessons done so mix/ghost have material
await p.evaluate(()=>{const T=__T();const u=T.UNITS.find(x=>x.id==='gp2-1');u.lessons.forEach(l=>T.S.done[l.id]=1);T.save()});
await p.evaluate(()=>PLAN.open('plan'));await p.waitForTimeout(300);
const days=await p.evaluate(()=>{const out=[];const bs=[...document.querySelectorAll('.pldays button')];bs.forEach((bt,i)=>{bt.click();out.push(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]+' '+document.querySelector('[data-k=dt]').textContent+': '+[...document.querySelectorAll('.plblks .plblk .plt')].map(x=>x.textContent).join(' | '))});return out.join('\n')+'\nweek: '+document.querySelector('[data-k=wk]').textContent});
console.log(days);
await p.evaluate(()=>{const bs=[...document.querySelectorAll('.pldays button')];bs[(new Date().getDay()+6)%7].click()});
await p.screenshot({path:SP+'/sm_plan.png'});
await p.evaluate(()=>document.querySelector('.plseg [data-v=smt]').click());await p.waitForTimeout(200);
await p.screenshot({path:SP+'/sm_tab.png'});await p.screenshot({path:SP+'/sm_tab_full.png',fullPage:false});
console.log('seg labels:',await p.evaluate(()=>[...document.querySelectorAll('.plseg button')].map(x=>x.textContent+'('+x.getBoundingClientRect().height|0+')').join(',')));
// migration: toggle off, tick block 0+1 on Monday, toggle on
await p.evaluate(()=>{const c=document.querySelector('[data-k=smon]');c.checked=false;c.onchange()});
await p.evaluate(()=>{const S=__T().S;S.plan.t={'0-0':1,'0-1':1,'2-0':1,'2-1':1,'2-2':1};__T().save()});
await p.evaluate(()=>{PLAN.open('smt')});
await p.evaluate(()=>{const c=document.querySelector('[data-k=smon]');c.checked=true;c.onchange()});
console.log('ticks after on:',await p.evaluate(()=>JSON.stringify(__T().S.plan.t)+' sm='+__T().S.plan.sm));
// school day
await p.evaluate(()=>document.querySelector('.plseg [data-v=day]').click());await p.waitForTimeout(150);
console.log('day rows:',await p.evaluate(()=>[...document.querySelectorAll('.pldl .pldr')].map(x=>x.textContent).join(' | ')));
// break overlay standalone
await p.evaluate(()=>{PLAN.open('smt')});await p.evaluate(()=>document.querySelector('.smnow [data-a=brk]').click());await p.waitForTimeout(2200);
await p.screenshot({path:SP+'/sm_break.png'});
console.log('break:',await p.evaluate(()=>document.querySelector('.brkov')&&document.querySelector('.brkov').innerText.replace(/\n+/g,' / ')));
await p.evaluate(()=>document.querySelector('.brkx').click());
// mix + ghost from tab
await p.evaluate(()=>{PLAN.open('smt')});await p.evaluate(()=>document.querySelector('.smnow [data-a=mix]').click());await p.waitForTimeout(600);
console.log('mix opened player:',await p.evaluate(()=>!!document.querySelector('#player.open')+' '+(document.getElementById('pTitle')||{}).textContent));
await p.evaluate(()=>{try{closePlayer()}catch(e){};const x=document.querySelector('#player.open .pclose,#pClose');if(x)x.click()});
await p.evaluate(()=>{PLAN.open('smt')});await p.evaluate(()=>document.querySelector('.smnow [data-a=ghost]').click());await p.waitForTimeout(400);
console.log('ghost opened:',await p.evaluate(()=>!!document.querySelector('.ghov')));
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
