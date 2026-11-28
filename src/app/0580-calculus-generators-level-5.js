/* ---------------- Level 5: calculus in the reactor ---------------- */
CGEN.decay=function(){var t=cR(0,2),T=cP([2,5,8,10,30]);
 if(t===0){var n=cR(1,4),N0=cP([800,1600,3200,6400]);return {p:'A source has a half-life of '+T+' days and starts at '+N0+' Bq. What is its activity after '+(n*T)+' days?',b:[cB(N0/Math.pow(2,n),'','Bq','activity')],e:(n*T)+' days is '+n+' half-lives. '+N0+' ÷ 2'+(n===1?'':cSup(n))+' = '+cNum(N0/Math.pow(2,n))+' Bq.'}}
 if(t===1){var l=Math.LN2/T;return {p:'A nuclide has a half-life of '+T+' hours. What is its decay constant λ, per hour? (3 significant figures)',b:[cB(Number(l.toPrecision(3)),'λ = ','per hour','decay constant',false,0.01)],e:'λ = ln 2 ÷ T½ = 0.693 ÷ '+T+' = '+Number(l.toPrecision(3))+' per hour.'}}
 var lam=cP([0.1,0.2,0.05,0.5]),T2=Math.LN2/lam;return {p:'A nuclide has a decay constant λ = '+lam+' per second. What is its half-life? (3 significant figures)',b:[cB(Number(T2.toPrecision(3)),'T½ = ','s','half-life',false,0.01)],e:'T½ = ln 2 ÷ λ = 0.693 ÷ '+lam+' = '+Number(T2.toPrecision(3))+' s.'}};
CGEN.period=function(){var t=cR(0,2),tau=cP([10,20,30,60,100]);
 if(t===0){var n=cP([1,2,3]),P0=cP([1,2,5,10]),P=P0*Math.exp(n);return {p:'Reactor power rises on a stable period of '+tau+' s, starting at '+P0+'% power. What is the power after '+(n*tau)+' s? (2 decimal places)',b:[cB(Math.round(P*100)/100,'P = ','%','power',false,0.005)],e:'P = P₀e'+cSup('t/τ')+' = '+P0+' × e'+cSup((n*tau)+'/'+tau)+' = '+P0+' × e'+(n===1?'':cSup(n))+' = '+cNum(Math.round(P*100)/100)+'%.'}}
 if(t===1){var d=tau*Math.LN2;return {p:'A reactor is on a '+tau+' s period. How long does it take for power to double? (3 significant figures)',b:[cB(Number(d.toPrecision(3)),'','s','doubling time',false,0.01)],e:'Doubling time = τ × ln 2 = '+tau+' × 0.693 = '+Number(d.toPrecision(3))+' s.'}}
 return {p:'Power P = P₀e'+cSup('t/τ')+' with τ = '+tau+' s. Write dP/dt in terms of P: dP/dt = □ × P. What number goes in the box?',b:[cB(1/tau,'dP/dt = ',' × P','number',false,0.01)],e:'Differentiate: dP/dt = (1/τ)P₀e'+cSup('t/τ')+' = P/τ = P/'+tau+' = '+cNum(1/tau)+'P. The rate of rise is proportional to the power itself.'}};
CGEN.euler=function(){var a=cP([1,2,3]),y0=cP([1,2,4]),h=cP([0.1,0.5]),y1=y0+h*a*y0,y2=y1+h*a*y1;
 return {p:'dy/dx = '+(a===1?'':a)+'y, with y = '+y0+' at x = 0. Use Euler\'s method with step h = '+h+' to estimate y at x = '+cNum(2*h)+'.',b:[cB(Math.round(y2*10000)/10000,'y ≈ ','','estimate',false,0.002)],e:'Step 1: y₁ = '+y0+' + '+h+' × ('+(a===1?'':a+' × ')+y0+') = '+cNum(y1)+'. Step 2: y₂ = '+cNum(y1)+' + '+h+' × ('+(a===1?'':a+' × ')+cNum(y1)+') = '+cNum(y2)+'.'}};
CGEN.trap=function(){var h=cP([1,2]),ys=[cR(0,8),cR(2,10),cR(2,10),cR(0,8)],v=h/2*(ys[0]+2*ys[1]+2*ys[2]+ys[3]);
 return {p:'Use the trapezium rule on this table to estimate the area under the curve.<div class="tbl" style="margin-top:8px"><table class="wtable"><tr><th>x</th>'+[0,1,2,3].map(function(i){return '<td>'+(i*h)+'</td>'}).join('')+'</tr><tr><th>y</th>'+ys.map(function(y){return '<td>'+y+'</td>'}).join('')+'</tr></table></div>',b:[cB(v,'area ≈ ')],e:'Area ≈ (h/2)[first + 2 × middles + last] = ('+h+'/2)['+ys[0]+' + 2('+ys[1]+' + '+ys[2]+') + '+ys[3]+'] = '+cNum(v)+'.'}};
CGEN.energy=function(){var t=cR(0,1);
 if(t===0){var P=cP([1200,1600,800]),h=cP([2,5,10,24]);return {p:'A unit generates a steady '+P+' MW for '+h+' hours. How much energy is that, in MWh?',b:[cB(P*h,'','MWh','energy')],e:'Energy = area under the power–time graph = '+P+' × '+h+' = '+(P*h)+' MWh.'}}
 var a=cP([200,400,600]),b=cP([1000,1200,1600]),h=cP([2,4,5]);return {p:'Power rises steadily from '+a+' MW to '+b+' MW over '+h+' hours. How much energy is produced, in MWh?',b:[cB((a+b)/2*h,'','MWh','energy')],e:'The area under a straight-line graph is a trapezium: average power × time = ('+a+' + '+b+') ÷ 2 × '+h+' = '+cNum((a+b)/2*h)+' MWh.'}};
CGEN.sepode=function(){var k=cP([0.1,0.2,0.5]),y0=cP([100,200,50]),t=cP([2,5,10]),v=y0*Math.exp(-k*t);
 return {p:'dy/dt = −'+k+'y, with y = '+y0+' at t = 0. Solve it, then find y at t = '+t+'. (2 decimal places)',b:[cB(Math.round(v*100)/100,'y = ','','value',false,0.005)],e:'Separate: ∫ dy/y = ∫ −'+k+' dt, so ln y = −'+k+'t + c, giving y = '+y0+'e'+cSup('−'+k+'t')+'. At t = '+t+': '+y0+'e'+cSup('−'+cNum(k*t))+' = '+cNum(Math.round(v*100)/100)+'.'}};

/* ---- a drill: fresh questions until you get several right in a row ---- */
(function(){var css=document.createElement('style');css.textContent=
 '.cdtop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}.cddots{display:flex;gap:6px}.cddots i{width:14px;height:14px;border-radius:50%;background:var(--soft2);display:block;transition:background .2s}.cddots i.on{background:var(--good-line)}'+
 '.cdok{color:var(--good);font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.cdq .qprompt{font-size:18px;margin:0}.cdline{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font:20px var(--serif);margin:12px 0}'+
 '.cdline .cdbox{width:76px;font-size:18px;padding:8px 8px;font-family:var(--mono)}.cdgrp{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.cdline .sgnb{min-width:40px;height:40px;margin-right:0;font-size:20px;border-radius:10px}'+
 '.cdcard{position:relative;border-radius:14px;padding:6px 8px;margin:0 -8px;transition:box-shadow .25s,background .25s}.cdcard.fin{box-shadow:0 0 0 2px var(--amber),0 0 22px rgba(239,159,39,.35)}.cdcard.good{background:var(--good-bg)}'+
 '.cdfin{color:var(--amber)}.cdlab{font-size:13px;color:var(--muted)}.cdright{display:flex;align-items:center;gap:10px}.cdflame{display:inline-flex;align-items:center;gap:2px;font:800 15px var(--mono);color:#e8742a}.cdflame svg{width:18px;height:18px}'+
 '.cddots i.on{background:var(--good-line);box-shadow:0 0 8px rgba(127,179,74,.55)}.cddots i.gold{background:#f5c542;box-shadow:0 0 10px rgba(245,197,66,.7)}.cdxp{font:800 12px var(--mono);background:var(--accent-bg);color:var(--accent-text);border-radius:999px;padding:2px 8px;white-space:nowrap}.cdxp.gold{background:#fff1b3;color:#7a5200}'+
 '.cdstamp{position:absolute;right:10px;top:50%;transform:translateY(-50%) rotate(-12deg);font:900 22px var(--sans);letter-spacing:.04em;text-transform:uppercase;color:#b8860b;border:3px solid #e0a526;border-radius:12px;padding:6px 14px;background:rgba(255,241,179,.92);pointer-events:none}'+
 '@media (prefers-reduced-motion:no-preference){.cdcard.enter{animation:cdIn .28s ease-out}.cdcard.shake{animation:cdShake .38s}.cddots i.pop{animation:cdPop .45s ease-out}.cddots i.drop{animation:cdDrop .4s}.cdflame.pop{animation:cdPop .4s}.cdstamp{animation:cdStamp .5s cubic-bezier(.2,1.6,.4,1)}.cdcard.fin{animation:cdGlow 1.6s ease-in-out infinite}}'+
 '@keyframes cdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes cdShake{0%,100%{transform:none}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}'+
 '@keyframes cdPop{0%{transform:scale(.4)}60%{transform:scale(1.45)}100%{transform:scale(1)}}@keyframes cdDrop{0%{transform:scale(1);background:var(--bad-line)}100%{transform:scale(1)}}@keyframes cdStamp{0%{opacity:0;transform:translateY(-50%) rotate(-12deg) scale(2.2)}100%{opacity:1;transform:translateY(-50%) rotate(-12deg) scale(1)}}@keyframes cdGlow{0%,100%{box-shadow:0 0 0 2px var(--amber),0 0 12px rgba(239,159,39,.25)}50%{box-shadow:0 0 0 2px var(--amber),0 0 26px rgba(239,159,39,.5)}}'+
 '.cdhelp{margin:10px 0 4px;padding:10px 14px;border-radius:12px;background:var(--accent-bg);color:var(--accent-text);font-size:15px;line-height:1.5}.cdhelp:empty{display:none}.cdhelp ol{margin:6px 0 4px;padding-left:22px}.cdhelp li{margin:3px 0}.cdrule{margin-top:6px;font-weight:600}.cdsm{font-size:13px;opacity:.85;margin-top:6px}.cdexp{margin-top:4px}'+
 '.cdtop.md{display:block;margin:0 0 14px}.mdhd{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:18px;border:1.5px solid color-mix(in srgb,var(--accent) 35%,var(--line));background:linear-gradient(120deg,color-mix(in srgb,var(--accent) 16%,var(--panel)),var(--panel) 72%);transition:border-color .3s,background .3s}'+
 '.mdhd.fin{border-color:var(--amber);background:linear-gradient(120deg,color-mix(in srgb,var(--amber) 24%,var(--panel)),var(--panel) 72%)}.mdhd.won{border-color:#e0a526;background:linear-gradient(120deg,rgba(245,197,66,.38),var(--panel) 78%)}'+
 '.mdhd.won::after{content:"";position:absolute;top:0;bottom:0;left:-40%;width:35%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-14deg);pointer-events:none}'+
 '.mdring{position:relative;flex:none;width:72px;height:72px}.mdring svg{width:72px;height:72px;transform:rotate(-90deg);display:block}.mdring circle{fill:none;stroke-width:7}.mdring .bg{stroke:var(--soft2)}.mdring .fg{stroke:var(--accent);stroke-linecap:round;transition:stroke-dashoffset .7s cubic-bezier(.3,1.25,.5,1);filter:drop-shadow(0 0 4px color-mix(in srgb,var(--accent) 55%,transparent))}.mdhd.fin .fg{stroke:var(--amber)}.mdhd.won .fg{stroke:#f5c542}'+
 '.mdring span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;white-space:nowrap;font:800 22px var(--mono);color:var(--text)}.mdring small{font-size:13px;color:var(--muted);font-weight:700}.mdhd.won .mdring span{color:#c48a00;font-size:30px}'+
 '.mdtt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.mdk{font:800 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mdtt b{font-size:22px;line-height:1.2}.mdsub{font-size:14.5px;color:var(--muted);line-height:1.35}'+
 '.mdchips{display:flex;flex-direction:column;gap:6px;align-items:flex-end}.mdchip{font:800 14px var(--mono);border-radius:999px;padding:5px 11px;background:var(--soft);white-space:nowrap}.mdchip.cdflame{background:rgba(232,116,42,.14)}.mdxp{background:var(--accent-bg);color:var(--accent-text)}'+
 '.cddots.mdseg{display:flex;gap:6px;margin-top:10px}.mdseg i{flex:1;width:auto;height:12px;border-radius:7px;position:relative}.mdseg i.on{background:linear-gradient(90deg,var(--glow,#0a9fd0),var(--glow2,#6a5af0));box-shadow:0 0 10px color-mix(in srgb,var(--glow2,#6a5af0) 50%,transparent)}.mdseg i.gold{background:linear-gradient(90deg,#f5c542,#ffdd75);box-shadow:0 0 10px rgba(245,197,66,.6)}'+
 '.mdseg i.last::after{content:"★";position:absolute;right:3px;top:50%;transform:translateY(-50%);font-size:10px;line-height:1;color:var(--muted)}.mdseg i.last.on::after{color:#fff}'+
 '.cdcard.mdc{margin:0;padding:18px 18px 14px;border:1.5px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:0 12px 30px -20px rgba(0,0,0,.45)}.cdcard.mdc.fin{border-color:var(--amber)}.cdcard.mdc.good{border-color:var(--good-line)}'+
 '.mdc .cdq .qprompt{font-size:21px;line-height:1.55}.mdc .cdline{font-size:24px;gap:8px;margin:16px 0 6px}.mdc .cdline .cdbox{width:124px;font-size:22px;padding:11px 12px;border-radius:12px;border-width:2px}.mdc .cdline .cdbox.cdsup{width:64px;font-size:16px;padding:6px 8px}.mdc .cdin .opt{font-size:17px;padding:14px 16px;border-radius:14px}'+
 '.mdrow{gap:8px;margin-top:12px}.mdrow button{font-size:16px;padding:12px 18px;border-radius:12px}.mdc .cdstamp{font-size:30px;padding:8px 18px;border-width:4px;right:16px}'+
 '@media (max-width:560px){.mdhd{gap:10px;padding:12px}.mdring,.mdring svg{width:58px;height:58px}.mdring span{font-size:19px}.mdtt b{font-size:18px}.mdsub{font-size:13px}.mdc .cdq .qprompt{font-size:19px}.mdc .cdline .cdbox{width:104px}.mdc .cdstamp{font-size:22px}}'+
 '@media (prefers-reduced-motion:no-preference){.mdhd.won::after{animation:mdShine 2.4s .3s ease-in-out infinite}.mdseg i.pop{animation:cdPop .45s ease-out}.mdhd.fin{animation:mdPulse 1.6s ease-in-out infinite}}@keyframes mdShine{0%{left:-40%}55%,100%{left:120%}}@keyframes mdPulse{50%{box-shadow:0 0 0 4px rgba(239,159,39,.18)}}'+
 '.cdsupg{align-self:flex-start;margin-top:-10px}.cdline .cdbox.cdsup{width:54px;font-size:14px;padding:5px 6px}.cdsupg .sgnb{min-width:32px;height:32px;font-size:16px;border-radius:8px}.cdin .opt{margin-top:8px}';
 document.head.appendChild(css)})();
WIDGETS.calcDrill=function(box,par){var mth=false;try{if(typeof P!=='undefined'&&P&&P.ui!=null)mth=!!{maths:1,calc:1,gm:1,am:1}[trk(P.ui)]}catch(e){}
 var bank=null;if(par.bank){try{bank=typeof par.bank==='function'?par.bank():par.bank}catch(e){bank=null}}
 var gens=[].concat(par.skill||[]).filter(function(k){return typeof CGEN[k]==='function'});
 if(!gens.length&&!(bank&&bank.length)){box.innerHTML='<p class="small">Nothing to practise here yet.</p>';return {check:function(){return {ok:true}}}}
 var need=Math.max(par.need||5,mth?5:0);if(bank&&!gens.length)need=Math.min(need,Math.max(3,bank.length-1));
 var lastPct=0,score=0,run=0,clean=true,done=false,passed=false,q=null,answered=false,count=0,help=0,hadHelp=false,wrongs=0,last=-1,xpGot=0,recent=[],medal=0,
  weakMode=typeof P!=='undefined'&&P&&P.mode==='weak',exOK=!!gens.length&&!par.noEx&&!weakMode,timed=false,tmr=null,timeUp=false;
 try{timed=localStorage.getItem('critical_timed')==='1'}catch(e){}
 var PRAISE=['Nice.','Spot on.','That\'s it.','Nailed it.','Exactly right.','Lovely.','Yes!','Clean.','Textbook.','Sharp.'];
 var top=el('div','cdtop md',null,box),tbar=el('div','mdtbar',null,box),card=el('div','cdcard mdc',null,box),qb=el('div','cdq',null,card),inRow=el('div','cdin',null,card),hb=el('div','cdhelp',null,box),r=row(box),chkB=btn(r,'Submit answer',check,'pri'),helpB=btn(r,'Help',helpMe),nxt=btn(r,'Next question',next),skipB=btn(r,'Different question',skip),moveB=btn(r,'Move on for now',moveOn),m=msg(box);r.classList.add('mdrow');tbar.hidden=true;
 function inL(){return typeof P!=='undefined'&&P&&P.mode==='lesson'}
 function T(f){try{f()}catch(e){}}
 function give(n,from){if(n<=0)return;xpGot+=n;T(function(){if(inL())award(n);else addXP(n,from||nxt)})}
 var FT=!mth&&need>3&&!exOK;
 var MED=['','🥉 Bronze','🥈 Silver','🥇 Gold'];
 /* the header: a ring that fills as you go, what stage you're at, your streak and XP, a timer switch, and a segment for every answer you need */
 function dots(pop,drop){var fin=!done&&!passed&&score===need-1,pct=done?1:Math.min(1,score/need),C=188.5,fr=score/need,
  stage=done?'Mastered!':passed?'Paused for now':fin?'Final question!':score===0?'Warming up':fr<0.4?'Getting going':fr<0.7?'On a roll':'Nearly there',
  sub=done?(medal?MED[medal]+' mastery. ':'')+(xpGot?'You earned +'+xpGot+' XP.':'Lovely work.'):passed?'Come back with the Practice button any time.':fin?'Get this one right to master it.':(need-score)+' more right to master it'+(FT&&count<=3&&clean?' · or 3 right first go to fast-track':'')+'.',
  h='<div class="mdhd'+(fin?' fin':'')+(done?' won':'')+'"><div class="mdring" aria-hidden="true"><svg viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-lastPct)).toFixed(1)+'"/></svg><span>'+(done?(medal?['','🥉','🥈','🥇'][medal]:'★'):score+'<small>/'+need+'</small>')+'</span></div>'+
  '<div class="mdtt"><span class="mdk">'+(par.label?par.label:par.mix?'Mixed practice':weakMode?'Weak skills':bank&&!gens.length?'Concept check':'Mastery')+(par.title?' · '+par.title:'')+'</span><b'+(fin?' class="cdfin"':'')+'>'+stage+'</b><span class="mdsub">'+sub+'</span></div><div class="mdchips">'+(run>=2&&!done?'<span class="cdflame mdchip'+(pop?' pop':'')+'">'+FLAME+'<b>'+run+'</b></span>':'')+(xpGot?'<span class="mdchip mdxp">+'+xpGot+' XP</span>':'')+(!done&&!passed?'<button type="button" class="mdchip mdtime'+(timed?' on':'')+'" aria-pressed="'+timed+'" title="Answer against the clock">⏱ '+(timed?'Timed':'Timer off')+'</button>':'')+'</div></div><div class="cddots mdseg" role="img" aria-label="'+score+' of '+need+' right">';
  for(var i=0;i<need;i++)h+='<i class="'+(i<Math.min(score,need)?'on':'')+(pop&&i===score-1?' pop':'')+(drop&&i===score?' drop':'')+(done?' gold':'')+(i===need-1?' last':'')+'"></i>';
  top.innerHTML=h+'</div>';card.classList.toggle('fin',fin);
  var fg=top.querySelector('.fg');lastPct=pct;requestAnimationFrame(function(){requestAnimationFrame(function(){if(fg)fg.setAttribute('stroke-dashoffset',(C*(1-pct)).toFixed(1))})});
  if(pop)T(function(){var d=top.querySelector('.cddots i.pop');if(d&&window.NEO&&NEO.burst){var b=d.getBoundingClientRect();NEO.burst(b.left+b.width/2,b.top+b.height/2,{n:14})}})}
 top.addEventListener('click',function(e){if(!e.target.closest('.mdtime'))return;timed=!timed;try{localStorage.setItem('critical_timed',timed?'1':'0')}catch(_){}if(timed&&!answered)startT();else stopT();dots()});
 /* timed mode: a bar that runs down; when it empties the question counts as a miss */
 function stopT(){if(tmr){clearInterval(tmr);tmr=null}tbar.hidden=true}
 function startT(){stopT();if(!timed||answered||!q)return;var lim=q.o?45:q.b.length>1?120:75,t0=Date.now();tbar.hidden=false;
  function draw(){var left=Math.max(0,lim-(Date.now()-t0)/1000);tbar.className='mdtbar'+(left<10?' low':'');tbar.innerHTML='<i style="width:'+(left/lim*100).toFixed(1)+'%"></i><span>⏱ '+Math.ceil(left)+' s</span>';return left}
  draw();tmr=setInterval(function(){if(!document.body.contains(box)){stopT();return}if(draw()<=0){stopT();if(!answered){timeUp=true;check()}}},250)}
 function key(e){if(e.key==='Enter'){e.preventDefault();e.stopPropagation();answered?next():check()}}
 function pick(){if(bank&&!gens.length){var i,tries=0;do{i=Math.floor(Math.random()*bank.length);tries++}while(recent.indexOf(i)>=0&&tries<30);recent.push(i);if(recent.length>Math.min(3,bank.length-1))recent.shift();var b0=bank[i],qq={p:b0.p,e:b0.e||''};if(b0.o)qq.o=b0.o.slice();if(b0.b)qq.b=b0.b;return qq}
  var k=cP(gens);if(gens.length>2&&k===last)k=cP(gens);last=k;var q2=CGEN[k]();q2._k=k;return q2}
 function li(x){return '<li>'+x+'</li>'}
 function ansTxt(){return q.o?q.o[0]:q.b.map(function(bb){return cNum(bb.a)}).join(' and ')}
 function next(){stopT();q=pick();count++;answered=false;help=0;timeUp=false;q.pick=null;hb.innerHTML='';qb.innerHTML='<div class="qprompt">'+q.p+'</div>';inRow.innerHTML='';inRow.classList.toggle('opts',!!q.o);card.classList.remove('shake','good','wex');void card.offsetWidth;card.classList.add('enter');
  if(q.o){shuffle(q.o.map(function(_,i){return i})).forEach(function(k){var b=el('button','opt',q.o[k],inRow);b.dataset.k=k;b.onclick=function(){if(answered)return;[].forEach.call(inRow.children,function(x){x.classList.remove('sel')});b.classList.add('sel');q.pick=k};b.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(answered)nxt.click();else{if(q.pick==null)b.click();check()}}}})}
  else{var line=el('div','cdline',null,inRow);q.b.forEach(function(bb,i){var g=el('span','cdgrp'+(bb.sup?' cdsupg':''),null,line);if(bb.pre)el('span','',bb.pre,g);var inp=el('input','numin cdbox'+(bb.sup?' cdsup':''),null,g);inp.type='text';if(q.pos)inp.__sgn=1;inp.setAttribute('inputmode','decimal');inp.setAttribute('autocomplete','off');inp.setAttribute('aria-label',bb.label||('Answer '+(i+1)));inp.onkeydown=key;if(bb.post)el('span','',bb.post,g)})}
  chkB.style.display='';helpB.style.display='';helpB.textContent='Help';skipB.style.display=done?'none':'';nxt.style.display='none';nxt.textContent='Next question';moveB.style.display=(!done&&!passed&&count>need+3)?'':'none';m.set('');
  /* worked example, then fade: the first question is shown fully worked, the second comes with the first steps done for you */
  var st=q.b?steps():[];
  if(exOK&&count===1&&q.b&&q.e){worked(st);return}
  if(exOK&&count===2&&q.b&&st.length>=3){q.scaf=true;hb.innerHTML='<b>🪜 Start like this</b><ol class="cdsteps">'+st.slice(0,Math.floor(st.length/2)).map(li).join('')+'</ol><div class="cdsm">Now finish it off yourself. This one counts.</div>'}
  dots();startT();var f=inRow.querySelector('input');if(f)try{f.focus({preventScroll:true})}catch(e){}}
 function worked(st){answered=true;card.classList.add('wex');hb.innerHTML='<b>📘 Worked example</b> Watch how this one is done first. It doesn\'t count, so take your time.<ol class="cdsteps">'+st.map(li).join('')+'</ol><div class="cdsm">Answer: <b>'+ansTxt()+'</b></div>';
  [].forEach.call(inRow.querySelectorAll('input'),function(inp,i){inp.value=String(cNum(q.b[i].a)).replace('−','-');inp.disabled=true});
  chkB.style.display='none';helpB.style.display='none';skipB.style.display='none';nxt.style.display='';nxt.textContent='My turn →';dots();try{nxt.focus({preventScroll:true})}catch(e){}}
 function steps(){return String(q.e||'').split(/\.\s+(?=[A-Z(<])/).map(function(x,i,a){return x+(i<a.length-1?'.':'')})}
 function helpMe(){if(answered)return;help++;clean=false;hadHelp=true;var st=steps();
  if(help===1){var first=st.length>1?st[0]:'';hb.innerHTML='<b>💡 Hint</b> '+(first||par.rule||'Take it one step at a time.')+(first&&par.rule?'<div class="cdrule">'+par.rule+'</div>':'')+'<div class="cdsm">Get it right after a hint and it still counts (half XP). Still stuck? Press <b>Show me how</b>.</div>';helpB.textContent='Show me how';return}
  stopT();hb.innerHTML='<b>🧭 Here\'s how</b><ol class="cdsteps">'+st.map(li).join('')+'</ol><div class="cdsm">Answer: <b>'+ansTxt()+'</b></div><div class="cdsm">This one doesn\'t count either way, and your combo is safe. Now try a similar one yourself.</div>';
  answered=true;chkB.style.display='none';helpB.style.display='none';skipB.style.display='none';nxt.style.display='';nxt.textContent='Try a similar one';m.set('');dots();try{nxt.focus({preventScroll:true})}catch(e){}}
 function skip(){if(answered)return;clean=false;next()}
 function moveOn(){passed=true;stopT();moveB.style.display='none';m.set('No problem. You can carry on now. Come back with the <b>Practice</b> button on this lesson whenever you like: it uses the same questions.',true);dots()}
 function close(bb,v){var tol=bb.tol==null?0.005:bb.tol;return bb.a===0?Math.abs(v)<1e-9:Math.abs(v-bb.a)<=Math.abs(bb.a)*(tol+1e-9)}
 function mastered(fast){card.classList.add('good');medal=(wrongs===0&&!hadHelp)?3:wrongs<=2?2:1;T(function(){var id=lxLid();if(id&&!par.mix&&!weakMode)lxMedal(id,medal)});
  var st=el('div','cdstamp',fast?'⚡ Fast-tracked':MED[medal],card);T(function(){var b=top.getBoundingClientRect();if(window.NEO&&NEO.burst)NEO.burst(b.left+46,b.top+46,{n:30})});setTimeout(function(){T(function(){st.remove()})},2600);
  var bonus=fast?30:[0,15,20,30][medal];give(bonus,top);T(function(){confetti()});T(function(){sfx('done')});return bonus}
 function check(){if(answered)return;var ok,vals=null;
  if(timeUp){ok=false;if(q.o)[].forEach.call(inRow.children,function(b){b.disabled=true;if(+b.dataset.k===0)b.classList.add('right')});else [].forEach.call(inRow.querySelectorAll('input'),function(inp){inp.disabled=true;inp.style.borderColor=cssv('--bad-line')})}
  else if(q.o){if(q.pick==null){m.set('Pick an answer first.',false);return}ok=q.pick===0;[].forEach.call(inRow.children,function(b){var k=+b.dataset.k;b.disabled=true;if(k===0)b.classList.add('right');else if(k===q.pick)b.classList.add('wrong')})}
  else{var ins=inRow.querySelectorAll('input');vals=[].map.call(ins,function(i){return parseNum(i.value)});if(vals.some(function(v){return isNaN(v)})){m.set('Type a number in every box. Decimals like 0.5 and negatives like −3 are fine.',false);return}
   ok=q.b.every(function(bb,i){return close(bb,vals[i])});[].forEach.call(ins,function(inp,i){inp.disabled=true;inp.style.borderColor=close(q.b[i],vals[i])?cssv('--good-line'):cssv('--bad-line')})}
  stopT();answered=true;var was=done,note='',lost=false,xp=0,bonus=0,fast=false;
  T(function(){if(q._k)lxWeak(q._k,ok,weakMode)});if(!ok)T(function(){if(typeof nbDrill==='function')nbDrill(q,typeof vals!=='undefined'?vals:null)});
  if(ok){score++;run++;if(score>=need||(FT&&clean&&run>=3&&count===3)){done=true;fast=score<need}
   xp=help?5:q.scaf?8:10+(run>=3?Math.min(5,run-1):0);give(xp,chkB);
   T(function(){if(inL()){P.combo=(P.combo||0)+1;P.best=Math.max(P.best||0,P.combo);if(S.st&&P.combo>S.st.best)S.st.best=P.combo;if(S.st)S.st.right++;showCombo(true);qProg('right',1);qProg('run',P.combo)}});
   T(function(){sfx(run>=3?'combo':'right')});
   if(done&&!was){score=need;bonus=mastered(fast)}
   var pr=(inL()&&typeof comboPraise==='function'&&comboPraise())||cP(PRAISE);
   note='<b>'+pr+'</b> <span class="cdxp">+'+xp+' XP</span>'+(bonus?' <span class="cdxp gold">+'+bonus+' mastery bonus</span>':'')+' '+(done&&!was?(fast?'Three right first go: you\'re through. ':'You\'ve mastered this. '):(!done?(need-score===1?'One more to master it. ':(need-score)+' more to go. '):''))}
  else{wrongs++;run=0;clean=false;lost=score>0&&!done;if(lost)score--;card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');
   T(function(){if(inL()){P.combo=0;showCombo(false)}});T(function(){sfx('wrong')});
   var sl='';if(vals&&q.b.length===1)T(function(){sl=numSlip(vals[0],q.b[0].a)});
   note=(timeUp?'<b>Time\'s up.</b> ':'<b>Not quite.</b> ')+(q.o?(timeUp?'The answer was <b>'+q.o[0]+'</b>. ':''):'It\'s '+ansTxt()+'. ')+(lost?'You lose one dot, not all of them. ':'')+(sl?'<div class="cdslip">🔎 '+sl+'</div>':'')}
  m.set(note+(q.e?'<div class="cdexp">'+q.e+'</div>':'')+(!ok&&wrongs>=2&&!done?'<div class="cdsm">Tip: press <b>Help</b> on the next one for a hint or a full walk-through.</div>':''),ok);
  chkB.style.display='none';helpB.style.display='none';skipB.style.display='none';nxt.style.display='';moveB.style.display=(!done&&!passed&&count>=need+3)?'':'none';dots(ok,lost);try{nxt.focus({preventScroll:true})}catch(e){}}
 next();
 return {check:function(){return done||passed?{ok:true}:{ok:false,msg:'Get '+need+' right to master it first ('+score+' so far). Use <b>Help</b> if you\'re stuck'+(count>need+3?', or <b>Move on for now</b>':'')+'.'}},lock:function(){stopT()}}};

/* ---- exam-style set: a fixed number of parts, 2 marks each (1 if you used the method hint), with a mark scheme after each ---- */
WIDGETS.examSet=function(box,par){var gens=[].concat(par.skill||[]).filter(function(k){return typeof CGEN[k]==='function'}),bank=null;if(par.bank){try{bank=typeof par.bank==='function'?par.bank():par.bank}catch(e){}}
 if(!gens.length&&!(bank&&bank.length)){box.innerHTML='<p class="small">Nothing to practise here yet.</p>';return {check:function(){return {ok:true}}}}
 var N=par.n||5,i=0,q=null,answered=false,hinted=false,marks=0,res=[],done=false,recent=[],last=-1,L='abcdefghij';
 var top=el('div','exhd',null,box),card=el('div','cdcard mdc',null,box),qb=el('div','cdq',null,card),inRow=el('div','cdin',null,card),hb=el('div','cdhelp',null,box),r=row(box),chk=btn(r,'Submit answer',check,'pri'),hint=btn(r,'Method hint (−1 mark)',hintF),nx=btn(r,'Next part',next),m=msg(box);r.classList.add('mdrow');
 function head(){var h='<div class="mdhd exh"><div class="exsc"><b>'+marks+'</b><small>/'+(N*2)+'</small><span>marks</span></div><div class="mdtt"><span class="mdk">Exam-style'+(par.title?' · '+par.title:'')+'</span><b>'+(done?'Finished':'Question 1 ('+L.charAt(Math.max(0,i-1))+')')+'</b><span class="mdsub">'+(done?'Look back at the mark schemes for anything you dropped.':'Part '+i+' of '+N+' · [2 marks]. No retries, like the real thing.')+'</span></div></div><div class="cddots mdseg">';
  for(var k=0;k<N;k++)h+='<i class="'+(res[k]===2?'on':res[k]===1?'half':res[k]===0?'miss':'')+'"></i>';top.innerHTML=h+'</div>'}
 function pick(){if(bank&&!gens.length){var j,t=0;do{j=Math.floor(Math.random()*bank.length);t++}while(recent.indexOf(j)>=0&&t<30);recent.push(j);var b0=bank[j],qq={p:b0.p,e:b0.e||''};if(b0.o)qq.o=b0.o.slice();if(b0.b)qq.b=b0.b;return qq}var k2=cP(gens);if(gens.length>1&&k2===last)k2=cP(gens);last=k2;return CGEN[k2]()}
 function next(){if(i>=N){finish();return}q=pick();i++;answered=false;hinted=false;q.pick=null;hb.innerHTML='';m.set('');qb.innerHTML='<div class="qprompt"><b>('+L.charAt(i-1)+')</b> '+q.p+' <span class="exm">[2]</span></div>';inRow.innerHTML='';inRow.classList.toggle('opts',!!q.o);card.classList.remove('enter');void card.offsetWidth;card.classList.add('enter');
  if(q.o)shuffle(q.o.map(function(_,j){return j})).forEach(function(k){var b=el('button','opt',q.o[k],inRow);b.dataset.k=k;b.onclick=function(){if(answered)return;[].forEach.call(inRow.children,function(x){x.classList.remove('sel')});b.classList.add('sel');q.pick=k};b.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(answered)nx.click();else{if(q.pick==null)b.click();check()}}}});
  else{var line=el('div','cdline',null,inRow);q.b.forEach(function(bb){var g=el('span','cdgrp'+(bb.sup?' cdsupg':''),null,line);if(bb.pre)el('span','',bb.pre,g);var inp=el('input','numin cdbox'+(bb.sup?' cdsup':''),null,g);inp.type='text';inp.setAttribute('inputmode','decimal');inp.setAttribute('autocomplete','off');inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();e.stopPropagation();answered?next():check()}};if(bb.post)el('span','',bb.post,g)})}
  chk.style.display='';hint.style.display=q.e?'':'none';nx.style.display='none';nx.textContent=i>=N?'See my score':'Next part';head();var f=inRow.querySelector('input');if(f)try{f.focus({preventScroll:true})}catch(e){}}
 function hintF(){if(answered||hinted)return;hinted=true;var st=String(q.e||'').split(/\.\s+(?=[A-Z(<])/);hb.innerHTML='<b>📐 Method hint</b> '+st[0]+(st.length>1?'.':'')+'<div class="cdsm">This part is now worth 1 mark at most.</div>';hint.style.display='none'}
 function close(bb,v){var tol=bb.tol==null?0.005:bb.tol;return bb.a===0?Math.abs(v)<1e-9:Math.abs(v-bb.a)<=Math.abs(bb.a)*(tol+1e-9)}
 function check(){if(answered)return;var ok,vals=null;
  if(q.o){if(q.pick==null){m.set('Pick an answer first.',false);return}ok=q.pick===0;[].forEach.call(inRow.children,function(b){var k=+b.dataset.k;b.disabled=true;if(k===0)b.classList.add('right');else if(k===q.pick)b.classList.add('wrong')})}
  else{var ins=inRow.querySelectorAll('input');vals=[].map.call(ins,function(x){return parseNum(x.value)});if(vals.some(function(v){return isNaN(v)})){m.set('Type a number in every box.',false);return}ok=q.b.every(function(bb,k){return close(bb,vals[k])});[].forEach.call(ins,function(x,k){x.disabled=true;x.style.borderColor=close(q.b[k],vals[k])?cssv('--good-line'):cssv('--bad-line')})}
  answered=true;var got=ok?(hinted?1:2):0;marks+=got;res.push(got);try{sfx(ok?'right':'wrong')}catch(e){}
  var ans=q.o?q.o[0]:q.b.map(function(bb){return cNum(bb.a)}).join(' and '),sl='';if(!ok&&vals&&q.b.length===1){try{sl=numSlip(vals[0],q.b[0].a)}catch(e){}}
  m.set('<b>'+(got===2?'2 marks.':got===1?'1 mark (method hint used).':'0 marks.')+'</b>'+(sl?'<div class="cdslip">🔎 '+sl+'</div>':'')+'<div class="exms"><b>Mark scheme</b><div>'+(q.o?'B2: '+ans:'M1: correct method · A1: '+ans)+'</div>'+(q.e?'<div class="cdexp">'+q.e+'</div>':'')+'</div>',ok);
  chk.style.display='none';hint.style.display='none';nx.style.display='';head();try{nx.focus({preventScroll:true})}catch(e){}}
 function finish(){done=true;var pc=Math.round(marks/(N*2)*100);qb.innerHTML='<div class="exend"><div class="exbig">'+marks+'<small>/'+(N*2)+'</small></div><b>'+pc+'%</b><p>'+(pc>=90?'Top marks. You\'re exam ready on this.':pc>=70?'Strong. Check the parts you dropped, then go again.':pc>=50?'Getting there. Redo the lessons behind the parts you missed.':'Worth another go after a look back through this unit.')+'</p></div>';inRow.innerHTML='';hb.innerHTML='';m.set('');chk.style.display='none';hint.style.display='none';nx.style.display='none';head();try{if(marks)addXP(marks*3,top)}catch(e){}try{sfx(pc>=70?'done':'quest')}catch(e){}}
 next();
 return {check:function(){return done?{ok:true}:{ok:false,msg:'Finish all '+N+' parts first.'}}}};

/* ---- area under a curve: strips that become the integral ---- */
WIDGETS.riemann=function(box,par){var f=par.f,a=par.a,b=par.b,exact=par.exact,n=par.n0||4,ok=false,cv=canvas(box,240);
 var rr=el('div','wrow',null,box),id='rm'+Math.random().toString(36).slice(2,7);rr.innerHTML='<label for="'+id+'">Number of strips</label><input type="range" id="'+id+'" min="1" max="60" step="1" value="'+n+'"><output></output>';
 var inp=rr.querySelector('input'),out=rr.querySelector('output');inp.oninput=function(){n=+inp.value;draw()};
 var st=stats(box,[['s','Total of the strips'],['e','Exact area'],['d','Gap']]),m=msg(box);
 function draw(){out.textContent=n;var P=plot(cv,{x:[a,b],y:par.y,xl:'x',yl:'y'}),c=P.c,w=(b-a)/n,s=0;
  for(var i=0;i<n;i++){var x0=a+i*w,h=f(x0+(par.mid?w/2:0));s+=h*w;var X0=P.X(x0),X1=P.X(x0+w),Y0=P.Y(0),Yh=P.Y(h);c.globalAlpha=0.22;c.fillStyle=cssv('--accent');c.fillRect(X0,Math.min(Y0,Yh),X1-X0,Math.abs(Y0-Yh));c.globalAlpha=0.6;c.strokeStyle=cssv('--accent');c.lineWidth=1;c.strokeRect(X0,Math.min(Y0,Yh),X1-X0,Math.abs(Y0-Yh))}
  c.globalAlpha=1;P.fn(f,cssv('--coral'),2.5,[]);
  st.s.textContent=s.toFixed(3);st.e.textContent=exact.toFixed(3);st.d.textContent=Math.abs(s-exact).toFixed(3);
  var g=n>=(par.goalN||30);if(g)ok=true;m.set(g?'With '+n+' strips the total is only '+Math.abs(s-exact).toFixed(3)+' away from the exact area. Infinitely many, infinitely thin strips give the exact answer: that\'s the integral.':'Drag the slider to add more strips. Watch the gap shrink.',g?true:null)}
 onDraw(draw);draw();
 return {check:function(){return ok?{ok:true}:{ok:false,msg:'Use at least '+(par.goalN||30)+' strips.'}},lock:function(){}}};

/* ---- turn a generator into a fixed card for follow-ups and tests ---- */
function GN(skill){var q=CGEN[skill]();if(q.o)return Q(q.p,q.o,0,q.e);
 var k=q.b.length>1?cR(0,q.b.length-1):0,bb=q.b[k],ask=q.b.length>1?' <i>What is the '+bb.label+'?</i>':'';
 var tmpl=q.b.length>1?'<div class="small" style="margin-top:6px">Answer in the form: '+q.b.map(function(x,i){return x.pre+(x.sup?'<sup>▢</sup>':'▢')+x.post}).join('')+'</div>':'';
 return N(q.p+tmpl+ask,bb.a,bb.tol==null?0.005:bb.tol,'',q.e)}

/* goals for each calculus level: one stage per unit */
GOALS.calc1={icon:'📐',title:'Get ready for calculus',story:'Each unit sharpens one tool that calculus is built from. Finish them all and every rule in Level 2 will feel familiar.',final:'Ready for calculus',steps:['Functions and graphs','Powers and indices','Gradients of lines','Rates of change on curves']};
GOALS.calc2={icon:'📈',title:'Find the gradient of any curve',story:'Each unit takes you one step closer to differentiating anything with powers of x, from scratch.',final:'You can differentiate',steps:['From chords to tangents','First principles','The power rule','Tangents and normals']};
GOALS.calc3={icon:'🧰',title:'Build your calculus toolkit',story:'Each unit adds a tool: finding peaks and dips, solving real problems, new functions, and the rules that combine them.',final:'Full differentiation toolkit',steps:['Stationary points','Real problems','eˣ, ln x, sin and cos','Chain, product and quotient rules']};
GOALS.calc4={icon:'📊',title:'Master integration',story:'Each unit takes you further into integration: undoing differentiation, finding areas, standard integrals and the main techniques.',final:'You can integrate',steps:['Undoing differentiation','Definite integrals and area','Standard integrals','Substitution and by parts']};
GOALS.calc5={icon:'⚛️',title:'Use calculus on a reactor',story:'Each unit applies calculus to the plant: decay, power rising on a period, numerical methods and energy.',final:'Calculus, start to finish',steps:['Differential equations','Radioactive decay','Reactor period','Numerical methods and energy']};

