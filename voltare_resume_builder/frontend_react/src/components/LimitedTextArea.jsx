import React from 'react';
import { estimateLines } from '../constants/limits';

export default function LimitedTextArea({
  name,
  label,
  value = "",
  onChange,
  maxChars = 999,
  maxLines = null,
  required = false,
  placeholder = "",
  rows = 3,
}) {
  const current = (value || "").length;
  const remaining = maxChars - current;
  const estimatedLines = maxLines ? estimateLines(value) : null;

  let counterClass = "char-counter";
  if (remaining <= 10 && remaining > 0) {
    counterClass = "char-counter warning";
  } else if (remaining <= 0 || (maxLines && estimatedLines > maxLines)) {
    counterClass = "char-counter danger";
  }

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxChars) {
      onChange(name, val);
    }
  };

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={name}>
        {label} {required && <span className="required-indicator">🔴</span>}
      </label>
      <textarea
        id={name}
        className="voltare-textarea"
        value={value}
        onChange={handleChange}
        maxLength={maxChars}
        placeholder={placeholder}
        rows={rows}
      />
      <div className={counterClass}>
        {current} / {maxChars} characters ({remaining} remaining)
        {maxLines && ` | ~${estimatedLines}/${maxLines} lines`}
      </div>
    </div>
  );
}

