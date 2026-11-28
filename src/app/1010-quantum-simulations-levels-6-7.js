/* ===== Quantum track: simulations for Levels 6 and 7 ===== */
/* the finite well: graphical solution of the matching conditions */
WIDGETS.qFinite=function(box,par){par=par||{};var cv=canvas(box,250),s=slider(box,'Well strength z₀ = (a/ħ)√(2mV₀)',0.5,12,0.01,4,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['n','Bound states'],['z','Solutions z = ka']]);
 if(par.goal)qChal(box,par.goal[1]);
 function count(z0){var sols=[];function g(z){return Math.sqrt(Math.max(0,z0*z0/(z*z)-1))}
  for(var par2=0;par2<2;par2++){var prev=null;for(var i=1;i<=4000;i++){var z=i/4000*z0,f=par2===0?Math.tan(z):-1/Math.tan(z),d=f-g(z);if(prev!=null&&Math.sign(d)!==Math.sign(prev.d)&&Math.abs(d-prev.d)<5&&f>=0)sols.push([z,par2]);prev={d:d}}}
  return sols.sort(function(a,b){return a[0]-b[0]})}
 function draw(){var z0=s.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,zm=Math.max(z0,2)*1.05,X=function(z){return 30+z/zm*(W-40)},Y=function(v){return H-24-v/8*(H-40)},i;c.strokeStyle=cssv('--line');c.lineWidth=1;c.beginPath();c.moveTo(30,Y(0));c.lineTo(W-10,Y(0));c.stroke();
  for(var k=1;k*Math.PI/2<zm;k++){c.setLineDash([3,4]);qLine(c,[[X(k*Math.PI/2),12],[X(k*Math.PI/2),H-24]],cssv('--line'),1);c.setLineDash([])}
  [0,1].forEach(function(pp){var seg=[];for(i=1;i<=1500;i++){var z=i/1500*zm,f=pp===0?Math.tan(z):-1/Math.tan(z);if(f<0||f>8.5){if(seg.length>1)qLine(c,seg,pp===0?'#4aa3ff':'#e8742a',2);seg=[];continue}seg.push([X(z),Y(f)])}if(seg.length>1)qLine(c,seg,pp===0?'#4aa3ff':'#e8742a',2)});
  var gp=[];for(i=1;i<=600;i++){var z=i/600*z0,v=Math.sqrt(Math.max(0,z0*z0/(z*z)-1));if(v<8.5)gp.push([X(z),Y(v)])}qLine(c,gp,cssv('--accent'),2.5);
  var sols=count(z0);sols.forEach(function(q){var f=q[1]===0?Math.tan(q[0]):-1/Math.tan(q[0]);c.fillStyle=cssv('--text');c.beginPath();c.arc(X(q[0]),Y(f),5,0,7);c.fill()});
  c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('blue: even states · orange: odd · purple: √(z₀²/z² − 1)',8,12);c.fillText('z = ka →',W-60,H-6);
  st.n.textContent=sols.length;st.z.textContent=sols.map(function(q){return q[0].toFixed(2)}).join(', ')}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var n=count(s.get()).length;return n===par.goal[0]?{ok:true,msg:par.goal[2]}:{ok:false,msg:'That gives '+n+' bound state'+(n===1?'':'s')+'. A new one appears each time z₀ passes a multiple of π/2.'}}}};

/* the potential step: reflection even when E > V0 */
WIDGETS.qStep=function(box,par){par=par||{};var cv=canvas(box,220),t=0,s=slider(box,'Energy ÷ step height (E/V₀)',0.2,5,0.01,2,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['r','Reflected R'],['t','Transmitted T'],['s','R + T']]);
 if(par.goal)qChal(box,par.goal[1]);
 function RT(){var e=s.get();if(e<=1)return [1,0];var r=Math.sqrt((e-1)/e),R=Math.pow((1-r)/(1+r),2);return [R,1-R]}
 function draw(){var e=s.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,sx=W*0.5,Y=function(v){return H-30-v/5.5*(H-50)},rt=RT(),i,pts=[],k1=0.13,k2=e>1?k1*Math.sqrt((e-1)/e):0,kap=e<1?k1*Math.sqrt((1-e)/e):0;
  c.fillStyle=cssv('--soft2');c.fillRect(sx,Y(1),W-sx-10,H-30-Y(1));qLine(c,[[10,H-30],[sx,H-30],[sx,Y(1)],[W-10,Y(1)]],cssv('--text'),2);
  var ye=Y(e);c.setLineDash([5,4]);qLine(c,[[10,ye],[W-10,ye]],cssv('--accent'),1);c.setLineDash([]);var A=18,rA=Math.sqrt(rt[0]);
  for(i=10;i<W-10;i++){var y;if(i<sx){var ph=k1*(i-sx);y=ye-A*(Math.cos(ph-t*3)+rA*Math.cos(-ph-t*3))/(1+rA)}else if(e>1){var tA=2/(1+Math.sqrt((e-1)/e));y=ye-A*tA*Math.cos(k2*(i-sx)-t*3)/(1+rA)}else{y=ye-A*2*Math.exp(-kap*(i-sx))*Math.cos(t*3)/(1+rA)}pts.push([i,y])}qLine(c,pts,'#4aa3ff',2.2);
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('step height V₀',sx+6,Y(1)-6);c.fillText('energy E',14,ye-8);st.r.textContent=(rt[0]*100).toFixed(1)+'%';st.t.textContent=(rt[1]*100).toFixed(1)+'%';st.s.textContent='100%'}
 anim(cv,function(dt){t+=dt;draw()});draw();
 if(par.goal)return {check:function(){var R=RT()[0];return Math.abs(R-par.goal[0])<0.015?{ok:true,msg:'E/V₀ = '+s.get().toFixed(2)+' reflects '+(R*100).toFixed(1)+'%. Classically a particle with E > V₀ would never bounce back at all.'}:{ok:false,msg:'R is '+(R*100).toFixed(1)+'%. Reflection grows as E gets closer to V₀.'}}}};

/* building a wave packet from plane waves */
WIDGETS.qFourier=function(box,par){par=par||{};var cv=canvas(box,170),cv2=canvas(box,110),sn=slider(box,'Number of waves added',1,60,1,12,function(v){return v},function(){draw()}),sw=slider(box,'Spread of wavenumbers Δk',0.05,1.5,0.01,0.3,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['x','Δx (width of the packet)'],['p','Δx × Δk']]);
 if(par.goal)qChal(box,'Make a packet narrower than Δx = 0.8, so the particle is well localised.');
 var dx0=0;function build(){var N=sn.get(),sk=sw.get(),k0=6,ks=[],w=[],i;for(i=0;i<N;i++){var k=N===1?k0:k0-3*sk+6*sk*i/(N-1);ks.push(k);w.push(Math.exp(-Math.pow(k-k0,2)/(4*sk*sk)))}return {ks:ks,w:w}}
 function draw(){var B=build(),g=prep(cv),c=g.c,W=g.W,H=g.H,L=12,pts=[],env=[],i,s=0,sx=0,sxx=0,mx=0,vals=[];for(i=0;i<=800;i++){var x=-L+2*L*i/800,re=0,im=0;B.ks.forEach(function(k,j){re+=B.w[j]*Math.cos(k*x);im+=B.w[j]*Math.sin(k*x)});vals.push([x,re,re*re+im*im]);mx=Math.max(mx,Math.sqrt(re*re+im*im))}
  vals.forEach(function(v){var p=v[2];s+=p;sx+=v[0]*p;sxx+=v[0]*v[0]*p;pts.push([10+(v[0]+L)/(2*L)*(W-20),H/2-v[1]/mx*H*0.4]);env.push([10+(v[0]+L)/(2*L)*(W-20),H/2-Math.sqrt(p)/mx*H*0.4])});
  qLine(c,pts,'#4aa3ff',1.8);qLine(c,env,cssv('--accent'),2);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('ψ(x): the sum of the waves (blue), its envelope (purple)',12,14);
  var m=sx/s,dx=Math.sqrt(Math.max(0,sxx/s-m*m));dx0=dx;var g2=prep(cv2),c2=g2.c,W2=g2.W,H2=g2.H;B.ks.forEach(function(k,j){var x=10+(k-2)/8*(W2-20);c2.fillStyle=cssv('--coral');c2.fillRect(x-1.5,H2-18-B.w[j]*(H2-36),3,B.w[j]*(H2-36))});c2.fillStyle=cssv('--muted');c2.font='12px system-ui';c2.fillText('φ(k): how much of each wavenumber',12,14);
  st.x.textContent=dx>L*0.5?'spread everywhere':dx.toFixed(2);st.p.textContent=dx>L*0.5?'–':(dx*sw.get()).toFixed(2)+' (minimum 0.5)'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){return dx0<0.8&&sn.get()>=8?{ok:true,msg:'A narrow packet needs a wide spread of wavenumbers, and lots of waves to cancel everywhere else. Δx Δk ≥ ½ is the uncertainty principle, written in Fourier terms.'}:{ok:false,msg:dx0>=0.8?'Δx is '+dx0.toFixed(2)+'. Widen the spread of k.':'Use more waves, so they cancel away from the centre.'}}}};

/* scattering: the Born approximation for a screened (Yukawa) potential */
WIDGETS.qBorn=function(box,par){par=par||{};var cv=canvas(box,230),sk=slider(box,'Incoming wavenumber k (energy)',0.05,5,0.01,2,function(v){return v.toFixed(2)},function(){draw()}),sm=slider(box,'Screening μ (1/range)',0.05,3,0.01,1,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['r','Forward ÷ backward'],['k','k ÷ μ']]);
 if(par.goal)qChal(box,'Make the scattering almost the same in every direction (forward within 1.2× backward).');
 function ds(th){var k=sk.get(),m=sm.get(),q=2*k*Math.sin(th/2);return 1/Math.pow(m*m+q*q,2)}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,mx=ds(0.0001),mn=ds(Math.PI),lo=Math.log10(Math.max(mn,mx*1e-6))-0.3,hi=Math.log10(mx)+0.2,X=function(th){return 40+th/Math.PI*(W-60)},Y=function(v){return 14+(hi-Math.log10(v))/(hi-lo)*(H-44)},i,pts=[];
  for(i=1;i<=300;i++){var th=i/300*Math.PI;pts.push([X(th),Y(ds(th))])}qLine(c,pts,cssv('--accent'),2.5);c.strokeStyle=cssv('--line');c.lineWidth=1;c.strokeRect(40,14,W-60,H-44);c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('0°',36,H-16);c.fillText('90°',X(Math.PI/2)-8,H-16);c.fillText('180°',W-34,H-16);c.fillText('scattering angle θ',W/2-46,H-3);c.fillText('dσ/dΩ (log scale)',44,26);
  var r=ds(0.0001)/ds(Math.PI);st.r.textContent=r<1000?r.toFixed(2)+'×':qSci(r)+'×';st.k.textContent=(sk.get()/sm.get()).toFixed(2)}
 onDraw(draw);draw();el('p','small','dσ/dΩ ∝ 1/(μ² + q²)², with q = 2k sin(θ/2). As μ → 0 this becomes Rutherford scattering.',box);
 if(par.goal)return {check:function(){var r=ds(0.0001)/ds(Math.PI);return r<1.2?{ok:true,msg:'When the wavelength is much longer than the range of the force (k ≪ μ), scattering is the same in all directions: s-wave scattering. That\'s why slow neutrons in a reactor scatter isotropically off nuclei.'}:{ok:false,msg:'Forward is '+r.toFixed(2)+'× backward. Lower the energy or shorten the range.'}}}};

/* Feynman's sum over paths */
WIDGETS.qPath=function(box,par){par=par||{};var cv=canvas(box,190),cv2=canvas(box,190),sh=slider(box,'Size of ħ (compared with the action)',-2.5,0.7,0.01,0,function(v){return Math.pow(10,v).toPrecision(2)},function(){draw()}),st=stats(box,[['w','Paths that really contribute'],['a','Total amplitude']]);
 if(par.goal)qChal(box,'Shrink ħ until only paths very close to the classical one contribute (narrower than ±0.3).');
 var band=1;function draw(){var hb=Math.pow(10,sh.get()),g=prep(cv),c=g.c,W=g.W,H=g.H,D=2,N=61,i,arr=[],cx=0,cy=0;
  for(i=0;i<N;i++){var d=-D+2*D*i/(N-1),S=Math.PI*Math.PI*d*d/4,ph=S/hb;arr.push([d,ph]);var pts=[];for(var j=0;j<=40;j++){var tt=j/40;pts.push([20+tt*(W-40),H/2-d*Math.sin(Math.PI*tt)*H*0.2])}var cl=Math.cos(ph);c.globalAlpha=0.25+0.5*Math.max(0,Math.cos(ph)*Math.exp(-Math.abs(d)));qLine(c,pts,d===0?cssv('--text'):(cl>0?'#4aa3ff':'#e8742a'),d===0?2.5:1);c.globalAlpha=1}
  c.fillStyle=cssv('--text');c.beginPath();c.arc(20,H/2,5,0,7);c.arc(W-20,H/2,5,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('paths from A to B (black: the classical straight line)',8,14);
  var g2=prep(cv2),c2=g2.c,W2=g2.W,H2=g2.H,raw=[[0,0]],x=0,y=0;arr.forEach(function(a){x+=Math.cos(a[1]);y-=Math.sin(a[1]);raw.push([x,y])});var mnx=Math.min.apply(null,raw.map(function(q){return q[0]})),mxx=Math.max.apply(null,raw.map(function(q){return q[0]})),mny=Math.min.apply(null,raw.map(function(q){return q[1]})),mxy=Math.max.apply(null,raw.map(function(q){return q[1]})),sc=Math.min((W2-40)/Math.max(1,mxx-mnx),(H2-50)/Math.max(1,mxy-mny));var pts2=raw.map(function(q){return [20+(q[0]-mnx)*sc,30+(q[1]-mny)*sc]});qLine(c2,pts2,cssv('--accent'),2);qArrow(c2,pts2[0][0],pts2[0][1],pts2[pts2.length-1][0],pts2[pts2.length-1][1],'#e8742a',2.5);var step=1;x=raw[raw.length-1][0];y=raw[raw.length-1][1];c2.fillStyle=cssv('--muted');c2.font='12px system-ui';c2.fillText('adding one arrow e^(iS/ħ) per path, head to tail',8,14);
  band=Math.sqrt(4*Math.PI*hb/(Math.PI*Math.PI));st.w.textContent='d within ±'+Math.min(D,band).toFixed(2);st.a.textContent=(Math.hypot(x,y)/N).toFixed(2)+' of the maximum'}
 onDraw(draw);draw();el('p','small','Each path\'s arrow turns by its action S divided by ħ. Paths far from the classical one have fast-changing phases and cancel. Small ħ means classical physics.',box);
 if(par.goal)return {check:function(){return band<0.3?{ok:true,msg:'With tiny ħ, only paths right next to the classical path add up: the ones where the action is stationary. That\'s why big objects follow Newton\'s laws: the principle of least action, from quantum mechanics.'}:{ok:false,msg:'Paths out to ±'+band.toFixed(2)+' still contribute. Shrink ħ.'}}}};

/* the CHSH Bell test */
WIDGETS.qCHSH=function(box,par){par=par||{};var sa=slider(box,'Alice: angle a',0,180,1,0,function(v){return v+'°'},function(){upd()}),sa2=slider(box,'Alice: angle a′',0,180,1,60,function(v){return v+'°'},function(){upd()}),sb=slider(box,'Bob: angle b',0,180,1,30,function(v){return v+'°'},function(){upd()}),sb2=slider(box,'Bob: angle b′',0,180,1,90,function(v){return v+'°'},function(){upd()});
 var st=stats(box,[['s','S (quantum)'],['l','Limit for any local hidden-variable theory'],['t','Quantum maximum (Tsirelson)']]),bar=el('div','qbar','<i></i><b></b><em></em>',box);
 if(par.goal)qChal(box,'Choose four angles that make S bigger than 2.7.');
 function E(x,y){return -Math.cos((x-y)*Math.PI/180)}function S(){return Math.abs(E(sa.get(),sb.get())-E(sa.get(),sb2.get())+E(sa2.get(),sb.get())+E(sa2.get(),sb2.get()))}
 function upd(){var s=S();st.s.textContent=s.toFixed(3);st.l.textContent='2';st.t.textContent='2√2 ≈ 2.828';bar.querySelector('i').style.width=(s/3*100)+'%';bar.querySelector('i').style.background=s>2?'var(--good-line)':'var(--accent)'}
 upd();
 if(par.goal)return {check:function(){var s=S();return s>2.7?{ok:true,msg:'S = '+s.toFixed(3)+' > 2: no local hidden-variable theory can do that. The best is a = 0°, a′ = 90°, b = 45°, b′ = 135°, giving 2√2.'}:{ok:false,msg:'S = '+s.toFixed(3)+'. Try spacing the four angles 45° apart.'}}}};

