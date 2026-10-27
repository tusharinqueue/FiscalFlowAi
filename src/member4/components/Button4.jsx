import React from 'react'

export default function Button4({ type = 'button', variant = 'primary', onClick, disabled = false, isLoading = false, children, icon = null, className = '', title = '' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} title={title} className={`m4-btn m4-btn-${variant} ${className} ${isLoading ? 'is-loading' : ''}`}>
      {isLoading ? (
        <span className="m4-btn-spinner-wrap"><span className="m4-spinner"></span><span>Loading...</span></span>
      ) : (
        <>{icon && <span className="m4-btn-icon">{icon}</span>}<span>{children}</span></>
      )}
    </button>
  )
}
