#!/usr/bin/env python3
"""Copy edits made directly to critical.src.html back into the files in src/.

Use this if something edited critical.src.html instead of src/ (an older tool, another session).
It cuts critical.src.html at the same places as before: each file in src/manifest.json starts at its
'marker' line, found in order. It refuses to run if src/ also has unbuilt edits (so nothing is lost).
"""
import hashlib, json, os, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R, 'tools'))
import build  # noqa: E402


def main():
    s = build.rd('critical.src.html')
    m = json.loads(build.rd('src/manifest.json'))
    last = open(build.HASH).read().strip() if os.path.exists(build.HASH) else None
    cur_src = build.assemble()
    if cur_src == s:
        print('src/ already matches critical.src.html: nothing to do')
        return
    if last and build.md5(cur_src) != last and '--force' not in sys.argv:
        sys.exit('srcsplit: src/ has edits that were never built, and critical.src.html was edited too.\n'
                 '  Sort that out by hand (or --force to let critical.src.html win).')
    a = s.find('<script>', 90000) + 8
    b = s.find('</script>', a)
    head, body, tail = s[:a], s[a:b], s[b:]
    if head != build.rd(m['head']) or tail != build.rd(m['tail']):
        # the page around the main script changed: keep those too
        for key, val in (('head', head), ('tail', tail)):
            with open(os.path.join(R, m[key]), 'w', encoding='utf-8', newline='') as f:
                f.write(val)
    L = body.split('\n')
    starts, pos = [], 0
    for p in m['pieces']:
        mk = p['marker']
        i = pos
        while i < len(L) and L[i][:len(mk)] != mk:
            i += 1
        if i >= len(L):
            sys.exit('srcsplit: could not find the start of %s (its first line changed).\n'
                     '  Fix its "marker" in src/manifest.json to match, then run again.' % p['file'])
        starts.append(i)
        pos = i + 1
    starts.append(len(L))
    for k, p in enumerate(m['pieces']):
        with open(os.path.join(R, p['file']), 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(L[starts[k]:starts[k + 1]]) + '\n')
    if build.assemble() != s:
        sys.exit('srcsplit: round trip failed (this should not happen); src/ is unchanged in git, use git checkout src/')
    with open(build.HASH, 'w') as f:
        f.write(build.md5(s) + '\n')
    print('copied the edits from critical.src.html into src/')


if __name__ == '__main__':
    main()
