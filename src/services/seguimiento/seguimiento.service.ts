import type { Campana, CanalMensaje, Cita, Mensaje, PlanSeguimiento } from '@/types'

export interface FiltroPlanes {
  medicoId?: string
  pacienteId?: string
  incluirCerrados?: boolean
}

export type NuevoPlan = Pick<PlanSeguimiento, 'pacienteId' | 'medicoId' | 'motivo' | 'proximaFecha'>

export interface EnvioRecordatorio {
  pacienteId: string
  canal: CanalMensaje
  texto: string
  tipo: Mensaje['tipo']
  planId?: string
}

export type SegmentoCampana = 'todos' | 'sin_visita_6m' | 'cronicos' | 'pediatria' | 'mujeres'

export interface NuevaCampana {
  nombre: string
  segmento: SegmentoCampana
  canal: CanalMensaje
  mensaje: string
}

export interface SeguimientoService {
  listarPlanes(filtro?: FiltroPlanes): Promise<PlanSeguimiento[]>
  crearPlan(datos: NuevoPlan): Promise<PlanSeguimiento>
  actualizarPlan(id: string, cambios: Partial<NuevoPlan>): Promise<PlanSeguimiento>
  cerrarPlan(id: string): Promise<PlanSeguimiento>
  /** Envío SIMULADO: solo se registra en la bandeja. */
  enviarRecordatorio(envio: EnvioRecordatorio): Promise<Mensaje>
  /** Citas de mañana que aún no tienen recordatorio. */
  citasDeManana(): Promise<Cita[]>
  /** Recordatorio masivo simulado a todas las citas de mañana. Devuelve cuántos se enviaron. */
  recordarCitasDeManana(canal: CanalMensaje): Promise<number>
  listarMensajes(pacienteId?: string): Promise<Mensaje[]>
  contarSegmento(segmento: SegmentoCampana): Promise<number>
  crearCampana(datos: NuevaCampana): Promise<Campana>
  listarCampanas(): Promise<Campana[]>
}
