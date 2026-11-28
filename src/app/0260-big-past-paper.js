/* ===== big past paper: an hour of exam-style questions written and marked by Claude. Type or handwrite your answers;
   after each one is marked, the next question goes after whatever you dropped marks on, until the time's up ===== */
var PP=(function(){
 var ART='https://claude.ai/artifact/AsFGW6Ut3XQ8tBmmUTeCq4',KK='critical_api_key',MODEL='claude-haiku-5-5',SK='critical_pp',PW=1000,PH=620,
  BOARD={gp:'AQA',gc:'AQA',gm:'Edexcel',gcs:'AQA'},SUBJ={gp:'GCSE Physics',gc:'GCSE Chemistry',gm:'GCSE Maths',gcs:'GCSE Computer Science'},
  COLS={blue:'#2f6fdb',red:'#d64545',green:'#1f9d62'};
 function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function key(){try{return localStorage.getItem(KK)||''}catch(_){return ''}}
 function ld(){try{var o=JSON.parse(localStorage.getItem(SK)||'null');return o&&o.v===1?o:null}catch(_){return null}}
 function sv(){try{if(st)localStorage.setItem(SK,JSON.stringify(st));else localStorage.removeItem(SK)}catch(_){try{if(st){var c=JSON.parse(JSON.stringify(st));c.qs.forEach(function(q){q.sk=[]});localStorage.setItem(SK,JSON.stringify(c))}}catch(__){}}}
 function hist(){if(!Array.isArray(S.pp))S.pp=[];return S.pp}
 function subjName(c){return c.subj==='own'?(c.sname||'Your subject'):SUBJ[c.subj]||'GCSE'}
 function mmss(ms){ms=Math.max(0,ms);var s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 /* text from Claude: escaped, then **bold**, x^2, simple | tables | and line breaks */
 function fmt(t){var lines=esc(t).split(/\n/),out=[],tb=[];function flush(){if(!tb.length)return;var rows=tb.filter(function(r){return !/^\|?[\s:\-|]+\|?$/.test(r)}).map(function(r){return r.replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim()})});
   out.push('<table class="pptab">'+rows.map(function(r,i){return '<tr>'+r.map(function(c){return i?'<td>'+c+'</td>':'<th>'+c+'</th>'}).join('')+'</tr>'}).join('')+'</table>');tb=[]}
  lines.forEach(function(l){if(/^\s*\|.*\|\s*$/.test(l))tb.push(l.trim());else{flush();out.push(l)}});flush();
  return out.join('\n').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\^(-?\d+)/g,'<sup>$1</sup>').replace(/\n(?!<table)/g,'<br>').replace(/<br>(<table)/g,'$1')}
 /* ----- talking to Claude (your own API key, the same one Ask uses) ----- */
 function errMsg(e){var st=e&&e.st,t=(e&&e.b&&e.b.error&&e.b.error.message)||'';
  if(st===0)return 'Couldn\'t reach Claude. Check your internet connection (school Wi-Fi sometimes blocks it).';if(st===401)return 'Your API key was rejected. Check it or add a new one below.';if(/credit balance/i.test(t))return 'Your API account is out of credit. Top up at console.anthropic.com.';
  if(st===429)return 'Too many requests, or a spending limit was reached. Wait a minute and try again.';if(st===529||st>=500)return 'Claude is busy right now. Try again in a moment.';if(st===-2)return 'Claude\'s reply came back jumbled. Try again.';if(st===-1)return 'Claude didn\'t send anything back. Try again.';return 'Something went wrong ('+(st||'?')+(t?': '+t:'')+'). Try again.'}
 function call(system,content,maxT){return fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
   body:JSON.stringify({model:MODEL,max_tokens:maxT||2400,thinking:{type:'disabled'},system:system,messages:[{role:'user',content:content}]})})
  .catch(function(){throw {st:0}})
  .then(function(r){return r.json().catch(function(){return null}).then(function(b){if(!r.ok)throw {st:r.status,b:b};
   try{var u=JSON.parse(localStorage.getItem('critical_api_usage')||'null')||{i:0,o:0};if(b&&b.usage){u.i+=b.usage.input_tokens||0;u.o+=b.usage.output_tokens||0}localStorage.setItem('critical_api_usage',JSON.stringify(u))}catch(_){}
   var t=((b&&b.content)||[]).filter(function(c){return c.type==='text'}).map(function(c){return c.text}).join('');if(!t)throw {st:-1};return t})})}
 function pj(t){var a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw {st:-2};try{return JSON.parse(t.slice(a,b+1))}catch(_){throw {st:-2}}}
 function ask(system,content,maxT,tries){return call(system,content,maxT).then(pj).catch(function(e){if(e&&e.st===-2&&!tries)return ask(system,content,maxT,1);throw e})}
 function cleanQ(q){if(!q||!Array.isArray(q.parts)||!q.parts.length)return null;var L='abcdefgh',parts=q.parts.slice(0,6).map(function(p,i){return {id:L[i],q:String(p&&p.q||'').slice(0,1500),marks:Math.max(1,Math.min(12,Math.round(+(p&&p.marks)||1))),
   scheme:(Array.isArray(p&&p.scheme)?p.scheme:[String(p&&p.scheme||'')]).map(String).filter(Boolean).slice(0,15),model:String(p&&p.model||'').slice(0,2000)}}).filter(function(p){return p.q});
  return parts.length?{title:String(q.title||'Question').slice(0,80),stem:String(q.stem||'').slice(0,2500),parts:parts}:null}
 function tot(q){return q.parts.reduce(function(a,p){return a+p.marks},0)}
 /* what Critical's own lessons say about the topics, so questions match what you've been taught */
 function notes(c){var out='';(c.lids||[]).forEach(function(id){for(var ui=0;ui<UNITS.length;ui++){var u=UNITS[ui];if(u.id===id){u.lessons.forEach(function(l){out+=lessonText(l)});return}for(var li=0;li<u.lessons.length;li++)if(u.lessons[li].id===id){out+=lessonText(u.lessons[li]);return}}});
  if(c.extra)out+='\n'+c.extra;return out.slice(0,3500)}
 function lessonText(l){var d=document.createElement('div');return '\n## '+l.title+'\n'+l.cards.filter(function(c){return c.t==='T'}).map(function(c){d.innerHTML=c.h;return (d.textContent||'').replace(/\s+/g,' ').trim()}).join('\n')}
 function sysQ(c){var b=c.subj==='own'?'UK GCSE':BOARD[c.subj]+' GCSE';return 'You write exam questions in the exact style of real '+b+' '+(c.subj==='own'?(c.sname||'')+' ':'')+(c.subj==='own'?'':subjName(c).replace('GCSE ',''))+' past papers, '+c.tier+' tier, for a UK student. British English.\n'+
  'Rules: one question at a time, worth 6 to 10 marks in total, split into 2 to 5 parts that get harder (e.g. state or define, then calculate, then explain, then a longer answer). Use real command words (State, Give, Describe, Explain, Calculate, Compare, Evaluate). '+
  'The question must work without a picture: describe any set-up in words, and give data as a small table using | pipes | if needed. For calculations give values with units; only give the equation if the real exam would (e.g. it\'s on the equation sheet). Plain-text maths, no LaTeX (use ×, ÷, ², ³, √, m/s²). '+
  'Mark scheme: one point per mark, written like a real mark scheme; for calculations list the method steps and the final answer with its unit, and say "allow" for acceptable alternatives.\n'+
  'IMPORTANT, check before you reply: the student sees ONLY the stem and the part text, with no diagram. Every part must be answerable from that alone, so state every number it needs (masses or weights, distances, positions such as "the pivot is at the 30 cm mark", values of g if needed). Never write "the diagram", "Figure 1" or "the table" unless you have written that table out. If a later part needs a value, put it in the stem.\n'+
  'Reply with ONLY this JSON: {"title":"short topic name","stem":"context before the parts, or empty","parts":[{"q":"question text","marks":2,"scheme":["mark point","mark point"],"model":"a full-marks answer"}]}'}
 function sysM(c){var b=c.subj==='own'?'GCSE':BOARD[c.subj]+' GCSE';return 'You are an experienced, fair '+b+' examiner marking a student\'s answer to one exam question. British English.\n'+
  'Marking rules: give a mark only for a mark-scheme point (or a clearly equivalent idea in other words). Ignore spelling unless it changes the science. For calculations: a correct final answer gets full marks even without working, unless the question asks for working; give method marks for correct steps; carry errors forward (a mistake early on only loses that mark). '+
  'If an image of handwritten working is attached, read it and mark it as part of the answer. Blank or "I don\'t know" gets 0.\n'+
  'Feedback for each part: at most 35 words, to the student ("you"), saying what earned marks and exactly what was missing.'}
 function askFirst(broken){var c=st,prev=c.qs.map(function(q){return q.q.title}).slice(-8);
  return ask(sysQ(c),'Topics: '+(c.topics||'anything on the course')+'\n'+(notes(c)?'What the student has been taught (stay within this level):\n'+notes(c)+'\n':'')+(prev.length?'Don\'t repeat these questions: '+prev.join('; ')+'\n':'')+(broken?'The last question you wrote was missing information the student needed, so it was thrown away:\n'+broken+'\nWrite a replacement on the same topics, and this time include every number and position needed. ':'')+(c.qs.length||broken?'Write the next question.':'Write the first question. Start with a fair one.'),1800)
   .then(function(j){var q=cleanQ(j);if(!q)throw {st:-2};return q})}
 function askMark(qi,noNext){var c=st,q=c.qs[qi],prev=c.qs.map(function(x){return x.q.title}),imgs=[],labels=[];
  q.q.parts.forEach(function(x){if(hasInk(q,x.id)){var d=png(q.pk[x.id],phFor(x));if(d){imgs.push(d);labels.push('their handwritten answer to part ('+x.id+')')}}});var w=png(q.sk);if(w){imgs.push(w);labels.push('their extra working and diagrams')}var img=imgs.length;
  var txt='QUESTION AND MARK SCHEME:\n'+JSON.stringify({stem:q.q.stem,parts:q.q.parts.map(function(p){return {id:p.id,q:p.q,marks:p.marks,scheme:p.scheme}})})+
   '\n\nSTUDENT\'S ANSWERS:\n'+q.q.parts.map(function(p){var a=(q.ans[p.id]||'').trim(),hw=hasInk(q,p.id);return '('+p.id+') '+(a||'')+(hw?(a?' + ':'')+'[handwritten: see the image for part ('+p.id+')]':'')+(!a&&!hw?'(left blank)':'')}).join('\n')+(img?'\n\nImages attached, in this order: '+labels.map(function(l,k){return 'image '+(k+1)+' = '+l}).join('; ')+'. Read the handwriting carefully and mark it as part of the answer.':'')+
   '\n\nReply with ONLY this JSON: {"parts":[{"id":"a","got":0,"feedback":"..."}],"summary":"one or two sentences on how it went","focus":"the one thing to practise next"'+
   (noNext?',"next":null}':',"next":{the next question, in this format: '+'{"title":"...","stem":"...","parts":[{"q":"...","marks":2,"scheme":["..."],"model":"..."}]}'+'}}\n\nThen write the next question for "next". Same topics ('+(c.topics||'the course')+'). Aim it at what they lost marks on here; if they got full marks, make it a bit harder or move to another part of the topics. Don\'t repeat: '+prev.join('; ')+'. Follow these question-writing rules:\n'+sysQ(c).split('\n').slice(1,4).join('\n'));
  var content=img?imgs.map(function(d){return {type:'image',source:{type:'base64',media_type:'image/png',data:d}}}).concat([{type:'text',text:txt}]):txt;
  return ask(sysM(c),content,noNext?1200:3200)}
 /* ----- writing pad, like the notes sketch pad ----- */
 function draw(g,data,W,H,ink,ph){ph=ph||PH;g.clearRect(0,0,W,H);g.lineCap='round';g.lineJoin='round';(data||[]).forEach(function(s){g.strokeStyle=COLS[s.c]||ink;g.lineWidth=Math.max(1,s.w*W/PW);g.beginPath();
   for(var k=0;k<s.p.length;k+=2){var x=s.p[k]*W/PW,y=s.p[k+1]*H/ph;if(k)g.lineTo(x,y);else g.moveTo(x,y)}if(s.p.length===2)g.lineTo(s.p[0]*W/PW+0.5,s.p[1]*H/ph+0.5);g.stroke()})}
 function png(data,ph,url){ph=ph||PH;if(!data||!data.length)return null;try{var a=document.createElement('canvas');a.width=PW;a.height=ph;draw(a.getContext('2d'),data,PW,ph,'#111',ph);var b=document.createElement('canvas');b.width=PW;b.height=ph;var g=b.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,PW,ph);g.drawImage(a,0,0);var u=b.toDataURL('image/png');return url?u:u.split(',')[1]}catch(_){return null}}
 function phFor(p){return Math.min(620,220+p.marks*60)}
 function hasInk(Q,id){return !!(Q.pk&&Q.pk[id]&&Q.pk[id].length)}
 function pad(box,data,changed,ph){ph=ph||PH;var tool={c:'ink',w:4,er:false},undo=[],cur=null;
  box.innerHTML='<div class="pptools">'+['ink','blue','red','green'].map(function(c){return '<button type="button" class="ppsw" data-c="'+c+'" aria-label="'+(c==='ink'?'Pen':c)+'" style="background:'+(COLS[c]||'var(--text)')+'"></button>'}).join('')+
   '<button type="button" class="pptb" data-w="3">Thin</button><button type="button" class="pptb" data-w="7">Thick</button><button type="button" class="pptb" data-e="1">Eraser</button><button type="button" class="pptb" data-u="1">↶ Undo</button><button type="button" class="pptb" data-x="1">Clear</button></div>'+
   '<canvas class="ppcv" aria-label="Writing pad: write or draw with your mouse, a pen or your finger"></canvas>';
  var cv=box.querySelector('canvas'),g=cv.getContext('2d');
  function ink(){return getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#111'}
  function size(){if(!cv.isConnected){window.removeEventListener('resize',size);return}var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;if(!r.width)return;cv.style.height=(r.width*ph/PW)+'px';cv.width=Math.round(r.width*d);cv.height=Math.round(r.width*ph/PW*d);paint()}
  function paint(){draw(g,cur?data.concat([cur]):data,cv.width,cv.height,ink(),ph)}
  function pt(e){var r=cv.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*PW),Math.round((e.clientY-r.top)/r.height*ph)]}
  function erase(p){var n=data.length;for(var i=data.length-1;i>=0;i--){var s=data[i];for(var k=0;k<s.p.length;k+=2){var dx=s.p[k]-p[0],dy=s.p[k+1]-p[1];if(dx*dx+dy*dy<20*20){data.splice(i,1);break}}}if(data.length!==n)paint()}
  cv.addEventListener('pointerdown',function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}undo.push(JSON.stringify(data));if(undo.length>40)undo.shift();var p=pt(e);if(tool.er){cv._er=1;erase(p);return}cur={c:tool.c,w:tool.w*(e.pointerType==='pen'&&e.pressure?0.6+e.pressure:1),p:p};paint()});
  cv.addEventListener('pointermove',function(e){if(cv._er){erase(pt(e));return}if(!cur)return;var p=pt(e),L=cur.p.length;if(Math.abs(p[0]-cur.p[L-2])+Math.abs(p[1]-cur.p[L-1])<3)return;cur.p.push(p[0],p[1]);paint()});
  function up(){if(cv._er){cv._er=0;changed();return}if(!cur)return;data.push(cur);cur=null;paint();changed()}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function sel(){[].forEach.call(box.querySelectorAll('[data-c]'),function(b){b.classList.toggle('on',!tool.er&&tool.c===b.dataset.c)});[].forEach.call(box.querySelectorAll('[data-w]'),function(b){b.classList.toggle('on',tool.w===+b.dataset.w)});box.querySelector('[data-e]').classList.toggle('on',tool.er)}
  [].forEach.call(box.querySelectorAll('[data-c]'),function(b){b.onclick=function(){tool.c=b.dataset.c;tool.er=false;sel()}});
  [].forEach.call(box.querySelectorAll('[data-w]'),function(b){b.onclick=function(){tool.w=+b.dataset.w;tool.er=false;sel()}});
  box.querySelector('[data-e]').onclick=function(){tool.er=!tool.er;sel()};
  box.querySelector('[data-u]').onclick=function(){if(!undo.length)return;var p=JSON.parse(undo.pop());data.splice(0,data.length);p.forEach(function(s){data.push(s)});paint();changed()};
  box.querySelector('[data-x]').onclick=function(){if(!data.length)return;undo.push(JSON.stringify(data));data.splice(0,data.length);paint();changed()};
  sel();window.addEventListener('resize',size);setTimeout(size,0)}
 /* ----- the paper ----- */
 var st=ld(),ov=null,tk=0,busy=false,err=null,setup=null;
 function open(){if(!ov){ov=document.createElement('div');ov.className='ppov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Big past paper');
   ov.innerHTML='<div class="ppin"><div class="pphd"><b class="ppt"></b><span class="ppclk" data-k="clk"></span><span class="ppsc" data-k="sc"></span><button type="button" class="plgo alt" data-a="pse">⏸ Pause</button><button type="button" class="plgo alt" data-a="fin">Finish paper</button><button type="button" class="plgo alt" data-a="x">Close</button></div><div class="ppbody"></div></div>';
   document.body.appendChild(ov);ov.querySelector('[data-a=x]').onclick=close;ov.querySelector('[data-a=pse]').onclick=function(){if(!st||st.phase==='done')return;if(st.paused)unpause();else st.paused=Date.now();sv();render()};ov.querySelector('[data-a=fin]').onclick=function(){if(!st||st.phase==='done')return;var b=this;if(b.dataset.sure){finish();return}b.dataset.sure=1;b.textContent='Tap again to finish';setTimeout(function(){if(b.isConnected){delete b.dataset.sure;b.textContent='Finish paper'}},3000)}}
  document.body.classList.add('noscroll');try{if(window.PLAN)PLAN.close()}catch(_){}try{REV.closeHub()}catch(_){}clearInterval(tk);tk=setInterval(tick,1000);tick()}
 function close(){if(ov){ov.remove();ov=null}document.body.classList.remove('noscroll');clearInterval(tk);setup=null;try{card()}catch(_){}}
 function left(){return st?st.ends-(st.paused||Date.now()):0}
 function unpause(){if(st&&st.paused){st.pz=(st.pz||0)+(Date.now()-st.paused);st.ends+=Date.now()-st.paused;st.paused=null}}
 function usedMs(){return Math.max(0,Math.min(st.mins*60000,(st.fin||st.paused||Date.now())-st.start-(st.pz||0)))}
 function tick(){if(!ov)return;var c=ov.querySelector('[data-k=clk]'),s=ov.querySelector('[data-k=sc]'),f=ov.querySelector('[data-a=fin]');
  var pz=ov.querySelector('[data-a=pse]');if(!st||setup){c.textContent='';s.textContent='';f.hidden=true;pz.hidden=true;return}f.hidden=st.phase==='done';
  var l=left();pz.hidden=st.phase==='done'||(l<=0&&!st.paused);pz.textContent=st.paused?'▶ Resume':'⏸ Pause';c.textContent=st.phase==='done'?'':st.paused?'⏸ '+mmss(l):l>0?'⏱ '+mmss(l):'⏱ Time\'s up';if(st.paused)return;c.classList.toggle('low',l<5*60000);var g=got();s.textContent=g[1]?'Marks: '+g[0]+'/'+g[1]:'';
  if(l<=0&&st.phase==='answer'&&!st.tw){st.tw=1;sv();var b=ov.querySelector('.ppbody'),n=document.createElement('p');n.className='ppwarn';n.textContent='Time\'s up. Finish this question and press Mark: it\'ll be your last one.';b.insertBefore(n,b.firstChild)}
  if(l<=0&&st.phase==='marked'){var nb=ov.querySelector('[data-a=next]');if(nb&&nb.dataset.k!=='end'){nb.dataset.k='end';nb.textContent='See your results →'}}}
 function got(){var g=0,m=0;(st?st.qs:[]).forEach(function(q){if(q.res){g+=q.res.got;m+=q.res.max}});return [g,m]}
 function title(){var t=ov.querySelector('.ppt');t.textContent=setup?'Big past paper':'Big past paper · '+subjName(st)+(st.topics?' · '+st.topics:'')}
 function body(h){var b=ov.querySelector('.ppbody');b.innerHTML=h;b.scrollTop=0;ov.scrollTop=0;return b}
 function render(){if(!ov)return;title();tick();if(setup)return renderSetup();
  if(st.paused&&st.phase!=='done'){var pb=body('<div class="ppload"><p class="ppqn">Paused</p><h2 style="margin:0;font:800 34px var(--mono)">'+mmss(left())+' left</h2><p class="plnote">The clock has stopped and your question is hidden until you come back.</p><button type="button" class="plbig" data-a="unp" style="max-width:320px">▶ Resume the paper</button></div>');pb.querySelector('[data-a=unp]').onclick=function(){unpause();sv();render()};return}
  if(err)return renderErr();var p=st.phase;
  if(p==='gen')return body('<div class="ppload"><span class="ppspin"></span><p>'+(st.qs.length?'Writing your next question…':'Writing your first question…')+'</p></div>');
  if(p==='marking')return body('<div class="ppload"><span class="ppspin"></span><p>Marking your answer like an examiner…</p><p class="plnote">Then it writes your next question on whatever you dropped marks on.</p></div>');
  if(p==='answer')return renderQ();if(p==='marked')return renderMarked();if(p==='done')return renderDone()}
 function qHead(q,i){return '<div class="ppqh"><span class="ppqn">Question '+(i+1)+'</span><b>'+esc(q.title)+'</b><span class="ppqm">'+tot(q)+' marks</span></div>'+(q.stem?'<div class="ppstem"><span class="ppqn">Read this first</span><div>'+fmt(q.stem)+'</div></div>':'')}
 function renderQ(){var i=st.cur,Q=st.qs[i],q=Q.q;
  if(q.stem&&!Q.read){var b0=body(qHead(q,i)+'<p class="plnote">This explains the set-up for every part of the question. Read it carefully: the numbers you need are in here.</p><div class="ppact"><button type="button" class="plbig" data-a="read">I\'ve read it, show the questions →</button></div>');b0.querySelector('[data-a=read]').onclick=function(){Q.read=1;sv();render()};return}
  var h=(left()<=0?'<p class="ppwarn">Time\'s up. Finish this question and press Mark: it\'ll be your last one.</p>':'')+qHead(q,i)+q.parts.map(function(p){return '<div class="pppart" data-part="'+p.id+'"><div class="ppq"><b>('+p.id+')</b> '+fmt(p.q)+' <span class="ppmk">['+p.marks+' mark'+(p.marks===1?'':'s')+']</span></div><div class="ppmode" role="group" aria-label="How to answer part '+p.id+'"><button type="button" data-m="t">⌨ Type</button><button type="button" data-m="w">✏️ Write</button></div><textarea class="ppans" data-p="'+p.id+'" rows="'+Math.min(8,Math.max(2,p.marks))+'" placeholder="Type your answer…" aria-label="Answer to part '+p.id+'"></textarea><div class="pppp" hidden></div></div>'}).join('')+
   '<details class="pppad"'+(Q.sk&&Q.sk.length?' open':'')+'><summary>✏️ Extra working and diagrams <span class="plnote">(it gets marked too)</span></summary><div class="ppcvbox"></div></details>'+
   '<div class="ppact"><button type="button" class="plbig" data-a="mark">Mark this question</button></div><div class="ppact"><button type="button" class="plgo alt" data-a="swap">Question missing information? Swap it</button></div>';
  var b=body(h);[].forEach.call(b.querySelectorAll('.ppans'),function(ta){ta.value=Q.ans[ta.dataset.p]||'';ta.oninput=function(){Q.ans[ta.dataset.p]=ta.value;clearTimeout(ta._t);ta._t=setTimeout(sv,400)}});
  if(!Q.sk)Q.sk=[];var pb=b.querySelector('.pppad');function mk(){if(!pb._on){pb._on=1;pad(b.querySelector('.ppcvbox'),Q.sk,function(){sv()})}}if(pb.open)mk();pb.addEventListener('toggle',function(){if(pb.open)mk()});
  if(!Q.pk)Q.pk={};if(!Q.mode)Q.mode={};var pref='t';try{pref=localStorage.getItem('critical_pp_mode')==='w'?'w':'t'}catch(_){}
  [].forEach.call(b.querySelectorAll('.pppart[data-part]'),function(el){var id=el.dataset.part,p=q.parts.filter(function(x){return x.id===id})[0],ta=el.querySelector('.ppans'),pp=el.querySelector('.pppp');if(!Q.pk[id])Q.pk[id]=[];
   function set(md,user){Q.mode[id]=md;ta.hidden=md==='w';pp.hidden=md!=='w';[].forEach.call(el.querySelectorAll('[data-m]'),function(x){x.classList.toggle('on',x.dataset.m===md);x.setAttribute('aria-pressed',x.dataset.m===md)});
    if(md==='w'&&!pp._on){pp._on=1;pad(pp,Q.pk[id],function(){sv()},phFor(p))}if(user){try{localStorage.setItem('critical_pp_mode',md)}catch(_){}sv()}}
   [].forEach.call(el.querySelectorAll('[data-m]'),function(x){x.onclick=function(){set(x.dataset.m,true)}});set(Q.mode[id]||(hasInk(Q,id)?'w':(Q.ans[id]||'').trim()?'t':pref))});
  b.querySelector('[data-a=swap]').onclick=function(){if(!this.dataset.sure){this.dataset.sure=1;this.textContent='Tap again: this question is thrown away (no marks) and you get a new one';return}swap()};
  b.querySelector('[data-a=mark]').onclick=function(){var any=q.parts.some(function(p){return (Q.ans[p.id]||'').trim()||hasInk(Q,p.id)})||Q.sk.length;if(!any&&!this.dataset.sure){this.dataset.sure=1;this.textContent='Nothing written yet. Tap again to mark it anyway';return}mark()};
  var f=b.querySelector('.ppans');if(f&&!(Q.ans.a||'').trim())setTimeout(function(){try{f.focus({preventScroll:true})}catch(_){}},60)}
 function renderMarked(){var i=st.cur,Q=st.qs[i],q=Q.q,r=Q.res,end=left()<=0||!st.next;
  var h=qHead(q,i)+'<div class="ppres '+(r.got===r.max?'full':r.got*2>=r.max?'half':'low')+'"><b>'+r.got+'/'+r.max+'</b><span>'+esc(r.summary||'')+'</span></div>'+
   q.parts.map(function(p){var pr=r.parts[p.id]||{got:0,fb:''},a=(Q.ans[p.id]||'').trim();return '<div class="pppart marked"><div class="ppq"><b>('+p.id+')</b> '+fmt(p.q)+' <span class="ppchip '+(pr.got===p.marks?'full':pr.got?'half':'low')+'">'+pr.got+'/'+p.marks+'</span></div>'+
    '<div class="ppyour"><span>Your answer</span>'+(a?esc(a).replace(/\n/g,'<br>'):hasInk(Q,p.id)?'':'<i>Nothing written'+(Q.sk&&Q.sk.length?' (see your working)':'')+'</i>')+(hasInk(Q,p.id)?'<img class="pphw" alt="Your handwritten answer to part '+p.id+'" src="'+png(Q.pk[p.id],phFor(p),1)+'">':'')+'</div>'+(pr.fb?'<p class="ppfb">'+fmt(pr.fb)+'</p>':'')+
    '<details class="ppms"><summary>Mark scheme and model answer</summary><ul>'+p.scheme.map(function(s){return '<li>'+fmt(s)+'</li>'}).join('')+'</ul>'+(p.model?'<p><b>Model answer:</b> '+fmt(p.model)+'</p>':'')+'</details></div>'}).join('')+
   (r.focus?'<p class="ppfocus">🎯 <b>Next, practise:</b> '+esc(r.focus)+'</p>':'')+
   '<div class="ppact"><button type="button" class="plbig" data-a="next"'+(end?' data-k="end"':'')+'>'+(end?'See your results →':'Next question →')+'</button></div>';
  var b=body(h);b.querySelector('[data-a=next]').onclick=function(){if(left()<=0||!st.next){finish();return}st.qs.push({q:st.next,ans:{},sk:[],res:null});st.next=null;st.cur=st.qs.length-1;st.phase='answer';sv();render()}}
 function renderDone(){var g=got(),pct=g[1]?Math.round(g[0]/g[1]*100):0,rr=48,C=2*Math.PI*rr,col=pct>=70?'var(--good-line)':pct>=50?'#EF9F27':'#e8742a',used=usedMs(),
   fo=[];st.qs.forEach(function(q){if(q.res&&q.res.focus&&q.res.got<q.res.max&&fo.indexOf(q.res.focus)<0)fo.push(q.res.focus)});
  var h='<div class="ppdone"><svg width="130" height="130" viewBox="0 0 120 120"><circle cx="60" cy="60" r="'+rr+'" fill="none" stroke="var(--soft2)" stroke-width="11"/><circle cx="60" cy="60" r="'+rr+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(C*pct/100)+' '+C+'" transform="rotate(-90 60 60)"/><text x="60" y="60" text-anchor="middle" dy=".35em" font-size="26" font-weight="800" fill="var(--text)" font-family="system-ui">'+pct+'%</text></svg>'+
   '<h2>Paper finished</h2><p class="plnote">'+esc(subjName(st))+(st.topics?' · '+esc(st.topics):'')+'</p><div class="ppstats"><div><b>'+g[0]+'/'+g[1]+'</b><span>marks</span></div><div><b>'+st.qs.filter(function(q){return q.res}).length+'</b><span>questions</span></div><div><b>'+Math.round(used/60000)+' min</b><span>time</span></div></div></div>'+
   (fo.length?'<div class="ppbox"><p class="plgt">What to work on</p><ul>'+fo.slice(-5).map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ul></div>':'')+
   '<div class="ppbox"><p class="plgt">Your questions</p>'+st.qs.filter(function(q){return q.res}).map(function(q,i){return '<div class="pprow"><span>'+(i+1)+'. '+esc(q.q.title)+'</span><b>'+q.res.got+'/'+q.res.max+'</b></div>'}).join('')+'</div>'+
   '<div class="ppact"><button type="button" class="plbig" data-a="again">Start another paper</button><button type="button" class="plgo alt" data-a="close">Close</button></div>';
  var b=body(h);b.querySelector('[data-a=close]').onclick=function(){st=null;sv();close()};b.querySelector('[data-a=again]').onclick=function(){var c=st;st=null;sv();openSetup({subj:c.subj,sname:c.sname,tier:c.tier,topics:c.topics,lids:c.lids,extra:c.extra,mins:c.mins})}}
 function renderErr(){var e=err,b=body('<div class="ppload"><p class="ppwarn">'+esc(errMsg(e.e))+'</p>'+(e.e&&e.e.st===401?keyBox():'')+'<div class="ppact"><button type="button" class="plbig" data-a="retry">Try again</button></div></div>');
  wireKey(b);b.querySelector('[data-a=retry]').onclick=function(){var f=e.f;err=null;f()}}
 function fail(f){return function(e){busy=false;if(window.console)console.error(e);err={e:e,f:f};if(st&&(st.phase==='gen'||st.phase==='marking'))st.phase=st.phase==='gen'?'gen':'answer';render()}}
 function gen(){if(busy)return;busy=true;st.phase='gen';sv();render();askFirst().then(function(q){busy=false;st.qs.push({q:q,ans:{},sk:[],res:null});st.cur=st.qs.length-1;st.phase='answer';sv();render()},fail(gen))}
 function swap(){if(busy||!st||st.phase!=='answer')return;var Q=st.qs[st.cur],bad=JSON.stringify({stem:Q.q.stem,parts:Q.q.parts.map(function(p){return p.q})}).slice(0,1500);st.qs.splice(st.cur,1);st.cur=Math.max(0,st.qs.length-1);
  busy=true;st.phase='gen';sv();render();askFirst(bad).then(function(q){busy=false;st.qs.push({q:q,ans:{},sk:[],res:null});st.cur=st.qs.length-1;st.phase='answer';sv();render()},fail(gen))}
 function mark(){if(busy)return;busy=true;var i=st.cur,Q=st.qs[i],noNext=left()<3*60000;st.phase='marking';sv();render();
  askMark(i,noNext).then(function(j){busy=false;var q=Q.q,parts={},g=0;(Array.isArray(j.parts)?j.parts:[]).forEach(function(p,k){var id=String(p&&p.id||q.parts[k]&&q.parts[k].id||'').toLowerCase().replace(/[^a-h]/g,'').slice(0,1);var qp=q.parts.filter(function(x){return x.id===id})[0];if(!qp)return;parts[id]={got:Math.max(0,Math.min(qp.marks,Math.round(+p.got||0))),fb:String(p.feedback||'').slice(0,600)}});
   q.parts.forEach(function(p){if(!parts[p.id])parts[p.id]={got:0,fb:''};g+=parts[p.id].got});Q.res={got:g,max:tot(q),parts:parts,summary:String(j.summary||'').slice(0,400),focus:String(j.focus||'').slice(0,200)};
   st.next=noNext?null:cleanQ(j.next);st.phase='marked';sv();try{if(g)addXP(g*3)}catch(_){}render();
   if(!noNext&&!st.next)askFirst().then(function(nq){st.next=nq;sv();var nb=ov&&ov.querySelector('[data-a=next]');if(nb&&left()>0){nb.dataset.k='';nb.textContent='Next question →'}},function(){})},fail(mark))}
 function finish(){if(!st)return;unpause();st.phase='done';st.fin=Date.now();var g=got(),c=st;var H=hist();if(!c.logged&&g[1]){c.logged=1;H.push({id:String(c.start),src:'critical',d:today(),s:subjName(c),t:c.topics||'',tier:c.tier,g:g[0],m:g[1],mins:Math.round(usedMs()/60000),n:c.qs.filter(function(q){return q.res}).length,qs:c.qs.filter(function(q){return q.res}).map(function(q){return {t:q.q.title,g:q.res.got,m:q.res.max,f:q.res.focus||''}})});while(H.length>30)H.shift();save()}
  if(c.study)try{STUDY.stop()}catch(_){}sv();render();try{if(g[1]&&g[0]/g[1]>=.6)confetti()}catch(_){}}
 /* ----- setting up a paper ----- */
 function keyBox(){return '<div class="ppkey"><p class="plnote">AI marking uses your own Claude API key, the same one the Ask button uses. It stays on this device. Marking a whole hour costs about 1–3p.</p><div class="pprow2"><input type="password" data-k="key" placeholder="sk-ant-…" autocomplete="off" aria-label="Claude API key"><button type="button" class="plgo" data-a="savekey">Save key</button></div><p class="plnote" data-k="kst"></p><p class="plnote">Get one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>.</p></div>'}
 function wireKey(b){var sbt=b.querySelector('[data-a=savekey]');if(!sbt)return;sbt.onclick=function(){var k=b.querySelector('[data-k=key]').value.trim(),m=b.querySelector('[data-k=kst]');if(!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(k)){m.textContent='That doesn\'t look like an Anthropic key (it starts sk-ant-).';return}try{localStorage.setItem(KK,k)}catch(_){}m.textContent='Key saved.';setTimeout(render,500)}}
 /* the same paper as a Claude artifact: runs on your Claude account, no API key. Only a plain #name reaches it, so lessons go as ids joined by -- */
 function artUrl(c){var ids=[];(c.lids||[]).forEach(function(id){UNITS.forEach(function(u){if(u.id===id)u.lessons.forEach(function(l){ids.push(l.id)});u.lessons.forEach(function(l){if(l.id===id)ids.push(l.id)})})});
  ids=ids.filter(function(x,i){return /^[a-z0-9-]+$/.test(x)&&ids.indexOf(x)===i}).slice(0,12);var h=ids.length?ids.join('--'):(c.subj&&c.subj!=='own'?c.subj:'');return ART+(h?'#'+h:'')}
 function openSetup(pre){setup=Object.assign({subj:'gp',sname:'',tier:'Higher',topics:'',lids:[],extra:'',mins:60},pre||{});if(!Array.isArray(setup.lids))setup.lids=[];open();render()}
 function renderSetup(){var c=setup,hk=!!key();
  var tests=[];try{tests=REV.tests().filter(function(t){return !t.gone&&t.date>=today()})}catch(_){}
  var h='<div class="ppset"><div class="pldnow"><b>An hour of past-paper questions, marked for you</b>Claude writes exam-style questions on your topics. Type or write your answers, and it marks them like an examiner. The next question goes after whatever you dropped marks on, and it keeps going until the time\'s up.</div>'+
   '<div class="ppclaude"><a class="'+(hk?'plgo alt':'plbig')+' pplink" data-k="art" href="'+esc(artUrl(c))+'" target="_blank" rel="noopener">Do it in Claude: no API key needed ↗</a><p class="plnote">Opens Big Past Paper on claude.ai, where it runs on your Claude account. Lessons you pick below carry over; anything else, type in there.</p></div>'+
   (hk?'':'<details class="ppor"><summary>Or use an API key here instead</summary>'+keyBox()+'</details>')+
   (tests.length?'<div><p class="plgt">From your tests</p><div class="rvchips ppchips">'+tests.map(function(t,i){return '<button type="button" data-tt="'+i+'">'+esc(t.name||'Test')+'</button>'}).join('')+'</div></div>':'')+
   '<div class="rvf"><div class="rvrow"><label>Subject<select data-f="subj"><option value="gp">GCSE Physics</option><option value="gc">GCSE Chemistry</option><option value="gm">GCSE Maths</option><option value="gcs">GCSE Computer Science</option><option value="own">Another subject</option></select></label>'+
   '<label>Tier<select data-f="tier"><option>Higher</option><option>Foundation</option></select></label></div>'+
   (c.subj==='own'?'<label>Which subject?<input type="text" data-f="sname" maxlength="40" placeholder="e.g. Biology, Geography"></label>':'')+
   '<label>Topics<input type="text" data-f="topics" maxlength="160" placeholder="e.g. scalars and vectors, resultant forces"></label><div class="ppsug" data-k="sug"></div>'+
   '<label>How long<select data-f="mins"><option value="60">1 hour</option><option value="45">45 minutes</option><option value="30">30 minutes</option></select></label></div>'+
   '<p class="plderr" data-k="err" hidden></p>'+(hk?'<div class="ppact"><button type="button" class="plbig" data-a="go">Start the paper here</button></div>':'')+'</div>';
  var b=body(h),q=function(s){return b.querySelector(s)};wireKey(b);function upd(){var a=q('[data-k=art]');if(a)a.href=artUrl(c)}
  q('[data-f=subj]').value=c.subj;q('[data-f=tier]').value=c.tier;q('[data-f=topics]').value=c.topics;q('[data-f=mins]').value=String(c.mins);
  q('[data-f=subj]').onchange=function(){c.subj=this.value;c.lids=[];renderSetup()};q('[data-f=tier]').onchange=function(){c.tier=this.value};q('[data-f=mins]').onchange=function(){c.mins=+this.value};
  if(q('[data-f=sname]')){q('[data-f=sname]').value=c.sname;q('[data-f=sname]').oninput=function(){c.sname=this.value}}
  function sug(){var box=q('[data-k=sug]'),words=c.topics.split(',').pop().trim(),m=[];if(words.length>=3&&c.subj!=='own')UNITS.forEach(function(u,ui){if(trk(ui)!==c.subj)return;u.lessons.forEach(function(l){var ok=false;try{ok=REV.match(words,l.title)}catch(_){ok=l.title.toLowerCase().indexOf(words.toLowerCase())>=0}if(ok&&c.lids.indexOf(l.id)<0)m.push(l)})});
   box.innerHTML=m.length?'<span class="plnote">Critical lessons:</span> '+m.slice(0,5).map(function(l){return '<button type="button" class="plgo alt" data-l="'+esc(l.id)+'">+ '+esc(l.title)+'</button>'}).join(''):'';
   [].forEach.call(box.querySelectorAll('[data-l]'),function(bt){bt.onclick=function(){var l=null;UNITS.forEach(function(u){u.lessons.forEach(function(x){if(x.id===bt.dataset.l)l=x})});if(!l)return;c.lids.push(l.id);var parts=c.topics.split(',');parts.pop();parts.push(' '+l.title);c.topics=parts.join(',').replace(/^\s*,?\s*/,'').trim();q('[data-f=topics]').value=c.topics;sug();upd()}})}
  q('[data-f=topics]').oninput=function(){c.topics=this.value;sug()};sug();
  [].forEach.call(b.querySelectorAll('[data-tt]'),function(bt){bt.onclick=function(){var t=tests[+bt.dataset.tt];c.subj=t.subj;c.sname=t.sname||'';c.lids=(t.units||[]).slice();var tl=[];try{c.lids.forEach(function(id){UNITS.forEach(function(u){if(u.id===id)tl.push(u.title);u.lessons.forEach(function(l){if(l.id===id)tl.push(l.title)})})})}catch(_){}
   c.topics=t.subj==='own'?(t.name||t.sname||''):tl.join(', ');c.extra=t.subj==='own'?(t.cards||[]).slice(0,40).map(function(x){return 'Q: '+x.q+' A: '+x.a}).join('\n'):'';renderSetup()}});
  if(q('[data-a=go]'))q('[data-a=go]').onclick=function(){var e=q('[data-k=err]');if(!key()){e.hidden=false;e.textContent='Add your Claude API key first (above).';return}if(!c.topics.trim()&&c.subj==='own'){e.hidden=false;e.textContent='Say which topics the paper should cover.';return}
   var now=Date.now();st={v:1,subj:c.subj,sname:(c.sname||'').trim(),tier:c.tier,topics:c.topics.trim(),lids:c.lids,extra:c.extra||'',mins:c.mins||60,start:now,ends:now+(c.mins||60)*60000,qs:[],cur:0,phase:'gen',next:null};
   try{st.study=STUDY.start('Big past paper')?1:0}catch(_){st.study=0}setup=null;sv();gen()}}
 function resume(){if(!st)return;open();if(st.phase==='gen'){busy=false;gen();return}if(st.phase==='marking'){busy=false;st.phase='answer'}render()}
 /* ----- the logger: read a marked-paper PDF from Big Past Paper in Claude (its keywords carry a BPP1 tag) ----- */
 function importPDF(file,say){if(!file)return;if(file.size>40*1024*1024){say('That file is too big to be a Big Past Paper PDF.',1);return}var rd=new FileReader();
  rd.onerror=function(){say('Couldn\'t read that file. Try again.',1)};
  rd.onload=function(){var txt='';try{txt=new TextDecoder('latin1').decode(new Uint8Array(rd.result))}catch(_){say('Couldn\'t read that file.',1);return}
   var m=/BPP1:([A-Za-z0-9+\/=]+)/.exec(txt),o=null;if(m)try{o=JSON.parse(decodeURIComponent(escape(atob(m[1]))))}catch(_){o=null}
   if(!o||o.v!==1||!(+o.m>0)){say('That PDF wasn\'t made by Big Past Paper. Use "Download marked paper (PDF)" on its results screen, then pick that file.',1);return}
   var H=hist(),id=String(o.id||'');if(id&&H.some(function(x){return x.id===id})){say('That paper is already in your log.',1);return}
   var g=Math.max(0,Math.min(+o.m,Math.round(+o.g||0))),dd=new Date(o.d),e={id:id,src:'claude',d:isNaN(dd)?today():dstr(dd),s:String(o.sn||SUBJ[o.s]||'Past paper').slice(0,40),t:String(o.t||'').slice(0,160),tier:String(o.tier||''),g:g,m:Math.round(+o.m),mins:Math.max(0,Math.round(+o.mins||0)),
    qs:(Array.isArray(o.qs)?o.qs:[]).slice(0,30).map(function(q){var mm=Math.max(1,Math.round(+q.m||1));return {t:String(q.t||'Question').slice(0,80),g:Math.max(0,Math.min(mm,Math.round(+q.g||0))),m:mm,f:String(q.f||'').slice(0,200)}})};e.n=e.qs.length;
   H.push(e);H.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0});while(H.length>30)H.shift();save();try{if(g)addXP(g*3)}catch(_){}
   say('Logged: '+e.s+(e.t?' · '+e.t:'')+', '+g+'/'+e.m+' ('+Math.round(g/e.m*100)+'%). +'+g*3+' XP.',0)};
  rd.readAsArrayBuffer(file)}
 function niceD(s){try{var a=String(s).split('-');return new Date(+a[0],a[1]-1,+a[2]).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}catch(_){return s}}
 /* ----- the card on the Exams page ----- */
 function card(){var pg=document.getElementById('page-exam');if(!pg||document.getElementById('exClock'))return;var old=pg.querySelector('.ppcard');if(old)old.remove();
  var All=hist(),H=All.slice(-6).reverse(),pcs=All.filter(function(x){return x.m}).map(function(x){return x.g/x.m*100}),avg=pcs.length?Math.round(pcs.reduce(function(a,b){return a+b},0)/pcs.length):0,live=st&&st.phase!=='done',el=document.createElement('div');el.className='card ppcard';
  el.innerHTML='<h2>📝 Big past paper <span class="note">'+(live?(left()>0?mmss(left())+' left':'time\'s up'):'marked by AI')+'</span></h2><p class="note" style="font-size:15px">An hour of exam-style questions on your topics. Type or handwrite your answers; Claude marks each one like an examiner, then writes the next question on whatever you dropped marks on, until the time\'s up.</p>'+
   '<div class="ppact" style="justify-content:flex-start">'+(live?'<button type="button" class="plgo" data-a="res">Carry on with your paper →</button><button type="button" class="plgo alt" data-a="new">Start a new one</button>':'<button type="button" class="plgo" data-a="new">Start a past paper →</button>')+
   '<button type="button" class="plgo alt" data-a="log">📄 Log a paper (PDF)</button><input type="file" accept="application/pdf,.pdf" data-k="file" hidden aria-label="Choose a Big Past Paper PDF"></div>'+
   '<p class="plnote pplogmsg" data-k="logmsg" role="status" hidden></p>'+
   (H.length?'<div class="pplog"><p class="plgt">Past paper log · '+All.length+' paper'+(All.length===1?'':'s')+' · average '+avg+'%</p>'+H.map(function(x){var pc=x.m?Math.round(x.g/x.m*100):0,head='<span>'+esc(x.s)+(x.t?' · '+esc(x.t):'')+' <span class="plnote">'+esc(niceD(x.d))+(x.mins?' · '+x.mins+' min':'')+(x.src==='claude'?' · from Claude':'')+'</span></span><b class="'+(pc>=70?'g':pc>=50?'m':'l')+'">'+x.g+'/'+x.m+' · '+pc+'%</b>';
     if(!x.qs||!x.qs.length)return '<div class="pprow">'+head+'</div>';var fo=[];x.qs.forEach(function(q){if(q.f&&q.g<q.m&&fo.indexOf(q.f)<0)fo.push(q.f)});
     return '<details class="pplr"><summary class="pprow">'+head+'</summary><div class="pplq">'+x.qs.map(function(q,i){return '<div><span>'+(i+1)+'. '+esc(q.t)+'</span><b>'+q.g+'/'+q.m+'</b></div>'}).join('')+(fo.length?'<p class="plnote"><b>Work on:</b> '+fo.slice(-4).map(esc).join(' · ')+'</p>':'')+'</div></details>'}).join('')+'</div>':
    '<p class="plnote">Finished a paper in Claude? Download it as a PDF there, then press Log a paper.</p>');
  var w=pg.querySelector('.exw'),f=w&&w.firstElementChild;if(f&&f.nextSibling)w.insertBefore(el,f.nextSibling);else if(w)w.appendChild(el);else pg.insertBefore(el,pg.firstChild);
  var rb=el.querySelector('[data-a=res]');if(rb)rb.onclick=resume;
  var fi=el.querySelector('[data-k=file]'),lm=el.querySelector('[data-k=logmsg]'),say=function(t,bad){var keep=t;if(!bad){card();var n=document.querySelector('.ppcard [data-k=logmsg]');if(n){n.hidden=false;n.textContent=keep;n.className='plnote pplogmsg ok'}return}lm.hidden=false;lm.textContent=t;lm.className='plnote pplogmsg bad'};
  el.querySelector('[data-a=log]').onclick=function(){fi.value='';fi.click()};fi.onchange=function(){importPDF(fi.files&&fi.files[0],say)};
  el.addEventListener('dragover',function(e){e.preventDefault();el.classList.add('ppdrop')});el.addEventListener('dragleave',function(){el.classList.remove('ppdrop')});
  el.addEventListener('drop',function(e){e.preventDefault();el.classList.remove('ppdrop');var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)importPDF(f,say)});el.querySelector('[data-a=new]').onclick=function(){if(live&&!this.dataset.sure){this.dataset.sure=1;this.textContent='Tap again: this ends your current paper';return}if(live)finish();st=null;sv();openSetup()}}
 /* the Exams page is built after this runs, so wait for it, then keep the card there whenever the page re-renders */
 function hook(){var pg=document.getElementById('page-exam');if(!pg){hook.n=(hook.n||0)+1;if(hook.n<120)setTimeout(hook,250);return}if(window.MutationObserver&&!pg._ppObs){pg._ppObs=1;new MutationObserver(function(){if(!pg.querySelector('.ppcard'))try{card()}catch(_){}}).observe(pg,{childList:true})}try{card()}catch(_){}}
 setTimeout(hook,0);
 var css=document.createElement('style');css.textContent=
  '.ppov{position:fixed;inset:0;z-index:3200;background:var(--bg);overflow:auto}.ppin{max-width:820px;margin:0 auto;padding:0 16px calc(40px + env(safe-area-inset-bottom))}'+
  '.pphd{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--bg);padding:12px 0;border-bottom:1px solid var(--line);margin-bottom:14px}.pphd .ppt{flex:1;min-width:160px;font-size:16px}'+
  '.ppclk{font:800 16px var(--mono);font-variant-numeric:tabular-nums}.ppclk.low{color:#e8742a}.ppsc{font:700 13px var(--mono);color:var(--muted)}'+
  '.ppbody{display:flex;flex-direction:column;gap:14px}.ppload{display:flex;flex-direction:column;align-items:center;gap:10px;padding:60px 10px;text-align:center}.ppload p{margin:0}'+
  '.ppspin{width:34px;height:34px;border-radius:50%;border:4px solid var(--soft2);border-top-color:#7F77DD;animation:ppspin 0.9s linear infinite}@keyframes ppspin{to{transform:rotate(360deg)}}'+
  '.ppqh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.ppqh b{font-size:19px;flex:1}.ppqn{font:800 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#7F77DD}.ppqm{font:700 13px var(--mono);color:var(--muted)}'+
  '.ppstem{background:rgba(127,119,221,.1);border:1.5px solid #7F77DD;border-radius:14px;padding:12px 14px;line-height:1.55;display:flex;flex-direction:column;gap:4px}.pppart{display:flex;flex-direction:column;gap:6px}.ppq{margin:0;line-height:1.55;font-size:15.5px}.ppq .pptab{margin:8px 0}.ppmk{color:var(--muted);font-weight:700;font-size:13px;white-space:nowrap}'+
  '.ppans{font:inherit;font-size:15px;line-height:1.5;color:var(--text);background:var(--panel);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;width:100%;box-sizing:border-box;resize:vertical}.ppans:focus{outline:none;border-color:#7F77DD}'+
  '.ppmode{display:inline-flex;align-self:flex-start;border:1.5px solid var(--line);border-radius:9px;overflow:hidden}.ppmode button{border:0;background:var(--panel);color:var(--muted);font:inherit;font-size:13px;font-weight:700;padding:4px 12px;cursor:pointer}.ppmode button.on{background:var(--text);color:var(--bg)}'+
  '.pppp[hidden],.ppans[hidden]{display:none}.pppp .pptools{margin-top:0}.pphw{display:block;max-width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;margin-top:6px}'+
  '.pppad summary{cursor:pointer;font-weight:700}.ppcvbox{margin-top:8px}.pptools{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}.ppsw{width:26px;height:26px;border-radius:50%;border:2px solid var(--line);cursor:pointer;padding:0}.ppsw.on{outline:3px solid #7F77DD;outline-offset:1px}'+
  '.pptb{font:inherit;font-size:13px;font-weight:700;border:1.5px solid var(--line);background:var(--panel);color:var(--text);border-radius:9px;padding:5px 9px;cursor:pointer}.pptb.on{border-color:#7F77DD;background:rgba(127,119,221,.15)}'+
  '.ppcv{display:block;width:100%;border:1.5px solid var(--line);border-radius:12px;background:var(--panel) repeating-linear-gradient(to bottom,transparent 0,transparent 31px,var(--line) 31px,var(--line) 32px);touch-action:none;cursor:crosshair}'+
  '.ppact{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.ppact .plbig{flex:1}.ppwarn{margin:0;background:var(--warn-bg);color:var(--text);border-radius:12px;padding:10px 12px;font-weight:700}'+
  '.ppres{display:flex;gap:12px;align-items:center;border-radius:14px;padding:12px 14px;background:var(--soft)}.ppres b{font:800 26px var(--mono)}.ppres.full{background:var(--good-bg)}.ppres.half{background:rgba(239,159,39,.15)}.ppres.low{background:rgba(232,116,42,.13)}'+
  '.pppart.marked{background:var(--panel);border:1.5px solid var(--line);border-radius:14px;padding:12px 14px}.ppchip{display:inline-block;font:800 13px var(--mono);border-radius:999px;padding:2px 9px;margin-left:4px;vertical-align:1px}.ppchip.full{background:var(--good-bg);color:var(--good)}.ppchip.half{background:rgba(239,159,39,.18)}.ppchip.low{background:rgba(232,116,42,.16)}'+
  '.ppyour{font-size:14.5px;background:var(--bg);border-radius:10px;padding:8px 10px;white-space:normal}.ppyour span{display:block;font:800 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}.ppfb{margin:0;font-size:14.5px;line-height:1.5}'+
  '.ppms summary{cursor:pointer;font-weight:700;font-size:14px;color:var(--muted)}.ppms ul{margin:6px 0;padding-left:20px;font-size:14px}.ppms p{font-size:14px;margin:4px 0}.ppfocus{margin:0;background:rgba(127,119,221,.13);border-radius:12px;padding:10px 12px}'+
  '.pptab{border-collapse:collapse;margin:8px 0;font-size:14px}.pptab td,.pptab th{border:1px solid var(--line);padding:4px 10px;text-align:center}.pptab th{background:var(--soft)}'+
  '.ppdone{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}.ppdone h2{margin:4px 0 0}.ppstats{display:flex;gap:10px;margin-top:8px}.ppstats div{background:var(--panel);border:1.5px solid var(--line);border-radius:12px;padding:8px 14px;display:flex;flex-direction:column}.ppstats b{font:800 20px var(--mono)}.ppstats span{font-size:12px;color:var(--muted)}'+
  '.ppbox{background:var(--panel);border:1.5px solid var(--line);border-radius:14px;padding:12px 14px}.ppbox ul{margin:0;padding-left:20px}.pprow{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--line);font-size:14.5px}.pprow:last-child{border-bottom:0}.pprow b{font-family:var(--mono)}'+
  '.ppset{display:flex;flex-direction:column;gap:14px}.ppkey{background:var(--warn-bg);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}.ppkey p{margin:0}.pprow2{display:flex;gap:6px}.pprow2 input{flex:1;font:inherit;font-size:15px;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text)}'+
  '.pplink{display:block;text-align:center;text-decoration:none;box-sizing:border-box}.ppclaude{display:flex;flex-direction:column;gap:6px}.ppor summary{cursor:pointer;font-weight:700;font-size:14px;color:var(--muted)}.ppor .ppkey{margin-top:8px}'+
  '.pplog{margin-top:12px}.pplr summary{cursor:pointer;list-style:none}.pplr summary::-webkit-details-marker{display:none}.pplr summary>span::before{content:"▸ ";color:var(--muted)}.pplr[open] summary>span::before{content:"▾ "}'+
  '.pplog b.g{color:var(--good)}.pplog b.m{color:#c98a12}.pplog b.l{color:#e8742a}.pplq{padding:4px 0 8px 18px;display:flex;flex-direction:column;gap:3px;font-size:14px}.pplq div{display:flex;justify-content:space-between;gap:10px}.pplq b{font-family:var(--mono)}.pplq p{margin:4px 0 0}'+
  '.pplogmsg{margin:8px 0 0;padding:8px 10px;border-radius:10px}.pplogmsg.ok{background:var(--good-bg);color:var(--text)}.pplogmsg.bad{background:var(--warn-bg);color:var(--text)}.ppcard.ppdrop{outline:3px dashed #7F77DD;outline-offset:4px}'+
  '.ppchips button{border:0;cursor:pointer;font:inherit}.ppsug{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ppsug:empty{display:none}.pphist{margin-top:10px}';
 document.head.appendChild(css);
 return {artUrl:artUrl,setup:openSetup,resume:resume,card:card,state:function(){return st},_png:png,_fmt:fmt};
})();
try{window.PP=PP}catch(_){}
