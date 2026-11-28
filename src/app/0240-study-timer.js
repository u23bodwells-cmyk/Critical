/* ===== study timer + Windows reminders (button next to the calculator) ===== */
var STUDY=(function(){
 var KEY='critical_study',st;
 try{st=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){}
 if(!st||!st.sessions)st={sessions:[],run:null,linked:false};
 function keep(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}}
 function ymd(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function per(){var p={};st.sessions.forEach(function(s){p[s.d]=(p[s.d]||0)+s.m});return p}
 function todayMin(){return per()[ymd()]||0}
 function didToday(){if(todayMin()>0||st.run)return true;try{var t=ymd();if(S.hist&&S.hist[t]>0)return true;if(S.daily&&S.daily.d===t&&S.daily.xp>0)return true;
  var wi=(new Date().getDay()+6)%7;if(S.plan&&S.plan.qs&&S.plan.qs[wi])return true;if(S.plan&&S.plan.t)for(var k in S.plan.t)if(S.plan.t[k]&&k.indexOf(wi+'-')===0)return true}catch(_){}return false}
 function streak(){var p=per(),d=new Date(),n=0;if(!p[ymd(d)])d.setDate(d.getDate()-1);while(p[ymd(d)]){n++;d.setDate(d.getDate()-1)}return n}
 function weekMin(){var mon=new Date();mon.setHours(0,0,0,0);mon.setDate(mon.getDate()-((mon.getDay()+6)%7));var k=ymd(mon);return st.sessions.filter(function(s){return s.d>=k}).reduce(function(a,s){return a+s.m},0)}
 function fmtM(m){return m>=60?Math.floor(m/60)+' h '+(m%60?m%60+' min':''):m+' min'}
 function clock(ms){var s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(function(n){return String(n).padStart(2,'0')}).join(':')}
 var isWin=/Windows/i.test(navigator.userAgent),canFS=!!window.showDirectoryPicker;

 /* ---- the reminder file (Documents\Critical\critical-study.json) ---- */
 function idb(){return new Promise(function(res,rej){var r=indexedDB.open('critical_fs',1);r.onupgradeneeded=function(){r.result.createObjectStore('h')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
 function getH(){return idb().then(function(db){return new Promise(function(res){var q=db.transaction('h').objectStore('h').get('dir');q.onsuccess=function(){res(q.result||null)};q.onerror=function(){res(null)}})}).catch(function(){return null})}
 function putH(h){return idb().then(function(db){return new Promise(function(res){var t=db.transaction('h','readwrite');t.objectStore('h').put(h,'dir');t.oncomplete=function(){res()};t.onerror=function(){res()}})}).catch(function(){})}
 var linkState='none',memH=null;
 function payload(){var p=per(),days=Object.keys(p).sort();return JSON.stringify({lastStudied:didToday()?ymd():days.length?days[days.length-1]:null,todayMinutes:todayMin(),streak:streak(),updated:new Date().toISOString()},null,1)}
 function writeFile(ask){if(!canFS)return Promise.resolve(false);return (memH?Promise.resolve(memH):getH()).then(function(h){if(!h){linkState='none';return false}memH=h;
  return h.queryPermission({mode:'readwrite'}).then(function(p){if(p==='granted')return p;if(ask)return h.requestPermission({mode:'readwrite'});return p}).then(function(p){
   if(p!=='granted'){linkState='lost';return false}
   return h.getFileHandle('critical-study.json',{create:true}).then(function(f){return f.createWritable()}).then(function(w){return w.write(payload()).then(function(){return w.close()})}).then(function(){linkState='ok';return true})})}).catch(function(){linkState='lost';return false}).then(function(r){paintLink();return r})}
 function link(){if(!canFS)return;window.showDirectoryPicker({id:'critical-reminders',mode:'readwrite',startIn:'documents'}).then(function(h){
   if(h.name!=='Critical')note('That folder is called “'+h.name+'”. The reminders look in the folder called Critical inside Documents. Pick that one instead.',true);
   memH=h;return putH(h).then(function(){st.linked=true;keep();return writeFile(true)})}).catch(function(){})}

 /* ---- UI ---- */
 var css=document.createElement('style');css.textContent=
 '.stsheet{position:fixed;inset:0;z-index:3001;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}.stsheet.open{display:flex}@media(min-width:700px){.stsheet{align-items:center}}'+
 '.stbox{width:100%;max-width:560px;max-height:90vh;max-height:90dvh;overflow:auto;background:var(--panel);color:var(--text);border-radius:20px 20px 0 0;padding:14px 16px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px}@media(min-width:700px){.stbox{border-radius:20px}}'+
 '.sthd{display:flex;align-items:center;gap:8px}.sthd b{flex:1;font-size:18px}.stx{border:0;background:none;color:var(--muted);font-size:22px;width:40px;height:40px;cursor:pointer}'+
 '.stro{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.stro div{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:8px 10px}.stro span{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.stro b{font-family:var(--mono);font-size:20px;font-variant-numeric:tabular-nums}'+
 '.stclock{font-family:var(--mono);font-size:44px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:.02em}.stclock.live{color:var(--accent)}'+
 '.strow{display:flex;gap:8px;flex-wrap:wrap}.strow input{flex:1 1 160px;min-width:0;font:inherit;font-size:15px;color:var(--text);background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px}.strow input[type=number]{flex:0 0 90px}'+
 '.stbtn{font:inherit;font-weight:800;font-size:16px;border:0;border-radius:12px;padding:12px 16px;cursor:pointer;background:var(--accent);color:var(--on-accent)}.stbtn.stop{background:var(--bad,#c33);color:#fff}.stbtn.alt{background:var(--soft);color:var(--text);font-size:14px;padding:10px 14px}.stbtn.wide{width:100%}'+
 '.stchart{display:flex;align-items:flex-end;gap:3px;height:80px;border-bottom:1px solid var(--line)}.stchart i{flex:1;min-width:0;background:var(--accent);border-radius:3px 3px 0 0}.stchart i.z{background:var(--line);height:2px!important}.stdays{display:flex;gap:3px;margin-top:3px}.stdays span{flex:1;text-align:center;font-family:var(--mono);font-size:10px;color:var(--muted)}'+
 '.stlab{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.stlist{display:flex;flex-direction:column}.stlist div{display:flex;gap:8px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:14px}.stlist div span:first-child{font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap}.stlist div span:nth-child(2){flex:1;min-width:0}.stlist div b{font-family:var(--mono);font-size:13px;white-space:nowrap}.stlist button{font:inherit;font-size:12px;border:1px solid var(--line);background:none;color:var(--muted);border-radius:8px;padding:3px 8px;cursor:pointer}'+
 '.strem{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:14px}.strem ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px}.strem a{color:var(--accent);font-weight:800}.stok{color:var(--good,#1a7f37);font-weight:800}.stwarn{color:var(--bad,#c33);font-weight:800}.stnote{font-size:13px;color:var(--muted);min-height:1em}'+
 '@media(max-width:430px){.hdr .stpill .stt{display:none}}@media(max-width:374px){.hdr .stpill{padding:5px 7px}}@media(max-width:350px){.hdr .pills{gap:3px}.hdr .pill{padding:5px 6px;font-size:12px;gap:4px}}.stpill.live{background:var(--accent);color:var(--on-accent)}.stpill .stt{font-family:var(--mono);font-variant-numeric:tabular-nums}'+
 '.stbanner{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom));z-index:3002;width:min(440px,calc(100% - 32px));background:var(--panel);color:var(--text);border:2px solid var(--accent);border-radius:16px;padding:12px 14px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;gap:10px;align-items:center}.stbanner p{flex:1;margin:0;font-size:14px}.stbanner{flex-wrap:wrap}.stbanner p{flex:1 1 100%;padding-right:30px}.stbanner .stx{position:absolute;top:8px;right:8px}';
 document.head.appendChild(css);
 var sh=document.createElement('div');sh.className='stsheet';
 sh.innerHTML='<div class="stbox" role="dialog" aria-modal="true" aria-label="Study timer"><div class="sthd"><b>Study timer</b><button class="stx" type="button" aria-label="Close">✕</button></div>'+
  '<div class="stro"><div><span>Today</span><b data-k="today"></b></div><div><span>This week</span><b data-k="week"></b></div><div><span>Streak</span><b data-k="streak"></b></div></div>'+
  '<div class="stclock" aria-live="off">00:00:00</div>'+
  '<div class="strow"><input type="text" id="stTopic" maxlength="80" placeholder="What are you studying? e.g. Reactor kinetics"></div>'+
  '<button class="stbtn wide" type="button" data-a="go">Start studying</button><p class="stnote" data-k="msg"></p>'+
  '<div><p class="stlab">Last 14 days · minutes</p><div class="stchart"></div><div class="stdays"></div></div>'+
  '<div><p class="stlab">Forgot the timer? Add time by hand</p><div class="strow" style="margin-top:6px"><input type="number" id="stAddM" min="1" max="600" placeholder="Min" aria-label="Minutes"><input type="text" id="stAddT" maxlength="80" placeholder="Topic" aria-label="Topic"><button class="stbtn alt" type="button" data-a="add">Add to today</button></div></div>'+
  '<div><p class="stlab">Sessions</p><div class="stlist"></div></div>'+
  '<div class="strem"></div></div>';
 document.body.appendChild(sh);
 var $=function(s){return sh.querySelector(s)},tick=null;
 function note(t,bad){var m=$('[data-k=msg]');m.textContent=t;m.style.color=bad?'var(--bad,#c33)':'var(--muted)'}
 function paint(){$('[data-k=today]').textContent=fmtM(todayMin());$('[data-k=week]').textContent=fmtM(weekMin());$('[data-k=streak]').textContent=streak()+(streak()===1?' day':' days');
  var p=per(),days=[];for(var i=13;i>=0;i--){var x=new Date();x.setDate(x.getDate()-i);days.push(x)}var mx=Math.max(30,Math.max.apply(null,days.map(function(x){return p[ymd(x)]||0})));
  $('.stchart').innerHTML=days.map(function(x){var m=p[ymd(x)]||0;return '<i class="'+(m?'':'z')+'" style="height:'+(m?Math.max(4,m/mx*100):0)+'%" title="'+ymd(x)+': '+m+' min"></i>'}).join('');
  $('.stdays').innerHTML=days.map(function(x){return '<span>'+'MTWTFSS'[(x.getDay()+6)%7]+'</span>'}).join('');
  var L=$('.stlist');L.innerHTML='';var list=st.sessions.slice().sort(function(a,b){return (b.d+b.c).localeCompare(a.d+a.c)}).slice(0,12);
  if(!list.length)L.innerHTML='<p class="stnote">No sessions yet. Press Start studying when you begin.</p>';
  list.forEach(function(s){var r=document.createElement('div'),dt=new Date(s.d+'T12:00:00');var lv=!!(st.run&&s.c===st.run.c);r.innerHTML='<span>'+dt.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+'</span><span>'+esc(s.t)+'</span><b>'+s.m+' min'+(lv?' · live':'')+'</b>';
   var b=document.createElement('button');b.type='button';b.textContent='Delete';b.onclick=function(){if(b.dataset.arm){st.sessions=st.sessions.filter(function(x){return x!==s});if(st.run&&s.c===st.run.c){st.run=null;clearInterval(tick);note('Timer stopped and that session deleted.')}keep();writeFile(true);paint()}else{b.dataset.arm=1;b.textContent='Sure?';setTimeout(function(){delete b.dataset.arm;b.textContent='Delete'},3000)}};r.appendChild(b);L.appendChild(r)});
  paintClock();paintLink()}
 function paintClock(){var c=$('.stclock'),g=$('[data-a=go]');
  if(st.run){c.textContent=clock(Date.now()-st.run.at);c.classList.add('live');g.textContent='Stop and save';g.classList.add('stop')}else{c.textContent='00:00:00';c.classList.remove('live');g.textContent='Start studying';g.classList.remove('stop')}
  pills.forEach(function(b){var t=b.querySelector('.stt');b.classList.toggle('live',!!st.run);if(t)t.textContent=st.run?clock(Date.now()-st.run.at).replace(/^00:/,''):''})}
 function paintLink(){var R=$('.strem');if(!R)return;var studied=didToday();
  var h='<p class="stlab">Reminders on Windows</p><p>'+(studied?'<span class="stok">✓ Studied today'+(todayMin()?' ('+fmtM(todayMin())+')':'')+'.</span> Tonight\'s reminders will stay quiet.':'<span class="stwarn">Not studied yet today.</span>')+'</p>';
  if(!isWin){h+='<p class="stnote">On school days, reminders pop up on your Windows PC at 4:30pm and 4:40pm, then Critical opens by itself at 4:45pm. There are more reminders at 6pm and 8pm if you haven\'t studied. Open Critical on the laptop in Chrome or Edge to set them up.</p>';R.innerHTML=h;return}
  if(!canFS){h+='<p class="stnote">Open Critical in Chrome or Edge to set up reminders. This browser can\'t share your study time with them.</p>';R.innerHTML=h;return}
  h+='<ol><li><a href="https://u23bodwells-cmyk.github.io/Critical/reminders/critical-reminders.zip" target="_blank" rel="noopener" download>Download the reminder setup</a>, right-click it, choose <b>Extract All</b>, then double-click <b>install.cmd</b>. If Windows warns you, click <b>More info → Run anyway</b>.</li>'+
   '<li>Connect this app to the reminders, so they know when you\'ve studied: <button class="stbtn alt" type="button" data-a="link">'+(linkState==='ok'?'Connected ✓':linkState==='lost'?'Reconnect':'Choose the Critical folder')+'</button><br><span class="stnote">'+(linkState==='ok'?'Your study time is shared with the reminders.':linkState==='lost'?'Windows needs you to allow access again. Tap Reconnect and choose Allow.':'Pick <b>Documents → Critical</b>, then click <b>Select folder</b> and <b>Allow</b>. If it asks, choose “Allow on every visit”.')+'</span></li></ol>'+
   '<p class="stnote">On school days you\'ll get a break reminder at 4:15pm and warnings at 4:30pm and 4:40pm. Then Critical opens by itself at 4:45pm, in its own app window. There are more reminders at 6pm and 8pm if you still haven\'t studied, and any session counts. It also opens Critical when you turn on or unlock your PC after 3pm on a school day, so your evening timetable starts from when you get home. Already set up? Download it again and rerun install.cmd to get the latest version.</p>';
  R.innerHTML=h;var lb=R.querySelector('[data-a=link]');if(lb)lb.onclick=function(){linkState==='lost'?writeFile(true):link()}}
 /* autosave: while the timer runs, the session so far is saved every minute, so a crash, a closed tab or a sync can't lose it */
 var lastM=-1;
 function liveIdx(){if(!st.run||!st.run.c)return -1;for(var i=0;i<st.sessions.length;i++)if(st.sessions[i]&&st.sessions[i].c===st.run.c)return i;return -1}
 function liveSave(){if(!st.run)return;
  try{var cur=JSON.parse(localStorage.getItem(KEY)||'null');if(cur&&Array.isArray(cur.sessions))st.sessions=cur.sessions}catch(_){}
  if(!st.run.c)st.run.c=new Date(st.run.at).toISOString();
  var m=Math.min(600,Math.floor((Date.now()-st.run.at)/60000)),i=liveIdx(),t=st.run.t||'Study session';
  if(m>=1){if(i<0)st.sessions.push({d:ymd(new Date(st.run.at)),m:m,t:t,c:st.run.c});else{st.sessions[i].m=Math.max(m,+st.sessions[i].m||0);st.sessions[i].t=t}}
  keep()}
 function tk(){paintClock();if(!st.run)return;var m=Math.floor((Date.now()-st.run.at)/60000);if(m!==lastM){var first=lastM<0;lastM=m;liveSave();if(!first&&m%5===0)writeFile(false);if(sh.classList.contains('open'))paint()}}
 function startTick(){clearInterval(tick);lastM=-1;tick=setInterval(tk,1000);tk()}
 function onHide(){if(st.run)liveSave()}
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')onHide()});window.addEventListener('pagehide',onHide);
 /* another Critical window changed the timer (started, stopped, or saved): follow it */
 function adopt(raw){var v=null;try{v=JSON.parse(raw||'null')}catch(_){}if(!v||!Array.isArray(v.sessions))return;
  var was=st.run&&st.run.c;st=v;
  if(st.run){if(!tick||was!==st.run.c){clearInterval(tick);tick=setInterval(tk,1000)}lastM=Math.floor((Date.now()-st.run.at)/60000)}else{clearInterval(tick);tick=null}
  paintClock();if(sh.classList.contains('open'))paint()}
 window.addEventListener('storage',function(e){if(e.key===KEY)adopt(e.newValue)});
 $('[data-a=go]').onclick=function(){note('');
  if(!st.run){var n0=Date.now();st.run={at:n0,t:$('#stTopic').value.trim(),c:new Date(n0).toISOString()};keep();startTick();note('The timer saves itself every minute.');return}
  try{var cur=JSON.parse(localStorage.getItem(KEY)||'null');if(cur&&Array.isArray(cur.sessions))st.sessions=cur.sessions}catch(_){}
  var m=Math.round((Date.now()-st.run.at)/60000),t=$('#stTopic').value.trim()||st.run.t||'Study session',d=ymd(new Date(st.run.at)),li=liveIdx(),c=st.run.c||new Date(st.run.at).toISOString();
  st.run=null;clearInterval(tick);
  if(m<1){if(li>=0)st.sessions.splice(li,1);note('That was under a minute, so it wasn\'t saved.',true)}
  else{if(m>600)m=600;if(li>=0){st.sessions[li].m=Math.max(m,+st.sessions[li].m||0);st.sessions[li].t=t;m=st.sessions[li].m}else st.sessions.push({d:d,m:m,t:t,c:c});note('Saved '+m+' min. Nice work.')}
  keep();writeFile(true);paint()};
 $('#stTopic').addEventListener('input',function(){if(st.run){st.run.t=this.value.trim();var i=liveIdx();if(i>=0)st.sessions[i].t=st.run.t||'Study session';keep()}});
 $('[data-a=add]').onclick=function(){var m=parseInt($('#stAddM').value,10);if(!(m>=1&&m<=600)){note('Type the minutes first (1 to 600).',true);return}
  st.sessions.push({d:ymd(),m:m,t:$('#stAddT').value.trim()||'Study session',c:new Date().toISOString()});$('#stAddM').value='';$('#stAddT').value='';keep();writeFile(true);note('Added '+m+' min to today.');paint()};
 function close(){sh.classList.remove('open')}
 $('.stx').onclick=close;sh.addEventListener('click',function(e){if(e.target===sh)close()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sh.classList.contains('open'))close()});
 function open(){if(st.run)$('#stTopic').value=st.run.t||'';paint();sh.classList.add('open')}
 var pills=[];
 function mk(cls,label){var b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5v3.5"/></svg><span class="stt"></span>';b.title='Study timer';b.setAttribute('aria-label',label);b.onclick=open;pills.push(b);return b}
 var hc=document.querySelector('.hdr .calcpill')||document.querySelector('.hdr .askpill');if(hc)hc.parentNode.insertBefore(mk('pill stpill','Study timer'),hc.nextSibling);
 var lc=document.querySelector('.pcalc')||document.querySelector('.pask');if(lc)lc.parentNode.insertBefore(mk('psnd stpill','Study timer'),lc.nextSibling);
 if(st.run)startTick();
 /* gentle reminder inside the app too, if it's open at 4:15, 6 or 8 and nothing is logged */
 var shown={};
 function check(){var n=new Date(),hm=n.getHours()*60+n.getMinutes(),wd=n.getDay()>=1&&n.getDay()<=5;
  var slots=[[16*60+45,wd,'It\'s 4:45: time to start.'],[18*60,true,'You haven\'t studied yet today. A short session still counts.'],[20*60,true,'Last call for today. Keep your streak going.']];
  var did=didToday();
  if(did){var ob=document.querySelector('.stbanner');if(ob)ob.remove();if(toldFile!==ymd()){toldFile=ymd();writeFile(false)}return}
  slots.forEach(function(s){var k=ymd()+s[0];if(s[1]&&hm>=s[0]&&hm<s[0]+60&&!shown[k]){shown[k]=1;banner(s[2])}})}
 var toldFile=null;
 function banner(t){var old=document.querySelector('.stbanner');if(old)old.remove();var b=document.createElement('div');b.className='stbanner';b.setAttribute('role','status');b.innerHTML='<p>'+esc(t)+'</p>';
  var g=document.createElement('button');g.className='stbtn alt';g.type='button';var usePlan=typeof PLAN!=='undefined'&&PLAN.todayLeft&&PLAN.todayLeft()&&!PLAN.running();g.textContent=usePlan?'Start today\'s plan':'Start timer';g.onclick=function(){b.remove();if(usePlan){PLAN.start();return}open();if(!st.run)$('[data-a=go]').click()};
  var q1=document.createElement('button');q1.className='stbtn alt';q1.type='button';q1.textContent='Just one question';q1.onclick=function(){b.remove();if(typeof ONE!=='undefined')ONE.start()};
  var x=document.createElement('button');x.className='stx';x.type='button';x.setAttribute('aria-label','Dismiss');x.textContent='✕';x.onclick=function(){b.remove()};b.appendChild(q1);b.appendChild(g);b.appendChild(x);document.body.appendChild(b)}
 setInterval(check,60000);setTimeout(check,4000);
 writeFile(false);
 return {open:open,state:function(){return st},payload:payload,check:check,refresh:function(){try{adopt(localStorage.getItem(KEY))}catch(_){}},start:function(t){if(st.run)return false;var n0=Date.now();st.run={at:n0,t:t||'',c:new Date(n0).toISOString()};keep();startTick();return true},stop:function(){if(st.run)$('[data-a=go]').click()}};
})();
try{window.STUDY=STUDY}catch(_){}
