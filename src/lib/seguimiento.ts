import { differenceInCalendarDays, parseISO } from 'date-fns'

import type { PlanSeguimiento } from '@/types'

export type Vencimiento = 'vencido' | 'esta_semana' | 'proximo' | 'cerrado'

/** Clasifica un plan según su próxima fecha de control respecto a "hoy". */
export function clasificarPlan(plan: PlanSeguimiento, hoy = new Date()): Vencimiento {
  if (plan.estado === 'cerrado') return 'cerrado'
  const dias = differenceInCalendarDays(parseISO(plan.proximaFecha), hoy)
  if (dias < 0) return 'vencido'
  if (dias <= 7) return 'esta_semana'
  return 'proximo'
}

export function diasDeAtraso(plan: PlanSeguimiento, hoy = new Date()) {
  return Math.max(0, differenceInCalendarDays(hoy, parseISO(plan.proximaFecha)))
}

/** Ordena: vencidos primero (los más atrasados arriba), luego por fecha. */
export function ordenarPorPrioridad(planes: PlanSeguimiento[], hoy = new Date()) {
  const peso: Record<Vencimiento, number> = { vencido: 0, esta_semana: 1, proximo: 2, cerrado: 3 }
  return [...planes].sort(
    (a, b) =>
      peso[clasificarPlan(a, hoy)] - peso[clasificarPlan(b, hoy)] ||
      a.proximaFecha.localeCompare(b.proximaFecha),
  )
}

export function resumenVencimientos(planes: PlanSeguimiento[], hoy = new Date()) {
  const r = { vencido: 0, esta_semana: 0, proximo: 0, cerrado: 0 }
  for (const p of planes) r[clasificarPlan(p, hoy)]++
  return r
}
