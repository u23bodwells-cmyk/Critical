/* Chain storytime gameplay: an original endless-runner scene drawn with three.js (loaded only when a storytime appears).
   One shared WebGL renderer is moved into whichever storytime card is on screen. Nothing here is copied from any game. */
window.ChainRun=(function(){
"use strict";
var R=null,scene,cam,sky,groundTex,fogCol,player,legs=[],arms=[],obs=[],coins=[],bld,bldData=[],raf=0,last=0,host=null,running=false,paused=false;
var LANE=[-2.3,0,2.3],lane=1,px=0,py=0,jumpT=-1,speed=16,dist=0,nextSpawn=0,coinCount=0,onCoin=null,theme=0,W=1,H=1;
var THEMES=[
 {name:"synthwave",sky:["#1a0533","#ff2d95","#ffb347"],fog:0x2a0a3a,bld:0x24104a,win:"#ff5fd2",line:"#ff2d95",grid:"#3a0f5c",body:0xffffff,visor:0x00e5ff,sun:1},
 {name:"night city",sky:["#020412","#0a1a4a","#1b3b8a"],fog:0x050a24,bld:0x0d1633,win:"#7cc0ff",line:"#3ad4ff",grid:"#0b1e44",body:0xff7a1a,visor:0xff3b5c,sun:0},
 {name:"reactor",sky:["#00100c","#003a2c","#00b383"],fog:0x00261d,bld:0x062b22,win:"#9cff3a",line:"#9cff3a",grid:"#05362a",body:0xffd31a,visor:0x9cff3a,sun:0},
 {name:"sunset",sky:["#14062b","#c2185b","#ff9800"],fog:0x3b0f2b,bld:0x2b0f24,win:"#ffd166",line:"#ffb02e",grid:"#3d1230",body:0x3ad4ff,visor:0xffd166,sun:1}];
function canvasTex(w,h,draw){var c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function skyTex(T){return canvasTex(64,512,function(x,w,h){var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,T.sky[0]);g.addColorStop(.62,T.sky[1]);g.addColorStop(1,T.sky[2]);x.fillStyle=g;x.fillRect(0,0,w,h);for(var i=0;i<60;i++){x.fillStyle="rgba(255,255,255,"+(Math.random()*.7)+")";x.fillRect(Math.random()*w,Math.random()*h*.5,1,1)}})}
function gridTex(T){var t=canvasTex(256,256,function(x,w,h){x.fillStyle=T.grid;x.fillRect(0,0,w,h);x.strokeStyle=T.line;x.globalAlpha=.55;x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(w,0);x.moveTo(0,0);x.lineTo(0,h);x.stroke()});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,60);t.anisotropy=4;return t}
function winTex(T){var t=canvasTex(64,128,function(x,w,h){x.fillStyle="#000";x.fillRect(0,0,w,h);for(var yy=6;yy<h;yy+=12)for(var xx=6;xx<w;xx+=12){if(Math.random()<.45){x.fillStyle=T.win;x.globalAlpha=.5+Math.random()*.5;x.fillRect(xx,yy,6,7)}}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function init(){
  R=new THREE.WebGLRenderer({antialias:false,powerPreference:"high-performance",alpha:false});R.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));R.outputColorSpace=THREE.SRGBColorSpace;
  R.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block";
  scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(64,1,.1,220);
  scene.add(new THREE.HemisphereLight(0xaab4ff,0x1a0a20,1.25));var dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(4,10,6);scene.add(dl);
  /* ground */
  var gm=new THREE.MeshLambertMaterial({color:0xffffff});var g=new THREE.Mesh(new THREE.PlaneGeometry(16,400),gm);g.rotation.x=-Math.PI/2;g.position.z=-180;scene.add(g);g.name="ground";
  /* sun */
  var sun=new THREE.Mesh(new THREE.CircleGeometry(16,48),new THREE.MeshBasicMaterial({color:0xffd166,fog:false}));sun.position.set(0,14,-200);sun.name="sun";scene.add(sun);
  /* buildings both sides (instanced) */
  var bg=new THREE.BoxGeometry(1,1,1);bld=new THREE.InstancedMesh(bg,new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.9}),48);scene.add(bld);
  for(var i=0;i<48;i++){var side=i%2?1:-1;bldData.push({x:side*(10+Math.random()*7),z:-i*8,w:3+Math.random()*4,h:6+Math.random()*26,d:4+Math.random()*4})}
  /* player */
  player=new THREE.Group();var bm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,metalness:.05}),vm=new THREE.MeshBasicMaterial({color:0x00e5ff});
  var skin=new THREE.MeshStandardMaterial({color:0xe0ac7e,roughness:.7}),jeans=new THREE.MeshStandardMaterial({color:0x232a45,roughness:.8}),shoe=new THREE.MeshStandardMaterial({color:0xf4f4f4,roughness:.5}),dark=new THREE.MeshStandardMaterial({color:0x1b1b24,roughness:.4,metalness:.3});
  /* hoodie, head, cap, neon shades and headphones */
  var body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,6,12),bm);body.position.y=1.25;player.add(body);
  var hood=new THREE.Mesh(new THREE.TorusGeometry(.3,.11,8,16),bm);hood.rotation.x=Math.PI/2;hood.position.y=1.83;player.add(hood);
  var head=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),skin);head.position.y=2.15;player.add(head);
  var cap=new THREE.Mesh(new THREE.SphereGeometry(.36,18,10,0,Math.PI*2,0,Math.PI/2),dark);cap.position.y=2.2;player.add(cap);
  var brim=new THREE.Mesh(new THREE.BoxGeometry(.5,.05,.34),dark);brim.position.set(0,2.22,-.36);player.add(brim);
  var visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.12,.1),vm);visor.position.set(0,2.1,-.3);player.add(visor);
  var band=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,6,20,Math.PI),dark);band.position.y=2.15;player.add(band);
  for(var e=-1;e<=1;e+=2){var cup=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.1,14),vm);cup.rotation.z=Math.PI/2;cup.position.set(e*.37,2.13,0);player.add(cup)}
  var pack=new THREE.Mesh(new THREE.BoxGeometry(.52,.62,.3),dark);pack.position.set(0,1.35,.42);player.add(pack);
  var strip=new THREE.Mesh(new THREE.BoxGeometry(.53,.07,.31),vm);strip.position.set(0,1.45,.42);player.add(strip);
  for(var s=-1;s<=1;s+=2){var leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.8,.26),jeans);leg.geometry.translate(0,-.4,0);leg.position.set(s*.18,.85,0);
    var sh=new THREE.Mesh(new THREE.BoxGeometry(.26,.16,.42),shoe);sh.position.set(0,-.8,-.06);leg.add(sh);player.add(leg);legs.push(leg);
    var arm=new THREE.Mesh(new THREE.BoxGeometry(.17,.7,.19),bm);arm.geometry.translate(0,-.35,0);arm.position.set(s*.55,1.6,0);
    var hand=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),skin);hand.position.y=-.74;arm.add(hand);player.add(arm);arms.push(arm)}
  player.userData={body:bm,visor:vm};scene.add(player);
  /* obstacles: barriers, trains, hurdles */
  var red=new THREE.MeshLambertMaterial({color:0xff3b5c,emissive:0x550010}),white=new THREE.MeshLambertMaterial({color:0xf3f3f3}),train=new THREE.MeshStandardMaterial({color:0x3a4256,metalness:.6,roughness:.35}),stripe=new THREE.MeshBasicMaterial({color:0xffd166});
  for(var o=0;o<14;o++){var grp=new THREE.Group(),kind=o%3;
    if(kind===0){var b1=new THREE.Mesh(new THREE.BoxGeometry(1.9,.9,.3),red);b1.position.y=.95;grp.add(b1);var b2=new THREE.Mesh(new THREE.BoxGeometry(1.9,.18,.32),white);b2.position.y=.95;grp.add(b2);for(var q=-1;q<=1;q+=2){var p=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),white);p.position.set(q*.85,.45,0);grp.add(p)}}
    else if(kind===1){var tb=new THREE.Mesh(new THREE.BoxGeometry(2,2.6,9),train);tb.position.y=1.3;grp.add(tb);var st=new THREE.Mesh(new THREE.BoxGeometry(2.02,.25,9.02),stripe);st.position.y=1.7;grp.add(st);var fr=new THREE.Mesh(new THREE.BoxGeometry(1.4,.8,.05),new THREE.MeshBasicMaterial({color:0x9fe8ff}));fr.position.set(0,2,-4.52);grp.add(fr)}
    else{var hb=new THREE.Mesh(new THREE.BoxGeometry(1.9,.35,.35),stripe);hb.position.y=.35;grp.add(hb)}
    grp.userData={kind:kind,live:false,lane:0,len:kind===1?9:.4};grp.visible=false;scene.add(grp);obs.push(grp)}
  var cg=new THREE.TorusGeometry(.32,.11,8,18),cm=new THREE.MeshStandardMaterial({color:0xffc83d,emissive:0x8a5a00,metalness:.8,roughness:.25});
  for(var c=0;c<40;c++){var m=new THREE.Mesh(cg,cm);m.visible=false;m.userData={live:false,lane:0};scene.add(m);coins.push(m)}
}
function setTheme(i){if(!R)init();theme=i%THEMES.length;var T=THEMES[theme];
  if(scene.background&&scene.background.dispose)scene.background.dispose();scene.background=skyTex(T);scene.fog=new THREE.Fog(T.fog,26,120);
  var g=scene.getObjectByName("ground");if(g.material.map)g.material.map.dispose();groundTex=gridTex(T);g.material.map=groundTex;g.material.needsUpdate=true;
  var wt=winTex(T);if(bld.material.emissiveMap)bld.material.emissiveMap.dispose();bld.material.color.setHex(T.bld);bld.material.emissiveMap=wt;bld.material.emissive.setHex(0xffffff);bld.material.needsUpdate=true;
  scene.getObjectByName("sun").visible=!!T.sun;player.userData.body.color.setHex(T.body);player.userData.visor.color.setHex(T.visor)}
function laneFree(l,z0,z1){for(var i=0;i<obs.length;i++){var o=obs[i];if(!o.userData.live||o.userData.lane!==l)continue;var zf=o.position.z-o.userData.len/2,zb=o.position.z+o.userData.len/2;if(zb>z0&&zf<z1)return false}return true}
function spawn(){var z=-110,free=Math.floor(Math.random()*3),n=Math.random()<.35?2:1,used={};used[free]=1;
  for(var k=0;k<n;k++){var l;do{l=Math.floor(Math.random()*3)}while(used[l]);used[l]=1;var cand=obs.filter(function(o){return!o.userData.live});if(!cand.length)break;var o=cand[Math.floor(Math.random()*cand.length)];
    o.userData.live=true;o.userData.lane=l;o.position.set(LANE[l],0,z-(o.userData.kind===1?4:0));o.visible=true}
  var cl=Math.random()<.5?free:Math.floor(Math.random()*3);for(var j=0;j<6;j++){var cc=coins.filter(function(c){return!c.userData.live})[0];if(!cc)break;cc.userData.live=true;cc.userData.lane=cl;cc.position.set(LANE[cl],1.1,z+4-j*1.6);cc.visible=true}}
function step(dt){speed=Math.min(26,speed+dt*.12);var dz=speed*dt;dist+=dz;
  if(dist>nextSpawn){spawn();nextSpawn=dist+14+Math.random()*10}
  for(var i=0;i<obs.length;i++){var o=obs[i];if(!o.userData.live)continue;o.position.z+=dz;if(o.position.z-o.userData.len/2>10){o.userData.live=false;o.visible=false}}
  for(var c=0;c<coins.length;c++){var cn=coins[c];if(!cn.userData.live)continue;cn.position.z+=dz;cn.rotation.y+=dt*4;
    if(Math.abs(cn.position.z)<.9&&Math.abs(cn.position.x-px)<.9&&py<1.6){cn.userData.live=false;cn.visible=false;coinCount++;if(onCoin)onCoin(coinCount)}
    else if(cn.position.z>10){cn.userData.live=false;cn.visible=false}}
  /* simple autopilot: dodge into a free lane, or hop the low hurdles */
  var ahead=null;for(var j=0;j<obs.length;j++){var ob=obs[j];if(ob.userData.live&&ob.userData.lane===lane&&ob.position.z+ob.userData.len/2>-16&&ob.position.z-ob.userData.len/2<1){ahead=ob;break}}
  if(ahead){if(ahead.userData.kind===2&&jumpT<0&&ahead.position.z>-7)jumpT=0;else if(ahead.userData.kind!==2){var opts=[lane-1,lane+1].filter(function(l){return l>=0&&l<3&&laneFree(l,-20,4)});if(opts.length)lane=opts[Math.floor(Math.random()*opts.length)];else if(jumpT<0)jumpT=0}}
  else if(Math.random()<dt*.25){var nl=lane+(Math.random()<.5?-1:1);if(nl>=0&&nl<3&&laneFree(nl,-20,4))lane=nl}
  px+=(LANE[lane]-px)*Math.min(1,dt*9);
  if(jumpT>=0){jumpT+=dt/.62;py=Math.max(0,4.2*jumpT*(1-jumpT)*1.25);if(jumpT>=1){jumpT=-1;py=0}}
  var tt=performance.now()/1000,sw=Math.sin(tt*speed*.55);player.position.set(px,py,0);player.rotation.z=(LANE[lane]-px)*-.12;
  legs[0].rotation.x=sw*.9;legs[1].rotation.x=-sw*.9;arms[0].rotation.x=-sw*.8;arms[1].rotation.x=sw*.8;player.children[0].position.y=1.25+Math.abs(sw)*.06;
  if(groundTex)groundTex.offset.y-=dz*.15;
  var mtx=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),qq=new THREE.Quaternion();
  for(var b=0;b<bldData.length;b++){var d=bldData[b];d.z+=dz;if(d.z>12){d.z-=48*8;d.h=6+Math.random()*26;d.w=3+Math.random()*4}pos.set(d.x,d.h/2,d.z);sc.set(d.w,d.h,d.d);mtx.compose(pos,qq,sc);bld.setMatrixAt(b,mtx)}bld.instanceMatrix.needsUpdate=true;
  cam.position.x+=(px*.45-cam.position.x)*Math.min(1,dt*4);cam.position.y=4.3+py*.25+Math.sin(tt*2)*.05;cam.lookAt(px*.3,1.4,-12)}
function size(){if(!host)return;var r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);R.setSize(W,H,false);cam.aspect=W/H;cam.fov=W/H<.7?72:60;cam.updateProjectionMatrix()}
function loop(t){raf=requestAnimationFrame(loop);var dt=last?Math.min(.05,(t-last)/1000):.016;last=t;if(!paused)step(dt);R.render(scene,cam)}
return{
  attach:function(el,th){if(!window.THREE)return false;if(!R)init();setTheme(th||0);host=el;el.appendChild(R.domElement);cam.position.set(0,4.3,7.6);size();speed=16;coinCount=0;paused=false;last=0;cancelAnimationFrame(raf);running=true;raf=requestAnimationFrame(loop);return true},
  detach:function(){running=false;cancelAnimationFrame(raf);raf=0;if(R&&R.domElement.parentNode)R.domElement.parentNode.removeChild(R.domElement);host=null},
  /* a still frame of a theme, used as the card's poster so it never looks empty mid-swipe */
  snap:function(th,w,h){if(!window.THREE||running)return null;try{if(!R)init();setTheme(th||0);R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<.7?72:60;cam.updateProjectionMatrix();cam.position.set(0,4.3,7.6);
    for(var i=0;i<70;i++)step(.05);R.render(scene,cam);return R.domElement.toDataURL("image/jpeg",.72)}catch(e){return null}},
  pause:function(p){paused=!!p},resize:function(){if(R&&host)size()},onCoin:function(f){onCoin=f},themes:THEMES.length};
})();
