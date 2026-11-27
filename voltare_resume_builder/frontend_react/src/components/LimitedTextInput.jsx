import React from 'react';

export default function LimitedTextInput({
  name,
  label,
  value = "",
  onChange,
  maxChars = 999,
  required = false,
  placeholder = "",
  error = null,
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
        style={error ? { borderColor: '#c62828' } : undefined}
        value={value}
        onChange={handleChange}
        maxLength={maxChars}
        placeholder={placeholder}
      />
      {error && (
        <div style={{ color: '#c62828', fontSize: '11.5px', marginTop: '3px', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
      <div className={counterClass}>
        {current} / {maxChars} characters ({remaining} remaining)
      </div>
    </div>
  );
}

