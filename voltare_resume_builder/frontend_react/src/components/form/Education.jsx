import React, { useState } from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import Tabs from '../Tabs';
import { LIMITS } from '../../constants/limits';

export default function Education({ data, onChange }) {
  const [activeSubTab, setActiveSubTab] = useState('edu_1');
  const p = LIMITS.education.entry_fields;

  const tabs = [
    { id: 'edu_1', label: 'Education 1' },
    { id: 'edu_2', label: 'Education 2' },
    { id: 'edu_3', label: 'Education 3' },
  ];

  const idx = activeSubTab === 'edu_1' ? 1 : activeSubTab === 'edu_2' ? 2 : 3;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Education"
        description="Exactly 3 education entries required"
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
        variant="sub"
      />

      <div className="grid-2-1">
        <LimitedTextInput
          name={`edu_${idx}_university`}
          label={p.university.label}
          value={data[`edu_${idx}_university`]}
          onChange={onChange}
          maxChars={p.university.max_chars}
          required={p.university.required}
          placeholder={p.university.placeholder}
        />
        <LimitedTextInput
          name={`edu_${idx}_city`}
          label={p.city_country.label}
          value={data[`edu_${idx}_city`]}
          onChange={onChange}
          maxChars={p.city_country.max_chars}
          required={p.city_country.required}
          placeholder={p.city_country.placeholder}
        />
      </div>

      <div className="grid-2-1">
        <LimitedTextInput
          name={`edu_${idx}_program`}
          label={p.program.label}
          value={data[`edu_${idx}_program`]}
          onChange={onChange}
          maxChars={p.program.max_chars}
          required={p.program.required}
          placeholder={p.program.placeholder}
        />
        <LimitedTextInput
          name={`edu_${idx}_gpa`}
          label={p.gpa.label}
          value={data[`edu_${idx}_gpa`]}
          onChange={onChange}
          maxChars={p.gpa.max_chars}
          required={p.gpa.required}
          placeholder={p.gpa.placeholder}
        />
      </div>

      <div className="grid-1-2">
        <LimitedTextInput
          name={`edu_${idx}_date`}
          label={p.graduation_date.label}
          value={data[`edu_${idx}_date`]}
          onChange={onChange}
          maxChars={p.graduation_date.max_chars}
          required={p.graduation_date.required}
          placeholder={p.graduation_date.placeholder}
        />
        <LimitedTextInput
          name={`edu_${idx}_courses`}
          label={p.relevant_courses.label}
          value={data[`edu_${idx}_courses`]}
          onChange={onChange}
          maxChars={p.relevant_courses.max_chars}
          required={p.relevant_courses.required}
          placeholder={p.relevant_courses.placeholder}
        />
      </div>
    </div>
  );
}

