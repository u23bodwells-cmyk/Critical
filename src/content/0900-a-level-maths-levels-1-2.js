/* ========== A-LEVEL MATHS (Edexcel 9MA0) · LEVEL 1 bridge · LEVEL 2 Year 12 ========== */
CGEN.a_disc=function(){var a=cNZ(-4,5),b=cR(-9,9),c=cR(-9,9),d=b*b-4*a*c,n=d>0?2:d===0?1:0;
 return {p:'How many real roots does '+cPoly([[a,2],[b,1],[c,0]])+' = 0 have?',b:[cB(n,'number of roots = ')],e:'Discriminant b² − 4ac = '+cBr(b)+'² − 4('+cNum(a)+')('+cNum(c)+') = '+cNum(d)+'. '+(d>0?'Positive: two real roots.':d===0?'Zero: one repeated root.':'Negative: no real roots.')}};
CGEN.a_surd=function(){var k=cP([2,3,5,6,7]),m=cR(2,6);return {p:'Simplify √'+(m*m*k)+' into the form a√'+k+'. What is a?',b:[cB(m,'a = ')],e:'√'+(m*m*k)+' = √('+(m*m)+' × '+k+') = √'+(m*m)+' × √'+k+' = '+m+'√'+k+'.'}};
CGEN.a_logsolve=function(){var b=cP([2,3,5,10]),x=cR(2,5),v=Math.round(Math.log(b*x+0)/Math.log(b)*1000)/1000,N=cR(3,40),r=Math.round(Math.log(N)/Math.log(b)*1000)/1000;
 return {p:'Solve '+b+'<sup>x</sup> = '+N+'. (3 d.p.)',b:[cB(r,'x = ','','x',false,0.002)],e:'Take logs: x = ln '+N+' ÷ ln '+b+' = '+cNum(r)+'.'}};
CGEN.a_binom=function(){var n=cR(3,7),k=cR(1,n-1),a=cP([1,2,3,-1,-2]),C=1;for(var i=0;i<k;i++)C=C*(n-i)/(i+1);var v=C*Math.pow(a,k);
 return {p:'Find the coefficient of x'+(k===1?'':cSup(k))+' in (1 '+(a<0?'−':'+')+' '+(Math.abs(a)===1?'':Math.abs(a))+'x)'+cSup(n)+'.',b:[cB(v,'')],e:'Term: '+n+'C'+k+' × ('+cNum(a)+'x)'+cSup(k)+' = '+C+' × '+cNum(Math.pow(a,k))+' = '+cNum(v)+'.'}};
CGEN.a_circle=function(){var a=cR(-5,5),b=cR(-5,5),r=cR(1,7),D=-2*a,E=-2*b,F=a*a+b*b-r*r;
 return {p:'x² + y² '+(D<0?'− ':'+ ')+Math.abs(D)+'x '+(E<0?'− ':'+ ')+Math.abs(E)+'y '+(F<0?'− ':'+ ')+Math.abs(F)+' = 0. Find the radius.',b:[cB(r,'r = ')],e:'Complete the square: (x '+(a<0?'+ ':'− ')+Math.abs(a)+')² + (y '+(b<0?'+ ':'− ')+Math.abs(b)+')² = '+(a*a)+' + '+(b*b)+' − '+cBr(F)+' = '+(r*r)+'. Radius √'+(r*r)+' = '+r+'.'}};
CGEN.a_binomP=function(){var n=cR(4,8),k=cR(0,n),p=cP([0.2,0.25,0.3,0.4,0.5]),C=1;for(var i=0;i<k;i++)C=C*(n-i)/(i+1);var v=Math.round(C*Math.pow(p,k)*Math.pow(1-p,n-k)*10000)/10000;
 return {p:'X ~ B('+n+', '+p+'). Find P(X = '+k+'). (4 d.p.)',b:[cB(v,'P = ','','probability',false,0.003)],e:'P(X = '+k+') = '+n+'C'+k+' × '+p+cSup(k)+' × '+cNum(1-p)+cSup(n-k)+' = '+C+' × … = '+cNum(v)+'.'}};
CGEN.a_newton=function(){var m=cR(1,10),F=cR(1,12)*5,mu=cP([0,0.2,0.3,0.5]),g=9.8,a=Math.round((F-mu*m*g)/m*100)/100;if(a<=0){mu=0;a=Math.round(F/m*100)/100}
 return {p:'A '+m+' kg box is pulled along a horizontal floor by a '+F+' N force. '+(mu?'The coefficient of friction is '+mu+'. ':'The floor is smooth. ')+'Find its acceleration. (g = 9.8, 2 d.p.)',b:[cB(a,'a = ',' m/s²','acceleration',false,0.005)],e:(mu?'Friction = μR = '+mu+' × '+m+' × 9.8 = '+cNum(Math.round(mu*m*g*100)/100)+' N. ':'')+'Resultant ÷ mass: ('+F+(mu?' − '+cNum(Math.round(mu*m*g*100)/100):'')+') ÷ '+m+' = '+cNum(a)+' m/s².'}};

/* ---- Level 1: GCSE to A-level ---- */
U({id:'am1-1',track:'am',level:1,title:'Algebra fluency',icon:'x²',color:'#7F77DD',desc:'Indices and surds, factorising and completing the square: the GCSE algebra A-level uses on every page.',lessons:[
LH('am1-1-1','Indices and surds',9,'A-level questions expect index laws and surds to be automatic. Let\'s make them so.',[
RM(`<p>aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ, a<sup>1/n</sup> = ⁿ√a.</p>`),
T(`<h3>Fractional powers</h3><div class="eq">a<sup>m/n</sup> = (ⁿ√a)ᵐ</div><p>Root first, then power: 8<sup>2/3</sup> = (∛8)² = 2² = 4. Doing the root first keeps numbers small.</p>`),
N(`Evaluate 27<sup>2/3</sup>.`,9,0.001,'',`∛27 = 3, 3² = 9.`),
T(`<h3>Surds</h3><p>A <b>surd</b> is a root that isn't a whole number, like √2. Simplify by taking out square factors: √50 = √25 × √2 = <b>5√2</b>. Rationalise a denominator by multiplying top and bottom by the surd: 6/√3 = 6√3/3 = <b>2√3</b>.</p>`),
W('calcDrill',{skill:'a_surd',need:3},`Simplify surds. Get 3 right to master it.`,`Find the biggest square factor.`),
Q(`Rationalise 1/(√5 − 2). Multiply top and bottom by…`,[`√5 + 2`,`√5 − 2`,`√5`,`2`],0,`The conjugate: (√5 − 2)(√5 + 2) = 5 − 4 = 1.`),
T(`<h3>Key points</h3><ul><li><b>a<sup>m/n</sup> = (ⁿ√a)ᵐ</b>: root first.</li><li>Simplify surds by taking out square factors.</li><li>Rationalise with the surd, or the <b>conjugate</b> for a − √b.</li></ul>`)]),
LH('am1-1-2','Factorising quadratics',9,'Fast, confident factorising is the single most useful GCSE skill for A-level.',[
RM(`<p>(x + p)(x + q) = x² + (p + q)x + pq. Difference of two squares: a² − b² = (a − b)(a + b).</p>`),
T(`<h3>When a = 1</h3><p>x² + bx + c: find two numbers that <b>multiply to c</b> and <b>add to b</b>. x² − x − 12: −4 and 3, so (x − 4)(x + 3).</p>`),
Q(`Factorise x² + 2x − 15.`,[`(x + 5)(x − 3)`,`(x − 5)(x + 3)`,`(x + 15)(x − 1)`,`(x + 5)(x + 3)`],0,`5 × −3 = −15, 5 + (−3) = 2.`),
T(`<h3>When a ≠ 1</h3><p>6x² + 7x − 3: multiply a × c = −18. Find numbers multiplying to −18, adding to 7: 9 and −2. Split: 6x² + 9x − 2x − 3 = 3x(2x + 3) − 1(2x + 3) = <b>(3x − 1)(2x + 3)</b>.</p>`),
W('calcDrill',{skill:'g_factorise',need:3},`Factorising practice. Get 3 right to master it.`,`Multiply to c, add to b.`),
T(`<h3>Key points</h3><ul><li>a = 1: multiply to c, add to b.</li><li>a ≠ 1: split the middle term using ac.</li><li>Spot <b>difference of two squares</b>.</li></ul>`)]),
LH('am1-1-3','Completing the square',10,'Rewriting a quadratic as a square plus a number shows its turning point instantly.',[
RM(`<p>(x + p)² = x² + 2px + p². The quadratic formula: x = (−b ± √(b² − 4ac)) / 2a.</p>`),
T(`<h3>The method</h3><div class="eq">x² + bx + c = (x + b/2)² − (b/2)² + c</div><p>x² + 6x + 2 = (x + 3)² − 9 + 2 = <b>(x + 3)² − 7</b>.</p><p>The minimum point is at (−3, −7): the square is never negative, so the smallest value is −7, when x = −3.</p>`),
W('calcDrill',{skill:'g_complsq',need:3},`Complete the square. Get 3 right to master it.`,`Halve b, square, adjust.`),
Q(`y = (x − 2)² + 5. What's the turning point?`,[`(2, 5)`,`(−2, 5)`,`(2, −5)`,`(5, 2)`],0,`Sign inside the bracket flips.`),
T(`<h3>It proves the formula</h3><p>Complete the square on ax² + bx + c = 0 in general and you get the quadratic formula. A-level can ask you to show this.</p>`),
T(`<h3>Key points</h3><ul><li><b>x² + bx + c = (x + b/2)² − (b/2)² + c</b>.</li><li>(x − p)² + q has turning point <b>(p, q)</b>.</li><li>Completing the square proves the quadratic formula.</li></ul>`)])
]});

U({id:'am1-2',track:'am',level:1,title:'Graphs and equations',icon:'y=mx+c',color:'#1D9E75',desc:'Straight lines, simultaneous equations including quadratics, and inequalities.',lessons:[
LH('am1-2-1','Straight lines',9,'y − y₁ = m(x − x₁) is the line equation A-level uses most.',[
RM(`<p>Gradient m = (y₂ − y₁)/(x₂ − x₁). y = mx + c. Parallel lines have equal gradients.</p>`),
T(`<h3>Point–gradient form</h3><div class="eq">y − y₁ = m(x − x₁)</div><p>Through (2, 5) with gradient 3: y − 5 = 3(x − 2), so y = 3x − 1. Quicker than finding c separately.</p>`),
T(`<h3>Perpendicular lines</h3><p>Gradients multiply to −1: <b>m₁ × m₂ = −1</b>. The perpendicular to a gradient of 2/3 has gradient −3/2.</p>`),
W('calcDrill',{skill:'g_perpgrad',need:3},`Perpendicular gradients. Get 3 right to master it.`,`Flip and change sign.`),
Q(`A line has gradient −4. The perpendicular gradient is…`,[`1/4`,`4`,`−1/4`,`−4`],0,`−1 ÷ −4.`),
T(`<h3>Key points</h3><ul><li><b>y − y₁ = m(x − x₁)</b>.</li><li>Parallel: same m. Perpendicular: <b>m₁m₂ = −1</b>.</li><li>Give answers in the form asked (often ax + by + c = 0).</li></ul>`)]),
LH('am1-2-2','Simultaneous equations',10,'When one equation is a quadratic, substitute the linear one into it.',[
RM(`<p>Elimination: add or subtract equations to remove a variable. Substitution: replace a variable with an expression.</p>`),
T(`<h3>Linear and quadratic</h3><p>Rearrange the linear equation for one letter and substitute into the quadratic. You'll get up to two solutions: the line can cross a curve twice.</p>`),
W('stepCalc',{steps:[`y = x + 1 and x² + y² = 13`,`Substitute: x² + (x + 1)² = 13`,`2x² + 2x + 1 = 13, so x² + x − 6 = 0`,`(x + 3)(x − 2) = 0: x = −3 or x = 2`,`Pair them: <b>(−3, −2) and (2, 3)</b>`]},`A line meeting a circle.`,`Always pair each x with its y.`),
W('calcDrill',{skill:'g_simulquad',need:2},`Simultaneous equations with a quadratic. Get 2 right to master it.`,`Substitute the linear one.`),
Q(`Substituting gives a quadratic with discriminant zero. The line is…`,[`a tangent to the curve`,`missing the curve`,`crossing it twice`,`the same as the curve`],0,`One repeated point.`),
T(`<h3>Key points</h3><ul><li>Substitute the <b>linear</b> equation into the quadratic.</li><li>Pair each x with its y.</li><li>Discriminant 0: the line is a <b>tangent</b>.</li></ul>`)]),
LH('am1-2-3','Inequalities',9,'Quadratic inequalities need a sketch: where is the curve above or below the axis?',[
RM(`<p>Multiplying or dividing an inequality by a negative number flips the sign. Roots of a quadratic: where the graph crosses the x-axis.</p>`),
T(`<h3>Quadratic inequalities</h3><ol><li>Solve the equation to find the critical values.</li><li>Sketch the parabola.</li><li>Read off where it's above (> 0) or below (< 0) the axis.</li></ol><p>x² − x − 6 < 0: roots −2 and 3; a ∪-shape is below the axis between them: <b>−2 < x < 3</b>.</p>`),
W('calcDrill',{skill:'g_quadineq',need:2},`Quadratic inequalities. Get 2 right to master it.`,`Sketch it.`),
Q(`x² − 9 > 0. The solution is…`,[`x < −3 or x > 3`,`−3 < x < 3`,`x > 3 only`,`x > 9`],0,`Outside the roots for > with a ∪ shape.`),
T(`<h3>Set notation</h3><p>A-level often wants set notation: {x : x < −3} ∪ {x : x > 3}. ∪ means "or" (union); ∩ means "and" (intersection).</p>`),
T(`<h3>Key points</h3><ul><li>Find roots, <b>sketch</b>, read off.</li><li>∪-shape: < 0 between roots, > 0 outside.</li><li>Use <b>set notation</b> when asked.</li></ul>`)])
]});

/* ---- Level 2: Year 12 ---- */
U({id:'am2-1',track:'am',level:2,title:'Proof and algebra',icon:'∴',color:'#7F77DD',desc:'Proof by deduction and exhaustion, the discriminant, and the factor theorem.',lessons:[
LH('am2-1-1','Proof',10,'A-level maths starts by asking you to prove things, not just calculate them.',[
RM(`<p>An even number is 2n; an odd number is 2n + 1, for any integer n. Consecutive integers: n, n + 1, n + 2.</p>`),
T(`<h3>Three methods in Year 12</h3><ul><li><b>Deduction</b>: start from known facts and argue step by step.</li><li><b>Exhaustion</b>: split into all possible cases and check each.</li><li><b>Counter-example</b>: one example that breaks a claim disproves it.</li></ul>`),
W('stepCalc',{steps:[`Prove: the sum of any two odd numbers is even.`,`Let the odd numbers be 2m + 1 and 2n + 1, where m and n are integers.`,`Sum: 2m + 2n + 2 = 2(m + n + 1)`,`m + n + 1 is an integer, so the sum is 2 × an integer.`,`<b>So the sum is even.</b> ∎`]},`A proof by deduction.`,`Use different letters for the two numbers: they needn't be equal.`),
Q(`"n² + n + 41 is prime for all positive integers n." How would you disprove it?`,[`Find one counter-example (n = 40 gives 41²)`,`Check n = 1 to 10`,`Prove it by exhaustion`,`It's true, so you can't`],0,`One counter-example is enough.`),
Q(`Why use 2m + 1 and 2n + 1, not 2n + 1 twice?`,[`The two odd numbers might be different`,`Because m must be bigger`,`It doesn't matter at all`,`To make the algebra longer`],0,`Same letter means same number.`),
T(`<h3>Key points</h3><ul><li><b>Deduction</b>, <b>exhaustion</b>, <b>counter-example</b>.</li><li>Even = 2n, odd = 2n + 1.</li><li>End with a clear concluding statement.</li></ul>`)]),
LH('am2-1-2','The discriminant',9,'One number tells you how many times a parabola crosses the x-axis.',[
RM(`<p>Quadratic formula: x = (−b ± √(b² − 4ac))/2a. You can't take the square root of a negative number (in real numbers).</p>`),
T(`<h3>b² − 4ac</h3><ul><li><b>> 0</b>: two distinct real roots.</li><li><b>= 0</b>: one repeated root (the curve touches the axis).</li><li><b>< 0</b>: no real roots.</li></ul>`),
W('calcDrill',{skill:'a_disc',need:4},`Count the roots. Get 4 right to master it.`,`b² − 4ac.`),
W('stepCalc',{steps:[`x² + kx + 9 = 0 has equal roots. Find k.`,`Equal roots: b² − 4ac = 0`,`k² − 4(1)(9) = 0`,`k² = 36`,`<b>k = ±6</b>`]},`A typical exam question.`,`"Equal roots" means discriminant zero.`),
Q(`For which k does x² + 4x + k = 0 have no real roots?`,[`k > 4`,`k < 4`,`k = 4`,`k > −4`],0,`16 − 4k < 0.`),
T(`<h3>Key points</h3><ul><li><b>b² − 4ac</b> decides the number of real roots.</li><li>Equal roots: = 0. No real roots: < 0.</li><li>Unknown constants give inequalities to solve.</li></ul>`)]),
LH('am2-1-3','Polynomials and the factor theorem',10,'Find a factor of a cubic by trial, then divide it out.',[
RM(`<p>A root r of f(x) = 0 means f(r) = 0. Factorising: (x − r) is a factor when r is a root.</p>`),
T(`<h3>The factor theorem</h3><div class="eq">f(a) = 0 &nbsp;⟺&nbsp; (x − a) is a factor of f(x)</div><p>Try small numbers that divide the constant term: ±1, ±2, ±3…</p>`),
W('stepCalc',{steps:[`f(x) = x³ − 6x² + 11x − 6`,`f(1) = 1 − 6 + 11 − 6 = 0, so (x − 1) is a factor`,`Divide: x³ − 6x² + 11x − 6 = (x − 1)(x² − 5x + 6)`,`Factorise the quadratic: (x − 2)(x − 3)`,`<b>f(x) = (x − 1)(x − 2)(x − 3)</b>`]},`Factorise a cubic.`,`Compare coefficients or use long division.`),
Q(`f(x) = x³ + 2x² − 5x − 6. f(−1) = 0. Which is a factor?`,[`(x + 1)`,`(x − 1)`,`(x + 6)`,`(x − 6)`],0,`Root −1 gives (x + 1).`),
N(`Find f(2) for f(x) = x³ − 3x + 1.`,3,0.001,'',`8 − 6 + 1 = 3. Not zero, so (x − 2) isn't a factor.`),
T(`<h3>Key points</h3><ul><li><b>f(a) = 0 ⟺ (x − a) is a factor</b>.</li><li>Try divisors of the constant term.</li><li>Divide out, then factorise the quadratic.</li></ul>`)])
]});

U({id:'am2-2',track:'am',level:2,title:'Circles, trigonometry and the binomial',icon:'(x−a)²',color:'#1D9E75',desc:'Equations of circles, trig identities and equations, and binomial expansions.',lessons:[
LH('am2-2-1','Circles',10,'Completing the square turns a messy equation into a circle\'s centre and radius.',[
RM(`<p>Completing the square: x² + 6x = (x + 3)² − 9. A tangent is perpendicular to the radius at the point of contact.</p>`),
T(`<h3>The equation</h3><div class="eq">(x − a)² + (y − b)² = r²</div><p>Centre (a, b), radius r. It's Pythagoras: every point is r from the centre.</p>`),
W('calcDrill',{skill:'a_circle',need:3},`Find the radius. Get 3 right to master it.`,`Complete the square in x and in y.`),
T(`<h3>Circle facts</h3><ul><li>A <b>tangent</b> is perpendicular to the radius at that point.</li><li>The <b>perpendicular bisector of a chord</b> passes through the centre.</li><li>The angle in a semicircle is a right angle.</li></ul>`),
Q(`The centre is (2, 1) and the point (5, 5) is on the circle. The tangent there has gradient…`,[`−3/4`,`4/3`,`3/4`,`−4/3`],0,`Radius gradient 4/3; tangent is perpendicular.`),
T(`<h3>Key points</h3><ul><li><b>(x − a)² + (y − b)² = r²</b>.</li><li>Complete the square to find centre and radius.</li><li>Tangent ⟂ radius.</li></ul>`)]),
LH('am2-2-2','Trig identities and equations',11,'Two identities and a careful method solve almost every Year 12 trig equation.',[
RM(`<p>SOH CAH TOA. The graphs of sin and cos repeat every 360°; tan every 180°.</p>`),
T(`<h3>The identities</h3><div class="eq">tan θ = sin θ / cos θ&nbsp;&nbsp;&nbsp;&nbsp; sin²θ + cos²θ = 1</div><p>Use them to rewrite an equation in terms of one trig function.</p>`),
W('stepCalc',{steps:[`Solve 2sin²θ + 3cos θ − 3 = 0 for 0° ≤ θ < 360°`,`Use sin²θ = 1 − cos²θ: 2 − 2cos²θ + 3cos θ − 3 = 0`,`Rearrange: 2cos²θ − 3cos θ + 1 = 0, so (2cos θ − 1)(cos θ − 1) = 0`,`cos θ = ½ gives θ = 60°, 300°. cos θ = 1 gives θ = 0°`,`<b>θ = 0°, 60°, 300°</b>`]},`A quadratic in cos θ.`,`Find every solution in the range using the graph or CAST.`),
Q(`sin θ = 0.5 for 0° ≤ θ < 360°. The solutions are…`,[`30° and 150°`,`30° only`,`30° and 330°`,`60° and 120°`],0,`sin is positive in the 1st and 2nd quadrants: 180° − 30°.`),
Q(`Which identity turns sin²θ into cos θ terms?`,[`sin²θ = 1 − cos²θ`,`sin²θ = cos²θ − 1`,`sin²θ = tan θ cos θ`,`sin²θ = 2sin θ`],0,`Pythagoras.`),
T(`<h3>Key points</h3><ul><li><b>tan θ = sin θ/cos θ</b>, <b>sin²θ + cos²θ = 1</b>.</li><li>Rewrite in one function; often a quadratic.</li><li>Find <b>all</b> solutions in the range.</li></ul>`)]),
LH('am2-2-3','The binomial expansion',10,'Expand (a + b)ⁿ without multiplying out brackets n times.',[
RM(`<p>ⁿCᵣ = n!/(r!(n − r)!) counts the ways to choose r from n. Pascal's triangle: 1; 1 1; 1 2 1; 1 3 3 1…</p>`),
T(`<h3>The expansion</h3><div class="eq">(a + b)ⁿ = aⁿ + ⁿC₁aⁿ⁻¹b + ⁿC₂aⁿ⁻²b² + … + bⁿ</div><p>Powers of a go down, powers of b go up, and the coefficients come from Pascal's triangle (or ⁿCᵣ).</p>`),
W('calcDrill',{skill:'a_binom',need:3},`Binomial coefficients. Get 3 right to master it.`,`ⁿCᵣ × (bx)ʳ.`),
W('stepCalc',{steps:[`Find the x² term in (2 + 3x)⁵`,`r = 2: ⁵C₂ × 2³ × (3x)²`,`= 10 × 8 × 9x²`,`<b>= 720x²</b>`]},`One term of an expansion.`,`Bracket (3x) so you square the 3 too.`),
Q(`Common mistake: in (1 + 2x)⁴, the x² term is ⁴C₂(2x)². Students often forget to…`,[`square the 2`,`use ⁴C₂`,`write x²`,`add 1`],0,`(2x)² = 4x².`),
T(`<h3>Key points</h3><ul><li><b>(a + b)ⁿ = Σ ⁿCᵣ aⁿ⁻ʳbʳ</b>.</li><li>Bracket the whole term: (3x)ʳ.</li><li>Use it for approximations when x is small.</li></ul>`)])
]});

U({id:'am2-3',track:'am',level:2,title:'Calculus and exponentials',icon:'d/dx',color:'#378ADD',desc:'Differentiation and integration for Year 12, and exponential and logarithmic models.',lessons:[
LH('am2-3-1','Differentiation in Year 12',11,'First principles, the power rule, tangents and stationary points: Year 12 calculus in one lesson.',[
RM(`<p>The Calculus track (Levels 2–3) covers this slowly. d/dx(xⁿ) = nxⁿ⁻¹. f′(x) = 0 at stationary points.</p>`),
T(`<h3>What the exam expects</h3><ul><li><b>First principles</b>: f′(x) = lim<sub>h→0</sub> [f(x + h) − f(x)]/h, for x² and x³.</li><li><b>Power rule</b> for any n, after rewriting roots and fractions as powers.</li><li><b>Tangents and normals</b>.</li><li><b>Stationary points</b>, and the second derivative to classify them.</li><li><b>Increasing/decreasing</b> functions and <b>optimisation</b> problems.</li></ul>`),
W('calcDrill',{skill:['power','rewrite','tangent','statq'],need:5},`Mixed Year 12 differentiation. Get 5 right to master it.`,`Rewrite as powers first.`),
Q(`f″(x) > 0 at a stationary point means…`,[`a minimum`,`a maximum`,`a point of inflection`,`no stationary point`],0,`Curving upwards.`),
T(`<h3>Optimisation questions</h3><p>Write the quantity to maximise in terms of <b>one</b> variable (use the constraint to remove the other), differentiate, set to zero, solve, and check it's a maximum with f″.</p>`),
T(`<h3>Key points</h3><ul><li>First principles for x² and x³.</li><li>Rewrite, differentiate, substitute.</li><li>Stationary points: f′ = 0; classify with f″.</li></ul>`)]),
LH('am2-3-2','Integration in Year 12',10,'Integrate powers of x, find areas, and remember the + c.',[
RM(`<p>∫ xⁿ dx = xⁿ⁺¹/(n + 1) + c (n ≠ −1). Definite integrals give areas.</p>`),
T(`<h3>The essentials</h3><ul><li><b>Indefinite</b>: add 1 to the power, divide by the new power, + c.</li><li><b>Find c</b> from a given point on the curve.</li><li><b>Definite</b>: [F(x)]ₐᵇ = F(b) − F(a).</li><li>Areas <b>below</b> the axis come out negative: split the integral and use the size.</li></ul>`),
W('calcDrill',{skill:['intpow','intneg','defint','area'],need:5},`Mixed Year 12 integration. Get 5 right to master it.`,`Up one, divide by the new power.`),
W('stepCalc',{steps:[`dy/dx = 6x² − 2, and the curve passes through (1, 5). Find y.`,`Integrate: y = 2x³ − 2x + c`,`At (1, 5): 5 = 2 − 2 + c, so c = 5`,`<b>y = 2x³ − 2x + 5</b>`]},`Find the constant.`,`Substitute the point after integrating.`),
Q(`∫<sub>−1</sub><sup>1</sup> x³ dx = 0. Does that mean there's no area?`,[`No: the areas above and below cancel`,`Yes: the curve is on the axis`,`Yes: x³ has no area`,`It means the integral is wrong`],0,`Split at x = 0.`),
T(`<h3>Key points</h3><ul><li><b>∫ xⁿ dx = xⁿ⁺¹/(n + 1) + c</b>.</li><li>Use a point to find c.</li><li>Split areas that cross the axis.</li></ul>`)]),
LH('am2-3-3','Exponentials and logarithms',11,'Growth and decay, and the logs that undo them.',[
RM(`<p>d/dx(eᵏˣ) = keᵏˣ. ln undoes e: ln(eˣ) = x. log laws: log(ab) = log a + log b, log(aⁿ) = n log a.</p>`),
T(`<h3>Logs</h3><div class="eq">log<sub>a</sub> b = c &nbsp;⟺&nbsp; aᶜ = b</div><p>To solve aˣ = b, take logs: x = ln b / ln a.</p>`),
W('calcDrill',{skill:'a_logsolve',need:3},`Solve exponential equations. Get 3 right to master it.`,`x = ln N ÷ ln b.`),
T(`<h3>Modelling</h3><p>y = Ae<sup>kt</sup> models growth (k > 0) or decay (k < 0). Its rate of change is proportional to its size: dy/dt = ky.</p><p><b>Turning curves into lines</b>: if y = axⁿ, then log y = n log x + log a: a straight line with gradient n. If y = abˣ, then log y = x log b + log a.</p>`),
Q(`Plotting log y against log x gives a straight line. The model is…`,[`y = axⁿ`,`y = abˣ`,`y = mx + c`,`y = a + bx²`],0,`log y = n log x + log a.`),
N(`A population P = 200e<sup>0.05t</sup>. Find P when t = 10. (nearest whole number)`,330,0.003,'',`200e<sup>0.5</sup> = 329.7.`),
T(`<h3>Key points</h3><ul><li><b>log<sub>a</sub> b = c ⟺ aᶜ = b</b>.</li><li>y = Ae<sup>kt</sup>: rate ∝ size.</li><li>Log graphs turn powers and exponentials into straight lines.</li></ul>`)])
]});

U({id:'am2-4',track:'am',level:2,title:'Statistics and mechanics',icon:'μ',color:'#D85A30',desc:'The binomial distribution and hypothesis testing, kinematics, and Newton\'s laws.',lessons:[
LH('am2-4-1','The binomial distribution',10,'Fixed number of trials, two outcomes, same chance each time: binomial.',[
RM(`<p>Independent events: P(A and B) = P(A) × P(B). ⁿCᵣ counts arrangements.</p>`),
T(`<h3>X ~ B(n, p)</h3><p>Use it when there are: a <b>fixed number</b> n of trials, each with <b>two outcomes</b>, the <b>same probability</b> p each time, and trials are <b>independent</b>.</p><div class="eq">P(X = r) = ⁿCᵣ pʳ(1 − p)ⁿ⁻ʳ</div>`),
W('calcDrill',{skill:'a_binomP',need:3},`Binomial probabilities. Get 3 right to master it.`,`ⁿCᵣ pʳ(1 − p)ⁿ⁻ʳ.`),
Q(`Which is NOT a condition for a binomial model?`,[`The probability changes each trial`,`Fixed number of trials`,`Two outcomes per trial`,`Independent trials`],0,`p must stay the same.`),
T(`<h3>Cumulative probabilities</h3><p>P(X ≤ r) adds up P(X = 0) to P(X = r). Calculators do this directly. Watch the wording: "fewer than 4" is P(X ≤ 3); "at least 4" is 1 − P(X ≤ 3).</p>`),
T(`<h3>Key points</h3><ul><li><b>B(n, p)</b>: fixed n, two outcomes, constant p, independent.</li><li><b>P(X = r) = ⁿCᵣpʳ(1 − p)ⁿ⁻ʳ</b>.</li><li>Translate "at least" and "fewer than" carefully.</li></ul>`)]),
LH('am2-4-2','Hypothesis testing',11,'Is a coin biased? Assume it isn\'t, and see whether the evidence makes that hard to believe.',[
RM(`<p>X ~ B(n, p). P(X ≥ r) = 1 − P(X ≤ r − 1).</p>`),
T(`<h3>The method</h3><ol><li><b>H₀</b>: the null hypothesis, e.g. p = 0.5.</li><li><b>H₁</b>: the alternative, e.g. p > 0.5 (one-tailed) or p ≠ 0.5 (two-tailed).</li><li>Assume H₀ and find the probability of a result at least as extreme as the one observed.</li><li>If it's below the <b>significance level</b> (often 5%), <b>reject H₀</b>.</li><li>Conclude <b>in context</b>.</li></ol>`),
W('stepCalc',{steps:[`A coin lands heads 9 times in 10. Test at 5% whether it's biased towards heads.`,`H₀: p = 0.5. H₁: p > 0.5. X ~ B(10, 0.5).`,`P(X ≥ 9) = P(9) + P(10) = 10/1024 + 1/1024 = 0.0107`,`0.0107 < 0.05, so reject H₀.`,`<b>There's evidence at the 5% level that the coin is biased towards heads.</b>`]},`A one-tailed binomial test.`,`Never say H₀ is "proved false": say there's evidence against it.`),
Q(`A two-tailed test at 5% puts how much in each tail?`,[`2.5%`,`5%`,`10%`,`1%`],0,`Split the significance level.`),
Q(`What's the critical region?`,[`The values of the test statistic that lead to rejecting H₀`,`The values where H₀ is true`,`The mean of the distribution`,`Always X > 5`],0,`Reject if you land there.`),
T(`<h3>Key points</h3><ul><li>State <b>H₀</b> and <b>H₁</b>, using the parameter p.</li><li>Compare the probability with the significance level.</li><li>Conclude <b>in context</b>, without claiming certainty.</li></ul>`)]),
LH('am2-4-3','Kinematics and forces',11,'suvat for constant acceleration, and F = ma with friction.',[
RM(`<p>v = u + at, s = ut + ½at², v² = u² + 2as, s = ½(u + v)t. F = ma. Weight W = mg.</p>`),
T(`<h3>suvat</h3><p>For <b>constant acceleration</b>, list the five quantities, tick the three you know, pick the equation with your three and the one you want.</p>`),
W('calcDrill',{skill:'g_suvat',need:3},`suvat practice. Get 3 right to master it.`,`List s, u, v, a, t.`),
T(`<h3>Newton's laws and friction</h3><ul><li><b>Resultant force = ma</b> along the direction of motion.</li><li>Friction opposes motion: F ≤ μR, and F = μR when sliding.</li><li>On a horizontal surface, the normal reaction R = mg (if no other vertical forces).</li></ul>`),
W('calcDrill',{skill:'a_newton',need:3},`Forces and friction. Get 3 right to master it.`,`Resultant ÷ mass.`),
T(`<h3>Variable acceleration</h3><p>If acceleration isn't constant, suvat doesn't apply. Use calculus: v = ds/dt, a = dv/dt, and integrate to go the other way.</p>`),
T(`<h3>Key points</h3><ul><li><b>suvat</b> only for constant acceleration.</li><li><b>F = ma</b> with the resultant force; friction <b>F = μR</b> when sliding.</li><li>Variable acceleration: <b>differentiate and integrate</b>.</li></ul>`)])
]});

GOALS.am1={icon:'🧱',title:'Bridge from GCSE',story:'Only do these if you need them. Each unit makes a GCSE skill automatic before Year 12 begins.',final:'Ready for A-level',steps:['Algebra fluency','Graphs and equations']};
GOALS.am2={icon:'📘',title:'Master Year 12 maths',story:'Each unit covers a strand of Edexcel A-level Maths Year 1: pure, statistics and mechanics.',final:'Year 12 complete',steps:['Proof and algebra','Circles, trigonometry and the binomial','Calculus and exponentials','Statistics and mechanics']};
