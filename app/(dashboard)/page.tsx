import { createClient } from '@/lib/supabase/server'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { Card } from '@/components/ui/Card'
import type { Transaction } from '@/types/database'
import {
  summarizePeriod,
  summarizeByCategory,
  projectMonthlyTotals,
} from '@/lib/finance/calculate'
import { getCurrentMonthRange, getLastSixMonths } from '@/lib/utils/dateUtils'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { start, end } = getCurrentMonthRange()

  // Buscar transações do mês
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', user!.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  const txList = (transactions ?? []) as Transaction[]

  // Toda a aritmética de dinheiro vive em lib/finance/calculate.ts, que usa
  // Decimal e tem testes unitários. Aqui só orquestramos a chamada.
  const { income, expense, balance, transactionCount } = summarizePeriod(txList)
  const categorySpending = summarizeByCategory(txList)

  // Gráfico mensal — últimos 6 meses
  const months = getLastSixMonths()
  const { data: allTx } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', user!.id)
    .gte('date', months[0].start)
    .lte('date', months[months.length - 1].end)

  const monthlyData = projectMonthlyTotals(
    (allTx ?? []) as { amount: number; type: 'income' | 'expense'; date: string }[],
    months
  )

  const now = new Date()
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now)

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Resumo de {monthName}</p>
        </div>
      </header>

      {/* Cards de resumo */}
      <div className={styles.statsGrid}>
        <BalanceCard
          title="Saldo Atual"
          value={balance}
          variant="balance"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          }
          subtitle="Receitas menos despesas"
        />
        <BalanceCard
          title="Receitas"
          value={income}
          variant="income"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          }
        />
        <BalanceCard
          title="Despesas"
          value={expense}
          variant="expense"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          }
        />
        <BalanceCard
          title="Transações"
          value={transactionCount}
          variant="count"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          }
          subtitle="neste mês"
        />
      </div>

      {/* Gráficos e Recentes */}
      <div className={styles.chartsGrid}>
        <Card variant="default" padding="lg" className={styles.pieCard}>
          <h2 className={styles.cardTitle}>Gastos por Categoria</h2>
          <SpendingChart data={categorySpending} />
        </Card>

        <Card variant="default" padding="lg" className={styles.barCard}>
          <h2 className={styles.cardTitle}>Histórico Mensal</h2>
          <div className={styles.chartLegend}>
            <span className={styles.legendIncome}>■ Receitas</span>
            <span className={styles.legendExpense}>■ Despesas</span>
          </div>
          <MonthlyChart data={monthlyData} />
        </Card>
      </div>

      {/* Transações recentes */}
      <Card variant="default" padding="lg">
        <h2 className={styles.cardTitle}>Transações Recentes</h2>
        <RecentTransactions transactions={txList.slice(0, 5)} />
      </Card>
    </div>
  )
}
