/* ===== a different goal for every track and level (Maths Level 1 keeps the power station) ===== */
var GOALS={
 maths1:{icon:'⚡',title:'Build Hinkley Point C',story:'',final:'Station built and you can do the maths behind it',steps:[]},
 theory1:{icon:'🧭',title:'Lead the tour of Hinkley Point C',story:'Each unit opens the next stop on the site tour. Finish them all and you can lead visitors round the whole station yourself.',final:'Tour guide: you can explain the whole station',
  steps:['Visitor centre','Radiation lab','Reactor physics hall','Fuel building','Control rod drives','Primary circuit','Turbine hall and sea tunnels','Safety systems','Health physics office','The control room','Drawing office','Instrument workshop','Electrical substation','Training centre']},
 maths2:{icon:'📝',title:'Ace your A-level maths and physics',story:'Each unit is one exam topic signed off. Finish them all and you have the maths an apprenticeship interview will test.',final:'Exam ready: top grades in reach',
  steps:['Algebra and graphs paper','Logs and exponentials paper','Differentiation paper','Integration paper','Nuclear calculations paper']},
 theory2:{icon:'🎓',title:'Win a Hinkley Point C apprenticeship',story:'Work through the application one stage at a time. Finish them all and the offer is yours.',final:'Apprenticeship offer accepted',
  steps:['Application form','Aptitude test','Assessment day','Technical interview','Site visit']},
 maths3:{icon:'📋',title:'Pass your operator licence exams',story:'Each unit is one written exam operators sit before they are trusted at the controls.',final:'All licence exams passed',
  steps:['Reactivity exam','Rod and boron worth exam','Kinetics exam','Reactor startup exam','Heat balance exam']},
 theory3:{icon:'🕹️',title:'Qualify on the full-scope simulator',story:'Each unit is a simulator assessment in a perfect copy of the real control room. Pass them all to be authorised to operate.',final:'Authorised reactor operator',
  steps:['Temperature coefficients check','Xenon transient','Technical specifications oral','Fault scenarios','Emergency drill']},
 maths4:{icon:'📐',title:'Design a reactor core on paper',story:'Each unit adds a chapter to your own core design report, from fuel depletion to coolant flow.',final:'Core design report signed off',
  steps:['Fuel depletion model','Flux and power map','Core size and leakage','Fuel temperature limits','Coolant flow and pumps']},
 theory4:{icon:'🏛️',title:'Earn your nuclear engineering degree',story:'Each unit is a university module. Pass them all to graduate.',final:'BEng Nuclear Engineering',
  steps:['Nuclear physics module','Reactor physics module','Thermal-hydraulics module','Materials module','Radiation protection module']},
 maths5:{icon:'🧮',title:'Write the startup safety calculations',story:'Each unit is a calculation package the regulator must approve before a new core can start up.',final:'Calculations approved by the regulator',
  steps:['Reactor kinetics model','Feedback and fault bursts','Two-group core model','Reliability of safety systems','Decay heat and cooling times']},
 theory5:{icon:'🏆',title:'Become a senior reactor engineer',story:'Each unit is a responsibility you take on, ending with leading the station\'s plans for the future.',final:'Senior Reactor Engineer',
  steps:['Plan a reload','Own the safety case','Run the risk assessment','Lead severe accident planning','Plan the next generation']}};
function goalKey(m,lv){return m+lv}
function goalUnits(m,lv){var a=[];UNITS.forEach(function(u,ui){if(trk(ui)===m&&lvOf(ui)===lv)a.push(ui)});return a}
function goalStep(ui){var g=GOALS[goalKey(trk(ui),lvOf(ui))];if(!g)return null;var k=goalUnits(trk(ui),lvOf(ui)).indexOf(ui);return g.steps[k]||null}
function goalNote(ui){var m=trk(ui),lv=lvOf(ui),g=GOALS[goalKey(m,lv)];if(!g)return '';var us=goalUnits(m,lv),done=us.filter(function(i){return unitFrac(i).f>=1}).length;
 return '<p class="note goalnote">'+g.icon+' <b>'+g.title+'</b>: '+done+' of '+us.length+' stages complete'+(done===us.length?'. <b>'+g.final+'!</b>':'')+'</p>'}
function goalCard(){var m=curMode(),lv=curLevel(m),g=GOALS[goalKey(m,lv)];if(!g)return levelCard();var us=goalUnits(m,lv),cur=-1,done=0,rows='';
 us.forEach(function(ui,k){var x=unitFrac(ui),st=x.f>=1?'done':'todo';if(st==='done')done++;else if(cur<0){cur=k;st='now'}var u=UNITS[ui];
  rows+='<li class="gs '+st+'" style="--c:'+u.color+'"><span class="gdot">'+(st==='done'?'✓':(k+1))+'</span><div class="gtx"><b>'+g.steps[k]+'</b><span>'+uLabel(ui)+': '+u.title+' · '+x.d+'/'+x.n+' lessons</span>'+(st==='now'&&x.d>0?'<div class="gbar"><div style="width:'+x.f*100+'%;background:'+u.color+'"></div></div>':'')+'</div></li>'});
 var lt=typeof lvtPassed==='function'&&lvtPassed(m,lv),lo=typeof lvtOpen==='function'&&lvtOpen(m,lv),all=done===us.length&&lt;
 rows+='<li class="gs '+(lt?'done':lo?'now':'todo')+'" style="--c:#534AB7"><span class="gdot">'+(lt?'✓':'📝')+'</span><div class="gtx"><b>Level '+lv+' test</b><span>'+(lt?'Passed':'Pass with 75% to finish the goal')+'</span></div></li>';
 rows+='<li class="gs final'+(all?' done':'')+'"><span class="gdot">'+g.icon+'</span><div class="gtx"><b>'+g.final+'</b><span>'+(all?'Achieved!':'Your goal for this level')+'</span></div></li>';
 return '<div class="card goalcard"><div class="ghd"><span class="gico">'+g.icon+'</span><div><div class="gkick">Level '+lv+' goal · '+modeName(m)+'</div><h2>'+g.title+'</h2></div></div><p class="note">'+g.story+'</p><p class="gcount"><b>'+done+' of '+us.length+'</b> stages complete</p><ol class="gsteps">'+rows+'</ol></div>'}
(function(){var css=document.createElement('style');css.textContent=
 '.goalcard .ghd{display:flex;gap:12px;align-items:center;margin-bottom:6px}.goalcard .gico{font-size:34px;line-height:1}.goalcard .gkick{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}.goalcard h2{margin:2px 0 0}'+
 '.gcount{margin:6px 0 4px;font-size:14px;color:var(--muted)}.gsteps{list-style:none;margin:8px 0 0;padding:0;position:relative}'+
 '.gs{display:flex;gap:12px;align-items:flex-start;padding:7px 0;position:relative}.gs:not(:last-child)::after{content:"";position:absolute;left:15px;top:38px;bottom:-8px;width:2px;background:var(--line)}.gs.done:not(:last-child)::after{background:var(--c)}'+
 '.gdot{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;background:var(--soft);color:var(--muted);border:2px solid var(--line);z-index:1}'+
 '.gs.done .gdot{background:var(--c);border-color:var(--c);color:#fff}.gs.now .gdot{border-color:var(--c);color:var(--c);box-shadow:0 0 0 4px var(--accent-bg,rgba(83,74,183,.15))}.gs.final .gdot{font-size:17px}.gs.final.done .gdot{background:var(--amber,#EF9F27);border-color:var(--amber,#EF9F27)}'+
 '.gtx{flex:1;min-width:0}.gtx b{display:block;font-size:15px}.gtx span{display:block;font-size:13px;color:var(--muted);margin-top:1px}.gs.todo .gtx b{color:var(--muted)}.gbar{height:6px;border-radius:3px;background:var(--soft2);margin-top:6px;overflow:hidden}.gbar div{height:100%}'+
 '.goalnote{margin-top:8px}';document.head.appendChild(css)})();

