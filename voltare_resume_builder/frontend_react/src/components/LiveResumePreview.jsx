import React, { useRef, useState, useEffect } from 'react';

export default function LiveResumePreview({ data, watermarkBase64 = "" }) {
  const previewContainerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isAutoFitActive, setIsAutoFitActive] = useState(false);

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

  const firstName = data.first_name || "";
  const secondName = data.second_name || "";
  const nameDisplay = `${firstName} ${secondName}`.trim();

  const city = data.city_country || "";
  const linkedin = data.linkedin_url || "";
  const phone = data.phone || "";
  const email = data.email || "";

  // Contact line items
  const contactParts = [];
  if (city) contactParts.push(<span key="city">{city}</span>);
  if (linkedin) {
    contactParts.push(
      <a
        key="linkedin"
        href={`https://${linkedin}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#0000ff', textDecoration: 'underline' }}
      >
        {linkedin}
      </a>
    );
  }
  if (phone) contactParts.push(<span key="phone">{phone}</span>);
  if (email) {
    contactParts.push(
      <a
        key="email"
        href={`mailto:${email}`}
        style={{ color: '#0000ff', textDecoration: 'underline' }}
      >
        {email}
      </a>
    );
  }

  // Education entries (Requirement 4 & 5: omit empty entries; degree near institution on Row 1, specialization below on Row 2)
  const eduEntries = [1, 2, 3].map((idx) => {
    const uni = data[`edu_${idx}_university`] || "";
    const eduCity = data[`edu_${idx}_city`] || "";
    const program = data[`edu_${idx}_program`] || "";
    const gpa = data[`edu_${idx}_gpa`] || "";
    const gradDate = data[`edu_${idx}_date`] || "";
    const courses = data[`edu_${idx}_courses`] || "";

    if (!uni && !program && !eduCity) return null;

    // Row 1: Degree beside Institution Name
    const instParts = [];
    if (uni) instParts.push(<strong key="uni">{uni}</strong>);
    if (program) instParts.push(<em key="prog">{program}</em>);

    return (
      <div key={`edu-${idx}`} className="resume-edu-entry">
        <div className="resume-entry-row">
          <span className="resume-entry-left">
            {instParts.map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < instParts.length - 1 && " — "}
              </React.Fragment>
            ))}
          </span>
          <span className="resume-entry-right">
            <strong>{eduCity}</strong>
          </span>
        </div>
        <div className="resume-entry-row">
          <span className="resume-entry-left">
            {courses && <em>{courses}</em>}
            {courses && gpa && "  "}
            {gpa && <span>{gpa}</span>}
          </span>
          <span className="resume-entry-right">
            <strong>
              <em>{gradDate}</em>
            </strong>
          </span>
        </div>
      </div>
    );
  }).filter(Boolean);

  // Research entries (Requirement 3 & 4: skip unused entries)
  const resEntries = [1, 2, 3].map((idx) => {
    const title = data[`res_${idx}_title`] || "";
    const org = data[`res_${idx}_org`] || "";
    const additional = data[`res_${idx}_additional`] || "";
    const start = data[`res_${idx}_start`] || "";
    const end = data[`res_${idx}_end`] || "";
    const b1 = data[`res_${idx}_b1`] || "";
    const b2 = data[`res_${idx}_b2`] || "";

    if (!title && !org && !b1 && !b2) return null;

    const dates = start || end ? `${start} – ${end}` : "";

    return (
      <div key={`res-${idx}`} className="resume-research-entry">
        <div className="resume-entry-row">
          <span className="resume-entry-left">
            {title && <strong>{title}</strong>}
            {title && org && ", "}
            {org && <em>{org}</em>}
          </span>
          <span className="resume-entry-right">
            <strong>{dates}</strong>
          </span>
        </div>
        {additional && (
          <div className="resume-additional-info">
            <em>{additional}</em>
          </div>
        )}
        {b1 && <div className="resume-bullet">● {b1}</div>}
        {b2 && <div className="resume-bullet">● {b2}</div>}
      </div>
    );
  }).filter(Boolean);

  // Professional experience entries (skip unused entries)
  const expEntries = [
    { idx: 1, bullets: [data.exp_1_b1] },
    { idx: 2, bullets: [data.exp_2_b1, data.exp_2_b2] },
    { idx: 3, bullets: [data.exp_3_b1] },
  ].map(({ idx, bullets }) => {
    const company = data[`exp_${idx}_company`] || "";
    const domain = data[`exp_${idx}_domain`] || "";
    const role = data[`exp_${idx}_role`] || "";
    const start = data[`exp_${idx}_start`] || "";
    const end = data[`exp_${idx}_end`] || "";
    const validBullets = bullets.filter(Boolean);

    if (!company && !role && validBullets.length === 0) return null;

    const dates = start || end ? `${start} – ${end}` : "";
    const roleDetails = [domain, role].filter(Boolean).join(", ");

    return (
      <div key={`exp-${idx}`} className="resume-experience-entry">
        <div className="resume-entry-row">
          <span className="resume-entry-left">
            {company && <strong>{company}</strong>}
            {company && roleDetails && ", "}
            {roleDetails && <em>{roleDetails}</em>}
          </span>
          <span className="resume-entry-right">
            <strong>{dates}</strong>
          </span>
        </div>
        {validBullets.map((b, bIdx) => (
          <div key={`exp-${idx}-b-${bIdx}`} className="resume-bullet">
            ● {b}
          </div>
        ))}
      </div>
    );
  }).filter(Boolean);

  // Achievement and Leadership
  const awards = data.awards || "";
  let lead1 = data.leadership_1 || "";
  let lead2 = data.leadership_2 || "";
  const achievement = data.achievement || "";
  let comm1 = data.community_1 || "";
  let comm2 = data.community_2 || "";
  const interests = data.interests || "";

  if (lead1 && !lead1.toLowerCase().startsWith("leadership")) {
    lead1 = `Leadership: (i)${lead1}`;
  }
  if (lead2 && !lead2.startsWith("(ii)")) {
    lead2 = `(ii)${lead2}`;
  }
  if (comm1 && !comm1.toLowerCase().startsWith("community")) {
    comm1 = `Community: (i) ${comm1}`;
  }
  if (comm2 && !comm2.startsWith("(ii)")) {
    comm2 = `(ii)${comm2}`;
  }

  const hasAchievements = Boolean(awards || lead1 || lead2 || achievement || comm1 || comm2 || interests);
  const hasSummary = Boolean(data.summary || data.skills);

  const watermarkSrc = watermarkBase64
    ? `data:image/png;base64,${watermarkBase64}`
    : "/original_watermark.png";

  const docBaseWidthPx = 596 * (96 / 72);
  const docBaseHeightPx = 842 * (96 / 72);

  // Calculate content volume / estimated lines for dynamic scaling
  let totalLines = 0;
  if (data.first_name || data.second_name) totalLines += 2;
  if (data.city_country || data.linkedin_url || data.phone || data.email) totalLines += 1;
  if (data.summary) totalLines += Math.max(1, Math.floor(data.summary.length / 110) + 1);
  if (data.skills) totalLines += Math.max(1, Math.floor(data.skills.length / 110) + 1);

  for (let i = 1; i <= 3; i++) {
    if (data[`edu_${i}_university`] || data[`edu_${i}_program`]) {
      totalLines += 3;
      if (data[`edu_${i}_courses`]) totalLines += 1;
    }
  }

  for (let i = 1; i <= 3; i++) {
    if (data[`res_${i}_title`] || data[`res_${i}_org`] || data[`res_${i}_b1`]) {
      totalLines += 2;
      if (data[`res_${i}_b1`]) totalLines += Math.max(1, Math.floor(data[`res_${i}_b1`].length / 110) + 1);
      if (data[`res_${i}_b2`]) totalLines += Math.max(1, Math.floor(data[`res_${i}_b2`].length / 110) + 1);
    }
  }

  for (let i = 1; i <= 3; i++) {
    if (data[`exp_${i}_company`] || data[`exp_${i}_role`] || data[`exp_${i}_b1`]) {
      totalLines += 2;
      if (data[`exp_${i}_b1`]) totalLines += Math.max(1, Math.floor(data[`exp_${i}_b1`].length / 110) + 1);
      if (data[`exp_${i}_b2`]) totalLines += Math.max(1, Math.floor(data[`exp_${i}_b2`].length / 110) + 1);
    }
  }

  ['awards', 'leadership_1', 'leadership_2', 'achievement', 'community_1', 'community_2', 'interests'].forEach((k) => {
    if (data[k]) totalLines += Math.max(1, Math.floor(data[k].length / 110) + 1);
  });

  const effectiveLines = isAutoFitActive ? Math.min(totalLines, 20) : totalLines;

  const densityStyles = effectiveLines <= 26 ? {
    '--resume-line-height': '1.34',
    '--resume-section-margin-top': '14pt',
    '--resume-section-body-margin': '4.5pt',
    '--resume-entry-margin-bottom': '7pt',
    '--resume-bullet-margin-bottom': '3pt',
    '--resume-content-padding': '34pt 36pt 28pt 21pt',
    '--resume-font-size': '10.2pt',
    '--resume-summary-margin-bottom': '4pt',
  } : effectiveLines <= 38 ? {
    '--resume-line-height': '1.23',
    '--resume-section-margin-top': '9pt',
    '--resume-section-body-margin': '3.5pt',
    '--resume-entry-margin-bottom': '4.5pt',
    '--resume-bullet-margin-bottom': '1.5pt',
    '--resume-content-padding': '28pt 36pt 22pt 21pt',
    '--resume-font-size': '10pt',
    '--resume-summary-margin-bottom': '3pt',
  } : {
    '--resume-line-height': '1.15',
    '--resume-section-margin-top': '5pt',
    '--resume-section-body-margin': '2.5pt',
    '--resume-entry-margin-bottom': '2.5pt',
    '--resume-bullet-margin-bottom': '0pt',
    '--resume-content-padding': '26pt 36pt 18pt 21pt',
    '--resume-font-size': '10pt',
    '--resume-summary-margin-bottom': '2pt',
  };

  return (
    <div ref={previewContainerRef} className="preview-scaler-wrapper">
      <div
        className="preview-scale-wrapper"
        style={{
          width: `${docBaseWidthPx * scale}px`,
          height: `${docBaseHeightPx * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="preview-sheet"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '596pt',
            height: '842pt',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <div className="resume-doc" style={densityStyles}>
            {watermarkSrc && (
              <div className="resume-watermark">
                <img src={watermarkSrc} alt="watermark" />
              </div>
            )}

            <div className="resume-content">
              {/* NAME */}
              <div className="resume-name">{nameDisplay}</div>

              {/* CONTACT */}
              {contactParts.length > 0 && (
                <div className="resume-contact-info">
                  {contactParts.map((part, i) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < contactParts.length - 1 && " | "}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* PROFESSIONAL SUMMARY (Adaptive) */}
              {hasSummary && (
                <>
                  <div className="resume-section-heading">PROFESSIONAL SUMMARY</div>
                  <div className="resume-section-body">
                    {data.summary && (
                      <div className="resume-summary-text">{data.summary}</div>
                    )}
                    {data.skills && (
                      <div className="resume-skills-line">
                        <strong>Skills:</strong> {data.skills}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* EDUCATION (Adaptive) */}
              {eduEntries.length > 0 && (
                <>
                  <div className="resume-section-heading">EDUCATION</div>
                  <div className="resume-section-body">{eduEntries}</div>
                </>
              )}

              {/* RESEARCH/PROJECT EXPERIENCE (Adaptive) */}
              {resEntries.length > 0 && (
                <>
                  <div className="resume-section-heading">RESEARCH/PROJECT EXPERIENCE</div>
                  <div className="resume-section-body">{resEntries}</div>
                </>
              )}

              {/* PROFESSIONAL EXPERIENCE (Adaptive) */}
              {expEntries.length > 0 && (
                <>
                  <div className="resume-section-heading">PROFESSIONAL EXPERIENCE</div>
                  <div className="resume-section-body">{expEntries}</div>
                </>
              )}

              {/* ACHIEVEMENT AND LEADERSHIP (Adaptive) */}
              {hasAchievements && (
                <>
                  <div className="resume-section-heading">ACHIEVEMENT AND LEADERSHIP</div>
                  <div className="resume-section-body">
                    {awards && (
                      <div className="resume-ach-line">
                        <strong>Awards(if any):</strong> {awards}
                      </div>
                    )}
                    {lead1 && <div className="resume-ach-line">{lead1}</div>}
                    {lead2 && <div className="resume-ach-line">{lead2}</div>}
                    {achievement && (
                      <div className="resume-ach-line indent">
                        <strong>○ Achievement(if any):</strong> {achievement}
                      </div>
                    )}
                    {comm1 && <div className="resume-ach-line">{comm1}</div>}
                    {comm2 && <div className="resume-ach-line">{comm2}</div>}
                    {interests && (
                      <div className="resume-ach-line">
                        <strong>Interests :</strong> {interests}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AUTO-FIT TO FULL PAGE BUTTON */}
      <div className="resume-fit-controls-bar">
        <div>
          <button
            type="button"
            className={`resume-fit-btn ${isAutoFitActive ? 'active' : ''}`}
            onClick={() => setIsAutoFitActive(prev => !prev)}
            title="Intelligently scales line-heights, margins, and gaps to fill the full A4 page perfectly"
          >
            {isAutoFitActive ? '✓ Page Fit: Expanded' : '📐 Auto-Fit to Page Fully'}
          </button>
        </div>
        <div className="resume-fit-desc">
          {isAutoFitActive
            ? '✨ Full page distribution active: elements adapted to utilize full A4 page.'
            : 'Unused space at the bottom? Click to intelligently distribute and fit to full page.'}
        </div>
      </div>
    </div>
  );
}
