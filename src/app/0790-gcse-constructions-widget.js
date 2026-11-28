/* ===== constructions start ===== */
/* Construction canvas: ruler, compasses, protractor, points, shading. Marks the drawing like an examiner (±2 mm, ±2°). */
(function(){
 var DEG=Math.PI/180;
 function sub(a,b){return [a[0]-b[0],a[1]-b[1]]}function add(a,b){return [a[0]+b[0],a[1]+b[1]]}function mul(a,k){return [a[0]*k,a[1]*k]}
 function len(a){return Math.hypot(a[0],a[1])}function dist(a,b){return len(sub(a,b))}function unit(a){var l=len(a)||1;return [a[0]/l,a[1]/l]}
 function dot(a,b){return a[0]*b[0]+a[1]*b[1]}function crs(a,b){return a[0]*b[1]-a[1]*b[0]}function rot(v,t){var c=Math.cos(t),s=Math.sin(t);return [v[0]*c-v[1]*s,v[0]*s+v[1]*c]}
 function ang(p,c){return Math.atan2(p[1]-c[1],p[0]-c[0])}function nrm(a){a%=2*Math.PI;if(a<0)a+=2*Math.PI;return a}
 function lineDist(p,P0,d){return Math.abs(crs(sub(p,P0),d))}
 function adiff(d1,d2){var a=Math.abs(Math.atan2(crs(d1,d2),dot(d1,d2)))/DEG;return Math.min(a,180-a)}
 function adir(d1,d2){return Math.abs(Math.atan2(crs(d1,d2),dot(d1,d2)))/DEG}
 function cc(c1,r1,c2,r2){var d=dist(c1,c2);if(d<1e-9||d>r1+r2||d<Math.abs(r1-r2))return [];var a=(r1*r1-r2*r2+d*d)/(2*d),h=Math.sqrt(Math.max(0,r1*r1-a*a)),u=unit(sub(c2,c1)),m=add(c1,mul(u,a)),n=[-u[1],u[0]];return [add(m,mul(n,h)),add(m,mul(n,-h))]}
 function lc(P0,d,c,r){var f=sub(P0,c),b=dot(f,d),q=dot(f,f)-r*r,D=b*b-q;if(D<0)return [];var s=Math.sqrt(D);return [-b-s,-b+s]}
 function inSweep(a,t,tol){if(Math.abs(a.sw)>=2*Math.PI-0.02)return true;tol=tol||0;var d=a.sw>=0?nrm(t-a.a0):nrm(a.a0-t);var s=Math.abs(a.sw);return d<=s+tol||d>=2*Math.PI-tol}
 function covers(a,X,tol){tol=tol||0.15;return Math.abs(dist(X,a.c)-a.r)<=tol&&inSweep(a,ang(X,a.c),tol/Math.max(a.r,0.3)+0.02)}
 function css(n,f){var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||f}

 /* ---------- checking: one function per construction ---------- */
 function K(spec,objs){var S=spec,pt=function(n){return typeof n==='string'?S.pts[n]:n};
  var segs=objs.filter(function(o){return o.t==='seg'}),arcs=objs.filter(function(o){return o.t==='arc'}),pts=objs.filter(function(o){return o.t==='pt'});
  function arcsAt(c,tol){return arcs.filter(function(a){return dist(a.c,c)<=(tol||0.12)})}
  function along(s,P0,d,tol,at){tol=tol||0.2;at=at||2;return lineDist(s.a,P0,d)<=tol&&lineDist(s.b,P0,d)<=tol&&adiff(sub(s.b,s.a),d)<=at}
  function span(s,P0,d){var ta=dot(sub(s.a,P0),d),tb=dot(sub(s.b,P0),d);return [Math.min(ta,tb),Math.max(ta,tb)]}
  function fromPt(V,d,minL,tol,at){return segs.filter(function(s){var e=dist(s.a,V)<=0.25?[s.a,s.b]:dist(s.b,V)<=0.25?[s.b,s.a]:null;if(!e)return false;var v=sub(e[1],e[0]);return len(v)>=(minL||2)&&adir(v,d)<=(at||2)})}
  function pair(c1,c2,minR,pick){var A1=arcsAt(c1,0.15),B1=arcsAt(c2,0.15),why=!A1.length||!B1.length?'none':'width',best=null;
   A1.forEach(function(a){B1.forEach(function(b){if(best||Math.abs(a.r-b.r)>0.1)return;if(a.r<=minR+0.02){why='small';return}var I=cc(c1,a.r,c2,b.r);var ok=I.filter(function(X){return A1.some(function(q){return Math.abs(q.r-a.r)<=0.1&&covers(q,X)})&&B1.some(function(q){return Math.abs(q.r-a.r)<=0.1&&covers(q,X)})});
    if(pick?ok.some(pick):ok.length>=2)best={r:a.r,I:I,ok:ok};else why='cross'})});return best||{why:why}}
  var R=[],t=S.task,a=S.args||{};
  function r(ok,yes,no){R.push({ok:!!ok,msg:ok?yes:no})}
  if(t==='perpBis'){var A=pt(a.a),B=pt(a.b),M=mul(add(A,B),0.5),u=unit(sub(B,A)),n=[-u[1],u[0]],h=dist(A,B)/2,p=pair(A,B,h);
   r(p.r,'Arcs from '+a.a+' and '+a.b+' with the same width, crossing on both sides',p.why==='none'?'Put the compass point on '+a.a+' and draw arcs above and below the line. Then do the same from '+a.b+'.':p.why==='small'?'Open your compasses wider: more than half of '+a.a+a.b+', or the arcs can\'t meet.':p.why==='cross'?'The arcs need to cross both above and below '+a.a+a.b+'.':'Keep the same compass width for the arcs from '+a.a+' and from '+a.b+'.');
   r(segs.some(function(s){var sp=span(s,M,n);return along(s,M,n)&&sp[1]-sp[0]>=1.5}),'A straight line through both crossing points','Use the ruler to draw a line through the two places where the arcs cross.')}
  else if(t==='angBis'){var V=pt(a.v),u1=unit(sub(pt(a.p),V)),u2=unit(sub(pt(a.q),V)),bi=unit(add(u1,u2)),a1=arcsAt(V).filter(function(q){return covers(q,add(V,mul(u1,q.r)))&&covers(q,add(V,mul(u2,q.r)))})[0];
   r(a1,'An arc from '+a.v+' that crosses both arms','Put the compass point on '+a.v+' and draw one arc that crosses both arms of the angle.');
   var ok2=false,why2='From where your arc crosses each arm, draw two arcs with the same width that cross inside the angle.';
   if(a1){var X=add(V,mul(u1,a1.r)),Y=add(V,mul(u2,a1.r)),pp=pair(X,Y,dist(X,Y)/2,function(Z){return dot(sub(Z,V),bi)>a1.r*0.9});ok2=!!pp.r;if(pp.why==='width')why2='Keep the same compass width for both arcs inside the angle.';if(pp.why==='small')why2='Open your compasses a bit wider so the two arcs meet.'}
   r(ok2,'Two equal arcs crossing inside the angle',why2);
   r(segs.some(function(s){var sp=span(s,V,bi);return along(s,V,bi)&&sp[1]>=2.5&&sp[0]<=0.4}),'A line from '+a.v+' through the crossing point','Draw a line from '+a.v+' through the point where the inside arcs cross.')}
  else if(t==='perpFrom'||t==='perpAt'){var Pp=pt(a.p),A2=pt(a.a),u3=unit(sub(pt(a.b),A2)),F=add(A2,mul(u3,dot(sub(Pp,A2),u3))),hh=dist(Pp,F),nn=t==='perpFrom'?unit(sub(F,Pp)):[-u3[1],u3[0]];
   var a3=arcsAt(Pp).filter(function(q){if(q.r<=hh+0.05)return false;var w=Math.sqrt(q.r*q.r-hh*hh);return arcs.filter(function(z){return dist(z.c,Pp)<=0.12&&Math.abs(z.r-q.r)<=0.1}).some(function(z){return covers(z,add(F,mul(u3,w)))})&&arcs.filter(function(z){return dist(z.c,Pp)<=0.12&&Math.abs(z.r-q.r)<=0.1}).some(function(z){return covers(z,add(F,mul(u3,-w)))})})[0];
   r(a3,'An arc from '+a.p+' crossing the line twice','Put the compass point on '+a.p+' and draw an arc that crosses the line on both sides'+(t==='perpAt'?' of '+a.p:'')+'.');
   var ok4=false,why4='From the two crossing points, draw arcs with the same (wider) width that cross each other.';
   if(a3){var w3=Math.sqrt(a3.r*a3.r-hh*hh),X3=add(F,mul(u3,w3)),Y3=add(F,mul(u3,-w3)),p3=pair(X3,Y3,w3,function(Z){return dist(Z,Pp)>0.3});ok4=!!p3.r;if(p3.why==='width')why4='Keep the same compass width for both of these arcs.';if(p3.why==='small')why4='Open your compasses wider than before so these arcs meet.'}
   r(ok4,'Two equal arcs that cross',why4);
   r(segs.some(function(s){var sp=span(s,Pp,nn);return along(s,Pp,nn)&&(t==='perpFrom'?sp[0]<=0.3&&sp[1]>=hh-0.3:sp[1]-sp[0]>=2&&sp[0]<=0.3)}),'The perpendicular line','Draw a line from '+a.p+' through the point where the last two arcs cross'+(t==='perpFrom'?', down to the line':'')+'.')}
  else if(t==='angle'||t==='triSAS'){var V2=pt(a.v),ub=unit(sub(pt(a.b),V2)),sides=a.side==='any'?[-1,1]:[-1],ds=sides.map(function(sg){return rot(ub,sg*a.deg*DEG)}),best=null;
   segs.forEach(function(s){var e=dist(s.a,V2)<=0.25?[s.a,s.b]:dist(s.b,V2)<=0.25?[s.b,s.a]:null;if(!e)return;var v=sub(e[1],e[0]),m=Math.min.apply(null,ds.map(function(d){return adir(v,d)})),aa=adir(v,ub);if(!best||m<best.m)best={m:m,deg:aa,end:e[1],L:len(v)}});
   r(best&&best.m<=2&&best.L>=(t==='triSAS'?a.ac-0.2:2),'A line at '+a.deg+'° from '+a.v+a.b,!best?'Draw a line from '+a.v+' with the ruler, at '+a.deg+'° to '+a.v+a.b+'. Use the protractor to mark the angle first.':best.m<=2?'Make the line a bit longer.':'Your line is at about '+Math.round(best.deg)+'°. It should be '+a.deg+'°.');
   if(t==='triSAS'){var C=add(V2,mul(ds[0],a.ac));r(best&&Math.abs(best.L-a.ac)<=0.2&&dist(best.end,C)<=0.3||segs.some(function(s){return(dist(s.a,C)<=0.25||dist(s.b,C)<=0.25)&&(dist(s.a,V2)<=0.25||dist(s.b,V2)<=0.25)}),a.v+'C is '+a.ac+' cm long',best?'Make '+a.v+'C exactly '+a.ac+' cm (yours is '+best.L.toFixed(1)+' cm).':'Then measure '+a.ac+' cm along it.');
    var Bp=pt(a.b);r(segs.some(function(s){return (dist(s.a,Bp)<=0.25&&dist(s.b,C)<=0.3)||(dist(s.b,Bp)<=0.25&&dist(s.a,C)<=0.3)}),'The third side joins '+a.b+' to C','Join '+a.b+' to the end of your '+a.ac+' cm line to finish the triangle.')}}
  else if(t==='triSSS'){var A4=pt(a.a),B4=pt(a.b),I4=cc(A4,a.ac,B4,a.bc),C4=I4.sort(function(p,q){return p[1]-q[1]})[0];
   r(arcsAt(A4).some(function(q){return Math.abs(q.r-a.ac)<=0.1&&covers(q,C4)}),'An arc from '+a.a+' with width '+a.ac+' cm','Set the compasses to '+a.ac+' cm, put the point on '+a.a+' and draw an arc above the line.');
   r(arcsAt(B4).some(function(q){return Math.abs(q.r-a.bc)<=0.1&&covers(q,C4)}),'An arc from '+a.b+' with width '+a.bc+' cm, crossing the first','Set the compasses to '+a.bc+' cm, put the point on '+a.b+' and draw an arc that crosses the first one.');
   var j=function(P0){return segs.some(function(s){return (dist(s.a,P0)<=0.25&&dist(s.b,C4)<=0.25)||(dist(s.b,P0)<=0.25&&dist(s.a,C4)<=0.25)})};
   r(j(A4)&&j(B4),'Both sides joined to the crossing point','Use the ruler to join '+a.a+' and '+a.b+' to where the arcs cross.')}
  else if(t==='circle'){var Cc=pt(a.c),ar=arcsAt(Cc).filter(function(q){return Math.abs(q.r-a.r)<=0.1}),n5=0;for(var k=0;k<72;k++){var th=k*5*DEG,X5=add(Cc,[a.r*Math.cos(th),a.r*Math.sin(th)]);if(ar.some(function(q){return covers(q,X5)}))n5++}
   r(ar.length,'Compass width '+a.r+' cm, centred on '+a.c,'Set the compasses to '+a.r+' cm and put the point on '+a.c+'.');r(n5>=70,'It goes all the way round','The locus is every point '+a.r+' cm from '+a.c+', so draw a full circle.')}
  else if(t==='stadium'){var A6=pt(a.a),B6=pt(a.b),L6=dist(A6,B6),u6=unit(sub(B6,A6)),n6=[-u6[1],u6[0]],side=function(sg){var P0=add(A6,mul(n6,sg*a.r));return segs.some(function(s){var sp=span(s,P0,u6);return along(s,P0,u6)&&sp[0]<=0.3&&sp[1]>=L6-0.3})};
   r(side(1)&&side(-1),'Two straight lines '+a.r+' cm from '+a.a+a.b,'Draw two lines parallel to '+a.a+a.b+', '+a.r+' cm away on each side, as long as '+a.a+a.b+'.');
   var cap=function(C,dir){var ar=arcsAt(C).filter(function(q){return Math.abs(q.r-a.r)<=0.1});for(var k=-85;k<=85;k+=10){var X=add(C,mul(rot(dir,k*DEG),a.r));if(!ar.some(function(q){return covers(q,X)}))return false}return true};
   r(cap(A6,mul(u6,-1))&&cap(B6,u6),'Semicircles of radius '+a.r+' cm round both ends','Round off each end with a semicircle: compass point on '+a.a+' and on '+a.b+', width '+a.r+' cm.')}
  else if(t==='region'){if(a.perp){var A7=pt(a.perp[0]),B7=pt(a.perp[1]),M7=mul(add(A7,B7),0.5),u7=unit(sub(B7,A7)),n7=[-u7[1],u7[0]];r(segs.some(function(s){var sp=span(s,M7,n7);return along(s,M7,n7)&&sp[1]-sp[0]>=(a.perpLen||3)}),'The line equidistant from '+a.perp[0]+' and '+a.perp[1],'Points closer to '+a.perp[0]+' than '+a.perp[1]+' are on one side of the perpendicular bisector of '+a.perp[0]+a.perp[1]+'. Construct it and draw it right across.')}
   (a.circles||[]).forEach(function(cr){var C=pt(cr[0]),ar=arcsAt(C).filter(function(q){return Math.abs(q.r-cr[1])<=0.1}),need=0,got=0;for(var k=0;k<72;k++){var th=k*5*DEG,X=add(C,[cr[1]*Math.cos(th),cr[1]*Math.sin(th)]);if(!inPoly(X,S.shape||[[0,0],[S.w||14,0],[S.w||14,S.h||9],[0,S.h||9]]))continue;if(cr[2]&&cr[2].closer&&dist(X,pt(cr[2].closer[0]))>=dist(X,pt(cr[2].closer[1])))continue;need++;if(ar.some(function(q){return covers(q,X)}))got++}
    r(need&&got>=need*0.95,'An arc '+cr[1]+' cm from '+cr[0],'Points within '+cr[1]+' cm of '+cr[0]+' are inside a circle of radius '+cr[1]+' cm. Draw the part of it that\'s inside the shape.')});
   var M8=S._mask,inn=(a['in']||[]).every(function(p){return M8&&M8(p)}),out=(a.out||[]).every(function(p){return !(M8&&M8(p))});
   r(inn&&out,'The right region is shaded',!M8||!(a['in']||[]).some(function(p){return M8(p)})?'Now pick the shade tool and tap inside the region that fits both rules.':!out?'Some of your shading is outside the region. Check both rules, and that your lines close the region off.':'Part of the region is missing from your shading.')}
  else if(t==='bearing'||t==='twoBearings'){var bd=function(deg){return [Math.sin(deg*DEG),-Math.cos(deg*DEG)]},chk=function(nm,deg,L){var V=pt(nm),best=null;segs.forEach(function(s){var e=dist(s.a,V)<=0.25?[s.a,s.b]:dist(s.b,V)<=0.25?[s.b,s.a]:null;if(!e)return;var v=sub(e[1],e[0]),m=adir(v,bd(deg));if(!best||m<best.m)best={m:m,L:len(v),b:Math.round(nrm(Math.atan2(v[0],-v[1]))/DEG)}});return best};
   if(t==='bearing'){var b1=chk(a.a,a.deg);r(b1&&b1.m<=2,'A line on a bearing of '+('00'+a.deg).slice(-3)+'°',!b1?'Draw a line from '+a.a+'. Put the protractor\'s base line on the North line and measure clockwise.':'Your line is on a bearing of about '+('00'+b1.b).slice(-3)+'°. Bearings are measured clockwise from North.');
    if(a.len)r(b1&&b1.m<=2&&Math.abs(b1.L-a.len)<=0.2,'It\'s '+a.len+' cm long (the scaled distance)',b1?'Make it '+a.len+' cm long. Yours is '+b1.L.toFixed(1)+' cm.':'Make it '+a.len+' cm long.')}
   else{var dA=bd(a.da),dB=bd(a.db),PA=pt(a.a),PB=pt(a.b),tt=crs(sub(PB,PA),dB)/crs(dA,dB),Lp=add(PA,mul(dA,tt)),c1=chk(a.a,a.da),c2=chk(a.b,a.db);
    r(c1&&c1.m<=2,'Bearing of '+('00'+a.da).slice(-3)+'° from '+a.a,c1?'Your line from '+a.a+' is on about '+('00'+c1.b).slice(-3)+'°.':'Draw a line from '+a.a+' on a bearing of '+('00'+a.da).slice(-3)+'°.');
    r(c2&&c2.m<=2,'Bearing of '+('00'+a.db).slice(-3)+'° from '+a.b,c2?'Your line from '+a.b+' is on about '+('00'+c2.b).slice(-3)+'°.':'Draw a line from '+a.b+' on a bearing of '+('00'+a.db).slice(-3)+'°.');
    r(pts.some(function(q){return dist(q.p,Lp)<=0.3}),'Point '+a.mark+' marked where they cross','Use the point tool to mark '+a.mark+' where your two lines cross.')}}
  if(S.ask){var v=parseFloat(String(S._ans||'').replace(',','.'));r(!isNaN(v)&&Math.abs(v-S.ask.a)<=S.ask.tol,'Your measurement is within '+S.ask.tol+' '+S.ask.u+' of '+S.ask.a+' '+S.ask.u,isNaN(v)?'Type your measurement in the box.':'Not quite: measure again. You need to be within '+S.ask.tol+' '+S.ask.u+'.')}
  return R}
 function inPoly(p,poly){var c=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){var a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
 /* ---------- model answers for "Show me how" ---------- */
 function model(S){var a=S.args||{},o=[],pt=function(n){return typeof n==='string'?S.pts[n]:n},arcAt=function(c,r,X,spread){var t=ang(X,c);o.push({t:'arc',c:c,r:r,a0:t-(spread||0.35),sw:2*(spread||0.35)})},seg=function(p,q,ext){var u=unit(sub(q,p));ext=ext||0;o.push({t:'seg',a:add(p,mul(u,-ext)),b:add(q,mul(u,ext))})};
  var t=S.task;
  if(t==='perpBis'){var A=pt(a.a),B=pt(a.b),r=dist(A,B)*0.7,I=cc(A,r,B,r);I.forEach(function(X){arcAt(A,r,X);arcAt(B,r,X)});seg(I[0],I[1],0.8)}
  else if(t==='angBis'){var V=pt(a.v),u1=unit(sub(pt(a.p),V)),u2=unit(sub(pt(a.q),V)),r1=Math.min(dist(V,pt(a.p)),dist(V,pt(a.q)))*0.45,X=add(V,mul(u1,r1)),Y=add(V,mul(u2,r1));o.push({t:'arc',c:V,r:r1,a0:Math.min(ang(X,V),ang(Y,V))-0.15,sw:Math.abs(ang(X,V)-ang(Y,V))+0.3});var r2=dist(X,Y)*0.75,Z=cc(X,r2,Y,r2).sort(function(p,q){return dist(q,V)-dist(p,V)})[0];arcAt(X,r2,Z);arcAt(Y,r2,Z);seg(V,Z,1)}
  else if(t==='perpFrom'||t==='perpAt'){var Pp=pt(a.p),A2=pt(a.a),u=unit(sub(pt(a.b),A2)),F=add(A2,mul(u,dot(sub(Pp,A2),u))),h=dist(Pp,F),r3=t==='perpAt'?1.8:h+1.2,w=Math.sqrt(r3*r3-h*h),X3=add(F,mul(u,w)),Y3=add(F,mul(u,-w));arcAt(Pp,r3,X3,0.25);arcAt(Pp,r3,Y3,0.25);var r4=w*1.5,Z=cc(X3,r4,Y3,r4).sort(function(p,q){return dist(q,Pp)-dist(p,Pp)})[0];arcAt(X3,r4,Z);arcAt(Y3,r4,Z);seg(Pp,Z,0.6)}
  else if(t==='angle'||t==='triSAS'){var V2=pt(a.v),ub=unit(sub(pt(a.b),V2)),d=rot(ub,-a.deg*DEG),E=add(V2,mul(d,a.ac||5));seg(V2,E);if(t==='triSAS')seg(pt(a.b),E)}
  else if(t==='triSSS'){var A4=pt(a.a),B4=pt(a.b),C=cc(A4,a.ac,B4,a.bc).sort(function(p,q){return p[1]-q[1]})[0];arcAt(A4,a.ac,C,0.3);arcAt(B4,a.bc,C,0.3);seg(A4,C);seg(B4,C)}
  else if(t==='circle'){o.push({t:'arc',c:pt(a.c),r:a.r,a0:0,sw:2*Math.PI})}
  else if(t==='stadium'){var A6=pt(a.a),B6=pt(a.b),u6=unit(sub(B6,A6)),n6=[-u6[1],u6[0]];[1,-1].forEach(function(sg){seg(add(A6,mul(n6,sg*a.r)),add(B6,mul(n6,sg*a.r)))});var t6=Math.atan2(n6[1],n6[0]);o.push({t:'arc',c:A6,r:a.r,a0:t6,sw:Math.PI});o.push({t:'arc',c:B6,r:a.r,a0:t6,sw:-Math.PI})}
  else if(t==='region'){if(a.perp){var A7=pt(a.perp[0]),B7=pt(a.perp[1]),M=mul(add(A7,B7),0.5),u7=unit(sub(B7,A7)),n7=[-u7[1],u7[0]];seg(add(M,mul(n7,-20)),add(M,mul(n7,20)))}(a.circles||[]).forEach(function(c){o.push({t:'arc',c:pt(c[0]),r:c[1],a0:0,sw:2*Math.PI})})}
  else if(t==='bearing'){var V3=pt(a.a),d3=[Math.sin(a.deg*DEG),-Math.cos(a.deg*DEG)];seg(V3,add(V3,mul(d3,a.len||5)))}
  else if(t==='twoBearings'){[[a.a,a.da],[a.b,a.db]].forEach(function(q){var V=pt(q[0]),d=[Math.sin(q[1]*DEG),-Math.cos(q[1]*DEG)];seg(V,add(V,mul(d,7)))})}
  return o}

 /* ---------- the widget ---------- */
 WIDGETS.construct=function(box,par){var S=JSON.parse(JSON.stringify(par)),W=S.w||14,H=S.h||9,objs=[],seeds=[],undo=[],tool=(S.tools||['ruler'])[0],cw=S.cw||4,cmode='arc',prot=null,drag=null,hover=null,showModel=false,locked=false,maskFn=null;
  S.pts=S.pts||{};
  var tools=S.tools||['ruler','compass','protractor','point'],ICON={ruler:'📏 Ruler',compass:'⊙ Compasses',protractor:'◠ Protractor',point:'✕ Point',shade:'▦ Shade',erase:'⌫ Rubber'};
  box.innerHTML='<div class="cx"><div class="cxbar">'+tools.concat(['erase']).map(function(k){return '<button type="button" class="cxt" data-t="'+k+'">'+ICON[k]+'</button>'}).join('')+'<button type="button" class="cxt" data-a="undo">↶ Undo</button><button type="button" class="cxt" data-a="clear">Clear</button></div>'+
   '<div class="cxsub" data-k="sub"></div><canvas class="cxc" aria-label="Drawing area"></canvas><div class="cxhelp" data-k="help"></div>'+(S.ask?'<div class="cxask"><label>'+S.ask.l+' <input type="text" inputmode="decimal" data-k="ans" autocomplete="off"> '+S.ask.u+'</label></div>':'')+'<div class="cxmodel" data-k="mdl" style="display:none"><button type="button" class="cxt" data-a="model">👀 Show me how</button></div></div>';
  var cv=box.querySelector('.cxc'),g=cv.getContext('2d'),sub0=box.querySelector('[data-k=sub]'),help=box.querySelector('[data-k=help]'),scale=40,dpr=1;
  var HELP={ruler:'Drag from one point to another to draw a straight line. It snaps to points and to where lines and arcs cross. The ruler shows the length.',compass:'Press where the compass point goes, then sweep round to draw an arc. Change the width with − and +, or drag ↔ between two points to copy a length.',protractor:'Drag from the vertex along a line to place the protractor. Then tap the scale to mark an angle, and join it up with the ruler.',point:'Tap to mark a point.',shade:'Tap inside a region to shade it. Tap it again to unshade.',erase:'Tap a line, arc or point you drew to rub it out.'};
  function setTool(t){tool=t;[].forEach.call(box.querySelectorAll('[data-t]'),function(b){b.classList.toggle('on',b.getAttribute('data-t')===t)});help.textContent=HELP[t]||'';subbar();draw()}
  function subbar(){if(tool==='compass'){sub0.innerHTML='<span>Width <b data-k="cw">'+cw.toFixed(1)+' cm</b></span><button type="button" class="cxt" data-a="cm">−</button><button type="button" class="cxt" data-a="cp">+</button><button type="button" class="cxt'+(cmode==='width'?' on':'')+'" data-a="cset">↔ Copy a length</button>';sub0.style.display='flex';
    sub0.querySelector('[data-a=cm]').onclick=function(){cw=Math.max(0.5,Math.round((cw-0.1)*10)/10);subbar()};sub0.querySelector('[data-a=cp]').onclick=function(){cw=Math.min(12,Math.round((cw+0.1)*10)/10);subbar()};sub0.querySelector('[data-a=cset]').onclick=function(){cmode=cmode==='width'?'arc':'width';subbar()}}
   else if(tool==='protractor'&&prot){sub0.innerHTML='<span>Tap the scale to mark an angle.</span><button type="button" class="cxt" data-a="pr">Move it</button>';sub0.style.display='flex';sub0.querySelector('[data-a=pr]').onclick=function(){prot=null;subbar();draw()}}
   else{sub0.innerHTML='<span>'+(tool==='protractor'?'Drag from the vertex along a line to place the protractor.':tool==='shade'?'Tap inside a region to shade it.':tool==='point'?'Tap to mark a point.':tool==='erase'?'Tap something you drew to rub it out.':'Drag between two points.')+'</span>';sub0.style.display='flex'}}
  function size(){cv.style.width='100%';var wpx=cv.getBoundingClientRect().width||box.clientWidth||600;if(wpx<50)return;scale=wpx/W;dpr=window.devicePixelRatio||1;cv.style.height=(H*scale)+'px';cv.width=Math.round(wpx*dpr);cv.height=Math.round(H*scale*dpr);draw()}
  function toM(e){var r=cv.getBoundingClientRect(),k=r.width/W;return [(e.clientX-r.left)/k,(e.clientY-r.top)/k]}
  function X(p){return [p[0]*scale*dpr,p[1]*scale*dpr]}
  function snaps(){var L=[];for(var n in S.pts)L.push(S.pts[n]);objs.forEach(function(o){if(o.t==='pt'||o.t==='mark')L.push(o.p);if(o.t==='seg'){L.push(o.a,o.b)}});
   var sg=objs.filter(function(o){return o.t==='seg'}).concat((S.segs||[]).map(function(s){return {a:S.pts[s[0]],b:S.pts[s[1]]}})),ac=objs.filter(function(o){return o.t==='arc'});
   for(var i=0;i<ac.length;i++)for(var j=i+1;j<ac.length;j++)cc(ac[i].c,ac[i].r,ac[j].c,ac[j].r).forEach(function(p){if(inSweep(ac[i],ang(p,ac[i].c),0.02)&&inSweep(ac[j],ang(p,ac[j].c),0.02))L.push(p)});
   ac.forEach(function(a){sg.forEach(function(s){var d=unit(sub(s.b,s.a)),l=dist(s.a,s.b);lc(s.a,d,a.c,a.r).forEach(function(t){if(t>=-0.05&&t<=l+0.05){var p=add(s.a,mul(d,t));if(inSweep(a,ang(p,a.c),0.02))L.push(p)}})})});
   for(i=0;i<sg.length;i++)for(j=i+1;j<sg.length;j++){var d1=sub(sg[i].b,sg[i].a),d2=sub(sg[j].b,sg[j].a),den=crs(d1,d2);if(Math.abs(den)<1e-9)continue;var t=crs(sub(sg[j].a,sg[i].a),d2)/den,u=crs(sub(sg[j].a,sg[i].a),d1)/den;if(t>=-0.01&&t<=1.01&&u>=-0.01&&u<=1.01)L.push(add(sg[i].a,mul(d1,t)))}
   return L}
  function snap(p){var best=null,bd=Math.max(0.22,11/scale);snaps().forEach(function(q){var d=dist(p,q);if(d<bd){bd=d;best=q}});return best?[best[0],best[1]]:p}
  function push(){undo.push(JSON.stringify({o:objs,s:seeds}));if(undo.length>60)undo.shift()}
  /* shading: flood fill on a low-resolution copy of the drawing */
  function shade(){S._seedMasks=[];if(!seeds.length){maskFn=null;S._mask=null;S._shadeImg=null;return}var k=12,w=Math.ceil(W*k),h=Math.ceil(H*k),c=document.createElement('canvas');c.width=w;c.height=h;var q=c.getContext('2d');q.strokeStyle='#000';q.lineWidth=1.6;q.lineCap='round';
   var line=function(a,b){q.beginPath();q.moveTo(a[0]*k,a[1]*k);q.lineTo(b[0]*k,b[1]*k);q.stroke()};
   (S.segs||[]).forEach(function(s){line(S.pts[s[0]],S.pts[s[1]])});if(S.shape){q.beginPath();S.shape.forEach(function(p,i){if(i)q.lineTo(p[0]*k,p[1]*k);else q.moveTo(p[0]*k,p[1]*k)});q.closePath();q.stroke()}
   objs.forEach(function(o){if(o.t==='seg')line(o.a,o.b);if(o.t==='arc'){q.beginPath();q.arc(o.c[0]*k,o.c[1]*k,o.r*k,o.a0,o.a0+o.sw,o.sw<0);q.stroke()}});
   var img=q.getImageData(0,0,w,h).data,wall=new Uint8Array(w*h),m=new Uint8Array(w*h),i;for(i=0;i<w*h;i++)wall[i]=img[i*4+3]>60?1:0;
   var at=function(arr,p){var x=Math.floor(p[0]*k),y=Math.floor(p[1]*k);return x>=0&&y>=0&&x<w&&y<h&&!!arr[y*w+x]};
   seeds.forEach(function(sd){var one=new Uint8Array(w*h),x=Math.floor(sd[0]*k),y=Math.floor(sd[1]*k);S._seedMasks.push(one);if(x<0||y<0||x>=w||y>=h||wall[y*w+x])return;var st=[y*w+x];while(st.length){var p=st.pop();if(one[p]||wall[p])continue;one[p]=1;m[p]=1;var px=p%w,py=(p/w)|0;if(px>0)st.push(p-1);if(px<w-1)st.push(p+1);if(py>0)st.push(p-w);if(py<h-1)st.push(p+w)}});
   maskFn=function(p){return at(m,p)};S._mask=maskFn;S._at=at;
   var out=document.createElement('canvas');out.width=w;out.height=h;var oq=out.getContext('2d'),id=oq.createImageData(w,h),rgb=hex(css('--accent','#534AB7'));for(i=0;i<w*h;i++)if(m[i]){id.data[i*4]=rgb[0];id.data[i*4+1]=rgb[1];id.data[i*4+2]=rgb[2];id.data[i*4+3]=70}oq.putImageData(id,0,0);S._shadeImg=out}
  function hex(c){var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c);return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[83,74,183]}
  function draw(){var ink=css('--text','#111'),mut=css('--muted','#666'),acc=css('--accent','#534AB7'),paper=css('--panel','#fff'),line=css('--line','#ddd');g.setTransform(1,0,0,1,0,0);g.fillStyle=paper;g.fillRect(0,0,cv.width,cv.height);
   if(S.grid){g.strokeStyle=line;g.lineWidth=1;for(var x=0;x<=W;x++){g.beginPath();g.moveTo(x*scale*dpr,0);g.lineTo(x*scale*dpr,cv.height);g.stroke()}for(var y=0;y<=H;y++){g.beginPath();g.moveTo(0,y*scale*dpr);g.lineTo(cv.width,y*scale*dpr);g.stroke()}}
   if(S._shadeImg){g.imageSmoothingEnabled=true;g.drawImage(S._shadeImg,0,0,cv.width,cv.height)}
   var L=function(a,b,w,c,dash){g.strokeStyle=c;g.lineWidth=w*dpr;g.setLineDash(dash||[]);g.beginPath();var p=X(a),q=X(b);g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();g.setLineDash([])};
   var A=function(o,w,c,dash){g.strokeStyle=c;g.lineWidth=w*dpr;g.setLineDash(dash||[]);g.beginPath();var p=X(o.c);g.arc(p[0],p[1],o.r*scale*dpr,o.a0,o.a0+o.sw,o.sw<0);g.stroke();g.setLineDash([])};
   var T=function(t,p,c,sz,al){g.fillStyle=c;g.font='700 '+(sz||13)*dpr+'px system-ui,sans-serif';g.textAlign=al||'left';g.fillText(t,X(p)[0],X(p)[1])};
   var cross=function(p,c){var s=0.12;L([p[0]-s,p[1]-s],[p[0]+s,p[1]+s],1.6,c);L([p[0]-s,p[1]+s],[p[0]+s,p[1]-s],1.6,c)};
   if(S.shape){g.strokeStyle=ink;g.lineWidth=2*dpr;g.beginPath();S.shape.forEach(function(p,i){var q=X(p);if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1])});g.closePath();g.stroke()}
   (S.segs||[]).forEach(function(s){L(S.pts[s[0]],S.pts[s[1]],2.2,ink)});
   (S.north||[]).forEach(function(n){var p=S.pts[n];L(p,[p[0],p[1]-1.6],1.6,mut);T('N',[p[0],p[1]-1.75],mut,12,'center')});
   for(var n in S.pts){var p=S.pts[n];if(S.hide&&S.hide.indexOf(n)>=0)continue;g.fillStyle=ink;g.beginPath();g.arc(X(p)[0],X(p)[1],2.6*dpr,0,7);g.fill();var off=(S.lab&&S.lab[n])||[0.18,-0.18];T(n,[p[0]+off[0],p[1]+off[1]],ink,14,off[0]<0?'right':'left')}
   if(S.scale)T(S.scale,[W-0.2,H-0.25],mut,12,'right');
   if(showModel)model(S).forEach(function(o){if(o.t==='seg')L(o.a,o.b,2,acc,[6*dpr,5*dpr]);else A(o,2,acc,[6*dpr,5*dpr])});
   objs.forEach(function(o){if(o.t==='seg')L(o.a,o.b,1.7,ink);else if(o.t==='arc')A(o,1.5,ink);else if(o.t==='pt'){cross(o.p,ink);if(o.lab)T(o.lab,[o.p[0]+0.18,o.p[1]-0.18],ink,14)}else if(o.t==='mark'){cross(o.p,acc);T(o.lab||'',[o.p[0]+0.15,o.p[1]-0.15],acc,11)}});
   if(prot&&tool==='protractor')drawProt(ink,mut,acc);
   if(drag&&drag.t==='ruler'&&drag.b)drawRuler(drag.a,drag.b,ink,mut,acc);
   if(drag&&drag.t==='cw'&&drag.b){L(drag.a,drag.b,1.4,acc,[4*dpr,4*dpr]);T(dist(drag.a,drag.b).toFixed(1)+' cm',[(drag.a[0]+drag.b[0])/2+0.15,(drag.a[1]+drag.b[1])/2-0.15],acc,13)}
   if(drag&&drag.t==='carc'){var c=drag.c;g.fillStyle=acc;g.beginPath();g.arc(X(c)[0],X(c)[1],3*dpr,0,7);g.fill();if(drag.a0!=null){A({c:c,r:cw,a0:drag.a0,sw:drag.sw},1.5,ink);var e=add(c,[cw*Math.cos(drag.a0+drag.sw),cw*Math.sin(drag.a0+drag.sw)]);L(c,e,1.2,acc,[3*dpr,3*dpr])}else{A({c:c,r:cw,a0:0,sw:2*Math.PI},1,line,[3*dpr,4*dpr])}}
   if(drag&&drag.t==='pplace'&&drag.b){prot={v:drag.v,t0:Math.atan2(drag.b[1]-drag.v[1],drag.b[0]-drag.v[0])};drawProt(ink,mut,acc);prot=drag.keep}
   if(hover&&hover.snap){g.strokeStyle=acc;g.lineWidth=1.5*dpr;g.beginPath();g.arc(X(hover.snap)[0],X(hover.snap)[1],7*dpr,0,7);g.stroke()}
   if(hover&&hover.deg!=null){T(hover.lab,[hover.p[0]+0.25,hover.p[1]-0.25],acc,13)}}
  function drawRuler(a,b,ink,mut,acc){var u=unit(sub(b,a)),n=[-u[1],u[0]],l=dist(a,b),o=a,st=-0.5,en=Math.max(l,1)+0.5,wd=0.75;
   var c=[add(add(o,mul(u,st)),mul(n,0)),add(add(o,mul(u,en)),mul(n,0)),add(add(o,mul(u,en)),mul(n,wd)),add(add(o,mul(u,st)),mul(n,wd))];
   g.fillStyle='rgba(250,220,120,.35)';g.strokeStyle=mut;g.lineWidth=1*dpr;g.beginPath();c.forEach(function(p,i){var q=X(p);if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1])});g.closePath();g.fill();g.stroke();
   for(var mm=0;mm<=Math.floor((en)*10);mm++){var t=mm/10,p=add(o,mul(u,t)),q=add(p,mul(n,mm%10===0?0.3:mm%5===0?0.2:0.12));g.strokeStyle=mut;g.lineWidth=0.8*dpr;g.beginPath();g.moveTo(X(p)[0],X(p)[1]);g.lineTo(X(q)[0],X(q)[1]);g.stroke();if(mm%10===0){g.fillStyle=mut;g.font=10*dpr+'px system-ui';g.textAlign='center';var lp=X(add(p,mul(n,0.48)));g.fillText(String(mm/10),lp[0],lp[1]+3*dpr)}}
   g.strokeStyle=ink;g.lineWidth=1.7*dpr;g.beginPath();g.moveTo(X(a)[0],X(a)[1]);g.lineTo(X(b)[0],X(b)[1]);g.stroke();
   var mid=add(add(a,mul(u,l/2)),mul(n,-0.35));g.fillStyle=acc;g.font='700 '+13*dpr+'px system-ui';g.textAlign='center';g.fillText(l.toFixed(1)+' cm',X(mid)[0],X(mid)[1])}
  function PR(){return Math.min(3.2,Math.min(W,H)*0.36)}
  function drawProt(ink,mut,acc){var v=prot.v,R=PR(),c=X(v);g.fillStyle='rgba(120,170,255,.12)';g.strokeStyle=mut;g.lineWidth=1*dpr;g.beginPath();g.arc(c[0],c[1],R*scale*dpr,0,7);g.fill();g.stroke();
   for(var i=0;i<360;i++){var t=prot.t0+i*DEG,l=i%10===0?0.32:i%5===0?0.22:0.12,p1=add(v,[R*Math.cos(t),R*Math.sin(t)]),p2=add(v,[(R-l)*Math.cos(t),(R-l)*Math.sin(t)]);g.strokeStyle=mut;g.lineWidth=(i%10?0.7:1)*dpr;g.beginPath();g.moveTo(X(p1)[0],X(p1)[1]);g.lineTo(X(p2)[0],X(p2)[1]);g.stroke();
    if(i%10===0&&R*scale>70){g.fillStyle=mut;g.font=(scale>34?10:8)*dpr+'px system-ui';g.textAlign='center';var q=X(add(v,[(R-0.55)*Math.cos(t),(R-0.55)*Math.sin(t)]));g.fillText(String(i),q[0],q[1]+3*dpr);if(!S.bear){var q2=X(add(v,[(R-0.95)*Math.cos(t),(R-0.95)*Math.sin(t)]));g.fillStyle=acc;g.fillText(String((360-i)%360),q2[0],q2[1]+3*dpr)}}}
   var b1=add(v,[R*Math.cos(prot.t0),R*Math.sin(prot.t0)]),b2=add(v,[-R*Math.cos(prot.t0),-R*Math.sin(prot.t0)]);g.strokeStyle=acc;g.lineWidth=1.4*dpr;g.beginPath();g.moveTo(X(b2)[0],X(b2)[1]);g.lineTo(X(b1)[0],X(b1)[1]);g.stroke();g.fillStyle=acc;g.beginPath();g.arc(c[0],c[1],2.5*dpr,0,7);g.fill()}
  function protDeg(p){if(!prot)return null;var R=PR(),d=dist(p,prot.v);if(Math.abs(d-R)>0.7)return null;var i=Math.round(nrm(ang(p,prot.v)-prot.t0)/DEG)%360;return i}
  function nearest(p){var best=null,bd=0.3;objs.forEach(function(o,i){var d=9;if(o.t==='seg'){var u=sub(o.b,o.a),l=len(u),t=Math.max(0,Math.min(1,dot(sub(p,o.a),u)/(l*l||1)));d=dist(p,add(o.a,mul(u,t)))}else if(o.t==='arc'){d=Math.abs(dist(p,o.c)-o.r);if(!inSweep(o,ang(p,o.c),0.05))d=9}else d=dist(p,o.p);if(d<bd){bd=d;best=i}});return best}
  function nextLab(){var used={};for(var n in S.pts)used[n]=1;objs.forEach(function(o){if(o.lab)used[o.lab]=1});var L=(S.labels||'PQRSTUVWXYZ').split('');for(var i=0;i<L.length;i++)if(!used[L[i]])return L[i];return ''}
  cv.addEventListener('pointerdown',function(e){if(locked)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}var p=toM(e),sp=snap(p);
   if(tool==='ruler')drag={t:'ruler',a:sp};
   else if(tool==='compass')drag=cmode==='width'?{t:'cw',a:sp}:{t:'carc',c:sp,a0:null,sw:0,last:null};
   else if(tool==='protractor'){var dg=protDeg(p);if(dg!=null)drag={t:'pmark'};else drag={t:'pplace',v:sp,keep:prot}}
   else if(tool==='point'){push();objs.push({t:'pt',p:sp,lab:nextLab()});changed()}
   else if(tool==='shade'){push();var hit=-1;(S._seedMasks||[]).forEach(function(arr,i){if(hit<0&&S._at&&S._at(arr,p))hit=i});if(hit>=0)seeds.splice(hit,1);else seeds.push(p);changed()}
   else if(tool==='erase'){var i=nearest(p);if(i!=null){push();objs.splice(i,1);changed()}}
   draw()});
  cv.addEventListener('pointermove',function(e){var p=toM(e);hover={snap:(tool==='ruler'||tool==='compass'||tool==='point')?(function(){var s=snap(p);return s!==p&&(s[0]!==p[0]||s[1]!==p[1])?s:null})():null};
   if(tool==='protractor'&&prot&&!drag){var dg=protDeg(p);if(dg!=null){hover.deg=dg;hover.p=p;hover.lab=S.bear?('00'+dg).slice(-3)+'°':Math.min(dg,360-dg)+'°'}}
   if(drag){if(drag.t==='ruler'||drag.t==='cw')drag.b=snap(p);else if(drag.t==='carc'){var c=drag.c,t=ang(p,c);if(drag.a0==null){if(dist(p,c)>0.3){drag.a0=t;drag.last=t}}else{var d=t-drag.last;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;drag.sw=Math.max(-2*Math.PI,Math.min(2*Math.PI,drag.sw+d));drag.last=t}}
    else if(drag.t==='pplace'){var b=p,ds=[];for(var n in S.pts)if(dist(S.pts[n],drag.v)>0.2)ds.push(sub(S.pts[n],drag.v));objs.forEach(function(o){if(o.t==='seg'){if(dist(o.a,drag.v)<0.2)ds.push(sub(o.b,o.a));if(dist(o.b,drag.v)<0.2)ds.push(sub(o.a,o.b))}});if((S.north||[]).length)ds.push([0,-1]);var v=sub(p,drag.v);ds.forEach(function(d){if(adir(v,d)<5)b=add(drag.v,d)});drag.b=b}
    else if(drag.t==='pmark'){var dg2=protDeg(p);if(dg2!=null){hover.deg=dg2;hover.p=p;hover.lab=S.bear?('00'+dg2).slice(-3)+'°':Math.min(dg2,360-dg2)+'°'}}}
   draw()});
  function up(e){if(!drag)return;var p=toM(e),d=drag;drag=null;
   if(d.t==='ruler'&&d.b&&dist(d.a,d.b)>0.15){push();objs.push({t:'seg',a:d.a,b:d.b});changed()}
   else if(d.t==='cw'&&d.b&&dist(d.a,d.b)>0.2){cw=Math.round(dist(d.a,d.b)*100)/100;cmode='arc';subbar()}
   else if(d.t==='carc'&&d.a0!=null&&Math.abs(d.sw)>3*DEG){push();objs.push({t:'arc',c:d.c,r:cw,a0:d.a0,sw:d.sw});changed()}
   else if(d.t==='pplace'){if(d.b&&dist(d.v,d.b)>0.3){prot={v:d.v,t0:Math.atan2(d.b[1]-d.v[1],d.b[0]-d.v[0])};subbar()}else prot=d.keep}
   else if(d.t==='pmark'){var dg=protDeg(p);if(dg!=null){var R=PR(),t=prot.t0+dg*DEG;push();objs.push({t:'mark',p:add(prot.v,[R*Math.cos(t),R*Math.sin(t)]),lab:S.bear?('00'+dg).slice(-3)+'°':Math.min(dg,360-dg)+'°'});changed()}}
   draw()}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',function(){drag=null;draw()});cv.addEventListener('pointerleave',function(){if(!drag){hover=null;draw()}});
  function changed(){shade();draw()}
  [].forEach.call(box.querySelectorAll('[data-t]'),function(b){b.onclick=function(){setTool(b.getAttribute('data-t'))}});
  box.querySelector('[data-a=undo]').onclick=function(){if(!undo.length||locked)return;var u=JSON.parse(undo.pop());objs=u.o;seeds=u.s;changed()};
  box.querySelector('[data-a=clear]').onclick=function(){if(locked||(!objs.length&&!seeds.length))return;push();objs=[];seeds=[];changed()};
  box.querySelector('[data-a=model]').onclick=function(){showModel=!showModel;this.textContent=showModel?'Hide the model answer':'👀 Show me how';draw()};
  var ansIn=box.querySelector('[data-k=ans]');
  setTool(tool);size();var ro=window.ResizeObserver?new ResizeObserver(function(){size()}):null;if(ro)ro.observe(box);
  return {check:function(){if(ansIn)S._ans=ansIn.value;shade();var res=K(S,objs),ok=res.every(function(x){return x.ok});if(!ok)box.querySelector('[data-k=mdl]').style.display='block';
    return {ok:ok,head:ok?null:'Not quite yet',msg:'<ul class="cxres">'+res.map(function(x){return '<li class="'+(x.ok?'y':'n')+'">'+(x.ok?'✓ ':'✗ ')+x.msg+'</li>'}).join('')+'</ul>'}},
   lock:function(){locked=true;if(ansIn)ansIn.disabled=true}}};
 var st=document.createElement('style');st.textContent='.cx{display:flex;flex-direction:column;gap:8px}.cxbar,.cxsub{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.cxsub{font-size:14px;color:var(--muted);height:34px;flex-wrap:nowrap!important;overflow:hidden;white-space:nowrap}.cxsub span{overflow:hidden;text-overflow:ellipsis;min-width:0}.cxt{font:inherit;font-size:14px;font-weight:700;border:1.5px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:6px 10px;cursor:pointer}.cxt.on{border-color:var(--accent);background:var(--accent-bg,var(--soft))}.cxc{display:block;max-width:100%;outline:1.5px solid var(--line);outline-offset:-1.5px;border-radius:12px;touch-action:none;cursor:crosshair}.cxhelp{font-size:13.5px;color:var(--muted)}.cxask input{width:90px;font:inherit;font-family:var(--mono);border:1.5px solid var(--line);border-radius:10px;padding:6px 8px;background:var(--bg);color:var(--text)}.cxres{margin:6px 0 0;padding-left:0;list-style:none}.cxres li{margin:3px 0}.cxres li.y{color:var(--good,#2f7d32)}.cxres li.n{color:var(--bad,#b4231a)}';document.head.appendChild(st);
 window.__cx={K:K,model:model,cc:cc};
})();
