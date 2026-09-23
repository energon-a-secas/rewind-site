// ── Internationalization ─────────────────────────────────────
// UI chrome strings in both languages. Guide content lives in guides.js.

export const ui = {
  siteTitle: { en: 'SafeGuard', es: 'SafeGuard' },
  siteSubtitle: { en: 'Simple Security Tutorials', es: 'Tutoriales Sencillos de Seguridad' },
  searchPlaceholder: { en: 'Search tutorials...', es: 'Buscar tutoriales...' },
  allCategories: { en: 'All', es: 'Todas' },
  lastUpdated: { en: 'Updated', es: 'Actualizado' },
  expandAll: { en: 'Expand all', es: 'Expandir todo' },
  collapseAll: { en: 'Collapse all', es: 'Colapsar todo' },
  backToGuides: { en: 'All tutorials', es: 'Todos los tutoriales' },
  noResults: { en: 'No tutorials match your search', es: 'Ningun tutorial coincide con tu busqueda' },
  readGuide: { en: 'Read tutorial', es: 'Leer tutorial' },
  tableOfContents: { en: 'In this tutorial', es: 'En este tutorial' },
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
