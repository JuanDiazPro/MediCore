import type { Cita, EstadoCita } from '@/types'

export interface FiltroCitas {
  desde?: string
  hasta?: string
  medicoId?: string
  pacienteId?: string
  estados?: EstadoCita[]
}

export interface NuevaCita {
  pacienteId: string
  medicoId: string
  servicioId: string
  inicio: string
  notas?: string
}

export interface CitasService {
  listar(filtro?: FiltroCitas): Promise<Cita[]>
  obtener(id: string): Promise<Cita>
  /** Valida empalmes y horario del médico. */
  crear(datos: NuevaCita): Promise<Cita>
  /** Reprograma conservando la duración; valida empalmes y horario. */
  mover(id: string, inicio: string, fin?: string): Promise<Cita>
  cambiarEstado(id: string, estado: EstadoCita): Promise<Cita>
  /** Envío SIMULADO del recordatorio de la cita. */
  enviarRecordatorio(id: string): Promise<Cita>
}
