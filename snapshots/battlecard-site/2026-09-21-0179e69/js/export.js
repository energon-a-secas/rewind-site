import { toast } from './utils.js';
import { state, normalizeCard, replaceState } from './state.js';
import { renderAll, applyTheme } from './render.js';

export function exportJSON() {
  const payload = { app: 'battlecard', version: 1, ...JSON.parse(JSON.stringify(state)) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'battlecard.json';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  toast('JSON downloaded');
}

export function importJSONFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let card = null;
    try { card = normalizeCard(JSON.parse(reader.result)); } catch (_) {}
    if (!card) { toast('Not a valid battlecard JSON'); return; }
    replaceState(card);
    renderAll();
    applyTheme(state.theme);
    toast('Card imported');
  };
  reader.onerror = () => toast('Could not read file');
  reader.readAsText(file);
}

export async function copyShareLink() {
  // The logo data URL can be hundreds of KB — links carry everything but it.
  const card = JSON.parse(JSON.stringify(state));
  if (card.brand) card.brand.logoDataUrl = '';
  const encoded = btoa(encodeURIComponent(JSON.stringify(card)));
  const url = `${location.origin}${location.pathname}#c=${encoded}`;
  try {
    await navigator.clipboard.writeText(url);
    toast(state.brand?.logoDataUrl ? 'Link copied (logo not included)' : 'Share link copied');
  } catch (_) {
    prompt('Copy this link:', url);
  }
}

export async function exportPNG() {
  const card = document.getElementById('battlecard');
  if (!card || typeof html2canvas === 'undefined') {
    toast('Export library not ready, try again');
    return;
  }
  toast('Generating PNG...');
  const controls = card.querySelectorAll('.section-controls');
  controls.forEach(el => { el.style.visibility = 'hidden'; });
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#0c1219',
      scale: 2,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = 'battlecard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('PNG downloaded');
  } catch (err) {
    toast('Export failed, check console');
    console.error(err);
  } finally {
    controls.forEach(el => { el.style.visibility = ''; });
  }
}

export async function exportView() {
  const card = document.getElementById('battlecard');
  if (!card) return;
  let css = '';
  try {
    const resp = await fetch('./css/style.css');
    css = await resp.text();
  } catch (_) {}
  const cardHtml = card.outerHTML;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Battle Card</title>
<style>
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
body { background:#0c1219; font-family:'Avenir Next',system-ui,sans-serif; display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; min-height:100vh; }
.section-controls { display:none !important; }
[contenteditable] { outline:none; cursor:default; pointer-events:none; }
${css}
</style>
</head>
<body>
${cardHtml}
<script>
document.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
<\/script>
</body>
</html>`;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    toast('Opened in new tab');
  } else {
    toast('Popup blocked, allow popups for this site');
  }
}
