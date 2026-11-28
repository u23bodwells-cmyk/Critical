/* ===== Quantum track: simulations ===== */
var QH=6.626e-34,QC=2.998e8,QE=1.602e-19,QME=9.109e-31,QMP=1.673e-27,QHB=1.0546e-34;
/* the colour of light of a given wavelength (nm); outside the visible range it's drawn as grey */
function qRGB(nm,a){var r=0,g=0,b=0;if(nm>=380&&nm<440){r=-(nm-440)/60;b=1}else if(nm<490&&nm>=440){g=(nm-440)/50;b=1}else if(nm<510&&nm>=490){g=1;b=-(nm-510)/20}else if(nm<580&&nm>=510){r=(nm-510)/70;g=1}else if(nm<645&&nm>=580){r=1;g=-(nm-645)/65}else if(nm>=645&&nm<=750){r=1}
 if(nm<380||nm>750)return 'rgba(150,150,170,'+(a==null?1:a)+')';var f=nm<420?0.3+0.7*(nm-380)/40:nm>700?0.3+0.7*(750-nm)/50:1;function c(x){return Math.round(255*Math.pow(x*f,0.8))}return 'rgba('+c(r)+','+c(g)+','+c(b)+','+(a==null?1:a)+')'}
function qBand(nm){return nm<10?'X-ray':nm<380?'ultraviolet':nm<=750?['violet','blue','cyan','green','yellow','orange','red'][nm<450?0:nm<485?1:nm<500?2:nm<565?3:nm<590?4:nm<625?5:6]:nm<1e6?'infrared':'microwave'}
function qSci(v,d){if(v===0)return '0';var e=Math.floor(Math.log10(Math.abs(v))),m=v/Math.pow(10,e);m=+m.toFixed(d==null?2:d);if(Math.abs(m)>=10){m/=10;e++}return (e>=-2&&e<=3)?String(+v.toPrecision(3)):m+' × 10<sup>'+(e<0?'−'+(-e):e)+'</sup>'}
function qLen(m){var a=Math.abs(m);return a>=1?+m.toPrecision(3)+' m':a>=1e-3?+(m*1e3).toPrecision(3)+' mm':a>=1e-6?+(m*1e6).toPrecision(3)+' µm':a>=1e-9?+(m*1e9).toPrecision(3)+' nm':a>=1e-12?+(m*1e12).toPrecision(3)+' pm':a>=1e-15?+(m*1e15).toPrecision(3)+' fm':qSci(m)+' m'}
function qTime(s){if(s<1e-6)return qSci(s)+' s';if(s<1e-3)return +(s*1e6).toPrecision(3)+' µs';if(s<1)return +(s*1e3).toPrecision(3)+' ms';if(s<120)return +s.toPrecision(3)+' s';if(s<7200)return +(s/60).toPrecision(3)+' minutes';if(s<172800)return +(s/3600).toPrecision(3)+' hours';if(s<3.156e7*2)return +(s/86400).toPrecision(3)+' days';var y=s/3.156e7;return y<1e6?+y.toPrecision(3)+' years':y<1e9?+(y/1e6).toPrecision(3)+' million years':+(y/1e9).toPrecision(3)+' billion years'}
function qChal(box,txt){return el('p','qchal','<b>Challenge:</b> '+txt,box)}
function qSeg(box,label,opts,val,cb){var r=row(box);r.classList.add('qseg');r.innerHTML='<span class="small">'+label+'</span>';var bs=[];opts.forEach(function(o){var b=el('button','wbtn'+(o[0]===val?' on':''),o[1],r);b.type='button';b.onclick=function(){bs.forEach(function(x){x.classList.remove('on')});b.classList.add('on');cb(o[0])};bs.push(b)});return r}

/* waves: wavelength, frequency and colour */
WIDGETS.qWave=function(box,par){par=par||{};var cv=canvas(box,170),t=0,s=slider(box,'Wavelength',par.min||380,par.max||750,1,par.start||550,function(v){return v+' nm'},function(){draw()}),st=stats(box,[['c','Colour'],['f','Frequency'],['e',par.energy?'Photon energy':'Waves per second']]);
 if(par.target)qChal(box,par.target[1]);
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,nm=s.get(),px=nm/750*W*0.42;c.strokeStyle=qRGB(nm);c.lineWidth=3;c.beginPath();for(var x=0;x<=W;x+=2){var y=H/2-H*0.32*Math.sin(2*Math.PI*(x/px)-t);if(x===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
  c.strokeStyle=cssv('--muted');c.lineWidth=1;c.beginPath();c.moveTo(20,H-18);c.lineTo(20+px,H-18);c.stroke();[20,20+px].forEach(function(x){c.beginPath();c.moveTo(x,H-24);c.lineTo(x,H-12);c.stroke()});c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('one wavelength',24+px,H-14);
  var f=QC/(nm*1e-9);st.c.textContent=qBand(nm);st.f.innerHTML=qSci(f)+' Hz';st.e.innerHTML=par.energy?+(1240/nm).toFixed(2)+' eV':qSci(f)}
 anim(cv,function(dt){t+=dt*4;draw()});draw();
 if(par.target)return {check:function(){var nm=s.get();return Math.abs(nm-par.target[0])<=(par.target[2]||6)?{ok:true,msg:'Spot on: '+nm+' nm.'}:{ok:false,msg:'Not yet. Remember f = c ÷ λ: a '+(nm>par.target[0]?'shorter':'longer')+' wavelength is what you need.'}}}};

/* the photoelectric effect */
WIDGETS.qPhoto=function(box,par){par=par||{};var MET={cs:['Caesium',2.1],na:['Sodium',2.3],zn:['Zinc',4.3]},met=par.metal||'na',cv=canvas(box,230),ph=[],els=[],acc=0,cnt=0,cntT=0,rate=0,hits={};
 qSeg(box,'Metal',[['cs','Caesium'],['na','Sodium'],['zn','Zinc']],met,function(v){met=v;els=[];upd()});
 var sw=slider(box,'Wavelength',150,700,1,par.lam||550,function(v){return v+' nm'},upd),sb=slider(box,'Brightness',0,100,1,60,function(v){return v+'%'},upd),st=stats(box,[['e','Each photon'],['w','Work function'],['k','Electron energy'],['n','Electrons / s']]);
 if(par.goal)qChal(box,par.goal[1]);
 function E(){return 1240/sw.get()}function upd(){var e=E(),w=MET[met][1];st.e.textContent=e.toFixed(2)+' eV';st.w.textContent=w+' eV';st.k.textContent=e>w?'up to '+(e-w).toFixed(2)+' eV':'none';hits[met+':'+(e>w?1:0)]=1}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,px=W*0.7;c.fillStyle=cssv('--soft2');c.fillRect(px,30,14,H-60);c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText(MET[met][0]+' plate',px-20,22);
  c.fillStyle=qRGB(sw.get(),0.18);c.beginPath();c.moveTo(30,H/2-18);c.lineTo(px,30);c.lineTo(px,H-30);c.lineTo(30,H/2+18);c.fill();c.fillStyle=cssv('--text');c.beginPath();c.arc(24,H/2,14,0,7);c.fill();c.fillStyle=cssv('--muted');c.fillText('lamp',8,H/2+32);
  ph.forEach(function(p){c.fillStyle=qRGB(sw.get());c.beginPath();c.arc(p.x,p.y,3.2,0,7);c.fill()});els.forEach(function(p){c.fillStyle='#4aa3ff';c.beginPath();c.arc(p.x,p.y,4,0,7);c.fill();c.fillStyle='#fff';c.font='bold 8px system-ui';c.fillText('−',p.x-2.5,p.y+3)});
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('electrons out →',px+22,H/2-8)}
 anim(cv,function(dt){var W=cv.clientWidth||600,H=+cv.dataset.h||230,px=W*0.7,e=E(),w=MET[met][1];acc+=dt*sb.get()*0.5;while(acc>=1){acc-=1;var y=H/2+(Math.random()-0.5)*30;ph.push({x:34,y:y,vy:((30+Math.random()*(H-60))-y)})}
  ph=ph.filter(function(p){p.x+=dt*260;p.y+=p.vy*dt*260/(px-34);if(p.x>=px){if(e>w&&Math.random()<0.6){var ke=(e-w)*Math.random();els.push({x:px+16,y:p.y,vx:40+120*Math.sqrt(ke),vy:(Math.random()-0.5)*40});cnt++}return false}return true});
  els=els.filter(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;return p.x<W+10});cntT+=dt;if(cntT>=1){rate=cnt/cntT;cnt=0;cntT=0;st.n.textContent=Math.round(rate)}draw()});
 upd();draw();
 if(par.goal)return {check:function(){var e=E(),w=MET[met][1],nm=sw.get(),g=par.goal[0];
  if(g==='threshold'){var th=Math.round(1240/MET.zn[1]);if(met!=='zn')return {ok:false,msg:'Switch the metal to zinc first.'};if(e<=w)return {ok:false,msg:'No electrons are coming out at all. Try a shorter wavelength.'};return nm>=th-12?{ok:true,msg:'Yes: about '+th+' nm is zinc\'s limit. Any longer and each photon has less than 4.3 eV, so nothing comes out, however bright the lamp.'}:{ok:false,msg:'Electrons are coming out, but you can go to a longer wavelength and still get some. Find the edge.'}}
  if(g==='bright'){if(e>w)return {ok:false,msg:'Electrons are coming out here. Find a wavelength where none come out, then turn the brightness right up.'};return sb.get()>=90?{ok:true,msg:'Even at full brightness: no electrons. More photons doesn\'t help if each one is too weak.'}:{ok:false,msg:'Turn the brightness right up and watch.'}}
  return {ok:true}}}};

/* the double slit with waves */
WIDGETS.qSlit=function(box,par){par=par||{};var cv=canvas(box,250),t=0,sl=slider(box,'Wavelength',400,700,1,560,function(v){return v+' nm'},function(){}),sd=slider(box,'Gap between slits',0.2,1.0,0.01,0.5,function(v){return v.toFixed(2)+' mm'},function(){}),st=stats(box,[['w','Fringe spacing'],['n','Bright fringes on screen']]);
 if(par.target)qChal(box,par.target[1]);
 function I(y,lam,d){var L=1,a=d*0.18;var ph=Math.PI*d*1e-3*y/(lam*1e-9*L),bt=Math.PI*a*1e-3*y/(lam*1e-9*L);var sinc=bt===0?1:Math.sin(bt)/bt;return Math.pow(Math.cos(ph),2)*sinc*sinc}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,lam=sl.get(),d=sd.get(),sx=W*0.28,scx=W*0.72,col=qRGB(lam),ys=H/2,gap=10+d*40;
  /* wavefronts from the source and the two slits */
  var k=2*Math.PI/(10+lam/40);c.lineWidth=1.4;for(var r=((t*30)%(2*Math.PI/k));r<sx;r+=2*Math.PI/k){c.strokeStyle=qRGB(lam,0.5);c.beginPath();c.moveTo(r,0);c.lineTo(r,H);c.stroke()}
  [ys-gap/2,ys+gap/2].forEach(function(yy){for(var r=((t*30)%(2*Math.PI/k));r<scx-sx;r+=2*Math.PI/k){c.strokeStyle=qRGB(lam,0.35*(1-r/(scx-sx)));c.beginPath();c.arc(sx,yy,r,-Math.PI/2,Math.PI/2);c.stroke()}});
  c.fillStyle=cssv('--text');c.fillRect(sx-3,0,6,ys-gap/2-3);c.fillRect(sx-3,ys-gap/2+3,6,gap-6);c.fillRect(sx-3,ys+gap/2+3,6,H-(ys+gap/2+3));
  /* the screen */
  var ymax=0.012;for(var py=0;py<H;py++){var y=(py-ys)/H*2*ymax,v=I(y,lam,d);c.fillStyle=qRGB(lam,v);c.fillRect(scx,py,18,1)}c.strokeStyle=cssv('--muted');c.strokeRect(scx,0,18,H);
  c.strokeStyle=col;c.lineWidth=2;c.beginPath();for(py=0;py<H;py++){var v2=I((py-ys)/H*2*ymax,lam,d),x=scx+24+v2*(W-scx-30);if(py===0)c.moveTo(x,py);else c.lineTo(x,py)}c.stroke();
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('two slits',sx-26,14);c.fillText('screen',scx-6,H-6);
  var w=lam*1e-9*1/(d*1e-3);st.w.textContent=(w*1e3).toFixed(2)+' mm';st.n.textContent=Math.floor(2*ymax/w)+1}
 anim(cv,function(dt){t+=dt*3;draw()});draw();
 if(par.target)return {check:function(){var w=sl.get()*1e-9/(sd.get()*1e-3)*1e3;return w>=par.target[0]?{ok:true,msg:'Fringe spacing '+w.toFixed(2)+' mm. Longer wavelength and a smaller gap both spread the pattern out.'}:{ok:false,msg:'Spacing is '+w.toFixed(2)+' mm. Which two changes make the fringes spread further apart?'}}}};

/* one particle at a time */
WIDGETS.qDots=function(box,par){par=par||{};var cv=canvas(box,260),hits=[],det=false,auto=false,used=false,fired0=0,hist=new Array(80).fill(0),histD=new Array(80).fill(0);
 var r=row(box),b1=btn(r,'Fire 1',function(){fire(1)}),b2=btn(r,'Fire 100',function(){fire(100)}),b3=btn(r,'▶ Auto',function(){auto=!auto;b3.textContent=auto?'⏸ Stop':'▶ Auto'}),b4=btn(r,'Clear',function(){hits=[];hist.fill(0);draw()});
 var r2=row(box),db=btn(r2,'👁 Detector at the slits: off',function(){det=!det;used=true;hits=[];hist.fill(0);db.textContent='👁 Detector at the slits: '+(det?'ON':'off');db.classList.toggle('on',det);draw()}),st=stats(box,[['n','Electrons fired'],['m','Pattern']]);
 if(par.goal)qChal(box,'Fire at least 300 electrons with the detector off. Then switch the detector on and fire 300 more. What happens to the stripes?');
 function P(y){/* y in [-1,1] */var env=Math.exp(-y*y*3.2);if(det){return 0.5*(Math.exp(-Math.pow(y-0.18,2)*14)+Math.exp(-Math.pow(y+0.18,2)*14))}return env*Math.pow(Math.cos(y*9.5),2)}
 function sample(){for(var g=0;g<1000;g++){var y=Math.random()*2-1;if(Math.random()<P(y))return y}return 0}
 function fire(n){for(var i=0;i<n;i++){var y=sample();hits.push([Math.random(),y]);var k=Math.min(79,Math.floor((y+1)/2*80));hist[k]++}if(hits.length>4000)hits.splice(0,hits.length-4000);if(det)fired0=Math.max(fired0,0);draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,sx=W*0.22,scx=W*0.5,sw=W*0.2;c.fillStyle=cssv('--text');c.fillRect(sx-3,0,6,H/2-22);c.fillRect(sx-3,H/2-12,6,24);c.fillRect(sx-3,H/2+22,6,H/2-22);
  c.fillStyle='#4aa3ff';c.beginPath();c.arc(20,H/2,9,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('electron gun',4,H/2+26);
  if(det){c.fillStyle='#e8742a';c.beginPath();c.arc(sx,H/2-17,6,0,7);c.arc(sx,H/2+17,6,0,7);c.fill();c.fillText('detector',sx+8,H/2-26)}
  c.fillStyle=cssv('--panel');c.fillRect(scx,0,sw,H);c.strokeStyle=cssv('--line');c.strokeRect(scx,0,sw,H);
  c.fillStyle='rgba(74,163,255,.85)';hits.forEach(function(h){var x=scx+3+h[0]*(sw-6),y=H/2+h[1]*H/2;c.fillRect(x,y,2.2,2.2)});
  var mx=Math.max.apply(null,hist)||1;c.strokeStyle='#4aa3ff';c.lineWidth=2;c.beginPath();hist.forEach(function(v,i){var y=(i+0.5)/80*H,x=scx+sw+8+v/mx*(W-scx-sw-14);if(i===0)c.moveTo(x,y);else c.lineTo(x,y)});c.stroke();c.fillStyle=cssv('--muted');c.fillText('screen',scx+4,H-6);c.fillText('count',scx+sw+10,12);
  st.n.textContent=hits.length;st.m.textContent=hits.length<40?'too few yet':det?'two humps (no stripes)':'stripes (interference)';if(!det&&hits.length>=300)fired0=1}
 var acc=0;anim(cv,function(dt){if(auto){acc+=dt*40;var n=Math.floor(acc);if(n){acc-=n;fire(n)}}});draw();
 if(par.goal)return {check:function(){if(!fired0)return {ok:false,msg:'First fire at least 300 electrons with the detector off.'};if(!det)return {ok:false,msg:'Now switch the detector on and fire more.'};if(hits.length<300)return {ok:false,msg:'Fire at least 300 with the detector on.'};return {ok:true,msg:'The stripes vanish. Finding out which slit each electron goes through destroys the interference.'}}}};

/* de Broglie wavelength */
WIDGETS.qDeBroglie=function(box,par){par=par||{};var OB={e:['Electron',QME,[1e4,1e8],2e6],n:['Neutron',QMP,[100,2e7],2200],a:['Alpha particle',6.64e-27,[1e4,2e7],1.5e7],b:['Tennis ball',0.058,[1,70],50],y:['You',60,[0.5,12],1.5]},ob=par.obj||'e';
 var cv=canvas(box,150);qSeg(box,'Object',Object.keys(OB).map(function(k){return [k,OB[k][0]]}),ob,function(v){ob=v;var o=OB[v];s.input.min=Math.log10(o[2][0]);s.input.max=Math.log10(o[2][1]);s.set(Math.log10(o[3]))});
 var s=slider(box,'Speed',Math.log10(OB[ob][2][0]),Math.log10(OB[ob][2][1]),0.01,Math.log10(OB[ob][3]),function(v){var x=Math.pow(10,v);return x>=1000?qSci(x)+' m/s':(+x.toPrecision(3))+' m/s'},function(){draw()}),st=stats(box,[['p','Momentum'],['l','Wavelength']]);
 if(par.goal)qChal(box,par.goal[1]);
 var REF=[[1e-15,'nucleus'],[1e-10,'atom'],[1e-7,'virus'],[1e-4,'hair'],[1,'door']];
 function lam(){return QH/(OB[ob][1]*Math.pow(10,s.get()))}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,l=lam(),lo=-36,hi=1,X=function(v){return 20+(Math.log10(v)-lo)/(hi-lo)*(W-40)};c.strokeStyle=cssv('--line');c.lineWidth=2;c.beginPath();c.moveTo(20,H*0.6);c.lineTo(W-20,H*0.6);c.stroke();c.fillStyle=cssv('--muted');c.font='11px system-ui';
  REF.forEach(function(r){var x=X(r[0]);c.fillRect(x-1,H*0.6-6,2,12);c.fillText(r[1],x-14,H*0.6+22)});for(var e=lo;e<=hi;e+=5){c.fillText('10',X(Math.pow(10,e))-6,H-8);c.font='8px system-ui';c.fillText(String(e),X(Math.pow(10,e))+6,H-14);c.font='11px system-ui'}
  var x=X(l);c.fillStyle=cssv('--accent');c.beginPath();c.moveTo(x,H*0.6-8);c.lineTo(x-8,H*0.6-22);c.lineTo(x+8,H*0.6-22);c.fill();c.fillText('λ',x-3,H*0.6-28);
  st.p.innerHTML=qSci(OB[ob][1]*Math.pow(10,s.get()))+' kg m/s';st.l.innerHTML=qLen(l)}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var l=lam();if(ob!==par.goal[0])return {ok:false,msg:'Choose the '+OB[par.goal[0]][0].toLowerCase()+' first.'};return l>=par.goal[2]&&l<=par.goal[3]?{ok:true,msg:'λ = '+qLen(l)+'. '+(par.goal[4]||'')}:{ok:false,msg:'λ is '+qLen(l)+'. '+(l>par.goal[3]?'Speed it up: more momentum means a shorter wavelength.':'Slow it down: less momentum means a longer wavelength.')}}}};

/* hydrogen energy ladder */
WIDGETS.qLadder=function(box,par){par=par||{};var cv=canvas(box,320),n=1,log=[],flash=null,seen={};var st=stats(box,[['n','Electron in level'],['e','Its energy'],['p','Last photon']]);
 el('p','small','Tap a level to move the electron there. Going up needs a photon in; coming down gives a photon out.',box);
 if(par.goal)qChal(box,par.goal==='balmer'?'Find all four colours of visible light hydrogen gives out. (They all end on level 2.)':par.goal==='red'?'Make the atom give out red light.':'Ionise the atom: free the electron completely.');
 var LPOS=[1,0,0.47,0.64,0.76,0.85,0.92];function En(k){return -13.6/(k*k)}function Y(E,H){/* schematic heights so the top levels don't overlap; the eV labels stay exact */var top=16,bot=H-62;if(E>=0)return top;var n=Math.round(Math.sqrt(-13.6/E));return bot-(bot-top)*(LPOS[Math.min(6,n)]||0)}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,lx=50,rx=W-90;c.font='12px system-ui';for(var k=1;k<=6;k++){var y=Y(En(k),H);c.strokeStyle=k===n?cssv('--accent'):cssv('--line');c.lineWidth=k===n?3:2;c.beginPath();c.moveTo(lx,y);c.lineTo(rx,y);c.stroke();c.fillStyle=cssv('--muted');c.fillText('n = '+k,8,y+4);c.fillText(En(k).toFixed(2)+' eV',rx+6,y+4)}
  var y0=Y(0,H);c.setLineDash([4,4]);c.strokeStyle=cssv('--muted');c.beginPath();c.moveTo(lx,y0);c.lineTo(rx,y0);c.stroke();c.setLineDash([]);c.fillText('0 eV: free',rx+6,y0+4);
  if(n>0){c.fillStyle='#4aa3ff';c.beginPath();c.arc((lx+rx)/2,Y(En(n),H),8,0,7);c.fill()}else{c.fillStyle='#4aa3ff';c.beginPath();c.arc((lx+rx)/2,y0-14,8,0,7);c.fill()}
  if(flash){c.strokeStyle=qRGB(flash.nm);c.lineWidth=3;c.beginPath();for(var x=0;x<80;x++){var yy=flash.y+6*Math.sin(x/4-flash.t*10);if(x===0)c.moveTo(flash.x+x*flash.dir,yy);else c.lineTo(flash.x+x*flash.dir,yy)}c.stroke()}
  /* spectrum strip along the bottom: 380 nm (violet) to 750 nm (red) */
  var sy=H-36,sx=10,sw2=W-20;c.fillStyle='#000';c.fillRect(sx,sy,sw2,16);log.forEach(function(L){if(L.nm<380||L.nm>750)return;var xx=sx+(L.nm-380)/370*sw2;c.fillStyle=qRGB(L.nm);c.fillRect(xx-1.5,sy,3,16)});c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('visible lines given out: 380 nm',sx,H-6);c.fillText('750 nm',W-52,H-6)}
 function go(k){if(k===n)return;var H=+cv.dataset.h||300,e,up;
  if(n>0&&k>0){up=k>n;e=Math.abs(En(k)-En(n))}else if(k===0){up=true;e=-En(n)}else{up=false;e=-En(k)}
  var nm=1240/e;if(!up){log.push({from:n,to:k,nm:nm});seen[n+'>'+k]=1}flash={nm:nm,y:Y(En(Math.max(k,1)),H),x:up?0:(cv.clientWidth||600)-170,dir:1,t:0};
  st.p.innerHTML=(up?'absorbed ':'given out ')+e.toFixed(2)+' eV · '+Math.round(nm)+' nm ('+qBand(nm)+')';n=k;st.n.textContent=n||'free (ionised)';st.e.textContent=n?En(n).toFixed(2)+' eV':'0 eV';if(k===0)seen.ion=1;draw()}
 cv.addEventListener('click',function(e){var r=cv.getBoundingClientRect(),y=e.clientY-r.top,H=r.height,best=0,bd=1e9;for(var k=1;k<=6;k++){var d=Math.abs(Y(En(k),H)-y);if(d<bd){bd=d;best=k}}if(Math.abs(Y(0,H)-y)<bd&&Math.abs(Y(0,H)-y)<14)best=0;go(best)});
 var r=row(box);btn(r,'Back to the ground state',function(){go(1)});
 anim(cv,function(dt){if(flash){flash.t+=dt;if(flash.t>1.2)flash=null;draw()}});st.n.textContent=1;st.e.textContent='−13.60 eV';st.p.textContent='none yet';draw();
 if(par.goal)return {check:function(){if(par.goal==='balmer'){var need=['3>2','4>2','5>2','6>2'],got=need.filter(function(k){return seen[k]});return got.length===4?{ok:true,msg:'All four: 656 nm red, 486 nm cyan, 434 nm blue and 410 nm violet. That\'s hydrogen\'s fingerprint.'}:{ok:false,msg:'Found '+got.length+' of 4. Each visible line is a drop that ends on level 2.'}}
  if(par.goal==='red')return seen['3>2']?{ok:true,msg:'3 → 2 gives 1.89 eV: 656 nm red light.'}:{ok:false,msg:'Red light is the smallest drop that ends on level 2.'};return seen.ion?{ok:true,msg:'It took 13.6 eV from the ground state: hydrogen\'s ionisation energy.'}:{ok:false,msg:'Tap above the top level, on the dashed 0 eV line.'}}}};

/* electrons as standing waves on a ring */
WIDGETS.qRing=function(box,par){var cv=canvas(box,260),t=0,ok={},s=slider(box,'Wavelengths round the orbit',1,7,0.05,2.5,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['f','Fits?']]);
 qChal(box,'Find three different numbers of wavelengths that fit perfectly round the orbit.');
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2,R=Math.min(W,H)*0.32,n=s.get(),fit=Math.abs(n-Math.round(n))<0.03;c.strokeStyle=cssv('--line');c.lineWidth=1;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.fillStyle=cssv('--text');c.beginPath();c.arc(cx,cy,6,0,7);c.fill();
  c.lineWidth=3;c.strokeStyle=fit?cssv('--good-line'):'#4aa3ff';c.beginPath();for(var i=0;i<=360;i++){var th=i/360*2*Math.PI,amp=R*0.16*Math.cos(t),r=R+amp*Math.sin(n*th);var x=cx+r*Math.cos(th),y=cy+r*Math.sin(th);if(i===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
  if(!fit){var th2=2*Math.PI,r2=R+R*0.16*Math.cos(t)*Math.sin(n*th2);c.strokeStyle='#e8742a';c.lineWidth=3;c.beginPath();c.moveTo(cx+R,cy);c.lineTo(cx+r2,cy);c.stroke();c.fillStyle='#e8742a';c.font='12px system-ui';c.fillText('doesn\'t join up',cx+R+8,cy+4)}
  st.f.textContent=fit?'Yes: '+Math.round(n)+' whole wavelengths. Allowed orbit.':'No: the wave meets itself out of step and cancels out.';if(fit)ok[Math.round(n)]=1}
 anim(cv,function(dt){t+=dt*3;draw()});draw();
 return {check:function(){var k=Object.keys(ok).length;return k>=3?{ok:true,msg:'Only whole numbers fit: n = 1, 2, 3... That\'s why only certain orbits, and certain energies, are allowed.'}:{ok:false,msg:'Found '+k+' so far. Try sliding to whole numbers.'}}}};

/* measurement: a cloud of probability becomes one dot */
WIDGETS.qMeasure=function(box,par){par=par||{};var ST={one:['One bump',function(x){return Math.pow(Math.sin(Math.PI*x),2)}],two:['Two bumps',function(x){return Math.pow(Math.sin(2*Math.PI*x),2)}],lop:['Lopsided',function(x){return Math.pow(Math.sin(Math.PI*x)+0.8*Math.sin(2*Math.PI*x),2)}]},sk=par.state||'one',cv=canvas(box,230),hist=new Array(50).fill(0),n=0,last=null,fl=0;
 qSeg(box,'State',Object.keys(ST).map(function(k){return [k,ST[k][0]]}),sk,function(v){sk=v;hist.fill(0);n=0;last=null;draw()});
 var r=row(box);btn(r,'Measure once',function(){meas(1)});btn(r,'Measure 100 times',function(){meas(100)});var st=stats(box,[['n','Measurements'],['l','Last result']]);
 if(par.goal)qChal(box,'Measure at least 200 times. Compare the bars with the curve.');
 function sample(){var f=ST[sk][1];for(var g=0;g<2000;g++){var x=Math.random();if(Math.random()*4<f(x))return x}return 0.5}
 function meas(k){for(var i=0;i<k;i++){var x=sample();hist[Math.min(49,Math.floor(x*50))]++;last=x;n++}fl=1;draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,f=ST[sk][1],mx=0,i;for(i=0;i<=200;i++)mx=Math.max(mx,f(i/200));var hm=Math.max.apply(null,hist)||1,sc=n?Math.max(hm/(n/50),mx):mx;
  c.fillStyle=cssv('--accent-bg');for(i=0;i<50;i++){var h=n?(hist[i]/(n/50))/sc*(H-50):0;c.fillRect(20+i/50*(W-40),H-30-h,(W-40)/50-1,h)}
  c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();for(i=0;i<=200;i++){var x=20+i/200*(W-40),y=H-30-f(i/200)/sc*(H-50);if(i===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
  c.strokeStyle=cssv('--text');c.lineWidth=1;c.beginPath();c.moveTo(20,H-30);c.lineTo(W-20,H-30);c.stroke();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|ψ|²: where it\'s likely to be found',24,14);c.fillText('position',W/2-24,H-10);
  if(last!=null&&fl>0){c.fillStyle='rgba(232,116,42,'+fl+')';c.beginPath();c.arc(20+last*(W-40),H-30,9,0,7);c.fill()}st.n.textContent=n;st.l.textContent=last==null?'–':'found at '+(last*100).toFixed(0)+'% across'}
 anim(cv,function(dt){if(fl>0){fl=Math.max(0,fl-dt*0.8);draw()}});draw();
 if(par.goal)return {check:function(){return n>=200?{ok:true,msg:'Each measurement gives one definite place, at random. But the pattern of many measurements follows |ψ|² exactly.'}:{ok:false,msg:n+' so far. Keep measuring.'}}}};

/* the uncertainty principle: a wave packet */
WIDGETS.qPacket=function(box,par){par=par||{};var cv=canvas(box,170),cv2=canvas(box,110),s=slider(box,'Position spread Δx',0.3,3,0.01,1,function(v){return v.toFixed(2)},function(){draw()}),st=stats(box,[['x','Δx'],['p','Δp'],['xp','Δx × Δp']]);
 if(par.goal)qChal(box,'Pin the momentum down so that Δp is less than 0.2. What happens to the position?');
 function draw(){var sx=s.get(),sp=0.5/sx,k0=6,g=prep(cv),c=g.c,W=g.W,H=g.H,i;c.strokeStyle=cssv('--muted');c.lineWidth=1;c.beginPath();c.moveTo(10,H/2);c.lineTo(W-10,H/2);c.stroke();
  c.strokeStyle='#4aa3ff';c.lineWidth=2;c.beginPath();for(i=0;i<=600;i++){var x=-8+16*i/600,y=Math.exp(-x*x/(4*sx*sx))*Math.cos(k0*x);var px=10+i/600*(W-20),py=H/2-y*H*0.4;if(i===0)c.moveTo(px,py);else c.lineTo(px,py)}c.stroke();
  c.strokeStyle=cssv('--accent');c.lineWidth=2;c.beginPath();for(i=0;i<=600;i++){x=-8+16*i/600;y=Math.exp(-x*x/(2*sx*sx));px=10+i/600*(W-20);py=H/2-y*H*0.4;if(i===0)c.moveTo(px,py);else c.lineTo(px,py)}c.stroke();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('position: the wave (blue) and |ψ|² (purple)',14,14);
  var g2=prep(cv2),c2=g2.c,W2=g2.W,H2=g2.H;c2.strokeStyle=cssv('--coral');c2.lineWidth=2.5;c2.beginPath();for(i=0;i<=400;i++){var p=-3+6*i/400,yy=Math.exp(-p*p/(2*sp*sp));var qx=10+i/400*(W2-20),qy=H2-18-yy*(H2-34);if(i===0)c2.moveTo(qx,qy);else c2.lineTo(qx,qy)}c2.stroke();c2.fillStyle=cssv('--muted');c2.font='12px system-ui';c2.fillText('momentum: how spread out the possible values are',14,14);
  st.x.textContent=sx.toFixed(2);st.p.textContent=sp.toFixed(2);st.xp.textContent='0.50 (= ħ/2, the smallest allowed)'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var sp=0.5/s.get();return sp<0.2?{ok:true,msg:'Δp is small, but now the wave is spread over a huge range of positions. You can\'t have both.'}:{ok:false,msg:'Δp is '+sp.toFixed(2)+'. To pin momentum down, the wave needs many wavelengths: spread it out.'}}}};

/* probability = area under |psi|^2 */
WIDGETS.qArea=function(box,par){par=par||{};var nq=par.n||1,cv=canvas(box,220),sa=slider(box,'From',0,1,0.01,0.3,function(v){return (v*100).toFixed(0)+'% across'},function(){draw()}),sb=slider(box,'To',0,1,0.01,0.7,function(v){return (v*100).toFixed(0)+'% across'},function(){draw()}),st=stats(box,[['p','Chance of finding it there'],['w','Width of region']]);
 if(par.goal)qChal(box,'Find a region <b>narrower than half the box</b> that still has at least a 50% chance of finding the particle.');
 function f(x){return 2*Math.pow(Math.sin(nq*Math.PI*x),2)}function area(a,b){if(b<a){var t=a;a=b;b=t}var s=0,N=400;for(var i=0;i<N;i++){var x=a+(b-a)*(i+0.5)/N;s+=f(x)}return s*(b-a)/N}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,a=Math.min(sa.get(),sb.get()),b=Math.max(sa.get(),sb.get()),i,X=function(x){return 20+x*(W-40)},Y=function(v){return H-30-v/2.1*(H-50)};
  c.fillStyle=cssv('--accent-bg');c.beginPath();c.moveTo(X(a),Y(0));for(i=0;i<=100;i++){var x=a+(b-a)*i/100;c.lineTo(X(x),Y(f(x)))}c.lineTo(X(b),Y(0));c.fill();
  c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();for(i=0;i<=300;i++){x=i/300;if(i===0)c.moveTo(X(x),Y(f(x)));else c.lineTo(X(x),Y(f(x)))}c.stroke();c.fillStyle=cssv('--text');c.fillRect(X(0)-4,20,4,H-50);c.fillRect(X(1),20,4,H-50);
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|ψ|² inside a box (n = '+nq+')',24,14);var p=area(a,b);st.p.textContent=(p*100).toFixed(1)+'%';st.w.textContent=((b-a)*100).toFixed(0)+'% of the box'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var a=Math.min(sa.get(),sb.get()),b=Math.max(sa.get(),sb.get()),p=area(a,b);return p>=0.48&&b-a<0.5?{ok:true,msg:(p*100).toFixed(0)+'% in just '+((b-a)*100).toFixed(0)+'% of the box. The particle is most likely in the middle, where |ψ|² is tallest.'}:p<0.48?{ok:false,msg:'Only '+(p*100).toFixed(0)+'%. Where is |ψ|² tallest?'}:{ok:false,msg:'That\'s '+(p*100).toFixed(0)+'%, but the region is half the box or wider. Make it narrower.'}}}};

/* the shooting method: only some energies give a sensible wavefunction */
WIDGETS.qShoot=function(box,par){var cv=canvas(box,250),found={},s=slider(box,'Energy you try',0.2,4.2,0.002,1.0,function(v){return v.toFixed(3)},function(){draw()}),st=stats(box,[['t','At the far wall'],['f','Allowed energies found']]);
 qChal(box,'Slide the energy slowly. Find two energies where the wave settles down to zero at both ends, instead of shooting off.');
 function solve(E){var dx=0.01,x0=-5,N=1000,ps=[0,1e-4],xs=[x0,x0+dx];for(var i=1;i<N;i++){var x=x0+i*dx,V=x*x/2;var nxt=2*ps[i]-ps[i-1]+dx*dx*2*(V-E)*ps[i];ps.push(nxt);xs.push(x+dx)}return {x:xs,p:ps}}
 function draw(){var E=s.get(),r=solve(E),g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(x){return 20+(x+5)/10*(W-40)},Y0=H*0.62,mx=0,i;for(i=0;i<r.p.length;i++)if(r.x[i]<3)mx=Math.max(mx,Math.abs(r.p[i]));
  c.strokeStyle=cssv('--muted');c.lineWidth=1.5;c.beginPath();for(i=0;i<=100;i++){var x=-5+i/10,v=x*x/2;var y=Y0-v/5*(H*0.55);if(i===0)c.moveTo(X(x),y);else c.lineTo(X(x),y)}c.stroke();
  var ye=Y0-E/5*(H*0.55);c.setLineDash([5,4]);c.strokeStyle=cssv('--accent');c.beginPath();c.moveTo(20,ye);c.lineTo(W-20,ye);c.stroke();c.setLineDash([]);c.fillStyle=cssv('--accent');c.font='12px system-ui';c.fillText('E = '+E.toFixed(3),W-90,ye-6);
  c.strokeStyle='#4aa3ff';c.lineWidth=2.5;c.beginPath();for(i=0;i<r.p.length;i+=2){var yy=ye-r.p[i]/mx*H*0.25;yy=Math.max(-20,Math.min(H+20,yy));if(i===0)c.moveTo(X(r.x[i]),yy);else c.lineTo(X(r.x[i]),yy)}c.stroke();
  c.fillStyle=cssv('--muted');c.fillText('potential (a valley)',24,14);var tail=r.p[r.p.length-1]/mx,good=Math.abs(tail)<1.5;
  st.t.textContent=good?'settles to zero: allowed!':tail>0?'shoots up ↑: not allowed':'shoots down ↓: not allowed';if(good){var lv=Math.round(E-0.5);if(Math.abs(E-(lv+0.5))<0.02)found[lv]=1}st.f.textContent=Object.keys(found).map(function(k){return (+k+0.5).toFixed(1)}).join(', ')||'none yet'}
 onDraw(draw);draw();
 return {check:function(){var k=Object.keys(found).length;return k>=2?{ok:true,msg:'Allowed energies: 0.5, 1.5, 2.5, 3.5... Nobody put those numbers in. They come out of the equation, because only they give a wave that behaves at both ends. That\'s quantisation.'}:{ok:false,msg:k+' found. Move the slider in tiny steps and watch the end of the wave flip from up to down: the allowed energy is right where it flips.'}}}};

/* stationary states and superposition: probability that sloshes */
WIDGETS.qSlosh=function(box,par){par=par||{};var cv=canvas(box,220),t=0,s=slider(box,'Mix of level 2',0,1,0.01,0,function(v){return (v*v*100).toFixed(0)+'%'},function(){}),st=stats(box,[['m','What you see'],['x','Average position']]);
 if(par.goal)qChal(box,'Find the mix that makes the particle slosh from side to side the most.');
 function draw(){var c2=s.get(),c1=Math.sqrt(1-c2*c2),g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(x){return 20+x*(W-40)},i,avg=0,sum=0,dE=3*Math.PI*Math.PI/2*0.06;
  c.fillStyle=cssv('--text');c.fillRect(X(0)-4,16,4,H-40);c.fillRect(X(1),16,4,H-40);c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();
  for(i=0;i<=300;i++){var x=i/300,a=c1*Math.sin(Math.PI*x),b=c2*Math.sin(2*Math.PI*x),p=a*a+b*b+2*a*b*Math.cos(dE*t*60);avg+=x*p;sum+=p;var y=H-24-p/2.2*(H-50);if(i===0)c.moveTo(X(x),y);else c.lineTo(X(x),y)}c.stroke();avg/=sum;
  c.fillStyle='#e8742a';c.beginPath();c.arc(X(avg),H-24,6,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|ψ|² as time passes',24,12);
  st.m.textContent=c2<0.03||c1<0.03?'nothing moves: a stationary state':'sloshing: a superposition';st.x.textContent=(avg*100).toFixed(0)+'% across'}
 anim(cv,function(dt){t+=dt;draw()});draw();
 if(par.goal)return {check:function(){var c2=s.get();return Math.abs(c2-Math.SQRT1_2)<0.08?{ok:true,msg:'A 50/50 mix sloshes the most. The two levels beat against each other, at a frequency set by their energy difference.'}:{ok:false,msg:c2<0.03||c2>0.97?'One level on its own doesn\'t move at all. Mix them.':'It moves, but it can slosh further. Try a more even mix.'}}}};

/* the particle in a box */
WIDGETS.qBox=function(box,par){par=par||{};var cv=canvas(box,250),sq=false,sn=slider(box,'Energy level n',1,6,1,1,function(v){return v},function(){draw()}),sL=slider(box,'Box width',0.2,2,0.01,1,function(v){return v.toFixed(2)+' nm'},function(){draw()});
 var r=row(box),tb=btn(r,'Show |ψ|² instead of ψ',function(){sq=!sq;tb.textContent=sq?'Show ψ instead of |ψ|²':'Show |ψ|² instead of ψ';draw()}),st=stats(box,[['e','Energy'],['k','Nodes (zeros inside)'],['l','Wavelength']]);
 if(par.goal)qChal(box,par.goal[1]);
 function E(n,L){return 0.376*n*n/(L*L)}
 function draw(){var n=sn.get(),L=sL.get(),g=prep(cv),c=g.c,W=g.W,H=g.H,bw=(W*0.55)*L/2,x0=20,i;c.fillStyle=cssv('--text');c.fillRect(x0-4,10,4,H-30);c.fillRect(x0+bw,10,4,H-30);
  c.strokeStyle=sq?cssv('--accent'):'#4aa3ff';c.lineWidth=2.5;c.beginPath();for(i=0;i<=200;i++){var x=i/200,v=Math.sin(n*Math.PI*x);if(sq)v=v*v;var y=(sq?H-30:H/2)-v*(sq?H*0.6:H*0.32);if(i===0)c.moveTo(x0+x*bw,y);else c.lineTo(x0+x*bw,y)}c.stroke();
  c.strokeStyle=cssv('--muted');c.lineWidth=1;c.beginPath();c.moveTo(x0,sq?H-30:H/2);c.lineTo(x0+bw,sq?H-30:H/2);c.stroke();
  var lx=W*0.68,emax=E(6,0.2);c.font='12px system-ui';for(var k=1;k<=6;k++){var e=E(k,L),y2=H-20-Math.min(1,Math.log10(1+e)/Math.log10(1+emax))*(H-40);c.strokeStyle=k===n?cssv('--accent'):cssv('--line');c.lineWidth=k===n?3:1.5;c.beginPath();c.moveTo(lx,y2);c.lineTo(W-70,y2);c.stroke();c.fillStyle=cssv('--muted');if(k===n||k===1||k===6)c.fillText(e<10?e.toFixed(2)+' eV':e.toFixed(0)+' eV',W-66,y2+4)}
  c.fillStyle=cssv('--muted');c.fillText('energy levels',lx,12);st.e.textContent=E(n,L).toFixed(2)+' eV';st.k.textContent=n-1;st.l.textContent=(2*L/n).toFixed(2)+' nm'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var n=sn.get(),L=sL.get(),e=E(n,L),g=par.goal;if(g[0]==='e1'){if(n!==1)return {ok:false,msg:'Use the lowest level, n = 1.'};return Math.abs(e-g[2])<=g[2]*0.06?{ok:true,msg:'L = '+L.toFixed(2)+' nm gives '+e.toFixed(2)+' eV. Halve the box and the energy goes up four times.'}:{ok:false,msg:'E₁ is '+e.toFixed(2)+' eV. '+(e>g[2]?'Make the box wider.':'Make the box narrower.')}}
  if(g[0]==='nodes')return n-1===g[2]?{ok:true,msg:'Level '+n+' has '+(n-1)+' nodes: places the particle is never found.'}:{ok:false,msg:'That level has '+(n-1)+' nodes.'};return {ok:true}}}};

/* quantum dots: size sets the colour */
WIDGETS.qQdot=function(box,par){par=par||{};var cv=canvas(box,170),s=slider(box,'Dot size',2,8,0.05,4,function(v){return v.toFixed(1)+' nm'},function(){draw()}),st=stats(box,[['e','Energy gap'],['l','Glows at']]);
 if(par.goal)qChal(box,par.goal[1]);
 function lam(){var L=s.get(),E=1.74+3.73/(L*L);return 1240/E}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,L=s.get(),nm=lam(),r=8+L*7;var gr=c.createRadialGradient(W*0.3,H/2,1,W*0.3,H/2,r*2.2);gr.addColorStop(0,qRGB(nm,1));gr.addColorStop(0.45,qRGB(nm,0.55));gr.addColorStop(1,qRGB(nm,0));c.fillStyle=gr;c.beginPath();c.arc(W*0.3,H/2,r*2.2,0,7);c.fill();
  c.fillStyle=qRGB(nm);c.beginPath();c.arc(W*0.3,H/2,r,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('a crystal about '+L.toFixed(1)+' nm across (a few hundred atoms)',W*0.3-r,H-10);
  for(var i=0;i<6;i++){var LL=2+i*1.2,n2=1240/(1.74+3.73/(LL*LL)),x=W*0.62+i*((W*0.36)/6);c.fillStyle=qRGB(n2,0.9);c.fillRect(x,H/2-30,(W*0.36)/6-6,60);c.fillStyle=cssv('--muted');c.font='10px system-ui';c.fillText(LL.toFixed(1),x+2,H/2+44)}c.fillText('vials of dots, size in nm',W*0.62,H/2-38);
  st.e.textContent=(1240/nm).toFixed(2)+' eV';st.l.textContent=Math.round(nm)+' nm ('+qBand(nm)+')'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var nm=lam();return nm>=par.goal[0]&&nm<=par.goal[2]?{ok:true,msg:Math.round(nm)+' nm. Same material, different size, different colour: that\'s the particle in a box at work.'}:{ok:false,msg:Math.round(nm)+' nm. '+(nm<par.goal[0]?'Bigger dots glow redder.':'Smaller dots glow bluer.')}}}};

/* tunnelling through a barrier */
WIDGETS.qTunnel=function(box,par){par=par||{};var cv=canvas(box,240),t=0,m=QME,se=slider(box,'Particle energy',0.5,9.5,0.1,4,function(v){return v.toFixed(1)+' eV'},function(){draw()}),sv=slider(box,'Barrier height',1,12,0.1,6,function(v){return v.toFixed(1)+' eV'},function(){draw()}),sa=slider(box,'Barrier width',0.05,1.2,0.01,0.4,function(v){return v.toFixed(2)+' nm'},function(){draw()});
 qSeg(box,'Particle',[['e','Electron'],['p','Proton']],'e',function(v){m=v==='p'?QMP:QME;draw()});var st=stats(box,[['t','Gets through'],['r','Bounces back']]);
 if(par.goal)qChal(box,par.goal[1]);
 function T(){var E=se.get()*QE,V=sv.get()*QE,a=sa.get()*1e-9;if(Math.abs(E-V)<1e-22)E+=1e-22;if(E<V){var k=Math.sqrt(2*m*(V-E))/QHB,sh=Math.sinh(Math.min(k*a,350));return 1/(1+V*V*sh*sh/(4*E*(V-E)))}var k2=Math.sqrt(2*m*(E-V))/QHB,sn=Math.sin(k2*a);return 1/(1+V*V*sn*sn/(4*E*(E-V)))}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,E=se.get(),V=sv.get(),a=sa.get(),Tt=T(),bx=W*0.45,bw=Math.max(6,a/1.2*W*0.25),Y=function(e){return H-30-e/13*(H-50)},i;
  c.fillStyle=cssv('--soft2');c.fillRect(bx,Y(V),bw,H-30-Y(V));c.strokeStyle=cssv('--text');c.lineWidth=2;c.beginPath();c.moveTo(10,H-30);c.lineTo(bx,H-30);c.lineTo(bx,Y(V));c.lineTo(bx+bw,Y(V));c.lineTo(bx+bw,H-30);c.lineTo(W-10,H-30);c.stroke();
  var ye=Y(E);c.setLineDash([5,4]);c.strokeStyle=cssv('--accent');c.lineWidth=1;c.beginPath();c.moveTo(10,ye);c.lineTo(W-10,ye);c.stroke();c.setLineDash([]);
  var amp=22,A2=Math.sqrt(Tt),kk=0.12,dec=E<V?Math.log(Math.max(A2,1e-9))/bw:0;c.strokeStyle='#4aa3ff';c.lineWidth=2.2;c.beginPath();
  for(i=10;i<W-10;i++){var y,ph=kk*i-t*4;if(i<bx)y=ye-amp*Math.sin(ph);else if(i<bx+bw){var f=E<V?Math.exp(dec*(i-bx)):1+(A2-1)*(i-bx)/bw;y=ye-amp*f*Math.sin(ph)}else y=ye-amp*A2*Math.sin(ph);if(i===10)c.moveTo(i,y);else c.lineTo(i,y)}c.stroke();
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('barrier '+V.toFixed(1)+' eV',bx-10,Y(V)-6);c.fillText('particle energy',14,ye-10);
  var pc=Tt*100;st.t.textContent=pc>=1?pc.toFixed(1)+'%':pc>=1e-4?pc.toPrecision(2)+'%':'1 in '+qSci(1/Tt).replace(/<[^>]+>/g,'');st.r.textContent=((1-Tt)*100).toFixed(pc>99?2:1)+'%'}
 anim(cv,function(dt){t+=dt;draw()});draw();
 if(par.goal)return {check:function(){var Tt=T(),g=par.goal;if(g[0]==='range'){if(se.get()>=sv.get())return {ok:false,msg:'The particle\'s energy must be below the barrier: that\'s what makes it tunnelling.'};return Tt>=g[2]&&Tt<=g[3]?{ok:true,msg:'About '+(Tt*100).toPrecision(2)+'% get through a barrier they classically can\'t cross.'}:{ok:false,msg:(Tt*100).toPrecision(2)+'% get through. '+(Tt>g[3]?'Make it harder: wider or higher.':'Make it easier: narrower or lower.')}}
  if(g[0]==='proton'){return m===QMP&&se.get()<sv.get()?{ok:true,msg:'With the same barrier a proton (1836 times heavier) gets through '+(Tt<1e-6?'almost never':'far less often')+'. Heavier means much less tunnelling.'}:{ok:false,msg:'Switch to the proton, keeping its energy below the barrier.'}}return {ok:true}}}};

/* alpha decay: tunnelling sets the half-life */
WIDGETS.qGamow=function(box,par){par=par||{};var cv=canvas(box,230),s=slider(box,'Alpha particle energy',4,9,0.01,5,function(v){return v.toFixed(2)+' MeV'},function(){draw()}),st=stats(box,[['t','Half-life']]);
 if(par.goal)qChal(box,'Find the alpha energy that gives a half-life of about one day.');
 var A=158.17,B=-59.39,EX=[[4.27,'U-238',17.149],[7.69,'Po-214',-3.79],[8.95,'Po-212',-6.524],[5.59,'Am-241',10.13]];
 function lt(E){return A/Math.sqrt(E)+B}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(e){return 50+(e-4)/5*(W-70)},Y=function(l){return 12+(20-l)/28*(H-44)},i;c.strokeStyle=cssv('--line');c.lineWidth=1;c.font='11px system-ui';c.fillStyle=cssv('--muted');
  [[17.5,'billions of years'],[10,'thousands of years'],[4.94,'a day'],[0,'a second'],[-6,'a microsecond']].forEach(function(r){var y=Y(r[0]);c.beginPath();c.moveTo(50,y);c.lineTo(W-20,y);c.stroke();c.fillText(r[1],54,y-3)});
  c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();for(i=0;i<=100;i++){var e=4+i/20;if(i===0)c.moveTo(X(e),Y(lt(e)));else c.lineTo(X(e),Y(lt(e)))}c.stroke();
  EX.forEach(function(x){c.fillStyle=cssv('--coral');c.beginPath();c.arc(X(x[0]),Y(x[2]),4,0,7);c.fill();c.fillStyle=cssv('--text');c.fillText(x[1],X(x[0])+6,Y(x[2])+4)});
  var E=s.get();c.fillStyle='#4aa3ff';c.beginPath();c.arc(X(E),Y(lt(E)),7,0,7);c.fill();for(i=4;i<=9;i++){c.fillStyle=cssv('--muted');c.fillText(i+' MeV',X(i)-14,H-8)}st.t.textContent=qTime(Math.pow(10,lt(E)))}
 onDraw(draw);draw();el('p','small','Simplified curve for heavy nuclei like uranium. Real half-lives also depend on the nucleus, but the huge spread is real.',box);
 if(par.goal)return {check:function(){var l=lt(s.get());return Math.abs(l-4.94)<0.35?{ok:true,msg:'About 6 MeV. Compare: 4.3 MeV (U-238) is billions of years, 9 MeV is under a microsecond. A small change in energy changes the tunnelling chance enormously.'}:{ok:false,msg:'That\'s '+qTime(Math.pow(10,l))+'. '+(l>4.94?'More energy: a thinner barrier to tunnel through.':'Less energy.')}}}};

/* Stern-Gerlach: spin measurements in a row */
WIDGETS.qSG=function(box,par){par=par||{};var cv=canvas(box,220),nm=par.n||2,ax=[0,par.a2==null?90:par.a2,0],cnt=[],fired=0;
 qSeg(box,'Magnets',[[1,'1'],[2,'2'],[3,'3']],nm,function(v){nm=v;reset()});
 var s2=slider(box,'Magnet 2 angle',0,180,5,ax[1],function(v){return v+'°'+(v===0?' (Z)':v===90?' (X)':'')},function(v){ax[1]=v;reset()}),s3=slider(box,'Magnet 3 angle',0,180,5,0,function(v){return v+'°'+(v===0?' (Z)':v===90?' (X)':'')},function(v){ax[2]=v;reset()});
 var r=row(box);btn(r,'Send 100 atoms',function(){run(100)});btn(r,'Send 1',function(){run(1)});var st=stats(box,[['u','Last magnet: up'],['d','Last magnet: down'],['p','Predicted up']]);
 if(par.goal)qChal(box,'Set up Z → X → Z (magnet 2 at 90°, magnet 3 at 0°) and send atoms. Do any "down" atoms come out at the end, even though magnet 1 only let "up" through?');
 function reset(){cnt=[0,0];fired=0;draw()}
 function pUp(){var prev=0,p=1;/* only "up" from each magnet goes on to the next */for(var i=1;i<nm;i++){}return null}
 function run(k){for(var j=0;j<k;j++){var st0=Math.random()<0.5?0:180,ok=true;/* magnet 1: random up or down; only up continues if there's another magnet */var cur;var out1=Math.random()<0.5;if(nm===1){cnt[out1?0:1]++;continue}if(!out1)continue;cur=0;
   for(var i=1;i<nm;i++){var d=(ax[i]-cur)*Math.PI/180,up=Math.random()<Math.pow(Math.cos(d/2),2);if(i===nm-1){cnt[up?0:1]++}else{if(!up){ok=false;break}cur=ax[i]}}}fired+=k;draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,seg=(W-120)/nm,i;c.font='12px system-ui';c.fillStyle='#4aa3ff';c.beginPath();c.arc(16,H/2,8,0,7);c.fill();c.strokeStyle='#4aa3ff';c.lineWidth=2;c.beginPath();c.moveTo(24,H/2);c.lineTo(40,H/2);c.stroke();
  for(i=0;i<nm;i++){var x=40+i*seg;c.fillStyle=cssv('--soft2');c.fillRect(x,H/2-26,seg*0.45,52);c.fillStyle=cssv('--text');c.fillText(i===0?'Z':ax[i]+'°',x+6,H/2+4);c.fillText('magnet '+(i+1),x,H/2-32);
   var ex=x+seg*0.45;c.strokeStyle='#4aa3ff';c.beginPath();c.moveTo(ex,H/2);c.lineTo(ex+seg*0.3,H/2-30);c.stroke();c.strokeStyle=i<nm-1?cssv('--muted'):'#4aa3ff';c.beginPath();c.moveTo(ex,H/2);c.lineTo(ex+seg*0.3,H/2+30);c.stroke();
   if(i<nm-1){c.fillStyle=cssv('--text');c.fillRect(ex+seg*0.3,H/2+24,8,14);c.fillStyle=cssv('--muted');c.fillText('blocked',ex+seg*0.3-10,H/2+52);c.strokeStyle='#4aa3ff';c.beginPath();c.moveTo(ex+seg*0.3,H/2-30);c.lineTo(ex+seg*0.55,H/2);c.stroke()}
   else{c.fillStyle=cssv('--text');c.fillText('up: '+cnt[0],ex+seg*0.3+4,H/2-30);c.fillText('down: '+cnt[1],ex+seg*0.3+4,H/2+34)}}
  var tot=cnt[0]+cnt[1];st.u.textContent=cnt[0]+(tot?' ('+Math.round(cnt[0]/tot*100)+'%)':'');st.d.textContent=cnt[1]+(tot?' ('+Math.round(cnt[1]/tot*100)+'%)':'');
  var pu=nm===1?0.5:Math.pow(Math.cos((ax[nm-1]-(nm===3?ax[1]:0))*Math.PI/360),2);st.p.textContent=Math.round(pu*100)+'%';s3.row.style.display=nm===3?'':'none';s2.row.style.display=nm>=2?'':'none'}
 reset();
 if(par.goal)return {check:function(){if(nm!==3||ax[1]!==90||ax[2]!==0)return {ok:false,msg:'Set 3 magnets, magnet 2 at 90° and magnet 3 at 0°.'};if(cnt[0]+cnt[1]<40)return {ok:false,msg:'Send more atoms.'};return cnt[1]>0?{ok:true,msg:'Half come out "down", even though they were all "up" after magnet 1. Measuring X wiped out the Z information: measurement changes the state.'}:{ok:false,msg:'Send more atoms and look at the down count.'}}}};

/* a qubit */
WIDGETS.qQubit=function(box,par){par=par||{};var cv=canvas(box,190),c0=0,c1=0,s=slider(box,'State angle θ',0,180,1,60,function(v){return v+'°'},function(){c0=c1=0;draw()});var r=row(box);btn(r,'Measure 1',function(){m(1)});btn(r,'Measure 100',function(){m(100)});var st=stats(box,[['s','State'],['p','Chance of 0 / 1'],['n','Measured 0 / 1']]);
 if(par.goal)qChal(box,par.goal[1]);
 function P1(){return Math.pow(Math.sin(s.get()*Math.PI/360),2)}function m(k){for(var i=0;i<k;i++){if(Math.random()<P1())c1++;else c0++}draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,th=s.get()*Math.PI/180,cx=W*0.22,cy=H/2,R=Math.min(H*0.38,W*0.18),p1=P1();c.strokeStyle=cssv('--line');c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.beginPath();c.ellipse(cx,cy,R,R*0.3,0,0,7);c.stroke();
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.fillText('|0⟩',cx-10,cy-R-6);c.fillText('|1⟩',cx-10,cy+R+14);c.strokeStyle=cssv('--accent');c.lineWidth=3;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+R*Math.sin(th),cy-R*Math.cos(th));c.stroke();c.fillStyle=cssv('--accent');c.beginPath();c.arc(cx+R*Math.sin(th),cy-R*Math.cos(th),5,0,7);c.fill();
  var bx=W*0.5,bw=W*0.18,bh=H-50;[[1-p1,'0'],[p1,'1']].forEach(function(b,i){var x=bx+i*(bw+20);c.fillStyle=cssv('--soft2');c.fillRect(x,20,bw,bh);c.fillStyle=i?'#e8742a':'#4aa3ff';c.fillRect(x,20+bh*(1-b[0]),bw,bh*b[0]);c.fillStyle=cssv('--text');c.fillText(b[1]+': '+Math.round(b[0]*100)+'%',x+4,H-12)});
  var a=Math.cos(th/2),b2=Math.sin(th/2);st.s.innerHTML=a.toFixed(2)+'|0⟩ + '+b2.toFixed(2)+'|1⟩';st.p.textContent=Math.round((1-p1)*100)+'% / '+Math.round(p1*100)+'%';st.n.textContent=c0+' / '+c1}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var p=P1();return Math.abs(p-par.goal[0])<0.03?{ok:true,msg:'θ = '+s.get()+'°. The chance of 1 is sin²(θ/2) = '+Math.round(p*100)+'%.'}:{ok:false,msg:'The chance of 1 is '+Math.round(p*100)+'% at the moment.'}}}};

/* entanglement: a Bell test */
WIDGETS.qBell=function(box,par){par=par||{};var cv=canvas(box,220),sa=slider(box,'Alice\'s detector angle',0,180,5,0,function(v){return v+'°'},function(){same=tot=0;draw()}),sb=slider(box,'Bob\'s detector angle',0,180,5,60,function(v){return v+'°'},function(){same=tot=0;draw()}),same=0,tot=0;
 var r=row(box);btn(r,'Measure 500 pairs',function(){var d=Math.abs(sa.get()-sb.get())*Math.PI/180,p=Math.pow(Math.sin(d/2),2);for(var i=0;i<500;i++){if(Math.random()<p)same++;tot++}draw()});var st=stats(box,[['m','Measured: same result'],['q','Quantum prediction'],['c','"Hidden instructions" model']]);
 if(par.goal)qChal(box,'Find an angle difference where the measurements clearly beat the "hidden instructions" model (more than 8 percentage points apart), and measure there.');
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,X=function(d){return 40+d/180*(W-60)},Y=function(p){return H-30-p*(H-50)},i;c.strokeStyle=cssv('--line');c.lineWidth=1;c.strokeRect(40,20,W-60,H-50);c.fillStyle=cssv('--muted');c.font='11px system-ui';
  c.strokeStyle=cssv('--muted');c.setLineDash([5,4]);c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(180),Y(1));c.stroke();c.setLineDash([]);c.strokeStyle=cssv('--accent');c.lineWidth=2.5;c.beginPath();for(i=0;i<=180;i++){var p=Math.pow(Math.sin(i*Math.PI/360),2);if(i===0)c.moveTo(X(i),Y(p));else c.lineTo(X(i),Y(p))}c.stroke();
  c.fillText('0°',X(0)-4,H-14);c.fillText('90°',X(90)-8,H-14);c.fillText('180°',X(180)-14,H-14);c.fillText('angle between detectors',W/2-60,H-2);c.fillText('chance of the same result',44,14);
  var d=Math.abs(sa.get()-sb.get());if(tot){c.fillStyle='#e8742a';c.beginPath();c.arc(X(d),Y(same/tot),6,0,7);c.fill()}c.strokeStyle=cssv('--text');c.beginPath();c.moveTo(X(d),20);c.lineTo(X(d),H-30);c.stroke();
  st.m.textContent=tot?Math.round(same/tot*100)+'% of '+tot:'–';st.q.textContent=Math.round(Math.pow(Math.sin(d*Math.PI/360),2)*100)+'%';st.c.textContent=Math.round(d/180*100)+'%'}
 onDraw(draw);draw();
 if(par.goal)return {check:function(){var d=Math.abs(sa.get()-sb.get()),q=Math.pow(Math.sin(d*Math.PI/360),2),cl=d/180;if(!tot)return {ok:false,msg:'Measure some pairs first.'};return Math.abs(q-cl)>0.08?{ok:true,msg:'At '+d+'° quantum predicts '+Math.round(q*100)+'%, the hidden-instructions model '+Math.round(cl*100)+'%. Real experiments agree with quantum, every time.'}:{ok:false,msg:'Here they\'re only '+Math.round(Math.abs(q-cl)*100)+' points apart. Look where the curve and the straight line are furthest apart.'}}}};

