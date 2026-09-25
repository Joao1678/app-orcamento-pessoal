import Decimal from 'decimal.js'
import type {
  Category,
  CategorySpending,
  MonthlyChartData,
  Transaction,
  TransactionType,
} from '@/types/database'

/**
 * Cálculos financeiros do app.
 *
 * Toda aritmética de dinheiro aqui usa `Decimal`, nunca `number`. O Postgres
 * guarda os valores em `numeric(12,2)`, mas o PostgREST os entrega como JSON
 * number — ou seja, `number` nativo. Somar dezenas de transações em float
 * acumula erro de arredondamento (0.1 + 0.2 !== 0.3), o que é inaceitável em
 * saldo e total de categoria.
 *
 * Estas funções são puras de propósito: é o que as torna testáveis.
 */

// `numeric(12,2)` no banco. Nada além disso deve entrar.
const MONEY_PRECISION = Decimal.clone({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
})

/** Converte o amount (number|string) vindo do banco em Decimal exato. */
export function toDecimal(value: Transaction['amount'] | string | number): Decimal {
  return new MONEY_PRECISION(typeof value === 'string' ? value : String(value))
}

/**
 * Soma os valores de um tipo. Transações sem valor válido entram como zero em
 * vez de contaminar o total com NaN.
 */
export function sumByType(
  transactions: Pick<Transaction, 'amount' | 'type'>[],
  type: TransactionType
): Decimal {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((total, tx) => total.plus(toDecimal(tx.amount)), new MONEY_PRECISION(0))
}

/** Saldo = receitas − despesas. O sinal vem do `type`, nunca do valor. */
export function calculateBalance(
  income: Decimal | number | string,
  expense: Decimal | number | string
): Decimal {
  return new MONEY_PRECISION(income as never).minus(
    new MONEY_PRECISION(expense as never)
  )
}

/**
 * Gastos por categoria, do maior para o menor.
 *
 * A categoria vem da própria transação (join `category:categories(*)`), por
 * isso não é preciso passar a lista de categorias separada.
 *
 * `percentage` é calculado sobre o total de despesas do período. Quando não
 * há despesa alguma, evita divisão por zero e devolve 0.
 */
export function summarizeByCategory(
  transactions: Transaction[]
): CategorySpending[] {
  const expenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.category
  )

  const totals = new Map<string, { category: Category; total: Decimal }>()
  for (const tx of expenses) {
    const existing = totals.get(tx.category_id!)
    if (existing) {
      existing.total = existing.total.plus(toDecimal(tx.amount))
    } else {
      totals.set(tx.category_id!, {
        category: tx.category!,
        total: toDecimal(tx.amount),
      })
    }
  }

  const grandTotal = [...totals.values()].reduce(
    (sum, item) => sum.plus(item.total),
    new MONEY_PRECISION(0)
  )

  return [...totals.values()]
    .sort((a, b) => b.total.comparedTo(a.total))
    .map((item) => ({
      category: item.category,
      total: item.total.toDecimalPlaces(2).toNumber(),
      percentage: grandTotal.isZero()
        ? 0
        : item.total
            .dividedBy(grandTotal)
            .times(100)
            .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)
            .toNumber(),
    }))
}

/**
 * Projeção mês a mês. `months` vem de `getLastSixMonths()` e já traz o
 * intervalo `start`/`end` de cada mês.
 */
export function projectMonthlyTotals(
  transactions: Pick<Transaction, 'amount' | 'type' | 'date'>[],
  months: { label: string; start: string; end: string }[]
): MonthlyChartData[] {
  return months.map((month) => {
    const inMonth = transactions.filter(
      (tx) => tx.date >= month.start && tx.date <= month.end
    )
    return {
      month: month.label,
      income: sumByType(inMonth, 'income').toDecimalPlaces(2).toNumber(),
      expense: sumByType(inMonth, 'expense').toDecimalPlaces(2).toNumber(),
    }
  })
}

/** Resumo do período, usado nos cards do topo do dashboard. */
export function summarizePeriod(
  transactions: Pick<Transaction, 'amount' | 'type'>[]
): { income: number; expense: number; balance: number; transactionCount: number } {
  const income = sumByType(transactions, 'income')
  const expense = sumByType(transactions, 'expense')

  return {
    income: income.toDecimalPlaces(2).toNumber(),
    expense: expense.toDecimalPlaces(2).toNumber(),
    balance: calculateBalance(income, expense).toDecimalPlaces(2).toNumber(),
    transactionCount: transactions.length,
  }
}

export { Decimal }
