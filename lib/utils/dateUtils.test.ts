import { describe, it, expect } from 'vitest'
import {
  formatISODate,
  formatDate,
  formatMonthYear,
  getMonthRange,
  getCurrentMonthRange,
  getLastSixMonths,
  getTodayISO,
} from '@/lib/utils/dateUtils'

describe('dateUtils', () => {
  describe('formatISODate', () => {
    it('formata ano, mês e dia com dois dígitos preservando a data local', () => {
      const date = new Date(2026, 8, 5) // Setembro é mês 8 (0-indexed)
      expect(formatISODate(date)).toBe('2026-09-05')
    })

    it('formata corretamente o último dia do ano', () => {
      const date = new Date(2026, 11, 31)
      expect(formatISODate(date)).toBe('2026-12-31')
    })
  })

  describe('formatDate', () => {
    it('formata no formato pt-BR dd/mm/aaaa', () => {
      expect(formatDate('2026-09-15')).toBe('15/09/2026')
    })
  })

  describe('formatMonthYear', () => {
    it('formata com abreviação do mês e ano', () => {
      const formatted = formatMonthYear('2026-09-15')
      expect(formatted.toLowerCase()).toContain('2026')
      expect(formatted.toLowerCase()).toContain('set')
    })
  })

  describe('getMonthRange', () => {
    it('retorna o primeiro e o último dia para um mês de 30 dias', () => {
      const range = getMonthRange('2026-09')
      expect(range.start).toBe('2026-09-01')
      expect(range.end).toBe('2026-09-30')
    })

    it('retorna o primeiro e o último dia para um mês de 31 dias', () => {
      const range = getMonthRange('2026-10')
      expect(range.start).toBe('2026-10-01')
      expect(range.end).toBe('2026-10-31')
    })

    it('retorna 28 dias em fevereiro de ano não-bissexto', () => {
      const range = getMonthRange('2026-02')
      expect(range.start).toBe('2026-02-01')
      expect(range.end).toBe('2026-02-28')
    })

    it('retorna 29 dias em fevereiro de ano bissexto (ex: 2028)', () => {
      const range = getMonthRange('2028-02')
      expect(range.start).toBe('2028-02-01')
      expect(range.end).toBe('2028-02-29')
    })
  })

  describe('getCurrentMonthRange', () => {
    it('calcula o intervalo correto mesmo quando now está no dia 31', () => {
      const mock31 = new Date(2026, 2, 31) // 31 de Março
      const range = getCurrentMonthRange(mock31)
      expect(range.start).toBe('2026-03-01')
      expect(range.end).toBe('2026-03-31')
    })
  })

  describe('getLastSixMonths', () => {
    it('gera exatamente 6 meses em ordem cronológica', () => {
      const mockDate = new Date(2026, 8, 15) // Setembro 2026
      const months = getLastSixMonths(mockDate)
      expect(months).toHaveLength(6)
      expect(months[5].start).toBe('2026-09-01')
      expect(months[5].end).toBe('2026-09-30')
      expect(months[0].start).toBe('2026-04-01')
      expect(months[0].end).toBe('2026-04-30')
    })

    it('não pula meses nem duplica quando executado no dia 31', () => {
      // Teste crítico: 31 de Março -> fevereiro não tem 31 dias e causaria overflow
      const mock31Mar = new Date(2026, 2, 31) // 31 de Março de 2026
      const months = getLastSixMonths(mock31Mar)

      expect(months).toHaveLength(6)
      const starts = months.map((m) => m.start)
      expect(starts).toEqual([
        '2025-10-01',
        '2025-11-01',
        '2025-12-01',
        '2026-01-01',
        '2026-02-01',
        '2026-03-01',
      ])
      expect(months[4].end).toBe('2026-02-28') // Fevereiro fecha em 28
    })
  })

  describe('getTodayISO', () => {
    it('retorna a data no formato YYYY-MM-DD', () => {
      const mockDate = new Date(2026, 8, 29)
      expect(getTodayISO(mockDate)).toBe('2026-09-29')
    })
  })
})
