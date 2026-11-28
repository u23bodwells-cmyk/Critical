/* ========== CALCULUS · LEVEL 3 · Differentiation toolkit ========== */
U({id:'c3-1',track:'calc',level:3,title:'Stationary points',icon:'⌒',color:'#7F77DD',desc:'Where a curve is flat, the second derivative, and telling a maximum from a minimum.',lessons:[
LH('c3-1-1','Where the gradient is zero',9,'Find the exact points where a curve flattens out: tops of hills and bottoms of valleys.',[
RM(`<p>dy/dx is the gradient. Positive: increasing. Negative: decreasing. <b>Zero: stationary</b>.</p>`),
T(`<h3>Stationary points</h3><p>A <b>stationary point</b> is where the gradient is zero: the curve is momentarily flat. It's usually the top of a hill (a <b>maximum</b>) or the bottom of a valley (a <b>minimum</b>).</p><div class="eq">stationary point: dy/dx = 0</div>`),
W('fnPlot',{x:[-1,5],y:[-6,6],xl:'x',yl:'y',sl:[['a','Point x',-1,5,0.25,0,function(v){return v}]],curves:function(p){var f=function(x){return x*x-4*x+1},g=2*p.a-4,y0=f(p.a);return [[f,'--accent',3],[function(x){return y0+g*(x-p.a)},'--coral',2,[6,4]]]},read:function(p){var g=2*p.a-4;return 'y = x² − 4x + 1. At x = '+p.a+': gradient <b>'+g+'</b>'+(g===0?' · <b>stationary point!</b>':'')},goal:function(p){return p.a===2},goalMsg:'Find where the tangent is flat.'},`Slide the point until the tangent is completely flat.`,`At x = 2 the gradient is 0. That's the minimum of this curve.`),
W('stepCalc',{steps:[`Find the stationary point of y = x² − 4x + 1`,`Differentiate: dy/dx = 2x − 4`,`Set it to zero: 2x − 4 = 0`,`Solve: x = 2`,`Find y: y = 2² − 4(2) + 1 = −3`,`Stationary point: <b>(2, −3)</b>`]},`The method, step by step.`,`Differentiate, set to zero, solve for x, then find y.`),
Q(`What's the first step in finding a stationary point?`,[`Differentiate`,`Set y = 0`,`Integrate`,`Substitute x = 0`],0,`Then set dy/dx = 0.`),
W('calcDrill',{skill:'statq',need:5},`Find each stationary point. Get 5 right to master it.`,`Differentiate, set to 0, solve, then find y.`),
T(`<h3>Key points</h3><ul><li>Stationary points: <b>dy/dx = 0</b>.</li><li>Method: differentiate → set to 0 → solve for x → substitute to find y.</li></ul>`)]),
LH('c3-1-2','The second derivative',9,'Differentiate twice to find out how the gradient itself is changing.',[
RM(`<p>dy/dx is the gradient function. You get it with the power rule, term by term.</p>`),
T(`<h3>Differentiate again</h3><p>dy/dx is itself a function, so you can differentiate it too. The result is the <b>second derivative</b>:</p><div class="eq">d²y/dx²&nbsp;&nbsp;or&nbsp;&nbsp;f″(x)</div>${KY([['d²y/dx²','"d two y by d x squared": the rate of change of the gradient',''],['f″(x)','"f double dash of x"','']])}`),
W('stepCalc',{steps:[`y = x³ − 6x² + 2`,`First derivative: dy/dx = 3x² − 12x`,`Second derivative: d²y/dx² = 6x − 12`,`At x = 3: 6(3) − 12 = <b>6</b>`]},`Differentiate twice.`,`Just apply the power rule twice.`),
Q(`If dy/dx = 5x², what is d²y/dx²?`,[`10x`,`5x²`,`10x²`,`5x`],0,`Differentiate 5x² again.`),
T(`<h3>What it means</h3><p>The second derivative tells you how the <b>gradient</b> is changing:</p><ul><li>f″ &gt; 0: the gradient is increasing. The curve bends <b>up</b>, like a smile.</li><li>f″ &lt; 0: the gradient is decreasing. The curve bends <b>down</b>, like a frown.</li></ul><p>For movement, the second derivative of distance is <b>acceleration</b>.</p>`),
W('calcDrill',{skill:'second',need:5},`Second derivatives at a point. Get 5 right to master it.`,`Differentiate, differentiate again, then substitute.`),
T(`<h3>Key points</h3><ul><li>Differentiate twice for the <b>second derivative</b>, d²y/dx² or f″(x).</li><li>Positive: bends up. Negative: bends down.</li></ul>`)]),
LH('c3-1-3','Maximum or minimum?',10,'Use the second derivative to tell hills from valleys.',[
RM(`<p>Stationary points: dy/dx = 0. Second derivative positive: bends up (smile). Negative: bends down (frown).</p>`),
T(`<h3>The second derivative test</h3><p>At a stationary point:</p><ul><li>d²y/dx² &gt; 0 → <b>minimum</b> (bottom of a smile)</li><li>d²y/dx² &lt; 0 → <b>maximum</b> (top of a frown)</li><li>d²y/dx² = 0 → the test can't tell you; check the gradient either side.</li></ul>`),
Q(`At a stationary point, d²y/dx² = −8. What is it?`,[`A maximum`,`A minimum`,`Can't tell`,`Not a stationary point`],0,`Negative: frown: maximum.`),
W('fnPlot',{x:[-3,3],y:[-6,6],xl:'x',yl:'y',sl:[['a','Point x',-3,3,0.25,-2,function(v){return v}]],curves:function(p){var f=function(x){return x*x*x-3*x},g=3*p.a*p.a-3,y0=f(p.a);return [[f,'--accent',3],[function(x){return y0+g*(x-p.a)},'--coral',2,[6,4]]]},read:function(p){var g=3*p.a*p.a-3,s=6*p.a;return 'y = x³ − 3x at x = '+p.a+': dy/dx = <b>'+g+'</b>, d²y/dx² = <b>'+s+'</b>'+(g===0?(s<0?' · <b>maximum</b>':' · <b>minimum</b>'):'')},goal:function(p){return p.a===1},goalMsg:'Visit both stationary points: x = −1 and x = 1.'},`This cubic has two stationary points. Slide to x = −1, then to x = 1, and read the second derivative at each.`,`At x = −1, d²y/dx² = −6: a maximum. At x = 1, it's +6: a minimum.`),
W('stepCalc',{steps:[`Find and classify the stationary points of y = x³ − 3x`,`dy/dx = 3x² − 3 = 0, so x² = 1, so x = 1 or x = −1`,`d²y/dx² = 6x`,`At x = 1: 6 > 0, so a <b>minimum</b> at (1, −2)`,`At x = −1: −6 < 0, so a <b>maximum</b> at (−1, 2)`]},`The full method.`,`Find them, then test each one.`),
W('calcDrill',{skill:['statnat','statq'],need:6},`Find and classify. Get 6 right to master it.`,`Second derivative positive: minimum. Negative: maximum.`),
T(`<h3>Key points</h3><ul><li><b>f″ &gt; 0 → minimum</b>, <b>f″ &lt; 0 → maximum</b>.</li><li>f″ = 0: inconclusive. Check the gradient just either side.</li></ul>`)])
]});

U({id:'c3-2',track:'calc',level:3,title:'Calculus for real problems',icon:'max',color:'#1D9E75',desc:'Optimisation, displacement, velocity and acceleration, and rates of change in the plant.',lessons:[
LH('c3-2-1','Optimisation',10,'Use stationary points to find the best possible answer: the biggest area, the smallest cost.',[
RM(`<p>Stationary points: dy/dx = 0. Maximum if d²y/dx² &lt; 0.</p>`),
T(`<h3>Finding the best</h3><p>Many real questions ask for a <b>maximum</b> or <b>minimum</b>: the largest area, the least material, the lowest cost. The method:</p><ol><li>Write the quantity in terms of <b>one</b> variable.</li><li>Differentiate and set to 0.</li><li>Solve, and check it's a max or min.</li></ol>`),
W('stepCalc',{steps:[`20 m of fence makes a rectangle. What's the biggest area?`,`Call one side x. The perimeter is 20, so the other side is 10 − x`,`Area A = x(10 − x) = 10x − x²`,`dA/dx = 10 − 2x = 0, so x = 5`,`d²A/dx² = −2 < 0, so it's a maximum`,`Biggest area: 5 × 5 = <b>25 m²</b>. It's a square!`]},`A classic example.`,`One variable, differentiate, set to zero, check.`),
Q(`Why do we need the area in terms of just one variable?`,[`So we can differentiate it`,`Because rectangles have one side`,`To make it bigger`,`We don't`],0,`dA/dx needs A as a function of x only.`),
W('calcDrill',{skill:'optim',need:4},`Optimisation problems. Get 4 right to master it.`,`Write the area with one variable, differentiate, set to 0.`),
T(`<h3>Key points</h3><ul><li>Optimisation: write in <b>one variable</b> → differentiate → set to 0 → solve.</li><li>Check it's the max or min you want.</li></ul>`)]),
LH('c3-2-2','Displacement, velocity and acceleration',9,'Differentiate distance to get velocity, and velocity to get acceleration.',[
RM(`<p>A distance–time gradient is speed. The second derivative is the rate of change of the gradient.</p>`),
T(`<h3>The chain of rates</h3><div class="eq">s → v = ds/dt → a = dv/dt = d²s/dt²</div>${KY([['s','displacement (position)','m'],['v','velocity: rate of change of displacement','m/s'],['a','acceleration: rate of change of velocity','m/s²']])}`),
W('stepCalc',{steps:[`s = t³ − 2t² metres`,`v = ds/dt = 3t² − 4t`,`a = dv/dt = 6t − 4`,`At t = 2: v = 12 − 8 = <b>4 m/s</b>, a = 12 − 4 = <b>8 m/s²</b>`]},`Differentiate once for velocity, twice for acceleration.`,`Same power rule, with t instead of x.`),
Q(`An object's velocity is v = 4t. What's its acceleration?`,[`4 m/s²`,`4t m/s²`,`0`,`2t²`],0,`dv/dt = 4.`),
W('calcDrill',{skill:'kin',need:5},`Velocity and acceleration. Get 5 right to master it.`,`Differentiate once for v, twice for a.`),
T(`<h3>Key points</h3><ul><li><b>v = ds/dt</b>, <b>a = dv/dt</b>.</li><li>When v = 0, the object is momentarily at rest.</li></ul>`)]),
LH('c3-2-3','Rates of change in the plant',9,'Use derivatives to answer real operator questions about levels, temperatures and limits.',[
RM(`<p>A derivative is a rate of change. Set it to 0 to find the maximum or minimum.</p>`),
T(`<h3>A heat-up</h3><p>During heat-up, the coolant temperature is T = 60 + 50t (°C, t in hours). Then dT/dt = <b>50 °C per hour</b>.</p><p>Plants set a heat-up rate limit, often around 55 °C per hour, to protect thick steel parts from uneven stress. Here 50 is inside it.</p>`),
N(`T = 40 + 45t (°C, t in hours). What is the heat-up rate, in °C per hour?`,45,0.001,'°C/h',`dT/dt = 45.`),
T(`<h3>A level that rises, then falls</h3><p>After a transient, a tank level follows L = 50 + 6t − t² (%, t in minutes) for the first 6 minutes.</p><ul><li>dL/dt = 6 − 2t</li><li>Peak when dL/dt = 0: t = 3 minutes</li><li>Peak level: 50 + 18 − 9 = <b>59%</b></li></ul>`),
N(`L = 50 + 6t − t². How fast is the level changing at t = 1 minute, in % per minute?`,4,0.001,'%/min',`6 − 2(1) = 4.`),
N(`L = 40 + 8t − t² (%). At what time, in minutes, does the level peak?`,4,0.001,'min',`8 − 2t = 0, t = 4.`),
N(`L = 40 + 8t − t². What is the peak level, in %?`,56,0.001,'%',`40 + 32 − 16 = 56%.`),
Q(`An operator sees dP/dt is positive and growing. What's happening to power?`,[`It's rising faster and faster`,'It\'s falling faster and faster','It\'s rising, but more and more slowly','It\'s at its maximum and about to fall'],0,`Positive rate, increasing: accelerating rise.`),
T(`<h3>Key points</h3><ul><li>Rates like dT/dt and dL/dt are derivatives with time.</li><li>Set the rate to 0 to find peaks and troughs.</li></ul>`)])
]});

U({id:'c3-3',track:'calc',level:3,title:'eˣ, ln x, sin and cos',icon:'eˣ',color:'#378ADD',desc:'The special number e, natural logarithms, and the derivatives of exponentials, logs and trig functions.',lessons:[
LH('c3-3-1','The special number e',10,'Meet e ≈ 2.718, the one number whose exponential is its own derivative.',[
RM(`<p>The power rule works on xⁿ, where the power is fixed. Now we look at functions like 2ˣ, where <b>x is the power</b>.</p>`),
T(`<h3>Exponential functions</h3><p>A function like y = 2ˣ is called <b>exponential</b>. It doubles every time x goes up by 1, so it grows faster and faster. Its gradient grows too.</p><p>There's one special base where the gradient is <b>exactly equal</b> to the value, everywhere. That base is:</p><div class="eq">e ≈ 2.718</div>`),
W('fnPlot',{x:[-2,2.5],y:[0,12],xl:'x',yl:'y',sl:[['a','Point x',-2,2.5,0.25,0,function(v){return v}]],curves:function(p){var y0=Math.exp(p.a);return [[Math.exp,'--accent',3],[function(x){return y0+y0*(x-p.a)},'--coral',2,[6,4]]]},read:function(p){var y0=Math.exp(p.a);return 'y = eˣ at x = '+p.a+': value <b>'+y0.toFixed(3)+'</b>, gradient <b>'+y0.toFixed(3)+'</b>'},goal:function(p){return p.a>=2},goalMsg:'Slide all the way to x = 2 or beyond.'},`Slide along y = eˣ and compare the value with the gradient.`,`They're always equal. eˣ is its own derivative.`),
T(`<h3>The rule</h3><div class="eq">d/dx (eˣ) = eˣ</div><p>And with a number multiplying x in the power:</p><div class="eq">d/dx (e<sup>kx</sup>) = k e<sup>kx</sup></div><p>The k comes down in front. So d/dx (e³ˣ) = 3e³ˣ, and d/dx (e<sup>−2x</sup>) = −2e<sup>−2x</sup>.</p>`),
Q(`Differentiate y = e⁵ˣ.`,[`5e⁵ˣ`,`e⁵ˣ`,`5xe⁵ˣ⁻¹`,`e⁴ˣ`],0,`k comes down; the power stays the same.`),
Q(`Can you use the power rule on eˣ?`,[`No: x is the power, not the base`,'Yes: it gives x times e to the x − 1','Only when x is a whole number','Yes, as long as you treat e as x'],0,`The power rule is for xⁿ with a fixed power.`),
W('calcDrill',{skill:'expd',need:5},`Differentiate each exponential. Get 5 right to master it.`,`Bring k down; the e-part stays the same.`),
T(`<h3>Key points</h3><ul><li><b>e ≈ 2.718</b>.</li><li><b>d/dx (eˣ) = eˣ</b>: its own derivative.</li><li><b>d/dx (e<sup>kx</sup>) = ke<sup>kx</sup></b>. Don't use the power rule here.</li></ul>`)]),
LH('c3-3-2','ln x',9,'The natural logarithm undoes eˣ, and its derivative is surprisingly simple: 1/x.',[
RM(`<p>d/dx (e<sup>kx</sup>) = ke<sup>kx</sup>. And e ≈ 2.718.</p>`),
T(`<h3>Undoing eˣ</h3><p>The <b>natural logarithm</b>, ln, undoes eˣ. If y = eˣ then x = ln y.</p><ul><li>ln(eˣ) = x</li><li>ln 1 = 0, because e⁰ = 1</li><li>ln e = 1, because e¹ = e</li></ul>`),
Q(`What is ln(e⁴)?`,[`4`,`e⁴`,`1`,`0`],0,`ln undoes e.`),
Q(`What is ln 1?`,[`0`,`1`,`e`,`It doesn't exist`],0,`e⁰ = 1.`),
T(`<h3>The derivative of ln x</h3><div class="eq">d/dx (ln x) = 1/x</div><p>And with a number in front: d/dx (5 ln x) = 5/x. Bonus: d/dx (ln 3x) is also 1/x, because ln 3x = ln 3 + ln x, and ln 3 is just a constant.</p>`),
Q(`Differentiate y = ln x.`,[`1/x`,`ln x`,`x`,`eˣ`],0,`A key result to learn by heart.`),
W('calcDrill',{skill:'lnd',need:5},`Gradients of ln functions. Get 5 right to master it.`,`d/dx (a ln x) = a/x, then substitute.`),
T(`<h3>Key points</h3><ul><li><b>ln</b> undoes e: ln(eˣ) = x, ln 1 = 0, ln e = 1.</li><li><b>d/dx (ln x) = 1/x</b>.</li></ul>`)]),
LH('c3-3-3','sin and cos',10,'The derivatives of sin and cos, and why calculus uses radians.',[
RM(`<p>A derivative is the gradient at every point. eˣ is its own derivative; ln x gives 1/x.</p>`),
T(`<h3>Radians</h3><p>In calculus, angles are measured in <b>radians</b>, not degrees. A full turn is 2π radians (about 6.28), so π radians = 180°.</p><p>The rules below only work in radians. Make sure your calculator is in RAD mode.</p>`),
Q(`How many degrees is π radians?`,[`180°`,`360°`,`90°`,`3.14°`],0,`Half a turn.`),
T(`<h3>The derivatives</h3><div class="eq">d/dx (sin x) = cos x</div><div class="eq">d/dx (cos x) = −sin x</div><p>Look at the graphs: where sin x is steepest going up (at x = 0), cos x is at its peak of 1. Where sin x is flat at the top, cos x is 0.</p>`),
W('fnPlot',{x:[-3.2,6.4],y:[-1.5,1.5],xl:'x (radians)',yl:'y',sl:[['a','Point x',-3,6,0.25,0,function(v){return v}]],curves:function(p){var y0=Math.sin(p.a),g=Math.cos(p.a);return [[Math.sin,'--accent',3],[Math.cos,'--teal',1.5,[3,3]],[function(x){return y0+g*(x-p.a)},'--coral',2,[6,4]]]},read:function(p){return 'sin x at x = '+p.a+': gradient <b>'+Math.cos(p.a).toFixed(3)+'</b>, which equals cos '+p.a+' (dotted line)'},goal:function(p){return Math.abs(p.a-1.5)<0.3},goalMsg:'Find where sin x is flat at the top (gradient 0).'},`Slide along sin x. The dotted curve is cos x. Find where sin is flat.`,`Near x = 1.57 (that's π/2), the gradient of sin is 0, and so is cos.`),
T(`<h3>With a number inside</h3><p>d/dx (sin 3x) = 3 cos 3x, and d/dx (cos 2x) = −2 sin 2x. The number in front of x comes down, just like with e<sup>kx</sup>.</p>`),
W('calcDrill',{skill:'trigd',need:5},`Trig derivatives. Get 5 right to master it.`,`sin → cos, cos → −sin, and any k comes down.`),
T(`<h3>Key points</h3><ul><li>Use <b>radians</b> in calculus.</li><li><b>sin x → cos x</b>, <b>cos x → −sin x</b>.</li><li>sin kx → k cos kx; cos kx → −k sin kx.</li></ul>`)])
]});

U({id:'c3-4',track:'calc',level:3,title:'Chain, product and quotient rules',icon:'∘',color:'#D85A30',desc:'Differentiate functions inside functions, products and fractions.',lessons:[
LH('c3-4-1','The chain rule',11,'Differentiate a function inside another function, like (3x + 1)⁵.',[
RM(`<p>Power rule: xⁿ → nxⁿ⁻¹. Exponentials: e<sup>kx</sup> → ke<sup>kx</sup>.</p>`),
T(`<h3>A function inside a function</h3><p>y = (3x + 1)⁵ has a bracket inside a power. You could expand it, but that's a lot of work. Instead, think of it in two layers:</p><ul><li>the <b>outside</b>: something to the power 5</li><li>the <b>inside</b>: 3x + 1</li></ul>`),
T(`<h3>The chain rule</h3><div class="eq">dy/dx = (derivative of the outside) × (derivative of the inside)</div><p>Or with letters: let u be the inside. Then</p><div class="eq">dy/dx = dy/du × du/dx</div>`),
W('stepCalc',{steps:[`y = (3x + 1)⁵`,`Let u = 3x + 1, so y = u⁵`,`Outside: dy/du = 5u⁴`,`Inside: du/dx = 3`,`Multiply: dy/dx = 5u⁴ × 3 = 15u⁴`,`Put x back: dy/dx = <b>15(3x + 1)⁴</b>`]},`The chain rule, step by step.`,`Power down, one off the power, times the derivative of the inside.`),
Q(`Differentiate y = (2x − 5)³.`,[`6(2x − 5)²`,`3(2x − 5)²`,`6(2x − 5)³`,`(2x − 5)²`],0,`3 × 2 = 6, power 2.`),
W('calcDrill',{skill:'chain',need:6},`Brackets to a power. Get 6 right to master it.`,`Bring the power down, reduce it by 1, multiply by the inside's derivative.`),
T(`<h3>The same idea with e</h3><p>y = e<sup>x² + 1</sup>: the inside is x² + 1, whose derivative is 2x. So dy/dx = 2x·e<sup>x² + 1</sup>. The e-part stays; multiply by the derivative of the power.</p>`),
W('calcDrill',{skill:'chainexp',need:4},`e to a power. Get 4 right to master it.`,`Multiply by the derivative of the power.`),
T(`<h3>Key points</h3><ul><li><b>Chain rule</b>: derivative of the outside × derivative of the inside.</li><li>(ax + b)ⁿ → na(ax + b)ⁿ⁻¹.</li><li>e<sup>f(x)</sup> → f′(x)e<sup>f(x)</sup>.</li></ul>`)]),
LH('c3-4-2','The product rule',10,'Differentiate two functions multiplied together.',[
RM(`<p>Chain rule: derivative of the outside × derivative of the inside.</p>`),
T(`<h3>Two things multiplied</h3><p>y = x²(x + 1)³ is one function <b>times</b> another. You can't just differentiate each and multiply. Instead, use the <b>product rule</b>:</p><div class="eq">if y = uv, then dy/dx = u′v + uv′</div>${KY([['u, v','the two functions being multiplied',''],['u′, v′','their derivatives','']],'In words: derivative of the first × the second, plus the first × derivative of the second.')}`),
W('stepCalc',{steps:[`y = x³(x + 2)`,`u = x³, so u′ = 3x²`,`v = x + 2, so v′ = 1`,`dy/dx = u′v + uv′ = 3x²(x + 2) + x³(1)`,`At x = 1: 3(1)(3) + 1 = <b>10</b>`]},`The product rule, step by step.`,`Write u, v, u′ and v′ first. Then put them in the formula.`),
Q(`The product rule says d/dx (uv) = …`,[`u′v + uv′`,`u′v′`,`u′ + v′`,`uv′ − u′v`],0,`Learn it by heart.`),
W('calcDrill',{skill:'product',need:5},`Product rule at a point. Get 5 right to master it.`,`List u, u′, v, v′, then u′v + uv′.`),
T(`<h3>Key points</h3><ul><li><b>Product rule</b>: (uv)′ = u′v + uv′.</li><li>Always write out u, u′, v, v′ first.</li><li>v may need the chain rule.</li></ul>`)]),
LH('c3-4-3','The quotient rule',10,'Differentiate one function divided by another. Then put every rule together.',[
RM(`<p>Product rule: (uv)′ = u′v + uv′.</p>`),
T(`<h3>One function divided by another</h3><p>For y = u ÷ v, use the <b>quotient rule</b>:</p><div class="eq">dy/dx = (vu′ − uv′) ÷ v²</div><p>The order matters, because of the minus. A way to remember it: "bottom times derivative of top, minus top times derivative of bottom, all over bottom squared".</p>`),
W('stepCalc',{steps:[`y = (x + 1) / (x − 2)`,`u = x + 1, u′ = 1; v = x − 2, v′ = 1`,`dy/dx = ((x − 2)(1) − (x + 1)(1)) ÷ (x − 2)²`,`Simplify the top: −3`,`dy/dx = <b>−3 / (x − 2)²</b>`]},`The quotient rule, step by step.`,`Bottom × top′, minus top × bottom′, over bottom².`),
Q(`In the quotient rule, what goes underneath?`,[`v², the bottom squared`,'u², the top squared','uv, the top times the bottom','v′, the bottom differentiated'],0,`Bottom squared.`),
W('calcDrill',{skill:'quotient',need:4},`Quotient rule at a point. Get 4 right to master it.`,`Bottom × top′ − top × bottom′, all over bottom².`),
W('calcDrill',{skill:['chain','product','quotient','expd','lnd','trigd','power'],need:8},`The big differentiation review: every rule mixed. Get 8 right to master it.`,`You can differentiate almost anything now.`),
T(`<h3>Key points</h3><ul><li><b>Quotient rule</b>: (u/v)′ = (vu′ − uv′) ÷ v².</li><li>The full toolkit: power rule, eˣ, ln x, sin, cos, chain, product and quotient.</li></ul>`)])
]});

F('c3-1-1',[GN('statq'),GN('statq'),GN('statq'),Q(`At a stationary point, dy/dx = …`,[`0`,`1`,`y`,`undefined`],0,`Flat.`),Q(`After solving dy/dx = 0 for x, you find y by…`,[`substituting x into the original equation`,`substituting into dy/dx`,`setting y = 0`,`integrating`],0,`Original equation.`)]);
F('c3-1-2',[GN('second'),GN('second'),GN('second'),Q(`d²y/dx² measures…`,[`how fast the gradient changes`,`the area`,`the gradient`,`y itself`],0,`Second derivative.`),Q(`The second derivative of distance is…`,[`acceleration`,`velocity`,`displacement`,`time`],0,`a = d²s/dt².`)]);
F('c3-1-3',[GN('statnat'),GN('statnat'),GN('statq'),Q(`d²y/dx² > 0 at a stationary point means…`,[`minimum`,`maximum`,`inconclusive`,`not stationary`],0,`Smile.`),Q(`If d²y/dx² = 0 at a stationary point…`,[`the test is inconclusive`,`it's a maximum`,`it's a minimum`,`there's no point`],0,`Check either side.`)]);
F('c3-2-1',[GN('optim'),GN('optim'),Q(`The first step in an optimisation problem is to…`,[`write the quantity in terms of one variable`,`set y = 0`,`integrate`,`draw a tangent`],0,`Then differentiate.`),Q(`A rectangle with a fixed perimeter has its largest area when it's a…`,[`square`,`very long, thin rectangle`,`triangle`,`circle`],0,`Equal sides.`),GN('optim')]);
F('c3-2-2',[GN('kin'),GN('kin'),GN('kin'),Q(`v = ds/dt. What is a?`,[`dv/dt`,`ds/dv`,`v × t`,`s/t`],0,`Rate of change of velocity.`),Q(`When v = 0, the object is…`,[`momentarily at rest`,`accelerating`,`at its starting point`,`moving fastest`],0,`At rest.`)]);
F('c3-2-3',[N(`T = 50 + 40t (°C, t in hours). Heat-up rate?`,40,0.001,'°C/h',`dT/dt.`),N(`L = 30 + 10t − t². When does L peak (minutes)?`,5,0.001,'min',`10 − 2t = 0.`),N(`L = 30 + 10t − t². Peak level (%)?`,55,0.001,'%',`30 + 50 − 25.`),N(`L = 30 + 10t − t². Rate at t = 2 (% per minute)?`,6,0.001,'%/min',`10 − 4.`),Q(`Setting dL/dt = 0 finds…`,[`when the level peaks or bottoms out`,`the starting level`,`the average level`,`when the tank is empty`],0,`Stationary point.`)]);
F('c3-3-1',[GN('expd'),GN('expd'),GN('expd'),Q(`d/dx (eˣ) = …`,[`eˣ`,`xeˣ⁻¹`,`1`,`ln x`],0,`Its own derivative.`),Q(`e is approximately…`,[`2.718`,`3.142`,`1.414`,`0.693`],0,`Euler's number.`)]);
F('c3-3-2',[GN('lnd'),GN('lnd'),Q(`d/dx (ln x) = …`,[`1/x`,`ln x`,`x`,`1`],0,`Learn by heart.`),Q(`ln e = …`,[`1`,`0`,`e`,`2.718`],0,`e¹ = e.`),Q(`ln(e⁷) = …`,[`7`,`e⁷`,`1`,`0`],0,`ln undoes e.`)]);
F('c3-3-3',[GN('trigd'),GN('trigd'),GN('trigd'),Q(`Calculus with sin and cos needs angles in…`,[`radians`,`degrees`,`gradians`,`either`],0,`Radians.`),Q(`d/dx (sin 4x) = …`,[`4cos 4x`,`cos 4x`,`−4cos 4x`,`4sin 4x`],0,`k comes down.`)]);
F('c3-4-1',[GN('chain'),GN('chain'),GN('chainexp'),Q(`The chain rule says dy/dx = …`,[`dy/du × du/dx`,`dy/du + du/dx`,`du/dx ÷ dy/du`,`dy × dx`],0,`Outside × inside.`),GN('chain')]);
F('c3-4-2',[GN('product'),GN('product'),GN('product'),Q(`(uv)′ = …`,[`u′v + uv′`,`u′v′`,`uv′ − u′v`,`u′ + v′`],0,`Product rule.`),Q(`Before using the product rule, write down…`,[`u, u′, v and v′`,`the answer`,`the integral`,`the limit`],0,`Organised.`)]);
F('c3-4-3',[GN('quotient'),GN('quotient'),Q(`(u/v)′ = …`,[`(vu′ − uv′) ÷ v²`,`(uv′ − vu′) ÷ v²`,`u′/v′`,`(vu′ + uv′) ÷ v`],0,`Order matters.`),GN('chain'),GN('product')]);

TT('c3-1',[x('c3-1-1',GN('statq')),x('c3-1-1',GN('statq')),x('c3-1-2',GN('second')),x('c3-1-2',GN('second')),x('c3-1-3',GN('statnat')),x('c3-1-3',GN('statnat')),x('c3-1-3',Q(`d²y/dx² < 0 at a stationary point means…`,[`maximum`,`minimum`,`inconclusive`,`increasing`],0,`Frown.`)),x('c3-1-1',Q(`Stationary points are where…`,[`dy/dx = 0`,`y = 0`,`x = 0`,`d²y/dx² = 0`],0,`Flat.`)),x('c3-1-2',Q(`f″(x) is the…`,[`second derivative`,`inverse`,`integral`,`original function`],0,`Twice.`)),x('c3-1-1',GN('statq'))]);
TT('c3-2',[x('c3-2-1',GN('optim')),x('c3-2-1',GN('optim')),x('c3-2-2',GN('kin')),x('c3-2-2',GN('kin')),x('c3-2-2',GN('kin')),x('c3-2-3',N(`L = 20 + 12t − t². Peak time (minutes)?`,6,0.001,'min',`12 − 2t = 0.`)),x('c3-2-3',N(`L = 20 + 12t − t². Peak level (%)?`,56,0.001,'%',`20 + 72 − 36.`)),x('c3-2-3',N(`T = 70 + 30t. Heat-up rate (°C/h)?`,30,0.001,'°C/h',`dT/dt.`)),x('c3-2-2',Q(`Acceleration is the derivative of…`,[`velocity`,`displacement`,`time`,`force`],0,`a = dv/dt.`)),x('c3-2-1',Q(`In optimisation, after setting the derivative to zero you should…`,[`check it's a max or min`,`integrate`,`stop`,`set x = 0`],0,`Second derivative.`))]);
TT('c3-3',[x('c3-3-1',GN('expd')),x('c3-3-1',GN('expd')),x('c3-3-2',GN('lnd')),x('c3-3-2',GN('lnd')),x('c3-3-3',GN('trigd')),x('c3-3-3',GN('trigd')),x('c3-3-1',Q(`Which function is its own derivative?`,[`eˣ`,`x²`,`ln x`,`sin x`],0,`eˣ.`)),x('c3-3-2',Q(`d/dx (ln x) = …`,[`1/x`,`x`,`ln x`,`eˣ`],0,`1/x.`)),x('c3-3-3',Q(`d/dx (cos x) = …`,[`−sin x`,`sin x`,`cos x`,`−cos x`],0,`Minus sin.`)),x('c3-3-3',Q(`π radians = …`,[`180°`,`360°`,`90°`,`π°`],0,`Half a turn.`))]);
TT('c3-4',[x('c3-4-1',GN('chain')),x('c3-4-1',GN('chain')),x('c3-4-1',GN('chainexp')),x('c3-4-2',GN('product')),x('c3-4-2',GN('product')),x('c3-4-3',GN('quotient')),x('c3-4-3',GN('quotient')),x('c3-4-2',Q(`(uv)′ = …`,[`u′v + uv′`,`u′v′`,`(u′v − uv′)/v²`,`u + v`],0,`Product rule.`)),x('c3-4-3',Q(`(u/v)′ = …`,[`(vu′ − uv′)/v²`,`u′/v′`,`(uv′ − vu′)/v²`,`u′v + uv′`],0,`Quotient rule.`)),x('c3-4-1',Q(`The chain rule is used for…`,[`a function inside a function`,`two functions added`,`constants`,`straight lines`],0,`Composite functions.`))]);

