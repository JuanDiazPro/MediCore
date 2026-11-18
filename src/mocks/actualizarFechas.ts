import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

import type { BaseDatos } from '@/types'

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

function desplazar<T>(valor: T, dias: number): T {
  if (typeof valor === 'string') {
    return (ISO.test(valor) ? addDays(parseISO(valor), dias).toISOString() : valor) as T
  }
  if (Array.isArray(valor)) return valor.map((v) => desplazar(v, dias)) as T
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, desplazar(v, dias)])) as T
  }
  return valor
}

/** ¿El usuario ya hizo cambios en este navegador? */
export function tieneCambios(bd: BaseDatos) {
  return bd.bitacora.length > 0 || bd.campanas.length > 0
}

/**
 * Los datos semilla se generan alrededor de "hoy". Si se abren otro día:
 * - sin cambios del usuario → conviene regenerarlos (devuelve `null`);
 * - con cambios → se recorren todas las fechas en semanas completas, para conservar los
 *   cambios y que cada cita siga cayendo en el mismo día de la semana (horario del médico).
 */
export function ajustarAHoy(bd: BaseDatos, hoy = new Date()): BaseDatos | null {
  const dias = differenceInCalendarDays(startOfDay(hoy), parseISO(bd.generadaEn))
  if (dias === 0) return bd
  if (!tieneCambios(bd)) return null
  const semanas = Math.trunc(dias / 7)
  if (semanas === 0) return bd
  return desplazar(bd, semanas * 7)
}
