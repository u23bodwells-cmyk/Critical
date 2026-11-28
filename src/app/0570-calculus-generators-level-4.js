/* ---------------- Level 4: integration ---------------- */
CGEN.intpow=function(){var n=cR(0,5),a=(n+1)*cNZ(-3,4);
 return {p:'Find ∫ '+cT(a,n)+' dx.',b:[cB(a/(n+1),'','x','number in front'),cB(n+1,'','&nbsp;+ C','power',true)],e:'Add 1 to the power ('+n+' + 1 = '+(n+1)+'), then divide by the new power: '+cNum(a)+' ÷ '+(n+1)+' = '+cNum(a/(n+1))+'. Don\'t forget + C.'}};
CGEN.intneg=function(){var n=cR(2,4),a=(n-1)*cNZ(-3,4);
 return {p:'Find ∫ '+cT(a,-n)+' dx.',b:[cB(a/(1-n),'','x','number in front'),cB(1-n,'','&nbsp;+ C','power',true)],e:'Add 1 to the power: −'+n+' + 1 = '+cNum(1-n)+'. Divide by '+cNum(1-n)+': '+cNum(a)+' ÷ ('+cNum(1-n)+') = '+cNum(a/(1-n))+'.'}};
CGEN.intfrac=function(){var c=cP([[3,0.5],[6,0.5],[1.5,0.5],[5,1.5],[10,1.5],[2,-0.5],[4,-0.5]]),a=c[0],n=c[1];
 return {p:'Find ∫ '+cT(a,n)+' dx.',b:[cB(a/(n+1),'','x','number in front'),cB(n+1,'','&nbsp;+ C','power',true)],e:'New power '+cNum(n)+' + 1 = '+cNum(n+1)+'. Divide: '+cNum(a)+' ÷ '+cNum(n+1)+' = '+cNum(a/(n+1))+'.'}};
CGEN.defint=function(){var f=[[cNZ(-2,3)*3,2],[cR(-4,4)*2,1],[cR(-5,5),0]],a=cR(-2,1),b=a+cR(1,3),F=f.map(function(t){return [t[0]/(t[1]+1),t[1]+1]}),v=cEval(F,b)-cEval(F,a);
 return {p:'Evaluate ∫ from '+cNum(a)+' to '+cNum(b)+' of ('+cPoly(f)+') dx.',b:[cB(v,'= ')],e:'Integrate: '+cPoly(F)+'. Top limit minus bottom limit: ['+cNum(cEval(F,b))+'] − ['+cNum(cEval(F,a))+'] = '+cNum(v)+'.'}};
CGEN.area=function(){var k=cP([3,6,9,12]),b=cR(1,4),v=k*b*b*b/3;
 return {p:'Find the area under y = '+cT(k,2)+' between x = 0 and x = '+b+'.',b:[cB(v,'area = ')],e:'∫ '+cT(k,2)+' dx = '+cT(k/3,3)+'. From 0 to '+b+': '+cNum(k/3)+' × '+b+'³ − 0 = '+cNum(v)+'.'}};
CGEN.intexp=function(){var k=cP([2,4,5,10,0.5,-2,-4,-5]),a=cP([1,1,2,3]);
 return {p:'Find ∫ '+(a===1?'':a)+'e'+cSup(cT(k,1))+' dx. What number goes in front?',b:[cB(a/k,'','e'+cSup(cT(k,1))+' + C','number in front')],e:'∫ e'+cSup('kx')+' dx = (1/k)e'+cSup('kx')+'. So '+a+' ÷ '+cNum(k)+' = '+cNum(a/k)+'. Check by differentiating: '+cNum(a/k)+' × '+cNum(k)+' = '+a+'.'}};
CGEN.int1x=function(){var k=cR(1,4),a=cR(1,5);return {p:'Evaluate ∫ from 1 to e'+(k===1?'':cSup(k))+' of '+(a===1?'1':a)+'/x dx.',b:[cB(a*k,'= ')],e:'∫ '+a+'/x dx = '+(a===1?'':a)+'ln x. So '+a+'(ln e'+(k===1?'':cSup(k))+' − ln 1) = '+a+'('+k+' − 0) = '+(a*k)+'.'}};
CGEN.intlin=function(){var c=cP([[1,3],[2,4],[1,9],[2,9],[5,3],[1,4],[4,4],[2,3]]),a=c[0],n=c[1],b=cNZ(-5,5),co=1/(a*(n+1)),inner='('+cPoly([[a,1],[b,0]])+')';
 return {p:'Find ∫ '+inner+cSup(n)+' dx.',b:[cB(co,'',inner,'number in front'),cB(n+1,'','&nbsp;+ C','power',true)],e:'Raise the power to '+(n+1)+', then divide by the new power AND by the '+a+' in front of x: 1 ÷ ('+(n+1)+' × '+a+') = '+cNum(co)+'.'}};
CGEN.subst=function(){var n=cP([3,4,9]);return {p:'Use the substitution u = x² + 1 to find ∫ 2x(x² + 1)'+cSup(n)+' dx.',b:[cB(1/(n+1),'','(x² + 1)','number in front'),cB(n+1,'','&nbsp;+ C','power',true)],e:'du = 2x dx, so it becomes ∫ u'+cSup(n)+' du = u'+cSup(n+1)+'/'+(n+1)+'. Put x back: '+cNum(1/(n+1))+'(x² + 1)'+cSup(n+1)+' + C.'}};
CGEN.parts=function(){var a=cP([1,2,3]),v=(a-1)*Math.exp(a)+1;return {p:'Using integration by parts, evaluate ∫ from 0 to '+a+' of x·e'+cSup('x')+' dx. Give your answer to 2 decimal places.',b:[cB(Math.round(v*100)/100,'= ','','answer',false,0.005)],e:'u = x, dv = e'+cSup('x')+'dx: ∫ = xe'+cSup('x')+' − e'+cSup('x')+' = (x − 1)e'+cSup('x')+'. From 0 to '+a+': ('+(a-1)+')e'+(a===1?'':cSup(a))+' − (−1) = '+cNum(Math.round(v*100)/100)+'.'}};

