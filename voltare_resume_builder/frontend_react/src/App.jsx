import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Tabs from './components/Tabs';
import Toast from './components/Toast';
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
  const [mobileView, setMobileView] = useState('form'); // 'form' or 'preview'
  const [watermarkBase64, setWatermarkBase64] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Compute section completion status for friendly notifications & badges
  const sectionStatus = {
    personal: Boolean(
      formData.first_name?.trim() &&
      formData.second_name?.trim() &&
      formData.city_country?.trim() &&
      formData.linkedin_url?.trim() &&
      formData.phone?.trim() &&
      formData.email?.trim()
    ),
    summary: Boolean(
      formData.summary?.trim() &&
      formData.skills?.trim() &&
      estimateLines(formData.summary) <= 5 &&
      estimateLines(formData.skills) <= 2
    ),
    education: Boolean(
      formData.edu_1_university?.trim() &&
      formData.edu_1_city?.trim() &&
      formData.edu_1_program?.trim() &&
      formData.edu_1_date?.trim()
    ),
    research: Boolean(
      formData.res_1_title?.trim() &&
      formData.res_1_org?.trim() &&
      formData.res_1_start?.trim() &&
      formData.res_1_end?.trim() &&
      formData.res_1_b1?.trim() &&
      formData.res_1_b2?.trim()
    ),
    experience: Boolean(
      formData.exp_1_company?.trim() &&
      formData.exp_1_domain?.trim() &&
      formData.exp_1_role?.trim() &&
      formData.exp_1_start?.trim() &&
      formData.exp_1_end?.trim() &&
      formData.exp_1_b1?.trim()
    ),
    achievements: Boolean(
      formData.awards?.trim() ||
      formData.leadership_1?.trim() ||
      formData.leadership_2?.trim() ||
      formData.achievement?.trim() ||
      formData.community_1?.trim() ||
      formData.community_2?.trim() ||
      formData.interests?.trim()
    ),
  };

  // Section completion friendly names
  const sectionNames = {
    personal: 'Personal Information',
    summary: 'Professional Summary',
    education: 'Education Details',
    research: 'Project 1 (Compulsory)',
    experience: 'Professional Experience',
    achievements: 'Achievements & Leadership',
  };

  // Trigger celebration toast whenever a section is freshly completed
  const prevStatusRef = useRef(sectionStatus);
  useEffect(() => {
    const prev = prevStatusRef.current;
    for (const [secKey, isComplete] of Object.entries(sectionStatus)) {
      if (!prev[secKey] && isComplete) {
        setToastMessage(`🎉 Great work! ${sectionNames[secKey]} is complete!`);
        break;
      }
    }
    prevStatusRef.current = sectionStatus;
  }, [sectionStatus]);

  // Main Form Tabs with completion status indicator
  const formTabs = [
    { id: 'personal', label: '👤 Personal', completed: sectionStatus.personal },
    { id: 'summary', label: '📝 Summary', completed: sectionStatus.summary },
    { id: 'education', label: '🎓 Education', completed: sectionStatus.education },
    { id: 'research', label: '🔬 Research', completed: sectionStatus.research },
    { id: 'experience', label: '💼 Experience', completed: sectionStatus.experience },
    { id: 'achievements', label: '🏆 Achievements', completed: sectionStatus.achievements },
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
    setToastMessage("📋 Loaded official template data successfully!");
  };

  // Keep candidate's entered information and fill in all remaining empty sections with official template data
  const handleFillRemainingWithTemplate = () => {
    setFormData((prev) => {
      const merged = { ...SAMPLE_CANDIDATE_DATA };
      // Preserve any non-empty fields user already filled
      Object.keys(prev).forEach((key) => {
        if (prev[key] && String(prev[key]).trim() !== '') {
          merged[key] = prev[key];
        }
      });
      // If user typed personal details but phone was left blank, provide a clean default
      if (!merged.phone || !merged.phone.trim()) {
        merged.phone = "+91 98765 43210";
      }
      return merged;
    });
    setToastMessage("🪄 Kept your info & filled remaining sections with official Voltare template!");
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({ ...EMPTY_FORM_DATA });
    setToastMessage("🧹 Form cleared. Start entering your details!");
  };

  // Client-side validation ensuring Project 1 is compulsory and Projects 2 & 3 are optional
  const runClientValidation = useCallback((data) => {
    const char_errors = [];
    const layout_errors = [];

    // 1. Personal Info
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
    const summaryLines = estimateLines(data.summary || '');
    if (summaryLines > 5) {
      const excess = summaryLines - 5;
      layout_errors.push(`Professional Summary: Exceeds limit by ${excess} line(s). Please shorten by ~${excess * CHARS_PER_LINE} characters.`);
    }
    const skillsLines = estimateLines(data.skills || '');
    if (skillsLines > 2) {
      const excess = skillsLines - 2;
      layout_errors.push(`Skills: Exceeds maximum 2 line(s). Please shorten by ~${excess * CHARS_PER_LINE} characters.`);
    }

    // 3. Education: Entry 1 required, 2 & 3 optional
    const edu = LIMITS.education.entry_fields;
    for (let i = 1; i <= 3; i++) {
      const hasContent = Boolean(
        data[`edu_${i}_university`]?.trim() ||
        data[`edu_${i}_city`]?.trim() ||
        data[`edu_${i}_program`]?.trim() ||
        data[`edu_${i}_date`]?.trim()
      );

      if (i === 1 || hasContent) {
        for (const [field, conf] of Object.entries(edu)) {
          const val = data[`edu_${i}_${field}`] || '';
          if (conf.required && !val.trim()) {
            char_errors.push({ field: `edu_${i}_${field}`, message: `${conf.label} is required`, section: `Education Entry ${i}` });
          }
          if (val.length > conf.max_chars) {
            char_errors.push({ field: `edu_${i}_${field}`, message: `Exceeds ${conf.max_chars} character limit`, section: `Education Entry ${i}` });
          }
        }
      }
    }

    // 4. Research Projects: Project 1 compulsory; Projects 2 & 3 optional
    const res = LIMITS.research_projects.entry_fields;
    for (let i = 1; i <= 3; i++) {
      const hasContent = Boolean(
        data[`res_${i}_title`]?.trim() ||
        data[`res_${i}_org`]?.trim() ||
        data[`res_${i}_b1`]?.trim()
      );

      if (i === 1 || hasContent) {
        for (const [field, conf] of Object.entries(res)) {
          const val = data[`res_${i}_${field}`] || '';
          if (conf.required && !val.trim()) {
            char_errors.push({ field: `res_${i}_${field}`, message: `${conf.label} is required`, section: `Research Project ${i}` });
          }
          if (val.length > conf.max_chars) {
            char_errors.push({ field: `res_${i}_${field}`, message: `Exceeds ${conf.max_chars} character limit`, section: `Research Project ${i}` });
          }
        }
      }
    }

    // 5. Professional Experience
    const expEntries = LIMITS.professional_experience.entries;
    for (let i = 1; i <= 3; i++) {
      const entryConfig = expEntries[i - 1];
      const fields = entryConfig.fields;
      const hasContent = Boolean(data[`exp_${i}_company`]?.trim() || data[`exp_${i}_role`]?.trim() || data[`exp_${i}_b1`]?.trim());

      if (i === 1 || hasContent) {
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

    return {
      is_valid: char_errors.length === 0 && layout_errors.length === 0,
      char_errors,
      layout_errors,
    };
  }, []);

  // Keep backend validated in sync
  useEffect(() => {
    const timer = setTimeout(() => {
      const structured = toStructuredData(formData);
      fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: structured }),
      }).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [formData]);

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
      {/* Friendly Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Header */}
      <Header />

      {/* Mobile/Tablet View Switcher */}
      <div className="mobile-view-switcher">
        <button
          type="button"
          className={`mobile-toggle-btn ${mobileView === 'form' ? 'active' : ''}`}
          onClick={() => setMobileView('form')}
        >
          ✏️ Edit Information
        </button>
        <button
          type="button"
          className={`mobile-toggle-btn ${mobileView === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileView('preview')}
        >
          📄 Live Resume Preview
        </button>
      </div>

      {/* Main Two-Panel Responsive Layout */}
      <main className="main-layout">
        {/* LEFT PANEL: Candidate Input Form */}
        <section className={`left-panel ${mobileView !== 'form' ? 'hidden-mobile' : ''}`}>
          <h2>✍️ Candidate Information</h2>

          {/* Action buttons */}
          <div className="form-actions-row" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="voltare-btn"
              style={{ backgroundColor: '#2a6f97', flex: '1 1 200px' }}
              onClick={handleFillRemainingWithTemplate}
              title="Preserves what you typed (name, contacts) and fills empty sections with template data so your resume looks full immediately"
            >
              🪄 Keep My Info & Fill Rest
            </button>
            <button
              type="button"
              className="voltare-btn"
              style={{ flex: '1 1 180px' }}
              onClick={handleLoadOfficialData}
            >
              📋 Load Full Sample
            </button>
            <button
              type="button"
              className="voltare-btn secondary"
              style={{ flex: '0 1 120px' }}
              onClick={handleClearForm}
            >
              🧹 Clear
            </button>
          </div>

          <div className="panel-subnote">
            Fill in the required fields marked with{' '}
            <span style={{ color: '#e63946' }}>🔴</span>. Character limits ensure clean single-page formatting.
          </div>

          {/* Form Tabs with completion checkmarks */}
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

          {/* Friendly Progress & Export Section */}
          <ValidationExport
            formData={formData}
            sectionStatus={sectionStatus}
            onNavigateTab={setActiveTab}
            onDownloadHtml={handleDownloadHtml}
          />
        </section>

        {/* RIGHT PANEL: Live Resume Preview */}
        <section className={`right-panel ${mobileView !== 'preview' ? 'hidden-mobile' : ''}`}>
          <h2>📄 Live Resume Preview</h2>
          <div className="panel-subnote">
            Updates in real-time as you type. Your downloaded PDF will match this layout exactly.
          </div>

          <LiveResumePreview data={formData} watermarkBase64={watermarkBase64} />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
