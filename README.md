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
    ├── 140x100 ECCV Poster.png
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
- The page displays the PNG poster from `docs/140x100 ECCV Poster.png` and provides separate **Open poster PNG** and **Open poster PDF** links. The PDF remains `docs/140x100 ECCV Poster.pdf`.
## Featured GIF showcase

The page restores the earlier **two-row, two-column qualitative showcase before the Abstract**. Row 1 brings back the non-EDS/EC examples: TUM-VIE `mocap-6dof` and VECtor `robot-normal`. Row 2 shows EDS `peanuts_running_2360_2460` and EC `shapes_6dof_485_565`. Each GIF keeps the dataset and sequence name directly underneath. The full EDS/EC carousels remain later on the page and continue loading all benchmark sequences from `docs/FESiamTrack results/`.

