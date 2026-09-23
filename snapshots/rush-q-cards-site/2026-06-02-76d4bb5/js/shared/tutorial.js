// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Interactive tutorial system for Rush Q Cards

const TUTORIAL_STORAGE_KEY = 'rush-q-tutorial-completed';

export const CLASSIC_TUTORIAL = [
  {
    title: 'Welcome to Classic Mode!',
    text: 'Build your team and manage projects across 8 quarters. Pay attention to events, rush orders, and budget management to win.',
    highlight: null,
  },
  {
    title: 'Your Hand',
    text: 'These are your available cards. Different card types have different uses: Talent people, Project cards you can run, and Skill cards with special effects.',
    highlight: '.hand-area',
    position: 'above',
  },
  {
    title: 'Your Team',
    text: 'Team members you recruit go here. You can assign them to run projects. Assign the right people with the right skills for best results.',
    highlight: '.human-panel .panel-section:nth-child(2)',
    position: 'left',
  },
  {
    title: 'Projects',
    text: 'Active projects appear here. Assign team members to complete them before their deadline for reputation rewards.',
    highlight: '.human-panel .panel-section:nth-child(1)',
    position: 'left',
  },
  {
    title: 'Markets & Trading',
    text: 'Project queue and For Hire markets let you trade cards. Sometimes it\'s worth trading away cards to get what you need.',
    highlight: '.markets-area',
    position: 'above',
  },
  {
    title: 'End Your Turn',
    text: 'When you\'re done playing cards and assigning people, end your turn to let AI opponents play.',
    highlight: '.btn-end',
    position: 'left',
  },
  {
    title: 'Good luck!',
    text: 'Events and Rush Q cards will shake things up each quarter. Adapt to win!',
    highlight: null,
  },
];

export const QUICK_TUTORIAL = [
  {
    title: 'Welcome to Quick Mode!',
    text: 'Draft your team, complete projects, and outmaneuver rivals in 3 quarters. Let\'s walk through the basics.',
    highlight: null,
  },
  {
    title: 'Drafting',
    text: 'You start by picking 2 team members in a snake draft. Premium people (gold border) count as 2 when assigned to projects.',
    highlight: '.draft-area',
    position: 'above',
  },
  {
    title: 'Your Turn',
    text: 'Each turn you can: Draw cards, Play a skill or budget card, Commit people to projects, Push (discard to add +1), Lend to opponents, or Pass.',
    highlight: '.action-bar',
    position: 'above',
  },
  {
    title: 'Budget Cards',
    text: 'Triangles hire people. Squares pay project costs. Budget cards expire after your next turn - watch for the red "Expires" label!',
    highlight: '.hand-area',
    position: 'above',
  },
  {
    title: 'Projects',
    text: 'Commit enough people before the quarter ends to score the reward. Partially-staffed projects give reduced credit.',
    highlight: '.projects-area',
    position: 'left',
  },
  {
    title: 'Secret Agenda',
    text: 'Your agenda gives +10 bonus at game end if completed. Nobody else can see it. Choose wisely!',
    highlight: '.agenda-area',
    position: 'left',
  },
  {
    title: 'Good luck!',
    text: 'Management directives reward the first player to achieve them. Crisis cards hit everyone. Adapt and win!',
    highlight: null,
  },
];

export function showTutorial(mode = 'classic') {
  const isCompleted = localStorage.getItem(`${TUTORIAL_STORAGE_KEY}-${mode}`);
  if (isCompleted) return;

  const tutorial = mode === 'quick' ? QUICK_TUTORIAL : CLASSIC_TUTORIAL;
  showTutorialStep(mode, tutorial, 0);
}

function showTutorialStep(mode, tutorial, idx) {
  const step = tutorial[idx];
  if (!step) {
    completeTutorial(mode);
    return;
  }

  let overlay = document.getElementById('tutorial-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
  }

  const isLast = idx === tutorial.length - 1;
  overlay.innerHTML = `
    <div class="tutorial-box">
      <div class="tutorial-step">Step ${idx + 1} of ${tutorial.length}</div>
      <h3>${step.title}</h3>
      <p>${step.text}</p>
      <div class="tutorial-btns">
        ${idx > 0 ? '<button class="btn btn-sm" onclick="window._tutorialStep(\'' + mode + '\',' + (idx - 1) + ')">Back</button>' : ''}
        <button class="btn btn-action primary" onclick="window._tutorialStep('${mode}', ${idx + 1})">${isLast ? 'Start Playing' : 'Next'}</button>
        <button class="btn btn-sm" onclick="window._tutorialSkip('${mode}')">Skip</button>
      </div>
    </div>
  `;

  // Highlight element if specified
  if (step.highlight) {
    const element = document.querySelector(step.highlight);
    if (element) {
      element.classList.add('tutorial-highlight');
    }
  }
}

window._tutorialStep = function(mode, idx) {
  const tutorial = mode === 'quick' ? QUICK_TUTORIAL : CLASSIC_TUTORIAL;
  showTutorialStep(mode, tutorial, idx);
};

window._tutorialSkip = function(mode) {
  completeTutorial(mode);
};

function completeTutorial(mode) {
  localStorage.setItem(`${TUTORIAL_STORAGE_KEY}-${mode}`, '1');

  // Remove highlights and overlay
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });

  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Check if tutorial was completed
export function isTutorialCompleted(mode = 'classic') {
  return localStorage.getItem(`${TUTORIAL_STORAGE_KEY}-${mode}`) === '1';
}

// Create a "Show Tutorial" button for replay
export function createTutorialButton(mode = 'classic') {
  const button = document.createElement('button');
  button.className = 'btn btn-secondary btn-sm';
  button.textContent = 'Show Tutorial';
  button.onclick = () => showTutorial(mode);

  return button;
}
