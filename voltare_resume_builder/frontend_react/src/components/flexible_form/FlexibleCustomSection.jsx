import React from 'react';

export default function FlexibleCustomSection({ customSection = {}, onChange }) {
  const custom = customSection || {};
  const sub1 = custom.subhead_1 || {};
  const sub2 = custom.subhead_2 || {};

  const handleTitleChange = (val) => {
    onChange({
      ...custom,
      title: val,
    });
  };

  const handleSubheadChange = (subKey, field, val) => {
    onChange({
      ...custom,
      [subKey]: {
        ...(custom[subKey] || {}),
        [field]: val,
      },
    });
  };

  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>✨ Custom Section <span className="optional-badge">Add Your Own Heading & Bullets</span></h3>
      </div>

      <p className="section-help-text">
        Add an optional custom section with your own heading (e.g. <em>Leadership & Extracurricular</em>, <em>Key Achievements</em>, <em>Publications</em>, or <em>Volunteer Initiatives</em>).
        Includes 2 customizable subheadings with impact bullet points.
      </p>

      {/* Custom Section Title */}
      <div className="form-group">
        <label>
          Custom Section Heading
        </label>
        <input
          type="text"
          className="voltare-input"
          value={custom.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Leadership & Extracurricular Activities, Publications, or Key Achievements"
        />
      </div>

      {/* Subheading 1 Card */}
      <div className="modular-entry-card" style={{ marginTop: '14px' }}>
        <div className="modular-entry-header">
          <span className="entry-title">📌 Sub-Entry #1</span>
        </div>

        <div className="form-row">
          <div className="form-group flex-2">
            <label>Subheading Title (Role, Activity, or Topic)</label>
            <input
              type="text"
              className="voltare-input"
              value={sub1.title || ''}
              onChange={(e) => handleSubheadChange('subhead_1', 'title', e.target.value)}
              placeholder="e.g. Lead Organizer, National Tech Hackathon"
            />
          </div>

          <div className="form-group flex-1">
            <label>Sub-title / Date / Organization</label>
            <input
              type="text"
              className="voltare-input"
              value={sub1.subtitle_or_date || ''}
              onChange={(e) => handleSubheadChange('subhead_1', 'subtitle_or_date', e.target.value)}
              placeholder="e.g. 2023 – 2024 or Bengaluru"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bullet Point 1</label>
          <textarea
            rows={2}
            className="voltare-textarea"
            value={sub1.bullet_1 || ''}
            onChange={(e) => handleSubheadChange('subhead_1', 'bullet_1', e.target.value)}
            placeholder="Spearheaded planning and execution for an inter-college symposium hosting 1,200+ attendees..."
          />
        </div>

        <div className="form-group">
          <label>Bullet Point 2 (Optional)</label>
          <textarea
            rows={2}
            className="voltare-textarea"
            value={sub1.bullet_2 || ''}
            onChange={(e) => handleSubheadChange('subhead_1', 'bullet_2', e.target.value)}
            placeholder="Managed sponsorship outreach, securing industry partnerships and corporate funding."
          />
        </div>
      </div>

      {/* Subheading 2 Card */}
      <div className="modular-entry-card">
        <div className="modular-entry-header">
          <span className="entry-title">📌 Sub-Entry #2</span>
        </div>

        <div className="form-row">
          <div className="form-group flex-2">
            <label>Subheading Title (Role, Activity, or Topic)</label>
            <input
              type="text"
              className="voltare-input"
              value={sub2.title || ''}
              onChange={(e) => handleSubheadChange('subhead_2', 'title', e.target.value)}
              placeholder="e.g. Core Member, Open Source Student Society"
            />
          </div>

          <div className="form-group flex-1">
            <label>Sub-title / Date / Organization</label>
            <input
              type="text"
              className="voltare-input"
              value={sub2.subtitle_or_date || ''}
              onChange={(e) => handleSubheadChange('subhead_2', 'subtitle_or_date', e.target.value)}
              placeholder="e.g. 2022 – 2023"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bullet Point 1</label>
          <textarea
            rows={2}
            className="voltare-textarea"
            value={sub2.bullet_1 || ''}
            onChange={(e) => handleSubheadChange('subhead_2', 'bullet_1', e.target.value)}
            placeholder="Conducted hands-on workshops introducing 150+ students to Git, GitHub, and open-source..."
          />
        </div>

        <div className="form-group">
          <label>Bullet Point 2 (Optional)</label>
          <textarea
            rows={2}
            className="voltare-textarea"
            value={sub2.bullet_2 || ''}
            onChange={(e) => handleSubheadChange('subhead_2', 'bullet_2', e.target.value)}
            placeholder="Organized bi-weekly coding competitions and collaborative hackathon preparation tracks."
          />
        </div>
      </div>
    </div>
  );
}
