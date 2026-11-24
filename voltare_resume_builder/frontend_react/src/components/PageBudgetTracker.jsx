import React from 'react';

export default function PageBudgetTracker({ budget, onTrimClick }) {
  if (!budget) return null;

  const { capacityPercent, densityMode, usedPoints, totalPoints, trimAdvice, sectionBreakdown } = budget;

  const getBarColor = () => {
    if (capacityPercent < 70) return '#1976d2'; // Blue for spacious
    if (capacityPercent <= 92) return '#2e7d32'; // Green for balanced
    if (capacityPercent <= 100) return '#f57c00'; // Amber for compact
    return '#d32f2f'; // Red for overflow
  };

  const getBadgeLabel = () => {
    switch (densityMode) {
      case 'spacious': return '🌱 Spacious (Auto-Expanded)';
      case 'balanced': return '⚖️ Balanced (Optimal Single Page)';
      case 'compact': return '📦 Compact (Auto-Squeezed)';
      case 'overflow': return '⚠️ Over Budget (Will Not Fit 1 Page)';
      default: return 'Balanced';
    }
  };

  return (
    <div className="page-budget-tracker" role="region" aria-label="1-Page Budget Tracker">
      <div className="budget-header-row">
        <div className="budget-title">
          <span>📏 Single-Page Budget:</span>
          <strong>{capacityPercent}%</strong>
          <span style={{ fontSize: '11px', color: '#6D605C', fontWeight: 'normal' }}>
            ({usedPoints} / {totalPoints} pt)
          </span>
        </div>
        <span className={`budget-badge badge-${densityMode}`}>
          {getBadgeLabel()}
        </span>
      </div>

      <div className="budget-bar-track">
        <div
          className="budget-bar-fill"
          style={{
            width: `${Math.min(100, capacityPercent)}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>

      {trimAdvice && (
        <div className="budget-overflow-alert">
          <strong>⚠️ Section Trim Recommendation: </strong>
          <span>{trimAdvice.suggestion}</span>
        </div>
      )}
    </div>
  );
}
