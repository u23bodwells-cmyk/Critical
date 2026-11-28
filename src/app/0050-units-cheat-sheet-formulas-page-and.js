/* ---------- units cheat sheet (Formulas page and the Units button in lessons) ---------- */
var PREFIXES=[['T','tera','10<sup>12</sup>','a million million. Rarely needed'],['G','giga','10<sup>9</sup>','a thousand million. 1 GW = 1000 MW, a big power station'],['M','mega','10<sup>6</sup>','a million. 1 MeV = 1,000,000 eV'],['k','kilo','10<sup>3</sup>','a thousand. 1 kg = 1000 g'],['c','centi','10<sup>−2</sup>','a hundredth. 1 cm = 0.01 m'],['m','milli','10<sup>−3</sup>','a thousandth. 1 mSv = 0.001 Sv'],['µ','micro','10<sup>−6</sup>','a millionth. 1 µSv = 0.000 001 Sv'],['n','nano','10<sup>−9</sup>','a thousand-millionth. 1 ns = 0.000 000 001 s']];
var UNITSHEET=[
['m','metre','length','about one long stride'],
['kg','kilogram','mass','a bag of sugar. 1 kg = 1000 g'],
['s','second','time','1 hour (h) = 3600 s'],
['m/s','metres per second','speed','light: 3.00 × 10<sup>8</sup> m/s'],
['J','joule','energy','lifting an apple 1 metre. 1 J = 1 kg·m²/s²'],
['W','watt','power: energy per second','1 W = 1 J every second. 1 MW = 10<sup>6</sup> W'],
['MWth / MWe','megawatts thermal / electric','heat made in the reactor / electricity sent out','Hinkley Point C, per reactor: about 4590 MWth and 1630 MWe'],
['kWh','kilowatt-hour','energy (on electricity bills)','1 kWh = 3.6 × 10<sup>6</sup> J'],
['u','atomic mass unit','mass of atoms','about one proton or neutron: 1.66 × 10<sup>−27</sup> kg'],
['eV','electronvolt','energy of single particles','1 eV = 1.60 × 10<sup>−19</sup> J'],
['MeV','mega-electronvolt','energy of nuclear reactions','1 MeV = 10<sup>6</sup> eV = 1.60 × 10<sup>−13</sup> J. One fission ≈ 200 MeV. 1 u ↔ 931.5 MeV'],
['°C and K','degrees Celsius and kelvin','temperature','K = °C + 273.15. A change of 1 °C = a change of 1 K. Efficiency formulas need kelvin'],
['bar, MPa','bar, megapascal','pressure','1 bar ≈ air pressure at sea level. PWR primary: about 155 bar = 15.5 MPa'],
['kg/s','kilograms per second','mass flow rate, ṁ','how much water passes each second'],
['J/(kg·°C)','joules per kilogram per degree','specific heat capacity, c','water: about 4200 when cold, about 5500 in a hot PWR'],
['W/m²','watts per square metre','heat flux','heat crossing each square metre of surface each second'],
['Bq','becquerel','activity','1 Bq = one nucleus decaying per second'],
['Gy','gray','absorbed dose','1 Gy = 1 J of radiation energy absorbed per kg'],
['Sv','sievert','dose (harm to the body)','UK average from all sources ≈ 2.7 mSv a year. Worker legal limit: 20 mSv a year'],
['b','barn','cross-section σ: the target size of a nucleus','1 b = 10<sup>−24</sup> cm²'],
['cm<sup>−1</sup>','per centimetre','macroscopic cross-section Σ','chance of an interaction per cm a neutron travels'],
['n/cm²/s','neutrons per cm² per second','neutron flux φ','how many neutrons cross each cm² each second'],
['pcm','per cent mille','reactivity','10<sup>−5</sup> Δk/k. 1000 pcm = 1 %Δk/k'],
['DPM','decades per minute','startup rate (SUR)','1 DPM = power ×10 every minute'],
['Hz','hertz','frequency','cycles per second. The UK grid runs at 50 Hz'],
['rpm','revolutions per minute','turbine speed','3000 rpm for a 2-pole generator on a 50 Hz grid']];
var LETTERS=[['Δ','“delta”','change in. ΔT = change in temperature'],['λ','“lambda”','decay constant (per second)'],['τ','“tau”','reactor period (seconds)'],['ρ','“rho”','reactivity, <b>or</b> density, depending on the equation'],['β','“beta”','delayed neutron fraction, or beta particle'],['σ, Σ','“sigma”','cross-sections (small σ: one nucleus; big Σ: per cm)'],['φ','“phi”','neutron flux'],['η','“eta”','efficiency, or neutrons per absorption'],['ε','“epsilon”','fast fission factor'],['c','','speed of light, <b>or</b> specific heat capacity, depending on the equation'],['ṁ','“m dot”','mass flow rate: the dot means “per second”']];
function unitsHTML(q){q=(q||'').toLowerCase().trim();function f(a){return !q||a.join(' ').replace(/<[^>]+>/g,'').toLowerCase().indexOf(q)>=0}
 function sec(title,rows,mk){rows=rows.filter(f);return rows.length?(title?'<h3 class="uhd">'+title+'</h3>':'')+'<div class="ulist">'+rows.map(mk).join('')+'</div>':''}
 var h=sec('',UNITSHEET,function(u){return '<div class="urow"><div class="us">'+u[0]+'</div><div><div class="un"><b>'+u[1]+'</b><span> · measures '+u[2]+'</span></div><div class="ue">'+u[3]+'</div></div></div>'})+
 sec('Prefixes: the letter in front of a unit',PREFIXES,function(p){return '<div class="urow"><div class="us">'+p[0]+'</div><div><div class="un"><b>'+p[1]+'</b><span> · × '+p[2]+'</span></div><div class="ue">'+p[3]+'</div></div></div>'})+
 sec('Greek letters and symbols',LETTERS,function(p){return '<div class="urow"><div class="us">'+p[0]+'</div><div><div class="un"><b>'+(p[1]||'')+'</b></div><div class="ue">'+p[2]+'</div></div></div>'});
 return h||'<p class="ue" style="padding:10px 0">Nothing matches “'+q.replace(/[<>&"]/g,'')+'”. Try a unit (MeV), a symbol (σ) or a word (pressure).</p>'}
function openUnits(){var o=$('usheet');if(!o){o=el('div',null,'<div class="ub" role="dialog" aria-modal="true" aria-label="Units cheat sheet"><div class="uh"><h2>Units cheat sheet</h2><button class="ghost sm" id="usClose">Close</button></div><input class="usq" id="usq" placeholder="Search, e.g. MeV, pressure, sievert"><div id="usBody"></div></div>',document.body);o.id='usheet';
  o.onclick=function(e){if(e.target===o)o.classList.remove('open')};$('usClose').onclick=function(){o.classList.remove('open')};$('usq').oninput=function(){$('usBody').innerHTML=unitsHTML(this.value)}}
 $('usBody').innerHTML=unitsHTML($('usq').value);o.classList.add('open')}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('usheet'))$('usheet').classList.remove('open')});
