# Code review

Structured review of the independent checkout against the source at `22ceb3e029971010b5ff59450d82d226d7323092`. The review covered the React entry points, SSR and hydration, scene lifecycle, source data, asset paths, interactive charts, dialogs, print view and Pages workflow.

| Finding | Resolution |
| --- | --- |
| Initial rendering waited for the interactive app and could contend with WebGL setup. | Build-time HTML renders all chapters. A static Signal Core appears immediately, with deferred WebGL and a lazy print bundle. |
| SVG titles with multiple text children and preloaded resources inside the hydration root caused a React mismatch. | Chart titles render one string. Preload links move to the document head. Chrome smoke checks reported zero hydration errors after the changes. |
| Legacy asset fields referenced removed filenames. | Project samples and leadership photographs point to real responsive assets. |
| Original browser tests could wait indefinitely on images inside closed disclosure panels. | Tests await hydration, then decode visible images. The print test waits for the lazy print bundle before measuring layout. |
| Old reveal effects and prior layout selectors increased the initial bundle. | Removed Motion, the duplicate Geist package and obsolete layout rules. The existing chart, dialog and print styles remain in use. |
| Initial npm audit reported five advisories in the inherited toolchain. | Applied compatible fixes to the locked tree. The updated npm audit reported zero vulnerabilities. |
| The earlier Cakradata figures and general leadership KPI claims were stronger than the available evidence. | Withheld the figures and general KPI claims. Kept documented work samples, dates and clearly scoped first-hand descriptions. |
| Software rendering or context loss can interrupt the 3D layer. | The HTML, chart controls and static art remain available. Browser coverage exercises missing WebGL and synthetic context loss. |

The 3D code uses an original octagonal form and public project thumbnails. The camera design adapts the idea of a continuous scroll-controlled take. [Joseph Santamaria’s technical case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)

The staged diff passed `git diff --cached --check`. Git attributes mark PDFs and raster assets as binary, and staged PDF blobs match the verified files. A tracked-path check excluded private evidence, credentials, QA output, temporary files and dependencies.

The lazy scene remains the largest JavaScript download. Physical-device frame rate, field Core Web Vitals and hosted behavior require separate measurement.
