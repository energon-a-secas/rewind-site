// ============================================================
// CHUNK 2 — DATA MODEL + RENDERING
// ============================================================

/* ===== MARKER DEFINITIONS ===== */
const MARKER_ICONS = {
  star:      `<i class="fa-solid fa-star"></i>`,
  flag:      `<i class="fa-solid fa-flag"></i>`,
  warning:   `<i class="fa-solid fa-triangle-exclamation"></i>`,
  lightning: `<i class="fa-solid fa-bolt"></i>`,
  check:     `<i class="fa-solid fa-circle-check"></i>`,
  bookmark:  `<i class="fa-solid fa-bookmark"></i>`,
  eye:       `<i class="fa-solid fa-eye"></i>`,
  fire:      `<i class="fa-solid fa-fire"></i>`,
  target:    `<i class="fa-solid fa-bullseye"></i>`,
  link:      `<i class="fa-solid fa-link"></i>`,
};

const LOCK_ICON_HTML = `<i class="fa-solid fa-lock" style="font-size:10px;color:#fff;opacity:0.8"></i>`;

function markerSVGEl(key) {
  const svgStr = MARKER_ICONS[key];
  const wrap = document.createElement('span');
  wrap.title = state.markerLegend[key] || key;
  wrap.style.cssText = 'display:inline-flex;align-items:center;line-height:1;';
  if (svgStr) {
    wrap.innerHTML = svgStr;
  } else {
    wrap.textContent = key[0].toUpperCase();
  }
  return wrap;
}

/* ===== DEFAULT STATE ===== */
function defaultState() {
  return {
    title: 'My Roadmap',
    columns: [
      { id: 'col-1', name: 'Prerequisites',  lanes: [{ id: 'ln-1', name: '' }] },
      { id: 'col-2', name: 'Core Skills',    lanes: [{ id: 'ln-2', name: '' }] },
      { id: 'col-3', name: 'Projects',       lanes: [{ id: 'ln-3', name: '' }] },
      { id: 'col-4', name: 'Outcomes',       lanes: [{ id: 'ln-4', name: '' }] }
    ],
    nodes: [
      { id: 'n-1',  columnId: 'col-1', laneId: 'ln-1', row: 0, rowSpan: 2, text: 'Foundational Concept',  color: '#ef4444', markers: ['warning'], locked: false },
      { id: 'n-2',  columnId: 'col-1', laneId: 'ln-1', row: 2, rowSpan: 1, text: 'Required Tool',          color: '#6b7280', markers: [],          locked: false },
      { id: 'n-3',  columnId: 'col-2', laneId: 'ln-2', row: 0, rowSpan: 1, text: 'Skill A',               color: '#ef4444', markers: ['flag'],    locked: false },
      { id: 'n-4',  columnId: 'col-2', laneId: 'ln-2', row: 1, rowSpan: 1, text: 'Skill B',               color: '#6b7280', markers: [],          locked: false },
      { id: 'n-5',  columnId: 'col-2', laneId: 'ln-2', row: 2, rowSpan: 1, text: 'Skill C',               color: '#22c55e', markers: ['star'],    locked: false },
      { id: 'n-6',  columnId: 'col-3', laneId: 'ln-3', row: 0, rowSpan: 1, text: 'Project Alpha',          color: '#0063e5', markers: ['check'],   locked: false },
      { id: 'n-7',  columnId: 'col-3', laneId: 'ln-3', row: 1, rowSpan: 1, text: 'Project Beta',           color: '#6b7280', markers: [],          locked: false },
      { id: 'n-8',  columnId: 'col-3', laneId: 'ln-3', row: 2, rowSpan: 1, text: 'Project Gamma',          color: '#22c55e', markers: ['lightning'],locked: false },
      { id: 'n-9',  columnId: 'col-4', laneId: 'ln-4', row: 0, rowSpan: 1, text: 'Goal 1',                color: '#0063e5', markers: [],          locked: false },
      { id: 'n-10', columnId: 'col-4', laneId: 'ln-4', row: 1, rowSpan: 1, text: 'Goal 2',                color: '#6b7280', markers: [],          locked: false },
      { id: 'n-11', columnId: 'col-4', laneId: 'ln-4', row: 2, rowSpan: 1, text: 'Goal 3',                color: '#6b7280', markers: [],          locked: false },
      { id: 'n-12', columnId: 'col-4', laneId: 'ln-4', row: 3, rowSpan: 1, text: 'Final Milestone',        color: '#22c55e', markers: ['star'],    locked: false }
    ],
    edges: [
      { id: 'e-1', from: 'n-1', to: 'n-3', type: 'blocks' },
      { id: 'e-2', from: 'n-2', to: 'n-4', type: 'blocks' },
      { id: 'e-3', from: 'n-1', to: 'n-5', type: 'informs' },
      { id: 'e-4', from: 'n-3', to: 'n-6', type: 'informs' },
      { id: 'e-5', from: 'n-4', to: 'n-7', type: 'informs' },
      { id: 'e-6', from: 'n-5', to: 'n-8', type: 'informs' },
      { id: 'e-7', from: 'n-6', to: 'n-9', type: 'informs' },
      { id: 'e-8', from: 'n-6', to: 'n-10', type: 'informs' },
      { id: 'e-9', from: 'n-7', to: 'n-11', type: 'informs' },
      { id: 'e-10', from: 'n-8', to: 'n-12', type: 'informs' }
    ],
    colorLegend: {
      '#22c55e': 'In Progress / To Do',
      '#ef4444': 'Blocked',
      '#6b7280': 'Not Started',
      '#0063e5': 'Completed'
    },
    markerLegend: {
      star: 'High Priority',
      flag: 'Needs Review',
      warning: 'At Risk',
      lightning: 'Fast Track',
      check: 'Verified'
    }
  };
}

function blankState() {
  return {
    title: 'Untitled Roadmap',
    columns: [
      { id: 'col-1', name: 'Column 1', lanes: [{ id: 'ln-1', name: '' }] }
    ],
    nodes: [],
    edges: [],
    colorLegend: {
      '#22c55e': 'In Progress / To Do',
      '#ef4444': 'Blocked',
      '#6b7280': 'Not Started',
      '#0063e5': 'Completed'
    },
    markerLegend: {
      star: 'High Priority',
      flag: 'Needs Review',
      warning: 'At Risk',
      lightning: 'Fast Track',
      check: 'Verified'
    }
  };
}

/* ===== STATE ===== */
let state = defaultState();
let selectedEdgeId = null;
let connectionMode = null; // { sourceNodeId, sourcePortSide }
let pointerDrag = null; // pointer-based drag state
let _colRenderController = null; // aborted each render to clean up per-element listeners

/* ===== ID GENERATOR ===== */
let _idCounter = Date.now();
function uid(prefix) { return `${prefix}-${++_idCounter}`; }

/* ===== HELPERS ===== */
function getNode(id) { return state.nodes.find(n => n.id === id); }
function getColumn(id) { return state.columns.find(c => c.id === id); }
function nodesInColumn(colId) {
  return state.nodes.filter(n => n.columnId === colId).sort((a, b) => a.row - b.row);
}
function nodesInLane(colId, laneId) {
  return state.nodes
    .filter(n => n.columnId === colId && n.laneId === laneId)
    .sort((a, b) => a.row - b.row);
}
function incomingEdges(nodeId) { return state.edges.filter(e => e.to === nodeId); }
function outgoingEdges(nodeId) { return state.edges.filter(e => e.from === nodeId); }

/* ===== MIGRATION ===== */
function migrateState(s) {
  s.columns.forEach(col => {
    if (!col.lanes || !col.lanes.length)
      col.lanes = [{ id: uid('ln'), name: '' }];
  });
  s.nodes.forEach(node => {
    if (!node.laneId) {
      const col = s.columns.find(c => c.id === node.columnId);
      if (col) node.laneId = col.lanes[0].id;
    }
    if (!('icon' in node)) node.icon = null;
  });
  return s;
}

/* ===== SKILL TREE: LOCKED STATE ===== */
function computeEffectiveLock(node) {
  if (node.locked) return true;
  const blocking = incomingEdges(node.id).filter(e => e.type === 'blocks');
  return blocking.some(e => {
    const src = getNode(e.from);
    return src && src.color !== '#0063e5';
  });
}

function updateLockedStates() {
  state.nodes.forEach(node => {
    const el = document.getElementById('node-' + node.id);
    if (!el) return;
    const isManual = node.locked;
    const effective = computeEffectiveLock(node);

    el.classList.toggle('effectively-locked', effective);
    // Always rebuild lock icon so icon/behavior stays current
    el.querySelector('.node-lock')?.remove();

    // Only show lock icon for manually-locked nodes; dep-locked is color+opacity only
    if (isManual) {
      const lockEl = document.createElement('button');
      lockEl.className = 'node-lock';
      lockEl.innerHTML = LOCK_ICON_HTML;
      lockEl.title = 'Click to unlock';
      lockEl.addEventListener('click', e => {
        e.stopPropagation();
        node.locked = false;
        saveState();
        updateLockedStates();
        showToast('Node unlocked', '🔓', 1500);
      });
      el.appendChild(lockEl);
    }
  });
}

/* ===== RENDER COLUMNS ===== */
function renderAll() {
  renderColumns();
  renderConnections();
  renderColorLegend();
  renderMarkerLegend();
}

function renderColumns() {
  // Abort previous render's listeners so detached elements can be GCed cleanly
  if (_colRenderController) _colRenderController.abort();
  _colRenderController = new AbortController();
  const sig = _colRenderController.signal;

  const headerRow = document.getElementById('column-header-row');
  const colArea = document.getElementById('column-area');

  // Remove old column elements (keep SVG overlay)
  const oldCols = colArea.querySelectorAll('.column');
  oldCols.forEach(c => c.remove());

  // Clear header row
  headerRow.innerHTML = '';

  state.columns.forEach(col => {
    // Build column element
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.id = 'column-' + col.id;

    // Column header
    const header = document.createElement('div');
    header.className = 'column-header';

    const titleEl = document.createElement('span');
    titleEl.className = 'column-title';
    titleEl.textContent = col.name;
    titleEl.contentEditable = 'true';
    titleEl.spellcheck = false;
    titleEl.addEventListener('blur', () => {
      const newName = titleEl.textContent.trim() || col.name;
      titleEl.textContent = newName;
      col.name = newName;
      saveState();
    }, { signal: sig });
    titleEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    }, { signal: sig });
    titleEl.addEventListener('click', e => e.stopPropagation(), { signal: sig });

    const delBtn = document.createElement('button');
    delBtn.className = 'column-delete-btn';
    delBtn.innerHTML = '×';
    delBtn.title = 'Delete column';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteColumn(col.id);
    }, { signal: sig });

    header.appendChild(titleEl);
    header.appendChild(delBtn);
    colEl.appendChild(header);

    // Column body — lanes wrapper
    const body = document.createElement('div');
    body.className = 'lanes-wrapper';
    body.id = 'colbody-' + col.id;

    col.lanes.forEach(lane => {
      const laneEl = document.createElement('div');
      laneEl.className = 'lane';
      laneEl.id = 'lane-' + lane.id;
      laneEl.dataset.laneId = lane.id;
      laneEl.dataset.colId  = col.id;

      const laneHeadRow = document.createElement('div');
      laneHeadRow.className = 'lane-head-row';

      const laneHeader = document.createElement('div');
      laneHeader.className = 'lane-header';
      laneHeader.contentEditable = 'true';
      laneHeader.spellcheck = false;
      laneHeader.dataset.placeholder = 'Path name…';
      laneHeader.textContent = lane.name;
      laneHeader.addEventListener('blur', () => {
        lane.name = laneHeader.textContent.trim();
        saveState();
      }, { signal: sig });
      laneHeader.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); laneHeader.blur(); }
      }, { signal: sig });
      laneHeadRow.appendChild(laneHeader);

      if (col.lanes.length > 1) {
        const delLaneBtn = document.createElement('button');
        delLaneBtn.className = 'btn-del-lane';
        delLaneBtn.title = 'Delete path';
        delLaneBtn.innerHTML = '×';
        delLaneBtn.addEventListener('click', e => { e.stopPropagation(); deleteLane(col.id, lane.id); }, { signal: sig });
        laneHeadRow.appendChild(delLaneBtn);
      }

      laneEl.appendChild(laneHeadRow);

      // Render nodes in this lane
      nodesInLane(col.id, lane.id).forEach(node => {
        const nodeEl = buildNodeElement(node);
        // Extra bottom margin when a same-lane vertical connection exits downward from this node
        const hasVertConnBelow = state.edges.some(e => {
          const otherId = e.from === node.id ? e.to : (e.to === node.id ? e.from : null);
          if (!otherId) return false;
          const other = getNode(otherId);
          return other && other.columnId === node.columnId && other.laneId === node.laneId && other.row > node.row;
        });
        const hasVertConnAbove = state.edges.some(e => {
          const otherId = e.from === node.id ? e.to : (e.to === node.id ? e.from : null);
          if (!otherId) return false;
          const other = getNode(otherId);
          return other && other.columnId === node.columnId && other.laneId === node.laneId && other.row < node.row;
        });
        if (hasVertConnBelow) nodeEl.classList.add('vert-conn-below');
        if (hasVertConnAbove) nodeEl.classList.add('vert-conn-above');
        laneEl.appendChild(nodeEl);
      });

      // Add node button per lane
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-node';
      addBtn.innerHTML = `<svg viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Add Node`;
      addBtn.addEventListener('click', () => addNode(col.id, lane.id), { signal: sig });
      laneEl.appendChild(addBtn);

      body.appendChild(laneEl);
    });

    // Add lane button
    const addLaneBtn = document.createElement('button');
    addLaneBtn.className = 'btn-add-lane';
    addLaneBtn.title = 'Add parallel path';
    addLaneBtn.textContent = '+';
    addLaneBtn.addEventListener('click', () => addLane(col.id), { signal: sig });
    body.appendChild(addLaneBtn);

    // Dynamic column width based on lane count
    const laneCount = col.lanes.length;
    const colWidth = Math.max(laneCount, 1) * 240 + (laneCount - 1) * 8;
    colEl.style.minWidth = colWidth + 'px';
    colEl.style.width    = colWidth + 'px';

    colEl.appendChild(body);
    colArea.appendChild(colEl);
  });

  // Add column button — append to colArea
  let addColBtn = document.getElementById('add-column-btn');
  if (addColBtn) addColBtn.remove();
  addColBtn = document.createElement('button');
  addColBtn.id = 'add-column-btn';
  addColBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" style="width:18px;height:18px"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  addColBtn.title = 'Add column';
  addColBtn.addEventListener('click', addColumn, { signal: sig });
  colArea.appendChild(addColBtn);

  updateLockedStates();
  updateSvgSize();
}

/* ===== RENDER NODES ===== */
function renderNodesInColumn(colId, bodyEl) {
  const nodes = nodesInColumn(colId);
  nodes.forEach(node => {
    const nodeEl = buildNodeElement(node);
    bodyEl.appendChild(nodeEl);
  });
}

function buildNodeElement(node) {
  const el = document.createElement('div');
  el.className = 'node' + (node.icon ? ' node-has-icon' : '');
  el.id = 'node-' + node.id;
  el.dataset.nodeId = node.id;

  // Height based on rowSpan
  const span = node.rowSpan || 1;
  el.style.minHeight = (span === 1)
    ? (node.icon ? '64px' : 'var(--node-base-height)')
    : `${(node.icon ? 64 : 84) + (span - 1) * 94}px`;

  // Color styling
  const color = node.color || '#6b7280';
  el.style.borderColor = color;
  el.style.background = hexToRgba(color, 0.15);

  // Drag handle (position: absolute — works for both layouts)
  const handle = document.createElement('div');
  handle.className = 'node-drag-handle';
  const dots = document.createElement('div');
  dots.className = 'node-drag-handle-dots';
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span'); dots.appendChild(s);
  }
  handle.appendChild(dots);
  handle.style.touchAction = 'none';
  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    e.preventDefault();
    e.stopPropagation();
    startPointerDrag(e, node.id);
  }, { signal: _colRenderController?.signal });
  el.appendChild(handle);

  // Markers (position: absolute — works for both layouts)
  if (node.markers && node.markers.length > 0) {
    const markersEl = document.createElement('div');
    markersEl.className = 'node-markers';
    node.markers.forEach(m => {
      markersEl.appendChild(markerSVGEl(m));
    });
    el.appendChild(markersEl);
  }

  let textEl;
  if (node.icon) {
    // ── GAME CARD LAYOUT: [icon-box] | [body] ──
    const iconBox = document.createElement('div');
    iconBox.className = 'node-icon-box';
    const img = document.createElement('img');
    img.src = node.icon;
    img.alt = '';
    img.draggable = false;
    iconBox.appendChild(img);
    el.appendChild(iconBox);

    const vbar = document.createElement('div');
    vbar.className = 'node-vbar';
    vbar.style.background = color;
    el.appendChild(vbar);

    const body = document.createElement('div');
    body.className = 'node-body-content';
    textEl = document.createElement('div');
    textEl.className = 'node-text';
    textEl.textContent = node.text || 'New Node';
    body.appendChild(textEl);
    el.appendChild(body);
  } else {
    // ── STANDARD LAYOUT ──
    textEl = document.createElement('div');
    textEl.className = 'node-text';
    textEl.textContent = node.text || 'New Node';
    textEl.style.marginTop = '14px'; // space for drag handle
    el.appendChild(textEl);
  }

  // Connection ports
  function attachPortHandlers(port, nid, side) {
    port.addEventListener('click', e => e.stopPropagation());
    port.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      let dragging = false;
      const onMove = ev => {
        if (!dragging && (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY)) > 6) {
          dragging = true;
          if (!connectionMode) {
            connectionMode = { sourceNodeId: nid, sourcePortSide: side };
            document.body.classList.add('connection-mode');
            const portEl = document.querySelector(`#node-${nid} .port-${side}`);
            if (portEl) portEl.classList.add('port-source-active');
            document.getElementById('temp-connection-line').style.display = 'block';
          }
        }
      };
      const onUp = ev => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        if (dragging) {
          const el = document.elementFromPoint(ev.clientX, ev.clientY);
          const targetNodeEl = el?.closest?.('.node');
          if (targetNodeEl && targetNodeEl.id !== `node-${nid}`) {
            finishConnection(targetNodeEl.id.replace('node-', ''));
          } else {
            cancelConnectionMode();
          }
        } else {
          handlePortClick(nid, side);
        }
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
  }

  const portL = document.createElement('div');
  portL.className = 'port port-left';
  portL.dataset.side = 'left';
  portL.dataset.nodeId = node.id;
  attachPortHandlers(portL, node.id, 'left');
  el.appendChild(portL);

  const portR = document.createElement('div');
  portR.className = 'port port-right';
  portR.dataset.side = 'right';
  portR.dataset.nodeId = node.id;
  attachPortHandlers(portR, node.id, 'right');
  el.appendChild(portR);

  ['top', 'bottom'].forEach(side => {
    const port = document.createElement('div');
    port.className = `port port-${side}`;
    port.dataset.side = side;
    port.dataset.nodeId = node.id;
    attachPortHandlers(port, node.id, side);
    el.appendChild(port);
  });

  // Events
  el.addEventListener('dblclick', e => {
    if (e.target === textEl || textEl.contains(e.target)) return;
    // Double-click on node body (not text) → toggle lock
    node.locked = !node.locked;
    saveState();
    updateLockedStates();
    showToast(node.locked ? 'Node locked' : 'Node unlocked', node.locked ? '🔒' : '🔓', 1500);
  });
  textEl.addEventListener('dblclick', e => {
    e.stopPropagation();
    startEditNodeText(node.id, textEl);
  });

  el.addEventListener('click', e => {
    if (connectionMode) {
      e.stopPropagation();
      finishConnection(node.id);
      return;
    }
    if (e.shiftKey) {
      e.stopPropagation();
      node.locked = !node.locked;
      saveState();
      updateLockedStates();
      return;
    }
    clearSelectedEdge();
  });

  // Drag-to-connect: hold on node body and drag to another node
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.node-drag-handle') || e.target.closest('.port') ||
        e.target.closest('.node-text') || e.target.closest('.node-lock') ||
        e.target.closest('.node-icon-box')) return;
    if (connectionMode || pointerDrag) return;

    let dragStarted = false;
    const startX = e.clientX, startY = e.clientY;

    function onMove(me) {
      if (!dragStarted && Math.hypot(me.clientX - startX, me.clientY - startY) > 6) {
        dragStarted = true;
        document.body.classList.add('drag-connecting');
        handlePortClick(node.id, 'right'); // enter connection mode from right port
        document.getElementById('temp-connection-line').style.display = 'block';
      }
    }
    function onUp() {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      document.body.classList.remove('drag-connecting');
      if (!dragStarted) return;
      // If released over a node, finishConnection was called via that node's click handler
      // If released over empty space, cancel
      if (connectionMode) cancelConnectionMode();
    }
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onUp);
  });

  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    showNodeContextMenu(node.id, e.clientX, e.clientY);
  });

  return el;
}

/* ===== INLINE EDIT NODE TEXT ===== */
function startEditNodeText(nodeId, textEl) {
  if (textEl.contentEditable === 'true') return;
  const node = getNode(nodeId);
  if (!node) return;
  textEl.contentEditable = 'true';
  textEl.focus();
  // Select all
  const range = document.createRange();
  range.selectNodeContents(textEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function finish() {
    textEl.contentEditable = 'false';
    const newText = textEl.textContent.trim() || node.text;
    node.text = newText;
    textEl.textContent = newText;
    saveState();
    textEl.removeEventListener('blur', finish);
    textEl.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
    if (e.key === 'Escape') {
      textEl.textContent = node.text;
      textEl.contentEditable = 'false';
      textEl.removeEventListener('blur', finish);
      textEl.removeEventListener('keydown', onKey);
    }
  }
  textEl.addEventListener('blur', finish);
  textEl.addEventListener('keydown', onKey);
}

/* ===== COLOR LEGEND RENDER ===== */
function renderColorLegend() {
  const list = document.getElementById('color-legend-list');
  list.innerHTML = '';
  Object.entries(state.colorLegend).forEach(([hex, label]) => {
    const row = document.createElement('div');
    row.className = 'legend-row';

    const swatchWrap = document.createElement('div');
    swatchWrap.className = 'color-swatch-wrapper';
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = hex;
    swatch.title = hex;
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'color-swatch-input';
    colorInput.value = hex;
    colorInput.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0';
    colorInput.addEventListener('change', () => {
      const newHex = colorInput.value;
      if (newHex !== hex) {
        const label = state.colorLegend[hex];
        delete state.colorLegend[hex];
        state.colorLegend[newHex] = label;
        // Update nodes with old color
        state.nodes.forEach(n => { if (n.color === hex) n.color = newHex; });
        saveState();
        renderAll();
      }
    });
    swatchWrap.appendChild(swatch);
    swatchWrap.appendChild(colorInput);

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'legend-label';
    labelInput.value = label;
    labelInput.addEventListener('blur', () => {
      state.colorLegend[hex] = labelInput.value || label;
      saveState();
    });
    labelInput.addEventListener('keydown', e => { if (e.key === 'Enter') labelInput.blur(); });

    const delBtn = document.createElement('button');
    delBtn.className = 'legend-delete';
    delBtn.innerHTML = '×';
    delBtn.title = 'Remove color';
    delBtn.addEventListener('click', () => {
      delete state.colorLegend[hex];
      saveState();
      renderColorLegend();
    });

    row.appendChild(swatchWrap);
    row.appendChild(labelInput);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}

/* ===== MARKER LEGEND RENDER ===== */
function renderMarkerLegend() {
  const list = document.getElementById('marker-legend-list');
  list.innerHTML = '';
  Object.entries(state.markerLegend).forEach(([key, label]) => {
    const row = document.createElement('div');
    row.className = 'legend-row';

    const iconEl = document.createElement('span');
    iconEl.className = 'marker-icon';
    if (MARKER_ICONS[key]) { iconEl.innerHTML = MARKER_ICONS[key]; }
    else { iconEl.textContent = key[0].toUpperCase(); }

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'legend-label';
    labelInput.value = label;
    labelInput.addEventListener('blur', () => {
      state.markerLegend[key] = labelInput.value || label;
      saveState();
    });
    labelInput.addEventListener('keydown', e => { if (e.key === 'Enter') labelInput.blur(); });

    const delBtn = document.createElement('button');
    delBtn.className = 'legend-delete';
    delBtn.innerHTML = '×';
    delBtn.title = 'Remove marker';
    delBtn.addEventListener('click', () => {
      delete state.markerLegend[key];
      // Remove marker from all nodes
      state.nodes.forEach(n => {
        n.markers = n.markers.filter(m => m !== key);
      });
      saveState();
      renderAll();
    });

    row.appendChild(iconEl);
    row.appendChild(labelInput);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}

/* ===== SIDEBAR TOGGLE ===== */
function toggleSection(id) {
  const section = document.getElementById(id);
  section.classList.toggle('collapsed');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const icon = document.getElementById('sidebar-toggle-icon');
  const collapsed = sidebar.classList.toggle('collapsed');
  toggleBtn.classList.toggle('collapsed', collapsed);
  // Flip arrow direction
  icon.querySelector('path').setAttribute('d',
    collapsed ? 'M2 1L6 6L2 11' : 'M6 1L2 6L6 11'
  );
  // Redraw connections after sidebar transition settles
  setTimeout(() => { updateSvgSize(); renderConnections(); }, 220);
}

/* ===== HEX TO RGBA ===== */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ===== SVG SIZE UPDATE ===== */
function updateSvgSize() {
  const canvas = document.getElementById('canvas');
  const svg = document.getElementById('svg-overlay');
  if (!canvas || !svg) return;
  // Add buffer so curves near edges aren't clipped
  const w = canvas.scrollWidth + 40;
  const h = canvas.scrollHeight + 40;
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.style.width = w + 'px';
  svg.style.height = h + 'px';
}

/* ===== CRUD: COLUMN ===== */
function addColumn() {
  const col = { id: uid('col'), name: 'New Column', lanes: [{ id: uid('ln'), name: '' }] };
  state.columns.push(col);
  saveState();
  renderAll();
  // Focus the new column title
  setTimeout(() => {
    const el = document.querySelector(`#column-${col.id} .column-title`);
    if (el) { el.focus(); document.execCommand('selectAll'); }
  }, 50);
}

function deleteColumn(colId) {
  const col = getColumn(colId);
  if (!col) return;
  showConfirmModal(
    `Delete column "${col.name}"?`,
    'All nodes in this column will be permanently removed.',
    () => {
      const nodeIds = state.nodes.filter(n => n.columnId === colId).map(n => n.id);
      state.edges = state.edges.filter(e => !nodeIds.includes(e.from) && !nodeIds.includes(e.to));
      state.nodes = state.nodes.filter(n => n.columnId !== colId);
      state.columns = state.columns.filter(c => c.id !== colId);
      saveState();
      renderAll();
    }
  );
}

function addLane(colId) {
  const col = state.columns.find(c => c.id === colId);
  if (!col) return;
  const lane = { id: uid('ln'), name: '' };
  col.lanes.push(lane);
  saveState();
  renderAll();
  setTimeout(() => {
    document.getElementById('lane-' + lane.id)?.querySelector('.lane-header')?.focus();
  }, 30);
}

function deleteLane(colId, laneId) {
  const col = state.columns.find(c => c.id === colId);
  if (!col || col.lanes.length <= 1) { showToast('Cannot delete the only path', '⚠️'); return; }
  const fallback = col.lanes.find(l => l.id !== laneId);
  state.nodes.forEach(n => { if (n.columnId === colId && n.laneId === laneId) n.laneId = fallback.id; });
  col.lanes = col.lanes.filter(l => l.id !== laneId);
  saveState();
  renderAll();
}

/* ===== CRUD: NODE ===== */
function addNode(colId, laneId) {
  const col = state.columns.find(c => c.id === colId);
  if (!col) return;
  const lid = laneId || col.lanes[0].id;
  const existing = nodesInLane(colId, lid);
  const nextRow = existing.length > 0 ? Math.max(...existing.map(n => n.row + (n.rowSpan || 1))) : 0;
  const colors = Object.keys(state.colorLegend);
  const defaultColor = colors.find(c => c === '#6b7280') || colors[0] || '#6b7280';
  const node = {
    id: uid('n'), columnId: colId, laneId: lid, row: nextRow, rowSpan: 1,
    text: 'New Node', color: defaultColor, markers: [], locked: false, icon: null
  };
  state.nodes.push(node);
  saveState();
  renderAll();
  // Auto-edit
  setTimeout(() => {
    const textEl = document.querySelector(`#node-${node.id} .node-text`);
    if (textEl) startEditNodeText(node.id, textEl);
  }, 30);
}

function deleteNode(nodeId) {
  state.edges = state.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
  state.nodes = state.nodes.filter(n => n.id !== nodeId);
  saveState();
  renderAll();
}

function setNodeColor(nodeId, color) {
  const node = getNode(nodeId);
  if (!node) return;
  node.color = color;
  saveState();
  // Update just this node's visual + connections
  const el = document.getElementById('node-' + nodeId);
  if (el) {
    el.style.borderColor = color;
    el.style.background = hexToRgba(color, 0.15);
  }
  updateLockedStates();
  renderConnections();
}

function toggleNodeMarker(nodeId, marker) {
  const node = getNode(nodeId);
  if (!node) return;
  const idx = node.markers.indexOf(marker);
  if (idx >= 0) node.markers.splice(idx, 1);
  else node.markers.push(marker);
  saveState();
  renderAll();
}

function setNodeRowSpan(nodeId, span) {
  const node = getNode(nodeId);
  if (!node) return;
  node.rowSpan = span;
  saveState();
  renderAll();
}

/* ===== POINTER DRAG SYSTEM (replaces HTML5 drag) ===== */
function startPointerDrag(e, nodeId) {
  const node = getNode(nodeId);
  if (!node) return;
  const el = document.getElementById('node-' + nodeId);
  if (!el) return;
  const rect = el.getBoundingClientRect();

  // Ghost: clone of node that follows the cursor
  const ghost = el.cloneNode(true);
  ghost.id = 'drag-ghost';
  ghost.querySelectorAll('.port').forEach(p => p.remove());
  ghost.style.cssText = `
    position:fixed;width:${rect.width}px;height:${rect.height}px;
    left:${rect.left}px;top:${rect.top}px;
    opacity:0.9;pointer-events:none;z-index:9999;
    transform:rotate(1.5deg) scale(1.04);
    box-shadow:0 24px 64px rgba(0,0,0,0.65),0 0 0 2px rgba(0,128,255,0.9);
    transition:none;will-change:left,top;
  `;
  document.body.appendChild(ghost);
  el.classList.add('drag-source');

  pointerDrag = {
    nodeId,
    ghost,
    el,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
    dropColId: node.columnId,
    dropLaneId: node.laneId,
    dropBeforeId: null,
  };

  e.currentTarget.setPointerCapture(e.pointerId);
  document.addEventListener('pointermove', onPointerDragMove, { passive: false });
  document.addEventListener('pointerup',   onPointerDragEnd);
  document.addEventListener('pointercancel', onPointerDragEnd);
}

function onPointerDragMove(e) {
  if (!pointerDrag) return;
  e.preventDefault();
  const { ghost, offsetX, offsetY } = pointerDrag;
  ghost.style.left = (e.clientX - offsetX) + 'px';
  ghost.style.top  = (e.clientY - offsetY) + 'px';
  updatePointerDropTarget(e.clientX, e.clientY);
}

function updatePointerDropTarget(cx, cy) {
  // Clear previous indicators
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
  document.querySelectorAll('.lane.drag-target, .column-body.drag-target').forEach(b => b.classList.remove('drag-target'));

  // Find target lane under pointer (with fallback to nearest)
  const lanes = Array.from(document.querySelectorAll('.lane'));
  let targetLane = null;

  for (const lane of lanes) {
    const r = lane.getBoundingClientRect();
    if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
      targetLane = lane;
      break;
    }
  }
  // Fallback: nearest lane by horizontal center if vertically near
  if (!targetLane) {
    let minDX = Infinity;
    for (const lane of lanes) {
      const r = lane.getBoundingClientRect();
      if (cy >= r.top - 60 && cy <= r.bottom + 60) {
        const dx = Math.abs(cx - (r.left + r.right) / 2);
        if (dx < minDX) { minDX = dx; targetLane = lane; }
      }
    }
  }
  if (!targetLane) return;

  targetLane.classList.add('drag-target');
  pointerDrag.dropColId  = targetLane.dataset.colId;
  pointerDrag.dropLaneId = targetLane.dataset.laneId;

  // Determine insertion point (which node to drop before)
  const nodeEls = Array.from(targetLane.querySelectorAll('.node'))
    .filter(el => el.id !== 'node-' + pointerDrag.nodeId);

  let dropBeforeId = null;
  for (const nEl of nodeEls) {
    const r = nEl.getBoundingClientRect();
    if (cy <= r.top + r.height / 2) {
      dropBeforeId = nEl.dataset.nodeId;
      break;
    }
  }
  pointerDrag.dropBeforeId = dropBeforeId;

  // Insert visual drop indicator
  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  if (dropBeforeId) {
    const beforeEl = document.getElementById('node-' + dropBeforeId);
    if (beforeEl) targetLane.insertBefore(indicator, beforeEl);
  } else {
    const addBtn = targetLane.querySelector('.btn-add-node');
    if (addBtn) targetLane.insertBefore(indicator, addBtn);
    else targetLane.appendChild(indicator);
  }
}

function onPointerDragEnd() {
  if (!pointerDrag) return;
  const { nodeId, ghost, el, dropColId, dropLaneId, dropBeforeId } = pointerDrag;

  try {
    ghost.remove();
    el.classList.remove('drag-source');
    document.querySelectorAll('.drop-indicator').forEach(i => i.remove());
    document.querySelectorAll('.lane.drag-target, .column-body.drag-target').forEach(b => b.classList.remove('drag-target'));
    applyPointerDrop(nodeId, dropColId, dropLaneId, dropBeforeId);
  } finally {
    document.removeEventListener('pointermove', onPointerDragMove);
    document.removeEventListener('pointerup',   onPointerDragEnd);
    document.removeEventListener('pointercancel', onPointerDragEnd);
    pointerDrag = null;
  }
}

function applyPointerDrop(nodeId, targetColId, targetLaneId, dropBeforeId) {
  const node = getNode(nodeId);
  if (!node) return;
  const prevColId  = node.columnId;
  const prevLaneId = node.laneId;

  // Determine target lane: use provided or fall back to first lane of target col
  const targetCol = state.columns.find(c => c.id === targetColId);
  const resolvedLaneId = targetLaneId || (targetCol && targetCol.lanes[0].id) || prevLaneId;

  // Target lane nodes excluding the dragged one
  const targetNodes = nodesInLane(targetColId, resolvedLaneId).filter(n => n.id !== nodeId);

  // Find insertion index
  let insertIdx = targetNodes.length;
  if (dropBeforeId) {
    const bIdx = targetNodes.findIndex(n => n.id === dropBeforeId);
    if (bIdx >= 0) insertIdx = bIdx;
  }

  // Move node
  node.columnId = targetColId;
  node.laneId   = resolvedLaneId;
  const newOrder = [...targetNodes];
  newOrder.splice(insertIdx, 0, node);
  newOrder.forEach((n, i) => { n.row = i; });

  // Renormalize source lane if changed
  if (prevColId !== targetColId || prevLaneId !== resolvedLaneId) {
    nodesInLane(prevColId, prevLaneId).filter(n => n.id !== nodeId).forEach((n, i) => { n.row = i; });
  }

  saveState();
  renderAll();
  requestAnimationFrame(() => requestAnimationFrame(renderConnections));
}

// ============================================================
// CHUNK 3 — SVG CONNECTIONS + INTERACTIONS
// ============================================================

/* ===== NODE PORT POSITIONS ===== */
function getPortPosition(nodeId, side) {
  const el = document.getElementById('node-' + nodeId);
  const colArea = document.getElementById('column-area');
  if (!el || !colArea) return null;
  const r = el.getBoundingClientRect();
  const a = colArea.getBoundingClientRect();
  // r.left - a.left already cancels out the canvas-wrapper scroll offset
  // (both rects are viewport-space values that move together on scroll).
  // Do NOT add scrollLeft/scrollTop — that would double-count scroll.
  const left   = r.left   - a.left;
  const right  = r.right  - a.left;
  const top    = r.top    - a.top;
  const bottom = r.bottom - a.top;
  const midX   = (left + right) / 2;
  const midY   = (top  + bottom) / 2;
  switch (side) {
    case 'right':  return { x: right, y: midY   };
    case 'left':   return { x: left,  y: midY   };
    case 'top':    return { x: midX,  y: top    };
    case 'bottom': return { x: midX,  y: bottom };
    default:       return { x: right, y: midY   };
  }
}

/* ===== SMART ROUTE CHOOSER ===== */
function chooseRoute(fromId, toId) {
  const fn = getNode(fromId), tn = getNode(toId);
  if (!fn || !tn) return { fromSide: 'right', toSide: 'left' };
  const sameCol  = fn.columnId === tn.columnId;
  const sameLane = sameCol && fn.laneId && fn.laneId === tn.laneId;
  const fci = state.columns.findIndex(c => c.id === fn.columnId);
  const tci = state.columns.findIndex(c => c.id === tn.columnId);

  if (sameLane) {
    // Vertically stacked in same lane: use bottom→top
    const fPos = getPortPosition(fromId, 'bottom');
    const tPos = getPortPosition(toId,   'bottom');
    if (fPos && tPos) {
      return fPos.y <= tPos.y
        ? { fromSide: 'bottom', toSide: 'top'    }
        : { fromSide: 'top',    toSide: 'bottom' };
    }
  }
  if (sameCol) {
    // Different lanes sit side-by-side within the same column.
    const col = state.columns.find(c => c.id === fn.columnId);
    const fromLaneIdx = col ? col.lanes.findIndex(l => l.id === fn.laneId) : 0;
    const toLaneIdx   = col ? col.lanes.findIndex(l => l.id === tn.laneId) : 0;
    const delta = toLaneIdx - fromLaneIdx;
    if (delta > 0) {
      // Source left of target: adjacent → direct arc; skip-a-lane → C outside right
      return delta === 1
        ? { fromSide: 'right', toSide: 'left'  }
        : { fromSide: 'right', toSide: 'right' };
    } else {
      // Source right of target: adjacent → direct arc; skip-a-lane → C outside left
      return delta === -1
        ? { fromSide: 'left', toSide: 'right' }
        : { fromSide: 'left', toSide: 'left'  };
    }
  }
  // Cross-column
  return tci >= fci
    ? { fromSide: 'right', toSide: 'left'  }
    : { fromSide: 'left',  toSide: 'right' };
}

/* ===== EDGE TYPE DEFINITIONS ===== */
const EDGE_TYPE_DEFS = [
  { type: 'blocks',   label: 'Requires',  color: '#ef4444', dash: '7,4',  icon: '<i class="fa-solid fa-lock"></i>'          },
  { type: 'informs',  label: 'Relates',   color: '#0080ff', dash: null,   icon: '<i class="fa-solid fa-circle-info"></i>'   },
  { type: 'enhances', label: 'Enhances',  color: '#8b5cf6', dash: null,   icon: '<i class="fa-solid fa-arrow-trend-up"></i>'},
  { type: 'enables',  label: 'Enables',   color: '#22c55e', dash: null,   icon: '<i class="fa-solid fa-unlock"></i>'        },
  { type: 'prepares', label: 'Prepares',  color: '#f59e0b', dash: '7,4',  icon: '<i class="fa-solid fa-road"></i>'          },
];
let defaultEdgeType = 'blocks';

/* ===== RENDER SVG CONNECTIONS ===== */
function renderConnections() {
  updateSvgSize();
  const svg = document.getElementById('svg-overlay');
  Array.from(svg.children).forEach(child => {
    if (child.tagName !== 'defs') child.remove();
  });

  state.edges.forEach(edge => {
    if (!getNode(edge.from) || !getNode(edge.to)) return;
    const { fromSide, toSide } = chooseRoute(edge.from, edge.to);
    const from = getPortPosition(edge.from, fromSide);
    const to   = getPortPosition(edge.to,   toSide);
    if (!from || !to) return;

    let d;
    if ((fromSide === 'bottom' && toSide === 'top') || (fromSide === 'top' && toSide === 'bottom')) {
      // Same-lane vertical — straight bezier (no sideways bow)
      const dy = Math.abs(to.y - from.y);
      const ctrl = Math.max(dy * 0.45, 30);
      const signY = fromSide === 'bottom' ? 1 : -1;
      d = `M${from.x} ${from.y} C${from.x} ${from.y + signY * ctrl},${to.x} ${to.y - signY * ctrl},${to.x} ${to.y}`;
    } else if ((fromSide === 'right' && toSide === 'right') || (fromSide === 'left' && toSide === 'left')) {
      // Skip-a-lane same-column — C-curve that goes OUTSIDE the entire column
      // so it never overlaps any node in any sibling lane.
      const signX = fromSide === 'right' ? 1 : -1;
      // Walk every node in the outermost lane to find the real column boundary.
      const edgeFromNode = getNode(edge.from);
      const col = edgeFromNode ? state.columns.find(c => c.id === edgeFromNode.columnId) : null;
      let colBound = signX > 0 ? Math.max(from.x, to.x) : Math.min(from.x, to.x);
      if (col) {
        const outerLane = col.lanes[signX > 0 ? col.lanes.length - 1 : 0];
        nodesInLane(col.id, outerLane.id).forEach(n => {
          const pp = getPortPosition(n.id, signX > 0 ? 'right' : 'left');
          if (pp) colBound = signX > 0 ? Math.max(colBound, pp.x) : Math.min(colBound, pp.x);
        });
      }
      const dy = to.y - from.y;
      const pivot = colBound + signX * Math.max(Math.abs(dy) * 0.25, 56);
      d = `M${from.x} ${from.y} C${pivot} ${from.y},${pivot} ${to.y},${to.x} ${to.y}`;
    } else {
      // Horizontal arc (cross-column, or adjacent-lane same-column)
      const dx = to.x - from.x;
      const absDx = Math.abs(dx);
      const signX = dx >= 0 ? 1 : -1;
      // For very close ports (same-column adjacent lanes, gap ≈ 8px), keep the
      // bezier control points within the inter-lane gap so the arc never crosses
      // sibling-lane nodes.  For normal cross-column arcs, use the wider formula.
      const cx = absDx < 40
        ? Math.max(absDx * 0.5, 8)
        : absDx > 20 ? Math.min(absDx * 0.45, 120) : Math.min(absDx * 0.45 + 60, 140);
      d = `M${from.x} ${from.y} C${from.x + signX * cx} ${from.y},${to.x - signX * cx} ${to.y},${to.x} ${to.y}`;
    }

    // Store bezier midpoint (t=0.5) for edge type menu positioning
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const def = EDGE_TYPE_DEFS.find(d => d.type === edge.type) || EDGE_TYPE_DEFS[1];
    const isSelected = selectedEdgeId === edge.id;
    const strokeW = isSelected ? '4' : '2.5';

    // Visible path — no pointer events (hit-path below handles clicks)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', def.color);
    path.setAttribute('stroke-width', strokeW);
    path.setAttribute('marker-end', `url(#arrow-${edge.type})`);
    path.setAttribute('opacity', isSelected ? '1' : '0.85');
    if (def.dash) path.setAttribute('stroke-dasharray', def.dash);
    if (isSelected) {
      path.classList.add('selected-edge');
      path.style.filter = `drop-shadow(0 0 5px ${def.color})`;
    }
    path.style.pointerEvents = 'none';
    svg.appendChild(path);

    // Wide transparent hit-path — easy to click (16px target)
    const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitPath.setAttribute('d', d);
    hitPath.setAttribute('fill', 'none');
    hitPath.setAttribute('stroke', 'transparent');
    hitPath.setAttribute('stroke-width', '16');
    hitPath.dataset.edgeId = edge.id;
    hitPath.dataset.midX = midX;
    hitPath.dataset.midY = midY;
    hitPath.style.cursor = 'pointer';
    hitPath.style.pointerEvents = 'all';
    hitPath.addEventListener('click', e => { e.stopPropagation(); selectEdge(edge.id); });
    svg.appendChild(hitPath);
  });
}

/* ===== SELECT / DELETE EDGE ===== */
function selectEdge(edgeId) {
  selectedEdgeId = edgeId;
  renderConnections();
  const path = document.querySelector(`[data-edge-id="${edgeId}"]`);
  if (path) {
    const midX = parseFloat(path.dataset.midX || 0);
    const midY = parseFloat(path.dataset.midY || 0);
    const areaRect = document.getElementById('column-area').getBoundingClientRect();
    const vpX = areaRect.left + midX;
    const vpY = areaRect.top  + midY;
    showEdgeTypeMenu(edgeId, vpX, vpY);
  }
}

function clearSelectedEdge() {
  if (selectedEdgeId) {
    selectedEdgeId = null;
    renderConnections();
    hideEdgeTypeMenu();
  }
}

function deleteSelectedEdge() {
  if (!selectedEdgeId) return;
  state.edges = state.edges.filter(e => e.id !== selectedEdgeId);
  selectedEdgeId = null;
  saveState();
  renderAll();
  updateLockedStates();
  hideEdgeTypeMenu();
}

/* ===== CONNECTION MODE ===== */
function handlePortClick(nodeId, side) {
  if (connectionMode) {
    if (connectionMode.sourceNodeId !== nodeId) {
      finishConnection(nodeId);
    } else {
      cancelConnectionMode();
    }
    return;
  }
  // Start connection mode
  connectionMode = { sourceNodeId: nodeId, sourcePortSide: side };
  document.body.classList.add('connection-mode');

  // Highlight source port
  const portEl = document.querySelector(`#node-${nodeId} .port-${side}`);
  if (portEl) portEl.classList.add('port-source-active');

  document.getElementById('temp-connection-line').style.display = 'block';
  showToast('Click another node to connect', '⚡', 3000);
}

function finishConnection(targetNodeId) {
  if (!connectionMode) return;
  const { sourceNodeId } = connectionMode;
  if (sourceNodeId === targetNodeId) { cancelConnectionMode(); return; }
  const exists = state.edges.find(e => e.from === sourceNodeId && e.to === targetNodeId);
  if (exists) { showToast('Connection already exists', '⚠️'); cancelConnectionMode(); return; }
  // Create with default type immediately — no modal
  createEdge(sourceNodeId, targetNodeId, defaultEdgeType);
  const def = EDGE_TYPE_DEFS.find(d => d.type === defaultEdgeType);
  showToast(`${def.icon} ${def.label} connection created — click the line to change type`, '🔗', 3000);
}

function createEdge(fromId, toId, type) {
  const edge = { id: uid('e'), from: fromId, to: toId, type };
  state.edges.push(edge);
  saveState();
  cancelConnectionMode();
  renderAll();
  updateLockedStates();
}

function cancelConnectionMode() {
  if (!connectionMode) return;
  const { sourceNodeId, sourcePortSide } = connectionMode;
  connectionMode = null;
  document.body.classList.remove('connection-mode');
  const portEl = document.querySelector(`#node-${sourceNodeId} .port-${sourcePortSide}`);
  if (portEl) portEl.classList.remove('port-source-active');
  const tempSvg = document.getElementById('temp-connection-line');
  tempSvg.style.display = 'none';
  const tempPath = document.getElementById('temp-path');
  if (tempPath) tempPath.setAttribute('d', '');
}

/* ===== TEMP CONNECTION LINE (follows mouse) ===== */
document.addEventListener('mousemove', e => {
  if (!connectionMode) return;
  const from = getPortPosition(connectionMode.sourceNodeId, connectionMode.sourcePortSide);
  if (!from) return;
  // from.x/y are layout-relative (scroll-independent). Add area's current
  // viewport origin to convert to viewport coords for the fixed temp SVG.
  const areaRect = document.getElementById('column-area').getBoundingClientRect();
  const fromX = areaRect.left + from.x;
  const fromY = areaRect.top  + from.y;
  const toX = e.clientX;
  const toY = e.clientY;
  const hDist = toX - fromX;
  const dx = hDist > 0 ? Math.min(hDist * 0.45, 120) : 60;
  const d = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
  const tempPath = document.getElementById('temp-path');
  if (tempPath) tempPath.setAttribute('d', d);
});

/* ===== EDGE TYPE MENU (inline, shown on line click) ===== */
function showEdgeTypeMenu(edgeId, vpX, vpY) {
  const menu = document.getElementById('edge-type-menu');
  const edge = state.edges.find(e => e.id === edgeId);
  if (!menu || !edge) return;
  menu.innerHTML = '';

  const lbl = document.createElement('div');
  lbl.className = 'etm-label';
  lbl.textContent = 'Connection Type';
  menu.appendChild(lbl);

  EDGE_TYPE_DEFS.forEach(({ type, label, color, icon }) => {
    const btn = document.createElement('button');
    btn.className = 'etm-btn' + (edge.type === type ? ' active' : '');
    btn.innerHTML = `<span class="etm-dot" style="background:${color}"></span><span>${icon} ${label}</span>`;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      edge.type = type;
      saveState();
      renderConnections();
      updateLockedStates();
      // Re-show menu at updated position
      selectEdge(edgeId);
    });
    menu.appendChild(btn);
  });

  // Set default type shortcut
  const sep = document.createElement('div'); sep.className = 'etm-sep'; menu.appendChild(sep);
  const setDefaultBtn = document.createElement('button');
  setDefaultBtn.className = 'etm-btn';
  setDefaultBtn.style.color = 'var(--accent-bright)';
  const currentDef = EDGE_TYPE_DEFS.find(d => d.type === edge.type);
  setDefaultBtn.textContent = `Set "${currentDef?.label}" as default`;
  setDefaultBtn.addEventListener('click', e => {
    e.stopPropagation();
    defaultEdgeType = edge.type;
    showToast(`Default set to: ${currentDef?.label}`, '<i class="fa-solid fa-circle-check"></i>', 2000);
    hideEdgeTypeMenu();
  });
  menu.appendChild(setDefaultBtn);

  const sep2 = document.createElement('div'); sep2.className = 'etm-sep'; menu.appendChild(sep2);
  const delBtn = document.createElement('button');
  delBtn.className = 'etm-btn';
  delBtn.style.color = 'var(--danger)';
  delBtn.innerHTML = '<i class="fa-solid fa-trash" style="margin-right:6px"></i>Delete Connection';
  delBtn.addEventListener('click', e => { e.stopPropagation(); deleteSelectedEdge(); });
  menu.appendChild(delBtn);

  menu.classList.add('visible');
  const vw = window.innerWidth, vh = window.innerHeight;
  const mr = menu.getBoundingClientRect();
  menu.style.left = (vpX + mr.width > vw ? vpX - mr.width - 8 : vpX + 8) + 'px';
  menu.style.top  = (vpY + mr.height > vh ? vh - mr.height - 8 : vpY - mr.height / 2) + 'px';
}

function hideEdgeTypeMenu() {
  document.getElementById('edge-type-menu').classList.remove('visible');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#edge-type-menu')) hideEdgeTypeMenu();
});

/* ===== CONTEXT MENU ===== */
const ctxMenu = document.getElementById('context-menu');
let ctxNodeId = null;

function showNodeContextMenu(nodeId, x, y) {
  ctxNodeId = nodeId;
  const node = getNode(nodeId);
  if (!node) return;

  ctxMenu.innerHTML = '';

  // Color picker section
  const colorHeader = document.createElement('div');
  colorHeader.className = 'ctx-submenu-header';
  colorHeader.textContent = 'Set Color';
  ctxMenu.appendChild(colorHeader);

  const colorGrid = document.createElement('div');
  colorGrid.className = 'ctx-color-grid';
  Object.keys(state.colorLegend).forEach(hex => {
    const btn = document.createElement('button');
    btn.className = 'ctx-color-btn' + (node.color === hex ? ' active' : '');
    btn.style.background = hex;
    btn.title = state.colorLegend[hex];
    btn.addEventListener('click', () => {
      setNodeColor(nodeId, hex);
      hideContextMenu();
    });
    colorGrid.appendChild(btn);
  });
  ctxMenu.appendChild(colorGrid);

  // Separator
  ctxMenu.appendChild(makeSeparator());

  // Markers section
  const markersHeader = document.createElement('div');
  markersHeader.className = 'ctx-submenu-header';
  markersHeader.textContent = 'Markers';
  ctxMenu.appendChild(markersHeader);

  const markerRow = document.createElement('div');
  markerRow.className = 'ctx-marker-row';
  Object.keys(state.markerLegend).forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'ctx-marker-btn' + (node.markers.includes(key) ? ' active' : '');
    if (MARKER_ICONS[key]) { btn.innerHTML = MARKER_ICONS[key]; }
    else { btn.textContent = key[0].toUpperCase(); }
    btn.title = state.markerLegend[key];
    btn.addEventListener('click', () => {
      toggleNodeMarker(nodeId, key);
      hideContextMenu();
    });
    markerRow.appendChild(btn);
  });
  ctxMenu.appendChild(markerRow);

  // Separator
  ctxMenu.appendChild(makeSeparator());

  // Row span
  const spanHeader = document.createElement('div');
  spanHeader.className = 'ctx-submenu-header';
  spanHeader.textContent = 'Height (rows)';
  ctxMenu.appendChild(spanHeader);

  const spanRow = document.createElement('div');
  spanRow.className = 'ctx-rowspan-row';
  [1,2,3,4].forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'ctx-span-btn' + ((node.rowSpan || 1) === n ? ' active' : '');
    btn.textContent = n + 'x';
    btn.addEventListener('click', () => {
      setNodeRowSpan(nodeId, n);
      hideContextMenu();
    });
    spanRow.appendChild(btn);
  });
  ctxMenu.appendChild(spanRow);

  // Separator
  ctxMenu.appendChild(makeSeparator());

  // Actions
  appendCtxItem(ctxMenu, '✏️', 'Edit Text', () => {
    hideContextMenu();
    const textEl = document.querySelector(`#node-${nodeId} .node-text`);
    if (textEl) startEditNodeText(nodeId, textEl);
  });

  appendCtxItem(ctxMenu, '⚡', 'Connect to…', () => {
    hideContextMenu();
    handlePortClick(nodeId, 'right');
  });

  appendCtxItem(ctxMenu, node.locked ? '🔓' : '🔒',
    node.locked ? 'Unlock' : 'Lock', () => {
      node.locked = !node.locked;
      saveState();
      updateLockedStates();
      hideContextMenu();
    }
  );

  appendCtxItem(ctxMenu, '<i class="fa-solid fa-image"></i>',
    node.icon ? 'Change Icon…' : 'Set Icon…', () => {
      hideContextMenu();
      openIconPickerModal(nodeId);
    }
  );

  if (node.icon) {
    appendCtxItem(ctxMenu, '<i class="fa-regular fa-image"></i>', 'Remove Icon', () => {
      node.icon = null;
      saveState(); renderAll();
      hideContextMenu();
    });
  }

  ctxMenu.appendChild(makeSeparator());

  appendCtxItem(ctxMenu, '🗑', 'Delete Node', () => {
    deleteNode(nodeId);
    hideContextMenu();
  }, true);

  // Move to any path (all columns × lanes)
  const moveTargets = [];
  state.columns.forEach(col => {
    col.lanes.forEach(lane => {
      if (col.id === node.columnId && lane.id === node.laneId) return;
      moveTargets.push({ col, lane });
    });
  });
  if (moveTargets.length > 0) {
    ctxMenu.appendChild(makeSeparator());
    const moveHeader = document.createElement('div');
    moveHeader.className = 'ctx-submenu-header';
    moveHeader.textContent = 'Move to Path';
    ctxMenu.appendChild(moveHeader);
    moveTargets.forEach(({ col, lane }) => {
      const laneLabel = lane.name || `Path ${col.lanes.indexOf(lane) + 1}`;
      const lbl = col.lanes.length > 1 ? `${col.name} › ${laneLabel}` : col.name;
      appendCtxItem(ctxMenu, '→', lbl, () => {
        node.columnId = col.id;
        node.laneId = lane.id;
        node.row = nodesInLane(col.id, lane.id).length;
        saveState();
        renderAll();
        hideContextMenu();
      });
    });
  }

  // Position — measure actual rendered size to prevent off-screen clipping
  ctxMenu.classList.add('visible');
  const vw = window.innerWidth, vh = window.innerHeight;
  const menuRect = ctxMenu.getBoundingClientRect();
  const posX = x + menuRect.width  > vw ? vw - menuRect.width  - 8 : x;
  const posY = y + menuRect.height > vh ? vh - menuRect.height - 8 : y;
  ctxMenu.style.left = posX + 'px';
  ctxMenu.style.top = posY + 'px';
}

function appendCtxItem(parent, icon, label, onClick, isDanger = false) {
  const item = document.createElement('div');
  item.className = 'ctx-item' + (isDanger ? ' danger' : '');
  const iconSpan = document.createElement('span');
  iconSpan.style.fontSize = '14px';
  iconSpan.innerHTML = icon; // always an emoji or internal FA tag
  item.appendChild(iconSpan);
  item.appendChild(document.createTextNode(' ' + label));
  item.addEventListener('click', onClick);
  parent.appendChild(item);
}

function makeSeparator() {
  const sep = document.createElement('div');
  sep.className = 'ctx-separator';
  return sep;
}

function hideContextMenu() {
  ctxMenu.classList.remove('visible');
  ctxNodeId = null;
}

// Hide context menu on outside click
document.addEventListener('click', e => {
  if (!ctxMenu.contains(e.target)) hideContextMenu();
});
document.addEventListener('contextmenu', e => {
  // If not on a node, hide
  if (!e.target.closest('.node')) hideContextMenu();
});

/* ===== KEYBOARD SHORTCUTS ===== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cancelConnectionMode();
    hideContextMenu();
    clearSelectedEdge();
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Only delete edge if not focused on an input/contenteditable
    const tag = document.activeElement.tagName;
    const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' ||
      document.activeElement.contentEditable === 'true';
    if (!isEditing && selectedEdgeId) {
      e.preventDefault();
      deleteSelectedEdge();
    }
  }
});

/* ===== CANVAS CLICK (clear selection) ===== */
document.getElementById('canvas-wrapper').addEventListener('click', e => {
  if (!e.target.closest('.node') && !e.target.closest('#context-menu')) {
    clearSelectedEdge();
    if (connectionMode) cancelConnectionMode();
  }
});

/* ===== MODAL SYSTEM ===== */
function showModal({ title, body, actions }) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.innerHTML = '';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  box.appendChild(titleEl);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'modal-body';
  bodyEl.innerHTML = body;
  box.appendChild(bodyEl);

  if (actions && actions.length > 0) {
    const actionsEl = document.createElement('div');
    actionsEl.className = 'modal-actions';
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = a.className || 'btn btn-ghost';
      btn.textContent = a.label;
      btn.addEventListener('click', a.onClick);
      actionsEl.appendChild(btn);
    });
    box.appendChild(actionsEl);
  }

  overlay.classList.add('visible');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
}

function showConfirmModal(title, message, onConfirm) {
  showModal({
    title,
    body: `<p>${message}</p>`,
    actions: [
      { label: 'Cancel', className: 'btn btn-ghost', onClick: closeModal },
      { label: 'Delete', className: 'btn btn-danger-ghost', onClick: () => { onConfirm(); closeModal(); } }
    ]
  });
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

/* ===== ICON PICKER MODAL ===== */
const SKILL_ICONS = [
  'assets/icons/5.png',  'assets/icons/6.png',  'assets/icons/7.png',
  'assets/icons/8.png',  'assets/icons/9.png',  'assets/icons/10.png',
  'assets/icons/11.png', 'assets/icons/12.png', 'assets/icons/13.png',
  'assets/icons/14.png', 'assets/icons/15.png', 'assets/icons/16.png',
  'assets/icons/17.png', 'assets/icons/18.png', 'assets/icons/19.png',
  'assets/icons/20.png',
];

function openIconPickerModal(nodeId) {
  const node = getNode(nodeId);
  if (!node) return;

  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.innerHTML = '';

  const titleEl = document.createElement('div');
  titleEl.className = 'modal-title';
  titleEl.textContent = 'Choose Icon';
  box.appendChild(titleEl);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'modal-body';

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';

  SKILL_ICONS.forEach(src => {
    const btn = document.createElement('button');
    btn.style.cssText = 'padding:4px;border-radius:8px;border:2px solid transparent;background:var(--surface);cursor:pointer;transition:all 0.12s ease;aspect-ratio:1;overflow:hidden;';
    if (node.icon === src) btn.style.borderColor = 'var(--accent-bright)';
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;border-radius:4px;';
    img.draggable = false;
    btn.appendChild(img);
    btn.addEventListener('mouseover', () => { if (node.icon !== src) btn.style.borderColor = 'var(--border-active)'; });
    btn.addEventListener('mouseout',  () => { if (node.icon !== src) btn.style.borderColor = 'transparent'; });
    btn.addEventListener('click', () => {
      node.icon = src;
      saveState(); renderAll();
      closeModal();
    });
    grid.appendChild(btn);
  });

  bodyEl.appendChild(grid);
  box.appendChild(bodyEl);

  const actionsEl = document.createElement('div');
  actionsEl.className = 'modal-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closeModal);
  actionsEl.appendChild(cancelBtn);
  box.appendChild(actionsEl);

  overlay.classList.add('visible');
}

/* ===== ADD COLOR MODAL ===== */
function openAddColorModal() {
  showModal({
    title: 'Add Color',
    body: `
      <div class="form-group">
        <label class="form-label">Color</label>
        <input type="color" id="new-color-picker" value="#8b5cf6" class="form-input" style="height:44px;padding:4px 6px;cursor:pointer;">
      </div>
      <div class="form-group">
        <label class="form-label">Label</label>
        <input type="text" id="new-color-label" placeholder="e.g. On Hold" class="form-input" />
      </div>`,
    actions: [
      { label: 'Cancel', className: 'btn btn-ghost', onClick: closeModal },
      {
        label: 'Add',
        className: 'btn btn-primary',
        onClick: () => {
          const hex = document.getElementById('new-color-picker').value;
          const label = document.getElementById('new-color-label').value.trim() || 'Custom';
          state.colorLegend[hex] = label;
          saveState();
          renderColorLegend();
          closeModal();
        }
      }
    ]
  });
}

/* ===== ADD MARKER MODAL ===== */
function openAddMarkerModal() {
  const availableIcons = Object.entries(MARKER_ICONS);
  const iconOptions = availableIcons.map(([k, v]) =>
    `<button class="ctx-marker-btn" data-key="${k}" title="${k}" onclick="this.classList.toggle('active')" style="width:36px;height:36px">${v}</button>`
  ).join('');

  showModal({
    title: 'Add Marker',
    body: `
      <div class="form-group">
        <label class="form-label">Choose icon</label>
        <div class="ctx-marker-row" style="gap:8px;flex-wrap:wrap;">${iconOptions}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Label / Explanation</label>
        <input type="text" id="new-marker-label" placeholder="e.g. Needs QA sign-off" class="form-input" />
      </div>`,
    actions: [
      { label: 'Cancel', className: 'btn btn-ghost', onClick: closeModal },
      {
        label: 'Add',
        className: 'btn btn-primary',
        onClick: () => {
          const active = document.querySelector('.modal-body .ctx-marker-btn.active');
          if (!active) { showToast('Select an icon first', '⚠️'); return; }
          const key = active.dataset.key;
          const label = document.getElementById('new-marker-label').value.trim() || key;
          state.markerLegend[key] = label;
          saveState();
          renderMarkerLegend();
          closeModal();
        }
      }
    ]
  });
}

/* ===== TOAST SYSTEM ===== */
function showToast(message, icon = 'ℹ️', duration = 2500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.innerHTML = icon; // always an emoji or internal FA tag
  toast.appendChild(iconSpan);
  toast.appendChild(document.createTextNode(message));
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 300); // fallback when animations are disabled
  }, duration);
}

/* ===== RESIZE OBSERVER ===== */
const resizeObserver = new ResizeObserver(() => {
  updateSvgSize();
  renderConnections();
});
resizeObserver.observe(document.getElementById('canvas-wrapper'));

// ============================================================
// CHUNK 4 — PERSISTENCE + EXPORT + INIT
// ============================================================

/* ===== SAVE STATE ===== */
function saveState() {
  try {
    localStorage.setItem('skillTreeData', JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

/* ===== LOAD STATE ===== */
function loadState() {
  try {
    const raw = localStorage.getItem('skillTreeData');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate minimal structure
      if (parsed && parsed.columns && parsed.nodes && parsed.edges) {
        state = migrateState(parsed);
        return true;
      }
    }
  } catch (e) {
    console.warn('localStorage load failed:', e);
  }
  return false;
}

/* ===== JSON EXPORT ===== */
function saveJSON() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (state.title || 'roadmap').replace(/\s+/g, '-').toLowerCase() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Saved as JSON', '💾');
}

/* ===== JSON IMPORT ===== */
function loadJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.columns || !parsed.nodes || !parsed.edges) {
        throw new Error('Invalid diagram file');
      }
      state = migrateState(parsed);
      saveState();
      syncTitleInput();
      renderAll();
      showToast('Diagram loaded', '✅');
    } catch (err) {
      showToast('Failed to load: ' + err.message, '❌');
    }
  };
  reader.readAsText(file);
}

/* ===== GAME SKILLS TEMPLATE ===== */
function gameSkillsState() {
  return {
    title: 'Game Skills Map',
    columns: [
      { id: 'col-1', name: 'Tier I',   lanes: [{ id: 'ln-1', name: '' }] },
      { id: 'col-2', name: 'Tier II',  lanes: [{ id: 'ln-2', name: '' }] },
      { id: 'col-3', name: 'Tier III', lanes: [
        { id: 'ln-3', name: '' },
        { id: 'ln-1772241651961', name: 'Mass destruction' }
      ]},
    ],
    nodes: [
      { id: 'n-1',              columnId: 'col-1', laneId: 'ln-1',              row: 0, rowSpan: 1, text: 'Skill 1',    color: '#0063e5', markers: [],           locked: false, icon: 'assets/icons/5.png'  },
      { id: 'n-2',              columnId: 'col-1', laneId: 'ln-1',              row: 1, rowSpan: 1, text: 'Skill 2',    color: '#0063e5', markers: [],           locked: false, icon: 'assets/icons/6.png'  },
      { id: 'n-3',              columnId: 'col-1', laneId: 'ln-1',              row: 2, rowSpan: 1, text: 'Skill 3',    color: '#0063e5', markers: [],           locked: true,  icon: 'assets/icons/18.png' },
      { id: 'n-4',              columnId: 'col-2', laneId: 'ln-2',              row: 0, rowSpan: 1, text: 'Skill 1 II', color: '#6b7280', markers: ['star'],     locked: false, icon: 'assets/icons/14.png' },
      { id: 'n-5',              columnId: 'col-2', laneId: 'ln-2',              row: 1, rowSpan: 1, text: 'Skill 2 II', color: '#6b7280', markers: [],           locked: false, icon: 'assets/icons/6.png'  },
      { id: 'n-6',              columnId: 'col-2', laneId: 'ln-2',              row: 2, rowSpan: 1, text: 'Skill 6',    color: '#6b7280', markers: [],           locked: true,  icon: 'assets/icons/16.png' },
      { id: 'n-7',              columnId: 'col-3', laneId: 'ln-3',              row: 0, rowSpan: 1, text: 'Skill 1 III',color: '#6b7280', markers: ['lightning'],locked: false, icon: 'assets/icons/7.png'  },
      { id: 'n-8',              columnId: 'col-3', laneId: 'ln-3',              row: 1, rowSpan: 1, text: 'Skill 2 III',color: '#6b7280', markers: [],           locked: false, icon: 'assets/icons/11.png' },
      { id: 'n-1772241651962',  columnId: 'col-3', laneId: 'ln-1772241651961', row: 0, rowSpan: 1, text: 'Skill 1 IV', color: '#6b7280', markers: [],           locked: false, icon: 'assets/icons/20.png' },
      { id: 'n-1772241651963',  columnId: 'col-3', laneId: 'ln-3',              row: 2, rowSpan: 1, text: 'Skill 2 III',color: '#6b7280', markers: [],           locked: false, icon: 'assets/icons/13.png' },
      { id: 'n-1772241651964',  columnId: 'col-3', laneId: 'ln-1772241651961', row: 1, rowSpan: 1, text: 'Skill 2 IV', color: '#6b7280', markers: [],           locked: true,  icon: 'assets/icons/19.png' },
    ],
    edges: [
      { id: 'e-1',              from: 'n-1',             to: 'n-4',             type: 'enables' },
      { id: 'e-2',              from: 'n-2',             to: 'n-5',             type: 'enables' },
      { id: 'e-3',              from: 'n-3',             to: 'n-6',             type: 'enables' },
      { id: 'e-4',              from: 'n-4',             to: 'n-7',             type: 'enables' },
      { id: 'e-5',              from: 'n-5',             to: 'n-7',             type: 'enables' },
      { id: 'e-6',              from: 'n-6',             to: 'n-8',             type: 'enables' },
      { id: 'e-1772241651966',  from: 'n-1772241651963', to: 'n-1772241651964', type: 'blocks'  },
      { id: 'e-1772241651967',  from: 'n-8',             to: 'n-1772241651963', type: 'blocks'  },
      { id: 'e-1772241651968',  from: 'n-7',             to: 'n-1772241651962', type: 'blocks'  },
      { id: 'e-1772241651969',  from: 'n-8',             to: 'n-1772241651964', type: 'blocks'  },
    ],
    colorLegend: {
      '#0063e5': 'Unlocked',
      '#22c55e': 'Mastered',
      '#6b7280': 'Locked',
      '#ef4444': 'Blocked',
    },
    markerLegend: {
      star:      'Signature Skill',
      lightning: 'Ultimate',
      check:     'Mastered',
      fire:      'Active',
      warning:   'Prerequisite Missing',
    }
  };
}

/* ===== NEW DIAGRAM ===== */
function newDiagram() {
  function makeCard(emoji, title, desc, onClick) {
    const btn = document.createElement('button');
    btn.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:6px;padding:16px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);cursor:pointer;text-align:left;transition:all 0.15s ease;';
    btn.addEventListener('mouseover', () => { btn.style.borderColor = 'var(--accent)'; btn.style.background = 'rgba(0,99,229,0.08)'; });
    btn.addEventListener('mouseout',  () => { btn.style.borderColor = 'var(--border)';  btn.style.background = 'var(--surface)'; });
    btn.innerHTML = `<span style="font-size:20px">${emoji}</span><span style="font-weight:600;font-size:13px">${title}</span><span style="font-size:11px;color:var(--text-secondary);line-height:1.5">${desc}</span>`;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function buildModal(titleText, cards, onBack) {
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-box');
    box.innerHTML = '';

    const titleEl = document.createElement('div');
    titleEl.className = 'modal-title';
    titleEl.textContent = titleText;
    box.appendChild(titleEl);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'modal-body';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;';
    cards.forEach(c => row.appendChild(c));
    bodyEl.appendChild(row);
    box.appendChild(bodyEl);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'modal-actions';
    if (onBack) {
      const backBtn = document.createElement('button');
      backBtn.className = 'btn btn-ghost';
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-left" style="margin-right:6px"></i>Back';
      backBtn.addEventListener('click', onBack);
      actionsEl.appendChild(backBtn);
    }
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeModal);
    actionsEl.appendChild(cancelBtn);
    box.appendChild(actionsEl);

    overlay.classList.add('visible');
  }

  function showStep2() {
    buildModal('Choose Template', [
      makeCard('📋', 'Skill Roadmap', 'Stages, milestones and typed connections for learning paths', () => {
        closeModal();
        state = defaultState();
        saveState(); syncTitleInput(); renderAll();
        showToast('Roadmap template loaded', '📋');
      }),
      makeCard('⚔️', 'Game Skills Map', 'Tiered skill tree with icon cards — edit then customise', () => {
        closeModal();
        state = gameSkillsState();
        saveState(); syncTitleInput(); renderAll();
        showToast('Game skills template loaded', '⚔️');
      }),
    ], showStep1);
  }

  function showStep1() {
    buildModal('New Diagram', [
      makeCard('📋', 'From Template', 'Start from a pre-built layout', showStep2),
      makeCard('✨', 'Start Blank', 'Empty canvas — build your own structure from scratch', () => {
        closeModal();
        state = blankState();
        saveState(); syncTitleInput(); renderAll();
        showToast('Blank canvas ready!', '✨');
      }),
    ], null);
  }

  showStep1();
}

/* ===== SYNC TITLE INPUT ===== */
function syncTitleInput() {
  const input = document.getElementById('diagram-title');
  if (input) input.value = state.title || 'My Roadmap';
}

/* ===== MARKDOWN EXPORT ===== */
function exportMarkdown() {
  const lines = [];
  lines.push(`# ${state.title || 'Roadmap'}`);
  lines.push('');

  // Legend section
  lines.push('## Legend');
  lines.push('');
  lines.push('### Colors');
  const colorEmojis = { '#22c55e': '🟢', '#ef4444': '🔴', '#6b7280': '⚫', '#0063e5': '🔵', '#f59e0b': '🟡' };
  Object.entries(state.colorLegend).forEach(([hex, label]) => {
    const emoji = colorEmojis[hex] || '🔘';
    lines.push(`- ${emoji} \`${hex}\` — ${label}`);
  });
  lines.push('');
  lines.push('### Markers');
  Object.entries(state.markerLegend).forEach(([key, label]) => {
    lines.push(`- [${key}] **${key}** — ${label}`);
  });
  lines.push('');

  // Build hierarchy by traversing edges left-to-right
  // Find roots: nodes with no incoming edges (or only in leftmost column)
  const colOrder = state.columns.map(c => c.id);

  // Build adjacency: from each node, find its connected right-column nodes
  function getConnectedTargets(nodeId) {
    return outgoingEdges(nodeId).map(e => getNode(e.to)).filter(Boolean);
  }

  // Format a node as a line with status emoji and markers
  function nodeStatusEmoji(node) {
    const emoji = colorEmojis[node.color] || '🔘';
    return emoji;
  }
  function nodeMarkerStr(node) {
    if (!node.markers || node.markers.length === 0) return '';
    return ' ' + node.markers.map(m => {
      const label = state.markerLegend[m] || m;
      return `[${m}](${label})`;
    }).join(' ');
  }
  function lockStr(node) {
    return computeEffectiveLock(node) ? ' 🔒' : '';
  }

  // Recursive hierarchy writer
  const visited = new Set();
  function writeNode(node, depth) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const colIdx = colOrder.indexOf(node.columnId);
    const colName = state.columns[colIdx]?.name || 'Column';
    const headingLevel = Math.min(colIdx + 2, 6); // h2–h6
    const heading = '#'.repeat(headingLevel);
    const emoji = nodeStatusEmoji(node);
    const markers = nodeMarkerStr(node);
    const lock = lockStr(node);

    lines.push(`${heading} ${emoji} ${node.text}${markers}${lock}`);
    lines.push(`*${colName}*`);
    lines.push('');

    // List outgoing connections
    const targets = getConnectedTargets(node.id);
    if (targets.length > 0) {
      targets.forEach(target => {
        const edge = state.edges.find(e => e.from === node.id && e.to === target.id);
        const edgeDef = EDGE_TYPE_DEFS.find(d => d.type === edge?.type);
        const edgeLabel = edgeDef?.label || edge?.type || 'leads to';
        lines.push(`> [${edgeLabel}] **${target.text}**`);
      });
      lines.push('');
    }
  }

  // Write columns in order, grouping by column
  state.columns.forEach((col, colIdx) => {
    const colNodes = nodesInColumn(col.id);
    if (colNodes.length === 0) return;

    const h = '#'.repeat(Math.min(colIdx + 2, 6));
    lines.push(`---`);
    lines.push('');
    lines.push(`## 📋 ${col.name}`);
    lines.push('');

    colNodes.forEach(node => {
      const emoji = nodeStatusEmoji(node);
      const markers = nodeMarkerStr(node);
      const lock = lockStr(node);
      const colorLabel = state.colorLegend[node.color] || node.color;

      lines.push(`### ${node.text}`);
      lines.push('');
      lines.push(`- **Status:** ${emoji} ${colorLabel}${lock}`);
      if (node.markers && node.markers.length > 0) {
        lines.push(`- **Markers:** ${node.markers.map(m => `[${m}] ${state.markerLegend[m]||m}`).join(', ')}`);
      }
      // Incoming
      const incoming = incomingEdges(node.id);
      if (incoming.length > 0) {
        const deps = incoming.map(e => {
          const src = getNode(e.from);
          const srcDef = EDGE_TYPE_DEFS.find(d => d.type === e.type);
          return src ? `[${srcDef?.label || e.type}] ${src.text}` : null;
        }).filter(Boolean);
        if (deps.length) lines.push(`- **Depends on:** ${deps.join(', ')}`);
      }
      // Outgoing
      const outgoing = outgoingEdges(node.id);
      if (outgoing.length > 0) {
        const targets = outgoing.map(e => {
          const tgt = getNode(e.to);
          const tgtDef = EDGE_TYPE_DEFS.find(d => d.type === e.type);
          return tgt ? `[${tgtDef?.label || e.type}] ${tgt.text}` : null;
        }).filter(Boolean);
        if (targets.length) lines.push(`- **Leads to:** ${targets.join(', ')}`);
      }
      lines.push('');
    });
  });

  const md = lines.join('\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (state.title || 'roadmap').replace(/\s+/g, '-').toLowerCase() + '.md';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported as Markdown', '📄');
}

/* ===== AUTO LAYOUT ===== */
function autoLayout() {
  let changed = false;
  state.columns.forEach((col, colIdx) => {
    col.lanes.forEach(lane => {
      const nodes = nodesInLane(col.id, lane.id);
      if (nodes.length < 2) return;

      const scored = nodes.map(node => {
        const incomingSources = state.edges
          .filter(e => e.to === node.id)
          .map(e => getNode(e.from))
          .filter(src => {
            if (!src) return false;
            const srcColIdx = state.columns.findIndex(c => c.id === src.columnId);
            return srcColIdx < colIdx;
          });

        const score = incomingSources.length > 0
          ? incomingSources.reduce((sum, src) => sum + src.row, 0) / incomingSources.length
          : node.row;

        return { node, score };
      });

      scored.sort((a, b) => a.score - b.score || a.node.row - b.node.row);
      scored.forEach(({ node }, idx) => {
        if (node.row !== idx) changed = true;
        node.row = idx;
      });
    });
  });

  if (changed) {
    saveState();
    renderAll();
    showToast('Layout aligned', '<i class="fa-solid fa-align-center"></i>');
  } else {
    showToast('Already aligned', '<i class="fa-solid fa-check"></i>');
  }
}

/* ===== BUTTON WIRING ===== */
document.getElementById('btn-new').addEventListener('click', newDiagram);
document.getElementById('btn-auto-layout').addEventListener('click', autoLayout);
document.getElementById('btn-save-json').addEventListener('click', saveJSON);
document.getElementById('btn-export-md').addEventListener('click', exportMarkdown);

document.getElementById('btn-load-json').addEventListener('click', () => {
  document.getElementById('load-json-input').click();
});
document.getElementById('load-json-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadJSON(file);
  e.target.value = ''; // reset so same file can be reloaded
});

document.getElementById('diagram-title').addEventListener('input', e => {
  state.title = e.target.value;
  saveState();
});
document.getElementById('diagram-title').addEventListener('change', e => {
  state.title = e.target.value.trim() || 'My Roadmap';
  e.target.value = state.title;
  saveState();
});

/* ===== INIT ===== */
(function init() {
  const restored = loadState();
  syncTitleInput();
  renderAll();
  // Always persist state so reloads restore correctly
  saveState();

  // Re-render connections after layout settles
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      renderConnections();
      if (restored) {
        showToast('Restored from save', '✅', 2000);
      }
    });
  });

  // Re-render connections on scroll — debounced via rAF to avoid mid-scroll jitter
  let _scrollRaf = null;
  document.getElementById('canvas-wrapper').addEventListener('scroll', () => {
    if (_scrollRaf) cancelAnimationFrame(_scrollRaf);
    _scrollRaf = requestAnimationFrame(() => { renderConnections(); _scrollRaf = null; });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    updateSvgSize();
    renderConnections();
  });
})();



