import React, { useRef, useState, useEffect } from 'react';
import { validateFlexibleResume } from '../utils/flexibleValidation';

export default function FlexibleResumePreview({ data, watermarkBase64 = "" }) {
  const previewContainerRef = useRef(null);
  const [scale, setScale] = useState(1);

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
          className={`flexible-resume-sheet density-${density}`}
          id="flexible-resume-print-area"
          style={{
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
        </div>
      </div>
    </div>
  );
}
