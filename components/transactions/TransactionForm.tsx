'use client'

import { useState, useEffect } from 'react'
import type { Transaction, Category, TransactionType } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getTodayISO } from '@/lib/utils/dateUtils'
import styles from './TransactionForm.module.css'

interface TransactionFormProps {
  categories: Category[]
  initial?: Transaction | null
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ categories, initial, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? getTodayISO())
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredCategories = categories.filter((c) => c.type === type)

  // Reset categoria quando tipo muda
  useEffect(() => {
    if (!initial) setCategoryId('')
  }, [type, initial])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Informe um valor válido.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        description: description || null,
        date,
        category_id: categoryId || null,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação.')
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
          id="type-expense"
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
          id="type-income"
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

      {/* Valor */}
      <div className={styles.amountWrapper}>
        <span className={styles.currencySymbol}>R$</span>
        <input
          id="transaction-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${styles.amountInput} ${type === 'income' ? styles.amountIncome : styles.amountExpense}`}
          required
        />
      </div>

      {/* Categoria */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="transaction-category">
          Categoria
        </label>
        <div className={styles.categoryGrid}>
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryChip} ${categoryId === cat.id ? styles.categoryActive : ''}`}
              style={{ '--cat-color': cat.color } as React.CSSProperties}
              onClick={() => setCategoryId(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <Input
        label="Descrição (opcional)"
        type="text"
        id="transaction-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Data */}
      <Input
        label="Data"
        type="date"
        id="transaction-date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel} id="transaction-cancel">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} id="transaction-save">
          {initial ? 'Salvar alterações' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
