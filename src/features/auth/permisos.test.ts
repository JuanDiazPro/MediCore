import { MODULOS_POR_ROL, PERMISOS, puedeVer } from '@/features/auth/permisos'

describe('permisos de menú por rol', () => {
  it('administración ve todo', () => {
    expect(MODULOS_POR_ROL.admin).toHaveLength(8)
    expect(puedeVer('admin', 'configuracion')).toBe(true)
  })

  it('el médico no ve caja, reportes ni configuración', () => {
    expect(puedeVer('medico', 'agenda')).toBe(true)
    expect(puedeVer('medico', 'caja')).toBe(false)
    expect(puedeVer('medico', 'reportes')).toBe(false)
    expect(puedeVer('medico', 'configuracion')).toBe(false)
  })

  it('recepción cobra pero no atiende consultas ni ve reportes', () => {
    expect(puedeVer('recepcion', 'caja')).toBe(true)
    expect(puedeVer('recepcion', 'reportes')).toBe(false)
    expect(PERMISOS.cobrar('recepcion')).toBe(true)
    expect(PERMISOS.atenderConsulta('recepcion')).toBe(false)
  })
})
