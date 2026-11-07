# Code review

Scope is the V5 branch against the live V4 baseline. The review covered scroll and resize behavior, the case and proof layers, prerendering, asset handling and release workflow.

| Finding | Resolution |
| --- | --- |
| A cold load of a work link could land on the previous exhibit when the cinematic layout expanded. | The layout switch preserves the chapter and fractional position. The TIRIZ test opens the deep link from a fresh page. |
| Global anchor scroll margin stopped work links before their camera keyframes. | Live world stops now clear that margin. Reading targets keep clearance beneath the fixed header. |
| Rendering a selected case alongside the hidden archive duplicated chart element IDs. | The archive is omitted while a live case is open. Chart keyboard and ARIA targets stay unique. |
| The Cakradata screen was partly hidden behind a rack member at its keyframe. | The exhibit moved in front of the obstruction. |
| A mobile accordion summary measured 29 px in the first test pass. | The summary now provides a 44 px touch target. |
| A moving caption vignette could create a horizontal edge between chapters. | The vignette now stays fixed over the continuous stage. Static fallback posters retain their own contrast gradient. |
| Flow defaulted to two outputs. | The production instructions and ledger require a visible x1 and exact amount check at each submission. |

The WebGL renderer is lazy, keeps one canvas, renders on demand, culls distant rooms, batches repeated geometry and disables shadows on initially narrow viewports. Vite still warns about the size of the lazy Three.js chunk. Evaluate it on representative hardware before treating software-rendered tests as frame-rate evidence.

Case links fall through to their document anchors in the reading path. A live case locks background scroll and restores scroll and focus on close. Public evidence and PDFs remain the same files. The three approved encodes load only in their active scroll windows. Video requests are deferred until scroll enters an insert.

The Flow milestone is satisfied by the three reviewed, integrated finals.
