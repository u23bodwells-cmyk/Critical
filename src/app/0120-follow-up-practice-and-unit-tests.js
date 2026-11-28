/* ---------- follow-up practice and unit tests ---------- */
var FOLLOW={},TESTS={};
function F(id,cards){FOLLOW[id]=cards}
function TT(uid,cards){TESTS[uid]=cards}
function x(lid,c){c._lid=lid;return c}
var PASS_FU=50,PASS_TEST=70,TEST_N=15,TEST_POOL_N=10,TEST_MINS=15;
var TEST_ICON='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>';
var LOCK='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

function lessonById(id){for(var ui=0;ui<UNITS.length;ui++)for(var li=0;li<UNITS[ui].lessons.length;li++)if(UNITS[ui].lessons[li].id===id)return {ui:ui,li:li,u:UNITS[ui],l:UNITS[ui].lessons[li]};return null}
function fuNeed(id){return !!(S.fu[id]&&S.fu[id].need)}
function pendingFollow(m){m=m||curMode();var cap=m==='all'?99:curLevel(m);for(var ui=0;ui<UNITS.length;ui++){if(m!=='all'&&trk(ui)!==m)continue;if(lvOf(ui)>cap)continue;for(var li=0;li<UNITS[ui].lessons.length;li++){var id=UNITS[ui].lessons[li].id;if(fuNeed(id))return id}}return null}
function unitDone(ui){return UNITS[ui].lessons.every(function(l){return S.done[l.id]})}
function unitNeeds(ui){return UNITS[ui].lessons.some(function(l){return fuNeed(l.id)})}
function testOpen(ui){return !!TESTS[UNITS[ui].id]&&unitDone(ui)&&!unitNeeds(ui)}
function nextAction(m){m=m||curMode();var pf=pendingFollow(m);if(pf){var L=lessonById(pf);return {t:'follow',id:pf,ui:L.ui,li:L.li}}
 for(var ui=0;ui<UNITS.length;ui++)if(trk(ui)===m&&lvOf(ui)===curLevel(m)&&testOpen(ui)&&!S.tests[UNITS[ui].id])return {t:'test',ui:ui};
 var nx=nextLesson(m);if(nx)return {t:'lesson',ui:nx[0],li:nx[1]};
 for(ui=0;ui<UNITS.length;ui++){if(trk(ui)!==m||lvOf(ui)!==curLevel(m))continue;var r=S.tests[UNITS[ui].id];if(testOpen(ui)&&!(r&&r.passed))return {t:'test',ui:ui}}
 return null}
function runAction(a){if(!a)return;if(a.t==='follow')startFollow(a.id);else if(a.t==='test')startTest(a.ui);else startLesson(a.ui,a.li)}
function actionLabel(a){return !a?'Back to map':a.t==='follow'?'Start follow-up':a.t==='test'?'Take the '+uLabel(a.ui)+' test':'Next lesson'}
function actionFoot(a){if(!a)return '';if(a.t==='follow')return '<span class="note"><b>Follow-up needed</b> before new lessons.</span>';
 if(a.t==='test')return '<span class="nextfoot"><span class="note">Next: <b>'+uLabel(a.ui)+' test</b></span><span class="nh">15 questions, about 15 minutes. Pass mark 70%.</span></span>';
 var nl=UNITS[a.ui].lessons[a.li];return '<span class="nextfoot"><span class="note">Next: <b>'+nl.title+'</b></span><span class="nh">'+(HOOKS[nl.id]||'')+'</span></span>'}
function goAction(a){return function(){var lu=P&&P.levelUp;if(P)P.levelUp=null;closePlayer();if(a)runAction(a);if(lu!=null&&P)P.levelUp=lu}}

/* ----- gate: a required follow-up blocks new lessons ----- */
function gateFollow(id){var L=lessonById(id),m=$('modal');if(!m||!L)return;
 m.innerHTML='<div class="mcard" role="dialog" aria-modal="true" aria-labelledby="gTitle"><div class="gateic">'+LOCK.replace(/width="13" height="13"/,'width="40" height="40"')+'</div><h2 id="gTitle">Follow-up first</h2><p>You got '+((S.fu[id]&&S.fu[id].last!=null)?S.fu[id].last+'%':'50% or less')+' of the questions right first time in <b>'+L.l.title+'</b>. Score more than 50% on its follow-up to unlock new lessons. It\'s a short recap and 5 questions.</p><button class="big" id="gGo">Start follow-up</button><div style="margin-top:8px"><button class="skip" id="gNo">Not now</button></div></div>';
 m.classList.add('open');$('gGo').focus();$('gGo').onclick=function(){m.classList.remove('open');m.innerHTML='';startFollow(id)};$('gNo').onclick=function(){m.classList.remove('open');m.innerHTML=''}}

/* ----- follow-up sessions ----- */
function startFollow(id){var L=lessonById(id),src=FOLLOW[id];if(!L||!src)return;
 var cards=src.map(function(c,ci){var cc=Object.assign({},c);cc._key='F'+id+'#'+ci;return cc}),head=cards.filter(function(c){return c.t==='T'}),qs=shuffle(cards.filter(function(c){return c.t!=='T'}));
 P={mode:'follow',fid:id,ui:L.ui,li:L.li,cards:head.concat(qs),i:0,xp:0,right:0,asked:0,title:L.l.title,color:L.u.color,unit:'Follow-up · '+L.l.title,required:fuNeed(id),combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
function finishFollow(){P.finished=true;lcount();P.quiet=true;$('pBar').style.width='100%';var id=P.fid,acc=P.asked?Math.round(P.right/P.asked*100):100,pass=acc>PASS_FU,rec=S.fu[id]||{},wasReq=!!rec.need,first=!rec.n,lines=[];
 rec.n=(rec.n||0)+1;rec.best=Math.max(rec.best||0,acc);if(pass)rec.need=false;S.fu[id]=rec;save();
 lines.push(['Answers',P.xp-P.cbonus]);if(P.cbonus)lines.push(['Combo bonus',P.cbonus]);var cb=first?10:5;lines.push(['Follow-up complete',cb]);bonusXP(cb);
 if(pass&&wasReq){S.st.fuFixed++;lines.push(['Back on track',15]);bonusXP(15)}
 qProg('follow',1);save();checkBadges(true);
 var title=pass?(wasReq?'Back on track!':'Follow-up complete!'):(wasReq?'Not quite yet':'Follow-up complete'),
  msg=pass&&wasReq?'<div class="dblock okblock"><div class="dbt">New lessons are unlocked</div><p class="note">Nice work. You can carry on with the course.</p></div>':
   !pass&&wasReq?'<div class="dblock fuwarn"><div class="dbt">You need more than 50% to unlock new lessons</div><p class="note">Read through the explanations, then try again. The questions come in a different order each time. Redoing the lesson first can help too.</p></div>':
   !pass?'<div class="dblock"><div class="dbt">This one\'s still tricky</div><p class="note">It\'s optional, so nothing is locked. Redoing the lesson or trying the follow-up again later will help it stick.</p></div>':'';
 var h='<div class="done-screen"><div class="dicon">'+(pass?'<svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="var(--good-bg)"/><path d="M27 46l12 12 24-26" stroke="var(--good-line)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':'<svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="var(--warn-bg)"/><path d="M45 24v26" stroke="var(--warn)" stroke-width="8" stroke-linecap="round"/><circle cx="45" cy="64" r="5" fill="var(--warn)"/></svg>')+'</div>'+
  '<h2>'+title+'</h2><p class="note" style="font-size:16px">Follow-up: '+P.title+'</p>'+
  '<div class="done-stats"><div class="dstat"><b id="dsXP">+0</b><span>XP earned</span></div><div class="dstat"><b>'+acc+'%</b><span>right first time</span></div><div class="dstat"><b>'+(rec.best)+'%</b><span>best score</span></div></div>'+
  '<div class="xpbreak">'+lines.map(function(l){return '<div><span>'+l[0]+'</span><b>+'+l[1]+'</b></div>'}).join('')+'</div>'+msg;
 if(P.newBadges.length)h+='<div class="dblock"><div class="dbt">Badges earned</div><div class="newbs">'+P.newBadges.map(function(bd){return '<span class="nbchip"><span class="tb" style="background:'+bd.col+'">'+bd.ic+'</span>'+bd.name+'</span>'}).join('')+'</div></div>';
 $('pBody').innerHTML=h+'</div>';$('pScroll').scrollTop=0;$('pXP').textContent='+'+P.xp+' XP';countUp($('dsXP'),0,P.xp,'+');foot('','','');
 if(!pass&&wasReq){var L=lessonById(id);mainBtn('Try again',function(){closePlayer();startFollow(id)});skipBtn(function(){closePlayer();startLesson(L.ui,L.li)},'Redo the lesson');$('pFb').innerHTML='<span class="note">Score more than 50% to unlock new lessons.</span>'}
 else{var a=nextAction();$('pFb').innerHTML=actionFoot(a);mainBtn(actionLabel(a),goAction(a));skipBtn(null)}
 if(pass){sfx('done');confetti()}
 if(P.levelUp!=null){var lu=P.levelUp;P.levelUp=null;setTimeout(function(){showLevelUp(lu)},1100)}}

/* ----- unit tests ----- */
function testCards(ui){var u=UNITS[ui],pool=shuffle(TESTS[u.id]).slice(0,TEST_POOL_N).map(function(c){return Object.assign({},c)}),extra=[];
 u.lessons.forEach(function(l){l.cards.concat(FOLLOW[l.id]||[]).forEach(function(c){if(c.t==='Q'||c.t==='N'||c.t==='O'){var cc=Object.assign({},c);cc._lid=l.id;extra.push(cc)}})});
 return shuffle(pool.concat(shuffle(extra).slice(0,TEST_N-pool.length)))}
function startTest(ui){if(!testOpen(ui)){toast(LOCK,'Unit test locked',unitNeeds(ui)?'Pass your follow-up first.':'Finish every lesson in this unit first.');return}
 var u=UNITS[ui];P={mode:'test',ui:ui,cards:testCards(ui),i:0,xp:0,right:0,asked:0,title:uLabel(ui)+' test',color:u.color,unit:uLabel(ui)+' test',answers:[],t0:Date.now(),combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer();startTimer()}
var TIMER=null;
function fmtClock(s){return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)}
function startTimer(){stopTimer();TIMER=setInterval(function(){if(!P||P.mode!=='test'||P.finished){stopTimer();return}updTimer()},500);updTimer()}
function stopTimer(){if(TIMER){clearInterval(TIMER);TIMER=null}}
function updTimer(){if(!P||P.mode!=='test')return;var s=Math.floor((Date.now()-P.t0)/1000);$('pXP').innerHTML='<span class="ttime'+(s>TEST_MINS*60?' over':'')+'">'+fmtClock(s)+' / '+TEST_MINS+':00</span>'}
function nextLabel(){return P.i===P.cards.length-1?'Finish test':'Next'}
function correctText(c){return c.t==='RF'?String(c.b).replace(/[&<>]/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[x]}):c.t==='Q'?c.o[c.a]:c.t==='N'?fmtAns(c.a)+(c.u?' '+c.u:''):c.items.map(function(t,i){return (i+1)+'. '+t}).join('<br>')}
function numOK(c,v){var tol=c.tol==null?0.02:c.tol;return c.a===0?Math.abs(v)<=(tol||1e-9):Math.abs(v-c.a)<=Math.abs(c.a)*(tol+1e-9)}
function testRecord(c,ok,given){if(P.rev)try{REV.mark(c,ok)}catch(_){}P.answers.push({c:c,ok:ok,given:given,correct:correctText(c)});P.asked++;if(ok)P.right++;nextCard()}
function testSkip(){var c=P.cards[P.i];testRecord(c,false,'(skipped)')}
function testHead(c,b){var p=el('div','qprompt',c.p,b)}
function tQ(c,b){testHead(c,b);var box=el('div','opts',null,b),sel=-1,btns={};
 shuffle(c.o.map(function(_,i){return i})).forEach(function(k){var o=el('button','opt',c.o[k],box);btns[k]=o;o.onclick=function(){sel=k;for(var j in btns)btns[j].classList.toggle('sel',+j===k);mainBtn(nextLabel(),go,false)}});
 mainBtn(nextLabel(),go,true);skipBtn(testSkip,'Skip');
 function go(){if(sel<0)return;testRecord(c,sel===c.a,c.o[sel])}}
function tN(c,b){testHead(c,b);var r=el('div','numrow','<input class="numin" inputmode="decimal" autocomplete="off" placeholder="Your answer"><span class="numunit">'+(c.u||'')+'</span>',b),inp=r.querySelector('input');
 el('p','small','Type a number. You can write powers of ten like 3e-5 or 3×10^-5.',b);
 inp.oninput=function(){mainBtn(nextLabel(),go,inp.value.trim()==='');foot('','','')};mainBtn(nextLabel(),go,true);skipBtn(testSkip,'Skip');setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){}},50);
 function go(){var v=parseNum(inp.value);if(isNaN(v)){foot('no','That isn\'t a number','<div>Try something like 0.25, 420 or 3e-5.</div>');return}testRecord(c,numOK(c,v),inp.value.trim()+(c.u?' '+c.u:''))}}
function tO(c,b){testHead(c,b);el('p','small','Use the arrows to put these in the right order (first at the top).',b);var ul=el('ol','ord',null,b),ord=c.items.map(function(_,i){return i});
 do{ord=shuffle(ord)}while(ord.every(function(v,i){return v===i})&&ord.length>1);
 function draw(){ul.innerHTML='';ord.forEach(function(k,i){var li=el('li',null,'<span class="n">'+(i+1)+'</span><span class="t">'+c.items[k]+'</span><span class="mv"><button aria-label="Move up">▲</button><button aria-label="Move down">▼</button></span>',ul),bs=li.querySelectorAll('button');
  bs[0].onclick=function(){if(i===0)return;var t=ord[i-1];ord[i-1]=ord[i];ord[i]=t;draw()};bs[1].onclick=function(){if(i===ord.length-1)return;var t=ord[i+1];ord[i+1]=ord[i];ord[i]=t;draw()}})}
 draw();mainBtn(nextLabel(),function(){testRecord(c,ord.every(function(v,i){return v===i}),ord.map(function(k,i){return (i+1)+'. '+c.items[k]}).join('<br>'))},false);skipBtn(testSkip,'Skip')}
function finishTest(){if(P.rev)return REV.endMock();P.finished=true;lcount();P.quiet=true;stopTimer();$('pBar').style.width='100%';
 var u=UNITS[P.ui],uid=u.id,n=P.answers.length,ok=P.answers.filter(function(a){return a.ok}).length,pct=Math.round(ok/n*100),secs=Math.round((Date.now()-P.t0)/1000),pass=pct>=PASS_TEST,prev=S.tests[uid]||{},firstPass=pass&&!prev.passed,lines=[];
 S.tests[uid]={best:Math.max(prev.best||0,pct),passed:!!prev.passed||pass,n:(prev.n||0)+1,last:today(),lastPct:pct};save();EASE.record(trk(P.ui),lvOf(P.ui),pct);
 if(ok){lines.push(['Correct answers ('+ok+' × 5)',ok*5]);bonusXP(ok*5)}if(firstPass){lines.push(['First pass bonus',50]);bonusXP(50)}if(pct===100){lines.push(['Full marks',25]);bonusXP(25)}
 save();checkBadges(true);
 var weak={},order=[];P.answers.forEach(function(a){if(!a.ok&&a.c._lid){if(!weak[a.c._lid]){weak[a.c._lid]=0;order.push(a.c._lid)}weak[a.c._lid]++}});
 var r=48,C=2*Math.PI*r,col=pass?'var(--good-line)':'#e8742a';
 var h='<div class="done-screen"><svg width="120" height="120" viewBox="0 0 120 120" class="dicon"><circle cx="60" cy="60" r="'+r+'" fill="none" stroke="var(--soft2)" stroke-width="11"/><circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(C*pct/100)+' '+C+'" transform="rotate(-90 60 60)"/><text x="60" y="60" text-anchor="middle" dy=".35em" font-size="26" font-weight="800" fill="var(--text)" font-family="system-ui">'+pct+'%</text></svg>'+
  '<h2>'+(pass?(pct===100?'Full marks!':'Test passed!'):'Not passed yet')+'</h2><p class="note" style="font-size:16px">'+uLabel(P.ui)+': '+u.title+(pass?'':' · pass mark '+PASS_TEST+'%')+'</p>'+
  '<div class="done-stats"><div class="dstat"><b>'+ok+'/'+n+'</b><span>correct</span></div><div class="dstat"><b>'+fmtClock(secs)+'</b><span>time (target '+TEST_MINS+':00)</span></div><div class="dstat"><b>'+S.tests[uid].best+'%</b><span>best score</span></div></div>';
 if(lines.length)h+='<div class="xpbreak">'+lines.map(function(l){return '<div><span>'+l[0]+'</span><b>+'+l[1]+'</b></div>'}).join('')+'<div><span>Total</span><b id="dsXP">+0</b></div></div>';
 if(order.length)h+='<div class="dblock"><div class="dbt">Topics to work on</div><p class="note">The questions you missed came from these lessons. Their follow-ups are a quick way to practise.</p>'+order.map(function(lid){var L=lessonById(lid);return L?'<div class="weak"><span><b>'+L.l.title+'</b><span class="note"> · '+weak[lid]+' missed</span></span><button class="ghost sm" data-wf="'+lid+'">Practise</button></div>':''}).join('')+'</div>';
 if(!pass)h+=EASE.endBlock(P.ui,pct,ok,n,'test');
 if(P.newBadges.length)h+='<div class="dblock"><div class="dbt">Badges earned</div><div class="newbs">'+P.newBadges.map(function(bd){return '<span class="nbchip"><span class="tb" style="background:'+bd.col+'">'+bd.ic+'</span>'+bd.name+'</span>'}).join('')+'</div></div>';
 h+='<div class="treview"><div class="dbt">Your answers</div>'+P.answers.map(function(a,i){return '<details class="tq '+(a.ok?'ok':'no')+'"'+(a.ok?'':' open')+'><summary><span class="tqn">'+(i+1)+'</span><span class="tqm">'+(a.ok?'✓':'✗')+'</span><span class="tqp">'+a.c.p+'</span></summary><div class="tqb">'+(a.ok?'<p><b>Your answer:</b> '+a.given+'</p>':'<p><b>Your answer:</b> '+a.given+'</p><p><b>Correct answer:</b> '+a.correct+'</p>')+(a.c.e?'<p class="note">'+a.c.e+'</p>':'')+'</div></details>'}).join('')+'</div>';
 $('pBody').innerHTML=h+'</div>';$('pScroll').scrollTop=0;$('pXP').innerHTML='<span class="ttime">'+fmtClock(secs)+'</span>';if($('dsXP'))countUp($('dsXP'),0,P.xp,'+');
 [].forEach.call(document.querySelectorAll('[data-wf]'),function(bt){bt.onclick=function(){var lid=bt.dataset.wf;closePlayer();startFollow(lid)}});
 foot('','','');var ui=P.ui,a=nextAction();if(a&&a.t==='test'&&a.ui===ui)a=null;
 $('pFb').innerHTML=pass?actionFoot(a):'<span class="note">Practise the topics above, then try again. You get different questions each time.</span>';
 mainBtn(pass?actionLabel(a):'Back to map',pass?goAction(a):closePlayer);skipBtn(function(){closePlayer();startTest(ui)},'Retake test');
 if(pass){sfx(pct===100?'level':'done');confetti()}
 if(P.levelUp!=null){var lu=P.levelUp;P.levelUp=null;setTimeout(function(){showLevelUp(lu)},1100)}}

/* ----- progress page card ----- */
function testsCard(){var h='<div class="card"><h2>Unit tests</h2><p class="note" style="font-size:15px">Each unit ends with a 15-question test (about 15 minutes, pass mark 70%). Finish every lesson in a unit to unlock it.</p><div class="tgrid">';
 UNITS.forEach(function(u,ui){var r=S.tests[u.id],open=testOpen(ui);h+='<button class="tcell'+(r&&r.passed?' pass':'')+(open?'':' locked')+'" data-tu="'+ui+'"><span class="tcu" style="background:'+u.color+'">'+u.icon+'</span><span class="tct"><b>'+uLabel(ui)+'</b><span>'+u.title+'</span></span><span class="tcs">'+(r?r.best+'%'+(r.passed?' ✓':''):open?'Ready':LOCK)+'</span></button>'});
 return h+'</div></div>'}
function wireTestsCard(){[].forEach.call(document.querySelectorAll('[data-tu]'),function(b){b.onclick=function(){startTest(+b.dataset.tu)}})}

