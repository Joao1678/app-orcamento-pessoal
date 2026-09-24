'use client'

import { useState } from 'react'
import type { Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/dateUtils'
import { Button } from '@/components/ui/Button'
import styles from './TransactionItem.module.css'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => Promise<void>
}

export function TransactionItem({ transaction: tx, onEdit, onDelete }: TransactionItemProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    await onDelete(tx.id)
  }

  return (
    <li className={styles.item}>
      <div
        className={styles.icon}
        style={{ background: tx.category?.color ? `${tx.category.color}20` : 'var(--surface-overlay)' }}
      >
        {tx.category?.icon ?? '💰'}
      </div>

      <div className={styles.info}>
        <p className={styles.description}>
          {tx.description || tx.category?.name || 'Sem descrição'}
        </p>
        <p className={styles.meta}>
          {tx.category?.name && <span>{tx.category.name}</span>}
          <span>{formatDate(tx.date)}</span>
        </p>
      </div>

      <div className={styles.right}>
        <span className={styles.amount} data-type={tx.type}>
          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
        </span>

        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(tx)}
            aria-label="Editar transação"
            title="Editar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn} ${confirmDelete ? styles.confirmDelete : ''}`}
            onClick={handleDelete}
            disabled={deleting}
            aria-label={confirmDelete ? 'Confirmar exclusão' : 'Excluir transação'}
            title={confirmDelete ? 'Clique para confirmar' : 'Excluir'}
          >
            {deleting ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinning}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </li>
  )
}
