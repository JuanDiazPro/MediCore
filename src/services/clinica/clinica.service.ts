import type { Clinica, Medico, Servicio } from '@/types'

export interface ClinicaService {
  obtener(): Promise<Clinica>
  actualizar(cambios: Partial<Omit<Clinica, 'id'>>): Promise<Clinica>
  listarMedicos(): Promise<Medico[]>
  actualizarMedico(id: string, cambios: Partial<Omit<Medico, 'id'>>): Promise<Medico>
  listarServicios(): Promise<Servicio[]>
  crearServicio(datos: Omit<Servicio, 'id'>): Promise<Servicio>
  actualizarServicio(id: string, cambios: Partial<Omit<Servicio, 'id'>>): Promise<Servicio>
  /** Borra todos los cambios del demo y regenera los datos semilla. */
  reiniciarDemo(): Promise<void>
}
