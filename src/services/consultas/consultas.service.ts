import type { Cie10, Consulta, Diagnostico, Medicamento, SignosVitales } from '@/types'

export interface NuevaConsulta {
  citaId: string
  subjetivo: string
  objetivo: string
  analisis: string
  plan: string
  signos: SignosVitales
  diagnosticos: Diagnostico[]
  receta?: { medicamentos: Medicamento[]; indicaciones: string }
}

export interface ConsultasService {
  listarPorPaciente(pacienteId: string): Promise<Consulta[]>
  obtenerPorCita(citaId: string): Promise<Consulta | null>
  /** Cierra la consulta: guarda la nota y la cita pasa a "asistió". */
  registrar(datos: NuevaConsulta): Promise<Consulta>
  buscarCie10(texto: string): Promise<Cie10[]>
}
