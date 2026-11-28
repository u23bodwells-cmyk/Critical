/* ---------------- Level 3: differentiation toolkit ---------------- */
CGEN.statq=function(){var a=cNZ(-3,3),x0=cR(-4,4),b=-2*a*x0,c=cR(-8,8),f=[[a,2],[b,1],[c,0]],y0=cEval(f,x0);
 return {p:'Find the stationary point of y = '+cPoly(f)+'.',b:[cB(x0,'(',', ','x'),cB(y0,'',')','y')],e:'dy/dx = '+cPoly([[2*a,1],[b,0]])+' = 0 gives x = '+cNum(x0)+'. Then y = '+cNum(y0)+'. It\'s a '+(a>0?'minimum':'maximum')+' because the x² term is '+(a>0?'positive':'negative')+'.'}};
CGEN.statnat=function(){var p=cR(1,3),q=cR(-5,5),f=[[1,3],[-3*p*p,1],[q,0]],which=cR(0,1),x=which?p:-p,f2=6*x;
 return {p:'y = '+cPoly(f)+' has stationary points at x = −'+p+' and x = '+p+'. What kind of point is at x = '+cNum(x)+'?',o:f2>0?['A minimum','A maximum','Neither']:['A maximum','A minimum','Neither'],e:'d²y/dx² = 6x = '+cNum(f2)+' at x = '+cNum(x)+'. '+(f2>0?'Positive: the curve bends up like a smile, so it\'s a minimum.':'Negative: the curve bends down, so it\'s a maximum.')}};
CGEN.second=function(){var f=[[cNZ(-2,3),3],[cR(-4,4),2],[cR(-6,6),1],[cR(-9,9),0]],k=cR(-3,3),d1=cDer(f),d2=cDer(d1),v=cEval(d2,k);
 return {p:'f(x) = '+cPoly(f)+'. Find f″('+cNum(k)+').',b:[cB(v,'f″('+cNum(k)+') = ')],e:'f′(x) = '+cPoly(d1)+', so f″(x) = '+cPoly(d2)+'. At x = '+cNum(k)+': '+cNum(v)+'.'}};
CGEN.expd=function(){var a=cNZ(-4,5),k=cNZ(-4,5);return {p:'Differentiate y = '+(a===1?'':a===-1?'−':cNum(a))+'e'+cSup(cT(k,1))+'.',b:[cB(a*k,'dy/dx = ','e'+cSup(cT(k,1)),'number in front')],e:'d/dx of e'+cSup('kx')+' is k·e'+cSup('kx')+'. So '+cNum(a)+' × '+cNum(k)+' = '+cNum(a*k)+'.'}};
CGEN.lnd=function(){var a=cR(1,6),k=cP([2,4,5,10]),v=a/k;return {p:'y = '+(a===1?'':a)+'ln x. Find dy/dx at x = '+k+'.',b:[cB(v,'dy/dx = ')],e:'d/dx (ln x) = 1/x, so dy/dx = '+a+'/x. At x = '+k+': '+a+' ÷ '+k+' = '+cNum(v)+'.'}};
CGEN.trigd=function(){var t=cR(0,3);
 if(t===0)return {p:'What is d/dx (sin x)?',o:['cos x','−cos x','sin x','−sin x'],e:'The derivative of sin x is cos x (x in radians).'};
 if(t===1)return {p:'What is d/dx (cos x)?',o:['−sin x','sin x','cos x','−cos x'],e:'The derivative of cos x is <b>minus</b> sin x.'};
 var a=cNZ(-4,5),k=cNZ(-3,4);if(t===2)return {p:'Find the gradient of y = '+(a===1?'':a===-1?'−':cNum(a))+'sin('+cT(k,1)+') at x = 0.',b:[cB(a*k,'gradient = ')],e:'dy/dx = '+cCo(a*k)+'cos('+cT(k,1)+'), and cos 0 = 1, so the gradient is '+cNum(a*k)+'.'};
 return {p:'Find the gradient of y = '+(a===1?'':a===-1?'−':cNum(a))+'cos('+cT(k,1)+') at x = 0.',b:[cB(0,'gradient = ')],e:'dy/dx = '+cCo(-a*k)+'sin('+cT(k,1)+'), and sin 0 = 0, so the gradient is 0. Cos is at a peak or trough at x = 0.'}};
CGEN.chain=function(){var a=cNZ(-3,5),b=cNZ(-6,6),n=cR(2,6),inner='('+cPoly([[a,1],[b,0]])+')';
 return {p:'Differentiate y = '+inner+cSup(n)+'.',b:[cB(n*a,'dy/dx = ',inner,'number in front'),cB(n-1,'','','power',true)],e:'Chain rule: bring the power down, take 1 off it, then multiply by the derivative of the bracket ('+cNum(a)+'). '+n+' × '+cBr(a)+' = '+cNum(n*a)+'.'}};
CGEN.chainexp=function(){var a=cNZ(-3,4),b=cR(-5,5);return {p:'Differentiate y = e'+cSup(cPoly([[a,1],[b,0]]))+'. What number goes in front?',b:[cB(a,'dy/dx = ','e'+cSup(cPoly([[a,1],[b,0]])),'number in front')],e:'The derivative of the power, '+cPoly([[a,1],[b,0]])+', is '+cNum(a)+'. That multiplies the e-term.'}};
CGEN.product=function(){var m=cR(1,3),c=cNZ(-3,3),n=cR(1,3),k=cR(-2,2),u=Math.pow(k,m),du=m*Math.pow(k,m-1),w=Math.pow(k+c,n),dw=n*Math.pow(k+c,n-1),v=du*w+u*dw;
 return {p:'f(x) = '+cT(1,m)+'('+cPoly([[1,1],[c,0]])+')'+(n===1?'':cSup(n))+'. Use the product rule to find f′('+cNum(k)+').',b:[cB(v,'f′('+cNum(k)+') = ')],e:'u = '+cT(1,m)+', v = ('+cPoly([[1,1],[c,0]])+')'+(n===1?'':cSup(n))+'. f′ = u′v + uv′ = ('+cNum(du)+')('+cNum(w)+') + ('+cNum(u)+')('+cNum(dw)+') = '+cNum(v)+'.'}};
CGEN.quotient=function(){var a=cR(-5,5),b,k,d;do{b=cR(-5,5);k=cR(0,4);d=k+b}while(b===a||[1,2,4,5,10].indexOf(Math.abs(d))<0);var v=(b-a)/(d*d);
 return {p:'f(x) = (x '+(a<0?'− '+(-a):'+ '+a)+') / (x '+(b<0?'− '+(-b):'+ '+b)+'). Use the quotient rule to find f′('+k+').',b:[cB(v,'f′('+k+') = ')],e:'f′ = (v·u′ − u·v′) ÷ v² = ((x '+(b<0?'− '+(-b):'+ '+b)+') − (x '+(a<0?'− '+(-a):'+ '+a)+')) ÷ (x '+(b<0?'− '+(-b):'+ '+b)+')² = '+cNum(b-a)+' ÷ '+cNum(d*d)+' = '+cNum(v)+'.'}};
CGEN.kin=function(){var a=cR(1,3),b=cR(-6,6),k=cR(1,4),t=cR(0,1),s=[[a,3],[b,2]],v=cEval(cDer(s),k),ac=cEval(cDer(cDer(s)),k);
 if(t===0)return {p:'Displacement s = '+cPoly(s,'t')+' metres. Find the velocity at t = '+k+' s.',b:[cB(v,'v = ','m/s','velocity')],e:'v = ds/dt = '+cPoly(cDer(s),'t')+'. At t = '+k+': '+cNum(v)+' m/s.'};
 return {p:'Displacement s = '+cPoly(s,'t')+' metres. Find the acceleration at t = '+k+' s.',b:[cB(ac,'a = ','m/s²','acceleration')],e:'v = '+cPoly(cDer(s),'t')+', a = dv/dt = '+cPoly(cDer(cDer(s)),'t')+'. At t = '+k+': '+cNum(ac)+' m/s².'}};
CGEN.optim=function(){var t=cR(0,1);
 if(t===0){var P=cP([20,24,36,40,48,60,80]),s=P/4;return {p:'A rectangle has a perimeter of '+P+' m. What is the largest area it can have?',b:[cB(s*s,'','m²','area')],e:'Sides x and '+(P/2)+' − x. Area A = x('+(P/2)+' − x). dA/dx = '+(P/2)+' − 2x = 0 gives x = '+cNum(s)+'. A square! Area = '+cNum(s)+'² = '+cNum(s*s)+' m².'}}
 var L=cP([20,40,60,80,100]),x=L/4;return {p:'A farmer has '+L+' m of fence to make a rectangular pen against a long wall (the wall is one side). What is the largest area?',b:[cB(L*L/8,'','m²','area')],e:'Two sides x, one side '+L+' − 2x. A = x('+L+' − 2x). dA/dx = '+L+' − 4x = 0 gives x = '+cNum(x)+'. Area = '+cNum(x)+' × '+cNum(L-2*x)+' = '+cNum(L*L/8)+' m².'}};

