import { generarBaseDatos } from '@/mocks/generador'

const hoy = new Date(2026, 10, 17)

describe('generador de datos semilla', () => {
  const bd = generarBaseDatos({ hoy })

  it('es determinista: misma semilla y fecha producen los mismos datos', () => {
    const otra = generarBaseDatos({ hoy })
    expect(JSON.stringify(otra)).toBe(JSON.stringify(bd))
  })

  it('cambia si cambia la semilla', () => {
    const otra = generarBaseDatos({ hoy, semilla: 1 })
    expect(otra.pacientes[0].nombre + otra.pacientes[1].nombre).not.toBe(
      bd.pacientes[0].nombre + bd.pacientes[1].nombre,
    )
  })

  it('genera el volumen esperado', () => {
    expect(bd.medicos).toHaveLength(6)
    expect(bd.pacientes).toHaveLength(250)
    expect(bd.usuarios.map((u) => u.correo)).toEqual([
      'admin@demo.medicore',
      'medico@demo.medicore',
      'recepcion@demo.medicore',
    ])
    expect(bd.citas.length).toBeGreaterThan(1500)
    expect(bd.consultas.length).toBeGreaterThan(500)
    expect(bd.pagos.length).toBeLessThanOrEqual(bd.consultas.length)
    expect(bd.pagos.length).toBeGreaterThan(bd.consultas.length - 40)
  })

  it('solo usa correos ficticios @demo.medicore', () => {
    expect(bd.pacientes.every((p) => p.correo.endsWith('@demo.medicore'))).toBe(true)
  })

  it('cabe holgadamente en localStorage (< 3.2 MB)', () => {
    expect(JSON.stringify(bd).length).toBeLessThan(3.2 * 1024 * 1024)
  })

  it('cuenta la historia del demo: la inasistencia baja tras activar recordatorios', () => {
    const corte = bd.clinica.recordatoriosDesde
    const tasa = (citas: typeof bd.citas) => {
      const cerradas = citas.filter((c) => c.estado === 'asistio' || c.estado === 'no_asistio')
      return cerradas.filter((c) => c.estado === 'no_asistio').length / cerradas.length
    }
    const antes = tasa(bd.citas.filter((c) => c.inicio < corte))
    const despues = tasa(bd.citas.filter((c) => c.inicio >= corte && c.fin < hoy.toISOString()))
    expect(antes).toBeGreaterThan(0.15)
    expect(despues).toBeLessThan(0.12)
  })

  it('no genera citas empalmadas para el mismo médico', () => {
    const porMedico = new Map<string, typeof bd.citas>()
    for (const c of bd.citas) porMedico.set(c.medicoId, [...(porMedico.get(c.medicoId) ?? []), c])
    for (const citas of porMedico.values()) {
      const ordenadas = [...citas].sort((a, b) => a.inicio.localeCompare(b.inicio))
      for (let i = 1; i < ordenadas.length; i++) {
        expect(ordenadas[i].inicio >= ordenadas[i - 1].fin).toBe(true)
      }
    }
  })
})
