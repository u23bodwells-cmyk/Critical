/* ---------- A-level Physics ---------- */
EQ('ap1-1','Uncertainties','The side of a square tile is measured as 25.0 ± 0.1 cm.',[
 ['n','Calculate the percentage uncertainty in the length.',0.4,0.01,'%',1,'0.1 ÷ 25.0 × 100 = 0.4%.'],
 ['n','Calculate the percentage uncertainty in the area of the tile.',0.8,0.01,'%',1,'Area = L², so double the percentage: 0.8%.'],
 ['n','A V–I graph through the origin passes through V = 6.0 V at I = 0.40 A. Calculate the resistance from the gradient.',15,0.01,'Ω',2,'R = V ÷ I = 6.0 ÷ 0.40 = 15 Ω.']]);
EQ('ap1-2','Work at an angle','A 2.0 kg box is pulled 5.0 m along a floor by a force of 20 N at 30° above the horizontal.',[
 ['n','Calculate the horizontal component of the force.',17.3,0.005,'N',2,'20 cos 30° = 17.3 N.'],
 ['n','Calculate the work done by the force.',86.6,0.005,'J',2,'W = Fs cos θ = 20 × 5.0 × cos 30° = 86.6 J.'],
 ['n','The pull takes 4.0 s. Calculate the average power.',21.7,0.01,'W',1,'P = W ÷ t = 86.6 ÷ 4.0 = 21.7 W.']]);
EQ('ap2-1','The photoelectric effect','Light of wavelength 400 nm falls on a metal with a work function of 2.3 eV. h = 6.63 × 10⁻³⁴ J s, c = 3.00 × 10⁸ m/s, e = 1.60 × 10⁻¹⁹ C.',[
 ['n','Calculate the photon energy in eV.',3.11,0.005,'eV',2,'E = hc/λ = 6.63 × 10⁻³⁴ × 3.00 × 10⁸ ÷ 400 × 10⁻⁹ = 4.97 × 10⁻¹⁹ J ÷ 1.60 × 10⁻¹⁹ = 3.11 eV.'],
 ['n','Calculate the maximum kinetic energy of the photoelectrons in eV.',0.81,0.02,'eV',2,'Eₖ(max) = hf − φ = 3.11 − 2.3 = 0.81 eV.'],
 ['s','Explain why making the light brighter does not increase the maximum kinetic energy of the electrons.',2,['Each electron absorbs the energy of one photon, which depends only on frequency','Brighter light means more photons per second, so more electrons are emitted, but each still has the same maximum energy']]]);
EQ('ap2-2','A vibrating string','A string 0.80 m long vibrates in its fundamental mode at 250 Hz.',[
 ['n','What is the wavelength of the stationary wave?',1.6,0.005,'m',1,'The fundamental is half a wavelength: λ = 2L = 1.6 m.'],
 ['n','Calculate the speed of the waves on the string.',400,0.005,'m/s',2,'v = fλ = 250 × 1.6 = 400 m/s.'],
 ['n','What is the frequency of the second harmonic?',500,0.005,'Hz',1,'Twice the fundamental: 500 Hz.'],
 ['c','What is the amplitude at a node?',['Zero','Maximum','Half the maximum','It varies with time'],1,'Nodes are points of zero amplitude.']]);
EQ('ap2-3','A projectile','A ball is thrown horizontally at 12 m/s from the top of a 20 m cliff. g = 9.81 m/s². Ignore air resistance.',[
 ['n','Calculate the time it takes to reach the ground.',2.02,0.01,'s',2,'s = ½gt² → t = √(2 × 20 ÷ 9.81) = 2.02 s.'],
 ['n','Calculate how far from the base of the cliff it lands.',24.2,0.01,'m',2,'Horizontal distance = 12 × 2.02 = 24.2 m.'],
 ['c','What happens to the horizontal velocity during the flight?',['It stays constant','It increases','It decreases','It becomes zero at the top'],1,'With no air resistance there is no horizontal force.']]);
EQ('ap2-4','EMF and internal resistance','A cell of emf 6.0 V and internal resistance 0.50 Ω is connected to a 2.5 Ω resistor.',[
 ['n','Calculate the current.',2,0.01,'A',2,'I = ε ÷ (R + r) = 6.0 ÷ 3.0 = 2.0 A.'],
 ['n','Calculate the terminal potential difference.',5,0.01,'V',1,'V = IR = 2.0 × 2.5 = 5.0 V.'],
 ['n','Calculate the "lost volts".',1,0.01,'V',1,'Ir = 2.0 × 0.50 = 1.0 V (and 6.0 − 5.0 = 1.0 V).'],
 ['n','A copper wire is 2.0 m long with cross-sectional area 1.0 × 10⁻⁷ m². ρ = 1.7 × 10⁻⁸ Ω m. Calculate its resistance.',0.34,0.01,'Ω',2,'R = ρL ÷ A = 1.7 × 10⁻⁸ × 2.0 ÷ 1.0 × 10⁻⁷ = 0.34 Ω.']]);
EQ('ap3-1','Oscillations and gases','A mass on a spring moves with simple harmonic motion: amplitude 0.050 m, period 0.80 s.',[
 ['n','Calculate the frequency.',1.25,0.005,'Hz',1,'f = 1 ÷ T = 1.25 Hz.'],
 ['n','Calculate the maximum speed of the mass.',0.393,0.01,'m/s',2,'v(max) = 2πfA = 2π × 1.25 × 0.050 = 0.393 m/s.'],
 ['n','A gas occupies 0.020 m³ at 300 K and 1.0 × 10⁵ Pa. Calculate the number of moles. R = 8.31 J/mol K.',0.802,0.01,'mol',2,'n = pV ÷ RT = 1.0 × 10⁵ × 0.020 ÷ (8.31 × 300) = 0.802 mol.']]);
EQ('ap3-2','Capacitors and fields','A 470 μF capacitor is charged to 12 V and then discharged through a 10 kΩ resistor.',[
 ['n','Calculate the charge stored at 12 V.',5.64e-3,0.01,'C',2,'Q = CV = 470 × 10⁻⁶ × 12 = 5.64 × 10⁻³ C.'],
 ['n','Calculate the time constant.',4.7,0.01,'s',1,'τ = RC = 10 000 × 470 × 10⁻⁶ = 4.7 s.'],
 ['n','Calculate the pd across the capacitor after 4.7 s.',4.41,0.01,'V',2,'After one time constant, V = 12 × e⁻¹ = 4.41 V.'],
 ['c','How does the gravitational field strength change at twice the distance from a planet\'s centre?',['It falls to a quarter','It halves','It stays the same','It doubles'],1,'g = GM/r²: double r, ÷ 4.']]);
EQ('ap3-3','Electromagnetic induction','A coil of 200 turns and area 4.0 × 10⁻³ m² sits in a magnetic field that falls uniformly from 0.50 T to zero in 0.10 s.',[
 ['n','Calculate the change in flux linkage.',0.4,0.01,'Wb turns',2,'ΔNΦ = NBA = 200 × 0.50 × 4.0 × 10⁻³ = 0.40 Wb turns.'],
 ['n','Calculate the induced emf.',4,0.01,'V',2,'ε = ΔNΦ ÷ Δt = 0.40 ÷ 0.10 = 4.0 V.'],
 ['n','The mains supply is 230 V rms. Calculate the peak voltage.',325,0.005,'V',1,'V₀ = √2 × 230 = 325 V.'],
 ['s','Use Lenz\'s law to explain the direction of the induced current.',2,['The induced current flows in a direction that opposes the change in flux that caused it','This follows from conservation of energy']]]);
EQ('ap3-4','Binding energy','The mass defect of a helium-4 nucleus is 0.0304 u. 1 u = 931.5 MeV.',[
 ['n','Calculate the binding energy of helium-4.',28.3,0.005,'MeV',2,'0.0304 × 931.5 = 28.3 MeV.'],
 ['n','Calculate the binding energy per nucleon.',7.08,0.01,'MeV',1,'28.3 ÷ 4 = 7.08 MeV.'],
 ['n','Cobalt-60 has a half-life of 5.27 years. Calculate its decay constant, per year.',0.1315,0.01,'per year',2,'λ = ln 2 ÷ T½ = 0.693 ÷ 5.27 = 0.132 per year.'],
 ['c','Why do both fission of heavy nuclei and fusion of light nuclei release energy?',['The products have a higher binding energy per nucleon','The products have more mass','Neutrons are created from nothing','The nuclei gain electrons'],1,'Both move towards the peak of the binding energy curve near iron.']]);
EQ('ap4-1','Logarithmic graphs','A student plots ln(count rate) against absorber thickness x for gamma rays. The gradient is −0.11 per mm.',[
 ['n','What is the attenuation coefficient μ?',0.11,0.01,'per mm',1,'I = I₀e^(−μx), so ln I = ln I₀ − μx: the gradient is −μ.'],
 ['n','Calculate the half-value thickness.',6.3,0.01,'mm',2,'x½ = ln 2 ÷ μ = 0.693 ÷ 0.11 = 6.3 mm.'],
 ['s','Describe how to find the uncertainty in the gradient.',2,['Draw a worst-fit line (steepest or shallowest that still goes through all the error bars)','The uncertainty is the difference between the best-fit and worst-fit gradients']]]);
EQ('ap4-2','Exam technique','An electron is accelerated from rest through a potential difference of 2000 V. e = 1.60 × 10⁻¹⁹ C.',[
 ['c','What does "show that" mean?',['Reach the given answer, showing every step','Just write the answer','Draw a diagram','Give a reason'],1,'The answer is given, so the marks are all for the working.'],
 ['n','Calculate the kinetic energy gained, in joules.',3.2e-16,0.01,'J',2,'E = eV = 1.60 × 10⁻¹⁹ × 2000 = 3.2 × 10⁻¹⁶ J.'],
 ['s','Describe how to find g using a simple pendulum.',3,['Measure the length from the pivot to the centre of the bob','Time 10 or more oscillations and divide to get T; repeat for several lengths','Plot T² against L: g = 4π² ÷ gradient']]]);
