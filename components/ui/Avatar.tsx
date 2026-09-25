'use client'

import styles from './Avatar.module.css'

interface AvatarProps {
  /** Emoji do avatar pré-definido. Sem preset, cai nas iniciais. */
  emoji?: string | null
  /** Cor de fundo do avatar pré-definido. */
  color?: string
  /** Usado para gerar as iniciais quando não há preset. */
  name?: string
  email?: string
  size?: number
  className?: string
}

function initialsFrom(name?: string, email?: string): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return email?.[0]?.toUpperCase() ?? 'U'
}

export function Avatar({
  emoji,
  color,
  name,
  email,
  size = 36,
  className = '',
}: AvatarProps) {
  const dimension = {
    width: size,
    height: size,
    fontSize: `${Math.round(size * 0.38)}px`,
  }

  if (emoji) {
    return (
      <span
        className={`${styles.avatar} ${styles.preset} ${className}`}
        style={{ ...dimension, background: color ?? 'var(--color-primary)' }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    )
  }

  return (
    <span
      className={`${styles.avatar} ${styles.initials} ${className}`}
      style={dimension}
      aria-hidden="true"
    >
      {initialsFrom(name, email)}
    </span>
  )
}
