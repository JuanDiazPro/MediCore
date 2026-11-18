import type { DiaSemana } from '@/types'

export const DIAS: { dia: DiaSemana; nombre: string }[] = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
]

export type FilaHorario = { activo: boolean; inicio: string; fin: string }

/** Validación del horario: fin posterior al inicio en cada día activo. */
export function validarHorario(filas: Record<number, FilaHorario>): string | null {
  for (const { dia, nombre } of DIAS) {
    const f = filas[dia]
    if (f.activo && f.fin <= f.inicio)
      return `${nombre}: la hora de salida debe ser posterior a la de entrada.`
  }
  return null
}
