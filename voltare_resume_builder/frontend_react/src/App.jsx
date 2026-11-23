import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Tabs from './components/Tabs';
import PersonalInfo from './components/form/PersonalInfo';
import ProfessionalSummary from './components/form/ProfessionalSummary';
import Education from './components/form/Education';
import ResearchProjects from './components/form/ResearchProjects';
import ProfessionalExperience from './components/form/ProfessionalExperience';
import AchievementsLeadership from './components/form/AchievementsLeadership';
import ValidationExport from './components/ValidationExport';
import LiveResumePreview from './components/LiveResumePreview';
import {
  EMPTY_FORM_DATA,
  SAMPLE_CANDIDATE_DATA,
  LIMITS,
  toStructuredData,
  estimateLines,
  CHARS_PER_LINE
} from './constants/limits';

export default function App() {
  const [formData, setFormData] = useState(() => ({ ...EMPTY_FORM_DATA }));
  const [activeTab, setActiveTab] = useState('personal');
  const [validation, setValidation] = useState({
    is_valid: false,
    char_errors: [],
    layout_errors: [],
  });
  const [watermarkBase64, setWatermarkBase64] = useState('');

  // Main Form Tabs
  const formTabs = [
    { id: 'personal', label: '👤 Personal' },
    { id: 'summary', label: '📝 Summary' },
    { id: 'education', label: '🎓 Education' },
    { id: 'research', label: '🔬 Research' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'achievements', label: '🏆 Achievements' },
  ];

  // Fetch initial config and watermark from backend if available
  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((config) => {
        if (config && config.watermark_base64) {
          setWatermarkBase64(config.watermark_base64);
        }
      })
      .catch((err) => {
        console.log('Backend config fetch note:', err.message);
      });
  }, []);

  // Update a single form field
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load official reference data
  const handleLoadOfficialData = () => {
    setFormData({ ...SAMPLE_CANDIDATE_DATA });
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({ ...EMPTY_FORM_DATA });
  };

  // Client-side instant validation engine mirroring backend logic
  const runClientValidation = useCallback((data) => {
    const char_errors = [];
    const layout_errors = [];

    // 1. Required fields & character limits for Personal Info
    const p = LIMITS.personal;
    for (const [key, conf] of Object.entries(p)) {
      const val = data[key] || '';
      if (conf.required && !val.trim()) {
        char_errors.push({ field: key, message: `${conf.label} is required`, section: 'Personal Information' });
      }
      if (val.length > conf.max_chars) {
        char_errors.push({ field: key, message: `Exceeds ${conf.max_chars} character limit`, section: 'Personal Information' });
      }
    }

    // 2. Professional Summary
    const ps = LIMITS.professional_summary;
    for (const [key, conf] of Object.entries(ps)) {
      const val = data[key] || '';
      if (conf.required && !val.trim()) {
        char_errors.push({ field: key, message: `${conf.label} is required`, section: 'Professional Summary' });
      }
      if (val.length > conf.max_chars) {
        char_errors.push({ field: key, message: `Exceeds ${conf.max_chars} character limit`, section: 'Professional Summary' });
      }
    }
    // Summary line count
    const summaryLines = estimateLines(data.summary || '');
    if (summaryLines > 5) {
      const excess = summaryLines - 5;
      layout_errors.push(`Professional Summary: Exceeds limit by ${excess} line(s). Please shorten by approximately ${excess * CHARS_PER_LINE} characters.`);
    }
    // Skills line count
    const skillsLines = estimateLines(data.skills || '');
    if (skillsLines > 2) {
      const excess = skillsLines - 2;
      layout_errors.push(`Skills: Exceeds maximum 2 line(s). Please shorten by approximately ${excess * CHARS_PER_LINE} characters.`);
    }

    // 3. Education
    const edu = LIMITS.education.entry_fields;
    for (let i = 1; i <= 3; i++) {
      for (const [field, conf] of Object.entries(edu)) {
        const val = data[`edu_${i}_${field}`] || '';
        if (conf.required && !val.trim()) {
          char_errors.push({ field: `edu_${i}_${field}`, message: `${conf.label} is required`, section: `Education Entry ${i}` });
        }
        if (val.length > conf.max_chars) {
          char_errors.push({ field: `edu_${i}_${field}`, message: `Exceeds ${conf.max_chars} character limit`, section: `Education Entry ${i}` });
        }
      }
      const courses = (data[`edu_${i}_courses`] || '').trim();
      if (courses.length > 85) {
        layout_errors.push(`Education Entry ${i}: Relevant courses exceeds limit by ${courses.length - 85} character(s) (Max 85 characters).`);
      }
    }

    // 4. Research Projects
    const res = LIMITS.research_projects.entry_fields;
    for (let i = 1; i <= 3; i++) {
      for (const [field, conf] of Object.entries(res)) {
        const val = data[`res_${i}_${field}`] || '';
        if (conf.required && !val.trim()) {
          char_errors.push({ field: `res_${i}_${field}`, message: `${conf.label} is required`, section: `Research Entry ${i}` });
        }
        if (val.length > conf.max_chars) {
          char_errors.push({ field: `res_${i}_${field}`, message: `Exceeds ${conf.max_chars} character limit`, section: `Research Entry ${i}` });
        }
      }
      for (const bNum of [1, 2]) {
        const bullet = (data[`res_${i}_b${bNum}`] || '').trim();
        const bLines = estimateLines(bullet);
        if (bLines > 3) {
          const excess = bLines - 3;
          layout_errors.push(`Research Project ${i} (Bullet ${bNum}): Exceeds 3-line limit. Please shorten by approximately ${excess * CHARS_PER_LINE} characters.`);
        }
      }
    }

    // 5. Professional Experience
    const expEntries = LIMITS.professional_experience.entries;
    for (let i = 1; i <= 3; i++) {
      const entryConfig = expEntries[i - 1];
      const fields = entryConfig.fields;
      for (const [field, conf] of Object.entries(fields)) {
        let val = '';
        if (field.startsWith('bullet_')) {
          const bNum = field.split('_')[1];
          val = data[`exp_${i}_b${bNum}`] || '';
        } else {
          val = data[`exp_${i}_${field}`] || '';
        }

        if (conf.required && !val.trim()) {
          char_errors.push({ field: `exp_${i}_${field}`, message: `${conf.label} is required`, section: `Experience Entry ${i}` });
        }
        if (val.length > conf.max_chars) {
          char_errors.push({ field: `exp_${i}_${field}`, message: `Exceeds ${conf.max_chars} character limit`, section: `Experience Entry ${i}` });
        }
      }

      for (let b = 1; b <= entryConfig.num_bullets; b++) {
        const bullet = (data[`exp_${i}_b${b}`] || '').trim();
        const bLines = estimateLines(bullet);
        if (bLines > 3) {
          const excess = bLines - 3;
          layout_errors.push(`Professional Experience ${i} (Bullet ${b}): Exceeds 3-line limit. Please shorten by approximately ${excess * CHARS_PER_LINE} characters.`);
        }
      }
    }

    // 6. Achievements & Leadership
    const ach = LIMITS.achievements_leadership;
    for (const [key, conf] of Object.entries(ach)) {
      const val = data[key] || '';
      if (val.length > conf.max_chars) {
        char_errors.push({ field: key, message: `Exceeds ${conf.max_chars} character limit`, section: 'Achievements & Leadership' });
      }
    }

    for (const fieldName of ['leadership_1', 'leadership_2', 'community_1', 'community_2']) {
      const val = (data[fieldName] || '').trim();
      const lines = estimateLines(val);
      if (lines > 3) {
        const excess = lines - 3;
        const label = fieldName.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        layout_errors.push(`Achievements & Leadership (${label}): Exceeds line budget. Please shorten by approximately ${excess * CHARS_PER_LINE} characters.`);
      }
    }

    return {
      is_valid: char_errors.length === 0 && layout_errors.length === 0,
      char_errors,
      layout_errors,
    };
  }, []);

  // Run validation whenever form data changes
  useEffect(() => {
    // 1. Instant client-side validation
    const clientVal = runClientValidation(formData);
    setValidation(clientVal);

    // 2. Validate with backend API for exact engine synchronization
    const timer = setTimeout(() => {
      const structured = toStructuredData(formData);
      fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: structured }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((serverVal) => {
          if (serverVal) {
            setValidation({
              is_valid: serverVal.is_valid,
              char_errors: serverVal.char_errors || [],
              layout_errors: serverVal.layout_errors || [],
            });
          }
        })
        .catch(() => {
          // If server is not responding, client validation remains active
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [formData, runClientValidation]);

  // Handle fallback HTML download
  const handleDownloadHtml = async () => {
    const structured = toStructuredData(formData);
    try {
      const response = await fetch('/api/download-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: structured }),
      });

      if (!response.ok) throw new Error('HTML export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const firstName = formData.first_name || 'Candidate';
      const secondName = formData.second_name || '';
      a.href = url;
      a.download = `Voltare_Resume_${firstName}_${secondName}.html`.replace(/\s+/g, '_');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('HTML download error:', e);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header />

      {/* Main Two-Panel Layout */}
      <main className="main-layout">
        {/* LEFT PANEL: Candidate Input Form */}
        <section className="left-panel">
          <h2>✍️ Candidate Information</h2>

          {/* Action buttons: Load Official Data / Clear */}
          <div className="form-actions-row">
            <button
              type="button"
              className="voltare-btn"
              onClick={handleLoadOfficialData}
            >
              📋 Load Official Template Data
            </button>
            <button
              type="button"
              className="voltare-btn secondary"
              onClick={handleClearForm}
            >
              🧹 Clear Form
            </button>
          </div>

          <div className="panel-subnote">
            Fill in all required fields (marked with{' '}
            <span style={{ color: '#e63946' }}>🔴</span>). Character limits are
            strictly enforced.
          </div>

          {/* Form Tabs */}
          <Tabs
            tabs={formTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Form Tab Panels */}
          {activeTab === 'personal' && (
            <PersonalInfo data={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'summary' && (
            <ProfessionalSummary data={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'education' && (
            <Education data={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'research' && (
            <ResearchProjects data={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'experience' && (
            <ProfessionalExperience data={formData} onChange={handleFieldChange} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsLeadership data={formData} onChange={handleFieldChange} />
          )}

          {/* Validation & Export Section */}
          <ValidationExport
            formData={formData}
            validation={validation}
            onDownloadHtml={handleDownloadHtml}
          />
        </section>

        {/* RIGHT PANEL: Live Resume Preview */}
        <section className="right-panel">
          <h2>📄 Live Resume Preview</h2>
          <div className="panel-subnote">
            This preview updates as you type. The exported PDF will match this preview
            exactly.
          </div>

          <LiveResumePreview data={formData} watermarkBase64={watermarkBase64} />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
