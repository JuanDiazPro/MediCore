import { addDays, nextTuesday, setHours } from 'date-fns'

import { calcularCorte } from '@/lib/caja'
import { generarBaseDatos } from '@/mocks/generador'
import { citasService, consultasService, pagosService, seguimientoService } from '@/services'
import { establecerBD } from '@/services/db'
import { configurarLatencia } from '@/services/latencia'

beforeAll(() => configurarLatencia(0))

it('flujo de demo: recepción agenda, el médico atiende y recepción cobra', async () => {
  const hoy = new Date(2026, 10, 17)
  establecerBD(generarBaseDatos({ hoy, pacientes: 40 }))
  // Martes de la semana siguiente a las 15:00, dentro del horario de med-02 (14:00 a 20:00).
  const dia = nextTuesday(addDays(hoy, 14))
  const ocupadas = await citasService.listar({
    medicoId: 'med-02',
    desde: dia.toISOString(),
    hasta: addDays(dia, 1).toISOString(),
  })
  for (const c of ocupadas) await citasService.cambiarEstado(c.id, 'cancelada')

  // 1. Recepción agenda y confirma
  const cita = await citasService.crear({
    pacienteId: 'pac-003',
    medicoId: 'med-02',
    servicioId: 'srv-02',
    inicio: setHours(dia, 15).toISOString(),
  })
  await citasService.cambiarEstado(cita.id, 'confirmada')

  // 2. El médico atiende y genera receta y plan de seguimiento
  const consulta = await consultasService.registrar({
    citaId: cita.id,
    subjetivo: 'Tos de 3 días.',
    objetivo: 'Campos pulmonares limpios.',
    analisis: 'Rinofaringitis.',
    plan: 'Sintomático.',
    signos: { temperatura: 37.4 },
    diagnosticos: [{ codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' }],
    receta: {
      medicamentos: [
        {
          nombre: 'Paracetamol 500 mg',
          dosis: '1 tableta',
          frecuencia: 'c/8 h',
          duracion: '3 días',
        },
      ],
      indicaciones: 'Líquidos abundantes.',
    },
  })
  expect(consulta.receta?.medicamentos).toHaveLength(1)
  expect((await citasService.obtener(cita.id)).estado).toBe('asistio')
  await seguimientoService.crearPlan({
    pacienteId: 'pac-003',
    medicoId: 'med-02',
    motivo: 'Revisión en 1 semana',
    proximaFecha: addDays(dia, 7).toISOString(),
  })

  // 3. Recepción cobra; no se puede cobrar dos veces
  const pago = await pagosService.registrar({
    pacienteId: 'pac-003',
    servicioId: 'srv-02',
    medicoId: 'med-02',
    citaId: cita.id,
    monto: 850,
    metodo: 'tarjeta',
  })
  await expect(
    pagosService.registrar({
      pacienteId: 'pac-003',
      servicioId: 'srv-02',
      medicoId: 'med-02',
      citaId: cita.id,
      monto: 850,
      metodo: 'efectivo',
    }),
  ).rejects.toThrow(/ya fue cobrada/)

  const delDia = (await pagosService.listar()).filter(
    (p) => p.fecha.slice(0, 10) === pago.fecha.slice(0, 10),
  )
  expect(calcularCorte(delDia).porMetodo.tarjeta.total).toBeGreaterThanOrEqual(850)
  expect(
    (await seguimientoService.listarPlanes({ pacienteId: 'pac-003' })).some(
      (p) => p.motivo === 'Revisión en 1 semana',
    ),
  ).toBe(true)
})
