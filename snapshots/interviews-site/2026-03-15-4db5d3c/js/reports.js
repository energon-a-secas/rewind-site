import { CATEGORIES, QUESTION_TEXT, SUGGESTIONS, DIMENSION_ORDER, DIM_TO_CAT, PIECE_PROFILES } from './data.js';
import { state } from './state.js';
import { getCandidateName, today, getVal, getLabel, getCatScore, getVerdict } from './utils.js';
import { calculatePieceMatches, getBestPiece } from './scoring.js';

export function generateInternalReport() {
  const name = getCandidateName();
  const notes = document.getElementById('notes').value.trim();
  let total = 0;
  for (const k in CATEGORIES) total += getCatScore(k, CATEGORIES);
  const pct = Math.round((total / 36) * 100);
  const verdict = getVerdict(pct);

  let md = '# Interview Assessment — Internal Review\n\n';
  md += '**Candidate:** ' + name + '  \n';
  md += '**Date:** ' + today() + '  \n\n';
  md += '---\n\n## Result Summary\n\n';
  md += '| Metric | Value |\n|--------|-------|\n';
  md += '| **Score** | ' + total + '/36 (' + pct + '%) |\n';
  md += '| **Verdict** | ' + verdict.label + ' |\n';
  md += '| **Pass Probability** | ' + pct + '% |\n\n';
  md += '---\n\n## Detailed Assessment\n\n';

  for (const key in CATEGORIES) {
    const cat = CATEGORIES[key];
    const catScore = getCatScore(key, CATEGORIES);
    md += '### ' + cat.name + ' — ' + catScore + '/6\n\n';
    md += '| Question | Rating | Score |\n|----------|--------|-------|\n';
    cat.questions.forEach(q => {
      md += '| ' + QUESTION_TEXT[q] + ' | ' + getLabel(q) + ' | ' + getVal(q) + '/2 |\n';
    });
    md += '\n';
    if (key === 'tech' && document.getElementById('tech-probes').open) {
      md += '> **Probe Findings:**  \n';
      md += '> - Hands-on exposure: **' + getLabel('tech-p1') + '** (' + getVal('tech-p1') + '/2)  \n';
      md += '> - Implementation detail: **' + getLabel('tech-p2') + '** (' + getVal('tech-p2') + '/2)  \n\n';
    }
    if (key === 'own' && document.getElementById('own-probes').open) {
      md += '> **Probe Findings:**  \n';
      md += '> - Direct experience: **' + getLabel('own-p1') + '** (' + getVal('own-p1') + '/2)  \n\n';
    }
    if (key === 'solve' && document.getElementById('solve-probes').open) {
      md += '> **Probe Findings:**  \n';
      md += '> - Design trade-offs: **' + getLabel('solve-p1') + '** (' + getVal('solve-p1') + '/2)  \n';
      md += '> - Constraint changes: **' + getLabel('solve-p2') + '** (' + getVal('solve-p2') + '/2)  \n';
      md += '> - Pattern limitations: **' + getLabel('solve-p3') + '** (' + getVal('solve-p3') + '/2)  \n';
      md += '> - Simplification: **' + getLabel('solve-p4') + '** (' + getVal('solve-p4') + '/2)  \n';
      md += '> - Unfamiliar debugging: **' + getLabel('solve-p5') + '** (' + getVal('solve-p5') + '/2)  \n\n';
    }
  }
  md += '---\n\n';

  const rpMatches = calculatePieceMatches();
  const rpBest = getBestPiece(rpMatches);
  const rpActive = state.selectedPiece || rpBest;
  const rpProfile = PIECE_PROFILES[rpActive];
  md += '## Piece Profile\n\n';
  md += '**Identified Piece:** ' + rpProfile.icon + ' ' + rpProfile.name + ' (' + rpMatches[rpActive] + '% match)  \n';
  if (state.selectedPiece && state.selectedPiece !== rpBest) {
    md += '**Auto-detected:** ' + PIECE_PROFILES[rpBest].name + ' (' + rpMatches[rpBest] + '% match)  \n';
  }
  md += '\n' + rpProfile.desc + '\n\n';
  md += '**Suggested fit:** ' + rpProfile.role + '\n\n';
  md += '| Dimension | Category | Score | Expected |\n|-----------|----------|-------|----------|\n';
  DIMENSION_ORDER.forEach(dim => {
    const cat = DIM_TO_CAT[dim];
    md += '| ' + dim + ' | ' + CATEGORIES[cat].short + ' | ' + getCatScore(cat, CATEGORIES) + '/6 | ' + rpProfile.dims[dim].charAt(0).toUpperCase() + rpProfile.dims[dim].slice(1) + ' |\n';
  });
  md += '\n---\n\n';

  const strengths = [], concerns = [], weakCats = [];
  for (const k2 in CATEGORIES) {
    const sc = getCatScore(k2, CATEGORIES);
    if (sc >= 5) strengths.push(SUGGESTIONS[k2].strengthInternal);
    if (sc <= 2) concerns.push(SUGGESTIONS[k2].concernInternal);
    if (sc <= 3) weakCats.push(k2);
  }

  md += '## Strengths\n\n';
  if (strengths.length) strengths.forEach(s => { md += '- ' + s + '\n'; });
  else md += '- No standout strengths identified — assessment is mostly neutral\n';
  md += '\n## Concerns\n\n';
  if (concerns.length) concerns.forEach(c => { md += '- ' + c + '\n'; });
  else md += '- No major concerns identified\n';
  md += '\n';

  if (weakCats.length) {
    md += '## Action Items\n\n';
    weakCats.forEach(wk => {
      md += '**' + CATEGORIES[wk].short + ':**\n';
      SUGGESTIONS[wk].tipsInternal.forEach(t => { md += '- ' + t + '\n'; });
      md += '\n';
    });
  }

  md += '---\n\n## Recommendation\n\n';
  const weakNames = weakCats.map(wk => CATEGORIES[wk].short).join(', ');
  if (pct >= 83) md += '**Proceed to client interview.** Candidate demonstrates strong readiness across all assessment areas. Minimal preparation needed.\n';
  else if (pct >= 67) md += '**Proceed with preparation.** Schedule a brief prep session' + (weakNames ? ' focusing on ' + weakNames : '') + ' before client interview.\n';
  else if (pct >= 50) md += '**Hold for further evaluation.** Consider a second internal interview or technical assessment before client exposure.' + (weakNames ? ' Key areas: ' + weakNames + '.' : '') + '\n';
  else if (pct >= 33) md += '**Do not proceed at this time.** Significant gaps identified.' + (weakNames ? ' Focus areas: ' + weakNames + '.' : '') + ' Recommend targeted preparation before reconsidering.\n';
  else md += '**Do not proceed.** Candidate is not ready for client interviews. Consider alternative placement or an extended preparation period.\n';

  if (notes) md += '\n---\n\n## Interviewer Notes\n\n' + notes + '\n';
  md += '\n---\n\n*Generated by Vibe Check — ' + today() + '*\n';
  return md;
}

export function generateCandidateReport() {
  const name = getCandidateName();
  let total = 0;
  for (const k in CATEGORIES) total += getCatScore(k, CATEGORIES);
  const pct = Math.round((total / 36) * 100);

  let md = '# Interview Feedback\n\n';
  md += '**Candidate:** ' + name + '  \n';
  md += '**Date:** ' + today() + '  \n\n---\n\n## Overall Impression\n\n';
  if (pct >= 83) md += 'Your interview demonstrated excellent preparation and strong alignment with what we\'re looking for. You communicated effectively, showed solid technical depth, and engaged naturally throughout the conversation.\n\n';
  else if (pct >= 67) md += 'You showed solid performance in your interview with clear strengths in several areas. There are a few areas where additional preparation could make your profile even stronger.\n\n';
  else if (pct >= 50) md += 'Thank you for your time in the interview. You showed potential in some areas, while other areas would benefit from further development. Below are specific insights to help you prepare.\n\n';
  else if (pct >= 33) md += 'We appreciate the time you invested in the interview process. We identified several areas where focused preparation would significantly strengthen your profile for roles like this.\n\n';
  else md += 'Thank you for taking the time to interview with us. Based on our conversation, we believe there are foundational areas where additional experience and preparation would be beneficial.\n\n';

  const strengths = [], growth = [];
  for (const k2 in CATEGORIES) {
    const sc = getCatScore(k2, CATEGORIES);
    if (sc >= 5) strengths.push(SUGGESTIONS[k2].strengthCandidate);
    if (sc <= 3) growth.push({ key: k2, text: SUGGESTIONS[k2].growthCandidate, tips: SUGGESTIONS[k2].tipsCandidate });
  }

  md += '## What Went Well\n\n';
  if (strengths.length) strengths.forEach(s => { md += '- ' + s + '\n'; });
  else md += '- You participated actively and showed willingness to engage with the interview process\n';
  md += '\n## Areas for Growth\n\n';
  if (growth.length) {
    growth.forEach(g => {
      md += '**' + CATEGORIES[g.key].short + ':** ' + g.text + '\n';
      g.tips.forEach(t => { md += '- ' + t + '\n'; });
      md += '\n';
    });
  } else md += '- Minor refinements could further strengthen an already strong showing\n\n';

  md += '## Suggested Next Steps\n\n';
  if (pct >= 83) md += 'Based on your strong performance, we\'re optimistic about moving forward. We\'ll be in touch with next steps soon.\n';
  else if (pct >= 67) md += 'We recommend reviewing the areas noted above before the next stage. A focused preparation session on the highlighted points would be beneficial.\n';
  else if (pct >= 50) md += 'We recommend dedicated preparation in the areas listed above. Consider practicing with mock interviews and preparing concrete examples from your experience.\n';
  else md += 'We recommend building additional hands-on experience and practicing interview scenarios. Focus on the specific areas identified above, and consider seeking mentorship or structured practice opportunities.\n';

  md += '\n---\n\n*This feedback is meant to support your professional development. We wish you the best in your career journey.*\n';
  return md;
}
