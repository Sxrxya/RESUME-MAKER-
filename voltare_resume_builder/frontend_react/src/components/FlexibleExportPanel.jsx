import React from 'react';

export default function FlexibleExportPanel({
  validation,
  sectionStatus = {},
  onNavigateTab,
  onDownloadPdf,
  isGeneratingPdf = false,
}) {
  const { progressPercent, canDownloadPdf } = validation;

  const sections = [
    { id: 'personal', name: 'Personal Details', complete: Boolean(sectionStatus.personal), required: true },
    { id: 'summary', name: 'Professional Summary', complete: Boolean(sectionStatus.summary), required: true },
    { id: 'education', name: 'Education (3 Required)', complete: Boolean(sectionStatus.education), required: true },
    { id: 'projects', name: 'Projects (1 Required)', complete: Boolean(sectionStatus.projects), required: true },
    { id: 'skills', name: 'Skills Matrix', complete: Boolean(sectionStatus.skills), required: false },
    { id: 'experience', name: 'Work Experience', complete: Boolean(sectionStatus.experience), required: false },
    { id: 'certifications', name: 'Certifications', complete: Boolean(sectionStatus.certifications), required: false },
    { id: 'custom', name: 'Custom Section', complete: Boolean(sectionStatus.custom), required: false },
  ];

  const requiredSections = sections.filter(s => s.required);
  const completedRequired = requiredSections.filter(s => s.complete).length;
  const allRequiredDone = completedRequired === requiredSections.length;
  const isDownloadEnabled = allRequiredDone || canDownloadPdf;

  return (
    <div className="validation-export-section" style={{ marginTop: '24px' }}>
      <hr className="section-divider" />
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        📋 Resume Progress & Export
      </h3>

      {/* Progress Bar & Status */}
      <div className="progress-container" style={{ margin: '14px 0 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          <span style={{ color: isDownloadEnabled ? '#1e824c' : '#7D1128' }}>
            {isDownloadEnabled
              ? "🎉 Ready for Download! All Required Standards Met."
              : `${completedRequired} of ${requiredSections.length} Required Parts Completed`}
          </span>
          <span style={{ color: '#6D605C' }}>{progressPercent}% Complete</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isDownloadEnabled ? '#2ecc71' : '#7D1128',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Section completion boxes with green checkmarks (Identical to Standard Mode) */}
      <div className="section-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {sections.map((s) => (
          <div
            key={s.id}
            className={`section-status-pill ${s.complete ? 'done' : 'pending'}`}
            onClick={() => onNavigateTab(s.id)}
            role="button"
            tabIndex={0}
            title={s.complete ? `${s.name} is completed!` : `Click to complete ${s.name}`}
          >
            <span className="pill-icon">{s.complete ? '✅' : '⏳'}</span>
            <span className="pill-name">{s.name}</span>
            {s.complete && <span className="pill-badge">Done</span>}
          </div>
        ))}
      </div>

      {/* Clean friendly guidance box */}
      {!isDownloadEnabled ? (
        <div className="friendly-hint-box" style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '18px' }}>💡</span>
          <div>
            <strong>Almost there!</strong> Complete the required sections above (marked with ⏳) to unlock single-page PDF download.
          </div>
        </div>
      ) : (
        <div className="friendly-success-box" style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            <strong>Awesome work!</strong> All required criteria are satisfied and your single-page resume is ready for download.
          </div>
        </div>
      )}

      {/* PDF Download Button */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="voltare-btn"
          disabled={!isDownloadEnabled || isGeneratingPdf}
          onClick={onDownloadPdf}
          style={{
            flex: '1 1 220px',
            backgroundColor: isDownloadEnabled ? '#2e7d32' : '#9e9e9e',
            cursor: isDownloadEnabled ? 'pointer' : 'not-allowed',
            opacity: isDownloadEnabled ? 1 : 0.65,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 700
          }}
          title={isDownloadEnabled ? "Export strictly single-page vector A4 PDF" : "Complete required sections (marked with ⏳) to unlock download"}
        >
          {isGeneratingPdf ? (
            <>
              <span className="spinner" />
              <span>Generating Strict Single-Page PDF...</span>
            </>
          ) : (
            <>
              <span>📥 Download Single-Page PDF</span>
              {isDownloadEnabled && <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '4px' }}>Strict A4</span>}
            </>
          )}
        </button>
      </div>

      {!isDownloadEnabled && (
        <div style={{ fontSize: '11.5px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
          🔒 PDF download unlocks automatically once mandatory fields (Personal, Summary, 3 Education, 1 Project) are satisfied.
        </div>
      )}
    </div>
  );
}
