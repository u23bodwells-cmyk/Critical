/* =====================================================================
   LEVELS 2–5: helpers that keep every lesson slow and connected
   ===================================================================== */
/* a "Remember" card: what this lesson builds on, restated before anything new */
function RM(html){return T('<div class="recall"><div class="rct">Remember</div>'+html+'</div>')}
/* a spaced-recall question from an earlier lesson */
function QE(p,o,a,e,hint){return Q('<span class="fromb">From earlier</span>'+p,o,a,e,hint)}
function NE(p,a,tol,u,e,hint){return N('<span class="fromb">From earlier</span>'+p,a,tol,u,e,hint)}
/* "what each part means" key under an equation */
function KY(rows,note){return '<div class="key"><div class="kt">What each part means</div>'+rows.map(function(r){return '<div class="krow"><span class="ks">'+r[0]+'</span><span class="km">'+r[1]+'</span><span class="ku">'+(r[2]||'')+'</span></div>'}).join('')+(note?'<div class="kn">'+note+'</div>':'')+'</div>'}
/* lesson with its "next up" teaser */
function LH(id,title,mins,hook,cards){HOOKS[id]=hook;return L(id,title,mins,cards)}

/* ---- reveal a worked example one step at a time ---- */
WIDGETS.stepCalc=function(box,par){var S2=par.steps,n=0,list=el('ol','u9list',null,box),r=row(box),b=btn(r,(par.btn||'Next step')+' (1 of '+S2.length+')',function(){if(n<S2.length){n++;draw()}},'pri');
 function draw(){list.innerHTML='';for(var i=0;i<n;i++){var li=el('li',i===n-1?'new':'',S2[i],list)}b.textContent=n>=S2.length?'Done':(par.btn||'Next step')+' ('+(n+1)+' of '+S2.length+')';b.disabled=n>=S2.length}
 draw();
 return {check:function(){return n>=S2.length?{ok:true}:{ok:false,msg:'Keep going: '+(S2.length-n)+' more step'+(S2.length-n===1?'':'s')+'.'}},lock:function(){b.disabled=true}}};

/* ---- match each term to its meaning ---- */
WIDGETS.matchPairs=function(box,par){var P2=par.pairs,done={},sel=-1,right=shuffle(P2.map(function(_,i){return i}));
 el('p','small',par.hint||'Tap something on the left, then its match on the right.',box);var g=el('div','mp',null,box),L2=el('div','mpcol',null,g),R2=el('div','mpcol',null,g),m=msg(box);
 var lb=P2.map(function(p,i){var b=el('button','mpi',p[0],L2);b.onclick=function(){if(done[i])return;sel=i;upd()};return b});
 var rb={};right.forEach(function(k){var b=el('button','mpi r',P2[k][1],R2);rb[k]=b;b.onclick=function(){if(done[k]||sel<0)return;if(k===sel){done[k]=1;sel=-1;m.set('')}else{b.classList.add('bad');(function(bb){setTimeout(function(){bb.classList.remove('bad')},500)})(b);m.set('Not a match. Try again.',false)}upd()}});
 function upd(){lb.forEach(function(b,i){b.classList.toggle('sel',i===sel);b.classList.toggle('done',!!done[i])});for(var k in rb)rb[k].classList.toggle('done',!!done[k])}
 return {check:function(){var n=P2.length-Object.keys(done).length;return n<=0?{ok:true}:{ok:false,msg:'Match them all first. '+n+' to go.'}},lock:function(){}}};

/* ---- a graph you can change with sliders ---- */
WIDGETS.fnPlot=function(box,par){var cv=canvas(box,par.h||240),p={},ok=false;
 (par.sl||[]).forEach(function(s){p[s[0]]=s[5];slider(box,s[1],s[2],s[3],s[4],s[5],s[6]||function(v){return v},function(v){p[s[0]]=+v;draw()})});
 var m=msg(box);function col(c){return !c?cssv('--accent'):c.charAt(0)==='-'?cssv(c):c}
 function draw(){var xr=typeof par.x==='function'?par.x(p):par.x,yr=typeof par.y==='function'?par.y(p):par.y,P=plot(cv,{x:xr,y:yr,xl:par.xl,yl:par.yl,ylog:par.ylog,xlog:par.xlog,nt:par.nt});
  (par.lines||[]).forEach(function(h){P.hline(typeof h[0]==='function'?h[0](p):h[0],col(h[1]||'--muted'))});
  par.curves(p).forEach(function(cu){P.fn(cu[0],col(cu[1]),cu[2]||2.5,cu[3]||[])});
  if(par.marks)par.marks(p,P,col);
  var g=par.goal?!!par.goal(p):false;if(g)ok=true;m.set(par.read?par.read(p):'',par.goal?(g?true:null):null)}
 onDraw(draw);draw();
 return par.goal?{check:function(){return ok?{ok:true}:{ok:false,msg:par.goalMsg||'Not yet: keep adjusting.'}},lock:function(){}}:{}};

/* ---- simple numerical simulator: step an ODE and plot it ---- */
WIDGETS.odeSim=function(box,par){var cv=canvas(box,par.h||240),p={},ok=false;
 (par.sl||[]).forEach(function(s){p[s[0]]=s[5];slider(box,s[1],s[2],s[3],s[4],s[5],s[6]||function(v){return v},function(v){p[s[0]]=+v;draw()})});
 var m=msg(box);function col(c){return !c?cssv('--accent'):c.charAt(0)==='-'?cssv(c):c}
 function draw(){var sol=par.solve(p),yr=typeof par.y==='function'?par.y(p,sol):par.y,P=plot(cv,{x:par.x,y:yr,xl:par.xl,yl:par.yl,ylog:par.ylog,nt:par.nt});
  (par.lines||[]).forEach(function(h){P.hline(typeof h[0]==='function'?h[0](p):h[0],col(h[1]||'--muted'))});
  (par.series||[[1,'--accent']]).forEach(function(se){var c=P.c;P.clip();c.strokeStyle=col(se[1]);c.lineWidth=se[2]||2.5;c.setLineDash(se[3]||[]);c.beginPath();var pen=false;sol.forEach(function(r){var v=r[se[0]];if(!isFinite(v)||(par.ylog&&v<=0)){pen=false;return}var X=P.X(r[0]),Y=Math.max(-1e4,Math.min(1e4,P.Y(v)));if(pen)c.lineTo(X,Y);else{c.moveTo(X,Y);pen=true}});c.stroke();c.setLineDash([]);P.unclip()});
  var g=par.goal?!!par.goal(p,sol):false;if(g)ok=true;m.set(par.read?par.read(p,sol):'',par.goal?(g?true:null):null)}
 onDraw(draw);draw();
 return par.goal?{check:function(){return ok?{ok:true}:{ok:false,msg:par.goalMsg||'Not yet: keep adjusting.'}},lock:function(){}}:{}};

/* ---- physics helpers used by Level 2–5 graphs ---- */
function stableN(z){var A=2*z;for(var k=0;k<30;k++)A=z*(1.98+0.0155*Math.pow(A,2/3));return A-z}
function stableZ(n){var lo=0,hi=120;for(var k=0;k<50;k++){var m=(lo+hi)/2;if(stableN(m)<n)lo=m;else hi=m}return (lo+hi)/2}
/* xenon after a trip from equilibrium full power, normalised to the full-power level (burnout rate about 3.7 x decay rate) */
function xeTrip(t){var li=Math.LN2/6.57,lx=Math.LN2/9.14,A=4.7*lx;return Math.exp(-lx*t)+A/(lx-li)*(Math.exp(-li*t)-Math.exp(-lx*t))}

/* ---- ± button beside every number box: phone decimal keypads have no minus key ---- */
(function(){
 var css=document.createElement('style');css.textContent='.sgnb{flex:none;min-width:48px;height:48px;margin-right:8px;border-radius:12px;border:2px solid var(--line);background:var(--panel);color:var(--text);font-family:var(--sans);font-size:24px;font-weight:700;line-height:1;padding:0;cursor:pointer}.sgnb:active{transform:scale(.95)}.sgnb:disabled{opacity:.4}.numrow,.sgnwrap{display:flex;align-items:center}';document.head.appendChild(css);
 function add(inp){if(inp.__sgn)return;inp.__sgn=1;var b=document.createElement('button');b.type='button';b.className='sgnb';b.textContent='±';b.setAttribute('aria-label','Make the number negative or positive');
  b.addEventListener('pointerdown',function(e){e.preventDefault()});
  b.onclick=function(){if(inp.disabled||inp.readOnly)return;var v=inp.value.trim();inp.value=/^[-−]/.test(v)?v.replace(/^[-−]\s*/,''):'-'+v;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.focus()};
  inp.parentNode.insertBefore(b,inp);
  new MutationObserver(function(){b.disabled=inp.disabled}).observe(inp,{attributes:true,attributeFilter:['disabled']})}
 function scan(root){(root.querySelectorAll?root:document).querySelectorAll('input.numin,input.ninp').forEach(add)}
 new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.matches&&n.matches('input.numin,input.ninp'))add(n);else scan(n)}})})}).observe(document.documentElement,{childList:true,subtree:true});
 scan(document);
})();

/* ---- "Ask about this": a ? button that explains whatever is on screen ---- */
(function(){
 var css=document.createElement('style');css.textContent=
 '.askpill{font-weight:800}'+
 '.pask{font-weight:800;font-size:17px;min-width:38px}'+
 '.asksheet{position:fixed;inset:0;z-index:3000;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}'+
 '.asksheet.open{display:flex}'+
 '.askbox{width:100%;max-width:640px;max-height:88vh;max-height:88dvh;display:flex;flex-direction:column;background:var(--panel);color:var(--text);border-radius:20px 20px 0 0;padding:16px 16px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25)}'+
 '@media(min-width:700px){.asksheet{align-items:center}.askbox{border-radius:20px}}'+
 '.askhd{display:flex;align-items:center;gap:8px;margin-bottom:6px}.askhd b{font-size:19px;flex:1}'+
 '.askx{border:0;background:none;color:var(--muted);font-size:22px;width:40px;height:40px;cursor:pointer}'+
 '.askctx{font-size:13px;color:var(--muted);margin-bottom:8px}'+
 '.asklog{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:40px}'+
 '.askq{margin:10px 0 6px auto;max-width:85%;width:fit-content;background:var(--accent);color:var(--on-accent);padding:9px 13px;border-radius:16px 16px 4px 16px;font-size:16px;white-space:pre-wrap}'+
 '.aska{margin:6px 0 12px;background:var(--bg);border:1px solid var(--line);padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:16px;line-height:1.5}'+
 '.aska p{margin:0 0 8px}.aska p:last-child{margin:0}.aska ul{margin:4px 0 8px;padding-left:20px}.aska.wait{color:var(--muted);font-style:italic}'+
 '.askchips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}'+
 '.askchip{border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:999px;padding:7px 12px;font:inherit;font-size:14px;cursor:pointer}'+
 '.askf{display:flex;gap:8px;align-items:flex-end}'+
 '.askf textarea{flex:1;font:inherit;font-size:16px;padding:10px 12px;border:2px solid var(--line);border-radius:14px;background:var(--bg);color:var(--text);resize:none;max-height:120px}'+
 '.askgo{flex:none;border:0;border-radius:14px;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:700;padding:12px 16px;cursor:pointer}.askgo:disabled{opacity:.5}'+
 '.asknote{font-size:13px;color:var(--muted);margin:8px 0 0}'+'.askkey{border:0;background:none;font-size:18px;width:40px;height:40px;cursor:pointer;opacity:.75}.askmodes{display:flex;gap:6px;margin:0 0 8px}.askmodes button{flex:1;font:inherit;font-size:14px;font-weight:700;padding:8px;border-radius:12px;border:2px solid var(--line);background:var(--bg);color:var(--muted);cursor:pointer}.askmodes button.on{border-color:var(--accent);color:var(--accent);background:var(--accent-bg,var(--soft))}.askkeyp{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:var(--bg)}.askkeyp p{margin:0 0 6px}.askkrow{display:flex;gap:8px}.askkrow input{flex:1;min-width:0;font:inherit;font-size:16px;padding:9px 11px;border:2px solid var(--line);border-radius:12px;background:var(--panel);color:var(--text)}.asktok{font-size:12px;color:var(--muted);margin-top:6px!important}.asklinkb{border:0;background:none;color:var(--accent);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer;padding:0 2px}.askfine{font-size:12px;color:var(--muted)}'+'.askttl{font-size:17px}.asksrc{font-size:13px;color:var(--muted);margin-top:8px!important}.askeq{font-family:var(--mono);font-size:17px;background:var(--soft);padding:8px 10px;border-radius:10px;margin:4px 0 8px;overflow-x:auto}.askacts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.askext{color:var(--accent)}.askunit{color:var(--muted)}';
 document.head.appendChild(css);

 var sh=document.createElement('div');sh.className='asksheet';sh.id='askSheet';
 sh.innerHTML='<div class="askbox" role="dialog" aria-modal="true" aria-labelledby="askT"><div class="askhd"><b id="askT">Ask about this</b><button class="askkey" type="button" aria-label="Claude API key settings" title="Claude API key">🔑</button><button class="askx" type="button" aria-label="Close">✕</button></div><div class="askmodes" hidden><button type="button" data-m="api" class="on">Ask Claude</button><button type="button" data-m="link">Quick answer (free)</button></div><div class="askkeyp" hidden><p><b>Claude API key</b></p><p class="small">Paste your key from console.anthropic.com. It\'s saved only on this device, never in the app\'s code or your save code, and is sent only to Anthropic.</p><div class="askkrow"><input type="password" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" aria-label="API key"><button type="button" class="askgo" data-k="save">Save</button></div><p class="small askkst"></p><button type="button" class="askchip" data-k="del" hidden>Remove key from this device</button></div><div class="askctx"></div><div class="asklog" aria-live="polite"></div><div class="askchips"></div><form class="askf"><textarea rows="2" placeholder="What don\'t you understand?" aria-label="Your question"></textarea><button class="askgo" type="submit">Ask</button></form><p class="asknote"></p></div>';
 document.body.appendChild(sh);
 var box=sh.querySelector('.askbox'),log=sh.querySelector('.asklog'),ctxEl=sh.querySelector('.askctx'),chips=sh.querySelector('.askchips'),form=sh.querySelector('form'),ta=sh.querySelector('textarea'),go=sh.querySelector('form .askgo'),note=sh.querySelector('.asknote');

 var sample=null,mode='wait',hist=[],lastCtx='',ctl=null,busy=false;
 var GBP=0.78;function costGBP(i,o){return (i*0.10+o*0.50)/1e6*GBP}function fmtGBP(g){var p=g*100;return p>=100?'£'+g.toFixed(2):p>=1?p.toFixed(1)+'p':p>=0.01?p.toFixed(2)+'p':p>0?p.toFixed(3)+'p':'0p'}
 var KK='critical_api_key',MODEL='claude-haiku-5-5',MAXT=350,useApi=true,usage={i:0,o:0};
 function getKey(){try{return localStorage.getItem(KK)||''}catch(_){return ''}}
 function setKey(k){try{if(k)localStorage.setItem(KK,k);else localStorage.removeItem(KK)}catch(_){}}
 try{usage=JSON.parse(localStorage.getItem('critical_api_usage')||'null')||usage}catch(_){}
 var modesEl=sh.querySelector('.askmodes'),keyP=sh.querySelector('.askkeyp'),keyIn=keyP.querySelector('input'),keySt=keyP.querySelector('.askkst'),keyDel=keyP.querySelector('[data-k=del]');
 function apiOn(){return !sample&&!!getKey()&&useApi}
 function refreshModes(){var has=!sample&&!!getKey();modesEl.hidden=!has;[].forEach.call(modesEl.children,function(b){b.classList.toggle('on',(b.dataset.m==='api')===useApi)});
  if(!sample)setMode(apiOn()?'api':'link');keyDel.hidden=!getKey();keySt.innerHTML=getKey()?'Key saved on this device.<br><b>Spent so far: about '+fmtGBP(costGBP(usage.i,usage.o))+'</b> ('+usage.i.toLocaleString('en-GB')+' tokens in, '+usage.o.toLocaleString('en-GB')+' out). <button type="button" class="asklinkb" data-k="rst">Reset</button><br><span class="askfine">Haiku 5.5: $0.10 per million tokens in, $0.50 out; £ is approximate (£1 ≈ $1.28).</span>':'No key saved yet.';var rb=keySt.querySelector('[data-k=rst]');if(rb)rb.onclick=function(){usage={i:0,o:0};try{localStorage.setItem('critical_api_usage',JSON.stringify(usage))}catch(_){}refreshModes()}}
 [].forEach.call(modesEl.children,function(b){b.onclick=function(){useApi=b.dataset.m==='api';refreshModes();if(!hist.length)drawChips()}});
 sh.querySelector('.askkey').onclick=function(){keyP.hidden=!keyP.hidden;keyIn.value='';refreshModes();if(!keyP.hidden)keyIn.focus()};
 keyP.querySelector('[data-k=save]').onclick=function(){var k=keyIn.value.trim();if(!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(k)){keySt.textContent='That doesn\'t look like an Anthropic key (it should start sk-ant-).';return}setKey(k);keyIn.value='';useApi=true;keyP.hidden=true;refreshModes();bubble('aska','<p>Key saved. Questions now go to Claude ('+MODEL+').</p>')};
 keyDel.onclick=function(){setKey('');refreshModes();keySt.textContent='Key removed from this device.'};
 function setMode(m){mode=m;go.textContent='Ask';
  note.textContent=m==='api'?'Claude Haiku, the cheapest model. Short answers to save tokens. (App version 18)':m==='live'?'Answers come from Claude using your own Claude account.':m==='link'?'Instant answers from Critical\'s own lessons, glossary and formulas. Works offline.':'';}
 setMode('link');
 if(window.claude&&typeof window.claude.use==='function'){window.claude.use('sample').then(function(s){if(s){sample=s;setMode('live');sh.querySelector('.askkey').hidden=true;modesEl.hidden=true}}).catch(function(){})}

 function txt(el,n){return el?(el.innerText||'').replace(/\n{3,}/g,'\n\n').trim().slice(0,n):''}
 function context(){
  var c=window.__crit,P=c&&c.P&&c.P(),pl=document.getElementById('player'),pb=document.getElementById('pBody');
  var inLesson=P&&pl&&getComputedStyle(pl).display!=='none'&&pb&&pb.innerText.trim();
  if(inLesson){var body=txt(pb,2600).split('\n').filter(function(l){return l.trim()!=='±'&&!/^Type a number\./.test(l)}).join('\n'),pf=document.getElementById('pFoot'),foot='';if(pf&&/\b(ok|bad|no)\b/.test(pf.className)){var cl=pf.cloneNode(true);cl.querySelectorAll('button').forEach(function(x){x.remove()});foot=(cl.textContent||'').trim().slice(0,600)}
   var title=(P.lesson&&P.lesson.title)||(P.title)||'';
   return {label:'About the card you\'re on'+(title?': '+title:''),text:'The learner is in a lesson'+(title?' ("'+title+'")':'')+'. The card on screen says:\n'+body+(foot?'\n\nFeedback shown after they answered:\n'+foot:'')}}
  var pg=document.querySelector('.page.show'),names={'page-learn':'the Learn page','page-sim':'the Control room simulator','page-review':'the Progress page','page-ref':'the Formulas page'},nm=pg?names[pg.id]||'the app':'the app';
  return {label:'About '+nm,text:'The learner is on '+nm+'. It shows:\n'+txt(pg,1800)}}

 var RULES='You are a friendly tutor inside "Critical", a nuclear engineering learning app. The learner is a UK secondary-school student working towards becoming a reactor operator at Hinkley Point C. Use British English. Explain slowly and simply, one idea at a time, and say what every symbol or technical word means. A short worked example or an everyday comparison helps. Keep answers under about 180 words unless they ask for more. Plain text only: short paragraphs, "- " bullets and **bold** are fine; no headings, no tables, no LaTeX (write maths with ordinary characters, e.g. E = mc², 3 × 10⁸). If they are in the middle of a question, help them understand and give a nudge, but only give the final answer if they clearly ask for it. Stay on science, maths, nuclear engineering and studying; if asked about something else, gently steer back.';

 function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function md(s){var out=[],list=null;esc(s).split('\n').forEach(function(l){l=l.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');var m=/^\s*[-•*]\s+(.*)/.exec(l);if(m){if(!list){list=[];}list.push('<li>'+m[1]+'</li>');return}if(list){out.push('<ul>'+list.join('')+'</ul>');list=null}if(l.trim())out.push('<p>'+l+'</p>')});if(list)out.push('<ul>'+list.join('')+'</ul>');return out.join('')}
 function bubble(cls,html){var d=document.createElement('div');d.className=cls;d.innerHTML=html;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}

 var CH=['Explain this more simply','Give me an everyday example','What do the symbols mean?','Why does this matter for an operator?'];
 function drawChips(){chips.innerHTML='';(mode==='live'||mode==='api'?CH:ctxChips()).forEach(function(q){var b=document.createElement('button');b.type='button';b.className='askchip';b.textContent=q;b.onclick=function(){ask(q)};chips.appendChild(b)})}

 var cur=null;
 function open(){refreshModes();cur=context();ctxEl.textContent=cur.label;if(cur.text!==lastCtx){hist=[];log.innerHTML='';lastCtx=cur.text}if(!hist.length)drawChips();else chips.innerHTML='';sh.classList.add('open');setTimeout(function(){ta.focus()},60)}
 function close(){sh.classList.remove('open');if(ctl)ctl.abort()}
 sh.querySelector('.askx').onclick=close;
 sh.addEventListener('click',function(e){if(e.target===sh)close()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.classList.contains('open'))close()});
 ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.onsubmit(e)}});
 form.onsubmit=function(e){e.preventDefault();var q=ta.value.trim();if(!q)return;ask(q)};

 function viaLink(q,quiet){var p=RULES+'\n\n---\n'+cur.text.slice(0,1500)+'\n---\n\nMy question: '+q;
  try{navigator.clipboard&&navigator.clipboard.writeText(p).catch(function(){})}catch(_){}
  if(!quiet)bubble('askq',esc(q));bubble('aska','<p>Opening Claude with your question… If the box is empty there, just paste.</p>');
  window.open('https://claude.ai/new?q='+encodeURIComponent(p),'_blank');ta.value=''}

 function ask(q){if(busy)return;if(!cur)cur=context();
  if(mode==='api'&&getKey()){askApi(q);return}
  if(mode!=='live'||!sample){instant(q);return}
  busy=true;go.disabled=true;ta.value='';chips.innerHTML='';bubble('askq',esc(q));var a=bubble('aska wait','Thinking…');
  hist.push({role:'user',content:q});var turns=[{role:'user',content:RULES+'\n\nWhat is on their screen right now:\n---\n'+cur.text+'\n---'}].concat(hist.slice(-7));
  ctl=new AbortController();
  sample(turns,{cache:false,signal:ctl.signal,onText:function(u){a.className='aska';a.innerHTML=md(u.text);log.scrollTop=log.scrollHeight}})
  .then(function(r){a.className='aska';a.innerHTML=md(r.text);hist.push({role:'assistant',content:r.text});if(r.truncated)bubble('asknote','<p>(Cut short. Ask for the rest.)</p>')})
  .catch(function(e){var code=e&&e.code;if(e&&e.text&&code!=='refused'){a.className='aska';a.innerHTML=md(e.text)}else a.remove();hist.pop();
   var msgs={rate_limited:'Claude is busy or you\'ve reached your usage limit. Try again in a little while.',session_expired:'Sign in to Claude again, then try once more.',refused:'Claude couldn\'t answer that. Try asking it a different way.',cancelled:''};
   if(/not_granted|sampling_disabled|not_declared|capability_disabled|capability_removed/.test(code||'')){setMode('link');bubble('asknote','<p>Answering inside the app isn\'t available here, so the Ask button now opens Claude instead.</p>')}
   else if(code!=='cancelled')bubble('asknote','<p>'+(msgs[code]||'Something went wrong. Try again.')+'</p>')})
  .then(function(){busy=false;go.disabled=false;ctl=null})}

 /* ===== instant helper: searches Critical's own content (works offline, no AI) ===== */
 var IDX=null,DF={},NDOC=0;
 var STOP={};('a an the is are was were be been being of to in on at for by with and or what whats what\'s does do did doing mean means meaning meant how why when where which who whom this that these those it its it\'s i me my you your we our can could would should will shall about explain tell give show please help understand dont don\'t get really just like than then so if into from as there their they them stand stands called call symbol word vs versus difference between thing stuff bit part one some any much many more')
  .split(' ').forEach(function(w){STOP[w]=1});
 function strip(h){var d=document.createElement('div');d.innerHTML=String(h||'');return (d.textContent||'').replace(/\s+/g,' ').trim()}
 function toks(s){s=String(s).toLowerCase().replace(/<[^>]+>/g,' ').replace(/[’']/g,'');var m=s.match(/[a-z0-9]+|[^\x00-\x7f\s.,;:!?()\[\]{}"\/\\=+×÷−–—·…%°]+/g)||[];
  return m.filter(function(w){return !STOP[w]}).map(function(w){if(w.length>5)w=w.replace(/(ity|ing|ed|e)$/,'');return w.length>4&&/[a-z]s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w})}
 function safe(node){var out='';node.childNodes.forEach(function(n){if(n.nodeType===3){out+=n.textContent.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}else if(n.nodeType===1){var t=n.tagName.toLowerCase();if(n.classList&&(n.classList.contains('key')||n.classList.contains('recall')))return;var inner=safe(n);
  if(/^(sup|sub|b|strong|i|em)$/.test(t))out+='<'+t+'>'+inner+'</'+t+'>';else if(t==='li')out+='<br>• '+inner;else if(/^(p|div|tr|ol|ul|table|br|h4)$/.test(t))out+='<br>'+inner;else if(/^(td|th)$/.test(t))out+=inner+' &nbsp;';else out+=inner}});return out}
 function tidy(h){return h.replace(/^(\s*<br>)+/,'').replace(/(<br>\s*){2,}/g,'<br>')}
 function cut(h,n){var d=document.createElement('div');d.innerHTML=h;if((d.textContent||'').length<=n)return h;var cnt=0,res='';var parts=h.split(/(<[^>]+>)/);for(var i=0;i<parts.length;i++){var p=parts[i];if(p.charAt(0)==='<'){res+=p;continue}if(cnt+p.length>n){res+=p.slice(0,Math.max(0,n-cnt)).replace(/\s+\S*$/,'')+'…';break}res+=p;cnt+=p.length}return res.replace(/<(sup|sub|b|strong|i|em)>([^<]*)$/,'<$1>$2</$1>')}
 function build(){IDX=[];var c=window.__crit,U=c&&c.UNITS?c.UNITS:[];
  function add(d){d.tt=toks(d.title);d.bt=toks(strip(d.body));IDX.push(d)}
  try{GLOSSARY.forEach(function(g){add({k:'g',title:g[0],body:g[1],w:1.7})})}catch(_){}
  try{FORMULAS.forEach(function(gr){gr[1].forEach(function(f){add({k:'f',title:f[1],body:f[0],group:gr[0],w:1.3})})})}catch(_){}
  try{UNITSHEET.forEach(function(u){add({k:'u',title:u[1]+' ('+u[0]+')',sym:u[0],body:'Unit of '+u[2]+'. '+(u[3]||''),w:1.4})})}catch(_){}
  try{PREFIXES.forEach(function(x){add({k:'u',title:x[1]+' ('+x[0]+')',sym:x[0],body:'Means × '+x[2]+': '+x[3]+'.',w:1})})}catch(_){}
  U.forEach(function(u,ui){(u.lessons||[]).forEach(function(l,li){var where={ui:ui,li:li,lid:l.id,lt:l.title,ut:u.title,lv:u.level||1,tr:u.track||'maths'};
   (l.cards||[]).forEach(function(cd){
    if(cd.t==='T'&&cd.h){var d=document.createElement('div');d.innerHTML=cd.h;if(d.querySelector('.recall'))return;
     d.querySelectorAll('.krow').forEach(function(r){var s=r.querySelector('.ks'),m=r.querySelector('.km'),un=r.querySelector('.ku');if(!s||!m)return;add(Object.assign({k:'k',title:s.innerHTML,sym:strip(s.innerHTML),body:m.innerHTML+(un&&strip(un.innerHTML)?' <span class="askunit">('+un.innerHTML+')</span>':''),w:1.25},where))});
     var head='',buf=document.createElement('div');function flush(){var b=tidy(safe(buf));if(strip(b).length>25&&!/^quick recap$/i.test(head))add(Object.assign({k:'s',title:head||l.title,body:b,w:/^key points$/i.test(head)?0.85:1},where));buf=document.createElement('div')}
     Array.prototype.slice.call(d.childNodes).forEach(function(n){if(n.nodeType===1&&/^H[23]$/.test(n.tagName)){flush();head=strip(n.innerHTML)}else buf.appendChild(n)});flush()}
    if(cd.t==='W'&&cd.par){(cd.par.pairs||cd.par.cards||[]).forEach(function(pr){if(pr&&pr.length>=2&&typeof pr[0]==='string'&&typeof pr[1]==='string')add(Object.assign({k:'d',title:pr[0],body:pr[1],w:1.2},where))})}
   })})});
  DF={};IDX.forEach(function(d){var seen={};d.tt.concat(d.bt).forEach(function(t){if(!seen[t]){seen[t]=1;DF[t]=(DF[t]||0)+1}})});NDOC=IDX.length}
 function search(q){if(!IDX)build();var qt=toks(q),qs=strip(q).toLowerCase(),c=window.__crit,P=c&&c.P&&c.P(),curL=P&&P.cards?P.cards:null;
  var symQ=(q.match(/[^\x00-\x7f\s]+[a-z0-9∞₀-₉]*|\b[A-Za-z][a-z]?[₀-₉0-9∞]*(?![a-z])/g)||[]).filter(function(x){return !/^(a|i|I|an|is|in|it|of|to|be|do|me|my|or|on|at|so|if|no|go|up|we|he|vs)$/.test(x)});
  if(!qt.length&&!symQ.length)return [];var xt=[];if(P&&P.title&&(/\b(it|this|that|these|those|they|here|why|how)\b/i.test(q)||qt.length<=1))xt=toks(P.title).filter(function(t){return qt.indexOf(t)<0});
  var res=IDX.map(function(d){var s=0,hit=0;qt.forEach(function(t){var idf=Math.log(1+NDOC/(1+(DF[t]||0))),inT=d.tt.indexOf(t)>=0,inB=d.bt.indexOf(t)>=0;if(inT||inB)hit++;s+=idf*((inT?3:0)+(inB?1:0))});xt.forEach(function(t){var idf=Math.log(1+NDOC/(1+(DF[t]||0)));s+=0.6*idf*((d.tt.indexOf(t)>=0?3:0)+(d.bt.indexOf(t)>=0?1:0))});
   if(d.sym){symQ.forEach(function(x){if(x===d.sym||x.toLowerCase()===d.sym.toLowerCase()&&x.length>1){s+=12;hit=Math.max(hit,1)}})}
   var tl=strip(d.title).toLowerCase(),qq=qt.join(' ');if(qq.length>2&&(tl===qq||tl.indexOf(qq)===0))s+=8;else if(qq.length>3&&tl.indexOf(qq)>=0)s+=4;
   s*=d.w;if(curL&&d.lid&&P.lesson_id===d.lid)s*=1.5;
   if(curL&&d.lid&&P.title===d.lt)s*=1.8;
   return {d:d,s:s,cov:qt.length?hit/qt.length:1}}).filter(function(r){return r.s>=(qt.length>=2?8:4)&&r.cov>=(qt.length>=2?0.6:0.5)});
  res.sort(function(a,b){return b.s-a.s});var out=[],seen={};res.forEach(function(r){var key=r.d.k+'|'+strip(r.d.title).toLowerCase()+'|'+strip(r.d.body).slice(0,40);if(!seen[key]&&out.length<5){seen[key]=1;out.push(r)}});return out}
 function srcLine(d){return d.lt?('From '+(d.lv>1?'Level '+d.lv+' ':'')+modeName(d.tr)+': '+d.ut+' › '+d.lt):d.k==='g'?'From the glossary':d.k==='f'?'From the formula sheet'+(d.group?' ('+d.group+')':''):'From the units sheet'}
 function showResult(r,others,q){var d=r.d,inLesson=!!(window.__crit&&window.__crit.P&&window.__crit.P());
  var h='<p class="askttl"><b>'+d.title+'</b></p>';
  if(d.k==='f')h+='<div class="askeq">'+d.body+'</div>';else h+='<p>'+cut(d.body,520)+'</p>';
  h+='<p class="asksrc">'+srcLine(d)+'</p>';
  var a=bubble('aska',h);
  var acts=document.createElement('div');acts.className='askacts';
  if(d.lt&&!inLesson){var gl=document.createElement('button');gl.type='button';gl.className='askchip';gl.textContent='Open that lesson';gl.onclick=function(){close();try{window.__crit.startLesson(d.ui,d.li)}catch(_){}};acts.appendChild(gl)}
  others.forEach(function(o){var b=document.createElement('button');b.type='button';b.className='askchip';b.innerHTML='Or: '+o.d.title;b.onclick=function(){acts.remove();showResult(o,[],q)};acts.appendChild(b)});
  var ac=document.createElement('button');ac.type='button';ac.className='askchip askext';ac.textContent='Still stuck? Ask Claude ↗';ac.onclick=function(){viaLink(q,true)};acts.appendChild(ac);
  a.appendChild(acts);log.scrollTop=log.scrollHeight}
 function instant(q){if(!cur)cur=context();ta.value='';chips.innerHTML='';bubble('askq',esc(q));var r=search(q);
  if(!r.length){var a=bubble('aska','<p>I couldn\'t find that in Critical\'s lessons. Try a single word or symbol (like <b>σ</b>, <b>MTC</b> or <b>decay heat</b>), or ask Claude.</p>');var ac=document.createElement('button');ac.type='button';ac.className='askchip askext';ac.textContent='Ask Claude ↗';ac.onclick=function(){viaLink(q,true)};var w=document.createElement('div');w.className='askacts';w.appendChild(ac);a.appendChild(w);log.scrollTop=log.scrollHeight;return}
  showResult(r[0],r.slice(1,4),q)}
 function ctxChips(){var c=window.__crit,P=c&&c.P&&c.P(),list=[];
  if(P&&P.cards){P.cards.forEach(function(cd){if(cd.t==='T'&&cd.h&&cd.h.indexOf('krow')>=0){var d=document.createElement('div');d.innerHTML=cd.h;d.querySelectorAll('.krow .ks').forEach(function(s){var t=strip(s.innerHTML);if(t&&list.indexOf(t)<0&&list.length<4)list.push(t)})}})}
  var qs=list.map(function(t){return 'What does '+t+' mean?'});
  if(qs.length<2)qs=qs.concat(['What is pcm?','What does MTC mean?','What is decay heat?','What is k?']).slice(0,4);return qs}

 var SYS='Tutor in "Critical", a UK nuclear engineering app; learner is a secondary-school student aiming to be a reactor operator. British English. Explain simply, define every symbol, under 120 words. Plain text, "- " bullets and **bold** only; maths as plain text (E = mc², 3 × 10⁸). If mid-question, nudge rather than give the answer unless asked. Stay on science, maths, nuclear and study topics.';
 function apiErr(st,body){var t=(body&&body.error&&body.error.message)||'';if(st===401)return 'That API key was rejected. Tap 🔑 to check or replace it.';if(st===403)return 'This key isn\'t allowed to do that. Check it in the Anthropic Console.';if(/credit balance/i.test(t))return 'Your API account is out of credit. Top up at console.anthropic.com.';if(st===429)return 'Too many questions at once, or a spending limit was reached. Wait a minute and try again.';if(st===529||st>=500)return 'Claude is busy right now. Try again in a moment.';if(st===404)return 'That model isn\'t available on this key ('+t+').';if(st===-1)return 'Claude didn\'t send an answer back. Try asking again.';if(st===400)return 'Claude couldn\'t accept that request: '+(t||'unknown reason')+'. Send me this message and I\'ll fix it.';return 'Error '+st+': '+(t||'no details')+'. Send me this message and I\'ll fix it.'}
 function askApi(q){busy=true;go.disabled=true;ta.value='';chips.innerHTML='';bubble('askq',esc(q));var a=bubble('aska wait','Thinking…');
  var ctxT=cur.text.replace(/\n{2,}/g,'\n').slice(0,900);
  var msgs=hist.slice(-4).map(function(m){return {role:m.role,content:m.role==='assistant'?m.content.slice(0,400):m.content}});
  msgs.push({role:'user',content:(hist.length?'':'On screen:\n'+ctxT+'\n\n')+q});if(!hist.length)hist.push({role:'user',content:'On screen:\n'+ctxT+'\n\n'+q});else hist.push({role:'user',content:q});
  if(msgs[0].role!=='user')msgs.shift();
  ctl=new AbortController();var full='',st=0;
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:ctl.signal,headers:{'content-type':'application/json','x-api-key':getKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
   body:JSON.stringify({model:MODEL,max_tokens:MAXT,thinking:{type:'disabled'},output_config:{effort:'low'},system:SYS,stream:true,messages:msgs})})
  .then(function(r){st=r.status;if(!r.ok)return r.json().catch(function(){return null}).then(function(b){throw {st:st,b:b}});
   var rd=r.body.getReader(),dec=new TextDecoder(),buf='',ui=0,uo=0,sr='';
   function pump(){return rd.read().then(function(x){if(x.done)return;buf+=dec.decode(x.value,{stream:true});var parts=buf.split('\n');buf=parts.pop();
     parts.forEach(function(line){if(line.indexOf('data:')!==0)return;var d;try{d=JSON.parse(line.slice(5))}catch(_){return}
      if(d.type==='content_block_delta'&&d.delta&&d.delta.text){full+=d.delta.text;a.className='aska';a.innerHTML=md(full);log.scrollTop=log.scrollHeight}
      else if(d.type==='message_start'&&d.message&&d.message.usage)ui=d.message.usage.input_tokens||0;
      else if(d.type==='message_delta'){if(d.usage)uo=d.usage.output_tokens||0;if(d.delta&&d.delta.stop_reason)sr=d.delta.stop_reason}
      else if(d.type==='error')throw {st:529,b:d}});return pump()})}
   return pump().then(function(){usage.i+=ui;usage.o+=uo;try{localStorage.setItem('critical_api_usage',JSON.stringify(usage))}catch(_){}
    if(!full)throw {st:-1,b:null,sr:sr};if(sr==='max_tokens'){var tn=document.createElement('p');tn.className='asktok';tn.textContent='(Cut short to save tokens. Ask "carry on" for the rest.)';a.appendChild(tn)}hist.push({role:'assistant',content:full});var u=document.createElement('p');u.className='asktok';u.textContent=(ui+uo)+' tokens · about '+fmtGBP(costGBP(ui,uo))+' · total '+fmtGBP(costGBP(usage.i,usage.o));a.appendChild(u)})})
  .catch(function(e){if(e&&e.name==='AbortError'){if(!full)a.remove();hist.pop();return}hist.pop();if(!full)a.remove();
   var msg=e&&e.st!=null?apiErr(e.st,e.b):'Couldn\'t reach Claude. Check your internet connection.';bubble('asknote','<p>'+esc(msg)+'</p>')})
  .then(function(){busy=false;go.disabled=false;ctl=null})}
 function mkBtn(cls,label){var b=document.createElement('button');b.type='button';b.className=cls;b.textContent='?';b.title='Ask about this';b.setAttribute('aria-label',label);b.onclick=open;return b}
 var pills=document.querySelector('.hdr .pills');if(pills)pills.insertBefore(mkBtn('pill askpill','Ask a question about this page'),pills.firstChild);
 var pu=document.getElementById('pUnits');if(pu)pu.parentNode.insertBefore(mkBtn('psnd pask','Ask a question about this card'),pu);
 window.__ask={model:MODEL,open:open,close:close,mode:function(){return mode},search:function(q){return search(q).map(function(r){return [r.d.k,strip(r.d.title),Math.round(r.s*10)/10,r.d.lt||'']})}};
})();

/* ---- autosave: on close/hide, every 5 minutes, and resume a half-finished lesson ---- */
(function(){
 var RK='critical_resume';
 function snap(){try{if(!P||P.finished||(P.mode!=='lesson'&&P.mode!=='follow'))return;
  var r={mode:P.mode,ui:P.ui,li:P.li,fid:P.fid,i:P.i,n:P.cards.length,title:P.title,xp:P.xp,right:P.right,asked:P.asked,combo:P.combo,best:P.best,cbonus:P.cbonus,mistakes:P.mistakes,fixed:P.fixed,keys:P.mode==='follow'?P.cards.map(function(c){return c._key}):null,ts:Date.now()};
  localStorage.setItem(RK,JSON.stringify(r))}catch(_){}}
 function clearSnap(){try{localStorage.removeItem(RK)}catch(_){}}
 function getSnap(){try{var r=JSON.parse(localStorage.getItem(RK)||'null');if(!r||Date.now()-r.ts>14*864e5){clearSnap();return null}return r}catch(_){return null}}
 function saveAll(){try{save()}catch(_){}snap()}
 /* hook the player */
 var _show=showCard;showCard=function(){_show.apply(this,arguments);snap()};
 var _close=closePlayer;closePlayer=function(){clearSnap();return _close.apply(this,arguments)};
 /* save when the app is hidden, switched away from or closed */
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')saveAll()});
 window.addEventListener('pagehide',saveAll);
 window.addEventListener('beforeunload',saveAll);
 window.addEventListener('blur',saveAll);
 /* and a backup save every 5 minutes */
 setInterval(saveAll,5*60*1000);
 /* resume */
 function resume(r){
  if(r.mode==='follow'){startFollow(r.fid);if(!P)return clearSnap();if(r.keys){var by={};P.cards.forEach(function(c){by[c._key]=c});var ord=r.keys.map(function(k){return by[k]}).filter(Boolean);if(ord.length===P.cards.length)P.cards=ord}}
  else{var u=UNITS[r.ui],l=u&&u.lessons[r.li];if(!l||l.title!==r.title)return clearSnap();P={mode:'lesson',ui:r.ui,li:r.li,cards:playCards(l),i:0,xp:0,right:0,asked:0,title:l.title,color:u.color,unit:u.title,combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
  if(!P)return;['xp','right','asked','combo','best','cbonus','mistakes','fixed'].forEach(function(k){if(typeof r[k]==='number')P[k]=r[k]});
  P.i=Math.max(0,Math.min(r.i,P.cards.length-1));showCard()}
 var css=document.createElement('style');css.textContent='.resumebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--accent-bg,var(--soft));border:2px solid var(--accent);border-radius:16px;padding:12px 14px;margin:0 0 14px}.resumebar .rt{flex:1 1 100%;font-size:15px}.resumebar .rt b{display:block;font-size:16px}.resumebar button{font:inherit;font-weight:700;border-radius:12px;padding:9px 14px;cursor:pointer}.resumebar .rgo{background:var(--accent);color:var(--on-accent);border:0}.resumebar .rno{background:none;border:1px solid var(--line);color:var(--muted)}';document.head.appendChild(css);
 var _rl=renderLearn;renderLearn=function(){var out=_rl.apply(this,arguments);try{var r=getSnap(),el=$('page-learn');if(r&&!P&&el){var b=document.createElement('div');b.className='resumebar';b.innerHTML='<div class="rt"><b>Carry on where you left off</b>'+(r.mode==='follow'?'Follow-up: ':'')+r.title+' · card '+(r.i+1)+' of '+r.n+'</div><button class="rgo" type="button">Resume</button><button class="rno" type="button">Discard</button>';b.querySelector('.rgo').onclick=function(){resume(r)};b.querySelector('.rno').onclick=function(){clearSnap();b.remove()};el.insertBefore(b,el.firstChild)}}catch(_){}return out};
})();

/* ---- daily quests that are different for each level ---- */
(function(){
 var LQ={
  1:{name:'Foundations',focus:'Build the habit: little and often.',xm:1,
     pool:[['lessons',1],['run',5],['right',10],['sim',180],['perfect',1],['review',1],['follow',1]]},
  2:{name:'A-level',focus:'Practise the maths until it feels easy.',xm:1.25,
     pool:[['lessons',2],['num',5],['run',8],['right',15],['perfect',1],['follow',1],['review',1]]},
  3:{name:'Operator training',focus:'Think like an operator: accuracy and the control room.',xm:1.5,
     pool:[['mission',1],['sim',600],['run',10],['follow',2],['fix',3],['lessons',2],['num',6]]},
  4:{name:'University 1',focus:'Longer study sessions and harder calculations.',xm:2,
     pool:[['lessons',3],['num',8],['test',1],['right',20],['run',12],['perfect',1],['fix',4]]},
  5:{name:'University 2',focus:'Exam standard: high scores under pressure.',xm:2.5,
     pool:[['test80',1],['num',10],['run',15],['lessons',3],['right',25],['fix',5],['perfect',2]]}};
 function defs(){QDEF.num=['Get {n} calculation{s} right first time','check'];QDEF.mission=['Complete a control room mission','dial'];QDEF.test=['Pass a unit test','star'];QDEF.test80=['Score 80% or more on a unit test','star'];
  QDEF.perfect=['Finish {n} lesson{s} with no mistakes','star'];QDEF.follow=['Complete {n} follow-up practice{s}','loop'];QDEF.lessons=['Finish {n} lesson{s}','book']}
 function activeLv(){try{if(P&&P.ui!=null)return {m:trk(P.ui),lv:lvOf(P.ui)}}catch(_){}return {m:curMode(),lv:curLevel()}}
 for(var _ql=6;_ql<=30;_ql++)LQ[_ql]={name:'Level '+_ql,focus:LQ[5].focus,xm:LQ[5].xm,pool:LQ[5].pool};
 function goalFor(lv){return Math.round(S.goal*(LQ[lv]||LQ[5]).xm/10)*10}
 quests=function(){defs();var t=today(),a=activeLv(),key=a.m+a.lv;S.qsets=S.qsets||{};
  if(S.quests&&S.quests.d===t&&!S.quests.key&&a.lv===1){S.quests.key=key;S.qsets[key]=S.quests}
  var q=S.qsets[key];
  if(!q||q.d!==t){var r=seedRand('q'+t+key),dc=doneCount('all'),wc=Object.keys(S.wrong||{}).length,
    pool=LQ[a.lv].pool.map(function(x){return x[0]==='num'&&a.m==='theory'?['right',x[1]*2]:x}).filter(function(x){if((x[0]==='review'||x[0]==='follow')&&!dc)return false;if(x[0]==='fix'&&wc<x[1])return false;return true}).filter(function(x,i,arr){return arr.findIndex(function(y){return y[0]===x[0]})===i}).slice();
   for(var i=pool.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),tmp=pool[i];pool[i]=pool[j];pool[j]=tmp}
   q={d:t,key:key,lv:a.lv,chest:false,list:[{k:'xp',n:goalFor(a.lv),p:0,done:false}].concat(pool.slice(0,2).map(function(x){return {k:x[0],n:x[1],p:0,done:false}}))};
   S.qsets[key]=q;for(var k in S.qsets)if(S.qsets[k].d!==t)delete S.qsets[k];save()}
  if(!q.list[0].done)q.list[0].n=goalFor(a.lv);
  S.quests=q;return q};
 /* calculation questions and unit tests count too */
 var _qp=qProg;qProg=function(k,v){_qp(k,v);try{if(k==='right'&&P&&P.cards&&P.cards[P.i]&&P.cards[P.i].t==='N')_qp('num',1)}catch(_){}};
 var _ft=finishTest;finishTest=function(){var r=_ft.apply(this,arguments);try{var u=UNITS[P.ui],st=S.tests[u.id];if(st&&st.last===today()){if(st.lastPct>=PASS_TEST)_qp('test',1);if(st.lastPct>=80)_qp('test80',1)}}catch(_){}return r};
 /* show which level the quests belong to */
 var _qc=questCard;questCard=function(){var h=_qc.apply(this,arguments),q=quests(),L=LQ[q.lv||1];
  return h.replace('<h2>Daily quests</h2>','<h2>Daily quests</h2><span class="qlv">Level '+(q.lv||1)+': '+L.name+'</span>').replace('<div id="questList">','<p class="note qfocus">'+L.focus+'</p><div id="questList">')};
 var css=document.createElement('style');css.textContent='.qlv{display:inline-block;margin-left:8px;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);background:var(--accent-bg,var(--soft));border-radius:999px;padding:3px 9px;vertical-align:3px}.qfocus{margin:-4px 0 10px}';document.head.appendChild(css);
 window.__lq=LQ;
})();

