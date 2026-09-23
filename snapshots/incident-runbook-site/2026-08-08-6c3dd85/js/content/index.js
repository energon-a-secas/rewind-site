import { ch1 } from './ch1-reacting.js';
import { ch2 } from './ch2-preemptive.js';
import { ch3 } from './ch3-quick.js';
import { ch4 } from './ch4-long.js';
import { ch5 } from './ch5-understanding.js';
import { ch6 } from './ch6-escalation.js';
import { ch7 } from './ch7-plan-b.js';
import { ch8 } from './ch8-after.js';
import { ch9 } from './ch9-classics.js';
import { appendixA } from './appendix-failures.js';

export const preface = {
  id: 'preface',
  number: 0,
  front: true,
  title: 'About This Manual',
  summary: 'What this is, who it is for, and how to read it when something is currently on fire.',
  sections: [
    {
      id: 'what-this-is',
      number: '0.1',
      title: 'What this is',
      blocks: [
        { t: 'p', text: 'This is a manual on how to troubleshoot: how to work out what is wrong, what to do first, and what to do when you are stuck. It is about method rather than any particular technology, so the techniques apply whether you are looking at a Kubernetes cluster, a build pipeline, or a single misbehaving script.' },
        { t: 'p', text: 'It exists because troubleshooting is taught almost nowhere. Engineers are handed a pager and are expected to absorb the method by osmosis, usually during their first bad night. The knowledge is real and transferable, and most of it fits in a document like this one.' },
        { t: 'p', text: 'The appendix covers twelve common alerts in reference form. Those are worked examples of the method, not a substitute for it, and they are deliberately at the back.' }
      ]
    },
    {
      id: 'how-to-read',
      number: '0.2',
      title: 'How to read it',
      blocks: [
        {
          t: 'defs',
          items: [
            { term: 'Something is broken right now', text: 'Go to the ten minute pass in 9.3. If that produces nothing, read chapter 3, then chapter 4. Come back to the rest later.' },
            { term: 'You want to get better at this', text: 'Read it in order. Chapters 1 to 5 are the method, 6 and 7 are what to do when the method runs out, and 8 is how the skill compounds.' },
            { term: 'You are setting up a system or a team', text: 'Chapter 2 is the one that pays. Almost everything that makes an incident survivable is decided before it starts.' },
            { term: 'You are stuck and going in circles', text: 'Chapter 5. Circling is nearly always a working-memory problem, not a knowledge problem.' }
          ]
        },
        { t: 'note', label: 'Note', text: 'Every technique here assumes you are allowed to think for sixty seconds before acting. That assumption holds far more often than it feels like during an incident.' }
      ]
    }
  ]
};

export const chapters = [preface, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, appendixA];

export const sectionIndex = chapters.flatMap(chapter =>
  chapter.sections.map(section => ({
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    chapterNumber: chapter.number,
    id: section.id,
    number: section.number,
    title: section.title,
    blocks: section.blocks
  }))
);
