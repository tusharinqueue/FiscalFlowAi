import React from 'react'

/**
 * Reusable Button component for Member 4 with variant and loading state support
 */
export default function Button4({
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'preset' | 'outline'
  onClick,
  disabled = false,
  isLoading = false,
  children,
  icon = null,
  className = '',
  title = ''
}) {
  const variantClass = `m4-btn-${variant}`

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`m4-btn ${variantClass} ${className} ${isLoading ? 'is-loading' : ''}`}
    >
      {isLoading ? (
        <span className="m4-btn-spinner-wrap">
          <span className="m4-spinner"></span>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="m4-btn-icon">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}
