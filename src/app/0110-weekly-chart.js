/* ===== ease end ===== */

/* ----- weekly chart ----- */
function weekChart(){var days=[],mx=S.goal;for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=dstr(d),v=S.hist[k]||0;days.push([d,v,k]);if(v>mx)mx=v}mx*=1.15;
 var W=420,H=170,pl=8,pb=26,bw=(W-pl*2)/7,s='<svg viewBox="0 0 '+W+' '+H+'" class="week" role="img" aria-label="XP earned over the last 7 days">',gy=H-pb-(S.goal/mx)*(H-pb-18);
 days.forEach(function(x,i){var h=(x[1]/mx)*(H-pb-18),bx=pl+i*bw+bw*0.18,met=x[1]>=S.goal,isT=i===6;
  s+='<rect x="'+bx+'" y="'+(H-pb-Math.max(h,x[1]?3:0))+'" width="'+bw*0.64+'" height="'+Math.max(h,x[1]?3:0)+'" rx="5" fill="'+(met?'#e8742a':'var(--accent)')+'" fill-opacity="'+(isT?1:0.75)+'"/>'+
   (x[1]?'<text x="'+(bx+bw*0.32)+'" y="'+(H-pb-h-5)+'" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="system-ui">'+x[1]+'</text>':'')+
   '<text x="'+(bx+bw*0.32)+'" y="'+(H-8)+'" text-anchor="middle" font-size="12" font-weight="'+(isT?700:400)+'" fill="var(--'+(isT?'text':'muted')+')" font-family="system-ui">'+(isT?'Today':x[0].toLocaleDateString('en-GB',{weekday:'short'}))+'</text>'});
 s+='<line x1="'+pl+'" x2="'+(W-pl)+'" y1="'+gy+'" y2="'+gy+'" stroke="#e8742a" stroke-dasharray="5 4" stroke-width="1.5"/><text x="'+(pl+2)+'" y="'+(gy-5)+'" text-anchor="start" font-size="11" fill="#e8742a" font-family="system-ui">goal '+S.goal+'</text></svg>';
 var tot=days.reduce(function(a,x){return a+x[1]},0),met=days.filter(function(x){return x[1]>=S.goal}).length;return {svg:s,tot:tot,met:met}}

if($('pSound')){$('pSound').onclick=toggleSound;soundBtnUpd()}

