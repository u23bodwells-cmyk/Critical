/* ===== just one question: a tiny way into a study session ===== */
var ONE=(function(){
 function trackFor(a){return a==='gp'||a==='gc'||a==='gm'||a==='gcs'||a==='am'||a==='ap'||a==='ac'||a==='theory'||a==='maths'?a:(a==='calc'||a==='calcfu')?'calc':null}
 function pick(){var b=PLAN.next?PLAN.next():null,a=b&&b[3]&&b[3][0]?b[3][0][1]:null,tr=trackFor(a)||curMode(),c=null;
  if(a==='fix'){var pool=reviewPool(true).filter(function(x){return x.t==='Q'});if(pool.length)c=pool[Math.floor(Math.random()*pool.length)]}
  function from(test){var cs=[];UNITS.forEach(function(u,ui){if(!test(ui))return;u.lessons.forEach(function(l){if(!S.done[l.id])return;l.cards.forEach(function(x,ci){if(x.t==='Q'&&!S.wrong[l.id+'#'+ci])cs.push([x,l,u,ci])})})});return cs}
  if(!c){var cs=from(function(ui){return trk(ui)===tr});if(!cs.length)cs=from(function(){return true});
   if(cs.length){var k=cs[Math.floor(Math.random()*cs.length)];c=Object.assign({},k[0],{_key:k[1].id+'#'+k[3],_src:k[2].title+' · '+k[1].title})}
   else{var nl=nextLesson(tr)||nextLesson();if(nl){var u=UNITS[nl[0]],l=u.lessons[nl[1]];for(var ci=0;ci<l.cards.length;ci++)if(l.cards[ci].t==='Q'){c=Object.assign({},l.cards[ci],{_key:l.id+'#'+ci,_src:u.title+' · '+l.title});break}}}}
  return c}
 function start(){if(typeof P!=='undefined'&&P&&!P.finished&&document.querySelector('#player.open'))return;try{PLAN.hideBan()}catch(_){}if(document.querySelector('#player.open'))closePlayer();var c=pick();
  if(!c){var na=nextAction();if(na)runAction(na);return}
  P={mode:'one',cards:[c],i:0,xp:0,right:0,asked:0,title:'Just one question',color:'#534AB7',unit:'Just one question',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
 function finish(){P.finished=true;P.quiet=true;$('pBar').style.width='100%';var ok=P.right>0,b=$('pBody'),left=PLAN.todayLeft&&PLAN.todayLeft(),run=PLAN.running&&PLAN.running(),mins=PLAN.leftMins?PLAN.leftMins():0;save();
  b.innerHTML='<div class="done-screen"><div class="dicon"><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="var(--accent-bg)"/><path d="M37 28v34l28-17z" fill="var(--accent)" stroke="var(--accent)" stroke-width="4" stroke-linejoin="round"/></svg></div>'+
   '<h2>That\'s the start done</h2><p class="note" style="font-size:16px">'+(ok?'You got it right.':'Not this time, and that\'s fine: it\'s saved to Review for later.')+' Starting is the hardest part, and you\'ve already done it.</p>'+
   '<div class="dblock" style="text-align:center"><p class="note" style="margin:0 0 8px">While you\'re here…</p><div class="savebtns" style="justify-content:center"><button class="wbtn" id="oneMore">One more question</button><button class="skip" id="oneStop">That\'s enough for now</button></div></div></div>';
  foot('','','');skipBtn(null);
  if(run)mainBtn('Back to your plan',function(){closePlayer()});
  else if(left)mainBtn('Keep going: today\'s plan'+(mins?' ('+mins+' min)':''),function(){closePlayer();PLAN.start()});
  else mainBtn('Keep going: next lesson',function(){closePlayer();var na=nextAction();if(na)runAction(na)});
  $('oneMore').onclick=function(){closePlayer();start()};$('oneStop').onclick=function(){closePlayer()};
  $('pXP').textContent=P.xp?'+'+P.xp+' XP':''}
 return {start:start,finish:finish,pick:pick}
})();
try{window.ONE=ONE}catch(_){}
