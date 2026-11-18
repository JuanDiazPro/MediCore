import { addDays, nextMonday, setHours } from 'date-fns'

import { generarBaseDatos } from '@/mocks/generador'
import {
  authService,
  citasService,
  consultasService,
  pacientesService,
  pagosService,
  seguimientoService,
} from '@/services'
import { establecerBD } from '@/services/db'
import { configurarLatencia } from '@/services/latencia'

const HOY = new Date(2026, 10, 17)

beforeAll(() => configurarLatencia(0))
beforeEach(() => {
  localStorage.clear()
  establecerBD(generarBaseDatos({ hoy: HOY, pacientes: 40 }))
})

describe('authService (simulado)', () => {
  it('acepta los usuarios demo con "demo123"', async () => {
    const u = await authService.iniciarSesion('MEDICO@demo.medicore ', 'demo123')
    expect(u.rol).toBe('medico')
    expect(u.medicoId).toBe('med-01')
  })
  it('rechaza contraseñas incorrectas', async () => {
    await expect(authService.iniciarSesion('admin@demo.medicore', 'x')).rejects.toThrow(
      /incorrectos/,
    )
  })
})

describe('pacientesService', () => {
  it('pagina y busca por nombre o teléfono', async () => {
    const pagina = await pacientesService.listar({ porPagina: 5 })
    expect(pagina.datos).toHaveLength(5)
    expect(pagina.total).toBe(40)
    const objetivo = pagina.datos[2]
    const porNombre = await pacientesService.listar({ texto: objetivo.nombre })
    expect(porNombre.datos.map((p) => p.id)).toContain(objetivo.id)
    const porTel = await pacientesService.listar({ texto: objetivo.telefono.slice(-6) })
    expect(porTel.datos.map((p) => p.id)).toContain(objetivo.id)
  })

  it('crea pacientes y deja registro en la bitácora', async () => {
    const base = (await pacientesService.listarTodos())[0]
    const nuevo = await pacientesService.crear({
      ...base,
      nombre: 'Prueba',
      apellidos: 'Demo Uno',
      correo: 'prueba@demo.medicore',
    })
    expect((await pacientesService.obtener(nuevo.id)).nombre).toBe('Prueba')
    expect(await pacientesService.bitacora(nuevo.id)).toHaveLength(1)
  })
})

describe('citasService', () => {
  const lunes = nextMonday(addDays(HOY, 7))
  const a = (h: number, m = 0) => {
    const d = setHours(lunes, h)
    d.setMinutes(m)
    return d.toISOString()
  }

  it('crea una cita válida y rechaza empalmes', async () => {
    const existentes = await citasService.listar({
      medicoId: 'med-01',
      desde: lunes.toISOString(),
      hasta: addDays(lunes, 1).toISOString(),
    })
    for (const c of existentes) await citasService.cambiarEstado(c.id, 'cancelada')

    const cita = await citasService.crear({
      pacienteId: 'pac-001',
      medicoId: 'med-01',
      servicioId: 'srv-01',
      inicio: a(10),
    })
    expect(cita.estado).toBe('pendiente')
    await expect(
      citasService.crear({
        pacienteId: 'pac-002',
        medicoId: 'med-01',
        servicioId: 'srv-01',
        inicio: a(10, 15),
      }),
    ).rejects.toThrow(/empalma/)
  })

  it('rechaza citas fuera del horario del médico', async () => {
    await expect(
      citasService.crear({
        pacienteId: 'pac-001',
        medicoId: 'med-01',
        servicioId: 'srv-01',
        inicio: a(19),
      }),
    ).rejects.toThrow(/fuera de la jornada/)
  })

  it('al registrar la consulta la cita pasa a "asistió"', async () => {
    const [cita] = await citasService.listar({ estados: ['pendiente', 'confirmada'] })
    await consultasService.registrar({
      citaId: cita.id,
      subjetivo: 's',
      objetivo: 'o',
      analisis: 'a',
      plan: 'p',
      signos: {},
      diagnosticos: [{ codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' }],
    })
    expect((await citasService.obtener(cita.id)).estado).toBe('asistio')
  })
})

describe('pagos y seguimiento', () => {
  it('asigna folios consecutivos', async () => {
    const antes = await pagosService.listar()
    const pago = await pagosService.registrar({
      pacienteId: 'pac-001',
      servicioId: 'srv-01',
      medicoId: 'med-01',
      monto: 500,
      metodo: 'efectivo',
    })
    expect(Number(pago.folio.slice(3))).toBe(antes.length + 1)
  })

  it('registra recordatorios en la bandeja', async () => {
    const antes = (await seguimientoService.listarMensajes()).length
    await seguimientoService.enviarRecordatorio({
      pacienteId: 'pac-001',
      canal: 'sms',
      texto: 'Hola',
      tipo: 'seguimiento',
    })
    expect(await seguimientoService.listarMensajes()).toHaveLength(antes + 1)
  })
})
