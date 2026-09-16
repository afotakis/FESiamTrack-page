const REPO_OWNER = 'afotakis';
const REPO_NAME = 'FESiamTrack-page';
const REPO_BRANCH = 'main';
const DOCS_PREFIX = 'docs/';
const RESULTS_FOLDER_HINT = 'fesiamtrack results';

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

const DATASETS = {
  EDS: [
    { name: 'peanuts_light_160_386', aliases: ['peanuts_light_160_386', 'peanuts_light'] },
    { name: 'rocket_earth_light_338_438', aliases: ['rocket_earth_light_338_438', 'rocket_earth_light'] },
    { name: 'ziggy_in_the_arena_1350_1650', aliases: ['ziggy_in_the_arena_1350_1650', 'ziggy_in_the_arena', 'ziggy'] },
    { name: 'peanuts_running_2360_2460', aliases: ['peanuts_running_2360_2460', 'peanuts_running'] }
  ],
  EC: [
    { name: 'shapes_translation_8_88', aliases: ['shapes_translation_8_88', 'shapes_translation'] },
    { name: 'shapes_rotation_165_245', aliases: ['shapes_rotation_165_245', 'shapes_rotation'] },
    { name: 'shapes_6dof_485_565', aliases: ['shapes_6dof_485_565', 'shapes_6dof'] },
    { name: 'boxes_translation_330_410', aliases: ['boxes_translation_330_410', 'boxes_translation'] },
    { name: 'boxes_rotation_198_278', aliases: ['boxes_rotation_198_278', 'boxes_rotation'] }
  ]
};

const CROSS_DATASET = [
  { dataset: 'TUM-VIE', name: 'mocap-6dof', aliases: ['mocap-6dof', 'mocap_6dof'] },
  { dataset: 'VECtor', name: 'robot-normal', aliases: ['robot-normal', 'robot_normal'] }
];

function normalize(value = '') {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/[_\-\s]+/g, ' ')
    .replace(/[^a-z0-9./ ]+/g, '')
    .trim();
}

function compact(value = '') {
  return normalize(value).replace(/[^a-z0-9]+/g, '');
}

function extension(path = '') {
  const match = path.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : '';
}

function localDocsUrl(path) {
  const docsIndex = path.toLowerCase().indexOf(DOCS_PREFIX);
  const local = docsIndex >= 0 ? path.slice(docsIndex) : path;
  return encodeURI(local);
}

async function getRepoTree() {
  const cacheKey = `fesiamtrack-page-tree-${REPO_BRANCH}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_BRANCH}?recursive=1`;
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub tree request failed (${response.status})`);

  const data = await response.json();
  const files = (data.tree || [])
    .filter(item => item.type === 'blob' && item.path.toLowerCase().startsWith(DOCS_PREFIX))
    .map(item => item.path);

  sessionStorage.setItem(cacheKey, JSON.stringify(files));
  return files;
}

function rankedFind(files, options = {}) {
  const {
    extensions = [],
    mustContain = [],
    prefer = [],
    avoid = [],
    folderHint = null
  } = options;

  let candidates = files.filter(path => {
    const ext = extension(path);
    if (extensions.length && !extensions.includes(ext)) return false;
    const n = normalize(path);
    return mustContain.every(term => n.includes(normalize(term)));
  });

  if (folderHint) {
    const folderMatches = candidates.filter(path => normalize(path).includes(normalize(folderHint)));
    if (folderMatches.length) candidates = folderMatches;
  }

  return candidates
    .map(path => {
      const n = normalize(path);
      let score = 0;
      prefer.forEach((term, index) => {
        if (n.includes(normalize(term))) score += 20 - Math.min(index, 10);
      });
      avoid.forEach(term => {
        if (n.includes(normalize(term))) score -= 40;
      });
      if (n.startsWith('docs/')) score += 2;
      return { path, score };
    })
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))[0]?.path || null;
}

function findByAliases(files, aliases, dataset = null, extensions = ['.gif', '.mp4', '.webm']) {
  const aliasCompacts = aliases.map(compact);
  let candidates = files.filter(path => {
    if (!extensions.includes(extension(path))) return false;
    const p = compact(path);
    return aliasCompacts.some(alias => p.includes(alias));
  });

  const resultFolder = candidates.filter(path => normalize(path).includes(RESULTS_FOLDER_HINT));
  if (resultFolder.length) candidates = resultFolder;

  if (dataset) {
    const datasetMatches = candidates.filter(path => normalize(path).includes(normalize(dataset)));
    if (datasetMatches.length) candidates = datasetMatches;
  }

  return candidates.sort((a, b) => a.length - b.length || a.localeCompare(b))[0] || null;
}

function markAssetReady(img, path) {
  if (!img || !path) return;
  img.src = localDocsUrl(path);
  img.closest('.asset-frame')?.classList.add('asset-resolved');
}

function resolveStaticAssets(files) {
  const pngLike = ['.png', '.jpg', '.jpeg', '.webp'];

  let architecture = rankedFind(files, {
    extensions: ['.png'],
    mustContain: ['architecture'],
    prefer: ['system architecture', 'system', 'architecture'],
    avoid: ['poster', 'ablation', 'benchmark', 'result', 'table']
  });
  if (!architecture) {
    architecture = rankedFind(files, {
      extensions: ['.png'],
      prefer: ['architecture', 'system', 'fam'],
      avoid: ['poster', 'ablation', 'benchmark', 'result', 'table', 'siamese']
    });
  }

  let siameseFpn = rankedFind(files, {
    extensions: ['.png'],
    prefer: ['siamese fpn', 'siamese', 'shared weight', 'shared', 'fpn'],
    avoid: ['poster', 'ablation', 'benchmark', 'result', 'table']
  });

  const svgFiles = files.filter(path => extension(path) === '.svg');
  let benchmark = rankedFind(svgFiles, {
    extensions: ['.svg'],
    prefer: ['benchmarking results', 'benchmark results', 'benchmark', 'main results', 'results'],
    avoid: ['ablation']
  });
  let ablation = rankedFind(svgFiles, {
    extensions: ['.svg'],
    prefer: ['ablation results', 'ablation'],
    avoid: ['benchmark']
  });

  if ((!benchmark || !ablation) && svgFiles.length === 2) {
    benchmark ||= svgFiles[0];
    ablation ||= svgFiles.find(path => path !== benchmark) || svgFiles[1];
  }

  const poster = rankedFind(files, {
    extensions: pngLike,
    prefer: ['poster', 'eccv'],
    avoid: ['architecture', 'table', 'benchmark', 'ablation']
  });

  const paper = rankedFind(files, {
    extensions: ['.pdf'],
    prefer: ['eccv', 'workshop', 'fotakis', 'psarakis', 'paper']
  });

  markAssetReady(document.getElementById('architecture-image'), architecture);
  markAssetReady(document.getElementById('siamese-fpn-image'), siameseFpn);
  markAssetReady(document.getElementById('benchmark-results-svg'), benchmark);
  markAssetReady(document.getElementById('ablation-results-svg'), ablation);
  markAssetReady(document.getElementById('poster-image'), poster);

  if (paper) {
    document.querySelectorAll('[data-doc-link="paper"]').forEach(link => {
      link.href = localDocsUrl(paper);
    });
  }

  if (poster) {
    document.querySelectorAll('[data-doc-link="poster"]').forEach(link => {
      link.href = localDocsUrl(poster);
    });
  }
}

function createMediaElement(path, alt) {
  if (!path) {
    const placeholder = document.createElement('div');
    placeholder.className = 'media-missing';
    placeholder.textContent = 'Visualization not found in docs/FESiamTrack results';
    return placeholder;
  }

  const url = localDocsUrl(path);
  if (['.mp4', '.webm'].includes(extension(path))) {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.setAttribute('aria-label', alt);
    return video;
  }

  const image = document.createElement('img');
  image.src = url;
  image.alt = alt;
  image.loading = 'lazy';
  return image;
}

function createVideoCard(dataset, sequenceName, mediaPath) {
  const figure = document.createElement('figure');
  figure.className = 'video-card';
  figure.appendChild(createMediaElement(mediaPath, `FESiamTrack on ${dataset} ${sequenceName}`));

  const caption = document.createElement('figcaption');
  const datasetLabel = document.createElement('strong');
  datasetLabel.textContent = dataset;
  const sequenceLabel = document.createElement('span');
  sequenceLabel.textContent = sequenceName;
  caption.append(datasetLabel, sequenceLabel);
  figure.appendChild(caption);
  return figure;
}

function renderCrossDataset(files) {
  const target = document.getElementById('cross-dataset-examples');
  if (!target) return;
  target.innerHTML = '';

  CROSS_DATASET.forEach(item => {
    const mediaPath = findByAliases(files, item.aliases, item.dataset);
    target.appendChild(createVideoCard(item.dataset, item.name, mediaPath));
  });
}

function renderDatasetSlider(files, dataset, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '';

  const items = DATASETS[dataset].map(item => ({
    ...item,
    mediaPath: findByAliases(files, item.aliases, dataset)
  }));

  const pages = [];
  for (let i = 0; i < items.length; i += 3) pages.push(items.slice(i, i + 3));

  const track = document.createElement('div');
  track.className = 'slider-track';

  pages.forEach((page, pageIndex) => {
    const slide = document.createElement('div');
    slide.className = 'slider-page';
    slide.dataset.slideIndex = pageIndex;
    page.forEach(item => slide.appendChild(createVideoCard(dataset, item.name, item.mediaPath)));
    track.appendChild(slide);
  });

  target.appendChild(track);
  setupSlider(targetId, pages.length);
}

function setupSlider(targetId, pageCount) {
  const slider = document.getElementById(targetId);
  const controls = document.querySelector(`[data-controls-for="${targetId}"]`);
  if (!slider || !controls) return;

  const track = slider.querySelector('.slider-track');
  const prev = controls.querySelector('[data-slider-prev]');
  const next = controls.querySelector('[data-slider-next]');
  const dots = controls.querySelector('[data-slider-dots]');
  let current = 0;

  dots.innerHTML = '';
  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  }

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    prev.disabled = pageCount <= 1;
    next.disabled = pageCount <= 1;
    [...dots.children].forEach((dot, index) => dot.classList.toggle('active', index === current));
  }

  function goTo(index) {
    if (pageCount <= 0) return;
    current = (index + pageCount) % pageCount;
    update();
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  update();
}

function showAssetError(message) {
  document.querySelectorAll('.asset-frame:not(.asset-resolved) .asset-loading').forEach(node => {
    node.textContent = message;
    node.classList.add('asset-error');
  });
}

async function initRepositoryAssets() {
  try {
    const files = await getRepoTree();
    resolveStaticAssets(files);
    renderCrossDataset(files);
    renderDatasetSlider(files, 'EDS', 'eds-slider');
    renderDatasetSlider(files, 'EC', 'ec-slider');
    showAssetError('Asset not found in docs/. Check the filename in the repository.');
  } catch (error) {
    console.error(error);
    showAssetError('Could not read the docs/ asset list from GitHub.');

    renderCrossDataset([]);
    renderDatasetSlider([], 'EDS', 'eds-slider');
    renderDatasetSlider([], 'EC', 'ec-slider');
  }
}

initRepositoryAssets();
