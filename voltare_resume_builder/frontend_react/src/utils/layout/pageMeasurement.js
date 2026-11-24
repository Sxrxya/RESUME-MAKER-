/**
 * pageMeasurement.js
 * 
 * Measures the physical rendered DOM geometry of the A4 resume sheet.
 * Exact A4 physical target at 96 DPI: 794px width x 1123px height.
 */

export const A4_TARGET_WIDTH_PX = 794;
export const A4_TARGET_HEIGHT_PX = 1123;

/**
 * Measures the actual rendered dimensions of the resume sheet and its internal sections.
 * 
 * @param {HTMLElement} sheetEl - The .flexible-resume-sheet element in the DOM
 * @returns {Object} Physical measurements, remaining vertical space, and element breakdown
 */
export function measurePageElements(sheetEl) {
  if (!sheetEl) {
    return {
      isValid: false,
      totalHeight: 0,
      targetHeight: A4_TARGET_HEIGHT_PX,
      usedHeight: 0,
      availableHeight: A4_TARGET_HEIGHT_PX,
      remainingSpace: 0,
      isOverflowing: false,
      sections: [],
      padding: { top: 38, bottom: 38, left: 44, right: 44 }
    };
  }

  const computedStyle = window.getComputedStyle(sheetEl);
  const paddingTop = parseFloat(computedStyle.paddingTop) || 38;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 38;
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 44;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 44;

  const totalContentHeight = sheetEl.scrollHeight;
  const totalOffsetHeight = sheetEl.offsetHeight || totalContentHeight;
  const innerUsableHeight = A4_TARGET_HEIGHT_PX - (paddingTop + paddingBottom);

  // Measure header
  const headerEl = sheetEl.querySelector('.flex-resume-header');
  const headerHeight = headerEl ? headerEl.offsetHeight : 0;

  // Measure sections container
  const containerEl = sheetEl.querySelector('.flex-sections-container');
  const containerHeight = containerEl ? containerEl.offsetHeight : 0;

  // Measure individual sections
  const sectionEls = Array.from(sheetEl.querySelectorAll('.flex-resume-section'));
  const sections = sectionEls.map((sec, index) => {
    const titleEl = sec.querySelector('.flex-section-title');
    const title = titleEl ? titleEl.textContent.trim() : `Section ${index + 1}`;
    const rect = sec.getBoundingClientRect();
    const items = Array.from(sec.querySelectorAll('.flex-entry-item, .flex-skill-row, .flex-summary-body'));
    
    return {
      index,
      title,
      height: sec.offsetHeight,
      top: sec.offsetTop,
      itemCount: items.length || 1,
      hasBullets: sec.querySelectorAll('li').length > 0
    };
  });

  const usedContentHeight = headerHeight + containerHeight;
  const totalOccupiedHeight = usedContentHeight + paddingTop + paddingBottom;
  const remainingSpace = A4_TARGET_HEIGHT_PX - totalOccupiedHeight;
  const isOverflowing = totalOccupiedHeight > (A4_TARGET_HEIGHT_PX + 4); // 4px tolerance

  return {
    isValid: true,
    totalHeight: totalOccupiedHeight,
    targetHeight: A4_TARGET_HEIGHT_PX,
    usedContentHeight,
    innerUsableHeight,
    remainingSpace,
    isOverflowing,
    sections,
    headerHeight,
    padding: {
      top: paddingTop,
      bottom: paddingBottom,
      left: paddingLeft,
      right: paddingRight
    }
  };
}
