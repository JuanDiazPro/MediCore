import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import {
  seguimientoService,
  type EnvioRecordatorio,
  type FiltroPlanes,
  type NuevaCampana,
  type NuevoPlan,
  type SegmentoCampana,
} from '@/services'
import type { CanalMensaje } from '@/types'

export function usePlanes(filtro: FiltroPlanes = {}) {
  return useQuery({
    queryKey: [...CLAVES.planes, filtro],
    queryFn: () => seguimientoService.listarPlanes(filtro),
  })
}

export function useMensajes(pacienteId?: string) {
  return useQuery({
    queryKey: [...CLAVES.mensajes, pacienteId ?? 'todos'],
    queryFn: () => seguimientoService.listarMensajes(pacienteId),
  })
}

export function useCampanas() {
  return useQuery({ queryKey: CLAVES.campanas, queryFn: () => seguimientoService.listarCampanas() })
}

export function useConteoSegmento(segmento: SegmentoCampana) {
  return useQuery({
    queryKey: ['segmento', segmento],
    queryFn: () => seguimientoService.contarSegmento(segmento),
  })
}

export function useCitasManana() {
  return useQuery({
    queryKey: [...CLAVES.citas, 'manana'],
    queryFn: () => seguimientoService.citasDeManana(),
  })
}

function useInvalidar() {
  const qc = useQueryClient()
  return () => {
    for (const k of [
      CLAVES.planes,
      CLAVES.mensajes,
      CLAVES.campanas,
      CLAVES.citas,
      CLAVES.bitacora,
    ]) {
      qc.invalidateQueries({ queryKey: k })
    }
  }
}

export function useGuardarPlan() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: NuevoPlan }) =>
      id ? seguimientoService.actualizarPlan(id, datos) : seguimientoService.crearPlan(datos),
    onSuccess: invalidar,
  })
}

export function useCerrarPlan() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: string) => seguimientoService.cerrarPlan(id),
    onSuccess: invalidar,
  })
}

export function useEnviarRecordatorio() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (e: EnvioRecordatorio) => seguimientoService.enviarRecordatorio(e),
    onSuccess: invalidar,
  })
}

export function useRecordarManana() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (canal: CanalMensaje) => seguimientoService.recordarCitasDeManana(canal),
    onSuccess: invalidar,
  })
}

export function useCrearCampana() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (d: NuevaCampana) => seguimientoService.crearCampana(d),
    onSuccess: invalidar,
  })
}
