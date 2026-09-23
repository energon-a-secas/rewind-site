// ── Shared helpers ───────────────────────────────────────────────────

/** Show a temporary toast notification at the bottom of the viewport. */
let toastTimer;
export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2000);
}

/** Trigger a browser download for the given path. */
export function downloadEmoji(path, filename) {
  const a = document.createElement('a');
  a.href = path;
  a.download = filename;
  a.click();
}

/**
 * Copy a non-GIF emoji to the clipboard as a PNG blob.
 * GIFs cannot be clipboard-copied — callers should fall back to download.
 */
export async function copyEmoji(path, ext, isCrossOrigin) {
  if (ext === 'gif') {
    showToast("GIFs can't be clipboard-copied. Use Download instead");
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
    showToast('Copied to clipboard');
  } catch (err) {
    showToast('Copy failed. Try Download instead');
  }
}
