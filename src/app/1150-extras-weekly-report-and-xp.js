/* ===== extras start ===== */
/* Weakness radar, GCSE countdown and timetable, 6-mark trainer, ghost race, focus reactor, overtime shifts,
   weekly report card, and XP from the other apps. */
var XTRA=(function(){
 var css=document.createElement('style');css.id='xtraCss';css.textContent=[
  '.xcard h2 .note{font-weight:400}','pre.cs{font-family:var(--mono);font-size:14px;font-weight:500;letter-spacing:0;line-height:1.55;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:10px 12px;overflow-x:auto;white-space:pre;margin:8px 0;tab-size:3}',
  '.xtabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 10px}.xtab{font:inherit;font-size:13px;font-weight:700;padding:6px 11px;border-radius:999px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}.xtab.on{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text)}',
  '.xradar{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:center}@media (max-width:720px){.xradar{grid-template-columns:1fr}}',
  '.xradar svg{width:100%;max-width:420px;height:auto;display:block;margin:0 auto;overflow:visible}.xradar svg text{font:600 11px var(--sans);fill:var(--muted)}',
  '.xweak{display:flex;flex-direction:column;gap:8px}.xweak .w{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;font-size:14px}.xweak .w b{font-family:var(--mono)}.xweak .w .lvlbar{grid-column:1/-1}',
  '.xbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.xbtn{font:inherit;font-weight:800;font-size:14px;border-radius:12px;padding:10px 16px;border:0;cursor:pointer;background:var(--accent);color:var(--on-accent,#fff)}.xbtn.alt{background:var(--soft);color:var(--text);border:1px solid var(--line)}.xbtn[disabled]{opacity:.5;cursor:default}',
  '.xcd{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end}.xcd .xnum{font:800 clamp(40px,9vw,64px)/1 var(--mono);letter-spacing:-.02em}.xcd .u{font-size:14px;color:var(--muted);font-weight:700}',
  '.xcdrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.xcdrow div{background:var(--soft);border-radius:12px;padding:8px 12px;min-width:90px}.xcdrow b{display:block;font:800 20px var(--mono)}.xcdrow span{font-size:12px;color:var(--muted)}',
  '.xdate{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:13.5px;color:var(--muted)}.xdate input{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--text)}',
  '.xweek{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:8px;margin-top:10px}.xfoc{border:1px solid var(--line);border-left:4px solid var(--fc,var(--accent));border-radius:12px;padding:10px 12px;background:var(--panel);display:flex;flex-direction:column;gap:4px;min-width:0}.xfoc .s{font:700 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.xfoc b{font-size:15px}.xfoc p{margin:0;font-size:13px;color:var(--muted)}.xfoc button{align-self:flex-start;margin-top:4px;font:inherit;font-size:13px;font-weight:800;padding:6px 12px;border-radius:999px;border:0;background:var(--accent-bg);color:var(--accent-text);cursor:pointer}',
  '.xplan{margin-top:10px;font-size:13.5px}.xplan summary{cursor:pointer;font-weight:700;color:var(--accent-text,var(--accent))}.xplan ol{margin:8px 0 0;padding-left:20px;display:flex;flex-direction:column;gap:4px}.xplan li span{color:var(--muted)}',
  '.xsix{display:flex;flex-direction:column;gap:6px}.xsix button.q{font:inherit;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}.xsix button.q:hover{border-color:var(--accent)}.xsix .tg{font:700 11px var(--mono);padding:3px 7px;border-radius:6px;background:var(--soft)}.xsix .sc{font:700 12px var(--mono);color:var(--muted)}',
  '.xov{position:fixed;inset:0;z-index:3200;background:var(--bg);overflow-y:auto;overscroll-behavior:contain;padding:calc(14px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}',
  '.xov .xin{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:14px}.xov .xtop{display:flex;align-items:center;gap:10px}.xov .xtop b{flex:1;font-size:17px}.xov .xclose{font:inherit;font-weight:700;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 12px;cursor:pointer}',
  '.xov textarea{width:100%;min-height:220px;font:inherit;font-size:16px;line-height:1.55;padding:12px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);resize:vertical;box-sizing:border-box}.xov textarea:focus{outline:none;border-color:var(--accent)}',
  '.xqbox{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 16px;font-size:16px;line-height:1.5}.xqbox .m{font:700 12px var(--mono);color:var(--muted)}',
  '.xmeta{display:flex;gap:12px;flex-wrap:wrap;font:600 13px var(--mono);color:var(--muted)}',
  '.xpts{display:flex;flex-direction:column;gap:6px}.xpts label{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:start;padding:9px 11px;border-radius:12px;border:1px solid var(--line);background:var(--panel);cursor:pointer;font-size:15px}.xpts label.sug{border-color:var(--good-line,#4f7a22)}.xpts input{width:20px;height:20px;margin:1px 0 0}.xpts .hint{font-size:12px;color:var(--good,#4f8a1b);font-weight:700}',
  '.xscore{display:flex;gap:16px;align-items:center;flex-wrap:wrap;background:var(--accent-bg);border-radius:16px;padding:14px 16px}.xscore .xnum{font:800 44px/1 var(--mono);color:var(--accent-text)}.xscore p{margin:0;font-size:14.5px}',
  '.xmodel{background:var(--soft);border-radius:14px;padding:12px 14px;font-size:15px;line-height:1.55}',
  '.xghost{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:rgba(160,170,255,.55);box-shadow:0 0 0 2px rgba(255,255,255,.7),0 0 10px rgba(140,150,255,.8);transition:left .4s;pointer-events:none;z-index:2}',
  '.xghtag{position:absolute;right:0;top:calc(100% + 4px);font:700 11px var(--mono);color:var(--muted);white-space:nowrap;pointer-events:none}',
  '.xghres{display:flex;gap:12px;align-items:center;border-radius:14px;padding:12px 14px;margin:0 0 12px;background:var(--accent-bg);color:var(--accent-text);font-weight:700}.xghres .gi{font-size:26px}',
  '.xfr{position:fixed;inset:0;z-index:3300;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px));color:#e8edf7;background:radial-gradient(circle at 50% 55%,#0d1a3a,#050812 70%);text-align:center}',
  '.xfr canvas{width:min(340px,70vw);height:min(340px,70vw)}.xfr .t{font:800 clamp(44px,12vw,76px)/1 var(--mono);letter-spacing:.02em;text-shadow:0 0 24px rgba(58,212,255,.5)}',
  '.xfr .st{font:700 13px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:#7fe3ff}.xfr .st.bad{color:#ff8aa0}.xfr p{margin:0;max-width:30em;color:#c9d3ef}',
  '.xfr .pw{width:min(420px,86vw)}.xfr .pw .lvlbar{height:10px;background:rgba(255,255,255,.1)}.xfr .pw .lvlbar div{background:linear-gradient(90deg,#8f80ff,#3ad4ff)}.xfr .pw .l{display:flex;justify-content:space-between;font:700 12px var(--mono);color:#9fb0d8;margin-bottom:5px}',
  '.xfr .xbtns{justify-content:center}.xfr .xbtn.alt{background:rgba(255,255,255,.08);color:#dfe6ff;border:1px solid rgba(255,255,255,.16)}.xfr .xbtn{background:linear-gradient(135deg,#8f80ff,#3ad4ff);color:#fff}',
  '.xfr .mins{display:flex;gap:8px;justify-content:center}.xfr .mins button{font:inherit;font-weight:800;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#dfe6ff;cursor:pointer}.xfr .mins button.on{background:#3ad4ff;color:#04202b;border-color:#3ad4ff}',
  '.xrc img{width:100%;max-width:420px;border-radius:14px;display:block;border:1px solid var(--line)}.xrc .row{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:16px;align-items:start}@media (max-width:720px){.xrc .row{grid-template-columns:1fr}}',
  '.xrc ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:14px}'].join('\n');
 document.head.appendChild(css);
 function $q(s,r){return (r||document).querySelector(s)}
 function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function lsJ(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
 function dAdd(s,n){var d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return dstr(d)}
 function monday(s){var d=new Date((s||today())+'T12:00:00'),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return dstr(d)}
 function nice(s,o){return new Date(s+'T12:00:00').toLocaleDateString('en-GB',o||{weekday:'short',day:'numeric',month:'short'})}
 var TRK={maths:'Maths',theory:'Theory',calc:'Calculus',gp:'GCSE Physics',gc:'GCSE Chemistry',gm:'GCSE Maths',gcs:'GCSE Computer Science',am:'A-level Maths',ap:'A-level Physics',ac:'A-level Chemistry'};
 var LID={};UNITS.forEach(function(u,ui){u.lessons.forEach(function(l){LID[l.id]=ui})});
 function uid(ui){var u=UNITS[ui];return u.id||('u'+ui)}

 /* ---------- XP earned in Control Room, Practicals Lab and Career ---------- */
 function drain(){var q=lsJ('critical_xpq');if(!q||!q.length)return;var lk=+(localStorage.getItem('critical_xpq_lock')||0);if(Date.now()-lk<3000)return;
  try{localStorage.setItem('critical_xpq_lock',String(Date.now()));localStorage.setItem('critical_xpq','[]')}catch(e){return}
  var tot=0,from={};q.forEach(function(x){var n=Math.max(0,Math.min(300,Math.round(+x.n||0)));if(!n)return;tot+=n;from[x.app||'another app']=1});
  if(tot){addXP(tot);toast('⚡','+'+fmtInt(tot)+' XP','from '+Object.keys(from).join(' and '),'quest')}}
 window.addEventListener('storage',function(e){if(e.key==='critical_xpq')setTimeout(drain,300)});setInterval(drain,20000);setTimeout(drain,2500);

 /* ---------- overtime: 50 XP past your daily goal earns a streak freeze ---------- */
 var OTX=50,inOT=false;
 var ax0=addXP;addXP=function(n,el){var t=today(),b=S.daily&&S.daily.d===t?S.daily.xp:0;ax0(n,el);if(inOT)return;try{overtime(b)}catch(e){}};
 function overtime(before){var t=today();if(!S.daily||S.daily.d!==t)return;var g=S.goal||50,x=S.daily.xp;
  if(before<g&&x>=g&&S.otTold!==t){S.otTold=t;save();toast('⏱️','Daily goal done','Overtime starts now: '+OTX+' more XP earns a streak freeze','quest')}
  if(S.ot===t||x<g+OTX)return;S.ot=t;S.otN=(S.otN||0)+1;
  if((S.freeze||0)<2){S.freeze=(S.freeze||0)+1;save();toast('🛡️','Overtime shift complete','Streak freeze earned ('+S.freeze+'/2)','badge')}
  else{inOT=true;try{ax0(20)}finally{inOT=false}save();toast('🛡️','Overtime shift complete','Your freezes are full, so here\'s +20 XP','badge')}}
 function otLine(){var t=today(),g=S.goal||50,x=S.daily&&S.daily.d===t?S.daily.xp:0;if(S.ot===t)return 'Overtime done today. '+((S.freeze||0)>=2?'Freezes full.':'Freezes: '+S.freeze+'/2.');if(x<g)return 'Overtime starts once you hit your daily goal ('+(g-x)+' XP to go).';return 'Overtime: '+(g+OTX-x)+' more XP today earns a streak freeze.'}

 /* ---------- topic stats, for the radar ---------- */
 function unitOf(c){if(P&&(P.mode==='lesson'||P.mode==='follow')&&P.ui!=null)return P.ui;var k=c&&c._key;if(!k)return null;k=String(k).replace(/^F/,'').split('#')[0];return LID[k]!=null?LID[k]:null}
 function rec(c,ok){var ui=unitOf(c);if(ui==null||'QNO'.indexOf(c.t)<0)return;if(!S.tst)S.tst={};var k=uid(ui),a=S.tst[k]||[0,0];a[ok?0:1]++;S.tst[k]=a}
 var gr0=gotRight;gotRight=function(c){var first=P&&P.st&&!P.st.tries;gr0(c);try{if(first)rec(c,true)}catch(e){}};
 var gw0=gotWrong;gotWrong=function(c){gw0(c);try{rec(c,false)}catch(e){}};
 function uStats(ui){var u=UNITS[ui],q=0,w=0,d=0;u.lessons.forEach(function(l){if(!S.done[l.id])return;d++;l.cards.forEach(function(c,ci){if('QNO'.indexOf(c.t)<0)return;q++;if(S.wrong[l.id+'#'+ci])w++})});var t=(S.tst||{})[uid(ui)]||[0,0],seen=q+t[0]+t[1];
  return {ui:ui,done:d,q:q,w:w,s:seen?Math.max(0,Math.min(1,((q-w)+t[0])/seen)):null}}
 function weakest(n,track){var a=[];UNITS.forEach(function(u,ui){if(track&&trk(ui)!==track)return;var s=uStats(ui);if(s.s!=null&&s.done)a.push(s)});a.sort(function(x,y){return x.s-y.s||y.w-x.w});return a.slice(0,n)}
 function fixUnits(list,title){var set={};list.forEach(function(x){set[x.ui]=1});var all=reviewPool().filter(function(c){var k=String(c._key).replace(/^F/,'').split('#')[0];return set[LID[k]]});
  if(!all.length){toast('🎯','Nothing to fix there yet','Finish a lesson in those topics first');return}
  var wr=shuffle(all.filter(function(c){return S.wrong[c._key]})),rest=shuffle(all.filter(function(c){return !S.wrong[c._key]})),pool=wr.concat(rest).slice(0,12);
  P={mode:'review',fix:true,cards:shuffle(pool),i:0,xp:0,right:0,asked:0,title:title||'Fix my weakest 3',color:'var(--accent)',unit:'Review',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
 function radarSVG(items){var n=items.length,R=120,cx=170,cy=150,pts=[],h='<svg viewBox="0 0 340 300" role="img" aria-label="Strength in each topic">';
  [.25,.5,.75,1].forEach(function(f){var p=[];for(var i=0;i<n;i++){var a=-Math.PI/2+i*2*Math.PI/n;p.push((cx+Math.cos(a)*R*f).toFixed(1)+','+(cy+Math.sin(a)*R*f).toFixed(1))}h+='<polygon points="'+p.join(' ')+'" fill="none" stroke="var(--line)" stroke-width="1"/>'});
  items.forEach(function(it,i){var a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;h+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="var(--line)"/>';var f=Math.max(.04,it.s);pts.push((cx+Math.cos(a)*R*f).toFixed(1)+','+(cy+Math.sin(a)*R*f).toFixed(1));
   var lx=cx+Math.cos(a)*(R+14),ly=cy+Math.sin(a)*(R+14),an=Math.abs(Math.cos(a))<.2?'middle':Math.cos(a)>0?'start':'end',t=UNITS[it.ui].title;if(t.length>18)t=t.slice(0,17)+'…';h+='<text x="'+lx.toFixed(1)+'" y="'+(ly+4).toFixed(1)+'" text-anchor="'+an+'">'+esc(t)+'</text>'});
  h+='<polygon points="'+pts.join(' ')+'" fill="color-mix(in srgb,var(--accent) 28%,transparent)" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>';
  pts.forEach(function(p){var xy=p.split(',');h+='<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="3.5" fill="var(--accent)"/>'});return h+'</svg>'}
 function radarCard(){var tracks=Object.keys(TRK).filter(function(t){return UNITS.some(function(u,ui){return trk(ui)===t})}),sel=(function(){try{return localStorage.getItem('critical_radar')}catch(e){return null}})();
  var withData=tracks.filter(function(t){return UNITS.some(function(u,ui){return trk(ui)===t&&uStats(ui).done})});if(tracks.indexOf(sel)<0)sel=withData[0]||curMode();
  var its=[];UNITS.forEach(function(u,ui){if(trk(ui)!==sel)return;var s=uStats(ui);if(s.s!=null&&s.done)its.push(s)});its.sort(function(a,b){return b.q-a.q});its=its.slice(0,10);
  var w3=weakest(3),h='<div class="card xcard" id="xRadar"><h2>Weakness radar</h2><p class="note" style="font-size:15px">How strong you are in each topic, from your answers and the mistakes still waiting to be fixed. The further out, the stronger.</p><div class="xtabs" role="tablist">'+tracks.map(function(t){return '<button type="button" role="tab" class="xtab'+(t===sel?' on':'')+'" data-rt="'+t+'" aria-selected="'+(t===sel)+'">'+TRK[t]+'</button>'}).join('')+'</div><div class="xradar"><div>';
  h+=its.length>=3?radarSVG(its):'<p class="note">Finish lessons in at least 3 '+TRK[sel]+' topics to see your radar here.</p>';
  h+='</div><div class="xweak"><b>Your weakest 3, across everything</b>'+(w3.length?w3.map(function(s){return '<div class="w"><span>'+esc(UNITS[s.ui].title)+' <span class="note">'+TRK[trk(s.ui)]+(s.w?' · '+s.w+' to fix':'')+'</span></span><b>'+Math.round(s.s*100)+'%</b><div class="lvlbar"><div style="width:'+Math.round(s.s*100)+'%"></div></div></div>'}).join(''):'<p class="note">Do a few lessons and your weakest topics show up here.</p>')+
   '<div class="xbtns"><button type="button" class="xbtn" id="xFix3"'+(w3.length?'':' disabled')+'>Fix my weakest 3</button><button type="button" class="xbtn" id="x3d">📈 Progress in 3D</button></div></div></div></div>';return h}
 function wireRadar(){var c=$q('#xRadar');if(!c)return;var b3=c.querySelector('#x3d');if(b3)b3.onclick=function(){try{SCR.prog3d()}catch(e){}};[].forEach.call(c.querySelectorAll('[data-rt]'),function(b){b.onclick=function(){try{localStorage.setItem('critical_radar',b.getAttribute('data-rt'))}catch(e){}var n=document.createElement('div');n.innerHTML=radarCard();c.replaceWith(n.firstChild);wireRadar()}});var f=$q('#xFix3');if(f)f.onclick=function(){fixUnits(weakest(3))}}

 /* ---------- ghost race: replay a lesson against your last attempt ---------- */
 var sl0=startLesson;startLesson=function(ui,li){sl0(ui,li);try{if(P&&P.mode==='lesson'&&P.ui===ui){var lid=UNITS[ui].lessons[li].id;P._lid=lid;P._was=!!S.done[lid];P._t0=Date.now();P._mk=[0];P._gh=(S.ghost||{})[lid]||null;if(P._gh)ghostOn()}}catch(e){}};
 var sc0=showCard;showCard=function(){sc0.apply(this,arguments);try{if(P&&P._lid&&P._mk&&P._mk[P.i]==null)P._mk[P.i]=Date.now()-P._t0}catch(e){}};
 var gtk=0;
 function ghostOn(){var bar=$('pBar'),tr=bar&&bar.parentNode;if(!tr)return;tr.style.position='relative';var g=document.createElement('i');g.className='xghost';g.id='xGhost';g.title='Your ghost';var tg=document.createElement('span');tg.className='xghtag';tg.id='xGhTag';tr.appendChild(g);tr.appendChild(tg);clearInterval(gtk);gtk=setInterval(ghostTick,500);ghostTick()}
 function ghostOff(){clearInterval(gtk);['xGhost','xGhTag'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()})}
 function ghostTick(){if(!P||!P._gh||P.finished||!$('player').classList.contains('open')){ghostOff();return}var el=Date.now()-P._t0,m=P._gh.mk||[],gi=0;while(gi+1<m.length&&m[gi+1]!=null&&m[gi+1]<=el)gi++;if(el>=P._gh.ms)gi=P.cards.length;
  var g=document.getElementById('xGhost'),t=document.getElementById('xGhTag');if(!g)return;g.style.left=(Math.min(1,gi/P.cards.length)*100)+'%';var d=P.i-gi;t.textContent=d>0?'Ghost: you\'re '+d+' ahead':d<0?'Ghost: '+(-d)+' ahead of you':'Ghost: neck and neck'}
 var fi0=finish;finish=function(){var lesson=P&&P.mode==='lesson'&&P._lid&&!P.finished,lid=lesson?P._lid:null,me=lesson?{ms:Date.now()-P._t0,right:P.right,asked:P.asked,mk:P._mk,at:today()}:null,gh=lesson?P._gh:null,was=lesson?P._was:true;
  fi0.apply(this,arguments);if(!lesson)return;try{ghostOff();if(!S.ghost)S.ghost={};S.ghost[lid]=me;var ks=Object.keys(S.ghost);if(ks.length>150){ks.sort(function(a,b){return String(S.ghost[a].at).localeCompare(String(S.ghost[b].at))});ks.slice(0,ks.length-150).forEach(function(k){delete S.ghost[k]})}
   if(!was){if(!S.ldays)S.ldays={};var t=today();S.ldays[t]=(S.ldays[t]||0)+1;var lk=Object.keys(S.ldays).sort();if(lk.length>70)lk.slice(0,lk.length-70).forEach(function(k){delete S.ldays[k]})}
   save();if(gh){var dt=Math.round((gh.ms-me.ms)/1000),ds=me.right-gh.right,msg;
    if(ds>0&&dt>=0)msg='You beat your ghost: '+ds+' more right and '+dt+' s faster.';else if(ds>0)msg='You beat your ghost with '+ds+' more right, even though it was '+(-dt)+' s quicker.';else if(ds===0&&dt>0)msg='You beat your ghost by '+dt+' s.';else if(ds===0&&dt===0)msg='Dead heat with your ghost.';else if(ds<0)msg='Your ghost won by '+(-ds)+' answer'+(ds===-1?'':'s')+'. Rematch?';else msg='Your ghost was '+(-dt)+' s faster. Rematch?';
    var b=$('pBody');if(b){var r=document.createElement('div');r.className='xghres';r.innerHTML='<span class="gi">👻</span><span>'+msg+'</span>';b.insertBefore(r,b.firstChild)}}}catch(e){}};

 /* ---------- focus reactor ---------- */
 var FR=null;
 function focusOpen(){if(FR)return;var mins=25;try{mins=+(localStorage.getItem('critical_focus_m')||25)||25}catch(e){}
  var ov=document.createElement('div');ov.className='xfr';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Focus reactor');document.body.appendChild(ov);document.body.classList.add('noscroll');
  FR={ov:ov,mins:mins,state:'setup',power:0,trans:0,hidden:0,cv:null};
  function setup(){FR.state='setup';ov.innerHTML='<span class="st">Focus reactor</span><canvas width="680" height="680" aria-hidden="true"></canvas><p>Keep the reactor stable and it climbs to full power. Switch tabs or minimise and it has a <b>transient</b> and loses power. Leave for more than a minute and it <b>trips</b>.</p><div class="mins">'+[15,25,45].map(function(m){return '<button type="button" data-m="'+m+'"'+(m===FR.mins?' class="on"':'')+'>'+m+' min</button>'}).join('')+'</div><div class="xbtns"><button type="button" class="xbtn" data-a="go">Start the reactor</button><button type="button" class="xbtn alt" data-a="x">Not now</button></div>';
   [].forEach.call(ov.querySelectorAll('[data-m]'),function(b){b.onclick=function(){FR.mins=+b.getAttribute('data-m');try{localStorage.setItem('critical_focus_m',String(FR.mins))}catch(e){}setup()}});
   ov.querySelector('[data-a=go]').onclick=start;ov.querySelector('[data-a=x]').onclick=close;draw();try{ov.querySelector('[data-a=go]').focus()}catch(e){}}
  function start(){FR.state='run';FR.t0=Date.now();FR.end=FR.t0+FR.mins*60000;FR.lost=0;FR.trans=0;FR.startedTimer=false;
   try{if(STUDY&&STUDY.start)FR.startedTimer=STUDY.start('Focus reactor')}catch(e){}
   ov.innerHTML='<span class="st" data-k="st">Reactor stable</span><canvas width="680" height="680" aria-hidden="true"></canvas><div class="t" data-k="t"></div><div class="pw"><div class="l"><span>Power</span><span data-k="p">0%</span></div><div class="lvlbar"><div data-k="pb" style="width:0%"></div></div></div><p data-k="m">Stay on this tab. Your other screens are fine.</p><div class="xbtns"><button type="button" class="xbtn alt" data-a="q">End early</button></div>';
   var armed=0;ov.querySelector('[data-a=q]').onclick=function(){if(!armed){armed=1;this.textContent='Sure? Tap again';var b=this;setTimeout(function(){armed=0;if(b.isConnected)b.textContent='End early'},2500);return}end(false,'You ended the session early.')};
   tick()}
  function tick(){if(!FR||FR.state!=='run')return;var now=Date.now(),left=Math.max(0,FR.end-now),tot=FR.mins*60000,f=1-left/tot;FR.power=Math.max(0,Math.min(100,f*100-FR.lost));
   var m=Math.floor(left/60000),s=Math.floor(left%60000/1000);ov.querySelector('[data-k=t]').textContent=m+':'+String(s).padStart(2,'0');ov.querySelector('[data-k=p]').textContent=Math.round(FR.power)+'%';ov.querySelector('[data-k=pb]').style.width=FR.power+'%';
   if(FR.flash&&now>FR.flash){FR.flash=0;var st=ov.querySelector('[data-k=st]');st.textContent='Reactor stable';st.classList.remove('bad')}
   draw();if(left<=0){end(true);return}FR.raf=requestAnimationFrame(tick)}
  function onVis(){if(!FR||FR.state!=='run')return;if(document.hidden){FR.hidden=Date.now()}else if(FR.hidden){var gone=Date.now()-FR.hidden;FR.hidden=0;
    if(gone>60000){end(false,'You were away for over a minute, so the reactor tripped.',true);return}FR.trans++;FR.lost+=8+Math.min(12,gone/5000);var st=ov.querySelector('[data-k=st]');st.textContent='Transient! Power lost';st.classList.add('bad');FR.flash=Date.now()+4000;ov.querySelector('[data-k=m]').textContent='Transient '+FR.trans+'. Stay on this tab to keep power up.';try{sfx('wrong')}catch(e){}}}
  document.addEventListener('visibilitychange',onVis);FR.onVis=onVis;
  function end(done,why,tripped){cancelAnimationFrame(FR.raf);var used=Math.round((Date.now()-FR.t0)/60000),clean=done&&FR.trans===0,xp=done?(clean?FR.mins:Math.round(FR.mins*.6)):Math.min(10,Math.round(used/3));FR.state='end';
   try{if(FR.startedTimer&&STUDY&&STUDY.stop)STUDY.stop()}catch(e){}if(xp>0)addXP(xp);if(clean){S.focusClean=(S.focusClean||0)+1;save()}
   ov.innerHTML='<span class="st'+(done?'':' bad')+'">'+(done?(clean?'Full power, no transients':'Session complete'):tripped?'Reactor trip':'Session ended')+'</span><canvas width="680" height="680" aria-hidden="true"></canvas><div class="t">'+(done?Math.round(FR.power)+'%':used+' min')+'</div><p>'+(done?(clean?'A perfect '+FR.mins+' minutes. That\'s how operators work a shift.':FR.trans+' transient'+(FR.trans===1?'':'s')+' this time. Try for a clean run next.'):why)+'</p><p><b>+'+xp+' XP</b>'+(FR.startedTimer?' · your minutes are saved in the study timer':'')+'</p><div class="xbtns"><button type="button" class="xbtn" data-a="again">Go again</button><button type="button" class="xbtn alt" data-a="x">Done</button></div>';
   ov.querySelector('[data-a=again]').onclick=setup;ov.querySelector('[data-a=x]').onclick=close;if(done)try{sfx(clean?'level':'done')}catch(e){};draw()}
  function draw(){var cv=ov.querySelector('canvas');if(!cv)return;var c=cv.getContext('2d'),W=cv.width,H=cv.height,x=W/2,y=H/2,t=Date.now()/1000,p=(FR.power||0)/100,calm=document.documentElement.classList.contains('neocalm');
   c.clearRect(0,0,W,H);var g=c.createRadialGradient(x,y,20,x,y,W*.48);g.addColorStop(0,'rgba(58,212,255,'+(.18+.5*p)+')');g.addColorStop(1,'rgba(58,212,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
   c.strokeStyle='rgba(160,190,255,.35)';c.lineWidth=6;c.beginPath();c.arc(x,y,W*.36,0,6.283);c.stroke();
   c.strokeStyle='#3ad4ff';c.lineWidth=12;c.lineCap='round';c.beginPath();c.arc(x,y,W*.36,-Math.PI/2,-Math.PI/2+6.283*p);c.stroke();
   for(var i=0;i<7;i++){var rx=x-150+i*50,h=140,ins=1-p;c.fillStyle='rgba(120,150,220,.25)';c.fillRect(rx-12,y-h/2,24,h);c.fillStyle=FR.flash?'#ff6a7d':'rgba(230,240,255,.85)';c.fillRect(rx-12,y-h/2,24,h*ins*.9+8)}
   var glow=calm?p:p*(0.85+0.15*Math.sin(t*3));c.fillStyle='rgba(120,220,255,'+(.25+.6*glow)+')';c.beginPath();c.arc(x,y+110,40,0,6.283);c.fill();
   c.fillStyle='#fff';c.font='800 34px ui-monospace,monospace';c.textAlign='center';c.fillText(Math.round(p*100)+'%',x,y+122)}
  function close(){if(!FR)return;if(FR.state==='run'){end(false,'Session ended.');}cancelAnimationFrame(FR.raf);document.removeEventListener('visibilitychange',FR.onVis);ov.remove();document.body.classList.remove('noscroll');FR=null}
  setup()}
 (function(){var g=$q('.stsheet [data-a=go]');if(g&&!$q('.stsheet [data-a=focus]')){var b=document.createElement('button');b.type='button';b.className='stbtn alt wide';b.setAttribute('data-a','focus');b.textContent='Focus reactor: keep it stable for 25 minutes';b.style.marginTop='8px';g.insertAdjacentElement('afterend',b);b.onclick=function(){var sh=$q('.stsheet');if(sh)sh.classList.remove('open');focusOpen()}}})();

 /* ---------- weekly report card ---------- */
 function weekData(){var m=monday(),days=[],xp=0,met=0,best=null,g=S.goal||50,st=lsJ('critical_study')||{},mins=0,les=0;
  for(var i=0;i<7;i++){var d=dAdd(m,i),x=(S.hist||{})[d]||0;days.push({d:d,x:x});xp+=x;if(x>=g)met++;if(!best||x>best.x)best={d:d,x:x};les+=(S.ldays||{})[d]||0}
  (st.sessions||[]).forEach(function(s){if(s.d>=m&&s.d<=dAdd(m,6))mins+=+s.m||0});
  var promos=(S.ladLog||[]).filter(function(p){return p.d>=m});return {m:m,days:days,xp:xp,met:met,best:best,mins:mins,les:les,streak:streakNow(),promos:promos,goal:g}}
 function verdict(D){return D.met>=6?'Outstanding week':D.met>=4?'Strong week':D.met>=2?'Solid start':D.xp>0?'Keep building':'Fresh start next week'}
 function reportPNG(D){var W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
  var g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b1430');g.addColorStop(1,'#060a13');c.fillStyle=g;c.fillRect(0,0,W,H);
  var r=c.createRadialGradient(W*.8,80,10,W*.8,80,700);r.addColorStop(0,'rgba(58,212,255,.28)');r.addColorStop(1,'rgba(58,212,255,0)');c.fillStyle=r;c.fillRect(0,0,W,H);
  c.fillStyle='#7fe3ff';c.font='700 30px ui-monospace,monospace';c.fillText('CRITICAL · WEEKLY REPORT CARD',70,110);
  c.fillStyle='#fff';c.font='800 76px system-ui,sans-serif';c.fillText(verdict(D),70,205);
  c.fillStyle='#b8c4e4';c.font='500 34px system-ui,sans-serif';c.fillText(nice(D.m,{day:'numeric',month:'long'})+' to '+nice(dAdd(D.m,6),{day:'numeric',month:'long',year:'numeric'}),70,260);
  var tiles=[[fmtInt(D.xp),'XP this week'],[D.met+'/7','days on goal'],[String(D.les),'new lessons'],[(D.mins/60).toFixed(1)+' h','on the study timer'],[String(D.streak),'day streak'],[D.best&&D.best.x?nice(D.best.d,{weekday:'long'}):'–','best day']];
  tiles.forEach(function(t,i){var x=70+(i%3)*320,y=320+Math.floor(i/3)*200;c.fillStyle='rgba(255,255,255,.06)';rr(c,x,y,300,170,26);c.fill();c.fillStyle='#fff';c.font='800 58px ui-monospace,monospace';c.fillText(t[0],x+28,y+88);c.fillStyle='#9fb0d8';c.font='600 28px system-ui,sans-serif';c.fillText(t[1],x+28,y+136)});
  var mx=Math.max(D.goal,1);D.days.forEach(function(d){mx=Math.max(mx,d.x)});var bx=70,by=1060,bw=940,bh=300,col=bw/7;
  c.fillStyle='#9fb0d8';c.font='600 28px system-ui,sans-serif';c.fillText('XP each day',70,745);
  var gy=by-bh*(D.goal/mx);c.strokeStyle='rgba(255,214,90,.6)';c.setLineDash([10,10]);c.lineWidth=3;c.beginPath();c.moveTo(bx,gy);c.lineTo(bx+bw,gy);c.stroke();c.setLineDash([]);
  D.days.forEach(function(d,i){var h=bh*(d.x/mx),x=bx+i*col+18,w=col-36,gr=c.createLinearGradient(0,by-h,0,by);gr.addColorStop(0,'#3ad4ff');gr.addColorStop(1,'#8f80ff');c.fillStyle=d.x?gr:'rgba(255,255,255,.08)';rr(c,x,by-Math.max(h,6),w,Math.max(h,6),12);c.fill();
   c.fillStyle='#cfd8f5';c.font='700 26px system-ui,sans-serif';c.textAlign='center';c.fillText(['M','T','W','T','F','S','S'][i],x+w/2,by+44);if(d.x){c.fillText(String(d.x),x+w/2,by-Math.max(h,6)-14)}c.textAlign='left'});
  c.fillStyle='#ffd65a';c.font='700 30px system-ui,sans-serif';var pl=D.promos.length?'Promoted: '+D.promos.map(function(p){return p.n}).slice(0,2).join(', ')+(D.promos.length>2?' and more':''):'Next goal: hit your daily goal 5 days out of 7';c.fillText(pl.length>58?pl.slice(0,57)+'…':pl,70,1200);
  c.fillStyle='#6f7da6';c.font='600 24px ui-monospace,monospace';c.fillText('Training to be a nuclear control room operator',70,1285);
  return cv.toDataURL('image/png')}
 function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
 function reportCard(){var D=weekData(),url='';try{url=reportPNG(D)}catch(e){}
  return '<div class="card xcard xrc" id="xReport"><h2>Weekly report card</h2><p class="note" style="font-size:15px">Your week, Monday to Sunday, as one picture. Save it or send it to someone. A new one fills in every week.</p><div class="row">'+(url?'<img alt="Weekly report card" src="'+url+'">':'')+'<div><ul><li><b>'+fmtInt(D.xp)+' XP</b> this week, on goal '+D.met+' of 7 days</li><li><b>'+D.les+'</b> new lesson'+(D.les===1?'':'s')+' finished</li><li><b>'+(D.mins/60).toFixed(1)+' hours</b> on the study timer</li><li><b>'+D.streak+'</b>-day streak</li>'+(D.promos.length?'<li>Promoted: '+D.promos.map(function(p){return esc(p.n)}).join(', ')+'</li>':'')+'<li>'+esc(otLine())+'</li></ul><div class="xbtns"><button type="button" class="xbtn" id="xRcSave">Save picture</button>'+(navigator.share?'<button type="button" class="xbtn alt" id="xRcShare">Share</button>':'')+'</div></div></div></div>'}
 function wireReport(){var s=$q('#xRcSave'),sh=$q('#xRcShare'),img=$q('#xReport img');if(s&&img)s.onclick=function(){var a=document.createElement('a');a.href=img.src;a.download='critical-week-'+monday()+'.png';document.body.appendChild(a);a.click();a.remove()};
  if(sh&&img)sh.onclick=function(){fetch(img.src).then(function(r){return r.blob()}).then(function(b){var f=new File([b],'critical-week.png',{type:'image/png'});var d={title:'My week in Critical',files:[f]};if(navigator.canShare&&!navigator.canShare(d))delete d.files;return navigator.share(d)}).catch(function(){})}}
 setTimeout(function(){try{var d=new Date();if(d.getDay()===0&&d.getHours()>=17&&S.rcTold!==monday()){S.rcTold=monday();save();toast('📊','Your weekly report card is ready','Find it on the Progress page','badge')}}catch(e){}},6000);

 /* the Progress page gets the radar and the report card */
 var rr0=renderReview;renderReview=function(){rr0.apply(this,arguments);try{var pg=$('page-review'),st=null;[].forEach.call(pg.querySelectorAll('.card h2'),function(h){if(!st&&/Your stats/.test(h.textContent))st=h.parentNode});var at=st||pg.lastChild,box=document.createElement('div');box.innerHTML=radarCard()+reportCard();
  while(box.lastChild)at.insertAdjacentElement('afterend',box.lastChild);wireRadar();wireReport()}catch(e){if(window.console)console.error(e)}};

 /* ---------- GCSE countdown and revision timetable ---------- */
 var GSUBS=['gm','gp','gc','gcs'].filter(function(t){return UNITS.some(function(u,ui){return trk(ui)===t})});
 var GCOL={gm:'#534AB7',gp:'#D85A30',gc:'#1D9E75',gcs:'#1f8fb3'};
 function gx(){if(!S.gx)S.gx={start:'2028-05-08'};return S.gx}
 function daysTo(s){return Math.max(0,Math.round((new Date(s+'T09:00:00')-new Date(today()+'T09:00:00'))/864e5))}
 function nextLessonIn(ui){var u=UNITS[ui];for(var i=0;i<u.lessons.length;i++)if(!S.done[u.lessons[i].id])return i;return -1}
 function focusFor(t,wk){/* weakest topics first, then the next unfinished unit, then anything finished for review */var us=[];UNITS.forEach(function(u,ui){if(trk(ui)===t)us.push(ui)});
  var weak=us.map(uStats).filter(function(s){return s.s!=null&&s.s<.75}).sort(function(a,b){return a.s-b.s}).map(function(s){return s.ui}),todo=us.filter(function(ui){return nextLessonIn(ui)>=0}),done=us.filter(function(ui){return nextLessonIn(ui)<0});
  var order=weak.concat(todo.filter(function(x){return weak.indexOf(x)<0})).concat(done.filter(function(x){return weak.indexOf(x)<0}));if(!order.length)return null;return order[wk%order.length]}
 function timetable(){var start=gx().start,m0=monday(),weeks=Math.max(1,Math.ceil(daysTo(start)/7)),out=[];
  for(var w=0;w<Math.min(weeks,90);w++){var row={m:dAdd(m0,w*7),f:{}};GSUBS.forEach(function(t,i){var weak=w<4?0:w;row.f[t]=focusFor(t,w)});out.push(row)}return out}
 function cdCard(){var g=gx(),d=daysTo(g.start),tot=0,dn=0;GSUBS.forEach(function(t){UNITS.forEach(function(u,ui){if(trk(ui)!==t)return;u.lessons.forEach(function(l){tot++;if(S.done[l.id])dn++})})});
  var tt=timetable(),wk=tt[0],h='<div class="card xcard" id="xCount"><h2>GCSE countdown</h2><div class="xcd"><div><div class="xnum">'+fmtInt(d)+'</div><div class="u">days until your GCSEs start</div></div></div>'+
   '<div class="xcdrow"><div><b>'+Math.floor(d/7)+'</b><span>weeks</span></div><div><b>'+Math.round(dn/Math.max(1,tot)*100)+'%</b><span>of GCSE lessons done</span></div><div><b>'+Math.max(0,tot-dn)+'</b><span>lessons to go</span></div><div><b>'+(Math.floor(d/7)?Math.ceil(Math.max(0,tot-dn)/Math.max(1,Math.floor(d/7))):Math.max(0,tot-dn))+'</b><span>a week keeps you on track</span></div></div>'+
   '<div class="xdate"><label for="xStart">First exam</label><input type="date" id="xStart" value="'+g.start+'"><span>'+(g.set?'Set by you.':'About 8 May 2028 is an estimate. Change it when school gives you the timetable.')+'</span></div>'+
   '<h3 style="margin:16px 0 0;font-size:17px">This week\'s revision focus</h3><p class="note" style="margin:2px 0 0">One topic per subject. Your weakest topics come first, then the ones you haven\'t finished.</p><div class="xweek">'+GSUBS.map(function(t){var ui=wk.f[t];if(ui==null)return '';var s=uStats(ui),nx=nextLessonIn(ui);return '<div class="xfoc" style="--fc:'+GCOL[t]+'"><span class="s">'+TRK[t].replace('GCSE ','')+'</span><b>'+esc(UNITS[ui].title)+'</b><p>'+(s.s!=null?Math.round(s.s*100)+'% strong':'Not started')+(nx>=0?' · next: '+esc(UNITS[ui].lessons[nx].title):' · all lessons done')+'</p><button type="button" data-fo="'+ui+'">'+(nx>=0?'Start':'Revise it')+'</button></div>'}).join('')+'</div>'+
   '<details class="xplan"><summary>See the full plan to the exams ('+tt.length+' weeks)</summary><ol>'+tt.slice(0,60).map(function(r){return '<li><span>w/c '+nice(r.m,{day:'numeric',month:'short'})+':</span> '+GSUBS.map(function(t){return r.f[t]!=null?esc(UNITS[r.f[t]].title):''}).filter(Boolean).join(' · ')+'</li>'}).join('')+'</ol></details></div>';return h}
 function wireCd(){var c=$q('#xCount');if(!c)return;var i=$q('#xStart');if(i)i.onchange=function(){if(!/^\d{4}-\d\d-\d\d$/.test(i.value))return;gx().start=i.value;gx().set=1;save();var n=document.createElement('div');n.innerHTML=cdCard();c.replaceWith(n.firstChild);wireCd()};
  [].forEach.call(c.querySelectorAll('[data-fo]'),function(b){b.onclick=function(){var ui=+b.getAttribute('data-fo'),nx=nextLessonIn(ui);if(nx>=0)startLesson(ui,nx);else fixUnits([{ui:ui}],'Revise: '+UNITS[ui].title)}})}

 /* ---------- 6-mark question trainer ---------- */
 var SIX=window.SIXQ||[];
 function sixState(){if(!S.six)S.six={};return S.six}
 function sixCard(){var st=sixState(),done=SIX.filter(function(q){return st[q.id]}).length;
  return '<div class="card xcard" id="xSix"><h2>6-mark question trainer <span class="note">'+done+' of '+SIX.length+' tried</span></h2><p class="note" style="font-size:15px">Write a full answer, then mark it yourself against the mark scheme points, the way an AQA examiner would. Practicals, explain and evaluate questions.</p><div class="xsix">'+
   SIX.map(function(q){var s=st[q.id];return '<button type="button" class="q" data-six="'+q.id+'"><span class="tg">'+q.s+'</span><span>'+esc(q.short)+'</span><span class="sc">'+(s?'Best '+s.best+'/6':'New')+'</span></button>'}).join('')+'</div></div>'}
 function sixOpen(id){var q=SIX.filter(function(x){return x.id===id})[0];if(!q)return;var ov=document.createElement('div');ov.className='xov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','6-mark question');document.body.appendChild(ov);document.body.classList.add('noscroll');
  var t0=Date.now(),tm=0;function close(){clearInterval(tm);ov.remove();document.body.classList.remove('noscroll');try{EXAM.render()}catch(e){}}
  function write(){ov.innerHTML='<div class="xin"><div class="xtop"><b>'+(q.s==='Physics'?'GCSE Physics':'GCSE Chemistry')+' · 6 marks</b><button type="button" class="xclose">Close</button></div><div class="xqbox"><span class="m">'+q.s.toUpperCase()+' · 6 MARKS</span><p style="margin:6px 0 0">'+q.q+'</p></div><div class="xmeta"><span data-k="wc">0 words</span><span data-k="tm">0:00</span><span>Aim for about 7 minutes and 100 to 150 words</span></div><textarea placeholder="Write your answer in full sentences. Plan it in a logical order." aria-label="Your answer"></textarea><div class="xbtns"><button type="button" class="xbtn" data-a="mark">Mark my answer</button></div></div>';
   var ta=ov.querySelector('textarea'),wc=ov.querySelector('[data-k=wc]'),tme=ov.querySelector('[data-k=tm]');ta.value=q._draft||'';function cnt(){var n=(ta.value.trim().match(/\S+/g)||[]).length;wc.textContent=n+' word'+(n===1?'':'s')}cnt();ta.oninput=function(){q._draft=ta.value;cnt()};
   tm=setInterval(function(){var s=Math.floor((Date.now()-t0)/1000);tme.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');tme.style.color=s>480?'var(--warn)':''},1000);
   ov.querySelector('.xclose').onclick=close;ov.querySelector('[data-a=mark]').onclick=function(){if((ta.value.trim().match(/\S+/g)||[]).length<15){wc.textContent='Write a bit more first (15 words or more)';wc.style.color='var(--warn)';return}clearInterval(tm);mark(ta.value)};setTimeout(function(){ta.focus()},50)}
  function mark(ans){var low=ans.toLowerCase();ov.innerHTML='<div class="xin"><div class="xtop"><b>Mark your answer</b><button type="button" class="xclose">Close</button></div><div class="xqbox"><span class="m">YOUR ANSWER</span><p style="margin:6px 0 0;white-space:pre-wrap">'+esc(ans)+'</p></div><p style="margin:0">Tick every point your answer makes clearly. Green ones look like they\'re in there, but you decide.</p><div class="xpts">'+
   q.pts.map(function(p,i){var hit=p.k.some(function(k){return new RegExp(k,'i').test(low)});return '<label class="'+(hit?'sug':'')+'"><input type="checkbox" data-i="'+i+'"'+(hit?' checked':'')+'><span>'+p.p+(hit?' <span class="hint">looks like it\'s there</span>':'')+'</span></label>'}).join('')+
   '</div><label style="display:flex;gap:8px;align-items:center;font-size:15px"><input type="checkbox" data-k="order" style="width:20px;height:20px"> My answer is in a logical order, with the points linked together</label><div class="xscore" data-k="sc"></div><details><summary style="cursor:pointer;font-weight:700">See a model answer</summary><div class="xmodel" style="margin-top:8px">'+q.model+'</div></details><div class="xbtns"><button type="button" class="xbtn" data-a="save">Save my mark</button><button type="button" class="xbtn alt" data-a="retry">Try it again</button></div></div>';
   var boxes=ov.querySelectorAll('.xpts input'),ord=ov.querySelector('[data-k=order]'),sc=ov.querySelector('[data-k=sc]');
   function score(){var n=[].filter.call(boxes,function(b){return b.checked}).length,lv=n>=5?3:n>=3?2:n>=1?1:0,mk=lv?lv*2-(ord.checked?0:1):0;return {n:n,lv:lv,mk:mk}}
   function upd(){var r=score();sc.innerHTML='<div class="xnum">'+r.mk+'/6</div><p><b>'+(r.lv?'Level '+r.lv:'No marks yet')+'</b> · '+r.n+' of '+q.pts.length+' points.<br>'+(r.lv===3?'Detailed and coherent. That\'s the top band.':r.lv===2?'Good, but add more detail and link the points for level 3.':r.lv===1?'Some relevant points. Level 2 needs more, in a clear order.':'Check the points above against your answer.')+'</p>'}
   [].forEach.call(boxes,function(b){b.onchange=upd});ord.onchange=upd;upd();
   ov.querySelector('.xclose').onclick=close;ov.querySelector('[data-a=retry]').onclick=function(){t0=Date.now();write()};
   ov.querySelector('[data-a=save]').onclick=function(){var r=score(),st=sixState(),o=st[q.id]||{best:0,n:0};o.n++;o.best=Math.max(o.best,r.mk);o.last=today();var first=o.n===1;st[q.id]=o;q._draft='';save();addXP(first?20:8);toast('📝','Marked: '+r.mk+'/6',(first?'+20':'+8')+' XP · best '+o.best+'/6','quest');close()}}
  write()}
 function wireSix(){[].forEach.call(document.querySelectorAll('#xSix [data-six]'),function(b){b.onclick=function(){sixOpen(b.getAttribute('data-six'))}})}

 /* the Exams page gets the countdown, the timetable and the trainer at the top */
 if(typeof EXAM!=='undefined'&&EXAM.render){var er0=EXAM.render;EXAM.render=function(){er0.apply(this,arguments);try{var pg=$('page-exam');if(!pg)return;var box=document.createElement('div');box.className='xexam';box.style.cssText='display:flex;flex-direction:column;gap:16px;margin-bottom:16px';box.innerHTML=cdCard()+sixCard();pg.insertBefore(box,pg.firstChild);wireCd();wireSix()}catch(e){if(window.console)console.error(e)}}}

 return {_finish:function(){finish()},drain:drain,focus:focusOpen,weakest:weakest,uStats:uStats,fixUnits:fixUnits,weekData:weekData,six:sixOpen,timetable:timetable,otLine:otLine};
})();
try{window.XTRA=XTRA;window.__crit.startLesson=startLesson}catch(e){}
/* ===== extras end ===== */
