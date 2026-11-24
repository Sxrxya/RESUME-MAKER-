import React from 'react';

export default function FlexibleCertifications({ certifications = '', onChange }) {
  return (
    <div className="form-section">
      <div className="section-title-row">
        <h3>🏆 Certifications & Honors <span className="optional-badge">Optional</span></h3>
      </div>

      <p className="section-help-text">
        Add relevant industry certifications, hackathon awards, or academic honors.
      </p>

      <div className="form-group">
        <label>Certificates, Awards & Achievements</label>
        <textarea
          rows={3}
          className="voltare-textarea"
          value={certifications}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. AWS Certified Cloud Practitioner, Winner - Smart India Hackathon 2023, Google Cloud Generative AI Badge"
        />
      </div>
    </div>
  );
}
