import { ajustarAHoy } from '@/mocks/actualizarFechas'
import { generarBaseDatos } from '@/mocks/generador'

const generadaEl = new Date(2026, 10, 17)

describe('ajuste de fechas al abrir el demo otro día', () => {
  it('el mismo día no cambia nada', () => {
    const bd = generarBaseDatos({ hoy: generadaEl, pacientes: 10 })
    expect(ajustarAHoy(bd, new Date(2026, 10, 17, 18))).toBe(bd)
  })

  it('sin cambios del usuario pide regenerar', () => {
    const bd = generarBaseDatos({ hoy: generadaEl, pacientes: 10 })
    expect(ajustarAHoy(bd, new Date(2026, 10, 20))).toBeNull()
  })

  it('con cambios recorre todo en semanas completas y conserva el día de la semana', () => {
    const bd = generarBaseDatos({ hoy: generadaEl, pacientes: 10 })
    bd.bitacora.push({
      id: 'b',
      pacienteId: bd.pacientes[0].id,
      usuario: 'x',
      accion: 'y',
      fecha: generadaEl.toISOString(),
    })
    const ajustada = ajustarAHoy(bd, new Date(2026, 11, 3))! // 16 días después → 2 semanas
    const antes = new Date(bd.citas[0].inicio)
    const despues = new Date(ajustada.citas[0].inicio)
    expect((despues.getTime() - antes.getTime()) / 86_400_000).toBeCloseTo(14, 0)
    expect(despues.getDay()).toBe(antes.getDay())
    expect(ajustada.bitacora).toHaveLength(1)
    expect(ajustada.pacientes[0].nombre).toBe(bd.pacientes[0].nombre)
  })
})
