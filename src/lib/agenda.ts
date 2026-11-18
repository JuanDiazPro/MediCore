import type { Cita, EstadoCita, Medico } from '@/types'

/** Estados que ocupan el horario del médico. */
const OCUPAN: EstadoCita[] = ['pendiente', 'confirmada', 'asistio']

export interface Intervalo {
  inicio: string | Date
  fin: string | Date
}

const ms = (f: string | Date) => (typeof f === 'string' ? new Date(f) : f).getTime()

/** ¿Se enciman dos intervalos? (Tocar el borde no cuenta: 10:00-10:30 y 10:30-11:00 no chocan.) */
export function seEnciman(a: Intervalo, b: Intervalo) {
  return ms(a.inicio) < ms(b.fin) && ms(b.inicio) < ms(a.fin)
}

/** Busca una cita del mismo médico que choque con el intervalo dado. */
export function buscarEmpalme(
  citas: Cita[],
  medicoId: string,
  intervalo: Intervalo,
  ignorarId?: string,
): Cita | undefined {
  return citas.find(
    (c) =>
      c.medicoId === medicoId &&
      c.id !== ignorarId &&
      OCUPAN.includes(c.estado) &&
      seEnciman(c, intervalo),
  )
}

const minutosDelDia = (f: Date) => f.getHours() * 60 + f.getMinutes()
const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** ¿El intervalo cae completo dentro del horario del médico ese día? */
export function dentroDeHorario(medico: Pick<Medico, 'horario'>, intervalo: Intervalo) {
  const inicio = new Date(intervalo.inicio)
  const fin = new Date(intervalo.fin)
  if (inicio.toDateString() !== fin.toDateString() && minutosDelDia(fin) !== 0) return false
  const turno = medico.horario.find((h) => h.dia === inicio.getDay())
  if (!turno) return false
  const finMin = minutosDelDia(fin) === 0 ? 24 * 60 : minutosDelDia(fin)
  return minutosDelDia(inicio) >= aMinutos(turno.inicio) && finMin <= aMinutos(turno.fin)
}

/** Transiciones de estado permitidas. */
const TRANSICIONES: Record<EstadoCita, EstadoCita[]> = {
  pendiente: ['confirmada', 'asistio', 'no_asistio', 'cancelada'],
  confirmada: ['pendiente', 'asistio', 'no_asistio', 'cancelada'],
  asistio: ['no_asistio'],
  no_asistio: ['asistio'],
  cancelada: ['pendiente'],
}

export function puedeCambiarEstado(de: EstadoCita, a: EstadoCita) {
  return de === a || TRANSICIONES[de].includes(a)
}
