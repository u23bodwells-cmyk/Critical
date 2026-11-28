/* ---------- motivation: station, quests, combos, badges, ranks, sound ---------- */
function dnum(s){var p=String(s||'').split('-');return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5)}
function dayDiff(a,b){return dnum(b)-dnum(a)}
function motInit(){var d={hist:{},badges:{},freeze:0,st:{},wrong:{},sound:true,quests:null,fu:{},tests:{}};for(var k in d)if(S[k]===undefined||S[k]===null&&k!=='quests')S[k]=d[k];
 ['perfect','best','reviews','fixed','chests','right','maxStreak','fuFixed'].forEach(function(k){if(typeof S.st[k]!=='number')S.st[k]=0});
 if(S.streak>S.st.maxStreak)S.st.maxStreak=S.streak}
motInit();
var JUST_BUILT=null;
function fmtInt(n){return Math.round(n).toLocaleString('en-GB')}

/* ----- lesson hooks: one-line teasers for what's next ----- */
var HOOKS={m1:'A reactor\'s power spans ten powers of ten. Learn the shorthand operators use for numbers that huge and tiny.',m2:'Why a reactor\'s power can double in seconds, and the maths that predicts it.',m3:'Meters that read from 1 to 1,000,000 on one dial: here\'s the trick behind them.',m4:'Startup rate is a gradient. Learn to read how fast things are changing at a glance.',m5:'The equation behind every decay curve and every power rise.',m6:'Why the source range counts jump around, and how to tell a real change from noise.',
 e1:'What a megawatt really is, and how 3,000 of them come out of a core about 4 metres tall.',e2:'Why a neutron slows down best by crashing into something light, like water.',e3:'E = mc², slowly: what E, m and c mean, and what each is measured in.',e3b:'Put real numbers into E = mc², one step at a time.',e3c:'The two small units made for atoms: u and MeV, and where 931.5 comes from.',e3d:'Weigh a uranium atom before and after it splits, and find the missing mass.',
 a1:'Why uranium-235 splits easily and uranium-238 mostly doesn\'t.',a2:'The one graph that explains both nuclear power and the Sun.',a3:'Alpha, beta, gamma: what comes out of a nucleus, and what stops each one.',a4:'Why some radioactive waste is harmless in days and some lasts thousands of years.',a5:'Scatter, absorb or split: what decides a neutron\'s fate.',a6:'Count the neutrons and you know the power. Here\'s how.',a7:'Split one uranium nucleus and follow where its 200 MeV goes.',
 r1:'Follow one neutron from birth to death, and see why k = 1 means critical.',r2:'Six numbers that decide whether a reactor holds steady, grows or dies away.',r3:'Why reactors need slow neutrons, and why water is so good at slowing them.',r4:'The operator\'s most important number, and the unit it\'s measured in: pcm.',r5:'How operators predict where a reactor will go critical before it gets there.',r6:'Your fastest tool on the desk: how much a control rod is worth, and where.',r7:'Steering a reactor by changing the chemistry of its water.',r8:'Why a PWR naturally pushes back when it gets hotter.',r9:'The poison that can stop you restarting a reactor for a whole day.',r10:'The poisons engineers put into the core on purpose.',r11:'How a core is designed so it can always be shut down, even at its worst moment.',
 k1:'Less than 1% of neutrons arrive late. Without them, reactors couldn\'t be controlled.',k2:'The meter that tells you how fast power is about to change.',k3:'The line operators must never cross, and why a reactor can\'t explode like a bomb.',k4:'Power falls by about 90% in a split second after a trip. So why does the rest take minutes?',k5:'Why a shut-down reactor still needs cooling, and what went wrong at Fukushima.',
 t1:'Why the water in a PWR is over 300 °C but doesn\'t boil.',t2:'Read a steam table like an operator does.',t3:'Follow every megawatt from the core to the grid.',t4:'Why only about a third of the heat becomes electricity, and where the rest goes.',
 h1:'Why the middle of a fuel pellet can be over 1,000 °C hotter than the water around it.',h2:'The limit that protects the fuel: when bubbles stop helping and start hurting.',h3:'How a pump can wreck itself by boiling its own water.',h4:'How a reactor can cool itself with every pump switched off.',
 p1:'Sieverts, grays and becquerels: what your dose badge is really measuring.',p2:'Three simple ways to cut your dose, and the maths behind each one.',p3:'The difference between being exposed and being contaminated.',
 s1:'Walk the plant from the reactor to the turbine to the grid.',s2:'One tank that controls the pressure of the whole reactor coolant system.',s3:'Turn hot water into electricity for millions of homes.',s4:'Three sets of detectors that see power from a trickle up to 120%.',s5:'Layer after layer: how a plant is designed so one failure is never enough.',s6:'Why reactor water chemistry is controlled to parts per billion.',
 o1:'The habits that stop good operators making small mistakes.',o2:'Three Mile Island, Chernobyl and Fukushima: what went wrong, and what operators changed.',o3:'Put it all together: take a reactor from shutdown to the grid.'};

/* ----- ranks ----- */
var RANK_INFO=['You\'re on the visitor centre tour, looking through the glass at the control room.','Day one of training: site induction, safety rules and the basics.','You test and maintain equipment around the plant.','You walk the plant, check equipment and carry out the control room\'s instructions.','You\'re training for the control room and practising on the simulator.','You\'re qualified to work the control desk: rods, boron and power.','You supervise the desk and make the key calls during events.','You lead the whole shift team and are responsible for the plant\'s safety on your shift.','You manage shifts, training and standards across the station.','You run the whole power station.','You oversee operations at every power station in the fleet.','You\'re accountable for nuclear safety across the whole company.','You lead the inspectors who decide whether a reactor is safe to run.','You lead the building of a brand-new power station, like Hinkley Point C.','You design small modular reactors that can be built in a factory and shipped to site.','You work on fusion: joining light atoms together, the reaction that powers the Sun.','You run a tokamak, holding plasma at over 100 million °C inside magnetic fields.','You run the first power station to put fusion electricity on the grid.','You plan how the whole country gets clean, reliable electricity, day and night.','You\'ve mastered fission and fusion. This is the top of the ladder.'];

/* ----- station ----- */
var COMP=['Foundations','Grid connection','Fuel','Reactor building','Control rods','Steam lines','Cooling water','Radiation monitoring','Turbine hall','Control room'];
var HOMES=6000000;
function unitFrac(ui){var u=UNITS[ui],d=u.lessons.filter(function(l){return S.done[l.id]}).length;return {d:d,n:u.lessons.length,f:d/u.lessons.length}}
function homesNow(){var t=allLessons(curMode(),1).length;return t?doneCount(curMode(),1)/t*HOMES:0}
function stationSVG(){var gs=[];
 function g(ci,inner){var ui=compUnit(ci),u=UNITS[ui];if(!u)return '';var x=unitFrac(ui),st=x.d===0?'plan':x.f>=1?'full':'part';
  return '<g class="stc '+st+(JUST_BUILT===ui?' pulse':'')+'" data-u="'+ui+'" tabindex="0" role="button" aria-label="'+COMP[ci]+': '+x.d+' of '+x.n+' lessons" style="--c:'+(x.d===0?'var(--faint)':u.color)+';--f:'+(x.d===0?0:(0.18+0.55*x.f).toFixed(2))+'"><title>'+COMP[ci]+' ('+x.d+'/'+x.n+')</title>'+inner+'</g>'}
 var tot=allLessons(curMode(),1).length,dc=doneCount(curMode(),1),lit=Math.ceil(dc/tot*8-1e-9),houses='';
 for(var i=0;i<8;i++){var hx=560+(i%4)*19-(i>3?9:0),hy=i>3?186:172+(i%2)*4,on=i<lit;houses+='<path d="M'+hx+' '+(hy+6)+'l6-6 6 6v'+(200-hy-6)+'h-12z" class="house'+(on?' on':'')+'"/><rect x="'+(hx+4)+'" y="'+(hy+9)+'" width="4" height="4" class="win'+(on?' on':'')+'"/>'}
 var s='<svg viewBox="0 62 640 174" class="station" role="img" aria-label="Your power station"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--soft)" stop-opacity=".2"/><stop offset="1" stop-color="var(--soft)"/></linearGradient></defs><rect x="0" y="62" width="640" height="174" rx="14" fill="url(#sky)"/>'+stationBack()+
  '<path d="M0 200 Q10 196 20 200 T40 200 T60 200 V236 H0Z" class="sea"/><line x1="0" y1="200" x2="640" y2="200" class="ground"/>'+houses+
  g(6,'<rect x="62" y="184" width="22" height="16" class="b"/><path d="M30 214 H300 V200" class="ln flow"/><path d="M30 222 H312 V200" class="ln flow rev"/>')+
  g(0,'<rect x="92" y="200" width="320" height="8" class="b"/><path d="M110 208v14M160 208v14M210 208v14M260 208v14M310 208v14M360 208v14M400 208v14" class="ln"/>')+
  g(3,'<path d="M105 200 V122 A50 50 0 0 1 205 122 V200 Z" class="b"/>')+
  g(2,'<rect x="136" y="160" width="38" height="36" rx="6" class="b"/><path d="M143 166v24M149.5 166v24M156 166v24M162.5 166v24M169 166v24" class="ln thick"/>')+
  g(4,'<rect x="137" y="120" width="36" height="9" rx="2" class="b"/><path d="M146 129v34M155 129v34M164 129v34" class="ln thick"/>')+
  g(9,'<rect x="214" y="152" width="40" height="48" class="b"/><rect x="220" y="160" width="8" height="7" class="win2"/><rect x="232" y="160" width="8" height="7" class="win2"/><rect x="244" y="160" width="5" height="7" class="win2"/><rect x="220" y="174" width="8" height="7" class="win2"/><rect x="232" y="174" width="8" height="7" class="win2"/><rect x="244" y="174" width="5" height="7" class="win2"/><path d="M234 152v-12M229 140h10" class="ln"/>')+
  g(5,'<path d="M196 136 H262 V160" class="ln thick flow"/><path d="M200 128 H270 V160" class="ln thick flow"/><circle cx="300" cy="132" r="5" class="puff p1"/><circle cx="320" cy="128" r="6" class="puff p2"/><circle cx="340" cy="134" r="5" class="puff p3"/>')+
  g(8,'<path d="M262 200 V150 L327 142 L392 150 V200 Z" class="b"/><path d="M276 192 L282 172 H312 L318 192 Z M320 192 L325 176 H345 L350 192 Z" class="b2"/><rect x="356" y="174" width="26" height="18" rx="3" class="b2"/>')+
  g(7,'<path d="M96 200V188M106 200V188M116 200V188M126 200V188M196 200V188M206 200V188M216 200V188M256 200V188M96 190H126M196 190H256" class="ln"/><rect x="74" y="168" width="14" height="10" rx="2" class="b"/><path d="M81 178V200" class="ln"/>')+
  g(1,'<rect x="400" y="182" width="20" height="18" class="b"/><path d="M455 200 L463 130 L471 200 M457 180 H469 M459 160 H467 M461 142 H465 M440 134 H486 M520 200 L528 130 L536 200 M522 180 H534 M524 160 H532 M526 142 H530 M505 134 H551" class="ln"/><path d="M410 182 Q436 150 444 134 M486 134 Q503 140 505 134 M551 134 Q565 150 575 175" class="ln flow"/>')+
  stationFront()+'</svg>';return s}
function stationBack(){try{return REW.back()}catch(_){return ''}}
function stationFront(){try{return REW.front()}catch(_){return ''}}
function stationCard(){var dc=doneCount(curMode(),1),tot=allLessons(curMode(),1).length,pct=Math.round(dc/tot*100),hm=homesNow();
 return '<div class="card stationcard"><div class="sch"><div><h2>Your power station'+(curMode()==='theory'?' <span class="modetag">Theory</span>':' <span class="modetag">Maths</span>')+'</h2><p class="note">Each unit you finish builds part of the station. Hinkley Point C is designed to power about 6 million homes.</p></div><div class="homes"><b>'+fmtInt(hm)+'</b><span>homes powered</span></div></div>'+stationSVG()+
  '<div class="stbar"><div style="width:'+pct+'%"></div></div><p class="note" id="stInfo">'+pct+'% built. Tap a part of the station to see which unit builds it.</p></div>'}
function wireStation(){[].forEach.call(document.querySelectorAll('.stc'),function(gEl){function show(){var ui=+gEl.dataset.u,u=UNITS[ui],x=unitFrac(ui);
  $('stInfo').innerHTML='<b>'+COMP[compOf(ui)]+'</b>: built by '+uLabel(ui)+', '+u.title+' ('+x.d+'/'+x.n+' lessons). '+(x.f>=1?'Complete ✓':'<button class="skip" id="stGo">Go to this unit</button>');
  if($('stGo'))$('stGo').onclick=function(){var c=document.querySelectorAll('.unit')[uNum(ui)-1];if(c)c.scrollIntoView({behavior:'smooth',block:'start'})}}
  gEl.onclick=show;gEl.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}}});JUST_BUILT=null}

/* ----- daily quests ----- */
var QDEF={xp:['Earn {n} XP','xp'],lessons:['Finish {n} lesson{s}','book'],run:['Get {n} right in a row','fire'],perfect:['Finish a lesson with no mistakes','star'],review:['Complete a review','loop'],right:['Answer {n} questions right first time','check'],sim:['Spend {n} minutes in the control room','dial'],fix:['Fix {n} mistakes in review','tool'],follow:['Complete a follow-up practice','loop']};
function seedRand(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return function(){h+=0x6D2B79F5;var t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function quests(){var t=today();if(S.quests&&S.quests.d===t)return S.quests;var r=seedRand('q'+t),dc=doneCount('all'),wc=Object.keys(S.wrong||{}).length;
 var pool=[['lessons',r()<0.6?1:2],['run',r()<0.5?5:8],['perfect',1],['right',r()<0.5?10:15],['sim',180]];if(dc>0){pool.push(['review',1]);pool.push(['follow',1])}if(wc>=3)pool.push(['fix',3]);
 for(var i=pool.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),tmp=pool[i];pool[i]=pool[j];pool[j]=tmp}
 S.quests={d:t,chest:false,list:[{k:'xp',n:S.goal,p:Math.min(S.goal,S.daily.d===t?S.daily.xp:0),done:false}].concat(pool.slice(0,2).map(function(q){return {k:q[0],n:q[1],p:0,done:false}}))};save();return S.quests}
function qText(q){var n=q.k==='sim'?Math.round(q.n/60):q.n;return QDEF[q.k][0].replace('{n}',n).replace('{s}',n===1?'':'s')}
function qProgText(q){return q.k==='sim'?Math.floor(q.p/60)+'/'+Math.round(q.n/60)+' min':Math.floor(q.p)+'/'+q.n}
var QICON={xp:BOLT,book:'<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" fill="#378ADD"/><path d="M6 19h13v2H6a2 2 0 0 1 0-2z" fill="#9cc6ef"/></svg>',fire:FLAME,star:'<svg viewBox="0 0 24 24"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z" fill="#EF9F27"/></svg>',loop:'<svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2.6" stroke-linecap="round"><path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 2v5h-5M6 22v-5h5"/></svg>',check:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1D9E75"/><path d="m7 12 3.5 3.5L17 9" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',dial:'<svg viewBox="0 0 24 24" fill="none" stroke="#D85A30" stroke-width="2.4" stroke-linecap="round"><path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/></svg>',tool:'<svg viewBox="0 0 24 24" fill="none" stroke="#5F7A8C" stroke-width="2.6" stroke-linecap="round"><path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/></svg>'};
var SNOW='<svg viewBox="0 0 24 24" fill="none" stroke="#378ADD" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>';
var CHEST='<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="2" fill="#BA7517"/><path d="M3 11a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5z" fill="#EF9F27"/><rect x="10" y="11" width="4" height="5" rx="1" fill="#fcc24a"/></svg>';
function questsHTML(compact){var q=quests(),h='';q.list.forEach(function(it){var f=Math.min(1,it.p/it.n);h+='<div class="quest'+(it.done?' done':'')+'"><span class="qi">'+(it.done?QICON.check:QICON[QDEF[it.k][1]])+'</span><div class="qb"><div class="qt">'+qText(it)+'</div><div class="qbar"><div style="width:'+(f*100)+'%"></div></div></div><span class="qp">'+(it.done?'+10 XP':qProgText(it))+'</span></div>'});
 if(!compact){var all=q.chest;h+='<div class="quest chest'+(all?' done':'')+'"><span class="qi">'+CHEST+'</span><div class="qb"><div class="qt">'+(all?'Daily chest opened!':'Finish all three: +30 XP'+(S.freeze<2?' and a streak freeze':''))+'</div></div></div>'}return h}
function questCard(){var now=new Date(),mid=new Date(now);mid.setHours(24,0,0,0);var mins=Math.max(1,Math.round((mid-now)/60000));
 return '<div class="card questcard"><div class="qhead"><h2>Daily quests</h2><span class="note">New in '+(mins>=60?Math.floor(mins/60)+' h '+(mins%60)+' min':mins+' min')+'</span></div><div id="questList">'+questsHTML(false)+'</div>'+
  (S.freeze>0?'<p class="note fz">'+SNOW+' '+S.freeze+' streak freeze'+(S.freeze===1?'':'s')+' ready. If you miss a day, one is used automatically.</p>':'')+'</div>'}
var QBUSY=false;
function qProg(k,v){var q=quests(),changed=false;q.list.forEach(function(it){if(it.k!==k||it.done)return;changed=true;if(k==='run')it.p=Math.max(it.p,v);else it.p+=v;
  if(it.p>=it.n){it.p=it.n;it.done=true;save();toast(QICON.check,'Quest complete',qText(it)+' · +10 XP','quest');addXP(10)}});
 if(!q.chest&&q.list.every(function(it){return it.done})){q.chest=true;S.st.chests++;var fz=S.freeze<2;if(fz)S.freeze++;save();if(P)P.chestNow=fz?2:1;if(!(P&&P.quiet)){toast(CHEST,'Daily chest!','+30 XP'+(fz?' and a streak freeze':''),'badge');confetti()}addXP(30);updHeader();changed=true}
 if(changed){save();if($('questList'))$('questList').innerHTML=questsHTML(false)}}
var SIMQ=0;function motSimTime(dt){SIMQ+=dt;if(SIMQ>=5){qProg('sim',SIMQ);SIMQ=0}}

/* ----- badges ----- */
function bdg(id,ic,name,desc,prog,col){return {id:id,ic:ic,name:name,desc:desc,prog:prog,col:col||'var(--accent)'}}
function BADGES(){var dc=doneCount('all'),st=S.st,a=[
 bdg('first','🎓','Day one','Finish your first lesson',function(){return [dc,1]},'#7F77DD'),
 bdg('ten','📘','Ten down','Finish 10 lessons',function(){return [dc,10]},'#378ADD'),
 bdg('half','🏗️','Halfway built','Finish 26 lessons',function(){return [dc,26]},'#BA7517'),
 bdg('all','🏭','Station complete','Finish every lesson, Maths and Theory',function(){return [dc,allLessons('all').length]},'#1D9E75')];
 UNITS.forEach(function(u,ui){a.push(bdg('u'+ui,'<span class="uib">'+u.icon+'</span>','Qualified: '+u.title,'Finish every lesson in '+uLabel(ui),function(){var x=unitFrac(ui);return [x.d,x.n]},u.color))});
 a=a.concat([
 bdg('perfect1','💯','Perfectionist','Finish a lesson with no mistakes',function(){return [st.perfect,1]},'#D4537E'),
 bdg('perfect10','🌟','Flawless ten','Finish 10 lessons with no mistakes',function(){return [st.perfect,10]},'#EF9F27'),
 bdg('combo5','🔥','On a roll','Get 5 right to master it',function(){return [st.best,5]},'#D85A30'),
 bdg('combo10','⚡','Supercritical','Get 10 right to master it',function(){return [st.best,10]},'#7F77DD'),
 bdg('combo20','⚛️','Chain reaction','Get 20 right to master it',function(){return [st.best,20]},'#534AB7'),
 bdg('streak3','📅','Regular','Reach a 3-day streak',function(){return [st.maxStreak,3]},'#e8742a'),
 bdg('streak7','🗓️','A week on shift','Reach a 7-day streak',function(){return [st.maxStreak,7]},'#e8742a'),
 bdg('streak30','🏆','Month of shifts','Reach a 30-day streak',function(){return [st.maxStreak,30]},'#BA7517'),
 bdg('xp1000','💡','1,000 XP','Earn 1,000 XP',function(){return [S.xp,1000]},'#EF9F27'),
 bdg('xp5000','🔆','5,000 XP','Earn 5,000 XP',function(){return [S.xp,5000]},'#BA7517'),
 bdg('review5','🔁','Revision habit','Complete 5 reviews',function(){return [st.reviews,5]},'#1D9E75'),
 bdg('fix10','🛠️','Mistake fixer','Fix 10 mistakes in review',function(){return [st.fixed,10]},'#5F7A8C'),
 bdg('chest1','🎁','Quest complete','Finish all daily quests in one day',function(){return [st.chests,1]},'#BA7517'),
 bdg('chest7','🧭','Quest master','Finish all daily quests on 7 days',function(){return [st.chests,7]},'#1f8fb3'),
 bdg('fu1','🧗','Back on track','Pass a follow-up you needed',function(){return [st.fuFixed,1]},'#1D9E75'),
 bdg('fu10','➕','Extra mile','Complete 10 follow-up practices',function(){var n=0;for(var k in S.fu)if(S.fu[k].n)n++;return [n,10]},'#378ADD'),
 bdg('test1','📝','Test passed','Pass a unit test',function(){var n=0;for(var k in S.tests)if(S.tests[k].passed)n++;return [n,1]},'#7F77DD'),
 bdg('test100','🥇','Full marks','Score 100% on a unit test',function(){var b=0;for(var k in S.tests)b=Math.max(b,S.tests[k].best||0);return [b===100?1:0,1]},'#EF9F27'),
 bdg('testall','🎖️','Fully qualified','Pass all 10 unit tests',function(){var n=0;for(var k in S.tests)if(S.tests[k].passed)n++;return [n,UNITS.length]},'#534AB7'),
 bdg('m1','🎛️','First criticality','Pass control room mission 1',function(){return [S.missions.m1?1:0,1]},'#D85A30'),
 bdg('m2','📈','Power ascension','Pass control room mission 2',function(){return [S.missions.m2?1:0,1]},'#D85A30'),
 bdg('m3','🧪','Xenon tamer','Pass control room mission 3',function(){return [S.missions.m3?1:0,1]},'#D85A30'),
 bdg('m4','⏱️','Beat the xenon','Pass control room mission 4',function(){return [S.missions.m4?1:0,1]},'#D85A30')]);return a}
function checkBadges(quiet){var nw=[];BADGES().forEach(function(b){if(S.badges[b.id])return;var p=b.prog();if(p[0]>=p[1]){S.badges[b.id]=today();nw.push(b)}});
 if(nw.length){save();if(P&&P.newBadges)P.newBadges=P.newBadges.concat(nw);
  if(!quiet){nw.forEach(function(b){toast('<span class="tb" style="background:'+b.col+'">'+b.ic+'</span>','Badge earned: '+b.name,b.desc,'badge')});try{confetti()}catch(e){}}}return nw}
