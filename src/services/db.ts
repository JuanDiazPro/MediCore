import { crearAlmacen } from '@/lib/storage'
import { ajustarAHoy } from '@/mocks/actualizarFechas'
import { VERSION_ESQUEMA } from '@/mocks/version'
import type { BaseDatos } from '@/types'

/**
 * "Base de datos" simulada. SOLO la usan las implementaciones *.mock.ts de los servicios;
 * las pantallas nunca la importan directamente.
 */
const almacen = crearAlmacen<BaseDatos>('db', VERSION_ESQUEMA)
let bd: BaseDatos | null = null
let cargando: Promise<BaseDatos> | null = null

async function generar(): Promise<BaseDatos> {
  // Carga diferida: Faker solo se descarga la primera vez que se generan datos.
  const { generarBaseDatos } = await import('@/mocks/generador')
  const nueva = generarBaseDatos()
  almacen.guardar(nueva)
  return nueva
}

export async function obtenerBD(): Promise<BaseDatos> {
  if (bd) return bd
  if (!cargando) {
    cargando = (async () => {
      const guardada = almacen.leer()
      const vigente = guardada && ajustarAHoy(guardada)
      if (vigente && vigente !== guardada) almacen.guardar(vigente)
      bd = vigente ?? (await generar())
      cargando = null
      return bd
    })()
  }
  return cargando
}

/** Guarda los cambios hechos sobre la base en memoria. */
export function persistir() {
  if (bd) almacen.guardar(bd)
}

/** Borra todo y regenera los datos semilla. */
export async function reiniciarBD(): Promise<BaseDatos> {
  almacen.borrar()
  bd = null
  bd = await generar()
  return bd
}

/** Solo para pruebas: inyecta una base ya generada. */
export function establecerBD(nueva: BaseDatos) {
  bd = nueva
}

export function nuevoId(prefijo: string) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
