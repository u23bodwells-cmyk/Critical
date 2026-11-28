#!/usr/bin/env node
/* Runs every browser test against a fresh build of Critical and prints a pass/fail summary.
     node tests/run.js              all tests (the lesson sweep covers a sample of units)
     FULL=1 node tests/run.js       the lesson sweep covers every unit (slow)
     node tests/run.js symbols      only tests whose name contains "symbols"
   Needs Node, Python 3 and Playwright with Chromium. */
const {spawnSync}=require('child_process'),path=require('path'),fs=require('fs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'.out'),E2E=path.join(__dirname,'e2e');
const filt=process.argv[2]||'';
let r=spawnSync('python3',[path.join(ROOT,'tools','build.py'),'--check'],{encoding:'utf8'});
if(r.status!==0){console.log(r.stdout+r.stderr+'\nBuild first: python3 tools/build.py');process.exit(1)}
r=spawnSync('python3',[path.join(__dirname,'make_copy.py')],{encoding:'utf8'});if(r.status!==0){console.log(r.stdout+r.stderr);process.exit(1)}
const SWEEP=process.env.FULL?'.':'^(th1|th3|th8|t2-3|qm1-1|qm2-3|gp2-1|gp2-4|ap3-4|mq22-1|mq23-2|maths|nuclear)$';
const BAD=[/pageerror/i,/\bTypeError\b/,/\bReferenceError\b/,/\bSyntaxError\b/,/triggerUncaughtException/,/Timeout \d+ms exceeded/,/\bBAD\b/,/PLAYER CLOSED/,/did not open/];
const files=fs.readdirSync(E2E).filter(f=>f.endsWith('.js')&&f.includes(filt)).sort();let fails=0;const t0=Date.now();
for(const f of files){const args=[path.join(E2E,f),OUT];if(f==='lesson-sweep.js')args.push(SWEEP);const s=Date.now();
 const p=spawnSync('node',args,{encoding:'utf8',timeout:15*60*1000,cwd:ROOT});const out=(p.stdout||'')+(p.stderr||'');
 const why=[];if(p.status!==0)why.push('exit '+p.status);BAD.forEach(re=>{if(re.test(out))why.push(String(re))});
 const em=out.match(/errs \[([\s\S]*?)\]/);if(em&&em[1].replace(/'Failed to load resource[^']*'/g,'').replace(/[\s,]/g,'').length)why.push('page errors');
 const er=out.match(/errors: (.*)/);if(er&&!/^none/.test(er[1]))why.push('errors: '+er[1].slice(0,60));
 const pr=out.match(/problems: (\S+)/);if(pr&&pr[1]!=='none')why.push('problems: '+pr[1]);
 const ok=!why.length;if(!ok)fails++;console.log((ok?'PASS ':'FAIL ')+f.padEnd(30)+((Date.now()-s)/1000).toFixed(0).padStart(4)+'s'+(ok?'':'  '+why.join('; ')));
 if(!ok||process.env.VERBOSE)console.log(out.split('\n').slice(-25).map(l=>'    '+l.slice(0,220)).join('\n'))}
console.log('\n'+(files.length-fails)+'/'+files.length+' passed in '+Math.round((Date.now()-t0)/1000)+'s');process.exit(fails?1:0);
