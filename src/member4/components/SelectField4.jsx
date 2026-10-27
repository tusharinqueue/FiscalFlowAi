// Ye reusable Select dropdown component hai category aur timeframe unit choose karne ke liye
import React from 'react'

export default function SelectField4({
  id, name, label, value, onChange, onBlur, options = [],
  error, touched, required = false, disabled = false, helperText = ''
}) {
  const selectId = id || `select-${name}`
  const showError = Boolean(touched && error)

  return (
    <div className={`m4-form-group ${showError ? 'has-error' : ''}`}>
      {label && <label htmlFor={selectId} className="m4-form-label">{label} {required && <span className="m4-required-star">*</span>}</label>}
      <select id={selectId} name={name} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} className={`m4-form-select ${showError ? 'input-invalid' : ''}`}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {showError && <div className="m4-field-error" role="alert"><span className="error-dot">●</span> {error}</div>}
      {!showError && helperText && <div className="m4-field-helper">{helperText}</div>}
    </div>
  )
}
