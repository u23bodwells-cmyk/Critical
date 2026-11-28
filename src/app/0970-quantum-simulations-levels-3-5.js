/* ===== Quantum track: simulations for Levels 3 to 5 ===== */
function qLine(c,pts,col,w){c.strokeStyle=col;c.lineWidth=w||2;c.beginPath();pts.forEach(function(p,i){if(i===0)c.moveTo(p[0],p[1]);else c.lineTo(p[0],p[1])});c.stroke()}
function qArrow(c,x0,y0,x1,y1,col,w){c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w||3;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();var a=Math.atan2(y1-y0,x1-x0),h=9;c.beginPath();c.moveTo(x1,y1);c.lineTo(x1-h*Math.cos(a-0.4),y1-h*Math.sin(a-0.4));c.lineTo(x1-h*Math.cos(a+0.4),y1-h*Math.sin(a+0.4));c.fill()}

/* complex amplitudes add like arrows */
WIDGETS.qPhasor=function(box,par){par=par||{};var cv=canvas(box,240),sp=slider(box,'Phase difference φ',0,360,1,60,function(v){return v+'°'},function(){draw()}),sr=slider(box,'Size of amplitude b (a = 1)',0,1.5,0.01,1,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['s','|a + b|² (quantum)'],['c','|a|² + |b|² (no interference)']]);
 if(par.goal)qChal(box,'Make the two paths cancel completely, so the particle is never found here.');
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2-40,cy=H/2,R=Math.min(H*0.32,W*0.2),ph=sp.get()*Math.PI/180,b=sr.get();c.strokeStyle=cssv('--line');c.lineWidth=1;c.beginPath();c.moveTo(20,cy);c.lineTo(W-20,cy);c.moveTo(cx,10);c.lineTo(cx,H-10);c.stroke();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('real',W-48,cy-6);c.fillText('imaginary',cx+6,16);
  var ax=cx+R,ay=cy,bx=ax+R*b*Math.cos(ph),by=ay-R*b*Math.sin(ph);qArrow(c,cx,cy,ax,ay,'#4aa3ff');qArrow(c,ax,ay,bx,by,'#e8742a');qArrow(c,cx,cy,bx,by,cssv('--accent'),3.5);c.fillStyle='#4aa3ff';c.fillText('a',(cx+ax)/2,cy+16);c.fillStyle='#e8742a';c.fillText('b',(ax+bx)/2+6,(ay+by)/2);c.fillStyle=cssv('--accent');c.fillText('a + b',(cx+bx)/2-30,(cy+by)/2-8);
  var s=Math.pow(1+b*Math.cos(ph),2)+Math.pow(b*Math.sin(ph),2);st.s.textContent=s.toFixed(2);st.c.textContent=(1+b*b).toFixed(2)}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var ph=sp.get()*Math.PI/180,b=sr.get(),s=Math.pow(1+b*Math.cos(ph),2)+Math.pow(b*Math.sin(ph),2);return s<0.02?{ok:true,msg:'Equal sizes, opposite phases (180°): the amplitudes cancel. Two ways to arrive, and together they make zero chance. Classical probabilities can never do that.'}:{ok:false,msg:'|a + b|² is '+s.toFixed(2)+'. You need equal sizes pointing in opposite directions.'}}}};

/* expectation values in a box */
WIDGETS.qExpect=function(box,par){par=par||{};var cv=canvas(box,220),sc=slider(box,'Amount of level 2 (|c₂|²)',0,1,0.01,0.3,function(v){return (v*100).toFixed(0)+'%'},function(){draw()}),stt=slider(box,'Time',0,1,0.005,0,function(v){return (v*100).toFixed(0)+'% of a slosh'},function(){draw()}),st=stats(box,[['x','⟨x⟩'],['d','Δx'],['e','⟨E⟩ (E₁ = 1)'],['p','Measure E: chance of E₁ / E₂']]);
 if(par.goal)qChal(box,'Make the average energy ⟨E⟩ exactly 2.5 E₁.');
 function draw(){var c2=Math.sqrt(sc.get()),c1=Math.sqrt(1-sc.get()),t=stt.get()*2*Math.PI,g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(x){return 20+x*(W-40)},i,N=300,sx=0,sxx=0,s=0,pts=[],mx=0;
  for(i=0;i<=N;i++){var x=i/N,a=c1*Math.sin(Math.PI*x),b=c2*Math.sin(2*Math.PI*x),p=2*(a*a+b*b+2*a*b*Math.cos(t));pts.push([x,p]);s+=p;sx+=x*p;sxx+=x*x*p;mx=Math.max(mx,p)}
  var ex=sx/s,dx=Math.sqrt(Math.max(0,sxx/s-ex*ex));c.fillStyle=cssv('--text');c.fillRect(X(0)-4,14,4,H-38);c.fillRect(X(1),14,4,H-38);qLine(c,pts.map(function(q){return [X(q[0]),H-24-q[1]/4.2*(H-46)]}),cssv('--accent'),2.5);
  c.fillStyle='rgba(232,116,42,.18)';c.fillRect(X(ex-dx),H-24,X(ex+dx)-X(ex-dx),8);c.fillStyle='#e8742a';c.beginPath();c.arc(X(ex),H-20,6,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|ψ|², with ⟨x⟩ (dot) and ⟨x⟩ ± Δx (bar)',24,12);
  st.x.textContent=(ex*100).toFixed(0)+'% across';st.d.textContent=(dx*100).toFixed(0)+'% of the box';st.e.textContent=((1-sc.get())+4*sc.get()).toFixed(2)+' E₁';st.p.textContent=Math.round((1-sc.get())*100)+'% / '+Math.round(sc.get()*100)+'%'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var e=(1-sc.get())+4*sc.get();return Math.abs(e-2.5)<0.03?{ok:true,msg:'|c₂|² = 50%: ⟨E⟩ = 0.5 × 1 + 0.5 × 4 = 2.5 E₁. But no single measurement ever gives 2.5: you always get 1 or 4. ⟨E⟩ is an average.'}:{ok:false,msg:'⟨E⟩ = '+e.toFixed(2)+' E₁. It\'s |c₁|² × 1 + |c₂|² × 4.'}}}};

/* the quantum harmonic oscillator */
WIDGETS.qSHO=function(box,par){par=par||{};var cv=canvas(box,250),cl=false,sn=slider(box,'Level n',0,12,1,0,function(v){return v},function(){draw()}),r=row(box),tb=btn(r,'Show the classical prediction',function(){cl=!cl;tb.textContent=cl?'Hide the classical prediction':'Show the classical prediction';draw()}),st=stats(box,[['e','Energy'],['o','Chance outside the classical region']]);
 if(par.goal)qChal(box,par.goal[1]);
 function psi(n,x){var h0=1,h1=2*x;if(n===0)return Math.exp(-x*x/2);for(var k=1;k<n;k++){var h2=2*x*h1-2*k*h0;h0=h1;h1=h2}var f=1;for(var j=2;j<=n;j++)f*=j;return h1*Math.exp(-x*x/2)/Math.sqrt(Math.pow(2,n)*f*Math.sqrt(Math.PI))}
 function draw(){var n=sn.get(),E=n+0.5,A=Math.sqrt(2*E),g=prep(cv),c=g.c,W=g.W,H=g.H,L=6.2,X=function(x){return W/2+x/L*(W/2-14)},i,pts=[],pc=[],out=0,tot=0,mx=0;
  qLine(c,(function(){var a=[];for(var i=-60;i<=60;i++){var x=i/60*L;a.push([X(x),H-20-(x*x/2)/14*(H-40)])}return a})(),cssv('--muted'),1.5);
  var yE=H-20-E/14*(H-40);c.setLineDash([5,4]);qLine(c,[[X(-A),yE],[X(A),yE]],cssv('--accent'),1);c.setLineDash([]);
  for(i=-300;i<=300;i++){var x=i/300*L,p=Math.pow(psi(n,x),2);mx=Math.max(mx,p);tot+=p;if(Math.abs(x)>A)out+=p}
  for(i=-300;i<=300;i++){x=i/300*L;p=Math.pow(psi(n,x),2);pts.push([X(x),yE-p/mx*(H*0.28)]);if(cl&&Math.abs(x)<A*0.995){var q=1/(Math.PI*Math.sqrt(A*A-x*x));pc.push([X(x),yE-Math.min(q/mx,1.6)*(H*0.28)])}}
  qLine(c,pts,'#4aa3ff',2.2);if(cl)qLine(c,pc,'#e8742a',1.8);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('potential ½kx² and |ψₙ|² (blue)'+(cl?', classical (orange)':''),14,14);[[-A,'turning point'],[A,'']].forEach(function(t){c.fillRect(X(t[0])-1,yE-4,2,8)});
  st.e.textContent='('+n+' + ½) ħω = '+E.toFixed(1)+' ħω';st.o.textContent=(out/tot*100).toFixed(1)+'%'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var n=sn.get();return n===par.goal[0]?{ok:true,msg:par.goal[2]}:{ok:false,msg:'That\'s level '+n+'.'}}}};

/* states as vectors: measuring in different bases */
WIDGETS.qVector=function(box,par){par=par||{};var cv=canvas(box,250),sa=slider(box,'State |ψ⟩ angle',0,180,1,30,function(v){return v+'°'},function(){draw()}),sb=slider(box,'Measurement basis angle',0,90,1,0,function(v){return v+'°'},function(){draw()}),st=stats(box,[['a','P(first outcome)'],['b','P(second outcome)']]);
 if(par.goal)qChal(box,'Choose a measurement basis where the outcome is completely certain.');
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2+10,R=Math.min(W,H)*0.38,a=sa.get()*Math.PI/180,b=sb.get()*Math.PI/180;c.strokeStyle=cssv('--line');c.lineWidth=1;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();
  var e1=[Math.cos(b),Math.sin(b)],e2=[-Math.sin(b),Math.cos(b)],v=[Math.cos(a),Math.sin(a)];qArrow(c,cx,cy,cx+R*e1[0],cy-R*e1[1],cssv('--muted'),2);qArrow(c,cx,cy,cx+R*e2[0],cy-R*e2[1],cssv('--muted'),2);
  var p1=v[0]*e1[0]+v[1]*e1[1],p2=v[0]*e2[0]+v[1]*e2[1];c.setLineDash([4,4]);qLine(c,[[cx+R*v[0],cy-R*v[1]],[cx+R*p1*e1[0],cy-R*p1*e1[1]]],'#4aa3ff',1.5);qLine(c,[[cx+R*v[0],cy-R*v[1]],[cx+R*p2*e2[0],cy-R*p2*e2[1]]],'#e8742a',1.5);c.setLineDash([]);
  qLine(c,[[cx,cy],[cx+R*p1*e1[0],cy-R*p1*e1[1]]],'#4aa3ff',5);qLine(c,[[cx,cy],[cx+R*p2*e2[0],cy-R*p2*e2[1]]],'#e8742a',5);qArrow(c,cx,cy,cx+R*v[0],cy-R*v[1],cssv('--accent'),3.5);
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|ψ⟩ (purple), basis vectors (grey), projections ⟨eᵢ|ψ⟩ (blue, orange)',10,14);st.a.textContent=Math.round(p1*p1*100)+'%';st.b.textContent=Math.round(p2*p2*100)+'%'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var d=(sa.get()-sb.get())*Math.PI/180,p=Math.pow(Math.cos(d),2);return p>0.995||p<0.005?{ok:true,msg:'The state lines up with one of the basis vectors, so it\'s an eigenstate of that measurement: the result is certain. In any other basis, it\'s a superposition.'}:{ok:false,msg:'The chances are '+Math.round(p*100)+'% and '+Math.round((1-p)*100)+'%. Line a basis vector up with the state.'}}}};

/* hydrogen orbitals: a slice through the electron cloud */
WIDGETS.qOrbital=function(box,par){par=par||{};var OR={'1s':[1,0,function(x,z,r){return Math.exp(-r)}],'2s':[2,0,function(x,z,r){return (2-r)*Math.exp(-r/2)}],'2p_z':[2,1,function(x,z,r){return z*Math.exp(-r/2)}],'2p_x':[2,1,function(x,z,r){return x*Math.exp(-r/2)}],'3s':[3,0,function(x,z,r){return (27-18*r+2*r*r)*Math.exp(-r/3)}],'3p_z':[3,1,function(x,z,r){return (6-r)*z*Math.exp(-r/3)}],'3d_z²':[3,2,function(x,z,r){return (3*z*z-r*r)*Math.exp(-r/3)}],'3d_xz':[3,2,function(x,z,r){return x*z*Math.exp(-r/3)}],'4f_z³':[4,3,function(x,z,r){return z*(5*z*z-3*r*r)*Math.exp(-r/4)}]},k=par.start||'1s';
 var cv=canvas(box,300);qSeg(box,'Orbital',Object.keys(OR).map(function(x){return [x,x.replace('_',' ')]}),k,function(v){k=v;draw()});var st=stats(box,[['q','Quantum numbers'],['n','Nodes']]);
 if(par.goal)qChal(box,par.goal[1]);
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,o=OR[k],n=o[0],ext=n*n*2.6+4,S=Math.min(W,H-12),res=110,img=c.createImageData(res,res),mx=0,vals=[],i,j;
  for(j=0;j<res;j++)for(i=0;i<res;i++){var x=(i/(res-1)*2-1)*ext,z=(1-j/(res-1)*2)*ext,r=Math.sqrt(x*x+z*z),v=o[2](x,z,r);vals.push(v);mx=Math.max(mx,v*v)}
  for(i=0;i<vals.length;i++){var lv=vals[i]*vals[i]/mx,d=lv<=1e-12?0:Math.max(0,Math.min(1,(Math.log(lv)/Math.LN10+3.5)/3.5)),pos=vals[i]>=0;img.data[i*4]=pos?Math.round(74*d+20*(1-d)):Math.round(232*d+20*(1-d));img.data[i*4+1]=pos?Math.round(163*d+20*(1-d)):Math.round(116*d+20*(1-d));img.data[i*4+2]=pos?Math.round(255*d+30*(1-d)):Math.round(42*d+30*(1-d));img.data[i*4+3]=255}
  var tmp=document.createElement('canvas');tmp.width=res;tmp.height=res;tmp.getContext('2d').putImageData(img,0,0);c.imageSmoothingEnabled=true;var sz=S-20,ox=(W-sz)/2;c.drawImage(tmp,ox,10,sz,sz);c.fillStyle='#fff';c.beginPath();c.arc(W/2,10+sz/2,2.5,0,7);c.fill();
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('blue = +ψ, orange = −ψ, dark = node',8,H-6);
  var l=o[1],ml=k==='2p_x'||k==='3d_xz'?'±1 mix':'0';st.q.textContent='n = '+n+', l = '+l+' ('+'spdf'[l]+'), m = '+ml;st.n.textContent=(n-1)+' total: '+(n-l-1)+' spherical, '+l+' angular'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var o=OR[k],g=par.goal;if(g[0]==='n3')return o[0]===3&&o[1]===0?{ok:true,msg:'3s: two spherical nodes (rings in the slice) where ψ changes sign.'}:{ok:false,msg:'Look for an s orbital (l = 0) with n − 1 = 2 nodes.'};if(g[0]==='plane')return o[1]>=1?{ok:true,msg:'A '+'spdf'[o[1]]+' orbital: it has a nodal plane (or cone) through the nucleus, where ψ flips sign.'}:{ok:false,msg:'s orbitals are round: no planes through the nucleus. Try p or d.'};return {ok:true}}}};

/* radial probability for hydrogen */
WIDGETS.qRadial=function(box,par){par=par||{};var cv=canvas(box,230),sn=slider(box,'n',1,5,1,1,function(v){return v},function(){if(sl.get()>sn.get()-1)sl.set(sn.get()-1);draw()}),sl=slider(box,'l',0,4,1,0,function(v){return v+' ('+'spdfg'[v]+')'},function(){if(sl.get()>sn.get()-1)sl.set(sn.get()-1);draw()}),st=stats(box,[['p','Most likely radius'],['m','Average radius ⟨r⟩'],['b','Bumps (n − l)']]);
 if(par.goal)qChal(box,par.goal[1]);
 function lag(k,a,x){if(k===0)return 1;var l0=1,l1=1+a-x;for(var j=1;j<k;j++){var l2=((2*j+1+a-x)*l1-(j+a)*l0)/(j+1);l0=l1;l1=l2}return l1}
 function P(n,l,r){var rho=2*r/n,R=Math.pow(rho,l)*Math.exp(-rho/2)*lag(n-l-1,2*l+1,rho);return r*r*R*R}
 function draw(){var n=sn.get(),l=Math.min(sl.get(),n-1),g=prep(cv),c=g.c,W=g.W,H=g.H,rmax=Math.max(10,n*n*3+6),N=500,pts=[],mx=0,s=0,sr=0,pk=0,pv=0,i;
  for(i=1;i<=N;i++){var r=i/N*rmax,p=P(n,l,r);if(p>pv){pv=p;pk=r}mx=Math.max(mx,p);s+=p;sr+=r*p}
  for(i=0;i<=N;i++){r=i/N*rmax;pts.push([20+r/rmax*(W-40),H-26-P(n,l,r)/mx*(H-50)])}c.fillStyle=cssv('--accent-bg');c.beginPath();c.moveTo(20,H-26);pts.forEach(function(q){c.lineTo(q[0],q[1])});c.lineTo(W-20,H-26);c.fill();qLine(c,pts,cssv('--accent'),2.5);
  var avg=sr/s;c.fillStyle='#e8742a';c.fillRect(20+avg/rmax*(W-40)-1,20,2,H-46);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('P(r) = r²|R|²: chance of finding the electron at distance r',22,14);c.fillText('r (Bohr radii, a₀ = 0.0529 nm) →',W-200,H-8);c.fillText('⟨r⟩',20+avg/rmax*(W-40)+4,32);
  st.p.textContent=pk.toFixed(1)+' a₀';st.m.textContent=avg.toFixed(1)+' a₀';st.b.textContent=n-l}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var n=sn.get(),l=Math.min(sl.get(),n-1);return n-l===par.goal[0]?{ok:true,msg:'n = '+n+', l = '+l+': '+(n-l)+' bumps, with '+(n-l-1)+' radial nodes between them.'}:{ok:false,msg:'This has '+(n-l)+' bumps. The number of bumps is n − l.'}}}};

/* filling electrons into orbitals */
WIDGETS.qFill=function(box,par){par=par||{};var ORD=[['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6]],SYM='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' '),cv=canvas(box,200),sz=slider(box,'Element (number of electrons)',1,36,1,6,function(v){return v+': '+SYM[v-1]},function(){draw()}),st=stats(box,[['c','Electron configuration']]);
 if(par.goal)qChal(box,par.goal[1]);
 function draw(){var Z=sz.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,left=Z,conf=[],y=H-24,bw=Math.max(11,Math.min(18,(W-170)/9-3)),rowH=(H-30)/ORD.length*1.0;c.font='12px system-ui';
  var rows={1:[],2:[],3:[],4:[]};ORD.forEach(function(o){var cap=o[1],put=Math.min(cap,left);left-=put;if(put)conf.push(o[0]+'<sup>'+put+'</sup>');var boxes=cap/2,arr=[];for(var b=0;b<boxes;b++)arr.push(0);for(var e=0;e<put;e++){var bi=e<boxes?e:e-boxes;arr[bi]++}rows[o[0][0]].push([o[0],arr])});
  var yy=14;[4,3,2,1].forEach(function(n){var x=44;c.fillStyle=cssv('--muted');c.fillText('n = '+n,6,yy+12);rows[n].forEach(function(o){c.fillStyle=cssv('--muted');c.fillText(o[0],x,yy+12);x+=22;o[1].forEach(function(k){c.strokeStyle=cssv('--line');c.lineWidth=1.5;c.strokeRect(x,yy,bw,bw);c.fillStyle=cssv('--accent');c.font='bold '+(bw<15?11:13)+'px system-ui';if(k>=1)c.fillText('↑',x+1,yy+bw*0.78);if(k>=2)c.fillText('↓',x+bw*0.48,yy+bw*0.78);c.font='12px system-ui';x+=bw+3});x+=12});yy+=(H-20)/4});
  st.c.innerHTML=conf.join(' ')}
 onDraw(draw);draw();el('p','small','Each box holds two electrons with opposite spins (Pauli). Boxes in a set fill singly first (Hund\'s rule). Chromium and copper break the simple order slightly.',box);
 if(par.goal)return {check:function(){return sz.get()===par.goal[0]?{ok:true,msg:par.goal[2]}:{ok:false,msg:SYM[sz.get()-1]+' isn\'t it. Watch the boxes as you add electrons.'}}}};

/* the variational principle: guess a wavefunction, minimise its energy */
WIDGETS.qVariational=function(box,par){par=par||{};var cv=canvas(box,230),sa=slider(box,'Width parameter α of your guess e^(−αr²)',0.03,1.5,0.001,0.8,function(v){return v.toFixed(3)},function(){draw()}),st=stats(box,[['e','Energy of your guess'],['t','True ground state'],['b','Best a Gaussian can do']]);
 if(par.goal)qChal(box,'Tune α to get the energy as low as it will go. Can you beat −13.6 eV?');
 var HA=27.211;function E(a){return (1.5*a-2*Math.sqrt(2*a/Math.PI))*HA}
 function draw(){var a=sa.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(v){return 40+(v-0.03)/1.47*(W-60)},Y=function(e){return 20+(e+15)/17*(H-50)},i,pts=[];c.strokeStyle=cssv('--line');c.lineWidth=1;[-13.6,-10,-5,0].forEach(function(e){c.beginPath();c.moveTo(40,Y(e));c.lineTo(W-20,Y(e));c.stroke();c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText(e+' eV',2,Y(e)+4)});
  c.setLineDash([5,4]);qLine(c,[[40,Y(-13.6)],[W-20,Y(-13.6)]],cssv('--good-line'),1.5);c.setLineDash([]);c.fillStyle=cssv('--good-line');c.fillText('true answer −13.6 eV',W-140,Y(-13.6)-5);
  for(i=0;i<=200;i++){var v=0.03+1.47*i/200;pts.push([X(v),Y(Math.min(2,E(v)))])}qLine(c,pts,cssv('--accent'),2.5);c.fillStyle='#e8742a';c.beginPath();c.arc(X(a),Y(Math.min(2,E(a))),7,0,7);c.fill();c.fillStyle=cssv('--muted');c.fillText('energy of the guess as α changes',44,14);c.fillText('α →',W-40,H-8);
  st.e.textContent=E(a).toFixed(2)+' eV';st.t.textContent='−13.60 eV';st.b.textContent='−11.55 eV (α = 0.283)'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var e=E(sa.get());return e<-11.35?{ok:true,msg:'About −11.5 eV: the best a Gaussian guess can do. It never goes below −13.6 eV. That\'s the variational principle: every guess is an upper bound on the true ground-state energy.'}:{ok:false,msg:'Your guess gives '+e.toFixed(2)+' eV. Find the bottom of the curve.'}}}};

/* decoherence on the Bloch sphere */
WIDGETS.qBloch=function(box,par){par=par||{};var cv=canvas(box,240),run=false,t=0,v=null,v0=null,s0=slider(box,'Starting tilt θ',0,180,1,90,function(x){return x+'°'},function(){reset()}),s1=slider(box,'T₁ (energy loss) time',0.5,60,0.5,10,function(x){return x.toFixed(1)},function(){}),s2=slider(box,'T₂ (phase loss) time',0.2,20,0.1,2,function(x){return x.toFixed(1)},function(){});
 var r=row(box),bt=btn(r,'▶ Run',function(){run=!run;bt.textContent=run?'⏸ Pause':'▶ Run'});btn(r,'Reset',function(){reset()});var st=stats(box,[['r','Length of the arrow'],['p','Purity Tr(ρ²)'],['z','Chance of |0⟩']]);
 if(par.goal)qChal(box,'Start in a 50/50 superposition (θ = 90°). Make it lose its superposition (arrow shrinks to the axis) while keeping its 50/50 populations: short T₂, long T₁.');
 function reset(){var th=s0.get()*Math.PI/180;v=[Math.sin(th),0,Math.cos(th)];v0=v.slice();t=0;draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W*0.3,cy=H/2,R=Math.min(H*0.4,W*0.24);c.strokeStyle=cssv('--line');c.lineWidth=1.3;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.beginPath();c.ellipse(cx,cy,R,R*0.3,0,0,7);c.stroke();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|0⟩',cx-9,cy-R-5);c.fillText('|1⟩',cx-9,cy+R+14);
  var px=cx+R*(v[0]*0.95+v[1]*0.3),py=cy-R*(v[2]-v[1]*0.15);qArrow(c,cx,cy,px,py,cssv('--accent'),3);var len=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  var bx=W*0.62,bw=W*0.32;c.fillStyle=cssv('--muted');c.fillText('density matrix ρ',bx,24);var rho=[[(1+v[2])/2,Math.sqrt(v[0]*v[0]+v[1]*v[1])/2],[Math.sqrt(v[0]*v[0]+v[1]*v[1])/2,(1-v[2])/2]];
  for(var i=0;i<2;i++)for(var j=0;j<2;j++){var val=rho[i][j],x=bx+j*(bw/2),y=34+i*(bw/2);c.fillStyle=i===j?'rgba(74,163,255,'+(0.15+val*0.85)+')':'rgba(232,116,42,'+(0.12+val*1.7)+')';c.fillRect(x,y,bw/2-6,bw/2-6);c.fillStyle=cssv('--text');c.fillText(val.toFixed(2),x+8,y+bw/4)}
  c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('blue: populations',bx,34+bw+4);c.fillText('orange: coherences',bx,34+bw+18);st.r.textContent=len.toFixed(2);st.p.textContent=((1+len*len)/2).toFixed(2);st.z.textContent=Math.round((1+v[2])/2*100)+'%'}
 anim(cv,function(dt){if(run&&v){t+=dt*2;var T1=s1.get(),T2=Math.min(s2.get(),2*T1),w=2.5,d=dt*2;var x=v[0],y=v[1];v[0]=(x*Math.cos(w*d)-y*Math.sin(w*d))*Math.exp(-d/T2);v[1]=(x*Math.sin(w*d)+y*Math.cos(w*d))*Math.exp(-d/T2);v[2]=1-(1-v[2])*Math.exp(-d/T1);draw()}});reset();
 el('p','small','The arrow is the Bloch vector. On the surface: a pure state. Inside: a mixed state. It precesses around the z-axis while the environment shrinks it.',box);
 if(par.goal)return {check:function(){var xy=Math.sqrt(v[0]*v[0]+v[1]*v[1]);if(Math.abs(s0.get()-90)>3)return {ok:false,msg:'Start at θ = 90°: a 50/50 superposition.'};if(xy>0.1)return {ok:false,msg:'The arrow still points sideways ('+xy.toFixed(2)+'). Run it longer, with a short T₂.'};return Math.abs(v[2])<0.22?{ok:true,msg:'Still 50/50 populations, but no coherence left: a mixed state, not a superposition. It can\'t interfere any more. That\'s decoherence, and it\'s what quantum computers fight.'}:{ok:false,msg:'It lost its coherence, but also its populations drifted to |0⟩. Make T₁ longer.'}}}};

/* a two-qubit circuit */
WIDGETS.qCircuit=function(box,par){par=par||{};var COLS=4,g0=['','','',''],g1=['','','',''],cn=[false,false,false,false],samp=null,R2=Math.SQRT1_2,CYC=['','H','X','Z'];
 var grid=el('div','qcirc',null,box);var cv=canvas(box,150);var r=row(box);btn(r,'Measure 100 times',function(){var s=state(),p=s.map(function(a){return a*a}),c=[0,0,0,0];for(var i=0;i<100;i++){var u=Math.random(),k=0,acc=p[0];while(u>acc&&k<3){k++;acc+=p[k]}c[k]++}samp=c;draw()});btn(r,'Clear',function(){g0=['','','',''];g1=['','','',''];cn=[false,false,false,false];samp=null;ui();draw()});
 if(par.goal)qChal(box,par.goal[1]);
 function apply1(s,q,G){var o=s.slice(),i;for(i=0;i<4;i++){var bit=q===0?(i>>1)&1:i&1;if(bit)continue;var j=q===0?i|2:i|1,a=s[i],b=s[j];if(G==='H'){o[i]=(a+b)*R2;o[j]=(a-b)*R2}else if(G==='X'){o[i]=b;o[j]=a}else if(G==='Z'){o[i]=a;o[j]=-b}}return o}
 function state(){var s=[1,0,0,0];for(var k=0;k<COLS;k++){if(g0[k])s=apply1(s,0,g0[k]);if(g1[k])s=apply1(s,1,g1[k]);if(cn[k]){var t=s[2];s[2]=s[3];s[3]=t}}return s}
 function ui(){grid.innerHTML='';var h='<div class="qcr"><span class="qcl">q₀ |0⟩</span>';for(var k=0;k<COLS;k++)h+='<button type="button" class="qcg'+(g0[k]?' on':'')+'" data-q="0" data-k="'+k+'">'+(g0[k]||'·')+'</button>';h+='</div><div class="qcr qcn"><span class="qcl"></span>';
  for(k=0;k<COLS;k++)h+='<button type="button" class="qcc'+(cn[k]?' on':'')+'" data-c="'+k+'" title="CNOT: q₀ controls q₁">'+(cn[k]?'●⊕':'CNOT')+'</button>';h+='</div><div class="qcr"><span class="qcl">q₁ |0⟩</span>';for(k=0;k<COLS;k++)h+='<button type="button" class="qcg'+(g1[k]?' on':'')+'" data-q="1" data-k="'+k+'">'+(g1[k]||'·')+'</button>';grid.innerHTML=h+'</div>';
  [].forEach.call(grid.querySelectorAll('.qcg'),function(b){b.onclick=function(){var arr=b.dataset.q==='0'?g0:g1,k=+b.dataset.k;arr[k]=CYC[(CYC.indexOf(arr[k])+1)%CYC.length];samp=null;ui();draw()}});
  [].forEach.call(grid.querySelectorAll('.qcc'),function(b){b.onclick=function(){var k=+b.dataset.c;cn[k]=!cn[k];samp=null;ui();draw()}})}
 function draw(){var s=state(),g=prep(cv),c=g.c,W=g.W,H=g.H,bw=(W-40)/4;['|00⟩','|01⟩','|10⟩','|11⟩'].forEach(function(lb,i){var x=20+i*bw,a=s[i],p=a*a;c.fillStyle=cssv('--soft2');c.fillRect(x+6,20,bw-12,H-60);c.fillStyle=a<0?'#e8742a':'#4aa3ff';c.fillRect(x+6,20+(H-60)*(1-p),bw-12,(H-60)*p);c.fillStyle=cssv('--text');c.font='13px system-ui';c.fillText(lb,x+bw/2-14,H-24);c.font='11px system-ui';c.fillStyle=cssv('--muted');c.fillText('amp '+(Math.abs(a)<1e-9?'0':a.toFixed(2)),x+8,H-10);if(samp){c.fillStyle=cssv('--text');c.fillText(samp[i]+'×',x+8,16)}})}
 ui();draw();el('p','small','Tap a gate box to cycle H → X → Z. CNOT flips q₁ when q₀ is 1. Columns run left to right. Orange bars mean a negative amplitude.',box);
 if(par.goal)return {check:function(){var s=state(),g=par.goal[0];if(g==='11')return Math.abs(s[3])>0.99?{ok:true,msg:'|11⟩: an X on each qubit flips both from 0 to 1.'}:{ok:false,msg:'Get all the probability into |11⟩.'};if(g==='bell'){var ok=Math.abs(Math.abs(s[0])-R2)<0.01&&Math.abs(Math.abs(s[3])-R2)<0.01&&Math.abs(s[1])<0.01&&Math.abs(s[2])<0.01;return ok?{ok:true,msg:'A Bell state: (|00⟩ + |11⟩)/√2. Measure 100 times: always 00 or 11, never 01 or 10. The two qubits are entangled.'}:{ok:false,msg:'You need half the chance in |00⟩, half in |11⟩, none in the others. Try H on q₀, then a CNOT.'}}if(g==='plus')return Math.abs(s[0]-0.5)<0.01&&Math.abs(s[1]-0.5)<0.01&&Math.abs(s[2]-0.5)<0.01&&Math.abs(s[3]-0.5)<0.01?{ok:true,msg:'An equal superposition of all four states: H on both qubits. With n qubits, n H gates make all 2ⁿ states at once.'}:{ok:false,msg:'Make all four bars equal and positive.'};return {ok:true}}}};

/* pair production */
WIDGETS.qPair=function(box,par){par=par||{};var cv=canvas(box,220),t=0,made=false,s=slider(box,'Photon energy',0.1,3,0.005,0.6,function(v){return v.toFixed(3)+' MeV'},function(){t=0;made=false;draw()}),st=stats(box,[['r','Result'],['k','Kinetic energy shared']]);var r=row(box);btn(r,'Fire the photon',function(){t=0;made=false;run=true});var run=false;
 if(par.goal)qChal(box,'Find the lowest photon energy that can make an electron and a positron.');
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,E=s.get(),nx=W*0.55,ny=H/2,ok=E>=1.022;c.fillStyle=cssv('--coral');c.beginPath();c.arc(nx,ny,9,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('nucleus',nx-20,ny+26);
  var px=Math.min(t*260,nx);if(t*260<nx){c.strokeStyle='#b07bff';c.lineWidth=2.5;c.beginPath();for(var x=10;x<px;x++){var y=ny-8*Math.sin(x/5);if(x===10)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();c.fillText('γ',px-6,ny-14)}
  else if(ok){var d=(t*260-nx)*0.8;c.fillStyle='#4aa3ff';c.beginPath();c.arc(nx+d,ny-d*0.6,6,0,7);c.fill();c.fillStyle='#e8742a';c.beginPath();c.arc(nx+d,ny+d*0.6,6,0,7);c.fill();c.fillStyle=cssv('--text');c.fillText('e⁻',nx+d+8,ny-d*0.6);c.fillText('e⁺',nx+d+8,ny+d*0.6+10)}
  else{c.strokeStyle='#b07bff';c.lineWidth=2.5;c.beginPath();for(x=nx;x<nx+(t*260-nx);x++){y=ny-8*Math.sin(x/5);if(x===nx)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke()}
  st.r.textContent=ok?'electron + positron made':'not enough energy: photon carries on';st.k.textContent=ok?(E-1.022).toFixed(3)+' MeV':'–'}
 anim(cv,function(dt){if(run){t+=dt;if(t>3)run=false;draw()}});draw();
 if(par.goal)return {check:function(){var E=s.get();if(E<1.022)return {ok:false,msg:E.toFixed(3)+' MeV is too little. Each particle needs mc² = 0.511 MeV.'};return E<1.06?{ok:true,msg:'1.022 MeV = 2 × 0.511 MeV: the rest energy of an electron plus a positron. Energy turns into matter and antimatter, exactly as Dirac\'s equation predicted.'}:{ok:false,msg:'That works, but you can go lower. Find the threshold.'}}}};

/* a field as a chain of oscillators: particles are quanta of its modes */
WIDGETS.qModes=function(box,par){par=par||{};var N=24,M=6,q=[0,0,0,0,0,0],t=0,cv=canvas(box,200),sk=slider(box,'Mode',1,M,1,1,function(v){return v},function(){draw()});var r=row(box);btn(r,'+1 quantum in this mode',function(){q[sk.get()-1]++;draw()});btn(r,'−1',function(){var k=sk.get()-1;if(q[k]>0)q[k]--;draw()});btn(r,'Empty (vacuum)',function(){q=[0,0,0,0,0,0];draw()});var st=stats(box,[['f','Fock state'],['e','Energy above the vacuum']]);
 if(par.goal)qChal(box,'Make the state |2, 0, 1, 0, 0, 0⟩: two quanta in mode 1 and one in mode 3.');
 function w(k){return 2*Math.sin(k*Math.PI/(2*(N+1)))}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,dx=(W-40)/(N+1),i,k,pts=[];for(i=1;i<=N;i++){var y=0;for(k=1;k<=M;k++){if(!q[k-1])continue;y+=Math.sqrt(q[k-1])*Math.sin(k*i*Math.PI/(N+1))*Math.cos(w(k)*t*3)}pts.push([20+i*dx,H/2-y*18])}
  c.strokeStyle=cssv('--line');c.lineWidth=1.2;c.beginPath();c.moveTo(20,H/2);pts.forEach(function(p){c.lineTo(p[0],p[1])});c.lineTo(W-20,H/2);c.stroke();pts.forEach(function(p){c.fillStyle=cssv('--accent');c.beginPath();c.arc(p[0],p[1],4.5,0,7);c.fill()});
  var k0=sk.get();c.setLineDash([4,4]);var gh=[];for(i=0;i<=60;i++){var xx=i/60;gh.push([20+xx*(W-40),H-26-10*Math.sin(k0*Math.PI*xx)])}qLine(c,gh,cssv('--muted'),1);c.setLineDash([]);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('shape of mode '+k0+' (frequency '+w(k0).toFixed(2)+')',22,H-6);c.fillText('atoms on springs: a "field"',22,14);
  var E=0;for(k=1;k<=M;k++)E+=q[k-1]*w(k);st.f.textContent='|'+q.join(', ')+'⟩';st.e.textContent=E.toFixed(2)+' (sum of n × ħω)'+(E===0?' · vacuum':'')}
 anim(cv,function(dt){t+=dt;draw()});draw();el('p','small','Each mode can only hold whole numbers of quanta. In quantum field theory, one quantum of a mode is what we call a particle.',box);
 if(par.goal)return {check:function(){return q.join()==='2,0,1,0,0,0'?{ok:true,msg:'|2, 0, 1, 0, 0, 0⟩: three "particles", two of the same kind in mode 1. This is how quantum field theory counts particles.'}:{ok:false,msg:'Right now it\'s |'+q.join(', ')+'⟩.'}}}};

