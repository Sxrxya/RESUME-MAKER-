import React from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import LimitedTextArea from '../LimitedTextArea';
import { LIMITS } from '../../constants/limits';

export default function AchievementsLeadership({ data, onChange }) {
  const p = LIMITS.achievements_leadership;

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Achievement & Leadership"
        description="Awards, leadership roles, achievements, community involvement"
      />

      <LimitedTextArea
        name="awards"
        label={p.awards.label}
        value={data.awards}
        onChange={onChange}
        maxChars={p.awards.max_chars}
        required={p.awards.required}
        placeholder={p.awards.placeholder}
        rows={3}
      />

      <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 'bold', color: '#7D1128', fontFamily: 'Cormorant SC, Georgia, serif' }}>
        Leadership Entries
      </div>

      <LimitedTextArea
        name="leadership_1"
        label={p.leadership_1.label}
        value={data.leadership_1}
        onChange={onChange}
        maxChars={p.leadership_1.max_chars}
        required={p.leadership_1.required}
        placeholder={p.leadership_1.placeholder}
        rows={3}
      />

      <LimitedTextArea
        name="leadership_2"
        label={p.leadership_2.label}
        value={data.leadership_2}
        onChange={onChange}
        maxChars={p.leadership_2.max_chars}
        required={p.leadership_2.required}
        placeholder={p.leadership_2.placeholder}
        rows={3}
      />

      <LimitedTextArea
        name="achievement"
        label={p.achievement.label}
        value={data.achievement}
        onChange={onChange}
        maxChars={p.achievement.max_chars}
        required={p.achievement.required}
        placeholder={p.achievement.placeholder}
        rows={3}
      />

      <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 'bold', color: '#7D1128', fontFamily: 'Cormorant SC, Georgia, serif' }}>
        Community Entries
      </div>

      <LimitedTextArea
        name="community_1"
        label={p.community_1.label}
        value={data.community_1}
        onChange={onChange}
        maxChars={p.community_1.max_chars}
        required={p.community_1.required}
        placeholder={p.community_1.placeholder}
        rows={3}
      />

      <LimitedTextArea
        name="community_2"
        label={p.community_2.label}
        value={data.community_2}
        onChange={onChange}
        maxChars={p.community_2.max_chars}
        required={p.community_2.required}
        placeholder={p.community_2.placeholder}
        rows={3}
      />

      <LimitedTextInput
        name="interests"
        label={p.interests.label}
        value={data.interests}
        onChange={onChange}
        maxChars={p.interests.max_chars}
        required={p.interests.required}
        placeholder={p.interests.placeholder}
      />
    </div>
  );
}

