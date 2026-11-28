/* ===== screens start ===== */
/* Notes and side screens on other monitors: Critical tells them what's on screen, and blanks them during tests */
var SCR=(function(){
 var NK='critical_notes',ch=null,lockLbl='',lastCtx=null,wins={},sess={right:0,wrong:0,combo:0,solved:[]};
 try{ch=new BroadcastChannel('critical-screens')}catch(e){}
 function send(m){try{if(ch)ch.postMessage(m)}catch(e){}}
 function nread(){try{var o=JSON.parse(localStorage.getItem(NK)||'null');if(o&&o.items)return o}catch(e){}return {v:1,items:{}}}
 function nwrite(o){try{localStorage.setItem(NK,JSON.stringify(o))}catch(e){}try{if(SYNC.mark)SYNC.mark()}catch(e){}send({t:'notes'})}
 function rid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
 function txt(h){var d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim()}
 function findL(lid){for(var ui=0;ui<UNITS.length;ui++){var u=UNITS[ui];for(var li=0;li<u.lessons.length;li++)if(u.lessons[li].id===lid)return {u:u,l:u.lessons[li],ui:ui,li:li}}return null}
 function popen(){var p=$('player');return !!(p&&p.classList.contains('open')&&P)}
 function lockNow(){if(popen()&&P.mode==='test')return 'Test in progress';if(document.querySelector('.xov[aria-label="6-mark question"]'))return '6-mark question in progress';if(document.querySelector('.ppov .ppans'))return 'Past paper in progress';return ''}
 function slideTitle(c){if(!c)return '';if(c.t==='T'){var d=document.createElement('div');d.innerHTML=c.h;var h=d.querySelector('h3,h2,b');return h?h.textContent.trim():txt(c.h).slice(0,70)}if(c.t==='F')return c.f||'Flashcard';return txt(c.p).slice(0,90)}
 function lastTeach(){if(!P||P.mode!=='lesson')return '';for(var i=P.i;i>=0;i--){var c=P.cards[i];if(c&&c.t==='T')return c.h}return ''}
 function ctx(){if(!popen())return {open:false};if(P.mode==='test')return {open:true,test:true};var c=P.cards[P.i]||{},lid=null,ci=null,lt='',ut='',uid=null,track=null,f=null;
  if(P.mode==='lesson'){var u=UNITS[P.ui],l=u.lessons[P.li];lid=l.id;ci=P.i;lt=l.title;ut=u.title;uid=u.id;track=trk(P.ui)}
  else{var m=/^F?([a-z0-9-]+)#(\d+)$/.exec(c._key||'');if(m&&(f=findL(m[1]))){lid=m[1];ci=+m[2];lt=f.l.title;ut=f.u.title;uid=f.u.id;track=trk(f.ui)}}
  return {open:true,mode:P.mode,lid:lid,ci:ci,n:P.cards.length,i:P.i,lt:lt||P.title||'',ut:ut||P.unit||'',uid:uid,track:track,color:P.color,kind:c.t,title:slideTitle(c),text:txt(c.t==='T'?c.h:c.p).slice(0,600),hint:!!(P.hintCan&&P.hintCan()),teach:c.t==='T'?'':lastTeach()}}
 function stats(){var t=today(),pl=null;try{var ti=(new Date().getDay()+6)%7,ds=PLAN.DAY(ti);pl=ds.map(function(b,j){return {n:b[0],m:b[1],d:!!(PLAN.isDone&&PLAN.isDone(ti,j))}})}catch(e){}
  var st=null;try{var s=STUDY.state();st={run:s.run?s.run.at:null,today:(s.sessions||[]).filter(function(x){return x&&x.d===t}).reduce(function(a,x){return a+(+x.m||0)},0)}}catch(e){}
  var wk=[];try{wk=XTRA.weakest(3).map(function(w){return {t:UNITS[w.ui].title,s:w.s}})}catch(e){}
  var cd=null;try{var ex=new Date(2028,4,8);cd=Math.ceil((ex-new Date())/864e5)}catch(e){}
  var lv=null;try{var L0=level();lv={n:L0.i+1,name:L0.name||L0.title||''}}catch(e){}
  return {xp:S.xp,day:(S.daily&&S.daily.d===t)?S.daily.xp:0,goal:S.goal||50,streak:S.streak||0,lv:lv,plan:pl,study:st,weak:wk,gcse:cd}}
 function push(full){var l=lockNow();if(l!==lockLbl){lockLbl=l;send({t:'lock',on:!!l,label:l});hlHide()}if(full){lastCtx=ctx();send({t:'ctx',c:lastCtx,lock:lockLbl})}}
 /* activity log for the 3D progress graph: per device, per day, per subject [xp, questions, right first time] */
 var AK='critical_act';
 function adev(){var d=null;try{d=localStorage.getItem('critical_act_dev');if(!d){d=Math.random().toString(36).slice(2,10);localStorage.setItem('critical_act_dev',d)}}catch(e){}return d||'dev'}
 function curTrack(){try{if(popen()){if(P.mode==='lesson'||P.mode==='test')return trk(P.ui);var c=P.cards[P.i]||{},m=/^F?([a-z0-9-]+)#(\d+)$/.exec(c._key||''),f=m&&findL(m[1]);if(f)return trk(f.ui)}}catch(e){}return 'other'}
 function abump(i,n,tr){try{var o=JSON.parse(localStorage.getItem(AK)||'null');if(!o||!o.d)o={v:1,d:{}};var dv=adev(),t=today(),me=o.d[dv]=o.d[dv]||{},day=me[t]=me[t]||{},k=tr||curTrack(),a=day[k]=day[k]||[0,0,0];a[i]+=n;
  var ks=Object.keys(me);if(ks.length>400){ks.sort();ks.slice(0,ks.length-400).forEach(function(x){delete me[x]})}localStorage.setItem(AK,JSON.stringify(o));try{if(SYNC.mark)SYNC.mark()}catch(_){}}catch(e){}}
 /* hooks into the lesson player */
 var sc0=showCard;showCard=function(){sc0.apply(this,arguments);try{if(P&&P.i===0)sess={right:0,wrong:0,combo:0,solved:[]};push(true);chip()}catch(e){}};
 var cp0=closePlayer;closePlayer=function(){cp0.apply(this,arguments);try{push(true);send({t:'stats',s:stats()})}catch(e){}};
 var gr0=gotRight;gotRight=function(c){var first=P&&!P.st.tries;gr0.apply(this,arguments);try{if(first){abump(1,1);abump(2,1)}}catch(e){}try{if(P&&P.mode!=='test'){if(first){sess.right++;sess.combo++}send({t:'ans',ok:true,first:first,combo:sess.combo,p:c.t==='F'?escT(c.f):(c.p||''),e:c.t==='F'?'':(c.e||''),a:c.t==='F'?escT(c.b):ansText(c)});send({t:'stats',s:stats()})}}catch(e){}};
 var gw0=gotWrong;gotWrong=function(c){gw0.apply(this,arguments);try{abump(1,1)}catch(e){}try{if(P&&P.mode!=='test'){sess.wrong++;sess.combo=0;send({t:'ans',ok:false,p:c.p||'',e:c.e||'',a:ansText(c)})}}catch(e){}};
 function escT(t){return String(t||'').replace(/[&<>"]/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]})}
 function ansText(c){try{if(c.t==='Q')return c.o[c.a];if(c.t==='N')return c.a+(c.u?' '+c.u:'');if(c.t==='F')return c.b}catch(e){}return ''}
 var ax0=addXP;addXP=function(n){ax0.apply(this,arguments);try{if(n>0)abump(0,n)}catch(e){}try{send({t:'stats',s:stats()})}catch(e){}};
 /* messages from the screens */
 if(ch)ch.onmessage=function(ev){var m=ev.data||{};
  if(m.t==='hello'){push(true);send({t:'stats',s:stats()});try{send({t:'formulas',f:FORMULAS})}catch(e){}}
  else if(m.t==='hint'){var r='';if(!lockNow()&&popen()&&P.hintFn&&(!P.hintCan||P.hintCan())){r=P.hintFn();P.hintFn=null;P.hinted=(P.hinted||0)+1}send({t:'hintRes',txt:r||'No hint for this one. Try the worked example or the formula sheet.'});push(true)}
  else if(m.t==='open'){if(lockNow())return;var f=findL(m.lid);if(!f)return;try{window.focus()}catch(e){}if(popen())closePlayer();startLesson(f.ui,f.li);if(m.ci>0&&P&&P.cards[m.ci]){P.i=Math.min(m.ci,P.cards.length-1);showCard()}}
  else if(m.t==='notes'){chip()}};
 setInterval(function(){push(false);send({t:'hb',lock:lockLbl})},1500);
 window.addEventListener('storage',function(e){if(e.key===NK){try{if(SYNC.mark)SYNC.mark()}catch(_){}chip()}});
 /* no chip on the lesson slide: your notes screen shows what you wrote */
 function chip(){var old=document.getElementById('scrChip');if(old)old.remove()}
 /* highlight text on a slide to save it to your notes */
 var hb=null;
 function hlHide(){if(hb)hb.style.display='none'}
 function hlShow(){var sel=window.getSelection&&window.getSelection();if(!sel||sel.isCollapsed||!popen()||lockNow()){hlHide();return}var t=String(sel).replace(/\s+/g,' ').trim(),body=$('pBody');if(t.length<3||t.length>800||!body||!body.contains(sel.anchorNode)){hlHide();return}
  if(!hb){hb=document.createElement('button');hb.type='button';hb.className='scrhl';hb.innerHTML='🖍️ Save to notes';document.body.appendChild(hb);hb.addEventListener('mousedown',function(e){e.preventDefault()});hb.onclick=save}
  var r=sel.getRangeAt(0).getBoundingClientRect();hb.style.display='block';hb.style.left=Math.max(8,Math.min(innerWidth-160,r.left+r.width/2-70))+'px';hb.style.top=Math.max(8,r.top-44)+'px';hb._t=t}
 function save(){var t=hb&&hb._t;if(!t)return;var c=ctx();if(!c.lid){hlHide();return}var o=nread(),id='h:'+rid();o.items[id]={id:id,k:'hl',lid:c.lid,ci:c.ci,lt:c.lt,ut:c.ut,st:c.title,txt:t,at:Date.now()};nwrite(o);hlHide();try{window.getSelection().removeAllRanges()}catch(e){}try{toast('🖍️','Saved to your notes',t.length>60?t.slice(0,57)+'…':t,'quest')}catch(e){}}
 var hlT=null;document.addEventListener('selectionchange',function(){clearTimeout(hlT);hlT=setTimeout(hlShow,250)});
 document.addEventListener('scroll',hlHide,true);
 /* opening the screens on your other monitors */
 function place(which,scr,half){var x=scr?scr.availLeft:screen.availLeft||0,y=scr?scr.availTop:screen.availTop||0,w=scr?scr.availWidth:Math.min(900,screen.availWidth),h=scr?scr.availHeight:screen.availHeight;if(half===1)w=Math.floor(w/2);if(half===2){x+=Math.floor(w/2);w=Math.ceil(w/2)}
  var f='popup,left='+x+',top='+y+',width='+w+',height='+h;var wn=window.open('screens.html?s='+which,'critical_'+which,f);if(wn){wins[which]=wn;try{wn.moveTo(x,y);wn.resizeTo(w,h)}catch(e){}try{wn.focus()}catch(e){}}return wn}
 function open(which){var w=wins[which];if(w&&!w.closed){try{w.focus()}catch(e){}return}place(which,null,0)}
 function spread(){var go=function(list){var others=list.others;if(others.length>=2){place('notes',others[0]);place('side',others[1])}else if(others.length===1){place('notes',others[0],1);place('side',others[0],2)}else{place('notes',null,0);place('side',null,0);try{toast('🖥️','Opened in new windows','Drag them where you want them. Press F11 in each for full screen.','quest')}catch(e){}}};
  if(window.getScreenDetails){window.getScreenDetails().then(function(d){var me=d.currentScreen;go({others:d.screens.filter(function(s){return s!==me})})},function(){go({others:[]})})}else go({others:[]})}
 function menu(){var ov=document.createElement('div');ov.className='xov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Your screens');
  ov.innerHTML='<div class="xin" style="max-width:620px"><div class="xtop"><b>Your screens</b><button type="button" class="xclose">Close</button></div><div class="card" style="padding:18px"><h2 style="margin:0 0 6px">Spread Critical across your screens</h2><p class="note">Lessons stay here. <b>Notes</b> goes on one screen and the <b>side screen</b> (hints, plan, formulas and a live reactor) on another. Both go blank during tests.</p>'+
   '<div class="scrops"><button class="scrop pri" data-w="both"><b>🖥️🖥️ Open both on my other screens</b><span>Chrome or Edge will ask to manage windows on all your displays: say Allow.</span></button><button class="scrop" data-w="notes"><b>📝 Notes only</b><span>Typed notes, sketches, highlights and flashcards, per slide.</span></button><button class="scrop" data-w="side"><b>🧭 Side screen only</b><span>Hints and worked examples, plan, formula sheet, live reactor.</span></button><button class="scrop" data-w="prog"><b>📈 Your progress in 3D</b><span>A 3D graph of your XP, questions, accuracy and study time over the last 2 weeks to 12 weeks.</span></button><button class="scrop" data-w="split"><b>'+(inSplit()?'▣ Back to one panel':'◧ Split this screen: Critical and the reactor')+'</b><span>'+(inSplit()?'Close the reactor panel on this screen.':'Critical on the left, the live reactor dashboard on the right. Drag the line between them to resize.')+'</span></button></div>'+
   '<p class="note" style="margin-top:10px">Tip: select any text on a slide and press <b>Save to notes</b> to highlight it.</p></div></div>';
  document.body.appendChild(ov);document.body.classList.add('noscroll');var close=function(){ov.remove();if(!popen())document.body.classList.remove('noscroll')};ov.querySelector('.xclose').onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close()});
  [].forEach.call(ov.querySelectorAll('[data-w]'),function(b){b.onclick=function(){var w=b.getAttribute('data-w');close();if(w==='both')spread();else if(w==='split')split();else if(w==='prog')prog3d();else open(w)}})}
 function prog3d(){var ov=document.createElement('div');ov.className='xov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Your progress in 3D');
  ov.innerHTML='<div class="xin" style="max-width:1100px;width:100%"><div class="xtop"><b>📈 Your progress in 3D</b><button type="button" class="xclose">Close</button></div><iframe src="screens.html?s=side&only=prog&embed=2" title="3D progress graph" style="width:100%;height:min(82vh,860px);border:0;border-radius:16px;background:var(--bg);display:block"></iframe></div>';
  document.body.appendChild(ov);document.body.classList.add('noscroll');var close=function(){ov.remove();if(!popen())document.body.classList.remove('noscroll');document.removeEventListener('keydown',esc)},esc=function(e){if(e.key==='Escape')close()};ov.querySelector('.xclose').onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close()});document.addEventListener('keydown',esc)}
 function inSplit(){try{return window.top!==window.self&&/split\.html$/.test(window.top.location.pathname)}catch(e){return false}}
 function split(){try{if(inSplit())window.top.location.href='critical.html';else location.href='split.html'}catch(e){location.href='split.html'}}
 (function mount(){var ps=document.querySelector('.hdr .pills');if(!ps||document.getElementById('scrPill'))return;var b=document.createElement('button');b.type='button';b.id='scrPill';b.className='pill';b.title='Spread across your screens';b.setAttribute('aria-label','Spread across your screens');
  b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="9" height="7" rx="1.2"/><rect x="13" y="5" width="9" height="7" rx="1.2"/><path d="M6.5 12v3M17.5 12v3M4 18h5M15 18h5"/></svg>';b.onclick=menu;
  var th=document.getElementById('syncPill')||document.getElementById('themeBtn');if(th)ps.insertBefore(b,th);else ps.appendChild(b)})();
 var css=document.createElement('style');css.textContent='.scrhl{position:fixed;z-index:9999;display:none;border:0;border-radius:10px;padding:8px 12px;font-weight:700;background:var(--accent);color:var(--on-accent,#fff);box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}.scrchip{display:inline-block;margin:0 0 10px;border:1.5px solid var(--line);background:var(--soft);color:var(--text);border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer}.scrops{display:grid;gap:8px;margin-top:12px}.scrop{display:flex;flex-direction:column;gap:2px;text-align:left;border:1.5px solid var(--line);background:var(--panel);color:var(--text);border-radius:14px;padding:12px 14px;cursor:pointer}.scrop span{font-size:13.5px;color:var(--muted)}.scrop.pri{border-color:var(--accent)}.scrop:hover{background:var(--soft)}';document.head.appendChild(css);
 return {open:open,spread:spread,menu:menu,split:split,inSplit:inSplit,prog3d:prog3d,ctx:ctx,stats:stats,lock:lockNow,nread:nread}})();
/* flashcards you make on the notes screen join the review deck */
function rF(c,b){P.asked++;var p=document.createElement('div');p.className='qprompt';p.textContent=c.f;b.appendChild(p);var ans=document.createElement('div');ans.className='prose';ans.style.cssText='display:none;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;margin-top:10px;white-space:pre-wrap';ans.textContent=c.b;b.appendChild(ans);
 var row=document.createElement('div');row.className='opts';row.style.display='none';row.innerHTML='<button class="opt" data-k="1">✓ I knew it</button><button class="opt" data-k="0">✗ Not yet</button>';b.appendChild(row);
 function mark(ok){try{var o=SCR.nread(),it=o.items[c._fid];if(it){it.w=ok?0:1;it.seen=(it.seen||0)+1;it.at=Date.now();localStorage.setItem('critical_notes',JSON.stringify(o))}}catch(e){}}
 mainBtn('Show answer',function(){ans.style.display='block';row.style.display='grid';mainBtn('Choose one',function(){},true)});
 [].forEach.call(row.querySelectorAll('.opt'),function(o){o.onclick=function(){var ok=o.getAttribute('data-k')==='1';[].forEach.call(row.querySelectorAll('.opt'),function(x){x.disabled=true});o.classList.add(ok?'right':'wrong');
  if(ok){gotRight(c);foot('ok',praise(),'')}else{P.st.tries=1;P.combo=0;P.mistakes++;showCombo(false);sfx('wrong');foot('no','It\'ll come back in Fix my mistakes','')}mark(ok);mainBtn('Continue',nextCard)}})}
var rp0=reviewPool;reviewPool=function(only){var pool=rp0(only);try{var it=SCR.nread().items;Object.keys(it).forEach(function(k){var x=it[k];if(!x||x.del||x.k!=='card'||!x.f||!x.b)return;if(only&&!x.w)return;pool.push({t:'F',f:x.f,b:x.b,_src:'Your flashcard'+(x.lt?' · '+x.lt:''),_key:'U:'+x.id,_fid:x.id})})}catch(e){}return pool};
try{window.SCR=SCR;window.__crit.reviewPool=function(o){return reviewPool(o)};window.__crit.closePlayer=function(){closePlayer()}}catch(e){}
/* ===== screens end ===== */
