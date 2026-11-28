/* ===== On the go: no-maths lessons you can pick and do anywhere (optional, doesn't affect the plan) ===== */
var GO_SUBS=[['theory','⚛️','Nuclear theory'],['qm','🌊','Quantum physics'],['gp','🔭','GCSE Physics'],['gc','🧪','GCSE Chemistry'],['gcs','💻','GCSE Computer Science'],['ap','🚀','A-level Physics',1],['ac','⚗️','A-level Chemistry',1]];
var GO_W={matchPairs:1,sortIt:1,flipCards:1,tapLabels:1,journey:1};
var GO_MATHQ=/calculat|work out|how (much|many|far|long)|what is the (value|energy|speed|wavelength|frequency|mass|power|current|resistance)|\d\s*[×x]\s*10|=\s*\?|to \d+ (s\.f|d\.p)|significant figures|rearrange/i;
function goMathy(arr){var n=arr.filter(function(o){return /\d/.test(symTxt(String(o)))}).length;return n*2>arr.length}
function goStrip(h){var d=document.createElement('div');d.innerHTML=h;[].forEach.call(d.querySelectorAll('.eq,.key,.fx,.krow,table.calc,.worked'),function(x){x.remove()});
 [].forEach.call(d.querySelectorAll('p,li'),function(x){var t=x.textContent;if(!/=/.test(t))return;if((t.match(/[=×÷√²³⁻]/g)||[]).length>=3&&t.length<80){x.remove();return}
  var ss=t.split(/(?<=[.;:!?])\s+/),keep=ss.filter(function(z){return !(/=/.test(z)&&(/\d/.test(z)||(z.match(/[×÷\/√²³⁻^−₀₁₂₃₄₅₆₇₈₉]/g)||[]).length>=2))});
  if(keep.length===ss.length)return;if(!keep.length||keep.join(' ').trim().length<15){x.remove();return}x.textContent=keep.join(' ')});return d.innerHTML}
function goCards(l,ui){var out=[],nT=0;l.cards.forEach(function(c){
  if(c.t==='T'&&c.h){var h=goStrip(c.h);if(symTxt(h).length<40)return;out.push({t:'T',h:h,_auto:1,_key:null});nT++}
  else if(c.t==='Q'&&c.o&&typeof c.a==='number'){if(GO_MATHQ.test(symTxt(c.p))||goMathy(c.o))return;out.push(Object.assign({},c,{_auto:1,_key:null,_mcFix:1}))}
  else if(c.t==='O'&&c.items){if(goMathy(c.items))return;out.push(Object.assign({},c,{_auto:1,_key:null}))}
  else if(c.t==='W'&&GO_W[c.w])out.push(Object.assign({},c,{_auto:1,_key:null}))});
 if(nT<2)return null;
 var mz=MIS[l.id];if(mz)out.unshift({t:'Q',p:'<span class="gymk">🤔 True or false?</span><br><b>'+mz[0]+'</b>',o:mz[1]?['True','False']:['False','True'],a:0,e:(mz[1]?'':'Many people think this, but it\'s false. ')+mz[2],_auto:1,_key:null,_mcFix:1,_mis:1});
 if(LABEL[l.id]&&DIAS[LABEL[l.id]])out.push(Object.assign(W('labelDia',{d:LABEL[l.id]},'🏷 Label the diagram',''),{_auto:1,_key:null}));
 var u=UNITS[ui];if(u.lessons[u.lessons.length-1]===l&&CMAP[u.id])out.push(Object.assign(W('cmap',CMAP[u.id],'🗺 Concept map: '+u.title,''),{_auto:1,_key:null}));
 return out}
function goSubOpen(s){return !s[3]||alOpen()}
function goUnits(tr){var o=[];UNITS.forEach(function(u,ui){if(trk(ui)===tr&&!(tr==='qm'&&(u.level||1)>=6))o.push(ui)});o.sort(function(a,b){return ((UNITS[a].level||1)-(UNITS[b].level||1))||a-b});return o}
var GO_CACHE={};function goList(tr){if(GO_CACHE[tr])return GO_CACHE[tr];var L=[];goUnits(tr).forEach(function(ui){UNITS[ui].lessons.forEach(function(l,li){var cs=null;try{cs=goCards(l,ui)}catch(e){}if(cs)L.push({ui:ui,li:li,id:l.id,t:l.title,n:cs.length,min:Math.max(2,Math.round(cs.length*0.6))})})});GO_CACHE[tr]=L;return L}
function goStart(ui,li){var l=UNITS[ui].lessons[li],cs=goCards(l,ui);if(!cs)return;S.goLast={ui:ui,li:li,tr:trk(ui)};save();
 sessGo({title:l.title,icon:'🚗',doneTitle:'Lesson done',color:UNITS[ui].color,cards:cs,go:1,onDone:function(){var G=S.go||(S.go={});G[l.id]={d:today(),n:((G[l.id]&&G[l.id].n)||0)+1};save();var nx=goNext(ui,li);
   setTimeout(function(){var b=document.querySelector('.gonext');if(b&&nx)b.onclick=function(){closePlayer();goStart(nx.ui,nx.li)}},50);
   return 'Nice one. '+(nx?'<br><br><button type="button" class="wbtn pri gonext">Next: '+tlEsc(nx.t)+' →</button>':'')}});
 try{if(S.goBig)document.body.classList.add('gobig')}catch(e){}}
function goNext(ui,li){var L=goList(trk(ui));for(var i=0;i<L.length;i++)if(L[i].ui===ui&&L[i].li===li)return L[i+1]||null;return null}
var closePlayer_go=closePlayer;closePlayer=function(){document.body.classList.remove('gobig');var r=closePlayer_go.apply(this,arguments);try{if(typeof PAGE!=='undefined'&&PAGE==='go')goRender()}catch(e){}return r};
function goRender(){var pg=$('page-go');if(!pg)return;var cur=S.goSub||'theory',subs=GO_SUBS.filter(function(s){return s[0]!=='gcs'||UNITS.some(function(u,ui){return trk(ui)==='gcs'})}),G=S.go||{};
 var sub=subs.filter(function(s){return s[0]===cur})[0]||subs[0];if(!goSubOpen(sub))sub=subs[0];cur=sub[0];var L=goList(cur),last=S.goLast,lastL=last&&UNITS[last.ui]?UNITS[last.ui].lessons[last.li]:null,nx=last?goNext(last.ui,last.li):null;
 var h='<div class="gohead"><h1>🚗 On the go</h1><p>No maths, no pressure. Pick any lesson and it teaches you, on your phone, wherever you are. It doesn\'t count towards your plan, so do it whenever you like.</p></div>'+
  '<div class="goopts"><button type="button" class="goopt'+(S.goRead?' on':'')+'" data-o="read">🔊 Read it to me: <b>'+(S.goRead?'on':'off')+'</b></button><button type="button" class="goopt'+(S.goBig?' on':'')+'" data-o="big">🔠 Bigger text: <b>'+(S.goBig?'on':'off')+'</b></button></div>'+
  (lastL?'<div class="golast"><span>Last time: <b>'+tlEsc(lastL.title)+'</b></span>'+(nx?'<button type="button" class="wbtn pri" data-nx="1">Carry on: '+tlEsc(nx.t)+' →</button>':'')+'</div>':'')+
  '<div class="gosubs">'+subs.map(function(s){var op=goSubOpen(s);return '<button type="button" class="gosub'+(s[0]===cur?' on':'')+(op?'':' lock')+'" data-s="'+s[0]+'"'+(op?'':' title="Unlocks when you finish GCSE"')+'><span>'+s[1]+'</span>'+tlEsc(s[2])+(op?'':' 🔒')+'</button>'}).join('')+'</div>'+
  '<div class="gobar"><b>'+tlEsc(sub[2])+'</b><span>'+L.filter(function(x){return G[x.id]}).length+' of '+L.length+' done here</span><button type="button" class="wbtn" data-r="1">🎲 Surprise me</button></div>';
 var byU={};L.forEach(function(x){(byU[x.ui]=byU[x.ui]||[]).push(x)});var lvs={};Object.keys(byU).forEach(function(ui){var lv=UNITS[ui].level||1;(lvs[lv]=lvs[lv]||[]).push(+ui)});
 h+=Object.keys(lvs).sort(function(a,b){return a-b}).map(function(lv,k){var us=lvs[lv],tot=0,dn=0;us.forEach(function(ui){byU[ui].forEach(function(x){tot++;if(G[x.id])dn++})});var nm='Level '+lv;try{nm=lvInfo(cur,+lv)[0]}catch(e){}
   return '<details class="golv"'+(k===0||(last&&us.indexOf(last.ui)>=0)?' open':'')+'><summary><b>Level '+lv+'</b> · '+tlEsc(nm)+'<span>'+dn+'/'+tot+'</span></summary>'+us.map(function(ui){var u=UNITS[ui];return '<div class="gou"><div class="gout">'+tlEsc(u.icon||'')+' '+tlEsc(u.title)+'</div>'+byU[ui].map(function(x){var d=G[x.id];return '<button type="button" class="gol'+(d?' done':'')+'" data-u="'+x.ui+'" data-l="'+x.li+'"><span class="golt">'+tlEsc(x.t)+'</span><span class="golm">'+(d?'✓ ':'')+'~'+x.min+' min</span></button>'}).join('')+'</div>'}).join('')+'</details>'}).join('');
 if(!L.length)h+='<p class="tlnote">Nothing here yet.</p>';
 pg.innerHTML='<div class="gow">'+h+'</div>';
 [].forEach.call(pg.querySelectorAll('[data-s]'),function(b){b.onclick=function(){var s=GO_SUBS.filter(function(x){return x[0]===b.dataset.s})[0];if(!goSubOpen(s)){toast('🔒','A-level unlocks after GCSE','Finish the GCSE levels in Learn to open it');return}S.goSub=s[0];save();goRender()}});
 [].forEach.call(pg.querySelectorAll('[data-o]'),function(b){b.onclick=function(){if(b.dataset.o==='read'){S.goRead=!S.goRead;if(S.goRead&&!window.speechSynthesis)toast('🔊','Read aloud isn\'t available in this browser','')}else S.goBig=!S.goBig;save();goRender()}});
 [].forEach.call(pg.querySelectorAll('.gol'),function(b){b.onclick=function(){goStart(+b.dataset.u,+b.dataset.l)}});
 var nb=pg.querySelector('[data-nx]');if(nb)nb.onclick=function(){goStart(nx.ui,nx.li)};
 var rb=pg.querySelector('[data-r]');if(rb)rb.onclick=function(){var pool=L.filter(function(x){return !G[x.id]});if(!pool.length)pool=L;var x=cP(pool);if(x)goStart(x.ui,x.li)}}
var showPage_go=showPage;showPage=function(p){var r=showPage_go.apply(this,arguments);try{if(p==='go')goRender()}catch(e){if(window.console)console.error(e)}return r};window.showPage=showPage;
(function(){var st=document.createElement('style');st.textContent=
 '.gow{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px;padding-bottom:30px}.gohead h1{margin:4px 0}.gohead p{margin:0;color:var(--muted);line-height:1.5}'+
 '.goopts{display:flex;gap:8px;flex-wrap:wrap}.goopt{flex:1 1 150px;font:inherit;font-size:14px;padding:12px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer;text-align:left}.goopt.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--panel))}'+
 '.golast{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--accent) 8%,var(--panel));border:1px solid var(--line)}.golast .wbtn{align-self:flex-start;font-size:15px;padding:12px 16px}'+
 '.gosubs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}.gosub{flex:none;display:flex;align-items:center;gap:6px;font:inherit;font-size:14px;font-weight:700;padding:10px 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer;white-space:nowrap}.gosub span{font-size:18px}.gosub.on{border-color:var(--accent);background:var(--accent);color:#fff}.gosub.lock{opacity:.55}'+
 '.gobar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.gobar span{color:var(--muted);font-size:13px;flex:1}'+
 '.golv{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:4px 12px}.golv summary{cursor:pointer;padding:10px 0;display:flex;gap:6px;align-items:center;font-size:15px}.golv summary span{margin-left:auto;color:var(--muted);font-size:13px}.gou{padding:6px 0 10px;border-top:1px solid var(--line)}.gout{font-weight:800;font-size:14px;margin:6px 0}'+
 '.gol{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;padding:14px 12px;margin:4px 0;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--text);cursor:pointer;min-height:52px}.gol:active{transform:scale(.99)}.golt{flex:1;font-size:15.5px;font-weight:600}.golm{font-size:12.5px;color:var(--muted);white-space:nowrap}.gol.done{border-color:color-mix(in srgb,var(--good) 50%,var(--line))}.gol.done .golm{color:var(--good);font-weight:800}'+
 'body.gobig #pBody{font-size:118%}body.gobig #pBody .opt{font-size:17px;padding:16px}body.gobig #pBody h3{font-size:1.3em}';document.head.appendChild(st)})();

/* critical.html#onthego opens straight on this tab (used by the main menu) */
var goHashN=0;function goHash(){try{if(!/^#onthego$/i.test(location.hash))return;if(typeof PAGE==='undefined'||PAGE!=='go')showPage('go');if(++goHashN<4){setTimeout(goHash,goHashN*500);return}history.replaceState(null,'',location.pathname+location.search)}catch(e){}}setTimeout(goHash,60);window.addEventListener('hashchange',function(){goHashN=0;goHash()});

