/* ========== GCSE MATHS (Edexcel 1MA1 Higher) · LEVEL 2 · Year 10 ========== */
U({id:'gm2-1',track:'gm',level:2,title:'Number',icon:'xⁿ',color:'#7F77DD',desc:'Index laws including negative and fractional powers, standard form, surds, bounds and error intervals.',lessons:[
LH('gm2-1-1','Indices',9,'The index laws, and what zero, negative and fractional powers mean.',[
T(`<h3>The three index laws</h3><div class="eq">aᵐ × aⁿ = aᵐ⁺ⁿ &nbsp;&nbsp; aᵐ ÷ aⁿ = aᵐ⁻ⁿ &nbsp;&nbsp; (aᵐ)ⁿ = aᵐⁿ</div><p>Multiply: <b>add</b> the powers. Divide: <b>subtract</b>. Power of a power: <b>multiply</b>. They only work when the base is the same.</p>`),
Q(`Simplify x⁵ × x³.`,[`x⁸`,`x¹⁵`,`x²`,`2x⁸`],0,`Add the powers: 5 + 3 = 8.`),
Q(`Simplify (y⁴)³.`,[`y¹²`,`y⁷`,`y⁶⁴`,`3y⁴`],0,`Multiply: 4 × 3.`),
T(`<h3>Zero and negative powers</h3><ul><li><b>a⁰ = 1</b> (for any a that isn't 0).</li><li>A negative power means <b>1 over</b>: a⁻ⁿ = 1 ÷ aⁿ. So 2⁻³ = 1/8.</li></ul>`),
Q(`What is 5⁻²?`,[`1/25`,'−1/25','−10','1/10'],0,`1 over 5², which is 1/25.`),
T(`<h3>Fractional powers</h3><p>The <b>bottom</b> of the fraction is a <b>root</b>; the <b>top</b> is a <b>power</b>.</p><div class="eq">a<sup>1/2</sup> = √a &nbsp;&nbsp; a<sup>1/3</sup> = ∛a &nbsp;&nbsp; a<sup>2/3</sup> = (∛a)²</div><p>Always do the root first: the numbers stay small. 8<sup>2/3</sup> = (∛8)² = 2² = 4.</p>`),
W('stepCalc',{steps:[`Work out 27<sup>−2/3</sup>.`,`The minus sign means "1 over": 1 ÷ 27<sup>2/3</sup>`,`The 3 on the bottom means cube root: ∛27 = 3`,`The 2 on top means square it: 3² = 9`,`So the answer is <b>1/9</b>`]},`A worked example with everything at once.`,`Negative: 1 over. Bottom: root. Top: power.`),
W('calcDrill',{skill:'g_indices',need:6},`Fractional and negative powers. Get 6 right to master it.`,`Root first, then power, then "1 over" if it's negative.`),
T(`<h3>Key points</h3><ul><li>Multiply: add powers. Divide: subtract. Bracket: multiply.</li><li>a⁰ = 1. Negative power: 1 over.</li><li>Fractional power: bottom is the root, top is the power.</li></ul>`)]),
LH('gm2-1-2','Standard form and surds',10,'Writing huge and tiny numbers, calculating with them, and simplifying square roots.',[
RM(`<p>aᵐ × aⁿ = aᵐ⁺ⁿ and aᵐ ÷ aⁿ = aᵐ⁻ⁿ. A negative power means 1 over.</p>`),
T(`<h3>Standard form</h3><p>A number in standard form is written <b>A × 10ⁿ</b>, where 1 ≤ A &lt; 10 and n is a whole number.</p><ul><li>4 500 000 = 4.5 × 10⁶</li><li>0.00032 = 3.2 × 10⁻⁴ (small numbers have negative powers)</li></ul>`),
T(`<h3>Calculating</h3><p>Multiply: multiply the numbers and <b>add</b> the powers. Divide: divide the numbers and <b>subtract</b> the powers. Then fix A if it isn't between 1 and 10:</p><div class="eq">(4 × 10³) × (5 × 10⁴) = 20 × 10⁷ = 2 × 10⁸</div>`),
W('calcDrill',{skill:'g_stdform',need:5},`Standard form. Get 5 right to master it.`,`Type the number A, then the power n.`),
T(`<h3>Surds</h3><p>A <b>surd</b> is a square root that isn't a whole number, like √2. Keep surds as exact values.</p><div class="eq">√(ab) = √a × √b</div><p>To simplify, find the biggest <b>square number</b> factor: √50 = √(25 × 2) = 5√2.</p>`),
W('calcDrill',{skill:'g_surd',need:5},`Simplify the surds. Get 5 right to master it.`,`Square numbers: 4, 9, 16, 25, 36…`),
T(`<h3>Rationalising the denominator</h3><p>You shouldn't leave a surd on the bottom of a fraction. Multiply top and bottom by that surd:</p><div class="eq">6/√3 = (6 × √3)/(√3 × √3) = 6√3/3 = 2√3</div>`),
Q(`Rationalise 10/√5.`,[`2√5`,`10√5`,`√50`,`5√2`],0,`(10√5)/5 = 2√5.`),
T(`<h3>Key points</h3><ul><li>Standard form: A × 10ⁿ with 1 ≤ A &lt; 10.</li><li>Multiply: add the powers. Divide: subtract.</li><li>√50 = 5√2: take out square numbers.</li><li>Rationalise: multiply top and bottom by the surd.</li></ul>`)]),
LH('gm2-1-3','Bounds and error intervals',9,'How accurate a rounded number really is, error interval notation, and upper and lower bounds in calculations.',[
RM(`<p>Rounding to the nearest 10, 1 or 0.1. A number rounded to 1 decimal place could have been a bit more or a bit less.</p>`),
T(`<h3>Error intervals</h3><p>If a length is 7 cm to the nearest cm, the real length could be anything from 6.5 up to (but not including) 7.5:</p><div class="eq">6.5 ≤ x &lt; 7.5</div><p>Add and subtract <b>half</b> of the accuracy. The lower bound uses ≤, the upper uses &lt;.</p>`),
Q(`m = 3.4 to 1 decimal place. What is the error interval?`,[`3.35 ≤ m < 3.45`,`3.3 ≤ m < 3.5`,`3.4 ≤ m < 3.5`,`3.35 < m ≤ 3.45`],0,`Half of 0.1 is 0.05.`),
T(`<h3>Truncation</h3><p>Truncating means chopping off digits, not rounding. If x = 5.2 truncated to 1 d.p., then 5.2 ≤ x &lt; 5.3.</p>`),
W('calcDrill',{skill:'g_bounds',need:5},`Bounds. Get 5 right to master it.`,`Half the accuracy, added or taken away.`),
T(`<h3>Bounds in calculations</h3><p>Think about which way makes the answer biggest:</p><ul><li>Biggest sum or product: upper + upper, upper × upper.</li><li>Biggest difference: upper − <b>lower</b>.</li><li>Biggest division: upper ÷ <b>lower</b>.</li></ul>`),
Q(`d = 100 m (nearest 10 m) and t = 12 s (nearest second). Which gives the upper bound of the speed d ÷ t?`,[`105 ÷ 11.5`,`105 ÷ 12.5`,`95 ÷ 11.5`,`100 ÷ 12`],0,`Biggest top, smallest bottom.`),
T(`<h3>Key points</h3><ul><li>Error interval: ± half the accuracy, ≤ then &lt;.</li><li>Truncation: chop, don't round.</li><li>Upper bound of a ÷ b: upper a ÷ lower b.</li></ul>`)])
]});

U({id:'gm2-2',track:'gm',level:2,title:'Algebra',icon:'x',color:'#1D9E75',desc:'Expanding and factorising, linear equations and inequalities, quadratic equations and simultaneous equations.',lessons:[
LH('gm2-2-1','Expanding and factorising',10,'Multiplying out brackets, putting them back in, and the difference of two squares.',[
T(`<h3>Expanding brackets</h3><p>Multiply <b>everything</b> inside by what's outside: 3(2x − 5) = 6x − 15.</p><p>For two brackets, multiply every term by every term (FOIL: first, outside, inside, last):</p><div class="eq">(x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15</div>`),
W('calcDrill',{skill:'g_expand',need:6},`Expand double brackets. Get 6 right to master it.`,`Four multiplications, then collect the x terms.`),
T(`<h3>Factorising</h3><p>Factorising puts brackets back in. Take out the <b>highest common factor</b>: 6x² + 9x = 3x(2x + 3).</p><p>For x² + bx + c, find two numbers that <b>multiply to c</b> and <b>add to b</b>:</p><div class="eq">x² + 7x + 12 = (x + 3)(x + 4)</div>`),
W('calcDrill',{skill:'g_factorise',need:6},`Factorise quadratics. Get 6 right to master it.`,`Multiply to the number, add to the x number. Watch the signs.`),
T(`<h3>Difference of two squares</h3><div class="eq">a² − b² = (a + b)(a − b)</div><p>x² − 49 = (x + 7)(x − 7). 4x² − 9 = (2x + 3)(2x − 3).</p>`),
Q(`Factorise x² − 81.`,[`(x + 9)(x − 9)`,'(x − 9)(x − 9)','(x + 9)(x + 9)','(x − 3)(x + 27)'],0,`81 = 9², so it's a difference of two squares.`),
T(`<h3>Harder: ax² + bx + c</h3><p>For 2x² + 7x + 3: multiply a × c = 6. Find two numbers that multiply to 6 and add to 7: 6 and 1. Split the middle: 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3).</p>`),
Q(`Factorise 3x² + 10x + 8.`,[`(3x + 4)(x + 2)`,`(3x + 2)(x + 4)`,`(3x + 8)(x + 1)`,`(3x + 1)(x + 8)`],0,`Check: 3x × 2 + 4 × x = 10x ✓.`),
T(`<h3>Key points</h3><ul><li>Expand: every term times every term.</li><li>x² + bx + c: multiply to c, add to b.</li><li>a² − b² = (a + b)(a − b).</li></ul>`)]),
LH('gm2-2-2','Equations and inequalities',9,'Solving linear equations with letters on both sides, and solving and showing inequalities.',[
RM(`<p>Expanding: 3(x − 2) = 3x − 6. Whatever you do to one side, do to the other.</p>`),
T(`<h3>Letters on both sides</h3><p>Get the letters on the side with the <b>bigger</b> number of them, then solve:</p><div class="eq">5x + 3 = 2x + 18 → 3x + 3 = 18 → 3x = 15 → x = 5</div><p>Expand brackets first. If there are fractions, multiply everything by the denominator.</p>`),
W('calcDrill',{skill:'g_solvelin',need:5},`Solve the equations. Get 5 right to master it.`,`Collect x on one side, numbers on the other.`),
Q(`Solve (x + 4) ÷ 3 = 5.`,[`x = 11`,`x = 19`,`x = 1`,`x = 3`],0,`Multiply by 3: x + 4 = 15, so x = 11.`),
T(`<h3>Inequalities</h3><p>Solve just like equations, with one exception: if you <b>multiply or divide by a negative</b>, <b>flip the sign</b>.</p><div class="eq">−2x &lt; 8 → x &gt; −4</div><p>On a number line: an open circle ○ for &lt; or &gt;, a filled circle ● for ≤ or ≥.</p>`),
W('calcDrill',{skill:'g_ineq',need:5},`Inequalities. Get 5 right to master it.`,`Count the integers carefully: check whether each end is included.`),
Q(`Solve 7 − 3x ≥ 1.`,[`x ≤ 2`,`x ≥ 2`,`x ≤ −2`,`x ≥ −2`],0,`−3x ≥ −6. Divide by −3 and flip: x ≤ 2.`),
T(`<h3>Key points</h3><ul><li>Collect letters on one side, numbers on the other.</li><li>Inequalities: same as equations, but flip the sign if you × or ÷ by a negative.</li><li>○ for &lt; and &gt;, ● for ≤ and ≥.</li></ul>`)]),
LH('gm2-2-3','Quadratics and simultaneous equations',10,'Solving quadratics by factorising, and solving two equations at once.',[
RM(`<p>x² + bx + c: find two numbers that multiply to c and add to b. (x + 3)(x − 2) etc.</p>`),
T(`<h3>Solving by factorising</h3><p>Get everything on one side so it equals 0. Factorise. If two things multiply to make 0, one of them must be 0:</p><div class="eq">x² − x − 12 = 0 → (x − 4)(x + 3) = 0 → x = 4 or x = −3</div><p>Watch the signs: (x − 4) = 0 gives x = <b>+4</b>.</p>`),
W('calcDrill',{skill:'g_solvequad',need:5},`Solve the quadratics. Get 5 right to master it.`,`Factorise, then make each bracket equal 0.`),
Q(`Solve x² = 5x.`,[`x = 0 or x = 5`,'x = 5 only','x = 0 or x = √5','x = 0 or x = −5'],0,`x² − 5x = 0 → x(x − 5) = 0. Never divide by x: you'd lose x = 0.`),
T(`<h3>Simultaneous equations</h3><p>Two equations, two unknowns. <b>Elimination</b>: make the x (or y) numbers match, then add or subtract to get rid of one letter.</p>`),
W('stepCalc',{steps:[`Solve 3x + 2y = 16 and x − 2y = 0.`,`The y numbers are +2 and −2, so add the equations: 4x = 16`,`x = 4`,`Substitute into x − 2y = 0: 4 − 2y = 0, so y = 2`,`Check in the first equation: 3 × 4 + 2 × 2 = 16 ✓. Answer: <b>x = 4, y = 2</b>`]},`A worked example.`,`Same signs: subtract. Different signs: add.`),
W('calcDrill',{skill:'g_simul',need:4},`Simultaneous equations. Get 4 right to master it.`,`Multiply one or both equations so a letter matches.`),
T(`<h3>Key points</h3><ul><li>Quadratic = 0, factorise, each bracket = 0.</li><li>Never divide by x.</li><li>Simultaneous: match, then add or subtract, solve, substitute, check.</li></ul>`)])
]});

U({id:'gm2-3',track:'gm',level:2,title:'Ratio, proportion and rates',icon:'%',color:'#BA7517',desc:'Percentage multipliers, reverse percentages, compound interest and decay, ratio problems, direct and inverse proportion, and compound measures.',lessons:[
LH('gm2-3-1','Percentages and multipliers',9,'The fast way to do any percentage question, percentage change, and reverse percentages.',[
T(`<h3>Multipliers</h3><p>A percentage as a decimal is a <b>multiplier</b>:</p><ul><li>15% of something: × 0.15</li><li>Increase by 15%: × 1.15</li><li>Decrease by 15%: × 0.85</li></ul><p>One multiplication, every time.</p>`),
Q(`What multiplier decreases an amount by 8%?`,[`0.92`,`0.08`,`1.08`,`0.8`],0,`100% − 8% = 92% = 0.92.`),
T(`<h3>Percentage change</h3><div class="eq">percentage change = change ÷ original × 100</div><p>Always divide by the <b>original</b>, not the new amount.</p>`),
T(`<h3>Reverse percentages</h3><p>If you know the amount <b>after</b> a change, <b>divide</b> by the multiplier:</p><div class="eq">after a 20% rise it's £84 → original = 84 ÷ 1.2 = £70</div><p>The classic mistake is taking 20% off £84. That gives £67.20, which is wrong.</p>`),
W('calcDrill',{skill:'g_pct',need:6},`Mixed percentage questions. Get 6 right to master it.`,`Find the multiplier first. Reverse: divide by it.`),
T(`<h3>Key points</h3><ul><li>Increase by r%: × (1 + r/100). Decrease: × (1 − r/100).</li><li>Change ÷ original × 100.</li><li>Reverse: divide by the multiplier.</li></ul>`)]),
LH('gm2-3-2','Growth, decay and ratio',10,'Compound interest and depreciation, and sharing and comparing in a ratio.',[
RM(`<p>Increase by r%: multiply by (1 + r/100). Decrease by r%: multiply by (1 − r/100).</p>`),
T(`<h3>Compound interest</h3><p>Each year the interest is added and the next year's interest is on the new total. Use the multiplier to the power of the number of years:</p><div class="eq">amount = original × (multiplier)ⁿ</div><p>£2000 at 3% for 4 years: 2000 × 1.03⁴ = £2251.02.</p><p><b>Depreciation</b> (losing value) works the same way with a multiplier below 1.</p>`),
W('calcDrill',{skill:'g_compound',need:4},`Compound growth and decay. Get 4 right to master it.`,`Original × multiplierⁿ. Round to the nearest penny at the end.`),
T(`<h3>Ratio</h3><p>To share in a ratio: <b>add the parts</b>, find what <b>one part</b> is worth, then multiply.</p><div class="eq">£60 in the ratio 2 : 3 → 5 parts → 1 part = £12 → £24 and £36</div><p>If you know the <b>difference</b> between two shares, the difference in parts tells you what one part is worth.</p>`),
W('calcDrill',{skill:'g_ratio',need:5},`Ratio problems. Get 5 right to master it.`,`Find one part first.`),
Q(`The ratio of boys to girls is 3 : 5. What fraction of the group are girls?`,[`5/8`,`5/3`,`3/5`,`3/8`],0,`8 parts in total, 5 of them girls.`),
T(`<h3>Key points</h3><ul><li>Compound: original × multiplierⁿ.</li><li>Ratio: add the parts, find one part, multiply.</li><li>A ratio a : b means the fractions are a/(a + b) and b/(a + b).</li></ul>`)]),
LH('gm2-3-3','Proportion and compound measures',10,'Direct and inverse proportion, and speed, density and pressure.',[
RM(`<p>Ratio: find one part first. A multiplier scales everything by the same amount.</p>`),
T(`<h3>Direct proportion</h3><p>y ∝ x means y = kx: double x and you double y. The graph is a straight line through the origin.</p><p>It can be with a power: y ∝ x² means y = kx².</p><p>Method: write the equation, use the values you're given to find <b>k</b>, then use it.</p>`),
W('calcDrill',{skill:'g_dirprop',need:4},`Direct proportion. Get 4 right to master it.`,`Find k first, then use it.`),
T(`<h3>Inverse proportion</h3><p>y ∝ 1/x means y = k ÷ x: double x and you halve y. More workers, less time.</p>`),
W('calcDrill',{skill:'g_invprop',need:4},`Inverse proportion. Get 4 right to master it.`,`k = x × y.`),
T(`<h3>Compound measures</h3><div class="eq">speed = distance ÷ time &nbsp;&nbsp; density = mass ÷ volume &nbsp;&nbsp; pressure = force ÷ area</div><p>Watch the units: to turn km/h into m/s, × 1000 ÷ 3600 (or ÷ 3.6). And 2 h 30 min is 2.5 hours, not 2.3.</p>`),
W('calcDrill',{skill:'g_kmh',need:4},`Compound measures. Get 4 right to master it.`,`Check every unit before calculating.`),
T(`<h3>Key points</h3><ul><li>Direct: y = kx (or kx²). Inverse: y = k ÷ x.</li><li>Find k from the values given.</li><li>Speed, density, pressure. Convert the units first.</li></ul>`)])
]});

U({id:'gm2-4',track:'gm',level:2,title:'Geometry and trigonometry',icon:'△',color:'#D85A30',desc:'Angle facts and polygons, circles, arcs and sectors, Pythagoras, right-angled trigonometry, exact values, volume and surface area.',lessons:[
LH('gm2-4-1','Angles, polygons and circles',10,'Angle rules with parallel lines, polygons, and circle area, arcs and sectors.',[
T(`<h3>Angle facts</h3><ul><li>On a straight line: 180°. Around a point: 360°. In a triangle: 180°.</li><li>Parallel lines: <b>alternate</b> angles are equal (Z shape); <b>corresponding</b> angles are equal (F shape); <b>co-interior</b> angles add to 180° (C shape).</li></ul><p>In exams you must give the reason in words, like "alternate angles are equal".</p>`),
Q(`Two angles sit between parallel lines on the same side, in a C shape. One is 115°. What is the other?`,[`65°`,`115°`,`245°`,`75°`],0,`Co-interior angles add to 180°.`),
T(`<h3>Polygons</h3><ul><li>Exterior angles of any polygon add to <b>360°</b>.</li><li>Interior angles add to <b>(n − 2) × 180°</b>.</li><li>Regular polygon: each exterior angle = 360 ÷ n, and interior = 180 − exterior.</li></ul>`),
W('calcDrill',{skill:'g_polygon',need:4},`Polygon angles. Get 4 right to master it.`,`Start with the exterior angle: 360 ÷ n.`),
T(`<h3>Circles</h3><div class="eq">area = πr² &nbsp;&nbsp; circumference = πd = 2πr</div><p>A <b>sector</b> is a fraction of the circle: angle ÷ 360.</p><div class="eq">sector area = (θ/360) × πr² &nbsp;&nbsp; arc length = (θ/360) × 2πr</div>`),
W('calcDrill',{skill:'g_circle',need:5},`Circles, arcs and sectors. Get 5 right to master it.`,`Radius, not diameter, in πr².`),
T(`<h3>Key points</h3><ul><li>Alternate and corresponding: equal. Co-interior: add to 180°.</li><li>Exterior angles add to 360°.</li><li>Sector = (θ/360) of the circle.</li></ul>`)]),
LH('gm2-4-2','Pythagoras and trigonometry',10,'Finding sides in right-angled triangles, SOHCAHTOA, and the exact trig values you must know.',[
RM(`<p>Angles in a triangle add to 180°. Squares and square roots on a calculator.</p>`),
T(`<h3>Pythagoras' theorem</h3><div class="eq">a² + b² = c²</div><p>c is the <b>hypotenuse</b>: the longest side, opposite the right angle.</p><ul><li>Finding the hypotenuse: square, <b>add</b>, square-root.</li><li>Finding a shorter side: square, <b>subtract</b>, square-root.</li></ul>`),
W('calcDrill',{skill:'g_pyth',need:4},`Pythagoras. Get 4 right to master it.`,`Hypotenuse: add. Shorter side: subtract.`),
T(`<h3>SOHCAHTOA</h3><p>Label the sides from the angle θ: <b>opposite</b>, <b>adjacent</b> (next to it) and <b>hypotenuse</b>.</p><div class="eq">sin θ = O/H &nbsp;&nbsp; cos θ = A/H &nbsp;&nbsp; tan θ = O/A</div><p>Finding an angle: use the inverse, sin⁻¹, cos⁻¹ or tan⁻¹. Check your calculator is in <b>degrees</b>.</p>`),
W('calcDrill',{skill:'g_trig',need:6},`SOHCAHTOA. Get 6 right to master it.`,`Label O, A, H first, then pick the ratio with the two sides you're using.`),
T(`<h3>Exact values (non-calculator paper)</h3><div class="tbl"><table class="wtable"><tr><th></th><th>0°</th><th>30°</th><th>45°</th><th>60°</th><th>90°</th></tr><tr><th>sin</th><td>0</td><td>½</td><td>√2/2</td><td>√3/2</td><td>1</td></tr><tr><th>cos</th><td>1</td><td>√3/2</td><td>√2/2</td><td>½</td><td>0</td></tr><tr><th>tan</th><td>0</td><td>√3/3</td><td>1</td><td>√3</td><td>—</td></tr></table></div>`),
W('flipCards',{cards:[['sin 30°','½'],['cos 60°','½'],['tan 45°','1'],['sin 60°','√3/2'],['cos 30°','√3/2'],['tan 60°','√3']]},`Flip them, then try to remember them without looking.`,`sin goes up 0, ½, √2/2, √3/2, 1; cos is the same list backwards.`),
Q(`Without a calculator, what is cos 60°?`,[`½`,`√3/2`,`1`,`√2/2`],0,`It's the same as sin 30°.`),
T(`<h3>Key points</h3><ul><li>a² + b² = c². Add for the hypotenuse, subtract for a shorter side.</li><li>SOH CAH TOA. Inverse functions for angles.</li><li>Learn the exact values for 0°, 30°, 45°, 60° and 90°.</li></ul>`)]),
LH('gm2-4-3','Volume and surface area',9,'Prisms, cylinders, cones, spheres and pyramids.',[
RM(`<p>Circle area = πr². Area of a triangle = ½ × base × height.</p>`),
T(`<h3>Prisms</h3><p>A prism has the same cross-section all the way through.</p><div class="eq">volume = area of cross-section × length</div><p>A cylinder is a circular prism: V = πr²h.</p>`),
T(`<h3>Cones, pyramids and spheres</h3><div class="eq">pyramid: V = ⅓ × base area × height &nbsp;&nbsp; cone: V = ⅓πr²h &nbsp;&nbsp; sphere: V = (4/3)πr³</div><p>Edexcel gives you the cone and sphere formulas on the paper, including the curved surface areas: cone πrl, sphere 4πr².</p>`),
W('calcDrill',{skill:'g_volume',need:5},`Volumes and surface areas. Get 5 right to master it.`,`Radius, not diameter. A cone is a third of a cylinder.`),
T(`<h3>Surface area</h3><p>Add up the area of every face. For a cylinder: two circles plus the curved side, which unrolls into a rectangle 2πr wide and h tall:</p><div class="eq">total surface area = 2πr² + 2πrh</div>`),
N(`Find the total surface area of a cylinder with radius 3 cm and height 10 cm. (1 decimal place)`,245.0,0.002,'cm²',`2π × 3² + 2π × 3 × 10 = 18π + 60π = 78π = 245.0 cm².`),
T(`<h3>Key points</h3><ul><li>Prism: cross-section × length. Cylinder: πr²h.</li><li>Cone and pyramid: a third of the matching prism.</li><li>Surface area: add every face. The curved side of a cylinder is 2πrh.</li></ul>`)])
]});

F('gm2-1-1',[GN('g_indices'),GN('g_indices'),GN('g_indices'),Q(`x⁷ ÷ x² = …`,[`x⁵`,`x⁹`,`x¹⁴`,`x^3.5`],0,`Subtract the powers.`),Q(`What is 9⁰?`,[`1`,`0`,`9`,`undefined`],0,`Anything to the power 0 is 1.`)]);
F('gm2-1-2',[GN('g_stdform'),GN('g_stdform'),GN('g_surd'),GN('g_surd'),Q(`Rationalise 4/√2.`,[`2√2`,`4√2`,`√8`,`2`],0,`4√2 ÷ 2.`)]);
F('gm2-1-3',[GN('g_bounds'),GN('g_bounds'),GN('g_bounds'),Q(`x = 12 to the nearest whole number. Error interval?`,[`11.5 ≤ x < 12.5`,`11 ≤ x < 13`,`11.5 < x ≤ 12.5`,`12 ≤ x < 13`],0,`± 0.5.`),Q(`For the upper bound of a − b, use…`,[`upper a − lower b`,`upper a − upper b`,`lower a − lower b`,`lower a − upper b`],0,`Biggest minus smallest.`)]);
F('gm2-2-1',[GN('g_expand'),GN('g_expand'),GN('g_factorise'),GN('g_factorise'),Q(`Factorise 4x² − 25.`,[`(2x + 5)(2x − 5)`,`(4x + 5)(x − 5)`,`(2x − 5)²`,`4(x² − 25)`],0,`Difference of two squares.`)]);
F('gm2-2-2',[GN('g_solvelin'),GN('g_solvelin'),GN('g_ineq'),GN('g_ineq'),Q(`When solving an inequality, you must flip the sign when you…`,[`multiply or divide by a negative`,`add a negative`,`subtract`,`square both sides`],0,`Only × or ÷ by a negative.`)]);
F('gm2-2-3',[GN('g_solvequad'),GN('g_solvequad'),GN('g_simul'),GN('g_simul'),Q(`(x − 6)(x + 2) = 0. The solutions are…`,[`x = 6 or x = −2`,`x = −6 or x = 2`,`x = 6 or x = 2`,`x = −6 or x = −2`],0,`Each bracket = 0.`)]);
F('gm2-3-1',[GN('g_pct'),GN('g_pct'),GN('g_pct'),GN('g_pct'),Q(`The multiplier for a 3.5% increase is…`,[`1.035`,`1.35`,`0.965`,`3.5`],0,`100% + 3.5%.`)]);
F('gm2-3-2',[GN('g_compound'),GN('g_compound'),GN('g_ratio'),GN('g_ratio'),Q(`£40 shared 3 : 5. The bigger share is…`,[`£25`,`£15`,`£24`,`£20`],0,`8 parts, £5 each, 5 × £5.`)]);
F('gm2-3-3',[GN('g_dirprop'),GN('g_invprop'),GN('g_kmh'),GN('g_kmh'),Q(`y is inversely proportional to x. If x doubles, y…`,[`halves`,`doubles`,`quadruples`,`stays the same`],0,`y = k ÷ x.`)]);
F('gm2-4-1',[GN('g_polygon'),GN('g_polygon'),GN('g_circle'),GN('g_circle'),Q(`Alternate angles are…`,[`equal`,`add to 180°`,`add to 90°`,`add to 360°`],0,`Z shape.`)]);
F('gm2-4-2',[GN('g_pyth'),GN('g_pyth'),GN('g_trig'),GN('g_trig'),Q(`tan 45° = …`,[`1`,`½`,`√3`,`0`],0,`Opposite = adjacent.`)]);
F('gm2-4-3',[GN('g_volume'),GN('g_volume'),GN('g_volume'),Q(`The volume of a cone is ___ the volume of a cylinder with the same base and height.`,[`a third of`,`half of`,`the same as`,`twice`],0,`⅓πr²h.`),Q(`Volume of a prism = …`,[`cross-section area × length`,`length × width`,`surface area × height`,`πr²`],0,`Same cross-section all through.`)]);
TT('gm2-1',[x('gm2-1-1',GN('g_indices')),x('gm2-1-1',GN('g_indices')),x('gm2-1-2',GN('g_stdform')),x('gm2-1-2',GN('g_stdform')),x('gm2-1-2',GN('g_surd')),x('gm2-1-2',GN('g_surd')),x('gm2-1-3',GN('g_bounds')),x('gm2-1-3',GN('g_bounds')),x('gm2-1-1',Q(`(a³)⁴ = …`,[`a¹²`,`a⁷`,`a⁸¹`,`4a³`],0,`Multiply the powers.`)),x('gm2-1-2',Q(`Rationalise 3/√3.`,[`√3`,`3√3`,`1`,`9`],0,`3√3 ÷ 3.`))]);
TT('gm2-2',[x('gm2-2-1',GN('g_expand')),x('gm2-2-1',GN('g_factorise')),x('gm2-2-1',GN('g_factorise')),x('gm2-2-2',GN('g_solvelin')),x('gm2-2-2',GN('g_ineq')),x('gm2-2-3',GN('g_solvequad')),x('gm2-2-3',GN('g_solvequad')),x('gm2-2-3',GN('g_simul')),x('gm2-2-3',GN('g_simul')),x('gm2-2-1',Q(`Factorise 2x² + 5x + 2.`,[`(2x + 1)(x + 2)`,`(2x + 2)(x + 1)`,`(x + 2)²`,`(2x + 5)(x + 2)`],0,`Check: 4x + x = 5x.`))]);
TT('gm2-3',[x('gm2-3-1',GN('g_pct')),x('gm2-3-1',GN('g_pct')),x('gm2-3-1',GN('g_pct')),x('gm2-3-2',GN('g_compound')),x('gm2-3-2',GN('g_compound')),x('gm2-3-2',GN('g_ratio')),x('gm2-3-3',GN('g_dirprop')),x('gm2-3-3',GN('g_invprop')),x('gm2-3-3',GN('g_kmh')),x('gm2-3-2',GN('g_ratio'))]);
TT('gm2-4',[x('gm2-4-1',GN('g_polygon')),x('gm2-4-1',GN('g_circle')),x('gm2-4-1',GN('g_circle')),x('gm2-4-2',GN('g_pyth')),x('gm2-4-2',GN('g_trig')),x('gm2-4-2',GN('g_trig')),x('gm2-4-3',GN('g_volume')),x('gm2-4-3',GN('g_volume')),x('gm2-4-2',Q(`sin 30° = …`,[`½`,`√3/2`,`1`,`√2/2`],0,`Exact value.`)),x('gm2-4-1',Q(`Interior angles of a hexagon add to…`,[`720°`,`540°`,`360°`,`1080°`],0,`(6 − 2) × 180.`))]);
