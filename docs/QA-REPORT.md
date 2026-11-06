# Quality assurance

Local verification on November 6, 2026 used Windows, Git 2.54, Node 26.4, npm 11.17 and Chrome 156. The deployment workflow uses Node 22 and the Playwright Chromium install.

## Commands executed

```powershell
npm.cmd ci --prefer-offline
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd test -- --global-timeout=200000
npm.cmd run pdf
pdfinfo public/documents/Raihan_Signals_in_Motion_Portfolio.pdf
pdftoppm -r 65 -png public/documents/Raihan_Signals_in_Motion_Portfolio.pdf qa/pdf/rendered/page
git diff --cached --check
```

The source build succeeded before the redesign. The final locked install reported zero npm advisories. The final build ran TypeScript, Vite’s browser build and build-time HTML rendering. **All 19 Playwright tests passed** in 82 seconds. The four axe scans reported zero violations in the selected WCAG tag sets.

## Coverage

- Real WebGL canvas identity and rendered pixels across six chapters. Slow and fast movement, pause, scroll reversal and desktop-to-mobile resizing.
- Missing WebGL, context loss, reduced motion, stored preference, and prerendered content with JavaScript disabled.
- Navigation and URL history, keyboard focus, mobile targets, native dialog focus and Escape behavior.
- Divia tabs, exact selected-post metrics, account scope, tooltip and table alternatives. TIRIZ actual-versus-target comparisons and missed reach target.
- Screenshot captures and axe scans at 390×844, 768×1024, 1440×900 and 1920×1080. An additional 320px fallback check covers overflow and navigation.
- All 72 content asset paths and 84 manifest entries. Checked supplied manifest hashes using canonical LF for text. The three unchanged source PDFs were compared by SHA-256.
- Rendered all ten final PDF pages and inspected their layouts, tagged text, embedded project-base links and exclusions. Browser coverage checks ten print pages and footer separation.

## Performance

Ran Lighthouse 13.5 with default mobile simulation on an isolated Vite production preview at port 4175. Chrome used headless software WebGL.

| Measurement | Result |
| --- | --- |
| First Contentful Paint | 1.38 s |
| Largest Contentful Paint | 2.70 s, down from 5.11 s in the first lab run and above the 2.5 s target |
| Cumulative Layout Shift | 0.00 |
| Total Blocking Time | 2.21 s in the simulated mobile run |
| Lighthouse performance score | 65/100 |
| Headless scroll cadence | 56.5 rAF/s at 1280×720 and 56.4 rAF/s at 390×844 in 60-step scroll samples |

The production entry is approximately 91 kB gzipped. The deferred WebGL chunk is approximately 319 kB gzipped. The frame cadence describes short software-browser samples. Physical smartphone GPU throughput and field INP remain unmeasured.

The original hosted homepage returned HTTP 200. New repository, Actions and public Pages verification are pending authenticated publication.
