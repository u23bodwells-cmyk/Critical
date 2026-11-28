/* ========== CALCULUS · LEVEL 4 · Integration ========== */
U({id:'c4-1',track:'calc',level:4,title:'Undoing differentiation',icon:'∫',color:'#7F77DD',desc:'Integration as the reverse of differentiation, the + C, and integrating any power of x.',lessons:[
LH('c4-1-1','Integration is the reverse',9,'If differentiating x² gives 2x, what gives 2x? Working backwards is called integration.',[
RM(`<p>Differentiating: <b>axⁿ → anxⁿ⁻¹</b>. Constants differentiate to 0.</p>`),
T(`<h3>Working backwards</h3><p>Differentiation turns x² into 2x. <b>Integration</b> goes the other way: given 2x, find what it came from.</p><div class="eq">∫ 2x dx = x² + C</div>${KY([['∫','"the integral of"',''],['dx','"with respect to x": the variable we\'re working in',''],['C','a constant we can\'t know: the "constant of integration"','']])}`),
T(`<h3>Why + C?</h3><p>x², x² + 3 and x² − 7 all differentiate to 2x, because the constant disappears. So when we work backwards, we can't tell what the constant was. We write <b>+ C</b> to stand for it.</p>`),
Q(`Which of these differentiate to 2x?`,[`All of x², x² + 5 and x² − 1`,'Only x², because constants change it','Only x² + 5 and x² − 1','None of them: they all give 2x + 1'],0,`Constants vanish when you differentiate.`),
Q(`Why do we write + C after integrating?`,[`Any constant would have disappeared when differentiating`,'C stands for "calculus", to show you integrated','It\'s always equal to 1, the starting value of x','To make up for any rounding errors made while integrating'],0,`We can't recover it.`),
T(`<h3>Always check</h3><p>You can check any integral by <b>differentiating</b> your answer. If you get back what you started with, it's right.</p><p>∫ 3x² dx = x³ + C. Check: d/dx (x³ + C) = 3x². ✓</p>`),
Q(`∫ 3x² dx = x³ + C. How can you check this?`,[`Differentiate x³ + C and see if you get 3x²`,'Integrate x³ + C again and see if you get 3x²','Put x = 0 into both sides and see if they match','You can\'t check it without a graph of the curve'],0,`Differentiation undoes integration.`),
T(`<h3>Key points</h3><ul><li><b>Integration</b> is the reverse of differentiation.</li><li>Always add <b>+ C</b>.</li><li>Check by differentiating your answer.</li></ul>`)]),
LH('c4-1-2','Integrating xⁿ',10,'The reverse power rule: add one to the power, then divide by the new power.',[
RM(`<p>Integration reverses differentiation. Always + C. Check by differentiating.</p>`),
T(`<h3>Reversing the power rule</h3><p>Differentiating: multiply by the power, then subtract 1. To reverse it, do the opposite moves in the opposite order:</p><div class="eq">∫ xⁿ dx = xⁿ⁺¹ ÷ (n + 1) + C</div><p><b>Add 1 to the power</b>, then <b>divide by the new power</b>.</p>`),
W('stepCalc',{steps:[`∫ 6x² dx`,`Add 1 to the power: 2 + 1 = 3`,`Divide by the new power: 6 ÷ 3 = 2`,`Answer: <b>2x³ + C</b>`,`Check: d/dx (2x³) = 6x² ✓`]},`Watch the two moves.`,`Up one, divide by the new power, + C.`),
Q(`∫ x⁴ dx = …`,[`x⁵/5 + C`,`4x³ + C`,`x⁵ + C`,`5x⁵ + C`],0,`Power 5, divide by 5.`),
T(`<h3>Constants and sums</h3><ul><li>∫ 7 dx = 7x + C (a constant is 7x⁰; the power goes up to 1).</li><li>Integrate sums <b>term by term</b>, with one + C at the end.</li></ul><p>∫ (3x² + 4x + 5) dx = x³ + 2x² + 5x + C.</p>`),
W('calcDrill',{skill:'intpow',need:8},`Integrate. Get 8 right to master it.`,`Add one to the power, divide by the new power.`),
T(`<h3>Key points</h3><ul><li><b>∫ axⁿ dx = axⁿ⁺¹ ÷ (n + 1) + C</b>.</li><li>Constants: ∫ k dx = kx + C.</li><li>Term by term; one + C.</li></ul>`)]),
LH('c4-1-3','Negative and fractional powers',10,'Rewrite first, then the reverse power rule still works. The one exception: x⁻¹.',[
RM(`<p>∫ xⁿ dx = xⁿ⁺¹ ÷ (n + 1) + C. Rewrite fractions and roots as powers first.</p>`),
T(`<h3>Rewrite, then integrate</h3><p>∫ 6/x³ dx: rewrite as ∫ 6x⁻³ dx. Add 1 to the power: −3 + 1 = −2. Divide by −2: 6 ÷ (−2) = −3. Answer: <b>−3x⁻² + C</b>.</p>`),
T(`<h3>The one exception</h3><p>For x⁻¹ (that's 1/x), adding 1 gives x⁰, and dividing by 0 is impossible. So 1/x needs a different rule. You'll meet it in the next unit: it involves ln x.</p>`),
Q(`Why doesn't the reverse power rule work for 1/x?`,[`It would mean dividing by zero`,'1/x has no graph to find the area under','It does work, giving ln x every time','Because x can never be negative'],0,`x⁻¹ → x⁰ ÷ 0.`),
W('calcDrill',{skill:['intneg','intfrac'],need:6},`Rewrite and integrate. Get 6 right to master it.`,`Careful with negatives: −3 + 1 = −2.`),
W('calcDrill',{skill:['intpow','intneg','intfrac'],need:8},`All powers, mixed. Get 8 right to master it.`,`You can integrate any power of x except 1/x.`),
T(`<h3>Key points</h3><ul><li>Rewrite fractions and roots as powers first.</li><li>−3 + 1 = −2: watch the signs.</li><li><b>1/x is the exception</b>: it needs ln x.</li></ul>`)])
]});

U({id:'c4-2',track:'calc',level:4,title:'Definite integrals and area',icon:'∫ₐᵇ',color:'#1D9E75',desc:'Why integration finds areas, evaluating definite integrals, and areas above and below the axis.',lessons:[
LH('c4-2-1','Area as thin strips',9,'Chop the area under a curve into strips, then make them infinitely thin.',[
RM(`<p>In Level 1, shrinking a chord gave the exact gradient. The same "make it tiny" idea works for areas.</p>`),
T(`<h3>Area under a curve</h3><p>How much area is under y = x² between x = 0 and x = 3? It's curved, so there's no simple formula. But we can split it into thin <b>rectangular strips</b> and add them up.</p>`),
W('riemann',{f:function(x){return x*x},a:0,b:3,exact:9,y:[0,10],n0:3,goalN:30,mid:true},`Drag the slider to use more and more strips.`,`With more and thinner strips, the total gets closer to exactly 9.`),
T(`<h3>Infinitely thin strips</h3><p>As the strips get thinner, the total gets closer and closer to the exact area. In the limit, the sum of infinitely many, infinitely thin strips is written:</p><div class="eq">∫ from 0 to 3 of x² dx</div><p>The ∫ sign is a stretched S, for "sum". The dx is the strip width, shrunk to nothing.</p>`),
Q(`What does the ∫ symbol originally stand for?`,[`A sum (a stretched S)`,'An integer (a curly I)','A slope (a tilted line)','Infinity (a bent 8)'],0,`Adding up infinitely many strips.`),
Q(`Why does using more strips give a better answer?`,[`Thinner strips fit the curve more closely`,'Each strip covers more of the area at once','More strips make the curve itself smoother','It doesn\'t: the number of strips makes no difference'],0,`Less gap between the rectangles and the curve.`),
T(`<h3>Key points</h3><ul><li>The area under a curve is the limit of thin strips added up.</li><li>That limit is written as an <b>integral</b> with limits, ∫ from a to b.</li><li>Next lesson: the shortcut that gives the exact answer.</li></ul>`)]),
LH('c4-2-2','Definite integrals',10,'The shortcut: integrate, then subtract. No + C needed.',[
RM(`<p>The area under a curve is the integral from a to b. To integrate: add 1 to the power, divide by the new power.</p>`),
T(`<h3>The method</h3><div class="eq">∫ from a to b of f(x) dx = F(b) − F(a)</div>${KY([['F(x)','the integral of f(x) (without + C)',''],['a, b','the limits: where the area starts and stops','']],'Integrate, put in the top limit, put in the bottom limit, subtract.')}`),
W('stepCalc',{steps:[`∫ from 0 to 3 of x² dx`,`Integrate: x³ ÷ 3`,`Top limit: 3³ ÷ 3 = 9`,`Bottom limit: 0³ ÷ 3 = 0`,`Subtract: 9 − 0 = <b>9</b>. Exactly what the strips were heading towards!`]},`The exact area from the last lesson.`,`Integrate, then top minus bottom.`),
T(`<h3>Why no + C?</h3><p>If you included it: (F(b) + C) − (F(a) + C) = F(b) − F(a). The C always cancels, so definite integrals don't need it.</p>`),
Q(`Why don't definite integrals need + C?`,[`It cancels when you subtract`,`C is always zero`,`Areas can't have constants`,`They do`],0,`C − C = 0.`),
N(`Evaluate ∫ from 1 to 3 of 2x dx.`,8,0.001,'',`[x²] from 1 to 3 = 9 − 1 = 8.`),
W('calcDrill',{skill:'defint',need:5},`Definite integrals. Get 5 right to master it.`,`Integrate, then top limit minus bottom limit.`),
T(`<h3>Key points</h3><ul><li><b>∫ₐᵇ f(x) dx = F(b) − F(a)</b>.</li><li>Top limit minus bottom limit.</li><li>No + C: it cancels.</li></ul>`)]),
LH('c4-2-3','Areas under curves',10,'Areas above the axis count as positive, below as negative. Know when to split.',[
RM(`<p>∫ₐᵇ f(x) dx = F(b) − F(a). The area under a curve is a definite integral.</p>`),
W('calcDrill',{skill:'area',need:4},`Areas under curves. Get 4 right to master it.`,`Integrate, then top minus bottom.`),
T(`<h3>Below the axis</h3><p>If the curve is <b>below</b> the x-axis, the integral comes out <b>negative</b>. The area itself is still positive: just take the size.</p><p>Example: ∫ from −1 to 1 of x dx = 0. But the actual shaded area is two triangles of 0.5 each: <b>1</b>. The positive and negative parts cancelled!</p>`),
Q(`∫ from −1 to 1 of x dx = 0, but the actual area is 1. Why?`,[`The part below the axis counts as negative and cancels the part above`,'The integral has been worked out wrongly: the answer should be 1','Areas between −1 and 1 always come out as zero for every curve','A straight line like y = x has no area underneath it at all'],0,`Split at the x-axis.`),
T(`<h3>Splitting</h3><p>When a curve crosses the axis, find where it crosses, integrate each part <b>separately</b>, make each one positive, then add them.</p>`),
Q(`To find the total area of a curve that crosses the x-axis, you should…`,[`split it where it crosses, then add the sizes of each part`,'integrate once across the whole range and keep the sign','ignore the part below the axis because it has no area','integrate once, then double the answer to be safe'],0,`Otherwise parts cancel.`),
N(`∫ from 0 to 2 of 3x² dx = ?`,8,0.001,'',`[x³] from 0 to 2 = 8.`),
T(`<h3>Key points</h3><ul><li>Above the axis: positive. Below: <b>negative</b>.</li><li>For total area, <b>split</b> where the curve crosses the axis.</li></ul>`)])
]});

U({id:'c4-3',track:'calc',level:4,title:'Standard integrals',icon:'∫eˣ',color:'#378ADD',desc:'Integrating eˣ, 1/x, sin and cos, and expressions with a linear inside.',lessons:[
LH('c4-3-1','eˣ and 1/x',10,'The integrals of eˣ and 1/x, the exception from earlier.',[
RM(`<p>d/dx (e<sup>kx</sup>) = ke<sup>kx</sup>, and d/dx (ln x) = 1/x.</p>`),
T(`<h3>Integrating eˣ</h3><p>Since eˣ is its own derivative, it's also its own integral:</p><div class="eq">∫ eˣ dx = eˣ + C</div><p>With a k in the power, divide by k (the opposite of differentiating):</p><div class="eq">∫ e<sup>kx</sup> dx = (1/k)e<sup>kx</sup> + C</div>`),
Q(`∫ e³ˣ dx = …`,[`(1/3)e³ˣ + C`,'(1/3)e⁴ˣ + C','(1/4)e⁴ˣ + C',`e⁴ˣ/4 + C`],0,`Divide by k.`),
W('calcDrill',{skill:'intexp',need:5},`Integrate the exponentials. Get 5 right to master it.`,`Divide by k. Check by differentiating.`),
T(`<h3>The missing case: 1/x</h3><p>The derivative of ln x is 1/x. So:</p><div class="eq">∫ 1/x dx = ln|x| + C</div><p>The |x| (the size of x) lets it work for negative x too. This fills the gap the reverse power rule couldn't.</p>`),
N(`Evaluate ∫ from 1 to e of 1/x dx.`,1,0.001,'',`[ln x] from 1 to e = ln e − ln 1 = 1 − 0 = 1.`),
W('calcDrill',{skill:'int1x',need:4},`Definite integrals of a/x. Get 4 right to master it.`,`ln e = 1, ln 1 = 0, ln eᵏ = k.`),
T(`<h3>Key points</h3><ul><li><b>∫ e<sup>kx</sup> dx = (1/k)e<sup>kx</sup> + C</b>.</li><li><b>∫ 1/x dx = ln|x| + C</b>.</li></ul>`)]),
LH('c4-3-2','sin and cos',9,'Reverse the trig derivatives, including the sign change.',[
RM(`<p>d/dx (sin x) = cos x, and d/dx (cos x) = −sin x. Angles in radians.</p>`),
T(`<h3>Reversing them</h3><div class="eq">∫ cos x dx = sin x + C</div><div class="eq">∫ sin x dx = −cos x + C</div><p>Check the second: d/dx (−cos x) = −(−sin x) = sin x ✓</p>`),
Q(`∫ sin x dx = …`,[`−cos x + C`,`cos x + C`,`−sin x + C`,`sin x + C`],0,`The minus is the usual trap.`),
T(`<h3>With a number inside</h3><p>Just like e<sup>kx</sup>, divide by k:</p><div class="eq">∫ cos 2x dx = ½ sin 2x + C</div>`),
Q(`∫ cos 3x dx = …`,[`(1/3) sin 3x + C`,`3 sin 3x + C`,`−(1/3) sin 3x + C`,`sin 3x + C`],0,`Divide by 3.`),
N(`Evaluate ∫ from 0 to π of sin x dx.`,2,0.001,'',`[−cos x] from 0 to π = −cos π + cos 0 = 1 + 1 = 2.`),
N(`Evaluate ∫ from 0 to π/2 of cos x dx.`,1,0.001,'',`[sin x] = sin(π/2) − sin 0 = 1.`),
T(`<h3>Key points</h3><ul><li><b>∫ cos x dx = sin x + C</b>, <b>∫ sin x dx = −cos x + C</b>.</li><li>With kx inside, divide by k.</li><li>The area under one hump of sin x (0 to π) is exactly 2.</li></ul>`)]),
LH('c4-3-3','A linear expression inside',10,'Integrate (ax + b)ⁿ by reversing the chain rule.',[
RM(`<p>Chain rule: (ax + b)ⁿ differentiates to na(ax + b)ⁿ⁻¹. The a comes out because of the inside.</p>`),
T(`<h3>Reverse chain rule</h3><p>To integrate (ax + b)ⁿ:</p><ol><li>Add 1 to the power.</li><li>Divide by the new power.</li><li><b>Also divide by a</b>, the number in front of x inside.</li></ol><div class="eq">∫ (ax + b)ⁿ dx = (ax + b)ⁿ⁺¹ ÷ (a(n + 1)) + C</div>`),
W('stepCalc',{steps:[`∫ (2x + 1)⁴ dx`,`Add 1 to the power: 5`,`Divide by the new power AND by the 2 inside: 1 ÷ (5 × 2) = 1/10`,`Answer: <b>(2x + 1)⁵ ÷ 10 + C</b>`,`Check: d/dx gives 5 × 2 × (2x + 1)⁴ ÷ 10 = (2x + 1)⁴ ✓`]},`Step by step.`,`Divide by both the new power and the inside's coefficient.`),
W('calcDrill',{skill:'intlin',need:5},`Reverse chain rule. Get 5 right to master it.`,`1 ÷ (new power × a).`),
T(`<h3>Key points</h3><ul><li><b>∫ (ax + b)ⁿ dx = (ax + b)ⁿ⁺¹ ÷ (a(n + 1)) + C</b>.</li><li>Only works when the inside is <b>linear</b> (ax + b).</li></ul>`)])
]});

U({id:'c4-4',track:'calc',level:4,title:'Substitution and by parts',icon:'∫u dv',color:'#D85A30',desc:'Integration by substitution, integration by parts, and how to choose the right method.',lessons:[
LH('c4-4-1','Integration by substitution',11,'Swap a messy inside for a single letter u, integrate, then swap back.',[
RM(`<p>Chain rule: the derivative of f(g(x)) is f′(g(x)) × g′(x). Substitution reverses this.</p>`),
T(`<h3>Spotting the pattern</h3><p>Look at ∫ 2x(x² + 1)⁴ dx. The inside is x² + 1, and its derivative, 2x, is sitting right there as a multiplier. That's the sign substitution will work.</p>`),
W('stepCalc',{steps:[`∫ 2x(x² + 1)⁴ dx`,`Let u = x² + 1`,`Then du/dx = 2x, so du = 2x dx`,`The integral becomes ∫ u⁴ du`,`Integrate: u⁵ ÷ 5 + C`,`Swap back: <b>(x² + 1)⁵ ÷ 5 + C</b>`]},`Substitution, step by step.`,`Choose u, find du, rewrite everything in u, integrate, swap back.`),
Q(`In ∫ 2x(x² + 1)⁴ dx, why is u = x² + 1 a good choice?`,[`Its derivative, 2x, is also in the integral`,'It\'s the biggest part, so it\'s the hardest bit','It\'s raised to a power, and powers always go first','Any choice works, so we pick the first bracket'],0,`du replaces the 2x dx.`),
W('calcDrill',{skill:'subst',need:4},`Substitution practice. Get 4 right to master it.`,`u = x² + 1, then the 2x dx becomes du.`),
T(`<h3>Key points</h3><ul><li>Look for an inside whose <b>derivative is also present</b>.</li><li>u = inside, find du, rewrite in u, integrate, <b>swap back</b>.</li></ul>`)]),
LH('c4-4-2','Integration by parts',11,'The product rule in reverse, for integrals like x·eˣ.',[
RM(`<p>Product rule: (uv)′ = u′v + uv′.</p>`),
T(`<h3>The formula</h3><p>Integrating the product rule and rearranging gives:</p><div class="eq">∫ u (dv/dx) dx = uv − ∫ v (du/dx) dx</div><p>Use it when the integral is one function <b>multiplied</b> by another, like x·eˣ or x·cos x.</p>${KY([['u','the part you\'ll differentiate (pick the one that gets simpler)',''],['dv/dx','the part you\'ll integrate','']])}`),
W('stepCalc',{steps:[`∫ x eˣ dx`,`u = x (gets simpler when differentiated), dv/dx = eˣ`,`du/dx = 1, v = eˣ`,`uv − ∫ v du/dx dx = xeˣ − ∫ eˣ dx`,`= <b>xeˣ − eˣ + C</b>`]},`By parts, step by step.`,`Choose u so it gets simpler; integrate the rest.`),
Q(`In ∫ x cos x dx, which should be u?`,[`x, because it becomes 1 when differentiated`,'cos x, because it\'s easy to differentiate','Either one: by parts gives the same either way','Neither: this one needs substitution instead'],0,`Then ∫ x cos x dx = x sin x + cos x + C.`),
T(`<h3>A handy order for choosing u</h3><p>Pick u from whichever comes first in this list: <b>logs</b> (ln x), then <b>powers of x</b>, then <b>trig and exponentials</b>. So for ∫ x ln x dx, u = ln x.</p>`),
W('calcDrill',{skill:'parts',need:3},`Definite integrals by parts. Get 3 right to master it.`,`(x − 1)eˣ, then top limit minus bottom limit.`),
T(`<h3>Key points</h3><ul><li><b>∫ u dv = uv − ∫ v du</b>.</li><li>Choose u to get simpler: logs, then powers, then trig/exponentials.</li></ul>`)]),
LH('c4-4-3','Choosing a method',9,'Look at an integral and decide which tool to use.',[
RM(`<p>Tools so far: reverse power rule, eˣ, 1/x, sin/cos, linear inside, substitution, by parts.</p>`),
T(`<h3>A decision checklist</h3><ol><li>Is it a <b>standard</b> integral? (xⁿ, eˣ, 1/x, sin, cos) → use the rule.</li><li>Is it something to a power with a <b>linear</b> inside? → reverse chain.</li><li>Is the derivative of an inside <b>also there</b>? → substitution.</li><li>Is it a <b>product</b> of two different types? → by parts.</li></ol>`),
Q(`∫ (5x − 2)³ dx. Best method?`,[`Reverse chain (linear inside)`,'By parts (two things multiplied)',`Substitution with u = x²`,'It can\'t be integrated (too hard)'],0,`Linear inside.`),
Q(`∫ x eˣ dx. Best method?`,[`By parts`,`Reverse power rule`,`Reverse chain`,`Standard integral`],0,`A product of two types.`),
Q(`∫ 3x²(x³ + 4)⁵ dx. Best method?`,[`Substitution with u = x³ + 4`,'By parts, with u = x³ + 4','Reverse power rule on each term','Reverse chain (linear inside)'],0,`3x² is the derivative of the inside.`),
Q(`∫ 4x³ dx. Best method?`,[`Reverse power rule`,'Integration by parts','Substitution, u = x³','Use the ln rule'],0,`A plain power.`),
W('calcDrill',{skill:['intpow','intneg','intexp','intlin','subst','defint'],need:8},`The big integration review: every type mixed. Get 8 right to master it.`,`You can integrate everything in this level.`),
T(`<h3>Key points</h3><ul><li>Standard → rule. Linear inside → reverse chain.</li><li>Derivative of the inside present → substitution.</li><li>Product of different types → by parts.</li></ul>`)])
]});

F('c4-1-1',[Q(`Integration is the reverse of…`,[`differentiation`,`multiplication`,`substitution`,`factorising`],0,`Undoing.`),Q(`∫ 2x dx = …`,[`x² + C`,`2 + C`,`2x² + C`,`x + C`],0,`d/dx (x²) = 2x.`),Q(`What does C stand for?`,[`An unknown constant`,`Calculus`,`Cosine`,`The curve`],0,`Constant of integration.`),Q(`To check an integral, you…`,[`differentiate your answer`,`integrate it again`,`square it`,`set x = 1`],0,`Reverse.`),Q(`∫ 3x² dx = …`,[`x³ + C`,`6x + C`,`3x³ + C`,`x² + C`],0,`Power up, divide.`)]);
F('c4-1-2',[GN('intpow'),GN('intpow'),GN('intpow'),Q(`∫ 5 dx = …`,[`5x + C`,`0`,`5 + C`,`x⁵ + C`],0,`Constant → kx.`),GN('intpow')]);
F('c4-1-3',[GN('intneg'),GN('intfrac'),GN('intneg'),GN('intfrac'),Q(`Which can't be integrated with the reverse power rule?`,[`1/x`,`1/x²`,`√x`,`x⁵`],0,`Divide by zero.`)]);
F('c4-2-1',[Q(`More strips under a curve gives…`,[`a better estimate of the area`,`a worse estimate`,`the same answer`,`zero`],0,`Closer fit.`),Q(`The integral is the limit of…`,[`infinitely thin strips added up`,`chords`,`tangents`,`points`],0,`Sum of strips.`),Q(`∫ looks like a stretched…`,[`S, for sum`,`I, for integer`,`f, for function`,`L, for limit`],0,`S.`),N(`Area under y = x² from 0 to 3?`,9,0.001,'',`Exact.`),Q(`dx in an integral represents…`,[`the strip width, shrunk to nothing`,`d times x`,`the derivative`,`a constant`],0,`Width.`)]);
F('c4-2-2',[GN('defint'),GN('defint'),GN('defint'),Q(`∫ₐᵇ f(x) dx = …`,[`F(b) − F(a)`,`F(a) − F(b)`,`F(b) + F(a)`,`f(b) − f(a)`],0,`Top minus bottom.`),Q(`Do definite integrals need + C?`,[`No, it cancels`,`Yes`,`Only sometimes`,`Only for areas`],0,`Cancels.`)]);
F('c4-2-3',[GN('area'),GN('area'),Q(`An integral of a curve below the x-axis is…`,[`negative`,`positive`,`zero`,`undefined`],0,`Below.`),Q(`For total area when a curve crosses the axis, you…`,[`split at the crossing and add the sizes`,`integrate once`,`ignore the negative part`,`halve it`],0,`Split.`),N(`∫ from −2 to 2 of x dx = ?`,0,0.001,'',`The parts cancel.`)]);
F('c4-3-1',[GN('intexp'),GN('intexp'),GN('int1x'),Q(`∫ 1/x dx = …`,[`ln|x| + C`,`x⁰/0 + C`,`−1/x² + C`,`eˣ + C`],0,`ln.`),Q(`∫ eˣ dx = …`,[`eˣ + C`,`xeˣ + C`,`eˣ⁺¹/(x + 1) + C`,`ln x + C`],0,`Its own integral.`)]);
F('c4-3-2',[Q(`∫ cos x dx = …`,[`sin x + C`,`−sin x + C`,`cos x + C`,`−cos x + C`],0,`Reverse.`),Q(`∫ sin x dx = …`,[`−cos x + C`,`cos x + C`,`sin x + C`,`−sin x + C`],0,`Minus.`),Q(`∫ sin 2x dx = …`,[`−½ cos 2x + C`,`−2 cos 2x + C`,`½ cos 2x + C`,`cos 2x + C`],0,`Divide by 2, keep the minus.`),N(`∫ from 0 to π of sin x dx = ?`,2,0.001,'',`2.`),N(`∫ from 0 to π/2 of cos x dx = ?`,1,0.001,'',`1.`)]);
F('c4-3-3',[GN('intlin'),GN('intlin'),GN('intlin'),Q(`∫ (3x + 1)² dx: you divide by…`,[`3 × 3 = 9`,`3`,`2`,`6`],0,`New power 3 × inside's 3.`),Q(`The reverse chain shortcut only works when the inside is…`,[`linear (ax + b)`,`squared`,`a constant`,`a fraction`],0,`Linear.`)]);
F('c4-4-1',[GN('subst'),GN('subst'),Q(`A good substitution has…`,[`the inside's derivative also in the integral`,`the biggest number`,`no x in it`,`a square root`],0,`Spot the pair.`),Q(`If u = x² + 1, then du = …`,[`2x dx`,`x dx`,`2 dx`,`(x² + 1) dx`],0,`Differentiate.`),Q(`The last step in substitution is to…`,[`swap u back for the expression in x`,`differentiate`,`set u = 0`,`add the limits`],0,`Swap back.`)]);
F('c4-4-2',[GN('parts'),Q(`By parts: ∫ u dv = …`,[`uv − ∫ v du`,`uv + ∫ v du`,`u′v′`,`∫ u du − ∫ v dv`],0,`Learn by heart.`),Q(`∫ x eˣ dx = …`,[`xeˣ − eˣ + C`,`xeˣ + C`,`x²eˣ/2 + C`,`eˣ + C`],0,`By parts.`),Q(`For ∫ x ln x dx, choose u = …`,[`ln x`,`x`,`either`,`x ln x`],0,`Logs first.`),Q(`By parts is the reverse of…`,[`the product rule`,`the chain rule`,`the quotient rule`,`the power rule`],0,`Product.`)]);
F('c4-4-3',[GN('intlin'),GN('subst'),GN('intexp'),Q(`∫ x sin x dx. Best method?`,[`By parts`,`Reverse chain`,`Substitution`,`Standard rule`],0,`Product.`),Q(`∫ (4x + 3)⁶ dx. Best method?`,[`Reverse chain`,`By parts`,`ln`,`It can't be done`],0,`Linear inside.`)]);

TT('c4-1',[x('c4-1-2',GN('intpow')),x('c4-1-2',GN('intpow')),x('c4-1-2',GN('intpow')),x('c4-1-3',GN('intneg')),x('c4-1-3',GN('intfrac')),x('c4-1-3',GN('intneg')),x('c4-1-1',Q(`Why + C?`,[`Constants vanish when differentiating`,`It's required by law`,`C = 1`,`For area`],0,`Unknown constant.`)),x('c4-1-1',Q(`Check an integral by…`,[`differentiating it`,`integrating again`,`graphing it`,`setting x = 0`],0,`Reverse.`)),x('c4-1-3',Q(`The reverse power rule fails for…`,[`x⁻¹`,`x⁻²`,`x⁰`,`x⁰·⁵`],0,`1/x.`)),x('c4-1-2',Q(`∫ x³ dx = …`,[`x⁴/4 + C`,`3x² + C`,`x⁴ + C`,`4x⁴ + C`],0,`Up one, divide.`))]);
TT('c4-2',[x('c4-2-2',GN('defint')),x('c4-2-2',GN('defint')),x('c4-2-2',GN('defint')),x('c4-2-3',GN('area')),x('c4-2-3',GN('area')),x('c4-2-1',Q(`The integral is the limit of…`,[`thin strips added up`,`chord gradients`,`tangents`,`averages`],0,`Strips.`)),x('c4-2-2',Q(`Definite integrals need + C?`,[`No`,`Yes`,`Sometimes`,`Only if negative`],0,`Cancels.`)),x('c4-2-3',Q(`Part of a curve below the axis gives a…`,[`negative integral`,`positive integral`,`zero`,`bigger area`],0,`Below.`)),x('c4-2-3',N(`∫ from −3 to 3 of x dx = ?`,0,0.001,'',`Cancels.`)),x('c4-2-1',N(`Area under y = x² from 0 to 3?`,9,0.001,'',`[x³/3].`))]);
TT('c4-3',[x('c4-3-1',GN('intexp')),x('c4-3-1',GN('intexp')),x('c4-3-1',GN('int1x')),x('c4-3-3',GN('intlin')),x('c4-3-3',GN('intlin')),x('c4-3-2',Q(`∫ cos x dx = …`,[`sin x + C`,`−sin x + C`,`−cos x + C`,`cos x + C`],0,`Reverse.`)),x('c4-3-2',Q(`∫ sin x dx = …`,[`−cos x + C`,`cos x + C`,`sin x + C`,`−sin x + C`],0,`Minus.`)),x('c4-3-2',N(`∫ from 0 to π of sin x dx = ?`,2,0.001,'',`2.`)),x('c4-3-1',Q(`∫ 1/x dx = …`,[`ln|x| + C`,`x + C`,`1 + C`,`−1/x + C`],0,`ln.`)),x('c4-3-1',Q(`∫ e⁴ˣ dx = …`,[`¼e⁴ˣ + C`,`4e⁴ˣ + C`,`e⁴ˣ + C`,`e⁵ˣ/5 + C`],0,`Divide by 4.`))]);
TT('c4-4',[x('c4-4-1',GN('subst')),x('c4-4-1',GN('subst')),x('c4-4-2',GN('parts')),x('c4-4-2',GN('parts')),x('c4-4-2',Q(`∫ u dv = …`,[`uv − ∫ v du`,`uv + ∫ v du`,`u′v + uv′`,`uv`],0,`By parts.`)),x('c4-4-3',Q(`∫ x cos x dx. Method?`,[`By parts`,`Substitution`,`Reverse chain`,`Standard`],0,`Product.`)),x('c4-4-3',Q(`∫ 2x(x² − 3)⁵ dx. Method?`,[`Substitution`,`By parts`,`Standard`,`ln`],0,`Derivative present.`)),x('c4-4-3',Q(`∫ (2x + 7)⁴ dx. Method?`,[`Reverse chain`,`By parts`,`ln`,`Substitution with u = 2x`],0,`Linear inside.`)),x('c4-4-2',Q(`For ∫ x ln x dx, u = …`,[`ln x`,`x`,`1`,`x ln x`],0,`Logs first.`)),x('c4-4-1',Q(`After integrating in u, you must…`,[`substitute back`,`differentiate`,`add limits`,`square it`],0,`Swap back.`))]);

