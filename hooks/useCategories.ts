'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, TransactionType } from '@/types/database'

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('categories').select('*').order('name')
    if (type) query = query.eq('type', type)
    const { data, error } = await query
    if (error) setError(error.message)
    else setCategories(data as Category[])
    setLoading(false)
  }, [type])

  useEffect(() => { fetch() }, [fetch])

  async function createCategory(payload: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await supabase.from('categories').insert({ ...payload, user_id: user.id })
    if (error) throw error
    await fetch()
  }

  async function updateCategory(id: string, payload: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) {
    const supabase = createClient()
    const { error } = await supabase.from('categories').update(payload).eq('id', id)
    if (error) throw error
    await fetch()
  }

  async function deleteCategory(id: string) {
    const supabase = createClient()
    // Verifica se há transações vinculadas
    const { count } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      throw new Error(`Existem ${count} transação(ões) vinculadas a esta categoria.`)
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await fetch()
  }

  return { categories, loading, error, refetch: fetch, createCategory, updateCategory, deleteCategory }
}
