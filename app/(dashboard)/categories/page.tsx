'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { CategoryForm, type CategoryDraft } from '@/components/categories/CategoryForm'
import { CategoryList } from '@/components/categories/CategoryList'
import styles from './page.module.css'

export default function CategoriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const {
    categories,
    loading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  async function handleCreate(data: CategoryDraft) {
    setActionError('')
    await createCategory(data)
    setIsCreateModalOpen(false)
  }

  async function handleEdit(id: string, data: CategoryDraft) {
    setActionError('')
    await updateCategory(id, data)
  }

  async function handleDelete(id: string) {
    setActionError('')
    try {
      await deleteCategory(id)
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao excluir categoria.'
      )
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categorias</h1>
          <p className={styles.pageSubtitle}>Organize suas receitas e despesas</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Nova categoria
        </Button>
      </header>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Não foi possível carregar as categorias. Verifique se a migration foi aplicada no Supabase.</span>
          <button type="button" className={styles.retryButton} onClick={() => void refetch()}>
            Tentar novamente
          </button>
        </div>
      )}

      {actionError && (
        <div className={styles.errorBanner} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{actionError}</span>
        </div>
      )}

      <Card padding="lg" className={styles.listCard}>
        {loading ? (
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Carregando categorias...</span>
          </div>
        ) : error ? null : (
          <CategoryList
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova categoria"
      >
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
