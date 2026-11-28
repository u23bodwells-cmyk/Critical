/* ===== New look: live animations and juicier feedback. Settings → Look → Classic turns all of it off. ===== */
var NEO=(function(){
 var LK='critical_look',MK='critical_motion',SEEN='critical_neo_seen',R=document.documentElement;
 function look(){try{var v=localStorage.getItem(LK);return v==='classic'?'classic':v==='legacy'?'legacy':'neo'}catch(_){return 'neo'}}
 function on(){return R.classList.contains('neo')}
 function motPref(){try{var v=localStorage.getItem(MK);return v==='full'||v==='less'?v:'auto'}catch(_){return 'auto'}}
 function sysCalm(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}}
 function calm(){var m=motPref();return m==='less'||(m==='auto'&&sysCalm())}
 function playerOpen(){var p=$('player');return !!(p&&p.classList.contains('open'))}
 function fonts(){if(document.getElementById('neoFonts'))return;var l=document.createElement('link');l.id='neoFonts';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;600;700&display=swap';document.head.appendChild(l)}
 function hex(v){v=String(v||'').trim();var m=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);if(m){var h=m[1];if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}m=/rgba?\(([^)]+)\)/.exec(v);if(m){var p=m[1].split(/[ ,\/]+/).map(Number);return [p[0]||0,p[1]||0,p[2]||0]}return [58,212,255]}
 var COL={};function cols(){COL={glow:hex(cssv('--glow')),glow2:hex(cssv('--glow2')),accent:hex(cssv('--accent')),line:hex(cssv('--line')),good:hex(cssv('--good-line')),dark:isDark()}}
 function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(+a).toFixed(3)+')'}

 /* ---------- live background: drifting neutrons with the odd fission flash ---------- */
 var bg={cv:null,c:null,ps:[],fr:[],fl:[],w:0,h:0,raf:0,last:0,next:0};
 function np(w,h){return {x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.3+.7,a:Math.random()*.45+.3,ph:Math.random()*6.28}}
 function bgInit(){if(bg.cv)return;var c=document.createElement('canvas');c.id='neoBg';c.setAttribute('aria-hidden','true');document.body.insertBefore(c,document.body.firstChild);bg.cv=c;bg.c=c.getContext('2d');bgSize();window.addEventListener('resize',function(){bgSize();bgKick()})}
 function bgSize(){if(!bg.cv)return;var dpr=Math.min(1.5,window.devicePixelRatio||1),w=innerWidth,h=innerHeight;bg.w=w;bg.h=h;bg.cv.width=Math.round(w*dpr);bg.cv.height=Math.round(h*dpr);bg.c.setTransform(dpr,0,0,dpr,0,0);
  var n=Math.max(16,Math.min(54,Math.round(w*h/26000)));while(bg.ps.length<n)bg.ps.push(np(w,h));bg.ps.length=n;bg.ps.forEach(function(p){if(p.x>w)p.x=Math.random()*w;if(p.y>h)p.y=Math.random()*h});bgDraw(performance.now())}
 function bgRun(){return on()&&!calm()&&document.visibilityState==='visible'&&!playerOpen()&&PAGE!=='sim'}
 function bgKick(){if(!bg.cv)return;if(bgRun()){if(!bg.raf){bg.last=0;bg.raf=requestAnimationFrame(bgStep)}}else{if(bg.raf){cancelAnimationFrame(bg.raf);bg.raf=0}bgDraw(performance.now())}}
 function bgStep(t){bg.raf=0;if(!bgRun())return;bg.raf=requestAnimationFrame(bgStep);if(bg.last&&t-bg.last<32)return;var dt=bg.last?Math.min(64,t-bg.last):16;bg.last=t;var w=bg.w,h=bg.h,k=dt/16;
  bg.ps.forEach(function(p){p.x+=p.vx*k;p.y+=p.vy*k;if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;var sp=Math.hypot(p.vx,p.vy);if(sp>.26){p.vx*=.985;p.vy*=.985}});
  bg.fr=bg.fr.filter(function(f){f.x+=f.vx*k;f.y+=f.vy*k;f.life-=dt;return f.life>0});
  if(t>bg.next){bg.next=t+2600+Math.random()*4200;var p=bg.ps[Math.floor(Math.random()*bg.ps.length)];if(p){bg.fl.push({x:p.x,y:p.y,t:t});for(var i=0;i<3;i++){var a=Math.random()*6.28,s=.9+Math.random()*.9;bg.fr.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1300,max:1300})}var a2=Math.random()*6.28;p.vx=Math.cos(a2)*.7;p.vy=Math.sin(a2)*.7}}
  bgDraw(t)}
 function bgDraw(t){if(!bg.c)return;var c=bg.c,w=bg.w,h=bg.h;c.clearRect(0,0,w,h);if(!on())return;var g=COL.glow||[58,212,255],dk=COL.dark,ps=bg.ps,L=118,L2=L*L,i,j,p,q;
  c.lineWidth=1;for(i=0;i<ps.length;i++){p=ps[i];for(j=i+1;j<ps.length;j++){q=ps[j];var dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy;if(d2<L2){c.strokeStyle=rgba(g,(1-d2/L2)*(dk?.15:.11));c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}}
  for(i=0;i<ps.length;i++){p=ps[i];var tw=.65+.35*Math.sin(t/900+p.ph);c.fillStyle=rgba(g,p.a*tw*(dk?.95:.6));c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill()}
  bg.fr.forEach(function(f){var u=f.life/f.max;c.fillStyle=rgba(g,u*(dk?.9:.6));c.beginPath();c.arc(f.x,f.y,1.6,0,6.283);c.fill()});
  bg.fl=bg.fl.filter(function(f){var u=(t-f.t)/1000;if(u>1||u<0)return u<0;var rr=3+u*30,gr=c.createRadialGradient(f.x,f.y,0,f.x,f.y,rr);gr.addColorStop(0,rgba(g,(dk?.55:.35)*(1-u)));gr.addColorStop(1,rgba(g,0));c.fillStyle=gr;c.beginPath();c.arc(f.x,f.y,rr,0,6.283);c.fill();return true})}

 /* ---------- the reactor core: today's XP goal as reactor power ---------- */
 var core={cv:null,raf:0,v:0,from:0,to:0,t0:0,last:0};
 function dailyXP(){return S.daily&&S.daily.d===today()?S.daily.xp:0}
 function coreMount(){if(!on())return;var rb=document.querySelector('#page-learn .hero .ringbox');if(!rb)return;var dx=dailyXP(),g=S.goal||50,f=Math.min(1,dx/g),full=dx>=g;
  rb.classList.add('neocore');rb.classList.toggle('full',full);rb.title='Your daily goal. Every XP you earn today brings the reactor closer to full power.';
  rb.innerHTML='<div class="ncw"><canvas aria-hidden="true"></canvas><div class="ncv"><b id="ncPct">'+Math.round(core.v*100)+'%</b><span>power</span></div></div><div class="lbl"><b>'+(full?'Full power: goal reached!':'Reactor power')+'</b><span>Today: '+fmtInt(dx)+' of '+fmtInt(g)+' XP</span></div>';
  rb.setAttribute('role','img');rb.setAttribute('aria-label','Daily goal: '+dx+' of '+g+' XP today');
  core.cv=rb.querySelector('canvas');core.from=core.v;core.to=f;core.t0=performance.now();if(calm()){core.v=f;coreDraw(performance.now())}else coreKick()}
 function coreRun(){return on()&&core.cv&&core.cv.isConnected&&PAGE==='learn'&&document.visibilityState==='visible'&&!playerOpen()&&!calm()}
 function coreKick(){if(!core.raf&&coreRun()){core.last=0;core.raf=requestAnimationFrame(coreStep)}}
 function coreStep(t){core.raf=0;if(!coreRun()){if(core.cv&&core.cv.isConnected){core.v=core.to;coreDraw(t)}return}core.raf=requestAnimationFrame(coreStep);
  var u=Math.min(1,(t-core.t0)/1400),anim=u<1;if(!anim&&core.last&&t-core.last<48)return;core.last=t;core.v=core.from+(core.to-core.from)*(1-Math.pow(1-u,3));var e=$('ncPct');if(e)e.textContent=Math.round(core.v*100)+'%';coreDraw(t)}
 function coreDraw(t){var cv=core.cv;if(!cv||!cv.isConnected)return;var W=cv.clientWidth||168,dpr=Math.min(2,window.devicePixelRatio||1);if(cv.width!==Math.round(W*dpr)){cv.width=cv.height=Math.round(W*dpr)}
  var c=cv.getContext('2d'),s=W/168;c.setTransform(dpr*s,0,0,dpr*s,0,0);c.clearRect(0,0,168,168);var cx=84,cy=84,f=Math.max(0,Math.min(1,core.v)),g=COL.glow||[58,212,255],g2=COL.glow2||[143,128,255],ln=COL.line||[60,70,90],full=core.to>=1&&f>.995,i;
  // dial ticks
  for(i=0;i<60;i++){var a=-Math.PI/2+i/60*Math.PI*2,lit=(i+.5)/60<=f,r2=i%5===0?70:73.5;c.strokeStyle=lit?rgba(g,.95):rgba(ln,COL.dark?.9:1);c.lineWidth=i%5===0?2:1.4;c.beginPath();c.moveTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);c.lineTo(cx+Math.cos(a)*79,cy+Math.sin(a)*79);c.stroke()}
  // power arc
  c.lineCap='round';c.lineWidth=6;c.strokeStyle=rgba(ln,COL.dark?.6:.8);c.beginPath();c.arc(cx,cy,63,0,6.283);c.stroke();
  if(f>0.003){var gr=c.createLinearGradient(20,148,148,20);gr.addColorStop(0,rgba(g2,1));gr.addColorStop(1,rgba(g,1));c.save();c.shadowColor=rgba(g,.8);c.shadowBlur=12;c.strokeStyle=gr;c.beginPath();c.arc(cx,cy,63,-Math.PI/2,-Math.PI/2+f*6.283);c.stroke();c.restore();
   var ha=-Math.PI/2+f*6.283,hx=cx+Math.cos(ha)*63,hy=cy+Math.sin(ha)*63;c.save();c.shadowColor=rgba(g,1);c.shadowBlur=14;c.fillStyle='#fff';c.beginPath();c.arc(hx,hy,3.6,0,6.283);c.fill();c.restore()}
  // the pool and the core
  var br=.18+.82*f,breathe=1+.05*Math.sin(t/700);var pool=c.createRadialGradient(cx,cy,4,cx,cy,54);pool.addColorStop(0,'#0b2142');pool.addColorStop(1,'#050b18');c.fillStyle=pool;c.beginPath();c.arc(cx,cy,54,0,6.283);c.fill();
  var gl=c.createRadialGradient(cx,cy,0,cx,cy,52*breathe);gl.addColorStop(0,rgba([200,245,255],.85*br));gl.addColorStop(.35,rgba(g,.65*br));gl.addColorStop(1,rgba(g,0));c.fillStyle=gl;c.beginPath();c.arc(cx,cy,54,0,6.283);c.fill();
  // fuel assemblies (hex grid)
  var hs=8.2,qr=[[0,0],[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1],[2,0],[2,-1],[2,-2],[1,-2],[0,-2],[-1,-1],[-2,0],[-2,1],[-2,2],[-1,2],[0,2],[1,1]];
  qr.forEach(function(h,k){var x=cx+hs*1.5*h[0]*1.0,y=cy+hs*Math.sqrt(3)*(h[1]+h[0]/2);var fl=.75+.25*Math.sin(t/(380+k*37)+k*1.7),inten=br*fl*(1-Math.hypot(x-cx,y-cy)/70);
   c.beginPath();for(var j=0;j<6;j++){var aa=Math.PI/3*j,px=x+Math.cos(aa)*(hs-1.3),py=y+Math.sin(aa)*(hs-1.3);if(j)c.lineTo(px,py);else c.moveTo(px,py)}c.closePath();
   c.fillStyle=rgba([150,232,255],Math.max(.05,inten*.55));c.fill();c.strokeStyle=rgba([170,235,255],.12+inten*.35);c.lineWidth=.8;c.stroke()});
  if(full){var pu=(t%1800)/1800;c.strokeStyle=rgba(g,.5*(1-pu));c.lineWidth=2;c.beginPath();c.arc(cx,cy,54+pu*24,0,6.283);c.stroke()}}

 /* ---------- one canvas for bursts and confetti ---------- */
 var fx={cv:null,c:null,ps:[],raf:0,w:0,h:0};
 function fxInit(){if(fx.cv)return;var c=document.createElement('canvas');c.id='neoFx';c.setAttribute('aria-hidden','true');document.body.appendChild(c);fx.cv=c;fx.c=c.getContext('2d');fxSize();window.addEventListener('resize',fxSize)}
 function fxSize(){if(!fx.cv)return;var dpr=Math.min(2,window.devicePixelRatio||1);fx.w=innerWidth;fx.h=innerHeight;fx.cv.width=Math.round(fx.w*dpr);fx.cv.height=Math.round(fx.h*dpr);fx.c.setTransform(dpr,0,0,dpr,0,0)}
 function fxKick(){if(!fx.raf)fx.raf=requestAnimationFrame(fxStep)}
 function fxStep(t){fx.raf=0;var c=fx.c,dt=16;c.clearRect(0,0,fx.w,fx.h);fx.ps=fx.ps.filter(function(p){p.life-=dt;if(p.life<=0)return false;p.vy+=p.g;p.vx*=p.drag;p.vy*=p.drag;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;var u=Math.min(1,p.life/p.fade);c.globalAlpha=u;
   if(p.k==='ring'){p.s+=p.grow;c.strokeStyle=p.col;c.lineWidth=2.5*u+.5;c.shadowColor=p.col;c.shadowBlur=12;c.beginPath();c.arc(p.x,p.y,p.s,0,6.283);c.stroke();c.shadowBlur=0}
   else if(p.k==='rect'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(1,Math.cos(p.rot*1.7));c.fillStyle=p.col;c.fillRect(-p.s/2,-p.s*.7,p.s,p.s*1.4);c.restore()}
   else{c.fillStyle=p.col;c.shadowColor=p.col;c.shadowBlur=p.glow||0;c.beginPath();c.arc(p.x,p.y,p.s*(p.shrink?u:1),0,6.283);c.fill();c.shadowBlur=0}return p.y<fx.h+40});
  c.globalAlpha=1;if(fx.ps.length)fxKick()}
 function burst(x,y,o){if(!on()||calm())return;fxInit();o=o||{};var n=o.n||18,cs=o.cols||(COL.dark?[rgba(COL.good||[90,190,90],1),'#ffffff',rgba(COL.glow||[58,212,255],1)]:[rgba(COL.good||[90,190,90],1),rgba(COL.accent||[83,74,183],1),rgba(COL.glow||[10,159,208],1)]);
  for(var i=0;i<n;i++){var a=(o.up?-Math.PI/2:0)+(o.up?(Math.random()-.5)*(o.spread||2.4):Math.random()*6.283),sp=(o.speed||5)*(.45+Math.random()*.75);
   fx.ps.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:o.g==null?.1:o.g,drag:.94,life:o.life||800,fade:o.life||800,s:o.size||(2.2+Math.random()*3),col:cs[i%cs.length],k:'dot',glow:o.glow==null?14:o.glow,shrink:true,rot:0,vr:0})}
  if(o.ring!==false)fx.ps.push({x:x,y:y,vx:0,vy:0,g:0,drag:1,life:520,fade:520,s:o.ringFrom||14,grow:o.ringGrow||3.2,col:cs[0],k:'ring',rot:0,vr:0});fxKick()}
 function confettiNeo(){fxInit();var fxk=lookFx(),round=fxk==='glow'||fxk==='atoms',cs=fxk==='glow'?['#5ec8ff','#9fe4ff','#3aa0ff','#c9f1ff','#7fd3ff','#2f7bd1']:fxk==='gold'?['#f5c542','#e0a526','#ffd96b','#c98a12','#fff1b3','#b8860b']:fxk==='atoms'?['#D85A30','#378ADD','#7F77DD','#1D9E75','#EF9F27','#D4537E']:['#7F77DD','#1D9E75','#D85A30','#EF9F27','#378ADD','#D4537E','#3ad4ff'];
  var n=Math.min(150,Math.round(fx.w/7));for(var i=0;i<n;i++){var side=i%2,x=side?fx.w*(.85+Math.random()*.2):fx.w*(-.05+Math.random()*.2),a=side?-Math.PI*(.62+Math.random()*.18):-Math.PI*(.2+Math.random()*.18),sp=9+Math.random()*9;
   fx.ps.push({x:x,y:fx.h*.95,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:.22,drag:.975,life:2600+Math.random()*900,fade:700,s:round?3+Math.random()*3:6+Math.random()*5,col:cs[i%cs.length],k:round?'dot':'rect',glow:fxk==='glow'?12:0,rot:Math.random()*6,vr:(Math.random()-.5)*.35})}fxKick()}
 function centre(e){var r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}

 /* ---------- sound and touch feedback ---------- */
 function chime(n){var st=[0,2,4,5,7,9,11,12,14,16,17,19][Math.min(11,Math.max(0,n-1))],f=523.25*Math.pow(2,st/12);beep(f,0,.11,'sine',.07);beep(f*1.5,.055,.16,'sine',.045);beep(f*2,.11,.26,'triangle',.03)}
 function buzz(p){if(calm())return;try{if(navigator.vibrate)navigator.vibrate(p)}catch(_){}}

 /* ---------- combos ---------- */
 var MILE={3:['×3','Combo'],5:['×5','On a roll'],10:['×10','Supercritical'],15:['×15','Unstoppable'],20:['×20','Chain reaction'],30:['×30','Meltdown-proof']};
 function cpop(n){var m=MILE[n]||(n>30&&n%10===0?['×'+n,'Legendary']:null);if(!m||calm())return;var d=document.createElement('div');d.className='neocpop'+(n>=10?' blue':'');d.innerHTML='<b>'+m[0]+'</b><span>'+m[1]+'</span>';(document.getElementById('player')||document.body).appendChild(d);setTimeout(function(){d.remove()},1200)}
 function heat(){var pl=$('player');if(!pl)return;var n=P&&P.combo||0;pl.classList.toggle('neoHot',on()&&n>=5&&!calm());pl.classList.toggle('neoSuper',on()&&n>=10&&!calm())}
 function onRight(){var n=P?P.combo:0;setTimeout(function(){var o=document.querySelector('#pBody .opt.right')||document.querySelector('#pBody .tyin')||document.querySelector('#pBody .numin')||$('pBtn');if(o){var p=centre(o);var r=o.getBoundingClientRect();burst(p[0],p[1],{n:n>=5?34:22,speed:n>=5?7:5.5,ringFrom:Math.min(60,r.height/2),ringGrow:n>=5?4:3})}cpop(n);heat()},0);buzz(12)}
 function onWrong(){setTimeout(function(){var i=document.querySelector('#pBody .tyin')||document.querySelector('#pBody .numin');if(i&&!document.querySelector('#pBody .opt.wrong')){i.classList.remove('neoShake');void i.offsetWidth;i.classList.add('neoShake')}heat()},0);buzz([22,40,22])}

 /* ---------- end of lesson: count-ups, rank progress, full power ---------- */
 function lvAt(x){var i=0;while(i<LEVELS.length-1&&x>=LEVELS[i+1][0])i++;var lo=LEVELS[i][0],hi=i<LEVELS.length-1?LEVELS[i+1][0]:lo+2000;return {i:i,name:LEVELS[i][1],frac:Math.min(1,(x-lo)/(hi-lo)),next:i<LEVELS.length-1?LEVELS[i+1][1]:'',toNext:hi-x}}
 function countNum(e,d){if(!e||e.dataset.nc)return;var m=/^([+−-]?)([\d,]+)(.*)$/.exec(e.textContent.trim());if(!m)return;e.dataset.nc=1;var to=+m[2].replace(/,/g,'');if(!to)return;var t0=performance.now();d=d||900;(function f(t){var u=Math.min(1,(t-t0)/d),v=Math.round(to*(1-Math.pow(1-u,3)));e.textContent=m[1]+fmtInt(v)+m[3];if(u<1&&e.isConnected)requestAnimationFrame(f)})(t0)}
 function enhanceDone(ds){if(!on()||ds.classList.contains('neoDone'))return;ds.classList.add('neoDone');var i=0;[].forEach.call(ds.children,function(ch){ch.style.setProperty('--ni',i++)});
  [].forEach.call(ds.querySelectorAll('.xpbreak>div'),function(r,k){r.style.setProperty('--ni',k)});
  if(!calm())[].forEach.call(ds.querySelectorAll('.dstat b'),function(b){if(b.id!=='dsXP')countNum(b,1000)});
  var gain=P&&P.xp>0?P.xp:0,st=ds.querySelector('.done-stats');
  if(gain&&st){var a=lvAt(Math.max(0,S.xp-gain)),b=lvAt(S.xp),up=b.i>a.i,w=document.createElement('div');w.className='neorank'+(up?' up':'');w.style.setProperty('--ni',1.5);
   w.innerHTML='<div class="nrh"><span>'+(up?'Promoted to <b>'+escH(b.name)+'</b>!':'Rank '+(b.i+1)+': <b>'+escH(b.name)+'</b>')+'</span><span class="nrx">+'+fmtInt(gain)+' XP</span></div><div class="nrbar"><i style="width:'+(up?0:a.frac*100)+'%"></i><b style="width:'+(up?0:a.frac*100)+'%"></b></div><div class="nrf">'+(b.next?fmtInt(b.toNext)+' XP to '+escH(b.next):'Top rank reached')+'</div>';
   st.parentNode.insertBefore(w,st.nextSibling);var bar=w.querySelector('.nrbar b');setTimeout(function(){if(bar)bar.style.width=(b.frac*100)+'%'},calm()?0:650)}
  if(P&&P._full){var fp=document.createElement('div');fp.className='neofp';fp.innerHTML='<span class="nfi">⚡</span><div><b>Full power!</b><span>You hit today\'s goal of '+fmtInt(S.goal||50)+' XP.</span></div>';(st||ds.firstChild).parentNode.insertBefore(fp,(st||ds.firstChild).nextSibling);P._full=0}
  var ic=ds.querySelector('.dicon');if(ic&&!calm())setTimeout(function(){var p=centre(ic);burst(p[0],p[1],{n:40,speed:7,cols:[COL.dark?'#ffffff':rgba(COL.accent||[83,74,183],1),rgba(COL.glow||[58,212,255],1),rgba(COL.accent||[120,110,240],1),'#ffb020'],life:900})},250)}
 function fullPower(){if(!on())return;if(P){P._full=1;return}if(document.querySelector('.neofull'))return;var o=document.createElement('div');o.className='neofull';o.setAttribute('role','status');o.innerHTML='<div class="nfin"><div class="nfcore"></div><p class="nfk">Daily goal reached</p><h2>Full power</h2><p>'+fmtInt(S.goal||50)+' XP today. The reactor is at 100%.</p></div>';document.body.appendChild(o);
  try{sfx('badge')}catch(_){}setTimeout(function(){burst(innerWidth/2,innerHeight/2-60,{n:60,speed:8,cols:['#ffffff','#7fe3ff','#3ad4ff'],life:1100})},200);var close=function(){if(!o.isConnected)return;o.classList.add('out');setTimeout(function(){o.remove()},300)};o.onclick=close;setTimeout(close,2800)}

 /* ---------- page entrance, bars that grow, numbers that count ---------- */
 var BARS='.lvlbar>div,.uprog>div,.stbar>div,.bbar>div,.qbar>div';
 function snapBars(pg){return pg?[].map.call(pg.querySelectorAll(BARS),function(b){return b.style.width}):null}
 function growBars(pg,old){if(!pg||calm())return;var bs=[].slice.call(pg.querySelectorAll(BARS));if(!bs.length)return;var same=old&&old.length===bs.length,to=bs.map(function(b){return b.style.width});
  bs.forEach(function(b,i){b.style.transition='none';b.style.width=same?old[i]:'0%'});void pg.offsetWidth;requestAnimationFrame(function(){bs.forEach(function(b,i){b.style.transition='';b.style.width=to[i]})})}
 function enter(pg){if(!pg||calm())return;var i=0;[].forEach.call(pg.children,function(ch){ch.style.setProperty('--ni',i++)});[].forEach.call(pg.querySelectorAll('.units>.unit'),function(u,k){u.style.setProperty('--ni',k)});
  pg.classList.remove('neoEnter');void pg.offsetWidth;pg.classList.add('neoEnter');clearTimeout(pg._ne);pg._ne=setTimeout(function(){pg.classList.remove('neoEnter')},1600)}
 function countStats(pg){if(!pg||calm())return;[].forEach.call(pg.querySelectorAll('.stat b'),function(b){countNum(b,900)})}

 /* ---------- tab indicators and the phone tab bar ---------- */
 var ICON={learn:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/><path d="M9 7h7M9 10.5h5"/>',sim:'<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/><circle cx="12" cy="18" r="1.4"/><path d="M6.3 12.5l1.2.8M12 8v1.5M17.7 12.5l-1.2.8"/>',review:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',exam:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',ref:'<path d="M17 4H7l6 8-6 8h10"/>'};
 function svg(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON[p]||ICON.learn)+'</svg>'}
 function place(ind,b,first){if(!ind)return;if(!b){ind.style.width='0';return}if(first)ind.classList.add('noanim');ind.style.width=b.offsetWidth+'px';ind.style.height=b.offsetHeight+'px';ind.style.transform='translate('+b.offsetLeft+'px,'+b.offsetTop+'px)';if(first){void ind.offsetWidth;ind.classList.remove('noanim')}}
 function tabInd(){var tb=document.querySelector('.hdr .tabs');if(!tb)return;var ind=tb.querySelector('.ntind');if(!on()){if(ind)ind.remove();return}var first=!ind;if(!ind){ind=document.createElement('span');ind.className='ntind';ind.setAttribute('aria-hidden','true');tb.insertBefore(ind,tb.firstChild)}
  var b=tb.querySelector('.tab.on');place(ind,b,first);ind.style.transform='translate('+(b?b.offsetLeft:0)+'px,0)';ind.style.height='';if(b&&b.scrollIntoView&&(b.offsetLeft<tb.scrollLeft||b.offsetLeft+b.offsetWidth>tb.scrollLeft+tb.clientWidth))tb.scrollLeft=b.offsetLeft-12}
 function navBuild(){var n=$('neoNav');if(!on()){if(n)n.remove();return}var tabs=[].slice.call(document.querySelectorAll('.hdr .tab'));if(!n){n=document.createElement('nav');n.id='neoNav';n.setAttribute('aria-label','Sections');document.body.appendChild(n)}
  var sig=tabs.map(function(t){return t.dataset.p+':'+t.textContent}).join('|');if(n.dataset.sig!==sig){n.dataset.sig=sig;n.innerHTML='<span class="nnind" aria-hidden="true"></span>'+tabs.map(function(t){return '<button type="button" data-p="'+escH(t.dataset.p)+'">'+svg(t.dataset.p)+'<span>'+escH(t.textContent.trim())+'</span></button>'}).join('');
   [].forEach.call(n.querySelectorAll('button'),function(b){b.onclick=function(){var t=document.querySelector('.hdr .tab[data-p="'+b.dataset.p+'"]');if(t)t.click();else showPage(b.dataset.p)}});n._first=1}navSync()}
 function navSync(){var n=$('neoNav');if(!n)return;var cur=null;[].forEach.call(n.querySelectorAll('button'),function(b){var o=b.dataset.p===PAGE;b.classList.toggle('on',o);if(o){cur=b;b.setAttribute('aria-current','page')}else b.removeAttribute('aria-current')});var ind=n.querySelector('.nnind');if(ind&&cur){var f=n._first;n._first=0;if(f)ind.classList.add('noanim');ind.style.width=cur.offsetWidth+'px';ind.style.transform='translateX('+cur.offsetLeft+'px)';if(f){void ind.offsetWidth;ind.classList.remove('noanim')}}}
 var lastY=0;window.addEventListener('scroll',function(){var h=document.querySelector('.hdr');if(!h)return;if(!on()||innerWidth>700){h.classList.remove('neohide');return}var y=window.scrollY||0;if(y>lastY+8&&y>110)h.classList.add('neohide');else if(y<lastY-8||y<60)h.classList.remove('neohide');lastY=y},{passive:true});
 window.addEventListener('resize',function(){clearTimeout(NEO._rz);NEO._rz=setTimeout(function(){if(on()){tabInd();navSync()}},120)});

 /* ---------- what's new (once) ---------- */
 function intro(){var m=$('modal');if(!m||m.classList.contains('open')||playerOpen()||document.querySelector('.shmod'))return false;
  m.innerHTML='<div class="mcard neonew" role="dialog" aria-modal="true" aria-labelledby="nnT"><p class="mkick">New look</p><h2 id="nnT">Critical just got an upgrade</h2><ul>'+
   '<li style="--ni:0"><i>⚛</i><span><b>A live reactor.</b> The core on the Learn page glows brighter as you earn today\'s XP. Fill it to reach full power.</span></li>'+
   '<li style="--ni:1"><i>🔥</i><span><b>Combos you can hear.</b> Each answer you get right in a row plays a higher note. Get 5 in a row to go hot.</span></li>'+
   '<li style="--ni:2"><i>✦</i><span><b>Smoother everything.</b> Progress bars grow, your rank bar fills at the end of each lesson and wins get a proper celebration.</span></li>'+
   (innerWidth<=700?'<li style="--ni:3"><i>☰</i><span><b>Tabs at the bottom.</b> Easier to reach with your thumb.</span></li>':'')+
   '</ul><p class="note" style="text-align:center;margin:0 0 6px">Prefer the old look? Progress → Settings → Look.</p><div class="nnb"><button class="big" id="nnOk">Let\'s go</button><button class="ghost" id="nnOld">Use the classic look</button></div></div>';
  m.classList.add('open');var close=function(){try{localStorage.setItem(SEEN,'1')}catch(_){}m.classList.remove('open');m.innerHTML=''};$('nnOk').onclick=function(){close();var t=document.querySelector('#page-learn .ringbox');if(t&&!calm()){var p=centre(t);burst(p[0],p[1],{n:36,speed:6})}};$('nnOld').onclick=function(){close();apply('classic')};setTimeout(function(){try{$('nnOk').focus()}catch(_){}},50);return true}
 function introLater(){var seen=0;try{seen=localStorage.getItem(SEEN)}catch(_){}if(seen||!on())return;var tries=0;(function go(){if(intro())return;if(++tries<20)setTimeout(go,3000)})()}

 /* ---------- settings rows ---------- */
 function settingsRows(){var ts=$('themeSel');if(!ts||$('lookSel'))return;var row=ts.closest('.wrow');if(!row)return;var w=document.createElement('div');
  w.innerHTML='<div class="wrow"><label for="lookSel">Look</label><select id="lookSel"><option value="neo">Report card (new)</option><option value="legacy">Legacy: the previous look</option><option value="classic">Classic</option></select></div><div class="wrow"><label for="motSel">Animations</label><select id="motSel"><option value="auto">Match my device</option><option value="full">Full</option><option value="less">Less movement</option></select></div>';
  var a=w.children[0],b=w.children[1];row.parentNode.insertBefore(b,row.nextSibling);row.parentNode.insertBefore(a,row.nextSibling);$('lookSel').value=look();$('motSel').value=motPref();
  $('lookSel').onchange=function(){apply(this.value)};$('motSel').onchange=function(){try{if(this.value==='auto')localStorage.removeItem(MK);else localStorage.setItem(MK,this.value)}catch(_){}calmUpd();bgKick();coreMount()}}

 /* ---------- switching looks ---------- */
 function calmUpd(){R.classList.toggle('neocalm',on()&&calm())}
 setTimeout(function(){try{if(R.classList.contains('rpt')&&!localStorage.getItem('critical_rpt_seen')){localStorage.setItem('critical_rpt_seen','1');toast('✨','New look: report card style','Prefer the old one? Progress → Settings → Look → Legacy','')}}catch(_){}},2500);
 function apply(lk,silent){try{if(lk==='classic'||lk==='legacy')localStorage.setItem(LK,lk);else localStorage.removeItem(LK)}catch(_){}R.classList.toggle('neo',lk!=='classic');R.classList.toggle('rpt',lk!=='classic'&&lk!=='legacy');calmUpd();
  if(on()){fonts();bgInit();cols()}else{var h=document.querySelector('.hdr');if(h)h.classList.remove('neohide');heat()}
  try{themeUI()}catch(_){}tabInd();navBuild();bgSize&&bg.cv&&bgSize();bgKick();if(!silent){showPage(PAGE);if(on()){try{localStorage.setItem(SEEN,'1')}catch(_){}}}}

 /* ---------- hooks into the app ---------- */
 function hook(){
  var _sp=showPage;showPage=function(p){var pg0=$('page-'+p);if(on()&&p==='learn')core.v=0;var r=_sp.apply(this,arguments);try{if(on()){var pg=$('page-'+p);enter(pg);growBars(pg,null);if(p==='review')countStats(pg);tabInd();navSync();bgKick()}}catch(e){if(window.console)console.error(e)}return r};
  var _rl=renderLearn;renderLearn=function(){var r=_rl.apply(this,arguments);try{coreMount()}catch(e){if(window.console)console.error(e)}return r};
  var _rr=renderReview;renderReview=function(){var r=_rr.apply(this,arguments);try{settingsRows()}catch(e){if(window.console)console.error(e)}return r};
  var _op=openPlayer;openPlayer=function(){var r=_op.apply(this,arguments);bgKick();heat();return r};
  var _cp=closePlayer;closePlayer=function(){var pg=$('page-'+PAGE),old=on()?snapBars(pg):null;var r=_cp.apply(this,arguments);try{var pl=$('player');if(pl){pl.classList.remove('neoHot','neoSuper')}if(on()){pg=$('page-'+PAGE);growBars(pg,old);bgKick();coreKick()}}catch(_){}return r};
  var _sc=showCard;showCard=function(){var r=_sc.apply(this,arguments);try{if(on()&&!calm()){var b=$('pBody');b.classList.remove('neoIn');void b.offsetWidth;b.classList.add('neoIn')}}catch(_){}return r};
  var _gr=gotRight;gotRight=function(c){var first=P&&P.st&&!P.st.tries;var r=_gr.apply(this,arguments);try{if(on()&&first)onRight()}catch(_){}return r};
  var _gw=gotWrong;gotWrong=function(c){var r=_gw.apply(this,arguments);try{if(on())onWrong()}catch(_){}return r};
  var _cb=showCombo;showCombo=function(up){var r=_cb.apply(this,arguments);try{var e=$('pCombo');if(e){var n=P&&P.combo||0;e.classList.toggle('hot',on()&&n>=5);e.classList.toggle('super',on()&&n>=10);e.title=n>=2?n+' right in a row':''}heat()}catch(_){}return r};
  var _sf=sfx;sfx=function(k){if(on()&&(k==='right'||k==='combo')&&P&&S.sound!==false){chime(P.combo||1);return}return _sf.apply(this,arguments)};
  var _cf=confetti;confetti=function(){if(on()){if(!calm())confettiNeo();return}return _cf.apply(this,arguments)};
  var _lu=showLevelUp;showLevelUp=function(i){var r=_lu.apply(this,arguments);try{if(on()){var mc=document.querySelector('#modal .mcard');if(mc){mc.classList.add('neoLv');var em=mc.querySelector('.memb');if(em&&!calm())setTimeout(function(){var p=centre(em);burst(p[0],p[1],{n:50,speed:8,cols:[COL.dark?'#ffffff':rgba(COL.accent||[83,74,183],1),rgba(COL.glow||[58,212,255],1),'#ffb020'],life:1000})},300)}}}catch(_){}return r};
  var _ax=addXP;addXP=function(n,el){var g=S.goal||50,b0=dailyXP();var r=_ax.apply(this,arguments);try{if(on()&&b0<g&&dailyXP()>=g)fullPower()}catch(_){}return r};
  var _uh=updHeader,shown=null,tok=0;updHeader=function(){var r=_uh.apply(this,arguments);try{var p=$('xpPill');if(on()&&p&&shown!=null&&S.xp>shown&&!calm()){var a=shown,b=S.xp,t0=performance.now(),my=++tok;(function f(t){if(my!==tok)return;var u=Math.min(1,(t-t0)/800),v=a+(b-a)*(1-Math.pow(1-u,3));p.innerHTML=BOLT+fmtInt(v)+' XP';if(u<1)requestAnimationFrame(f)})(t0)}shown=S.xp}catch(_){}return r};
  var _tu=themeUI;themeUI=function(){var r=_tu.apply(this,arguments);try{if(on()){cols();var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',isDark()?'#070c17':'#f3f6fb');bgDraw(performance.now());if(core.cv)coreDraw(performance.now())}}catch(_){}return r};
  var _rd=redrawAll;redrawAll=function(){var r=_rd.apply(this,arguments);try{if(on()){cols();bgDraw(performance.now());if(core.cv)coreDraw(performance.now())}}catch(_){}return r};
  // a soft click when you pick an answer
  document.addEventListener('click',function(e){if(!on()||S.sound===false)return;var o=e.target&&e.target.closest&&e.target.closest('#pBody .opt');if(o&&!o.disabled){try{beep(1650,0,.035,'triangle',.022)}catch(_){}}},true);
  // every finishing screen gets the treatment
  try{new MutationObserver(function(){var ds=document.querySelector('#pBody .done-screen:not(.neoDone)');if(ds)enhanceDone(ds)}).observe($('pBody'),{childList:true})}catch(_){}
  document.addEventListener('visibilitychange',function(){bgKick();coreKick()});
  try{var mq=matchMedia('(prefers-reduced-motion: reduce)'),f=function(){calmUpd();bgKick()};if(mq.addEventListener)mq.addEventListener('change',f)}catch(_){}
 }
 function boot(){hook();if(on()){fonts();bgInit();cols()}calmUpd();setTimeout(function(){tabInd();navBuild()},0);introLater()}
 return {boot:boot,on:on,apply:apply,look:look,calm:calm,burst:burst,coreMount:coreMount,fullPower:fullPower,intro:intro}
})();
try{window.NEO=NEO}catch(_){}
NEO.boot();
