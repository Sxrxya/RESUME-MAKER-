import React from 'react';

export default function ValidationMessage({ message, isError = true }) {
  const className = isError ? "validation-error" : "validation-success";
  return <div className={className}>{message}</div>;
}

