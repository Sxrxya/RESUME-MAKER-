import React from 'react';

export default function Header() {
  return (
    <header className="voltare-header">
      <div className="voltare-header-brand">
        <img
          src="/original_watermark.png"
          alt="Voltare Logo"
          className="voltare-header-logo"
        />
        <h1>VOLTARE</h1>
      </div>
      <div className="subtitle">Official Resume Builder</div>
    </header>
  );
}

