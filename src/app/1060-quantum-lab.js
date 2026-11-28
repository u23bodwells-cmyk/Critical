/* ===== Quantum lab: draw any potential, find its energy levels, or fire a wave packet at it (units: ħ = m = 1, box width 1) ===== */
var QL_N=240;
function qlPreset(name,N){var V=new Float64Array(N),i,x;for(i=0;i<N;i++){x=(i+1)/(N+1);
  switch(name){case 'box':V[i]=0;break;case 'ho':V[i]=0.5*100*100*(x-0.5)*(x-0.5);break;case 'double':V[i]=(Math.abs(x-0.5)<0.04?900:0)+(x<0.18||x>0.82?2000:0);break;
   case 'finite':V[i]=Math.abs(x-0.5)<0.2?0:600;break;case 'barrier':V[i]=Math.abs(x-0.55)<0.03?1500:0;break;case 'step':V[i]=x>0.5?1000:0;break;
   case 'lattice':V[i]=(x>0.1&&x<0.9&&((x-0.1)/0.1)%1<0.25)?1500:(x<=0.1||x>=0.9?3000:0);break;case 'linear':V[i]=1600*x;break}}return V}
function qlEig(V,dx,K){var N=V.length,e=-0.5/(dx*dx),d=new Float64Array(N),lo=1e18,hi=-1e18,i;for(i=0;i<N;i++){d[i]=1/(dx*dx)+V[i];lo=Math.min(lo,d[i]);hi=Math.max(hi,d[i])}lo-=2*Math.abs(e);hi+=2*Math.abs(e);
 function cnt(l){var c=0,q=1;for(var i=0;i<N;i++){q=d[i]-l-(i?e*e/q:0);if(q===0)q=1e-300;if(q<0)c++}return c}
 var out=[];for(var k=0;k<K;k++){var a=lo,b=hi;for(var it=0;it<70;it++){var m=(a+b)/2;if(cnt(m)>k)b=m;else a=m}var lam=(a+b)/2;
  var x=new Float64Array(N),cp=new Float64Array(N),y=new Float64Array(N);for(i=0;i<N;i++)x[i]=1+0.01*Math.sin(i*1.7+k);var sh=lam+1e-7*Math.max(1,Math.abs(lam));
  for(var r=0;r<4;r++){var bb=d[0]-sh;cp[0]=e/bb;y[0]=x[0]/bb;for(i=1;i<N;i++){var den=d[i]-sh-e*cp[i-1];if(Math.abs(den)<1e-300)den=1e-300;cp[i]=e/den;y[i]=(x[i]-e*y[i-1])/den}
   x[N-1]=y[N-1];for(i=N-2;i>=0;i--)x[i]=y[i]-cp[i]*x[i+1];var nrm=0;for(i=0;i<N;i++)nrm+=x[i]*x[i];nrm=Math.sqrt(nrm*dx);for(i=0;i<N;i++)x[i]/=nrm}
  var s=0;for(i=0;i<N;i++)if(Math.abs(x[i])>Math.abs(s))s=x[i];if(s<0)for(i=0;i<N;i++)x[i]=-x[i];out.push({E:lam,psi:x})}return out}
function qlCN(V,dx,dt){var N=V.length,e=-0.5/(dx*dx),h=dt/2,ar=0,ai=h*e,cr=new Float64Array(N),ci=new Float64Array(N),br=1;
 /* A = 1 + i h H: diag 1 + i h d, off i h e. Precompute the Thomas sweep. */
 for(var i=0;i<N;i++){var dr=1,di=h*(1/(dx*dx)+V[i]);if(i){/* den = diag - off*c[i-1] */var pr=ar*cr[i-1]-ai*ci[i-1],pi=ar*ci[i-1]+ai*cr[i-1];dr-=pr;di-=pi}var m=dr*dr+di*di;cr[i]=(ar*dr+ai*di)/m;ci[i]=(ai*dr-ar*di)/m;}
 var Dr=new Float64Array(N),Di=new Float64Array(N);for(i=0;i<N;i++){var dr2=1,di2=h*(1/(dx*dx)+V[i]);if(i){dr2-=ar*cr[i-1]-ai*ci[i-1];di2-=ar*ci[i-1]+ai*cr[i-1]}Dr[i]=dr2;Di[i]=di2}
 var yr=new Float64Array(N),yi=new Float64Array(N),rr=new Float64Array(N),ri=new Float64Array(N);
 return function(pr,pi){var i;/* rhs = (1 - i h H) psi */for(i=0;i<N;i++){var hd=h*(1/(dx*dx)+V[i]),Lr=(i?pr[i-1]:0)+(i<N-1?pr[i+1]:0),Li=(i?pi[i-1]:0)+(i<N-1?pi[i+1]:0);
   /* (1 - i h d) psi_i - i h e (neighbours) */rr[i]=pr[i]+hd*pi[i]+h*e*Li;ri[i]=pi[i]-hd*pr[i]-h*e*Lr}
  for(i=0;i<N;i++){var nr=rr[i],ni=ri[i];if(i){nr-=ar*yr[i-1]-ai*yi[i-1];ni-=ar*yi[i-1]+ai*yr[i-1]}var m=Dr[i]*Dr[i]+Di[i]*Di[i];yr[i]=(nr*Dr[i]+ni*Di[i])/m;yi[i]=(ni*Dr[i]-nr*Di[i])/m}
  pr[N-1]=yr[N-1];pi[N-1]=yi[N-1];for(i=N-2;i>=0;i--){pr[i]=yr[i]-(cr[i]*pr[i+1]-ci[i]*pi[i+1]);pi[i]=yi[i]-(cr[i]*pi[i+1]+ci[i]*pr[i+1])}}}
function qlabOpen(){tlOpen('🧪 Quantum lab',function(B){var N=QL_N,dx=1/(N+1),V=qlPreset('ho',N),mode='levels',drawOn=false,eig=null,sel=0,pr=new Float64Array(N),pi=new Float64Array(N),step=null,playing=false,t=0,raf=0;
  B.innerHTML='<p class="tlnote">Pick a shape or draw your own potential, then see the energy levels it allows, or fire a wave packet at it. Units: ħ = m = 1, box width 1.</p>';
  var tabs=el('div','qltabs',null,B);var tL=btn(tabs,'📊 Energy levels',function(){setMode('levels')}),tW=btn(tabs,'🌊 Wave packet',function(){setMode('wave')});
  var pre=el('div','qlpre',null,B);[['ho','Oscillator'],['box','Box'],['finite','Finite well'],['double','Double well'],['barrier','Barrier'],['step','Step'],['lattice','Crystal'],['linear','Slope']].forEach(function(p){btn(pre,p[1],function(){V=qlPreset(p[0],N);changed()})});
  var dB=btn(pre,'✏️ Draw',function(){drawOn=!drawOn;dB.classList.toggle('pri',drawOn);hint.textContent=drawOn?'Drag across the picture to draw the potential. Higher means more energy needed to be there.':HINTS[mode]});
  var cv=canvas(B,330);cv.style.width='100%';cv.style.touchAction='none';cv.className='qlcv';
  var hint=el('p','tlnote qlhint','',B),info=el('div','qlinfo','',B),ctl=el('div','qlctl',null,B);
  var HINTS={levels:'Tap a level to see its wavefunction. Try Double well: the levels come in close pairs. Try Crystal: they bunch into bands, which is why metals conduct and insulators don\'t.',wave:'Press Play. Try Barrier with a packet that has more energy than the barrier: some still bounces back. Turn the energy down and some still gets through: tunnelling.'};
  var sx=slider(ctl,'Start',0.1,0.5,0.01,0.25,function(v){return v.toFixed(2)},function(){reset()}),sk=slider(ctl,'Energy',200,3000,10,1200,function(v){return v.toFixed(0)},function(){reset()}),sw=slider(ctl,'Width',0.02,0.08,0.005,0.04,function(v){return v.toFixed(3)},function(){reset()});
  var pc=el('div','wrow',null,ctl),pb=btn(pc,'▶ Play',function(){playing=!playing;pb.textContent=playing?'⏸ Pause':'▶ Play';if(playing)loop()});btn(pc,'↺ Reset',function(){reset()});
  function Ytop(){if(mode==='wave')return 3000;var m=eig&&eig.length?eig[Math.min(9,eig.length-1)].E*1.15:500;return Math.max(150,Math.min(3000,m))}
  function changed(){eig=null;step=null;if(mode==='levels'){eig=qlEig(V,dx,10);sel=Math.min(sel,9)}else reset();draw()}
  function setMode(m){mode=m;playing=false;pb.textContent='▶ Play';tL.classList.toggle('pri',m==='levels');tW.classList.toggle('pri',m==='wave');ctl.style.display=m==='wave'?'':'none';hint.textContent=HINTS[m];changed()}
  function reset(){var x0=sx.get(),k=Math.sqrt(2*sk.get()),s=sw.get(),n=0,i;t=0;for(i=0;i<N;i++){var x=(i+1)*dx,g=Math.exp(-(x-x0)*(x-x0)/(4*s*s));pr[i]=g*Math.cos(k*x);pi[i]=g*Math.sin(k*x);n+=g*g}n=Math.sqrt(n*dx);for(i=0;i<N;i++){pr[i]/=n;pi[i]/=n}step=qlCN(V,dx,4e-6);draw()}
  function loop(){cancelAnimationFrame(raf);if(!playing||!cv.isConnected)return;for(var j=0;j<12;j++)step(pr,pi);t+=12*4e-6;draw();raf=requestAnimationFrame(loop)}
  function draw(){if(!cv.isConnected)return;var g=prep(cv),c=g.c,W=g.W,H=g.H,top=Ytop(),px=function(i){return (i+1)*dx*W},py=function(v){return H-6-(H-14)*Math.min(1,v/top)};
   c.fillStyle=cssv('--line');c.globalAlpha=0.55;c.beginPath();c.moveTo(0,H);for(var i=0;i<N;i++)c.lineTo(px(i),py(V[i]));c.lineTo(W,H);c.closePath();c.fill();c.globalAlpha=1;
   c.strokeStyle=cssv('--muted');c.lineWidth=1.5;c.beginPath();for(i=0;i<N;i++){if(i)c.lineTo(px(i),py(V[i]));else c.moveTo(px(i),py(V[i]))}c.stroke();
   c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('V(x)',6,14);
   if(mode==='levels'&&eig){var amp=(H*0.07);eig.forEach(function(s,n){if(s.E>top)return;var y=py(s.E),on=n===sel;c.strokeStyle=on?cssv('--accent'):cssv('--muted');c.globalAlpha=on?1:0.45;c.lineWidth=on?2:1;c.setLineDash(on?[]:[4,4]);c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();c.setLineDash([]);
     var mx=0;for(var i=0;i<N;i++)mx=Math.max(mx,Math.abs(s.psi[i]));c.lineWidth=on?2.5:1.2;c.strokeStyle=on?cssv('--accent'):'#4aa3ff';c.beginPath();for(i=0;i<N;i++){var yy=y-amp*(on?1.4:0.8)*s.psi[i]/mx;if(i)c.lineTo(px(i),yy);else c.moveTo(px(i),yy)}c.stroke();c.globalAlpha=1;c.fillStyle=on?cssv('--accent'):cssv('--muted');c.fillText('E'+(n+1),W-24,y-3)});
    var s0=eig[sel],e1=eig[0].E;info.innerHTML='<b>Level '+(sel+1)+':</b> E = '+s0.E.toFixed(1)+' &nbsp;·&nbsp; E/E₁ = '+(s0.E/e1).toFixed(2)+' &nbsp;·&nbsp; nodes: '+sel+'<div class="qlrat">'+eig.slice(0,6).map(function(s,n){return '<span'+(n===sel?' class="on"':'')+'>E'+(n+1)+' '+s.E.toFixed(0)+'</span>'}).join('')+'</div>'}
   if(mode==='wave'){var p2=[],mx=0,L=0,R=0,mid=0.5;for(i=0;i<N;i++){var q=pr[i]*pr[i]+pi[i]*pi[i];p2.push(q);mx=Math.max(mx,q);if((i+1)*dx<mid)L+=q*dx;else R+=q*dx}
    var base=py(sk.get()),sc=(H*0.5)/Math.max(mx,1e-9);c.strokeStyle=cssv('--muted');c.setLineDash([4,4]);c.beginPath();c.moveTo(0,base);c.lineTo(W,base);c.stroke();c.setLineDash([]);c.fillText('packet energy',6,base-4);
    c.strokeStyle='#4aa3ff';c.lineWidth=1;c.globalAlpha=0.6;c.beginPath();for(i=0;i<N;i++){var yy=base-pr[i]*Math.sqrt(sc)*0.7;if(i)c.lineTo(px(i),yy);else c.moveTo(px(i),yy)}c.stroke();c.globalAlpha=1;
    c.fillStyle=cssv('--accent');c.globalAlpha=0.35;c.beginPath();c.moveTo(0,base);for(i=0;i<N;i++)c.lineTo(px(i),base-p2[i]*sc);c.lineTo(W,base);c.closePath();c.fill();c.globalAlpha=1;c.strokeStyle=cssv('--accent');c.lineWidth=2;c.beginPath();for(i=0;i<N;i++){if(i)c.lineTo(px(i),base-p2[i]*sc);else c.moveTo(px(i),base-p2[i]*sc)}c.stroke();
    info.innerHTML='<b>t = '+(t*1000).toFixed(2)+'</b> (×10⁻³) &nbsp;·&nbsp; left half '+(L*100).toFixed(0)+'% &nbsp;·&nbsp; right half '+(R*100).toFixed(0)+'%<div class="qlrat"><span>shaded: |ψ|², the probability</span><span style="color:#4aa3ff">line: the real part of ψ</span></div>'}}
  var last=-1;function at(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
  function paintV(e){var p=at(e),i=Math.round(p[0]*(N+1))-1,v=Math.max(0,(1-(p[1]*cv.clientHeight-6)/(cv.clientHeight-14)))*Ytop();i=Math.max(0,Math.min(N-1,i));if(last<0)last=i;var a=Math.min(last,i),b=Math.max(last,i);for(var j=a;j<=b;j++)V[j]=Math.min(3000,v);last=i;draw()}
  cv.addEventListener('pointerdown',function(e){if(drawOn){cv.setPointerCapture(e.pointerId);last=-1;paintV(e);return}if(mode==='levels'&&eig){var p=at(e),y=p[1]*cv.clientHeight,top=Ytop(),best=0,bd=1e9;eig.forEach(function(s,n){var yy=cv.clientHeight-6-(cv.clientHeight-14)*Math.min(1,s.E/top),dd=Math.abs(yy-y);if(dd<bd){bd=dd;best=n}});sel=best;draw()}});
  cv.addEventListener('pointermove',function(e){if(drawOn&&e.buttons)paintV(e)});cv.addEventListener('pointerup',function(){if(drawOn){last=-1;changed()}});
  onDraw(draw);setMode('levels')})}
TL_EXTRA.push(function(m){return m==='qm'?['🧪','Quantum lab',qlabOpen]:null});
(function(){var st=document.createElement('style');st.textContent='.qltabs,.qlpre{display:flex;gap:6px;flex-wrap:wrap}.qlpre .wbtn{font-size:12.5px;padding:6px 10px}.qlcv{border-radius:12px;background:var(--panel);border:1px solid var(--line)}.qlinfo{font-size:14px;line-height:1.5}.qlrat{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;font-size:12px;color:var(--muted)}.qlrat span{border:1px solid var(--line);border-radius:7px;padding:1px 6px}.qlrat span.on{border-color:var(--accent);color:var(--accent);font-weight:800}.qlctl{display:flex;flex-direction:column;gap:4px}';document.head.appendChild(st)})();

