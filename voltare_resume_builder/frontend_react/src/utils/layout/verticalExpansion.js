/**
 * verticalExpansion.js
 * 
 * Computes graceful, section-aware micro-expansion when the resume is underfilled.
 * Distributes available vertical space across 8 distinct typographical and structural levers
 * without ever applying clumsy justify-content: space-between or blowing up global gaps.
 */

// Strict design constraints to preserve executive typography
export const EXPANSION_CONSTRAINTS = {
  fontSize: { min: 13.5, baseline: 13.5, max: 14.2, unit: 'px' },
  bodyLineHeight: { min: 1.22, baseline: 1.22, max: 1.34, unit: '' },
  summaryLineHeight: { min: 1.24, baseline: 1.24, max: 1.38, unit: '' },
  sectionGap: { min: 14, baseline: 14, max: 22, unit: 'px' },
  itemGap: { min: 6, baseline: 6, max: 11, unit: 'px' },
  bulletGap: { min: 3, baseline: 4, max: 7, unit: 'px' },
  skillRowGap: { min: 3, baseline: 4, max: 6, unit: 'px' },
  h2MarginBottom: { min: 4, baseline: 5, max: 8, unit: 'px' },
  paddingY: { min: 38, baseline: 38, max: 48, unit: 'px' },
};

/**
 * Calculates adaptive expansion parameters based on unused vertical space.
 * 
 * @param {Object} measurement - The output from pageMeasurement.js
 * @returns {Object} Optimized CSS variables and padding values
 */
export function calculateVerticalExpansion(measurement) {
  const { remainingSpace, sections = [] } = measurement;

  // If already full or overflowing, stick strictly to baseline
  if (remainingSpace <= 15) {
    return getBaselineLayout();
  }

  // Available positive slack: clamp to max sensible expansion ceiling (~340px)
  const slack = Math.min(340, Math.max(0, remainingSpace));
  const expansionRatio = Math.min(1.0, slack / 320); // 0.0 to 1.0 expansion intensity

  // Dynamic distribution allocation:
  // 1. Padding Y: absorbs ~15% of slack (from 38px up to 48px)
  const targetPaddingY = Math.round(
    EXPANSION_CONSTRAINTS.paddingY.baseline + 
    (EXPANSION_CONSTRAINTS.paddingY.max - EXPANSION_CONSTRAINTS.paddingY.baseline) * expansionRatio
  );

  // 2. Section Gap: absorbs major structural breath (from 14px up to 22px)
  const targetSectionGap = Math.round(
    EXPANSION_CONSTRAINTS.sectionGap.baseline + 
    (EXPANSION_CONSTRAINTS.sectionGap.max - EXPANSION_CONSTRAINTS.sectionGap.baseline) * expansionRatio
  );

  // 3. Item Gap: separates degrees, projects, jobs (from 6px up to 11px)
  const targetItemGap = Math.round(
    EXPANSION_CONSTRAINTS.itemGap.baseline + 
    (EXPANSION_CONSTRAINTS.itemGap.max - EXPANSION_CONSTRAINTS.itemGap.baseline) * expansionRatio
  );

  // 4. Line Heights: subtle, highly readable typographical expansion
  const targetBodyLh = +(
    EXPANSION_CONSTRAINTS.bodyLineHeight.baseline + 
    (EXPANSION_CONSTRAINTS.bodyLineHeight.max - EXPANSION_CONSTRAINTS.bodyLineHeight.baseline) * expansionRatio
  ).toFixed(2);

  const targetSummaryLh = +(
    EXPANSION_CONSTRAINTS.summaryLineHeight.baseline + 
    (EXPANSION_CONSTRAINTS.summaryLineHeight.max - EXPANSION_CONSTRAINTS.summaryLineHeight.baseline) * expansionRatio
  ).toFixed(2);

  // 5. Bullet Gap: separates bullet points within entries
  const targetBulletGap = Math.round(
    EXPANSION_CONSTRAINTS.bulletGap.baseline + 
    (EXPANSION_CONSTRAINTS.bulletGap.max - EXPANSION_CONSTRAINTS.bulletGap.baseline) * expansionRatio
  );

  // 6. Skill Row Gap
  const targetSkillRowGap = Math.round(
    EXPANSION_CONSTRAINTS.skillRowGap.baseline + 
    (EXPANSION_CONSTRAINTS.skillRowGap.max - EXPANSION_CONSTRAINTS.skillRowGap.baseline) * expansionRatio
  );

  // 7. H2 Title Margin
  const targetH2Margin = Math.round(
    EXPANSION_CONSTRAINTS.h2MarginBottom.baseline + 
    (EXPANSION_CONSTRAINTS.h2MarginBottom.max - EXPANSION_CONSTRAINTS.h2MarginBottom.baseline) * expansionRatio
  );

  // 8. Font Size: gentle micro-scale from 13.5px to 14.2px for very sparse content
  const targetFontSize = +(
    EXPANSION_CONSTRAINTS.fontSize.baseline + 
    (EXPANSION_CONSTRAINTS.fontSize.max - EXPANSION_CONSTRAINTS.fontSize.baseline) * expansionRatio
  ).toFixed(1);

  return {
    mode: 'expanded',
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
