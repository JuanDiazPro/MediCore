import { addMinutes } from 'date-fns'

import { buscarEmpalme, dentroDeHorario, puedeCambiarEstado } from '@/lib/agenda'
import { ETIQUETA_ESTADO } from '@/lib/estados'
import { fechaHora, hora } from '@/lib/formato'
import { obtenerUsuarioActual } from '@/services/contexto'
import { nuevoId, obtenerBD, persistir } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'
import { registrarBitacora } from '@/services/pacientes/pacientes.mock'
import type { BaseDatos, Cita } from '@/types'

import type { CitasService } from './citas.service'

function validarHorario(
  bd: BaseDatos,
  cita: Pick<Cita, 'medicoId' | 'inicio' | 'fin'>,
  id?: string,
) {
  const medico = bd.medicos.find((m) => m.id === cita.medicoId)
  if (!medico) throw new ErrorServicio('Médico no encontrado.')
  if (!dentroDeHorario(medico, cita)) {
    throw new ErrorServicio(`El horario queda fuera de la jornada de ${medico.nombre}.`)
  }
  const choque = buscarEmpalme(bd.citas, cita.medicoId, cita, id)
  if (choque) {
    throw new ErrorServicio(
      `Se empalma con otra cita de ${medico.nombre} (${hora(choque.inicio)} a ${hora(choque.fin)}).`,
    )
  }
}

function buscar(bd: BaseDatos, id: string) {
  const cita = bd.citas.find((c) => c.id === id)
  if (!cita) throw new ErrorServicio('Cita no encontrada.')
  return cita
}

export const citasService: CitasService = {
  async listar(filtro = {}) {
    await simularLatencia()
    const bd = await obtenerBD()
    return structuredClone(
      bd.citas
        .filter(
          (c) =>
            (!filtro.desde || c.fin >= filtro.desde) &&
            (!filtro.hasta || c.inicio < filtro.hasta) &&
            (!filtro.medicoId || c.medicoId === filtro.medicoId) &&
            (!filtro.pacienteId || c.pacienteId === filtro.pacienteId) &&
            (!filtro.estados || filtro.estados.includes(c.estado)),
        )
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    )
  },
  async obtener(id) {
    await simularLatencia()
    return structuredClone(buscar(await obtenerBD(), id))
  },
  async crear(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const servicio = bd.servicios.find((s) => s.id === datos.servicioId)
    if (!servicio) throw new ErrorServicio('Servicio no encontrado.')
    if (!bd.pacientes.some((p) => p.id === datos.pacienteId)) {
      throw new ErrorServicio('Paciente no encontrado.')
    }
    const inicio = new Date(datos.inicio)
    const cita: Cita = {
      id: nuevoId('cit'),
      pacienteId: datos.pacienteId,
      medicoId: datos.medicoId,
      servicioId: datos.servicioId,
      inicio: inicio.toISOString(),
      fin: addMinutes(inicio, servicio.duracionMin).toISOString(),
      estado: 'pendiente',
      recordatorioEnviado: false,
      notas: datos.notas,
    }
    validarHorario(bd, cita)
    bd.citas.push(cita)
    registrarBitacora(bd, cita.pacienteId, `Agendó cita para el ${fechaHora(cita.inicio)}`)
    persistir()
    return structuredClone(cita)
  },
  async mover(id, inicio, fin) {
    await simularLatencia()
    const bd = await obtenerBD()
    const cita = buscar(bd, id)
    if (cita.estado === 'asistio' || cita.estado === 'cancelada') {
      throw new ErrorServicio(
        `No se puede reprogramar una cita ${ETIQUETA_ESTADO[cita.estado].toLowerCase()}.`,
      )
    }
    const duracion = new Date(cita.fin).getTime() - new Date(cita.inicio).getTime()
    const nuevoInicio = new Date(inicio)
    const nuevoFin = fin ? new Date(fin) : new Date(nuevoInicio.getTime() + duracion)
    const propuesta = { ...cita, inicio: nuevoInicio.toISOString(), fin: nuevoFin.toISOString() }
    validarHorario(bd, propuesta, id)
    Object.assign(cita, {
      inicio: propuesta.inicio,
      fin: propuesta.fin,
      estado: 'pendiente',
      recordatorioEnviado: false,
    })
    registrarBitacora(bd, cita.pacienteId, `Reprogramó cita al ${fechaHora(cita.inicio)}`)
    persistir()
    return structuredClone(cita)
  },
  async cambiarEstado(id, estado) {
    await simularLatencia()
    const bd = await obtenerBD()
    const cita = buscar(bd, id)
    if (!puedeCambiarEstado(cita.estado, estado)) {
      throw new ErrorServicio(
        `No se puede pasar de "${ETIQUETA_ESTADO[cita.estado]}" a "${ETIQUETA_ESTADO[estado]}".`,
      )
    }
    if (cita.estado === 'cancelada' && estado !== 'cancelada') {
      validarHorario(bd, cita, id)
    }
    cita.estado = estado
    if (estado === 'asistio') {
      const p = bd.pacientes.find((x) => x.id === cita.pacienteId)
      if (p && (!p.ultimoContacto || p.ultimoContacto < cita.fin)) p.ultimoContacto = cita.fin
    }
    registrarBitacora(
      bd,
      cita.pacienteId,
      `Cita del ${fechaHora(cita.inicio)} marcada como "${ETIQUETA_ESTADO[estado]}"`,
    )
    persistir()
    return structuredClone(cita)
  },
  async enviarRecordatorio(id) {
    await simularLatencia()
    const bd = await obtenerBD()
    const cita = buscar(bd, id)
    cita.recordatorioEnviado = true
    bd.mensajes.push({
      id: nuevoId('msj'),
      pacienteId: cita.pacienteId,
      canal: 'whatsapp',
      tipo: 'recordatorio_cita',
      texto: `Le recordamos su cita en ${bd.clinica.nombre} el ${fechaHora(cita.inicio)}. Responda 1 para confirmar.`,
      enviadoEn: new Date().toISOString(),
      enviadoPor: obtenerUsuarioActual(),
    })
    persistir()
    return structuredClone(cita)
  },
}
