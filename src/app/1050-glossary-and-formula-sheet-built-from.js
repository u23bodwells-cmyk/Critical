/* ===== Glossary and formula sheet (built from the lessons you've done) ===== */
var TL_EXTRA=[];
function tlEsc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function tlUnits(m){var o=[];UNITS.forEach(function(u,ui){if(trk(ui)===m)o.push(ui)});o.sort(function(a,b){return ((UNITS[a].level||1)-(UNITS[b].level||1))||a-b});return o}
function tlName(m){return {qm:'Quantum',calc:'Calculus',theory:'Theory',maths:'Nuclear maths'}[m]||'this subject'}
var tlEl=null;
function tlClose(){if(tlEl){tlEl.remove();tlEl=null}document.body.classList.remove('noscroll','tlprint')}
function tlOpen(title,body){tlClose();tlEl=document.createElement('div');tlEl.className='tlov';tlEl.setAttribute('role','dialog');tlEl.setAttribute('aria-label',title);
 tlEl.innerHTML='<div class="tlw"><div class="tlbar"><button type="button" class="wbtn tlx">← Back</button><b>'+tlEsc(title)+'</b><span></span></div><div class="tlbody"></div></div>';
 tlEl.querySelector('.tlx').onclick=tlClose;document.body.appendChild(tlEl);document.body.classList.add('noscroll');body(tlEl.querySelector('.tlbody'),tlEl.querySelector('.tlbar span'));return tlEl}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&tlEl)tlClose()});
function tlGloss(m){var G=glossBuild(),all=[];for(var k in G){var g=G[k];if(trk(g.ui)!==m)continue;var l=UNITS[g.ui].lessons[g.li];all.push({g:g,met:!!S.done[l.id]})}
 all.sort(function(a,b){return a.g.t.toLowerCase()<b.g.t.toLowerCase()?-1:1});
 tlOpen('📖 '+tlName(m)+' glossary',function(B){var met=all.filter(function(x){return x.met}).length;
  B.innerHTML='<p class="tlnote">'+met+' of '+all.length+' key words met so far. Each one is explained in the words of the lesson it came from.</p><input type="search" class="tlq" placeholder="Search a word…" aria-label="Search the glossary"><label class="tlck"><input type="checkbox"> Show words from lessons you haven\'t done yet</label><div class="tllist"></div>';
  var q=B.querySelector('.tlq'),ck=B.querySelector('.tlck input'),L=B.querySelector('.tllist');
  function draw(){var s=q.value.trim().toLowerCase(),rows=all.filter(function(x){return (x.met||ck.checked)&&(!s||x.g.t.toLowerCase().indexOf(s)>=0||x.g.d.toLowerCase().indexOf(s)>=0)});
   if(!rows.length){L.innerHTML='<p class="tlnote">'+(met||ck.checked?'Nothing matches that.':'Finish a '+tlName(m)+' lesson and its key words appear here.')+'</p>';return}
   var last='';L.innerHTML=rows.map(function(x){var f=x.g.t.charAt(0).toUpperCase(),h='';if(f!==last&&!s){h+='<div class="tlletter">'+tlEsc(f)+'</div>';last=f}
    return h+'<div class="tlitem'+(x.met?'':' tlnew')+'"><b>'+tlEsc(x.g.t)+'</b>'+(x.met?'':' <span class="tltag">not met yet</span>')+'<p>'+tlEsc(x.g.d)+'</p><span class="tlsrc">From: '+tlEsc(UNITS[x.g.ui].title)+' · '+tlEsc(x.g.lt)+'</span></div>'}).join('')}
  q.oninput=draw;ck.onchange=draw;draw()})}
function tlSheet(m){var mem={};try{mem=fxMem().eqs||{}}catch(e){}
 tlOpen('🧾 '+tlName(m)+' formula sheet',function(B,bar){var html='',n=0,ln=0,got=0;
  tlUnits(m).forEach(function(ui){var u=UNITS[ui],part='';u.lessons.forEach(function(l){if(!S.done[l.id]){ln++;return}var eqs=[];try{eqs=fxLessonEqs(l,ui)}catch(e){}
    eqs.forEach(function(q){var key=l.id+'#'+q.ci+'@'+q.k,e=mem[key],st=e&&e.b>=1?'<span class="tlok">✓ learnt</span>':e?'<span class="tlpr">🔁 practising</span>':'';if(e&&e.b>=1)got++;
     var syms={};(q.an.idx&&q.an.idx.list||[]).forEach(function(a){syms[fxNorm(fxBase(a.h))]=1});var seen={},keys=[];
     q.rows.forEach(function(r){var s=fxNorm(fxBase(r.h));if(syms[s]&&!seen[s]&&keys.length<7){seen[s]=1;keys.push('<div class="tlkr"><span class="tlks">'+r.h+'</span><span>'+r.m+(r.u?' <i>('+r.u+')</i>':'')+'</span></div>')}});
     part+='<div class="tlf"><div class="tlfh"><span>'+tlEsc(l.title)+'</span>'+st+'</div><div class="eq" data-fx="1">'+fxR(q.an.tree)+'</div>'+(keys.length?'<div class="tlkey">'+keys.join('')+'</div>':'')+'</div>';n++})});
   if(part)html+='<h3 class="tlu">'+tlEsc(u.icon||'')+' '+tlEsc(u.title)+(u.level?' <small>Level '+u.level+'</small>':'')+'</h3>'+part});
  B.innerHTML='<p class="tlnote">'+(n?n+' formula'+(n===1?'':'s')+' from the lessons you\'ve done'+(got?', '+got+' learnt off by heart in Equations to remember':'')+'.':'No formulas yet.')+(ln?' More appear here as you finish lessons.':'')+'</p>'+(html||'<p class="tlnote">Finish a '+tlName(m)+' lesson with an equation in it and it goes on your sheet.</p>');
  if(n){var pb=document.createElement('button');pb.type='button';pb.className='wbtn';pb.textContent='🖨 Print';pb.onclick=function(){document.body.classList.add('tlprint');setTimeout(function(){window.print();document.body.classList.remove('tlprint')},50)};bar.appendChild(pb)}})}
var renderLearn_tl=renderLearn;renderLearn=function(){var out=renderLearn_tl.apply(this,arguments);try{var m=curMode(),pg=$('page-learn');if(!pg||!/^(qm|calc|theory|maths)$/.test(m))return out;var old=pg.querySelector('.tlrow');if(old)old.remove();
  var row=document.createElement('div');row.className='tlrow';var bs=[['📖','Glossary',function(){tlGloss(m)}],['🧾','Formula sheet',function(){tlSheet(m)}]];TL_EXTRA.forEach(function(f){var b=f(m);if(b)bs.push(b)});
  bs.forEach(function(b){var x=document.createElement('button');x.type='button';x.className='tlbtn';x.innerHTML='<span>'+b[0]+'</span>'+tlEsc(b[1]);x.onclick=b[2];row.appendChild(x)});
  var ug=pg.querySelector('.units');if(ug)ug.parentNode.insertBefore(row,ug);else pg.appendChild(row)}catch(e){if(window.console)console.error(e)}return out};
(function(){var st=document.createElement('style');st.textContent=
 '.tlrow{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 12px}.tlbtn{flex:1 1 0;min-width:100px;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}.tlbtn span{font-size:17px}.tlbtn:active{transform:scale(.97)}'+
 '.tlov{position:fixed;inset:0;z-index:3300;overflow:auto;background:var(--bg);color:var(--text);padding:max(14px,env(safe-area-inset-top)) 16px max(28px,env(safe-area-inset-bottom))}.tlw{max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:10px}.tlbar{display:flex;align-items:center;gap:10px;position:sticky;top:0;background:var(--bg);padding:4px 0 8px;z-index:2}.tlbar b{flex:1;font-size:17px}.tlbar span{display:flex;gap:6px}'+
 '.tlnote{margin:0;color:var(--muted);font-size:14px;line-height:1.5}.tlq{font:inherit;font-size:15px;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);width:100%;box-sizing:border-box}.tlck{display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--muted)}'+
 '.tllist{display:flex;flex-direction:column;gap:8px}.tlletter{font-weight:900;font-size:13px;color:var(--muted);margin-top:6px;letter-spacing:.06em}.tlitem{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px}.tlitem p{margin:4px 0;font-size:14.5px;line-height:1.5}.tlitem.tlnew{opacity:.75}.tltag{font-size:11px;font-weight:800;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:1px 5px}.tlsrc{font-size:12px;color:var(--muted)}'+
 '.tlu{margin:14px 0 2px;font-size:16px}.tlu small{color:var(--muted);font-weight:700;font-size:12px}.tlf{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;break-inside:avoid}.tlfh{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--muted);font-weight:700}.tlf .eq{margin:8px 0;overflow-x:auto}.tlok{color:var(--good);white-space:nowrap}.tlpr{color:#c98a12;white-space:nowrap}'+
 '.tlkey{display:flex;flex-direction:column;gap:3px;font-size:13px;border-top:1px dashed var(--line);padding-top:6px}.tlkr{display:flex;gap:10px}.tlks{min-width:44px;font-weight:800;font-family:"Cambria Math","STIX Two Math",serif}'+
 '@media print{body.tlprint>*:not(.tlov){display:none!important}body.tlprint .tlov{position:static;overflow:visible;padding:0;background:#fff;color:#000}body.tlprint .tlbar{display:none}body.tlprint .tlf{border:1px solid #999}}';
 document.head.appendChild(st)})();

