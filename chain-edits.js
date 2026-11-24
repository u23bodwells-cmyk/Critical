/* Chain edits: short, beat-synced "edits" drawn on a canvas, with music synthesised live (no audio files).
   Each edit is a list of shots laid out on a beat grid. The engine handles cuts, punch zooms, shakes, flashes,
   glitches, word-by-word captions and a drop. Used by chain.html. */
(function(){
"use strict";
var WIN=window;

/* ================= audio ================= */
var AU={c:null,m:null,nz:null,sh:null};
function unlock(){
  try{
    if(!AU.c){
      var C=WIN.AudioContext||WIN.webkitAudioContext;if(!C)return Promise.resolve(false);
      var c=new C();AU.c=c;
      var comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=6;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.12;
      var g=c.createGain();g.gain.value=.7;g.connect(comp);comp.connect(c.destination);AU.m=g;
      var b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nz=b;
      var ws=c.createWaveShaper(),cu=new Float32Array(256);for(var j=0;j<256;j++)cu[j]=Math.tanh((j/128-1)*3);ws.curve=cu;ws.connect(g);AU.sh=ws;
    }
    if(AU.c.state!=="running")return AU.c.resume().then(function(){return on()},function(){return false});
  }catch(e){return Promise.resolve(false)}
  return Promise.resolve(true);
}
function on(){return!!(AU.c&&AU.c.state==="running")}
function eg(t,a,pk,d){var g=AU.c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);return g}
function osc(type,f,t,dur,dest){var o=AU.c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(dest);o.start(t);o.stop(t+dur+.05);return o}
function nz(t,d,type,f,q,v){var s=AU.c.createBufferSource();s.buffer=AU.nz;var fl=AU.c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);fl.Q.value=q;var g=eg(t,.001,v,d);s.connect(fl);fl.connect(g);g.connect(AU.m);s.start(t,Math.random()*.8);s.stop(t+d+.05);return fl}
function kick(t,v){var g=eg(t,.002,v||1,.3);g.connect(AU.m);var o=osc("sine",160,t,.35,g);o.frequency.exponentialRampToValueAtTime(40,t+.11)}
function hat(t,open,v){nz(t,open?.16:.035,"highpass",open?7000:9000,.7,v||(open?.12:.09))}
function clap(t,v){v=v||.45;for(var i=0;i<3;i++)nz(t+i*.011,.02,"bandpass",1400,1.2,v*.7);nz(t+.03,.18,"bandpass",1200,.9,v)}
function bell(t,f,v){var bp=AU.c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=f*1.4;bp.Q.value=2.5;var g=eg(t,.002,v||.13,.22);bp.connect(g);g.connect(AU.m);osc("square",f,t,.3,bp);osc("square",f*1.483,t,.3,bp)}
function b808(t,f,d,v){var g=eg(t,.004,v||.55,d);g.connect(AU.sh);var o=osc("sine",f*1.6,t,d+.1,g);o.frequency.exponentialRampToValueAtTime(f,t+.04)}
function sub(t,f,d,v){var g=eg(t,.004,v||.35,d);g.connect(AU.m);osc("sine",f,t,d,g)}
function stab(t,fs,d,v){var lp=AU.c.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(3200,t);lp.frequency.exponentialRampToValueAtTime(700,t+d);var g=eg(t,.003,v||.07,d);lp.connect(g);g.connect(AU.m);fs.forEach(function(f){osc("sawtooth",f,t,d,lp);osc("sawtooth",f*1.006,t,d,lp)})}
function impact(t){var g=eg(t,.003,1,.9);g.connect(AU.m);var o=osc("sine",120,t,1,g);o.frequency.exponentialRampToValueAtTime(30,t+.8);nz(t,.5,"lowpass",900,.7,.6);nz(t,1.3,"highpass",5000,.5,.13)}
function thud(t){var g=eg(t,.002,.8,.35);g.connect(AU.m);var o=osc("sine",90,t,.4,g);o.frequency.exponentialRampToValueAtTime(40,t+.3);nz(t,.15,"lowpass",1500,.7,.4)}
function riser(t,d){var s=AU.c.createBufferSource();s.buffer=AU.nz;s.loop=true;var f=AU.c.createBiquadFilter();f.type="bandpass";f.Q.value=1.5;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(7000,t+d);var g=AU.c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+d);g.gain.setValueAtTime(.0001,t+d+.01);s.connect(f);f.connect(g);g.connect(AU.m);s.start(t);s.stop(t+d+.05)}
function whoosh(t){var f=nz(t,.28,"bandpass",500,1.2,.16);f.frequency.exponentialRampToValueAtTime(3500,t+.25)}
function tick(t){bell(t,1760,.09)}
function sfx(k){if(!API.sound||!on())return;var t=AU.c.currentTime+.01,g;
  if(k==="ok"){g=eg(t,.003,.16,.12);g.connect(AU.m);osc("sine",880,t,.14,g);g=eg(t+.07,.003,.16,.18);g.connect(AU.m);osc("sine",1320,t+.07,.2,g)}
  else if(k==="no"){var lp=AU.c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=900;g=eg(t,.003,.18,.25);lp.connect(g);g.connect(AU.m);osc("square",140,t,.28,lp);osc("square",147,t,.28,lp)}
  else if(k==="pop"){g=eg(t,.002,.12,.08);g.connect(AU.m);var o=osc("sine",500,t,.1,g);o.frequency.exponentialRampToValueAtTime(1200,t+.08)}}

var PH_MEL=[0,null,0,null,3,null,0,-2,null,-2,null,-4,-5,null,-4,null,0,null,0,null,3,null,5,3,null,0,null,-2,-4,null,-5,null];
var PH_BASS=[0,0,-4,-5],HY_CH=[[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]];
function st(f,n){return f*Math.pow(2,n/12)}
function music(E,s,t){
  var bar=Math.floor(s/16),q=s%16,beat=Math.floor(s/4),pre=beat<E.dropBeat,root=E.root,sp=E.step;
  if(E.style==="phonk"){
    if(!pre&&(q===0||q===7||q===10)){kick(t,.95);b808(t,st(root/4,PH_BASS[bar%4]),q===7?.18:.32)}
    if(q===8)clap(t,pre?.3:.45);
    if(q%2===0)hat(t,false,pre?.06:.09);
    if(bar%2===1&&q>=12)hat(t+sp/2,false,.06);
    var m=PH_MEL[s%32];if(m!=null)bell(t,st(root*2,m),pre?.08:.12);
  }else{
    var ch=HY_CH[bar%4];
    if(!pre&&q%4===0)kick(t,1);
    if(!pre&&(q===4||q===12))clap(t,.4);
    if(q%4===2)hat(t,true,pre?.06:.1);else if(q%2===1&&!pre)hat(t,false,.05);
    if(!pre&&q%4===2)sub(t,st(root/2,ch[0]),sp*1.6,.4);
    if(q===0||q===3||q===6||q===10||q===12)stab(t,ch.map(function(n){return st(root,n+12)}),sp*1.8,pre?.04:.065);
  }
  var ev=E.evs[s];
  if(ev)ev.forEach(function(k){if(k==="impact")impact(t);else if(k==="riser")riser(t,sp*12);else if(k==="whoosh")whoosh(t);else if(k==="thud")thud(t);else if(k==="tick")tick(t)});
}
var CUR=null;
setInterval(function(){
  var P=CUR;if(!P||!P.E.playing||!on()||!API.sound||P.E.clk!=="a")return;
  var E=P.E,now=AU.c.currentTime,ahead=now+.15;
  for(var guard=0;guard<64;guard++){var tc=E.sync+(E.next*E.step-E.base);if(tc>ahead)break;if(tc>=now-.02)try{music(E,E.next%E.steps,Math.max(tc,now))}catch(e){}E.next++}
},25);

/* ================= drawing helpers ================= */
var PAL={fire:["#ff3b30","#1f0000"],ice:["#3ad4ff","#00131f"],toxic:["#9cff3a","#061200"],violet:["#a06bff","#0e0024"],gold:["#F2C46D","#170e00"],
  mono:["#ffffff","#050505"],pink:["#ff3b8d","#1f000d"],blue:["#3a8bff","#000a22"],sepia:["#e0b27a","#160d04"],teal:["#2ee6b8","#001a14"]};
var haveAnton=false,FIT=new Map(),CACHE=new WeakMap(),G={gl:0};
function cl(v){return v<0?0:v>1?1:v}
function eo(t){t=cl(t);return 1-Math.pow(1-t,3)}
function eoe(t){t=cl(t);return t>=1?1:1-Math.pow(2,-10*t)}
function eio(t){t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function hexA(h,a){h=h.replace("#","");if(h.length===3)h=h.replace(/./g,"$&$&");var n=parseInt(h,16);return"rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a+")"}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function cache(s,fn){var v=CACHE.get(s);if(!v){v=fn();CACHE.set(s,v)}return v}
function fnt(sz,kind){return kind==="s"?"800 "+sz+"px system-ui,-apple-system,'Segoe UI',Roboto,sans-serif":haveAnton?"400 "+sz+"px Anton,Impact,sans-serif":"900 "+sz+"px Impact,'Arial Black',system-ui,sans-serif"}
function fit(x,lines,maxW,maxH,kind,max){
  var key=(kind||"a")+"|"+(maxW|0)+"|"+(maxH|0)+"|"+(max||0)+"|"+lines.join("\n");if(FIT.has(key))return FIT.get(key);
  var sz=max||220,lh=kind==="s"?1.15:1.04;
  for(;sz>10;sz-=Math.max(1,Math.round(sz*.05))){x.font=fnt(sz,kind);var w=0;for(var i=0;i<lines.length;i++)w=Math.max(w,x.measureText(lines[i]).width);if(w<=maxW&&lines.length*sz*lh<=maxH)break}
  if(FIT.size>800)FIT.clear();FIT.set(key,sz);return sz;
}
function text(g,txt,cx,cy,maxW,maxH,o){
  o=o||{};var x=g.x,lines=String(txt).split("\n"),sz=o.size||fit(x,o.fitTo?String(o.fitTo).split("\n"):lines,maxW,maxH,o.kind,o.max);
  x.font=fnt(sz,o.kind);x.textAlign=o.align||"center";x.textBaseline="middle";
  var lh=sz*(o.kind==="s"?1.15:1.04),y0=cy-(lines.length-1)*lh/2;
  for(var i=0;i<lines.length;i++){var l=lines[i],y=y0+i*lh;
    if(o.glitch){x.globalCompositeOperation="lighter";x.fillStyle="rgba(255,0,60,.85)";x.fillText(l,cx-o.glitch,y);x.fillStyle="rgba(0,220,255,.85)";x.fillText(l,cx+o.glitch,y);x.globalCompositeOperation="source-over"}
    if(o.stroke!==false){x.lineJoin="round";x.lineWidth=Math.max(3,sz*.1);x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(l,cx,y)}
    x.fillStyle=o.col||"#fff";x.fillText(l,cx,y)}
  return sz;
}
function wrap(x,txt,maxW){var out=[];String(txt).split("\n").forEach(function(par){var line="";par.split(" ").forEach(function(w){var t=line?line+" "+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t});out.push(line)});return out}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function fmt(v,dec){return v.toLocaleString("en-GB",{minimumFractionDigits:dec,maximumFractionDigits:dec})}
var GRAIN=null;
function grain(x){if(!GRAIN){var c=document.createElement("canvas");c.width=c.height=128;var gx=c.getContext("2d"),im=gx.createImageData(128,128);for(var i=0;i<im.data.length;i+=4){var v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}gx.putImageData(im,0,0);GRAIN=x.createPattern(c,"repeat")}return GRAIN}

function bg(g,pal,p,t){var x=g.x,W=g.W,H=g.H,cx=g.cx,cy=H*.42,R=Math.max(W,H);
  x.fillStyle=pal[1];x.fillRect(0,0,W,H);
  var r=x.createRadialGradient(cx,cy,0,cx,cy,R*.8);r.addColorStop(0,hexA(pal[0],.38+.22*p));r.addColorStop(1,hexA(pal[0],0));x.fillStyle=r;x.fillRect(0,0,W,H);
  x.save();x.translate(cx,cy);x.rotate(t*.15);x.fillStyle=hexA(pal[0],.05+.05*p);
  for(var i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,0);x.lineTo(R*1.2,-R*.09);x.lineTo(R*1.2,R*.09);x.closePath();x.fill()}
  x.restore();
}
function post(g,p,t){var x=g.x,W=g.W,H=g.H;
  var v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,"+(.55-.15*p)+")");x.fillStyle=v;x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=.06;x.translate(-Math.random()*128,-Math.random()*128);x.fillStyle=grain(x);x.fillRect(0,0,W+128,H+128);x.restore();
}
function slices(g){var x=g.x,d=g.dpr,W=g.W,H=g.H;for(var k=0;k<5;k++){var y=Math.random()*H,h=Math.random()*H*.06+4,dx=(Math.random()-.5)*G.gl*7;try{x.drawImage(g.cv,0,y*d,W*d,h*d,dx,y,W,h)}catch(e){}}}
function caption(g,cap,u,y){var x=g.x,ws=cap.split(" "),n=ws.length,ci=Math.min(n-1,Math.floor(cl(u/.88)*n)),s0=Math.floor(ci/3)*3,chunk=ws.slice(s0,s0+3),sz=Math.min(g.cw*.085,32);
  x.font=fnt(sz,"s");var sp=sz*.3,tw=0,wd=chunk.map(function(w){var m=x.measureText(w).width;tw+=m;return m});tw+=sp*(chunk.length-1);
  if(tw>g.cw*.95){sz*=g.cw*.95/tw;x.font=fnt(sz,"s");tw=0;wd=chunk.map(function(w){var m=x.measureText(w).width;tw+=m;return m});sp=sz*.3;tw+=sp*(chunk.length-1)}
  var X=g.cx-tw/2,Y=g.H*y,wordU=(cl(u/.88)*n)-ci;x.textAlign="left";x.textBaseline="middle";x.lineJoin="round";
  chunk.forEach(function(w,i){var cur=s0+i===ci,sc=cur?1+.14*Math.exp(-10*wordU):1;x.save();x.translate(X+wd[i]/2,Y);x.scale(sc,sc);x.lineWidth=sz*.24;x.strokeStyle="#000";x.strokeText(w,-wd[i]/2,0);x.fillStyle=cur?"#FFE14D":"#fff";x.fillText(w,-wd[i]/2,0);x.restore();X+=wd[i]+sp});
}
function watermark(g,f){var x=g.x,H=g.H,right=f>.5;x.font="700 12px system-ui,sans-serif";x.textBaseline="middle";x.textAlign=right?"right":"left";x.fillStyle="rgba(255,255,255,.55)";x.fillText("♪ Critical",right?g.cx+g.cw/2-6:g.cx-g.cw/2+6,right?H*.8:Math.max(H*.105,74))}

/* ================= shot types ================= */
var CAPY={versus:.85,qtimer:0,qreveal:0,tfq:0,quote:0,decay:.76};
var D={};
D.slam=function(g,s,u,bt,p,pal){var x=g.x,H=g.H;
  if(s.strobe&&Math.floor(bt*4)%2===0){x.fillStyle="rgba(255,0,0,.3)";x.fillRect(0,0,g.W,H)}
  var sc=1+1.4*Math.exp(-16*bt);x.save();x.translate(g.cx,H*.42);x.scale(sc,sc);text(g,s.txt,0,0,g.cw*.88,H*.32,{col:s.col||"#fff",glitch:G.gl});x.restore();
  if(s.sub&&bt>.35){var a=cl((bt-.35)*4);x.globalAlpha=a;text(g,s.sub,g.cx,H*.62+(1-a)*16,g.cw*.86,H*.06,{kind:"s",col:pal[0],max:28});x.globalAlpha=1}};
D.type=function(g,s,u,bt){var x=g.x,H=g.H,cw=g.cw*.9,sz=Math.min(g.cw*.1,44),lines;
  for(;sz>14;sz-=2){x.font=fnt(sz,"s");lines=wrap(x,s.txt,cw);if(lines.length*sz*1.2<=H*.36)break}
  var total=s.txt.length,n=Math.floor(total*cl(bt/(s.b*.6))),lh=sz*1.2,y0=H*.42-(lines.length-1)*lh/2,left=g.cx-cw/2,c=0,lx=left,ly=y0;
  x.textAlign="left";x.textBaseline="middle";x.lineJoin="round";
  lines.forEach(function(l,i){var y=y0+i*lh,show=l.slice(0,Math.max(0,n-c));c+=l.length+1;if(!show)return;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(show,left,y);x.fillStyle="#fff";x.fillText(show,left,y);lx=left+x.measureText(show).width;ly=y});
  if(n<total||Math.floor(bt*2.5)%2===0){x.fillStyle="#FFE14D";x.fillRect(lx+4,ly-sz*.5,Math.max(3,sz*.1),sz)}};
D.count=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,dec=s.dec||0,v=s.from+(s.to-s.from)*eoe(u/.7),fin=(s.pre||"")+fmt(s.to,dec);
  if(s.lbl)text(g,s.lbl,g.cx,H*.27,g.cw*.9,H*.06,{kind:"s",col:pal[0],max:28});
  var sc=u>=.7?1+.3*Math.exp(-12*(bt-.7*s.b)):1+.03*p;x.save();x.translate(g.cx,H*.42);x.scale(sc,sc);text(g,(s.pre||"")+fmt(v,dec),0,0,g.cw*.9,H*.2,{fitTo:fin,glitch:G.gl});x.restore();
  if(s.unit)text(g,s.unit,g.cx,H*.555,g.cw*.86,H*.07,{col:pal[0]})};
function nucleus(x,cx,cy,R,n){for(var i=0;i<n;i++){var r=R*.85*Math.sqrt((i+.5)/n),a=i*2.39996;x.beginPath();x.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,R*.3,0,7);x.fillStyle=i%2?"#ff5a4f":"#a9bdd2";x.fill();x.strokeStyle="rgba(0,0,0,.35)";x.lineWidth=1;x.stroke()}}
D.atom=function(g,s,u,bt,p,pal,t){var x=g.x,H=g.H,cx=g.cx,cy=H*.42,R=Math.min(g.cw,H*.5)*.14*(1+.05*p),sb=s.split?(s.at||.5)*s.b:1e9,k=bt-sb,oR=Math.min(g.cw*.47,H*.3);
  if(s.lbl)text(g,s.lbl,g.cx,H*.17,g.cw*.9,H*.07,{col:pal[0]});
  for(var o=0;o<3;o++){x.save();x.translate(cx,cy);x.rotate(o*Math.PI/3+(k>0?k*.8:0));var al=k>0?.4*Math.max(0,1-k):.4;x.strokeStyle=hexA(pal[0],al);x.lineWidth=1.5;x.beginPath();x.ellipse(0,0,oR,oR*.33,0,0,7);x.stroke();
    if(al>.02){var a=t*(2.4+o*.5)+o*2;x.globalAlpha=al/.4;x.fillStyle="#fff";x.shadowColor=pal[0];x.shadowBlur=12;x.beginPath();x.arc(Math.cos(a)*oR,Math.sin(a)*oR*.33,4,0,7);x.fill();x.shadowBlur=0;x.globalAlpha=1}x.restore()}
  if(k>0){var sep=g.cw*.32*eo(k/1.1),rot=k*1.5;
    x.save();x.translate(cx-sep,cy-sep*.25);x.rotate(-rot);nucleus(x,0,0,R*.75,9);x.restore();
    x.save();x.translate(cx+sep,cy+sep*.25);x.rotate(rot);nucleus(x,0,0,R*.75,9);x.restore();
    [-.5,.35,2.6].forEach(function(a){var d=k*g.cw*.9;x.strokeStyle="rgba(255,255,255,.7)";x.lineWidth=2;x.beginPath();x.moveTo(cx+Math.cos(a)*(d-30),cy+Math.sin(a)*(d-30));x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d);x.stroke();x.fillStyle="#fff";x.beginPath();x.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,4,0,7);x.fill()});
    x.strokeStyle="rgba(255,255,255,"+Math.max(0,.8-k*.6)+")";x.lineWidth=4;x.beginPath();x.arc(cx,cy,R+k*g.W,0,7);x.stroke();
    x.fillStyle="rgba(255,255,255,"+(.95*Math.exp(-6*k))+")";x.fillRect(0,0,g.W,H);
  }else nucleus(x,cx,cy,R,18);
  if(s.split||s.hit){var arr=s.split?sb:s.b;if(bt<arr){var q=eo(bt/arr),nx=cx-g.W*.65+(g.W*.65-R)*q;x.strokeStyle="rgba(255,255,255,.4)";x.lineWidth=3;x.beginPath();x.moveTo(nx-50,cy);x.lineTo(nx,cy);x.stroke();x.fillStyle="#fff";x.shadowColor="#fff";x.shadowBlur=16;x.beginPath();x.arc(nx,cy,6,0,7);x.fill();x.shadowBlur=0;x.font="700 12px system-ui";x.textAlign="center";x.fillText("neutron",nx,cy-16)}}};
D.chain=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,cx=g.cx,cy=H*.45;
  var tr=cache(s,function(){var r=rng(11),nodes=[{x:0,y:0,g:0,p:-1,a:0}],gen=[0],Rg=[40];
    for(var G2=1;G2<=5;G2++){var nxt=[],mx=0;gen.forEach(function(pi){var pa=nodes[pi],m=r()<.45?3:2;for(var c=0;c<m&&nodes.length<130;c++){var ang=pa.g===0?r()*.5+c*6.283/m:pa.a+(c-(m-1)/2)*.75+(r()-.5)*.35,d=34+r()*16,n={x:pa.x+Math.cos(ang)*d,y:pa.y+Math.sin(ang)*d,g:G2,p:pi,a:ang};nodes.push(n);nxt.push(nodes.length-1);mx=Math.max(mx,Math.hypot(n.x,n.y))}});gen=nxt;Rg.push(Math.max(mx,Rg[Rg.length-1]))}
    return{n:nodes,R:Rg}});
  var gp=bt/(s.b/6),gi=Math.min(4,Math.floor(gp)),f=cl(gp-gi),rad=tr.R[gi]+(tr.R[gi+1]-tr.R[gi])*eio(f),sc=Math.min(g.cw,H*.55)*.47/rad,cnt=0;
  x.save();x.translate(cx,cy);x.scale(sc,sc);x.lineCap="round";
  tr.n.forEach(function(n){if(n.g<1)return;var q=cl(gp-(n.g-1));if(q<=0)return;var P=tr.n[n.p],ex=P.x+(n.x-P.x)*q,ey=P.y+(n.y-P.y)*q;x.strokeStyle=hexA(pal[0],.55);x.lineWidth=2/sc*1.2;x.beginPath();x.moveTo(P.x,P.y);x.lineTo(ex,ey);x.stroke();if(q<1){x.fillStyle="#fff";x.beginPath();x.arc(ex,ey,3/sc*1.4,0,7);x.fill()}});
  tr.n.forEach(function(n){if(gp<n.g)return;cnt++;var age=gp-n.g;if(age<1.2){x.fillStyle="rgba(255,255,255,"+(.85*Math.exp(-3*age))+")";x.beginPath();x.arc(n.x,n.y,(6+age*22)/Math.sqrt(sc),0,7);x.fill()}x.fillStyle="#F2C46D";x.beginPath();x.arc(n.x,n.y,5/sc*1.3,0,7);x.fill()});
  x.restore();
  text(g,"GEN "+gi+" · "+cnt+" FISSIONS",g.cx,H*.16,g.cw*.9,H*.06,{fitTo:"GEN 5 · 888 FISSIONS",col:pal[0]})};
D.versus=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,mid=H*.47,a=eo(bt*4);
  x.fillStyle=hexA(s.lc,.32);x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,mid-H*.04);x.lineTo(0,mid+H*.04);x.fill();
  x.fillStyle=hexA(s.rc,.28);x.beginPath();x.moveTo(0,mid+H*.04);x.lineTo(W,mid-H*.04);x.lineTo(W,H);x.lineTo(0,H);x.fill();
  x.strokeStyle="#fff";x.lineWidth=4;x.beginPath();x.moveTo(0,mid+H*.04);x.lineTo(W*a,mid+H*.04-H*.08*a);x.stroke();
  var t2=Math.min(1,s.b*.3),t3=Math.min(2,s.b*.55),k1=cl(bt*4),k3=cl((bt-t3)*4),k2=bt-t2;
  if(k1>0){x.globalAlpha=k1;text(g,s.l,g.cx-(1-eo(k1))*W*.6,H*.25,g.cw*.86,H*.15,{col:s.lc});if(s.ls)text(g,s.ls,g.cx,H*.355,g.cw*.8,H*.05,{kind:"s",max:24});x.globalAlpha=1}
  if(k3>0){x.globalAlpha=k3;text(g,s.r,g.cx+(1-eo(k3))*W*.6,H*.6,g.cw*.86,H*.15,{col:s.rc});if(s.rs)text(g,s.rs,g.cx,H*.705,g.cw*.8,H*.05,{kind:"s",max:24});x.globalAlpha=1}
  if(k2>0){var sc=1+1.6*Math.exp(-14*k2),r=Math.min(g.cw,H)*.085*sc;x.fillStyle="#FFE14D";x.beginPath();x.arc(g.cx,mid,r,0,7);x.fill();x.lineWidth=4;x.strokeStyle="#000";x.stroke();text(g,"VS",g.cx,mid+1,r*1.3,r*1.1,{col:"#000",stroke:false})}};
D.list=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,per=s.per||1,n=s.items.length,i=Math.min(n-1,Math.floor(bt/per)),k=bt-i*per,a=eo(k*5);
  if(i>0&&k<.2){var b=eo(k*5);x.globalAlpha=1-b;text(g,s.items[i-1],g.cx-b*W*.8,H*.42,g.cw*.88,H*.24);x.globalAlpha=1}
  var dx=(1-a)*W*.8;if(a<1)for(var m=3;m>0;m--){x.globalAlpha=.12*m;text(g,s.items[i],g.cx+dx+m*22*(1-a),H*.42,g.cw*.88,H*.24,{stroke:false})}
  x.globalAlpha=1;var sc=1+.12*Math.exp(-12*k);x.save();x.translate(g.cx+dx,H*.42);x.scale(sc,sc);text(g,s.items[i],0,0,g.cw*.88,H*.24,{col:i===n-1&&s.last?s.last:"#fff",glitch:G.gl});x.restore();
  var dw=14,sx=g.cx-(n-1)*dw/2;for(var d=0;d<n;d++){x.fillStyle=d<=i?pal[0]:"rgba(255,255,255,.25)";x.beginPath();x.arc(sx+d*dw,H*.6,d===i?5:3.5,0,7);x.fill()}};
D.decay=function(g,s,u,bt,p,pal){var x=g.x,H=g.H;
  var ord=cache(s,function(){var r=rng(3),a=[],rank=[];for(var i=0;i<100;i++)a.push(i);for(i=99;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}a.forEach(function(v,i){rank[v]=i});return rank});
  var k=Math.min(6,Math.floor(bt)),nk=Math.floor(100/Math.pow(2,k)),np=k?Math.floor(100/Math.pow(2,k-1)):100,f=bt-k,box=Math.min(g.cw*.78,H*.32),cs=box/10,x0=g.cx-box/2,y0=H*.48-box/2;
  for(var i=0;i<100;i++){var r=ord[i],cx=x0+(i%10+.5)*cs,cy=y0+(Math.floor(i/10)+.5)*cs;x.beginPath();
    if(r<nk){x.fillStyle=pal[0];x.arc(cx,cy,cs*.36*(1+.1*p),0,7)}else if(r<np&&f<.5){var q=f/.5;x.fillStyle="rgba(255,90,80,"+(1-q)+")";x.arc(cx,cy,cs*.36*(1+q),0,7)}else{x.fillStyle="rgba(255,255,255,.08)";x.arc(cx,cy,cs*.18,0,7)}x.fill()}
  var sc=1+.3*Math.exp(-10*f);x.save();x.translate(g.cx,H*.2);x.scale(sc,sc);text(g,String(nk),0,0,g.cw*.5,H*.11,{fitTo:"100"});x.restore();
  text(g,k+" HALF-LI"+(k===1?"FE":"VES"),g.cx,H*.67,g.cw*.8,H*.05,{col:pal[0],fitTo:"8 HALF-LIVES"})};
D.gauge=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,v=s.calm?(s.from+s.to)/2+(s.to-s.from)/2*Math.sin(bt*Math.PI/2):s.from+(s.to-s.from)*u*u,hot=v>=90;
  if(hot&&Math.floor(bt*4)%2===0){x.fillStyle="rgba(255,0,0,.3)";x.fillRect(0,0,W,H)}
  if(s.lbl)text(g,s.lbl,g.cx,H*.24,g.cw*.9,H*.05,{kind:"s",col:pal[0],max:26});
  text(g,Math.round(v)+"%",g.cx,H*.39,g.cw*.8,H*.17,{fitTo:"100%",col:hot?"#ff4d4d":"#fff"});
  var bx=g.cx-g.cw*.42,bw=g.cw*.84,by=H*.52,bh=18;x.fillStyle="rgba(255,255,255,.12)";rr(x,bx,by,bw,bh,9);x.fill();
  x.fillStyle="rgba(255,60,60,.35)";x.fillRect(bx+bw*90/110,by,bw*20/110,bh);
  if(s.calm){x.fillStyle="rgba(63,217,154,.35)";x.fillRect(bx+bw*(s.from-3)/110,by,bw*(s.to-s.from+6)/110,bh)}
  x.fillStyle=hot?"#ff4d4d":pal[0];rr(x,bx,by,Math.max(bh,bw*Math.min(1,v/110)),bh,9);x.fill();
  if(hot&&Math.floor(bt*2)%2===0)text(g,"⚠ HIGH POWER",g.cx,H*.6,g.cw*.8,H*.05,{kind:"s",col:"#ff6b6b",max:26})};
D.zoom=function(g,s,u,bt,p,pal,t){var x=g.x,W=g.W,H=g.H,cx=g.cx,cy=H*.44,e=eio(u/.85),m=Math.min(g.cw,H),Fs=m*.33,Fe=m*.44/1e5,F=Math.exp(Math.log(Fs)+(Math.log(Fe)-Math.log(Fs))*e),ar=1e5*F;
  if(ar<4*W){var cg=x.createRadialGradient(cx,cy,0,cx,cy,ar);cg.addColorStop(0,hexA(pal[0],.03));cg.addColorStop(.85,hexA(pal[0],.12));cg.addColorStop(1,hexA(pal[0],0));x.fillStyle=cg;x.beginPath();x.arc(cx,cy,ar,0,7);x.fill();
    x.strokeStyle=hexA(pal[0],.6);x.lineWidth=2;x.setLineDash([6,8]);x.beginPath();x.arc(cx,cy,ar,0,7);x.stroke();x.setLineDash([]);
    for(var k=0;k<3;k++){var a=t*1.4+k*2.1;x.fillStyle="#fff";x.beginPath();x.arc(cx+Math.cos(a)*ar,cy+Math.sin(a)*ar,4,0,7);x.fill()}}
  if(F>8)nucleus(x,cx,cy,F,18);else{var gl=x.createRadialGradient(cx,cy,0,cx,cy,14);gl.addColorStop(0,"#fff");gl.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gl;x.beginPath();x.arc(cx,cy,14,0,7);x.fill()}
  text(g,"ZOOM ×"+fmt(Math.round(Fs/F),0),g.cx,H*.18,g.cw*.9,H*.06,{fitTo:"ZOOM ×88,888,888",col:pal[0]});
  if(F>30)text(g,"NUCLEUS",g.cx,Math.min(H*.7,cy+F*.95+30),g.cw*.6,H*.06,{});
  if(ar<g.cw*.75){text(g,"ATOM",g.cx,cy-ar-26,g.cw*.5,H*.06,{col:pal[0]});text(g,"↑ nucleus is that dot",g.cx,cy+26,g.cw*.8,H*.04,{kind:"s",max:18})}};
D.glow=function(g,s,u,bt,p,pal,t){var x=g.x,W=g.W,H=g.H,cy=H*.46;x.fillStyle="#000814";x.fillRect(0,0,W,H);
  var r=x.createRadialGradient(g.cx,cy,0,g.cx,cy,Math.max(W,H)*.6);r.addColorStop(0,"rgba(130,200,255,"+(.85+.15*p)+")");r.addColorStop(.35,"rgba(40,110,255,.55)");r.addColorStop(1,"rgba(0,20,60,0)");x.fillStyle=r;x.fillRect(0,0,W,H);
  var n=4,sz=Math.min(g.cw,H*.5)*.8/n,x0=g.cx-sz*n/2,y0=cy-sz*n/2;for(var i=0;i<n;i++)for(var j=0;j<n;j++){x.fillStyle="rgba(4,12,30,.82)";x.fillRect(x0+i*sz+5,y0+j*sz+5,sz-10,sz-10);x.strokeStyle="rgba(160,215,255,.6)";x.lineWidth=1;x.strokeRect(x0+i*sz+5,y0+j*sz+5,sz-10,sz-10)}
  for(var b=0;b<40;b++){var bx=((b*97)%100)/100*W+Math.sin(t*1.3+b)*8,by=H-((t*40*(.5+(b%5)/5)+b*53)%(H+20));x.fillStyle="rgba(200,230,255,.35)";x.beginPath();x.arc(bx,by,1.5+(b%3),0,7);x.fill()}
  if(s.txt){var sc=1+1.2*Math.exp(-16*bt);x.save();x.translate(g.cx,H*.42);x.scale(sc,sc);text(g,s.txt,0,0,g.cw*.88,H*.26,{glitch:G.gl});x.restore()}};
D.quote=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,sz=Math.min(g.cw*.085,36),lines,ff=function(z){return"italic 700 "+z+"px Georgia,'Times New Roman',serif"};
  for(;sz>12;sz--){x.font=ff(sz);lines=wrap(x,s.txt,g.cw*.88);if(lines.length*sz*1.3<=H*.42)break}
  var nw=s.txt.split(/\s+/).length,show=Math.ceil(nw*cl(u/.7)),c=0,lh=sz*1.3,y0=H*.42-(lines.length-1)*lh/2;x.textBaseline="middle";x.textAlign="left";x.lineJoin="round";
  lines.forEach(function(l,i){var ws=l.split(" "),w=x.measureText(l).width,X=g.cx-w/2,y=y0+i*lh;ws.forEach(function(wd,j){if(c+j<show){x.lineWidth=sz*.14;x.strokeStyle="rgba(0,0,0,.8)";x.strokeText(wd,X,y);x.fillStyle="#fff";x.fillText(wd,X,y)}X+=x.measureText(wd+" ").width});c+=ws.length});
  if(u>.72&&s.who){x.globalAlpha=cl((u-.72)*6);text(g,"— "+s.who,g.cx,y0+lines.length*lh+14,g.cw*.8,H*.05,{kind:"s",col:pal[0],max:22});x.globalAlpha=1}
  x.fillStyle="#000";x.fillRect(0,0,W,H*.11);x.fillRect(0,H*.89,W,H*.11)};
D.stamp=function(g,s,u,bt,p,pal){var x=g.x,H=g.H;if(s.under){x.globalAlpha=.32;text(g,s.under,g.cx,H*.42,g.cw*.86,H*.3);x.globalAlpha=1}
  var sc=bt<.15?1+3*(1-bt/.15):1;x.save();x.translate(g.cx,H*.42);x.rotate(-.21);x.scale(sc,sc);x.globalAlpha=bt<.15?bt/.15:1;
  var sz=fit(x,[s.txt],g.cw*.6,H*.15,"a");x.font=fnt(sz,"a");var w=x.measureText(s.txt).width,pd=sz*.22,hh=sz*1.2;
  x.fillStyle=hexA(s.col,.14);x.fillRect(-w/2-pd,-hh/2,w+pd*2,hh);x.strokeStyle=s.col;x.lineWidth=Math.max(5,sz*.08);x.strokeRect(-w/2-pd,-hh/2,w+pd*2,hh);x.lineWidth=2;x.strokeRect(-w/2-pd+9,-hh/2+9,w+pd*2-18,hh-18);
  x.fillStyle=s.col;x.textAlign="center";x.textBaseline="middle";x.fillText(s.txt,0,sz*.04);x.restore();x.globalAlpha=1};
D.year=function(g,s,u,bt,p,pal,t){var x=g.x,W=g.W,H=g.H,y=s.y,out="";for(var i=0;i<y.length;i++)out+=bt<.22*(i+1)?String((Math.floor(bt*24)*7+i*13)%10):y[i];
  x.globalAlpha=.82+.18*Math.abs(Math.sin(t*37));text(g,out,g.cx,H*.4,g.cw*.86,H*.22,{fitTo:"8888",col:pal[0]});x.globalAlpha=1;
  if(s.sub&&bt>1){var n=Math.floor(s.sub.length*cl((bt-1)*2));text(g,s.sub.slice(0,n),g.cx,H*.54,g.cw*.86,H*.05,{kind:"s",fitTo:s.sub,max:26})}
  x.strokeStyle="rgba(255,240,220,.12)";x.lineWidth=1;for(var k=0;k<3;k++){var sx=(Math.sin(t*13+k*5)*.5+.5)*W;x.beginPath();x.moveTo(sx,0);x.lineTo(sx+3,H);x.stroke()}};
D.rings=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,cy=H*.4,R=Math.min(g.cw,H)*.2;
  for(var k=0;k<=Math.floor(bt);k++){var a=bt-k;if(a>2)continue;x.strokeStyle=hexA(pal[0],Math.max(0,.7-a*.35));x.lineWidth=3;x.beginPath();x.arc(g.cx,cy,R+a*R*1.4,0,7);x.stroke()}
  var sc=(1+1.2*Math.exp(-16*bt))*(1+.07*p);x.save();x.translate(g.cx,cy);x.scale(sc,sc);x.font=Math.round(R*1.3)+"px system-ui,'Apple Color Emoji','Segoe UI Emoji',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(s.g,0,R*.05);x.restore();
  if(s.txt)text(g,s.txt,g.cx,H*.63,g.cw*.86,H*.09,{col:"#fff",glitch:G.gl})};
D.pellet=function(g,s,u,bt,p,pal,t){var x=g.x,H=g.H,cx=g.cx,cy=H*.47,w=Math.min(g.cw*.3,H*.15),h=w*1.15;
  var hl=x.createRadialGradient(cx,cy,0,cx,cy,w*2.4);hl.addColorStop(0,hexA(pal[0],.45+.3*p));hl.addColorStop(1,hexA(pal[0],0));x.fillStyle=hl;x.fillRect(cx-w*3,cy-w*3,w*6,w*6);
  x.save();x.translate(cx,cy);x.rotate(Math.sin(t*1.2)*.12);var gr=x.createLinearGradient(-w/2,0,w/2,0);gr.addColorStop(0,"#18181c");gr.addColorStop(.35,"#6e6e75");gr.addColorStop(.6,"#3a3a40");gr.addColorStop(1,"#121215");
  x.fillStyle=gr;x.fillRect(-w/2,-h/2,w,h);x.beginPath();x.ellipse(0,h/2,w/2,w*.17,0,0,Math.PI);x.fill();x.fillStyle="#5a5a61";x.beginPath();x.ellipse(0,-h/2,w/2,w*.17,0,0,7);x.fill();x.restore();
  text(g,"≈ 1 cm",cx+w*.95,cy,g.cw*.3,H*.04,{kind:"s",max:16,align:"left"});
  if(s.txt){var sc=1+1.2*Math.exp(-16*bt);x.save();x.translate(g.cx,H*.2);x.scale(sc,sc);text(g,s.txt,0,0,g.cw*.86,H*.1,{});x.restore()}};
function qlayout(g,s,reveal,p){var x=g.x,H=g.H,bw=g.cw*.92,left=g.cx-bw/2,sz=Math.min(g.cw*.075,30),lines;
  for(;sz>12;sz--){x.font=fnt(sz,"s");lines=wrap(x,s.q,bw);if(lines.length*sz*1.2<=H*.19)break}
  x.textAlign="center";x.textBaseline="middle";x.lineJoin="round";lines.forEach(function(l,i){var y=H*.21-(lines.length-1)*sz*.6+i*sz*1.2;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(l,g.cx,y);x.fillStyle="#fff";x.fillText(l,g.cx,y)});
  var oh=H*.07,gap=H*.014,y0=H*.42;
  s.opts.forEach(function(o,i){var y=y0+i*(oh+gap),ok=i===s.ans;x.globalAlpha=reveal&&!ok?.4:1;x.fillStyle=reveal&&ok?"rgba(46,200,130,.9)":"rgba(0,0,0,.45)";rr(x,left,y,bw,oh,14);x.fill();x.lineWidth=2;x.strokeStyle=reveal&&ok?"#7dffc4":"rgba(255,255,255,.3)";x.stroke();
    var fs=Math.min(oh*.42,20);x.font=fnt(fs,"s");var label=(reveal&&ok?"✓ ":"ABCD"[i]+"  ")+o;while(x.measureText(label).width>bw-24&&fs>10){fs--;x.font=fnt(fs,"s")}x.textAlign="left";x.fillStyle="#fff";x.fillText(label,left+14,y+oh/2);x.globalAlpha=1});}
D.qtimer=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,seg=s.b/3,i=Math.min(2,Math.floor(bt/seg)),k=(bt-i*seg)/seg,num=3-i,r=Math.min(g.cw,H)*.06,cy=H*.335;
  qlayout(g,s,false,p);x.strokeStyle="rgba(255,255,255,.2)";x.lineWidth=6;x.beginPath();x.arc(g.cx,cy,r,0,7);x.stroke();x.strokeStyle=num===1?"#ff4d4d":"#FFE14D";x.beginPath();x.arc(g.cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-k));x.stroke();
  var sc=1+.5*Math.exp(-12*k*seg);x.save();x.translate(g.cx,cy);x.scale(sc,sc);text(g,String(num),0,2,r*1.2,r*1.3,{col:num===1?"#ff4d4d":"#fff"});x.restore()};
D.qreveal=function(g,s,u,bt,p,pal){qlayout(g,s,true,p);var sc=1+1.2*Math.exp(-14*bt);g.x.save();g.x.translate(g.cx,g.H*.335);g.x.scale(sc,sc);text(g,"ANSWER",0,0,g.cw*.6,g.H*.06,{col:"#7dffc4"});g.x.restore()};
D.tfq=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,sz=Math.min(g.cw*.09,38),lines;for(;sz>12;sz--){x.font=fnt(sz,"s");lines=wrap(x,s.q,g.cw*.9);if(lines.length*sz*1.2<=H*.3)break}
  x.textAlign="center";x.textBaseline="middle";x.lineJoin="round";lines.forEach(function(l,i){var y=H*.36-(lines.length-1)*sz*.6+i*sz*1.2;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(l,g.cx,y);x.fillStyle="#fff";x.fillText(l,g.cx,y)});
  var at=s.b*.5;if(bt<at){var c=Math.ceil((at-bt)/(at/3));text(g,"…"+c,g.cx,H*.62,g.cw*.4,H*.08,{col:pal[0],fitTo:"…8"})}
  else{var k=bt-at,sc=k<.15?1+2.5*(1-k/.15):1,col=s.v?"#3fd99a":"#ff4d4d",tx=s.v?"TRUE":"FALSE";x.save();x.translate(g.cx,H*.62);x.rotate(-.16);x.scale(sc,sc);var z=fit(x,[tx],g.cw*.5,H*.1,"a");x.font=fnt(z,"a");var w=x.measureText(tx).width;x.strokeStyle=col;x.lineWidth=6;x.strokeRect(-w/2-14,-z*.62,w+28,z*1.2);x.fillStyle=col;x.textAlign="center";x.fillText(tx,0,z*.04);x.restore()}};

/* ================= player ================= */
function Player(el,def,hooks){
  var cv=el.querySelector(".ecv"),x=cv.getContext("2d"),g={x:x,cv:cv,W:0,H:0,cx:0,cw:0,dpr:1},bs=60/def.bpm,starts=[],tot=0,drop=-1;
  def.shots.forEach(function(s){starts.push(tot);if(s.drop&&drop<0)drop=tot;tot+=s.b});
  var E={style:def.style||"phonk",root:220*Math.pow(2,(def.key||0)/12),step:bs/4,steps:tot*4,dropBeat:drop<0?0:drop,evs:{},playing:false,base:0,sync:0,clk:"p",next:0};
  def.shots.forEach(function(s,i){var s0=starts[i]*4,add=function(step,k){step=Math.round(step)%E.steps;(E.evs[step]=E.evs[step]||[]).push(k)};
    if(s.drop){add(s0,"impact");if(starts[i]>=3)add(s0-12,"riser")}
    if(s.tr==="whip")add(s0,"whoosh");
    if(s.t==="stamp"&&!s.drop)add(s0+.6,"thud");
    if(s.t==="list")for(var k=1;k<s.items.length;k++)add(s0+k*(s.per||1)*4,"whoosh");
    if(s.t==="tfq")add(s0+s.b*2,"thud");
    if(s.t==="qtimer")for(var k2=0;k2<3;k2++)add(s0+k2*s.b/3*4,"tick")});
  var dur=tot*bs,raf=0,watched=false,prog=el.querySelector(".eprog i"),P;
  function clock(){return E.clk==="a"&&AU.c?AU.c.currentTime:performance.now()/1000}
  function T(){return E.playing?E.base+(clock()-E.sync):E.base}
  function resync(){var t=T();E.clk=(API.sound&&on())?"a":"p";E.base=t;E.sync=clock();E.next=Math.ceil(t/E.step-1e-6)}
  function size(){var r=el.getBoundingClientRect();if(!r.width)return;g.dpr=Math.min(2,WIN.devicePixelRatio||1);g.W=r.width;g.H=r.height;cv.width=Math.round(g.W*g.dpr);cv.height=Math.round(g.H*g.dpr);var m=g.W<640?Math.min(66,g.W*.17):24;g.cw=g.W-2*m;g.cx=g.W/2}
  function render(t){var W=g.W,H=g.H;if(!W)return;
    var loc=((t%dur)+dur)%dur,beat=loc/bs,i=0;while(i<starts.length-1&&beat>=starts[i+1])i++;
    var s=def.shots[i],bt=beat-starts[i],u=bt/s.b,p=Math.exp(-5*(beat%1)),pal=PAL[s.c||def.pal[i%def.pal.length]]||PAL.violet;
    G.gl=0;if(s.tr==="glitch"&&bt<.4)G.gl=8*(1-bt/.4);if(s.drop&&bt<.3)G.gl=Math.max(G.gl,7*(1-bt/.3));
    x.setTransform(g.dpr,0,0,g.dpr,0,0);x.globalAlpha=1;x.globalCompositeOperation="source-over";
    bg(g,pal,p,t);
    x.save();var z=1+(s.z!=null?s.z:.09)*Math.exp(-9*bt)+(s.t==="slam"?.012*p:0),late=s.t==="stamp"?.15:0,amp=(s.drop?16:s.t==="stamp"?12:s.shake?9:0)*(bt<late?0:Math.exp(-6*(bt-late)));
    var sx=amp*Math.sin(t*93.1),sy=amp*Math.cos(t*71.7),wx=s.tr==="whip"&&bt<.3?W*(1-eo(bt/.3)):0;
    x.translate(W/2+sx+wx,H/2+sy);x.scale(z,z);x.translate(-W/2,-H/2);
    try{(D[s.t]||D.slam)(g,s,u,bt,p,pal,t)}catch(e){}
    x.restore();
    if((s.drop||s.fl)&&bt<.5){x.fillStyle="rgba(255,255,255,"+(.85*Math.exp(-9*bt))+")";x.fillRect(0,0,W,H)}
    if(G.gl>0)slices(g);
    post(g,p,t);
    var cy=CAPY[s.t]!=null?CAPY[s.t]:.74;if(s.cap&&cy)caption(g,s.cap,u,cy);
    watermark(g,loc/dur);
    if(prog)prog.style.transform="scaleX("+(loc/dur).toFixed(4)+")";
  }
  function loop(){raf=requestAnimationFrame(loop);var t=T();render(t);if(!watched&&t>=dur){watched=true;if(hooks&&hooks.watched)hooks.watched()}}
  P={E:E,
    start:function(){size();CUR=P;E.base=0;E.clk="p";E.sync=clock();E.playing=true;resync();el.classList.remove("paused");if(!raf)loop()},
    stop:function(){if(E.playing){E.base=T();E.playing=false}cancelAnimationFrame(raf);raf=0;if(CUR===P)CUR=null},
    toggle:function(){if(E.playing){E.base=T();E.playing=false;el.classList.add("paused")}else{E.sync=clock();E.playing=true;resync();el.classList.remove("paused")}return E.playing},
    resync:function(){if(E.playing)resync()},
    size:function(){size();render(T())},
    poster:function(){size();render((starts[Math.min(1,starts.length-1)]+.7)*bs)}};
  return P;
}

/* ================= the edits ================= */
var EDITS=[
{id:"e-fission",title:"Splitting an atom in 10 seconds ⚛️",topic:"reactor",tags:"#fission #physics #nuclear",style:"phonk",bpm:140,key:5,pal:["violet","fire","gold","ice","toxic","violet","fire"],shots:[
 {t:"type",b:4,txt:"what actually happens when you split an atom?",cap:"what happens when you split an atom"},
 {t:"atom",b:2,hit:1,cap:"a neutron hits uranium-235"},
 {t:"atom",b:3,split:1,at:.05,drop:1,cap:"and it splits in two"},
 {t:"count",b:4,from:0,to:200,unit:"MeV",lbl:"ENERGY RELEASED",cap:"releasing about 200 MeV"},
 {t:"slam",b:3,txt:"50,000,000×",sub:"more than burning a molecule",tr:"whip",cap:"fifty million times more than burning"},
 {t:"chain",b:6,cap:"and 2 or 3 new neutrons go on to split more atoms"},
 {t:"slam",b:4,txt:"THAT'S A\nREACTOR.",tr:"glitch",cap:"keep that steady and you've got a reactor"}]},
{id:"e-bomb",title:"Can a reactor explode like a nuke? 💥",topic:"reactor",tags:"#mythbusting #nuclear #chernobyl",style:"phonk",bpm:150,key:7,pal:["fire","ice","fire","violet","gold"],shots:[
 {t:"type",b:4,txt:"can a nuclear reactor explode like a bomb?",cap:"can a nuclear reactor explode like a bomb"},
 {t:"versus",b:5,l:"BOMB",ls:"about 90% uranium-235",r:"REACTOR",rs:"only 3–5% uranium-235",lc:"#ff3b30",rc:"#3ad4ff",cap:"a bomb needs 90% uranium-235. fuel is 3 to 5%"},
 {t:"stamp",b:3,txt:"MYTH",under:"NUCLEAR\nEXPLOSION",col:"#ff3b30",drop:1,cap:"so no. it physically can't"},
 {t:"slam",b:3,txt:"PHYSICALLY\nIMPOSSIBLE",tr:"whip",cap:"physically impossible"},
 {t:"slam",b:4,txt:"STEAM\nEXPLOSION",sub:"what actually wrecked Chernobyl",tr:"glitch",cap:"Chernobyl was a steam explosion, not a nuclear one"}]},
{id:"e-halflife",title:"Half-life, but make it fast ⏳",topic:"radiation",tags:"#halflife #gcsephysics #radiation",style:"hype",bpm:128,key:0,pal:["gold","toxic","pink","violet"],shots:[
 {t:"slam",b:2,txt:"HALF-LIFE",cap:"half-life"},
 {t:"decay",b:7,drop:1,cap:"every half-life, half of what's left decays"},
 {t:"list",b:4,items:["HEAT?","PRESSURE?","CHEMICALS?","NOTHING."],last:"#FFE14D",cap:"and nothing can speed it up"},
 {t:"slam",b:4,txt:"RANDOM.",sub:"but perfectly predictable",tr:"glitch",cap:"one atom is random. a million are predictable"}]},
{id:"e-pellet",title:"This pellet = a tonne of coal 🪨",topic:"reactor",tags:"#uranium #energy #nuclear",style:"phonk",bpm:145,key:2,pal:["gold","toxic","mono","gold","violet"],shots:[
 {t:"pellet",b:4,txt:"THIS PELLET",cap:"this uranium pellet is about the size of your fingertip"},
 {t:"versus",b:4,l:"1 PELLET",ls:"fingertip-sized",r:"1 TONNE",rs:"of coal",lc:"#F2C46D",rc:"#9a9a9a",drop:1,cap:"same energy as burning a tonne of coal"},
 {t:"count",b:4,from:0,to:1000,unit:"KG OF COAL",lbl:"ONE PELLET =",cap:"one thousand kilograms"},
 {t:"slam",b:4,txt:"NUCLEAR.",tr:"glitch",cap:"that's nuclear"}]},
{id:"e-delayed",title:"Why reactors don't run away 🧠",topic:"reactor",tags:"#reactorphysics #neutrons",style:"hype",bpm:128,key:5,pal:["ice","violet","gold","teal","ice"],shots:[
 {t:"type",b:4,txt:"why don't nuclear reactors just run away?",cap:"why don't reactors just run away"},
 {t:"count",b:4,from:0,to:99.35,dec:2,unit:"%",lbl:"OF NEUTRONS ARE INSTANT",cap:"99.35% of neutrons appear instantly"},
 {t:"slam",b:4,txt:"0.65%",sub:"turn up seconds later",drop:1,cap:"but 0.65% turn up seconds later"},
 {t:"gauge",b:4,from:45,to:55,calm:1,lbl:"SLOW ENOUGH TO CONTROL",cap:"and that slows the whole reactor down"},
 {t:"slam",b:4,txt:"DELAYED\nNEUTRONS",sub:"the whole trick",tr:"glitch",cap:"delayed neutrons. that's the trick"}]},
{id:"e-scram",title:"What a SCRAM looks like 🚨",topic:"ops",tags:"#controlroom #scram #operator",style:"phonk",bpm:150,key:4,pal:["ice","fire","fire","mono","teal"],shots:[
 {t:"gauge",b:6,from:62,to:104,lbl:"REACTOR POWER",cap:"power climbing too fast"},
 {t:"slam",b:2,txt:"TRIP",col:"#ff4d4d",strobe:1,drop:1,cap:"reactor trip"},
 {t:"slam",b:2,txt:"SCRAM",strobe:1,tr:"glitch",cap:"scram"},
 {t:"list",b:4,items:["MAGNETS CUT","RODS FALL","GRAVITY WINS","SHUT DOWN ✓"],last:"#3fd99a",cap:"every rod drops in on gravity alone"},
 {t:"slam",b:4,txt:"FAIL-SAFE.",sub:"no power needed to stop it",cap:"fail-safe. no power needed to stop it"}]},
{id:"e-empty",title:"You are 99.9% empty space 🏟️",topic:"atoms",tags:"#atoms #mindblown #physics",style:"hype",bpm:124,key:10,pal:["teal","teal","violet","pink","gold"],shots:[
 {t:"type",b:3,txt:"you are almost entirely empty space",cap:"you are almost entirely empty space"},
 {t:"zoom",b:8,drop:1,cap:"if the nucleus were a pea, the atom would be a whole stadium"},
 {t:"slam",b:3,txt:"100,000×",sub:"wider than its nucleus",tr:"whip",cap:"an atom is 100,000 times wider than its nucleus"},
 {t:"slam",b:3,txt:"SO WHY DON'T\nYOU FALL\nTHROUGH?",cap:"so why don't you fall through the floor"},
 {t:"slam",b:3,txt:"ELECTRONS\nPUSH BACK",tr:"glitch",cap:"electrons push back"}]},
{id:"e-blue",title:"Why reactor pools glow blue 💙",topic:"space",tags:"#cherenkov #physics #satisfying",style:"hype",bpm:128,key:2,pal:["blue","blue","ice","blue"],shots:[
 {t:"glow",b:4,cap:"ever wondered why reactor pools glow blue"},
 {t:"slam",b:3,txt:"FASTER\nTHAN LIGHT",drop:1,c:"blue",cap:"particles going faster than light"},
 {t:"stamp",b:3,txt:"IN WATER",col:"#3ad4ff",under:"FASTER\nTHAN LIGHT",cap:"in water. light only goes 75% speed there"},
 {t:"glow",b:5,txt:"CHERENKOV\nRADIATION",cap:"it's a sonic boom, but made of light"}]},
{id:"e-1942",title:"The first reactor was under a squash court 🏟️",topic:"history",tags:"#history #fermi #nuclear",style:"phonk",bpm:136,key:9,pal:["sepia","sepia","gold","sepia","fire"],shots:[
 {t:"year",b:4,y:"1942",sub:"2 December · Chicago",cap:"2nd December 1942. Chicago"},
 {t:"slam",b:3,txt:"UNDER A\nSQUASH COURT",tr:"whip",cap:"under the stands of a university sports field"},
 {t:"count",b:4,from:0,to:.5,dec:1,unit:"WATTS",lbl:"THE FIRST CHAIN REACTION",drop:1,cap:"the first ever chain reaction made half a watt"},
 {t:"list",b:4,per:1.33,items:["NO SHIELDING","NO COOLING","ONE AXE"],last:"#FFE14D",cap:"no shielding. no cooling. a man with an axe on standby"},
 {t:"slam",b:4,txt:"CHICAGO\nPILE-1",tr:"glitch",cap:"Chicago Pile-1"}]},
{id:"e-rutherford",title:"The experiment that found the nucleus 🎯",topic:"history",tags:"#rutherford #gcse #atoms",style:"hype",bpm:120,key:7,pal:["sepia","gold","fire","sepia","violet"],shots:[
 {t:"year",b:3,y:"1909",sub:"Manchester",cap:"1909. alpha particles fired at gold foil"},
 {t:"slam",b:3,txt:"GOLD FOIL",cap:"most went straight through"},
 {t:"slam",b:3,txt:"1 IN 8,000",sub:"bounced straight back",drop:1,cap:"but about 1 in 8,000 bounced straight back"},
 {t:"quote",b:9,txt:"“As if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you.”",who:"Ernest Rutherford"},
 {t:"slam",b:4,txt:"THE\nNUCLEUS",tr:"glitch",cap:"he'd discovered the nucleus"}]},
{id:"e-shield",title:"Alpha, beta, gamma in 10 seconds 🛡️",topic:"radiation",tags:"#gcsephysics #radiation #revision",style:"phonk",bpm:145,key:0,pal:["gold","fire","ice","toxic","gold"],shots:[
 {t:"slam",b:2,txt:"KNOW YOUR\nSHIELDING",cap:"know your shielding"},
 {t:"versus",b:3,l:"ALPHA",ls:"α · most ionising",r:"PAPER",rs:"stops it",lc:"#ff4d4d",rc:"#f3f2ee",drop:1,cap:"alpha. stopped by paper"},
 {t:"versus",b:3,l:"BETA",ls:"β · fast electrons",r:"ALUMINIUM",rs:"a few mm",lc:"#3ad4ff",rc:"#b8c2cc",cap:"beta. a few mm of aluminium"},
 {t:"versus",b:3,l:"GAMMA",ls:"γ · electromagnetic wave",r:"LEAD",rs:"thick lead or concrete",lc:"#9cff3a",rc:"#8a8f99",cap:"gamma. thick lead or concrete"},
 {t:"slam",b:3,txt:"EXAM\nREADY.",tr:"glitch",cap:"exam ready"}]},
{id:"e-banana",title:"Your banana is radioactive 🍌",topic:"radiation",tags:"#funfact #radiation #science",style:"hype",bpm:128,key:3,pal:["gold","gold","toxic","pink","gold"],shots:[
 {t:"slam",b:2,txt:"YOUR BANANA\nIS RADIOACTIVE",cap:"your banana is radioactive"},
 {t:"count",b:4,from:0,to:15,unit:"DECAYS / SECOND",lbl:"POTASSIUM-40",drop:1,cap:"about 15 atoms decay inside it every second"},
 {t:"stamp",b:2,txt:"FACT",col:"#3fd99a",cap:"fact"},
 {t:"count",b:4,from:0,to:4000,unit:"DECAYS / SECOND",lbl:"YOUR BODY",cap:"your body? about 4,000"},
 {t:"slam",b:4,txt:"STILL EAT\nIT.",sub:"totally harmless",tr:"glitch",cap:"still eat it. totally harmless"}]},
{id:"e-fukushima",title:"Fukushima: the reactors shut down. Then… 🌊",topic:"history",tags:"#fukushima #decayheat #history",style:"phonk",bpm:140,key:1,pal:["sepia","teal","fire","gold","fire"],shots:[
 {t:"year",b:4,y:"2011",sub:"Fukushima Daiichi",cap:"2011. Fukushima Daiichi"},
 {t:"slam",b:3,txt:"REACTORS\nSHUT DOWN ✓",cap:"the earthquake hit and the reactors shut down perfectly"},
 {t:"slam",b:3,txt:"THEN THE\nWAVE CAME",strobe:1,drop:1,cap:"then the tsunami flooded the backup generators"},
 {t:"count",b:4,from:0,to:7,unit:"% OF FULL POWER",lbl:"STILL BEING MADE",cap:"but a shut-down reactor still makes heat"},
 {t:"slam",b:4,txt:"DECAY\nHEAT",sub:"cooling must never stop",tr:"glitch",cap:"decay heat. cooling must never stop"}]},
{id:"e-sun",title:"The Sun loses 4 million tonnes a second ☀️",topic:"atoms",tags:"#fusion #space #emc2",style:"hype",bpm:126,key:8,pal:["gold","fire","gold","violet"],shots:[
 {t:"rings",b:3,g:"☀️",cap:"every single second the Sun fuses"},
 {t:"count",b:4,from:0,to:600,unit:"MILLION TONNES",lbl:"OF HYDROGEN EVERY SECOND",drop:1,cap:"600 million tonnes of hydrogen"},
 {t:"slam",b:4,txt:"4,000,000\nTONNES",sub:"turn into pure energy",tr:"whip",cap:"and 4 million tonnes of it turns into pure energy"},
 {t:"slam",b:4,txt:"E = mc²",tr:"glitch",cap:"E equals m c squared"}]},
{id:"e-kettle",title:"Why the grid fears half-time ☕",topic:"energy",tags:"#nationalgrid #tvpickup #uk",style:"phonk",bpm:140,key:6,pal:["blue","gold","ice","blue"],shots:[
 {t:"type",b:3,txt:"the final whistle blows…",cap:"the final whistle blows"},
 {t:"list",b:3,items:["☕","☕☕","☕☕☕"],cap:"and millions of people put the kettle on"},
 {t:"count",b:4,from:0,to:2800,unit:"MEGAWATTS",lbl:"DEMAND JUMP · 1990",drop:1,cap:"after England v West Germany in 1990 demand jumped 2,800 megawatts"},
 {t:"slam",b:4,txt:"TV PICKUP",sub:"the grid plans for it",tr:"glitch",cap:"it's called TV pickup. the grid plans for it"}]},
{id:"e-xenon",title:"The reactor poisons itself ☠️",topic:"reactor",tags:"#xenon #reactorphysics",style:"hype",bpm:128,key:4,pal:["toxic","violet","toxic","gold","fire"],shots:[
 {t:"slam",b:3,txt:"THE REACTOR\nPOISONS ITSELF",cap:"a reactor makes its own poison"},
 {t:"rings",b:3,g:"☠️",txt:"XENON-135",drop:1,cap:"xenon-135"},
 {t:"slam",b:3,txt:"NEUTRON\nSPONGE",tr:"whip",cap:"it soaks up neutrons better than almost anything"},
 {t:"count",b:4,from:0,to:10,unit:"HOURS AFTER SHUTDOWN",lbl:"IT PEAKS ABOUT",cap:"after a shutdown it peaks about 10 hours later"},
 {t:"slam",b:4,txt:"THE XENON\nPIT",tr:"glitch",cap:"operators call it the xenon pit"}]},
{id:"e-meitner",title:"She explained fission. He got the Nobel. 🧠",topic:"history",tags:"#womeninscience #history #fission",style:"phonk",bpm:138,key:11,pal:["sepia","sepia","gold","fire","violet"],shots:[
 {t:"year",b:4,y:"1938",sub:"barium where uranium should be",cap:"1938. Otto Hahn finds barium in his uranium"},
 {t:"slam",b:3,txt:"LISE\nMEITNER",tr:"whip",cap:"Lise Meitner works out what happened"},
 {t:"atom",b:4,split:1,at:.1,drop:1,cap:"the nucleus had split in two"},
 {t:"slam",b:3,txt:"1944 NOBEL",sub:"awarded to Hahn alone",cap:"the 1944 Nobel Prize went to Hahn alone"},
 {t:"slam",b:4,txt:"ELEMENT\n109",sub:"meitnerium is named after her",tr:"glitch",cap:"now element 109 is named after her"}]},
{id:"e-voyager",title:"Voyager is still running on plutonium 🛰️",topic:"space",tags:"#space #voyager #nuclear",style:"hype",bpm:122,key:9,pal:["violet","blue","gold","violet"],shots:[
 {t:"year",b:3,y:"1977",sub:"Voyager 1 launches",cap:"1977. Voyager 1 launches"},
 {t:"rings",b:3,g:"🛰️",txt:"STILL TALKING",drop:1,cap:"it's still sending messages home"},
 {t:"slam",b:4,txt:"PLUTONIUM-238",sub:"decay heat → electricity",tr:"whip",cap:"powered by the heat of decaying plutonium-238"},
 {t:"slam",b:4,txt:"NO CHAIN\nREACTION",sub:"just radioactive decay",tr:"glitch",cap:"no reactor. just decay heat"}]}
];

function stripTags(s){return String(s).replace(/<[^>]*>/g,"")}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function hsh(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36)}
function genQuiz(bank){
  var ok=bank.filter(function(q){return stripTags(q[1]).length<=95&&q[2].every(function(o){return stripTags(o).length<=34})});if(!ok.length)return null;
  var q=ok[Math.floor(Math.random()*ok.length)],opts=q[2].map(stripTags),order=shuf([0,1,2,3].slice(0,opts.length)),o2=order.map(function(i){return opts[i]}),ans=order.indexOf(0),qq=stripTags(q[1]);
  return{id:"eq"+hsh(qq),gen:1,title:"3 second challenge ⏱️",topic:q[0],tags:"#quiz #challenge #revision",style:"phonk",bpm:132,key:Math.floor(Math.random()*12),pal:["violet","fire","toxic","gold"],ex:"<b>"+qq+"</b><br>Answer: <b>"+opts[0]+"</b>. "+q[3],shots:[
    {t:"slam",b:2,txt:"3 SECOND\nCHALLENGE",tr:"glitch",cap:"can you get this in 3 seconds"},
    {t:"qtimer",b:6,q:qq,opts:o2,ans:ans},
    {t:"qreveal",b:3,q:qq,opts:o2,ans:ans,drop:1,c:"toxic"},
    {t:"slam",b:2,txt:"GOT IT?",sub:"tap Explain for why",cap:"did you get it"}]};
}
function genTF(bank){
  var ok=bank.filter(function(t){return stripTags(t[1]).length<=90});if(ok.length<3)return null;var pk=shuf(ok).slice(0,3);
  return{id:"et"+hsh(pk.map(function(t){return t[1]}).join("|")),gen:1,title:"True or false: speed round ⚡",topic:pk[0][0],tags:"#trueorfalse #quiz #science",style:"hype",bpm:128,key:Math.floor(Math.random()*12),pal:["pink","ice","violet","gold","pink"],
    ex:pk.map(function(t){return"<b>"+stripTags(t[1])+"</b> "+(t[2]?"True.":"False.")+" "+t[3]}).join("<br><br>"),
    shots:[{t:"slam",b:2,txt:"TRUE OR\nFALSE?",tr:"glitch",cap:"true or false. speed round"}].concat(pk.map(function(t,i){return{t:"tfq",b:4,q:stripTags(t[1]),v:!!t[2],drop:i===0?1:0,c:["ice","violet","gold"][i]}}),[{t:"slam",b:2,txt:"HOW MANY\nDID YOU GET?",cap:"how many did you get"}])};
}

if(document.fonts&&document.fonts.load){document.fonts.load("40px Anton").then(function(){haveAnton=document.fonts.check("40px Anton");FIT.clear()},function(){})}
var API={sound:true,unlock:unlock,on:on,Player:Player,EDITS:EDITS,genQuiz:genQuiz,genTF:genTF,sfx:sfx};
WIN.ChainEdits=API;
})();
