import React from 'react';

export default function FlexibleExportPanel({
  validation,
  onNavigateTab,
  onDownloadPdf,
  isGeneratingPdf = false,
}) {
  const { progressPercent, canDownloadPdf, errors, warnings, budget } = validation;

  return (
    <div className="validation-export-container" style={{ marginTop: '24px' }}>
      <div className="validation-card">
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{canDownloadPdf ? '✅' : '🎯'}</span>
            <strong style={{ fontSize: '15px' }}>
              {canDownloadPdf ? 'Resume Ready for Download!' : 'Resume Completion Progress'}
            </strong>
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            backgroundColor: canDownloadPdf ? '#e8f5e9' : '#fff3e0',
            color: canDownloadPdf ? '#2e7d32' : '#e65100',
            border: `1px solid ${canDownloadPdf ? 'rgba(46, 125, 50, 0.3)' : 'rgba(230, 81, 0, 0.3)'}`
          }}>
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: '#eee6e2', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: canDownloadPdf ? '#2e7d32' : '#2a6f97',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Requirements Checklist */}
        <div style={{ fontSize: '12.5px', marginBottom: '14px', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, color: '#444', marginBottom: '4px' }}>
            Mandatory Standards for PDF Generation (80% minimum required):
          </div>
          <ul style={{ paddingLeft: '18px', margin: 0, color: '#555' }}>
            <li>Personal Contact Details completed</li>
            <li>Professional Summary with at least <strong>150 characters</strong></li>
            <li>At least <strong>2 Education qualifications</strong> entered</li>
            <li>At least <strong>1 Project</strong> with descriptive bullet point</li>
            <li>Work Experience is <em>optional</em> (freshers can have 0)</li>
          </ul>
        </div>

        {/* Errors list if any */}
        {errors.length > 0 && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ef9a9a',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '12.5px'
          }}>
            <strong style={{ color: '#c62828', display: 'block', marginBottom: '4px' }}>
              ⚠️ Missing Requirements ({errors.length}):
            </strong>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#b71c1c' }}>
              {errors.map((err, idx) => (
                <li key={idx}>
                  {err.message}
                  {err.section && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(err.section)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1565c0',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: '0 4px',
                        fontSize: '11.5px',
                        fontWeight: 600
                      }}
                    >
                      [Go to section]
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="voltare-btn"
            disabled={!canDownloadPdf || isGeneratingPdf}
            onClick={onDownloadPdf}
            style={{
              flex: '1 1 220px',
              backgroundColor: canDownloadPdf ? '#2e7d32' : '#9e9e9e',
              cursor: canDownloadPdf ? 'pointer' : 'not-allowed',
              opacity: canDownloadPdf ? 1 : 0.65,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 700
            }}
            title={canDownloadPdf ? "Export strictly single-page vector A4 PDF" : "Reach at least 80% completion and fix mandatory errors to download"}
          >
            {isGeneratingPdf ? (
              <>
                <span className="spinner" />
                <span>Generating Strict Single-Page PDF...</span>
              </>
            ) : (
              <>
                <span>📥 Download Single-Page PDF</span>
                {canDownloadPdf && <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '4px' }}>Strict A4</span>}
              </>
            )}
          </button>
        </div>

        {!canDownloadPdf && (
          <div style={{ fontSize: '11.5px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
            🔒 PDF download unlocks automatically once 80% completion and mandatory fields are satisfied.
          </div>
        )}
      </div>
    </div>
  );
}
