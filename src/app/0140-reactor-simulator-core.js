var SP={beta:0.0065,bi:[0.033,0.219,0.196,0.395,0.115,0.042],li:[0.0124,0.0305,0.111,0.301,1.14,3.01],Lam:2e-5,LS:3e-11,Pfull:3000,Rf:500/3000,Cf:30,Cc:1500,mcp:90.9,pump:15,aM:-30,aF:-2.5,bw:-10,Wsd:4000,Wcb:3000,dh:[[0.025,0.1],[0.018,0.005],[0.012,0.00025],[0.010,1e-5]],lI:2.93e-5,lX:2.09e-5,gX:0.05,bX:1.2e-4,XeW:2800,dt:0.02,Tsat:344.8};
SP.dhSum=SP.dh.reduce(function(a,b){return a+b[0]},0);
SP.Xeq=function(n){return (1+SP.gX)*SP.lI*n/(SP.lX+SP.bX*n)};
SP.Xeq100=SP.Xeq(1);
SP.eL=SP.li.map(function(l){return Math.exp(-l*SP.dt)});
SP.eH=SP.dh.map(function(d){return Math.exp(-d[1]*SP.dt)});
function rodF(x){return x-Math.sin(2*Math.PI*x)/(2*Math.PI)}
function simRho(s){var r={sd:-SP.Wsd*(1-rodF(s.sd)),cb:-SP.Wcb*(1-rodF(s.cb)),b:SP.bw*s.B,m:SP.aM*(s.Tav-292),f:SP.aF*(s.Tf-292),x:-SP.XeW*s.X/SP.Xeq100};r.tot=s.rex+r.sd+r.cb+r.b+r.m+r.f+r.x;return r}
function simTref(s){return 292+18*s.load}
function simNew(o){var s={n:o.n,C:[],H:[],Tav:0,Tf:0,sd:o.sd,cb:o.cb,sdT:o.sd,cbT:o.cb,B:0,BT:0,load:o.load,loadT:o.load,I:o.xe?o.n:0,X:o.xe?SP.Xeq(o.n):0,tripped:false,t:0,rex:o.rex,auto:!!o.auto,w:0,pc:false,tripMsg:''};
for(var i=0;i<6;i++)s.C[i]=SP.beta*SP.bi[i]*s.n/(SP.Lam*SP.li[i]);
for(i=0;i<4;i++)s.H[i]=o.dhist?s.n:0;
var Pt=(s.n*(1-SP.dhSum)+(o.dhist?s.n*SP.dhSum:0))*SP.Pfull;
s.Tav=o.Tav!=null?o.Tav:simTref(s);s.Tf=s.Tav+Pt*SP.Rf;
if(o.B!=null){s.B=o.B}else{s.B=0;var r=simRho(s);s.B=r.tot/(-SP.bw)}
s.BT=s.B;s.sur=0;s.w=0;s.Pth=Pt;s.Thot=s.Tav+Pt/(2*SP.mcp);s.Tcold=s.Tav-Pt/(2*SP.mcp);s.dump=0;s.rho=simRho(s);return s}
function simStep(s,dt){var P=SP,i;
 if(s.tripped){s.sd=Math.max(0,s.sd-0.5*dt);s.cb=Math.max(0,s.cb-0.5*dt);s.sdT=0;s.cbT=Math.min(s.cbT,s.cb);s.loadT=0;s.load=0}
 else{ if(s.auto&&s.n>0.1){var e=(s.Tav-simTref(s))+30*(s.n-s.load);var a=Math.abs(e);if(a>0.5){var v=Math.min(0.005,0.002*(a-0.5));s.cbT=Math.max(0,Math.min(1,s.cb+(e>0?-1:1)*v*dt*1.0001))}else s.cbT=s.cb}
  s.sd+=Math.max(-0.01*dt,Math.min(0.01*dt,s.sdT-s.sd));s.cb+=Math.max(-0.005*dt,Math.min(0.005*dt,s.cbT-s.cb));
  s.load+=Math.max(-0.05/60*dt,Math.min(0.05/60*dt,s.loadT-s.load))}
 var d=s.BT-s.B;s.B+=Math.max(-dt/6,Math.min(dt*0.5,d));
 var r=simRho(s),rho=r.tot*1e-5;
 if(rho>=0.995*P.beta&&!s.pc){s.pc=true;simTrip(s,'Prompt critical')}
 rho=Math.min(rho,0.99*P.beta);
 var sl=0;for(i=0;i<6;i++)sl+=P.li[i]*s.C[i];
 var n0=s.n,n=(P.Lam*sl+P.LS)/(P.beta-rho);
 for(i=0;i<6;i++){var eq=P.beta*P.bi[i]*n/(P.Lam*P.li[i]);s.C[i]=eq+(s.C[i]-eq)*P.eL[i]}
 s.n=n;
 var pd=0;for(i=0;i<4;i++){s.H[i]=n+(s.H[i]-n)*P.eH[i];pd+=P.dh[i][0]*s.H[i]}
 var Pt=(n*(1-P.dhSum)+pd)*P.Pfull;s.Pth=Pt;
 var qf=(s.Tf-s.Tav)/P.Rf;s.Tf+=dt*(Pt-qf)/P.Cf;
 var Tr=simTref(s);var dump=Math.max(0,Math.min(1200,300*(s.Tav-Tr-0.2)));s.dump=dump;
 s.Tav+=dt*(qf+P.pump-s.load*P.Pfull-dump)/P.Cc;
 s.I+=dt*P.lI*(n-s.I);s.X+=dt*(P.lI*s.I+P.gX*P.lI*n-P.lX*s.X-P.bX*n*s.X);
 var om=n0>0?(Math.log(n)-Math.log(n0))/dt:0;s.w+=(om-s.w)*Math.min(1,dt/2);s.sur=26.06*s.w;
 s.Thot=s.Tav+qf/(2*P.mcp);s.Tcold=s.Tav-qf/(2*P.mcp);s.rho=r;
 if(!s.tripped){if(n>1.09)simTrip(s,'High neutron flux (109%)');else if(s.sur>3&&n>1e-9)simTrip(s,'High startup rate (3 DPM)');else if(s.Thot>335)simTrip(s,'High hot leg temperature');else if(s.Tav<275)simTrip(s,'Low average temperature')}
 s.t+=dt}
function simTrip(s,m){if(!s.tripped){s.tripped=true;s.tripMsg=m}}
if(typeof module!=='undefined')module.exports={SP:SP,simNew:simNew,simStep:simStep,simRho:simRho,simTrip:simTrip,simTref:simTref,rodF:rodF};

