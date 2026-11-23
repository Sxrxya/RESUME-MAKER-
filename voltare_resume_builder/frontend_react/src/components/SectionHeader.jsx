import React from 'react';

export default function SectionHeader({ title, description }) {
  return (
    <div className="section-header-block">
      <h3>{title}</h3>
      {description && <div className="panel-subnote">{description}</div>}
      <hr className="section-divider" />
    </div>
  );
}

