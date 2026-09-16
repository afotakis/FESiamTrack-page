# FESiamTrack project page

A GitHub Pages-ready academic project page for:

**Enhancing Event-Frame Feature Tracking with Siamese FPN**  
Andreas Fotakis, Emmanouil Psarakis  
ECCV 2026 Workshop on Event-based Machine Vision (EBMV)

## Design

This version combines two visual directions:

- the clean academic-paper layout of Eliahu Horwitz's **Academic Project Page Template** (large centered publication header, rounded publication buttons, teaser media, light alternating sections, compact citation block), and
- the existing FESiamTrack page/poster style (University of Patras blue palette, poster-derived cards, architecture figures, result tables, highlighted proposed method).

The page is custom HTML/CSS and does **not** require Bulma or the template's JavaScript/CSS files.

## Files

```text
index.html
style.css
script.js
assets/
  poster.jpg
  system-architecture.jpg
  siamese-fpn.jpg
```

The qualitative GIFs and paper PDF are intentionally referenced from the existing repository `doc/` directory:

```text
doc/ECCV_2026_Workshop_EBMV_Fotakis_Psarakis.pdf
doc/mocap-6dof_40_120_tracks_pred_events.gif
doc/robot-normal_340_420_tracks_pred_events.gif
doc/pred_eds_peanuts_running.gif
doc/pred_eds_ziggy.gif
doc/pred_ec_shapes_6dof.gif
doc/pred_ec_boxes_rotation.gif
```

## Recommended deployment in FESiamTrack

Copy `index.html`, `style.css`, `script.js`, and `assets/` into the **root** of the `FESiamTrack` repository. Keep the existing `doc/` folder unchanged.

Then in GitHub:

1. Open **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select your default branch (for example `main`).
4. Select **/(root)**.
5. Save.

Using the repository root is important because the page uses relative paths such as `doc/pred_eds_peanuts_running.gif`.

## Notes

- The page is responsive and has no build step.
- Publication metadata is included for search engines/Google Scholar-style indexing.
- The BibTeX block includes a copy button.
- A small footer link credits the Academic Project Page Template as style inspiration.
