import React, { useState } from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import LimitedTextArea from '../LimitedTextArea';
import Tabs from '../Tabs';
import { LIMITS } from '../../constants/limits';

export default function ResearchProjects({ data, onChange }) {
  const [activeSubTab, setActiveSubTab] = useState('res_1');
  const p = LIMITS.research_projects.entry_fields;

  const tabs = [
    { id: 'res_1', label: 'Project 1 (Required)' },
    { id: 'res_2', label: 'Project 2 (Optional)' },
    { id: 'res_3', label: 'Project 3 (Optional)' },
  ];

  const idx = activeSubTab === 'res_1' ? 1 : activeSubTab === 'res_2' ? 2 : 3;
  const isCompulsory = idx === 1;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Research / Project Experience"
        description="Project 1 is compulsory; Projects 2 & 3 are optional. Unused projects are omitted from the resume."
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
        variant="sub"
      />

      <LimitedTextInput
        name={`res_${idx}_title`}
        label={p.title.label}
        value={data[`res_${idx}_title`]}
        onChange={onChange}
        maxChars={p.title.max_chars}
        required={isCompulsory}
        placeholder={p.title.placeholder}
      />

      <div className="grid-2">
        <LimitedTextInput
          name={`res_${idx}_org`}
          label={p.organization.label}
          value={data[`res_${idx}_org`]}
          onChange={onChange}
          maxChars={p.organization.max_chars}
          required={isCompulsory}
          placeholder={p.organization.placeholder}
        />
        <LimitedTextInput
          name={`res_${idx}_additional`}
          label={p.additional_info.label}
          value={data[`res_${idx}_additional`]}
          onChange={onChange}
          maxChars={p.additional_info.max_chars}
          required={false}
          placeholder={p.additional_info.placeholder}
        />
      </div>

      <div className="grid-2">
        <LimitedTextInput
          name={`res_${idx}_start`}
          label={p.start_date.label}
          value={data[`res_${idx}_start`]}
          onChange={onChange}
          maxChars={p.start_date.max_chars}
          required={isCompulsory}
          placeholder={p.start_date.placeholder}
        />
        <LimitedTextInput
          name={`res_${idx}_end`}
          label={p.end_date.label}
          value={data[`res_${idx}_end`]}
          onChange={onChange}
          maxChars={p.end_date.max_chars}
          required={isCompulsory}
          placeholder={p.end_date.placeholder}
        />
      </div>

      <LimitedTextArea
        name={`res_${idx}_b1`}
        label={p.bullet_1.label}
        value={data[`res_${idx}_b1`]}
        onChange={onChange}
        maxChars={p.bullet_1.max_chars}
        maxLines={p.bullet_1.max_lines}
        required={isCompulsory}
        placeholder={p.bullet_1.placeholder}
        rows={3}
      />

      <LimitedTextArea
        name={`res_${idx}_b2`}
        label={p.bullet_2.label}
        value={data[`res_${idx}_b2`]}
        onChange={onChange}
        maxChars={p.bullet_2.max_chars}
        maxLines={p.bullet_2.max_lines}
        required={isCompulsory}
        placeholder={p.bullet_2.placeholder}
        rows={3}
      />
    </div>
  );
}
