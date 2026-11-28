/* ===== exam practice: real past papers, a countdown timer and an answer sheet to send to Claude ===== */
var EXAM=(function(){
 var PMT='https://pmt.physicsandmathstutor.com/download/',SCI=['June 2025','June 2024','June 2023','June 2022','June 2021','June 2020','June 2019','June 2018','Specimen'];
 var SUBJ={
  gp:{name:'Physics',full:'AQA GCSE Physics (8463), Higher',dir:'Physics/GCSE/Past-Papers/AQA/',lab:'01.1',list:['https://www.physicsandmathstutor.com/past-papers/gcse-physics/aqa-paper-1/','https://www.physicsandmathstutor.com/past-papers/gcse-physics/aqa-paper-2/'],
   papers:[{n:1,label:'Paper 1',sub:'Energy, electricity, particles, atomic structure',mins:105,marks:100,now:1},{n:2,label:'Paper 2',sub:'Forces, waves, magnetism, space',mins:105,marks:100}],series:SCI,up:{'June 2020':1,'June 2021':1,'June 2022':1}},
  gc:{name:'Chemistry',full:'AQA GCSE Chemistry (8462), Higher',dir:'Chemistry/GCSE/Past-Papers/AQA/',lab:'01.1',list:['https://www.physicsandmathstutor.com/past-papers/gcse-chemistry/aqa-paper-1/','https://www.physicsandmathstutor.com/past-papers/gcse-chemistry/aqa-paper-2'],
   papers:[{n:1,label:'Paper 1',sub:'Atoms, bonding, quantitative, chemical and energy changes',mins:105,marks:100,now:1},{n:2,label:'Paper 2',sub:'Rates, organic, analysis, atmosphere, resources',mins:105,marks:100}],series:SCI,up:{}},
  gm:{name:'Maths',full:'Edexcel GCSE Maths (1MA1), Higher',dir:'Maths/GCSE/Past-Papers/Edexcel/',lab:'1',list:['https://www.physicsandmathstutor.com/past-papers/gcse-maths/edexcel-paper-1','https://www.physicsandmathstutor.com/past-papers/gcse-maths/edexcel-paper-2/','https://www.physicsandmathstutor.com/past-papers/gcse-maths/edexcel-paper-3/'],
   papers:[{n:1,label:'Paper 1',sub:'Non-calculator',mins:90,marks:80},{n:2,label:'Paper 2',sub:'Calculator',mins:90,marks:80},{n:3,label:'Paper 3',sub:'Calculator',mins:90,marks:80}],
   series:['June 2025','Nov 2024','June 2024','Nov 2023','June 2023','Nov 2022','June 2022','Nov 2021','Nov 2020','June 2020','Nov 2019','June 2019','Nov 2018','June 2018','Nov 2017','June 2017','Specimen 1','Specimen 2'],up:{}}};
 function pdf(s,n,ser,kind){var X=SUBJ[s];return PMT+X.dir+'Paper-'+n+'H/'+kind+'/'+encodeURIComponent(ser+' '+kind)+(X.up[ser]?'.PDF':'.pdf')}
 function E(){if(!S.exam||typeof S.exam!=='object')S.exam={};if(!Array.isArray(S.exam.hist))S.exam.hist=[];return S.exam}
 function C(){return E().cur||null}
 function now(){return Date.now()}
 function used(c){if(!c.start)return 0;var t=c.end||c.paused||now();return Math.max(0,t-c.start-(c.pausedMs||0))}
 function limit(c){return (c.mins+(c.extra||0))*60000}
 function hms(ms){var neg=ms<0;ms=Math.abs(ms);var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=s%60;return (neg?'+':'')+(h?h+':':'')+String(m).padStart(h?2:1,'0')+':'+String(x).padStart(2,'0')}
 function hm(ms){var m=Math.round(ms/60000);return m>=60?Math.floor(m/60)+' h '+(m%60?m%60+' min':''):m+' min'}
 function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 var sel={s:'gp',n:1},saveT=null;
 function keep(){clearTimeout(saveT);saveT=setTimeout(save,300)}
 var css=document.createElement('style');css.textContent=
 '.exw{display:flex;flex-direction:column;gap:16px;max-width:820px;margin:0 auto}.exw h1{margin:0}.exw .lead{margin:4px 0 0;color:var(--muted);font-size:15px;line-height:1.5}'+
 '.exchips{display:flex;gap:8px;flex-wrap:wrap}.exchip{font:inherit;font-size:14px;font-weight:700;border:2px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:9px 14px;cursor:pointer;text-align:left}.exchip span{display:block;font-size:12px;font-weight:600;color:var(--muted)}.exchip.on{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text)}.exchip.on span{color:var(--accent-text)}'+
 '.exnow{display:inline-block;font:800 10px var(--sans);letter-spacing:.06em;text-transform:uppercase;background:var(--good-bg);color:var(--good);border-radius:999px;padding:2px 7px;margin-left:6px;vertical-align:2px}'+
 '.exser{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.exser button{font:inherit;font-size:14px;font-weight:700;border:1.5px solid var(--line);background:var(--bg);color:var(--text);border-radius:12px;padding:10px 12px;cursor:pointer;text-align:left}.exser button span{display:block;font-size:12px;font-weight:600;color:var(--muted)}.exser button.did{border-color:var(--good-line)}'+
 '.exclock{font-family:var(--mono);font-size:56px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:.02em;line-height:1.1}.exclock.warn{color:#e8742a}.exclock.over{color:var(--bad,#c33)}.exsub{text-align:center;color:var(--muted);font-size:14px;margin:4px 0 0}'+
 '.exbar{height:10px;background:var(--soft2);border-radius:5px;overflow:hidden;margin:12px 0 4px}.exbar i{display:block;height:100%;background:var(--accent);border-radius:5px;transition:width .5s}.exbar i.warn{background:#e8742a}.exbar i.over{background:var(--bad,#c33)}'+
 '.exrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.exbtn{font:inherit;font-size:15px;font-weight:800;border:0;border-radius:12px;padding:11px 16px;cursor:pointer;background:var(--accent);color:var(--on-accent);text-decoration:none;display:inline-flex;align-items:center;gap:6px}.exbtn.alt{background:var(--soft);color:var(--text)}.exbtn.bad{background:var(--bad,#c33);color:#fff}.exbtn:disabled{opacity:.45;cursor:default}'+
 '.exans{display:flex;flex-direction:column;gap:8px}.exa{display:grid;grid-template-columns:76px minmax(0,1fr) 32px;gap:8px;align-items:start}.exa input,.exa textarea,.exin{font:inherit;font-size:15px;color:var(--text);background:var(--bg);border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;min-width:0;box-sizing:border-box}.exa input{font-family:var(--mono);font-weight:700;width:100%}.exa textarea{width:100%;min-height:44px;resize:vertical;line-height:1.4}.exa button{border:0;background:none;color:var(--muted);font-size:18px;cursor:pointer;padding:8px 0}'+
 '.exnote{font-size:13px;color:var(--muted);margin:0;line-height:1.45}.exopt{display:flex;gap:10px;align-items:center;font-size:14px;cursor:pointer}.exopt input{width:20px;height:20px;accent-color:var(--accent)}'+
 '.exhist{display:flex;flex-direction:column}.exhist div{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:14px}.exhist div span:first-child{flex:1;min-width:0}.exhist b{font-family:var(--mono)}.extag{font-size:12px;color:var(--muted)}'+
 '.excopy{width:100%;min-height:120px;font-family:var(--mono);font-size:12px}';
 document.head.appendChild(css);
 function title(c){return c.custom?(c.what||'Custom practice'):SUBJ[c.s].full+', '+SUBJ[c.s].papers[c.n-1].label+', '+c.ser}
 function short(c){return c.custom?(c.what||'Custom practice'):SUBJ[c.s].name+' '+SUBJ[c.s].papers[c.n-1].label+' · '+c.ser}
 function nextLab(prev,newQ){var c=C(),def=(c&&!c.custom&&SUBJ[c.s])?SUBJ[c.s].lab:'1';if(!prev)return def;
  var m=prev.match(/^(\d+)\.(\d+)$/);if(m)return newQ?String(+m[1]+1).padStart(m[1].length,'0')+'.1':m[1]+'.'+(+m[2]+1);
  m=prev.match(/^(\d+)\s*(?:\(([a-z])\))?$/i);if(m){if(newQ)return String(+m[1]+1);return m[1]+'('+(m[2]?String.fromCharCode(m[2].toLowerCase().charCodeAt(0)+1):'b')+')'}
  return prev}
 function startPaper(s,n,ser){var p=SUBJ[s].papers[n-1];E().cur={id:now(),s:s,n:n,ser:ser,mins:p.mins,marks:p.marks,start:0,paused:null,pausedMs:0,extra:0,ans:[{q:SUBJ[s].lab,a:''}],end:null,photos:false,warn:{}};save();render()}
 function startCustom(mins,what){E().cur={id:now(),custom:1,what:what,mins:mins,marks:0,start:0,paused:null,pausedMs:0,extra:0,ans:[{q:'1',a:''}],end:null,photos:false,warn:{}};save();render()}
 function go(){var c=C();if(!c)return;c.start=now();c.warn={};save();if(!c.custom){try{window.open(pdf(c.s,c.n,c.ser,'QP'),'_blank','noopener')}catch(_){}}
  try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(_){}
  if(typeof STUDY!=='undefined'&&STUDY.start)STUDY.start('Past paper: '+short(c));render()}
 function pause(){var c=C();if(!c||!c.start||c.end)return;if(c.paused){c.pausedMs+=now()-c.paused;c.paused=null}else c.paused=now();save();render()}
 function finish(){var c=C();if(!c||c.end)return;if(c.paused){c.pausedMs+=now()-c.paused;c.paused=null}c.end=now();if(!c.start)c.start=c.end;var h=E().hist;h.unshift({id:c.id,t:short(c),s:c.s||'',n:c.n||0,ser:c.ser||'',used:used(c),allow:limit(c),marks:c.marks,score:null,d:new Date().toISOString()});E().hist=h.slice(0,40);save();if(typeof STUDY!=='undefined'&&STUDY.stop)STUDY.stop();render()}
 function quit(){E().cur=null;save();render()}
 function copyText(c){var L=['Please mark my past paper using the official mark scheme. Give me a mark for each question, what I missed, and my total.',''];
  if(c.custom)L.push('Practice: '+title(c));else{L.push('Paper: '+title(c));L.push('Question paper: '+pdf(c.s,c.n,c.ser,'QP'));L.push('Mark scheme: '+pdf(c.s,c.n,c.ser,'MS'));L.push('Total marks: '+c.marks)}
  L.push('Time used: '+hm(used(c))+' (allowed '+hm(limit(c))+')','','My answers:');
  c.ans.forEach(function(r){if(r.q||r.a)L.push((r.q||'?')+': '+(r.a||'(no answer)').replace(/\n+/g,' / '))});
  if(c.photos)L.push('','Some of my answers are written on paper: I\'ll send photos.');return L.join('\n')}
 var tick=null,lastTab='';
 function tabTime(ms){var neg=ms<0;ms=Math.abs(ms);var m=Math.ceil(ms/60000);return (neg?'+':'')+(m>=60?Math.floor(m/60)+':'+String(m%60).padStart(2,'0'):m+'m')}
 function loop(){var c=C(),tab=document.querySelector('.tab[data-p=exam]');
  if(tab){var t=(c&&c.start&&!c.end)?'Exams · '+(c.paused?'paused':tabTime(limit(c)-used(c))):'Exams';if(t!==lastTab){tab.textContent=t;lastTab=t}}
  if(!c||!c.start||c.end||c.paused)return;var rem=limit(c)-used(c);
  [[600000,'10 minutes left.'],[300000,'5 minutes left. Start checking your answers.'],[0,'Time\'s up. Finish the sentence you\'re on, then press Finish.']].forEach(function(w){if(rem<=w[0]&&!c.warn[w[0]]){c.warn[w[0]]=1;save();alertOut(w[1])}});
  var k=document.getElementById('exClock');if(k){k.textContent=hms(rem);k.className='exclock'+(rem<0?' over':rem<600000?' warn':'')}
  var b=document.getElementById('exBar');if(b){b.style.width=Math.min(100,used(c)/limit(c)*100)+'%';b.className=rem<0?'over':rem<600000?'warn':''}
  var pc=document.getElementById('exPace');if(pc&&!c.custom&&c.marks){var mk=Math.min(c.marks,Math.floor(used(c)/60000*c.marks/c.mins));pc.textContent=rem<0?'Overtime: in the real exam you\'d have to stop now.':'To finish on time you should be around mark '+mk+' of '+c.marks+' by now.'}}
 function alertOut(t){try{var A=new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();o.frequency.value=880;g.gain.value=0.08;o.connect(g);g.connect(A.destination);o.start();setTimeout(function(){o.stop();A.close()},350)}catch(_){}
  try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted')new Notification('Exam timer',{body:t,tag:'critical-exam'})}catch(_){}
  var d=document.createElement('div');d.className='plban';d.setAttribute('role','alert');d.innerHTML='<p><b>'+esc(t)+'</b></p>';document.body.appendChild(d);setTimeout(function(){d.remove()},7000)}
 function render(){var el=document.getElementById('page-exam');if(!el)return;var c=C(),h='<div class="exw">';
  if(c&&!c.end){var X=c.custom?null:SUBJ[c.s],started=!!c.start;
   h+='<div><h1>'+esc(short(c))+'</h1><p class="lead">'+(c.custom?'Custom timer':esc(X.full))+(c.custom?'':' · '+c.marks+' marks')+' · '+hm(c.mins*60000)+(c.extra?' + '+c.extra+' min extra':'')+'</p></div>';
   h+='<div class="card"><div class="exclock" id="exClock">'+hms(limit(c)-used(c))+'</div><p class="exsub">'+(started?(c.paused?'Paused':'Time remaining'):'Ready when you are')+'</p><div class="exbar"><i id="exBar" style="width:'+Math.min(100,used(c)/limit(c)*100)+'%"></i></div><p class="exnote" id="exPace">'+(started?'':c.custom?'':'About '+(c.mins/c.marks).toFixed(2).replace(/0$/,'')+' minutes per mark. Pressing Start opens the question paper in a new tab.')+'</p>'+
    '<div class="exrow" style="margin-top:12px">'+(started?'<button class="exbtn alt" data-a="pause">'+(c.paused?'Resume':'Pause')+'</button><button class="exbtn alt" data-a="extra">+5 min</button><button class="exbtn" data-a="finish">Finish</button>':'<button class="exbtn" data-a="go">Start the timer</button><button class="exbtn alt" data-a="quit">Back</button>')+(c.custom?'':'<a class="exbtn alt" href="'+pdf(c.s,c.n,c.ser,'QP')+'" target="_blank" rel="noopener">Question paper ↗</a>')+'</div></div>';
   h+='<div class="card"><h2 style="margin-top:0">Your answers</h2><p class="exnote">Type each answer next to its question number. Show your working for calculations. For diagrams and graphs, write on paper and tick the box below.</p><div class="exans" id="exAns"></div><div class="exrow" style="margin-top:10px"><button class="exbtn alt" data-a="part">+ Next part</button><button class="exbtn alt" data-a="q">+ Next question</button></div>'+
    '<label class="exopt" style="margin-top:12px"><input type="checkbox" id="exPhotos"'+(c.photos?' checked':'')+'> Some answers are on paper (I\'ll send photos)</label></div>';
   if(started)h+='<p class="exnote">The timer keeps going if you switch to the paper or close the app. <button class="exbtn alt" data-a="quit" style="padding:6px 10px;font-size:13px">Abandon this paper</button></p>';}
  else if(c&&c.end){h+='<div><h1>Finished: '+esc(short(c))+'</h1><p class="lead">Time used: <b>'+hm(used(c))+'</b> of '+hm(limit(c))+(used(c)>limit(c)?' (over time)':'')+'.</p></div>';
   var txt=copyText(c),q=encodeURIComponent(txt);
   h+='<div class="card"><h2 style="margin-top:0">Get it marked</h2><p class="exnote">Copy your answers and paste them into our chat. I\'ll open the official mark scheme and mark every question. If you wrote some answers on paper, send photos too.</p><div class="exrow" style="margin:10px 0"><button class="exbtn" data-a="copy">Copy for Claude</button>'+(q.length<7000?'<a class="exbtn alt" href="https://claude.ai/new?q='+q+'" target="_blank" rel="noopener">Open in a new Claude chat ↗</a>':'')+'</div><textarea class="exin excopy" id="exTxt" readonly>'+esc(txt)+'</textarea><p class="exnote" id="exMsg"></p></div>';
   var hh=E().hist.filter(function(x){return x.id===c.id})[0];
   h+='<div class="card"><h2 style="margin-top:0">Once it\'s marked</h2><p class="exnote">Enter your score to track your progress.</p><div class="exrow" style="margin-top:8px"><input class="exin" id="exScore" type="number" min="0" max="'+(c.marks||200)+'" style="width:110px" placeholder="Score" value="'+(hh&&hh.score!=null?hh.score:'')+'">'+(c.marks?'<span>out of '+c.marks+'</span>':'')+'<button class="exbtn alt" data-a="score">Save score</button></div></div>';
   h+='<div class="exrow"><button class="exbtn" data-a="quit">Start another paper</button></div>';}
  else{var X2=SUBJ[sel.s],P=X2.papers[sel.n-1],did={};E().hist.forEach(function(x){if(x.s===sel.s&&x.n===sel.n)did[x.ser]=x});
   h+='<div><h1>Exam practice</h1><p class="lead">Real past papers with a countdown timer. Do the paper, type your answers here, then send them to me and I\'ll mark them against the official mark scheme.</p></div>';
   h+='<div class="card"><h2 style="margin-top:0">1. Subject</h2><div class="exchips">'+['gp','gc','gm'].map(function(s){return '<button class="exchip'+(s===sel.s?' on':'')+'" data-s="'+s+'">'+SUBJ[s].name+'<span>'+(s==='gm'?'Edexcel':'AQA')+' Higher</span></button>'}).join('')+'</div>'+
    '<h2>2. Paper</h2><div class="exchips">'+X2.papers.map(function(p){return '<button class="exchip'+(p.n===sel.n?' on':'')+'" data-n="'+p.n+'">'+p.label+(p.now?'<i class="exnow">Year 10</i>':'')+'<span>'+p.sub+'</span></button>'}).join('')+'</div>'+
    '<p class="exnote" style="margin-top:8px">'+P.mins+' minutes · '+P.marks+' marks'+(sel.s!=='gm'?(P.now?' · covers the topics you\'re doing in Year 10.':' · mostly Year 11 topics.'):' · each paper can test any topic, so some questions may be ones you haven\'t learned yet.')+'</p>'+
    '<h2>3. Pick a paper</h2><div class="exser">'+X2.series.map(function(ser){var d=did[ser];return '<button data-ser="'+esc(ser)+'"'+(d?' class="did"':'')+'>'+ser+'<span>'+(d?(d.score!=null?'Scored '+d.score+'/'+d.marks:'Done'):(/2020|2021/.test(ser)?'Practice paper':'Start'))+'</span></button>'}).join('')+'</div>'+
    '<p class="exnote" style="margin-top:10px">Papers from Physics &amp; Maths Tutor. June 2020 and 2021 papers weren\'t sat (exams were cancelled), but they\'re real papers. <a href="'+X2.list[sel.n-1]+'" target="_blank" rel="noopener">All '+X2.name+' '+P.label+' papers ↗</a></p></div>';
   h+='<div class="card"><h2 style="margin-top:0">Just a timer</h2><p class="exnote">For topic questions or half a paper.</p><div class="exrow" style="margin-top:8px"><input class="exin" id="exWhat" maxlength="80" placeholder="What are you doing? e.g. Maths Genie: circle theorems" style="flex:1 1 220px"><input class="exin" id="exMins" type="number" min="5" max="180" value="30" style="width:84px" aria-label="Minutes"><span>min</span><button class="exbtn alt" data-a="custom">Set up</button></div></div>';
   if(E().hist.length){h+='<div class="card"><h2 style="margin-top:0">Your papers</h2><div class="exhist">'+E().hist.slice(0,12).map(function(x){return '<div><span>'+esc(x.t)+'<br><span class="extag">'+new Date(x.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' · '+hm(x.used)+'</span></span><b>'+(x.score!=null?x.score+'/'+x.marks+' ('+Math.round(x.score/x.marks*100)+'%)':'–')+'</b></div>'}).join('')+'</div></div>'}}
  el.innerHTML=h+'</div>';wire(el)}
 function drawAns(){var c=C(),box=document.getElementById('exAns');if(!c||!box)return;box.innerHTML='';
  c.ans.forEach(function(r,i){var row=document.createElement('div');row.className='exa';row.innerHTML='<input aria-label="Question number" maxlength="12"><textarea aria-label="Answer" rows="1"></textarea><button type="button" aria-label="Remove">✕</button>';
   var q=row.children[0],a=row.children[1];q.value=r.q;a.value=r.a;q.oninput=function(){r.q=q.value;keep()};a.oninput=function(){r.a=a.value;a.style.height='auto';a.style.height=Math.min(240,a.scrollHeight)+'px';keep()};
   row.children[2].onclick=function(){c.ans.splice(i,1);if(!c.ans.length)c.ans.push({q:SUBJ[c.s]?SUBJ[c.s].lab:'1',a:''});save();drawAns()};box.appendChild(row)})}
 function add(newQ){var c=C();if(!c)return;var last=c.ans[c.ans.length-1];if(!newQ&&last&&/^\d+$/.test(last.q))last.q=last.q+'(a)';c.ans.push({q:nextLab(last&&last.q,newQ),a:''});save();drawAns();var t=document.querySelectorAll('#exAns textarea');if(t.length)try{t[t.length-1].focus()}catch(_){}}
 function wire(el){[].forEach.call(el.querySelectorAll('[data-s]'),function(b){b.onclick=function(){sel.s=b.dataset.s;sel.n=1;render()}});
  [].forEach.call(el.querySelectorAll('[data-n]'),function(b){b.onclick=function(){sel.n=+b.dataset.n;render()}});
  [].forEach.call(el.querySelectorAll('[data-ser]'),function(b){b.onclick=function(){startPaper(sel.s,sel.n,b.dataset.ser)}});
  var A={go:go,pause:pause,finish:finish,quit:quit,part:function(){add(false)},q:function(){add(true)},extra:function(){var c=C();if(c){c.extra=(c.extra||0)+5;c.warn={};save();render()}},
   custom:function(){var m=parseInt(document.getElementById('exMins').value,10);if(!(m>=5&&m<=180))m=30;startCustom(m,document.getElementById('exWhat').value.trim())},
   copy:function(){var t=document.getElementById('exTxt'),m=document.getElementById('exMsg');function ok(){m.textContent='Copied. Paste it into our chat.'}try{navigator.clipboard.writeText(t.value).then(ok,function(){t.select();m.textContent='Press Ctrl+C to copy.'})}catch(_){t.select();m.textContent='Press Ctrl+C to copy.'}},
   score:function(){var c=C(),v=parseInt(document.getElementById('exScore').value,10);if(!c||isNaN(v))return;E().hist.forEach(function(x){if(x.id===c.id)x.score=Math.max(0,Math.min(c.marks||v,v))});save();render()}};
  [].forEach.call(el.querySelectorAll('[data-a]'),function(b){var f=A[b.dataset.a];if(f)b.onclick=f});
  var ph=document.getElementById('exPhotos');if(ph)ph.onchange=function(){var c=C();if(c){c.photos=ph.checked;save()}};drawAns()}
 /* page and tab */
 var main=document.querySelector('main');if(main&&!document.getElementById('page-exam')){var sec=document.createElement('section');sec.className='page';sec.id='page-exam';main.appendChild(sec)}
 var tabs=document.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-p=exam]')){var tb=document.createElement('button');tb.className='tab';tb.dataset.p='exam';tb.textContent='Exams';tb.onclick=function(){showPage('exam')};var ref=tabs.querySelector('[data-p=ref]');tabs.insertBefore(tb,ref)}
 tick=setInterval(loop,1000);setTimeout(loop,300);
 return {render:render,state:E,pdf:pdf,SUBJ:SUBJ,copyText:copyText};
})();
try{window.EXAM=EXAM}catch(_){}



