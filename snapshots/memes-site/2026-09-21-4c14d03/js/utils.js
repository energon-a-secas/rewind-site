// ── Shared helpers ───────────────────────────────────────────────────

/** Show a temporary toast notification. */
let toastTimer;
export function showToast(msg) {
  const t = document.getElementById('toast');
  // Announced by screen readers. Without these the toast is
  // invisible to anyone not looking at that corner of the screen.
  t.setAttribute('role', 'status');
  t.setAttribute('aria-live', 'polite');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2000);
}

/** Format a meme filename into a readable, capitalized name. */
export function formatName(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Trigger a browser download for the given path. */
export function downloadMeme(path, filename) {
  const a = document.createElement('a');
  a.href = path;
  a.download = filename;
  a.click();
}

/** Copy the full URL of a meme to the clipboard. */
export async function copyMemeUrl(path) {
  try {
    const url = new URL(path, window.location.href).href;
    await navigator.clipboard.writeText(url);
    showToast('URL copied to clipboard');
  } catch {
    showToast('Copy failed');
  }
}

/**
 * Copy a non-GIF meme image to the clipboard as a PNG blob.
 * GIFs/webp cannot be clipboard-copied — callers should fall back to download.
 */
export async function copyMemeImage(path, ext, isCrossOrigin) {
  if (ext === 'gif' || ext === 'webp') {
    showToast("This format can't be clipboard-copied. Use Download instead");
    return;
  }
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      if (isCrossOrigin) i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = path;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('Image copied to clipboard');
  } catch {
    showToast('Copy failed. Try Download instead');
  }
}
