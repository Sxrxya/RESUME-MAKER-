import React from 'react';
import { FLEXIBLE_LIMITS } from '../../constants/flexibleLimits';

export default function FlexibleSummary({ summary = '', onChange }) {
  const currentLength = (summary || '').length;
  const minRequired = FLEXIBLE_LIMITS.summaryMinChars;
  const maxAllowed = FLEXIBLE_LIMITS.summaryMaxChars;
  const isSatisfied = currentLength >= minRequired;
  const progressToMin = Math.min(100, Math.round((currentLength / minRequired) * 100));

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>📝 Professional Summary <span className="req-badge">Mandatory (Min 150 Chars)</span></h3>
        <div className="char-badge-row">
          <span className={`char-status-badge ${isSatisfied ? 'badge-satisfied' : 'badge-needed'}`}>
            {isSatisfied ? `✅ ${currentLength} Chars (Meets 150 Minimum)` : `⚠️ ${currentLength} / ${minRequired} Chars Required`}
          </span>
        </div>
      </div>

      <p className="section-help-text">
        Provide a concise overview of your technical background, domain interests, and career strengths.
        A substantial summary (minimum 150 characters) ensures your resume has depth and professionalism.
      </p>

      {/* Threshold Progress Bar */}
      <div className="threshold-meter-container">
        <div className="threshold-meter-track">
          <div
            className={`threshold-meter-fill ${isSatisfied ? 'fill-ready' : 'fill-warning'}`}
            style={{ width: `${progressToMin}%` }}
          />
        </div>
        <div className="threshold-meter-label">
          {isSatisfied
            ? `Ready for export (${currentLength} characters entered)`
            : `Add ${minRequired - currentLength} more characters to unlock PDF download`}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '10px' }}>
        <textarea
          rows={5}
          className="voltare-textarea"
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Driven Software Engineer with a strong foundation in modern full-stack development, distributed systems, and cloud architecture..."
          maxLength={maxAllowed}
        />
        <div className="field-char-count">
          {currentLength} / {maxAllowed} characters (Max)
        </div>
      </div>
    </div>
  );
}
