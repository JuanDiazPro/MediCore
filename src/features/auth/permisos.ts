import type { Rol } from '@/types'

export type Modulo =
  | 'tablero'
  | 'agenda'
  | 'pacientes'
  | 'seguimiento'
  | 'caja'
  | 'reportes'
  | 'configuracion'
  | 'acerca'

/** Qué módulos ve cada rol (Documento técnico, sección 4). */
export const MODULOS_POR_ROL: Record<Rol, Modulo[]> = {
  admin: [
    'tablero',
    'agenda',
    'pacientes',
    'seguimiento',
    'caja',
    'reportes',
    'configuracion',
    'acerca',
  ],
  medico: ['tablero', 'agenda', 'pacientes', 'seguimiento', 'acerca'],
  recepcion: ['tablero', 'agenda', 'pacientes', 'seguimiento', 'caja', 'acerca'],
}

export function puedeVer(rol: Rol, modulo: Modulo) {
  return MODULOS_POR_ROL[rol].includes(modulo)
}

/** Acciones finas dentro de los módulos. */
export const PERMISOS = {
  editarPacientes: (rol: Rol) => rol === 'admin' || rol === 'recepcion',
  atenderConsulta: (rol: Rol) => rol === 'medico' || rol === 'admin',
  editarExpediente: (rol: Rol) => rol === 'medico' || rol === 'admin',
  cobrar: (rol: Rol) => rol === 'admin' || rol === 'recepcion',
  enviarCampanas: (rol: Rol) => rol === 'admin' || rol === 'recepcion',
}
