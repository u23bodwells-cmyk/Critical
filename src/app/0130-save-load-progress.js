/* ---------- save / load progress between devices ---------- */
var SAVE_PREFIX='CRITICAL-SAVE-1:';
function cleanState(s){
 if(!s||typeof s!=='object')return null;
 var ids={};UNITS.forEach(function(u){u.lessons.forEach(function(l){ids[l.id]=1})});
 var mids={};(typeof MISSIONS!=='undefined'?MISSIONS:[]).forEach(function(m){mids[m.id]=1});
 var o={xp:0,done:{},streak:0,last:'',daily:{d:'',xp:0},missions:{},goal:50};
 if(typeof s.xp==='number'&&isFinite(s.xp))o.xp=Math.max(0,Math.min(1e7,Math.round(s.xp)));else return null;
 if(!s.done||typeof s.done!=='object')return null;
 for(var k in s.done)if(ids[k]&&s.done[k])o.done[k]=true;
 if(s.missions&&typeof s.missions==='object')for(var m in s.missions)if(mids[m]&&s.missions[m])o.missions[m]=true;
 if(typeof s.streak==='number'&&isFinite(s.streak))o.streak=Math.max(0,Math.min(10000,Math.round(s.streak)));
 var dre=/^\d{4}-\d{1,2}-\d{1,2}$/;
 if(typeof s.last==='string'&&dre.test(s.last))o.last=s.last;
 if(s.daily&&typeof s.daily.d==='string'&&dre.test(s.daily.d)&&typeof s.daily.xp==='number'&&isFinite(s.daily.xp))o.daily={d:s.daily.d,xp:Math.max(0,Math.round(s.daily.xp))};
 if(typeof s.goal==='number'&&s.goal>=10&&s.goal<=1000)o.goal=Math.round(s.goal);
 if(typeof s.backup==='string'&&dre.test(s.backup))o.backup=s.backup;
 function num(v,lo,hi){return typeof v==='number'&&isFinite(v)?Math.max(lo,Math.min(hi,Math.round(v))):null}
 o.hist={};if(s.hist&&typeof s.hist==='object')for(var hk in s.hist){var hv=num(s.hist[hk],0,1e6);if(dre.test(hk)&&hv!==null)o.hist[hk]=hv}
 o.badges={};if(s.badges&&typeof s.badges==='object')for(var bk in s.badges)if(/^[a-z0-9]{1,12}$/.test(bk)&&typeof s.badges[bk]==='string'&&dre.test(s.badges[bk]))o.badges[bk]=s.badges[bk];
 o.freeze=num(s.freeze,0,2)||0;o.sound=s.sound!==false;
 o.st={};['perfect','best','reviews','fixed','chests','right','maxStreak','fuFixed'].forEach(function(sk){o.st[sk]=s.st?num(s.st[sk],0,1e7)||0:0});
 o.wrong={};if(s.wrong&&typeof s.wrong==='object')for(var wk in s.wrong){var mt=/^F?([a-z0-9-]+)#(\d{1,3})$/.exec(wk);if(mt&&ids[mt[1]]&&s.wrong[wk])o.wrong[wk]=1}
 o.quests=null;var q=s.quests;if(q&&typeof q.d==='string'&&dre.test(q.d)&&Array.isArray(q.list)&&q.list.length<=3&&q.list.every(function(it){return it&&QDEF[it.k]&&num(it.n,1,1e5)&&num(it.p,0,1e5)!==null})){o.quests={d:q.d,chest:!!q.chest,list:q.list.map(function(it){return {k:it.k,n:num(it.n,1,1e5),p:Math.min(num(it.p,0,1e5),num(it.n,1,1e5)),done:!!it.done}})}}
 o.fu={};if(s.fu&&typeof s.fu==='object')for(var fk in s.fu){var fv=s.fu[fk];if(ids[fk]&&fv&&typeof fv==='object'){var r={need:!!fv.need,n:num(fv.n,0,1e5)||0,best:num(fv.best,0,100)||0};var lv=num(fv.last,0,100);if(lv!==null)r.last=lv;o.fu[fk]=r}}
 KEEP_FIELDS.forEach(function(k){var v=s[k];if(v!==undefined&&v!==null&&/^(object|string|number|boolean)$/.test(typeof v)){try{o[k]=JSON.parse(JSON.stringify(v))}catch(e){}}});
 var uids={};UNITS.forEach(function(u){uids[u.id]=1});o.tests={};if(s.tests&&typeof s.tests==='object')for(var tk in s.tests){var tv=s.tests[tk];if(uids[tk]&&tv&&typeof tv==='object')o.tests[tk]={best:num(tv.best,0,100)||0,passed:!!tv.passed,n:num(tv.n,0,1e5)||0,last:(typeof tv.last==='string'&&dre.test(tv.last))?tv.last:'',lastPct:num(tv.lastPct,0,100)||0}}
 return o}
var KEEP_FIELDS=['mode','gsub','lvl','lvlOpen','lvtests','seenGcse','seenCalc','seenTheory','plView','exam','plan','habits','dayplan','lacc','hardOff','dayNudge','qsets','lday','pdays','rw','shift','mys'];
var EXTRA_KEYS={plant:'critical_plant',pslots:'critical_plant_slots',study:'critical_study',shift:'shift-ready-v1',apt:'aptitude-v1',notes:'critical_notes',act:'critical_act',loot:'critical_loot',arena:'critical_arena',lx:'critical_lx'};
function readExtras(){var o={};for(var k in EXTRA_KEYS){try{var v=JSON.parse(localStorage.getItem(EXTRA_KEYS[k])||'null');if(v&&typeof v==='object')o[k]=v}catch(e){}}if(o.study)o.study=Object.assign({},o.study,{run:null});return o}
function writeExtras(x){if(!x)return;for(var k in EXTRA_KEYS)if(x[k]&&typeof x[k]==='object'){var v=x[k];
  /* the running study timer belongs to this device: keep it whatever comes in from sync */
  if(k==='study'){try{var cur=JSON.parse(localStorage.getItem(EXTRA_KEYS.study)||'null');v=Object.assign({},v,{run:cur&&cur.run?cur.run:null})}catch(e){}}
  try{localStorage.setItem(EXTRA_KEYS[k],JSON.stringify(v))}catch(e){}}
 try{if(typeof STUDY!=='undefined'&&STUDY.refresh)STUDY.refresh()}catch(e){}try{if(typeof MOT!=='undefined'&&MOT&&MOT.refresh)MOT.refresh()}catch(e){}}
function packSave(){var th=null;try{th=localStorage.getItem('critical_theme')}catch(e){}
 return {app:'Critical nuclear engineering',format:1,saved:new Date().toISOString(),theme:th,progress:S,extras:readExtras()}}
/* ----- combining two saves (this device + a file from another device) ----- */
function ndate(x){var m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(x||''));return m?m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2):''}
function gmerge(a,b){if(a===undefined||a===null)return b;if(b===undefined||b===null)return a;
 if(Array.isArray(a)&&Array.isArray(b)){var seen={},out=[];a.concat(b).forEach(function(x){var k=JSON.stringify(x);if(!seen[k]){seen[k]=1;out.push(x)}});return out.slice(-500)}
 if(typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){var o={},k;for(k in a)o[k]=(k in b)?gmerge(a[k],b[k]):a[k];for(k in b)if(!(k in a))o[k]=b[k];return o}
 if(typeof a==='number'&&typeof b==='number')return Math.max(a,b);
 if(typeof a==='boolean'&&typeof b==='boolean')return a||b;
 if(typeof a==='string'&&typeof b==='string'){var da=ndate(a),db=ndate(b);if(da&&db)return da>=db?a:b;return a||b}
 return a}
function mergeState(A,B){var o=gmerge(A,B),k,d;
 /* XP: add up each day's XP from both devices (a day with the same XP on both is shared history, so it counts once) */
 var hA=A.hist||{},hB=B.hist||{},Hh={},sA=0,sB=0,sH=0,days={};for(d in hA){sA+=hA[d]||0;days[d]=1}for(d in hB){sB+=hB[d]||0;days[d]=1}
 for(d in days){var a=hA[d]||0,b=hB[d]||0;Hh[d]=a===b?a:a+b;sH+=Hh[d]}
 o.hist=Hh;o.xp=Math.max(0,Math.round(Math.max((A.xp||0)-sA,(B.xp||0)-sB)))+sH;
 o.badges={};[A.badges||{},B.badges||{}].forEach(function(bb){for(var k2 in bb)if(!o.badges[k2]||ndate(bb[k2])<ndate(o.badges[k2]))o.badges[k2]=bb[k2]});
 var la=ndate(A.last),lb=ndate(B.last);o.last=la>=lb?(A.last||''):(B.last||'');var L=ndate(o.last),run=0;
 if(L){var dd=new Date(L+'T12:00:00');while((Hh[dstr(dd)]||0)>0&&run<400){run++;dd.setDate(dd.getDate()-1)}}
 o.streak=Math.max(run,la===L?A.streak||0:0,lb===L?B.streak||0:0);o.daily={d:o.last,xp:Hh[L]||0};
 /* follow-ups: passing one on either device counts */
 o.fu={};var fa=A.fu||{},fb=B.fu||{};for(k in fa)o.fu[k]=fa[k];for(k in fb){var x=fb[k],y=o.fu[k];if(!y){o.fu[k]=x;continue}var r={need:!!(x.need&&y.need),n:Math.max(x.n||0,y.n||0),best:Math.max(x.best||0,y.best||0)},lt=(x.n||0)>(y.n||0)?x.last:y.last;if(lt!=null)r.last=lt;o.fu[k]=r}
 /* habits: a full tick beats a bad-day tick */
 if(A.habits||B.habits){var ha=A.habits||{},hb=B.habits||{},hl={},on=(ha.on||[]).slice();(hb.on||[]).forEach(function(x){if(on.indexOf(x)<0)on.push(x)});
  [ha.log||{},hb.log||{}].forEach(function(Lg){for(var d2 in Lg)for(var id in Lg[d2]){var v=Lg[d2][id];hl[d2]=hl[d2]||{};var c=hl[d2][id];hl[d2][id]=(c===1||v===1)?1:(c||v)}});
  var since={},sa=ha.since||{},sb=hb.since||{};for(k in sa)since[k]=sa[k];for(k in sb)if(!since[k]||sb[k]<since[k])since[k]=sb[k];o.habits={on:on,since:since,log:hl}}
 /* weekly plan: ticks from the same week combine; otherwise keep the newer week */
 if(A.plan&&B.plan&&A.plan.wk!==B.plan.wk)o.plan=ndate(A.plan.wk)>=ndate(B.plan.wk)?A.plan:B.plan;
 /* exams: one entry per paper you sat, keeping the marked score */
 if(A.exam||B.exam){var ea=A.exam||{},eb=B.exam||{},byId={},list=[];(ea.hist||[]).concat(eb.hist||[]).forEach(function(e){if(!e||typeof e!=='object')return;var key=e.id+'|'+e.d;var p=byId[key];if(!p){byId[key]=e;list.push(e)}else if(p.score==null&&e.score!=null){list[list.indexOf(p)]=e;byId[key]=e}});
  list.sort(function(p,q){return String(q.d||'').localeCompare(String(p.d||''))});o.exam=Object.assign({},ea,{cur:ea.cur||eb.cur||null,hist:list.slice(0,40)})}
 /* level-too-hard history: keep the latest few */
 if(A.lacc||B.lacc){o.lacc={};var ka={};for(k in A.lacc||{})ka[k]=1;for(k in B.lacc||{})ka[k]=1;for(k in ka){var arr=gmerge((A.lacc||{})[k]||[],(B.lacc||{})[k]||[]);arr.sort(function(p,q){return p[1]-q[1]});o.lacc[k]=arr.slice(-5)}}
 /* things that belong to this device stay as they are */
 ['mode','gsub','lvl','plView','dayNudge','goal','sound','dayplan','quests','qsets'].forEach(function(f){if(A[f]!==undefined)o[f]=A[f]});
 return o}
function mergeExtras(A,B){A=A||{};B=B||{};var o={};
 /* the simulator: the newest save wins, and each save slot keeps its newest copy */
 /* settings and XP saves used to count as 'newer' and could replace a shift saved on another device, so the shift itself
    (reactor state, log, checklist) now comes from whichever copy saved its shift most recently, and progress keeps the higher XP */
 if(A.plant||B.plant){var pa=A.plant||{},pb=B.plant||{},base=Object.assign({},((pa.at||0)>=(pb.at||0))?pa:pb),sh=((pa.pAt||(pa.p?1:0))>=(pb.pAt||(pb.p?1:0)))?pa:pb;
  ['v','p','pAt','ms','st','log','shiftUsed','cam'].forEach(function(k){if(sh[k]!==undefined)base[k]=sh[k];else delete base[k]});
  if(pa.prog&&pb.prog)base.prog=((pa.prog.xp||0)>=(pb.prog.xp||0))?pa.prog:pb.prog;o.plant=base}
 if(A.pslots||B.pslots){var pa=Array.isArray(A.pslots)?A.pslots:[],pb=Array.isArray(B.pslots)?B.pslots:[];o.pslots=[0,1,2].map(function(i){var a=pa[i],b=pb[i];if(!a)return b||null;if(!b)return a;return ((a.d&&a.d.at)||0)>=((b.d&&b.d.at)||0)?a:b})}
 if(A.study||B.study){var sa=(A.study&&A.study.sessions)||[],sb=(B.study&&B.study.sessions)||[],seen={},ss=[];sa.concat(sb).forEach(function(x){if(!x)return;var k=x.c||JSON.stringify(x);if(seen[k]==null){seen[k]=ss.length;ss.push(x)}else if((+x.m||0)>(+ss[seen[k]].m||0))ss[seen[k]]=x});
  o.study=Object.assign({},B.study||{},A.study||{},{sessions:ss})}
 ['shift','apt'].forEach(function(k){if(A[k]||B[k])o[k]=gmerge(A[k],B[k])});
 /* notes: keep the newest copy of each note, highlight and flashcard (deletes win if they're newer) */
 /* activity log: each device keeps its own counts, so take the bigger number for each device, day and subject */
 if(A.act||B.act){var ad={};[A.act,B.act].forEach(function(X){var d=(X&&X.d)||{};for(var dv in d)for(var dy in d[dv])for(var t in d[dv][dy]){var v=d[dv][dy][t]||[],o2=((ad[dv]=ad[dv]||{})[dy]=ad[dv][dy]||{}),w=o2[t]=o2[t]||[0,0,0];for(var i=0;i<Math.max(3,v.length);i++)w[i]=Math.max(w[i]||0,+v[i]||0)}});o.act={v:1,d:ad}}
 /* rewards: anything unlocked on either device stays unlocked; settings and what you're using follow the newest change */
 if(A.loot||B.loot){var la=A.loot||{},lb=B.loot||{},lo={items:{},season:{},story:{},hhLog:{},pass:{},lvc:[]};[la,lb].forEach(function(X){var k3;for(k3 in X.items||{})if(X.items[k3])lo.items[k3]=1;for(k3 in X.pass||{}){var cp=lo.pass[k3]=lo.pass[k3]||[];(X.pass[k3]||[]).forEach(function(n){if(cp.indexOf(n)<0)cp.push(n)})}(X.lvc||[]).forEach(function(k){if(lo.lvc.indexOf(k)<0)lo.lvc.push(k)});for(k3 in X.hhLog||{})lo.hhLog[k3]=1;for(k3 in X.season||{}){var cur=lo.season[k3]=lo.season[k3]||[];(X.season[k3]||[]).forEach(function(n){if(cur.indexOf(n)<0)cur.push(n)})}});
  var sa2=la.story||{},sb2=lb.story||{},st2=lo.story;st2.start=[sa2.start,sb2.start].filter(Boolean).sort()[0];if(!st2.start)delete st2.start;st2.u=Math.max(+sa2.u||0,+sb2.u||0);st2.read=(sa2.read||[]).slice();(sb2.read||[]).forEach(function(n){if(st2.read.indexOf(n)<0)st2.read.push(n)});st2.ch=Object.assign({},sb2.ch||{},sa2.ch||{});
  ['eq','hh'].forEach(function(f){var x=la[f],y=lb[f];if(x||y)lo[f]=!x?y:!y?x:((+y.at||0)>(+x.at||0)?y:x)});o.loot=lo}
 /* Critical Clash: guns bought on either device stay bought; coins and settings follow the newest change; the best XP and records win */
 if(A.arena||B.arena){var xa=A.arena||{},xb=B.arena||{},nw=(+xb.at||0)>(+xa.at||0)?xb:xa,ol=nw===xa?xb:xa,ar=Object.assign({},ol,nw);ar.owned=[];[xa,xb].forEach(function(X){(X.owned||[]).forEach(function(k){if(ar.owned.indexOf(k)<0)ar.owned.push(k)})});ar.skins=[];[xa,xb].forEach(function(X){(X.skins||[]).forEach(function(k){if(ar.skins.indexOf(k)<0)ar.skins.push(k)})});ar.cxp=Math.max(+xa.cxp||0,+xb.cxp||0);var ra=xa.rec||{},rb=xb.rec||{};ar.rec={played:Math.max(+ra.played||0,+rb.played||0),kills:Math.max(+ra.kills||0,+rb.kills||0),wins:Math.max(+ra.wins||0,+rb.wins||0)};o.arena=ar}
 /* learning extras: newest version of each of your questions, best medal, newest weak-skill schedule, any 'guessed' flag */
 if(A.lx||B.lx){var lxo={myq:{},medal:{},weak:{},conf:{}};[A.lx||{},B.lx||{}].forEach(function(X){var k4;for(k4 in X.myq||{}){var v4=X.myq[k4],c4=lxo.myq[k4];if(v4&&(!c4||(+v4.at||0)>(+c4.at||0)))lxo.myq[k4]=v4}for(k4 in X.medal||{})lxo.medal[k4]=Math.max(lxo.medal[k4]||0,+X.medal[k4]||0);for(k4 in X.weak||{}){var w4=X.weak[k4],cw=lxo.weak[k4];if(w4&&(!cw||(+w4.at||0)>(+cw.at||0)))lxo.weak[k4]=w4}for(k4 in X.conf||{})lxo.conf[k4]=1;for(k4 in X.ghost||{}){var gl=lxo.ghost=lxo.ghost||{},ga=gl[k4]=gl[k4]||[];(X.ghost[k4]||[]).forEach(function(r){if(r&&!ga.some(function(q){return q.at===r.at}))ga.push(r)});ga.sort(function(p,q){return p.at-q.at});if(ga.length>12)ga.splice(1,ga.length-12)}var ee=X.enc;if(ee&&(!lxo.enc||(+ee.f||0)>(+lxo.enc.f||0)||((+ee.f||0)===(+lxo.enc.f||0)&&(+ee.m||0)>(+lxo.enc.m||0))))lxo.enc=ee});o.lx=lxo}
 if(A.notes||B.notes){var ia=(A.notes&&A.notes.items)||{},ib=(B.notes&&B.notes.items)||{},it={};Object.keys(ia).concat(Object.keys(ib)).forEach(function(k){var a=ia[k],b=ib[k];it[k]=!a?b:!b?a:((+b.at||0)>(+a.at||0)?b:a)});o.notes={v:1,items:it}}
 return o}
function saveCode(){var j=JSON.stringify(packSave());return SAVE_PREFIX+btoa(unescape(encodeURIComponent(j)))}
function readSave(text){text=String(text||'').trim();var obj=null;
 try{if(text.indexOf(SAVE_PREFIX)===0)obj=JSON.parse(decodeURIComponent(escape(atob(text.slice(SAVE_PREFIX.length).replace(/\s+/g,'')))));
  else{var a=text.indexOf('{');if(a>=0)obj=JSON.parse(text.slice(a))}}catch(e){return {err:'That doesn\'t look like a Critical save. Check you picked the right file or copied the whole code.'}}
 if(!obj||obj.format!==1||!obj.progress)return {err:'That doesn\'t look like a Critical save. Check you picked the right file or copied the whole code.'};
 var st=cleanState(obj.progress);if(!st)return {err:'This save file is damaged, so nothing was loaded.'};
 return {state:st,theme:(obj.theme==='dark'||obj.theme==='light')?obj.theme:null,saved:obj.saved,extras:(obj.extras&&typeof obj.extras==='object')?obj.extras:null}}
function summary(st){var n=0;for(var k in st.done)n++;var m=0;for(var j in st.missions)m++;
 return '<b>'+st.xp+' XP</b> · '+n+' lesson'+(n===1?'':'s')+' · '+m+' mission'+(m===1?'':'s')}
function niceDate(iso){if(!iso)return 'unknown date';var d=new Date(iso);if(isNaN(d))return 'unknown date';
 return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+' at '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function backupDays(){if(!S.backup)return null;var d=dayDiff(S.backup,today());return isNaN(d)?null:d}
function backupAge(){var d=backupDays();return d===null?'never':d<=0?'today':d===1?'yesterday':d+' days ago'}
function progressBar(){var n=doneCount('all'),d=backupDays(),stale=d===null?n>0:d>=7;
 return '<div class="card savecard" id="saveCard"><div class="savehead"><div class="saveicon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg></div><div><h2>Your progress</h2><p class="note">Saved automatically on this device. To carry on somewhere else, save a progress file and load it on the other device. If both devices have progress, choose Combine and nothing is lost. Last saved to a file: <b'+(stale?' style="color:var(--warn)"':'')+'>'+backupAge()+'</b>.</p></div></div>'+
 '<div class="savebtns"><button class="wbtn pri" id="svFile">Save progress file</button><button class="wbtn" id="ldFile">Load progress file</button><button class="skip" id="svMore">Use a save code instead</button></div>'+
 '<input type="file" id="ldInput" accept=".json,.txt,application/json,text/plain" hidden>'+
 '<div id="svCodeBox" class="savebox" hidden><p class="note" style="margin:0 0 6px">A save code is your progress written as text. Copy it, send it to yourself (email, Google Docs or Classroom), then paste it into the second box on the other device.</p><label class="note" for="svCode">Your save code</label><textarea id="svCode" rows="3" readonly spellcheck="false"></textarea><div class="savebtns"><button class="wbtn" id="svCopy">Copy my save code</button></div><label class="note" for="ldPaste" style="display:block;margin-top:10px">Paste a code from another device</label><textarea id="ldPaste" rows="3" spellcheck="false" placeholder="CRITICAL-SAVE-1:..."></textarea><div class="savebtns"><button class="wbtn" id="ldCode">Load pasted code</button></div></div>'+
 '<div id="ldPreview" class="savebox" hidden></div><p class="wmsg" id="svMsg"></p></div>'}
function wireProgress(){var msgEl=$('svMsg');function say(t,ok){msgEl.className='wmsg'+(ok===true?' ok':ok===false?' no':'');msgEl.innerHTML=t||''}
 $('svFile').onclick=function(){S.backup=today();save();var blob=new Blob([JSON.stringify(packSave(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='critical-progress-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
  renderLearn();var m=$('svMsg');m.className='wmsg ok';m.innerHTML='Saved <b>critical-progress-'+today()+'.json</b> to your Downloads. Move it to Google Drive (or email it to yourself) so you can open it on another device.'};
 $('ldFile').onclick=function(){$('ldInput').value='';$('ldInput').click()};
 $('ldInput').onchange=function(){var f=this.files&&this.files[0];if(!f)return;if(f.size>200000){say('That file is too big to be a Critical save.',false);return}
  var r=new FileReader();r.onload=function(){preview(readSave(r.result))};r.onerror=function(){say('Couldn\'t read that file.',false)};r.readAsText(f)};
 $('svMore').onclick=function(){var b=$('svCodeBox');b.hidden=!b.hidden;if(!b.hidden)$('svCode').value=saveCode()};
 $('svCopy').onclick=function(){var t=$('svCode');t.value=saveCode();t.select();var done=function(){S.backup=today();save();say('Save code copied. Paste it somewhere you can reach from the other device.',true)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t.value).then(done,function(){try{document.execCommand('copy');done()}catch(e){say('Couldn\'t copy automatically. Select the code and press Ctrl+C.',false)}});else{try{document.execCommand('copy');done()}catch(e){say('Select the code and press Ctrl+C.',false)}}};
 $('ldCode').onclick=function(){var v=$('ldPaste').value.trim();if(!v){say('Paste the save code from your other device into the second box first.',false);$('ldPaste').focus();return}preview(readSave(v))};
 function preview(res){var p=$('ldPreview');if(res.err){p.hidden=true;say(res.err,false);return}say('');
  var cur=S,n0=doneCount('all'),n1=0;for(var k in res.state.done)n1++;var less=res.state.xp<cur.xp||n1<n0;
  var merged=mergeState(S,res.state);
  p.hidden=false;p.innerHTML='<div class="cmp"><div><p class="note">In the save (from '+niceDate(res.saved)+')</p><p>'+summary(res.state)+'</p></div><div><p class="note">On this device now</p><p>'+summary(cur)+'</p></div></div>'+
   '<div class="cmbox"><p class="note" style="margin:0">If you combine them</p><p style="margin:2px 0 0">'+summary(merged)+'</p></div>'+
   '<p class="note" style="margin:6px 0">Combine keeps everything from both: lessons, XP, tests, exam scores, habits and study time.'+(res.extras?' Shift Ready and Aptitude Gym progress is combined too.':' This save is from before Shift Ready, Aptitude Gym and study time were included, so only Critical progress is combined.')+' Replace swaps this device\'s progress for the save.</p>'+
   '<div class="savebtns"><button class="wbtn pri" id="ldMix">Combine with this device</button><button class="wbtn" id="ldYes">Replace with the save</button><button class="wbtn" id="ldNo">Cancel</button></div><p class="wmsg no" id="ldWarn" hidden style="margin:6px 0"></p>';
  $('ldNo').onclick=function(){p.hidden=true;p.innerHTML=''};
  function finish(state,extras,msg,theme){S=state;motInit();checkBadges(true);save();if(extras)writeExtras(extras);
   if(theme){document.documentElement.setAttribute('data-theme',theme);try{localStorage.setItem('critical_theme',theme)}catch(e){}}
   try{sessionStorage.setItem('critical_load_msg',msg+': '+summary(S).replace(/<[^>]+>/g,''))}catch(e){}location.reload()}
  $('ldMix').onclick=function(){finish(mergeState(S,res.state),res.extras?mergeExtras(readExtras(),res.extras):null,'Progress combined')};
  var armed=false;$('ldYes').onclick=function(){if(less&&!armed){armed=true;var w=$('ldWarn');w.hidden=false;w.textContent='This save has less progress than this device, so replacing will lose some. Press Replace again if you\'re sure, or use Combine.';this.textContent='Replace anyway';return}
   finish(res.state,res.extras||null,'Progress loaded',res.theme)}}}
try{var LMSG=sessionStorage.getItem('critical_load_msg');if(LMSG){sessionStorage.removeItem('critical_load_msg');setTimeout(function(){try{toast(BOLT,LMSG.split(':')[0],LMSG.slice(LMSG.indexOf(':')+2))}catch(e){}},900)}}catch(e){}

