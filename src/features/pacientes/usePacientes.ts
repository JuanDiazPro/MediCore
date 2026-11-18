import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CLAVES } from '@/hooks/useCatalogos'
import { pacientesService, type FiltroPacientes, type NuevoPaciente } from '@/services'

export function useListaPacientes(filtro: FiltroPacientes) {
  return useQuery({
    queryKey: [...CLAVES.pacientes, 'lista', filtro],
    queryFn: () => pacientesService.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

export function usePaciente(id: string | undefined) {
  return useQuery({
    queryKey: [...CLAVES.pacientes, 'detalle', id],
    queryFn: () => pacientesService.obtener(id!),
    enabled: !!id,
  })
}

export function useGuardarPaciente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: NuevoPaciente | Partial<NuevoPaciente> }) =>
      id ? pacientesService.actualizar(id, datos) : pacientesService.crear(datos as NuevoPaciente),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLAVES.pacientes })
      qc.invalidateQueries({ queryKey: CLAVES.bitacora })
    },
  })
}
