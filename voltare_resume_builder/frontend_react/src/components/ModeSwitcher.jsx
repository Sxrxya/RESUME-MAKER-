import React from 'react';

export default function ModeSwitcher({ currentMode, onSelectMode }) {
  return (
    <div className="mode-switcher-container" role="region" aria-label="Resume Mode Selection">
      <div className="mode-switcher-label">
        <span className="mode-icon">⚡</span>
        <span>Choose Builder Mode:</span>
      </div>

      <div className="mode-cards-grid">
        {/* MODE 1: Standard Voltare Resume Format */}
        <button
          type="button"
          className={`mode-card ${currentMode === 'standard' ? 'selected' : ''}`}
          onClick={() => onSelectMode('standard')}
          aria-pressed={currentMode === 'standard'}
        >
          <div className="mode-card-header">
            <span className="mode-title">📄 Standard Voltare Resume Format</span>
            <span className="mode-badge badge-standard">Official Strict</span>
          </div>
          <p className="mode-desc">
            Exact official template matching the reference Voltare specification. Preserved strict structure, fixed sections, and calibrated coordinates.
          </p>
          <div className="mode-features-row">
            <span className="mode-pill">🔒 Official Template</span>
            <span className="mode-pill">📐 Fixed Architecture</span>
            <span className="mode-pill">🎯 100% Unchanged</span>
          </div>
        </button>

        {/* MODE 2: Voltare Flexible Resume Builder */}
        <button
          type="button"
          className={`mode-card ${currentMode === 'flexible' ? 'selected' : ''}`}
          onClick={() => onSelectMode('flexible')}
          aria-pressed={currentMode === 'flexible'}
        >
          <div className="mode-card-header">
            <span className="mode-title">✨ Voltare Flexible Resume Builder</span>
            <span className="mode-badge badge-flexible">Dynamic & Modular</span>
          </div>
          <p className="mode-desc">
            Modern auto-scaling builder. Dynamic spacing fills the full page even with 0 experience (freshers) or scales cleanly for experienced candidates.
          </p>
          <div className="mode-features-row">
            <span className="mode-pill">🎓 Freshers & Pros</span>
            <span className="mode-pill">📊 1-Page Budget Engine</span>
            <span className="mode-pill">🚀 80% Smart PDF Unlock</span>
          </div>
        </button>
      </div>
    </div>
  );
}
