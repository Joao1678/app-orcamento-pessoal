'use client'

import Link from 'next/link'
import type { Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/dateUtils'
import styles from './RecentTransactions.module.css'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <span>💸</span>
        <p>Nenhuma transação registrada este mês</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {transactions.map((tx) => (
          <li key={tx.id} className={styles.item}>
            <div
              className={styles.categoryIcon}
              style={{
                background: tx.category?.color
                  ? `${tx.category.color}20`
                  : 'var(--surface-overlay)',
              }}
            >
              <span>{tx.category?.icon ?? '💰'}</span>
            </div>
            <div className={styles.info}>
              <p className={styles.description}>
                {tx.description || tx.category?.name || 'Sem descrição'}
              </p>
              <p className={styles.meta}>
                {tx.category?.name} · {formatDate(tx.date)}
              </p>
            </div>
            <span className={styles.amount} data-type={tx.type}>
              {tx.type === 'income' ? '+' : '-'}
              {formatCurrency(tx.amount)}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/transactions" className={styles.viewAll}>
        Ver todas as transações →
      </Link>
    </div>
  )
}
