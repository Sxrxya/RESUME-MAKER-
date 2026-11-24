/**
 * overflowDetection.js
 * 
 * Pinpoints vertical overflow when candidate content exceeds maximum compression limits.
 * Identifies the exact offending section and calculates how many lines / bullet points
 * must be trimmed to ensure the document never splits onto a second page.
 */

import { A4_TARGET_HEIGHT_PX } from './pageMeasurement';

export function detectOverflowDetails(measurement, sheetEl) {
  const { totalHeight, isOverflowing, remainingSpace } = measurement;

  if (!isOverflowing && remainingSpace >= 0) {
    return {
      hasOverflow: false,
      excessPixels: 0,
      excessLines: 0,
      offendingSection: null,
      recommendation: null
    };
  }

  const excessPixels = Math.max(0, totalHeight - A4_TARGET_HEIGHT_PX);
  const excessLines = Math.ceil(excessPixels / 14); // ~14px line pitch

  // Inspect DOM sections to identify the largest consumer
  let largestSec = null;
  let maxSecHeight = 0;

  if (sheetEl) {
    const sectionEls = Array.from(sheetEl.querySelectorAll('.flex-resume-section'));
    sectionEls.forEach((sec) => {
      const height = sec.offsetHeight;
      const title = sec.querySelector('.flex-section-title')?.textContent.trim() || 'Section';
      if (height > maxSecHeight) {
        maxSecHeight = height;
        largestSec = {
          title,
          height,
          percentOfPage: Math.round((height / totalHeight) * 100)
        };
      }
    });
  }

  let recommendation = `Document exceeds 1 page by ~${excessLines} line${excessLines > 1 ? 's' : ''} (${excessPixels}px).`;
  if (largestSec) {
    recommendation += ` The "${largestSec.title}" section occupies ${largestSec.percentOfPage}% of vertical space. Trimming 1-2 bullet points or condensing sentences here will pull the document cleanly into 1 page.`;
  }

  return {
    hasOverflow: true,
    excessPixels,
    excessLines,
    offendingSection: largestSec ? largestSec.title : 'Content Sections',
    recommendation
  };
}
