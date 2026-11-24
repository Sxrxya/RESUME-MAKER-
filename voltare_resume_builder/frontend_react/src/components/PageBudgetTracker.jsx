import React from 'react';

export default function PageBudgetTracker({ budget, onNavigateSection }) {
  if (!budget) return null;

  const { capacityPercent, densityMode, usedPoints, totalPoints, trimAdvice, recommendations = [] } = budget;

  const getBarColor = () => {
    if (capacityPercent < 70) return '#1976d2'; // Blue for underfilled / spacious
    if (capacityPercent <= 92) return '#2e7d32'; // Green for balanced optimal
    if (capacityPercent <= 100) return '#f57c00'; // Amber for compact
    return '#d32f2f'; // Red for overflow
  };

  const getBadgeLabel = () => {
    switch (densityMode) {
      case 'spacious': return '🌱 Spacious (~1 Page Low-Content)';
      case 'balanced': return '⚖️ Balanced (Optimal Single Page)';
      case 'compact': return '📦 Compact (Full Single Page)';
      case 'overflow': return '⚠️ Over Budget (Will Not Fit 1 Page)';
      default: return 'Balanced';
    }
  };

  return (
    <div className="page-budget-tracker" role="region" aria-label="1-Page Budget Tracker">
      <div className="budget-header-row">
        <div className="budget-title">
          <span>📏 Single-Page Capacity:</span>
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

      {/* Production-Grade Smart Page-Fill Advisor: Shows when capacity is below 85% */}
      {capacityPercent < 85 && recommendations.length > 0 && (
        <div className="budget-advisor-card">
          <div className="budget-advisor-header">
            <span className="advisor-bulb">💡</span>
            <div>
              <strong className="advisor-title">Page-Fill Advisor</strong>
              <span className="advisor-subtitle">
                Resume fills {capacityPercent}% of the page. Suggestions to fill the page naturally:
              </span>
            </div>
          </div>
          <div className="budget-advisor-list">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="advisor-item">
                <div className="advisor-item-top">
                  <span className="advisor-item-title">🔹 {rec.title}</span>
                  <span className="advisor-item-impact">{rec.impact}</span>
                </div>
                <p className="advisor-item-desc">{rec.message}</p>
                {onNavigateSection && (
                  <button
                    type="button"
                    className="advisor-navigate-btn"
                    onClick={() => onNavigateSection(rec.tab || rec.section)}
                  >
                    Go to {rec.tab || rec.section} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimal Fill Message */}
      {capacityPercent >= 85 && capacityPercent <= 100 && (
        <div className="budget-optimal-card">
          <span>✅ <strong>Optimal 1-Page Layout:</strong> Content fills the single A4 page with natural executive spacing.</span>
        </div>
      )}

      {/* Overflow Trim Advice */}
      {trimAdvice && (
        <div className="budget-overflow-alert">
          <div>
            <strong>⚠️ Section Trim Recommendation: </strong>
            <span>{trimAdvice.suggestion}</span>
          </div>
          {onNavigateSection && trimAdvice.targetSection && (
            <button
              type="button"
              className="advisor-navigate-btn"
              style={{ marginTop: '6px', background: '#d32f2f', color: '#fff' }}
              onClick={() => onNavigateSection(trimAdvice.targetSection)}
            >
              Go to {trimAdvice.targetSection} to trim →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
