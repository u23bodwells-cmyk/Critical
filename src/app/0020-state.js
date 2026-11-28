/* ---------- state ---------- */
var S=(function(){var d={xp:0,done:{},streak:0,last:'',daily:{d:'',xp:0},missions:{},goal:50};try{var s=JSON.parse(localStorage.getItem('critical_state')||'null');if(s){for(var k in d)if(s[k]===undefined)s[k]=d[k];return s}}catch(e){}return d})();
function save(){try{localStorage.setItem('critical_state',JSON.stringify(S))}catch(e){try{storageSaveFailed(e)}catch(_){}}}
function ymdL(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function lcount(){try{if(typeof P==='undefined'||!P||P._lc||P.mode==='one'||P.mode==='lap')return;P._lc=1;var d=ymdL();if(!S.lday||S.lday.d!==d)S.lday={d:d,n:0};S.lday.n++;save();setTimeout(function(){try{if(typeof MYS!=='undefined')MYS.lesson()}catch(_){}try{if(typeof REW!=='undefined')REW.lessonBonus()}catch(_){}try{if(window.PLAN&&PLAN.afterLesson)PLAN.afterLesson()}catch(_){}},0)}catch(_){}}
function lessonsToday(){var n=0,d=ymdL(),t=new Date();function same(ms){var x=new Date(ms);return x.getFullYear()===t.getFullYear()&&x.getMonth()===t.getMonth()&&x.getDate()===t.getDate()}
 if(S.lday&&S.lday.d===d)n+=S.lday.n||0;
 try{var s=JSON.parse(localStorage.getItem('shift-ready-v1')||'null');if(s&&s.done)for(var k in s.done){var v=s.done[k];if(v&&v.at&&same(v.at))n++}}catch(_){}
 try{var a=JSON.parse(localStorage.getItem('aptitude-v1')||'null');if(a&&a.hist&&a.hist.forEach)a.hist.forEach(function(h){if(h&&h.at&&same(h.at))n++})}catch(_){}
 return n}
function dstr(d){var m=d.getMonth()+1,y=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(y<10?'0':'')+y}
function today(){return dstr(new Date())}
function touchStreak(){var t=today();if(S.last===t)return;var gap=S.last?dayDiff(S.last,t):99;
 if(gap===1)S.streak++;else if(gap>1&&S.streak>0&&gap-1<=(S.freeze||0)){S.freeze-=gap-1;S.streak++;var sv=S.streak;setTimeout(function(){toast(SNOW,'Streak freeze used','Your '+sv+'-day streak is safe.')},500)}else S.streak=1;
 S.last=t;if(S.streak>S.st.maxStreak)S.st.maxStreak=S.streak}
function pruneHist(){var t=today();for(var k in S.hist)if(dayDiff(k,t)>60||isNaN(dayDiff(k,t)))delete S.hist[k]}
function streakNow(){if(!S.last)return 0;var g=dayDiff(S.last,today());if(g<=1)return S.streak;if(g-1<=(S.freeze||0))return S.streak;return 0}
function addXP(n,el){if(n<=0)return;var lv0=level().i;S.xp+=n;var t=today();if(S.daily.d!==t)S.daily={d:t,xp:0};S.daily.xp+=n;S.hist[t]=(S.hist[t]||0)+n;pruneHist();touchStreak();save();updHeader();var xpp=$('xpPill');xpp.classList.remove('bump');void xpp.offsetWidth;xpp.classList.add('bump');
 if(el){var r=el.getBoundingClientRect(),f=document.createElement('div');f.className='xpfloat';f.textContent='+'+n+' XP';f.style.left=(r.left+r.width/2-30)+'px';f.style.top=(r.top-10)+'px';document.body.appendChild(f);setTimeout(function(){f.remove()},1000)}
 var lv1=level().i;if(lv1>lv0)queueLevelUp(lv1);qProg('xp',n);checkBadges()}
var LEVELS=[[0,'Visitor'],[100,'Trainee'],[300,'Plant technician'],[600,'Field operator'],[1000,'Operator trainee'],[1600,'Reactor operator'],[2400,'Senior reactor operator'],[3400,'Shift supervisor'],[4600,'Shift manager'],[6000,'Station director'],[7800,'Fleet director'],[10000,'Chief nuclear officer'],[12500,'Chief inspector'],[15500,'New-build director'],[19000,'SMR designer'],[23000,'Fusion engineer'],[27500,'Tokamak commander'],[32500,'Fusion plant director'],[38000,'Grid architect'],[45000,'Star maker']];
function level(){var i=0;while(i<LEVELS.length-1&&S.xp>=LEVELS[i+1][0])i++;var lo=LEVELS[i][0],hi=i<LEVELS.length-1?LEVELS[i+1][0]:lo+2000;return {i:i,name:LEVELS[i][1],frac:Math.min(1,(S.xp-lo)/(hi-lo)),next:i<LEVELS.length-1?LEVELS[i+1][1]:'',toNext:hi-S.xp}}
var FLAME='<svg viewBox="0 0 24 24" fill="none"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#e8742a"/><path d="M12 13c1 1.5 3 2.3 3 4.5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 1 .5 1.5 1 1.5 0-1.5 0-2 .5-3z" fill="#fcc24a"/></svg>';
var BOLT='<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#7F77DD"/></svg>';
function updHeader(){var st=streakNow(),sp=$('streakPill');sp.innerHTML=FLAME+st+'<span class="pl"> day'+(st===1?'':'s')+'</span>'+(S.freeze>0?'<span class="fzp">'+SNOW+S.freeze+'</span>':'');sp.title='Day streak'+(S.freeze?' · '+S.freeze+' streak freeze'+(S.freeze===1?'':'s')+' ready':'');$('xpPill').innerHTML=BOLT+fmtInt(S.xp)+' XP'}

