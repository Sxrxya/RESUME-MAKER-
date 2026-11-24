/**
 * layoutOptimizer.js
 * 
 * Master Orchestrator for Adaptive Page Composition in Voltare Flexible Mode.
 * 
 * Workflow:
 * 1. Takes the rendered DOM sheet element.
 * 2. Runs physical geometry measurements (pageMeasurement.js).
 * 3. Evaluates slack vs. overflow.
 * 4. Selects either verticalExpansion or verticalCompression with micro-parameter clamps.
 * 5. Applies computed CSS custom properties and padding.
 * 6. Measures visual balance across Top/Mid/Bottom thirds.
 * 7. Returns actionable layout state and CSS variables.
 */

import { measurePageElements, A4_TARGET_HEIGHT_PX } from './pageMeasurement';
import { calculateVerticalExpansion, getBaselineLayout } from './verticalExpansion';
import { calculateVerticalCompression } from './verticalCompression';
import { analyzeVisualBalance } from './visualBalance';
import { detectOverflowDetails } from './overflowDetection';

/**
 * Optimizes the layout of the given sheet element in real-time.
 * 
 * @param {HTMLElement} sheetEl - The DOM sheet element (.flexible-resume-sheet)
 * @returns {Object} Optimized layout solution, visual balance, and CSS parameters
 */
export function optimizePageLayout(sheetEl) {
  if (!sheetEl) {
    return {
      success: false,
      layout: getBaselineLayout(),
      balance: { balanceScore: 0.5, status: 'neutral' },
      overflow: { hasOverflow: false },
      measurement: { remainingSpace: 0 }
    };
  }

  // 1. Initial measurement
  const initialMeasurement = measurePageElements(sheetEl);
  if (!initialMeasurement.isValid) {
    return {
      success: false,
      layout: getBaselineLayout(),
      balance: { balanceScore: 0.5, status: 'neutral' },
      overflow: { hasOverflow: false },
      measurement: initialMeasurement
    };
  }

  let chosenLayout;
  const remaining = initialMeasurement.remainingSpace;

  // 2. Decide strategy: Expand, Compress, or Keep Baseline
  if (remaining > 25) {
    // Underfilled: Graceful micro-expansion
    chosenLayout = calculateVerticalExpansion(initialMeasurement);
  } else if (remaining < -8) {
    // Overflow: Controlled micro-compression
    chosenLayout = calculateVerticalCompression(initialMeasurement);
  } else {
    // Near-perfect: Baseline
    chosenLayout = getBaselineLayout();
  }

  // 3. Analyze visual balance across page thirds
  const balance = analyzeVisualBalance(sheetEl, initialMeasurement);

  // 4. Overflow inspection
  const overflow = detectOverflowDetails(initialMeasurement, sheetEl);

  return {
    success: true,
    layout: chosenLayout,
    balance,
    overflow,
    measurement: initialMeasurement
  };
}

/**
 * Applies the calculated layout parameters directly to the sheet element style.
 * 
 * @param {HTMLElement} sheetEl
 * @param {Object} layoutSolution
 */
export function applyLayoutToDOM(sheetEl, layoutSolution) {
  if (!sheetEl || !layoutSolution || !layoutSolution.cssVariables) return;

  const { cssVariables, paddingY, paddingX = 44 } = layoutSolution;

  // Apply padding
  sheetEl.style.paddingTop = `${paddingY}px`;
  sheetEl.style.paddingBottom = `${paddingY}px`;
  sheetEl.style.paddingLeft = `${paddingX}px`;
  sheetEl.style.paddingRight = `${paddingX}px`;

  // Apply custom CSS variables
  Object.entries(cssVariables).forEach(([key, val]) => {
    sheetEl.style.setProperty(key, val);
  });
}
