import { addDays, differenceInYears, parseISO, startOfDay, subMonths } from 'date-fns'

import { fechaHora } from '@/lib/formato'
import { obtenerUsuarioActual } from '@/services/contexto'
import { nuevoId, obtenerBD, persistir } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'
import { registrarBitacora } from '@/services/pacientes/pacientes.mock'
import type { BaseDatos, Mensaje, Paciente } from '@/types'

import type { SegmentoCampana, SeguimientoService } from './seguimiento.service'

const CRONICOS = ['I10', 'E11.9', 'E78.5', 'I25.9', 'E03.9', 'J45.9']

export function pacientesDelSegmento(bd: BaseDatos, segmento: SegmentoCampana, hoy = new Date()) {
  const hace6m = subMonths(hoy, 6).toISOString()
  const cronicos = new Set(
    bd.consultas
      .filter((c) => c.diagnosticos.some((d) => CRONICOS.includes(d.codigo)))
      .map((c) => c.pacienteId),
  )
  const filtros: Record<SegmentoCampana, (p: Paciente) => boolean> = {
    todos: () => true,
    sin_visita_6m: (p) => !p.ultimoContacto || p.ultimoContacto < hace6m,
    cronicos: (p) => cronicos.has(p.id),
    pediatria: (p) => differenceInYears(hoy, parseISO(p.fechaNacimiento)) < 12,
    mujeres: (p) => p.sexo === 'F',
  }
  return bd.pacientes.filter(filtros[segmento])
}

function rangoManana() {
  const inicio = addDays(startOfDay(new Date()), 1)
  return { desde: inicio.toISOString(), hasta: addDays(inicio, 1).toISOString() }
}

export const seguimientoService: SeguimientoService = {
  async listarPlanes(filtro = {}) {
    await simularLatencia()
    return structuredClone(
      (await obtenerBD()).planes.filter(
        (p) =>
          (filtro.incluirCerrados || p.estado === 'activo') &&
          (!filtro.medicoId || p.medicoId === filtro.medicoId) &&
          (!filtro.pacienteId || p.pacienteId === filtro.pacienteId),
      ),
    )
  },
  async crearPlan(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const plan = {
      ...datos,
      id: nuevoId('seg'),
      estado: 'activo' as const,
      creadoEn: new Date().toISOString(),
    }
    bd.planes.push(plan)
    registrarBitacora(bd, datos.pacienteId, `Creó plan de seguimiento: ${datos.motivo}`)
    persistir()
    return { ...plan }
  },
  async actualizarPlan(id, cambios) {
    await simularLatencia()
    const bd = await obtenerBD()
    const plan = bd.planes.find((p) => p.id === id)
    if (!plan) throw new ErrorServicio('Plan no encontrado.')
    Object.assign(plan, cambios)
    registrarBitacora(bd, plan.pacienteId, `Editó plan de seguimiento: ${plan.motivo}`)
    persistir()
    return { ...plan }
  },
  async cerrarPlan(id) {
    await simularLatencia()
    const bd = await obtenerBD()
    const plan = bd.planes.find((p) => p.id === id)
    if (!plan) throw new ErrorServicio('Plan no encontrado.')
    plan.estado = 'cerrado'
    registrarBitacora(bd, plan.pacienteId, `Cerró plan de seguimiento: ${plan.motivo}`)
    persistir()
    return { ...plan }
  },
  async enviarRecordatorio(envio) {
    await simularLatencia()
    const bd = await obtenerBD()
    if (!bd.pacientes.some((p) => p.id === envio.pacienteId)) {
      throw new ErrorServicio('Paciente no encontrado.')
    }
    const mensaje: Mensaje = {
      id: nuevoId('msj'),
      pacienteId: envio.pacienteId,
      canal: envio.canal,
      tipo: envio.tipo,
      texto: envio.texto,
      enviadoEn: new Date().toISOString(),
      enviadoPor: obtenerUsuarioActual(),
    }
    bd.mensajes.push(mensaje)
    if (envio.planId) {
      const plan = bd.planes.find((p) => p.id === envio.planId)
      if (plan) plan.ultimoRecordatorio = mensaje.enviadoEn
    }
    persistir()
    return { ...mensaje }
  },
  async citasDeManana() {
    await simularLatencia()
    const { desde, hasta } = rangoManana()
    return structuredClone(
      (await obtenerBD()).citas.filter(
        (c) =>
          c.inicio >= desde &&
          c.inicio < hasta &&
          (c.estado === 'pendiente' || c.estado === 'confirmada'),
      ),
    )
  },
  async recordarCitasDeManana(canal) {
    await simularLatencia()
    const bd = await obtenerBD()
    const { desde, hasta } = rangoManana()
    const pendientes = bd.citas.filter(
      (c) =>
        c.inicio >= desde &&
        c.inicio < hasta &&
        !c.recordatorioEnviado &&
        (c.estado === 'pendiente' || c.estado === 'confirmada'),
    )
    const ahora = new Date().toISOString()
    for (const c of pendientes) {
      c.recordatorioEnviado = true
      bd.mensajes.push({
        id: nuevoId('msj'),
        pacienteId: c.pacienteId,
        canal,
        tipo: 'recordatorio_cita',
        texto: `Le recordamos su cita en ${bd.clinica.nombre} el ${fechaHora(c.inicio)}. Responda 1 para confirmar.`,
        enviadoEn: ahora,
        enviadoPor: obtenerUsuarioActual(),
      })
    }
    persistir()
    return pendientes.length
  },
  async listarMensajes(pacienteId) {
    await simularLatencia()
    return structuredClone(
      (await obtenerBD()).mensajes
        .filter((m) => !pacienteId || m.pacienteId === pacienteId)
        .sort((a, b) => b.enviadoEn.localeCompare(a.enviadoEn)),
    )
  },
  async contarSegmento(segmento) {
    await simularLatencia()
    return pacientesDelSegmento(await obtenerBD(), segmento).length
  },
  async crearCampana(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const destinatarios = pacientesDelSegmento(bd, datos.segmento)
    const enviadaEn = new Date().toISOString()
    for (const p of destinatarios) {
      bd.mensajes.push({
        id: nuevoId('msj'),
        pacienteId: p.id,
        canal: datos.canal,
        tipo: 'campana',
        texto: datos.mensaje.replaceAll('{nombre}', p.nombre),
        enviadoEn: enviadaEn,
        enviadoPor: obtenerUsuarioActual(),
      })
    }
    const campana = {
      id: nuevoId('cam'),
      nombre: datos.nombre,
      segmento: datos.segmento,
      canal: datos.canal,
      mensaje: datos.mensaje,
      destinatarios: destinatarios.length,
      enviadaEn,
    }
    bd.campanas.push(campana)
    persistir()
    return { ...campana }
  },
  async listarCampanas() {
    await simularLatencia()
    return structuredClone(
      [...(await obtenerBD()).campanas].sort((a, b) => b.enviadaEn.localeCompare(a.enviadaEn)),
    )
  },
}
