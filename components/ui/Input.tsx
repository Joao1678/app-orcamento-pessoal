'use client'

import React, { forwardRef } from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefixIcon, suffixIcon, id, className = '', ...props },
  ref
) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`${styles.wrapper} ${error ? styles.hasError : ''}`}>
      <div className={styles.inputContainer}>
        {prefixIcon && (
          <span className={styles.prefixIcon}>{prefixIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${prefixIcon ? styles.hasPrefixIcon : ''} ${suffixIcon ? styles.hasSuffixIcon : ''} ${className}`}
          placeholder=" "
          {...props}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        {suffixIcon && (
          <span className={styles.suffixIcon}>{suffixIcon}</span>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
})
