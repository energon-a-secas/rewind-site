// ===== Icon Management and Picker =====

import { convex, api, auth } from './state.js';
import { showModal, closeModal, showToast, createElement, escHtml } from './utils.js';

// ===== Icon Picker for Users =====

export async function showIconPicker(currentIcon, onSelect) {
  const content = createElement('div', 'icon-picker-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Choose an Icon</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="icon-category-tabs">
        <button class="category-tab active" data-category="all">All</button>
      </div>
      <div class="icon-search">
        <input type="text" id="icon-search-input" placeholder="Search icons..." />
      </div>
      <div id="icon-picker-grid" class="icon-picker-grid">
        <div class="loading">Loading icons...</div>
      </div>
      <div class="icon-preview" id="icon-preview">
        ${currentIcon ? `Current: ${currentIcon}` : 'No icon selected'}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="select-icon-btn" disabled>Select Icon</button>
    </div>
  `;

  showModal(content);

  // Load categories
  await loadIconCategories(content);

  // Load icons
  await loadIconsForPicker(content);

  // Setup search
  const searchInput = content.querySelector('#icon-search-input');
  searchInput.addEventListener('input', (e) => {
    filterIcons(content, e.target.value);
  });

  // Setup select button
  const selectBtn = content.querySelector('#select-icon-btn');
  selectBtn.addEventListener('click', () => {
    const selected = content.querySelector('.icon-picker-item.selected');
    if (selected) {
      onSelect(selected.dataset.iconUrl, selected.dataset.iconName);
      closeModal();
    }
  });
}

async function loadIconCategories(modal) {
  try {
    const tabsContainer = modal.querySelector('.icon-category-tabs');

    // Always add "All" tab first
    const allTab = tabsContainer.querySelector('[data-category="all"]');

    // Load categories from backend
    const result = await convex.query(api.icons.listCategories);

    if (result.ok) {
      result.categories.forEach(category => {
        const tab = createElement('button', 'category-tab');
        tab.textContent = category.name;
        tab.dataset.categoryId = category.id;
        tab.dataset.category = category.name.toLowerCase();
        tab.addEventListener('click', () => selectCategoryTab(modal, category.id, category.name));
        tabsContainer.appendChild(tab);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function selectCategoryTab(modal, categoryId, categoryName) {
  // Update active tab
  modal.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
  modal.querySelector(`[data-category="${categoryName.toLowerCase()}"]`)?.classList.add('active') ||
  modal.querySelector('[data-category="all"]')?.classList.add('active');

  // Load icons for category
  loadIconsForPicker(modal, categoryId);
}

async function loadIconsForPicker(modal, categoryId = null) {
  const grid = modal.querySelector('#icon-picker-grid');

  try {
    const result = await convex.query(api.icons.getIconsForPicker, {
      categoryId,
      limit: 96,
    });

    if (result.ok) {
      renderIconGrid(grid, result.icons);
    } else {
      grid.innerHTML = '<div class="error">Failed to load icons</div>';
    }
  } catch (error) {
    console.error('Error loading icons:', error);
    grid.innerHTML = '<div class="error">Error loading icons</div>';
  }
}

function renderIconGrid(container, icons) {
  clearElement(container);

  if (icons.length === 0) {
    container.innerHTML = '<div class="no-icons">No icons available. Contact admin to add icons.</div>';
    return;
  }

  icons.forEach(icon => {
    const item = createElement('div', 'icon-picker-item');
    item.dataset.iconUrl = icon.url;
    item.dataset.iconName = icon.name;
    item.dataset.category = icon.category;
    item.title = `${icon.name} (${icon.category})`;

    // Try to detect if it's an emoji or image
    if (icon.url.includes('emoji')) {
      item.textContent = icon.name; // Assume name contains emoji
    } else {
      const img = createElement('img');
      img.src = icon.url;
      img.alt = icon.name;
      img.onerror = () => {
        item.textContent = icon.name.charAt(0).toUpperCase();
      };
      item.appendChild(img);
    }

    item.addEventListener('click', () => selectIconItem(container, item, icon));
    container.appendChild(item);
  });
}

function selectIconItem(container, item, icon) {
  // Deselect all
  container.querySelectorAll('.icon-picker-item').forEach(i => i.classList.remove('selected'));

  // Select this one
  item.classList.add('selected');

  // Update preview
  const modal = item.closest('.icon-picker-modal');
  const preview = modal.querySelector('#icon-preview');
  preview.innerHTML = `Selected: <img src="${icon.url}" alt="${icon.name}" style="width: 24px; height: 24px; vertical-align: middle;" /> ${escHtml(icon.name)}`;

  // Enable select button
  const selectBtn = modal.querySelector('#select-icon-btn');
  selectBtn.disabled = false;
}

function filterIcons(modal, searchTerm) {
  const items = modal.querySelectorAll('.icon-picker-item');
  const term = searchTerm.toLowerCase();

  items.forEach(item => {
    const name = item.dataset.iconName.toLowerCase();
    const category = item.dataset.category.toLowerCase();

    if (name.includes(term) || category.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// ===== Icon Upload Management (Admin) =====

export async function showIconManagement() {
  if (!auth.isAuthenticated || auth.role !== 'admin') {
    showToast('Admin access required', 'error');
    return;
  }

  const content = createElement('div', 'icon-management-modal');
  content.innerHTML = `
    <div class="modal-header">
      <h2>Icon Management</h2>
      <button class="modal-close" onclick="window.closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="management-tabs">
        <button class="tab-btn active" data-tab="upload">Upload Icons</button>
        <button class="tab-btn" data-tab="browse">Browse Icons</button>
        <button class="tab-btn" data-tab="categories">Categories</button>
      </div>
      <div id="tab-content">
        <!-- Content loaded dynamically -->
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="window.closeModal()">Close</button>
    </div>
  `;

  showModal(content);

  // Setup tabs
  const tabs = content.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadTabContent(content, tab.dataset.tab);
    });
  });

  // Load initial tab
  loadTabContent(content, 'upload');
}

async function loadTabContent(modal, tab) {
  const container = modal.querySelector('#tab-content');

  switch (tab) {
    case 'upload':
      await loadUploadTab(container);
      break;
    case 'browse':
      await loadBrowseTab(container);
      break;
    case 'categories':
      await loadCategoriesTab(container);
      break;
  }
}

async function loadUploadTab(container) {
  container.innerHTML = `
    <div class="upload-section">
      <div class="form-group">
        <label for="icon-category">Category</label>
        <select id="icon-category" class="form-control">
          <option value="">Loading categories...</option>
        </select>
      </div>
      <div class="form-group">
        <label for="icon-name">Icon Name</label>
        <input type="text" id="icon-name" class="form-control" placeholder="e.g., Meditation pose">
      </div>
      <div class="form-group">
        <label for="icon-file">Icon File (PNG or SVG)</label>
        <input type="file" id="icon-file" accept=".png,.svg" class="form-control">
      </div>
      <div class="upload-preview" id="upload-preview" style="display: none;">
        <img id="preview-image" style="max-width: 100px; max-height: 100px;" />
      </div>
      <button class="btn btn-primary" id="upload-btn" disabled>Upload Icon</button>
      <div class="upload-progress" id="upload-progress" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>
  `;

  // Load categories
  try {
    const result = await convex.query(api.icons.listCategories);
    const select = container.querySelector('#icon-category');

    if (result.ok && result.categories.length > 0) {
      select.innerHTML = result.categories.map(cat =>
        `<option value="${cat.id}">${escHtml(cat.name)}</option>`
      ).join('');
    } else {
      select.innerHTML = '<option value="">No categories found</option>';
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  // Setup file preview
  const fileInput = container.querySelector('#icon-file');
  const preview = container.querySelector('#upload-preview');
  const previewImg = container.querySelector('#preview-image');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Setup upload button
  const uploadBtn = container.querySelector('#upload-btn');
  uploadBtn.addEventListener('click', () => uploadIcon(container));
  uploadBtn.disabled = false;
}

async function uploadIcon(container) {
  const categoryId = container.querySelector('#icon-category').value;
  const name = container.querySelector('#icon-name').value.trim();
  const file = container.querySelector('#icon-file').files[0];

  if (!categoryId || !name || !file) {
    showToast('Please fill all fields and select a file', 'warning');
    return;
  }

  if (!file.name.match(/\.(png|svg)$/i)) {
    showToast('Only PNG and SVG files allowed', 'error');
    return;
  }

  const btn = container.querySelector('#upload-btn');
  const progress = container.querySelector('#upload-progress');

  btn.disabled = true;
  btn.textContent = 'Uploading...';
  progress.style.display = 'block';

  try {
    // Get upload URL
    const uploadResult = await convex.mutation(api.icons.getUploadUrl, {
      categoryId,
      filename: file.name,
      username: auth.username,
    });

    if (!uploadResult.ok) {
      showToast(`Upload failed: ${uploadResult.error}`, 'error');
      return;
    }

    // Upload to storage
    const response = await fetch(uploadResult.uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    // Save icon record
    const saveResult = await convex.mutation(api.icons.saveIcon, {
      categoryId,
      name,
      filename: file.name,
      storageId: uploadResult.storageId,
      username: auth.username,
    });

    if (saveResult.ok) {
      showToast(`Icon "${name}" uploaded successfully!`, 'success');
      container.querySelector('#icon-name').value = '';
      container.querySelector('#icon-file').value = '';
      container.querySelector('#upload-preview').style.display = 'none';
    } else {
      showToast(`Save failed: ${saveResult.error}`, 'error');
    }
  } catch (error) {
    console.error('Upload error:', error);
    showToast('Error uploading icon', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upload Icon';
    progress.style.display = 'none';
  }
}

async function loadBrowseTab(container) {
  container.innerHTML = '<div class="loading">Loading icons...</div>';

  try {
    const result = await convex.query(api.icons.listIcons, {});

    if (result.ok) {
      renderIconBrowser(container, result.icons);
    } else {
      container.innerHTML = '<div class="error">Failed to load icons</div>';
    }
  } catch (error) {
    console.error('Error loading icons:', error);
    container.innerHTML = '<div class="error">Error loading icons</div>';
  }
}

function renderIconBrowser(container, icons) {
  if (icons.length === 0) {
    container.innerHTML = '<div class="no-icons">No icons uploaded yet.</div>';
    return;
  }

  // Group by category
  const byCategory = icons.reduce((acc, icon) => {
    if (!acc[icon.category]) acc[icon.category] = [];
    acc[icon.category].push(icon);
    return acc;
  }, {});

  let html = '';
  Object.entries(byCategory).forEach(([category, icons]) => {
    html += `
      <div class="category-section">
        <h3>${escHtml(category)} (${icons.length})</h3>
        <div class="icon-grid">
          ${icons.map(icon => `
            <div class="icon-item" data-icon-id="${icon.id}">
              <img src="${icon.url}" alt="${escHtml(icon.name)}" />
              <div class="icon-name">${escHtml(icon.name)}</div>
              <div class="icon-actions">
                <button class="btn-icon delete-icon" title="Delete">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Setup delete actions
  container.querySelectorAll('.delete-icon').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const iconItem = e.target.closest('.icon-item');
      const iconId = iconItem.dataset.iconId;
      deleteIcon(iconId);
    });
  });
}

async function deleteIcon(iconId) {
  if (!confirm('Are you sure you want to delete this icon?')) return;

  try {
    const result = await convex.mutation(api.icons.deleteIcon, {
      iconId,
      username: auth.username,
    });

    if (result.ok) {
      showToast('Icon deleted successfully', 'success');
      // Refresh the browse tab
      const modal = document.querySelector('.icon-management-modal');
      loadTabContent(modal, 'browse');
    } else {
      showToast(`Delete failed: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting icon', 'error');
  }
}

async function loadCategoriesTab(container) {
  container.innerHTML = `
    <div class="categories-section">
      <h3>Icon Categories</h3>
      <div class="category-list" id="category-list">
        <div class="loading">Loading categories...</div>
      </div>
      <div class="add-category">
        <h4>Add New Category</h4>
        <input type="text" id="new-category-name" placeholder="Category name" />
        <textarea id="new-category-description" placeholder="Description (optional)"></textarea>
        <button class="btn btn-primary" id="add-category-btn">Add Category</button>
      </div>
    </div>
  `;

  // Load categories
  try {
    const result = await convex.query(api.icons.listCategories);
    const listContainer = container.querySelector('#category-list');

    if (result.ok) {
      renderCategoryList(listContainer, result.categories);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  // Setup add category button
  const addBtn = container.querySelector('#add-category-btn');
  addBtn.addEventListener('click', () => addCategory(container));
}

function renderCategoryList(container, categories) {
  if (categories.length === 0) {
    container.innerHTML = '<div class="no-categories">No categories found. Add one below!</div>';
    return;
  }

  container.innerHTML = `
    <div class="category-grid">
      ${categories.map(cat => `
        <div class="category-item">
          <div class="category-info">
            <div class="category-name">${escHtml(cat.name)}</div>
            <div class="category-description">${escHtml(cat.description || 'No description')}</div>
            <div class="category-count">${cat.iconCount} icons</div>
          </div>
          <div class="category-actions">
            <button class="btn-icon delete-category" data-category-id="${cat.id}" ${cat.iconCount > 0 ? 'disabled title="Delete icons first"' : ''}>🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Setup delete actions
  container.querySelectorAll('.delete-category').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const categoryId = e.target.dataset.categoryId;
      deleteCategory(categoryId);
    });
  });
}

async function addCategory(container) {
  const name = container.querySelector('#new-category-name').value.trim();
  const description = container.querySelector('#new-category-description').value.trim();

  if (!name) {
    showToast('Category name is required', 'warning');
    return;
  }

  try {
    const result = await convex.mutation(api.icons.createCategory, {
      username: auth.username,
      name,
      description: description || undefined,
    });

    if (result.ok) {
      showToast(`Category "${name}" created!`, 'success');
      container.querySelector('#new-category-name').value = '';
      container.querySelector('#new-category-description').value = '';
      loadCategoriesTab(container);
      loadIconCategories(); // Refresh category list
    } else {
      showToast(`Failed: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error creating category:', error);
    showToast('Error creating category', 'error');
  }
}

async function deleteCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const result = await convex.mutation(api.icons.deleteCategory, {
      categoryId,
      username: auth.username,
    });

    if (result.ok) {
      showToast('Category deleted', 'success');
      const modal = document.querySelector('.icon-management-modal');
      loadCategoriesTab(modal.querySelector('#tab-content'));
    } else {
      showToast(`Delete failed: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting category', 'error');
  }
}

// ===== Utility Functions =====

function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

async function loadIconCategories() {
  // Reload categories in the icon picker
  // This would be called after adding/deleting categories
}

// ===== Emoji Fallback =====

export function isEmoji(str) {
  // Simple check if string contains emoji
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
  return emojiRegex.test(str);
}

export function getEmojiForCategory(category) {
  const categoryEmojis = {
    'meditation': '🧘',
    'fitness': '💪',
    'creative': '🎨',
    'tech': '💻',
    'learning': '📚',
    'languages': '🗣️',
    'music': '🎵',
    'culinary': '🍳',
    'social': '👥',
    'hobbies': '🎯',
    'default': '⭐'
  };

  return categoryEmojis[category.toLowerCase()] || categoryEmojis.default;
}

// ===== Initialization =====

// Seed preset categories when admin first opens management
export async function seedPresetIconCategories() {
  if (!auth.isAuthenticated || auth.role !== 'admin') {
    showToast('Admin access required', 'error');
    return;
  }

  try {
    const result = await convex.mutation(api.icons.seedPresetCategories, {
      username: auth.username,
    });

    if (result.ok) {
      showToast(`Created ${result.count} preset categories!`, 'success');
      return true;
    } else {
      showToast(`Seeding failed: ${result.error}`, 'error');
      return false;
    }
  } catch (error) {
    console.error('Seeding error:', error);
    showToast('Error seeding categories', 'error');
    return false;
  }
}

// Re-export for convenience
export { loadIconCategories, getEmojiForCategory } from './icons.js';
