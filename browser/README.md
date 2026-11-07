# Critical Browser

A study browser for Windows built around [Critical](https://u23bodwells-cmyk.github.io/Critical/critical.html).

- **TikTok, YouTube Shorts and social sites are blocked until today's Critical plan is done.** Then everything unlocks until tomorrow.
- **Plan time:** it opens itself on your study screen with Critical and Claude side by side. On Firm (the default) or Harsh it won't close, and comes back if you minimise it, until the plan is done. There's a slow "Let me off today" exit.
- **Claude built in:** a side panel (Ctrl+Shift+C). Select anything and press **Ask Claude** (Ctrl+Shift+A) to send it straight to Claude.
- Starts with Windows and waits by the clock. Updates itself from GitHub releases.

## Install
Download `Critical-Browser-Setup-x.y.z.exe` from the [latest release](https://github.com/u23bodwells-cmyk/Critical/releases/latest) and run it. Windows may say "Windows protected your PC" because the app isn't signed: click **More info → Run anyway**.

## How it knows your plan
Critical (the first tab) tells the browser how today's plan is going, the same way it tells the Critical Focus Chrome extension. The first time, turn on sync in Critical (Progress → Settings) so your progress from Chrome appears here too.

## Building
GitHub Actions builds it on Windows (`.github/workflows/browser.yml`): it runs a self-test (`electron . --self-test`), then builds the installer with electron-builder and publishes a release.
