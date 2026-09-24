'use client'

import React, { forwardRef, useState } from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    prefixIcon,
    suffixIcon,
    showPasswordToggle = false,
    type = 'text',
    id,
    className = '',
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  const hasPasswordToggle = showPasswordToggle && type === 'password'
  const hasSuffixControl = Boolean(suffixIcon) || hasPasswordToggle
  const inputType = hasPasswordToggle && showPassword ? 'text' : type

  return (
    <div className={`${styles.wrapper} ${error ? styles.hasError : ''}`}>
      <div className={styles.inputContainer}>
        {prefixIcon && (
          <span className={styles.prefixIcon}>{prefixIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${prefixIcon ? styles.hasPrefixIcon : ''} ${hasSuffixControl ? styles.hasSuffixIcon : ''} ${className}`}
          type={inputType}
          placeholder=" "
          {...props}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        {suffixIcon && (
          <span className={styles.suffixIcon}>{suffixIcon}</span>
        )}
        {hasPasswordToggle && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={showPassword}
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5.5 9 5.5a17.7 17.7 0 0 1-2.1 2.8" />
                <path d="M6.6 6.6C3.6 8.3 3 12 3 12s3.5 5.5 9 5.5c1.4 0 2.7-.3 3.8-.8" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
})
