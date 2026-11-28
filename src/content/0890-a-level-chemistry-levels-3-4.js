/* ========== A-LEVEL CHEMISTRY · LEVEL 3 Year 13 · LEVEL 4 A* technique ========== */
CGEN.c_ph=function(){var t=cR(0,2);if(t===0){var c=cP([0.1,0.01,0.05,0.2,0.001,0.025]),pH=Math.round(-Math.log10(c)*100)/100;return {p:'Find the pH of '+c+' mol dm⁻³ HCl. (2 d.p.)',b:[cB(pH,'pH = ','','pH',false,0.004)],e:'Strong acid: [H⁺] = '+c+'. pH = −log₁₀('+c+') = '+cNum(pH)+'.'}}
 if(t===1){var c2=cP([0.1,0.05,0.01,0.2]),pH2=Math.round((14+Math.log10(c2))*100)/100;return {p:'Find the pH of '+c2+' mol dm⁻³ NaOH at 298 K. (K<sub>w</sub> = 1.00 × 10⁻¹⁴, 2 d.p.)',b:[cB(pH2,'pH = ','','pH',false,0.004)],e:'[OH⁻] = '+c2+'. [H⁺] = K<sub>w</sub>/[OH⁻] = '+pE(1e-14/c2)+'. pH = '+cNum(pH2)+'.'}}
 var Ka=cP([1.7e-5,1.8e-5,6.3e-5,1.4e-3]),c3=cP([0.1,0.05,0.2,0.5]),pH3=Math.round(-Math.log10(Math.sqrt(Ka*c3))*100)/100;return {p:'A weak acid has K<sub>a</sub> = '+pE(Ka,2)+' mol dm⁻³. Find the pH of a '+c3+' mol dm⁻³ solution. (2 d.p.)',b:[cB(pH3,'pH = ','','pH',false,0.004)],e:'[H⁺] ≈ √(K<sub>a</sub> × c) = √('+pE(Ka,2)+' × '+c3+') = '+pE(Math.sqrt(Ka*c3))+'. pH = '+cNum(pH3)+'. (Assumes little of the acid dissociates.)'}};
CGEN.c_gibbs=function(){var H=cP([1,-1])*cR(20,200),S=cP([1,-1])*cR(50,300),T=cR(250,1200),G=Math.round((H-T*S/1000)*10)/10;
 return {p:'ΔH = '+cNum(H)+' kJ mol⁻¹ and ΔS = '+cNum(S)+' J K⁻¹ mol⁻¹. Find ΔG at '+T+' K, in kJ mol⁻¹. (1 d.p.)',b:[cB(G,'ΔG = ',' kJ mol⁻¹','ΔG',false,0.005)],e:'ΔG = ΔH − TΔS, with ΔS in kJ: '+cNum(H)+' − '+T+' × '+cNum(S/1000)+' = '+cNum(G)+' kJ mol⁻¹. '+(G<=0?'Negative: feasible.':'Positive: not feasible at this temperature.')}};
CGEN.c_ecell=function(){var E=[['Zn²⁺/Zn',-0.76],['Fe²⁺/Fe',-0.44],['Pb²⁺/Pb',-0.13],['Cu²⁺/Cu',0.34],['Ag⁺/Ag',0.80],['Mg²⁺/Mg',-2.37]],a=cP(E),b;do{b=cP(E)}while(b===a);var hi=a[1]>b[1]?a:b,lo=a[1]>b[1]?b:a,v=Math.round((hi[1]-lo[1])*100)/100;
 return {p:'A cell is made from '+a[0]+' (E° = '+cNum(a[1])+' V) and '+b[0]+' (E° = '+cNum(b[1])+' V). Find the cell emf.',b:[cB(v,'E<sub>cell</sub> = ',' V','emf',false,0.004)],e:'E<sub>cell</sub> = E°(more positive) − E°(more negative) = '+cNum(hi[1])+' − '+cBr(lo[1])+' = '+cNum(v)+' V. '+lo[0].split('/')[1]+' is oxidised.'}};
CGEN.c_rate=function(){var m=cR(0,2),n=cR(0,2),k=cR(1,9)/10,A=cR(1,5)/10,B=cR(1,5)/10,r=Math.round(k*Math.pow(A,m)*Math.pow(B,n)*100000)/100000;
 return {p:'rate = k[A]'+cSup(m)+'[B]'+cSup(n)+' with k = '+k+' (units to suit). Find the rate when [A] = '+A+' and [B] = '+B+' mol dm⁻³. (5 s.f. if needed)',b:[cB(r,'rate = ',' mol dm⁻³ s⁻¹','rate',false,0.004)],e:'rate = '+k+' × '+A+cSup(m)+' × '+B+cSup(n)+' = '+cNum(r)+'. Overall order '+(m+n)+'.'+(m===0?' Zero order in A: changing [A] does nothing.':'')}};
CGEN.c_order=function(){var o=cR(0,2),f=cP([2,3]),g=Math.pow(f,o);
 return {p:'Multiplying [A] by '+f+' multiplies the rate by '+g+'. What\'s the order with respect to A?',b:[cB(o,'order = ')],e:f+cSup('order')+' = '+g+', so the order is '+o+'.'}};

/* ---- Level 3: Year 13 ---- */
U({id:'ac3-1',track:'ac',level:3,title:'Physical chemistry 2',icon:'ΔG',color:'#7F77DD',desc:'Born–Haber cycles, entropy and Gibbs free energy, rate equations, and Kp.',lessons:[
LH('ac3-1-1','Thermodynamics',12,'Lattice enthalpy, entropy, and the free energy that decides whether a reaction can happen.',[
RM(`<p>Hess's law: the route doesn't matter. ΔH negative: exothermic.</p>`),
T(`<h3>Born–Haber cycles</h3><p>A Hess cycle for forming an ionic solid from its elements: atomisation, ionisation energies, electron affinities, and the <b>lattice enthalpy</b> (formation of the lattice from gaseous ions). Use it to find the lattice enthalpy, which can't be measured directly.</p>`),
T(`<h3>Entropy</h3><p><b>Entropy</b> S measures disorder: the number of ways to arrange particles and energy. Gases ≫ liquids > solids. More gas moles in the products: ΔS positive.</p>`),
Q(`Which change has a positive entropy change?`,[`CaCO₃(s) → CaO(s) + CO₂(g)`,`H₂O(g) → H₂O(l)`,`N₂ + 3H₂ → 2NH₃`,`Na⁺(g) + Cl⁻(g) → NaCl(s)`],0,`A gas is produced.`),
T(`<h3>Gibbs free energy</h3><div class="eq">ΔG = ΔH − TΔS</div><p>A reaction is <b>feasible</b> when ΔG ≤ 0. Convert ΔS from J to kJ first! Feasible temperature: T = ΔH/ΔS when ΔG = 0.</p>`),
W('calcDrill',{skill:'c_gibbs',need:3},`Gibbs free energy. Get 3 right to master it.`,`ΔH − TΔS, ΔS in kJ.`),
T(`<h3>Key points</h3><ul><li>Born–Haber gives <b>lattice enthalpy</b>.</li><li><b>ΔG = ΔH − TΔS</b>; feasible if ΔG ≤ 0.</li><li>Convert ΔS to kJ K⁻¹ mol⁻¹.</li></ul>`)]),
LH('ac3-1-2','Rate equations',11,'How each concentration affects the rate, measured by experiment.',[
RM(`<p>Rates increase with concentration and temperature (collision theory). Activation energy E<sub>a</sub>.</p>`),
T(`<h3>The rate equation</h3><div class="eq">rate = k[A]ᵐ[B]ⁿ</div><p>Orders m and n are found by <b>experiment</b>, not from the equation. Order 0: no effect. Order 1: doubles with doubling. Order 2: quadruples.</p>`),
W('calcDrill',{skill:'c_order',need:3},`Finding orders. Get 3 right to master it.`,`factorᵒʳᵈᵉʳ = rate factor.`),
W('calcDrill',{skill:'c_rate',need:2},`Using rate equations. Get 2 right to master it.`,`Multiply k by each concentration to its order.`),
T(`<h3>Mechanisms and the Arrhenius equation</h3><p>The <b>rate-determining step</b> (slowest step) contains the species in the rate equation. Temperature changes k:</p><div class="eq">k = Ae<sup>−E<sub>a</sub>/RT</sup>&nbsp;&nbsp; ln k = −E<sub>a</sub>/(RT) + ln A</div><p>Plot ln k against 1/T: gradient = −E<sub>a</sub>/R.</p>`),
Q(`A plot of ln k against 1/T has gradient −5000 K. E<sub>a</sub> = …`,[`5000 × 8.31 J mol⁻¹ ≈ 41.6 kJ mol⁻¹`,`5000 J mol⁻¹`,`−5000 J mol⁻¹`,`8.31 kJ mol⁻¹`],0,`Gradient = −E<sub>a</sub>/R.`),
T(`<h3>Key points</h3><ul><li><b>rate = k[A]ᵐ[B]ⁿ</b>; orders by experiment.</li><li>Rate-determining step matches the rate equation.</li><li><b>Arrhenius</b>: ln k vs 1/T, gradient −E<sub>a</sub>/R.</li></ul>`)]),
LH('ac3-1-3','Gas equilibria and Kp',10,'For gases, use partial pressures instead of concentrations.',[
RM(`<p>K<sub>c</sub> = products/reactants with powers. Only temperature changes K. Le Chatelier.</p>`),
T(`<h3>Partial pressures</h3><div class="eq">mole fraction x = n(gas) ÷ total moles&nbsp;&nbsp;&nbsp; partial pressure p = x × total pressure</div>`),
N(`A mixture has 2 mol N₂ and 6 mol H₂ at 400 kPa. Partial pressure of N₂ (kPa)?`,100,0.001,'kPa',`x = 2/8 = 0.25; 0.25 × 400.`),
T(`<h3>K<sub>p</sub></h3><p>For N₂ + 3H₂ ⇌ 2NH₃:</p><div class="eq">K<sub>p</sub> = p(NH₃)² ÷ [p(N₂) × p(H₂)³]</div><p>As with K<sub>c</sub>, only temperature changes K<sub>p</sub>. For an exothermic reaction, raising T makes K<sub>p</sub> smaller.</p>`),
Q(`The Haber process is exothermic. Raising the temperature makes K<sub>p</sub>…`,[`smaller`,`bigger`,`unchanged`,`zero`],0,`Equilibrium shifts left.`),
T(`<h3>Key points</h3><ul><li>Partial pressure = mole fraction × total.</li><li><b>K<sub>p</sub></b> uses partial pressures.</li><li>Only temperature changes K<sub>p</sub>.</li></ul>`)])
]});

U({id:'ac3-2',track:'ac',level:3,title:'Electrochemistry and acids',icon:'pH',color:'#1D9E75',desc:'Electrode potentials and cells, pH and Ka, and buffers.',lessons:[
LH('ac3-2-1','Electrode potentials and cells',11,'Pair two half-cells and electrons flow from one to the other.',[
RM(`<p>Oxidation is loss of electrons; reduction is gain. More reactive metals lose electrons more easily.</p>`),
T(`<h3>Standard electrode potentials</h3><p>E° is measured against the <b>standard hydrogen electrode</b> (0.00 V) at 298 K, 100 kPa, 1 mol dm⁻³. More <b>negative</b> E°: a better reducing agent (more easily oxidised). More <b>positive</b>: a better oxidising agent.</p>`),
W('calcDrill',{skill:'c_ecell',need:3},`Cell emf. Get 3 right to master it.`,`More positive minus more negative.`),
T(`<h3>Cells you use</h3><ul><li><b>Non-rechargeable</b>: alkaline batteries.</li><li><b>Rechargeable</b>: lithium-ion; the reactions reverse when charging.</li><li><b>Fuel cells</b>: hydrogen and oxygen make electricity and water, as long as fuel is supplied.</li></ul>`),
Q(`In a cell, which electrode is oxidised?`,[`The one with the more negative E°`,`The one with the more positive E°`,`The hydrogen electrode always`,`Neither`],0,`It loses electrons.`),
T(`<h3>Key points</h3><ul><li>E° against the hydrogen electrode.</li><li><b>E<sub>cell</sub> = E°(positive) − E°(negative)</b>.</li><li>More negative E° is oxidised.</li></ul>`)]),
LH('ac3-2-2','pH and Ka',11,'pH for strong acids, weak acids and bases.',[
RM(`<p>Acids donate H⁺ (protons); bases accept them. log₁₀ and powers of ten.</p>`),
T(`<h3>pH</h3><div class="eq">pH = −log₁₀[H⁺]&nbsp;&nbsp;&nbsp; K<sub>w</sub> = [H⁺][OH⁻] = 1.00 × 10⁻¹⁴ at 298 K</div><ul><li><b>Strong acid</b>: fully dissociates, [H⁺] = concentration.</li><li><b>Strong base</b>: find [OH⁻], then [H⁺] = K<sub>w</sub>/[OH⁻].</li><li><b>Weak acid</b>: K<sub>a</sub> = [H⁺][A⁻]/[HA]; approximately [H⁺] = √(K<sub>a</sub>c).</li></ul>`),
W('calcDrill',{skill:'c_ph',need:4},`pH calculations. Get 4 right to master it.`,`Strong acid, strong base or weak acid?`),
Q(`Diluting a strong acid by a factor of 10 changes its pH by…`,[`+1`,`−1`,`+10`,`0`],0,`[H⁺] falls tenfold.`),
T(`<h3>Key points</h3><ul><li><b>pH = −log[H⁺]</b>.</li><li>Strong bases: use K<sub>w</sub>.</li><li>Weak acids: <b>[H⁺] = √(K<sub>a</sub>c)</b>; pK<sub>a</sub> = −log K<sub>a</sub>.</li></ul>`)]),
LH('ac3-2-3','Buffers and titration curves',10,'Solutions that resist pH change, and the shapes of pH curves.',[
RM(`<p>K<sub>a</sub> = [H⁺][A⁻]/[HA]. Neutralisation: H⁺ + OH⁻ → H₂O.</p>`),
T(`<h3>Buffers</h3><p>A weak acid plus its salt (lots of HA and A⁻). Add acid: A⁻ mops up H⁺. Add alkali: HA releases H⁺ to replace what's removed. pH barely changes. Blood is buffered by carbonic acid and hydrogencarbonate at pH 7.4.</p><div class="eq">[H⁺] = K<sub>a</sub> × [HA]/[A⁻]</div>`),
N(`A buffer has [HA] = [A⁻] and K<sub>a</sub> = 1.0 × 10⁻⁵. pH?`,5,0.001,'',`[H⁺] = K<sub>a</sub>, pH = pK<sub>a</sub> = 5.`),
T(`<h3>Titration curves</h3><p>A steep vertical section at the equivalence point. Choose an <b>indicator</b> whose colour change falls within it: phenolphthalein for strong base–weak acid; methyl orange for strong acid–weak base. At the <b>half-equivalence</b> point of a weak acid, pH = pK<sub>a</sub>.</p>`),
Q(`At half-neutralisation of a weak acid, pH equals…`,[`pK<sub>a</sub>`,`7`,`pK<sub>w</sub>`,`0`],0,`[HA] = [A⁻].`),
T(`<h3>Key points</h3><ul><li>Buffer: weak acid + its salt.</li><li><b>[H⁺] = K<sub>a</sub>[HA]/[A⁻]</b>.</li><li>Half-equivalence: pH = pK<sub>a</sub>.</li></ul>`)])
]});

U({id:'ac3-3',track:'ac',level:3,title:'Inorganic chemistry 2',icon:'d',color:'#378ADD',desc:'Period 3, transition metals and complexes, and catalysts and reactions of ions.',lessons:[
LH('ac3-3-1','Period 3',10,'Elements and oxides across sodium to argon: from basic to acidic.',[
RM(`<p>Ionic oxides of metals are basic; covalent oxides of non-metals are acidic.</p>`),
T(`<h3>Oxides across period 3</h3><ul><li><b>Na₂O, MgO</b>: ionic, basic. Na₂O gives NaOH (pH 14).</li><li><b>Al₂O₃</b>: <b>amphoteric</b>: reacts with acids and bases.</li><li><b>SiO₂</b>: giant covalent, acidic (reacts with hot bases), insoluble.</li><li><b>P₄O₁₀, SO₂, SO₃</b>: simple covalent, acidic. SO₃ gives H₂SO₄ (pH 0–1).</li></ul>`),
Q(`Which period 3 oxide is amphoteric?`,[`Al₂O₃`,`Na₂O`,`SO₃`,`MgO`],0,`Reacts with both acids and bases.`),
T(`<h3>Melting points</h3><p>Ionic and giant covalent oxides (MgO, SiO₂) have high melting points; simple molecular oxides (SO₂) low.</p>`),
T(`<h3>Key points</h3><ul><li>Basic (ionic) → amphoteric (Al₂O₃) → acidic (covalent).</li><li>Structure explains melting points.</li><li>Na₂O pH 14; SO₃ pH 0–1.</li></ul>`)]),
LH('ac3-3-2','Transition metals and complexes',11,'Colour, variable oxidation states and complex ions.',[
RM(`<p>d-block elements fill the 3d sub-shell. 4s fills before 3d, but empties first.</p>`),
T(`<h3>What makes a transition metal</h3><p>An element that forms at least one stable ion with an <b>incomplete d sub-shell</b>. Properties: variable oxidation states, coloured ions, catalytic activity, complex ion formation.</p>`),
T(`<h3>Complexes</h3><p>A central metal ion with <b>ligands</b> bonded by co-ordinate (dative) bonds. [Cu(H₂O)₆]²⁺ is octahedral (6 ligands). [CuCl₄]²⁻ is tetrahedral (Cl⁻ is bigger). Bidentate ligands like ethane-1,2-diamine form two bonds each; EDTA⁴⁻ forms six.</p>`),
Q(`What's the co-ordination number of [Cu(H₂O)₆]²⁺?`,[`6`,`2`,`4`,`1`],0,`Six co-ordinate bonds.`),
T(`<h3>Colour</h3><p>Ligands split the d orbitals. Electrons absorb light of energy ΔE = hf to jump between them; we see the complementary colour. Change the ligand, oxidation state or co-ordination number, and the colour changes.</p>`),
Q(`Why do transition metal complexes have colour?`,[`d-electrons absorb visible light to move between split d orbitals`,`They emit light when heated`,`The ligands are coloured`,`They reflect all light`],0,`ΔE = hf in the visible range.`),
T(`<h3>Key points</h3><ul><li>Incomplete d sub-shell in an ion.</li><li>Ligands, co-ordination number, shapes.</li><li>Colour from d-orbital splitting: <b>ΔE = hf</b>.</li></ul>`)]),
LH('ac3-3-3','Catalysts and reactions of ions',10,'How transition metals catalyse reactions, and the colour tests for metal ions.',[
RM(`<p>Catalysts lower activation energy. Transition metals have variable oxidation states.</p>`),
T(`<h3>Two kinds of catalyst</h3><ul><li><b>Heterogeneous</b>: different phase (iron in the Haber process, V₂O₅ in the Contact process). Reactants adsorb onto the surface.</li><li><b>Homogeneous</b>: same phase, working through an intermediate. Fe²⁺ catalyses the S₂O₈²⁻ / I⁻ reaction by changing oxidation state.</li></ul>`),
T(`<h3>Tests with hydroxide</h3><table class="wtable"><tr><th>Ion</th><th>With OH⁻</th></tr><tr><td>Cu²⁺</td><td>blue precipitate</td></tr><tr><td>Fe²⁺</td><td>green precipitate</td></tr><tr><td>Fe³⁺</td><td>orange-brown precipitate</td></tr><tr><td>Al³⁺</td><td>white, dissolves in excess</td></tr></table>`),
W('matchPairs',{pairs:[['Cu²⁺ + OH⁻','Blue precipitate'],['Fe²⁺ + OH⁻','Green precipitate'],['Fe³⁺ + OH⁻','Orange-brown precipitate'],['Al³⁺ + excess OH⁻','White precipitate that dissolves']]},`Match each test to its result.`),
Q(`Why can catalysts be "poisoned"?`,[`Impurities bind to the surface and block active sites`,`They run out of electrons`,`They become reactants`,`Temperature rises`],0,`Heterogeneous surfaces.`),
T(`<h3>Key points</h3><ul><li>Heterogeneous (surface) vs homogeneous (intermediate).</li><li>Variable oxidation states enable catalysis.</li><li>Learn the hydroxide precipitate colours.</li></ul>`)])
]});

U({id:'ac3-4',track:'ac',level:3,title:'Organic chemistry 2',icon:'C=O',color:'#D85A30',desc:'Carbonyls and acylation, aromatics, amines and polymers, and spectroscopy and synthesis.',lessons:[
LH('ac3-4-1','Carbonyls and acyl chlorides',11,'Aldehydes, ketones, carboxylic acids, esters and acylation.',[
RM(`<p>Primary alcohols oxidise to aldehydes then acids; secondary to ketones. Nucleophiles attack δ+ carbon.</p>`),
T(`<h3>Carbonyls</h3><ul><li><b>Tests</b>: Tollens' reagent (silver mirror) and Fehling's (brick-red) are positive for aldehydes, not ketones.</li><li><b>Nucleophilic addition</b>: HCN (from KCN) adds across C=O to give a hydroxynitrile. NaBH₄ reduces carbonyls to alcohols.</li></ul>`),
Q(`Which reagent distinguishes an aldehyde from a ketone?`,[`Tollens' reagent`,`Bromine water`,`Acidified dichromate only works on ketones`,`Silver nitrate`],0,`Silver mirror with aldehydes.`),
T(`<h3>Acids, esters and acylation</h3><ul><li>Carboxylic acid + alcohol ⇌ ester + water (acid catalyst).</li><li><b>Acyl chlorides</b> are far more reactive: with water → acid; alcohol → ester; ammonia → amide; amine → N-substituted amide. Mechanism: <b>nucleophilic addition–elimination</b>.</li><li>Aspirin is made by acylating salicylic acid with ethanoic anhydride.</li></ul>`),
Q(`Ethanoyl chloride reacts with ammonia. The organic product is…`,[`ethanamide`,`ethanoic acid`,`ethyl ethanoate`,`ethylamine`],0,`Acyl chloride + NH₃ → amide + HCl.`),
Q(`NaBH₄ reduces propanone to…`,[`propan-2-ol`,`propan-1-ol`,`propanal`,`propanoic acid`],0,`A ketone gives a secondary alcohol.`),
T(`<h3>Key points</h3><ul><li>Tollens' and Fehling's identify aldehydes.</li><li>Nucleophilic <b>addition</b> to C=O.</li><li>Acyl chlorides: <b>addition–elimination</b>.</li></ul>`)]),
LH('ac3-4-2','Aromatics, amines and polymers',11,'Benzene\'s special stability, bases from ammonia, and the giant molecules of plastics and proteins.',[
RM(`<p>Electrophilic addition for alkenes. Nucleophiles donate a lone pair.</p>`),
T(`<h3>Benzene</h3><p>A ring of delocalised π electrons makes benzene more stable than a theoretical cyclohexatriene (by about 150 kJ mol⁻¹). So it does <b>electrophilic substitution</b>, not addition: nitration with HNO₃/H₂SO₄ (via NO₂⁺) and Friedel–Crafts acylation.</p>`),
Q(`Why does benzene do substitution, not addition?`,[`Substitution keeps the stable delocalised ring`,`Benzene has no electrons`,`Addition is too fast`,`It has no double bonds at all`],0,`Delocalisation stability.`),
T(`<h3>Amines and polymers</h3><ul><li><b>Amines</b> are bases: the N lone pair accepts H⁺. Alkyl amines are stronger bases than ammonia; aromatic amines weaker.</li><li><b>Condensation polymers</b>: polyesters (Terylene) and polyamides (nylon, Kevlar), losing water each link. Unlike addition polymers, they can be <b>hydrolysed</b> and some are biodegradable.</li><li><b>Amino acids</b> join into proteins by peptide links; <b>DNA</b> pairs bases by hydrogen bonds.</li></ul>`),
W('matchPairs',{pairs:[['Nylon','Polyamide'],['Terylene','Polyester'],['Poly(ethene)','Addition polymer'],['Protein','Polypeptide']]},`Match each polymer.`),
Q(`Which is the strongest base?`,[`Ethylamine`,`Ammonia`,`Phenylamine`,`Water`],0,`The alkyl group pushes electron density onto the N lone pair.`),
Q(`Why can polyesters be broken down but poly(ethene) can't, easily?`,[`Ester links can be hydrolysed; C–C chains can't`,`Poly(ethene) is ionic`,`Polyesters have no bonds`,`Poly(ethene) dissolves in water`],0,`Hydrolysis of the linkage.`),
T(`<h3>Key points</h3><ul><li>Benzene: <b>electrophilic substitution</b>.</li><li>Amines are bases (lone pair on N).</li><li>Condensation polymers can be hydrolysed.</li></ul>`)]),
LH('ac3-4-3','Spectroscopy and synthesis',12,'Work out an unknown structure from its spectra, and plan a route to make a molecule.',[
RM(`<p>Mass spectrometry: molecular ion gives M<sub>r</sub>. Functional groups react in characteristic ways.</p>`),
T(`<h3>Three techniques</h3><ul><li><b>Infrared</b>: bonds absorb at characteristic wavenumbers. Broad O–H (acid) 2500–3000 cm⁻¹; O–H (alcohol) 3230–3550; C=O about 1700.</li><li><b>¹³C NMR</b>: number of peaks = number of carbon environments.</li><li><b>¹H NMR</b>: number of peaks = proton environments; <b>integration</b> = relative numbers of H; <b>splitting</b> follows the n + 1 rule (n = H on neighbouring carbons). TMS is the reference at δ = 0.</li></ul>`),
Q(`A ¹H NMR peak is a quartet. How many H are on the neighbouring carbon(s)?`,[`3`,`4`,`2`,`1`],0,`n + 1 = 4.`),
W('stepCalc',{steps:[`Unknown: M<sub>r</sub> 74, IR broad peak at 2500–3000 and a peak at 1710 cm⁻¹.`,`Broad O–H plus C=O: a carboxylic acid.`,`M<sub>r</sub> 74: CₙH₂ₙ₊₁COOH, 14n + 46 = 74, so n = 2: C₂H₅COOH.`,`¹H NMR: triplet (3H), quartet (2H), singlet (1H, the COOH).`,`<b>Propanoic acid</b>`]},`Solve a structure.`,`Combine all the clues.`),
T(`<h3>Synthesis and chromatography</h3><p>Plan multi-step routes using the reactions you know (alkene → halogenoalkane → alcohol → aldehyde → acid…). Separate and identify products with <b>chromatography</b> (TLC: R<sub>f</sub> values; gas and column chromatography).</p>`),
Q(`A strong IR absorption near 1700 cm⁻¹ shows…`,[`a C=O group`,`an O–H group`,`a C–H bond only`,`a benzene ring`],0,`Carbonyl stretch.`),
Q(`How many peaks in the ¹³C NMR spectrum of propanone, CH₃COCH₃?`,[`2`,`3`,`1`,`6`],0,`The two CH₃ are equivalent, plus the C=O.`),
T(`<h3>Key points</h3><ul><li>IR: functional groups. ¹³C: carbon environments.</li><li>¹H NMR: environments, integration, <b>n + 1</b> splitting.</li><li>Plan routes; separate with chromatography.</li></ul>`)])
]});

/* ---- Level 4: A* technique ---- */
U({id:'ac4-1',track:'ac',level:4,title:'Hard calculations',icon:'Σn',color:'#7F77DD',desc:'Multi-step moles, equilibrium and pH, and combined thermodynamics.',lessons:[
LH('ac4-1-1','Multi-step mole problems',11,'Back titrations and reacting masses with several steps.',[
RM(`<p>n = m/M<sub>r</sub>, n = cV, pV = nRT. Use the equation's ratio.</p>`),
T(`<h3>Back titrations</h3><p>Used when a substance is insoluble or reacts slowly. Add a <b>known excess</b> of acid, then titrate the leftover acid. Moles that reacted = moles added − moles left over.</p>`),
W('stepCalc',{steps:[`1.25 g of impure CaCO₃ is added to 50.0 cm³ of 1.00 mol dm⁻³ HCl (excess). The leftover HCl needs 30.0 cm³ of 1.00 mol dm⁻³ NaOH. Find the % purity.`,`HCl added: 0.0500 mol. HCl left: 0.0300 mol (1:1 with NaOH).`,`HCl reacted: 0.0200 mol. CaCO₃ + 2HCl, so CaCO₃ = 0.0100 mol.`,`Mass of CaCO₃ = 0.0100 × 100.1 = 1.001 g`,`Purity = 1.001 ÷ 1.25 × 100 = <b>80.1%</b>`]},`A back titration.`,`Keep track of what each mole number means.`),
W('calcDrill',{skill:['c_mr','g_conc','c_idealgas','g_yield'],need:5},`Mixed mole calculations. Get 5 right to master it.`,`Moles first, every time.`),
Q(`Why use a back titration for CaCO₃?`,[`It's insoluble, so you can't titrate it directly`,`It's a gas`,`It's too acidic`,`Indicators don't work with acids`],0,`React it with excess, then titrate what's left.`),
T(`<h3>Key points</h3><ul><li><b>Back titration</b>: reacted = added − left.</li><li>Label every mole value.</li><li>Keep 3+ s.f. until the end.</li></ul>`)]),
LH('ac4-1-2','Equilibrium and pH problems',11,'Moles at equilibrium, Kc with volumes, and buffer calculations.',[
RM(`<p>K<sub>c</sub> = products/reactants. [H⁺] = K<sub>a</sub>[HA]/[A⁻]. pH = −log[H⁺].</p>`),
T(`<h3>ICE tables</h3><p>Initial, Change, Equilibrium moles. Use the stoichiometry for the change row, then divide by volume for concentrations (volumes cancel when moles on each side are equal).</p>`),
W('stepCalc',{steps:[`1.0 mol of H₂ and 1.0 mol of I₂ react; 1.6 mol of HI forms at equilibrium. Find K<sub>c</sub>.`,`Change: HI +1.6, so H₂ −0.8 and I₂ −0.8`,`Equilibrium: H₂ 0.2, I₂ 0.2, HI 1.6`,`K<sub>c</sub> = 1.6² ÷ (0.2 × 0.2) = 2.56 ÷ 0.04`,`<b>K<sub>c</sub> = 64</b> (volume cancels)`]},`An ICE table.`,`Use the stoichiometric ratio for the changes.`),
W('calcDrill',{skill:['c_kc','c_ph'],need:4},`Equilibrium and pH. Get 4 right to master it.`,`Products over reactants; −log[H⁺].`),
T(`<h3>Buffers after adding base</h3><p>Adding NaOH to a buffer converts HA into A⁻ mole for mole. Recalculate the moles of each, then [H⁺] = K<sub>a</sub> × n(HA)/n(A⁻).</p>`),
T(`<h3>Key points</h3><ul><li><b>ICE</b> tables with stoichiometry.</li><li>Volumes cancel when gas moles balance.</li><li>Buffers: update moles of HA and A⁻.</li></ul>`)]),
LH('ac4-1-3','Combined thermodynamics',10,'When is a reaction feasible, and at what temperature does that change?',[
RM(`<p>ΔG = ΔH − TΔS. Feasible when ΔG ≤ 0.</p>`),
T(`<h3>The four cases</h3><ul><li>ΔH < 0, ΔS > 0: <b>always</b> feasible.</li><li>ΔH > 0, ΔS < 0: <b>never</b> feasible.</li><li>ΔH < 0, ΔS < 0: feasible at <b>low</b> T.</li><li>ΔH > 0, ΔS > 0: feasible at <b>high</b> T (like decomposing CaCO₃).</li></ul>`),
N(`ΔH = +178 kJ mol⁻¹, ΔS = +161 J K⁻¹ mol⁻¹. Minimum temperature for feasibility (K, nearest whole number)?`,1106,0.002,'K',`T = ΔH/ΔS = 178,000/161 = 1106 K.`),
Q(`Feasible doesn't mean fast because…`,[`there may be a high activation energy`,`ΔG is always positive`,`entropy decreases`,`it's at equilibrium`],0,`Thermodynamics vs kinetics.`),
W('calcDrill',{skill:'c_gibbs',need:3},`Gibbs free energy. Get 3 right to master it.`,`ΔH − TΔS.`),
T(`<h3>Key points</h3><ul><li>Signs of ΔH and ΔS decide feasibility.</li><li><b>T = ΔH/ΔS</b> where feasibility changes.</li><li>Feasible ≠ fast.</li></ul>`)])
]});

U({id:'ac4-2',track:'ac',level:4,title:'Mechanisms and exam technique',icon:'↷',color:'#1D9E75',desc:'Full-mark mechanisms, spectroscopy puzzles, and required practicals.',lessons:[
LH('ac4-2-1','Full-mark mechanisms',11,'Every curly arrow, lone pair and charge in the right place.',[
RM(`<p>Mechanisms: free-radical substitution, nucleophilic substitution, elimination, electrophilic addition, nucleophilic addition, addition–elimination, electrophilic substitution.</p>`),
T(`<h3>Curly arrow rules</h3><ul><li>Arrows start from a <b>lone pair</b> or a <b>bond</b>, never from an atom or a charge.</li><li>Arrows end at an <b>atom</b> (forming a bond) or between atoms.</li><li>Show <b>δ+ / δ−</b> dipoles and <b>full charges</b> on ions.</li><li>Show the <b>lone pair</b> on a nucleophile.</li></ul>`),
W('matchPairs',{pairs:[['Halogenoalkane + OH⁻ (aqueous)','Nucleophilic substitution'],['Halogenoalkane + OH⁻ (ethanol, hot)','Elimination'],['Alkene + HBr','Electrophilic addition'],['Benzene + NO₂⁺','Electrophilic substitution'],['Aldehyde + CN⁻','Nucleophilic addition']]},`Match each reaction to its mechanism.`),
Q(`Where must a curly arrow start?`,[`A lone pair or a bond`,`A positive charge`,`An atom's nucleus`,`Anywhere`],0,`Electrons move.`),
T(`<h3>Key points</h3><ul><li>Arrows from lone pairs or bonds.</li><li>Show dipoles, charges and lone pairs.</li><li>Know which conditions give which mechanism.</li></ul>`)]),
LH('ac4-2-2','Spectroscopy puzzles',11,'Combine IR, mass spec and NMR to pin down an unknown.',[
RM(`<p>IR: functional groups. MS: M<sub>r</sub>. ¹³C: carbon environments. ¹H: environments, integration, n + 1 splitting.</p>`),
T(`<h3>A method</h3><ol><li>Molecular formula from M<sub>r</sub> (and % data).</li><li>Functional groups from <b>IR</b>.</li><li>Number of carbon environments from <b>¹³C</b> (symmetry!).</li><li>Fragments from <b>¹H</b>: a triplet + quartet means CH₃CH₂–; a singlet means no neighbouring H.</li><li>Assemble and <b>check</b> every peak.</li></ol>`),
Q(`¹H NMR shows a 6H doublet and a 1H septet. Which group?`,[`An isopropyl group, (CH₃)₂CH–`,`An ethyl group`,`A methyl group alone`,`A benzene ring`],0,`Two CH₃ split by one H; one H split by six.`),
Q(`¹³C NMR shows 2 peaks for C₄H₁₀O. Which isomer fits?`,[`2-methylpropan-2-ol`,`butan-1-ol`,`butan-2-ol`,`2-methylpropan-1-ol`],0,`(CH₃)₃COH: three equivalent CH₃ and one C–O.`),
T(`<h3>Key points</h3><ul><li>Formula, IR, ¹³C, ¹H, assemble, check.</li><li>Ethyl: triplet + quartet. Isopropyl: doublet + septet.</li><li>Symmetry reduces the number of peaks.</li></ul>`)]),
LH('ac4-2-3','Required practicals',10,'Twelve practicals: know the method, the hazards and how to improve each one.',[
RM(`<p>Titrations, rates, enthalpy and organic preparations from Years 12 and 13.</p>`),
T(`<h3>The list</h3><ul><li>Make a standard solution and titrate; measure an enthalpy change; rate by continuous monitoring and by initial rates; measure the effect of temperature on rate.</li><li>Tests for ions; electrochemical cells; pH curves; prepare and purify an organic liquid (distillation, separating funnel, drying) and an organic solid (recrystallisation, melting point); TLC.</li></ul>`),
O(`Order the purification of an organic liquid product.`,['Separate layers in a separating funnel','Wash with sodium hydrogencarbonate solution','Dry with anhydrous calcium chloride or magnesium sulfate','Redistil, collecting at the boiling point'],`Each step removes a different impurity.`),
Q(`How do you check a solid product is pure?`,[`Measure its melting point: sharp and matching the data value`,`Weigh it`,`Smell it`,`Check its colour only`],0,`Impurities lower and widen the melting range.`),
T(`<h3>Key points</h3><ul><li>Know each practical's method, risks and improvements.</li><li>Purify liquids: separate, wash, dry, distil.</li><li>Check purity by melting point.</li></ul>`)])
]});

GOALS.ac3={icon:'🧪',title:'Master Year 13 chemistry',story:'Each unit covers AQA Year 2 physical, inorganic and organic chemistry.',final:'Full A-level chemistry covered',steps:['Physical chemistry 2','Electrochemistry and acids','Inorganic chemistry 2','Organic chemistry 2']};
GOALS.ac4={icon:'🏆',title:'Go for an A* in chemistry',story:'The hardest calculations, perfect mechanisms and practical mastery.',final:'A* standard',steps:['Hard calculations','Mechanisms and exam technique']};
