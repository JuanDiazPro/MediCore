import {
  agrupar,
  impactoRecordatorios,
  ocupacion,
  serieMensual,
  sumarIngresos,
  tasaInasistencia,
} from '@/lib/metricas'
import { generarBaseDatos } from '@/mocks/generador'
import type { Cita, EstadoCita, Medico, Pago } from '@/types'

const cita = (
  id: string,
  inicio: Date,
  minutos: number,
  estado: EstadoCita,
  pacienteId = 'p1',
): Cita => ({
  id,
  pacienteId,
  medicoId: 'm1',
  servicioId: 's',
  inicio: inicio.toISOString(),
  fin: new Date(inicio.getTime() + minutos * 60000).toISOString(),
  estado,
  recordatorioEnviado: false,
})

describe('métricas', () => {
  it('tasa de inasistencia ignora canceladas y pendientes', () => {
    const d = new Date(2026, 10, 2, 9)
    expect(
      tasaInasistencia([
        cita('a', d, 30, 'asistio'),
        cita('b', d, 30, 'asistio'),
        cita('c', d, 30, 'asistio'),
        cita('d', d, 30, 'no_asistio'),
        cita('e', d, 30, 'cancelada'),
        cita('f', d, 30, 'pendiente'),
      ]),
    ).toBe(0.25)
    expect(tasaInasistencia([])).toBe(0)
  })

  it('suma ingresos en centavos', () => {
    expect(sumarIngresos([{ monto: 0.1 }, { monto: 0.2 }] as Pago[])).toBe(0.3)
  })

  it('calcula la ocupación contra el horario del médico', () => {
    const medico = { id: 'm1', horario: [{ dia: 1, inicio: '09:00', fin: '11:00' }] } as Medico
    const lunes = new Date(2026, 10, 16)
    const citas = [
      cita('a', new Date(2026, 10, 16, 9), 30, 'asistio'),
      cita('b', new Date(2026, 10, 16, 10), 30, 'confirmada'),
      cita('c', new Date(2026, 10, 16, 10, 30), 30, 'cancelada'),
    ]
    expect(ocupacion(citas, [medico], lunes, new Date(2026, 10, 17))).toBe(0.5)
  })

  it('distingue pacientes nuevos y recurrentes por mes', () => {
    const citas = [
      cita('a', new Date(2026, 9, 5, 9), 30, 'asistio', 'p1'),
      cita('b', new Date(2026, 10, 5, 9), 30, 'asistio', 'p1'),
      cita('c', new Date(2026, 10, 6, 9), 30, 'asistio', 'p2'),
      cita('d', new Date(2026, 10, 7, 9), 30, 'no_asistio', 'p3'),
    ]
    const serie = serieMensual(citas, [], new Date(2026, 9, 1), new Date(2026, 10, 20))
    expect(serie.map((s) => [s.clave, s.nuevos, s.recurrentes])).toEqual([
      ['2026-10', 1, 0],
      ['2026-11', 1, 1],
    ])
    expect(serie[1].inasistencia).toBeCloseTo(1 / 3)
  })

  it('agrupa y ordena de mayor a menor', () => {
    expect(agrupar(['a', 'b', 'a'], (x) => x)).toEqual([
      { clave: 'a', valor: 2 },
      { clave: 'b', valor: 1 },
    ])
  })

  it('el escenario semilla muestra que los recordatorios reducen la inasistencia', () => {
    const hoy = new Date(2026, 10, 17)
    const bd = generarBaseDatos({ hoy, pacientes: 120 })
    const { antes, despues } = impactoRecordatorios(bd.citas, bd.clinica.recordatoriosDesde, hoy)
    expect(antes).toBeGreaterThan(despues * 1.8)
  })
})
