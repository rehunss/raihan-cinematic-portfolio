# Signals in Motion

Muhammad Raihan Ramadhan’s marketing communication portfolio. A procedural Signal Core travels through six chapters, while real campaign work, charts and evidence are available through regular HTML links and controls.

The site uses React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, GSAP ScrollTrigger and Playwright. Its professional content starts from the [public source portfolio](https://github.com/rehunss/portfolio-updated/tree/22ceb3e029971010b5ff59450d82d226d7323092).

## Run locally

Use Node.js 22.12 or later in the 22.x line, or Node 24 and later.

```sh
npm ci
npm run dev
```

Open [the local portfolio](http://127.0.0.1:4174/raihan-cinematic-portfolio/). For a production preview, run `npm run build` and `npm run preview`.

## Test and update

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Playwright starts the production preview if one is unavailable. Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome. Set `PORTFOLIO_TEST_URL` to a deployed base URL with its trailing slash for a hosted check. The test diagnostics go to `qa/` and `test-results/`.

Update approved claims, media and evidence in `src/content.json`. The proof and chart components preserve HTML tables, metric provenance and source links. The `public/` directory contains only materials already curated for public presentation and the original Signal Core illustration. The public CV, campaign report and certificate are byte-identical to the source repository’s published copies.

For a PDF refresh, build the site, start the production preview, run `npm run pdf` in a second terminal, then rebuild so `dist/` contains the new PDF. Check the PDF page count, page renders and embedded links. The script writes its output to `output/pdf/` and copies it to `public/documents/`.

## 3D and performance

Vite prerenders the chapters as HTML. The browser hydrates the controls and defers loading one fixed WebGL canvas until the first scroll or a brief startup delay. ScrollTrigger seeks a GSAP timeline and two camera splines from native scroll position. Pointer input adds a small offset. Demand rendering, a capped pixel ratio and a one-frame lighting environment bound the cost. The chapters and static illustration work with motion disabled or WebGL unavailable.

## GitHub Pages

In the new repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Push to `main` or run **Verify and deploy portfolio**. The deployment job requires a passing TypeScript build and browser suite and publishes the tested `dist/` directory.

The default base is `/raihan-cinematic-portfolio/`. If the repository name changes, set the new base in `vite.config.ts` and `playwright.config.ts`, update the public document base in `src/content.json` and regenerate the PDF.
