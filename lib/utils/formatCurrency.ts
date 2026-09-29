import Decimal from 'decimal.js'

export function formatCurrency(
  value: number | Decimal,
  currency = 'BRL',
  locale = 'pt-BR',
): string {
  const numericValue = value instanceof Decimal ? value.toNumber() : value
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numericValue)
}

/**
 * Converte entradas de texto (como "1.250,50" ou "1250.50") em Decimal exato.
 * Em caso de entrada inválida ou vazia, devolve Decimal(0).
 */
export function parseCurrencyInput(value: string): Decimal {
  if (!value || typeof value !== 'string') return new Decimal(0)

  // Remove caracteres que não sejam dígitos, separadores decimais ou sinal
  const cleaned = value
    .trim()
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.')
  try {
    const dec = new Decimal(cleaned)
    return dec.isFinite() ? dec : new Decimal(0)
  } catch {
    return new Decimal(0)
  }
}
