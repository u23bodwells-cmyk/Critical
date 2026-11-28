/* ========== CALCULUS · LEVEL 10 · Sequences and series ========== */
CGEN.geomsum=function(){var a=cR(1,10),r=cP([0.5,-0.5,0.25,0.2,0.1,-0.2,0.8,0.75,-0.25]),v=Math.round(a/(1-r)*1000)/1000;
 return {p:'Find the sum to infinity: '+a+' + '+cNum(a*r)+' + '+cNum(a*r*r)+' + … (3 d.p. if needed)',b:[cB(v,'S = ','','sum',false,0.002)],e:'Geometric with a = '+a+' and r = '+cNum(r)+'. |r| < 1, so S = a/(1 − r) = '+a+'/'+cNum(1-r)+' = '+cNum(v)+'.'}};
CGEN.radius=function(){var k=cR(2,9),t=cR(0,1);
 if(t===0)return {p:'Find the radius of convergence of Σ xⁿ/'+k+'ⁿ.',b:[cB(k,'R = ')],e:'Ratio test: |a<sub>n+1</sub>/a<sub>n</sub>| = |x|/'+k+'. It converges when |x|/'+k+' < 1, so |x| < '+k+'. R = '+k+'.'};
 return {p:'Find the radius of convergence of Σ n xⁿ/'+k+'ⁿ.',b:[cB(k,'R = ')],e:'Ratio: [(n + 1)/n] × |x|/'+k+' → |x|/'+k+' as n → ∞. Converges when |x| < '+k+'. The n doesn\'t change the radius: R = '+k+'.'}};
CGEN.taylorcoef=function(){var a=cR(1,3)*cP([1,-1]),n=cR(1,4),f=[1,1,2,6,24][n],v=Math.pow(a,n)/f,r=Math.round(v*10000)/10000;
 return {p:'Find the coefficient of x'+(n===1?'':cSup(n))+' in the Maclaurin series of e'+cSup(cCo(a)+'x')+'. (4 d.p. if needed)',b:[cB(r,'','','coefficient',false,0.002)],e:'eᵘ = 1 + u + u²/2! + u³/3! + … with u = '+cCo(a)+'x. The x'+(n===1?'':cSup(n))+' term is ('+cNum(a)+')'+cSup(n)+'/'+n+'! = '+cNum(Math.pow(a,n))+'/'+f+' = '+cNum(r)+'.'}};
CGEN.ratiotest=function(){var k=cR(2,9),p=cR(1,3),v=Math.round(1/k*10000)/10000;
 return {p:'For Σ n'+(p===1?'':cSup(p))+'/'+k+'ⁿ, find L = lim |a<sub>n+1</sub>/a<sub>n</sub>|. (4 d.p. if needed)',b:[cB(v,'L = ','','limit',false,0.002)],e:'a<sub>n+1</sub>/a<sub>n</sub> = [(n + 1)/n]'+(p===1?'':cSup(p))+' × 1/'+k+'. As n → ∞, (n + 1)/n → 1, so L = 1/'+k+' = '+cNum(v)+'. L < 1, so the series converges.'}};
CGEN.partsum=function(){var a=cR(1,6),r=cP([2,3,0.5]),n=cR(3,6),s=0;for(var i=0;i<n;i++)s+=a*Math.pow(r,i);s=Math.round(s*1000)/1000;
 return {p:'Find the sum of the first '+n+' terms of the geometric series '+a+' + '+cNum(a*r)+' + '+cNum(a*r*r)+' + … (3 d.p. if needed)',b:[cB(s,'S'+'<sub>'+n+'</sub> = ','','sum',false,0.002)],e:'S<sub>n</sub> = a(1 − rⁿ)/(1 − r) = '+a+'(1 − '+cNum(r)+cSup(n)+')/(1 − '+cNum(r)+') = '+cNum(s)+'.'}};

U({id:'c10-1',track:'calc',level:10,title:'Sequences and geometric series',icon:'Σ',color:'#7F77DD',desc:'Lists of numbers that settle down, adding infinitely many terms, and the geometric series.',lessons:[
LH('c10-1-1','Sequences that settle down',9,'A list of numbers can head towards a limit, just like a function can.',[
RM(`<p>lim<sub>x→∞</sub> f(x) = L means f(x) gets as close as we like to L when x is big enough. lim 1/x = 0.</p>`),
T(`<h3>A sequence</h3><p>A <b>sequence</b> is an ordered list: a₁, a₂, a₃, … The nth term is a formula like aₙ = 1/n, giving 1, ½, ⅓, ¼, …</p><p>The sequence <b>converges</b> to L if aₙ gets as close as we like to L for big enough n:</p><div class="eq">lim<sub>n→∞</sub> aₙ = L</div>`),
Q(`aₙ = (n + 1)/n. What does it converge to?`,[`1`,`0`,`2`,`It diverges`],0,`1 + 1/n → 1.`),
T(`<h3>Three behaviours</h3><ul><li><b>Converges</b>: 1/n → 0.</li><li><b>Diverges to ∞</b>: n² grows without bound.</li><li><b>Diverges by oscillating</b>: (−1)ⁿ goes −1, 1, −1, 1, … and never settles.</li></ul>`),
W('matchPairs',{pairs:[['aₙ = 3 + 1/n','Converges to 3'],['aₙ = 2ⁿ','Diverges to ∞'],['aₙ = (−1)ⁿ','Oscillates, no limit'],['aₙ = (0.5)ⁿ','Converges to 0']]},`Match each sequence to its behaviour.`),
T(`<h3>Powers of r</h3><p>rⁿ is the sequence everything else is built on:</p><ul><li><b>|r| < 1</b>: rⁿ → 0 (each term is a fraction of the last).</li><li><b>r = 1</b>: stays at 1.</li><li><b>|r| > 1</b> or r = −1: diverges.</li></ul>`),
Q(`Does (0.9)ⁿ converge?`,[`Yes, to 0`,`Yes, to 0.9`,`No, it grows`,`No, it oscillates`],0,`|r| < 1.`),
T(`<h3>Key points</h3><ul><li>A <b>sequence</b> converges if lim aₙ exists.</li><li>Diverging: growing without bound, or oscillating.</li><li><b>rⁿ → 0 when |r| < 1</b>.</li></ul>`)]),
LH('c10-1-2','Series and partial sums',10,'Add up infinitely many numbers. Sometimes the total is a perfectly ordinary number.',[
RM(`<p>A sequence converges if its terms settle to a limit. Partial fractions: 1/(n(n + 1)) = 1/n − 1/(n + 1).</p>`),
T(`<h3>A series is a sum</h3><p>A <b>series</b> adds the terms of a sequence: a₁ + a₂ + a₃ + … = Σ aₙ.</p><p>To give it meaning, look at the <b>partial sums</b>: S₁ = a₁, S₂ = a₁ + a₂, S₃ = a₁ + a₂ + a₃, … If the partial sums converge to S, the series converges and its sum is S.</p>`),
W('stepCalc',{steps:[`½ + ¼ + ⅛ + 1/16 + …`,`S₁ = 0.5`,`S₂ = 0.75`,`S₃ = 0.875`,`S₄ = 0.9375: each time, half of the gap to 1 is filled`,`The partial sums → 1, so <b>½ + ¼ + ⅛ + … = 1</b>`]},`Partial sums, step by step.`,`Infinitely many terms, finite total.`),
Q(`A series converges when…`,[`its partial sums approach a finite limit`,`it has finitely many terms`,`its first term is small`,`every term is positive`],0,`Watch the partial sums.`),
T(`<h3>Telescoping</h3><p>Σ 1/(n(n + 1)) = Σ [1/n − 1/(n + 1)]. Write out the partial sum:</p><p>(1 − ½) + (½ − ⅓) + (⅓ − ¼) + … + (1/N − 1/(N + 1)) = 1 − 1/(N + 1)</p><p>Almost everything cancels, like a collapsing telescope. As N → ∞, the sum is <b>1</b>.</p>`),
N(`Using telescoping, find 1/(1×2) + 1/(2×3) + … + 1/(9×10). (2 decimal places)`,0.9,0.001,'',`1 − 1/10 = 0.9.`),
QE(`∫<sub>0</sub><sup>∞</sup> e<sup>−2x</sup> dx = …`,[`½`,`2`,`1`,`It diverges`],0,`1/a with a = 2.`),
T(`<h3>Key points</h3><ul><li>A <b>series</b> is an infinite sum Σ aₙ.</li><li>It converges if its <b>partial sums</b> converge.</li><li><b>Telescoping</b> series cancel down to a few terms.</li></ul>`)]),
LH('c10-1-3','The geometric series',10,'The most important infinite sum, from 0.999… = 1 to how a subcritical reactor multiplies neutrons.',[
RM(`<p>Partial sums Sₙ. rⁿ → 0 when |r| < 1.</p>`),
W('stepCalc',{steps:[`Geometric: S = a + ar + ar² + … + arⁿ⁻¹`,`Multiply by r: rS = ar + ar² + … + arⁿ`,`Subtract: S − rS = a − arⁿ`,`So <b>Sₙ = a(1 − rⁿ)/(1 − r)</b>`,`If |r| < 1, rⁿ → 0, so the infinite sum is <b>S = a/(1 − r)</b>`]},`Derive the geometric sum.`,`If |r| ≥ 1, the series diverges.`),
W('calcDrill',{skill:'partsum',need:2},`Finite geometric sums. Get 2 right to master it.`,`a(1 − rⁿ)/(1 − r).`),
W('calcDrill',{skill:'geomsum',need:3},`Sums to infinity. Get 3 right to master it.`,`a/(1 − r), for |r| < 1.`),
T(`<h3>0.999… = 1</h3><p>0.999… = 0.9 + 0.09 + 0.009 + … : a = 0.9, r = 0.1. Sum = 0.9/0.9 = <b>1</b>. Not "nearly 1": exactly 1.</p>`),
T(`<h3>Subcritical multiplication</h3><p>In a subcritical reactor, each neutron leads on average to k neutrons in the next generation (k < 1). One source neutron gives 1 + k + k² + … neutrons in total:</p><div class="eq">total = 1/(1 − k)</div><p>At k = 0.95 that's 20 neutrons per source neutron. As k → 1, the total blows up: that's why the count rate rises sharply as a reactor approaches criticality.</p>`),
N(`k = 0.98. How many neutrons in total per source neutron?`,50,0.001,'',`1/(1 − 0.98) = 1/0.02 = 50.`),
T(`<h3>Key points</h3><ul><li><b>Sₙ = a(1 − rⁿ)/(1 − r)</b>.</li><li><b>S∞ = a/(1 − r)</b> for |r| < 1.</li><li>Subcritical multiplication: <b>1/(1 − k)</b>.</li></ul>`)])
]});

U({id:'c10-2',track:'calc',level:10,title:'Convergence tests',icon:'✓?',color:'#1D9E75',desc:'How to tell whether an infinite series adds up: divergence, integral, comparison, ratio and alternating tests.',lessons:[
LH('c10-2-1','The divergence test and the harmonic series',10,'If the terms don\'t shrink to zero, the sum can\'t settle. But shrinking to zero isn\'t enough.',[
RM(`<p>A series converges if its partial sums approach a limit. ∫<sub>1</sub><sup>∞</sup> 1/x dx diverges.</p>`),
T(`<h3>The divergence test</h3><p>If the terms aₙ <b>don't</b> go to 0, you keep adding chunks that don't shrink, so the series <b>diverges</b>.</p><div class="eq">aₙ ↛ 0 &nbsp;⟹&nbsp; Σ aₙ diverges</div>`),
Q(`Σ n/(n + 1): what does the divergence test say?`,[`Diverges, because the terms go to 1, not 0`,`Converges, because the terms are below 1`,`Nothing: the test can't decide`,`Converges to 1`],0,`Adding numbers close to 1 forever.`),
T(`<h3>The catch: the harmonic series</h3><p>1 + ½ + ⅓ + ¼ + … : the terms go to 0. Does it converge? Group the terms:</p><p>1 + ½ + (⅓ + ¼) + (⅕ + … + ⅛) + …</p><p>Each bracket is at least ½ (⅓ + ¼ > ¼ + ¼ = ½, and so on). Infinitely many halves: the sum is <b>infinite</b>.</p>`),
Q(`aₙ → 0. What does that tell you about Σ aₙ?`,[`Nothing on its own: it might converge or diverge`,`It definitely converges`,`It definitely diverges`,`Its sum is 0`],0,`The harmonic series has aₙ → 0 but diverges.`),
W('fnPlot',{x:[0,1000],y:[0,8],xl:'number of terms N',yl:'partial sum',sl:[['N','Terms added',10,1000,10,100,function(v){return v}]],curves:function(){return [[function(n){return n<1?NaN:Math.log(n)+0.5772},'--accent',3]]},read:function(p){var s=0;for(var i=1;i<=p.N;i++)s+=1/i;return 'Sum of the first '+p.N+' terms = <b>'+s.toFixed(4)+'</b>. It never stops growing, just very slowly (about ln N).'}},`Add more terms of the harmonic series. It keeps creeping up.`,`It grows like ln N: slowly, but forever.`),
QE(`Sum to infinity of 6 + 3 + 1.5 + …?`,[`12`,`6`,`10.5`,`It diverges`],0,`6/(1 − 0.5).`),
T(`<h3>Key points</h3><ul><li><b>Divergence test</b>: if aₙ ↛ 0, the series diverges.</li><li>If aₙ → 0, the test says <b>nothing</b>.</li><li>The <b>harmonic series</b> Σ 1/n diverges.</li></ul>`)]),
LH('c10-2-2','The integral and comparison tests',10,'Compare a series to an integral, or to a series you already understand.',[
RM(`<p>p-test for integrals: ∫<sub>1</sub><sup>∞</sup> 1/xᵖ dx converges if p > 1. The harmonic series diverges.</p>`),
T(`<h3>The integral test</h3><p>If f is positive and decreasing, Σ f(n) and ∫<sub>1</sub><sup>∞</sup> f(x) dx either <b>both converge or both diverge</b>. The terms are the heights of unit-width rectangles that hug the curve.</p>`),
T(`<h3>p-series</h3><p>From the integral p-test:</p><div class="eq">Σ 1/nᵖ converges if p > 1, diverges if p ≤ 1</div><p>Σ 1/n² converges (to π²/6, a famous result of Euler). Σ 1/√n diverges.</p>`),
Q(`Does Σ 1/n³ converge?`,[`Yes: p = 3 > 1`,`No: p = 3 is too big`,`No: like the harmonic series`,`You can't tell`],0,`p-series with p > 1.`),
T(`<h3>The comparison test</h3><p>For positive terms:</p><ul><li>If aₙ ≤ bₙ and Σ bₙ <b>converges</b>, so does Σ aₙ (smaller than something finite).</li><li>If aₙ ≥ bₙ and Σ bₙ <b>diverges</b>, so does Σ aₙ (bigger than something infinite).</li></ul><p>Example: 1/(n² + 5) < 1/n², and Σ 1/n² converges, so Σ 1/(n² + 5) converges.</p>`),
Q(`1/(n + 3) is compared with 1/n. Why doesn't "smaller than a divergent series" prove anything?`,[`Being smaller than infinity doesn't make it finite`,`Because 1/(n + 3) is bigger`,`It does prove it converges`,`Because n + 3 is never zero`],0,`You need smaller-than-convergent or bigger-than-divergent.`),
W('matchPairs',{pairs:[['Σ 1/n²','Converges (p = 2)'],['Σ 1/n','Diverges (harmonic)'],['Σ 1/√n','Diverges (p = ½)'],['Σ 1/(n² + 1)','Converges (compare with 1/n²)']]},`Match each series to its verdict.`),
T(`<h3>Key points</h3><ul><li><b>Integral test</b>: series and integral behave alike.</li><li><b>Σ 1/nᵖ</b> converges iff <b>p > 1</b>.</li><li><b>Comparison</b>: smaller than convergent, or bigger than divergent.</li></ul>`)]),
LH('c10-2-3','The ratio test and alternating series',11,'The most useful test of all, and what happens when the signs take turns.',[
RM(`<p>Geometric series converge when |r| < 1. The harmonic series diverges.</p>`),
T(`<h3>The ratio test</h3><p>Look at how each term compares to the one before:</p><div class="eq">L = lim<sub>n→∞</sub> |aₙ₊₁ / aₙ|</div><ul><li><b>L < 1</b>: converges (eventually like a geometric series with r < 1).</li><li><b>L > 1</b>: diverges.</li><li><b>L = 1</b>: the test can't decide.</li></ul>`),
W('calcDrill',{skill:'ratiotest',need:3},`Use the ratio test. Get 3 right to master it.`,`The power of n doesn't matter; the kⁿ does.`),
Q(`For Σ 1/n, the ratio test gives L = 1. What does that mean?`,[`The ratio test can't decide (we know it diverges)`,`It converges`,`It diverges because L = 1`,`The sum is 1`],0,`L = 1 is inconclusive.`),
T(`<h3>Factorials</h3><p>For Σ 1/n!: aₙ₊₁/aₙ = n!/(n + 1)! = 1/(n + 1) → 0. L = 0 < 1: converges (to e − 1, as you'll see). Factorials beat any power.</p>`),
T(`<h3>Alternating series</h3><p>1 − ½ + ⅓ − ¼ + … The signs alternate. The <b>alternating series test</b>: if the sizes decrease to 0, it converges. This one converges to <b>ln 2</b>, even though without the minus signs it diverges.</p><ul><li><b>Absolutely convergent</b>: converges even with all terms made positive.</li><li><b>Conditionally convergent</b>: only converges because of the alternating signs.</li></ul>`),
Q(`1 − ½ + ⅓ − ¼ + … is…`,[`conditionally convergent`,`absolutely convergent`,`divergent`,`equal to 0`],0,`Converges, but Σ 1/n diverges.`),
T(`<h3>Key points</h3><ul><li><b>Ratio test</b>: L < 1 converges, L > 1 diverges, L = 1 can't tell.</li><li><b>Alternating</b>: decreasing to 0 is enough to converge.</li><li><b>Absolute</b> vs <b>conditional</b> convergence.</li></ul>`)])
]});

U({id:'c10-3',track:'calc',level:10,title:'Power and Taylor series',icon:'Σcₙxⁿ',color:'#378ADD',desc:'Functions written as infinite polynomials: power series, radius of convergence, and Taylor series.',lessons:[
LH('c10-3-1','Power series',10,'An infinite polynomial in x. For some x it adds up; for others it doesn\'t.',[
RM(`<p>Geometric: 1 + r + r² + … = 1/(1 − r) for |r| < 1. Ratio test: L < 1 converges.</p>`),
T(`<h3>An infinite polynomial</h3><p>A <b>power series</b> is Σ cₙxⁿ = c₀ + c₁x + c₂x² + … Plug in a number for x and you get an ordinary series.</p><p>The simplest: 1 + x + x² + x³ + … It's geometric with r = x, so:</p><div class="eq">1 + x + x² + … = 1/(1 − x)&nbsp;&nbsp;for |x| < 1</div>`),
Q(`1 + x + x² + … equals 1/(1 − x) when…`,[`|x| < 1`,`x > 1`,`x = 1`,`always`],0,`Geometric with r = x.`),
T(`<h3>Radius of convergence</h3><p>Every power series converges for |x| < R and diverges for |x| > R. R is the <b>radius of convergence</b>. Find it with the ratio test: work out L in terms of x, and solve L < 1.</p>`),
W('calcDrill',{skill:'radius',need:3},`Radius of convergence. Get 3 right to master it.`,`Ratio test, then solve for |x|.`),
T(`<h3>New series from old</h3><p>Replace x by −x²: 1/(1 + x²) = 1 − x² + x⁴ − … Integrate term by term: <b>arctan x = x − x³/3 + x⁵/5 − …</b>. Put x = 1: π/4 = 1 − ⅓ + ⅕ − … (Leibniz's formula for π).</p>`),
QE(`Does Σ 1/n² converge?`,[`Yes`,`No`,`Only for even n`,`It can't be tested`],0,`p = 2 > 1.`),
T(`<h3>Key points</h3><ul><li><b>Power series</b>: Σ cₙxⁿ.</li><li>Converges for |x| < <b>R</b>, found by the ratio test.</li><li>You can substitute, differentiate and integrate them term by term.</li></ul>`)]),
LH('c10-3-2','Taylor and Maclaurin series',11,'Any smooth function can be built from its derivatives at one point. eˣ, sin and cos as infinite polynomials.',[
RM(`<p>d/dx eˣ = eˣ. d/dx sin x = cos x, d/dx cos x = −sin x. n! = n × (n − 1) × … × 1, and 0! = 1.</p>`),
T(`<h3>Match every derivative</h3><p>Suppose f(x) = c₀ + c₁x + c₂x² + c₃x³ + … Differentiate n times and put x = 0: only cₙ survives, as n! × cₙ. So:</p><div class="eq">cₙ = f⁽ⁿ⁾(0) / n!</div><p>This is the <b>Maclaurin series</b> (a Taylor series centred at 0).</p>`),
W('stepCalc',{steps:[`f(x) = eˣ. Every derivative is eˣ, and at 0 they're all 1.`,`So cₙ = 1/n!`,`<b>eˣ = 1 + x + x²/2! + x³/3! + x⁴/4! + …</b>`,`Put x = 1: e = 1 + 1 + ½ + ⅙ + 1/24 + … = 2.7182…`,`The ratio test gives L = 0 for every x: it converges everywhere.`]},`Build the series for eˣ.`,`The derivatives of eˣ at 0 are all 1.`),
Q(`In a Maclaurin series, cₙ = …`,[`f⁽ⁿ⁾(0)/n!`,`f(n)/n`,`f⁽ⁿ⁾(0)`,`n!/f(0)`],0,`The nth derivative at 0, divided by n!.`),
T(`<h3>sin and cos</h3><p>The derivatives of sin x at 0 cycle 0, 1, 0, −1, …, so:</p><div class="eq">sin x = x − x³/3! + x⁵/5! − …&nbsp;&nbsp;&nbsp;cos x = 1 − x²/2! + x⁴/4! − …</div><p>sin is odd (only odd powers); cos is even (only even powers).</p>`),
W('fnPlot',{x:[-7,7],y:[-3,3],xl:'x',yl:'y',sl:[['n','Terms used',1,8,1,1]],curves:function(p){return [[function(x){return Math.sin(x)},'--muted',4],[function(x){var s=0,t=x;for(var k=0;k<p.n;k++){s+=t;t*=-x*x/((2*k+2)*(2*k+3))}return s},'--accent',2.5]]},read:function(p){var t=[],d=1;for(var k=0;k<p.n;k++){t.push((k?(k%2?' − ':' + '):'')+'x'+(2*k+1>1?'<sup>'+(2*k+1)+'</sup>/'+(2*k+1)+'!':''))}return 'sin x ≈ '+t.join('')},goal:function(p){return p.n>=6},goalMsg:'Use at least 6 terms.'},`Add terms of the sin x series. Watch the polynomial wrap itself around the sine wave.`,`More terms, accurate over a wider range.`),
W('calcDrill',{skill:'taylorcoef',need:3},`Coefficients of e<sup>ax</sup>. Get 3 right to master it.`,`aⁿ/n!.`),
T(`<h3>Key points</h3><ul><li><b>cₙ = f⁽ⁿ⁾(0)/n!</b>.</li><li><b>eˣ = Σ xⁿ/n!</b>; sin and cos alternate odd and even powers.</li><li>More terms give a better fit over a wider range.</li></ul>`)]),
LH('c10-3-3','Using Taylor series',10,'Small-angle approximations, limits without L\'Hôpital, and the most beautiful equation in maths.',[
RM(`<p>sin x = x − x³/6 + …, cos x = 1 − x²/2 + …, eˣ = 1 + x + x²/2 + …</p>`),
T(`<h3>Approximations</h3><p>For small x, the first terms do almost all the work:</p><ul><li><b>sin x ≈ x</b>, <b>cos x ≈ 1 − x²/2</b>, <b>tan x ≈ x</b> (radians)</li><li><b>eˣ ≈ 1 + x</b></li><li><b>(1 + x)ⁿ ≈ 1 + nx</b></li></ul><p>Engineers use these constantly. The pendulum formula and many reactor kinetics models depend on them.</p>`),
N(`Use eˣ ≈ 1 + x + x²/2 to estimate e<sup>0.1</sup>. (3 decimal places)`,1.105,0.001,'',`1 + 0.1 + 0.005 = 1.105. True: 1.10517.`),
T(`<h3>Limits made easy</h3><p>(sin x)/x = (x − x³/6 + …)/x = 1 − x²/6 + … → <b>1</b>. And (1 − cos x)/x² = (x²/2 − …)/x² → <b>½</b>. No L'Hôpital needed.</p>`),
Q(`Using series, lim<sub>x→0</sub> (eˣ − 1 − x)/x² = …`,[`½`,`1`,`0`,`2`],0,`(x²/2 + x³/6 + …)/x² → ½.`),
T(`<h3>Euler's formula</h3><p>Put x = iθ into the series for eˣ, where i² = −1. The real terms are exactly the cos series and the imaginary terms are the sin series:</p><div class="eq">e<sup>iθ</sup> = cos θ + i sin θ</div><p>With θ = π: <b>e<sup>iπ</sup> + 1 = 0</b>, linking e, i, π, 1 and 0. It's also how engineers handle anything that oscillates, from AC circuits to vibrations.</p>`),
Q(`What does e<sup>iπ</sup> equal?`,[`−1`,`1`,`0`,`i`],0,`cos π + i sin π = −1 + 0i.`),
QE(`Radius of convergence of Σ xⁿ/3ⁿ?`,[`3`,`1`,`1/3`,`∞`],0,`|x|/3 < 1.`),
T(`<h3>Key points</h3><ul><li>Small x: <b>sin x ≈ x</b>, <b>cos x ≈ 1 − x²/2</b>, <b>eˣ ≈ 1 + x</b>.</li><li>Series make tricky limits easy.</li><li><b>e<sup>iθ</sup> = cos θ + i sin θ</b>. You've finished Calculus 2.</li></ul>`)])
]});

F('c10-1-1',[Q(`aₙ = 5 − 2/n converges to…`,[`5`,`3`,`0`,`−2`],0,`2/n → 0.`),Q(`(−1)ⁿ…`,[`oscillates and diverges`,`converges to 0`,`converges to 1`,`grows`],0,`No limit.`),Q(`rⁿ → 0 when…`,[`|r| < 1`,`r > 1`,`r = 1`,`r = −1`],0,`Fractions shrink.`),Q(`aₙ = n² …`,[`diverges to ∞`,`converges to 0`,`oscillates`,`converges to 1`],0,`Grows.`),N(`lim (3n + 1)/n?`,3,0.001,'',`3 + 1/n.`)]);
F('c10-1-2',[Q(`A series converges if its … converge.`,[`partial sums`,`first terms`,`differences`,`squares`],0,`Sₙ.`),N(`1/(1×2) + … + 1/(99×100)? (2 d.p.)`,0.99,0.001,'',`1 − 1/100.`),Q(`Telescoping works because…`,[`most terms cancel`,`all terms are equal`,`the terms grow`,`there are no terms`],0,`Collapsing.`),Q(`½ + ¼ + ⅛ + … = …`,[`1`,`2`,`½`,`∞`],0,`Fills the gap to 1.`),Q(`Σ means…`,[`add up`,`multiply`,`differentiate`,`integrate`],0,`Sum.`)]);
F('c10-1-3',[GN('geomsum'),GN('geomsum'),GN('partsum'),Q(`0.333… as a geometric series sums to…`,[`1/3`,`0.3`,`3`,`1`],0,`0.3/(1 − 0.1).`),N(`k = 0.9. Neutrons per source neutron?`,10,0.001,'',`1/(1 − 0.9).`)]);
F('c10-2-1',[Q(`If aₙ → 2, Σ aₙ…`,[`diverges`,`converges`,`equals 2`,`can't be decided`],0,`Divergence test.`),Q(`The harmonic series…`,[`diverges`,`converges to 2`,`converges to 1`,`converges to ln 2`],0,`Grows like ln N.`),Q(`If aₙ → 0, the divergence test…`,[`says nothing`,`proves convergence`,`proves divergence`,`gives the sum`],0,`Inconclusive.`),Q(`Each bracket in the harmonic grouping is at least…`,[`½`,`1`,`¼`,`0`],0,`Grouping proof.`),Q(`The harmonic partial sums grow like…`,[`ln N`,`N²`,`√N`,`they stop growing`],0,`Slowly.`)]);
F('c10-2-2',[Q(`Σ 1/nᵖ converges when…`,[`p > 1`,`p ≥ 1`,`p < 1`,`p = 1`],0,`p-series.`),Q(`Σ 1/n²…`,[`converges`,`diverges`,`equals 1`,`oscillates`],0,`p = 2.`),Q(`aₙ ≤ bₙ and Σ bₙ converges. Then Σ aₙ…`,[`converges`,`diverges`,`can't be decided`,`equals Σ bₙ`],0,`Comparison.`),Q(`Σ 1/√n…`,[`diverges`,`converges`,`equals 2`,`equals 1`],0,`p = ½.`),Q(`The integral test needs f to be positive and…`,[`decreasing`,`increasing`,`constant`,`periodic`],0,`Decreasing.`)]);
F('c10-2-3',[GN('ratiotest'),GN('ratiotest'),Q(`Ratio test L = 1 means…`,[`no conclusion`,`converges`,`diverges`,`sum is 1`],0,`Inconclusive.`),Q(`Σ 1/n!…`,[`converges`,`diverges`,`oscillates`,`can't be tested`],0,`L = 0.`),Q(`1 − ½ + ⅓ − … converges to…`,[`ln 2`,`1`,`0`,`π/4`],0,`Alternating harmonic.`)]);
F('c10-3-1',[GN('radius'),GN('radius'),Q(`1/(1 − x) = 1 + x + x² + … for…`,[`|x| < 1`,`all x`,`x > 1`,`x = 1`],0,`Geometric.`),Q(`arctan x = x − x³/3 + … comes from integrating…`,[`1/(1 + x²)`,`1/(1 − x)`,`eˣ`,`sin x`],0,`Term by term.`),Q(`Inside the radius of convergence the series…`,[`converges`,`diverges`,`equals 0`,`is undefined`],0,`|x| < R.`)]);
F('c10-3-2',[GN('taylorcoef'),GN('taylorcoef'),Q(`sin x = x − x³/3! + …: it has only…`,[`odd powers`,`even powers`,`all powers`,`negative powers`],0,`sin is odd.`),Q(`cos x = 1 − x²/2! + …: the x⁴ term is…`,[`x⁴/24`,`−x⁴/24`,`x⁴/4`,`x⁴/12`],0,`4! = 24, positive.`),N(`e ≈ 1 + 1 + 1/2 + 1/6 + 1/24. (4 d.p.)`,2.7083,0.0005,'',`Partial sum.`)]);
F('c10-3-3',[Q(`For small x, sin x ≈ …`,[`x`,`1`,`x²`,`0`],0,`First term.`),Q(`For small x, cos x ≈ …`,[`1 − x²/2`,`x`,`1 + x`,`x²/2`],0,`First two terms.`),N(`(1.02)¹⁰ ≈ 1 + nx. Estimate? (2 d.p.)`,1.2,0.001,'',`1 + 10 × 0.02.`),Q(`e<sup>iθ</sup> = …`,[`cos θ + i sin θ`,`sin θ + i cos θ`,`cos θ − i sin θ`,`1 + iθ`],0,`Euler.`),Q(`Series give lim (sin x)/x = …`,[`1`,`0`,`½`,`∞`],0,`1 − x²/6 → 1.`)]);
GOALS.calc10={icon:'♾️',title:'Tame infinite sums',story:'Each unit takes you further into the infinite: sums that add up, tests that tell you when, and functions written as endless polynomials.',final:'Calculus 2 complete',steps:['Sequences and geometric series','Convergence tests','Power and Taylor series']};
