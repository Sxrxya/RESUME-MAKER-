import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { validateFlexibleResume } from '../utils/flexibleValidation';
import { optimizePageLayout, applyLayoutToDOM } from '../utils/layout/layoutOptimizer';

export default function FlexibleResumePreview({ data, watermarkBase64 = "" }) {
  const previewContainerRef = useRef(null);
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [layoutMetrics, setLayoutMetrics] = useState(null);

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

  // Contact line items with clean hyperlink labels & nowrap
  const contactParts = [];
  if (personal.city_state) {
    contactParts.push(<span key="loc" className="flex-contact-item">{personal.city_state}</span>);
  }
  if (personal.phone) {
    contactParts.push(<span key="phone" className="flex-contact-item">{personal.phone}</span>);
  }
  if (personal.email) {
    contactParts.push(
      <span key="email" className="flex-contact-item">
        <a href={`mailto:${personal.email}`} className="flex-contact-link">
          {personal.email}
        </a>
      </span>
    );
  }
  if (personal.linkedin) {
    const rawLi = personal.linkedin.trim();
    const hrefLi = rawLi.startsWith('http') ? rawLi : `https://${rawLi}`;
    contactParts.push(
      <span key="li" className="flex-contact-item">
        <a href={hrefLi} target="_blank" rel="noopener noreferrer" className="flex-contact-link">
          LinkedIn
        </a>
      </span>
    );
  }
  if (personal.portfolio) {
    const rawPort = personal.portfolio.trim();
    const hrefPort = rawPort.startsWith('http') ? rawPort : `https://${rawPort}`;
    const portLabel = rawPort.toLowerCase().includes('github.com')
      ? 'GitHub'
      : (rawPort.toLowerCase().includes('behance.net') || rawPort.toLowerCase().includes('dribbble.com'))
        ? 'Portfolio'
        : 'Website';
    contactParts.push(
      <span key="port" className="flex-contact-item">
        <a href={hrefPort} target="_blank" rel="noopener noreferrer" className="flex-contact-link">
          {portLabel}
        </a>
      </span>
    );
  }

  // Natural executive styling: clean, uniform, professional
  const validation = validateFlexibleResume(data);
  const density = validation.budget?.densityMode || 'balanced';

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

  // Adaptive Page Composition: Measures rendered geometry & dynamically balances vertical distribution
  useLayoutEffect(() => {
    if (sheetRef.current) {
      const result = optimizePageLayout(sheetRef.current);
      if (result && result.layout) {
        applyLayoutToDOM(sheetRef.current, result.layout);
        setLayoutMetrics(result);
      }
    }
  }, [data]);

  const watermarkSrc = watermarkBase64
    ? `data:image/png;base64,${watermarkBase64}`
    : "/original_watermark.png";

  return (
    <div className="preview-scaler-wrapper" ref={previewContainerRef}>
      <div
        className="preview-sheet-outer"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          ref={sheetRef}
          className={`flexible-resume-sheet density-${density}`}
          id="flexible-resume-print-area"
          style={{
            padding: '38px 44px',
          }}
        >
          {/* Centered Soft-Mask Watermark Overlay */}
          {watermarkSrc && (
            <div className="flex-resume-watermark">
              <img src={watermarkSrc} alt="Voltare Watermark" />
            </div>
          )}

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

          {/* NATURAL UNIFORM SECTIONS CONTAINER */}
          <div className="flex-sections-container">
            {/* PROFESSIONAL SUMMARY */}
            {data.summary?.trim() && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Professional Summary</h2>
                <p className="flex-summary-body">{data.summary.trim()}</p>
              </section>
            )}

            {/* SKILLS (General & Professional for all applicants) */}
            {hasSkills && (
              <section className="flex-resume-section">
                <h2 className="flex-section-title">Skills</h2>
                <div className="flex-skills-matrix">
                  {skills.concepts?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Core Competencies:</strong>
                      <span className="flex-skill-val">{skills.concepts.trim()}</span>
                    </div>
                  )}
                  {skills.tools_cloud?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Tools & Software:</strong>
                      <span className="flex-skill-val">{skills.tools_cloud.trim()}</span>
                    </div>
                  )}
                  {skills.languages?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Languages & Tech:</strong>
                      <span className="flex-skill-val">{skills.languages.trim()}</span>
                    </div>
                  )}
                  {skills.frameworks?.trim() && (
                    <div className="flex-skill-row">
                      <strong className="flex-skill-label">Domain Knowledge:</strong>
                      <span className="flex-skill-val">{skills.frameworks.trim()}</span>
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
