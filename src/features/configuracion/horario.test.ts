import { validarHorario } from '@/features/configuracion/horario'

const base = Object.fromEntries(
  [1, 2, 3, 4, 5, 6].map((d) => [d, { activo: false, inicio: '09:00', fin: '14:00' }]),
)

describe('validación del horario del médico', () => {
  it('acepta horarios con salida posterior a la entrada', () => {
    expect(
      validarHorario({ ...base, 1: { activo: true, inicio: '09:00', fin: '14:00' } }),
    ).toBeNull()
  })
  it('rechaza un día activo con salida antes o igual a la entrada', () => {
    expect(validarHorario({ ...base, 3: { activo: true, inicio: '15:00', fin: '15:00' } })).toMatch(
      /Miércoles/,
    )
  })
  it('ignora los días inactivos', () => {
    expect(
      validarHorario({ ...base, 2: { activo: false, inicio: '18:00', fin: '08:00' } }),
    ).toBeNull()
  })
})
