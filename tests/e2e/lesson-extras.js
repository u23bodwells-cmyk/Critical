const {chromium}=require('playwright');const SP=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.stack.slice(0,300)));
await p.goto('file://'+SP+'/smart_copy.html');await p.waitForTimeout(2500);
for(let k=0;k<4;k++){await p.evaluate(()=>{const m=document.querySelector('#modal.open');if(m){const bs=m.querySelectorAll('button');if(bs.length)bs[bs.length-1].click()}});await p.waitForTimeout(150)}
await p.evaluate(()=>document.querySelectorAll('.plban').forEach(x=>x.remove()));const W=ms=>p.waitForTimeout(ms);
console.log(await p.evaluate(()=>{const t=__T(),L={},U={};t.UNITS.forEach(u=>{U[u.id]=1;u.lessons.forEach(l=>L[l.id]=1)});const bad=[];Object.keys(t.MIS).forEach(k=>{if(!L[k])bad.push('MIS '+k)});Object.keys(t.LABEL).forEach(k=>{if(!L[k])bad.push('LABEL '+k)});Object.keys(t.CMAP).forEach(k=>{if(!U[k])bad.push('CMAP '+k)});Object.keys(t.LONGQ).forEach(k=>{if(!U[k])bad.push('LONGQ '+k)});return 'MIS '+Object.keys(t.MIS).length+', LABEL '+Object.keys(t.LABEL).length+', CMAP '+Object.keys(t.CMAP).length+', LONGQ units '+Object.keys(t.LONGQ).length+' bad: '+JSON.stringify(bad)}));
const seq=async id=>p.evaluate(id=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();const r=P.cards.map(c=>c.w?c.w:c._mis?'MIS':c._est?'EST':c._symk?'sq':c.t).join(' ');closePlayer();return r},id);
for(const id of ['tb2','e3b','m1'])console.log(id+':',await seq(id));
const open=async(id,pred)=>p.evaluate(([id,pred])=>{const t=__T();let ui,li;t.UNITS.forEach((u,a)=>u.lessons.forEach((l,b)=>{if(l.id===id){ui=a;li=b}}));t.startLesson(ui,li);const P=t.P();P.i=P.cards.findIndex(new Function('c','return '+pred));t.showCard();return P.i},[id,pred]);
// label diagram
await open('tb2',"c.w==='labelDia'");await W(300);await p.screenshot({path:SP+'/lab1.png'});
console.log('label:',await p.evaluate(async()=>{const P=__T().P(),D=__T().DIAS[P.cards[P.i].par.d];const spots=[...document.querySelectorAll('.ldspot')];
 for(let i=0;i<D.s.length;i++){const want=i===0?D.s[1][2]:D.s[i][2];[...document.querySelectorAll('.ldchip')].find(c=>c.textContent.replace(/^\d+: /,'')===want).click();spots[i].click()}
 document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,200));const m1=document.getElementById('pFb').innerText.slice(0,80);
 // fix: place correctly
 for(let i=0;i<D.s.length;i++){if(spots[i].classList.contains('filled'))continue;[...document.querySelectorAll('.ldchip')].find(c=>c.textContent.replace(/^\d+: /,'')===D.s[i][2]).click();spots[i].click()}
 document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,200));return m1+' || '+document.getElementById('pFb').innerText.slice(0,80)}));
await p.screenshot({path:SP+'/lab2.png'});await p.evaluate(()=>closePlayer());
// concept map
await open('tb3',"c.w==='cmap'");await W(300);
console.log('cmap:',await p.evaluate(async()=>{const P=__T().P(),m=P.cards[P.i].par;const n=[...document.querySelectorAll('.cmnode')];n[0].click();n[3].click();const f1=document.querySelector('.cmw .rcfb').textContent;for(const e of m.e){n[e[1]].click();n[e[0]].click()}document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,200));return f1+' || '+document.getElementById('pFb').innerText.slice(0,80)}));
await p.screenshot({path:SP+'/cmap.png'});await p.evaluate(()=>closePlayer());
// test out
await open('tb2',"c.w==='testOut'");await W(200);
console.log('testout:',await p.evaluate(async()=>{const P=__T().P(),qs=P.cards[P.i].par.qs;document.querySelector('.tostart').click();for(let k=0;k<3;k++){await new Promise(r=>setTimeout(r,100));const c=qs[k];[...document.querySelectorAll('.toq .opt')].find(b=>b.innerHTML===c.o[c.a]).click();await new Promise(r=>setTimeout(r,700))}const before=P.i;document.querySelector('.toq button').click();return 'jumped '+before+' -> '+P.i+' ('+(P.cards[P.i].w||P.cards[P.i].t)+')'}));
await p.evaluate(()=>closePlayer());
// estimate + rescue
await open('e3b',"c.t==='N'");await p.evaluate(()=>{const P=__T().P();P.i--;});await W(200);await p.screenshot({path:SP+'/est.png'});console.log('est:',await p.evaluate(()=>document.querySelector('#pBody').innerText.slice(0,260).replace(/\n+/g,' / ')));
const rr=await p.evaluate(async()=>{const P=__T().P();P.i=P.cards.findIndex((c,i)=>i>P.i&&c.t==='N');__T().showCard();const c=P.cards[P.i];const inp=document.querySelector('#pBody input.numin');for(let k=0;k<2;k++){inp.value=String(c.a*7);inp.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,150))}const sk=document.getElementById('pSkip');const lab=sk.style.display!=='none'?sk.textContent:'(none)';sk.click();await new Promise(r=>setTimeout(r,300));
 const w=P.cards[P.i];let log=[lab,w.w];for(let g=0;g<12;g++){const nb=[...document.querySelectorAll('.rcw button')].find(b=>/Got it|Next|Show line/.test(b.textContent));if(nb){nb.click();await new Promise(r=>setTimeout(r,80));continue}const op=document.querySelector('.rcw .rcs:last-child .rrop');if(op){op.click();await new Promise(r=>setTimeout(r,80))}}
 const fi=document.querySelector('.rcw input.numin');if(fi){fi.value=String(c.a);fi.parentNode.querySelector('button').click()}log.push(document.querySelector('.rcw').innerText.replace(/\n+/g,' / ').slice(0,500));return log.join(' || ')});console.log('rescue:',rr);await p.screenshot({path:SP+'/rescue.png'});await p.evaluate(()=>closePlayer());
// long answer
await open('gp4-3-2',"c.w==='longQ'");await W(200);console.log('longq:',await p.evaluate(async()=>{const ta=document.querySelector('.lqa');ta.value='Fission of uranium releases heat and neutrons in a chain reaction controlled by control rods. The heat boils water into steam which turns a turbine.';ta.dispatchEvent(new Event('input'));document.querySelector('.lqmark').click();await new Promise(r=>setTimeout(r,100));const s=document.querySelector('.lqsc').innerText;document.getElementById('pBtn').click();await new Promise(r=>setTimeout(r,200));return s+' || '+document.getElementById('pFb').innerText.slice(0,60)}));await p.screenshot({path:SP+'/longq.png'});await p.evaluate(()=>closePlayer());
// tts text
await open('qm1-1-3',"c.t==='T'&&/E = hf|hf/.test(c.h)");await W(200);console.log('tts:',await p.evaluate(()=>__T().ttsText().slice(0,400)));
await p.evaluate(()=>document.getElementById('pTTS').click());await W(300);await p.screenshot({path:SP+'/tts.png'});await p.evaluate(()=>closePlayer());
// unit buttons
await p.evaluate(()=>{__T().S.mode='theory';showPage('learn')});await W(300);console.log('unit buttons:',await p.evaluate(()=>[...document.querySelectorAll('.lx2b')].map(b=>b.textContent).join(', ')));
console.log('errs',errs);await b.close()})();
