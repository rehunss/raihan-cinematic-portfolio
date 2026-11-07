# Google Flow production handoff

Use [the portfolio production project](https://flow.google.com/project/50f72659-5692-499f-a6e3-b2093a3e220a) on the signed-in Google AI Plus account. The project is for original atmospheric inserts based on rendered WebGL stills. The main environment is rendered live.

## Requests and reference files

| Clip | Draft | Final | Start frame | End frame | Export stem |
| --- | --- | --- | --- | --- | --- |
| A | 8 s at 360p | 8 s at 720p | `qa/v5/flow-arrival.jpg` | Optional | `arrival` |
| B | 8 s at 360p | 8 s at 720p | `qa/v5/world-discovery.png` | `qa/v5/flow-transformation.jpg` | `transformation` |
| C | None | 8 s at 720p | `qa/v5/flow-departure.jpg` | Optional | `departure` |

Reference frames are local portfolio captures. The optimized equivalents are in `src/film/posters/` and can be exported as JPEG if needed. The reference contact sheet is `qa/v5/scene-contact-sheet.jpg`. Select Video, Frames, 16:9, eight seconds and x1. Use the displayed charge and account balance immediately before submission.

**A — Arrival**

> Start precisely from the supplied 16:9 render. An eight-second slow physical dolly forward inside this original dark teal concrete passage. Keep the bridge, foreground taper, stacked slabs, etched stone and cyan floor seam spatially fixed as the camera passes into the space. Introduce slight layered parallax and a very soft drift of teal architectural haze from the far opening. Keep realistic weight, coherent surfaces and steady motion in one shot. Preserve deep black teal shadows and muted blue highlights. No text, logos, people, characters, cuts, neon or sound.

**B — Transformation**

> Use the provided cold start and copper courtyard end as composition targets for an eight-second continuous physical move through one original architectural site. Travel through the cool layered passage, clear the foreground structure and open into the amber courtyard. Structural seams, proportional concrete mass and fixed orientation should carry through the reveal. Let practical warm light appear through the openings as the visible structures change from cold metal to aged copper and concrete. Finish settled on the warm courtyard composition. Smooth restrained camera, credible parallax, no cuts, people, text, logos, surreal melting or sound.

**C — Departure**

> Begin from the supplied original skyline still. Eight-second restrained ascent and glide along the centerline of the narrow rooftop walkway into an open fog horizon. Keep the muted green-gray concrete silhouettes spatially fixed. Low pale morning light catches the runway edge and far silhouettes without blowing out the sky. Let the architecture recede naturally. One continuous camera move with subtle parallax and quiet atmospheric variation. No text, logos, people, characters, jumps or sound.

## Review and integration

Check stable geometry, believable directional motion, palette continuity, and unwanted marks or objects. Compare each shot against the relevant live stop. Export the approved original into a private local staging folder. Transcode without audio at 720p with a tight keyframe interval. Use `arrival.webm`, `transformation.webm`, and `departure.webm` in `src/film/flow/`. Keep original renders and app status independent of generated media.

```powershell
ffmpeg -i input.mp4 -vf scale=1280:720 -an -sn -dn -map_metadata -1 -c:v libvpx-vp9 -crf 34 -b:v 0 -g 12 -deadline good -cpu-used 3 -row-mt 1 -threads 4 -pix_fmt yuv420p output.webm
```

Enable a clip after verifying the production asset. Check scroll holds and reverse playback, browser network, load cost, contrast, reduced motion, and mobile readability. Record the actual inputs, cost and output hash. Production publication remains gated on integrated footage or Raihan’s explicit waiver.


## Final production review

Arrival keeps the viaduct and seam stable during the forward dolly. Transformation reveals copper lighting across an intervening architectural passage and settles on the supplied courtyard. Departure follows the rooftop into pale fog. The final originals were inspected at 0.1, 2.5, 4.5 and 7.7 seconds. The review sheet is `qa/v5/flow-final-contact-sheet.jpg`.

The shipped clips appear as short masked inserts inside their corresponding scroll windows. The original geometry, camera and typography remain visible underneath. Media load only after entering a window and follow scroll in both directions. The still-image reading path is available with reduced motion or unavailable WebGL. See the [credit ledger](FLOW-CREDIT-LEDGER.md) for the exact charge and the shipped checksums.
