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

## Measured preview

One local Chrome sample per profile measured initial paint separately from first WebGL frame. The mobile profile emulated 390 × 844, 4× CPU slowdown, 150 ms RTT and 1.6 Mbps down. These observations describe the local software-rendered browser.

| Profile | Largest contentful paint | Layout shift | First live frame observed |
| --- | ---: | ---: | ---: |
| Desktop | 0.45 s | 0.008 | 2.48 s |
| Throttled mobile | 1.36 s | 0.000 | 7.05 s |

The live scene bundle is about 303 kB gzip and loads after initial HTML and CSS. The full journey was recorded in both directions from Chrome’s compositor at 960 × 540. The local `qa/v5/scroll-review.webm` contains 613 captured frames. These measurements do not establish GPU performance on physical mobile devices.
