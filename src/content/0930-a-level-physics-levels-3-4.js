/* ========== A-LEVEL PHYSICS · LEVEL 3 Year 13 · LEVEL 4 A* technique ========== */
CGEN.p_circ=function(){var m=cR(1,20)/10,v=cR(2,15),r=cR(2,20)/10,F=Math.round(m*v*v/r*100)/100;
 return {p:'A '+cNum(m)+' kg mass moves in a circle of radius '+cNum(r)+' m at '+v+' m/s. Find the centripetal force. (2 d.p.)',b:[cB(F,'F = ',' N','force',false,0.005)],e:'F = mv²/r = '+cNum(m)+' × '+(v*v)+' ÷ '+cNum(r)+' = '+cNum(F)+' N, towards the centre.'}};
CGEN.p_shm=function(){if(cR(0,1)){var m=cR(1,20)/10,k=cR(5,80),T=Math.round(2*Math.PI*Math.sqrt(m/k)*1000)/1000;return {p:'A '+cNum(m)+' kg mass on a spring of stiffness '+k+' N/m. Find the period. (3 d.p.)',b:[cB(T,'T = ',' s','period',false,0.003)],e:'T = 2π√(m/k) = 2π√('+cNum(m)+'/'+k+') = '+cNum(T)+' s.'}}
 var l=cR(2,30)/10,T2=Math.round(2*Math.PI*Math.sqrt(l/9.81)*1000)/1000;return {p:'A simple pendulum is '+cNum(l)+' m long. Find its period. (g = 9.81, 3 d.p.)',b:[cB(T2,'T = ',' s','period',false,0.003)],e:'T = 2π√(l/g) = 2π√('+cNum(l)+'/9.81) = '+cNum(T2)+' s. (Small swings only.)'}};
CGEN.p_gas=function(){var n=cR(1,5)/2,T=cR(250,400),V=cR(5,50)/1000,p=Math.round(n*8.31*T/V/100)*100;
 return {p:cNum(n)+' mol of ideal gas at '+T+' K in '+cNum(V*1000)+' litres ('+pE(V)+' m³). Find the pressure in kPa. (R = 8.31, nearest 0.1 kPa)',b:[cB(Math.round(n*8.31*T/V/100)/10,'p = ',' kPa','pressure',false,0.004)],e:'pV = nRT, so p = nRT/V = '+cNum(n)+' × 8.31 × '+T+' ÷ '+pE(V)+' = '+pE(n*8.31*T/V)+' Pa.'}};
CGEN.p_gheight=function(){var g0=9.81,k=cP([2,3,4,1.5,1.2]),g=Math.round(g0/(k*k)*1000)/1000;
 return {p:'At Earth\'s surface g = 9.81 N/kg. Find g at a distance of '+cNum(k)+' Earth radii from the centre. (3 d.p.)',b:[cB(g,'g = ',' N/kg','g',false,0.003)],e:'g = GM/r², so g ∝ 1/r². At '+cNum(k)+'R: 9.81 ÷ '+cNum(k)+'² = '+cNum(g)+' N/kg.'}};
CGEN.p_coulomb=function(){var q1=cR(1,9),q2=cR(1,9),r=cR(1,10)/10,F=Math.round(8.99e9*q1*1e-6*q2*1e-6/(r*r)*100)/100;
 return {p:'Two point charges of '+q1+' μC and '+q2+' μC are '+cNum(r)+' m apart. Force between them? (k = 8.99 × 10⁹, 2 d.p.)',b:[cB(F,'F = ',' N','force',false,0.005)],e:'F = kQ₁Q₂/r² = 8.99 × 10⁹ × '+q1+' × 10⁻⁶ × '+q2+' × 10⁻⁶ ÷ '+cNum(r*r)+' = '+cNum(F)+' N.'}};
CGEN.p_cap=function(){var Q0=cR(10,90),RC=cR(2,20),t=cR(1,30),Q=Math.round(Q0*Math.exp(-t/RC)*100)/100;
 return {p:'A capacitor starts with '+Q0+' μC and discharges through a resistor with RC = '+RC+' s. Charge after '+t+' s, in μC? (2 d.p.)',b:[cB(Q,'Q = ',' μC','charge',false,0.005)],e:'Q = Q₀e<sup>−t/RC</sup> = '+Q0+' × e<sup>−'+t+'/'+RC+'</sup> = '+cNum(Q)+' μC.'}};
CGEN.p_bil=function(){var B=cR(1,90)/100,I=cR(1,10),l=cR(5,50)/100,F=Math.round(B*I*l*1000)/1000;
 return {p:'A '+cNum(l)+' m wire carries '+I+' A at right angles to a '+cNum(B)+' T field. Find the force. (3 d.p.)',b:[cB(F,'F = ',' N','force',false,0.004)],e:'F = BIl = '+cNum(B)+' × '+I+' × '+cNum(l)+' = '+cNum(F)+' N. Direction: Fleming\'s left-hand rule.'}};
CGEN.p_trans=function(){var Vp=cP([230,400,11000,25000]),Np=cR(2,40)*50,Ns=cR(1,40)*10,Vs=Math.round(Vp*Ns/Np*100)/100;
 return {p:'An ideal transformer has '+Np+' primary turns and '+Ns+' secondary turns. Primary voltage '+Vp+' V. Secondary voltage? (2 d.p.)',b:[cB(Vs,'V<sub>s</sub> = ',' V','voltage',false,0.005)],e:'V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub>, so V<sub>s</sub> = '+Vp+' × '+Ns+'/'+Np+' = '+cNum(Vs)+' V.'}};
CGEN.p_massdef=function(){var dm=cR(1,300)/10000,E=Math.round(dm*931.5*100)/100;
 return {p:'A reaction loses '+cNum(dm)+' u of mass. Energy released in MeV? (1 u = 931.5 MeV, 2 d.p.)',b:[cB(E,'E = ',' MeV','energy',false,0.005)],e:'E = Δm × 931.5 = '+cNum(dm)+' × 931.5 = '+cNum(E)+' MeV.'}};
CGEN.p_radius=function(){var A=cP([12,16,27,56,64,125,208,216]),r=Math.round(1.2*Math.cbrt(A)*100)/100;
 return {p:'Estimate the radius of a nucleus with nucleon number A = '+A+', using R = R₀A<sup>1/3</sup>, R₀ = 1.2 fm. (2 d.p.)',b:[cB(r,'R = ',' fm','radius',false,0.005)],e:'R = 1.2 × '+A+'<sup>1/3</sup> = 1.2 × '+cNum(Math.round(Math.cbrt(A)*1000)/1000)+' = '+cNum(r)+' fm.'}};

/* ---- Level 3: Year 13 ---- */
U({id:'ap3-1',track:'ap',level:3,title:'Further mechanics and thermal physics',icon:'ω',color:'#7F77DD',desc:'Circular motion, simple harmonic motion, and thermal physics and ideal gases.',lessons:[
LH('ap3-1-1','Circular motion',10,'Moving at a steady speed in a circle still means accelerating, towards the centre.',[
RM(`<p>Radians: 2π rad = 360°. F = ma. Velocity is a vector.</p>`),
T(`<h3>Angular speed</h3><div class="eq">ω = θ/t = 2πf = v/r</div><p>The direction of velocity keeps changing, so there's an acceleration <b>towards the centre</b>:</p><div class="eq">a = v²/r = ω²r&nbsp;&nbsp;&nbsp; F = mv²/r = mω²r</div>`),
W('calcDrill',{skill:'p_circ',need:3},`Centripetal force. Get 3 right to master it.`,`F = mv²/r.`),
Q(`What provides the centripetal force for the Moon orbiting Earth?`,[`Gravity`,`Friction`,`Tension`,`Air resistance`],0,`A real force must provide it.`),
T(`<h3>Key points</h3><ul><li><b>ω = 2πf = v/r</b>.</li><li><b>a = v²/r</b>, towards the centre.</li><li>A real force (gravity, tension, friction) provides it.</li></ul>`)]),
LH('ap3-1-2','Simple harmonic motion',11,'Springs, pendulums and atoms in solids all oscillate the same way.',[
RM(`<p>Circular motion: ω = 2πf. sin and cos graphs. Hooke's law F = −kx.</p>`),
T(`<h3>The definition</h3><div class="eq">a = −ω²x</div><p>Acceleration is proportional to displacement and <b>opposite</b> to it. Solution: x = A cos(ωt). Maximum speed ωA at the centre; maximum acceleration ω²A at the ends.</p>`),
T(`<h3>Periods</h3><div class="eq">spring: T = 2π√(m/k)&nbsp;&nbsp; pendulum: T = 2π√(l/g)</div><p>Neither depends on amplitude (for small pendulum swings): that's why pendulum clocks work.</p>`),
W('calcDrill',{skill:'p_shm',need:3},`SHM periods. Get 3 right to master it.`,`2π√(m/k) or 2π√(l/g).`),
T(`<h3>Damping and resonance</h3><p>Damping removes energy, shrinking the amplitude. A forced oscillator driven at its <b>natural frequency</b> <b>resonates</b>: large amplitude. Useful in instruments and MRI; dangerous in bridges and machinery.</p>`),
Q(`Resonance happens when the driving frequency…`,[`equals the natural frequency`,`is zero`,`is double the natural frequency`,`is very large`],0,`Energy transfer is most efficient.`),
T(`<h3>Key points</h3><ul><li>SHM: <b>a = −ω²x</b>.</li><li><b>T = 2π√(m/k)</b>, <b>T = 2π√(l/g)</b>.</li><li>Damping and resonance.</li></ul>`)]),
LH('ap3-1-3','Thermal physics and ideal gases',11,'Heat capacity, latent heat, the gas laws and the kinetic theory behind them.',[
RM(`<p>Q = mcΔT. Q = mL for a change of state. Temperature in kelvin: T = θ + 273.</p>`),
T(`<h3>The ideal gas equation</h3><div class="eq">pV = nRT = NkT</div><p>Absolute zero (0 K) is where an ideal gas's pressure would reach zero. Always use <b>kelvin</b>.</p>`),
W('calcDrill',{skill:'p_gas',need:2},`Ideal gas pressure. Get 2 right to master it.`,`p = nRT/V.`),
T(`<h3>Kinetic theory</h3><div class="eq">pV = ⅓Nm(c<sub>rms</sub>)²&nbsp;&nbsp;&nbsp; average KE of a molecule = (3/2)kT</div><p>Temperature measures the average kinetic energy of the molecules. Assumptions include: elastic collisions, negligible molecule volume, no forces between collisions.</p>`),
Q(`Doubling the kelvin temperature of a gas doubles its molecules'…`,[`average kinetic energy`,`speed`,`mass`,`number`],0,`KE = (3/2)kT. (Speed rises by √2.)`),
T(`<h3>Key points</h3><ul><li><b>pV = nRT</b>, in kelvin.</li><li>Average molecular KE = <b>(3/2)kT</b>.</li><li>Q = mcΔT and Q = mL.</li></ul>`)])
]});

U({id:'ap3-2',track:'ap',level:3,title:'Fields and capacitors',icon:'g E',color:'#1D9E75',desc:'Gravitational fields and orbits, electric fields, and charging and discharging capacitors.',lessons:[
LH('ap3-2-1','Gravitational fields',11,'Newton\'s law of gravitation, field strength, potential and orbits.',[
RM(`<p>Circular motion: F = mv²/r. Inverse square laws: double the distance, a quarter of the effect.</p>`),
T(`<h3>The laws</h3><div class="eq">F = GMm/r²&nbsp;&nbsp;&nbsp; g = GM/r²&nbsp;&nbsp;&nbsp; V = −GM/r</div><p>Gravitational <b>potential</b> V is the work per kg to bring a mass from infinity; it's negative and zero at infinity. g = −dV/dr.</p>`),
W('calcDrill',{skill:'p_gheight',need:3},`g at a distance. Get 3 right to master it.`,`g ∝ 1/r².`),
T(`<h3>Orbits</h3><p>Gravity provides the centripetal force: GMm/r² = mv²/r gives v = √(GM/r), and <b>T² ∝ r³</b> (Kepler's third law). A <b>geostationary</b> satellite orbits once per day above the equator, at about 36,000 km altitude.</p>`),
Q(`A geostationary satellite has a period of…`,[`24 hours`,`90 minutes`,`1 year`,`12 hours`],0,`It stays above one point.`),
T(`<h3>Key points</h3><ul><li><b>F = GMm/r²</b>, <b>g = GM/r²</b>, <b>V = −GM/r</b>.</li><li>Orbits: <b>v = √(GM/r)</b>, <b>T² ∝ r³</b>.</li><li>Geostationary: 24 h period.</li></ul>`)]),
LH('ap3-2-2','Electric fields',10,'Coulomb\'s law mirrors gravity, except charges can repel.',[
RM(`<p>Gravitational fields: F = GMm/r². Like charges repel; unlike attract.</p>`),
T(`<h3>Coulomb's law</h3><div class="eq">F = Q₁Q₂/(4πε₀r²) = kQ₁Q₂/r²</div><p>k = 8.99 × 10⁹ N m² C⁻². Field strength E = F/Q. Between parallel plates the field is uniform: <b>E = V/d</b>.</p>`),
W('calcDrill',{skill:'p_coulomb',need:3},`Coulomb's law. Get 3 right to master it.`,`kQ₁Q₂/r².`),
T(`<h3>Compared with gravity</h3><ul><li>Both inverse-square.</li><li>Gravity always attracts; electric forces can repel.</li><li>Electric forces are vastly stronger: between two protons, about 10³⁶ times gravity.</li></ul>`),
Q(`Uniform field between plates 2 cm apart at 500 V. E = …`,[`25,000 V/m`,`250 V/m`,`10 V/m`,`1000 V/m`],0,`500/0.02.`),
T(`<h3>Key points</h3><ul><li><b>F = kQ₁Q₂/r²</b>.</li><li>Parallel plates: <b>E = V/d</b>.</li><li>Like gravity, but can repel and is far stronger.</li></ul>`)]),
LH('ap3-2-3','Capacitors',11,'Store charge, then release it exponentially through a resistor.',[
RM(`<p>Exponential decay: N = N₀e<sup>−λt</sup> (Calculus Level 5). V = IR.</p>`),
T(`<h3>Capacitance</h3><div class="eq">C = Q/V&nbsp;&nbsp;&nbsp; energy E = ½QV = ½CV²</div><p>Energy is the area under a Q–V graph.</p>`),
T(`<h3>Discharging</h3><p>Through a resistor R, the current depends on the charge left, so it's exponential:</p><div class="eq">Q = Q₀e<sup>−t/RC</sup></div><p>The <b>time constant</b> RC is the time to fall to 37% (1/e). It's the same differential equation as radioactive decay.</p>`),
W('calcDrill',{skill:'p_cap',need:3},`Capacitor discharge. Get 3 right to master it.`,`Q₀e<sup>−t/RC</sup>.`),
N(`R = 10 kΩ, C = 470 μF. Time constant in seconds? (1 d.p.)`,4.7,0.001,'s',`10⁴ × 4.7 × 10⁻⁴.`),
T(`<h3>Key points</h3><ul><li><b>C = Q/V</b>, <b>E = ½CV²</b>.</li><li>Discharge: <b>Q = Q₀e<sup>−t/RC</sup></b>.</li><li>Time constant <b>RC</b>: falls to 37%.</li></ul>`)])
]});

U({id:'ap3-3',track:'ap',level:3,title:'Magnetic fields',icon:'B',color:'#378ADD',desc:'Forces on wires and charges, electromagnetic induction, and transformers.',lessons:[
LH('ap3-3-1','Magnetic forces',10,'A current or a moving charge in a magnetic field feels a force at right angles.',[
RM(`<p>Fleming's left-hand rule: First finger Field, seCond finger Current, thuMb Motion. Circular motion: F = mv²/r.</p>`),
T(`<h3>The force laws</h3><div class="eq">on a wire: F = BIl&nbsp;&nbsp;&nbsp; on a charge: F = BQv</div><p>B is the magnetic flux density, in tesla (T). The force is perpendicular to both B and the motion.</p>`),
W('calcDrill',{skill:'p_bil',need:3},`F = BIl. Get 3 right to master it.`,`Multiply B, I and l.`),
T(`<h3>Charges in circles</h3><p>Because F is perpendicular to v, a charge in a uniform field moves in a <b>circle</b>: BQv = mv²/r, so <b>r = mv/(BQ)</b>. This is how <b>cyclotrons</b> accelerate particles and how mass spectrometers sort ions.</p>`),
Q(`Why does a charged particle move in a circle in a uniform magnetic field?`,[`The force is always perpendicular to its velocity`,`The force is parallel to its velocity`,`Magnetic fields slow particles down`,`It has no charge`],0,`A centripetal force.`),
T(`<h3>Key points</h3><ul><li><b>F = BIl</b>, <b>F = BQv</b>.</li><li>Perpendicular force → circular motion, <b>r = mv/BQ</b>.</li><li>Cyclotrons and mass spectrometers.</li></ul>`)]),
LH('ap3-3-2','Electromagnetic induction',11,'Change the magnetic flux through a coil and you get a voltage. Every power station depends on it.',[
RM(`<p>B is flux density in tesla. Generators turn coils in magnetic fields.</p>`),
T(`<h3>Flux and flux linkage</h3><div class="eq">Φ = BA cos θ&nbsp;&nbsp;&nbsp; flux linkage = NΦ</div>`),
T(`<h3>Faraday and Lenz</h3><div class="eq">ε = −N ΔΦ/Δt</div><p><b>Faraday</b>: the induced emf equals the rate of change of flux linkage. <b>Lenz</b> (the minus sign): the induced current opposes the change that caused it. Lenz's law is conservation of energy.</p>`),
N(`A 200-turn coil's flux changes by 3 × 10⁻³ Wb in 0.1 s. Size of the induced emf (V)?`,6,0.001,'V',`200 × 0.003 ÷ 0.1.`),
Q(`A magnet is pushed into a coil. Lenz's law says the induced current…`,[`creates a field that repels the approaching magnet`,`attracts the magnet`,`is zero`,`flows only after the magnet stops`],0,`It opposes the change.`),
T(`<h3>Key points</h3><ul><li><b>Φ = BA cos θ</b>; linkage NΦ.</li><li><b>ε = −N dΦ/dt</b>.</li><li>Lenz: opposes the change (energy conservation).</li></ul>`)]),
LH('ap3-3-3','Alternating current and transformers',10,'Why the grid uses AC and very high voltages.',[
RM(`<p>Electromagnetic induction needs a changing flux. RMS: V<sub>rms</sub> = V₀/√2 (Calculus Level 9).</p>`),
T(`<h3>AC</h3><p>Mains is 230 V <b>rms</b>, about 325 V peak, at 50 Hz. RMS values give the same power as the equivalent DC.</p>`),
T(`<h3>Transformers</h3><div class="eq">V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></div><p>An alternating current in the primary makes a changing flux in the iron core, inducing an emf in the secondary. They only work with AC.</p>`),
W('calcDrill',{skill:'p_trans',need:3},`Transformers. Get 3 right to master it.`,`V<sub>s</sub> = V<sub>p</sub>N<sub>s</sub>/N<sub>p</sub>.`),
T(`<h3>Why high voltage?</h3><p>Power lost in cables is I²R. For the same power, raising the voltage lowers the current, slashing losses. Sizewell B's generator output is stepped up to 400 kV for the National Grid.</p>`),
Q(`Transmitting at 10 times the voltage cuts cable losses by a factor of…`,[`100`,`10`,`1000`,`2`],0,`I falls 10×, I²R by 100×.`),
T(`<h3>Key points</h3><ul><li>230 V rms = 325 V peak.</li><li><b>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></b>.</li><li>High voltage → low current → low I²R losses.</li></ul>`)])
]});

U({id:'ap3-4',track:'ap',level:3,title:'Nuclear physics',icon:'☢',color:'#D85A30',desc:'Rutherford scattering and nuclear size, radioactive decay, and mass defect, fission and fusion.',lessons:[
LH('ap3-4-1','Inside the nucleus',10,'Rutherford found the nucleus by firing alpha particles at gold. How big is it?',[
RM(`<p>Coulomb repulsion between charges. The nucleus is tiny compared to the atom.</p>`),
T(`<h3>Rutherford scattering</h3><p>Most alpha particles passed straight through gold foil; a very few bounced back. So the atom is mostly empty, with a tiny, dense, positive <b>nucleus</b>.</p>`),
T(`<h3>Nuclear radius</h3><div class="eq">R = R₀A<sup>1/3</sup>,&nbsp;&nbsp; R₀ ≈ 1.2 fm</div><p>Volume ∝ R³ ∝ A, so every nucleus has about the <b>same density</b>, about 10¹⁷ kg/m³.</p>`),
W('calcDrill',{skill:'p_radius',need:3},`Nuclear radii. Get 3 right to master it.`,`1.2 × A<sup>1/3</sup>.`),
Q(`R ∝ A<sup>1/3</sup> tells us nuclear density is…`,[`about the same for all nuclei`,`higher for big nuclei`,`higher for small nuclei`,`zero`],0,`Mass ∝ A, volume ∝ A.`),
T(`<h3>Key points</h3><ul><li>Rutherford: tiny, dense, positive nucleus.</li><li><b>R = R₀A<sup>1/3</sup></b>.</li><li>Constant nuclear density.</li></ul>`)]),
LH('ap3-4-2','Radioactive decay',10,'Decay constant, half-life, activity and the inverse square law for gamma rays.',[
RM(`<p>N = N₀e<sup>−λt</sup>, A = λN, T½ = ln 2/λ (Calculus Level 5).</p>`),
T(`<h3>The equations</h3><div class="eq">A = λN&nbsp;&nbsp;&nbsp; N = N₀e<sup>−λt</sup>&nbsp;&nbsp;&nbsp; T½ = ln 2 / λ</div>`),
W('calcDrill',{skill:'decay',need:3},`Half-life and λ. Get 3 right to master it.`,`T½ = ln 2/λ.`),
T(`<h3>Gamma intensity</h3><p>Gamma radiation from a point source follows an <b>inverse square law</b>: I = k/x². Doubling the distance quarters the dose rate, which is why distance is a key protection.</p>`),
Q(`Moving from 1 m to 3 m from a gamma source, the intensity becomes…`,[`1/9 as much`,`1/3 as much`,`3 times more`,`unchanged`],0,`Inverse square.`),
T(`<h3>Key points</h3><ul><li><b>A = λN</b>, <b>N = N₀e<sup>−λt</sup></b>, <b>T½ = ln 2/λ</b>.</li><li>Gamma: <b>inverse square</b> with distance.</li><li>Background must be subtracted from count rates.</li></ul>`)]),
LH('ap3-4-3','Mass defect, fission and fusion',11,'A nucleus weighs less than its parts. That missing mass is where nuclear energy comes from.',[
RM(`<p>E = mc². 1 u = 931.5 MeV. Binding energy per nucleon peaks near iron (Level 2 Theory).</p>`),
T(`<h3>Mass defect and binding energy</h3><p>The mass of a nucleus is less than the total mass of its separate protons and neutrons. The difference, the <b>mass defect</b>, is the <b>binding energy</b> via E = mc².</p>`),
W('calcDrill',{skill:'p_massdef',need:3},`Energy from mass. Get 3 right to master it.`,`Δm × 931.5 MeV.`),
T(`<h3>Fission and fusion</h3><p>Both move towards the peak of the binding energy curve. Heavy nuclei <b>split</b> (fission of U-235 releases about 200 MeV); light nuclei <b>join</b> (D–T fusion releases 17.6 MeV).</p><p><b>Thermal reactors</b> need a <b>moderator</b> (to slow neutrons), <b>control rods</b> (to absorb them) and a <b>coolant</b>. Everything in the Critical theory track builds on this.</p>`),
W('matchPairs',{pairs:[['Moderator','Slows neutrons so they cause fission'],['Control rods','Absorb neutrons to control the rate'],['Coolant','Carries heat away from the core'],['Critical mass','Smallest mass for a self-sustaining chain reaction']]},`Match each reactor part.`),
T(`<h3>Key points</h3><ul><li><b>Mass defect</b> = binding energy / c².</li><li>Fission and fusion both climb towards iron.</li><li>Moderator, control rods, coolant.</li></ul>`)])
]});

/* ---- Level 4: A* technique ---- */
U({id:'ap4-1',track:'ap',level:4,title:'Practical skills',icon:'⚗',color:'#7F77DD',desc:'The required practicals, uncertainty analysis, and log graphs.',lessons:[
LH('ap4-1-1','The required practicals',11,'Twelve experiments you must know well enough to describe, analyse and improve.',[
RM(`<p>Uncertainties combine by adding absolutes (±) or percentages (× ÷). Linearise to y = mx + c.</p>`),
T(`<h3>Know each one</h3><ul><li>Stationary waves on a string; Young's slits and gratings; g by free fall.</li><li>Young modulus; resistivity of a wire; emf and internal resistance.</li><li>SHM (spring or pendulum); Boyle's law and Charles's law.</li><li>Capacitor charge and discharge; force on a wire in a field; induced emf in a search coil; inverse square law for gamma.</li></ul><p>For each: the method, what's plotted, what the gradient means, the main sources of uncertainty, and how to improve it.</p>`),
W('matchPairs',{pairs:[['Resistivity','Plot R against L; gradient = ρ/A'],['Internal resistance','Plot V against I; gradient = −r'],['Pendulum g','Plot T² against l; gradient = 4π²/g'],['Capacitor discharge','Plot ln V against t; gradient = −1/RC']]},`Match each practical to its graph.`),
Q(`In the resistivity practical, why measure the diameter at several places and angles?`,[`The wire may not be perfectly round or uniform, so averaging reduces random error`,`To make the wire longer`,`To heat the wire`,`To find the current`],0,`Random error.`),
T(`<h3>Key points</h3><ul><li>Know method, graph, gradient meaning, errors, improvements.</li><li>Average repeated readings to cut random error.</li><li>Watch for zero errors (systematic).</li></ul>`)]),
LH('ap4-1-2','Uncertainty in graphs',10,'Error bars, worst-fit lines and the uncertainty in a gradient.',[
RM(`<p>Percentage uncertainty = absolute ÷ value × 100. Gradients from large triangles.</p>`),
T(`<h3>Error bars and worst fit</h3><p>Plot each point with <b>error bars</b>. Draw the <b>best-fit</b> line, then the steepest or shallowest line that still passes through all the error bars: the <b>worst-fit</b> line.</p><div class="eq">uncertainty in gradient = |best − worst| gradient</div>`),
N(`Best-fit gradient 4.20, worst-fit 4.50. Percentage uncertainty in the gradient? (1 d.p.)`,7.1,0.01,'%',`0.30/4.20 × 100 = 7.1%.`),
T(`<h3>Precision and accuracy</h3><ul><li><b>Precise</b>: readings close together (small random error).</li><li><b>Accurate</b>: close to the true value (small systematic error).</li><li><b>Repeatable</b>: same person, same method; <b>reproducible</b>: different people or methods.</li></ul>`),
Q(`Readings are close together but all 5% too high. They're…`,[`precise but not accurate`,`accurate but not precise`,`both`,`neither`],0,`Systematic error.`),
T(`<h3>Key points</h3><ul><li>Error bars, best-fit and <b>worst-fit</b> lines.</li><li>Gradient uncertainty = |best − worst|.</li><li>Precise ≠ accurate.</li></ul>`)]),
LH('ap4-1-3','Logarithmic graphs',10,'When the relationship is a power or an exponential, logs straighten it out.',[
RM(`<p>ln(eˣ) = x. log(aⁿ) = n log a. y = mx + c.</p>`),
T(`<h3>Two cases</h3><ul><li><b>Power law</b> y = kxⁿ: log y = n log x + log k. Plot log y against log x: gradient <b>n</b>.</li><li><b>Exponential</b> y = Ae<sup>−λt</sup>: ln y = −λt + ln A. Plot ln y against t: gradient <b>−λ</b>.</li></ul>`),
Q(`Plotting ln(activity) against time gives a straight line of gradient −0.02 s⁻¹. λ = …`,[`0.02 s⁻¹`,`−0.02 s⁻¹`,`50 s`,`ln 0.02`],0,`Gradient = −λ.`),
N(`log T against log r gives gradient 1.5 (Kepler). If T ∝ rⁿ, what is n?`,1.5,0.001,'',`Gradient = n.`),
T(`<h3>Key points</h3><ul><li>Power law: <b>log–log</b>, gradient = power.</li><li>Exponential: <b>ln y against t</b>, gradient = −λ.</li><li>Intercepts give the constants.</li></ul>`)])
]});

U({id:'ap4-2',track:'ap',level:4,title:'Exam technique',icon:'✓',color:'#1D9E75',desc:'Synoptic questions, six-mark answers, and calculation habits that earn every mark.',lessons:[
LH('ap4-2-1','Synoptic questions',10,'The hardest questions join topics from different parts of the course.',[
RM(`<p>Every topic: mechanics, fields, waves, electricity, thermal, nuclear.</p>`),
T(`<h3>Spotting the links</h3><ul><li>A charge in a magnetic field: <b>circular motion</b> + <b>magnetism</b>.</li><li>A satellite: <b>gravity</b> + <b>circular motion</b> + <b>energy</b>.</li><li>Capacitor discharge: <b>electricity</b> + <b>exponentials</b>.</li><li>A nuclear reactor: <b>nuclear</b> + <b>thermal</b> + <b>momentum</b> (moderation).</li></ul>`),
Q(`A proton is accelerated through a pd, then enters a magnetic field. Which two ideas link?`,[`eV = ½mv², then BQv = mv²/r`,`F = ma only`,`Snell's law and Ohm's law`,`pV = nRT and E = hf`],0,`Energy then circular motion.`),
W('stepCalc',{steps:[`Why does a moderator use light nuclei?`,`Momentum and KE are conserved in an elastic collision.`,`A neutron hitting a nucleus of similar mass (like hydrogen) can lose most of its energy in one collision.`,`Hitting a heavy nucleus, it bounces off with almost the same speed.`,`<b>So light nuclei slow neutrons in the fewest collisions.</b>`]},`A synoptic explanation.`,`Mechanics explains reactor design.`),
T(`<h3>Key points</h3><ul><li>Ask which topics a situation joins.</li><li>Write the link explicitly (e.g. BQv = mv²/r).</li><li>Mechanics underpins almost everything.</li></ul>`)]),
LH('ap4-2-2','Six-mark answers',10,'Extended responses are marked on a logical sequence of clear, linked points.',[
RM(`<p>Level-of-response marking: quality and order of reasoning matter, not just facts.</p>`),
T(`<h3>How to write one</h3><ol><li><b>Plan</b>: jot down 5–6 points first.</li><li><b>Order</b> them logically (cause → effect, or method steps in sequence).</li><li>Use correct <b>physics terms</b>.</li><li>Link points with "so", "because", "therefore".</li><li>Answer the actual question, including any judgement it asks for.</li></ol>`),
O(`Order an answer describing how to find g with a falling ball.`,['Set up a light gate or timer and measure the drop height','Release the ball from rest and record the time','Repeat for several heights and average each time','Plot 2h against t² and find the gradient','The gradient equals g; compare with 9.81 m/s²'],`Logical sequence wins top marks.`),
Q(`What separates a top-level 6-mark answer?`,[`A logical, linked sequence of correct points`,`Lots of unconnected facts`,`One very long sentence`,`Repeating the question`],0,`Linked reasoning.`),
T(`<h3>Key points</h3><ul><li>Plan, order, link.</li><li>Use precise vocabulary.</li><li>Answer exactly what's asked.</li></ul>`)]),
LH('ap4-2-3','Calculation habits',9,'The small habits that stop you dropping easy marks.',[
RM(`<p>Prefixes, standard form, significant figures, units.</p>`),
T(`<h3>Habits</h3><ul><li><b>Write the equation</b> first, then substitute, then the answer: method marks survive a slip.</li><li><b>Convert</b> prefixes and units before substituting (mm → m, μF → F, °C → K).</li><li>Give <b>units</b> and a sensible number of <b>significant figures</b> (match the data, usually 2 or 3).</li><li><b>Carry</b> unrounded values through multi-step calculations.</li><li><b>Sanity-check</b>: is a speed faster than light? A resistance negative?</li></ul>`),
Q(`A question gives data to 3 s.f. How should you give your answer?`,[`To 3 s.f.`,`To 1 s.f.`,`Every digit on the calculator`,`As a fraction`],0,`Match the data.`),
Q(`Temperature in the ideal gas equation must be in…`,[`kelvin`,`°C`,`°F`,`any unit`],0,`Absolute temperature.`),
T(`<h3>Key points</h3><ul><li>Equation, substitution, answer, unit.</li><li>Convert prefixes first; kelvin for gases.</li><li>Sensible s.f.; sanity-check.</li></ul>`)])
]});

GOALS.ap3={icon:'🛰️',title:'Master Year 13 physics',story:'Each unit is an AQA topic from Year 2, ending with the nuclear physics this whole app is built around.',final:'Full A-level physics covered',steps:['Further mechanics and thermal physics','Fields and capacitors','Magnetic fields','Nuclear physics']};
GOALS.ap4={icon:'🏆',title:'Go for an A* in physics',story:'Practical skills and exam habits that separate an A from an A*.',final:'A* standard',steps:['Practical skills','Exam technique']};

/* ===== Quantum mechanics track ===== */
var QM_LEVELS=[null,['Quantum ideas','The experiments that broke classical physics, explained with pictures and simulations: photons, matter waves, energy levels and uncertainty. GCSE maths is enough.'],['The Schrödinger equation','Wavefunctions, quantised energy, the particle in a box, tunnelling, spin and entanglement. A-level maths and a little calculus.'],['The mathematical machinery','University years 1 to 2: complex amplitudes, operators and commutators, the harmonic oscillator and Dirac notation.'],['Atoms and approximations','University years 2 to 3: angular momentum, the hydrogen atom solved properly, identical particles and the periodic table, and approximation methods.'],['Frontiers','Graduate and research level: decoherence and interpretations, quantum computing, the Dirac equation and antimatter, and quantum field theory.'],['Quantum mechanics with calculus','Degree level, with full derivations: solve the Schrödinger equation yourself, scattering and tunnelling, Fourier transforms, and the oscillator, hydrogen and angular momentum algebra. Uses the Calculus track: Levels 15 to 18 cover the maths it needs.'],['Advanced quantum theory','Graduate level: deriving Fermi\'s golden rule, scattering theory and reactor cross sections, Berry phases, path integrals, Bell\'s theorem and entanglement entropy, and quantum field theory from Lagrangians and gauge symmetry. Calculus Levels 19 to 21 cover the maths it needs.']];
