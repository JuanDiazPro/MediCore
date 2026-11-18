import type { MetodoPago, Pago } from '@/types'

export interface CorteCaja {
  total: number
  numeroPagos: number
  porMetodo: Record<MetodoPago, { total: number; cantidad: number }>
}

/** Corte de caja: totales por método de pago. Redondea a centavos para evitar errores de coma flotante. */
export function calcularCorte(pagos: Pago[]): CorteCaja {
  const porMetodo: CorteCaja['porMetodo'] = {
    efectivo: { total: 0, cantidad: 0 },
    tarjeta: { total: 0, cantidad: 0 },
    transferencia: { total: 0, cantidad: 0 },
  }
  let centavos = 0
  for (const p of pagos) {
    const c = Math.round(p.monto * 100)
    centavos += c
    porMetodo[p.metodo].total = (Math.round(porMetodo[p.metodo].total * 100) + c) / 100
    porMetodo[p.metodo].cantidad++
  }
  return { total: centavos / 100, numeroPagos: pagos.length, porMetodo }
}

export function siguienteFolio(pagos: Pick<Pago, 'folio'>[]) {
  const max = pagos.reduce((m, p) => Math.max(m, Number(p.folio.replace(/\D/g, '')) || 0), 0)
  return `MC-${String(max + 1).padStart(6, '0')}`
}
