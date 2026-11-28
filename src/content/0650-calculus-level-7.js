/* ========== CALCULUS · LEVEL 7 · More differentiation (rest of Calculus 1) ========== */
var C7TRI=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,5,13],[4,3,5]];
CGEN.implicit=function(){var t=cP(C7TRI),a=t[0]*cP([1,-1]),b=t[1]*cP([1,-1]),v=Math.round(-a/b*1000)/1000;
 return {p:'x² + y² = '+(t[2]*t[2])+'. Find dy/dx at the point ('+cNum(a)+', '+cNum(b)+'). (3 decimal places if needed)',b:[cB(v,'dy/dx = ','','gradient',false,0.002)],e:'Differentiate: 2x + 2y(dy/dx) = 0, so dy/dx = −x/y = −('+cNum(a)+') ÷ ('+cNum(b)+') = '+cNum(v)+'.'}};
CGEN.implicit2=function(){var p,q;do{p=cR(-3,3);q=cR(-3,3)}while(p+2*q===0||(p===0&&q===0));var k=p*p+p*q+q*q,v=Math.round(-(2*p+q)/(p+2*q)*1000)/1000;
 return {p:'x² + xy + y² = '+k+'. Find dy/dx at ('+cNum(p)+', '+cNum(q)+'). (3 decimal places if needed)',b:[cB(v,'dy/dx = ','','gradient',false,0.002)],e:'Differentiate term by term: 2x + (y + x dy/dx) + 2y dy/dx = 0. Collect: dy/dx (x + 2y) = −(2x + y). So dy/dx = −(2x + y)/(x + 2y) = −('+cNum(2*p+q)+')/('+cNum(p+2*q)+') = '+cNum(v)+'.'}};
CGEN.relcirc=function(){var k=cR(1,5),R=cR(2,20),v=Math.round(2*Math.PI*R*k*10)/10;
 return {p:'A circular ripple\'s radius grows at '+k+' cm/s. How fast is its area growing when the radius is '+R+' cm? (1 decimal place)',b:[cB(v,'dA/dt = ',' cm²/s','rate',false,0.002)],e:'A = πr², so dA/dt = 2πr × dr/dt = 2π × '+R+' × '+k+' = '+cNum(v)+' cm²/s.'}};
CGEN.ladder=function(){var s=cP([1,2,3]),L=5*s,x=3*s,y=4*s,v=cR(1,4)/2,ans=Math.round(-x*v/y*1000)/1000;if(cR(0,1)){x=4*s;y=3*s;ans=Math.round(-x*v/y*1000)/1000}
 return {p:'A '+L+' m ladder leans on a wall. Its foot slides away at '+cNum(v)+' m/s. How fast is the top moving when the foot is '+x+' m from the wall? (Negative means down. 3 d.p. if needed)',b:[cB(ans,'dy/dt = ',' m/s','rate',false,0.002)],e:'x² + y² = '+(L*L)+'. When x = '+x+', y = '+y+'. Differentiate: 2x dx/dt + 2y dy/dt = 0, so dy/dt = −x(dx/dt)/y = −'+x+' × '+cNum(v)+' ÷ '+y+' = '+cNum(ans)+' m/s.'}};
CGEN.linapprox=function(){var n=cR(2,10),h=cNZ(-3,3),v=Math.round((n+h/(2*n))*10000)/10000;
 return {p:'Use a linear approximation of √x at x = '+(n*n)+' to estimate √'+(n*n+h)+'. (4 decimal places)',b:[cB(v,'≈ ','','estimate',false,0.0001)],e:'f(x) = √x, f′(x) = 1/(2√x). At '+(n*n)+': f = '+n+', f′ = 1/'+(2*n)+'. So √'+(n*n+h)+' ≈ '+n+' + ('+cNum(h)+')/'+(2*n)+' = '+cNum(v)+'. (The true value is '+Math.sqrt(n*n+h).toFixed(4)+'.)'}};
CGEN.invtrig=function(){var a=cR(1,4),b=cP([0,0.5,1,2]),v=Math.round(a/(1+a*a*b*b)*1000)/1000;
 return {p:'y = arctan('+cCo(a)+'x). Find dy/dx at x = '+cNum(b)+'. (3 decimal places if needed)',b:[cB(v,'dy/dx = ','','gradient',false,0.002)],e:'d/dx arctan(u) = u′/(1 + u²). With u = '+cCo(a)+'x: dy/dx = '+a+'/(1 + '+(a*a)+'x²). At x = '+cNum(b)+': '+a+'/(1 + '+cNum(a*a*b*b)+') = '+cNum(v)+'.'}};
CGEN.dinv=function(){var a=cR(-3,3),c=cR(1,3),fa=a*a*a+c*a,v=Math.round(1/(3*a*a+c)*10000)/10000;
 return {p:'f(x) = x³ + '+cCo(c)+'x. Find (f⁻¹)′('+cNum(fa)+'). (4 decimal places if needed)',b:[cB(v,'(f⁻¹)′ = ','','gradient',false,0.002)],e:'f('+cNum(a)+') = '+cNum(fa)+', so f⁻¹('+cNum(fa)+') = '+cNum(a)+'. f′(x) = 3x² + '+c+', so f′('+cNum(a)+') = '+(3*a*a+c)+'. The inverse\'s gradient is the reciprocal: 1/'+(3*a*a+c)+' = '+cNum(v)+'.'}};

U({id:'c7-1',track:'calc',level:7,title:'Implicit differentiation',icon:'dy/dx',color:'#7F77DD',desc:'Differentiate equations that are not written as y = …, from circles to logarithmic differentiation.',lessons:[
LH('c7-1-1','When y isn\'t on its own',10,'A circle can\'t be written as one y = … function, but it still has a gradient everywhere. Here\'s how to find it.',[
RM(`<p><b>Chain rule</b>: d/dx f(g(x)) = f′(g(x)) × g′(x). For example, d/dx (3x + 1)² = 2(3x + 1) × 3.</p>`),
T(`<h3>An equation, not a formula</h3><p>The circle <b>x² + y² = 25</b> has a tangent at every point, but you can't write it as a single y = … (it would need both +√ and −√).</p><p><b>Implicit differentiation</b>: differentiate both sides with respect to x, treating y as a function of x.</p>`),
T(`<h3>The key step: differentiating y²</h3><p>y depends on x, so y² is a function inside a function. By the chain rule:</p><div class="eq">d/dx (y²) = 2y × dy/dx</div>${KY([['2y','the derivative of "something squared"',''],['dy/dx','times the derivative of the something: y itself','']],'Every time you differentiate a y term, multiply by dy/dx.')}`),
Q(`d/dx (y³) = …`,[`3y² dy/dx`,`3y²`,`3x²`,`y³ dy/dx`],0,`Chain rule: 3y² times dy/dx.`),
W('stepCalc',{steps:[`x² + y² = 25`,`Differentiate both sides with respect to x: 2x + 2y (dy/dx) = 0`,`Move 2x across: 2y (dy/dx) = −2x`,`Divide by 2y: <b>dy/dx = −x/y</b>`,`At (3, 4): dy/dx = −3/4. At (3, −4): +3/4.`]},`The gradient of a circle.`,`The answer has y in it: that's normal for implicit differentiation.`),
Q(`Why is it fine for dy/dx to contain y?`,[`The point (x, y) tells you both, so you can substitute both`,`It isn't: the answer must only contain x`,`Because y is always zero on a circle`,`Because dy/dx and y are the same thing`],0,`Substitute the point's x and y.`),
W('calcDrill',{skill:'implicit',need:4},`Gradients on a circle. Get 4 right to master it.`,`dy/dx = −x/y.`),
T(`<h3>Key points</h3><ul><li>Differentiate <b>both sides</b> with respect to x.</li><li>Every y term gets a <b>× dy/dx</b> (chain rule).</li><li>Rearrange for dy/dx; the answer can contain x and y.</li></ul>`)]),
LH('c7-1-2','Products of x and y',10,'When x and y are multiplied together, the product rule joins in.',[
RM(`<p>d/dx (y²) = 2y dy/dx. <b>Product rule</b>: d/dx (uv) = u′v + uv′.</p>`),
T(`<h3>Differentiating xy</h3><p>xy is x times y: a product. With u = x and v = y:</p><div class="eq">d/dx (xy) = 1 × y + x × dy/dx = y + x dy/dx</div>`),
Q(`d/dx (x²y) = …`,[`2xy + x² dy/dx`,`2x dy/dx`,`2xy`,`x² dy/dx`],0,`u = x², v = y: u′v + uv′.`),
W('stepCalc',{steps:[`x² + xy + y² = 7. Find dy/dx at (1, 2).`,`Differentiate each term: 2x + (y + x dy/dx) + 2y dy/dx = 0`,`Collect the dy/dx terms: dy/dx (x + 2y) = −2x − y`,`So dy/dx = −(2x + y)/(x + 2y)`,`At (1, 2): −(2 + 2)/(1 + 4) = <b>−4/5</b>`]},`Implicit differentiation with a product.`,`Collect every dy/dx term on one side, then factorise.`),
W('calcDrill',{skill:'implicit2',need:4},`Implicit curves with xy. Get 4 right to master it.`,`dy/dx = −(2x + y)/(x + 2y).`),
T(`<h3>Tangent lines</h3><p>Once you have the gradient at a point, the tangent is y − y₁ = m(x − x₁). For the curve above at (1, 2): y − 2 = −0.8(x − 1).</p>`),
QE(`Find lim<sub>x→0</sub> (e<sup>2x</sup> − 1)/x.`,[`2`,`1`,`0`,`e²`],0,`L'Hôpital: 2e<sup>2x</sup> → 2.`),
T(`<h3>Key points</h3><ul><li><b>d/dx (xy) = y + x dy/dx</b>.</li><li>Collect dy/dx terms, factorise, divide.</li><li>Use y − y₁ = m(x − x₁) for tangents.</li></ul>`)]),
LH('c7-1-3','Logarithmic differentiation',9,'Take logs first, and impossible-looking derivatives like xˣ become easy.',[
RM(`<p>d/dx (ln x) = 1/x. ln(ab) = ln a + ln b and ln(aⁿ) = n ln a. Implicit: d/dx (ln y) = (1/y) dy/dx.</p>`),
T(`<h3>Where ln x's derivative comes from</h3><p>y = ln x means eʸ = x. Differentiate implicitly: eʸ dy/dx = 1, so dy/dx = 1/eʸ = <b>1/x</b>. A derivative you learned as a fact, now proved.</p>`),
T(`<h3>A power with x on top</h3><p>y = xˣ isn't xⁿ (the power changes) or aˣ (the base changes). Take ln of both sides first:</p>`),
W('stepCalc',{steps:[`y = xˣ`,`Take ln: ln y = x ln x`,`Differentiate implicitly: (1/y) dy/dx = 1 × ln x + x × (1/x) = ln x + 1`,`Multiply by y: dy/dx = y(ln x + 1)`,`Put y back: <b>dy/dx = xˣ(ln x + 1)</b>`]},`Differentiate xˣ.`,`Take ln, differentiate implicitly, multiply back by y.`),
Q(`What's the first step in logarithmic differentiation?`,[`Take ln of both sides`,`Use the quotient rule`,`Integrate both sides`,`Set x = 1`],0,`Logs turn powers and products into sums.`),
N(`y = xˣ. Find dy/dx at x = 1.`,1,0.001,'',`1¹ × (ln 1 + 1) = 1 × 1 = 1.`),
Q(`d/dx (ln y) = …`,[`(1/y) dy/dx`,`1/y`,`1/x`,`ln(dy/dx)`],0,`Chain rule.`),
T(`<h3>Key points</h3><ul><li>Implicit differentiation proves <b>d/dx ln x = 1/x</b>.</li><li><b>Logarithmic differentiation</b>: take ln, differentiate implicitly, multiply by y.</li><li>d/dx xˣ = xˣ(ln x + 1).</li></ul>`)])
]});

U({id:'c7-2',track:'calc',level:7,title:'Related rates',icon:'d/dt',color:'#1D9E75',desc:'When two quantities are linked, their rates of change are linked too: ripples, ladders and tanks.',lessons:[
LH('c7-2-1','Rates linked by the chain rule',9,'If a circle\'s radius is growing, how fast is its area growing? The chain rule answers that.',[
RM(`<p>Chain rule: dy/dt = dy/dx × dx/dt. Area of a circle: A = πr².</p>`),
T(`<h3>Everything changes with time</h3><p>A stone drops into a pond. The ripple's radius r grows, so its area A grows too. Both depend on time t.</p><p>A and r are linked by A = πr². Differentiate <b>with respect to t</b>:</p><div class="eq">dA/dt = 2πr × dr/dt</div>${KY([['dA/dt','how fast the area grows','cm²/s'],['dr/dt','how fast the radius grows','cm/s'],['2πr','dA/dr: the link between them','cm']])}`),
Q(`The radius grows at 2 cm/s. At r = 10 cm, dA/dt = …`,[`40π cm²/s`,`20π cm²/s`,`100π cm²/s`,`4π cm²/s`],0,`2π × 10 × 2 = 40π.`),
T(`<h3>The same rate, different effects</h3><p>The radius grows steadily, but the area grows <b>faster and faster</b>, because 2πr gets bigger. The same idea explains why a reactor\'s heat output rises sharply as fuel temperature climbs in some faults: linked quantities, linked rates.</p>`),
W('calcDrill',{skill:'relcirc',need:3},`Ripples. Get 3 right to master it.`,`dA/dt = 2πr × dr/dt.`),
Q(`Why do we differentiate with respect to t, not x?`,[`Because we want rates of change over time`,`Because t is always smaller than x`,`Because x isn't allowed in related rates`,`It makes no difference`],0,`Time is what both quantities depend on.`),
T(`<h3>Key points</h3><ul><li><b>Related rates</b>: quantities linked by an equation have linked rates.</li><li>Differentiate the equation <b>with respect to t</b>.</li><li>dA/dt = 2πr dr/dt for a growing circle.</li></ul>`)]),
LH('c7-2-2','A method for any problem',10,'Five steps that turn a wordy rates problem into a calculation.',[
RM(`<p>Differentiate the linking equation with respect to t. Implicit: d/dt (y²) = 2y dy/dt.</p>`),
T(`<h3>The five steps</h3><ol><li><b>Draw</b> a picture and label what changes.</li><li><b>Write</b> what you know (a rate) and what you want (another rate).</li><li><b>Find an equation</b> linking the quantities.</li><li><b>Differentiate</b> it with respect to t.</li><li><b>Substitute</b> the numbers at the moment asked about, last.</li></ol>`),
O(`Put the related rates steps in order.`,['Draw and label','Write the known and wanted rates','Find an equation linking the quantities','Differentiate with respect to t','Substitute the numbers'],`Substitute last: if you put numbers in before differentiating, you lose the rates.`),
W('stepCalc',{steps:[`A 5 m ladder leans on a wall. Its foot slides away at 0.5 m/s. How fast does the top fall when the foot is 3 m out?`,`Draw: foot x from the wall, top y up the wall. Know dx/dt = 0.5; want dy/dt.`,`Equation (Pythagoras): x² + y² = 25`,`Differentiate with respect to t: 2x dx/dt + 2y dy/dt = 0`,`At x = 3, y = 4: 2(3)(0.5) + 2(4) dy/dt = 0, so 3 + 8 dy/dt = 0`,`<b>dy/dt = −0.375 m/s</b>: the top falls at 0.375 m/s`]},`The sliding ladder.`,`The negative sign means y is getting smaller.`),
Q(`Why substitute the numbers last?`,[`If x is fixed at 3 too early, its rate of change disappears`,`Because it makes the arithmetic easier`,`Because the numbers are not needed`,`It doesn't matter when`],0,`Fixing x as 3 before differentiating would make dx/dt zero.`),
W('calcDrill',{skill:'ladder',need:3},`Sliding ladders. Get 3 right to master it.`,`dy/dt = −x(dx/dt)/y.`),
T(`<h3>Key points</h3><ul><li><b>Draw, write, equation, differentiate, substitute</b>.</li><li>Substitute numbers <b>after</b> differentiating.</li><li>A negative rate means that quantity is decreasing.</li></ul>`)]),
LH('c7-2-3','Tanks and balloons',10,'Volumes of cones and spheres, filling and emptying: the classic related rates problems.',[
RM(`<p>Related rates: equation, differentiate with respect to t, substitute last. Sphere: V = (4/3)πr³. Cone: V = (1/3)πr²h.</p>`),
T(`<h3>Inflating a balloon</h3><p>Air goes in at 100 cm³/s. How fast does the radius grow when r = 5 cm?</p><p>V = (4/3)πr³, so <b>dV/dt = 4πr² dr/dt</b>. At r = 5: 100 = 4π(25) dr/dt, so dr/dt = 1/π ≈ <b>0.318 cm/s</b>.</p>`),
N(`Same balloon (100 cm³/s). How fast does r grow when r = 10 cm? (3 decimal places)`,0.0796,0.005,'cm/s',`100 = 4π(100) dr/dt, so dr/dt = 1/(4π) ≈ 0.0796 cm/s.`),
T(`<h3>The bigger it gets, the slower r grows</h3><p>dr/dt = (dV/dt) ÷ (4πr²). 4πr² is the surface area, so the same air spreads over a bigger skin. A neat link: the derivative of the volume of a sphere is its surface area.</p>`),
W('stepCalc',{steps:[`A cone-shaped tank, point down, has radius equal to height (r = h). Water flows in at 3 m³/min. How fast does the depth rise when h = 2 m?`,`Volume of water: V = (1/3)πr²h. Use r = h to remove r: V = (1/3)πh³`,`Differentiate with respect to t: dV/dt = πh² dh/dt`,`At h = 2: 3 = π(4) dh/dt`,`<b>dh/dt = 3/(4π) ≈ 0.239 m/min</b>`]},`Filling a cone.`,`Use the shape to get rid of one variable before you differentiate.`),
Q(`In the cone problem, why replace r with h first?`,[`So V depends on just one changing quantity`,`Because r is always zero at the bottom`,`Because cones don't have a radius`,`To make the volume bigger`],0,`One variable, one derivative.`),
QE(`d/dx (xy) = …`,[`y + x dy/dx`,`x dy/dx`,`dy/dx`,`xy dy/dx`],0,`Product rule.`),
T(`<h3>Key points</h3><ul><li>Sphere: <b>dV/dt = 4πr² dr/dt</b>.</li><li>Cones: use the shape (like r = h) to remove a variable first.</li><li>Same flow in, slower growth as the shape gets bigger.</li></ul>`)])
]});

U({id:'c7-3',track:'calc',level:7,title:'Inverses and approximation',icon:'f⁻¹',color:'#378ADD',desc:'Derivatives of inverse functions and inverse trig, linear approximation and Newton\'s method.',lessons:[
LH('c7-3-1','Derivatives of inverse functions',9,'If you know a function\'s gradient, you know its inverse\'s gradient too: just flip it.',[
RM(`<p>f⁻¹ undoes f: if f(a) = b then f⁻¹(b) = a. The graph of f⁻¹ is f reflected in y = x.</p>`),
T(`<h3>Flip the gradient</h3><p>Reflecting in y = x swaps rise and run. So a gradient of m becomes a gradient of 1/m:</p><div class="eq">dx/dy = 1 ÷ (dy/dx)</div>`),
T(`<h3>In function notation</h3><p>If f(a) = b, then</p><div class="eq">(f⁻¹)′(b) = 1 ÷ f′(a)</div>${KY([['b','the point on the inverse\'s graph',''],['a','the matching point on f, where f(a) = b','']],'Find a first, then use f′(a).')}`),
W('stepCalc',{steps:[`f(x) = x³ + x. Find (f⁻¹)′(2).`,`Find a with f(a) = 2: a³ + a = 2, so a = 1`,`f′(x) = 3x² + 1, so f′(1) = 4`,`<b>(f⁻¹)′(2) = 1/4</b>`]},`An inverse you couldn't write down.`,`You never needed the formula for f⁻¹.`),
Q(`f(3) = 7 and f′(3) = 2. What is (f⁻¹)′(7)?`,[`1/2`,`2`,`1/7`,`3`],0,`Reciprocal of f′(3).`),
W('calcDrill',{skill:'dinv',need:3},`Gradients of inverses. Get 3 right to master it.`,`Find a, then 1/f′(a).`),
T(`<h3>Key points</h3><ul><li><b>(f⁻¹)′(b) = 1/f′(a)</b>, where f(a) = b.</li><li>Find a first. You don't need a formula for f⁻¹.</li><li>dx/dy = 1/(dy/dx).</li></ul>`)]),
LH('c7-3-2','Inverse trig derivatives',10,'arcsin and arctan have surprisingly simple derivatives, and arctan turns up in integration all the time.',[
RM(`<p>sin²θ + cos²θ = 1 and 1 + tan²θ = sec²θ. d/dx sin x = cos x, d/dx tan x = sec²x. Inverse gradient = 1/(dy/dx).</p>`),
W('stepCalc',{steps:[`y = arcsin x, so sin y = x`,`Differentiate implicitly: cos y × dy/dx = 1`,`dy/dx = 1/cos y`,`cos y = √(1 − sin²y) = √(1 − x²)`,`<b>d/dx arcsin x = 1/√(1 − x²)</b>`]},`Derive the derivative of arcsin.`,`Turn cos y back into x using sin² + cos² = 1.`),
T(`<h3>arctan</h3><p>The same method with tan y = x gives sec²y dy/dx = 1, and sec²y = 1 + tan²y = 1 + x²:</p><div class="eq">d/dx arctan x = 1/(1 + x²)</div><p>With a chain: <b>d/dx arctan(u) = u′/(1 + u²)</b>.</p>`),
Q(`d/dx arctan x = …`,[`1/(1 + x²)`,`1/√(1 − x²)`,`sec²x`,`−1/(1 + x²)`],0,`From 1 + tan² = sec².`),
W('calcDrill',{skill:'invtrig',need:4},`Differentiate arctan. Get 4 right to master it.`,`u′/(1 + u²).`),
T(`<h3>Why care?</h3><p>Reading it backwards: <b>∫ 1/(1 + x²) dx = arctan x + C</b>. You'll need this for trig substitution and partial fractions in the next level.</p>`),
QE(`A balloon has dV/dt = 4πr² dr/dt. What is 4πr²?`,[`Its surface area`,`Its volume`,`Its radius`,`Its circumference`],0,`dV/dr is the surface area.`),
T(`<h3>Key points</h3><ul><li><b>d/dx arcsin x = 1/√(1 − x²)</b>.</li><li><b>d/dx arctan x = 1/(1 + x²)</b>.</li><li>So ∫ 1/(1 + x²) dx = arctan x + C.</li></ul>`)]),
LH('c7-3-3','Linear approximation and Newton\'s method',11,'Zoom in on any smooth curve and it looks like its tangent. That one idea estimates square roots and solves equations.',[
RM(`<p>The tangent at x = a: y = f(a) + f′(a)(x − a). Close to a, the tangent hugs the curve.</p>`),
T(`<h3>Linear approximation</h3><p>Near a, the curve is almost its tangent:</p><div class="eq">f(a + h) ≈ f(a) + f′(a) × h</div>${KY([['a','a point where you know f and f′',''],['h','a small step away from a',''],['f′(a) × h','the change predicted by the tangent','']])}`),
W('stepCalc',{steps:[`Estimate √4.1`,`f(x) = √x, a = 4, h = 0.1`,`f(4) = 2, f′(x) = 1/(2√x), so f′(4) = 1/4`,`√4.1 ≈ 2 + 0.25 × 0.1 = <b>2.025</b>`,`True value: 2.02485…, very close.`]},`Linear approximation.`,`The smaller h is, the better the estimate.`),
W('calcDrill',{skill:'linapprox',need:3},`Estimate square roots. Get 3 right to master it.`,`n + h/(2n).`),
T(`<h3>Newton's method</h3><p>To solve f(x) = 0, start at a guess x₀. Follow the tangent down to where it crosses the x-axis. That's a better guess. Repeat:</p><div class="eq">x<sub>n+1</sub> = x<sub>n</sub> − f(x<sub>n</sub>) ÷ f′(x<sub>n</sub>)</div>`),
W('stepCalc',{steps:[`Solve x² − 2 = 0 (so x = √2). f′(x) = 2x. Start x₀ = 1.`,`x₁ = 1 − (1 − 2)/2 = 1.5`,`x₂ = 1.5 − (2.25 − 2)/3 = 1.41667`,`x₃ = 1.41667 − (0.00694)/2.83333 = 1.414216`,`√2 = 1.414214…: correct to 5 decimal places after 3 steps.`]},`Newton's method finds √2.`,`The number of correct digits roughly doubles each step.`),
Q(`Newton's method uses which line at each step?`,[`The tangent at the current guess`,`The chord between two guesses`,`The x-axis`,`A horizontal line`],0,`Tangent down to the axis.`),
T(`<h3>Key points</h3><ul><li><b>f(a + h) ≈ f(a) + f′(a)h</b> for small h.</li><li><b>Newton</b>: x<sub>n+1</sub> = x<sub>n</sub> − f(x<sub>n</sub>)/f′(x<sub>n</sub>).</li><li>You've now covered all of university Calculus 1.</li></ul>`)])
]});

F('c7-1-1',[GN('implicit'),GN('implicit'),Q(`d/dx (y²) = …`,[`2y dy/dx`,`2y`,`2x`,`y dy/dx`],0,`Chain rule.`),Q(`On x² + y² = r², dy/dx = …`,[`−x/y`,`x/y`,`−y/x`,`2x`],0,`From 2x + 2y y′ = 0.`),Q(`Implicit differentiation is needed when…`,[`y isn't written on its own`,`there are no x terms`,`the function is a straight line`,`never`],0,`Equations, not formulas.`)]);
F('c7-1-2',[GN('implicit2'),GN('implicit2'),Q(`d/dx (xy) = …`,[`y + x dy/dx`,`dy/dx`,`x + y dy/dx`,`xy`],0,`Product rule.`),Q(`d/dx (3y) = …`,[`3 dy/dx`,`3`,`3y dy/dx`,`0`],0,`Constant times y′.`),Q(`After differentiating, you collect…`,[`all the dy/dx terms on one side`,`all the x terms on one side`,`nothing`,`the constants`],0,`Then factorise.`)]);
F('c7-1-3',[Q(`d/dx xˣ = …`,[`xˣ(ln x + 1)`,`x × xˣ⁻¹`,`xˣ ln x`,`ln x + 1`],0,`Logarithmic differentiation.`),Q(`ln(aᵇ) = …`,[`b ln a`,`a ln b`,`ln a + ln b`,`ln a × ln b`],0,`Log law.`),Q(`From eʸ = x, dy/dx = …`,[`1/x`,`eˣ`,`x`,`ln x`],0,`1/eʸ.`),N(`y = xˣ. dy/dx at x = e? (Use ln e = 1. 2 d.p.)`,30.31,0.005,'',`eᵉ × 2 ≈ 15.154 × 2.`),Q(`Logarithmic differentiation is useful for…`,[`variable powers and messy products`,`straight lines`,`constants`,`integrals only`],0,`Logs simplify them.`)]);
F('c7-2-1',[GN('relcirc'),GN('relcirc'),Q(`Related rates come from differentiating with respect to…`,[`time t`,`x`,`r`,`nothing`],0,`Rates over time.`),Q(`A = πr². dA/dt = …`,[`2πr dr/dt`,`2πr`,`πr² dr/dt`,`2π dr/dt`],0,`Chain rule.`),Q(`r grows steadily. A grows…`,[`faster and faster`,`steadily`,`slower and slower`,`not at all`],0,`2πr increases.`)]);
F('c7-2-2',[GN('ladder'),GN('ladder'),Q(`The last step in a related rates problem is…`,[`substitute the numbers`,`draw a picture`,`find an equation`,`differentiate`],0,`Numbers last.`),Q(`A negative dy/dt means y is…`,[`decreasing`,`increasing`,`zero`,`negative`],0,`Falling.`),Q(`x² + y² = 25 differentiated with respect to t gives…`,[`2x dx/dt + 2y dy/dt = 0`,`2x + 2y = 0`,`x dx/dt = y dy/dt`,`2x dy/dt = 0`],0,`Implicit in t.`)]);
F('c7-2-3',[Q(`V = (4/3)πr³. dV/dt = …`,[`4πr² dr/dt`,`4πr²`,`(4/3)πr² dr/dt`,`πr³ dr/dt`],0,`Chain rule.`),N(`Air in at 50 cm³/s. dr/dt when r = 5 cm? (3 d.p.)`,0.159,0.005,'cm/s',`50 ÷ (100π).`),Q(`For a cone with r = h, V = …`,[`(1/3)πh³`,`πh³`,`(1/3)πh²`,`πh²`],0,`Substitute r = h.`),Q(`As a balloon grows (steady air flow), dr/dt…`,[`gets smaller`,`gets bigger`,`stays the same`,`becomes negative`],0,`Bigger surface.`),N(`Cone r = h, water in at 2π m³/min. dh/dt at h = 1 m?`,2,0.001,'m/min',`2π = π(1)² dh/dt.`)]);
F('c7-3-1',[GN('dinv'),GN('dinv'),Q(`(f⁻¹)′(b) = …`,[`1/f′(a) where f(a) = b`,`f′(b)`,`−f′(a)`,`1/f(b)`],0,`Reciprocal.`),Q(`f(2) = 5, f′(2) = 4. (f⁻¹)′(5) = …`,[`1/4`,`4`,`1/5`,`2`],0,`1/f′(2).`),Q(`The graph of f⁻¹ is f reflected in…`,[`y = x`,`the x-axis`,`the y-axis`,`y = −x`],0,`Swap x and y.`)]);
F('c7-3-2',[GN('invtrig'),GN('invtrig'),Q(`d/dx arcsin x = …`,[`1/√(1 − x²)`,`1/(1 + x²)`,`cos x`,`−1/√(1 − x²)`],0,`Derived implicitly.`),Q(`∫ 1/(1 + x²) dx = …`,[`arctan x + C`,`ln(1 + x²) + C`,`arcsin x + C`,`1/x + C`],0,`Reverse.`),N(`d/dx arctan x at x = 1?`,0.5,0.001,'',`1/(1 + 1).`)]);
F('c7-3-3',[GN('linapprox'),GN('linapprox'),Q(`Newton's method: x<sub>n+1</sub> = …`,[`x<sub>n</sub> − f(x<sub>n</sub>)/f′(x<sub>n</sub>)`,`x<sub>n</sub> + f′(x<sub>n</sub>)`,`f(x<sub>n</sub>)/f′(x<sub>n</sub>)`,`x<sub>n</sub> − f′(x<sub>n</sub>)/f(x<sub>n</sub>)`],0,`Follow the tangent.`),N(`One Newton step for x² − 9 = 0 from x₀ = 4?`,3.125,0.001,'',`4 − 7/8.`),Q(`Linear approximation works best when h is…`,[`small`,`large`,`negative`,`exactly 1`],0,`Tangent hugs the curve nearby.`)]);
GOALS.calc7={icon:'🧭',title:'Finish university Calculus 1',story:'Each unit adds the last differentiation tools: equations that aren\'t y = …, rates linked through time, and inverses and approximations.',final:'Calculus 1 complete',steps:['Implicit differentiation','Related rates','Inverses and approximation']};
