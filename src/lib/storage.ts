/**
 * Envoltura mínima sobre localStorage con versión de esquema.
 * Si el navegador bloquea el almacenamiento (modo privado, cuota llena), la app sigue
 * funcionando en memoria: los cambios simplemente no sobreviven a una recarga.
 */
const PREFIJO = 'medicore:'

export interface Almacen<T> {
  leer(): T | null
  guardar(valor: T): boolean
  borrar(): void
}

export function crearAlmacen<T extends { version: number }>(
  clave: string,
  version: number,
): Almacen<T> {
  const llave = PREFIJO + clave
  return {
    leer() {
      try {
        const crudo = localStorage.getItem(llave)
        if (!crudo) return null
        const valor = JSON.parse(crudo) as T
        return valor.version === version ? valor : null
      } catch {
        return null
      }
    },
    guardar(valor) {
      try {
        localStorage.setItem(llave, JSON.stringify(valor))
        return true
      } catch (error) {
        console.warn('[MediCore] No se pudo guardar en localStorage; se usará memoria.', error)
        return false
      }
    },
    borrar() {
      try {
        localStorage.removeItem(llave)
      } catch {
        /* sin almacenamiento: nada que borrar */
      }
    },
  }
}
