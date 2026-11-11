# Builds critical.html (small) + app/part-N.txt from critical.src.html, so no single download is huge.
# Run after editing critical.src.html:  python3 tools/split.py
import os, glob
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(R, 'critical.src.html'), encoding='utf-8').read()
a = s.find('<script>', 90000); b = s.find('</script>', a); body = s[a + 8:b]
for f in glob.glob(os.path.join(R, 'app', 'part-*.txt')): os.remove(f)
N = 200000; parts = [body[i:i + N] for i in range(0, len(body), N)]
import hashlib; v = hashlib.md5(body.encode()).hexdigest()[:8]
for i, p in enumerate(parts): open(os.path.join(R, 'app', 'part-%d.txt' % i), 'w', encoding='utf-8').write(p)
loader = """<div id="bootMsg" style="position:fixed;inset:0;display:grid;place-items:center;font:600 16px system-ui,sans-serif;color:#cfe3ff;z-index:1">Loading Critical… <span id="bootN">0</span>/%d</div>
<script>(function(){var n=%d,v='%s',got=[],done=0,M=document.getElementById('bootMsg');
function one(i,t){return fetch('app/part-'+i+'.txt?v='+v,{cache:t>1?'reload':'default'}).then(function(r){if(!r.ok)throw 0;return r.text()}).catch(function(){if(t<6)return new Promise(function(r){setTimeout(r,600*t)}).then(function(){return one(i,t+1)});throw 0})}
var ps=[];for(var i=0;i<n;i++)(function(i){ps.push(one(i,1).then(function(x){got[i]=x;document.getElementById('bootN').textContent=++done}))})(i);
Promise.all(ps).then(function(){var sc=document.createElement('script');sc.text=got.join('');M.remove();document.body.appendChild(sc)}).catch(function(){M.innerHTML='<div style="text-align:center">Couldn\\u2019t download Critical: the connection kept dropping.<br><br><button onclick="location.reload()" style="font:inherit;padding:10px 18px;border-radius:10px;border:0;background:#534AB7;color:#fff">Try again</button></div>'})})();</script>""" % (len(parts), len(parts), v)
open(os.path.join(R, 'critical.html'), 'w', encoding='utf-8').write(s[:a] + loader + s[b + 9:])
sw = open(os.path.join(R, 'sw.js'), encoding='utf-8').read()
import re
sw = re.sub(r"(,'\./app/part-\d+\.txt')*(?=\];)", "", sw, count=1)
sw = sw.replace("'./icons/apple-touch-icon.png']", "'./icons/apple-touch-icon.png'" + ''.join(",'./app/part-%d.txt'" % i for i in range(len(parts))) + "]")
open(os.path.join(R, 'sw.js'), 'w', encoding='utf-8').write(sw)
print(len(parts), 'parts, page', len(s[:a]) + len(loader) + len(s[b + 9:]), 'bytes')
