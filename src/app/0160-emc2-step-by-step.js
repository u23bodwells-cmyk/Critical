/* ---------- E = mc², step by step ---------- */
function sciH(x,d){if(x===0)return '0';var e=Math.floor(Math.log10(Math.abs(x))),m=x/Math.pow(10,e);if(Math.abs(m)>=9.995){m/=10;e++}var ms=m.toFixed(d==null?2:d).replace(/\.?0+$/,'');if(e===0)return ms;return ms+' × 10<sup>'+(e<0?'−'+(-e):e)+'</sup>'}
function commas(n){return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')}
WIDGETS.emcLetters=function(box){var D=[['E','energy','joules (J)','How much energy comes out. A joule is small: lifting an apple 1 metre up takes about 1 J.'],['m','mass','kilograms (kg)','How much mass turns into energy. Not the whole object: only the tiny bit that goes "missing".'],['c','the speed of light','metres per second (m/s)','Always the same number: 300,000,000 m/s, written 3.00 × 10<sup>8</sup> m/s.'],['²','squared','(no unit of its own)','Multiply c by itself: c × c. That turns 3 × 10<sup>8</sup> into 9 × 10<sup>16</sup>, a gigantic number.']],seen={},
 r=el('div','emcrow',null,box),info=el('div','emcinfo','<p class="small" style="margin:0">Tap a letter above.</p>',box);
 [['E',0],['=',-1],['m',1],['c',2],['²',3]].forEach(function(p){var b=el('button','emcbtn'+(p[1]<0?' eqsign':''),p[0],r);if(p[1]<0){b.tabIndex=-1;return}
  b.onclick=function(){seen[p[1]]=1;[].forEach.call(r.children,function(x){x.classList.remove('on')});b.classList.add('on','seen');var d=D[p[1]];
   info.innerHTML='<div class="emct"><b>'+d[0]+'</b> means <b>'+d[1]+'</b></div><div class="emcu">Measured in: <b>'+d[2]+'</b></div><p style="margin:6px 0 0">'+d[3]+'</p>'}});
 return {check:function(){var n=Object.keys(seen).length;return n>=4?{ok:true}:{ok:false,msg:'Tap all four parts: E, m, c and the little ². '+(4-n)+' to go.'}},lock:function(){}}};

WIDGETS.joules=function(box){var EX=[[1,'Lifting an apple 1 metre up'],[100,'A 100 W light bulb on for 1 second'],[5e4,'A fully charged phone battery'],[3.3e5,'The food energy in a slice of toast'],[1e7,'All the food a person eats in a day'],[2.7e7,'Burning 1 kg of coal'],[9.7e9,'A UK home\'s electricity for a whole year'],[9e13,'<b>1 gram of mass</b> turned into energy (E = mc²)'],[9e16,'<b>1 kilogram of mass</b> turned into energy']],
 i=0,cv=canvas(box,170),s=slider(box,'Example',0,EX.length-1,1,0,function(v){return (v+1)+' of '+EX.length},function(v){i=v;upd()}),out=el('div','jbig',null,box);
 function upd(){var e=EX[i];out.innerHTML='<div class="jval">'+(e[0]<1e9?commas(e[0]):sciH(e[0]))+' J</div><div class="jdesc">'+e[1]+'</div>';draw()}
 function draw(){var g=prep(cv),c=g.c,W=g.W,H=g.H,n=EX.length,bw=(W-20)/n,mx=17;c.font='11px system-ui';
  EX.forEach(function(e,k){var h=(Math.log10(e[0])+0.6)/(mx+0.6)*(H-34),x=10+k*bw+bw*0.18,w=bw*0.64;c.fillStyle=k===i?cssv('--accent'):cssv('--soft2');c.beginPath();c.roundRect(x,H-18-h,w,h,4);c.fill();
   c.fillStyle=k===i?cssv('--accent'):cssv('--faint');c.textAlign='center';c.fillText('10'+sup(Math.round(Math.log10(e[0]))),x+w/2,H-4)});
  c.textAlign='left';c.fillStyle=cssv('--muted');c.fillText('Each bar is 10, 100, 1000… times taller in energy than it looks: a log scale',10,12)}
 function sup(n){return String(n).split('').map(function(d){return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]}).join('')}
 onDraw(draw);upd();
 return {check:function(){return i>=7?{ok:true}:{ok:false,msg:'Keep sliding until you reach 1 gram of mass.'}},lock:function(){s.input.disabled=true}}};

WIDGETS.emc2=function(box){var s=slider(box,'Mass',-9,0,0.01,-6,function(v){return mass(Math.pow(10,v))},function(){upd()}),out=el('div','calc',null,box),
 st=stats(box,[['h','UK homes powered for a year'],['r','One Hinkley Point C reactor at full power for'],['c','Coal you\'d have to burn']]);
 function mass(kg){if(kg>=0.995)return kg.toFixed(2)+' kg';if(kg>=1e-3*0.995)return +(kg*1000).toPrecision(3)+' g';if(kg>=1e-6*0.995)return +(kg*1e6).toPrecision(3)+' mg';return +(kg*1e9).toPrecision(3)+' µg'}
 function dur(sec){if(sec<60)return sec.toFixed(1)+' seconds';if(sec<3600)return (sec/60).toFixed(1)+' minutes';if(sec<86400)return (sec/3600).toFixed(1)+' hours';if(sec<86400*365)return (sec/86400).toFixed(1)+' days';return (sec/86400/365).toFixed(1)+' years'}
 function coal(kg){if(kg<1)return Math.round(kg*1000)+' g';if(kg<1000)return kg.toFixed(1)+' kg';return commas(kg/1000)+' tonnes'}
 function upd(){var m=Math.pow(10,s.get()),E=m*9e16,h=E/9.7e9;
  out.innerHTML='<div class="cstep"><span>Step 1, mass in kg:</span> m = <b>'+sciH(m)+' kg</b></div><div class="cstep"><span>Step 2, c²:</span> 9 × 10<sup>16</sup></div><div class="cstep cres"><span>Step 3, multiply:</span> E = <b>'+sciH(E)+' J</b></div>';
  st.h.textContent=h<1?'less than 1':commas(h);st.r.textContent=dur(E/4.59e9);st.c.textContent=coal(E/2.7e7)}
 upd();
 return {check:function(){return Math.abs(s.get()+3)<0.03?{ok:true}:{ok:false,msg:'Now showing '+mass(Math.pow(10,s.get()))+'. Set the mass to 1 g (0.001 kg).'}},lock:function(){s.input.disabled=true}}};

WIDGETS.eunits=function(box){var r=row(box);r.innerHTML='<label>Energy</label><input class="ninp" type="text" inputmode="decimal" value="1" style="width:120px"><select><option value="0">J</option><option value="1">eV</option><option value="2" selected>MeV</option></select>';
 var inp=r.querySelector('input'),sel=r.querySelector('select'),st=stats(box,[['j','In joules (J)'],['e','In electronvolts (eV)'],['m','In MeV']]),note=el('p','small',null,box),last=null;
 var F=[1,1.602e-19,1.602e-13];
 function upd(){var v=parseNum(inp.value);if(isNaN(v)||v<=0){st.j.textContent=st.e.textContent=st.m.textContent='–';return}var J=v*F[+sel.value];last=[v,+sel.value];
  st.j.innerHTML=sciH(J,3);st.e.innerHTML=sciH(J/F[1],3);st.m.innerHTML=sciH(J/F[2],3);
  note.innerHTML=J<1e-9?'That\'s an atom-sized amount of energy, so eV or MeV are the easy units here.':'That\'s a big amount: joules are the sensible unit here.'}
 inp.oninput=upd;sel.onchange=upd;upd();
 return {check:function(){return last&&last[1]===2&&Math.abs(last[0]-200)<0.5?{ok:true}:{ok:false,msg:'Type 200 and choose MeV.'}},lock:function(){inp.disabled=true;sel.disabled=true}}};

WIDGETS.u931=function(box){var S=['Start with <b>E = mc²</b> and put in the mass of 1 u, in kilograms:<div class="eq">E = 1.6605 × 10<sup>−27</sup> kg × c<sup>2</sup></div>',
 'For an accurate answer, use the precise speed of light, 2.998 × 10<sup>8</sup> m/s. Squared, that\'s 8.988 × 10<sup>16</sup>:<div class="eq">E = 1.6605 × 10<sup>−27</sup> × 8.988 × 10<sup>16</sup></div>',
 'Multiply the front numbers: 1.6605 × 8.988 = 14.924. Add the powers: −27 + 16 = −11:<div class="eq">E = 14.924 × 10<sup>−11</sup> J = 1.4924 × 10<sup>−10</sup> J</div>',
 'That answer is in joules. To turn joules into MeV, divide by the size of one MeV (1.6022 × 10<sup>−13</sup> J):<div class="eq">1.4924 × 10<sup>−10</sup> ÷ 1.6022 × 10<sup>−13</sup> = 931.5 MeV</div>',
 '<b>So 1 u of mass is worth 931.5 MeV of energy.</b> From now on: mass in u × 931.5 = energy in MeV.'],n=0,list=el('ol','u9list',null,box),r=row(box),b=btn(r,'Next step',function(){if(n<S.length){n++;draw()}});
 function draw(){list.innerHTML=S.slice(0,n).map(function(s,i){return '<li class="'+(i===n-1?'new':'')+'">'+s+'</li>'}).join('');b.disabled=n>=S.length;b.textContent=n>=S.length?'Done':'Next step ('+(n+1)+' of '+S.length+')'}draw();
 return {check:function(){return n>=S.length?{ok:true}:{ok:false,msg:'Keep pressing Next step: '+(S.length-n)+' to go.'}},lock:function(){b.disabled=true}}};

WIDGETS.fissionScale=function(box){var cv=canvas(box,230),r=row(box),done=false,tt=0,b=btn(r,'Split it',function(){done=true;b.disabled=true}),st=stats(box,[['b','Before'],['a','After'],['d','Missing mass']]);
 st.b.textContent='236.0526 u';st.a.textContent='?';st.d.textContent='?';
 anim(cv,function(dt){if(done&&tt<1){tt=Math.min(1,tt+dt*0.9);if(tt>=1){st.a.textContent='235.8666 u';st.d.textContent='0.1860 u'}}
  var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,py=70,L=Math.max(40,Math.min(W/2-64,210)),ang=-0.11*E2(tt),ink=cssv('--text'),mut=cssv('--muted');
  c.strokeStyle=mut;c.lineWidth=3;c.beginPath();c.moveTo(cx,py);c.lineTo(cx,H-20);c.stroke();c.beginPath();c.moveTo(cx-40,H-20);c.lineTo(cx+40,H-20);c.stroke();
  var lx=cx-Math.cos(ang)*L,ly=py-Math.sin(ang)*L,rx=cx+Math.cos(ang)*L,ry=py+Math.sin(ang)*L;
  c.strokeStyle=ink;c.lineWidth=4;c.beginPath();c.moveTo(lx,ly);c.lineTo(rx,ry);c.stroke();c.fillStyle=ink;c.beginPath();c.arc(cx,py,6,0,7);c.fill();
  pan(c,lx,ly,'Before','U-235 + n',cssv('--accent'));pan(c,rx,ry,'After',done?'Ba-141 + Kr-92 + 3n':'(not split yet)',cssv('--coral'));
  if(tt>=1){c.fillStyle=cssv('--good');c.font='600 13px system-ui';c.textAlign='center';c.fillText('Lighter after: 0.186 u became energy',cx,22)}
  function E2(x){return x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
  function pan(c,x,y,t1,t2,col){c.strokeStyle=mut;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x-46,y+56);c.moveTo(x,y);c.lineTo(x+46,y+56);c.stroke();
   c.fillStyle=col;c.beginPath();c.ellipse(x,y+60,58,10,0,0,7);c.fill();c.fillStyle=ink;c.textAlign='center';c.font='600 14px system-ui';c.fillText(t1,cl(x,t1),y+90);c.font='13px system-ui';c.fillStyle=mut;c.fillText(t2,cl(x,t2),y+108)}
  function cl(x,s){var w=c.measureText(s).width/2+4;return Math.max(w,Math.min(W-w,x))}});
 return {check:function(){return tt>=1?{ok:true}:{ok:false,msg:done?'Watch the scales settle…':'Press Split it.'}},lock:function(){b.disabled=true}}};

