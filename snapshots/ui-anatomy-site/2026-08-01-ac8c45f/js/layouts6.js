// Game Studio + Figure Portfolio layouts.
import { makeHelpers } from './layouts.js';

// ── Game Studio (parallelogram carousel) ──────────────────────────────────────
export function gamestudioLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);
  const d = opts.dummy;

  const panelBg = (color, active) => active
    ? `background:${color};filter:none;opacity:1`
    : `background:${color};filter:grayscale(1) brightness(0.4);opacity:0.7`;

  const gamePanel = (title, color, active) => `
    <div class="wf-comp wf-gs-panel ${active ? 'wf-gs-active' : ''}" data-comp="${active ? 'parallelogram-carousel' : 'hero-image'}"
         style="${panelBg(color, active)}">
      <div class="wf-gs-panel-inner">
        ${active ? `
          <div class="wf-comp wf-gs-logo" data-comp="game-logo">
            ${d
              ? `<span style="font-size:24px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:2px;text-shadow:0 2px 20px rgba(0,0,0,0.8);font-family:-apple-system,sans-serif">${title}</span>`
              : `<div class="wl wl-28" style="width:160px;background:rgba(255,255,255,0.25)"></div>`
            }
          </div>` : `
          <div class="wf-gs-panel-title">
            ${d
              ? `<span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px;writing-mode:vertical-rl;text-orientation:mixed;font-family:-apple-system,sans-serif">${title}</span>`
              : `<div class="wl wl-8" style="width:8px;height:60px;background:rgba(255,255,255,0.15)"></div>`
            }
          </div>`
        }
      </div>
      ${!active ? `<div class="wf-gs-overlay"></div>` : ''}
    </div>`;

  const fogStrip = (opacity, speed) => `
    <div class="wf-comp wf-gs-fog" data-comp="fog-overlay"
         style="opacity:${opacity};animation:wf-gs-fog-drift ${speed}s linear infinite">
    </div>`;

  return `<div class="wf-page wf-gs-page">

  <!-- Floating nav -->
  <nav class="wf-comp wf-gs-nav" data-comp="floating-nav">
    <div class="wf-comp wf-gs-corp-logo" data-comp="logo">
      ${d
        ? `<span style="font-size:14px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;font-family:-apple-system,sans-serif">NEXUS</span>`
        : `<div class="wl wl-12" style="width:80px;background:rgba(255,255,255,0.3)"></div>`
      }
    </div>
    <div class="wf-gs-nav-links">
      ${['GAMES', 'ABOUT', 'NEWS', 'CAREERS', 'SUPPORT'].map(link => `
        <div class="wf-comp wf-gs-nav-link" data-comp="nav-link">
          ${d
            ? `<span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);letter-spacing:0.5px;font-family:-apple-system,sans-serif">${link}</span>`
            : `<div class="wl wl-8" style="width:${link.length * 7}px;background:rgba(255,255,255,0.2)"></div>`
          }
        </div>`).join('')}
    </div>
  </nav>

  <!-- Parallelogram carousel hero -->
  <div class="wf-comp wf-gs-hero" data-comp="hero-section">
    <div class="wf-comp wf-gs-carousel" data-comp="parallelogram-carousel">
      ${gamePanel('CRIMSON DAWN', 'linear-gradient(135deg, #2d1b00, #5c3d1e)', false)}
      ${gamePanel('SHADOW VALE', 'linear-gradient(135deg, #0a1628, #1a3a5c)', true)}
      ${gamePanel('IRON FORGE', 'linear-gradient(135deg, #1a1a2e, #16213e)', false)}
      ${gamePanel('LOST KINGDOM', 'linear-gradient(135deg, #1a1a00, #3d3d00)', false)}
      ${gamePanel('DARK ABYSS', 'linear-gradient(135deg, #1a0a0a, #3d1a1a)', false)}
    </div>

    <!-- Fog overlay layers -->
    <div class="wf-gs-fog-container">
      ${fogStrip(0.15, 25)}
      ${fogStrip(0.08, 40)}
    </div>
  </div>

  <!-- Bottom press release area -->
  <div class="wf-gs-bottom">
    <div class="wf-gs-news" data-comp="headline">
      ${d
        ? `<div style="display:flex;flex-direction:column;gap:4px">
             <span style="font-size:10px;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif">2025.11.12 &nbsp; PRESS RELEASE</span>
             <span style="font-size:12px;color:rgba(255,255,255,0.7);font-family:-apple-system,sans-serif">"SHADOW VALE" DLC: New expansion announced</span>
           </div>`
        : `<div style="display:flex;flex-direction:column;gap:6px">
             <div class="wl wl-8" style="width:140px;background:rgba(255,255,255,0.1)"></div>
             <div class="wl wl-10" style="width:220px;background:rgba(255,255,255,0.15)"></div>
           </div>`
      }
    </div>
    <div class="wf-comp wf-gs-socials" data-comp="social-icons">
      ${d
        ? ['X', 'FB', 'IG', 'YT'].map(s =>
            `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);font-size:9px;color:rgba(255,255,255,0.5);font-family:-apple-system,sans-serif">${s}</span>`
          ).join('')
        : `<div style="display:flex;gap:8px">${[1,2,3,4].map(() => `<div style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.1)"></div>`).join('')}</div>`
      }
    </div>
  </div>

</div>`;
}

// ── Figure Portfolio (collectible showcase) ─────────────────────────────────
export function figureportfolioLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);
  const d = opts.dummy;

  const counter = (num, suffix, line1, line2) => `
    <div class="wf-comp wf-fp-counter" data-comp="odometer-counter">
      <div class="wf-fp-counter-num">
        ${d
          ? `<span style="font-size:36px;font-weight:800;color:#fff;font-family:-apple-system,sans-serif">${num}</span>
             ${suffix ? `<span style="font-size:20px;font-weight:700;color:rgba(167,139,250,0.8);font-family:-apple-system,sans-serif">${suffix}</span>` : ''}`
          : `<div class="wl wl-28" style="width:40px;background:rgba(255,255,255,0.3)"></div>
             ${suffix ? `<div class="wl wl-18" style="width:16px;background:rgba(167,139,250,0.3);margin-left:4px"></div>` : ''}`
        }
      </div>
      <div class="wf-fp-counter-label">
        ${d
          ? `<span style="font-size:11px;color:rgba(255,255,255,0.5);font-family:-apple-system,sans-serif">${line1}<br>${line2}</span>`
          : `<div class="wl wl-8" style="width:80px;background:rgba(255,255,255,0.1)"></div>
             <div class="wl wl-8" style="width:60px;background:rgba(255,255,255,0.08);margin-top:3px"></div>`
        }
      </div>
    </div>`;

  const featurePill = (text) => `
    <div class="wf-fp-pill">
      ${d
        ? `<span style="font-size:11px;color:rgba(255,255,255,0.6);font-family:-apple-system,sans-serif">${text}</span>`
        : `<div class="wl wl-8" style="width:${text.length * 5}px;background:rgba(255,255,255,0.1)"></div>`
      }
    </div>`;

  const tiltCard = (title, h) => `
    <div class="wf-comp wf-fp-tilt-card" data-comp="tilt-card" style="height:${h}px">
      <div class="wf-comp wf-fp-card-img" data-comp="thumbnail">
        ${d
          ? `<div class="wf-img-box" style="width:100%;height:${h - 50}px;border-radius:8px 8px 0 0"></div>`
          : `<div class="wf-img-box" style="width:100%;height:${h - 50}px;border-radius:8px 8px 0 0"></div>`
        }
      </div>
      <div class="wf-fp-card-info">
        ${d
          ? `<span style="font-size:12px;font-weight:600;color:#fff;font-family:-apple-system,sans-serif">${title}</span>`
          : `<div class="wl wl-10" style="width:${title.length * 6}px;background:rgba(255,255,255,0.2)"></div>`
        }
      </div>
    </div>`;

  const newsCard = (date, title) => `
    <div class="wf-comp wf-fp-news-card" data-comp="article-card">
      <div class="wf-comp" data-comp="thumbnail">
        <div class="wf-img-box" style="width:100%;height:120px;border-radius:8px"></div>
      </div>
      <div style="padding:10px 0">
        ${d
          ? `<span style="font-size:10px;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif">${date}</span>`
          : `<div class="wl wl-8" style="width:80px;background:rgba(255,255,255,0.08)"></div>`
        }
        <div class="wf-comp" data-comp="headline" style="margin-top:6px">
          ${d
            ? `<span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);line-height:1.3;font-family:-apple-system,sans-serif">${title}</span>`
            : `<div class="wl wl-12" style="width:100%;background:rgba(255,255,255,0.15)"></div>
               <div class="wl wl-10" style="width:70%;background:rgba(255,255,255,0.1);margin-top:4px"></div>`
          }
        </div>
      </div>
    </div>`;

  return `<div class="wf-page wf-fp-page">

  <!-- Floating header -->
  <nav class="wf-comp wf-fp-header" data-comp="floating-nav">
    <div class="wf-comp" data-comp="logo">
      ${d
        ? `<span style="font-size:15px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif">ARTISAN</span>`
        : `<div class="wl wl-14" style="width:80px;background:rgba(255,255,255,0.3)"></div>`
      }
    </div>
    <div class="wf-fp-nav-links">
      ${['Products', 'Shop', 'News', 'Reviews', 'Contact'].map(link => `
        <div class="wf-comp wf-fp-nav-link" data-comp="nav-link">
          ${d
            ? `<span style="font-size:12px;color:rgba(255,255,255,0.7);font-family:-apple-system,sans-serif">${link}</span>`
            : `<div class="wl wl-8" style="width:${link.length * 6}px;background:rgba(255,255,255,0.15)"></div>`
          }
        </div>`).join('')}
    </div>
    <div class="wf-comp" data-comp="cta-button">
      ${d
        ? `<button style="padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;background:#7c3aed;color:#fff;border:none;cursor:pointer;font-family:-apple-system,sans-serif">Subscribe</button>`
        : `<div class="wf-filled-btn" style="width:80px;height:32px;border-radius:20px"></div>`
      }
    </div>
  </nav>

  <!-- Hero section: split layout -->
  <div class="wf-comp wf-fp-hero" data-comp="hero-section">
    <div class="wf-fp-hero-right">
      <div class="wf-comp" data-comp="headline">
        ${d
          ? `<h1 style="font-size:42px;font-weight:800;color:#fff;line-height:1.1;margin:0;font-family:-apple-system,sans-serif">HANDCRAFTED<br>PREMIUM<br>COLLECTIBLE <span style="color:#a78bfa">FIGURES</span></h1>`
          : `<div style="display:flex;flex-direction:column;gap:6px">
               <div class="wl wl-28" style="width:220px;background:rgba(255,255,255,0.25)"></div>
               <div class="wl wl-28" style="width:200px;background:rgba(255,255,255,0.25)"></div>
               <div class="wl wl-28" style="width:240px;background:rgba(255,255,255,0.25)"></div>
             </div>`
        }
      </div>
      <div class="wf-comp wf-fp-featured" data-comp="tilt-card">
        <div class="wf-img-box" style="width:200px;height:90px;border-radius:10px"></div>
        ${d
          ? `<span style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:6px;display:block;font-family:-apple-system,sans-serif">New collection available!</span>`
          : `<div class="wl wl-8" style="width:110px;background:rgba(255,255,255,0.1);margin-top:6px"></div>`
        }
      </div>
      <div class="wf-comp wf-fp-scroll-cue" data-comp="scroll-indicator">
        ${d
          ? `<span style="font-size:11px;color:rgba(255,255,255,0.4);display:flex;align-items:center;gap:6px;font-family:-apple-system,sans-serif">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
               Scroll Down
             </span>`
          : `<div style="display:flex;align-items:center;gap:6px">
               <div style="width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,0.15)"></div>
               <div class="wl wl-8" style="width:60px;background:rgba(255,255,255,0.08)"></div>
             </div>`
        }
      </div>
    </div>
    <div class="wf-fp-hero-left">
      ${counter('8', '', 'Years of crafting', 'Experience')}
      ${counter('50', '+', 'Projects', 'Completed')}
      ${featurePill('Premium quality production line')}
      ${featurePill('Worldwide shipping and logistics')}
    </div>
  </div>

  <!-- Portfolio grid section -->
  <div class="wf-fp-section" style="background:#0F0715">
    <div class="wf-comp wf-fp-section-header" data-comp="section-header">
      ${d
        ? `<span style="font-size:20px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif">Our Collection</span>`
        : `<div class="wl wl-20" style="width:120px;background:rgba(255,255,255,0.2)"></div>`
      }
    </div>
    <div class="wf-comp wf-fp-masonry" data-comp="masonry-grid">
      ${tiltCard('Phoenix Guardian', 220)}
      ${tiltCard('Crystal Mage', 180)}
      ${tiltCard('Storm Rider', 240)}
      ${tiltCard('Shadow Dancer', 200)}
      ${tiltCard('Iron Sentinel', 190)}
      ${tiltCard('Frost Warden', 210)}
    </div>
  </div>

  <!-- News section -->
  <div class="wf-fp-section" style="background:#0F0715">
    <div class="wf-comp wf-fp-section-header" data-comp="section-header">
      ${d
        ? `<span style="font-size:20px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif">Latest News</span>`
        : `<div class="wl wl-20" style="width:120px;background:rgba(255,255,255,0.2)"></div>`
      }
    </div>
    <div class="wf-fp-news-grid">
      ${newsCard('January 7, 2026', 'Color sample for Phoenix Guardian confirmed')}
      ${newsCard('December 30, 2025', 'Gray prototype of Storm Rider revealed')}
      ${newsCard('December 29, 2025', 'Shadow Dancer variant approved')}
    </div>
  </div>

  <!-- Testimonials section -->
  <div class="wf-fp-section" style="background:#050709">
    <div class="wf-comp wf-fp-section-header" data-comp="section-header">
      ${d
        ? `<span style="font-size:20px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif">Testimonials</span>`
        : `<div class="wl wl-20" style="width:120px;background:rgba(255,255,255,0.2)"></div>`
      }
    </div>
    <div class="wf-fp-testimonials">
      <div class="wf-comp wf-fp-testimonial" data-comp="testimonial-card">
        <div class="wf-comp" data-comp="avatar">
          ${d
            ? `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#818cf8)"></div>`
            : `<div style="width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.12)"></div>`
          }
        </div>
        ${d
          ? `<p style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5;margin:8px 0;font-style:italic;font-family:-apple-system,sans-serif">"Amazing quality and attention to detail. The craftsmanship is incredible."</p>
             <span style="font-size:10px;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif">· @collector_42</span>`
          : `<div class="wl wl-10" style="width:100%;background:rgba(255,255,255,0.1);margin-top:8px"></div>
             <div class="wl wl-10" style="width:80%;background:rgba(255,255,255,0.08);margin-top:4px"></div>
             <div class="wl wl-8" style="width:80px;background:rgba(255,255,255,0.06);margin-top:8px"></div>`
        }
      </div>
      <div class="wf-comp wf-fp-testimonial" data-comp="testimonial-card">
        <div class="wf-comp" data-comp="avatar">
          ${d
            ? `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f472b6,#e879f9)"></div>`
            : `<div style="width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.12)"></div>`
          }
        </div>
        ${d
          ? `<p style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5;margin:8px 0;font-style:italic;font-family:-apple-system,sans-serif">"Fast shipping and the packaging is so secure. Will buy again!"</p>
             <span style="font-size:10px;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif">· @premium_shelf</span>`
          : `<div class="wl wl-10" style="width:100%;background:rgba(255,255,255,0.1);margin-top:8px"></div>
             <div class="wl wl-10" style="width:75%;background:rgba(255,255,255,0.08);margin-top:4px"></div>
             <div class="wl wl-8" style="width:70px;background:rgba(255,255,255,0.06);margin-top:8px"></div>`
        }
      </div>
    </div>
  </div>

  <!-- Contact section -->
  <div class="wf-fp-section" style="background:#050709">
    <div class="wf-comp wf-fp-form-wrap" data-comp="form">
      <div class="wf-fp-form-row">
        <div class="wf-comp" data-comp="input-field">
          ${d
            ? `<input type="text" placeholder="Name" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-family:-apple-system,sans-serif">`
            : `<div style="width:100%;height:40px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)"></div>`
          }
        </div>
        <div class="wf-comp" data-comp="input-field">
          ${d
            ? `<input type="email" placeholder="Email" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-family:-apple-system,sans-serif">`
            : `<div style="width:100%;height:40px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)"></div>`
          }
        </div>
      </div>
      <div class="wf-comp" data-comp="textarea">
        ${d
          ? `<textarea placeholder="Message" style="width:100%;height:80px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;resize:none;font-family:-apple-system,sans-serif"></textarea>`
          : `<div style="width:100%;height:80px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)"></div>`
        }
      </div>
      <div class="wf-comp" data-comp="cta-button">
        ${d
          ? `<button style="width:100%;padding:12px;border-radius:8px;font-size:14px;font-weight:600;background:#7c3aed;color:#fff;border:none;cursor:pointer;font-family:-apple-system,sans-serif">Send</button>`
          : `<div class="wf-filled-btn" style="width:100%;height:42px;border-radius:8px"></div>`
        }
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="wf-comp wf-fp-footer" data-comp="footer">
    <div class="wf-fp-footer-top">
      ${d
        ? `<span style="font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:2px;font-family:-apple-system,sans-serif">PREMIUM COLLECTIBLE FIGURES.</span>`
        : `<div class="wl wl-8" style="width:160px;background:rgba(255,255,255,0.06)"></div>`
      }
    </div>
    <div class="wf-comp" data-comp="social-icons">
      ${d
        ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);font-size:12px;color:rgba(255,255,255,0.5)">X</span>`
        : `<div style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.08)"></div>`
      }
    </div>
  </div>

</div>`;
}
