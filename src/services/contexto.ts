/** Quién está usando el demo; lo usan los servicios para la bitácora de cambios. */
let usuarioActual = 'Sistema'

export function establecerUsuarioActual(nombre: string) {
  usuarioActual = nombre
}

export function obtenerUsuarioActual() {
  return usuarioActual
}
