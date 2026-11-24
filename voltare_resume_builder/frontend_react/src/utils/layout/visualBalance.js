/**
 * visualBalance.js
 * 
 * Analyzes the visual weight and density balance across the Top, Middle, and Bottom
 * thirds of the A4 page (each ~374px of vertical space).
 * 
 * Prevents "top-heavy" compositions where 85% of content resides in the top half
 * and detects whether layout adjustments have achieved a harmoniously distributed page.
 */

import { A4_TARGET_HEIGHT_PX } from './pageMeasurement';

export function analyzeVisualBalance(sheetEl, measurement) {
  if (!sheetEl || !measurement.isValid) {
    return {
      balanceScore: 0.5,
      isTopHeavy: false,
      distribution: { top: 33, middle: 33, bottom: 34 },
      status: 'neutral',
      feedback: ''
    };
  }

  const thirdHeight = A4_TARGET_HEIGHT_PX / 3; // ~374.3px
  const sheetRect = sheetEl.getBoundingClientRect();
  const sheetTop = sheetRect.top;

  let topWeight = 0;
  let middleWeight = 0;
  let bottomWeight = 0;

  // Header always counts towards the top third
  const headerEl = sheetEl.querySelector('.flex-resume-header');
  if (headerEl) {
    topWeight += headerEl.offsetHeight;
  }

  // Iterate over all sections and measure where their vertical bounds fall
  const sectionEls = Array.from(sheetEl.querySelectorAll('.flex-resume-section'));
  sectionEls.forEach((sec) => {
    const secRect = sec.getBoundingClientRect();
    const relTop = secRect.top - sheetTop;
    const relBottom = secRect.bottom - sheetTop;
    const height = secRect.height;

    // Distribute section height into thirds based on intersection
    // Top third: [0, thirdHeight]
    const topOverlap = Math.max(0, Math.min(relBottom, thirdHeight) - Math.max(relTop, 0));
    // Middle third: [thirdHeight, 2 * thirdHeight]
    const midOverlap = Math.max(0, Math.min(relBottom, 2 * thirdHeight) - Math.max(relTop, thirdHeight));
    // Bottom third: [2 * thirdHeight, A4_TARGET_HEIGHT_PX]
    const botOverlap = Math.max(0, Math.min(relBottom, A4_TARGET_HEIGHT_PX) - Math.max(relTop, 2 * thirdHeight));

    topWeight += topOverlap;
    middleWeight += midOverlap;
    bottomWeight += botOverlap;
  });

  const totalMeasured = topWeight + middleWeight + bottomWeight || 1;
  const topPct = Math.round((topWeight / totalMeasured) * 100);
  const midPct = Math.round((middleWeight / totalMeasured) * 100);
  const botPct = Math.round((bottomWeight / totalMeasured) * 100);

  // Severe top-heavy detection: bottom third has less than 12% content while top third has > 55%
  const isTopHeavy = botPct < 12 && topPct > 50;

  // Balance score calculation: 1.0 is a perfect ~33/33/34 balance
  const variance = Math.abs(topPct - 33.3) + Math.abs(midPct - 33.3) + Math.abs(botPct - 33.3);
  const balanceScore = +(Math.max(0, 1 - (variance / 100))).toFixed(2);

  let status = 'balanced';
  let feedback = 'Content is well distributed throughout the single page.';

  if (isTopHeavy) {
    status = 'top-heavy';
    feedback = 'Resume content is concentrated in the top portion of the page. Expansion engine or additional section bullets recommended.';
  } else if (measurement.isOverflowing) {
    status = 'overflowing';
    feedback = 'Content exceeds single-page boundary. Compression active.';
  } else if (balanceScore >= 0.75) {
    status = 'optimal';
    feedback = 'Executive visual balance: Clean vertical cadence from header to footer.';
  }

  return {
    balanceScore,
    isTopHeavy,
    distribution: {
      top: topPct,
      middle: midPct,
      bottom: botPct
    },
    status,
    feedback
  };
}
