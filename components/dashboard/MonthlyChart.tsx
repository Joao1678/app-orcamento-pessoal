'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import type { MonthlyChartData } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import styles from './MonthlyChart.module.css'

interface MonthlyChartProps {
  data: MonthlyChartData[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipMonth}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.dataKey === 'income' ? 'var(--color-income-light)' : 'var(--color-expense-light)' }}>
          {p.dataKey === 'income' ? '↑ Receitas' : '↓ Despesas'}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
