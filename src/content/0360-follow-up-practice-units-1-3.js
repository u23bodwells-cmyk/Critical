/* ---------- follow-up practice: units 1-3 ---------- */
F('m1',[
T(`<h3>Quick recap</h3><p>Multiplying by 10<sup>n</sup> moves the decimal point <b>n places right</b>. Multiplying by 10<sup>−n</sup> moves it <b>n places left</b>.</p><table><tr><th>Prefix</th><th>Means</th></tr><tr><td>k (kilo)</td><td>10<sup>3</sup></td></tr><tr><td>M (mega)</td><td>10<sup>6</sup></td></tr><tr><td>G (giga)</td><td>10<sup>9</sup></td></tr><tr><td>m (milli)</td><td>10<sup>−3</sup></td></tr><tr><td>µ (micro)</td><td>10<sup>−6</sup></td></tr></table><p><b>Reactivity:</b> Δk/k × 100,000 = pcm, and %Δk/k × 1000 = pcm.</p><div class="callout"><b>Worked example:</b> 0.0035 Δk/k × 100,000 = <b>350 pcm</b>.</div>`),
N(`Write 6.2 × 10<sup>−3</sup> as an ordinary decimal.`,0.0062,0.001,'',`10<sup>−3</sup> moves the point 3 places left: 6.2 → 0.0062.`,`Move the decimal point 3 places to the left.`),
Q(`How many watts is 1630 MW?`,['1.63 × 10<sup>9</sup> W','1.63 × 10<sup>6</sup> W','1.63 × 10<sup>3</sup> W','1.63 × 10<sup>12</sup> W'],0,`1630 MW = 1630 × 10<sup>6</sup> W = 1.63 × 10<sup>9</sup> W, about one Hinkley Point C unit's electrical output.`,`Mega means 10<sup>6</sup>, and 1630 is 1.63 × 10<sup>3</sup>.`),
N(`Convert 0.0015 Δk/k to pcm.`,150,0.01,'pcm',`0.0015 × 100,000 = 150 pcm.`,`Multiply by 100,000.`),
N(`Convert 0.3 %Δk/k to pcm.`,300,0.01,'pcm',`0.3 × 1000 = 300 pcm. (0.3% = 0.003 Δk/k = 300 pcm.)`,`1 %Δk/k is 1000 pcm.`),
Q(`Which time is shortest?`,['3 × 10<sup>−5</sup> s','0.0002 s','50 µs','0.1 ms'],0,`In microseconds they are 30, 200, 50 and 100 µs. So 3 × 10<sup>−5</sup> s is the shortest.`,`Convert them all to microseconds (µs).`),
N(`A pump moves 16,500 kg of water every second. Write this in standard form: what number goes in front of × 10<sup>4</sup>?`,1.65,0.01,'× 10⁴ kg/s',`16,500 = 1.65 × 10<sup>4</sup>.`,`Move the decimal point until the number is between 1 and 10, and count the moves.`)]);

F('m2',[
T(`<h3>Quick recap</h3><p>Exponential growth <b>multiplies</b> by the same factor in equal times.</p><div class="eq">P = P<sub>0</sub> e<sup>t/τ</sup></div><div class="key"><div class="kt">What each part means</div><div class="krow"><span class="ks">P</span><span class="km">reactor power right now</span><span class="ku">watts (W), or % of full power</span></div><div class="krow"><span class="ks">P<sub>0</sub></span><span class="km">the power you started at</span><span class="ku">same unit as P</span></div><div class="krow"><span class="ks">e</span><span class="km">a special number, about 2.718 (it’s on your calculator as e<sup>x</sup>)</span><span class="ku">no unit</span></div><div class="krow"><span class="ks">t</span><span class="km">time since you started</span><span class="ku">seconds (s)</span></div><div class="krow"><span class="ks">τ</span><span class="km">“tau”, the reactor <b>period</b>: the time for power to grow by a factor of e (×2.718)</span><span class="ku">seconds (s)</span></div></div><ul><li>After 1 period (t = τ): × e ≈ × 2.718</li><li>After 2 periods: × e<sup>2</sup> ≈ × 7.39</li><li>Doubling time = 0.693 τ</li></ul><div class="callout"><b>Worked example:</b> τ = 50 s and P<sub>0</sub> = 1%. After 100 s, t/τ = 2, so P = 1% × e<sup>2</sup> = <b>7.39%</b>.</div>`),
N(`Power doubles every 30 s. Starting at 2%, what is it after 90 s?`,16,0.01,'%',`90 s is 3 doublings: 2 → 4 → 8 → 16%.`,`How many doubling times fit into 90 s?`),
N(`The reactor period is 40 s. What's the doubling time?`,27.7,0.02,'s',`0.693 × 40 = 27.7 s.`,`Doubling time = 0.693 × τ.`),
N(`Power starts at 5% with a 100 s period. What is it after 200 s?`,36.9,0.02,'%',`t/τ = 2, so P = 5 × e<sup>2</sup> = 5 × 7.39 = 36.9%.`,`Work out t/τ first, then multiply by e to that power.`),
Q(`Which describes exponential growth?`,['It rises by the same amount each minute','It multiplies by the same factor each minute','It rises, then stops','It falls by the same amount each minute'],1,`Exponential growth is about equal <i>factors</i>, not equal amounts. That's why it speeds up.`),
Q(`Power multiplies by 10 every 2 minutes. Starting at 0.001%, where is it after 6 minutes?`,['0.003%','1%','0.01%','10%'],1,`6 minutes is three lots of ×10: 0.001 → 0.01 → 0.1 → 1%.`,`Count the number of ×10 steps.`)]);

F('m3',[
T(`<h3>Quick recap</h3><ul><li>log<sub>10</sub>(x) answers "10 to what power gives x?" So log<sub>10</sub>(100) = 2 and log<sub>10</sub>(0.01) = −2.</li><li>ln undoes e<sup>x</sup>: ln(e<sup>x</sup>) = x.</li><li>Number of decades from P<sub>0</sub> to P = log<sub>10</sub>(P/P<sub>0</sub>).</li><li>Time to change power: <b>t = τ ln(P/P<sub>0</sub>)</b>.</li></ul><div class="callout"><b>Worked example:</b> τ = 50 s, from 1% to 10%: t = 50 × ln 10 = 50 × 2.30 = <b>115 s</b>.</div>`),
N(`What is log<sub>10</sub>(0.001)?`,-3,0.001,'',`0.001 = 10<sup>−3</sup>, so the log is −3.`,`Write 0.001 as a power of 10.`),
N(`How many decades is it from 10<sup>−7</sup>% to 10<sup>−2</sup>%?`,5,0.001,'decades',`From −7 to −2 is 5 steps of ×10.`,`Subtract the powers.`),
N(`What is ln(e<sup>4</sup>)?`,4,0.001,'',`ln undoes e<sup>x</sup>, so ln(e<sup>4</sup>) = 4.`),
N(`The period is 50 s. How long does power take to rise from 1% to 20%?`,149.8,0.02,'s',`t = 50 × ln(20) = 50 × 3.00 = 150 s.`,`t = τ × ln(P/P<sub>0</sub>), and P/P<sub>0</sub> = 20.`),
Q(`On a log scale, which pair is the same distance apart as 1 and 10?`,['10 and 20','5 and 50','1 and 100','50 and 100'],1,`On a log scale, equal distances mean equal <i>ratios</i>. 5 → 50 is ×10, just like 1 → 10.`,`Look for a pair where one number is 10 times the other.`)]);

F('m4',[
T(`<h3>Quick recap</h3><p>A rate of change tells you how fast something changes per unit time.</p><ul><li>For a straight-line graph: <b>gradient = change in y ÷ change in x</b></li><li>Rising gives a positive rate; falling gives a negative rate</li><li>Exponential growth: <b>dP/dt = P/τ</b></li></ul><div class="callout"><b>Worked example:</b> A level rises from 40% to 46% in 3 minutes. Rate = 6 ÷ 3 = <b>+2% per minute</b>.</div>`),
N(`Coolant temperature rises steadily from 290 °C to 302 °C in 4 minutes. What's the rate, in °C per minute?`,3,0.01,'°C per minute',`(302 − 290) ÷ 4 = 12 ÷ 4 = 3 °C per minute.`,`Change in temperature ÷ time taken.`),
N(`Pressuriser level falls from 60% to 54% in 3 minutes. What's the rate of change, in % per minute? Include the sign.`,-2,0.01,'% per minute',`(54 − 60) ÷ 3 = −6 ÷ 3 = −2% per minute. Negative, because it's falling.`,`New value minus old value, then divide by the time.`),
N(`Power is 20% and the period is 80 s. How fast is power rising right now, in % per second?`,0.25,0.01,'% per second',`dP/dt = P/τ = 20/80 = 0.25% per second.`,`Use dP/dt = P/τ.`),
Q(`On a graph of power against time, where is power rising fastest?`,['Where the curve is steepest','Where the curve is highest','Where the curve is flat','Always at the start'],0,`The rate of change is the gradient: the steeper the curve, the faster the change.`),
Q(`Power is 10% and rising at 0.1% per second on a steady period. What's the period?`,['10 s','100 s','1000 s','0.01 s'],1,`Rearrange dP/dt = P/τ: τ = P ÷ (dP/dt) = 10 ÷ 0.1 = 100 s.`,`Rearrange dP/dt = P/τ to make τ the subject.`)]);

F('m5',[
T(`<h3>Quick recap</h3><ul><li><b>dN/dt = −λN</b>: the rate is proportional to the amount and negative, so N decays: N = N<sub>0</sub>e<sup>−λt</sup></li><li><b>dP/dt = P/τ</b>: positive, so P grows: P = P<sub>0</sub>e<sup>t/τ</sup></li><li>A computer steps forward with <b>new value = old value + rate × step</b> (Euler's method)</li></ul><div class="callout"><b>Worked example:</b> N = 1000, dN/dt = −0.1N, step 2 s. Rate = −100 per second, so N goes to 1000 + (−100 × 2) = <b>800</b>.</div>`),
N(`N = 1000 and dN/dt = −0.1N. Using one Euler step of 1 s, what's N after the step?`,900,0.01,'',`Rate = −0.1 × 1000 = −100 per second. New N = 1000 + (−100 × 1) = 900.`,`Work out the rate first, then new value = old + rate × step.`),
N(`dP/dt = P/50 and P = 10. What is dP/dt?`,0.2,0.01,'',`10 ÷ 50 = 0.2.`),
Q(`Which equation describes radioactive decay?`,['dN/dt = −λN','dN/dt = λN','dN/dt = −λ','dN/dt = λt'],0,`Decay rate is proportional to how many nuclei are left, and it's negative because N falls.`),
N(`N = 500 e<sup>−0.2t</sup>. What is N at t = 0?`,500,0.001,'',`e<sup>0</sup> = 1, so N = 500. N<sub>0</sub> is always the starting value.`,`Anything to the power 0 is 1.`),
Q(`Why do reactor simulators use very small time steps?`,['Each step assumes the rate stays constant, which is only accurate over short steps','Small steps are faster to compute','The reactor only changes at fixed times','To use less memory'],0,`Euler's method treats the rate as fixed during each step. The rate really changes continuously, so smaller steps give a more accurate answer.`)]);

F('m6',[
T(`<h3>Quick recap</h3><p>For random counts, the typical spread (standard deviation) is about <b>√N</b>, where N is the number of counts.</p><ul><li>Relative spread = √N ÷ N = 1/√N</li><li>More counts gives a smaller relative spread</li><li>To get more counts, count for longer</li></ul><div class="callout"><b>Worked example:</b> 900 counts: spread = √900 = 30, which is 30/900 = <b>3.3%</b>.</div>`),
N(`You record 400 counts. What's the standard deviation?`,20,0.01,'counts',`√400 = 20 counts.`,`Take the square root.`),
N(`You record 400 counts. What's the relative spread, as a percentage?`,5,0.01,'%',`20 ÷ 400 = 0.05 = 5%.`,`Divide the spread (√N) by N.`),
N(`A detector averages 25 counts per second. You count for 100 s. What's the relative spread of the total, in %?`,2,0.01,'%',`Total = 2500 counts. √2500 = 50, and 50 ÷ 2500 = 2%.`,`Find the total counts first.`),
Q(`To halve the relative spread of a count, you need…`,['twice as many counts','four times as many counts','half as many counts','the same number of counts'],1,`Relative spread is 1/√N. To halve it, √N must double, so N must be four times bigger.`),
Q(`At an average of 100 cps, two 1-second counts read 92 and 108. This shows…`,['the reactor is unstable','normal random scatter: about ±10 is typical at 100 counts','a broken detector','that power has doubled'],1,`√100 = 10, so readings of about 90 to 110 are completely normal.`)]);

F('e1',[
T(`<h3>Quick recap</h3><ul><li><b>energy = power × time</b> (1 W = 1 J/s)</li><li>1 MW = 10<sup>6</sup> W; 1 kWh = 3.6 MJ</li><li><b>efficiency = useful output ÷ input</b>, so MWe = MWth × efficiency</li></ul><div class="callout"><b>Worked example:</b> 3000 MWth at 34% gives 3000 × 0.34 = <b>1020 MWe</b>.</div>`),
N(`A 1600 MWe generator runs for 1 hour. How much electrical energy is that, in MWh?`,1600,0.01,'MWh',`MWh = MW × hours = 1600 × 1 = 1600 MWh.`),
N(`How many joules are in 1 kWh? Give the number in front of × 10<sup>6</sup> J.`,3.6,0.01,'× 10⁶ J',`1000 W × 3600 s = 3,600,000 J = 3.6 × 10<sup>6</sup> J.`,`1 kW for 3600 seconds.`),
N(`A reactor makes 4500 MWth and 1600 MWe. What's the efficiency, in %?`,35.6,0.01,'%',`1600 ÷ 4500 = 0.356 = 35.6%.`,`Efficiency = MWe ÷ MWth.`),
N(`A plant is 34% efficient and makes 1200 MWe. What's its thermal power?`,3529,0.01,'MWth',`MWth = MWe ÷ efficiency = 1200 ÷ 0.34 = 3529 MWth.`,`Rearrange efficiency = MWe ÷ MWth.`),
Q(`For a nuclear power station, which is bigger?`,['MWth','MWe','They are always equal'],0,`Only about a third of the heat becomes electricity, so MWth is about three times MWe.`)]);

F('e2',[
T(`<h3>Quick recap</h3><ul><li>Momentum <b>p = mv</b>, and it's conserved in every collision</li><li>In an elastic collision, kinetic energy is conserved too</li><li>Head-on with a nucleus of mass number A, the neutron keeps <b>((A − 1)/(A + 1))<sup>2</sup></b> of its energy</li></ul><div class="callout"><b>Worked example:</b> oxygen-16: (15/17)<sup>2</sup> = 0.78, so the neutron keeps <b>78%</b>.</div>`),
N(`A neutron (mass 1.67 × 10<sup>−27</sup> kg) moves at 2200 m/s. What's its momentum? Give the number in front of × 10<sup>−24</sup> kg m/s.`,3.67,0.02,'× 10⁻²⁴ kg m/s',`p = 1.67 × 10<sup>−27</sup> × 2200 = 3.67 × 10<sup>−24</sup> kg m/s.`,`p = m × v.`),
N(`A neutron hits deuterium (A = 2) head-on. What fraction of its energy does it keep?`,0.111,0.02,'',`((2 − 1)/(2 + 1))<sup>2</sup> = (1/3)<sup>2</sup> = 0.111.`,`Put A = 2 into ((A − 1)/(A + 1))<sup>2</sup>.`),
N(`A neutron hits hydrogen-1 (A = 1) head-on. What fraction of its energy does it keep?`,0,0.001,'',`((1 − 1)/(1 + 1))<sup>2</sup> = 0. It can stop dead, like one snooker ball hitting another.`),
Q(`Which nucleus slows a neutron down the least in each collision?`,['Hydrogen-1','Deuterium','Carbon-12','Uranium-238'],3,`U-238 is so heavy that the neutron bounces off keeping over 98% of its energy.`),
Q(`In an elastic collision, what's conserved?`,['Momentum only','Kinetic energy only','Both momentum and kinetic energy','Neither'],2,`Momentum is always conserved. "Elastic" means kinetic energy is conserved too.`)]);

F('e3',[
T(`<h3>Quick recap</h3><table><tr><th>Letter</th><th>Means</th><th>Unit</th></tr><tr><td>E</td><td>energy</td><td>joules (J)</td></tr><tr><td>m</td><td>mass</td><td>kilograms (kg)</td></tr><tr><td>c</td><td>speed of light</td><td>3.00 × 10<sup>8</sup> m/s</td></tr></table><div class="callout">c<sup>2</sup> = c × c = 9 × 10<sup>16</sup>. That giant number is why a tiny mass gives a huge energy.</div>`),
Q(`In E = mc², what is <b>c</b>?`,[`The speed of light`,`A constant that changes with temperature`,`The charge on an electron`,`The mass in grams`],0,`c is the speed of light: 3.00 × 10<sup>8</sup> m/s. It never changes.`),
Q(`What unit does E come out in, if you put mass in kilograms?`,[`Joules (J)`,`Watts (W)`,`Kilograms (kg)`,`Metres per second (m/s)`],0,`Kilograms × (metres per second)<sup>2</sup> = joules, the unit of energy.`),
Q(`What does the little ² in c² mean?`,[`Multiply c by itself`,`Multiply c by 2`,`Divide c by 2`,`Add 2 to c`],0,`Squared means times itself: c × c. That's different from 2 × c.`,`Squared isn't the same as doubled.`),
N(`(3 × 10<sup>4</sup>)<sup>2</sup> = ? Give the number in front of × 10<sup>8</sup>.`,9,0.01,'× 10⁸',`3 × 3 = 9, and 10<sup>4</sup> × 10<sup>4</sup> = 10<sup>8</sup>. Exactly the same method as squaring c.`,`Square the front number, then add the powers.`),
Q(`You're given a mass of 250 g. What should you do before using E = mc²?`,[`Convert it to 0.25 kg`,`Nothing: grams are fine`,`Multiply it by 1000`,`Square it`],0,`Mass must be in kilograms: 250 ÷ 1000 = 0.25 kg.`)]);

F('e3b',[
T(`<h3>Quick recap</h3><ol class="steps"><li>Mass in kilograms (grams ÷ 1000).</li><li>c<sup>2</sup> = 9 × 10<sup>16</sup>.</li><li>Multiply: E = m × 9 × 10<sup>16</sup>, in joules.</li></ol><div class="callout">Going backwards: m = E ÷ c<sup>2</sup>.</div>`),
N(`How much energy is 1 g (0.001 kg) of mass? Give the number in front of × 10<sup>13</sup> J.`,9,0.01,'× 10¹³ J',`E = 0.001 × 9 × 10<sup>16</sup> = 9 × 10<sup>13</sup> J.`,`0.001 = 10<sup>−3</sup>, and −3 + 16 = 13.`),
N(`How much energy is 3 kg of mass? Give the number in front of × 10<sup>16</sup> J.`,27,0.01,'× 10¹⁶ J',`3 × 9 × 10<sup>16</sup> = 27 × 10<sup>16</sup> J (= 2.7 × 10<sup>17</sup> J).`),
N(`How much energy is 2 g of mass? Give the number in front of × 10<sup>14</sup> J.`,1.8,0.01,'× 10¹⁴ J',`2 g = 0.002 kg. 0.002 × 9 × 10<sup>16</sup> = 0.018 × 10<sup>16</sup> = 1.8 × 10<sup>14</sup> J.`,`First turn 2 g into kilograms.`),
N(`A reactor makes 4.5 × 10<sup>16</sup> J of heat. How much mass was converted, in kg?`,0.5,0.01,'kg',`m = E ÷ c<sup>2</sup> = 4.5 × 10<sup>16</sup> ÷ 9 × 10<sup>16</sup> = 0.5 kg.`,`Divide the energy by 9 × 10<sup>16</sup>.`),
Q(`When a reactor releases energy, what happens to the mass?`,[`A tiny amount is carried away as energy (heat)`,`It's destroyed for ever`,`It turns into more uranium`,`Nothing: mass never changes`],0,`The products are very slightly lighter. That mass left as energy, which heats the fuel.`)]);

F('e3c',[
T(`<h3>Quick recap</h3><ul><li>1 u (atomic mass unit) = 1.66 × 10<sup>−27</sup> kg, about the mass of one proton or neutron.</li><li>1 eV = 1.60 × 10<sup>−19</sup> J, and 1 MeV = 1.60 × 10<sup>−13</sup> J.</li><li><b>Shortcut:</b> energy in MeV = mass in u × 931.5.</li></ul><div class="callout"><b>Worked example:</b> 0.05 u × 931.5 = <b>46.6 MeV</b>.</div>`),
N(`Convert 5 MeV to joules. Give the number in front of × 10<sup>−13</sup> J.`,8,0.01,'× 10⁻¹³ J',`5 × 1.60 × 10<sup>−13</sup> = 8.0 × 10<sup>−13</sup> J.`,`1 MeV = 1.60 × 10<sup>−13</sup> J.`),
N(`A reaction loses 0.01 u of mass. How much energy does it release, in MeV?`,9.315,0.01,'MeV',`0.01 × 931.5 = 9.3 MeV.`),
N(`A reaction loses 0.2 u. How much energy, in MeV?`,186.3,0.01,'MeV',`0.2 × 931.5 = 186 MeV: about the energy of one uranium fission.`),
Q(`Why do physicists use u and MeV instead of kg and J for single atoms?`,[`Atom-sized amounts in kg and J are awkward tiny numbers`,`They're more accurate`,`kg and J don't work for atoms`,`Because of the speed of light`],0,`They're the same physics, just in units sized for atoms, so you don't fight with 10<sup>−27</sup> every time.`),
Q(`About what is the mass of a carbon-12 atom?`,[`12 u`,`6 u`,`1 u`,`12 kg`],0,`About 12 u: 6 protons and 6 neutrons, each about 1 u.`)]);

F('e3d',[
T(`<h3>Quick recap</h3><ol class="steps"><li>Add up the mass before and after the reaction (in u).</li><li>Missing mass = before − after.</li><li>Energy (MeV) = missing mass × 931.5.</li></ol><div class="callout">One fission ≈ <b>200 MeV</b> ≈ 3.2 × 10<sup>−11</sup> J.</div>`),
N(`Before a reaction: 10.0129 u. After: 10.0104 u. How much mass went missing?`,0.0025,0.02,'u',`10.0129 − 10.0104 = 0.0025 u.`),
N(`How much energy is 0.0025 u, in MeV?`,2.33,0.02,'MeV',`0.0025 × 931.5 = 2.3 MeV.`),
N(`How many fissions (3.2 × 10<sup>−11</sup> J each) release 1 MJ (10<sup>6</sup> J)? Give the number in front of × 10<sup>16</sup>.`,3.125,0.03,'× 10¹⁶ fissions',`10<sup>6</sup> ÷ 3.2 × 10<sup>−11</sup> = 3.1 × 10<sup>16</sup> fissions.`,`Divide 10<sup>6</sup> J by the energy per fission.`),
Q(`After a fission, the pieces weigh…`,[`slightly less than what you started with`,`slightly more`,`exactly the same`,`about half as much`],0,`They're about 0.19 u lighter. That missing mass is the energy released.`),
Q(`Where does the energy released in fission come from?`,[`A small loss of mass`,`The incoming neutron's kinetic energy`,`Chemical bonds`,'The electrons dropping into lower energy levels'],0,`The products weigh slightly less than the starting nucleus and neutron. That missing mass becomes energy through E = mc<sup>2</sup>.`)]);

F('a1',[
T(`<h3>Quick recap</h3><p>In <sup>A</sup><sub>Z</sub>X:</p><ul><li><b>A</b> (top) = protons + neutrons</li><li><b>Z</b> (bottom) = protons, which decides the element</li><li><b>Neutrons = A − Z</b></li><li>Isotopes: same Z, different numbers of neutrons</li></ul><div class="callout"><b>Worked example:</b> <sup>235</sup><sub>92</sub>U has 235 − 92 = <b>143 neutrons</b>.</div>`),
N(`How many neutrons are in U-238 (Z = 92)?`,146,0.001,'',`238 − 92 = 146.`,`Neutrons = A − Z.`),
N(`How many neutrons are in Xe-135 (Z = 54)?`,81,0.001,'',`135 − 54 = 81.`),
Q(`Which pair are isotopes of each other?`,['U-235 and U-238','U-235 and Pu-239','C-12 and N-14','B-10 and Li-7'],0,`Both are uranium (Z = 92), with different numbers of neutrons.`),
Q(`PWR fuel is enriched to about…`,['0.7% U-235','3–5% U-235','50% U-235','90% U-235'],1,`Natural uranium is 0.72% U-235. PWR fuel is enriched to about 3–5%.`),
Q(`What decides which element an atom is?`,['The number of neutrons','The number of protons','The number of nucleons','Its mass'],1,`The proton number Z defines the element: every atom with 92 protons is uranium.`)]);

F('a2',[
T(`<h3>Quick recap</h3><ul><li><b>Mass defect</b> = mass of the separate nucleons − mass of the nucleus</li><li><b>Binding energy</b> = mass defect × 931.5 MeV per u</li><li>Binding energy <b>per nucleon</b> = binding energy ÷ A</li><li>The curve peaks at iron-56, at about 8.8 MeV per nucleon</li></ul><div class="callout"><b>Worked example:</b> a mass defect of 0.03 u gives 0.03 × 931.5 = <b>28 MeV</b> of binding energy.</div>`),
N(`A nucleus has a mass defect of 0.1 u. What's its binding energy?`,93.15,0.01,'MeV',`0.1 × 931.5 = 93.15 MeV.`),
N(`Helium-4 has a binding energy of 28.3 MeV. What's that per nucleon?`,7.08,0.02,'MeV per nucleon',`28.3 ÷ 4 = 7.1 MeV per nucleon.`,`Divide by the number of nucleons, A = 4.`),
Q(`Which is the most tightly bound per nucleon?`,['Hydrogen-2','Uranium-235','Iron-56','Helium-4'],2,`Iron-56 sits at the peak of the binding energy curve.`),
Q(`A nucleus weighs less than its separate protons and neutrons because…`,['energy was released when it formed','neutrons lose mass inside nuclei','its electrons are missing','it is radioactive'],0,`That released energy is the binding energy. Its mass equivalent is the mass defect.`),
N(`Uranium has about 7.6 MeV per nucleon and its fission fragments about 8.5. How much energy is released per nucleon?`,0.9,0.01,'MeV',`8.5 − 7.6 = 0.9 MeV per nucleon. Times 235 nucleons gives about 210 MeV.`)]);

F('a3',[
T(`<h3>Quick recap</h3><table><tr><th>Decay</th><th>A</th><th>Z</th></tr><tr><td>Alpha</td><td>− 4</td><td>− 2</td></tr><tr><td>Beta-minus</td><td>same</td><td>+ 1</td></tr><tr><td>Beta-plus</td><td>same</td><td>− 1</td></tr><tr><td>Gamma</td><td>same</td><td>same</td></tr></table><div class="callout"><b>Worked example:</b> Ra-226 (Z = 88) alpha decays to A = 222, Z = 86: <b>radon-222</b>.</div>`),
Q(`U-238 (Z = 92) alpha decays. What does it become?`,['Th-234 (Z = 90)','U-234 (Z = 92)','Pa-238 (Z = 91)','Pu-242 (Z = 94)'],0,`Alpha: A − 4 = 234 and Z − 2 = 90, which is thorium.`,`Alpha takes away 4 from A and 2 from Z.`),
Q(`Sr-90 (Z = 38) beta-minus decays. What does it become?`,['Y-90 (Z = 39)','Rb-90 (Z = 37)','Sr-89 (Z = 38)','Kr-86 (Z = 36)'],0,`Beta-minus: Z + 1 = 39 (yttrium), and A stays 90.`,`In beta-minus decay a neutron turns into a proton.`),
Q(`Which radiation is stopped by a sheet of paper?`,['Alpha','Beta','Gamma','Neutrons'],0,`Alpha particles are big and heavily charged, so they stop in a few cm of air or a sheet of paper.`),
Q(`Xe-135 (Z = 54) beta-minus decays. What does it become?`,['Cs-135 (Z = 55)','I-135 (Z = 53)','Xe-134 (Z = 54)','Ba-135 (Z = 56)'],0,`Z goes from 54 to 55 (caesium), and A stays 135.`),
N(`In alpha decay, by how much does the mass number go down?`,4,0.001,'',`An alpha particle is 2 protons + 2 neutrons, so A falls by 4.`)]);

F('a4',[
T(`<h3>Quick recap</h3><ul><li>After <b>n</b> half-lives, the fraction left is <b>(½)<sup>n</sup></b></li><li><b>λ = 0.693 ÷ t<sub>½</sub></b>, and t<sub>½</sub> = 0.693 ÷ λ</li><li>Activity A = λN halves every half-life too</li></ul><div class="callout"><b>Worked example:</b> half-life 5 h, after 15 h: 15 ÷ 5 = 3 half-lives, so (½)<sup>3</sup> = <b>1/8</b> is left.</div>`),
N(`An isotope has a half-life of 6 hours. What fraction is left after 24 hours?`,0.0625,0.01,'',`24 ÷ 6 = 4 half-lives: (½)<sup>4</sup> = 1/16 = 0.0625.`,`How many half-lives is 24 hours?`),
N(`A sample has an activity of 3200 Bq and a half-life of 2 days. What's its activity after 6 days?`,400,0.01,'Bq',`6 days is 3 half-lives: 3200 → 1600 → 800 → 400 Bq.`),
N(`An isotope has λ = 0.0693 per second. What's its half-life?`,10,0.01,'s',`t<sub>½</sub> = 0.693 ÷ 0.0693 = 10 s.`,`t<sub>½</sub> = 0.693 ÷ λ.`),
N(`Cobalt-60 has a half-life of 5.27 years. What's its decay constant, per year?`,0.1315,0.02,'per year',`λ = 0.693 ÷ 5.27 = 0.132 per year.`),
Q(`How many half-lives until less than 1% is left?`,['3','5','7','10'],2,`(½)<sup>6</sup> = 1.6% and (½)<sup>7</sup> = 0.78%, so 7 half-lives.`,`Keep halving 100% and count.`)]);

F('a5',[
T(`<h3>Quick recap</h3><ul><li>A neutron can <b>scatter</b>, be <b>captured</b> (n,γ), cause <b>fission</b>, or cause another reaction like (n,α)</li><li>The <b>cross section σ</b> measures how likely an interaction is, in barns (1 b = 10<sup>−24</sup> cm<sup>2</sup>)</li><li>Many cross sections follow <b>1/v</b>: slower neutron, bigger σ</li><li>Fission neutrons ≈ 2 MeV; thermal neutrons ≈ 0.025 eV</li></ul>`),
Q(`U-238 absorbs a neutron and gives off a gamma ray. What's this called?`,['Radiative capture (n,γ)','Fission','Elastic scattering','Alpha decay'],0,`It's radiative capture. The U-239 made this way decays into plutonium-239.`),
N(`Convert 3840 barns to cm<sup>2</sup>. Give the number in front of × 10<sup>−21</sup> cm<sup>2</sup>.`,3.84,0.01,'× 10⁻²¹ cm²',`3840 × 10<sup>−24</sup> = 3.84 × 10<sup>−21</sup> cm<sup>2</sup>.`,`1 barn = 10<sup>−24</sup> cm<sup>2</sup>.`),
Q(`A neutron slows from 1 eV to 0.25 eV, so its speed halves. Under the 1/v law, its cross section…`,['halves','doubles','quadruples','stays the same'],1,`σ ∝ 1/v. Speed halves, so σ doubles. (Energy is ¼, but it's speed that matters.)`,`Kinetic energy depends on v<sup>2</sup>. What does that mean for the speed?`),
Q(`Neutrons are born in fission with about…`,['0.025 eV','2 MeV','200 MeV','6.7 eV'],1,`About 2 MeV. They must be slowed to about 0.025 eV to be thermal.`),
Q(`Why can neutrons get close to nuclei so easily?`,['They have no charge, so they aren\'t repelled','They\'re very fast','They\'re very heavy','Electrons attract them'],0,`Protons and alpha particles are pushed away by the nucleus\'s positive charge. Neutrons aren\'t.`)]);

F('a6',[
T(`<h3>Quick recap</h3><ul><li><b>Σ = Nσ</b> (per cm); mean free path = 1/Σ</li><li>Fraction of a beam getting through a slab: <b>e<sup>−Σx</sup></b></li><li>Reaction rate <b>R = φΣ</b> per cm<sup>3</sup> per second</li><li>Power per cm<sup>3</sup> = R × energy per fission</li></ul><div class="callout"><b>Worked example:</b> φ = 10<sup>13</sup>, Σ<sub>f</sub> = 0.2: R = <b>2 × 10<sup>12</sup></b> fissions per cm<sup>3</sup> per second.</div>`),
N(`N = 5 × 10<sup>22</sup> nuclei per cm<sup>3</sup> and σ = 2 barns (2 × 10<sup>−24</sup> cm<sup>2</sup>). What's Σ, per cm?`,0.1,0.01,'per cm',`Σ = 5 × 10<sup>22</sup> × 2 × 10<sup>−24</sup> = 10 × 10<sup>−2</sup> = 0.1 per cm.`,`Multiply, and add the powers of ten.`),
N(`Σ = 0.5 per cm. What's the mean free path?`,2,0.01,'cm',`1 ÷ 0.5 = 2 cm.`),
N(`φ = 2 × 10<sup>13</sup> n/cm²/s and Σ = 0.05 per cm. What's the reaction rate? Give the number in front of × 10<sup>12</sup>.`,1,0.01,'× 10¹² per cm³ per s',`R = 2 × 10<sup>13</sup> × 0.05 = 1 × 10<sup>12</sup>.`),
N(`Σ = 1 per cm and the slab is 2 cm thick. What fraction of the beam gets through?`,0.135,0.02,'',`e<sup>−1 × 2</sup> = e<sup>−2</sup> = 0.135.`,`Use e<sup>−Σx</sup>.`),
Q(`If the flux doubles everywhere in the core, the power…`,['doubles','halves','stays the same','quadruples'],0,`Power is proportional to fission rate = φΣ<sub>f</sub>, so doubling φ doubles the power.`)]);

F('a7',[
T(`<h3>Quick recap</h3><ul><li>U-235 + n → U-236* → two fragments + 2 or 3 neutrons + about 200 MeV</li><li>Mass numbers and proton numbers must balance on both sides</li><li>Most energy is fragment kinetic energy, which becomes heat in the fuel</li><li>Neutrinos escape; about 0.65% of neutrons are delayed</li></ul><div class="callout"><b>Worked example:</b> U-235 + n → Ba-144 + Kr-89 + ? n. 236 = 144 + 89 + x, so x = <b>3</b>.</div>`),
Q(`Most of the 200 MeV from fission appears first as…`,['kinetic energy of the fission fragments','gamma rays','neutrinos','electricity'],0,`About 168 MeV is fragment kinetic energy. The fragments stop inside the pellet, heating it.`),
N(`U-235 + n → Ba-141 + Kr-92 + how many neutrons?`,3,0.001,'neutrons',`235 + 1 = 236, and 141 + 92 = 233, so 3 neutrons.`,`Make the mass numbers balance.`),
N(`Each fission releases 2.4 neutrons on average, and 0.65% are delayed. How many delayed neutrons come from 1000 fissions?`,15.6,0.02,'',`1000 × 2.4 = 2400 neutrons. 0.65% of 2400 = 15.6.`,`Find the total number of neutrons first.`),
Q(`Typical fission fragments have mass numbers…`,['both near 117 (equal halves)','one near 95 and one near 140','one near 4 and one near 231','both near 200'],1,`Fission is usually lopsided, giving a light fragment around 90–100 and a heavy one around 130–145.`),
Q(`Which part of fission's energy is never turned into heat in the reactor?`,['Neutrinos','Fragment kinetic energy','Gamma rays','Beta particles'],0,`Neutrinos barely interact with matter and fly straight out.`)]);

