/* ---------------- Level 2: differentiation ---------------- */
CGEN.chord=function(){var a=cR(1,5),h=cP([1,0.5,0.1,0.01]),g=2*a+h;
 return {p:'On y = x², find the gradient of the chord from x = '+a+' to x = '+cNum(a+h)+'.',b:[cB(g,'gradient = ')],e:'(('+cNum(a+h)+')² − '+a+'²) ÷ '+cNum(h)+' = '+cNum(g)+'. In general it\'s 2 × '+a+' + h, which gets closer to '+(2*a)+' as h shrinks.'}};
CGEN.fpx2=function(){var a=cNZ(-4,6);return {p:'Using first principles, the gradient of y = x² at x = a is the limit of (2a + h) as h → 0. What is the gradient at x = '+cNum(a)+'?',b:[cB(2*a,'gradient = ')],e:'As h → 0, 2a + h → 2a = 2 × '+cNum(a)+' = '+cNum(2*a)+'.'}};
CGEN.power=function(){var n=cP([2,3,4,5,6,7,-1,-2,-3]),a=cNZ(-6,8);
 return {p:'Differentiate y = '+cT(a,n)+'.',b:[cB(a*n,'dy/dx = ','x','number in front'),cB(n-1,'','','power',true)],e:'Multiply by the power, then take 1 off the power: '+cNum(a)+' × '+cNum(n)+' = '+cNum(a*n)+', and '+cNum(n)+' − 1 = '+cNum(n-1)+'. So dy/dx = '+cT(a*n,n-1)+'.'}};
CGEN.powfrac=function(){var c=cP([[0.5,2],[0.5,4],[1.5,2],[1.5,4],[-0.5,2],[-0.5,6],[-1,3],[2.5,2]]),n=c[0],a=c[1];
 return {p:'Differentiate y = '+cT(a,n)+'.',b:[cB(a*n,'dy/dx = ','x','number in front'),cB(n-1,'','','power',true)],e:'Same rule: '+cNum(a)+' × '+cNum(n)+' = '+cNum(a*n)+', and '+cNum(n)+' − 1 = '+cNum(n-1)+'.'}};
CGEN.rewrite=function(){var a=cR(2,9),n=cR(1,4);
 return {p:'Differentiate y = '+a+'/x'+(n===1?'':cSup(n))+'. Rewrite it as a power of x first.',b:[cB(-n*a,'dy/dx = ','x','number in front'),cB(-n-1,'','','power',true)],e:a+'/x'+(n===1?'':cSup(n))+' = '+cT(a,-n)+'. Then '+a+' × (−'+n+') = '+cNum(-n*a)+' and −'+n+' − 1 = '+cNum(-n-1)+'.'}};
CGEN.polyval=function(){var f=[[cNZ(-2,3),3],[cR(-4,4),2],[cR(-6,6),1],[cR(-9,9),0]],k=cR(-2,3),d=cDer(f),v=cEval(d,k);
 return {p:'f(x) = '+cPoly(f)+'. Find f′('+cNum(k)+').',b:[cB(v,'f′('+cNum(k)+') = ')],e:'f′(x) = '+cPoly(d)+'. Then put x = '+cNum(k)+' in: f′('+cNum(k)+') = '+cNum(v)+'.'}};
CGEN.const0=function(){var c=cNZ(-20,40);return {p:'Differentiate y = '+cNum(c)+'.',b:[cB(0,'dy/dx = ')],e:'A constant never changes, so its gradient is 0. A horizontal line.'}};
CGEN.tangent=function(){var a=cNZ(-2,3),b=cR(-5,5),c=cR(-6,6),k=cR(-2,3),f=[[a,2],[b,1],[c,0]],m=2*a*k+b,y=cEval(f,k),ic=y-m*k;
 return {p:'Find the tangent to y = '+cPoly(f)+' at x = '+cNum(k)+', in the form y = mx + c.',b:[cB(m,'y = ','x','gradient m'),cB(ic,' + ','','intercept c')],e:'dy/dx = '+cPoly([[2*a,1],[b,0]])+', so m = '+cNum(m)+' at x = '+cNum(k)+'. The point is ('+cNum(k)+', '+cNum(y)+'). Then c = y − mx = '+cNum(y)+' − '+cNum(m)+' × '+cNum(k)+' = '+cNum(ic)+'.'}};
CGEN.normal=function(){var m=cP([2,-2,4,-4,5,-5,10,0.5,-0.5,0.25,-0.25]);return {p:'A tangent has gradient '+cNum(m)+'. What is the gradient of the normal at the same point?',b:[cB(-1/m,'normal gradient = ')],e:'Normal gradient = −1 ÷ tangent gradient = −1 ÷ '+cNum(m)+' = '+cNum(-1/m)+'. The two gradients multiply to −1.'}};
CGEN.incdec=function(){var f=[[1,2],[cR(-6,6),1],[cR(-5,5),0]],k=cR(-5,5),d=2*k+f[1][0];
 var o=d>0?['Increasing','Decreasing','Stationary']:d<0?['Decreasing','Increasing','Stationary']:['Stationary','Increasing','Decreasing'];
 return {p:'y = '+cPoly(f)+'. At x = '+cNum(k)+', is y increasing, decreasing or stationary?',o:o,e:'dy/dx = '+cPoly([[2,1],[f[1][0],0]])+' = '+cNum(d)+' at x = '+cNum(k)+'. '+(d>0?'Positive gradient: increasing.':d<0?'Negative gradient: decreasing.':'Zero gradient: stationary.')}};
CGEN.gradat=function(){var n=cP([2,3,4]),k=cNZ(-3,3),v=n*Math.pow(k,n-1);return {p:'What is the gradient of y = x'+cSup(n)+' at x = '+cNum(k)+'?',b:[cB(v,'gradient = ')],e:'dy/dx = '+cT(n,n-1)+'. At x = '+cNum(k)+': '+n+' × ('+cNum(k)+')'+(n-1===1?'':cSup(n-1))+' = '+cNum(v)+'.'}};

