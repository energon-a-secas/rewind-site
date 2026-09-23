import { uid } from './utils.js';

export function createProtocol(overrides = {}) {
  return {
    id: uid(),
    name: '',
    description: '',
    icon: '&#9888;',
    status: 'draft',
    triggers: [],
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createStep(overrides = {}) {
  return {
    id: uid(),
    title: '',
    instructions: '',
    priority: 'whenever',
    contacts: [],
    resources: [],
    order: 0,
    ...overrides
  };
}

export function createContact(overrides = {}) {
  return { id: uid(), name: '', phone: '', email: '', role: '', ...overrides };
}

export function createResource(overrides = {}) {
  return { id: uid(), label: '', value: '', type: 'note', ...overrides };
}

export function createTrigger(overrides = {}) {
  return { id: uid(), type: 'event', description: '', ...overrides };
}

export function addProtocol(s, proto) {
  s.protocols.push(proto);
}

export function removeProtocol(s, id) {
  s.protocols = s.protocols.filter(p => p.id !== id);
}

export function duplicateProtocol(s, id) {
  const src = s.protocols.find(p => p.id === id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = uid();
  copy.name = src.name + ' (copy)';
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.steps.forEach(st => {
    st.id = uid();
    st.contacts.forEach(c => { c.id = uid(); });
    st.resources.forEach(r => { r.id = uid(); });
  });
  copy.triggers.forEach(t => { t.id = uid(); });
  s.protocols.push(copy);
  return copy;
}

export function reorderStep(proto, stepId, direction) {
  const idx = proto.steps.findIndex(s => s.id === stepId);
  if (idx < 0) return;
  const target = idx + direction;
  if (target < 0 || target >= proto.steps.length) return;
  const tmp = proto.steps[idx];
  proto.steps[idx] = proto.steps[target];
  proto.steps[target] = tmp;
  proto.steps.forEach((st, i) => { st.order = i; });
}

// ── Templates ───────────────────────────────────────────────

export const TEMPLATES = [
  {
    key: 'stranded',
    name: 'Stranded Abroad',
    icon: '&#127758;',
    label: 'SPY MODE',
    description: 'What to do if stranded in another country without belongings',
    triggers: [
      { type: 'manual', description: 'Trusted contact activates this protocol' },
      { type: 'time', description: 'No check-in received for 72 hours' }
    ],
    steps: [
      {
        title: 'Access emergency funds',
        instructions: 'Log into the backup bank account. Wire money to a local Western Union or use a mobile payment app. Keep backup card numbers in the resource vault below.',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'Bank emergency line' }],
        resources: [{ label: 'Backup bank login', value: '', type: 'credential' }]
      },
      {
        title: 'Establish secure communication',
        instructions: 'From any computer with internet access, log into the encrypted email or messaging service. Send a status update to your emergency contact list.',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'Primary emergency contact' }],
        resources: [
          { label: 'Encrypted email login', value: '', type: 'credential' },
          { label: 'VPN server address', value: '', type: 'address' }
        ]
      },
      {
        title: 'Contact nearest embassy or consulate',
        instructions: 'Call or visit the embassy. Bring any identification you have. They can issue emergency travel documents.',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'Embassy contact' }],
        resources: [{ label: 'Passport number', value: '', type: 'note' }]
      },
      {
        title: 'Arrange emergency transport',
        instructions: 'Book return travel using emergency funds. If unable, request emergency repatriation through the embassy.',
        priority: '24h',
        contacts: [],
        resources: [{ label: 'Travel insurance policy', value: '', type: 'account' }]
      },
      {
        title: 'Signal trusted contacts',
        instructions: 'Once communication is established, send the agreed-upon safe phrase to confirm identity. Update all contacts on your status and ETA.',
        priority: '24h',
        contacts: [{ name: '', phone: '', email: '', role: 'Trusted contact #1' }],
        resources: [{ label: 'Safe phrase', value: '', type: 'note' }]
      }
    ]
  },
  {
    key: 'coma',
    name: 'If I\'m in a Coma',
    icon: '&#127973;',
    label: 'MEDICAL',
    description: 'Medical decisions, financial access, and ongoing responsibilities',
    triggers: [
      { type: 'event', description: 'Hospitalized and unable to communicate' },
      { type: 'manual', description: 'Medical proxy activated by designated person' }
    ],
    steps: [
      {
        title: 'Notify immediate family',
        instructions: 'Call the people listed below in order. Share hospital name, room number, and attending physician.',
        priority: 'immediate',
        contacts: [
          { name: '', phone: '', email: '', role: 'Family member #1' },
          { name: '', phone: '', email: '', role: 'Family member #2' }
        ],
        resources: []
      },
      {
        title: 'Activate medical power of attorney',
        instructions: 'The designated proxy should present the power of attorney document to the hospital. Contact the lawyer listed below for the original document location.',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'Lawyer / notary' }],
        resources: [{ label: 'POA document location', value: '', type: 'note' }]
      },
      {
        title: 'Handle recurring bills and payments',
        instructions: 'Log into the bank account to ensure automatic payments continue. Pay any bills that are not automated. Cancel non-essential subscriptions.',
        priority: '24h',
        contacts: [],
        resources: [
          { label: 'Primary bank login', value: '', type: 'credential' },
          { label: 'Bills checklist', value: '', type: 'note' }
        ]
      },
      {
        title: 'Contact insurance providers',
        instructions: 'File claims with health insurance. Notify employer\'s HR department for disability benefits.',
        priority: '24h',
        contacts: [
          { name: '', phone: '', email: '', role: 'Insurance agent' },
          { name: '', phone: '', email: '', role: 'HR contact at work' }
        ],
        resources: [{ label: 'Insurance policy number', value: '', type: 'account' }]
      },
      {
        title: 'Secure devices and accounts',
        instructions: 'Lock down social media. Set email auto-responder. Trusted person should have device passwords to manage urgent matters only.',
        priority: 'week',
        contacts: [{ name: '', phone: '', email: '', role: 'Trusted friend for devices' }],
        resources: [{ label: 'Device unlock codes', value: '', type: 'credential' }]
      }
    ]
  },
  {
    key: 'death',
    name: 'If I Die',
    icon: '&#9760;',
    label: 'FINAL',
    description: 'Digital cleanup, device handling, accounts, and final messages',
    triggers: [
      { type: 'event', description: 'Death confirmed' }
    ],
    steps: [
      {
        title: 'Destroy specified devices',
        instructions: 'Wipe and physically destroy the devices listed below. Factory reset is not enough for drives marked "destroy".',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'Trusted person for device destruction' }],
        resources: [{ label: 'Devices to destroy', value: '', type: 'note' }]
      },
      {
        title: 'Deliver final messages',
        instructions: 'Send the pre-written messages stored in the resource vault to the designated recipients.',
        priority: '24h',
        contacts: [],
        resources: [{ label: 'Messages location', value: '', type: 'note' }]
      },
      {
        title: 'Close or memorialize online accounts',
        instructions: 'Delete accounts marked for deletion. Memorialize social media profiles where supported. Remove payment methods first.',
        priority: 'week',
        contacts: [],
        resources: [
          { label: 'Accounts to delete', value: '', type: 'note' },
          { label: 'Password manager master', value: '', type: 'credential' }
        ]
      },
      {
        title: 'Handle financial and legal matters',
        instructions: 'Contact the lawyer for will execution. Notify banks, close individual accounts. Transfer joint account ownership.',
        priority: 'week',
        contacts: [
          { name: '', phone: '', email: '', role: 'Estate lawyer' },
          { name: '', phone: '', email: '', role: 'Accountant / financial advisor' }
        ],
        resources: [{ label: 'Will location', value: '', type: 'note' }]
      }
    ]
  },
  {
    key: 'incapacity',
    name: 'If I Lose Mental Capacity',
    icon: '&#129504;',
    label: 'GUARDIANSHIP',
    description: 'Power of attorney, asset protection, and care decisions',
    triggers: [
      { type: 'event', description: 'Medical determination of incapacity' },
      { type: 'manual', description: 'Two designated contacts agree on activation' }
    ],
    steps: [
      {
        title: 'Activate power of attorney',
        instructions: 'Present the POA document to relevant institutions. The designated agent now acts on my behalf for financial and legal decisions.',
        priority: 'immediate',
        contacts: [{ name: '', phone: '', email: '', role: 'POA agent' }],
        resources: [{ label: 'POA document location', value: '', type: 'note' }]
      },
      {
        title: 'Freeze non-essential accounts',
        instructions: 'Place holds on investment accounts and credit cards to prevent unauthorized use. Keep primary checking account active for bill payments.',
        priority: '24h',
        contacts: [{ name: '', phone: '', email: '', role: 'Financial advisor' }],
        resources: [{ label: 'Accounts to freeze', value: '', type: 'note' }]
      },
      {
        title: 'Arrange care preferences',
        instructions: 'Follow the care directives in the resource vault. Preferred facility and care requirements are documented there.',
        priority: '24h',
        contacts: [{ name: '', phone: '', email: '', role: 'Primary care physician' }],
        resources: [{ label: 'Care directives', value: '', type: 'note' }]
      },
      {
        title: 'Notify trusted circle',
        instructions: 'Inform the people listed below. They have been briefed in advance about this possibility.',
        priority: 'week',
        contacts: [
          { name: '', phone: '', email: '', role: 'Trusted contact #1' },
          { name: '', phone: '', email: '', role: 'Trusted contact #2' }
        ],
        resources: []
      }
    ]
  }
];

export function createFromTemplate(templateKey) {
  const tpl = TEMPLATES.find(t => t.key === templateKey);
  if (!tpl) return null;
  const proto = createProtocol({
    name: tpl.name,
    description: tpl.description,
    icon: tpl.icon
  });
  proto.triggers = tpl.triggers.map(t => createTrigger(t));
  proto.steps = tpl.steps.map((s, i) => {
    const step = createStep({
      title: s.title,
      instructions: s.instructions,
      priority: s.priority,
      order: i
    });
    step.contacts = (s.contacts || []).map(c => createContact(c));
    step.resources = (s.resources || []).map(r => createResource(r));
    return step;
  });
  return proto;
}
