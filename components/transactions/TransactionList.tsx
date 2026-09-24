'use client'

import { useState } from 'react'
import type { Transaction } from '@/types/database'
import { TransactionItem } from './TransactionItem'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import { useCategories } from '@/hooks/useCategories'
import { formatDate } from '@/lib/utils/dateUtils'
import styles from './TransactionList.module.css'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (id: string, data: Partial<Transaction>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = tx.date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return groups
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const { categories } = useCategories()

  if (transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <span>💸</span>
        <p>Nenhuma transação encontrada</p>
        <p className={styles.emptyHint}>Use o botão + para adicionar uma nova transação</p>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <>
      <div className={styles.groups}>
        {Array.from(groups.entries()).map(([date, txs]) => (
          <div key={date} className={styles.group}>
            <p className={styles.dateHeader}>{formatDate(date)}</p>
            <ul className={styles.list}>
              {txs.map(tx => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={setEditingTx}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        title="Editar Transação"
      >
        {editingTx && (
          <TransactionForm
            categories={categories}
            initial={editingTx}
            onSubmit={async (data) => {
              await onEdit(editingTx.id, data)
              setEditingTx(null)
            }}
            onCancel={() => setEditingTx(null)}
          />
        )}
      </Modal>
    </>
  )
}
