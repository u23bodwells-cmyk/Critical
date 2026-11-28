/* ===== Quantum problem sheets: one worked, multi-part problem per unit ===== */
EQ('qm1-1','The photoelectric effect','Ultraviolet light of wavelength 200 nm shines on zinc, which has a work function of 4.3 eV. (h = 6.63 × 10⁻³⁴ J s, c = 3.00 × 10⁸ m/s, 1 eV = 1.60 × 10⁻¹⁹ J)',[
 ['n','Calculate the energy of one photon, in eV.',6.22,0.03,'eV',2,'E = hc/λ = (6.63 × 10⁻³⁴ × 3.00 × 10⁸) ÷ (200 × 10⁻⁹) = 9.95 × 10⁻¹⁹ J. Divide by 1.60 × 10⁻¹⁹: 6.22 eV.'],
 ['n','Calculate the maximum kinetic energy of the emitted electrons, in eV.',1.92,0.05,'eV',1,'KE<sub>max</sub> = hf − φ = 6.22 − 4.3 = 1.9 eV. One photon gives all its energy to one electron; the work function is the cost of getting out.'],
 ['c','The light is made twice as bright, at the same wavelength. What happens?',['Twice as many electrons, same maximum KE','The same number of electrons, with double the maximum KE','Twice as many electrons with twice the maximum KE','Nothing changes'],1,'Brighter means more photons, not bigger ones. Each photon still has 6.22 eV, so KE<sub>max</sub> stays 1.9 eV; you just get more electrons.']]);
EQ('qm1-2','Electron diffraction','An electron (m = 9.11 × 10⁻³¹ kg) is accelerated from rest through 150 V.',[
 ['n','Calculate its kinetic energy in joules.',2.4e-17,0.02,'J',1,'KE = eV = 1.60 × 10⁻¹⁹ × 150 = 2.4 × 10⁻¹⁷ J.'],
 ['n','Calculate its momentum.',6.61e-24,0.03,'kg m/s',2,'KE = p²/2m, so p = √(2m·KE) = √(2 × 9.11 × 10⁻³¹ × 2.4 × 10⁻¹⁷) = 6.61 × 10⁻²⁴ kg m/s.'],
 ['n','Calculate its de Broglie wavelength.',1.0e-10,0.04,'m',2,'λ = h/p = 6.63 × 10⁻³⁴ ÷ 6.61 × 10⁻²⁴ = 1.0 × 10⁻¹⁰ m: about the size of an atom.'],
 ['c','Why do these electrons diffract off a crystal?',['Their wavelength is about the same as the spacing between atoms','They are charged','They move close to the speed of light','The crystal gives out electrons'],1,'Diffraction is strongest when the wavelength matches the gap. 10⁻¹⁰ m is the spacing of atoms in a crystal.']]);
EQ('qm1-3','Hydrogen\'s spectrum','In hydrogen, Eₙ = −13.6/n² eV. (hc = 1.99 × 10⁻²⁵ J m, 1 eV = 1.60 × 10⁻¹⁹ J)',[
 ['n','Calculate the energy of the photon given out when an electron drops from n = 4 to n = 2, in eV.',2.55,0.02,'eV',2,'ΔE = 13.6(1/2² − 1/4²) = 13.6 × 0.1875 = 2.55 eV.'],
 ['n','Calculate its wavelength in nm.',488,0.02,'nm',2,'λ = hc/E = 1.99 × 10⁻²⁵ ÷ (2.55 × 1.60 × 10⁻¹⁹) = 4.88 × 10⁻⁷ m = 488 nm: the blue-green Balmer line.'],
 ['n','How much energy (in eV) does it take to ionise hydrogen from n = 2?',3.4,0.02,'eV',1,'From E₂ = −13.6/4 = −3.4 eV up to 0: 3.4 eV.'],
 ['c','An electron starts in n = 4. How many different photon energies can it give out on its way down to n = 1?',['6','3','4','10'],1,'Every pair of levels gives one line: 4→3, 4→2, 4→1, 3→2, 3→1, 2→1. That\'s 6.']]);
EQ('qm1-4','Uncertainty in an atom','An electron is confined to a region 1.0 × 10⁻¹⁰ m across. (ħ = 1.055 × 10⁻³⁴ J s, mₑ = 9.11 × 10⁻³¹ kg)',[
 ['n','Calculate the smallest possible uncertainty in its momentum.',5.28e-25,0.03,'kg m/s',2,'Δp ≥ ħ/(2Δx) = 1.055 × 10⁻³⁴ ÷ (2 × 1.0 × 10⁻¹⁰) = 5.3 × 10⁻²⁵ kg m/s.'],
 ['n','Calculate the matching uncertainty in its speed.',5.79e5,0.03,'m/s',1,'Δv = Δp/m = 5.28 × 10⁻²⁵ ÷ 9.11 × 10⁻³¹ = 5.8 × 10⁵ m/s. Electrons in atoms can\'t sit still.'],
 ['c','Why don\'t we notice this for a cricket ball confined to 1 cm?',['Its mass is huge, so Δv = Δp/m is tiny','ħ is zero for big objects','Big objects aren\'t made of atoms','It moves too fast']  ,1,'Δp is still about 10⁻³² kg m/s, but dividing by 0.16 kg gives Δv around 10⁻³¹ m/s. Far too small to ever see.']]);
EQ('qm2-1','Normalising a wavefunction','A particle has ψ(x) = Ax for 0 ≤ x ≤ 1 nm, and ψ = 0 elsewhere. Work in nanometres.',[
 ['n','Find A (in nm<sup>−3/2</sup>).',1.732,0.02,'nm^−3/2',2,'∫|ψ|² dx = A² ∫₀¹ x² dx = A²/3 = 1, so A = √3 = 1.73.'],
 ['n','Find the probability of finding the particle between 0 and 0.5 nm.',0.125,0.03,'',2,'P = ∫₀^0.5 3x² dx = [x³]₀^0.5 = 0.125. Only 1/8, because |ψ|² is small near 0.'],
 ['c','Where is the particle most likely to be found?',['Near x = 1 nm','Near x = 0.5 nm','Near x = 0','Everywhere equally'],1,'|ψ|² = 3x² is biggest at the right-hand end, x = 1 nm.']]);
EQ('qm2-2','An electron in a box','An electron is trapped in a box 1.0 nm wide. Eₙ = n²h²/(8mL²). (h = 6.63 × 10⁻³⁴ J s, mₑ = 9.11 × 10⁻³¹ kg, 1 eV = 1.60 × 10⁻¹⁹ J)',[
 ['n','Calculate the ground-state energy in eV.',0.377,0.03,'eV',2,'E₁ = (6.63 × 10⁻³⁴)² ÷ (8 × 9.11 × 10⁻³¹ × (1.0 × 10⁻⁹)²) = 6.03 × 10⁻²⁰ J = 0.377 eV.'],
 ['n','Calculate E₂ in eV.',1.51,0.03,'eV',1,'E ∝ n², so E₂ = 4E₁ = 1.51 eV.'],
 ['n','Calculate the wavelength of the photon given out when it drops from n = 2 to n = 1, in nm.',1100,0.03,'nm',2,'ΔE = 3E₁ = 1.81 × 10⁻¹⁹ J. λ = hc/ΔE = 1.99 × 10⁻²⁵ ÷ 1.81 × 10⁻¹⁹ = 1.10 × 10⁻⁶ m = 1100 nm (infrared).'],
 ['c','The box is made twice as wide. What happens to E₁?',['It becomes a quarter','It halves','It doubles','It becomes four times bigger'],1,'E ∝ 1/L². Doubling L divides E by 4. Bigger quantum dots glow redder for this reason.']]);
EQ('qm2-3','Tunnelling through a barrier','An electron meets a barrier 1.0 eV higher than its energy and 0.50 nm thick. T ≈ e<sup>−2κL</sup>, where κ = √(2m(V − E))/ħ. (ħ = 1.055 × 10⁻³⁴ J s, mₑ = 9.11 × 10⁻³¹ kg)',[
 ['n','Calculate κ.',5.12e9,0.03,'m⁻¹',2,'κ = √(2 × 9.11 × 10⁻³¹ × 1.60 × 10⁻¹⁹) ÷ 1.055 × 10⁻³⁴ = 5.12 × 10⁹ m⁻¹.'],
 ['n','Estimate the probability it tunnels through.',6.0e-3,0.06,'',2,'2κL = 2 × 5.12 × 10⁹ × 0.50 × 10⁻⁹ = 5.12. T ≈ e<sup>−5.12</sup> = 6.0 × 10⁻³: about 1 in 170.'],
 ['n','Estimate it again for a barrier twice as thick (1.0 nm).',3.6e-5,0.08,'',1,'2κL doubles to 10.2, so T ≈ e<sup>−10.2</sup> = 3.6 × 10⁻⁵. Doubling the thickness squares the (small) probability. That\'s why a scanning tunnelling microscope is so sensitive to distance.'],
 ['c','A proton meets the same barrier. Its chance of tunnelling is:',['Much smaller, because κ grows with √m','The same, because only the barrier matters','Bigger, because protons are heavier','Exactly zero'],1,'A proton is 1836 times heavier, so κ is √1836 ≈ 43 times bigger, and T is fantastically smaller.']]);
EQ('qm2-4','Measuring spin','A spin-½ particle is in the state (√3/2)|↑⟩ + (1/2)|↓⟩, measured along z.',[
 ['n','Find the probability of getting spin down.',0.25,0.02,'',1,'P(↓) = (1/2)² = 0.25.'],
 ['n','1000 particles in this state go through a Stern–Gerlach magnet. How many do you expect to go up?',750,0.02,'',1,'P(↑) = (√3/2)² = 0.75, so about 750.'],
 ['n','A spin pointing along +x is measured along z. Find P(up).',0.5,0.02,'',1,'|+x⟩ = (|↑⟩ + |↓⟩)/√2, so P(↑) = (1/√2)² = 0.5.'],
 ['c','A particle has just been measured spin up along z. It is measured along z again. What do you get?',['Up, for certain','Up or down, 50/50','Down, for certain','It depends on x'],1,'Measuring puts it in |↑⟩. Measure the same thing again straight away and you get the same answer.']]);
EQ('qm3-1','Adding amplitudes','A particle can reach a detector by two paths, with amplitudes 0.4 and 0.4e<sup>iφ</sup>.',[
 ['n','Find the probability at the detector when φ = 0.',0.64,0.02,'',1,'P = |0.4 + 0.4|² = 0.8² = 0.64.'],
 ['n','Find it when φ = π/2.',0.32,0.02,'',2,'P = |0.4 + 0.4i|² = 0.4² + 0.4² = 0.32.'],
 ['n','Find it when φ = π.',0,0.02,'',1,'e<sup>iπ</sup> = −1, so P = |0.4 − 0.4|² = 0: complete cancellation.'],
 ['c','Without interference (adding probabilities, not amplitudes), what would P be?',['0.32 for every φ','0.64','0','0.16'],1,'0.4² + 0.4² = 0.32. Interference swings it between 0 and 0.64 around that average.']]);
EQ('qm3-2','Operators and measurements','Use p̂ = −iħ d/dx. (ħ = 1.055 × 10⁻³⁴ J s)',[
 ['n','A particle in a box of width 2.0 nm is in its ground state. Find ⟨x⟩ in nm.',1.0,0.02,'nm',1,'|ψ|² is symmetric about the middle, so ⟨x⟩ = L/2 = 1.0 nm.'],
 ['n','ψ = e<sup>ikx</sup> with k = 1.0 × 10¹⁰ m⁻¹. Find its momentum.',1.055e-24,0.03,'kg m/s',2,'p̂ψ = −iħ(ik)e<sup>ikx</sup> = ħk ψ. So p = ħk = 1.055 × 10⁻²⁴ kg m/s.'],
 ['c','What is ⟨p⟩ for the ground state of the box?',['0: moving left and right are equally likely','ħπ/L','h/L','It\'s undefined'],1,'The standing wave is equal parts e<sup>ikx</sup> and e<sup>−ikx</sup>, so the average momentum is 0 (though ⟨p²⟩ isn\'t).'],
 ['c','A system is in an eigenstate of an operator. Measuring that quantity gives:',['The eigenvalue, every time','A random value','The eigenvalue only on average','Zero'],1,'That\'s what an eigenstate means: a definite value, with no spread.']]);
EQ('qm3-3','A vibrating molecule','A molecule vibrates like a quantum oscillator with ω = 1.0 × 10¹⁴ rad/s. Eₙ = (n + ½)ħω. (ħ = 1.055 × 10⁻³⁴ J s, hc = 1.99 × 10⁻²⁵ J m)',[
 ['n','Calculate its ground-state (zero-point) energy in joules.',5.28e-21,0.03,'J',1,'E₀ = ½ħω = 0.5 × 1.055 × 10⁻³⁴ × 1.0 × 10¹⁴ = 5.3 × 10⁻²¹ J.'],
 ['n','Calculate the wavelength of light it absorbs going from n = 0 to n = 1, in μm.',18.9,0.03,'μm',2,'ΔE = ħω = 1.055 × 10⁻²⁰ J. λ = hc/ΔE = 1.99 × 10⁻²⁵ ÷ 1.055 × 10⁻²⁰ = 1.89 × 10⁻⁵ m = 18.9 μm: infrared, which is why greenhouse gases absorb heat.'],
 ['c','How are the oscillator\'s energy levels spaced?',['All equally, by ħω','Further apart as n goes up','Closer together as n goes up','Randomly'],1,'Eₙ = (n + ½)ħω goes up in equal steps of ħω.']]);
EQ('qm3-4','States as vectors','|ψ⟩ = (3|0⟩ + 4i|1⟩)/5.',[
 ['n','Find P(0).',0.36,0.02,'',1,'P(0) = |3/5|² = 0.36.'],
 ['n','Find P(1).',0.64,0.02,'',1,'P(1) = |4i/5|² = 16/25 = 0.64. The i doesn\'t change the size.'],
 ['n','Find ⟨σ<sub>z</sub>⟩ (+1 for |0⟩, −1 for |1⟩).',-0.28,0.03,'',2,'⟨σ<sub>z</sub>⟩ = (+1)(0.36) + (−1)(0.64) = −0.28.'],
 ['c','What is ⟨1|ψ⟩?',['4i/5','4/5','−4i/5','16/25'],1,'⟨1|ψ⟩ picks out the |1⟩ component: 4i/5. Its size squared is the probability.']]);
EQ('qm4-1','Quantised angular momentum','An electron is in a d orbital, l = 2.',[
 ['n','Find the size of its orbital angular momentum, in units of ħ.',2.449,0.02,'ħ',1,'|L| = √(l(l + 1)) ħ = √6 ħ = 2.45ħ.'],
 ['n','How many values of m are allowed?',5,0.01,'',1,'m = −2, −1, 0, 1, 2: that\'s 2l + 1 = 5.'],
 ['n','For m = 2, find the angle between L and the z-axis, in degrees.',35.3,0.02,'°',2,'cos θ = L<sub>z</sub>/|L| = 2/√6 = 0.816, so θ = 35.3°.'],
 ['c','Why can\'t L point exactly along z?',['Then Lₓ and Lᵧ would both be exactly 0, which uncertainty forbids','It would be too heavy','A magnetic field stops it','It can']  ,1,'Lₓ, Lᵧ and L<sub>z</sub> don\'t commute. If L were exactly along z, all three would be known at once.']]);
EQ('qm4-2','Hydrogen','Eₙ = −13.6/n² eV, a₀ = 0.0529 nm. (hc = 1.99 × 10⁻²⁵ J m)',[
 ['n','Find the wavelength of the Lyman-alpha line (n = 2 to 1), in nm.',122,0.02,'nm',2,'ΔE = 13.6 × ¾ = 10.2 eV = 1.63 × 10⁻¹⁸ J. λ = hc/ΔE = 122 nm: ultraviolet.'],
 ['n','In the Bohr picture, rₙ = n²a₀. Find r for n = 3, in nm.',0.476,0.02,'nm',1,'r₃ = 9 × 0.0529 = 0.476 nm.'],
 ['n','How many states does n = 3 have, including spin?',18,0.01,'',2,'l = 0, 1, 2 give 1 + 3 + 5 = 9 = n² orbitals, × 2 for spin = 18.'],
 ['c','In the ground state, at what radius is the electron most likely to be found?',['a₀ = 0.053 nm','0','2a₀','Anywhere'],1,'|ψ|² is biggest at r = 0, but there\'s very little volume there. The radial probability 4πr²|ψ|² peaks at a₀.']]);
EQ('qm4-3','Building atoms','Use the Pauli exclusion principle.',[
 ['n','What is the most electrons the n = 2 shell can hold?',8,0.01,'',1,'2s holds 2, 2p holds 6: 2n² = 8.'],
 ['n','What is the most electrons a d subshell (l = 2) can hold?',10,0.01,'',1,'2l + 1 = 5 orbitals × 2 spins = 10.'],
 ['c','Which of these is a boson?',['A helium-4 atom','An electron','A proton','A helium-3 atom'],1,'Helium-4 has 6 fermions (2p, 2n, 2e), an even number, so it acts as a boson. That\'s why it can become a superfluid.']]);
EQ('qm4-4','Approximations','The ground state of an oscillator is exactly ½ħω.',[
 ['n','A trial wavefunction gives 0.53ħω. By what percentage is it too high?',6,0.05,'%',1,'(0.53 − 0.50)/0.50 = 6%.'],
 ['c','Can a trial wavefunction ever give an energy below the true ground state?',['No: E<sub>trial</sub> ≥ E₀ always','Yes, often','Only for hydrogen','Only if it isn\'t normalised'],1,'That\'s the variational principle. The lowest trial energy you find is always an upper bound, which is what makes the method useful.'],
 ['n','A constant 0.2 eV is added to the potential of a box. By how much does E₁ change (first order), in eV?',0.2,0.02,'eV',1,'E⁽¹⁾ = ⟨ψ|V|ψ⟩ = 0.2⟨ψ|ψ⟩ = 0.2 eV. A constant just shifts every level.']]);
EQ('qm5-1','A density matrix','ρ = [[0.7, 0.3], [0.3, 0.3]].',[
 ['n','Find P(0).',0.7,0.02,'',1,'The diagonal gives the probabilities: P(0) = 0.7.'],
 ['n','Find Tr ρ².',0.76,0.02,'',2,'ρ² has diagonal 0.7² + 0.3² = 0.58 and 0.3² + 0.3² = 0.18. Tr ρ² = 0.76.'],
 ['c','Is the state pure or mixed?',['Mixed, because Tr ρ² < 1','Pure','Neither','It isn\'t a valid state'],1,'Pure states have Tr ρ² = 1. 0.76 means some coherence has been lost (decoherence).']]);
EQ('qm5-2','Quantum computing numbers','Think about how a quantum computer scales.',[
 ['n','How many complex amplitudes describe 10 qubits?',1024,0.01,'',1,'2¹⁰ = 1024. Each extra qubit doubles it, which is why classical computers can\'t keep up.'],
 ['n','Grover\'s search needs about (π/4)√N steps. How many for N = 1 000 000?',785,0.02,'',2,'(π/4) × 1000 = 785. A classical search needs about N/2 = 500 000 tries on average.'],
 ['c','What does a Hadamard gate do to |0⟩?',['(|0⟩ + |1⟩)/√2','|1⟩','(|0⟩ − |1⟩)/√2','|0⟩'],1,'H makes an equal superposition. H|1⟩ = (|0⟩ − |1⟩)/√2.']]);
EQ('qm5-3','Antimatter','The electron\'s mass is 9.11 × 10⁻³¹ kg; mₑc² = 0.511 MeV.',[
 ['n','What is the smallest photon energy that can make an electron–positron pair, in MeV?',1.022,0.02,'MeV',1,'You must make two rest masses: 2 × 0.511 = 1.022 MeV (a nearby nucleus takes up the momentum).'],
 ['n','An electron and positron annihilate at rest into two photons. Find each photon\'s energy in keV.',511,0.02,'keV',1,'Momentum is zero, so the photons go opposite ways with equal energy: 0.511 MeV = 511 keV each. PET scanners detect exactly these.'],
 ['c','What did the Dirac equation predict?',['Antimatter','The neutron','Quarks','Black holes'],1,'Its negative-energy solutions were explained by Dirac as antiparticles. The positron was found in 1932.']]);
EQ('qm5-4','The range of a force','A force carried by a particle of mass m has range ≈ ħc/(mc²). ħc = 197 MeV fm.',[
 ['n','Find the range of the force carried by a pion (mc² = 140 MeV), in fm.',1.41,0.03,'fm',2,'197 ÷ 140 = 1.4 fm: the size of a nucleus. Yukawa used this to predict the pion.'],
 ['n','Find the range for the W boson (mc² = 80 400 MeV), in fm.',2.45e-3,0.03,'fm',1,'197 ÷ 80 400 = 2.5 × 10⁻³ fm. That\'s why the weak force is so weak and short-ranged.'],
 ['c','What is the range of the force carried by the massless photon?',['Infinite','Zero','About 1 fm','The size of an atom'],1,'m = 0 gives an infinite range: electromagnetism reaches across the universe, falling off as 1/r².']]);
EQ('qm6-1','Stationary states','ψ(x, t) = φ(x)e<sup>−iEt/ħ</sup>. (h = 6.63 × 10⁻³⁴ J s, 1 eV = 1.60 × 10⁻¹⁹ J)',[
 ['c','Does |ψ(x, t)|² change with time?',['No: the phase factor has size 1','Yes, it oscillates','It decays','It grows'],1,'|e<sup>−iEt/ħ</sup>|² = 1. That\'s why these are called stationary states.'],
 ['n','Find the period of the phase rotation for E = 1.0 eV.',4.14e-15,0.03,'s',1,'T = h/E = 6.63 × 10⁻³⁴ ÷ 1.60 × 10⁻¹⁹ = 4.1 × 10⁻¹⁵ s.'],
 ['n','A superposition of E₁ = 1.0 eV and E₂ = 4.0 eV sloshes about. Find the period.',1.38e-15,0.03,'s',2,'The cross term oscillates at (E₂ − E₁)/h, so T = h/ΔE = 6.63 × 10⁻³⁴ ÷ (3.0 × 1.60 × 10⁻¹⁹) = 1.4 × 10⁻¹⁵ s.']]);
EQ('qm6-2','The potential step','A particle with E = 4.0 eV meets a step of height V₀ = 3.0 eV. R = ((k₁ − k₂)/(k₁ + k₂))².',[
 ['n','Find k₂/k₁.',0.5,0.02,'',1,'k ∝ √(kinetic energy): k₂/k₁ = √((4 − 3)/4) = 0.5.'],
 ['n','Find the reflection probability R.',0.111,0.03,'',2,'R = ((1 − 0.5)/(1 + 0.5))² = (1/3)² = 0.11. A classical particle would never bounce back.'],
 ['c','If instead E < V₀:',['R = 1, but the wave still leaks a little way into the step','R = 0','T = 1','The particle stops at the step'],1,'Total reflection, but with an evanescent tail e<sup>−κx</sup> inside the step. Make the step thin and that tail becomes tunnelling.']]);
EQ('qm6-3','A Gaussian wave packet','A minimum-uncertainty Gaussian packet has Δx = 0.10 nm. (ħ = 1.055 × 10⁻³⁴ J s)',[
 ['n','Find Δk.',5.0e9,0.03,'m⁻¹',2,'Δx Δk = ½ for a Gaussian, so Δk = 1/(2 × 0.10 × 10⁻⁹) = 5.0 × 10⁹ m⁻¹.'],
 ['n','Find Δp.',5.28e-25,0.03,'kg m/s',1,'Δp = ħΔk = 1.055 × 10⁻³⁴ × 5.0 × 10⁹ = 5.3 × 10⁻²⁵ kg m/s.'],
 ['c','The packet is made narrower. Its spread of k:',['Gets wider','Gets narrower','Stays the same','Disappears'],1,'A narrow bump needs many waves to build it. That trade-off is the uncertainty principle, straight from Fourier transforms.']]);
EQ('qm6-4','The oscillator and hydrogen, derived','Use what the ladder operators and the radial equation tell you.',[
 ['n','Find E₃ for the oscillator, in units of ħω.',3.5,0.02,'ħω',1,'Eₙ = (n + ½)ħω, so E₃ = 3.5ħω.'],
 ['n','How many radial nodes does the hydrogen 3s (n = 3, l = 0) wavefunction have?',2,0.01,'',1,'Radial nodes = n − l − 1 = 2.'],
 ['c','What is [L², L<sub>z</sub>]?',['0','iħL<sub>z</sub>','ħ²','Lₓ'],1,'L² commutes with every component, so you can know L² and L<sub>z</sub> together. That\'s why orbitals are labelled by l and m.']]);
EQ('qm7-1','Fermi\'s golden rule','A state decays with Γ = (2π/ħ)|V|²ρ. Here |V| = 1.0 × 10⁻⁶ eV and ρ = 1.0 × 10⁴ states per eV. (ħ = 6.58 × 10⁻¹⁶ eV s)',[
 ['n','Calculate the decay rate Γ.',9.55e7,0.03,'s⁻¹',2,'Γ = 2π × (1.0 × 10⁻⁶)² × 1.0 × 10⁴ ÷ 6.58 × 10⁻¹⁶ = 9.5 × 10⁷ s⁻¹.'],
 ['n','Calculate the lifetime.',1.05e-8,0.03,'s',1,'τ = 1/Γ = 1.0 × 10⁻⁸ s: typical of an excited atom.'],
 ['c','What are the units of a cross section?',['m² (an area)','m','s⁻¹','J'],1,'A cross section is the effective target area. Nuclear ones are measured in barns: 10⁻²⁸ m².']]);
EQ('qm7-2','Why the world looks classical','In a path integral each path contributes e<sup>iS/ħ</sup>. (ħ = 1.055 × 10⁻³⁴ J s)',[
 ['n','A 0.10 kg ball moves at 1.0 m/s for 1.0 s. Estimate S/ħ, taking S ≈ ½mv²t.',4.7e32,0.03,'',2,'S = 0.5 × 0.10 × 1.0² × 1.0 = 0.05 J s. S/ħ = 0.05 ÷ 1.055 × 10⁻³⁴ = 4.7 × 10³².'],
 ['c','So why does the ball follow one classical path?',['Nearby paths have wildly different phases and cancel, except near least action','Balls don\'t have paths','ħ is bigger for big objects','Gravity holds it on one path'],1,'Near the path of least action, S hardly changes, so neighbouring paths add up in phase. Everywhere else they cancel.']]);
EQ('qm7-3','Bell\'s theorem','Two spin-½ particles are in the singlet state. The correlation along directions at angle θ is E = −cos θ.',[
 ['n','Find the correlation at θ = 60°.',-0.5,0.02,'',1,'E = −cos 60° = −0.5.'],
 ['n','Quantum mechanics can reach CHSH S = 2√2. Find S.',2.83,0.02,'',1,'2√2 = 2.83, beating the local-hidden-variable limit of 2. Experiments agree with quantum mechanics.'],
 ['c','Can entanglement send a message faster than light?',['No: each side on its own just sees random results','Yes','Only with photons','Only over long distances'],1,'The correlations only show up when you compare results, which needs an ordinary signal.']]);
EQ('qm7-4','Fields and symmetries','Noether\'s theorem links symmetries to conservation laws. (h = 6.63 × 10⁻³⁴ J s, mₑ = 9.11 × 10⁻³¹ kg, c = 3.00 × 10⁸ m/s)',[
 ['c','The laws of physics are the same today as tomorrow. What is conserved?',['Energy','Momentum','Charge','Angular momentum'],1,'Time-translation symmetry gives energy conservation. Space-translation gives momentum; rotation gives angular momentum.'],
 ['c','Which symmetry gives conservation of electric charge?',['Changing the phase of the wavefunction','Rotations','Moving in space','Reflection in a mirror'],1,'Global phase symmetry gives charge conservation. Make it local and you need the photon field: that\'s QED.'],
 ['n','Find the electron\'s Compton wavelength h/(mc).',2.43e-12,0.03,'m',1,'6.63 × 10⁻³⁴ ÷ (9.11 × 10⁻³¹ × 3.00 × 10⁸) = 2.4 × 10⁻¹² m. Squeeze an electron smaller than this and you make new particles.']]);
var startExam0=startExam;startExam=function(ui){var u=UNITS[ui],qs=EXQ[u.id];if(!qs||!qs.length)return startExam0(ui);
 P={mode:'exam',ui:ui,li:-1,cards:qs.map(function(q){return W('examQ',{q:q,unit:u.title},'')}),i:0,xp:0,right:0,asked:0,title:'Exam question',color:u.color,unit:u.title+' · exam question',combo:0,best:0,cbonus:0,mistakes:0,fixed:0,newBadges:[],levelUp:null};openPlayer()};
