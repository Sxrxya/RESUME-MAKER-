import React from 'react';

export default function Header({ subtitle = 'Official Resume Builder' }) {
  return (
    <header className="voltare-header">
      <img
        src="/voltare_logo.png"
        alt="Voltare - Talent, Elevated"
        className="voltare-header-logo-full"
      />
      <div className="subtitle">{subtitle}</div>
    </header>
  );
}
