import React from 'react'

/**
 * Reusable InputField component for Member 4 forms
 * Implements validation display, accessible labels, icons, and error states.
 */
export default function InputField4({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder = '',
  helperText = '',
  required = false,
  min,
  max,
  step,
  disabled = false,
  autoFocus = false,
  prefix = null
}) {
  const inputId = id || `field-${name}`
  const showError = Boolean(touched && error)

  return (
    <div className={`m4-form-group ${showError ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="m4-form-label">
          {label} {required && <span className="m4-required-star">*</span>}
        </label>
      )}

      <div className={`m4-input-wrapper ${prefix ? 'has-prefix' : ''}`}>
        {prefix && <span className="m4-input-prefix">{prefix}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={showError}
          aria-describedby={showError ? `${inputId}-error` : undefined}
          className={`m4-form-input ${showError ? 'input-invalid' : ''}`}
        />
      </div>

      {showError && (
        <div id={`${inputId}-error`} className="m4-field-error" role="alert">
          <span className="error-dot">●</span> {error}
        </div>
      )}

      {!showError && helperText && (
        <div className="m4-field-helper">{helperText}</div>
      )}
    </div>
  )
}
