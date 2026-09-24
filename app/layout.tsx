import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinanceFlow — Orçamento Pessoal',
  description: 'Gerencie suas finanças pessoais com inteligência. Acompanhe receitas, despesas e metas financeiras.',
  keywords: ['finanças pessoais', 'orçamento', 'controle financeiro', 'despesas', 'receitas'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
