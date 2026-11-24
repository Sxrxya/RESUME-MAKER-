import React from 'react';

export default function PageBudgetTracker({ budget }) {
  if (!budget) return null;

  const { capacityPercent, densityMode, usedPoints, totalPoints, trimAdvice } = budget;

  const getBarColor = () => {
    if (capacityPercent < 70) return '#2a6f97'; // Blue for spacious
    if (capacityPercent <= 92) return '#2e7d32'; // Green for balanced optimal
    if (capacityPercent <= 100) return '#e65100'; // Amber for compact
    return '#c62828'; // Red for overflow
  };

  const getBadgeLabel = () => {
    switch (densityMode) {
      case 'spacious': return '🌱 Spacious (~1 Page)';
      case 'balanced': return '⚖️ Balanced (1 Page)';
      case 'compact': return '📦 Compact (1 Page)';
      case 'overflow': return '⚠️ Over Budget';
      default: return '1 Page Fit';
    }
  };

  return (
    <div className="page-budget-tracker" role="region" aria-label="1-Page Budget Tracker" style={{ marginBottom: '14px' }}>
      <div className="budget-header-row">
        <div className="budget-title">
          <span>📏 Single-Page Fit:</span>
          <strong>{capacityPercent}%</strong>
          <span style={{ fontSize: '11px', color: '#6D605C', fontWeight: 'normal' }}>
            ({usedPoints} / {totalPoints} pt)
          </span>
        </div>
        <span className={`budget-badge badge-${densityMode}`}>
          {getBadgeLabel()}
        </span>
      </div>

      <div className="budget-bar-track" style={{ height: '6px' }}>
        <div
          className="budget-bar-fill"
          style={{
            width: `${Math.min(100, capacityPercent)}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>

      {/* Overflow Trim Advice (shown only when document actually overflows 100%) */}
      {capacityPercent > 100 && trimAdvice && (
        <div className="budget-overflow-alert" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '12px' }}>
          <strong>⚠️ 1-Page Overflow: </strong>
          <span>{trimAdvice.suggestion}</span>
        </div>
      )}
    </div>
  );
}
