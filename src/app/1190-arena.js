/* ===== arena start ===== */
/* Critical Clash: the gun-game shooter lives in arena.js and is loaded the first time it's opened. */
var ARENA=(function(){
 var TR=[['theory','Theory','☢️'],['maths','Reactor maths','📐'],['calc','Calculus','∫'],['gm','GCSE Maths','➗'],['gp','GCSE Physics','⚛️'],['gc','GCSE Chemistry','🧪'],['gcs','Computer Science','💻'],['am','A-level Maths','🧮'],['ap','A-level Physics','🔭'],['ac','A-level Chemistry','⚗️']];
 var qc={};function qs(m,lv){var k=m+lv;if(qc[k]&&Date.now()-qc[k].t<5000)return qc[k].v;var o=[];try{allLessons(m,lv).forEach(function(x){var u=UNITS[x[0]],l=u.lessons[x[1]];l.cards.forEach(function(c,ci){var b={k:l.id+'#'+ci,p:c.p,e:c.e||'',src:u.title+' · '+l.title,done:!!S.done[l.id]};if(c.t==='Q'&&c.o&&c.o.length>=2&&c.o.length<=4&&c.a>=0&&c.a<c.o.length){b.o=c.o;b.a=c.a;o.push(b)}else if(c.t==='N'&&typeof c.a==='number'&&isFinite(c.a)){b.t='N';b.a=c.a;b.tol=c.tol;b.u=c.u||'';o.push(b)}})})}catch(e){}qc[k]={t:Date.now(),v:o};return o}
 window.CRIT_ARENA_API={
  tracks:function(){return TR.map(function(t){return {id:t[0],name:t[1],ic:t[2],levels:Array.apply(null,Array(maxLv(t[0]))).map(function(_,i){return i+1}).map(function(lv){var d=[0,0];try{d=lvDone(t[0],lv)}catch(e){}return {lv:lv,q:qs(t[0],lv).length,done:d[0],tot:d[1]}})}})},
  questions:qs,
  result:function(k,ok){try{if(!ok)S.wrong[k]=1;MEM.seen(k,ok);save()}catch(e){}},
  xp:function(n){try{addXP(n)}catch(e){}},
  crate:function(t){try{return MOT.earn(t,'arena')}catch(e){return null}},
  sfx:function(k){try{sfx(k)}catch(e){}},
  close:function(){try{if(PAGE==='learn')renderLearn()}catch(e){}}};
 function open(){if(window.CRIT_ARENA){window.CRIT_ARENA.open();return}var s=document.createElement('script');s.src='arena.js?v='+encodeURIComponent(String(APPV).split(' ')[0]);s.onload=function(){if(window.CRIT_ARENA)window.CRIT_ARENA.open()};s.onerror=function(){toast('🎮','Couldn\'t load Critical Clash','Check your internet and try again','')};document.head.appendChild(s)}
 function card(){var el=$('page-learn');if(!el)return;var p=$('player');if(p&&p.classList.contains('open'))return;var old=document.getElementById('arnCard');if(old)old.remove();
  var c=document.createElement('section');c.id='arnCard';c.className='card arncard';
  var ca={};try{ca=JSON.parse(localStorage.getItem('critical_arena')||'{}')||{}}catch(e){}
  c.innerHTML='<div class="arnrow"><span class="arnic" aria-hidden="true">🎮</span><div class="arntx"><b>Critical Clash 3D'+(ca.coins?' <small class="arncoin">🪙 '+Math.round(ca.coins).toLocaleString('en-GB')+'</small>':'')+'</b><span>Blocky 3D arena shooter against AI bots on 7 maps, some with ramps, two-storey buildings and slides: Deathmatch, Meltdown and King of the Hill. Every kill is a question, and right answers give coins, health, grenades and streak rewards. Buy guns and skins, and take on three daily challenges.</span></div><button type="button" class="xbtn arngo" id="arnGo">▶ Play</button></div>';
  var at=document.getElementById('memCard')||document.getElementById('motCard')||el.querySelector('.hero');if(at&&at.parentNode)at.parentNode.insertBefore(c,at.nextSibling);else el.insertBefore(c,el.firstChild);
  c.querySelector('#arnGo').onclick=open}
 var rl=renderLearn;renderLearn=function(){var o=rl.apply(this,arguments);try{card()}catch(e){}return o};
 var css=document.createElement('style');css.textContent='.arncard{padding:12px 14px!important;background:linear-gradient(110deg,color-mix(in srgb,#ef4444 14%,var(--panel)),var(--panel) 55%)!important;border-color:color-mix(in srgb,#f59e0b 35%,var(--line))!important}.arnrow{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.arnic{font-size:28px;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#f59e0b,#ef4444);flex:none}.arntx{flex:1 1 240px;min-width:0;display:flex;flex-direction:column;gap:2px}.arntx b{font-size:16px}.arncoin{font:800 12px ui-monospace,monospace;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#f59e0b 18%,transparent);color:inherit;margin-left:6px;vertical-align:2px}.arntx span{font-size:13.5px;color:var(--muted)}.arngo{background:linear-gradient(90deg,#f59e0b,#ef4444)!important;color:#fff!important;border:0!important}';document.head.appendChild(css);
 if(location.hash==='#arena'){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}setTimeout(open,700)}
 return {open:open}})();
try{window.ARENA_OPEN=ARENA.open}catch(e){}
/* ===== arena end ===== */
