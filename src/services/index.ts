/**
 * Punto único de acceso a los servicios. Hoy apunta a las implementaciones simuladas
 * (*.mock.ts); para conectar el backend real basta con cambiar estas líneas.
 */
export { authService } from './auth/auth.mock'
export { clinicaService } from './clinica/clinica.mock'
export { pacientesService } from './pacientes/pacientes.mock'
export { citasService } from './citas/citas.mock'
export { consultasService } from './consultas/consultas.mock'
export { seguimientoService } from './seguimiento/seguimiento.mock'
export { pagosService } from './pagos/pagos.mock'
export { ErrorServicio } from './latencia'
export { establecerUsuarioActual } from './contexto'

export type * from './pacientes/pacientes.service'
export type * from './citas/citas.service'
export type * from './consultas/consultas.service'
export type * from './seguimiento/seguimiento.service'
export type * from './pagos/pagos.service'
