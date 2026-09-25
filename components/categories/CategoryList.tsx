'use client'

import { useState } from 'react'
import type { Category, TransactionType } from '@/types/database'
import { CategoryItem } from './CategoryItem'
import { CategoryForm, type CategoryDraft } from './CategoryForm'
import { Modal } from '@/components/ui/Modal'
import styles from './CategoryList.module.css'

interface CategoryListProps {
  categories: Category[]
  onEdit: (id: string, data: CategoryDraft) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const SECTIONS: { type: TransactionType; label: string }[] = [
  { type: 'expense', label: 'Despesas' },
  { type: 'income', label: 'Receitas' },
]

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  if (categories.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🗂️</span>
        <p>Nenhuma categoria encontrada</p>
        <p className={styles.emptyHint}>Crie categorias para organizar suas transações</p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.groups}>
        {SECTIONS.map((section) => {
          const items = categories.filter((c) => c.type === section.type)
          if (items.length === 0) return null

          return (
            <div key={section.type} className={styles.group}>
              <p className={styles.groupHeader} data-type={section.type}>
                {section.label}
              </p>
              <ul className={styles.list}>
                {items.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={setEditingCategory}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Editar categoria"
      >
        {editingCategory && (
          <CategoryForm
            initial={editingCategory}
            onSubmit={async (data) => {
              await onEdit(editingCategory.id, data)
              setEditingCategory(null)
            }}
            onCancel={() => setEditingCategory(null)}
          />
        )}
      </Modal>
    </>
  )
}
