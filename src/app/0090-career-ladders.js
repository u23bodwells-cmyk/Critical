/* ===== Career ladders: seven routes through a nuclear station. Chief Nuclear Officer needs everything. ===== */
var LAD=(function(){
 var SR_TOTAL=32;
 function J(k){try{return JSON.parse(localStorage.getItem(k)||'null')||{}}catch(e){return {}}}
 function trackDone(t){var d=0,n=0;UNITS.forEach(function(u,ui){if(trk(ui)!==t)return;u.lessons.forEach(function(l){n++;if(S.done[l.id])d++})});return [d,n]}
 function data(){var th=trackDone('theory'),ma=trackDone('maths'),ca=trackDone('calc'),gp=trackDone('gp'),gc=trackDone('gc'),gm=trackDone('gm'),gcs=trackDone('gcs'),
   sr=J('shift-ready-v1'),ap=J('aptitude-v1'),st=J('critical_study'),sra=sr.arc||{},apa=ap.arc||{},ans=0,mins=0,k;
  for(k in (ap.sec||{}))ans+=(ap.sec[k]&&ap.sec[k].n)||0;(st.sessions||[]).forEach(function(s){mins+=+s.m||0});
  var B=BADGES(),bg=B.filter(function(b){return S.badges[b.id]}).length;
  return {xp:S.xp,th:th[0],thN:th[1],sci:ma[0]+ca[0],sciN:ma[1]+ca[1],gc:gp[0]+gc[0]+gm[0]+gcs[0],gcN:gp[1]+gc[1]+gm[1]+gcs[1],
   srDone:Object.keys(sr.done||{}).length,srBoss:Object.keys(sra.boss||{}).length,srA:(sra.miss||{}).best==='A*'?1:0,
   apAns:ans,apBoss:Object.keys(apa.boss||{}).length,apA:(apa.miss||{}).best==='A*'?1:0,
   streak:Math.max(S.st.maxStreak||0,streakNow()),hours:Math.floor(mins/60),mis:Object.keys(S.missions||{}).length,misN:MISSIONS.length,bg:bg,bgN:B.length}}
 function L(t,v,n){return {t:t,v:v,n:n}}
 var LIST=[
  {id:'ops',name:'Operations',col:'#1f8fb3',ic:'🎛️',p:'The classic route: earn XP to climb from visitor to station director, then on to fusion and beyond.',
   rungs:function(D){return LEVELS.map(function(l,i){return {n:l[1],i:RANK_INFO[i],req:i?[L('XP',D.xp,l[0])]:[]}})}},
  {id:'eng',name:'Reactor engineering',col:'#D85A30',ic:'⚛️',p:'Finish Theory lessons to rise through reactor engineering.',
   rungs:function(D){var N=D.thN;return [['Engineering student',0,'You\'ve picked engineering. The reactor is the thing to understand.'],['Graduate engineer',10,'You know what fission, fuel and the core actually do.'],['Systems engineer',25,'You can follow the primary circuit and the turbine from end to end.'],['Reactor physicist',45,'Neutrons, reactivity and xenon make sense to you.'],['Safety case engineer',65,'You can explain why the plant is safe, and prove it.'],['Lead reactor engineer',85,'Severe accidents and safety analysis are your daily work.'],['Chief engineer',N,'Every Theory lesson, done. The station\'s engineering is in your hands.']].map(function(r,i){return {n:r[0],i:r[2],req:i?[L('Theory lessons',D.th,Math.min(r[1],N))]:[]}})}},
  {id:'sci',name:'Maths and calculus',col:'#534AB7',ic:'📐',p:'Finish Maths and Calculus lessons to become the station\'s chief scientist.',
   rungs:function(D){var N=D.sciN;return [['Number cruncher',0,'Every reading in the control room is a number. Start here.'],['Data technician',15,'You can handle the numbers the plant throws at you.'],['Performance engineer',40,'Efficiencies, rates and trends are your thing.'],['Reactor analyst',70,'You model what the core will do next.'],['Senior analyst',105,'Calculus is a tool you reach for without thinking.'],['Lead scientist',140,'The hardest maths on site comes to you.'],['Chief scientist',N,'Every Maths and Calculus lesson, done.']].map(function(r,i){return {n:r[0],i:r[2],req:i?[L('Maths and Calculus lessons',D.sci,Math.min(r[1],N))]:[]}})}},
  {id:'gcse',name:'GCSE subjects',col:'#1D9E75',ic:'🧪',p:'Finish GCSE Physics, Chemistry, Maths and Computer Science lessons, the grades your A-levels and apprenticeship build on.',
   rungs:function(D){var N=D.gcN;return [['Year 10 student',0,'Two years to the exams. Every lesson now counts.'],['On track',10,'You\'re in the habit of doing GCSE work every week.'],['Strong foundations',30,'The basics of all three subjects are solid.'],['Top set',60,'You\'re working at the level the best grades need.'],['Exam ready',90,'You could sit most of the papers tomorrow.'],['Grade 9 hunter',120,'Only the hardest topics are left.'],['GCSEs mastered',N,'Every GCSE lesson in Physics, Chemistry, Maths and Computer Science, done.']].map(function(r,i){return {n:r[0],i:r[2],req:i?[L('GCSE lessons',D.gc,Math.min(r[1],N))]:[]}})}},
  {id:'app',name:'Apprenticeship route',col:'#BA7517',ic:'🏗️',p:'Shift Ready and Aptitude Gym: the skills employers test, from application to degree apprentice.',
   rungs:function(D){return [
    {n:'Applicant',i:'You want a place on the nuclear apprenticeship. Time to prove it.',req:[]},
    {n:'Application sent',i:'You\'ve started building the skills they look for.',req:[L('Shift Ready sessions',D.srDone,4)]},
    {n:'Online tests',i:'Aptitude tests are the first hurdle, and you\'re practising for them.',req:[L('Aptitude questions answered',D.apAns,100)]},
    {n:'Assessment centre',i:'Group tasks, tests and talking. You\'re ready for the day.',req:[L('Shift Ready sessions',D.srDone,12),L('Aptitude bosses beaten',D.apBoss,2)]},
    {n:'Interview',i:'You can talk about your code, your comms and why you want this.',req:[L('Shift Ready sessions',D.srDone,20),L('Aptitude bosses beaten',D.apBoss,5),L('Shift Ready bosses beaten',D.srBoss,2)]},
    {n:'Offer letter',i:'They want you. Every session and every boss, done.',req:[L('Shift Ready sessions',D.srDone,SR_TOTAL),L('Aptitude bosses beaten',D.apBoss,6),L('Shift Ready bosses beaten',D.srBoss,4)]},
    {n:'Degree apprentice',i:'A* on both night shifts. You\'re ready for a nuclear degree apprenticeship.',req:[L('Shift Ready sessions',D.srDone,SR_TOTAL),L('Aptitude bosses beaten',D.apBoss,6),L('Shift Ready bosses beaten',D.srBoss,4),L('A* on the Aptitude night shift',D.apA,1),L('A* on the Shift Ready night shift',D.srA,1)]}]}},
  {id:'hab',name:'Reliability',col:'#e8742a',ic:'🔥',p:'Operators are trusted because they turn up, every shift. Build your streak and your study hours.',
   rungs:function(D){return [['Turns up',0,0,'Everyone starts somewhere. Show up tomorrow.'],['Regular',3,0,'Three days in a row. It\'s becoming a habit.'],['Reliable',7,5,'A full week, and real hours on the timer.'],['Dependable',14,15,'Two weeks without missing a shift.'],['Rock solid',30,40,'A month of shifts. People can count on you.'],['Never misses a shift',60,80,'Two months straight. That\'s rare.'],['Iron discipline',100,150,'A hundred days and 150 hours. Nothing stops you.']].map(function(r,i){var q=[];if(r[1])q.push(L('Best day streak',D.streak,r[1]));if(r[2])q.push(L('Hours on the study timer',D.hours,r[2]));return {n:r[0],i:r[3],req:q}})}}];
 var CNO={id:'cno',name:'Chief Nuclear Officer',col:'#c9a227',ic:'👑',p:'The top job. Reach the top of every other ladder, pass every mission and earn every badge. Everything.'};
 function rungs(l,D){if(l.id!=='cno')return l.rungs(D);var t=topped(D);
  return [['Ambitious',0,'You\'ve seen the top job. Now go and get it.'],['Ladder climber',1,'One ladder done. Six to go.'],['Head of department',2,'Two routes mastered. People notice.'],['Deputy site director',3,'Half the station answers to you.'],['Site director',4,'You run the site.'],['Fleet director',5,'Every station in the fleet looks to you.']].map(function(r,i){return {n:r[0],i:r[2],req:i?[L('Ladders topped',t,r[1])]:[]}}).concat([{n:'Chief Nuclear Officer',i:'You did everything. Every lesson, every ladder, every mission, every badge.',req:[L('Ladders topped',t,LIST.length),L('Control room missions passed',D.mis,D.misN),L('Badges earned',D.bg,D.bgN)]}])}
 function met(r){return r.req.every(function(q){return q.v>=q.n})}
 function at(l,D){var R=rungs(l,D),i=0;while(i<R.length-1&&met(R[i+1]))i++;return {i:i,R:R}}
 function topped(D){return LIST.filter(function(l){var R=l.rungs(D);return met(R[R.length-1])}).length}
 function all(){return LIST.concat([CNO])}
 /* everything, as one percentage */
 function everything(D){var R=rungs(CNO,D),top=R[R.length-1],parts=[];LIST.forEach(function(l){var r=l.rungs(D),last=r[r.length-1];last.req.forEach(function(q){parts.push({t:l.name+': '+q.t,v:q.v,n:q.n})})});
  top.req.slice(1).forEach(function(q){parts.push(q)});var f=parts.reduce(function(a,q){return a+Math.min(1,q.v/q.n)},0)/parts.length;return {parts:parts,pct:Math.floor(f*100)}}
 function emblem(l,i,n,size){size=size||44;var top=i===n-1,c=top?'#c9a227':l.col,f=n>1?i/(n-1):1,r=size/2-3,C=2*Math.PI*r;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+c+'" stroke-opacity=".22" stroke-width="4"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+(C*f).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+(r-6)+'" fill="'+c+'"/>'+(top?'<path d="M'+(size/2)+' '+(size/2-8)+'l2.4 5 5.4.6-4 3.6 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.6 5.4-.6z" fill="#fff"/>':'<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="'+(size*.36)+'" font-weight="800" fill="#fff" font-family="var(--mono,monospace)">'+(i+1)+'</text>')+'</svg>'}
 function sel(){var v=null;try{v=localStorage.getItem('critical_ladder')}catch(e){}return all().some(function(l){return l.id===v})?v:'ops'}
 function reqHTML(q){var f=Math.min(1,q.v/q.n);return '<div class="ladreq"><div class="lrt"><span>'+q.t+'</span><b>'+fmtInt(Math.min(q.v,q.n))+'/'+fmtInt(q.n)+'</b></div><div class="lvlbar"><div style="width:'+(f*100)+'%"></div></div></div>'}
 function card(){var D=data(),s=sel(),L0=all().filter(function(l){return l.id===s})[0],a=at(L0,D),R=a.R,tp=topped(D);
  var h='<div class="card" id="ladCard"><h2>Career ladders <span class="note" style="font-weight:400">'+tp+' of '+LIST.length+' topped</span></h2><p class="note" style="font-size:15px">Seven routes through a nuclear station. Each one tracks a different part of your work. Top all six to go for Chief Nuclear Officer.</p><div class="ladtabs" role="tablist">';
  all().forEach(function(l){var x=at(l,D);h+='<button type="button" role="tab" class="ladtab'+(l.id===s?' on':'')+(l.id==='cno'?' cno':'')+'" data-lad="'+l.id+'" aria-selected="'+(l.id===s)+'"><span class="li">'+l.ic+'</span><span class="ln">'+l.name+'</span><span class="lp">'+(x.i+1)+'/'+x.R.length+'</span></button>'});
  h+='</div><div class="ladbody" style="--lc:'+(L0.id==='cno'?'#c9a227':L0.col)+'"><p class="ladp">'+L0.p+'</p>';
  if(L0.id==='cno'){var E=everything(D);h+='<div class="ladall"><div class="lrt"><span>Everything done</span><b>'+E.pct+'%</b></div><div class="lvlbar gold"><div style="width:'+E.pct+'%"></div></div><details><summary>See everything that\'s left</summary><div class="ladlist">'+E.parts.map(function(q){var ok=q.v>=q.n;return '<div class="'+(ok?'ok':'')+'"><span>'+(ok?'✓':'○')+'</span><span>'+q.t+'</span><b>'+fmtInt(Math.min(q.v,q.n))+'/'+fmtInt(q.n)+'</b></div>'}).join('')+'</div></details></div>'}
  h+='<ol class="ladder">'+R.map(function(r,i){var cur=i===a.i,dn=i<a.i,nx=i===a.i+1;return '<li class="'+(cur?'cur':dn?'done':'')+'">'+(L0.id==='ops'?rankEmblem(i,44):emblem(L0,i,R.length,44))+'<div class="lb"><div><b>'+r.n+'</b>'+(r.req.length===1&&!cur?' <span class="note">'+fmtInt(r.req[0].n)+' '+(L0.id==='ops'?'XP':r.req[0].t)+'</span>':'')+(cur?' <span class="youare">You are here</span>':'')+'</div><p>'+r.i+'</p>'+(nx?'<div class="ladnext"><span class="note">To get here:</span>'+r.req.map(reqHTML).join('')+'</div>':'')+'</div></li>'}).join('')+'</ol></div></div>';
  return h}
 function wire(){var c=document.getElementById('ladCard');if(!c)return;[].forEach.call(c.querySelectorAll('[data-lad]'),function(b){b.onclick=function(){try{localStorage.setItem('critical_ladder',b.getAttribute('data-lad'))}catch(e){}var y=window.scrollY,n=document.createElement('div');n.innerHTML=card();c.replaceWith(n.firstChild);wire();window.scrollTo(0,y);var t=document.querySelector('#ladCard [data-lad="'+b.getAttribute('data-lad')+'"]');if(t)t.focus({preventScroll:true})}})}
 /* promotions: a toast when you climb a rung on any ladder */
 var pend=[];
 function check(){var D;try{D=data()}catch(e){return}if(!S.lad||typeof S.lad!=='object'){S.lad={};all().forEach(function(l){S.lad[l.id]=at(l,D).i});save();return}
  var ch=false;all().forEach(function(l){var x=at(l,D),was=S.lad[l.id];if(was==null){S.lad[l.id]=x.i;ch=true;return}if(x.i>was){S.lad[l.id]=x.i;ch=true;pend.push([l,x.R[x.i],x.i,x.R.length]);if(!S.ladLog)S.ladLog=[];S.ladLog.push({d:today(),id:l.id,n:x.R[x.i].n});if(S.ladLog.length>60)S.ladLog=S.ladLog.slice(-60)}});
  if(ch)save();if(pend.length&&!(P&&P.quiet)){pend.splice(0).forEach(function(p){var l=p[0];toast(l.id==='ops'?rankEmblem(p[2],36):emblem(l,p[2],p[3],36),'Promoted: '+p[1].n,l.name+' ladder','level')})}}
 return {card:card,wire:wire,check:check,data:data,at:at,all:all,everything:everything,topped:topped}})();
(function(){var cb=checkBadges;checkBadges=function(q){var r=cb(q);try{LAD.check()}catch(e){}return r}})();
setInterval(function(){try{LAD.check()}catch(e){}},30000);
try{window.LAD=LAD}catch(e){}
function badgeTile(b,earned){var p=b.prog(),f=Math.min(1,p[0]/p[1]);return '<div class="badge'+(earned?' got':'')+'"><div class="bic" style="'+(earned?'background:'+b.col:'')+'">'+b.ic+'</div><div class="bn">'+b.name+'</div><div class="bd">'+b.desc+'</div>'+(earned?'<div class="bdate">Earned '+niceDay(S.badges[b.id])+'</div>':'<div class="bbar"><div style="width:'+(f*100)+'%"></div></div><div class="bdate">'+Math.min(p[0],p[1])+'/'+p[1]+'</div>')+'</div>'}
function niceDay(s){var d=dayDiff(s,today());if(d<=0)return 'today';if(d===1)return 'yesterday';var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}

/* ----- toasts and level-up ----- */
var TQ=[],TBUSY=false;
function toast(icon,title,sub,snd){if(P&&P.quiet)return;TQ.push([icon,title,sub,snd]);if(TQ.length>4)TQ.splice(0,TQ.length-4);if(!TBUSY)nextToast()}
function nextToast(){var x=TQ.shift(),box=$('toasts');if(!x||!box){TBUSY=false;return}TBUSY=true;var t=el('div','toast','<span class="ti">'+x[0]+'</span><div><b>'+x[1]+'</b>'+(x[2]?'<span>'+x[2]+'</span>':'')+'</div>',box);if(x[3])sfx(x[3]);
 requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('in')})});setTimeout(function(){t.classList.remove('in');setTimeout(function(){t.remove();nextToast()},320)},2300)}
function queueLevelUp(i){if(P)P.levelUp=Math.max(P.levelUp==null?-1:P.levelUp,i);else setTimeout(function(){showLevelUp(i)},300)}
function rankEmblem(i,size){size=size||96;var c=['#9a988f','#7F77DD','#378ADD','#1D9E75','#1f8fb3','#D85A30','#D4537E','#BA7517','#534AB7','#e8742a','#0f9d8a','#2563eb','#7c3aed','#c026d3','#db2777','#0891b2','#4f46e5','#9333ea','#b45309','#e11d48'][i]||'#7F77DD',hi=i>=10;
 function star(x,y,r){var p=[];for(var k=0;k<10;k++){var a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;p.push((x+Math.cos(a)*rr).toFixed(1)+','+(y+Math.sin(a)*rr).toFixed(1))}return '<polygon points="'+p.join(' ')+'" fill="#ffe08a"/>'}
 var s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100"><path d="M50 4 88 20v28c0 24-16 40-38 48C28 88 12 72 12 48V20z" fill="'+c+'"'+(hi?' stroke="#f5c542" stroke-width="5" stroke-linejoin="round"':'')+'/><path d="M50 14 79 26v22c0 18-12 31-29 38-17-7-29-20-29-38V26z" fill="#fff" fill-opacity=".18"/>';
 if(!hi){for(var k=0;k<=i;k++){var row=Math.floor(k/5),col=k%5,n=Math.min(5,i+1-row*5);s+='<circle cx="'+(50+(col-(n-1)/2)*11)+'" cy="'+(i>=5?75-row*10:70)+'" r="3.4" fill="#fff"/>'}}
 else{var ns=i-9,r1=Math.min(5,ns),r2=ns-r1,y1=r2?67:72;for(var a=0;a<r1;a++)s+=star(50+(a-(r1-1)/2)*10,y1,4.6);for(var b=0;b<r2;b++)s+=star(50+(b-(r2-1)/2)*10,79,4.6);s+='<path d="M38 24 40.5 13l5 5L50 10l4.5 8 5-5L62 24z" fill="#f5c542"/>'}
 return s+'<text x="50" y="'+(hi?56:i>=5?53:52)+'" text-anchor="middle" font-size="'+(i>=9?24:i>=5?27:30)+'" font-weight="800" fill="#fff" font-family="system-ui">'+(i+1)+'</text></svg>'}
function showLevelUp(i){var m=$('modal');if(!m)return;var nx=LEVELS[i+1];
 m.innerHTML='<div class="mcard" role="dialog" aria-modal="true" aria-labelledby="mTitle"><div class="memb">'+rankEmblem(i,110)+'</div><p class="mkick">Promotion!</p><h2 id="mTitle">You\'re now '+(/^[AEIOU]/.test(LEVELS[i][1])?'an ':'a ')+LEVELS[i][1]+'</h2><p>'+RANK_INFO[i]+'</p>'+(nx?'<p class="note">Next rank: <b>'+nx[1]+'</b> at '+fmtInt(nx[0])+' XP</p>':'<p class="note">That\'s the top rank. Brilliant work.</p>')+'<button class="big" id="mOk">Continue</button></div>';
 m.classList.add('open');sfx('level');confetti();$('mOk').focus();$('mOk').onclick=function(){m.classList.remove('open');m.innerHTML=''}}

/* ----- sound ----- */
var AC=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}if(AC&&AC.state==='suspended'){try{AC.resume()}catch(e){}}return AC}
function beep(f,t0,d,type,vol){var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+t0;o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+0.05)}catch(e){}}
var SFX={right:[[660,0,.12],[990,.08,.2]],combo:[[660,0,.1],[880,.07,.1],[1320,.14,.24]],wrong:[[392,0,.13,'sine',.03],[330,.1,.22,'sine',.03]],done:[[523,0,.16],[659,.12,.16],[784,.24,.16],[1047,.36,.4]],quest:[[880,0,.1],[1175,.09,.22]],badge:[[784,0,.12],[988,.1,.12],[1319,.2,.34]],level:[[392,0,.16],[523,.15,.16],[659,.3,.16],[784,.45,.3],[1047,.62,.6]]};
function sfx(k){if(S.sound===false)return;(SFX[k]||[]).forEach(function(n){beep(n[0],n[1],n[2],n[3],n[4]||(n[3]==='triangle'?0.07:0.08))})}
var SPK_ON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
var SPK_OFF='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/></svg>';
function soundBtnUpd(){var b=$('pSound');if(b){b.innerHTML=S.sound===false?SPK_OFF:SPK_ON;b.setAttribute('aria-label',S.sound===false?'Turn sound on':'Turn sound off');b.title=b.getAttribute('aria-label')}}
function toggleSound(){S.sound=S.sound===false;save();soundBtnUpd();if(S.sound)sfx('right')}

/* ----- in-lesson combos and mistakes ----- */
function cardKey(c){if(c&&c._auto)return null;if(c&&c._key)return c._key;if(P.mode==='lesson')return UNITS[P.ui].lessons[P.li].id+'#'+P.i;return c._key||null}
function gotRight(c){var first=!P.st.tries;
 if(first){if(P.rev)try{REV.mark(c,true)}catch(_){}EASE.rightHook();P.right++;if('QNO'.indexOf(c.t)>=0)P.qr=(P.qr||0)+1;P.combo++;P.best=Math.max(P.best,P.combo);if(P.combo>S.st.best)S.st.best=P.combo;S.st.right++;var cb=P.combo>=3?Math.min(5,P.combo-1):0;P.cbonus+=cb;award(10+cb);
  var k=cardKey(c);if(P.mode==='review'&&k&&S.wrong[k]){delete S.wrong[k];S.st.fixed++;P.fixed++;save();qProg('fix',1)}
  qProg('right',1);qProg('run',P.combo);sfx(P.combo>=3?'combo':'right')}
 else{award(5);sfx('right')}
 showCombo(true)}
function gotWrong(c){if(P&&P.rev)try{REV.mark(c,false)}catch(_){}P.combo=0;P.mistakes++;showCombo(false);sfx('wrong');EASE.wrongHook(c);if('QNO'.indexOf(c.t)>=0){var k=cardKey(c);if(k){S.wrong[k]=1;save()}}}
function showCombo(up){var e=$('pCombo');if(!e)return;if(P.combo>=2){e.innerHTML=FLAME+'<b>'+P.combo+'</b>';e.className='pcombo show'+(up?' pop':'');if(up){void e.offsetWidth;e.classList.add('pop')}}else e.className='pcombo'}
function comboPraise(){if(!P||P.combo<3)return null;if(P.combo===20)return 'Chain reaction! 20 in a row!';if(P.combo===10)return 'Supercritical! 10 in a row!';if(P.combo===5)return 'On a roll! 5 in a row!';return P.combo+' in a row!'}
