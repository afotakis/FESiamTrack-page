# FESiamTrack project page

Static project page for **Enhancing Event-Frame Feature Tracking with Siamese FPN**.

## Repository layout

Place these files at the root of:

`https://github.com/afotakis/FESiamTrack-page`

```text
FESiamTrack-page/
├── index.html
├── style.css
├── script.js
└── docs/
    ├── ... architecture PNGs
    ├── ... result-table SVGs
    ├── ... poster / paper assets
    └── FESiamTrack results/
        └── ... EDS / EC visualizations
```

The page intentionally does **not** duplicate paper figures or result tables. It discovers the existing files under `docs/` from the repository tree and then loads them through relative `docs/...` URLs.

### Asset matching

The page searches the `docs/` tree for:

- a PNG containing `architecture` / `system` for **System Architecture**;
- a PNG containing `siamese` / `fpn` for the **Siamese Shared-Weight FPN**;
- an SVG containing `benchmark` / `results` for the **Benchmarking Results** table;
- an SVG containing `ablation` for the **Ablation Results** table;
- the poster image and paper PDF;
- all EDS and EC sequence visualizations from `docs/FESiamTrack results/`.

The EDS slider includes:

- `peanuts_light_160_386`
- `rocket_earth_light_338_438`
- `ziggy_in_the_arena_1350_1650`
- `peanuts_running_2360_2460`

The EC slider includes:

- `shapes_translation_8_88`
- `shapes_rotation_165_245`
- `shapes_6dof_485_565`
- `boxes_translation_330_410`
- `boxes_rotation_198_278`

Three sequences are shown per slider page on desktop. The sliders remain responsive on smaller screens.

## GitHub Pages

If GitHub Pages is configured to publish from the repository root, no path changes are required. All media eventually resolves to relative `docs/...` paths inside the same repository.

`script.js` makes one public GitHub API request to discover the exact current filenames in `docs/`, caches the result for the browser session, and then uses local relative paths for the displayed assets.

## Math

The feature update equation is written in LaTeX and rendered with MathJax:

```latex
\hat{\mathbf{x}}_{f_l}(t_j)
=
\hat{\mathbf{x}}_{f_l}(t_{j-1})
+
\Delta\hat{\mathbf{x}}_{f_l}(t_j)
```
