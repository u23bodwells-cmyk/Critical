/* ===== scientific calculator (button next to ?) ===== */
var CALC=(function(){
 var deg=true,expr='',ans=0,hist=[],justEq=false;
 /* safe parser: no eval */
 function parse(src){var s=src.replace(/\s+/g,''),i=0;
  function peek(){return s[i]}function eat(c){if(s.substr(i,c.length)===c){i+=c.length;return true}return false}
  function num(){var m=/^(\d+\.?\d*|\.\d+)(E[-−]?\d+)?/.exec(s.slice(i));if(!m)return null;i+=m[0].length;return parseFloat(m[0].replace('−','-'))}
  var F={'sin(':function(x){return Math.sin(deg?x*Math.PI/180:x)},'cos(':function(x){return Math.cos(deg?x*Math.PI/180:x)},'tan(':function(x){return Math.tan(deg?x*Math.PI/180:x)},
   'asin(':function(x){var r=Math.asin(x);return deg?r*180/Math.PI:r},'acos(':function(x){var r=Math.acos(x);return deg?r*180/Math.PI:r},'atan(':function(x){var r=Math.atan(x);return deg?r*180/Math.PI:r},
   'ln(':Math.log,'log(':Math.log10,'√(':Math.sqrt,'exp(':Math.exp};
  function primary(){var n=num();if(n!==null)return n;
   if(eat('π'))return Math.PI;if(eat('Ans'))return ans;if(eat('e'))return Math.E;
   for(var k in F)if(eat(k)){var v=expr0();eat(')');return F[k](v)}
   if(eat('(')){var v=expr0();eat(')');return v}
   throw 'syntax'}
  function postfix(){var v=primary();for(;;){if(eat('²'))v=v*v;else if(eat('!')){if(v<0||v>170||v%1)throw 'math';var r=1;for(var k=2;k<=v;k++)r*=k;v=r}else break}return v}
  function unary(){if(eat('−')||eat('-'))return -unary();if(eat('+'))return unary();return power()}
  function power(){var b=postfix();if(eat('^'))return Math.pow(b,unary());return b}
  function term(){var v=unary();for(;;){if(eat('×')||eat('*'))v*=unary();else if(eat('÷')||eat('/'))v/=unary();else if(i<s.length&&/[\d.(πe√sctalA]/.test(peek())&&!/^E/.test(s.slice(i)))v*=unary();else break}return v}
  function expr0(){var v=term();for(;;){if(eat('+'))v+=term();else if(s[i]==='−'||s[i]==='-'){i++;v-=term()}else break}return v}
  var v=expr0();if(i<s.length)throw 'syntax';return v}
 function fmt(v){if(!isFinite(v))return v!==v?'Error':'∞';if(v===0)return '0';var a=Math.abs(v);
  if(a>=1e10||a<1e-6){var e=Math.floor(Math.log10(a)),m=v/Math.pow(10,e);if(Math.abs(m)>=9.9999999995){m/=10;e++}return (+m.toPrecision(8))+' × 10<sup>'+(e<0?'−'+(-e):e)+'</sup>'}
  return String(+v.toPrecision(10)).replace('-','−')}
 function plain(v){var a=Math.abs(v);if(a!==0&&(a>=1e10||a<1e-6))return v.toExponential(6).replace(/\.?0+e/,'e').replace('e+','e');return String(+v.toPrecision(10))}
 /* UI */
 var css=document.createElement('style');css.textContent=
 '.calcsheet{position:fixed;inset:0;z-index:3001;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}.calcsheet.open{display:flex}@media(min-width:700px){.calcsheet{align-items:center}}'+
 '.calcbox{width:100%;max-width:420px;background:var(--panel);color:var(--text);border-radius:20px 20px 0 0;padding:14px 14px calc(12px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25)}@media(min-width:700px){.calcbox{border-radius:20px}}'+
 '.calchd{display:flex;align-items:center;gap:8px;margin-bottom:8px}.calchd b{flex:1;font-size:18px}.calcmode{font:inherit;font-size:13px;font-weight:800;border:2px solid var(--line);background:var(--bg);color:var(--accent);border-radius:999px;padding:5px 11px;cursor:pointer}.calcx{border:0;background:none;color:var(--muted);font-size:22px;width:40px;height:40px;cursor:pointer}'+
 '.calcscr{background:var(--bg);border:2px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:8px;text-align:right;min-height:78px;overflow:hidden}.calcexp{font-family:var(--mono);font-size:17px;color:var(--muted);word-break:break-all;min-height:22px}.calcres{font-family:var(--mono);font-size:28px;font-weight:700;margin-top:4px;word-break:break-all}.calcres.err{color:var(--bad,#c33);font-size:20px}'+
 '.calcuse{display:flex;gap:6px;margin-bottom:8px}.calcuse button{flex:1;font:inherit;font-size:14px;font-weight:700;border-radius:12px;padding:8px;cursor:pointer;border:0;background:var(--accent);color:var(--on-accent)}.calcuse button.alt{background:var(--soft);color:var(--text)}.calcuse button:disabled{opacity:.4}'+
 '.calcgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.calcgrid button{font:inherit;font-size:17px;font-weight:600;height:46px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--text);cursor:pointer;padding:0}.calcgrid button:active{transform:scale(.95)}'+
 '.calcgrid .fn{font-size:14px;background:var(--soft);color:var(--text)}.calcgrid .op{background:var(--accent-bg,var(--soft));color:var(--accent);font-size:20px}.calcgrid .eq{background:var(--accent);color:var(--on-accent);font-size:22px}.calcgrid .clr{color:var(--bad,#c33)}.calchist{font-size:12px;color:var(--muted);margin-top:8px;text-align:right;font-family:var(--mono)}'+
 '.calcpill{font-size:16px}';document.head.appendChild(css);
 var K=[['sin','sin(','fn'],['cos','cos(','fn'],['tan','tan(','fn'],['ln','ln(','fn'],['log','log(','fn'],
  ['x²','²','fn'],['xʸ','^','fn'],['√','√(','fn'],['eˣ','e^(','fn'],['×10ˣ','E','fn'],
  ['(','(','fn'],[')',')','fn'],['π','π','fn'],['e','e','fn'],['Ans','Ans','fn'],
  ['7','7'],['8','8'],['9','9'],['DEL','DEL','clr'],['AC','AC','clr'],
  ['4','4'],['5','5'],['6','6'],['×','×','op'],['÷','÷','op'],
  ['1','1'],['2','2'],['3','3'],['+','+','op'],['−','−','op'],
  ['0','0'],['.','.'],['(−)','−'],['n!','!','fn'],['=','=','eq']];
 var sh=document.createElement('div');sh.className='calcsheet';
 sh.innerHTML='<div class="calcbox" role="dialog" aria-modal="true" aria-label="Calculator"><div class="calchd"><b>Calculator</b><button class="calcmode" type="button" title="Angle unit">DEG</button><button class="calcx" type="button" aria-label="Close">✕</button></div><div class="calcscr"><div class="calcexp"></div><div class="calcres">0</div></div><div class="calcuse"><button type="button" class="alt" data-u="inv">2nd: sin⁻¹ cos⁻¹ tan⁻¹</button><button type="button" data-u="use">Use answer ↵</button></div><div class="calcgrid">'+K.map(function(k,i){return '<button type="button" class="'+(k[2]||'')+'" data-i="'+i+'">'+k[0]+'</button>'}).join('')+'</div><div class="calchist"></div></div>';
 document.body.appendChild(sh);
 var exEl=sh.querySelector('.calcexp'),resEl=sh.querySelector('.calcres'),useB=sh.querySelector('[data-u=use]'),invB=sh.querySelector('[data-u=inv]'),histEl=sh.querySelector('.calchist'),modeB=sh.querySelector('.calcmode'),inv=false,target=null,last=null;
 function preview(){if(useB)updUse();exEl.textContent=expr||' ';if(!expr){resEl.innerHTML=justEq?fmt(ans):'0';resEl.className='calcres';return}try{var v=parse(expr);resEl.innerHTML=isFinite(v)?'= '+fmt(v):'…';resEl.className='calcres'}catch(_){resEl.innerHTML='…';resEl.className='calcres'}}
 function equals(){if(!expr)return;try{var v=parse(expr);if(!isFinite(v)||v!==v)throw 'math';hist.unshift(expr+' = '+plain(v));hist=hist.slice(0,3);ans=v;last=v;justEq=true;exEl.textContent=expr+' =';resEl.innerHTML=fmt(v);resEl.className='calcres';expr='';histEl.textContent=hist.slice(1).join('   ·   ');updUse()}
  catch(e){resEl.textContent=e==='math'?'Maths error (e.g. ÷ 0 or √ of a negative)':'Check the brackets and signs';resEl.className='calcres err'}}
 function press(k){var t=k[1];
  if(t==='AC'){expr='';justEq=false;last=null;preview();updUse();return}
  if(t==='DEL'){expr=/(sin|cos|tan|asin|acos|atan|ln|log|exp)\($|√\($|Ans$|e\^\($/.test(expr)?expr.replace(/(asin|acos|atan|sin|cos|tan|ln|log|exp)\($|√\($|Ans$|e\^\($/,''):expr.slice(0,-1);preview();return}
  if(t==='='){again();return}
  if(inv&&/^(sin|cos|tan)\($/.test(t)){t='a'+t;inv=false;invB.classList.add('alt');invUpd()}
  if(justEq){justEq=false;if(/^[×÷+^²!E]/.test(t)||t==='−'&&expr==='')expr='Ans'}
  expr+=t;preview()}
 function invUpd(){[].forEach.call(sh.querySelectorAll('.calcgrid button'),function(b){var k=K[+b.dataset.i];if(/^(sin|cos|tan)$/.test(k[0]))b.textContent=inv?k[0]+'⁻¹':k[0]});invB.textContent=inv?'2nd on: tap sin, cos or tan':'2nd: sin⁻¹ cos⁻¹ tan⁻¹';invB.classList.toggle('alt',!inv)}
 invB.onclick=function(){inv=!inv;invUpd()};
 sh.querySelector('.calcgrid').addEventListener('click',function(e){var b=e.target.closest('button');if(b)press(K[+b.dataset.i])});
 modeB.onclick=function(){deg=!deg;modeB.textContent=deg?'DEG':'RAD';preview()};
 function close(){if(!sh.classList.contains('open'))return;sh.classList.remove('open');var b=back;back=null;if(sh.contains(document.activeElement))try{document.activeElement.blur()}catch(_){}
  if(b&&document.body.contains(b)&&!b.disabled&&b.getClientRects().length)try{b.focus({preventScroll:true})}catch(_){}}
 sh.querySelector('.calcx').onclick=close;sh.addEventListener('click',function(e){if(e.target===sh)close()});
 function findTarget(){var i=document.querySelector('#player.open #pBody input.numin:not([disabled])')||document.querySelector('.arn .arnum input:not([disabled])');return i||null}
 function updUse(){target=findTarget();useB.disabled=!(target&&last!==null);useB.textContent=!target?'Use answer (open a question first)':justEq&&!expr&&last!==null?'Use answer: press = again':'Use answer ↵'}
 /* = (or Enter) straight after an answer puts that answer into the question, like Use answer */
 function again(){if(!expr&&justEq&&last!==null){updUse();if(target){useB.click();return}}equals()}
 useB.onclick=function(){if(!target||last===null)return;target.value=plain(last);target.dispatchEvent(new Event('input',{bubbles:true}));back=null;close();try{target.focus({preventScroll:true})}catch(_){}};
 /* while the calculator is open it gets every key first and nothing reaches the box or page behind it */
 window.addEventListener('keydown',function(e){if(!sh.classList.contains('open'))return;var k=e.key,map={'*':'×','/':'÷','-':'−','x':'×'};
  if(e.ctrlKey||e.metaKey||e.altKey){if(/^[0-9.+()^!*\/x=-]$/.test(k)||k==='Backspace'||k==='Enter')e.preventDefault();e.stopPropagation();return}
  e.stopPropagation();if(k==='Tab')return;
  if(k==='Escape'){e.preventDefault();close();return}if((k==='t'||k==='T')&&!e.repeat&&!e.isComposing){e.preventDefault();close();return}
  if(k==='Enter'||k==='='){e.preventDefault();again();return}if(k==='Backspace'){e.preventDefault();press(['','DEL']);return}
  if(/^[0-9.+()^!]$/.test(k)){press(['',k]);e.preventDefault()}else if(map[k]){press(['',map[k]]);e.preventDefault()}
  else if(k.length===1||k==='Delete'||k==='Enter'||k===' ')e.preventDefault()},true);
 /* opening it takes you out of whatever box you were typing in; closing it puts you back there */
 var cbox=sh.querySelector('.calcbox'),back=null;cbox.setAttribute('tabindex','-1');cbox.style.outline='none';
 function open(){var a=document.activeElement;back=a&&a!==document.body&&!sh.contains(a)?a:null;if(back)try{back.blur()}catch(_){}updUse();preview();sh.classList.add('open');try{cbox.focus({preventScroll:true})}catch(_){}}
 /* T opens (and closes) the calculator, but not while you're typing in a box (Shift+T works there), or over another window */
 function typing(n){if(!n||n===document.body||n===document.documentElement)return false;if(n.isContentEditable)return true;var tg=n.tagName;if(tg==='TEXTAREA'||tg==='SELECT')return true;if(tg!=='INPUT')return false;return !/^(button|checkbox|radio|range|submit|reset|color|file|image)$/i.test(n.type||'text')}
 function busy(){var ds=document.querySelectorAll('[role=dialog],.shmod,.wiov');for(var i=0;i<ds.length;i++){var d=ds[i];if(d.id==='player'||d.classList.contains('calcbox'))continue;if(d.getClientRects().length&&getComputedStyle(d).visibility!=='hidden')return true}return false}
 document.addEventListener('keydown',function(e){if(e.key!=='t'&&e.key!=='T')return;if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat||e.defaultPrevented)return;
  var tn=typing(e.target)?e.target:typing(document.activeElement)?document.activeElement:null;
  /* while you're typing, Shift+T still opens it in answer, number and search boxes (answers ignore capitals);
     in boxes for sentences, names or keys, Shift+T just types a capital T */
  if(tn&&!(e.shiftKey&&tn.tagName==='INPUT'&&(tn.type==='number'||tn.closest('#pBody')||/(^|\s)(numin|tyin|search)(\s|$)/.test(tn.className))))return;
  if(sh.classList.contains('open'))return;
  if(busy())return;e.preventDefault();open()});
 function mk(cls,label){var b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="4" rx="1"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/></svg>';b.title='Calculator (T, or Shift+T while typing)';b.setAttribute('aria-label',label);b.onclick=open;return b}
 var hq=document.querySelector('.hdr .askpill');if(hq)hq.parentNode.insertBefore(mk('pill calcpill','Open calculator'),hq.nextSibling);
 var lq=document.querySelector('.pask');if(lq)lq.parentNode.insertBefore(mk('psnd pcalc','Open calculator'),lq.nextSibling);
 return {parse:parse,open:open,close:close,set:function(x){expr=x;preview()},eq:equals,last:function(){return last},deg:function(d){deg=d;modeB.textContent=d?'DEG':'RAD'}};
})();
window.CALC=CALC;
(function(){var c=document.createElement('style');c.textContent='@media(max-width:374px){.hdr .pills{gap:4px}.hdr .pill{padding:5px 8px}.hdr .askpill,.hdr .calcpill{padding:5px 7px}}@media(max-width:340px){.hdr .brand span{display:none}}';document.head.appendChild(c)})();

