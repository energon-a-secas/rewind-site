const CLICHES = [
  {
    pattern: /mysterious|enigmatic|unknown past|shrouded/i,
    message: 'Vague mystery often reads as empty. Give one specific secret or wound instead.',
    severity: 'medium'
  },
  {
    pattern: /blush|stutter|stammer|nervous wreck/i,
    message: 'Constant blushing or stuttering can feel one-note. Let nerves show in actions, not every line.',
    severity: 'medium'
  },
  {
    pattern: /only (has eyes for|opens up to|talks to) you/i,
    message: 'Instant fixation removes tension. Give them a life outside the user.',
    severity: 'high'
  },
  {
    pattern: /tsundere|yandere|kuudere|dere/i,
    message: 'Archetype labels invite caricature. Describe the behavior, not the trope name.',
    severity: 'medium'
  },
  {
    pattern: /tragic past|dark past|everyone (they loved|who loved them) died/i,
    message: 'Tragic backstory works better with one concrete loss, not a pile of disasters.',
    severity: 'medium'
  },
  {
    pattern: /not like other (girls|guys|people)|different from everyone else/i,
    message: 'Show how they are different through specific habits, not the phrase itself.',
    severity: 'high'
  },
  {
    pattern: /fated|destined|soulmate|twin flame|chosen one/i,
    message: 'Fate shortcuts chemistry. Build connection through shared moments instead.',
    severity: 'high'
  },
  {
    pattern: /damsel in distress|knight in shining armor|saves (her|him|them) from/i,
    message: 'Rescue dynamics can flatten both characters. Let the user need help sometimes too.',
    severity: 'medium'
  },
  {
    pattern: /perfect (body|face|smile|skin)|drop-dead gorgeous|unearthly beauty/i,
    message: 'Perfect beauty is hard to relate to. Add one imperfect or memorable detail.',
    severity: 'low'
  },
  {
    pattern: /always knows what to say|never wrong|never loses/i,
    message: 'Flawless characters are boring. Give them mistakes and blind spots.',
    severity: 'medium'
  },
  {
    pattern: /breath hitched|heart skipped a beat|time stood still|world faded/i,
    message: 'These physical reactions are overused. Find a fresher bodily cue.',
    severity: 'low'
  },
  {
    pattern: /i would die for you|i can't live without you|you are my everything/i,
    message: 'Extreme declarations early on feel cheap. Earn them over time.',
    severity: 'high'
  },
  {
    pattern: /bad boy|good girl|rebel|princess/i,
    message: 'Broad type labels encourage clichés. Replace with specific traits.',
    severity: 'medium'
  },
  {
    pattern: /amnesia|lost memory|forgotten (love|past)/i,
    message: 'Amnesia is a common shortcut to reset relationships. Consider a subtler obstacle.',
    severity: 'medium'
  },
  {
    pattern: /love at first sight|knew from the first moment/i,
    message: 'Instant love removes the interesting part. Let attraction build through specifics.',
    severity: 'high'
  }
];

export function detectCliches(text) {
  if (!text) return [];
  const results = [];
  for (const cliche of CLICHES) {
    const match = text.match(cliche.pattern);
    if (match) {
      results.push({
        snippet: match[0],
        message: cliche.message,
        severity: cliche.severity
      });
    }
  }
  return results;
}

export function severityClass(severity) {
  return `cliche-${severity}`;
}
