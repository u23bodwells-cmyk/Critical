/* =====================================================================
   THEORY TRACK WIDGETS
   ===================================================================== */
function tSvg(vb,inner){return '<svg class="tsvg" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" role="img">'+inner+'</svg>'}

/* ---- tap the numbered spots on a diagram ---- */
WIDGETS.tapLabels=function(box,par){var spots=par.spots,seen={},wrap=el('div','tl',null,box),inner=par.svg;
 spots.forEach(function(s,i){inner+='<g class="tlspot" data-i="'+i+'" tabindex="0" role="button" aria-label="'+s[2].replace(/<[^>]+>/g,'')+'" transform="translate('+s[0]+' '+s[1]+')"><circle class="tlring" r="15"/><circle class="tldot" r="11"/><text class="tln" text-anchor="middle" dy="4.5">'+(i+1)+'</text></g>'});
 wrap.innerHTML=tSvg(par.vb,inner);
 var chips=el('div','tlchips',null,box);spots.forEach(function(s,i){var b=el('button','tlchip','<span>'+(i+1)+'</span>'+s[2],chips);b.onclick=function(){show(i)}});
 var info=el('div','tlinfo','<span class="tlhint">'+(par.hint||'Tap a number on the picture, or a name below.')+'</span>',box);
 [].forEach.call(wrap.querySelectorAll('.tlspot'),function(g){var i=+g.getAttribute('data-i');g.addEventListener('click',function(){show(i)});g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show(i)}})});
 function show(i){seen[i]=1;var s=spots[i];info.innerHTML='<div class="tlt"><span class="tlnum">'+(i+1)+'</span>'+s[2]+'</div><div>'+s[3]+'</div>';
  [].forEach.call(wrap.querySelectorAll('.tlspot'),function(g){var k=+g.getAttribute('data-i');g.classList.toggle('seen',!!seen[k]);g.classList.toggle('cur',k===i)});
  [].forEach.call(chips.children,function(b,k){b.classList.toggle('seen',!!seen[k]);b.classList.toggle('cur',k===i)})}
 return {check:function(){var n=spots.length-Object.keys(seen).length;return n<=0?{ok:true}:{ok:false,msg:'Have a look at every part first. '+n+' still to tap.'}},lock:function(){}}};

/* ---- follow something on a journey around a diagram ---- */
WIDGETS.journey=function(box,par){var st=par.stops,i=-1,wrap=el('div','tl',null,box),pos=[st[0][0],st[0][1]],from=null,to=null,tt=1,trail=[];
 var inner=par.svg+'<polyline class="jtrail" points=""/>'+st.map(function(s,k){return '<g class="jstop" data-k="'+k+'" transform="translate('+s[0]+' '+s[1]+')"><circle r="9"/><text text-anchor="middle" dy="3.8">'+(k+1)+'</text></g>'}).join('')+'<g class="jball" style="opacity:0"><circle r="13" class="jglow"/><circle r="7"/></g>';
 wrap.innerHTML=tSvg(par.vb,inner);var ball=wrap.querySelector('.jball'),trailEl=wrap.querySelector('.jtrail');
 var info=el('div','tlinfo','<span class="tlhint">'+(par.hint||'Press <b>Start</b> and follow the journey one step at a time.')+'</span>',box),r=row(box),back=btn(r,'Back',function(){go(i-1)}),nx=btn(r,'Start',function(){go(i+1)},'pri');back.disabled=true;
 function pathTo(k){var p=[],s=st[k];(s[4]||[]).forEach(function(v){p.push(v)});p.push([s[0],s[1]]);return p}
 function go(k){if(k<0||k>=st.length)return;var fwd=k>i;i=k;var s=st[k];
  if(fwd&&k>0){var pts=[[pos[0],pos[1]]].concat(pathTo(k));from=pts;tt=0}else{from=null;pos=[s[0],s[1]];place()}
  if(!fwd)trail=trail.slice(0,Math.max(1,trailIdx[k]||1));
  ball.style.opacity=1;info.innerHTML='<div class="tlt"><span class="tlnum">'+(k+1)+'</span>'+s[2]+'<span class="jof">'+(k+1)+' of '+st.length+'</span></div><div>'+s[3]+'</div>';
  nx.textContent=k===st.length-1?'Finished':'Next step';nx.disabled=k===st.length-1;back.disabled=k<=0;
  [].forEach.call(wrap.querySelectorAll('.jstop'),function(g){var q=+g.getAttribute('data-k');g.classList.toggle('done',q<=k);g.classList.toggle('cur',q===k)})}
 var trailIdx={};
 function place(){ball.setAttribute('transform','translate('+pos[0].toFixed(1)+' '+pos[1].toFixed(1)+')')}
 function drawTrail(){trailEl.setAttribute('points',trail.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' '))}
 anim(wrap,function(dt){if(from&&tt<1){tt=Math.min(1,tt+dt/0.9);var e=tt<0.5?2*tt*tt:1-Math.pow(-2*tt+2,2)/2,L=[0],tot=0;for(var a=1;a<from.length;a++){tot+=Math.hypot(from[a][0]-from[a-1][0],from[a][1]-from[a-1][1]);L.push(tot)}
   var d=e*tot,j=1;while(j<from.length-1&&L[j]<d)j++;var seg=L[j]-L[j-1]||1,f=(d-L[j-1])/seg;pos=[from[j-1][0]+(from[j][0]-from[j-1][0])*f,from[j-1][1]+(from[j][1]-from[j-1][1])*f];place();
   if(!trail.length)trail.push([from[0][0],from[0][1]]);trail.push([pos[0],pos[1]]);if(trail.length>600)trail.shift();drawTrail();if(tt>=1){trailIdx[i]=trail.length}}});
 place();
 return {check:function(){return i>=st.length-1?{ok:true}:{ok:false,msg:i<0?'Press Start to begin the journey.':'Keep going: '+(st.length-1-i)+' more step'+(st.length-1-i===1?'':'s')+'.'}},lock:function(){}}};

/* ---- sort items into boxes (tap an item, then tap a box) ---- */
WIDGETS.sortIt=function(box,par){var items=shuffle(par.items.map(function(it,i){return {t:it[0],b:it[1],i:i,at:-1,bad:false}})),sel=null,locked=false;
 var hint=el('p','small',par.hint||'Tap an item, then tap the box it belongs in. Tap a placed item to take it back out.',box),pool=el('div','spool',null,box),bins=el('div','sbins',null,box),m=msg(box);
 if(par.bins.length>2)bins.classList.add('s3');
 var binEls=par.bins.map(function(name,bi){var b=el('div','sbin','<div class="sbt">'+name+'</div><div class="sbi"></div>',bins);b.setAttribute('role','button');b.tabIndex=0;b.onclick=function(){if(locked||!sel)return;sel.at=bi;sel.bad=false;sel=null;draw()};b.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();b.onclick()}};return b});
 function chip(it){var c=el('button','schip'+(sel===it?' sel':'')+(it.bad?' bad':'')+(locked?' ok':''),it.t);c.onclick=function(e){e.stopPropagation();if(locked)return;if(it.at>=0){it.at=-1;it.bad=false;sel=it;draw();return}sel=sel===it?null:it;draw()};return c}
 function draw(){pool.innerHTML='';binEls.forEach(function(b){b.querySelector('.sbi').innerHTML='';b.classList.toggle('arm',!!sel&&!locked)});
  var left=0;items.forEach(function(it){if(it.at<0){pool.appendChild(chip(it));left++}else binEls[it.at].querySelector('.sbi').appendChild(chip(it))});
  pool.classList.toggle('empty',!left);if(!locked)m.set(left?(sel?'Now tap the box where <b>'+sel.t+'</b> belongs.':left+' item'+(left===1?'':'s')+' left to sort.'):'All sorted. Press <b>Check</b>.')}
 draw();
 return {check:function(){var left=items.filter(function(it){return it.at<0}).length;if(left)return {ok:false,msg:'Sort all the items first. '+left+' still to place.'};
   var wrong=items.filter(function(it){return it.at!==it.b});if(!wrong.length){locked=true;sel=null;draw();m.set('');return {ok:true}}
   wrong.forEach(function(it){it.at=-1;it.bad=true});sel=null;draw();return {ok:false,msg:wrong.length+' item'+(wrong.length===1?' was':'s were')+' in the wrong box. '+(wrong.length===1?'It\'s':'They\'re')+' back at the top, marked in red. Try again.'}},lock:function(){locked=true;draw()}}};

/* ---- flip cards ---- */
WIDGETS.flipCards=function(box,par){var seen={},g=el('div','fcs',null,box);
 par.cards.forEach(function(c,i){var b=el('button','fc','<span class="fcin"><span class="fcf"><span>'+c[0]+'</span><i>Tap to flip</i></span><span class="fcb"><span>'+c[1]+'</span></span></span>',g);b.setAttribute('aria-label',c[0].replace(/<[^>]+>/g,'')+': tap to flip');b.onclick=function(){b.classList.toggle('flip');seen[i]=1}});
 return {check:function(){var n=par.cards.length-Object.keys(seen).length;return n<=0?{ok:true}:{ok:false,msg:'Flip every card first. '+n+' to go.'}},lock:function(){}}};

/* ---- radiation shielding lab ---- */
WIDGETS.shieldLab=function(box){var R=[['α','Alpha','Two protons and two neutrons stuck together. Big, slow and heavily charged.'],['β','Beta','A fast electron from the nucleus. Small and charged.'],['γ','Gamma','A burst of energy, like a powerful X-ray. No mass, no charge.'],['n','Neutron','A neutron flying out of a fission. No charge, so it isn\'t slowed by electric forces.']],
 B=[['Paper','a sheet of paper',2],['Aluminium','5 mm of aluminium',7],['Lead','5 cm of lead',16],['Water / concrete','1 m of water or concrete',36]],
 // fraction getting through: STOP[r][b]
 TH=[[0,0,0,0],[1,0,0,0],[1,0.85,0.08,0.06],[1,0.95,0.8,0]],
 TXT=[['Stopped by the paper.','Stopped easily.','Stopped easily.','Stopped easily.'],['Goes straight through paper.','Stopped by a few millimetres of aluminium.','Stopped.','Stopped.'],['Goes straight through.','Barely slowed. Gamma rays are very penetrating.','Most are stopped, but a few still get through. Thick dense material reduces gamma; nothing stops all of it.','Most are stopped. Thick concrete and water are how reactors are shielded from gamma.'],['Goes straight through.','Goes straight through.','Mostly gets through! Heavy lead atoms hardly slow neutrons down.','Stopped. The hydrogen in water and concrete slows neutrons down so they can be absorbed.']],
 BEST=[[0],[1],[2,3],[3]],ri=0,bi=0,found={},parts=[],seed=1;
 var rr=row(box),rb=[];R.forEach(function(x,k){rb.push(btn(rr,'<b>'+x[0]+'</b> '+x[1],function(){ri=k;upd()}))});
 var cv=canvas(box,170),r2=row(box),bb=[];B.forEach(function(x,k){bb.push(btn(r2,x[0],function(){bi=k;upd()}))});
 var m=msg(box),tick=el('div','shtick',null,box);
 function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
 function upd(){rb.forEach(function(b,k){b.classList.toggle('on',k===ri)});bb.forEach(function(b,k){b.classList.toggle('on',k===bi)});
  m.set('<b>'+R[ri][1]+'</b> vs '+B[bi][1]+': '+TXT[ri][bi]+'<br><span class="small">'+R[ri][2]+'</span>');
  if(BEST[ri].indexOf(bi)>=0&&TH[ri][bi]<0.1)found[ri]=1;
  tick.innerHTML='Find what stops each one: '+R.map(function(x,k){return '<span class="'+(found[k]?'ok':'')+'">'+(found[k]?'✓ ':'')+x[1]+'</span>'}).join('')}
 var em=0;
 anim(cv,function(dt){var g=prep(cv),c=g.c,W=g.W,H=g.H,bx=W*0.52,bw=Math.max(3,B[bi][2]*W/360),sx=26;
  em+=dt*9;while(em>1){em-=1;parts.push({x:sx,y:H/2+(rnd()-0.5)*H*0.55,v:ri===0?95:ri===1?200:ri===2?300:240,pass:rnd()<TH[ri][bi],dead:0,ri:ri})}
  c.fillStyle=cssv('--soft');c.fillRect(0,0,W,H);
  c.fillStyle=cssv('--coral');c.beginPath();c.arc(sx-8,H/2,12,0,7);c.fill();c.fillStyle=cssv('--muted');c.font='12px system-ui';c.textAlign='left';c.fillText('Source',4,H-8);
  c.fillStyle=bi===0?'#f4f1e6':bi===1?'#b9c2cc':bi===2?'#6f7480':'#8fa4b8';c.globalAlpha=bi===3?0.85:1;c.fillRect(bx,10,bw,H-20);c.globalAlpha=1;c.strokeStyle=cssv('--line');c.strokeRect(bx,10,bw,H-20);
  c.fillStyle=cssv('--muted');c.textAlign='center';c.fillText(B[bi][0],bx+bw/2,H-1);
  c.fillStyle=cssv('--text');c.textAlign='right';c.fillText('Detector',W-4,H-8);c.fillStyle=cssv('--line');c.fillRect(W-16,20,10,H-40);
  parts=parts.filter(function(p){p.x+=p.v*dt*(p.x>bx&&p.x<bx+bw&&!p.pass?0.2:1);if(!p.pass&&p.x>bx+Math.min(bw*0.6,6+bw*0.5)){p.dead+=dt*3}return p.x<W-14&&p.dead<1});
  parts.forEach(function(p){c.globalAlpha=1-p.dead;var col=p.ri===0?cssv('--coral'):p.ri===1?cssv('--blue'):p.ri===2?cssv('--amber'):cssv('--teal');c.fillStyle=col;c.strokeStyle=col;
   if(p.ri===2){c.lineWidth=2;c.beginPath();for(var q=0;q<14;q++){var xx=p.x-q,yy=p.y+Math.sin((p.x-q)*0.45)*3;if(q)c.lineTo(xx,yy);else c.moveTo(xx,yy)}c.stroke()}
   else{c.beginPath();c.arc(p.x,p.y,p.ri===0?5:p.ri===1?2.6:3.6,0,7);c.fill()}});c.globalAlpha=1});
 upd();
 return {check:function(){var n=4-Object.keys(found).length;return n<=0?{ok:true}:{ok:false,msg:'For each type of radiation, find the thinnest material that stops it. '+n+' still to find.'}},lock:function(){}}};

/* ---- random decay: a tray of atoms ---- */
WIDGETS.decayDice=function(box){var N=100,alive=[],hl=0,hist=[N];for(var i=0;i<N;i++)alive.push(true);
 var g=el('div','atoms',null,box),cells=[];for(i=0;i<N;i++)cells.push(el('span','atom',null,g));
 var r=row(box),go=btn(r,'Wait one half-life',step,'pri'),rs=btn(r,'Start again',reset),st=stats(box,[['h','Half-lives passed'],['a','Atoms not yet decayed']]),m=msg(box);
 function step(){var k=0;alive.forEach(function(a,j){if(a&&Math.random()<0.5){alive[j]=false;cells[j].className='atom pop';(function(c){setTimeout(function(){c.className='atom gone'},450)})(cells[j])}});hl++;hist.push(count());upd()}
 function count(){return alive.filter(Boolean).length}
 function reset(){hl=0;for(var j=0;j<N;j++){alive[j]=true;cells[j].className='atom'}hist=[N];upd()}
 function upd(){var n=count();st.h.textContent=hl;st.a.textContent=n+' of '+N;
  m.set(hl===0?'Every atom here is unstable. Each half-life, each atom has a 50:50 chance of decaying. Which ones? Nobody can say.':'After '+hl+' half-li'+(hl===1?'fe':'ves')+': '+n+' left. Expected about '+Math.round(N/Math.pow(2,hl))+'. Notice it\'s close, but rarely exact: decay is random.');go.disabled=n===0}
 upd();
 return {check:function(){return hl>=4?{ok:true}:{ok:false,msg:'Keep waiting: go through at least 4 half-lives.'}},lock:function(){go.disabled=true;rs.disabled=true}}};

/* ---- splitting a uranium nucleus ---- */
WIDGETS.splitAtom=function(box){var PAIRS=[['Barium-141','Krypton-92',3],['Xenon-140','Strontium-94',2],['Caesium-137','Rubidium-97',2],['Iodine-131','Yttrium-102',3]],cv=canvas(box,210),r=row(box),b=btn(r,'Fire a neutron',fire,'pri'),m=msg(box),t=-1,pi=0,n=0,last=-1,seen={};
 function fire(){if(t>=0&&t<2.6)return;do{pi=Math.floor(Math.random()*PAIRS.length)}while(pi===last&&PAIRS.length>1);last=pi;t=0;n++}
 anim(cv,function(dt){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W/2,cy=H/2;if(t>=0)t+=dt;
  var p=PAIRS[pi],col=cssv('--coral'),ncol=cssv('--blue'),txt=cssv('--text'),mut=cssv('--muted');c.textAlign='center';c.font='12px system-ui';
  function nuc(x,y,r,cl,lab){c.fillStyle=cl;c.beginPath();c.arc(x,y,r,0,7);c.fill();if(lab){c.fillStyle=txt;c.fillText(lab,x,y+r+14)}}
  if(t<0||t<1){var nx=t<0?40:40+(cx-40-34)*t;nuc(cx,cy,30,col);c.fillStyle=cssv('--on-accent');c.font='700 13px system-ui';c.fillText('U-235',cx,cy+4);c.font='12px system-ui';
   if(t>=0){nuc(nx,cy,6,ncol);c.fillStyle=mut;c.fillText('slow neutron',nx,cy-14)}else{c.fillStyle=mut;c.fillText('Press "Fire a neutron"',cx,H-14)}return}
  if(t<1.5){var w=(t-1)/0.5,s=1+0.25*Math.sin(w*Math.PI*3);c.save();c.translate(cx,cy);c.scale(s,1/s*1.02);nuc(0,0,31,col);c.restore();c.fillStyle=cssv('--on-accent');c.font='700 13px system-ui';c.fillText('U-236',cx,cy+4);c.font='12px system-ui';c.fillStyle=mut;c.fillText('wobbles…',cx,H-14);return}
  var e=Math.min(1,(t-1.5)/1.1),d=e*W*0.3;c.globalAlpha=Math.max(0,1-e*2.5);c.fillStyle=cssv('--amber');c.beginPath();c.arc(cx,cy,16+e*60,0,7);c.fill();c.globalAlpha=1;
  nuc(cx-d,cy-d*0.25,21,col,p[0]);nuc(cx+d,cy+d*0.25,19,cssv('--amber'),p[1]);
  for(var k=0;k<p[2];k++){var a=0.9+k*2*Math.PI/p[2];nuc(cx+Math.cos(a)*e*W*0.36,cy+Math.sin(a)*e*H*0.42,5,ncol)}
  if(e>=1&&!seen[n]){seen[n]=1;m.set('Split into <b>'+p[0]+'</b> + <b>'+p[1]+'</b> + <b>'+p[2]+' new neutrons</b>, plus a lot of energy. Fire again: the pieces change every time.',true)}});
 return {check:function(){return n>=3&&t>=2.6?{ok:true}:{ok:false,msg:n<3?'Split at least 3 atoms and look at the pieces. '+(3-n)+' to go.':'Wait for the split to finish.'}},lock:function(){b.disabled=true}}};

/* ---- chain reaction: keep it critical ---- */
WIDGETS.chainGame=function(box){var cv=canvas(box,200),rods=slider(box,'Control rods',0,100,5,40,function(v){return v+'% in'},function(){}),r=row(box),go=btn(r,'Run 10 generations',run,'pri'),m=msg(box),seen={},gens=[],running=false,acc=0,n=100,k=1;
 var tick=el('div','shtick',null,box);
 function kOf(){return 1.3-0.006*rods.get()}
 function run(){if(running)return;gens=[100];n=100;k=kOf();running=true;acc=0;go.disabled=true;rods.input.disabled=true}
 function status(){return k<0.995?0:k>1.005?2:1}
 function show(){var L=['dies away (subcritical)','stays steady (critical)','grows (supercritical)'];tick.innerHTML='Try all three: '+L.map(function(x,i){return '<span class="'+(seen[i]?'ok':'')+'">'+(seen[i]?'✓ ':'')+x+'</span>'}).join('')}
 anim(cv,function(dt){if(running){acc+=dt;if(acc>0.32){acc=0;n=n*k;gens.push(n);if(gens.length>10){running=false;go.disabled=false;rods.input.disabled=false;var s=status();seen[s]=1;show();
     m.set(s===0?'<b>Subcritical.</b> Each generation is smaller. The chain reaction dies away: this is a shut-down reactor.':s===1?'<b>Critical!</b> Every fission leads to exactly one more. The number of neutrons, and the power, stays steady. This is normal running.':'<b>Supercritical.</b> Each generation is bigger, so power keeps rising. Fine for a slow, controlled increase, but it must be stopped in time.',s===1?true:null)}}}
  var g=prep(cv),c=g.c,W=g.W,H=g.H,mx=Math.max(220,Math.max.apply(null,gens.concat([1]))*1.1),bw=(W-30)/11;
  c.strokeStyle=cssv('--line');c.lineWidth=1;var y100=H-24-(100/mx)*(H-40);c.setLineDash([4,4]);c.beginPath();c.moveTo(24,y100);c.lineTo(W,y100);c.stroke();c.setLineDash([]);
  c.fillStyle=cssv('--muted');c.font='11px system-ui';c.textAlign='left';c.fillText('- - -  starting level (100)',26,13);c.textAlign='center';
  gens.forEach(function(v,i){var h=(v/mx)*(H-40),x=26+i*bw;c.fillStyle=i===0?cssv('--muted'):k<0.995?cssv('--blue'):k>1.005?cssv('--coral'):cssv('--good-line');c.fillRect(x+bw*0.15,H-24-h,bw*0.7,h);c.fillStyle=cssv('--text');if(bw>28||i%2===0)c.fillText(Math.round(v),x+bw/2,H-28-h)});
  c.fillStyle=cssv('--muted');c.fillText('neutrons in each generation →',W/2,H-6);
  if(!gens.length){c.fillStyle=cssv('--muted');c.font='14px system-ui';c.fillText('Set the control rods, then press Run.',W/2,H/2)}});
 m.set('Each fission makes 2 or 3 new neutrons. Control rods soak some up. Set the rods, then run the chain reaction.');show();
 return {check:function(){var n2=3-Object.keys(seen).length;return n2<=0?{ok:true}:{ok:false,msg:'Make the chain reaction die away, stay steady, and grow. '+n2+' still to find.'}},lock:function(){go.disabled=true}}};

/* ---- neutron bouncing off a heavy nucleus vs hydrogen ---- */
WIDGETS.bounceDemo=function(box){var T=[['Heavy nucleus (like uranium)',238],['Hydrogen nucleus (in water)',1]],ti=1,cv=canvas(box,190),sel=select(box,'Neutron hits',T.map(function(x){return x[0]}),function(i){ti=i;t=-1}),r=row(box),b=btn(r,'Fire a neutron',fire,'pri'),st=stats(box,[['k','Energy kept after this bounce'],['n','Bounces to slow down fully (about)']]),m=msg(box),t=-1,kept=1,ang=0,sg=1,tried={};
 sel.value='1';
 function fire(){t=0;var A=T[ti][1],al=Math.pow((A-1)/(A+1),2),u=Math.random();kept=al+(1-al)*u;sg=Math.random()<0.5?1:-1;ang=ti===1?sg*Math.acos(Math.sqrt(kept)):Math.PI+(u-0.5)*0.6;tried[ti]=1;
  st.k.textContent=(kept>0.95?(kept*100).toFixed(1):Math.round(kept*100))+'%';st.n.textContent=ti===1?'about 18':'about 2,000';
  m.set(ti===1?'Hydrogen is about the same mass as a neutron, so it can take a big share of the neutron\'s energy, like one snooker ball hitting another. That\'s why water is such a good moderator.':'Like a snooker ball bouncing off a bowling ball: it bounces off with almost all its energy. Heavy atoms are useless for slowing neutrons down.',ti===1?true:null)}
 anim(cv,function(dt){var g=prep(cv),c=g.c,W=g.W,H=g.H,cx=W*0.55,cy=H/2,big=T[ti][1]>1,R=big?34:7;if(t>=0)t+=dt;
  c.fillStyle=cssv('--soft');c.fillRect(0,0,W,H);c.font='12px system-ui';c.textAlign='center';
  var v0=W*0.45,nx,ny,tx=cx,ty=cy;
  if(t<0){nx=30;ny=cy}else if(t<1){nx=30+(cx-R-7-30)*t;ny=cy}else{var s=Math.sqrt(kept)*v0*(t-1);nx=cx-R-7+Math.cos(ang)*s;ny=cy+Math.sin(ang)*s;if(!big){var ts=Math.sqrt(Math.max(0,1-kept))*v0*(t-1),at=ang-sg*Math.PI/2;tx=cx+Math.cos(at)*ts;ty=cy+Math.sin(at)*ts}}
  c.fillStyle=big?cssv('--coral'):cssv('--muted');c.beginPath();c.arc(tx,ty,R,0,7);c.fill();c.fillStyle=cssv('--text');c.fillText(big?'heavy nucleus':'hydrogen',cx,cy+R+16);
  c.fillStyle=cssv('--blue');c.beginPath();c.arc(nx,ny,7,0,7);c.fill();c.fillStyle=cssv('--muted');if(t<0)c.fillText('fast neutron',30,cy-14);
  if(t>2.6)t=2.6});
 return {check:function(){return tried[0]&&tried[1]?{ok:true}:{ok:false,msg:'Fire a neutron at both: the heavy nucleus and hydrogen.'}},lock:function(){b.disabled=true}}};

/* ---- control rods: raise, lower, hold, trip ---- */
WIDGETS.rodBank=function(box){var cv=canvas(box,230),r=row(box),bOut=btn(r,'▲ Withdraw',function(){mv(-8)}),bIn=btn(r,'▼ Insert',function(){mv(8)}),bTrip=btn(r,'TRIP',function(){trip(false)}),m=msg(box),tick=el('div','shtick',null,box);
 bTrip.classList.add('tripbtn');var CRIT=50,ins=CRIT,P=50,hist=[],tq=0,tripped=false,auto=false,fall=0,reset=0,steadyT=0,done={};
 function mv(d){if(tripped)return;ins=Math.max(0,Math.min(100,ins+d))}
 function trip(a){if(tripped)return;tripped=true;auto=a;fall=0;reset=0;if(!a&&done.up&&done.down&&done.hold)done.trip=1}
 function show(){var L=[['up','Make power rise'],['down','Make it fall'],['hold','Hold it steady for 5 s'],['trip','Then trip the reactor']];tick.innerHTML=L.map(function(x){return '<span class="'+(done[x[0]]?'ok':'')+'">'+(done[x[0]]?'✓ ':'')+x[1]+'</span>'}).join('')}
 anim(cv,function(dt){var g=prep(cv),c=g.c,W=g.W,H=g.H;
  if(tripped){fall=Math.min(1,fall+dt/1.6);ins=ins+(100-ins)*Math.min(1,dt*5)}
  var rho=tripped?-0.08:(CRIT-ins)*0.0009;
  P=P*Math.exp(rho*dt*12);if(tripped)P=Math.max(P,6.5*Math.exp(-fall*0.4));P=Math.max(0.5,Math.min(120,P));
  if(!tripped&&P>=110)trip(true);
  tq+=dt;if(tq>0.1){tq=0;hist.push(P);if(hist.length>120)hist.shift()}
  if(!tripped){if(rho>0&&hist.length>10&&P>hist[hist.length-10]*1.05)done.up=1;if(rho<0&&hist.length>10&&P<hist[hist.length-10]*0.95)done.down=1;
   if(rho===0)steadyT+=dt;else steadyT=0;if(steadyT>5)done.hold=1;
   m.set(rho>0?'Rods coming out: fewer neutrons are absorbed. <b>Power is rising.</b>':rho<0?'Rods going in: more neutrons are absorbed. <b>Power is falling.</b>':'<b>Steady.</b> The reactor is critical: each fission leads to exactly one more.'+(steadyT>0.3&&!done.hold?' Hold it… '+Math.floor(Math.min(5,steadyT))+' s':''),rho===0?true:null)}
  else if(done.trip){m.set('<b>Reactor tripped.</b> All the rods fell in by gravity in about two seconds. Power dropped fast, but not to zero: the fission products still make heat.',true)}
  else{reset+=dt;m.set(auto?'<b>Automatic trip!</b> Power went above the safe limit, so the protection system dropped every rod. Resetting…':'Tripped early. Do the other three steps first, then trip at the end. Resetting…',false);
   if(reset>3){tripped=false;auto=false;ins=CRIT;P=50;hist=[];fall=0;steadyT=0}}
  show();
  var cx=14,cw=Math.min(150,W*0.36),cy=18,ch=H-40;c.fillStyle=cssv('--soft');c.fillRect(cx,cy,cw,ch);
  var glow=Math.min(1,P/100);c.fillStyle='rgba(232,116,42,'+(0.12+0.6*glow).toFixed(3)+')';c.fillRect(cx+6,cy+ch*0.25,cw-12,ch*0.7);c.strokeStyle=cssv('--line');c.strokeRect(cx,cy,cw,ch);
  for(var q=0;q<5;q++){var rx=cx+14+q*(cw-28)/4,depth=ch*0.25+ins/100*ch*0.7;c.fillStyle=cssv('--text');c.fillRect(rx-3,cy-10,6,depth+10)}
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.textAlign='center';c.fillText('Rods '+Math.round(ins)+'% in',cx+cw/2,H-6);
  var x0=cx+cw+22,x1=W-8,y0=cy,y1=cy+ch;c.strokeStyle=cssv('--line');c.strokeRect(x0,y0,x1-x0,y1-y0);var yl=y1-(110/120)*(y1-y0-20);c.setLineDash([4,4]);c.strokeStyle=cssv('--red');c.beginPath();c.moveTo(x0,yl);c.lineTo(x1,yl);c.stroke();c.setLineDash([]);
  c.fillStyle=cssv('--muted');c.textAlign='left';c.fillText('Power',x0+4,y0+14);c.fillText('trip limit',x0+4,yl-3);c.textAlign='right';c.fillStyle=cssv('--text');c.font='700 13px system-ui';c.fillText(Math.round(P)+'%',x1-4,y0+14);
  c.strokeStyle=tripped?cssv('--red'):cssv('--accent');c.lineWidth=2.5;c.beginPath();hist.forEach(function(v,i){var x=x0+(i/119)*(x1-x0),y=y1-(Math.min(v,120)/120)*(y1-y0-20);if(i)c.lineTo(x,y);else c.moveTo(x,y)});c.stroke();c.lineWidth=1});
 return {check:function(){var n=4-Object.keys(done).length;return n<=0?{ok:true}:{ok:false,msg:'Work through the four steps under the picture. '+n+' to go.'}},lock:function(){bOut.disabled=bIn.disabled=bTrip.disabled=true}}};

/* ---- load following: the reactor follows the turbine ---- */
WIDGETS.loadFollow=function(box){var cv=canvas(box,220),s=slider(box,'Electricity demand (turbine)',40,100,5,70,function(v){return v+'%'},function(){}),m=msg(box),P=70,Tc=0,hist=[],tq=0,moved=false,base=70;
 anim(cv,function(dt){var D=s.get();if(Math.abs(D-base)>=15)moved=true;
  for(var k=0;k<4;k++){var h=dt/4;var dT=0.6*(P-D),dP=-1.1*Tc-1.0*(P-D)*0.9;Tc+=dT*h*0.5;P+=dP*h;}
  tq+=dt;if(tq>0.08){tq=0;hist.push([P,D,Tc]);if(hist.length>160)hist.shift()}
  var g=prep(cv),c=g.c,W=g.W,H=g.H,x0=10,x1=W-74,y0=10,y1=H-26;
  c.strokeStyle=cssv('--line');c.strokeRect(x0,y0,x1-x0,y1-y0);function Y(v){return y1-(v-30)/(110-30)*(y1-y0)}
  c.setLineDash([6,5]);c.strokeStyle=cssv('--muted');c.lineWidth=2;c.beginPath();hist.forEach(function(p,i){var x=x0+i/159*(x1-x0);if(i)c.lineTo(x,Y(p[1]));else c.moveTo(x,Y(p[1]))});c.stroke();c.setLineDash([]);
  c.strokeStyle=cssv('--coral');c.lineWidth=3;c.beginPath();hist.forEach(function(p,i){var x=x0+i/159*(x1-x0);if(i)c.lineTo(x,Y(p[0]));else c.moveTo(x,Y(p[0]))});c.stroke();c.lineWidth=1;
  c.font='12px system-ui';c.textAlign='left';c.fillStyle=cssv('--coral');c.fillText('Reactor power '+Math.round(P)+'%',x0+6,y1+16);c.fillStyle=cssv('--muted');c.fillText('- - demand',x0+150,y1+16);
  // thermometer
  var tx=W-46,ty0=y0+18,tt=310+Tc*1.0,frac=Math.max(0,Math.min(1,(tt-300)/20));c.fillStyle=cssv('--soft');c.fillRect(tx,ty0,18,y1-ty0);c.fillStyle=Tc<-1?cssv('--blue'):Tc>1?cssv('--red'):cssv('--good-line');c.fillRect(tx,y1-frac*(y1-ty0),18,frac*(y1-ty0));c.strokeStyle=cssv('--line');c.strokeRect(tx,ty0,18,y1-ty0);
  c.fillStyle=cssv('--text');c.textAlign='center';c.fillText(tt.toFixed(1)+' °C',tx+9,y1+16);c.fillStyle=cssv('--muted');c.font='11px system-ui';c.fillText('coolant',tx+9,y0+10);
  var D2=s.get();m.set(D2>P+1.5?'Turbine takes more steam than the reactor is making → the coolant <b>cools down</b> → cooler, denser water slows neutrons better → <b>power rises</b> by itself.':P>D2+1.5?'Turbine takes less steam → the coolant <b>warms up</b> → warmer water expands and slows fewer neutrons → <b>power falls</b> by itself.':(moved?'<b>Balanced.</b> The reactor has matched the turbine with no one touching the control rods.':'Move the demand slider a long way, then watch the reactor follow.'),Math.abs(D2-P)<=1.5&&moved?true:null)});
 return {check:function(){return moved&&Math.abs(s.get()-P)<=2?{ok:true}:{ok:false,msg:moved?'Wait until reactor power has caught up with demand.':'Change the demand by at least 15% and watch what the reactor does.'}},lock:function(){s.input.disabled=true}}};

/* ---- boiling point and pressure ---- */
WIDGETS.boilPressure=function(box){var TS=[[1,99.6],[5,151.8],[10,179.9],[20,212.4],[40,250.4],[60,275.6],[80,295.0],[100,311.0],[120,324.7],[140,336.7],[155,344.8],[160,347.4]],TW=325;
 function tsat(p){for(var i=1;i<TS.length;i++)if(p<=TS[i][0]){var a=TS[i-1],b=TS[i];return a[1]+(b[1]-a[1])*(p-a[0])/(b[0]-a[0])}return TS[TS.length-1][1]}
 var cv=canvas(box,210),s=slider(box,'Pressure',1,160,1,1,function(v){return v+' bar'+(v===1?' (normal air pressure)':'')},function(){}),st=stats(box,[['b','Water boils at'],['w','Water temperature'],['s','State']]),m=msg(box),bub=[],ok=false,seed=7;
 function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
 anim(cv,function(dt){var p=s.get(),tb=tsat(p),boil=TW>=tb,g=prep(cv),c=g.c,W=g.W,H=g.H,vx=W/2-70,vw=140,vy=24,vh=H-40;
  st.b.textContent=tb.toFixed(0)+' °C';st.w.textContent=TW+' °C';st.s.textContent=boil?'Boiling!':'Liquid';if(!boil&&p>=120)ok=true;
  c.fillStyle=cssv('--soft');c.fillRect(vx-8,vy-8,vw+16,vh+16);c.fillStyle=boil?'rgba(55,138,221,0.35)':'rgba(55,138,221,0.6)';c.fillRect(vx,vy+(boil?vh*0.25:0),vw,vh-(boil?vh*0.25:0));
  if(boil){if(rnd()<0.9)bub.push({x:vx+8+rnd()*(vw-16),y:vy+vh-4,r:2+rnd()*5});}
  bub=bub.filter(function(b){b.y-=dt*(60+b.r*14);return b.y>vy+vh*0.25&&boil});c.strokeStyle='#fff';c.lineWidth=1.5;bub.forEach(function(b){c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.stroke()});
  c.fillStyle=cssv('--muted');c.font='12px system-ui';c.textAlign='center';c.fillText(boil?'steam':'',vx+vw/2,vy+14);
  var gx=vx+vw+30;c.strokeStyle=cssv('--line');c.lineWidth=6;c.beginPath();c.arc(gx+22,vy+40,22,Math.PI*0.8,Math.PI*2.2);c.stroke();var a=Math.PI*0.8+Math.PI*1.4*(p/160);c.strokeStyle=cssv('--coral');c.lineWidth=3;c.beginPath();c.moveTo(gx+22,vy+40);c.lineTo(gx+22+Math.cos(a)*18,vy+40+Math.sin(a)*18);c.stroke();c.lineWidth=1;c.fillStyle=cssv('--text');c.fillText(p+' bar',gx+22,vy+80);
  m.set(boil?'At '+p+' bar water boils at '+tb.toFixed(0)+' °C, so 325 °C water <b>boils violently</b>. Raise the pressure.':'At '+p+' bar water doesn\'t boil until '+tb.toFixed(0)+' °C. The 325 °C water <b>stays liquid</b>.'+(p<150?' A real PWR runs at about 155 bar for extra margin.':' That\'s about where a PWR runs.'),boil?null:true)});
 return {check:function(){return ok?{ok:true}:{ok:false,msg:'Raise the pressure until the 325 °C water stops boiling.'}},lock:function(){s.input.disabled=true}}};

