/* ---------------- Level 1: ready for calculus ---------------- */
CGEN.fsub=function(){var a=cNZ(-3,4),b=cR(-6,6),c=cR(-9,9),k=cR(-3,4),f=[[a,2],[b,1],[c,0]],v=cEval(f,k);
 return {p:'f(x) = '+cPoly(f)+'. Find f('+cNum(k)+').',b:[cB(v,'f('+cNum(k)+') = ','','answer')],e:'Put '+cNum(k)+' in place of every x: '+cSubst(f,k)+' = '+cNum(v)+'. Square the bracket first, including its sign.'}};
CGEN.flin=function(){var a=cNZ(-5,6),b=cR(-9,9),k=cR(-4,6),v=a*k+b;return {p:'g(x) = '+cPoly([[a,1],[b,0]])+'. What is g('+cNum(k)+')?',b:[cB(v,'g('+cNum(k)+') = ')],e:cSubst([[a,1],[b,0]],k)+' = '+cNum(v)+'.'}};
CGEN.idxlaw=function(){var t=cR(0,2),a=cR(2,9),b=cR(2,7);
 if(t===0)return {p:'Simplify x'+cSup(a)+' × x'+cSup(b)+'.',b:[cB(a+b,'x','','power',true)],e:'Multiplying: <b>add</b> the powers. '+a+' + '+b+' = '+(a+b)+'.'};
 if(t===1){var A=a+b;return {p:'Simplify x'+cSup(A)+' ÷ x'+cSup(b)+'.',b:[cB(a,'x','','power',true)],e:'Dividing: <b>subtract</b> the powers. '+A+' − '+b+' = '+a+'.'}}
 var c=cR(2,4);return {p:'Simplify (x'+cSup(a)+')'+cSup(c)+'.',b:[cB(a*c,'x','','power',true)],e:'A power of a power: <b>multiply</b> the powers. '+a+' × '+c+' = '+(a*c)+'.'}};
CGEN.idxneg=function(){var n=cR(1,5),t=cR(0,1);
 if(t===0)return {p:'Write 1/x'+(n===1?'':cSup(n))+' as a power of x.',b:[cB(-n,'x','','power',true)],e:'1 over x to a power = x to the <b>negative</b> power. So 1/x'+(n===1?'':cSup(n))+' = x'+cSup(-n)+'.'};
 var a=cR(2,9);return {p:'Write '+a+'/x'+(n===1?'':cSup(n))+' in the form a·x<sup>n</sup>.',b:[cB(a,'','x','number in front'),cB(-n,'','','power',true)],e:'The number stays on top; the x moves up with a negative power: '+a+'x'+cSup(-n)+'.'}};
CGEN.idxfrac=function(){var c=cP([['√x',0.5,'A square root is the power ½ = 0.5.'],['1/√x',-0.5,'√x is x<sup>0.5</sup>, and 1 over it makes the power negative: x<sup>−0.5</sup>.'],['x√x',1.5,'x × x<sup>0.5</sup>: add the powers, 1 + 0.5 = 1.5.'],['x²√x',2.5,'x² × x<sup>0.5</sup>: 2 + 0.5 = 2.5.'],['√x / x',-0.5,'x<sup>0.5</sup> ÷ x<sup>1</sup>: 0.5 − 1 = −0.5.'],['1/(x√x)',-1.5,'x√x = x<sup>1.5</sup>, so 1 over it is x<sup>−1.5</sup>.']]);
 return {p:'Write '+c[0]+' as a power of x. Use a decimal for the power.',b:[cB(c[1],'x','','power',true)],e:c[2]}};
CGEN.idxval=function(){var c=cP([['9<sup>0.5</sup>',3,'Power 0.5 means square root: √9 = 3.'],['16<sup>0.5</sup>',4,'√16 = 4.'],['4<sup>−1</sup>',0.25,'A negative power means 1 over: 1/4 = 0.25.'],['2<sup>−3</sup>',0.125,'1/2³ = 1/8 = 0.125.'],['4<sup>1.5</sup>',8,'Square root first, then cube: √4 = 2, 2³ = 8.'],['25<sup>1.5</sup>',125,'√25 = 5, 5³ = 125.'],['100<sup>−0.5</sup>',0.1,'1/√100 = 1/10 = 0.1.'],['5<sup>0</sup>',1,'Anything (except 0) to the power 0 is 1.'],['10<sup>−2</sup>',0.01,'1/10² = 0.01.']]);
 return {p:'Work out '+c[0]+' as a decimal.',b:[cB(c[1],'','','answer')],e:c[2]}};
CGEN.gradpts=function(){var x1=cR(-4,3),dx=cR(1,5),m=cNZ(-4,5),y1=cR(-6,6),x2=x1+dx,y2=y1+m*dx;
 return {p:'Find the gradient of the line through ('+cNum(x1)+', '+cNum(y1)+') and ('+cNum(x2)+', '+cNum(y2)+').',b:[cB(m,'gradient = ')],e:'Change in y ÷ change in x = ('+cNum(y2)+' − '+cBr(y1)+') ÷ ('+cNum(x2)+' − '+cBr(x1)+') = '+cNum(y2-y1)+' ÷ '+dx+' = '+cNum(m)+'.'}};
CGEN.gradeq=function(){var m=cNZ(-5,6),c=cR(-8,8),t=cR(0,2);
 if(t===0)return {p:'What is the gradient of y = '+cPoly([[m,1],[c,0]])+'?',b:[cB(m,'gradient = ')],e:'In y = mx + c, the number in front of x is the gradient: '+cNum(m)+'.'};
 if(t===1)return {p:'What is the gradient of y = '+cPoly([[c,0],[m,1]])+'?',b:[cB(m,'gradient = ')],e:'The order doesn\'t matter. The gradient is the number multiplying x: '+cNum(m)+'.'};
 var k=cP([2,3,4]);return {p:'What is the gradient of '+k+'y = '+cPoly([[k*m,1],[k*c,0]])+'?',b:[cB(m,'gradient = ')],e:'Divide everything by '+k+' first: y = '+cPoly([[m,1],[c,0]])+'. Gradient '+cNum(m)+'.'}};
CGEN.avgrate=function(){var a=cNZ(-2,3),c=cR(-5,5),x1=cR(-2,2),x2=x1+cR(1,4),f=[[a,2],[c,0]],y1=cEval(f,x1),y2=cEval(f,x2),r=(y2-y1)/(x2-x1);
 return {p:'f(x) = '+cPoly(f)+'. Find the average rate of change of f from x = '+cNum(x1)+' to x = '+cNum(x2)+'.',b:[cB(r,'average rate = ')],e:'f('+cNum(x2)+') = '+cNum(y2)+', f('+cNum(x1)+') = '+cNum(y1)+'. Rate = ('+cNum(y2)+' − '+cBr(y1)+') ÷ ('+cNum(x2)+' − '+cBr(x1)+') = '+cNum(r)+'. That\'s the gradient of the chord between the two points.'}};
CGEN.speed=function(){var k=cP([2,3,4,5]),t1=cR(0,3),t2=t1+cR(1,3),s1=k*t1*t1,s2=k*t2*t2,v=(s2-s1)/(t2-t1);
 return {p:'An object\'s distance is s = '+k+'t² metres after t seconds. Find its average speed between t = '+t1+' and t = '+t2+' s.',b:[cB(v,'','m/s','average speed')],e:'s('+t2+') = '+s2+' m and s('+t1+') = '+s1+' m. Average speed = '+(s2-s1)+' ÷ '+(t2-t1)+' = '+cNum(v)+' m/s.'}};

