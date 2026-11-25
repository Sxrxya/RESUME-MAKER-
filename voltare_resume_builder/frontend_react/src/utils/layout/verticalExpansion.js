/**
 * verticalExpansion.js
 * 
 * Computes graceful, section-aware micro-expansion when the resume is underfilled.
 * Distributes available vertical space across typography and structural spacing levers
 * without ever applying clumsy justify-content: space-between or blowing up global gaps.
 */

// Production executive constraints: allows 65%+ resumes to scale smoothly up to ~98% A4 fill
export const EXPANSION_CONSTRAINTS = {
  fontSize: { min: 13.0, baseline: 13.2, max: 15.0, unit: 'px' },
  bodyLineHeight: { min: 1.18, baseline: 1.20, max: 1.38, unit: '' },
  summaryLineHeight: { min: 1.20, baseline: 1.22, max: 1.42, unit: '' },
  sectionGap: { min: 11, baseline: 13, max: 24, unit: 'px' },
  itemGap: { min: 4, baseline: 5, max: 11, unit: 'px' },
  bulletGap: { min: 2, baseline: 2.5, max: 5, unit: 'px' },
  skillRowGap: { min: 2, baseline: 2.5, max: 5, unit: 'px' },
  h2MarginBottom: { min: 3, baseline: 4, max: 7, unit: 'px' },
  paddingY: { min: 32, baseline: 34, max: 44, unit: 'px' },
};

/**
 * Builds a layout object at a given expansion intensity ratio [0.0 .. 1.0].
 * Used by both single-pass estimation and the binary-search DOM fitter.
 */
export function computeExpansionAtRatio(ratio) {
  const expansionRatio = Math.min(1.0, Math.max(0.0, ratio));

  const lerp = (c) => c.baseline + (c.max - c.baseline) * expansionRatio;

  const targetPaddingY = Math.round(lerp(EXPANSION_CONSTRAINTS.paddingY));
  const targetSectionGap = Math.round(lerp(EXPANSION_CONSTRAINTS.sectionGap));
  const targetItemGap = Math.round(lerp(EXPANSION_CONSTRAINTS.itemGap));
  const targetBodyLh = +lerp(EXPANSION_CONSTRAINTS.bodyLineHeight).toFixed(2);
  const targetSummaryLh = +lerp(EXPANSION_CONSTRAINTS.summaryLineHeight).toFixed(2);
  const targetBulletGap = +lerp(EXPANSION_CONSTRAINTS.bulletGap).toFixed(1);
  const targetSkillRowGap = +lerp(EXPANSION_CONSTRAINTS.skillRowGap).toFixed(1);
  const targetH2Margin = Math.round(lerp(EXPANSION_CONSTRAINTS.h2MarginBottom));
  const targetFontSize = +lerp(EXPANSION_CONSTRAINTS.fontSize).toFixed(2);

  return {
    mode: expansionRatio > 0.01 ? 'expanded' : 'balanced',
    expansionRatio,
    paddingY: targetPaddingY,
    paddingX: 44,
    cssVariables: {
      '--flex-font-size': `${targetFontSize}px`,
      '--flex-line-height': `${targetBodyLh}`,
      '--flex-summary-lh': `${targetSummaryLh}`,
      '--flex-sec-gap': `${targetSectionGap}px`,
      '--flex-item-gap': `${targetItemGap}px`,
      '--flex-bullet-gap': `${targetBulletGap}px`,
      '--flex-skill-row-gap': `${targetSkillRowGap}px`,
      '--flex-h2-margin': `${targetH2Margin}px`
    }
  };
}

/**
 * Calculates adaptive expansion parameters based on unused vertical space.
 * 
 * @param {Object} measurement - The output from pageMeasurement.js
 * @returns {Object} Optimized CSS variables and padding values
 */
export function calculateVerticalExpansion(measurement) {
  const { remainingSpace } = measurement;

  // If already full or overflowing, stick strictly to baseline
  if (remainingSpace <= 15) {
    return getBaselineLayout();
  }

  const slack = Math.min(380, Math.max(0, remainingSpace));
  const expansionRatio = Math.min(1.0, slack / 340);
  return computeExpansionAtRatio(expansionRatio);
}

export function getBaselineLayout() {
  return {
    mode: 'balanced',
    expansionRatio: 0,
    paddingY: EXPANSION_CONSTRAINTS.paddingY.baseline,
    paddingX: 44,
    cssVariables: {
      '--flex-font-size': `${EXPANSION_CONSTRAINTS.fontSize.baseline}px`,
      '--flex-line-height': `${EXPANSION_CONSTRAINTS.bodyLineHeight.baseline}`,
      '--flex-summary-lh': `${EXPANSION_CONSTRAINTS.summaryLineHeight.baseline}`,
      '--flex-sec-gap': `${EXPANSION_CONSTRAINTS.sectionGap.baseline}px`,
      '--flex-item-gap': `${EXPANSION_CONSTRAINTS.itemGap.baseline}px`,
      '--flex-bullet-gap': `${EXPANSION_CONSTRAINTS.bulletGap.baseline}px`,
      '--flex-skill-row-gap': `${EXPANSION_CONSTRAINTS.skillRowGap.baseline}px`,
      '--flex-h2-margin': `${EXPANSION_CONSTRAINTS.h2MarginBottom.baseline}px`
    }
  };
}
