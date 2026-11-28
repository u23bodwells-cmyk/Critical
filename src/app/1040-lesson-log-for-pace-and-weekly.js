/* ===== lesson log (for pace and weekly reports) and Ideas to remember (spaced review of quantum concepts) ===== */
function plogAdd(tr){var d=ymdL(),L=S.pathLog;if(!L||typeof L!=='object')L=S.pathLog={};var e=L[d]||(L[d]={});e[tr]=(e[tr]||0)+1;var ks=Object.keys(L).sort();while(ks.length>150)delete L[ks.shift()]}
function plogCount(days,tracks){var L=S.pathLog||{},n=0,now=new Date();for(var i=0;i<days;i++){var d=new Date(now);d.setDate(d.getDate()-i);var k=ymdLof(d),e=L[k];if(!e)continue;for(var t in e)if(!tracks||tracks.indexOf(t)>=0)n+=e[t]}return n}
function ymdLof(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
var IDEA_INT=[1,3,7,14,30,60];
function ideaMem(){var x=lxGet();if(!x.ideas||typeof x.ideas!=='object'||Array.isArray(x.ideas))x.ideas={};return x}
function ideaAdd(lid){var x=ideaMem();if(x.ideas[lid])return;x.ideas[lid]={b:0,due:lxAddD(today(),1),at:Date.now()};lxSet(x)}
function ideasDue(){var x=ideaMem(),t=today();return Object.keys(x.ideas).filter(function(k){return x.ideas[k].due<=t&&lessonById(k)})}
var finish_log=finish;finish=function(){var id=null,was=false,tr=null;try{if(typeof P!=='undefined'&&P&&P.mode==='lesson'&&UNITS[P.ui]){id=UNITS[P.ui].lessons[P.li].id;was=!!S.done[id];tr=trk(P.ui)}}catch(e){}
 if(typeof P!=='undefined'&&P&&P.mode==='idearev'){ideaFinish();return}
 var r=finish_log.apply(this,arguments);try{if(id&&!was&&S.done[id]){plogAdd(tr);if(tr==='qm')ideaAdd(id);save()}}catch(e){if(window.console)console.error(e)}return r};
function ideaReview(){var due=ideasDue();if(!due.length){toast('💡','No ideas due','They come back a day or more after each quantum lesson');return}var cs=[];
 due.slice(0,5).forEach(function(lid){var L=lessonById(lid),l=UNITS[L.ui].lessons[L.li],qs=[];l.cards.forEach(function(c,ci){if(c.t==='Q'&&c.o&&typeof c.a==='number')qs.push(Object.assign({},c,{_key:lid+'#'+ci,_lid:lid,_src:'💡 '+l.title}))});
  for(var i=qs.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=qs[i];qs[i]=qs[j];qs[j]=t}cs=cs.concat(qs.slice(0,2));
  var kp=null;for(var k=l.cards.length-1;k>=0;k--){var c=l.cards[k];if(c.t==='T'&&/<h3[^>]*>\s*key points/i.test(c.h||'')){kp=c;break}}if(kp)cs.push({t:'T',h:'<div class="pcagain">💡 The big ideas: '+l.title+'</div>'+kp.h.replace(/<h3[^>]*>[\s\S]*?<\/h3>/,''),_auto:1,_key:null,_lid:lid})});
 if(!cs.length){toast('💡','Nothing to review yet','');return}if(document.querySelector('#player.open'))closePlayer();
 P={mode:'idearev',cards:cs,i:0,xp:0,right:0,asked:0,title:'Ideas to remember',color:'#7F77DD',unit:'Ideas to remember',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null,_miss:{},_lids:due.slice(0,5)};openPlayer()}
var gotWrong_idea=gotWrong;gotWrong=function(c){try{if(typeof P!=='undefined'&&P&&P.mode==='idearev'&&c&&c._lid)P._miss[c._lid]=1}catch(e){}return gotWrong_idea.apply(this,arguments)};
function ideaFinish(){P.finished=true;P.quiet=true;$('pBar').style.width='100%';var x=ideaMem(),t=today(),ok=0;
 (P._lids||[]).forEach(function(lid){var e=x.ideas[lid];if(!e)return;if(P._miss[lid])e.b=0;else{e.b=Math.min(IDEA_INT.length-1,e.b+1);ok++}e.due=lxAddD(t,IDEA_INT[e.b]);e.at=Date.now()});lxSet(x);
 var n=(P._lids||[]).length;$('pBody').innerHTML='<div class="done-screen"><div class="dicon" style="font-size:64px">💡</div><h2>Ideas reviewed</h2><p class="note" style="font-size:16px">'+ok+' of '+n+' lesson'+(n===1?'':'s')+' remembered well: they\'ll come back after a longer gap. '+(n-ok?'The others come back tomorrow.':'')+'</p></div>';
 foot('','','');skipBtn(null);mainBtn('Done',function(){closePlayer()});$('pXP').textContent=P.xp?'+'+P.xp+' XP':'';try{sfx('done')}catch(e){}}
var decorReview_idea=decorReview;decorReview=function(){decorReview_idea.apply(this,arguments);var pg=$('page-review');if(!pg||pg.querySelector('#ideaRev'))return;var x=ideaMem(),n=Object.keys(x.ideas).length;if(!n)return;var due=ideasDue().length;
 var c=document.createElement('section');c.id='ideaRev';c.className='card fxrev';c.innerHTML='<div class="fxrh"><span class="fxri">💡</span><div><b>Ideas to remember</b><p class="small">'+n+' quantum lesson'+(n===1?'':'s')+' · '+(due?'<b>'+due+' due today</b>':'none due today')+'</p></div></div><button type="button" class="wbtn"'+(due?'':' disabled')+'>'+(due?'Test yourself on them':'Come back later')+'</button>';
 c.querySelector('button').onclick=ideaReview;var a=pg.querySelector('#fxRev')||pg.querySelector('#lxRev');if(a)a.parentNode.insertBefore(c,a.nextSibling);else pg.appendChild(c)};

