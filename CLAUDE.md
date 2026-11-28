# Critical: how this repo is put together

Critical is an installable web app (PWA) that has to keep working on iPhone/iPad (Safari, added to the
Home Screen), Windows (Chrome/Edge) and Chromebooks. Keep it a plain static site: no server, no
framework, nothing that needs installing to run it. `index.html` is the main menu; `critical.html` is
the study app; `chain.html` and the other `*.html` files are separate apps that share `localStorage`.

## Editing the Critical study app

The source is split into files under `src/`:

- `src/app/` holds the features (player, plan, gym, On the go, storage safety, ...).
- `src/content/` holds the lessons, follow-ups, test pools and exam questions, by subject and level.
- `src/shell/head.html` and `src/shell/tail.html` hold the page around the main script.
- `src/manifest.json` lists every file in the order they are joined.

All the files are joined into one script inside one shared scope (one big IIFE). So:

- **Order matters.** A file can use variables and wrappers from files listed *before* it.
  Function declarations are hoisted, so they can be used from anywhere.
- New features usually go in a new file listed just before `src/app/9990-startup.js` (the startup
  code must stay last).
- Many features add behaviour by wrapping an existing function, e.g.
  `var finish_x=finish;finish=function(){...;return finish_x.apply(this,arguments)}`. Keep that
  pattern: always call the previous version.

After editing anything in `src/`:

```bash
python3 tools/build.py
```

That writes `critical.src.html` (generated: don't edit it by hand) and then runs `tools/split.py`,
which writes `critical.html`, `app/part-N.txt` and updates the file list in `sw.js`. Commit all of
those together.

If something edited `critical.src.html` directly, `tools/build.py` refuses to overwrite it. Run
`python3 tools/srcsplit.py` to copy those edits into `src/`, then build. `python3 tools/build.py --check`
just checks the two are in step.

Adding a file: create it (it must end with a newline), add it to `src/manifest.json` at the right
position with a `marker` (its first line, or the start of it), then build.

## Tests

```bash
node tests/run.js            # every browser test (Playwright + Chromium), with a summary
node tests/run.js symbols    # only tests whose file name contains "symbols"
FULL=1 node tests/run.js     # the lesson sweep opens every lesson (slow)
```

`tests/make_copy.py` builds test copies of the app in `tests/.out/` with a `window.__T` hook that the
tests in `tests/e2e/` use. Run the suite before merging anything that touches `src/`.

## Saved data

Everything is in `localStorage` under keys starting `critical_` (the main menu, sync and Chain read
some of these directly, so don't rename or move them). `src/app/1500-storage-safety.js` keeps a
backup copy of all of them in IndexedDB (`critical_backup`), asks the browser for persistent storage,
warns if a save fails, and offers a restore if progress goes missing. Restoring is on the Progress page
under Data safety.

## Branches

Work on the session's feature branch, then merge into `main` (fast-forward after merging `main` in).
If `main` moved, merge it, run `python3 tools/build.py` (or `tools/split.py` if `src/` wasn't
touched) and keep both sides' file lists in `sw.js`.
