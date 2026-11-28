const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban').forEach(x=>x.remove()));
const pathBlock=async()=>p.evaluate(()=>{PLAN.open('plan');const d=(new Date().getDay()+6)%7;document.querySelectorAll('.pldays button')[d].click();const blk=[...document.querySelectorAll('.plblks .plblk')].find(e=>/Quantum & maths path/.test(e.textContent));return blk?blk.querySelector('.plt').textContent+' :: '+blk.querySelector('.plh').textContent:'NO PATH BLOCK'});
const doneLevel=async(t,lv,frac)=>p.evaluate(([t,lv,frac])=>{const T=__T();T.UNITS.forEach((u,ui)=>{if(T.trk(ui)===t&&(u.level||1)===lv){const L=u.lessons;const n=Math.ceil(L.length*frac);u.lessons.forEach((l,i)=>{if(i<n)T.S.done[l.id]=1})}});T.save()},[t,lv,frac]);
// make sure each level has all its lessons counted (mark by fraction of the whole level)
const doneLv=async(t,lv)=>p.evaluate(([t,lv])=>{const T=__T();T.UNITS.forEach((u,ui)=>{if(T.trk(ui)===t&&(u.level||1)===lv)u.lessons.forEach(l=>T.S.done[l.id]=1)});T.save()},[t,lv]);
console.log('1. fresh:',await pathBlock());
await doneLv('qm',1);await doneLv('qm',2);await p.waitForTimeout(4200);
console.log('2. after Quantum 1-2:',await pathBlock());
for(let lv=1;lv<=4;lv++)await doneLv('calc',lv);await p.waitForTimeout(4200);
console.log('3. after Calculus 1-4:',await pathBlock());
await doneLv('calc',15);await doneLv('calc',16);await p.waitForTimeout(4200);
console.log('4. after Calculus 15-16:',await pathBlock());
await p.evaluate(()=>{__T().S.pathTurn=1;__T().save()});await p.waitForTimeout(4200);
console.log('5. same, next turn (mixing):',await pathBlock());
// catch-up: lots of mistakes
await p.evaluate(()=>{const T=__T();let n=0;T.UNITS.forEach(u=>u.lessons.forEach(l=>{if(!T.S.done[l.id])return;l.cards.forEach((c,ci)=>{if((c.t==='Q'||c.t==='N')&&n<15){T.S.wrong[l.id+'#'+ci]=1;n++}})}));T.save()});await p.waitForTimeout(4200);
console.log('6. with 15 mistakes:',await pathBlock());
await p.evaluate(()=>{const c=document.querySelector('.plpath');c&&c.scrollIntoView({block:'start'})});await p.waitForTimeout(200);await p.screenshot({path:SP+'/path_card.png'});
await p.evaluate(()=>{const d=document.querySelector('.plpath details');d.open=true;d.scrollIntoView({block:'start'})});await p.waitForTimeout(200);await p.screenshot({path:SP+'/path_list.png'});
// Go button runs the catch-up
await p.evaluate(()=>document.querySelector('.plpath .plgo').click());await p.waitForTimeout(600);
console.log('7. Go opened:',await p.evaluate(()=>{const P=__T().P();return P?P.mode+' with '+P.cards.length+' cards':'nothing'}));
// setting
await p.evaluate(()=>{try{closePlayer()}catch(e){}PLAN.open('smt')});await p.waitForTimeout(200);
console.log('8. setting value:',await p.evaluate(()=>document.querySelector('[data-k=pathm]').value));
await p.evaluate(()=>{const s=document.querySelector('[data-k=pathm]');s.value='2';s.onchange()});
console.log('9. at 20 min:',await pathBlock());
await p.evaluate(()=>{PLAN.open('smt');const s=document.querySelector('[data-k=pathm]');s.value='0';s.onchange()});
console.log('10. off:',await pathBlock());
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
