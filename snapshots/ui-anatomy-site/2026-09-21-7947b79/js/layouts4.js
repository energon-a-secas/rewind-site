// Industry layouts: Fortune 500, SaaS, Fintech, Gaming
import { makeHelpers, sharedNavbar, sharedFooter, featureGrid } from './layouts.js';

// ── Fortune 500 (Salesforce-inspired) ────────────────────────────────────────
export function fortuneLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  return `<div class="wf-page">
  <!-- Mega-menu navbar -->
  <nav class="wf-comp wf-navbar" data-comp="navbar" style="position:relative">
    <div class="wf-comp wf-logo-group" data-comp="logo">
      <div class="wf-comp wf-logomark-box" data-comp="logomark"></div>
      <div class="wf-comp" data-comp="wordmark">${H.lw(80, 14, 'Apex Corp')}</div>
    </div>
    <div class="wf-nav-center">
      <div class="wf-comp wf-nav-item" data-comp="nav-link" style="position:relative">
        ${H.navTxt('Products ▾', 60)}
        <!-- Mega-menu panel -->
        <div class="wf-comp" data-comp="mega-menu" style="position:absolute;top:100%;left:-80px;width:480px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;box-shadow:0 8px 30px rgba(0,0,0,.12);display:grid;grid-template-columns:repeat(3,1fr);gap:16px;z-index:10;margin-top:8px">
          ${[['Sales Cloud','CRM & pipeline management'],['Service Cloud','Support & ticketing'],['Marketing Cloud','Campaigns & analytics'],['Commerce Cloud','Storefronts & checkout'],['Data Cloud','Unified customer data'],['AI Cloud','Predictions & insights']].map(([t,d]) => `
          <div style="display:flex;flex-direction:column;gap:4px">
            ${H.iconSq(24)}
            ${H.lw(90, 10, t)}
            ${H.lw(120, 7, d)}
          </div>`).join('')}
        </div>
      </div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Solutions', 50)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Resources', 54)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Pricing', 42)}</div>
    </div>
    <div class="wf-nav-right">
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Login', 34)}</div>
      <div class="wf-comp" data-comp="cta-button">${H.fbtn('Contact Sales', 110, 32)}</div>
    </div>
  </nav>

  <!-- Breadcrumb -->
  <div class="wf-comp wf-breadcrumb" data-comp="breadcrumb">
    ${H.navTxt('Home', 30)}<div class="wf-breadcrumb-sep"></div>
    ${H.navTxt('Platform', 46)}<div class="wf-breadcrumb-sep"></div>
    ${H.navTxt('Overview', 50)}
  </div>

  <!-- Multi-CTA hero with video play button -->
  <div class="wf-comp wf-hero" data-comp="hero-section" style="position:relative;background:linear-gradient(135deg,#f0f4ff 0%,#e0e7ff 100%);border-bottom:1px solid #c7d2fe">
    <div class="wf-hero-content">
      <div class="wf-comp" data-comp="badge">${H.bdg('#1 CRM Platform')}</div>
      <div class="wf-comp" data-comp="headline" style="display:flex;flex-direction:column;gap:8px">
        ${H.lw(260, 32, 'The enterprise platform')}
        ${H.lw(220, 32, 'that scales with you')}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="display:flex;flex-direction:column;gap:6px">
        ${H.lw(300, 10, 'Trusted by 150,000+ companies worldwide.')}
        ${H.lw(280, 10, 'AI-powered CRM, analytics, and automation.')}
      </div>
      <div class="wf-hero-btns">
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Start free trial', 140, 42)}</div>
        <div class="wf-comp" data-comp="ghost-button">${H.obtn('Watch demo', 120, 42)}</div>
      </div>
    </div>
    <div class="wf-comp wf-hero-image" data-comp="hero-image" style="position:relative">
      ${H.img(280, 190)}
      <div class="wf-comp" data-comp="video-background" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.15);cursor:pointer">
        <div style="width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:18px solid #1f2937;margin-left:4px"></div>
      </div>
    </div>
  </div>

  <!-- Tabbed case studies -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(200, 20, 'Customer success stories')}
        ${H.lw(260, 10, 'See how industry leaders drive results with Apex.')}
      </div>
    </div>
    <div class="wf-comp" data-comp="tab-bar" style="margin-bottom:20px">
      <div class="wf-toggle">
        <div class="wf-toggle-opt on"><div class="wf-toggle-inner" style="width:70px">${H.navTxt('Retail', 0)}</div></div>
        <div class="wf-toggle-opt"><div class="wf-toggle-inner" style="width:70px">${H.navTxt('Finance', 0)}</div></div>
        <div class="wf-toggle-opt"><div class="wf-toggle-inner" style="width:90px">${H.navTxt('Healthcare', 0)}</div></div>
      </div>
    </div>
    <div class="wf-comp" data-comp="testimonial-card">
      <div class="wf-testimonial-inner" style="display:flex;gap:24px;align-items:center;padding:24px">
        ${H.img(160, 120)}
        <div style="flex:1;display:flex;flex-direction:column;gap:10px">
          ${H.lw(120, 14, 'MegaMart Inc.')}
          <div class="wf-quote-lines" style="display:flex;flex-direction:column;gap:5px">
            ${H.lw(300, 8, '"Apex helped us unify 50,000 retail locations into a single dashboard."')}
            ${H.lw(260, 8, '')}
          </div>
          <div style="display:flex;gap:24px">
            <div class="wf-comp wf-stat-inner" data-comp="stat-block" style="text-align:center">
              ${H.lw(50, 22, '340%')}${H.lw(60, 7, 'ROI increase')}
            </div>
            <div class="wf-stat-inner" style="text-align:center">
              ${H.lw(50, 22, '60%')}${H.lw(80, 7, 'Faster onboarding')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- By the numbers -->
  <div class="wf-stats-bar" style="background:#1e293b;padding:32px 0">
    ${[['150K+','Companies worldwide'],['$4.2T','Revenue managed'],['99.99%','Platform uptime'],['#1','CRM for 11 years']].map(([n,l]) => `
    <div class="wf-comp wf-stat-inner" data-comp="stat-block" style="color:#e2e8f0">
      ${H.lw(80, 32, n)}${H.lw(100, 8, l)}
    </div>`).join('')}
  </div>

  <!-- Features -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(180, 20, 'Platform capabilities')}
      </div>
    </div>
    ${featureGrid(H, 3, [
      ['AI-Powered Insights','Predictive analytics and recommendations built into every workflow.'],
      ['Unified Data Platform','Connect every customer touchpoint in a single source of truth.'],
      ['Enterprise Security','SOC 2, ISO 27001, and FedRAMP authorized infrastructure.']
    ])}
  </div>

  <!-- Compliance badges -->
  <div class="wf-section" style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      ${H.lw(160, 16, 'Compliance & Trust')}
    </div>
    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap">
      ${['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA', 'FedRAMP'].map(t => `
      <div class="wf-comp" data-comp="badge">${H.bdg(t)}</div>`).join('')}
    </div>
  </div>

  ${sharedFooter(H)}
</div>`;
}

// ── SaaS (Notion/Airtable-inspired) ─────────────────────────────────────────
export function saasLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  return `<div class="wf-page">
  ${sharedNavbar(H, { signup: true })}

  <!-- Centered hero with email input -->
  <div class="wf-comp" data-comp="hero-section" style="padding:56px 32px;text-align:center;background:#fafafa;border-bottom:1px solid #e5e7eb">
    <div style="max-width:540px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:14px">
      <div class="wf-comp" data-comp="badge">${H.bdg('New: AI Autofill')}</div>
      <div class="wf-comp" data-comp="headline" style="display:flex;flex-direction:column;gap:8px;align-items:center">
        ${H.lw(340, 36, 'Your workspace, reimagined')}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="display:flex;flex-direction:column;gap:6px;align-items:center">
        ${H.lw(320, 10, 'Docs, databases, and workflows in one place.')}
        ${H.lw(280, 10, 'Replace 5 tools with one. Free for individuals.')}
      </div>
      <div style="display:flex;gap:8px;margin-top:6px;width:100%;max-width:400px">
        <div class="wf-comp" data-comp="input-field" style="flex:1">
          <div class="wf-input-box" style="height:42px;border-radius:8px"></div>
        </div>
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Get started free', 140, 42)}</div>
      </div>
    </div>
  </div>

  <!-- Browser chrome demo -->
  <div class="wf-section">
    <div class="wf-comp" data-comp="browser-chrome" style="max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <div style="background:#f3f4f6;padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #e5e7eb">
        <div style="display:flex;gap:5px">
          <div style="width:10px;height:10px;border-radius:50%;background:#f87171"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#fbbf24"></div>
          <div style="width:10px;height:10px;border-radius:50%;background:#34d399"></div>
        </div>
        <div style="flex:1;background:#fff;border:1px solid #d1d5db;border-radius:4px;padding:4px 10px;font-size:11px;color:#9ca3af;font-family:monospace">
          app.workspace.io/dashboard
        </div>
      </div>
      <div style="padding:0">${H.img('100%', 280)}</div>
    </div>
  </div>

  <!-- Logo bar -->
  <div class="wf-comp wf-logo-bar" data-comp="logo-bar">
    <div class="wf-logo-bar-label">${H.lw(140, 8, 'Used by teams at')}</div>
    <div class="wf-logo-bar-items">
      ${[60,72,54,80,64,58,70,66].map(w => `<div class="wf-brand-logo" style="width:${w}px"></div>`).join('')}
    </div>
  </div>

  <!-- Feature comparison table -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(200, 20, 'Compare plans')}
        ${H.lw(260, 10, 'Find the perfect plan for your team.')}
      </div>
    </div>
    <div class="wf-comp" data-comp="comparison-table" style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:-apple-system,sans-serif">
        <thead>
          <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#374151">Feature</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#374151">Starter</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#7c3aed">Pro</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#374151">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          ${[['Workspaces','1','Unlimited','Unlimited'],['Members','5','50','Unlimited'],['Storage','2 GB','100 GB','Custom'],['API Access','-','✓','✓'],['SSO / SAML','-','-','✓'],['Priority Support','-','✓','✓']].map(([f,...vals]) => `
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:10px 16px;color:#6b7280">${f}</td>
            ${vals.map(v => `<td style="padding:10px 16px;text-align:center;color:${v === '-' ? '#d1d5db' : v === '✓' ? '#059669' : '#374151'}">${v}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Social proof ticker -->
  <div class="wf-comp" data-comp="news-ticker" style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:16px 32px;overflow:hidden">
    <div style="display:flex;gap:48px;align-items:center;white-space:nowrap;animation:none">
      ${['"Replaced 5 tools overnight." (Sarah K.)','"Our team productivity doubled." (Dev Team at Bloom)','"Best workspace app of 2025." (TechRadar)','"Finally, one tool to rule them all." (James P.)'].map(q => `
      <div style="display:flex;align-items:center;gap:8px">
        ${H.avatarEl(24)}
        <span style="font-size:13px;color:#6b7280;font-style:italic;font-family:-apple-system,sans-serif">${q}</span>
      </div>`).join('')}
    </div>
  </div>

  <!-- Pricing -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(140, 20, 'Simple pricing')}${H.lw(220, 10, 'Free forever for individuals.')}
      </div>
    </div>
    <div class="wf-pricing-grid">
      ${[{n:'Free',p:'$0',f:['1 workspace','5 members','2 GB storage'],b:'obtn'},
         {n:'Pro',p:'$12/mo',f:['Unlimited workspaces','50 members','100 GB storage','API access'],b:'fbtn',pop:true},
         {n:'Enterprise',p:'Custom',f:['Unlimited everything','SSO & SAML','Priority support','Custom contracts'],b:'obtn'}].map(({n,p,f,b,pop}) => `
      <div class="wf-comp" data-comp="pricing-card"><div class="wf-pricing-inner${pop?' featured':''}">
        ${pop?'<div class="wf-popular-badge">Most popular</div>':''}
        ${H.lw(60,12,n)}<div class="wf-price-val">${H.lw(80,26,p)}</div>
        <div class="wf-feature-list">${f.map(fi=>`<div class="wf-feature-list-item"><div class="wf-check"></div>${H.lw(110,8,fi)}</div>`).join('')}</div>
        ${b==='fbtn'?H.fbtn('Get started','100%',34):H.obtn('Get started','100%',34)}
      </div></div>`).join('')}
    </div>
  </div>

  ${sharedFooter(H)}
</div>`;
}

// ── Fintech (Stripe/Wise-inspired) ──────────────────────────────────────────
export function fintechLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const codeBlock = (lines) => `
    <div style="background:#0f172a;border-radius:8px;padding:14px 16px;font-family:monospace;font-size:11px;color:#94a3b8;line-height:1.8;overflow-x:auto">
      ${lines.map(l => `<div>${l}</div>`).join('')}
    </div>`;

  return `<div class="wf-page">
  ${sharedNavbar(H)}

  <!-- Split hero with phone mockup -->
  <div class="wf-comp wf-hero" data-comp="hero-section" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#e2e8f0;border:none">
    <div class="wf-hero-content">
      <div class="wf-comp" data-comp="badge">${H.bdg('Zero hidden fees')}</div>
      <div class="wf-comp" data-comp="headline" style="display:flex;flex-direction:column;gap:8px">
        ${H.lw(240, 32, 'Money without')}
        ${H.lw(200, 32, 'borders')}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="display:flex;flex-direction:column;gap:6px">
        ${H.lw(280, 10, 'Send, spend, and receive across 80+ countries.')}
        ${H.lw(240, 10, 'Real exchange rates. No markups. No surprises.')}
      </div>
      <div class="wf-hero-btns">
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Open an account', 140, 42)}</div>
      </div>
    </div>
    <!-- Phone mockup -->
    <div class="wf-comp" data-comp="phone-mockup" style="width:200px;min-height:360px;border:3px solid #374151;border-radius:28px;background:#1e293b;padding:12px 8px;position:relative;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.3)">
      <div style="width:60px;height:6px;background:#374151;border-radius:3px;margin:0 auto 10px"></div>
      ${H.img('100%', 290)}
      <div style="width:40px;height:5px;background:#374151;border-radius:3px;margin:10px auto 0"></div>
    </div>
  </div>

  <!-- Stats -->
  <div class="wf-stats-bar">
    ${[['$70B+','Transferred annually'],['10M+','Customers'],['80+','Countries'],['6x','Cheaper than banks']].map(([n,l]) => `
    <div class="wf-comp wf-stat-inner" data-comp="stat-block">${H.lw(60, 28, n)}${H.lw(100, 8, l)}</div>`).join('')}
  </div>

  <!-- Fees comparison table -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(200, 20, 'Compare our fees')}
        ${H.lw(280, 10, 'See how much you save on every transfer.')}
      </div>
    </div>
    <div class="wf-comp" data-comp="comparison-table" style="max-width:520px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:-apple-system,sans-serif">
        <thead>
          <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#374151">Transfer type</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#059669">SwiftPay</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#374151">Banks</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#374151">PayPal</th>
          </tr>
        </thead>
        <tbody>
          ${[['USD → EUR','0.35%','3.5%','4.0%'],['USD → GBP','0.40%','3.8%','4.5%'],['EUR → USD','0.35%','3.2%','3.9%'],['International wire','$0.50','$25-50','$5.00']].map(([t,...vals]) => `
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:10px 16px;color:#6b7280">${t}</td>
            <td style="padding:10px 16px;text-align:center;color:#059669;font-weight:600">${vals[0]}</td>
            <td style="padding:10px 16px;text-align:center;color:#9ca3af">${vals[1]}</td>
            <td style="padding:10px 16px;text-align:center;color:#9ca3af">${vals[2]}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Security section -->
  <div class="wf-section" style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(180, 20, 'Bank-grade security')}
        ${H.lw(280, 10, 'Your money is protected by enterprise-level encryption.')}
      </div>
    </div>
    ${featureGrid(H, 3, [
      ['256-bit Encryption','All data encrypted in transit and at rest with AES-256.'],
      ['Regulated & Licensed','Authorized by financial regulators in every market we operate.'],
      ['Two-Factor Auth','Biometric and hardware key support for every account.']
    ])}
    <div style="display:flex;justify-content:center;gap:14px;margin-top:20px;flex-wrap:wrap">
      ${['PCI DSS Level 1','SOC 2','FCA Regulated','FDIC Insured'].map(t => `
      <div class="wf-comp" data-comp="badge">${H.bdg(t)}</div>`).join('')}
    </div>
  </div>

  <!-- Currency converter widget -->
  <div class="wf-section">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(180, 20, 'Convert instantly')}
      </div>
    </div>
    <div class="wf-comp" data-comp="form" style="max-width:400px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.04)">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <div class="wf-label">${H.lw(40, 8, 'Amount')}</div>
          <div class="wf-comp wf-input-box" data-comp="input-field" style="height:42px;margin-top:4px"></div>
        </div>
        <div style="display:flex;gap:12px">
          <div style="flex:1">
            <div class="wf-label">${H.lw(30, 8, 'From')}</div>
            <div class="wf-comp" data-comp="select-field" style="margin-top:4px;height:40px;border:1px solid #d1d5db;border-radius:6px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;background:#fff">
              ${H.navTxt('USD ▾', 40)}
            </div>
          </div>
          <div style="flex:1">
            <div class="wf-label">${H.lw(20, 8, 'To')}</div>
            <div class="wf-comp" data-comp="select-field" style="margin-top:4px;height:40px;border:1px solid #d1d5db;border-radius:6px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;background:#fff">
              ${H.navTxt('EUR ▾', 40)}
            </div>
          </div>
        </div>
        <div style="text-align:center;padding:8px 0;color:#059669;font-size:13px;font-weight:600;font-family:-apple-system,sans-serif">
          1 USD = 0.92 EUR
        </div>
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Convert now', '100%', 42)}</div>
      </div>
    </div>
  </div>

  <!-- API docs preview -->
  <div class="wf-section" style="background:#0f172a;color:#e2e8f0">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(160, 20, 'Developer-first API')}
        ${H.lw(260, 10, 'Integrate payments in minutes, not weeks.')}
      </div>
    </div>
    ${codeBlock([
      '<span style="color:#7c3aed">POST</span> /v1/transfers',
      '',
      '{',
      '  <span style="color:#34d399">"amount"</span>: 1000,',
      '  <span style="color:#34d399">"currency"</span>: <span style="color:#fbbf24">"USD"</span>,',
      '  <span style="color:#34d399">"recipient"</span>: <span style="color:#fbbf24">"acct_abc123"</span>,',
      '  <span style="color:#34d399">"description"</span>: <span style="color:#fbbf24">"Invoice #1042"</span>',
      '}',
      '',
      '<span style="color:#6b7280">// Response: 200 OK</span>',
      '{',
      '  <span style="color:#34d399">"id"</span>: <span style="color:#fbbf24">"tr_x7k9m2"</span>,',
      '  <span style="color:#34d399">"status"</span>: <span style="color:#fbbf24">"completed"</span>,',
      '  <span style="color:#34d399">"fee"</span>: 3.50',
      '}'
    ])}
  </div>

  ${sharedFooter(H)}
</div>`;
}

// ── Gaming (Riot/Epic Games-inspired) ───────────────────────────────────────
export function gamingLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);

  const gameCard = (title, genre, btnLabel) => `
    <div style="min-width:200px;flex-shrink:0;border-radius:12px;overflow:hidden;background:#1e293b;border:1px solid #334155">
      ${H.img(200, 260)}
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:6px">
        ${H.lw(120, 14, title)}
        ${H.lw(80, 7, genre)}
        <div class="wf-comp" data-comp="cta-button" style="margin-top:4px">${H.fbtn(btnLabel, '100%', 32)}</div>
      </div>
    </div>`;

  return `<div class="wf-page" style="background:#0f172a;color:#e2e8f0">
  <!-- Dark minimal navbar -->
  <nav class="wf-comp wf-navbar" data-comp="navbar" style="background:#0f172a;border-bottom:1px solid #1e293b">
    <div class="wf-comp wf-logo-group" data-comp="logo">
      <div class="wf-comp wf-logomark-box" data-comp="logomark" style="background:#7c3aed"></div>
      <div class="wf-comp" data-comp="wordmark">${H.lw(80, 14, 'NEXUS')}</div>
    </div>
    <div class="wf-nav-center">
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Games', 36)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Store', 32)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Esports', 44)}</div>
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Community', 62)}</div>
    </div>
    <div class="wf-nav-right">
      <div class="wf-comp wf-nav-item" data-comp="nav-link">${H.navTxt('Sign in', 40)}</div>
    </div>
  </nav>

  <!-- Full-bleed dark hero with video-bg effect -->
  <div class="wf-comp" data-comp="hero-section" style="position:relative;padding:60px 32px;text-align:center;overflow:hidden">
    <div class="wf-comp" data-comp="video-background" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.3) 0%,rgba(15,23,42,.95) 100%);z-index:1"></div>
    <div class="wf-comp" data-comp="hero-image" style="position:absolute;inset:0;z-index:0">${H.img('100%', 340)}</div>
    <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:14px">
      <div class="wf-comp" data-comp="badge">${H.bdg('Season 8 is live')}</div>
      <div class="wf-comp" data-comp="headline" style="display:flex;flex-direction:column;gap:8px;align-items:center">
        ${H.lw(340, 40, 'ENTER THE ARENA')}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="display:flex;flex-direction:column;gap:6px;align-items:center">
        ${H.lw(300, 10, 'The next chapter begins. New maps, heroes, and ranked rewards.')}
      </div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <div class="wf-comp" data-comp="cta-button">${H.fbtn('Play free now', 140, 46)}</div>
      </div>
    </div>
  </div>

  <!-- Game carousel -->
  <div class="wf-section" style="background:#0f172a;border-top:1px solid #1e293b">
    <div class="wf-comp wf-section-header" data-comp="section-header" style="text-align:left">
      ${H.lw(160, 18, 'Featured Games')}
    </div>
    <div class="wf-comp" data-comp="carousel" style="display:flex;gap:16px;overflow-x:auto;padding-bottom:8px">
      ${gameCard('Valor Strike', 'Tactical Shooter', 'Play now')}
      ${gameCard('Realm Quest', 'Open-World RPG', 'Play now')}
      ${gameCard('Drift Kings', 'Racing', 'Download')}
      ${gameCard('Shadow Ops', 'Stealth Action', 'Pre-order')}
    </div>
  </div>

  <!-- Live stats ticker -->
  <div class="wf-comp wf-stats-bar" data-comp="stat-block" style="background:#1e293b;border-top:1px solid #334155;border-bottom:1px solid #334155;padding:20px 0">
    ${[['2.5M','Players online now'],['50+','Countries'],['98%','Satisfaction'],['24/7','Live support']].map(([n,l]) => `
    <div class="wf-stat-inner" style="color:#e2e8f0">
      ${H.lw(60, 28, n)}${H.lw(90, 8, l)}
    </div>`).join('')}
  </div>

  <!-- Community section -->
  <div class="wf-section" style="background:#0f172a">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(180, 20, 'Join the community')}
        ${H.lw(260, 10, 'Connect with millions of players worldwide.')}
      </div>
    </div>
    <div class="wf-feature-grid" style="grid-template-columns:repeat(3,1fr)">
      ${[['Discord Server','Voice chat, LFG channels, and patch discussions with 500K+ members.'],
         ['Twitch Streams','Watch top players compete live. Weekly dev streams every Friday.'],
         ['Forums & Guides','Strategy guides, tier lists, and community-created content.']].map(([title, desc]) => `
      <div class="wf-comp" data-comp="feature-card">
        <div class="wf-feature-card-inner" style="background:#1e293b;border-color:#334155">
          ${H.iconSq(32)}
          <div class="wf-feature-lines" style="margin-top:8px">
            ${H.lw(100, 12, title)}
            <div style="margin-top:5px;display:flex;flex-direction:column;gap:4px">
              ${H.lw(140, 7, desc)}
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- System requirements table -->
  <div class="wf-section" style="background:#0f172a;border-top:1px solid #1e293b">
    <div class="wf-comp wf-section-header" data-comp="section-header">
      <div style="display:flex;flex-direction:column;gap:7px;align-items:center">
        ${H.lw(180, 20, 'System requirements')}
      </div>
    </div>
    <div class="wf-comp" data-comp="comparison-table" style="max-width:480px;margin:0 auto;border:1px solid #334155;border-radius:8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:-apple-system,sans-serif;color:#94a3b8">
        <thead>
          <tr style="background:#1e293b;border-bottom:1px solid #334155">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#e2e8f0">Spec</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#e2e8f0">Minimum</th>
            <th style="padding:12px 16px;text-align:center;font-weight:600;color:#7c3aed">Recommended</th>
          </tr>
        </thead>
        <tbody>
          ${[['OS','Windows 10','Windows 11'],['CPU','i5-4460','i7-12700K'],['GPU','GTX 1050 Ti','RTX 3070'],['RAM','8 GB','16 GB'],['Storage','30 GB SSD','50 GB NVMe']].map(([s,min,rec]) => `
          <tr style="border-bottom:1px solid #1e293b">
            <td style="padding:10px 16px;color:#cbd5e1">${s}</td>
            <td style="padding:10px 16px;text-align:center">${min}</td>
            <td style="padding:10px 16px;text-align:center;color:#a78bfa">${rec}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Dark footer -->
  <div class="wf-comp wf-footer" data-comp="footer" style="background:#0a0f1a;border-top:1px solid #1e293b">
    <div class="wf-footer-logo">
      <div style="display:flex;gap:7px;align-items:center">
        <div class="wf-comp wf-logomark-box" data-comp="logomark" style="width:22px;height:22px;background:#7c3aed"></div>
        <div class="wf-comp" data-comp="wordmark">${H.lw(56, 10, 'NEXUS')}</div>
      </div>
      ${H.lw(120, 6, 'Play. Compete. Conquer.')}
      <div style="margin-top:4px">${H.lw(100, 6, '\u00A9 2025 Nexus Games Inc.')}</div>
      <div class="wf-comp wf-social-icons" data-comp="social-icons">
        ${[0,1,2,3].map(() => `<div class="wf-social-icon"></div>`).join('')}
      </div>
    </div>
    <div class="wf-footer-cols">
      ${[['Games',['Valor Strike','Realm Quest','Drift Kings','Shadow Ops']],
         ['Community',['Discord','Forums','Streams','Events']],
         ['Support',['Help Center','Bug Report','Status','Contact']]].map(([label, links]) => `
        <div class="wf-footer-col">
          <div class="wf-footer-col-head">${H.lw(60, 8, label)}</div>
          ${links.map(l => `<div class="wf-footer-link">${H.lw(60, 6, l)}</div>`).join('')}
        </div>`).join('')}
    </div>
  </div>
  <div class="wf-footer-bottom" style="background:#0a0f1a;border-top:1px solid #1e293b">
    ${H.lw(200, 7, '\u00A9 2025 Nexus Games, Inc. All rights reserved.')}
  </div>
</div>`;
}
