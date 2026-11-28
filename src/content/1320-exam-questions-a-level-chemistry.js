/* ---------- A-level Chemistry ---------- */
EQ('ac1-1','A titration','25.0 cm³ of 0.100 mol/dm³ NaOH is neutralised by 12.5 cm³ of sulfuric acid. 2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O',[
 ['n','Calculate the moles of NaOH.',2.5e-3,0.01,'mol',1,'0.100 × 25.0 ÷ 1000 = 2.50 × 10⁻³ mol.'],
 ['n','Calculate the moles of H₂SO₄.',1.25e-3,0.01,'mol',1,'Ratio 2 : 1, so 1.25 × 10⁻³ mol.'],
 ['n','Calculate the concentration of the sulfuric acid.',0.1,0.01,'mol/dm³',2,'1.25 × 10⁻³ ÷ 0.0125 = 0.100 mol/dm³.'],
 ['c','What is the ionic equation for the neutralisation?',['H⁺ + OH⁻ → H₂O','Na⁺ + SO₄²⁻ → Na₂SO₄','2H⁺ + SO₄²⁻ → H₂SO₄','NaOH → Na⁺ + OH⁻'],1,'The spectator ions cancel out.']]);
EQ('ac1-2','Atoms and bonding','An element has two isotopes: mass 69 (60.1%) and mass 71 (39.9%).',[
 ['n','Calculate its relative atomic mass to 1 decimal place.',69.8,0.002,'',2,'(69 × 60.1 + 71 × 39.9) ÷ 100 = 69.8.'],
 ['c','What is the electron configuration of iron (Z = 26)?',['[Ar] 3d⁶ 4s²','[Ar] 3d⁸','[Ar] 4s² 4p⁶','[Ar] 3d⁴ 4s² 4p²'],1,'4s fills before 3d: [Ar] 3d⁶ 4s².'],
 ['s','Explain why sodium chloride conducts electricity when molten but not when solid.',2,['When molten the ions are free to move and carry charge','In the solid the ions are held in fixed positions in the lattice']]]);
EQ('ac2-1','Amount of substance','A compound is 40.0% carbon, 6.7% hydrogen and 53.3% oxygen by mass.',[
 ['n','Its empirical formula is CH₂O. What is the empirical formula mass?',30,0,'',2,'12 + 2 + 16 = 30.'],
 ['c','Why does first ionisation energy decrease down a group?',['The outer electron is further from the nucleus and more shielded','The nuclear charge decreases','There are fewer electrons','The atoms get smaller'],1,'Distance and shielding outweigh the extra nuclear charge.'],
 ['n','0.50 mol of an ideal gas is in 0.010 m³ at 300 K. Calculate its pressure. R = 8.31 J/mol K.',1.25e5,0.01,'Pa',2,'p = nRT ÷ V = 0.50 × 8.31 × 300 ÷ 0.010 = 1.25 × 10⁵ Pa.']]);
EQ('ac2-2','Shapes and enthalpy','A student dissolves 0.025 mol of a solid in 50 g of water. The temperature rises by 6.0 °C. c = 4.18 J/g K.',[
 ['c','What is the shape of an ammonia molecule?',['Trigonal pyramidal','Trigonal planar','Tetrahedral','Bent'],1,'Three bonding pairs and one lone pair.'],
 ['n','What is the bond angle in methane?',109.5,0.002,'°',1,'Four bonding pairs repel equally: 109.5°.'],
 ['n','Calculate the enthalpy change in kJ/mol. Include the sign.',-50.2,0.01,'kJ/mol',3,'q = mcΔT = 50 × 4.18 × 6.0 = 1254 J. ΔH = −1.254 ÷ 0.025 = −50.2 kJ/mol (temperature rose: exothermic).']]);
EQ('ac2-3','Equilibria','For H₂ + I₂ ⇌ 2HI at equilibrium: [H₂] = 0.10, [I₂] = 0.10 and [HI] = 0.70 mol/dm³.',[
 ['n','Calculate Kc.',49,0.01,'',2,'Kc = [HI]² ÷ ([H₂][I₂]) = 0.49 ÷ 0.010 = 49.'],
 ['c','How does a catalyst change the Maxwell–Boltzmann picture?',['More particles have energy above the new, lower activation energy','The curve shifts to higher energies','The area under the curve increases','Particles move faster'],1,'The curve is unchanged; the activation energy line moves left.'],
 ['s','Explain why the oxidising power of the halogens decreases down group 7.',2,['The atoms get bigger, so the outer shell is further from the nucleus (more shielding)','So there is less attraction for an extra electron']]]);
EQ('ac2-4','Organic chemistry','',[
 ['c','Name CH₃CH₂CH(CH₃)CH₃.',['2-methylbutane','3-methylbutane','pentane','2-ethylpropane'],1,'Longest chain of 4 carbons, methyl on carbon 2.'],
 ['c','What is the mechanism when bromine reacts with ethene?',['Electrophilic addition','Nucleophilic substitution','Free-radical substitution','Elimination'],1,'The C=C electron density attracts the electrophile.'],
 ['s','Explain why tertiary alcohols are not oxidised by acidified potassium dichromate.',2,['There is no hydrogen atom on the carbon bonded to the OH group','So a C=O bond can\'t form without breaking a C–C bond']]]);
EQ('ac3-1','Thermodynamics and rates','For N₂ + 3H₂ → 2NH₃: ΔH = −92 kJ/mol and ΔS = −199 J/K/mol.',[
 ['n','Calculate ΔG at 298 K in kJ/mol. Include the sign.',-32.7,0.01,'kJ/mol',2,'ΔG = ΔH − TΔS = −92 − 298 × (−0.199) = −32.7 kJ/mol.'],
 ['n','Above what temperature is the reaction no longer feasible?',462,0.01,'K',2,'ΔG = 0 when T = ΔH ÷ ΔS = 92 ÷ 0.199 = 462 K.'],
 ['n','Rate = k[A]²[B]. By what factor does the rate change if [A] is doubled?',4,0,'',1,'Second order in A: 2² = 4.']]);
EQ('ac3-2','Acids and cells','',[
 ['n','Calculate the pH of 0.010 mol/dm³ hydrochloric acid.',2,0.005,'',1,'[H⁺] = 0.010, so pH = −log 0.010 = 2.00.'],
 ['n','Calculate the pH of 0.10 mol/dm³ ethanoic acid. Ka = 1.74 × 10⁻⁵ mol/dm³. (2 d.p.)',2.88,0.005,'',3,'[H⁺] = √(Ka × c) = √(1.74 × 10⁻⁶) = 1.32 × 10⁻³, so pH = 2.88.'],
 ['n','Calculate the emf of a cell made from Zn²⁺/Zn (−0.76 V) and Cu²⁺/Cu (+0.34 V).',1.1,0.01,'V',1,'E = E(right) − E(left) = 0.34 − (−0.76) = 1.10 V.']]);
EQ('ac3-3','Inorganic chemistry','',[
 ['c','What colour is the [Cu(H₂O)₆]²⁺ ion?',['Pale blue','Green','Colourless','Yellow'],1,'Hexaaqua copper(II) is pale blue.'],
 ['c','Which Period 3 oxide dissolves in water to give a strongly alkaline solution?',['Na₂O','SO₂','P₄O₁₀','SiO₂'],1,'Na₂O + H₂O → 2NaOH.'],
 ['s','Explain why transition metals and their compounds are often good catalysts.',2,['They have variable oxidation states, so they can transfer electrons','They can adsorb reactants onto their surface (or form intermediates)']]]);
EQ('ac3-4','Carbonyls and spectroscopy','',[
 ['c','Which reagent tells an aldehyde from a ketone?',['Tollens\' reagent (gives a silver mirror)','Bromine water','Limewater','Sodium hydroxide'],1,'Aldehydes are oxidised; ketones are not.'],
 ['n','How many peaks are there in the ¹³C NMR spectrum of propanone, CH₃COCH₃?',2,0,'',1,'The two CH₃ carbons are equivalent, plus the C=O carbon: 2 environments.'],
 ['s','Explain why phenylamine is a weaker base than ammonia.',2,['The lone pair on nitrogen is delocalised into the benzene ring','So it is less available to accept a proton']]]);
EQ('ac4-1','A back titration','0.500 g of impure calcium carbonate reacts with 50.0 cm³ of 0.200 mol/dm³ HCl (an excess). The leftover HCl needs 21.0 cm³ of 0.100 mol/dm³ NaOH. CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂. Mr CaCO₃ = 100.',[
 ['n','Calculate the moles of HCl added at the start.',0.01,0.01,'mol',1,'0.200 × 50.0 ÷ 1000 = 0.0100 mol.'],
 ['n','Calculate the moles of HCl left over.',0.0021,0.01,'mol',1,'0.100 × 21.0 ÷ 1000 = 0.00210 mol.'],
 ['n','Calculate the percentage purity of the calcium carbonate.',79,0.01,'%',3,'HCl reacted = 0.0100 − 0.0021 = 0.0079 mol → CaCO₃ = 0.00395 mol = 0.395 g. 0.395 ÷ 0.500 × 100 = 79%.']]);
EQ('ac4-2','Mechanisms and practicals','',[
 ['c','In the reaction of bromoethane with OH⁻, where does the first curly arrow start?',['A lone pair on the OH⁻, going to the δ+ carbon','The C–Br bond, going to OH⁻','The bromine atom, going to the hydrogen','The δ+ carbon, going to OH⁻'],1,'Nucleophilic substitution: the nucleophile\'s lone pair attacks the δ+ carbon.'],
 ['c','A strong IR absorption near 1700 cm⁻¹ shows which bond?',['C=O','O–H','C–H','C–C'],1,'C=O stretches absorb strongly around 1680–1750 cm⁻¹.'],
 ['s','Describe how to measure the enthalpy of neutralisation of HCl with NaOH.',3,['Measure known volumes of known concentrations into an insulated (polystyrene) cup','Record the starting temperature, mix, and record the highest temperature (or extrapolate a cooling curve)','Use q = mcΔT, then divide by the moles of water formed']]]);
