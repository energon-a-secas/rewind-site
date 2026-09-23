// Guild Board layout (Monster Hunter-inspired quest board).
import { makeHelpers } from './layouts.js';

// ── Guild Board ──────────────────────────────────────────────────────────────
export function guildLayout(opts = {}) {
  const H = makeHelpers(opts.dummy);
  const d = opts.dummy;

  const rankColors = { low: '#4ade80', high: '#fbbf24', master: '#f87171' };

  const stars = (n, color) => d
    ? `<span style="color:${color};font-size:12px;letter-spacing:1px">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</span>`
    : `<div class="wl wl-8" style="width:${n * 14}px;background:rgba(255,255,255,0.2)"></div>`;

  const statCounter = (num, label) => `
    <div class="wf-comp wf-guild-stat" data-comp="stat-block">
      ${d
        ? `<span style="font-size:22px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif">${num}</span>
           <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.5);font-family:-apple-system,sans-serif">${label}</span>`
        : `<div class="wl wl-20" style="width:32px;margin:0 auto"></div>
           <div class="wl wl-8" style="width:50px;margin:4px auto 0"></div>`
      }
    </div>`;

  const questCard = (title, desc, rank, starsN, type, typeColor, status, hunters) => `
    <div class="wf-comp wf-guild-quest" data-comp="card">
      <div class="wf-guild-quest-header">
        <div class="wf-comp" data-comp="badge">
          ${d
            ? `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;background:${rankColors[rank]}22;color:${rankColors[rank]};border:1px solid ${rankColors[rank]}44;font-family:-apple-system,sans-serif">${rank} Rank</span>`
            : `<div class="wf-badge-pill"><div class="wf-badge-dot"></div><div class="wl wl-8" style="width:50px"></div></div>`
          }
        </div>
        ${stars(starsN, rankColors[rank])}
      </div>
      <div class="wf-comp" data-comp="headline">
        ${H.lw(title.length * 7.5, 14, title)}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="margin-top:4px">
        ${H.lw(Math.min(desc.length * 5.5, 220), 9, desc)}
      </div>
      <div class="wf-guild-quest-meta">
        <div class="wf-comp" data-comp="badge">
          ${d
            ? `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${typeColor}22;color:${typeColor};font-family:-apple-system,sans-serif">${type}</span>`
            : `<div class="wf-badge-pill"><div class="wl wl-8" style="width:40px"></div></div>`
          }
        </div>
        <div class="wf-comp" data-comp="badge">
          ${d
            ? `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-family:-apple-system,sans-serif">${status}</span>`
            : `<div class="wf-badge-pill"><div class="wl wl-8" style="width:36px"></div></div>`
          }
        </div>
      </div>
      <div class="wf-comp wf-guild-quest-progress" data-comp="progress-bar">
        ${d
          ? `<div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden">
               <div style="height:100%;width:${Math.floor(Math.random() * 80 + 20)}%;background:${rankColors[rank]};border-radius:2px"></div>
             </div>`
          : `<div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.08)">
               <div style="height:100%;width:60%;background:rgba(255,255,255,0.2);border-radius:2px"></div>
             </div>`
        }
      </div>
      <div class="wf-comp wf-guild-hunters" data-comp="avatar">
        ${hunters.map(() => d
          ? `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border:2px solid rgba(21,19,31,0.8);margin-left:-6px"></div>`
          : `<div style="width:24px;height:24px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);margin-left:-6px"></div>`
        ).join('')}
        ${d
          ? `<span style="font-size:10px;color:rgba(255,255,255,0.45);margin-left:6px;font-family:-apple-system,sans-serif">${hunters.length} hunter${hunters.length > 1 ? 's' : ''}</span>`
          : `<div class="wl wl-8" style="width:40px;margin-left:4px"></div>`
        }
      </div>
    </div>`;

  const quests = [
    ['Implement dark mode toggle', 'Add theme switcher with system preference detection', 'low', 2, 'Hunt', '#22d3ee', 'Active', ['A', 'B']],
    ['Fix auth token expiry bug', 'Sessions expire without refresh token rotation', 'high', 2, 'Slay', '#f87171', 'Active', ['C']],
    ['Add export to CSV feature', 'Users need bulk data export for reporting', 'low', 1, 'Capture', '#a78bfa', 'Posted', ['A', 'B', 'C']],
    ['Migrate to PostgreSQL 16', 'Upgrade from PG14 with zero-downtime strategy', 'master', 3, 'Investigation', '#fbbf24', 'Active', ['D', 'E']],
    ['Redesign onboarding flow', 'New wizard with progress steps and skip option', 'high', 2, 'Hunt', '#22d3ee', 'Requested', []],
    ['Rate limiting on API', 'Implement sliding window rate limiter per endpoint', 'master', 2, 'Hunt', '#22d3ee', 'Posted', ['F']],
  ];

  return `<div class="wf-page wf-guild-page">

  <!-- Header bar -->
  <nav class="wf-comp wf-navbar wf-guild-header" data-comp="navbar" style="justify-content:space-between;background:rgba(21,19,31,0.95);border-bottom:1px solid rgba(255,255,255,0.08)">
    <div class="wf-comp wf-logo-group" data-comp="logo">
      <div class="wf-comp wf-logomark-box" data-comp="logomark" style="background:linear-gradient(135deg,#a78bfa,#818cf8)"></div>
      <div style="display:flex;flex-direction:column;gap:1px">
        <div class="wf-comp" data-comp="wordmark">${H.lw(80, 14, 'Guild Hall')}</div>
        ${d
          ? `<span style="font-size:10px;color:rgba(255,255,255,0.5);font-family:-apple-system,sans-serif">Quest Board</span>`
          : `<div class="wl wl-8" style="width:55px;background:rgba(255,255,255,0.1)"></div>`
        }
      </div>
    </div>
    <div class="wf-nav-right" style="gap:12px;align-items:center">
      <div class="wf-comp" data-comp="cta-button">
        ${d
          ? `<button style="display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:32px;border-radius:6px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12);font-size:12px;cursor:pointer;font-family:-apple-system,sans-serif">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z"/></svg>
               Hunter
             </button>`
          : `<div class="wf-outline-btn" style="width:80px;height:32px"></div>`
        }
      </div>
    </div>
  </nav>

  <!-- Guild banner with stats -->
  <div class="wf-comp wf-guild-banner" data-comp="hero-section">
    <div class="wf-comp wf-guild-motto" data-comp="subheadline">
      ${d
        ? `<span style="font-size:13px;font-style:italic;color:rgba(255,255,255,0.5);font-family:'Georgia',serif">⚔ "Through fire and code, we hunt as one." ⚔</span>`
        : `<div class="wl wl-10" style="width:240px;margin:0 auto;background:rgba(255,255,255,0.12)"></div>`
      }
    </div>
    <div class="wf-guild-stats-row">
      ${statCounter('12', 'Quests')}
      ${statCounter('5', 'Hunters')}
      ${statCounter('47', 'Completed')}
    </div>
  </div>

  <!-- Board controls: rank tabs + filters -->
  <div class="wf-guild-controls">
    <div class="wf-comp wf-guild-rank-tabs" data-comp="tab-bar">
      ${d
        ? ['All Quests', 'Low Rank', 'High Rank', 'Master Rank'].map((label, i) =>
            `<button style="padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid ${i === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'};background:${i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent'};color:${i === 0 ? '#fff' : 'rgba(255,255,255,0.5)'};cursor:pointer;font-family:-apple-system,sans-serif">${label}</button>`
          ).join('')
        : `<div class="wf-outline-btn" style="width:70px;height:28px;background:rgba(255,255,255,0.06)"></div>
           <div class="wf-outline-btn" style="width:60px;height:28px"></div>
           <div class="wf-outline-btn" style="width:65px;height:28px"></div>
           <div class="wf-outline-btn" style="width:80px;height:28px"></div>`
      }
    </div>
    <div class="wf-guild-filters">
      <div class="wf-comp" data-comp="select-field">
        ${d
          ? `<select style="padding:4px 10px;border-radius:6px;font-size:11px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);font-family:-apple-system,sans-serif;cursor:pointer">
               <option>All Status</option>
             </select>`
          : `<div class="wf-outline-btn" style="width:80px;height:28px"></div>`
        }
      </div>
      <div class="wf-comp" data-comp="select-field">
        ${d
          ? `<select style="padding:4px 10px;border-radius:6px;font-size:11px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);font-family:-apple-system,sans-serif;cursor:pointer">
               <option>All Types</option>
             </select>`
          : `<div class="wf-outline-btn" style="width:70px;height:28px"></div>`
        }
      </div>
      <div class="wf-comp" data-comp="badge">
        ${d
          ? `<span style="font-size:11px;color:rgba(255,255,255,0.4);font-family:-apple-system,sans-serif">6 results</span>`
          : `<div class="wl wl-8" style="width:45px"></div>`
        }
      </div>
    </div>
  </div>

  <!-- Quest grid -->
  <div class="wf-guild-grid">
    ${quests.map(q => questCard(...q)).join('')}
  </div>

  <!-- Board action buttons -->
  <div class="wf-guild-actions">
    <div class="wf-comp" data-comp="cta-button">
      ${d
        ? `<button style="padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;background:transparent;color:rgba(255,255,255,0.7);border:1.5px solid rgba(255,255,255,0.15);cursor:pointer;font-family:-apple-system,sans-serif">📋 Request a Mission</button>`
        : `<div class="wf-outline-btn" style="width:140px;height:38px"></div>`
      }
    </div>
    <div class="wf-comp" data-comp="cta-button">
      ${d
        ? `<button style="padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;border:none;cursor:pointer;font-family:-apple-system,sans-serif">⚔ Post a Quest</button>`
        : `<div class="wf-filled-btn" style="width:120px;height:38px"></div>`
      }
    </div>
    <div class="wf-comp" data-comp="ghost-button">
      ${d
        ? `<button style="padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;background:rgba(248,113,113,0.1);color:#f87171;border:1.5px solid rgba(248,113,113,0.25);cursor:pointer;font-family:-apple-system,sans-serif">🚨 SOS Flare</button>`
        : `<div class="wf-outline-btn" style="width:100px;height:38px"></div>`
      }
    </div>
  </div>

  <!-- Modal overlay hint (quest detail) -->
  <div class="wf-comp wf-guild-modal-hint" data-comp="modal">
    <div class="wf-guild-modal-panel">
      <div class="wf-guild-modal-header">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="wf-comp" data-comp="badge">
            ${d
              ? `<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${rankColors.high}22;color:${rankColors.high};border:1px solid ${rankColors.high}44;font-family:-apple-system,sans-serif">High Rank</span>`
              : `<div class="wf-badge-pill"><div class="wf-badge-dot"></div><div class="wl wl-8" style="width:50px"></div></div>`
            }
          </div>
          ${stars(2, rankColors.high)}
        </div>
        ${d
          ? `<button style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">✕</button>`
          : `<div style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.08)"></div>`
        }
      </div>
      <div class="wf-comp" data-comp="headline">
        ${H.lw(180, 16, 'Fix auth token expiry bug')}
      </div>
      <div class="wf-comp" data-comp="subheadline" style="margin-top:6px">
        ${H.lw(200, 9, 'Sessions expire without refresh token rotation')}
      </div>
      <div class="wf-comp wf-guild-modal-form" data-comp="form">
        <div class="wf-comp" data-comp="textarea">
          ${d
            ? `<div style="width:100%;height:48px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);padding:8px 10px">
                 <span style="font-size:11px;color:rgba(255,255,255,0.3);font-family:-apple-system,sans-serif">Add a comment...</span>
               </div>`
            : `<div style="width:100%;height:48px;border-radius:6px;border:1px solid rgba(255,255,255,0.08)"></div>`
          }
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <div class="wf-comp" data-comp="cta-button">${H.fbtn('Join Quest', 90, 30)}</div>
          <div class="wf-comp" data-comp="ghost-button">${H.obtn('Watch', 70, 30)}</div>
        </div>
      </div>
    </div>
  </div>

</div>`;
}
