UNITS.forEach(function(u){u.lessons.forEach(function(l){l.cards.forEach(function(c){if(c.t==='W'&&c.w==='calcDrill'&&c.par&&!c.par.rule&&c.e)c.par.rule=c.e})})});
/* XP earned in other Critical apps (Chain) waits in critical_xp_inbox as {days:{'YYYY-MM-DD':xp}} until Critical is open, then lands here as normal XP on the day it was earned, so it counts for the streak, daily goal and season pass */
(function(){var K='critical_xp_inbox';function take(){var o=null;try{o=JSON.parse(localStorage.getItem(K)||'null')}catch(e){}if(!o||!o.days)return;try{localStorage.removeItem(K)}catch(e){}
  var t=today(),tot=0;Object.keys(o.days).sort().forEach(function(d){var n=Math.round(+o.days[d]||0);if(n<=0||!/^\d{4}-\d{2}-\d{2}$/.test(d)||d>t)return;tot+=n;if(d===t)addXP(n);else{S.xp+=n;S.hist[d]=(S.hist[d]||0)+n;pruneHist();save();updHeader()}});
  if(tot){try{checkBadges()}catch(e){}try{toast('📱','+'+tot.toLocaleString('en-GB')+' XP from Chain','Your scrolling counts towards your season pass','quest')}catch(e){}}}
 setTimeout(take,1200);document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(take,300)});addEventListener('storage',function(e){if(e.key===K)setTimeout(take,100)})})();
checkBadges(true);quests();updHeader();showPage('learn');
})();

