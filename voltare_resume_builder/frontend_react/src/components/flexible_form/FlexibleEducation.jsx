import React from 'react';
import { FLEXIBLE_LIMITS } from '../../constants/flexibleLimits';

export default function FlexibleEducation({ education = [], onChange }) {
  const minEntries = FLEXIBLE_LIMITS.minEducation; // 2
  const maxEntries = FLEXIBLE_LIMITS.maxEducation; // 3

  const handleUpdate = (index, field, value) => {
    const updated = [...education];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddEntry = () => {
    if (education.length >= maxEntries) return;
    onChange([
      ...education,
      {
        institution: '',
        location: '',
        degree: '',
        grad_date: '',
        gpa: '',
        highlights: ''
      }
    ]);
  };

  const handleRemoveEntry = (index) => {
    // Only allow removing if more than minEntries
    if (education.length <= minEntries) return;
    const updated = education.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>🎓 Education <span className="req-badge">2 Mandatory, 1 Optional (Max 3)</span></h3>
        <span className="entries-count-badge">
          {education.length} / {maxEntries} Entries
        </span>
      </div>

      <p className="section-help-text">
        Candidates must list at least 2 educational qualifications (e.g. College / University Degree and Higher Secondary / 12th).
        You can optionally add a 3rd entry (e.g. 10th Standard or Post-Graduation).
      </p>

      {education.map((item, index) => {
        const entryNum = index + 1;
        const isMandatory = entryNum <= minEntries;

        return (
          <div key={index} className="modular-entry-card">
            <div className="modular-entry-header">
              <span className="entry-title">
                🎓 Education #{entryNum} {isMandatory ? <span className="tag-required">[Required]</span> : <span className="tag-optional">[Optional]</span>}
              </span>
              {!isMandatory && (
                <button
                  type="button"
                  className="entry-remove-btn"
                  onClick={() => handleRemoveEntry(index)}
                  title="Remove this optional entry"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>
                  School / College / University Name {isMandatory && <span className="required-star">*</span>}
                </label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.institution || ''}
                  onChange={(e) => handleUpdate(index, 'institution', e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  required={isMandatory}
                />
              </div>

              <div className="form-group flex-1">
                <label>Location</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.location || ''}
                  onChange={(e) => handleUpdate(index, 'location', e.target.value)}
                  placeholder="e.g. Surathkal, Karnataka"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>
                  Degree / Program Name {isMandatory && <span className="required-star">*</span>}
                </label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.degree || ''}
                  onChange={(e) => handleUpdate(index, 'degree', e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  required={isMandatory}
                />
              </div>

              <div className="form-group flex-1">
                <label>
                  Graduation / Year {isMandatory && <span className="required-star">*</span>}
                </label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.grad_date || ''}
                  onChange={(e) => handleUpdate(index, 'grad_date', e.target.value)}
                  placeholder="e.g. 2020 – 2024"
                  required={isMandatory}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Score / CGPA / Percentage (Optional)</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.gpa || ''}
                  onChange={(e) => handleUpdate(index, 'gpa', e.target.value)}
                  placeholder="e.g. CGPA: 8.9 / 10 or 95.4%"
                />
              </div>

              <div className="form-group flex-2">
                <label>Coursework / Honors / Activities (Optional)</label>
                <input
                  type="text"
                  className="voltare-input"
                  value={item.highlights || ''}
                  onChange={(e) => handleUpdate(index, 'highlights', e.target.value)}
                  placeholder="e.g. Relevant Courses: Distributed Systems, DBMS, Algorithms"
                />
              </div>
            </div>
          </div>
        );
      })}

      {education.length < maxEntries && (
        <button
          type="button"
          className="add-entry-btn"
          onClick={handleAddEntry}
        >
          ➕ Add 3rd Education Entry (Optional)
        </button>
      )}
    </div>
  );
}
