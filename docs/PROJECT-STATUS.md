# Project status

## The Architecture of Ideas

- The V4 production baseline is `1e712714ebed61a24b19de1073466dbf65ee5a07`. It is preserved on local and remote branch `backup/pre-v5-cinematic`.
- The V5 redesign is in the independent `rehunss/raihan-cinematic-portfolio` repository. The original portfolio repository was used as read-only input.
- The live reference and previous production site were inspected in Chrome’s in-app browser. The first two original shots were rendered and reviewed before connecting the remaining rooms.
- The eight camera stops, live case dialogs, and HTML archive are implemented. A browser recording, performance measurements, and desktop and mobile renders are in the local `qa/v5/` folder.
- The two approved drafts and all three approved 720p finals completed in Google Flow. The account was verified at 162 credits after an actual charge of 88. The site uses the three reviewed silent WebM encodes.
- The release is tracked by [PR #1](https://github.com/rehunss/raihan-cinematic-portfolio/pull/1) and the [GitHub Pages workflow](https://github.com/rehunss/raihan-cinematic-portfolio/actions/workflows/pages.yml). Main-branch CI builds and deploys the production site.

Build with `npm run build`, start `npm run preview`, then open [the local preview](http://127.0.0.1:4174/raihan-cinematic-portfolio/). The production destination is [The Architecture of Ideas on GitHub Pages](https://rehunss.github.io/raihan-cinematic-portfolio/).
