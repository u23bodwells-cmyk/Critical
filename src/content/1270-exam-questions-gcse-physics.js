/* ---------- GCSE Physics ---------- */
EQ('gp1-1','Power station output','A nuclear power station generates 3.2 GW of electrical power.',[
 ['n','Write 3.2 GW in watts. Give your answer in standard form.',3.2e9,0.01,'W',1,'G means × 10⁹, so 3.2 GW = 3.2 × 10⁹ W.'],
 ['n','Calculate the energy it generates in one hour, in joules. Give your answer to 2 significant figures.',1.2e13,0.04,'J',2,'E = P × t = 3.2 × 10⁹ × 3600 = 1.152 × 10¹³ J ≈ 1.2 × 10¹³ J.'],
 ['c','Which of these is an SI base unit?',['kilogram','gram','newton','watt'],1,'The SI base unit of mass is the kilogram. The newton and watt are derived units.']]);
EQ('gp1-2','An accelerating car','A car of mass 1200 kg accelerates uniformly from rest to 15 m/s in 6.0 s.',[
 ['n','Calculate the acceleration of the car.',2.5,0.01,'m/s²',2,'a = Δv ÷ t = 15 ÷ 6.0 = 2.5 m/s².'],
 ['n','Calculate the resultant force on the car.',3000,0.01,'N',2,'F = ma = 1200 × 2.5 = 3000 N.'],
 ['n','Calculate the kinetic energy of the car at 15 m/s.',135000,0.01,'J',2,'Eₖ = ½mv² = 0.5 × 1200 × 15² = 135 000 J.']]);
EQ('gp1-3','Stretching a spring','A student hangs loads on a spring. With 2.0 N the extension is 4.0 cm. With 5.0 N it is 10.0 cm.',[
 ['n','The student plots force (y-axis) against extension (x-axis). Calculate the gradient, in N/cm.',0.5,0.02,'N/cm',2,'Gradient = Δy ÷ Δx = (5.0 − 2.0) ÷ (10.0 − 4.0) = 0.5 N/cm.'],
 ['c','What is the independent variable?',['The load (force)','The extension','The spring constant','The length of the ruler'],1,'The independent variable is the one you change: the load.'],
 ['s','Suggest two ways the student could make the results more accurate or repeatable.',2,['Repeat each reading and take a mean','Read the ruler at eye level to avoid parallax','Use a fixed pointer or set square against the ruler','Wait for the spring to stop bouncing before reading']]]);
EQ('gp1-4','A steady cyclist','A cyclist travels 1.2 km in 4.0 minutes at a constant speed.',[
 ['n','Calculate her speed in m/s.',5,0.01,'m/s',2,'1.2 km = 1200 m, 4.0 min = 240 s. Speed = 1200 ÷ 240 = 5.0 m/s.'],
 ['c','How is constant speed shown on a distance–time graph?',['A straight sloping line','A horizontal line','A curve getting steeper','A vertical line'],1,'Equal distance in equal times gives a constant gradient.'],
 ['s','She keeps pedalling but her speed stays the same. Explain why.',2,['The forward (driving) force equals the resistive forces (air resistance and friction)','So the resultant force is zero and there is no acceleration']]]);
EQ('gp2-1','Boiling a kettle','A kettle heats 0.50 kg of water from 20 °C to 100 °C. The specific heat capacity of water is 4200 J/kg °C. The kettle\'s power is 2.0 kW.',[
 ['n','Calculate the energy needed to heat the water.',168000,0.01,'J',2,'ΔE = mcΔθ = 0.50 × 4200 × 80 = 168 000 J.'],
 ['n','Calculate the shortest time this could take.',84,0.01,'s',2,'t = E ÷ P = 168 000 ÷ 2000 = 84 s.'],
 ['n','It actually takes 100 s. Calculate the efficiency of the kettle as a percentage.',84,0.01,'%',2,'Energy supplied = 2000 × 100 = 200 000 J. Efficiency = 168 000 ÷ 200 000 × 100 = 84%.'],
 ['s','Suggest one way to reduce the energy wasted.',1,['Insulate the kettle (or use a lid) to cut heat loss to the surroundings','Only boil the water you need (less heating of the kettle itself)']]]);
EQ('gp2-2','A series circuit','A 12 V battery is connected to a 4.0 Ω resistor and a 2.0 Ω resistor in series.',[
 ['n','What is the total resistance?',6,0.01,'Ω',1,'In series, add: 4.0 + 2.0 = 6.0 Ω.'],
 ['n','Calculate the current.',2,0.01,'A',2,'I = V ÷ R = 12 ÷ 6.0 = 2.0 A.'],
 ['n','Calculate the potential difference across the 4.0 Ω resistor.',8,0.01,'V',2,'V = IR = 2.0 × 4.0 = 8.0 V.'],
 ['n','Calculate the power transferred in the 2.0 Ω resistor.',8,0.01,'W',2,'P = I²R = 2.0² × 2.0 = 8.0 W.']]);
EQ('gp2-3','Density and gases','A metal block has a mass of 540 g and a volume of 200 cm³.',[
 ['n','Calculate its density in g/cm³.',2.7,0.01,'g/cm³',2,'ρ = m ÷ V = 540 ÷ 200 = 2.7 g/cm³.'],
 ['n','Give the density in kg/m³.',2700,0.01,'kg/m³',1,'1 g/cm³ = 1000 kg/m³, so 2.7 g/cm³ = 2700 kg/m³.'],
 ['s','A sealed container of gas is heated. Explain, in terms of particles, why the pressure rises.',3,['The particles gain kinetic energy and move faster','They hit the walls more often','They hit the walls harder (bigger force per collision), so more force per unit area']]]);
EQ('gp2-4','Iodine-131','Iodine-131 has a half-life of 8 days. A sample has an activity of 1600 Bq.',[
 ['n','Calculate the activity after 24 days.',200,0.01,'Bq',2,'24 days = 3 half-lives. 1600 → 800 → 400 → 200 Bq.'],
 ['c','Iodine-131 decays by beta-minus emission. What happens to its atomic (proton) number?',['It increases by 1','It decreases by 1','It decreases by 2','It stays the same'],1,'A neutron becomes a proton (and an electron is emitted), so Z goes up by 1.'],
 ['s','A factory uses a beta source to monitor paper thickness. Explain why beta is used rather than alpha or gamma.',3,['Alpha would be absorbed completely by the paper','Gamma would pass straight through almost unaffected','Beta is partly absorbed, so the count rate changes measurably with thickness']]]);
EQ('gp3-1','Braking','A 1500 kg car travelling at 20 m/s brakes to a stop with a constant braking force of 6000 N.',[
 ['n','Calculate the deceleration.',4,0.01,'m/s²',2,'a = F ÷ m = 6000 ÷ 1500 = 4.0 m/s².'],
 ['n','Calculate the braking distance.',50,0.01,'m',3,'v² = u² + 2as → 0 = 20² − 2 × 4.0 × s → s = 400 ÷ 8 = 50 m.'],
 ['n','Calculate the car\'s momentum before braking.',30000,0.01,'kg m/s',2,'p = mv = 1500 × 20 = 30 000 kg m/s.'],
 ['s','Explain why the stopping distance is greater on a wet road.',2,['There is less friction (grip) between the tyres and the road','So the braking force is smaller and the braking distance is longer (thinking distance is unchanged)']]]);
EQ('gp3-2','Waves','A water wave has a frequency of 2.0 Hz and a wavelength of 0.75 m.',[
 ['n','Calculate the wave speed.',1.5,0.01,'m/s',2,'v = fλ = 2.0 × 0.75 = 1.5 m/s.'],
 ['n','Calculate the period of the wave.',0.5,0.01,'s',1,'T = 1 ÷ f = 1 ÷ 2.0 = 0.50 s.'],
 ['c','Which electromagnetic wave has the highest frequency?',['Gamma rays','Radio waves','Visible light','Microwaves'],1,'Gamma rays are at the high-frequency, short-wavelength end of the spectrum.'],
 ['s','Give one use and one hazard of ultraviolet radiation.',2,['Use: e.g. fluorescent lamps, sterilising water, security marking, sun tanning','Hazard: e.g. skin cancer, sunburn, premature skin ageing, eye damage']]]);
EQ('gp3-3','Motors and transformers','A wire 0.20 m long carries a current of 3.0 A at right angles to a magnetic field of flux density 0.50 T.',[
 ['n','Calculate the force on the wire.',0.3,0.01,'N',2,'F = BIL = 0.50 × 3.0 × 0.20 = 0.30 N.'],
 ['n','A transformer has 200 turns on the primary and 1000 on the secondary. The primary voltage is 230 V. Calculate the secondary voltage.',1150,0.01,'V',2,'Vs ÷ Vp = Ns ÷ Np → Vs = 230 × 1000 ÷ 200 = 1150 V.'],
 ['s','Explain why step-up transformers are used in the National Grid.',3,['They increase the voltage, which lowers the current for the same power','A lower current means less heating of the cables (P = I²R)','So less energy is wasted and the grid is more efficient']]]);
EQ('gp3-4','Stars and the universe','Our Sun is a main sequence star.',[
 ['c','What will the Sun become when it leaves the main sequence?',['A red giant','A supernova','A black hole','A neutron star'],1,'Stars about the Sun\'s mass swell into red giants, then become white dwarfs.'],
 ['c','What provides the centripetal force that keeps a satellite in orbit?',['Gravity','Air resistance','The satellite\'s engines','Magnetism'],1,'Gravity pulls the satellite towards the planet\'s centre, curving its path into an orbit.'],
 ['s','Explain how red-shift is evidence for the Big Bang.',3,['Light from distant galaxies is shifted towards the red end (longer wavelength)','So galaxies are moving away from us','More distant galaxies have bigger red-shift, so they move faster: the universe is expanding from a single starting point']]]);
EQ('gp4-1','Specific heat capacity practical','A 1.0 kg aluminium block is heated by a 50 W heater for 300 s. Its temperature rises from 20 °C to 36 °C.',[
 ['n','Calculate the energy supplied by the heater.',15000,0.01,'J',1,'E = Pt = 50 × 300 = 15 000 J.'],
 ['n','Calculate the specific heat capacity of aluminium from these results.',937.5,0.01,'J/kg °C',2,'c = E ÷ (mΔθ) = 15 000 ÷ (1.0 × 16) = 937.5 J/kg °C.'],
 ['s','The accepted value is 900 J/kg °C. Explain why the experimental value is higher, and how to improve the experiment.',2,['Some energy is lost to the surroundings, so not all the measured energy heats the block','Insulate the block (and use oil in the thermometer hole for good contact)']]]);
EQ('gp4-2','A climber','A 60 kg climber climbs 25 m up a rock face in 50 s. g = 9.8 N/kg.',[
 ['n','Calculate the gravitational potential energy gained.',14700,0.01,'J',2,'Eₚ = mgh = 60 × 9.8 × 25 = 14 700 J.'],
 ['n','Calculate the useful power output of the climber.',294,0.01,'W',2,'P = E ÷ t = 14 700 ÷ 50 = 294 W.'],
 ['n','Her body is 25% efficient. How much energy does she use from her food?',58800,0.01,'J',2,'Input = useful output ÷ efficiency = 14 700 ÷ 0.25 = 58 800 J.']]);
EQ('gp4-3','Six-mark: resistance of a wire','You are asked to investigate how the resistance of a wire depends on its length.',[
 ['n','At one length the pd is 3.0 V and the current is 0.60 A. Calculate the resistance.',5,0.01,'Ω',1,'R = V ÷ I = 3.0 ÷ 0.60 = 5.0 Ω.'],
 ['s','Describe a method for the investigation. [6 marks]',6,['Put the wire in a circuit with an ammeter in series and a voltmeter in parallel across the wire','Use a crocodile clip and a metre ruler to set different lengths','Measure the current and the pd at each length','Calculate R = V ÷ I for each length','Keep the current low / switch off between readings so the wire doesn\'t heat up','Repeat and take means, then plot resistance against length']]]);
EQ('gp4-4','An electric car','An electric car\'s battery stores 2.16 × 10⁸ J. On average the motor uses 15 kW.',[
 ['n','How long, in seconds, can the motor run on a full battery?',14400,0.01,'s',2,'t = E ÷ P = 2.16 × 10⁸ ÷ 15 000 = 14 400 s.'],
 ['n','Give this time in hours.',4,0.01,'hours',1,'14 400 ÷ 3600 = 4.0 hours.'],
 ['n','At an average speed of 20 m/s, how far can the car go, in km?',288,0.01,'km',2,'Distance = 20 × 14 400 = 288 000 m = 288 km.']]);
EQ('gp5-1','The power station','A reactor makes 3000 MW of heat. The power station is 35% efficient.',[
 ['n','Calculate the electrical power output.',1050,0.01,'MW',2,'0.35 × 3000 = 1050 MW.'],
 ['n','How much power is wasted as heat?',1950,0.01,'MW',1,'3000 − 1050 = 1950 MW.'],
 ['n','The waste heat warms sea water by 10 °C (c = 4200 J/kg °C). Calculate the mass of sea water needed each second. Give your answer to 2 significant figures.',46000,0.02,'kg/s',3,'Mass per second = P ÷ (cΔθ) = 1.95 × 10⁹ ÷ (4200 × 10) ≈ 46 000 kg/s.'],
 ['s','Explain why the reactor must still be cooled after it has been shut down.',2,['Fission products keep decaying and releasing heat (decay heat)','Without cooling the fuel would overheat and could be damaged']]]);
EQ('gp5-2','A falling ball','A 0.20 kg ball is dropped from a height of 5.0 m. g = 9.8 N/kg. Ignore air resistance.',[
 ['n','Calculate the gravitational potential energy lost by the time it reaches the ground.',9.8,0.01,'J',2,'Eₚ = mgh = 0.20 × 9.8 × 5.0 = 9.8 J.'],
 ['n','Calculate its speed just before it hits the ground. Give your answer to 2 significant figures.',9.9,0.02,'m/s',3,'All Eₚ becomes Eₖ: ½ × 0.20 × v² = 9.8 → v² = 98 → v ≈ 9.9 m/s.'],
 ['n','Calculate its momentum just before it hits the ground.',1.98,0.02,'kg m/s',2,'p = mv = 0.20 × 9.9 ≈ 2.0 kg m/s.']]);
EQ('gp5-3','A velocity–time graph','A car accelerates uniformly from rest to 12 m/s in 4.0 s, then travels at 12 m/s for 6.0 s.',[
 ['n','Calculate the acceleration.',3,0.01,'m/s²',1,'Gradient = 12 ÷ 4.0 = 3.0 m/s².'],
 ['n','Calculate the total distance travelled.',96,0.01,'m',3,'Area under the graph = triangle + rectangle = ½ × 4 × 12 + 12 × 6 = 24 + 72 = 96 m.'],
 ['s','How would you find the acceleration at one instant on a curved velocity–time graph?',2,['Draw a tangent to the curve at that time','Calculate the gradient of the tangent']]]);
EQ('gp5-4','Full-marks technique','A filament lamp is connected to a variable power supply.',[
 ['c','What does the command word "calculate" mean?',['Work out a value, showing your working','Give a reason for something','Say what happens, without reasons','Draw a graph'],1,'Calculate = use numbers to work out an answer, showing the steps.'],
 ['n','A 2.5 kW heater runs for 3.0 hours. How much energy does it transfer, in kWh?',7.5,0.01,'kWh',1,'E = P × t = 2.5 kW × 3.0 h = 7.5 kWh.'],
 ['s','Explain why the current through a filament lamp is not directly proportional to the potential difference.',3,['As the current increases the filament gets hotter','The ions vibrate more, so electrons collide more often and the resistance increases','So the current rises less than in proportion: the I–V graph curves']]]);
