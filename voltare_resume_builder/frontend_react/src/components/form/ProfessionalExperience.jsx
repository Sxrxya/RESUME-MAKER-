import React, { useState } from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import LimitedTextArea from '../LimitedTextArea';
import Tabs from '../Tabs';
import { LIMITS } from '../../constants/limits';

export default function ProfessionalExperience({ data, onChange }) {
  const [activeSubTab, setActiveSubTab] = useState('exp_1');
  const expConfigs = LIMITS.professional_experience.entries;

  const tabs = [
    { id: 'exp_1', label: 'Experience 1 (1 bullet)' },
    { id: 'exp_2', label: 'Experience 2 (2 bullets)' },
    { id: 'exp_3', label: 'Experience 3 (1 bullet)' },
  ];

  const idx = activeSubTab === 'exp_1' ? 1 : activeSubTab === 'exp_2' ? 2 : 3;
  const config = expConfigs[idx - 1];
  const fields = config.fields;
  const numBullets = config.num_bullets;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Professional Experience"
        description="3 entries: 1 bullet, 2 bullets, 1 bullet"
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
        variant="sub"
      />

      <div className="grid-2-1">
        <LimitedTextInput
          name={`exp_${idx}_company`}
          label={fields.company.label}
          value={data[`exp_${idx}_company`]}
          onChange={onChange}
          maxChars={fields.company.max_chars}
          required={fields.company.required}
          placeholder={fields.company.placeholder}
        />
        <LimitedTextInput
          name={`exp_${idx}_domain`}
          label={fields.domain.label}
          value={data[`exp_${idx}_domain`]}
          onChange={onChange}
          maxChars={fields.domain.max_chars}
          required={fields.domain.required}
          placeholder={fields.domain.placeholder}
        />
      </div>

      <div className="grid-2-1-1">
        <LimitedTextInput
          name={`exp_${idx}_role`}
          label={fields.role.label}
          value={data[`exp_${idx}_role`]}
          onChange={onChange}
          maxChars={fields.role.max_chars}
          required={fields.role.required}
          placeholder={fields.role.placeholder}
        />
        <LimitedTextInput
          name={`exp_${idx}_start`}
          label={fields.start_date.label}
          value={data[`exp_${idx}_start`]}
          onChange={onChange}
          maxChars={fields.start_date.max_chars}
          required={fields.start_date.required}
          placeholder={fields.start_date.placeholder}
        />
        <LimitedTextInput
          name={`exp_${idx}_end`}
          label={fields.end_date.label}
          value={data[`exp_${idx}_end`]}
          onChange={onChange}
          maxChars={fields.end_date.max_chars}
          required={fields.end_date.required}
          placeholder={fields.end_date.placeholder}
        />
      </div>

      {Array.from({ length: numBullets }, (_, bIdx) => {
        const bNum = bIdx + 1;
        const bKey = `bullet_${bNum}`;
        const bField = fields[bKey];
        return (
          <LimitedTextArea
            key={`exp_${idx}_b${bNum}`}
            name={`exp_${idx}_b${bNum}`}
            label={bField.label}
            value={data[`exp_${idx}_b${bNum}`]}
            onChange={onChange}
            maxChars={bField.max_chars}
            maxLines={bField.max_lines}
            required={bField.required}
            placeholder={bField.placeholder}
            rows={3}
          />
        );
      })}
    </div>
  );
}

