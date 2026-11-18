import { Faker, base, es, es_MX } from '@faker-js/faker'
import { addDays, addMinutes, isBefore, setHours, setMinutes, startOfDay, subDays } from 'date-fns'

import {
  CIE10,
  ESPECIALIDADES,
  MEDICAMENTOS_EJEMPLO,
  MOTIVOS_SEGUIMIENTO,
  SERVICIOS_BASE,
} from '@/mocks/catalogos'
import type {
  BaseDatos,
  Cita,
  Consulta,
  DiaSemana,
  EstadoCita,
  HorarioDia,
  Medico,
  Mensaje,
  MetodoPago,
  Paciente,
  Pago,
  PlanSeguimiento,
  Sexo,
  TipoSangre,
  Usuario,
} from '@/types'

export const SEMILLA = 20261117
export { VERSION_ESQUEMA } from '@/mocks/version'
import { VERSION_ESQUEMA } from '@/mocks/version'

const DIAS_HISTORIA = 182
const DIAS_FUTURO = 28
/** Hace cuántos días la clínica activó los recordatorios (escenario del demo). */
const DIAS_DESDE_RECORDATORIOS = 90
/** Tasas de inasistencia antes y después de activar recordatorios. */
const INASISTENCIA_ANTES = 0.22
const INASISTENCIA_DESPUES = 0.08

const pad = (n: number, largo = 3) => String(n).padStart(largo, '0')

/** Quita acentos y espacios para armar correos ficticios. */
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

function horario(dias: DiaSemana[], inicio: string, fin: string): HorarioDia[] {
  return dias.map((dia) => ({ dia, inicio, fin }))
}

const HORARIOS_MEDICOS: HorarioDia[][] = [
  [...horario([1, 2, 3, 4, 5], '09:00', '15:00'), ...horario([6], '09:00', '13:00')],
  horario([1, 2, 3, 4, 5], '14:00', '20:00'),
  horario([1, 3, 5], '09:00', '15:00'),
  horario([2, 4], '10:00', '18:00'),
  [...horario([1, 2, 4], '15:00', '20:00'), ...horario([6], '09:00', '13:00')],
  horario([1, 2, 3, 4, 5], '08:00', '13:00'),
]

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const SOAP: Record<string, { s: string; o: string; a: string; p: string }> = {
  default: {
    s: 'Paciente refiere molestias de varios días de evolución.',
    o: 'Consciente, orientado, hidratado. Sin datos de alarma.',
    a: 'Cuadro compatible con el diagnóstico registrado.',
    p: 'Tratamiento indicado, medidas generales y cita de control.',
  },
  I10: {
    s: 'Acude a control de presión arterial. Niega cefalea o mareo.',
    o: 'TA ligeramente elevada. Ruidos cardiacos rítmicos.',
    a: 'Hipertensión arterial en control parcial.',
    p: 'Ajuste de tratamiento, dieta baja en sodio, control en 4 semanas.',
  },
  'E11.9': {
    s: 'Control de diabetes. Refiere apego parcial a la dieta.',
    o: 'Glucosa capilar 160 mg/dL. Pies sin lesiones.',
    a: 'Diabetes mellitus tipo 2 en descontrol leve.',
    p: 'Reforzar dieta y ejercicio, laboratorios de control.',
  },
  'Z00.1': {
    s: 'Control del niño sano. Madre sin preocupaciones.',
    o: 'Peso y talla en percentil adecuado para la edad.',
    a: 'Crecimiento y desarrollo normales.',
    p: 'Esquema de vacunación al corriente. Próximo control en 2 meses.',
  },
  'Z34.9': {
    s: 'Control prenatal. Refiere movimientos fetales presentes.',
    o: 'Fondo uterino acorde a semanas de gestación. FCF normal.',
    a: 'Embarazo normoevolutivo.',
    p: 'Ácido fólico, ultrasonido de control y cita en 4 semanas.',
  },
}

export interface OpcionesGenerador {
  /** Fecha de referencia ("hoy"); los datos se generan alrededor de ella. */
  hoy?: Date
  semilla?: number
  pacientes?: number
}

/**
 * Genera la base de datos semilla del demo. Es DETERMINISTA: con la misma semilla y la misma
 * fecha de referencia produce exactamente los mismos datos.
 */
export function generarBaseDatos(opciones: OpcionesGenerador = {}): BaseDatos {
  const hoy = startOfDay(opciones.hoy ?? new Date())
  const faker = new Faker({ locale: [es_MX, es, base] })
  faker.seed(opciones.semilla ?? SEMILLA)
  /** Un solo apellido simple (Faker a veces devuelve apellidos compuestos). */
  const apellido = () =>
    faker.person
      .lastName()
      .split(' ')
      .filter((w) => !/^(de|del|la|las|los|y)$/i.test(w))[0]
  const totalPacientes = opciones.pacientes ?? 250

  const inicioHistoria = subDays(hoy, DIAS_HISTORIA)
  const recordatoriosDesde = subDays(hoy, DIAS_DESDE_RECORDATORIOS)
  const ahora = setHours(hoy, 12) // "mediodía" de hoy: separa citas pasadas y futuras del día

  // Clínica
  const clinica = {
    id: 'cli-01',
    nombre: 'Clínica Integral Demo',
    direccion: `${faker.location.street()} ${faker.location.buildingNumber()}, ${faker.location.city()}`,
    telefono: `55 ${faker.string.numeric(4)} ${faker.string.numeric(4)}`,
    correo: 'contacto@demo.medicore',
    horario: [...horario([1, 2, 3, 4, 5], '08:00', '20:00'), ...horario([6], '09:00', '14:00')],
    recordatoriosDesde: recordatoriosDesde.toISOString(),
  }

  // Médicos
  const medicos: Medico[] = ESPECIALIDADES.map((esp, i) => {
    const sexo = faker.helpers.arrayElement(['female', 'male'] as const)
    const nombre = `${faker.person.firstName(sexo)} ${apellido()} ${apellido()}`
    return {
      id: `med-${pad(i + 1, 2)}`,
      nombre: `${sexo === 'female' ? 'Dra.' : 'Dr.'} ${nombre}`,
      especialidad: esp.nombre,
      cedula: `DEMO-${faker.string.numeric(7)}`,
      color: esp.color,
      horario: HORARIOS_MEDICOS[i],
      activo: true,
    }
  })

  // Pacientes
  const tiposSangre: TipoSangre[] = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-']
  const alergiasPosibles = ['Penicilina', 'Sulfas', 'AINE', 'Mariscos', 'Látex', 'Polen']
  const antecedentes = [
    'Madre con hipertensión arterial.',
    'Padre con diabetes mellitus tipo 2.',
    'Abuelos con cardiopatía.',
    'Sin antecedentes de importancia.',
  ]
  const pacientes: Paciente[] = Array.from({ length: totalPacientes }, (_, i) => {
    const sexo: Sexo = faker.helpers.arrayElement(['F', 'M'])
    const nombre = faker.person.firstName(sexo === 'F' ? 'female' : 'male')
    const apellidos = `${apellido()} ${apellido()}`
    // 60 % ya eran pacientes antes del periodo; 40 % llegan durante el periodo (pacientes nuevos).
    const antiguo = i < totalPacientes * 0.6
    const creadoEn = antiguo
      ? subDays(inicioHistoria, faker.number.int({ min: 10, max: 900 }))
      : addDays(inicioHistoria, faker.number.int({ min: 0, max: DIAS_HISTORIA }))
    const pediatrico = faker.number.float() < 0.15
    const fechaNacimiento = subDays(
      hoy,
      pediatrico
        ? faker.number.int({ min: 200, max: 365 * 12 })
        : faker.number.int({ min: 365 * 18, max: 365 * 80 }),
    )
    // Pediatría para niños; el resto, ponderado hacia medicina general.
    const medicoId = pediatrico
      ? 'med-02'
      : faker.helpers.weightedArrayElement(
          [
            { value: 'med-01', weight: 5 },
            { value: 'med-03', weight: sexo === 'F' ? 3 : 0 },
            { value: 'med-04', weight: 2 },
            { value: 'med-05', weight: 2 },
            { value: 'med-06', weight: 2 },
          ].filter((o) => o.weight > 0),
        )
    const alergias =
      faker.number.float() < 0.25
        ? faker.helpers.arrayElements(alergiasPosibles, { min: 1, max: 2 })
        : []
    return {
      id: `pac-${pad(i + 1)}`,
      nombre,
      apellidos,
      fechaNacimiento: fechaNacimiento.toISOString(),
      sexo,
      telefono: `55 ${faker.string.numeric(4)} ${faker.string.numeric(4)}`,
      correo: `${slug(nombre)}.${slug(apellidos.split(' ')[0])}${i + 1}@demo.medicore`,
      tipoSangre: faker.helpers.arrayElement(tiposSangre),
      alergias,
      medicoId,
      historia: {
        heredofamiliares: faker.helpers.arrayElement(antecedentes),
        personalesPatologicos: faker.helpers.arrayElement([
          'Niega enfermedades crónicas.',
          'Cirugía de apéndice hace 10 años.',
          'Asma en la infancia.',
          'Niega hospitalizaciones previas.',
        ]),
        personalesNoPatologicos: faker.helpers.arrayElement([
          'Sedentarismo. Dieta irregular.',
          'Actividad física 3 veces por semana.',
          'Tabaquismo negado. Alcohol ocasional.',
          'Esquema de vacunación completo.',
        ]),
      },
      creadoEn: creadoEn.toISOString(),
    }
  })

  const pacientesPorMedico = new Map<string, Paciente[]>()
  for (const p of pacientes) {
    const lista = pacientesPorMedico.get(p.medicoId) ?? []
    lista.push(p)
    pacientesPorMedico.set(p.medicoId, lista)
  }

  // Citas, consultas y pagos
  const citas: Cita[] = []
  const consultas: Consulta[] = []
  const pagos: Pago[] = []
  const servicioPorId = new Map(SERVICIOS_BASE.map((s) => [s.id, s]))
  const cie = new Map(CIE10.map((c) => [c.codigo, c]))
  let folio = 1

  for (let d = 0; d <= DIAS_HISTORIA + DIAS_FUTURO; d++) {
    const dia = addDays(inicioHistoria, d)
    const diaSemana = dia.getDay() as DiaSemana
    const despuesRecordatorios = !isBefore(dia, recordatoriosDesde)

    medicos.forEach((medico, mi) => {
      const turno = medico.horario.find((h) => h.dia === diaSemana)
      if (!turno) return
      const esp = ESPECIALIDADES[mi]
      const propios = pacientesPorMedico.get(medico.id) ?? []
      let minuto = aMinutos(turno.inicio)
      const fin = aMinutos(turno.fin)

      while (minuto < fin) {
        const servicioId = faker.helpers.arrayElement(esp.servicios)
        const duracion = servicioPorId.get(servicioId)!.duracionMin
        if (minuto + duracion > fin) break
        const ocupar = faker.number.float() < (d > DIAS_HISTORIA + 7 ? 0.3 : 0.45)
        if (ocupar) {
          const inicio = setMinutes(setHours(dia, 0), minuto)
          const finCita = addMinutes(inicio, duracion)
          const candidatos = (faker.number.float() < 0.85 ? propios : pacientes).filter(
            (p) => p.creadoEn <= inicio.toISOString(),
          )
          if (candidatos.length > 0) {
            const paciente = faker.helpers.arrayElement(candidatos)
            const pasada = isBefore(finCita, ahora)
            let estado: EstadoCita
            if (pasada) {
              const r = faker.number.float()
              const tasa = despuesRecordatorios ? INASISTENCIA_DESPUES : INASISTENCIA_ANTES
              estado = r < 0.04 ? 'cancelada' : r < 0.04 + tasa ? 'no_asistio' : 'asistio'
            } else {
              const diasFaltan = d - DIAS_HISTORIA
              estado =
                faker.number.float() < (diasFaltan <= 2 ? 0.7 : 0.35) ? 'confirmada' : 'pendiente'
            }
            const recordatorioEnviado =
              despuesRecordatorios && (pasada || d - DIAS_HISTORIA <= 1) && estado !== 'cancelada'

            const cita: Cita = {
              id: `cit-${pad(citas.length + 1, 5)}`,
              pacienteId: paciente.id,
              medicoId: medico.id,
              servicioId,
              inicio: inicio.toISOString(),
              fin: finCita.toISOString(),
              estado,
              recordatorioEnviado,
            }
            citas.push(cita)

            if (estado === 'asistio') {
              paciente.ultimoContacto = cita.fin
              const codigo = faker.helpers.arrayElement(esp.dx)
              const plantilla = SOAP[codigo] ?? SOAP.default
              const consultaId = `con-${pad(consultas.length + 1, 5)}`
              const conReceta = faker.number.float() < 0.45
              consultas.push({
                id: consultaId,
                citaId: cita.id,
                pacienteId: paciente.id,
                medicoId: medico.id,
                fecha: cita.inicio,
                subjetivo: plantilla.s,
                objetivo: plantilla.o,
                analisis: plantilla.a,
                plan: plantilla.p,
                signos: {
                  presionSistolica: faker.number.int({ min: 105, max: 145 }),
                  presionDiastolica: faker.number.int({ min: 65, max: 92 }),
                  frecuenciaCardiaca: faker.number.int({ min: 62, max: 98 }),
                  temperatura: faker.number.float({ min: 36.1, max: 37.6, fractionDigits: 1 }),
                  pesoKg: faker.number.float({ min: 12, max: 98, fractionDigits: 1 }),
                },
                diagnosticos: [cie.get(codigo)!],
                receta: conReceta
                  ? {
                      id: `rec-${consultaId.slice(4)}`,
                      consultaId,
                      medicamentos: faker.helpers.arrayElements(MEDICAMENTOS_EJEMPLO, {
                        min: 1,
                        max: 2,
                      }),
                      indicaciones: 'Tomar con alimentos.',
                    }
                  : undefined,
              })
              // Escenario de caja: algunas consultas de hoy quedan "por cobrar".
              const porCobrar = d === DIAS_HISTORIA && faker.number.float() < 0.4
              if (!porCobrar)
                pagos.push({
                  id: `pag-${pad(pagos.length + 1, 5)}`,
                  folio: `MC-${pad(folio++, 6)}`,
                  pacienteId: paciente.id,
                  citaId: cita.id,
                  servicioId,
                  medicoId: medico.id,
                  monto: servicioPorId.get(servicioId)!.precio,
                  metodo: faker.helpers.weightedArrayElement<MetodoPago>([
                    { value: 'efectivo', weight: 4 },
                    { value: 'tarjeta', weight: 4 },
                    { value: 'transferencia', weight: 2 },
                  ]),
                  fecha: cita.fin,
                })
            }
          }
          minuto += duracion
        } else {
          minuto += 30
        }
      }
    })
  }

  // Planes de seguimiento: algunos vencidos, otros próximos y algunos cerrados.
  const planes: PlanSeguimiento[] = faker.helpers
    .arrayElements(pacientes, 70)
    .map((p, i): PlanSeguimiento => {
      const cerrado = i % 5 === 0
      const desfase = faker.number.int({ min: -35, max: 30 })
      return {
        id: `seg-${pad(i + 1)}`,
        pacienteId: p.id,
        medicoId: p.medicoId,
        motivo: faker.helpers.arrayElement(MOTIVOS_SEGUIMIENTO),
        proximaFecha: addDays(hoy, desfase).toISOString(),
        estado: cerrado ? 'cerrado' : 'activo',
        creadoEn: subDays(hoy, faker.number.int({ min: 40, max: 120 })).toISOString(),
      }
    })

  // Bandeja: mensajes recientes ya enviados.
  const mensajes: Mensaje[] = citas
    .filter((c) => c.recordatorioEnviado && c.inicio >= subDays(hoy, 3).toISOString())
    .slice(-25)
    .map((c, i) => ({
      id: `msj-${pad(i + 1)}`,
      pacienteId: c.pacienteId,
      canal: faker.helpers.arrayElement(['whatsapp', 'whatsapp', 'sms', 'correo'] as const),
      tipo: 'recordatorio_cita',
      texto: 'Le recordamos su cita en Clínica Integral Demo. Responda 1 para confirmar.',
      enviadoEn: subDays(new Date(c.inicio), 1).toISOString(),
      enviadoPor: 'Sistema (automático)',
    }))

  const usuarios: Usuario[] = [
    { id: 'usr-admin', nombre: 'Sofía Ramírez', correo: 'admin@demo.medicore', rol: 'admin' },
    {
      id: 'usr-medico',
      nombre: medicos[0].nombre,
      correo: 'medico@demo.medicore',
      rol: 'medico',
      medicoId: medicos[0].id,
    },
    {
      id: 'usr-recepcion',
      nombre: 'Carlos Medina',
      correo: 'recepcion@demo.medicore',
      rol: 'recepcion',
    },
  ]

  return {
    version: VERSION_ESQUEMA,
    generadaEn: hoy.toISOString(),
    clinica,
    usuarios,
    medicos,
    pacientes,
    citas,
    consultas,
    planes,
    mensajes,
    campanas: [],
    pagos,
    servicios: SERVICIOS_BASE.map((s) => ({ ...s })),
    bitacora: [],
  }
}
