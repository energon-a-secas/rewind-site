// ===== DOM Rendering for Skill Roadmap =====

import {
  state,
  getNode,
  getColumn,
  getLane,
  nodesInLane,
  getEdge,
  getIncomingEdges,
  getNextNodeId,
  getNextColumnId,
  getNextEdgeId,
} from './state.js';
import {
  showToast,
  escHtml,
  toggleSection,
  createElement,
  clearElement,
} from './utils.js';
import {
  showLevelUpCelebration,
  showXPGain,
  createConfetti,
} from './animations.js';
} from './utils.js';

// ===== Main Rendering Pipeline =====

export function renderAll() {
  renderTitle();
  renderColumns();
  renderConnections();
  renderColorLegend();
  renderMarkerLegend();
  updateLockedStates();
}

export function renderTitle() {
  const titleEl = document.getElementById('diagram-title');
  if (titleEl && state.title !== titleEl.value) {
    titleEl.value = state.title;
  }
}

export function renderColumns() {
  const columnArea = document.getElementById('column-area');
  clearElement(columnArea);

  state.columns.forEach((column) => {
    const columnEl = createColumnElement(column);
    columnArea.appendChild(columnEl);
  });

  updateSidebarMinHeight();
}

export function renderConnections() {
  const svg = document.getElementById('svg-overlay');
  clearElement(svg);

  // Recreate defs with arrow markers
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  Object.entries(state.colorLegend).forEach(([color, type]) => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', `arrow-${type}`);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L0,6 L8,3 z');
    path.setAttribute('fill', color);
    path.setAttribute('opacity', '0.9');

    marker.appendChild(path);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);

  // Render each edge
  state.edges.forEach((edge) => {
    const path = createEdgePath(edge);
    if (path) svg.appendChild(path);
  });

  updateSvgSize(svg);
}

export function renderColorLegend() {
  const listEl = document.getElementById('color-legend-list');
  if (!listEl) return;

  clearElement(listEl);

  Object.entries(state.colorLegend).forEach(([hex, label]) => {
    const item = createLegendItem(hex, label, 'color', () => openEditColorModal(hex));
    listEl.appendChild(item);
  });
}

export function renderMarkerLegend() {
  const listEl = document.getElementById('marker-legend-list');
  if (!listEl) return;

  clearElement(listEl);

  Object.entries(state.markerLegend).forEach(([key, label]) => {
    const item = createLegendItem(key, label, 'marker', () => openEditMarkerModal(key));
    listEl.appendChild(item);
  });
}

// ===== Column & Lane Rendering =====

function createColumnElement(column) {
  const wrapper = createElement('div', 'lanes-wrapper');
  wrapper.dataset.columnId = column.id;

  // Column header
  const header = createElement('div', 'lane-head-row');
  const title = createElement('div', 'lane-title');
  title.textContent = column.name;
  title.contentEditable = true;
  title.spellcheck = false;

  title.addEventListener('blur', () => {
    column.name = title.textContent.trim();
    saveState();
  });

  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      title.blur();
    }
  });

  const deleteBtn = createElement('button', 'btn-icon');
  deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  deleteBtn.onclick = () => deleteColumn(column.id);
  deleteBtn.title = 'Delete column';

  header.appendChild(title);
  header.appendChild(deleteBtn);
  wrapper.appendChild(header);

  // Lanes
  column.lanes.forEach((lane) => {
    const laneEl = createLaneElement(column.id, lane);
    wrapper.appendChild(laneEl);
  });

  // Add lane button
  const addLaneBtn = createElement('button', 'btn-add-lane');
  addLaneBtn.innerHTML = '<svg viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Add lane';
  addLaneBtn.onclick = () => addLane(column.id);
  wrapper.appendChild(addLaneBtn);

  return wrapper;
}

function createLaneElement(columnId, lane) {
  const laneEl = createElement('div', 'lane');
  laneEl.dataset.laneId = lane.id;

  // Lane header
  const header = createElement('div', 'lane-header');
  const name = createElement('div', 'lane-name');
  name.textContent = lane.name || 'Lane';
  name.contentEditable = true;
  name.spellcheck = false;

  name.addEventListener('blur', () => {
    lane.name = name.textContent.trim();
    saveState();
  });

  const deleteBtn = createElement('button', 'btn-icon-small');
  deleteBtn.innerHTML = '<svg viewBox="0 0 16 16"><path d="M12 4l-8 8M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  deleteBtn.onclick = () => deleteLane(columnId, lane.id);
  if (state.columns.find(c => c.id === columnId)?.lanes.length <= 1) {
    deleteBtn.disabled = true;
    deleteBtn.style.opacity = '0.3';
  }

  header.appendChild(name);
  header.appendChild(deleteBtn);
  laneEl.appendChild(header);

  // Nodes container
  const nodesContainer = createElement('div', 'nodes-container');
  const nodes = nodesInLane(columnId, lane.id);
  nodes.sort((a, b) => a.row - b.row);

  nodes.forEach((node, index) => {
    const nodeEl = createNodeElement(node, index);
    nodesContainer.appendChild(nodeEl);
  });

  // Add node button
  const addNodeBtn = createElement('button', 'node-add');
  addNodeBtn.innerHTML = '<svg viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  addNodeBtn.onclick = () => addNode(columnId, lane.id);
  addNodeBtn.title = 'Add node';
  nodesContainer.appendChild(addNodeBtn);

  laneEl.appendChild(nodesContainer);
  return laneEl;
}

// ===== Node Rendering with XP Bars =====

function createNodeElement(node, index) {
  const nodeEl = createElement('div', 'node');
  nodeEl.dataset.nodeId = node.id;
  nodeEl.dataset.color = node.color;
  nodeEl.dataset.locked = node.locked;
  nodeEl.style.minHeight = `${56 + (node.rowSpan - 1) * 60}px`;

  // Color bar
  const colorBar = createElement('div', 'node-color-bar');
  colorBar.style.backgroundColor = node.color;
  nodeEl.appendChild(colorBar);

  // Content wrapper
  const content = createElement('div', 'node-content');

  // Icon (if exists)
  if (node.icon) {
    const icon = createElement('div', 'node-icon');
    icon.textContent = node.icon;
    content.appendChild(icon);
  }

  // Text
  const text = createElement('div', 'node-text');
  text.textContent = node.text;
  text.contentEditable = true;
  text.spellcheck = false;

  text.addEventListener('blur', () => {
    node.text = text.textContent.trim();
    saveState();
  });

  text.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    selectAllText(text);
  });

  content.appendChild(text);

  // XP Bar (new gamification feature)
  if (node.xp !== undefined) {
    const xpContainer = createElement('div', 'node-xp-container');

    // XP progress bar
    const progressBar = createElement('div', 'node-xp-bar');
    const progressFill = createElement('div', 'node-xp-fill');

    const xpToNext = xpToNextLevel(node.xp, node.level || 1);
    const totalNeeded = calculateXPForLevel(node.level || 1);
    const currentLevelXP = totalNeeded - xpToNext;
    const progress = ((node.xp - currentLevelXP) / (totalNeeded - currentLevelXP)) * 100;

    progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    progressBar.appendChild(progressFill);

    // Level badge
    const levelBadge = createElement('div', 'node-level-badge');
    levelBadge.textContent = `Lv.${node.level || 1}`;

    // Streak flame
    if (node.streak && node.streak.currentStreak > 0) {
      const flame = createElement('div', 'node-streak-flame');
      flame.innerHTML = `🔥 ${node.streak.currentStreak}d`;
      xpContainer.appendChild(flame);
    }

    xpContainer.appendChild(progressBar);
    xpContainer.appendChild(levelBadge);
    content.appendChild(xpContainer);
  }

  nodeEl.appendChild(content);

  // Lock icon
  const lockIcon = createElement('div', 'node-lock hidden');
  lockIcon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  `;
  nodeEl.appendChild(lockIcon);

  // Port circles (for connections)
  const ports = createElement('div', 'node-ports');
  ['top', 'right', 'bottom', 'left'].forEach((side) => {
    const port = createElement('div', `node-port node-port-${side}`);
    port.dataset.side = side;
    port.addEventListener('click', (e) => handlePortClick(node.id, side, e));
    port.addEventListener('mousedown', (e) => startPortDrag(node.id, side, e));
    ports.appendChild(port);
  });
  nodeEl.appendChild(ports);

  // Drag handle
  const dragHandle = createElement('div', 'node-drag-handle');
  dragHandle.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 5h2v2H9zm0 4h2v2H9zm0 4h2v2H9zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z" fill="currentColor"/></svg>';
  nodeEl.appendChild(dragHandle);

  // Event listeners
  nodeEl.addEventListener('contextmenu', (e) => showNodeContextMenu(e, node.id));
  nodeEl.addEventListener('click', (e) => {
    if (!e.target.closest('.node-text[contenteditable="true"]')) {
      selectNode(node.id);
    }
  });

  setupNodeDrag(nodeEl, node.id);

  return nodeEl;
}

// ===== XP & Gamification Rendering =====

export function renderXPBars() {
  state.nodes.forEach((node) => {
    const nodeEl = document.querySelector(`[data-node-id="${node.id}"]`);
    if (!nodeEl) return;

    let xpContainer = nodeEl.querySelector('.node-xp-container');

    // Create XP container if it doesn't exist
    if (!xpContainer && (node.xp !== undefined || node.skillId)) {
      const content = nodeEl.querySelector('.node-content');
      xpContainer = createElement('div', 'node-xp-container');

      // Add progress bar
      const progressBar = createElement('div', 'node-xp-bar');
      const progressFill = createElement('div', 'node-xp-fill');
      progressBar.appendChild(progressFill);

      // Add level badge
      const levelBadge = createElement('div', 'node-level-badge');
      levelBadge.textContent = 'Lv.1';

      xpContainer.appendChild(progressBar);
      xpContainer.appendChild(levelBadge);
      content.appendChild(xpContainer);
    }

    // Update XP bar if exists
    if (xpContainer && node.xp !== undefined) {
      const progressFill = xpContainer.querySelector('.node-xp-fill');
      const levelBadge = xpContainer.querySelector('.node-level-badge');

      const xpToNext = xpToNextLevel(node.xp, node.level || 1);
      const totalNeeded = calculateXPForLevel(node.level || 1);
      const currentLevelXP = totalNeeded - xpToNext;
      const progress = ((node.xp - currentLevelXP) / (totalNeeded - currentLevelXP)) * 100;

      progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      levelBadge.textContent = `Lv.${node.level || 1}`;

      // Add streak indicator
      if (node.streak && node.streak.currentStreak > 0) {
        let flame = xpContainer.querySelector('.node-streak-flame');
        if (!flame) {
          flame = createElement('div', 'node-streak-flame');
          xpContainer.insertBefore(flame, progressBar);
        }
        flame.innerHTML = `🔥 ${node.streak.currentStreak}d`;
      }
    }
  });
}

export function animateLevelUp(nodeId, oldLevel, newLevel) {
  const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!nodeEl) return;

  // Add glow effect to node
  nodeEl.style.boxShadow = '0 0 30px rgba(147, 51, 234, 0.8)';
  nodeEl.style.transform = 'scale(1.05)';
  setTimeout(() => {
    nodeEl.style.transform = '';
    nodeEl.style.boxShadow = '';
  }, 800);

  // Show celebration popup and confetti
  showLevelUpCelebration(oldLevel, newLevel);
  createConfetti(30);
}

export function animateXPGain(nodeId, xpGained) {
  const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!nodeEl || xpGained <= 0) return;

  // Use new XP gain animation
  showXPGain(nodeEl, xpGained);
}

// ===== Connection Line Rendering =====

function createEdgePath(edge) {
  const fromNode = getNode(edge.from);
  const toNode = getNode(edge.to);
  if (!fromNode || !toNode) return null;

  const fromPos = getNodeScreenPosition(fromNode.id, edge.fromPort || 'right');
  const toPos = getNodeScreenPosition(toNode.id, edge.toPort || 'left');

  if (!fromPos || !toPos) return null;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.dataset.edgeId = edge.id;
  const d = createBezierPath(fromPos, toPos, edge);
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', getEdgeColor(edge.type));
  path.setAttribute('stroke-width', '2');
  path.setAttribute('data-edge-type', edge.type);
  path.setAttribute('marker-end', `url(#arrow-${edge.type})`);

  path.addEventListener('click', (e) => showEdgeTypeMenu(e, edge.id));

  return path;
}

function createBezierPath(from, to, edge) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let controlOffset = Math.min(distance / 3, 150);

  const fromColIndex = state.columns.findIndex((c) => c.id === getNode(edge.from).columnId);
  const toColIndex = state.columns.findIndex((c) => c.id === getNode(edge.to).columnId);

  if (fromColIndex === toColIndex) {
    // Same column - vertical curve
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} Q ${from.x} ${midY} ${to.x} ${to.y}`;
  } else {
    // Different columns - horizontal curve
    const midX = (from.x + to.x) / 2;
    const controlX = from.x < to.x ? midX : midX;
    return `M ${from.x} ${from.y} Q ${controlX} ${from.y} ${to.x} ${to.y}`;
  }
}

function getNodeScreenPosition(nodeId, portSide = 'right') {
  const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!nodeEl) return null;

  const rect = nodeEl.getBoundingClientRect();
  const canvas = document.getElementById('canvas');
  const canvasRect = canvas.getBoundingClientRect();

  const portOffset = 4; // Distance from edge
  const x = rect.left - canvasRect.left;
  const y = rect.top - canvasRect.top;
  const w = rect.width;
  const h = rect.height;

  switch (portSide) {
    case 'left':
      return { x: x + portOffset, y: y + h / 2 };
    case 'right':
      return { x: x + w - portOffset, y: y + h / 2 };
    case 'top':
      return { x: x + w / 2, y: y + portOffset };
    case 'bottom':
      return { x: x + w / 2, y: y + h - portOffset };
    default:
      return { x: x + w / 2, y: y + h / 2 };
  }
}

function updateSvgSize(svg) {
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  svg.setAttribute('width', rect.width);
  svg.setAttribute('height', rect.height);
}

// ===== Legend Item Rendering =====

function createLegendItem(key, label, type, onEdit) {
  const item = createElement('div', 'legend-item');
  item.dataset.key = key;

  const preview = createElement('div', 'legend-preview');
  if (type === 'color') {
    preview.style.backgroundColor = key;
  } else if (type === 'marker') {
    preview.innerHTML = MARKER_ICONS[key] || '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
  }

  const name = createElement('div', 'legend-name');
  name.textContent = label;

  const editBtn = createElement('button', 'legend-edit');
  editBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  editBtn.onclick = () => onEdit(key);

  item.appendChild(preview);
  item.appendChild(name);
  item.appendChild(editBtn);

  return item;
}

// ===== Locked State Management =====

export function updateLockedStates() {
  const nodeElements = document.querySelectorAll('.node');

  nodeElements.forEach((nodeEl) => {
    const nodeId = nodeEl.dataset.nodeId;
    const node = getNode(nodeId);
    if (!node) return;

    const isEffectivelyLocked = isNodeEffectivelyLocked(nodeId);
    const hasIncomingBlocks = getIncomingEdges(nodeId).some(e => e.type === 'blocks');

    nodeEl.classList.toggle('effectively-locked', isEffectivelyLocked);
    nodeEl.classList.toggle('blocked', isEffectivelyLocked && hasIncomingBlocks);

    const lockIcon = nodeEl.querySelector('.node-lock');
    if (lockIcon) {
      lockIcon.classList.toggle('hidden', !node.locked);
    }

    // Show/hide port circles based on lock state
    const ports = nodeEl.querySelectorAll('.node-port');
    ports.forEach(port => {
      port.style.opacity = isEffectivelyLocked ? '0.2' : '1';
    });
  });
}

function isNodeEffectivelyLocked(nodeId) {
  const visited = new Set();
  return checkUpstreamLocks(nodeId, visited);
}

function checkUpstreamLocks(nodeId, visited) {
  if (visited.has(nodeId)) return false;
  visited.add(nodeId);

  const node = getNode(nodeId);
  if (node?.locked) return true;

  // Check if any upstream nodes are locked or effectively locked
  const incoming = getIncomingEdges(nodeId);
  for (const edge of incoming) {
    if (edge.type === 'blocks') {
      const upstreamNode = getNode(edge.from);
      if (upstreamNode && (upstreamNode.locked || checkUpstreamLocks(edge.from, visited))) {
        return true;
      }
    }
  }

  return false;
}

// ===== Selection =====

function selectNode(nodeId) {
  document.querySelectorAll('.node-selected').forEach(el => el.classList.remove('node-selected'));
  const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (nodeEl) {
    nodeEl.classList.add('node-selected');
    ui.selectedNode = nodeId;
  }
}

// ===== Text Selection Helper =====

function selectAllText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// ===== Layout Helpers =====

function updateSidebarMinHeight() {
  const canvas = document.getElementById('canvas');
  const sidebarInner = document.getElementById('sidebar-inner');
  if (canvas && sidebarInner) {
    sidebarInner.style.minHeight = `${canvas.scrollHeight}px`;
  }
}

// ===== Edge Type Helpers =====

function getEdgeColor(type) {
  const colors = {
    blocks: '#ef4444',
    informs: '#0080ff',
    enhances: '#8b5cf6',
    enables: '#22c55e',
    prepares: '#f59e0b'
  };
  return colors[type] || '#6b7280';
}

function updateEdgeType(edgeId, newType) {
  const edge = getEdge(edgeId);
  if (edge) {
    edge.type = newType;
    saveState();
    renderConnections();
  }
}

// ===== Context Menus (placeholders) =====

function showNodeContextMenu(e, nodeId) {
  e.preventDefault();
  // Implementation in events.js
}

function showEdgeTypeMenu(e, edgeId) {
  e.preventDefault();
  // Implementation in events.js
}

function handlePortClick(nodeId, side, e) {
  e.stopPropagation();
  // Implementation in connections.js
}

function startPortDrag(nodeId, side, e) {
  e.stopPropagation();
  // Implementation in connections.js
}

function setupNodeDrag(nodeEl, nodeId) {
  // Implementation in drag.js
}

function addNode(columnId, laneId) {
  // Implementation in crud.js
}

function addLane(columnId) {
  // Implementation in crud.js
}

function deleteNode(nodeId) {
  // Implementation in crud.js
}

function deleteLane(columnId, laneId) {
  // Implementation in crud.js
}

function deleteColumn(columnId) {
  // Implementation in crud.js
}

function openEditColorModal(color) {
  // Implementation in modals.js
}

function openEditMarkerModal(marker) {
  // Implementation in modals.js
}

function saveState() {
  // Implementation in state.js
}

// ===== Constants =====

const MARKER_ICONS = {
  crown: `<svg viewBox="0 0 16 16"><path d="M2 5l4-2 2 4 2-4 4 2-1 8H3L2 5z" fill="currentColor"/></svg>`,
  star: `<svg viewBox="0 0 16 16"><path d="M8 1l2 5h5l-4 3 2 6-5-3-5 3 2-6-4-3h5z" fill="currentColor"/></svg>`,
  flame: `<svg viewBox="0 0 16 16"><path d="M8 1c-1.5 2-3 3-3 5s1.5 4 3 6c1.5-2 3-3.5 3-6S9.5 3 8 1z" fill="currentColor"/></svg>`,
  heart: `<svg viewBox="0 0 16 16"><path d="M8 14s-6-4.5-6-8A4 4 0 0110 4c1.5 0 2.8.8 3.5 2C12 3 9.5 1 8 1S4 3 4 5c0 1.2.5 2.3 1.3 3.1C6 7 7.3 6.2 8.8 6.2A2.8 2.8 0 0112 9c0 3.5-6 5-6 5z" fill="currentColor"/></svg>`,
  check: `<svg viewBox="0 0 16 16"><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg viewBox="0 0 16 16"><path d="M8 1L1 15h14L8 1zm0 4v5m0 3v0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  flag: `<svg viewBox="0 0 16 16"><path d="M4 2v12M5 3h7l-2 3 2 3H5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
  lightning: `<svg viewBox="0 0 16 16"><path d="M9 1L3 9h5l-1 6 7-9H9z" fill="currentColor"/></svg>`
};

// Re-export utilities for convenience
export {
  showToast,
  escHtml,
  toggleSection,
  createElement,
  clearElement,
  calculateXPForLevel,
  xpToNextLevel,
  calculateLevelFromXP,
} from './utils.js';
