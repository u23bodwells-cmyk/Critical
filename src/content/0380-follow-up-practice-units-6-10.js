/* ---------- follow-up practice: units 6-10 ---------- */
F('t1',[
T(`<h3>Quick recap</h3><ul><li><b>K = °C + 273.15</b></li><li>1 bar = 10<sup>5</sup> Pa; <b>1 MPa = 10 bar</b></li><li><b>Absolute = gauge + about 1 bar</b></li><li><b>Q = m c ΔT</b> (c of water ≈ 4.18 kJ/kg/K at room temperature)</li></ul><div class="callout"><b>Worked example:</b> heat 200 kg of water by 50 °C: 200 × 4.18 × 50 = 41,800 kJ = <b>41.8 MJ</b>.</div>`),
N(`What is 300 °C in kelvin?`,573.15,0.001,'K',`300 + 273.15 = 573.15 K.`),
N(`Steam generator pressure is 7 MPa. What's that in bar?`,70,0.01,'bar',`7 × 10 = 70 bar.`),
N(`How much energy heats 500 kg of water by 20 °C (c = 4.18 kJ/kg/K)? Answer in MJ.`,41.8,0.01,'MJ',`500 × 4.18 × 20 = 41,800 kJ = 41.8 MJ.`,`Q = mcΔT gives kJ here. Divide by 1000 for MJ.`),
N(`The primary circuit has a heat capacity of 1500 MJ/°C, and 15 MW of net heat goes in. How fast does it heat up, in °C per hour?`,36,0.02,'°C per hour',`15 MJ/s ÷ 1500 MJ/°C = 0.01 °C/s. × 3600 = 36 °C per hour.`,`1 MW = 1 MJ per second.`),
Q(`A pressure gauge reads 0 bar(g). What's the absolute pressure?`,['About 1 bar(a)','0 bar(a)','10 bar(a)','155 bar(a)'],0,`Gauge pressure counts from atmospheric, so 0 bar(g) is about 1 bar absolute.`)]);

F('t2',[
T(`<h3>Quick recap</h3><ul><li>The boiling point depends on pressure: 1 bar → 100 °C, 70 bar → about 286 °C, 155 bar → about 345 °C</li><li><b>Subcooling margin = T<sub>sat</sub> − T<sub>hot leg</sub></b></li><li>Lower pressure → lower T<sub>sat</sub> → smaller margin</li></ul>`),
N(`Pressure is 155 bar (T<sub>sat</sub> 345 °C) and the hot leg is at 330 °C. What's the subcooling margin?`,15,0.01,'°C',`345 − 330 = 15 °C.`),
N(`T<sub>sat</sub> at 70 bar is about 286 °C. Water in a steam generator at 70 bar is boiling. What temperature is it?`,286,0.01,'°C',`Boiling water is at its saturation temperature: about 286 °C.`),
Q(`Raising the pressure makes the boiling point…`,['higher','lower','no different'],0,`That's why a PWR is pressurised to 155 bar: so water stays liquid at over 300 °C.`),
Q(`The subcooling margin falls to zero. This means…`,['the hot leg water has reached its boiling point','the reactor has shut down','pressure is very high','the pumps have stopped'],0,`Zero margin means saturated: any more heat or less pressure makes steam.`),
Q(`Temperature rises while pressure stays the same. The subcooling margin…`,['decreases','increases','stays the same'],0,`T<sub>sat</sub> hasn't changed but the water is hotter, so it's closer to boiling.`)]);

F('t3',[
T(`<h3>Quick recap</h3><div class="eq">P = ṁ c ΔT</div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">P</span><span class="km">heat carried away each second (power)</span><span class="ku">watts (W)</span></div><div class="krow"><span class="ks">ṁ</span><span class="km">mass flow rate: kilograms of water passing each second (the dot means “per second”)</span><span class="ku">kg/s</span></div><div class="krow"><span class="ks">c</span><span class="km"><b>specific heat capacity</b>: energy to heat 1 kg by 1 °C</span><span class="ku">J/(kg·°C)</span></div><div class="krow"><span class="ks">ΔT</span><span class="km">“delta T”, the temperature rise (Δ means “change in”)</span><span class="ku">°C</span></div><div class="kn">Careful: this <b>c</b> is <i>not</i> the speed of light. Same letter, different meaning.</div></div><ul><li>ṁ = P ÷ (c ΔT)</li><li>ΔT = P ÷ (ṁ c)</li><li>Watch the units: with c in kJ/kg/K, P comes out in kW</li></ul><div class="callout"><b>Worked example:</b> ṁ = 10,000 kg/s, c = 5.5 kJ/kg/K, ΔT = 30 °C: P = 1,650,000 kW = <b>1650 MW</b>.</div>`),
N(`ṁ = 18,000 kg/s, c = 5.5 kJ/kg/K and ΔT = 30 °C. What's the power, in MW?`,2970,0.01,'MW',`18,000 × 5.5 × 30 = 2,970,000 kW = 2970 MW.`),
N(`P = 3000 MW, ṁ = 20,000 kg/s and c = 5.5 kJ/kg/K. What's ΔT across the core?`,27.3,0.02,'°C',`ΔT = 3,000,000 kW ÷ (20,000 × 5.5) = 27.3 °C.`,`Convert MW to kW first so the units match c.`),
N(`At constant flow, power doubles from 1500 MW. ΔT was 15 °C. What is it now?`,30,0.01,'°C',`P ∝ ΔT at constant flow, so ΔT doubles to 30 °C.`),
Q(`The calorimetric heat balance is measured on…`,['the secondary side: feedwater flow and temperatures at the steam generators','the control rods','the pressuriser','the neutron detectors'],0,`The steam generators' heat balance gives true thermal power, which is used to calibrate the nuclear instruments.`),
Q(`At constant power, coolant flow increases. ΔT across the core…`,['decreases','increases','stays the same'],0,`More flow carries the same heat with a smaller temperature rise.`)]);

F('t4',[
T(`<h3>Quick recap</h3><ul><li>Rankine cycle: feed pump → steam generator → turbine → condenser → back to the feed pump</li><li>Carnot limit: <b>η<sub>max</sub> = 1 − T<sub>cold</sub>/T<sub>hot</sub></b>, temperatures in <b>kelvin</b></li><li>Real PWRs reach about 35%; the rest goes out through the condenser</li></ul><div class="callout"><b>Worked example:</b> 290 °C and 20 °C: 1 − 293/563 = <b>48%</b>.</div>`),
N(`What's the Carnot limit for steam at 300 °C and a condenser at 30 °C, in %?`,47.1,0.02,'%',`1 − 303.15/573.15 = 0.471 = 47.1%.`,`Convert both to kelvin first.`),
N(`A plant is 36% efficient at 4500 MWth. How much heat goes to the sea, in MW (ignoring other losses)?`,2880,0.01,'MW',`64% is rejected: 4500 × 0.64 = 2880 MW.`),
Q(`Where does most of a power station's heat leave the plant?`,['The condenser cooling water','The turbine','The generator','The chimney'],0,`About two thirds of the heat goes into the cooling water through the condenser.`),
Q(`In the Carnot formula, temperatures must be in…`,['kelvin','°C','°F','any unit'],0,`It's a ratio of absolute temperatures, so it only works in kelvin.`),
Q(`If the condenser gets warmer, the plant's efficiency…`,['falls','rises','stays the same'],0,`A higher T<sub>cold</sub> lowers the efficiency limit.`)]);

F('h1',[
T(`<h3>Quick recap</h3><ul><li>Conduction: <b>q = k A ΔT / thickness</b></li><li>Convection: <b>q = h A (T<sub>surface</sub> − T<sub>water</sub>)</b>, or per m<sup>2</sup>: q″ = h ΔT</li><li>Pellet centre − surface = <b>q′ / (4πk)</b>, with k ≈ 3 W/m/K for UO<sub>2</sub></li></ul>`),
N(`Conduction through cladding: k = 15 W/m/K, A = 0.01 m<sup>2</sup>, ΔT = 40 °C, thickness 0.0006 m. What's the heat flow, in W?`,10000,0.01,'W',`q = 15 × 0.01 × 40 ÷ 0.0006 = 6 ÷ 0.0006 = 10,000 W.`,`Multiply the top first: k × A × ΔT.`),
N(`q′ = 18,000 W/m and k = 3 W/m/K. What's the pellet centre − surface temperature difference?`,477.5,0.01,'°C',`18,000 ÷ (4π × 3) = 18,000 ÷ 37.7 = 477 °C.`),
N(`Convection: h = 30,000 W/m²/K and the heat flux is 1.2 MW/m². What's T<sub>surface</sub> − T<sub>water</sub>?`,40,0.01,'°C',`ΔT = q″ ÷ h = 1,200,000 ÷ 30,000 = 40 °C.`),
Q(`Why is a fuel pellet's centre so much hotter than its surface?`,['Uranium dioxide conducts heat poorly','The water is hottest in the middle','The cladding is thickest there','Gamma rays only heat the centre'],0,`Heat is made throughout the pellet, and UO<sub>2</sub> is a poor conductor, so the centre runs hot.`),
Q(`Above about 1200 °C, zirconium cladding…`,['reacts with steam, making hydrogen','melts instantly','becomes a moderator','absorbs all the neutrons'],0,`That reaction made the hydrogen at Fukushima. Accident limits keep cladding below 1204 °C.`)]);

F('h2',[
T(`<h3>Quick recap</h3><ul><li>Boiling curve: convection → <b>nucleate boiling</b> (great) → <b>DNB</b> → film boiling (bad)</li><li><b>DNBR = critical heat flux ÷ actual heat flux</b>, kept above about 1.3</li><li>DNBR gets worse with higher power, lower flow, lower pressure and higher inlet temperature</li></ul>`),
N(`The critical heat flux is 3.0 MW/m² and the actual heat flux is 2.0 MW/m². What's the DNBR?`,1.5,0.01,'',`3.0 ÷ 2.0 = 1.5.`),
N(`The DNBR limit is 1.3 and the critical heat flux is 2.6 MW/m². What's the highest allowed heat flux?`,2,0.01,'MW/m²',`2.6 ÷ 1.3 = 2.0 MW/m².`,`Rearrange DNBR = CHF ÷ actual.`),
Q(`Which boiling regime removes heat best?`,['Nucleate boiling','Film boiling','Convection without boiling','Pure steam'],0,`Small bubbles forming and leaving carry heat away very effectively.`),
Q(`Past the critical heat flux, the surface temperature…`,['jumps up sharply','drops','stays the same'],0,`A steam blanket insulates the surface, so its temperature shoots up.`),
Q(`Which change increases DNBR (more margin)?`,['Higher coolant flow','Higher power','Lower pressure','Higher inlet temperature'],0,`More flow carries heat away better and raises the critical heat flux.`)]);

F('h3',[
T(`<h3>Quick recap</h3><ul><li>Continuity: <b>ṁ = ρ A v</b>, so a narrower pipe means faster water</li><li>Bernoulli: faster water means <b>lower pressure</b></li><li>If pressure falls below the vapour pressure, bubbles form and collapse: <b>cavitation</b></li><li>Pumps need enough NPSH to avoid it</li></ul>`),
N(`ṁ = 5000 kg/s, ρ = 750 kg/m³ and A = 0.5 m². What's the velocity?`,13.33,0.02,'m/s',`v = ṁ ÷ (ρA) = 5000 ÷ (750 × 0.5) = 13.3 m/s.`,`Rearrange ṁ = ρAv.`),
N(`A pipe narrows to a quarter of its area. By what factor does the velocity change?`,4,0.01,'times',`Area ÷ 4, so velocity × 4.`),
Q(`Where a pipe narrows, the water pressure…`,['falls','rises','stays the same'],0,`The water speeds up, and by Bernoulli its pressure drops.`),
Q(`Which are signs of a cavitating pump?`,['Noise, vibration and falling flow','A quieter pump','Higher flow','Colder water'],0,`Collapsing bubbles sound like gravel and damage the impeller.`),
Q(`Which increases the NPSH available to a pump?`,['Raising the pressure at the pump inlet','Heating the water at the inlet','Lowering the inlet pressure','Running the pump faster'],0,`More inlet pressure keeps the water further above its vapour pressure.`)]);

F('h4',[
T(`<h3>Quick recap</h3><ul><li>Hot water is less dense, so it rises; cold water sinks</li><li>Natural circulation needs the <b>heat sink above the heat source</b></li><li>Flow grows with the density difference and the height difference</li><li>It only needs to carry decay heat: a few % of full power</li></ul>`),
Q(`For natural circulation, the heat sink must be…`,['above the heat source','below the heat source','at the same height'],0,`Cooled, denser water sinks back down to the core.`),
Q(`Natural circulation flow increases with…`,['a bigger density difference and a bigger height difference','less heat','a smaller height difference','closed valves'],0,`Both increase the buoyancy driving the flow.`),
Q(`For natural circulation to remove decay heat, the steam generators must…`,['be supplied with feedwater','be empty','be isolated','be drained'],0,`The steam generators are the heat sink. Without feedwater they boil dry.`),
N(`Decay heat is 45 MW. Natural circulation gives a core ΔT of 40 °C, and c = 5.5 kJ/kg/K. What flow is needed, in kg/s?`,204.5,0.02,'kg/s',`ṁ = 45,000 kW ÷ (5.5 × 40) = 205 kg/s: about 1% of pumped flow.`,`ṁ = P ÷ (c ΔT), with P in kW.`),
Q(`Hot water rises because…`,['it\'s less dense','it\'s heavier','pumps push it','it\'s radioactive'],0,`Less dense fluid floats up through denser fluid.`)]);

F('p1',[
T(`<h3>Quick recap</h3><ul><li><b>Gray (Gy)</b> = 1 J absorbed per kg</li><li><b>Equivalent dose (Sv) = absorbed dose (Gy) × weighting factor</b>: gamma/beta 1, neutrons 2.5–20, alpha 20</li><li>UK: average 2.7 mSv/yr; classified worker limit 20 mSv/yr; public limit 1 mSv/yr</li></ul>`),
N(`An organ absorbs 0.2 mGy of gamma radiation (weighting factor 1). What's the equivalent dose?`,0.2,0.01,'mSv',`0.2 × 1 = 0.2 mSv.`),
N(`A neutron dose of 0.1 mGy has a weighting factor of 10. What's the equivalent dose?`,1,0.01,'mSv',`0.1 × 10 = 1 mSv.`),
N(`A worker's limit is 20 mSv a year and they've had 3.5 mSv so far. How much more is allowed?`,16.5,0.01,'mSv',`20 − 3.5 = 16.5 mSv. In practice, ALARP and local limits keep doses far lower.`),
Q(`1 gray means…`,['1 joule of energy absorbed per kg','1 decay per second','1 joule per second','1 millisievert'],0,`1 Gy = 1 J/kg. Becquerels count decays per second.`),
Q(`What's the average annual dose from all sources in the UK?`,['About 2.7 mSv','About 20 mSv','About 0.01 mSv','About 100 mSv'],0,`About 2.7 mSv, roughly half of it from radon gas.`)]);

F('p2',[
T(`<h3>Quick recap</h3><ul><li><b>Dose = dose rate × time</b></li><li>Inverse square law: double the distance → ¼ of the dose rate</li><li>Each half-value layer (HVL) halves the dose rate</li></ul><div class="callout"><b>Worked example:</b> 80 µSv/h at 1 m. At 2 m: 80 ÷ 4 = 20 µSv/h. Behind 1 HVL: <b>10 µSv/h</b>.</div>`),
N(`The dose rate is 120 µSv/h and you work for 15 minutes. What dose do you get?`,30,0.01,'µSv',`120 × 0.25 h = 30 µSv.`,`15 minutes is 0.25 hours.`),
N(`The dose rate is 100 µSv/h at 2 m from a small source. What is it at 1 m?`,400,0.01,'µSv/h',`Half the distance → 4 times the dose rate: 400 µSv/h.`),
N(`The HVL of lead is 12 mm. What fraction of the dose rate gets through 24 mm?`,0.25,0.01,'',`24 mm is 2 HVLs: ½ × ½ = 0.25.`),
N(`A source gives 2 mSv/h at 1 m. You work at 2 m behind one HVL of lead for 30 minutes. What dose do you get?`,0.125,0.02,'mSv',`At 2 m: 2 ÷ 4 = 0.5 mSv/h. Behind 1 HVL: 0.25 mSv/h. × 0.5 h = 0.125 mSv.`,`Apply distance, then shielding, then time.`),
Q(`By the inverse square law, tripling the distance reduces the dose rate by…`,['9 times','3 times','6 times','27 times'],0,`3<sup>2</sup> = 9.`)]);

F('p3',[
T(`<h3>Quick recap</h3><ul><li><b>Irradiation</b>: exposed to radiation from a source</li><li><b>Contamination</b>: radioactive material in the wrong place. It can spread and be breathed in or swallowed</li><li><b>ALARP</b>: keep doses as low as reasonably practicable, not just below limits</li></ul>`),
Q(`Contamination is…`,['radioactive material where it shouldn\'t be','being near a source','a dose limit','a type of shielding'],0,`Contamination is stuff; irradiation is exposure.`),
Q(`Why is swallowing or breathing in alpha emitters especially harmful?`,['Alpha deposits its energy densely in nearby tissue','Alpha goes through lead','Alpha produces neutrons','Alpha is completely harmless'],0,`Outside the body, skin stops alpha. Inside, it hits living cells directly, which is why its weighting factor is 20.`),
Q(`ALARP stands for…`,['as low as reasonably practicable','always low and really protected','a limit of 1 mSv','alarm level'],0,`It's a UK legal duty, not just a guideline.`),
Q(`A cheap lead shield would noticeably cut the dose for a job that's already below the limits. ALARP says…`,['use the shield, because the saving is reasonably practicable','skip it, because the dose is already below the limit','do the job twice','remove dosimeters'],0,`Being under the limit isn't enough. If a reasonable step reduces dose, take it.`),
Q(`Where are contamination monitors placed?`,['At the exits from controlled areas','In the turbine hall office','In the car park','On the reactor vessel'],0,`Everyone and everything leaving is checked so contamination doesn't spread.`)]);

F('s1',[
T(`<h3>Quick recap</h3><ul><li><b>Primary</b>: 155 bar water, core → steam generators. Radioactive.</li><li><b>Secondary</b>: steam generators → turbine → condenser. Kept separate.</li><li><b>Cooling water</b>: sea water cools the condenser at UK coastal sites</li><li>Each Hinkley Point C EPR: 4 loops (steam generator + pump each) and 1 pressuriser</li></ul>`),
Q(`Which circuit carries radioactive water?`,['Primary','Secondary','Sea water'],0,`The primary water passes through the core.`),
Q(`What cools the condenser at UK coastal sites like Hinkley Point?`,['Sea water','Primary coolant','Boron','Steam'],0,`Sea water is pumped through the condenser tubes and returned to the sea slightly warmer.`),
Q(`How many primary loops does each Hinkley Point C reactor have?`,['4','2','1','8'],0,`Four loops, each with a steam generator and a reactor coolant pump.`),
Q(`The pressuriser is connected to…`,['a hot leg of the primary circuit','the turbine','the condenser','the sea'],0,`It sits on one hot leg and sets the pressure for the whole primary circuit.`),
O(`Follow the heat from the fuel to the sea.`,['Fuel heats the primary water','Primary water heats secondary water in the steam generators','Steam drives the turbine','The condenser passes leftover heat to sea water'],`Electricity comes from the generator on the turbine shaft.`)]);

F('s2',[
T(`<h3>Quick recap</h3><ul><li>The pressuriser holds water and steam at saturation</li><li><b>Heaters</b> raise pressure; <b>spray</b> (from a cold leg) lowers it</li><li>Coolant heats up → <b>insurge</b>: level and pressure rise</li><li>Coolant cools → <b>outsurge</b>: level and pressure fall</li></ul>`),
Q(`The primary coolant heats up and expands. Pressuriser level and pressure…`,['both rise (insurge)','both fall','level rises, pressure falls','don\'t change'],0,`Water surges in and compresses the steam space.`),
Q(`Pressure is too low. Which action raises it?`,['Turn on the heaters','Open the spray','Open a relief valve','Turn the heaters down'],0,`Heaters boil more water into steam, raising the pressure.`),
Q(`Where does pressuriser spray water come from?`,['A cold leg','The sea','The condenser','The turbine'],0,`Cooler cold-leg water is sprayed into the steam space to condense steam.`),
Q(`The pressuriser contains…`,['water and steam at saturation','only water','only nitrogen gas','only steam'],0,`Keeping water and steam together at saturation is what lets temperature control the pressure.`),
Q(`A key lesson from the relief valve at Three Mile Island was…`,['show the valve\'s real position, and train operators to check other symptoms','never use relief valves','always reduce emergency cooling','turn off alarms'],0,`The light showed the command, not the valve's actual position.`)]);

F('s3',[
T(`<h3>Quick recap</h3><ul><li>Steam generator level is controlled with feedwater. Too low: lose the heat sink. Too high: water carried into the turbine.</li><li><b>Swell</b> (demand up) and <b>shrink</b> (demand down) make level control tricky</li><li>Generator speed: <b>rpm = 120 × f ÷ poles</b></li></ul>`),
N(`A 2-pole generator runs on the 50 Hz grid. What speed does it turn at?`,3000,0.001,'rpm',`120 × 50 ÷ 2 = 3000 rpm.`),
N(`A 4-pole generator runs on a 60 Hz grid (as in the USA). What speed does it turn at?`,1800,0.001,'rpm',`120 × 60 ÷ 4 = 1800 rpm.`),
Q(`Steam demand drops suddenly. Steam generator level first…`,['falls (shrink), then recovers','rises','stays the same'],0,`Steam pressure rises, bubbles collapse, and the level shrinks for a while.`),
Q(`What's the risk of steam generator level being too high?`,['Water carried over into the turbine','Losing the heat sink','Cavitating the reactor coolant pumps','Diluting the boron'],0,`Water droplets at high speed can damage turbine blades.`),
Q(`When the turbine trips, steam dump valves send steam to…`,['the condenser','the pressuriser','the reactor core','the generator'],0,`The turbine bypass dumps steam straight to the condenser, keeping a heat sink for the reactor.`)]);

F('s4',[
T(`<h3>Quick recap</h3><table><tr><th>Range</th><th>Detector</th><th>Reads</th></tr><tr><td>Source</td><td>BF<sub>3</sub> counter or fission chamber</td><td>counts per second</td></tr><tr><td>Intermediate</td><td>compensated ion chamber</td><td>amps</td></tr><tr><td>Power</td><td>uncompensated ion chamber</td><td>% power</td></tr></table><p>The ranges overlap so there's never a gap in indication.</p>`),
Q(`Which range counts individual pulses?`,['Source range','Intermediate range','Power range'],0,`At very low power, each neutron makes a separate pulse that can be counted.`),
Q(`Which range reads directly in % of full power?`,['Power range','Source range','Intermediate range'],0,`Power range channels feed the high-power trips.`),
Q(`During a startup, before switching off the source range, operators confirm…`,['overlap with the intermediate range','full power','that the turbine is on line','that boron is zero'],0,`There must never be a gap in neutron indication.`),
Q(`Intermediate range ion chambers are compensated to cancel…`,['current caused by gamma rays','current caused by neutrons','temperature effects','noise from pumps'],0,`At low power, gamma current could swamp the small neutron signal.`),
N(`A power range detector gives 200 µA at 100% power, and its current is proportional to power. What current does it give at 30%?`,60,0.01,'µA',`200 × 0.30 = 60 µA.`)]);

F('s5',[
T(`<h3>Quick recap</h3><ul><li>Barriers, inside out: pellet → cladding → coolant pressure boundary → containment</li><li><b>Redundant</b>: several identical channels</li><li><b>Diverse</b>: different methods, so one common fault can't defeat them all</li><li><b>Fail-safe</b>: a failure puts the plant into a safe state</li><li>2-out-of-4 voting: 2 channels needed to trip</li></ul>`),
Q(`Redundant means…`,['several identical channels, so one failure doesn\'t lose the function','different ways of measuring','failing into a safe state','very old'],0,`For example, four identical pressure channels.`),
Q(`Diverse means…`,['different methods or equipment, so one common fault can\'t defeat them all','several identical channels','failing into a safe state','extra fast'],0,`For example, tripping on both high flux and high temperature.`),
Q(`Fail-safe means…`,['a failure, such as losing power, puts the plant in a safe state like a trip','it never fails','it fails to trip','it needs operator action'],0,`Rod drives hold rods up with electromagnets: lose power and the rods drop.`),
N(`With 2-out-of-4 logic, what's the minimum number of channels that must trip to trip the reactor?`,2,0.001,'channels',`Two. One faulty channel alone can't cause or block a trip.`),
Q(`What is the first, innermost barrier to the release of radioactive material?`,['The ceramic fuel pellet','The containment building','The cladding','The pressure boundary'],0,`The pellet itself traps most fission products.`)]);

F('s6',[
T(`<h3>Quick recap</h3><ul><li>Neutrons make vessel steel brittle up to a <b>higher temperature</b>, so pressure must be low when it's cold</li><li>Heat-up and cool-down rates are limited (about 55 °C per hour)</li><li>Chemistry: boric acid (reactivity), lithium hydroxide (balances acidity), hydrogen (removes oxygen)</li><li>Activated corrosion products like cobalt-60 give most outage dose</li></ul>`),
N(`The cool-down limit is 55 °C per hour. What's the fastest you can cool from 290 °C to 70 °C, in hours?`,4,0.01,'hours',`220 ÷ 55 = 4 hours.`,`Find the temperature change first.`),
Q(`Years of neutron irradiation make reactor vessel steel…`,['brittle up to a higher temperature than when new','stronger and tougher','non-magnetic','completely unaffected'],0,`That shifts the pressure–temperature limits as the plant ages.`),
Q(`Lithium hydroxide is added to primary coolant to…`,['balance the boric acid\'s acidity and reduce corrosion','absorb neutrons','remove oxygen','raise pressure'],0,`It keeps the pH in the right range.`),
Q(`Most of the dose to workers during outages comes from…`,['activated corrosion products like cobalt-60','boron','uranium in the turbine hall','sea water'],0,`Corrosion products pass through the core, become radioactive, and settle around the circuit.`),
Q(`Pressurised thermal shock is…`,['cold water hitting a hot vessel at high pressure','pressure rising too slowly','a turbine trip','hot water in a cold pump'],0,`The cold surface shrinks and is stressed while pressure adds more stress: a fracture risk in brittle steel.`)]);

F('o1',[
T(`<h3>Quick recap</h3><ul><li><b>STAR</b>: Stop, Think, Act, Review</li><li><b>Three-way communication</b>: send, repeat back, confirm</li><li><b>Peer check</b>: a colleague confirms the right component and action before you act</li><li><b>Questioning attitude</b> and <b>conservative decisions</b>: if unsure, make the plant safe and stable</li></ul>`),
Q(`In three-way communication, after the sender gives the instruction, the receiver…`,['repeats it back','acts immediately','ignores it','only writes it down'],0,`Then the sender confirms the repeat-back is correct.`),
Q(`A peer check means…`,['a colleague watches and confirms the right component and action before you act','checking afterwards only','asking a member of the public','using a computer'],0,`Two people catch more slips than one.`),
Q(`A questioning attitude means…`,['if something seems wrong, stop and find out why','never asking questions','always assuming instruments are right','trusting the first indication you see'],0,`Unexpected indications are clues, not nuisances.`),
Q(`You're not sure a valve is the right one. What's the best action?`,['Stop, check the label against the procedure, and use a peer check','Operate it and see what happens','Ask someone else to operate it without telling them','Guess'],0,`Wrong-component errors are one of the most common slips in industry.`),
O(`Put STAR in order.`,['Stop','Think','Act','Review'],`Two seconds of STAR before every action prevents a lot of mistakes.`)]);

F('o2',[
T(`<h3>Quick recap</h3><ul><li><b>Three Mile Island (1979)</b>: stuck-open relief valve, misleading indication, emergency cooling reduced</li><li><b>Chernobyl (1986)</b>: unstable low-power state, positive void coefficient, graphite rod tips, prompt critical</li><li><b>Fukushima (2011)</b>: tsunami caused a station blackout, so decay heat couldn't be removed</li></ul>`),
Q(`What really happened to the relief valve at Three Mile Island?`,['It stuck open','It never opened','It exploded','It had been removed'],0,`Coolant kept escaping while the panel suggested the valve was shut.`),
Q(`Why did Chernobyl's control rods briefly add reactivity when inserted?`,['Graphite tips at the bottom of the rods displaced water','There was boron in the tips','There was water in the rods','Steam pushed them out'],0,`Graphite (a moderator) replaced water (an absorber) at the bottom of the core.`),
Q(`At Fukushima, why did the cores melt?`,['Decay heat couldn\'t be removed after power and cooling were lost','The reactors didn\'t shut down','They went prompt critical','Sabotage'],0,`The reactors shut down; the problem was removing decay heat.`),
Q(`Which idea came out of the Chernobyl investigations?`,['Safety culture','Station blackout planning','Better relief valve indication','Tsunami walls'],0,`The term "safety culture" was coined in the investigations after Chernobyl.`),
Q(`Which accident led to big improvements in control room design and simulator training?`,['Three Mile Island','Fukushima','Chernobyl','None of them'],0,`TMI triggered major changes in human factors, procedures and training.`)]);

F('o3',[
T(`<h3>Quick recap</h3><ul><li>Calculate the <b>estimated critical position (ECP)</b> first, allowing for boron, xenon, samarium and temperature</li><li>Approach criticality in steps using <b>1/M</b></li><li>Keep startup rate below about <b>1 DPM</b></li><li>Above the <b>point of adding heat</b>, feedback slows the rise</li></ul><div class="callout"><b>Worked example:</b> last critical at 50%, xenon now −100 pcm, rods worth 10 pcm/%: rods must add +100 pcm more, so ECP ≈ <b>60%</b>.</div>`),
N(`Last time, the reactor went critical at 55% rod withdrawal. Today xenon adds −150 pcm and nothing else has changed. Rods are worth 10 pcm per % there. What's the ECP?`,70,0.01,'% withdrawn',`The rods must add an extra +150 pcm: 150 ÷ 10 = 15% more, so 70%.`,`More negative xenon means the rods must come out further.`),
N(`During the approach, the count rate rises from 40 cps to 160 cps. What's 1/M?`,0.25,0.01,'',`40 ÷ 160 = 0.25.`),
Q(`During a startup, the startup rate is normally kept below about…`,['1 DPM','10 DPM','0 DPM','100 DPM'],0,`That gives operators plenty of time to respond.`),
Q(`Above the point of adding heat, with rods stopped, the startup rate…`,['falls off as temperature feedback acts','rises sharply','stays constant forever'],0,`Heat raises temperatures, and the negative coefficients take reactivity away.`),
Q(`The ECP must allow for…`,['boron, xenon, samarium and temperature','the weather','turbine speed','generator voltage'],0,`Each of these changes the reactivity the rods have to provide.`)]);

