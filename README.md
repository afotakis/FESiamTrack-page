# FESiamTrack project page

Static project page for **Enhancing Event-Frame Feature Tracking with Siamese FPN**.

## Repository layout

Place these website files at the root of `afotakis/FESiamTrack-page`:

```text
FESiamTrack-page/
├── index.html
├── style.css
├── script.js
└── docs/
    ├── ... architecture PNGs ...
    ├── ... benchmarking/ablation SVGs ...
    ├── 140x100 ECCV Poster.pdf
    └── FESiamTrack results/
        └── ... EDS / EC sequence media ...
```

The page deliberately loads the real assets from this repository's `docs/` directory rather than keeping duplicate generated versions of the figures or tables.

### Automatic asset discovery

`script.js` reads the public GitHub tree for `afotakis/FESiamTrack-page` once on page load and resolves:

- the system-architecture PNG,
- the Siamese/shared-weight FPN PNG,
- the benchmarking-results SVG,
- the ablation-results SVG,
- every EDS and EC qualitative result stored under `docs/FESiamTrack results/`.

The media are then displayed with **relative `docs/...` URLs**, so GitHub Pages serves the files from the same repository.

### Sequence sliders

The EDS and EC sections are independent **Bulma Carousel** sliders, matching the result-carousel pattern from the Academic Project Page Template. On desktop, three sequence GIFs are visible at once; each arrow click advances by one result. The carousel loops infinitely and does not autoplay. The expected benchmark sequence names are:

**EDS**
- `peanuts_light_160_386`
- `rocket_earth_light_338_438`
- `ziggy_in_the_arena_1350_1650`
- `peanuts_running_2360_2460`

**EC**
- `shapes_translation_8_88`
- `shapes_rotation_165_245`
- `shapes_6dof_485_565`
- `boxes_translation_330_410`
- `boxes_rotation_198_278`

GIF, MP4, WebM, PNG, JPG and JPEG files are supported for qualitative results.

## GitHub Pages

Enable GitHub Pages for the repository and publish from the branch containing `index.html`. If `index.html`, `style.css`, and `script.js` are in the repository root, the `docs/` paths used by the page resolve directly.


## Result carousel and poster

- EDS and EC qualitative results use the same **Bulma Carousel** result-slider pattern as the Academic Project Page Template: `slidesToScroll: 1`, three visible items on desktop, infinite looping, navigation arrows, pagination dots, and autoplay disabled.
- Each carousel item keeps the dataset name and sequence name centered directly under the GIF.
- The poster is loaded directly from the exact file `docs/140x100 ECCV Poster.pdf`.


## Featured GIF showcase

Before the Abstract, the page restores the earlier **six-GIF, two-row Tracking Videos section** with three columns per row on desktop:

- TUM-VIE — `mocap-6dof` → `docs/mocap-6dof_40_120_tracks_pred_events.gif`
- VECtor — `robot-normal` → `docs/robot-normal_340_420_tracks_pred_events.gif`
- EDS — `peanuts_running` → `docs/pred_eds_peanuts_running.gif`
- EDS — `ziggy_in_the_arena` → `docs/pred_eds_ziggy.gif`
- EC — `shapes_6dof` → `docs/pred_ec_shapes_6dof.gif`
- EC — `boxes_rotation` → `docs/pred_ec_boxes_rotation.gif`

Each GIF shows the dataset and sequence name directly underneath. The complete EDS and EC sliders remain later on the page.

## Poster

The poster section displays `docs/140x100 ECCV Poster.png` directly as an image. Two buttons below it provide both formats:

- **Open poster PNG** → `docs/140x100 ECCV Poster.png`
- **Open poster PDF** → `docs/140x100 ECCV Poster.pdf`

The PDF is no longer embedded in the page.
