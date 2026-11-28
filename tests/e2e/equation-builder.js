const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const closeModals=async()=>{for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(200)}};
await p.goto('file://'+SP+'/eq_copy.html');await p.waitForTimeout(2500);await closeModals();
// self-check: every equation, written exactly as shown, passes
console.log(await p.evaluate(()=>{const T=__T();let n=0,ok=0,bad=[];T.UNITS.forEach((u,ui)=>u.lessons.forEach(l=>{let q=[];try{q=T.fxLessonEqs(l,ui)}catch(e){bad.push(e.message);return}q.slice(0,2).forEach(x=>{n++;const an=T.fxAn(x.h,x.rows,{words:x.words,text:x.text,maths:x.maths});const again=T.fxAn(x.h,x.rows,{words:x.words,text:x.text,maths:x.maths});const r=T.fxJudgeT(an,again.tree);if(r.ok)ok++;else if(bad.length<6)bad.push(x.h.replace(/<[^>]+>/g,'')+' → '+r.msg)})}));return 'self-check: '+ok+'/'+n+(bad.length?'\n  '+bad.join('\n  '):'')}));
await p.evaluate(()=>{const T=__T();const F=c=>c.t==='T'&&/ρ<sub>g<\/sub>\/ρ<sub>l<\/sub>/.test(c.h||'');const ui=T.UNITS.findIndex(u=>u.lessons.some(l=>l.cards.some(F)));const li=T.UNITS[ui].lessons.findIndex(l=>l.cards.some(F));T.startLesson(ui,li)});await p.waitForTimeout(400);await closeModals();
const openRecall=async()=>{await p.evaluate(()=>{const P=__T().P();__T().show(P.cards.findIndex(c=>c.t==='E'&&c.stage==='recall'))});await p.waitForTimeout(300)};
// 1. draw
await p.evaluate(()=>{try{localStorage.removeItem('critical_eqmode')}catch(e){}});await openRecall();
const cv=await p.$('.fxpad canvas');const bb=await cv.boundingBox();
const stroke=async(pts)=>{await p.mouse.move(bb.x+pts[0][0],bb.y+pts[0][1]);await p.mouse.down();for(const q of pts.slice(1))await p.mouse.move(bb.x+q[0],bb.y+q[1],{steps:4});await p.mouse.up()};
// a rough "α = 1/..." scribble
await stroke([[40,110],[30,95],[45,85],[60,100],[70,120],[75,90]]);await stroke([[95,95],[120,95]]);await stroke([[95,108],[120,108]]);
await stroke([[200,60],[200,90]]);await stroke([[140,100],[330,100]]);await stroke([[150,130],[165,130]]);await stroke([[157,122],[157,140]]);await stroke([[180,120],[200,140],[220,120]]);
await p.screenshot({path:SP+'/dr_draw.png'});
await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(400);
await p.evaluate(()=>{const c=document.querySelector('.fxcmp');c&&c.scrollIntoView({block:'end'})});await p.screenshot({path:SP+'/dr_compare.png'});
await p.evaluate(()=>document.querySelector('.fxyes').click());await p.waitForTimeout(300);
console.log('draw result:',await p.evaluate(()=>document.getElementById('fxFb2').innerText));
// 2. build with boxes
await openRecall();await p.evaluate(()=>document.querySelector('.fxmode [data-m=build]').click());await p.waitForTimeout(200);
const key=async k=>{const ok=await p.evaluate(k=>{const bs=[...document.querySelectorAll('.fxkey')];const b=bs.find(x=>x.textContent.replace(/\s/g,'')===k||x.title.startsWith(k));if(!b)return false;b.click();return true},k);if(!ok)console.log('  no key',k)};
for(const k of ['α','=','Fraction','1','Next box ▶'.replace(/\s/g,''),'1','+','Fraction','1','−','x','Nextbox▶','x','Nextbox▶','×','Fraction','ρg','Nextbox▶'])await key(k);
await p.screenshot({path:SP+'/dr_build_mid.png'});
await key('ρl');await p.screenshot({path:SP+'/dr_build.png'});
console.log('built:',await p.evaluate(()=>document.getElementById('fxW').textContent));
await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(300);
console.log('build result:',await p.evaluate(()=>document.getElementById('fxFb2').innerText));
// a wrong build
await openRecall();for(const k of ['α','=','Fraction','x','Nextbox▶','ρg'])await key(k);await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(200);
console.log('wrong build:',await p.evaluate(()=>document.getElementById('fxFb2').innerText));
// 3. calculus
await p.evaluate(()=>{const T=__T();let hit=null;T.UNITS.forEach((u,ui)=>{if(hit||T.trk(ui)!=='calc')return;u.lessons.forEach((l,li)=>{if(hit)return;const q=T.fxLessonEqs(l,ui);if(q.length&&/∫/.test(q[0].h))hit=[ui,li]})});T.startLesson(hit[0],hit[1])});await p.waitForTimeout(400);await closeModals();
await openRecall();console.log('calc eq:',await p.evaluate(()=>{const P=__T().P();return P.cards[P.i].eqh}));
for(const k of ['∫','2x','dx','=','x','Power','2','Nextbox▶','+','C'])await key(k);
await p.screenshot({path:SP+'/dr_calc.png'});await p.evaluate(()=>document.getElementById('pBtn').click());await p.waitForTimeout(300);
console.log('calc result:',await p.evaluate(()=>document.getElementById('fxFb2').innerText));
console.log('errors:',errs.length?errs.join('\n'):'none');await b.close()})();
