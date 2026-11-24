import React from 'react';

export default function FlexibleSkills({ skills = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...skills,
      [field]: value,
    });
  };

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>🛠️ Skills <span className="req-badge">Modular Matrix</span></h3>
      </div>

      <p className="section-help-text">
        Organize your competencies into structured categories. Works for technical, business, management, design, and operational candidates.
      </p>

      <div className="form-group">
        <label>Core Competencies & Functional Skills</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.concepts || ''}
          onChange={(e) => handleChange('concepts', e.target.value)}
          placeholder="e.g. Problem Solving, Project Management, Data Analysis, System Design, Strategic Planning"
        />
      </div>

      <div className="form-group">
        <label>Tools, Software & Platforms</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.tools_cloud || ''}
          onChange={(e) => handleChange('tools_cloud', e.target.value)}
          placeholder="e.g. Git, Docker, Excel, PostgreSQL, Tableau, Figma, AWS, Linux, Jira"
        />
      </div>

      <div className="form-group">
        <label>Languages & Frameworks</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.languages || ''}
          onChange={(e) => handleChange('languages', e.target.value)}
          placeholder="e.g. Python, SQL, JavaScript, React, Node.js / English, Spanish"
        />
      </div>

      <div className="form-group">
        <label>Domain Knowledge & Methodologies (Optional)</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.frameworks || ''}
          onChange={(e) => handleChange('frameworks', e.target.value)}
          placeholder="e.g. Agile/Scrum, RESTful APIs, Financial Modeling, CI/CD, Product Strategy"
        />
      </div>
    </div>
  );
}
