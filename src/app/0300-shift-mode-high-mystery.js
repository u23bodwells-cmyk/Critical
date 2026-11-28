/* ===== shift mode, end on a high, and the mystery of the week ===== */
(function(){var c=document.createElement('style');c.textContent=
 '.shmod{position:fixed;inset:0;z-index:4000;background:rgba(20,18,40,.5);display:flex;align-items:center;justify-content:center;padding:16px}'+
 '.shcard{background:var(--panel);color:var(--text);border-radius:18px;max-width:540px;width:100%;max-height:calc(100vh - 32px);overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}'+
 '.shk{font:700 12px var(--mono);letter-spacing:.08em;color:var(--accent);text-transform:uppercase;margin:0 0 6px}.shcard h2{margin:0 0 8px;font-size:22px}.shcard p{margin:6px 0;line-height:1.5}'+
 '.shq{background:var(--accent-bg);color:var(--accent-text);border-radius:12px;padding:12px 14px;margin:8px 0;font-size:16px;line-height:1.5}.shq small{display:block;font-size:12px;opacity:.85;margin-top:6px}'+
 '.shnote{border-left:3px solid var(--accent);padding:4px 0 4px 10px;color:var(--muted);margin:10px 0}.shnote b{color:var(--text)}'+
 '.shparts{margin:8px 0;padding:0;list-style:none}.shparts li{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--line);font-size:15px}.shparts li span{color:var(--muted);font-family:var(--mono);font-size:13px}'+
 '.shacts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center}.shopt{display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--soft);font:inherit;color:var(--text);cursor:pointer}.shopt:hover{background:var(--soft2)}'+
 '.shopt.ok{border-color:var(--good-line);background:var(--good-bg)}.shopt.no{border-color:var(--bad-line);background:var(--bad-bg)}.shopt[disabled]{cursor:default}.shex{font-size:14px;color:var(--muted);margin:6px 0}'+
 '.shta{width:100%;box-sizing:border-box;min-height:64px;border-radius:10px;border:1.5px solid var(--line);padding:8px 10px;font:inherit;background:var(--soft);color:var(--text);resize:vertical}'+
 '.mycard .myhead{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}.mycard h2{margin:0}.myk{font:700 12px var(--mono);letter-spacing:.08em;color:var(--accent);text-transform:uppercase}'+
 '.myclues{list-style:none;margin:10px 0;padding:0;counter-reset:cl}.myclues li{counter-increment:cl;display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:15px;line-height:1.45}.myclues li:before{content:counter(cl);flex:none;width:22px;height:22px;border-radius:50%;background:var(--accent-bg);color:var(--accent-text);font:700 12px var(--mono);display:flex;align-items:center;justify-content:center;margin-top:1px}'+
 '.myclues li.lk{color:var(--muted)}.myclues li.lk:before{background:var(--soft);color:var(--faint)}.myrev{background:var(--soft);border-radius:12px;padding:12px 14px;margin-top:10px}.myrev h3{margin:0 0 6px;font-size:17px}';
 document.head.appendChild(c)})();
function escH(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ymdD(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function shuffleSeed(a,seed){var r=seedRand(seed),b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),x=b[i];b[i]=b[j];b[j]=x}return b}

var SHIFT=(function(){
 var OPQ=[
  ['In a control room, why do operators repeat instructions back word for word?',['So both people know it was heard correctly','Because the radio is too quiet to hear the first time','It is an old naval tradition with no real purpose now','To slow everyone down so nobody rushes a job'],'Repeat-back catches a mishearing before anyone acts on it. In a control room, acting on the wrong number or the wrong valve can be serious.'],
  ['How do you say the letter B in the NATO phonetic alphabet?',['Bravo','Bob','Bingo','Baker'],'Bravo. Phonetic words stop letters like B, D and P being mixed up over a noisy radio or phone line.'],
  ['What does a reactor trip (a scram) do?',['Shuts the reactor down fast by dropping in all the control rods','Starts the reactor up by pulling all the control rods out','Lowers power slowly by adding boron to the cooling water','Tests every alarm in the control room at the same time'],'A trip drops every control rod into the core in a couple of seconds, stopping the chain reaction.'],
  ['Why do operators follow written procedures even for jobs they have done many times?',['Doing every step in order stops memory slips','Because managers don\'t trust them to remember','So the shift takes long enough to fill the hours','Only new operators use them; experts work from memory'],'Even experts forget a step sometimes. A procedure means the job is done the same, safe way every time.'],
  ['What is a shift handover?',['Telling the next shift the plant\'s state, problems and what is coming up','Swapping desks and logging in to the next shift\'s computers','Handing in your badge and dosimeter at the gate on the way out','Turning the reactor down for the night while the new crew settles in'],'Operators work in shifts around the clock, so a careful handover makes sure nothing gets lost between them.'],
  ['A program checks the reactor temperature over and over, every second. What is code that repeats called?',['A loop','A variable','A comment','A crash'],'A loop runs the same code again and again. Plant computers loop constantly, checking hundreds of readings.'],
  ['Why does a reactor still need cooling after it has shut down?',['The fuel keeps making heat from radioactive decay','The control rods stay hot and heat the water around them','The pumps make heat by friction as they keep running','It does not: the fuel cools down by itself in minutes'],'Decay heat starts at about 6% of full power just after shutdown and falls slowly, so cooling has to carry on for days.'],
  ['What does a questioning attitude mean for an operator?',['Checking things that look odd instead of assuming they are fine','Asking lots of questions in training, then trusting the procedures','Challenging the supervisor on every decision they make on shift','Ignoring alarms that go off a lot, because they are usually false'],'Many accidents started with a small sign that nobody questioned. Good operators ask "why is that happening?"']];
 function R(){if(!S.shift||typeof S.shift!=='object')S.shift={};var r=S.shift;if(!Array.isArray(r.notes))r.notes=[];return r}
 function on(){return R().off!==true}
 function set(v){R().off=!v;save()}
 function trackFor(a){return a==='gp'||a==='gc'||a==='gm'||a==='gcs'||a==='am'||a==='ap'||a==='ac'||a==='theory'||a==='maths'?a:(a==='calc'||a==='calcfu')?'calc':null}
 function pickQ(){var t=(new Date().getDay()+6)%7,parts=PLAN.DAY(t),k=ymdL(),rnd=seedRand('shift'+k);
  for(var i=0;i<parts.length;i++){var acts=parts[i][3]||[];for(var j=0;j<acts.length;j++){var tr=trackFor(acts[j][1]);if(!tr)continue;var nl=nextLesson(tr);if(!nl)continue;var u=UNITS[nl[0]],l=u.lessons[nl[1]],qs=l.cards.filter(function(c){return c.t==='Q'&&c.o&&c.o.length});
    if(qs.length){var c=qs[Math.floor(rnd()*qs.length)];return {p:c.p,o:c.o,a:c.a,e:c.e||'',src:u.title+' · '+l.title,why:'You\'ll meet this in your next lesson.'}}}}
  try{var pool=reviewPool(true).filter(function(x){return x.t==='Q'&&x.o&&x.o.length});if(pool.length){var c2=pool[Math.floor(rnd()*pool.length)];return {p:c2.p,o:c2.o,a:c2.a,e:c2.e||'',src:c2._src||'Fix my mistakes',why:'You got this one wrong before. Crack it this time.'}}}catch(_){}
  var q=OPQ[Math.floor(rnd()*OPQ.length)];return {p:escH(q[0]),o:q[1].map(escH),a:0,e:escH(q[2]),src:'Control room skills',why:'Every operator needs to know this.'}}
 var mod=null;
 function closeMod(){if(mod){mod.remove();mod=null;document.removeEventListener('keydown',esck)}}
 function esck(e){if(e.key==='Escape')closeMod()}
 function openMod(html){closeMod();mod=document.createElement('div');mod.className='shmod';mod.setAttribute('role','dialog');mod.setAttribute('aria-modal','true');mod.innerHTML='<div class="shcard">'+html+'</div>';document.body.appendChild(mod);document.addEventListener('keydown',esck);mod.addEventListener('click',function(e){if(e.target===mod)closeMod()});return mod}
 function hm(ms){var d=new Date(ms),h=d.getHours(),m=d.getMinutes();return (h%12||12)+':'+(m<10?'0':'')+m+(h>=12?'pm':'am')}
 function brief(go){if(!on())return false;var r=R(),k=ymdL();if(r.d===k&&r.start)return false;
  var t=(new Date().getDay()+6)%7,parts=PLAN.DAY(t),q=pickQ(),last=r.notes.length?r.notes[r.notes.length-1]:null,dn=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][t],tot=0;
  var li=parts.map(function(b,j){tot+=b[1];return '<li>'+escH(b[0])+'<span>'+b[1]+' min</span></li>'}).join('');
  var M=openMod('<p class="shk">Shift briefing · '+dn+' · '+hm(Date.now())+'</p><h2>Your shift is about to start</h2>'+
   (last&&last.note?'<div class="shnote"><b>Handover note from your last shift</b> ('+escH(last.d)+'):<br>"'+escH(last.note)+'"</div>':'')+
   '<p><b>Today\'s shift</b> · '+tot+' min</p><ul class="shparts">'+li+'</ul>'+
   '<p><b>Your question for this shift</b></p><div class="shq">'+q.p+'<small>'+escH(q.why)+' ('+escH(q.src)+')</small></div>'+
   '<p class="shex">At the end of the shift you\'ll get the chance to answer it.</p>'+
   '<div class="shacts"><button type="button" class="wbtn pri" data-a="go">Start shift →</button><button type="button" class="skip" data-a="no">Not now</button></div>');
  M.querySelector('[data-a=go]').onclick=function(){var rr=R();rr.d=k;rr.start=Date.now();rr.xp0=S.xp;rr.l0=lessonsToday();rr.q=q;rr.hd=null;save();closeMod();go()};
  M.querySelector('[data-a=no]').onclick=closeMod;setTimeout(function(){try{M.querySelector('[data-a=go]').focus()}catch(_){}},30);return true}
 function tick(done,blocked){var r=R(),k=ymdL();if(!on()||r.d!==k||!r.start||r.hd===k||!done||blocked||mod)return;if(!r.wait){r.wait=Date.now();return}if(Date.now()-r.wait<1500)return;r.wait=0;handover()}
 function handover(){var r=R(),k=ymdL();r.hd=k;save();var mins=Math.max(1,Math.round((Date.now()-r.start)/60000)),xp=Math.max(0,S.xp-(r.xp0||S.xp)),ls=Math.max(0,lessonsToday()-(r.l0||0)),q=r.q,fe=PLAN.feOn&&PLAN.feOn();
  var opts=q?shuffleSeed(q.o.map(function(o,i){return [o,i]}),'ho'+k):[];
  var M=openMod('<p class="shk">Shift handover · '+hm(Date.now())+'</p><h2>'+(fe?'Shift finished early':'Shift complete')+'</h2>'+
   '<div class="stats"><div class="stat"><p>On shift</p><b>'+mins+' min</b></div><div class="stat"><p>Lessons</p><b>'+ls+'</b></div><div class="stat"><p>XP earned</p><b>+'+xp+'</b></div></div>'+
   (q?'<p><b>Can you answer your shift question now?</b></p><div class="shq">'+q.p+'</div><div data-k="opts">'+opts.map(function(o){return '<button type="button" class="shopt" data-i="'+o[1]+'">'+o[0]+'</button>'}).join('')+'</div><p class="shex" data-k="ex" hidden></p>':'')+
   '<p style="margin-top:14px"><b>Handover note for your next shift</b></p><p class="shex">One line: what did you learn, or what should you pick up next time?</p><textarea class="shta" maxlength="200" placeholder="Functions take an input and give exactly one output"></textarea>'+
   '<div class="shacts"><button type="button" class="wbtn pri" data-a="ok">Sign off</button></div>');
  var answered=false;[].forEach.call(M.querySelectorAll('.shopt'),function(b){b.onclick=function(){if(answered)return;answered=true;var i=+b.dataset.i,ok=i===q.a;
   [].forEach.call(M.querySelectorAll('.shopt'),function(x){x.disabled=true;if(+x.dataset.i===q.a)x.classList.add('ok')});if(!ok)b.classList.add('no');
   var ex=M.querySelector('[data-k=ex]');ex.hidden=false;ex.innerHTML=(ok?'<b>Got it: +10 XP.</b> ':'<b>Not quite.</b> ')+q.e;if(ok)addXP(10);try{sfx(ok?'right':'wrong')}catch(_){}}});
  M.querySelector('[data-a=ok]').onclick=function(){var n=M.querySelector('.shta').value.trim().slice(0,200),rr=R();if(n){rr.notes.push({d:new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),note:n});if(rr.notes.length>20)rr.notes=rr.notes.slice(-20)}save();closeMod();try{confetti()}catch(_){}}}
 return {brief:brief,tick:tick,handover:handover,on:on,set:set,pickQ:pickQ,close:closeMod}
})();
try{window.SHIFT=SHIFT}catch(_){}

/* end on a high: a quick victory lap of questions you already know */
var HIGH=(function(){
 function pool(){var cs=[];UNITS.forEach(function(u){u.lessons.forEach(function(l){if(!S.done[l.id])return;l.cards.forEach(function(x,ci){if(x.t==='Q'&&x.o&&!S.wrong[l.id+'#'+ci])cs.push(Object.assign({},x,{_key:l.id+'#'+ci,_src:u.title+' · '+l.title}))})})});return cs}
 function canLap(){return pool().length>=3}
 function lap(){var cs=shuffleSeed(pool(),'lap'+Date.now()).slice(0,5);if(cs.length<3){showPage('sim');return}if(document.querySelector('#player.open'))closePlayer();
  P={mode:'lap',cards:cs,i:0,xp:0,right:0,asked:0,title:'Victory lap',color:'#1D9E75',unit:'Victory lap',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
 function finish(){P.finished=true;P.quiet=true;$('pBar').style.width='100%';var b=$('pBody'),n=P.cards.length,r=P.right;save();
  b.innerHTML='<div class="done-screen"><div class="dicon"><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="var(--good-bg)"/><path d="M45 20l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="var(--good)"/></svg></div>'+
   '<h2>'+(r===n?'Perfect victory lap!':'Victory lap done')+'</h2><p class="note" style="font-size:16px">'+r+' out of '+n+' right. '+(r>=n-1?'That\'s how you end a shift: on a high.':'Any you missed are saved to Review, so they\'ll come back.')+'</p></div>';
  foot('','','');skipBtn(null);mainBtn('Done',function(){closePlayer()});$('pXP').textContent=P.xp?'+'+P.xp+' XP':'';try{confetti()}catch(_){}}
 return {lap:lap,finish:finish,canLap:canLap}
})();
try{window.HIGH=HIGH}catch(_){}

/* mystery of the week: a real incident, one clue for each day you do a lesson, the answer on Friday */
var MYS=(function(){
 var CASES=[
  {t:'The Windscale fire',y:'Cumbria, England, 1957',clues:['October 1957, in Cumbria, England. A reactor was making plutonium for Britain\'s nuclear weapons.','The reactor was cooled by blowing air through the core and straight out of a tall chimney.','Operators were doing a routine heating of the graphite, to release energy that builds up inside it.','The temperature gauges were not in the hottest part of the core, so the readings were confusing.','A worker looked through an inspection hole in the reactor and saw something glowing cherry red.'],
   q:'What went wrong?',o:['The fuel and graphite inside the core caught fire','A steam explosion blew the lid off the reactor','A cooling pipe burst and flooded the core with water','An earthquake cracked the core and let the air in'],a:0,
   story:'It burned for about three days. The air blowing through the core fed the flames, and carbon dioxide didn\'t put it out, so in the end they flooded the core with water and shut off the air. Filters at the top of the chimneys, added late and nicknamed "Cockcroft\'s Folly", caught a lot of the radioactive dust. Even so, milk from farms nearby was poured away for about a month because of radioactive iodine.',
   lesson:'Instruments must measure where it matters, and extra safety layers (like those filters) can save the day even when people laughed at them.'},
  {t:'Three Mile Island',y:'Pennsylvania, USA, 1979',clues:['March 1979, Pennsylvania, USA. At 4am, the pumps feeding water to the steam generators stopped.','The reactor tripped and shut down automatically, exactly as designed.','A relief valve on the pressuriser opened to let off pressure, and then stuck open.','A light in the control room told the operators the valve had closed.','Thinking the reactor had too much water in it, the operators turned down the emergency cooling.'],
   q:'Why did about half of the core melt?',o:['Operators trusted a misleading light and cut back the cooling','A control rod jammed out of the core and power surged','Saboteurs broke into the plant and opened the valve','The containment building collapsed onto the pressuriser'],a:0,
   story:'The light only showed that the valve had been told to close, not that it actually had. Cooling water kept escaping through the stuck valve for over two hours, and because the operators had turned the emergency cooling down, the top of the core was uncovered and about half of it melted. The containment building held, very little radioactivity escaped, and nobody was hurt.',
   lesson:'Indicators should show what equipment is really doing, and operators are now trained to work out what is happening from all the evidence, not one reading.'},
  {t:'The Browns Ferry fire',y:'Alabama, USA, 1975',clues:['March 1975, Alabama, USA. The plant was running normally at full power.','Workers were sealing gaps where electrical cables pass through a wall.','To find air leaks, they used something that leans towards a draught.','The sealing material was a kind of foam that burns easily.','Soon after, lots of the safety system controls in the control room stopped working.'],
   q:'What started it?',o:['A candle used to check for draughts','A lightning strike on the cable room','A pump motor overheating in the basement','A short circuit in the control room'],a:0,
   story:'A worker held a candle up to the gap to see if air was being pulled through. The draught sucked the flame into the foam, and the fire spread along the cables for about seven hours, damaging over 1,600 of them and knocking out many safety systems. The operators found other ways to keep water over the core, so no radioactivity was released.',
   lesson:'Safety system cables are now kept apart, behind fire barriers, so a single fire can\'t knock out a system and its backup at the same time.'},
  {t:'The hole in the lid at Davis-Besse',y:'Ohio, USA, 2002',clues:['2002, Ohio, USA. The reactor was shut down for refuelling and inspection.','For years, workers had been cleaning brown and white crusty deposits off equipment in containment.','The reactor\'s cooling water has boron dissolved in it, which makes boric acid.','Inspectors found cracks in nozzles on top of the reactor vessel lid.','When they cleared away the crust on the lid, the thick steel underneath was not all there.'],
   q:'What did they find?',o:['A hole eaten into the steel lid, with only a thin lining left holding the pressure','A cracked fuel rod that had been leaking radioactive water into the coolant for years','A control rod stuck halfway, because boric acid crystals had jammed its drive','A bird\'s nest blocking the air vent that cools the top of the reactor vessel'],a:0,
   story:'Boric acid leaking from a cracked nozzle had slowly eaten away about 15 cm of carbon steel over an area roughly the size of a football. All that was left holding back the high-pressure cooling water was a stainless steel lining about 5 mm thick. The warning signs had been there for years, but they were explained away. The plant was shut for two years and the company got a record fine.',
   lesson:'Small signs (rust, crusty deposits, blocked filters) can point to something big. A questioning attitude means asking why, not just cleaning it up.'},
  {t:'Fukushima Daiichi',y:'Japan, 2011',clues:['March 2011, Japan. Three reactors were running at a power station by the sea.','A huge earthquake hit, and all three reactors shut down automatically. So far, so good.','The power lines were down, so backup diesel generators started up to run the cooling pumps.','The generators and electrical equipment were in basements, close to the sea.','About 50 minutes after the earthquake, the sea arrived.'],
   q:'Why did reactors melt down after they had already shut down?',o:['A tsunami flooded the backup power, so the decay heat could not be removed','The control rods failed to go in, so the chain reaction kept running','Operators restarted the reactors too early, before the shaking stopped','A fire broke out in the turbine hall and spread along the power cables'],a:0,
   story:'A tsunami about 14 metres high went over the sea wall and flooded the generators and switchgear, so the plant lost almost all its electricity. The reactors were shut down, but their fuel was still making decay heat, and without pumps the water boiled away. Three cores melted and hydrogen explosions wrecked several buildings. Over 100,000 people were evacuated.',
   lesson:'Shutting a reactor down is only half the job: decay heat must be removed for days. Backup power now has to be protected from floods and other extreme events.'},
  {t:'Chernobyl',y:'Ukraine (then the Soviet Union), 1986',clues:['April 1986, in the Soviet Union. Engineers planned a safety test during a shutdown.','The power fell much lower than planned, and was hard to bring back up.','To raise the power, operators pulled out almost all the control rods, breaking the safety rules.','This reactor design made more power when its cooling water turned to steam.','When they pressed the emergency shutdown button, the power briefly went up instead of down.'],
   q:'What made the reactor run away?',o:['A design that made more power as the water boiled, plus broken safety rules','A tsunami flooded the plant and knocked out all of the cooling pumps','A candle set the cables alight under the control room during the test','A spy sabotaged the controls so that the rods could not be put back in'],a:0,
   story:'When the test started, the cooling water flow dropped and more of it turned to steam. In this design, more steam meant more power, which made even more steam. The control rods had graphite tips, so as they began to go in they briefly added power too. In seconds the power shot up and steam explosions destroyed the reactor. It was the worst nuclear accident ever: 31 people died within weeks, and the area around it is still closed today.',
   lesson:'Reactors in the UK and most of the world are designed so that boiling or overheating makes the power go down, not up. Safety rules exist for reasons, even during tests.'}];
 var BASE=new Date(2026,10,2);
 function wkStart(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
 function idx(){var w=Math.round((wkStart()-BASE)/(7*86400000));return ((w%CASES.length)+CASES.length)%CASES.length}
 function R(){var k=ymdD(wkStart());if(!S.mys||typeof S.mys!=='object'||S.mys.wk!==k)S.mys={wk:k,days:{},guess:null,done:false};if(!S.mys.days)S.mys.days={};return S.mys}
 function clues(){return Math.min(5,1+Object.keys(R().days).length)}
 function lesson(){var r=R(),k=ymdL();if(r.days[k])return;var before=clues();r.days[k]=1;save();if(clues()>before){var ds=document.querySelector('#pBody .done-screen');if(ds){var e=document.createElement('p');e.className='note';e.style.cssText='text-align:center;margin:0 0 10px';e.innerHTML='<b>New clue unlocked</b> in the Mystery of the week. Have a look on the Learn page.';var an=ds.querySelector('.dblock');if(an)ds.insertBefore(e,an);else ds.appendChild(e)}}}
 function revealDay(){return ((new Date().getDay()+6)%7)>=4}
 function card(){var r=R(),C=CASES[idx()],n=clues(),rv=revealDay(),k=ymdL();try{if(!r.days[k]&&lessonsToday()>=1){r.days[k]=1;save();n=clues()}}catch(_){}
  if(rv&&r.guess!=null&&!r.done){r.done=true;if(!r.xp){r.xp=r.guess===C.a?50:10;addXP(r.xp)}save()}
  var shown=r.done;var opts=shuffleSeed(C.o.map(function(o,i){return [o,i]}),'mys'+r.wk);
  var h='<div class="myhead"><span class="myk">Case file '+(idx()+1)+' of '+CASES.length+'</span><span class="note">'+n+' of 5 clues</span></div><h2>Mystery of the week</h2>'+
   '<p class="note" style="font-size:15px">'+(shown?escH(C.t)+' · '+escH(C.y):'Something went wrong at a real nuclear site. Each day you do a lesson unlocks another clue. The answer comes out on Friday.')+'</p><ol class="myclues">';
  if(shown)n=5;
  for(var i=0;i<5;i++)h+=i<n?'<li>'+escH(C.clues[i])+'</li>':'<li class="lk">Locked: do a lesson on another day to unlock it.</li>';
  h+='</ol>';
  if(shown){var ok=r.guess===C.a;h+='<div class="myrev"><h3>'+(r.guess==null?'The answer':ok?'Case solved! +50 XP':'Not quite, but +10 XP for having a go')+'</h3>'+(r.guess!=null&&!ok?'<p class="note">You guessed: '+escH(C.o[r.guess])+'</p>':'')+'<p><b>'+escH(C.o[C.a])+'.</b> '+escH(C.story)+'</p><p><b>What operators learned:</b> '+escH(C.lesson)+'</p><p class="note">A new case opens on Monday.</p></div>'}
  else if(r.guess!=null&&!rv){h+='<div class="myrev"><p><b>Your guess:</b> '+escH(C.o[r.guess])+'</p><p class="note">Locked in. The answer comes out on Friday. <button type="button" class="ghost" data-my="change">Change my guess</button></p></div>'}
  else if(n>=3||rv){h+='<p><b>'+escH(C.q)+'</b></p><div>'+opts.map(function(o){return '<button type="button" class="shopt" data-my="g" data-i="'+o[1]+'">'+escH(o[0])+'</button>'}).join('')+'</div>'+(rv?'<p class="note"><button type="button" class="ghost" data-my="show">Just show me the answer</button></p>':'<p class="note">You can guess now and change it until Friday.</p>')}
  else h+='<p class="note">Unlock 3 clues to make your guess.</p>';
  return h}
 function mount(){var el=document.getElementById('page-learn');if(!el)return;var old=el.querySelector('.mycard');if(old)old.remove();var hero=el.querySelector('.hero');if(!hero)return;
  var c=document.createElement('div');c.className='card mycard';c.innerHTML=card();hero.parentNode.insertBefore(c,hero.nextSibling);wire(c)}
 function wire(c){[].forEach.call(c.querySelectorAll('[data-my]'),function(b){b.onclick=function(){var r=R(),C=CASES[idx()],a=b.dataset.my;
  if(a==='g'){r.guess=+b.dataset.i;if(revealDay()){r.done=true;var ok=r.guess===C.a;if(!r.xp){r.xp=ok?50:10;addXP(r.xp)}if(ok)try{confetti()}catch(_){};try{sfx(ok?'right':'wrong')}catch(_){}}save()}
  else if(a==='change'){r.guess=null;save()}else if(a==='show'){r.done=true;save()}
  c.innerHTML=card();wire(c)}})}
 return {mount:mount,lesson:lesson,clues:clues,idx:idx,CASES:CASES,card:card}
})();
try{window.MYS=MYS}catch(_){}
