/* ===================================================================
   CALCULUS TRACK: shared helpers, generated drills and graphs
   =================================================================== */
function cR(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function cP(a){return a[Math.floor(Math.random()*a.length)]}
function cNZ(a,b){var v;do{v=cR(a,b)}while(v===0);return v}
function cNum(n){var r=Math.round(n*10000)/10000;return String(r).replace(/-/g,'−')}
function cSup(s){return '<sup>'+String(s).replace(/-/g,'−')+'</sup>'}
/* one term a·xⁿ, written the way you'd write it by hand */
function cT(a,n,v){v=v||'x';if(a===0)return '0';if(n===0)return cNum(a);var ab=Math.abs(a);return (a<0?'−':'')+(ab===1?'':cNum(ab))+v+(n===1?'':cSup(cNum(n)))}
/* a polynomial from [[a,n],…] */
function cPoly(ts,v){var out='';ts.forEach(function(t){if(!t[0])return;var s=cT(t[0],t[1],v);if(!out)out=s;else out+=(t[0]<0?' − '+s.slice(1):' + '+s)});return out||'0'}
function cEval(ts,x){return ts.reduce(function(s,t){return s+t[0]*Math.pow(x,t[1])},0)}
function cDer(ts){return ts.filter(function(t){return t[1]!==0}).map(function(t){return [t[0]*t[1],t[1]-1]})}
function cBr(n){return n<0?'('+cNum(n)+')':cNum(n)}
function cCo(n){return n===1?'':n===-1?'−':cNum(n)}
function cSubst(ts,k){var out='';ts.forEach(function(t){if(!t[0])return;var s=(Math.abs(t[0])===1&&t[1]!==0?'':cNum(Math.abs(t[0]))+(t[1]===0?'':' × '))+(t[1]===0?'':'('+cNum(k)+')'+(t[1]===1?'':cSup(t[1])));if(!out)out=(t[0]<0?'−':'')+s;else out+=(t[0]<0?' − ':' + ')+s});return out}
function cB(a,pre,post,label,sup,tol){return {a:a,pre:pre||'',post:post||'',label:label||'',sup:!!sup,tol:tol}}
var CGEN={};

