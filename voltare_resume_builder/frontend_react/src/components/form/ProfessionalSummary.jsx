import React from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import LimitedTextArea from '../LimitedTextArea';
import { LIMITS } from '../../constants/limits';

export default function ProfessionalSummary({ data, onChange }) {
  const p = LIMITS.professional_summary;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Professional Summary"
        description="A concise overview of your professional profile"
      />
      <LimitedTextArea
        name="summary"
        label={p.summary.label}
        value={data.summary}
        onChange={onChange}
        maxChars={p.summary.max_chars}
        maxLines={p.summary.max_lines}
        required={p.summary.required}
        placeholder={p.summary.placeholder}
        rows={5}
      />
      <LimitedTextInput
        name="skills"
        label={p.skills.label}
        value={data.skills}
        onChange={onChange}
        maxChars={p.skills.max_chars}
        required={p.skills.required}
        placeholder={p.skills.placeholder}
      />
    </div>
  );
}

