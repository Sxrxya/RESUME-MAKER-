import React from 'react';

export default function LimitedTextInput({
  name,
  label,
  value = "",
  onChange,
  maxChars = 999,
  required = false,
  placeholder = "",
}) {
  const current = (value || "").length;
  const remaining = maxChars - current;

  let counterClass = "char-counter";
  if (remaining <= 5 && remaining > 0) {
    counterClass = "char-counter warning";
  } else if (remaining <= 0) {
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
      <input
        id={name}
        type="text"
        className="voltare-input"
        value={value}
        onChange={handleChange}
        maxLength={maxChars}
        placeholder={placeholder}
      />
      <div className={counterClass}>
        {current} / {maxChars} characters ({remaining} remaining)
      </div>
    </div>
  );
}

