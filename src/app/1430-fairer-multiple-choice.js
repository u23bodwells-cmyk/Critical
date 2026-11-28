/* ===== fairer multiple choice: when the right answer is a full sentence, weak wrong answers (much shorter, or silly)
   are swapped for real statements from the same unit, of a similar length. Each one is the right answer to a different
   question, so you have to know which fact answers this one instead of picking the one that sounds most formal. ===== */
var MCF_STOP={that:1,this:1,with:1,from:1,they:1,them:1,their:1,there:1,what:1,when:1,which:1,will:1,would:1,into:1,have:1,more:1,less:1,than:1,then:1,each:1,only:1,does:1,because:1,about:1,very:1,much:1,some:1,also:1,been:1,being:1};
var MCF_IDX=null,MCF_LID=null;
/* the kind of question, and the kind of answer: only like-for-like answers are swapped in */
function mcfQK(p){p=p.toLowerCase().replace(/^[^a-z]+/,'');var m;if(/^why\b/.test(p))return 'why';if(/^how (does|do|is|are|can)\b/.test(p))return 'how';if(/^what (does|do)\b.*\b(do|mean|measure|show|tell)\b/.test(p))return 'whatdo';if(/^what (is|are)\b/.test(p))return 'whatis';if(/^what happens\b/.test(p))return 'happens';if(/^when\b/.test(p))return 'when';if(/^where\b/.test(p))return 'where';if(/^(a|an|the|if|you|after|during|in)\b.*\?$/.test(p))return 'scen';return null}
function mcfAK(t){var w=t.split(' ')[0].toLowerCase().replace(/[^a-z']/g,'');if(/^(to|because|it|its|it's|they|they're|there|the|a|an|by|so|when|if|more|less|only|no|nothing)$/.test(w))return w==='its'||w==="it's"?'it':w==='they\'re'?'they':w==='an'?'a':w;if(/[^s]s$/.test(w)&&w.length>3)return 'verbs';if(/ing$/.test(w))return 'ing';return 'other'}
function mcfText(h){var d=document.createElement('div');d.innerHTML=h||'';return d.textContent.replace(/\s+/g,' ').trim()}
function mcfWords(s){var o={};String(s).toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(' ').forEach(function(w){if(w.length>=4&&!MCF_STOP[w])o[w]=1});return o}
function mcfOver(a,b){var ka=Object.keys(a),kb=Object.keys(b),n=0;if(!ka.length||!kb.length)return 0;ka.forEach(function(k){if(b[k])n++});return n/Math.min(ka.length,kb.length)}
function mcfBuild(){if(MCF_IDX)return;MCF_IDX={};MCF_LID={};UNITS.forEach(function(u,ui){var list=MCF_IDX[ui]=[];u.lessons.forEach(function(l){MCF_LID[l.id]=ui;l.cards.forEach(function(c){if(c.t!=='Q'||!c.o||typeof c.a!=='number')return;var h=c.o[c.a];if(/<(img|svg|table)/i.test(h))return;var t=mcfText(h);if(t.split(' ').length<3)return;
  list.push({h:h,t:t,w:mcfWords(t),pw:mcfWords(mcfText(c.p)),dig:/\d/.test(t),qk:mcfQK(mcfText(c.p)),ak:mcfAK(t)})})})})}
var MCF_SKIP=/\b(true|correct|false|not|isn't|aren't|except|incorrect|wrong|untrue|odd one|best describes|which (of these|statement|one|two|three|four|list|pair|row|option))\b/i;
function mcfFix(c){if(!c||c.t!=='Q'||!c.o||typeof c.a!=='number'||c._mcFix||c.o.length<3||c._ty)return null;var pt=mcfText(c.p);if(MCF_SKIP.test(pt)||/fill the gap/i.test(pt)||/qchk|QUICK CHECK/i.test(c.p||''))return null;
 if(c.o.some(function(o){return /<(img|svg|table|input)/i.test(o)}))return null;var ct=mcfText(c.o[c.a]);if(ct.split(' ').length<3)return null;
 mcfBuild();var ui=null,m=String(c._key||c._src0||c._rk||'').replace(/^[FB]/,'').match(/^([^#@]+)/);if(m&&MCF_LID[m[1]]!=null)ui=MCF_LID[m[1]];if(ui==null&&typeof P!=='undefined'&&P&&P.mode==='lesson')ui=P.ui;if(ui==null||!MCF_IDX[ui])return null;
 var L=ct.length,weak=[],keep=[];c.o.forEach(function(o,i){if(i===c.a)return;var t=mcfText(o);if(t.length<L*0.72)weak.push(i);else keep.push(i)});
 if(!weak.length)return null;if(!keep.length){weak.sort(function(a,b){return mcfText(c.o[b]).length-mcfText(c.o[a]).length});keep.push(weak.shift());if(!weak.length)return null}
 var cw=mcfWords(ct),pw=mcfWords(pt),have={};c.o.forEach(function(o){have[mcfText(o).toLowerCase()]=1});var dig=/\d/.test(ct),qk=mcfQK(pt),ak=mcfAK(ct);if(!qk||(ak==='other'&&qk!=='why'))return null;
 var src=MCF_IDX[ui].map(function(x){x.near=0;return x}),tk=trk(ui);for(var du=-2;du<=2;du++){var u2=ui+du;if(du&&MCF_IDX[u2]&&trk(u2)===tk)src=src.concat(MCF_IDX[u2].map(function(x){x.near=Math.abs(du)*0.15;return x}))}
 var cand=src.filter(function(x){return !have[x.t.toLowerCase()]&&x.t.length>=L*0.7&&x.t.length<=L*1.35&&x.dig===dig&&x.qk===qk&&(qk==='why'?x.ak!=='other'||ak==='other':x.ak===ak)&&mcfOver(x.w,cw)<0.45&&mcfOver(x.pw,pw)<0.5});
 if(!cand.length)return null;cand.forEach(function(x){x.s=Math.abs(x.t.length-L)/L+x.near+(x.ak===ak?0:0.2)+Math.random()*0.3});cand.sort(function(a,b){return a.s-b.s});
 var o=c.o.slice(),used=0;weak.forEach(function(i){var x=cand[used];if(!x)return;if(cand.slice(0,used).some(function(y){return mcfOver(y.w,x.w)>0.6})){used++;x=cand[used];if(!x)return}o[i]=x.h;used++});
 if(!used)return null;return Object.assign({},c,{o:o,_mcFix:1})}
var showCard_mcf=showCard;showCard=function(){try{if(typeof P!=='undefined'&&P&&P.cards){var c=P.cards[P.i],f=mcfFix(c);if(f){if(!P._pcCopy){P.cards=P.cards.slice();P._pcCopy=1}P.cards[P.i]=f}else if(c&&c.t==='Q'&&!c._mcFix){c._mcFix=1}}}catch(e){if(window.console)console.error(e)}return showCard_mcf.apply(this,arguments)};
