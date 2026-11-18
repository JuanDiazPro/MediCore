import type { MetodoPago, Pago } from '@/types'

export interface FiltroPagos {
  desde?: string
  hasta?: string
  pacienteId?: string
  medicoId?: string
}

export interface NuevoPago {
  pacienteId: string
  servicioId: string
  medicoId: string
  citaId?: string
  monto: number
  metodo: MetodoPago
}

export interface PagosService {
  listar(filtro?: FiltroPagos): Promise<Pago[]>
  /** Registra el cobro y le asigna un folio consecutivo. */
  registrar(datos: NuevoPago): Promise<Pago>
}
