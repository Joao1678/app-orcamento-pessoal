'use client'

import { useState } from 'react'
import type { Category, TransactionType } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './CategoryForm.module.css'

export type CategoryDraft = Omit<Category, 'id' | 'user_id' | 'created_at'>

const COLOR_OPTIONS = [
  '#7C3AED',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#6B7280',
]

const ICON_OPTIONS = [
  '💰',
  '🏠',
  '🍔',
  '🚗',
  '💊',
  '🎮',
  '📚',
  '👕',
  '📦',
  '💼',
  '💻',
  '📈',
  '✈️',
  '🎁',
  '☕',
  '🐾',
  '⚽',
  '💪',
]

interface CategoryFormProps {
  initial?: Category | null
  onSubmit: (data: CategoryDraft) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '💰')
  const [color, setColor] = useState(initial?.color ?? COLOR_OPTIONS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Informe o nome da categoria.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({ name: trimmed, icon, color, type })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria.')
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Tipo */}
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'expense' ? styles.activeExpense : ''}`}
          onClick={() => setType('expense')}
          aria-pressed={type === 'expense'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          </svg>
          Despesa
        </button>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'income' ? styles.activeIncome : ''}`}
          onClick={() => setType('income')}
          aria-pressed={type === 'income'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          </svg>
          Receita
        </button>
      </div>

      {/* Nome */}
      <Input
        label="Nome"
        type="text"
        id="category-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        required
      />

      {/* Ícone */}
      <div className={styles.field}>
        <span className={styles.label} id="category-icon-label">
          Ícone
        </span>
        <div className={styles.iconGrid} role="radiogroup" aria-labelledby="category-icon-label">
          {ICON_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={icon === option}
              aria-label={`Ícone ${option}`}
              className={`${styles.iconOption} ${icon === option ? styles.iconActive : ''}`}
              style={{ '--cat-color': color } as React.CSSProperties}
              onClick={() => setIcon(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div className={styles.field}>
        <span className={styles.label} id="category-color-label">
          Cor
        </span>
        <div className={styles.colorGrid} role="radiogroup" aria-labelledby="category-color-label">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={color === option}
              aria-label={`Cor ${option}`}
              className={`${styles.colorOption} ${color === option ? styles.colorActive : ''}`}
              style={{ background: option }}
              onClick={() => setColor(option)}
            />
          ))}
        </div>
      </div>

      {/* Pré-visualização */}
      <div className={styles.preview}>
        <span className={styles.previewLabel}>Pré-visualização</span>
        <div className={styles.previewItem}>
          <div className={styles.previewIcon} style={{ background: `${color}20` }}>
            {icon}
          </div>
          <p className={styles.previewName}>{name.trim() || 'Nome da categoria'}</p>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel} id="category-cancel">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} id="category-save">
          {initial ? 'Salvar alterações' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
