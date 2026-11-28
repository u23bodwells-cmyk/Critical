/* ===== memory start ===== */
/* Memory refresh: everything you answer is scheduled to come back (1, 3, 7, 14, 30, 60 days),
   old questions from earlier levels pop up at the end of new lessons, and key numbers get their own cards. */
var MEM=(function(){
 var INT=[1,3,7,14,30,60];
 var KEY=[
  ['leff','In the one-group period formula τ ≈ (β − ρ)/(λ<sub>eff</sub>ρ), λ<sub>eff</sub> is about…',['0.08 s<sup>−1</sup>','0.8 s<sup>−1</sup>','8 s<sup>−1</sup>','0.0065 s<sup>−1</sup>'],0,'λ<sub>eff</sub> ≈ 0.08 s<sup>−1</sup>: the average decay constant of the delayed-neutron precursors. Think "eight hundredths".','λ<sub>eff</sub> ≈ 0.08'],
  ['beta','The delayed neutron fraction β for uranium-235 is about…',['0.0065 (650 pcm)','0.065 (6,500 pcm)','0.00065 (65 pcm)','0.65 (65,000 pcm)'],0,'β ≈ 0.0065, which is 650 pcm. Fewer than 1 in 100 neutrons are delayed, but they make the reactor controllable.','0.0065'],
  ['sur','Startup rate from period: SUR = ? ÷ τ (with SUR in decades per minute, τ in seconds)',['26.06','2.606','60','0.693'],0,'SUR = 26.06/τ. The 26.06 is 60 ÷ ln 10.','26.06'],
  ['pcm','1 pcm of reactivity is…',['10<sup>−5</sup>','10<sup>−3</sup>','10<sup>−2</sup>','10<sup>−6</sup>'],0,'pcm means "per cent mille": one hundred-thousandth, 10<sup>−5</sup>.','1 pcm = 10'],
  ['mev','One uranium-235 fission releases about…',['200 MeV','2 MeV','20 keV','2,000 MeV'],0,'About 200 MeV per fission, most of it as kinetic energy of the fission fragments.','200 MeV'],
  ['nu','Each U-235 fission releases on average about…',['2.4 neutrons','1 neutron','10 neutrons','0.65 neutrons'],0,'ν ≈ 2.4 neutrons per fission. Only one needs to cause another fission to keep k = 1.','2.4 neutrons per fission'],
  ['fast','Neutrons are born from fission with an energy of about…',['2 MeV','0.025 eV','200 MeV','2 eV'],0,'About 2 MeV (fast). The moderator slows them to thermal energies.','about 2 MeV'],
  ['therm','A thermal neutron has an energy of about…',['0.025 eV','2 MeV','1 keV','200 MeV'],0,'About 0.025 eV, which is around 2200 m/s.','0.025 eV'],
  ['p155','A PWR keeps its primary coolant at a pressure of about…',['155 bar','15 bar','1,550 bar','1 bar'],0,'About 155 bar, so the water stays liquid at over 300 °C.','155 bar'],
  ['nat','Natural uranium is about how much uranium-235?',['0.7%','3–5%','20%','90%'],0,'About 0.7%. The rest is almost all U-238.','About 0.7%'],
  ['enr','PWR fuel is enriched to about…',['3–5% U-235','0.7% U-235','20% U-235','90% U-235'],0,'About 3–5% uranium-235.','3–5%'],
  ['dh','Straight after a reactor shuts down, decay heat is about…',['6–7% of full power','0.1% of full power','50% of full power','zero'],0,'About 6–7%, falling to around 1% within a few hours. That\'s why cooling must keep going.','decay heat is about 6–7%'],
  ['ln2','Half-life from the decay constant: T<sub>½</sub> = ? ÷ λ',['0.693 (ln 2)','2.718 (e)','0.5','1.44'],0,'T<sub>½</sub> = ln 2 / λ ≈ 0.693/λ.','0.693'],
  ['i135','Iodine-135 has a half-life of about…',['6.6 hours','9.1 hours','8 days','30 years'],0,'I-135: 6.6 h. It decays into xenon-135.','6.6 h'],
  ['x135','Xenon-135 has a half-life of about…',['9.1 hours','6.6 hours','2 minutes','24,000 years'],0,'Xe-135: 9.1 h. Iodine-135 (6.6 h) feeds it, which is why xenon peaks after a shutdown.','9.1 h'],
  ['avo','Avogadro\'s number is about…',['6.02 × 10<sup>23</sup> per mole','3.00 × 10<sup>8</sup> per mole','1.6 × 10<sup>−19</sup> per mole','9.81 per mole'],0,'6.022 × 10<sup>23</sup> particles per mole.','6.022']];
 function mem(){if(!S.mem||typeof S.mem!=='object')S.mem={};return S.mem}
 function dayAdd(n){var d=new Date();d.setDate(d.getDate()+n);return dstr(d)}
 var keyMap=null;function keyLessons(){if(keyMap)return keyMap;keyMap={};KEY.forEach(function(k){keyMap[k[0]]=[]});UNITS.forEach(function(u,ui){u.lessons.forEach(function(l){var txt='';try{txt=JSON.stringify(l.cards)}catch(e){}KEY.forEach(function(k){if(txt.indexOf(k[5])>=0)keyMap[k[0]].push([l.id,ui])})})});return keyMap}
 function keyCard(k){var c=Q(k[1],k[2],k[3],k[4]);c._key='K:'+k[0];c._src='Key number';c._mem=1;return c}
 /* everything you could be reminded about: done lessons' questions + unlocked key numbers */
 var poolC=null;
 function pool(){if(poolC&&Date.now()-poolC.t<3000)return poolC.v;var o=[];
  UNITS.forEach(function(u,ui){var lv=lvOf(ui),tr=trk(ui);u.lessons.forEach(function(l){if(!S.done[l.id])return;l.cards.forEach(function(c,ci){if(c.t==='Q'||c.t==='N'||c.t==='O')o.push({c:c,k:l.id+'#'+ci,lid:l.id,ui:ui,lv:lv,tr:tr,src:u.title+' · '+l.title})})})});
  var km=keyLessons();KEY.forEach(function(k){var ls=km[k[0]],d=ls.filter(function(x){return S.done[x[0]]})[0];if(d)o.push({c:null,kk:k,k:'K:'+k[0],lid:'K',ui:d[1],lv:lvOf(d[1]),tr:trk(d[1]),src:'Key number',key:1})});
  poolC={t:Date.now(),v:o};return o}
 function due(){var M=mem(),t=today();return pool().filter(function(x){var e=M[x.k];return e&&e[1]<=t})}
 function card(x){if(x.key)return keyCard(x.kk);var c=Object.assign({},x.c);c._key=x.k;c._src=x.src;c._mem=1;return c}
 function rank(x,ctx){var M=mem(),e=M[x.k],t=today(),s=0;
  if(e&&e[1]<=t)s+=100+Math.min(60,daysBetween(e[1],t)*4);else if(!e)s+=x.key?70:30;else return -1;
  if(ctx){if(x.lid===ctx.lid)return -1;if(x.lv<ctx.lv)s+=40;else if(x.lv===ctx.lv&&x.ui!==ctx.ui)s+=15;else if(x.ui===ctx.ui)s-=20;if(x.tr===ctx.tr)s+=10}
  if(S.wrong&&S.wrong[x.k])s+=25;return s+Math.random()*12}
 function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5)}
 function pick(n,ctx){var c=pool().map(function(x){return [rank(x,ctx),x]}).filter(function(r){return r[0]>=0}).sort(function(a,b){return b[0]-a[0]}),o=[],seen={};
  for(var i=0;i<c.length&&o.length<n;i++){var x=c[i][1];if(seen[x.lid]&&x.lid!=='K')continue;seen[x.lid]=1;o.push(x)}return o}
 /* record an answer: right first time moves it up a box, wrong sends it back to box 0 */
 function seen(k,ok){if(!k)return;var M=mem(),e=M[k],t=today();if(!ok){M[k]=[0,dayAdd(INT[0])];return}
  if(!e){M[k]=[1,dayAdd(INT[1])];return}if(e[1]>t&&e[0]>0)return;var b=Math.min(INT.length-1,(e[0]||0)+1);M[k]=[b,dayAdd(INT[b])]}
 var wrongNow={};
 var gw=gotWrong;gotWrong=function(c){var r=gw.apply(this,arguments);try{if(P&&'QNO'.indexOf(c.t)>=0){var k=cardKey(c);if(k){wrongNow[k]=1;seen(k,false);save()}}}catch(e){}return r};
 var gr=gotRight;gotRight=function(c){var r=gr.apply(this,arguments);try{if(P&&c&&'QNO'.indexOf(c.t)>=0){var k=cardKey(c);if(k&&!wrongNow[k]){seen(k,true);save()}if(c._mem&&!wrongNow[k])setTimeout(function(){try{var b=(mem()[k]||[0])[0];toast('🧠','Remembered!','Next reminder in '+INT[b]+' day'+(INT[b]>1?'s':''),'')}catch(e){}},300)}}catch(e){}return r};
 /* old questions at the end of new lessons */
 var sl=startLesson;startLesson=function(ui,li){var r=sl.apply(this,arguments);try{wrongNow={};var u=UNITS[ui],l=u.lessons[li];
   if(P&&P.mode==='lesson'&&P.cards===l.cards&&S.mem_off!==1&&Object.keys(S.done||{}).length>=3){var ps=pick(2,{lid:l.id,ui:ui,lv:lvOf(ui),tr:trk(ui)});
    if(ps.length){P.cards=l.cards.concat([T('<div class="memhd"><span>🧠</span><div><h3>Remember this?</h3><p>'+(ps.length>1?'Two quick questions':'One quick question')+' from things you learnt before, so they don\'t slip away. Get '+(ps.length>1?'them':'it')+' right and '+(ps.length>1?'they come':'it comes')+' back less often.</p></div></div>')],ps.map(card));P.memN=ps.length}}}catch(e){}return r};
 var sr=startReview;startReview=function(){wrongNow={};return sr.apply(this,arguments)};
 function start(){var d=due(),ps=pick(Math.max(8,Math.min(12,d.length)),null);if(!ps.length){toast('🧠','Nothing to refresh yet','Finish a few lessons first','');return}wrongNow={};
  P={mode:'review',fix:false,mem:true,cards:shuffle(ps.map(card)),i:0,xp:0,right:0,asked:0,title:'Memory refresh',color:'#9b5de5',unit:'Memory refresh',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}
 function counts(){var M=mem(),t=today(),p=pool(),d=0,strong=0,seenN=0;p.forEach(function(x){var e=M[x.k];if(e){seenN++;if(e[1]<=t)d++;if(e[0]>=3)strong++}});return {due:d,strong:strong,seen:seenN,total:p.length,fresh:p.filter(function(x){return !M[x.k]}).length}}
 /* learn page card */
 function cardEl(){var el=$('page-learn');if(!el||popen2())return;var old=document.getElementById('memCard');if(old)old.remove();var n=counts();if(!n.total)return;
  var c=document.createElement('section');c.id='memCard';c.className='card memcard';var go=n.due||n.fresh;
  c.innerHTML='<div class="memrow"><span class="memic">🧠</span><div class="memtx"><b>'+(n.due?'Memory refresh: '+n.due+' due':'Memory refresh')+'</b><span>'+(n.due?'Things you learnt before, just before you forget them. About '+Math.max(2,Math.round(Math.min(12,Math.max(8,n.due))*0.3))+' minutes.':n.fresh?'You\'re up to date. Warm up with questions from older lessons.':'All caught up. Next reminders tomorrow.')+'</span><span class="memmeter" aria-label="'+n.strong+' of '+n.total+' things learnt well"><i style="width:'+Math.round(n.strong/Math.max(1,n.total)*100)+'%"></i></span><em>'+n.strong+' of '+n.total+' remembered well</em></div><div class="membtns"><button type="button" class="xbtn" id="memGo"'+(go?'':' disabled')+'>'+(n.due?'Start':'Warm up')+'</button><button type="button" class="xbtn alt" id="memKeys">🔢 Key numbers</button></div></div>';
  var at=document.getElementById('motCard')||el.querySelector('.hero');if(at&&at.parentNode)at.parentNode.insertBefore(c,at.nextSibling);else el.insertBefore(c,el.firstChild);
  c.querySelector('#memGo').onclick=start;c.querySelector('#memKeys').onclick=keys}
 function popen2(){var p=$('player');return !!(p&&p.classList.contains('open'))}
 /* key numbers sheet: tap to reveal, see how well each is remembered */
 function keys(){var M=mem(),km=keyLessons(),ov=document.createElement('div');ov.className='xov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Key numbers');
  var rows=KEY.map(function(k){var un=km[k[0]].some(function(x){return S.done[x[0]]}),e=M['K:'+k[0]],b=e?e[0]:-1;
   return '<div class="memk'+(un?'':' lock')+'"><div class="memq">'+k[1].replace(/…$/,'')+'</div>'+(un?'<button type="button" class="memrev" aria-expanded="false"><span class="memhide">Tap to reveal</span><span class="memans" hidden>'+k[2][k[3]]+'</span></button><div class="memst" title="'+(b<0?'Not tested yet':'Box '+(b+1)+' of 6')+'">'+[0,1,2,3,4,5].map(function(i){return '<i'+(i<=b?' class="on"':'')+'></i>'}).join('')+'</div>':'<span class="note">Unlocks when you reach that lesson</span>')+'</div>'}).join('');
  ov.innerHTML='<div class="xin" style="max-width:760px;width:100%"><div class="xtop"><b>🔢 Key numbers</b><button type="button" class="xclose">Close</button></div><p class="note" style="margin:0 0 10px">The numbers worth knowing by heart. Try to say each one before you reveal it. The bars show how well you\'ve remembered it in quizzes.</p><div class="memks">'+rows+'</div><div class="xbtns" style="margin-top:12px"><button type="button" class="xbtn" id="memKQ">Quiz me on these</button></div></div>';
  document.body.appendChild(ov);document.body.classList.add('noscroll');
  function close(){ov.remove();if(!popen2()&&!document.querySelector('.xov'))document.body.classList.remove('noscroll');document.removeEventListener('keydown',ek)}function ek(e){if(e.key==='Escape')close()}document.addEventListener('keydown',ek);
  ov.querySelector('.xclose').onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close()});
  [].forEach.call(ov.querySelectorAll('.memrev'),function(b){b.onclick=function(){var a=b.querySelector('.memans'),h=b.querySelector('.memhide'),o=a.hidden;a.hidden=!o;h.hidden=o;b.setAttribute('aria-expanded',String(o))}});
  ov.querySelector('#memKQ').onclick=function(){var ks=KEY.filter(function(k){return km[k[0]].some(function(x){return S.done[x[0]]})});if(!ks.length){toast('🔢','No key numbers yet','They unlock as you do the lessons','');return}close();wrongNow={};
   P={mode:'review',fix:false,mem:true,cards:shuffle(ks.map(keyCard)).slice(0,10),i:0,xp:0,right:0,asked:0,title:'Key numbers',color:'#9b5de5',unit:'Key numbers',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()}}
 var shc=showCard;showCard=function(){var r=shc.apply(this,arguments);try{var c=P&&P.cards&&P.cards[P.i],k=document.querySelector('#pBody .pkick');if(c&&c._mem&&k&&P.mode==='lesson'){k.textContent='🧠 Remember this? · '+c._src;k.style.color='#9b5de5'}}catch(e){}return r};
 var rl=renderLearn;renderLearn=function(){var o=rl.apply(this,arguments);try{cardEl()}catch(e){}return o};
 var css=document.createElement('style');css.textContent='.memcard{padding:12px 14px!important}.memrow{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.memic{font-size:28px;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,#9b5de5 18%,var(--panel));flex:none}.memtx{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px}.memtx b{font-size:16px}.memtx>span:not(.memmeter){font-size:13.5px;color:var(--muted)}.memtx em{font-style:normal;font-size:12px;color:var(--muted);font-weight:700}.memmeter{display:block;height:6px;border-radius:4px;background:var(--soft2,var(--line));overflow:hidden;margin-top:4px;max-width:320px}.memmeter i{display:block;height:100%;background:linear-gradient(90deg,#9b5de5,#3ad4ff)}.membtns{display:flex;gap:8px;flex-wrap:wrap}'+
  '.memhd{display:flex;gap:14px;align-items:flex-start;border:2px solid #9b5de5;border-radius:16px;padding:14px 16px;background:color-mix(in srgb,#9b5de5 10%,transparent)}.memhd>span{font-size:34px;line-height:1}.memhd h3{margin:0 0 4px}.memhd p{margin:0}'+
  '.memks{display:grid;gap:8px}.memk{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px}.memk.lock{opacity:.55}.memq{font-size:14px}.memrev{font:inherit;font-weight:800;border:1.5px dashed var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:6px 12px;cursor:pointer;min-width:120px}.memrev[aria-expanded=true]{border-style:solid;border-color:#9b5de5;color:#9b5de5}.memhide{color:var(--muted);font-weight:700;font-size:13px}.memst{display:flex;gap:3px}.memst i{width:7px;height:16px;border-radius:3px;background:var(--soft2,var(--line))}.memst i.on{background:#9b5de5}@media(max-width:560px){.memk{grid-template-columns:1fr auto}.memq{grid-column:1/-1}}';document.head.appendChild(css);
 return {start:start,due:due,counts:counts,pick:pick,keys:keys,seen:seen,KEY:KEY}})();
try{window.MEM=MEM}catch(e){}
/* ===== memory end ===== */
