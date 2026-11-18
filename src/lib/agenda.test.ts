import { buscarEmpalme, dentroDeHorario, puedeCambiarEstado, seEnciman } from '@/lib/agenda'
import type { Cita, Medico } from '@/types'

const f = (h: number, m = 0) => new Date(2026, 10, 16, h, m).toISOString() // lunes

const cita = (id: string, inicio: string, fin: string, extra: Partial<Cita> = {}): Cita => ({
  id,
  pacienteId: 'p',
  medicoId: 'm1',
  servicioId: 's',
  inicio,
  fin,
  estado: 'pendiente',
  recordatorioEnviado: false,
  ...extra,
})

describe('empalmes', () => {
  it('detecta intervalos encimados y permite citas consecutivas', () => {
    expect(
      seEnciman({ inicio: f(10), fin: f(10, 30) }, { inicio: f(10, 15), fin: f(10, 45) }),
    ).toBe(true)
    expect(seEnciman({ inicio: f(10), fin: f(10, 30) }, { inicio: f(10, 30), fin: f(11) })).toBe(
      false,
    )
  })

  const citas = [
    cita('a', f(10), f(10, 30)),
    cita('b', f(11), f(11, 30), { estado: 'cancelada' }),
    cita('c', f(12), f(12, 30), { medicoId: 'm2' }),
  ]

  it('ignora citas canceladas, de otro médico o la propia cita', () => {
    expect(buscarEmpalme(citas, 'm1', { inicio: f(10, 15), fin: f(10, 45) })?.id).toBe('a')
    expect(buscarEmpalme(citas, 'm1', { inicio: f(11), fin: f(11, 30) })).toBeUndefined()
    expect(buscarEmpalme(citas, 'm1', { inicio: f(12), fin: f(12, 30) })).toBeUndefined()
    expect(buscarEmpalme(citas, 'm1', { inicio: f(10), fin: f(10, 30) }, 'a')).toBeUndefined()
  })
})

describe('horario del médico', () => {
  const medico: Pick<Medico, 'horario'> = { horario: [{ dia: 1, inicio: '09:00', fin: '14:00' }] }
  it('acepta citas dentro de la jornada y rechaza las de fuera', () => {
    expect(dentroDeHorario(medico, { inicio: f(9), fin: f(9, 30) })).toBe(true)
    expect(dentroDeHorario(medico, { inicio: f(13, 30), fin: f(14) })).toBe(true)
    expect(dentroDeHorario(medico, { inicio: f(13, 45), fin: f(14, 15) })).toBe(false)
    expect(dentroDeHorario(medico, { inicio: f(8, 30), fin: f(9) })).toBe(false)
    const martes = new Date(2026, 10, 17, 10).toISOString()
    const martesFin = new Date(2026, 10, 17, 10, 30).toISOString()
    expect(dentroDeHorario(medico, { inicio: martes, fin: martesFin })).toBe(false)
  })
})

describe('cambios de estado', () => {
  it('permite el flujo normal y bloquea transiciones inválidas', () => {
    expect(puedeCambiarEstado('pendiente', 'confirmada')).toBe(true)
    expect(puedeCambiarEstado('confirmada', 'asistio')).toBe(true)
    expect(puedeCambiarEstado('confirmada', 'no_asistio')).toBe(true)
    expect(puedeCambiarEstado('asistio', 'cancelada')).toBe(false)
    expect(puedeCambiarEstado('cancelada', 'asistio')).toBe(false)
    expect(puedeCambiarEstado('cancelada', 'pendiente')).toBe(true)
  })
})
