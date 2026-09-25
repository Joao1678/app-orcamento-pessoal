'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { friendlyErrorMessage } from '@/lib/supabase/errors'
import type { Transaction } from '@/types/database'
import { getCurrentMonthRange } from '@/lib/utils/dateUtils'

interface UseTransactionsOptions {
  month?: string // 'YYYY-MM'
  type?: 'income' | 'expense'
  categoryId?: string
  limit?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (options.month) {
      const [year, month] = options.month.split('-').map(Number)
      const start = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const end = new Date(year, month, 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    } else {
      const { start, end } = getCurrentMonthRange()
      query = query.gte('date', start).lte('date', end)
    }

    if (options.type) query = query.eq('type', options.type)
    if (options.categoryId) query = query.eq('category_id', options.categoryId)
    if (options.limit) query = query.limit(options.limit)

    const { data, error } = await query

    if (error) setError(friendlyErrorMessage(error, 'Não foi possível carregar as transações.'))
    else setTransactions(data as Transaction[])
    setLoading(false)
  }, [options.month, options.type, options.categoryId, options.limit])

  useEffect(() => { fetch() }, [fetch])

  async function createTransaction(payload: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error } = await supabase.from('transactions').insert({ ...payload, user_id: user.id })
    if (error) throw error
    await fetch()
  }

  async function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>>) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').update(payload).eq('id', id)
    if (error) throw error
    await fetch()
  }

  async function deleteTransaction(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    await fetch()
  }

  return { transactions, loading, error, refetch: fetch, createTransaction, updateTransaction, deleteTransaction }
}
