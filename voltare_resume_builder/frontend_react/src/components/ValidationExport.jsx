import React, { useState } from 'react';
import { toStructuredData } from '../constants/limits';
import { isValidEmail, isValidPhone, isValidLinkedIn } from '../utils/contactValidation';

function getMissingHints(formData) {
  const hints = [];
  if (!formData.first_name?.trim()) hints.push('Personal: First Name');
  if (!formData.second_name?.trim()) hints.push('Personal: Last Name');
  if (!formData.city_country?.trim()) hints.push('Personal: City/Country');
  if (!isValidLinkedIn(formData.linkedin_url)) hints.push('Personal: Valid LinkedIn/URL');
  if (!isValidPhone(formData.phone)) hints.push('Personal: Valid Phone (7-15 digits)');
  if (!isValidEmail(formData.email)) hints.push('Personal: Valid Email');
  if (!formData.summary?.trim()) hints.push('Summary: Summary text');
  if (!formData.skills?.trim()) hints.push('Summary: Skills');
  if (!formData.edu_1_university?.trim() || !formData.edu_1_program?.trim() || !formData.edu_1_date?.trim() || !formData.edu_1_city?.trim()) {
    hints.push('Education: Entry 1 (Institution, Degree, Date, City)');
  }
  if (!formData.res_1_title?.trim() || !formData.res_1_org?.trim() || !formData.res_1_start?.trim() || !formData.res_1_end?.trim() || !formData.res_1_b1?.trim()) {
    hints.push('Research/Project 1: Title, Org, Dates & Description 1');
  }
  if (!formData.exp_1_company?.trim() || !formData.exp_1_role?.trim() || !formData.exp_1_start?.trim() || !formData.exp_1_end?.trim() || !formData.exp_1_b1?.trim()) {
    hints.push('Experience 1: Company, Role, Dates & Description');
  }
  return hints;
}

export default function ValidationExport({
  formData,
  sectionStatus,
  onNavigateTab,
  onDownloadHtml,
  layoutOverridesRef,
  isOverflowing = false,
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
    if (!allRequiredDone || isGenerating || isOverflowing) return;
    setIsGenerating(true);
    setGenerationError(null);
    setPdfReady(false);

    const structured = toStructuredData(formData);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: structured,
          layout_overrides: layoutOverridesRef?.current || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.detail?.errors?.join(' ') || errorData.detail?.message || errorData.detail || 'PDF generation failed';
        throw new Error(msg);
      }

      const resData = await response.json();
      setPdfDownloadUrl(resData.download_url);

      // Strictly trigger direct .pdf file download (no Print / Save As dialog)
      const fileResp = await fetch(resData.download_url);
      if (!fileResp.ok) throw new Error('Failed to fetch generated PDF');
      const blob = await fileResp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resData.filename || 'Voltare_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setPdfReady(true);
    } catch (err) {
      console.error('PDF generation error:', err);
      setGenerationError(err.message || 'PDF export failed. Make sure the backend server is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDownloadUrl) {
      window.open(pdfDownloadUrl, '_blank');
    }
  };

  const handleDirectPrint = async () => {
    try {
      const structured = toStructuredData(formData);
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: structured,
          layout_overrides: layoutOverridesRef?.current || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 400);
        }
      }
    } catch (err) {
      console.error('Direct print error:', err);
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
      {isOverflowing ? (
        <div className="preview-overflow-banner" style={{ marginBottom: '12px' }}>
          ⚠️ <strong>Page Overflow:</strong> Your text exceeds 1 A4 page even at maximum compression. Shorten a few bullet points so nothing is cut off in the PDF.
        </div>
      ) : !allRequiredDone ? (
        <div className="friendly-hint-box">
          <span style={{ fontSize: '16px' }}>💡</span>
          <div>
            <strong>Almost there!</strong> Complete the pending sections above (marked with ⏳) to enable PDF download:
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#7D1128' }}>
              {getMissingHints(formData).slice(0, 4).join(' • ')}
            </div>
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

      {/* PDF Download Button (Direct 1-Click PDF Download) */}
      <button
        type="button"
        className="voltare-btn"
        disabled={!allRequiredDone || isGenerating || isOverflowing}
        onClick={handleGeneratePdf}
        style={{
          marginTop: '14px',
          backgroundColor: (allRequiredDone && !isOverflowing) ? '#2e7d32' : '#9e9e9e',
          cursor: (allRequiredDone && !isOverflowing) ? 'pointer' : 'not-allowed',
        }}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span> Generating &amp; Downloading PDF...
          </>
        ) : (
          '📥 Download Single-Page PDF'
        )}
      </button>

      {pdfReady && (
        <div className="friendly-success-box" style={{ marginTop: '12px' }}>
          <span>✅</span>
          <div><strong>Downloaded!</strong> Your official single-page PDF resume has been downloaded.</div>
        </div>
      )}

      {generationError && (
        <div className="validation-error" style={{ marginTop: '12px' }}>
          ⚠️ {generationError}
        </div>
      )}
    </div>
  );
}
