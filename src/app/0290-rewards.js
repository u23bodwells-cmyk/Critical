/* ===== rewards: bonus XP for doing more Critical, and things to unlock ===== */
var REW=(function(){
 var GIFT='<svg viewBox="0 0 24 24" fill="none" stroke="#7F77DD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
 var PAL={purple:['Reactor purple',null,'#534AB7'],
  teal:['Coolant teal',['#0F6E56','#E1F5EE','#085041','#5DCAA5','#0c3a30','#c4efe0']],
  blue:['Cherenkov blue',['#185FA5','#E6F1FB','#0C447C','#85B7EB','#10304f','#d2e5f8']],
  green:['Turbine green',['#3B6D11','#EAF3DE','#27500A','#97C459','#233a10','#dcedc4']],
  amber:['Warning amber',['#854F0B','#FAEEDA','#633806','#EF9F27','#3d2a0c','#fae0b8']],
  red:['Alarm red',['#A32D2D','#FCEBEB','#791F1F','#F09595','#4a1a1a','#fbd6d6']],
  graphite:['Graphite',['#444441','#F1EFE8','#2C2C2A','#D3D1C7','#2f2f2c','#eeece6']],
  gold:['Director gold',['#8a6a08','#faf1d2','#5e4705','#e6c25a','#3a300f','#f6e7b8']]};
 var FXC={confetti:['Confetti',['#7F77DD','#1D9E75','#D85A30']],glow:['Reactor glow',['#5ec8ff','#9fe4ff','#2f7bd1']],atoms:['Neutron burst',['#D85A30','#378ADD','#1D9E75']],gold:['Golden confetti',['#f5c542','#e0a526','#c98a12']]};
 var EXN={visitor:'Visitor centre',wind:'Wind farm',night:'Night sky',flag:'Station flag'};
 var UNL=[['c-teal','accent','teal',['xp',250]],['fx-glow','fx','glow',['xp',500]],['c-blue','accent','blue',['xp',800]],['ex-visitor','ex','visitor',['xp',1200]],
  ['c-green','accent','green',['xp',1800]],['ex-wind','ex','wind',['xp',2600]],['fx-atoms','fx','atoms',['xp',3500]],['c-amber','accent','amber',['xp',4500]],
  ['c-red','accent','red',['xp',6000]],['ex-night','ex','night',['xp',8000]],['c-gold','accent','gold',['xp',10000]],
  ['ex-flag','ex','flag',['streak',3]],['fx-gold','fx','gold',['streak',5]],['c-graphite','accent','graphite',['streak',10]]];
 var css=document.createElement('style');css.textContent='.rwspin{animation:rwspin 6s linear infinite}.rwspin.s2{animation-duration:4.5s}@keyframes rwspin{to{transform:rotate(360deg)}}.rwtw{animation:rwtw 3s ease-in-out infinite}.rwtw.d2{animation-delay:1s}.rwtw.d3{animation-delay:2s}@keyframes rwtw{50%{opacity:.25}}@media (prefers-reduced-motion:reduce){.rwspin,.rwtw{animation:none}}'+
  '.rwcard h3{font-size:15px;margin:16px 0 2px}.rwgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin:8px 0 4px}'+
  '.rwit{display:flex;align-items:center;gap:10px;text-align:left;background:var(--soft);border:2px solid transparent;border-radius:12px;padding:8px 10px;font:inherit;color:var(--text);cursor:pointer;min-width:0}.rwit:hover{background:var(--soft2)}.rwit.on{border-color:var(--accent);background:var(--accent-bg)}.rwit.lock{cursor:default;background:transparent;border:1.5px dashed var(--line)}.rwit.lock:hover{background:transparent}'+
  '.rwit .rwt{min-width:0}.rwit b{display:block;font-size:14px;font-weight:600}.rwit .rwt span{display:block;font-size:12px;color:var(--muted)}.rwit.lock b{color:var(--muted)}'+
  '.rwsw{width:22px;height:22px;border-radius:50%;flex:none;border:2px solid var(--panel);box-shadow:0 0 0 1px var(--line)}.rwdots{display:flex;gap:2px;flex:none;width:22px;flex-wrap:wrap}.rwdots i{width:9px;height:9px;border-radius:50%;display:block}.rwico{width:22px;height:22px;flex:none;color:var(--muted)}'+
  '.rwms{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 6px}.rwms span{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--soft);color:var(--muted)}.rwms span.ok{background:var(--good-bg);color:var(--good)}';
 document.head.appendChild(css);
 var pend=[];
 function R(){if(!S.rw||typeof S.rw!=='object')S.rw={};var r=S.rw;if(!r.unl||typeof r.unl!=='object')r.unl={};if(!r.look||typeof r.look!=='object')r.look={accent:'purple',fx:'confetti',ex:{}};if(!r.look.ex)r.look.ex={};if(!r.bonus)r.bonus={};if(!r.wk)r.wk={k:'',got:{}};if(!r.wk.got)r.wk.got={};return r}
 function dk(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 function streak(){var p=S.pdays||{},d=new Date(),n=0;for(var i=0;i<400;i++){var k=dk(d),g=d.getDay();if(p[k])n++;else if(i>0&&g!==0&&g!==6)break;d.setDate(d.getDate()-1)}return n}
 function mult(n){return n>=10?1.5:n>=5?1.25:n>=3?1.1:1}
 function note(t,sub){pend.push([t,sub]);flush()}
 function flush(){while(pend.length&&!(typeof P!=='undefined'&&P&&P.quiet)){var x=pend.shift();toast(GIFT,x[0],x[1],'badge')}}
 function MS(){var sc=PLAN.schoolMins(),tot=PLAN.TOTAL,a=[[60,20,0,'1 hour of your plan this week'],[120,40,0,'2 hours of your plan this week']];if(sc>120)a.push([sc,75,1,'Every school day\'s plan done']);if(tot>Math.max(120,sc))a.push([tot,150,0,'The whole week\'s plan done']);return a}
 function planTick(){flush();if(typeof PLAN==='undefined'||!PLAN.fullInfo)return;var f=PLAN.fullInfo(),k=ymdL(),r=R(),ch=false;if(!S.pdays||typeof S.pdays!=='object')S.pdays={};var cur=S.pdays[k];
  if(f.full){if(cur!=='f'){S.pdays[k]='f';ch=true}if(!r.bonus[k]){var b=Math.max(20,f.mins);r.bonus[k]=b;save();addXP(b);note('Whole plan done: +'+b+' bonus XP','For doing all of today\'s plan')}}
  else if(f.early){if(!cur){S.pdays[k]='e';ch=true}}
  else if(f.quick){if(cur!=='q'){S.pdays[k]='q';ch=true}}
  else if(cur){delete S.pdays[k];ch=true}
  var st=streak();if(st>(r.best||0)){r.best=st;ch=true}
  var wk=PLAN.wkKey(),m=PLAN.wkMins();if(r.wk.k!==wk){r.wk={k:wk,got:{}};ch=true}
  MS().forEach(function(x){if(m>=x[0]&&!r.wk.got[x[0]]){r.wk.got[x[0]]=1;ch=true;var fz=x[2]&&(S.freeze||0)<2;if(fz)S.freeze=(S.freeze||0)+1;save();addXP(x[1]);note(x[3]+': +'+x[1]+' XP',fz?'And a streak freeze':'Weekly milestone')}});
  if(ch){for(var d in r.bonus){if(Object.keys(r.bonus).length>40)delete r.bonus[d];else break}save();check()}}
 function have(u){var n=u[3];return n[0]==='xp'?S.xp>=n[1]:Math.max(R().best||0,streak())>=n[1]}
 function uname(u){return u[1]==='accent'?PAL[u[2]][0]:u[1]==='fx'?FXC[u[2]][0]:EXN[u[2]]}
 function check(){var r=R(),nw=[];UNL.forEach(function(u){if(!r.unl[u[0]]&&have(u)){r.unl[u[0]]=ymdL();nw.push(u)}});if(!nw.length)return;save();
  if(!r.init){r.init=1;save();if(nw.length>1){note(nw.length+' rewards unlocked','Try them on the Progress page');return}}
  nw.forEach(function(u){note('Unlocked: '+uname(u),'Try it on the Progress page')})}
 function lessonBonus(){if(typeof P==='undefined'||!P||P._rb||!P.finished)return;P._rb=1;var st=streak(),m=mult(st),x=P.xp||0,b=Math.round(x*(m-1));if(b<1)return;addXP(b);
  var ds=document.querySelector('#pBody .done-screen');if(ds){var e=document.createElement('p');e.className='note rwm';e.style.cssText='text-align:center;margin:4px 0 10px';e.innerHTML='Plan streak <b>×'+m+'</b> ('+st+' days in a row): <b>+'+b+' bonus XP</b>';var an=ds.querySelector('.dblock');if(an)ds.insertBefore(e,an);else ds.appendChild(e)}
  var px=document.getElementById('pXP');if(px)px.textContent='+'+(x+b)+' XP'}
 function applyLook(){var r=R(),a=r.look.accent,p=PAL[a]&&PAL[a][1],el=document.getElementById('rwLook');if(!el){el=document.createElement('style');el.id='rwLook';document.head.appendChild(el)}
  if(!p||!r.unl['c-'+a]){el.textContent='';return}var L='--accent:'+p[0]+';--accent-bg:'+p[1]+';--accent-text:'+p[2],K='--accent:'+p[3]+';--accent-bg:'+p[4]+';--accent-text:'+p[5];
  el.textContent=':root{'+L+'}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){'+K+'}}:root[data-theme="dark"]{'+K+'}'}
 function on(id){var r=R();return !!(r.unl['ex-'+id]&&r.look.ex[id])}
 function back(){var s='';
  if(on('night')){s+='<rect x="0" y="62" width="640" height="174" rx="14" fill="#1b2350" opacity=".1"/><path d="M606 76a10 10 0 1 0 8 17 8 8 0 1 1-8-17z" fill="#f3d27a"/>';
   [[240,78],[262,98],[290,74],[318,92],[352,76],[384,100],[410,80],[436,96],[566,100],[582,74],[630,108],[44,80],[70,100],[22,112],[226,108]].forEach(function(p,i){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.8" fill="#f3d27a" class="rwtw'+(i%3===1?' d2':i%3===2?' d3':'')+'"/>'})}
  if(on('wind'))s+='<g><path d="M592 172V130M618 172V138" stroke="var(--faint)" stroke-width="2"/><g transform="translate(592 130)"><g class="rwspin"><path d="M0 0V-13M0 0L11.3 6.5M0 0L-11.3 6.5" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/></g><circle r="2" fill="var(--muted)"/></g><g transform="translate(618 138)"><g class="rwspin s2"><path d="M0 0V-11M0 0L9.5 5.5M0 0L-9.5 5.5" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/></g><circle r="1.8" fill="var(--muted)"/></g></g>';
  return s}
 function front(){var s='';
  if(on('visitor'))s+='<g><rect x="12" y="184" width="40" height="16" rx="2" fill="var(--panel)" stroke="var(--muted)" stroke-width="1.5"/><path d="M9 185 L32 175 L55 185" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linejoin="round"/><rect x="28" y="191" width="8" height="9" fill="var(--accent-bg)" stroke="var(--muted)" stroke-width="1"/><rect x="16" y="188" width="8" height="5" fill="var(--accent-bg)"/><rect x="40" y="188" width="8" height="5" fill="var(--accent-bg)"/><title>Visitor centre</title></g>';
  if(on('flag'))s+='<g><path d="M544 200V146" stroke="var(--muted)" stroke-width="1.6"/><path d="M544 146 L563 151.5 L544 157Z" fill="var(--accent)"/><title>Station flag</title></g>';
  return s}
 var ICO={visitor:'<path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5"/>',wind:'<path d="M12 21V11M12 11V4M12 11l6 3.5M12 11l-6 3.5"/>',night:'<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'};
 function need(u){var n=u[3];return n[0]==='xp'?fmtInt(n[1])+' XP ('+fmtInt(Math.max(0,n[1]-S.xp))+' to go)':n[1]+'-day plan streak'}
 function item(u,eq){var r=R(),ok=u[0]==='c-purple'||u[0]==='fx-confetti'||!!r.unl[u[0]],k=u[1],v=u[2],nm=uname(u),ic;
  if(k==='accent')ic='<span class="rwsw" style="background:'+(PAL[v][1]?PAL[v][1][0]:PAL[v][2])+'"></span>';
  else if(k==='fx')ic='<span class="rwdots">'+FXC[v][1].map(function(c){return '<i style="background:'+c+'"></i>'}).join('')+'</span>';
  else ic='<svg class="rwico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICO[v]+'</svg>';
  var sub=!ok?need(u):k==='ex'?(eq?'On: tap to hide':'Tap to show'):(eq?'Using this':'Tap to use');
  return '<button type="button" class="rwit'+(ok?(eq?' on':''):' lock')+'"'+(ok?' data-k="'+k+'" data-v="'+v+'"':' aria-disabled="true"')+'>'+ic+'<span class="rwt"><b>'+(ok?'':'🔒 ')+nm+'</b><span>'+sub+'</span></span></button>'}
 function card(){var r=R();check();var st=streak(),m=mult(st),k=ymdL(),f=PLAN.fullInfo(),wm=PLAN.wkMins(),ms=MS(),cw=r.wk.k===PLAN.wkKey(),nx=ms.filter(function(x){return wm<x[0]})[0],lk=r.look;
  var h='<div class="card rwcard" id="rwCard"><h2>Rewards</h2><p class="note" style="font-size:15px">The more Critical you do, the more you get: bonus XP for doing your whole plan, and colours and power station extras to unlock.</p>'+
   '<div class="stats"><div class="stat"><p>Plan streak</p><b>'+st+' day'+(st===1?'':'s')+'</b><span class="small">'+(m>1?'×'+m+' XP on lessons':'3 in a row for ×1.1 XP')+'</span></div>'+
   '<div class="stat"><p>Whole-plan bonus today</p><b>'+(r.bonus[k]?'+'+r.bonus[k]+' ✓':'+'+Math.max(20,PLAN.dayMins())+' XP')+'</b><span class="small">'+(r.bonus[k]?'Got it today':f.early?'Not with Finished early':'Do all of today\'s plan')+'</span></div>'+
   '<div class="stat"><p>Plan this week</p><b>'+wm+' min</b><span class="small">'+(nx?'Next: '+nx[0]+' min, +'+nx[1]+' XP':'Every milestone done ✓')+'</span></div></div>'+
   '<div class="rwms">'+ms.map(function(x){var ok=cw&&!!r.wk.got[x[0]];return '<span class="'+(ok?'ok':'')+'">'+(ok?'✓ ':'')+x[0]+' min: +'+x[1]+' XP'+(x[2]?' and a streak freeze':'')+'</span>'}).join('')+'</div>'+
   '<p class="note">Your plan streak is how many school days in a row you\'ve done your plan (Finished early and a finished 2-minute Just start count too). 3 days in a row gives ×1.1 XP on lessons, 5 days ×1.25 and 10 days ×1.5. Your best is '+(r.best||0)+'.</p>';
  h+='<h3>App colour</h3><div class="rwgrid">'+item(['c-purple','accent','purple',['xp',0]],lk.accent==='purple'||!r.unl['c-'+lk.accent])+UNL.filter(function(u){return u[1]==='accent'}).map(function(u){return item(u,lk.accent===u[2]&&!!r.unl[u[0]])}).join('')+'</div>';
  h+='<h3>Lesson celebration</h3><div class="rwgrid">'+item(['fx-confetti','fx','confetti',['xp',0]],lookFx()==='confetti')+UNL.filter(function(u){return u[1]==='fx'}).map(function(u){return item(u,lookFx()===u[2])}).join('')+'</div>';
  h+='<h3>Power station extras</h3><div class="rwgrid">'+UNL.filter(function(u){return u[1]==='ex'}).map(function(u){return item(u,on(u[2]))}).join('')+'</div></div>';
  return h}
 function wire(){var c=document.getElementById('rwCard');if(!c)return;[].forEach.call(c.querySelectorAll('.rwit[data-k]'),function(b){b.onclick=function(){var r=R(),k=b.dataset.k,v=b.dataset.v;
  if(k==='accent')r.look.accent=v;else if(k==='fx'){r.look.fx=v}else r.look.ex[v]=r.look.ex[v]?0:1;save();applyLook();if(k==='fx')confetti();renderReview()}})}
 applyLook();setTimeout(function(){try{check()}catch(_){}},1500);
 return {planTick:planTick,check:check,lessonBonus:lessonBonus,card:card,wire:wire,back:back,front:front,streak:streak,mult:mult,applyLook:applyLook}
})();
try{window.REW=REW}catch(_){}
