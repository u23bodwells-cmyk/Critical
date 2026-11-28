/* ---------- navigation ---------- */
var PAGE='learn';
function showPage(p){PAGE=p;[].forEach.call(document.querySelectorAll('.tab'),function(t){t.classList.toggle('on',t.dataset.p===p)});[].forEach.call(document.querySelectorAll('.page'),function(s){s.classList.toggle('show',s.id==='page-'+p)});
 if(p==='learn')renderLearn();if(p==='exam'&&typeof EXAM!=='undefined')EXAM.render();if(p==='review')renderReview();if(p==='ref')renderRef();if(p==='sim')simShow();else simHide();window.scrollTo(0,0)}
[].forEach.call(document.querySelectorAll('.tab'),function(t){t.onclick=function(){showPage(t.dataset.p)}});
var MOON='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" fill="currentColor"/></svg>',
 SUN='<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
function themePref(){try{var v=localStorage.getItem('critical_theme');return v==='light'||v==='dark'?v:'auto'}catch(e){return 'auto'}}
function sysDark(){try{return matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return false}}
function isDark(){var a=document.documentElement.getAttribute('data-theme');return a==='dark'||(a!=='light'&&sysDark())}
function themeUI(){var d=isDark(),b=$('themeBtn');if(b){b.innerHTML=d?SUN:MOON;b.title=d?'Light mode':'Dark mode';b.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode');b.classList.toggle('isdark',d)}
 var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.setAttribute('name','theme-color');document.head.appendChild(m)}m.setAttribute('content',d?'#232326':'#ffffff');
 var s=$('themeSel');if(s)s.value=themePref()}
function applyTheme(p){var r=document.documentElement;if(p==='light'||p==='dark')r.setAttribute('data-theme',p);else r.removeAttribute('data-theme');
 try{if(p==='light'||p==='dark')localStorage.setItem('critical_theme',p);else localStorage.removeItem('critical_theme')}catch(e){}themeUI();redrawAll()}
$('themeBtn').onclick=function(){applyTheme(isDark()?'light':'dark')};
(function(){var p=themePref();if(p!=='auto')document.documentElement.setAttribute('data-theme',p);themeUI();
 try{var mq=matchMedia('(prefers-color-scheme: dark)'),f=function(){if(themePref()==='auto'){themeUI();redrawAll()}};if(mq.addEventListener)mq.addEventListener('change',f);else if(mq.addListener)mq.addListener(f)}catch(e){}})();
$('xpPill').onclick=function(){showPage('review')};$('streakPill').onclick=function(){showPage('review')};

