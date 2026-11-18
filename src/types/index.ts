/**
 * Modelo de datos de MediCore (ver "Documento técnico del prototipo", sección 8).
 * Fechas en formato ISO 8601 (string) para que se guarden tal cual en localStorage.
 */

export type Rol = 'admin' | 'medico' | 'recepcion'

/** Día de la semana: 0 = domingo … 6 = sábado. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface HorarioDia {
  dia: DiaSemana
  /** "HH:mm" */
  inicio: string
  fin: string
}

export interface Clinica {
  id: string
  nombre: string
  direccion: string
  telefono: string
  correo: string
  horario: HorarioDia[]
  /** Fecha (ISO) desde la que la clínica activó los recordatorios automáticos. */
  recordatoriosDesde: string
}

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  medicoId?: string
}

export interface Medico {
  id: string
  nombre: string
  especialidad: string
  cedula: string
  color: string
  horario: HorarioDia[]
  activo: boolean
}

export type Sexo = 'F' | 'M'
export type TipoSangre = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'

export interface HistoriaClinica {
  heredofamiliares: string
  personalesPatologicos: string
  personalesNoPatologicos: string
}

export interface Paciente {
  id: string
  nombre: string
  apellidos: string
  fechaNacimiento: string
  sexo: Sexo
  telefono: string
  correo: string
  tipoSangre: TipoSangre
  alergias: string[]
  medicoId: string
  historia: HistoriaClinica
  creadoEn: string
  /** Fecha de la última cita a la que asistió o del último contacto. */
  ultimoContacto?: string
}

export type EstadoCita = 'pendiente' | 'confirmada' | 'asistio' | 'no_asistio' | 'cancelada'

export interface Cita {
  id: string
  pacienteId: string
  medicoId: string
  servicioId: string
  inicio: string
  fin: string
  estado: EstadoCita
  recordatorioEnviado: boolean
  notas?: string
}

export interface SignosVitales {
  presionSistolica?: number
  presionDiastolica?: number
  frecuenciaCardiaca?: number
  temperatura?: number
  pesoKg?: number
  tallaCm?: number
}

export interface Diagnostico {
  codigo: string
  descripcion: string
}

export interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
}

export interface Receta {
  id: string
  consultaId: string
  medicamentos: Medicamento[]
  indicaciones: string
}

export interface Consulta {
  id: string
  citaId: string
  pacienteId: string
  medicoId: string
  fecha: string
  subjetivo: string
  objetivo: string
  analisis: string
  plan: string
  signos: SignosVitales
  diagnosticos: Diagnostico[]
  receta?: Receta
}

export type EstadoSeguimiento = 'activo' | 'cerrado'

export interface PlanSeguimiento {
  id: string
  pacienteId: string
  medicoId: string
  motivo: string
  proximaFecha: string
  estado: EstadoSeguimiento
  creadoEn: string
  ultimoRecordatorio?: string
}

export type CanalMensaje = 'whatsapp' | 'sms' | 'correo'

export interface Mensaje {
  id: string
  pacienteId: string
  canal: CanalMensaje
  tipo: 'recordatorio_cita' | 'seguimiento' | 'campana'
  texto: string
  enviadoEn: string
  enviadoPor: string
}

export interface Campana {
  id: string
  nombre: string
  segmento: string
  canal: CanalMensaje
  mensaje: string
  destinatarios: number
  enviadaEn: string
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export interface Pago {
  id: string
  folio: string
  pacienteId: string
  citaId?: string
  servicioId: string
  medicoId: string
  monto: number
  metodo: MetodoPago
  fecha: string
}

export interface Servicio {
  id: string
  nombre: string
  duracionMin: number
  precio: number
  activo: boolean
}

export interface EntradaBitacora {
  id: string
  pacienteId: string
  usuario: string
  accion: string
  fecha: string
}

export interface Cie10 {
  codigo: string
  descripcion: string
}

/** "Base de datos" completa que vive en localStorage. */
export interface BaseDatos {
  version: number
  generadaEn: string
  clinica: Clinica
  usuarios: Usuario[]
  medicos: Medico[]
  pacientes: Paciente[]
  citas: Cita[]
  consultas: Consulta[]
  planes: PlanSeguimiento[]
  mensajes: Mensaje[]
  campanas: Campana[]
  pagos: Pago[]
  servicios: Servicio[]
  bitacora: EntradaBitacora[]
}
