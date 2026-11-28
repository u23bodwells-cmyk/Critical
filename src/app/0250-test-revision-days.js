/* ===== revise for a test: each test gets a countdown, and the days before it become revision days in the weekly plan ===== */
var REV=(function(){
 var SUBJ={gm:'GCSE Maths',gp:'GCSE Physics',gc:'GCSE Chemistry',gcs:'GCSE Computer Science'},COL='#7F77DD';
 function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function R(){if(!S.rev||typeof S.rev!=='object')S.rev={};var r=S.rev;if(!Array.isArray(r.tests))r.tests=[];if(!r.miss||typeof r.miss!=='object')r.miss={};if(!r.log||typeof r.log!=='object')r.log={};if(!r.mocks||typeof r.mocks!=='object')r.mocks={};return r}
 function s2d(s){var a=String(s).split('-');return new Date(+a[0],a[1]-1,+a[2],12)}
 function addD(s,n){var d=s2d(s);d.setDate(d.getDate()+n);return dstr(d)}
 function diff(a,b){return Math.round((s2d(b)-s2d(a))/864e5)}
 function nice(s){return s2d(s).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
 function short(s){return s2d(s).toLocaleDateString('en-GB',{weekday:'short'})}
 function inDays(s){var n=diff(today(),s);return n===0?'today':n===1?'tomorrow':n<0?(n===-1?'yesterday':-n+' days ago'):'in '+n+' days'}
 function tdI(){return (new Date().getDay()+6)%7}
 function uIdx(id){for(var i=0;i<UNITS.length;i++)if(UNITS[i].id===id)return i;return -1}
 /* a topic is a whole unit (e.g. gp3-1 Forces) or one lesson in it (e.g. gp3-1-1 Scalars, vectors and resultant forces) */
 var TI=null;function tInfo(id){if(!TI||TI._n!==UNITS.length){TI={_n:UNITS.length};UNITS.forEach(function(u,ui){TI[u.id]={ui:ui,li:-1,title:u.title};u.lessons.forEach(function(l,li){TI[l.id]={ui:ui,li:li,title:l.title,ut:u.title}})})}return TI[id]||null}
 function tLessons(id){var x=tInfo(id);if(!x)return [];if(x.li>=0)return [[x.ui,x.li]];return UNITS[x.ui].lessons.map(function(_,li){return [x.ui,li]})}
 function tOrd(id){var x=tInfo(id);return x?x.ui*1000+(x.li+1):1e9}
 function testOf(id){var r=R();for(var i=0;i<r.tests.length;i++)if(r.tests[i].id===id)return r.tests[i];return null}
 function subjName(t){return t.subj==='own'?(t.sname||'Your subject'):SUBJ[t.subj]||'Test'}
 function tName(t){return t.name||subjName(t)+' test'}
 function cards(t){return (t.cards||[]).filter(function(c){return c&&c.q&&c.a})}
 function uTitles(ids){return (ids||[]).map(function(id){var x=tInfo(id);return x?x.title:null}).filter(Boolean)}
 /* the revision days: the t.days days before the test, but never before the day the test was added (or after it was deleted) */
 function sched(t){var out=[];if(!t||!t.date)return out;var d=addD(t.date,-Math.max(1,Math.min(7,t.days||3))),g=0;if(t.from&&t.from>d)d=t.from;
  for(;d<t.date&&g++<20;d=addD(d,1)){if(t.gone&&d>=t.gone)break;out.push(d)}return out}
 /* topics are shared out over the revision days; the last day is a mini mock on everything */
 function plan(t){var D=sched(t),n=D.length,U=(t.units||[]).filter(function(id){return !!tInfo(id)}),pd=n-1,out={};
  D.forEach(function(d,k){var last=k===n-1,us=[];if(t.subj!=='own'&&U.length){if(last)us=U.slice();else if(U.length>=pd)us=U.filter(function(_,j){return Math.floor(j*pd/U.length)===k});else us=[U[k%U.length]]}
   out[d]={k:k+1,n:n,mock:last,units:us}});return out}
 function dayInfo(dk){var best=null;R().tests.forEach(function(t){var p=plan(t)[dk];if(p&&(!best||t.date<best.t.date))best={t:t,p:p}});if(!best)return null;
  var t=best.t,p=best.p;return build({tid:t.id,dk:dk,name:tName(t),subj:t.subj,date:t.date,k:p.k,n:p.n,mock:p.mock,units:p.units})}
 function build(pin){var t=testOf(pin.tid),tl=uTitles(pin.units),nc=t?cards(t).length:0,own=pin.subj==='own',d=nice(pin.date);
  var desc=pin.mock?'Last day before your '+pin.name+' ('+d+'). Start with the mini mock test on '+(own?'all your flashcards':'everything')+', then practise what you got wrong.':
   'Revision day '+pin.k+' of '+pin.n+' for your '+pin.name+' ('+d+'). '+(own?'Go through your '+nc+' flashcard'+(nc===1?'':'s')+' until the timer\'s done.':'Today\'s topic'+(tl.length===1?'':'s')+': '+tl.join(', ')+'. Do practice rounds until the timer\'s done.');
  return {pin:pin,tid:pin.tid,name:pin.name,desc:desc,mock:!!pin.mock,units:pin.units||[]}}
 /* ----- questions ----- */
 function poolUnits(uids){var pool=[],seen={};(uids||[]).forEach(function(id){var x=tInfo(id);if(!x)return;var u=UNITS[x.ui];
   tLessons(id).forEach(function(p){var l=u.lessons[p[1]];if(seen[l.id])return;seen[l.id]=1;function add(c,k,keep){if(!c||(c.t!=='Q'&&c.t!=='N'&&c.t!=='O'))return;var cc=Object.assign({},c);cc._src=u.title+' · '+l.title;if(keep)cc._key=k;cc._rk=k;cc._lid=l.id;cc._uid=u.id;pool.push(cc)}
    l.cards.forEach(function(c,ci){add(c,l.id+'#'+ci,1)});(FOLLOW[l.id]||[]).forEach(function(c,ci){add(c,'F'+l.id+'#'+ci,1)});(BANK[l.id]||[]).forEach(function(c,ci){add(c,'B'+l.id+'#'+ci)})});
   if(x.li<0)(TESTS[u.id]||[]).forEach(function(c,ci){if(!c||(c.t!=='Q'&&c.t!=='N'&&c.t!=='O'))return;var cc=Object.assign({},c);cc._src=u.title+' · exam-style';cc._rk='T'+u.id+'#'+ci;cc._uid=u.id;pool.push(cc)})});return pool}
 var BANK={
  'gp3-1-1':[
   Q(`Which of these is a <b>scalar</b> quantity?`,['Speed','Velocity','Force','Displacement'],0,`A scalar has size only. Speed is just how fast; velocity is speed <i>in a given direction</i>, so it's a vector.`),
   Q(`Which of these is a <b>vector</b> quantity?`,['Acceleration','Mass','Temperature','Energy'],0,`Acceleration has a direction. Mass, temperature and energy only have a size.`),
   Q(`What's the difference between a scalar and a vector?`,['A vector has a direction as well as a size; a scalar only has a size','A scalar has a direction; a vector doesn\'t','Vectors are always bigger than scalars','Scalars can\'t be measured'],0,`Both have a size (magnitude). Only a vector also has a direction.`),
   Q(`Which list contains <b>only</b> vectors?`,['Force, velocity, momentum','Mass, force, energy','Speed, distance, time','Weight, mass, density'],0,`Force, velocity and momentum all have directions. Mass, energy, speed, distance, time and density don't.`),
   Q(`Which of these is <b>not</b> a vector?`,['Distance','Momentum','Weight','Displacement'],0,`Distance is how far, with no direction. Displacement is how far <i>in a straight line in a given direction</i>.`),
   Q(`Distance is to displacement as speed is to…`,['velocity','acceleration','time','force'],0,`Distance and speed are scalars. Add a direction and they become displacement and velocity.`),
   Q(`Weight is a…`,['vector, because it\'s a force and acts downwards','scalar, because it\'s measured in kg','scalar, because it never changes','vector, because it\'s measured in kg'],0,`Weight is a force (in newtons) acting towards the centre of the Earth, so it has a direction. Mass, in kg, is the scalar.`),
   Q(`How is a vector shown on a diagram?`,['As an arrow: its length shows the size and it points in the direction','As a dot with the size written next to it','As a line with no arrowhead','As a circle whose size shows the magnitude'],0,`The length of the arrow (to scale) is the magnitude, and the arrowhead shows the direction.`),
   Q(`A car goes round a roundabout at a steady 20 m/s. Which is true?`,['Its speed stays the same but its velocity changes','Its velocity stays the same but its speed changes','Both stay the same','Both change'],0,`Its direction keeps changing, so its velocity changes even though its speed doesn't.`),
   Q(`Velocity is…`,['speed in a given direction','the same as speed','distance moved in any direction','how quickly speed changes'],0,`Velocity = speed + direction. How quickly velocity changes is acceleration.`),
   N(`A runner does one lap of a 400 m track and finishes where she started. What is the size of her displacement?`,0,0.01,'m',`She's back where she started, so her displacement is 0 m, even though she's run a distance of 400 m.`),
   N(`Sam walks 30 m east, then 40 m west. What total distance does he walk?`,70,0.01,'m',`Distance ignores direction: 30 + 40 = 70 m.`),
   N(`Sam walks 30 m east, then 40 m west. What is the size of his displacement?`,10,0.01,'m',`The directions are opposite, so subtract: 40 − 30 = 10 m (west).`),
   N(`Forces of 6 N and 9 N act on an object in the same direction. What is the resultant force?`,15,0.01,'N',`Same direction: add. 6 + 9 = 15 N.`),
   N(`Forces of 8 N and 5 N act on an object in opposite directions. What is the size of the resultant force?`,3,0.01,'N',`Opposite directions: subtract. 8 − 5 = 3 N, in the direction of the 8 N force.`),
   Q(`Two people push a box with 10 N each, in opposite directions. What happens?`,['The resultant force is 0 N, so its motion doesn\'t change','It speeds up in the direction of the first push','The resultant force is 20 N','It must move at 10 m/s'],0,`Balanced forces: 10 − 10 = 0 N. A stationary box stays still; a moving one carries on at the same velocity.`),
   N(`Forces of 6 N east and 8 N north act on an object. What is the size of the resultant force?`,10,0.01,'N',`At right angles, use Pythagoras: √(6² + 8²) = √100 = 10 N.`),
   N(`A boat's engine pushes it 12 N north while the current pushes it 9 N east. What is the size of the resultant force?`,15,0.01,'N',`√(12² + 9²) = √225 = 15 N.`),
   N(`Two forces of 20 N and 15 N act at right angles. What is the size of the resultant?`,25,0.01,'N',`√(20² + 15²) = √625 = 25 N.`),
   N(`Two forces of 7 N act at right angles to each other. What is the size of the resultant? (1 decimal place)`,9.9,0.006,'N',`√(7² + 7²) = √98 = 9.9 N.`),
   N(`A plane flies north at 200 m/s while the wind pushes it east at 50 m/s. What is the size of its resultant velocity? (nearest whole number)`,206,0.004,'m/s',`Velocities are vectors too, so they add the same way: √(200² + 50²) = √42,500 ≈ 206 m/s.`),
   N(`On a scale drawing, 1 cm represents 2 N. A force arrow is 6.5 cm long. What force does it show?`,13,0.01,'N',`6.5 × 2 = 13 N.`),
   N(`A resultant arrow on a scale drawing is 7.5 cm long. The scale is 1 cm = 4 N. What is the resultant force?`,30,0.01,'N',`7.5 × 4 = 30 N.`),
   O(`Put the steps in order for finding the resultant of two forces at right angles with a scale drawing.`,['Choose a scale, e.g. 1 cm = 1 N','Draw the first force to scale as an arrow','Draw the second force from the tip of the first, at right angles','Draw the resultant from the start of the first arrow to the tip of the second','Measure the resultant and use the scale to change it into newtons'],`Tip to tail, then join the start to the end. Measure the angle too if you're asked for the direction.`),
   Q(`What does <b>resolving</b> a force mean? (Higher)`,['Splitting it into two forces at right angles that together have the same effect','Finding which way it points','Making it smaller','Adding it to its reaction force'],0,`The two components, drawn tip to tail, make the original force. You can find them with a scale drawing.`)
  ]};
 function poolOwn(t){var cs=cards(t),ans=[];cs.forEach(function(c){if(ans.indexOf(c.a)<0)ans.push(c.a)});
  return cs.map(function(c,i){return {t:'RF',q:c.q,b:c.a,p:esc(c.q),_src:subjName(t)+' · your flashcard',_rk:'O'+t.id+'#'+(c.id||i),_all:ans}})}
 function asMC(c){if(!c||c.t!=='RF'||!c._all)return null;var oth=shuffle(c._all.filter(function(a){return a!==c.b})).slice(0,3);if(oth.length<3)return null;var o=shuffle([c.b].concat(oth));
  return {t:'Q',p:esc(c.q),o:o.map(esc),a:o.indexOf(c.b),e:'',_src:c._src,_rk:c._rk,_ty:null}}
 function poolFor(tid,uids){var t=testOf(tid);if(t&&t.subj==='own')return poolOwn(t);return poolUnits(uids&&uids.length?uids:(t&&t.units)||[])}
 function missN(pool){var m=R().miss;return pool.filter(function(c){return m[c._rk]}).length}
 /* half of a round comes from questions you got wrong before, the rest you haven't been asked lately */
 function pick(pool,n){var m=R().miss,a=shuffle(pool.filter(function(c){return m[c._rk]})),b=shuffle(pool.filter(function(c){return !m[c._rk]})),h=Math.ceil(n/2);return shuffle(a.slice(0,h).concat(b,a.slice(h)).slice(0,n))}
 function logT(tid,dk){var r=R();if(!r.log[tid])r.log[tid]={};dk=dk||today();return r.log[tid][dk]||(r.log[tid][dk]={q:0,r:0})}
 function mark(c,ok){if(typeof P==='undefined'||!P||!P.rev||!c||!c._rk)return;var r=R();if(ok)delete r.miss[c._rk];else r.miss[c._rk]=1;var l=logT(P.rev.tid);l.q++;if(ok)l.r++;save()}
 function doneDay(pin){if(!pin)return;logT(pin.tid,pin.dk).done=1;save()}
 function newP(o){return Object.assign({i:0,xp:0,right:0,asked:0,color:COL,combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null},o)}
 function startP(p,test){closeHub();try{if(window.PLAN)PLAN.close()}catch(_){}if(typeof P!=='undefined'&&P&&document.querySelector('#player.open'))closePlayer();P=newP(p);openPlayer();if(test)startTimer()}
 function practice(tid,uids,missOnly){var pool=poolFor(tid,uids);if(missOnly)pool=pool.filter(function(c){return R().miss[c._rk]});
  if(!pool.length){toast(BOLT,missOnly?'Nothing left to fix':'No questions yet',missOnly?'You\'ve fixed every revision mistake. Nice.':'Add topics or flashcards to this test first.');if(missOnly)back(tid);return}
  var cs=pick(pool,10).map(function(c){return c.t==='RF'&&Math.random()<.5?(asMC(c)||c):c});
  startP({mode:'review',rev:{tid:tid,uids:uids||null,miss:!!missOnly},cards:cs,title:'Revision',unit:'Revision'})}
 function mock(tid){var t=testOf(tid),pool=poolFor(tid,null);if(!pool.length){toast(BOLT,'No questions yet','Add topics or flashcards to this test first.');return}
  var cs=shuffle(pool).slice(0,Math.min(15,pool.length)).map(function(c){return c.t==='RF'?(asMC(c)||c):c}),u0=t&&t.units&&t.units.length&&tInfo(t.units[0])?tInfo(t.units[0]).ui:-1;
  startP({mode:'test',rev:{tid:tid,mock:1},ui:u0>=0?u0:undefined,cards:cs,title:'Mini mock',unit:'Mini mock',answers:[],t0:Date.now()},true)}
 /* your own flashcards: think of the answer, show it, say if you knew it */
 function rf(c,b,test){if(!test)P.asked++;var p=el('div','qprompt',null,b);p.textContent=c.q;var ans=el('div','prose rvans',null,b);ans.textContent=c.b;ans.style.display='none';
  var row=el('div','opts',null,b);row.style.display='none';row.innerHTML='<button class="opt" data-k="1">✓ I knew it</button><button class="opt" data-k="0">✗ Not yet</button>';
  mainBtn('Show answer',function(){ans.style.display='block';row.style.display='grid';mainBtn('Choose one',function(){},true)});if(test)skipBtn(testSkip,'Skip');
  [].forEach.call(row.querySelectorAll('.opt'),function(o){o.onclick=function(){var ok=o.getAttribute('data-k')==='1';[].forEach.call(row.querySelectorAll('.opt'),function(x){x.disabled=true});o.classList.add(ok?'right':'wrong');
   if(test){testRecord(c,ok,ok?'I knew it':'Not yet');return}
   if(ok){gotRight(c);foot('ok',praise(),'')}else{P.st.tries=1;gotWrong(c);foot('no','It\'ll come up again','It goes to the front of your next round.')}mainBtn('Continue',nextCard)}})}
 function tick(){return '<svg width="90" height="90" viewBox="0 0 90 90" class="dicon"><circle cx="45" cy="45" r="42" fill="var(--good-bg)"/><path d="M27 46l12 12 24-26" stroke="var(--good-line)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
 function timerLine(){try{var ms=PLAN.runLeft();if(ms==null)return '';return '<p class="note">Today\'s plan: <b>'+(ms>0?Math.ceil(ms/60000)+' min left':'time\'s up')+'</b>.</p>'}catch(_){return ''}}
 function planLeft(){try{var ms=PLAN.runLeft();return ms==null?'':' · plan timer: <b>'+(ms>0?Math.ceil(ms/60000)+' min left':'time\'s up')+'</b>'}catch(_){return ''}}
 function endPractice(){P.finished=true;lcount();P.quiet=true;$('pBar').style.width='100%';var rv=P.rev,t=testOf(rv.tid),acc=P.asked?Math.round(P.right/P.asked*100):100,left=missN(poolFor(rv.tid,null));
  S.st.reviews=(S.st.reviews||0)+1;bonusXP(10);save();checkBadges(true);
  $('pBody').innerHTML='<div class="done-screen">'+tick()+'<h2>Round done</h2><p class="note" style="font-size:16px">'+esc(t?tName(t):'Revision')+'</p>'+
   '<div class="done-stats"><div class="dstat"><b>'+P.right+'/'+P.asked+'</b><span>right first time</span></div><div class="dstat"><b>'+acc+'%</b><span>accuracy</span></div><div class="dstat"><b>'+left+'</b><span>still to fix</span></div></div>'+timerLine()+'</div>';
  $('pScroll').scrollTop=0;$('pXP').textContent='+'+P.xp+' XP';foot('','','');
  mainBtn('Another round',function(){closePlayer();practice(rv.tid,rv.miss&&!left?null:rv.uids,rv.miss&&left>0)});skipBtn(function(){closePlayer();back(rv.tid)},'Back to revision');sfx('done');confetti()}
 function endMock(){P.finished=true;lcount();P.quiet=true;stopTimer();$('pBar').style.width='100%';
  var rv=P.rev,t=testOf(rv.tid),r=R(),n=P.answers.length,ok=P.answers.filter(function(a){return a.ok}).length,pct=n?Math.round(ok/n*100):0,secs=Math.round((Date.now()-P.t0)/1000);
  var ms=r.mocks[rv.tid]||(r.mocks[rv.tid]=[]);ms.push({d:today(),pct:pct});while(ms.length>20)ms.shift();if(ok)bonusXP(ok*5);save();checkBadges(true);
  var weak={},order=[];P.answers.forEach(function(a){var id=a.c._lid||a.c._uid;if(!a.ok&&id){if(!weak[id]){weak[id]=0;order.push(id)}weak[id]++}});
  var rr=48,C=2*Math.PI*rr,col=pct>=70?'var(--good-line)':pct>=50?'#EF9F27':'#e8742a';
  var h='<div class="done-screen"><svg width="120" height="120" viewBox="0 0 120 120" class="dicon"><circle cx="60" cy="60" r="'+rr+'" fill="none" stroke="var(--soft2)" stroke-width="11"/><circle cx="60" cy="60" r="'+rr+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(C*pct/100)+' '+C+'" transform="rotate(-90 60 60)"/><text x="60" y="60" text-anchor="middle" dy=".35em" font-size="26" font-weight="800" fill="var(--text)" font-family="system-ui">'+pct+'%</text></svg>'+
   '<h2>'+(pct>=85?'You\'re ready for it':pct>=60?'Nearly there':'Worth some more practice')+'</h2><p class="note" style="font-size:16px">Mini mock · '+esc(t?tName(t):'')+(t?' · test '+inDays(t.date):'')+'</p>'+
   '<div class="done-stats"><div class="dstat"><b>'+ok+'/'+n+'</b><span>correct</span></div><div class="dstat"><b>'+fmtClock(secs)+'</b><span>time</span></div><div class="dstat"><b id="dsXP">+0</b><span>XP</span></div></div>';
  if(order.length)h+='<div class="dblock"><div class="dbt">Topics to work on</div>'+order.map(function(id){var x=tInfo(id);return x?'<div class="weak"><span><b>'+esc(x.title)+'</b><span class="note"> · '+weak[id]+' missed</span></span></div>':''}).join('')+'</div>';
  h+='<div class="treview"><div class="dbt">Your answers</div>'+P.answers.map(function(a,i){return '<details class="tq '+(a.ok?'ok':'no')+'"'+(a.ok?'':' open')+'><summary><span class="tqn">'+(i+1)+'</span><span class="tqm">'+(a.ok?'✓':'✗')+'</span><span class="tqp">'+a.c.p+'</span></summary><div class="tqb"><p><b>Your answer:</b> '+a.given+'</p>'+(a.ok?'':'<p><b>Correct answer:</b> '+a.correct+'</p>')+(a.c.e?'<p class="note">'+a.c.e+'</p>':'')+'</div></details>'}).join('')+'</div>';
  $('pBody').innerHTML=h+timerLine()+'</div>';$('pScroll').scrollTop=0;$('pXP').innerHTML='<span class="ttime">'+fmtClock(secs)+'</span>';countUp($('dsXP'),0,P.xp,'+');foot('','','');
  if(n-ok>0){mainBtn('Practise what I got wrong',function(){closePlayer();practice(rv.tid,null,true)});skipBtn(function(){closePlayer();back(rv.tid)},'Back to revision')}else{mainBtn('Back to revision',function(){closePlayer();back(rv.tid)});skipBtn(null)}
  sfx('done');if(pct>=60)confetti()}
 /* ----- the revision screen ----- */
 var hubEl=null;
 function closeHub(){if(hubEl){hubEl.remove();hubEl=null}}
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&hubEl)closeHub()});
 function back(tid){var inf=null;try{var b=PLAN.DAY(tdI())[0];if(b&&b[5]==='rev'&&b[6].tid===tid)inf=b[6]}catch(_){}hub(inf||tid)}
 function dayChips(t){var D=sched(t),pl=plan(t),td=today(),lg=R().log[t.id]||{};if(!D.length)return '';
  return '<div class="rvdays">'+D.map(function(d){var st=lg[d]&&lg[d].done?'done':d===td?'now':d<td?'miss':'';return '<span class="rvday '+st+'" title="'+nice(d)+'"><b>'+short(d)+'</b><i>'+(pl[d].mock?'Mock':'Day '+pl[d].k)+'</i></span>'}).join('')+'<span class="rvday test" title="'+nice(t.date)+'"><b>'+short(t.date)+'</b><i>Test</i></span></div>'}
 function hub(x){var info=x&&typeof x==='object'?x:null,tid=info?info.tid:x,t=testOf(tid);if(!t&&!info)return;closeHub();
  var subj=t?t.subj:info.pin.subj,own=subj==='own',name=t?tName(t):info.name,date=t?t.date:info.pin.date,day=info&&!info.mock?info.units:null,mockDay=!!(info&&info.mock),
   allPool=poolFor(tid,null),pool=day?poolFor(tid,day):allPool,mn=missN(allPool),lg=(R().log[tid]||{})[today()]||{q:0,r:0},mocked=(R().mocks[tid]||[]).some(function(m){return m.d===today()}),
   shown=day||(t?t.units:info.units)||[];
  var h='<div class="plbox rvbox" role="dialog" aria-modal="true" aria-label="Revision"><div class="plhd"><b>Revision</b><button class="plx" type="button" aria-label="Close">✕</button></div>'+
   '<div class="rvhead"><p class="rvk">'+esc(t?subjName(t):'Revision')+(info?' · '+(info.mock?'last day before the test':'revision day '+info.pin.k+' of '+info.pin.n):'')+'</p><h3>'+esc(name)+'</h3><p>'+nice(date)+' · <b>'+inDays(date)+'</b></p>'+(t?dayChips(t):'')+'</div>';
  if(own)h+='<p class="plnote">'+allPool.length+' flashcard'+(allPool.length===1?'':'s')+'. You get a mix of "do you know it?" cards and multiple choice.</p>';
  else h+='<div><p class="plgt">'+(day?'Today\'s topics':'Topics in the test')+'</p><div class="rvchips">'+uTitles(shown).map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div></div>';
  h+='<div class="rvacts"></div><p class="plnote">Today: <b>'+lg.q+'</b> question'+(lg.q===1?'':'s')+(lg.q?', '+Math.round(lg.r/lg.q*100)+'% right first time':'')+(mn?' · <b>'+mn+'</b> still to fix':'')+planLeft()+'</p>';
  if(!own){var ls=[];var sl={};shown.forEach(function(id){tLessons(id).forEach(function(p){var k=p[0]+'-'+p[1];if(sl[k])return;sl[k]=1;ls.push([p[0],p[1],UNITS[p[0]].lessons[p[1]].title])})});
   if(ls.length)h+='<details class="rvread"><summary>Re-read a lesson first</summary><div>'+ls.map(function(x){return '<button type="button" class="plgo alt" data-ui="'+x[0]+'" data-li="'+x[1]+'">'+esc(x[2])+'</button>'}).join('')+'</div></details>'}
  var ov=document.createElement('div');ov.className='plsheet open rvsheet';ov.innerHTML=h+'</div>';document.body.appendChild(ov);hubEl=ov;
  ov.querySelector('.plx').onclick=closeHub;ov.addEventListener('click',function(e){if(e.target===ov)closeHub()});
  var A=ov.querySelector('.rvacts');function btn(l,f,big){var b=document.createElement('button');b.type='button';b.className=big?'plbig':'plgo alt';b.textContent=l;b.onclick=f;A.appendChild(b)}
  var mq=Math.min(15,allPool.length),pq=Math.min(10,pool.length);
  if(!allPool.length)A.innerHTML='<p class="plnote">'+(own?'This test has no flashcards yet. Add some in the Tests tab.':'No questions found for these topics.')+'</p>';
  else if(mockDay&&!mocked){btn('Mini mock test ('+mq+' questions, about 15 min)',function(){mock(tid)},1);btn('Warm up with a practice round first',function(){practice(tid,null)})}
  else{btn('Practice round ('+pq+' questions)',function(){practice(tid,day)},1);if(mn)btn('Fix my revision mistakes ('+mn+')',function(){practice(tid,null,true)});btn(mockDay?'Another mini mock':'Mini mock test ('+mq+' questions)',function(){mock(tid)})}
  if(t&&typeof PP!=='undefined')btn('📝 Big past paper (1 hour, marked by AI)',function(){closeHub();PP.setup({subj:t.subj,sname:t.sname||'',lids:own?[]:(t.units||[]).slice(),topics:own?tName(t):uTitles(t.units).join(', '),extra:own?cards(t).slice(0,40).map(function(x){return 'Q: '+x.q+' A: '+x.a}).join('\n'):''})});
  [].forEach.call(ov.querySelectorAll('.rvread [data-ui]'),function(b){b.onclick=function(){closeHub();startLesson(+b.dataset.ui,+b.dataset.li)}})}
 /* ----- the Tests tab in This week's plan ----- */
 var ed=null,delAsk=null;
 /* link to Big Past Paper in Claude (runs on your Claude account, no API key); ticked lessons ride along in the link */
 function bppUrl(subj,ids){try{return PP.artUrl({subj:subj,lids:ids||[]})}catch(_){return 'https://claude.ai/artifact/AsFGW6Ut3XQ8tBmmUTeCq4'}}
 function tmrUrl(name){return 'homework.html?mode=revise'+(name?'&t='+encodeURIComponent(String(name).slice(0,80)):'')}
 function bppRow(href,note,tname){return '<div class="rvbpp"><a class="plgo" data-k="bpp" href="'+esc(href)+'" target="_blank" rel="noopener">📝 Big Past Paper in Claude ↗</a><a class="plgo alt" data-k="tmr" href="'+esc(tmrUrl(tname))+'">⏱ Start timer</a><span class="plnote">'+note+'</span></div>'}
 function blank(){return {name:'',subj:'gp',sname:'',date:addD(today(),7),days:3,units:[],cards:[]}}
 function add(A,label,cls,fn){var b=document.createElement('button');b.type='button';b.className='plgo'+(cls?' '+cls:'');b.textContent=label;b.onclick=fn;A.appendChild(b);return b}
 function removeT(id,full){var r=R(),t=testOf(id);if(!t)return;if(full){r.tests.splice(r.tests.indexOf(t),1);delete r.log[id];delete r.mocks[id];Object.keys(r.miss).forEach(function(k){if(k.indexOf('O'+id+'#')===0)delete r.miss[k]})}else t.gone=today();save()}
 function paintTab(box,again){var r=R(),td=today();
  r.tests.slice().forEach(function(t){if(t.gone&&t.gone<addD(td,-14)&&t.date<td)removeT(t.id,true)});
  box.innerHTML='';if(ed)return form(box,again);
  var up=r.tests.filter(function(t){return !t.gone&&t.date>=td}).sort(function(a,b){return a.date<b.date?-1:1}),past=r.tests.filter(function(t){return !t.gone&&t.date<td}).sort(function(a,b){return a.date<b.date?1:-1});
  var now=el('div','pldnow','<b>Revise for a test</b>Add a test and Critical turns the days before it into revision days. Each one quizzes you on that day\'s topics, and the last day before the test is a mini mock. They take the same time as your normal plan.',box);
  el('div',null,bppRow(bppUrl(up[0]?up[0].subj:'gp',up[0]&&up[0].subj!=='own'?up[0].units:[]),'Big Past Paper: an hour of exam questions marked by Claude, any time, no API key. Start timer: the big revision clock with the Critical Point yard behind it; the time goes into your study log.',up[0]?tName(up[0]):''),box);
  if(!up.length)el('p','plnote','No tests coming up.',box);
  up.forEach(function(t){var sub=t.subj==='own'?cards(t).length+' flashcard'+(cards(t).length===1?'':'s'):uTitles(t.units).join(', '),c=el('div','plblk rvtest',null,box);
   c.innerHTML='<div class="plbody"><p class="plt"><span>'+esc(tName(t))+'</span><span class="plm">'+inDays(t.date)+'</span></p><p class="plh">'+esc(subjName(t))+' · '+nice(t.date)+'</p><p class="plh">'+esc(sub)+'</p>'+
    (sched(t).length?dayChips(t):t.date===td?'<p class="plh"><b>It\'s today. Good luck!</b></p>':'<p class="plh">Added too late for revision days, but you can still revise now.</p>')+'<div class="placts"></div></div>';
   var A=c.querySelector('.placts');add(A,'Revise now →','',function(){hub(t.id)});add(A,'⏱ Start timer','alt',function(){location.href=tmrUrl(tName(t))});add(A,'Edit','alt',function(){ed=JSON.parse(JSON.stringify(t));ed._edit=t.id;delAsk=null;again()});
   add(A,delAsk===t.id?'Tap again to delete':'Delete','alt',function(){if(delAsk!==t.id){delAsk=t.id;again();return}delAsk=null;removeT(t.id,false);again()})});
  add(box,'+ Add a test','',function(){ed=blank();delAsk=null;again()}).className='plbig';
  if(past.length){el('p','plgt','Past tests',box);var L=el('div','pldl',null,box);past.slice(0,6).forEach(function(t){var m=(r.mocks[t.id]||[]).slice(-1)[0],row=el('div','pldr',null,L);
   row.innerHTML='<span class="tm">'+short(t.date)+' '+s2d(t.date).getDate()+'</span><span class="lb">'+esc(tName(t))+(m?' <span class="plm">mock '+m.pct+'%</span>':'')+'</span>';add(row,'Remove','alt',function(){removeT(t.id,true);again()})})}}
 function prevTxt(f){if(!f.date||f.date<=today())return 'Pick a date after today.';var tt={date:f.date,days:+f.days||3,from:today(),subj:f.subj,units:f.units},pl=plan(tt),D=sched(tt);
  if(f.subj==='own'||!f.units.length)return 'Revision days: '+D.map(function(d,k){return nice(d)+(k===D.length-1?' (mini mock)':'')}).join(', ')+'.';
  return D.map(function(d){var p=pl[d];return nice(d)+': '+(p.mock?'mini mock on everything':uTitles(p.units).join(', '))}).join(' · ')}
 function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=1;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
 function match(q,title){var ws=String(title).toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(Boolean),qs=String(q).toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(function(w){return w.length>=3&&['and','the','for','with'].indexOf(w)<0});
  if(!qs.length)return false;return qs.every(function(w){return ws.some(function(t){if(t.indexOf(w)===0||w.indexOf(t)===0&&t.length>=4&&t.length>=w.length-1)return true;if(w.length<4)return false;return lev(w,t.slice(0,w.length))<=1||lev(w,t)<=1})})}
 function parse(txt){var out=[];String(txt||'').split(/\r?\n/).forEach(function(line){line=line.trim();if(!line)return;var m=line.split(/\t| \| |\|| - | – | = /);if(m.length<2){var i=line.indexOf(': ');if(i>0)m=[line.slice(0,i),line.slice(i+2)]}
  if(m.length>=2){var q=m[0].trim(),a=m.slice(1).join(' - ').trim();if(q&&a)out.push({q:q.slice(0,300),a:a.slice(0,300)})}});return out}
 function form(box,again){var f=ed;if(!Array.isArray(f.units))f.units=[];if(!Array.isArray(f.cards))f.cards=[];
  var h='<div class="pldnow"><b>'+(f._edit?'Edit your test':'Add a test')+'</b>Critical turns the days before it into revision days.</div>'+bppRow(bppUrl(f.subj,f.units),'Practise for it any time with an hour of exam questions marked by Claude (no API key; topics you tick below carry over), or start the revision timer.',f.name||'')+'<div class="rvf">'+
   '<label>What\'s the test?<input type="text" data-f="name" maxlength="50" placeholder="e.g. Physics end-of-topic test"></label>'+
   '<label>Subject<select data-f="subj"><option value="gm">GCSE Maths</option><option value="gp">GCSE Physics</option><option value="gc">GCSE Chemistry</option><option value="gcs">GCSE Computer Science</option><option value="own">Another subject (your own flashcards)</option></select></label>'+
   (f.subj==='own'?'<label>Which subject?<input type="text" data-f="sname" maxlength="30" placeholder="e.g. Biology, History, French"></label>':'')+
   '<div class="rvrow"><label>Date of the test<input type="date" data-f="date"></label><label>Revise on<select data-f="days">'+[1,2,3,4,5,6,7].map(function(n){return '<option value="'+n+'">the '+(n===1?'day':n+' days')+' before</option>'}).join('')+'</select></label></div>'+
   '<p class="plnote" data-k="prev"></p>';
  if(f.subj!=='own')h+='<div class="rvunits"><p class="plgt">What\'s in the test? <span class="rvsel" data-k="sel"></span></p><input type="search" class="rvsearch" maxlength="40" placeholder="Search, e.g. scalars and vectors" aria-label="Search topics"><p class="plnote">Tick a whole topic, or open it and tick just the lessons in your test.</p><div class="rvtl"></div></div>';
  else h+='<div class="rvcards"><p class="plgt">Flashcards <span data-k="cn"></span></p><div class="rvcl"></div><div class="placts"><button type="button" class="plgo alt" data-a="addc">+ Add a card</button></div>'+
   '<details class="rvpaste"><summary>Paste a list instead</summary><textarea maxlength="20000" placeholder="One card per line, question then answer, split by a dash, | or a tab:&#10;Where does respiration happen? - Mitochondria&#10;When did WW2 end? | 1945"></textarea><button type="button" class="plgo" data-a="paste">Add these cards</button></details></div>';
  h+='<p class="plderr" data-k="err" hidden></p><div class="placts"><button type="button" class="plgo" data-a="save">Save test</button><button type="button" class="plgo alt" data-a="cancel">Cancel</button></div></div>';
  box.innerHTML=h;var q=function(s){return box.querySelector(s)};
  q('[data-f=name]').value=f.name||'';q('[data-f=subj]').value=f.subj;q('[data-f=date]').value=f.date||'';q('[data-f=date]').min=addD(today(),1);q('[data-f=days]').value=String(f.days||3);
  function prev(){q('[data-k=prev]').textContent=prevTxt(f);var bl=q('[data-k=bpp]');if(bl)bl.href=bppUrl(f.subj,f.subj==='own'?[]:f.units);var tl=q('[data-k=tmr]');if(tl)tl.href=tmrUrl(f.name||(f.subj==='own'?f.sname:''))}prev();
  q('[data-f=name]').oninput=function(){f.name=this.value;prev()};q('[data-f=date]').oninput=function(){f.date=this.value;prev()};q('[data-f=days]').onchange=function(){f.days=+this.value;prev()};
  q('[data-f=subj]').onchange=function(){f.subj=this.value;f.units=[];again()};
  if(q('[data-f=sname]')){q('[data-f=sname]').value=f.sname||'';q('[data-f=sname]').oninput=function(){f.sname=this.value}}
  if(q('.rvtl')){var openU={},qy='';f.units.forEach(function(id){var x=tInfo(id);if(x&&x.li>=0)openU[UNITS[x.ui].id]=1});
   var sel=function(){var e=q('[data-k=sel]');if(e)e.textContent=f.units.length?'('+uTitles(f.units).length+' picked)':''};
   var paintT=function(){var L=q('.rvtl'),h2='',hits=0,other={};
    if(qy){UNITS.forEach(function(u,ui){var tk=trk(ui);if(!SUBJ[tk])return;var m=[];if(match(qy,u.title))m.push([u.id,u.title,'']);u.lessons.forEach(function(l){if(match(qy,l.title))m.push([l.id,l.title,u.title])});
      if(!m.length)return;if(tk!==f.subj){other[tk]=(other[tk]||[]).concat(m.map(function(x){return x[1]}));return}
      m.forEach(function(x){hits++;var on=f.units.indexOf(x[0])>=0,inU=x[2]&&f.units.indexOf(u.id)>=0;h2+='<label class="plpk"><input type="checkbox" data-t="'+esc(x[0])+'"'+(on||inU?' checked':'')+(inU?' disabled':'')+'> <span>'+esc(x[1])+(x[2]?' <span class="rvin">in '+esc(x[2])+'</span>':' <span class="rvin">whole topic</span>')+'</span></label>'})});
     if(!hits)h2+='<p class="plnote">Nothing in '+esc(SUBJ[f.subj])+' matches “'+esc(qy)+'”.</p>';
     Object.keys(other).forEach(function(tk){h2+='<p class="plnote rvalso">In '+esc(SUBJ[tk])+': '+esc(other[tk].slice(0,3).join(', '))+' <button type="button" class="plgo alt" data-sw="'+tk+'">Switch to '+esc(SUBJ[tk])+'</button></p>'})}
    else for(var lv=1;lv<=maxLv(f.subj);lv++){var us=[];UNITS.forEach(function(u,ui){if(trk(ui)===f.subj&&lvOf(ui)===lv)us.push(ui)});if(!us.length)continue;
     h2+='<p class="rvlv">'+esc(GLV[f.subj]&&GLV[f.subj][lv]?GLV[f.subj][lv][0]:'Level '+lv)+'</p>';
     us.forEach(function(ui){var u=UNITS[ui],on=f.units.indexOf(u.id)>=0,some=u.lessons.some(function(l){return f.units.indexOf(l.id)>=0}),op=openU[u.id];
      h2+='<div class="rvu"><label class="plpk"><input type="checkbox" data-t="'+esc(u.id)+'"'+(on?' checked':'')+(some&&!on?' data-some="1"':'')+'> '+esc(u.title)+'</label><button type="button" class="rvex" data-ex="'+esc(u.id)+'" aria-expanded="'+!!op+'">'+u.lessons.length+' lessons '+(op?'▴':'▾')+'</button></div>';
      if(op)h2+='<div class="rvls">'+u.lessons.map(function(l){var lo=f.units.indexOf(l.id)>=0;return '<label class="plpk"><input type="checkbox" data-t="'+esc(l.id)+'"'+(lo||on?' checked':'')+(on?' disabled':'')+'> '+esc(l.title)+'</label>'}).join('')+'</div>'})}
    L.innerHTML=h2;sel();
    [].forEach.call(L.querySelectorAll('[data-some]'),function(cb){cb.indeterminate=true});
    [].forEach.call(L.querySelectorAll('[data-ex]'),function(b){b.onclick=function(){openU[b.dataset.ex]=!openU[b.dataset.ex];paintT()}});
    [].forEach.call(L.querySelectorAll('[data-sw]'),function(b){b.onclick=function(){f.subj=b.dataset.sw;f.units=[];f._q=qy;again()}});
    [].forEach.call(L.querySelectorAll('[data-t]'),function(cb){cb.onchange=function(){var id=cb.dataset.t,x=tInfo(id),i=f.units.indexOf(id);
     if(cb.checked&&i<0){f.units.push(id);if(x&&x.li>=0)openU[UNITS[x.ui].id]=1;if(x&&x.li<0){var ids=UNITS[x.ui].lessons.map(function(l){return l.id});f.units=f.units.filter(function(z){return ids.indexOf(z)<0})}}
     else if(!cb.checked&&i>=0)f.units.splice(i,1);f.units.sort(function(a,b){return tOrd(a)-tOrd(b)});paintT();prev()}})};
   var sb=q('.rvsearch');if(f._q){sb.value=f._q;qy=f._q;delete f._q}sb.oninput=function(){qy=sb.value.trim();paintT()};paintT()}
  function paintCards(){var L=q('.rvcl');if(!L)return;L.innerHTML='';f.cards.forEach(function(c,i){var r=el('div','rvc',null,L);r.innerHTML='<input type="text" maxlength="300" placeholder="Question" aria-label="Question"><input type="text" maxlength="300" placeholder="Answer" aria-label="Answer"><button type="button" aria-label="Remove this card">✕</button>';
    var ins=r.querySelectorAll('input');ins[0].value=c.q||'';ins[1].value=c.a||'';ins[0].oninput=function(){c.q=this.value;cn()};ins[1].oninput=function(){c.a=this.value;cn()};r.querySelector('button').onclick=function(){f.cards.splice(i,1);paintCards()}});cn()}
  function cn(){var e=q('[data-k=cn]');if(e){var n=f.cards.filter(function(c){return c.q&&c.a&&c.q.trim()&&c.a.trim()}).length;e.textContent='('+n+')'}}
  if(f.subj==='own'){if(!f.cards.length)f.cards.push({q:'',a:''});paintCards();
   q('[data-a=addc]').onclick=function(){f.cards.push({q:'',a:''});paintCards();var ins=box.querySelectorAll('.rvc input');if(ins.length)ins[ins.length-2].focus()};
   q('[data-a=paste]').onclick=function(){var ta=q('.rvpaste textarea'),got=parse(ta.value);if(!got.length){err('Couldn\'t find any cards. Put the question and answer on one line, split by a dash, | or a tab.');return}
    f.cards=f.cards.filter(function(c){return c.q&&c.a&&c.q.trim()&&c.a.trim()}).concat(got);ta.value='';q('.rvpaste').open=false;paintCards();err('')}}
  function err(m){var e=q('[data-k=err]');e.hidden=!m;e.textContent=m}
  q('[data-a=cancel]').onclick=function(){ed=null;again()};
  q('[data-a=save]').onclick=function(){if(!f.date||f.date<=today())return err('Pick a date after today.');
   var cs=f.cards.filter(function(c){return c.q&&c.a&&c.q.trim()&&c.a.trim()}).map(function(c){return {id:c.id||Math.random().toString(36).slice(2,8),q:c.q.trim(),a:c.a.trim()}});
   if(f.subj==='own'&&!cs.length)return err('Add at least one flashcard: a question and its answer.');if(f.subj!=='own'&&!f.units.length)return err('Tick at least one topic that\'s in the test.');
   var r=R(),old=f._edit?testOf(f._edit):null,t={id:old?old.id:'t'+Date.now().toString(36),name:(f.name||'').trim(),subj:f.subj,sname:f.subj==='own'?(f.sname||'').trim():'',date:f.date,days:+f.days||3,units:f.subj==='own'?[]:f.units.slice(),cards:f.subj==='own'?cs:[],from:old&&old.from?old.from:today()};
   if(old)r.tests[r.tests.indexOf(old)]=t;else r.tests.push(t);save();ed=null;again();try{PLAN.paintPill()}catch(_){}}}
 function banner(){var td=today(),t=R().tests.filter(function(t){return !t.gone&&t.date>=td&&diff(td,t.date)<=21}).sort(function(a,b){return a.date<b.date?-1:1})[0];if(!t)return '';
  var D=sched(t).filter(function(d){return d>=td});return '<span>📚 <b>'+esc(tName(t))+'</b> '+inDays(t.date)+' ('+nice(t.date)+').'+(D.length?' Revision: '+D.map(short).join(', ')+'.':'')+'</span>'}
 var css=document.createElement('style');css.textContent=
  '.rvhead h3{margin:2px 0;font-size:20px}.rvhead>p{margin:0;color:var(--muted);font-size:14px}.rvhead .rvk{font:800 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#7F77DD}'+
  '.rvdays{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.rvday{display:flex;flex-direction:column;align-items:center;min-width:48px;border:1.5px solid var(--line);border-radius:10px;padding:5px 6px;background:var(--panel);font-size:12px;line-height:1.3}.rvday b{font-size:13px}.rvday i{font-style:normal;color:var(--muted);font-size:11px}'+
  '.rvday.done{border-color:var(--good-line);background:var(--good-bg)}.rvday.done b::after{content:" ✓";color:var(--good)}.rvday.now{border-color:#7F77DD;box-shadow:0 0 0 2px rgba(127,119,221,.3)}.rvday.miss{opacity:.5}.rvday.test{border-style:dashed;border-color:#7F77DD}'+
  '.rvchips{display:flex;flex-wrap:wrap;gap:6px}.rvchips span{background:rgba(127,119,221,.15);color:var(--text);border-radius:999px;padding:4px 10px;font-size:13px;font-weight:700}'+
  '.rvacts{display:flex;flex-direction:column;gap:8px}.rvacts .plgo{justify-content:center;padding:10px 12px;font-size:14px}.rvread summary,.rvpaste summary{cursor:pointer;font-weight:700;font-size:14px}.rvread>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}'+
  '.rvf{display:flex;flex-direction:column;gap:10px}.rvf label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:700;color:var(--muted)}.rvf input[type=text],.rvf input[type=date],.rvf select,.rvf textarea{font:inherit;font-size:15px;color:var(--text);background:var(--panel);border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;width:100%;box-sizing:border-box}'+
  '.rvf label.plpk{flex-direction:row;font-weight:400;color:var(--text);font-size:14px}.rvrow{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:420px){.rvrow{grid-template-columns:1fr}}'+
  '.rvsearch{font:inherit;font-size:15px;color:var(--text);background:var(--panel);border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;width:100%;box-sizing:border-box}.rvtl{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow:auto}'+
  '.rvu{display:flex;align-items:center;justify-content:space-between;gap:8px}.rvex{border:0;background:none;color:var(--muted);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;flex:none;padding:4px}.rvls{display:flex;flex-direction:column;gap:6px;margin:0 0 4px 28px}.rvin{color:var(--muted);font-size:12.5px}.rvsel{font-weight:700;color:#7F77DD;text-transform:none;letter-spacing:0}.rvalso{display:flex;flex-wrap:wrap;align-items:center;gap:6px}'+
  '.rvunits{display:flex;flex-direction:column;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px 12px}.rvunits .plgt{margin:0}.rvlv{margin:6px 0 0;font-size:12px;font-weight:800;color:#7F77DD}'+
  '.rvcl{display:flex;flex-direction:column;gap:6px;margin-bottom:6px}.rvc{display:grid;grid-template-columns:1fr 1fr 32px;gap:6px;align-items:center}.rvf .rvc input{font-size:14px;padding:7px 8px}.rvc button{border:0;background:none;color:var(--muted);font-size:18px;cursor:pointer;height:32px}'+
  '.rvpaste{margin-top:8px}.rvpaste textarea{min-height:110px;margin:8px 0}.rvans{border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;margin-top:10px;white-space:pre-wrap}'+
  '.pldays button.rv{border-style:dashed;border-color:#7F77DD}.pldays button.rv.on{border-style:solid}'+
  '.rvnext{display:flex;gap:10px;align-items:center;justify-content:space-between;background:rgba(127,119,221,.13);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.4}.rvnext[hidden]{display:none}.rvnext .plgo{flex:none}'+
  '.rvbpp{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;background:rgba(127,119,221,.1);border:1.5px dashed #7F77DD;border-radius:12px;padding:10px 12px}.rvbpp .plgo{text-decoration:none;flex:none}.rvbpp .plnote{flex:1;min-width:180px;margin:0}'+
  '.pltv{display:flex;flex-direction:column;gap:12px}.pltv[hidden]{display:none}.rvtest .plbody{display:flex;flex-direction:column;gap:2px}';
 document.head.appendChild(css);
 return {match:match,dayInfo:dayInfo,byPin:build,hub:hub,closeHub:closeHub,paintTab:paintTab,banner:banner,doneDay:doneDay,mark:mark,rf:rf,endPractice:endPractice,endMock:endMock,practice:practice,mock:mock,sched:sched,plan:plan,tests:function(){return R().tests}};
})();
try{window.REV=REV}catch(_){}
