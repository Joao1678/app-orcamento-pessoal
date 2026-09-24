export type TransactionType = 'income' | 'expense'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  date: string
  created_at: string
  category?: Category
}

export interface MonthlyStats {
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface CategorySpending {
  category: Category
  total: number
  percentage: number
}

export interface MonthlyChartData {
  month: string
  income: number
  expense: number
}
