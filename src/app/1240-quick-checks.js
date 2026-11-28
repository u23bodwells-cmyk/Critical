/* ---------- quick checks: a teach card that nothing asks about gets a fill-the-gap question straight after it ----------
   built when the lesson is played (the lesson itself is untouched, and every original card keeps its usual key),
   from the card's own key terms in bold, with other key terms from the same unit as the wrong options */
var QC_SKIP=/key points|summary|in short|recap|remember|well done|what'?s next|coming up|you'?ve just|the plan|why this matters|exam technique/i;
function qcTerms(h){var d=document.createElement('div');d.innerHTML=h;return [].map.call(d.querySelectorAll('b,strong'),function(b){return qcClean(b.textContent)}).filter(qcOk)}
function qcClean(t){return String(t||'').replace(/\s+/g,' ').replace(/^[\s:;,.(]+|[\s:;,.)]+$/g,'').trim()}
function qcOk(t){return t.length>=3&&t.length<=32&&!/[=<>÷×+()\[\]\/]/.test(t)&&/[a-z]/i.test(t)&&t.split(' ').length<=4}
function qcEsc(t){return String(t).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}
function qcNum(t){return /\d/.test(t)}
function qcCls(x){var w=x.toLowerCase().split(' ').pop();return /ing$/.test(w)?'ing':/ed$/.test(w)?'ed':/ly$/.test(w)?'ly':/(er|est)$/.test(w)&&w.length>4?'er':/[^su]s$/.test(w)?'s':'o'}
function qcCase(x,up){if(/[A-Z].*[A-Z]/.test(x)||/^[A-Z]{2}/.test(x))return x;return up?x.charAt(0).toUpperCase()+x.slice(1):x.charAt(0).toLowerCase()+x.slice(1)}
function qcBuild(c,pool,avoid){var d=document.createElement('div');d.innerHTML=c.h;var hs=[].slice.call(d.querySelectorAll('b,strong'));
 for(var i=0;i<hs.length;i++){var term=qcClean(hs[i].textContent);if(!qcOk(term)||(avoid&&avoid[term]))continue;
  var blk=hs[i].closest('p,li,td,div.kn')||d,txt=blk.textContent.replace(/\s+/g,' ').trim(),ss=txt.replace(/([.!?])\s+(?=[A-Z0-9"“(])/g,'$1\u0001').split('\u0001'),sen=null;
  for(var j=0;j<ss.length;j++){if(ss[j].indexOf(term)>=0){sen=ss[j].trim();break}}
  if(!sen||sen.length<30||sen.length>200||!/^[A-Z0-9"“]/.test(sen)||!/[.!?"”]$/.test(sen))continue;
  var lo=sen.toLowerCase(),tl=term.toLowerCase();if(lo.split(tl).length!==2)continue;
  var at=sen.indexOf(term),bef=sen.slice(0,at),aft=sen.slice(at+term.length);if(/^\s*\(/.test(aft)||/\(\s*$/.test(bef))continue;
  if((bef+' '+aft).replace(/[^A-Za-z ]/g,' ').trim().split(/\s+/).filter(function(w){return w.length>1}).length<5)continue;
  var start=at===0,low=!start&&/^[a-z]/.test(term),nw=term.split(' ').length,seen={},cand=[];
  pool.forEach(function(x){var xl=x.t.toLowerCase();if(seen[xl]||xl===tl||lo.indexOf(xl)>=0||xl.indexOf(tl)>=0||tl.indexOf(xl)>=0)return;if(qcNum(x.t)!==qcNum(term)||x.t.split(' ').length!==nw||qcCls(x.t)!==qcCls(term))return;var r=x.t.length/term.length;if(r<0.45||r>2.2)return;seen[xl]=1;cand.push({t:x.t,s:(x.same?3:0)-Math.abs(x.t.length-term.length)/6})});
  cand.sort(function(a,b){return b.s-a.s||(a.t<b.t?-1:a.t>b.t?1:0)});if(cand.length<2)continue;
  var ds=cand.slice(0,3).map(function(x){return start?qcCase(x.t,true):x.t});
  return {t:'Q',_auto:1,_term:term,p:'<div class="qckick">✏️ Quick check</div>Fill the gap:<div class="qcsen">'+qcEsc(bef)+'<span class="qcgap">______</span>'+qcEsc(aft)+'</div>',o:[qcEsc(term)].concat(ds.map(qcEsc)),a:0,e:qcEsc(bef)+'<b>'+qcEsc(term)+'</b>'+qcEsc(aft)}}
 return null}
function qcAsks(c){return c&&c.t!=='T'}
function qcText(h){var d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim()}
function playCards(l){if(l._play)return l._play;var cs=l.cards,out=[{t:'S'}],pool=qcPool(l),nx=0;
 /* predict first: the first multiple-choice question that comes after some teaching, asked as a guess up front */
 var pi=-1;for(var i=2;i<cs.length;i++){if(cs[i].t==='Q'&&cs[i].o&&typeof cs[i].a==='number'&&!/fromb|from earlier|remember/i.test(cs[i].p||'')&&cs.slice(0,i).some(function(c){return c.t==='T'})){pi=i;break}}
 if(pi>=2&&cs.length>=5){var pq=Object.assign({},cs[pi]);pq._pre=1;pq._auto=1;pq._key=null;pq._src0=cs[pi]._key||l.id+'#'+pi;out.push(pq)}
 cs.forEach(function(c,ci){var cc=Object.assign({},c);if(!cc._key)cc._key=l.id+'#'+ci;out.push(cc);
  if(c.t!=='T'||ci===cs.length-1||/class="fromb"/.test(c.h||''))return;var nxc=cs[ci+1];if(qcAsks(nxc))return;var hq=typeof HANDQ!=='undefined'&&HANDQ[l.id+'#'+ci];if(hq){var hc=Object.assign({},hq);hc._auto=1;hc._key=null;out.push(hc);return}var hd=(c.h||'').match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);if(hd&&QC_SKIP.test(hd[1]))return;
  var q=null;try{q=qcBuild(c,pool)}catch(e){}if(q){q._key=null;out.push(q);return}
  /* no gap to fill? then a few explain-it-back cards break up the reading */
  if(nx<2&&qcText(c.h||'').length>=180){out.push({t:'X',h:c.h,_auto:1});nx++}});
 out.push({t:'Z'});l._play=out;return out}
