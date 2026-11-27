import React, { useState } from 'react';
import { toStructuredData, estimateLines } from '../constants/limits';
import { isValidEmail, isValidPhone, isValidLinkedIn } from '../utils/contactValidation';

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

  const getPendingReasons = () => {
    const reasons = [];
    if (!sectionStatus.personal) {
      const missing = [];
      if (!formData.first_name?.trim()) missing.push('First Name');
      if (!formData.second_name?.trim()) missing.push('Last Name');
      if (!formData.city_country?.trim()) missing.push('City, Country');
      if (!formData.linkedin_url?.trim()) missing.push('LinkedIn URL');
      else if (!isValidLinkedIn(formData.linkedin_url)) missing.push('valid LinkedIn URL (linkedin.com/...)');
      if (!formData.phone?.trim()) missing.push('Phone Number');
      else if (!isValidPhone(formData.phone)) missing.push('valid Phone (7–15 digits)');
      if (!formData.email?.trim()) missing.push('Email');
      else if (!isValidEmail(formData.email)) missing.push('valid Email (name@domain.tld)');
      if (missing.length) reasons.push(`Personal: ${missing.join(', ')}`);
    }
    if (!sectionStatus.summary) {
      const issues = [];
      if (!formData.summary?.trim()) issues.push('Summary');
      else if (estimateLines(formData.summary) > 5) issues.push('Summary exceeds 5 lines');
      if (!formData.skills?.trim()) issues.push('Skills');
      else if (estimateLines(formData.skills) > 2) issues.push('Skills exceeds 2 lines');
      if (issues.length) reasons.push(`Summary: ${issues.join(', ')}`);
    }
    if (!sectionStatus.education) {
      const missingEntries = [1, 2, 3].filter(
        i => !formData[`edu_${i}_university`]?.trim() || !formData[`edu_${i}_city`]?.trim() || !formData[`edu_${i}_program`]?.trim() || !formData[`edu_${i}_date`]?.trim()
      );
      if (missingEntries.length) reasons.push(`Education: complete Entry ${missingEntries.join(', ')} (University/School, City, Program, Date)`);
    }
    if (!sectionStatus.research) {
      const missing = [];
      if (!formData.res_1_title?.trim()) missing.push('Title');
      if (!formData.res_1_org?.trim()) missing.push('Organization');
      if (!formData.res_1_start?.trim()) missing.push('Start Date');
      if (!formData.res_1_end?.trim()) missing.push('End Date');
      if (!formData.res_1_b1?.trim()) missing.push('Bullet 1');
      if (!formData.res_1_b2?.trim()) missing.push('Bullet 2');
      if (missing.length) reasons.push(`Project 1: ${missing.join(', ')}`);
    }
    if (!sectionStatus.experience) {
      const missing = [];
      if (!formData.exp_1_company?.trim()) missing.push('Company');
      if (!formData.exp_1_domain?.trim()) missing.push('Domain');
      if (!formData.exp_1_role?.trim()) missing.push('Role');
      if (!formData.exp_1_start?.trim()) missing.push('Start Date');
      if (!formData.exp_1_end?.trim()) missing.push('End Date');
      if (!formData.exp_1_b1?.trim()) missing.push('Bullet 1');
      if (missing.length) reasons.push(`Experience 1: ${missing.join(', ')}`);
    }
    return reasons;
  };
  const pendingReasons = !allRequiredDone ? getPendingReasons() : [];

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
            <strong>Almost there!</strong> Complete the pending sections above (marked with ⏳) to enable high-resolution PDF download.
            {pendingReasons.length > 0 && (
              <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '12px', lineHeight: 1.45 }}>
                {pendingReasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            )}
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
