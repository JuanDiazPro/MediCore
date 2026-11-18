import type { EntradaBitacora, Paciente } from '@/types'

export type FiltroContacto = 'todos' | '30' | '90' | 'mas90' | 'nunca'

export interface FiltroPacientes {
  texto?: string
  medicoId?: string
  ultimoContacto?: FiltroContacto
  pagina?: number
  porPagina?: number
}

export interface Pagina<T> {
  datos: T[]
  total: number
  pagina: number
  porPagina: number
}

export type NuevoPaciente = Omit<Paciente, 'id' | 'creadoEn' | 'ultimoContacto'>

export interface PacientesService {
  listar(filtro?: FiltroPacientes): Promise<Pagina<Paciente>>
  /** Lista ligera para selectores (id + nombre). */
  listarTodos(): Promise<Paciente[]>
  obtener(id: string): Promise<Paciente>
  crear(datos: NuevoPaciente): Promise<Paciente>
  actualizar(id: string, cambios: Partial<NuevoPaciente>): Promise<Paciente>
  bitacora(pacienteId: string): Promise<EntradaBitacora[]>
}
