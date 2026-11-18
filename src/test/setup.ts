import '@testing-library/jest-dom/vitest'

/**
 * Node 22+ expone un `localStorage` propio (experimental) que no funciona sin configuración
 * y tapa el de jsdom. En pruebas usamos un almacenamiento en memoria equivalente.
 */
class AlmacenMemoria implements Storage {
  private datos = new Map<string, string>()
  get length() {
    return this.datos.size
  }
  clear() {
    this.datos.clear()
  }
  getItem(clave: string) {
    return this.datos.get(clave) ?? null
  }
  key(i: number) {
    return [...this.datos.keys()][i] ?? null
  }
  removeItem(clave: string) {
    this.datos.delete(clave)
  }
  setItem(clave: string, valor: string) {
    this.datos.set(clave, String(valor))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new AlmacenMemoria(),
  configurable: true,
  writable: true,
})
