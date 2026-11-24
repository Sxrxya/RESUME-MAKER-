import React, { useRef, useState, useEffect } from 'react';
import { validateFlexibleResume } from '../utils/flexibleValidation';

export default function FlexibleResumePreview({ data, watermarkBase64 = "" }) {
  const previewContainerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [spacingBalance, setSpacingBalance] = useState('auto'); // 'auto' | 'spacious' | 'compact'

  // Auto-scale preview sheet to fit device screen width cleanly
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 16;
        const docWidthPx = 596 * (96 / 72); // ~794.67px
        if (containerWidth < docWidthPx && containerWidth > 120) {
          setScale(containerWidth / docWidthPx);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const personal = data.personal || {};
  const firstName = personal.first_name || "YOUR";
  const lastName = personal.last_name || "NAME";
  const fullName = `${firstName} ${lastName}`.trim();

  // Contact line items
  const contactParts = [];
  if (personal.city_state) contactParts.push(<span key="loc">{personal.city_state}</span>);
  if (personal.phone) contactParts.push(<span key="phone">{personal.phone}</span>);
  if (personal.email) {
    contactParts.push(
      <a key="email" href={`mailto:${personal.email}`} style={{ color: '#7D1128', textDecoration: 'none' }}>
        {personal.email}
      </a>
    );
  }
  if (personal.linkedin) {
    const cleanLinkedin = personal.linkedin.replace(/^https?:\/\//, '');
    contactParts.push(
      <a key="li" href={`https://${cleanLinkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7D1128', textDecoration: 'none' }}>
        {cleanLinkedin}
      </a>
    );
  }
  if (personal.portfolio) {
    const cleanPortfolio = personal.portfolio.replace(/^https?:\/\//, '');
    contactParts.push(
      <a key="port" href={`https://${cleanPortfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7D1128', textDecoration: 'none' }}>
        {cleanPortfolio}
      </a>
    );
  }

  // Determine active density mode and auto-fit scaling
  const validation = validateFlexibleResume(data);
  const density = validation.budget?.densityMode || 'balanced';
  const capacity = validation.budget?.capacityPercent || 75;

  // Continuous auto-fill scaling:
  // Dynamically calculates leading, font size, gaps, and padding based on exact content volume
  // So low-content resumes expand to fill 100% of the single page, and dense resumes squeeze gracefully.
  let dynamicFontSize = '13.6px';
  let dynamicLineHeight = 1.22;
  let dynamicItemGap = '7px';
  let dynamicSecGap = '14px';
  let dynamicPadding = '38px 44px';

  if (spacingBalance === 'spacious') {
    dynamicFontSize = '15px';
    dynamicLineHeight = 1.38;
    dynamicItemGap = '12px';
    dynamicSecGap = '24px';
    dynamicPadding = '46px 46px';
  } else if (spacingBalance === 'compact') {
    dynamicFontSize = '12.8px';
    dynamicLineHeight = 1.14;
    dynamicItemGap = '4px';
    dynamicSecGap = '8px';
    dynamicPadding = '32px 40px';
  } else {
    // 'auto' mode: calculates based on content capacity
    if (capacity < 65) {
      dynamicFontSize = '15px';
      dynamicLineHeight = 1.36;
      dynamicItemGap = '12px';
      dynamicSecGap = '24px';
      dynamicPadding = '46px 46px';
    } else if (capacity < 82) {
      dynamicFontSize = '14.2px';
      dynamicLineHeight = 1.28;
      dynamicItemGap = '9px';
      dynamicSecGap = '18px';
      dynamicPadding = '42px 45px';
    } else if (capacity <= 93) {
      dynamicFontSize = '13.6px';
      dynamicLineHeight = 1.20;
      dynamicItemGap = '7px';
      dynamicSecGap = '13px';
      dynamicPadding = '38px 44px';
    } else if (capacity <= 100) {
      dynamicFontSize = '13px';
      dynamicLineHeight = 1.15;
      dynamicItemGap = '5px';
      dynamicSecGap = '9px';
      dynamicPadding = '34px 42px';
    } else {
      dynamicFontSize = '12.4px';
      dynamicLineHeight = 1.10;
      dynamicItemGap = '3px';
      dynamicSecGap = '6px';
      dynamicPadding = '28px 38px';
    }
  }

  // Has at least 1 filled experience?
  const experienceList = (Array.isArray(data.experience) ? data.experience : []).filter(
    exp => exp.company?.trim() || exp.role?.trim() || exp.bullet_1?.trim()
  );
  const hasExperience = experienceList.length > 0;

  // Projects list
  const projectsList = (Array.isArray(data.projects) ? data.projects : []).filter(
    proj => proj.title?.trim() || proj.bullet_1?.trim()
  );

  // Education list
  const educationList = (Array.isArray(data.education) ? data.education : []).filter(
    edu => edu.institution?.trim() || edu.degree?.trim()
  );

  const skills = data.skills || {};
  const hasSkills = Boolean(skills.languages?.trim() || skills.frameworks?.trim() || skills.tools_cloud?.trim() || skills.concepts?.trim());

  // Custom Section
  const customSection = data.custom_section || {};
  const hasCustom = Boolean(
    customSection.title?.trim() &&
    (customSection.subhead_1?.title?.trim() || customSection.subhead_2?.title?.trim())
  );

  return (
    <div className="preview-scaler-wrapper" ref={previewContainerRef}>
      {/* Page Auto-Fit Spacing Controls */}
      <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6D605C', textTransform: 'uppercase', letterSpacing: '1px' }}>
          📐 Page Layout:
        </span>
        <div style={{ display: 'inline-flex', background: '#ffffff', border: '1px solid #E4D9D3', borderRadius: '20px', padding: '2px' }}>
          <button
            type="button"
            onClick={() => setSpacingBalance('auto')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '16px',
              border: 'none',
              background: spacingBalance === 'auto' ? '#7D1128' : 'transparent',
              color: spacingBalance === 'auto' ? '#ffffff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Automatically scales font size, line height, and section gaps so content fills the entire A4 page"
          >
            ✨ Full Page Auto-Fill
          </button>
          <button
            type="button"
            onClick={() => setSpacingBalance('spacious')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '16px',
              border: 'none',
              background: spacingBalance === 'spacious' ? '#7D1128' : 'transparent',
              color: spacingBalance === 'spacious' ? '#ffffff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Expands font size and section gaps for minimal/low content resumes"
          >
            🌱 Extra Spacious
          </button>
          <button
            type="button"
            onClick={() => setSpacingBalance('compact')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '16px',
              border: 'none',
              background: spacingBalance === 'compact' ? '#7D1128' : 'transparent',
              color: spacingBalance === 'compact' ? '#ffffff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Squeezes margins and line height for dense resumes"
          >
            📦 Compact
          </button>
        </div>
      </div>

      <div
        className="preview-sheet-outer"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          className={`flexible-resume-sheet density-${density}`}
          id="flexible-resume-print-area"
          style={{
            padding: dynamicPadding,
            '--flex-font-size': dynamicFontSize,
            '--flex-line-height': dynamicLineHeight,
            '--flex-item-gap': dynamicItemGap,
            '--flex-sec-gap': dynamicSecGap,
            backgroundImage: watermarkBase64 ? `url(data:image/png;base64,${watermarkBase64})` : 'none',
          }}
        >
          {/* HEADER */}
          <header className="flex-resume-header">
            <h1 className="flex-candidate-name">{fullName}</h1>
            {contactParts.length > 0 && (
              <div className="flex-contact-line">
                {contactParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="flex-bullet-sep">•</span>}
                    {part}
                  </React.Fragment>
                ))}
              </div>
            )}
          </header>

          {/* DYNAMIC AUTO-JUSTIFIED SECTIONS CONTAINER */}
          <div
            className="flex-sections-container"
            style={{
              justifyContent: spacingBalance === 'compact' ? 'flex-start' : 'space-between',
            }}
          >
            {/* PROFESSIONAL SUMMARY */}
            {data.summary?.trim() && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Professional Summary</h2>
                <p className="flex-summary-body">{data.summary.trim()}</p>
              </section>
            )}

            {/* TECHNICAL SKILLS */}
            {hasSkills && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Technical Skills</h2>
                <div className="flex-skills-matrix">
                  {skills.languages?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Languages:</strong>
                      <span className="flex-skill-val">{skills.languages.trim()}</span>
                    </div>
                  )}
                  {skills.frameworks?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Frameworks & Web:</strong>
                      <span className="flex-skill-val">{skills.frameworks.trim()}</span>
                    </div>
                  )}
                  {skills.tools_cloud?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Tools & Cloud:</strong>
                      <span className="flex-skill-val">{skills.tools_cloud.trim()}</span>
                    </div>
                  )}
                  {skills.concepts?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Core Concepts:</strong>
                      <span className="flex-skill-val">{skills.concepts.trim()}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* PROJECT EXPERIENCE (1-3 projects) */}
            {projectsList.length > 0 && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Projects</h2>
                <div className="flex-items-list">
                  {projectsList.map((proj, idx) => (
                    <div key={idx} className="flex-item-block">
                      <div className="flex-item-topline">
                        <div className="flex-item-heading">
                          <strong className="flex-item-title">{proj.title || "Project Title"}</strong>
                          {proj.tech_stack?.trim() && (
                            <span className="flex-tech-stack"> | <em>{proj.tech_stack.trim()}</em></span>
                          )}
                        </div>
                        {proj.date_range?.trim() && (
                          <span className="flex-item-date">{proj.date_range.trim()}</span>
                        )}
                      </div>

                      {proj.link?.trim() && (
                        <div className="flex-project-link">
                          <a href={`https://${proj.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">
                            {proj.link.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}

                      <ul className="flex-bullets-list">
                        {proj.bullet_1?.trim() && <li>{proj.bullet_1.trim()}</li>}
                        {proj.bullet_2?.trim() && <li>{proj.bullet_2.trim()}</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PROFESSIONAL EXPERIENCE (Rendered ONLY if candidate added experience) */}
            {hasExperience && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Professional Experience</h2>
                <div className="flex-items-list">
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="flex-item-block">
                      <div className="flex-item-topline">
                        <strong className="flex-item-title">{exp.company || "Company"}</strong>
                        {exp.location?.trim() && (
                          <span className="flex-item-location">{exp.location.trim()}</span>
                        )}
                      </div>
                      <div className="flex-item-subline">
                        <span className="flex-item-role">{exp.role || "Role"}</span>
                        {(exp.start_date || exp.end_date) && (
                          <span className="flex-item-date">
                            {exp.start_date || ""} – {exp.end_date || ""}
                          </span>
                        )}
                      </div>
                      <ul className="flex-bullets-list">
                        {exp.bullet_1?.trim() && <li>{exp.bullet_1.trim()}</li>}
                        {exp.bullet_2?.trim() && <li>{exp.bullet_2.trim()}</li>}
                        {exp.bullet_3?.trim() && <li>{exp.bullet_3.trim()}</li>}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EDUCATION (2-3 entries) */}
            {educationList.length > 0 && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Education</h2>
                <div className="flex-items-list">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="flex-item-block">
                      <div className="flex-item-topline">
                        <strong className="flex-item-title">{edu.institution || "Institution Name"}</strong>
                        {edu.location?.trim() && (
                          <span className="flex-item-location">{edu.location.trim()}</span>
                        )}
                      </div>
                      <div className="flex-item-subline">
                        <span className="flex-item-role">
                          {edu.degree || "Degree"}
                          {edu.gpa?.trim() && <span className="flex-edu-gpa"> ({edu.gpa.trim()})</span>}
                        </span>
                        {edu.grad_date?.trim() && (
                          <span className="flex-item-date">{edu.grad_date.trim()}</span>
                        )}
                      </div>
                      {edu.highlights?.trim() && (
                        <div className="flex-edu-highlights">{edu.highlights.trim()}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CERTIFICATIONS / HONORS (Optional) */}
            {data.certifications?.trim() && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Certifications & Honors</h2>
                <p className="flex-cert-text">{data.certifications.trim()}</p>
              </section>
            )}

            {/* CUSTOM SECTION (With user's own heading, 2 subheads & bullets) */}
            {hasCustom && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">{customSection.title.trim()}</h2>
                <div className="flex-items-list">
                  {customSection.subhead_1?.title?.trim() && (
                    <div className="flex-item-block">
                      <div className="flex-item-topline">
                        <strong className="flex-item-title">{customSection.subhead_1.title.trim()}</strong>
                        {customSection.subhead_1.subtitle_or_date?.trim() && (
                          <span className="flex-item-date">{customSection.subhead_1.subtitle_or_date.trim()}</span>
                        )}
                      </div>
                      <ul className="flex-bullets-list">
                        {customSection.subhead_1.bullet_1?.trim() && <li>{customSection.subhead_1.bullet_1.trim()}</li>}
                        {customSection.subhead_1.bullet_2?.trim() && <li>{customSection.subhead_1.bullet_2.trim()}</li>}
                      </ul>
                    </div>
                  )}
                  {customSection.subhead_2?.title?.trim() && (
                    <div className="flex-item-block">
                      <div className="flex-item-topline">
                        <strong className="flex-item-title">{customSection.subhead_2.title.trim()}</strong>
                        {customSection.subhead_2.subtitle_or_date?.trim() && (
                          <span className="flex-item-date">{customSection.subhead_2.subtitle_or_date.trim()}</span>
                        )}
                      </div>
                      <ul className="flex-bullets-list">
                        {customSection.subhead_2.bullet_1?.trim() && <li>{customSection.subhead_2.bullet_1.trim()}</li>}
                        {customSection.subhead_2.bullet_2?.trim() && <li>{customSection.subhead_2.bullet_2.trim()}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
