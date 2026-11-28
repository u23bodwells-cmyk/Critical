/* ========== CALCULUS · LEVEL 1 · Ready for calculus ========== */
U({id:'c1-1',track:'calc',level:1,title:'Functions and graphs',icon:'f(x)',color:'#7F77DD',desc:'What a function is, the f(x) notation, substituting numbers in, and the shapes of the graphs calculus works with.',lessons:[
LH('c1-1-1','What is a function?',7,'A function is a machine: a number goes in, a number comes out. Meet the f(x) notation.',[
T(`<h3>A number machine</h3><p>A <b>function</b> is a rule that turns one number into another. Think of it as a machine:</p><div class="eq">input → rule → output</div><p>For example, the rule "double it, then add 3". Put in 4 and you get 11. Put in 10 and you get 23.</p><p>Calculus is all about functions, so we start right here.</p>`),
Q(`The rule is "double it, then add 3". What comes out if you put in 5?`,[`13`,`10`,`16`,`8`],0,`5 doubled is 10, then add 3: 13.`),
T(`<h3>Writing it with letters</h3><p>Instead of words, we use <b>x</b> for whatever number goes in. "Double it, then add 3" becomes:</p><div class="eq">f(x) = 2x + 3</div>${KY([['f','the name of the function',''],['x','the input number',''],['f(x)','the output: "f of x"','']],'f(x) does NOT mean f times x. It means "the output of f when the input is x".')}`),
T(`<h3>Putting a number in</h3><p>To find <b>f(4)</b>, replace every x with 4:</p><div class="eq">f(4) = 2 × 4 + 3 = 11</div><p>This is called <b>substituting</b>. It's the most common thing you'll do in calculus.</p>`),
Q(`f(x) = 2x + 3. What does f(4) mean?`,[`The output when the input is 4`,'The value of f, multiplied by 4','The input you need to get 4 out','The fourth function in the list'],0,`f(4) is "f of 4": put 4 in, see what comes out.`),
N(`f(x) = 3x − 1. Find f(5).`,14,0.001,'',`3 × 5 − 1 = 15 − 1 = 14.`),
T(`<h3>Negative inputs</h3><p>Negative numbers go in exactly the same way. Keep the minus sign with the number.</p><div class="eq">f(x) = 2x + 3,&nbsp;&nbsp; f(−4) = 2 × (−4) + 3 = −8 + 3 = −5</div><p>Putting negatives in brackets stops mistakes.</p>`),
N(`f(x) = 4x + 2. Find f(−3).`,-10,0.001,'',`4 × (−3) + 2 = −12 + 2 = −10.`),
W('calcDrill',{skill:'flin',need:4},`Practise substituting. Get 4 right to master it.`,`Every time: replace x with the number, then work it out.`),
T(`<h3>Key points</h3><ul><li>A <b>function</b> turns an input into an output.</li><li><b>f(x)</b> means "the output of f when the input is x".</li><li>To find f(4), <b>substitute</b>: replace every x with 4.</li><li>Put negative numbers in <b>brackets</b>.</li></ul>`)]),
LH('c1-1-2','Squares and order of operations',8,'Substituting into functions with x², including negative numbers, without tripping up.',[
RM(`<p>A function turns an input into an output. To find <b>f(3)</b>, replace every x with 3. Put negatives in brackets.</p>`),
T(`<h3>Functions with x²</h3><p>Calculus uses lots of functions with powers, like:</p><div class="eq">f(x) = x² + 1</div><p>x² means x × x. So f(3) = 3 × 3 + 1 = 10.</p>`),
N(`f(x) = x² + 1. Find f(4).`,17,0.001,'',`4² = 16, plus 1 is 17.`),
T(`<h3>The order matters</h3><p>Always do things in this order: <b>brackets</b>, then <b>powers</b>, then <b>multiply and divide</b>, then <b>add and subtract</b>.</p><p>So 3x² with x = 2 means: square first (2² = 4), <i>then</i> times 3 = 12. It isn't (3 × 2)² = 36.</p>`),
Q(`f(x) = 3x². What is f(2)?`,[`12`,`36`,`6`,`18`],0,`Square first: 2² = 4. Then × 3 = 12.`),
T(`<h3>The big trap: squaring negatives</h3><p>A negative number squared is <b>positive</b>, because minus times minus is plus:</p><div class="eq">(−3)² = (−3) × (−3) = 9</div><p>That's why the brackets matter. On a calculator, type (−3)² with the brackets, or you may get −9.</p>`),
Q(`What is (−5)²?`,[`25`,`−25`,`−10`,`10`],0,`(−5) × (−5) = +25.`),
N(`f(x) = x² − 2x. Find f(−3).`,15,0.001,'',`(−3)² − 2 × (−3) = 9 + 6 = 15.`),
W('stepCalc',{steps:[`f(x) = 2x² − 3x + 1. We want f(−2).`,`Replace every x with (−2): 2(−2)² − 3(−2) + 1`,`Powers first: (−2)² = 4, so 2 × 4 = 8`,`Next term: −3 × (−2) = +6`,`Add them up: 8 + 6 + 1 = <b>15</b>`]},`Work through this example one step at a time.`,`Brackets, powers, then multiply, then add.`),
W('calcDrill',{skill:'fsub',need:5},`Your turn. Get 5 right to master it.`,`You can substitute into any function with x² now.`),
T(`<h3>Key points</h3><ul><li>Order: <b>brackets, powers, multiply/divide, add/subtract</b>.</li><li>A negative squared is <b>positive</b>: (−3)² = 9.</li><li>Use brackets when you substitute negatives.</li></ul>`)]),
LH('c1-1-3','Graphs of functions',8,'Every function has a graph. Meet the shapes calculus works with most.',[
RM(`<p>f(x) is the output when the input is x. To find it, substitute. Negatives in brackets, and powers before multiplying.</p>`),
T(`<h3>Turning a function into a picture</h3><p>Work out f(x) for lots of inputs and plot each pair as a point (x, f(x)). Join them up and you get the <b>graph</b> of the function.</p><p>We usually call the output <b>y</b>, so we write <b>y = f(x)</b>. Up the y-axis is the output.</p>`),
Q(`On the graph of y = f(x), which axis shows the output?`,[`The y-axis (up)`,`The x-axis (across)`,`Neither`,`Both`],0,`x goes across (input); y goes up (output).`),
W('fnPlot',{x:[-3,3],y:[-8,8],xl:'x',yl:'y',sl:[['k','Function',1,5,1,2,function(v){return ['','y = x','y = x²','y = x³','y = 1/x','y = √x'][v]}]],curves:function(p){var F=[null,function(x){return x},function(x){return x*x},function(x){return x*x*x},function(x){return Math.abs(x)<0.03?NaN:1/x},function(x){return Math.sqrt(x)}];return [[F[p.k],'--accent',3]]},read:function(p){return ['','<b>y = x</b>: a straight line through the origin. Same steepness everywhere.','<b>y = x²</b>: a U-shape called a parabola. Steep at the sides, flat at the bottom.','<b>y = x³</b>: an S-shape. Flat in the middle, very steep further out.','<b>y = 1/x</b>: two separate curves. It never touches either axis.','<b>y = √x</b>: only exists for x ≥ 0. Steep at first, then flattens.'][p.k]},goal:function(p){return p.k===5},goalMsg:'Look at all five shapes. Finish on y = √x.'},`Slide through the five shapes. Notice which are straight and which curve.`,`Only y = x is straight. The rest curve, so their steepness keeps changing. Calculus measures that changing steepness.`),
T(`<h3>Steepness changes on a curve</h3><p>On a straight line, the steepness is the same everywhere. On a curve like y = x², it's flat at the bottom and gets steeper and steeper as you move out.</p><p>The whole of calculus starts from one question: <b>how steep is a curve at one exact point?</b> You'll answer it in Level 2.</p>`),
Q(`Which of these graphs has the same steepness everywhere?`,[`y = x`,`y = x²`,`y = x³`,`y = √x`],0,`Only a straight line has a constant steepness.`),
Q(`Which shape is y = x²?`,[`A U-shape (parabola)`,`A straight line`,`An S-shape`,`Two separate curves`],0,`A parabola, flat at the bottom.`),
QE(`f(x) = x² + 3. What is f(−2)?`,[`7`,`−1`,`1`,`−7`],0,`(−2)² + 3 = 4 + 3 = 7.`),
T(`<h3>Key points</h3><ul><li>A graph plots every (x, y) pair, with <b>y = f(x)</b>.</li><li>Key shapes: line (y = x), parabola (y = x²), S-curve (y = x³), y = 1/x and y = √x.</li><li>Curves change steepness. Measuring that is what calculus does.</li></ul>`)])
]});

U({id:'c1-2',track:'calc',level:1,title:'Powers and indices',icon:'xⁿ',color:'#1D9E75',desc:'The index laws, zero and negative powers, and fractional powers: the language every calculus rule is written in.',lessons:[
LH('c1-2-1','The three index laws',8,'Multiplying, dividing and raising powers: three rules you\'ll use in every calculus question.',[
RM(`<p>x² means x × x. x³ means x × x × x. The small number is the <b>power</b> (also called the <b>index</b>).</p>`),
T(`<h3>Why powers matter so much</h3><p>Nearly every calculus rule is a rule about <b>powers of x</b>. If powers feel easy, calculus feels easy. So we'll go slowly and practise a lot.</p>${KY([['x','the base',''],['5','the power or index: how many x\'s multiply together','x⁵ = x×x×x×x×x']])}`),
T(`<h3>Law 1: multiplying means add the powers</h3><div class="eq">x³ × x⁴ = x⁷</div><p>Why? x³ is three x's, x⁴ is four x's. Multiply them and you have seven x's in a row. So you <b>add</b> the powers: 3 + 4 = 7.</p>`),
Q(`Simplify x² × x⁵.`,[`x⁷`,`x¹⁰`,`x³`,`2x⁷`],0,`Add the powers: 2 + 5 = 7.`),
T(`<h3>Law 2: dividing means subtract the powers</h3><div class="eq">x⁷ ÷ x³ = x⁴</div><p>Seven x's on top, three on the bottom. Three pairs cancel, leaving four. So you <b>subtract</b>: 7 − 3 = 4.</p>`),
Q(`Simplify x⁹ ÷ x².`,[`x⁷`,`x¹¹`,`x⁴·⁵`,`x¹⁸`],0,`Subtract: 9 − 2 = 7.`),
T(`<h3>Law 3: a power of a power means multiply</h3><div class="eq">(x³)² = x⁶</div><p>(x³)² is x³ × x³, which is x³⁺³ = x⁶. So you <b>multiply</b> the powers: 3 × 2 = 6.</p>`),
Q(`Simplify (x⁴)³.`,[`x¹²`,`x⁷`,`x⁶⁴`,`x¹`],0,`Multiply: 4 × 3 = 12.`),
W('flipCards',{cards:[[`x<sup>a</sup> × x<sup>b</sup>`,`x<sup>a+b</sup>: multiplying, so ADD the powers`],[`x<sup>a</sup> ÷ x<sup>b</sup>`,`x<sup>a−b</sup>: dividing, so SUBTRACT the powers`],[`(x<sup>a</sup>)<sup>b</sup>`,`x<sup>ab</sup>: power of a power, so MULTIPLY the powers`]]},`Flip each card and say the rule out loud.`,`Add, subtract, multiply. Say them until they're automatic.`),
W('calcDrill',{skill:'idxlaw',need:6},`Mixed practice of all three laws. Get 6 right to master it.`,`You know the three index laws.`),
T(`<h3>Key points</h3><ul><li>Multiply: <b>add</b> the powers. x³ × x⁴ = x⁷</li><li>Divide: <b>subtract</b> the powers. x⁷ ÷ x³ = x⁴</li><li>Power of a power: <b>multiply</b> the powers. (x³)² = x⁶</li></ul>`)]),
LH('c1-2-2','Zero and negative powers',9,'What x⁰ and x⁻² mean, and how to write 1/x³ as a power. Essential for calculus.',[
RM(`<p>Dividing means <b>subtract</b> the powers: x⁷ ÷ x³ = x⁴.</p>`),
T(`<h3>Power zero</h3><p>What is x³ ÷ x³? Anything divided by itself is 1. But the subtract rule says x³⁻³ = x⁰. So:</p><div class="eq">x⁰ = 1</div><p>Any number (except 0) to the power 0 is 1. 5⁰ = 1, 100⁰ = 1.</p>`),
Q(`What is 7⁰?`,[`1`,`0`,`7`,`70`],0,`Anything (except 0) to the power 0 is 1.`),
T(`<h3>Negative powers</h3><p>Now try x² ÷ x⁵. Subtracting gives x⁻³. But cancelling gives 1 over three x's: 1/x³. So:</p><div class="eq">x⁻³ = 1/x³</div><p>A <b>negative power</b> means "1 over". It does NOT make the answer negative.</p>${KY([['x⁻ⁿ','1 over x to the power n','']],'2⁻¹ = 1/2 = 0.5, not −2.')}`),
Q(`What is 2⁻¹?`,[`0.5`,`−2`,`−0.5`,`2`],0,`2⁻¹ = 1/2 = 0.5.`),
T(`<h3>Going the other way</h3><p>In calculus you'll often need to <b>rewrite a fraction as a power</b> before you can do anything with it:</p><div class="eq">1/x² = x⁻²&nbsp;&nbsp;&nbsp;&nbsp;5/x³ = 5x⁻³</div><p>The number on top stays where it is. The x moves up, and its power becomes negative.</p>`),
Q(`Write 4/x² as a power of x.`,[`4x⁻²`,`4x²`,`x⁻⁸`,`−4x²`],0,`The 4 stays; 1/x² becomes x⁻².`),
W('calcDrill',{skill:'idxneg',need:5},`Rewrite each one as a power of x. Get 5 right to master it.`,`This rewriting step comes up again and again in Levels 2 and 4.`),
W('calcDrill',{skill:'idxval',need:4},`Now work out some values. Get 4 right to master it.`,`Negative powers mean 1 over; power 0 means 1.`),
T(`<h3>Key points</h3><ul><li><b>x⁰ = 1</b></li><li><b>x⁻ⁿ = 1/xⁿ</b>: a negative power means "1 over", not a negative number.</li><li>Rewrite fractions as powers: 5/x³ = 5x⁻³.</li></ul>`)]),
LH('c1-2-3','Fractional powers',9,'Square roots are powers too: √x = x^0.5. The last piece of the powers puzzle.',[
RM(`<p>Multiplying means add the powers. x⁻ⁿ = 1/xⁿ. And x⁰ = 1.</p>`),
T(`<h3>What power is a square root?</h3><p>√x × √x = x. Using the add rule, if √x = x<sup>a</sup>, then a + a = 1, so a = ½.</p><div class="eq">√x = x<sup>½</sup> = x<sup>0.5</sup></div><p>In this course we'll write it as a decimal, <b>0.5</b>, because that's easier to type.</p>`),
Q(`What is √x as a power of x?`,[`x<sup>0.5</sup>`,`x²`,`x<sup>−2</sup>`,`x<sup>−0.5</sup>`],0,`√x = x^0.5.`),
T(`<h3>Combining with the rules</h3><p>All the laws still work:</p><ul><li>x√x = x¹ × x⁰·⁵ = <b>x¹·⁵</b> (add)</li><li>1/√x = <b>x⁻⁰·⁵</b> (1 over makes it negative)</li><li>x²√x = <b>x²·⁵</b></li></ul>`),
Q(`Write x√x as a single power of x.`,[`x<sup>1.5</sup>`,`x<sup>0.5</sup>`,`x<sup>2</sup>`,`x<sup>−1.5</sup>`],0,`x¹ × x⁰·⁵: add the powers to get 1.5.`),
T(`<h3>Working out values</h3><p>To work out something like 4<sup>1.5</sup>: do the square root first, then the whole-number power.</p><div class="eq">4<sup>1.5</sup> = (√4)³ = 2³ = 8</div>`),
N(`Work out 9<sup>1.5</sup>.`,27,0.001,'',`√9 = 3, and 3³ = 27.`),
W('calcDrill',{skill:'idxfrac',need:5},`Write each as a power of x. Get 5 right to master it.`,`Roots are just powers of 0.5.`),
W('calcDrill',{skill:['idxlaw','idxneg','idxfrac','idxval'],need:8},`The big powers review: every type mixed together. Get 8 right to master it.`,`You've mastered powers. Every calculus rule is built on this.`),
T(`<h3>Key points</h3><ul><li><b>√x = x⁰·⁵</b>, and 1/√x = x⁻⁰·⁵.</li><li>All three laws still work with decimal powers.</li><li>For values like 4<sup>1.5</sup>: root first, then power.</li></ul>`)])
]});

U({id:'c1-3',track:'calc',level:1,title:'Gradient of a straight line',icon:'m',color:'#378ADD',desc:'Rise over run, y = mx + c, and what a gradient means as a rate. The idea calculus extends to curves.',lessons:[
LH('c1-3-1','Rise over run',8,'How to measure the steepness of a straight line with a single number.',[
T(`<h3>Measuring steepness</h3><p>The <b>gradient</b> of a line is how much it goes up for every 1 you go across.</p><div class="eq">gradient = change in y ÷ change in x</div>${KY([['change in y','how far up (the "rise")',''],['change in x','how far across (the "run")','']],'Often remembered as "rise over run".')}`),
T(`<h3>An example</h3><p>A line goes through (1, 2) and (4, 11).</p><ul><li>Change in y: 11 − 2 = 9</li><li>Change in x: 4 − 1 = 3</li><li>Gradient: 9 ÷ 3 = <b>3</b></li></ul><p>For every 1 across, the line goes up 3.</p>`),
N(`Find the gradient of the line through (2, 5) and (6, 13).`,2,0.001,'',`(13 − 5) ÷ (6 − 2) = 8 ÷ 4 = 2.`),
T(`<h3>What the sign tells you</h3><ul><li><b>Positive</b> gradient: the line goes <b>up</b> from left to right.</li><li><b>Negative</b> gradient: it goes <b>down</b>.</li><li><b>Zero</b> gradient: it's flat (horizontal).</li></ul><p>Bigger numbers mean steeper lines.</p>`),
Q(`A line has gradient −4. What does it look like?`,[`Steep, going down from left to right`,'Gentle, going up from left to right','Steep, going up from left to right','Gentle, going down from left to right'],0,`Negative means down; 4 is fairly steep.`),
N(`Find the gradient of the line through (0, 10) and (5, 0).`,-2,0.001,'',`(0 − 10) ÷ (5 − 0) = −10 ÷ 5 = −2.`),
W('calcDrill',{skill:'gradpts',need:5},`Find the gradient each time. Get 5 right to master it.`,`Change in y ÷ change in x, keeping the points in the same order.`),
T(`<h3>Key points</h3><ul><li><b>Gradient = change in y ÷ change in x</b>.</li><li>Positive goes up, negative goes down, zero is flat.</li><li>Keep the two points in the same order on top and bottom.</li></ul>`)]),
LH('c1-3-2','y = mx + c',8,'Read the gradient straight from the equation of a line.',[
RM(`<p>Gradient = change in y ÷ change in x. Positive slopes up, negative slopes down.</p>`),
T(`<h3>The equation of a straight line</h3><div class="eq">y = mx + c</div>${KY([['m','the gradient',''],['c','the y-intercept: where it crosses the y-axis','']])}<p>So y = 3x + 2 has gradient 3 and crosses the y-axis at 2.</p>`),
Q(`What is the gradient of y = 5x − 7?`,[`5`,`−7`,`7`,`−5`],0,`The number in front of x is the gradient.`),
T(`<h3>Watch out for the order</h3><p>y = 8 − 2x is still a straight line. The gradient is the number multiplying x, including its sign: <b>−2</b>.</p>`),
Q(`What is the gradient of y = 8 − 2x?`,[`−2`,`8`,`2`,`−8`],0,`It's the coefficient of x: −2.`),
T(`<h3>Make y the subject first</h3><p>If the equation is 2y = 6x + 4, divide everything by 2 first: y = 3x + 2. Now the gradient is clearly <b>3</b>.</p>`),
W('calcDrill',{skill:'gradeq',need:5},`Read off the gradient. Get 5 right to master it.`,`Get y on its own, then read the number in front of x.`),
QE(`Write 6/x² as a power of x.`,[`6x⁻²`,`6x²`,`x⁻¹²`,`−6x²`],0,`The 6 stays; 1/x² = x⁻².`),
T(`<h3>Key points</h3><ul><li><b>y = mx + c</b>: m is the gradient, c is the y-intercept.</li><li>The gradient is the number multiplying x, sign included.</li><li>Make y the subject before you read it.</li></ul>`)]),
LH('c1-3-3','Gradient as a rate',8,'Why a gradient is really a rate of change, with units. The key idea behind calculus.',[
RM(`<p>Gradient = change in y ÷ change in x. In y = mx + c, m is the gradient.</p>`),
T(`<h3>Gradients have units</h3><p>If a graph shows distance (m) against time (s), its gradient is metres ÷ seconds: <b>metres per second</b>. That's speed!</p><p>A gradient is always "how much y changes for each unit of x". That's a <b>rate of change</b>.</p>`),
Q(`A graph shows temperature (°C) against time (minutes). What are the units of its gradient?`,[`°C per minute`,`minutes per °C`,`°C`,`minutes`],0,`Units of y ÷ units of x.`),
T(`<h3>Rates in the plant</h3><p>Operators watch rates all the time:</p><ul><li>Heat-up rate: <b>°C per hour</b></li><li>Pressure change: <b>bar per minute</b></li><li>Power rise: <b>% per minute</b></li></ul><p>Each one is a gradient of a graph.</p>`),
N(`A tank's level rises steadily from 20% to 50% in 10 minutes. What's the rate, in % per minute?`,3,0.001,'%/min',`(50 − 20) ÷ 10 = 3% per minute.`),
N(`The coolant cools steadily from 290 °C to 270 °C in 4 hours. What's the gradient, in °C per hour?`,-5,0.001,'°C/h',`(270 − 290) ÷ 4 = −20 ÷ 4 = −5 °C per hour. Negative: falling.`),
T(`<h3>The problem with curves</h3><p>On a straight line, the rate is the same everywhere. But real things rarely change at a steady rate. A car speeds up; a reactor's power rises faster and faster.</p><p>On a curve, the rate keeps changing. Calculus is the tool for finding the rate at <b>one exact moment</b>.</p>`),
Q(`Why do we need calculus for curves but not for straight lines?`,[`A curve's rate of change is different at every point`,'Curves have no gradient, so we have to invent one','Straight lines have no rate of change to measure','Calculus only works when the numbers are decimals'],0,`A straight line has one gradient; a curve has a different one at every point.`),
T(`<h3>Key points</h3><ul><li>A gradient is a <b>rate of change</b>, with units of y per unit of x.</li><li>Distance–time gradient = speed.</li><li>Curves change rate from point to point. Calculus finds the rate at a single point.</li></ul>`)])
]});

U({id:'c1-4',track:'calc',level:1,title:'Rates of change on curves',icon:'Δy',color:'#D85A30',desc:'Average rates of change, chords, average speed, and the question that leads straight into calculus.',lessons:[
LH('c1-4-1','Average rate of change',8,'How to measure the rate of change between two points on a curve.',[
RM(`<p>A gradient is a rate of change: change in y ÷ change in x. On a curve, the rate is different at every point.</p>`),
T(`<h3>Joining two points on a curve</h3><p>Pick two points on a curve and join them with a straight line. That line is called a <b>chord</b>.</p><p>The gradient of the chord is the <b>average rate of change</b> between the two points.</p><div class="eq">average rate = (f(b) − f(a)) ÷ (b − a)</div>`),
Q(`What is a chord?`,[`A straight line joining two points on a curve`,'A straight line touching a curve at just one point','The line through the origin at right angles','The curved part of the graph between two points'],0,`A chord cuts across between two points.`),
W('stepCalc',{steps:[`f(x) = x². Find the average rate of change from x = 1 to x = 3.`,`f(3) = 3² = 9 and f(1) = 1² = 1`,`Change in y: 9 − 1 = 8`,`Change in x: 3 − 1 = 2`,`Average rate: 8 ÷ 2 = <b>4</b>`]},`Follow this example step by step.`,`The chord from x = 1 to x = 3 on y = x² has gradient 4.`),
N(`f(x) = x². Find the average rate of change from x = 2 to x = 5.`,7,0.001,'',`(25 − 4) ÷ (5 − 2) = 21 ÷ 3 = 7.`),
W('calcDrill',{skill:'avgrate',need:5},`Find each average rate of change. Get 5 right to master it.`,`Work out both outputs, then change in y ÷ change in x.`),
T(`<h3>Key points</h3><ul><li>A <b>chord</b> joins two points on a curve.</li><li>Its gradient is the <b>average rate of change</b>: (f(b) − f(a)) ÷ (b − a).</li></ul>`)]),
LH('c1-4-2','Average speed',7,'Distance–time graphs that curve, and what average speed really measures.',[
RM(`<p>The gradient of a chord gives the <b>average rate of change</b> between two points.</p>`),
T(`<h3>Speeding up</h3><p>A ball rolling down a slope speeds up. Its distance might follow <b>s = 2t²</b>: after 1 s it's gone 2 m, after 2 s 8 m, after 3 s 18 m.</p><p>The distance–time graph curves upwards, getting steeper as it goes faster.</p>`),
N(`s = 2t². How far has the ball gone after 4 seconds?`,32,0.001,'m',`2 × 4² = 2 × 16 = 32 m.`),
T(`<h3>Average speed is a chord gradient</h3><p>Average speed between two times = change in distance ÷ change in time. That's the gradient of the chord.</p><div class="eq">from t = 1 to t = 3: (18 − 2) ÷ 2 = 8 m/s</div>`),
W('calcDrill',{skill:'speed',need:4},`Find each average speed. Get 4 right to master it.`,`Change in distance ÷ change in time.`),
Q(`The ball's average speed from t = 1 to t = 3 is 8 m/s. Was it going exactly 8 m/s at t = 2?`,[`Not necessarily: average speed hides how the speed changes`,'Yes: average speed is the speed at the middle time','No: the speed must have been zero exactly halfway','Yes, but only because the ball moves in a straight line'],0,`The average smooths over the changes. To get the exact speed at t = 2 we need calculus.`),
T(`<h3>Key points</h3><ul><li>On a distance–time graph, a chord's gradient is the <b>average speed</b>.</li><li>Average speed doesn't tell you the exact speed at an instant.</li></ul>`)]),
LH('c1-4-3','Getting closer: the big idea',9,'Shrink the chord, and its gradient homes in on the exact rate at a point. This is calculus.',[
RM(`<p>A chord's gradient is the average rate of change between two points. On y = x², from x = 1 to x = 3 it's 4.</p>`),
T(`<h3>Make the chord shorter</h3><p>To find how steep y = x² is <b>exactly at x = 3</b>, take chords that start at x = 3 and end closer and closer to it.</p>`),
W('fnPlot',{x:[0,5],y:[0,25],xl:'x',yl:'y',sl:[['h','Chord width h',0.01,2,0.01,2,function(v){return v.toFixed(2)}]],curves:function(p){var g=6+p.h;return [[function(x){return x*x},'--accent',3],[function(x){return 9+g*(x-3)},'--coral',2,[6,4]]]},read:function(p){return 'Chord from x = 3 to x = '+(3+p.h).toFixed(2)+': gradient = <b>'+(6+p.h).toFixed(2)+'</b>'},goal:function(p){return p.h<=0.05},goalMsg:'Shrink the chord until h is 0.05 or less.'},`Drag h down towards 0 and watch the chord's gradient.`,`As h shrinks, the gradient gets closer and closer to 6. That's the exact gradient at x = 3.`),
T(`<h3>The pattern</h3><table><tr><th>Chord from 3 to…</th><th>Gradient</th></tr><tr><td>4</td><td>7</td></tr><tr><td>3.5</td><td>6.5</td></tr><tr><td>3.1</td><td>6.1</td></tr><tr><td>3.01</td><td>6.01</td></tr><tr><td>3.001</td><td>6.001</td></tr></table><p>The gradients are heading towards <b>6</b>. We say the gradient at x = 3 is <b>6</b>.</p>`),
W('calcDrill',{skill:'chord',need:5},`Work out each chord gradient. Get 5 right to master it.`,`Notice they're always 2 × (start) + h. As h → 0, that becomes 2 × start.`),
Q(`What happens to the chord's gradient as the chord gets shorter?`,[`It gets closer and closer to the exact gradient at the point`,'It gets bigger and bigger until it reaches infinity','It shrinks towards zero as the two points come together','It stays the same as the gradient of the first chord'],0,`That "closer and closer" idea is called a limit.`),
T(`<h3>The tangent</h3><p>When the chord shrinks to nothing, it becomes a line that just <b>touches</b> the curve at that one point. That line is called the <b>tangent</b>.</p><p>The gradient of the curve at a point = the gradient of the tangent there. Finding it is called <b>differentiation</b>, and it's the whole of Level 2.</p>`),
QE(`What is the gradient of the line through (1, 4) and (3, 10)?`,[`3`,`6`,`2`,`7`],0,`(10 − 4) ÷ (3 − 1) = 3.`),
T(`<h3>Key points</h3><ul><li>Shrinking a chord makes its gradient approach the <b>exact gradient at a point</b>.</li><li>The line that just touches a curve is the <b>tangent</b>.</li><li>Finding a curve's gradient at a point is <b>differentiation</b>. You're ready for Level 2.</li></ul>`)])
]});

/* follow-ups */
F('c1-1-1',[GN('flin'),GN('flin'),Q(`What does f(x) mean?`,[`The output of f when the input is x`,`f times x`,`f plus x`,`x times x`],0,`"f of x".`),GN('flin'),Q(`f(x) = 5x. What is f(0)?`,[`0`,`5`,`1`,`50`],0,`5 × 0 = 0.`)]);
F('c1-1-2',[GN('fsub'),GN('fsub'),Q(`What is (−4)²?`,[`16`,`−16`,`−8`,`8`],0,`Minus times minus is plus.`),GN('fsub'),Q(`f(x) = 2x². f(3) is…`,[`18`,`36`,`12`,`6`],0,`Square first: 9, then × 2.`)]);
F('c1-1-3',[Q(`What shape is y = x³?`,[`An S-shape`,`A U-shape`,`A straight line`,`Two separate curves`],0,`Flat in the middle, steep further out.`),Q(`For which values of x does y = √x exist (with real numbers)?`,[`x ≥ 0`,`All x`,`x < 0`,`Only x = 0`],0,`You can't square-root a negative number.`),Q(`Which graph never touches either axis?`,[`y = 1/x`,`y = x²`,`y = x`,`y = x³`],0,`1/x is never 0, and x can't be 0.`),Q(`On y = x², where is the curve flattest?`,[`At the bottom, x = 0`,`At x = 5`,`At x = −5`,`It's the same everywhere`],0,`The U is flat at the bottom.`),GN('fsub')]);
F('c1-2-1',[GN('idxlaw'),GN('idxlaw'),GN('idxlaw'),Q(`x³ × x³ = …`,[`x⁶`,`x⁹`,`2x³`,`x²⁷`],0,`Add the powers.`),Q(`(x²)⁵ = …`,[`x¹⁰`,`x⁷`,`x³²`,`x²⁵`],0,`Multiply the powers.`)]);
F('c1-2-2',[GN('idxneg'),GN('idxneg'),GN('idxval'),GN('idxval'),Q(`x⁻² means…`,[`1/x²`,`−x²`,`−2x`,`x/2`],0,`Negative power: 1 over.`)]);
F('c1-2-3',[GN('idxfrac'),GN('idxfrac'),GN('idxval'),Q(`√x = …`,[`x<sup>0.5</sup>`,`x²`,`x<sup>−0.5</sup>`,`2x`],0,`Square root = power 0.5.`),Q(`x × √x = …`,[`x<sup>1.5</sup>`,`x<sup>0.5</sup>`,`x²`,`x`],0,`1 + 0.5 = 1.5.`)]);
F('c1-3-1',[GN('gradpts'),GN('gradpts'),GN('gradpts'),Q(`A horizontal line has gradient…`,[`0`,`1`,`infinity`,`−1`],0,`No rise at all.`),Q(`Which is steeper: gradient 5 or gradient −7?`,[`−7`,`5`,`They're the same`,`Can't tell`],0,`Steepness is the size; −7 is steeper, going down.`)]);
F('c1-3-2',[GN('gradeq'),GN('gradeq'),GN('gradeq'),Q(`In y = mx + c, what is c?`,[`Where the line crosses the y-axis`,`The gradient`,`The x-intercept`,`A constant gradient`],0,`The y-intercept.`),Q(`What is the gradient of y = 4?`,[`0`,`4`,`1`,`It has none`],0,`A flat line: y = 0x + 4.`)]);
F('c1-3-3',[Q(`A distance–time graph's gradient is…`,[`speed`,`acceleration`,`distance`,`time`],0,`Metres per second.`),N(`Temperature falls steadily from 300 °C to 250 °C in 10 hours. Gradient in °C per hour?`,-5,0.001,'°C/h',`−50 ÷ 10.`),N(`Power rises steadily from 30% to 90% in 20 minutes. Rate in % per minute?`,3,0.001,'%/min',`60 ÷ 20.`),Q(`A gradient of −2 bar per minute means pressure is…`,[`falling by 2 bar each minute`,`rising by 2 bar each minute`,`steady at 2 bar`,`zero`],0,`Negative means falling.`),Q(`Why can't we use one gradient for a whole curve?`,[`Its steepness changes from point to point`,`Curves have no gradient`,`It's against the rules`,`We can`],0,`That's why calculus exists.`)]);
F('c1-4-1',[GN('avgrate'),GN('avgrate'),GN('avgrate'),Q(`The average rate of change between two points is the gradient of the…`,[`chord`,`tangent`,`y-axis`,`curve`],0,`The chord joins the two points.`),N(`f(x) = x². Average rate of change from x = 0 to x = 4?`,4,0.001,'',`(16 − 0) ÷ 4.`)]);
F('c1-4-2',[GN('speed'),GN('speed'),GN('speed'),Q(`On a distance–time graph that curves upwards, the object is…`,[`speeding up`,`slowing down`,`stopped`,`going backwards`],0,`Getting steeper means faster.`),Q(`Does average speed tell you the speed at one exact moment?`,[`No`,`Yes`,`Only at the start`,`Only at the end`],0,`That needs calculus.`)]);
F('c1-4-3',[GN('chord'),GN('chord'),Q(`As the chord gets shorter, its gradient approaches the…`,[`gradient of the tangent at that point`,`gradient of the y-axis`,`value of f(x)`,`average speed`],0,`The tangent's gradient.`),Q(`A line that just touches a curve at one point is a…`,[`tangent`,`chord`,`normal`,`asymptote`],0,`Tangent.`),Q(`Finding a curve's gradient at a point is called…`,[`differentiation`,`integration`,`substitution`,`factorising`],0,`Coming up in Level 2.`)]);

/* unit tests */
TT('c1-1',[x('c1-1-1',GN('flin')),x('c1-1-1',GN('flin')),x('c1-1-2',GN('fsub')),x('c1-1-2',GN('fsub')),x('c1-1-2',GN('fsub')),x('c1-1-2',Q(`(−6)² = …`,[`36`,`−36`,`−12`,`12`],0,`Positive.`)),x('c1-1-3',Q(`Which graph is a straight line?`,[`y = x`,`y = x²`,`y = 1/x`,`y = √x`],0,`Only y = x.`)),x('c1-1-3',Q(`The output of a function is plotted on the…`,[`y-axis`,`x-axis`,`z-axis`,`neither`],0,`y = f(x).`)),x('c1-1-1',Q(`f(x) = x + 10. f(−10) = …`,[`0`,`20`,`−20`,`10`],0,`−10 + 10.`)),x('c1-1-2',Q(`3x² with x = 4 equals…`,[`48`,`144`,`24`,`12`],0,`3 × 16.`))]);
TT('c1-2',[x('c1-2-1',GN('idxlaw')),x('c1-2-1',GN('idxlaw')),x('c1-2-1',GN('idxlaw')),x('c1-2-2',GN('idxneg')),x('c1-2-2',GN('idxneg')),x('c1-2-2',GN('idxval')),x('c1-2-3',GN('idxfrac')),x('c1-2-3',GN('idxfrac')),x('c1-2-3',GN('idxval')),x('c1-2-2',Q(`x⁰ = …`,[`1`,`0`,`x`,`undefined`],0,`Always 1 (for x ≠ 0).`))]);
TT('c1-3',[x('c1-3-1',GN('gradpts')),x('c1-3-1',GN('gradpts')),x('c1-3-2',GN('gradeq')),x('c1-3-2',GN('gradeq')),x('c1-3-1',Q(`A negative gradient means the line…`,[`goes down from left to right`,`goes up`,`is flat`,`is vertical`],0,`Down.`)),x('c1-3-3',Q(`The gradient of a distance–time graph is…`,[`speed`,`acceleration`,`distance`,`force`],0,`m/s.`)),x('c1-3-3',N(`Level falls from 80% to 50% in 6 minutes. Rate in % per minute?`,-5,0.001,'%/min',`−30 ÷ 6.`)),x('c1-3-2',Q(`y = 2x + 9 crosses the y-axis at…`,[`9`,`2`,`−9`,`0`],0,`c = 9.`)),x('c1-3-3',Q(`Units of the gradient of temperature (°C) against time (h)?`,[`°C per hour`,`hours per °C`,`°C`,`hours`],0,`y units per x unit.`)),x('c1-3-1',GN('gradpts'))]);
TT('c1-4',[x('c1-4-1',GN('avgrate')),x('c1-4-1',GN('avgrate')),x('c1-4-2',GN('speed')),x('c1-4-2',GN('speed')),x('c1-4-3',GN('chord')),x('c1-4-3',GN('chord')),x('c1-4-3',Q(`The gradient of a curve at a point equals the gradient of the…`,[`tangent there`,`chord from the origin`,`x-axis`,`normal`],0,`Tangent.`)),x('c1-4-1',Q(`A chord's gradient measures the…`,[`average rate of change`,`exact rate at a point`,`area`,`intercept`],0,`Average.`)),x('c1-4-3',Q(`On y = x², chords from x = 3 have gradients approaching…`,[`6`,`9`,`3`,`0`],0,`2 × 3.`)),x('c1-4-2',Q(`Average speed = …`,[`change in distance ÷ change in time`,`distance × time`,`time ÷ distance`,`final speed`],0,`Chord gradient.`))]);

