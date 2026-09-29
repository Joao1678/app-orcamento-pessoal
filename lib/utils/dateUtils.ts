/** Formata uma data no formato YYYY-MM-DD usando as partes locais da data, sem desvio de UTC. */
export function formatISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(dateStr: string, locale = 'pt-BR'): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatMonthYear(dateStr: string, locale = 'pt-BR'): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getMonthRange(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split('-').map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return {
    start: formatISODate(start),
    end: formatISODate(end),
  }
}

export function getCurrentMonthRange(now = new Date()): { start: string; end: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: formatISODate(start),
    end: formatISODate(end),
  }
}

export function getLastSixMonths(
  now = new Date(),
): { label: string; start: string; end: string }[] {
  const months = []
  for (let i = 5; i >= 0; i--) {
    // Definir explicitamente o dia 1 evita transbordamento quando 'now' está no dia 29, 30 ou 31
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    months.push({
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(start).replace('.', ''),
      start: formatISODate(start),
      end: formatISODate(end),
    })
  }
  return months
}

export function getTodayISO(now = new Date()): string {
  return formatISODate(now)
}
