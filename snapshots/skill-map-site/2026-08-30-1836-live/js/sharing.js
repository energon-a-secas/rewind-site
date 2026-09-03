// Share link management
import { convex, api, auth } from './state.js';
import { showModal, closeModal, showToast } from './utils.js';

// Generate a random share token
function generateToken(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Show share modal
export async function showShareModal(roadmapId) {
  if (!auth.isAuthenticated) {
    showToast('Please log in to share roadmaps', 'error');
    return;
  }

  // Check if roadmap exists
  const result = await convex.query(api.roadmaps.get, { roadmapId });

  if (!result.ok || !result.roadmap) {
    showToast('Roadmap not found', 'error');
    return;
  }

  // Check if share link already exists
  const shareResult = await convex.query(api.shareLinks.getByRoadmapId, {
    roadmapId,
    username: auth.username
  });

  const content = createShareModalContent(roadmapId, shareResult);
  showModal(content);
}

// Create share modal content
function createShareModalContent(roadmapId, existingShare) {
  const roadmapTitle = existingShare?.roadmap?.title || 'Untitled Map';
  const isActive = existingShare?.link?.isActive || false;
  const shareUrl = existingShare?.link?.token
    ? `${window.location.origin}/share/${existingShare.link.token}`
    : null;
  const views = existingShare?.link?.views || 0;

  return `
    <div class="share-modal">
      <h2>Share Roadmap</h2>
      <p class="share-roadmap-title">${escHtml(roadmapTitle)}</p>

      ${existingShare?.link ? `
        <div class="share-status">
          <div class="share-status-indicator ${isActive ? 'active' : 'inactive'}">
            <i class="fas ${isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${isActive ? 'Link is active' : 'Link is disabled'}
          </div>
          ${views > 0 ? `<div class="share-views">👁 ${views} view${views !== 1 ? 's' : ''}</div>` : ''}
        </div>

        <div class="share-url-container">
          <input type="text" class="share-url-input" value="${shareUrl}" readonly />
          <button class="btn btn-secondary btn-copy" onclick="copyShareUrl()">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>

        <div class="share-toggle">
          <label class="toggle-switch">
            <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleShareLink('${roadmapId}')">
            <span class="toggle-slider"></span>
          </label>
          <span>Enable public sharing</span>
        </div>
      ` : `
        <div class="share-create">
          <p>This roadmap is not shared yet. Create a shareable link to let others view it.</p>
          <button class="btn btn-primary" onclick="createShareLink('${roadmapId}')">
            <i class="fas fa-link"></i> Create Share Link
          </button>
        </div>
      `}

      <div class="share-info">
        <i class="fas fa-info-circle"></i>
        Shared roadmaps are read-only. Viewers can see your map but cannot edit it.
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
}

// Create a new share link
export async function createShareLink(roadmapId) {
  try {
    if (!auth.isAuthenticated) {
      showToast('Please log in', 'error');
      return;
    }

    const result = await convex.mutation(api.shareLinks.create, {
      roadmapId,
      username: auth.username
    });

    if (result.ok) {
      showToast('Share link created!', 'success');
      // Show the modal again with the new link
      setTimeout(() => showShareModal(roadmapId), 300);
    } else {
      showToast(result.error || 'Failed to create share link', 'error');
    }
  } catch (err) {
    console.error('Create share link error:', err);
    showToast('Error creating share link', 'error');
  }
}

// Toggle share link active/inactive
export async function toggleShareLink(roadmapId) {
  try {
    if (!auth.isAuthenticated) {
      showToast('Please log in', 'error');
      return;
    }

    const shareResult = await convex.query(api.shareLinks.getByRoadmapId, {
      roadmapId,
      username: auth.username
    });

    if (!shareResult?.link) {
      showToast('No share link found', 'error');
      return;
    }

    const token = shareResult.link.token;
    const isActive = shareResult.link.isActive;

    const result = await convex.mutation(api.shareLinks.disable, {
      token,
      username: auth.username,
      disable: isActive // If currently active, disable it
    });

    if (result.ok) {
      const action = isActive ? 'disabled' : 'enabled';
      showToast(`Share link ${action}`, 'success');
      // Refresh the modal
      setTimeout(() => showShareModal(roadmapId), 300);
    } else {
      showToast(result.error || 'Failed to update share link', 'error');
    }
  } catch (err) {
    console.error('Toggle share link error:', err);
    showToast('Error updating share link', 'error');
  }
}

// Copy share URL to clipboard
export async function copyShareUrl() {
  const urlInput = document.querySelector('.share-url-input');
  if (!urlInput) return;

  const url = urlInput.value;
  const success = await copyToClipboard(url);

  if (success) {
    showToast('Link copied to clipboard!', 'success');
    const copyBtn = document.querySelector('.btn-copy');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    }
  } else {
    showToast('Failed to copy link', 'error');
  }
}

// Load and display a shared roadmap
export async function loadSharedRoadmap(token) {
  try {
    const result = await convex.query(api.shareLinks.getByToken, { token });

    if (!result.ok) {
      showToast('Invalid or expired share link', 'error');
      return null;
    }

    if (!result.link.isActive) {
      showToast('This share link has been disabled', 'error');
      return null;
    }

    // Increment view count
    await convex.mutation(api.shareLinks.recordView, {
      token,
      username: '' // Anonymous view
    });

    return result.link;
  } catch (err) {
    console.error('Load shared roadmap error:', err);
    showToast('Failed to load shared roadmap', 'error');
    return null;
  }
}

// HTML escaping helper
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Expose functions globally for onclick handlers
window.showShareModal = showShareModal;
window.createShareLink = createShareLink;
window.toggleShareLink = toggleShareLink;
window.copyShareUrl = copyShareUrl;
