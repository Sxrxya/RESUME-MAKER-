import React from 'react';

export default function FlexiblePersonalInfo({ personal = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...personal,
      [field]: value,
    });
  };

  return (
    <div className="form-section">
      <h3>👤 Personal Details <span className="req-badge">Mandatory</span></h3>
      <p className="section-help-text">
        Enter your primary contact details. These appear at the top header of your resume.
      </p>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>
            First Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            className="voltare-input"
            value={personal.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="e.g. Aakash"
            required
          />
        </div>

        <div className="form-group flex-1">
          <label>
            Last Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            className="voltare-input"
            value={personal.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="e.g. Sharma"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>
            Email Address <span className="required-star">*</span>
          </label>
          <input
            type="email"
            className="voltare-input"
            value={personal.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g. aakash.sharma@example.com"
            required
          />
        </div>

        <div className="form-group flex-1">
          <label>
            Phone Number <span className="required-star">*</span>
          </label>
          <input
            type="tel"
            className="voltare-input"
            value={personal.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="e.g. +91 98765 43210"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>
            Location (City, State / Country) <span className="required-star">*</span>
          </label>
          <input
            type="text"
            className="voltare-input"
            value={personal.city_state || ''}
            onChange={(e) => handleChange('city_state', e.target.value)}
            placeholder="e.g. Bengaluru, Karnataka"
            required
          />
        </div>

        <div className="form-group flex-1">
          <label>LinkedIn Profile</label>
          <input
            type="text"
            className="voltare-input"
            value={personal.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="e.g. linkedin.com/in/aakash-sharma"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Portfolio / GitHub Profile (Optional)</label>
        <input
          type="text"
          className="voltare-input"
          value={personal.portfolio || ''}
          onChange={(e) => handleChange('portfolio', e.target.value)}
          placeholder="e.g. github.com/aakash-sharma"
        />
      </div>
    </div>
  );
}
