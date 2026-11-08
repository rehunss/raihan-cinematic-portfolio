# V6 visual and interaction review

The baseline is the deployed V5 merge, `852e4e9`, saved in `backup/pre-v6`. The public portfolio and the local production build were reviewed. On the reference site, Works brought the visitor into a space with a centered exhibit. Opening Bright Ai expanded the exhibit in the same space. Closing returned to the selected exhibit. The reference uses a small identity and sparse edge controls. [Live reference](https://joseph-san.com/) · [Joseph Santamaria’s technical case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)

| Interaction | Reference | V5 baseline | V6 |
| --- | --- | --- | --- |
| Wayfinding | Small edge controls keep the architecture visible | Full-width header with five section links | Separate monogram, Explore map, chapter marker and motion control |
| Camera and depth | Works reveals an object between foreground and background structures | Eight connected shots, with poster and WebGL stops measured at different offsets | Continuous camera and target curves with one scroll measurement, stable stops and a preserved scene on resize |
| Opening and returning | The selected project expands in place and closes back into the exhibit | A case opens in a dialog when WebGL is ready, or scrolls to the archive while it loads | Live camera approaches the exhibit and reverses on close. The reading view also opens from the same control with posters. |
| Images and typography | Work fills the selected object and the title shifts into supporting UI | A single case image appears beside a structured STAR summary | A large image and supporting work open the story. Captions identify the asset, campaign period and evidence. |
| Leadership | Spatial exhibits remain tied to their surroundings | A link scrolls to the archive | Event photographs sit in the amber court. Five event entries reveal photos and STAR details at that stop. |
| Light and color | Changes in fog and light signal different locations | Teal environments with quieter color differences | Teal arrival, violet and rose campaign, sapphire creative exhibit, amber court, sage results and a brighter finale |

The local baseline run used Chrome at 1440 × 900 with identical time-based forward and reverse scroll input. The final stop moved from 6,300 px before WebGL to 8,946 px after it became ready. The leadership link moved the browser from 6,385 px to 18,430 px. The measured baseline frame interval at the 95th percentile was 16.8 ms. Screenshots and raw measurements are in `qa/v6`.

The shared journey controller samples native scroll on the animation frame. The camera and Flow clips read that position. The same clips retain their source across reverse scrolling and wait for the outstanding seek before seeking again. The case panel owns its scroll lock and saves the original focus. The evidence viewer only locks the document when opened on its own in the reading index.

The TIRIZ gallery combines the November 25, 2025 booth photo and four crops from the approved Pancarona report. Page 12 provides three campaign posts. The Instagram publication dates were checked on the posts. The page 13 giveaway crop is attributed to the report. The report repeats other links on that page, so the crop links to the report page. [October 6 Happy Hour](https://www.instagram.com/p/DPc3SNMD8i9/) · [October 22 Payday Edition](https://www.instagram.com/p/DQHK4KyD36X/) · [October 26 Payday Deals](https://www.instagram.com/p/DQRXvkmjz05/)

Divia uses the approved LinkedIn carousel capture and three published post covers. Cakradata uses its approved profile capture, published samples and a text diagram of the research, scripting and presentation process. Its gallery has one documentary image. The source documents, career metrics and three approved Flow files are preserved. This revision used zero Flow credits.
