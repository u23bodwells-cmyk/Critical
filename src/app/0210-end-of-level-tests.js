/* ===== end-of-level test for every track and level ===== */
var LVT_PASS=75;
function lvtKey(m,lv){return m+lv}
function lvtRec(m,lv){S.lvtests=S.lvtests||{};return S.lvtests[lvtKey(m,lv)]||null}
function lvtOpen(m,lv){var us=goalUnits(m,lv);return us.length>0&&us.every(unitDone)}
function lvtPassed(m,lv){var r=lvtRec(m,lv);return !!(r&&r.passed)}
function lvtCards(m,lv){var us=goalUnits(m,lv),per=us.length>=8?3:5,out=[];
 us.forEach(function(ui){var u=UNITS[ui],pool=(TESTS[u.id]||[]).filter(function(c){return c.t==='Q'||c.t==='N'||c.t==='O'}),ex=[];
  u.lessons.forEach(function(l){l.cards.forEach(function(c){if(c.t==='Q'||c.t==='N'){var cc=Object.assign({},c);cc._lid=l.id;ex.push(cc)}})});
  var pick=shuffle(pool).slice(0,per-1).concat(shuffle(ex).slice(0,1));if(pick.length<per)pick=pick.concat(shuffle(ex).slice(1,1+per-pick.length));
  pick.forEach(function(c){var cc=Object.assign({},c);cc._u=ui;out.push(cc)})});
 return shuffle(out)}
function lvtMins(n){return Math.max(20,Math.round(n*1.1/5)*5)}
function startLevelTest(m,lv){if(!lvtOpen(m,lv)){toast(LOCK,'Level test locked','Finish every lesson in Level '+lv+' first.');return}
 var cards=lvtCards(m,lv),g=GOALS[goalKey(m,lv)];
 P={mode:'test',lvt:{m:m,lv:lv,mins:lvtMins(cards.length)},ui:goalUnits(m,lv)[0],cards:cards,i:0,xp:0,right:0,asked:0,title:'Level '+lv+' test',color:'#534AB7',unit:'Level '+lv+' test · '+modeName(m),answers:[],t0:Date.now(),combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer();startTimer()}
(function(){
 var _ut=updTimer;updTimer=function(){if(P&&P.lvt&&P.mode==='test'){var s=Math.floor((Date.now()-P.t0)/1000);$('pXP').innerHTML='<span class="ttime'+(s>P.lvt.mins*60?' over':'')+'">'+fmtClock(s)+' / '+P.lvt.mins+':00</span>';return}return _ut.apply(this,arguments)};
 var _ft=finishTest;finishTest=function(){if(!P||!P.lvt)return _ft.apply(this,arguments);
  P.finished=true;P.quiet=true;stopTimer();$('pBar').style.width='100%';
  var m=P.lvt.m,lv=P.lvt.lv,g=GOALS[goalKey(m,lv)],n=P.answers.length,ok=P.answers.filter(function(a){return a.ok}).length,pct=Math.round(ok/n*100),secs=Math.round((Date.now()-P.t0)/1000),pass=pct>=LVT_PASS,prev=lvtRec(m,lv)||{},firstPass=pass&&!prev.passed,lines=[];
  S.lvtests=S.lvtests||{};S.lvtests[lvtKey(m,lv)]={best:Math.max(prev.best||0,pct),passed:!!prev.passed||pass,n:(prev.n||0)+1,last:today(),lastPct:pct};save();
  if(ok){lines.push(['Correct answers ('+ok+' × 5)',ok*5]);bonusXP(ok*5)}if(firstPass){lines.push(['Level complete bonus',100]);bonusXP(100)}if(pct===100){lines.push(['Full marks',50]);bonusXP(50)}
  save();try{checkBadges(true)}catch(_){}
  var byU={};P.answers.forEach(function(a){var k=a.c._u;if(k==null)return;byU[k]=byU[k]||[0,0];byU[k][1]++;if(a.ok)byU[k][0]++});
  var r=48,C=2*Math.PI*r,col=pass?'var(--good-line)':'#e8742a';
  var h='<div class="done-screen"><svg width="120" height="120" viewBox="0 0 120 120" class="dicon"><circle cx="60" cy="60" r="'+r+'" fill="none" stroke="var(--soft2)" stroke-width="11"/><circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(C*pct/100)+' '+C+'" transform="rotate(-90 60 60)"/><text x="60" y="60" text-anchor="middle" dy=".35em" font-size="26" font-weight="800" fill="var(--text)" font-family="system-ui">'+pct+'%</text></svg>'+
   '<h2>'+(pass?'Level '+lv+' complete!':'Not passed yet')+'</h2><p class="note" style="font-size:16px">Level '+lv+' test · '+modeName(m)+(pass?'':' · pass mark '+LVT_PASS+'%')+'</p>'+
   (pass&&g?'<div class="dblock qual lvtcert"><div class="dbt">'+g.icon+' '+g.final+'</div><p class="note">You\'ve finished the goal for this level: '+g.title.charAt(0).toLowerCase()+g.title.slice(1)+'.'+(lv<5?' Level '+(lv+1)+' is open.':' That\'s the whole '+modeName(m)+' track!')+'</p></div>':'')+
   '<div class="done-stats"><div class="dstat"><b>'+ok+'/'+n+'</b><span>correct</span></div><div class="dstat"><b>'+fmtClock(secs)+'</b><span>time (target '+P.lvt.mins+':00)</span></div><div class="dstat"><b>'+S.lvtests[lvtKey(m,lv)].best+'%</b><span>best score</span></div></div>';
  if(lines.length)h+='<div class="xpbreak">'+lines.map(function(l){return '<div><span>'+l[0]+'</span><b>+'+l[1]+'</b></div>'}).join('')+'<div><span>Total</span><b id="dsXP">+0</b></div></div>';
  h+='<div class="dblock"><div class="dbt">How you did in each unit</div>'+goalUnits(m,lv).map(function(ui){var s=byU[ui]||[0,0],f=s[1]?s[0]/s[1]:0,u=UNITS[ui],weak=f<0.6;
   return '<div class="lvtu"><span class="lvtn">'+uNum(ui)+'</span><div class="lvtb"><b>'+u.title+'</b><div class="gbar"><div style="width:'+(f*100)+'%;background:'+(weak?'#e8742a':u.color)+'"></div></div></div><span class="lvts">'+s[0]+'/'+s[1]+'</span>'+(weak?'<button class="ghost sm" data-lvu="'+ui+'">Revise</button>':'')+'</div>'}).join('')+'<p class="note">Orange units scored under 60%. "Revise" opens that unit\'s test, which is a good way to practise it.</p></div>';
  h+='<div class="treview"><div class="dbt">Your answers</div>'+P.answers.map(function(a,i){return '<details class="tq '+(a.ok?'ok':'no')+'"'+(a.ok?'':' open')+'><summary><span class="tqn">'+(i+1)+'</span><span class="tqm">'+(a.ok?'✓':'✗')+'</span><span class="tqp">'+a.c.p+'</span></summary><div class="tqb"><p><b>Your answer:</b> '+a.given+'</p>'+(a.ok?'':'<p><b>Correct answer:</b> '+a.correct+'</p>')+(a.c.e?'<p class="note">'+a.c.e+'</p>':'')+'</div></details>'}).join('')+'</div>';
  $('pBody').innerHTML=h+'</div>';$('pScroll').scrollTop=0;$('pXP').innerHTML='<span class="ttime">'+fmtClock(secs)+'</span>';if($('dsXP'))countUp($('dsXP'),0,P.xp,'+');
  [].forEach.call(document.querySelectorAll('[data-lvu]'),function(b){b.onclick=function(){var ui=+b.dataset.lvu;closePlayer();startTest(ui)}});
  if(pass&&lv<5){S.lvlOpen=S.lvlOpen||{};S.lvlOpen[m+(lv+1)]=1;save()}
  if(pass)try{confetti()}catch(_){}
  foot('','','');skipBtn(null);mainBtn('Done',function(){closePlayer()})};
 /* the card on the Learn page */
 var _rl=renderLearn;renderLearn=function(){var out=_rl.apply(this,arguments);try{var m=curMode(),lv=curLevel(m),el=$('page-learn'),us=goalUnits(m,lv),ug=el&&el.querySelector('.units');if(!ug||!us.length)return out;
   var done=0,tot=0;us.forEach(function(ui){UNITS[ui].lessons.forEach(function(l){tot++;if(S.done[l.id])done++})});
   var open=lvtOpen(m,lv),rec=lvtRec(m,lv),g=GOALS[goalKey(m,lv)],n=us.length*(us.length>=8?3:5);
   var c=document.createElement('div');c.className='card lvtcard'+(open?'':' locked')+(rec&&rec.passed?' passed':'');
   c.innerHTML='<div class="lvth"><span class="lvti">'+(rec&&rec.passed?'🏅':open?'📝':'🔒')+'</span><div><div class="gkick">End of level · '+modeName(m)+'</div><h2>Level '+lv+' test</h2></div></div>'+
    '<p class="note">'+n+' questions covering every unit in Level '+lv+', about '+lvtMins(n)+' minutes. Pass with '+LVT_PASS+'%'+(g?' to complete your goal: <b>'+g.final+'</b>':'')+'.</p>'+
    '<details class="lvtsum"'+(open&&!(rec&&rec.passed)?' open':'')+'><summary>What you should know by now</summary><ul>'+us.map(function(ui){var u=UNITS[ui];return '<li><b>'+u.title+'</b>: '+u.desc+'</li>'}).join('')+'</ul></details>'+
    (rec?'<p class="note">Best score: <b>'+rec.best+'%</b>'+(rec.passed?' · passed ✓':'')+'</p>':'')+
    (open?'<button class="wbtn pri lvtgo" type="button">'+(rec?'Take it again':'Start the level test')+'</button>':'<p class="note"><b>'+done+' of '+tot+'</b> lessons done. Finish them all to unlock.</p><div class="gbar"><div style="width:'+(tot?done/tot*100:0)+'%;background:var(--accent)"></div></div>');
   ug.parentNode.insertBefore(c,ug.nextSibling);var b=c.querySelector('.lvtgo');if(b)b.onclick=function(){startLevelTest(m,lv)}}catch(e){console.error(e)}return out};
 var css=document.createElement('style');css.textContent='.lvtcard{margin-top:18px;border:2px solid var(--accent)}.lvtcard.locked{border-color:var(--line)}.lvtcard.passed{border-color:var(--good-line)}.lvth{display:flex;gap:12px;align-items:center}.lvti{font-size:32px}.lvtcard h2{margin:2px 0 0}.lvtsum{margin:8px 0}.lvtsum summary{cursor:pointer;font-weight:700;color:var(--accent)}.lvtsum ul{margin:8px 0;padding-left:20px}.lvtsum li{margin:4px 0;font-size:15px}.lvtgo{margin-top:6px}'+
  '.lvtu{display:flex;align-items:center;gap:10px;padding:6px 0}.lvtn{flex:none;width:26px;height:26px;border-radius:50%;background:var(--soft);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px}.lvtb{flex:1;min-width:0}.lvtb b{font-size:14px}.lvts{font-family:var(--mono);font-size:14px}';document.head.appendChild(css);
})();

