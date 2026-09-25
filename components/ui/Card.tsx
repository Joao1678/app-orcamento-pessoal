'use client'

import React from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'glass-intense'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  style,
  onClick,
}: CardProps) {
  const classes = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover ? styles.hover : '',
    onClick ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
