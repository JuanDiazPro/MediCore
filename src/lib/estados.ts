import type { CanalMensaje, EstadoCita, MetodoPago, Rol } from '@/types'

export const ETIQUETA_ESTADO: Record<EstadoCita, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  asistio: 'Asistió',
  no_asistio: 'No asistió',
  cancelada: 'Cancelada',
}

/** Colores de estado (los mismos tokens del sistema visual). */
export const COLOR_ESTADO: Record<EstadoCita, string> = {
  pendiente: '#F59E0B',
  confirmada: '#22C55E',
  asistio: '#16A34A',
  no_asistio: '#EF4444',
  cancelada: '#94A3B8',
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  admin: 'Administración',
  medico: 'Médico',
  recepcion: 'Recepción',
}

export const ETIQUETA_METODO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

export const ETIQUETA_CANAL: Record<CanalMensaje, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  correo: 'Correo',
}
