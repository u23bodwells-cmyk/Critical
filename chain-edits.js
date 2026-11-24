/* Chain edits: short, beat-synced "edits" drawn on a canvas, with music synthesised live (no audio files).
   Each edit is a list of shots laid out on a beat grid. The engine handles cuts, punch zooms, shakes, flashes,
   glitches, word-by-word captions and a drop. Used by chain.html. */
(function(){
"use strict";
var WIN=window;

/* ================= audio ================= */
var AU={c:null,m:null,nz:null,sh:null,tag:null};
/* half a second of silence as a WAV. Playing it on a loop through an <audio> tag makes iPhones treat the page as media,
   so the music plays even when the ring/silent switch is on silent (otherwise Safari mutes Web Audio). */
function silentWav(){var sr=8000,n=4000,buf=new Uint8Array(44+n),dv=new DataView(buf.buffer),w=function(o,s){for(var i=0;i<s.length;i++)buf[o+i]=s.charCodeAt(i)};
  w(0,"RIFF");dv.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr,true);dv.setUint16(32,1,true);dv.setUint16(34,8,true);w(36,"data");dv.setUint32(40,n,true);
  for(var i=0;i<n;i++)buf[44+i]=128;var s="";for(i=0;i<buf.length;i++)s+=String.fromCharCode(buf[i]);return"data:audio/wav;base64,"+btoa(s)}
function mediaMode(){
  try{if(navigator.audioSession&&navigator.audioSession.type!=="playback")navigator.audioSession.type="playback"}catch(e){}
  try{if(!AU.tag){var a=document.createElement("audio");a.setAttribute("playsinline","");a.setAttribute("x-webkit-airplay","deny");a.loop=true;a.preload="auto";a.src=silentWav();AU.tag=a}
    if(AU.tag.paused){var pr=AU.tag.play();if(pr&&pr.catch)pr.catch(function(){})}}catch(e){}
}
function needs(){return!on()||!!(AU.tag&&AU.tag.paused)}
function sleep(){try{if(AU.tag&&!AU.tag.paused)AU.tag.pause()}catch(e){}}
function unlock(){
  mediaMode();
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
  for(var guard=0;guard<64;guard++){var n=E.next,tc=E.sync+(n*E.step-E.base);if(tc>ahead)break;P.scan(n);
    if(tc>=now-.02)try{var es=P.es(n);music(E,((es%E.steps)+E.steps)%E.steps,Math.max(tc,now))}catch(e){}E.next++}
},25);

/* ================= drawing helpers ================= */
var PAL={fire:["#ff3b30","#1f0000","#ff9d2e"],ice:["#3ad4ff","#00131f","#7a5cff"],toxic:["#9cff3a","#061200","#00e5a0"],violet:["#a06bff","#0e0024","#ff3bd4"],gold:["#F2C46D","#170e00","#ff6a3d"],
  mono:["#ffffff","#050505","#8aa0ff"],pink:["#ff3b8d","#1f000d","#7a3cff"],blue:["#3a8bff","#000a22","#00e0ff"],sepia:["#e0b27a","#160d04","#ff7a3d"],teal:["#2ee6b8","#001a14","#3a8bff"]};
var SCENE={violet:"grid",pink:"grid",blue:"grid",ice:"stars",teal:"stars",mono:"stars",fire:"smoke",gold:"smoke",toxic:"smoke",sepia:"film"};
var haveAnton=false,FIT=new Map(),CACHE=new WeakMap(),G={gl:0,pal:null};
/* Quality: 2 = full effects, 1 = phone default, 0 = lightest. It adapts to the measured frame rate,
   and drops while the feed is being swiped so scrolling stays smooth. */
var TOUCH=("ontouchstart" in WIN)||(navigator.maxTouchPoints>0),Q={lv:TOUCH?1:2,ema:16,slow:0,fast:0};
function qlv(){return API.moving?Math.min(Q.lv,0):Q.lv}
function qTick(dt){if(dt<=0||dt>200)return;Q.ema=Q.ema*.92+dt*.08;if(Q.ema>21){Q.slow++;Q.fast=0;if(Q.slow>45&&Q.lv>0){Q.lv--;Q.slow=0}}else if(Q.ema<14.5){Q.fast++;Q.slow=0;if(Q.fast>240&&Q.lv<2){Q.lv++;Q.fast=0}}else{Q.slow=0;Q.fast=0}}
/* each glowing title letter is drawn once to a small canvas and reused, instead of re-blurring it every frame */
var SPR=new Map();
function sprite(c,sz,col,pal){var key=c+"|"+sz+"|"+(col||"")+"|"+pal[0]+"|"+haveAnton;var s=SPR.get(key);if(s)return s;
  var t=document.createElement("canvas"),x=t.getContext("2d"),f=fnt(sz,"a");x.font=f;var w=Math.ceil(x.measureText(c).width),pad=Math.ceil(sz*.45),d=Math.min(2,WIN.devicePixelRatio||1);
  t.width=(w+pad*2)*d;t.height=(Math.ceil(sz*1.3)+pad*2)*d;x=t.getContext("2d");x.scale(d,d);x.font=f;x.textAlign="center";x.textBaseline="middle";var cx=(w+pad*2)/2,cy=(Math.ceil(sz*1.3)+pad*2)/2;
  for(var e=5;e>=1;e--){x.fillStyle=e>2?"rgba(0,0,0,.55)":hexA(pal[2]||pal[0],.85);x.fillText(c,cx+e*sz*.012,cy+e*sz*.02)}
  var gr=x.createLinearGradient(0,cy-sz*.5,0,cy+sz*.5);gr.addColorStop(0,"#ffffff");gr.addColorStop(.5,col||"#ffffff");gr.addColorStop(1,col?hexA(col,1):hexA(pal[0],1));
  x.shadowColor=hexA(col||pal[0],.95);x.shadowBlur=sz*.35;x.fillStyle=gr;x.fillText(c,cx,cy);x.shadowBlur=0;x.lineWidth=Math.max(1.2,sz*.025);x.strokeStyle="rgba(255,255,255,.35)";x.strokeText(c,cx,cy);
  s={c:t,w:w+pad*2,h:Math.ceil(sz*1.3)+pad*2};if(SPR.size>600)SPR.clear();SPR.set(key,s);return s}
/* plain glowing labels: the whole line cached the same way */
function lineSprite(l,sz,col,pal,kind){var key="L|"+l+"|"+sz+"|"+col+"|"+pal[0]+"|"+haveAnton;var s=SPR.get(key);if(s)return s;
  var t=document.createElement("canvas"),x=t.getContext("2d"),f=fnt(sz,kind);x.font=f;var w=Math.ceil(x.measureText(l).width),pad=Math.ceil(sz*.4),d=Math.min(2,WIN.devicePixelRatio||1),h=Math.ceil(sz*1.3);
  t.width=(w+pad*2)*d;t.height=(h+pad*2)*d;x=t.getContext("2d");x.scale(d,d);x.font=f;x.textAlign="center";x.textBaseline="middle";var cx=(w+pad*2)/2,cy=(h+pad*2)/2;
  x.shadowColor=hexA(col==="#fff"?pal[0]:col,.9);x.shadowBlur=sz*.3;x.fillStyle=col;x.fillText(l,cx,cy);x.shadowBlur=0;x.lineWidth=Math.max(1.5,sz*.035);x.strokeStyle="rgba(0,0,0,.55)";x.strokeText(l,cx,cy);x.fillStyle=col;x.fillText(l,cx,cy);
  s={c:t,w:w+pad*2,h:h+pad*2,tw:w};if(SPR.size>600)SPR.clear();SPR.set(key,s);return s}
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
  o=o||{};var x=g.x,lines=String(txt).split("\n"),sz=o.size||fit(x,o.fitTo?String(o.fitTo).split("\n"):lines,maxW,maxH,o.kind,o.max),pal=G.pal||PAL.violet;
  x.font=fnt(sz,o.kind);x.textAlign=o.align||"center";x.textBaseline="middle";
  var lh=sz*(o.kind==="s"?1.15:1.04),y0=cy-(lines.length-1)*lh/2,col=o.col||"#fff";
  if(o.hero&&o.kind!=="s"&&o.stroke!==false){hero(g,lines,cx,y0,lh,sz,o,pal);return sz}
  for(var i=0;i<lines.length;i++){var l=lines[i],y=y0+i*lh;
    if(o.glitch){x.globalCompositeOperation="lighter";x.fillStyle="rgba(255,0,60,.85)";x.fillText(l,cx-o.glitch,y);x.fillStyle="rgba(0,220,255,.85)";x.fillText(l,cx+o.glitch,y);x.globalCompositeOperation="source-over"}
    if(o.stroke!==false){x.lineJoin="round";if(o.kind==="s"){x.lineWidth=Math.max(2,sz*.16);x.strokeStyle="rgba(0,0,0,.75)";x.strokeText(l,cx,y)}else{var ls=lineSprite(l,sz,col,pal,o.kind),ax=o.align==="left"?cx-(ls.w-ls.tw)/2:o.align==="right"?cx-ls.w+(ls.w-ls.tw)/2:cx-ls.w/2;x.drawImage(ls.c,ax,y-ls.h/2,ls.w,ls.h);continue}}
    x.fillStyle=col;x.fillText(l,cx,y)}
  return sz;
}
/* big title text: letters fly in one by one, with a 3D extrude, coloured glow and a gradient fill */
function hero(g,lines,cx,y0,lh,sz,o,pal){var x=g.x,t=o.t==null?9:o.t,st=o.stagger==null?.05:o.stagger,n=0,col=o.col,bz=Math.max(8,Math.round(sz/2)*2);
  for(var li=0;li<lines.length;li++){var l=Array.from(lines[li]),y=y0+li*lh,ws=l.map(function(c){return x.measureText(c).width}),tw=ws.reduce(function(a,b){return a+b},0),X=o.align==="left"?cx:cx-tw/2;
    for(var ci=0;ci<l.length;ci++){var c=l[ci],w=ws[ci],lt=cl((t-n*st)/.22),a=Math.min(1,lt*2.5),sc=(1+1.6*(1-eo(lt)))*sz/bz,rot=(1-eo(lt))*(n%2?.35:-.35);n++;
      if(a<=0||c===" "){X+=w;continue}
      var sp=sprite(c,bz,col,pal);x.save();x.translate(X+w/2,y);x.rotate(rot);x.scale(sc,sc);x.globalAlpha=a;
      if(o.glitch){x.globalCompositeOperation="lighter";x.globalAlpha=a*.7;x.drawImage(sp.c,-sp.w/2-o.glitch*bz/sz,-sp.h/2,sp.w,sp.h);x.drawImage(sp.c,-sp.w/2+o.glitch*bz/sz,-sp.h/2,sp.w,sp.h);x.globalCompositeOperation="source-over";x.globalAlpha=a}
      x.drawImage(sp.c,-sp.w/2,-sp.h/2,sp.w,sp.h);x.restore();X+=w}}
  x.globalAlpha=1;x.textAlign="center";
}

function wrap(x,txt,maxW){var out=[];String(txt).split("\n").forEach(function(par){var line="";par.split(" ").forEach(function(w){var t=line?line+" "+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t});out.push(line)});return out}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function fmt(v,dec){return v.toLocaleString("en-GB",{minimumFractionDigits:dec,maximumFractionDigits:dec})}
var GRAIN=null;
function grain(x){if(!GRAIN){var c=document.createElement("canvas");c.width=c.height=128;var gx=c.getContext("2d"),im=gx.createImageData(128,128);for(var i=0;i<im.data.length;i+=4){var v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}gx.putImageData(im,0,0);GRAIN=x.createPattern(c,"repeat")}return GRAIN}

function bg(g,pal,p,t,sc,kp,hot){var x=g.x,W=g.W,H=g.H,cx=g.cx,cy=H*.42,R=Math.max(W,H),i;
  var lg=x.createLinearGradient(0,0,0,H);lg.addColorStop(0,pal[1]);lg.addColorStop(.6,"#030308");lg.addColorStop(1,pal[1]);x.fillStyle=lg;x.fillRect(0,0,W,H);
  x.globalCompositeOperation="lighter";
  for(i=0;i<3;i++){var bx=cx+Math.sin(t*.23+i*2.1)*W*.38,by=cy+Math.cos(t*.19+i*1.7)*H*.26,rad=R*(.42+.1*i),c=i===1?pal[2]:pal[0],gr=x.createRadialGradient(bx,by,0,bx,by,rad);gr.addColorStop(0,hexA(c,.2+.1*p+.08*kp));gr.addColorStop(1,hexA(c,0));x.fillStyle=gr;x.fillRect(0,0,W,H)}
  if(sc==="grid"){var hz=H*.6,sp=hot?2.2:1;x.strokeStyle=hexA(pal[0],.6);x.lineWidth=1.6;
    for(i=0;i<14;i++){var z=((i+t*sp)%14)/14,yy=hz+(H-hz)*z*z;x.globalAlpha=z;x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
    x.globalAlpha=1;for(i=-9;i<=9;i++){x.beginPath();x.moveTo(cx+i*W*.02,hz);x.lineTo(cx+i*W*.28,H);x.stroke()}
    var hg=x.createLinearGradient(0,hz-H*.08,0,hz+H*.02);hg.addColorStop(0,hexA(pal[2],0));hg.addColorStop(.8,hexA(pal[2],.5));hg.addColorStop(1,hexA(pal[2],0));x.shadowBlur=0;x.fillStyle=hg;x.fillRect(0,hz-H*.08,W,H*.1)}
  else if(sc==="stars"){var spd=hot?.9:.25;x.lineCap="round";for(i=0;i<70;i++){var a=i*2.399,f=(i*.6180339)%1,d=(t*spd*(.4+f)+f)%1,r1=d*d*R*.9,r0=r1*(hot?.75:.93);x.strokeStyle="rgba(255,255,255,"+(d*.8)+")";x.lineWidth=.6+d*2;x.beginPath();x.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);x.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);x.stroke()}}
  else{x.save();x.translate(cx,cy);x.rotate(t*.12);x.fillStyle=hexA(pal[0],(sc==="film"?.04:.05)+.05*p);for(i=0;i<12;i++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,0);x.lineTo(R*1.2,-R*.08);x.lineTo(R*1.2,R*.08);x.closePath();x.fill()}x.restore()}
  for(i=0;i<16;i++){var f2=(i*.754877)%1,bx2=((f2*W*1.3+t*(8+i%4*6))%(W+120))-60,by2=((i*.5698)%1)*H+Math.sin(t*.5+i)*14,br=5+(i%5)*6;x.fillStyle=hexA(i%3?pal[0]:pal[2],.05+.05*p);x.beginPath();x.arc(bx2,by2,br*(1+.2*kp),0,7);x.fill()}
  x.globalCompositeOperation="source-over";x.shadowBlur=0;
}
var BL=null;
/* cheap bloom: shrink the frame, keep only the bright parts (multiply it by itself) and add it back blurred */
function bloom(g,amt){if(qlv()<1)return;try{if(!BL){BL=document.createElement("canvas");BL.c=BL.getContext("2d")}var dv=qlv()>1?7:10,w=Math.max(1,Math.round(g.W/dv)),h=Math.max(1,Math.round(g.H/dv));if(BL.width!==w||BL.height!==h){BL.width=w;BL.height=h}
  var b=BL.c;b.globalCompositeOperation="source-over";b.globalAlpha=1;b.imageSmoothingEnabled=true;b.drawImage(g.cv,0,0,w,h);b.globalCompositeOperation="multiply";b.drawImage(BL,0,0);b.drawImage(BL,0,0);b.globalCompositeOperation="source-over";
  var x=g.x;x.save();x.globalCompositeOperation="lighter";x.globalAlpha=amt;x.imageSmoothingEnabled=true;x.drawImage(BL,-g.W*.01,-g.H*.01,g.W*1.02,g.H*1.02);x.restore()}catch(e){}}
/* motion blurs used by the transitions: zoom blur from the centre, or a sideways whip blur */
function zblur(g,str){var n=qlv()>1?3:qlv()>0?2:0;if(!n)return;var x=g.x,d=g.dpr,cv=g.cv,cxp=g.cx*d,cyp=g.H*.42*d;x.save();x.setTransform(1,0,0,1,0,0);for(var i=1;i<=n;i++){var s=1+str*.035*i;x.globalAlpha=.24;x.drawImage(cv,cxp*(1-s),cyp*(1-s),cv.width*s,cv.height*s)}x.restore()}
function dblur(g,dx){var n=qlv()>1?3:qlv()>0?2:0;if(!n)return;var x=g.x,cv=g.cv;x.save();x.setTransform(1,0,0,1,0,0);for(var i=1;i<=n;i++){x.globalAlpha=.22;x.drawImage(cv,dx*g.dpr*i/3,0)}x.restore()}
function dropFX(g,pal,bt,seed){var x=g.x,W=g.W,H=g.H,cx=g.cx,cy=H*.42,R=Math.max(W,H);if(bt>1.6)return;var r=rng(seed);x.save();x.globalCompositeOperation="lighter";x.lineCap="round";
  for(var i=0;i<46;i++){var a=r()*6.283,v=.3+r()*.7,d=R*.75*v*(1-Math.exp(-3.2*bt)),d0=Math.max(0,d-R*.07*v*Math.exp(-1.5*bt)),al=Math.max(0,1-bt/1.4);x.strokeStyle=i%3?hexA(pal[0],al):"rgba(255,255,255,"+al+")";x.lineWidth=1.5+r()*2.5;x.beginPath();x.moveTo(cx+Math.cos(a)*d0,cy+Math.sin(a)*d0);x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d);x.stroke()}
  if(bt<1){x.globalCompositeOperation="source-over";x.strokeStyle="rgba(255,255,255,"+(.5*(1-bt))+")";x.lineWidth=1.5;for(var k=0;k<36;k++){var b2=k*.1745+r()*.1,L=R*(.12+r()*.2);x.beginPath();x.moveTo(cx+Math.cos(b2)*R*.75,cy+Math.sin(b2)*R*.75);x.lineTo(cx+Math.cos(b2)*(R*.75-L),cy+Math.sin(b2)*(R*.75-L));x.stroke()}}
  if(bt<1.2){x.globalCompositeOperation="screen";var lx=-W*.4+W*1.8*(bt/1.2),lk=x.createRadialGradient(lx,H*.2,0,lx,H*.2,R*.6);lk.addColorStop(0,hexA(pal[2],.45*(1-bt/1.2)));lk.addColorStop(1,hexA(pal[2],0));x.fillStyle=lk;x.fillRect(0,0,W,H)}
  x.restore()}
function post(g,p,t,kp,pal){var x=g.x,W=g.W,H=g.H;
  var v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.32,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,"+(.6-.15*p)+")");x.fillStyle=v;x.fillRect(0,0,W,H);
  if(kp>.05&&pal){var e=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.45,W/2,H/2,Math.max(W,H)*.8);e.addColorStop(0,hexA(pal[0],0));e.addColorStop(1,hexA(pal[0],.28*kp));x.fillStyle=e;x.fillRect(0,0,W,H)}
  if(qlv()>0){x.save();x.globalAlpha=.07;x.translate(-Math.random()*128,-Math.random()*128);x.fillStyle=grain(x);x.fillRect(0,0,W+128,H+128);x.restore()}
}
function slices(g){var x=g.x,d=g.dpr,W=g.W,H=g.H;for(var k=0;k<5;k++){var y=Math.random()*H,h=Math.random()*H*.06+4,dx=(Math.random()-.5)*G.gl*7;try{x.drawImage(g.cv,0,y*d,W*d,h*d,dx,y,W,h)}catch(e){}}}
function caption(g,cap,u,y){var x=g.x,pal=G.pal||PAL.violet,ws=cap.toUpperCase().split(" "),n=ws.length,ci=Math.min(n-1,Math.floor(cl(u/.88)*n)),s0=Math.floor(ci/3)*3,chunk=ws.slice(s0,s0+3),sz=Math.min(g.cw*.075,28);
  var F=function(z){return"900 "+z+"px system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"};x.font=F(sz);var sp=sz*.45,tw=0,wd=chunk.map(function(w){var m=x.measureText(w).width;tw+=m;return m});tw+=sp*(chunk.length-1);
  if(tw>g.cw*.95){sz*=g.cw*.95/tw;x.font=F(sz);sp=sz*.45;tw=0;wd=chunk.map(function(w){var m=x.measureText(w).width;tw+=m;return m});tw+=sp*(chunk.length-1)}
  var X=g.cx-tw/2,Y=g.H*y,wordU=(cl(u/.88)*n)-ci;x.textAlign="left";x.textBaseline="middle";x.lineJoin="round";
  chunk.forEach(function(w,i){var cur=s0+i===ci,sc=cur?1+.18*Math.exp(-12*wordU):1;x.save();x.translate(X+wd[i]/2,Y);x.scale(sc,sc);
    if(cur){x.fillStyle=pal[0];rr(x,-wd[i]/2-sz*.22,-sz*.62,wd[i]+sz*.44,sz*1.24,sz*.3);x.fill();x.fillStyle=pal[0]==="#ffffff"||pal[0]==="#F2C46D"||pal[0]==="#9cff3a"?"#111":"#fff";x.fillText(w,-wd[i]/2,sz*.04)}
    else{x.lineWidth=sz*.22;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(w,-wd[i]/2,sz*.04);x.fillStyle="#fff";x.fillText(w,-wd[i]/2,sz*.04)}
    x.restore();X+=wd[i]+sp});
}
function watermark(g,f){var x=g.x,H=g.H,right=f>.5;x.font="700 12px system-ui,sans-serif";x.textBaseline="middle";x.textAlign=right?"right":"left";x.fillStyle="rgba(255,255,255,.55)";x.fillText("♪ Critical",right?g.cx+g.cw/2-6:g.cx-g.cw/2+6,right?H*.8:Math.max(H*.105,74))}

/* ================= shot types ================= */
var CAPY={versus:.85,qtimer:0,qreveal:0,tfq:0,quote:0,decay:.76};
var D={};
D.slam=function(g,s,u,bt,p,pal){var x=g.x,H=g.H;
  if(s.strobe&&Math.floor(bt*4)%2===0){x.fillStyle="rgba(255,0,0,.3)";x.fillRect(0,0,g.W,H)}
  text(g,s.txt,g.cx,H*.42,g.cw*.9,H*.32,{col:s.col,glitch:G.gl,hero:1,t:bt,stagger:Math.min(.06,.9/Math.max(6,s.txt.length))});
  if(s.sub&&bt>.35){var a=cl((bt-.35)*4);x.globalAlpha=a;text(g,s.sub,g.cx,H*.62+(1-a)*16,g.cw*.86,H*.06,{kind:"s",col:pal[0],max:28});x.globalAlpha=1}};
D.type=function(g,s,u,bt){var x=g.x,H=g.H,cw=g.cw*.9,sz=Math.min(g.cw*.1,44),lines;
  for(;sz>14;sz-=2){x.font=fnt(sz,"s");lines=wrap(x,s.txt,cw);if(lines.length*sz*1.2<=H*.36)break}
  var total=s.txt.length,n=Math.floor(total*cl(bt/(s.b*.6))),lh=sz*1.2,y0=H*.42-(lines.length-1)*lh/2,left=g.cx-cw/2,c=0,lx=left,ly=y0;
  x.textAlign="left";x.textBaseline="middle";x.lineJoin="round";
  lines.forEach(function(l,i){var y=y0+i*lh,show=l.slice(0,Math.max(0,n-c));c+=l.length+1;if(!show)return;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(show,left,y);x.fillStyle="#fff";x.fillText(show,left,y);lx=left+x.measureText(show).width;ly=y});
  if(n<total||Math.floor(bt*2.5)%2===0){x.fillStyle="#FFE14D";x.fillRect(lx+4,ly-sz*.5,Math.max(3,sz*.1),sz)}};
D.count=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,dec=s.dec||0,v=s.from+(s.to-s.from)*eoe(u/.7),fin=(s.pre||"")+fmt(s.to,dec);
  if(s.lbl)text(g,s.lbl,g.cx,H*.27,g.cw*.9,H*.06,{kind:"s",col:pal[0],max:28});
  var sc=u>=.7?1+.3*Math.exp(-12*(bt-.7*s.b)):1+.03*p;x.save();x.translate(g.cx,H*.42);x.scale(sc,sc);text(g,(s.pre||"")+fmt(v,dec),0,0,g.cw*.9,H*.2,{fitTo:fin,glitch:G.gl,hero:1});x.restore();
  if(s.unit)text(g,s.unit,g.cx,H*.555,g.cw*.86,H*.07,{col:pal[0],hero:1,t:bt-.2,stagger:.03})};
function sph(x,cx,cy,r,c){var g=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,"#ffffff");g.addColorStop(.25,c);g.addColorStop(1,hexA(c,.35));x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}
function nucleus(x,cx,cy,R,n){x.save();x.shadowColor="rgba(255,140,90,.8)";x.shadowBlur=R*.6;x.fillStyle="rgba(255,120,80,.12)";x.beginPath();x.arc(cx,cy,R*1.05,0,7);x.fill();x.restore();for(var i=n-1;i>=0;i--){var r=R*.85*Math.sqrt((i+.5)/n),a=i*2.39996;sph(x,cx+Math.cos(a)*r,cy+Math.sin(a)*r,R*.3,i%2?"#ff5a4f":"#9fc3e6")}}
D.atom=function(g,s,u,bt,p,pal,t){var x=g.x,H=g.H,cx=g.cx,cy=H*.42,R=Math.min(g.cw,H*.5)*.14*(1+.05*p),sb=s.split?(s.at||.5)*s.b:1e9,k=bt-sb,oR=Math.min(g.cw*.47,H*.3);
  if(s.lbl)text(g,s.lbl,g.cx,H*.17,g.cw*.9,H*.07,{col:pal[0]});
  for(var o=0;o<3;o++){x.save();x.translate(cx,cy);x.rotate(o*Math.PI/3+(k>0?k*.8:0));var al=k>0?.4*Math.max(0,1-k):.4;x.strokeStyle=hexA(pal[0],al);x.lineWidth=1.5;x.beginPath();x.ellipse(0,0,oR,oR*.33,0,0,7);x.stroke();
    if(al>.02){var a=t*(2.4+o*.5)+o*2;x.globalAlpha=al/.4;var ex=Math.cos(a)*oR,ey=Math.sin(a)*oR*.33,eg2=x.createRadialGradient(ex,ey,0,ex,ey,12);eg2.addColorStop(0,"#fff");eg2.addColorStop(.35,hexA(pal[0],.8));eg2.addColorStop(1,hexA(pal[0],0));x.fillStyle=eg2;x.beginPath();x.arc(ex,ey,12,0,7);x.fill();x.globalAlpha=1}x.restore()}
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
  if(k1>0){x.globalAlpha=k1;text(g,s.l,g.cx-(1-eo(k1))*W*.6,H*.25,g.cw*.86,H*.15,{col:s.lc,hero:1,t:bt});if(s.ls)text(g,s.ls,g.cx,H*.355,g.cw*.8,H*.05,{kind:"s",max:24});x.globalAlpha=1}
  if(k3>0){x.globalAlpha=k3;text(g,s.r,g.cx+(1-eo(k3))*W*.6,H*.6,g.cw*.86,H*.15,{col:s.rc,hero:1,t:bt-t3});if(s.rs)text(g,s.rs,g.cx,H*.705,g.cw*.8,H*.05,{kind:"s",max:24});x.globalAlpha=1}
  if(k2>0){var sc=1+1.6*Math.exp(-14*k2),r=Math.min(g.cw,H)*.085*sc;x.fillStyle="#FFE14D";x.beginPath();x.arc(g.cx,mid,r,0,7);x.fill();x.lineWidth=4;x.strokeStyle="#000";x.stroke();text(g,"VS",g.cx,mid+1,r*1.3,r*1.1,{col:"#000",stroke:false})}};
D.list=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,per=s.per||1,n=s.items.length,i=Math.min(n-1,Math.floor(bt/per)),k=bt-i*per,a=eo(k*5);
  if(i>0&&k<.2){var b=eo(k*5);x.globalAlpha=1-b;text(g,s.items[i-1],g.cx-b*W*.8,H*.42,g.cw*.88,H*.24);x.globalAlpha=1}
  var dx=(1-a)*W*.8;if(a<1)for(var m=3;m>0;m--){x.globalAlpha=.12*m;text(g,s.items[i],g.cx+dx+m*22*(1-a),H*.42,g.cw*.88,H*.24,{stroke:false})}
  x.globalAlpha=1;var sc=1+.12*Math.exp(-12*k);x.save();x.translate(g.cx+dx,H*.42);x.scale(sc,sc);text(g,s.items[i],0,0,g.cw*.88,H*.24,{col:i===n-1&&s.last?s.last:null,glitch:G.gl,hero:1,t:k*1.5,stagger:.04});x.restore();
  var dw=14,sx=g.cx-(n-1)*dw/2;for(var d=0;d<n;d++){x.fillStyle=d<=i?pal[0]:"rgba(255,255,255,.25)";x.beginPath();x.arc(sx+d*dw,H*.6,d===i?5:3.5,0,7);x.fill()}};
D.decay=function(g,s,u,bt,p,pal){var x=g.x,H=g.H;
  var ord=cache(s,function(){var r=rng(3),a=[],rank=[];for(var i=0;i<100;i++)a.push(i);for(i=99;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}a.forEach(function(v,i){rank[v]=i});return rank});
  var k=Math.min(6,Math.floor(bt)),nk=Math.floor(100/Math.pow(2,k)),np=k?Math.floor(100/Math.pow(2,k-1)):100,f=bt-k,box=Math.min(g.cw*.78,H*.32),cs=box/10,x0=g.cx-box/2,y0=H*.48-box/2;
  for(var i=0;i<100;i++){var r=ord[i],cx=x0+(i%10+.5)*cs,cy=y0+(Math.floor(i/10)+.5)*cs;x.beginPath();
    if(r<nk){x.fillStyle=pal[0];x.arc(cx,cy,cs*.36*(1+.1*p),0,7)}else if(r<np&&f<.5){var q=f/.5;x.fillStyle="rgba(255,90,80,"+(1-q)+")";x.arc(cx,cy,cs*.36*(1+q),0,7)}else{x.fillStyle="rgba(255,255,255,.08)";x.arc(cx,cy,cs*.18,0,7)}x.fill()}
  var sc=1+.3*Math.exp(-10*f);x.save();x.translate(g.cx,H*.2);x.scale(sc,sc);text(g,String(nk),0,0,g.cw*.5,H*.11,{fitTo:"100",hero:1});x.restore();
  text(g,k+" HALF-LI"+(k===1?"FE":"VES"),g.cx,H*.67,g.cw*.8,H*.05,{col:pal[0],fitTo:"8 HALF-LIVES"})};
D.gauge=function(g,s,u,bt,p,pal){var x=g.x,W=g.W,H=g.H,v=s.calm?(s.from+s.to)/2+(s.to-s.from)/2*Math.sin(bt*Math.PI/2):s.from+(s.to-s.from)*u*u,hot=v>=90;
  if(hot&&Math.floor(bt*4)%2===0){x.fillStyle="rgba(255,0,0,.3)";x.fillRect(0,0,W,H)}
  if(s.lbl)text(g,s.lbl,g.cx,H*.24,g.cw*.9,H*.05,{kind:"s",col:pal[0],max:26});
  text(g,Math.round(v)+"%",g.cx,H*.39,g.cw*.8,H*.17,{fitTo:"100%",col:hot?"#ff4d4d":null,hero:1});
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
  if(s.txt)text(g,s.txt,g.cx,H*.42,g.cw*.88,H*.26,{glitch:G.gl,hero:1,t:bt,stagger:.05})};
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
  x.globalAlpha=.82+.18*Math.abs(Math.sin(t*37));text(g,out,g.cx,H*.4,g.cw*.86,H*.22,{fitTo:"8888",col:pal[0],hero:1});x.globalAlpha=1;
  if(s.sub&&bt>1){var n=Math.floor(s.sub.length*cl((bt-1)*2));text(g,s.sub.slice(0,n),g.cx,H*.54,g.cw*.86,H*.05,{kind:"s",fitTo:s.sub,max:26})}
  x.strokeStyle="rgba(255,240,220,.12)";x.lineWidth=1;for(var k=0;k<3;k++){var sx=(Math.sin(t*13+k*5)*.5+.5)*W;x.beginPath();x.moveTo(sx,0);x.lineTo(sx+3,H);x.stroke()}};
D.rings=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,cy=H*.4,R=Math.min(g.cw,H)*.2;
  for(var k=0;k<=Math.floor(bt);k++){var a=bt-k;if(a>2)continue;x.strokeStyle=hexA(pal[0],Math.max(0,.7-a*.35));x.lineWidth=3;x.beginPath();x.arc(g.cx,cy,R+a*R*1.4,0,7);x.stroke()}
  var sc=(1+1.2*Math.exp(-16*bt))*(1+.07*p);x.save();x.translate(g.cx,cy);x.scale(sc,sc);x.font=Math.round(R*1.3)+"px system-ui,'Apple Color Emoji','Segoe UI Emoji',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(s.g,0,R*.05);x.restore();
  if(s.txt)text(g,s.txt,g.cx,H*.63,g.cw*.86,H*.09,{glitch:G.gl,hero:1,t:bt-.3})};
D.pellet=function(g,s,u,bt,p,pal,t){var x=g.x,H=g.H,cx=g.cx,cy=H*.47,w=Math.min(g.cw*.3,H*.15),h=w*1.15;
  var hl=x.createRadialGradient(cx,cy,0,cx,cy,w*2.4);hl.addColorStop(0,hexA(pal[0],.45+.3*p));hl.addColorStop(1,hexA(pal[0],0));x.fillStyle=hl;x.fillRect(cx-w*3,cy-w*3,w*6,w*6);
  x.save();x.translate(cx,cy);x.rotate(Math.sin(t*1.2)*.12);var gr=x.createLinearGradient(-w/2,0,w/2,0);gr.addColorStop(0,"#18181c");gr.addColorStop(.35,"#6e6e75");gr.addColorStop(.6,"#3a3a40");gr.addColorStop(1,"#121215");
  x.fillStyle=gr;x.fillRect(-w/2,-h/2,w,h);x.beginPath();x.ellipse(0,h/2,w/2,w*.17,0,0,Math.PI);x.fill();x.fillStyle="#5a5a61";x.beginPath();x.ellipse(0,-h/2,w/2,w*.17,0,0,7);x.fill();x.restore();
  text(g,"≈ 1 cm",cx+w*.95,cy,g.cw*.3,H*.04,{kind:"s",max:16,align:"left"});
  if(s.txt)text(g,s.txt,g.cx,H*.2,g.cw*.86,H*.1,{hero:1,t:bt})};
function qlayout(g,s,reveal,p,pick){var x=g.x,H=g.H,bw=g.cw*.92,left=g.cx-bw/2,sz=Math.min(g.cw*.075,30),lines;
  for(;sz>12;sz--){x.font=fnt(sz,"s");lines=wrap(x,s.q,bw);if(lines.length*sz*1.2<=H*.19)break}
  x.textAlign="center";x.textBaseline="middle";x.lineJoin="round";lines.forEach(function(l,i){var y=H*.21-(lines.length-1)*sz*.6+i*sz*1.2;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(l,g.cx,y);x.fillStyle="#fff";x.fillText(l,g.cx,y)});
  var oh=H*.07,gap=H*.014,y0=H*.42;
  s.opts.forEach(function(o,i){var y=y0+i*(oh+gap),ok=i===s.ans,mine=pick===i;x.globalAlpha=reveal&&!ok&&!mine?.4:1;x.fillStyle=reveal&&ok?"rgba(46,200,130,.9)":reveal&&mine?"rgba(255,70,80,.85)":mine?"rgba(255,225,77,.35)":"rgba(0,0,0,.45)";rr(x,left,y,bw,oh,14);x.fill();x.lineWidth=2;x.strokeStyle=reveal&&ok?"#7dffc4":"rgba(255,255,255,.3)";x.stroke();
    var fs=Math.min(oh*.42,20);x.font=fnt(fs,"s");var label=(reveal&&ok?"✓ ":"ABCD"[i]+"  ")+o;while(x.measureText(label).width>bw-24&&fs>10){fs--;x.font=fnt(fs,"s")}x.textAlign="left";x.fillStyle="#fff";x.fillText(label,left+14,y+oh/2);x.globalAlpha=1});}
D.qtimer=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,seg=s.b/3,i=Math.min(2,Math.floor(bt/seg)),k=(bt-i*seg)/seg,num=3-i,r=Math.min(g.cw,H)*.06,cy=H*.335;
  qlayout(g,s,false,p);text(g,"👆 tap an answer",g.cx,H*.81,g.cw*.8,H*.04,{kind:"s",col:"#FFE14D",max:18});x.strokeStyle="rgba(255,255,255,.2)";x.lineWidth=6;x.beginPath();x.arc(g.cx,cy,r,0,7);x.stroke();x.strokeStyle=num===1?"#ff4d4d":"#FFE14D";x.beginPath();x.arc(g.cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-k));x.stroke();
  var sc=1+.5*Math.exp(-12*k*seg);x.save();x.translate(g.cx,cy);x.scale(sc,sc);text(g,String(num),0,2,r*1.2,r*1.3,{col:num===1?"#ff4d4d":"#fff"});x.restore()};
D.qreveal=function(g,s,u,bt,p,pal){var pk=g.E&&g.E.picks[g.ln+"_"+(g.i-1)];qlayout(g,s,true,p,pk);var sc=1+1.2*Math.exp(-14*bt),lb=pk==null?"ANSWER":pk===s.ans?"✓ CORRECT +5":"✗ NOPE",col=pk==null||pk===s.ans?"#7dffc4":"#ff6b6b";g.x.save();g.x.translate(g.cx,g.H*.335);g.x.scale(sc,sc);text(g,lb,0,0,g.cw*.8,g.H*.06,{col:col});g.x.restore()};
D.tfq=function(g,s,u,bt,p,pal){var x=g.x,H=g.H,sz=Math.min(g.cw*.09,38),lines;for(;sz>12;sz--){x.font=fnt(sz,"s");lines=wrap(x,s.q,g.cw*.9);if(lines.length*sz*1.2<=H*.3)break}
  x.textAlign="center";x.textBaseline="middle";x.lineJoin="round";lines.forEach(function(l,i){var y=H*.36-(lines.length-1)*sz*.6+i*sz*1.2;x.lineWidth=sz*.18;x.strokeStyle="rgba(0,0,0,.85)";x.strokeText(l,g.cx,y);x.fillStyle="#fff";x.fillText(l,g.cx,y)});
  var at=s.b*.5;if(bt<at){var c=Math.ceil((at-bt)/(at/3));text(g,"…"+c,g.cx,H*.6,g.cw*.4,H*.08,{col:pal[0],fitTo:"…8"});
    if(!(g.E&&g.E.picks[g.ln+"_"+g.i]!=null)){var bw=g.cw*.44,bh=H*.065;["TRUE","FALSE"].forEach(function(l,j){var X=g.cx+(j?g.cw*.02:-g.cw*.02-bw);x.fillStyle=j?"rgba(255,77,77,.85)":"rgba(63,217,154,.85)";rr(x,X,H*.71,bw,bh,bh/2);x.fill();text(g,l,X+bw/2,H*.71+bh/2+1,bw*.7,bh*.6,{stroke:false})});
      text(g,"tap a side",g.cx,H*.81,g.cw*.6,H*.035,{kind:"s",col:"#FFE14D",max:16})}}
  else{var k=bt-at,sc=k<.15?1+2.5*(1-k/.15):1,col=s.v?"#3fd99a":"#ff4d4d",tx=s.v?"TRUE":"FALSE";x.save();x.translate(g.cx,H*.62);x.rotate(-.16);x.scale(sc,sc);var z=fit(x,[tx],g.cw*.5,H*.1,"a");x.font=fnt(z,"a");var w=x.measureText(tx).width;x.strokeStyle=col;x.lineWidth=6;x.strokeRect(-w/2-14,-z*.62,w+28,z*1.2);x.fillStyle=col;x.textAlign="center";x.fillText(tx,0,z*.04);x.restore()}};

/* ================= player ================= */
/* Time model: A = absolute play time; the edit time is A minus "shifts". An untapped gate shot adds a hold shift each
   time playback reaches its end (so it loops, beat and all, until you tap). Tapping adds a negative shift that jumps
   straight to the next shot. The audio scheduler and the visuals both read the same mapping, so they stay in sync. */
function gatePrompt(g,s,p,t){var x=g.x,H=g.H,y=H*.69;
  if(s.gate==="tap"){var r=Math.min(g.cw,H)*.07;for(var k=0;k<2;k++){var a=(t*1.2+k*.5)%1;x.strokeStyle="rgba(255,225,77,"+((1-a)*.8)+")";x.lineWidth=3;x.beginPath();x.arc(g.cx,y,r*(1+a*1.6),0,7);x.stroke()}
    x.fillStyle="rgba(255,225,77,.95)";x.beginPath();x.arc(g.cx,y,r*(1+.08*p),0,7);x.fill();x.font=Math.round(r*1.05)+"px system-ui,'Apple Color Emoji','Segoe UI Emoji',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("👆",g.cx,y+2);
    text(g,s.prompt||"TAP!",g.cx,y+r*2.4,g.cw*.92,H*.05,{col:"#FFE14D"})}
  else if(s.gate==="choice"){var bw=g.cw*.47,bh=H*.075,gap=g.cw*.04;
    text(g,"TAP ONE",g.cx,y-H*.07,g.cw*.5,H*.032,{kind:"s",col:"#FFE14D",max:16});
    s.choices.forEach(function(c,i){var X=g.cx-gap/2-bw+i*(bw+gap),sc=1+.05*p;x.save();x.translate(X+bw/2,y);x.scale(sc,sc);x.fillStyle=i?"rgba(40,160,255,.92)":"rgba(255,59,92,.92)";rr(x,-bw/2,-bh/2,bw,bh,bh/2);x.fill();x.lineWidth=3;x.strokeStyle="#fff";x.stroke();text(g,c,0,1,bw*.8,bh*.58,{stroke:false});x.restore()})}}
function Player(el,def,hooks){
  var cv=el.querySelector(".ecv"),x=cv.getContext("2d"),g={x:x,cv:cv,W:0,H:0,cx:0,cw:0,dpr:1},bs=60/def.bpm,starts=[],tot=0,drop=-1,N=def.shots.length;
  def.shots.forEach(function(s){starts.push(tot);if(s.drop&&drop<0)drop=tot;tot+=s.b});
  var E={style:def.style||"phonk",root:220*Math.pow(2,(def.key||0)/12),step:bs/4,steps:tot*4,dropBeat:drop<0?0:drop,evs:{},playing:false,base:0,sync:0,clk:"p",next:0,
    pend:[],app:0,scan:0,tapped:{},seen:{},picks:{},res:null};
  var gateEnd={};def.shots.forEach(function(s,i){if(s.gate&&i<N-1)gateEnd[(starts[i]+s.b)*4]=i});
  g.E=E;
  def.shots.forEach(function(s,i){var s0=starts[i]*4,add=function(step,k){step=((Math.round(step)%E.steps)+E.steps)%E.steps;(E.evs[step]=E.evs[step]||[]).push(k)};
    if(s.drop){add(s0,"impact");if(starts[i]>=3&&!(i>0&&def.shots[i-1].gate))add(s0-12,"riser")}
    if(s.gate)for(var b=0;b<s.b;b++)add(s0+b*4,"tick");
    if(s.tr==="whip")add(s0,"whoosh");
    if(s.t==="stamp"&&!s.drop)add(s0+.6,"thud");
    if(s.t==="list")for(var k=1;k<s.items.length;k++)add(s0+k*(s.per||1)*4,"whoosh");
    if(s.t==="tfq")add(s0+s.b*2,"thud");
    if(s.t==="qtimer")for(var k2=0;k2<3;k2++)add(s0+k2*s.b/3*4,"tick")});
  var dur=tot*bs,raf=0,watched=false,prog=el.querySelector(".eprog i"),P;
  function clock(){return E.clk==="a"&&AU.c?AU.c.currentTime:performance.now()/1000}
  function T(){return E.playing?E.base+(clock()-E.sync):E.base}
  function resync(){var t=T();E.clk=(API.sound&&on())?"a":"p";E.base=t;E.sync=clock();E.next=Math.ceil(t/E.step-1e-6)}
  function editTime(A){var s=E.app;for(var j=0;j<E.pend.length;j++)if(E.pend[j].at<=A+1e-9)s+=E.pend[j].amt;return A-s}
  function es(n){return Math.round(editTime(n*E.step)/E.step)}
  function scan(n){for(;E.scan<=n;E.scan++){var e=es(E.scan),lp=((e%E.steps)+E.steps)%E.steps,gi=gateEnd[lp];if(gi!=null&&!E.tapped[Math.floor(e/E.steps)+"_"+gi])E.pend.push({at:E.scan*E.step,amt:def.shots[gi].b*bs})}}
  function shotAt(loc){var beat=loc/bs,i=0;while(i<N-1&&beat>=starts[i+1])i++;return i}
  function size(){var r=el.getBoundingClientRect();if(!r.width)return;g.dpr=Math.min([1,1.5,2][Q.lv],WIN.devicePixelRatio||1);g.W=r.width;g.H=r.height;var cw2=Math.round(g.W*g.dpr),ch2=Math.round(g.H*g.dpr);if(cv.width!==cw2||cv.height!==ch2){cv.width=cw2;cv.height=ch2}g.lv=Q.lv;var m=g.W<640?Math.min(66,g.W*.17):24;g.cw=g.W-2*m;g.cx=g.W/2}
  var TRS=["zoom","whip","spin","zoom","glitch","whip","flash","spin"],KICK={phonk:[0,7,10],hype:[0,4,8,12]};
  function kickP(beat){if(beat<E.dropBeat)return 0;var q16=(beat*4)%16,ks=KICK[E.style]||KICK.hype,last=-99;for(var k=0;k<ks.length;k++)if(ks[k]<=q16)last=ks[k];if(last<0)last=ks[ks.length-1]-16;return Math.exp(-7*(q16-last)/4)}
  function render(et,A){var W=g.W,H=g.H;if(!W)return;
    var loc=((et%dur)+dur)%dur,ln=Math.floor(et/dur),beat=loc/bs,i=shotAt(loc),key=ln+"_"+i;
    var s=def.shots[i],bt=beat-starts[i],u=bt/s.b,p=Math.exp(-5*(beat%1)),pn=s.c||def.pal[i%def.pal.length],pal=PAL[pn]||PAL.violet,kp=kickP(beat),hot=beat>=E.dropBeat&&E.dropBeat>0||s.drop;
    G.pal=pal;g.ln=ln;g.i=i;if(s.gate&&E.seen[key]==null)E.seen[key]=A;
    var tr=s.tr||TRS[(i+(def.id||"").length)%TRS.length],k=bt<.32?1-eo(bt/.32):0;
    G.gl=0;if(tr==="glitch"&&bt<.4)G.gl=8*(1-bt/.4);if(s.drop&&bt<.3)G.gl=Math.max(G.gl,7*(1-bt/.3));
    x.setTransform(g.dpr,0,0,g.dpr,0,0);x.globalAlpha=1;x.globalCompositeOperation="source-over";
    bg(g,pal,p,A,SCENE[pn]||"smoke",kp,hot);
    if(s.drop)dropFX(g,pal,bt,i*31+7);
    x.save();
    var z=(1+(s.z!=null?s.z:.08)*Math.exp(-9*bt)+(s.t==="slam"?.012*p:0)+.035*kp+.02*Math.sin(A*.5))*(tr==="zoom"?1+.6*k:tr==="spin"?1+.3*k:1),
      rot=Math.sin(A*.35)*.018+(tr==="spin"?.7*k*(i%2?1:-1):0),late=s.t==="stamp"?.15:0,
      amp=(s.drop?16:s.t==="stamp"?12:s.shake?9:0)*(bt<late?0:Math.exp(-6*(bt-late)))+2.5*kp,
      sx=amp*Math.sin(A*93.1),sy=amp*Math.cos(A*71.7),wx=tr==="whip"?W*.9*k*(i%2?1:-1):0;
    x.translate(g.cx+sx+wx,H*.42+sy);x.rotate(rot);x.scale(z,z);x.translate(-g.cx,-H*.42);
    try{(D[s.t]||D.slam)(g,s,u,bt,p,pal,A)}catch(e){}
    x.restore();
    if(k>0){if(tr==="zoom"||tr==="spin")zblur(g,k*7);else if(tr==="whip")dblur(g,(i%2?1:-1)*k*60)}
    if(tr==="flash"&&k>0||((s.drop||s.fl)&&bt<.5)){x.fillStyle="rgba(255,255,255,"+(.85*(s.drop||s.fl?Math.exp(-9*bt):k))+")";x.fillRect(0,0,W,H)}
    if(G.gl>0)slices(g);
    bloom(g,hot?.75:.55);
    if(s.drop||s.box){var lb=H*.075*eo(bt*3);x.fillStyle="#000";x.fillRect(0,0,W,lb);x.fillRect(0,H-lb,W,lb)}
    post(g,p,A,kp,pal);
    if(s.gate&&!E.tapped[key])gatePrompt(g,s,p,A);
    var cy=s.gate?.86:CAPY[s.t]!=null?CAPY[s.t]:.74;if(s.cap&&cy)caption(g,s.cap,u,cy);
    if(E.res&&A<E.res.until&&s.t!=="qreveal"){var r=E.res,k2=1-(r.until-A)/1.4,sc=1+.7*Math.exp(-12*k2);x.save();x.translate(g.cx,H*.135);x.scale(sc,sc);text(g,r.txt,0,0,g.cw*.95,H*.065,{col:r.col});x.restore()}
    watermark(g,loc/dur);
    if(prog)prog.style.transform="scaleX("+(loc/dur).toFixed(4)+")";
  }
  var lastF=0;
  function loop(){raf=requestAnimationFrame(loop);var nowF=performance.now();if(lastF&&!API.moving)qTick(nowF-lastF);lastF=nowF;if(g.lv!==Q.lv)size();var A=T();scan(Math.floor(A/E.step));
    if(E.pend.length)E.pend=E.pend.filter(function(pp){if(pp.at<A-.5){E.app+=pp.amt;return false}return true});
    var et=editTime(A);render(et,A);if(!watched&&et>=dur){watched=true;if(hooks&&hooks.watched)hooks.watched()}}
  function reset(){E.base=0;E.next=0;E.pend=[];E.app=0;E.scan=0;E.tapped={};E.seen={};E.picks={};E.res=null}
  P={E:E,scan:scan,es:es,
    start:function(){lastF=0;size();CUR=P;reset();E.clk="p";E.sync=clock();E.playing=true;resync();el.classList.remove("paused");if(!raf)loop()},
    stop:function(){if(E.playing){E.base=T();E.playing=false}cancelAnimationFrame(raf);raf=0;if(CUR===P)CUR=null},
    toggle:function(){if(E.playing){E.base=T();E.playing=false;el.classList.add("paused")}else{E.sync=clock();E.playing=true;resync();el.classList.remove("paused")}return E.playing},
    resync:function(){if(E.playing)resync()},
    size:function(){size();var A=T();render(editTime(A),A)},
    poster:function(){size();var A=(starts[Math.min(1,N-1)]+.7)*bs;render(A,A)},
    /* returns true if the tap was used by the edit (a gate, a quiz answer or a true/false pick) */
    tap:function(xf,yf){if(!E.playing||!g.W)return false;var A=T();scan(Math.floor(A/E.step));
      var et=editTime(A),loc=((et%dur)+dur)%dur,ln=Math.floor(et/dur),i=shotAt(loc),s=def.shots[i],bt=loc/bs-starts[i],key=ln+"_"+i,target=null,r={};
      if(E.tapped[key])return false;
      if(s.gate==="tap"){target=s.b;r.ms=Math.max(0,Math.round((A-(E.seen[key]!=null?E.seen[key]:A))*1000));r.txt="⚡ "+(r.ms/1000).toFixed(2)+"s";r.col="#FFE14D"}
      else if(s.gate==="choice"){r.pick=xf<.5?0:1;r.ok=r.pick===s.ans;target=s.b}
      else if(s.t==="qtimer"){var H=g.H,oh=H*.07,gap=H*.014,y0=H*.42,yy=yf*H,idx=Math.floor((yy-y0)/(oh+gap));if(idx<0||idx>=s.opts.length||yy-y0-idx*(oh+gap)>oh+gap*.5)return false;r.pick=idx;r.ok=idx===s.ans;target=s.b}
      else if(s.t==="tfq"&&bt<s.b*.5){r.pick=xf<.5?0:1;r.ok=(r.pick===0)===!!s.v;target=s.b*.5}
      else return false;
      if(r.ok!=null){r.txt=r.ok?"✓ CORRECT +5":"✗ NOPE";r.col=r.ok?"#3fd99a":"#ff4d4d"}
      E.tapped[key]=true;if(r.pick!=null)E.picks[key]=r.pick;
      var rem=Math.max(0,(target-bt)*bs);E.pend=E.pend.filter(function(pp){return pp.at<=A});E.pend.push({at:A,amt:-rem});
      E.next=Math.ceil(A/E.step-1e-6);E.scan=E.next;E.res={txt:r.txt,col:r.col,until:A+1.4};
      if(hooks&&hooks.gate)hooks.gate(r);return true}};
  return P;
}

/* ================= the edits ================= */
var EDITS=[
{id:"e-fission",title:"Splitting an atom in 10 seconds ⚛️",topic:"reactor",tags:"#fission #physics #nuclear",style:"phonk",bpm:140,key:5,pal:["violet","fire","gold","ice","toxic","violet","fire"],shots:[
 {t:"type",b:4,txt:"what actually happens when you split an atom?",cap:"what happens when you split an atom"},
 {t:"atom",b:2,hit:1,gate:"tap",prompt:"TAP TO FIRE THE NEUTRON",cap:"fire a neutron at uranium-235"},
 {t:"atom",b:3,split:1,at:.05,drop:1,cap:"and it splits in two"},
 {t:"count",b:4,from:0,to:200,unit:"MeV",lbl:"ENERGY RELEASED",cap:"releasing about 200 MeV"},
 {t:"slam",b:3,txt:"50,000,000×",sub:"more than burning a molecule",tr:"whip",cap:"fifty million times more than burning"},
 {t:"chain",b:6,cap:"and 2 or 3 new neutrons go on to split more atoms"},
 {t:"slam",b:4,txt:"THAT'S A\nREACTOR.",tr:"glitch",cap:"keep that steady and you've got a reactor"}]},
{id:"e-bomb",title:"Can a reactor explode like a nuke? 💥",topic:"reactor",tags:"#mythbusting #nuclear #chernobyl",style:"phonk",bpm:150,key:7,pal:["fire","ice","fire","violet","gold"],shots:[
 {t:"type",b:4,txt:"can a nuclear reactor explode like a bomb?",cap:"can a nuclear reactor explode like a bomb"},
 {t:"versus",b:5,l:"BOMB",ls:"about 90% uranium-235",r:"REACTOR",rs:"only 3–5% uranium-235",lc:"#ff3b30",rc:"#3ad4ff",cap:"a bomb needs 90% uranium-235. fuel is 3 to 5%"},
 {t:"slam",b:2,txt:"MYTH OR\nFACT?",gate:"choice",choices:["MYTH","FACT"],ans:0,cap:"a reactor can blow up like a nuke. myth or fact"},
 {t:"stamp",b:3,txt:"MYTH",under:"NUCLEAR\nEXPLOSION",col:"#ff3b30",drop:1,cap:"so no. it physically can't"},
 {t:"slam",b:3,txt:"PHYSICALLY\nIMPOSSIBLE",tr:"whip",cap:"physically impossible"},
 {t:"slam",b:4,txt:"STEAM\nEXPLOSION",sub:"what actually wrecked Chernobyl",tr:"glitch",cap:"Chernobyl was a steam explosion, not a nuclear one"}]},
{id:"e-halflife",title:"Half-life, but make it fast ⏳",topic:"radiation",tags:"#halflife #gcsephysics #radiation",style:"hype",bpm:128,key:0,pal:["gold","toxic","pink","violet"],shots:[
 {t:"slam",b:2,txt:"HALF-LIFE",gate:"tap",prompt:"TAP TO START THE CLOCK",cap:"half-life"},
 {t:"decay",b:7,drop:1,cap:"every half-life, half of what's left decays"},
 {t:"list",b:4,items:["HEAT?","PRESSURE?","CHEMICALS?","NOTHING."],last:"#FFE14D",cap:"and nothing can speed it up"},
 {t:"slam",b:4,txt:"RANDOM.",sub:"but perfectly predictable",tr:"glitch",cap:"one atom is random. a million are predictable"}]},
{id:"e-pellet",title:"This pellet = a tonne of coal 🪨",topic:"reactor",tags:"#uranium #energy #nuclear",style:"phonk",bpm:145,key:2,pal:["gold","toxic","mono","gold","violet"],shots:[
 {t:"pellet",b:4,txt:"THIS PELLET",cap:"this uranium pellet is about the size of your fingertip"},
 {t:"slam",b:2,txt:"SAME ENERGY\nAS HOW MUCH\nCOAL?",gate:"choice",choices:["1 KG","1 TONNE"],ans:1},
 {t:"versus",b:4,l:"1 PELLET",ls:"fingertip-sized",r:"1 TONNE",rs:"of coal",lc:"#F2C46D",rc:"#9a9a9a",drop:1,cap:"same energy as burning a tonne of coal"},
 {t:"count",b:4,from:0,to:1000,unit:"KG OF COAL",lbl:"ONE PELLET =",cap:"one thousand kilograms"},
 {t:"slam",b:4,txt:"NUCLEAR.",tr:"glitch",cap:"that's nuclear"}]},
{id:"e-delayed",title:"Why reactors don't run away 🧠",topic:"reactor",tags:"#reactorphysics #neutrons",style:"hype",bpm:128,key:5,pal:["ice","violet","gold","teal","ice"],shots:[
 {t:"type",b:4,txt:"why don't nuclear reactors just run away?",cap:"why don't reactors just run away"},
 {t:"count",b:4,from:0,to:99.35,dec:2,unit:"%",lbl:"OF NEUTRONS ARE INSTANT",cap:"99.35% of neutrons appear instantly"},
 {t:"slam",b:2,txt:"SO WHAT\nSLOWS IT?",gate:"tap",prompt:"TAP TO FIND OUT"},
 {t:"slam",b:4,txt:"0.65%",sub:"turn up seconds later",drop:1,cap:"but 0.65% turn up seconds later"},
 {t:"gauge",b:4,from:45,to:55,calm:1,lbl:"SLOW ENOUGH TO CONTROL",cap:"and that slows the whole reactor down"},
 {t:"slam",b:4,txt:"DELAYED\nNEUTRONS",sub:"the whole trick",tr:"glitch",cap:"delayed neutrons. that's the trick"}]},
{id:"e-scram",title:"What a SCRAM looks like 🚨",topic:"ops",tags:"#controlroom #scram #operator",style:"phonk",bpm:150,key:4,pal:["ice","fire","fire","mono","teal"],shots:[
 {t:"gauge",b:6,from:62,to:104,lbl:"REACTOR POWER",cap:"power climbing too fast"},
 {t:"slam",b:2,txt:"TRIP!",col:"#ff4d4d",strobe:1,gate:"tap",prompt:"TAP TO SCRAM!",cap:"reactor trip. hit scram"},
 {t:"slam",b:2,txt:"SCRAM",strobe:1,drop:1,tr:"glitch",cap:"scram"},
 {t:"list",b:4,items:["MAGNETS CUT","RODS FALL","GRAVITY WINS","SHUT DOWN ✓"],last:"#3fd99a",cap:"every rod drops in on gravity alone"},
 {t:"slam",b:4,txt:"FAIL-SAFE.",sub:"no power needed to stop it",cap:"fail-safe. no power needed to stop it"}]},
{id:"e-empty",title:"You are 99.9% empty space 🏟️",topic:"atoms",tags:"#atoms #mindblown #physics",style:"hype",bpm:124,key:10,pal:["teal","teal","violet","pink","gold"],shots:[
 {t:"type",b:3,txt:"you are almost entirely empty space",cap:"you are almost entirely empty space"},
 {t:"slam",b:2,txt:"HOW MUCH WIDER\nIS AN ATOM THAN\nITS NUCLEUS?",gate:"choice",choices:["100×","100,000×"],ans:1},
 {t:"zoom",b:8,drop:1,cap:"if the nucleus were a pea, the atom would be a whole stadium"},
 {t:"slam",b:3,txt:"100,000×",sub:"wider than its nucleus",tr:"whip",cap:"an atom is 100,000 times wider than its nucleus"},
 {t:"slam",b:3,txt:"SO WHY DON'T\nYOU FALL\nTHROUGH?",cap:"so why don't you fall through the floor"},
 {t:"slam",b:3,txt:"ELECTRONS\nPUSH BACK",tr:"glitch",cap:"electrons push back"}]},
{id:"e-blue",title:"Why reactor pools glow blue 💙",topic:"space",tags:"#cherenkov #physics #satisfying",style:"hype",bpm:128,key:2,pal:["blue","blue","ice","blue"],shots:[
 {t:"glow",b:2,gate:"tap",prompt:"TAP TO LOOK INTO THE POOL",cap:"why do reactor pools glow blue"},
 {t:"slam",b:3,txt:"FASTER\nTHAN LIGHT",drop:1,c:"blue",cap:"particles going faster than light"},
 {t:"stamp",b:3,txt:"IN WATER",col:"#3ad4ff",under:"FASTER\nTHAN LIGHT",cap:"in water. light only goes 75% speed there"},
 {t:"glow",b:5,txt:"CHERENKOV\nRADIATION",cap:"it's a sonic boom, but made of light"}]},
{id:"e-1942",title:"The first reactor was under a squash court 🏟️",topic:"history",tags:"#history #fermi #nuclear",style:"phonk",bpm:136,key:9,pal:["sepia","sepia","gold","sepia","fire"],shots:[
 {t:"year",b:4,y:"1942",sub:"2 December · Chicago",cap:"2nd December 1942. Chicago"},
 {t:"slam",b:3,txt:"UNDER A\nSQUASH COURT",tr:"whip",cap:"under the stands of a university sports field"},
 {t:"slam",b:2,txt:"READY?",gate:"tap",prompt:"TAP TO GO CRITICAL"},
 {t:"count",b:4,from:0,to:.5,dec:1,unit:"WATTS",lbl:"THE FIRST CHAIN REACTION",drop:1,cap:"the first ever chain reaction made half a watt"},
 {t:"list",b:4,per:1.33,items:["NO SHIELDING","NO COOLING","ONE AXE"],last:"#FFE14D",cap:"no shielding. no cooling. a man with an axe on standby"},
 {t:"slam",b:4,txt:"CHICAGO\nPILE-1",tr:"glitch",cap:"Chicago Pile-1"}]},
{id:"e-rutherford",title:"The experiment that found the nucleus 🎯",topic:"history",tags:"#rutherford #gcse #atoms",style:"hype",bpm:120,key:7,pal:["sepia","gold","fire","sepia","violet"],shots:[
 {t:"year",b:3,y:"1909",sub:"Manchester",cap:"1909. alpha particles fired at gold foil"},
 {t:"slam",b:3,txt:"GOLD FOIL",cap:"most went straight through"},
 {t:"slam",b:2,txt:"DID ANY\nBOUNCE BACK?",gate:"choice",choices:["NO","YES"],ans:1},
 {t:"slam",b:3,txt:"1 IN 8,000",sub:"bounced straight back",drop:1,cap:"but about 1 in 8,000 bounced straight back"},
 {t:"quote",b:9,txt:"“As if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you.”",who:"Ernest Rutherford"},
 {t:"slam",b:4,txt:"THE\nNUCLEUS",tr:"glitch",cap:"he'd discovered the nucleus"}]},
{id:"e-shield",title:"Alpha, beta, gamma in 10 seconds 🛡️",topic:"radiation",tags:"#gcsephysics #radiation #revision",style:"phonk",bpm:145,key:0,pal:["gold","fire","ice","toxic","gold"],shots:[
 {t:"slam",b:2,txt:"KNOW YOUR\nSHIELDING",cap:"know your shielding"},
 {t:"slam",b:2,txt:"CAN PAPER\nSTOP ALPHA?",gate:"choice",choices:["YES","NO"],ans:0},
 {t:"versus",b:3,l:"ALPHA",ls:"α · most ionising",r:"PAPER",rs:"stops it",lc:"#ff4d4d",rc:"#f3f2ee",drop:1,cap:"alpha. stopped by paper"},
 {t:"versus",b:3,l:"BETA",ls:"β · fast electrons",r:"ALUMINIUM",rs:"a few mm",lc:"#3ad4ff",rc:"#b8c2cc",cap:"beta. a few mm of aluminium"},
 {t:"versus",b:3,l:"GAMMA",ls:"γ · electromagnetic wave",r:"LEAD",rs:"thick lead or concrete",lc:"#9cff3a",rc:"#8a8f99",cap:"gamma. thick lead or concrete"},
 {t:"slam",b:3,txt:"EXAM\nREADY.",tr:"glitch",cap:"exam ready"}]},
{id:"e-banana",title:"Your banana is radioactive 🍌",topic:"radiation",tags:"#funfact #radiation #science",style:"hype",bpm:128,key:3,pal:["gold","gold","toxic","pink","gold"],shots:[
 {t:"slam",b:2,txt:"YOUR BANANA\nIS RADIOACTIVE",cap:"your banana is radioactive"},
 {t:"slam",b:2,txt:"HOW MANY\nPER SECOND?",gate:"choice",choices:["15","15,000"],ans:0,cap:"how many atoms decay in a banana every second"},
 {t:"count",b:4,from:0,to:15,unit:"DECAYS / SECOND",lbl:"POTASSIUM-40",drop:1,cap:"about 15 atoms decay inside it every second"},
 {t:"stamp",b:2,txt:"FACT",col:"#3fd99a",cap:"fact"},
 {t:"count",b:4,from:0,to:4000,unit:"DECAYS / SECOND",lbl:"YOUR BODY",cap:"your body? about 4,000"},
 {t:"slam",b:4,txt:"STILL EAT\nIT.",sub:"totally harmless",tr:"glitch",cap:"still eat it. totally harmless"}]},
{id:"e-fukushima",title:"Fukushima: the reactors shut down. Then… 🌊",topic:"history",tags:"#fukushima #decayheat #history",style:"phonk",bpm:140,key:1,pal:["sepia","teal","fire","gold","fire"],shots:[
 {t:"year",b:4,y:"2011",sub:"Fukushima Daiichi",cap:"2011. Fukushima Daiichi"},
 {t:"slam",b:3,txt:"REACTORS\nSHUT DOWN ✓",cap:"the earthquake hit and the reactors shut down perfectly"},
 {t:"slam",b:3,txt:"THEN THE\nWAVE CAME",strobe:1,drop:1,cap:"then the tsunami flooded the backup generators"},
 {t:"slam",b:2,txt:"SHUT DOWN =\nNO MORE HEAT?",gate:"choice",choices:["TRUE","FALSE"],ans:1},
 {t:"count",b:4,from:0,to:7,unit:"% OF FULL POWER",lbl:"STILL BEING MADE",cap:"but a shut-down reactor still makes heat"},
 {t:"slam",b:4,txt:"DECAY\nHEAT",sub:"cooling must never stop",tr:"glitch",cap:"decay heat. cooling must never stop"}]},
{id:"e-sun",title:"The Sun loses 4 million tonnes a second ☀️",topic:"atoms",tags:"#fusion #space #emc2",style:"hype",bpm:126,key:8,pal:["gold","fire","gold","violet"],shots:[
 {t:"rings",b:3,g:"☀️",cap:"every single second the Sun fuses"},
 {t:"slam",b:2,txt:"FISSION OR\nFUSION?",gate:"choice",choices:["FISSION","FUSION"],ans:1,cap:"what powers the Sun"},
 {t:"count",b:4,from:0,to:600,unit:"MILLION TONNES",lbl:"OF HYDROGEN EVERY SECOND",drop:1,cap:"600 million tonnes of hydrogen"},
 {t:"slam",b:4,txt:"4,000,000\nTONNES",sub:"turn into pure energy",tr:"whip",cap:"and 4 million tonnes of it turns into pure energy"},
 {t:"slam",b:4,txt:"E = mc²",tr:"glitch",cap:"E equals m c squared"}]},
{id:"e-kettle",title:"Why the grid fears half-time ☕",topic:"energy",tags:"#nationalgrid #tvpickup #uk",style:"phonk",bpm:140,key:6,pal:["blue","gold","ice","blue"],shots:[
 {t:"type",b:3,txt:"the final whistle blows…",cap:"the final whistle blows"},
 {t:"list",b:3,items:["☕","☕☕","☕☕☕"],cap:"and millions of people put the kettle on"},
 {t:"slam",b:2,txt:"HOW BIG WAS\nTHE SURGE?",gate:"choice",choices:["28 MW","2,800 MW"],ans:1},
 {t:"count",b:4,from:0,to:2800,unit:"MEGAWATTS",lbl:"DEMAND JUMP · 1990",drop:1,cap:"after England v West Germany in 1990 demand jumped 2,800 megawatts"},
 {t:"slam",b:4,txt:"TV PICKUP",sub:"the grid plans for it",tr:"glitch",cap:"it's called TV pickup. the grid plans for it"}]},
{id:"e-xenon",title:"The reactor poisons itself ☠️",topic:"reactor",tags:"#xenon #reactorphysics",style:"hype",bpm:128,key:4,pal:["toxic","violet","toxic","gold","fire"],shots:[
 {t:"slam",b:3,txt:"THE REACTOR\nPOISONS ITSELF",cap:"a reactor makes its own poison"},
 {t:"rings",b:3,g:"☠️",txt:"XENON-135",drop:1,cap:"xenon-135"},
 {t:"slam",b:3,txt:"NEUTRON\nSPONGE",tr:"whip",cap:"it soaks up neutrons better than almost anything"},
 {t:"slam",b:2,txt:"WHEN DOES\nXENON PEAK?",gate:"choice",choices:["10 HOURS","10 SECONDS"],ans:0},
 {t:"count",b:4,from:0,to:10,unit:"HOURS AFTER SHUTDOWN",lbl:"IT PEAKS ABOUT",cap:"after a shutdown it peaks about 10 hours later"},
 {t:"slam",b:4,txt:"THE XENON\nPIT",tr:"glitch",cap:"operators call it the xenon pit"}]},
{id:"e-meitner",title:"She explained fission. He got the Nobel. 🧠",topic:"history",tags:"#womeninscience #history #fission",style:"phonk",bpm:138,key:11,pal:["sepia","sepia","gold","fire","violet"],shots:[
 {t:"year",b:4,y:"1938",sub:"barium where uranium should be",cap:"1938. Otto Hahn finds barium in his uranium"},
 {t:"slam",b:3,txt:"LISE\nMEITNER",tr:"whip",cap:"Lise Meitner works out what happened"},
 {t:"slam",b:2,txt:"WHAT IF IT\nSPLIT?",gate:"tap",prompt:"TAP TO SPLIT IT"},
 {t:"atom",b:4,split:1,at:.1,drop:1,cap:"the nucleus had split in two"},
 {t:"slam",b:3,txt:"1944 NOBEL",sub:"awarded to Hahn alone",cap:"the 1944 Nobel Prize went to Hahn alone"},
 {t:"slam",b:4,txt:"ELEMENT\n109",sub:"meitnerium is named after her",tr:"glitch",cap:"now element 109 is named after her"}]},
{id:"e-voyager",title:"Voyager is still running on plutonium 🛰️",topic:"space",tags:"#space #voyager #nuclear",style:"hype",bpm:122,key:9,pal:["violet","blue","gold","violet"],shots:[
 {t:"year",b:3,y:"1977",sub:"Voyager 1 launches",cap:"1977. Voyager 1 launches"},
 {t:"slam",b:2,txt:"IS VOYAGER\nSTILL WORKING?",gate:"choice",choices:["YES","NO"],ans:0},
 {t:"rings",b:3,g:"🛰️",txt:"STILL TALKING",drop:1,cap:"it's still sending messages home"},
 {t:"slam",b:4,txt:"PLUTONIUM-238",sub:"decay heat → electricity",tr:"whip",cap:"powered by the heat of decaying plutonium-238"},
 {t:"slam",b:4,txt:"NO CHAIN\nREACTION",sub:"just radioactive decay",tr:"glitch",cap:"no reactor. just decay heat"}]},
/* ---- story edits: true, dramatic and a bit unbelievable ---- */
{id:"s-bugorski",title:"He put his head in a particle accelerator 😳",topic:"history",tags:"#truestory #physics #storytime",style:"phonk",bpm:146,key:3,pal:["ice","fire","blue","violet","toxic","teal"],shots:[
 {t:"year",b:4,y:"1978",sub:"Protvino, USSR",cap:"1978. a scientist leans in to check a broken particle accelerator"},
 {t:"slam",b:3,txt:"THE BEAM\nWAS STILL ON",strobe:1,cap:"nobody had switched the proton beam off"},
 {t:"rings",b:3,g:"⚡",txt:"STRAIGHT THROUGH\nHIS HEAD",drop:1,cap:"it went straight through the back of his head"},
 {t:"quote",b:7,txt:"“Brighter than a thousand suns.”",who:"Anatoli Bugorski, on the flash he saw"},
 {t:"slam",b:2,txt:"DID HE\nSURVIVE?",gate:"choice",choices:["YES","NO"],ans:0,cap:"so did he survive"},
 {t:"stamp",b:3,txt:"SURVIVED",col:"#3fd99a",under:"HEAD IN\nTHE BEAM",cap:"he survived, with half his face paralysed"},
 {t:"slam",b:4,txt:"THEN FINISHED\nHIS PHD",tr:"glitch",cap:"and he went back to work and finished his PhD"}]},
{id:"s-demon",title:"The Demon Core ☠️",topic:"history",tags:"#demoncore #history #storytime",style:"phonk",bpm:140,key:8,pal:["fire","sepia","blue","fire","violet"],shots:[
 {t:"type",b:4,txt:"scientists nicknamed one plutonium sphere the demon core",cap:"one plutonium sphere got a nickname: the demon core"},
 {t:"count",b:3,from:0,to:6.2,dec:1,unit:"KG OF PLUTONIUM",lbl:"ONE SPHERE",cap:"6.2 kilograms of plutonium"},
 {t:"year",b:3,y:"1946",sub:"Los Alamos",cap:"1946. a physicist holds two halves of a cover apart with a screwdriver"},
 {t:"slam",b:2,txt:"THE SCREWDRIVER\nSLIPS…",gate:"choice",choices:["BLUE FLASH","NOTHING"],ans:0,cap:"the screwdriver slips. what happens"},
 {t:"glow",b:4,txt:"BLUE\nFLASH",drop:1,cap:"for a split second it went critical. a blue flash filled the room"},
 {t:"slam",b:3,txt:"TWO\nACCIDENTS",sub:"1945 and 1946",tr:"whip",cap:"the same core killed two scientists in two accidents"},
 {t:"slam",b:4,txt:"NOW: BY\nREMOTE",sub:"nobody does this by hand any more",tr:"glitch",cap:"experiments like that are now done by remote control"}]},
{id:"s-boyscout",title:"A teenager tried to build a reactor in a shed 🏚️",topic:"history",tags:"#truestory #nuclear #storytime",style:"hype",bpm:128,key:5,pal:["gold","toxic","pink","fire","gold"],shots:[
 {t:"type",b:4,txt:"a 17-year-old tried to build a nuclear reactor in his mum's garden shed",cap:"a teenager tried to build a nuclear reactor in a shed"},
 {t:"year",b:3,y:"1994",sub:"Michigan, USA",cap:"1994. Michigan"},
 {t:"list",b:4,items:["SMOKE ALARMS","CAMPING LANTERNS","OLD CLOCKS"],cap:"he collected radioactive bits from smoke alarms, lantern mantles and old clocks"},
 {t:"slam",b:2,txt:"WHAT DID HE\nEND UP WITH?",gate:"choice",choices:["A REACTOR","A HAZMAT SITE"],ans:1,cap:"so what did he end up with"},
 {t:"stamp",b:3,txt:"HAZMAT",col:"#ff4d4d",under:"THE SHED",drop:1,cap:"the shed got so radioactive it was taken apart and buried as nuclear waste"},
 {t:"slam",b:4,txt:"DON'T\nTRY THIS",sub:"seriously",tr:"glitch",cap:"please don't try this"}]},
{id:"s-radium",title:"The Radium Girls 💀",topic:"history",tags:"#history #radium #storytime",style:"phonk",bpm:134,key:10,pal:["sepia","sepia","toxic","fire","gold","violet"],shots:[
 {t:"year",b:4,y:"1917",sub:"New Jersey, USA",cap:"1917. young women paint glowing numbers on watch dials"},
 {t:"list",b:4,items:["LIP","DIP","PAINT"],last:"#9cff3a",cap:"they were told to shape their brushes with their lips. lip, dip, paint"},
 {t:"slam",b:2,txt:"WAS IT\nSAFE?",gate:"choice",choices:["YES","NO"],ans:1,cap:"their bosses said it was perfectly safe"},
 {t:"slam",b:3,txt:"RADIUM\nPAINT",sub:"it glowed in the dark",drop:1,c:"toxic",cap:"the paint was made with radium"},
 {t:"slam",b:3,txt:"THEY SUED\nAND WON",tr:"whip",cap:"they became very ill, took the company to court and won"},
 {t:"slam",b:4,txt:"SAFETY\nLAWS",sub:"exist partly because of them",tr:"glitch",cap:"their fight changed worker safety rules for good"}]},
{id:"s-pascal",title:"The steel lid blasted at 66 km/s 🚀",topic:"history",tags:"#plumbbob #fastest #storytime",style:"phonk",bpm:150,key:1,pal:["sepia","mono","fire","ice","violet"],shots:[
 {t:"year",b:3,y:"1957",sub:"Operation Plumbbob",cap:"1957. a small nuclear test at the bottom of a deep shaft"},
 {t:"slam",b:3,txt:"STEEL LID\nON TOP",sub:"about 900 kg",cap:"the shaft was capped with a huge steel lid"},
 {t:"slam",b:2,txt:"3… 2… 1…",gate:"tap",prompt:"TAP TO DETONATE",cap:"three, two, one"},
 {t:"count",b:4,from:0,to:66,unit:"KM PER SECOND",lbl:"ONE ESTIMATE OF THE LID'S SPEED",drop:1,cap:"one estimate put the lid at 66 kilometres per second"},
 {t:"versus",b:4,l:"THE LID",ls:"about 66 km/s",r:"ESCAPE SPEED",rs:"11 km/s",lc:"#ff4d4d",rc:"#3ad4ff",cap:"about six times faster than you need to escape Earth"},
 {t:"slam",b:4,txt:"NEVER\nFOUND",sub:"it probably burned up in the air",tr:"glitch",cap:"it was never found. it probably burned up"}]},
{id:"s-tsar",title:"The biggest explosion humans ever made 💥",topic:"history",tags:"#tsarbomba #history",style:"hype",bpm:126,key:6,pal:["sepia","fire","fire","gold","violet"],shots:[
 {t:"year",b:3,y:"1961",sub:"Tsar Bomba",cap:"1961. the biggest bomb ever tested"},
 {t:"slam",b:2,txt:"HOW MANY\nHIROSHIMAS?",gate:"choice",choices:["30","3,000"],ans:1,cap:"how many times bigger than Hiroshima"},
 {t:"count",b:4,from:0,to:50,unit:"MEGATONS OF TNT",lbl:"TSAR BOMBA",drop:1,cap:"50 megatons. over three thousand Hiroshimas"},
 {t:"slam",b:3,txt:"CLOUD 60 KM\nHIGH",sub:"about seven Everests",tr:"whip",cap:"the mushroom cloud rose about 60 kilometres"},
 {t:"slam",b:4,txt:"TOO BIG\nTO USE",sub:"it was a show of strength",tr:"glitch",cap:"it was far too big to ever be useful. it was a show of strength"}]},
{id:"s-orion",title:"A spaceship that rode on nuclear bombs 🚀",topic:"space",tags:"#projectorion #space #engineering",style:"hype",bpm:130,key:2,pal:["violet","blue","ice","fire","violet"],shots:[
 {t:"type",b:4,txt:"scientists once seriously designed a spaceship pushed along by nuclear explosions",cap:"scientists once designed a spaceship pushed by nuclear bombs"},
 {t:"year",b:3,y:"1958",sub:"Project Orion",cap:"1958. Project Orion"},
 {t:"list",b:4,items:["DROP A BOMB","BOOM","PUSH","REPEAT"],last:"#FFE14D",cap:"drop a small bomb out the back, it explodes, a giant plate takes the push"},
 {t:"slam",b:2,txt:"DID IT FLY\nWITH REAL NUKES?",gate:"choice",choices:["YES","NO"],ans:1},
 {t:"stamp",b:3,txt:"NEVER",col:"#ff4d4d",under:"NUCLEAR\nLAUNCH",drop:1,cap:"never. only small models flew, using ordinary explosives"},
 {t:"slam",b:4,txt:"BANNED",sub:"by the 1963 test ban treaty",tr:"glitch",cap:"the treaty banning nuclear tests in space helped end it"}]},
{id:"s-elephant",title:"The Elephant's Foot under Chernobyl 🐘",topic:"history",tags:"#chernobyl #elephantsfoot",style:"phonk",bpm:138,key:9,pal:["sepia","fire","fire","gold","teal"],shots:[
 {t:"type",b:4,txt:"deep under Chernobyl there's a solid lump of melted reactor",cap:"deep under Chernobyl there's a lump of melted reactor"},
 {t:"slam",b:3,txt:"THE ELEPHANT'S\nFOOT",sub:"melted fuel, sand and concrete",cap:"they call it the elephant's foot"},
 {t:"slam",b:2,txt:"IN 1986, HOW LONG\nTO A DEADLY DOSE?",gate:"choice",choices:["MINUTES","YEARS"],ans:0},
 {t:"count",b:4,from:0,to:5,unit:"MINUTES",lbl:"A DEADLY DOSE IN ABOUT",drop:1,cap:"standing next to it in 1986 could kill you in about five minutes"},
 {t:"slam",b:4,txt:"STILL\nTHERE",sub:"far weaker now",tr:"glitch",cap:"it's still there, much less radioactive than it was"}]},
{id:"s-goiania",title:"The glowing blue powder 💙",topic:"radiation",tags:"#goiania #truestory",style:"hype",bpm:124,key:4,pal:["sepia","mono","blue","fire","sepia"],shots:[
 {t:"year",b:3,y:"1987",sub:"Goiânia, Brazil",cap:"1987. Goiânia, Brazil"},
 {t:"slam",b:3,txt:"SCRAP\nMETAL",cap:"scavengers took an old radiotherapy machine from an abandoned clinic"},
 {t:"glow",b:4,txt:"IT GLOWED\nBLUE",drop:1,cap:"inside was a powder that glowed blue in the dark"},
 {t:"slam",b:2,txt:"WHAT DID\nPEOPLE DO?",gate:"choice",choices:["SHARED IT","CALLED EXPERTS"],ans:0},
 {t:"slam",b:3,txt:"CAESIUM-137",sub:"some rubbed it on their skin",tr:"whip",cap:"they showed it off and shared it. it was caesium-137"},
 {t:"slam",b:4,txt:"HOMES\nDEMOLISHED",sub:"four people died",tr:"glitch",cap:"four people died, and houses were knocked down in the clean-up"}]},
{id:"s-bravo",title:"The test that came out 2.5× too big 😬",topic:"history",tags:"#castlebravo #history",style:"phonk",bpm:144,key:0,pal:["sepia","fire","ice","toxic","violet"],shots:[
 {t:"year",b:3,y:"1954",sub:"Castle Bravo",cap:"1954. a hydrogen bomb test in the Pacific"},
 {t:"slam",b:2,txt:"HOW BIG\nWAS IT?",gate:"choice",choices:["AS PLANNED","WAY BIGGER"],ans:1},
 {t:"versus",b:4,l:"EXPECTED",ls:"6 megatons",r:"ACTUAL",rs:"15 megatons",lc:"#3ad4ff",rc:"#ff4d4d",drop:1,cap:"they expected 6 megatons. they got 15"},
 {t:"slam",b:3,txt:"LITHIUM-7",sub:"the bit they thought wouldn't react",tr:"whip",cap:"an ingredient they thought was harmless joined in"},
 {t:"slam",b:4,txt:"LUCKY\nDRAGON",sub:"a fishing boat caught the fallout",tr:"glitch",cap:"fallout landed on a Japanese fishing boat called the Lucky Dragon"}]},
{id:"s-sugar",title:"Every human could fit in a sugar cube 🧊",topic:"atoms",tags:"#mindblown #atoms",style:"hype",bpm:128,key:7,pal:["teal","pink","teal","violet","gold"],shots:[
 {t:"type",b:3,txt:"every human on Earth could fit inside a sugar cube",cap:"every human on Earth could fit in a sugar cube"},
 {t:"slam",b:2,txt:"REAL OR\nFAKE?",gate:"choice",choices:["REAL","FAKE"],ans:0},
 {t:"zoom",b:7,drop:1,cap:"because atoms are almost entirely empty space"},
 {t:"slam",b:3,txt:"SQUASH OUT\nTHE SPACE",tr:"whip",cap:"squeeze out the empty space and only the nuclei are left"},
 {t:"slam",b:4,txt:"SUGAR CUBE",sub:"weighing about 500 million tonnes",tr:"glitch",cap:"the whole human race in one sugar cube. it would weigh 500 million tonnes"}]},
{id:"s-lightning",title:"Lightning is hotter than the Sun ⚡",topic:"space",tags:"#lightning #physics",style:"phonk",bpm:148,key:2,pal:["blue","ice","fire","violet"],shots:[
 {t:"slam",b:2,txt:"HOTTER THAN\nTHE SUN?",gate:"choice",choices:["YES","NO"],ans:0,cap:"is lightning hotter than the Sun"},
 {t:"versus",b:4,l:"LIGHTNING",ls:"about 30,000 °C",r:"SUN'S SURFACE",rs:"about 5,500 °C",lc:"#3ad4ff",rc:"#F2C46D",drop:1,cap:"a lightning bolt hits about 30,000 degrees"},
 {t:"slam",b:3,txt:"5× HOTTER",sub:"for a split second",tr:"whip",cap:"about five times hotter than the surface of the Sun"},
 {t:"slam",b:4,txt:"THUNDER",sub:"is the air exploding outwards",tr:"glitch",cap:"the air heats so fast it explodes outwards. that's thunder"}]},
{id:"s-tardigrade",title:"This animal survived open space 🔬",topic:"space",tags:"#tardigrade #space #animals",style:"hype",bpm:122,key:9,pal:["teal","violet","toxic","teal"],shots:[
 {t:"type",b:3,txt:"there's an animal that survived being left in open space",cap:"one animal survived being left in open space"},
 {t:"rings",b:3,g:"🔬",txt:"TARDIGRADES",drop:1,cap:"tardigrades. water bears"},
 {t:"list",b:4,items:["VACUUM","SPACE RADIATION","−272 °C","DRYING OUT"],last:"#9cff3a",cap:"they've survived vacuum, space radiation, near absolute zero and drying out"},
 {t:"slam",b:2,txt:"HOW BIG\nARE THEY?",gate:"choice",choices:["½ MM","10 CM"],ans:0},
 {t:"slam",b:4,txt:"HALF A\nMILLIMETRE",sub:"basically indestructible",tr:"glitch",cap:"about half a millimetre long, and almost indestructible"}]},
{id:"s-venus",title:"A day on Venus is longer than its year 🪐",topic:"space",tags:"#space #venus #mindblown",style:"hype",bpm:126,key:5,pal:["gold","violet","fire","pink"],shots:[
 {t:"type",b:3,txt:"a day on Venus lasts longer than a year on Venus",cap:"a day on Venus is longer than its year"},
 {t:"slam",b:2,txt:"TRUE OR\nFALSE?",gate:"choice",choices:["TRUE","FALSE"],ans:0},
 {t:"versus",b:4,l:"1 DAY",ls:"243 Earth days",r:"1 YEAR",rs:"225 Earth days",lc:"#F2C46D",rc:"#ff3b8d",drop:1,cap:"one spin takes 243 Earth days. one orbit takes 225"},
 {t:"slam",b:4,txt:"IT SPINS\nBACKWARDS",sub:"the Sun rises in the west",tr:"glitch",cap:"and it spins backwards, so the Sun rises in the west"}]},
{id:"s-wolves",title:"Chernobyl is now full of wolves 🐺",topic:"history",tags:"#chernobyl #wildlife",style:"phonk",bpm:136,key:11,pal:["sepia","teal","toxic","teal","gold"],shots:[
 {t:"year",b:3,y:"1986",sub:"everyone leaves",cap:"1986. everyone leaves the area around Chernobyl"},
 {t:"slam",b:2,txt:"WHAT MOVED\nIN?",gate:"choice",choices:["NOTHING","WILDLIFE"],ans:1},
 {t:"list",b:4,items:["WOLVES","BEARS","LYNX","WILD HORSES"],last:"#9cff3a",drop:1,cap:"wolves, bears, lynx and wild horses moved in"},
 {t:"slam",b:4,txt:"PEOPLE WERE\nTHE PROBLEM",sub:"for many animals, more than radiation",tr:"glitch",cap:"for a lot of animals, humans were a bigger problem than the radiation"}]},
{id:"s-lighthouse",title:"The Soviet nuclear lighthouses 🗼",topic:"energy",tags:"#rtg #history #arctic",style:"hype",bpm:124,key:1,pal:["ice","blue","fire","ice"],shots:[
 {t:"type",b:4,txt:"the Soviet Union ran Arctic lighthouses on nuclear batteries",cap:"the Soviet Union ran Arctic lighthouses on nuclear batteries"},
 {t:"slam",b:3,txt:"STRONTIUM-90",sub:"decay heat turned into electricity",drop:1,cap:"strontium-90 decay heat, turned into electricity"},
 {t:"slam",b:2,txt:"WHAT HAPPENED\nTO SOME?",gate:"choice",choices:["STOLEN","STILL SHINING"],ans:0},
 {t:"slam",b:4,txt:"SCRAP METAL\nTHIEVES",sub:"most have now been removed",tr:"glitch",cap:"some were broken into by scrap metal thieves. most have now been removed"}]},
{id:"s-glass",title:"Old windows prove glass flows? 🪟",topic:"chem",tags:"#mythbusting #science",style:"phonk",bpm:142,key:6,pal:["ice","fire","teal","violet"],shots:[
 {t:"type",b:3,txt:"old church windows are thicker at the bottom because glass slowly flows",cap:"old windows are thicker at the bottom because glass flows"},
 {t:"slam",b:2,txt:"MYTH OR\nFACT?",gate:"choice",choices:["MYTH","FACT"],ans:0},
 {t:"stamp",b:3,txt:"MYTH",col:"#ff4d4d",under:"GLASS\nFLOWS",drop:1,cap:"total myth"},
 {t:"slam",b:3,txt:"UNEVEN\nPANES",sub:"fitted thick side down",tr:"whip",cap:"old glass came out uneven, and builders put the thick side at the bottom"},
 {t:"slam",b:4,txt:"IT DOESN'T\nFLOW",sub:"not in any time we could notice",tr:"glitch",cap:"room temperature glass doesn't flow in any way you'd ever notice"}]}
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

if(document.fonts&&document.fonts.load){document.fonts.load("40px Anton").then(function(){haveAnton=document.fonts.check("40px Anton");FIT.clear();SPR.clear()},function(){})}
var API={moving:false,Q:Q,unlock:unlock,on:on,needs:needs,sleep:sleep,Player:Player,EDITS:EDITS,genQuiz:genQuiz,genTF:genTF,sfx:sfx};
WIN.ChainEdits=API;
})();
