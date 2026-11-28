/* ========== CALCULUS · LEVEL 11 · Curves and vectors ========== */
function c3v(v){return '⟨'+v.map(cNum).join(', ')+'⟩'}
var C11MAG=[[2,3,6,7],[1,2,2,3],[2,6,9,11],[4,4,7,9],[1,4,8,9],[2,10,11,15],[3,4,12,13],[6,6,7,11]];
var C11ANG=[['π/6',Math.PI/6],['π/4',Math.PI/4],['π/3',Math.PI/3],['π/2',Math.PI/2],['2π/3',2*Math.PI/3],['π',Math.PI],['3π/2',3*Math.PI/2],['5π/6',5*Math.PI/6]];
CGEN.paramgrad=function(){var a=cR(1,4),b=cNZ(-3,3),k=cNZ(-3,3),v=Math.round(3*b*k/(2*a)*1000)/1000;
 return {p:'x = '+cCo(a)+'t², y = '+cCo(b)+'t³. Find dy/dx at t = '+cNum(k)+'. (3 d.p. if needed)',b:[cB(v,'dy/dx = ','','gradient',false,0.002)],e:'dx/dt = '+(2*a)+'t and dy/dt = '+(3*b)+'t². So dy/dx = '+(3*b)+'t² ÷ '+(2*a)+'t = '+cNum(3*b/(2*a))+'t. At t = '+cNum(k)+': '+cNum(v)+'.'}};
CGEN.polar2cart=function(){var r=cR(1,10),A=cP(C11ANG),w=cR(0,1),v=Math.round((w?r*Math.sin(A[1]):r*Math.cos(A[1]))*1000)/1000;if(Math.abs(v)<1e-9)v=0;
 return {p:'A point has polar coordinates r = '+r+', θ = '+A[0]+'. Find its '+(w?'y':'x')+'-coordinate. (3 d.p. if needed)',b:[cB(v,(w?'y':'x')+' = ','','coordinate',false,0.002)],e:(w?'y = r sin θ':'x = r cos θ')+' = '+r+' × '+(w?'sin':'cos')+'('+A[0]+') = '+cNum(v)+'.'}};
CGEN.polararea=function(){var k=cR(1,5);if(cR(0,1)){var A=cP(C11ANG),v=Math.round(0.5*k*k*A[1]*1000)/1000;return {p:'Find the area swept by r = '+k+' as θ goes from 0 to '+A[0]+'. (3 d.p.)',b:[cB(v,'area = ','','area',false,0.002)],e:'Area = ½∫ r² dθ = ½ × '+(k*k)+' × '+A[0]+' = '+cNum(v)+'. It\'s a sector of a circle.'}}
 var v2=Math.round(0.5*k*k*Math.pow(Math.PI,3)/3*1000)/1000;return {p:'Find the area swept by the spiral r = '+cCo(k)+'θ as θ goes from 0 to π. (3 d.p.)',b:[cB(v2,'area = ','','area',false,0.002)],e:'Area = ½∫<sub>0</sub><sup>π</sup> '+(k*k)+'θ² dθ = ½ × '+(k*k)+' × π³/3 = '+cNum(v2)+'.'}};
CGEN.vmag=function(){var t=cP(C11MAG),v=[t[0]*cP([1,-1]),t[1]*cP([1,-1]),t[2]*cP([1,-1])];
 return {p:'Find the magnitude of '+c3v(v)+'.',b:[cB(t[3],'| v | = ')],e:'√('+v.map(function(x){return cBr(x)+'²'}).join(' + ')+') = √'+(t[3]*t[3])+' = '+t[3]+'.'}};
CGEN.vdot=function(){var a=[cR(-5,5),cR(-5,5),cR(-5,5)],b=[cR(-5,5),cR(-5,5),cR(-5,5)],v=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 return {p:'Find '+c3v(a)+' · '+c3v(b)+'.',b:[cB(v,'a · b = ')],e:'Multiply matching components and add: '+cBr(a[0])+'×'+cBr(b[0])+' + '+cBr(a[1])+'×'+cBr(b[1])+' + '+cBr(a[2])+'×'+cBr(b[2])+' = '+cNum(v)+'.'+(v===0?' Zero: they\'re perpendicular.':'')}};
CGEN.vangle=function(){var a,b,d;do{a=[cR(-4,4),cR(-4,4),cR(-4,4)];b=[cR(-4,4),cR(-4,4),cR(-4,4)]}while(!(a[0]||a[1]||a[2])||!(b[0]||b[1]||b[2]));
 var dot=a[0]*b[0]+a[1]*b[1]+a[2]*b[2],ma=Math.hypot(a[0],a[1],a[2]),mb=Math.hypot(b[0],b[1],b[2]),ang=Math.round(Math.acos(Math.max(-1,Math.min(1,dot/(ma*mb))))*180/Math.PI*10)/10;
 return {p:'Find the angle between '+c3v(a)+' and '+c3v(b)+', in degrees. (1 decimal place)',b:[cB(ang,'θ = ','°','angle',false,0.003)],e:'cos θ = (a · b)/(|a||b|) = '+dot+' ÷ ('+ma.toFixed(3)+' × '+mb.toFixed(3)+') = '+(dot/(ma*mb)).toFixed(4)+'. θ = '+cNum(ang)+'°.'}};
CGEN.vcross=function(){var a=[cR(-3,3),cR(-3,3),cR(-3,3)],b=[cR(-3,3),cR(-3,3),cR(-3,3)],c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 return {p:'Find '+c3v(a)+' × '+c3v(b)+'.',b:[cB(c[0],'⟨'),cB(c[1],', '),cB(c[2],', ','⟩')],e:'i: '+cBr(a[1])+'×'+cBr(b[2])+' − '+cBr(a[2])+'×'+cBr(b[1])+' = '+cNum(c[0])+'. j: '+cBr(a[2])+'×'+cBr(b[0])+' − '+cBr(a[0])+'×'+cBr(b[2])+' = '+cNum(c[1])+'. k: '+cBr(a[0])+'×'+cBr(b[1])+' − '+cBr(a[1])+'×'+cBr(b[0])+' = '+cNum(c[2])+'. So '+c3v(c)+'.'}};
CGEN.plane=function(){var n=[cNZ(-5,5),cR(-5,5),cR(-5,5)],p=[cR(-4,4),cR(-4,4),cR(-4,4)],d=n[0]*p[0]+n[1]*p[1]+n[2]*p[2];
 return {p:'A plane has normal '+c3v(n)+' and passes through ('+p.map(cNum).join(', ')+'). Its equation is '+cPoly([[n[0],1]],'x')+(n[1]?(n[1]<0?' − ':' + ')+cT(Math.abs(n[1]),1,'y'):'')+(n[2]?(n[2]<0?' − ':' + ')+cT(Math.abs(n[2]),1,'z'):'')+' = d. Find d.',b:[cB(d,'d = ')],e:'n · r = n · (point): '+cBr(n[0])+'×'+cBr(p[0])+' + '+cBr(n[1])+'×'+cBr(p[1])+' + '+cBr(n[2])+'×'+cBr(p[2])+' = '+cNum(d)+'.'}};

U({id:'c11-1',track:'calc',level:11,title:'Parametric curves',icon:'(x(t),y(t))',color:'#7F77DD',desc:'Curves traced out over time, their gradients, and their lengths.',lessons:[
LH('c11-1-1','Curves traced over time',9,'Describe where something is at each moment, and its path draws itself.',[
RM(`<p>A function y = f(x) gives one y for each x. sin²t + cos²t = 1.</p>`),
T(`<h3>Two equations, one curve</h3><p>A <b>parametric</b> curve gives x and y separately, both in terms of a third variable, the <b>parameter</b> t (often time):</p><div class="eq">x = f(t),&nbsp;&nbsp; y = g(t)</div><p>As t increases, the point (x, y) moves and traces out the curve. Curves that loop back or cross themselves are easy this way.</p>`),
T(`<h3>A circle</h3><p>x = cos t, y = sin t. At t = 0 the point is (1, 0); at t = π/2 it's (0, 1). Because cos²t + sin²t = 1, every point satisfies x² + y² = 1: the unit circle, traced anticlockwise.</p>`),
Q(`x = 3 cos t, y = 3 sin t traces…`,[`a circle of radius 3`,`a circle of radius 9`,`a straight line`,`a parabola`],0,`x² + y² = 9cos²t + 9sin²t = 9.`),
W('fnPlot',{x:[-4,4],y:[-3,3],xl:'x',yl:'y',sl:[['t','t',0,6.28,0.04,1,function(v){return v.toFixed(2)}],['b','y frequency',1,3,1,2]],curves:function(){return []},marks:function(p,P,col){var c=P.c;c.strokeStyle=col('--accent');c.lineWidth=2.5;c.beginPath();for(var s=0;s<=p.t+1e-9;s+=0.02){var X=P.X(3*Math.cos(s)),Y=P.Y(2*Math.sin(p.b*s));if(s===0)c.moveTo(X,Y);else c.lineTo(X,Y)}c.stroke();c.fillStyle=col('--coral');c.beginPath();c.arc(P.X(3*Math.cos(p.t)),P.Y(2*Math.sin(p.b*p.t)),7,0,7);c.fill()},read:function(p){return 'x = 3cos t = <b>'+(3*Math.cos(p.t)).toFixed(2)+'</b>, y = 2sin('+p.b+'t) = <b>'+(2*Math.sin(p.b*p.t)).toFixed(2)+'</b>'},goal:function(p){return p.t>=6.2},goalMsg:'Move t all the way to 2π to finish the curve.'},`x = 3cos t, y = 2sin(bt). Move t to trace the curve; change b for different shapes.`,`b = 1 gives an ellipse; other values give looping Lissajous curves.`),
T(`<h3>Eliminating t</h3><p>Sometimes you can get rid of t. x = t + 1, y = t²: from the first, t = x − 1, so y = (x − 1)². A parabola.</p>`),
Q(`x = 2t, y = t² + 1. What's y in terms of x?`,[`y = x²/4 + 1`,`y = 2x² + 1`,`y = x² + 1`,`y = x/2 + 1`],0,`t = x/2, so y = (x/2)² + 1.`),
T(`<h3>Key points</h3><ul><li><b>Parametric</b>: x = f(t), y = g(t).</li><li>(cos t, sin t) traces the unit circle.</li><li>Eliminate t to get an x–y equation, when you can.</li></ul>`)]),
LH('c11-1-2','Gradients of parametric curves',10,'The chain rule gives dy/dx straight from dx/dt and dy/dt.',[
RM(`<p>Chain rule: dy/dt = dy/dx × dx/dt. Tangent: y − y₁ = m(x − x₁).</p>`),
T(`<h3>Divide the rates</h3><p>Rearranging the chain rule:</p><div class="eq">dy/dx = (dy/dt) ÷ (dx/dt)</div><p>How fast y changes, divided by how fast x changes.</p>`),
W('stepCalc',{steps:[`x = t², y = t³. Find the gradient at t = 2.`,`dx/dt = 2t, dy/dt = 3t²`,`dy/dx = 3t² ÷ 2t = 1.5t`,`At t = 2: <b>dy/dx = 3</b>`,`The point is (4, 8), so the tangent is y − 8 = 3(x − 4).`]},`A parametric gradient.`,`Find the point from t as well as the gradient.`),
W('calcDrill',{skill:'paramgrad',need:3},`Parametric gradients. Get 3 right to master it.`,`(dy/dt) ÷ (dx/dt).`),
T(`<h3>Flat and vertical tangents</h3><ul><li><b>Horizontal tangent</b>: dy/dt = 0 (and dx/dt ≠ 0).</li><li><b>Vertical tangent</b>: dx/dt = 0 (and dy/dt ≠ 0).</li></ul><p>On the circle (cos t, sin t), the tangent is horizontal at t = π/2 (top) and vertical at t = 0 (right).</p>`),
Q(`When is a parametric curve's tangent vertical?`,[`When dx/dt = 0`,`When dy/dt = 0`,`When t = 0`,`When x = y`],0,`x momentarily stops changing.`),
QE(`Area under y = √x from 0 to 4, spun about the x-axis: V = …`,[`8π`,`16π`,`4π`,`2π`],0,`π∫ x dx = 8π.`),
T(`<h3>Key points</h3><ul><li><b>dy/dx = (dy/dt)/(dx/dt)</b>.</li><li>Horizontal tangent: dy/dt = 0. Vertical: dx/dt = 0.</li><li>Get the point from t too.</li></ul>`)]),
LH('c11-1-3','Speed and arc length',10,'How fast a point moves along a parametric path, and how far it travels.',[
RM(`<p>Arc length L = ∫ √(1 + (dy/dx)²) dx came from Pythagoras on tiny pieces.</p>`),
T(`<h3>Speed</h3><p>In a tiny time dt the point moves dx across and dy up. By Pythagoras, distance = √(dx² + dy²), so the <b>speed</b> is:</p><div class="eq">speed = √((dx/dt)² + (dy/dt)²)</div>`),
N(`x = 3t, y = 4t. What's the speed?`,5,0.001,'',`√(9 + 16) = 5.`),
T(`<h3>Arc length</h3><p>Distance travelled = ∫ speed dt:</p><div class="eq">L = ∫<sub>a</sub><sup>b</sup> √((dx/dt)² + (dy/dt)²) dt</div>`),
W('stepCalc',{steps:[`Circumference of a circle radius r: x = r cos t, y = r sin t, t from 0 to 2π`,`dx/dt = −r sin t, dy/dt = r cos t`,`Speed = √(r²sin²t + r²cos²t) = √(r²) = r`,`L = ∫<sub>0</sub><sup>2π</sup> r dt`,`<b>L = 2πr</b>`]},`Prove the circumference formula.`,`Constant speed r for a time of 2π.`),
Q(`Why is the speed constant on x = r cos t, y = r sin t?`,[`sin² + cos² = 1, so it's always √(r²) = r`,`Because r is zero`,`Because t is constant`,`It isn't constant`],0,`Pythagoras identity.`),
QE(`d/dx arcsin x = …`,[`1/√(1 − x²)`,`1/(1 + x²)`,`cos x`,`−1/√(1 − x²)`],0,`Level 7.`),
T(`<h3>Key points</h3><ul><li><b>Speed = √(x′² + y′²)</b>.</li><li><b>L = ∫ √(x′² + y′²) dt</b>.</li><li>This proves C = 2πr.</li></ul>`)])
]});

U({id:'c11-2',track:'calc',level:11,title:'Polar coordinates',icon:'(r,θ)',color:'#1D9E75',desc:'Describing points by distance and angle, polar curves, and areas in polar.',lessons:[
LH('c11-2-1','Distance and angle',9,'Instead of across and up, say how far and in which direction.',[
RM(`<p>In a right-angled triangle: adjacent = hyp × cos θ, opposite = hyp × sin θ. Angles in calculus are in radians: π rad = 180°.</p>`),
T(`<h3>Polar coordinates</h3><p>A point is given by <b>(r, θ)</b>: its distance r from the origin and the angle θ measured anticlockwise from the positive x-axis.</p><div class="eq">x = r cos θ,&nbsp;&nbsp; y = r sin θ</div><div class="eq">r² = x² + y²,&nbsp;&nbsp; tan θ = y/x</div>`),
Q(`The point (r, θ) = (2, π/2) in x–y coordinates is…`,[`(0, 2)`,`(2, 0)`,`(2, 2)`,`(−2, 0)`],0,`Straight up: cos(π/2) = 0, sin(π/2) = 1.`),
W('calcDrill',{skill:'polar2cart',need:3},`Polar to Cartesian. Get 3 right to master it.`,`x = r cos θ, y = r sin θ.`),
T(`<h3>Going the other way</h3><p>(1, 1): r = √2 and tan θ = 1, so θ = π/4. Watch the quadrant: (−1, −1) also has tan θ = 1, but θ = 5π/4.</p>`),
Q(`Convert (0, −3) to polar.`,[`r = 3, θ = 3π/2`,`r = −3, θ = 0`,`r = 3, θ = π/2`,`r = 3, θ = π`],0,`Straight down.`),
T(`<h3>Key points</h3><ul><li><b>x = r cos θ, y = r sin θ</b>.</li><li><b>r² = x² + y², tan θ = y/x</b> (check the quadrant).</li><li>Good for anything circular: pipes, fuel rods, reactor cores.</li></ul>`)]),
LH('c11-2-2','Polar curves',10,'Equations like r = 1 + cos θ draw hearts, roses and spirals.',[
RM(`<p>(r, θ): distance and angle. x = r cos θ, y = r sin θ.</p>`),
T(`<h3>Simple ones</h3><ul><li><b>r = a</b>: a circle of radius a. (Much simpler than x² + y² = a².)</li><li><b>θ = α</b>: a straight line through the origin.</li><li><b>r = θ</b>: a spiral that grows as it turns.</li></ul>`),
W('fnPlot',{x:[-3,3],y:[-2.4,2.4],xl:'x',yl:'y',sl:[['a','a',0,2,0.1,1],['b','b',0,2,0.1,1],['n','n',1,5,1,1]],curves:function(){return []},marks:function(p,P,col){var c=P.c;c.strokeStyle=col('--accent');c.lineWidth=2.5;c.beginPath();for(var i=0;i<=720;i++){var t=i/720*2*Math.PI,r=p.a+p.b*Math.cos(p.n*t),X=P.X(r*Math.cos(t)),Y=P.Y(r*Math.sin(t));if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y)}c.stroke()},read:function(p){var nm=p.b===0?'a circle':p.a===0?'a rose with '+(p.n%2?p.n:2*p.n)+' petals':Math.abs(p.a-p.b)<1e-9&&p.n===1?'a cardioid (a heart)':'a limaçon-style curve';return 'r = '+p.a.toFixed(1)+' + '+p.b.toFixed(1)+' cos('+p.n+'θ): '+nm},goal:function(p){return p.a===0&&p.n>=2},goalMsg:'Set a to 0 and n to 2 or more to make a rose.'},`r = a + b cos(nθ). Explore: a = b = 1 with n = 1 is a cardioid; a = 0 makes a rose.`,`Cardioids, roses and limaçons all come from one simple equation.`),
T(`<h3>A circle through the origin</h3><p>r = 2 cos θ. Multiply by r: r² = 2r cos θ, so x² + y² = 2x, which is (x − 1)² + y² = 1: a circle of radius 1 centred at (1, 0).</p>`),
Q(`What does r = 5 describe?`,[`A circle of radius 5 centred at the origin`,`A straight line through the origin`,`The point (5, 0) only`,`A spiral`],0,`Every angle, distance 5.`),
Q(`r = cos 2θ is…`,[`a rose with 4 petals`,`a circle`,`a cardioid`,`a straight line`],0,`Even n gives 2n petals.`),
T(`<h3>Key points</h3><ul><li><b>r = a</b>: circle. <b>θ = α</b>: line. <b>r = θ</b>: spiral.</li><li><b>r = a(1 + cos θ)</b>: cardioid. <b>r = cos(nθ)</b>: rose.</li><li>Multiply by r to convert back to x and y.</li></ul>`)]),
LH('c11-2-3','Area in polar coordinates',10,'Slice a region into thin pizza slices instead of strips.',[
RM(`<p>A sector of angle θ (radians) in a circle of radius r has area ½r²θ. Integrals add up thin slices.</p>`),
T(`<h3>Thin sectors</h3><p>A thin slice with angle dθ and radius r is almost a sector, area ½r² dθ. Add them up:</p><div class="eq">Area = ½ ∫<sub>α</sub><sup>β</sup> r² dθ</div>`),
W('calcDrill',{skill:'polararea',need:3},`Polar areas. Get 3 right to master it.`,`½∫ r² dθ.`),
W('stepCalc',{steps:[`Area inside the cardioid r = 1 + cos θ`,`½∫<sub>0</sub><sup>2π</sup> (1 + cos θ)² dθ = ½∫ (1 + 2cos θ + cos²θ) dθ`,`Over a full turn: ∫ 1 dθ = 2π, ∫ cos θ dθ = 0, ∫ cos²θ dθ = π`,`= ½(2π + 0 + π)`,`<b>Area = 3π/2</b>`]},`The area of a cardioid.`,`cos²θ needed the double-angle identity from Level 8.`),
Q(`Why ½∫ r² dθ and not ∫ r dθ?`,[`Each thin slice is a sector with area ½r² dθ`,`Because r is always ½`,`Because polar areas are always halved`,`To make the answer smaller`],0,`Sector area.`),
QE(`Speed on x = 5t, y = 12t?`,[`13`,`17`,`7`,`60`],0,`√(25 + 144).`),
T(`<h3>Key points</h3><ul><li><b>Area = ½∫ r² dθ</b>.</li><li>Built from thin sectors.</li><li>Cardioid r = 1 + cos θ: area 3π/2.</li></ul>`)])
]});

U({id:'c11-3',track:'calc',level:11,title:'Vectors in 3D',icon:'a×b',color:'#378ADD',desc:'Vectors in space, the dot product, the cross product, and equations of lines and planes.',lessons:[
LH('c11-3-1','Vectors in three dimensions',9,'Calculus 3 lives in 3D. Vectors are how we move around in it.',[
RM(`<p>A 2D vector has components ⟨x, y⟩ and length √(x² + y²) by Pythagoras.</p>`),
T(`<h3>A third axis</h3><p>Add a z-axis at right angles to x and y. A vector in 3D has three components:</p><div class="eq">v = ⟨a, b, c⟩ = a<b>i</b> + b<b>j</b> + c<b>k</b></div>${KY([['i, j, k','unit vectors along x, y and z',''],['a, b, c','how far along each axis','']])}<p>Add and scale component by component: ⟨1, 2, 3⟩ + ⟨4, 0, −1⟩ = ⟨5, 2, 2⟩.</p>`),
Q(`2⟨1, −3, 4⟩ = …`,[`⟨2, −6, 8⟩`,`⟨3, −1, 6⟩`,`⟨2, −3, 4⟩`,`⟨1, −6, 8⟩`],0,`Multiply each component.`),
T(`<h3>Length</h3><p>Pythagoras twice gives the magnitude:</p><div class="eq">|⟨a, b, c⟩| = √(a² + b² + c²)</div><p>A <b>unit vector</b> has length 1: divide any vector by its length.</p>`),
W('calcDrill',{skill:'vmag',need:3},`Magnitudes in 3D. Get 3 right to master it.`,`√(a² + b² + c²).`),
Q(`The unit vector in the direction of ⟨0, 3, 4⟩ is…`,[`⟨0, 0.6, 0.8⟩`,`⟨0, 3, 4⟩`,`⟨0, 1, 1⟩`,`⟨0, 0.75, 1⟩`],0,`Length 5: divide by 5.`),
T(`<h3>Key points</h3><ul><li>3D vectors: <b>⟨a, b, c⟩ = ai + bj + ck</b>.</li><li><b>|v| = √(a² + b² + c²)</b>.</li><li>Unit vector: v ÷ |v|.</li></ul>`)]),
LH('c11-3-2','The dot product',10,'Multiply two vectors to get a number that tells you the angle between them.',[
RM(`<p>|v| = √(a² + b² + c²). Work = force × distance, when they point the same way.</p>`),
T(`<h3>Two formulas, one number</h3><div class="eq">a · b = a₁b₁ + a₂b₂ + a₃b₃ = |a||b| cos θ</div><p>The first is easy to compute; the second gives the meaning. θ is the angle between the vectors.</p>`),
W('calcDrill',{skill:'vdot',need:3},`Dot products. Get 3 right to master it.`,`Multiply matching parts, add.`),
T(`<h3>Perpendicular test</h3><p>cos 90° = 0, so <b>a · b = 0 exactly when a and b are perpendicular</b>. Positive: the angle is acute. Negative: obtuse.</p>`),
Q(`⟨1, 2, 3⟩ · ⟨3, 0, −1⟩ = 0. So the vectors are…`,[`perpendicular`,`parallel`,`equal`,`unit vectors`],0,`Zero dot product.`),
W('calcDrill',{skill:'vangle',need:2},`Angles between vectors. Get 2 right to master it.`,`cos θ = a·b/(|a||b|).`),
T(`<h3>Work</h3><p>Only the part of the force along the motion does work: <b>W = F · d</b>. Push a trolley at an angle and some of your effort is wasted pushing down.</p>`),
T(`<h3>Key points</h3><ul><li><b>a · b = a₁b₁ + a₂b₂ + a₃b₃ = |a||b|cos θ</b>.</li><li><b>a · b = 0 ⟺ perpendicular</b>.</li><li>Work W = F · d.</li></ul>`)]),
LH('c11-3-3','The cross product, lines and planes',11,'A vector at right angles to two others, and how to write the equation of a plane.',[
RM(`<p>a · b = 0 means perpendicular. Vectors add component by component.</p>`),
T(`<h3>The cross product</h3><p>a × b is a <b>vector</b> perpendicular to both a and b:</p><div class="eq">a × b = ⟨a₂b₃ − a₃b₂,&nbsp; a₃b₁ − a₁b₃,&nbsp; a₁b₂ − a₂b₁⟩</div><p>Its length is |a||b| sin θ: the <b>area of the parallelogram</b> a and b make. Its direction follows the right-hand rule.</p>`),
Q(`i × j = …`,[`k`,`−k`,`0`,`i + j`],0,`Right-hand rule.`),
W('calcDrill',{skill:'vcross',need:2},`Cross products. Get 2 right to master it.`,`Cover each column in turn.`),
T(`<h3>Lines</h3><p>A line through point a with direction d: <b>r = a + td</b>. As t varies, r slides along the line.</p>`),
T(`<h3>Planes</h3><p>A plane is set by a point r₀ on it and a <b>normal</b> n sticking straight out of it. Every vector lying in the plane is perpendicular to n:</p><div class="eq">n · (r − r₀) = 0 &nbsp;⟺&nbsp; ax + by + cz = d</div><p>where n = ⟨a, b, c⟩ and d = n · r₀. To find a normal from two directions in the plane, use their cross product.</p>`),
W('calcDrill',{skill:'plane',need:2},`Equations of planes. Get 2 right to master it.`,`d = n · (point).`),
T(`<h3>Key points</h3><ul><li><b>a × b</b> is perpendicular to both; length = parallelogram area.</li><li>Line: <b>r = a + td</b>.</li><li>Plane: <b>ax + by + cz = d</b> with normal ⟨a, b, c⟩.</li></ul>`)])
]});

F('c11-1-1',[Q(`x = cos t, y = sin t traces…`,[`the unit circle`,`a line`,`a parabola`,`a spiral`],0,`x² + y² = 1.`),Q(`x = t, y = t² is…`,[`y = x²`,`y = x`,`a circle`,`y = 2x`],0,`t = x.`),Q(`The parameter t often represents…`,[`time`,`area`,`gradient`,`radius`],0,`Time.`),Q(`At t = π, (cos t, sin t) is…`,[`(−1, 0)`,`(1, 0)`,`(0, 1)`,`(0, −1)`],0,`Half a turn.`),Q(`x = 4cos t, y = 4sin t has radius…`,[`4`,`16`,`2`,`8`],0,`r = 4.`)]);
F('c11-1-2',[GN('paramgrad'),GN('paramgrad'),Q(`Parametric dy/dx = …`,[`(dy/dt)/(dx/dt)`,`(dx/dt)/(dy/dt)`,`dy/dt × dx/dt`,`dy/dt − dx/dt`],0,`Chain rule.`),Q(`Horizontal tangent when…`,[`dy/dt = 0`,`dx/dt = 0`,`t = 1`,`x = 0`],0,`y stops changing.`),Q(`x = cos t, y = sin t. dy/dx = …`,[`−cot t`,`tan t`,`−tan t`,`cot t`],0,`cos t ÷ (−sin t).`)]);
F('c11-1-3',[N(`x = 6t, y = 8t. Speed?`,10,0.001,'',`√(36 + 64).`),Q(`Parametric arc length L = ∫ …`,[`√(x′² + y′²) dt`,`(x′ + y′) dt`,`x′y′ dt`,`y dx`],0,`Speed over time.`),N(`Length of x = 2cos t, y = 2sin t for t from 0 to π? (3 d.p.)`,6.283,0.002,'',`Half of 4π.`),Q(`Distance travelled = ∫ … dt`,[`speed`,`acceleration`,`position`,`time`],0,`Speed.`),Q(`On the unit circle the speed is…`,[`1`,`2π`,`0`,`t`],0,`r = 1.`)]);
F('c11-2-1',[GN('polar2cart'),GN('polar2cart'),Q(`r² = …`,[`x² + y²`,`x + y`,`xy`,`x² − y²`],0,`Pythagoras.`),Q(`(r, θ) = (4, π) is…`,[`(−4, 0)`,`(4, 0)`,`(0, 4)`,`(0, −4)`],0,`Half turn.`),Q(`tan θ = …`,[`y/x`,`x/y`,`r/x`,`xy`],0,`Opposite/adjacent.`)]);
F('c11-2-2',[Q(`r = 3 is…`,[`a circle of radius 3`,`a line`,`a spiral`,`a rose`],0,`Constant distance.`),Q(`r = 1 + cos θ is a…`,[`cardioid`,`circle`,`rose`,`line`],0,`Heart.`),Q(`r = cos 3θ has … petals`,[`3`,`6`,`9`,`1`],0,`Odd n: n petals.`),Q(`θ = π/4 is…`,[`a line through the origin`,`a circle`,`a point`,`a spiral`],0,`Fixed direction.`),Q(`r = 2cos θ is a circle centred at…`,[`(1, 0)`,`(0, 0)`,`(2, 0)`,`(0, 1)`],0,`(x − 1)² + y² = 1.`)]);
F('c11-2-3',[GN('polararea'),GN('polararea'),Q(`Polar area = …`,[`½∫ r² dθ`,`∫ r dθ`,`∫ r² dθ`,`2∫ r dθ`],0,`Sectors.`),N(`Area inside r = 2 (full turn)? (3 d.p.)`,12.566,0.002,'',`½ × 4 × 2π = 4π.`),Q(`Cardioid r = 1 + cos θ has area…`,[`3π/2`,`π`,`2π`,`π/2`],0,`Worked example.`)]);
F('c11-3-1',[GN('vmag'),GN('vmag'),Q(`⟨1, 2, 3⟩ + ⟨2, −2, 0⟩ = …`,[`⟨3, 0, 3⟩`,`⟨2, −4, 0⟩`,`⟨3, 4, 3⟩`,`⟨1, 0, 3⟩`],0,`Componentwise.`),Q(`A unit vector has length…`,[`1`,`0`,`any`,`√3`],0,`Unit.`),Q(`k points along the…`,[`z-axis`,`x-axis`,`y-axis`,`origin`],0,`i, j, k.`)]);
F('c11-3-2',[GN('vdot'),GN('vdot'),GN('vangle'),Q(`a · b = 0 means…`,[`perpendicular`,`parallel`,`equal`,`zero vectors`],0,`cos 90° = 0.`),Q(`a · b is a…`,[`number`,`vector`,`matrix`,`plane`],0,`Scalar.`)]);
F('c11-3-3',[GN('vcross'),GN('plane'),Q(`a × b is … to a and b`,[`perpendicular`,`parallel`,`equal`,`opposite`],0,`Normal.`),Q(`|a × b| is the area of…`,[`the parallelogram`,`the triangle`,`the circle`,`the square`],0,`|a||b|sin θ.`),Q(`2x − y + 3z = 7 has normal…`,[`⟨2, −1, 3⟩`,`⟨2, 1, 3⟩`,`⟨7, 0, 0⟩`,`⟨1, 1, 1⟩`],0,`Coefficients.`)]);
GOALS.calc11={icon:'🧊',title:'Step into three dimensions',story:'Each unit takes you further from flat y = f(x) graphs: curves traced over time, polar curves, then vectors in space.',final:'Ready for Calculus 3',steps:['Parametric curves','Polar coordinates','Vectors in 3D']};
