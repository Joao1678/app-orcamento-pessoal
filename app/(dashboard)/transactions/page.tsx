'use client'

import { useState } from 'react'
import type { Transaction } from '@/types/database'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import styles from './page.module.css'

type TransactionDraft = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>

export default function TransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const {
    transactions,
    loading,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories()

  const pageError = error ?? categoriesError

  async function handleCreate(data: TransactionDraft) {
    await createTransaction(data)
    setIsCreateModalOpen(false)
  }

  async function handleEdit(id: string, data: Partial<Transaction>) {
    await updateTransaction(
      id,
      data as Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>>,
    )
  }

  function handleRetry() {
    void refetch()
    void refetchCategories()
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Transações</h1>
          <p className={styles.pageSubtitle}>Acompanhe suas receitas e despesas</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={loading || categoriesLoading}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Nova transação
        </Button>
      </header>

      {pageError && (
        <div className={styles.errorBanner} role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Não foi possível carregar as transações. Verifique se a migration foi aplicada no
            Supabase.
          </span>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            Tentar novamente
          </button>
        </div>
      )}

      <Card padding="lg" className={styles.listCard}>
        {loading ? (
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Carregando transações...</span>
          </div>
        ) : pageError ? null : (
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={deleteTransaction}
          />
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova transação"
      >
        <TransactionForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
