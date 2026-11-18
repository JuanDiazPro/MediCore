import type { Cita, Consulta, Pago, PlanSeguimiento } from '@/types'

export type EventoTiempo =
  | { tipo: 'consulta'; fecha: string; consulta: Consulta }
  | { tipo: 'cita'; fecha: string; cita: Cita }
  | { tipo: 'pago'; fecha: string; pago: Pago }
  | { tipo: 'seguimiento'; fecha: string; plan: PlanSeguimiento }

/**
 * Une consultas, citas (las que no derivaron en consulta), pagos y planes en una sola
 * línea de tiempo, del más reciente al más antiguo.
 */
export function construirLineaTiempo(
  consultas: Consulta[],
  citas: Cita[],
  pagos: Pago[],
  planes: PlanSeguimiento[],
): EventoTiempo[] {
  const conConsulta = new Set(consultas.map((c) => c.citaId))
  const eventos: EventoTiempo[] = [
    ...consultas.map((consulta) => ({
      tipo: 'consulta' as const,
      fecha: consulta.fecha,
      consulta,
    })),
    ...citas
      .filter((c) => !conConsulta.has(c.id))
      .map((cita) => ({ tipo: 'cita' as const, fecha: cita.inicio, cita })),
    ...pagos.map((pago) => ({ tipo: 'pago' as const, fecha: pago.fecha, pago })),
    ...planes.map((plan) => ({ tipo: 'seguimiento' as const, fecha: plan.creadoEn, plan })),
  ]
  return eventos.sort((a, b) => b.fecha.localeCompare(a.fecha))
}
