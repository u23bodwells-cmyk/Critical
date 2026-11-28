/* ===== encouragement: a chest meter fed by XP, a lesson-end screen that shows how far you've come, highlights and daily bonuses ===== */
var ENC_STEP=250,ENC_RAR={C:{n:'Common',c:'#8a94a6'},R:{n:'Rare',c:'#2f8fe6'},E:{n:'Epic',c:'#9b5de5'},L:{n:'Legendary',c:'#f5a524'}};
function encGet(){var x=lxGet();x.enc=x.enc&&typeof x.enc==='object'?x.enc:{m:0,f:0,d:'',n:0,ld:''};return x}
function encTier(f){return f%10===0?'E':f%4===0?'R':'C'}
/* every 250 XP fills the meter and drops a chest: every 4th is Rare, every 10th is Epic */
function encGain(g){var x=encGet(),e=x.enc,won=[];e.m=(e.m||0)+g;while(e.m>=ENC_STEP){e.m-=ENC_STEP;e.f=(e.f||0)+1;var t=encTier(e.f);won.push(t);try{MOT.earn(t,'meter')}catch(_){}}lxSet(x);
 if(won.length){if(typeof P!=='undefined'&&P&&!P.finished){P.encWon=(P.encWon||[]).concat(won);var b=won.indexOf('E')>=0?'Epic':won.indexOf('R')>=0?'Rare':'Common';try{toast('🎁','Chest meter full!','+'+won.length+' '+b+' chest'+(won.length>1?'s':'')+' waiting at the end','badge')}catch(_){}}
  else{try{toast('🎁','Chest meter full!','A chest is waiting in Rewards','badge')}catch(_){}}}
 try{encMeterDraw()}catch(_){}}
var axENC=addXP;addXP=function(n,el){var x0=S.xp,out=axENC.apply(this,arguments),g=S.xp-x0;if(g>0)try{encGain(g)}catch(e){}return out};
/* remember where you started, so the end screen can show the change */
var opENC=openPlayer;openPlayer=function(){try{if(P){P.encX0=S.xp;P.encB=S.st.best||0;P.encR0=level().i;P.encD0=(S.hist&&S.hist[today()])||0}}catch(e){}return opENC.apply(this,arguments)};
function chestArt(t,sz){var c=(ENC_RAR[t]||ENC_RAR.C).c;sz=sz||64;return '<svg viewBox="0 0 160 140" width="'+sz+'" height="'+Math.round(sz*0.875)+'" aria-hidden="true"><rect x="18" y="58" width="124" height="72" rx="10" fill="'+c+'" stroke="#0b0f1a" stroke-width="5"/><rect x="18" y="80" width="124" height="10" fill="#0b0f1a" opacity=".3"/><rect x="32" y="59" width="10" height="70" fill="#e5e9f0" opacity=".8"/><rect x="118" y="59" width="10" height="70" fill="#e5e9f0" opacity=".8"/><path d="M14 62V47c0-8 6-14 14-14h104c8 0 14 6 14 14v15z" fill="'+c+'" stroke="#0b0f1a" stroke-width="5"/><rect x="66" y="62" width="28" height="30" rx="6" fill="#e5e9f0" stroke="#0b0f1a" stroke-width="4"/><path d="M80 68l8 9-8 11-8-11z" fill="#fff"/></svg>'}
function encMeterHTML(){var e=encGet().enc,m=e.m||0,nf=(e.f||0)+1,nt=encTier(nf),R=ENC_RAR[nt];return '<div class="encmeter" id="encMeter"><span class="encmi">'+chestArt(nt,34)+'</span><div class="encmx"><div class="encmt"><b>Chest meter</b><span>'+Math.round(m)+' / '+ENC_STEP+' XP</span></div><div class="encbar"><i style="width:'+(m/ENC_STEP*100).toFixed(1)+'%;background:'+R.c+'"></i></div><div class="encms">'+(ENC_STEP-Math.round(m))+' XP to your next chest'+(nt!=='C'?': a <b style="color:'+R.c+'">'+R.n+'</b> one!':'')+'</div></div></div>'}
function encMeterDraw(){var o=document.getElementById('encMeter');if(o)o.outerHTML=encMeterHTML()}
function encChestHTML(){var c=[];try{c=MOT._C().pending||[]}catch(e){}if(!c.length)return '';var best='C';c.forEach(function(x){if('CREL'.indexOf(x.t)>'CREL'.indexOf(best))best=x.t});var R=ENC_RAR[best];
 return '<div class="encchest" id="encChest" style="--rc:'+R.c+'"><span class="encca">'+chestArt(best,84)+'</span><div class="enccx"><b>'+(c.length===1?'A '+R.n.toLowerCase()+' chest is waiting!':c.length+' chests are waiting!')+'</b><span>'+(c.length>1?'Including '+(best==='C'?'a Common':best==='R'?'a Rare':best==='E'?'an Epic':'a Legendary')+' one. ':'')+'See what\'s inside.</span></div><button type="button" class="xbtn" id="encOpen">Open now</button></div>'}
function encChestDraw(){var o=document.getElementById('encChest'),h=encChestHTML(),host=document.getElementById('encWrap');if(o){if(h)o.outerHTML=h;else o.remove()}else if(h&&host)host.insertAdjacentHTML('afterbegin',h);var b=document.getElementById('encOpen');if(b)b.onclick=function(){try{MOT.open(function(){encChestDraw();encMeterDraw()})}catch(e){}}}
/* what was good about this session, in plain words */
function encHighlights(acc){var o=[],t=today(),y=dstr(new Date(Date.now()-864e5)),xt=(S.hist&&S.hist[t])||0,xy=(S.hist&&S.hist[y])||0,g=S.goal||50,d0=P.encD0||0;
 if(d0<g&&xt>=g)o.push(['🎯','Daily goal reached!','You hit '+g+' XP today.']);
 if(P.best>=5&&P.best>(P.encB||0))o.push(['🔥','New best combo!',P.best+' right in a row.']);
 if(xy>0&&xt>xy&&d0<=xy)o.push(['📈','Better than yesterday','Already '+fmtInt(xt)+' XP today, beating yesterday\'s '+fmtInt(xy)+'.']);
 if(P.asked>=3&&acc>=90)o.push(['⭐',acc+'% right first time','That\'s mastery-level accuracy.']);
 else if(P.asked>=3&&acc>=70)o.push(['👍',acc+'% right first time','Solid. The mistakes are now in Fix my mistakes, ready to clear.']);
 var lt=encGet().enc;if(lt.d===t&&lt.n>=2)o.push(['📚',lt.n===2?'Second lesson today':lt.n+' lessons today','Every one adds up.']);
 if((S.streak||0)>=2)o.push(['🔥',S.streak+'-day streak','Come back tomorrow to make it '+(S.streak+1)+'.']);
 if(!o.length)o.push(['💪','Another one done','Every lesson moves you up the ranks.']);return o.slice(0,3)}
var finENC=finish;finish=function(){var lessonish=P&&!P.finished&&(P.mode==='lesson'||(P.mode==='review'&&!P.rev));var out=finENC.apply(this,arguments);
 if(!lessonish||!P||!P.finished)return out;
 try{var ds=document.querySelector('#pBody .done-screen');if(!ds)return out;var t=today(),x=encGet(),e=x.enc,bonus=[];
  /* first lesson of the day, and coming back after a break */
  if(e.d!==t){if(e.ld&&dayDiff(e.ld,t)>=3)bonus.push(['👋 Welcome back',30]);bonus.push(['☀️ First lesson today',25]);e.d=t;e.n=0}
  e.n=(e.n||0)+1;e.ld=t;lxSet(x);
  bonus.forEach(function(b){P.xp+=b[1];addXP(b[1])});
  if(bonus.length){var xb=ds.querySelector('.xpbreak');if(xb)xb.insertAdjacentHTML('beforeend',bonus.map(function(b){return '<div class="encb"><span>'+b[0]+'</span><b>+'+b[1]+'</b></div>'}).join(''));var dx=$('dsXP'),xpv=P.xp;if(dx)setTimeout(function(){dx.textContent='+'+fmtInt(xpv)},950);$('pXP').textContent='+'+P.xp+' XP'}
  var acc=P.asked?Math.round(P.right/P.asked*100):100,lv=level(),r0=P.encR0==null?lv.i:P.encR0,x0=P.encX0==null?S.xp-P.xp:P.encX0,lo=LEVELS[lv.i][0],hi=lv.i<LEVELS.length-1?LEVELS[lv.i+1][0]:lo+2000,f0=lv.i>r0?0:Math.max(0,Math.min(1,(x0-lo)/(hi-lo))),f1=lv.frac,gain=S.xp-x0,lessons=gain>0?Math.ceil(lv.toNext/gain):0;
  var h='<div id="encWrap"><div class="encrank"><div class="encrt"><span class="encrk">Rank '+(lv.i+1)+'</span><b>'+lv.name+'</b>'+(lv.i>r0?'<em class="encnew">New rank!</em>':'')+'</div><div class="encbar big"><i id="encRankBar" style="width:'+(f0*100).toFixed(1)+'%"></i><s style="left:'+(f0*100).toFixed(1)+'%;width:'+Math.max(0,(f1-f0)*100).toFixed(1)+'%"></s></div><div class="encrs"><span><b>+'+fmtInt(gain)+' XP</b> this session</span><span>'+(lv.next?fmtInt(lv.toNext)+' XP to <b>'+lv.next+'</b>'+(lessons&&lessons<40?' · about '+lessons+' more session'+(lessons>1?'s':'')+' like this':''):'Top rank!')+'</span></div></div>'+
   encMeterHTML()+'<div class="enchl">'+encHighlights(acc).map(function(z){return '<div class="enchi"><span>'+z[0]+'</span><div><b>'+z[1]+'</b><em>'+z[2]+'</em></div></div>'}).join('')+'</div></div>';
  var st=ds.querySelector('.done-stats');if(st)st.insertAdjacentHTML('afterend',h);else ds.insertAdjacentHTML('beforeend',h);
  setTimeout(function(){[].forEach.call(ds.querySelectorAll('.neorank'),function(n){n.remove()})},0);
  setTimeout(function(){var bar=document.getElementById('encRankBar');if(bar)bar.style.width=(f1*100).toFixed(1)+'%'},350);
  setTimeout(encChestDraw,450)}catch(err){if(window.console)console.error(err)}return out};
(function(){var st=document.createElement('style');st.textContent=
 '#encWrap{display:flex;flex-direction:column;gap:10px;margin:14px 0 4px;text-align:left}'+
 '.encrank{padding:14px 16px;border-radius:16px;border:1.5px solid color-mix(in srgb,var(--accent) 35%,var(--line));background:linear-gradient(120deg,color-mix(in srgb,var(--accent) 12%,var(--panel)),var(--panel) 75%)}.encrt{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.encrk{font:800 11px var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}.encrt b{font-size:19px}.encnew{font-style:normal;font-weight:800;font-size:12px;color:#7a5200;background:#ffe08a;border-radius:999px;padding:2px 9px}'+
 '.encbar{position:relative;height:10px;border-radius:6px;background:var(--soft2,var(--line));overflow:hidden;margin:8px 0 6px}.encbar.big{height:14px;border-radius:8px}.encbar i{position:absolute;left:0;top:0;bottom:0;border-radius:inherit;background:linear-gradient(90deg,var(--glow,#0a9fd0),var(--glow2,#6a5af0));transition:width 1.1s cubic-bezier(.3,1,.4,1)}.encbar s{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.35) 0 4px,transparent 4px 8px);pointer-events:none}'+
 '.encrs{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13.5px;color:var(--muted)}.encrs b{color:var(--text)}'+
 '.encmeter{display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:14px;border:1.5px solid var(--line);background:var(--panel)}.encmi{flex:none;display:grid}.encmx{flex:1;min-width:0}.encmt{display:flex;justify-content:space-between;gap:8px;font-size:14px}.encmt span{font:700 13px var(--mono,monospace);color:var(--muted)}.encmeter .encbar{margin:6px 0 4px}.encms{font-size:13px;color:var(--muted)}'+
 '.encchest{display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:18px;border:2px solid var(--rc);background:linear-gradient(120deg,color-mix(in srgb,var(--rc) 22%,var(--panel)),var(--panel) 75%);box-shadow:0 0 24px -6px var(--rc)}.encca{flex:none;display:grid}.enccx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.enccx b{font-size:18px}.enccx span{font-size:14px;color:var(--muted)}.encchest .xbtn{font-size:16px;padding:12px 18px}'+
 '@media (prefers-reduced-motion:no-preference){.encca svg{animation:encw 2.4s ease-in-out infinite}}@keyframes encw{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-7deg)}84%{transform:rotate(7deg)}92%{transform:rotate(-3deg)}}'+
 '.enchl{display:grid;gap:8px}.enchi{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:var(--soft)}.enchi>span{font-size:22px}.enchi b{display:block;font-size:15px}.enchi em{font-style:normal;font-size:13.5px;color:var(--muted)}.encb span{font-weight:700}'+
 '@media (max-width:560px){.encchest{flex-wrap:wrap}.encchest .xbtn{width:100%}}';document.head.appendChild(st)})();
