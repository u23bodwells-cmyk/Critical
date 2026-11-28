/* ========== A-LEVEL MATHS · LEVEL 3 Year 13 · LEVEL 4 A* technique ========== */
CGEN.a_arith=function(){var a=cR(-5,10),d=cNZ(-4,6),n=cR(5,30),S=n*(2*a+(n-1)*d)/2;
 return {p:'An arithmetic series has first term '+cNum(a)+' and common difference '+cNum(d)+'. Find the sum of the first '+n+' terms.',b:[cB(S,'S = ')],e:'Sₙ = n/2 [2a + (n − 1)d] = '+n+'/2 × [2 × '+cBr(a)+' + '+(n-1)+' × '+cBr(d)+'] = '+cNum(S)+'.'}};
CGEN.a_sector=function(){var r=cR(2,12),t=cP([0.5,0.8,1,1.2,1.5,2,2.5]),w=cR(0,1),v=w?0.5*r*r*t:r*t;
 return {p:'A sector has radius '+r+' cm and angle '+t+' radians. Find its '+(w?'area (cm²)':'arc length (cm)')+'.',b:[cB(v,'','','value')],e:(w?'Area = ½r²θ = ½ × '+(r*r)+' × '+t:'Arc = rθ = '+r+' × '+t)+' = '+cNum(v)+'.'}};
CGEN.a_rcos=function(){var t=cP([[3,4,5],[5,12,13],[8,15,17],[6,8,10],[1,1,Math.SQRT2],[7,24,25]]),a=t[0],b=t[1],al=Math.round(Math.atan2(b,a)*180/Math.PI*100)/100;
 return {p:'Write '+a+'cos θ + '+b+'sin θ as R cos(θ − α). Find R and α (degrees, 2 d.p.).',b:[cB(Math.round(t[2]*1000)/1000,'R = ','','R',false,0.002),cB(al,'α = ','°','α',false,0.001)],e:'R = √('+a+'² + '+b+'²) = '+cNum(Math.round(t[2]*1000)/1000)+'. tan α = '+b+'/'+a+', so α = '+cNum(al)+'°.'}};
CGEN.a_zscore=function(){var mu=cR(20,80),sd=cR(2,10),z=cP([-2,-1.5,-1,-0.5,0.5,1,1.5,2,2.5]),x=mu+z*sd;
 return {p:'X ~ N('+mu+', '+sd+'²). Standardise x = '+cNum(x)+': find z.',b:[cB(z,'z = ')],e:'z = (x − μ)/σ = ('+cNum(x)+' − '+mu+')/'+sd+' = '+cNum(z)+'.'}};
CGEN.a_moment=function(){var L=cR(4,10),m=cR(5,40),d=cR(1,L-1),F=Math.round(m*9.8*d/L*100)/100;
 return {p:'A light rod of length '+L+' m is supported at each end. A '+m+' kg mass hangs '+d+' m from the left end. Find the reaction at the right end. (g = 9.8, 2 d.p.)',b:[cB(F,'R = ',' N','reaction',false,0.005)],e:'Take moments about the left end: R × '+L+' = '+m+' × 9.8 × '+d+'. R = '+cNum(F)+' N.'}};
CGEN.a_proj=function(){var u=cR(10,30),a=cP([30,45,60]),uy=u*Math.sin(a*Math.PI/180),t=Math.round(2*uy/9.8*100)/100;
 return {p:'A ball is projected at '+u+' m/s at '+a+'° above horizontal ground. Find its time of flight. (g = 9.8, 2 d.p.)',b:[cB(t,'t = ',' s','time',false,0.005)],e:'Vertical: u sin θ = '+cNum(Math.round(uy*100)/100)+' m/s. s = 0 when t = 2u sin θ / g = '+cNum(t)+' s.'}};

/* ---- Level 3: Year 13 ---- */
U({id:'am3-1',track:'am',level:3,title:'Functions and sequences',icon:'f∘g',color:'#7F77DD',desc:'Composite and inverse functions, modulus, sequences and series, and the general binomial expansion.',lessons:[
LH('am3-1-1','Functions in depth',11,'Composite functions, inverses, the modulus and graph transformations.',[
RM(`<p>A function maps each input to one output. fg(x) means do g first, then f. The inverse undoes the function.</p>`),
T(`<h3>The essentials</h3><ul><li><b>Domain</b>: the inputs allowed. <b>Range</b>: the outputs produced.</li><li><b>fg(x) = f(g(x))</b>: g first.</li><li><b>f⁻¹</b> exists only if f is one-to-one; its domain is f's range. Find it by swapping x and y and rearranging.</li><li><b>|x|</b>: the modulus, the size without the sign. y = |f(x)| reflects the negative parts up.</li></ul>`),
W('calcDrill',{skill:'g_func',need:3},`Composite and inverse functions. Get 3 right to master it.`,`fg: g first.`),
T(`<h3>Transformations</h3><ul><li>y = f(x) + a: up a. y = f(x + a): left a.</li><li>y = af(x): stretch vertically by a. y = f(ax): stretch horizontally by 1/a.</li><li>y = −f(x): reflect in the x-axis. y = f(−x): in the y-axis.</li></ul>`),
Q(`y = f(2x) is a stretch…`,[`horizontally, scale factor ½`,`horizontally, scale factor 2`,`vertically, scale factor 2`,`vertically, scale factor ½`],0,`Inside the bracket: opposite of what you'd expect.`),
T(`<h3>Key points</h3><ul><li><b>fg = f(g(x))</b>; inverse by swapping x and y.</li><li>Domain of f⁻¹ = range of f.</li><li>Changes inside the bracket act on x the "wrong" way.</li></ul>`)]),
LH('am3-1-2','Sequences and series',11,'Arithmetic and geometric series, sigma notation and recurrence relations.',[
RM(`<p>Arithmetic: add d each time. Geometric: multiply by r each time. S∞ = a/(1 − r) for |r| < 1 (Calculus Level 10).</p>`),
T(`<h3>The formulas</h3><ul><li>Arithmetic: uₙ = a + (n − 1)d, <b>Sₙ = n/2 [2a + (n − 1)d]</b>.</li><li>Geometric: uₙ = arⁿ⁻¹, <b>Sₙ = a(1 − rⁿ)/(1 − r)</b>, S∞ = a/(1 − r) if |r| < 1.</li></ul>`),
W('calcDrill',{skill:'a_arith',need:3},`Arithmetic series. Get 3 right to master it.`,`n/2 [2a + (n − 1)d].`),
W('calcDrill',{skill:'geomsum',need:2},`Geometric sums to infinity. Get 2 right to master it.`,`a/(1 − r).`),
T(`<h3>Recurrence relations</h3><p>uₙ₊₁ = f(uₙ) defines each term from the one before. A sequence is <b>increasing</b>, <b>decreasing</b> or <b>periodic</b> (repeats). Σ notation: Σ<sub>r=1</sub><sup>n</sup> means "add up for r = 1 to n".</p>`),
Q(`uₙ₊₁ = 1/uₙ with u₁ = 3 gives 3, 1/3, 3, 1/3, … This sequence is…`,[`periodic with period 2`,`increasing`,`decreasing`,`arithmetic`],0,`It repeats every 2 terms.`),
T(`<h3>Key points</h3><ul><li>Arithmetic Sₙ = n/2[2a + (n − 1)d]. Geometric Sₙ = a(1 − rⁿ)/(1 − r).</li><li>S∞ only if |r| < 1.</li><li>Recurrences can be increasing, decreasing or periodic.</li></ul>`)]),
LH('am3-1-3','The general binomial expansion',11,'For negative and fractional powers, the binomial expansion goes on forever, and partial fractions help.',[
RM(`<p>(1 + x)ⁿ for positive whole n: Pascal's triangle. Partial fractions split a fraction into simpler pieces (Calculus Level 8).</p>`),
T(`<h3>Any power n</h3><div class="eq">(1 + x)ⁿ = 1 + nx + n(n − 1)x²/2! + n(n − 1)(n − 2)x³/3! + …</div><p>For negative or fractional n it never ends, and it's only valid for <b>|x| < 1</b>.</p>`),
W('stepCalc',{steps:[`Expand (1 + x)<sup>−1</sup> up to x³`,`n = −1: 1 + (−1)x + (−1)(−2)x²/2 + (−1)(−2)(−3)x³/6`,`<b>= 1 − x + x² − x³ + …</b>`,`Valid for |x| < 1. It's the geometric series with r = −x.`]},`A negative power.`,`Check against what you know.`),
Q(`(1 + 3x)<sup>½</sup> is valid for…`,[`|x| < 1/3`,`|x| < 1`,`|x| < 3`,`all x`],0,`|3x| < 1.`),
N(`Use (1 + x)<sup>½</sup> ≈ 1 + x/2 − x²/8 with x = 0.02 to estimate √1.02. (5 d.p.)`,1.00995,0.00001,'',`1 + 0.01 − 0.00005 = 1.00995.`),
T(`<h3>With partial fractions</h3><p>To expand something like (5x + 1)/((1 − x)(1 + 2x)), split it into partial fractions first, then expand each piece and add. The overall validity is the narrower range.</p>`),
T(`<h3>Key points</h3><ul><li><b>(1 + x)ⁿ = 1 + nx + n(n − 1)x²/2! + …</b></li><li>Infinite for negative/fractional n; valid for <b>|x| < 1</b>.</li><li>Partial fractions first for messy fractions.</li></ul>`)])
]});

U({id:'am3-2',track:'am',level:3,title:'Trigonometry in Year 13',icon:'R cos',color:'#1D9E75',desc:'Radians, reciprocal and inverse functions, compound angle formulae and R cos(θ − α).',lessons:[
LH('am3-2-1','Radians',10,'Measure angles by arc length, and sectors and small-angle approximations become simple.',[
RM(`<p>π radians = 180°. Calculus with trig always uses radians (Calculus Level 6).</p>`),
T(`<h3>Sectors</h3><div class="eq">arc length = rθ&nbsp;&nbsp;&nbsp; sector area = ½r²θ&nbsp;&nbsp;(θ in radians)</div>`),
W('calcDrill',{skill:'a_sector',need:3},`Arcs and sectors. Get 3 right to master it.`,`rθ and ½r²θ.`),
T(`<h3>Small angles</h3><p>For small θ in radians: <b>sin θ ≈ θ</b>, <b>tan θ ≈ θ</b>, <b>cos θ ≈ 1 − θ²/2</b>. (They're the first terms of the Taylor series.)</p>`),
Q(`For small θ, (sin 3θ)/θ ≈ …`,[`3`,`1`,`θ`,`1/3`],0,`sin 3θ ≈ 3θ.`),
T(`<h3>Key points</h3><ul><li><b>π rad = 180°</b>.</li><li>Arc rθ, sector ½r²θ.</li><li>Small angles: sin θ ≈ θ, cos θ ≈ 1 − θ²/2.</li></ul>`)]),
LH('am3-2-2','Reciprocal functions and compound angles',11,'sec, cosec and cot, two more identities, and the addition formulae.',[
RM(`<p>sin²θ + cos²θ = 1. tan θ = sin θ / cos θ.</p>`),
T(`<h3>Reciprocals</h3><p>sec θ = 1/cos θ, cosec θ = 1/sin θ, cot θ = 1/tan θ. Divide sin² + cos² = 1 by cos²θ or sin²θ:</p><div class="eq">1 + tan²θ = sec²θ&nbsp;&nbsp;&nbsp; 1 + cot²θ = cosec²θ</div>`),
Q(`1 + tan²θ = …`,[`sec²θ`,`cosec²θ`,`cos²θ`,`cot²θ`],0,`Divide by cos²θ.`),
T(`<h3>Compound angles</h3><div class="eq">sin(A ± B) = sin A cos B ± cos A sin B<br>cos(A ± B) = cos A cos B ∓ sin A sin B</div><p>Put A = B to get the double-angle formulae: sin 2A = 2 sin A cos A, cos 2A = cos²A − sin²A = 2cos²A − 1 = 1 − 2sin²A.</p>`),
N(`Use sin(45° + 30°) to find sin 75°. (4 d.p.)`,0.9659,0.001,'',`(√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4 ≈ 0.9659.`),
T(`<h3>Inverse trig</h3><p>arcsin, arccos and arctan undo sin, cos and tan, on restricted domains so they're one-to-one: arcsin and arctan give answers in [−π/2, π/2], arccos in [0, π].</p>`),
T(`<h3>Key points</h3><ul><li><b>1 + tan² = sec²</b>, <b>1 + cot² = cosec²</b>.</li><li>Addition formulae → double-angle formulae.</li><li>Inverse trig functions have restricted ranges.</li></ul>`)]),
LH('am3-2-3','R cos(θ − α)',10,'Any mix of sin and cos is one wave in disguise.',[
RM(`<p>cos(A − B) = cos A cos B + sin A sin B. Pythagoras.</p>`),
T(`<h3>The harmonic form</h3><p>a cos θ + b sin θ = R cos(θ − α), where:</p><div class="eq">R = √(a² + b²),&nbsp;&nbsp; tan α = b/a</div><p>Expand R cos(θ − α) = R cos α cos θ + R sin α sin θ, and match: R cos α = a, R sin α = b.</p>`),
W('calcDrill',{skill:'a_rcos',need:3},`Harmonic form. Get 3 right to master it.`,`R = √(a² + b²), tan α = b/a.`),
Q(`3cos θ + 4sin θ has a maximum value of…`,[`5`,`7`,`4`,`1`],0,`R = 5, and cos has max 1.`),
T(`<h3>Why it's useful</h3><p>It gives the maximum (R), minimum (−R) and where they happen, and turns equations like 3cos θ + 4sin θ = 2 into one cos equation. In AC circuits and vibrations it combines two waves into one.</p>`),
T(`<h3>Key points</h3><ul><li><b>a cos θ + b sin θ = R cos(θ − α)</b>.</li><li><b>R = √(a² + b²)</b>, <b>tan α = b/a</b>.</li><li>Max R, min −R.</li></ul>`)])
]});

U({id:'am3-3',track:'am',level:3,title:'Further calculus',icon:'∫ u dv',color:'#378ADD',desc:'The chain, product and quotient rules, parametric and implicit differentiation, integration techniques, differential equations and numerical methods.',lessons:[
LH('am3-3-1','Differentiation techniques',11,'Every Year 13 differentiation rule, and where to practise each slowly in the Calculus track.',[
RM(`<p>The Calculus track covers these in Levels 3, 7 and 11. Chain: dy/dx = dy/du × du/dx. Product: u′v + uv′. Quotient: (u′v − uv′)/v².</p>`),
T(`<h3>The Year 13 toolkit</h3><ul><li>eˣ, ln x, sin, cos, tan, and aˣ (d/dx aˣ = aˣ ln a).</li><li><b>Chain, product and quotient</b> rules.</li><li><b>Parametric</b>: dy/dx = (dy/dt)/(dx/dt).</li><li><b>Implicit</b>: differentiate y terms and multiply by dy/dx.</li><li><b>Connected rates</b>: chain rule with time.</li><li>Second derivative for <b>concave/convex</b> and <b>points of inflection</b>.</li></ul>`),
W('calcDrill',{skill:['chain','product','quotient','paramgrad','implicit'],need:6},`Mixed Year 13 differentiation. Get 6 right to master it.`,`Pick the right rule first.`),
Q(`A point of inflection is where…`,[`the curve changes between concave and convex`,`the gradient is always zero`,`the function has a maximum`,`the curve crosses the y-axis`],0,`f″ changes sign.`),
T(`<h3>Key points</h3><ul><li>Choose the rule: chain (function of a function), product, quotient.</li><li>Parametric and implicit differentiation.</li><li>f″ changing sign: <b>point of inflection</b>.</li></ul>`)]),
LH('am3-3-2','Integration techniques',11,'Substitution, by parts, partial fractions and trig identities: the Year 13 integration kit.',[
RM(`<p>Calculus Levels 4 and 8 build these slowly. ∫ f′/f dx = ln|f| + c. By parts: ∫ u dv = uv − ∫ v du.</p>`),
T(`<h3>The Year 13 kit</h3><ul><li>Standard integrals: eˣ, 1/x, sin, cos, sec², and f(ax + b).</li><li><b>Reverse chain rule</b> and ∫ f′/f = ln|f|.</li><li><b>Substitution</b>, <b>by parts</b>, <b>partial fractions</b>.</li><li><b>Trig identities</b> for sin², cos², tan².</li><li><b>Area</b> between curves and under parametric curves: ∫ y (dx/dt) dt.</li></ul>`),
W('calcDrill',{skill:['intexp','int1x','subst','parts','pfrac'],need:5},`Mixed Year 13 integration. Get 5 right to master it.`,`Work down the decision list.`),
Q(`∫ x eˣ dx needs…`,[`integration by parts`,`partial fractions`,`a trig identity`,`no technique`],0,`Product of types.`),
T(`<h3>Key points</h3><ul><li>Spot standard forms and f′/f first.</li><li>Then substitution, parts or partial fractions.</li><li>Parametric area: ∫ y (dx/dt) dt.</li></ul>`)]),
LH('am3-3-3','Differential equations and numerical methods',11,'Separate variables to solve, and use iteration when algebra runs out.',[
RM(`<p>Separating variables (Calculus Level 5). Newton's method (Calculus Level 7). Trapezium rule (Calculus Level 5).</p>`),
T(`<h3>Differential equations</h3><p>Separate, integrate both sides, include one constant, use the initial condition. Then interpret the model: what happens as t → ∞?</p>`),
W('calcDrill',{skill:'sepode',need:2},`Separable differential equations. Get 2 right to master it.`,`Separate, integrate, use the start value.`),
T(`<h3>Numerical methods</h3><ul><li><b>Change of sign</b>: if f is continuous and changes sign on [a, b], a root lies between.</li><li><b>Iteration</b> xₙ₊₁ = g(xₙ): staircase or cobweb diagrams show convergence.</li><li><b>Newton–Raphson</b>: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). Fails if f′(xₙ) ≈ 0.</li><li><b>Trapezium rule</b>: overestimates for a convex curve, underestimates for concave.</li></ul>`),
Q(`When does Newton–Raphson fail?`,[`When f′(xₙ) is zero or close to zero`,`When f(xₙ) is zero`,`When x is negative`,`It never fails`],0,`The tangent is flat and shoots far away.`),
W('calcDrill',{skill:'trap',need:2},`The trapezium rule. Get 2 right to master it.`,`(h/2)[ends + 2 × middles].`),
T(`<h3>Key points</h3><ul><li>Separate, integrate, apply the condition, interpret.</li><li>Change of sign, iteration, <b>Newton–Raphson</b>.</li><li>Trapezium rule: over for convex, under for concave.</li></ul>`)])
]});

U({id:'am3-4',track:'am',level:3,title:'Vectors, statistics and mechanics',icon:'N(μ,σ²)',color:'#D85A30',desc:'3D vectors, the normal distribution, moments, friction and projectiles.',lessons:[
LH('am3-4-1','The normal distribution',11,'The bell curve: heights, errors, exam marks, and the approximation to the binomial.',[
RM(`<p>Mean μ and standard deviation σ. Hypothesis testing: compare a probability with the significance level.</p>`),
T(`<h3>X ~ N(μ, σ²)</h3><ul><li>Symmetrical about μ; bell-shaped.</li><li>About <b>68%</b> within 1σ, <b>95%</b> within 2σ, <b>99.7%</b> within 3σ.</li><li>Points of inflection at μ ± σ.</li><li>Standardise with <b>z = (x − μ)/σ</b> to use Z ~ N(0, 1).</li></ul>`),
W('calcDrill',{skill:'a_zscore',need:3},`Standardising. Get 3 right to master it.`,`z = (x − μ)/σ.`),
Q(`About what percentage of a normal distribution lies within 2 standard deviations of the mean?`,[`95%`,`68%`,`99.7%`,`50%`],0,`The 68–95–99.7 rule.`),
T(`<h3>More Year 13 statistics</h3><ul><li><b>Binomial → normal</b> when n is large and p near 0.5: N(np, np(1 − p)), with a continuity correction.</li><li><b>Hypothesis test for a mean</b>: X̄ ~ N(μ, σ²/n).</li><li><b>Correlation test</b> using the product moment correlation coefficient r.</li><li><b>Conditional probability</b> and Venn and tree diagrams.</li></ul>`),
T(`<h3>Key points</h3><ul><li><b>68–95–99.7</b> rule.</li><li><b>z = (x − μ)/σ</b>.</li><li>Sample mean: X̄ ~ N(μ, σ²/n).</li></ul>`)]),
LH('am3-4-2','Moments and friction',11,'Turning effects, balance, and objects on slopes.',[
RM(`<p>Moment = force × perpendicular distance. Friction F ≤ μR. Resolve forces into perpendicular components.</p>`),
T(`<h3>Equilibrium</h3><p>For a rigid body at rest: forces balance in every direction <b>and</b> moments balance about <b>any</b> point. Take moments about a point where an unknown force acts, to remove it.</p>`),
W('calcDrill',{skill:'a_moment',need:3},`Moments on a rod. Get 3 right to master it.`,`Moments about the left end.`),
T(`<h3>Slopes</h3><p>On a slope at angle θ: resolve weight into mg sin θ <b>down the slope</b> and mg cos θ <b>into the slope</b>. So R = mg cos θ, and limiting friction is μmg cos θ.</p>`),
Q(`A block is about to slide down a rough slope. tan θ = …`,[`μ`,`1/μ`,`μ²`,`g`],0,`mg sin θ = μmg cos θ.`),
T(`<h3>Key points</h3><ul><li>Equilibrium: forces <b>and</b> moments balance.</li><li>Take moments about an unknown force.</li><li>Slope: R = mg cos θ; limiting friction when μ = tan θ.</li></ul>`)]),
LH('am3-4-3','Projectiles and 3D vectors',11,'Split motion into horizontal and vertical, and extend vectors into three dimensions.',[
RM(`<p>suvat with constant acceleration. Vectors in 3D: ⟨a, b, c⟩, magnitude √(a² + b² + c²) (Calculus Level 11).</p>`),
T(`<h3>Projectiles</h3><ul><li><b>Horizontal</b>: constant velocity u cos θ (no acceleration).</li><li><b>Vertical</b>: suvat with a = −g, starting at u sin θ.</li><li>Time links them. Range on flat ground = u² sin 2θ / g, greatest at 45°.</li></ul>`),
W('calcDrill',{skill:'a_proj',need:3},`Times of flight. Get 3 right to master it.`,`t = 2u sin θ / g.`),
T(`<h3>3D vectors at A-level</h3><p>Position vectors, distances between points, and vector problems in 3D. A-level uses i, j, k notation. (The dot and cross products are Further Maths, covered in Calculus Level 11.)</p>`),
W('calcDrill',{skill:'vmag',need:2},`Magnitudes in 3D. Get 2 right to master it.`,`√(a² + b² + c²).`),
T(`<h3>Key points</h3><ul><li>Projectiles: horizontal constant, vertical suvat with −g.</li><li>Range u² sin 2θ / g, max at 45°.</li><li>3D vectors with i, j, k.</li></ul>`)])
]});

/* ---- Level 4: A* technique ---- */
U({id:'am4-1',track:'am',level:4,title:'Hard problem solving',icon:'A*',color:'#7F77DD',desc:'Proof by contradiction, modelling, and multi-step problems that combine topics.',lessons:[
LH('am4-1-1','Proof by contradiction',11,'Assume the opposite, follow the logic, and hit something impossible.',[
RM(`<p>Proof by deduction and exhaustion (Level 2). Even = 2n, odd = 2n + 1. A rational number is a/b with integers a, b and b ≠ 0.</p>`),
T(`<h3>The method</h3><ol><li>Assume the statement is <b>false</b>.</li><li>Reason logically from that assumption.</li><li>Reach a <b>contradiction</b>: something impossible.</li><li>So the assumption was wrong, and the statement is true.</li></ol>`),
W('stepCalc',{steps:[`Prove √2 is irrational.`,`Assume √2 = a/b, a fraction in its simplest form (a and b share no factor).`,`Square: 2 = a²/b², so a² = 2b². So a² is even, so a is even: a = 2k.`,`Then 4k² = 2b², so b² = 2k²: b² is even, so b is even.`,`a and b are both even: they share a factor of 2. <b>Contradiction</b>. So √2 is irrational. ∎`]},`The classic proof.`,`The contradiction is with "simplest form".`),
Q(`To prove "there are infinitely many primes" by contradiction, you start by assuming…`,[`there are only finitely many primes`,`there are infinitely many primes`,`every number is prime`,`2 is the only prime`],0,`Assume the opposite.`),
Q(`What's the key step that makes a proof by contradiction work?`,[`Showing the assumption leads to something impossible`,`Checking many examples`,`Finding one counter-example`,`Drawing a graph`],0,`The contradiction.`),
T(`<h3>Key points</h3><ul><li>Assume the opposite, reach a contradiction.</li><li>√2 irrational; infinitely many primes.</li><li>State clearly what's contradicted.</li></ul>`)]),
LH('am4-1-2','Modelling',10,'Turn a real situation into maths, solve, then criticise your own model.',[
RM(`<p>Differential equations model rates. Exponential models y = Ae<sup>kt</sup>. Mechanics models make assumptions (particle, light rod, smooth surface).</p>`),
T(`<h3>The cycle</h3><ol><li>State <b>assumptions</b>.</li><li>Build the model (an equation).</li><li>Solve it.</li><li><b>Interpret</b> the answer in context, with units.</li><li><b>Evaluate</b>: limitations, and how to refine it.</li></ol>`),
O(`Order the modelling cycle.`,['State assumptions','Build the equation','Solve it','Interpret in context','Evaluate and refine'],`Top marks need the last two steps.`),
T(`<h3>Typical criticisms</h3><ul><li>Exponential growth can't continue forever: resources run out (use a logistic model).</li><li>Treating an object as a particle ignores its size and spin.</li><li>Ignoring air resistance overestimates range.</li><li>A model fitted to limited data may not extrapolate.</li></ul>`),
Q(`A model predicts a population of 10 billion rabbits on an island in 20 years. The best criticism?`,[`Exponential growth can't continue: food and space are limited`,`The arithmetic must be wrong`,`Rabbits don't reproduce`,`The model has too few letters`],0,`Limits to growth.`),
T(`<h3>Key points</h3><ul><li>Assume, model, solve, <b>interpret, evaluate</b>.</li><li>Always comment on limits of the model.</li><li>Answers need context and units.</li></ul>`)]),
LH('am4-1-3','Multi-step problems',11,'The hardest questions combine topics. Plan before you calculate.',[
RM(`<p>Every Year 12 and 13 topic: algebra, trig, calculus, vectors, statistics, mechanics.</p>`),
T(`<h3>A strategy</h3><ol><li><b>Read it all</b>, underlining what's given and what's asked.</li><li><b>Sketch</b> a diagram or graph.</li><li>Ask: which topics does this link? Calculus + trig? Vectors + geometry?</li><li>Work <b>backwards</b> from what you need.</li><li>Keep <b>exact values</b> (surds, π, ln) until the end.</li><li><b>Check</b> the answer makes sense.</li></ol>`),
W('stepCalc',{steps:[`The curve y = x² − 4x + 7 and the line y = 2x − 2 enclose a region. Find its area.`,`Link: simultaneous equations, then integration.`,`Meet: x² − 4x + 7 = 2x − 2, so x² − 6x + 9 = 0, (x − 3)² = 0. Only x = 3!`,`One meeting point means the line is a tangent: there's no enclosed region.`,`<b>Checking the set-up saved you from a meaningless integral.</b>`]},`A trap that rewards checking.`,`Strong candidates check their set-up before integrating.`),
Q(`Why keep exact values until the end?`,[`Rounding early loses accuracy and marks`,`Examiners dislike decimals at all times`,`Exact values are always smaller`,`To make it look harder`],0,`Errors compound.`),
T(`<h3>Key points</h3><ul><li>Read, sketch, link topics, plan.</li><li>Keep <b>exact</b> values.</li><li>Check answers make sense.</li></ul>`)])
]});

U({id:'am4-2',track:'am',level:4,title:'Exam technique',icon:'✓',color:'#1D9E75',desc:'Show-that questions, exact answers, statistics and mechanics traps, and timing.',lessons:[
LH('am4-2-1','Show that and exact answers',10,'A "show that" gives you the answer. The marks are all for the working.',[
RM(`<p>Exact values: surds, π, ln and fractions. Proofs end with a clear conclusion.</p>`),
T(`<h3>Show that</h3><ul><li>Every step must be visible. Skipping a step loses marks even if the answer is right.</li><li>Work towards the given result; never write it down then work backwards silently.</li><li>Finish by writing the given result exactly as stated.</li></ul>`),
Q(`In a "show that x = 2 + √3" question, what earns the marks?`,[`Clear working that reaches 2 + √3`,`Writing 2 + √3 on its own`,`A decimal answer of 3.732`,`Checking with a calculator only`],0,`The working is the answer.`),
T(`<h3>Exact answers</h3><p>"Exact" means no rounding: leave √3, π, ln 5, ⅓. "Give your answer in the form a + b√c" tells you the shape: match it exactly.</p>`),
Q(`An answer of 1.0986 when ln 3 was asked "exactly" will…`,[`lose the final mark`,`get full marks`,`get extra marks`,`be marked as ln 3`],0,`Not exact.`),
T(`<h3>Key points</h3><ul><li><b>Show that</b>: every step visible.</li><li><b>Exact</b>: surds, π, ln, fractions.</li><li>Match any requested form.</li></ul>`)]),
LH('am4-2-2','Statistics and mechanics traps',10,'The mistakes that cost the most marks in Paper 3, and how to avoid them.',[
RM(`<p>Hypothesis tests conclude in context. suvat needs constant acceleration. Friction opposes motion.</p>`),
T(`<h3>Statistics</h3><ul><li>Hypotheses use the <b>parameter</b> (p or μ), not the sample result.</li><li>Conclusions in context, never "H₀ is true".</li><li>"At least" and "fewer than" with discrete distributions: P(X ≥ 4) = 1 − P(X ≤ 3).</li><li>Normal: sketch the curve and shade the region.</li></ul>`),
T(`<h3>Mechanics</h3><ul><li>Draw a <b>force diagram</b> every time.</li><li>Choose a positive direction and stick to it.</li><li>Use g = 9.8 unless told otherwise; give answers to 2 or 3 s.f. if you used 9.8.</li><li>Don't use suvat when acceleration varies.</li></ul>`),
W('matchPairs',{pairs:[['H₁: p > 0.3','A one-tailed test'],['P(X ≥ 4)','1 − P(X ≤ 3)'],['Acceleration depends on t','Use calculus, not suvat'],['Limiting friction','F = μR']]},`Match each.`),
Q(`After using g = 9.8, how many significant figures should a final answer have?`,[`2 or 3`,`10`,`1`,`As many as the calculator shows`],0,`g is given to 2 s.f.`),
T(`<h3>Key points</h3><ul><li>Hypotheses about the parameter; conclude in context.</li><li>Force diagram, positive direction, suvat only for constant a.</li><li>2 or 3 s.f. after g = 9.8.</li></ul>`)]),
LH('am4-2-3','Timing and checking',9,'Two-hour papers, one mark per minute or so. Use the time like an expert.',[
RM(`<p>Each A-level Maths paper: 2 hours, 100 marks.</p>`),
T(`<h3>About a mark a minute</h3><p>100 marks in 120 minutes: roughly <b>1.2 minutes per mark</b>. A 6-mark question deserves about 7 minutes. If you're stuck for twice that, move on and come back.</p>`),
N(`An 8-mark question at 1.2 minutes per mark. Time to spend (minutes, 1 d.p.)?`,9.6,0.01,'min',`8 × 1.2.`),
T(`<h3>Checking</h3><ul><li><b>Differentiate</b> your integral to check it.</li><li><b>Substitute</b> roots back into the equation.</li><li>Is the probability between 0 and 1? Is the length positive?</li><li>Does the answer match the rough size you'd expect?</li></ul>`),
Q(`The fastest way to check ∫ result?`,[`Differentiate it`,`Integrate it again`,`Ask a friend`,`Plot it`],0,`Differentiation undoes integration.`),
T(`<h3>Key points</h3><ul><li>About <b>1.2 minutes per mark</b>.</li><li>Move on when stuck; come back.</li><li>Check by reversing: differentiate, substitute, sanity-check.</li></ul>`)])
]});

GOALS.am3={icon:'📗',title:'Master Year 13 maths',story:'Each unit covers a strand of Edexcel A-level Maths Year 2.',final:'Full A-level content covered',steps:['Functions and sequences','Trigonometry in Year 13','Further calculus','Vectors, statistics and mechanics']};
GOALS.am4={icon:'🏆',title:'Go for an A* in maths',story:'The hardest questions and the habits that earn the top grade.',final:'A* standard',steps:['Hard problem solving','Exam technique']};
