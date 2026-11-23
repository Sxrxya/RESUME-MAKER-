import React, { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="voltare-toast-container" onClick={onClose}>
      <div className="voltare-toast-card">
        <span className="toast-icon">✨</span>
        <div className="toast-content">{message}</div>
        <button type="button" className="toast-close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

