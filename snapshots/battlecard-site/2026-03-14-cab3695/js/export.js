import { toast } from './utils.js';

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
    toast('Export failed — check console');
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
    toast('Popup blocked — allow popups for this site');
  }
}
