import React from 'react'

/**
 * Toast notification component — appears at the bottom,
 * floats above the BottomNav with a glassmorphism pill style.
 */
export default function Toast({ message, type = 'success' }) {
  return (
    <div
      className={`toast animate-scale-in ${type === 'error' ? 'toast-error' : 'toast-success'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined filled" style={{ fontSize: '1.1rem' }}>
          {type === 'error' ? 'error' : 'check_circle'}
        </span>
        {message}
      </div>
    </div>
  )
}
