import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { formatCurrency, parseCurrencyInput } from '@/lib/utils/formatCurrency'

describe('formatCurrency', () => {
  it('formata números como moeda em pt-BR com R$ e duas casas decimais', () => {
    const formatted = formatCurrency(1250.5)
    // Pode conter non-breaking space entre R$ e o número
    expect(formatted).toMatch(/R\$\s?1\.250,50/)
  })

  it('aceita instância de Decimal', () => {
    const dec = new Decimal('3490.99')
    const formatted = formatCurrency(dec)
    expect(formatted).toMatch(/R\$\s?3\.490,99/)
  })

  it('formata valor zero corretamente', () => {
    const formatted = formatCurrency(0)
    expect(formatted).toMatch(/R\$\s?0,00/)
  })
})

describe('parseCurrencyInput', () => {
  it('converte string simples em Decimal exato', () => {
    const dec = parseCurrencyInput('1250.50')
    expect(dec.toString()).toBe('1250.5')
  })

  it('converte string com vírgula em Decimal', () => {
    const dec = parseCurrencyInput('45,90')
    expect(dec.toString()).toBe('45.9')
  })

  it('retorna Decimal(0) para string inválida ou vazia', () => {
    expect(parseCurrencyInput('').toNumber()).toBe(0)
    expect(parseCurrencyInput('abc').toNumber()).toBe(0)
  })
})
