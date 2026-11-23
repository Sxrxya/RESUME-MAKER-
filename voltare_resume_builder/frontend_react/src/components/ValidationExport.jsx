import React, { useState } from 'react';
import { toStructuredData } from '../constants/limits';

export default function ValidationExport({
  formData,
  sectionStatus,
  onNavigateTab,
  onDownloadHtml,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [generationError, setGenerationError] = useState(null);

  const sections = [
    { id: 'personal', name: 'Personal Information', complete: sectionStatus.personal, required: true },
    { id: 'summary', name: 'Professional Summary', complete: sectionStatus.summary, required: true },
    { id: 'education', name: 'Education', complete: sectionStatus.education, required: true },
    { id: 'research', name: 'Project 1 (Compulsory)', complete: sectionStatus.research, required: true },
    { id: 'experience', name: 'Experience', complete: sectionStatus.experience, required: true },
    { id: 'achievements', name: 'Achievements & Leadership', complete: sectionStatus.achievements, required: false },
  ];

  const requiredSections = sections.filter(s => s.required);
  const completedRequired = requiredSections.filter(s => s.complete).length;
  const allRequiredDone = completedRequired === requiredSections.length;
  const progressPercent = Math.round((completedRequired / requiredSections.length) * 100);

  const handleGeneratePdf = async () => {
    if (!allRequiredDone || isGenerating) return;
    setIsGenerating(true);
    setGenerationError(null);
    setPdfReady(false);

    const structured = toStructuredData(formData);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: structured }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || errorData.detail || 'PDF generation failed');
      }

      const resData = await response.json();
      setPdfDownloadUrl(resData.download_url);
      setPdfReady(true);
    } catch (err) {
      console.error('PDF generation error:', err);
      setGenerationError(err.message || 'PDF export failed. Playwright or dependencies might not be configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDownloadUrl) {
      window.open(pdfDownloadUrl, '_blank');
    }
  };

  return (
    <div className="validation-export-section" style={{ marginTop: '24px' }}>
      <hr className="section-divider" />
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        📋 Resume Progress & Export
      </h3>

      {/* Progress Bar & Status */}
      <div className="progress-container" style={{ margin: '14px 0 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          <span style={{ color: allRequiredDone ? '#1e824c' : '#7D1128' }}>
            {allRequiredDone ? "🎉 All Required Sections Completed!" : `${completedRequired} of ${requiredSections.length} Required Parts Completed`}
          </span>
          <span style={{ color: '#6D605C' }}>{progressPercent}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: allRequiredDone ? '#2ecc71' : '#7D1128',
            }}
          />
        </div>
      </div>

      {/* Section completion cards */}
      <div className="section-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
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

      {/* Gentle guidance instead of aggressive error lists */}
      {!allRequiredDone ? (
        <div className="friendly-hint-box">
          <span style={{ fontSize: '16px' }}>💡</span>
          <div>
            <strong>Almost there!</strong> Complete the pending sections above (marked with ⏳) to enable high-resolution PDF download.
          </div>
        </div>
      ) : (
        <div className="friendly-success-box">
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            <strong>Awesome work!</strong> All required information is completed and ready for official Voltare format export.
          </div>
        </div>
      )}

      {/* PDF Generation trigger button */}
      <button
        type="button"
        className="voltare-btn"
        disabled={!allRequiredDone || isGenerating}
        onClick={handleGeneratePdf}
        style={{ marginTop: '14px' }}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span> Generating Official PDF...
          </>
        ) : (
          '📄 Generate PDF Resume'
        )}
      </button>

      {/* PDF Ready Download Button */}
      {pdfReady && (
        <div style={{ marginTop: '16px' }}>
          <div className="friendly-success-box" style={{ marginBottom: '10px' }}>
            <span>✅</span>
            <div><strong>Success!</strong> Your official Voltare PDF resume is compiled. Click below to download!</div>
          </div>
          <button
            type="button"
            className="voltare-btn download-btn"
            onClick={handleDownloadPdf}
          >
            ⬇️ Download PDF Resume
          </button>
        </div>
      )}

      {/* Fallback to HTML if PDF service encounters issue */}
      {generationError && (
        <div style={{ marginTop: '16px' }}>
          <div className="validation-error">
            PDF compilation note: {generationError}
          </div>
          <button
            type="button"
            className="voltare-btn download-btn"
            onClick={onDownloadHtml}
            style={{ marginTop: '10px' }}
          >
            ⬇️ Download HTML Resume (Print to PDF)
          </button>
          <div className="info-alert">
            💡 <strong>Alternative:</strong> Open the downloaded file in your browser, press <strong>Ctrl+P</strong>,
            set paper to <strong>A4</strong>, enable <strong>Background graphics</strong>, and click Save.
          </div>
        </div>
      )}
    </div>
  );
}
