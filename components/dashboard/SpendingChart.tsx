'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategorySpending } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import styles from './SpendingChart.module.css'

interface SpendingChartProps {
  data: CategorySpending[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CategorySpending }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipDot} style={{ background: item.category.color }} />
      <div>
        <p className={styles.tooltipLabel}>
          {item.category.icon} {item.category.name}
        </p>
        <p className={styles.tooltipValue}>{formatCurrency(item.total)}</p>
        <p className={styles.tooltipPct}>{item.percentage.toFixed(1)}%</p>
      </div>
    </div>
  )
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📊</span>
        <p>Nenhuma despesa registrada este mês</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category.name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.category.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        {data.slice(0, 6).map((item) => (
          <div key={item.category.id} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: item.category.color }} />
            <span className={styles.legendName}>
              {item.category.icon} {item.category.name}
            </span>
            <span className={styles.legendPct}>{item.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
