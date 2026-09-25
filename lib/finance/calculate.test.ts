import { describe, it, expect } from 'vitest'
import {
  sumByType,
  calculateBalance,
  summarizeByCategory,
  projectMonthlyTotals,
  summarizePeriod,
  toDecimal,
} from '@/lib/finance/calculate'
import type { Category, Transaction } from '@/types/database'

function tx(partial: Partial<Transaction> & { amount: number }): Transaction {
  return {
    id: partial.id ?? crypto.randomUUID(),
    user_id: 'user-1',
    category_id: partial.category_id ?? null,
    amount: partial.amount,
    type: partial.type ?? 'expense',
    description: null,
    date: partial.date ?? '2026-09-10',
    created_at: '2026-09-10T00:00:00Z',
    category: partial.category,
  }
}

function category(id: string, name: string): Category {
  return {
    id,
    user_id: 'user-1',
    name,
    icon: '💰',
    color: '#7C3AED',
    type: 'expense',
    created_at: '2026-09-01T00:00:00Z',
  }
}

describe('toDecimal', () => {
  it('preserva a exatidão que o float perderia', () => {
    // 0.1 + 0.2 === 0.30000000000000004 em IEEE 754
    expect(toDecimal('0.1').plus(toDecimal('0.2')).toString()).toBe('0.3')
  })

  it('aceita number e string', () => {
    expect(toDecimal(10.5).toString()).toBe('10.5')
    expect(toDecimal('10.5').toString()).toBe('10.5')
  })
})

describe('sumByType', () => {
  it('soma apenas o tipo pedido', () => {
    const txs = [
      tx({ amount: 100, type: 'income' }),
      tx({ amount: 30.5, type: 'expense' }),
      tx({ amount: 69.5, type: 'expense' }),
    ]
    expect(sumByType(txs, 'income').toNumber()).toBe(100)
    expect(sumByType(txs, 'expense').toNumber()).toBe(100)
  })

  it('não acumula erro ao somar many valores fracionários', () => {
    // Dez cópias de 0.1 somadas em float dariam 0.9999999999999999
    const txs = Array.from({ length: 10 }, () => tx({ amount: 0.1 }))
    expect(sumByType(txs, 'expense').toString()).toBe('1')
  })

  it('devolve zero para lista vazia', () => {
    expect(sumByType([], 'income').toNumber()).toBe(0)
  })
})

describe('calculateBalance', () => {
  it('subtrai despesas das receitas', () => {
    expect(calculateBalance(1000, 250.75).toNumber()).toBe(749.25)
  })

  it('aceita Decimal e number', () => {
    expect(calculateBalance(toDecimal(500), 200).toNumber()).toBe(300)
  })

  it('fica negativo quando as despesas superam as receitas', () => {
    expect(calculateBalance(100, 250).toNumber()).toBe(-150)
  })
})

describe('summarizeByCategory', () => {
  it('agrupa e ordena do maior para o menor', () => {
    const mercado = category('c1', 'Mercado')
    const cafe = category('c2', 'Café')
    const txs = [
      tx({ amount: 20, category_id: 'c1', category: mercado }),
      tx({ amount: 80, category_id: 'c2', category: cafe }),
      tx({ amount: 30, category_id: 'c1', category: mercado }),
    ]

    const result = summarizeByCategory(txs)

    expect(result).toHaveLength(2)
    expect(result[0].category.name).toBe('Café')
    expect(result[0].total).toBe(80)
    expect(result[1].total).toBe(50)
  })

  it('calcula a porcentagem sobre o total de despesas', () => {
    const c1 = category('c1', 'A')
    const c2 = category('c2', 'B')
    const result = summarizeByCategory([
      tx({ amount: 75, category_id: 'c1', category: c1 }),
      tx({ amount: 25, category_id: 'c2', category: c2 }),
    ])
    expect(result[0].percentage).toBe(75)
    expect(result[1].percentage).toBe(25)
  })

  it('ignora receitas e transações sem categoria', () => {
    const c1 = category('c1', 'A')
    const result = summarizeByCategory([
      tx({ amount: 500, type: 'income', category_id: 'c1', category: c1 }),
      tx({ amount: 10 }),
    ])
    expect(result).toHaveLength(0)
  })

  it('não divide por zero quando não há despesas', () => {
    expect(summarizeByCategory([])).toEqual([])
  })
})

describe('projectMonthlyTotals', () => {
  it('separa os totais por mês e preenche meses vazios com zero', () => {
    const months = [
      { label: 'set', start: '2026-09-01', end: '2026-09-30' },
      { label: 'out', start: '2026-10-01', end: '2026-10-31' },
    ]
    const result = projectMonthlyTotals(
      [
        tx({ amount: 100, type: 'income', date: '2026-09-05' }),
        tx({ amount: 40, type: 'expense', date: '2026-09-20' }),
      ],
      months
    )

    expect(result).toEqual([
      { month: 'set', income: 100, expense: 40 },
      { month: 'out', income: 0, expense: 0 },
    ])
  })
})

describe('summarizePeriod', () => {
  it('devolve receitas, despesas, saldo e contagem', () => {
    const result = summarizePeriod([
      tx({ amount: 3000, type: 'income' }),
      tx({ amount: 1250.55, type: 'expense' }),
    ])

    expect(result).toEqual({
      income: 3000,
      expense: 1250.55,
      balance: 1749.45,
      transactionCount: 2,
    })
  })

  it('mantém o saldo exato onde o float erraria', () => {
    // 0.1 + 0.2 - 0.3 em float: -1.1102230246251565e-16
    const result = summarizePeriod([
      tx({ amount: 0.1, type: 'income' }),
      tx({ amount: 0.2, type: 'income' }),
      tx({ amount: 0.3, type: 'expense' }),
    ])
    expect(result.balance).toBe(0)
  })
})
