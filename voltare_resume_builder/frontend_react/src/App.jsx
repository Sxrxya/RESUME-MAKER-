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
import ModeSwitcher from './components/ModeSwitcher';
import FlexiblePersonalInfo from './components/flexible_form/FlexiblePersonalInfo';
import FlexibleSummary from './components/flexible_form/FlexibleSummary';
import FlexibleEducation from './components/flexible_form/FlexibleEducation';
import FlexibleProjects from './components/flexible_form/FlexibleProjects';
import FlexibleSkills from './components/flexible_form/FlexibleSkills';
import FlexibleExperience from './components/flexible_form/FlexibleExperience';
import FlexibleCertifications from './components/flexible_form/FlexibleCertifications';
import FlexibleCustomSection from './components/flexible_form/FlexibleCustomSection';
import FlexibleResumePreview from './components/FlexibleResumePreview';
import FlexibleExportPanel from './components/FlexibleExportPanel';
import {
  EMPTY_FORM_DATA,
  SAMPLE_CANDIDATE_DATA,
  LIMITS,
  toStructuredData,
  estimateLines,
  CHARS_PER_LINE
} from './constants/limits';
import {
  SAMPLE_FLEXIBLE_DATA,
  SAMPLE_NON_TECH_DATA,
  EMPTY_FLEXIBLE_DATA,
  FLEXIBLE_LIMITS
} from './constants/flexibleLimits';
import { validateFlexibleResume } from './utils/flexibleValidation';
import {
  isValidEmail,
  isValidPhone,
  isValidLinkedIn,
  isTemplatePlaceholder,
} from './utils/contactValidation';

const STORAGE_KEYS = {
  mode: 'voltare_mode_v1',
  standard: 'voltare_standard_v1',
  tech: 'voltare_tech_v1',
  nontech: 'voltare_nontech_v1',
};

function loadSavedState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return typeof fallback === 'function' ? fallback() : fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : (typeof fallback === 'function' ? fallback() : fallback);
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

function loadSavedMode() {
  try {
    const m = localStorage.getItem(STORAGE_KEYS.mode);
    return m === 'standard' || m === 'flexible' || m === 'non_technical' ? m : 'standard';
  } catch {
    return 'standard';
  }
}

export default function App() {
  const [resumeMode, setResumeMode] = useState(loadSavedMode); // 'standard' | 'flexible' | 'non_technical'
  const [formData, setFormData] = useState(() => loadSavedState(STORAGE_KEYS.standard, () => ({ ...EMPTY_FORM_DATA })));
  const [technicalData, setTechnicalData] = useState(() => loadSavedState(STORAGE_KEYS.tech, () => ({ ...SAMPLE_FLEXIBLE_DATA })));
  const [nonTechData, setNonTechData] = useState(() => loadSavedState(STORAGE_KEYS.nontech, () => ({ ...SAMPLE_NON_TECH_DATA })));
  const [isStandardOverflowing, setIsStandardOverflowing] = useState(false);
  const [isFlexibleOverflowing, setIsFlexibleOverflowing] = useState(false);
  const isNonTech = resumeMode === 'non_technical';
  const flexibleData = isNonTech ? nonTechData : technicalData;
  const setFlexibleData = isNonTech ? setNonTechData : setTechnicalData;
  const [activeTab, setActiveTab] = useState('personal');
  const [activeFlexTab, setActiveFlexTab] = useState('personal');
  const [mobileView, setMobileView] = useState('form'); // 'form' or 'preview'
  const [watermarkBase64, setWatermarkBase64] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Persist all 3 modes & active mode to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.mode, resumeMode); } catch {}
  }, [resumeMode]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.standard, JSON.stringify(formData)); } catch {}
  }, [formData]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.tech, JSON.stringify(technicalData)); } catch {}
  }, [technicalData]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.nontech, JSON.stringify(nonTechData)); } catch {}
  }, [nonTechData]);

  // Flexible validation & 1-page budget analysis
  const flexibleValidation = validateFlexibleResume(flexibleData);

  // Flexible section completion status
  const flexSectionStatus = {
    personal: Boolean(
      flexibleData.personal?.first_name?.trim() &&
      !isTemplatePlaceholder(flexibleData.personal.first_name) &&
      flexibleData.personal?.last_name?.trim() &&
      !isTemplatePlaceholder(flexibleData.personal.last_name) &&
      isValidEmail(flexibleData.personal?.email) &&
      isValidPhone(flexibleData.personal?.phone) &&
      (!flexibleData.personal?.linkedin?.trim() || isValidLinkedIn(flexibleData.personal.linkedin)) &&
      flexibleData.personal?.city_state?.trim() &&
      !isTemplatePlaceholder(flexibleData.personal.city_state)
    ),
    summary: Boolean(
      flexibleData.summary?.trim() &&
      flexibleData.summary.trim().length >= FLEXIBLE_LIMITS.summaryMinChars
    ),
    education: Boolean(
      (flexibleData.education || []).filter(
        e => e.institution?.trim() && !isTemplatePlaceholder(e.institution) &&
             e.degree?.trim() && !isTemplatePlaceholder(e.degree) &&
             e.grad_date?.trim() && !isTemplatePlaceholder(e.grad_date)
      ).length >= 3
    ),
    projects: Boolean(
      (flexibleData.projects || []).filter(p => p.title?.trim() && p.bullet_1?.trim()).length >= 1
    ),
    skills: Boolean(
      flexibleData.skills?.languages?.trim() ||
      flexibleData.skills?.frameworks?.trim() ||
      flexibleData.skills?.tools_cloud?.trim() ||
      flexibleData.skills?.concepts?.trim()
    ),
    experience: Boolean((flexibleData.experience || []).length > 0),
    certifications: Boolean(flexibleData.certifications?.trim()),
    custom: Boolean(flexibleData.custom_section?.title?.trim()),
  };

  const flexibleTabs = [
    { id: 'personal', label: '👤 Personal', completed: flexSectionStatus.personal },
    { id: 'summary', label: '📝 Summary', completed: flexSectionStatus.summary },
    { id: 'education', label: '🎓 Education', completed: flexSectionStatus.education },
    { id: 'projects', label: '🚀 Projects', completed: flexSectionStatus.projects },
    { id: 'skills', label: '🛠️ Skills', completed: flexSectionStatus.skills },
    { id: 'experience', label: '💼 Experience', completed: flexSectionStatus.experience },
    { id: 'certifications', label: '🏆 Certifications', completed: flexSectionStatus.certifications },
    { id: 'custom', label: '✨ Custom Section', completed: flexSectionStatus.custom },
  ];

  // Compute standard section completion status (matching Mode 2 & 3 behavior)
  const sectionStatus = {
    personal: Boolean(
      formData.first_name?.trim() &&
      formData.second_name?.trim() &&
      formData.city_country?.trim() &&
      isValidLinkedIn(formData.linkedin_url) &&
      isValidPhone(formData.phone) &&
      isValidEmail(formData.email)
    ),
    summary: Boolean(
      formData.summary?.trim() &&
      formData.skills?.trim() &&
      formData.summary.length <= 560 &&
      formData.skills.length <= 180
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
      formData.res_1_b1?.trim()
    ),
    experience: Boolean(
      formData.exp_1_company?.trim() &&
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

  const hasStandardContent = () => Object.values(formData).some(v => typeof v === 'string' && v.trim() !== '');
  const hasFlexibleContent = () => Boolean(
    flexibleData.personal?.first_name?.trim() ||
    flexibleData.personal?.email?.trim() ||
    flexibleData.summary?.trim()
  );

  // Load official reference data
  const handleLoadOfficialData = () => {
    if (hasStandardContent() && !window.confirm("Replace your current Standard form entries with the Full Sample?")) return;
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
    if (hasStandardContent() && !window.confirm("Clear all fields in the Standard Resume form? This cannot be undone.")) return;
    setFormData({ ...EMPTY_FORM_DATA });
    setToastMessage("🧹 Form cleared. Start entering your details!");
  };

  // Update a single flexible section
  const handleFlexibleSectionChange = (section, value) => {
    setFlexibleData((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  // Load Fresher Preset (0 Experience, rich projects & skills)
  const handleLoadFresherData = () => {
    setFlexibleData({
      personal: {
        first_name: "Sneha",
        last_name: "Kulkarni",
        email: "sneha.kulkarni@email.com",
        phone: "+91 91234 56789",
        city_state: "Pune, Maharashtra",
        linkedin: "linkedin.com/in/snehakulkarni",
        portfolio: "github.com/snehakulkarni"
      },
      summary: "Motivated Computer Science graduate with hands-on expertise in developing high-throughput web applications, algorithmic optimization, and backend architectures. Proficient in Python, JavaScript, and cloud databases. Eager to contribute clean code, problem-solving skills, and rapid adaptability to collaborative software development teams.",
      skills: {
        languages: "Python, JavaScript, TypeScript, C++, SQL",
        frameworks: "React, Vite, Node.js, FastAPI, Express.js",
        tools_cloud: "Docker, Git, PostgreSQL, MongoDB, Redis, Linux",
        concepts: "Object-Oriented Design, RESTful APIs, Data Structures & Algorithms, CI/CD"
      },
      education: [
        {
          institution: "Pune Institute of Computer Technology (PICT)",
          location: "Pune, India",
          degree: "Bachelor of Engineering in Information Technology",
          grad_date: "2020 – 2024",
          gpa: "CGPA: 9.1 / 10",
          highlights: "Coursework: Database Management Systems, Computer Networks, Cloud Computing"
        },
        {
          institution: "Modern Junior College",
          location: "Pune, India",
          degree: "Higher Secondary Certificate (HSC - Science)",
          grad_date: "2018 – 2020",
          gpa: "Score: 94.2%",
          highlights: "Distinction in Mathematics and Physics; School Science Club Secretary"
        },
        {
          institution: "Abhinava Vidyalaya English Medium High School",
          location: "Pune, India",
          degree: "Secondary School Certificate (SSC - Class X)",
          grad_date: "2018",
          gpa: "Score: 96.0%",
          highlights: "Merit Rank in Mathematics Olympiad"
        }
      ],
      projects: [
        {
          title: "Intelligent Document Querying & Summarization Engine",
          tech_stack: "Python, FastAPI, LangChain, FAISS, Streamlit",
          role_or_org: "Undergraduate Capstone Project",
          date_range: "Aug 2023 – Apr 2024",
          bullet_1: "Developed a vector-search document retrieval system processing PDF and DOCX files with sub-second semantic search latency.",
          bullet_2: "Integrated conversational summarization pipelines reducing manual document analysis time by 65% for research teams.",
          link: "github.com/snehakulkarni/doc-query"
        },
        {
          title: "Real-Time Microservices Financial Tracker",
          tech_stack: "React, Node.js, Express, PostgreSQL, Docker",
          role_or_org: "Personal Engineering Project",
          date_range: "Dec 2023 – Feb 2024",
          bullet_1: "Engineered secure RESTful endpoints with JWT authentication and role-based access for multi-currency expense management.",
          bullet_2: "Optimized complex SQL aggregation queries using composite indexes, cutting database response times by 35%.",
          link: "github.com/snehakulkarni/fin-tracker"
        }
      ],
      experience: [], // 0 experience! Pure fresher case
      certifications: "Winner - Smart Pune Hackathon 2023, HackerRank 5-Star Python Certification",
      custom_section: {
        title: "Leadership & Extra-Curricular Activities",
        subhead_1: {
          title: "Lead Organizer, National Tech Symposium",
          subtitle_or_date: "2023 – 2024",
          bullet_1: "Spearheaded planning and execution for an inter-college symposium hosting 1,200+ attendees and 18 technical challenges.",
          bullet_2: "Coordinated corporate outreach, securing industry partnerships and workshop sponsorships."
        },
        subhead_2: {
          title: "Core Member, Open Source Student Society",
          subtitle_or_date: "2022 – 2023",
          bullet_1: "Conducted hands-on workshops introducing 150+ students to Git, GitHub, and open-source contribution workflows.",
          bullet_2: "Organized bi-weekly coding competitions and collaborative hackathon preparation tracks."
        }
      }
    });
    setToastMessage("🎓 Loaded Fresher Preset! Notice how 0 experience automatically auto-expands to fill the page.");
  };

  // Load Experienced Preset
  const handleLoadExperiencedData = () => {
    setFlexibleData({ ...SAMPLE_FLEXIBLE_DATA });
    setToastMessage("💼 Loaded Experienced Preset with internships & projects!");
  };

  // Load Non-Technical & Business Preset (Consulting, Finance, Marketing, Operations)
  const handleLoadNonTechnicalData = () => {
    setNonTechData({ ...SAMPLE_NON_TECH_DATA });
    setToastMessage("💼 Loaded Non-Technical & Business Preset! Tailored for business, finance, and operations.");
  };

  // Clear flexible form
  const handleClearFlexibleForm = () => {
    if (hasFlexibleContent() && !window.confirm("Clear all fields in this resume form? This cannot be undone.")) return;
    setFlexibleData({ ...EMPTY_FLEXIBLE_DATA });
    setToastMessage("🧹 Flexible form cleared. Start adding your details!");
  };

  // Download flexible PDF likewise Mode 1 (generates high-res single-page PDF via backend or direct print)
  const [isGeneratingFlexiblePdf, setIsGeneratingFlexiblePdf] = useState(false);
  const standardLayoutRef = useRef(null);
  const flexibleLayoutRef = useRef(null);

  const handleDownloadFlexiblePdf = async () => {
    setIsGeneratingFlexiblePdf(true);
    try {
      const response = await fetch('/api/generate-flexible-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: flexibleData,
          layout_overrides: flexibleLayoutRef.current || null,
          is_non_technical: isNonTech,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData?.detail?.errors?.join(' ') || errData?.detail?.message || errData?.detail || 'PDF generation failed.';
        setToastMessage(`⚠️ ${detail}`);
        return;
      }

      const resData = await response.json();
      if (!resData.download_url) {
        setToastMessage('⚠️ PDF generation did not return a download link.');
        return;
      }

      const fileResp = await fetch(resData.download_url);
      if (!fileResp.ok) {
        setToastMessage('⚠️ Failed to download generated PDF file.');
        return;
      }
      const blob = await fileResp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resData.filename || 'Voltare_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setToastMessage('📥 Single-Page PDF downloaded!');
    } catch (err) {
      console.error('PDF download error:', err);
      setToastMessage('⚠️ Could not reach PDF server. Make sure the backend server is running.');
    } finally {
      setIsGeneratingFlexiblePdf(false);
    }
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

    // 3. Education: All 3 entries are mandatory
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

  const handleModeChange = (newMode) => {
    if (newMode === resumeMode) return;
    setResumeMode(newMode);
    if (newMode === 'flexible') {
      setToastMessage("⚡ Switched to Voltare Technical Resume (Engineering, Tech Stack & GitHub)");
    } else if (newMode === 'non_technical') {
      setToastMessage("💼 Switched to Voltare Non-Technical Resume (Business, Finance, Ops & Strategy)");
    } else {
      setToastMessage("📄 Switched to Standard Voltare Resume Format (Official Strict Template)");
    }
  };

  return (
    <div className="app-container">
      {/* Friendly Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Header */}
      <Header />

      {/* Top Mode Selector: Standard vs Flexible */}
      <ModeSwitcher currentMode={resumeMode} onSelectMode={handleModeChange} />

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
          {resumeMode === 'standard' ? (
            /* STANDARD MODE FORM */
            <>
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
                layoutOverridesRef={standardLayoutRef}
                isOverflowing={isStandardOverflowing}
              />
            </>
          ) : (
            /* FLEXIBLE MODE FORM */
            <>
              <h2>✍️ {resumeMode === 'non_technical' ? 'Non-Technical Resume Builder' : 'Technical Resume Builder'}</h2>

              {/* Action buttons */}
              <div className="form-actions-row" style={{ flexWrap: 'wrap' }}>
                {resumeMode === 'non_technical' ? (
                  <>
                    <button
                      type="button"
                      className="voltare-btn"
                      style={{ backgroundColor: '#0369a1', flex: '1 1 200px' }}
                      onClick={handleLoadNonTechnicalData}
                      title="Loads a tailored business, finance, consulting or operations profile"
                    >
                      💼 Business Sample Preset
                    </button>
                    <button
                      type="button"
                      className="voltare-btn"
                      style={{ backgroundColor: '#2e7d32', flex: '1 1 180px' }}
                      onClick={handleLoadFresherData}
                      title="Loads a fresher profile with 0 experience"
                    >
                      🎓 Fresher Preset (0 Exp)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="voltare-btn"
                      style={{ backgroundColor: '#2e7d32', flex: '1 1 200px' }}
                      onClick={handleLoadFresherData}
                      title="Loads a fresher profile with 0 experience, 2 projects, and auto-expanded spacing"
                    >
                      🎓 Fresher Preset (0 Exp)
                    </button>
                    <button
                      type="button"
                      className="voltare-btn"
                      style={{ backgroundColor: '#2a6f97', flex: '1 1 180px' }}
                      onClick={handleLoadExperiencedData}
                      title="Loads an experienced candidate profile with internship and projects"
                    >
                      💻 Tech Experienced Preset
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="voltare-btn secondary"
                  style={{ flex: '0 1 110px' }}
                  onClick={handleClearFlexibleForm}
                >
                  🧹 Clear
                </button>
              </div>

              <div className="panel-subnote">
                Modular layout. Professional Summary requires <strong>150+ chars</strong>. Freshers can leave Experience at 0 without penalty.
              </div>

              {/* Flexible Form Tabs */}
              <Tabs
                tabs={flexibleTabs}
                activeTab={activeFlexTab}
                onChange={setActiveFlexTab}
              />

              {/* Flexible Tab Panels */}
              {activeFlexTab === 'personal' && (
                <FlexiblePersonalInfo
                  personal={flexibleData.personal}
                  onChange={(val) => handleFlexibleSectionChange('personal', val)}
                />
              )}
              {activeFlexTab === 'summary' && (
                <FlexibleSummary
                  summary={flexibleData.summary}
                  onChange={(val) => handleFlexibleSectionChange('summary', val)}
                />
              )}
              {activeFlexTab === 'education' && (
                <FlexibleEducation
                  education={flexibleData.education}
                  onChange={(val) => handleFlexibleSectionChange('education', val)}
                />
              )}
              {activeFlexTab === 'projects' && (
                <FlexibleProjects
                  projects={flexibleData.projects}
                  isNonTechnical={resumeMode === 'non_technical'}
                  onChange={(val) => handleFlexibleSectionChange('projects', val)}
                />
              )}
              {activeFlexTab === 'skills' && (
                <FlexibleSkills
                  skills={flexibleData.skills}
                  isNonTechnical={resumeMode === 'non_technical'}
                  onChange={(val) => handleFlexibleSectionChange('skills', val)}
                />
              )}
              {activeFlexTab === 'experience' && (
                <FlexibleExperience
                  experience={flexibleData.experience}
                  onChange={(val) => handleFlexibleSectionChange('experience', val)}
                />
              )}
              {activeFlexTab === 'certifications' && (
                <FlexibleCertifications
                  certifications={flexibleData.certifications}
                  onChange={(val) => handleFlexibleSectionChange('certifications', val)}
                />
              )}
              {activeFlexTab === 'custom' && (
                <FlexibleCustomSection
                  customSection={flexibleData.custom_section}
                  onChange={(val) => handleFlexibleSectionChange('custom_section', val)}
                />
              )}

              {/* Flexible Progress & Export Panel */}
              <FlexibleExportPanel
                validation={flexibleValidation}
                sectionStatus={flexSectionStatus}
                onNavigateTab={setActiveFlexTab}
                onDownloadPdf={handleDownloadFlexiblePdf}
                isGeneratingPdf={isGeneratingFlexiblePdf}
                isOverflowing={isFlexibleOverflowing}
              />
            </>
          )}
        </section>

        {/* RIGHT PANEL: Live Resume Preview */}
        <section className={`right-panel ${mobileView !== 'preview' ? 'hidden-mobile' : ''}`}>
          {resumeMode === 'standard' ? (
            <>
              <h2>📄 Standard Voltare Resume Format</h2>
              <div className="panel-subnote">
                Official Voltare template with fixed coordinates and calibrated styling.
              </div>
              <LiveResumePreview
                data={formData}
                watermarkBase64={watermarkBase64}
                onLayoutComputed={(layout) => { standardLayoutRef.current = layout; }}
                onOverflowChange={setIsStandardOverflowing}
              />
            </>
          ) : (
            <>
              <h2>📄 Live Flexible Resume Preview</h2>
              <div className="panel-subnote">
                Dynamic auto-fill layout. Automatically expands for freshers or squeezes for experienced profiles.
              </div>
              <FlexibleResumePreview
                data={flexibleData}
                watermarkBase64={watermarkBase64}
                isNonTechnical={isNonTech}
                onLayoutComputed={(layout) => { flexibleLayoutRef.current = layout; }}
                onOverflowChange={setIsFlexibleOverflowing}
              />
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
