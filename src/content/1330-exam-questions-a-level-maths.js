/* ---------- A-level Maths ---------- */
EQ('am1-1','Algebra fluency','',[
 ['n','Evaluate 8^(2/3).',4,0,'',1,'Cube root of 8 is 2; 2² = 4.'],
 ['n','Solve 2^(x + 1) = 32.',4,0,'x =',1,'32 = 2⁵, so x + 1 = 5.'],
 ['n','x² − 8x + 3 = (x − 4)² + q. What is the minimum value of x² − 8x + 3?',-13,0,'',2,'(x − 4)² − 16 + 3 = (x − 4)² − 13. The minimum is −13, at x = 4.']]);
EQ('am1-2','Lines and simultaneous equations','',[
 ['n','A line passes through (2, 5) with gradient 3. Find its y-intercept.',-1,0,'',2,'y − 5 = 3(x − 2) → y = 3x − 1.'],
 ['n','Solve y = x² − 2 and y = x + 4. Give the positive value of x.',3,0,'x =',3,'x² − 2 = x + 4 → x² − x − 6 = 0 → (x − 3)(x + 2) = 0.'],
 ['c','Solve x² − 4x − 5 < 0.',['−1 < x < 5','x < −1 or x > 5','x < 5','−5 < x < 1'],1,'(x − 5)(x + 1) < 0 between the roots.']]);
EQ('am2-1','Proof and polynomials','',[
 ['n','kx² + 4x + 1 = 0 has equal roots. Find k.',4,0,'k =',2,'b² − 4ac = 0 → 16 − 4k = 0 → k = 4.'],
 ['n','(x − 2) is a factor of x³ − 3x² + ax + 2. Find a.',1,0,'a =',2,'f(2) = 8 − 12 + 2a + 2 = 0 → a = 1.'],
 ['s','Disprove the statement "n² + n + 41 is prime for every positive integer n".',2,['Find a counter-example: n = 40 gives 1681 (or n = 41 gives 1763)','1681 = 41² (1763 = 41 × 43) is not prime, so the statement is false']]]);
EQ('am2-2','Circles, trig and the binomial','',[
 ['n','Find the radius of the circle x² + y² − 6x + 4y − 12 = 0.',5,0,'',2,'(x − 3)² + (y + 2)² = 12 + 9 + 4 = 25, so r = 5.'],
 ['n','Solve sin x = 0.5 for 0° ≤ x ≤ 180°. Give the larger solution.',150,0,'°',2,'x = 30° or 180° − 30° = 150°.'],
 ['n','Find the coefficient of x² in the expansion of (1 + 2x)⁶.',60,0,'',2,'⁶C₂ × 2² = 15 × 4 = 60.']]);
EQ('am2-3','Calculus and logs','',[
 ['n','y = 2x³ − 3x² − 12x. Find the x-coordinate of the local minimum.',2,0,'x =',3,'dy/dx = 6x² − 6x − 12 = 6(x − 2)(x + 1). d²y/dx² = 12x − 6 > 0 at x = 2.'],
 ['n','Evaluate ∫₁³ (3x² + 2) dx.',30,0,'',2,'[x³ + 2x]₁³ = (27 + 6) − (1 + 2) = 30.'],
 ['n','Solve e^(2x) = 10. Give your answer to 3 decimal places.',1.151,0.001,'x =',2,'2x = ln 10, so x = ln 10 ÷ 2 ≈ 1.151.']]);
EQ('am2-4','Statistics and mechanics','X ~ B(10, 0.3).',[
 ['n','Find P(X = 3) to 3 decimal places.',0.267,0.005,'',2,'¹⁰C₃ × 0.3³ × 0.7⁷ = 120 × 0.027 × 0.0824 ≈ 0.267.'],
 ['c','A test checks whether p has increased from 0.3. What is H₁?',['p > 0.3','p = 0.3','p < 0.3','p ≠ 0.3'],1,'"Increased" means a one-tailed test with H₁: p > 0.3.'],
 ['n','A particle starts from rest with acceleration 2.5 m/s². How far does it go in 4.0 s?',20,0.001,'m',2,'s = ut + ½at² = 0 + 0.5 × 2.5 × 16 = 20 m.']]);
EQ('am3-1','Functions and series','f(x) = 2x + 3 and g(x) = x².',[
 ['n','Find fg(2).',11,0,'',1,'g(2) = 4, then f(4) = 11.'],
 ['n','Find f⁻¹(11).',4,0,'',1,'f⁻¹(x) = (x − 3) ÷ 2, so f⁻¹(11) = 4.'],
 ['n','A geometric series has first term 12 and common ratio 1/3. Find its sum to infinity.',18,0.001,'',2,'S∞ = a ÷ (1 − r) = 12 ÷ (2/3) = 18.'],
 ['n','Find the coefficient of x³ in the expansion of (1 + x)⁻¹.',-1,0,'',1,'(1 + x)⁻¹ = 1 − x + x² − x³ + …']]);
EQ('am3-2','Radians and R cos(θ − α)','',[
 ['n','Convert 150° to radians, to 3 decimal places.',2.618,0.001,'',1,'150 × π ÷ 180 = 5π/6 ≈ 2.618.'],
 ['n','3 cos θ + 4 sin θ = R cos(θ − α). Find R.',5,0,'R =',2,'R = √(3² + 4²) = 5.'],
 ['n','Find α in degrees, to 2 decimal places.',53.13,0.001,'°',2,'tan α = 4/3, so α ≈ 53.13°.']]);
EQ('am3-3','Further calculus','',[
 ['n','Find d/dx (x²eˣ) at x = 1, to 3 decimal places.',8.155,0.002,'',2,'Product rule: (2x + x²)eˣ. At x = 1: 3e ≈ 8.155.'],
 ['n','Evaluate ∫₀¹ x eˣ dx.',1,0.001,'',3,'By parts: [x eˣ − eˣ]₀¹ = (e − e) − (0 − 1) = 1.'],
 ['n','dy/dx = 3y and y = 2 when x = 0. Find y when x = 1, to 2 decimal places.',40.17,0.002,'y =',2,'y = 2e^(3x). At x = 1: 2e³ ≈ 40.17.']]);
EQ('am3-4','Normal distribution and mechanics','X ~ N(50, 4²).',[
 ['n','Find P(X < 56) to 4 decimal places.',0.9332,0.002,'',2,'z = (56 − 50) ÷ 4 = 1.5. Φ(1.5) = 0.9332.'],
 ['n','A 5.0 kg block on a rough horizontal floor (μ = 0.3) is pulled by a horizontal 20 N force. g = 9.8. Find its acceleration.',1.06,0.01,'m/s²',3,'Friction = μmg = 0.3 × 5 × 9.8 = 14.7 N. a = (20 − 14.7) ÷ 5 = 1.06 m/s².'],
 ['n','A projectile is launched at 20 m/s at 30° above horizontal ground. g = 9.8. Find its time of flight, to 2 decimal places.',2.04,0.01,'s',2,'Vertical speed = 20 sin 30° = 10 m/s. Time = 2 × 10 ÷ 9.8 ≈ 2.04 s.']]);
EQ('am4-1','Proof and modelling','A population is modelled by P = 500e^(0.04t), where t is in years.',[
 ['n','How long does the population take to double, to 2 decimal places?',17.33,0.002,'years',2,'e^(0.04t) = 2 → t = ln 2 ÷ 0.04 ≈ 17.33 years.'],
 ['s','Prove by contradiction that √2 is irrational.',3,['Assume √2 = a/b where a and b are integers with no common factors','Then a² = 2b², so a² is even and a is even; write a = 2k, so 4k² = 2b² and b² = 2k²','So b is even too: a and b share a factor of 2, a contradiction, so √2 is irrational']]]);
EQ('am4-2','Exam technique','',[
 ['c','A question asks for an "exact" answer. What does that mean?',['Leave it in surd, π or ln form, not as a rounded decimal','Give it to 3 significant figures','Give it as a fraction only','Round to the nearest whole number'],1,'Exact means no rounding: e.g. 2√3 or ln 5.'],
 ['n','Find the exact value of ∫₁^e (1/x) dx.',1,0,'',1,'[ln x]₁^e = ln e − ln 1 = 1 − 0 = 1.'],
 ['c','X is a continuous random variable with a normal distribution. What is P(X = 5)?',['0','0.5','It depends on the mean','1'],1,'For a continuous variable the probability of any single exact value is 0.']]);
