/* ===== maths for quantum mechanics: simulations ===== */
/* the Argand diagram: multiplying rotates and stretches */
WIDGETS.mArgand=function(box,par){par=par||{};var cv=canvas(box,260),sr=slider(box,'|w| (length)',0.2,2,0.01,1,function(v){return v.toFixed(2)},function(){draw()}),sa=slider(box,'arg w (angle)',0,360,1,90,function(v){return v+'°'},function(){draw()}),st=stats(box,[['z','z'],['w','w'],['p','z × w']]);
 if(par.goal)qChal(box,par.goal[1]);
 var z=[1.2,0.5];function prod(){var r=sr.get(),a=sa.get()*Math.PI/180,w=[r*Math.cos(a),r*Math.sin(a)];return [w,[z[0]*w[0]-z[1]*w[1],z[0]*w[1]+z[1]*w[0]]]}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2,S=Math.min(W,H)/6,P=prod(),w=P[0],p=P[1];c.strokeStyle=cssv('--line');c.lineWidth=1;c.beginPath();c.moveTo(10,cy);c.lineTo(W-10,cy);c.moveTo(cx,10);c.lineTo(cx,H-10);c.stroke();c.beginPath();c.arc(cx,cy,S,0,7);c.setLineDash([3,4]);c.stroke();c.setLineDash([]);
  qArrow(c,cx,cy,cx+z[0]*S,cy-z[1]*S,'#4aa3ff');qArrow(c,cx,cy,cx+w[0]*S,cy-w[1]*S,'#e8742a');qArrow(c,cx,cy,cx+p[0]*S,cy-p[1]*S,cssv('--accent'),3.5);c.font='13px system-ui';c.fillStyle='#4aa3ff';c.fillText('z',cx+z[0]*S+6,cy-z[1]*S);c.fillStyle='#e8742a';c.fillText('w',cx+w[0]*S+6,cy-w[1]*S);c.fillStyle=cssv('--accent');c.fillText('zw',cx+p[0]*S+6,cy-p[1]*S);c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('Re',W-24,cy-6);c.fillText('Im',cx+6,18);c.fillText('dashed circle: |z| = 1',10,H-6);
  function f(v){return (Math.round(v[0]*100)/100)+(v[1]<0?' − ':' + ')+Math.abs(Math.round(v[1]*100)/100)+'i'}function pol(v){return Math.hypot(v[0],v[1]).toFixed(2)+' ∠ '+((Math.atan2(v[1],v[0])*180/Math.PI+360)%360).toFixed(0)+'°'}st.z.textContent=pol(z);st.w.textContent=pol(w);st.p.textContent=f(p)+' = '+pol(p)}
 onDraw(draw);draw();el('p','small','z is fixed at 1.30 ∠ 23°. Multiplying by w multiplies the lengths and adds the angles.',box);
 if(par.goal)return {check:function(){var p=prod()[1],m=Math.hypot(p[0],p[1]),a=(Math.atan2(p[1],p[0])*180/Math.PI+360)%360,g=par.goal[0];if(g==='real')return Math.abs(p[1])<0.04&&p[0]<0?{ok:true,msg:'zw is real and negative: arg z + arg w = 180°. Angles add when you multiply.'}:{ok:false,msg:'zw is at '+a.toFixed(0)+'°. You need 180°.'};if(g==='unit')return Math.abs(m-1)<0.03?{ok:true,msg:'|zw| = |z||w| = 1, so |w| = 1/|z| ≈ 0.77.'}:{ok:false,msg:'|zw| = '+m.toFixed(2)+'. Lengths multiply.'};return {ok:true}}}};

/* a 2x2 matrix as a transformation, with its eigenvectors */
WIDGETS.mMatrix=function(box,par){par=par||{};var cv=canvas(box,260),sl=[['a',2],['b',1],['c',1],['d',2]].map(function(x){return slider(box,x[0],-3,3,0.1,x[1],function(v){return v.toFixed(1)},function(){draw()})}),st=stats(box,[['d','Determinant (area scale)'],['e','Eigenvalues']]);
 if(par.goal)qChal(box,par.goal[1]);
 function M(){return sl.map(function(s){return s.get()})}function eig(){var m=M(),tr=m[0]+m[3],det=m[0]*m[3]-m[1]*m[2],disc=tr*tr-4*det;return {det:det,disc:disc,l:disc>=0?[(tr+Math.sqrt(disc))/2,(tr-Math.sqrt(disc))/2]:null,re:tr/2,im:disc<0?Math.sqrt(-disc)/2:0}}
 function draw(){var m=M(),g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2,S=Math.min(W,H)/9,E=eig(),i;c.strokeStyle=cssv('--line');c.lineWidth=1;for(i=-4;i<=4;i++){c.beginPath();c.moveTo(cx+i*S,10);c.lineTo(cx+i*S,H-10);c.moveTo(10,cy+i*S);c.lineTo(W-10,cy+i*S);c.stroke()}
  function T(x,y){return [cx+(m[0]*x+m[1]*y)*S,cy-(m[2]*x+m[3]*y)*S]}c.fillStyle='rgba(83,74,183,.12)';c.beginPath();var q=[T(0,0),T(1,0),T(1,1),T(0,1)];c.moveTo(q[0][0],q[0][1]);q.forEach(function(p){c.lineTo(p[0],p[1])});c.fill();c.strokeStyle=cssv('--accent');c.lineWidth=2;c.stroke();
  qArrow(c,cx,cy,T(1,0)[0],T(1,0)[1],'#4aa3ff');qArrow(c,cx,cy,T(0,1)[0],T(0,1)[1],'#e8742a');
  if(E.l){E.l.forEach(function(l){var vx=m[1],vy=l-m[0];if(Math.abs(vx)<1e-9&&Math.abs(vy)<1e-9){vx=l-m[3];vy=m[2]}if(Math.abs(vx)<1e-9&&Math.abs(vy)<1e-9){vx=1;vy=0}var n=Math.hypot(vx,vy);vx/=n;vy/=n;c.setLineDash([6,4]);qLine(c,[[cx-vx*S*5,cy+vy*S*5],[cx+vx*S*5,cy-vy*S*5]],cssv('--good-line'),2);c.setLineDash([])})}
  c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('blue, orange: images of (1,0), (0,1) · green: eigenvectors',10,H-6);
  st.d.textContent=E.det.toFixed(2);st.e.textContent=E.l?E.l.map(function(x){return x.toFixed(2)}).join(' and '):E.re.toFixed(2)+' ± '+E.im.toFixed(2)+'i (a rotation)'}
 onDraw(draw);draw();el('p','small','The matrix is (a b / c d). Eigenvectors are the directions that only get stretched, not turned.',box);
 if(par.goal)return {check:function(){var E=eig(),g=par.goal[0];if(g==='det0')return Math.abs(E.det)<0.05?{ok:true,msg:'Determinant 0: the square is squashed flat onto a line. No inverse exists, and one eigenvalue is 0.'}:{ok:false,msg:'det = '+E.det.toFixed(2)+'. Make the square collapse to a line.'};if(g==='rot')return !E.l?{ok:true,msg:'Complex eigenvalues: no real direction survives unturned, because the matrix rotates. This is why quantum mechanics needs complex numbers.'}:{ok:false,msg:'The eigenvalues are still real. Try making b and c opposite signs.'};return {ok:true}}}};

/* second-order ODEs: damped oscillators and their characteristic roots */
WIDGETS.mODE=function(box,par){par=par||{};var cv=canvas(box,200),cv2=canvas(box,150),sb=slider(box,'Damping b',0,6,0.05,0.6,function(v){return v.toFixed(2)},function(){draw()}),sk=slider(box,'Spring k',0.5,9,0.05,4,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['r','Roots m'],['t','Type']]);
 if(par.goal)qChal(box,'Find critical damping: the fastest return to zero without overshooting (b² = 4k).');
 function draw(){var b=sb.get(),k=sk.get(),disc=b*b-4*k,g=prep(cv),c=g.c,W=g.W,H=g.H,i,pts=[];for(i=0;i<=300;i++){var t=i/300*10,y;if(Math.abs(disc)<1e-6){var m=-b/2;y=(1-m*t)*Math.exp(m*t)}else if(disc>0){var m1=(-b+Math.sqrt(disc))/2,m2=(-b-Math.sqrt(disc))/2;y=(m2*Math.exp(m1*t)-m1*Math.exp(m2*t))/(m2-m1)}else{var al=-b/2,om=Math.sqrt(-disc)/2;y=Math.exp(al*t)*(Math.cos(om*t)-al/om*Math.sin(om*t))}pts.push([20+t/10*(W-30),H/2-y*H*0.4])}
  qLine(c,[[20,H/2],[W-10,H/2]],cssv('--line'),1);qLine(c,pts,'#4aa3ff',2.5);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('y(t), starting at y = 1 at rest',22,14);
  var g2=prep(cv2),c2=g2.c,W2=g2.W,H2=g2.H,cx=W2/2+40,cy=H2/2,S=H2/7;qLine(c2,[[20,cy],[W2-10,cy]],cssv('--line'),1);qLine(c2,[[cx,8],[cx,H2-8]],cssv('--line'),1);c2.fillStyle=cssv('--muted');c2.font='11px system-ui';c2.fillText('roots in the complex plane',8,14);
  var roots=disc>=0?[[(-b+Math.sqrt(disc))/2,0],[(-b-Math.sqrt(disc))/2,0]]:[[-b/2,Math.sqrt(-disc)/2],[-b/2,-Math.sqrt(-disc)/2]];roots.forEach(function(r){c2.fillStyle=cssv('--accent');c2.beginPath();c2.arc(cx+r[0]*S,cy-r[1]*S,6,0,7);c2.fill()});
  st.r.textContent=disc>=0?roots.map(function(r){return r[0].toFixed(2)}).join(', '):(-b/2).toFixed(2)+' ± '+(Math.sqrt(-disc)/2).toFixed(2)+'i';st.t.textContent=Math.abs(disc)<0.15?'critically damped':disc>0?'overdamped':b===0?'undamped: oscillates forever':'underdamped: oscillates and decays'}
 onDraw(draw);draw();el('p','small','y″ + by′ + ky = 0. Try y = e^(mt): m² + bm + k = 0. Complex roots mean oscillation.',box);
 if(par.goal)return {check:function(){var b=sb.get(),k=sk.get(),d=b*b-4*k;return Math.abs(d)<0.15*k+0.05?{ok:true,msg:'b² = 4k: the two roots merge into one (a repeated root), and the solution becomes (1 + ct)e^(−bt/2). Car suspension is designed near this.'}:{ok:false,msg:'b² − 4k = '+d.toFixed(2)+'. Make it zero.'}}}};

/* Fourier series of a square wave */
WIDGETS.mFSeries=function(box,par){par=par||{};var cv=canvas(box,220),sn=slider(box,'Number of terms',1,40,1,1,function(v){return v},function(){draw()}),st=stats(box,[['n','Highest harmonic'],['o','Overshoot at the jump']]);
 if(par.goal)qChal(box,'Use enough terms that the wave is close to square. Does the overshoot at the jump go away?');
 function f(x,N){var s=0;for(var k=0;k<N;k++){var n=2*k+1;s+=Math.sin(n*x)/n}return 4/Math.PI*s}
 function draw(){var N=sn.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,i,pts=[],sq=[],mx=0;for(i=0;i<=600;i++){var x=-Math.PI+2*Math.PI*i/600,y=f(x,N);if(x>0&&x<Math.PI/2)mx=Math.max(mx,y);pts.push([10+i/600*(W-20),H/2-y*H*0.32]);sq.push([10+i/600*(W-20),H/2-(x<0?-1:1)*H*0.32])}
  qLine(c,sq,cssv('--line'),1.5);qLine(c,pts,'#4aa3ff',2.2);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('square wave (grey) and the sum of the first '+N+' sine waves (blue)',12,14);st.n.textContent='sin('+(2*N-1)+'x)';st.o.textContent=((mx-1)*100).toFixed(1)+'%'}
 onDraw(draw);draw();el('p','small','f(x) = (4/π)[sin x + sin 3x/3 + sin 5x/5 + …]',box);
 if(par.goal)return {check:function(){return sn.get()>=20?{ok:true,msg:'The fit gets better everywhere, but the overshoot at the jump stays near 9%: the Gibbs phenomenon. It just gets narrower.'}:{ok:false,msg:'Add more terms (at least 20).'}}}};

/* contour integrals and residues */
WIDGETS.mContour=function(box,par){par=par||{};var P=[[1,0.8,1],[-1.2,-0.5,-2],[0.3,-1.6,3]],cv=canvas(box,260),sr=slider(box,'Contour radius',0.3,2.6,0.01,1,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['e','Poles inside'],['v','∮ f dz = 2πi × (sum of residues)']]);
 if(par.goal)qChal(box,'Choose a circle that encloses exactly two of the poles.');
 function inside(){var R=sr.get();return P.filter(function(p){return Math.hypot(p[0],p[1])<R})}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2,S=Math.min(W,H)/6.2,R=sr.get();qLine(c,[[10,cy],[W-10,cy]],cssv('--line'),1);qLine(c,[[cx,10],[cx,H-10]],cssv('--line'),1);c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();c.arc(cx,cy,R*S,0,7);c.stroke();
  var a=Math.PI/4;qArrow(c,cx+R*S*Math.cos(a-0.2),cy-R*S*Math.sin(a-0.2),cx+R*S*Math.cos(a),cy-R*S*Math.sin(a),cssv('--accent'),2.5);
  P.forEach(function(p){var inn=Math.hypot(p[0],p[1])<R;c.fillStyle=inn?'#e8742a':cssv('--muted');c.font='bold 16px system-ui';c.fillText('×',cx+p[0]*S-5,cy-p[1]*S+5);c.font='11px system-ui';c.fillText('Res '+p[2],cx+p[0]*S+8,cy-p[1]*S-6)});
  var ins=inside(),sum=ins.reduce(function(s,p){return s+p[2]},0);st.e.textContent=ins.length;st.v.textContent='2πi × '+sum+(sum?' = '+(2*Math.PI*sum).toFixed(2)+'i':' = 0')}
 onDraw(draw);draw();el('p','small','× marks a pole (where f blows up), with its residue. Only poles inside the contour count.',box);
 if(par.goal)return {check:function(){var n=inside().length;return n===2?{ok:true,msg:'Only the enclosed poles matter. The whole integral round the loop is decided by a couple of numbers: the residue theorem.'}:{ok:false,msg:n+' inside. Adjust the radius.'}}}};

/* a spacetime diagram with a boost */
WIDGETS.mLorentz=function(box,par){par=par||{};var cv=canvas(box,280),sv=slider(box,'Velocity of the moving frame v/c',-0.95,0.95,0.01,0.5,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['g','γ'],['s','Interval s² of the event (stays fixed)'],['p','Event in the moving frame (t′, x′)']]);
 if(par.goal)qChal(box,'Find the speed where the event happens at the same place (x′ = 0) in the moving frame.');
 var ev=[3,1.8];function draw(){var b=sv.get(),gm=1/Math.sqrt(1-b*b),g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H-26,S=Math.min(W/9,(H-40)/4.6);qLine(c,[[10,cy],[W-10,cy]],cssv('--text'),1.5);qLine(c,[[cx,cy],[cx,10]],cssv('--text'),1.5);
  c.setLineDash([4,4]);qLine(c,[[cx,cy],[cx+4.4*S,cy-4.4*S]],'#f5c542',1.5);qLine(c,[[cx,cy],[cx-4.4*S,cy-4.4*S]],'#f5c542',1.5);c.setLineDash([]);
  qLine(c,[[cx,cy],[cx+b*4.3*S,cy-4.3*S]],cssv('--accent'),2.5);qLine(c,[[cx,cy],[cx+4.3*S,cy-b*4.3*S]],cssv('--accent'),2.5);c.fillStyle=cssv('--accent');c.font='12px system-ui';c.fillText('t′',cx+b*4.3*S+4,cy-4.3*S+12);c.fillText('x′',cx+4.3*S-12,cy-b*4.3*S-6);
  c.fillStyle='#e8742a';c.beginPath();c.arc(cx+ev[1]*S,cy-ev[0]*S,6,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('light',cx+3.7*S,cy-3.4*S);c.fillText('t',cx+4,16);c.fillText('x',W-18,cy-6);
  var tp=gm*(ev[0]-b*ev[1]),xp=gm*(ev[1]-b*ev[0]);st.g.textContent=gm.toFixed(3);st.s.textContent=(ev[0]*ev[0]-ev[1]*ev[1]).toFixed(2);st.p.textContent='('+tp.toFixed(2)+', '+xp.toFixed(2)+')'}
 onDraw(draw);draw();el('p','small','The event is at t = 3, x = 1.8 (c = 1). The moving frame\'s axes tilt towards the light line. Everyone agrees on s² = t² − x².',box);
 if(par.goal)return {check:function(){var b=sv.get(),xp=(ev[1]-b*ev[0])/Math.sqrt(1-b*b);return Math.abs(xp)<0.06?{ok:true,msg:'v = 0.6c = x/t: that frame moves with the event, so it happens at x′ = 0, at t′ = √(t² − x²) = 2.4. That\'s the proper time, the same as √s².'}:{ok:false,msg:'x′ = '+xp.toFixed(2)+'. The frame must move at x/t.'}}}};

