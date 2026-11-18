import { nuevoId, obtenerBD, persistir, reiniciarBD } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'

import type { ClinicaService } from './clinica.service'

export const clinicaService: ClinicaService = {
  async obtener() {
    await simularLatencia()
    return structuredClone((await obtenerBD()).clinica)
  },
  async actualizar(cambios) {
    await simularLatencia()
    const bd = await obtenerBD()
    bd.clinica = { ...bd.clinica, ...cambios }
    persistir()
    return structuredClone(bd.clinica)
  },
  async listarMedicos() {
    await simularLatencia()
    return structuredClone((await obtenerBD()).medicos)
  },
  async actualizarMedico(id, cambios) {
    await simularLatencia()
    const bd = await obtenerBD()
    const medico = bd.medicos.find((m) => m.id === id)
    if (!medico) throw new ErrorServicio('Médico no encontrado.')
    Object.assign(medico, cambios)
    persistir()
    return structuredClone(medico)
  },
  async listarServicios() {
    await simularLatencia()
    return structuredClone((await obtenerBD()).servicios)
  },
  async crearServicio(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const servicio = { ...datos, id: nuevoId('srv') }
    bd.servicios.push(servicio)
    persistir()
    return { ...servicio }
  },
  async actualizarServicio(id, cambios) {
    await simularLatencia()
    const bd = await obtenerBD()
    const servicio = bd.servicios.find((s) => s.id === id)
    if (!servicio) throw new ErrorServicio('Servicio no encontrado.')
    Object.assign(servicio, cambios)
    persistir()
    return { ...servicio }
  },
  async reiniciarDemo() {
    await simularLatencia()
    await reiniciarBD()
  },
}
