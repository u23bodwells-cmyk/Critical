/* ===== sounds start ===== */
/* Sound engine: every sound is synthesised live (FM bells, filtered synths, noise), mixed through a compressor and a small reverb.
   Four packs to pick from in Settings. Right answers climb a scale as your combo grows, so a streak sounds like it's building. */
var SND=(function(){
 var K='critical_sfx',OLD=SFX;
 var LAD=[0,2,4,7,9,12,14,16,19,21,24];
 function nf(s){return 261.63*Math.pow(2,s/12)}
 function rnd(a,b){return a+Math.random()*(b-a)}
 function owned(k){if(!PK[k])return false;if(!PK[k].ex)return true;try{var l=JSON.parse(localStorage.getItem('critical_loot')||'{}')||{};return !!(l.items&&l.items['sp-'+k])}catch(e){return false}}
 function cfg(){var o={};try{o=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){}return {pack:PK[o.pack]&&owned(o.pack)?o.pack:'reactor',vol:typeof o.vol==='number'?Math.max(0,Math.min(1,o.vol)):0.7}}
 function setCfg(c){try{localStorage.setItem(K,JSON.stringify(c))}catch(e){}if(bus)try{bus.master.gain.setTargetAtTime(lvl(c.vol),bus.a.currentTime,0.02)}catch(e){}}
 function lvl(v){return v*v*1.25}

 /* ---------- the mixer ---------- */
 var bus=null,NB=null;
 function imp(a,sec,dec){var n=Math.floor(a.sampleRate*sec),b=a.createBuffer(2,n,a.sampleRate);for(var c=0;c<2;c++){var d=b.getChannelData(c);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)*(i<a.sampleRate*0.004?i/(a.sampleRate*0.004):1)}return b}
 function mk(a,vol){var master=a.createGain(),comp=a.createDynamicsCompressor(),inp=a.createGain(),rev=a.createConvolver(),wet=a.createGain(),hp=a.createBiquadFilter();
  comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=3;comp.attack.value=0.002;comp.release.value=0.2;
  hp.type='highpass';hp.frequency.value=220;rev.buffer=imp(a,2.2,3.2);wet.gain.value=0.8;
  inp.connect(comp);hp.connect(rev);rev.connect(wet);wet.connect(comp);comp.connect(master);master.connect(a.destination);master.gain.value=lvl(vol);
  return {a:a,inp:inp,rev:hp,master:master}}
 function out(){var a=ac();if(!a)return null;if(!bus||bus.a!==a)bus=mk(a,cfg().vol);return bus}
 function nbuf(a){if(NB&&NB.a===a)return NB.b;var n=a.sampleRate*2,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;NB={a:a,b:b};return b}

 /* ---------- building blocks ---------- */
 function env(g,t,at,v,d,hold){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,v),t+at);if(hold)g.gain.setValueAtTime(Math.max(0.0002,v),t+at+hold);g.gain.exponentialRampToValueAtTime(0.0001,t+d)}
 function dst(B,p){var a=B.a,n=a.createGain(),last=n;if(p.pan&&a.createStereoPanner){var pn=a.createStereoPanner();pn.pan.value=Math.max(-1,Math.min(1,p.pan));n.connect(pn);last=pn}
  last.connect(B.inp);if(p.rev){var s=a.createGain();s.gain.value=p.rev;last.connect(s);s.connect(B.rev)}return n}
 /* plain oscillator: f, t, d, type, v, at, hold, to (pitch slide), st (slide time), lp/lpTo (filter sweep), q, det, pan, rev */
 function tone(B,T,p){var a=B.a,t=T+(p.t||0),d=p.d||0.2,o=a.createOscillator(),g=a.createGain();o.type=p.type||'sine';o.frequency.setValueAtTime(p.f,t);if(p.det)o.detune.value=p.det;
  if(p.to)o.frequency.exponentialRampToValueAtTime(p.to,t+(p.st||d));var x=o;
  if(p.lp){var fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(p.lp,t);fl.Q.value=p.q||0.8;if(p.lpTo)fl.frequency.exponentialRampToValueAtTime(p.lpTo,t+(p.lpT||d*0.6));o.connect(fl);x=fl}
  x.connect(g);env(g,t,p.at||0.005,p.v||0.1,d,p.hold);g.connect(dst(B,p));o.start(t);o.stop(t+d+0.05)}
 /* FM bell: ratio sets the timbre (3.5 = glass, 1.4 = metal, 4 = mallet), idx sets the brightness */
 function bell(B,T,p){var a=B.a,t=T+(p.t||0),d=p.d||0.8,c=a.createOscillator(),m=a.createOscillator(),mg=a.createGain(),g=a.createGain();c.frequency.value=p.f;m.frequency.value=p.f*(p.ratio||3.5);if(p.det){c.detune.value=p.det;m.detune.value=p.det}
  var I=p.f*(p.idx||1.5);mg.gain.setValueAtTime(I,t);mg.gain.exponentialRampToValueAtTime(Math.max(0.5,I*0.04),t+d*(p.bright||0.5));m.connect(mg);mg.connect(c.frequency);c.connect(g);env(g,t,p.at||0.002,p.v||0.1,d);g.connect(dst(B,p));c.start(t);m.start(t);c.stop(t+d+0.05);m.stop(t+d+0.05)}
 /* filtered noise: ft (filter type), f/to (sweep), q */
 function noise(B,T,p){var a=B.a,t=T+(p.t||0),d=p.d||0.1,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=nbuf(a);s.loop=true;
  f.type=p.ft||'bandpass';f.frequency.setValueAtTime(p.f||2000,t);if(p.to)f.frequency.exponentialRampToValueAtTime(p.to,t+(p.st||d));f.Q.value=p.q||1;
  s.connect(f);f.connect(g);env(g,t,p.at||0.002,p.v||0.05,d,p.hold);g.connect(dst(B,p));s.start(t,Math.random()*1.5);s.stop(t+d+0.05)}
 function thump(B,T,t,v,f){tone(B,T,{f:f||150,to:42,st:0.12,t:t||0,d:0.28,v:v||0.28,at:0.002})}
 function shimmer(B,T,t,d,v){noise(B,T,{ft:'highpass',f:7000,t:t||0,d:d||0.8,v:v||0.018,at:0.15,rev:0.8,pan:rnd(-.3,.3)})}
 function combo(o){var n=(o&&o.n)||(P&&P.combo)||1;return Math.max(1,n)}

 /* ---------- packs ---------- */
 var PK={};
 /* Control room: glassy FM bells, warm synth pads, a reactor spin-up */
 PK.reactor={name:'Control room',
  right:function(B,T,o){var n=combo(o),f=nf(LAD[Math.min(n-1,LAD.length-1)]+12),det=rnd(-6,6),pan=rnd(-.18,.18);
   bell(B,T,{f:f,ratio:3.01,idx:1.1,d:0.75,v:0.17,det:det,pan:pan,rev:0.28});bell(B,T,{f:f*(Math.random()<.5?1.5:1.26),t:0.055,ratio:3.01,idx:0.7,d:0.6,v:0.07,det:det,pan:-pan,rev:0.35});
   tone(B,T,{f:f/2,d:0.14,v:0.05});noise(B,T,{f:6500,q:1.5,d:0.04,v:0.035});
   if(n>=5&&n%5===0){[0,4,7,12].forEach(function(s,i){bell(B,T,{f:f*Math.pow(2,(s+12)/12),t:0.14+i*0.055,ratio:3.5,idx:1.2,d:0.7,v:0.06,pan:(i%2?.3:-.3),rev:0.5})});shimmer(B,T,0.15,0.9,0.025)}},
  wrong:function(B,T){var a=Math.random()<.5?196:185;tone(B,T,{f:a,to:a*0.75,st:0.22,d:0.34,type:'triangle',v:0.15,lp:1300,lpTo:450,rev:0.12});tone(B,T,{f:a/2,to:a*0.375,st:0.22,d:0.3,v:0.12});noise(B,T,{ft:'lowpass',f:420,d:0.09,v:0.06})},
  done:function(B,T){thump(B,T,0,0.25);[0,4,7,12].forEach(function(s,i){[-7,7].forEach(function(dt){tone(B,T,{f:nf(s),type:'sawtooth',det:dt,lp:280,lpTo:2600,lpT:0.8,at:0.25,hold:0.35,d:1.6,v:0.028,rev:0.5,pan:dt/20})})});
   [12,16,19,24,28].forEach(function(s,i){bell(B,T,{f:nf(s),t:i*0.085,ratio:3.01,idx:1,d:i===4?1.3:0.7,v:0.1,pan:(i-2)*0.15,rev:0.4})});shimmer(B,T,0.35,1,0.02)},
  level:function(B,T){[[7,0],[12,0.14],[16,0.28]].forEach(function(x){[-6,6].forEach(function(dt){tone(B,T,{f:nf(x[0]),t:x[1],type:'sawtooth',det:dt,lp:700,lpTo:3200,lpT:0.08,d:0.16,v:0.05,rev:0.3})})});
   thump(B,T,0,0.22);thump(B,T,0.44,0.35,120);[12,16,19,24].forEach(function(s){[-8,8].forEach(function(dt){tone(B,T,{f:nf(s),t:0.44,type:'sawtooth',det:dt,lp:600,lpTo:3800,lpT:0.25,at:0.02,hold:0.5,d:1.8,v:0.032,rev:0.45,pan:dt/16})})});
   noise(B,T,{ft:'highpass',f:5000,t:0.44,d:1.3,v:0.045,rev:0.5});[24,28,31,36].forEach(function(s,i){bell(B,T,{f:nf(s),t:0.62+i*0.07,ratio:3.5,idx:1.3,d:0.9,v:0.05,pan:(i%2?.35:-.35),rev:0.6})})},
  badge:function(B,T){[7,9,12,14,16,19,24].forEach(function(s,i){bell(B,T,{f:nf(s+12),t:i*0.045,ratio:3.5,idx:1.5,d:0.95,v:0.085,pan:(i%2?.3:-.3),rev:0.5})});shimmer(B,T,0.1,1,0.022)},
  quest:function(B,T){bell(B,T,{f:nf(21),ratio:3.01,idx:1.2,d:0.5,v:0.13,rev:0.3});bell(B,T,{f:nf(28),t:0.1,ratio:3.01,idx:1.2,d:0.9,v:0.13,rev:0.35});bell(B,T,{f:nf(35),t:0.1,ratio:3.5,idx:0.6,d:0.8,v:0.04,rev:0.5})},
  tap:function(B,T){noise(B,T,{f:3600,q:3,d:0.02,v:0.2});tone(B,T,{f:1400,d:0.025,v:0.05})},
  crate:function(B,T){noise(B,T,{f:300,to:4200,st:0.3,q:1.3,d:0.34,at:0.22,v:0.1,rev:0.2});tone(B,T,{f:380,to:950,st:0.06,t:0.3,d:0.14,v:0.16});thump(B,T,0.3,0.3,170);shimmer(B,T,0.32,0.7,0.03)},
  reveal:function(B,T,o){var r=(o&&o.r)||'C';if(r==='L'){PK.reactor.level(B,T);return}if(r==='E'){PK.reactor.done(B,T);return}
   var ss=r==='R'?[12,16,19,24]:[19,24];ss.forEach(function(s,i){bell(B,T,{f:nf(s+12),t:i*0.07,ratio:3.01,idx:1.1,d:0.8,v:0.11,pan:(i%2?.25:-.25),rev:0.4})});if(r==='R')shimmer(B,T,0.2,0.8,0.02)},
  start:function(B,T){tone(B,T,{f:55,to:220,st:0.6,type:'sawtooth',lp:180,lpTo:3200,lpT:0.6,at:0.05,d:0.72,v:0.07,rev:0.2});tone(B,T,{f:110,to:440,st:0.6,d:0.7,v:0.05});
   thump(B,T,0.6,0.22);bell(B,T,{f:nf(24),t:0.6,ratio:3.01,idx:1.2,d:1,v:0.12,rev:0.45});bell(B,T,{f:nf(31),t:0.66,ratio:3.01,idx:1,d:0.9,v:0.06,rev:0.5})},
  hh:function(B,T){[0,2,4,7,9,12,14,16,19,24].forEach(function(s,i){bell(B,T,{f:nf(s+12),t:i*0.04,ratio:3.5,idx:1.3,d:0.7,v:0.075,pan:(i%2?.35:-.35),rev:0.45})});[12,16,19].forEach(function(s){tone(B,T,{f:nf(s),t:0.4,type:'sawtooth',det:rnd(-8,8),lp:500,lpTo:2500,at:0.05,hold:0.3,d:1.2,v:0.03,rev:0.5})});shimmer(B,T,0.4,0.9,0.025)}};

 /* Arcade: crunchy square waves, no reverb, quick jingles */
 function sq(B,T,f,t,d,v,o){o=o||{};tone(B,T,{f:f,t:t,d:d,type:o.type||'square',v:(v||0.06)*1.4,at:0.002,lp:o.lp||5200,to:o.to,st:o.st,det:o.det,pan:o.pan,rev:o.rev||0.04,hold:o.hold})}
 function seq(B,T,notes,step,len,v,type){notes.forEach(function(s,i){if(s!=null)sq(B,T,nf(s),i*step,len,v,{type:type})})}
 PK.arcade={name:'Arcade',
  right:function(B,T,o){var n=combo(o),s=LAD[Math.min(n-1,LAD.length-1)]+12;sq(B,T,nf(s),0,0.07,0.055,{hold:0.04});sq(B,T,nf(s+5),0.06,0.14,0.055,{hold:0.05});
   if(n>=5&&n%5===0)seq(B,T,[s+12,s+16,s+19,s+24],0.05,0.06,0.04)},
  wrong:function(B,T){sq(B,T,220,0,0.26,0.05,{to:110,st:0.24,hold:0.1});sq(B,T,226,0,0.26,0.035,{to:113,st:0.24,type:'sawtooth',lp:1800,hold:0.1})},
  done:function(B,T){seq(B,T,[12,16,19,24,null,19,24],0.075,0.07,0.05);sq(B,T,nf(28),0.52,0.42,0.05,{hold:0.25});sq(B,T,nf(-12),0,0.3,0.07,{type:'triangle',lp:2000});sq(B,T,nf(-5),0.3,0.3,0.07,{type:'triangle',lp:2000});sq(B,T,nf(0),0.52,0.4,0.08,{type:'triangle',lp:2000,hold:0.2})},
  level:function(B,T){seq(B,T,[7,12,16,19,16,19,24,null,24,28,31],0.07,0.065,0.05);sq(B,T,nf(36),0.8,0.6,0.05,{hold:0.35});[-17,-12,-8,-5,0].forEach(function(s,i){sq(B,T,nf(s),i*0.18,0.17,0.07,{type:'triangle',lp:2000})});noise(B,T,{ft:'highpass',f:6000,t:0.8,d:0.4,v:0.04})},
  badge:function(B,T){seq(B,T,[12,16,19,24,28,31,36,40],0.035,0.05,0.045,'square')},
  quest:function(B,T){sq(B,T,nf(24),0,0.07,0.05,{hold:0.04});sq(B,T,nf(31),0.07,0.32,0.05,{hold:0.08})},
  tap:function(B,T){sq(B,T,1800,0,0.016,0.05)},
  crate:function(B,T){noise(B,T,{ft:'lowpass',f:3000,to:300,d:0.22,v:0.07});seq(B,T,[0,4,7,12,16,19],0.035,0.04,0.045)},
  reveal:function(B,T,o){var r=(o&&o.r)||'C';if(r==='L'){PK.arcade.level(B,T);return}if(r==='E'){PK.arcade.done(B,T);return}seq(B,T,r==='R'?[19,24,28,31]:[19,24],0.06,0.08,0.05)},
  start:function(B,T){seq(B,T,[-12,-5,0,7,12,19,24],0.06,0.06,0.05);sq(B,T,nf(24),0.42,0.3,0.05,{hold:0.15})},
  hh:function(B,T){seq(B,T,[12,14,16,19,21,24,26,28,31,36],0.04,0.05,0.045);noise(B,T,{ft:'highpass',f:6000,t:0.4,d:0.3,v:0.03})}};

 /* Calm: soft wooden mallets and warm pads, lots of space */
 function mar(B,T,f,t,v,d,pan){bell(B,T,{f:f,t:t,ratio:4,idx:0.9,bright:0.12,d:d||0.6,v:v||0.1,pan:pan||0,rev:0.5});tone(B,T,{f:f,t:t,d:(d||0.6)*0.8,v:(v||0.1)*0.5,pan:pan||0,rev:0.4})}
 function pad(B,T,ss,t,d,v){ss.forEach(function(s){tone(B,T,{f:nf(s),t:t,type:'triangle',at:0.3,hold:d*0.3,d:d,v:v||0.03,rev:0.7,det:rnd(-5,5)})})}
 PK.calm={name:'Calm',
  right:function(B,T,o){var n=combo(o),f=nf(LAD[Math.min(n-1,8)]+12);mar(B,T,f,0,0.11+0.025*Math.min(n-1,8),0.7,rnd(-.2,.2));if(n>=5&&n%5===0)mar(B,T,f*2,0.12,0.06,0.9,.3)},
  wrong:function(B,T){mar(B,T,nf(-12),0,0.09,0.35);mar(B,T,nf(-17),0.11,0.07,0.4)},
  done:function(B,T){[0,4,7,12,16].forEach(function(s,i){mar(B,T,nf(s+12),i*0.13,0.09,0.9,(i-2)*0.2)});pad(B,T,[0,4,7],0.1,1.8,0.025)},
  level:function(B,T){[0,4,7,12,16,19,24].forEach(function(s,i){mar(B,T,nf(s+12),i*0.11,0.085,1,(i%2?.3:-.3))});pad(B,T,[0,4,7,12],0.2,2.2,0.026)},
  badge:function(B,T){[7,12,16,19].forEach(function(s,i){mar(B,T,nf(s+12),i*0.09,0.08,0.9,(i%2?.25:-.25))})},
  quest:function(B,T){mar(B,T,nf(19),0,0.09,0.6);mar(B,T,nf(24),0.13,0.09,0.9)},
  tap:function(B,T){mar(B,T,nf(31),0,0.07,0.08)},
  crate:function(B,T){noise(B,T,{f:500,to:2500,q:0.8,d:0.4,at:0.3,v:0.035,rev:0.4});mar(B,T,nf(24),0.38,0.09,0.8)},
  reveal:function(B,T,o){var r=(o&&o.r)||'C';if(r==='L'){PK.calm.level(B,T);return}if(r==='E'){PK.calm.done(B,T);return}(r==='R'?[12,16,19,24]:[19,24]).forEach(function(s,i){mar(B,T,nf(s+12),i*0.1,0.09,0.8)})},
  start:function(B,T){[0,7,12].forEach(function(s,i){mar(B,T,nf(s+12),i*0.15,0.09,0.8)});pad(B,T,[0,7],0.2,1.4,0.02)},
  hh:function(B,T){[0,4,7,12,16,19].forEach(function(s,i){mar(B,T,nf(s+12),i*0.07,0.08,0.8,(i%2?.3:-.3))});pad(B,T,[0,4,7],0.3,1.6,0.022)}};

 /* Classic: the original beeps, now through the volume control */
 var FALL={crate:'badge',start:'quest',hh:'badge',combo:'combo'};
 /* ---------- exclusive packs (unlocked in the season pass) ---------- */
 function echo(B,T,fn,times,gap,fall){for(var i=0;i<times;i++)fn(i*gap,Math.pow(fall,i))}
 /* Synthwave: detuned saw plucks with tape-style echoes, big gated chords */
 function pluck(B,T,f,t,v,d,pan){[-9,9].forEach(function(dt){tone(B,T,{f:f,t:t,type:'sawtooth',det:dt,lp:4200,lpTo:500,lpT:d*0.7,q:2,d:d,v:v,at:0.003,pan:(pan||0)+dt/30,rev:0.25})})}
 PK.synth={name:'Synthwave',ex:1,
  right:function(B,T,o){var n=combo(o),f=nf(LAD[Math.min(n-1,LAD.length-1)]+12);echo(B,T,function(t,a){pluck(B,T,f,t,0.05*a,0.28,t?(t>0.2?0.4:-0.4):0);pluck(B,T,f*1.5,t+0.05,0.03*a,0.24)},3,0.17,0.45);tone(B,T,{f:f/2,d:0.16,type:'square',lp:600,v:0.035});
   if(n>=5&&n%5===0)[0,4,7,12,16].forEach(function(s,i){pluck(B,T,f*Math.pow(2,s/12),0.12+i*0.06,0.035,0.3,(i%2?.3:-.3))})},
  wrong:function(B,T){[-9,9].forEach(function(dt){tone(B,T,{f:147,to:98,st:0.3,type:'sawtooth',det:dt,lp:1800,lpTo:200,d:0.38,v:0.07})});noise(B,T,{ft:'lowpass',f:600,d:0.1,v:0.05})},
  done:function(B,T){thump(B,T,0,0.28);noise(B,T,{f:1800,q:0.7,t:0.0,d:0.18,v:0.06});[0,4,7,12].forEach(function(s){[-10,10].forEach(function(dt){tone(B,T,{f:nf(s),type:'sawtooth',det:dt,lp:500,lpTo:3500,lpT:0.5,at:0.02,hold:0.5,d:1.4,v:0.026,rev:0.4,pan:dt/25})})});
   [12,16,19,24,28,31].forEach(function(s,i){echo(B,T,function(t,a){pluck(B,T,nf(s),0.05+i*0.07+t,0.045*a,0.25,(i%2?.35:-.35))},2,0.21,0.4)})},
  level:function(B,T){[0,0.25].forEach(function(t0){thump(B,T,t0,0.3);noise(B,T,{f:2000,q:0.7,t:t0+0.125,d:0.15,v:0.07})});[7,12,16,19,24,28,31,36].forEach(function(s,i){pluck(B,T,nf(s),i*0.06,0.045,0.3,(i%2?.3:-.3))});
   [12,16,19,24].forEach(function(s){[-12,12].forEach(function(dt){tone(B,T,{f:nf(s),t:0.5,type:'sawtooth',det:dt,lp:600,lpTo:5000,lpT:0.3,at:0.01,hold:0.6,d:1.9,v:0.03,rev:0.45,pan:dt/20})})});noise(B,T,{ft:'highpass',f:5000,t:0.5,d:1.2,v:0.04,rev:0.5})},
  badge:function(B,T){[12,16,19,24,28,31,36].forEach(function(s,i){pluck(B,T,nf(s),i*0.045,0.04,0.3,(i%2?.35:-.35))});shimmer(B,T,0.2,0.9,0.02)},
  quest:function(B,T){echo(B,T,function(t,a){pluck(B,T,nf(21),t,0.05*a,0.25);pluck(B,T,nf(28),t+0.1,0.05*a,0.3)},3,0.2,0.45)},
  start:function(B,T){tone(B,T,{f:55,to:440,st:0.55,type:'sawtooth',lp:200,lpTo:5000,lpT:0.55,d:0.62,v:0.06,rev:0.3});thump(B,T,0.55,0.3);pluck(B,T,nf(24),0.55,0.06,0.5)}};
 /* Deep space: sonar pings, slow pads, lots of echo */
 function ping(B,T,f,t,v,d,pan){tone(B,T,{f:f,to:f*0.985,st:d,t:t,d:d,v:v,at:0.004,rev:0.85,pan:pan||0});tone(B,T,{f:f*2,t:t,d:d*0.5,v:v*0.18,rev:0.9,pan:pan||0})}
 function spad(B,T,ss,t,d,v){ss.forEach(function(s,i){tone(B,T,{f:nf(s),t:t,type:'triangle',det:i%2?6:-6,at:d*0.35,hold:d*0.2,d:d,v:v,rev:0.95,lp:900,lpTo:2400,lpT:d*0.5})})}
 PK.space={name:'Deep space',ex:1,
  right:function(B,T,o){var n=combo(o),f=nf(LAD[Math.min(n-1,LAD.length-1)]+12);ping(B,T,f,0,0.13,1.1,rnd(-.3,.3));ping(B,T,f*1.5,0.11,0.05,0.9,rnd(-.4,.4));if(n>=5&&n%5===0){spad(B,T,[0,7,12].map(function(x){return x+LAD[Math.min(n-1,LAD.length-1)]}),0.05,1.6,0.025);noise(B,T,{f:400,to:3000,q:0.6,t:0,d:0.8,at:0.4,v:0.03,rev:0.8})}},
  wrong:function(B,T){tone(B,T,{f:110,to:52,st:0.4,d:0.55,v:0.16,rev:0.5});noise(B,T,{f:900,to:200,q:0.7,d:0.5,at:0.02,v:0.04,rev:0.6})},
  done:function(B,T){spad(B,T,[0,7,12,16],0,2.2,0.03);[12,19,24,28,31].forEach(function(s,i){ping(B,T,nf(s),0.15+i*0.15,0.08,1.2,(i-2)*0.25)});noise(B,T,{f:300,to:5000,q:0.5,d:1.2,at:0.6,v:0.03,rev:0.9})},
  level:function(B,T){noise(B,T,{f:200,to:6000,q:0.5,d:1.0,at:0.8,v:0.05,rev:0.7});thump(B,T,0.95,0.3,90);spad(B,T,[0,7,12,16,19],0.9,2.4,0.032);[24,28,31,36].forEach(function(s,i){ping(B,T,nf(s),1.0+i*0.12,0.07,1.3,(i%2?.4:-.4))})},
  badge:function(B,T){[19,24,26,31,36].forEach(function(s,i){ping(B,T,nf(s),i*0.08,0.08,1.1,(i%2?.4:-.4))})},
  quest:function(B,T){ping(B,T,nf(21),0,0.11,1);ping(B,T,nf(28),0.14,0.11,1.3)},
  start:function(B,T){noise(B,T,{f:150,to:4000,q:0.6,d:0.7,at:0.5,v:0.05,rev:0.6});tone(B,T,{f:55,to:220,st:0.65,d:0.8,v:0.08,rev:0.5});ping(B,T,nf(24),0.68,0.12,1.4)}};
 /* Glass: bowed-glass tones with the uneven overtones of a real wine glass */
 function gl(B,T,f,t,v,d,pan){[[1,1],[2.32,0.32],[4.25,0.12]].forEach(function(h){tone(B,T,{f:f*h[0],t:t,d:d*(h[0]>2?0.55:1),v:v*h[1],at:h[0]>1?0.004:0.02,rev:0.55,pan:pan||0})})}
 PK.glass={name:'Glass',ex:1,
  right:function(B,T,o){var n=combo(o),f=nf(LAD[Math.min(n-1,8)]+12);gl(B,T,f,0,0.12,1.4,rnd(-.2,.2));if(n>=5&&n%5===0)gl(B,T,f*2,0.12,0.07,1.6,.3)},
  wrong:function(B,T){gl(B,T,nf(-2),0,0.09,0.6,-.2);gl(B,T,nf(-1),0.03,0.07,0.6,.2)},
  done:function(B,T){[0,4,7,12,16].forEach(function(s,i){gl(B,T,nf(s+12),i*0.12,0.085,1.6,(i-2)*0.2)})},
  level:function(B,T){[0,4,7,12,16,19,24].forEach(function(s,i){gl(B,T,nf(s+12),i*0.1,0.08,1.8,(i%2?.3:-.3))});[0,7,12].forEach(function(s){gl(B,T,nf(s+12),0.75,0.05,2.2)})},
  badge:function(B,T){[12,16,19,24].forEach(function(s,i){gl(B,T,nf(s+12),i*0.08,0.08,1.4,(i%2?.25:-.25))})},
  quest:function(B,T){gl(B,T,nf(19),0,0.09,1.2);gl(B,T,nf(24),0.13,0.09,1.5)},
  start:function(B,T){[0,7,12].forEach(function(s,i){gl(B,T,nf(s+12),i*0.14,0.09,1.4)})}};
 PK.classic={name:'Classic beeps'};
 function classic(B,T,k,o){if(k==='reveal')k=(o&&(o.r==='L'||o.r==='E'))?'level':'badge';else if(FALL[k])k=FALL[k];if(k==='tap'){tone(B,T,{f:1650,d:0.035,type:'triangle',v:0.06});return}
  (OLD[k]||[]).forEach(function(n){tone(B,T,{f:n[0],t:n[1],d:n[2],type:n[3],v:n[4]||(n[3]==='triangle'?0.07:0.08),at:0.012})})}

 function play(k,o,packName,B){if(!B){if(S.sound===false)return;B=out();if(!B)return}var pk=packName||cfg().pack,T=B.a.currentTime+0.01;if(k==='combo')k='right';
  try{if(pk==='classic'){classic(B,T,k==='right'&&combo(o)>=3?'combo':k,o);return}var P2=PK[pk]||PK.reactor;if(P2[k])P2[k](B,T,o||{});else if(P2.ex&&PK.reactor[k])PK.reactor[k](B,T,o||{});else if(OLD[k])classic(B,T,k,o)}catch(e){}}

 /* take over the app's sound functions */
 sfx=function(k,o){play(k,o)};
 beep=function(f,t0,d,type,vol){if(S.sound===false)return;if(f===1650&&Math.abs(d-0.035)<1e-6){play('tap');return}var B=out();if(!B)return;try{tone(B,B.a.currentTime,{f:f,t:t0,d:d,type:type,v:(vol||0.08)*1.2,at:0.012,rev:0.1})}catch(e){}};

 /* ---------- settings: pick a pack, set the volume, try every sound ---------- */
 var TRY=[['right','✓ Right',{n:1}],['right','3 in a row',{n:3}],['right','5 in a row',{n:5}],['right','10 in a row',{n:10}],['wrong','✗ Wrong'],['done','Lesson done'],['level','Level up'],['badge','Badge'],['quest','Quest'],['crate','Crate opening'],['reveal','Legendary',{r:'L'}],['start','Just start'],['hh','Happy hour'],['tap','Tap']];
 function rows(){var sel=$('sndSel');if(!sel||$('sndPack'))return;var row=sel.closest('.wrow');if(!row)return;var c=cfg(),w=document.createElement('div');w.id='sndBox';
  w.innerHTML='<div class="wrow"><label for="sndPack">Sound pack</label><select id="sndPack">'+Object.keys(PK).map(function(k){var ow=owned(k);return '<option value="'+k+'"'+(c.pack===k?' selected':'')+(ow?'':' disabled')+'>'+PK[k].name+(ow?'':' (on the season pass, from 1,850 points)')+'</option>'}).join('')+'</select></div>'+
   '<div class="wrow"><label for="sndVol">Volume</label><input type="range" id="sndVol" min="0" max="100" step="5" value="'+Math.round(c.vol*100)+'" aria-describedby="sndVolV"><span class="note" id="sndVolV" style="min-width:42px;font-family:var(--mono)">'+Math.round(c.vol*100)+'%</span></div>'+
   '<div class="wrow sndtry"><label>Try them</label><div class="sndbtns">'+TRY.map(function(x,i){return '<button type="button" data-i="'+i+'">'+x[1]+'</button>'}).join('')+'</div></div>';
  row.parentNode.insertBefore(w,row.nextSibling);
  $('sndPack').onchange=function(){var c2=cfg();c2.pack=this.value;setCfg(c2);play('right',{n:1})};
  var v=$('sndVol');v.oninput=function(){var c2=cfg();c2.vol=+v.value/100;setCfg(c2);$('sndVolV').textContent=v.value+'%'};v.onchange=function(){play('right',{n:1})};
  [].forEach.call(w.querySelectorAll('[data-i]'),function(b){b.onclick=function(){var x=TRY[+b.getAttribute('data-i')];if(S.sound===false){b.blur();var s=$('sndSel');if(s){s.focus()}try{toast('🔇','Sound effects are off','Turn them on in the box above')}catch(e){}return}play(x[0],x[2]);b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}})}
 var rr=renderReview;renderReview=function(){var r=rr.apply(this,arguments);try{rows()}catch(e){}return r};
 var st=document.createElement('style');st.textContent='.sndtry{align-items:flex-start}.sndbtns{display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0}.sndbtns button{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:6px 10px;cursor:pointer}.sndbtns button:hover{border-color:var(--accent)}.sndbtns button.on{animation:sndp .35s}@keyframes sndp{40%{transform:scale(.93);border-color:var(--accent);background:var(--accent-bg,var(--soft))}}@media (prefers-reduced-motion:reduce){.sndbtns button.on{animation:none}}';document.head.appendChild(st);

 /* render a sound offline (used by the tests) */
 function render(k,o,pk,secs){var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;var a=new OC(2,Math.floor(44100*(secs||3)),44100),B=mk(a,cfg().vol);NB=null;play(k,o,pk,B);return a.startRendering()}
 function use(k){if(!owned(k))return false;var c=cfg();c.pack=k;setCfg(c);var sel=document.getElementById('sndPack');if(sel)sel.value=k;return true}
 return {play:play,cfg:cfg,set:setCfg,packs:PK,use:use,owned:owned,_render:render}})();
try{window.SND=SND}catch(e){}
/* ===== sounds end ===== */
