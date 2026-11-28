/* ---------- GCSE Maths ---------- */
EQ('gm1-1','Number skills','Work these out without a calculator.',[
 ['n','Work out −3 × (4 − 10).',18,0,'',2,'Brackets first: 4 − 10 = −6. Then −3 × −6 = 18.'],
 ['n','Find the highest common factor (HCF) of 36 and 60.',12,0,'',1,'36 = 2² × 3², 60 = 2² × 3 × 5. Common: 2² × 3 = 12.'],
 ['c','Write 84 as a product of its prime factors.',['2² × 3 × 7','4 × 21','2 × 42','2 × 3 × 14'],1,'84 = 2 × 42 = 2 × 2 × 21 = 2² × 3 × 7.']]);
EQ('gm1-2','Algebra basics','',[
 ['n','Solve 3x + 7 = 22.',5,0,'x =',2,'3x = 15, so x = 5.'],
 ['n','Find the value of 2a² − b when a = 3 and b = 4.',14,0,'',2,'2 × 3² − 4 = 18 − 4 = 14.'],
 ['c','Find the nth term of the sequence 5, 8, 11, 14, …',['3n + 2','n + 3','3n + 5','5n + 3'],1,'It goes up in 3s, so 3n. When n = 1, 3n = 3, and we need 5: add 2.']]);
EQ('gm1-3','Fractions, decimals and percentages','',[
 ['n','Work out 3/4 + 2/5. Give your answer as a decimal.',1.15,0.001,'',2,'15/20 + 8/20 = 23/20 = 1.15.'],
 ['n','Find 15% of 240.',36,0,'',1,'10% = 24, 5% = 12, so 15% = 36.'],
 ['c','Write 0.375 as a fraction in its simplest form.',['3/8','37/100','375/100','3/4'],1,'0.375 = 375/1000 = 3/8.']]);
EQ('gm1-4','Shapes and angles','',[
 ['n','Two angles in a triangle are 47° and 68°. Find the third angle.',65,0,'°',1,'180 − 47 − 68 = 65°.'],
 ['n','A trapezium has parallel sides of 6 cm and 10 cm and a height of 4 cm. Find its area.',32,0,'cm²',2,'½ × (6 + 10) × 4 = 32 cm².'],
 ['s','Explain why the angles in any quadrilateral add up to 360°.',2,['A diagonal splits the quadrilateral into two triangles','The angles in each triangle add to 180°, so 2 × 180° = 360°']]]);
EQ('gm2-1','Indices, standard form and bounds','',[
 ['n','2³ × 2⁵ = 2ⁿ. Find n.',8,0,'n =',1,'Add the powers: 3 + 5 = 8.'],
 ['n','Work out (3 × 10⁴) × (4 × 10⁵). Give your answer in standard form.',1.2e10,0.001,'',2,'3 × 4 = 12 and 10⁴ × 10⁵ = 10⁹: 12 × 10⁹ = 1.2 × 10¹⁰.'],
 ['n','A length is 8.4 cm, correct to 1 decimal place. Write down its upper bound.',8.45,0.001,'cm',1,'Half of 0.1 is 0.05: the upper bound is 8.45 cm.'],
 ['n','√50 can be written as k√2. Find k.',5,0,'k =',2,'√50 = √25 × √2 = 5√2.']]);
EQ('gm2-2','Quadratics and simultaneous equations','',[
 ['n','Solve x² − 5x + 6 = 0. Give the larger solution.',3,0,'x =',2,'(x − 2)(x − 3) = 0, so x = 2 or 3.'],
 ['n','Solve 2x + y = 11 and x − y = 1. What is x?',4,0,'x =',3,'Add the equations: 3x = 12, so x = 4 (and y = 3).'],
 ['c','Factorise x² − 9.',['(x − 3)(x + 3)','(x − 3)²','(x − 9)(x + 1)','x(x − 9)'],1,'Difference of two squares: a² − b² = (a − b)(a + b).']]);
EQ('gm2-3','Percentages and ratio','',[
 ['n','£800 is increased by 15%, then the new amount is decreased by 15%. Find the final amount.',782,0.001,'£',2,'800 × 1.15 × 0.85 = £782. (Not back to £800!)'],
 ['n','£4000 is invested at 3% compound interest per year. Find its value after 2 years.',4243.6,0.0005,'£',2,'4000 × 1.03² = £4243.60.'],
 ['n','£120 is shared in the ratio 3 : 5. Find the larger share.',75,0,'£',2,'8 parts = £120, so 1 part = £15. The larger share is 5 × 15 = £75.']]);
EQ('gm2-4','Pythagoras, trigonometry and volume','',[
 ['n','A right-angled triangle has shorter sides of 9 cm and 12 cm. Find the hypotenuse.',15,0,'cm',2,'√(9² + 12²) = √225 = 15 cm.'],
 ['n','In a right-angled triangle the side opposite angle x is 5 cm and the hypotenuse is 10 cm. Find x.',30,0.001,'°',2,'sin x = 5 ÷ 10 = 0.5, so x = 30°.'],
 ['n','Find the volume of a cylinder with radius 3 cm and height 10 cm. Give your answer to 1 decimal place.',282.7,0.001,'cm³',2,'π × 3² × 10 = 90π ≈ 282.7 cm³.']]);
EQ('gm2-5','Bearings and constructions','',[
 ['c','The bearing of A from B is 070°. What is the bearing of B from A?',['250°','070°','110°','290°'],1,'Add 180°: 070° + 180° = 250°.'],
 ['n','A map has a scale of 1 : 50 000. Two towns are 4 cm apart on the map. How far apart are they in real life, in km?',2,0.001,'km',2,'4 × 50 000 = 200 000 cm = 2000 m = 2 km.'],
 ['s','Describe how to construct the perpendicular bisector of a line AB with a ruler and compasses.',3,['Open the compasses to more than half of AB and draw arcs above and below the line from A','Keep the same radius and draw arcs from B that cross the first two','Draw a straight line through the two crossing points']]]);
EQ('gm3-1','Lines and quadratics','',[
 ['n','Find the gradient of the line through (1, 3) and (4, 12).',3,0,'',2,'(12 − 3) ÷ (4 − 1) = 9 ÷ 3 = 3.'],
 ['n','x² + 6x + 2 = (x + 3)² − k. Find k.',7,0,'k =',2,'(x + 3)² = x² + 6x + 9, so x² + 6x + 2 = (x + 3)² − 7.'],
 ['n','Solve 2x² − 3x − 4 = 0. Give the positive solution to 2 decimal places.',2.35,0.002,'x =',3,'x = (3 + √(9 + 32)) ÷ 4 = (3 + √41) ÷ 4 ≈ 2.35.']]);
EQ('gm3-2','Circles and the cosine rule','',[
 ['c','What is the angle in a semicircle?',['90°','180°','45°','60°'],1,'The angle subtended by a diameter at the circumference is a right angle.'],
 ['n','A triangle has sides of 7 cm and 9 cm with an angle of 60° between them. Find the third side to 2 decimal places.',8.19,0.002,'cm',3,'c² = 7² + 9² − 2 × 7 × 9 × cos 60° = 49 + 81 − 63 = 67, so c ≈ 8.19 cm.'],
 ['n','Two similar shapes have a length scale factor of 3. What is the area scale factor?',9,0,'',1,'Areas scale by the square: 3² = 9.']]);
EQ('gm3-3','Probability','A bag holds 3 red and 5 blue counters.',[
 ['n','Two fair coins are thrown. Find the probability of two heads.',0.25,0.001,'',1,'½ × ½ = ¼.'],
 ['n','Two counters are taken from the bag without replacement. Find the probability that both are red, to 3 decimal places.',0.107,0.01,'',3,'3/8 × 2/7 = 6/56 ≈ 0.107.'],
 ['c','A and B are independent. P(A) = 0.3 and P(B) = 0.5. What is P(A and B)?',['0.15','0.8','0.2','0.65'],1,'Independent: multiply. 0.3 × 0.5 = 0.15.']]);
EQ('gm3-4','Averages and spread','',[
 ['n','Find the mean of 4, 7, 9, 12, 13.',9,0,'',1,'45 ÷ 5 = 9.'],
 ['n','A box plot has a lower quartile of 12 and an upper quartile of 27. Find the interquartile range.',15,0,'',1,'27 − 12 = 15.'],
 ['s','Class A has median 62 and IQR 20; class B has median 55 and IQR 8. Compare the two classes.',2,['Compare an average in context: class A did better on average (higher median)','Compare spread in context: class B\'s marks are more consistent (smaller IQR)']]]);
EQ('gm4-1','Harder number and algebra','',[
 ['n','v² = u² + 2as. Find a when u = 4, v = 10 and s = 7.',6,0.001,'a =',2,'a = (v² − u²) ÷ 2s = (100 − 16) ÷ 14 = 6.'],
 ['n','6/√3 can be written as k√3. Find k.',2,0,'k =',2,'6/√3 × √3/√3 = 6√3 / 3 = 2√3.'],
 ['n','After a 20% discount a jacket costs £64. What was the original price?',80,0.001,'£',2,'£64 is 80% of the original: 64 ÷ 0.8 = £80.']]);
EQ('gm4-2','Geometry problems','',[
 ['n','A cuboid measures 3 cm by 4 cm by 12 cm. Find the length of its longest diagonal.',13,0.001,'cm',2,'√(3² + 4² + 12²) = √169 = 13 cm.'],
 ['n','Two similar solids have lengths in the ratio 2 : 3. The smaller has a volume of 40 cm³. Find the volume of the larger.',135,0.001,'cm³',2,'Volume scale factor = (3/2)³ = 27/8. 40 × 27/8 = 135 cm³.'],
 ['n','A sector has radius 6 cm and angle 60°. Find its arc length to 2 decimal places.',6.28,0.002,'cm',2,'60/360 × 2π × 6 = 2π ≈ 6.28 cm.']]);
EQ('gm4-3','Probability and data problems','',[
 ['n','A fair dice is rolled twice. Find the probability of at least one six, to 3 decimal places.',0.306,0.005,'',2,'1 − (5/6)² = 11/36 ≈ 0.306.'],
 ['n','A histogram bar has frequency density 2.5 and class width 8. What is the frequency?',20,0,'',2,'Frequency = frequency density × class width = 2.5 × 8 = 20.'],
 ['s','A survey asks only people leaving a gym how often they exercise. Explain why the sample is biased.',1,['It is not random / not representative: people at a gym probably exercise more than average']]]);
EQ('gm4-4','Mixed exam questions','',[
 ['n','Without a calculator, work out 2.4 × 0.3.',0.72,0.001,'',1,'24 × 3 = 72, with two decimal places: 0.72.'],
 ['n','Estimate (49.7 × 3.98) ÷ 0.51 by rounding each number to 1 significant figure.',400,0.001,'',2,'(50 × 4) ÷ 0.5 = 200 ÷ 0.5 = 400.'],
 ['n','A car worth £12 000 loses 15% of its value each year. Find its value after 3 years.',7369.5,0.001,'£',2,'12 000 × 0.85³ = £7369.50.']]);
EQ('gm5-1','Algebraic proof','',[
 ['n','(2n + 1)² − (2n − 1)² simplifies to kn. Find k.',8,0,'k =',2,'4n² + 4n + 1 − (4n² − 4n + 1) = 8n.'],
 ['s','Prove that the sum of any three consecutive integers is a multiple of 3.',3,['Call the integers n, n + 1 and n + 2','Their sum is 3n + 3','3n + 3 = 3(n + 1), which is a multiple of 3']]]);
EQ('gm5-2','Graphs and circles','',[
 ['c','The graph of y = f(x) is transformed to y = f(x) + 3. Describe the transformation.',['A translation 3 units up','A translation 3 units right','A stretch by scale factor 3','A reflection in the x-axis'],1,'Adding outside the function moves the graph up.'],
 ['n','The circle x² + y² = 25 passes through (3, 4). Find the gradient of the tangent at (3, 4).',-0.75,0.001,'',3,'Radius gradient = 4/3. The tangent is perpendicular: −3/4 = −0.75.'],
 ['c','Describe the transformation from y = f(x) to y = f(−x).',['A reflection in the y-axis','A reflection in the x-axis','A translation left','A rotation of 180°'],1,'Replacing x with −x reflects the graph in the y-axis.']]);
EQ('gm5-3','Hardest geometry','',[
 ['n','A circle has radius 10 cm. Find the area of the segment cut off by a 90° sector, to 2 decimal places.',28.54,0.002,'cm²',3,'Sector = ¼π × 10² = 25π ≈ 78.54. Triangle = ½ × 10 × 10 = 50. Segment ≈ 28.54 cm².'],
 ['n','A cuboid has a base 6 cm by 8 cm and height 5 cm. Find the angle between the long diagonal and the base, to 2 decimal places.',26.57,0.002,'°',3,'Base diagonal = √(6² + 8²) = 10. tan θ = 5/10, so θ ≈ 26.57°.']]);
EQ('gm5-4','Hardest problems','',[
 ['n','Solve 2x² + x − 10 = 0. Give the positive solution.',2,0.001,'x =',2,'(2x + 5)(x − 2) = 0, so x = 2 or x = −2.5.'],
 ['n','A rectangle has a perimeter of 26 cm and an area of 40 cm². Find the length of the longer side.',8,0.001,'cm',3,'x + y = 13 and xy = 40, so x² − 13x + 40 = 0: (x − 5)(x − 8) = 0. The sides are 5 and 8 cm.'],
 ['c','For any whole number n, n² + n is always…',['Even','Odd','Prime','A square number'],1,'n² + n = n(n + 1), a product of two consecutive integers, one of which must be even.']]);
