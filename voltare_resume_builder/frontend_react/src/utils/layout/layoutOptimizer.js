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
import { calculateVerticalExpansion, computeExpansionAtRatio, getBaselineLayout } from './verticalExpansion';
import { calculateVerticalCompression } from './verticalCompression';
import { analyzeVisualBalance } from './visualBalance';
import { detectOverflowDetails } from './overflowDetection';

/**
 * Runs a fast binary-search DOM solver to expand typography & spacing
 * until the sheet fills 95%-98% of the A4 page without overflowing.
 */
function solveIterativeExpansion(sheetEl, minRatio = 0.0) {
  let low = minRatio;
  let high = 1.0;
  let bestLayout = computeExpansionAtRatio(low);
  const safeCeiling = A4_TARGET_HEIGHT_PX - 18; // ~1105px (98.4% A4 fill)

  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2;
    const candidate = computeExpansionAtRatio(mid);
    applyLayoutToDOM(sheetEl, candidate);
    const m = measurePageElements(sheetEl);

    if (m.totalHeight <= safeCeiling && sheetEl.scrollHeight <= A4_TARGET_HEIGHT_PX) {
      bestLayout = candidate;
      low = mid;
    } else {
      high = mid;
    }
  }

  return bestLayout;
}

/**
 * Optimizes the layout of the given sheet element in real-time.
 * 
 * @param {HTMLElement} sheetEl - The DOM sheet element (.flexible-resume-sheet)
 * @param {string|null} forceMode - 'expand', 'natural', or 'auto' (default)
 * @returns {Object} Optimized layout solution, visual balance, and CSS parameters
 */
export function optimizePageLayout(sheetEl, forceMode = 'auto') {
  if (!sheetEl) {
    return {
      success: false,
      layout: getBaselineLayout(),
      balance: { balanceScore: 0.5, status: 'neutral' },
      overflow: { hasOverflow: false },
      measurement: { remainingSpace: 0 }
    };
  }

  // 1. Reset to baseline first so measurement reflects true natural content height
  const baseline = getBaselineLayout();
  applyLayoutToDOM(sheetEl, baseline);
  const initialMeasurement = measurePageElements(sheetEl);
  if (!initialMeasurement.isValid) {
    return {
      success: false,
      layout: baseline,
      balance: { balanceScore: 0.5, status: 'neutral' },
      overflow: { hasOverflow: false },
      measurement: initialMeasurement
    };
  }

  let chosenLayout = baseline;
  const remaining = initialMeasurement.remainingSpace;
  const coverageRatio = initialMeasurement.totalHeight / A4_TARGET_HEIGHT_PX;

  // 2. Decide strategy:
  //    - If forceMode === 'expand', always fill as much as allowed without overflowing.
  //    - If forceMode === 'auto' (default), whenever content covers >= 65% of A4 and has > 20px slack,
  //      iteratively increase text size + spacing to fill ~95%-98% of the page!
  if (forceMode === 'expand' && remaining > 18) {
    chosenLayout = solveIterativeExpansion(sheetEl, 0.0);
  } else if (forceMode === 'natural') {
    chosenLayout = baseline;
  } else if (coverageRatio >= 0.65 && remaining > 20) {
    chosenLayout = solveIterativeExpansion(sheetEl, 0.0);
  } else if (remaining > 25 && coverageRatio < 0.65) {
    // Below 65%: gentle breathing room without oversized typography
    chosenLayout = calculateVerticalExpansion({ ...initialMeasurement, remainingSpace: Math.min(remaining, 120) });
  } else if (remaining < -4) {
    chosenLayout = calculateVerticalCompression(initialMeasurement);
  }

  applyLayoutToDOM(sheetEl, chosenLayout);
  const finalMeasurement = measurePageElements(sheetEl);

  // 3. Analyze visual balance across page thirds
  const balance = analyzeVisualBalance(sheetEl, finalMeasurement);

  // 4. Overflow inspection
  const overflow = detectOverflowDetails(finalMeasurement, sheetEl);

  return {
    success: true,
    layout: chosenLayout,
    balance,
    overflow,
    measurement: finalMeasurement
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
