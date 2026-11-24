/**
 * verticalCompression.js
 * 
 * Safely condenses typography and structural gaps when a candidate enters extensive content,
 * ensuring rich profiles (multiple jobs + multiple projects + certifications) fit on exactly 1 A4 page
 * without ever truncating candidate-provided words.
 */

export const COMPRESSION_CONSTRAINTS = {
  fontSize: { min: 12.5, baseline: 13.5, unit: 'px' },
  bodyLineHeight: { min: 1.12, baseline: 1.22, unit: '' },
  summaryLineHeight: { min: 1.14, baseline: 1.24, unit: '' },
  sectionGap: { min: 8, baseline: 14, unit: 'px' },
  itemGap: { min: 3, baseline: 6, unit: 'px' },
  bulletGap: { min: 1.5, baseline: 4, unit: 'px' },
  skillRowGap: { min: 2, baseline: 4, unit: 'px' },
  h2MarginBottom: { min: 3, baseline: 5, unit: 'px' },
  paddingY: { min: 28, baseline: 38, unit: 'px' },
};

/**
 * Calculates adaptive compression parameters based on excess vertical height.
 * 
 * @param {Object} measurement - The output from pageMeasurement.js
 * @returns {Object} Optimized compressed CSS variables and padding values
 */
export function calculateVerticalCompression(measurement) {
  const { remainingSpace } = measurement;
  const overflowPx = Math.abs(remainingSpace);

  // Compression intensity ratio (0.0 at 0 overflow to 1.0 at ~140px overflow)
  const compressionRatio = Math.min(1.0, Math.max(0, overflowPx / 120));

  // 1. Padding Y: from 38px down to 28px
  const targetPaddingY = Math.round(
    COMPRESSION_CONSTRAINTS.paddingY.baseline - 
    (COMPRESSION_CONSTRAINTS.paddingY.baseline - COMPRESSION_CONSTRAINTS.paddingY.min) * compressionRatio
  );

  // 2. Section Gap: from 14px down to 8px
  const targetSectionGap = Math.round(
    COMPRESSION_CONSTRAINTS.sectionGap.baseline - 
    (COMPRESSION_CONSTRAINTS.sectionGap.baseline - COMPRESSION_CONSTRAINTS.sectionGap.min) * compressionRatio
  );

  // 3. Item Gap: from 6px down to 3px
  const targetItemGap = Math.round(
    COMPRESSION_CONSTRAINTS.itemGap.baseline - 
    (COMPRESSION_CONSTRAINTS.itemGap.baseline - COMPRESSION_CONSTRAINTS.itemGap.min) * compressionRatio
  );

  // 4. Line Heights: down to 1.12
  const targetBodyLh = +(
    COMPRESSION_CONSTRAINTS.bodyLineHeight.baseline - 
    (COMPRESSION_CONSTRAINTS.bodyLineHeight.baseline - COMPRESSION_CONSTRAINTS.bodyLineHeight.min) * compressionRatio
  ).toFixed(2);

  const targetSummaryLh = +(
    COMPRESSION_CONSTRAINTS.summaryLineHeight.baseline - 
    (COMPRESSION_CONSTRAINTS.summaryLineHeight.baseline - COMPRESSION_CONSTRAINTS.summaryLineHeight.min) * compressionRatio
  ).toFixed(2);

  // 5. Bullet Gap: down to 1.5px
  const targetBulletGap = +(
    COMPRESSION_CONSTRAINTS.bulletGap.baseline - 
    (COMPRESSION_CONSTRAINTS.bulletGap.baseline - COMPRESSION_CONSTRAINTS.bulletGap.min) * compressionRatio
  ).toFixed(1);

  // 6. Skill Row Gap: down to 2px
  const targetSkillRowGap = Math.round(
    COMPRESSION_CONSTRAINTS.skillRowGap.baseline - 
    (COMPRESSION_CONSTRAINTS.skillRowGap.baseline - COMPRESSION_CONSTRAINTS.skillRowGap.min) * compressionRatio
  );

  // 7. H2 Title Margin: down to 3px
  const targetH2Margin = Math.round(
    COMPRESSION_CONSTRAINTS.h2MarginBottom.baseline - 
    (COMPRESSION_CONSTRAINTS.h2MarginBottom.baseline - COMPRESSION_CONSTRAINTS.h2MarginBottom.min) * compressionRatio
  );

  // 8. Font Size: from 13.5px down to 12.5px
  const targetFontSize = +(
    COMPRESSION_CONSTRAINTS.fontSize.baseline - 
    (COMPRESSION_CONSTRAINTS.fontSize.baseline - COMPRESSION_CONSTRAINTS.fontSize.min) * compressionRatio
  ).toFixed(1);

  return {
    mode: 'compressed',
    compressionRatio,
    paddingY: targetPaddingY,
    paddingX: 42,
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
