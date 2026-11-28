/* ========== CALCULUS · LEVEL 2 · Differentiation ========== */
U({id:'c2-1',track:'calc',level:2,title:'From chords to tangents',icon:'→',color:'#7F77DD',desc:'The tangent, the idea of a limit, and working out the gradient of y = x² from scratch.',lessons:[
LH('c2-1-1','The tangent to a curve',8,'The line that just touches a curve, and why its gradient is the curve\'s gradient.',[
RM(`<p>A <b>chord</b> joins two points on a curve. As the chord gets shorter, its gradient gets closer to the exact gradient at a point. On y = x² at x = 3, that was <b>6</b>.</p>`),
T(`<h3>The tangent</h3><p>A <b>tangent</b> is a straight line that touches a curve at one point and has exactly the same steepness as the curve there.</p><p>So the gradient of a curve at a point is defined as the <b>gradient of the tangent</b> at that point.</p>`),
W('fnPlot',{x:[-3,3],y:[-1,9],xl:'x',yl:'y',sl:[['a','Point x',-3,3,0.5,1,function(v){return v}]],curves:function(p){var g=2*p.a,y0=p.a*p.a;return [[function(x){return x*x},'--accent',3],[function(x){return y0+g*(x-p.a)},'--coral',2,[6,4]]]},read:function(p){return 'At x = '+p.a+': tangent gradient = <b>'+(2*p.a)+'</b>'},goal:function(p){return p.a===-2},goalMsg:'Move the point to x = −2.'},`Slide the point along y = x². Watch the tangent. Finish at x = −2.`,`The gradient is negative on the left, zero at the bottom, and positive on the right. At x = −2 it's −4.`),
Q(`On y = x², what's the gradient of the tangent at x = 0?`,[`0`,`1`,`2`,`It has no tangent`],0,`At the bottom of the U, the tangent is flat.`),
T(`<h3>Spot the pattern</h3><table><tr><th>x</th><td>−2</td><td>−1</td><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>gradient</th><td>−4</td><td>−2</td><td>0</td><td>2</td><td>4</td><td>6</td></tr></table><p>The gradient is always <b>double</b> the x-value. For y = x², gradient = <b>2x</b>.</p>`),
N(`For y = x², what's the gradient at x = 7?`,14,0.001,'',`2 × 7 = 14.`),
N(`For y = x², what's the gradient at x = −5?`,-10,0.001,'',`2 × (−5) = −10.`),
T(`<h3>Key points</h3><ul><li>A <b>tangent</b> touches a curve at one point, with the same steepness there.</li><li>The gradient of a curve at a point = the gradient of its tangent.</li><li>For y = x², the gradient at any x is <b>2x</b>.</li></ul>`)]),
LH('c2-1-2','Limits',8,'What "gets closer and closer to" really means, and how we write it.',[
RM(`<p>Shrinking a chord makes its gradient approach the tangent's gradient. On y = x² from x = 3, chord gradients were 7, 6.5, 6.1, 6.01… heading to 6.</p>`),
T(`<h3>A limit</h3><p>When something gets closer and closer to a value without us ever needing to reach it, that value is called the <b>limit</b>.</p><p>The chord from x = 3 to x = 3 + h has gradient <b>6 + h</b>. As h shrinks towards 0, that heads to 6. We write:</p><div class="eq">as h → 0,&nbsp; 6 + h → 6</div>${KY([['h','the width of the chord: a small step in x',''],['→','"tends to" or "gets closer and closer to"','']])}`),
Q(`What does "h → 0" mean?`,[`h gets closer and closer to 0`,'h is set to exactly 0 straight away','h gets further and further from 0','h keeps getting bigger without limit'],0,`It shrinks towards 0. We never actually divide by 0.`),
T(`<h3>Why not just put h = 0?</h3><p>A chord needs two different points. If h = 0, both points are the same, and the gradient calculation becomes 0 ÷ 0, which has no answer.</p><p>So instead of setting h to 0, we ask what the answer <b>approaches</b> as h gets tiny. That's the limit.</p>`),
Q(`Why can't we just put h = 0 into the chord gradient?`,[`It gives 0 ÷ 0, which has no answer`,'It gives a negative answer every time','It makes the answer far too big to use','We can, and it gives the exact gradient'],0,`Two points become one point.`),
N(`As h → 0, what does 10 + 3h tend to?`,10,0.001,'',`3h shrinks to 0, leaving 10.`),
N(`As h → 0, what does 2 × 4 + h tend to?`,8,0.001,'',`2 × 4 = 8, and h vanishes.`),
W('calcDrill',{skill:'chord',need:5},`Chord gradients on y = x². Get 5 right to master it, and notice where they're heading.`,`Every one is 2 × start + h. The limit is 2 × start.`),
T(`<h3>Key points</h3><ul><li>A <b>limit</b> is the value something approaches.</li><li><b>h → 0</b> means h gets closer and closer to 0.</li><li>We can't set h = 0 in a chord, so we take the limit instead.</li></ul>`)]),
LH('c2-1-3','The gradient of x², from scratch',10,'Prove that the gradient of y = x² is 2x using algebra. Your first derivation.',[
RM(`<p>The chord from x = a to x = a + h has gradient (f(a + h) − f(a)) ÷ h. As h → 0, it tends to the gradient at x = a.</p>`),
T(`<h3>The plan</h3><p>Instead of trying numbers, we'll use letters, so the answer works for <b>every</b> point at once. On y = x², take a chord from x = <b>a</b> to x = <b>a + h</b>.</p>`),
T(`<h3>Expanding (a + h)²</h3><p>We'll need this:</p><div class="eq">(a + h)² = (a + h)(a + h) = a² + 2ah + h²</div><p>Multiply every term in the first bracket by every term in the second: a×a, a×h, h×a, h×h.</p>`),
Q(`Expand (a + h)².`,[`a² + 2ah + h²`,`a² + h²`,`a² + ah + h²`,`2a + 2h`],0,`Don't forget the middle term 2ah.`),
W('stepCalc',{steps:[`Chord gradient = (f(a + h) − f(a)) ÷ h`,`For f(x) = x²: ((a + h)² − a²) ÷ h`,`Expand: (a² + 2ah + h² − a²) ÷ h`,`The a² terms cancel: (2ah + h²) ÷ h`,`Divide each term by h: <b>2a + h</b>`,`As h → 0, the h disappears: the gradient is <b>2a</b>`]},`Here's the whole derivation. Reveal it one step at a time and make sure each line makes sense.`,`For y = x², the gradient at x = a is 2a. That's exactly the 2x pattern you spotted.`),
Q(`In the derivation, why do the a² terms disappear?`,[`+a² and −a² cancel`,'a is always zero','We divide them by a','h² is always zero'],0,`a² − a² = 0.`),
Q(`After dividing by h, the chord gradient is 2a + h. What happens as h → 0?`,[`It becomes 2a`,`It becomes 0`,`It becomes 2a + 1`,`It has no answer`],0,`The h term shrinks away.`),
W('calcDrill',{skill:'fpx2',need:4},`Use the result: gradient = 2a. Get 4 right to master it.`,`Double the x-value.`),
T(`<h3>You've just done calculus</h3><p>What you just did is called <b>differentiation from first principles</b>. It's how every rule in calculus is proved. Next unit, you'll learn the notation and do it again for x³.</p>`),
T(`<h3>Key points</h3><ul><li>Chord from a to a + h on y = x²: gradient <b>2a + h</b>.</li><li>As h → 0, it tends to <b>2a</b>.</li><li>So the gradient of y = x² at any x is <b>2x</b>.</li></ul>`)])
]});

U({id:'c2-2',track:'calc',level:2,title:'First principles and notation',icon:'dy/dx',color:'#1D9E75',desc:'dy/dx and f′(x), first principles for x³, and the pattern that becomes the power rule.',lessons:[
LH('c2-2-1','dy/dx and f′(x)',8,'Two ways of writing "the gradient function", and what they mean.',[
RM(`<p>The gradient of y = x² at any point x is <b>2x</b>. We found it as a limit as h → 0.</p>`),
T(`<h3>The derivative</h3><p>The formula for the gradient at any x, like 2x for y = x², is called the <b>derivative</b>. Finding it is called <b>differentiating</b>.</p><p>There are two common ways to write it:</p><div class="eq">dy/dx&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;f′(x)</div>${KY([['dy/dx','"dee y by dee x": the rate of change of y with respect to x',''],['f′(x)','"f dash of x": the derivative of the function f','']],'dy/dx is one symbol. It is NOT d × y ÷ d × x.')}`),
Q(`If y = x², what is dy/dx?`,[`2x`,`x²`,`2`,`x`],0,`The derivative of x² is 2x.`),
Q(`If f(x) = x², what is f′(3)?`,[`6`,`9`,`3`,`2`],0,`f′(x) = 2x, so f′(3) = 6.`),
T(`<h3>Other letters</h3><p>The letters change with the situation. If temperature T changes with time t, its rate of change is <b>dT/dt</b>, in °C per second. If power P changes with time, it's <b>dP/dt</b>.</p>`),
Q(`What does dT/dt measure?`,[`How fast temperature changes with time`,'Temperature multiplied by the time taken','The total temperature rise over the day','How long the temperature takes to settle'],0,`A rate of change, like °C per minute.`),
T(`<h3>Key points</h3><ul><li>The <b>derivative</b> is the gradient formula. Finding it is <b>differentiating</b>.</li><li>Written <b>dy/dx</b> or <b>f′(x)</b>.</li><li>dT/dt, dP/dt and so on are rates of change with time.</li></ul>`)]),
LH('c2-2-2','First principles for x³',10,'The same method, a little more algebra: prove that the gradient of x³ is 3x².',[
RM(`<p>For y = x², the chord from a to a + h has gradient 2a + h, which tends to 2a as h → 0.</p>`),
T(`<h3>Expanding (a + h)³</h3><p>(a + h)³ = (a + h)² × (a + h) = (a² + 2ah + h²)(a + h).</p><p>Multiply out and collect like terms:</p><div class="eq">(a + h)³ = a³ + 3a²h + 3ah² + h³</div>`),
Q(`(a + h)³ expands to…`,[`a³ + 3a²h + 3ah² + h³`,'a³ + 3a²h + 3ah + h³','a³ + 2a²h + 2ah² + h³','a³ + 3a²h² + 3ah + h³'],0,`Four terms, with 3s in the middle two.`),
W('stepCalc',{steps:[`Chord gradient = ((a + h)³ − a³) ÷ h`,`Expand: (a³ + 3a²h + 3ah² + h³ − a³) ÷ h`,`The a³ terms cancel: (3a²h + 3ah² + h³) ÷ h`,`Divide each term by h: <b>3a² + 3ah + h²</b>`,`As h → 0, both 3ah and h² vanish`,`So the gradient of y = x³ at x = a is <b>3a²</b>`]},`Reveal each step. It's the same plan as for x².`,`For y = x³, dy/dx = 3x².`),
N(`For y = x³, what's the gradient at x = 2?`,12,0.001,'',`3 × 2² = 12.`),
N(`For y = x³, what's the gradient at x = −1?`,3,0.001,'',`3 × (−1)² = 3. Positive, even on the left.`),
Q(`Why does 3ah vanish as h → 0?`,[`It has an h in it, so it shrinks to 0`,'It has an a in it, and a is always 0','It is multiplied by 3, which cancels it','It doesn\'t vanish: it becomes 3a instead'],0,`Any term with an h shrinks away.`),
T(`<h3>Key points</h3><ul><li>(a + h)³ = a³ + 3a²h + 3ah² + h³.</li><li>The chord gradient simplifies to 3a² + 3ah + h², which tends to <b>3a²</b>.</li><li>So for y = x³, <b>dy/dx = 3x²</b>.</li></ul>`)]),
LH('c2-2-3','Spotting the pattern',8,'x² → 2x, x³ → 3x². Can you guess the rule for any power?',[
RM(`<p>From first principles: the derivative of x² is <b>2x</b>, and of x³ is <b>3x²</b>.</p>`),
T(`<h3>Line them up</h3><table><tr><th>y</th><td>x</td><td>x²</td><td>x³</td><td>x⁴</td></tr><tr><th>dy/dx</th><td>1</td><td>2x</td><td>3x²</td><td>4x³</td></tr></table><p>Look closely. Each time, the <b>power comes down in front</b>, and the new power is <b>one less</b>.</p>`),
Q(`Following the pattern, what is the derivative of x⁵?`,[`5x⁴`,`4x⁵`,`5x⁶`,`x⁴`],0,`Bring the 5 down; 5 − 1 = 4.`),
T(`<h3>Even y = x fits</h3><p>y = x is x¹. Bring the 1 down and take 1 off: 1x⁰ = 1 × 1 = <b>1</b>. That's right: y = x is a straight line with gradient 1.</p>`),
Q(`What is the derivative of x⁷?`,[`7x⁶`,`6x⁷`,`7x⁸`,`x⁶`],0,`Power down, take one off.`),
W('calcDrill',{skill:'gradat',need:5},`Use the pattern to find gradients at points. Get 5 right to master it.`,`Bring the power down, take one off, then substitute.`),
QE(`Write 1/x² as a power of x.`,[`x⁻²`,`x²`,`−x²`,`2x`],0,`From Level 1: negative power.`),
T(`<h3>Key points</h3><ul><li>Pattern: the derivative of <b>xⁿ</b> is <b>nxⁿ⁻¹</b>.</li><li>Bring the power down in front, then subtract 1 from the power.</li><li>It's called the <b>power rule</b>, and it's next.</li></ul>`)])
]});

U({id:'c2-3',track:'calc',level:2,title:'The power rule',icon:'nxⁿ⁻¹',color:'#378ADD',desc:'Differentiate any power of x, sums of terms and constants, including negative and fractional powers.',lessons:[
LH('c2-3-1','Differentiating axⁿ',9,'The power rule, with a number in front. Practise until it\'s automatic.',[
RM(`<p>The derivative of xⁿ is <b>nxⁿ⁻¹</b>: bring the power down, take one off.</p>`),
T(`<h3>The power rule</h3><div class="eq">y = axⁿ&nbsp;&nbsp;→&nbsp;&nbsp;dy/dx = anxⁿ⁻¹</div>${KY([['a','the number in front (stays and gets multiplied)',''],['n','the power: multiply by it, then subtract 1','']])}<p>Two moves: <b>multiply by the power</b>, then <b>reduce the power by 1</b>.</p>`),
W('stepCalc',{steps:[`y = 5x³`,`Multiply the number in front by the power: 5 × 3 = 15`,`Reduce the power by 1: 3 − 1 = 2`,`dy/dx = <b>15x²</b>`]},`Watch the two moves.`,`Multiply by the power, then take one off.`),
Q(`Differentiate y = 4x⁵.`,[`20x⁴`,`20x⁵`,`9x⁴`,`4x⁴`],0,`4 × 5 = 20, power 5 − 1 = 4.`),
Q(`Differentiate y = −2x³.`,[`−6x²`,`6x²`,`−6x³`,`−2x²`],0,`−2 × 3 = −6, power 2.`),
T(`<h3>A single x</h3><p>y = 7x is 7x¹. Multiply by 1, power becomes 0, and x⁰ = 1. So dy/dx = <b>7</b>. The gradient of a straight line is the number in front of x, just as you learned in Level 1.</p>`),
W('calcDrill',{skill:'power',need:8},`The power rule, over and over. Get 8 right to master it.`,`Multiply by the power, then reduce it by 1. Negative powers work exactly the same way.`),
T(`<h3>Key points</h3><ul><li><b>axⁿ → anxⁿ⁻¹</b></li><li>Multiply by the power, then reduce the power by 1.</li><li>kx → k (a straight line's gradient).</li></ul>`)]),
LH('c2-3-2','Sums and constants',9,'Differentiate whole expressions like 3x² − 5x + 7, one term at a time.',[
RM(`<p>Power rule: <b>axⁿ → anxⁿ⁻¹</b>. And kx → k.</p>`),
T(`<h3>Constants vanish</h3><p>y = 7 is a flat horizontal line. Its gradient is <b>0</b> everywhere.</p><div class="eq">d/dx (constant) = 0</div><p>It also fits the power rule: 7 = 7x⁰, and 7 × 0 = 0.</p>`),
Q(`Differentiate y = 12.`,[`0`,`12`,`1`,`12x`],0,`A constant has zero gradient.`),
T(`<h3>One term at a time</h3><p>To differentiate a sum, differentiate <b>each term separately</b> and keep the plus and minus signs.</p><div class="eq">y = 3x² − 5x + 7&nbsp;&nbsp;→&nbsp;&nbsp;dy/dx = 6x − 5</div><p>3x² → 6x, −5x → −5, and 7 → 0.</p>`),
Q(`Differentiate y = x³ + 4x² − 2x + 9.`,[`3x² + 8x − 2`,`3x² + 8x − 2 + 9`,`x² + 8x − 2`,`3x² + 4x − 2`],0,`Term by term; the 9 disappears.`),
W('calcDrill',{skill:'const0',need:3},`Quick check on constants. Get 3 right to master it.`,`Constants always differentiate to 0.`),
T(`<h3>Finding a gradient value</h3><p>Once you have f′(x), substitute to get the gradient at a point. If f(x) = x³ − 2x, then f′(x) = 3x² − 2, and f′(2) = 12 − 2 = <b>10</b>.</p>`),
W('calcDrill',{skill:'polyval',need:6},`Differentiate, then substitute. Get 6 right to master it.`,`Term by term, then put the number in.`),
T(`<h3>Key points</h3><ul><li>Constants differentiate to <b>0</b>.</li><li>Differentiate sums <b>term by term</b>.</li><li>Then substitute to find the gradient at a point.</li></ul>`)]),
LH('c2-3-3','Negative and fractional powers',10,'Rewrite 5/x² and √x as powers first, then the power rule works as normal.',[
RM(`<p>From Level 1: 1/xⁿ = <b>x⁻ⁿ</b> and √x = <b>x⁰·⁵</b>. Power rule: <b>axⁿ → anxⁿ⁻¹</b>.</p>`),
T(`<h3>Rewrite first, then differentiate</h3><p>The power rule only works on powers of x. So fractions and roots must be <b>rewritten as powers</b> first.</p>`),
W('stepCalc',{steps:[`y = 6/x²`,`Rewrite as a power: y = 6x⁻²`,`Multiply by the power: 6 × (−2) = −12`,`Reduce the power by 1: −2 − 1 = −3`,`dy/dx = −12x⁻³, which you can write as <b>−12/x³</b>`]},`A negative power, step by step.`,`Careful: −2 − 1 = −3, not −1.`),
Q(`Differentiate y = x⁻¹.`,[`−x⁻²`,`x⁻²`,`−x⁰`,`−1x⁻¹`],0,`−1 × x^(−1−1) = −x⁻².`),
W('stepCalc',{steps:[`y = 4√x`,`Rewrite as a power: y = 4x⁰·⁵`,`Multiply by the power: 4 × 0.5 = 2`,`Reduce the power by 1: 0.5 − 1 = −0.5`,`dy/dx = 2x⁻⁰·⁵, which is <b>2/√x</b>`]},`A fractional power, step by step.`,`Same rule, just with decimals.`),
W('calcDrill',{skill:['rewrite','powfrac'],need:6},`Rewrite and differentiate. Get 6 right to master it.`,`Rewrite as a power, then the usual two moves.`),
W('calcDrill',{skill:['power','powfrac','rewrite','polyval','const0'],need:8},`Everything from this unit, mixed. Get 8 right to master it.`,`You can differentiate any power of x.`),
T(`<h3>Key points</h3><ul><li><b>Rewrite</b> fractions and roots as powers first.</li><li>Negative powers: subtracting 1 makes them <b>more</b> negative.</li><li>Fractional powers: 0.5 − 1 = −0.5.</li></ul>`)])
]});

U({id:'c2-4',track:'calc',level:2,title:'Using the derivative',icon:'y=mx+c',color:'#D85A30',desc:'Gradients at points, equations of tangents and normals, and where a function is increasing or decreasing.',lessons:[
LH('c2-4-1','The gradient at a point',8,'Differentiate, then substitute: the gradient anywhere on a curve.',[
RM(`<p>Differentiate term by term with the power rule, then substitute to get a value.</p>`),
T(`<h3>Two steps, every time</h3><ol><li><b>Differentiate</b> to get the gradient function.</li><li><b>Substitute</b> the x-value.</li></ol><p>Never substitute first: that turns the curve into a single number, and a number's gradient is 0.</p>`),
Q(`f(x) = x³. A student puts x = 2 in first, gets 8, then differentiates 8 to get 0. What went wrong?`,[`They substituted before differentiating`,'Nothing: the gradient there really is 0','They forgot to add + C at the end','They should have differentiated twice'],0,`Differentiate first, then substitute: f′(2) = 3 × 4 = 12.`),
W('calcDrill',{skill:['polyval','gradat'],need:6},`Gradients at points. Get 6 right to master it.`,`Differentiate first, then substitute.`),
T(`<h3>Key points</h3><ul><li>To find a gradient at a point: <b>differentiate, then substitute</b>.</li><li>Never the other way round.</li></ul>`)]),
LH('c2-4-2','Tangents and normals',10,'Write the equation of the tangent and the normal at any point on a curve.',[
RM(`<p>A tangent touches a curve with the same gradient. A straight line is <b>y = mx + c</b>. The gradient at a point is f′(x).</p>`),
T(`<h3>The equation of a tangent</h3><p>You need two things: the <b>gradient</b> m and a <b>point</b> the line goes through.</p><ul><li>m: differentiate and substitute.</li><li>The point: (x, f(x)) on the curve.</li><li>Then find c: c = y − mx.</li></ul>`),
W('stepCalc',{steps:[`Tangent to y = x² + 3x at x = 1`,`Gradient: dy/dx = 2x + 3, so m = 2(1) + 3 = 5`,`Point: y = 1² + 3(1) = 4, so (1, 4)`,`Find c: 4 = 5 × 1 + c, so c = −1`,`Tangent: <b>y = 5x − 1</b>`]},`Follow the method.`,`Gradient, point, then c.`),
W('calcDrill',{skill:'tangent',need:4},`Find the tangent equations. Get 4 right to master it.`,`m from the derivative, the point from the curve, then c = y − mx.`),
T(`<h3>The normal</h3><p>The <b>normal</b> is the line at right angles to the tangent, through the same point. Their gradients multiply to −1:</p><div class="eq">normal gradient = −1 ÷ tangent gradient</div><p>If the tangent's gradient is 2, the normal's is −½ = −0.5.</p>`),
W('calcDrill',{skill:'normal',need:4},`Normal gradients. Get 4 right to master it.`,`Flip it and change its sign.`),
T(`<h3>Key points</h3><ul><li>Tangent: m = f′(x), point (x, f(x)), then <b>c = y − mx</b>.</li><li>Normal: same point, gradient <b>−1/m</b>.</li></ul>`)]),
LH('c2-4-3','Increasing and decreasing',8,'The sign of the derivative tells you whether a function is going up or down.',[
RM(`<p>The derivative is the gradient. Positive gradients go up; negative go down; zero is flat.</p>`),
T(`<h3>Reading the sign</h3><ul><li>dy/dx &gt; 0: y is <b>increasing</b> there.</li><li>dy/dx &lt; 0: y is <b>decreasing</b>.</li><li>dy/dx = 0: the curve is momentarily flat. That's a <b>stationary point</b>, coming in Level 3.</li></ul>`),
Q(`At a point, dy/dx = −3. What's happening to y?`,[`It's decreasing`,`It's increasing`,`It's stationary`,`Can't tell`],0,`Negative gradient: going down.`),
W('calcDrill',{skill:'incdec',need:5},`Increasing, decreasing or stationary? Get 5 right to master it.`,`Differentiate, substitute, then look at the sign.`),
T(`<h3>In the plant</h3><p>If dT/dt is positive, temperature is rising. If dP/dt is negative, power is falling. Operators read signs of rates like this constantly, even if they don't call it calculus.</p>`),
QE(`What is the gradient of the chord on y = x² from x = 2 to x = 2.1?`,[`4.1`,`4`,`0.41`,`2.1`],0,`2 × 2 + 0.1.`),
T(`<h3>Key points</h3><ul><li>dy/dx positive: <b>increasing</b>. Negative: <b>decreasing</b>.</li><li>dy/dx = 0: <b>stationary</b>.</li><li>You've finished Level 2. You can differentiate from first principles and with the power rule.</li></ul>`)])
]});

F('c2-1-1',[Q(`A tangent to a curve…`,[`touches it at one point with the same gradient`,`joins two points on it`,`is always horizontal`,`crosses it at right angles`],0,`Tangent.`),N(`Gradient of y = x² at x = 4?`,8,0.001,'',`2x.`),N(`Gradient of y = x² at x = −3?`,-6,0.001,'',`2x.`),Q(`On y = x², where is the gradient zero?`,[`x = 0`,`x = 1`,`Everywhere`,`Nowhere`],0,`The bottom of the U.`),Q(`On y = x², left of the y-axis, the gradient is…`,[`negative`,`positive`,`zero`,`infinite`],0,`Going down.`)]);
F('c2-1-2',[GN('chord'),GN('chord'),N(`As h → 0, 7 − 2h tends to…`,7,0.001,'',`−2h vanishes.`),Q(`Why use a limit rather than setting h = 0?`,[`h = 0 gives 0 ÷ 0`,`h must be 1`,`Limits are faster`,`No reason`],0,`Undefined.`),Q(`"→" means…`,[`tends to`,`equals`,`is less than`,`multiplied by`],0,`Gets closer to.`)]);
F('c2-1-3',[GN('fpx2'),GN('fpx2'),Q(`(a + h)² = …`,[`a² + 2ah + h²`,`a² + h²`,`2a + 2h`,`a² + ah`],0,`Three terms.`),Q(`After simplifying, the chord gradient on y = x² is…`,[`2a + h`,`2a`,`a + h`,`2ah`],0,`Then h → 0.`),Q(`This method is called…`,[`differentiation from first principles`,`integration`,`the chain rule`,`factorising`],0,`From scratch.`)]);
F('c2-2-1',[Q(`f′(x) is read as…`,[`"f dash of x"`,`"f times x"`,`"f prime times x"`,`"f to the x"`],0,`The derivative.`),Q(`If y = x², dy/dx = …`,[`2x`,`x`,`2`,`x²`],0,`Known result.`),Q(`dP/dt measures…`,[`how fast power changes with time`,`power × time`,`total energy`,`time per unit power`],0,`A rate.`),N(`f(x) = x². f′(10) = …`,20,0.001,'',`2 × 10.`),Q(`Is dy/dx a fraction you can cancel the d's in?`,[`No, it's one symbol`,`Yes`,`Only sometimes`,`Only if y = x`],0,`One symbol.`)]);
F('c2-2-2',[N(`Gradient of y = x³ at x = 3?`,27,0.001,'',`3 × 9.`),N(`Gradient of y = x³ at x = −2?`,12,0.001,'',`3 × 4.`),Q(`For y = x³, the chord gradient simplifies to…`,[`3a² + 3ah + h²`,`3a²`,`a³ + h³`,`3a + h`],0,`Then h → 0.`),Q(`The derivative of x³ is…`,[`3x²`,`x²`,`3x³`,`2x³`],0,`3x².`),Q(`(a + h)³ has how many terms when expanded?`,[`4`,`2`,`3`,`6`],0,`a³ + 3a²h + 3ah² + h³.`)]);
F('c2-2-3',[GN('gradat'),GN('gradat'),Q(`The derivative of x⁹ is…`,[`9x⁸`,`8x⁹`,`9x¹⁰`,`x⁸`],0,`Pattern.`),Q(`The derivative of x is…`,[`1`,`x`,`0`,`2x`],0,`Gradient 1.`),Q(`The pattern xⁿ → nxⁿ⁻¹ is called…`,[`the power rule`,`the chain rule`,`first principles`,`the limit rule`],0,`Power rule.`)]);
F('c2-3-1',[GN('power'),GN('power'),GN('power'),Q(`Differentiate 9x.`,[`9`,`9x`,`0`,`x`],0,`Gradient of a line.`),GN('power')]);
F('c2-3-2',[GN('polyval'),GN('polyval'),GN('const0'),Q(`Differentiate 2x² + 3x − 1.`,[`4x + 3`,`4x + 3 − 1`,`2x + 3`,`4x`],0,`Term by term.`),Q(`Differentiate x⁴ − x.`,[`4x³ − 1`,`4x³`,`3x⁴ − 1`,`4x⁴ − 1`],0,`Term by term.`)]);
F('c2-3-3',[GN('rewrite'),GN('powfrac'),GN('rewrite'),GN('powfrac'),Q(`Before differentiating 3/x, you should…`,[`rewrite it as 3x⁻¹`,`multiply by x`,`set x = 0`,`integrate`],0,`Rewrite first.`)]);
F('c2-4-1',[GN('polyval'),GN('gradat'),GN('polyval'),Q(`To find a gradient at a point, first…`,[`differentiate`,`substitute`,`integrate`,`factorise`],0,`Differentiate, then substitute.`),GN('gradat')]);
F('c2-4-2',[GN('tangent'),GN('normal'),GN('tangent'),GN('normal'),Q(`Tangent and normal gradients multiply to…`,[`−1`,`1`,`0`,`2`],0,`Perpendicular.`)]);
F('c2-4-3',[GN('incdec'),GN('incdec'),GN('incdec'),Q(`dy/dx = 0 means the curve is…`,[`stationary (momentarily flat)`,`increasing`,`decreasing`,`undefined`],0,`Flat.`),Q(`dT/dt is positive. Temperature is…`,[`rising`,`falling`,`steady`,`zero`],0,`Positive rate.`)]);

TT('c2-1',[x('c2-1-1',N(`Gradient of y = x² at x = 6?`,12,0.001,'',`2x.`)),x('c2-1-1',Q(`The gradient of a curve at a point equals that of the…`,[`tangent`,`chord`,`axis`,`normal`],0,`Tangent.`)),x('c2-1-2',GN('chord')),x('c2-1-2',GN('chord')),x('c2-1-2',N(`As h → 0, 4 + 5h tends to…`,4,0.001,'',`5h vanishes.`)),x('c2-1-3',GN('fpx2')),x('c2-1-3',GN('fpx2')),x('c2-1-3',Q(`On y = x², ((a + h)² − a²) ÷ h simplifies to…`,[`2a + h`,`2a`,`h`,`a²`],0,`Before the limit.`)),x('c2-1-1',N(`Gradient of y = x² at x = −0.5?`,-1,0.001,'',`2x.`)),x('c2-1-2',Q(`We use limits because putting h = 0 gives…`,[`0 ÷ 0`,`infinity`,`1`,`a negative`],0,`Undefined.`))]);
TT('c2-2',[x('c2-2-1',Q(`dy/dx means…`,[`the gradient of y against x`,`d × y ÷ d × x`,`y ÷ x`,`the area`],0,`Rate of change.`)),x('c2-2-1',Q(`f′(x) is the…`,[`derivative of f`,`inverse of f`,`integral of f`,`value of f`],0,`Gradient function.`)),x('c2-2-2',N(`Gradient of y = x³ at x = 4?`,48,0.001,'',`3 × 16.`)),x('c2-2-2',Q(`From first principles, x³ differentiates to…`,[`3x²`,`x²`,`3x`,`x⁴/4`],0,`3x².`)),x('c2-2-3',GN('gradat')),x('c2-2-3',GN('gradat')),x('c2-2-3',Q(`Derivative of x⁶?`,[`6x⁵`,`5x⁶`,`6x⁷`,`x⁵`],0,`Power rule.`)),x('c2-2-1',Q(`The rate of change of pressure p with time t is written…`,[`dp/dt`,`dt/dp`,`p/t`,`p′x`],0,`dp/dt.`)),x('c2-2-2',N(`Gradient of y = x³ at x = 0?`,0,0.001,'',`3 × 0.`)),x('c2-2-3',GN('gradat'))]);
TT('c2-3',[x('c2-3-1',GN('power')),x('c2-3-1',GN('power')),x('c2-3-1',GN('power')),x('c2-3-2',GN('polyval')),x('c2-3-2',GN('polyval')),x('c2-3-2',GN('const0')),x('c2-3-3',GN('rewrite')),x('c2-3-3',GN('powfrac')),x('c2-3-3',GN('rewrite')),x('c2-3-2',Q(`Differentiate 5x³ − 2x + 8.`,[`15x² − 2`,`15x² − 2 + 8`,`5x² − 2`,`15x³ − 2`],0,`Term by term.`))]);
TT('c2-4',[x('c2-4-1',GN('polyval')),x('c2-4-1',GN('gradat')),x('c2-4-2',GN('tangent')),x('c2-4-2',GN('tangent')),x('c2-4-2',GN('normal')),x('c2-4-2',GN('normal')),x('c2-4-3',GN('incdec')),x('c2-4-3',GN('incdec')),x('c2-4-1',Q(`Correct order to find a gradient at a point?`,[`Differentiate, then substitute`,`Substitute, then differentiate`,`Either`,`Integrate first`],0,`Always.`)),x('c2-4-3',Q(`dy/dx < 0 means y is…`,[`decreasing`,`increasing`,`stationary`,`zero`],0,`Going down.`))]);

