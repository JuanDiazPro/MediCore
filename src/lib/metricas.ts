import {
  addDays,
  differenceInCalendarDays,
  eachMonthOfInterval,
  format,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'

import type { Cita, Medico, Pago } from '@/types'

const enRango = (iso: string, desde: Date, hasta: Date) =>
  iso >= desde.toISOString() && iso < hasta.toISOString()

/** Inasistencia = no asistió / (asistió + no asistió). Las canceladas no cuentan. */
export function tasaInasistencia(citas: Cita[]) {
  let asistio = 0
  let falto = 0
  for (const c of citas) {
    if (c.estado === 'asistio') asistio++
    else if (c.estado === 'no_asistio') falto++
  }
  return asistio + falto === 0 ? 0 : falto / (asistio + falto)
}

export function sumarIngresos(pagos: Pago[]) {
  return Math.round(pagos.reduce((s, p) => s + p.monto * 100, 0)) / 100
}

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Minutos ocupados por citas activas / minutos disponibles de los médicos en el rango. */
export function ocupacion(citas: Cita[], medicos: Medico[], desde: Date, hasta: Date) {
  let disponibles = 0
  const dias = differenceInCalendarDays(hasta, desde)
  for (let i = 0; i < dias; i++) {
    const dia = addDays(desde, i).getDay()
    for (const m of medicos) {
      for (const h of m.horario)
        if (h.dia === dia) disponibles += aMinutos(h.fin) - aMinutos(h.inicio)
    }
  }
  const ids = new Set(medicos.map((m) => m.id))
  const ocupados = citas
    .filter(
      (c) => ids.has(c.medicoId) && c.estado !== 'cancelada' && enRango(c.inicio, desde, hasta),
    )
    .reduce((s, c) => s + (new Date(c.fin).getTime() - new Date(c.inicio).getTime()) / 60000, 0)
  return disponibles === 0 ? 0 : Math.min(1, ocupados / disponibles)
}

export interface PuntoMensual {
  clave: string
  mes: string
  ingresos: number
  citas: number
  inasistencia: number
  nuevos: number
  recurrentes: number
}

/**
 * Serie mensual: ingresos, citas, tasa de inasistencia y pacientes nuevos contra recurrentes
 * (nuevo = su primera visita a la clínica ocurrió ese mes).
 */
export function serieMensual(
  citas: Cita[],
  pagos: Pago[],
  desde: Date,
  hasta: Date,
): PuntoMensual[] {
  const primeraVisita = new Map<string, string>()
  for (const c of citas) {
    if (c.estado !== 'asistio') continue
    const previa = primeraVisita.get(c.pacienteId)
    if (!previa || c.inicio < previa) primeraVisita.set(c.pacienteId, c.inicio)
  }
  return eachMonthOfInterval({ start: startOfMonth(desde), end: hasta }).map((inicioMes) => {
    const finMes = startOfMonth(addDays(inicioMes, 32))
    const delMes = citas.filter((c) => enRango(c.inicio, inicioMes, finMes))
    const atendidos = new Set(delMes.filter((c) => c.estado === 'asistio').map((c) => c.pacienteId))
    let nuevos = 0
    for (const p of atendidos) if (enRango(primeraVisita.get(p)!, inicioMes, finMes)) nuevos++
    return {
      clave: format(inicioMes, 'yyyy-MM'),
      mes: format(inicioMes, 'MMM yy', { locale: es }).replace('.', ''),
      ingresos: sumarIngresos(pagos.filter((p) => enRango(p.fecha, inicioMes, finMes))),
      citas: delMes.filter((c) => c.estado !== 'cancelada').length,
      inasistencia: tasaInasistencia(delMes),
      nuevos,
      recurrentes: atendidos.size - nuevos,
    }
  })
}

/** Agrupa y suma; devuelve de mayor a menor. */
export function agrupar<T>(
  items: T[],
  clave: (x: T) => string,
  valor: (x: T) => number = () => 1,
): { clave: string; valor: number }[] {
  const mapa = new Map<string, number>()
  for (const x of items) mapa.set(clave(x), (mapa.get(clave(x)) ?? 0) + valor(x))
  return [...mapa.entries()]
    .map(([k, v]) => ({ clave: k, valor: Math.round(v * 100) / 100 }))
    .sort((a, b) => b.valor - a.valor)
}

/** Inasistencia antes y después de activar recordatorios (la historia del demo). */
export function impactoRecordatorios(citas: Cita[], desdeRecordatorios: string, hoy = new Date()) {
  const corte = startOfDay(hoy).toISOString()
  return {
    antes: tasaInasistencia(citas.filter((c) => c.inicio < desdeRecordatorios)),
    despues: tasaInasistencia(
      citas.filter((c) => c.inicio >= desdeRecordatorios && c.inicio < corte),
    ),
  }
}
