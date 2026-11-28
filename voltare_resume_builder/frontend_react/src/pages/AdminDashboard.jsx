import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * Format bytes to readable string (KB / MB)
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k * 1024) {
    return `${(bytes / k).toFixed(1)} KB`;
  }
  return `${(bytes / (k * 1024)).toFixed(2)} MB`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return sessionStorage.getItem('voltare_admin_user') || 'Akashvoltare';
    } catch {
      return 'Akashvoltare';
    }
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Authentication Guard: Ensure user is logged in
  useEffect(() => {
    try {
      const isAuth = sessionStorage.getItem('voltare_admin_auth');
      if (isAuth !== 'true') {
        navigate('/admin', { replace: true });
      }
    } catch {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('voltare_admin_auth');
      sessionStorage.removeItem('voltare_admin_user');
    } catch { }
    navigate('/admin');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  // Add files to current upload list (enforcing 1 to 10 limit)
  const addFiles = (newFiles) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const validFiles = [];
    const invalidFiles = [];

    Array.from(newFiles).forEach((file) => {
      const name = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => name.endsWith(ext));
      if (isValid) {
        // Prevent duplicate files by name and size
        const alreadyExists = uploadedFiles.some(
          (f) => f.file.name === file.name && f.file.size === file.size
        );
        if (!alreadyExists) {
          validFiles.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX',
            status: 'Ready',
          });
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(
        `Ignored unsupported file(s): ${invalidFiles.join(', ')}. Only PDF and DOCX files are allowed.`
      );
    }

    const combined = [...uploadedFiles, ...validFiles];

    if (combined.length > 10) {
      setUploadedFiles(combined.slice(0, 10));
      setErrorMessage(
        'Upload limit: Maximum 10 resumes can be processed simultaneously. Only the first 10 files have been retained.'
      );
    } else {
      setUploadedFiles(combined);
    }
  };

  // File drag & drop event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset file input so user can re-select same file if desired
    e.target.value = '';
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleResetForNewBatch = () => {
    setUploadedFiles([]);
    setProcessedResults(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Execute resume masking workflow
  const handleMaskResumes = async () => {
    if (uploadedFiles.length === 0) {
      setErrorMessage('Please upload at least 1 resume to process.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((item) => {
        formData.append('files', item.file, item.name);
      });

      const response = await fetch('/api/admin/mask-resumes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Resume masking failed on server.');
      }

      const data = await response.json();
      setProcessedResults(data.results || []);
      setSuccessMessage(
        `Successfully masked ${data.successful_count || 0} of ${data.total_processed || 0} resume(s).`
      );
    } catch (err) {
      console.error('Masking error:', err);
      setErrorMessage(err.message || 'An error occurred while masking resumes.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Individual download handler
  const handleDownloadSingle = async (resultItem) => {
    if (!resultItem.download_url) return;

    try {
      const resp = await fetch(resultItem.download_url);
      if (!resp.ok) throw new Error('Download failed');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resultItem.masked_filename || 'Masked_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (_err) {
      setErrorMessage(`Failed to download ${resultItem.masked_filename}`);
    }
  };

  // Download all masked resumes sequentially
  const handleDownloadAll = async () => {
    if (!processedResults || processedResults.length === 0) return;

    const successfulItems = processedResults.filter((r) => r.status === 'success' && r.download_url);
    for (let i = 0; i < successfulItems.length; i++) {
      await handleDownloadSingle(successfulItems[i]);
      // small delay to prevent browser download collisions
      await new Promise((res) => setTimeout(res, 350));
    }
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <Header subtitle="Resume Masking — Administrator Dashboard" />

      {/* Admin Dashboard Sub-Navbar */}
      <div className="admin-dashboard-nav">
        <div className="admin-nav-user-badge">
          <span className="admin-nav-user-icon">🛡️</span>
          <span>Logged in as: <strong>{adminUser}</strong></span>
          <span className="admin-nav-status-dot" title="Authenticated session active"></span>
        </div>
        <div className="admin-nav-actions">
          <button
            type="button"
            className="admin-nav-btn secondary"
            onClick={handleReturnHome}
            title="Return to the public Resume Builder"
          >
            ← Public Builder
          </button>
          <button
            type="button"
            className="admin-nav-btn logout"
            onClick={handleLogout}
            title="End session and log out"
          >
            Sign Out
          </button>
        </div>
      </div>

      <main className="admin-dashboard-main">
        {/* Banner Messages */}
        {errorMessage && (
          <div className="admin-dashboard-alert error" role="alert">
            <span>⚠️</span>
            <div className="alert-content">{errorMessage}</div>
            <button
              type="button"
              className="alert-dismiss-btn"
              onClick={() => setErrorMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="admin-dashboard-alert success" role="status">
            <span>🎉</span>
            <div className="alert-content">{successMessage}</div>
            <button
              type="button"
              className="alert-dismiss-btn"
              onClick={() => setSuccessMessage(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Masking Rules Information Banner */}
        <div className="admin-masking-rules-card">
          <div className="rules-header">
            <h3>🔒 Automated Personal Information Masking Rules</h3>
            <span className="rules-badge">Preserves Original Format & Layout</span>
          </div>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-icon">📞</span>
              <div>
                <strong>Phone Numbers</strong>
                <p>Last 5 digits masked: <code>9876543210 → 98765XXXXX</code></p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🔗</span>
              <div>
                <strong>LinkedIn Profiles</strong>
                <p>Profile name masked: <code>linkedin.com/in/... → linkedin.com/in/XXXXXXXX</code></p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✉️</span>
              <div>
                <strong>Email Addresses</strong>
                <p>Username masked: <code>akashkumar@gmail.com → XXXXXXXXXX@gmail.com</code></p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🐙</span>
              <div>
                <strong>GitHub Profiles</strong>
                <p>Username masked: <code>github.com/... → github.com/XXXXXXXX</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEW: UPLOAD & PROCESSING */}
        {!processedResults ? (
          <div className="admin-workspace-grid">
            {/* Upload Area Card */}
            <div className="admin-card upload-card">
              <div className="admin-card-header">
                <h2>📁 1. Upload Resumes (1 – 10 Files)</h2>
                <span className="file-count-pill">
                  {uploadedFiles.length} / 10 Selected
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                className={`admin-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Drag and drop resumes here or click to browse"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
                <div className="dropzone-icon">📄</div>
                <div className="dropzone-text">
                  <strong>Click to browse</strong> or drag & drop resume files here
                </div>
                <div className="dropzone-subtext">
                  Supports <strong>PDF</strong> and <strong>DOCX</strong> formats (Between 1 and 10 resumes)
                </div>
              </div>

              {/* File List Table */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files-section">
                  <div className="files-section-header">
                    <h3>Uploaded Files ({uploadedFiles.length})</h3>
                    <button
                      type="button"
                      className="clear-all-link"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="files-table-wrapper">
                    <table className="files-table">
                      <thead>
                        <tr>
                          <th>Format</th>
                          <th>Filename</th>
                          <th>Size</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className={`file-badge ${item.type.toLowerCase()}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="file-name-cell" title={item.name}>
                              {item.name}
                            </td>
                            <td>{formatFileSize(item.size)}</td>
                            <td>
                              <span className="status-pill ready">Ready</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="file-remove-btn"
                                onClick={() => handleRemoveFile(item.id)}
                                title={`Remove ${item.name}`}
                                aria-label={`Remove ${item.name}`}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="mask-actions-bar">
                <button
                  type="button"
                  className="voltare-btn mask-btn-primary"
                  onClick={handleMaskResumes}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-icon">⏳</span>
                      <span>Anonymizing {uploadedFiles.length} Resume(s)...</span>
                    </>
                  ) : (
                    <>
                      <span>🛡️ Mask Resumes ({uploadedFiles.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* RESULTS VIEW: PROCESSED & DOWNLOAD */
          <div className="admin-results-container">
            <div className="admin-card results-card">
              <div className="results-header-banner">
                <div>
                  <h2>🎉 Masking Complete</h2>
                  <p>All identified personal information has been anonymized. Original layout and styling preserved.</p>
                </div>
                <div className="results-top-actions">
                  <button
                    type="button"
                    className="voltare-btn secondary"
                    onClick={handleResetForNewBatch}
                  >
                    + Process More Resumes
                  </button>
                  {processedResults.some((r) => r.status === 'success') && (
                    <button
                      type="button"
                      className="voltare-btn"
                      onClick={handleDownloadAll}
                    >
                      📥 Download All
                    </button>
                  )}
                </div>
              </div>

              {/* Results Table */}
              <div className="results-table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Format</th>
                      <th>Original Resume</th>
                      <th>Masked Output Filename</th>
                      <th>Personal Info Masked</th>
                      <th style={{ textAlign: 'right' }}>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedResults.map((result, idx) => {
                      const isSuccess = result.status === 'success';
                      const stats = result.stats;
                      return (
                        <tr key={result.file_id || idx} className={isSuccess ? 'row-success' : 'row-error'}>
                          <td>
                            {isSuccess ? (
                              <span className="status-pill success">✓ Masked</span>
                            ) : (
                              <span className="status-pill error">✕ Failed</span>
                            )}
                          </td>
                          <td>
                            <span className={`file-badge ${(result.file_type || 'pdf').toLowerCase()}`}>
                              {result.file_type || 'PDF'}
                            </span>
                          </td>
                          <td className="original-name-cell">
                            {result.original_filename}
                          </td>
                          <td className="masked-name-cell">
                            {isSuccess ? (
                              <strong>{result.masked_filename}</strong>
                            ) : (
                              <span className="error-text">{result.error || 'Failed'}</span>
                            )}
                          </td>
                          <td className="stats-cell">
                            {isSuccess && stats ? (
                              <div className="stats-pills-list">
                                {stats.emails > 0 && <span className="stat-pill">✉️ {stats.emails} Email</span>}
                                {stats.phone_numbers > 0 && <span className="stat-pill">📞 {stats.phone_numbers} Phone</span>}
                                {stats.linkedin_profiles > 0 && <span className="stat-pill">🔗 {stats.linkedin_profiles} LinkedIn</span>}
                                {stats.github_profiles > 0 && <span className="stat-pill">🐙 {stats.github_profiles} GitHub</span>}
                                {stats.total_masked === 0 && <span className="stat-pill neutral">Clean / No PII Found</span>}
                              </div>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isSuccess && result.download_url ? (
                              <button
                                type="button"
                                className="voltare-btn download-single-btn"
                                onClick={() => handleDownloadSingle(result)}
                                title={`Download ${result.masked_filename}`}
                              >
                                📥 Download
                              </button>
                            ) : (
                              <span className="disabled-action">Unavailable</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
