import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import { citasService, type FiltroCitas, type NuevaCita } from '@/services'
import type { EstadoCita } from '@/types'

export function useCitas(filtro: FiltroCitas, habilitado = true) {
  return useQuery({
    queryKey: [...CLAVES.citas, filtro],
    queryFn: () => citasService.listar(filtro),
    enabled: habilitado,
  })
}

export function useCita(id: string | undefined) {
  return useQuery({
    queryKey: [...CLAVES.citas, 'detalle', id],
    queryFn: () => citasService.obtener(id!),
    enabled: !!id,
  })
}

/** Invalida todo lo que depende de las citas. */
function useInvalidarCitas() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: CLAVES.citas })
    qc.invalidateQueries({ queryKey: CLAVES.pacientes })
    qc.invalidateQueries({ queryKey: CLAVES.bitacora })
    qc.invalidateQueries({ queryKey: CLAVES.mensajes })
  }
}

export function useCrearCita() {
  const invalidar = useInvalidarCitas()
  return useMutation({ mutationFn: (d: NuevaCita) => citasService.crear(d), onSuccess: invalidar })
}

export function useMoverCita() {
  const invalidar = useInvalidarCitas()
  return useMutation({
    mutationFn: ({ id, inicio, fin }: { id: string; inicio: string; fin?: string }) =>
      citasService.mover(id, inicio, fin),
    onSettled: invalidar,
  })
}

export function useCambiarEstadoCita() {
  const invalidar = useInvalidarCitas()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCita }) =>
      citasService.cambiarEstado(id, estado),
    onSuccess: invalidar,
  })
}

export function useRecordatorioCita() {
  const invalidar = useInvalidarCitas()
  return useMutation({
    mutationFn: (id: string) => citasService.enviarRecordatorio(id),
    onSuccess: invalidar,
  })
}
