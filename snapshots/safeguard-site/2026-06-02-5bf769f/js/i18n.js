// ── Internationalization ─────────────────────────────────────
// UI chrome strings in both languages. Guide content lives in guides.js.

export const ui = {
  siteTitle: { en: 'Lockdown', es: 'Lockdown' },
  siteSubtitle: { en: 'Security Hardening Guides', es: 'Guias de Seguridad' },
  searchPlaceholder: { en: 'Search guides...', es: 'Buscar guias...' },
  allCategories: { en: 'All', es: 'Todas' },
  lastUpdated: { en: 'Updated', es: 'Actualizado' },
  expandAll: { en: 'Expand all', es: 'Expandir todo' },
  collapseAll: { en: 'Collapse all', es: 'Colapsar todo' },
  backToGuides: { en: 'All guides', es: 'Todas las guias' },
  noResults: { en: 'No guides match your search', es: 'Ninguna guia coincide con tu busqueda' },
  readGuide: { en: 'Read guide', es: 'Leer guia' },
  tableOfContents: { en: 'In this guide', es: 'En esta guia' },
  tipLabel: { en: 'Tip', es: 'Consejo' },
  warningLabel: { en: 'Warning', es: 'Advertencia' },
  stepsLabel: { en: 'Steps', es: 'Pasos' },
  categoryLabels: {
    apple:     { en: 'Apple',            es: 'Apple' },
    google:    { en: 'Google',           es: 'Google' },
    passwords: { en: 'Password Managers', es: 'Gestores de Contrasenas' },
    mobile:    { en: 'Mobile',           es: 'Movil' },
    browser:   { en: 'Browser & Phishing', es: 'Navegador y Phishing' },
    network:   { en: 'Network',          es: 'Red' },
    data:      { en: 'Backups & Data',   es: 'Respaldos y Datos' },
    travel:    { en: 'Travel',           es: 'Viaje' },
  },
};

export function t(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.en || '';
}
