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
    ├── ... poster image ...
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
- the poster image,
- every EDS and EC qualitative result stored under `docs/FESiamTrack results/`.

The media are then displayed with **relative `docs/...` URLs**, so GitHub Pages serves the files from the same repository.

### Sequence sliders

The EDS and EC sections are independent sliders. Each desktop slide shows up to three sequences. The expected benchmark sequence names are:

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

- EDS and EC qualitative results use the same **Bulma Carousel** library used by the Academic Project Page Template, with `slidesToShow: 3`, `slidesToScroll: 1`, infinite navigation, and autoplay disabled.
- Each carousel item keeps the dataset name and sequence name under the GIF.
- The poster is loaded directly from `docs/140x100 ECCV Poster.pdf`.
