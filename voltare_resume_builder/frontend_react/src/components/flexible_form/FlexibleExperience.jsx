import React from 'react';
import { FLEXIBLE_LIMITS } from '../../constants/flexibleLimits';

export default function FlexibleExperience({ experience = [], onChange }) {
  const maxEntries = FLEXIBLE_LIMITS.maxExperience; // 3

  const handleUpdate = (index, field, value) => {
    const updated = [...experience];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddExperience = () => {
    if (experience.length >= maxEntries) return;
    onChange([
      ...experience,
      {
        company: '',
        role: '',
        location: '',
        start_date: '',
        end_date: '',
        bullet_1: '',
        bullet_2: '',
        bullet_3: ''
      }
    ]);
  };

  const handleRemoveExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>💼 Professional Experience <span className="optional-badge">100% Optional (0 to 3 Max)</span></h3>
        <span className="entries-count-badge">
          {experience.length} / {maxEntries} Entries
        </span>
      </div>

      {experience.length === 0 ? (
        <div className="fresher-notice-card">
          <div className="fresher-notice-icon">🎓</div>
          <div className="fresher-notice-content">
            <strong>Freshers & College Graduates:</strong>
            <p>
              Professional experience is completely optional. If you do not have work experience yet,
              you can leave this section at 0. The dynamic layout algorithm will automatically expand and scale
              your Projects, Education, and Skills so your resume looks completely full and balanced!
            </p>
            <button
              type="button"
              className="voltare-btn secondary"
              style={{ marginTop: '8px', padding: '6px 14px', fontSize: '13px' }}
              onClick={handleAddExperience}
            >
              ➕ Have internship or work experience? Click to add
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="section-help-text">
            List your relevant internships, full-time roles, or contract positions (up to 3 maximum).
          </p>

          {experience.map((exp, index) => {
            const expNum = index + 1;

            return (
              <div key={index} className="modular-entry-card">
                <div className="modular-entry-header">
                  <span className="entry-title">
                    💼 Experience #{expNum} <span className="tag-optional">[Optional Entry]</span>
                  </span>
                  <button
                    type="button"
                    className="entry-remove-btn"
                    onClick={() => handleRemoveExperience(index)}
                    title="Delete this experience"
                  >
                    ✕ Delete
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>Company / Organization Name</label>
                    <input
                      type="text"
                      className="voltare-input"
                      value={exp.company || ''}
                      onChange={(e) => handleUpdate(index, 'company', e.target.value)}
                      placeholder="e.g. InnovateTech Labs"
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>Location</label>
                    <input
                      type="text"
                      className="voltare-input"
                      value={exp.location || ''}
                      onChange={(e) => handleUpdate(index, 'location', e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-2">
                    <label>Role / Position Title</label>
                    <input
                      type="text"
                      className="voltare-input"
                      value={exp.role || ''}
                      onChange={(e) => handleUpdate(index, 'role', e.target.value)}
                      placeholder="e.g. Software Engineering Intern"
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>Start Date</label>
                    <input
                      type="text"
                      className="voltare-input"
                      value={exp.start_date || ''}
                      onChange={(e) => handleUpdate(index, 'start_date', e.target.value)}
                      placeholder="e.g. May 2023"
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>End Date</label>
                    <input
                      type="text"
                      className="voltare-input"
                      value={exp.end_date || ''}
                      onChange={(e) => handleUpdate(index, 'end_date', e.target.value)}
                      placeholder="e.g. Jul 2023 or Present"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Achievement Bullet 1</label>
                  <textarea
                    rows={2}
                    className="voltare-textarea"
                    value={exp.bullet_1 || ''}
                    onChange={(e) => handleUpdate(index, 'bullet_1', e.target.value)}
                    placeholder="Developed and deployed 8 RESTful microservice endpoints in FastAPI, improving response speeds by 28%..."
                  />
                </div>

                <div className="form-group">
                  <label>Achievement Bullet 2 (Optional)</label>
                  <textarea
                    rows={2}
                    className="voltare-textarea"
                    value={exp.bullet_2 || ''}
                    onChange={(e) => handleUpdate(index, 'bullet_2', e.target.value)}
                    placeholder="Implemented automated CI/CD pipelines via GitHub Actions and wrote comprehensive unit test suites..."
                  />
                </div>
              </div>
            );
          })}

          {experience.length < maxEntries && (
            <button
              type="button"
              className="add-entry-btn"
              onClick={handleAddExperience}
            >
              ➕ Add Another Experience ({experience.length + 1} of {maxEntries})
            </button>
          )}
        </>
      )}
    </div>
  );
}
