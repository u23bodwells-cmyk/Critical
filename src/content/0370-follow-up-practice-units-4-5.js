/* ---------- follow-up practice: units 4-5 ---------- */
F('r1',[
T(`<h3>Quick recap</h3><div class="eq">k = neutrons this generation ÷ neutrons last generation</div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">k</span><span class="km">multiplication factor: 1 = critical (steady), above 1 = growing, below 1 = dying away</span><span class="ku">no unit</span></div></div><ul><li>k &lt; 1: <b>subcritical</b>, power falling</li><li>k = 1: <b>critical</b>, power steady (at any level)</li><li>k &gt; 1: <b>supercritical</b>, power rising</li><li>After n generations: <b>N = N<sub>0</sub> k<sup>n</sup></b></li></ul><div class="callout"><b>Worked example:</b> 1000 neutrons, k = 0.9: next generation 900, then 810.</div>`),
N(`There are 1000 neutrons and k = 1.01. How many are there one generation later?`,1010,0.001,'',`1000 × 1.01 = 1010.`),
N(`There are 100 neutrons and k = 0.5. How many are left after 3 generations?`,12.5,0.01,'',`100 × 0.5 × 0.5 × 0.5 = 12.5.`,`Multiply by k once per generation.`),
Q(`Power is falling steadily after rods were inserted. The reactor is…`,['subcritical','critical','supercritical'],0,`Falling power means each generation is smaller than the last: k &lt; 1.`),
Q(`A reactor is running steadily at 0.001% power. It is…`,['subcritical','critical','supercritical'],1,`Steady power at any level, even tiny, means k = 1.`),
N(`Start with 1000 neutrons and k = 1.002. Using N = N<sub>0</sub>k<sup>n</sup>, how many are there after 500 generations?`,2716,0.02,'',`1000 × 1.002<sup>500</sup> = 1000 × 2.72 ≈ 2716. A tiny excess over 1 adds up fast.`,`Use the x<sup>y</sup> button: 1.002<sup>500</sup>.`)]);

F('r2',[
T(`<h3>Quick recap</h3><div class="eq">k = ε · L<sub>f</sub> · p · L<sub>t</sub> · f · η</div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">k</span><span class="km">neutrons in one generation ÷ neutrons in the one before. 1 = steady</span><span class="ku">no unit</span></div><div class="krow"><span class="ks">ε</span><span class="km">“epsilon”, fast fission factor: extra neutrons from fast fissions</span><span class="ku">no unit (about 1.03)</span></div><div class="krow"><span class="ks">L<sub>f</sub></span><span class="km">chance a fast neutron <b>doesn’t</b> leak out of the core</span><span class="ku">no unit (0 to 1)</span></div><div class="krow"><span class="ks">p</span><span class="km">chance a neutron slows down without being captured on the way</span><span class="ku">no unit (0 to 1)</span></div><div class="krow"><span class="ks">L<sub>t</sub></span><span class="km">chance a slow neutron doesn’t leak out</span><span class="ku">no unit (0 to 1)</span></div><div class="krow"><span class="ks">f</span><span class="km">fraction of slow neutrons absorbed in the fuel (not elsewhere)</span><span class="ku">no unit (0 to 1)</span></div><div class="krow"><span class="ks">η</span><span class="km">“eta”, new neutrons made per neutron absorbed in the fuel</span><span class="ku">no unit (about 2)</span></div><div class="kn">The dots mean multiply.</div></div><ul><li><b>ε</b>: fast fission bonus</li><li><b>L<sub>f</sub>, L<sub>t</sub></b>: fractions that don't leak out (fast, thermal)</li><li><b>p</b>: fraction that escape U-238 resonance capture while slowing</li><li><b>f</b>: fraction of thermal absorptions that happen in fuel</li><li><b>η</b>: new neutrons per thermal neutron absorbed in fuel</li></ul>`),
Q(`Which factor is the chance that a slowing-down neutron avoids capture in U-238's resonances?`,['p','f','η','ε'],0,`p is the resonance escape probability.`),
Q(`Inserting control rods mainly reduces which factor?`,['f (thermal utilisation)','ε','η','p'],0,`Rods absorb thermal neutrons, so fewer thermal absorptions happen in the fuel: f falls.`),
N(`ε = 1.02, L<sub>f</sub> = 0.96, p = 0.78, L<sub>t</sub> = 0.98, f = 0.71, η = 1.9. What is k?`,1.0097,0.003,'',`1.02 × 0.96 × 0.78 × 0.98 × 0.71 × 1.9 = 1.010: just supercritical.`,`Multiply all six together.`),
Q(`A bigger core lets fewer neutrons leak out. Which factors go up?`,['L<sub>f</sub> and L<sub>t</sub>','p and f','η and ε','Only η'],0,`The non-leakage factors are the fractions that stay in the core.`),
N(`f = 0.7 and η = 1.8. For every 1000 thermal neutrons absorbed anywhere in the core, how many new fast neutrons are made?`,1260,0.01,'',`1000 × 0.7 = 700 absorbed in fuel. 700 × 1.8 = 1260 new neutrons.`,`First find how many are absorbed in the fuel.`)]);

F('r3',[
T(`<h3>Quick recap</h3><ul><li>A good moderator has <b>light nuclei</b>, <b>scatters often</b> and <b>absorbs very little</b></li><li>Collisions to thermalise: light water ≈ 20, heavy water ≈ 35, graphite ≈ 115</li><li>PWRs are <b>undermoderated</b>: hotter water → less moderation → k falls</li></ul>`),
Q(`Which is NOT a property of a good moderator?`,['Light nuclei','A large scattering cross section','A large absorption cross section','A small absorption cross section'],2,`A moderator should slow neutrons down without swallowing them.`),
Q(`Why does graphite need about 115 collisions to thermalise a neutron?`,['Carbon nuclei are much heavier than neutrons, so each collision takes less energy','Graphite absorbs neutrons','Carbon is radioactive','Graphite is a liquid'],0,`Carbon-12 is 12 times heavier than a neutron, so each bounce removes only a modest share of the energy.`),
N(`Fission neutrons start at 2 MeV and thermal neutrons have 0.025 eV. How many times less energy is that? Give the number in front of × 10<sup>7</sup>.`,8,0.01,'× 10⁷ times',`2 × 10<sup>6</sup> ÷ 0.025 = 8 × 10<sup>7</sup>.`,`Convert 2 MeV to eV first.`),
Q(`In an undermoderated core, the moderator temperature coefficient is…`,['negative','positive','zero'],0,`Hotter water is less dense, so there's less moderation and k falls.`),
Q(`Why is PWR fuel enriched, while CANDU reactors can use natural uranium?`,['Light water absorbs more neutrons than heavy water','Light water is a worse moderator per collision','PWRs are smaller','CANDU uses graphite'],0,`Ordinary hydrogen absorbs some neutrons; deuterium hardly any. PWRs make up the loss with extra U-235.`)]);

F('r4',[
T(`<h3>Quick recap</h3><div class="eq">ρ = (k − 1) / k</div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">ρ</span><span class="km">“rho”, <b>reactivity</b>: how far from exactly critical. 0 = critical, + = power rising, − = falling</span><span class="ku">no unit (often given in pcm)</span></div><div class="krow"><span class="ks">k</span><span class="km">the multiplication factor (neutrons now ÷ neutrons last generation)</span><span class="ku">no unit</span></div></div><ul><li>pcm = Δk/k × 100,000</li><li>Near k = 1, ρ ≈ (k − 1) × 100,000 pcm</li><li>Reactivity effects <b>add up</b></li><li>1 dollar ($) = β ≈ 650 pcm</li></ul><div class="callout"><b>Worked example:</b> k = 1.003: ρ = 0.003 ÷ 1.003 = 0.00299 = <b>299 pcm</b>.</div>`),
N(`k = 1.005. What's ρ in pcm?`,497.5,0.01,'pcm',`(1.005 − 1) ÷ 1.005 = 0.004975 = 497.5 pcm.`,`Work out (k − 1)/k, then × 100,000.`),
N(`k = 0.95. What's ρ in pcm?`,-5263,0.01,'pcm',`(0.95 − 1) ÷ 0.95 = −0.0526 = −5263 pcm.`),
N(`Rods add +150 pcm, a temperature rise adds −40 pcm and xenon adds −30 pcm. What's the total?`,80,0.01,'pcm',`150 − 40 − 30 = +80 pcm.`,`Reactivities simply add.`),
N(`ρ = 325 pcm and β = 650 pcm. What's that in dollars?`,0.5,0.01,'$',`325 ÷ 650 = 0.5 $, or 50 cents.`),
Q(`ρ = −500 pcm. The reactor is…`,['subcritical','critical','supercritical'],0,`Negative reactivity means k &lt; 1.`)]);

F('r5',[
T(`<h3>Quick recap</h3><ul><li>Multiplication <b>M = 1/(1 − k)</b>, and count rate is proportional to M</li><li><b>1/M = first count rate ÷ new count rate</b></li><li>Extend a line through the last two 1/M points to zero to predict criticality</li></ul><div class="callout"><b>Worked example:</b> 1/M = 0.8 at 20% rods and 0.6 at 30%. It falls 0.2 per 10%, so it reaches zero after another 30%: about <b>60%</b>.</div>`),
N(`k = 0.9. What's M?`,10,0.01,'',`1 ÷ (1 − 0.9) = 1 ÷ 0.1 = 10.`),
N(`k = 0.98. What's M?`,50,0.01,'',`1 ÷ 0.02 = 50.`),
N(`The count rate was 50 cps at the start and is now 250 cps. What's 1/M?`,0.2,0.01,'',`50 ÷ 250 = 0.2.`,`First count rate ÷ new count rate.`),
Q(`1/M is 0.6 at 40% rod withdrawal and 0.3 at 50%. Where does a straight line predict criticality?`,['55%','60%','70%','80%'],1,`1/M fell 0.3 in 10%. Another 0.3 drop takes it to zero, so about 60%.`,`How much does 1/M fall per 10%?`),
Q(`After a rod step, the count rate doubles. Compared with before, the reactor is…`,['twice as close to critical: (1 − k) has halved','exactly critical','twice as far from critical','supercritical'],0,`Count rate ∝ 1/(1 − k). If it doubles, 1 − k has halved.`)]);

F('r6',[
T(`<h3>Quick recap</h3><ul><li><b>Integral worth</b>: total reactivity from inserting to a given depth (S-shaped curve)</li><li><b>Differential worth</b>: reactivity per % of travel at that depth (a hump, biggest mid-core)</li><li>Reactivity from a move = differential worth × distance</li><li>On a trip, rods fall in by gravity in about 2 s</li></ul>`),
N(`Rods move 10% where they're worth 6 pcm/%, then another 10% where they're worth 4 pcm/%. What's the total reactivity change, in pcm?`,100,0.01,'pcm',`(10 × 6) + (10 × 4) = 60 + 40 = 100 pcm.`,`Work out each part separately, then add.`),
Q(`Where is differential rod worth greatest?`,['Near the middle of the core','At the very top','At the very bottom','It\'s the same everywhere'],0,`Flux is highest mid-core, so rod tips there absorb the most.`),
Q(`What shape is a graph of integral rod worth against insertion?`,['An S-shaped curve','A straight line','A hump','Flat'],0,`It rises slowly, then steeply through mid-core, then slowly again.`),
N(`Rods are inserted 20% where they're worth 5 pcm per %. What's the reactivity change? Include the sign.`,-100,0.01,'pcm',`Inserting adds negative reactivity: −(20 × 5) = −100 pcm.`),
Q(`On a reactor trip, the rods go in…`,['by gravity, in about 2 seconds','by motors, over 2 minutes','by boron injection','by hand'],0,`The rod drives release the rods, and gravity drops them in.`)]);

F('r7',[
T(`<h3>Quick recap</h3><ul><li>Boron worth ≈ <b>−10 pcm per ppm</b> (varies through the cycle)</li><li><b>Dilution</b> (less boron) adds +reactivity; <b>boration</b> adds −reactivity</li><li>Boron is slow and even: used for burnup and xenon, not trips</li><li>Feed and bleed: <b>C = C<sub>0</sub>e<sup>−Ft/V</sup></b></li></ul><div class="callout"><b>Worked example:</b> worth −10 pcm/ppm, dilute 20 ppm: Δρ = −10 × (−20) = <b>+200 pcm</b>.</div>`),
N(`Boron worth is −8 pcm/ppm. You borate by 25 ppm. What's the reactivity change? Include the sign.`,-200,0.01,'pcm',`−8 × (+25) = −200 pcm.`,`Δρ = worth × change in ppm.`),
N(`You need −150 pcm, and boron worth is −10 pcm/ppm. By how much must boron change? Include the sign.`,15,0.01,'ppm',`−150 ÷ −10 = +15 ppm: borate by 15 ppm.`),
N(`C<sub>0</sub> = 1000 ppm and F/V = 0.01 per minute. What's the concentration after 10 minutes of feed and bleed?`,904.8,0.01,'ppm',`1000 × e<sup>−0.01 × 10</sup> = 1000 × e<sup>−0.1</sup> = 905 ppm.`,`Work out Ft/V first.`),
Q(`What is soluble boron mainly used for?`,['Slow changes such as fuel burnup and xenon','Tripping the reactor','Fast power changes','Raising pressure'],0,`It spreads evenly and changes slowly, so it suits slow, long-term changes.`),
Q(`Diluting the coolant…`,['adds positive reactivity','adds negative reactivity','has no effect'],0,`Less boron means fewer neutrons absorbed, so k rises.`)]);

F('r8',[
T(`<h3>Quick recap</h3><div class="eq">Δρ = coefficient × change</div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">Δρ</span><span class="km">change in reactivity</span><span class="ku">pcm</span></div><div class="krow"><span class="ks">coefficient</span><span class="km">how much reactivity changes per unit of change</span><span class="ku">e.g. pcm per °C</span></div><div class="krow"><span class="ks">change</span><span class="km">how much the temperature (or power) changed</span><span class="ku">e.g. °C</span></div></div><ul><li><b>Doppler</b> (fuel temperature): negative, acts within seconds</li><li><b>MTC</b> (moderator temperature): negative at power</li><li>So cooler coolant → <b>positive</b> reactivity</li></ul><div class="callout"><b>Worked example:</b> MTC −30 pcm/°C, coolant heats by 2 °C: Δρ = −30 × 2 = <b>−60 pcm</b>.</div>`),
N(`The Doppler coefficient is −2.5 pcm/°C. The fuel heats up by 100 °C. What's the reactivity change?`,-250,0.01,'pcm',`−2.5 × 100 = −250 pcm.`),
N(`The MTC is −20 pcm/°C. The coolant heats up by 3 °C. What's the reactivity change?`,-60,0.01,'pcm',`−20 × 3 = −60 pcm.`),
N(`+100 pcm is added, and the MTC is −25 pcm/°C. By how many °C must the coolant heat up to cancel it?`,4,0.01,'°C',`100 ÷ 25 = 4 °C.`,`How many lots of −25 pcm cancel +100 pcm?`),
Q(`Which feedback acts within seconds of a power change?`,['Doppler','Xenon','Samarium','Boron'],0,`The fuel heats up almost immediately, so Doppler acts first.`),
Q(`A steam line break suddenly cools the primary coolant. With a negative MTC, this…`,['adds positive reactivity','adds negative reactivity','has no effect'],0,`Cooling with a negative coefficient adds reactivity, which is why overcooling events are analysed carefully.`)]);

F('r9',[
T(`<h3>Quick recap</h3><ul><li>Chain: Te-135 → I-135 (6.6 h) → Xe-135 (9.1 h) → Cs-135</li><li>Xenon is removed by <b>decay</b> and <b>burnout</b></li><li>After a trip: burnout stops, iodine keeps feeding xenon, so it <b>peaks about 9–11 hours later</b></li><li>After a power increase: burnout rises first, so xenon <b>dips</b>, then builds to a higher level</li></ul>`),
Q(`Power is suddenly increased. What does xenon do first?`,['Falls as burnout increases, then rises to a higher level','Rises immediately','Stays exactly the same','Disappears completely'],0,`Burnout responds instantly to the higher flux; extra production from iodine takes hours to arrive.`),
N(`Xenon is worth −3000 pcm and simply decays with a 9.1 h half-life. What's it worth 9.1 h later?`,-1500,0.01,'pcm',`One half-life halves it: −1500 pcm.`),
Q(`Most xenon-135 in a reactor comes from…`,['the decay of iodine-135','fission directly','boron','the control rods'],0,`About 95% comes through the iodine decay chain.`),
Q(`Why is restarting soon after a trip hard near the end of a fuel cycle?`,['Xenon builds up and needs more positive reactivity than may be available','There\'s too much boron','There\'s too little xenon','Pressure is too high'],0,`At end of cycle there's little boron left to dilute, so the xenon peak can lock you out.`),
O(`Put these in order after a trip from full power.`,['Trip: xenon burnout stops','Xenon rises as iodine decays into it','Xenon peaks about 9–11 hours later','Xenon decays away over the next day or two'],`This shape is why operators plan restarts carefully after a trip.`)]);

F('r10',[
T(`<h3>Quick recap</h3><ul><li><b>Sm-149</b>: made from Pm-149 (53 h half-life), <b>stable</b>, removed only by burnout</li><li>After shutdown it rises and stays</li><li><b>Burnable poisons</b> (like gadolinium) hold down fresh fuel's excess reactivity and burn away</li><li>They let designers use less boron, keeping the MTC negative</li></ul>`),
Q(`Samarium-149 is removed by…`,['burnout only, because it\'s stable','decay only','both decay and burnout','boron'],0,`It never decays, so only neutron absorption removes it.`),
Q(`Promethium-149, which decays into samarium-149, has a half-life of about…`,['53 hours','9.1 hours','6.6 hours','55 seconds'],0,`About 53 hours, so samarium keeps building for days after a shutdown.`),
Q(`Gadolinium mixed into some fuel pellets is a…`,['burnable poison','moderator','coolant','fission product'],0,`It absorbs neutrons strongly at first, then burns away as the fuel is used.`),
Q(`A very high boron concentration can make the MTC…`,['less negative, or even positive','more negative','exactly zero'],0,`Hot water expands and pushes boron out of the core, adding reactivity. With lots of boron this can outweigh the moderation effect.`),
Q(`Compared with xenon, samarium's effect on reactivity is…`,['smaller and slower','bigger and faster','exactly the same','positive'],0,`Samarium is worth hundreds of pcm and builds over days. Xenon is worth thousands and changes over hours.`)]);

F('r11',[
T(`<h3>Quick recap</h3><ul><li>Fresh fuel has lots of <b>excess reactivity</b>, held down by boron and burnable poisons</li><li>Over the cycle, boron is diluted to near zero; plutonium-239 builds up and β falls</li><li><b>Shutdown margin = (total rod worth − most reactive rod) − reactivity to overcome</b></li></ul><div class="callout"><b>Worked example:</b> rods 8000, stuck rod 1500, excess 5000: SDM = (8000 − 1500) − 5000 = <b>1500 pcm</b>.</div>`),
N(`Total rod worth is 6500 pcm, the most reactive rod is worth 1000 pcm, and there's 4000 pcm to overcome. What's the shutdown margin?`,1500,0.01,'pcm',`(6500 − 1000) − 4000 = 1500 pcm.`,`Subtract the stuck rod first.`),
N(`At full power, boron falls steadily from 1300 ppm to 0 over 500 days. How fast, in ppm per day?`,2.6,0.01,'ppm per day',`1300 ÷ 500 = 2.6 ppm per day.`),
Q(`At the end of a fuel cycle, the boron concentration at full power is about…`,['0 ppm','1200 ppm','2000 ppm','it isn\'t used'],0,`Boron has been diluted away to compensate for fuel burnup.`),
Q(`As plutonium-239 builds up, β…`,['falls','rises','stays the same'],0,`Pu-239 has a smaller delayed neutron fraction (about 0.21%) than U-235 (0.65%).`),
Q(`Shutdown margin is calculated assuming…`,['the most reactive rod is stuck fully out','all rods insert perfectly','boron is zero','xenon is at its peak'],0,`It's a single-failure assumption: the reactor must still shut down even if one rod sticks.`)]);

F('k1',[
T(`<h3>Quick recap</h3><ul><li>Prompt neutron generation time ℓ ≈ 2 × 10<sup>−5</sup> s</li><li>About <b>0.65%</b> of U-235 fission neutrons are <b>delayed</b> (β = 0.0065)</li><li>With delayed neutrons, the average generation time is about <b>0.08 s</b></li><li>Prompt-only period: <b>τ = ℓ/(k − 1)</b></li></ul><div class="callout"><b>Worked example:</b> ℓ = 2 × 10<sup>−5</sup> s, k − 1 = 0.002: τ = 2 × 10<sup>−5</sup> ÷ 0.002 = <b>0.01 s</b>.</div>`),
N(`Prompt neutrons only: ℓ = 10<sup>−4</sup> s and k − 1 = 0.0005. What would the period be?`,0.2,0.01,'s',`τ = 10<sup>−4</sup> ÷ 0.0005 = 0.2 s. Still far too fast to control.`),
N(`1,000,000 fission neutrons are released, and β = 0.0065. How many are delayed?`,6500,0.01,'',`1,000,000 × 0.0065 = 6500.`),
Q(`Delayed neutrons come from…`,['the decay of certain fission products, called precursors','the control rods','the neutron source','the coolant'],0,`Precursors such as bromine-87 decay and give off a neutron seconds to a minute after fission.`),
Q(`Which delayed neutron group has the largest share of β?`,['Group 1 (55.7 s)','Group 2 (22.7 s)','Group 4 (2.3 s)','Group 6 (0.2 s)'],2,`Group 4 makes up about 40% of β.`),
N(`The average generation time with delayed neutrons is 0.08 s, and the prompt generation time is 2 × 10<sup>−5</sup> s. How many times longer is it?`,4000,0.01,'times',`0.08 ÷ 0.00002 = 4000.`)]);

F('k2',[
T(`<h3>Quick recap</h3><ul><li><b>SUR = 26.06 / τ</b> (decades per minute)</li><li>Decades gained = SUR × time in minutes</li><li><b>τ ≈ (β − ρ) / (λ<sub>eff</sub> ρ)</b> with λ<sub>eff</sub> ≈ 0.08 s<sup>−1</sup></li></ul><div class="callout"><b>Worked example:</b> SUR 0.5 DPM for 4 minutes: 0.5 × 4 = <b>2 decades</b> (×100).</div>`),
N(`The period is 120 s. What's the startup rate?`,0.217,0.02,'DPM',`26.06 ÷ 120 = 0.22 DPM.`),
N(`The startup rate is 0.25 DPM. How many minutes does it take to rise 2 decades?`,8,0.01,'minutes',`2 ÷ 0.25 = 8 minutes.`,`Decades ÷ decades per minute.`),
N(`The startup rate is 2 DPM. What's the period?`,13.03,0.02,'s',`τ = 26.06 ÷ 2 = 13 s. That's fast: most plants trip around 3 DPM or alarm well before.`),
N(`Estimate the period for ρ = 100 pcm, β = 650 pcm and λ<sub>eff</sub> = 0.08 s<sup>−1</sup>.`,68.75,0.02,'s',`(650 − 100) ÷ (0.08 × 100) = 550 ÷ 8 = 69 s.`,`Top: β − ρ. Bottom: λ<sub>eff</sub> × ρ.`),
Q(`A higher startup rate means…`,['a shorter period and faster power rise','a longer period','falling power','less reactivity'],0,`SUR and period are inversely related.`)]);

F('k3',[
T(`<h3>Quick recap</h3><ul><li>Prompt jump: <b>P<sub>1</sub>/P<sub>0</sub> = β / (β − ρ)</b></li><li>Reactivity in dollars = ρ ÷ β</li><li>At <b>ρ = β (1 $)</b> the reactor is prompt critical: never allowed</li></ul><div class="callout"><b>Worked example:</b> ρ = 130 pcm, β = 650: 650 ÷ 520 = <b>1.25</b>, a 25% jump.</div>`),
N(`ρ = +200 pcm and β = 650 pcm. What's the prompt jump, P<sub>1</sub>/P<sub>0</sub>?`,1.444,0.01,'',`650 ÷ (650 − 200) = 650 ÷ 450 = 1.44.`),
N(`ρ = −650 pcm and β = 650 pcm. What's the prompt drop, P<sub>1</sub>/P<sub>0</sub>?`,0.5,0.01,'',`650 ÷ (650 + 650) = 0.5: power halves almost instantly.`,`Subtracting a negative number adds it.`),
N(`β = 600 pcm. What's 300 pcm in dollars?`,0.5,0.01,'$',`300 ÷ 600 = 0.5 $.`),
Q(`Prompt critical means…`,['the chain reaction is sustained by prompt neutrons alone','the reactor is shut down','power is steady','delayed neutrons control the rate'],0,`Once ρ ≥ β, the reactor no longer waits for delayed neutrons, and the period falls to milliseconds.`),
Q(`After a reactor goes prompt critical, what limits the power rise?`,['Doppler feedback as the fuel heats up','Delayed neutrons','The operators','Boron'],0,`Nothing else is fast enough. That's why prompt criticality must never happen.`)]);

F('k4',[
T(`<h3>Quick recap</h3><ul><li>Prompt drop to <b>β / (β − ρ)</b> of starting power</li><li>Then a <b>−80 s period</b>: P = P<sub>1</sub>e<sup>−t/80</sup></li><li>Time to fall from P<sub>1</sub> to P<sub>2</sub>: <b>t = 80 ln(P<sub>1</sub>/P<sub>2</sub>)</b></li></ul><div class="callout"><b>Worked example:</b> from 10% to 1%: t = 80 × ln 10 = <b>184 s</b>.</div>`),
N(`A trip adds −3250 pcm and β = 650 pcm. What percentage of the original power is left after the prompt drop?`,16.67,0.02,'%',`650 ÷ (650 + 3250) = 650 ÷ 3900 = 0.167 = 16.7%.`),
N(`On a −80 s period, how long does power take to fall by a factor of e?`,80,0.01,'s',`That's the definition of the period: 80 s.`),
N(`On a −80 s period, how long does power take to fall by one decade (× 1/10)?`,184.2,0.02,'s',`80 × ln 10 = 80 × 2.303 = 184 s.`),
N(`What startup rate does a −80 s period correspond to? Include the sign.`,-0.326,0.02,'DPM',`26.06 ÷ −80 = −0.33 DPM: about a third of a decade per minute.`),
Q(`After a trip, source range counts keep falling slowly for minutes because…`,['long-lived delayed neutron precursors are still decaying','the rods are still moving','xenon is burning out','boron is being added'],0,`The 55 s group keeps feeding neutrons in, setting the −80 s period.`)]);

F('k5',[
T(`<h3>Quick recap</h3><ul><li>Decay heat: about <b>6–7%</b> just after a trip, <b>1–1.5%</b> after an hour, <b>0.5%</b> after a day</li><li>MW = fraction × rated thermal power</li><li>To boil water: kg/s = power ÷ latent heat; to warm water: kg/s = power ÷ (c ΔT)</li></ul>`),
N(`A 4500 MWth core has decay heat of 1%. How many MW is that?`,45,0.01,'MW',`4500 × 0.01 = 45 MW.`),
N(`Decay heat is 0.5% of 3000 MWth. How many MW is that?`,15,0.01,'MW',`3000 × 0.005 = 15 MW.`),
N(`15 MW of decay heat is warming cooling water from 20 °C to 100 °C (c = 4.18 kJ/kg/K). How many kg/s of water are needed?`,44.9,0.02,'kg/s',`ṁ = P ÷ (c ΔT) = 15,000,000 ÷ (4180 × 80) = 44.9 kg/s.`,`Use joules: 15 MW = 15,000,000 W and c = 4180 J/kg/K.`),
Q(`Just after a trip, decay heat is about…`,['6–7% of full power','0%','50% of full power','100% of full power'],0,`That's still around 200 MW for a big reactor.`),
Q(`Why must cooling continue for days after shutdown?`,['Fission products keep decaying and releasing heat','The chain reaction restarts','The pumps need to keep running','The boron needs mixing'],0,`Decay heat falls slowly, so heat removal is needed long after the chain reaction stops.`)]);

