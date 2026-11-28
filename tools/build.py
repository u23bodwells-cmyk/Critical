#!/usr/bin/env python3
"""Build Critical from the files in src/.

    python3 tools/build.py            join src/ into critical.src.html, then run tools/split.py
    python3 tools/build.py --check    only check that src/ and critical.src.html match (exit 1 if not)

src/manifest.json lists the files in order. They are joined exactly as they are, so the
order matters: a file can use anything defined in a file before it (they all share one scope).

Safety: if critical.src.html was edited directly since the last build (so it no longer matches
src/.built-hash), the build stops instead of overwriting those edits. Pull them into src/ first:
    python3 tools/srcsplit.py
"""
import hashlib, json, os, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(R, 'critical.src.html')
HASH = os.path.join(R, 'src', '.built-hash')


def rd(p):
    with open(os.path.join(R, p), encoding='utf-8', newline='') as f:
        return f.read()


def md5(t):
    return hashlib.md5(t.encode('utf-8')).hexdigest()


def assemble():
    m = json.loads(rd('src/manifest.json'))
    body = ''
    for p in m['pieces']:
        t = rd(p['file'])
        if not t.endswith('\n'):
            sys.exit('build: %s must end with a newline' % p['file'])
        body += t
    return rd(m['head']) + body[:-1] + rd(m['tail'])


def main():
    html = assemble()
    cur = rd('critical.src.html') if os.path.exists(SRC) else None
    if '--check' in sys.argv:
        ok = cur == html
        print('src/ and critical.src.html match' if ok else 'MISMATCH: src/ and critical.src.html differ')
        sys.exit(0 if ok else 1)
    last = open(HASH).read().strip() if os.path.exists(HASH) else None
    if cur is not None and cur != html and last and md5(cur) != last and '--force' not in sys.argv:
        sys.exit('build: critical.src.html was edited directly since the last build.\n'
                 '  Run  python3 tools/srcsplit.py  to copy those edits into src/ first,\n'
                 '  or   python3 tools/build.py --force  to throw them away.')
    if cur != html:
        with open(SRC, 'w', encoding='utf-8', newline='') as f:
            f.write(html)
    with open(HASH, 'w') as f:
        f.write(md5(html) + '\n')
    print('critical.src.html built from src/ (%d files, %s)' % (len(json.loads(rd('src/manifest.json'))['pieces']), 'changed' if cur != html else 'no changes'))
    subprocess.check_call([sys.executable, os.path.join(R, 'tools', 'split.py')])


if __name__ == '__main__':
    main()
