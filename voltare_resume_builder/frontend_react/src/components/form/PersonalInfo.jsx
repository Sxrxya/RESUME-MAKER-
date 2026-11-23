import React from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import { LIMITS } from '../../constants/limits';

export default function PersonalInfo({ data, onChange }) {
  const p = LIMITS.personal;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Personal Information"
        description="Your basic contact details"
      />
      <div className="grid-2">
        <LimitedTextInput
          name="first_name"
          label={p.first_name.label}
          value={data.first_name}
          onChange={onChange}
          maxChars={p.first_name.max_chars}
          required={p.first_name.required}
          placeholder={p.first_name.placeholder}
        />
        <LimitedTextInput
          name="second_name"
          label={p.second_name.label}
          value={data.second_name}
          onChange={onChange}
          maxChars={p.second_name.max_chars}
          required={p.second_name.required}
          placeholder={p.second_name.placeholder}
        />
      </div>

      <LimitedTextInput
        name="city_country"
        label={p.city_country.label}
        value={data.city_country}
        onChange={onChange}
        maxChars={p.city_country.max_chars}
        required={p.city_country.required}
        placeholder={p.city_country.placeholder}
      />

      <LimitedTextInput
        name="linkedin_url"
        label={p.linkedin_url.label}
        value={data.linkedin_url}
        onChange={onChange}
        maxChars={p.linkedin_url.max_chars}
        required={p.linkedin_url.required}
        placeholder={p.linkedin_url.placeholder}
      />

      <div className="grid-2">
        <LimitedTextInput
          name="phone"
          label={p.phone.label}
          value={data.phone}
          onChange={onChange}
          maxChars={p.phone.max_chars}
          required={p.phone.required}
          placeholder={p.phone.placeholder}
        />
        <LimitedTextInput
          name="email"
          label={p.email.label}
          value={data.email}
          onChange={onChange}
          maxChars={p.email.max_chars}
          required={p.email.required}
          placeholder={p.email.placeholder}
        />
      </div>
    </div>
  );
}

