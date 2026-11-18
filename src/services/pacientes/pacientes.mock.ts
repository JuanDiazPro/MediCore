import { differenceInCalendarDays, parseISO } from 'date-fns'

import { obtenerUsuarioActual } from '@/services/contexto'
import { nuevoId, obtenerBD, persistir } from '@/services/db'
import { ErrorServicio, simularLatencia } from '@/services/latencia'
import type { BaseDatos, Paciente } from '@/types'

import type { FiltroContacto, PacientesService } from './pacientes.service'

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export function coincideTexto(p: Paciente, texto: string) {
  const t = normalizar(texto.trim())
  if (!t) return true
  const digitos = t.replace(/\D/g, '')
  if (digitos.length >= 3 && p.telefono.replace(/\D/g, '').includes(digitos)) return true
  return normalizar(`${p.nombre} ${p.apellidos}`).includes(t)
}

export function coincideContacto(p: Paciente, filtro: FiltroContacto, hoy = new Date()) {
  if (filtro === 'todos') return true
  if (!p.ultimoContacto) return filtro === 'nunca'
  const dias = differenceInCalendarDays(hoy, parseISO(p.ultimoContacto))
  if (filtro === '30') return dias <= 30
  if (filtro === '90') return dias <= 90
  if (filtro === 'mas90') return dias > 90
  return false
}

export function registrarBitacora(bd: BaseDatos, pacienteId: string, accion: string) {
  bd.bitacora.push({
    id: nuevoId('bit'),
    pacienteId,
    usuario: obtenerUsuarioActual(),
    accion,
    fecha: new Date().toISOString(),
  })
}

export const pacientesService: PacientesService = {
  async listar(filtro = {}) {
    await simularLatencia()
    const bd = await obtenerBD()
    const { texto = '', medicoId, ultimoContacto = 'todos', pagina = 1, porPagina = 12 } = filtro
    const filtrados = bd.pacientes
      .filter(
        (p) =>
          (!medicoId || p.medicoId === medicoId) &&
          coincideTexto(p, texto) &&
          coincideContacto(p, ultimoContacto),
      )
      .sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es'))
    const inicio = (pagina - 1) * porPagina
    return {
      datos: structuredClone(filtrados.slice(inicio, inicio + porPagina)),
      total: filtrados.length,
      pagina,
      porPagina,
    }
  },
  async listarTodos() {
    await simularLatencia()
    return structuredClone((await obtenerBD()).pacientes)
  },
  async obtener(id) {
    await simularLatencia()
    const p = (await obtenerBD()).pacientes.find((x) => x.id === id)
    if (!p) throw new ErrorServicio('Paciente no encontrado.')
    return structuredClone(p)
  },
  async crear(datos) {
    await simularLatencia()
    const bd = await obtenerBD()
    const paciente: Paciente = { ...datos, id: nuevoId('pac'), creadoEn: new Date().toISOString() }
    bd.pacientes.push(paciente)
    registrarBitacora(bd, paciente.id, 'Alta del paciente')
    persistir()
    return structuredClone(paciente)
  },
  async actualizar(id, cambios) {
    await simularLatencia()
    const bd = await obtenerBD()
    const p = bd.pacientes.find((x) => x.id === id)
    if (!p) throw new ErrorServicio('Paciente no encontrado.')
    Object.assign(p, cambios)
    registrarBitacora(
      bd,
      id,
      cambios.historia ? 'Actualizó la historia clínica' : 'Editó datos generales',
    )
    persistir()
    return structuredClone(p)
  },
  async bitacora(pacienteId) {
    await simularLatencia()
    return structuredClone(
      (await obtenerBD()).bitacora
        .filter((b) => b.pacienteId === pacienteId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    )
  },
}
