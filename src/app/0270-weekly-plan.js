/* ===== weekly plan (calendar button next to the study timer) ===== */
var PLAN=(function(){
 var MG='https://www.mathsgenie.co.uk/',SEN='https://senecalearning.com/',COG='https://cognitoedu.org/',SR='shift-ready.html',AG='aptitude.html';
 var DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],AB=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 /* [title, minutes, what to do, buttons [label, kind, target], shows the topic list] */
 /* two versions of the week: GCSE first, then the same week with A-level in place of GCSE once every GCSE lesson (Level 2 up) is done */
 var PMT='https://www.physicsandmathstutor.com/';
 var NUKE=['Nuclear maths',9,'Your next lesson in the Maths track: the calculations behind the reactor, from powers of ten to reactor kinetics.',[['Nuclear maths','maths']]];
 function WEEKOF(Q){var A=Q==='A',sci=A?[['A-level Physics','ap'],['A-level Chemistry','ac']]:[['GCSE Physics','gp'],['GCSE Chemistry','gc']],mth=A?'A-level Maths':'GCSE Maths',mk=A?'am':'gm';
  return [
  [['Fix my mistakes',15,'Clear the Fix my mistakes pile in Critical: the questions you got wrong, 10 at a time. Read the explanation again on any you miss. Empty it early and you move straight on. If it isn\'t empty after 15 minutes, the first 15 minutes of Tuesday go to it too. Nothing to fix? Do your next '+mth+' lesson.',[['Fix my mistakes','fix'],[mth,mk]]],
   ['Nuclear maths',12,NUKE[2],NUKE[3]]],
  [['Calculus',18,'Your next Calculus lesson and its practice. Only move on when the practice says Mastered. Stuck? Press Help.',[['Next lesson','calc']]],
   ['Aptitude',9,'One practice set in Aptitude Gym.',[['Aptitude Gym','app',AG]]]],
  [['Python',18,'Your next Python session in Shift Ready.',[['Shift Ready','app',SR]]],
   ['Communication',9,'The comms drill in Shift Ready. Say your answers out loud, not in your head.',[['Shift Ready','app',SR]]]],
  [[A?'A-level science':'GCSE science',18,'Your next '+(A?'A-level':'GCSE')+' Physics or Chemistry lesson in Critical, matching what you\'re doing in class this week.'+(A?' Physics & Maths Tutor has exam questions on every topic.':' Seneca and Cognito are good for extra practice.'),sci.concat(A?[['Physics & Maths Tutor','url',PMT]]:[['Seneca','url',SEN],['Cognito','url',COG]])],
   NUKE],
  [['Nuclear theory',18,'Your next Theory lesson: how the station really works. Finished early? Run a shift in the Control room.',[['Theory','theory'],['Control room','sim']]],
   ['Calculus practice',9,'Practice questions on your last Calculus lesson.',[['Practise','calcfu']]]],
  [[A?'A-level maths':'GCSE maths',30,A?'Your next A-level Maths lesson, then exam questions on the same topic from Physics & Maths Tutor, timed. Add every topic you dropped marks on to your list below.':'30 minutes of mixed questions from a Maths Genie Edexcel paper, timed like an exam. Mark it, and add the topic of every question you dropped marks on to your list below.',A?[['A-level Maths','am'],['Physics & Maths Tutor','url',PMT]]:[['Maths Genie','url',MG]],1],
   [A?'A-level science':'GCSE science',18,'Exam-style questions on Thursday\'s topic: the follow-up and unit test in Critical'+(A?', or Physics & Maths Tutor.':', or Seneca.'),sci.concat(A?[['Physics & Maths Tutor','url',PMT]]:[['Seneca','url',SEN]])],
   ['Aptitude',7,'One short timed set in Aptitude Gym.',[['Aptitude Gym','app',AG]]]],
  [['Python',15,'Your next Python session in Shift Ready.',[['Shift Ready','app',SR]]],
   ['Calculus',20,'Your next Calculus lesson.',[['Next lesson','calc']]],
   ['Nuclear maths',15,'Your next Maths track lesson, or its practice if you haven\'t mastered the last one.',[['Nuclear maths','maths']]],
   ['Weekly review',5,'Look at your list below. Move the topic you\'re worst at to the top and practise it first next Saturday. Delete topics you\'ve fixed.',[],1]]]}
 var DG=WEEKOF('G'),DA=WEEKOF('A');function WEEK(){return alOpen()?DA:DG}
 var TUE_FIX=[['Fix my mistakes',15,'Monday\'s Fix my mistakes wasn\'t finished, so it gets the first 15 minutes today. Empty the pile early and you move straight on.',[['Fix my mistakes','fix']]],
  ['Nuclear maths',12,'A shorter slot today: your next Maths track lesson.',[['Nuclear maths','maths']]]];
 function pile(){try{return reviewPool(true).length}catch(_){return 0}}
 /* Tuesday's first 20 minutes become Fix my mistakes if Monday's pile wasn't emptied. Decided once on Tuesday, then kept for the week. */
 var ready=false;setTimeout(function(){ready=true},0);
 function carry(){var p=PS(),t=todayI();if(p.carry==null){if(t!==1||!ready)return false;p.carry=(!p.monClr&&!rvOn(0)&&pile()>0)?1:0;save()}return p.carry===1}
 /* every day starts with a warm-up, then the study blocks: 30 minutes in all on a school day, 60 at the weekend (block[5] marks the warm-up). On a school day you're asked, after the study part,
    if you want to keep going to 45 minutes: that adds a 10-minute bonus of the day's main subject and makes Clash 10 minutes. */
 function CORE(i){return i===1&&carry()?TUE_FIX:WEEK()[i]}
 function WARM(i){return ['Warm-up',i<5?3:5,'Memory refresh: quick questions on things you learnt before, to get your brain going. When you finish them, your plan moves on by itself.',[['Warm up','warm']],0,'warm']}
 function CLASH(i,x){return ['Critical Clash',i<5&&!x?5:10,'Your reward for the plan: a match of Critical Clash 3D. Every kill is a question, so it still counts. When the time\'s up, finish your match and close the game.',[['Play Critical Clash','clash']],0,'clash']}
 function mainOf(c){return c.slice().sort(function(a,b){return b[1]-a[1]})[0]}
 function BONUS(c){var m=mainOf(c);return ['Bonus: '+m[0],10,'You chose to keep going. 10 more minutes of '+m[0]+', carrying on from where you got to.',m[3],0,'bonus']}
 function extOn(i){var e=PS().ext;return !!(e&&e[i])}
 function setExt(i,v){var p=PS();if(!p.ext||typeof p.ext!=='object')p.ext={};p.ext[i]=v;save()}
 function extAsked(i){var e=PS().ext;return !!(e&&e[i]!=null)}
 /* revision days (Tests tab): the days before a test swap the plan for one revision block, as long as that day's normal plan.
    Once a day is started it's pinned, so editing a test later can't change a day you're part-way through. */
 function wkDate(i){var d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+i);return d}
 function anyTick(i){var t=PS().t;for(var k in t)if(t[k]&&k.indexOf(i+'-')===0)return true;return false}
 function RVD(i){if(typeof REV==='undefined')return null;var p=PS();if(p.rvpin&&p.rvpin[i])return REV.byPin(p.rvpin[i]);if(anyTick(i))return null;
  if(i===todayI()){var rr=runGet();if(rr&&rr.day===i)return null;if(hwGet())return null}try{return REV.dayInfo(dstr(wkDate(i)))}catch(_){return null}}
 function pinRv(i){var p=PS();if(p.rvpin&&p.rvpin[i])return;var r=RVD(i);if(!r)return;if(!p.rvpin||typeof p.rvpin!=='object')p.rvpin={};p.rvpin[i]=r.pin;save()}
 function rvOn(i){var b=DAY(i);return b.length===1&&b[0][5]==='rev'}
 function DAY(i){return DAYF(i,layOn())}
 function DAYF(i,sm){var rv=RVD(i);if(rv)return [['Revise: '+rv.name,mins(i),rv.desc,[['Start revision','rev']],0,'rev',rv]];var oth=OTH(i);if(oth)return sm?oth.concat(sm>=2?[PATHR()]:[],[BRK(1)]):oth;if(freeDay()===i){var FR=[FREEB(mins(i))];return sm?FR.concat([BRK(1)]):FR}var c=CORE(i),x=i<5&&extOn(i),L=[WARM(i)].concat(c,x?[BONUS(c)]:[]);return sm?SMART(i,L,sm):L}
 /* study smart: brain breaks after ~25 minutes and at the end, mixed practice on Wed and Sat, a ghost test on Sunday */
 function smOn(){return S.smart!==0}
 function layOn(){var p=S.plan;return p&&typeof p==='object'&&p.sm?(+p.sm||1):0}
 function BRK(end){return [end?'Let it sink in':'Brain break',5,end?'5 minutes of quiet rest straight after studying. Your brain keeps replaying and storing what you just learnt while you rest, so no phone, videos or games. Stand up, get some water, look out of the window.':'You\'ve focused for about 25 minutes, so give your brain 5 minutes off. Move around, drink some water, rest your eyes. Not your phone: scrolling isn\'t a break for your brain.',[['Start break','brk',end?1:0]],0,'brk']}
 function MIXB(){return ['Mixed practice',6,'Questions from across your current unit, all mixed up. It feels harder than doing one type at a time, and that\'s why it works: you have to spot which method each question needs, like in an exam.',[['Mixed practice','mix']],0,'mix']}
 function GHB(){return ['Beat your ghost',6,'A 10-question test on this week\'s unit, racing your last attempt, so you can see how much you\'ve really improved. Starting a new unit? Take it first and tag it Before.',[['Beat your ghost','ghost']],0,'ghost']}
 function SMART(i,L,ver){var out=L.slice();if(i===2||i===5)out.push(MIXB());
  if(i===6){var k=out.length;if(out[k-1]&&out[k-1][0]==='Weekly review')out.splice(k-1,0,GHB());else out.push(GHB())}
  if(ver>=2)out.push(PATHB(i,ver));
  var res=[],acc=0;for(var j=0;j<out.length;j++){var b=out[j];res.push(b);if(b[5]==='bonus')continue;acc+=b[1];var rest=0;for(var q=j+1;q<out.length;q++)if(out[q][5]!=='bonus')rest+=out[q][1];if(acc>=25&&rest>=10){res.push(BRK(0));acc=0}}
  res.push(BRK(1));return res}
 function TOT(){var s=0;for(var i=0;i<7;i++)s+=DAY(i).reduce(function(a,b){return a+(b[5]==='bonus'?0:b[1])},0);return s}
 /* switching layouts keeps your ticks: blocks are matched by name, and a day that was all done stays all done */
 function pathCode(){return S.pathMode==null?1:+S.pathMode||0}
 function smSync(){var p=PS(),want=smOn()?1+pathCode():0,have=p.sm?(+p.sm||1):0;if(want===have)return;var nt={},r=runGet(),rj=null,hw=null;try{hw=hwGet()}catch(_){}
  for(var i=0;i<7;i++){var A=DAYF(i,have),B=DAYF(i,want),used={},map={},all=A.every(function(b,j){return b[5]==='bonus'||!!p.t[i+'-'+j]});
   A.forEach(function(b,j){for(var q=0;q<B.length;q++)if(!used[q]&&B[q][0]===b[0]){used[q]=1;map[j]=q;return}});
   if(all&&A.length)B.forEach(function(b,q){if(b[5]!=='bonus')nt[i+'-'+q]=1});else for(var j in map)if(p.t[i+'-'+j])nt[i+'-'+map[j]]=1;
   if(r&&r.day===i)rj=map[r.j]==null?null:map[r.j];
   if(hw&&hw.alloc&&i===todayI()){var na={};for(var a in hw.alloc)if(map[a]!=null)na[map[a]]=hw.alloc[a];hw.alloc=na}}
  p.t=nt;p.sm=want;save();if(r){if(rj==null)runClear();else{r.j=rj;runSet(r)}}if(hw&&hw.alloc)try{hwSet(hw)}catch(_){}}
 /* ----- the quantum & maths learning path: the best order, with catch-ups first ----- */
 var PATH_REQ={qm1:[],qm2:['qm1'],qm3:['qm2','calc4','calc15','calc16'],qm4:['qm3','calc17'],qm5:['qm4','calc23'],qm6:['qm5','calc18','calc22'],qm7:['qm6','calc19','calc20','calc21'],
  calc1:[],calc15:['calc3'],calc16:['calc1'],calc17:['calc5'],calc18:['calc17','calc10','calc12'],calc19:['calc15','calc14'],calc20:['calc16','calc17'],calc21:['calc16','calc12'],calc22:['calc17','calc16'],calc23:['calc5']};
 for(var _pc=2;_pc<=14;_pc++)PATH_REQ['calc'+_pc]=['calc'+(_pc-1)];
 var PATH_ORDER=(function(){var out=[],seen={};function visit(n){if(seen[n])return;seen[n]=1;(PATH_REQ[n]||[]).slice().sort(function(a,b){return pNum(a)-pNum(b)}).forEach(visit);out.push(n)}for(var q=1;q<=7;q++)visit('qm'+q);return out})();
 function pNum(n){return (n.indexOf('qm')===0?1000:0)+(+n.replace(/\D/g,''))}
 function pTrack(n){return n.indexOf('qm')===0?'qm':'calc'}function pLv(n){return +n.replace(/\D/g,'')}
 function pName(n){var t=pTrack(n),lv=pLv(n),nm='';try{nm=lvInfo(t,lv)[0]}catch(e){}return (t==='qm'?'Quantum':'Calculus')+' Level '+lv+(nm?': '+nm:'')}
 function pProg(n){try{return lvDone(pTrack(n),pLv(n))}catch(e){return [0,0]}}
 function pDone(n){var d=pProg(n);return d[1]>0&&d[0]/d[1]>=0.8}
 function pReady(n){return (PATH_REQ[n]||[]).every(pDone)}
 function pNeeds(n){var out=[],seen={};(function w(x){(PATH_REQ[x]||[]).forEach(function(r){if(seen[r])return;seen[r]=1;if(!pDone(r))out.push(r);w(r)})})(n);return out.sort(function(a,b){return PATH_ORDER.indexOf(a)-PATH_ORDER.indexOf(b)})}
 function pFor(n){/* the first quantum level that needs this */for(var q=1;q<=7;q++){var t='qm'+q;if(pDone(t))continue;if(t===n||pNeeds(t).indexOf(n)>=0)return t}return null}
 var pathC={t:0,v:null};
 function pathPlan(fresh){var now=Date.now();if(!fresh&&pathC.v&&now-pathC.t<4000)return pathC.v;var plan=null;
  try{var pf=null;try{pf=pendingFollow('all')}catch(e){}var eq=0,wk=0,pl=0;try{eq=fxDue().length}catch(e){}var idn=0;try{idn=ideasDue().length}catch(e){}var sdn=0;try{sdn=symDue().length}catch(e){}try{wk=lxDue().length}catch(e){}try{pl=pile()}catch(e){}
   if(pf)plan={kind:'follow',label:'Follow-up practice',why:'A follow-up is waiting. Pass it to unlock new lessons.'};
   else if(eq>=4)plan={kind:'eq',label:'Equations to remember',why:eq+' equations are due to rebuild from memory. Catching up first keeps them in your head.'};
   else if(sdn>=10)plan={kind:'syms',label:'Symbols to remember',why:sdn+' symbols and numbers (like λ) are due, so they don\'t slip away.'};
   else if(idn>=5)plan={kind:'ideas',label:'Ideas to remember',why:idn+' quantum lessons are due for a quick test so the ideas stick.'};
   else if(wk>=3)plan={kind:'weak',label:'Weak maths skills',why:wk+' maths skills you slipped up on are due for practice.'};
   else if(pl>=12)plan={kind:'fix',label:'Fix my mistakes',why:pl+' mistakes are waiting. Clearing them first stops gaps building up.'};
   if(!plan){var ready=PATH_ORDER.filter(function(n){return !pDone(n)&&pReady(n)});
    if(!ready.length)plan={kind:'done',label:'Path complete',why:'You\'ve finished the whole quantum and maths path.'};
    else{var a=ready[0],pick=a;
     /* if quantum is ready now, mix in the maths the next quantum level will need, so it's ready in time */
     if(pTrack(a)==='qm'){var later=ready.filter(function(n){return pTrack(n)==='calc'})[0];if(later&&(S.pathTurn||0)%2===1)pick=later}
     var fq=pFor(pick),why=pTrack(pick)==='qm'?'You have the maths for it, so this is the next step.':fq&&fq!==pick?pName(fq).replace(/:.*/,'')+' needs this first.':'Next maths step.';
     if(pick!==a)why='Mixed in now so the maths is ready when '+(fq?pName(fq).replace(/:.*/,''):'quantum')+' needs it.';
     plan={kind:'study',node:pick,label:pName(pick),why:why}}}
   var tq=null;for(var q=1;q<=7;q++)if(!pDone('qm'+q)){tq='qm'+q;break}if(tq){var nd=pNeeds(tq).filter(function(n){return pTrack(n)==='calc'});plan.behind=nd.length?'Maths gap: '+pName(tq).replace(/:.*/,'')+' still needs '+nd.length+' Calculus level'+(nd.length===1?'':'s')+'.':''}
  }catch(e){plan={kind:'done',label:'Learning path',why:''};if(window.console)console.error(e)}
  pathC={t:now,v:plan};return plan}
 function PATHR(){return ['Quick path review',5,'A busy day, so no new lessons: a 5-minute review of ideas or equations that are due, so your quantum and maths path doesn\'t go cold.',[['Go','pathrev']],0,'pathrev']}
 function pathReview(){var n=0;try{n=ideasDue().length}catch(e){}if(n){ideaReview();return}try{n=symDue().length}catch(e){}if(n){symReview();return}try{n=fxDue().length}catch(e){}if(n){fxReview();return}ONE.start()}
 function PATHB(i,ver){var m=(ver===3?20:10)*(i>=5?1.5:1),pl=pathPlan();return ['Quantum & maths path',Math.round(m),(pl.kind==='study'?'Next: '+pl.label+'. ':pl.kind==='done'?'':'Catch up first: '+pl.label+'. ')+pl.why+(pl.behind&&pl.kind==='study'?' '+pl.behind:''),[['Go','path']],0,'path']}
 function pathGo(){var pl=pathPlan(true);if(pl.kind==='follow'){var na=nextAction('all');if(na)runAction(na);return}if(pl.kind==='eq'){try{fxReview()}catch(e){}return}if(pl.kind==='ideas'){try{ideaReview()}catch(e){}return}if(pl.kind==='syms'){try{symReview()}catch(e){}return}if(pl.kind==='weak'){try{startWeak()}catch(e){}return}if(pl.kind==='fix'){showPage('review');try{startReview(true)}catch(e){}return}
  if(pl.kind==='done'){toastIn('You\'ve finished the whole quantum and maths path. Amazing.');return}
  var t=pTrack(pl.node),lv=pLv(pl.node);S.lvl=S.lvl||{};S.lvl[t]=lv;S.lvlOpen=S.lvlOpen||{};S.lvlOpen[t+lv]=1;S.mode=t;if(t==='qm')S.seenQm=1;else S.seenCalc=1;S.pathTurn=(S.pathTurn||0)+1;save();pathC.v=null;
  showPage('learn');var a=nextAction(t);if(a)runAction(a);else toastIn('Nothing left to do in '+pl.label+'.')}
 function pathRemaining(goal){var nodes=pNeeds(goal).concat(pDone(goal)?[]:[goal]),n=0;nodes.forEach(function(x){var d=pProg(x);n+=Math.max(0,Math.ceil(d[1]*0.8)-d[0])});return n}
 function pathRate(){var L=S.pathLog||{},first=null;Object.keys(L).forEach(function(k){var p=k.split('-'),d=new Date(+p[0],p[1]-1,+p[2]);if(!first||d<first)first=d});var span=first?Math.min(14,Math.max(7,Math.round((new Date()-first)/864e5)+1)):14,real=plogCount(span,['qm','calc'])/(span/7);if(real>=2)return {r:real,est:false};var m=pathCode()===2?20:pathCode()===1?10:0,est=m*8/12;return {r:Math.max(est,real),est:true}}
 function pDate(n){var d=new Date();d.setDate(d.getDate()+n);return d}
 function fmtD(d){try{return d.toLocaleDateString(undefined,{day:'numeric',month:'long',year:d.getFullYear()!==new Date().getFullYear()?'numeric':undefined})}catch(e){return d.toDateString()}}
 function pathForecast(){var g=S.pathGoal&&S.pathGoal.node?S.pathGoal.node:null,target=g;if(!target){for(var q=1;q<=7;q++)if(!pDone('qm'+q)){target='qm'+q;break}}if(!target)return null;
  var rem=pathRemaining(target),rt=pathRate(),out={target:target,rem:rem,rate:rt.r,est:rt.est};if(rt.r>0){out.weeks=rem/rt.r;out.eta=pDate(Math.ceil(out.weeks*7))}
  if(g&&S.pathGoal.date){var dl=new Date(S.pathGoal.date+'T12:00:00'),wk=Math.max(0.1,(dl-new Date())/(7*864e5));out.goal={date:dl,need:rem/wk,weeks:wk};out.goal.ok=rem===0||rt.r>=out.goal.need;out.goal.mins=out.goal.need*12/8}
  return out}
 function pathWeek(){var w=wk(),pw=S.pathWk;if(!pw||pw.wk!==w){var prog={};PATH_ORDER.forEach(function(n){prog[n]=pProg(n)[0]});S.pathWk={wk:w,prog:prog};save();pw=S.pathWk}
  var since=(new Date().getDay()+6)%7+1,L=S.pathLog||{},qm=0,ca=0,now=new Date();for(var i=0;i<since;i++){var d=new Date(now);d.setDate(d.getDate()-i);var e=L[ymdLof(d)];if(e){qm+=e.qm||0;ca+=e.calc||0}}
  var fin=PATH_ORDER.filter(function(n){var d=pProg(n);return pDone(n)&&(pw.prog[n]||0)<Math.ceil(d[1]*0.8)});var nxt=PATH_ORDER.filter(function(n){return !pDone(n)&&pReady(n)}).slice(0,2);
  return {qm:qm,calc:ca,fin:fin,next:nxt}}
 function pathCard(){var pl=pathPlan(),c=document.createElement('div');c.className='plpath';var cur=pl.node;
  var rows=PATH_ORDER.map(function(n){var d=pProg(n),st=pDone(n)?'done':n===cur?'next':pReady(n)?'ready':'lock',need=st==='lock'?pNeeds(n).slice(0,2).map(function(x){return pName(x).replace(/:.*/,'')}):[];
   return '<li class="pp-'+st+'"><span class="ppi">'+(st==='done'?'✓':st==='next'?'▶':st==='ready'?'○':'🔒')+'</span><span class="ppn">'+esc(pName(n))+(need.length?'<small>needs '+esc(need.join(', '))+'</small>':'')+'</span><span class="ppd">'+d[0]+'/'+d[1]+'</span></li>'}).join('');
  var dn=PATH_ORDER.filter(pDone).length;
  c.innerHTML='<div class="plgt">🧭 Your quantum & maths path</div><p class="plpnow"><b>'+(pl.kind==='study'?'Right now: '+esc(pl.label):pl.kind==='done'?esc(pl.label):'Catch up first: '+esc(pl.label))+'</b><br>'+esc(pl.why)+'</p>'+(pl.behind?'<p class="plnote">'+esc(pl.behind)+'</p>':'')+
   '<div class="placts"><button type="button" class="plgo">Go →</button></div>'+pathExtrasHTML()+'<details><summary>The whole path ('+dn+' of '+PATH_ORDER.length+' stages done)</summary><ol class="pplist">'+rows+'</ol><p class="plnote">A stage counts as done at 80% of its lessons. Calculus levels open as soon as their real prerequisites are done.</p></details>';
  c.querySelector('.plgo').onclick=function(){close();pathGo()};wirePathExtras(c);return c}
 function pathExtrasHTML(){var f=pathForecast(),w=pathWeek(),h='',t=todayI();
  if(f){var nm=esc(pName(f.target).replace(/:.*/,''));if(f.rem===0)h+='<p class="plpf">📅 You\'ve already reached '+nm+'.</p>';else if(f.eta)h+='<p class="plpf">📅 At your pace (about '+(Math.round(f.rate*10)/10)+' lessons a week'+(f.est?', estimated from your plan until there\'s more to go on':'')+'), you\'ll reach <b>'+nm+'</b> around <b>'+fmtD(f.eta)+'</b>: '+f.rem+' lesson'+(f.rem===1?'':'s')+' to go.</p>';else h+='<p class="plpf">📅 Turn the path on in Study smart to see when you\'ll reach '+nm+'.</p>';
   if(f.goal){var g=f.goal;h+='<p class="plpg '+(g.ok?'ok':'behind')+'">🎯 Goal: '+nm+' by '+fmtD(g.date)+'. '+(f.rem===0?'Done!':g.ok?'On track: you need about '+(Math.round(g.need*10)/10)+' lessons a week.':'Behind: you need about '+(Math.round(g.need*10)/10)+' lessons a week. '+(g.mins<=20?'Switch the path to 20 minutes a day in Study smart.':'That\'s more than 20 minutes a day: add some free-choice days, or pick a later date.'))+'</p>'}}
  h+='<div class="plpgoal"><button type="button" class="plgo alt" data-a="goal">'+(S.pathGoal&&S.pathGoal.node?'Change goal':'🎯 Set a goal date')+'</button><div class="plpgf" hidden></div></div>';
  var tot=w.qm+w.calc;h+='<details class="plpw"'+(t===6||t===0?' open':'')+'><summary>📈 This week on your path: '+tot+' lesson'+(tot===1?'':'s')+'</summary><p class="plnote">'+w.qm+' Quantum, '+w.calc+' Calculus.'+(w.fin.length?' Finished: '+w.fin.map(function(n){return esc(pName(n).replace(/:.*/,''))+' ✓'}).join(', ')+'.':'')+(w.next.length?' Next up: '+w.next.map(function(n){return esc(pName(n).replace(/:.*/,''))}).join(', then ')+'.':'')+'</p></details>';
  return h}
 function wirePathExtras(c){var b=c.querySelector('[data-a=goal]'),F=c.querySelector('.plpgf');if(!b)return;b.onclick=function(){F.hidden=false;b.hidden=true;var g=S.pathGoal||{},d=g.date||(function(){var x=pDate(120);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')})();
  F.innerHTML='<label>Reach<select data-f="n">'+[1,2,3,4,5,6,7].map(function(q){return '<option value="qm'+q+'">'+esc(pName('qm'+q))+'</option>'}).join('')+'</select></label><label>By<input type="date" data-f="d"></label><div class="placts"><button type="button" class="plgo" data-f="s">Save goal</button>'+(g.node?'<button type="button" class="plgo alt" data-f="c">Clear goal</button>':'')+'<button type="button" class="plgo alt" data-f="x">Cancel</button></div>';
  var sel=F.querySelector('[data-f=n]'),dt=F.querySelector('[data-f=d]');sel.value=g.node||(function(){for(var q=1;q<=7;q++)if(!pDone('qm'+q))return 'qm'+q;return 'qm7'})();dt.value=d;
  F.querySelector('[data-f=s]').onclick=function(){if(!dt.value)return;S.pathGoal={node:sel.value,date:dt.value};save();paint()};var cl=F.querySelector('[data-f=c]');if(cl)cl.onclick=function(){delete S.pathGoal;save();paint()};F.querySelector('[data-f=x]').onclick=function(){paint()}}}
 function smUnit(){var m=curMode(),a=[],ui=-1;try{a=allLessons(m)}catch(_){}for(var i=0;i<a.length;i++)if(S.done[UNITS[a[i][0]].lessons[a[i][1]].id])ui=a[i][0];if(ui<0){var nl=nextLesson(m);ui=nl?nl[0]:-1}return ui}
 function smTrackUnits(){var m=curMode(),a=[],seen={},out=[];try{a=allLessons(m)}catch(_){}a.forEach(function(x){if(S.done[UNITS[x[0]].lessons[x[1]].id]&&!seen[x[0]]){seen[x[0]]=1;out.push(x[0])}});return out.reverse()}
 function smMix(){var us=smTrackUnits();for(var i=0;i<us.length;i++){var ui=us[i],ok=false;try{var sk=unitSkills(ui,true),bk=sk.length?null:unitBank(ui,true);ok=sk.length>0||!!(bk&&bk.length>=4)}catch(_){}if(ok&&typeof startMix==='function'){startMix(ui);return}}
  toastIn('Not enough lessons done to mix yet, so here\'s a memory refresh instead.');var mc=null;try{mc=MEM.counts()}catch(_){}if(mc&&mc.total)MEM.start();else ONE.start()}
 function smGhost(){if(typeof ghOpen!=='function')return;var us=smTrackUnits(),nu=smUnit();if(us.indexOf(nu)<0&&nu>=0)us.unshift(nu);for(var i=0;i<us.length;i++){var n=0;try{n=ghostPool(us[i]).length}catch(_){}if(n>=5){ghOpen(us[i]);return}}toastIn('Finish a few more lessons first, then you can race your ghost.')}
 /* the break screen: breathing circle and a countdown, no buttons to wander off with */
 var brkEl=null,brkT=null;
 function brkClose(){clearInterval(brkT);brkT=null;if(brkEl){brkEl.remove();brkEl=null}}
 function brkOpen(end){brkClose();var r=runGet(),cb=r?DAY(r.day)[r.j]:null,inPlan=!!(cb&&cb[5]==='brk'),rk=inPlan?r.day+'-'+r.j:null,ends=inPlan?r.ends:Date.now()+5*60000,t0=Date.now();if(inPlan)end=cb[3][0][2];
  var tips=end?['Close your eyes and let today\'s lesson replay by itself. Don\'t force it.','Get a glass of water.','Look at something far away, out of a window if you can.','Stretch: arms up, then touch your toes.','No phone. New stuff now pushes out what you just learnt.']:['Stand up and walk around for a minute.','Get a glass of water.','Look at something far away to rest your eyes.','Roll your shoulders and stretch.','No phone. Scrolling isn\'t a rest for your brain.'];
  brkEl=document.createElement('div');brkEl.className='brkov';brkEl.setAttribute('role','dialog');brkEl.setAttribute('aria-modal','true');brkEl.setAttribute('aria-label',end?'Let it sink in':'Brain break');
  brkEl.innerHTML='<div class="brkin"><p class="brkk">'+(end?'Let it sink in':'Brain break')+'</p><div class="brkc"><i></i><span class="brkt">5:00</span></div><p class="brkb">Breathe in…</p><p class="brktip"></p><p class="brkn">'+(end?'Resting now helps your brain store what you just learnt. You\'re still learning.':'A short rest now means you\'ll focus better for the next part.')+'</p><button type="button" class="brkx">'+(inPlan?'I\'m back early':'Stop the break')+'</button></div>';
  document.body.appendChild(brkEl);var T=brkEl.querySelector('.brkt'),B=brkEl.querySelector('.brkb'),TP=brkEl.querySelector('.brktip'),lastTip=-1;
  function finish(){if(!brkEl)return;clearInterval(brkT);brkT=null;brkEl.querySelector('.brkin').innerHTML='<p class="brkk">Break done</p><p class="brkn">Nice. Your brain\'s had time to file it away.</p>';var e0=brkEl;setTimeout(function(){if(brkEl===e0)brkClose()},2200)}
  function tick(){if(!brkEl)return;var now=Date.now();if(inPlan){var rr=runGet();if(!rr||rr.day+'-'+rr.j!==rk){brkClose();return}ends=rr.ends}var left=ends-now;
   if(left<=0){if(inPlan)brkClose();else finish();return}var sc=Math.ceil(left/1000);T.textContent=Math.floor(sc/60)+':'+('0'+sc%60).slice(-2);
   B.textContent=Math.floor((now-t0)/4000)%2?'Breathe out…':'Breathe in…';var ti=Math.floor((now-t0)/20000)%tips.length;if(ti!==lastTip){lastTip=ti;TP.textContent=tips[ti]}}
  brkEl.querySelector('.brkx').onclick=function(){if(inPlan){var rr=runGet();if(rr&&rr.day+'-'+rr.j===rk){rr.ends=Date.now();rr.early=1;runSet(rr)}brkClose();loop()}else brkClose()};
  brkT=setInterval(tick,250);tick()}

/* Others days: your own commitments (like a research project) take over that day's plan, with the same timer */
 function OTHL(){var o=S.others;return Array.isArray(o)?o.filter(function(x){return x&&x.n&&x.d>=0&&x.d<7}):[]}
 function OTH(i){var L=OTHL().filter(function(x){return x.d===i});if(!L.length)return null;
  return L.map(function(x){var acts=[['Start the timer','other',x.n],['📚 Research tracker','restrack',x.n]];if(x.l)acts.push(['Open link','url',x.l]);return ['Others: '+x.n,Math.max(5,Math.min(240,Math.round(+x.m)||mins(i))),x.w||('Work on '+x.n+' until the timer\'s done. At the end, write down what you got done and what\'s next.'),acts,0,'other']})}
 /* free choice: once a week, study whatever you like for that day's usual time */
 function freeDay(){var p=S.plan;return p&&p.wk===wk()&&typeof p.free==='number'?p.free:null}
 function FREEB(m){return ['Free choice',m,'Study anything you like: something from class, a topic you\'re curious about, or catching up. You choose what, but keep going until the timer\'s done.',[['Pick any lesson','freelearn'],['Review','freerev'],['Control room','sim']],0,'free']}
 /* changing a day's layout resets that day's ticks (and its timer, if it's running) */
 function resetDay(i){var p=PS();Object.keys(p.t).forEach(function(k){if(k.indexOf(i+'-')===0)delete p.t[k]});var r=runGet();if(r&&r.day===i){runClear();hideBan()}}
 function planExtras(i){var box=document.createElement('div');box.className='plx2';var t=todayI(),rv=rvOn(i),oth=!!OTH(i),fd=freeDay(),h='';
  if(!rv&&!oth){if(fd===i)h+='<div class="plx2r"><span>🎲 <b>Free choice day</b>: study anything you like for '+mins(i)+' minutes.</span>'+(anyTick(i)?'':'<button type="button" class="plgo alt" data-a="unfree">Undo</button>')+'</div>';
   else if(fd==null&&i>=t&&!anyTick(i))h+='<div class="plx2r"><span>🎲 <b>Free choice</b>: once a week, swap a day\'s plan for '+mins(i)+' minutes of studying whatever you like. The timer still runs.</span><button type="button" class="plgo" data-a="free">Make '+(i===t?'today':DAYS[i])+' free choice</button></div>';
   else if(fd!=null&&fd!==i)h+='<p class="plnote">🎲 Free choice is used this week ('+DAYS[fd]+'). You get a new one on Monday.</p>'}
  var L=OTHL();h+='<div class="plx2o"><div class="plgt">Others days</div><p class="plnote">For things outside Critical, like a research project. That day\'s plan becomes that, with the same timer.</p>'+
   L.map(function(x,k){return '<div class="plx2r"><span><b>'+esc(DAYS[x.d])+'</b> · '+esc(x.n)+' · '+(Math.round(+x.m)||mins(x.d))+' min</span><span class="plx2b"><button type="button" class="plgo alt" data-e="'+k+'">Edit</button><button type="button" class="plgo alt" data-x="'+k+'" aria-label="Remove '+esc(x.n)+'">✕</button></span></div>'}).join('')+
   '<div class="plx2f" hidden></div><button type="button" class="plgo alt" data-a="add">+ Add an Others day</button></div>';
  box.innerHTML=h;
  function q(s2){return box.querySelector(s2)}
  var fb=q('[data-a=free]');if(fb)fb.onclick=function(){var p=PS();if(freeDay()!=null||anyTick(i))return;resetDay(i);p.free=i;save();paint();paintPill()};
  var ub=q('[data-a=unfree]');if(ub)ub.onclick=function(){var p=PS();if(anyTick(i))return;resetDay(i);delete p.free;save();paint();paintPill()};
  function form(k){var x=k!=null?OTHL()[k]:{n:'',d:i,m:mins(i),w:'',l:''},F=q('.plx2f');F.hidden=false;q('[data-a=add]').hidden=true;
   F.innerHTML='<label>What is it?<input type="text" maxlength="60" data-f="n" placeholder="e.g. Oxford research project"></label><label>Which day?<select data-f="d">'+DAYS.map(function(dn,di){return '<option value="'+di+'">'+dn+'</option>'}).join('')+'</select></label>'+
    '<label>How long? (minutes)<input type="number" min="5" max="240" step="5" data-f="m"></label><label>What to do <span class="plnote">(optional)</span><textarea maxlength="300" data-f="w" placeholder="e.g. Read two sources and write notes on each"></textarea></label><label>Link <span class="plnote">(optional)</span><input type="url" maxlength="300" data-f="l" placeholder="https://"></label>'+
    '<p class="plderr" hidden></p><div class="placts"><button type="button" class="plgo" data-f="save">Save</button><button type="button" class="plgo alt" data-f="cancel">Cancel</button></div><p class="plnote">Saving resets that day\'s ticks for this week.</p>';
   F.querySelector('[data-f=n]').value=x.n;F.querySelector('[data-f=d]').value=String(x.d);F.querySelector('[data-f=m]').value=Math.round(+x.m)||mins(x.d);F.querySelector('[data-f=w]').value=x.w||'';F.querySelector('[data-f=l]').value=x.l||'';
   F.querySelector('[data-f=cancel]').onclick=function(){paint()};
   F.querySelector('[data-f=save]').onclick=function(){var n=F.querySelector('[data-f=n]').value.trim(),d=+F.querySelector('[data-f=d]').value,m=Math.round(+F.querySelector('[data-f=m]').value),w=F.querySelector('[data-f=w]').value.trim(),l=F.querySelector('[data-f=l]').value.trim(),er=F.querySelector('.plderr');
    if(!n){er.hidden=false;er.textContent='Give it a name first.';return}if(!(m>=5&&m<=240)){er.hidden=false;er.textContent='Choose between 5 and 240 minutes.';return}if(l&&!/^https?:\/\//i.test(l))l='https://'+l;
    var all=Array.isArray(S.others)?S.others.slice():[];var old=k!=null?all[k]:null;var item={n:n.slice(0,60),d:d,m:m,w:w.slice(0,300),l:l.slice(0,300)};if(k!=null)all[k]=item;else all.push(item);S.others=all.slice(0,7);
    resetDay(d);if(old&&old.d!==d)resetDay(old.d);var p=PS();if(p.free===d)delete p.free;save();cur=d;paint();paintPill()}}
  var ab=q('[data-a=add]');ab.onclick=function(){form(null)};
  [].forEach.call(box.querySelectorAll('[data-e]'),function(b){b.onclick=function(){form(+b.dataset.e)}});
  [].forEach.call(box.querySelectorAll('[data-x]'),function(b){b.onclick=function(){var all=Array.isArray(S.others)?S.others.slice():[],k=+b.dataset.x,x=all[k];if(!x)return;all.splice(k,1);S.others=all;resetDay(x.d);save();paint();paintPill()}});
  return box}
 function isFix(b){return !!(b&&b[3]&&b[3][0]&&b[3][0][1]==='fix')}
 function mins(i){return [WARM(i)].concat(CORE(i)).reduce(function(s,b){return s+b[1]},0)}
 function allMins(i){return DAY(i).reduce(function(s,b){return s+b[1]},0)}
 var TOTAL=DG.reduce(function(s,_,i){return s+mins(i)},0);
 function wk(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function PS(){if(!S.plan||typeof S.plan!=='object')S.plan={};var p=S.plan;if(p.wk!==wk()){p.wk=wk();p.t={};delete p.monClr;delete p.carry;delete p.fe;delete p.ext;delete p.qs;delete p.rvpin;delete p.free}if(!p.t||typeof p.t!=='object')p.t={};if(p.auto==null)p.auto=1;if(typeof p.topics!=='string')p.topics='';return p}
 function todayI(){return (new Date().getDay()+6)%7}
 function isDone(i,j){return !!PS().t[i+'-'+j]}
 function feOn(i){var f=PS().fe;return !!(f&&f[i==null?todayI():i])}
 function allTicked(i){return DAY(i).every(function(b,j){return b[5]==='bonus'||isDone(i,j)})}
 function dayDone(i){return feOn(i)||allTicked(i)}
 /* a finished 2-minute "Just start" counts as doing the day (shown yellow, not green) */
 function qsOn(i){var q=PS().qs;return !!(q&&q[i==null?todayI():i])}
 function markQuick(){var p=PS(),t=todayI();if(!p.qs||typeof p.qs!=='object')p.qs={};if(p.qs[t])return false;p.qs[t]=1;save();try{habAuto()}catch(e){}setTimeout(function(){try{focusSend(true)}catch(_){}},50);try{paint()}catch(e){}try{paintPill()}catch(e){}loop();return true}
 var RK='critical_plan_run',ban=null,banT=null,warned={},upKey=null;
 function ymdN(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function runGet(){try{var r=JSON.parse(localStorage.getItem(RK)||'null');if(r&&r.d!==ymdN()){localStorage.removeItem(RK);return null}return r}catch(_){return null}}
 function runSet(r){try{localStorage.setItem(RK,JSON.stringify(r))}catch(_){}}
 function runClear(){try{localStorage.removeItem(RK)}catch(_){}}
 function firstLeft(day,after){if(feOn(day))return -1;for(var j=0;j<DAY(day).length;j++){if(after!=null&&j<=after)continue;if(!isDone(day,j))return j}if(after!=null)for(j=0;j<after;j++)if(!isDone(day,j))return j;return -1}
 function arenaOpen(){return !!document.querySelector('.arn')}
 function busy(){return (!!document.querySelector('#player.open')&&!(typeof P!=='undefined'&&P&&P.finished))||arenaOpen()||!!document.querySelector('.ghov,.bedov')}
 var warmP=null;
 function fmtLeft(ms){return ms<60000?Math.max(0,Math.ceil(ms/1000))+' s':Math.ceil(ms/60000)+' min'}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 var css=document.createElement('style');css.textContent=
 '.plsheet{position:fixed;inset:0;z-index:3001;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}.plsheet.open{display:flex}@media(min-width:700px){.plsheet{align-items:center}}'+
 '.plbox{width:100%;max-width:560px;max-height:90vh;max-height:90dvh;overflow:auto;background:var(--panel);color:var(--text);border-radius:20px 20px 0 0;padding:14px 16px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px}@media(min-width:700px){.plbox{border-radius:20px}}'+
 '.plhd{display:flex;align-items:center;gap:8px}.plhd b{flex:1;font-size:18px}.plx{border:0;background:none;color:var(--muted);font-size:22px;width:40px;height:40px;cursor:pointer}'+
 '.plwk{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px 12px}.plwkt{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;color:var(--muted)}.plwkt b{font-family:var(--mono);font-size:16px;color:var(--text);font-variant-numeric:tabular-nums}'+
 '.plbar{height:8px;background:var(--soft2);border-radius:4px;overflow:hidden;margin-top:6px}.plbar i{display:block;height:100%;width:0;background:var(--good-line);border-radius:4px;transition:width .3s}'+
 '.pldays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.pldays button{font:inherit;font-size:13px;font-weight:700;border:2px solid var(--line);background:var(--bg);color:var(--text);border-radius:10px;padding:8px 0 10px;cursor:pointer;position:relative;min-width:0}'+
 '.pldays button.on{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text)}.pldays button.td::after{content:"";position:absolute;left:50%;bottom:3px;width:14px;height:3px;margin-left:-7px;border-radius:2px;background:var(--accent)}'+
 '.pldays button.full::before{content:"✓";position:absolute;top:-7px;right:-5px;width:16px;height:16px;border-radius:50%;background:var(--good-line);color:#fff;font-size:10px;line-height:16px;text-align:center}'+
 '.pldays button.quick::before{content:"✓";position:absolute;top:-7px;right:-5px;width:16px;height:16px;border-radius:50%;background:#f5c542;color:#3a2600;font-size:10px;line-height:16px;text-align:center}'+
 '.pldh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.pldh b{font-size:17px}.pldh span{font-size:13px;color:var(--muted)}'+
 '.plblks{display:flex;flex-direction:column;gap:8px}.plblk{display:flex;gap:12px;align-items:flex-start;background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:12px;transition:background .2s,border-color .2s}.plblk.done{border-color:var(--good-line);background:var(--good-bg)}'+
 '.pltick{flex:none;width:32px;height:32px;border-radius:9px;border:2px solid var(--line);background:var(--panel);color:#fff;font-size:17px;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0;margin-top:1px}.plblk.done .pltick{border-color:var(--good-line);background:var(--good-line)}'+
 '.plbody{flex:1;min-width:0}.plt{font-weight:800;font-size:15px;margin:0}.plblk.done .plt>span:first-child{text-decoration:line-through}.plm{display:inline-block;font:700 12px var(--mono);color:var(--accent-text);background:var(--accent-bg);border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:1px}'+
 '.plh{margin:4px 0 0;font-size:14px;color:var(--muted);line-height:1.45}.placts{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}'+
 '.plgo{font:inherit;font-size:13px;font-weight:800;border:0;border-radius:10px;padding:8px 12px;cursor:pointer;background:var(--accent);color:var(--on-accent);text-decoration:none;display:inline-flex;align-items:center;gap:5px;line-height:1.2}.plgo.alt{background:var(--soft);color:var(--text)}'+
 '.pltop{margin-top:10px}.pltop label{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.pltop textarea{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:14px;color:var(--text);background:var(--panel);border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;min-height:70px;resize:vertical;margin-top:5px}'+
 '.plseg{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--soft);border-radius:12px;padding:4px}.plseg button{font:inherit;font-size:14px;font-weight:700;border:0;border-radius:9px;padding:8px;background:none;color:var(--muted);cursor:pointer}.plseg button.on{background:var(--panel);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.14)}'+
 '.plmain,.pldv{display:flex;flex-direction:column;gap:12px}.plmain[hidden],.pldv[hidden]{display:none}.pldnow{background:var(--accent-bg);color:var(--accent-text);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.45}.pldnow b{display:block;font-size:16px}'+
 '.pldl{display:flex;flex-direction:column;gap:6px}.pldr{display:flex;gap:10px;align-items:center;background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:9px 12px;min-width:0}.pldr .tm{font:700 13px var(--mono);min-width:62px;color:var(--muted);font-variant-numeric:tabular-nums}.pldr .lb{flex:1;min-width:0;font-weight:700;font-size:15px}.pldr.past{opacity:.55}.pldr.now{border-color:var(--accent);background:var(--accent-bg)}.pldr.now .tm,.pldr.now .lb{color:var(--accent-text)}'+
 '.pldr .dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--muted)}.pldr .dot.k-plan,.pldr .dot.k-study{background:var(--accent)}.pldr .dot.k-eat{background:var(--amber)}.pldr .dot.k-free{background:var(--good-line)}.pldr .dot.k-read{background:#7F77DD}.pldr .dot.k-sleep{background:var(--line)}.pldr .nowb{font:800 11px var(--mono);background:var(--accent);color:var(--on-accent);border-radius:999px;padding:2px 8px;flex:none}.pldr .plgo{padding:6px 10px;flex:none}'+
 '.pldr input{font:inherit;font-size:14px;color:var(--text);background:var(--panel);border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;min-width:0}.pldr input[type=time]{width:130px;flex:none}.pldr input[type=text]{flex:1}.pldr .pldel{border:0;background:none;color:var(--muted);font-size:18px;width:32px;height:32px;cursor:pointer;flex:none}.plderr{color:var(--bad);font-size:13px;margin:0}'+
 '.plseg{grid-template-columns:repeat(4,1fr)}@media(max-width:440px){.plseg button{font-size:13px;padding:8px 2px}}.plhb{display:flex;flex-direction:column;gap:12px}.plhb[hidden]{display:none}'+
 '.plhl{display:flex;flex-direction:column;gap:8px}.plh1{display:flex;gap:12px;align-items:flex-start;background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:12px}.plh1.done{border-color:var(--good-line);background:var(--good-bg)}.plh1.half{border-color:var(--good-line)}'+
 '.plhk{flex:none;width:40px;height:40px;border-radius:12px;border:2px solid var(--line);background:var(--panel);color:#fff;font-size:19px;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0}.plh1.done .plhk{background:var(--good-line);border-color:var(--good-line)}.plh1.half .plhk{background:linear-gradient(135deg,var(--good-line) 50%,var(--panel) 50%);border-color:var(--good-line);color:var(--text)}'+
 '.plhb .plbody{flex:1;min-width:0}.plhn{font-weight:800;font-size:15px;margin:0}.plht{font-size:13.5px;color:var(--muted);margin:3px 0 0;line-height:1.4}.plhs{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:7px;font-size:13px}.plhs b{font-family:var(--mono)}.plhp{display:flex;align-items:center;gap:6px;flex:1 1 150px;min-width:130px}.plhbar{flex:1;height:6px;background:var(--soft2);border-radius:3px;overflow:hidden;min-width:60px}.plhbar i{display:block;height:100%;background:#7F77DD}.plhw{font-size:13px;color:var(--warn);margin:6px 0 0}'+
 '.plgrid{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px 12px;overflow-x:auto}.plgrid:empty{display:none}.plgt{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}.plgr{display:grid;align-items:center;gap:3px;margin-bottom:4px}.plgr span{font-size:12px;color:var(--muted);text-align:center;min-width:0}.plgr .gl{text-align:left;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.plgc{aspect-ratio:1;border-radius:4px;border:1px solid var(--line);background:var(--panel);padding:0;cursor:pointer;min-width:0}.plgc.d1{background:var(--good-line);border-color:var(--good-line)}.plgc.d2{background:var(--good-bg);border-color:var(--good-line)}.plgc.miss{background:var(--soft)}.plgc.fut{opacity:.35;cursor:default}.plgc.td{outline:2px solid var(--accent);outline-offset:1px}.plgc.pre{opacity:.4}'+
 '.plauto{background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}.plauto .plgt{margin:0}.plauto .plnote{margin:0}.plauto-t{font:800 10.5px var(--mono);letter-spacing:.05em;text-transform:uppercase;background:var(--accent-bg);color:var(--accent-text);border-radius:999px;padding:2px 7px;vertical-align:2px}'+
 '.plsetup summary{cursor:pointer;font-weight:700;font-size:14px}.plsteps{margin:8px 0;padding-left:20px;font-size:14px;line-height:1.5;display:flex;flex-direction:column;gap:5px}.plsteps code{font:700 13px var(--mono);background:var(--soft);border-radius:5px;padding:0 5px}'+
 '.plcopy{display:flex;gap:6px;align-items:flex-end;margin-top:6px}.plcopy label{flex:1;display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:800;color:var(--muted);min-width:0}.plcopy input{font:13px var(--mono);padding:7px 9px;border:1.5px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);min-width:0}'+
 '.plpick{display:flex;flex-direction:column;gap:6px}.plpick .plgt{margin:0}.plpk{display:flex;gap:10px;align-items:center;font-size:14px;cursor:pointer}.plpk input{width:20px;height:20px;accent-color:var(--accent);flex:none}'+
 'body:has(.plban) .plbox{padding-bottom:calc(150px + env(safe-area-inset-bottom))}'+
 '.plcarry{background:var(--warn-bg);color:var(--text);border-radius:10px;padding:8px 10px}.plfixn{color:var(--text)}'+
 '.plopt{display:flex;gap:10px;align-items:center;font-size:14px;cursor:pointer}.plopt input{width:20px;height:20px;accent-color:var(--accent);flex:none}.plnote{font-size:13px;color:var(--muted);margin:0;line-height:1.45}.pldone{font-size:14px;font-weight:800;color:var(--good);margin:0}'+
 '.plrun:empty{display:none}.plrun{background:var(--accent-bg);border:2px solid var(--accent);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}.plrun p{margin:0;font-size:14px;line-height:1.45}.plrun b{font-size:16px}.plrun .placts{margin-top:0}.plbig{font:inherit;font-size:16px;font-weight:800;border:0;border-radius:12px;padding:12px 16px;cursor:pointer;background:var(--accent);color:var(--on-accent);width:100%}'+
 '.plban{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom));z-index:3500;width:min(460px,calc(100% - 32px));background:var(--panel);color:var(--text);border:2px solid var(--accent);border-radius:16px;padding:12px 14px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:8px}.plban p{margin:0;font-size:15px;line-height:1.45}.plban .placts{margin-top:0}'+
 '.plpill .plc{font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:12px}.plpill.run{background:var(--accent);color:var(--on-accent)}.plpill.run .pldot{display:none}'+
 '.plpill{position:relative}.plpill .pldot{position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:#e8742a;border:2px solid var(--panel);display:none}.plpill.left .pldot{display:block}.plpill.run .pldot{display:none!important}@media(max-width:374px){.hdr .plpill{padding:5px 7px}}';
 css.textContent+='.plpf,.plpg{margin:0;font-size:13.5px;line-height:1.5}.plpg.ok{color:var(--good)}.plpg.behind{color:#c98a12}.plpgf{display:flex;flex-direction:column;gap:8px;margin-top:6px}.plpgf label{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:800;color:var(--muted)}.plpgf select,.plpgf input{font:inherit;font-size:14px;padding:7px 9px;border-radius:9px;border:1.5px solid var(--line);background:var(--panel);color:var(--text)}.plpw summary{cursor:pointer;font-size:13px;font-weight:700}.plpw p{margin:6px 0 0}';
 css.textContent+='.plpath{background:var(--bg);border:1.5px solid var(--accent);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}.plpath .plgt{margin:0}.plpnow{margin:0;font-size:14px;line-height:1.5}.plpath details summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--muted)}.pplist{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}.pplist li{display:flex;gap:8px;align-items:flex-start;font-size:13px;padding:5px 6px;border-radius:8px}.pplist .ppi{width:20px;flex:none;text-align:center}.pplist .ppn{flex:1;min-width:0}.pplist .ppn small{display:block;color:var(--muted)}.pplist .ppd{font-family:var(--mono);color:var(--muted);flex:none}.pp-done{opacity:.6}.pp-next{background:var(--accent-bg);font-weight:800}.pp-lock .ppn{color:var(--muted)}'+
 '.smtog select{font:inherit;font-size:14px;padding:6px 8px;border-radius:9px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);flex:none;align-self:center}';
 css.textContent+='.plx2{display:flex;flex-direction:column;gap:10px;margin-top:4px}.plx2r{display:flex;gap:10px;align-items:center;justify-content:space-between;background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.45}.plx2r>span:first-child{flex:1;min-width:0}.plx2b{display:flex;gap:6px;flex:none}'+
 '.plx2o{display:flex;flex-direction:column;gap:8px;background:var(--panel);border:1.5px dashed var(--line);border-radius:14px;padding:12px}.plx2o .plgt{margin:0}.plx2o>.plgo{align-self:flex-start}.plx2f{display:flex;flex-direction:column;gap:9px}.plx2f[hidden]{display:none}.plx2f label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:800;color:var(--muted)}'+
 '.plx2f input,.plx2f select,.plx2f textarea{font:inherit;font-size:15px;font-weight:400;color:var(--text);background:var(--bg);border:1.5px solid var(--line);border-radius:10px;padding:8px 10px}.plx2f textarea{min-height:60px;resize:vertical}.plx2f .plnote{font-weight:400}';
 document.head.appendChild(css);
 var sh=document.createElement('div');sh.className='plsheet';
 sh.innerHTML='<div class="plbox" role="dialog" aria-modal="true" aria-label="This week\'s plan"><div class="plhd"><b>This week\'s plan</b><button class="plx" type="button" aria-label="Close">✕</button></div>'+
  '<div class="plseg" role="tablist" aria-label="View"><button type="button" role="tab" data-v="plan">Study plan</button><button type="button" role="tab" data-v="day">School day</button><button type="button" role="tab" data-v="hab">Habits</button><button type="button" role="tab" data-v="tst">Tests</button></div>'+
  '<div class="plmain"><div class="plwk"><div class="plwkt"><span>Ticked off this week</span><b data-k="wk"></b></div><div class="plbar"><i data-k="bar"></i></div></div><div class="rvnext" data-k="tnext" hidden></div>'+
  '<div class="pldays" role="tablist" aria-label="Day"></div>'+
  '<div class="pldh"><b data-k="dn"></b><span data-k="dt"></span></div>'+
  '<div class="plrun" data-k="run"></div><div class="plblks"></div><p class="pldone" data-k="done" hidden>That\'s today\'s plan done. Nice work.</p>'+
  '<label class="plopt"><input type="checkbox" data-k="auto"> Start the study timer when I tap a button</label>'+
  '<p class="plnote">Homework comes first. Missed a day? Don\'t double up the next day. Do that day\'s plan and carry on.</p></div>'+
  '<div class="pldv" hidden><div class="pldnow" data-k="now"></div><div class="pldl"></div>'+
  '<label class="plopt"><input type="checkbox" data-k="nudge"> <span data-k="nudget">Nudge me when it\'s time (while Critical is open)</span></label>'+
  '<div class="placts" data-k="dacts"></div><p class="plnote">Monday to Friday. At weekends your plan is 1 hour, whenever suits you.</p></div>'+
  '<div class="plhb" hidden><div class="pldnow" data-k="hnow"></div><div class="plhl"></div><div class="plgrid" data-k="grid"></div><div class="plpick" data-k="pick"></div></div><div class="pltv" hidden></div></div>';
 document.body.appendChild(sh);
 var $q=function(s){return sh.querySelector(s)},cur=todayI(),days=$q('.pldays');
 AB.forEach(function(a,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=a;b.setAttribute('aria-label',DAYS[i]);b.onclick=function(){cur=i;paint()};days.appendChild(b)});
 function go(a,title,openUrl){if(PS().auto&&typeof STUDY!=='undefined'&&STUDY.start)STUDY.start(title);
  if(a[1]==='url'){if(openUrl)try{window.open(a[2],'_blank','noopener')}catch(_){}return}close();if(document.querySelector('#player.open')&&typeof closePlayer==='function')closePlayer();
  if(a[1]==='app'){location.href=a[2];return}
  if(a[1]==='path'){pathGo();return}if(a[1]==='pathrev'){pathReview();return}if(a[1]==='brk'){brkOpen(a[2]);return}if(a[1]==='restrack'){try{resOpen(a[2])}catch(_){}return}if(a[1]==='other'){toastIn('Timer running: '+(a[2]||'your project')+'. Come back here when it\'s done.');return}if(a[1]==='freelearn'){showPage('learn');return}if(a[1]==='freerev'){showPage('review');return}if(a[1]==='mix'){smMix();return}if(a[1]==='ghost'){smGhost();return}if(a[1]==='bed'){try{bedOpen()}catch(_){}return}
  if(a[1]==='warm'){var mc=null;try{mc=MEM.counts()}catch(_){}var wg=false;try{wg=warmGo()}catch(_){}if(!wg){if(mc&&mc.total)MEM.start();else ONE.start()}warmP=typeof P!=='undefined'?P:null;return}
  if(a[1]==='rev'){var rr2=runGet(),bl=DAY(rr2?rr2.day:cur)[0];try{REV.hub(bl&&bl[5]==='rev'?bl[6]:null)}catch(e){if(window.console)console.error(e)}return}
  if(a[1]==='clash'){try{ARENA.open()}catch(_){}return}
  if(a[1]==='sim'){showPage('sim');return}
  if(a[1]==='fix'){var n=pile(),rr=runGet();if(n>0){showPage('review');startReview(true);return}
   if(rr&&isFix(DAY(rr.day)[rr.j])&&rr.day!==0){rr.ends=Date.now();rr.early=1;rr.clr=1;runSet(rr);showPage('review');loop();return}
   if(todayI()===0||(rr&&rr.day===0)){if(rr&&rr.day===0&&isFix(DAY(0)[rr.j])){rr.gm=1;rr.t='GCSE maths';runSet(rr)}var amk=alOpen()?'am':'gm';toastIn('Nothing to fix right now, so here\'s your next '+(amk==='am'?'A-level':'GCSE')+' Maths lesson.');if(amk==='am'){S.mode=S.asub='am';S.seenAlevel=1}else{S.mode=S.gsub='gm';S.seenGcse=1}save();showPage('learn');runAction(nextAction(amk));return}
   showPage('review');toastIn('Nothing left to fix. Nice.');return}
  if(a[1]==='gp'||a[1]==='gc'||a[1]==='gm'||a[1]==='gcs'){S.mode=S.gsub=a[1];S.seenGcse=1;save();showPage('learn');runAction(nextAction(a[1]));return}
  if(a[1]==='am'||a[1]==='ap'||a[1]==='ac'){if(!alOpen()){showPage('learn');toastIn('A-level unlocks when GCSE is done.');return}S.mode=S.asub=a[1];S.seenAlevel=1;save();showPage('learn');runAction(nextAction(a[1]));return}
  if(a[1]==='calc'||a[1]==='theory'||a[1]==='maths'){S.mode=a[1];if(a[1]==='calc')S.seenCalc=1;else if(a[1]==='theory')S.seenTheory=1;save();showPage('learn');runAction(nextAction(a[1]));return}
  if(a[1]==='calcfu'){S.mode='calc';S.seenCalc=1;save();showPage('learn');var id=null;allLessons('calc',0).forEach(function(x){var l=UNITS[x[0]].lessons[x[1]];if(S.done[l.id]&&FOLLOW[l.id])id=l.id});if(id)startFollow(id);else runAction(nextAction('calc'))}}
 /* ----- study smart tab: how to study well, and the extras the plan now uses ----- */
 (function(){var sg=$q('.plseg'),b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.v='smt';b.textContent='Study smart';b.onclick=function(){setView('smt')};sg.appendChild(b);
  var v=document.createElement('div');v.className='plsm';v.hidden=true;$q('.plbox').appendChild(v);
  var c=document.createElement('style');c.textContent='.plseg{grid-template-columns:repeat(5,minmax(0,1fr))!important}.plseg button{line-height:1.2}@media(max-width:440px){.plseg button{font-size:12px!important;padding:7px 1px!important}}'+
  '.plsm{display:flex;flex-direction:column;gap:12px}.plsm[hidden]{display:none}'+
  '.smhero{background:linear-gradient(135deg,var(--accent-bg),var(--bg));border:1.5px solid var(--accent);border-radius:16px;padding:14px}.smhero b{font-size:17px}.smhero p{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--text)}'+
  '.smsteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:10px}.smsteps span{background:var(--panel);border-radius:12px;padding:8px 6px;text-align:center;font-size:13px;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:4px}.smsteps i{font-style:normal;width:24px;height:24px;border-radius:50%;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font:800 13px var(--mono)}.smsteps span.on{outline:2px solid #f5c542}'+
  '.smtog{background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:12px;align-items:flex-start!important}.smtog .plnote{display:block;margin-top:3px}'+
  '.smnow{background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:12px}.smnow .plgt{margin:0}.smnow .placts button{font:inherit;font-size:13px;font-weight:800;border:0;border-radius:10px;padding:9px 12px;cursor:pointer;background:var(--soft);color:var(--text)}'+
  '.smqs{display:flex;flex-direction:column;gap:8px}.smq{background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:0 12px}.smq[open]{border-color:var(--accent)}.smq summary{cursor:pointer;list-style:none;display:flex;gap:10px;align-items:center;padding:11px 0;font-weight:800;font-size:15px}.smq summary::-webkit-details-marker{display:none}.smq summary::after{content:"▸";margin-left:auto;color:var(--muted)}.smq[open] summary::after{content:"▾"}'+
  '.sme{font-size:20px;flex:none;width:28px;text-align:center}.smb{padding:0 0 12px}.smb p{margin:0 0 8px;font-size:14.5px;line-height:1.55}.smb .smin{margin:0;background:var(--accent-bg);color:var(--text);border-radius:10px;padding:8px 10px;font-size:14px}'+
  '.smnight{background:linear-gradient(135deg,#1d1b3a,#2b2860)!important;border-color:#4a45a0!important;color:#eceaff}.smnight .plh{color:#c9c6f2}.smnight .plm{background:rgba(255,255,255,.14);color:#fff}.smnight .plgo.alt{background:rgba(255,255,255,.14);color:#fff}.smmoon{flex:none;width:32px;font-size:24px;text-align:center}'+
  '.pldr .dot.k-bed{background:#4a45a0}'+
  '.brkov{position:fixed;inset:0;z-index:3400;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#203a4a,#0d1620);color:#eaf6ff;padding:24px;text-align:center}.brkin{max-width:420px;display:flex;flex-direction:column;align-items:center;gap:12px}'+
  '.brkk{margin:0;font:800 13px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#8fd3ff}.brkc{position:relative;width:200px;height:200px;display:grid;place-items:center}.brkc i{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(120,210,255,.35),rgba(120,210,255,.06));border:2px solid rgba(143,211,255,.55);animation:brkbr 8s ease-in-out infinite}'+
  '@keyframes brkbr{0%,100%{transform:scale(.62)}50%{transform:scale(1)}}@media(prefers-reduced-motion:reduce){.brkc i{animation:none;transform:scale(.85)}}'+
  '.brkt{position:relative;font:800 44px var(--mono);font-variant-numeric:tabular-nums}.brkb{margin:0;font-size:18px;font-weight:700}.brktip{margin:0;font-size:16px;line-height:1.5;min-height:48px;color:#cfe9ff}.brkn{margin:0;font-size:14px;color:#9fbfd6;line-height:1.5}'+
  '.brkx{margin-top:8px;font:inherit;font-size:14px;font-weight:700;border:1.5px solid rgba(143,211,255,.4);background:none;color:#cfe9ff;border-radius:999px;padding:9px 18px;cursor:pointer}';
  document.head.appendChild(c)})();
 var SMQ=[
  ['🧘','Do I need a break after studying?','Yes. Straight after you learn something, your brain keeps replaying it and filing it away. In experiments, people who rested quietly for about 10 minutes after learning remembered more than people who went straight on to something else. So take 5 to 10 minutes where you don\'t take in anything new. Scrolling TikTok or YouTube doesn\'t count: that\'s new information, and it gets in the way.','Every plan day now ends with a 5-minute <b>Let it sink in</b> break, with a timer and a breathing circle.'],
  ['⏱️','How long should I study in one go?','A good rule is about 25 minutes of proper focus, then a 5-minute break. After a while your attention drops and you end up reading without anything going in. Longer sessions are fine as long as you break them up.','When a day is longer than about 25 minutes, the plan puts a <b>Brain break</b> in the middle. Weekends get two.'],
  ['❓','Is re-reading my notes a good way to revise?','Not really. Re-reading feels easy, so it feels like it\'s working, but it does very little. Testing yourself (trying to remember before you look) is one of the best ways to learn there is. Even getting it wrong and then seeing the answer helps.','Every lesson asks questions, the warm-up tests old topics, and Fix my mistakes brings back what you got wrong.'],
  ['📅','Should I cram the night before?','Spread it out instead. 20 minutes on three different days beats an hour in one go. Each time you nearly forget something and then remember it, the memory gets stronger.','Memory refresh brings things back after 1, 3, 7, 14, 30 and 60 days, and revision days are spread over the week before a test.'],
  ['🔀','Should I practise one topic at a time?','Once you know the basics, mix topics up. In an exam you have to work out which method each question needs, and doing ten of the same question in a row skips that step. Mixing feels harder and slower, and that\'s normal.','<b>Mixed practice</b> is on Wednesday and Saturday.'],
  ['😴','Does sleep really matter?','A lot. While you sleep, your brain moves the day\'s learning into long-term memory. Going over a few things before bed and then sleeping helps them stick. Staying up late on your phone cuts that short.','The <b>bedtime review</b> is 5 minutes on today\'s work, with new questions like the ones you got wrong. It\'s in your school day just before screens off.'],
  ['🗣️','How do I know I really understand something?','Explain it in your own words, as if to a friend. The part you can\'t explain is the part to go back to. Asking yourself "why?" and "how does this link to what I already know?" works too.','Explain-it-back cards, and the question you write at the start of each lesson.'],
  ['📈','How do I know I\'m getting better?','Test yourself before and after. Feeling like you\'ve improved isn\'t reliable; a score is.','<b>Beat your ghost</b> is on Sunday. Take it before a new unit and again after, and compare.'],
  ['📵','Where should my phone be?','Out of reach, ideally in another room. Notifications break your focus, and even checking it "for a second" takes a while to recover from.','Critical Focus for Chrome blocks TikTok during your plan, and the Habits tab has a screens-off habit.'],
  ['💧','Anything else?','Drink water, move about between sessions, and study at a desk rather than in bed (the 5-minute bedtime review is the exception). Do the hardest thing early, while you\'re fresh.','The warm-up gets you going, then the hardest block comes straight after.']];
 function paintSmart(){$q('.plhd b').textContent='Study smart';var V=$q('.plsm'),on=smOn(),base=0,sm=0,h=new Date().getHours();
  function sum(a,b){return a+(b[5]==='bonus'?0:b[1])}for(var i=0;i<7;i++){base+=DAYF(i,0).reduce(sum,0);sm+=DAYF(i,1).reduce(sum,0)}
  var r=runGet(),rb=r?(DAY(r.day)[r.j]||[])[5]:null,step=rb==='brk'?3:r?2:h>=21||h<4?3:0;
  var x='<div class="smhero"><b>Your brain learns in 3 steps</b><div class="smsteps"><span'+(step===1?' class="on"':'')+'><i>1</i>Take it in</span><span'+(step===2?' class="on"':'')+'><i>2</i>Pull it back out</span><span'+(step===3?' class="on"':'')+'><i>3</i>Let it settle</span></div><p>Lessons do step 1. Questions, warm-ups and reviews do step 2. Breaks and sleep do step 3, and that\'s the one most people skip.</p></div>';
  x+='<label class="plopt smtog"><input type="checkbox" data-k="smon"'+(on?' checked':'')+'><span><b>Use the study-smart plan</b><span class="plnote">Adds brain breaks, mixed practice on Wednesday and Saturday, a ghost test on Sunday and a bedtime review. Your week goes from '+base+' to '+sm+' minutes.</span></span></label>';
  x+='<label class="plopt smtog"><span><b>Quantum & maths path in your plan</b><span class="plnote">A daily slot that picks the best next step: Quantum or the Calculus it needs, catching up on anything you\'re behind on first.</span></span><select data-k="pathm"><option value="0">Off</option><option value="1">10 min a day</option><option value="2">20 min a day</option></select></label>';
  x+='<div class="smnow"><div class="plgt">Do one now</div><div class="placts"><button type="button" data-a="brk">🧘 5-minute break</button><button type="button" data-a="mix">🔀 Mixed practice</button><button type="button" data-a="ghost">👻 Beat your ghost</button><button type="button" data-a="bed">🌙 Bedtime review</button></div></div>';
  x+='<div class="smqs">'+SMQ.map(function(q,i){return '<details class="smq"'+(i===0?' open':'')+'><summary><span class="sme" aria-hidden="true">'+q[0]+'</span><span>'+esc(q[1])+'</span></summary><div class="smb"><p>'+esc(q[2])+'</p><p class="smin"><b>In Critical:</b> '+q[3]+'</p></div></details>'}).join('')+'</div>';
  V.innerHTML=x;
  var pm=V.querySelector('[data-k=pathm]');pm.value=String(pathCode());pm.onchange=function(){S.pathMode=+pm.value;save();try{smSync()}catch(e){if(window.console)console.error(e)}paintPill();paint()};
  V.querySelector('[data-k=smon]').onchange=function(){S.smart=this.checked?1:0;save();try{smSync()}catch(e){if(window.console)console.error(e)}paintPill();paint()};
  [].forEach.call(V.querySelectorAll('.smnow button'),function(bt){bt.onclick=function(){var a=bt.dataset.a;close();if(document.querySelector('#player.open')&&typeof closePlayer==='function'&&a!=='brk')closePlayer();
   if(a==='brk')brkOpen(1);else if(a==='mix')smMix();else if(a==='ghost')smGhost();else try{bedOpen()}catch(_){}}})}
 /* ----- school-day timetable ----- */
 var DAYDEF=[['16:15','Home, snack and a break','home'],['16:45','Homework','study'],['17:30','Critical: today\'s plan','plan'],['18:00','Free time','free'],['19:00','Dinner','eat'],['19:45','Free time','free'],['21:30','Screens off and read','read'],['22:00','Sleep','sleep']];
 function rows(){var r=S.dayplan;if(!r||!r.length||!r.every(function(x){return x&&/^\d\d:\d\d$/.test(x[0])}))r=DAYDEF;return bedRow(r)}
 function bedRow(r){if(!smOn()||r.some(function(x){return x[2]==='bed'}))return r;var k=-1;r.forEach(function(x,i){if(x[2]==='read'&&k<0)k=i});if(k<0)r.forEach(function(x,i){if(x[2]==='sleep'&&k<0)k=i});if(k<0)return r;
  var m=tmin(r[k][0])-15;if(k>0&&tmin(r[k-1][0])>=m)m=Math.round((tmin(r[k-1][0])+tmin(r[k][0]))/2);var o=r.slice(),hh=Math.floor(m/60),mm=m%60;o.splice(k,0,[(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm,'Bedtime review (5 min, in bed)','bed']);return o}
 function tmin(x){var a=x.split(':');return +a[0]*60+ +a[1]}
 function f12(x){var m=tmin(x),h=Math.floor(m/60),n=m%60;return (h%12||12)+':'+(n<10?'0':'')+n+(h>=12?'pm':'am')}
 function nowMin(){var d=new Date();return d.getHours()*60+d.getMinutes()}
 function m12(m){var h=Math.floor(m/60)%24,n=m%60;return (h%12||12)+':'+(n<10?'0':'')+n+(h>=12?'pm':'am')}
 /* when you got home today: set when the PC opens Critical after 3pm on a school day (#home), or with "I'm home now" */
 var HK='critical_home',HOME_FROM=15*60;
 function homeGet(){try{var o=JSON.parse(localStorage.getItem(HK)||'null');return o&&o.d===ymdN()?o:null}catch(_){return null}}
 function homeSet(at,off){try{localStorage.setItem(HK,JSON.stringify({d:ymdN(),at:at,off:off?1:0}))}catch(_){}}
 function homeAuto(){if(todayI()>4||homeGet())return;var m=nowMin(),T=rows(),last=tmin(T[T.length-1][0]);if(m>=HOME_FROM&&m<last)homeSet(m,0)}
 var FLEX={home:1,study:1,plan:1};
 /* today's rows as [startMin,label,kind]: the usual times, or moved to start when you got home. Dinner, screens off and sleep stay put. */
 function sched(){var T=rows().map(function(r){return {m:tmin(r[0]),l:r[1],k:r[2]||'free'}}).sort(function(a,b){return a.m-b.m});
  T.forEach(function(r,i){r.d=T[i+1]?T[i+1].m-r.m:0});
  var h=todayI()<5?homeGet():null,A=h&&!h.off?h.at:null,info={shift:0,skip:[],skipK:[],at:A};
  if(A==null||Math.abs(A-T[0].m)<3){info.rows=T.map(function(r){return [r.m,r.l,r.k]});return info}
  var X=T.filter(function(r){return !FLEX[r.k]&&r.k!=='free'}).map(function(r){return {m:r.m,e:r.k==='sleep'?r.m+600:r.m+r.d,l:r.l,k:r.k}}).filter(function(x){return x.e>A}),
   lim=X.filter(function(x){return x.k==='read'||x.k==='sleep'}).reduce(function(a,x){return Math.min(a,x.m)},24*60),F=T.filter(function(r){return FLEX[r.k]});
  function place(brk){var cur=A,out=[],skip=[],full=false;
   F.forEach(function(f){var d=f.k==='home'?Math.min(f.d,brk):f.d,st=cur,mv=true,g=0;
    if(f.k==='home'){var hit=X.filter(function(x){return st<x.e&&st+d>x.m})[0];if(hit&&hit.m-st>=10)d=hit.m-st}
    while(mv&&g++<20){mv=false;X.forEach(function(x){if(st<x.e&&st+d>x.m){st=x.e;mv=true}})}
    if(full||st+d>lim){full=true;skip.push(f)}else{out.push({m:st,e:st+d,l:f.l,k:f.k});cur=st+d}});
   return {out:out,skip:skip}}
  var P1=place(999);if(P1.skip.length){var P2=place(10);if(P2.skip.length<P1.skip.length)P1=P2}
  info.skip=P1.skip.map(function(f){return f.l});info.skipK=P1.skip.map(function(f){return f.k});
  var all=P1.out.concat(X).sort(function(a,b){return a.m-b.m}),R=[],end=A;
  all.forEach(function(r){if(r.m-end>=10&&r.m>A)R.push([end,'Free time','free']);R.push([r.m,r.l,r.k]);end=Math.max(end,r.k==='sleep'?r.m:r.e)});
  info.shift=A-T[0].m;info.rows=R;return info}
 function nowRow(){if(todayI()>4)return -1;var R=sched().rows,m=nowMin(),k=-1;for(var i=0;i<R.length;i++)if(R[i][0]<=m)k=i;return k}
 var view=(S.plView==='day'||S.plView==='hab'||S.plView==='tst'||S.plView==='smt')?S.plView:'plan',editing=null;
 function setView(v){view=v;S.plView=v;save();editing=null;paint()}
 [].forEach.call(sh.querySelectorAll('.plseg button'),function(b){b.onclick=function(){setView(b.dataset.v)}});
 function paintDay(){var D2=$q('.pldv'),SC=sched(),R=SC.rows,t=todayI(),school=t<5,k=nowRow(),L=$q('.pldl'),now=$q('[data-k=now]'),A=$q('[data-k=dacts]'),hm=homeGet();L.innerHTML='';A.innerHTML='';
  if(editing){now.innerHTML='<b>Edit your usual school day</b>Change any time or name. Rows sort themselves by time when you save. If you get home late, the first part still moves later by itself.';
   editing.forEach(function(r,i){var e=document.createElement('div');e.className='pldr';e.innerHTML='<input type="time" step="300" aria-label="Start time"><input type="text" maxlength="40" aria-label="What you do"><button class="pldel" type="button" aria-label="Remove this row">✕</button>';
    var ti=e.querySelector('[type=time]'),tx=e.querySelector('[type=text]');ti.value=r[0];tx.value=r[1];ti.oninput=function(){r[0]=ti.value};tx.oninput=function(){r[1]=tx.value};
    e.querySelector('.pldel').onclick=function(){editing.splice(i,1);paintDay()};L.appendChild(e)});
   var er=document.createElement('p');er.className='plderr';er.hidden=true;L.appendChild(er);
   var add=document.createElement('button');add.type='button';add.className='plgo alt';add.textContent='+ Add a row';add.onclick=function(){var last=editing.length?editing[editing.length-1][0]:'16:00';editing.push([last,'','free']);paintDay()};
   var sv=document.createElement('button');sv.type='button';sv.className='plgo';sv.textContent='Save';sv.onclick=function(){var bad=editing.filter(function(r){return !/^\d\d:\d\d$/.test(r[0])||!r[1].trim()}).length;
    if(!editing.length||bad){er.hidden=false;er.textContent=!editing.length?'Add at least one row first.':'Every row needs a time and a name.';return}
    S.dayplan=editing.map(function(r){return [r[0],r[1].trim(),r[2]||'free']}).sort(function(a,b){return tmin(a[0])-tmin(b[0])});save();editing=null;paint()};
   var cn=document.createElement('button');cn.type='button';cn.className='plgo alt';cn.textContent='Cancel';cn.onclick=function(){editing=null;paint()};
   var rs=document.createElement('button');rs.type='button';rs.className='plgo alt';rs.textContent='Reset to the original';rs.onclick=function(){editing=DAYDEF.map(function(r){return r.slice()});paintDay()};
   A.appendChild(sv);A.appendChild(add);A.appendChild(cn);A.appendChild(rs);return}
  if(!school)now.innerHTML='<b>It\'s the weekend</b>This timetable is for school days. Your plan today is in Study plan.';
  else if(k<0)now.innerHTML='<b>Your evening starts when you get home</b>Usually '+m12(R[0][0])+'. It starts when you turn on your PC after 3pm, or when you press I\'m home now.';
  else now.innerHTML='<b>Now: '+esc(R[k][1])+'</b>'+(R[k+1]?'Until '+m12(R[k+1][0])+'. Next: '+esc(R[k+1][1])+'.':'Good night.');
  if(school&&SC.at!=null&&SC.shift){var sh2=document.createElement('p');sh2.className='plnote plcarry';var ad=Math.abs(SC.shift),dur=ad>=60?Math.floor(ad/60)+(ad>=120?' hours':' hour')+(ad%60?' '+ad%60+' min':''):ad+' minutes';sh2.textContent='You got home at '+m12(SC.at)+', so your evening starts from then ('+dur+(SC.shift>0?' later':' earlier')+' than usual). Dinner, screens off and sleep stay the same.';L.appendChild(sh2)}
  if(school&&SC.skip.length){var sk=document.createElement('p');sk.className='plnote plcarry';sk.textContent=SC.skipK.indexOf('study')>=0?'It\'s late, so not everything fits tonight. If you have homework due tomorrow, do that and skip the rest.':'Doesn\'t fit tonight: '+SC.skip.join(', ')+'. Homework comes first, so leave it for tomorrow.';L.appendChild(sk)}
  R.forEach(function(r,i){var e=document.createElement('div');e.className='pldr'+(school&&k>=0&&i<k?' past':'')+(school&&i===k?' now':'');
   e.innerHTML='<span class="dot k-'+esc(r[2]||'free')+'"></span><span class="tm">'+m12(r[0])+'</span><span class="lb">'+esc(r[1])+'</span>'+(school&&i===k?'<span class="nowb">Now</span>':'');
   if(r[2]==='bed'){var bb2=document.createElement('button');bb2.type='button';bb2.className='plgo alt';bb2.textContent='Open →';bb2.onclick=function(){close();try{bedOpen()}catch(_){}};e.appendChild(bb2)}
   if(r[2]==='plan'&&school){var dn=firstLeft(t)<0,run=!!runGet(),hwm=hwOn(),b=document.createElement('button');b.type='button';b.className='plgo'+(dn||run||hwm?' alt':'');b.textContent=dn?'Done ✓':run?'Running':hwm?'Homework…':'Start →';if(!dn&&!run&&!hwm)b.onclick=function(){startRun()};else b.onclick=function(){setView('plan')};e.appendChild(b)}
   L.appendChild(e)});
  if(school&&nowMin()>=HOME_FROM){var ih=document.createElement('button');ih.type='button';ih.className='plgo';ih.textContent='I\'m home now';ih.onclick=function(){homeSet(nowMin(),0);paint()};A.appendChild(ih);
   if(hm&&!hm.off&&SC.shift){var us=document.createElement('button');us.type='button';us.className='plgo alt';us.textContent='Use my usual times';us.onclick=function(){homeSet(null,1);paint()};A.appendChild(us)}}
  var ed=document.createElement('button');ed.type='button';ed.className='plgo alt';ed.textContent='Edit times';ed.onclick=function(){editing=rows().map(function(r){return r.slice()});paintDay()};A.appendChild(ed);
  var pr=R.filter(function(r){return r[2]==='plan'})[0],rr=R.filter(function(r){return r[2]==='read'})[0],parts=[];if(pr)parts.push(m12(pr[0])+' for your plan');if(rr)parts.push(m12(rr[0])+' for screens off');
  $q('[data-k=nudget]').textContent=parts.length?'Nudge me at '+parts.join(' and ')+' (while Critical is open)':'Nudge me when it\'s time (while Critical is open)';$q('[data-k=nudge]').checked=S.dayNudge!==0}
 $q('[data-k=nudge]').onchange=function(){S.dayNudge=this.checked?1:0;save()};
 var NK='critical_day_nudge',lastNudge=0;
 function nudgeGet(){try{var o=JSON.parse(localStorage.getItem(NK)||'null');return o&&o.d===ymdN()?o:{d:ymdN(),s:{}}}catch(_){return {d:ymdN(),s:{}}}}
 function dayNudge(){var now=Date.now();if(now-lastNudge<15000)return;lastNudge=now;if(S.dayNudge===0||todayI()>4||ban)return;var R=sched().rows,m=nowMin(),o=nudgeGet();
  R.forEach(function(r,i){var k=r[2];if((k!=='plan'&&k!=='read')||o.s[k]||ban)return;var st=r[0];if(m<st||m>=st+30)return;
   if(k==='plan'){if(runGet()||hwGet()||firstLeft(todayI())<0||busy())return;o.s[k]=1;try{localStorage.setItem(NK,JSON.stringify(o))}catch(_){}
    var left=DAY(todayI()).filter(function(_,j){return !isDone(todayI(),j)}).reduce(function(a,b){return a+b[1]},0);
    var rv0=rvOn(todayI());showBan('<b>'+m12(r[0])+': time for today\'s '+(rv0?'revision':'plan')+'.</b> '+left+' minutes'+(rv0?' of revising for your test.':'.'),(rv0?[]:[['Just one question',function(){hideBan();ONE.start()}]]).concat([[rv0?'Start revision':'Start today\'s plan',function(){hideBan();startRun()}],['Homework first',function(){hideBan();startHw()}],['Later',hideBan]]))}
   else{o.s[k]=1;try{localStorage.setItem(NK,JSON.stringify(o))}catch(_){}var nx=R[i+1];var hb=[['Good night',hideBan]];if(HS().on.indexOf('scr')>=0)hb.unshift(['Phone\'s away ✓',function(){hset(dstr(new Date()),'scr',1);hideBan();if(sh.classList.contains('open'))paint()}]);showBan('<b>'+m12(r[0])+': '+esc(r[1]).replace(/^./,function(c){return c.toLowerCase()})+'.</b>'+(nx?' '+esc(nx[1])+' at '+m12(nx[0])+'.':'')+' Good night.',hb)}})}
 /* ----- habit tracker (school days) ----- */
 var HAB=[['hw','Homework on time','When I\'ve finished my snack, I sit at my desk and open my homework.','Just start the piece that\'s due soonest.'],
  ['plan','Today\'s plan','When the plan nudge pops up, I press Start straight away.','10 minutes of Fix my mistakes still counts.'],
  ['scr','Screens off at 9:30','When my 9:30 alarm goes, my phone goes on charge outside my room.','Phone face down across the room.'],
  ['read','Read in bed','When I get into bed, I read one chapter.','One page counts.'],
  ['slp','Lights off by 10','When I finish reading, lights go off. Tick it the next morning.','Lights off by 10:15 at the latest.']];
 function HS(){var h=S.habits;if(!h||typeof h!=='object')h=S.habits={};if(!Array.isArray(h.on)){h.on=['hw','scr'];h.since={};h.since.hw=h.since.scr=dstr(new Date())}if(!h.log||typeof h.log!=='object')h.log={};if(!h.since)h.since={};return h}
 function hName(id){for(var i=0;i<HAB.length;i++)if(HAB[i][0]===id)return HAB[i];return null}
 function isSchool(d){var g=d.getDay();return g>=1&&g<=5}
 function sDays(n,incToday){var out=[],d=new Date();d.setHours(12,0,0,0);if(!incToday)d.setDate(d.getDate()-1);var g=0;while(out.length<n&&g++<400){if(isSchool(d))out.unshift(dstr(d));d.setDate(d.getDate()-1)}return out}
 function hv(day,id){var l=HS().log[day];return l?l[id]||0:0}
 function hset(day,id,v){var h=HS();if(!h.log[day])h.log[day]={};if(v)h.log[day][id]=v;else delete h.log[day][id];if(!Object.keys(h.log[day]).length)delete h.log[day];if(h.since[id]&&day<h.since[id])h.since[id]=day;
  var keys=Object.keys(h.log).sort();while(keys.length>200)delete h.log[keys.shift()];save()}
 function streak(id){var h=HS(),td=dstr(new Date()),days=sDays(120,true),n=0;for(var i=days.length-1;i>=0;i--){var d=days[i];if(h.since[id]&&d<h.since[id])break;if(hv(d,id)){n++;continue}if(d===td)continue;break}return n}
 function kept(id){var h=HS(),n=0;for(var d in h.log)if(h.log[d][id]&&(!h.since[id]||d>=h.since[id]))n++;return n}
 function missedLast(id){var h=HS(),prev=sDays(1,false)[0];if(!prev||(h.since[id]&&prev<h.since[id]))return false;return !hv(prev,id)}
 /* ticks you change by hand are never overwritten by the automatic ones */
 function hman(day,id){var h=HS();if(!h.man||typeof h.man!=='object')h.man={};h.man[day+':'+id]=1;var ks=Object.keys(h.man).sort();while(ks.length>300)delete h.man[ks.shift()]}
 function isMan(day,id){var h=HS();return !!(h.man&&h.man[day+':'+id])}
 /* Today's plan: ½ for the 2-minute start, ✓ for the whole plan (or finished early) */
 function habAuto(){try{slpAuto()}catch(_){}if(todayI()>4)return;var h=HS();if(h.on.indexOf('plan')<0)return;var td=dstr(new Date()),t=todayI();if(isMan(td,'plan'))return;var cur=hv(td,'plan');
  if(firstLeft(t)<0){if(cur!==1)hset(td,'plan',1)}else if(qsOn(t)&&!cur)hset(td,'plan',2)}
 /* Lights off by 10: the latest screen use each night (from the iPhone shortcut, through Google sync, or using Critical after 10pm).
    Ticked the next morning: nothing after 10pm ✓, 10:00 to 10:15 ½, later than 10:15 not done. */
 var LATE_FROM=22*60,LATE_OK=22*60+15;
 function lateLog(){var h=HS();if(!h.late||typeof h.late!=='object')h.late={};return h.late}
 function lateAdd(d){if(!d||isNaN(d.getTime()))return false;var hh=d.getHours(),m=hh*60+d.getMinutes(),nd=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);if(hh<5){nd.setDate(nd.getDate()-1);m+=1440}if(m<LATE_FROM)return false;
  var L=lateLog(),k=dstr(nd);if(L[k]>=m)return false;L[k]=m;var ks=Object.keys(L).sort();while(ks.length>60)delete L[ks.shift()];save();return true}
 function slpAuto(){var h=HS();if(!h.autoSlp||!h.autoFrom)return;var now=new Date(),L=lateLog(),ch=false;
  sDays(10,false).forEach(function(d){if(d<h.autoFrom||isMan(d,'slp'))return;var end=new Date(d+'T12:00:00');end.setDate(end.getDate()+1);end.setHours(5,0,0,0);if(now<end)return;
   var t=L[d],v=!t?1:t<=LATE_OK?2:0;if(hv(d,'slp')!==v){hset(d,'slp',v);ch=true}});return ch}
 function fmtLate(m){var mm=m%1440;return m12(mm)}
 window.LATE_IN=function(files){try{var f=files&&files.late,t=f&&f.content;if(!t)return;var g=/(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})/.exec(String(t));if(!g)return;
  var d=new Date(+g[1],g[2]-1,+g[3],+g[4],+g[5]),h=HS();if(h.lastLateAt!==d.getTime()){h.lastLateAt=d.getTime();save()}if(!h.autoSlp)return;lateAdd(d);slpAuto();if(sh.classList.contains('open')&&view==='hab')paintHab()}catch(_){}};
 ['pointerdown','keydown'].forEach(function(ev){document.addEventListener(ev,function(){var n=new Date(),hh=n.getHours();if(hh<22&&hh>=5)return;if(Date.now()-(lateAdd.t||0)<60000)return;lateAdd.t=Date.now();try{if(HS().autoSlp)lateAdd(n)}catch(_){}},true)});
 function cyc(v){return v===0?1:v===1?2:0}
 function paintHab(){var h=HS(),t=todayI(),school=t<5,td=dstr(new Date()),L=$q('.plhl'),G=$q('[data-k=grid]'),K=$q('[data-k=pick]'),now=$q('[data-k=hnow]');habAuto();L.innerHTML='';
  var on=HAB.filter(function(x){return h.on.indexOf(x[0])>=0}),doneN=on.filter(function(x){return hv(td,x[0])}).length;
  now.innerHTML=!school?'<b>It\'s the weekend</b>Habits are for school days, so there\'s nothing to tick today. Your grid is below.':!on.length?'<b>Pick a habit to track</b>Start with one or two from the list below.':'<b>Today: '+doneN+' of '+on.length+' done</b>Tap once when you\'ve done it, twice if you did the bad-day version. Both keep your streak.';
  on.forEach(function(x){var id=x[0],v=school?hv(td,id):0,st=streak(id),kp=kept(id),e=document.createElement('div');e.className='plh1'+(v===1?' done':v===2?' half':'');
   e.innerHTML=(school?'<button class="plhk" type="button" aria-label="'+esc(x[1])+': '+(v===1?'done':v===2?'bad-day version':'not done yet')+'">'+(v===1?'✓':v===2?'½':'')+'</button>':'')+
    '<div class="plbody"><p class="plhn">'+esc(x[1])+((id==='plan'||(id==='slp'&&h.autoSlp))?' <span class="plauto-t">auto</span>':'')+'</p><p class="plht">'+esc(x[2])+'</p><p class="plht">Bad day? '+esc(x[3])+'</p>'+
    '<div class="plhs"><span>'+(st?'🔥 <b>'+st+'</b> school day'+(st===1?'':'s')+' in a row':'No streak yet')+'</span><span class="plhp" title="Days done: '+Math.min(kp,66)+' of about 66 until it feels automatic"><span class="plhbar"><i style="width:'+Math.min(100,kp/66*100)+'%"></i></span><span><b>'+Math.min(kp,66)+'</b>/66</span></span></div>'+
    (school&&!v&&missedLast(id)?'<p class="plhw">Missed last time. Don\'t miss two in a row.</p>':'')+'</div>';
   var kb=e.querySelector('.plhk');if(kb)kb.onclick=function(){hman(td,id);hset(td,id,cyc(hv(td,id)));paintHab();paintPill()};L.appendChild(e)});
  /* what ticks itself, and the iPhone shortcut for Lights off by 10 */
  var cfg=null;try{cfg=SYNC.cfg()}catch(_){}var gsOn=!!(cfg&&cfg.via==='gs'&&cfg.url&&cfg.key),ab=document.createElement('div');ab.className='plauto';
  var ll=h.lastLateAt?new Date(h.lastLateAt):null,lt=ll?'Last late phone use from your iPhone: '+ll.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+', '+m12(ll.getHours()*60+ll.getMinutes())+'.':'Nothing from your iPhone yet. After setting up the shortcut, open one of the apps after 10pm and it\'ll show here after the next sync.';
  ab.innerHTML='<p class="plgt">Ticks itself</p><p class="plnote"><b>Today\'s plan</b>: ½ when you do the 2-minute start, ✓ when the whole plan is done.</p>'+
   '<label class="plopt"><input type="checkbox" data-k="aslp"'+(h.autoSlp?' checked':'')+'> <span><b>Lights off by 10</b>, from your iPhone: ✓ if you\'re off by 10pm, ½ if it\'s 10:00 to 10:15, not done if later. Ticks itself the next morning. Using Critical after 10pm counts too.</span></label>'+
   (h.autoSlp?'<p class="plnote">'+lt+'</p>':'')+
   '<details class="plsetup"'+(h.autoSlp&&!h.lastLateAt?' open':'')+'><summary>Set up the iPhone shortcut</summary>'+(gsOn?
    '<ol class="plsteps"><li>On your iPhone open <b>Shortcuts</b>, then <b>Automation</b>, then <b>+</b>, then <b>App</b>.</li>'+
    '<li>Choose the apps you use at night (TikTok, YouTube, Instagram, Snapchat…), tick <b>Is Opened</b>, choose <b>Run Immediately</b>, then <b>Next</b> and <b>New Blank Automation</b>.</li>'+
    '<li>Add <b>Format Date</b>: Date <b>Current Date</b>, Date Format <b>Custom</b>, Format String <code>H</code>. (That\'s the hour.)</li>'+
    '<li>Add <b>If</b>: tap the first box, pick that <b>Formatted Date</b> and set its type to <b>Number</b>, then <b>is greater than or equal to</b> <code>22</code>. Tap <b>Add Condition</b>, choose <b>Any</b>, and add Formatted Date <b>is less than</b> <code>5</code>.</li>'+
    '<li>Inside the If, add <b>Format Date</b> again: <b>Current Date</b>, Date Format <b>ISO 8601</b>, with <b>Include ISO 8601 Time</b> on.</li>'+
    '<li>Under it add <b>Get Contents of URL</b>. Paste the address below as the URL, tap <b>Show More</b>, set Method <b>POST</b> and Request Body <b>JSON</b>. Add a <b>Text</b> field called <code>k</code> with the key below. Add a <b>Dictionary</b> field called <code>put</code>, and inside it a <b>Text</b> field called <code>late</code> set to the second <b>Formatted Date</b>.</li>'+
    '<li>Tap <b>Done</b>. From now on, opening those apps after 10pm quietly tells Critical. Nothing pops up.</li></ol>'+
    '<div class="plcopy"><label>Address<input readonly data-cv="url"></label><button type="button" class="plgo alt" data-cp="url">Copy</button></div><div class="plcopy"><label>Key<input readonly data-cv="key"></label><button type="button" class="plgo alt" data-cp="key">Copy</button></div>'+
    '<p class="plnote">The address and key are your own sync\'s: anyone with them could write to it, so don\'t share them.</p>'
    :'<p class="plnote">This needs Google sync, so the shortcut has somewhere to send the time. Turn it on in Progress, Settings, Sync between devices, then come back here.</p>')+'</details>'+
   '<p class="plnote">Homework, screens off and reading: tick them yourself. Anything you change by hand stays as you set it.</p>';
  L.appendChild(ab);
  var cb=ab.querySelector('[data-k=aslp]');cb.onchange=function(){var hh=HS();hh.autoSlp=cb.checked?1:0;if(cb.checked)hh.autoFrom=dstr(new Date());save();paintHab()};
  if(gsOn){ab.querySelector('[data-cv=url]').value=cfg.url;ab.querySelector('[data-cv=key]').value=cfg.key;
   [].forEach.call(ab.querySelectorAll('[data-cp]'),function(b){b.onclick=function(){var v=b.dataset.cp==='url'?cfg.url:cfg.key,inp=ab.querySelector('[data-cv='+b.dataset.cp+']');
    var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)};try{navigator.clipboard.writeText(v).then(done,function(){inp.select();document.execCommand('copy');done()})}catch(_){inp.select();try{document.execCommand('copy')}catch(__){}done()}}})}
  /* last 3 weeks grid */
  var days=sDays(15,true);if(!isSchool(new Date())){}var gh='';
  if(on.length){var cols='minmax(70px,1.6fr) repeat('+days.length+',minmax(0,1fr))';
   gh='<p class="plgt">Last 3 school weeks</p><div class="plgr" style="grid-template-columns:'+cols+'"><span></span>'+days.map(function(d){var dt=new Date(d+'T12:00:00');return '<span>'+'SMTWTFS'[dt.getDay()]+'</span>'}).join('')+'</div>';
   on.forEach(function(x){var id=x[0];gh+='<div class="plgr" style="grid-template-columns:'+cols+'"><span class="gl" title="'+esc(x[1])+'">'+esc(x[1])+'</span>'+days.map(function(d){var v=hv(d,id),pre=h.since[id]&&d<h.since[id],cls='plgc'+(v===1?' d1':v===2?' d2':pre?' pre':d<td?' miss':'')+(d===td?' td':'');
    var dt=new Date(d+'T12:00:00');return '<button type="button" class="'+cls+'" data-h="'+id+'" data-d="'+d+'" aria-label="'+esc(x[1])+', '+dt.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+': '+(v===1?'done':v===2?'bad-day version':'not ticked')+'"></button>'}).join('')+'</div>'});
   gh+='<p class="plht" style="margin-top:6px">Tap a square to fix a day you forgot to tick.</p>'}
  G.innerHTML=gh;[].forEach.call(G.querySelectorAll('.plgc'),function(c){c.onclick=function(){var d=c.dataset.d,id=c.dataset.h;hman(d,id);hset(d,id,cyc(hv(d,id)));paintHab()}});
  /* choose habits */
  K.innerHTML='<p class="plgt">What to track</p>';
  HAB.forEach(function(x){var lab=document.createElement('label');lab.className='plpk';lab.innerHTML='<input type="checkbox"'+(h.on.indexOf(x[0])>=0?' checked':'')+'> '+esc(x[1]);var cb=lab.querySelector('input');
   cb.onchange=function(){var hh=HS(),i=hh.on.indexOf(x[0]);if(cb.checked&&i<0){hh.on.push(x[0]);hh.on.sort(function(a,b){return HAB.findIndex(function(y){return y[0]===a})-HAB.findIndex(function(y){return y[0]===b})});if(!hh.since[x[0]])hh.since[x[0]]=dstr(new Date())}else if(!cb.checked&&i>=0)hh.on.splice(i,1);save();paintHab()};K.appendChild(lab)});
  var young=on.filter(function(x){return kept(x[0])<10}).length;var nt=document.createElement('p');nt.className='plnote';nt.textContent=on.length>2&&young>2?'That\'s a lot of new habits at once. Two at a time is easier: add the next when these feel normal.':'Start with two. Add another once these feel normal, usually after a few weeks.';K.appendChild(nt)}
 function paint(){var p=PS(),t=todayI(),m=0;
  [].forEach.call(sh.querySelectorAll('.plseg button'),function(b){var on=b.dataset.v===view;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  $q('.plmain').hidden=view!=='plan';$q('.pldv').hidden=view!=='day';$q('.plhb').hidden=view!=='hab';$q('.pltv').hidden=view!=='tst';$q('.plhd b').textContent=view==='day'?'Your school day':view==='hab'?'Your habits':view==='tst'?'Your tests':'This week\'s plan';if(view==='day'){paintDay();return}if(view==='hab'){paintHab();return}if(view==='tst'){REV.paintTab($q('.pltv'),paint);return}$q('.plsm').hidden=view!=='smt';if(view==='smt'){paintSmart();return}
  DG.forEach(function(_,i){DAY(i).forEach(function(b,j){if(isDone(i,j))m+=b[1]})});
  var TT=TOT();$q('[data-k=wk]').textContent=m+' / '+TT+' min';$q('[data-k=bar]').style.width=Math.min(100,m/TT*100)+'%';
  [].forEach.call(days.children,function(b,i){var rv=rvOn(i);b.className=(i===cur?'on':'')+(i===t?' td':'')+(dayDone(i)?' full':qsOn(i)?' quick':'')+(rv?' rv':'');b.title=(dayDone(i)?'Plan done':qsOn(i)?'2-minute start done: this day counts':'')+(rv?(dayDone(i)||qsOn(i)?' · ':'')+'Revision day':'');b.setAttribute('aria-selected',i===cur)});
  $q('[data-k=dn]').textContent=(cur===t?'Today, ':'')+DAYS[cur];$q('[data-k=dt]').textContent=allMins(cur)+' min · '+(rvOn(cur)?'revision day':OTH(cur)?'others day':freeDay()===cur?'free choice':cur<5?(extOn(cur)?'school day, stretched to 45':'school day'):'weekend');
  var tn=$q('[data-k=tnext]'),bh='';try{bh=REV.banner()}catch(_){}tn.hidden=!bh;tn.innerHTML=bh;if(bh){var tb=document.createElement('button');tb.type='button';tb.className='plgo alt';tb.textContent='Tests';tb.onclick=function(){setView('tst')};tn.appendChild(tb)}
  var L=$q('.plblks');L.innerHTML='';var pn=DAY(cur).some(isFix)||(cur===1&&t===0)?pile():0;
  if(cur===1&&t===0&&!p.monClr&&pn>0){var nt=document.createElement('p');nt.className='plnote plcarry';nt.textContent='If Monday\'s Fix my mistakes isn\'t finished, the first 15 minutes of study here go to it (then a 7-minute Calculus slot).';L.appendChild(nt)}
  DAY(cur).forEach(function(b,j){var dn=isDone(cur,j),e=document.createElement('div');e.className='plblk'+(dn?' done':'');
   e.innerHTML='<button class="pltick" type="button" role="checkbox" aria-checked="'+dn+'" aria-label="'+esc(b[0])+' done">'+(dn?'✓':'')+'</button><div class="plbody"><p class="plt"><span>'+esc(b[0])+'</span><span class="plm">'+b[1]+' min</span></p><p class="plh">'+esc(b[2])+(isFix(b)?' <b class="plfixn">'+(pn?pn+' to fix right now.':'Nothing to fix right now.')+'</b>':'')+'</p><div class="placts"></div></div>';
   e.querySelector('.pltick').onclick=function(){var k=cur+'-'+j;if(PS().t[k])delete PS().t[k];else{pinRv(cur);PS().t[k]=1;if(b[5]==='rev')try{REV.doneDay(b[6].pin)}catch(_){}}save();var r=runGet();if(r&&PS().t[k]&&r.day===cur&&r.j===j){r.ends=Date.now();r.early=1;runSet(r);loop()}paint();paintPill()};
   var A=e.querySelector('.placts');
   b[3].forEach(function(a,ai){var x;if(a[1]==='url'){x=document.createElement('a');x.href=a[2];x.target='_blank';x.rel='noopener'}else{x=document.createElement('button');x.type='button'}
    x.className='plgo'+(ai?' alt':'');x.innerHTML=esc(a[0])+(a[1]==='url'?' ↗':' →');x.onclick=function(){go(a,b[0])};A.appendChild(x)});
   if(!b[3].length)A.remove();
   if(b[4]){var tp=document.createElement('div');tp.className='pltop';tp.innerHTML='<label for="plTopics">Topics to fix</label><textarea id="plTopics" maxlength="600" placeholder="e.g. Circle theorems, iteration, vectors"></textarea>';
    var ta=tp.querySelector('textarea');ta.value=p.topics;ta.oninput=function(){PS().topics=ta.value;save()};e.querySelector('.plbody').appendChild(tp)}
   L.appendChild(e)});
  if(pathCode()>0&&cur===t)L.appendChild(pathCard());
  L.appendChild(planExtras(cur));
  if(smOn()&&cur===t&&!OTH(cur)){var tn2=document.createElement('div');tn2.className='plblk smnight';tn2.innerHTML='<div class="smmoon" aria-hidden="true">🌙</div><div class="plbody"><p class="plt"><span>Tonight, in bed</span><span class="plm">5 min</span></p><p class="plh">Bedtime review: a recap of today and new questions like the ones you got wrong. Then phone away and sleep, because sleep is when it sticks.</p><div class="placts"><button class="plgo alt" type="button" data-a="bed">Bedtime review →</button><button class="plgo alt" type="button" data-a="why">Why the breaks?</button></div></div>';
   tn2.querySelector('[data-a=bed]').onclick=function(){close();try{bedOpen()}catch(_){}};tn2.querySelector('[data-a=why]').onclick=function(){setView('smt')};L.appendChild(tn2)}
  $q('[data-k=done]').hidden=!(cur===t&&dayDone(t))||feOn(t);$q('[data-k=auto]').checked=!!p.auto;paintRun()}
 function paintRun(){var R=$q('[data-k=run]'),t=todayI(),r=runGet();R.innerHTML='';if(cur!==t)return;
  var hw=hwGet();if(!r&&hw&&!hw.done){var lf=hw.end-Date.now();R.innerHTML='<p>Homework first</p><b data-k="hwt">'+(lf>0?fmtLeft(lf)+' left for Critical':'Critical time used up')+'</b><p>Started at '+hhmm(hw.at)+'. When you\'ve finished, press Homework done and Critical gets whatever\'s left until '+hhmm(hw.end)+', with each part shortened to fit.</p><div class="placts"></div>';
   var A0=R.querySelector('.placts'),d1=document.createElement('button');d1.type='button';d1.className='plgo';d1.textContent='Homework done → Critical';d1.onclick=hwDone;A0.appendChild(d1);
   var d3=document.createElement('button');d3.type='button';d3.className='plgo alt';d3.textContent='Homework timer';d3.onclick=function(){location.href='homework.html'};A0.appendChild(d3);
   var d2=document.createElement('button');d2.type='button';d2.className='plgo alt';d2.textContent='Cancel';d2.onclick=function(){hwSet(null);paintPill();paint();setTimeout(function(){try{focusSend(true)}catch(_){}},50)};A0.appendChild(d2);return}
  if(r){var b=DAY(r.day)[r.j]||WEEK()[r.day][r.j],left=r.ends-Date.now();var isRv=b[5]==='rev';R.innerHTML='<p>'+(isRv?'Revision day: timer running':'Today\'s plan is running')+'</p><b>'+esc(r.t||b[0])+' · '+(left>0?fmtLeft(left)+' left':'time\'s up')+'</b><p>'+(isRv?'Do practice rounds on today\'s topics until the time\'s up. If you\'re in the middle of a round, you can finish it first.':'When the time is up you\'ll move to the next part. If you\'re in the middle of a lesson, you can finish it first. Done at least 1 lesson and not up for more? Press Finished early.')+'</p><div class="placts"></div>';
   var A=R.querySelector('.placts'),x1=document.createElement('button');x1.type='button';x1.className='plgo';x1.textContent=isRv?'Open revision →':'Go to it →';x1.onclick=function(){var a=b[3][0];if(a)go(a,b[0],true);else close()};if(b[3].length)A.appendChild(x1);
   var x2=document.createElement('button');x2.type='button';x2.className='plgo alt';x2.textContent='Next part now';x2.onclick=function(){var rr=runGet();if(rr){rr.ends=Date.now();runSet(rr);loop();paint()}};if(!isRv)A.appendChild(x2);
   var x4=document.createElement('button');x4.type='button';x4.className='plgo alt';x4.textContent='Finished early';x4.onclick=function(){finishEarly()};if(!isRv)A.appendChild(x4);
   var x3=document.createElement('button');x3.type='button';x3.className='plgo alt';x3.textContent='Stop the plan';x3.onclick=function(){stopRun(false)};A.appendChild(x3);return}
  var j=firstLeft(t);if(j<0){if(feOn(t)){var fz0=PS().fe[t],fn=fz0.n||1;R.innerHTML='<p>Finished early today ✓</p><b>'+fn+' lesson'+(fn===1?'':'s')+' done</b><p>Today\'s plan is finished. Changed your mind? You can carry on with it.</p><div class="placts"></div>';
   var uu=document.createElement('button');uu.type='button';uu.className='plgo alt';uu.textContent='Undo: carry on with the plan';uu.onclick=undoEarly;R.querySelector('.placts').appendChild(uu)}return}
  var bb=document.createElement('button');bb.type='button';bb.className='plbig';var rvT=rvOn(t);bb.textContent=(rvT?'Start revision':DAY(t).some(function(_,k){return isDone(t,k)})?'Carry on with today\'s plan':'Start today\'s plan')+' ('+DAY(t).slice(j).filter(function(_,k){return !isDone(t,j+k)}).reduce(function(s2,x){return s2+x[1]},0)+' min)';
  bb.onclick=function(){startRun()};R.appendChild(bb);
  var o1=document.createElement('button');o1.type='button';o1.className='plgo alt';o1.textContent='Just one question';o1.onclick=function(){close();ONE.start()};
  var hf=document.createElement('button');hf.type='button';hf.className='plgo alt';hf.textContent='Homework first';hf.onclick=startHw;var hr=document.createElement('div');hr.className='placts';if(!rvT)hr.appendChild(o1);hr.appendChild(hf);if(lessonsN()>=1&&!rvT){var fe1=document.createElement('button');fe1.type='button';fe1.className='plgo alt';fe1.textContent='Finished early';fe1.onclick=function(){finishEarly()};hr.appendChild(fe1)}R.appendChild(hr);
  if(!focusOk&&/Windows|Macintosh|CrOS|Linux x86/.test(navigator.userAgent)&&!/Mobile|Android/.test(navigator.userAgent)&&window.chrome){var fg=document.createElement('p');fg.className='plnote';fg.innerHTML='Strict mode: <a href="https://u23bodwells-cmyk.github.io/Critical/reminders/critical-focus.zip" target="_blank" rel="noopener">get the Critical Focus extension for Chrome</a>. It closes TikTok at plan time and keeps Critical on screen until you\'re done.';R.appendChild(fg)}
  if(focusOk){var fz=document.createElement('p');fz.className='plnote';fz.textContent=focusOk.locked?'Critical Focus is locked on: TikTok is blocked and Critical stays on screen until today\'s plan is done.':'Critical Focus is on: from plan time, TikTok is closed and blocked until today\'s plan is done.';R.appendChild(fz)}
  var n=document.createElement('p');n.className='plnote';n.textContent=hw&&hw.done&&!hw.alloc?'Homework used up today\'s Critical time. You can still start it if you want to.':'It times each part and moves you on when it\'s time. Got homework that\'s running over? Press Homework first: Critical gets whatever time is left when you\'ve finished.';R.appendChild(n)}
 /* ----- homework first: homework uses the plan's time until it's finished, then Critical gets what's left ----- */
 var HWK='critical_plan_hw';
 function hwGet(){try{var o=JSON.parse(localStorage.getItem(HWK)||'null');return o&&o.d===ymdN()?o:null}catch(_){return null}}
 function hwSet(o){try{if(o)localStorage.setItem(HWK,JSON.stringify(o));else localStorage.removeItem(HWK)}catch(_){}}
 function hwOn(){var h=hwGet();return !!(h&&!h.done)}
 function leftMins(t){return DAY(t).filter(function(_,j){return !isDone(t,j)}).reduce(function(a,b){return a+b[1]},0)}
 function hhmm(ms){var d=new Date(ms),h=d.getHours(),m=d.getMinutes();return (h%12||12)+':'+(m<10?'0':'')+m+(h>=12?'pm':'am')}
 function startHw(){var t=todayI();if(runGet()||firstLeft(t)<0)return;pinRv(t);var L=leftMins(t),now=Date.now();hwSet({d:ymdN(),at:now,end:now+L*60000,mins:L});setTimeout(function(){try{focusSend(true)}catch(_){}},50);warned={};hideBan();paintPill();
  if(sh.classList.contains('open')){cur=t;view='plan';paint()}else showBan('<b>Homework first.</b> When you\'ve finished, tap the calendar button and press Homework done. Critical gets whatever\'s left until '+hhmm(now+L*60000)+'.',[['Open homework timer',function(){hideBan();location.href='homework.html'}],['OK',hideBan]])}
 function hwDone(){var h=hwGet(),t=todayI();if(!h||h.done)return;setTimeout(function(){try{focusSend(true)}catch(_){}},80);var rem=Math.floor((h.end-Date.now())/60000);h.done=Date.now();
  var idx=DAY(t).map(function(_,j){return j}).filter(function(j){return !isDone(t,j)});
  if(rem<5||!idx.length){h.alloc=null;hwSet(h);paintPill();if(sh.classList.contains('open'))paint();showBan('<b>No time left for Critical today.</b> That\'s fine: homework comes first. Pick it up tomorrow.',[['OK',hideBan]]);return}
  var tot=idx.reduce(function(a,j){return a+DAY(t)[j][1]},0),f=Math.min(1,rem/tot),alloc={},acc=0;
  idx.forEach(function(j){var m=Math.round(DAY(t)[j][1]*f);if(m>=5){alloc[j]=m;acc+=m}});
  var ks=Object.keys(alloc);if(!ks.length){alloc[idx[0]]=Math.min(rem,DAY(t)[idx[0]][1]);ks=[String(idx[0])]}else if(f<1)alloc[ks[0]]=Math.max(5,alloc[ks[0]]+rem-acc);
  h.alloc=alloc;hwSet(h);var go2=function(){if(typeof STUDY!=='undefined'&&STUDY.start)STUDY.start('Weekly plan · '+DAYS[t]);begin(t,+ks[0],true)};if(!rvOn(t)&&typeof SHIFT!=='undefined'&&SHIFT.brief(go2))return;go2()}
 function hwNext(day,j){var h=hwGet();if(!h||!h.alloc||day!==todayI())return firstLeft(day,j);var ks=Object.keys(h.alloc).map(Number).sort(function(a,b){return a-b});for(var i=0;i<ks.length;i++)if(ks[i]>j&&!isDone(day,ks[i]))return ks[i];return -1}
 /* ----- Critical Focus (Chrome extension): tell it today's plan time and when the plan is done ----- */
 var FOCUS_ID='dofdocaillphcjghjdjodhippjldkibo',focusOk=null,lastFocus=0,GUARD_ID='ophdjhoiolnmepbdhbdjgcgnfpdogfnp';
 function focusStatus(){var t=todayI(),school=t<5,SC=sched(),R=SC.rows,pr=R.filter(function(r){return r[2]==='plan'})[0],rd=R.filter(function(r){return r[2]==='read'})[0],base=new Date();base.setHours(0,0,0,0);
  var hw=hwGet(),done=firstLeft(t)<0||!!(hw&&hw.done&&!hw.alloc)||!!(hw&&hw.alloc&&Object.keys(hw.alloc).every(function(j){return isDone(t,+j)}))||(school&&!pr)||qsOn(t)||!!OTH(t);
  return {type:'status',due:school&&pr?base.getTime()+pr[0]*60000:null,end:rd?base.getTime()+rd[0]*60000:null,done:done,hw:hwOn(),running:!!runGet(),lessons:lessonsN(),early:feOn(t)}}
 function focusSend(force){var now=Date.now();if(!force&&now-lastFocus<30000)return;lastFocus=now;
  /* Critical Browser (the desktop app) gets the same status, plus how much of today's plan is left */
  try{if(window.criticalBrowser&&criticalBrowser.status){var cs=focusStatus(),ct=todayI();cs.left=DAY(ct).filter(function(b,j){return !isDone(ct,j)}).length;cs.mins=restMins(ct);
   try{cs.sync=!!(SYNC.cfg&&SYNC.cfg())}catch(_){cs.sync=false}cs.locked=document.documentElement.classList.contains('cglock');criticalBrowser.status(cs);
   /* inside Critical Browser the page never goes "hidden" when you switch tabs, so it wouldn't notice progress you made in Chrome.
      Let the browser ask for a fresh check, and also check by ourselves every 3 minutes until the plan's done. */
   if(!focusSend.cb){focusSend.cb=1;
    var fresh=function(){if(focusStatus().done)return;var p=null;try{p=SYNC.sync(true)}catch(_){}Promise.resolve(p).then(function(){setTimeout(function(){focusSend(true)},300)},function(){focusSend(true)})};
    try{if(criticalBrowser.onRefresh)criticalBrowser.onRefresh(fresh)}catch(_){}
    setInterval(fresh,180000)}}}catch(_){}
  /* Critical Guard (the Chrome extension that closes TikTok until today's plan is done) gets the status too */
  try{if(window.chrome&&chrome.runtime&&chrome.runtime.sendMessage){var gs=focusStatus(),gt=todayI();gs.left=DAY(gt).filter(function(b,j){return !isDone(gt,j)}).length;chrome.runtime.sendMessage(GUARD_ID,gs,function(){try{void chrome.runtime.lastError}catch(_){}});
   if(!focusSend.gd){focusSend.gd=1;setTimeout(function(){try{focusSend(true)}catch(_){}},9000);document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(function(){try{focusSend(true)}catch(_){}},1200)})}}}catch(_){}
  try{if(!(window.chrome&&chrome.runtime&&chrome.runtime.sendMessage))return;chrome.runtime.sendMessage(FOCUS_ID,focusStatus(),function(r){try{void chrome.runtime.lastError}catch(_){}var was=!!focusOk;focusOk=r&&r.ok?r:null;if(r&&r.ok&&r.early){var tt=todayI();if(!feOn(tt)&&firstLeft(tt)>=0&&lessonsN()>=1)applyEarly(lessonsN(),true)}if(was!==!!focusOk&&sh.classList.contains('open'))paint()})}catch(_){}}
 /* ----- finished early: end today's plan once you've done at least 1 lesson ----- */
 function lessonsN(){try{return lessonsToday()}catch(_){return 0}}
 function restMins(t){var r=runGet(),m=0;DAY(t).forEach(function(b,j){if(isDone(t,j))return;if(r&&r.day===t&&r.j===j)m+=Math.max(0,Math.ceil((r.ends-Date.now())/60000));else m+=b[1]});return m}
 function doLesson(){var r=runGet();if(r){var b=DAY(r.day)[r.j];if(b&&b[3][0]){go(b[3][0],b[0],true);return}}if(firstLeft(todayI())>=0)startRun()}
 function finishEarly(ok){var t=todayI();if(feOn(t)||firstLeft(t)<0)return;var n=lessonsN();close();
  if(n<1){showBan('<b>Do at least 1 lesson first.</b> Then you can finish early. A lesson or test in Critical, a Fix my mistakes round, a Shift Ready session or an Aptitude Gym set all count.',[['Do one now',function(){hideBan();doLesson()}],['OK',hideBan]]);return}
  if(!ok){var lm=restMins(t);showBan('<b>Finish today\'s plan early?</b> You\'ve done '+n+' lesson'+(n===1?'':'s')+' today, so you can stop here.'+(lm?' The rest of today\'s plan ('+lm+' min) will be skipped.':''),[['Yes, finish early',function(){hideBan();applyEarly(n,false)}],['Keep going',hideBan]]);return}
  applyEarly(n,false)}
 function applyEarly(n,fromFocus){var t=todayI(),p=PS();if(!p.fe)p.fe={};p.fe[t]={n:n,at:Date.now()};save();
  try{habAuto()}catch(_){}runClear();try{var h=hwGet();if(h&&!h.done){h.done=Date.now();h.alloc=null;hwSet(h)}}catch(_){}
  if(typeof STUDY!=='undefined'&&STUDY.stop)STUDY.stop();setTimeout(function(){try{focusSend(true)}catch(_){}},50);paintPill();if(sh.classList.contains('open'))paint();
  showBan('<b>Finished early for today ✓</b> '+(fromFocus?'You pressed Finished early in Critical Focus. ':'')+n+' lesson'+(n===1?'':'s')+' done.'+(focusOk||fromFocus?' TikTok is unblocked.':'')+' See you tomorrow.',[['Close',hideBan],['Undo',function(){hideBan();undoEarly()}]])}
 function undoEarly(){var t=todayI(),p=PS();if(p.fe){delete p.fe[t];save()}
  try{if(window.chrome&&chrome.runtime&&chrome.runtime.sendMessage)chrome.runtime.sendMessage(FOCUS_ID,{type:'unearly'},function(){try{void chrome.runtime.lastError}catch(_){}})}catch(_){}
  setTimeout(function(){try{focusSend(true)}catch(_){}},300);paintPill();if(sh.classList.contains('open'))paint()}
 function afterLesson(){setTimeout(function(){try{focusSend(true)}catch(_){}},50);if(rvOn(todayI()))return;
  var r=runGet(),b=document.getElementById('pBody'),ds=b&&b.querySelector('.done-screen');if(!r||!ds||feOn(todayI())||ds.querySelector('.plearly'))return;
  var left=r.ends-Date.now(),d=document.createElement('div');d.className='dblock plearly';d.style.textAlign='center';
  d.innerHTML='<p class="note" style="margin:0 0 8px">Today\'s plan: <b>'+esc(r.t)+'</b>'+(left>0?', '+fmtLeft(left)+' left on this part.':'.')+' Not up for any more today?</p><button type="button" class="wbtn">Finished early: that\'s enough for today</button>';
  d.querySelector('button').onclick=function(){if(typeof closePlayer==='function')closePlayer();finishEarly()};var an=ds.querySelector('.dblock');if(an)ds.insertBefore(d,an);else ds.appendChild(d)}
 function startRun(go){var t=todayI(),j=firstLeft(t);if(j<0)return;if(go!==true&&!rvOn(t)&&typeof SHIFT!=='undefined'&&SHIFT.brief(function(){startRun(true)}))return;
  try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(_){}
  if(typeof STUDY!=='undefined'&&STUDY.start)STUDY.start('Weekly plan · '+DAYS[t]);begin(t,j,true)}
 function begin(day,j,gesture){pinRv(day);var b=DAY(day)[j],hh=hwGet(),mn=(hh&&hh.alloc&&hh.alloc[j]!=null&&day===todayI())?hh.alloc[j]:b[1];runSet({d:ymdN(),day:day,j:j,t:b[0],ends:Date.now()+mn*60000,mins:mn});warned={};hideBan();paintPill();
  var a=b[3][0];if(!a){cur=day;paint();sh.classList.add('open');return}
  if(a[1]==='url'&&!gesture){cur=day;paint();sh.classList.add('open');return}
  go(a,b[0],true);if(sh.classList.contains('open'))paint()}
 function stopRun(done){if(done)try{habAuto()}catch(_){}runClear();setTimeout(function(){try{focusSend(true)}catch(_){}},50);hideBan();if(typeof STUDY!=='undefined'&&STUDY.stop)STUDY.stop();paintPill();if(sh.classList.contains('open'))paint();if(done){var hz=hwGet();showBan(hz&&hz.alloc&&firstLeft(todayI())>=0?'<b>That\'s all your Critical time for today.</b> Homework came first, and you still got some done. Nice work.':'<b>That\'s today\'s plan done.</b> Your study time has been saved. Nice work.',[['Close',hideBan]])}}
 function hideBan(){if(ban){ban.remove();ban=null}clearInterval(banT);banT=null}
 function showBan(html,btns,auto){hideBan();ban=document.createElement('div');ban.className='plban';ban.setAttribute('role','status');ban.innerHTML='<p>'+html+'</p><div class="placts"></div>';var A=ban.querySelector('.placts');
  btns.forEach(function(x,i){var b=document.createElement('button');b.type='button';b.className='plgo'+(i?' alt':'');b.textContent=x[0];b.onclick=x[1];A.appendChild(b)});document.body.appendChild(ban);
  if(auto){var n=auto[0],cd=ban.querySelector('.plcd');banT=setInterval(function(){n--;if(cd)cd.textContent=n;if(n<=0){clearInterval(banT);banT=null;auto[1]()}},1000)}}
 function timeUp(r){var k=r.day+'-'+r.j;if(!PS().t[k]){pinRv(r.day);var ob0=DAY(r.day)[r.j];PS().t[k]=1;if(ob0&&ob0[5]==='rev')try{REV.doneDay(ob0[6].pin)}catch(_){}save();if(sh.classList.contains('open'))paint()}
  var nj=hwNext(r.day,r.j);if(nj<0){stopRun(true);return}
  var hx=hwGet(),ob=DAY(r.day)[r.j],left0=isFix(ob)&&!r.clr&&!r.gm?pile():0,nb=DAY(r.day)[nj],na=nb[3][0],ext=na&&na[1]==='url',title=(r.clr?'<b>Your mistakes pile is empty.</b> ':r.early?'':'Time\'s up for '+esc(r.t)+'. '+(left0&&r.day===0?left0+' left, so they\'ll come first on Tuesday. ':''))+'Next: <b>'+esc(nb[0])+'</b> ('+(hx&&hx.alloc&&hx.alloc[nj]!=null?hx.alloc[nj]:nb[1])+' min).';
  if(document.hidden&&!warned.n){warned.n=1;try{if('Notification' in window&&Notification.permission==='granted')new Notification('Time for '+nb[0],{body:'Come back to Critical for the next part of your plan.',tag:'critical-plan'})}catch(_){}}
  var goNext=function(){hideBan();begin(r.day,nj,true)};
  if(nb[5]==='clash'&&r.day<5&&r.day===todayI()&&!(hx&&hx.alloc)&&!extAsked(r.day)){var mm=mainOf(CORE(r.day))[0];
   showBan((r.clr?'<b>Your mistakes pile is empty.</b> ':'')+'<b>That\'s the study part of today\'s plan done.</b> Enjoying it? You can keep going to 45 minutes: 10 more minutes of '+esc(mm)+', then 10 minutes of Critical Clash instead of 5.',[['Yes, keep going',function(){setExt(r.day,1);hideBan();begin(r.day,nj,true)}],['No, play Clash now',function(){setExt(r.day,0);hideBan();begin(r.day,nj,true)}]]);return}
  if(ext)showBan(title,[['Open '+na[0]+' ↗',goNext],['5 more minutes',more]]);
  else showBan(title+' Moving you in <span class="plcd">10</span> s.',[['Go now',goNext],['5 more minutes',more]],[10,function(){hideBan();begin(r.day,nj,false)}])}
 function more(){var r=runGet();if(r){var k=r.day+'-'+r.j;delete PS().t[k];save();r.ends=Date.now()+5*60000;r.early=0;runSet(r)}upKey=null;hideBan();paintPill();if(sh.classList.contains('open'))paint()}
 function warmChk(r){if(!r||r.ends<=Date.now()||!warmP)return;var b=DAY(r.day)[r.j];if(!b||b[5]!=='warm')return;if(typeof P!=='undefined'&&P===warmP&&P.finished){warmP=null;r.ends=Date.now();r.early=1;runSet(r)}}
 var lastChk=0;
 function fixChk(r){var now=Date.now();if(now-lastChk<3000)return;lastChk=now;var p=PS(),n=-1;
  if(todayI()===0&&!p.monClr){n=pile();if(n===0){p.monClr=1;save()}}
  if(!r||r.gm||r.ends<=now)return;var b=DAY(r.day)[r.j];if(!isFix(b)||busy())return;if(n<0)n=pile();
  if(n===0){if(r.day===0){p.monClr=1;save()}r.ends=now;r.early=1;r.clr=1;runSet(r);return}
  if(typeof P!=='undefined'&&P&&P.finished&&P.mode==='review'&&!P._plAsk&&!ban){P._plAsk=1;showBan('<b>'+n+' mistake'+(n===1?'':'s')+' left to fix.</b> '+fmtLeft(r.ends-now)+' to go on this part.',[['Next round →',function(){hideBan();go(b[3][0],b[0])}],['Not now',hideBan]])}}
 function highChk(r,left){if(r.high||left>5*60000||ban||busy())return;var hk=(DAY(r.day)[r.j]||[])[5];if(hk==='clash'||hk==='rev'||hk==='brk')return;var nq=hwNext(r.day,r.j);if(nq>=0&&!((DAY(r.day)[nq]||[])[5]==='brk'&&hwNext(r.day,nq)<0))return;var mn=r.mins||(DAY(r.day)[r.j]||[0,0])[1];if(mn<10)return;r.high=1;runSet(r);
  var lapOk=typeof HIGH!=='undefined'&&HIGH.canLap();
  showBan('<b>Last 5 minutes: end on a high.</b> Finish today with something fun.',(lapOk?[['Victory lap',function(){hideBan();HIGH.lap()}]]:[]).concat([['Control room',function(){hideBan();if(document.querySelector('#player.open')&&typeof closePlayer==='function')closePlayer();close();showPage('sim')}],['Keep going',hideBan]]))}
 var lastDayPaint=-1;
 function hwTick(){var h=hwGet();if(!h||h.done)return;var lf=h.end-Date.now();var el=$q('[data-k=hwt]');if(el)el.textContent=lf>0?fmtLeft(lf)+' left for Critical':'Critical time used up';
  if(lf<=0&&!h.warn&&!ban){h.warn=1;hwSet(h);showBan('<b>Your Critical time is used up.</b> Keep going with your homework: it comes first. Critical can wait until tomorrow.',[['OK',hideBan]])}}
 function loop(){if(Date.now()-(loop.sa||0)>300000){loop.sa=Date.now();try{habAuto()}catch(_){}}try{if(typeof REW!=='undefined')REW.planTick()}catch(e){if(window.console)console.error(e)}try{if(typeof SHIFT!=='undefined')SHIFT.tick(firstLeft(todayI())<0,busy())}catch(e){if(window.console)console.error(e)}try{hwTick()}catch(_){}try{focusSend()}catch(_){}var r=runGet();try{fixChk(r)}catch(e){if(window.console)console.error(e)}try{warmChk(r)}catch(e){if(window.console)console.error(e)}try{dayNudge()}catch(e){if(window.console)console.error(e)}if(view==='day'&&!editing&&sh.classList.contains('open')){var nm=nowMin();if(nm!==lastDayPaint){lastDayPaint=nm;paintDay()}}r=runGet();paintPill();if(!r){if(ban&&banT)hideBan();return}
  var left=r.ends-Date.now();if(sh.classList.contains('open')&&cur===todayI()){var rb=$q('[data-k=run] b');if(rb)rb.textContent=(r.t||(DAY(r.day)[r.j]||WEEK()[r.day][r.j])[0])+' · '+(left>0?fmtLeft(left)+' left':'time\'s up')}
  if(left>0){try{highChk(r,left)}catch(e){if(window.console)console.error(e)}return}
  if(busy()){if(!warned.b){warned.b=1;if(arenaOpen()){var lastB=hwNext(r.day,r.j)<0;try{if(window.CRIT_ARENA&&CRIT_ARENA.note)CRIT_ARENA.note(lastB?'⏰ That\'s today\'s plan done! Finish this match, then close Clash.':'⏰ Time\'s up for '+r.t+'. Finish this match and close Clash for the next part.')}catch(_){}}else toastIn('Time\'s up for '+r.t+'. Finish this lesson, then you\'ll move on.')}return}
  var key=r.day+'-'+r.j+'-'+r.ends;if(!ban&&upKey!==key){upKey=key;timeUp(r)}}
 function toastIn(t){var d=document.createElement('div');d.className='plban';d.style.bottom='calc(96px + env(safe-area-inset-bottom))';d.setAttribute('role','status');d.innerHTML='<p>'+esc(t)+'</p>';document.body.appendChild(d);setTimeout(function(){d.remove()},6000)}
 $q('[data-k=auto]').onchange=function(){PS().auto=this.checked?1:0;save()};
 function close(){sh.classList.remove('open')}
 function open(v){if(v==='day'||v==='plan'||v==='hab'||v==='tst'||v==='smt')view=v;editing=null;cur=todayI();paint();sh.classList.add('open')}
 $q('.plx').onclick=close;sh.addEventListener('click',function(e){if(e.target===sh)close()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.classList.contains('open'))close()});
 var CAL='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14l1.6 1.6L13 12.2"/></svg>';
 var pill=document.createElement('button');pill.type='button';pill.className='pill plpill';pill.title='This week\'s plan';pill.innerHTML=CAL+'<span class="plc"></span><i class="pldot"></i>';pill.onclick=open;
 var anchor=document.querySelector('.hdr .stpill')||document.querySelector('.hdr .calcpill')||document.querySelector('.hdr .askpill');
 if(anchor)anchor.parentNode.insertBefore(pill,anchor.nextSibling);else{var ps=document.querySelector('.hdr .pills');if(ps)ps.insertBefore(pill,ps.firstChild)}
 function paintPill(){var t=todayI(),left=feOn(t)?0:DAY(t).filter(function(_,j){return !isDone(t,j)}).length,r=runGet(),c=pill.querySelector('.plc');pill.classList.toggle('left',left>0);pill.classList.toggle('run',!!r);
  var hwp=!r&&hwOn();if(hwp){pill.classList.add('run');var hg=hwGet(),lm=hg.end-Date.now();c.textContent='HW';pill.setAttribute('aria-label','Homework first, '+(lm>0?fmtLeft(lm)+' left for Critical':'Critical time used up'));return}
  if(r){var ms=r.ends-Date.now();c.textContent=ms>0?(ms<60000?Math.ceil(ms/1000)+'s':Math.ceil(ms/60000)+'m'):'0m';pill.setAttribute('aria-label','Today\'s plan: '+r.t+', '+(ms>0?fmtLeft(ms)+' left':'time\'s up'))}else{c.textContent='';pill.setAttribute('aria-label','This week\'s plan'+(left?', '+left+' to do today':', today done'))}}
 paintPill();document.addEventListener('visibilitychange',function(){if(!document.hidden){warned.n=0;loop();if(sh.classList.contains('open'))paint()}});
 setInterval(loop,1000);setTimeout(loop,600);setTimeout(function(){try{focusSend(true)}catch(_){}},1500);
 if(location.hash==='#plannext'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}}
 if(location.hash==='#setup'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{if(window.chrome&&chrome.runtime&&chrome.runtime.sendMessage)chrome.runtime.sendMessage(FOCUS_ID,{type:'setup'},function(){try{void chrome.runtime.lastError}catch(_){}open('plan')});else open('plan')}catch(_){open('plan')}},400)}
 if(location.hash==='#focus'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{if(!runGet()&&!hwOn()&&firstLeft(todayI())>=0&&typeof ONE!=='undefined')ONE.start();else open('plan')}catch(_){}},600)}
 if(location.hash==='#start'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{var t=todayI();if(t>4||runGet()||hwOn()||firstLeft(t)<0){open('plan');return}
  showBan('<b>4:45: time to start.</b> '+(rvOn(t)?'It\'s a revision day: '+restMins(t)+' minutes of revising for your test.':'Today\'s plan is '+restMins(t)+' minutes.')+' Got homework due? Do that first and Critical gets whatever time is left.',[['Start today\'s plan',function(){hideBan();startRun()}],['Homework first',function(){hideBan();startHw()}],['Just one question',function(){hideBan();ONE.start()}]])}catch(e){if(window.console)console.error(e)}},600)}
 if(location.hash==='#hwdone'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{hwDone()}catch(_){}},700)}
 if(location.hash==='#early'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{finishEarly()}catch(_){}},700)}
 if(location.hash==='#tests'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{open('tst')}catch(_){}},400)}
 if(location.hash==='#home'){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}setTimeout(function(){try{homeAuto();open('day')}catch(_){}},400)}
 try{smSync()}catch(e){if(window.console)console.error(e)}
return {wkKey:wk,brk:function(){brkOpen(0)},smart:function(){open('smt')},wkMins:function(){var m=0;DG.forEach(function(_,i){DAY(i).forEach(function(b,j){if(isDone(i,j))m+=b[1]})});return m},schoolMins:function(){var m=0;for(var i=0;i<5;i++)m+=mins(i);return m},TOTAL:TOTAL,dayMins:function(){return DAY(todayI()).reduce(function(a,b){return a+(b[5]==='bonus'?0:b[1])},0)},fullInfo:function(){var t=todayI(),full=allTicked(t),h=hwGet(),ks=h&&h.alloc?Object.keys(h.alloc):[],hf=ks.length>0&&ks.every(function(j){return isDone(t,+j)});return {t:t,full:full||hf,mins:full?DAY(t).reduce(function(a,b,j){return a+(isDone(t,j)?b[1]:0)},0):hf?ks.reduce(function(a,j){return a+h.alloc[j]},0):0,early:feOn(t),quick:qsOn(t)}},early:finishEarly,qsOn:qsOn,markQuick:markQuick,afterLesson:afterLesson,feOn:feOn,undoEarly:undoEarly,hideBan:hideBan,forecast:function(){try{return pathForecast()}catch(e){return null}},isDone:isDone,next:function(){var t=todayI(),j=firstLeft(t);return j<0?null:DAY(t)[j]},leftMins:function(){return leftMins(todayI())},open:open,close:close,paint:paint,paintPill:paintPill,start:startRun,stop:stopRun,loop:loop,running:function(){return !!runGet()},todayLeft:function(){return firstLeft(todayI())>=0},get D(){return WEEK()},DAY:DAY,pile:pile,TUE_FIX:TUE_FIX,rows:rows,nowRow:nowRow,sched:sched,home:homeGet,habits:HS,streak:streak,hw:hwGet,hwStart:startHw,hwDone:hwDone,focusStatus:focusStatus,focus:function(){return focusOk},rvOn:rvOn,runLeft:function(){var r=runGet();return r?r.ends-Date.now():null}};
})();
try{window.PLAN=PLAN}catch(_){}
