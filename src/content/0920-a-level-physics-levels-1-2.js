/* ========== A-LEVEL PHYSICS (AQA 7408) · LEVEL 1 bridge · LEVEL 2 Year 12 ========== */
function pE(v,sf){sf=sf||3;if(v===0)return '0';var e=Math.floor(Math.log10(Math.abs(v))),m=v/Math.pow(10,e);m=Math.round(m*Math.pow(10,sf-1))/Math.pow(10,sf-1);if(Math.abs(m)>=10){m/=10;e++}return e===0?cNum(m):cNum(m)+' × 10'+cSup(e)}
CGEN.p_prefix=function(){var P=cP([['k',3],['M',6],['G',9],['m',-3],['μ',-6],['n',-9]]),v=cR(1,99),u=cP(['m','g','A','V','W','J','s']);
 return {p:'Write '+v+' '+P[0]+u+' in '+u+'. Give the power of ten.',b:[cB(P[1],cNum(v)+' × 10','','power',true)],e:P[0]+' means × 10'+cSup(P[1])+'. So '+v+' '+P[0]+u+' = '+v+' × 10'+cSup(P[1])+' '+u+'.'}};
CGEN.p_unc=function(){var x=cR(20,80)/10,dx=cP([0.1,0.05,0.2]),pct=Math.round(dx/x*1000)/10;
 return {p:'A length is measured as '+x.toFixed(1)+' ± '+dx+' cm. What\'s the percentage uncertainty? (1 d.p.)',b:[cB(pct,'','%','percentage',false,0.02)],e:'% uncertainty = absolute ÷ value × 100 = '+dx+' ÷ '+x.toFixed(1)+' × 100 = '+cNum(pct)+'%. (If the length were squared, you\'d double it.)'}};
CGEN.p_photon=function(){var l=cR(200,700),E=Math.round(1240/l*1000)/1000;
 return {p:'Find the energy of a photon of wavelength '+l+' nm, in eV. (3 d.p.)',b:[cB(E,'E = ',' eV','energy',false,0.003)],e:'E = hc/λ. In handy units, hc ≈ 1240 eV nm, so E = 1240 ÷ '+l+' = '+cNum(E)+' eV.'}};
CGEN.p_photo=function(){var E=cR(30,80)/10,phi=cR(18,Math.min(E*10-2,50))/10,K=Math.round((E-phi)*100)/100;
 return {p:'Photons of energy '+cNum(E)+' eV hit a metal with work function '+cNum(phi)+' eV. Maximum kinetic energy of the photoelectrons, in eV?',b:[cB(K,'E<sub>k,max</sub> = ',' eV','energy',false,0.003)],e:'Einstein\'s equation: hf = φ + E<sub>k,max</sub>, so E<sub>k,max</sub> = '+cNum(E)+' − '+cNum(phi)+' = '+cNum(K)+' eV.'}};
CGEN.p_debroglie=function(){var k=cR(1,9),l=Math.round(0.728/k*1000)/1000;
 return {p:'An electron (m = 9.11 × 10⁻³¹ kg) moves at '+k+' × 10⁶ m/s. Find its de Broglie wavelength in nm. (h = 6.63 × 10⁻³⁴ J s, 3 d.p.)',b:[cB(l,'λ = ',' nm','wavelength',false,0.005)],e:'λ = h/(mv) = 6.63 × 10⁻³⁴ ÷ (9.11 × 10⁻³¹ × '+k+' × 10⁶) = '+pE(l*1e-9)+' m = '+cNum(l)+' nm.'}};
CGEN.p_resist=function(){var rho=cP([1.7e-8,2.8e-8,1.1e-6,5.6e-8]),L=cR(1,20),d=cP([0.2,0.3,0.5,1.0]),A=Math.PI*Math.pow(d/2*1e-3,2),R=rho*L/A,r=Math.round(R*Math.pow(10,2-Math.floor(Math.log10(R))))/Math.pow(10,2-Math.floor(Math.log10(R)));
 return {p:'A wire has resistivity '+pE(rho,2)+' Ω m, length '+L+' m and diameter '+d+' mm. Find its resistance in Ω. (3 s.f.)',b:[cB(r,'R = ',' Ω','resistance',false,0.006)],e:'A = π(d/2)² = π × ('+cNum(d/2)+' × 10⁻³)² = '+pE(A)+' m². R = ρL/A = '+pE(rho,2)+' × '+L+' ÷ '+pE(A)+' = '+pE(R)+' Ω.'}};
CGEN.p_emf=function(){var e=cR(3,24),r=cP([0.5,1,1.5,2]),R=cR(2,20),I=e/(R+r),V=Math.round((e-I*r)*100)/100;
 return {p:'A cell of emf '+e+' V and internal resistance '+r+' Ω is connected to a '+R+' Ω resistor. Find the terminal pd. (2 d.p.)',b:[cB(V,'V = ',' V','pd',false,0.005)],e:'I = ε/(R + r) = '+e+'/'+cNum(R+r)+' = '+cNum(Math.round(I*1000)/1000)+' A. V = ε − Ir = '+cNum(V)+' V ("lost volts" Ir = '+cNum(Math.round(I*r*100)/100)+' V).'}};
CGEN.p_potdiv=function(){var Vin=cP([6,9,12,5]),R1=cR(1,10)*100,R2=cR(1,10)*100,V=Math.round(Vin*R2/(R1+R2)*100)/100;
 return {p:'A potential divider has R₁ = '+R1+' Ω and R₂ = '+R2+' Ω across '+Vin+' V. Find V<sub>out</sub> across R₂. (2 d.p.)',b:[cB(V,'V<sub>out</sub> = ',' V','pd',false,0.005)],e:'V<sub>out</sub> = V<sub>in</sub> × R₂/(R₁ + R₂) = '+Vin+' × '+R2+'/'+(R1+R2)+' = '+cNum(V)+' V.'}};
CGEN.p_young=function(){var M=cP([['steel',200],['copper',120],['brass',100],['aluminium',70]]),F=cR(2,12)*10,d=cP([0.5,0.8,1.0]),L=cR(1,3),A=Math.PI*Math.pow(d/2*1e-3,2),dL=F*L/(A*M[1]*1e9)*1000;dL=Math.round(dL*Math.pow(10,1-Math.floor(Math.log10(dL))))/Math.pow(10,1-Math.floor(Math.log10(dL)));var E=F/A/(dL*1e-3/L),r=Math.round(E/1e9);
 return {p:(M[0]==='aluminium'?'An ':'A ')+M[0]+' wire '+L+' m long, diameter '+d+' mm, stretches '+cNum(dL)+' mm under '+F+' N. Find the Young modulus in GPa. (nearest whole number)',b:[cB(r,'E = ',' GPa','Young modulus',false,0.01)],e:'Stress = F/A = '+F+' ÷ '+pE(A)+' = '+pE(F/A)+' Pa. Strain = '+cNum(dL)+' × 10⁻³ ÷ '+L+' = '+pE(dL*1e-3/L)+'. E = stress/strain = '+pE(E)+' Pa ≈ '+r+' GPa.'}};
CGEN.p_moment=function(){var F=cR(2,30),d=cR(1,9)/10,d2=cR(1,9)/10,F2=Math.round(F*d/d2*100)/100;
 return {p:'A '+F+' N force acts '+cNum(d)+' m from a pivot. What force '+cNum(d2)+' m on the other side balances it? (2 d.p.)',b:[cB(F2,'F = ',' N','force',false,0.005)],e:'Principle of moments: '+F+' × '+cNum(d)+' = F × '+cNum(d2)+', so F = '+cNum(F2)+' N.'}};
CGEN.p_power=function(){var m=cR(50,900),h=cR(2,30),t=cR(2,30),P=Math.round(m*9.81*h/t*10)/10;
 return {p:'A motor lifts '+m+' kg through '+h+' m in '+t+' s. Find the useful power output. (g = 9.81, 1 d.p.)',b:[cB(P,'P = ',' W','power',false,0.005)],e:'P = mgh/t = '+m+' × 9.81 × '+h+' ÷ '+t+' = '+cNum(P)+' W.'}};

/* ---- Level 1: GCSE to A-level ---- */
U({id:'ap1-1',track:'ap',level:1,title:'Measurements and uncertainties',icon:'±',color:'#7F77DD',desc:'SI units and prefixes, uncertainties, and reading gradients from graphs.',lessons:[
LH('ap1-1-1','SI units and prefixes',9,'Every A-level physics answer needs the right unit and power of ten.',[
RM(`<p>Standard form: 3.2 × 10⁴ = 32,000. Base SI units: kg, m, s, A, K, mol.</p>`),
T(`<h3>Base and derived units</h3><p>Every unit can be built from the <b>six base units</b> (kg, m, s, A, K, mol). Newton: F = ma, so N = kg m s⁻². Joule: J = N m = kg m² s⁻². Checking units (<b>homogeneity</b>) catches wrong equations.</p>`),
Q(`What is the watt in base units?`,[`kg m² s⁻³`,`kg m s⁻²`,`kg m² s⁻²`,`kg s⁻¹`],0,`W = J/s = kg m² s⁻² ÷ s.`),
T(`<h3>Prefixes</h3><table class="wtable"><tr><th>T</th><th>G</th><th>M</th><th>k</th><th>c</th><th>m</th><th>μ</th><th>n</th><th>p</th></tr><tr><td>10¹²</td><td>10⁹</td><td>10⁶</td><td>10³</td><td>10⁻²</td><td>10⁻³</td><td>10⁻⁶</td><td>10⁻⁹</td><td>10⁻¹²</td></tr></table>`),
W('calcDrill',{skill:'p_prefix',need:4},`Prefixes. Get 4 right to master it.`,`Replace the prefix with its power of ten.`),
T(`<h3>Key points</h3><ul><li>Six <b>base units</b>; everything else is built from them.</li><li>Check equations by <b>homogeneity</b>.</li><li>Learn the prefixes from tera to pico.</li></ul>`)]),
LH('ap1-1-2','Uncertainties',10,'Every measurement has an uncertainty. A-level wants you to calculate and combine them.',[
RM(`<p>A reading on a ruler is uncertain by about half the smallest division. Percentages: part ÷ whole × 100.</p>`),
T(`<h3>Absolute and percentage</h3><p>Length = 5.0 ± 0.1 cm. Absolute uncertainty: 0.1 cm. Percentage uncertainty: 0.1/5.0 × 100 = 2%.</p>`),
W('calcDrill',{skill:'p_unc',need:3},`Percentage uncertainties. Get 3 right to master it.`,`Absolute ÷ value × 100.`),
T(`<h3>Combining</h3><ul><li><b>Adding or subtracting</b> quantities: <b>add absolute</b> uncertainties.</li><li><b>Multiplying or dividing</b>: <b>add percentage</b> uncertainties.</li><li><b>Raising to a power</b>: multiply the percentage by the power.</li></ul>`),
Q(`Area = L², with L uncertain by 2%. Uncertainty in area?`,[`4%`,`2%`,`1%`,`8%`],0,`Power 2: double the percentage.`),
T(`<h3>Errors</h3><p><b>Random errors</b> scatter readings (reduce by repeating and averaging). <b>Systematic errors</b> shift every reading the same way (like a zero error), and repeating doesn't help.</p>`),
T(`<h3>Key points</h3><ul><li>% uncertainty = absolute ÷ value × 100.</li><li>Add absolutes for ±; add percentages for × ÷; multiply by the power.</li><li>Random vs systematic errors.</li></ul>`)]),
LH('ap1-1-3','Graphs and gradients',9,'Turn an equation into y = mx + c and a straight-line graph gives you the answer.',[
RM(`<p>y = mx + c: gradient m, intercept c. Gradient = Δy/Δx.</p>`),
T(`<h3>Linearising</h3><p>Match your equation to y = mx + c. For example, v² = u² + 2as: plot v² against s, and the gradient is 2a, the intercept u².</p>`),
Q(`T = 2π√(l/g). Which graph is a straight line through the origin?`,[`T² against l`,`T against l`,`T against l²`,`√T against l`],0,`T² = (4π²/g) l.`),
T(`<h3>Reading gradients</h3><ul><li>Use a <b>large triangle</b> (at least half the line) to reduce reading error.</li><li>Include <b>units</b> in the gradient.</li><li>For a curve, draw a tangent and find its gradient.</li></ul>`),
N(`T² against l has gradient 4.0 s²/m. Using gradient = 4π²/g, find g. (2 d.p.)`,9.87,0.005,'m/s²',`g = 4π²/4.0 = 9.87.`),
T(`<h3>Key points</h3><ul><li>Rearrange into <b>y = mx + c</b>.</li><li>Big triangles; units on gradients.</li><li>Tangents for curves.</li></ul>`)])
]});

U({id:'ap1-2',track:'ap',level:1,title:'GCSE physics at A-level speed',icon:'F⃗',color:'#1D9E75',desc:'Resolving vectors, energy and power, and moments.',lessons:[
LH('ap1-2-1','Scalars, vectors and resolving',10,'Split a force into two perpendicular parts and hard problems become two easy ones.',[
RM(`<p>A vector has size and direction; a scalar only size. SOH CAH TOA.</p>`),
T(`<h3>Resolving</h3><p>A force F at angle θ to the horizontal has:</p><div class="eq">horizontal F cos θ,&nbsp;&nbsp; vertical F sin θ</div><p>Two perpendicular forces combine with Pythagoras: resultant √(F₁² + F₂²) at angle arctan(F₂/F₁).</p>`),
N(`A 50 N force acts at 30° above horizontal. Horizontal component? (1 d.p.)`,43.3,0.002,'N',`50 cos 30° = 43.3 N.`),
Q(`Which is a vector?`,[`Displacement`,`Speed`,`Mass`,`Energy`],0,`Has a direction.`),
T(`<h3>Equilibrium</h3><p>An object is in equilibrium when the resultant force is zero: resolve in two directions and set each sum to zero. Coplanar forces in equilibrium form a closed triangle.</p>`),
T(`<h3>Key points</h3><ul><li>Components: <b>F cos θ</b> and <b>F sin θ</b>.</li><li>Combine perpendicular vectors with Pythagoras.</li><li>Equilibrium: resultant zero in every direction.</li></ul>`)]),
LH('ap1-2-2','Moments',9,'Turning effects, balance and centre of mass.',[
RM(`<p>Moment = force × perpendicular distance from the pivot.</p>`),
T(`<h3>Principle of moments</h3><p>For balance: <b>sum of clockwise moments = sum of anticlockwise moments</b> about any point. A <b>couple</b> is two equal, opposite, parallel forces: its moment is force × separation.</p>`),
W('calcDrill',{skill:'p_moment',need:3},`Balancing moments. Get 3 right to master it.`,`F₁d₁ = F₂d₂.`),
Q(`The centre of mass of an object is…`,[`where its weight appears to act`,`always its geometric centre`,`its heaviest end`,`always at the bottom`],0,`Uniform objects: the geometric centre.`),
T(`<h3>Key points</h3><ul><li><b>Clockwise = anticlockwise</b> moments for balance.</li><li>Couple: force × separation.</li><li>Weight acts at the <b>centre of mass</b>.</li></ul>`)]),
LH('ap1-2-3','Energy, work and power',9,'Work, energy and power at A-level: same ideas, harder numbers.',[
RM(`<p>W = Fs. KE = ½mv². GPE = mgh. P = W/t.</p>`),
T(`<h3>Work with an angle</h3><div class="eq">W = Fs cos θ</div><p>Only the force component along the motion does work. Power can also be written <b>P = Fv</b> for a steady speed.</p>`),
W('calcDrill',{skill:'p_power',need:3},`Power calculations. Get 3 right to master it.`,`mgh/t.`),
N(`A car moves at 25 m/s against a 600 N resistive force. Power needed (kW)?`,15,0.001,'kW',`P = Fv = 600 × 25 = 15,000 W.`),
T(`<h3>Efficiency</h3><div class="eq">efficiency = useful output ÷ total input</div>`),
T(`<h3>Key points</h3><ul><li><b>W = Fs cos θ</b>.</li><li><b>P = W/t = Fv</b>.</li><li>Efficiency = useful ÷ total.</li></ul>`)])
]});

/* ---- Level 2: Year 12 ---- */
U({id:'ap2-1',track:'ap',level:2,title:'Particles and quantum phenomena',icon:'γ',color:'#7F77DD',desc:'Inside the atom, particles and antiparticles, quarks, and the photoelectric effect.',lessons:[
LH('ap2-1-1','Constituents of the atom',10,'Protons, neutrons, electrons, specific charge, and the strong force.',[
RM(`<p>Atoms: nucleus of protons and neutrons, electrons around it. Isotopes: same protons, different neutrons. Notation ᴬ<sub>Z</sub>X.</p>`),
T(`<h3>Specific charge</h3><div class="eq">specific charge = charge ÷ mass &nbsp;(C kg⁻¹)</div><p>Electron: 1.76 × 10¹¹ C kg⁻¹, the largest of the three, because its mass is so small.</p>`),
N(`A proton has charge 1.60 × 10⁻¹⁹ C and mass 1.67 × 10⁻²⁷ kg. Specific charge? (×10⁷ C/kg, 3 s.f.)`,9.58,0.005,'×10⁷ C/kg',`1.60 × 10⁻¹⁹ ÷ 1.67 × 10⁻²⁷ = 9.58 × 10⁷.`),
T(`<h3>The strong nuclear force</h3><p>Holds the nucleus together against proton repulsion. <b>Repulsive</b> below about 0.5 fm, <b>attractive</b> up to about 3 fm, and negligible beyond.</p>`),
T(`<h3>Unstable nuclei</h3><ul><li><b>α decay</b>: ᴬ<sub>Z</sub>X → ᴬ⁻⁴<sub>Z−2</sub>Y + ⁴<sub>2</sub>α (very large nuclei).</li><li><b>β⁻ decay</b>: n → p + e⁻ + ν̄<sub>e</sub> (neutron-rich nuclei). The antineutrino was predicted to explain the spread of beta energies.</li></ul>`),
Q(`Why was the neutrino proposed?`,[`Beta particles had a range of energies, so energy seemed to go missing`,`To explain alpha decay`,`To hold the nucleus together`,`To explain gravity`],0,`Conservation of energy.`),
T(`<h3>Key points</h3><ul><li>Specific charge = Q/m.</li><li>Strong force: repulsive < 0.5 fm, attractive to ~3 fm.</li><li>β⁻ decay emits an <b>antineutrino</b>.</li></ul>`)]),
LH('ap2-1-2','Particles, antiparticles and quarks',11,'Hadrons, leptons, quarks, and the conservation laws that decide what\'s allowed.',[
RM(`<p>Every particle has an antiparticle with the same mass and opposite charge. E = mc².</p>`),
T(`<h3>Annihilation and pair production</h3><p>A particle and its antiparticle <b>annihilate</b> into two photons. A photon with enough energy can make a particle–antiparticle pair: minimum energy = 2 × rest energy (1.022 MeV for an electron–positron pair).</p>`),
T(`<h3>Classification</h3><ul><li><b>Hadrons</b> feel the strong force. <b>Baryons</b> (three quarks: proton uud, neutron udd) and <b>mesons</b> (quark + antiquark: pions, kaons).</li><li><b>Leptons</b> don't: electron, muon, neutrinos.</li></ul>`),
W('matchPairs',{pairs:[['Proton','Baryon: uud'],['Pion','Meson'],['Muon','Lepton'],['Neutron','Baryon: udd']]},`Match each particle to its class.`),
T(`<h3>Conservation laws</h3><p>Always conserved: <b>charge</b>, <b>baryon number</b>, <b>lepton number</b> (electron and muon separately). <b>Strangeness</b> is conserved in strong interactions but can change by ±1 in weak ones.</p>`),
Q(`p → n + e⁺ + ν<sub>e</sub> happens inside some nuclei. Which interaction?`,[`Weak`,`Strong`,`Electromagnetic`,`Gravity`],0,`It changes quark type (u → d): weak.`),
T(`<h3>Key points</h3><ul><li>Annihilation and pair production.</li><li>Hadrons (baryons qqq, mesons qq̄) vs leptons.</li><li>Conserve charge, baryon number, lepton number; strangeness only in strong.</li></ul>`)]),
LH('ap2-1-3','Photons and the photoelectric effect',11,'Light comes in packets. The photoelectric effect proved it.',[
RM(`<p>Waves: c = fλ. Energy levels in atoms. 1 eV = 1.60 × 10⁻¹⁹ J.</p>`),
T(`<h3>Photons</h3><div class="eq">E = hf = hc/λ</div>`),
W('calcDrill',{skill:'p_photon',need:3},`Photon energies. Get 3 right to master it.`,`E = 1240/λ in eV with λ in nm.`),
T(`<h3>The photoelectric effect</h3><p>Light only ejects electrons from a metal above a <b>threshold frequency</b>, however bright. One photon gives its energy to one electron:</p><div class="eq">hf = φ + E<sub>k,max</sub></div><p>φ is the <b>work function</b>, the minimum energy to free an electron. Wave theory couldn't explain the threshold: this proved light is particles.</p>`),
W('calcDrill',{skill:'p_photo',need:3},`Photoelectric equation. Get 3 right to master it.`,`E<sub>k,max</sub> = hf − φ.`),
T(`<h3>Wave–particle duality</h3><p>Electrons diffract like waves, with <b>de Broglie wavelength λ = h/mv</b>. Light and matter both behave as waves and particles.</p>`),
W('calcDrill',{skill:'p_debroglie',need:2},`de Broglie wavelengths. Get 2 right to master it.`,`λ = h/mv.`),
T(`<h3>Key points</h3><ul><li><b>E = hf</b>.</li><li><b>hf = φ + E<sub>k,max</sub></b>; threshold frequency proves photons.</li><li><b>λ = h/mv</b>: matter waves.</li></ul>`)])
]});

U({id:'ap2-2',track:'ap',level:2,title:'Waves',icon:'∿',color:'#1D9E75',desc:'Progressive and stationary waves, polarisation, interference and diffraction, and refraction.',lessons:[
LH('ap2-2-1','Progressive waves and polarisation',10,'Waves carry energy without carrying matter. Transverse ones can be polarised.',[
RM(`<p>c = fλ. Transverse waves oscillate perpendicular to travel; longitudinal parallel to it.</p>`),
T(`<h3>Describing waves</h3><ul><li>Amplitude, wavelength λ, frequency f, period T = 1/f.</li><li><b>Phase difference</b>: how far out of step two points are, in radians (2π = one whole cycle).</li></ul>`),
N(`Two points are a quarter of a wavelength apart on a wave. Phase difference in radians? (3 d.p.)`,1.571,0.002,'rad',`¼ × 2π = π/2.`),
T(`<h3>Polarisation</h3><p>Only <b>transverse</b> waves can be polarised: restricted to oscillate in one plane. Polaroid sunglasses cut glare (reflected light is partly polarised). TV aerials are aligned with the polarisation of the broadcast.</p>`),
Q(`Polarisation proves a wave is…`,[`transverse`,`longitudinal`,`electromagnetic`,`slow`],0,`Longitudinal waves have no plane to restrict.`),
T(`<h3>Key points</h3><ul><li><b>c = fλ</b>, T = 1/f.</li><li>Phase difference in radians.</li><li>Only transverse waves polarise.</li></ul>`)]),
LH('ap2-2-2','Stationary waves',10,'Two waves travelling opposite ways make a wave that doesn\'t go anywhere.',[
RM(`<p>Superposition: where waves meet, displacements add. c = fλ.</p>`),
T(`<h3>Nodes and antinodes</h3><p>Two waves of the same frequency travelling in opposite directions superpose into a <b>stationary wave</b>. <b>Nodes</b>: no movement. <b>Antinodes</b>: maximum amplitude. Nodes are λ/2 apart. No energy is transferred along it.</p>`),
T(`<h3>Strings</h3><p>A string fixed at both ends has a node at each end. The first harmonic is half a wavelength: λ = 2L.</p><div class="eq">f = (1/2L)√(T/μ)</div>${KY([['L','length of string','m'],['T','tension','N'],['μ','mass per unit length','kg/m']])}`),
N(`A 0.80 m string vibrates in its first harmonic at 200 Hz. Wave speed (m/s)?`,320,0.001,'m/s',`λ = 1.6 m, v = fλ = 320 m/s.`),
Q(`Doubling the tension multiplies the first harmonic frequency by…`,[`√2`,`2`,`4`,`½`],0,`f ∝ √T.`),
T(`<h3>Key points</h3><ul><li>Stationary waves: <b>nodes</b> and <b>antinodes</b>, no energy flow.</li><li>First harmonic: λ = 2L.</li><li><b>f = (1/2L)√(T/μ)</b>.</li></ul>`)]),
LH('ap2-2-3','Interference, diffraction and refraction',11,'Young\'s slits, gratings, and light bending at boundaries.',[
RM(`<p>Coherent sources: same frequency, constant phase difference. Path difference of whole wavelengths gives constructive interference.</p>`),
T(`<h3>Young's double slit</h3><div class="eq">w = λD/s</div>${KY([['w','fringe spacing','m'],['D','slits to screen','m'],['s','slit separation','m']])}`),
N(`λ = 600 nm, D = 2.0 m, s = 0.50 mm. Fringe spacing in mm?`,2.4,0.001,'mm',`600 × 10⁻⁹ × 2.0 ÷ 0.50 × 10⁻³ = 2.4 × 10⁻³ m.`),
T(`<h3>Diffraction gratings</h3><div class="eq">d sin θ = nλ</div><p>d is the line spacing (1 ÷ lines per metre). Very sharp, bright maxima: used to measure wavelengths precisely.</p>`),
T(`<h3>Refraction and total internal reflection</h3><p>n₁ sin θ₁ = n₂ sin θ₂. Going into a less dense medium, beyond the <b>critical angle</b> (sin θ<sub>c</sub> = n₂/n₁), all light reflects. Optical fibres use this, with cladding of lower n.</p>`),
Q(`Why do optical fibres have cladding?`,[`It has a lower refractive index, so light totally internally reflects at the core boundary`,`To make them stronger only`,`To absorb light`,`To make the light faster`],0,`TIR needs n<sub>core</sub> > n<sub>cladding</sub>.`),
T(`<h3>Key points</h3><ul><li>Young: <b>w = λD/s</b>. Grating: <b>d sin θ = nλ</b>.</li><li>Snell: <b>n₁ sin θ₁ = n₂ sin θ₂</b>.</li><li>TIR beyond the critical angle.</li></ul>`)])
]});

U({id:'ap2-3',track:'ap',level:2,title:'Mechanics and materials',icon:'F=ma',color:'#378ADD',desc:'Motion and projectiles, Newton\'s laws and momentum, and the properties of materials.',lessons:[
LH('ap2-3-1','Motion and projectiles',11,'suvat in two dimensions, and the effect of air resistance.',[
RM(`<p>suvat for constant acceleration. Resolving vectors into components.</p>`),
T(`<h3>Projectiles</h3><p>Treat horizontal and vertical <b>independently</b>. Horizontal: constant velocity. Vertical: acceleration g downwards. Time links them.</p>`),
W('calcDrill',{skill:'g_suvat',need:3},`suvat practice. Get 3 right to master it.`,`List s, u, v, a, t.`),
W('stepCalc',{steps:[`A ball rolls off a 1.25 m high table at 3.0 m/s. How far from the table does it land?`,`Vertical: s = 1.25 m, u = 0, a = 9.81. s = ½at² gives t = √(2 × 1.25/9.81) = 0.505 s`,`Horizontal: distance = 3.0 × 0.505`,`<b>≈ 1.5 m</b>`]},`A horizontal launch.`,`Find the time from the vertical motion first.`),
T(`<h3>Air resistance</h3><p>Drag increases with speed. A falling object reaches <b>terminal velocity</b> when drag equals weight. Projectiles with drag travel less far and land more steeply.</p>`),
T(`<h3>Key points</h3><ul><li>Horizontal and vertical are <b>independent</b>.</li><li>Time links them.</li><li>Drag: terminal velocity, shorter range.</li></ul>`)]),
LH('ap2-3-2','Newton\'s laws and momentum',11,'Force is the rate of change of momentum. That one idea covers collisions, rockets and impulse.',[
RM(`<p>F = ma. Momentum p = mv. Momentum is conserved in a closed system.</p>`),
T(`<h3>Newton's second law, properly</h3><div class="eq">F = Δ(mv)/Δt</div><p><b>Impulse</b> FΔt = change in momentum = the area under a force–time graph. Airbags and crumple zones increase Δt to reduce F.</p>`),
W('calcDrill',{skill:'g_impulse',need:2},`Impulse. Get 2 right to master it.`,`FΔt = Δp.`),
T(`<h3>Collisions</h3><ul><li>Momentum is <b>always</b> conserved (no external forces).</li><li><b>Elastic</b>: kinetic energy also conserved. <b>Inelastic</b>: some KE becomes heat and sound.</li></ul>`),
N(`A 2 kg trolley at 3 m/s sticks to a stationary 1 kg trolley. Common speed (m/s)?`,2,0.001,'m/s',`6 = 3v.`),
Q(`Why do crumple zones make crashes safer?`,[`They increase the collision time, reducing the force`,`They reduce the car's momentum before the crash`,`They make the car heavier`,`They stop momentum being conserved`],0,`F = Δp/Δt.`),
T(`<h3>Key points</h3><ul><li><b>F = Δp/Δt</b>; impulse = area under F–t.</li><li>Momentum always conserved; KE only in elastic collisions.</li><li>Longer Δt, smaller F.</li></ul>`)]),
LH('ap2-3-3','Materials',10,'Density, Hooke\'s law, stress, strain and the Young modulus.',[
RM(`<p>Hooke's law F = kΔL (up to the limit of proportionality). Elastic energy = ½FΔL.</p>`),
T(`<h3>Stress, strain and the Young modulus</h3><div class="eq">stress = F/A&nbsp;&nbsp; strain = ΔL/L&nbsp;&nbsp; E = stress/strain</div><p>The Young modulus is a property of the <b>material</b>, not the sample: steel is about 200 GPa.</p>`),
W('calcDrill',{skill:'p_young',need:2},`The Young modulus. Get 2 right to master it.`,`(F/A) ÷ (ΔL/L).`),
T(`<h3>Stress–strain graphs</h3><ul><li><b>Elastic</b>: returns to shape. <b>Plastic</b>: permanent stretch.</li><li><b>Brittle</b> (glass): snaps with little plastic deformation. <b>Ductile</b> (copper): can be drawn into wires.</li><li>Area under a force–extension graph = energy stored.</li></ul>`),
Q(`The Young modulus is the gradient of which graph?`,[`Stress against strain (linear part)`,`Force against length`,`Strain against time`,`Extension against force`],0,`E = stress/strain.`),
T(`<h3>Key points</h3><ul><li>Stress F/A, strain ΔL/L, <b>E = stress/strain</b>.</li><li>Elastic vs plastic; brittle vs ductile.</li><li>Energy = area under F–ΔL.</li></ul>`)])
]});

U({id:'ap2-4',track:'ap',level:2,title:'Electricity',icon:'Ω',color:'#D85A30',desc:'Resistance and resistivity, circuits and potential dividers, and emf and internal resistance.',lessons:[
LH('ap2-4-1','Resistance and resistivity',10,'Why some wires resist more than others, and superconductors that don\'t resist at all.',[
RM(`<p>V = IR. Current is the rate of flow of charge: I = ΔQ/Δt.</p>`),
T(`<h3>Resistivity</h3><div class="eq">R = ρL/A</div><p>ρ is the <b>resistivity</b> of the material (Ω m): copper 1.7 × 10⁻⁸, nichrome about 1.1 × 10⁻⁶.</p>`),
W('calcDrill',{skill:'p_resist',need:2},`Resistance of a wire. Get 2 right to master it.`,`A = π(d/2)², then ρL/A.`),
T(`<h3>I–V characteristics</h3><ul><li><b>Ohmic conductor</b> (constant temperature): straight line through the origin.</li><li><b>Filament lamp</b>: curve, resistance rises as it heats.</li><li><b>Diode</b>: conducts one way only, above about 0.6 V.</li><li><b>Thermistor</b> (NTC): resistance falls as temperature rises.</li></ul>`),
Q(`What's special about a superconductor below its critical temperature?`,[`Zero resistivity`,`Infinite resistance`,`It conducts one way only`,`It gets hotter`],0,`Used in MRI magnets and fusion magnets.`),
T(`<h3>Key points</h3><ul><li><b>R = ρL/A</b>.</li><li>Learn the I–V graphs.</li><li>Superconductors: zero resistance below T<sub>c</sub>.</li></ul>`)]),
LH('ap2-4-2','Circuits and potential dividers',10,'Series, parallel and potential dividers that make sensor circuits.',[
RM(`<p>Series: R = R₁ + R₂, same current. Parallel: 1/R = 1/R₁ + 1/R₂, same pd. Charge and energy are conserved (Kirchhoff).</p>`),
T(`<h3>Potential dividers</h3><div class="eq">V<sub>out</sub> = V<sub>in</sub> × R₂/(R₁ + R₂)</div><p>Replace R₂ with a thermistor or LDR and V<sub>out</sub> changes with temperature or light: a sensor.</p>`),
W('calcDrill',{skill:'p_potdiv',need:3},`Potential dividers. Get 3 right to master it.`,`V<sub>in</sub> × R₂/(R₁ + R₂).`),
Q(`An LDR is R₂. It gets darker (LDR resistance rises). V<sub>out</sub> across the LDR…`,[`rises`,`falls`,`stays the same`,`becomes zero`],0,`Bigger share of the resistance.`),
T(`<h3>Key points</h3><ul><li>Series and parallel rules; Kirchhoff's laws.</li><li><b>V<sub>out</sub> = V<sub>in</sub>R₂/(R₁ + R₂)</b>.</li><li>Sensors in potential dividers.</li></ul>`)]),
LH('ap2-4-3','EMF and internal resistance',10,'Real batteries lose some voltage inside themselves.',[
RM(`<p>V = IR. Series resistances add.</p>`),
T(`<h3>emf and lost volts</h3><div class="eq">ε = I(R + r) = V + Ir</div>${KY([['ε','emf: energy given per coulomb','V'],['r','internal resistance','Ω'],['Ir','"lost volts" inside the cell','V']])}`),
W('calcDrill',{skill:'p_emf',need:3},`Terminal pd. Get 3 right to master it.`,`I = ε/(R + r), V = ε − Ir.`),
T(`<h3>Measuring ε and r</h3><p>Plot terminal pd V against current I. V = ε − rI: the intercept is <b>ε</b>, the gradient is <b>−r</b>. (A required practical.)</p>`),
Q(`On a V–I graph for a cell, the gradient is…`,[`−r`,`ε`,`R`,`I`],0,`V = −rI + ε.`),
T(`<h3>Key points</h3><ul><li><b>ε = V + Ir</b>.</li><li>Lost volts rise with current.</li><li>V–I graph: intercept ε, gradient −r.</li></ul>`)])
]});

GOALS.ap1={icon:'🧱',title:'Bridge from GCSE',story:'Only if you need it: the measurement skills and GCSE physics A-level takes for granted.',final:'Ready for A-level physics',steps:['Measurements and uncertainties','GCSE physics at A-level speed']};
GOALS.ap2={icon:'🔭',title:'Master Year 12 physics',story:'Each unit is an AQA topic from Year 1 of the course.',final:'Year 12 complete',steps:['Particles and quantum phenomena','Waves','Mechanics and materials','Electricity']};
