'use client'

import { formatCurrency } from '@/lib/utils/formatCurrency'
import styles from './BalanceCard.module.css'

interface BalanceCardProps {
  title: string
  value: number
  variant: 'balance' | 'income' | 'expense' | 'count'
  icon: React.ReactNode
  subtitle?: string
}

export function BalanceCard({ title, value, variant, icon, subtitle }: BalanceCardProps) {
  const displayValue = variant === 'count' ? value.toString() : formatCurrency(value)

  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.value}>{displayValue}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      <div className={styles.glow} aria-hidden="true" />
    </div>
  )
}
