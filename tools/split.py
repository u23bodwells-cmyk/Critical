# Builds critical.html (small) + app/part-N.txt from critical.src.html, so no single download is huge.
# Run after editing critical.src.html:  python3 tools/split.py
import os, glob
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(R, 'critical.src.html'), encoding='utf-8').read()
a = s.find('<script>', 90000); b = s.find('</script>', a); body = s[a + 8:b]
for f in glob.glob(os.path.join(R, 'app', 'part-*.txt')): os.remove(f)
N = 200000; parts = [body[i:i + N] for i in range(0, len(body), N)]
import hashlib, json; L = json.dumps([len(p.encode('utf-16-le')) // 2 for p in parts]); v = hashlib.md5(body.encode()).hexdigest()[:8]
for i, p in enumerate(parts): open(os.path.join(R, 'app', 'part-%d.txt' % i), 'w', encoding='utf-8').write(p)
loader = """<div id="bootMsg" style="position:fixed;inset:0;display:grid;place-items:center;font:600 16px system-ui,sans-serif;color:#cfe3ff;z-index:1">Loading Critical… <span id="bootN">0</span>/%d</div>
<script>(function(){var n=%d,v='%s',L=%s,got=[],done=0,M=document.getElementById('bootMsg');
function one(i,t){return fetch('app/part-'+i+'.txt?v='+v+(t>1?'&r='+Date.now():''),{cache:t>1?'reload':'default'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(x){if(x.length!==L[i])throw 0;return x}).catch(function(){if(t<6)return new Promise(function(r){setTimeout(r,600*t)}).then(function(){return one(i,t+1)});throw 0})}
var ps=[];for(var i=0;i<n;i++)(function(i){ps.push(one(i,1).then(function(x){got[i]=x;document.getElementById('bootN').textContent=++done}))})(i);
Promise.all(ps).then(function(){var sc=document.createElement('script');sc.text=got.join('');M.remove();var t0=Date.now();addEventListener('error',function(e){var m=(e.message||'error')+' @'+e.lineno+':'+e.colno;try{localStorage.setItem('critical_lasterr',new Date().toISOString()+' '+m)}catch(_){}if(Date.now()-t0>5000||document.getElementById('bootErr'))return;var d=document.createElement('div');d.id='bootErr';d.style.cssText='position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:#0b0f14;color:#e8eef4;font:16px system-ui,sans-serif;text-align:center';d.innerHTML='<div><p><b>Critical hit a problem while starting.</b></p><p style=opacity:.7;font-size:13px></p><button id=bootFix style=\"font:inherit;padding:10px 18px;border-radius:10px;border:0;background:#534AB7;color:#fff;margin:4px\">Reload fresh</button><button id=bootSkip style=\"font:inherit;padding:10px 18px;border-radius:10px;border:0;background:#333;color:#fff;margin:4px\">Carry on anyway</button></div>';d.getElementsByTagName('p')[1].textContent=m;document.body.appendChild(d);document.getElementById('bootSkip').onclick=function(){d.remove()};document.getElementById('bootFix').onclick=function(){Promise.all([window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}):0,navigator.serviceWorker?navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}):0]).catch(function(){}).then(function(){location.reload()})}});document.body.appendChild(sc)}).catch(function(){M.innerHTML='<div style="text-align:center">Couldn\\u2019t download Critical: the connection kept dropping.<br><br><button onclick="location.reload()" style="font:inherit;padding:10px 18px;border-radius:10px;border:0;background:#534AB7;color:#fff">Try again</button></div>'})})();</script>""" % (len(parts), len(parts), v, L)
open(os.path.join(R, 'critical.html'), 'w', encoding='utf-8').write(s[:a] + loader + s[b + 9:])
sw = open(os.path.join(R, 'sw.js'), encoding='utf-8').read()
import re
sw = re.sub(r"(,'\./app/part-\d+\.txt')*(?=\];)", "", sw, count=1)
sw = sw.replace("'./icons/apple-touch-icon.png']", "'./icons/apple-touch-icon.png'" + ''.join(",'./app/part-%d.txt'" % i for i in range(len(parts))) + "]")
open(os.path.join(R, 'sw.js'), 'w', encoding='utf-8').write(sw)
print(len(parts), 'parts, page', len(s[:a]) + len(loader) + len(s[b + 9:]), 'bytes')
