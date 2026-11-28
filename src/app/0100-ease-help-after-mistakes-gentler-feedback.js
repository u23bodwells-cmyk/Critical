/* ===== ease: help after mistakes, gentler feedback, level-too-hard warnings ===== */
var EASE=(function(){
 var STOP={};('the and for are but not you your with that this from have has had was were will can its into than then them they their there these those what when where which who why how all any each per one two three four five six also only more most less very just such some same other about over under between after before while because using use used make makes made does did doing done get gets got give gives each both either many much way ways like find work out here she his her him our ours itself what\'s it\'s don\'t can\'t isn\'t you\'re lesson lessons question questions answer answers card cards step steps right wrong true false new now see show shown shows look let try first second last next level unit units remember key keys means mean called call value values number numbers write written give given physics physic chemistry maths math gcse aqa edexcel higher tier skill skills year grade grades paper papers part only').split(' ').forEach(function(w){STOP[w]=1});
 function words(s){s=String(s||'').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').toLowerCase();var o=[];(s.match(/[a-z][a-z0-9]{2,}/g)||[]).forEach(function(w){if(STOP[w])return;if(w.length>4&&/s$/.test(w)&&!/(ss|us|is)$/.test(w))w=w.slice(0,-1);o.push(w)});return o}
 var IX=null;
 function index(){if(IX)return IX;IX={d:[],df:{},n:0};UNITS.forEach(function(u,ui){u.lessons.forEach(function(l,li){var tw={},uw={},bw={},tc=[],all={},k;words(l.title).forEach(function(w){tw[w]=1});words(u.title).forEach(function(w){uw[w]=1});
  l.cards.forEach(function(c,ci){if(c.t==='T'){tc.push(ci);words(c.h).forEach(function(w){bw[w]=1})}else if(c.p)words(c.p).forEach(function(w){bw[w]=1})});
  for(k in tw)all[k]=1;for(k in uw)all[k]=1;for(k in bw)all[k]=1;var nb=0;for(k in all){IX.df[k]=(IX.df[k]||0)+1;nb++}IX.d.push({ui:ui,li:li,id:l.id,tr:trk(ui),lv:lvOf(ui),tw:tw,uw:uw,bw:bw,tc:tc,nb:nb})})});IX.n=IX.d.length;IX.avg=IX.d.reduce(function(a,d){return a+d.nb},0)/Math.max(1,IX.n);return IX}
 function idf(w){var X=index();return Math.log((X.n+1)/((X.df[w]||0)+1))}
 function query(parts){var q={};parts.forEach(function(p){words(p[0]).forEach(function(w){q[w]=Math.max(q[w]||0,p[1])})});return q}
 function scoreDoc(d,q){var X=index(),nf=Math.sqrt(X.avg/Math.max(10,d.nb)),s=0,h=0,t=0;for(var w in q){var f=d.tw[w]?2:d.uw[w]?1.3:d.bw[w]?nf:0;if(f){s+=f*q[w]*idf(w);h++;if(d.tw[w])t++}}return {s:s,h:h,t:t}}
 function selfScore(q){var s=0;for(var w in q)s+=2*q[w]*idf(w);return s||1}
 /* best lesson on a lower level of the same track */
 function related(tr,lv,q,min){if(lv<=1)return null;var X=index(),best=null,ss=selfScore(q);X.d.forEach(function(d){if(d.tr!==tr||d.lv>=lv||!d.tc.length)return;var r=scoreDoc(d,q);if(r.h<2)return;var s=r.s/ss*Math.pow(0.85,lv-1-d.lv);if(!best||s>best.s)best={d:d,s:s,h:r.h,t:r.t}});return best&&best.s>=(min==null?RT_MIN:min)&&best.t>0?best:null}
 var RT_MIN=0.15;
 function bestT(d,q){var l=UNITS[d.ui].lessons[d.li],bi=d.tc[0],bs=-1;d.tc.forEach(function(ci){var s=0,seen={};words(l.cards[ci].h).forEach(function(w){if(q[w]&&!seen[w]){seen[w]=1;s+=q[w]*idf(w)}});if(s>bs){bs=s;bi=ci}});return bi}
 function lidOf(c){if(!P)return null;if(P.mode==='lesson')return UNITS[P.ui].lessons[P.li].id;if(P.mode==='follow'&&P.fid)return P.fid;if(c&&c._lid)return c._lid;var k=c&&c._key;if(!k)return null;var id=String(k).split('#')[0];return lessonById(id)?id:lessonById(id.replace(/^F/,''))?id.replace(/^F/,''):null}
 function cardQ(c,L){return query([[L?L.l.title:'',3],[L?L.u.title:'',1.5],[c.p||'',2],[c.e||'',1],[c.t==='Q'&&c.o?c.o[c.a]:'',1]])}
 /* the reteach source for the current card: a lower-level lesson if one matches, otherwise this lesson's own teaching cards */
 function source(c){var id=lidOf(c),L=id&&lessonById(id);if(!L)return null;var q=cardQ(c,L),r=related(trk(L.ui),lvOf(L.ui),q);
  if(r){var d=r.d,ll=UNITS[d.ui].lessons[d.li];return {low:true,ui:d.ui,li:d.li,lv:d.lv,tr:d.tr,title:ll.title,cards:d.tc,at:d.tc.indexOf(bestT(d,q))}}
  var tc=[];L.l.cards.forEach(function(x,ci){if(x.t==='T')tc.push(ci)});if(!tc.length)return null;var at=tc.length-1;
  if(P.mode==='lesson'){for(var i=tc.length-1;i>=0;i--)if(tc[i]<P.i){at=i;break}}else{var d0={ui:L.ui,li:L.li,tc:tc};at=tc.indexOf(bestT(d0,q))}
  return {low:false,ui:L.ui,li:L.li,lv:lvOf(L.ui),tr:trk(L.ui),title:L.l.title,cards:tc,at:Math.max(0,at)}}
 function lvName(tr,lv){try{return lvInfo(tr,lv)[0]}catch(e){return ''}}
 function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}

 /* ---- in-lesson offer after two first-try mistakes in a row ---- */
 function wrongHook(c){if(!P||P.mode==='test')return;P.wrun=(P.wrun||0)+1;(P.wl=P.wl||[]).push(c);if(!P.helpOff&&P.wrun>=2&&P.wrun%2===0)P.helpDue=1}
 function rightHook(){if(P)P.wrun=0}
 function offer(){var fb=$('pFb'),c=P&&P.cards[P.i];if(!fb||!c)return;var src=source(c);P.rtSrc=src;var canH=!!P.hintFn;if(!src&&!canH)return;
  var d=document.createElement('div');d.className='easeoff';d.id='easeOff';
  d.innerHTML='<span>That\'s two tricky ones in a row. Want a hand?</span>'+(canH?'<button class="ghost sm" data-ez="hint">Hint for this one</button>':'')+(src?'<button class="ghost sm" data-ez="re">'+(src.low?'Quick reteach from Level '+src.lv:'Quick reteach')+'</button>':'')+'<button class="skip" data-ez="no">No thanks</button>';
  fb.appendChild(d)}
 function useHint(){var o=$('easeOff');if(!P||!P.hintFn){if(o)o.remove();return}var m=P.hintFn();P.hintFn=null;P.hinted=(P.hinted||0)+1;
  if(o){var keepRe=o.querySelector('[data-ez=re]');o.innerHTML='<span class="ezmsg">'+(m||'No hint for this one, sorry.')+'</span>'+(keepRe?keepRe.outerHTML:'')}}
 function noThanks(){if(P)P.helpOff=1;var o=$('easeOff');if(o)o.remove()}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ez]');if(!b||!P)return;var k=b.dataset.ez;if(k==='hint')useHint();else if(k==='re')reteach();else if(k==='no')noThanks()});

 /* ---- reteach sheet ---- */
 function reteach(){var c=P&&P.cards[P.i],src=(P&&P.rtSrc)||(c&&source(c));if(!src)return;var m=$('modal');if(!m)return;var i=src.at,L=UNITS[src.ui].lessons[src.li];
  function draw(){var ci=src.cards[i],h=L.cards[ci].h;
   m.innerHTML='<div class="mcard rtcard" role="dialog" aria-modal="true" aria-labelledby="rtT"><div class="rtk">'+(src.low?'Quick reteach · Level '+src.lv+(lvName(src.tr,src.lv)?': '+esc(lvName(src.tr,src.lv)):''):'Quick reteach · from this lesson')+'</div><p class="rtsub" id="rtT">'+esc(L.title)+'</p><div class="prose rtbody">'+h+'</div>'+
    '<div class="rtnav">'+(src.cards.length>1?'<button class="ghost sm" id="rtPrev"'+(i===0?' disabled':'')+'>‹ Back</button><span class="note">'+(i+1)+' of '+src.cards.length+'</span><button class="ghost sm" id="rtNext"'+(i>=src.cards.length-1?' disabled':'')+'>More ›</button>':'')+'</div>'+
    '<button class="big" id="rtOk">Got it, back to the question</button>'+(src.low?'<p class="note rtlater">Want the whole lesson? It\'s <b>'+esc(L.title)+'</b> in Level '+src.lv+'. You can start it at the end of this one.</p>':'')+'</div>';
   m.classList.add('open');var ok=$('rtOk');ok.onclick=close;try{ok.focus({preventScroll:true})}catch(e){}
   if($('rtPrev'))$('rtPrev').onclick=function(){if(i>0){i--;draw()}};if($('rtNext'))$('rtNext').onclick=function(){if(i<src.cards.length-1){i++;draw()}};
   var rb=m.querySelector('.rtcard');if(rb)rb.scrollTop=0}
  function close(){m.classList.remove('open');m.innerHTML='';document.removeEventListener('keydown',esc2)}
  function esc2(e){if(e.key==='Escape')close()}
  document.addEventListener('keydown',esc2);if(src.low&&P)P.rtLow={ui:src.ui,li:src.li,lv:src.lv,tr:src.tr};draw()}

 /* ---- hint helpers used by the question renderers ---- */
 function maskAns(e,a){if(!e)return '';var s=String(e),t=[];[String(+Math.abs(a).toPrecision(4)),String(+Math.abs(a).toPrecision(3)),String(+Math.abs(a).toPrecision(2))].forEach(function(v){if(t.indexOf(v)<0&&v!=='0')t.push(v)});
  t.forEach(function(v){try{s=s.replace(new RegExp('(^|[^0-9.])[−-]?'+v.replace(/\./g,'\\.')+'(?![0-9])','g'),'$1?')}catch(_){}});return s}

 /* ---- level-too-hard tracking ---- */
 function record(tr,lv,acc){if(acc==null||isNaN(acc))return;S.lacc=S.lacc||{};var k=tr+lv,a=S.lacc[k]=S.lacc[k]||[];a.push([acc,Date.now()]);while(a.length>5)a.shift();save()}
 function hardInfo(tr,lv){var a=(S.lacc&&S.lacc[tr+lv])||[];if(!a.length)return null;var l3=a.slice(-3),avg=Math.round(l3.reduce(function(s,x){return s+x[0]},0)/l3.length),last=a[a.length-1];
  var hard=(l3.length>=3&&avg<60)||last[0]<50;return hard?{avg:avg,n:l3.length,last:last[0],ts:last[1]}:null}
 function lowTarget(tr,lv,q){var r=q?related(tr,lv,q):null;return r?{ui:r.d.ui,li:r.d.li,lv:r.d.lv,title:UNITS[r.d.ui].lessons[r.d.li].title}:null}
 /* block for the end-of-lesson / end-of-test screen */
 function rtBlock(ui){var r=P&&P.rtLow;if(!r)return '';var t={ui:r.ui,li:r.li,lv:r.lv,title:UNITS[r.ui].lessons[r.li].title};P.hdT={tr:trk(ui),lv:lvOf(ui),t:t};
  return '<div class="dblock fuopt"><div><div class="dbt">The full reteach</div><p class="note">You looked at a card from <b>'+esc(t.title)+'</b> (Level '+t.lv+'). The whole lesson is short if you want it.</p></div><button class="ghost sm" data-hd="les">Do it now</button></div>'}
 function endBlock(ui,acc,right,total,kind,noLead){if(!P||P.mode==='review'||P.mode==='follow')return '';var tr=trk(ui),lv=lvOf(ui),hi=total>=3?hardInfo(tr,lv):null;if(!hi)return rtBlock(ui);
  var multi=hi.n>=3&&hi.avg<60,lead=noLead?'':kind==='test'?'You got '+right+' of '+total+' on this test.':'You got '+right+' of '+total+' right first time.',
   tail=multi?'Over your last '+hi.n+(kind==='test'?' goes':' lessons')+' on Level '+lv+' that\'s about '+hi.avg+'%.':'',sweet='The sweet spot is about 6 to 8 out of 10.';
  if(lv<=1)return '<div class="dblock hardb"><div class="dbt">That was a tricky one</div><p class="note">'+[lead,tail,sweet].filter(Boolean).join(' ')+' Go over the ones you missed in Review, then have another go at this.</p><div class="hbtns"><button class="ghost sm" data-hd="rev">Go to Review</button></div></div>';
  var q=null,L=UNITS[ui];if(kind==='test')q=query([[L.title,3]]);else{var lp=L.lessons[P.li];q=query([[lp?lp.title:'',3],[L.title,1.5]].concat((P.wl||[]).map(function(c){return [c.p||'',1]})))}
  var t=(P.rtLow&&P.rtLow.tr===tr)?{ui:P.rtLow.ui,li:P.rtLow.li,lv:P.rtLow.lv,title:UNITS[P.rtLow.ui].lessons[P.rtLow.li].title}:lowTarget(tr,lv,q);
  P.hdT={tr:tr,lv:lv,t:t};
  return '<div class="dblock hardb"><div class="dbt">Level '+lv+' might be too hard right now</div><p class="note">'+[lead,tail,sweet].filter(Boolean).join(' ')+' That\'s not you being bad at it: Level '+(lv-1)+(lvName(tr,lv-1)?' ('+esc(lvName(tr,lv-1))+')':'')+' builds the basics this needs.</p><div class="hbtns">'+
   (t?'<button class="ghost sm" data-hd="les">Try “'+esc(t.title)+'” (Level '+t.lv+')</button>':'')+'<button class="ghost sm" data-hd="lv">Go to Level '+(lv-1)+'</button><button class="skip" data-hd="stay">Stay on Level '+lv+'</button></div></div>'}
 function goLevel(tr,lv,from){S.lvlOpen=S.lvlOpen||{};S.lvlOpen[tr+lv]=1;S.lvl=S.lvl||{};S.lvl[tr]=lv;S.mode=tr;if(isA(tr)&&!alOpen())return;if(isG(tr)){S.gsub=tr;S.seenGcse=1}if(isA(tr)){S.asub=tr;S.seenAlevel=1}S.hardOff=S.hardOff||{};S.hardOff[tr+(from||lv+1)]=Date.now();save()}
 function startNoGate(ui,li){var u=UNITS[ui],l=u.lessons[li];P={mode:'lesson',ui:ui,li:li,cards:playCards(l),i:0,xp:0,right:0,asked:0,title:l.title,color:u.color,unit:u.title,combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-hd]');if(!b)return;var k=b.dataset.hd,h=P&&P.hdT;
  if(k==='rev'){closePlayer();showPage('review');return}
  if(!h)return;
  if(k==='stay'){S.hardOff=S.hardOff||{};S.hardOff[h.tr+h.lv]=Date.now();save();var bl=b.closest('.hardb');if(bl)bl.innerHTML='<div class="dbt">Staying on Level '+h.lv+'</div><p class="note">No problem. If it keeps feeling hard, the level below is always there.</p>';return}
  if(k==='lv'){goLevel(h.tr,h.lv-1,h.lv);closePlayer();showPage('learn');return}
  if(k==='les'&&h.t){var t=h.t;goLevel(h.tr,t.lv,h.lv);closePlayer();showPage('learn');setTimeout(function(){startLesson(t.ui,t.li)},60)}});

 /* banner on the Learn page */
 function banner(){var el=$('page-learn');if(!el)return;var m=curMode(),lv=curLevel(m);if(lv<=1)return;var hi=hardInfo(m,lv);if(!hi||(hi.n<3&&hi.last>=50))return;var off=S.hardOff&&S.hardOff[m+lv];if(off&&off>=hi.ts)return;
  var d=document.createElement('div');d.className='lvwarn';d.innerHTML='<div class="lvwt"><b>Level '+lv+' might be too hard right now</b><span>'+(hi.n>=3?'Your last '+hi.n+' lessons here averaged about '+hi.avg+'%.':'You got '+hi.last+'% in your last lesson here.')+' Level '+(lv-1)+(lvName(m,lv-1)?' ('+esc(lvName(m,lv-1))+')':'')+' builds the basics first.</span></div><div class="lvwb"><button class="ghost sm" id="lvwGo">Go to Level '+(lv-1)+'</button><button class="skip" id="lvwNo">Stay here</button></div>';
  var lp=el.querySelector('.lvpick');if(lp&&lp.nextSibling)el.insertBefore(d,lp.nextSibling);else el.insertBefore(d,el.firstChild);
  $('lvwGo').onclick=function(){goLevel(m,lv-1,lv);renderLearn()};$('lvwNo').onclick=function(){S.hardOff=S.hardOff||{};S.hardOff[m+lv]=Date.now();save();d.remove()}}

 var GENTLE=['Not quite','Not this one','Close, but not quite','Good try'];
 function gentle(){return GENTLE[Math.floor(Math.random()*GENTLE.length)]}
 function revNote(c){if(!P||P.mode==='test'||'QNO'.indexOf(c.t)<0)return '';return '<div class="revnote">'+(P.mode==='review'?'It stays in Review, so you can have another go later.':'Saved to Review, so you can have another go later.')+'</div>'}

 return {wrongHook:wrongHook,rightHook:rightHook,offer:offer,reteach:reteach,source:source,related:related,query:query,maskAns:maskAns,record:record,hardInfo:hardInfo,endBlock:endBlock,banner:banner,gentle:gentle,revNote:revNote,startNoGate:startNoGate}
})();
(function(){var _rl=renderLearn;renderLearn=function(){_rl.apply(this,arguments);try{EASE.banner()}catch(e){if(window.console)console.error(e)}}})();
try{window.EASE=EASE}catch(_){}
