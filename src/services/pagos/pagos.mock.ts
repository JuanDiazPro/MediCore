import { siguienteFolio } from '@/lib/caja'
import { formatearMoneda } from '@/lib/formato'
import { nuevoId, obtenerBD, persistir } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'
import { registrarBitacora } from '@/services/pacientes/pacientes.mock'
import type { Pago } from '@/types'

import type { PagosService } from './pagos.service'

export const pagosService: PagosService = {
  async listar(filtro = {}) {
    await simularLatencia()
    return structuredClone(
      (await obtenerBD()).pagos
        .filter(
          (p) =>
            (!filtro.desde || p.fecha >= filtro.desde) &&
            (!filtro.hasta || p.fecha < filtro.hasta) &&
            (!filtro.pacienteId || p.pacienteId === filtro.pacienteId) &&
            (!filtro.medicoId || p.medicoId === filtro.medicoId),
        )
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    )
  },
  async registrar(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    if (!(datos.monto > 0)) throw new ErrorServicio('El monto debe ser mayor a cero.')
    if (datos.citaId && bd.pagos.some((p) => p.citaId === datos.citaId)) {
      throw new ErrorServicio('Esta cita ya fue cobrada.')
    }
    const pago: Pago = {
      ...datos,
      monto: Math.round(datos.monto * 100) / 100,
      id: nuevoId('pag'),
      folio: siguienteFolio(bd.pagos),
      fecha: new Date().toISOString(),
    }
    bd.pagos.push(pago)
    registrarBitacora(bd, pago.pacienteId, `Cobro ${pago.folio} por ${formatearMoneda(pago.monto)}`)
    persistir()
    return { ...pago }
  },
}
