const copyButton = document.querySelector('[data-copy-target]');

if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const id = copyButton.dataset.copyTarget;
    const node = document.getElementById(id);
    if (!node) return;

    try {
      await navigator.clipboard.writeText(node.innerText.trim());
      const old = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => (copyButton.textContent = old), 1500);
    } catch {
      copyButton.textContent = 'Select & copy';
    }
  });
}

/*
 * Repository-backed assets
 * ------------------------
 * The page intentionally does not duplicate the paper figures/results locally.
 * It discovers the real files under docs/ in afotakis/FESiamTrack-page and then
 * uses relative docs/... URLs, so the deployed GitHub Pages site serves the
 * repository files directly.
 */
const REPO = {
  owner: 'afotakis',
  name: 'FESiamTrack-page',
  branch: 'main',
  docsRoot: 'docs/',
  resultsRoot: 'docs/FESiamTrack results/'
};

const DATASETS = {
  EDS: [
    { name: 'peanuts_light_160_386', keys: ['peanuts_light_160_386', 'peanuts_light'] },
    { name: 'rocket_earth_light_338_438', keys: ['rocket_earth_light_338_438', 'rocket_earth_light'] },
    { name: 'ziggy_in_the_arena_1350_1650', keys: ['ziggy_in_the_arena_1350_1650', 'ziggy_in_the_arena', 'ziggy'] },
    { name: 'peanuts_running_2360_2460', keys: ['peanuts_running_2360_2460', 'peanuts_running'] }
  ],
  EC: [
    { name: 'shapes_translation_8_88', keys: ['shapes_translation_8_88', 'shapes_translation'] },
    { name: 'shapes_rotation_165_245', keys: ['shapes_rotation_165_245', 'shapes_rotation'] },
    { name: 'shapes_6dof_485_565', keys: ['shapes_6dof_485_565', 'shapes_6dof'] },
    { name: 'boxes_translation_330_410', keys: ['boxes_translation_330_410', 'boxes_translation'] },
    { name: 'boxes_rotation_198_278', keys: ['boxes_rotation_198_278', 'boxes_rotation'] }
  ]
};

const FEATURED_EXAMPLES = [
  // Restore the exact two-row showcase from the earlier page.
  // Row 1 intentionally brings back the non-EDS/EC datasets.
  {
    dataset: 'TUM-VIE',
    name: 'mocap-6dof',
    keys: ['mocap-6dof_40_120', 'mocap-6dof', 'mocap_6dof'],
    fallback: 'docs/mocap-6dof_40_120_tracks_pred_events.gif'
  },
  {
    dataset: 'VECtor',
    name: 'robot-normal',
    keys: ['robot-normal_340_420', 'robot-normal', 'robot_normal'],
    fallback: 'docs/robot-normal_340_420_tracks_pred_events.gif'
  },

  // Row 2 keeps one representative EDS and EC result, matching the old layout.
  {
    dataset: 'EDS',
    name: 'peanuts_running_2360_2460',
    keys: ['peanuts_running_2360_2460', 'pred_eds_peanuts_running', 'peanuts_running'],
    fallback: 'docs/pred_eds_peanuts_running.gif'
  },
  {
    dataset: 'EC',
    name: 'shapes_6dof_485_565',
    keys: ['shapes_6dof_485_565', 'pred_ec_shapes_6dof', 'shapes_6dof'],
    fallback: 'docs/pred_ec_shapes_6dof.gif'
  }
];

const MEDIA_EXTENSIONS = ['.gif', '.mp4', '.webm'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

const normalize = (value) => value
  .toLowerCase()
  .replace(/%20/g, ' ')
  .replace(/[\\/\-.]+/g, '_')
  .replace(/[^a-z0-9_ ]+/g, '')
  .replace(/\s+/g, '_');

const pathExtension = (path) => {
  const clean = path.split('?')[0].toLowerCase();
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot) : '';
};

const isUnder = (path, root) => path.toLowerCase().startsWith(root.toLowerCase());

const relativeAssetUrl = (path) => path
  .split('/')
  .map((part) => encodeURIComponent(part))
  .join('/');

async function fetchRepositoryTree() {
  const url = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/git/trees/${REPO.branch}?recursive=1`;
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const payload = await response.json();
  return (payload.tree || [])
    .filter((entry) => entry.type === 'blob' && isUnder(entry.path, REPO.docsRoot))
    .map((entry) => entry.path);
}

function scorePath(path, positiveTerms, negativeTerms = []) {
  const value = normalize(path);
  let score = 0;

  positiveTerms.forEach(([term, weight]) => {
    if (value.includes(normalize(term))) score += weight;
  });
  negativeTerms.forEach(([term, weight]) => {
    if (value.includes(normalize(term))) score -= weight;
  });

  return score;
}

function bestMatch(paths, extensions, positiveTerms, negativeTerms = []) {
  const candidates = paths
    .filter((path) => extensions.includes(pathExtension(path)))
    .map((path) => ({ path, score: scorePath(path, positiveTerms, negativeTerms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  return candidates[0]?.path || null;
}

function findMediaAsset(paths, sequence, root = REPO.docsRoot) {
  const mediaFiles = paths
    .filter((path) => isUnder(path, root) && MEDIA_EXTENSIONS.includes(pathExtension(path)))
    .sort((a, b) => {
      // Prefer GIFs because the repository showcase assets are primarily GIFs.
      const rank = (path) => pathExtension(path) === '.gif' ? 0 : pathExtension(path) === '.mp4' ? 1 : 2;
      return rank(a) - rank(b) || a.localeCompare(b);
    });

  const normalizedKeys = sequence.keys.map(normalize);
  return mediaFiles.find((path) => {
    const p = normalize(path);
    return normalizedKeys.some((key) => p.includes(key));
  }) || null;
}

function findSequenceAsset(paths, sequence) {
  return findMediaAsset(paths, sequence, REPO.resultsRoot);
}

function setFigureAsset(wrapper, path) {
  if (!wrapper || !path) return false;
  const img = wrapper.querySelector('img');
  const loading = wrapper.querySelector('.asset-loading');
  if (!img) return false;

  const url = relativeAssetUrl(path);
  img.src = url;
  img.hidden = false;
  if (loading) loading.remove();

  if (wrapper.matches('a')) wrapper.href = url;
  return true;
}

function showAssetError(wrapper, message) {
  if (!wrapper) return;
  const loading = wrapper.querySelector('.asset-loading');
  if (loading) {
    loading.classList.add('asset-error');
    loading.textContent = message;
  }
}

function resolveFigures(paths) {
  const docsPngs = paths.filter((p) => isUnder(p, REPO.docsRoot) && pathExtension(p) === '.png');
  const docsSvgs = paths.filter((p) => isUnder(p, REPO.docsRoot) && pathExtension(p) === '.svg');

  const figureMatches = {
    'system-architecture': bestMatch(
      docsPngs,
      ['.png'],
      [['system architecture', 20], ['architecture', 12], ['system', 5], ['frame attention', 3]],
      [['siamese', 8], ['poster', 10], ['result', 4]]
    ),
    'siamese-fpn': bestMatch(
      docsPngs,
      ['.png'],
      [['siamese fpn', 20], ['siamese', 12], ['fpn', 10], ['shared weight', 4], ['feature network', 3]],
      [['poster', 10], ['result', 4]]
    ),
    'benchmark-results': bestMatch(
      docsSvgs,
      ['.svg'],
      [['benchmarking results', 25], ['benchmark', 18], ['results', 7], ['table', 3]],
      [['ablation', 30]]
    ),
    'ablation-results': bestMatch(
      docsSvgs,
      ['.svg'],
      [['ablation results', 25], ['ablation', 20], ['results', 6], ['table', 3]]
    )
  };

  Object.entries(figureMatches).forEach(([kind, path]) => {
    const wrapper = document.querySelector(`[data-repo-figure="${kind}"]`);
    if (!wrapper) return;
    if (!setFigureAsset(wrapper, path)) {
      showAssetError(wrapper, `Could not automatically locate the ${kind.replaceAll('-', ' ')} file in docs/.`);
    }
  });

}

function resolvePoster(paths) {
  const wrapper = document.querySelector('[data-repo-poster]');
  if (!wrapper) return;

  const docsPngs = paths.filter((p) => isUnder(p, REPO.docsRoot) && pathExtension(p) === '.png');
  const posterPath = bestMatch(
    docsPngs,
    ['.png'],
    [['140x100 eccv poster', 40], ['eccv poster', 30], ['poster', 20], ['140x100', 12]],
    [['architecture', 8], ['result', 6], ['table', 6]]
  ) || 'docs/140x100 ECCV Poster.png';

  const img = wrapper.querySelector('#poster-image');
  const loading = wrapper.querySelector('.asset-loading');
  const pngLink = document.getElementById('poster-png-link');
  const url = relativeAssetUrl(posterPath);

  if (img) {
    img.src = url;
    img.hidden = false;
    img.addEventListener('load', () => loading?.remove(), { once: true });
    img.addEventListener('error', () => {
      if (loading) {
        loading.classList.add('asset-error');
        loading.textContent = 'Unable to load the poster PNG from docs/.';
      }
      img.hidden = true;
    }, { once: true });
  }
  if (pngLink) pngLink.href = url;
}

function createMedia(path, alt) {
  const ext = pathExtension(path);
  const url = relativeAssetUrl(path);

  if (ext === '.mp4' || ext === '.webm') {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', alt);
    return video;
  }

  const img = document.createElement('img');
  img.src = url;
  img.alt = alt;
  img.loading = 'lazy';
  return img;
}

function createSequenceCard(dataset, sequence, path) {
  // Match the Academic Project Page Template carousel structure: each result is
  // an `.item` containing the media and a centered subtitle underneath.
  const content = document.createElement('div');
  content.className = 'sequence-result';

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'sequence-media';
  mediaWrap.appendChild(createMedia(path, `${dataset} ${sequence}`));
  content.appendChild(mediaWrap);

  const caption = document.createElement('div');
  caption.className = 'sequence-subtitle';

  const datasetName = document.createElement('strong');
  datasetName.className = 'sequence-dataset';
  datasetName.textContent = dataset;

  const separator = document.createTextNode(' — ');

  const sequenceName = document.createElement('span');
  sequenceName.className = 'sequence-name';
  sequenceName.textContent = sequence;

  caption.append(datasetName, separator, sequenceName);
  content.appendChild(caption);
  return content;
}

function initializeBulmaCarousel(slider, dataset) {
  if (typeof bulmaCarousel === 'undefined') {
    slider.innerHTML = `<div class="asset-loading asset-error">The results carousel library could not be loaded.</div>`;
    return;
  }

  // Same interaction pattern as the Academic Project Page Template: Bulma
  // Carousel, one result advanced per click, infinite loop, no autoplay.
  // We keep the requested three-column view on desktop.
  const slidesToShow = window.matchMedia('(max-width: 700px)').matches
    ? 1
    : window.matchMedia('(max-width: 1000px)').matches
      ? 2
      : 3;

  const instances = bulmaCarousel.attach(`#${slider.id}`, {
    slidesToScroll: 1,
    slidesToShow,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    pagination: true,
    navigation: true
  });

  slider.setAttribute('aria-label', `${dataset} qualitative results carousel`);

  // The template exposes the carousel instance on the element. Keep a
  // reference as well for easier debugging on GitHub Pages.
  if (instances && instances[0]) slider.fesiamCarousel = instances[0];
}

function buildSlider(slider, dataset, items) {
  slider.innerHTML = '';

  if (!items.length) {
    slider.innerHTML = `<div class="asset-loading asset-error">No ${dataset} sequence GIFs were found under <code>${REPO.resultsRoot}</code>.</div>`;
    return;
  }

  items.forEach(({ sequence, path }) => {
    const item = document.createElement('div');
    item.className = 'item sequence-carousel-item';
    item.appendChild(createSequenceCard(dataset, sequence.name, path));
    slider.appendChild(item);
  });

  initializeBulmaCarousel(slider, dataset);
}

function resolveDatasetSliders(paths) {
  Object.entries(DATASETS).forEach(([dataset, sequences]) => {
    const slider = document.getElementById(`${dataset.toLowerCase()}-slider`);
    if (!slider) return;

    const items = sequences
      .map((sequence) => ({ sequence, path: findSequenceAsset(paths, sequence) }))
      .filter((item) => item.path);

    buildSlider(slider, dataset, items);
  });
}

function resolveFeaturedExamples(paths) {
  const grid = document.getElementById('featured-results-grid');
  if (!grid) return;

  const items = FEATURED_EXAMPLES
    .map((entry) => ({
      ...entry,
      // Search the complete docs/ tree. If the GitHub tree uses the old
      // showcase filenames, the fallback preserves the earlier two-row layout.
      path: findMediaAsset(paths, { keys: entry.keys }, REPO.docsRoot) || entry.fallback
    }))
    .filter((entry) => entry.path);

  if (!items.length) {
    grid.innerHTML = '<div class="asset-loading asset-error featured-loading">Unable to locate the featured GIFs under <code>docs/</code>.</div>';
    return;
  }

  grid.innerHTML = '';
  items.forEach((entry) => {
    const card = document.createElement('figure');
    card.className = 'featured-video-card';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'featured-video-media';
    mediaWrap.appendChild(createMedia(entry.path, `${entry.dataset} ${entry.name}`));
    card.appendChild(mediaWrap);

    const caption = document.createElement('figcaption');
    const datasetName = document.createElement('strong');
    datasetName.textContent = entry.dataset;
    const sequenceName = document.createElement('span');
    sequenceName.textContent = entry.name;
    caption.append(datasetName, document.createTextNode(' — '), sequenceName);
    card.appendChild(caption);

    grid.appendChild(card);
  });
}

async function initializeRepositoryAssets() {
  try {
    const paths = await fetchRepositoryTree();
    resolveFigures(paths);
    resolvePoster(paths);
    resolveDatasetSliders(paths);
    resolveFeaturedExamples(paths);
  } catch (error) {
    console.error('Unable to load repository assets:', error);

    document.querySelectorAll('.repo-figure').forEach((wrapper) => {
      showAssetError(wrapper, 'Unable to load this asset from docs/.');
    });

    // Poster still has a deterministic same-repository fallback even if the
    // GitHub API tree cannot be read (for example due to a temporary rate limit).
    const posterWrapper = document.querySelector('[data-repo-poster]');
    const posterImage = document.getElementById('poster-image');
    if (posterWrapper && posterImage) {
      posterImage.hidden = false;
      posterImage.src = 'docs/140x100%20ECCV%20Poster.png';
      posterWrapper.querySelector('.asset-loading')?.remove();
    }

    const featuredGrid = document.getElementById('featured-results-grid');
    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      FEATURED_EXAMPLES.forEach((entry) => {
        const card = document.createElement('figure');
        card.className = 'featured-video-card';
        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'featured-video-media';
        mediaWrap.appendChild(createMedia(entry.fallback, `${entry.dataset} ${entry.name}`));
        card.appendChild(mediaWrap);
        const caption = document.createElement('figcaption');
        const datasetName = document.createElement('strong');
        datasetName.textContent = entry.dataset;
        const sequenceName = document.createElement('span');
        sequenceName.textContent = entry.name;
        caption.append(datasetName, document.createTextNode(' — '), sequenceName);
        card.appendChild(caption);
        featuredGrid.appendChild(card);
      });
    }

    ['EDS', 'EC'].forEach((dataset) => {
      const slider = document.getElementById(`${dataset.toLowerCase()}-slider`);
      if (slider) {
        slider.innerHTML = `<div class="asset-loading asset-error">Unable to read <code>${REPO.resultsRoot}</code>. ${error.message}</div>`;
      }
    });
  }
}

initializeRepositoryAssets();
