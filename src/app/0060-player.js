/* ---------- player ---------- */
var P=null,DRAWS=[];
function onDraw(f){DRAWS.push(f);return f}
function redrawAll(){DRAWS.forEach(function(f){try{f()}catch(e){}});if(PAGE==='sim'&&window.simRedraw)simRedraw()}
window.addEventListener('resize',function(){clearTimeout(window._rz);window._rz=setTimeout(redrawAll,80)});
function startLesson(ui,li){var u=UNITS[ui],l=u.lessons[li];if(!S.done[l.id]){var pf=pendingFollow(trk(ui));if(pf){gateFollow(pf);return}}P={mode:'lesson',ui:ui,li:li,cards:playCards(l),i:0,xp:0,right:0,asked:0,title:l.title,color:u.color,unit:u.title,combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
function openPlayer(){var pl=$('player');pl.classList.add('open');document.body.classList.add('noscroll');showCombo(false);soundBtnUpd();ac();showCard();
 /* move keyboard focus into the lesson, so Enter presses Continue instead of the (now hidden) button that started it */
 try{var ae=document.activeElement;if(ae&&ae!==document.body&&!pl.contains(ae))ae.blur();if(!pl.contains(document.activeElement)){if(!pl.hasAttribute('tabindex'))pl.setAttribute('tabindex','-1');pl.focus({preventScroll:true})}}catch(_){}}
/* an in-app yes/no box: the browser's own confirm() can be switched off or blocked, and then the button just did nothing */
function askBox(msg,yes,no,fn){if(document.querySelector('.cfm'))return;var o=document.createElement('div');o.className='cfm';o.setAttribute('role','alertdialog');o.setAttribute('aria-modal','true');
 o.innerHTML='<div><p></p><div class="cfb"><button type="button" class="n"></button><button type="button" class="y"></button></div></div>';o.querySelector('p').textContent=msg;o.querySelector('.y').textContent=yes;o.querySelector('.n').textContent=no;
 var back=document.activeElement;function key(e){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();done(false)}else if(!o.contains(e.target)&&(e.key==='Enter'||e.key===' ')){e.preventDefault()}}function done(ok){window.removeEventListener('keydown',key,true);o.remove();if(!ok&&back&&document.body.contains(back))try{back.focus({preventScroll:true})}catch(_){}if(ok)fn()}
 o.querySelector('.y').onclick=function(){done(true)};o.querySelector('.n').onclick=function(){done(false)};o.addEventListener('click',function(e){if(e.target===o)done(false)});
 window.addEventListener('keydown',key,true);document.body.appendChild(o);setTimeout(function(){try{o.querySelector('.y').focus({preventScroll:true})}catch(_){}},30)}
function closePlayer(){var lu=P&&P.levelUp;stopTimer();$('player').classList.remove('open');document.body.classList.remove('noscroll');DRAWS=[];$('pBody').innerHTML='';P=null;if(PAGE==='learn')renderLearn();if(PAGE==='review')renderReview();if(lu!=null)setTimeout(function(){showLevelUp(lu)},250)}
$('pUnits').onclick=function(){openUnits()};
$('pClose').onclick=function(){if(!P||P.finished||(!P.i&&!P.right&&!(P.st&&P.st.tries))){closePlayer();return}askBox('Leave this lesson? Your progress in it won\'t be saved.','Leave','Keep going',function(){if(P)closePlayer()})};
$('pBtn').onclick=function(){if(P&&P.onMain)P.onMain()};
$('pSkip').onclick=function(){if(P&&P.onSkip)P.onSkip()};
document.addEventListener('keydown',function(e){if(!P||e.ctrlKey||e.metaKey||e.altKey)return;var pl=$('player');if(!pl||!pl.classList.contains('open'))return;
 var md=$('modal');if((md&&(md.classList.contains('open')||md.classList.contains('show')))||document.querySelector('.shmod')||document.querySelector('.calcsheet.open'))return;var t=e.target,tag=t&&t.tagName;
 if(e.key==='Enter'){if(e.shiftKey||e.isComposing)return;if(tag==='TEXTAREA')return;if(tag==='BUTTON'&&pl.contains(t)&&t!==$('pBtn')&&!t.classList.contains('opt'))return;if(!$('pBtn').disabled){e.preventDefault();P.onMain&&P.onMain()}return}
 if(/^[1-9]$/.test(e.key)&&!e.shiftKey){if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;var gs=[].filter.call(document.querySelectorAll('#pBody .opts'),function(g){return [].some.call(g.querySelectorAll('.opt'),function(x){return !x.disabled})}),os=gs.length?gs[0].querySelectorAll('.opt'):[],o=os[+e.key-1];if(o&&!o.disabled){e.preventDefault();o.click();try{o.focus({preventScroll:true})}catch(_){}}}});
function foot(st,head,body){$('pFoot').className='pfoot'+(st?' '+st:'');$('pFb').innerHTML=(head?'<b class="h">'+head+'</b>':'')+(body||'');if(st==='no'&&P&&P.helpDue){P.helpDue=0;try{EASE.offer()}catch(e){if(window.console)console.error(e)}}}
function mainBtn(label,fn,dis){var b=$('pBtn');b.textContent=label;b.disabled=!!dis;P.onMain=fn}
function skipBtn(fn,label){$('pSkip').style.display=fn?'':'none';$('pSkip').textContent=label||'Skip this one';P.onSkip=fn}
var PRAISE=['Correct!','Nice!','Spot on!','Exactly!','You got it!','Nailed it!'];
function praise(){return comboPraise()||PRAISE[Math.floor(Math.random()*PRAISE.length)]}
function award(n){if(n>0){P.xp+=n;addXP(n,$('pBtn'));$('pXP').textContent='+'+P.xp+' XP'}}
function nextCard(){P.i++;if(P.i>=P.cards.length)finish();else showCard()}
function showCard(){var c=P.cards[P.i];DRAWS=[];$('pBar').style.width=(P.i/P.cards.length*100)+'%';if(P.mode==='test')updTimer();else $('pXP').textContent=P.xp?'+'+P.xp+' XP':'';
 var b=$('pBody');b.innerHTML='';$('pScroll').scrollTop=0;foot('','','');skipBtn(null);P.st={tries:0};if(c)c._mcNow=false;P.hintFn=P.hintCan=null;P.rtSrc=null;$('pFoot').style.display='';
 var k=document.createElement('div');k.className='pkick';k.style.color=P.mode==='review'&&c._src?'var(--muted)':P.color;k.textContent=P.mode==='lap'?'Victory lap'+(c._src?' · '+c._src:''):P.mode==='one'?'Just one question'+(c._src?' · '+c._src:''):P.mode==='review'?(c._src||'Review'):P.mode==='test'?P.unit+' · Question '+(P.i+1)+' of '+P.cards.length:P.unit;b.appendChild(k);
 (P.mode==='test'?{Q:tQ,N:tN,O:tO,RF:function(c,b){REV.rf(c,b,true)}}:{T:rT,Q:rQ,N:rN,W:rW,O:rO,F:rF,RF:function(c,b){REV.rf(c,b,false)}})[c.t](c,b)}
function rT(c,b){var d=document.createElement('div');d.className='prose';d.innerHTML=c.h;b.appendChild(d);mainBtn('Continue',nextCard)}
function rQ(c,b){var ty=P.mode!=='test'&&!c._mcNow&&!c._auto?typeSpec(c):null;if(ty)return rTy(c,b,ty);P.asked++;var p=document.createElement('div');p.className='qprompt';p.innerHTML=c.p;b.appendChild(p);var box=document.createElement('div');box.className='opts';b.appendChild(box);
 var order=shuffle(c.o.map(function(_,i){return i})),sel=-1,lock=false,btns={};
 order.forEach(function(k){var o=document.createElement('button');o.className='opt';o.innerHTML=c.o[k];box.appendChild(o);btns[k]=o;o.onclick=function(){if(lock||o.disabled)return;sel=k;for(var j in btns)btns[j].classList.toggle('sel',+j===k);mainBtn('Check',check,false)}});
 mainBtn('Check',check,true);
 P.hintCan=function(){return !lock&&c.o.filter(function(_,i){return i!==c.a&&!btns[i].disabled}).length>=2};P.hintFn=function(){if(!P.hintCan())return '';var w=shuffle(c.o.map(function(_,i){return i}).filter(function(i){return i!==c.a&&!btns[i].disabled})),x=w.slice(1);x.forEach(function(i){btns[i].disabled=true;btns[i].classList.remove('sel');btns[i].classList.add('xout');if(sel===i)sel=-1});mainBtn('Check',check,sel<0);return 'I\'ve crossed out '+(x.length===1?'a wrong answer':x.length+' wrong answers')+'. It\'s one of the two left.'};
 function check(){if(sel<0)return;if(sel===c.a){lock=true;btns[sel].classList.remove('sel');btns[sel].classList.add('right');gotRight(c);foot('ok',praise(),c.e?'<div>'+c.e+'</div>':'');mainBtn('Continue',nextCard)}
  else{P.st.tries++;if(P.st.tries===1)gotWrong(c);btns[sel].classList.remove('sel');btns[sel].classList.add('wrong');btns[sel].disabled=true;sel=-1;
   if(P.st.tries>=2){lock=true;btns[c.a].classList.add('right');foot('no','Here\'s how it works',(c.e?'<div>'+c.e+'</div>':'')+EASE.revNote(c));mainBtn('Continue',nextCard)}
   else{foot('no',EASE.gentle(),c.hint?'<div>Hint: '+c.hint+'</div>':'<div>Have another go.</div>');mainBtn('Check',check,true)}}}}
/* ----- type the answer: questions with a number or a key word answer make you type it ----- */
var TY_BAD=/which of (these|the following)|which one|which statement|which is (true|false|correct|best|right|wrong)|which best|which (two|pair)|\bselect\b|\bchoose\b|\bpick\b|true or false|following|below|above|odd one|which describes|which explains|which sentence|which equation|which graph|which diagram|which shows|which option|which answer|which of|\bmatch\b/i;
var TY_STOP={to:1,the:1,a:1,an:1,it:1,its:1,is:1,are:1,of:1,in:1,on:1,for:1,by:1,make:1,makes:1,very:1,just:1,only:1,that:1,this:1,be:1,will:1,would:1,they:1,itself:1,effect:1,and:1,or:1,with:1};
var TY_SYN=[['increase','increases','increased','increasing','rising','growing','rise','rises','goes up','go up','grows','grow','higher','up','more','gets bigger','bigger','larger','rises up'],
 ['decrease','decreases','decreased','decreasing','falling','dropping','fall','falls','goes down','go down','drops','drop','lower','down','less','reduces','reduce','reduced','gets smaller','smaller'],
 ['doubles','double','doubled','twice','x2','times 2','2x','2 times'],['halves','halve','halved','half'],['quadruples','quadruple','x4','four times','4 times'],
 ['stays the same','same','no change','unchanged','doesnt change','does not change','constant','stays constant','nothing changes']];
function tyText(h){var d=document.createElement('div');d.innerHTML=h;return d.textContent.trim()}
function tyNorm(x){return String(x).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9.\s-]/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').trim().replace(/^(it|they|the|a|an|to|its)\s+/,'').replace(/^(the|a|an)\s+/,'')}
function tyWords(x){return tyNorm(x).split(' ').filter(function(w){return w&&!TY_STOP[w]})}
function lev(a,b){if(a===b)return 0;var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++)d[i]=[i];for(j=0;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[m][n]}
function wEq(a,b){if(a===b)return true;var st=function(w){return w.replace(/(ing|ed|es|s)$/,'')};if(st(a)===st(b)&&st(a).length>=3)return true;var L=Math.max(a.length,b.length);return L>=5&&a.charAt(0)===b.charAt(0)&&lev(a,b)<=(L>=9?2:1)}
function tyHas(input,words){var iw=tyWords(input);return words.length>0&&words.every(function(w){return iw.some(function(x){return wEq(x,w)})})}
function tyGroup(x){var n=tyNorm(x);for(var i=0;i<TY_SYN.length;i++){if(TY_SYN[i].indexOf(n)>=0)return i}return -1}
function tyGroupIn(x){var n=' '+tyNorm(x)+' ',hit=-1;for(var i=0;i<TY_SYN.length;i++){for(var j=0;j<TY_SYN[i].length;j++){if(n.indexOf(' '+TY_SYN[i][j]+' ')>=0){if(hit>=0&&hit!==i)return -2;hit=i}}}return hit}
/* like tyGroup, but forgiving: typos ("doules"), plurals and extra words still find the group */
function tyGroupF(x){var g=tyGroup(x);if(g<0)g=tyGroup(tyWords(x).join(' '));if(g<0)g=tyGroupIn(x);if(g!==-1)return g;
 var iw=tyNorm(x).split(' ').filter(Boolean),hit=-1;for(var i=0;i<TY_SYN.length;i++)for(var j=0;j<TY_SYN[i].length;j++){var pw=TY_SYN[i][j].split(' ');if(pw.every(function(w){return iw.some(function(v){return wEq(v,w)})})){if(hit>=0&&hit!==i)return -2;hit=i}}return hit}
/* the answer with its spaces and hyphens taken out, so "lightwater" and "lowlevel waste" still count */
function tyJoin(x){return tyNorm(x).replace(/\s+/g,'')}
/* "theneutron", "itdoubles", "tothecathode": peel off a leading word or two that tyNorm would have dropped */
function tyJPre(j,t){if(!t||t.length<4)return false;var q=[j],P=['they','the','its','it','an','a','to','are','is'];for(var n=0;n<3&&q.length;n++){var nx=[];q.forEach(function(x){P.forEach(function(p){if(x.indexOf(p)===0&&x.length>p.length){var y=x.slice(p.length);if(y===t)nx.ok=1;nx.push(y)}})});if(nx.ok)return true;q=nx}return false}
function tyJEq(a,b){if(!a||!b)return false;if(a===b)return true;var L=Math.max(a.length,b.length);return L>=5&&a.charAt(0)===b.charAt(0)&&lev(a,b)<=(L>=12?2:1)}
function tyNumParse(t){var m=String(t).replace(/^(about|around|roughly|approximately|approx\.?)\s+/i,'').match(/^([−\-]?\d[\d,]*(?:\.\d+)?)\s*(%|[a-zA-Zμ°Ω][a-zA-Z0-9μ°Ω\/²³·()]*(?:\s[a-zA-Z\/²³()]+)?)?$/);if(!m)return null;var v=Number(m[1].replace(/,/g,'').replace('−','-'));return isNaN(v)?null:{v:v,u:(m[2]||'').trim()}}
var TY_UNITS={'':1,'%':1,'°':1,'°c':1,'k':1,'s':1,'ms':1,'min':1,'mins':1,'minute':1,'minutes':1,'hour':1,'hours':1,'h':1,'day':1,'days':1,'year':1,'years':1,'m':1,'cm':1,'mm':1,'km':1,'m/s':1,'kg':1,'g':1,'t':1,'j':1,'kj':1,'mj':1,'gj':1,'w':1,'kw':1,'mw':1,'gw':1,'kwh':1,'mwh':1,'bar':1,'bar(a)':1,'bar(g)':1,'mpa':1,'kpa':1,'pa':1,'bq':1,'kbq':1,'sv':1,'msv':1,'μsv':1,'μsv/h':1,'msv/h':1,'mev':1,'kev':1,'ev':1,'pcm':1,'w/cm³':1,'kw/m':1,'mw/m³':1,'v':1,'a':1,'ω':1,'n':1,'hz':1,'ppm':1,'mph':1,'°c/s':1,'cm³':1,'m³':1,'m²':1,'cm²':1,'g/cm³':1,'kg/m³':1,'dm³':1,'mol':1,'l':1,'ml':1,'j/kg':1,'w/m²':1,'km/h':1,'cents':1,'cent':1};
function tyScore(iw,req){if(!req||!req.length)return Infinity;var t=0;for(var i=0;i<req.length;i++){var best=Infinity;for(var j=0;j<iw.length;j++)if(wEq(iw[j],req[i]))best=Math.min(best,lev(iw[j],req[i]));if(best===Infinity)return Infinity;t+=best}return t}
function typeSpec(c){if(c._ty!==undefined)return c._ty;c._ty=null;try{
 if(!c.o||c.o.length<2||typeof c.a!=='number')return null;var raw=c.o[c.a];if(/<su[pb]|&[a-z#0-9]+;|<img|<svg/i.test(raw))return null;
 var pt=tyText(c.p);if(TY_BAD.test(pt)||/\bNOT\b/.test(pt)||/\bnot\b/i.test(pt))return null;var ans=tyText(raw);
 var nu=tyNumParse(ans);
 if(nu&&/\bwhich\b|biggest|smallest|largest|highest|lowest|fastest|slowest|closest|best/i.test(pt))return null;
 if(nu&&!TY_UNITS[nu.u.toLowerCase().replace(/\s/g,'')])nu=null;
 if(nu){var gaps=[];c.o.forEach(function(o,i){if(i===c.a)return;var w=tyNumParse(tyText(o));if(w&&nu.v!==0)gaps.push(Math.abs(w.v-nu.v)/Math.abs(nu.v))});var about=/^(about|around|roughly|approx)/i.test(ans),tol=about?0.1:0.02;if(gaps.length)tol=Math.min(tol,0.4*Math.min.apply(null,gaps));
  if(tol<=0)return null;c._ty={k:'num',v:nu.v,tol:tol,u:nu.u,show:ans};return c._ty}
 if(!/^[A-Za-z][A-Za-z\s\-'’()]*$/.test(ans))return null;if(c.o.some(function(o){return /\b(AND|OR|NOT|XOR|NAND|NOR)\b/.test(tyText(o))}))return null;
 var main=ans.replace(/\s*\([^)]*\)/g,'').trim(),par=(ans.match(/\(([^)]*)\)/)||[])[1],n=tyNorm(main);if(!n||n.split(' ').length>3||n.length>24)return null;
 var wrong=c.o.map(function(o,i){return i===c.a?null:tyText(o).replace(/\s*\([^)]*\)/g,'').trim()}).filter(Boolean);
 var words=tyWords(main),pw=tyWords(pt),g=tyGroup(main);if(g<0&&words.length)g=tyGroup(words.join(' '));
 var wg=wrong.map(function(w){var x=tyGroup(w);if(x<0)x=tyGroup(tyWords(w).join(' '));return x});
 if(g>=0&&wg.indexOf(g)>=0)return null;
 if(g<0&&!words.length)return null;
 if(g<0&&wrong.some(function(w){return tyNorm(w)===n}))return null;
 var ww=wrong.map(tyWords),allw={};ww.forEach(function(a){a.forEach(function(x){allw[x]=1})});
 var req=words.filter(function(x){return pw.indexOf(x)<0&&!allw[x]});if(!req.length)req=words.filter(function(x){return !allw[x]});if(!req.length)req=words;
 var alt=par&&/^[A-Za-z][A-Za-z\s-]*$/.test(par)&&par.length<=20?tyWords(par):null;if(alt&&(!alt.length||alt.some(function(x){return x.length<2})))alt=null;
 var allwA=Object.keys(allw),uq=req.filter(function(x){return !allwA.some(function(y){return wEq(x,y)})});
 c._ty={k:'word',g:g,req:req,alt:alt,wrong:ww.map(function(a,i){var r=a.filter(function(x){return pw.indexOf(x)<0&&words.indexOf(x)<0});return {g:wg[i],req:r,j:tyJoin(wrong[i])}}),j:tyJoin(main),altj:alt?tyJoin(par):'',uq:uq,show:ans,first:main.replace(/^(the|a|an|to|it)\s+/i,'').charAt(0).toUpperCase(),len:main.replace(/^(the|a|an|to|it)\s+/i,'').replace(/[^A-Za-z]/g,'').length};return c._ty}catch(e){return null}}
function tyMatch(ty,input){var x=tyNorm(input);if(!x)return false;
 var j=tyJoin(input);if(ty.j&&!ty.wrong.some(function(w){return w.j&&tyJEq(j,w.j)})&&(tyJEq(j,ty.j)||tyJPre(j,ty.j)||(ty.altj&&tyJEq(j,ty.altj))))return true;
 if(ty.g>=0)return tyGroupF(input)===ty.g;
 var iw=tyWords(input);if(!iw.length)iw=x.split(' ');var sc=Math.min(tyScore(iw,ty.req),ty.alt&&ty.alt.length?tyScore(iw,ty.alt):Infinity);
 /* most of the key words is enough: "spray" for "Open the spray" (key words never appear in the wrong options) */
 if(sc===Infinity){var hit=0,t=0;(ty.uq||[]).forEach(function(r){var b=Infinity;iw.forEach(function(v){if(wEq(v,r))b=Math.min(b,lev(v,r))});if(b<Infinity){hit++;t+=b}});if(!ty.req||ty.req.length<2||hit*2<ty.req.length)return false;sc=t}
 var gi2=tyGroupF(input);return !ty.wrong.some(function(w){return (w.g>=0&&gi2===w.g)||tyScore(iw,w.req)<=sc})}
/* does the answer clearly point at one of the wrong options? */
function tyWrongHit(ty,input){var iw=tyWords(input),gi=tyGroupF(input),j=tyJoin(input);return (ty.wrong||[]).some(function(w){return (w.g>=0&&gi===w.g)||(w.req.length&&tyScore(iw,w.req)<Infinity)||(w.j&&tyJEq(j,w.j))})}
function rTy(c,b,ty){P.asked++;var p=document.createElement('div');p.className='qprompt';p.innerHTML=c.p;b.appendChild(p);
 var r=document.createElement('div');r.className='numrow';r.innerHTML='<input class="'+(ty.k==='num'?'numin tyin" inputmode="decimal"':'tyin tyw"')+' autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type your answer"><span class="numunit"></span>';b.appendChild(r);var inp=r.querySelector('input');if(ty.k==='num')r.querySelector('.numunit').textContent=ty.u||'';
 var sm=document.createElement('p');sm.className='small';sm.innerHTML='<span class="tybadge">Type it</span> No options this time. '+(ty.k==='num'?'Type the number.':'A word or short phrase is fine, and small typos are OK.')+' <button type="button" class="ghost tymc">Show me options</button>';b.appendChild(sm);
 inp.oninput=function(){mainBtn('Check',check,inp.value.trim()==='');if(!$('pFoot').classList.contains('ok'))foot('','','')};inp.onkeydown=function(e){if(e.key==='Enter'&&inp.value.trim()&&!inp.disabled){e.preventDefault();e.stopPropagation();check()}};
 mainBtn('Check',check,true);setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){}},50);
 P.hintCan=function(){return !inp.disabled};P.hintFn=function(){if(!P.hintCan())return '';return ty.k==='num'?(c.hint||'Work it out step by step, then type just the number.'):'It starts with '+ty.first+' and has '+ty.len+' letters.'};
 sm.querySelector('.tymc').onclick=function(){toMC(false)};
 function toMC(wrong){while(b.children.length>1)b.removeChild(b.lastChild);P.asked--;c._mcNow=true;P.hintFn=P.hintCan=null;foot('','','');rQ(c,b);if(wrong)foot('no',EASE.gentle(),'<div>Not quite. Here are some options: pick the right one.</div>')}
 function check(){if(inp.disabled)return;var v=inp.value.trim(),ok;
  if(ty.k==='num'){var x=parseNum(v.replace(/[a-zA-Zμ°Ω\/²³()\s]+$/,''));if(isNaN(x)){foot('no','That isn\'t a number','<div>Type just the number, like 13 or 0.25.</div>');return}ok=Math.abs(x-ty.v)<=Math.abs(ty.v)*(ty.tol+1e-9)}
  else ok=tyMatch(ty,v);
  if(!ok&&ty.k==='word'&&!tyWrongHit(ty,v)){ask(v);return}
  if(ok){inp.disabled=true;inp.style.borderColor='var(--good-line)';gotRight(c);var bon=!P.st.tries?5:0;if(bon)award(bon);foot('ok',praise()+(bon?' +5 XP for typing it':''),(tyNorm(v)!==tyNorm(ty.show)?'<div>The answer: <b>'+ty.show+'</b></div>':'')+(c.e?'<div>'+c.e+'</div>':''));mainBtn('Continue',nextCard)}
  else{P.st.tries++;if(P.st.tries===1)gotWrong(c);toMC(true)}}
 /* an answer the checker doesn't recognise (and isn't one of the wrong options): show the answer and let you say if you meant it */
 function ask(v){inp.disabled=true;mainBtn('Check',check,true);
  foot('no','Not sure about that one','<div>You typed <b>'+String(v).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})+'</b>. The answer was <b>'+ty.show+'</b>. Is that what you meant?</div><div class="tyask"><button type="button" class="wbtn pri" id="tyYes">Yes, I meant that</button><button type="button" class="wbtn" id="tyNo">No, I was wrong</button></div>');
  $('tyYes').onclick=function(){inp.style.borderColor='var(--good-line)';gotRight(c);foot('ok','Counted as right',(c.e?'<div>'+c.e+'</div>':''));mainBtn('Continue',nextCard)};
  $('tyNo').onclick=function(){P.st.tries++;if(P.st.tries===1)gotWrong(c);inp.disabled=false;toMC(true)};
  setTimeout(function(){try{$('tyYes').focus({preventScroll:true})}catch(e){}},30)}}
function parseNum(s){s=String(s).trim().replace(/[−–]/g,'-').replace(/,/g,'').replace(/\s/g,'').replace(/%$/,'');s=s.replace(/[x×*]10\^?/i,'e').replace(/\^/,'');if(s===''||s==='-')return NaN;return Number(s)}
function fmtAns(a){var x=Math.abs(a);if(x!==0&&(x>=1e6||x<1e-3))return a.toExponential(2).replace('e+',' × 10^').replace('e-',' × 10^-').replace(/\^(-?\d+)/,'<sup>$1</sup>').replace('-','−');return String(+a.toPrecision(4)).replace('-','−')}
function rN(c,b){P.asked++;var p=document.createElement('div');p.className='qprompt';p.innerHTML=c.p;b.appendChild(p);var r=document.createElement('div');r.className='numrow';r.innerHTML='<input class="numin" inputmode="decimal" autocomplete="off" placeholder="Your answer"><span class="numunit">'+(c.u||'')+'</span>';b.appendChild(r);var inp=r.querySelector('input');
 var sm=document.createElement('p');sm.className='small';sm.textContent='Type a number. You can write powers of ten like 3e-5 or 3×10^-5.';b.appendChild(sm);
 inp.oninput=function(){mainBtn('Check',check,inp.value.trim()==='');if(!$('pFoot').classList.contains('ok'))foot('','','')};mainBtn('Check',check,true);setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){}},50);P.hintCan=function(){return !inp.disabled&&!!c.e};P.hintFn=function(){return P.hintCan()?'Here\'s the method: '+EASE.maskAns(c.e,c.a):''};
 function check(){var v=parseNum(inp.value);if(isNaN(v)){foot('no','That isn\'t a number','<div>Try something like 0.25, 420 or 3e-5.</div>');return}
  var tol=c.tol==null?0.02:c.tol,ok=c.a===0?Math.abs(v)<=(tol||1e-9):Math.abs(v-c.a)<=Math.abs(c.a)*(tol+1e-9);
  if(ok){inp.disabled=true;inp.style.borderColor='var(--good-line)';gotRight(c);foot('ok',praise(),c.e?'<div>'+c.e+'</div>':'');mainBtn('Continue',nextCard)}
  else{P.st.tries++;if(P.st.tries===1)gotWrong(c);inp.style.borderColor='var(--amber)';if(P.st.tries>=2){inp.disabled=true;foot('no','The answer is '+fmtAns(c.a)+(c.u?' '+c.u:''),(c.e?'<div>'+c.e+'</div>':'')+EASE.revNote(c));mainBtn('Continue',nextCard);if(typeof rescueOffer==='function')rescueOffer(c)}else{var hint=numSlip(v,c.a)||(Math.abs(v)>0&&Math.abs(c.a)>0&&Math.abs(Math.log10(Math.abs(v/c.a))-Math.round(Math.log10(Math.abs(v/c.a))))<0.02&&Math.round(Math.log10(Math.abs(v/c.a)))!==0?'Check your powers of ten.':(c.hint||'Check your working and try again.'));foot('no',EASE.gentle(),'<div>'+hint+'</div>');mainBtn('Check',check,false)}}}}
function rW(c,b){if(c.p){var p=document.createElement('div');p.className='qprompt';p.style.fontSize='18px';p.innerHTML=c.p;b.appendChild(p)}var box=document.createElement('div');box.className='w';b.appendChild(box);
 var inst=null;try{inst=WIDGETS[c.w](box,c.par,{color:P.color})||{}}catch(e){box.innerHTML='<p class="small">This interactive couldn\'t load ('+e.message+').</p>';inst={};if(window.console)console.error(e)}
 if(inst.check){P.asked++;mainBtn('Check',check,false)}else{mainBtn('Continue',nextCard)}
 function check(){var r=inst.check()||{};if(r.ok){if(inst.lock)inst.lock();gotRight(c);foot('ok',r.head||praise(),(r.msg?'<div>'+r.msg+'</div>':'')+(c.e?'<div>'+c.e+'</div>':''));mainBtn('Continue',nextCard);skipBtn(null)}
  else if(r.soft){P.st.soft=(P.st.soft||0)+1;foot('no',r.head||'Not yet','<div>'+(r.msg||'Keep experimenting.')+'</div>');if(P.st.soft>=2)skipBtn(function(){foot('','','');skipBtn(null);P.asked=Math.max(0,P.asked-1);nextCard()},'Skip the challenge')}else{P.st.tries++;if(P.st.tries===1)gotWrong(c);foot('no',r.head||'Not yet','<div>'+(r.msg||'Keep experimenting.')+'</div>');if(P.st.tries>=2)skipBtn(function(){foot('','','');skipBtn(null);nextCard()})}}}
function rO(c,b){P.asked++;var p=document.createElement('div');p.className='qprompt';p.innerHTML=c.p;b.appendChild(p);var sm=document.createElement('p');sm.className='small';sm.textContent='Use the arrows to put these in the right order (first at the top).';b.appendChild(sm);
 var ul=document.createElement('ol');ul.className='ord';b.appendChild(ul);var ord=c.items.map(function(_,i){return i});do{ord=shuffle(ord)}while(ord.every(function(v,i){return v===i})&&ord.length>1);var lock=false;
 function draw(){ul.innerHTML='';ord.forEach(function(k,i){var li=document.createElement('li');li.innerHTML='<span class="n">'+(i+1)+'</span><span class="t">'+c.items[k]+'</span><span class="mv"><button aria-label="Move up">▲</button><button aria-label="Move down">▼</button></span>';var bs=li.querySelectorAll('button');
  bs[0].onclick=function(){if(lock||i===0)return;var t=ord[i-1];ord[i-1]=ord[i];ord[i]=t;draw()};bs[1].onclick=function(){if(lock||i===ord.length-1)return;var t=ord[i+1];ord[i+1]=ord[i];ord[i]=t;draw()};ul.appendChild(li)})}
 draw();mainBtn('Check',check,false);
 P.hintCan=function(){return !lock&&ord.some(function(v,i){return v!==i})};P.hintFn=function(){if(!P.hintCan())return '';var k=0;while(ord[k]===k)k++;var p=ord.indexOf(k);ord.splice(p,1);ord.splice(k,0,k);draw();mark();return 'One more is now in the right place (shown in green).'};
 function mark(){[].forEach.call(ul.children,function(li,i){li.classList.toggle('ok',ord[i]===i)})}
 function check(){var ok=ord.every(function(v,i){return v===i});if(ok){lock=true;mark();gotRight(c);foot('ok',praise(),c.e?'<div>'+c.e+'</div>':'');mainBtn('Continue',nextCard)}
  else{P.st.tries++;if(P.st.tries===1)gotWrong(c);mark();var n=ord.filter(function(v,i){return v===i}).length;if(P.st.tries>=3){lock=true;ord=c.items.map(function(_,i){return i});draw();mark();foot('no','Here\'s the right order',(c.e?'<div>'+c.e+'</div>':'')+EASE.revNote(c));mainBtn('Continue',nextCard)}else foot('no',EASE.gentle(),'<div>'+n+' of '+ord.length+' are in the right place (shown in green).</div>')}}}
function bonusXP(n){P.xp+=n;addXP(n)}
function finish(){if(P.rev&&P.mode==='review')return REV.endPractice();if(P.mode==='lap')return HIGH.finish();if(P.mode==='one')return ONE.finish();if(P.mode==='test')return finishTest();if(P.mode==='follow')return finishFollow();P.finished=true;lcount();P.quiet=true;$('pBar').style.width='100%';var b=$('pBody'),acc=P.asked?Math.round(P.right/P.asked*100):100,perfect=P.asked>0&&P.mistakes===0,lines=[],first=false,unitDone=false,h0=homesNow(),ui=P.ui;
 lines.push(['Answers',P.xp-P.cbonus]);if(P.cbonus)lines.push(['Combo bonus',P.cbonus]);
 if(P.mode==='lesson'){var u=UNITS[ui],id=u.lessons[P.li].id;first=!S.done[id];S.done[id]=1;if(first){JUST_BUILT=ui;unitDone=u.lessons.every(function(l){return S.done[l.id]})}save();
  var cb=first?20:5;lines.push([first?'Lesson complete':'Lesson replayed',cb]);bonusXP(cb);if(perfect){S.st.perfect++;lines.push(['Perfect lesson',10]);bonusXP(10)}
  qProg('lessons',1);if(perfect)qProg('perfect',1);
  var qa=P.cards.filter(function(c){return c.t==='Q'||c.t==='N'||c.t==='O'}).length,qr=P.qr||0,qacc=qa?Math.round(qr/qa*100):acc;
  if(FOLLOW[id]){var fr=S.fu[id]||{};fr.last=qacc;if(qa>0&&qacc<=PASS_FU)fr.need=true;S.fu[id]=fr;save()}if(P.asked>=3)EASE.record(trk(ui),lvOf(ui),acc)}
 else{S.st.reviews++;lines.push(['Review complete',10]);bonusXP(10);if(perfect){lines.push(['Perfect review',5]);bonusXP(5)}qProg('review',1)}
 save();checkBadges(true);
 var h='<div class="done-screen"><div class="dicon">'+(perfect?'<svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="45" fill="#fdf0d5"/><path d="m48 16 9 19 21 2.4-15.6 14.3 4.4 20.6L48 61.7 30.2 72.3l4.4-20.6L19 37.4 40 35z" fill="#EF9F27"/></svg>':'<svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="var(--good-bg)"/><path d="M27 46l12 12 24-26" stroke="var(--good-line)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')+'</div>'+
  '<h2>'+(perfect?(P.mode==='lesson'?'Perfect lesson!':'Perfect review!'):(P.mode==='lesson'?(fuNeed(UNITS[ui].lessons[P.li].id)?'Lesson finished':'Lesson complete!'):'Review complete!'))+'</h2><p class="note" style="font-size:16px">'+(P.mode==='lesson'?P.title:(P.fixed?'You fixed '+P.fixed+' mistake'+(P.fixed===1?'':'s')+'.':'Coming back to old topics is how they stick.'))+'</p>'+
  '<div class="done-stats"><div class="dstat"><b id="dsXP">+0</b><span>XP earned</span></div><div class="dstat"><b>'+acc+'%</b><span>right first time</span></div><div class="dstat"><b>'+P.best+'</b><span>best combo</span></div></div>'+
  '<div class="xpbreak">'+lines.map(function(l){return '<div><span>'+l[0]+'</span><b>+'+l[1]+'</b></div>'}).join('')+'</div>';
 if(P.mode==='lesson'&&first&&(lvOf(ui)>1||trk(ui)!=='maths')){var x2=unitFrac(ui),u2=UNITS[ui];h+='<div class="dblock'+(unitDone?' qual':'')+'" style="--c:'+u2.color+'">'+(unitDone?'<div class="qualbadge" style="background:'+u2.color+'">'+u2.icon+'</div><div class="dbt">'+uLabel(ui)+' complete. You\'re qualified in '+u2.title+'!</div>':'<div class="dbt">'+uLabel(ui)+': '+x2.d+'/'+x2.n+' lessons</div><div class="stbar"><div style="width:'+x2.f*100+'%;background:'+u2.color+'"></div></div>')+goalNote(ui)+'</div>'}
 else if(P.mode==='lesson'&&first){var x=unitFrac(ui),uu=UNITS[ui],h1=homesNow();
  h+='<div class="dblock'+(unitDone?' qual':'')+'" style="--c:'+uu.color+'">'+(unitDone?'<div class="qualbadge" style="background:'+uu.color+'">'+uu.icon+'</div><div class="dbt">'+uLabel(ui)+' complete. You\'re qualified in '+uu.title+'!</div><p class="note">The '+COMP[compOf(ui)].toLowerCase()+' '+(COMP[compOf(ui)].slice(-1)==='s'?'are':'is')+' finished on your power station.</p>':'<div class="dbt">'+COMP[compOf(ui)]+': '+x.d+'/'+x.n+' built</div><div class="stbar"><div style="width:'+x.f*100+'%;background:'+uu.color+'"></div></div>')+
   '<p class="homesline">Your station now powers <b id="dsHomes">'+fmtInt(h0)+'</b> homes <span class="plus">+'+fmtInt(h1-h0)+'</span></p></div>'}
 var fid=P.mode==='lesson'?UNITS[ui].lessons[P.li].id:null,fneed=fid&&fuNeed(fid);
 if(fneed)h+='<div class="dblock fuwarn"><div class="dbt">Follow-up needed</div><p class="note">You got '+qr+' of '+qa+' questions right first time. Do a short recap and 5 questions on this topic, and score more than 50% to unlock new lessons.</p></div>';
 else if(fid&&FOLLOW[fid])h+='<div class="dblock fuopt"><div><div class="dbt">Want more practice?</div><p class="note">5 extra questions on this lesson. It\'s optional.</p></div><button class="ghost sm" id="fuGo">Extra practice</button></div>';
 if(P.mode==='lesson')h+=EASE.endBlock(ui,acc,P.right,P.asked,'lesson',!!fneed);
 h+='<div class="dblock"><div class="dbt">Daily quests</div>'+questsHTML(true)+(P.chestNow?'<div class="quest chest done"><span class="qi">'+CHEST+'</span><div class="qb"><div class="qt">Daily chest opened: +30 XP'+(P.chestNow===2?' and a streak freeze':'')+'</div></div></div>':'')+'</div>';
 if(P.newBadges.length)h+='<div class="dblock"><div class="dbt">Badges earned</div><div class="newbs">'+P.newBadges.map(function(bd){return '<span class="nbchip"><span class="tb" style="background:'+bd.col+'">'+bd.ic+'</span>'+bd.name+'</span>'}).join('')+'</div></div>';
 b.innerHTML=h+'</div>';$('pScroll').scrollTop=0;$('pXP').textContent='+'+P.xp+' XP';if($('fuGo'))$('fuGo').onclick=function(){closePlayer();startFollow(fid)};
 countUp($('dsXP'),0,P.xp,'+');if($('dsHomes'))countUp($('dsHomes'),h0,homesNow(),'');
 foot('','','');skipBtn(null);
 if(P.mode==='lesson'){var a=fneed?{t:'follow',id:fid,ui:ui,li:P.li}:nextAction();$('pFb').innerHTML=fneed?'<span class="note"><b>Follow-up required</b> to unlock new lessons.</span>':actionFoot(a);mainBtn(actionLabel(a),goAction(a));
  if(a&&a.t==='test'){var nl2=nextLesson();if(nl2)skipBtn(goAction({t:'lesson',ui:nl2[0],li:nl2[1]}),'Next lesson')}}
 else mainBtn('Done',closePlayer);
 sfx('done');confetti();
 if(P.levelUp!=null){var lu=P.levelUp;P.levelUp=null;setTimeout(function(){showLevelUp(lu)},1100)}}
function countUp(e,a,b,pre){if(!e)return;var t0=performance.now(),d=900;function f(t){var u=Math.min(1,(t-t0)/d),v=a+(b-a)*(1-Math.pow(1-u,3));e.textContent=pre+fmtInt(v);if(u<1&&e.isConnected)requestAnimationFrame(f)}requestAnimationFrame(f)}
function lookFx(){try{return (S.rw&&S.rw.look&&S.rw.look.fx&&S.rw.unl&&(S.rw.look.fx==='confetti'||S.rw.unl['fx-'+S.rw.look.fx]))?S.rw.look.fx:'confetti'}catch(_){return 'confetti'}}
function confetti(){var fx=lookFx(),round=fx==='glow'||fx==='atoms',cols=fx==='glow'?['#5ec8ff','#9fe4ff','#3aa0ff','#c9f1ff','#7fd3ff','#2f7bd1']:fx==='gold'?['#f5c542','#e0a526','#ffd96b','#c98a12','#fff1b3','#b8860b']:fx==='atoms'?['#D85A30','#378ADD','#7F77DD','#1D9E75','#EF9F27','#D4537E']:['#7F77DD','#1D9E75','#D85A30','#EF9F27','#378ADD','#D4537E'];for(var i=0;i<40;i++){var d=document.createElement('div');d.style.cssText='position:fixed;z-index:90;width:'+(round?(fx==='glow'?6:9):8)+'px;height:'+(round?(fx==='glow'?6:9):12)+'px;border-radius:'+(round?'50%':'2px')+';pointer-events:none;left:'+(50+(Math.random()-0.5)*30)+'%;top:30%;background:'+cols[i%6]+(fx==='glow'?';box-shadow:0 0 8px 2px '+cols[i%6]:'');document.body.appendChild(d);(function(d){var vx=(Math.random()-0.5)*14,vy=-6-Math.random()*8,x=0,y=0,r=0,t=0;function f(){t++;vy+=0.4;x+=vx;y+=vy;r+=8;d.style.transform='translate('+x+'px,'+y+'px) rotate('+r+'deg)';d.style.opacity=1-t/90;if(t<90)requestAnimationFrame(f);else d.remove()}requestAnimationFrame(f)})(d)}}

