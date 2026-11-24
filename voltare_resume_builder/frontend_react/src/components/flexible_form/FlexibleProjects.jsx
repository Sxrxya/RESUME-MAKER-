import React from 'react';
import { FLEXIBLE_LIMITS } from '../../constants/flexibleLimits';

export default function FlexibleProjects({ projects = [], onChange, isNonTechnical = false }) {
  const minEntries = FLEXIBLE_LIMITS.minProjects; // 1
  const maxEntries = FLEXIBLE_LIMITS.maxProjects; // 3

  const handleUpdate = (index, field, value) => {
    const updated = [...projects];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddProject = () => {
    if (projects.length >= maxEntries) return;
    onChange([
      ...projects,
      {
        title: '',
        tech_stack: '',
        role_or_org: '',
        date_range: '',
        bullet_1: '',
        bullet_2: '',
        link: ''
      }
    ]);
  };

  const handleRemoveProject = (index) => {
    if (projects.length <= minEntries) return;
    const updated = projects.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>🚀 Projects <span className="req-badge">1 Mandatory, Max 3 Allowed</span></h3>
        <span className="entries-count-badge">
          {projects.length} / {maxEntries} Projects
        </span>
      </div>

      <p className="section-help-text">
        {isNonTechnical
          ? "Highlight key academic, business, consulting, or case study initiatives. Project #1 is compulsory; you may add up to 2 additional projects (max 3)."
          : "Highlight key technical projects you have engineered. Project #1 is compulsory; you may add up to 2 additional projects (total maximum 3)."}
      </p>

      {projects.map((proj, index) => {
        const projNum = index + 1;
        const isMandatory = projNum === 1;

        return (
          <div key={index} className="modular-entry-card">
            <div className="modular-entry-header">
              <span className="entry-title">
                🚀 Project #{projNum} {isMandatory ? <span className="tag-required">[Required]</span> : <span className="tag-optional">[Optional]</span>}
              </span>
              {!isMandatory && (
                <button
                  type="button"
                  className="entry-remove-btn"
                  onClick={() => handleRemoveProject(index)}
                  title="Remove this project"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>
                  Project Title {isMandatory && <span className="required-star">*</span>}
                </label>
                <input
                  type="text"
                  className="voltare-input"
                  value={proj.title || ''}
                  onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                  placeholder={isNonTechnical ? "e.g. Market Expansion Strategy & Consumer Analysis" : "e.g. Distributed Task Scheduler & Execution Engine"}
                  required={isMandatory}
                />
              </div>

              <div className="form-group flex-1">
                <label>Date / Duration</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={proj.date_range || ''}
                  onChange={(e) => handleUpdate(index, 'date_range', e.target.value)}
                  placeholder="e.g. Jan 2024 – Apr 2024"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>{isNonTechnical ? "Organization / Domain / Scope" : "Tech Stack (Tools, Languages, Frameworks)"}</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={proj.tech_stack || ''}
                  onChange={(e) => handleUpdate(index, 'tech_stack', e.target.value)}
                  placeholder={isNonTechnical ? "e.g. Excel, Tableau, Market Research, Financial Modeling" : "e.g. Python, FastAPI, Redis, Docker, PostgreSQL"}
                />
              </div>

              <div className="form-group flex-1">
                <label>{isNonTechnical ? "Project Link / Report (Optional)" : "Project Link / GitHub (Optional)"}</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={proj.link || ''}
                  onChange={(e) => handleUpdate(index, 'link', e.target.value)}
                  placeholder={isNonTechnical ? "e.g. drive.google.com/report" : "e.g. github.com/user/project"}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Bullet Point 1 (Impact, Methodology, Scope) {isMandatory && <span className="required-star">*</span>}
              </label>
              <textarea
                rows={2}
                className="voltare-textarea"
                value={proj.bullet_1 || ''}
                onChange={(e) => handleUpdate(index, 'bullet_1', e.target.value)}
                placeholder={isNonTechnical
                  ? "Conducted comprehensive qualitative and quantitative market analysis across 500+ respondents, identifying 3 key growth opportunities..."
                  : "Architected a scalable distributed background task runner using Redis pub/sub and asynchronous worker pools, processing 5,000+ jobs/min..."}
                required={isMandatory}
              />
            </div>

            <div className="form-group">
              <label>Bullet Point 2 (Metrics, Outcomes, Results)</label>
              <textarea
                rows={2}
                className="voltare-textarea"
                value={proj.bullet_2 || ''}
                onChange={(e) => handleUpdate(index, 'bullet_2', e.target.value)}
                placeholder={isNonTechnical
                  ? "Synthesized findings into executive presentation delivered to stakeholders, resulting in adoption of 2 strategic initiatives."
                  : "Designed fault-tolerant retry strategies with exponential backoff and persistent job state tracking, reducing failed task rate by 40%."}
              />
            </div>
          </div>
        );
      })}

      {projects.length < maxEntries && (
        <button
          type="button"
          className="add-entry-btn"
          onClick={handleAddProject}
        >
          ➕ Add Another Project ({projects.length + 1} of {maxEntries})
        </button>
      )}
    </div>
  );
}
