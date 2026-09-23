import { state } from './state.js';
import { filteredSites } from './data.js';
import { escHtml, domainFromUrl, previewSrc } from './utils.js';

function renderListPills() {
  const row = document.getElementById('listPills');
  if (!row) return;
  const allActive = !state.activeListId;
  let html =
    '<button type="button" class="list-pill' +
    (allActive ? ' active' : '') +
    '" data-list="">All sites</button>';
  state.lists.forEach((list) => {
    const active = state.activeListId === list.id;
    const count = (list.siteIds || []).length;
    html +=
      '<button type="button" class="list-pill' +
      (active ? ' active' : '') +
      '" data-list="' +
      escHtml(list.id) +
      '">' +
      escHtml(list.label) +
      (count ? ' (' + count + ')' : '') +
      '</button>';
  });
  row.innerHTML = html;
}

function renderListHint() {
  const el = document.getElementById('listHint');
  if (!el) return;
  if (!state.activeListId) {
    el.textContent = '';
    el.hidden = true;
    return;
  }
  const list = state.lists.find((l) => l.id === state.activeListId);
  if (!list) {
    el.hidden = true;
    return;
  }
  el.textContent = list.description || '';
  el.hidden = !list.description;
}

function siteRow(site) {
  const domain = domainFromUrl(site.url);
  const preview = previewSrc(site);
  const labels = (site.labels || [])
    .map((l) => '<span class="site-row__tag">' + escHtml(l) + '</span>')
    .join('');
  const hub = site.featuredOnHub ? '<span class="site-row__hub">On hub</span>' : '';

  let previewHtml;
  if (preview) {
    previewHtml =
      '<img src="' +
      escHtml(preview) +
      '" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.classList.add(\'is-visible\')">' +
      '<div class="preview-fallback" aria-hidden="true">Preview</div>';
  } else {
    previewHtml = '<div class="preview-fallback is-visible" aria-hidden="true">No preview</div>';
  }

  return (
    '<a class="site-row" data-site-id="' +
    escHtml(site.id) +
    '" href="' +
    escHtml(site.url) +
    '" target="_blank" rel="noopener noreferrer">' +
    '<div class="site-row__preview">' +
    previewHtml +
    '</div>' +
    '<div class="site-row__body">' +
    '<div class="site-row__meta">' +
    '<span class="site-row__domain">' +
    escHtml(domain) +
    '</span>' +
    hub +
    '</div>' +
    '<h2 class="site-row__name">' +
    escHtml(site.name) +
    '</h2>' +
    '<p class="site-row__desc">' +
    escHtml(site.description) +
    '</p>' +
    (labels ? '<div class="site-row__tags">' + labels + '</div>' : '') +
    '</div>' +
    '</a>'
  );
}

function renderCatalogMeta() {
  const el = document.getElementById('catalogMeta');
  if (!el || state.loading) return;
  const nSites = state.sites.length;
  const nLists = state.lists.length;
  if (!nSites) return;
  el.textContent = nSites + ' sites · ' + nLists + ' lists';
}

function renderFeed() {
  const feed = document.getElementById('sitesFeed');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');
  if (!feed) return;

  const items = filteredSites();
  if (count) {
    count.textContent = items.length ? items.length + ' shown' : '';
  }

  if (state.loading) {
    feed.innerHTML = '<p class="status-msg">Loading catalog…</p>';
    if (empty) empty.hidden = true;
    return;
  }

  if (state.error) {
    feed.innerHTML =
      '<p class="status-msg status-msg--error">' + escHtml(state.error) + '</p>';
    if (empty) empty.hidden = true;
    return;
  }

  if (!items.length) {
    feed.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  feed.innerHTML = items.map(siteRow).join('');
}

export function render() {
  renderCatalogMeta();
  renderListPills();
  renderListHint();
  renderFeed();
}
