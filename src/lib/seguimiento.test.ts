import {
  clasificarPlan,
  diasDeAtraso,
  ordenarPorPrioridad,
  resumenVencimientos,
} from '@/lib/seguimiento'
import type { PlanSeguimiento } from '@/types'

const HOY = new Date(2026, 10, 17, 10)
const plan = (
  id: string,
  dias: number,
  estado: PlanSeguimiento['estado'] = 'activo',
): PlanSeguimiento => ({
  id,
  pacienteId: 'p',
  medicoId: 'm',
  motivo: 'Control',
  proximaFecha: new Date(2026, 10, 17 + dias, 9).toISOString(),
  estado,
  creadoEn: HOY.toISOString(),
})

describe('vencimientos de seguimiento', () => {
  it('clasifica vencido, esta semana, próximo y cerrado', () => {
    expect(clasificarPlan(plan('a', -1), HOY)).toBe('vencido')
    expect(clasificarPlan(plan('b', 0), HOY)).toBe('esta_semana')
    expect(clasificarPlan(plan('c', 7), HOY)).toBe('esta_semana')
    expect(clasificarPlan(plan('d', 8), HOY)).toBe('proximo')
    expect(clasificarPlan(plan('e', -10, 'cerrado'), HOY)).toBe('cerrado')
  })

  it('calcula los días de atraso (0 si no está vencido)', () => {
    expect(diasDeAtraso(plan('a', -12), HOY)).toBe(12)
    expect(diasDeAtraso(plan('b', 3), HOY)).toBe(0)
  })

  it('ordena por prioridad: vencidos más atrasados primero', () => {
    const orden = ordenarPorPrioridad(
      [
        plan('prox', 20),
        plan('venc1', -2),
        plan('semana', 3),
        plan('venc2', -9),
        plan('cer', -1, 'cerrado'),
      ],
      HOY,
    ).map((p) => p.id)
    expect(orden).toEqual(['venc2', 'venc1', 'semana', 'prox', 'cer'])
  })

  it('resume conteos', () => {
    expect(
      resumenVencimientos([plan('a', -1), plan('b', -3), plan('c', 2), plan('d', 30)], HOY),
    ).toEqual({
      vencido: 2,
      esta_semana: 1,
      proximo: 1,
      cerrado: 0,
    })
  })
})
