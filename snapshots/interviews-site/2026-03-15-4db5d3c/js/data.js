export const CATEGORIES = {
  comm:  { questions: ['comm-1','comm-2','comm-3'],    name: 'Communication & Clarity',    short: 'Communication' },
  story: { questions: ['story-1','story-2','story-3'], name: 'Story Consistency',          short: 'Consistency' },
  tech:  { questions: ['tech-1','tech-2','tech-3'],    name: 'Technical Credibility',      short: 'Technical' },
  own:   { questions: ['own-1','own-2','own-3'],       name: 'Ownership & Accountability', short: 'Ownership' },
  solve: { questions: ['solve-1','solve-2','solve-3'], name: 'Problem-Solving & Pressure', short: 'Problem-Solving' },
  vibe:  { questions: ['vibe-1','vibe-2','vibe-3'],    name: 'The Vibe',                   short: 'Vibe' }
};

export const QUESTION_TEXT = {
  'comm-1':  'Does this person explain themselves clearly?',
  'comm-2':  'Can they structure and organize their thoughts?',
  'comm-3':  'Do they adapt their level of detail to the conversation?',
  'story-1': 'Is their experience narrative consistent throughout?',
  'story-2': 'Do details hold when approached from different angles?',
  'story-3': 'Can they provide specific examples on demand?',
  'tech-1':  'Are there technical gaps in their story?',
  'tech-2':  'Do they understand the "why" behind their decisions?',
  'tech-3':  'Can they go beyond rehearsed answers?',
  'own-1':   'Do they distinguish their work from team contributions?',
  'own-2':   'Does their ownership claim hold under deeper probing?',
  'own-3':   'Can they explain decisions they personally made?',
  'solve-1': 'How do they handle not knowing something?',
  'solve-2': 'Can they reason through problems in real-time?',
  'solve-3': 'Do they stay engaged under pressure?',
  'vibe-1':  'Would you want to work with this person daily?',
  'vibe-2':  'Do they show genuine interest in the role?',
  'vibe-3':  'Is their response pace reasonable?',
  'tech-p1': 'Does their exposure come from hands-on work?',
  'tech-p2': 'Can they elaborate on specific implementations?',
  'own-p1':  'Is this their direct experience or a coworker\'s?',
  'solve-p1': 'Can they reason through a design trade-off they haven\'t rehearsed?',
  'solve-p2': 'Do they understand what breaks when you change a constraint?',
  'solve-p3': 'Can they explain when NOT to use a pattern they mentioned?',
  'solve-p4': 'Can they simplify an over-engineered proposal?',
  'solve-p5': 'Can they walk through debugging a system they didn\'t build?'
};

export const PROBE_NAMES = ['tech-p1', 'tech-p2', 'own-p1', 'solve-p1', 'solve-p2', 'solve-p3', 'solve-p4', 'solve-p5'];

export const HELP_CONTENT = {
  'comm-1': {
    title: 'Assessing Communication Clarity',
    objective: 'How they explain in an interview is how they\'ll explain in a meeting with your client. This is the most visible skill.',
    ask: [
      '"Walk me through your most recent project"',
      '"Explain [something from their resume] to me like I\'m new to it"',
      '"How would you describe what you do to a non-technical person?"'
    ],
    lookFor: [
      'Uses clear, direct sentences without unnecessary jargon',
      'Gets to the point — doesn\'t take 5 minutes for a 30-second answer',
      'When they do use technical terms, they explain them naturally'
    ]
  },
  'comm-2': {
    title: 'Thought Structure & Organization',
    objective: 'Structured communication signals structured thinking. This person will write docs, explain things in stand-ups, and present to stakeholders.',
    ask: [
      '"How did you approach solving [problem they mentioned]?"',
      '"Walk me through your decision process for choosing [technology]"',
      '"What steps did you follow when [situation]?"'
    ],
    lookFor: [
      'Has a clear beginning, middle, and end to their answers',
      'Doesn\'t jump between unrelated topics randomly',
      'Can break complex topics into logical steps'
    ]
  },
  'comm-3': {
    title: 'Conversational Adaptability',
    objective: 'Client-facing roles require reading the room. Can they tell when you need more detail or less? Do they adjust?',
    ask: [
      'Start with a high-level question, then ask to go deeper',
      'Show slight confusion to see if they notice and adjust',
      'Switch context suddenly to see how they handle the pivot'
    ],
    lookFor: [
      'Adjusts depth when you seem lost or disengaged',
      'Doesn\'t give 10-minute answers to simple questions',
      'Notices your reactions and adapts pace accordingly'
    ]
  },
  'story-1': {
    title: 'Narrative Consistency',
    objective: 'Inconsistencies can indicate inflated or fabricated experience. A real story stays the same because it actually happened.',
    ask: [
      'Ask about the same project at two different points in the conversation',
      '"Earlier you mentioned [X] — tell me more about that timeline"',
      '"How long were you in that role? What was the team size?"'
    ],
    lookFor: [
      'Same timeline, same roles, same technologies each time',
      'Numbers stay consistent (team size, duration, metrics)',
      'Doesn\'t backtrack or contradict earlier statements'
    ]
  },
  'story-2': {
    title: 'Multi-Angle Consistency',
    objective: 'Real experience creates a 3D picture you can examine from any angle. Fabricated stories are flat — they only work from one direction.',
    ask: [
      '"You mentioned [X] — how does that connect to [Y] you said earlier?"',
      '"Who else was involved in that? What was their role?"',
      'Rephrase a previous question differently and compare answers'
    ],
    lookFor: [
      'Answers coherently regardless of which direction you approach from',
      'Doesn\'t get confused or nervous when you rephrase things',
      'Can explain relationships between different parts of their story'
    ]
  },
  'story-3': {
    title: 'Concrete Examples on Demand',
    objective: 'Real experience comes with specifics. Vague answers usually mean vague experience — or someone else\'s experience.',
    ask: [
      '"Give me a concrete example of when you did that"',
      '"What exactly did you do? What was the outcome?"',
      '"What were the numbers? How did you measure success?"'
    ],
    lookFor: [
      'Provides names, dates, metrics, specific tools',
      'Doesn\'t default to vague generalities like "we improved things"',
      'Can zoom into details without losing the thread'
    ]
  },
  'tech-1': {
    title: 'Identifying Technical Gaps',
    objective: 'Claimed skills need to have real depth behind them. Buzzwords without substance won\'t survive client interactions.',
    ask: [
      '"How would you set up [X] from scratch?"',
      '"What happens when [Y] fails? Walk me through your troubleshooting"',
      '"What are the limitations of [tool they mentioned]?"'
    ],
    lookFor: [
      'Goes beyond buzzwords into actual implementation details',
      'Knows limitations and trade-offs, not just features',
      'Can describe failure scenarios, not just happy paths'
    ]
  },
  'tech-2': {
    title: 'Understanding the "Why"',
    objective: 'Senior engineers explain reasoning. Junior engineers describe actions. If they can\'t explain why, they were probably following instructions.',
    ask: [
      '"Why did you choose [X] over [Y]?"',
      '"What alternatives did you consider?"',
      '"If you had to do it again, would you make the same choice?"'
    ],
    lookFor: [
      'Mentions alternatives that were considered and rejected',
      'Explains trade-offs specific to their situation',
      'Can discuss what they\'d change with hindsight'
    ]
  },
  'tech-3': {
    title: 'Beyond Rehearsed Answers',
    objective: 'Test if knowledge is memorized or battle-tested. Anyone can prepare talking points. Real experience handles curve balls.',
    ask: [
      '"What would happen if [unexpected scenario]?"',
      '"How about [edge case they didn\'t mention]?"',
      '"What if [constraint] was different — how would that change your approach?"'
    ],
    lookFor: [
      'Thinks through the problem instead of panicking',
      'Attempts to reason even when unsure of the answer',
      'Draws on related experience to work through unknowns'
    ]
  },
  'own-1': {
    title: 'Individual vs. Team Contributions',
    objective: 'Honest scoping of contributions shows maturity and self-awareness. Over-claiming everything shows insecurity or dishonesty.',
    ask: [
      '"What was YOUR specific part in that project?"',
      '"How many people worked on this? What did they handle?"',
      '"Which decisions were yours vs. the team\'s?"'
    ],
    lookFor: [
      'Uses "I" for their work and "we" for team efforts naturally',
      'Doesn\'t claim solo credit for what was clearly a team effort',
      'Can name teammates and their contributions'
    ]
  },
  'own-2': {
    title: 'Ownership Under Scrutiny',
    objective: 'Inflated claims collapse under scrutiny. Real ownership doesn\'t — because it actually happened that way.',
    ask: [
      '"Walk me through the implementation step by step"',
      '"Who made the final call on [X]? Why?"',
      '"What was the hardest part YOU personally dealt with?"'
    ],
    lookFor: [
      'Consistent level of detail throughout',
      'Doesn\'t suddenly get vague when you press for specifics',
      'Can describe the messy parts, not just the highlight reel'
    ]
  },
  'own-3': {
    title: 'Personal Decision-Making',
    objective: 'People who actually drove decisions can explain the context and constraints. People who followed instructions can\'t.',
    ask: [
      '"Why did YOU choose that approach?"',
      '"What constraints did you personally have to work around?"',
      '"What would you have done differently now?"'
    ],
    lookFor: [
      'First-person reasoning with specific context',
      'Mentions constraints they personally dealt with',
      'Has genuine opinions about what worked and what didn\'t'
    ]
  },
  'solve-1': {
    title: 'Handling Unknown Territory',
    objective: 'Nobody knows everything. How they handle gaps reveals character and how they\'ll perform in real work situations.',
    ask: [
      'Ask something slightly outside their stated expertise',
      '"Have you worked with [something adjacent to their stack]?"',
      'Observe their reaction more than the answer itself'
    ],
    lookFor: [
      'Says "I don\'t know" honestly, then attempts to reason through it',
      'Doesn\'t bluff or make things up — that\'s worse than not knowing',
      'Connects to what they DO know to make educated guesses'
    ]
  },
  'solve-2': {
    title: 'Real-Time Reasoning',
    objective: 'Troubleshooting and architecture require on-the-spot thinking. This can\'t be pre-rehearsed — it shows how they actually work.',
    ask: [
      '"Imagine [scenario] — what\'s the first thing you\'d check?"',
      '"How would you debug [X] if you had no documentation?"',
      '"A service is down in production. Walk me through your process."'
    ],
    lookFor: [
      'Systematic approach — doesn\'t just guess randomly',
      'Asks clarifying questions before diving in',
      'Thinks aloud so you can follow their reasoning'
    ]
  },
  'solve-3': {
    title: 'Engagement Under Pressure',
    objective: 'Client work involves pressure and tight deadlines. You need someone who leans in, not someone who checks out.',
    ask: [
      'Push back on one of their answers. Play devil\'s advocate.',
      '"I disagree — why not [alternative approach]?"',
      'Increase the pace of questions slightly'
    ],
    lookFor: [
      'Stays constructive and doesn\'t get defensive',
      'Maintains energy and eye contact',
      'Takes pushback as a conversation, not an attack'
    ]
  },
  'vibe-1': {
    title: 'The Daily Colleague Test',
    objective: 'Trust your gut. You\'ll be in meetings with this person regularly. This is the question you answer with your instinct, not analysis.',
    ask: [],
    lookFor: [
      'Your natural reaction throughout the entire conversation',
      'Did you enjoy talking to them? Did time fly or drag?',
      'Would you grab a coffee with them? That\'s your answer.'
    ]
  },
  'vibe-2': {
    title: 'Genuine Role Interest',
    objective: 'Engaged candidates become engaged employees. People who are just looking for any job act differently from people who want THIS job.',
    ask: [
      'Wait for them to ask YOU questions — do they?',
      '"What attracted you to this role specifically?"',
      '"What do you want to learn in the next year?"'
    ],
    lookFor: [
      'Asks specific questions about the role, team, or challenges',
      'Shows genuine curiosity, not just going through the motions',
      'Has clearly researched the company or position'
    ]
  },
  'vibe-3': {
    title: 'Response Pace & Confidence',
    objective: 'Response time in an interview predicts response time in real work. Clients expect timely, confident answers.',
    ask: [],
    lookFor: [
      'Answers simple questions quickly and concisely',
      'Takes appropriate time for complex questions — thinking is fine, stalling isn\'t',
      'Doesn\'t ramble for 5 minutes on a question that needs 30 seconds'
    ]
  },
  'tech-p1': {
    title: 'Hands-On vs. Observed Knowledge',
    objective: 'There\'s a big difference between "I configured it" and "I saw someone configure it". This probe separates the two.',
    ask: [
      '"What was the exact command / config you used?"',
      '"What errors did you run into?"',
      '"How long did it take you to get it working?"'
    ],
    lookFor: [
      'Can describe specific errors, gotchas, and workarounds',
      'Remembers the frustrating parts — that\'s a sign they actually did it',
      'Knows operational details, not just architectural overview'
    ]
  },
  'tech-p2': {
    title: 'Implementation Detail Depth',
    objective: 'Anyone can describe architecture at a high level. Implementation details reveal who actually built it.',
    ask: [
      '"Show me how you would set that up — step by step"',
      '"What config files did you modify? What parameters?"',
      '"What monitoring did you add? How did you know it was working?"'
    ],
    lookFor: [
      'Provides file names, config keys, CLI commands',
      'Knows the order of operations and dependencies',
      'Can describe what broke and how they fixed it'
    ]
  },
  'own-p1': {
    title: 'Direct vs. Borrowed Experience',
    objective: 'People sometimes absorb team accomplishments as their own story. This probe identifies whether the experience is firsthand.',
    ask: [
      '"Were you the one who wrote that code / made that decision?"',
      '"Who came up with that approach? Walk me through how it happened."',
      '"If I asked your teammate, what would they say your role was?"'
    ],
    lookFor: [
      'First-person details with emotional memory (frustration, pride, relief)',
      'Can describe their specific contribution without hesitation',
      'Doesn\'t get nervous when you ask "who exactly did what"'
    ]
  },
  'solve-p1': {
    title: 'Unrehearsed Design Trade-offs',
    objective: 'Anyone can memorize "use microservices for scalability." This probe tests if they actually understand the WHY behind architectural decisions by presenting a trade-off they haven\'t prepared for.',
    ask: [
      '"Your service needs to process payments. Would you go sync or async? Why?"',
      '"You\'re choosing between a monolith and microservices for a new project with 3 devs. Walk me through your thinking."',
      '"REST or event-driven for this communication? What changes your answer?"'
    ],
    lookFor: [
      'Asks clarifying questions before jumping to an answer (team size, traffic, timeline)',
      'Weighs pros and cons instead of giving a one-size-fits-all answer',
      'Can change their recommendation when you change the constraints'
    ]
  },
  'solve-p2': {
    title: 'Constraint Change Impact',
    objective: 'Take something from their own project and change a variable. If they built it, they\'ll instantly know what breaks. If they memorized it, they\'ll stall.',
    ask: [
      '"You said you used [X]. What if the traffic was 100x — what breaks first?"',
      '"What if you couldn\'t use [the database they mentioned]? What changes?"',
      '"What happens to your pipeline if that service goes down at 2 AM?"'
    ],
    lookFor: [
      'Immediately identifies the bottleneck or failure point',
      'Thinks in terms of cascading effects, not isolated components',
      'Has war stories about when constraints actually changed on them'
    ]
  },
  'solve-p3': {
    title: 'Knowing When NOT to Use Something',
    objective: 'The strongest signal of real understanding is knowing the limits. If someone says "I use Kubernetes," ask them when they wouldn\'t. Memorized knowledge only covers the happy path.',
    ask: [
      '"You mentioned [pattern/tool]. When would you NOT use it?"',
      '"What\'s the worst scenario for using [their mentioned technology]?"',
      '"If a junior dev suggested [pattern] for a simple CRUD app, what would you tell them?"'
    ],
    lookFor: [
      'Can articulate specific downsides, not just "it depends"',
      'Gives real examples of where it\'s overkill or a bad fit',
      'Shows judgment — knows the difference between "can" and "should"'
    ]
  },
  'solve-p4': {
    title: 'Simplification Under Pressure',
    objective: 'Propose something needlessly complex and see if they push back. People who truly understand systems prefer simplicity. People who memorized patterns will agree with anything that sounds sophisticated.',
    ask: [
      '"What if we add a message queue, a cache layer, and a separate auth service for this internal tool with 10 users?"',
      '"Should we use a multi-region active-active setup for this dev environment?"',
      '"Let\'s add Kubernetes orchestration for these 2 containers — good idea?"'
    ],
    lookFor: [
      'Pushes back — "that\'s overkill for this use case"',
      'Proposes a simpler alternative with reasoning',
      'Doesn\'t just agree because the interviewer suggested it'
    ]
  },
  'solve-p5': {
    title: 'Debugging an Unfamiliar System',
    objective: 'Describe a broken scenario they\'ve never seen and watch their methodology. Real engineers have a systematic approach. Memorizers will guess randomly or give textbook answers.',
    ask: [
      '"Users report the app is slow but only after 3 PM. Where do you start?"',
      '"Deploys work fine but the service crashes 10 minutes later every time. Walk me through it."',
      '"Logs show intermittent 503s from one service. How do you narrow it down?"'
    ],
    lookFor: [
      'Starts with data: logs, metrics, recent changes — not guessing',
      'Has a structured approach: reproduce, isolate, identify, fix',
      'Asks smart questions about the system before proposing solutions'
    ]
  }
};

export const SUGGESTIONS = {
  comm: {
    strengthInternal: 'Clear and effective communicator — client-ready',
    strengthCandidate: 'You communicated your ideas clearly and effectively',
    concernInternal: 'Difficulty articulating ideas — may struggle in client-facing interactions',
    growthCandidate: 'Practice structuring your responses more concisely',
    tipsInternal: ['Consider a prep session on communication clarity before client interviews', 'May benefit from practicing technical explanations with non-technical audiences'],
    tipsCandidate: ['Try the STAR method (Situation, Task, Action, Result) for structuring responses', 'Practice explaining your experience out loud before interviews']
  },
  story: {
    strengthInternal: 'Consistent and well-prepared narrative',
    strengthCandidate: 'Your experience narrative was well-structured and consistent',
    concernInternal: 'Inconsistencies in experience narrative — possible experience inflation',
    growthCandidate: 'Prepare to discuss your experience from multiple perspectives',
    tipsInternal: ['Story inconsistencies suggest possible experience gaps', 'Recommend deeper reference checks on recent projects'],
    tipsCandidate: ['Review your project timeline and key milestones before your next interview', 'Prepare concrete examples with specific metrics and outcomes']
  },
  tech: {
    strengthInternal: 'Solid technical foundation — depth matches claimed experience',
    strengthCandidate: 'You demonstrated solid technical knowledge and understanding',
    concernInternal: 'Technical depth does not match claimed experience level',
    growthCandidate: 'Deepen your understanding of the tools and decisions in your background',
    tipsInternal: ['Consider a technical assessment or coding challenge as next step', 'Technical gaps may become more evident in client-facing scenarios'],
    tipsCandidate: ['Focus on the "why" behind your technical choices, not just the "what"', 'Consider hands-on labs or side projects to strengthen practical knowledge']
  },
  own: {
    strengthInternal: 'Clear accountability — can articulate personal contributions precisely',
    strengthCandidate: 'You clearly articulated your personal contributions and decisions',
    concernInternal: 'Ownership claims may be inflated — verify with references',
    growthCandidate: 'Be more specific about what you personally contributed vs. team efforts',
    tipsInternal: ['Candidate may have been in a supportive rather than leading role', 'Claims of ownership did not hold up under probing'],
    tipsCandidate: ['It\'s perfectly fine to say "I contributed to X" rather than "I built X"', 'Interviewers value honesty about scope over breadth of claims']
  },
  solve: {
    strengthInternal: 'Strong problem-solving under pressure — good troubleshooting instincts',
    strengthCandidate: 'You showed good composure and reasoning when working through challenges',
    concernInternal: 'Under-pressure performance is a concern for client-facing roles',
    growthCandidate: 'Practice working through unfamiliar problems out loud',
    tipsInternal: ['May struggle with production incidents or tight deadlines', 'Consider how this person would perform in high-pressure client scenarios'],
    tipsCandidate: ['Remember: saying "I don\'t know, but here\'s how I\'d approach it" is a strong answer', 'Practice thinking out loud — it shows your reasoning process']
  },
  vibe: {
    strengthInternal: 'Positive cultural fit — engaging personality, good energy',
    strengthCandidate: 'You showed genuine enthusiasm and engagement throughout',
    concernInternal: 'Cultural fit concerns — low engagement or apparent lack of interest',
    growthCandidate: 'Show more curiosity about the role and team during conversations',
    tipsInternal: ['Low engagement could signal lack of interest in this specific opportunity', 'May not integrate well with client team dynamics'],
    tipsCandidate: ['Research the team and role beforehand to ask informed questions', 'Aim for conversational, concise answers rather than monologues']
  }
};

export const VERDICTS = [
  { min: 83, label: 'Strong Pass',  cls: 'verdict-strong-pass' },
  { min: 67, label: 'Likely Pass',  cls: 'verdict-likely-pass' },
  { min: 50, label: 'Borderline',   cls: 'verdict-borderline' },
  { min: 33, label: 'Unlikely',     cls: 'verdict-unlikely' },
  { min: 0,  label: 'No Pass',      cls: 'verdict-no-pass' }
];

export const DIMENSION_MAP = {
  tech: 'Power', comm: 'Range', story: 'Foresight',
  own: 'Insight', vibe: 'Versatility', solve: 'Speed'
};

export const DIMENSION_ORDER = ['Power', 'Range', 'Foresight', 'Insight', 'Versatility', 'Speed'];

export const DIM_TO_CAT = {};
for (const dk in DIMENSION_MAP) DIM_TO_CAT[DIMENSION_MAP[dk]] = dk;

export const PIECE_PROFILES = {
  queen: {
    name: 'Queen', icon: '\u265B',
    dims: { Power: 'high', Range: 'high', Foresight: 'high', Insight: 'high', Versatility: 'high', Speed: 'high' },
    desc: 'The lead who moves in any direction. High across all dimensions \u2014 unblocks situations, provides direction, handles the big picture. The risk is dependency: a team that routes everything through one person has a bottleneck wearing a crown.',
    role: 'Managers, tech leads, senior architects who operate across all fronts.'
  },
  rook: {
    name: 'Rook', icon: '\u265C',
    dims: { Power: 'high', Range: 'low', Foresight: 'low', Insight: 'medium', Versatility: 'low', Speed: 'high' },
    desc: 'The straight-line specialist. High Power and Speed within their lanes. Point them at a well-defined problem and they deliver faster than anyone. The limitation is direction \u2014 they force straight-line answers to problems that may need lateral thinking.',
    role: 'Execution-heavy roles with clear scope. Incident response, migration specialists, focused delivery.'
  },
  bishop: {
    name: 'Bishop', icon: '\u265D',
    dims: { Power: 'low', Range: 'medium', Foresight: 'high', Insight: 'high', Versatility: 'medium', Speed: 'low' },
    desc: 'The diagonal thinker. High Foresight and Insight \u2014 sees patterns, anticipates risks, flags dependency issues three sprints early. Easy to undervalue because their output is invisible: they prevent problems rather than solve them loudly.',
    role: 'Architecture, planning, risk assessment. Roles where seeing around corners matters more than shipping fast.'
  },
  knight: {
    name: 'Knight', icon: '\u265E',
    dims: { Power: 'medium', Range: 'high', Foresight: 'medium', Insight: 'medium', Versatility: 'high', Speed: 'medium' },
    desc: 'The unconventional mover. High Versatility and Range \u2014 approaches problems sideways, jumps over blockers, produces solutions that work across contexts. Value increases in complex positions with many constraints.',
    role: 'Cross-team problems, innovation, complex multi-stakeholder environments.'
  },
  pawn: {
    name: 'Pawn', icon: '\u265F',
    dims: { Power: 'low', Range: 'low', Foresight: 'low', Insight: 'low', Versatility: 'low', Speed: 'low' },
    desc: 'Potential. Junior engineers or people in unfamiliar contexts who have not yet developed their profile. The unique property is promotion \u2014 given the right conditions, a pawn develops into any other piece. The path depends on what the project and mentorship actually develop.',
    role: 'Entry-level, new hires, career changers. Placement and mentorship determine which piece they become.'
  }
};

export const PLACEHOLDER_NAMES = [
  'Han Solo', 'Leia Organa', 'Cassian Andor', 'Jyn Erso',
  'Din Djarin', 'Bail Organa', 'Wedge Antilles', 'Bodhi Rook',
  'Hera Syndulla', 'Cal Kestis', 'Fennec Shand', 'Kanan Jarrus',
  'Ezra Bridger', 'Mace Windu', 'Lando Calrissian', 'Padm\u00e9 Amidala',
  'Ahsoka Tano', 'Rex Fives', 'Boba Fett', 'Sabine Wren'
];
