import React, { useState } from 'react';
import SectionHeader from '../SectionHeader';
import LimitedTextInput from '../LimitedTextInput';
import Tabs from '../Tabs';
import { LIMITS } from '../../constants/limits';

export default function Education({ data, onChange }) {
  const [activeSubTab, setActiveSubTab] = useState('edu_1');
  const [eduTypes, setEduTypes] = useState({
    edu_1: 'college',
    edu_2: 'school', // Defaults nicely: 1=college, 2=school (12th), 3=school (10th)
    edu_3: 'school',
  });

  const p = LIMITS.education.entry_fields;

  const tabs = [
    { id: 'edu_1', label: '1. College / University' },
    { id: 'edu_2', label: `2. ${eduTypes.edu_2 === 'college' ? 'College' : 'School'}` },
    { id: 'edu_3', label: `3. ${eduTypes.edu_3 === 'college' ? 'College' : 'School'}` },
  ];

  const idx = activeSubTab === 'edu_1' ? 1 : activeSubTab === 'edu_2' ? 2 : 3;
  const isSchool = idx > 1 && eduTypes[activeSubTab] === 'school';
  const isRequired = true;

  const handleTypeToggle = (type) => {
    setEduTypes(prev => ({
      ...prev,
      [activeSubTab]: type,
    }));
  };

  return (
    <div className="form-section-card">
      <SectionHeader
        title="Education"
        description="Add your academic background. Degree sits beside institution, specialization below."
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSubTab}
        onChange={setActiveSubTab}
        variant="sub"
      />

      {/* College vs School toggle for Entry 2 and 3 */}
      {idx > 1 && (
        <div className="edu-type-toggle-container" style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#7D1128', marginRight: '10px' }}>
            Education Level:
          </span>
          <div className="segmented-toggle">
            <button
              type="button"
              className={`toggle-option ${!isSchool ? 'active' : ''}`}
              onClick={() => handleTypeToggle('college')}
            >
              🏛️ College / University
            </button>
            <button
              type="button"
              className={`toggle-option ${isSchool ? 'active' : ''}`}
              onClick={() => handleTypeToggle('school')}
            >
              🏫 School (12th / 10th)
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Institution & Degree beside each other */}
      <div className="grid-2">
        <LimitedTextInput
          name={`edu_${idx}_university`}
          label={isSchool ? "School Name" : "College / University Name"}
          value={data[`edu_${idx}_university`]}
          onChange={onChange}
          maxChars={p.university.max_chars}
          required={isRequired}
          placeholder={isSchool ? "e.g. Delhi Public School / St. Xavier's" : "e.g. ABC University / Institute of Technology"}
        />
        <LimitedTextInput
          name={`edu_${idx}_program`}
          label={isSchool ? "Board / Certificate" : "Degree"}
          value={data[`edu_${idx}_program`]}
          onChange={onChange}
          maxChars={p.program.max_chars}
          required={isRequired}
          placeholder={isSchool ? "e.g. CBSE Class XII / ICSE Class X" : "e.g. Bachelor of Technology (B.Tech) / B.S."}
        />
      </div>

      {/* Row 2: Specialization below the degree & GPA */}
      <div className="grid-2-1">
        <LimitedTextInput
          name={`edu_${idx}_courses`}
          label={isSchool ? "Stream / Major Subjects" : "Specialization / Major"}
          value={data[`edu_${idx}_courses`]}
          onChange={onChange}
          maxChars={p.relevant_courses.max_chars}
          required={false}
          placeholder={isSchool ? "e.g. Science (PCM + CS) or Commerce" : "e.g. Computer Science & Engineering / Data Science"}
        />
        <LimitedTextInput
          name={`edu_${idx}_gpa`}
          label={isSchool ? "Percentage / Marks" : "GPA / Percentage"}
          value={data[`edu_${idx}_gpa`]}
          onChange={onChange}
          maxChars={p.gpa.max_chars}
          required={false}
          placeholder={isSchool ? "e.g. 94.5% / 9.6 CGPA" : "e.g. GPA 8.7 / 3.9"}
        />
      </div>

      {/* Row 3: Graduation Date & City */}
      <div className="grid-2">
        <LimitedTextInput
          name={`edu_${idx}_date`}
          label={isSchool ? "Year of Passing" : "Graduation Date"}
          value={data[`edu_${idx}_date`]}
          onChange={onChange}
          maxChars={p.graduation_date.max_chars}
          required={isRequired}
          placeholder="e.g. May 2024"
        />
        <LimitedTextInput
          name={`edu_${idx}_city`}
          label={p.city_country.label}
          value={data[`edu_${idx}_city`]}
          onChange={onChange}
          maxChars={p.city_country.max_chars}
          required={isRequired}
          placeholder={p.city_country.placeholder}
        />
      </div>
    </div>
  );
}
