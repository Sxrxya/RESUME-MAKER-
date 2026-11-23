import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, variant = "primary" }) {
  const isSub = variant === "sub";
  const listClass = isSub ? "sub-tabs-list" : "voltare-tabs-list";
  const btnClass = isSub ? "sub-tab-btn" : "voltare-tab-btn";

  return (
    <div className={listClass} role="tablist">
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id;
        const label = typeof tab === 'string' ? tab : tab.label;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${btnClass} ${isActive ? 'active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

