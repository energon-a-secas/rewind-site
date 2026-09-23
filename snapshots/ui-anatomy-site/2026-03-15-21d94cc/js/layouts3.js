// Industry layout variants: Agency, Photography, Magazine, Docs, Healthcare
// Each layout links to a basic type via parentType in data.js.

import { makeHelpers, sharedNavbar, sharedFooter, featureGrid } from './layouts.js';

// ── Agency Portfolio ─────────────────────────────────────────────────────────
// parentType: portfolio — Pentagram/IDEO-style minimal design agency
export function agencyLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const caseStudyRow = (title, client, tags, imgLeft) => {
    const imgSide = `<div data-comp="thumbnail" style="flex:1;min-width:0">${H.img('100%', 200)}</div>`;
    const textSide = `
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;padding:24px 32px">
        <div style="margin-bottom:8px">${tags.map(t => `<span data-comp="badge">${H.bdg(t)}</span>`).join(' ')}
        </div>
        <div data-comp="headline">${H.lw(220, 22, title)}</div>
        <div style="margin-top:6px">${H.lw(120, 10, client)}</div>
      </div>`;
    return `
    <div class="wf-comp" data-comp="project-card" style="display:flex;border-bottom:1px solid #e5e7eb;min-height:200px">
      ${imgLeft ? imgSide + textSide : textSide + imgSide}
    </div>`;
  };

  const teamMember = (name, role) => `
    <div class="wf-comp" data-comp="team-card" style="flex:0 0 auto;text-align:center;min-width:130px">
      <div data-comp="avatar">${H.avatarEl(64)}</div>
      <div style="margin-top:8px">${H.lw(90, 12, name)}</div>
      <div style="margin-top:3px">${H.lw(70, 8, role)}</div>
    </div>`;

  return `<div class="wf-page">
    <!-- Minimal top bar: wordmark + hamburger only -->
    <nav class="wf-comp wf-navbar" data-comp="navbar" style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid #e5e7eb">
      <div class="wf-comp" data-comp="wordmark">${H.lw(100, 18, 'Studio')}</div>
      <div class="wf-comp wf-ham" data-comp="hamburger" style="cursor:pointer">
        <div class="wf-ham-line"></div><div class="wf-ham-line"></div><div class="wf-ham-line"></div>
      </div>
    </nav>

    <!-- Full-screen case study cards stacked vertically -->
    <div class="wf-comp" data-comp="hero-section" style="padding:0">
      ${caseStudyRow('E-commerce Reimagined', 'Shopify — 2024', ['Branding', 'UX'], true)}
      ${caseStudyRow('Brand Identity System', 'Stripe — 2024', ['Identity', 'Print'], false)}
      ${caseStudyRow('Mobile Experience', 'Headspace — 2023', ['iOS', 'Motion'], true)}
    </div>

    <!-- Horizontal scroll team section -->
    <div class="wf-section" style="padding:28px 0">
      <div class="wf-comp wf-section-header" data-comp="section-header" style="padding:0 32px;margin-bottom:16px">
        ${H.lw(100, 18, 'The Team')}
        <div style="margin-top:4px">${H.lw(200, 10, 'Designers, strategists, and makers.')}</div>
      </div>
      <div style="overflow-x:auto;display:flex;gap:20px;padding:20px 32px">
        ${teamMember('Anna Kim', 'Creative Dir.')}
        ${teamMember('Leo Vargas', 'Design Lead')}
        ${teamMember('Mei Chen', 'Strategist')}
        ${teamMember('Ravi Patel', 'Developer')}
        ${teamMember('Sofia Ruiz', 'Motion')}
        ${teamMember('David Osei', 'Type Designer')}
      </div>
    </div>

    <!-- Awards ribbon -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:18px 32px;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap">
      ${['Awwwards SOTD', 'D&AD Pencil', 'Red Dot 2024', 'CSS Design Award', 'FWA of the Day'].map(a => `
        <span data-comp="badge">${H.bdg(a)}</span>`).join('')}
    </div>

    <!-- Giant contact section -->
    <div class="wf-section" style="padding:60px 32px;text-align:center">
      <div class="wf-comp wf-section-header" data-comp="section-header" style="margin-bottom:16px">
        ${H.lw(160, 14, 'New project? Say hello.')}
      </div>
      <div data-comp="cta-button" style="display:inline-block">
        <a style="font-size:36px;font-weight:700;color:#111827;text-decoration:none;font-family:-apple-system,sans-serif;letter-spacing:-0.5px;display:block">
          ${opts.dummy ? 'hello@studio.com' : `<div class="wl wl-28" style="width:260px"></div>`}
        </a>
      </div>
      <div style="margin-top:12px">${H.lw(200, 10, 'We typically respond within 24 hours.')}</div>
    </div>

    <!-- Minimal footer -->
    <div class="wf-comp" data-comp="footer" style="background:#111827;padding:20px 32px;display:flex;justify-content:space-between;align-items:center">
      <div data-comp="wordmark">${H.lw(70, 10, '© 2025 Studio')}</div>
      <div class="wf-comp wf-social-icons" data-comp="social-icons">
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
      </div>
    </div>
  </div>`;
}

// ── Photography Portfolio ────────────────────────────────────────────────────
// parentType: portfolio — image-heavy gallery grid, minimal text
export function photographyLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const galleryItem = (title, category) => `
    <div class="wf-comp" data-comp="project-card" style="position:relative;overflow:hidden;border-radius:8px">
      <div data-comp="thumbnail">${H.img('100%', 200)}</div>
      <div style="padding:10px 12px;background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
        ${H.lw(100, 10, title)}
        <div style="margin-top:4px" data-comp="badge">${H.bdg(category)}</div>
      </div>
    </div>`;

  return `<div class="wf-page">
    <!-- Minimal navbar: centered wordmark -->
    <nav class="wf-comp wf-navbar" data-comp="navbar" style="justify-content:center;gap:32px">
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Work', 30)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('About', 32)}</div>
      <div class="wf-comp" data-comp="logo" style="display:flex;align-items:center;gap:7px">
        <div class="wf-comp" data-comp="wordmark">${H.lw(90, 18, 'Alex Reed')}</div>
      </div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Prints', 30)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Contact', 40)}</div>
    </nav>

    <!-- Full-width hero image -->
    <div class="wf-comp" data-comp="hero-section" style="position:relative">
      <div data-comp="hero-image">${H.img('100%', 340)}</div>
      <div style="position:absolute;bottom:24px;left:32px;right:32px">
        <div data-comp="headline">${H.lw(200, 28, 'Capturing moments')}</div>
        <div style="margin-top:6px" data-comp="subheadline">${H.lw(260, 10, 'Editorial & commercial photography based in New York')}</div>
      </div>
    </div>

    <!-- Gallery grid: 3 columns masonry-style -->
    <div class="wf-section">
      <div class="wf-comp wf-section-header" data-comp="section-header">
        ${H.lw(120, 18, 'Selected Work')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        ${galleryItem('Urban Series', 'Street')}
        ${galleryItem('Mountain Dawn', 'Landscape')}
        ${galleryItem('Studio Portraits', 'Portrait')}
        ${galleryItem('Fashion Week', 'Editorial')}
        ${galleryItem('Architecture', 'Commercial')}
        ${galleryItem('Travel Journal', 'Documentary')}
      </div>
    </div>

    <!-- Simple footer -->
    <div class="wf-comp" data-comp="footer" style="background:#111827;padding:20px 32px;display:flex;justify-content:space-between;align-items:center">
      <div data-comp="wordmark">${H.lw(80, 10, 'Alex Reed')}</div>
      <div class="wf-comp wf-social-icons" data-comp="social-icons">
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
      </div>
    </div>
  </div>`;
}

// ── Magazine / Media ─────────────────────────────────────────────────────────
// parentType: blog — multi-column editorial with sidebar, trending, newsletter
export function magazineLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const articleCard = (title, author, date, cat) => `
    <div class="wf-comp" data-comp="article-card">
      <div class="wf-article-inner">
        <div data-comp="thumbnail">${H.img('100%', 140)}</div>
        <div class="wf-article-content">
          <div data-comp="badge">${H.bdg(cat)}</div>
          ${H.lw(150, 12, title)}
          <div class="wf-article-meta">
            <div data-comp="avatar">${H.avatarEl(22)}</div>
            ${H.lw(60, 7, author)}
            <span style="color:#d1d5db">&middot;</span>
            ${H.lw(50, 7, date)}
          </div>
        </div>
      </div>
    </div>`;

  const trendingItem = (num, title) => `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #e5e7eb">
      <span style="font-size:20px;font-weight:700;color:#e5e7eb;line-height:1">${num}</span>
      <div>${H.lw(140, 10, title)}
        <div style="margin-top:4px">${H.lw(80, 7, '3 min read')}</div>
      </div>
    </div>`;

  return `<div class="wf-page">
    ${sharedNavbar(H, { search: true })}

    <!-- Breadcrumb -->
    <div class="wf-comp wf-breadcrumb" data-comp="breadcrumb">
      ${H.navTxt('Home', 30)}
      <div class="wf-breadcrumb-sep"></div>
      ${H.navTxt('Technology', 60)}
    </div>

    <!-- Featured article hero -->
    <div class="wf-comp wf-featured-post" data-comp="article-featured">
      <div class="wf-featured-content">
        <div data-comp="badge">${H.bdg('Featured')}</div>
        <div data-comp="headline">${H.lw(280, 28, 'The Future of AI in Creative Tools')}</div>
        <div data-comp="subheadline">${H.lw(320, 10, 'How generative models are reshaping the design industry and what it means for professionals.')}</div>
        <div class="wf-author-block">
          <div data-comp="avatar">${H.avatarEl(32)}</div>
          <div class="wf-author-meta">
            ${H.lw(80, 10, 'Emily Zhang')}
            ${H.lw(100, 7, 'Mar 12, 2025 · 8 min')}
          </div>
        </div>
      </div>
      <div class="wf-featured-thumbnail" data-comp="thumbnail">${H.img('100%', 200)}</div>
    </div>

    <!-- Two-column: articles + sidebar -->
    <div style="display:flex;gap:0">
      <!-- Main articles -->
      <div style="flex:1;padding:24px 32px">
        <div class="wf-comp wf-section-header" data-comp="section-header" style="text-align:left;margin-bottom:16px">
          ${H.lw(120, 18, 'Latest Stories')}
        </div>
        <div class="wf-article-grid" style="grid-template-columns:repeat(2,1fr);padding:0">
          ${articleCard('Design Systems at Scale', 'Sarah M.', 'Mar 10', 'Design')}
          ${articleCard('React Server Components', 'Alex K.', 'Mar 9', 'Code')}
          ${articleCard('Accessibility First', 'Priya D.', 'Mar 8', 'UX')}
          ${articleCard('Building in Public', 'Jake T.', 'Mar 7', 'Startup')}
        </div>
        <!-- Pagination -->
        <div class="wf-comp wf-pagination" data-comp="pagination" style="padding:16px 0">
          <div class="wf-page-btn"><div class="wl wl-8" style="width:8px"></div></div>
          <div class="wf-page-btn active"><div class="wl wl-8" style="width:6px;background:#fff"></div></div>
          <div class="wf-page-btn"><div class="wl wl-8" style="width:6px"></div></div>
          <div class="wf-page-btn"><div class="wl wl-8" style="width:6px"></div></div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="wf-comp" data-comp="sidebar-nav" style="width:240px;border-left:1px solid #e5e7eb;padding:24px 16px;background:#f9fafb">
        <div style="margin-bottom:20px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:10px">Trending</div>
          ${trendingItem('01', 'Why Figma Acquired AI Startup')}
          ${trendingItem('02', 'CSS Container Queries Ship')}
          ${trendingItem('03', 'State of JavaScript 2025')}
          ${trendingItem('04', 'New React Compiler Drops')}
        </div>
        <!-- Newsletter signup -->
        <div style="padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">${H.lw(120, 12, 'Newsletter')}</div>
          ${H.lw(160, 8, 'Get the best stories in your inbox.')}
          <div class="wf-comp" data-comp="input-field" style="margin-top:8px">
            <div class="wf-input-box" style="height:32px"></div>
          </div>
          <div data-comp="cta-button" style="margin-top:8px">${H.fbtn('Subscribe', '100%', 32)}</div>
        </div>
      </div>
    </div>

    ${sharedFooter(H)}
  </div>`;
}

// ── Documentation Site ───────────────────────────────────────────────────────
// parentType: blog — sidebar docs navigation, code blocks, TOC
export function docsLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const sidebarItem = (text, active = false, indent = false) => `
    <div class="wf-sidebar-nav-item${active ? ' active' : ''}" style="${indent ? 'padding-left:28px' : ''}">
      <div class="wf-sidebar-dot${active ? ' active' : ''}"></div>
      ${H.lw(indent ? 70 : 90, 8, text)}
    </div>`;

  const codeBlock = (lines) => `
    <div style="background:#1e293b;border-radius:8px;padding:14px 16px;margin:12px 0;font-family:monospace;font-size:12px;color:#94a3b8;line-height:1.7">
      ${lines.map(l => `<div>${l}</div>`).join('')}
    </div>`;

  return `<div class="wf-page">
    <!-- Docs navbar with search -->
    <nav class="wf-comp wf-navbar" data-comp="navbar" style="border-bottom:1px solid #e5e7eb">
      <div class="wf-comp wf-logo-group" data-comp="logo">
        <div class="wf-comp wf-logomark-box" data-comp="logomark"></div>
        <div class="wf-comp" data-comp="wordmark">${H.lw(50, 12, 'Docs')}</div>
      </div>
      <div class="wf-comp" data-comp="search-bar" style="flex:1;max-width:320px">
        <div class="wf-search-bar">
          <div class="wf-search-icon"><div class="wf-search-dot"></div></div>
          <div class="wf-search-inner">${H.navTxt('Search documentation...', 140)}</div>
        </div>
      </div>
      <div class="wf-nav-right">
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('API', 22)}</div>
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Guides', 36)}</div>
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Blog', 26)}</div>
      </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="wf-comp wf-breadcrumb" data-comp="breadcrumb">
      ${H.navTxt('Docs', 24)}
      <div class="wf-breadcrumb-sep"></div>
      ${H.navTxt('Getting Started', 80)}
      <div class="wf-breadcrumb-sep"></div>
      ${H.navTxt('Installation', 60)}
    </div>

    <div class="wf-layout-with-sidebar">
      <!-- Sidebar navigation -->
      <div class="wf-comp wf-sidebar-nav" data-comp="sidebar-nav" style="width:200px;min-height:500px">
        <div style="padding:0 0 8px;border-bottom:1px solid #e5e7eb">
          <div style="padding:4px 14px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase">Getting Started</div>
          ${sidebarItem('Introduction')}
          ${sidebarItem('Installation', true)}
          ${sidebarItem('Quick Start')}
        </div>
        <div style="padding:8px 0;border-bottom:1px solid #e5e7eb">
          <div style="padding:4px 14px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase">Core Concepts</div>
          ${sidebarItem('Configuration')}
          ${sidebarItem('Components')}
          ${sidebarItem('Routing')}
          ${sidebarItem('Data Fetching')}
        </div>
        <div style="padding:8px 0">
          <div style="padding:4px 14px;font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase">API Reference</div>
          ${sidebarItem('Client API')}
          ${sidebarItem('Server API')}
          ${sidebarItem('CLI')}
        </div>
      </div>

      <!-- Main content -->
      <div style="flex:1;padding:28px 32px;max-width:680px">
        <div class="wf-comp" data-comp="section-header">
          <div data-comp="headline">${H.lw(180, 28, 'Installation')}</div>
          <div style="margin-top:8px" data-comp="subheadline">${H.lw(340, 10, 'Get up and running with Acme in under 5 minutes.')}</div>
        </div>

        <!-- Tab bar -->
        <div class="wf-comp" data-comp="tab-bar" style="margin-top:20px">
          <div class="wf-toggle">
            <div class="wf-toggle-opt on"><div class="wf-toggle-inner" style="width:30px">${H.navTxt('npm', 0)}</div></div>
            <div class="wf-toggle-opt"><div class="wf-toggle-inner" style="width:26px">${H.navTxt('yarn', 0)}</div></div>
            <div class="wf-toggle-opt"><div class="wf-toggle-inner" style="width:30px">${H.navTxt('pnpm', 0)}</div></div>
          </div>
        </div>

        ${codeBlock(['npm install @acme/core', '', '# or with TypeScript support', 'npm install @acme/core @acme/types'])}

        <div class="wf-comp" data-comp="divider" style="margin:20px 0"><div class="wf-divider"></div></div>

        <div style="margin-top:16px">
          ${H.lw(160, 18, 'Basic Setup')}
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px">
            ${H.lw(400, 8, 'Create a new configuration file in the root of your project:')}
          </div>
        </div>

        ${codeBlock(['// acme.config.js', 'export default {', '  theme: "default",', '  plugins: [],', '}'])}

        <div style="margin-top:20px">
          ${H.lw(160, 18, 'Next Steps')}
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px">
            ${H.lw(360, 8, 'Now that you have Acme installed, check out the Quick Start guide.')}
          </div>
        </div>

        <!-- Prev / Next navigation -->
        <div class="wf-comp" data-comp="pagination" style="display:flex;justify-content:space-between;margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb">
          <div style="display:flex;flex-direction:column;gap:4px">
            <div style="font-size:11px;color:#9ca3af">Previous</div>
            ${H.lw(90, 10, 'Introduction')}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;text-align:right">
            <div style="font-size:11px;color:#9ca3af">Next</div>
            ${H.lw(80, 10, 'Quick Start')}
          </div>
        </div>
      </div>

      <!-- Table of contents (right sidebar) -->
      <div style="width:160px;padding:28px 12px;border-left:1px solid #f3f4f6;flex-shrink:0">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:10px">On this page</div>
        <div style="display:flex;flex-direction:column;gap:6px;border-left:2px solid #e5e7eb;padding-left:10px">
          <div style="font-size:12px;color:#7c3aed;font-weight:500;border-left:2px solid #7c3aed;margin-left:-12px;padding-left:10px">${H.navTxt('Installation', 60)}</div>
          ${H.navTxt('Basic Setup', 50)}
          ${H.navTxt('Next Steps', 50)}
        </div>
      </div>
    </div>

    ${sharedFooter(H)}
  </div>`;
}

// ── Healthcare ───────────────────────────────────────────────────────────────
// parentType: corporate — Zocdoc/One Medical patient-focused, search-first design
export function healthcareLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const doctorCard = (name, specialty, rating) => `
    <div class="wf-comp" data-comp="team-card" style="flex:0 0 auto;width:180px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
      <div data-comp="avatar">${H.avatarEl(56)}</div>
      <div style="margin-top:8px">${H.lw(120, 12, name)}</div>
      <div style="margin-top:3px">${H.lw(90, 8, specialty)}</div>
      <div style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px">
        <div class="wf-stars" style="display:flex;gap:2px">${'<div class="wf-star"></div>'.repeat(5)}</div>
        <span style="font-size:11px;color:#6b7280;font-family:-apple-system,sans-serif">${opts.dummy ? rating : ''}</span>
      </div>
      <div data-comp="cta-button" style="margin-top:10px">${H.fbtn('Book', 120, 32)}</div>
    </div>`;

  return `<div class="wf-page">
    <!-- Navbar -->
    <nav class="wf-comp wf-navbar" data-comp="navbar" style="border-bottom:1px solid #e5e7eb">
      <div class="wf-comp wf-logo-group" data-comp="logo">
        <div class="wf-comp wf-logomark-box" data-comp="logomark"></div>
        <div class="wf-comp" data-comp="wordmark">${H.lw(80, 14, 'MediCare')}</div>
      </div>
      <div class="wf-nav-center">
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Find Care', 50)}</div>
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Locations', 50)}</div>
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Insurance', 50)}</div>
        <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('About', 32)}</div>
      </div>
      <div class="wf-nav-right">
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Patient Login', 110, 32)}</div>
        <div class="wf-comp wf-ham" data-comp="hamburger">
          <div class="wf-ham-line"></div><div class="wf-ham-line"></div><div class="wf-ham-line"></div>
        </div>
      </div>
    </nav>

    <!-- Search-first hero -->
    <div class="wf-comp" data-comp="search-hero" style="background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%);padding:48px 32px;text-align:center;border-bottom:1px solid #e5e7eb">
      <div data-comp="headline">${H.lw(340, 28, 'Find the right doctor for you')}</div>
      <div style="margin-top:8px" data-comp="subheadline">${H.lw(300, 10, 'Book appointments with top-rated doctors near you. Same-day visits available.')}</div>

      <!-- Large search bar -->
      <div class="wf-comp" data-comp="search-bar" style="max-width:500px;margin:20px auto 0">
        <div class="wf-search-bar" style="height:48px;border-radius:24px;padding:0 20px;border:2px solid #d1d5db;background:#fff">
          <div class="wf-search-icon"><div class="wf-search-dot"></div></div>
          <div class="wf-search-inner">${H.navTxt('Find a doctor, specialty, or condition...', 260)}</div>
        </div>
      </div>

      <!-- Specialty quick-filter pills -->
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
        ${['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology'].map(s => `
          <span data-comp="badge">${H.bdg(s)}</span>`).join('')}
      </div>
    </div>

    <!-- Horizontal doctor cards carousel -->
    <div class="wf-section" style="padding:28px 0">
      <div class="wf-comp wf-section-header" data-comp="section-header" style="padding:0 32px;margin-bottom:16px">
        ${H.lw(200, 18, 'Top-Rated Doctors Near You')}
      </div>
      <div class="wf-comp" data-comp="carousel" style="overflow-x:auto;display:flex;gap:16px;padding:4px 32px 16px">
        ${doctorCard('Dr. Sarah Kim', 'Cardiologist', '4.9')}
        ${doctorCard('Dr. James Obi', 'Primary Care', '4.8')}
        ${doctorCard('Dr. Lisa Patel', 'Dermatologist', '4.9')}
        ${doctorCard('Dr. Mike Torres', 'Neurologist', '4.7')}
        ${doctorCard('Dr. Aisha Rao', 'Pediatrician', '4.9')}
      </div>
    </div>

    <!-- Insurance logos grid -->
    <div class="wf-comp wf-logo-bar" data-comp="logo-bar" style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">
      <div class="wf-logo-bar-label">${H.lw(130, 8, 'We accept insurance from')}</div>
      <div class="wf-logo-bar-items">
        ${[80, 90, 70, 85, 75, 80].map(w => `<div class="wf-brand-logo" style="width:${w}px"></div>`).join('')}
      </div>
    </div>

    <!-- Map placeholder -->
    <div class="wf-section" style="padding:28px 32px">
      <div class="wf-comp wf-section-header" data-comp="section-header" style="margin-bottom:16px">
        ${H.lw(160, 18, 'Locations Near You')}
      </div>
      <div class="wf-comp" data-comp="map-placeholder" style="background:#e5e7eb;border-radius:10px;height:200px;display:flex;align-items:center;justify-content:center;position:relative;border:1px solid #d1d5db">
        <div style="text-align:center">
          <div style="width:28px;height:28px;margin:0 auto 8px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg)"></div>
          ${H.lw(140, 10, '12 locations in your area')}
        </div>
      </div>
    </div>

    <!-- Patient portal login card -->
    <div class="wf-section" style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:32px">
      <div style="display:flex;gap:32px;align-items:flex-start;max-width:700px;margin:0 auto">
        <!-- Stats -->
        <div style="flex:1">
          <div class="wf-comp wf-section-header" data-comp="section-header" style="margin-bottom:16px">
            ${H.lw(180, 18, 'Trusted by Patients')}
          </div>
          <div class="wf-comp" data-comp="stat-block" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            ${[['50K+','Patients served'],['200+','Specialists'],['4.9','Avg. rating'],['15','Locations']]
              .map(([num,label]) => `<div style="text-align:center">${H.lw(60, 22, num)}<div style="margin-top:4px">${H.lw(80, 8, label)}</div></div>`).join('')}
          </div>
        </div>

        <!-- Login card -->
        <div class="wf-comp" data-comp="form" style="width:260px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px">
          <div style="margin-bottom:14px">${H.lw(130, 14, 'Patient Portal')}</div>
          <div class="wf-form-field" style="margin-bottom:10px">
            <div class="wf-label">${H.lw(40, 8, 'Email')}</div>
            <div class="wf-comp wf-input-box" data-comp="input-field" style="height:36px"></div>
          </div>
          <div class="wf-form-field" style="margin-bottom:14px">
            <div class="wf-label">${H.lw(56, 8, 'Password')}</div>
            <div class="wf-comp wf-input-box" data-comp="input-field" style="height:36px"></div>
          </div>
          <div data-comp="cta-button">${H.fbtn('Sign In', '100%', 38)}</div>
          <div style="margin-top:8px;text-align:center">${H.lw(120, 8, 'Forgot password?')}</div>
        </div>
      </div>
    </div>

    <!-- Trust banner -->
    <div style="background:#eff6ff;padding:12px 32px;display:flex;align-items:center;justify-content:center;gap:20px;font-size:12px;color:#1d4ed8;border-top:1px solid #bfdbfe;border-bottom:1px solid #bfdbfe;flex-wrap:wrap">
      <div data-comp="badge">${H.bdg('HIPAA Compliant')}</div>
      <span style="color:#93c5fd">&bull;</span>
      <div data-comp="badge">${H.bdg('SOC 2 Certified')}</div>
      <span style="color:#93c5fd">&bull;</span>
      <div data-comp="badge">${H.bdg('24/7 Telehealth')}</div>
      <span style="color:#93c5fd">&bull;</span>
      <div data-comp="badge">${H.bdg('Same-Day Visits')}</div>
    </div>

    <!-- Minimal footer -->
    <div class="wf-comp" data-comp="footer" style="background:#111827;padding:20px 32px;display:flex;justify-content:space-between;align-items:center">
      <div data-comp="wordmark">${H.lw(80, 10, '© 2025 MediCare')}</div>
      <div class="wf-comp wf-social-icons" data-comp="social-icons">
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
        <div class="wf-social-icon"></div>
      </div>
    </div>
  </div>`;
}
