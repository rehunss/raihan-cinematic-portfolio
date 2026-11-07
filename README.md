# The Architecture of Ideas

Muhammad Raihan Ramadhan’s marketing communication portfolio. One WebGL world takes the visitor through a concrete arrival passage, suspended discovery chamber, three project installations, a copper courtyard, a data colonnade and a rooftop exit. The site keeps the professional case files and evidence readable through HTML, including without JavaScript.

## Run locally

Use Node.js 22.12 or later in the 22.x line, or Node 24 and later.

```sh
npm ci
npm run build
npm run preview
```

Open [the local production preview](http://127.0.0.1:4174/raihan-cinematic-portfolio/). Use `npm run dev` for live development.

## Verify

```sh
npx playwright install chromium
npm test
```

Playwright uses the production build and starts the preview server if needed. Set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome. The suite writes diagnostics to `qa/` and `test-results/`. Add `?debug-world=1` to expose the camera position, target and orientation on the canvas during development.

## Content and architecture

- Edit verified claims, links, and provenance in `src/content.json`. The [public source portfolio](https://github.com/rehunss/portfolio-updated/tree/22ceb3e029971010b5ff59450d82d226d7323092) is read-only.
- `src/film/shots.ts` defines camera stops. `Threshold.tsx` and `Rooms.tsx` arrange the structures with reusable procedural forms. `Scene.tsx` maps native scroll to the camera path and world state.
- `src/film/posters/` contains original captures of the live world. They are used for the first render, reduced motion, context loss and devices without WebGL.
- The existing CV, TIRIZ report, certificate and portfolio PDF retain their public URLs. Refresh the print PDF after changes to shared content or URLs and inspect each rendered page.

## Production and Flow

The pull request workflow runs the build and browser tests. Main-branch runs deploy the tested build to GitHub Pages. The redesigned release requires integrated Flow footage or Raihan’s explicit waiver. See the [production handoff](docs/FLOW-PRODUCTION-HANDOFF.md), [credit ledger](docs/FLOW-CREDIT-LEDGER.md) and [current status](docs/PROJECT-STATUS.md).
