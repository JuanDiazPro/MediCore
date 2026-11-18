import { calcularCorte, siguienteFolio } from '@/lib/caja'
import type { MetodoPago, Pago } from '@/types'

const pago = (monto: number, metodo: MetodoPago, folio = 'MC-000001'): Pago => ({
  id: folio,
  folio,
  pacienteId: 'p',
  servicioId: 's',
  medicoId: 'm',
  monto,
  metodo,
  fecha: '2026-11-17T10:00:00.000Z',
})

describe('corte de caja', () => {
  it('suma por método y en total', () => {
    const corte = calcularCorte([
      pago(500, 'efectivo'),
      pago(850, 'tarjeta'),
      pago(450, 'efectivo'),
      pago(1200, 'transferencia'),
    ])
    expect(corte.total).toBe(3000)
    expect(corte.numeroPagos).toBe(4)
    expect(corte.porMetodo.efectivo).toEqual({ total: 950, cantidad: 2 })
    expect(corte.porMetodo.tarjeta).toEqual({ total: 850, cantidad: 1 })
    expect(corte.porMetodo.transferencia).toEqual({ total: 1200, cantidad: 1 })
  })

  it('cuadra con centavos sin errores de punto flotante', () => {
    const corte = calcularCorte([
      pago(0.1, 'efectivo'),
      pago(0.2, 'efectivo'),
      pago(99.99, 'tarjeta'),
    ])
    expect(corte.porMetodo.efectivo.total).toBe(0.3)
    expect(corte.total).toBe(100.29)
    const suma = Object.values(corte.porMetodo).reduce((s, m) => s + m.total * 100, 0) / 100
    expect(suma).toBe(corte.total)
  })

  it('un día sin cobros da cero', () => {
    expect(calcularCorte([]).total).toBe(0)
  })

  it('genera el siguiente folio consecutivo', () => {
    expect(siguienteFolio([])).toBe('MC-000001')
    expect(siguienteFolio([{ folio: 'MC-000041' }, { folio: 'MC-000007' }])).toBe('MC-000042')
  })
})
