# Visual diagnosis

Observed Joseph Santamaria’s live site in the in-app browser at arrival, early descent, floating structures, project selection, open project, the later field, reverse scroll, and the contact overlay. The browser captured those states. It also captured the deployed portfolio’s opening and work index. Reference captures are for comparison only.

| Principle | Reference observation | Previous implementation | V5 response |
| --- | --- | --- | --- |
| Scale and depth | Nearby cross-members crop out of frame; other structures recede into teal haze. | Signal Core is framed in screen space on a flat gradient. | Build an original concrete viaduct with layered pylons, a deck, and fogged distant silhouettes. |
| Camera and continuity | A foreground wipe opens onto suspended blocks and later frames a project between structures. Reverse scroll moves back through the same space. | Camera and target vary, but the scene group is repositioned relative to the camera. The object remains the main visual anchor. | Leave the geometry at world coordinates. Move the lens through gates, around installations and up over the last terrace. |
| Projects | Work appears in the world and opens in place; closing restores the exhibit. | Small project planes accompany a conventional HTML card list and stacked dossiers. | Give each project its own material, architectural bay and evidence screen. Open the readable case in a modal over the current shot. |
| Transformation | A dense teal interior yields to a broad, warm and exposed environment. | Most chapters reuse the same subject and framing. | Leave the enclosed bays for an amber collaboration court; turn toward a data colonnade and exit above the deck. |
| Typography | Sparse corner type yields to a larger project title at a deliberate story beat. | Large hero text, boxed CTAs and repeated section headings compete with the scene. | Keep metadata in a perimeter rail. Change caption position by composition and leave broad areas of the frame open. |

Joseph's case study explains the approach to camera, reveal timing, original assets and GPU instancing. His GSAP tutorial shows how to coordinate camera position, target and editorial timing. V5 uses those principles with native scroll and an original world.

- [Live reference](https://joseph-san.com/)
- [Published case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- [GSAP tutorial](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/)


## V5 visual review

The first capture looks down a corridor through several concrete planes. The second drops into a close field of suspended fins with foreground occlusion. These renders supported proceeding to the full world. The next review captured all eight live stops at 1440 × 810 and key mobile stops at 390 × 844. The three exhibits are distinguished by an anchored broadcast screen, a tilted campaign panel among mauve ribs and a taller panel inside a blue rack. The copper courtyard and elevated departure change camera height and framing as well as color. The impact stop uses geometry for its measures and adds exact figures and evidence in accessible HTML.

The initial rack capture showed a foreground member hiding part of the Cakradata screen. The screen has moved toward the camera for the next visual check. The individual captures and contact sheet are under `qa/v5/`.
