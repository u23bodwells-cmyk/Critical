/* ---------- unit test question pools (12 per unit; each test draws 10 of these + 5 from the unit's lessons and follow-ups) ---------- */
TT('maths',[
x('m1',N(`Convert 0.0072 Δk/k to pcm.`,720,0.01,'pcm',`0.0072 × 100,000 = 720 pcm.`)),
x('m1',Q(`Which of these is 2.5 MW?`,['2.5 × 10<sup>6</sup> W','2.5 × 10<sup>3</sup> W','2.5 × 10<sup>9</sup> W','2.5 × 10<sup>−6</sup> W'],0,`Mega = 10<sup>6</sup>.`)),
x('m2',N(`The period is 80 s. Starting at 1%, what's the power after 160 s?`,7.39,0.02,'%',`t/τ = 2, so P = 1 × e<sup>2</sup> = 7.39%.`)),
x('m2',N(`The doubling time is 35 s. What's the period?`,50.5,0.02,'s',`τ = doubling time ÷ 0.693 = 35 ÷ 0.693 = 50.5 s.`)),
x('m3',N(`How long does power take to rise from 10<sup>−5</sup>% to 10<sup>−1</sup>% on a 100 s period?`,921,0.02,'s',`t = 100 × ln(10<sup>4</sup>) = 100 × 9.21 = 921 s.`)),
x('m3',N(`What is log<sub>10</sub>(10<sup>−4</sup> × 10<sup>9</sup>)?`,5,0.001,'',`10<sup>−4</sup> × 10<sup>9</sup> = 10<sup>5</sup>, so the log is 5.`)),
x('m4',N(`Power is 40% on a steady 200 s period. How fast is it rising, in % per second?`,0.2,0.01,'% per second',`dP/dt = P/τ = 40/200 = 0.2% per second.`)),
x('m4',Q(`dT/dt = −2 °C per minute means…`,['temperature is falling by 2 °C every minute','temperature is rising by 2 °C every minute','temperature is steady at −2 °C','it takes 2 minutes to fall 1 °C'],0,`A negative rate means falling.`)),
x('m5',N(`N = 200 and dN/dt = −0.5N. After one Euler step of 0.2 s, what is N?`,180,0.01,'',`Rate = −100 per second. New N = 200 + (−100 × 0.2) = 180.`)),
x('m6',N(`You record 10,000 counts. What's the relative spread, in %?`,1,0.01,'%',`√10,000 = 100, and 100 ÷ 10,000 = 1%.`)),
x('m3',Q(`Power is rising at 0.5 DPM. How long from 10<sup>−6</sup>% to 10<sup>−3</sup>%?`,['6 minutes','3 minutes','1.5 minutes','30 minutes'],0,`3 decades ÷ 0.5 decades per minute = 6 minutes.`)),
x('m2',N(`Power doubles every 20 s. By what factor has it grown after 2 minutes?`,64,0.01,'times',`120 s is 6 doublings: 2<sup>6</sup> = 64.`))]);

TT('energy',[
x('e1',N(`A reactor makes 3400 MWth for 24 hours. How much energy is that, in TJ?`,293.8,0.01,'TJ',`3.4 × 10<sup>9</sup> W × 86,400 s = 2.94 × 10<sup>14</sup> J = 294 TJ.`)),
x('e1',N(`A plant makes 1650 MWe at 36% efficiency. What's its thermal power?`,4583,0.01,'MWth',`1650 ÷ 0.36 = 4583 MWth.`)),
x('e1',N(`A 3000 MWth plant is 33% efficient. How much heat is rejected, in MW?`,2010,0.01,'MW',`67% of 3000 = 2010 MW.`)),
x('e2',N(`A neutron hits helium-4 (A = 4) head-on. What fraction of its energy does it keep?`,0.36,0.01,'',`(3/5)<sup>2</sup> = 0.36.`)),
x('e2',Q(`After many collisions in water, a neutron's energy is about…`,['0.025 eV (thermal)','2 MeV','200 MeV','exactly 0'],0,`It ends up in thermal balance with the water: about 0.025 eV at room temperature.`)),
x('e3',N(`A reaction loses 0.186 u of mass. How much energy is released, in MeV?`,173.3,0.01,'MeV',`0.186 × 931.5 = 173 MeV.`)),
x('e3',N(`What's the energy equivalent of 1 kg of mass? Give the number in front of × 10<sup>16</sup> J.`,9,0.01,'× 10¹⁶ J',`1 × (3 × 10<sup>8</sup>)<sup>2</sup> = 9 × 10<sup>16</sup> J.`)),
x('e3',N(`A 3000 MWth core: how many fissions happen per second (3.2 × 10<sup>−11</sup> J each)? Give the number in front of × 10<sup>19</sup>.`,9.375,0.02,'× 10¹⁹ per second',`3 × 10<sup>9</sup> ÷ 3.2 × 10<sup>−11</sup> = 9.4 × 10<sup>19</sup> fissions per second.`)),
x('e3',Q(`Burning carbon releases about 4 eV per atom; fission releases about 200 MeV. The ratio is about…`,['50 million','50,000','50','5 billion'],0,`200 × 10<sup>6</sup> ÷ 4 = 5 × 10<sup>7</sup>.`)),
x('e2',Q(`Why is graphite a slower moderator than water?`,['Carbon nuclei are 12 times heavier than neutrons, so each collision takes less energy','Graphite absorbs neutrons','Graphite is hotter','Water is denser'],0,`Energy transfer is biggest when the masses match, as with hydrogen.`)),
x('e2',N(`What's the momentum of a 2 kg object moving at 3 m/s?`,6,0.01,'kg m/s',`p = mv = 2 × 3 = 6 kg m/s.`)),
x('e1',Q(`1 MWh is equal to…`,['3600 MJ','1 MJ','60 MJ','3.6 MJ'],0,`1 MW for 3600 s = 3600 MJ.`))]);

TT('nuclear',[
x('a1',N(`How many neutrons are in Pu-239 (Z = 94)?`,145,0.001,'',`239 − 94 = 145.`)),
x('a3',Q(`Pu-239 (Z = 94) alpha decays. What does it become?`,['U-235 (Z = 92)','Np-239 (Z = 93)','Am-239 (Z = 95)','U-239 (Z = 92)'],0,`A − 4 = 235 and Z − 2 = 92: uranium-235.`)),
x('a3',Q(`U-239 (Z = 92) beta-minus decays. What does it become?`,['Np-239 (Z = 93)','Pa-239 (Z = 91)','U-238 (Z = 92)','Pu-240 (Z = 94)'],0,`Z + 1 = 93 (neptunium). Np-239 then decays to Pu-239.`)),
x('a4',N(`Iodine-131 has a half-life of 8 days. What fraction is left after 40 days?`,0.03125,0.02,'',`40 ÷ 8 = 5 half-lives: (½)<sup>5</sup> = 1/32 = 0.031.`)),
x('a4',N(`A sample's activity is 1200 Bq. What is it after 3 half-lives?`,150,0.01,'Bq',`1200 → 600 → 300 → 150 Bq.`)),
x('a4',N(`An isotope has λ = 0.0231 per day. What's its half-life, in days?`,30,0.02,'days',`0.693 ÷ 0.0231 = 30 days.`)),
x('a2',N(`A nucleus with A = 140 has 8.5 MeV of binding energy per nucleon. What's its total binding energy?`,1190,0.01,'MeV',`140 × 8.5 = 1190 MeV.`)),
x('a6',N(`Σ = 0.2 per cm. What's the mean free path?`,5,0.01,'cm',`1 ÷ 0.2 = 5 cm.`)),
x('a6',N(`Σ = 0.46 per cm. How thick must a slab be to let only 1% through? (Σx = 4.6 for 1%.)`,10,0.01,'cm',`x = 4.6 ÷ 0.46 = 10 cm.`)),
x('a6',N(`φ = 5 × 10<sup>13</sup> n/cm²/s and Σ<sub>f</sub> = 0.08 per cm. What's the fission rate? Give the number in front of × 10<sup>12</sup>.`,4,0.01,'× 10¹² per cm³ per s',`5 × 10<sup>13</sup> × 0.08 = 4 × 10<sup>12</sup>.`)),
x('a5',Q(`What's the main reason a PWR slows neutrons down?`,['U-235\'s fission cross section is far bigger for thermal neutrons','Slow neutrons escape the core less','Fast neutrons damage the pumps','Thermal neutrons are delayed neutrons'],0,`About 585 barns thermal versus about 1 barn fast.`)),
x('a7',N(`U-235 + n → Sr-94 + Xe-140 + how many neutrons?`,2,0.001,'neutrons',`236 − (94 + 140) = 2.`))]);

TT('statics',[
x('r4',N(`k = 1.002. What's ρ in pcm?`,199.6,0.01,'pcm',`0.002 ÷ 1.002 = 0.001996 = 199.6 pcm.`)),
x('r4',N(`ρ = −1500 pcm. What is k? Give 4 decimal places.`,0.9852,0.0005,'',`ρ = (k − 1)/k rearranges to k = 1/(1 − ρ) = 1/1.015 = 0.9852.`)),
x('r5',N(`k = 0.96. What's the multiplication M?`,25,0.01,'',`1 ÷ 0.04 = 25.`)),
x('r5',Q(`1/M is 0.5 at 30% rod withdrawal and 0.25 at 40%. Where does a straight line predict criticality?`,['50%','45%','60%','40%'],0,`1/M falls 0.25 per 10%, so it reaches zero 10% later: 50%.`)),
x('r2',N(`ε = 1.03, L<sub>f</sub> = 0.97, p = 0.76, L<sub>t</sub> = 0.99, f = 0.72, η = 1.86. What is k?`,1.0067,0.003,'',`Multiplying all six gives k ≈ 1.007.`)),
x('r7',N(`Boron worth is −9 pcm/ppm. You dilute by 40 ppm. What's the reactivity change?`,360,0.01,'pcm',`−9 × (−40) = +360 pcm.`)),
x('r8',N(`The MTC is −28 pcm/°C and the coolant heats up by 5 °C. At the same time Doppler adds −120 pcm. What's the total reactivity change?`,-260,0.01,'pcm',`−28 × 5 = −140 pcm. −140 + (−120) = −260 pcm.`)),
x('r9',N(`Equilibrium xenon is worth −2800 pcm. After a trip it peaks at −6000 pcm. How much more negative reactivity is that than equilibrium?`,3200,0.01,'pcm',`6000 − 2800 = 3200 pcm extra that a restart has to overcome.`)),
x('r11',N(`Total rod worth is 7200 pcm, the most reactive rod is worth 1300 pcm, and there's 4400 pcm to overcome. What's the shutdown margin?`,1500,0.01,'pcm',`(7200 − 1300) − 4400 = 1500 pcm.`)),
x('r8',Q(`During a steam line break, the coolant cools quickly. With a negative MTC, reactivity…`,['rises','falls','doesn\'t change'],0,`Cooling plus a negative coefficient adds positive reactivity.`)),
x('r10',Q(`After a shutdown, samarium-149…`,['rises and stays high','peaks, then decays away','falls to zero','doesn\'t change'],0,`It's stable, so it accumulates from promethium decay and stays.`)),
x('r6',N(`Rods are withdrawn 8% where they're worth 7 pcm/%, while boron is increased by 5 ppm at −10 pcm/ppm. What's the net reactivity change?`,6,0.01,'pcm',`Rods: +56 pcm. Boron: −50 pcm. Net: +6 pcm.`))]);

TT('kinetics',[
x('k2',N(`The period is 30 s. What's the startup rate?`,0.869,0.02,'DPM',`26.06 ÷ 30 = 0.87 DPM.`)),
x('k2',N(`The startup rate is 0.8 DPM. How many minutes to go from 10<sup>−7</sup>% to 10<sup>−3</sup>%?`,5,0.01,'minutes',`4 decades ÷ 0.8 = 5 minutes.`)),
x('k3',N(`ρ = 150 pcm and β = 650 pcm. What's the prompt jump, P<sub>1</sub>/P<sub>0</sub>?`,1.3,0.01,'',`650 ÷ 500 = 1.3.`)),
x('k2',N(`ρ = 150 pcm, β = 650 pcm and λ<sub>eff</sub> = 0.08 s<sup>−1</sup>. Estimate the period.`,41.7,0.02,'s',`(650 − 150) ÷ (0.08 × 150) = 500 ÷ 12 = 41.7 s.`)),
x('k3',N(`β = 650 pcm. How many pcm is 0.4 $?`,260,0.01,'pcm',`0.4 × 650 = 260 pcm.`)),
x('k3',Q(`In a plutonium-fuelled core, β is about 210 pcm. Adding 200 pcm would be…`,['almost prompt critical (about 0.95 $)','very safe (about 0.3 $)','subcritical','well over prompt critical'],0,`200 ÷ 210 = 0.95 $. Far too close to prompt critical.`)),
x('k4',N(`A trip adds −5850 pcm, and β = 650 pcm. What percentage of power is left after the prompt drop?`,10,0.01,'%',`650 ÷ (650 + 5850) = 650 ÷ 6500 = 10%.`)),
x('k4',N(`After the prompt drop to 10%, power falls on a −80 s period. How long until it reaches 0.1%?`,368,0.02,'s',`t = 80 × ln(100) = 80 × 4.61 = 368 s.`)),
x('k5',N(`Decay heat is 1.2% of 4500 MWth. How many MW is that?`,54,0.01,'MW',`4500 × 0.012 = 54 MW.`)),
x('k5',N(`20 MW of decay heat is boiling water at 100 °C (latent heat 2.26 MJ/kg). How many tonnes boil away per hour?`,31.9,0.02,'tonnes per hour',`20 ÷ 2.26 = 8.85 kg/s. × 3600 = 31,900 kg = 31.9 tonnes per hour.`)),
x('k1',Q(`With prompt neutrons only (ℓ = 2 × 10<sup>−5</sup> s), a +100 pcm step would give a period of about…`,['0.02 s','60 s','80 s','1 hour'],0,`τ = ℓ ÷ (k − 1) = 2 × 10<sup>−5</sup> ÷ 0.001 = 0.02 s.`)),
x('k4',Q(`Why does power fall on about a −80 s period after a trip?`,['The longest-lived precursors (55 s half-life) set the pace','The rods move slowly','Xenon is building up','Decay heat'],0,`55 s ÷ 0.693 ≈ 80 s.`))]);

TT('thermo',[
x('t1',N(`What is 25 °C in kelvin?`,298.15,0.001,'K',`25 + 273.15 = 298.15 K.`)),
x('t1',N(`What is 15.5 MPa in bar?`,155,0.01,'bar',`15.5 × 10 = 155 bar.`)),
x('t1',N(`A gauge reads 69 bar(g). What's the absolute pressure?`,70,0.01,'bar(a)',`69 + 1 = 70 bar(a).`)),
x('t1',N(`How much energy heats 2000 kg of water by 15 °C (c = 4.18 kJ/kg/K)? Answer in MJ.`,125.4,0.01,'MJ',`2000 × 4.18 × 15 = 125,400 kJ = 125.4 MJ.`)),
x('t2',N(`Pressure is 150 bar (T<sub>sat</sub> 342 °C) and the hot leg is at 327 °C. What's the subcooling margin?`,15,0.01,'°C',`342 − 327 = 15 °C.`)),
x('t2',Q(`Pressure falls from 155 bar to 120 bar while the hot leg stays at 325 °C. T<sub>sat</sub> at 120 bar is about 325 °C. The subcooling margin is now…`,['about zero: the water is about to boil','larger than before','unchanged','negative pressure'],0,`T<sub>sat</sub> has fallen to the hot leg temperature, so there's no margin left.`)),
x('t3',N(`P = 3200 MW, ΔT = 32 °C and c = 5.5 kJ/kg/K. What flow is needed, in kg/s?`,18182,0.02,'kg/s',`3,200,000 ÷ (5.5 × 32) = 18,200 kg/s.`)),
x('t3',Q(`Coolant flow is lost, but power stays the same for a moment. ΔT across the core…`,['rises a lot','falls','doesn\'t change'],0,`P = ṁcΔT: less flow at the same power means a bigger ΔT.`)),
x('t4',N(`What's the Carnot limit for steam at 280 °C and a condenser at 20 °C, in %?`,47,0.02,'%',`1 − 293.15/553.15 = 0.470 = 47%.`)),
x('t4',N(`A reactor makes 4600 MWth and 1650 MWe. How much heat goes to the condenser, in MW (ignoring other losses)?`,2950,0.01,'MW',`4600 − 1650 = 2950 MW.`)),
x('t3',Q(`What does the calorimetric heat balance calibrate?`,['The power range nuclear instruments','The boron concentration','The pressuriser level','The rod positions'],0,`It gives true thermal power, and the nuclear instruments are adjusted to match.`)),
x('t1',N(`The primary circuit has a heat capacity of 1500 MJ/°C, and the heat-up limit is 55 °C per hour. What's the most net heat that can be added, in MW?`,22.9,0.02,'MW',`55 × 1500 = 82,500 MJ per hour ÷ 3600 = 22.9 MW.`))]);

TT('heat',[
x('h1',N(`q′ = 25,000 W/m and k = 3 W/m/K. What's the pellet centre − surface temperature difference?`,663,0.01,'°C',`25,000 ÷ (4π × 3) = 663 °C.`)),
x('h2',N(`The critical heat flux is 2.4 MW/m² and the actual heat flux is 1.5 MW/m². What's the DNBR?`,1.6,0.01,'',`2.4 ÷ 1.5 = 1.6.`)),
x('h2',Q(`Which combination increases the risk of DNB?`,['Lower pressure and lower flow','Higher flow','Lower power','Lower inlet temperature'],0,`Both reduce the critical heat flux.`)),
x('h3',N(`A pipe's area halves. By what factor does the water velocity change?`,2,0.01,'times',`Half the area means twice the velocity.`)),
x('h3',N(`ṁ = 4500 kg/s, ρ = 720 kg/m³ and v = 15 m/s. What's the pipe area, in m²?`,0.417,0.02,'m²',`A = ṁ ÷ (ρv) = 4500 ÷ (720 × 15) = 0.417 m².`)),
x('h3',Q(`Cavitation happens when the local pressure falls below…`,['the vapour pressure','atmospheric pressure','the pump\'s outlet pressure','zero'],0,`Below the vapour pressure the water boils, even if it's cool.`)),
x('h4',Q(`What drives natural circulation?`,['The density difference between hot and cold water, and the height between core and heat sink','The reactor coolant pumps','The pressuriser heaters','Boron'],0,`Buoyancy does the work, with no pumps.`)),
x('h1',N(`h = 35,000 W/m²/K and T<sub>surface</sub> − T<sub>water</sub> = 20 °C. What's the heat flux, in MW/m²?`,0.7,0.01,'MW/m²',`35,000 × 20 = 700,000 W/m² = 0.7 MW/m².`)),
x('h1',Q(`What's the limit on peak cladding temperature in an accident?`,['1204 °C','345 °C','2800 °C','100 °C'],0,`Above about 1200 °C, the zirconium–steam reaction speeds up.`)),
x('h4',N(`Decay heat is 30 MW, natural circulation flow is 300 kg/s and c = 5.5 kJ/kg/K. What's ΔT across the core?`,18.2,0.02,'°C',`30,000 ÷ (300 × 5.5) = 18.2 °C.`)),
x('h1',Q(`Which part of a fuel rod has the biggest temperature drop?`,['The fuel pellet','The thin film of water','The metal cladding tube','The helium gas gap'],0,`UO<sub>2</sub> conducts heat poorly.`)),
x('h3',Q(`At Three Mile Island, stopping the cavitating reactor coolant pumps left the core…`,['with too little cooling','overcooled','unaffected','prompt critical'],0,`With steam in the circuit, natural circulation couldn't do the job.`))]);

TT('radiation',[
x('p1',N(`An organ absorbs 0.05 mGy of alpha radiation (weighting factor 20). What's the equivalent dose?`,1,0.01,'mSv',`0.05 × 20 = 1 mSv.`)),
x('p2',N(`The dose rate is 50 µSv/h and you work for 3 hours. What dose do you get?`,150,0.01,'µSv',`50 × 3 = 150 µSv.`)),
x('p2',N(`The dose rate is 200 µSv/h at 1 m from a small source. What is it at 5 m?`,8,0.01,'µSv/h',`200 ÷ 5<sup>2</sup> = 200 ÷ 25 = 8 µSv/h.`)),
x('p2',N(`The HVL of lead is 12 mm. What fraction of the dose rate gets through 60 mm?`,0.03125,0.02,'',`60 ÷ 12 = 5 HVLs: (½)<sup>5</sup> = 1/32 = 0.031.`)),
x('p2',N(`A job's dose must stay below 0.1 mSv, and the dose rate is 0.4 mSv/h. What's the longest you can work, in minutes?`,15,0.01,'minutes',`0.1 ÷ 0.4 = 0.25 h = 15 minutes.`)),
x('p1',Q(`What's the legal annual dose limit for classified radiation workers in the UK (IRR17)?`,['20 mSv','1 mSv','2.7 mSv','100 mSv'],0,`20 mSv per year.`)),
x('p1',Q(`What's the annual dose limit for members of the public from work activities?`,['1 mSv','20 mSv','0 mSv','2.7 mSv'],0,`1 mSv per year.`)),
x('p1',Q(`What's the biggest single source of natural radiation dose in the UK?`,['Radon gas','Nuclear power stations','Food','Cosmic rays'],0,`Radon gives about half the average dose.`)),
x('p3',Q(`Your electronic dosimeter alarms on high dose rate. What do you do first?`,['Stop, leave the area the way you came, and report','Carry on and finish quickly','Turn it off','Go and look for the source'],0,`Treat alarms as real until proven otherwise.`)),
x('p2',N(`A source gives 2 mSv/h at 1 m. You work at 3 m, behind 24 mm of lead (HVL 12 mm), for 30 minutes. What dose do you get?`,0.0278,0.02,'mSv',`At 3 m: 2 ÷ 9 = 0.222 mSv/h. Behind 2 HVLs: ÷ 4 = 0.0556 mSv/h. × 0.5 h = 0.028 mSv.`)),
x('p3',Q(`Which of these is irradiation rather than contamination?`,['Standing near a sealed source','Radioactive dust on your glove','Swallowing radioactive material','Radioactive water on the floor'],0,`A sealed source exposes you, but nothing radioactive gets on or in you.`)),
x('p3',Q(`Under ALARP, doses must be…`,['as low as reasonably practicable, even when already below the limits','just below the legal limit','exactly zero','recorded, but not reduced'],0,`Limits are a ceiling, not a target.`))]);

TT('plant',[
x('s1',Q(`What keeps primary and secondary water apart?`,['The steam generator tubes','The pressuriser','The condenser','The turbine'],0,`Primary water flows inside the tubes, secondary water boils outside them.`)),
x('s2',Q(`Pressuriser pressure is high. What's the automatic response?`,['Spray comes on','Heaters turn on','Rods are withdrawn','Boron is diluted'],0,`Spray condenses steam and lowers the pressure.`)),
x('s2',Q(`The primary coolant cools and contracts. In the pressuriser…`,['there\'s an outsurge: level and pressure fall','there\'s an insurge: level and pressure rise','nothing changes'],0,`Water leaves the pressuriser, and the steam space expands.`)),
x('s3',N(`A 6-pole generator runs on the 50 Hz grid. What speed does it turn at?`,1000,0.001,'rpm',`120 × 50 ÷ 6 = 1000 rpm.`)),
x('s3',Q(`Steam demand rises sharply. Steam generator level…`,['swells up at first, then falls','falls immediately','doesn\'t change'],0,`That's swell: falling steam pressure makes bubbles expand.`)),
x('s4',Q(`What detector is used in the intermediate range?`,['Compensated ion chamber','BF<sub>3</sub> proportional counter','Uncompensated ion chamber','Thermocouple'],0,`Compensation cancels the gamma current.`)),
x('s4',N(`A power range detector gives 200 µA at 100%. It reads 150 µA. What's the power?`,75,0.01,'%',`150 ÷ 200 = 75%.`)),
x('s5',Q(`With 2-out-of-4 logic, one channel has failed and can't trip. Can the reactor still trip automatically?`,['Yes: two of the other three can still trip it','No','Only by hand'],0,`That's why 2-out-of-4 is used: one failure doesn't stop a trip.`)),
x('s5',Q(`How many independent safety trains does each Hinkley Point C reactor have?`,['4','2','1','3'],0,`Four, each able to cool the core on its own.`)),
x('s6',N(`You cool down from 290 °C to 90 °C at 50 °C per hour. How many hours does that take?`,4,0.01,'hours',`200 ÷ 50 = 4 hours.`)),
x('s6',Q(`Why is dissolved hydrogen added to the primary coolant?`,['To remove oxygen made when radiation splits water','To absorb neutrons','To raise the pH','To moderate neutrons'],0,`It keeps oxygen very low, reducing corrosion.`)),
x('s3',Q(`What happens if the turbine trips at full power?`,['Steam dumps open, and the reactor is tripped or quickly reduced in power','Nothing','Reactor power rises','Boron is diluted'],0,`The steam dumps keep a heat sink while reactor power comes down.`))]);

TT('operator',[
x('o1',O(`Put STAR in order.`,['Stop','Think','Act','Review'],`Stop, Think, Act, Review.`)),
x('o1',Q(`In three-way communication, what happens just before the receiver acts?`,['The sender confirms the repeat-back is correct','The receiver acts straight after hearing it','The supervisor writes it down'],0,`Send, repeat back, confirm, then act.`)),
x('o1',Q(`While raising power, you see an indication you can't explain. What do you do?`,['Stop, stabilise the plant and investigate','Carry on','Ignore it if the other indications look normal, and note it in the log'],0,`Conservative decision-making: never continue into the unknown.`)),
x('o2',Q(`At Three Mile Island, which misleading indication led operators to reduce emergency cooling?`,['Pressuriser level','Neutron power','Turbine speed','Boron concentration'],0,`High pressuriser level made them think the system was too full.`)),
x('o2',Q(`Chernobyl's RBMK reactor had…`,['a positive void coefficient','a negative void coefficient','no control rods','light water as its moderator'],0,`More steam meant more reactivity: positive feedback.`)),
x('o2',Q(`The Fukushima accident was mainly…`,['a station blackout after a tsunami, so decay heat couldn\'t be removed','a prompt critical accident','a turbine failure','a steam generator tube rupture'],0,`The reactors shut down, but cooling was lost.`)),
x('o3',N(`Last time the reactor went critical at 65%. Today xenon adds −100 pcm, but boron has been diluted, adding +200 pcm. Rods are worth 10 pcm/%. What's the ECP?`,55,0.01,'% withdrawn',`Net change: −100 + 200 = +100 pcm more than last time. The rods need to supply 100 pcm less: 10% less, so 55%.`)),
x('o3',N(`1/M is 0.4 at 50% rod withdrawal and 0.2 at 60%. Where does a straight line predict criticality?`,70,0.01,'% withdrawn',`1/M falls 0.2 per 10%, so it reaches zero at 70%.`)),
x('o3',Q(`During the approach to criticality, the startup rate should stay below about…`,['1 DPM','10 DPM','100 DPM','0.001 DPM'],0,`Low rates give time to think and act.`)),
x('o3',Q(`Before switching off the source range during a startup, operators confirm…`,['overlap with the intermediate range','that the turbine is on line','that boron is zero','100% power'],0,`There must never be a gap in neutron indication.`)),
x('o3',Q(`Above the point of adding heat, with rods stopped, what happens to the startup rate?`,['It falls as negative feedback acts','It rises','It stays the same'],0,`Rising temperatures take reactivity away.`)),
x('o1',Q(`Which human performance tool is a colleague confirming the right component before you act?`,['Peer check','STAR','Procedure adherence','Three-way communication'],0,`A peer check catches wrong-component slips.`))]);

/* ----- Theory track: follow-up practice ----- */
F('tb1',[
T(`<h3>Quick recap</h3><ul><li>A generator makes electricity when a magnet spins inside coils of wire.</li><li>Thermal stations: heat → steam → turbine → generator.</li><li>In a nuclear station only the <b>reactor</b> is nuclear: it's the heat source.</li><li>1 GW = 1,000 MW = 1,000,000 kW.</li></ul>`),
Q(`What spins the generator in a nuclear power station?`,[`A steam turbine`,`The reactor directly`,`The wind`,`An electric motor`],0,`The reactor boils water (via the steam generators) and the steam spins the turbine.`),
Q(`Which of these is NOT a thermal power station?`,[`A wind farm`,`A coal station`,`A nuclear station`,`A biomass station`],0,`Wind turns the generator directly. No heat, no steam.`),
Q(`Power is…`,[`how fast energy is made or used`,`the total energy stored`,`the voltage of the grid`,`the weight of the fuel`],0,`Power is a rate, measured in watts.`),
Q(`Which is biggest?`,[`1 GW`,`1 MW`,`1 kW`,`1 W`],0,`Giga (thousand million) > mega (million) > kilo (thousand).`),
Q(`Why must an operator understand both nuclear physics and steam engineering?`,[`The reactor makes the heat, and the steam plant turns it into electricity`,`Because the turbine is nuclear too`,`They don't need to`,`Because steam makes neutrons`],0,`The two halves of the plant affect each other all the time.`)]);
F('tb2',[
T(`<h3>Quick recap</h3><p><b>Fission → hot water → steam generator → steam → turbine → generator → grid.</b></p><p>Three water circuits that never mix: <b>primary</b> (through the core, slightly radioactive), <b>secondary</b> (steam and turbine, clean), <b>cooling</b> (the sea).</p>`),
Q(`Where is steam made in a PWR?`,[`In the steam generators`,`In the reactor core`,`In the condenser`,`In the turbine`],0,`The primary water stays liquid; the secondary water boils in the steam generators.`),
Q(`Which circuit goes through the reactor core?`,[`Primary`,`Secondary`,`Cooling water`,`All of them`],0,`Only the primary water passes through the core.`),
Q(`What does the condenser do?`,[`Turns used steam back into water using sea water`,`Makes steam for the turbine`,`Raises the voltage`,`Cools the reactor core directly`],0,`Cold sea water in its tubes condenses the steam so it can be pumped back.`),
Q(`What raises the voltage before electricity goes into the grid?`,[`Transformers`,`The turbine`,`The condenser`,`The pressuriser`],0,`Transformers step it up to 400,000 volts.`),
O(`Order these parts from where the heat is made to where the electricity leaves.`,[`Reactor core`,`Steam generator`,`Turbine`,`Generator`,`Grid`],`Heat in at one end, electricity out the other.`)]);
F('tb3',[
T(`<h3>Quick recap</h3><ul><li>Hinkley Point C: two <b>EPR</b> reactors in Somerset, about <b>3.2 GW</b>, around 7% of UK electricity, designed for 60 years.</li><li>EPR = a large <b>pressurised water reactor</b>: four loops, four safety systems, double containment, core catcher.</li></ul>`),
Q(`How many reactors does Hinkley Point C have?`,[`Two`,`One`,`Four`,`Six`],0,`Two EPR units side by side.`),
Q(`Which other UK station has a PWR like Hinkley Point C's?`,[`Sizewell B`,`Every UK station`,`None`,`Only stations in Scotland`],0,`Sizewell B in Suffolk is the UK's only PWR running today. Most older UK stations are gas-cooled.`),
Q(`About what share of the UK's electricity will Hinkley Point C supply?`,[`About 7%`,`About 70%`,`About 1%`,`About 50%`],0,`Around 7%, enough for about 6 million homes.`),
Q(`What is the core catcher for?`,[`To hold and cool a molten core in the most extreme accident`,`To catch dropped fuel assemblies`,`To collect steam`,`To store control rods`],0,`It's a last line of defence, for an accident where the core has melted.`),
Q(`How many independent safety systems does each EPR have?`,[`Four`,`One`,`Two`,`Ten`],0,`Four, in four separate buildings.`)]);
F('ta1',[
T(`<h3>Quick recap</h3><table><tr><th>Particle</th><th>Where</th><th>Charge</th></tr><tr><td>Proton</td><td>Nucleus</td><td>+</td></tr><tr><td>Neutron</td><td>Nucleus</td><td>none</td></tr><tr><td>Electron</td><td>Around the nucleus</td><td>−</td></tr></table><p>Number of protons = which element. The <b>strong nuclear force</b> holds the nucleus together.</p>`),
Q(`Where is almost all of an atom's mass?`,[`In the nucleus`,`In the electrons`,`Spread evenly`,`In the empty space`],0,`The nucleus is tiny but holds nearly all the mass.`),
Q(`What decides which element an atom is?`,[`The number of protons`,`The number of neutrons`,`The number of electrons it shares`,`Its temperature`],0,`Protons = atomic number = element.`),
Q(`Why can a neutron get right up to a nucleus easily?`,[`It has no charge, so it isn't pushed away`,`It's very heavy`,`It's attracted by electrons`,`It moves at the speed of light`],0,`Protons are repelled by the positive nucleus; neutrons aren't.`),
Q(`Which particle is about 1,840 times lighter than a proton?`,[`Electron`,`Neutron`,`Nucleus`,`Uranium atom`],0,`Electrons are tiny compared with protons and neutrons.`),
Q(`Why is a uranium nucleus able to split?`,[`The pull holding it together only just beats the push between its protons`,`It has no neutrons`,`It's very small`,`It has no protons`],0,`In big nuclei the balance is fragile, so a small nudge can split it.`)]);
F('ta2',[
T(`<h3>Quick recap</h3><ul><li><b>Isotopes</b>: same protons, different neutrons. Named by mass number (protons + neutrons).</li><li>Natural uranium: 99.3% U-238, 0.7% <b>U-235</b> (the one that splits).</li><li>PWR fuel is enriched to about 3–5% U-235.</li><li>U-238 can turn into <b>plutonium-239</b> in the reactor.</li></ul>`),
Q(`Carbon-12 and carbon-14 are…`,[`isotopes of carbon`,`different elements`,`the same atom`,`both radioactive`],0,`Same number of protons (6), different numbers of neutrons.`),
Q(`Which uranium isotope is fissile (splits easily with slow neutrons)?`,[`Uranium-235`,`Uranium-238`,`Both equally`,`Neither`],0,`U-235. U-238 mostly absorbs neutrons without splitting.`),
Q(`About how enriched is PWR fuel?`,[`3–5% U-235`,`0.7% U-235`,`50% U-235`,`90% U-235`],0,`Enough to run the reactor, nowhere near weapons grade.`),
Q(`Why can't PWR fuel explode like a nuclear bomb?`,[`Its U-235 content is far too low`,`It's kept wet`,`It's made of ceramic`,`The control rods stop it`],0,`Weapons need around 90% U-235 in a special arrangement. 3–5% physically can't do it.`),
Q(`What does U-238 turn into after absorbing a neutron and two decays?`,[`Plutonium-239`,`Uranium-235`,`Lead`,`Xenon-135`],0,`Plutonium-239 is fissile, so it adds to the reactor's energy.`)]);
F('ta3',[
T(`<h3>Quick recap</h3><ul><li>Unstable nuclei <b>decay randomly</b>. Half-life = time for half of them to decay.</li><li><b>Alpha</b>: stopped by paper. <b>Beta</b>: by aluminium. <b>Gamma</b>: reduced by thick lead or concrete. <b>Neutrons</b>: stopped by water or concrete.</li></ul>`),
Q(`What is a half-life?`,[`The time for half the unstable atoms to decay`,`Half the time a reactor runs`,`The time for all atoms to decay`,`Half the mass of an atom`],0,`After each half-life, half of what's left decays.`),
Q(`Which radiation is a fast electron?`,[`Beta`,`Alpha`,`Gamma`,`Neutron`],0,`Beta particles are electrons thrown out of the nucleus.`),
Q(`Which material is best for stopping neutrons?`,[`Water or concrete`,`Paper`,`Thin aluminium`,`Lead`],0,`Hydrogen-rich materials slow neutrons so they can be absorbed. Lead is poor at it.`),
Q(`Nitrogen-16 has a half-life of 7 seconds. After about a minute, how much is left?`,[`Almost none`,`Half`,`A quarter`,`All of it`],0,`A minute is more than 8 half-lives, so less than 1/256 is left.`),
Q(`Which is the most penetrating kind of radiation from a source outside the body?`,[`Gamma`,`Alpha`,`Beta`,`They're all the same`],0,`Gamma rays (and neutrons) get through a lot of material; alpha can't even get through skin.`)]);
F('tf1',[
T(`<h3>Quick recap</h3><p>Slow neutron + U-235 → wobbly U-236 → <b>two fission fragments + 2–3 neutrons + energy</b>. The fragments fly apart and <b>heat</b> the fuel. They're radioactive, so they keep making <b>decay heat</b>.</p>`),
Q(`What does a uranium nucleus split into?`,[`Two smaller nuclei plus a few neutrons`,`Hundreds of protons`,`Electrons and light`,`Two uranium nuclei`],0,`Two fission fragments and 2–3 neutrons.`),
Q(`Why is it useful that fission releases new neutrons?`,[`They can cause more fissions: a chain reaction`,`They cool the fuel`,`They make electricity`,`They aren't useful`],0,`Without new neutrons, there'd be no chain reaction.`),
Q(`How does fission energy become heat?`,[`The fast-moving fragments collide with atoms in the fuel and slow down`,`It's turned into light first`,`The neutrons boil the water directly`,`The control rods convert it`],0,`Movement energy becomes heat within the pellet.`),
Q(`What is decay heat?`,[`Heat from fission products decaying, even after shutdown`,`Heat from the pumps`,`Heat lost to the sea`,`Heat from the control rods`],0,`It's why reactors need cooling after they stop.`),
Q(`Do the pieces of a fission always come out the same?`,[`No, many different pairs are possible`,`Yes, always barium and krypton`,`Yes, always two uranium atoms`,`There are no pieces`],0,`Uranium can split dozens of different ways.`)]);
F('tf2',[
T(`<h3>Quick recap</h3><table><tr><th>State</th><th>Neutron population</th></tr><tr><td>Subcritical</td><td>falling</td></tr><tr><td>Critical</td><td>steady (normal!)</td></tr><tr><td>Supercritical</td><td>rising</td></tr></table>`),
Q(`What does "critical" mean for a reactor?`,[`The chain reaction is steady`,`It's about to fail`,`It's shut down`,`The fuel is used up`],0,`Critical = steady. It's normal.`),
Q(`A reactor is subcritical. Its power is…`,[`falling`,`rising`,`steady`,`at maximum`],0,`Each generation is smaller, so the chain reaction dies away.`),
Q(`Where do most neutrons from fission end up in a reactor?`,[`Absorbed by other materials or leaking out`,`Causing more fissions`,`Turning into protons`,`In the turbine`],0,`Only about one per fission goes on to cause another fission when critical.`),
Q(`To raise power, the reactor must briefly be…`,[`supercritical`,`subcritical`,`shut down`,`prompt critical`],0,`Slightly supercritical, then back to critical at the new power.`),
Q(`Can a reactor be critical at 1% power?`,[`Yes: critical means steady, at any power`,`No, only at 100%`,`No, only when shut down`,`Only during refuelling`],0,`Critical describes a steady chain reaction, not how big it is.`)]);
F('tf3',[
T(`<h3>Quick recap</h3><ul><li>U-235 splits far more readily with <b>slow</b> neutrons.</li><li>The <b>moderator</b> (water in a PWR) slows them by bouncing off hydrogen.</li><li>Less water → less moderation → power falls.</li><li><b>Delayed neutrons</b> (about 0.65%) make the reactor slow enough to control.</li></ul>`),
Q(`What does a moderator do?`,[`Slows neutrons down`,`Absorbs neutrons`,`Speeds neutrons up`,`Cools the turbine`],0,`Slower neutrons are much more likely to make U-235 split.`),
Q(`In a PWR, what is the moderator?`,[`Ordinary water`,`Graphite`,`Lead`,`Boron`],0,`The same water that cools the core.`),
Q(`Why are heavy nuclei bad moderators?`,[`A neutron bounces off them keeping almost all its energy`,`They absorb every neutron`,`They're too hot`,`They're radioactive`],0,`Like a snooker ball bouncing off a bowling ball.`),
Q(`What fraction of neutrons are delayed?`,[`Less than 1%`,`About half`,`About 10%`,`All of them`],0,`About 0.65% for U-235. Small, but it makes control possible.`),
Q(`What must never happen in normal operation?`,[`The reactor becoming critical on prompt neutrons alone`,`The reactor becoming critical`,`The water being heated`,`The control rods moving`],0,`Prompt critical would make power rise far too fast to control.`)]);
F('tc1',[
T(`<h3>Quick recap</h3><p><b>Pellet</b> (uranium dioxide) → <b>rod</b> (zirconium cladding, about 4 m) → <b>assembly</b> (265 rods) → <b>core</b> (241 assemblies).</p>`),
Q(`What is a fuel pellet made of?`,[`Uranium dioxide ceramic`,`Pure uranium metal`,`Zirconium`,`Graphite`],0,`A hard ceramic that copes with high temperatures.`),
Q(`What is the tube around the pellets called?`,[`Cladding`,`Moderator`,`Control rod`,`Downcomer`],0,`The cladding seals the pellets in.`),
Q(`How many fuel rods are in one EPR fuel assembly?`,[`265`,`17`,`241`,`4`],0,`265 fuel rods in a 17 × 17 grid, plus guide tubes.`),
Q(`What are the empty guide tubes in an assembly for?`,[`Control rods to slide into`,`Extra fuel`,`Steam`,`Sea water`],0,`Control rods slide down into them from above.`),
Q(`What happens if zirconium cladding gets far too hot in steam?`,[`It reacts and makes hydrogen`,`It becomes a better moderator`,`It turns into uranium`,`Nothing`],0,`Above about 1,200 °C. This made the hydrogen at Fukushima.`)]);
F('tc2',[
T(`<h3>Quick recap</h3><p>Water enters cold (about 295 °C), flows <b>down</b> the downcomer, <b>up</b> through the core, and leaves hot (about 330 °C). Control rods hang above the core, held by electromagnets; losing power drops them in.</p>`),
Q(`What is the downcomer?`,[`The gap where incoming water flows down around the core`,`A control rod`,`The pipe to the turbine`,`The vessel head`],0,`Water goes down the outside before coming up through the core.`),
Q(`Why is the control rod design called fail-safe?`,[`Losing power makes the rods fall in and shut the reactor down`,`It never fails`,`The rods are made of safe materials`,`Operators can't move them`],0,`The failure (loss of power) leads to the safe state.`),
Q(`About how thick is the reactor vessel wall?`,[`About 25 cm of steel`,`About 2 mm`,`About 2 m of concrete`,`About 1 cm of glass`],0,`Thick enough to hold 155 bar safely.`),
Q(`Water leaves the core at about 330 °C. Why doesn't it boil?`,[`It's under very high pressure`,`It's mixed with boron`,`It's moving too fast`,`It's not hot enough`],0,`At 155 bar, water boils at about 345 °C.`),
Q(`What is removed from the top of the vessel during refuelling?`,[`The vessel head`,`The core barrel`,`The hot leg`,`The steam generator`],0,`The domed head, with the rod drive mechanisms, is lifted off.`)]);
F('tc3',[
T(`<h3>Quick recap</h3><ul><li><b>Burnup</b>: how much energy has been taken from fuel.</li><li>An <b>outage</b> every year or two: part of the core replaced, the rest <b>shuffled</b>.</li><li>Used fuel is always moved <b>underwater</b>: cooling and shielding.</li></ul>`),
Q(`Why is part of the core replaced at each outage, not all of it?`,[`Fuel stays in for several cycles to get the most energy from it`,`There isn't room for new fuel`,`All the fuel is replaced each time`,`To keep the reactor subcritical`],0,`Each assembly spends several cycles in the core.`),
Q(`Why are assemblies shuffled to new positions?`,[`To even out the power across the core`,`To clean them`,`To cool them`,`To check their weight`],0,`Mixing fresher and older fuel flattens the power.`),
Q(`What two jobs does the water in the spent fuel pool do?`,[`Cools the fuel and shields the radiation`,`Moderates and enriches it`,`Cleans and dries it`,`Makes it critical again`],0,`Cooling and shielding.`),
Q(`Why does fuel slowly become less able to keep the chain reaction going?`,[`U-235 is used up and fission products absorb neutrons`,`It gets colder`,`The cladding gets thicker`,`It turns into boron`],0,`Less fuel, more absorbers.`),
Q(`Which is safest to handle (with care)?`,[`Fresh fuel`,`Used fuel straight from the reactor`,`Used fuel after one year in the pool`,`They're all equally safe`],0,`Fresh fuel is only mildly radioactive. Used fuel is dangerous for a very long time.`)]);
F('tk1',[
T(`<h3>Quick recap</h3><ul><li>Control rods absorb neutrons. <b>In</b> → power down. <b>Out</b> → power up.</li><li>A <b>trip</b> drops every rod in about two seconds, by gravity.</li><li>Power falls fast, but decay heat remains.</li></ul>`),
Q(`Inserting control rods makes power…`,[`fall`,`rise`,`stay the same`,`double`],0,`More neutrons absorbed means fewer fissions.`),
Q(`Which of these is a good neutron absorber?`,[`Boron`,`Water`,`Zirconium`,`Air`],0,`Boron, along with silver, indium, cadmium and hafnium.`),
Q(`What can start an automatic trip?`,[`A reading passing a safety limit`,`Only the operator`,`The weather forecast`,`The end of a shift`],0,`The protection system trips the reactor automatically when a limit is crossed.`),
Q(`After a trip, reactor power…`,[`drops to a few percent quickly, then keeps falling slowly`,`goes to exactly zero instantly`,`stays the same`,`rises`],0,`Delayed neutrons die away over a minute or so, and decay heat continues.`),
Q(`How many control rod assemblies does an EPR have?`,[`89`,`4`,`241`,`1`],0,`89 rod assemblies, arranged in banks.`)]);
F('tk2',[
T(`<h3>Quick recap</h3><ul><li><b>Boric acid</b> in the primary water absorbs neutrons evenly.</li><li><b>Boration</b> (more boron) → less reactive. <b>Dilution</b> (less boron) → more reactive.</li><li>Boron is slow; rods are fast.</li></ul>`),
Q(`Adding boric acid to the primary water makes the reactor…`,[`less reactive`,`more reactive`,`hotter`,`no different`],0,`More absorber, fewer neutrons for fission.`),
Q(`What is "dilution"?`,[`Lowering the boron by adding pure water`,`Adding more boron`,`Removing control rods`,`Draining the pressuriser`],0,`Dilution lowers boron and adds reactivity.`),
Q(`Why is boron used for slow, long-term changes?`,[`It takes time to mix through the whole primary circuit`,`It's too expensive for fast changes`,`It only works at night`,`It's radioactive`],0,`Minutes to hours to take full effect.`),
Q(`What happens to the boron level over a fuel cycle?`,[`It's gradually reduced as the fuel is used up`,`It's gradually increased`,`It stays the same`,`It's only added at the end`],0,`Less boron makes up for the fuel being used.`),
Q(`Why is a slug of unborated water reaching the core dangerous?`,[`It suddenly removes absorber and adds reactivity`,`It's too cold to boil`,`It's radioactive`,`It blocks the pumps`],0,`That's a boron dilution event.`)]);
F('tk3',[
T(`<h3>Quick recap</h3><ul><li>Water <b>hotter</b> → less dense → less moderation → <b>power falls</b>.</li><li>Fuel hotter → <b>Doppler effect</b> → power falls (fastest brake).</li><li>So a PWR follows the turbine and resists runaway power.</li><li><b>Xenon</b> builds up for 8–12 hours after a trip.</li></ul>`),
Q(`The coolant temperature rises. What happens to reactor power, with no operator action?`,[`It falls`,`It rises`,`It stays the same`,`The reactor trips immediately`],0,`Negative temperature feedback.`),
Q(`What is the fastest-acting brake on a sudden power rise?`,[`The Doppler effect in the fuel`,`Boron`,`Xenon`,`The operator`],0,`It works in a fraction of a second as the fuel heats up.`),
Q(`The turbine takes less steam. The reactor…`,[`reduces its power by itself as the coolant warms`,`increases power`,`trips`,`does nothing`],0,`Warmer water slows fewer neutrons, so power falls to match.`),
Q(`Why is xenon-135 a problem after a trip?`,[`It builds up and absorbs neutrons, making a restart harder`,`It's explosive`,`It speeds up the reactor`,`It blocks the pipes`],0,`It's the strongest neutron absorber known.`),
Q(`Why is a negative temperature coefficient good for safety?`,[`If power rises, the heating that follows pushes it back down`,`It makes the reactor more powerful`,`It saves fuel`,`It keeps the water cold`],0,`The reactor automatically resists power excursions.`)]);
F('tp1',[
T(`<h3>Quick recap</h3><ul><li>Higher pressure → higher boiling point.</li><li>PWR primary: about <b>155 bar</b>, so 330 °C water stays liquid.</li><li><b>Subcooling margin</b>: how far below boiling the water is.</li></ul>`),
Q(`Why is the primary circuit kept at high pressure?`,[`So the water stays liquid at over 300 °C`,`To push the turbine`,`To make more neutrons`,`To cool the sea`],0,`At 155 bar water doesn't boil until about 345 °C.`),
Q(`At normal air pressure, water boils at…`,[`100 °C`,`330 °C`,`0 °C`,`155 °C`],0,`100 °C at 1 bar.`),
Q(`What could make the subcooling margin shrink?`,[`Falling pressure or rising temperature`,`Inserting control rods`,`Adding boron`,`Cooler sea water`],0,`Either brings the water closer to boiling.`),
Q(`Why don't we want large steam bubbles on the fuel?`,[`Steam insulates the fuel so it can't cool properly`,`Steam is radioactive`,`Bubbles make noise`,`Steam increases pressure too much`],0,`A film of steam stops heat getting away from the fuel.`),
Q(`About how many times normal air pressure is 155 bar?`,[`About 155 times`,`About 15 times`,`About 1.5 times`,`About 1,550 times`],0,`1 bar is roughly normal air pressure.`)]);
F('tp2',[
T(`<h3>Quick recap</h3><ul><li>The pressuriser holds a steam bubble that sets primary pressure.</li><li><b>Heaters</b> → pressure up. <b>Spray</b> → pressure down. <b>Relief valves</b> → protect.</li><li>Pressuriser <b>level</b> shows how much water is in the primary circuit.</li></ul>`),
Q(`Pressure is too high. Which helps?`,[`Open the spray`,`Switch on the heaters`,`Raise the turbine load`,`Withdraw the control rods`],0,`Spray condenses steam, lowering pressure.`),
Q(`The primary water heats up and expands. What happens in the pressuriser?`,[`Water surges in, level rises and pressure rises`,`Level falls`,`Nothing`,`The reactor trips`],0,`An insurge compresses the steam bubble.`),
Q(`What does a steadily falling pressuriser level (at steady temperature) suggest?`,[`A possible leak from the primary circuit`,`The reactor is gaining power`,`The heaters are on`,`Normal operation`],0,`Water is going somewhere.`),
Q(`At Three Mile Island, what did the relief valve light actually show?`,[`That the valve had been told to close, not its real position`,`The valve's real position`,`The pressure`,`The water level`],0,`A misleading indication.`),
Q(`Why did the TMI operators cut back emergency water?`,[`A high pressuriser level made them think the circuit was too full`,`They were told to by the grid`,`The pumps broke`,`They wanted to save water`],0,`Steam in the circuit pushed the level up while water was actually being lost.`)]);
F('tp3',[
T(`<h3>Quick recap</h3><p>Each of the EPR's <b>four loops</b>: hot leg → steam generator → reactor coolant pump → cold leg. Steam generators: primary inside about 6,000 tubes, secondary boils outside. Pumps off? <b>Natural circulation</b> still removes decay heat.</p>`),
Q(`What drives the primary water round the loops in normal operation?`,[`The reactor coolant pumps`,`The turbine`,`The pressuriser heaters`,`Gravity alone`],0,`Four huge pumps, one per loop.`),
Q(`Which leg carries hot water from the reactor to the steam generator?`,[`The hot leg`,`The cold leg`,`The downcomer`,`The steam line`],0,`Hot leg out, cold leg back.`),
Q(`What separates the radioactive primary water from the clean secondary water?`,[`The steam generator tube walls`,`The condenser`,`The pressuriser`,`The containment`],0,`That's why tube leaks are monitored closely.`),
Q(`What is natural circulation?`,[`Water flowing round the loop by itself because hot water rises and cold sinks`,`Pumps running slowly`,`Rain cooling the plant`,`Steam flowing to the turbine`],0,`It works because the steam generators are higher than the core.`),
Q(`How many loops does an EPR primary circuit have?`,[`Four`,`One`,`Two`,`Eight`],0,`Four loops, each with a steam generator and a pump.`)]);
F('ts1',[
T(`<h3>Quick recap</h3><p>Secondary loop: <b>steam generator → turbine → condenser → feed pumps → back</b>. Steam is dried and reheated between turbine stages. Condenser at a vacuum. Losing feedwater trips the reactor; <b>emergency feedwater</b> takes over.</p>`),
Q(`What turns the steam back into water?`,[`The condenser`,`The turbine`,`The pressuriser`,`The steam generator`],0,`Sea water in its tubes cools the steam.`),
Q(`What does the moisture separator reheater do?`,[`Removes water droplets and reheats the steam between turbine stages`,`Adds boron`,`Heats the sea water`,`Controls reactor power`],0,`Wet steam would erode the blades.`),
Q(`Why would losing feedwater be serious?`,[`The steam generators would boil dry and stop cooling the primary circuit`,`The turbine would speed up`,`The condenser would freeze`,`The grid would trip`],0,`That's why emergency feedwater exists.`),
Q(`Is the secondary water normally radioactive?`,[`No`,`Yes, very`,`Only on Mondays`,`Only in the turbine`],0,`It never passes through the core. Monitors check for steam generator tube leaks.`),
O(`Put the secondary loop in order, starting where steam is made.`,[`Steam generator`,`Turbine`,`Condenser`,`Feed pumps`],`And back to the steam generator.`)]);
F('ts2',[
T(`<h3>Quick recap</h3><ul><li>Steam pushes moving blades round. Each HPC turbine: about 1,600 MW.</li><li>Generators lock to the <b>50 Hz</b> grid; HPC's turn at <b>1,500 rpm</b>.</li><li>Transformers step up to <b>400,000 V</b>.</li><li>Turbine trip: steam dump + cut reactor power or trip.</li></ul>`),
Q(`What frequency is the UK grid?`,[`50 Hz`,`60 Hz`,`1,500 Hz`,`400 Hz`],0,`50 cycles a second.`),
Q(`What does "synchronising" mean?`,[`Matching the generator to the grid before connecting it`,`Starting the reactor`,`Testing alarms`,`Changing shift`],0,`Speed and timing must match exactly.`),
Q(`What does the steam dump (bypass) do after a turbine trip?`,[`Sends steam straight to the condenser`,`Releases primary water`,`Adds boron`,`Speeds up the turbine`],0,`It gives the reactor's heat somewhere to go.`),
Q(`What happens to grid frequency if demand suddenly exceeds supply?`,[`It falls`,`It rises`,`It stays exactly 50 Hz`,`It goes to zero`],0,`Generators slow slightly, so frequency drops, and the grid operator calls for more power.`),
Q(`Why use a very high voltage for transmission?`,[`Less current, so less energy lost in the cables`,`It's needed by homes`,`It makes turbines faster`,`It cools the cables`],0,`Then it's stepped down to 230 V locally.`)]);
F('ts3',[
T(`<h3>Quick recap</h3><ul><li>About <b>36%</b> of the reactor's heat becomes electricity; about two-thirds goes to the sea.</li><li>Sea water warms by about 11 °C in the condenser.</li><li>The <b>ultimate heat sink</b> is where all heat ends up.</li></ul>`),
Q(`Why can't a power station turn all its heat into electricity?`,[`It's a law of physics for heat engines`,`Because of poor design`,`Because of the grid`,`It can, with enough effort`],0,`Some heat must always be rejected at a lower temperature.`),
Q(`How does Hinkley Point C get its cooling water?`,[`Tunnels under the sea bed from the Bristol Channel`,`Cooling towers`,`A river`,`Rainwater tanks`],0,`Large tunnels bring sea water in and take it back out.`),
Q(`What do inland power stations usually use instead of the sea?`,[`Cooling towers`,`Bigger turbines`,`More boron`,`Nothing`],0,`Cooling towers pass the heat to the air.`),
Q(`Why must safety systems have their own route to the heat sink?`,[`So decay heat can be removed even if the main condenser can't be used`,`To make more electricity`,`To heat the turbine hall`,`They don't`],0,`Keeping the route to the heat sink open is vital.`),
Q(`Of an EPR's 4,590 MW of heat, roughly how much becomes electricity?`,[`About 1,630 MW`,`About 4,500 MW`,`About 300 MW`,`About 3,000 MW`],0,`About 36%.`)]);
F('td1',[
T(`<h3>Quick recap</h3><ul><li><b>Control, cool, contain.</b></li><li>Decay heat: about 6–7% just after a trip, 1.5% after an hour, 0.5% after a day.</li><li>Fukushima: shutdown worked, cooling was lost.</li></ul>`),
Q(`Which safety job does the containment building do?`,[`Contain`,`Control`,`Cool`,`None`],0,`It holds radioactivity in.`),
Q(`Which safety job does emergency feedwater do?`,[`Cool`,`Control`,`Contain`,`None`],0,`It keeps the steam generators removing heat.`),
Q(`Right after a trip, decay heat is about…`,[`6–7% of full power`,`0%`,`50% of full power`,`100% of full power`],0,`It then falls quickly at first, then slowly.`),
Q(`At Fukushima, what knocked out cooling?`,[`A tsunami flooding the backup power`,`A control rod failure`,`Too much boron`,`An operator error at startup`],0,`No power meant no pumps.`),
Q(`If control, cool and contain are all achieved…`,[`people and the environment are protected`,`the reactor makes more power`,`the turbine can restart`,`nothing changes`],0,`They're the three fundamental safety functions.`)]);
F('td2',[
T(`<h3>Quick recap</h3><p>Barriers: <b>pellet → cladding → primary circuit → containment</b> (double in an EPR). <b>Defence in depth</b>: prevent → detect and control → safety systems → limit severe accidents → off-site response.</p>`),
Q(`Which is the first barrier, closest to the fission products?`,[`The fuel pellet`,`The cladding`,`The containment`,`The primary circuit`],0,`The ceramic pellet traps most fission products itself.`),
Q(`What does the EPR's outer containment shell protect against?`,[`External hazards such as an aircraft crash`,`Neutrons from the core`,`Pressure in the primary circuit`,`Sea water`],0,`The inner shell holds pressure; the outer protects it.`),
Q(`Alarms and operators correcting a small problem belong to which level of defence?`,[`Level 2`,`Level 1`,`Level 4`,`Level 5`],0,`Level 2: detect and control abnormal operation.`),
Q(`What is defence in depth?`,[`Several independent levels of protection, each assuming the one before might fail`,`A very thick wall`,`Burying the reactor`,`Having lots of operators`],0,`No single failure should lead to harm.`),
Q(`Off-site emergency plans are level…`,[`5`,`1`,`2`,`3`],0,`The last level, if all else fails.`)]);
F('td3',[
T(`<h3>Quick recap</h3><ul><li>Four independent safety trains, each able to do the whole job: <b>redundancy</b>.</li><li>In four separate buildings: <b>separation</b>. Different equipment types: <b>diversity</b>.</li><li><b>2-out-of-4 voting</b>. 30 minutes before operator action is needed.</li></ul>`),
Q(`What does "redundancy" mean?`,[`Having more than one system that can do the same job`,`Having no backup`,`Using old equipment`,`Shutting systems down`],0,`Four trains where one is enough.`),
Q(`What does "separation" protect against?`,[`One event (fire, flood) taking out several trains`,`Electrical faults inside one pump`,`Operators misreading`,`Xenon`],0,`Physical distance between trains.`),
Q(`What does "diversity" mean?`,[`Using different types of equipment for the same job`,`Having four identical trains`,`Hiring different people`,`Using different fuels`],0,`So one hidden design flaw can't hit everything.`),
Q(`With 2-out-of-4 voting, one channel fails and reads "trip". The reactor…`,[`keeps running`,`trips`,`speeds up`,`switches channels`],0,`It needs two channels to agree.`),
Q(`What powers the safety systems if the grid is lost?`,[`Emergency diesel generators`,`The main turbine`,`Solar panels`,`Nothing`],0,`Four diesels plus two station blackout diesels per EPR.`)]);
F('tr1',[
T(`<h3>Quick recap</h3><ul><li>Dose in <b>sieverts</b>; everyday doses in mSv.</li><li>UK average about <b>2.7 mSv a year</b>, half from radon.</li><li>Worker limit <b>20 mSv a year</b>; most get under 1.</li></ul>`),
Q(`How many millisieverts in a sievert?`,[`1,000`,`100`,`10`,`1,000,000`],0,`Milli = a thousandth.`),
Q(`Why can radiation harm the body?`,[`It can damage cells and DNA`,`It makes you heavier`,`It cools the body`,`It can't`],0,`Most damage is repaired, but not always.`),
Q(`What do radiation rules assume about small doses?`,[`Any dose may carry a small risk, so keep doses as low as reasonably practicable`,`Small doses are completely harmless`,`Small doses are good for you`,`Only doses over 1 Sv matter`],0,`A cautious assumption.`),
Q(`About what is the UK average yearly dose from all sources?`,[`2.7 mSv`,`27 mSv`,`0.027 mSv`,`270 mSv`],0,`About half from radon.`),
Q(`About how much dose do most nuclear workers get in a year?`,[`Less than 1 mSv`,`About 20 mSv`,`About 100 mSv`,`About 1 Sv`],0,`Far below the legal limit.`)]);
F('tr2',[
T(`<h3>Quick recap</h3><p><b>Time</b> (less), <b>distance</b> (more: double it, quarter the dose rate), <b>shielding</b> (dense material). <b>ALARP</b>, dose estimates, electronic dosimeters.</p>`),
Q(`You halve the time you spend near a source. Your dose…`,[`halves`,`quarters`,`doubles`,`stays the same`],0,`Dose builds up with time.`),
Q(`Using a long-handled tool reduces dose mainly by…`,[`distance`,`time`,`shielding`,`contamination control`],0,`Your hands and body are further from the source.`),
Q(`What does an electronic personal dosimeter do?`,[`Shows your dose and alarms if it's higher than expected`,`Stops radiation`,`Measures temperature`,`Cleans contamination`],0,`It's worn on every job in a radiation area.`),
Q(`You move from 1 m to 3 m from a small source. The dose rate becomes…`,[`a ninth`,`a third`,`a half`,`the same`],0,`Three times the distance: 3 × 3 = 9 times less.`),
Q(`Lead blankets reduce dose by…`,[`shielding`,`time`,`distance`,`decontamination`],0,`Dense material absorbs gamma rays.`)]);
F('tr3',[
T(`<h3>Quick recap</h3><ul><li><b>Exposure</b> stops when you walk away; <b>contamination</b> comes with you.</li><li>Controlled areas, protective clothing, exit monitors.</li><li>Waste: low, intermediate and high level (spent fuel).</li></ul>`),
Q(`Radioactive dust on your overalls is…`,[`contamination`,`exposure only`,`shielding`,`background`],0,`Radioactive material on you.`),
Q(`Why is contamination harder to deal with than exposure?`,[`It moves with you and can spread or be breathed in`,`It's always stronger`,`It can't be measured`,`It isn't harder`],0,`It must be removed, not just walked away from.`),
Q(`Used gloves and overalls are usually…`,[`low-level waste`,`high-level waste`,`not waste at all`,`spent fuel`],0,`Low level: compacted and sent for disposal.`),
Q(`What is the UK's plan for its most radioactive waste?`,[`A deep geological disposal facility`,`Dumping it at sea`,`Burning it`,`Sending it into space`],0,`Hundreds of metres underground in stable rock.`),
Q(`What do whole-body monitors at the exit of a controlled area check for?`,[`Contamination on people leaving`,`Body temperature`,`Identity`,`Dose rate from the reactor`],0,`So nothing radioactive leaves the area.`)]);
F('to1',[
T(`<h3>Quick recap</h3><ul><li>The main control room monitors and controls everything.</li><li>Shift teams: supervisor, control room operators, field operators.</li><li>Careful <b>handover</b>. Years of training on a <b>full-scope simulator</b>.</li></ul>`),
Q(`What is the large overview display for?`,[`So the whole crew shares the same picture of the plant`,`Watching TV`,`Showing the grid price`,`Training only`],0,`A shared picture helps teamwork.`),
Q(`What is the back-up panel for?`,[`Shutting down and cooling the reactor if the main screens were lost`,`Storing procedures`,`Training`,`Ordering spare parts`],0,`A diverse, independent way to keep the plant safe.`),
Q(`Who has overall charge of the shift?`,[`The shift manager or supervisor`,`The newest operator`,`The field operators`,`The grid operator`],0,`They keep the big picture.`),
Q(`What should a good handover include?`,[`Plant state, work in progress, faults and anything unusual`,`Only the weather`,`Nothing: the screens show everything`,`Only the next day's rota`],0,`The incoming crew must know exactly where things stand.`),
Q(`Do licensed operators stop training once qualified?`,[`No, they keep training and are re-assessed regularly`,`Yes, forever`,`Only if they change station`,`Only if there's an accident`],0,`Continuous training keeps skills sharp.`)]);
F('to2',[
T(`<h3>Quick recap</h3><p><b>Cold shutdown → heat-up (pump heat + heaters) → hot shutdown → approach to critical → raise power → synchronise → power operation.</b></p>`),
Q(`In hot shutdown, the reactor is…`,[`at normal temperature and pressure but subcritical`,`critical at full power`,`cold and depressurised`,`being refuelled`],0,`Hot, pressurised, but not yet critical.`),
Q(`Why is criticality approached in small steps?`,[`Each step makes a bigger difference as critical gets closer`,`To save fuel`,`Because rods move slowly`,`It isn't`],0,`Small steps prevent surprises.`),
Q(`What tells operators how close they are to critical?`,[`The neutron count rate and how it changes after each step`,`The turbine speed`,`The sea temperature`,`The time of day`],0,`The neutron detectors.`),
Q(`When is the generator connected to the grid?`,[`After the reactor is critical and the turbine is up to speed`,`Before heat-up`,`During cold shutdown`,`Only during refuelling`],0,`Then it's synchronised and loaded up.`),
Q(`What is a surveillance test?`,[`A regular test that safety equipment still works`,`Watching the operators`,`A security check`,`A fuel inspection`],0,`They're scheduled throughout normal operation.`)]);
F('to3',[
T(`<h3>Quick recap</h3><ul><li>After a trip: rods in? turbine tripped? cooling working? then the <b>procedures</b>.</li><li>Tools: <b>STAR</b>, peer check, three-way communication, questioning attitude.</li><li>TMI, Chernobyl, Fukushima: each has lessons built into today's plants.</li></ul>`),
Q(`What's the very first thing to confirm after a trip?`,[`All rods are in and power is falling`,`The grid price`,`The turbine oil level`,`The next shift's rota`],0,`Control first.`),
Q(`What does STAR stand for?`,[`Stop, Think, Act, Review`,`Start, Test, Adjust, Repeat`,`Safety, Training, Alarms, Reports`,`Steam, Turbine, Air, Reactor`],0,`A pause before acting.`),
Q(`In three-way communication, what does the receiver do?`,[`Repeats the instruction back`,`Ignores it`,`Writes it down later`,`Passes it to someone else`],0,`Then the sender confirms it's right.`),
Q(`What made the Chernobyl reactor unstable?`,[`Its power rose when its cooling water turned to steam`,`It had too many control rods`,`It was cooled by gas`,`It used enriched fuel`],0,`A positive void effect, made far worse by breaking the safety rules.`),
Q(`What's the key lesson from Fukushima?`,[`Protect cooling and power supplies against extreme events`,`Never use diesel generators`,`Build reactors inland`,`Use more boron`],0,`Decay heat must always be removed.`)]);

/* ----- Theory track: unit tests ----- */
TT('th1',[
x('tb1',Q(`What converts the turbine's spinning into electricity?`,[`The generator`,`The condenser`,`The reactor`,`The transformer`],0,`Magnets spinning in coils.`)),
x('tb1',Q(`A nuclear power station is a kind of…`,[`thermal power station`,`wind power station`,`battery`,`solar farm`],0,`It boils water to spin a turbine.`)),
x('tb2',Q(`Which water circuit is cooled by the sea?`,[`The secondary, in the condenser`,`The primary, in the core`,`None`,`The pressuriser`],0,`Sea water condenses the used steam.`)),
x('tb2',Q(`Why don't the primary and secondary waters mix?`,[`To keep radioactivity inside the primary circuit`,`They're different colours`,`They're at the same pressure`,`It doesn't matter`],0,`The steam generator tubes separate them.`)),
x('tb2',Q(`Where does the turbine get its steam from?`,[`The steam generators`,`The reactor vessel directly`,`The sea`,`The condenser`],0,`Secondary water boils in the steam generators.`)),
x('tb3',Q(`What kind of reactor is an EPR?`,[`Pressurised water reactor`,`Gas-cooled reactor`,`Boiling water reactor`,`Fast reactor`],0,`A large PWR.`)),
x('tb3',Q(`Hinkley Point C's design life is about…`,[`60 years`,`10 years`,`200 years`,`5 years`],0,`60 years.`)),
x('tb3',Q(`About how many homes could Hinkley Point C supply?`,[`About 6 million`,`About 6 thousand`,`About 60 million`,`About 600`],0,`Around 7% of UK electricity.`))]);
TT('th2',[
x('ta1',Q(`Which particles are found in the nucleus?`,[`Protons and neutrons`,`Electrons only`,`Protons and electrons`,`Neutrons and electrons`],0,`Electrons are outside.`)),
x('ta1',Q(`What is the charge of a proton?`,[`Positive`,`Negative`,`None`,`It changes`],0,`Positive.`)),
x('ta2',Q(`What is an isotope?`,[`A version of an element with a different number of neutrons`,`A different element`,`An electron`,`A type of radiation`],0,`Same protons, different neutrons.`)),
x('ta2',Q(`How much of natural uranium is U-235?`,[`About 0.7%`,`About 50%`,`About 99%`,`About 5%`],0,`That's why it's enriched.`)),
x('ta2',Q(`Where does plutonium-239 in used fuel come from?`,[`U-238 absorbing neutrons`,`The control rods`,`It's added at the factory`,`The sea`],0,`Then two beta decays.`)),
x('ta3',Q(`Which radiation is stopped by a sheet of paper?`,[`Alpha`,`Beta`,`Gamma`,`Neutrons`],0,`Big, slow and charged.`)),
x('ta3',Q(`Radioactive decay is…`,[`random for each atom, but predictable for large numbers`,`completely predictable for each atom`,`controlled by temperature`,`caused by light`],0,`Half-life describes the group, not the individual.`)),
x('ta3',Q(`Why is thick concrete used around a reactor?`,[`It stops gamma rays and neutrons`,`It stops alpha particles`,`It keeps the reactor warm`,`It's cheap`],0,`Dense, and full of hydrogen in its water content.`))]);
TT('th3',[
x('tf1',Q(`What causes U-235 to split?`,[`Absorbing a slow neutron`,`Heating it`,`Pressure`,`An electron`],0,`It becomes wobbly U-236 and splits.`)),
x('tf1',Q(`What are fission products?`,[`The smaller, radioactive nuclei left after a split`,`The neutrons`,`The steam`,`The electricity`],0,`They cause decay heat.`)),
x('tf2',Q(`A supercritical reactor's power is…`,[`rising`,`falling`,`steady`,`zero`],0,`Each generation is bigger.`)),
x('tf2',Q(`Normal steady running is…`,[`critical`,`subcritical`,`supercritical`,`prompt critical`],0,`Critical = steady.`)),
x('tf3',Q(`Why does a PWR need a moderator?`,[`U-235 splits far more readily with slow neutrons`,`To absorb neutrons`,`To speed neutrons up`,`To cool the turbine`],0,`Water slows the neutrons.`)),
x('tf3',Q(`In a PWR, if the water boils away from the core, power…`,[`falls, because there's less moderator`,`rises`,`is unaffected`,`doubles`],0,`A built-in brake.`)),
x('tf3',Q(`What makes a reactor slow enough to control?`,[`Delayed neutrons`,`Boron`,`The turbine`,`Steam`],0,`About 0.65% of neutrons arrive seconds later.`)),
x('tf1',Q(`Roughly how many new neutrons does one fission release?`,[`2 or 3`,`100`,`None`,`1,000`],0,`On average about 2.4.`))]);
TT('th4',[
x('tc1',Q(`What holds the fuel pellets?`,[`Zirconium-alloy cladding tubes`,`Steel boxes`,`Glass jars`,`Water`],0,`Sealed fuel rods.`)),
x('tc1',Q(`What is a fuel assembly?`,[`A bundle of fuel rods in a square grid`,`A single pellet`,`The whole core`,`A control rod`],0,`265 rods in an EPR assembly.`)),
x('tc2',Q(`In which direction does water flow through the core?`,[`Upwards`,`Downwards`,`Sideways`,`It doesn't flow`],0,`Down the downcomer, then up through the core.`)),
x('tc2',Q(`What holds the control rods up above the core?`,[`Electromagnets in the drive mechanisms`,`Springs`,`Steam pressure`,`Ropes`],0,`Cut the power and they fall in.`)),
x('tc3',Q(`What is an outage?`,[`A planned shutdown for refuelling and maintenance`,`A power cut in town`,`A reactor accident`,`A shift change`],0,`Every year or two.`)),
x('tc3',Q(`Where does used fuel go when it leaves the reactor?`,[`Underwater into the spent fuel pool`,`Straight to the bin`,`Into the turbine hall`,`Back to the factory the next day`],0,`Cooling and shielding.`)),
x('tc1',Q(`What does uranium dioxide melt at, roughly?`,[`About 2,800 °C`,`About 300 °C`,`About 100 °C`,`About 10,000 °C`],0,`It's a very tough ceramic.`)),
x('tc3',Q(`What is burnup?`,[`How much energy has been taken from the fuel`,`Fuel catching fire`,`The temperature of the fuel`,`A type of waste`],0,`Measured over the fuel's life.`))]);
TT('th5',[
x('tk1',Q(`Withdrawing control rods…`,[`raises power`,`lowers power`,`has no effect`,`trips the reactor`],0,`Fewer neutrons absorbed.`)),
x('tk1',Q(`How long do the rods take to drop in a trip?`,[`About two seconds`,`About two hours`,`About two days`,`They don't move`],0,`Fast, by gravity.`)),
x('tk2',Q(`Boron in the coolant…`,[`absorbs neutrons evenly across the core`,`speeds up neutrons`,`heats the water`,`moderates neutrons`],0,`A slow, even control.`)),
x('tk2',Q(`Which is faster: rods or boron?`,[`Rods`,`Boron`,`They're the same`,`Neither works`],0,`Rods act in seconds.`)),
x('tk3',Q(`A PWR's coolant cools down. With no operator action, power…`,[`rises`,`falls`,`stays the same`,`trips`],0,`Denser water moderates better.`)),
x('tk3',Q(`What is the Doppler effect in the fuel?`,[`Hotter fuel absorbs more neutrons, reducing power`,`A change in sound`,`Fuel getting colder`,`Boron being added`],0,`The fastest brake.`)),
x('tk3',Q(`About when does xenon peak after a trip from full power?`,[`About 8–12 hours later`,`Immediately`,`After a month`,`It never builds up`],0,`Then it decays over a day or two.`)),
x('tk1',Q(`If in doubt about the reactor's safety, an operator can always…`,[`trip it`,`withdraw rods`,`stop the cooling`,`dilute the boron`],0,`A trip puts it in a safe state.`))]);
TT('th6',[
x('tp1',Q(`Why is a PWR pressurised?`,[`To stop the water boiling in the core`,`To spin the turbine`,`To slow neutrons`,`To make boron dissolve`],0,`Water stays liquid at over 300 °C.`)),
x('tp1',Q(`What is the subcooling margin?`,[`How far below boiling the primary water is`,`How much boron there is`,`The turbine speed`,`The sea temperature`],0,`Shrinking margin = warning.`)),
x('tp2',Q(`What do the pressuriser heaters do?`,[`Boil water to raise pressure`,`Warm the turbine`,`Heat the fuel`,`Melt the boron`],0,`More steam, more pressure.`)),
x('tp2',Q(`What does the pressuriser spray do?`,[`Condenses steam to lower pressure`,`Cleans the vessel`,`Adds boron`,`Cools the turbine`],0,`Less steam, less pressure.`)),
x('tp3',Q(`What is inside the steam generator tubes?`,[`Primary water`,`Secondary steam`,`Sea water`,`Air`],0,`Secondary water boils outside them.`)),
x('tp3',Q(`What keeps the core cooled if all the reactor coolant pumps stop?`,[`Natural circulation`,`The turbine`,`The condenser vacuum`,`Nothing`],0,`Steam generators are higher than the core.`)),
x('tp3',Q(`What drives water round the primary loops normally?`,[`Reactor coolant pumps`,`Feed pumps`,`Gravity`,`Steam`],0,`One per loop.`)),
x('tp2',Q(`What was misleading at Three Mile Island?`,[`A light showing a relief valve as closed when it was stuck open`,`The turbine speed`,`The grid frequency`,`The boron level`],0,`It showed the command, not the position.`))]);
TT('th7',[
x('ts1',Q(`Where does the steam go after the turbine?`,[`The condenser`,`Back to the reactor`,`Into the air`,`The pressuriser`],0,`It's turned back into water.`)),
x('ts1',Q(`Why is the condenser at a vacuum?`,[`So the steam expands further and gives more energy`,`To stop corrosion`,`To cool the sea`,`To make it quieter`],0,`Lower exhaust pressure = more work.`)),
x('ts1',Q(`What takes over if main feedwater is lost?`,[`Emergency feedwater`,`The condenser`,`The turbine`,`The pressuriser`],0,`Its own pumps and tanks.`)),
x('ts2',Q(`At what speed do HPC's generators turn?`,[`1,500 rpm`,`50 rpm`,`3,600 rpm`,`15 rpm`],0,`Locked to the 50 Hz grid.`)),
x('ts2',Q(`Why is the voltage raised for the grid?`,[`To reduce losses in the cables`,`To make it safer`,`Because homes need it`,`To cool the transformers`],0,`Less current, less heat lost.`)),
x('ts3',Q(`About what share of the reactor's heat becomes electricity?`,[`About a third`,`Almost all`,`About a tenth`,`About 90%`],0,`About 36%.`)),
x('ts3',Q(`What is the ultimate heat sink at Hinkley Point C?`,[`The sea`,`The turbine`,`The reactor`,`The grid`],0,`Where all the heat finally goes.`)),
x('ts2',Q(`What must happen if the turbine trips at high power?`,[`Steam dump to the condenser and a quick power cut or reactor trip`,`Nothing`,`Raise reactor power`,`Close the condenser`],0,`The heat needs somewhere to go.`))]);
TT('th8',[
x('td1',Q(`What are the three fundamental safety jobs?`,[`Control, cool, contain`,`Start, run, stop`,`Heat, steam, power`,`Watch, wait, act`],0,`Every safety system serves one.`)),
x('td1',Q(`Why is cooling needed after the reactor has tripped?`,[`Decay heat`,`The chain reaction continues`,`The turbine is still spinning`,`It isn't needed`],0,`Fission products keep making heat.`)),
x('td2',Q(`Put simply, what is defence in depth?`,[`Several independent layers of protection`,`A very deep basement`,`Lots of guards`,`One very strong wall`],0,`If one fails, the next catches it.`)),
x('td2',Q(`Which barrier is outermost in an EPR?`,[`The outer concrete shell`,`The cladding`,`The pellet`,`The reactor vessel`],0,`It protects against external hazards.`)),
x('td3',Q(`How many safety trains does an EPR have?`,[`Four`,`One`,`Two`,`Eight`],0,`Each can do the whole job.`)),
x('td3',Q(`What is the core catcher?`,[`An area that spreads and cools a molten core`,`A net under the fuel pool`,`A control rod`,`A pump`],0,`Severe accident protection.`)),
x('td3',Q(`Why do operators have about 30 minutes before they must act in an EPR design-basis accident?`,[`The safety systems act automatically`,`The reactor waits for them`,`There's no decay heat`,`The turbine keeps cooling`],0,`Time to understand before acting.`)),
x('td1',Q(`At Fukushima, the reactors…`,[`shut down correctly but lost cooling`,`never shut down`,`had a power surge`,`were already shut down for years`],0,`Loss of power took out the cooling.`))]);
TT('th9',[
x('tr1',Q(`What unit is radiation dose measured in?`,[`Sieverts`,`Watts`,`Becquerels per litre`,`Bars`],0,`Usually millisieverts.`)),
x('tr1',Q(`What is the UK legal limit for a classified worker's yearly dose?`,[`20 mSv`,`2 mSv`,`200 mSv`,`2,000 mSv`],0,`Most get under 1 mSv.`)),
x('tr2',Q(`The three ways to reduce external dose are…`,[`time, distance, shielding`,`speed, height, weight`,`water, air, fire`,`gloves, boots, hat`],0,`Less time, more distance, more shielding.`)),
x('tr2',Q(`What does ALARP stand for?`,[`As Low As Reasonably Practicable`,`All Levels Are Really Protected`,`Alarm Level And Radiation Point`,`Always Leave A Radiation Place`],0,`The UK legal principle.`)),
x('tr3',Q(`What's the difference between exposure and contamination?`,[`Contamination is radioactive material on or in you; exposure is radiation reaching you`,`They're the same`,`Exposure is worse`,`Contamination only affects machines`],0,`Exposure stops when you move away.`)),
x('tr3',Q(`Spent fuel is…`,[`high-level waste`,`low-level waste`,`not radioactive`,`intermediate waste`],0,`Intensely radioactive and hot.`)),
x('tr1',Q(`Radon gives about what share of the average UK dose?`,[`About half`,`Almost none`,`All of it`,`About 1%`],0,`It comes from the ground.`)),
x('tr2',Q(`Double the distance from a small source, and the dose rate…`,[`falls to a quarter`,`halves`,`doubles`,`stays the same`],0,`The inverse square law.`))]);
TT('th10',[
x('to1',Q(`Who works out in the plant checking and operating equipment?`,[`Field operators`,`The shift manager`,`The grid operator`,`Visitors`],0,`The control room's eyes and hands.`)),
x('to1',Q(`What is a full-scope simulator?`,[`An exact copy of the control room run by a computer model of the plant`,`A video game`,`A model railway`,`A diagram`],0,`For realistic training.`)),
x('to2',Q(`Where does heat come from during heat-up, before the reactor is critical?`,[`Reactor coolant pumps and pressuriser heaters`,`The turbine`,`The sea`,`The grid`],0,`Pump heat warms the water.`)),
x('to2',Q(`What do operators watch most closely while approaching criticality?`,[`The neutron count rate`,`The turbine speed`,`The condenser vacuum`,`The weather`],0,`It shows how close to critical the reactor is.`)),
x('to3',Q(`After a trip, which do operators confirm first?`,[`Rods in and power falling`,`Grid frequency`,`Turbine oil temperature`,`The next shift`],0,`Control first, then cooling.`)),
x('to3',Q(`What is a peer check?`,[`A colleague confirming you have the right control before you act`,`A test of the alarms`,`A shift handover`,`A dose check`],0,`Catches wrong-component mistakes.`)),
x('to3',Q(`What did Chernobyl's operators do during the test?`,[`Disabled safety systems and ran the reactor in an unstable state`,`Followed every rule exactly`,`Shut the reactor down`,`Added extra boron`],0,`Breaking the safety rules on an unstable design.`)),
x('to1',Q(`Why is shift handover important?`,[`So the incoming crew knows exactly what state the plant is in`,`It's when pay is decided`,`It's a formality`,`It's when the reactor refuels`],0,`Many incidents started with something missed at handover.`))]);

/* ----- Theory track: teasers ----- */
var THOOKS={tb1:'Every big power station is really just a way to spin a magnet. Find out what spins it.',tb2:'Follow the energy from a splitting atom all the way to your plug socket.',tb3:'Two reactors, 3.2 GW, 60 years: meet the station you want to work at.',
ta1:'What atoms are made of, and why uranium is on the edge of falling apart.',ta2:'Why only 7 in every 1,000 uranium atoms are useful fuel, and what enrichment does.',ta3:'Alpha, beta, gamma and neutrons: test which materials stop each one.',
tf1:'Fire a neutron at a uranium nucleus and watch it split.',tf2:'Critical doesn\'t mean danger. Play with a chain reaction and see what it really means.',tf3:'Why water slows neutrons, and the tiny fraction of late neutrons that make reactors controllable.',
tc1:'From a fingertip-sized pellet to a core of 241 assemblies.',tc2:'Look inside the reactor vessel and follow the water through the core.',tc3:'How a reactor is refuelled, and why used fuel always stays underwater.',
tk1:'Take the controls: raise power, lower it, hold it steady, then trip the reactor.',tk2:'The second control: boron dissolved in the water.',tk3:'Watch a reactor follow the turbine with nobody touching the rods.',
tp1:'Make 325 °C water stop boiling.',tp2:'Keep the pressure steady with heaters and spray, and learn what went wrong at Three Mile Island.',tp3:'Follow one drop of water round a primary loop.',
ts1:'The clean side of the plant: steam, turbine, condenser and feedwater.',ts2:'How the generator locks onto the 50 Hz grid.',ts3:'Why two-thirds of the heat goes into the sea.',
td1:'Control, cool, contain: the three jobs behind every safety system.',td2:'The barriers between the fuel and the outside world.',td3:'Four safety trains, diesels and a core catcher: how the EPR is protected.',
tr1:'How much radiation is a lot? Compare everyday doses.',tr2:'Time, distance and shielding: cut your dose on a real job.',tr3:'Exposure vs contamination, and what happens to radioactive waste.',
to1:'Step inside the control room and meet the shift team.',to2:'Start a reactor up, from cold shutdown to full power.',to3:'What operators do in the first minutes when things go wrong.'};
for(var _k in THOOKS)HOOKS[_k]=THOOKS[_k];



