import { renderHome } from './views/home.js';
import { renderBrowse } from './views/browse.js';
import { renderLearn } from './views/learn.js';
import { renderCodex } from './views/codex.js';
import { renderArmory } from './views/armory.js';

const VIEWS = {
  home: renderHome,
  browse: renderBrowse,
  learn: renderLearn,
  codex: renderCodex,
  armory: renderArmory,
};

const TITLES = {
  home: 'Agent Lore | Learn the agents, pick the model, ship the skill',
  browse: 'Browse all guides | Agent Lore',
  learn: 'The Path: training tracks | Agent Lore',
  codex: 'The Codex: model comparison and cost calculator | Agent Lore',
  armory: 'The Armory: grounded agent skills | Agent Lore',
};

export function render(s) {
  const view = document.getElementById('view');
  if (!view) return;

  view.innerHTML = (VIEWS[s.route.name] || renderHome)(s);
  document.title = TITLES[s.route.name] || TITLES.home;

  for (const link of document.querySelectorAll('.nav-tab')) {
    const active = link.dataset.route === s.route.name;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  const anchor = s.route.query?.get('s');
  if (anchor) {
    const target = document.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      return;
    }
  }
  window.scrollTo(0, 0);
}
