import { esquemaConsulta } from '@/features/consultas/schemas'
import { construirLineaTiempo } from '@/features/expediente/lineaTiempo'
import { crearRecetaPdf, LEYENDA_DEMO } from '@/lib/pdf'
import { generarBaseDatos } from '@/mocks/generador'

const base = {
  signos: {},
  subjetivo: 'Dolor de garganta de 2 días.',
  objetivo: 'Faringe hiperémica.',
  analisis: 'Faringitis aguda.',
  plan: 'Analgésico y control.',
  diagnosticos: [{ codigo: 'J02.9', descripcion: 'Faringitis aguda, no especificada' }],
  medicamentos: [],
  indicaciones: '',
}

describe('esquema SOAP', () => {
  it('acepta una nota completa y convierte signos vacíos en indefinidos', () => {
    const r = esquemaConsulta.safeParse({ ...base, signos: { temperatura: '37.2', pesoKg: '' } })
    expect(r.success).toBe(true)
    expect(r.data!.signos).toEqual({ temperatura: 37.2, pesoKg: undefined })
  })

  it('exige las cuatro secciones SOAP y al menos un diagnóstico', () => {
    const r = esquemaConsulta.safeParse({ ...base, subjetivo: '', plan: ' ', diagnosticos: [] })
    expect(r.success).toBe(false)
    expect(r.error!.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(['subjetivo', 'plan', 'diagnosticos']),
    )
  })

  it('valida rangos de signos vitales y campos de medicamentos', () => {
    const r = esquemaConsulta.safeParse({
      ...base,
      signos: { temperatura: 50 },
      medicamentos: [{ nombre: 'Paracetamol', dosis: '', frecuencia: 'c/8h', duracion: '3 días' }],
    })
    expect(r.success).toBe(false)
    const rutas = r.error!.issues.map((i) => i.path.join('.'))
    expect(rutas).toEqual(expect.arrayContaining(['signos.temperatura', 'medicamentos.0.dosis']))
  })
})

describe('receta en PDF', () => {
  const bd = generarBaseDatos({ hoy: new Date(2026, 10, 17), pacientes: 20 })
  const consulta = bd.consultas.find((c) => c.receta)!
  const paciente = bd.pacientes.find((p) => p.id === consulta.pacienteId)!
  const medico = bd.medicos.find((m) => m.id === consulta.medicoId)!

  it('incluye datos de la receta y la marca de agua DEMO', () => {
    const doc = crearRecetaPdf({ clinica: bd.clinica, medico, paciente, consulta })
    const contenido = doc.output()
    expect(doc.getNumberOfPages()).toBe(1)
    expect(contenido).toContain(LEYENDA_DEMO)
    expect(contenido).toContain(consulta.receta!.medicamentos[0].nombre)
    expect(contenido).toContain('Receta m')
  })
})

describe('línea de tiempo', () => {
  it('ordena del más reciente al más antiguo y no duplica citas con consulta', () => {
    const bd = generarBaseDatos({ hoy: new Date(2026, 10, 17), pacientes: 20 })
    const pid = bd.consultas[0].pacienteId
    const linea = construirLineaTiempo(
      bd.consultas.filter((c) => c.pacienteId === pid),
      bd.citas.filter((c) => c.pacienteId === pid),
      bd.pagos.filter((p) => p.pacienteId === pid),
      [],
    )
    const fechas = linea.map((e) => e.fecha)
    expect([...fechas].sort().reverse()).toEqual(fechas)
    const citasEnLinea = linea
      .filter((e) => e.tipo === 'cita')
      .map((e) => e.tipo === 'cita' && e.cita.id)
    const citasConConsulta = bd.consultas.filter((c) => c.pacienteId === pid).map((c) => c.citaId)
    expect(citasEnLinea.some((id) => citasConConsulta.includes(id as string))).toBe(false)
  })
})
