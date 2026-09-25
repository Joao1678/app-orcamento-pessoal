'use client'

import { useState } from 'react'
import type { Category } from '@/types/database'
import styles from './CategoryItem.module.css'

interface CategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => Promise<void>
}

export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    setDeleting(true)
    setConfirmDelete(false)
    try {
      await onDelete(category.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.icon} style={{ background: `${category.color}20` }}>
        {category.icon}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{category.name}</p>
        <p className={styles.type} data-type={category.type}>
          {category.type === 'income' ? 'Receita' : 'Despesa'}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => onEdit(category)}
          disabled={deleting}
          aria-label={`Editar categoria ${category.name}`}
          title="Editar"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn} ${confirmDelete ? styles.confirmDelete : ''}`}
          onClick={handleDelete}
          disabled={deleting}
          aria-label={confirmDelete ? 'Confirmar exclusão' : `Excluir categoria ${category.name}`}
          title={confirmDelete ? 'Clique para confirmar' : 'Excluir'}
        >
          {deleting ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={styles.spinning}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      </div>
    </li>
  )
}
