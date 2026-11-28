/* ===== custom practice built from the questions missed on a level test ===== */
function lvpWords(h){var d=document.createElement('div');d.innerHTML=String(h||'');return ((d.textContent||'').toLowerCase().match(/[a-z0-9]{4,}/g)||[])}
function lvpLocate(ms){var u=UNITS[ms.ui];if(!u)return null;var card=null,lid=ms.lid||null;
 u.lessons.forEach(function(l){l.cards.concat(FOLLOW[l.id]||[]).forEach(function(c){if(!card&&c.p===ms.p){card=c;lid=lid||l.id}})});
 if(!card)(TESTS[u.id]||[]).forEach(function(c){if(!card&&c.p===ms.p){card=c;lid=lid||c._lid||null}});
 if(!card)return null;
 if(!lid){var qw=lvpWords(card.p+' '+(card.e||'')),best=-1;u.lessons.forEach(function(l){var txt=lvpWords(l.cards.map(function(c){return c.h||c.p||''}).join(' ')),set={},sc=0;txt.forEach(function(w){set[w]=1});qw.forEach(function(w){if(set[w])sc++});if(sc>best){best=sc;lid=l.id}})}
 return {card:card,lid:lid,lesson:lid?lessonById(lid):null}}
function lvpCards(m,lv){var rec=lvtRec(m,lv);if(!rec||!rec.missed||!rec.missed.length)return [];var out=[],taught={},used={};
 rec.missed.forEach(function(ms){used[ms.p]=1});
 rec.missed.slice(0,8).forEach(function(ms){var f=lvpLocate(ms);if(!f)return;var L=f.lesson;
  if(L&&!taught[f.lid]){taught[f.lid]=1;var ts=L.l.cards.filter(function(c){return c.t==='T'&&c.h&&c.h.indexOf('class="recall"')<0}),kp=ts.filter(function(c){return /Key points/i.test(c.h)})[0]||ts[ts.length-1];
   if(kp)out.push(Object.assign({},kp,{_src:'Recap · '+L.l.title}))}
  var q=Object.assign({},f.card,{_src:'From your Level '+lv+' test',_miss:ms.p});out.push(q);
  if(L){var sims=L.l.cards.concat(FOLLOW[f.lid]||[]).filter(function(c){return (c.t==='Q'||c.t==='N')&&!used[c.p]});var s=shuffle(sims)[0];
   if(s){used[s.p]=1;out.push(Object.assign({},s,{_src:'Similar question · '+L.l.title}))}}});
 return out}
function startLevelPractice(m,lv){var cards=lvpCards(m,lv);if(!cards.length){toast(TEST_ICON,'Nothing to practise','You didn\'t miss anything on your last attempt.');return}
 P={mode:'review',lvp:{m:m,lv:lv,fixed:0,n:cards.filter(function(c){return c._miss}).length},cards:cards,i:0,xp:0,right:0,asked:0,title:'Level '+lv+' practice',color:'var(--accent)',unit:'Practice: your Level '+lv+' test mistakes',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
(function(){
 /* remember what was missed */
 var _ft=finishTest;finishTest=function(){var lt=P&&P.lvt,ans=lt?P.answers.slice():null;var r=_ft.apply(this,arguments);
  if(lt){try{var rec=lvtRec(lt.m,lt.lv);rec.missed=ans.filter(function(a){return !a.ok}).map(function(a){return {p:a.c.p,ui:a.c._u,lid:a.c._lid||null}});save();
   if(rec.missed.length){var blk=document.createElement('div');blk.className='dblock lvpblock';blk.innerHTML='<div><div class="dbt">Practise what you missed</div><p class="note">A custom session from your '+rec.missed.length+' wrong answer'+(rec.missed.length===1?'':'s')+': a quick recap, the question again, then a similar one.</p></div><button class="wbtn pri" type="button">Start practice</button>';
    blk.querySelector('button').onclick=function(){closePlayer();startLevelPractice(lt.m,lt.lv)};var ds=document.querySelector('#pBody .done-stats');if(ds)ds.parentNode.insertBefore(blk,ds.nextSibling)}}catch(e){console.error(e)}}
  return r};
 /* tick off a missed question when it's answered right first time */
 var _gr=gotRight;gotRight=function(c){var first=P&&P.st&&!P.st.tries;var r=_gr.apply(this,arguments);
  try{if(P&&P.lvp&&c._miss&&first){var rec=lvtRec(P.lvp.m,P.lvp.lv);if(rec&&rec.missed){var n=rec.missed.length;rec.missed=rec.missed.filter(function(x){return x.p!==c._miss});if(rec.missed.length<n){P.lvp.fixed++;save()}}}}catch(_){}return r};
 /* practice finish screen */
 var _fin=finish;finish=function(){var lp=P&&P.lvp;var r=_fin.apply(this,arguments);
  if(lp){try{var rec=lvtRec(lp.m,lp.lv),left=rec&&rec.missed?rec.missed.length:0,h2=document.querySelector('#pBody h2');if(h2)h2.textContent=P.mistakes?'Practice complete!':'Perfect practice!';[].forEach.call(document.querySelectorAll('#pBody .xpbreak span'),function(x){x.textContent=x.textContent.replace('Review complete','Practice complete').replace('Perfect review','Perfect practice')});var sub=document.querySelector('#pBody h2+.note');if(sub)sub.textContent='Practice on your Level '+lp.lv+' test mistakes';
   var blk=document.createElement('div');blk.className='dblock lvpblock';
   blk.innerHTML='<div><div class="dbt">'+(left?'You fixed '+lp.fixed+' of '+lp.n+'.':'All fixed! ✓')+'</div><p class="note">'+(left?left+' still to practise. Go again, or retake the level test when you feel ready.':'You\'ve got every question you missed right. Ready to retake the Level '+lp.lv+' test?')+'</p></div><div class="lvpbtns">'+(left?'<button class="ghost sm" data-a="again" type="button">Practise again</button>':'')+'<button class="wbtn pri" data-a="test" type="button">Retake level test</button></div>';
   blk.querySelector('[data-a=test]').onclick=function(){closePlayer();startLevelTest(lp.m,lp.lv)};var ag=blk.querySelector('[data-a=again]');if(ag)ag.onclick=function(){closePlayer();startLevelPractice(lp.m,lp.lv)};
   var st=document.querySelector('#pBody .done-stats');if(st)st.parentNode.insertBefore(blk,st.nextSibling)}catch(e){console.error(e)}}
  return r};
 /* button on the Learn page level test card */
 var _rl=renderLearn;renderLearn=function(){var out=_rl.apply(this,arguments);try{var m=curMode(),lv=curLevel(m),rec=lvtRec(m,lv),card=document.querySelector('.lvtcard');
   if(card&&rec&&rec.missed&&rec.missed.length){var b=document.createElement('button');b.type='button';b.className='ghost lvpgo';b.textContent='Practise my mistakes ('+rec.missed.length+')';b.onclick=function(){startLevelPractice(m,lv)};
    var go=card.querySelector('.lvtgo');if(go){var w=document.createElement('div');w.className='lvpbtns';go.parentNode.insertBefore(w,go);w.appendChild(b);w.appendChild(go)}else card.appendChild(b)}}catch(e){console.error(e)}return out};
 var css=document.createElement('style');css.textContent='.lvpblock{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border:2px solid var(--accent)}.lvpblock>div:first-child{flex:1 1 220px}.lvpbtns{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}.lvpgo{font-weight:700}';document.head.appendChild(css);
})();

