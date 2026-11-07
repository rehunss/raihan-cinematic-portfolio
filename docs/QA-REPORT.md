# Quality assurance

## Scope

Windows and Chrome were used for local checks. The GitHub workflow builds on Linux using Node 22 and Playwright Chromium. The redesigned branch is the test target.

## Evidence

- The two prototype shots were rendered and visually inspected before the rest of the world was connected.
- Desktop captures cover all eight stops. Mobile captures include arrival, TIRIZ, impact and departure. The individual images and contact sheet are in `qa/v5/`.
- In the first production suite, Chrome passed the persistent canvas, translation, orientation, scroll hold, reverse, modal restoration, WebGL context loss and archive evidence checks. That run served unprerendered HTML to the no-JavaScript test, and found an undersized mobile accordion summary. A clean build followed by a rerun passed all 21 checks, including the no-JavaScript path and mobile touch targets. Axe reported zero violations at 390, 768, 1440 and 1920 px in the tested views.
- Professional evidence and the existing ten-page PDF share unchanged data. The suite checks the original public file hashes, download paths, chart values, case attribution and PDF layout.

## Commands

```powershell
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd test -- --global-timeout=420000
git diff --check
```

The Flow footage is an open release checkpoint. Its rendering, network behavior and runtime blending require review after approved clips are present.
