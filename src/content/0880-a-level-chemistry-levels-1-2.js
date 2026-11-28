/* ========== A-LEVEL CHEMISTRY (AQA 7405) · LEVEL 1 bridge · LEVEL 2 Year 12 ========== */
CGEN.c_idealgas=function(){var p=cR(80,250)*1000,V=cR(5,40)/1000,T=cR(273,400),n=Math.round(p*V/(8.31*T)*1000)/1000;
 return {p:'A gas at '+(p/1000)+' kPa occupies '+(V*1000)+' dm³ at '+T+' K. How many moles? (R = 8.31, 3 d.p.)',b:[cB(n,'n = ',' mol','moles',false,0.004)],e:'Convert: p = '+pE(p)+' Pa, V = '+pE(V)+' m³. n = pV/RT = '+pE(p)+' × '+pE(V)+' ÷ (8.31 × '+T+') = '+cNum(n)+' mol.'}};
CGEN.c_enth=function(){var m=cR(25,100),dT=cR(3,30)/2,n=cR(5,50)/1000,q=m*4.18*dT,H=Math.round(-q/n/1000*10)/10;
 return {p:m+' g of water rises by '+cNum(dT)+' °C when '+cNum(n)+' mol of fuel burns. Find ΔH in kJ mol⁻¹. (c = 4.18 J g⁻¹ K⁻¹, 1 d.p.)',b:[cB(H,'ΔH = ',' kJ mol⁻¹','enthalpy',false,0.005)],e:'q = mcΔT = '+m+' × 4.18 × '+cNum(dT)+' = '+cNum(Math.round(q*10)/10)+' J. ΔH = −q/n = −'+cNum(Math.round(q*10)/10)+' ÷ '+cNum(n)+' = '+cNum(H)+' kJ mol⁻¹ (negative: exothermic).'}};
CGEN.c_bondH=function(){var R=cP([['CH₄ + 2O₂ → CO₂ + 2H₂O','4(C–H) + 2(O=O)','2(C=O) + 4(O–H)',4*413+2*498,2*805+4*464],['H₂ + Cl₂ → 2HCl','H–H + Cl–Cl','2(H–Cl)',436+243,2*432],['N₂ + 3H₂ → 2NH₃','N≡N + 3(H–H)','6(N–H)',945+3*436,6*391],['2H₂ + O₂ → 2H₂O','2(H–H) + O=O','4(O–H)',2*436+498,4*464]]),v=R[3]-R[4];
 return {p:'Use mean bond enthalpies to find ΔH for '+R[0]+'. (C–H 413, O=O 498, C=O 805, O–H 464, H–H 436, Cl–Cl 243, H–Cl 432, N≡N 945, N–H 391 kJ mol⁻¹)',b:[cB(v,'ΔH = ',' kJ mol⁻¹','enthalpy')],e:'Broken: '+R[1]+' = '+R[3]+'. Made: '+R[2]+' = '+R[4]+'. ΔH = broken − made = '+cNum(v)+' kJ mol⁻¹.'}};
CGEN.c_kc=function(){var A=cR(1,9)/10,B=cR(1,9)/10,C=cR(1,20)/10,K=Math.round(C*C/(A*B)*100)/100;
 return {p:'H₂ + I₂ ⇌ 2HI. At equilibrium [H₂] = '+A+', [I₂] = '+B+', [HI] = '+C+' mol dm⁻³. Find K<sub>c</sub>. (2 d.p.)',b:[cB(K,'K<sub>c</sub> = ','','Kc',false,0.006)],e:'K<sub>c</sub> = [HI]² ÷ ([H₂][I₂]) = '+cNum(C*C)+' ÷ ('+A+' × '+B+') = '+cNum(K)+'. No units: they cancel here.'}};
CGEN.c_mr=function(){var F=cP([['H₂SO₄',98.1],['CaCO₃',100.1],['NaOH',40.0],['C₆H₁₂O₆',180.0],['MgCl₂',95.3],['CuSO₄·5H₂O',249.7],['NH₄NO₃',80.0],['Na₂CO₃',106.0]]),m=cR(1,50),n=Math.round(m/F[1]*10000)/10000;
 return {p:'How many moles in '+m+' g of '+F[0]+'? (M<sub>r</sub> = '+F[1]+', 4 d.p.)',b:[cB(n,'n = ',' mol','moles',false,0.003)],e:'n = m/M<sub>r</sub> = '+m+' ÷ '+F[1]+' = '+cNum(n)+' mol.'}};

/* ---- Level 1: GCSE to A-level ---- */
U({id:'ac1-1',track:'ac',level:1,title:'Moles and equations',icon:'mol',color:'#7F77DD',desc:'Moles from masses and solutions, balancing equations and ionic equations.',lessons:[
LH('ac1-1-1','The mole',9,'Chemists count particles by weighing them. The mole makes that possible.',[
RM(`<p>Relative formula mass M<sub>r</sub> = sum of the relative atomic masses. One mole = 6.02 × 10²³ particles (Avogadro's constant).</p>`),
T(`<h3>The key equation</h3><div class="eq">n = m / M<sub>r</sub></div>${KY([['n','amount','mol'],['m','mass','g'],['M<sub>r</sub>','relative formula mass','g mol⁻¹']])}<p>Number of particles = n × 6.02 × 10²³.</p>`),
W('calcDrill',{skill:'c_mr',need:3},`Moles from mass. Get 3 right to master it.`,`n = m/M<sub>r</sub>.`),
N(`How many molecules in 0.50 mol of water? (× 10²³, 2 d.p.)`,3.01,0.005,'× 10²³',`0.50 × 6.02 × 10²³.`),
T(`<h3>Reacting masses</h3><p>Masses → moles → use the equation's ratio → moles → masses. In 2H₂ + O₂ → 2H₂O, 2 mol of H₂ gives 2 mol of H₂O.</p>`),
T(`<h3>Key points</h3><ul><li><b>n = m/M<sub>r</sub></b>.</li><li>Particles = n × 6.02 × 10²³.</li><li>Mass → moles → ratio → moles → mass.</li></ul>`)]),
LH('ac1-1-2','Solutions and titrations',10,'Concentration, and how titrations measure it precisely.',[
RM(`<p>n = m/M<sub>r</sub>. 1 dm³ = 1000 cm³.</p>`),
T(`<h3>Concentration</h3><div class="eq">n = c × V&nbsp;&nbsp;(V in dm³)</div><p>Divide cm³ by 1000 to get dm³.</p>`),
W('calcDrill',{skill:'g_conc',need:3},`Concentration. Get 3 right to master it.`,`n = cV.`),
T(`<h3>Titrations</h3><ol><li>Moles of the known solution: n = cV.</li><li>Use the equation's ratio.</li><li>Concentration of the unknown: c = n/V.</li></ol><p>Use <b>concordant</b> titres (within 0.10 cm³) for the mean.</p>`),
W('calcDrill',{skill:'g_titr',need:2},`Titration calculations. Get 2 right to master it.`,`n = cV, ratio, c = n/V.`),
T(`<h3>Key points</h3><ul><li><b>n = cV</b>, V in dm³.</li><li>Titration: moles, ratio, concentration.</li><li>Average concordant titres only.</li></ul>`)]),
LH('ac1-1-3','Balancing and ionic equations',9,'State symbols, balancing, and showing only the ions that react.',[
RM(`<p>Atoms aren't created or destroyed. Soluble ionic compounds split into ions in solution.</p>`),
T(`<h3>Balancing</h3><p>Change the big numbers in front, never the formulas. Balance elements that appear once first, then the rest. Include state symbols: (s), (l), (g), (aq).</p>`),
W('calcDrill',{skill:'g_balance',need:3},`Balancing equations. Get 3 right to master it.`,`Count atoms on each side.`),
T(`<h3>Ionic equations</h3><p>Write only the ions that change. Every acid–alkali neutralisation is:</p><div class="eq">H⁺(aq) + OH⁻(aq) → H₂O(l)</div><p>The other ions are <b>spectator ions</b>.</p>`),
Q(`Ionic equation for silver chloride precipitating from AgNO₃ and NaCl?`,[`Ag⁺(aq) + Cl⁻(aq) → AgCl(s)`,`AgNO₃ + NaCl → AgCl + NaNO₃`,`Na⁺ + NO₃⁻ → NaNO₃`,`Ag + Cl → AgCl`],0,`Na⁺ and NO₃⁻ are spectators.`),
T(`<h3>Key points</h3><ul><li>Balance with coefficients only.</li><li>State symbols.</li><li><b>Ionic equations</b> leave out spectator ions.</li></ul>`)])
]});

U({id:'ac1-2',track:'ac',level:1,title:'Atoms and bonding',icon:'e⁻',color:'#1D9E75',desc:'Atomic structure and isotopes, and the three types of bonding.',lessons:[
LH('ac1-2-1','Atoms and isotopes',9,'Protons, neutrons, electrons, and why relative atomic masses aren\'t whole numbers.',[
RM(`<p>Protons +1, neutrons 0, electrons −1. Mass number = protons + neutrons. Isotopes: same protons, different neutrons.</p>`),
T(`<h3>Relative atomic mass</h3><p>A<sub>r</sub> is the <b>weighted mean</b> mass of an element's isotopes, relative to 1/12 of carbon-12:</p><div class="eq">A<sub>r</sub> = Σ(isotope mass × abundance) ÷ total abundance</div>`),
N(`Chlorine: 75% Cl-35, 25% Cl-37. A<sub>r</sub>? (1 d.p.)`,35.5,0.001,'',`(35 × 75 + 37 × 25)/100 = 35.5.`),
Q(`Isotopes of an element have the same chemical properties because they have the same…`,[`electron arrangement`,`mass`,`number of neutrons`,`density`],0,`Chemistry is about electrons.`),
T(`<h3>Key points</h3><ul><li>A<sub>r</sub> is a <b>weighted mean</b> relative to ¹²C.</li><li>Isotopes: same chemistry, different mass.</li><li>Mass spectrometry measures isotope abundances (Year 12).</li></ul>`)]),
LH('ac1-2-2','Ionic, covalent and metallic bonding',10,'Three ways atoms hold together, and the properties each one gives.',[
RM(`<p>Metals lose electrons to form positive ions; non-metals gain them to form negative ions. Covalent bonds share pairs of electrons.</p>`),
T(`<h3>The three types</h3><ul><li><b>Ionic</b>: electrostatic attraction between oppositely charged ions in a giant lattice. High melting points; conduct when molten or dissolved.</li><li><b>Covalent</b>: a shared pair of electrons. Simple molecules (low melting points) or giant covalent structures (diamond, very high).</li><li><b>Metallic</b>: positive ions in a sea of delocalised electrons. Conduct; malleable.</li></ul>`),
W('matchPairs',{pairs:[['NaCl','Ionic lattice'],['Diamond','Giant covalent'],['CO₂','Simple molecular'],['Copper','Metallic']]},`Match each substance to its structure.`),
Q(`Why do ionic compounds conduct when molten but not when solid?`,[`The ions are free to move when molten`,`Electrons appear when it melts`,`Solids have no ions`,`Heat conducts electricity`],0,`Mobile charge carriers.`),
T(`<h3>Key points</h3><ul><li><b>Ionic</b>: lattice of ions. <b>Covalent</b>: shared pairs. <b>Metallic</b>: delocalised electrons.</li><li>Structure explains melting point and conductivity.</li><li>Simple molecular: weak forces between molecules.</li></ul>`)]),
LH('ac1-2-3','Electron shells to sub-shells',9,'GCSE\'s 2,8,8 becomes s, p and d sub-shells at A-level.',[
RM(`<p>GCSE electron shells: 2, 8, 8. The outer shell decides the group.</p>`),
T(`<h3>Sub-shells</h3><p>Shells split into <b>sub-shells</b>: s (holds 2), p (6), d (10). Fill in order of energy:</p><div class="eq">1s 2s 2p 3s 3p 4s 3d 4p</div><p>Sodium (11 electrons): 1s² 2s² 2p⁶ 3s¹. Note 4s fills <b>before</b> 3d.</p>`),
Q(`Electron configuration of oxygen (8 electrons)?`,[`1s² 2s² 2p⁴`,`1s² 2s⁶`,`1s² 2p⁶`,`2, 6`],0,`2 + 2 + 4.`),
T(`<h3>Blocks of the periodic table</h3><p>Groups 1–2 are the <b>s-block</b>, groups 3–0 the <b>p-block</b>, transition metals the <b>d-block</b>: named after the sub-shell being filled.</p>`),
T(`<h3>Key points</h3><ul><li>s holds 2, p 6, d 10.</li><li>Order: 1s 2s 2p 3s 3p <b>4s 3d</b> 4p.</li><li>s, p and d blocks.</li></ul>`)])
]});

/* ---- Level 2: Year 12 ---- */
U({id:'ac2-1',track:'ac',level:2,title:'Atomic structure and amount of substance',icon:'IE',color:'#7F77DD',desc:'Electron configurations and ionisation energies, mass spectrometry, and the ideal gas equation and yields.',lessons:[
LH('ac2-1-1','Ionisation energies',11,'How hard it is to pull electrons off reveals the shells inside the atom.',[
RM(`<p>Sub-shells s, p, d fill in energy order. Nuclear charge attracts electrons; inner electrons shield outer ones.</p>`),
T(`<h3>First ionisation energy</h3><p>The energy to remove one mole of electrons from one mole of gaseous atoms:</p><div class="eq">X(g) → X⁺(g) + e⁻</div><p>It depends on <b>nuclear charge</b>, <b>distance</b> from the nucleus and <b>shielding</b>.</p>`),
T(`<h3>Trends</h3><ul><li><b>Down a group</b>: falls (more shells, more shielding, further away).</li><li><b>Across a period</b>: generally rises (more protons, similar shielding).</li><li><b>Dips</b>: Al is lower than Mg (3p electron is higher in energy than 3s), and S is lower than P (pairing repulsion in a 3p orbital).</li></ul>`),
Q(`Why is the first ionisation energy of aluminium lower than magnesium's?`,[`Al's outer electron is in a 3p sub-shell, higher in energy than 3s`,`Al has fewer protons`,`Al is a non-metal`,`Mg has more shielding`],0,`The p-electron is easier to remove.`),
T(`<h3>Successive ionisation energies</h3><p>A big jump shows a new, inner shell. For sodium the jump is between the 1st and 2nd ionisation energies: Na has 1 outer electron, so it's in group 1.</p>`),
Q(`An element's big jump comes between its 3rd and 4th ionisation energies. Which group?`,[`Group 3`,`Group 4`,`Group 2`,`Group 1`],0,`Three outer electrons.`),
T(`<h3>Key points</h3><ul><li>X(g) → X⁺(g) + e⁻.</li><li>Down a group falls; across a period rises, with dips at groups 3 and 6.</li><li>Jumps in successive IEs show shells.</li></ul>`)]),
LH('ac2-1-2','Mass spectrometry and formulae',10,'Measure the masses of ions, and work out empirical and molecular formulae.',[
RM(`<p>A<sub>r</sub> is a weighted mean of isotope masses. n = m/M<sub>r</sub>.</p>`),
T(`<h3>Time-of-flight mass spectrometry</h3><ol><li><b>Ionisation</b> (electrospray or electron impact).</li><li><b>Acceleration</b>: all ions get the same kinetic energy.</li><li><b>Ion drift</b>: lighter ions move faster.</li><li><b>Detection</b>: lighter ions arrive first.</li></ol><p>The spectrum gives m/z and abundance; the molecular ion peak gives M<sub>r</sub>.</p>`),
O(`Order the stages of TOF mass spectrometry.`,['Ionisation','Acceleration','Ion drift','Detection'],`Same KE, so lighter ions arrive first.`),
T(`<h3>Empirical formula</h3><p>Divide each element's mass (or %) by its A<sub>r</sub>, then divide by the smallest. 40% C, 6.7% H, 53.3% O: 3.33 : 6.7 : 3.33 → <b>CH₂O</b>. Molecular formula = a multiple of it matching M<sub>r</sub>.</p>`),
Q(`Empirical formula CH₂O, M<sub>r</sub> = 180. Molecular formula?`,[`C₆H₁₂O₆`,`CH₂O`,`C₃H₆O₃`,`C₁₂H₂₄O₁₂`],0,`180 ÷ 30 = 6.`),
T(`<h3>Key points</h3><ul><li>TOF: ionise, accelerate, drift, detect.</li><li>Molecular ion peak = M<sub>r</sub>.</li><li>Empirical formula from % ÷ A<sub>r</sub>.</li></ul>`)]),
LH('ac2-1-3','Gases, yield and atom economy',11,'The ideal gas equation, and how efficient a reaction really is.',[
RM(`<p>n = m/M<sub>r</sub>. Kelvin = °C + 273. 1 m³ = 1000 dm³ = 10⁶ cm³.</p>`),
T(`<h3>pV = nRT</h3><p>Units matter: p in <b>Pa</b>, V in <b>m³</b>, T in <b>K</b>, R = 8.31 J K⁻¹ mol⁻¹.</p>`),
W('calcDrill',{skill:'c_idealgas',need:2},`Ideal gas moles. Get 2 right to master it.`,`Convert units first.`),
T(`<h3>Percentage yield and atom economy</h3><div class="eq">% yield = actual ÷ theoretical × 100<br>atom economy = M<sub>r</sub> of desired product ÷ total M<sub>r</sub> of reactants × 100</div><p>High atom economy means less waste: greener and cheaper.</p>`),
W('calcDrill',{skill:'g_atomecon',need:2},`Atom economy. Get 2 right to master it.`,`Desired ÷ total × 100.`),
Q(`An addition reaction makes only one product. Its atom economy is…`,[`100%`,`50%`,`0%`,`It depends on the yield`],0,`No waste products.`),
T(`<h3>Key points</h3><ul><li><b>pV = nRT</b> in Pa, m³, K.</li><li>% yield = actual/theoretical.</li><li>Atom economy = desired/total M<sub>r</sub>.</li></ul>`)])
]});

U({id:'ac2-2',track:'ac',level:2,title:'Bonding and energetics',icon:'ΔH',color:'#1D9E75',desc:'Shapes of molecules, electronegativity and intermolecular forces, and enthalpy changes.',lessons:[
LH('ac2-2-1','Shapes of molecules',11,'Electron pairs repel and spread out. That fixes every molecule\'s shape.',[
RM(`<p>Covalent bonds are shared pairs. Some atoms also have lone pairs.</p>`),
T(`<h3>VSEPR</h3><p>Electron pairs around the central atom repel and get as far apart as possible. <b>Lone pairs repel more</b> than bonding pairs, squeezing bond angles by about 2.5° each.</p><table class="wtable"><tr><th>Pairs</th><th>Shape</th><th>Angle</th></tr><tr><td>2</td><td>linear</td><td>180°</td></tr><tr><td>3</td><td>trigonal planar</td><td>120°</td></tr><tr><td>4</td><td>tetrahedral</td><td>109.5°</td></tr><tr><td>4 (1 lone)</td><td>pyramidal (NH₃)</td><td>107°</td></tr><tr><td>4 (2 lone)</td><td>bent (H₂O)</td><td>104.5°</td></tr><tr><td>6</td><td>octahedral</td><td>90°</td></tr></table>`),
W('matchPairs',{pairs:[['CH₄','Tetrahedral, 109.5°'],['NH₃','Pyramidal, 107°'],['H₂O','Bent, 104.5°'],['SF₆','Octahedral, 90°'],['BF₃','Trigonal planar, 120°']]},`Match each molecule to its shape.`),
Q(`Why is the angle in water smaller than in methane?`,[`Two lone pairs repel more strongly than bonding pairs`,`Water is smaller`,`Oxygen has fewer electrons`,`Hydrogen bonds pull them together`],0,`Lone pair repulsion.`),
T(`<h3>Key points</h3><ul><li>Pairs repel to maximise separation.</li><li><b>Lone pairs repel more</b>: about −2.5° each.</li><li>Learn the six shapes and angles.</li></ul>`)]),
LH('ac2-2-2','Electronegativity and intermolecular forces',11,'Why water boils at 100 °C while methane boils at −162 °C.',[
RM(`<p>Simple molecular substances have weak forces between molecules. Shapes from VSEPR.</p>`),
T(`<h3>Electronegativity</h3><p>The power of an atom to attract the bonding electrons. Fluorine is the most electronegative. Unequal sharing makes a <b>polar</b> bond (δ+ and δ−). A symmetrical molecule like CO₂ can have polar bonds but no overall dipole.</p>`),
T(`<h3>Three intermolecular forces (weakest to strongest)</h3><ul><li><b>Van der Waals (induced dipole–dipole)</b>: in all molecules; bigger molecules, stronger.</li><li><b>Permanent dipole–dipole</b>: between polar molecules.</li><li><b>Hydrogen bonding</b>: H bonded to N, O or F, attracted to a lone pair on N, O or F of another molecule.</li></ul>`),
Q(`Why does water have such a high boiling point for its size?`,[`Hydrogen bonding between molecules`,`Covalent bonds break when it boils`,`It's an ionic compound`,`Van der Waals forces only`],0,`H bonded to O.`),
Q(`CO₂ has polar bonds but is non-polar overall because…`,[`it's linear, so the dipoles cancel`,`carbon is more electronegative`,`it has hydrogen bonds`,`its bonds are ionic`],0,`Symmetry.`),
T(`<h3>Key points</h3><ul><li>Electronegativity difference → polar bond.</li><li>Van der Waals < dipole–dipole < <b>hydrogen bonding</b>.</li><li>Boiling simple molecules breaks intermolecular forces, not covalent bonds.</li></ul>`)]),
LH('ac2-2-3','Enthalpy changes',11,'Measuring heat, Hess\'s law and bond enthalpies.',[
RM(`<p>Exothermic releases heat (ΔH negative); endothermic absorbs it (ΔH positive). q = mcΔT.</p>`),
T(`<h3>Calorimetry</h3><div class="eq">q = mcΔT&nbsp;&nbsp;&nbsp; ΔH = −q/n</div><p>m is the mass of <b>water</b> (or solution) heated, not the fuel.</p>`),
W('calcDrill',{skill:'c_enth',need:2},`Enthalpy from calorimetry. Get 2 right to master it.`,`q = mcΔT, ΔH = −q/n.`),
T(`<h3>Hess's law</h3><p>The enthalpy change for a reaction is the same whatever the route. So you can find ΔH by going round a cycle via formation or combustion data.</p>`),
T(`<h3>Bond enthalpies</h3><div class="eq">ΔH = Σ(bonds broken) − Σ(bonds made)</div><p>Mean bond enthalpies are averages over many compounds, so answers are approximate.</p>`),
W('calcDrill',{skill:'c_bondH',need:2},`Bond enthalpy calculations. Get 2 right to master it.`,`Broken minus made.`),
T(`<h3>Key points</h3><ul><li><b>q = mcΔT</b>, <b>ΔH = −q/n</b>.</li><li><b>Hess</b>: route doesn't matter.</li><li>Bond enthalpies: <b>broken − made</b>.</li></ul>`)])
]});

U({id:'ac2-3',track:'ac',level:2,title:'Kinetics, equilibria and inorganic chemistry',icon:'⇌',color:'#378ADD',desc:'Reaction rates, equilibria and Kc, redox, and groups 2 and 7.',lessons:[
LH('ac2-3-1','Rates and the Maxwell–Boltzmann distribution',10,'Why a small temperature rise can double a reaction\'s rate.',[
RM(`<p>Particles must collide with at least the activation energy to react. Catalysts speed reactions up without being used up.</p>`),
T(`<h3>Maxwell–Boltzmann</h3><p>Molecules in a gas have a spread of energies. Only those beyond the <b>activation energy</b> E<sub>a</sub> can react. Raising the temperature shifts the curve right and flattens it: many <b>more</b> molecules exceed E<sub>a</sub>.</p>`),
Q(`Why does a 10 °C rise often double the rate?`,[`The number of molecules with energy above E<sub>a</sub> increases a lot`,`Molecules get bigger`,`E<sub>a</sub> doubles`,`The number of molecules doubles`],0,`The area beyond E<sub>a</sub> grows sharply.`),
T(`<h3>Catalysts</h3><p>Provide an alternative route with <b>lower E<sub>a</sub></b>. On the Maxwell–Boltzmann graph, E<sub>a</sub> moves left: more molecules can react, at the same temperature.</p>`),
Q(`A catalyst changes the Maxwell–Boltzmann curve by…`,[`not changing the curve, but lowering E<sub>a</sub>`,`shifting it right`,`making it taller`,`removing slow molecules`],0,`Same distribution, lower barrier.`),
T(`<h3>Key points</h3><ul><li>Only molecules with E ≥ E<sub>a</sub> react.</li><li>Higher T: many more above E<sub>a</sub>.</li><li>Catalyst: lower E<sub>a</sub>, same curve.</li></ul>`)]),
LH('ac2-3-2','Equilibria',11,'Reversible reactions settle to a balance that shifts when you change the conditions.',[
RM(`<p>⇌ means a reversible reaction. At equilibrium, forward and backward rates are equal.</p>`),
T(`<h3>Le Chatelier's principle</h3><p>If conditions change, the equilibrium shifts to <b>oppose</b> the change:</p><ul><li>Add reactant: shifts right.</li><li>Raise temperature: shifts in the <b>endothermic</b> direction.</li><li>Raise pressure: shifts to the side with <b>fewer gas moles</b>.</li><li>Catalyst: no shift, just reaches equilibrium faster.</li></ul>`),
Q(`N₂ + 3H₂ ⇌ 2NH₃ (exothermic). Raising pressure shifts it…`,[`right: fewer gas moles`,`left`,`nowhere`,`right, because it's exothermic`],0,`4 moles → 2.`),
T(`<h3>K<sub>c</sub></h3><p>For aA + bB ⇌ cC + dD:</p><div class="eq">K<sub>c</sub> = [C]ᶜ[D]ᵈ ÷ [A]ᵃ[B]ᵇ</div><p>Only <b>temperature</b> changes K<sub>c</sub>. Concentration and pressure shift the position but not K<sub>c</sub>.</p>`),
W('calcDrill',{skill:'c_kc',need:3},`K<sub>c</sub> calculations. Get 3 right to master it.`,`Products over reactants, powered by coefficients.`),
T(`<h3>Key points</h3><ul><li><b>Le Chatelier</b>: shifts to oppose the change.</li><li><b>K<sub>c</sub> = products/reactants</b>, with powers.</li><li>Only temperature changes K<sub>c</sub>.</li></ul>`)]),
LH('ac2-3-3','Redox, group 2 and the halogens',11,'Oxidation states, and the trends down two important groups.',[
RM(`<p>OIL RIG: oxidation is loss of electrons, reduction is gain. Group trends come from atomic size and shielding.</p>`),
T(`<h3>Oxidation states</h3><p>Elements are 0. In compounds, O is usually −2, H +1, and the total equals the overall charge. In SO₄²⁻: S + 4(−2) = −2, so S is <b>+6</b>.</p>`),
N(`Oxidation state of Mn in MnO₄⁻?`,7,0.001,'',`Mn + 4(−2) = −1, so Mn = +7.`),
T(`<h3>Group 2</h3><ul><li>Atomic radius rises, first IE falls, reactivity with water rises down the group.</li><li>Hydroxides get <b>more soluble</b> down the group; sulfates get <b>less soluble</b> (BaSO₄ test for sulfate).</li><li>Mg(OH)₂ treats indigestion; BaSO₄ is used in X-ray "barium meals".</li></ul>`),
T(`<h3>Group 7</h3><ul><li>Oxidising power <b>falls</b> down the group: Cl₂ oxidises Br⁻ and I⁻.</li><li>Halide ions get <b>stronger reducing agents</b> down the group.</li><li>Silver nitrate test: AgCl white, AgBr cream, AgI yellow.</li></ul>`),
Q(`Chlorine water is added to potassium bromide. What happens?`,[`Bromine forms: Cl₂ oxidises Br⁻`,`Nothing`,`Chlorine forms`,`A white precipitate`],0,`Cl₂ is the stronger oxidising agent.`),
T(`<h3>Key points</h3><ul><li>Oxidation states sum to the overall charge.</li><li>Group 2: hydroxides more soluble, sulfates less, down the group.</li><li>Group 7: oxidising power falls down; AgX colours.</li></ul>`)])
]});

U({id:'ac2-4',track:'ac',level:2,title:'Organic chemistry 1',icon:'C–C',color:'#D85A30',desc:'Naming and isomerism, alkanes and halogenoalkanes, alkenes and alcohols.',lessons:[
LH('ac2-4-1','Naming and isomerism',10,'IUPAC names, and molecules with the same formula but different structures.',[
RM(`<p>Homologous series share a general formula and functional group. Alkanes CₙH₂ₙ₊₂, alkenes CₙH₂ₙ.</p>`),
T(`<h3>Naming</h3><p>Find the longest carbon chain (meth-, eth-, prop-, but-, pent-, hex-), add the functional group ending (-ane, -ene, -ol, -al, -one, -oic acid), number to give the lowest locants. 2-methylbutane, but-2-ene, propan-1-ol.</p>`),
T(`<h3>Isomerism</h3><ul><li><b>Structural</b>: same molecular formula, different structure (chain, position or functional group isomers).</li><li><b>E/Z stereoisomerism</b>: around a C=C, which can't rotate. Z: higher-priority groups on the same side; E: opposite.</li></ul>`),
Q(`Why do alkenes show E/Z isomerism?`,[`There's no rotation around a C=C double bond`,`They have more hydrogen`,`They're unsaturated so they react fast`,`All molecules do`],0,`Restricted rotation.`),
Q(`Butan-1-ol and butan-2-ol are…`,[`position isomers`,`chain isomers`,`E/Z isomers`,`the same molecule`],0,`The OH moves position.`),
T(`<h3>Key points</h3><ul><li>Longest chain, functional group ending, lowest numbers.</li><li>Structural isomers: chain, position, functional group.</li><li>E/Z from restricted rotation around C=C.</li></ul>`)]),
LH('ac2-4-2','Alkanes and halogenoalkanes',11,'Free-radical substitution and nucleophilic substitution: your first mechanisms.',[
RM(`<p>Curly arrows show the movement of a pair of electrons. Halogens are more electronegative than carbon.</p>`),
T(`<h3>Free-radical substitution</h3><p>CH₄ + Cl₂ in UV light:</p><ul><li><b>Initiation</b>: Cl₂ → 2Cl• (UV splits it).</li><li><b>Propagation</b>: Cl• + CH₄ → HCl + •CH₃; •CH₃ + Cl₂ → CH₃Cl + Cl•.</li><li><b>Termination</b>: two radicals join.</li></ul><p>CFCs break down in the stratosphere this way, releasing Cl• that destroys ozone.</p>`),
O(`Order the stages of free-radical substitution.`,['Initiation','Propagation','Termination'],`Propagation steps keep the chain going.`),
T(`<h3>Nucleophilic substitution</h3><p>The C–X bond is polar (C<sup>δ+</sup>). A <b>nucleophile</b> (an electron-pair donor such as OH⁻, CN⁻ or NH₃) attacks the δ+ carbon and the halide leaves. Rate: C–I > C–Br > C–Cl, because C–I is the <b>weakest</b> bond (bond enthalpy matters more than polarity).</p>`),
Q(`Why does iodoethane react faster than chloroethane with OH⁻?`,[`The C–I bond is weaker`,`C–I is more polar`,`Iodine is smaller`,`Chlorine is a better nucleophile`],0,`Bond enthalpy decides.`),
T(`<h3>Key points</h3><ul><li>Free radicals: initiation, propagation, termination.</li><li><b>Nucleophiles</b> attack δ+ carbon.</li><li>C–I reacts fastest: weakest bond.</li></ul>`)]),
LH('ac2-4-3','Alkenes and alcohols',11,'Electrophilic addition, and the oxidation of alcohols.',[
RM(`<p>A C=C double bond is an area of high electron density. Primary, secondary and tertiary alcohols have the OH on carbons attached to 1, 2 or 3 other carbons.</p>`),
T(`<h3>Electrophilic addition</h3><p>An <b>electrophile</b> (electron-pair acceptor, like HBr or Br₂) is attracted to the C=C. A carbocation forms, then the bromide adds. With unsymmetrical alkenes, the <b>more stable carbocation</b> (more alkyl groups: tertiary > secondary > primary) gives the major product.</p>`),
Q(`What does bromine water test for?`,[`C=C double bonds (orange to colourless)`,`Alcohols`,`Carboxylic acids`,`Halogenoalkanes`],0,`Electrophilic addition decolourises it.`),
T(`<h3>Oxidising alcohols (acidified K₂Cr₂O₇, orange → green)</h3><ul><li><b>Primary</b> → aldehyde (distil off) → carboxylic acid (reflux).</li><li><b>Secondary</b> → ketone.</li><li><b>Tertiary</b>: not oxidised.</li></ul>`),
W('matchPairs',{pairs:[['Primary alcohol, distil','Aldehyde'],['Primary alcohol, reflux','Carboxylic acid'],['Secondary alcohol','Ketone'],['Tertiary alcohol','No reaction']]},`Match each to its oxidation product.`),
T(`<h3>Key points</h3><ul><li>Alkenes: <b>electrophilic addition</b>; major product via the more stable carbocation.</li><li>Primary → aldehyde → acid; secondary → ketone; tertiary: none.</li><li>Dichromate: orange to green.</li></ul>`)])
]});

GOALS.ac1={icon:'🧱',title:'Bridge from GCSE',story:'Only if you need it: moles, equations and bonding brought up to A-level speed.',final:'Ready for A-level chemistry',steps:['Moles and equations','Atoms and bonding']};
GOALS.ac2={icon:'⚗️',title:'Master Year 12 chemistry',story:'Each unit covers AQA Year 1 physical, inorganic and organic chemistry.',final:'Year 12 complete',steps:['Atomic structure and amount of substance','Bonding and energetics','Kinetics, equilibria and inorganic chemistry','Organic chemistry 1']};
