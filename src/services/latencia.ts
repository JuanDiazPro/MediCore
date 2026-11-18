let rango = { min: 300, max: 800 }

/** Permite apagar la latencia (pruebas) o ajustarla. */
export function configurarLatencia(min: number, max = min) {
  rango = { min, max }
}

/** Retraso artificial para que la API simulada se sienta como una real (300 a 800 ms). */
export function simularLatencia(): Promise<void> {
  const ms = rango.min + Math.random() * (rango.max - rango.min)
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Error de negocio que la UI puede mostrar tal cual. */
export class ErrorServicio extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorServicio'
  }
}
