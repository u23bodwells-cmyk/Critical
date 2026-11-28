/* ===== bedtime review: a calm 5 minutes on your phone before sleep =====
   what you did today, then questions like the ones you got wrong (same skill or lesson, different question) */
/* the "study day" runs until 4 am, so a review after midnight still counts as today's */
function bedDay(){return dstr(new Date(Date.now()-4*3600e3))}
function bedLog(){var x=lxGet(),d=bedDay();if(!x.day||x.day.d!==d)x.day={d:d,lessons:[],miss:[],asked:0,right:0};return x}
function bedPlain(h){var t=document.createElement('div');t.innerHTML=String(h||'');return t.textContent.replace(/\s+/g,' ').trim().slice(0,160)}
function bedNote(m){try{var x=bedLog(),D=x.day;if(m.ok===true){D.asked++;D.right++}else if(m.ok===false){D.asked++;if(D.miss.length<60)D.miss.push({lid:m.lid||null,sk:m.sk||null,k:m.k||null,p:bedPlain(m.p)})}if(m.lesson&&D.lessons.every(function(z){return z.id!==m.lesson.id}))D.lessons.push(m.lesson);lxSet(x)}catch(e){}}
/* record right and wrong answers in lessons and reviews */
var gwBED=gotWrong;gotWrong=function(c){var out=gwBED.apply(this,arguments);try{if(c&&'QNO'.indexOf(c.t)>=0&&!c._pre){var k=cardKey(c),lid=lxLid()||(k?String(k).replace(/^[FB]/,'').split('#')[0]:null);bedNote({ok:false,lid:lid,k:k,p:c.p})}}catch(e){}return out};
var grBED=gotRight;gotRight=function(c){var first=P&&P.st&&!P.st.tries,out=grBED.apply(this,arguments);try{if(first&&c&&'QNO'.indexOf(c.t)>=0&&!c._pre)bedNote({ok:true})}catch(e){}return out};
/* drills: each miss remembers its skill, so tonight's question uses the same skill with new numbers */
var lxWeakBED=lxWeak;lxWeak=function(k,ok,rev){try{if(ok)bedNote({ok:true});else bedNote({ok:false,sk:k,lid:lxLid(),p:''})}catch(e){}return lxWeakBED.apply(this,arguments)};
var finBED=finish;finish=function(){var lid=null,t='';try{if(P&&!P.finished&&P.mode==='lesson'){var l=UNITS[P.ui].lessons[P.li];lid=l.id;t=l.title}}catch(e){}var out=finBED.apply(this,arguments);if(lid)bedNote({lesson:{id:lid,t:t}});return out};
/* ---- today from records the app already kept (so lessons and mistakes from before the bedtime log still count) ---- */
var BED_INT=[1,3,7,14,30,60];
function bedAdd(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return dstr(x)}
function bedPast(D){var out={lessons:[],miss:[],asked:0,right:0},M=(S&&S.mem)||{},lids={};
 /* the memory log saves each question as [box, due date]: anything due exactly one interval after today was answered today, and box 0 means it was wrong */
 for(var k in M){var e=M[k];if(!Array.isArray(e))continue;var b=e[0]|0;if(b<0||b>5||e[1]!==bedAdd(D,BED_INT[b]))continue;var sk=String(k),id=sk.replace(/^[FB]/,'').split('#')[0],L=lessonById(id);if(!L)continue;lids[id]=L.l.title;
  if(b===0){var ci=+sk.split('#')[1],c=sk.charAt(0)==='F'?(typeof FOLLOW!=='undefined'&&FOLLOW[id]||[])[ci]:sk.charAt(0)==='B'?null:L.l.cards[ci];out.miss.push({lid:id,k:sk,p:bedPlain(c&&c.p)})}}
 out.lessons=Object.keys(lids).map(function(id){return {id:id,t:lids[id]}});
 /* the activity log keeps questions and right-first-time per subject per day, on every device */
 try{var A=JSON.parse(localStorage.getItem('critical_act')||'null'),dd=(A&&A.d)||{};for(var dv in dd){var day=dd[dv]&&dd[dv][D];if(!day)continue;for(var tr in day){if(tr.charAt(0)==='_')continue;var a=day[tr]||[];out.asked+=+a[1]||0;out.right+=+a[2]||0}}}catch(e){}
 return out}
function bedMerged(){var D=JSON.parse(JSON.stringify(bedLog().day)),p=bedPast(D.d),have={};D.lessons.forEach(function(z){have[z.id]=1});p.lessons.forEach(function(z){if(!have[z.id]){have[z.id]=1;D.lessons.push(z)}});
 var mk={};D.miss.forEach(function(m){if(m.k)mk[m.k]=1});p.miss.forEach(function(m){if(!mk[m.k]){mk[m.k]=1;D.miss.push(m)}});
 if(p.asked>D.asked){D.asked=p.asked;D.right=Math.min(p.asked,p.right)}
 var lc=D.lessons.length;try{var ld=S.lday,un=D.d.split('-').map(Number).join('-');if(ld&&ld.d===un&&ld.n>lc)lc=ld.n}catch(e){}D.nLessons=lc;return D}
/* ---- building tonight's questions ---- */
function bedSkills(l){var sk=[];l.cards.forEach(function(c){if(c.t==='W'&&c.w==='calcDrill'&&c.par)[].concat(c.par.skill||[]).forEach(function(k){if(typeof CGEN[k]==='function'&&sk.indexOf(k)<0)sk.push(k)})});return sk}
function bedFromCard(c){if(!c)return null;if(c.t==='Q'&&c.o&&typeof c.a==='number'){var o=c.o.slice(),a=o.splice(c.a,1)[0];return {p:c.p,o:[a].concat(o),e:c.e||''}}if(c.t==='N'&&isFinite(c.a))return {p:c.p,b:[cB(c.a,'',c.u||'','answer',false,c.tol==null?0.02:c.tol)],e:c.e||''};return null}
function bedSimilar(lid,avoid){var L=lessonById(lid);if(!L)return null;var sk=bedSkills(L.l);if(sk.length){var k=sk[Math.floor(Math.random()*sk.length)];try{var g=CGEN[k]();g._k=k;return g}catch(e){}}
 var pool=[];try{pool=conceptBank(L.l).slice()}catch(e){}L.l.cards.forEach(function(c){var q=bedFromCard(c);if(q)pool.push(q)});
 pool=pool.filter(function(q){var pt=bedPlain(q.p);return pt&&pt!==avoid});if(!pool.length)return null;return pool[Math.floor(Math.random()*pool.length)]}
function bedBuild(){var D=bedMerged(),out=[],used={},n=function(key){used[key]=(used[key]||0)+1;return used[key]<=2};
 D.miss.slice().reverse().forEach(function(m){if(out.length>=8)return;var q=null,key=m.sk||m.lid;if(!key||!n(key))return;
  if(m.sk&&typeof CGEN[m.sk]==='function'){try{q=CGEN[m.sk]();q._k=m.sk}catch(e){}}else if(m.lid)q=bedSimilar(m.lid,m.p);
  if(q){q._why='Like one you got wrong'+(m.lid&&lessonById(m.lid)?' in '+bedPlain(lessonById(m.lid).l.title):'');out.push(q)}});
 /* not many mistakes today? top up from today's lessons, then from skills that are due */
 for(var pass=0;pass<2&&out.length<6;pass++)D.lessons.forEach(function(z){if(out.length>=6||!n('L'+z.id))return;var q=bedSimilar(z.id,'');if(q){q._why='From today\'s lesson: '+bedPlain(z.t);out.push(q)}});
 if(out.length<5){try{lxDue().concat(Object.keys(lxGet().weak)).forEach(function(k){if(out.length>=6||!n('w'+k)||typeof CGEN[k]!=='function')return;var q=CGEN[k]();q._k=k;q._why='A skill you slipped on before';out.push(q)})}catch(e){}}
 if(out.length<5){try{shuffle(Object.keys(S.wrong||{})).slice(0,12).forEach(function(k){if(out.length>=6)return;var lid=String(k).replace(/^[FB]/,'').split('#')[0];if(!n(lid))return;var q=bedSimilar(lid,'');if(q){q._why='Like an older mistake';out.push(q)}})}catch(e){}}
 return shuffle(out).slice(0,8)}
/* ---- the screen ---- */
var bedEl=null;
function bedClose(){if(bedEl){bedEl.remove();bedEl=null}document.body.classList.remove('noscroll');try{if(PAGE==='learn')renderLearn();else if(PAGE==='review')renderReview()}catch(e){}}
function bedOpen(){if(bedEl)return;bedEl=document.createElement('div');bedEl.className='bedov';bedEl.setAttribute('role','dialog');bedEl.setAttribute('aria-label','Bedtime review');document.body.appendChild(bedEl);document.body.classList.add('noscroll');bedHome()}
function bedTop(t){return '<div class="bedtop"><span>🌙 '+t+'</span><button type="button" class="bedx" data-a="close">Close</button></div>'}
function bedWire(){var x=bedEl.querySelector('[data-a=close]');if(x)x.onclick=bedClose}
function bedHome(){var D=bedMerged(),xp=(S.hist&&S.hist[D.d])||0,acc=D.asked?Math.round(D.right/D.asked*100):null,dt=new Date(D.d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}),qs=bedBuild();bedEl._qs=qs;
 var mood=!D.asked&&!xp?'A quiet day. Five calm minutes now still counts.':acc!=null&&acc>=85?'A strong day. Let\'s lock it in.':D.miss.length?'You had a go at some tricky ones. Let\'s tidy them up.':'Nice work today.';
 bedEl.innerHTML='<div class="bedw">'+bedTop('Bedtime review')+'<div class="bedcard"><p class="bedk">'+dt+'</p><h1>Your day</h1><p class="bedmood">'+mood+'</p>'+
  '<div class="bedstats"><div><b>'+fmtInt(xp)+'</b><span>XP</span></div><div><b>'+D.nLessons+'</b><span>lesson'+(D.nLessons===1?'':'s')+'</span></div><div><b>'+D.asked+'</b><span>questions</span></div><div><b>'+(acc==null?'–':acc+'%')+'</b><span>right</span></div></div>'+
  (D.lessons.length?'<ul class="bedls">'+D.lessons.map(function(z){return '<li>✓ '+qcEsc(bedPlain(z.t))+'</li>'}).join('')+'</ul>':'')+
  ((S.streak||0)>0?'<p class="bedmood">🔥 '+S.streak+'-day streak.</p>':'')+'</div>'+
  '<div class="bedcard"><h2>'+(qs.length?qs.length+' questions, about 5 minutes':'Nothing to review tonight')+'</h2><p class="bedmood">'+(qs.length?(D.miss.length?'Each one is like something you got wrong today: the same idea, but a different question.':'Questions from what you\'ve been learning, to settle it before sleep.'):'Do a lesson tomorrow and tonight\'s review will be ready for you then.')+'</p>'+(qs.length?'<button type="button" class="bedgo" id="bedGo">Start</button>':'<button type="button" class="bedgo" data-a="close2">Good night</button>')+'</div>'+
  '<p class="bedtip">Reviewing just before sleep helps your brain keep what you learned. Keep the screen dim and stop when you\'re done.</p></div>';
 bedWire();var g=bedEl.querySelector('#bedGo');if(g)g.onclick=function(){bedRun(qs,0,0,[])};var c2=bedEl.querySelector('[data-a=close2]');if(c2)c2.onclick=bedClose}
function bedRun(qs,i,right,missed){if(!bedEl)return;if(i>=qs.length){bedEnd(qs.length,right,missed);return}var q=qs[i],L='',dots='';for(var j=0;j<qs.length;j++)dots+='<i class="'+(j<i?'done':j===i?'now':'')+'"></i>';
 bedEl.innerHTML='<div class="bedw">'+bedTop('Question '+(i+1)+' of '+qs.length)+'<div class="beddots">'+dots+'</div><div class="bedcard"><p class="bedk">'+qcEsc(q._why||'')+'</p><div class="bedq">'+q.p+'</div><div id="bedA"></div><div class="bedfb" id="bedFb"></div></div><button type="button" class="bedgo" id="bedNext" hidden>Next</button></div>';
 bedWire();var A=bedEl.querySelector('#bedA'),fb=bedEl.querySelector('#bedFb'),nx=bedEl.querySelector('#bedNext'),done=false;
 function fin(ok,ans){if(done)return;done=true;if(ok)right++;else missed.push(q);try{if(q._k)lxWeakBED(q._k,ok,false)}catch(e){}
  fb.innerHTML=(ok?'<b class="bedok">✓ Yes, that\'s right.</b>':'<b class="bedno">Not quite.</b> The answer is <b>'+ans+'</b>.')+(q.e?'<div class="bede">'+q.e+'</div>':'');nx.hidden=false;nx.textContent=i+1>=qs.length?'Finish':'Next';try{nx.focus({preventScroll:true})}catch(e){}}
 nx.onclick=function(){bedRun(qs,i+1,right,missed)};
 if(q.o){var box=document.createElement('div');box.className='bedopts';A.appendChild(box);shuffle(q.o.map(function(_,k){return k})).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='bedopt';b.innerHTML=q.o[k];b.onclick=function(){if(done)return;[].forEach.call(box.children,function(x){x.disabled=true});b.classList.add(k===0?'ok':'no');if(k!==0)[].forEach.call(box.children,function(x){if(x.innerHTML===q.o[0])x.classList.add('ok')});fin(k===0,q.o[0])};box.appendChild(b)})}
 else{A.innerHTML='<div class="bednum">'+q.b.map(function(bb,k){return (bb.pre?'<span>'+bb.pre+'</span>':'')+'<input class="bedin'+(bb.sup?' sup':'')+'" inputmode="decimal" autocomplete="off" aria-label="'+qcEsc(bb.label||('Answer '+(k+1)))+'">'+(bb.post?'<span>'+bb.post+'</span>':'')}).join('')+'</div><button type="button" class="bedgo sm" id="bedChk">Check</button>';
  var ins=A.querySelectorAll('input'),chk=A.querySelector('#bedChk');
  function check(){var vals=[].map.call(ins,function(x){return parseNum(x.value)});if(vals.some(function(v){return isNaN(v)})){fb.textContent='Type a number in each box.';return}
   var ok=q.b.every(function(bb,k){var tol=bb.tol==null?0.01:Math.max(bb.tol,0.005);return bb.a===0?Math.abs(vals[k])<1e-9:Math.abs(vals[k]-bb.a)<=Math.abs(bb.a)*(tol+1e-9)});[].forEach.call(ins,function(x){x.disabled=true});chk.remove();
   var sl='';if(!ok&&q.b.length===1)try{sl=numSlip(vals[0],q.b[0].a)}catch(e){}fin(ok,q.b.map(function(bb){return cNum(bb.a)}).join(' and ')+(q.b[0].post&&q.b.length===1?' '+q.b[0].post:''));if(sl)fb.insertAdjacentHTML('beforeend','<div class="bede">🔎 '+sl+'</div>')}
  chk.onclick=check;[].forEach.call(ins,function(x){x.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();check()}}});setTimeout(function(){try{ins[0].focus({preventScroll:true})}catch(e){}},80)}}
function bedEnd(n,right,missed){var pc=n?Math.round(right/n*100):0;try{addXP(5+right*2)}catch(e){}
 bedEl.innerHTML='<div class="bedw">'+bedTop('Done')+'<div class="bedcard bedendc"><div class="bedmoon">🌙</div><h1>Sleep well</h1><p class="bedmood">You got <b>'+right+' of '+n+'</b>'+(pc>=80?'. That\'s it settled.':pc>=50?'. Good. The rest will make more sense tomorrow.':'. Tricky ones, but trying them tonight is what makes them stick.')+'</p>'+
  (missed.length?'<p class="bedmood">'+missed.length+' to come back to: '+(missed.some(function(q){return q._k})?'they\'re in your weak skills, ready for tomorrow.':'have another look at those lessons tomorrow.')+'</p>':'')+'<p class="bedtip">+'+(5+right*2)+' XP. Phone down now. 😴</p><button type="button" class="bedgo" data-a="close2">Good night</button></div></div>';
 bedWire();bedEl.querySelector('[data-a=close2]').onclick=bedClose}
/* ---- where to find it: the Learn page (glowing in the evening) and the Review page ---- */
function bedCard(){var pg=$('page-learn');if(!pg||document.getElementById('bedCard'))return;var h=new Date().getHours(),eve=h>=19||h<4,D=bedMerged(),c=document.createElement('section');c.id='bedCard';c.className='card bedcardl'+(eve?' eve':'');
 c.innerHTML='<div class="rcrow"><span class="rcic" aria-hidden="true">🌙</span><div class="rctx"><b>Bedtime review · 5 min</b><span>'+(D.asked?'Today: '+D.asked+' questions, '+D.miss.length+' to tidy up. Questions like the ones you got wrong, then sleep.':'A calm look back at your day, with questions like the ones you got wrong. Made for your phone in bed.')+'</span></div><div class="rcbtns"><button type="button" class="wbtn'+(eve?' pri':'')+'" id="bedBtn">Start</button></div></div>';
 var hero=pg.querySelector('#motCard')||pg.querySelector('.hero');if(eve&&hero&&hero.parentNode)hero.parentNode.insertBefore(c,hero.nextSibling);else{var rc=document.getElementById('raceCard'),u=pg.querySelector('.units');if(rc&&rc.parentNode)rc.parentNode.insertBefore(c,rc.nextSibling);else if(u)u.parentNode.insertBefore(c,u);else pg.appendChild(c)}
 c.querySelector('#bedBtn').onclick=bedOpen}
var rlBED=renderLearn;renderLearn=function(){var out=rlBED.apply(this,arguments);try{setTimeout(bedCard,0)}catch(e){}return out};
var rrBED=renderReview;renderReview=function(){var out=rrBED.apply(this,arguments);try{var pg=$('page-review');if(pg&&!pg.querySelector('#bedRev')){var d=document.createElement('div');d.id='bedRev';d.className='card bedcardl eve';d.innerHTML='<div class="rcrow"><span class="rcic">🌙</span><div class="rctx"><b>Bedtime review · 5 min</b><span>Your day, then questions like the ones you got wrong.</span></div><div class="rcbtns"><button type="button" class="wbtn pri">Start</button></div></div>';pg.insertBefore(d,pg.firstChild);d.querySelector('button').onclick=bedOpen}}catch(e){}return out};
(function(){var st=document.createElement('style');st.textContent=
 '.bedcardl{padding:12px 14px!important;background:linear-gradient(110deg,rgba(255,196,110,.12),var(--panel) 60%)!important}.bedcardl.eve{background:linear-gradient(110deg,#1b1f3a,#2a2348 70%)!important;color:#efe7d8;border-color:#3b3566!important}.bedcardl.eve .rctx span{color:#c9bfae}'+
 '.bedov{position:fixed;inset:0;z-index:3300;overflow:auto;background:#0d0f1c;color:#e9e2d4;font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:max(14px,env(safe-area-inset-top)) 16px max(28px,env(safe-area-inset-bottom))}'+
 '.bedw{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px}.bedtop{display:flex;align-items:center;gap:10px;font-weight:700;color:#cbbfa8}.bedtop span{flex:1}.bedx{font:inherit;font-size:15px;font-weight:700;background:transparent;color:#cbbfa8;border:1px solid #3a3550;border-radius:10px;padding:7px 12px;cursor:pointer}'+
 '.bedcard{background:#161a2e;border:1px solid #2a2a45;border-radius:20px;padding:18px}.bedcard h1{margin:0 0 4px;font-size:28px;color:#f3ead9}.bedcard h2{margin:0 0 6px;font-size:20px;color:#f3ead9}.bedk{margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#d9a85b}.bedmood{margin:6px 0;color:#c9bfae}'+
 '.bedstats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0 4px}.bedstats div{background:#1d2238;border-radius:14px;padding:10px 6px;text-align:center}.bedstats b{display:block;font:800 22px ui-monospace,Consolas,monospace;color:#f3ead9}.bedstats span{font-size:12.5px;color:#a99f8c}'+
 '.bedls{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:15px;color:#d6ccb8}'+
 '.bedgo{font:inherit;font-weight:800;font-size:18px;width:100%;border:0;border-radius:16px;padding:15px;background:#d9a85b;color:#1a1408;cursor:pointer;margin-top:10px}.bedgo.sm{width:auto;padding:11px 22px;font-size:16px}.bedgo[hidden]{display:none}.bedtip{font-size:13.5px;color:#8f8775;text-align:center;margin:4px 8px}'+
 '.beddots{display:flex;gap:6px;justify-content:center}.beddots i{width:9px;height:9px;border-radius:50%;background:#2c2c48}.beddots i.done{background:#d9a85b}.beddots i.now{background:#f3ead9;transform:scale(1.25)}'+
 '.bedq{font-size:20px;line-height:1.55;color:#f3ead9;margin:4px 0 12px}.bedopts{display:grid;gap:10px}.bedopt{font:inherit;font-size:17px;text-align:left;padding:15px 16px;border-radius:14px;border:2px solid #2f3150;background:#1b1f36;color:#e9e2d4;cursor:pointer}.bedopt.ok{border-color:#7fb38a;background:#1e2f28}.bedopt.no{border-color:#c47a6a;background:#33221f}.bedopt:disabled{cursor:default}'+
 '.bednum{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:20px}.bedin{font:600 22px ui-monospace,Consolas,monospace;width:150px;padding:11px 12px;border-radius:12px;border:2px solid #34365a;background:#10132a;color:#f3ead9}.bedin.sup{width:80px;font-size:16px;align-self:flex-start}.bedin:focus{outline:none;border-color:#d9a85b}'+
 '.bedfb{margin-top:12px;line-height:1.55}.bedfb:empty{display:none}.bedok{color:#9fd3a8}.bedno{color:#e3a493}.bede{margin-top:8px;color:#c9bfae;font-size:15.5px}'+
 '.bedendc{text-align:center}.bedmoon{font-size:64px;line-height:1.1}@media (max-width:420px){.bedstats{grid-template-columns:repeat(2,1fr)}.bedcard h1{font-size:24px}}';document.head.appendChild(st)})();
