# Project status

Updated November 6, 2026.

## Local implementation

- Read-only source clone at `../portfolio-source-reference`, commit `22ceb3e029971010b5ff59450d82d226d7323092`. The reference remote has a disabled push URL.
- Independent working tree on `main`. The six chapters, scroll-controlled Three.js scene, work gallery, original proof and chart components, accessibility fallback and ten-page PDF are implemented.
- A clean locked install and TypeScript/production build passed. All 20 Playwright tests passed after the evidence update. See `QA-REPORT.md` for the mobile Lighthouse results, asset checks and PDF verification.
- GitHub Pages CI workflow is in `.github/workflows/pages.yml`. The original live homepage returned HTTP 200. The intended new repository and Pages address returned 404 before publication.
- The November 6 follow-up added linked public Cakradata view snapshots and exact role attribution. The HIMA and BEM cases use documented registration and attendance measures. The internal reports stay outside the checkout.
- Google Flow usage is **0 credits**.

## Publication

The portable GitHub CLI authenticated as `rehunss`. The deployment target is the independent `rehunss/raihan-cinematic-portfolio` repository, with GitHub Actions as the Pages build source.

Check the current status under Actions, then verify the deployment URL with `PORTFOLIO_TEST_URL` set to its published base. The initial checks were performed in the independent checkout. The source repository was used as a read-only reference.
