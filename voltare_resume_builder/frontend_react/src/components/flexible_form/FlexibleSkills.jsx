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
        <h3>🛠️ Technical Skills <span className="req-badge">Modular Matrix</span></h3>
      </div>

      <p className="section-help-text">
        Organize your competencies into structured categories. These render as a crisp, scannable technical skill matrix.
      </p>

      <div className="form-group">
        <label>Programming & Scripting Languages</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.languages || ''}
          onChange={(e) => handleChange('languages', e.target.value)}
          placeholder="e.g. Python, JavaScript, TypeScript, SQL, C++, Java"
        />
      </div>

      <div className="form-group">
        <label>Frameworks, Libraries & Web Technologies</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.frameworks || ''}
          onChange={(e) => handleChange('frameworks', e.target.value)}
          placeholder="e.g. React.js, Vite, Node.js, FastAPI, Express.js, Tailwind CSS"
        />
      </div>

      <div className="form-group">
        <label>Tools, Databases & Cloud Infrastructure</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.tools_cloud || ''}
          onChange={(e) => handleChange('tools_cloud', e.target.value)}
          placeholder="e.g. Docker, Git, PostgreSQL, MongoDB, Redis, AWS (S3, EC2), Linux"
        />
      </div>

      <div className="form-group">
        <label>Core Concepts & Methodologies</label>
        <input
          type="text"
          className="voltare-input"
          value={skills.concepts || ''}
          onChange={(e) => handleChange('concepts', e.target.value)}
          placeholder="e.g. RESTful APIs, Microservices, System Design, Data Structures, CI/CD"
        />
      </div>
    </div>
  );
}
