import React, { useState } from 'react';
import ValidationMessage from './ValidationMessage';
import { toStructuredData } from '../constants/limits';

export default function ValidationExport({ formData, validation, onDownloadHtml }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [pdfFilename, setPdfFilename] = useState('');
  const [generationError, setGenerationError] = useState(null);

  const isValid = validation && validation.is_valid;
  const errors = [];

  if (validation) {
    if (validation.char_errors) {
      validation.char_errors.forEach(err => {
        errors.push(`${err.section}: ${err.message}`);
      });
    }
    if (validation.layout_errors) {
      validation.layout_errors.forEach(err => {
        errors.push(err);
      });
    }
  }

  // Deduplicate errors
  const uniqueErrors = Array.from(new Set(errors));

  const handleGeneratePdf = async () => {
    if (!isValid || isGenerating) return;
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
        throw new Error(errorData.detail || 'PDF generation failed');
      }

      const resData = await response.json();
      setPdfDownloadUrl(resData.download_url);
      setPdfFilename(resData.filename || 'Voltare_Resume.pdf');
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
        📋 Validation & Export
      </h3>

      {/* Validation status messages */}
      <div className="validation-list">
        {isValid ? (
          <ValidationMessage
            message="✅ All validations passed. Resume is ready for export."
            isError={false}
          />
        ) : (
          uniqueErrors.map((errMsg, i) => (
            <ValidationMessage key={i} message={`❌ ${errMsg}`} isError={true} />
          ))
        )}
      </div>

      {/* Generation trigger button */}
      <button
        type="button"
        className="voltare-btn"
        disabled={!isValid || isGenerating}
        onClick={handleGeneratePdf}
        style={{ marginTop: '12px' }}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span> Generating PDF...
          </>
        ) : (
          '📄 Generate PDF Resume'
        )}
      </button>

      {/* Success state & Download button */}
      {pdfReady && (
        <div style={{ marginTop: '16px' }}>
          <ValidationMessage message="✅ PDF generated successfully!" isError={false} />
          <button
            type="button"
            className="voltare-btn download-btn"
            onClick={handleDownloadPdf}
          >
            ⬇️ Download PDF Resume
          </button>
        </div>
      )}

      {/* Error state & HTML Fallback */}
      {generationError && (
        <div style={{ marginTop: '16px' }}>
          <div className="validation-error">
            PDF generation encountered an issue: {generationError}
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

      {/* Invalid warning */}
      {!isValid && (
        <div className="validation-error validation-banner-warning">
          ⚠️ Fix all validation errors above before generating PDF.
        </div>
      )}
    </div>
  );
}

