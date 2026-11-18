import { CIE10 } from '@/mocks/catalogos'
import { nuevoId, obtenerBD, persistir } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'
import { registrarBitacora } from '@/services/pacientes/pacientes.mock'
import type { Consulta } from '@/types'

import type { ConsultasService } from './consultas.service'

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export const consultasService: ConsultasService = {
  async listarPorPaciente(pacienteId) {
    await simularLatencia()
    return structuredClone(
      (await obtenerBD()).consultas
        .filter((c) => c.pacienteId === pacienteId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    )
  },
  async obtenerPorCita(citaId) {
    await simularLatencia()
    const c = (await obtenerBD()).consultas.find((x) => x.citaId === citaId)
    return c ? structuredClone(c) : null
  },
  async registrar(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const cita = bd.citas.find((c) => c.id === datos.citaId)
    if (!cita) throw new ErrorServicio('Cita no encontrada.')
    if (cita.estado === 'cancelada') throw new ErrorServicio('La cita está cancelada.')
    if (bd.consultas.some((c) => c.citaId === cita.id)) {
      throw new ErrorServicio('Esta cita ya tiene una consulta registrada.')
    }
    const id = nuevoId('con')
    const consulta: Consulta = {
      id,
      citaId: cita.id,
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fecha: new Date().toISOString(),
      subjetivo: datos.subjetivo,
      objetivo: datos.objetivo,
      analisis: datos.analisis,
      plan: datos.plan,
      signos: datos.signos,
      diagnosticos: datos.diagnosticos,
      receta:
        datos.receta && datos.receta.medicamentos.length > 0
          ? { id: nuevoId('rec'), consultaId: id, ...datos.receta }
          : undefined,
    }
    bd.consultas.push(consulta)
    cita.estado = 'asistio'
    const paciente = bd.pacientes.find((p) => p.id === cita.pacienteId)
    if (paciente) paciente.ultimoContacto = new Date().toISOString()
    registrarBitacora(
      bd,
      cita.pacienteId,
      `Registró consulta (${consulta.diagnosticos.map((d) => d.codigo).join(', ') || 'sin diagnóstico'})`,
    )
    persistir()
    return structuredClone(consulta)
  },
  async buscarCie10(texto) {
    const t = normalizar(texto.trim())
    if (!t) return CIE10.slice(0, 8)
    return CIE10.filter(
      (c) => normalizar(c.codigo).startsWith(t) || normalizar(c.descripcion).includes(t),
    ).slice(0, 8)
  },
}
