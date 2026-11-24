import React from 'react';

export default function ModeSwitcher({ currentMode, onSelectMode }) {
  return (
    <div className="mode-switcher-container" role="region" aria-label="Resume Mode Selection">
      <div className="mode-switcher-label">
        <span className="mode-icon">⚡</span>
        <span>Choose Builder Mode:</span>
      </div>

      <div className="mode-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* MODE 1: Standard Voltare Resume Format */}
        <button
          type="button"
          className={`mode-card ${currentMode === 'standard' ? 'selected' : ''}`}
          onClick={() => onSelectMode('standard')}
          aria-pressed={currentMode === 'standard'}
        >
          <div className="mode-card-header">
            <span className="mode-title">📄 Standard Voltare Format</span>
            <span className="mode-badge badge-standard">Strict Reference</span>
          </div>
          <p className="mode-desc">
            Exact official template matching reference Voltare specification. Preserved strict structure, fixed sections, and calibrated coordinates.
          </p>
          <div className="mode-features-row">
            <span className="mode-pill">🔒 Official Strict</span>
            <span className="mode-pill">📐 Fixed Template</span>
            <span className="mode-pill">🎯 100% Preserved</span>
          </div>
        </button>

        {/* MODE 2: Voltare Technical Resume */}
        <button
          type="button"
          className={`mode-card ${currentMode === 'flexible' ? 'selected' : ''}`}
          onClick={() => onSelectMode('flexible')}
          aria-pressed={currentMode === 'flexible'}
        >
          <div className="mode-card-header">
            <span className="mode-title">⚡ Voltare Technical Resume</span>
            <span className="mode-badge badge-flexible">Tech & Software</span>
          </div>
          <p className="mode-desc">
            Engineered for developers, DevOps, and tech freshers. Tailored for tech stack, GitHub links, algorithmic projects, and coding skills.
          </p>
          <div className="mode-features-row">
            <span className="mode-pill">💻 Software & Data</span>
            <span className="mode-pill">🐙 GitHub & Projects</span>
            <span className="mode-pill">📊 Auto-Fill A4</span>
          </div>
        </button>

        {/* MODE 3: Voltare Non-Technical & Business Resume */}
        <button
          type="button"
          className={`mode-card ${currentMode === 'non_technical' ? 'selected' : ''}`}
          onClick={() => onSelectMode('non_technical')}
          aria-pressed={currentMode === 'non_technical'}
        >
          <div className="mode-card-header">
            <span className="mode-title">💼 Voltare Non-Technical Resume</span>
            <span className="mode-badge" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>Business & Ops</span>
          </div>
          <p className="mode-desc">
            Designed for business analysts, finance, marketing, consulting, HR, and fresh graduates. Focuses on leadership, KPIs, and competencies.
          </p>
          <div className="mode-features-row">
            <span className="mode-pill">📈 Business & Ops</span>
            <span className="mode-pill">🎯 Strategy & Impact</span>
            <span className="mode-pill">📄 Single-Page A4</span>
          </div>
        </button>
      </div>
    </div>
  );
}
